import React, { useRef, useMemo } from 'react';
import { HebrewDateInfo } from '../utils/hebrewCalendar';
import { Calendar, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { getSavedCity, DEFAULT_CITY, getFridayCandleLighting, getShabbatEndTime } from '../services/zmanimService';
import { useLang, useStrings } from '../i18n';

const STRINGS = {
  he: {
    prevTitle: 'עבור ליום הקודם',
    prev: 'יום קודם',
    pickTitle: 'לחץ לבחירת תאריך מלוח השנה',
    today: 'היום',
    pickAria: 'בחר תאריך',
    nextTitle: 'עבור ליום הבא',
    next: 'יום הבא',
    backToToday: 'חזור להיום',
    parasha: 'פרשת השבוע:',
    candles: 'כניסת שבת:',
    shabbatEnds: 'צאת שבת:',
  },
  en: {
    prevTitle: 'Go to the previous day',
    prev: 'Previous',
    pickTitle: 'Pick a date from the calendar',
    today: 'Today',
    pickAria: 'Pick a date',
    nextTitle: 'Go to the next day',
    next: 'Next',
    backToToday: 'Back to today',
    parasha: 'Weekly parashah:',
    candles: 'Candle lighting:',
    shabbatEnds: 'Shabbat ends:',
  },
  fr: {
    prevTitle: 'Aller au jour précédent',
    prev: 'Précédent',
    pickTitle: 'Choisir une date dans le calendrier',
    today: 'Aujourd’hui',
    pickAria: 'Choisir une date',
    nextTitle: 'Aller au jour suivant',
    next: 'Suivant',
    backToToday: 'Revenir à aujourd’hui',
    parasha: 'Paracha de la semaine :',
    candles: 'Entrée de Chabbat :',
    shabbatEnds: 'Sortie de Chabbat :',
  },
};

interface DateSelectorBarProps {
  currentDate: Date;
  dateInfo: HebrewDateInfo;
  onSelectDate: (date: Date) => void;
}

export const DateSelectorBar: React.FC<DateSelectorBarProps> = ({
  currentDate,
  dateInfo,
  onSelectDate,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const s = useStrings(STRINGS);
  const isRtl = useLang() === 'he';
  // The "back" arrow points to the start side of the page (right in Hebrew, left in English / French)
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;
  const ForwardIcon = isRtl ? ChevronLeft : ChevronRight;

  // Helper to format Date into YYYY-MM-DD for <input type="date">
  const toIsoDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (() => {
    const today = new Date();
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getDate() === today.getDate()
    );
  })();

  const currentCity = getSavedCity() || DEFAULT_CITY;
  const isFriday = dateInfo.dayOfWeekIndex === 5;
  const shabbatEndTime = isFriday ? getShabbatEndTime(currentCity, currentDate) : null;
  const candleLightingTime = useMemo(() => {
    if (!isFriday) return null;
    return getFridayCandleLighting(currentCity, currentDate);
  }, [isFriday, currentCity, currentDate]);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    onSelectDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    onSelectDate(next);
  };

  const handleToday = () => {
    onSelectDate(new Date());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    const selected = new Date(y, m - 1, d, 12, 0, 0);
    onSelectDate(selected);
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof (dateInputRef.current as any).showPicker === 'function') {
        (dateInputRef.current as any).showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="bg-amber-100/70 border-b border-amber-900/10 py-2 px-3 sm:px-6 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Date Navigator Buttons */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-1 sm:gap-2">
          {/* Back in time on the start side (right in RTL), forward on the end side */}
          <button
            type="button"
            onClick={handlePrevDay}
            title={s.prevTitle}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-950 bg-white hover:bg-amber-50 active:scale-95 border border-amber-300 rounded-lg transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <BackIcon className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{s.prev}</span>
          </button>

          {/* Center Date Display & Picker trigger */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={openDatePicker}
              title={s.pickTitle}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-950 bg-white hover:bg-amber-50 active:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-amber-800 shrink-0" />
              <span className="font-torah text-sm sm:text-base tracking-wide whitespace-nowrap" dir="rtl" lang="he">
                {dateInfo.dayOfWeekHebrew}, {dateInfo.dayOfMonthHebrew} {dateInfo.monthName} {dateInfo.yearHebrew}
              </span>
              {isToday && (
                <span className="px-1.5 py-0.5 text-[10px] font-sans font-bold bg-amber-800 text-white rounded-md shrink-0">
                  {s.today}
                </span>
              )}
            </button>

            {/* Hidden native date input triggered by showPicker() */}
            <input
              ref={dateInputRef}
              type="date"
              value={toIsoDateString(currentDate)}
              onChange={handleInputChange}
              className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
              tabIndex={-1}
              aria-label={s.pickAria}
            />
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            title={s.nextTitle}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-950 bg-white hover:bg-amber-50 active:scale-95 border border-amber-300 rounded-lg transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <span className="hidden xs:inline">{s.next}</span>
            <ForwardIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick presets and "Return to today" button */}
        <div className="flex items-center gap-2 shrink-0 self-center">
          {!isToday ? (
            <button
              type="button"
              onClick={handleToday}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-amber-900 bg-amber-200/90 hover:bg-amber-300/90 border border-amber-400 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{s.backToToday}</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-[11px] text-amber-900/80 font-medium">
              <span>{s.parasha}</span>
              <span className="font-bold text-amber-950 font-torah text-xs" dir="rtl" lang="he">{dateInfo.parashaName}</span>
              {isFriday && candleLightingTime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950 border border-amber-300 font-sans font-semibold text-[10px]">
                  <span>🕯️</span>
                  <span>{s.candles} {candleLightingTime}</span>
                </span>
              )}
              {isFriday && shabbatEndTime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950 border border-amber-300 font-sans font-semibold text-[10px]">
                  <span>✨</span>
                  <span>{s.shabbatEnds} {shabbatEndTime}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
