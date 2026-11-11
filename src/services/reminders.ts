/**
 * Reminders (push notifications). The device saves its preferences in Firestore
 * (reminders/{anonymousUid}); a Cloudflare Worker (worker/) checks every few minutes who is
 * due and sends the notification through Firebase Cloud Messaging.
 *
 * Reminders do not need an account: they use a separate Firebase app instance with anonymous
 * sign-in, so they never mix with the optional account sign-in.
 */
import { DEFAULT_CITY, getSavedCity, type CityConfig } from './zmanimService';
import { isUserInIsrael } from '../utils/jewishCalendarService';
import { getLang, pick, type Lang } from '../i18n';

const ERRORS = {
  he: {
    deviceUnsupported: 'המכשיר או הדפדפן הזה לא תומך בהתראות.',
    denied: 'לא ניתנה הרשאה להתראות. אפשר לאשר אותה בהגדרות הדפדפן או הטלפון.',
    browserUnsupported: 'הדפדפן הזה לא תומך בהתראות.',
    failed: 'שמירת התזכורות נכשלה. בדוק את החיבור לאינטרנט ונסה שוב.',
  },
  en: {
    deviceUnsupported: 'This device or browser does not support notifications.',
    denied: 'Notification permission was not granted. You can allow it in your browser or phone settings.',
    browserUnsupported: 'This browser does not support notifications.',
    failed: 'Saving the reminders failed. Check your internet connection and try again.',
  },
  fr: {
    deviceUnsupported: 'Cet appareil ou ce navigateur ne prend pas en charge les notifications.',
    denied: 'L’autorisation des notifications n’a pas été accordée. Vous pouvez l’activer dans les réglages du navigateur ou du téléphone.',
    browserUnsupported: 'Ce navigateur ne prend pas en charge les notifications.',
    failed: 'L’enregistrement des rappels a échoué. Vérifiez votre connexion Internet et réessayez.',
  },
};

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCmReTgx27sbugQjIB0k-Vivxxv3Si6APM',
  authDomain: 'chitat-daily.firebaseapp.com',
  projectId: 'chitat-daily',
  storageBucket: 'chitat-daily.firebasestorage.app',
  messagingSenderId: '902358031954',
  appId: '1:902358031954:web:92998d31a7a7623958498b',
};
// Public key of the Web Push certificate (Firebase > Cloud Messaging)
const VAPID_KEY = 'BGT8kETE19OVOrfx89i0Gbt9quc8iid6t7tBYKIYj9ghBzHJHhbfCnJhFbWoX3xgYflPz_JVvFAKQaeYtDYwkFo';

const PREFS_KEY = 'chitas_reminders';
const SYNC_KEY = 'chitas_reminders_synced';

export type ReminderLesson = 'chumash' | 'tehillim' | 'tanya' | 'hayomYom' | 'rambam';

export interface ReminderPrefs {
  enabled: boolean;
  /** Time (HH:MM, local) of the reminder for each lesson, or '' for none */
  lessons: Record<ReminderLesson, string>;
  shema: { enabled: boolean; minutesBefore: number };
  shabbat: { enabled: boolean; time: string };
}

export const DEFAULT_REMINDERS: ReminderPrefs = {
  enabled: false,
  lessons: { chumash: '', tehillim: '', tanya: '', hayomYom: '', rambam: '' },
  shema: { enabled: false, minutesBefore: 30 },
  shabbat: { enabled: false, time: '09:00' },
};

