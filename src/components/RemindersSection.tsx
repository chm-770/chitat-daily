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
    setMessage({ text: next.enabled ? 'התזכורות נשמרו.' : 'התזכורות כובו.', ok: true });
  };

  if (!notificationsSupported()) {
    return (
      <p className="text-[11px] text-stone-500">
        {isIOS() && !isStandalone()
          ? 'באייפון אפשר לקבל תזכורות רק אחרי שמוסיפים את האפליקציה למסך הבית (שיתוף ← הוספה למסך הבית) ופותחים אותה משם.'
          : 'הדפדפן הזה לא תומך בהתראות.'}
      </p>
    );
  }

  if (!prefs.enabled) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] text-stone-500">
          התראה בשעה שתבחר ללימוד השיעורים, לפני סוף זמן קריאת שמע, ובערב שבת וחג עם זמן הדלקת הנרות. אין התראות בשבת ובחג.
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
          הגדרת תזכורות
        </button>
        {message && <p className={`text-[11px] ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="text-[11px] text-stone-500">שעת תזכורת לכל שיעור (אפשר להשאיר ריק):</div>
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
                <span>{l.label}</span>
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
          <span>סוף זמן קריאת שמע</span>
        </label>
        <select
          value={prefs.shema.minutesBefore}
          disabled={!prefs.shema.enabled}
          onChange={(e) => update({ shema: { ...prefs.shema, minutesBefore: Number(e.target.value) } })}
          className={`${inputClass} disabled:opacity-40`}
        >
          {SHEMA_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m === 60 ? 'שעה לפני' : `${m} דק׳ לפני`}
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
          <span>ערב שבת וחג – זמן הדלקת נרות</span>
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

      <p className="text-[11px] text-stone-500">הזמנים לפי העיר שנבחרה. אין התראות בשבת ובחג.</p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy || !dirty}
          onClick={() => save(prefs)}
          className="flex-1 py-2 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
        >
          {busy ? 'שומר…' : 'שמירת התזכורות'}
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
          כיבוי
        </button>
      </div>
      {message && <p className={`text-[11px] ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>}
    </div>
  );
};
