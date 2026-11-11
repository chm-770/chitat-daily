import React, { useState, useEffect, useMemo } from 'react';
import { StudyCategory, DailyProgress, DailyStudyKey, RambamTrack } from '../types/chitas';
import { ALL_LESSONS, enabledLessonKeys } from '../utils/lessons';
import { HebrewDateInfo } from '../utils/hebrewCalendar';
import { BookOpen, Scroll, BookMarked, Sun, Scale, CheckCircle2, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import { getSavedCity, DEFAULT_CITY, getFridayCandleLighting, getShabbatEndTime } from '../services/zmanimService';
import { getTanyaDailyPortion } from '../services/tanyaService';
import { localeOf, useLang, useStrings } from '../i18n';
import { cityDisplayName } from './CityPicker';

interface DailyOverviewProps {
  dateInfo: HebrewDateInfo;
  progress: DailyProgress;
  onToggleProgress: (key: DailyStudyKey) => void;
  onSelectCategory: (cat: StudyCategory) => void;
  streakDays?: number;
  rambamTrack?: RambamTrack;
  enabledLessons?: DailyStudyKey[];
  /** Friday, Shnayim Mikra turned on */
  showShnayimMikra?: boolean;
}

const SM_STRINGS = {
  he: { title: 'שניים מקרא ואחד תרגום', text: 'ערב שבת: כל הפרשה, מקרא פעמיים ותרגום אונקלוס.' },
  en: { title: "Shnayim Mikra ve'Echad Targum", text: 'Erev Shabbat: the whole parasha, the verse twice and Targum Onkelos.' },
  fr: { title: 'Chnayim Mikra véé\'had Targoum', text: 'Veille de Chabbat : toute la Paracha, le verset deux fois et le Targoum Onkelos.' },
};

/** Hebrew text (names, dates) kept right-to-left inside an English / French sentence. */
const He: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <bdi dir="rtl" lang="he">
    {children}
  </bdi>
);

