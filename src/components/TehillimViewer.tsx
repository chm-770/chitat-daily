import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { HebrewDateInfo, TEHILLIM_MONTHLY_RANGES } from '../utils/hebrewCalendar';
import { StudySettings } from '../types/chitas';
import {
  TehillimChapter,
  getTehillimForDayOfMonth,
  getTehillimChapters,
  getCustomPsalmNumbers,
  saveCustomPsalmNumbers,
  getHebrewChapterNumber,
} from '../services/tehillimService';
import { SwipePsalmCard } from './SwipePsalmCard';
import { CustomPsalmsModal } from './CustomPsalmsModal';
import { CheckCircle2, RotateCcw, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { useLang, useStrings, Lang } from '../i18n';
import type { TehillimPortionItem } from '../utils/hebrewCalendar';

/** Range of today's psalms in English / French (the Hebrew title comes from the calendar data). */
function latinRangeTitle(
  lang: Lang,
  items: TehillimPortionItem[] | undefined,
  numbers: number[],
  isShortMonthConclusion: boolean
): string {
  const en = lang === 'en';
  if (isShortMonthConclusion) {
    return en ? 'Psalms 140–150, completing a 29-day month' : 'Psaumes 140 à 150, fin du livre pour un mois de 29 jours';
  }
  const list = items && items.length > 0 ? items : numbers.map((chapter) => ({ chapter } as TehillimPortionItem));
  if (list.length === 0) return '';
  if (list.length === 1) {
    const it = list[0];
    if (it.fromVerse && it.toVerse) {
      return en
        ? `Psalm ${it.chapter}, verses ${it.fromVerse}–${it.toVerse}`
        : `Psaume ${it.chapter}, versets ${it.fromVerse} à ${it.toVerse}`;
    }
    return en ? `Psalm ${it.chapter}` : `Psaume ${it.chapter}`;
  }
  const first = list[0].chapter;
  const last = list[list.length - 1].chapter;
  return en ? `Psalms ${first}–${last}` : `Psaumes ${first} à ${last}`;
}

const STRINGS = {
  he: {
    shortMonthRange: 'פרקים ק״מ – ק״נ (סיום לחודש חסר)',
    chaptersList: (list: string) => `פרקים ${list}`,
    chooseChapters: 'בחר פרקים',
    bookTitle: 'ספר התהילים',
    subtitle: (dayHe: string, _day: number, month: string, range: string) =>
      `שיעור התהילים ליום ${dayHe} בחודש ${month} (${range})`,
    loading: 'טוען את מזמורי התהילים של היום...',
    personalBadge: 'פרקים אישיים',
    chooseChaptersTitle: 'בחר פרקים שיופיעו כאן',
    finishedBadge: 'סיימתי ✓',
    leftCount: (n: number) => `${n} נותרו`,
    remaining: (n: number, total: number): React.ReactNode => (
      <>נותרו <strong>{n}</strong> מתוך {total} מזמורים</>
    ),
    remainingWithRange: (n: number, total: number, range: string): React.ReactNode => (
      <>נותרו <strong>{n}</strong> מתוך {total} מזמורים ({range})</>
    ),
    personalDone: 'הפרקים האישיים הושלמו ✓',
    finish: 'סיימתי',
    readAgain: 'קרא שוב',
    noPersonal: 'לא נבחרו עדיין פרקים אישיים.',
    chooseNow: 'בחר פרקים כעת',
    todayBadge: 'היום',
    dayOfMonth: (dayHe: string, _day: number) => `יום ${dayHe} בחודש`,
    psalmsCount: (n: number) => `${n} מזמורים`,
    todayDone: 'שיעור התהילים היומי הושלם בהצלחה ✓',
  },
  en: {
    shortMonthRange: '',
    chaptersList: (list: string) => `Psalms ${list}`,
    chooseChapters: 'Choose psalms',
    bookTitle: 'Book of Tehillim',
    subtitle: (_dayHe: string, day: number, _month: string, range: string) =>
      `Tehillim for day ${day} of the Hebrew month (${range})`,
    loading: "Loading today's psalms…",
    personalBadge: 'Personal psalms',
    chooseChaptersTitle: 'Choose the psalms shown here',
    finishedBadge: 'Done ✓',
    leftCount: (n: number) => `${n} left`,
    remaining: (n: number, total: number): React.ReactNode => (
      <><strong>{n}</strong> of {total} psalms left</>
    ),
    remainingWithRange: (n: number, total: number, range: string): React.ReactNode => (
      <><strong>{n}</strong> of {total} psalms left ({range})</>
    ),
    personalDone: 'Personal psalms completed ✓',
    finish: 'Done',
    readAgain: 'Read again',
    noPersonal: 'No personal psalms chosen yet.',
    chooseNow: 'Choose psalms now',
    todayBadge: 'Today',
    dayOfMonth: (_dayHe: string, day: number) => `Day ${day} of the month`,
    psalmsCount: (n: number) => `${n} psalms`,
    todayDone: "Today's Tehillim completed ✓",
  },
  fr: {
    shortMonthRange: '',
    chaptersList: (list: string) => `Psaumes ${list}`,
    chooseChapters: 'Choisir des psaumes',
    bookTitle: 'Livre des Téhilim',
    subtitle: (_dayHe: string, day: number, _month: string, range: string) =>
      `Téhilim du ${day}e jour du mois hébraïque (${range})`,
    loading: 'Chargement des psaumes du jour…',
    personalBadge: 'Psaumes personnels',
    chooseChaptersTitle: 'Choisir les psaumes affichés ici',
    finishedBadge: 'Terminé ✓',
    leftCount: (n: number) => `${n} restant${n > 1 ? 's' : ''}`,
    remaining: (n: number, total: number): React.ReactNode => (
      <>Il reste <strong>{n}</strong> psaume{n > 1 ? 's' : ''} sur {total}</>
    ),
    remainingWithRange: (n: number, total: number, range: string): React.ReactNode => (
      <>Il reste <strong>{n}</strong> psaume{n > 1 ? 's' : ''} sur {total} ({range})</>
    ),
    personalDone: 'Psaumes personnels terminés ✓',
    finish: 'Terminé',
    readAgain: 'Relire',
    noPersonal: "Aucun psaume personnel n'a encore été choisi.",
    chooseNow: 'Choisir des psaumes',
    todayBadge: "Aujourd'hui",
    dayOfMonth: (_dayHe: string, day: number) => `${day === 1 ? '1er' : `${day}e`} jour du mois`,
    psalmsCount: (n: number) => `${n} psaume${n > 1 ? 's' : ''}`,
    todayDone: 'Téhilim du jour terminés ✓',
  },
};

interface TehillimViewerProps {
  dateInfo: HebrewDateInfo;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onSetCompleted?: (completed: boolean) => void;
  settings: StudySettings;
  readItemIds: Record<string, boolean>;
  onMarkItemRead: (id: string) => void;
  /** Marks several items as read at once (swiping a psalm also marks the ones above it) */
  onMarkBatch?: (ids: string[]) => void;
  onAdvanceToNext?: () => void;
}

export const TehillimViewer: React.FC<TehillimViewerProps> = ({
  dateInfo,
  isCompleted,
  onToggleCompleted,
  onSetCompleted,
  settings,
  readItemIds,
  onMarkItemRead,
  onMarkBatch,
  onAdvanceToNext,
}) => {
  // Marks the swiped psalm and every unread psalm above it, like the verses in the Chumash
  const markUpTo = (chapters: TehillimChapter[], chapterNumber: number, prefix: string): number => {
    const idx = chapters.findIndex((c) => c.number === chapterNumber);
    const ids = chapters
      .slice(0, idx + 1)
      .map((c) => `${prefix}${c.number}`)
      .filter((id) => !readItemIds[id]);
    if (onMarkBatch) onMarkBatch(ids);
    else ids.forEach((id) => onMarkItemRead(id));
    return idx;
  };

  const lang = useLang();
  const s = useStrings(STRINGS);
  const [todayChapters, setTodayChapters] = useState<TehillimChapter[]>([]);
  const [customChapters, setCustomChapters] = useState<TehillimChapter[]>([]);
  const [customNumbers, setCustomNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const todayCardsRef = React.useRef<HTMLDivElement>(null);
  const customCardsRef = React.useRef<HTMLDivElement>(null);
  // Keep track of accordion open cards - both custom and today can be open, or open custom by default as requested:
  // "כשאני נכנס לתהילים אני רוצה שגם הפרקים האישיים זה יחשב כל יום מחדש כאילו עדיין לא קראתי אותם וזה יהיה פתוח"
  const [isCustomOpen, setIsCustomOpen] = useState<boolean>(true);
  const [isTodayOpen, setIsTodayOpen] = useState<boolean>(true);

  // Custom psalms completion state: calculated per day (resets every new day)
  const [isCustomCompleted, setIsCustomCompleted] = useState<boolean>(() => {
    try {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem('chitas_custom_tehillim_date');
      if (savedDate !== todayDateStr) {
        // New day! Reset custom chapters
        localStorage.removeItem('chitas_custom_tehillim_done_today');
        localStorage.setItem('chitas_custom_tehillim_date', todayDateStr);
        return false;
      }
      return localStorage.getItem('chitas_custom_tehillim_done_today') === 'true';
    } catch {
      return false;
    }
  });

  const dayOfMonth = dateInfo.dayOfMonth || 1;
  const isShortMonth = dateInfo.daysInMonth === 29;
  const isShortMonthConclusion = isShortMonth && dayOfMonth === 29;
  const monthlyRange = TEHILLIM_MONTHLY_RANGES[dayOfMonth] || TEHILLIM_MONTHLY_RANGES[1];
  const rangeInfo = isShortMonthConclusion
    ? {
        range: STRINGS.he.shortMonthRange,
        numbers: [140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150],
      }
    : monthlyRange;
  // Today's range in the interface language
  const rangeLabel =
    lang === 'he'
      ? rangeInfo.range
      : latinRangeTitle(
          lang,
          isShortMonthConclusion ? undefined : monthlyRange.items,
          rangeInfo.numbers,
          isShortMonthConclusion
        );

  // Load custom psalm numbers from storage on mount and ensure they are active for all days
  useEffect(() => {
    const sync = () => {
      const nums = getCustomPsalmNumbers();
      setCustomNumbers(nums);
    };
    sync();

    const handleCustomUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCustomNumbers(e.detail);
      } else {
        sync();
      }
    };

    window.addEventListener('chitas_custom_psalms_updated', handleCustomUpdate);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('chitas_custom_psalms_updated', handleCustomUpdate);
      window.removeEventListener('storage', sync);
    };
  }, [dateInfo]);

  // Fetch today's chapters
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getTehillimForDayOfMonth(dayOfMonth, isShortMonth)
      .then((res) => {
        if (isMounted) {
          setTodayChapters(res.chapters);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error loading today Tehillim:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dayOfMonth, isShortMonth]);

  // Fetch custom chapters
  useEffect(() => {
    let isMounted = true;
    if (customNumbers.length === 0) {
      setCustomChapters([]);
      return;
    }

    getTehillimChapters(customNumbers).then((res) => {
      if (isMounted) {
        setCustomChapters(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [customNumbers]);

  const handleSaveCustomChapters = (nums: number[]) => {
    setCustomNumbers(nums);
    saveCustomPsalmNumbers(nums);
  };

  // Swiping a chapter in today's Tehillim
  const handleSwipeTodayPsalm = (chapterNumber: number) => {
    const swipedIdx = markUpTo(todayChapters, chapterNumber, 'tehillim_ch_');

    // Auto-scroll back to top of the next psalm smoothly
    requestAnimationFrame(() => {
      if (todayCardsRef.current) {
        const yOffset = -90;
        const y =
          todayCardsRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    });

    // Check if this was the last remaining chapter of today
    const remainingAfter = todayChapters.filter((c, i) => {
      if (i <= swipedIdx) return false;
      return !readItemIds[`tehillim_ch_${c.number}`];
    });

    if (remainingAfter.length === 0) {
      if (onSetCompleted) {
        onSetCompleted(true);
      } else if (!isCompleted) {
        onToggleCompleted();
      }
      setTimeout(() => {
        setIsTodayOpen(false);
        if (onAdvanceToNext) {
          onAdvanceToNext();
        }
      }, 350);
    }
  };

  // Finishing all today's chapters at once via white "סיימתי" button
  const handleFinishToday = () => {
    todayChapters.forEach((c) => {
      const itemId = `tehillim_ch_${c.number}`;
      if (!readItemIds[itemId]) {
        onMarkItemRead(itemId);
      }
    });

    if (onSetCompleted) {
      onSetCompleted(true);
    } else if (!isCompleted) {
      onToggleCompleted();
    }
    setIsTodayOpen(false);

    // Advance immediately to next section (Tanya)
    if (onAdvanceToNext) {
      onAdvanceToNext();
    }
  };

  // Review today's Tehillim
  const handleReviewTodayAgain = () => {
    todayChapters.forEach((c) => {
      const itemId = `tehillim_ch_${c.number}`;
      if (readItemIds[itemId]) {
        onMarkItemRead(itemId);
      }
    });

    if (onSetCompleted) {
      onSetCompleted(false);
    } else if (isCompleted) {
      onToggleCompleted();
    }
  };

  // Swiping custom psalm
  const handleSwipeCustomPsalm = (chapterNumber: number) => {
    const swipedIdx = markUpTo(customChapters, chapterNumber, 'tehillim_custom_ch_');

    // Auto-scroll back to top of the next psalm smoothly
    requestAnimationFrame(() => {
      if (customCardsRef.current) {
        const yOffset = -90;
        const y =
          customCardsRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    });

    const remaining = customChapters.filter((c, i) => {
      if (i <= swipedIdx) return false;
      return !readItemIds[`tehillim_custom_ch_${c.number}`];
    });

    if (remaining.length === 0) {
      setIsCustomCompleted(true);
      try {
        localStorage.setItem('chitas_custom_tehillim_done_today', 'true');
      } catch {}
      setTimeout(() => {
        setIsCustomOpen(false);
      }, 350);
    }
  };

  const handleFinishCustom = () => {
    customChapters.forEach((c) => {
      const itemId = `tehillim_custom_ch_${c.number}`;
      if (!readItemIds[itemId]) {
        onMarkItemRead(itemId);
      }
    });

    setIsCustomCompleted(true);
    try {
      localStorage.setItem('chitas_custom_tehillim_done_today', 'true');
    } catch {}
    setIsCustomOpen(false);
  };

  const handleReviewCustomAgain = () => {
    customChapters.forEach((c) => {
      const itemId = `tehillim_custom_ch_${c.number}`;
      if (readItemIds[itemId]) {
        onMarkItemRead(itemId);
      }
    });

    setIsCustomCompleted(false);
    try {
      localStorage.removeItem('chitas_custom_tehillim_done_today');
    } catch {}
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-lg leading-relaxed';
      case 'large':
        return 'text-2xl leading-loose';
      case 'xlarge':
        return 'text-3xl leading-loose';
      default:
        return 'text-xl leading-relaxed';
    }
  };

  const remainingToday = todayChapters.filter(
    (c) => !readItemIds[`tehillim_ch_${c.number}`]
  );

  const remainingCustom = customChapters.filter(
    (c) => !readItemIds[`tehillim_custom_ch_${c.number}`]
  );

  const customTitle =
    customNumbers.length > 0
      ? s.chaptersList(
          customNumbers.map((n) => (lang === 'he' ? getHebrewChapterNumber(n) : String(n))).join(', ')
        )
      : s.chooseChapters;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title only */}
      <div className="text-center py-2 space-y-1">
        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 font-torah tracking-wide">
          {s.bookTitle}
        </h1>
        <p className="text-sm md:text-base text-stone-600 font-medium">
          {s.subtitle(dateInfo.dayOfMonthHebrew, dayOfMonth, dateInfo.monthName, rangeLabel)}
        </p>
      </div>

      {isLoading && (
        <div className="p-12 text-center text-stone-500 font-medium space-y-2">
          <div className="w-6 h-6 border-2 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>{s.loading}</p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {/* Card 1: Custom Psalms (פרקי תהילים אישיים / קפיטל הרבי) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all duration-200">
            {/* Header */}
            <div className="w-full px-5 py-4 flex items-center justify-between gap-3 text-start bg-white hover:bg-stone-50/70 transition-colors">
              <button
                type="button"
                onClick={() => setIsCustomOpen(!isCustomOpen)}
                className="flex items-center gap-2.5 flex-1 cursor-pointer text-start"
              >
                <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 transition-transform">
                  {isCustomOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans text-xs px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900">
                      {s.personalBadge}
                    </span>
                    <span className="font-bold text-stone-900 font-torah text-lg md:text-xl">
                      {customTitle}
                    </span>
                  </div>
                </div>
              </button>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-stone-200"
                  title={s.chooseChaptersTitle}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>{s.chooseChapters}</span>
                </button>

                {isCustomCompleted ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span>{s.finishedBadge}</span>
                  </span>
                ) : (
                  <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
                    {s.leftCount(remainingCustom.length)}
                  </span>
                )}
              </div>
            </div>

            {/* Custom Psalms Body (Swipeable Psalm Squares) */}
            {isCustomOpen && (
              <div className="p-5 pt-2 border-t border-stone-100 bg-stone-50/40 space-y-4">
                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200/80">
                  <span className="text-xs text-stone-600 font-medium">
                    {remainingCustom.length > 0 ? (
                      <span>{s.remaining(remainingCustom.length, customChapters.length)}</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">{s.personalDone}</span>
                    )}
                  </span>

                  <div>
                    {!isCustomCompleted ? (
                      <button
                        type="button"
                        onClick={handleFinishCustom}
                        className="px-3.5 py-1.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />
                        <span>{s.finish}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleReviewCustomAgain}
                        className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{s.readAgain}</span>
                      </button>
                    )}
                  </div>
                </div>

                {customChapters.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-500 space-y-2">
                    <p>{s.noPersonal}</p>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-amber-900 text-white rounded-lg text-xs font-bold"
                    >
                      {s.chooseNow}
                    </button>
                  </div>
                ) : (
                  <div ref={customCardsRef} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {remainingCustom.map((chap) => (
                        <SwipePsalmCard
                          key={`custom_${chap.number}`}
                          chapter={chap}
                          fontSizeClass={getFontSizeClass()}
                          onSwipeRight={() => handleSwipeCustomPsalm(chap.number)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Today's Daily Tehillim (Swipeable Psalm Cards) */}
          <div className="bg-white rounded-2xl border border-amber-300 ring-2 ring-amber-400/20 shadow-xs overflow-hidden transition-all duration-200">
            {/* Header */}
            <button
              type="button"
              onClick={() => setIsTodayOpen(!isTodayOpen)}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-start cursor-pointer bg-white hover:bg-stone-50/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 transition-transform">
                  {isTodayOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans text-xs px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900">
                      {s.todayBadge}
                    </span>
                    <span className="font-bold text-stone-900 font-torah text-lg md:text-xl">
                      {s.dayOfMonth(dateInfo.dayOfMonthHebrew, dayOfMonth)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Outside Status Indicator */}
              <div className="shrink-0 flex items-center gap-2">
                {isCompleted ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span>{s.finishedBadge}</span>
                  </span>
                ) : (
                  <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
                    {s.psalmsCount(remainingToday.length)}
                  </span>
                )}
              </div>
            </button>

            {/* Today's Tehillim Body (Swipeable Psalm Squares) */}
            {isTodayOpen && (
              <div className="p-5 pt-2 border-t border-stone-100 bg-stone-50/40 space-y-4">
                {/* Control bar with white "סיימתי" button */}
                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200/80">
                  <div className="text-xs text-stone-600 font-medium">
                    {isCompleted ? (
                      <span className="text-emerald-700 font-bold">{s.todayDone}</span>
                    ) : (
                      <span>{s.remainingWithRange(remainingToday.length, todayChapters.length, rangeLabel)}</span>
                    )}
                  </div>

                  <div>
                    {!isCompleted ? (
                      <button
                        type="button"
                        onClick={handleFinishToday}
                        className="px-3.5 py-1.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />
                        <span>{s.finish}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleReviewTodayAgain}
                        className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{s.readAgain}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Finished Message if all chapters swiped */}
                {/* Swipeable Psalm Cards */}
                {remainingToday.length > 0 && (
                  <div ref={todayCardsRef} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {remainingToday.map((chap) => (
                        <SwipePsalmCard
                          key={`today_${chap.number}`}
                          chapter={chap}
                          fontSizeClass={getFontSizeClass()}
                          onSwipeRight={() => handleSwipeTodayPsalm(chap.number)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for selecting custom psalm chapters */}
      <CustomPsalmsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedChapters={customNumbers}
        onSave={handleSaveCustomChapters}
      />
    </div>
  );
};
