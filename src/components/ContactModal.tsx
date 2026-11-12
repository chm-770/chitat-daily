import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { dirOf, useLang, useStrings } from '../i18n';

/**
 * Contact form. Messages are sent through Web3Forms (web3forms.com) to the app's email;
 * the address itself is not in the app. The access key below only allows sending to it.
 */
const WEB3FORMS_KEY = '0715539a-1233-417d-9d9b-d5da7ce5e5ad';

/** The form is offered only once the key is set */
export const CONTACT_ENABLED = WEB3FORMS_KEY.length > 0;

const STRINGS = {
  he: {
    title: 'יצירת קשר / דיווח על טעות',
    intro: 'מצאת טעות בטקסט? יש לך שאלה, הערה או רעיון? נשמח לשמוע. בדיווח על טעות כדאי לציין את השיעור והתאריך.',
    name: 'שם (לא חובה)',
    email: 'מייל לתשובה (לא חובה)',
    message: 'ההודעה',
    send: 'שליחה',
    sending: 'שולח…',
    sent: 'ההודעה נשלחה. תודה!',
    failed: 'השליחה נכשלה. בדוק את החיבור לאינטרנט ונסה שוב.',
    offline: 'אין חיבור לאינטרנט.',
    close: 'סגירה',
    subject: 'הודעה חדשה מחת״ת יומי',
  },
  en: {
    title: 'Contact / report a mistake',
    intro: 'Found a mistake in a text? A question, a comment or an idea? We would love to hear from you. When reporting a mistake, please mention the lesson and the date.',
    name: 'Name (optional)',
    email: 'Email for a reply (optional)',
    message: 'Message',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Your message was sent. Thank you!',
    failed: 'Sending failed. Check your internet connection and try again.',
    offline: 'No internet connection.',
    close: 'Close',
    subject: 'New message from Daily Chitas',
  },
  fr: {
    title: 'Contact / signaler une erreur',
    intro: 'Vous avez trouvé une erreur dans un texte ? Une question, une remarque ou une idée ? Écrivez-nous. Pour signaler une erreur, précisez la leçon et la date.',
    name: 'Nom (facultatif)',
    email: 'E-mail pour la réponse (facultatif)',
    message: 'Message',
    send: 'Envoyer',
    sending: 'Envoi…',
    sent: 'Votre message a été envoyé. Merci !',
    failed: "L'envoi a échoué. Vérifiez votre connexion internet et réessayez.",
    offline: 'Pas de connexion internet.',
    close: 'Fermer',
    subject: "Nouveau message de 'Hitat quotidien",
  },
};

const inputClass =
  'w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700 text-stone-900';

export const ContactModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const s = useStrings(STRINGS);
  const lang = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [botcheck, setBotcheck] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const close = () => {
    if (status === 'sent') {
      setName('');
      setEmail('');
      setMessage('');
      setStatus('idle');
    }
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) {
      setStatus('error');
      setError(s.offline);
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: s.subject,
          from_name: name || 'חת״ת יומי',
          name: name || '-',
          email: email || undefined,
          replyto: email || undefined,
          message,
          language: lang,
          app_version: typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : 'dev',
          botcheck,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || String(res.status));
      setStatus('sent');
    } catch (err) {
      console.warn('Contact form failed:', err);
      setStatus('error');
      setError(s.failed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" dir={dirOf(lang)}>
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-800" />
            <h2 className="font-bold text-stone-900 font-torah text-lg">{s.title}</h2>
          </div>
          <button
            onClick={close}
            aria-label={s.close}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {status === 'sent' ? (
            <div className="space-y-4 text-center">
              <p className="text-sm font-semibold text-emerald-800">{s.sent}</p>
              <button
                onClick={close}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
              >
                {s.close}
              </button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={submit}>
              <p className="text-xs text-stone-600">{s.intro}</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={s.name} className={inputClass} dir="auto" maxLength={100} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={s.email}
                className={inputClass}
                dir="ltr"
                maxLength={200}
              />
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={s.message}
                rows={6}
                maxLength={5000}
                className={`${inputClass} resize-y`}
                dir="auto"
              />
              {/* Spam trap: hidden from people, filled by bots */}
              <input
                type="checkbox"
                tabIndex={-1}
                autoComplete="off"
                checked={botcheck}
                onChange={(e) => setBotcheck(e.target.checked)}
                className="hidden"
                aria-hidden="true"
              />
              <button
                type="submit"
                disabled={status === 'sending' || !message.trim()}
                className="w-full py-2.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
              >
                {status === 'sending' ? s.sending : s.send}
              </button>
              {status === 'error' && <p className="text-xs text-red-600">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
