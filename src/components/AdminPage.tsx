/**
 * Admin page (/admin) for the manager: add, edit and delete dedications, and see the dedication
 * requests sent by users. Only the account ADMIN_EMAIL can write (enforced by firestore.rules).
 */
import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { LogOut, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  ADMIN_EMAIL,
  DEDICATION_TYPES,
  DURATIONS,
  TYPE_NAMES,
  addDays,
  dedicationLine,
  type Dedication,
  type DedicationType,
} from '../services/dedications';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCmReTgx27sbugQjIB0k-Vivxxv3Si6APM',
  authDomain: 'chitat-daily.firebaseapp.com',
  projectId: 'chitat-daily',
  storageBucket: 'chitat-daily.firebasestorage.app',
  messagingSenderId: '902358031954',
  appId: '1:902358031954:web:92998d31a7a7623958498b',
};

interface RequestDoc {
  id: string;
  type: DedicationType;
  duration: 'day' | 'week' | 'month';
  text: string;
  startDate: string;
  donor: string;
  amount: number;
  email: string;
  lang: string;
  createdAt?: any;
  /** Set when the request was added as a dedication */
  addedAt?: any;
  dedicationId?: string;
}

/** requestId: the request this dedication is created from (marked as added on save) */
type Draft = Omit<Dedication, 'id'> & { id?: string; requestId?: string };

let fb: Promise<{
  auth: typeof import('firebase/auth');
  fs: typeof import('firebase/firestore');
  authInstance: import('firebase/auth').Auth;
  db: import('firebase/firestore').Firestore;
}> | null = null;

function load() {
  if (!fb) {
    fb = (async () => {
      const [{ initializeApp, getApps }, auth, fs] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ]);
      const app = getApps().find((a) => a.name === 'admin') || initializeApp(FIREBASE_CONFIG, 'admin');
      return { auth, fs, authInstance: auth.getAuth(app), db: fs.getFirestore(app) };
    })();
  }
  return fb;
}

