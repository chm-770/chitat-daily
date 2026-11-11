import React, { useEffect, useMemo, useState } from 'react';
import { HDate } from '@hebcal/core';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getHebrewDateInfo } from '../utils/hebrewCalendar';
import { toHebrewNumeral } from '../utils/hebrewNumerals';
import { getDayProgressPercent, localDateKey } from '../utils/progress';
import { DailyStudyKey } from '../types/chitas';
import { enabledLessonKeys } from '../utils/lessons';
import { dirOf, localeOf, useLang, useStrings } from '../i18n';

const STRINGS = {
  he: {
    title: 'לוח שנה והתקדמות',
    close: 'סגור',
    prevMonth: 'החודש הקודם',
    nextMonth: 'החודש הבא',
    monthAverage: (p: number) => `ממוצע החודש: ${p}%`,
    done: 'הושלם',
    partial: 'חלקי',
    today: 'היום',
    backToToday: 'חזור להיום',
  },
  en: {
    title: 'Calendar and progress',
    close: 'Close',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    monthAverage: (p: number) => `Monthly average: ${p}%`,
    done: 'Done',
    partial: 'Partial',
    today: 'Today',
    backToToday: 'Back to today',
  },
  fr: {
    title: 'Calendrier et progression',
    close: 'Fermer',
    prevMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    monthAverage: (p: number) => `Moyenne du mois : ${p} %`,
    done: 'Terminé',
    partial: 'Partiel',
    today: 'Aujourd’hui',
    backToToday: 'Revenir à aujourd’hui',
  },
};

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  enabledLessons?: DailyStudyKey[];
}

const WEEKDAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

/** Short weekday names from Sunday, in the interface language. */
function weekdayNames(locale: string): string[] {
  // 2024-01-07 was a Sunday
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + i, 12).toLocaleDateString(locale, { weekday: 'short' })
  );
}

function firstOfMonth(hd: HDate): HDate {
  return new HDate(1, hd.getMonth(), hd.getFullYear());
}

/**
 * Hebrew-month calendar: pick any day, and see for each past day how much of the
 * daily study was completed (percentage of the 5 lessons).
 */
export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, selectedDate, onSelectDate, enabledLessons }) => {
  const [monthStart, setMonthStart] = useState<HDate>(() => firstOfMonth(new HDate(selectedDate)));
  const s = useStrings(STRINGS);
  const lang = useLang();
  const isRtl = dirOf(lang) === 'rtl';
  const weekdays = lang === 'he' ? WEEKDAYS : weekdayNames(localeOf(lang));
  // The previous month is on the start side (right in Hebrew, left in English / French)
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  useEffect(() => {
    if (isOpen) setMonthStart(firstOfMonth(new HDate(selectedDate)));
  }, [isOpen, selectedDate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const todayKey = localDateKey(new Date());
  const selectedKey = localDateKey(selectedDate);

  const { title, cells, monthPercent } = useMemo(() => {
    const daysInMonth = monthStart.daysInMonth();
    const firstGreg = monthStart.greg();
    const info = getHebrewDateInfo(new Date(firstGreg.getFullYear(), firstGreg.getMonth(), firstGreg.getDate(), 12));
    const leading = firstGreg.getDay();
    const days: ({ greg: Date; key: string; hebDay: string; gregDay: number; percent: number | null } | null)[] = [];
    for (let i = 0; i < leading; i++) days.push(null);
    let total = 0;
    let counted = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const g = new HDate(d, monthStart.getMonth(), monthStart.getFullYear()).greg();
      const greg = new Date(g.getFullYear(), g.getMonth(), g.getDate(), 12);
      const key = localDateKey(greg);
      const percent = key <= todayKey ? getDayProgressPercent(key, enabledLessonKeys(enabledLessons)) : null;
      if (key <= todayKey) {
        total += percent ?? 0;
        counted++;
      }
      days.push({ greg, key, hebDay: toHebrewNumeral(d), gregDay: greg.getDate(), percent });
    }
    return {
      title: `${info.monthName} ${info.yearHebrew}`,
      cells: days,
      monthPercent: counted > 0 ? Math.round(total / counted) : null,
    };
  }, [monthStart, todayKey, isOpen, enabledLessons]);

  if (!isOpen) return null;

  const goMonth = (delta: number) => {
    if (delta > 0) {
      setMonthStart(firstOfMonth(new HDate(monthStart.abs() + monthStart.daysInMonth())));
    } else {
      setMonthStart(firstOfMonth(new HDate(monthStart.abs() - 1)));
    }
  };

  const percentClass = (p: number) =>
    p >= 100
      ? 'bg-emerald-600 text-white'
      : p > 0
      ? 'bg-amber-200 text-amber-950'
      : 'bg-stone-100 text-stone-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs" dir={dirOf(lang)}>
      <div className="bg-white rounded-2xl w-full max-w-md border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-800" />
            <h2 className="font-bold text-stone-900 font-torah text-lg">{s.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            title={s.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Month navigation (previous month on the start side) */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => goMonth(-1)}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 cursor-pointer"
              title={s.prevMonth}
            >
              <PrevIcon className="w-4 h-4" />
            </button>
            <div className="text-center">
              <div className="font-bold text-stone-900 font-torah text-base" dir="rtl" lang="he">
                {title}
              </div>
              {monthPercent !== null && (
                <div className="text-[11px] text-stone-500">{s.monthAverage(monthPercent)}</div>
              )}
            </div>
            <button
              onClick={() => goMonth(1)}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 cursor-pointer"
              title={s.nextMonth}
            >
              <NextIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((w) => (
              <div key={w} className="text-[11px] font-semibold text-stone-500 py-1">
                {w}
              </div>
            ))}
            {cells.map((c, i) =>
              c === null ? (
                <div key={`e${i}`} />
              ) : (
                <button
                  key={c.key}
                  onClick={() => {
                    onSelectDate(c.greg);
                    onClose();
                  }}
                  className={`rounded-lg border p-1 flex flex-col items-center gap-0.5 min-h-[58px] cursor-pointer transition-colors ${
                    c.key === selectedKey
                      ? 'border-amber-800 bg-amber-100'
                      : c.key === todayKey
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                  title={c.greg.toLocaleDateString(localeOf(lang))}
                >
                  <span className="font-torah font-bold text-sm text-stone-900 leading-none" dir="rtl" lang="he">
                    {c.hebDay}
                  </span>
                  <span className="text-[9px] text-stone-400 leading-none">{c.gregDay}</span>
                  {c.percent !== null && (
                    <span className={`text-[9px] font-bold rounded px-1 leading-tight ${percentClass(c.percent)}`}>
                      {c.percent}%
                    </span>
                  )}
                </button>
              )
            )}
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] text-stone-600 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-600" /> {s.done}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-200" /> {s.partial}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border border-amber-400 bg-amber-50" /> {s.today}
            </span>
          </div>

          <button
            onClick={() => {
              onSelectDate(new Date());
              onClose();
            }}
            className="w-full py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 rounded-lg cursor-pointer"
          >
            {s.backToToday}
          </button>
        </div>
      </div>
    </div>
  );
};