export function loadReminderPrefs(): ReminderPrefs {
  try {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      return {
        ...DEFAULT_REMINDERS,
        ...p,
        lessons: { ...DEFAULT_REMINDERS.lessons, ...(p.lessons || {}) },
        shema: { ...DEFAULT_REMINDERS.shema, ...(p.shema || {}) },
        shabbat: { ...DEFAULT_REMINDERS.shabbat, ...(p.shabbat || {}) },
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_REMINDERS;
}

function savePrefsLocally(prefs: ReminderPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

let loaded: Promise<{
  fs: typeof import('firebase/firestore');
  messaging: typeof import('firebase/messaging');
  app: import('firebase/app').FirebaseApp;
  uid: string;
}> | null = null;

function load() {
  if (!loaded) {
    loaded = (async () => {
      const [{ initializeApp, getApps }, auth, fs, messaging] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
        import('firebase/messaging'),
      ]);
      const app = getApps().find((a) => a.name === 'reminders') || initializeApp(FIREBASE_CONFIG, 'reminders');
      const a = auth.getAuth(app);
      const cred = a.currentUser ? null : await auth.signInAnonymously(a);
      const uid = a.currentUser?.uid || cred!.user.uid;
      return { fs, messaging, app, uid };
    })();
  }
  return loaded;
}

/**
 * Saves the preferences locally and on the server. Asks for notification permission when
 * reminders are turned on. Returns an error message in the interface language, or null on success.
 */
export async function saveReminders(
  prefs: ReminderPrefs,
  city: CityConfig = getSavedCity() || DEFAULT_CITY,
  inIsrael: boolean = isUserInIsrael()
): Promise<string | null> {
  savePrefsLocally(prefs);
  const err = pick(ERRORS);
  const lang = getLang();
  try {
    const { fs, messaging, app, uid } = await load();
    const db = fs.getFirestore(app);
    const ref = fs.doc(db, 'reminders', uid);

    if (!prefs.enabled) {
      await fs.deleteDoc(ref).catch(() => {});
      return null;
    }
    if (!notificationsSupported()) return err.deviceUnsupported;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return err.denied;
    if (!(await messaging.isSupported())) return err.browserUnsupported;

    const registration = await navigator.serviceWorker.ready;
    const token = await messaging.getToken(messaging.getMessaging(app), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    await fs.setDoc(ref, {
      token,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || city.timeZone,
      city: {
        name: city.nameHe,
        // Latin-letter name for English / French notifications (cities from the online search have only Hebrew)
        nameEn: city.nameEn && !/[\u0590-\u05FF]/.test(city.nameEn) ? city.nameEn : city.nameHe,
        latitude: city.latitude,
        longitude: city.longitude,
        timeZone: city.timeZone,
        isIsrael: city.isIsrael,
        candleLightingMinutes: city.candleLightingMinutes,
      },
      inIsrael,
      // Language of the notifications sent by the server
      lang,
      lessons: prefs.lessons,
      shema: prefs.shema,
      shabbat: prefs.shabbat,
      // The worker recomputes the next reminder time on its next run
      nextFireAt: fs.Timestamp.now(),
      updatedAt: fs.serverTimestamp(),
    });
    try {
      localStorage.setItem(SYNC_KEY, JSON.stringify({ sig: syncSignature(prefs, city, inIsrael, lang), at: Date.now() }));
    } catch {
      // ignore
    }
    return null;
  } catch (e) {
    console.warn('Saving reminders failed:', e);
    return err.failed;
  }
}

function syncSignature(prefs: ReminderPrefs, city: CityConfig, inIsrael: boolean, lang: Lang): string {
  return JSON.stringify([prefs, city.latitude, city.longitude, city.timeZone, city.candleLightingMinutes, inIsrael, lang]);
}

/**
 * Called when the app opens and when the city changes: if reminders are on, sends the current
 * city, the interface language and a fresh device token to the server (once a day, or right away when something changed).
 * Never asks for permission by itself.
 */
export function refreshReminders(): void {
  const prefs = loadReminderPrefs();
  if (!prefs.enabled || !notificationsSupported() || Notification.permission !== 'granted') return;
  const city = getSavedCity() || DEFAULT_CITY;
  const inIsrael = isUserInIsrael();
  try {
    const last = JSON.parse(localStorage.getItem(SYNC_KEY) || 'null');
    const fresh = last && last.sig === syncSignature(prefs, city, inIsrael, getLang()) && Date.now() - last.at < 24 * 3600 * 1000;
    if (fresh) return;
  } catch {
    // ignore
  }
  saveReminders(prefs, city, inIsrael).catch(() => {});
}
