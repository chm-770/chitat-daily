import React, { useState } from 'react';
import type { DailyStudyKey } from '../types/chitas';
import { ALL_LESSONS, enabledLessonKeys } from '../utils/lessons';
import {
  loadReminderPrefs,
  notificationsSupported,
  saveReminders,
  type ReminderLesson,
  type ReminderPrefs,
} from '../services/reminders';
import { useStrings } from '../i18n';

const STRINGS = {
  he: {
    lessons: {
      chumash: 'חומש עם רש״י',
      tehillim: 'תהילים',
      tanya: 'תניא',
      hayomYom: 'היום יום',
      rambam: 'רמב״ם',
    } as Record<DailyStudyKey, string>,
    saved: 'התזכורות נשמרו.',
    off: 'התזכורות כובו.',
    iosHint: 'באייפון אפשר לקבל תזכורות רק אחרי שמוסיפים את האפליקציה למסך הבית (שיתוף ← הוספה למסך הבית) ופותחים אותה משם.',
    unsupported: 'הדפדפן הזה לא תומך בהתראות.',
    intro: 'התראה בשעה שתבחר ללימוד השיעורים, לפני סוף זמן קריאת שמע, ובערב שבת וחג עם זמן הדלקת הנרות. אין התראות בשבת ובחג.',
    setUp: 'הגדרת תזכורות',
    timeHint: 'שעת תזכורת לכל שיעור (אפשר להשאיר ריק):',
    shema: 'סוף זמן קריאת שמע',
    hourBefore: 'שעה לפני',
    minutesBefore: (m: number) => `${m} דק׳ לפני`,
    shabbat: 'ערב שבת וחג – זמן הדלקת נרות',
    cityNote: 'הזמנים לפי העיר שנבחרה. אין התראות בשבת ובחג.',
    saving: 'שומר…',
    save: 'שמירת התזכורות',
    turnOff: 'כיבוי',
  },
  en: {
    lessons: {
      chumash: 'Chumash with Rashi',
      tehillim: 'Tehillim',
      tanya: 'Tanya',
      hayomYom: 'Hayom Yom',
      rambam: 'Rambam',
    } as Record<DailyStudyKey, string>,
    saved: 'Reminders saved.',
    off: 'Reminders turned off.',
    iosHint: 'On iPhone, reminders work only after adding the app to the home screen (Share → Add to Home Screen) and opening it from there.',
    unsupported: 'This browser does not support notifications.',
    intro: 'A notification at the time you choose for each lesson, before Sof Zman Kriat Shema, and on Erev Shabbat and Yom Tov with the candle lighting time. No notifications on Shabbat and Yom Tov.',
    setUp: 'Set up reminders',
    timeHint: 'Reminder time for each lesson (can be left empty):',
    shema: 'Sof Zman Kriat Shema',
    hourBefore: '1 hour before',
    minutesBefore: (m: number) => `${m} min before`,
    shabbat: 'Erev Shabbat and Yom Tov – candle lighting time',
    cityNote: 'Times are based on the selected city. No notifications on Shabbat and Yom Tov.',
    saving: 'Saving…',
    save: 'Save reminders',
    turnOff: 'Turn off',
  },
  fr: {
    lessons: {
      chumash: '\'Houmach avec Rachi',
      tehillim: 'Téhilim',
      tanya: 'Tanya',
      hayomYom: 'Hayom Yom',
      rambam: 'Rambam',
    } as Record<DailyStudyKey, string>,
    saved: 'Rappels enregistrés.',
    off: 'Rappels désactivés.',
    iosHint: 'Sur iPhone, les rappels ne fonctionnent qu’après avoir ajouté l’application à l’écran d’accueil (Partager → Sur l’écran d’accueil) et l’avoir ouverte depuis celui-ci.',
    unsupported: 'Ce navigateur ne prend pas en charge les notifications.',
    intro: 'Une notification à l’heure choisie pour chaque leçon, avant la fin du Chéma (Sof Zman Kriat Chéma), et la veille de Chabbat et de Yom Tov avec l’heure d’allumage des bougies. Aucune notification pendant Chabbat et Yom Tov.',
    setUp: 'Configurer les rappels',
    timeHint: 'Heure du rappel pour chaque leçon (facultatif) :',
    shema: 'Fin du Chéma',
    hourBefore: '1 heure avant',
    minutesBefore: (m: number) => `${m} min avant`,
    shabbat: 'Veille de Chabbat et Yom Tov – allumage des bougies',
    cityNote: 'Horaires selon la ville choisie. Aucune notification pendant Chabbat et Yom Tov.',
    saving: 'Enregistrement…',
    save: 'Enregistrer les rappels',
    turnOff: 'Désactiver',
  },
};

