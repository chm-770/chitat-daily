/**
 * Optional account (Google or email/password) that syncs settings and study progress across
 * devices, using Firebase Authentication and Firestore. Firebase is loaded only when the user
 * uses an account, so the app stays light for everyone else.
 *
 * Data in Firestore (each user can read and write only their own, see firestore.rules):
 *   users/{uid}                 { settings, city, customPsalms, updatedAt }
 *   users/{uid}/progress/{date} DailyProgress of that day (YYYY-MM-DD)
 */
import type { User } from 'firebase/auth';
import type { DailyProgress } from '../types/chitas';

// Public identifiers of the Firebase project (not secrets)
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCmReTgx27sbugQjIB0k-Vivxxv3Si6APM',
  authDomain: 'chitat-daily.firebaseapp.com',
  projectId: 'chitat-daily',
  storageBucket: 'chitat-daily.firebasestorage.app',
  messagingSenderId: '902358031954',
  appId: '1:902358031954:web:92998d31a7a7623958498b',
};

const SIGNED_IN_FLAG = 'chitas_account_signed_in';
const SETTINGS_KEY = 'chitas_settings';
const CITY_KEY = 'chitas_user_city';
const PSALMS_KEY = 'chitas_custom_tehillim_chapters';
const PROGRESS_PREFIX = 'chitas_progress_';

export interface AccountUser {
  uid: string;
  email: string | null;
  name: string | null;
}

let modules: Promise<{
  auth: typeof import('firebase/auth');
  fs: typeof import('firebase/firestore');
  authInstance: import('firebase/auth').Auth;
  db: import('firebase/firestore').Firestore;
}> | null = null;

function load() {
  if (!modules) {
    modules = (async () => {
      const [{ initializeApp }, auth, fs] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ]);
      const app = initializeApp(FIREBASE_CONFIG);
      const authInstance = auth.getAuth(app);
      auth.useDeviceLanguage(authInstance);
      return { auth, fs, authInstance, db: fs.getFirestore(app) };
    })();
  }
  return modules;
}

function toUser(u: User | null): AccountUser | null {
  return u ? { uid: u.uid, email: u.email, name: u.displayName } : null;
}

/** True if this device was signed in last time (then Firebase is loaded at startup). */
export function wasSignedIn(): boolean {
  try {
    return localStorage.getItem(SIGNED_IN_FLAG) === '1';
  } catch {
    return false;
  }
}

/** Calls back with the current user (or null) whenever it changes. */
export async function watchUser(cb: (user: AccountUser | null) => void): Promise<() => void> {
  const { auth, authInstance } = await load();
  return auth.onAuthStateChanged(authInstance, (u) => {
    try {
      if (u) localStorage.setItem(SIGNED_IN_FLAG, '1');
      else localStorage.removeItem(SIGNED_IN_FLAG);
    } catch {
      // ignore
    }
    cb(toUser(u));
  });
}

export async function signInWithGoogle(): Promise<void> {
  const { auth, authInstance } = await load();
  const provider = new auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(authInstance, provider);
  } catch (e: any) {
    if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
      await auth.signInWithRedirect(authInstance, provider);
    } else {
      throw e;
    }
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { auth, authInstance } = await load();
  await auth.signInWithEmailAndPassword(authInstance, email, password);
}

export async function registerWithEmail(email: string, password: string): Promise<void> {
  const { auth, authInstance } = await load();
  await auth.createUserWithEmailAndPassword(authInstance, email, password);
}

export async function resetPassword(email: string): Promise<void> {
  const { auth, authInstance } = await load();
  await auth.sendPasswordResetEmail(authInstance, email);
}

export async function signOut(): Promise<void> {
  const { auth, authInstance } = await load();
  await auth.signOut(authInstance);
}

/** Deletes the user's data and account. May require signing in again (auth/requires-recent-login). */
export async function deleteAccount(): Promise<void> {
  const { fs, authInstance, db } = await load();
  const user = authInstance.currentUser;
  if (!user) return;
  const progress = await fs.getDocs(fs.collection(db, 'users', user.uid, 'progress'));
  for (const d of progress.docs) await fs.deleteDoc(d.ref);
  await fs.deleteDoc(fs.doc(db, 'users', user.uid));
  await user.delete();
}