const STRINGS = {
  he: {
    rambamTracks: {
      three_chapters: 'ג׳ פרקים ליום',
      one_chapter: 'פרק אחד ליום',
      sefer_hamitzvot: 'ספר המצוות',
    } as Record<RambamTrack, string>,
    chumashTitle: 'חומש עם רש״י',
    chumashSubtitle: (parasha: string, aliyah: string): React.ReactNode => `פרשת ${parasha} · ${aliyah}`,
    chumashDesc: 'שיעור החומש היומי עם פירוש רש״י הקדוש, מחולק לפי ימי השבוע מעלייה לעלייה.',
    tehillimTitle: 'תהילים יומי',
    tehillimSubtitle: (day: string, portion: string): React.ReactNode => `ליום ${day} בחודש · ${portion}`,
    tehillimDesc: 'אמירת מזמורי התהילים לפי חלוקת ימי החודש. מסיים את כל ספר תהילים בכל חודש עברי.',
    tanyaTitle: 'תניא קדישא',
    tanyaDesc: 'ספר היסוד של חסידות חב״ד שחיבר אדמו״ר הזקן, מחולק ללימוד יומי לאורך השנה.',
    hayomYomTitle: 'היום יום',
    hayomYomSubtitle: (day: string, month: string): React.ReactNode => `פתגם והוראה ליום ${day} ב${month}`,
    hayomYomDesc: 'לוח יומי שערך הרבי מליובאוויטש עם פתגם חסידי, מנהג יומי והדרכה מעשית.',
    rambamTitle: 'הרמב״ם היומי',
    rambamDesc: 'תקנת הרמב״ם היומי של הרבי לאיחוד כל עם ישראל בלימוד כל התורה כולה ביד החזקה.',
    next: {
      chumash: 'התחל לימוד חומש',
      tehillim: 'המשך לתהילים',
      tanya: 'המשך לתניא',
      hayomYom: 'המשך להיום יום',
      rambam: 'המשך לרמב״ם',
    } as Record<DailyStudyKey, string>,
    allDone: 'הושלם הלימוד היומי ✓',
    parashaPrefix: 'פרשת',
    candles: 'כניסת שבת:',
    shabbatEnds: 'צאת שבת:',
    progress: 'התקדמות הלימוד היומי',
    progressCount: (done: number, total: number, percent: number) => `${done} מתוך ${total} שיעורים (${percent}%)`,
    todayLessons: 'שיעורי היום',
    todayHint: 'לחץ לפתיחת השיעור המלא או סמן וי בתיבה להשלמה',
    markNotDone: 'סמן כלא הושלם',
    markDone: 'סמן כהושלם',
    completedToday: '✓ הושלם היום',
    notCompleted: 'טרם הושלם',
    read: 'קרא שיעור',
  },
  en: {
    rambamTracks: {
      three_chapters: '3 chapters a day',
      one_chapter: '1 chapter a day',
      sefer_hamitzvot: 'Sefer HaMitzvot',
    } as Record<RambamTrack, string>,
    chumashTitle: 'Chumash with Rashi',
    chumashSubtitle: (parasha: string, aliyah: string) => (
      <>
        Parashat <He>{parasha}</He> · <He>{aliyah}</He>
      </>
    ),
    chumashDesc: 'The daily Chumash portion with Rashi’s commentary, divided by the days of the week, one aliyah a day.',
    tehillimTitle: 'Daily Tehillim',
    tehillimSubtitle: (day: string, portion: string) => (
      <>
        Day <He>{day}</He> of the month · <He>{portion}</He>
      </>
    ),
    tehillimDesc: 'The psalms divided by the days of the month, completing the whole book of Tehillim every Hebrew month.',
    tanyaTitle: 'Tanya',
    tanyaDesc: 'The foundational work of Chabad Chassidut by the Alter Rebbe, divided into daily lessons over the year.',
    hayomYomTitle: 'Hayom Yom',
    hayomYomSubtitle: (day: string, month: string) => (
      <>
        Saying and directive for <He>{day} ב{month}</He>
      </>
    ),
    hayomYomDesc: 'A daily calendar compiled by the Lubavitcher Rebbe, with a Chassidic saying, a custom and practical guidance.',
    rambamTitle: 'Daily Rambam',
    rambamDesc: 'The Rebbe’s daily Rambam study, uniting all of Israel in learning the whole Torah through the Mishneh Torah.',
    next: {
      chumash: 'Start with Chumash',
      tehillim: 'Continue to Tehillim',
      tanya: 'Continue to Tanya',
      hayomYom: 'Continue to Hayom Yom',
      rambam: 'Continue to Rambam',
    } as Record<DailyStudyKey, string>,
    allDone: 'Today’s study is complete ✓',
    parashaPrefix: 'Parashat',
    candles: 'Candle lighting:',
    shabbatEnds: 'Shabbat ends:',
    progress: 'Today’s progress',
    progressCount: (done: number, total: number, percent: number) => `${done} of ${total} lessons (${percent}%)`,
    todayLessons: 'Today’s lessons',
    todayHint: 'Tap to open the full lesson, or tick the box to mark it as done',
    markNotDone: 'Mark as not done',
    markDone: 'Mark as done',
    completedToday: '✓ Done today',
    notCompleted: 'Not done yet',
    read: 'Read lesson',
  },
  fr: {
    rambamTracks: {
      three_chapters: '3 chapitres par jour',
      one_chapter: '1 chapitre par jour',
      sefer_hamitzvot: 'Séfer Hamitsvot',
    } as Record<RambamTrack, string>,
    chumashTitle: '\'Houmach avec Rachi',
    chumashSubtitle: (parasha: string, aliyah: string) => (
      <>
        Paracha <He>{parasha}</He> · <He>{aliyah}</He>
      </>
    ),
    chumashDesc: 'La portion quotidienne du \'Houmach avec le commentaire de Rachi, une montée (aliya) par jour de la semaine.',
    tehillimTitle: 'Téhilim du jour',
    tehillimSubtitle: (day: string, portion: string) => (
      <>
        <He>{day}</He> du mois · <He>{portion}</He>
      </>
    ),
    tehillimDesc: 'Les psaumes répartis selon les jours du mois, pour terminer tout le livre des Téhilim chaque mois hébraïque.',
    tanyaTitle: 'Tanya',
    tanyaDesc: 'L’ouvrage fondamental de la \'Hassidout Habad, écrit par l’Admour Hazaken, réparti en leçons quotidiennes sur l’année.',
    hayomYomTitle: 'Hayom Yom',
    hayomYomSubtitle: (day: string, month: string) => (
      <>
        Maxime et directive du <He>{day} ב{month}</He>
      </>
    ),
    hayomYomDesc: 'Un calendrier quotidien établi par le Rabbi de Loubavitch : une maxime \'hassidique, une coutume et un conseil pratique.',
    rambamTitle: 'Rambam du jour',
    rambamDesc: 'L’étude quotidienne du Rambam instituée par le Rabbi, pour unir tout le peuple juif dans l’étude de toute la Torah.',
    next: {
      chumash: 'Commencer par le \'Houmach',
      tehillim: 'Continuer : Téhilim',
      tanya: 'Continuer : Tanya',
      hayomYom: 'Continuer : Hayom Yom',
      rambam: 'Continuer : Rambam',
    } as Record<DailyStudyKey, string>,
    allDone: 'Étude du jour terminée ✓',
    parashaPrefix: 'Paracha',
    candles: 'Entrée de Chabbat :',
    shabbatEnds: 'Sortie de Chabbat :',
    progress: 'Progression du jour',
    progressCount: (done: number, total: number, percent: number) => `${done} sur ${total} leçons (${percent} %)`,
    todayLessons: 'Les leçons du jour',
    todayHint: 'Touchez pour ouvrir la leçon complète, ou cochez la case pour la marquer comme terminée',
    markNotDone: 'Marquer comme non terminé',
    markDone: 'Marquer comme terminé',
    completedToday: '✓ Terminé aujourd’hui',
    notCompleted: 'Pas encore terminé',
    read: 'Lire la leçon',
  },
};