interface RemindersSectionProps {
  enabledLessons?: DailyStudyKey[];
}

const SHEMA_OPTIONS = [15, 30, 45, 60];

const inputClass =
  'px-2 py-1 text-sm bg-white border border-stone-300 rounded-md focus:outline-none focus:border-amber-700 text-stone-900';

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

/** Reminders: a time for each lesson, Sof Zman Kriat Shema, and the candle lighting time on Erev Shabbat / Yom Tov. */
export const RemindersSection: React.FC<RemindersSectionProps> = ({ enabledLessons }) => {
  const [prefs, setPrefs] = useState<ReminderPrefs>(() => loadReminderPrefs());
  const s = useStrings(STRINGS);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [dirty, setDirty] = useState(false);

  const lessons = ALL_LESSONS.filter((l) => enabledLessonKeys(enabledLessons).includes(l.key));

  const update = (p: Partial<ReminderPrefs>) => {
    setPrefs((cur) => ({ ...cur, ...p }));
    setDirty(true);
    setMessage(null);
  };

  const save = async (next: ReminderPrefs) => {
    setBusy(true);
    setMessage(null);
    const err = await saveReminders(next);
    setBusy(false);
    if (err) {
      setMessage({ text: err, ok: false });
      return;
    }
    setDirty(false);
    setMessage({ text: next.enabled ? s.saved : s.off, ok: true });
  };

  if (!notificationsSupported()) {
    return (
      <p className="text-[11px] text-stone-500">
        {isIOS() && !isStandalone()
          ? s.iosHint
          : s.unsupported}
      </p>
    );
  }

  if (!prefs.enabled) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] text-stone-500">
          {s.intro}
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const next = { ...prefs, enabled: true };
            setPrefs(next);
            setDirty(true);
          }}
          className="w-full py-2 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
        >
          {s.setUp}
        </button>
        {message && <p className={`text-[11px] ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="text-[11px] text-stone-500">{s.timeHint}</div>
        {lessons.map((l) => {
          const key = l.key as ReminderLesson;
          const value = prefs.lessons[key];
          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) =>
                    update({ lessons: { ...prefs.lessons, [key]: e.target.checked ? value || '08:00' : '' } })
                  }
                  className="accent-amber-800 w-4 h-4"
                />
                <span>{s.lessons[l.key]}</span>
              </label>
              <input
                type="time"
                dir="ltr"
                value={value}
                disabled={!value}
                onChange={(e) => update({ lessons: { ...prefs.lessons, [key]: e.target.value } })}
                className={`${inputClass} disabled:opacity-40`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
        <label className="flex items-center gap-2 text-sm text-stone-800 cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.shema.enabled}
            onChange={(e) => update({ shema: { ...prefs.shema, enabled: e.target.checked } })}
            className="accent-amber-800 w-4 h-4"
          />
          <span>{s.shema}</span>
        </label>
        <select
          value={prefs.shema.minutesBefore}
          disabled={!prefs.shema.enabled}
          onChange={(e) => update({ shema: { ...prefs.shema, minutesBefore: Number(e.target.value) } })}
          className={`${inputClass} disabled:opacity-40`}
        >
          {SHEMA_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m === 60 ? s.hourBefore : s.minutesBefore(m)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-stone-800 cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.shabbat.enabled}
            onChange={(e) => update({ shabbat: { ...prefs.shabbat, enabled: e.target.checked } })}
            className="accent-amber-800 w-4 h-4"
          />
          <span>{s.shabbat}</span>
        </label>
        <input
          type="time"
          dir="ltr"
          value={prefs.shabbat.time}
          disabled={!prefs.shabbat.enabled}
          onChange={(e) => update({ shabbat: { ...prefs.shabbat, time: e.target.value || '09:00' } })}
          className={`${inputClass} disabled:opacity-40`}
        />
      </div>

      <p className="text-[11px] text-stone-500">{s.cityNote}</p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy || !dirty}
          onClick={() => save(prefs)}
          className="flex-1 py-2 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
        >
          {busy ? s.saving : s.save}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const next = { ...prefs, enabled: false };
            setPrefs(next);
            save(next);
          }}
          className="px-3 py-2 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 text-sm font-semibold cursor-pointer disabled:opacity-50"
        >
          {s.turnOff}
        </button>
      </div>
      {message && <p className={`text-[11px] ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>}
    </div>
  );
};
