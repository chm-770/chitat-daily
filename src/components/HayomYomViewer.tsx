import React from 'react';
import { CompletedBadge } from './CompletedBadge';
import { HebrewDateInfo } from '../utils/hebrewCalendar';
import { getHayomYomForHebrewDate, isAdarSectionHeading } from '../data/hayomYomDatabase';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { HDate } from '@hebcal/core';

// Chabadpedia month pages the Hayom Yom text was taken from
const CHABADPEDIA_MONTHS: Record<number, string> = {
  1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'מנחם אב', 6: 'אלול', 7: 'תשרי',
  8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: "אדר א'", 13: "אדר ב'",
};

function chabadpediaMonthUrl(month: number, dateInfo: HebrewDateInfo): string {
  let name = CHABADPEDIA_MONTHS[month] || 'תשרי';
  if (month === 12 && dateInfo.date && !new HDate(dateInfo.date).isLeapYear()) name = 'אדר';
  return `https://chabadpedia.co.il/wiki/${encodeURI('חב"דפדיה:היום_יום/' + name.replace(/ /g, '_'))}`;
}

interface HayomYomViewerProps {
  dateInfo: HebrewDateInfo;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onSetCompleted?: (completed: boolean) => void;
  readItemIds: Record<string, boolean>;
  onMarkItemRead: (id: string) => void;
  onAdvanceToNext?: () => void;
}

export const HayomYomViewer: React.FC<HayomYomViewerProps> = ({
  dateInfo,
  isCompleted,
  onToggleCompleted,
  onSetCompleted,
  onAdvanceToNext,
}) => {
  const day = dateInfo.dayOfMonth || 2;
  const month = dateInfo.monthNumber || 8;
  const entry = getHayomYomForHebrewDate(day, month, dateInfo);

  const handleFinish = () => {
    if (onSetCompleted) {
      onSetCompleted(true);
    } else if (!isCompleted) {
      onToggleCompleted();
    }

    // Advance immediately to next section (Rambam)
    if (onAdvanceToNext) {
      setTimeout(() => {
        onAdvanceToNext();
      }, 250);
    }
  };

  const handleToggle = () => {
    if (isCompleted) {
      if (onSetCompleted) onSetCompleted(false);
      else onToggleCompleted();
    } else {
      handleFinish();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-bold text-lg shrink-0">
              יוֹם
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>לוח הַיּוֹם יוֹם</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-amber-900">{entry.hebrewDate}</span>
                {entry.dayTitle && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-600 font-medium">{entry.dayTitle}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 font-torah">
                ספר ״היום יום״ – לוח יומי
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isCompleted ? (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-2 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />
                <span>סיימתי</span>
              </button>
            ) : (
              <>
              <CompletedBadge />
              <button
                type="button"
                onClick={handleToggle}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>קרא שוב</span>
              </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {/* Main Single Card ("בכל ריבוע טקסט אחד ולא כמה שונים") */}
      <div className="bg-white rounded-2xl border border-amber-300/80 p-6 md:p-8 shadow-xs space-y-6">
        <div className="space-y-5">
          <div className="border-b border-amber-900/10 pb-3 flex items-center justify-between gap-3">
            <h2 className="font-torah font-bold text-2xl text-amber-950">
              ליום {entry.hebrewDate}
              {entry.dayTitle && ` – ${entry.dayTitle}`}
            </h2>
            <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              שיעור יומי
            </span>
          </div>

          {/* Unified single text box for all paragraphs */}
          <div className="p-6 md:p-8 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-4">
            {entry.text.map((paragraph, idx) => {
              if (isAdarSectionHeading(paragraph)) {
                return (
                  <h3
                    key={idx}
                    className={`font-torah font-bold text-xl md:text-2xl text-amber-950 ${
                      idx > 0 ? 'pt-4 border-t border-amber-300/80' : ''
                    }`}
                  >
                    {paragraph}
                  </h3>
                );
              }
              if (paragraph.trim() === 'תרגום לעברית:' || paragraph.trim() === 'תרגום לעברית') {
                return (
                  <div key={idx} className="my-5 pt-3 border-t border-amber-300/80 flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-200 text-amber-950 font-bold text-sm md:text-base rounded-md shadow-2xs">
                      תרגום לעברית:
                    </span>
                  </div>
                );
              }
              return (
                <p
                  key={idx}
                  className="font-torah text-stone-900 font-medium text-xl md:text-2xl leading-loose text-justify"
                  dir="rtl"
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Bottom advance button */}
          {!isCompleted && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2.5 text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>סיימתי את ״היום יום״ – המשך לרמב״ם</span>
              </button>
            </div>
          )}
        </div>

        {/* Attribution Footer */}
        <div className="flex items-center justify-between pt-3 text-xs text-stone-500 font-medium border-t border-amber-900/10">
          <span>ספר ״היום יום״</span>
          <span className="text-left">
            מקור:{' '}
            <a
              href={chabadpediaMonthUrl(month, dateInfo)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 hover:text-amber-950 underline font-medium"
            >
              חב״דפדיה
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
