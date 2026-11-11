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
  const rangeInfo =
    isShortMonth && dayOfMonth === 29
      ? {
          range: 'פרקים ק״מ – ק״נ (סיום לחודש חסר)',
          numbers: [140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150],
        }
      : TEHILLIM_MONTHLY_RANGES[dayOfMonth] || TEHILLIM_MONTHLY_RANGES[1];

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
      ? `פרקים ${customNumbers.map((n) => getHebrewChapterNumber(n)).join(', ')}`
      : 'בחר פרקים';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title only */}
      <div className="text-center py-2 space-y-1">
        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 font-torah tracking-wide">
          ספר התהילים
        </h1>
        <p className="text-sm md:text-base text-stone-600 font-medium">
          שיעור התהילים ליום {dateInfo.dayOfMonthHebrew} בחודש {dateInfo.monthName} ({rangeInfo.range})
        </p>
      </div>

      {isLoading && (
        <div className="p-12 text-center text-stone-500 font-medium space-y-2">
          <div className="w-6 h-6 border-2 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>טוען את מזמורי התהילים של היום...</p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {/* Card 1: Custom Psalms (פרקי תהילים אישיים / קפיטל הרבי) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all duration-200">
            {/* Header */}
            <div className="w-full px-5 py-4 flex items-center justify-between gap-3 text-right bg-white hover:bg-stone-50/70 transition-colors">
              <button
                type="button"
                onClick={() => setIsCustomOpen(!isCustomOpen)}
                className="flex items-center gap-2.5 flex-1 cursor-pointer text-right"
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
                      פרקים אישיים
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
                  title="בחר פרקים שיופיעו כאן"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>בחר פרקים</span>
                </button>

                {isCustomCompleted ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span>סיימתי ✓</span>
                  </span>
                ) : (
                  <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
                    {remainingCustom.length} נותרו
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
                      <span>נותרו <strong>{remainingCustom.length}</strong> מתוך {customChapters.length} מזמורים</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">הפרקים האישיים הושלמו ✓</span>
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
                        <span>סיימתי</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleReviewCustomAgain}
                        className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>קרא שוב</span>
                      </button>
                    )}
                  </div>
                </div>

                {customChapters.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-stone-200 text-stone-500 space-y-2">
                    <p>לא נבחרו עדיין פרקים אישיים.</p>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 bg-amber-900 text-white rounded-lg text-xs font-bold"
                    >
                      בחר פרקים כעת
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
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-right cursor-pointer bg-white hover:bg-stone-50/70 transition-colors"
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
                      היום
                    </span>
                    <span className="font-bold text-stone-900 font-torah text-lg md:text-xl">
                      יום {dateInfo.dayOfMonthHebrew} בחודש
                    </span>
                  </div>
                </div>
              </div>

              {/* Outside Status Indicator */}
              <div className="shrink-0 flex items-center gap-2">
                {isCompleted ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span>סיימתי ✓</span>
                  </span>
                ) : (
                  <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
                    {remainingToday.length} מזמורים
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
                      <span className="text-emerald-700 font-bold">שיעור התהילים היומי הושלם בהצלחה ✓</span>
                    ) : (
                      <span>נותרו <strong>{remainingToday.length}</strong> מתוך {todayChapters.length} מזמורים ({rangeInfo.range})</span>
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
                        <span>סיימתי</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleReviewTodayAgain}
                        className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>קרא שוב</span>
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
