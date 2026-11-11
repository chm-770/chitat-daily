import React, { useState } from 'react';
import { LogIn, LogOut, Trash2, UserCircle2 } from 'lucide-react';
import {
  AccountUser,
  authErrorMessage,
  deleteAccount,
  registerWithEmail,
  resetPassword,
  signInWithEmail,
  signInWithGoogle,
  signOut,
} from '../services/account';
import { useStrings } from '../i18n';

const STRINGS = {
  he: {
    syncedNote: 'ההגדרות וההתקדמות נשמרות בחשבון ובכל מכשיר שמתחברים ממנו.',
    signOut: 'התנתק',
    deleteConfirm: 'למחוק את החשבון ואת כל הנתונים השמורים בו? הנתונים במכשיר הזה יישארו.',
    deleted: 'החשבון נמחק.',
    deleteAccount: 'מחיקת החשבון',
    intro: 'לא חובה. התחברות שומרת את ההגדרות וההתקדמות שלך גם כשמחליפים מכשיר.',
    google: 'התחברות עם Google',
    withEmail: 'או עם מייל וסיסמה',
    email: 'מייל',
    password: 'סיסמה (לפחות 6 תווים)',
    signIn: 'התחברות',
    register: 'יצירת חשבון',
    toRegister: 'אין לך חשבון? יצירת חשבון',
    toSignIn: 'כבר יש לך חשבון? התחברות',
    resetSent: 'נשלח מייל לאיפוס הסיסמה.',
    resetNeedEmail: 'כתוב את המייל ואז לחץ על שכחתי סיסמה.',
    forgot: 'שכחתי סיסמה',
  },
  en: {
    syncedNote: 'Your settings and progress are saved in your account and on every device you sign in from.',
    signOut: 'Sign out',
    deleteConfirm: 'Delete the account and all the data saved in it? The data on this device will stay.',
    deleted: 'The account was deleted.',
    deleteAccount: 'Delete account',
    intro: 'Optional. Signing in keeps your settings and progress when you switch devices.',
    google: 'Sign in with Google',
    withEmail: 'or with email and password',
    email: 'Email',
    password: 'Password (at least 6 characters)',
    signIn: 'Sign in',
    register: 'Create account',
    toRegister: 'No account? Create one',
    toSignIn: 'Already have an account? Sign in',
    resetSent: 'A password reset email was sent.',
    resetNeedEmail: 'Enter your email, then tap “Forgot password”.',
    forgot: 'Forgot password',
  },
  fr: {
    syncedNote: 'Vos paramètres et votre progression sont enregistrés dans votre compte et sur chaque appareil connecté.',
    signOut: 'Déconnexion',
    deleteConfirm: 'Supprimer le compte et toutes les données qui y sont enregistrées ? Les données de cet appareil seront conservées.',
    deleted: 'Le compte a été supprimé.',
    deleteAccount: 'Supprimer le compte',
    intro: 'Facultatif. La connexion conserve vos paramètres et votre progression quand vous changez d’appareil.',
    google: 'Se connecter avec Google',
    withEmail: 'ou avec un e-mail et un mot de passe',
    email: 'E-mail',
    password: 'Mot de passe (6 caractères minimum)',
    signIn: 'Se connecter',
    register: 'Créer un compte',
    toRegister: 'Pas de compte ? Créer un compte',
    toSignIn: 'Déjà un compte ? Se connecter',
    resetSent: 'Un e-mail de réinitialisation du mot de passe a été envoyé.',
    resetNeedEmail: 'Saisissez votre e-mail, puis touchez « Mot de passe oublié ».',
    forgot: 'Mot de passe oublié',
  },
};

interface AccountSectionProps {
  user: AccountUser | null;
  /** Starts listening to the account (loads Firebase) before signing in */
  onBeforeSignIn: () => void;
}

/** Optional account: sign in with Google or email to keep settings and progress on every device. */
export const AccountSection: React.FC<AccountSectionProps> = ({ user, onBeforeSignIn }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const s = useStrings(STRINGS);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>, ok?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      onBeforeSignIn();
      await fn();
      if (ok) setMessage(ok);
    } catch (e) {
      setMessage(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
          <div className="min-w-0">
            <div className="text-xs font-bold text-stone-900 truncate">{user.name || user.email}</div>
            <div className="text-[11px] text-stone-500">{s.syncedNote}</div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(signOut)}
            className="px-2.5 py-1 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{s.signOut}</span>
          </button>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm(s.deleteConfirm)) {
              run(deleteAccount, s.deleted);
            }
          }}
          className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{s.deleteAccount}</span>
        </button>
        {message && <p className="text-[11px] text-stone-600">{message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-stone-500">
        {s.intro}
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => run(signInWithGoogle)}
        className="w-full py-2.5 px-3 rounded-xl bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.4 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        <span>{s.google}</span>
      </button>

      {!showEmail ? (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="w-full text-xs text-amber-900 hover:underline cursor-pointer flex items-center justify-center gap-1"
        >
          <UserCircle2 className="w-3.5 h-3.5" />
          <span>{s.withEmail}</span>
        </button>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => (mode === 'login' ? signInWithEmail(email, password) : registerWithEmail(email, password)));
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={s.email}
            dir="ltr"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700 text-stone-900"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={s.password}
            dir="ltr"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700 text-stone-900"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>{mode === 'login' ? s.signIn : s.register}</span>
          </button>
          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-amber-900 hover:underline cursor-pointer"
            >
              {mode === 'login' ? s.toRegister : s.toSignIn}
            </button>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() =>
                  email
                    ? run(() => resetPassword(email), s.resetSent)
                    : setMessage(s.resetNeedEmail)
                }
                className="text-stone-500 hover:underline cursor-pointer"
              >
                {s.forgot}
              </button>
            )}
          </div>
        </form>
      )}
      {message && <p className="text-[11px] text-red-600">{message}</p>}
    </div>
  );
};