/** Human-readable Hebrew message for a Firebase auth error. */
export function authErrorMessage(e: any): string {
  const code: string = e?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'המייל או הסיסמה שגויים.';
  if (code.includes('email-already-in-use')) return 'כבר קיים חשבון עם המייל הזה. אפשר להתחבר אליו.';
  if (code.includes('weak-password')) return 'הסיסמה קצרה מדי (לפחות 6 תווים).';
  if (code.includes('invalid-email')) return 'כתובת המייל לא תקינה.';
  if (code.includes('popup-closed')) return 'חלון ההתחברות נסגר לפני הסיום.';
  if (code.includes('network')) return 'אין חיבור לאינטרנט.';
  if (code.includes('requires-recent-login')) return 'לפני מחיקת החשבון צריך להתחבר מחדש.';
  if (code.includes('unauthorized-domain')) return 'כתובת האתר לא מאושרת בהגדרות Firebase.';
  return 'הפעולה נכשלה. נסה שוב.';
}

// ---------- Sync ----------

function readJSON<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

/** Union of two days' progress: a lesson or item read on either device counts as read. */
function mergeDay(a: DailyProgress | null, b: DailyProgress | null, date: string): DailyProgress {
  const keys = ['chumash', 'tehillim', 'tanya', 'hayomYom', 'rambam'] as const;
  const out: DailyProgress = { date, chumash: false, tehillim: false, tanya: false, hayomYom: false, rambam: false, readItemIds: {} };
  for (const k of keys) out[k] = Boolean(a?.[k]) || Boolean(b?.[k]);
  for (const src of [a?.readItemIds, b?.readItemIds]) {
    for (const [id, v] of Object.entries(src || {})) if (v) out.readItemIds![id] = true;
  }
  return out;
}

/**
 * Right after signing in: progress of both sides is merged (nothing read is lost); settings,
 * city and personal psalms come from the account if it has them, otherwise from this device.
 * Returns true when local data changed (the app then reloads its state).
 */
export async function syncAfterSignIn(uid: string): Promise<boolean> {
  const { fs, db } = await load();
  let changed = false;
  const userRef = fs.doc(db, 'users', uid);
  const remote = await fs.getDoc(userRef);

  if (remote.exists()) {
    const data = remote.data() as any;
    if (data.settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
      changed = true;
    }
    if (data.city) localStorage.setItem(CITY_KEY, data.city);
    if (Array.isArray(data.customPsalms)) localStorage.setItem(PSALMS_KEY, JSON.stringify(data.customPsalms));
  } else {
    await pushSettings(uid);
  }

  const remoteDays = await fs.getDocs(fs.collection(db, 'users', uid, 'progress'));
  const remoteByDate = new Map<string, DailyProgress>();
  remoteDays.forEach((d) => remoteByDate.set(d.id, d.data() as DailyProgress));
  const localDates = Object.keys(localStorage)
    .filter((k) => k.startsWith(PROGRESS_PREFIX))
    .map((k) => k.slice(PROGRESS_PREFIX.length));
  const allDates = new Set([...localDates, ...remoteByDate.keys()]);
  for (const date of allDates) {
    const local = readJSON<DailyProgress>(PROGRESS_PREFIX + date);
    const merged = mergeDay(local, remoteByDate.get(date) || null, date);
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      localStorage.setItem(PROGRESS_PREFIX + date, JSON.stringify(merged));
      changed = true;
    }
    await fs.setDoc(fs.doc(db, 'users', uid, 'progress', date), merged);
  }
  return changed;
}

/** Saves the settings, city and personal psalms of this device to the account. */
export async function pushSettings(uid: string): Promise<void> {
  const { fs, db } = await load();
  await fs.setDoc(
    fs.doc(db, 'users', uid),
    {
      settings: readJSON(SETTINGS_KEY) || {},
      city: localStorage.getItem(CITY_KEY) || null,
      customPsalms: readJSON(PSALMS_KEY) || [],
      updatedAt: fs.serverTimestamp(),
    },
    { merge: true }
  );
}

/** Saves one day's progress to the account. */
export async function pushProgress(uid: string, progress: DailyProgress): Promise<void> {
  const { fs, db } = await load();
  await fs.setDoc(fs.doc(db, 'users', uid, 'progress', progress.date), progress);
}
