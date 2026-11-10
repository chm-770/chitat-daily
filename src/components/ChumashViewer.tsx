import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Parasha, ChumashAliyah, ChumashVerse, StudySettings } from '../types/chitas';
import { HebrewDateInfo } from '../utils/hebrewCalendar';
import { SwipeVerseCard } from './SwipeVerseCard';
import {
  BUILTIN_PARASHIYOT,
  getCurrentParashaInfo,
  getParashaData,
  getPreviousParashaShviiAliyah,
} from '../services/chumashService';
import { getSavedCity, DEFAULT_CITY, getFridayCandleLighting } from '../services/zmanimService';
import { CheckCircle2, RotateCcw, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface ChumashViewerProps {
  dateInfo: HebrewDateInfo;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onSetCompleted?: (completed: boolean) => void;
  settings: StudySettings;
  readItemIds: Record<string, boolean>;
  onMarkItemRead: (id: string) => void;
  onMarkVersesBatch?: (ids: string[]) => void;
  onAdvanceToNext?: () => void;
}

export interface DayCardItem {
  id: string;
  parashaId: string;
  parashaName: string;
  aliyahNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  badgeLabel?: string;
  rangeDescription: string;
  verses: ChumashVerse[];
  isToday: boolean;
  isPastLastWeekShabbat?: boolean;
  isUpcomingThisWeekShabbat?: boolean;
}

export const ChumashViewer: React.FC<ChumashViewerProps> = ({
  dateInfo,
  isCompleted,
  onToggleCompleted,
  onSetCompleted,
  settings,
  readItemIds,
  onMarkItemRead,
  onMarkVersesBatch,
  onAdvanceToNext,
}) => {
  const [selectedParashaId, setSelectedParashaId] = useState<string>('vezot_haberachah');
  // Empty until the week's parasha is loaded (the loading indicator is shown meanwhile)
  const [parashaData, setParashaData] = useState<Parasha>({
    id: '',
    name: '',
    book: 'בראשית',
    englishName: '',
    aliyot: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Previous parashah 7th aliyah for Shabbat of last week
  const [prevShviiInfo, setPrevShviiInfo] = useState<{
    parashaName: string;
    parashaId: string;
    aliyah: ChumashAliyah;
  } | null>(null);

  // Today's aliyah number: 1 = ראשון (Sunday), ..., 7 = שביעי (Shabbat)
  const todayAliyahNum = Math.min(Math.max(dateInfo.dayOfWeekIndex + 1, 1), 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  // Active accordion: today's card is open by default
  const [openCardId, setOpenCardId] = useState<string | null>(`this_a${todayAliyahNum}`);
  const [showRashi, setShowRashi] = useState<boolean>(settings.showRashi);

  // Auto-detect current weekly parashah on mount and when date changes
  useEffect(() => {
    let isMounted = true;
    getCurrentParashaInfo(dateInfo.date || new Date()).then((info) => {
      if (isMounted) {
        setSelectedParashaId(info.id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [dateInfo.date]);

  // Keep today's aliyah card open when switching dates
  useEffect(() => {
    setOpenCardId(`this_a${todayAliyahNum}`);
  }, [todayAliyahNum, selectedParashaId]);

  // Load parashah data and last week's 7th aliyah
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      getParashaData(selectedParashaId),
      getPreviousParashaShviiAliyah(selectedParashaId),
    ]).then(([currentData, lastWeekShvii]) => {
      if (isMounted) {
        setParashaData(currentData);
        setPrevShviiInfo(lastWeekShvii);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedParashaId]);

  const isError = Boolean(parashaData.isError || !parashaData.aliyot || parashaData.aliyot.length === 0);

  // Check if today's aliyah is fully read
  const todayAliyahObj = !isError ? parashaData.aliyot.find((a) => a.aliyahNumber === todayAliyahNum) : undefined;
  const isTodayAliyahFinished =
    !isError &&
    todayAliyahObj &&
    todayAliyahObj.verses.length > 0 &&
    todayAliyahObj.verses.every((v) =>
      Boolean(readItemIds[`chumash_${parashaData.id}_a${todayAliyahNum}_v${v.number}`])
    );

  // Sync main app progress when today's aliyah is finished
  useEffect(() => {
    if (isTodayAliyahFinished && !isCompleted) {
      onToggleCompleted();
    }
  }, [isTodayAliyahFinished, isCompleted, onToggleCompleted]);

  // Check if any card is finished
  const isCardFinished = (card: DayCardItem) => {
    if (!card || card.verses.length === 0) return false;
    return card.verses.every((v) =>
      Boolean(readItemIds[`chumash_${card.parashaId}_a${card.aliyahNumber}_v${v.number}`])
    );
  };

  // Swiping a verse right: marks it AND all preceding verses in that card
  const handleSwipeRight = (card: DayCardItem, swipedVerseIndex: number) => {
    const swipedVerse = card.verses[swipedVerseIndex];
    if (!swipedVerse) return;

    // Auto-scroll back to top of the next verse smoothly
    requestAnimationFrame(() => {
      const containerElem = document.getElementById(`chumash_verses_${card.id}`);
      if (containerElem) {
        const yOffset = -90;
        const y =
          containerElem.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    });

    const batchIds: string[] = [];
    for (let i = 0; i <= swipedVerseIndex; i++) {
      const v = card.verses[i];
      const vid = `chumash_${card.parashaId}_a${card.aliyahNumber}_v${v.number}`;
      if (!readItemIds[vid]) {
        batchIds.push(vid);
      }
    }

    if (onMarkVersesBatch) {
      onMarkVersesBatch(batchIds);
    } else {
      batchIds.forEach((id) => onMarkItemRead(id));
    }

    // Check if all verses of this card are now finished
    const allVersesOfCardDone = card.verses.every(
      (v, idx) => idx <= swipedVerseIndex || Boolean(readItemIds[`chumash_${card.parashaId}_a${card.aliyahNumber}_v${v.number}`])
    );

    if (allVersesOfCardDone) {
      if (card.isToday) {
        if (onSetCompleted) {
          onSetCompleted(true);
        } else if (!isCompleted) {
          onToggleCompleted();
        }
      }

      // If it's today's aliyah (or today's card), immediately advance to next section (Tehillim)
      if (card.isToday && onAdvanceToNext) {
        setTimeout(() => {
          setOpenCardId(null);
          onAdvanceToNext();
        }, 300);
      }
    }
  };

  // White "סיימתי" button for a card: immediately closes that card
  const handleFinishCard = (card: DayCardItem) => {
    const batchIds = card.verses.map(
      (v) => `chumash_${card.parashaId}_a${card.aliyahNumber}_v${v.number}`
    );

    if (onMarkVersesBatch) {
      onMarkVersesBatch(batchIds);
    } else {
      batchIds.forEach((id) => onMarkItemRead(id));
    }

    if (card.isToday && !isCompleted) {
      onToggleCompleted();
    }

    // Immediately close that day's accordion as requested:
    // "כשאני לוחץ על סיימתי זה ישר סוגר את אותו היום"
    setOpenCardId(null);

    // Advance immediately to next section (Tehillim)
    if (onAdvanceToNext) {
      onAdvanceToNext();
    }
  };

  // Review / reset a card: resets verses AND cancels completed status in top menu
  const handleReviewAgain = (card: DayCardItem) => {
    const batchIds = card.verses.map(
      (v) => `chumash_${card.parashaId}_a${card.aliyahNumber}_v${v.number}`
    );
    batchIds.forEach((id) => {
      if (readItemIds[id]) {
        onMarkItemRead(id);
      }
    });

    if (card.isToday) {
      if (onSetCompleted) {
        onSetCompleted(false);
      } else if (isCompleted) {
        onToggleCompleted();
      }
    }
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

  // Zmanim for Friday candle lighting:
  const currentCity = getSavedCity() || DEFAULT_CITY;
  const isFriday = dateInfo.dayOfWeekIndex === 5;
  const candleLightingTime = isFriday
    ? getFridayCandleLighting(currentCity, dateInfo.date || new Date())
    : null;

  // As requested: "בחומש אפשרי להראות רק את אותו היום וכבר לא צריך להראות את הימים האחרים"
  // Show ONLY today's aliyah, no longer displaying previous days or last week!
  const todayAliyah = !isError && parashaData.aliyot && parashaData.aliyot.length > 0
    ? (parashaData.aliyot.find((a) => a.aliyahNumber === todayAliyahNum) || parashaData.aliyot[0])
    : null;

  const allCards: DayCardItem[] = todayAliyah
    ? [
        {
          id: `this_a${todayAliyah.aliyahNumber}`,
          parashaId: parashaData.id,
          parashaName: parashaData.name,
          aliyahNumber: todayAliyah.aliyahNumber,
          title: todayAliyah.dayOfWeek,
          badgeLabel: 'היום',
          rangeDescription: '',
          verses: todayAliyah.verses,
          isToday: true,
        },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title + Friday Shabbat candle lighting time right beside parasha name */}
      <div className="text-center py-2">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 font-torah tracking-wide">
            פרשת {parashaData.name}
          </h1>

          {/* Requirement 4: ביום שישי תשים ישר ליד איפה שכתוב פרשת נח או הפרשה של השבוע את זמני כניסת השבת לפי אותה העיר שלו */}
          {isFriday && candleLightingTime && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-sans text-xs sm:text-sm font-semibold shadow-2xs animate-in fade-in">
              <span>🕯️</span>
              <span>כניסת שבת: {candleLightingTime}</span>
              <span className="text-xs text-amber-800 font-normal">({currentCity.nameHe})</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading state if fetching dynamically */}
      {isLoading && (
        <div className="p-12 text-center text-stone-500 font-medium space-y-2">
          <div className="w-6 h-6 border-2 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>טוען את פסוקי הפרשה ופירוש רש״י...</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h3 className="text-xl font-bold text-red-900">שגיאה בטעינת הפרשה</h3>
          <p className="text-stone-700">
            {parashaData.errorMessage || 'לא ניתן היה לטעון את שיעור החומש עבור פרשה זו. אנא בדוק את החיבור לרשת ונסה שוב.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              getParashaData(selectedParashaId).then((data) => {
                setParashaData(data);
                setIsLoading(false);
              });
            }}
            className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-medium transition-colors"
          >
            נסה שוב
          </button>
        </div>
      )}

      {/* Days Accordion List */}
      {!isLoading && !isError && (
        <div className="space-y-3.5">
          {allCards.map((card) => {
            const isOpen = openCardId === card.id;
            const finished = isCardFinished(card);

            // Filter remaining (unswiped) verses
            const remainingVerses = card.verses.filter((v) => {
              const vid = `chumash_${card.parashaId}_a${card.aliyahNumber}_v${v.number}`;
              return !readItemIds[vid];
            });

            return (
              <div
                key={card.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  card.isToday
                    ? 'border-amber-300 ring-2 ring-amber-400/20'
                    : card.isPastLastWeekShabbat
                    ? 'border-stone-200 bg-stone-50/20'
                    : card.isUpcomingThisWeekShabbat
                    ? 'border-amber-200/90 bg-amber-50/10'
                    : 'border-stone-200/90 hover:border-stone-300'
                }`}
              >
                {/* Outer Header Bar: Day Name + Outside Status Indicator + Arrow */}
                <button
                  type="button"
                  onClick={() => setOpenCardId(isOpen ? null : card.id)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 text-right cursor-pointer bg-white hover:bg-stone-50/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Arrow to expand/collapse */}
                    <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 transition-transform">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>

                    {/* Day Title */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {card.badgeLabel && (
                          <span
                            className={`font-sans text-xs px-2 py-0.5 rounded-md font-bold ${
                              card.isToday
                                ? 'bg-amber-100 text-amber-900'
                                : card.isPastLastWeekShabbat
                                ? 'bg-stone-200 text-stone-700'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {card.badgeLabel}
                          </span>
                        )}
                        <span className="font-bold text-stone-900 font-torah text-lg md:text-xl">
                          {card.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Outside Status Indicator: "וגם שמתי סיימתי זה מסמן מבחוץ שסיימתי" */}
                  <div className="shrink-0 flex items-center gap-2">
                    {finished ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span>סיימתי ✓</span>
                      </span>
                    ) : (
                      <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
                        {remainingVerses.length} פסוקים
                      </span>
                    )}
                  </div>
                </button>

                {/* Collapsible Content: shown when open */}
                {isOpen && (
                  <div className="p-5 pt-2 border-t border-stone-100 bg-stone-50/40 space-y-4">
                    {/* Controls Bar: Rashi Toggle & White "סיימתי" Button */}
                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200/80">
                      <div className="text-xs text-stone-600 font-medium">
                        {remainingVerses.length > 0 ? (
                          <span>נותרו <strong>{remainingVerses.length}</strong> מתוך {card.verses.length} פסוקים</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">כל פסוקי העלייה נקראו בהצלחה ✓</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Rashi toggle */}
                        <button
                          type="button"
                          onClick={() => setShowRashi(!showRashi)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                            showRashi
                              ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-bold'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5 inline ml-1" />
                          <span>{showRashi ? 'הסתר רש״י' : 'הצג רש״י'}</span>
                        </button>

                        {/* White "סיימתי" Button: "הכפתור סיימתי צריך להיות בלבן רגיל ולא בשחור" */}
                        {!finished ? (
                          <button
                            type="button"
                            onClick={() => handleFinishCard(card)}
                            className="px-3.5 py-1.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />
                            <span>סיימתי</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReviewAgain(card)}
                            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>קרא שוב</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Completion card if all verses of this card have been swiped */}
                    {finished && (
                      <div className="p-6 text-center bg-white rounded-xl border border-emerald-200/90 shadow-2xs space-y-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <h4 className="font-bold text-stone-900 font-torah text-2xl">
                          אשריך !
                        </h4>
                      </div>
                    )}

                    {/* Verses List with disappearing swipe right & bolded Dibbur HaMaschil */}
                    {!finished && (
                      <div id={`chumash_verses_${card.id}`} className="space-y-3.5">
                        <AnimatePresence mode="popLayout">
                          {remainingVerses.map((verse) => {
                            const originalIndex = card.verses.findIndex(
                              (v) => v.number === verse.number
                            );

                            return (
                              <SwipeVerseCard
                                key={`${card.id}_${verse.number}`}
                                verse={verse}
                                verseIndex={originalIndex}
                                onSwipeRight={(idx) => handleSwipeRight(card, idx)}
                                showRashi={showRashi}
                                settings={settings}
                                getFontSizeClass={getFontSizeClass}
                              />
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
