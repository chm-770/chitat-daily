import React, { useEffect, useState } from 'react';
import { DailyStudyKey, RambamTrack, StudySettings, ThemeMode } from '../types/chitas';
import { ALL_LESSONS, enabledLessonKeys, TEXT_FONTS } from '../utils/lessons';
import { X, Type, RotateCcw, MapPin, Palette, Scale, BookOpen, Check, UserCircle2, Bell, Languages } from 'lucide-react';
import { CityConfig, DEFAULT_CITY, getSavedCity } from '../services/zmanimService';
import { CityPicker } from './CityPicker';
import { AccountSection } from './AccountSection';
import { RemindersSection } from './RemindersSection';
import type { AccountUser } from '../services/account';
import { LANGUAGES, detectLang, useLang, useStrings } from '../i18n';
import { cityDisplayName } from './CityPicker';

interface StudySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudySettings;
  onUpdateSettings: (newSettings: Partial<StudySettings>) => void;
  onResetProgress: () => void;
  onCityChanged?: (city: CityConfig) => void;
  accountUser?: AccountUser | null;
  onBeforeSignIn?: () => void;
}

const THEMES: { id: ThemeMode; swatch: string }[] = [
  { id: 'parchment', swatch: '#fbf3e1' },
  { id: 'light', swatch: '#ffffff' },
  { id: 'dark', swatch: '#292524' },
  { id: 'black', swatch: '#000000' },
  { id: 'system', swatch: 'linear-gradient(135deg, #ffffff 50%, #1c1917 50%)' },
];

const RAMBAM_TRACK_IDS: RambamTrack[] = ['three_chapters', 'one_chapter', 'sefer_hamitzvot'];
const FONT_SIZES: StudySettings['fontSize'][] = ['small', 'medium', 'large', 'xlarge'];