function todayKey(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function fmt(key: string): string {
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' });
}

const input = 'w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-700 text-stone-900';
const btn = 'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 disabled:opacity-50';

const EMPTY: Draft = { type: 'ilui', text: '', startDate: todayKey(), endDate: todayKey(), donor: '' };

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const [requests, setRequests] = useState<RequestDoc[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    document.title = 'ניהול הקדשות – חת״ת יומי';
    let unsub = () => {};
    load().then(({ auth, authInstance }) => {
      unsub = auth.onAuthStateChanged(authInstance, setUser);
    });
    return () => unsub();
  }, []);

  const isAdmin = Boolean(user && user.email === ADMIN_EMAIL);

  const refresh = async () => {
    const { fs, db } = await load();
    const [d, r] = await Promise.all([
      fs.getDocs(fs.query(fs.collection(db, 'dedications'), fs.orderBy('startDate', 'desc'))),
      fs.getDocs(fs.query(fs.collection(db, 'dedicationRequests'), fs.orderBy('createdAt', 'desc'))),
    ]);
    setDedications(d.docs.map((x) => ({ id: x.id, ...(x.data() as any) })));
    setRequests(r.docs.map((x) => ({ id: x.id, ...(x.data() as any) })));
  };

  useEffect(() => {
    if (isAdmin) refresh().catch((e) => setMessage(`טעינה נכשלה: ${e?.code || e}`));
  }, [isAdmin]);

  const run = async (fn: () => Promise<void>, ok?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      if (ok) setMessage(ok);
      await refresh();
    } catch (e: any) {
      setMessage(`הפעולה נכשלה: ${e?.code || e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  const signIn = () =>
    run(async () => {
      const { auth, authInstance } = await load();
      const provider = new auth.GoogleAuthProvider();
      provider.setCustomParameters({ login_hint: ADMIN_EMAIL });
      await auth.signInWithPopup(authInstance, provider);
    });

  const signOut = async () => {
    const { auth, authInstance } = await load();
    await auth.signOut(authInstance);
  };

  const save = (d: Draft) =>
    run(async () => {
      if (!d.text.trim()) throw new Error('חסר נוסח ההקדשה');
      if (d.endDate < d.startDate) throw new Error('תאריך הסיום לפני תאריך ההתחלה');
      const { fs, db } = await load();
      const data = {
        type: d.type,
        text: d.text.trim(),
        startDate: d.startDate,
        endDate: d.endDate,
        donor: (d.donor || '').trim(),
        updatedAt: fs.serverTimestamp(),
      };
      if (d.id) {
        await fs.updateDoc(fs.doc(db, 'dedications', d.id), data);
      } else {
        const ref = await fs.addDoc(fs.collection(db, 'dedications'), { ...data, createdAt: fs.serverTimestamp() });
        if (d.requestId) {
          await fs.updateDoc(fs.doc(db, 'dedicationRequests', d.requestId), {
            addedAt: fs.serverTimestamp(),
            dedicationId: ref.id,
          });
        }
      }
      setDraft(null);
    }, 'נשמר. ההקדשה תופיע באפליקציה.');

  const remove = (col: 'dedications' | 'dedicationRequests', id: string, question: string) => {
    if (!window.confirm(question)) return;
    run(async () => {
      const { fs, db } = await load();
      await fs.deleteDoc(fs.doc(db, col, id));
    }, 'נמחק.');
  };

  const fromRequest = (r: RequestDoc) => {
    const days = DURATIONS.find((d) => d.id === r.duration)?.days || 1;
    setDraft({ type: r.type, text: r.text, startDate: r.startDate, endDate: addDays(r.startDate, days - 1), donor: r.donor, requestId: r.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (user === undefined) return <div className="p-8 text-center text-stone-500 text-sm">טוען…</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm w-full space-y-4 text-center">
          <h1 className="font-torah font-bold text-xl text-stone-900">ניהול הקדשות</h1>
          {user ? (
            <>
              <p className="text-sm text-red-600">החשבון {user.email} אינו מורשה. יש להתחבר עם {ADMIN_EMAIL}.</p>
              <button onClick={signOut} className={`${btn} mx-auto bg-stone-100 text-stone-700`}>
                <LogOut className="w-3.5 h-3.5" /> התנתקות
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-600">יש להתחבר עם חשבון Google של {ADMIN_EMAIL}.</p>
              <button onClick={signIn} disabled={busy} className={`${btn} mx-auto bg-amber-900 text-white text-sm px-4 py-2`}>
                התחברות עם Google
              </button>
            </>
          )}
          {message && <p className="text-xs text-red-600">{message}</p>}
          <a href="/" className="block text-xs text-stone-500 hover:underline">חזרה לאפליקציה</a>
        </div>
      </div>
    );
  }

  const today = todayKey();
  const current = dedications.filter((d) => d.endDate >= today);
  const past = dedications.filter((d) => d.endDate < today);

  return (
    <div className="min-h-screen bg-amber-50/40" dir="rtl">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-torah font-bold text-2xl text-stone-900">ניהול הקדשות</h1>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs text-stone-500 hover:underline">לאפליקציה</a>
            <button onClick={signOut} className={`${btn} bg-white border border-stone-300 text-stone-700`}>
              <LogOut className="w-3.5 h-3.5" /> התנתקות
            </button>
          </div>
        </div>

        {message && <p className="text-sm text-amber-900 bg-amber-100 rounded-lg px-3 py-2">{message}</p>}

        {/* Add / edit */}
        {draft ? (
          <section className="bg-white rounded-xl border border-amber-300 p-4 space-y-3">
            <h2 className="font-bold text-stone-900">{draft.id ? 'עריכת הקדשה' : draft.requestId ? 'הקדשה חדשה מתוך בקשה' : 'הקדשה חדשה'}</h2>
            <div className="flex flex-wrap gap-1.5">
              {DEDICATION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDraft({ ...draft, type: t })}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer ${
                    draft.type === t ? 'bg-amber-100 border-amber-900 font-bold' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  {TYPE_NAMES.he[t]}
                </button>
              ))}
            </div>
            <input
              value={draft.text}
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              placeholder={draft.type === 'other' ? 'הנוסח המלא' : 'שם, למשל: פלוני בן פלונית'}
              className={input}
              dir="auto"
            />
            {draft.text.trim() && (
              <p className="text-sm">
                <span className="text-stone-500 text-xs">תצוגה: </span>
                <span className="font-torah font-bold text-amber-950">{dedicationLine({ type: draft.type, text: draft.text.trim() }, 'he')}</span>
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-stone-600 space-y-1">
                <span>מתאריך</span>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => {
                    const startDate = e.target.value;
                    setDraft({ ...draft, startDate, endDate: draft.endDate < startDate ? startDate : draft.endDate });
                  }}
                  className={input}
                  dir="ltr"
                />
              </label>
              <label className="text-xs text-stone-600 space-y-1">
                <span>עד תאריך (כולל)</span>
                <input type="date" value={draft.endDate} min={draft.startDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} className={input} dir="ltr" />
              </label>
            </div>
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, endDate: addDays(draft.startDate, d.days - 1) })}
                  className="px-2 py-1 rounded-md border border-stone-200 bg-stone-50 text-[11px] cursor-pointer"
                >
                  {{ day: 'יום', week: 'שבוע', month: 'חודש' }[d.id]}
                </button>
              ))}
            </div>
            <input value={draft.donor || ''} onChange={(e) => setDraft({ ...draft, donor: e.target.value })} placeholder="שם התורם (לא חובה, מוצג כשפותחים את ההקדשה)" className={input} dir="auto" />
            <div className="flex gap-2">
              <button onClick={() => save(draft)} disabled={busy} className={`${btn} bg-amber-900 text-white`}>שמירה</button>
              <button onClick={() => setDraft(null)} className={`${btn} bg-stone-100 text-stone-700`}>ביטול</button>
            </div>
          </section>
        ) : (
          <button onClick={() => setDraft({ ...EMPTY })} className={`${btn} bg-amber-900 text-white text-sm px-4 py-2`}>
            <Plus className="w-4 h-4" /> הקדשה חדשה
          </button>
        )}

        {/* Requests */}
        <section className="space-y-2">
          <h2 className="font-bold text-stone-900">
            בקשות שהתקבלו ({requests.filter((r) => !r.addedAt).length} ממתינות{requests.some((r) => r.addedAt) ? `, ${requests.filter((r) => r.addedAt).length} נוספו` : ''})
          </h2>
          {requests.length === 0 && <p className="text-xs text-stone-500">אין בקשות.</p>}
          {[...requests.filter((r) => !r.addedAt), ...requests.filter((r) => r.addedAt)].map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border p-3 space-y-1.5 text-sm ${r.addedAt ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-200'}`}
            >
              {r.addedAt && (
                <div className="text-xs font-bold text-emerald-700">
                  ✓ נוספה כהקדשה{r.addedAt?.toDate ? ` ב־${r.addedAt.toDate().toLocaleDateString('he-IL')}` : ''}
                </div>
              )}
              <div className="font-torah font-bold text-amber-950" dir="auto">{dedicationLine(r, 'he')}</div>
              <div className="text-xs text-stone-600 space-y-0.5">
                <div>
                  {{ day: 'יום אחד', week: 'שבוע', month: 'חודש' }[r.duration]} · מ־{fmt(r.startDate)} · {r.amount} €
                </div>
                <div>
                  תורם: {r.donor || '—'} · <a href={`mailto:${r.email}`} className="text-amber-900 underline" dir="ltr">{r.email}</a>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                {!r.addedAt && (
                  <button onClick={() => fromRequest(r)} className={`${btn} bg-amber-100 text-amber-950`}>
                    <Plus className="w-3.5 h-3.5" /> הוספה כהקדשה
                  </button>
                )}
                <button onClick={() => remove('dedicationRequests', r.id, 'למחוק את הבקשה?')} className={`${btn} text-red-600`}>
                  <Trash2 className="w-3.5 h-3.5" /> מחיקה
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Dedications */}
        <section className="space-y-2">
          <h2 className="font-bold text-stone-900">הקדשות פעילות ועתידיות ({current.length})</h2>
          {current.length === 0 && <p className="text-xs text-stone-500">אין הקדשות.</p>}
          {[...current].reverse().map((d) => (
            <DedicationRow key={d.id} d={d} onEdit={() => setDraft({ ...d })} onDelete={() => remove('dedications', d.id, 'למחוק את ההקדשה?')} />
          ))}
          <button onClick={() => setShowPast(!showPast)} className="text-xs text-stone-500 hover:underline cursor-pointer">
            {showPast ? 'הסתרת הקדשות שהסתיימו' : `הקדשות שהסתיימו (${past.length})`}
          </button>
          {showPast &&
            past.map((d) => (
              <DedicationRow key={d.id} d={d} onEdit={() => setDraft({ ...d })} onDelete={() => remove('dedications', d.id, 'למחוק את ההקדשה?')} />
            ))}
        </section>
      </div>
    </div>
  );
};

const DedicationRow: React.FC<{ d: Dedication; onEdit: () => void; onDelete: () => void }> = ({ d, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-3 flex items-start justify-between gap-2">
    <div className="min-w-0 space-y-0.5">
      <div className="font-torah font-bold text-amber-950 text-sm" dir="auto">{dedicationLine(d, 'he')}</div>
      <div className="text-xs text-stone-500">
        {d.startDate === d.endDate ? fmt(d.startDate) : `${fmt(d.startDate)} – ${fmt(d.endDate)}`}
        {d.donor ? ` · ${d.donor}` : ''}
      </div>
    </div>
    <div className="flex gap-1 shrink-0">
      <button onClick={onEdit} title="עריכה" className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 cursor-pointer">
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={onDelete} title="מחיקה" className="p-1.5 rounded-md hover:bg-red-50 text-red-600 cursor-pointer">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);
