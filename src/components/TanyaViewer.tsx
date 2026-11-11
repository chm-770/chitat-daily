import React, { useState, useEffect } from 'react';
import { useJustCompleted } from '../hooks/useJustCompleted';
import { motion, PanInfo } from 'motion/react';
import { HebrewDateInfo } from '../utils/hebrewCalendar';
import { StudySettings } from '../types/chitas';
import { TanyaDailyPortion, getTanyaDailyPortion } from '../services/tanyaService';
import { CheckCircle2, RotateCcw, Check, ArrowRight } from 'lucide-react';

interface TanyaViewerProps {
  dateInfo: HebrewDateInfo;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onSetCompleted?: (completed: boolean) => void;
  settings: StudySettings;
  readItemIds: Record<string, boolean>;
  onMarkItemRead: (id: string) => void;
  onAdvanceToNext?: () => void;
}

export const TanyaViewer: React.FC<TanyaViewerProps> = ({
  dateInfo,
  isCompleted,
  onToggleCompleted,
  onSetCompleted,
  settings,
  readItemIds,
  onMarkItemRead,
  onAdvanceToNext,
}) => {
  // The "אשריך" card is shown only right after finishing, not when coming back later
  const justCompleted = useJustCompleted(isCompleted);
  const [portion, setPortion] = useState<TanyaDailyPortion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const dateId = dateInfo.date ? dateInfo.date.toISOString().slice(0, 10) : 'today';
  const tanyaCardItemId = `tanya_card_${dateId}`;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getTanyaDailyPortion(dateInfo.date || new Date()).then((data) => {
      if (isMounted) {
        setPortion(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dateInfo.date]);

  const isCardRead = Boolean(readItemIds[tanyaCardItemId]);
  const isFinished = isCompleted || isCardRead;

  const handleFinish = () => {
    onMarkItemRead(tanyaCardItemId);

    if (onSetCompleted) {
      onSetCompleted(true);
    } else if (!isCompleted) {
      onToggleCompleted();
    }

    // Immediately advance to next section (Hayom Yom)
    if (onAdvanceToNext) {
      setTimeout(() => {
        onAdvanceToNext();
      }, 250);
    }
  };

  const handleReviewAgain = () => {
    if (onSetCompleted) {
      onSetCompleted(false);
    } else if (isCompleted) {
      onToggleCompleted();
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 350) {
      handleFinish();
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
        return 'text-xl md:text-2xl leading-loose';
    }
  };

  return (
    <div className="notranslate space-y-6 max-w-4xl mx-auto" translate="no">
      {/* Top Banner & Daily Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-950 flex items-center justify-center font-bold text-lg shrink-0">
              תנ׳
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>תניא היומי</span>
                <span aria-hidden="true">·</span>
                <span>{portion?.bookPart || 'ספר התניא'}</span>
                {portion?.dateHebrew && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-900">{portion.dateHebrew}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl font-bold text-stone-900 font-torah">
                {portion?.chapter || 'שיעור התניא היומי'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isFinished ? (
              <button
                type="button"
                onClick={handleFinish}
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
      </div>

      {isLoading && (
        <div className="p-12 text-center text-stone-500 font-medium space-y-2 bg-white rounded-2xl border border-stone-200">
          <div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>טוען את שיעור התניא היומי המדויק ל{dateInfo.dayOfMonthHebrew} ב{dateInfo.monthName}...</p>
        </div>
      )}

      {!isLoading && portion && (
        <div className="space-y-4">
          {/* Completed State Card */}
          {isFinished && justCompleted && (
            <div className="p-6 text-center bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-bold text-stone-900 font-torah text-2xl">
                אשריך! סיימת את שיעור התניא היומי
              </h3>
              <p className="text-xs text-stone-600">
                השיעור סומן כהושלם. לחץ ״קרא שוב״ למעלה במידה שברצונך לחזור על הלימוד.
              </p>
            </div>
          )}

          {/* Unified Single Card for Tanya Daily Study ("בריבוע טקסט אחד ולא כמה שונים") */}
          <div className="relative overflow-hidden rounded-2xl select-none shadow-xs">
            {/* Background reveal on swipe */}
            <div className="absolute inset-0 bg-emerald-600 flex items-center justify-start px-6 rounded-2xl">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>הושלם ✓</span>
              </div>
            </div>

            {/* Draggable Foreground Single Unified Card */}
            <motion.div
              drag={!isFinished ? 'x' : false}
              dragDirectionLock
              dragConstraints={{ left: 0, right: 260 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              className={`relative z-10 bg-white border border-stone-200/90 hover:border-emerald-300 p-6 md:p-8 rounded-2xl transition-colors ${
                !isFinished ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
            >
              <div className="space-y-6">
                {/* Header inside the card */}
                <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950 font-torah text-sm bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {portion.bookPart}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {portion.dateHebrew}
                    </span>
                  </div>

                  {!isFinished && (
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 border border-stone-200 transition-colors cursor-pointer"
                    >
                      <span>סיימתי קריאה</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700" />
                    </button>
                  )}
                </div>

                {/* Complete daily text flowing together inside the single box */}
                <div className="space-y-4" dir="rtl">
                  {portion.paragraphs.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className={`font-torah text-stone-900 font-medium ${getFontSizeClass()} text-justify leading-loose`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Source attribution link */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-sans">ספר התניא קדישא – שיעור יומי</span>
                  <a
                    href="https://he.chabad.org/dailystudy/tanya.asp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 underline font-medium"
                  >
                    מקור השיעור ב-he.chabad.org
                  </a>
                </div>

                {/* Bottom finish button */}
                {!isFinished && (
                  <div className="pt-4 border-t border-stone-100 flex justify-end">
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>סיימתי את התניא היומי – המשך להיום יום</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};
