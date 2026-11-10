import React, { useState, useEffect, useMemo } from 'react';
import { StudyCategory, DailyProgress, DailyStudyKey, RambamTrack } from '../types/chitas';
import { HebrewDateInfo } from '../utils/hebrewCalendar';
import { BookOpen, Scroll, BookMarked, Sun, Scale, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import { getSavedCity, DEFAULT_CITY, getFridayCandleLighting } from '../services/zmanimService';
import { getTanyaDailyPortion } from '../services/tanyaService';

interface DailyOverviewProps {
  dateInfo: HebrewDateInfo;
  progress: DailyProgress;
  onToggleProgress: (key: DailyStudyKey) => void;
  onSelectCategory: (cat: StudyCategory) => void;
  streakDays?: number;
  rambamTrack?: RambamTrack;
}

const RAMBAM_TRACK_LABELS: Record<RambamTrack, string> = {
  three_chapters: 'ג׳ פרקים ליום',
  one_chapter: 'פרק אחד ליום',
  sefer_hamitzvot: 'ספר המצוות',
};

export const DailyOverview: React.FC<DailyOverviewProps> = ({
  dateInfo,
  progress,
  onToggleProgress,
  onSelectCategory,
  rambamTrack = 'three_chapters',
}) => {
  const [tanyaSubtitle, setTanyaSubtitle] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const targetDate = dateInfo.date || new Date();

    getTanyaDailyPortion(targetDate).then((tp) => {
      if (isMounted && tp) {
        setTanyaSubtitle(tp.chapter);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [dateInfo.date]);

  const completedCount = [
    progress.chumash,
    progress.tehillim,
    progress.tanya,
    progress.hayomYom,
    progress.rambam,
  ].filter(Boolean).length;

  const progressPercent = Math.round((completedCount / 5) * 100);

  const studyCards: {
    id: StudyCategory;
    key: DailyStudyKey;
    letter: string;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    color: string;
    badgeColor: string;
  }[] = [
    {
      id: 'chumash',
      key: 'chumash',
      letter: 'ח׳',
      title: 'חומש עם רש״י',
      subtitle: `פרשת ${dateInfo.parashaName} · ${dateInfo.chumashAliyahName}`,
      description: 'שיעור החומש היומי עם פירוש רש״י הקדוש, מחולק לפי ימי השבוע מעלייה לעלייה.',
      icon: Scroll,
      color: 'border-amber-200 bg-amber-50/70 text-amber-900',
      badgeColor: 'text-amber-800 bg-amber-100',
    },
    {
      id: 'tehillim',
      key: 'tehillim',
      letter: 'ת׳',
      title: 'תהילים יומי',
      subtitle: `ליום ${dateInfo.dayOfMonthHebrew} בחודש · ${dateInfo.tehillimMonthlyPortion}`,
      description: 'אמירת מזמורי התהילים לפי חלוקת ימי החודש. מסיים את כל ספר תהילים בכל חודש עברי.',
      icon: BookMarked,
      color: 'border-blue-200 bg-blue-50/60 text-blue-950',
      badgeColor: 'text-blue-800 bg-blue-100',
    },
    {
      id: 'tanya',
      key: 'tanya',
      letter: 'ת׳',
      title: 'תניא קדישא',
      subtitle: tanyaSubtitle || dateInfo.tanyaPortionName,
      description: 'ספר היסוד של חסידות חב״ד שחיבר אדמו״ר הזקן, מחולק ללימוד יומי לאורך השנה.',
      icon: BookOpen,
      color: 'border-emerald-200 bg-emerald-50/60 text-emerald-950',
      badgeColor: 'text-emerald-800 bg-emerald-100',
    },
    {
      id: 'hayom_yom',
      key: 'hayomYom',
      letter: 'היום',
      title: 'היום יום',
      subtitle: `פתגם והוראה ליום ${dateInfo.dayOfMonthHebrew} ב${dateInfo.monthName}`,
      description: 'לוח יומי שערך הרבי מליובאוויטש עם פתגם חסידי, מנהג יומי והדרכה מעשית.',
      icon: Sun,
      color: 'border-orange-200 bg-orange-50/60 text-orange-950',
      badgeColor: 'text-orange-800 bg-orange-100',
    },
    {
      id: 'rambam',
      key: 'rambam',
      letter: 'רמב״ם',
      title: 'הרמב״ם היומי',
      // Only the chosen track; the day's chapters are shown inside the Rambam page
      subtitle: RAMBAM_TRACK_LABELS[rambamTrack] || RAMBAM_TRACK_LABELS.three_chapters,
      description: 'תקנת הרמב״ם היומי של הרבי לאיחוד כל עם ישראל בלימוד כל התורה כולה ביד החזקה.',
      icon: Scale,
      color: 'border-purple-200 bg-purple-50/60 text-purple-950',
      badgeColor: 'text-purple-800 bg-purple-100',
    },
  ];

  const getNextStudy = (): { category: StudyCategory; label: string } => {
    if (!progress.chumash) {
      return { category: 'chumash', label: 'התחל לימוד חומש' };
    }
    if (!progress.tehillim) {
      return { category: 'tehillim', label: 'המשך לתהילים' };
    }
    if (!progress.tanya) {
      return { category: 'tanya', label: 'המשך לתניא' };
    }
    if (!progress.hayomYom) {
      return { category: 'hayom_yom', label: 'המשך להיום יום' };
    }
    if (!progress.rambam) {
      return { category: 'rambam', label: 'המשך לרמב״ם' };
    }
    return { category: 'chumash', label: 'הושלם הלימוד היומי ✓' };
  };

  const nextStudy = getNextStudy();

  const currentCity = getSavedCity() || DEFAULT_CITY;
  const isFriday = dateInfo.dayOfWeekIndex === 5;
  const candleLightingTime = useMemo(() => {
    if (!isFriday) return null;
    return getFridayCandleLighting(currentCity, dateInfo.date || new Date());
  }, [isFriday, currentCity, dateInfo.date]);

  return (
    <div className="space-y-8">
      {/* Hero Banner: Hebrew Date & Parashat Hashavua without lengthy explanation */}
      <div className="relative rounded-2xl bg-gradient-to-br from-amber-100/70 via-stone-100/90 to-amber-50 p-6 md:p-8 border border-amber-900/10 shadow-sm overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-1.5">
            <div className="text-stone-600 font-medium text-sm md:text-base">
              {dateInfo.dayOfWeekHebrew}, {dateInfo.dayOfMonthHebrew} ב{dateInfo.monthName} {dateInfo.yearHebrew}
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-amber-950 font-torah">
                פרשת {dateInfo.parashaName}
              </h1>

              {/* On Friday: display Shabbat candle lighting time right beside the Parashah name! */}
              {isFriday && candleLightingTime && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-200/90 text-amber-950 border border-amber-300 font-sans text-xs sm:text-sm font-semibold shadow-2xs">
                  <span>🕯️</span>
                  <span>כניסת שבת: {candleLightingTime}</span>
                  <span className="text-xs text-amber-800 font-normal">({currentCity.nameHe})</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Progress Bar & Smart Next Study Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-amber-900/10">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-stone-700">
                <span>התקדמות הלימוד היומי</span>
                <span className="tabular-nums font-bold text-amber-950">{completedCount} מתוך 5 שיעורים ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-700 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Smart Next Study button */}
              <button
                onClick={() => onSelectCategory(nextStudy.category)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-950 hover:bg-amber-900 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>{nextStudy.label}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Daily Study Pillar Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-torah">שיעורי היום</h2>
          <p className="text-xs text-stone-500">לחץ לפתיחת השיעור המלא או סמן וי בתיבה להשלמה</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyCards.map((card) => {
            const isCompleted = progress[card.key];
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => onSelectCategory(card.id)}
                className={`relative rounded-xl p-5 border transition-all duration-200 bg-white shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer ${
                  isCompleted ? 'border-emerald-300/80 bg-emerald-50/20' : 'border-stone-200 hover:border-amber-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${card.badgeColor}`}>
                        {card.letter}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 font-torah text-lg leading-tight">
                          {card.title}
                        </h3>
                        <p className="text-xs text-amber-900/80 font-medium line-clamp-1">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Completion Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleProgress(card.key);
                      }}
                      title={isCompleted ? 'סמן כלא הושלם' : 'סמן כהושלם'}
                      className="p-1 rounded-md hover:bg-stone-100 transition-colors text-stone-400 hover:text-emerald-700 cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-6 h-6 hover:text-stone-600" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500 font-medium">
                    {isCompleted ? '✓ הושלם היום' : 'טרם הושלם'}
                  </span>

                  <button
                    onClick={() => onSelectCategory(card.id)}
                    className="text-xs font-semibold text-amber-950 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>קרא שיעור</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
