/**
 * Dedications (הקדשות). The manager adds them in the admin page (/admin); everyone sees the
 * dedication of the displayed day. Users can send a dedication request, which is emailed to the
 * manager (Web3Forms) and saved in Firestore so it appears in the admin page.
 *
 * Firestore (see firestore.rules):
 *   dedications/{id}         { type, text, startDate, endDate, donor?, createdAt }   read: everyone
 *   dedicationRequests/{id}  { type, duration, text, startDate, donor, amount, email, lang, createdAt }
 *                            create: everyone (size-checked); read/delete: manager only
 *
 * The public parts use the Firestore REST API, so Firebase is not loaded for every user.
 */
import { pick, type Lang } from '../i18n';

const PROJECT = 'chitat-daily';
const API_KEY = 'AIzaSyCmReTgx27sbugQjIB0k-Vivxxv3Si6APM';
const DOCS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const CACHE_KEY = 'chitas_dedications';
const WEB3FORMS_KEY = '0715539a-1233-417d-9d9b-d5da7ce5e5ad';

export const ADMIN_EMAIL = 'chitatdaily@gmail.com';

export type DedicationType = 'ilui' | 'refua' | 'hatzlacha' | 'zivug' | 'zchut' | 'parnasa' | 'other';
export const DEDICATION_TYPES: DedicationType[] = ['ilui', 'refua', 'hatzlacha', 'zivug', 'zchut', 'parnasa', 'other'];

export type DedicationDuration = 'day' | 'week' | 'month';
export const DURATIONS: { id: DedicationDuration; price: number; days: number }[] = [
  { id: 'day', price: 25, days: 1 },
  { id: 'week', price: 150, days: 7 },
  { id: 'month', price: 320, days: 30 },
];

export interface Dedication {
  id: string;
  type: DedicationType;
  /** Names / text of the dedication (in the language it was written) */
  text: string;
  /** YYYY-MM-DD, inclusive */
  startDate: string;
  endDate: string;
  donor?: string;
}

export interface DedicationRequest {
  type: DedicationType;
  duration: DedicationDuration;
  text: string;
  startDate: string;
  donor: string;
  amount: number;
  email: string;
  lang: Lang;
}

/** Words before the names, e.g. "לעילוי נשמת". 'other' has none (the text says it all). */
export const TYPE_LABELS = {
  he: { ilui: 'לעילוי נשמת', refua: 'לרפואה שלמה של', hatzlacha: 'להצלחת', zivug: 'לזיווג הגון של', zchut: 'לזכות', parnasa: 'לפרנסה טובה של', other: 'אחר' },
  en: { ilui: "L'ilui nishmat", refua: 'For the complete recovery of', hatzlacha: 'For the success of', zivug: 'For a good match for', zchut: 'In the merit of', parnasa: 'For a good livelihood for', other: 'Other' },
  fr: { ilui: "Léilouy nichmat", refua: 'Pour la guérison complète de', hatzlacha: 'Pour la réussite de', zivug: 'Pour un bon chidoukh pour', zchut: 'Au mérite de', parnasa: 'Pour une bonne parnassa pour', other: 'Autre' },
};

/** Short names of the types (for the form). */
export const TYPE_NAMES = {
  he: { ilui: 'לעילוי נשמת', refua: 'רפואה שלמה', hatzlacha: 'הצלחה', zivug: 'זיווג הגון', zchut: 'לזכות', parnasa: 'פרנסה', other: 'אחר' },
  en: { ilui: "L'ilui nishmat", refua: 'Complete recovery', hatzlacha: 'Success', zivug: 'A good match', zchut: 'In the merit of', parnasa: 'Livelihood', other: 'Other' },
  fr: { ilui: 'Léilouy nichmat', refua: 'Guérison complète', hatzlacha: 'Réussite', zivug: 'Chidoukh', zchut: 'Au mérite de', parnasa: 'Parnassa', other: 'Autre' },
};

