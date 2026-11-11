import React, { useState } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { DailyStudyKey, RambamTrack, StudySettings } from '../types/chitas';
import { ALL_LESSONS, enabledLessonKeys } from '../utils/lessons';
import { LANGUAGES, type Lang, dirOf, useLang, useStrings } from '../i18n';

const STRINGS = {
  he: {
    rambamTracks: [
      { id: 'three_chapters', label: 'ג׳ פרקים ליום', description: 'כל היד החזקה בשנה' },
      { id: 'one_chapter', label: 'פרק אחד ליום', description: 'משנה תורה ב־3 שנים' },
      { id: 'sefer_hamitzvot', label: 'ספר המצוות', description: 'המצוות לפי מסלול פרק אחד' },
    ] as { id: RambamTrack; label: string; description: string }[],
    lessons: {
      chumash: 'חומש עם רש״י',
      tehillim: 'תהילים',
      tanya: 'תניא',
      hayomYom: 'היום יום',
      rambam: 'רמב״ם',
    } as Record<DailyStudyKey, string>,
    language: 'שפת הממשק',
    welcome: 'ברוכים הבאים לחת״ת יומי',
    intro: 'מה תרצה ללמוד בכל יום? אפשר לשנות את זה בכל עת בהגדרות.',
    whereLive: 'איפה אתה גר?',
    israel: 'בארץ ישראל',
    abroad: 'בחוץ לארץ',
    parashaNote: 'לפעמים פרשת השבוע שונה בין ארץ ישראל לחוץ לארץ.',
    cityNote: ' לזמני היום המדויקים אפשר לבחור את העיר שלך בהגדרות.',
    whatLearn: 'מה תרצה ללמוד?',
    rambamTrack: 'מסלול הרמב״ם:',
    pickOne: 'בחר לפחות שיעור אחד',
    start: 'התחל ללמוד',
  },
  en: {
    rambamTracks: [
      { id: 'three_chapters', label: '3 chapters a day', description: 'The whole Mishneh Torah in a year' },
      { id: 'one_chapter', label: '1 chapter a day', description: 'The Mishneh Torah in 3 years' },
      { id: 'sefer_hamitzvot', label: 'Sefer HaMitzvot', description: 'The mitzvot, alongside the 1-chapter track' },
    ] as { id: RambamTrack; label: string; description: string }[],
    lessons: {
      chumash: 'Chumash with Rashi',
      tehillim: 'Tehillim',
      tanya: 'Tanya',
      hayomYom: 'Hayom Yom',
      rambam: 'Rambam',
    } as Record<DailyStudyKey, string>,
    language: 'Interface language',
    welcome: 'Welcome to Daily Chitas',
    intro: 'What would you like to learn every day? You can change this at any time in the settings.',
    whereLive: 'Where do you live?',
    israel: 'In Israel',
    abroad: 'In the Diaspora',
    parashaNote: 'The weekly parashah is sometimes different in Israel and in the Diaspora.',
    cityNote: ' For exact zmanim, you can choose your city in the settings.',
    whatLearn: 'What would you like to learn?',
    rambamTrack: 'Rambam track:',
    pickOne: 'Choose at least one lesson',
    start: 'Start learning',
  },
  fr: {
    rambamTracks: [
      { id: 'three_chapters', label: '3 chapitres par jour', description: 'Tout le Michné Torah en un an' },
      { id: 'one_chapter', label: '1 chapitre par jour', description: 'Le Michné Torah en 3 ans' },
      { id: 'sefer_hamitzvot', label: 'Séfer Hamitsvot', description: 'Les mitsvot, au rythme d’un chapitre par jour' },
    ] as { id: RambamTrack; label: string; description: string }[],
    lessons: {
      chumash: '\'Houmach avec Rachi',
      tehillim: 'Téhilim',
      tanya: 'Tanya',
      hayomYom: 'Hayom Yom',
      rambam: 'Rambam',
    } as Record<DailyStudyKey, string>,
    language: 'Langue de l’interface',
    welcome: 'Bienvenue dans \'Hitat quotidien',
    intro: 'Que souhaitez-vous étudier chaque jour ? Vous pourrez le modifier à tout moment dans les paramètres.',
    whereLive: 'Où habitez-vous ?',
    israel: 'En Israël',
    abroad: 'Hors d’Israël',
    parashaNote: 'La paracha de la semaine diffère parfois entre Israël et la Diaspora.',
    cityNote: ' Pour des horaires précis, vous pouvez choisir votre ville dans les paramètres.',
    whatLearn: 'Que souhaitez-vous étudier ?',
    rambamTrack: 'Rythme du Rambam :',
    pickOne: 'Choisissez au moins une leçon',
    start: 'Commencer l’étude',
  },
};

