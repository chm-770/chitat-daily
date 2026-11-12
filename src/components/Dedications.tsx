import React, { useEffect, useState } from 'react';
import { Flame, Heart, X } from 'lucide-react';
import { dirOf, localeOf, useLang, useStrings } from '../i18n';
import {
  DEDICATION_TYPES,
  DURATIONS,
  TYPE_NAMES,
  addDays,
  dedicationLine,
  dedicationsForDay,
  loadDedications,
  sendDedicationRequest,
  type Dedication,
  type DedicationDuration,
  type DedicationType,
} from '../services/dedications';

const STRINGS = {
  he: {
    todayDedicated: 'הלימוד היום מוקדש',
    notDedicated: 'הלימוד היום עדיין לא הוקדש',
    donatedBy: (name: string) => `נתרם על ידי ${name}`,
    want: 'רוצים להקדיש את הלימוד?',
    title: 'הקדשת הלימוד',
    intro:
      'חת״ת יומי הוא פרויקט פרטי שלא למטרות רווח. ההקדשות עוזרות להמשיך לנהל ולפתח אותו כמו שצריך. ההקדשה מוצגת לכל הלומדים בימים שנבחרו.',
    type: 'סוג ההקדשה',
    duration: 'משך ההקדשה',
    durations: { day: 'יום אחד', week: 'שבוע', month: 'חודש' } as Record<DedicationDuration, string>,
    text: 'נוסח ההקדשה',
    textPlaceholder: (t: DedicationType): string => (t === 'other' ? 'הנוסח המלא של ההקדשה' : 'שם, למשל: פלוני בן פלונית'),
    preview: 'כך זה ייראה:',
    start: 'תאריך התחלה',
    until: (d: string) => `עד ${d}`,
    donor: 'שם התורם (לא חובה)',
    amount: 'סכום התמיכה (€)',
    email: 'מייל ליצירת קשר',
    emailHint: 'נחזור אליך במייל לאישור ההקדשה ולפרטי התשלום.',
    send: 'שליחת הבקשה',
    sending: 'שולח…',
    sent: 'הבקשה נשלחה. תודה רבה! נחזור אליך במייל בקרוב.',
    close: 'סגירה',
  },
  en: {
    todayDedicated: "Today's learning is dedicated",
    notDedicated: "Today's learning has not been dedicated yet",
    donatedBy: (name: string) => `Sponsored by ${name}`,
    want: 'Would you like to dedicate the learning?',
    title: 'Dedicate the learning',
    intro:
      'Daily Chitas is a private project, not for profit. Dedications help keep it running and growing as it should. The dedication is shown to everyone who learns on the chosen days.',
    type: 'Type of dedication',
    duration: 'Duration',
    durations: { day: 'One day', week: 'One week', month: 'One month' } as Record<DedicationDuration, string>,
    text: 'Dedication text',
    textPlaceholder: (t: DedicationType): string => (t === 'other' ? 'The full text of the dedication' : 'Name, e.g. Moshe ben Sarah'),
    preview: 'It will look like this:',
    start: 'Start date',
    until: (d: string) => `until ${d}`,
    donor: 'Donor name (optional)',
    amount: 'Contribution (€)',
    email: 'Contact email',
    emailHint: 'We will email you to confirm the dedication and the payment details.',
    send: 'Send request',
    sending: 'Sending…',
    sent: 'Your request was sent. Thank you very much! We will email you soon.',
    close: 'Close',
  },
  fr: {
    todayDedicated: "L'étude d'aujourd'hui est dédiée",
    notDedicated: "L'étude d'aujourd'hui n'a pas encore été dédiée",
    donatedBy: (name: string) => `Offert par ${name}`,
    want: "Vous souhaitez dédier l'étude ?",
    title: "Dédier l'étude",
    intro:
      "'Hitat quotidien est un projet privé et non lucratif. Les dédicaces aident à le faire vivre et à le développer comme il se doit. La dédicace est affichée à tous ceux qui étudient les jours choisis.",
    type: 'Type de dédicace',
    duration: 'Durée',
    durations: { day: 'Un jour', week: 'Une semaine', month: 'Un mois' } as Record<DedicationDuration, string>,
    text: 'Texte de la dédicace',
    textPlaceholder: (t: DedicationType): string => (t === 'other' ? 'Le texte complet de la dédicace' : 'Nom, par ex. Moché ben Sarah'),
    preview: 'Aperçu :',
    start: 'Date de début',
    until: (d: string) => `jusqu'au ${d}`,
    donor: 'Nom du donateur (facultatif)',
    amount: 'Montant du soutien (€)',
    email: 'E-mail de contact',
    emailHint: 'Nous vous écrirons pour confirmer la dédicace et les modalités de paiement.',
    send: 'Envoyer la demande',
    sending: 'Envoi…',
    sent: 'Votre demande a été envoyée. Merci beaucoup ! Nous vous écrirons bientôt.',
    close: 'Fermer',
  },
};

const inputClass =
  'w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700 text-stone-900';
const optionClass = (active: boolean) =>
  `px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
    active ? 'bg-amber-100 border-amber-900 text-amber-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
  }`;

