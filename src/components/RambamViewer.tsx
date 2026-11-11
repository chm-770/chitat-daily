import React, { useState, useEffect, useRef } from 'react';
import { useJustCompleted } from '../hooks/useJustCompleted';
import { AnimatePresence } from 'motion/react';
import { HebrewDateInfo } from '../utils/hebrewCalendar';
import { StudySettings, RambamTrack } from '../types/chitas';
import { RambamDailyLesson, getRambamDailyLesson, getHebrewNumeral } from '../services/rambamService';
import { SwipeHalachaCard } from './SwipeHalachaCard';
import { CheckCircle2, RotateCcw, Settings2, Scale, Scroll, ExternalLink } from 'lucide-react';

interface RambamViewerProps {
  dateInfo: HebrewDateInfo;
  settings: StudySettings;
  onOpenSettings?: () => void;
  onUpdateTrack?: (track: RambamTrack) => void;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onSetCompleted?: (completed: boolean) => void;
  readItemIds: Record<string, boolean>;
  onMarkItemRead: (id: string) => void;
  onMarkBatch?: (ids: string[]) => void;
  onAdvanceToNext?: () => void;
}

export const RambamViewer: React.FC<RambamViewerProps> = ({
  dateInfo,
  settings,
  onOpenSettings,
  onUpdateTrack,
  isCompleted,
  onToggleCompleted,
  onSetCompleted,
  readItemIds,
  onMarkItemRead,
  onMarkBatch,
  onAdvanceToNext,
}) => {
  // The "אשריך" card is shown only right after finishing, not when coming back later
  const justCompleted = useJustCompleted(isCompleted);
  const track: RambamTrack = settings.rambamTrack || 'three_chapters';
  const [lesson, setLesson] = useState<RambamDailyLesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const rambamContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getRambamDailyLesson(dateInfo.date || new Date(), track, dateInfo).then((data) => {
      if (isMounted) {
        setLesson(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dateInfo.date, dateInfo.dayOfMonth, dateInfo.monthNumber, track]);

  // Flatten all halachot with their IDs
  const allHalachot = (lesson?.chapters || []).flatMap((ch, cIdx) =>
    ch.halachot.map((text, hIdx) => ({
      id: `rambam_${ch.id || cIdx}_h${hIdx}`,
      chapterId: ch.id || `${cIdx}`,
      chapterTitle: ch.chapterTitle,
      chapterHeRef: ch.heRef,
      halachaIndex: hIdx,
      halachaNumberStr: getHebrewNumeral(hIdx + 1),
      totalInChapter: ch.halachot.length,
      text,
    }))
  );

  const totalHalachotCount = allHalachot.length;
  const remainingHalachot = allHalachot.filter((h) => !readItemIds[h.id]);
  const isAllFinished = isCompleted || (totalHalachotCount > 0 && remainingHalachot.length === 0);

  // Handle swiping a halacha away: automatically completes all previous halachot up to this one
  const handleSwipeHalacha = (chapterId: string, swipedHalachaIndex: number) => {
    const swipedId = `rambam_${chapterId}_h${swipedHalachaIndex}`;
    const targetIdxInAll = allHalachot.findIndex((h) => h.id === swipedId);

    const batchIds: string[] = [];
    if (targetIdxInAll !== -1) {
      for (let i = 0; i <= targetIdxInAll; i++) {
        const hid = allHalachot[i].id;
        if (!readItemIds[hid]) {
          batchIds.push(hid);
        }
      }
    } else {
      for (let i = 0; i <= swipedHalachaIndex; i++) {
        const hid = `rambam_${chapterId}_h${i}`;
        if (!readItemIds[hid]) {
          batchIds.push(hid);
        }
      }
    }

    if (onMarkBatch) {
      onMarkBatch(batchIds);
    } else {
      batchIds.forEach((id) => onMarkItemRead(id));
    }

    // Auto-scroll back smoothly to top of the next halacha / container
    requestAnimationFrame(() => {
      if (rambamContainerRef.current) {
        const yOffset = -90;
        const y =
          rambamContainerRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    });

    // Check if this was the last remaining halacha in the daily lesson
    const remainingAfter = remainingHalachot.filter((h) => !batchIds.includes(h.id));
    if (remainingAfter.length === 0) {
      if (onSetCompleted) {
        onSetCompleted(true);
      } else if (!isCompleted) {
        onToggleCompleted();
      }
      if (onAdvanceToNext) {
        setTimeout(() => {
          onAdvanceToNext();
        }, 300);
      }
    }
  };

  // Mark all halachot as read via white "סיימתי" button
  const handleFinishAll = () => {
    allHalachot.forEach((h) => {
      if (!readItemIds[h.id]) {
        onMarkItemRead(h.id);
      }
    });

    if (onSetCompleted) {
      onSetCompleted(true);
    } else if (!isCompleted) {
      onToggleCompleted();
    }

    // Advance immediately to next section (Overview / celebration)
    if (onAdvanceToNext) {
      onAdvanceToNext();
    }
  };

  // Review / reset halachot
  const handleReviewAgain = () => {
    allHalachot.forEach((h) => {
      if (readItemIds[h.id]) {
        onMarkItemRead(h.id);
      }
    });

    if (onSetCompleted) {
      onSetCompleted(false);
    } else if (isCompleted) {
      onToggleCompleted();
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

  return (
    <div className="notranslate space-y-6 max-w-4xl mx-auto" translate="no">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-950 flex items-center justify-center font-bold text-lg shrink-0">
              רמב״ם
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                <span>תקנת הרמב״ם היומי</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-purple-900">
                  {lesson?.trackTitle || 'ג׳ פרקים ליום'}
                </span>
                <span aria-hidden="true">·</span>
                <span>יום {dateInfo.dayOfMonthHebrew} ב{dateInfo.monthName}</span>
              </div>
              <h1 className="text-2xl font-bold text-stone-900 font-torah">
                {track === 'sefer_hamitzvot' ? 'ספר המצוות להרמב״ם' : 'ספר משנה תורה – היד החזקה'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-200"
                title="שינוי מסלול רמב״ם (ג׳ פרקים / פרק אחד / ספר המצוות)"
              >
                <Settings2 className="w-3.5 h-3.5 text-stone-600" />
                <span>הגדרות מסלול</span>
              </button>
            )}

            {!isAllFinished ? (
              <button
                type="button"
                onClick={handleFinishAll}
                className="px-4 py-2 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />
                <span>סיימתי</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReviewAgain}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>קרא שוב</span>
              </button>
            )}
          </div>
        </div>

        {/* Track Selector Quick Tabs */}
        {onUpdateTrack && (
          <div className="pt-3 border-t border-stone-100 flex items-center justify-start gap-1.5 overflow-x-auto text-xs">
            <span className="text-stone-500 font-medium shrink-0 ml-1">מסלול לימוד:</span>
            {[
              { id: 'three_chapters', label: 'ג׳ פרקים ליום' },
              { id: 'one_chapter', label: 'פרק אחד ליום' },
              { id: 'sefer_hamitzvot', label: 'ספר המצוות' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdateTrack(t.id as RambamTrack)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  track === t.id
                    ? 'bg-purple-900 text-white shadow-2xs font-bold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="p-12 text-center text-stone-500 font-medium space-y-2">
          <div className="w-6 h-6 border-2 border-purple-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>טוען את פרקי הרמב״ם היומי לפי מורה השיעור השנתי...</p>
        </div>
      )}

      {!isLoading && lesson && (
        <div ref={rambamContainerRef} className="space-y-6">
          {lesson.errorMessage && (
            <div className="p-8 text-center bg-red-50/80 rounded-2xl border border-red-200 shadow-2xs space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                !
              </div>
              <p className="text-red-900 font-bold text-lg">{lesson.errorMessage}</p>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  getRambamDailyLesson(dateInfo.date || new Date(), track, dateInfo).then((res) => {
                    setLesson(res);
                    setIsLoading(false);
                  });
                }}
                className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl font-medium transition-colors"
              >
                נסה שוב
              </button>
            </div>
          )}

          {/* Completion Celebration Card */}
          {isAllFinished && lesson.chapters.length > 0 && (
            <div
              className={
                justCompleted
                  ? 'p-8 text-center bg-white rounded-2xl border border-emerald-300 shadow-2xs space-y-3'
                  : 'text-center'
              }
            >
              {justCompleted && (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h3 className="font-bold text-stone-900 font-torah text-3xl">אשריך !</h3>
                </>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReviewAgain}
                  className="px-4 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>קרא את שיעור הרמב״ם שוב</span>
                </button>
              </div>
            </div>
          )}

          {/* Chapters with Halachot cards */}
          {!isAllFinished &&
            lesson.chapters.map((chapter, cIdx) => {
              const chapterRemainingHalachot = chapter.halachot
                .map((text, hIdx) => ({
                  id: `rambam_${chapter.id || cIdx}_h${hIdx}`,
                  halachaIndex: hIdx,
                  halachaNumberStr: getHebrewNumeral(hIdx + 1),
                  text,
                }))
                .filter((h) => !readItemIds[h.id]);

              // If all halachot in this chapter are finished
              const isChapterDone = chapterRemainingHalachot.length === 0;

              return (
                <div
                  key={chapter.id || cIdx}
                  className="bg-white rounded-2xl border border-stone-200 p-5 md:p-7 shadow-xs space-y-5"
                >
                  {/* Chapter Header */}
                  <div className="border-b border-amber-900/10 pb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-950 flex items-center justify-center font-bold text-sm font-torah">
                        {(chapter.chapterTitle.match(/פרק ([א-ת״׳0-9]+)/) || [])[1] || getHebrewNumeral(cIdx + 1)}
                      </span>
                      <div>
                        <h2 className="font-bold text-stone-900 font-torah text-xl md:text-2xl">
                          {chapter.chapterTitle || chapter.heRef}
                        </h2>
                        <p className="text-xs text-stone-500 font-medium">
                          {chapter.heRef}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isChapterDone
                          ? 'bg-emerald-100 text-emerald-800 font-bold'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {isChapterDone
                        ? 'הפרק הושלם ✓'
                        : `נשארו ${chapterRemainingHalachot.length} מתוך ${chapter.halachot.length} ${
                            track === 'sefer_hamitzvot' ? 'מצות' : 'הלכות'
                          }`}
                    </span>
                  </div>

                  {/* Opening of a new set of Halachot (its mitzvot), as its own card before halacha 1 */}
                  {chapter.mitzvotIntro && (
                    <div className="bg-white border border-amber-300/80 p-6 md:p-7 rounded-2xl space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Scroll className="w-4 h-4 text-amber-800" />
                        <span>{chapter.heRef.replace(/\s*פרק\s+\S+$/, '')}</span>
                      </div>
                      {chapter.mitzvotIntro
                        .split(/\s*(?=וזה הוא פרטן)/)
                        .map((part, i) => (
                          <p
                            key={i}
                            className={`font-torah text-stone-900 font-medium ${getFontSizeClass()} text-justify leading-loose`}
                          >
                            {part}
                          </p>
                        ))}
                    </div>
                  )}

                  {/* Disappearing Halacha Cards on Swipe Right */}
                  {!isChapterDone ? (
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {chapterRemainingHalachot.map((h) => (
                          <SwipeHalachaCard
                            key={h.id}
                            id={h.id}
                            chapterTitle={chapter.chapterTitle}
                            halachaNumberStr={h.halachaNumberStr}
                            itemLabel={track === 'sefer_hamitzvot' ? 'מצוה' : 'הלכה'}
                            totalInChapter={chapter.halachot.length}
                            text={h.text}
                            fontSizeClass={getFontSizeClass()}
                            onSwipeRight={() => handleSwipeHalacha(chapter.id || `${cIdx}`, h.halachaIndex)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center text-xs text-emerald-800 font-medium">
                      כל הלכות פרק זה נקראו בהצלחה ✓
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