const STRINGS = {
  he: {
    title: 'הגדרות',
    close: 'סגור',
    language: 'שפת הממשק:',
    fontSize: 'גודל גופן:',
    fontSizes: { small: 'קטן', medium: 'בינוני', large: 'גדול', xlarge: 'ענק' } as Record<StudySettings['fontSize'], string>,
    textFont: 'גופן הטקסט:',
    fonts: {
      frank: 'פרנק רוהל',
      david: 'דוד',
      'noto-serif': 'נוטו',
      'noto-sans': 'נוטו סאנס',
      assistant: 'אסיסטנט',
    } as Record<string, string>,
    theme: 'צבע הממשק:',
    themes: { parchment: 'קלף', light: 'לבן', dark: 'כהה', black: 'שחור', system: 'לפי המכשיר' } as Record<ThemeMode, string>,
    rashiFont: 'גופן רש״י מעוטר',
    rashiFontHint: 'הצגת פירוש רש״י בסגנון כתב מסורתי',
    city: 'עיר לזמני היום וכניסת השבת:',
    candleMinutes: (n: number) => `הדלקת נרות ${n} דק׳ לפני השקיעה`,
    israel: ' · ארץ ישראל',
    abroad: ' · חוץ לארץ',
    changeCity: 'שנה עיר',
    myLessons: 'השיעורים שלי:',
    lessons: {
      chumash: 'חומש עם רש״י',
      tehillim: 'תהילים',
      tanya: 'תניא',
      hayomYom: 'היום יום',
      rambam: 'רמב״ם',
    } as Record<DailyStudyKey, string>,
    rambamTrack: 'מסלול לימוד הרמב״ם היומי:',
    rambamTracks: {
      three_chapters: { label: 'ג׳ פרקים ליום', description: 'כל היד החזקה בשנה' },
      one_chapter: { label: 'פרק אחד ליום', description: 'משנה תורה ב־3 שנים' },
      sefer_hamitzvot: { label: 'ספר המצוות', description: 'המצוות לפי מסלול פרק אחד' },
    } as Record<RambamTrack, { label: string; description: string }>,
    reminders: 'תזכורות:',
    account: 'חשבון (לא חובה):',
    savedNote: 'כל הבחירות נשמרות במכשיר לפעם הבאה.',
    resetConfirm: 'האם לאפס את סימוני הלימוד ליום המוצג?',
    reset: 'אפס סימוני לימוד ליום המוצג',
    closeSettings: 'סגור הגדרות',
  },
  en: {
    title: 'Settings',
    close: 'Close',
    language: 'Interface language:',
    fontSize: 'Font size:',
    fontSizes: { small: 'Small', medium: 'Medium', large: 'Large', xlarge: 'Huge' } as Record<StudySettings['fontSize'], string>,
    textFont: 'Text font:',
    fonts: {
      frank: 'Frank Ruhl',
      david: 'David',
      'noto-serif': 'Noto',
      'noto-sans': 'Noto Sans',
      assistant: 'Assistant',
    } as Record<string, string>,
    theme: 'Color theme:',
    themes: { parchment: 'Parchment', light: 'White', dark: 'Dark', black: 'Black', system: 'Device' } as Record<ThemeMode, string>,
    rashiFont: 'Rashi script',
    rashiFontHint: 'Show Rashi’s commentary in the traditional script',
    city: 'City for zmanim and Shabbat times:',
    candleMinutes: (n: number) => `Candle lighting ${n} min before sunset`,
    israel: ' · Israel',
    abroad: ' · Diaspora',
    changeCity: 'Change city',
    myLessons: 'My lessons:',
    lessons: {
      chumash: 'Chumash with Rashi',
      tehillim: 'Tehillim',
      tanya: 'Tanya',
      hayomYom: 'Hayom Yom',
      rambam: 'Rambam',
    } as Record<DailyStudyKey, string>,
    rambamTrack: 'Daily Rambam track:',
    rambamTracks: {
      three_chapters: { label: '3 chapters a day', description: 'The whole Mishneh Torah in a year' },
      one_chapter: { label: '1 chapter a day', description: 'The Mishneh Torah in 3 years' },
      sefer_hamitzvot: { label: 'Sefer HaMitzvot', description: 'The mitzvot, alongside the 1-chapter track' },
    } as Record<RambamTrack, { label: string; description: string }>,
    reminders: 'Reminders:',
    account: 'Account (optional):',
    savedNote: 'All your choices are saved on this device for next time.',
    resetConfirm: 'Reset the study marks for the day shown?',
    reset: 'Reset study marks for the day shown',
    closeSettings: 'Close settings',
  },
  fr: {
    title: 'Paramètres',
    close: 'Fermer',
    language: 'Langue de l’interface :',
    fontSize: 'Taille du texte :',
    fontSizes: { small: 'Petite', medium: 'Moyenne', large: 'Grande', xlarge: 'Très grande' } as Record<StudySettings['fontSize'], string>,
    textFont: 'Police du texte :',
    fonts: {
      frank: 'Frank Ruhl',
      david: 'David',
      'noto-serif': 'Noto',
      'noto-sans': 'Noto Sans',
      assistant: 'Assistant',
    } as Record<string, string>,
    theme: 'Couleur de l’interface :',
    themes: { parchment: 'Parchemin', light: 'Blanc', dark: 'Sombre', black: 'Noir', system: 'Appareil' } as Record<ThemeMode, string>,
    rashiFont: 'Écriture Rachi',
    rashiFontHint: 'Afficher le commentaire de Rachi dans l’écriture traditionnelle',
    city: 'Ville pour les horaires et le Chabbat :',
    candleMinutes: (n: number) => `Allumage des bougies ${n} min avant le coucher du soleil`,
    israel: ' · Israël',
    abroad: ' · Diaspora',
    changeCity: 'Changer de ville',
    myLessons: 'Mes leçons :',
    lessons: {
      chumash: '\'Houmach avec Rachi',
      tehillim: 'Téhilim',
      tanya: 'Tanya',
      hayomYom: 'Hayom Yom',
      rambam: 'Rambam',
    } as Record<DailyStudyKey, string>,
    rambamTrack: 'Rythme du Rambam quotidien :',
    rambamTracks: {
      three_chapters: { label: '3 chapitres par jour', description: 'Tout le Michné Torah en un an' },
      one_chapter: { label: '1 chapitre par jour', description: 'Le Michné Torah en 3 ans' },
      sefer_hamitzvot: { label: 'Séfer Hamitsvot', description: 'Les mitsvot, au rythme d’un chapitre par jour' },
    } as Record<RambamTrack, { label: string; description: string }>,
    reminders: 'Rappels :',
    account: 'Compte (facultatif) :',
    savedNote: 'Tous vos choix sont enregistrés sur cet appareil.',
    resetConfirm: 'Réinitialiser les marques d’étude du jour affiché ?',
    reset: 'Réinitialiser les marques d’étude du jour affiché',
    closeSettings: 'Fermer les paramètres',
  },
};

const sectionTitle = 'text-xs font-semibold text-stone-700 flex items-center gap-1.5';
const optionClass = (active: boolean) =>
  `rounded-xl border text-start transition-all cursor-pointer ${
    active
      ? 'bg-amber-100 border-amber-900 text-amber-950 font-bold'
      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
  }`;