export function dedicationLine(d: Pick<Dedication, 'type' | 'text'>, lang: Lang): string {
  if (d.type === 'other') return d.text;
  return `${TYPE_LABELS[lang][d.type]} ${d.text}`;
}

/** Adds days to a YYYY-MM-DD date. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

// ---------- Firestore REST helpers ----------

function val(v: any): any {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  return null;
}

function readCache(): Dedication[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
}

let inflight: Promise<Dedication[]> | null = null;

/** Dedications that have not ended yet (from the server, or from the last copy when offline). */
export function loadDedications(): Promise<Dedication[]> {
  if (inflight) return inflight;
  const today = new Date();
  const from = addDays(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    -60
  );
  inflight = fetch(`${DOCS}:runQuery?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'dedications' }],
        where: { fieldFilter: { field: { fieldPath: 'endDate' }, op: 'GREATER_THAN_OR_EQUAL', value: { stringValue: from } } },
        limit: 300,
      },
    }),
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rows: any[]) => {
      const list: Dedication[] = rows
        .filter((r) => r.document)
        .map((r) => {
          const f = r.document.fields || {};
          return {
            id: r.document.name.split('/').pop(),
            type: val(f.type) || 'other',
            text: val(f.text) || '',
            startDate: val(f.startDate) || '',
            endDate: val(f.endDate) || '',
            donor: val(f.donor) || undefined,
          };
        });
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(list));
      } catch {
        // ignore
      }
      return list;
    })
    .catch(() => readCache())
    .finally(() => {
      setTimeout(() => (inflight = null), 60 * 1000);
    });
  return inflight;
}

export function dedicationsForDay(list: Dedication[], dateKey: string): Dedication[] {
  return list.filter((d) => d.startDate <= dateKey && d.endDate >= dateKey);
}

// ---------- Requests ----------

const MESSAGES = {
  he: { failed: 'השליחה נכשלה. בדוק את החיבור לאינטרנט ונסה שוב.', subject: 'בקשת הקדשה חדשה – חת״ת יומי' },
  en: { failed: 'Sending failed. Check your internet connection and try again.', subject: 'New dedication request – Daily Chitas' },
  fr: { failed: "L'envoi a échoué. Vérifiez votre connexion internet et réessayez.", subject: "Nouvelle demande de dédicace – 'Hitat quotidien" },
};

/** Sends a dedication request (email to the manager + saved for the admin page). Returns an error message or null. */
export async function sendDedicationRequest(req: DedicationRequest): Promise<string | null> {
  const he = TYPE_NAMES.he[req.type];
  const duration = { day: 'יום אחד', week: 'שבוע', month: 'חודש' }[req.duration];
  const endDate = addDays(req.startDate, (DURATIONS.find((d) => d.id === req.duration)?.days || 1) - 1);
  try {
    const [mail] = await Promise.all([
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: pick(MESSAGES).subject,
          from_name: req.donor || 'חת״ת יומי',
          email: req.email,
          replyto: req.email,
          'סוג ההקדשה': he,
          'נוסח ההקדשה': req.text,
          'משך': duration,
          'מתאריך': req.startDate,
          'עד תאריך': endDate,
          'התורם': req.donor || '-',
          'סכום (אירו)': req.amount,
          'שפה': req.lang,
        }),
      }).then((r) => r.json()),
      // Saved for the admin page; a failure here does not block the email
      fetch(`${DOCS}/dedicationRequests?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            type: { stringValue: req.type },
            duration: { stringValue: req.duration },
            text: { stringValue: req.text },
            startDate: { stringValue: req.startDate },
            donor: { stringValue: req.donor },
            amount: { integerValue: String(Math.round(req.amount)) },
            email: { stringValue: req.email },
            lang: { stringValue: req.lang },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        }),
      }).catch(() => null),
    ]);
    if (!mail?.success) throw new Error(mail?.message);
    return null;
  } catch (e) {
    console.warn('Dedication request failed:', e);
    return pick(MESSAGES).failed;
  }
}