interface OnboardingModalProps {
  settings: StudySettings;
  onDone: (update: Partial<StudySettings>) => void;
  /** Changes the interface language right away (the modal is shown in the new language) */
  onChangeLanguage?: (language: Lang) => void;
}

/** First launch: which daily lessons to learn, and the Rambam track. Can be changed later in the settings. */
export const OnboardingModal: React.FC<OnboardingModalProps> = ({ settings, onDone, onChangeLanguage }) => {
  const [lessons, setLessons] = useState<DailyStudyKey[]>(() => enabledLessonKeys(settings.enabledLessons));
  const [track, setTrack] = useState<RambamTrack>(settings.rambamTrack || 'three_chapters');
  const [inIsrael, setInIsrael] = useState<boolean>(settings.inIsrael ?? true);
  const s = useStrings(STRINGS);
  const lang = useLang();

  const toggle = (key: DailyStudyKey) =>
    setLessons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" dir={dirOf(lang)}>
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-stone-100 space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-800" />
            <h2 className="font-bold text-stone-900 font-torah text-xl">{s.welcome}</h2>
          </div>
          <p className="text-xs text-stone-600">{s.intro}</p>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Interface language: a French / English user sees their language right away */}
          {onChangeLanguage && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-stone-700">{s.language}</div>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    lang={l.id}
                    onClick={() => onChangeLanguage(l.id)}
                    className={`p-2.5 rounded-xl border text-sm cursor-pointer transition-colors ${
                      lang === l.id
                        ? 'bg-amber-100 border-amber-800 text-amber-950 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Israel or abroad: the weekly parasha is sometimes different */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-stone-700">{s.whereLive}</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: true, label: s.israel },
                { v: false, label: s.abroad },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  type="button"
                  onClick={() => setInIsrael(o.v)}
                  className={`p-2.5 rounded-xl border text-sm cursor-pointer transition-colors ${
                    inIsrael === o.v
                      ? 'bg-amber-100 border-amber-800 text-amber-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              {s.parashaNote}
              {!inIsrael && s.cityNote}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-stone-700">{s.whatLearn}</div>
            {ALL_LESSONS.map((l) => {
              const on = lessons.includes(l.key);
              return (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => toggle(l.key)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    on ? 'bg-amber-100 border-amber-800 text-amber-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <span className="text-sm">{s.lessons[l.key]}</span>
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      on ? 'bg-amber-800 border-amber-800 text-white' : 'border-stone-300'
                    }`}
                  >
                    {on && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>

          {lessons.includes('rambam') && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-stone-700">{s.rambamTrack}</div>
              <div className="grid grid-cols-1 gap-2">
                {s.rambamTracks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrack(t.id)}
                    className={`p-2.5 rounded-xl border text-start cursor-pointer transition-colors ${
                      track === t.id
                        ? 'bg-amber-100 border-amber-800 text-amber-950 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="text-sm">{t.label}</div>
                    <div className="text-[11px] text-stone-500 font-normal">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-100">
          <button
            type="button"
            disabled={lessons.length === 0}
            onClick={() => onDone({ enabledLessons: lessons, rambamTrack: track, inIsrael })}
            className="w-full py-2.5 text-sm font-bold text-white bg-amber-900 hover:bg-amber-800 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {lessons.length === 0 ? s.pickOne : s.start}
          </button>
        </div>
      </div>
    </div>
  );
};