export const StudySettingsModal: React.FC<StudySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetProgress,
  onCityChanged,
  accountUser = null,
  onBeforeSignIn = () => {},
}) => {
  const [currentCity, setCurrentCity] = useState<CityConfig>(() => getSavedCity() || DEFAULT_CITY);
  const [isChangingCity, setIsChangingCity] = useState(false);
  const s = useStrings(STRINGS);
  const lang = useLang();

  useEffect(() => {
    if (isOpen) {
      setCurrentCity(getSavedCity() || DEFAULT_CITY);
      setIsChangingCity(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rambamTrack = settings.rambamTrack || 'three_chapters';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-amber-800" />
            <h2 className="font-bold text-stone-900 font-torah text-lg">{s.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Interface language */}
          <div className="space-y-2">
            <label className={sectionTitle}>
              <Languages className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.language}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  lang={l.id}
                  onClick={() => onUpdateSettings({ language: l.id })}
                  className={`py-2 px-1 text-xs font-medium flex items-center justify-center ${optionClass(
                    (settings.language || detectLang()) === l.id
                  )}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className={sectionTitle}>
              <Type className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.fontSize}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ fontSize: size })}
                  className={`py-2 text-xs font-medium text-center ${optionClass(settings.fontSize === size)}`}
                >
                  {s.fontSizes[size]}
                </button>
              ))}
            </div>
          </div>

          {/* Text font, with a sample */}
          <div className="space-y-2">
            <label className={sectionTitle}>
              <Type className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.textFont}</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {TEXT_FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateSettings({ textFont: f.id })}
                  className={`p-2.5 flex items-center justify-between gap-3 ${optionClass(
                    (settings.textFont || 'frank') === f.id
                  )}`}
                >
                  <span className="text-[11px] shrink-0">{s.fonts[f.id] || f.label}</span>
                  <span
                    className="text-lg text-stone-900 font-normal truncate"
                    style={{ fontFamily: f.family }}
                    dir="rtl"
                    lang="he"
                  >
                    וַיִּבֶן שָׁם מִזְבֵּחַ וַיִּקְרָא בְּשֵׁם
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className={sectionTitle}>
              <Palette className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.theme}</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ theme: th.id })}
                  className={`py-2 px-1 text-[11px] font-medium flex flex-col items-center gap-1 ${optionClass(
                    settings.theme === th.id
                  )}`}
                >
                  <span
                    className="w-6 h-6 rounded-full border border-stone-300"
                    style={{ background: th.swatch }}
                    aria-hidden="true"
                  />
                  <span className="text-center leading-tight">{s.themes[th.id]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rashi Script Toggle */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <div className="text-xs font-semibold text-stone-900">{s.rashiFont}</div>
              <div className="text-[11px] text-stone-500">{s.rashiFontHint}</div>
            </div>
            <button
              onClick={() => onUpdateSettings({ rashiFontScript: !settings.rashiFontScript })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.rashiFontScript ? 'bg-amber-800' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  settings.rashiFontScript ? 'end-1' : 'start-1'
                }`}
              />
            </button>
          </div>

          {/* City */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className={sectionTitle}>
              <MapPin className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.city}</span>
            </label>
            <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-900 truncate" dir="auto">
                  {cityDisplayName(currentCity, lang)}
                </div>
                <div className="text-[11px] text-stone-500">
                  {s.candleMinutes(currentCity.candleLightingMinutes)}
                  {currentCity.isIsrael ? s.israel : s.abroad}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingCity(!isChangingCity)}
                className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-semibold cursor-pointer shrink-0"
              >
                {isChangingCity ? s.close : s.changeCity}
              </button>
            </div>
            {isChangingCity && (
              <CityPicker
                selectedCity={currentCity}
                onSelect={(city) => {
                  setCurrentCity(city);
                  setIsChangingCity(false);
                  onCityChanged?.(city);
                }}
              />
            )}
          </div>

          {/* The lessons the user learns */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className={sectionTitle}>
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.myLessons}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_LESSONS.map((l) => {
                const current = enabledLessonKeys(settings.enabledLessons);
                const on = current.includes(l.key);
                return (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => {
                      const next: DailyStudyKey[] = on ? current.filter((k) => k !== l.key) : [...current, l.key];
                      if (next.length > 0) onUpdateSettings({ enabledLessons: next });
                    }}
                    className={`p-2.5 text-xs flex items-center justify-between gap-2 ${optionClass(on)}`}
                  >
                    <span>{s.lessons[l.key]}</span>
                    {on && <Check className="w-3.5 h-3.5 text-amber-800" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rambam Track Selection */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className={sectionTitle}>
              <Scale className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.rambamTrack}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {RAMBAM_TRACK_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdateSettings({ rambamTrack: id })}
                  className={`p-2.5 ${optionClass(rambamTrack === id)}`}
                >
                  <div className="text-xs sm:text-sm">{s.rambamTracks[id].label}</div>
                  <div className="text-[10px] text-stone-500 font-normal mt-0.5">{s.rambamTracks[id].description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className={sectionTitle}>
              <Bell className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.reminders}</span>
            </label>
            <RemindersSection enabledLessons={settings.enabledLessons} />
          </div>

          {/* Optional account */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className={sectionTitle}>
              <UserCircle2 className="w-3.5 h-3.5 text-amber-800" />
              <span>{s.account}</span>
            </label>
            <AccountSection user={accountUser} onBeforeSignIn={onBeforeSignIn} />
          </div>

          <p className="text-[11px] text-stone-500 text-center">{s.savedNote}</p>

          {/* Reset progress */}
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                if (window.confirm(s.resetConfirm)) {
                  onResetProgress();
                }
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{s.reset}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            {s.closeSettings}
          </button>
        </div>
      </div>
    </div>
  );
};
