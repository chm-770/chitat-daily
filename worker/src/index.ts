/**
 * Reminder sender of חת״ת יומי (Cloudflare Worker, runs every minute).
 *
 * Each device that turned reminders on has a document reminders/{uid} in Firestore
 * (see src/services/reminders.ts in the app). `nextFireAt` holds the time of its next reminder,
 * so every run reads only the devices that are due, sends their notifications through Firebase
 * Cloud Messaging and stores the next time.
 */
import { computeReminders, type ReminderDoc } from './schedule';

interface Env {
  FIREBASE_SERVICE_ACCOUNT: string;
  FIREBASE_PROJECT_ID: string;
  APP_URL: string;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
/** Reminders missed by more than this (e.g. after an outage) are not sent late */
const MAX_LATE = 15 * MINUTE;

// ---------- Google OAuth with the service account ----------

let cachedToken: { token: string; exp: number } | null = null;

function b64url(data: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function accessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;
  if (!env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('Missing secret FIREBASE_SERVICE_ACCOUNT (Settings > Variables and Secrets, type Secret)');
  }
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const pem = String(sa.private_key).replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  )}`;
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${unsigned}.${b64url(sig)}`,
  });
  if (!res.ok) throw new Error(`OAuth failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, exp: now + json.expires_in };
  return json.access_token;
}

// ---------- Firestore REST ----------

function fromValue(v: any): any {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return Date.parse(v.timestampValue);
  if ('nullValue' in v) return null;
  if ('mapValue' in v) return fromFields(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromValue);
  return null;
}

function fromFields(fields: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) out[k] = fromValue(v);
  return out;
}

interface DueDoc {
  name: string;
  updateTime: string;
  data: ReminderDoc & { token: string; lastCheckedAt?: number };
}

async function dueDocs(env: Env, token: string, now: number): Promise<DueDoc[]> {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'reminders' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'nextFireAt' },
              op: 'LESS_THAN_OR_EQUAL',
              value: { timestampValue: new Date(now).toISOString() },
            },
          },
          limit: 500,
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Firestore query failed: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as any[];
  return rows
    .filter((r) => r.document)
    .map((r) => ({ name: r.document.name, updateTime: r.document.updateTime, data: fromFields(r.document.fields || {}) as any }));
}

async function updateSchedule(token: string, doc: DueDoc, now: number, next: number) {
  const params = new URLSearchParams();
  params.append('updateMask.fieldPaths', 'lastCheckedAt');
  params.append('updateMask.fieldPaths', 'nextFireAt');
  // If the device saved new settings meanwhile, keep them (and their nextFireAt) as they are
  params.append('currentDocument.updateTime', doc.updateTime);
  await fetch(`https://firestore.googleapis.com/v1/${doc.name}?${params}`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      fields: {
        lastCheckedAt: { timestampValue: new Date(now).toISOString() },
        nextFireAt: { timestampValue: new Date(next).toISOString() },
      },
    }),
  });
}

async function deleteDoc(token: string, doc: DueDoc) {
  await fetch(`https://firestore.googleapis.com/v1/${doc.name}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
  });
}

// ---------- Firebase Cloud Messaging ----------

/** Returns false when the device token is no longer valid (app removed or permission revoked). */
async function send(env: Env, token: string, deviceToken: string, r: { title: string; body: string; url: string; tag: string }) {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: {
        token: deviceToken,
        data: { title: r.title, body: r.body, url: r.url, tag: r.tag },
        webpush: { headers: { Urgency: 'high', TTL: '3600' } },
      },
    }),
  });
  if (res.ok) return true;
  const text = await res.text();
  if (res.status === 404 || text.includes('UNREGISTERED') || (res.status === 400 && /registration token/i.test(text))) {
    return false;
  }
  console.warn('FCM send failed', res.status, text);
  return true;
}

// ---------- Run ----------

async function processDoc(env: Env, token: string, doc: DueDoc, now: number) {
  const data = doc.data;
  if (!data.token || !data.city) {
    await deleteDoc(token, doc);
    return;
  }
  // A device that just saved its settings has no lastCheckedAt: nothing is sent for the past
  const since = Math.max(data.lastCheckedAt ?? now, now - MAX_LATE);
  const reminders = computeReminders(data, now - HOUR, now + 3 * 24 * HOUR, env.APP_URL);
  for (const r of reminders.filter((x) => x.at > since && x.at <= now)) {
    if (!(await send(env, token, data.token, r))) {
      await deleteDoc(token, doc);
      return;
    }
  }
  const next = reminders.find((x) => x.at > now)?.at ?? now + 24 * HOUR;
  await updateSchedule(token, doc, now, next);
}

async function run(env: Env) {
  const now = Date.now();
  const token = await accessToken(env);
  const docs = await dueDocs(env, token, now);
  for (let i = 0; i < docs.length; i += 10) {
    await Promise.all(
      docs.slice(i, i + 10).map((d) => processDoc(env, token, d, now).catch((e) => console.warn('reminder failed', d.name, e)))
    );
  }
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(run(env));
  },
  async fetch() {
    return new Response('חת״ת יומי – reminders', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