function todayKey(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function formatDate(key: string, lang: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** The dedication line under the date bar: tap to open it and see the "dedicate" button. */
export const DedicationBanner: React.FC<{ dateKey: string; accountEmail?: string | null }> = ({ dateKey, accountEmail }) => {
  const s = useStrings(STRINGS);
  const lang = useLang();
  const [all, setAll] = useState<Dedication[]>([]);
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadDedications().then(setAll);
  }, [dateKey]);

  const today = dedicationsForDay(all, dateKey);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full rounded-xl border px-4 py-2.5 text-center transition-colors cursor-pointer ${
          today.length ? 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/60' : 'border-stone-200 bg-white/60 hover:bg-stone-50'
        }`}
      >
        {today.length ? (
          <div className="space-y-0.5">
            <div className="text-[11px] text-amber-900/70 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" />
              <span>{s.todayDedicated}</span>
            </div>
            {today.map((d, i) => (
              <div key={d.id} className={i > 0 ? 'pt-1.5 mt-1.5 border-t border-amber-200/70' : ''}>
                <div className="font-torah font-bold text-amber-950 text-base leading-snug" dir="auto">
                  {dedicationLine(d, lang)}
                </div>
                {open && d.donor && (
                  <div className="text-[11px] text-stone-600" dir="auto">
                    {s.donatedBy(d.donor)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-stone-500">{s.notDedicated}</span>
        )}
      </button>

      {open && (
        <div className="mt-1.5 rounded-xl border border-amber-200 bg-white p-3 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold cursor-pointer flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4" />
            <span>{s.want}</span>
          </button>
        </div>
      )}

      {formOpen && <DedicationForm defaultEmail={accountEmail || ''} onClose={() => setFormOpen(false)} />}
    </div>
  );
};

const DedicationForm: React.FC<{ defaultEmail: string; onClose: () => void }> = ({ defaultEmail, onClose }) => {
  const s = useStrings(STRINGS);
  const lang = useLang();
  const [type, setType] = useState<DedicationType>('ilui');
  const [duration, setDuration] = useState<DedicationDuration>('day');
  const [text, setText] = useState('');
  const [startDate, setStartDate] = useState(() => addDays(todayKey(), 1));
  const [donor, setDonor] = useState('');
  const [amount, setAmount] = useState(25);
  // The account email by default (can be changed)
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const dur = DURATIONS.find((d) => d.id === duration)!;
  const endDate = addDays(startDate, dur.days - 1);

  const chooseDuration = (id: DedicationDuration) => {
    setDuration(id);
    const min = DURATIONS.find((d) => d.id === id)!.price;
    setAmount((a) => (a < min || a === dur.price ? min : a));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const err = await sendDedicationRequest({
      type,
      duration,
      text: text.trim(),
      startDate,
      donor: donor.trim(),
      amount: Math.max(amount, dur.price),
      email: email.trim(),
      lang,
    });
    if (err) {
      setError(err);
      setStatus('idle');
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" dir={dirOf(lang)}>
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-800" />
            <h2 className="font-bold text-stone-900 font-torah text-lg">{s.title}</h2>
          </div>
          <button onClick={onClose} aria-label={s.close} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {status === 'sent' ? (
            <div className="space-y-4 text-center">
              <p className="text-sm font-semibold text-emerald-800">{s.sent}</p>
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer">
                {s.close}
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <p className="text-xs text-stone-600 leading-relaxed bg-amber-50/70 border border-amber-200 rounded-lg p-3">{s.intro}</p>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-stone-700">{s.type}</div>
                <div className="flex flex-wrap gap-1.5">
                  {DEDICATION_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setType(t)} className={optionClass(type === t)}>
                      {TYPE_NAMES[lang][t]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-stone-700">{s.duration}</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {DURATIONS.map((d) => (
                    <button key={d.id} type="button" onClick={() => chooseDuration(d.id)} className={`${optionClass(duration === d.id)} text-center`}>
                      <div>{s.durations[d.id]}</div>
                      <div className="font-normal text-stone-500">{d.price} €</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-stone-700">{s.text}</div>
                <input
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={s.textPlaceholder(type)}
                  maxLength={200}
                  dir="auto"
                  className={inputClass}
                />
                {text.trim() && (
                  <div className="text-[11px] text-stone-500">
                    {s.preview}{' '}
                    <span className="font-torah font-bold text-amber-950 text-sm" dir="auto">
                      {dedicationLine({ type, text: text.trim() }, lang)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-stone-700">{s.start}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    min={todayKey()}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value || startDate)}
                    className={`${inputClass} w-auto`}
                    dir="ltr"
                  />
                  {dur.days > 1 && <span className="text-xs text-stone-500">{s.until(formatDate(endDate, localeOf(lang)))}</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-stone-700">{s.donor}</div>
                <input value={donor} onChange={(e) => setDonor(e.target.value)} maxLength={100} dir="auto" className={inputClass} />
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-stone-700">{s.amount}</div>
                <input
                  type="number"
                  required
                  min={dur.price}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  onBlur={() => setAmount((a) => Math.max(a || 0, dur.price))}
                  className={`${inputClass} w-32`}
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-stone-700">{s.email}</div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} dir="ltr" className={inputClass} />
                <div className="text-[11px] text-stone-500">{s.emailHint}</div>
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-2.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
              >
                {status === 'sending' ? s.sending : s.send}
              </button>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