export const DailyOverview: React.FC<DailyOverviewProps> = ({
  dateInfo,
  progress,
  onToggleProgress,
  onSelectCategory,
  rambamTrack = 'three_chapters',
  enabledLessons,
  showShnayimMikra = false,
}) => {
  const lessonKeys = enabledLessonKeys(enabledLessons);
  const s = useStrings(STRINGS);
  const sm = useStrings(SM_STRINGS);
  const lang = useLang();
  const isHe = lang === 'he';
  // Arrow pointing forward (left in Hebrew, right in English / French)
  const ForwardArrow = isHe ? ArrowLeft : ArrowRight;
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

  const completedCount = lessonKeys.filter((k) => Boolean(progress[k])).length;
  const totalLessons = lessonKeys.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const studyCards: {
    id: StudyCategory;
    key: DailyStudyKey;
    letter: string;
    title: string;
    subtitle: React.ReactNode;
    description: string;
    icon: any;
    color: string;
    badgeColor: string;
  }[] = [
    {
      id: 'chumash',
      key: 'chumash',
      letter: 'ח׳',
      title: s.chumashTitle,
      subtitle: s.chumashSubtitle(dateInfo.parashaName, dateInfo.chumashAliyahName),
      description: s.chumashDesc,
      icon: Scroll,
      color: 'border-amber-200 bg-amber-50/70 text-amber-900',
      badgeColor: 'text-amber-800 bg-amber-100',
    },
    {
      id: 'tehillim',
      key: 'tehillim',
      letter: 'ת׳',
      title: s.tehillimTitle,
      subtitle: s.tehillimSubtitle(dateInfo.dayOfMonthHebrew, dateInfo.tehillimMonthlyPortion),
      description: s.tehillimDesc,
      icon: BookMarked,
      color: 'border-blue-200 bg-blue-50/60 text-blue-950',
      badgeColor: 'text-blue-800 bg-blue-100',
    },
    {
      id: 'tanya',
      key: 'tanya',
      letter: 'ת׳',
      title: s.tanyaTitle,
      subtitle: isHe ? tanyaSubtitle || dateInfo.tanyaPortionName : <He>{tanyaSubtitle || dateInfo.tanyaPortionName}</He>,
      description: s.tanyaDesc,
      icon: BookOpen,
      color: 'border-emerald-200 bg-emerald-50/60 text-emerald-950',
      badgeColor: 'text-emerald-800 bg-emerald-100',
    },
    {
      id: 'hayom_yom',
      key: 'hayomYom',
      letter: 'היום',
      title: s.hayomYomTitle,
      subtitle: s.hayomYomSubtitle(dateInfo.dayOfMonthHebrew, dateInfo.monthName),
      description: s.hayomYomDesc,
      icon: Sun,
      color: 'border-orange-200 bg-orange-50/60 text-orange-950',
      badgeColor: 'text-orange-800 bg-orange-100',
    },
    {
      id: 'rambam',
      key: 'rambam',
      letter: 'רמב״ם',
      title: s.rambamTitle,
      // Only the chosen track; the day's chapters are shown inside the Rambam page
      subtitle: s.rambamTracks[rambamTrack] || s.rambamTracks.three_chapters,
      description: s.rambamDesc,
      icon: Scale,
      color: 'border-purple-200 bg-purple-50/60 text-purple-950',
      badgeColor: 'text-purple-800 bg-purple-100',
    },
  ];

  const NEXT_LABELS = s.next;
  const getNextStudy = (): { category: StudyCategory; label: string } => {
    const next = ALL_LESSONS.find((l) => lessonKeys.includes(l.key) && !progress[l.key]);
    if (next) return { category: next.category, label: NEXT_LABELS[next.key] };
    const first = ALL_LESSONS.find((l) => lessonKeys.includes(l.key)) || ALL_LESSONS[0];
    return { category: first.category, label: s.allDone };
  };

  const nextStudy = getNextStudy();

  const currentCity = getSavedCity() || DEFAULT_CITY;
  const isFriday = dateInfo.dayOfWeekIndex === 5;
  const shabbatEndTime = isFriday ? getShabbatEndTime(currentCity, dateInfo.date || new Date()) : null;
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
              {isHe ? (
                <>
                  {dateInfo.dayOfWeekHebrew}, {dateInfo.dayOfMonthHebrew} ב{dateInfo.monthName} {dateInfo.yearHebrew}
                </>
              ) : (
                <>
                  {/* English / French: the Gregorian date, then the Hebrew date (in Hebrew) */}
                  {(dateInfo.date || new Date()).toLocaleDateString(localeOf(lang), {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {' · '}
                  <He>
                    {dateInfo.dayOfMonthHebrew} ב{dateInfo.monthName} {dateInfo.yearHebrew}
                  </He>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-amber-950 font-torah">
                {isHe ? (
                  <>פרשת {dateInfo.parashaName}</>
                ) : (
                  <>
                    {s.parashaPrefix} <He>{dateInfo.parashaName}</He>
                  </>
                )}
              </h1>

              {/* On Friday: display Shabbat candle lighting time right beside the Parashah name! */}
              {isFriday && candleLightingTime && (
                <div className="inline-flex flex-col items-start gap-0.5 px-3 py-1.5 rounded-xl bg-amber-200/90 text-amber-950 border border-amber-300 font-sans text-xs sm:text-sm font-semibold shadow-2xs">
                  <span className="flex items-center gap-1.5">
                    <span>🕯️</span>
                    <span>{s.candles} {candleLightingTime}</span>
                    <span className="text-xs text-amber-800 font-normal">({cityDisplayName(currentCity, lang)})</span>
                  </span>
                  {shabbatEndTime && (
                    <span className="flex items-center gap-1.5">
                      <span>✨</span>
                      <span>{s.shabbatEnds} {shabbatEndTime}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Progress Bar & Smart Next Study Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-amber-900/10">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-stone-700">
                <span>{s.progress}</span>
                <span className="tabular-nums font-bold text-amber-950">{s.progressCount(completedCount, totalLessons, progressPercent)}</span>
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
                <ForwardArrow className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Daily Study Pillar Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-torah">{s.todayLessons}</h2>
          <p className="text-xs text-stone-500">{s.todayHint}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyCards.filter((card) => lessonKeys.includes(card.key)).map((card) => {
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
                      title={isCompleted ? s.markNotDone : s.markDone}
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
                    {isCompleted ? s.completedToday : s.notCompleted}
                  </span>

                  <button
                    onClick={() => onSelectCategory(card.id)}
                    className="text-xs font-semibold text-amber-950 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{s.read}</span>
                    <ForwardArrow className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {showShnayimMikra && (
          <button
            type="button"
            onClick={() => onSelectCategory('shnayim_mikra')}
            className="w-full text-start rounded-xl p-5 border border-amber-300 bg-amber-50/60 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100 text-amber-900 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-stone-900 font-torah text-lg leading-tight">{sm.title}</h3>
                <p className="text-xs text-stone-600">{sm.text}</p>
              </div>
            </div>
            <ForwardArrow className="w-4 h-4 text-amber-900 shrink-0" />
          </button>
        )}
      </section>
    </div>
  );
};
