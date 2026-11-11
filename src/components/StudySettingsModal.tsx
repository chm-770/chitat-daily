import React, { useEffect, useState } from 'react';
import { DailyStudyKey, RambamTrack, StudySettings, ThemeMode } from '../types/chitas';
import { ALL_LESSONS, enabledLessonKeys, TEXT_FONTS } from '../utils/lessons';
import { X, Type, RotateCcw, MapPin, Palette, Scale, BookOpen, Check } from 'lucide-react';
import { CityConfig, DEFAULT_CITY, getSavedCity } from '../services/zmanimService';
import { CityPicker } from './CityPicker';

interface StudySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudySettings;
  onUpdateSettings: (newSettings: Partial<StudySettings>) => void;
  onResetProgress: () => void;
  onCityChanged?: (city: CityConfig) => void;
}

const THEMES: { id: ThemeMode; label: string; swatch: string }[] = [
  { id: 'parchment', label: 'קלף', swatch: '#fbf3e1' },
  { id: 'light', label: 'לבן', swatch: '#ffffff' },
  { id: 'dark', label: 'כהה', swatch: '#292524' },
  { id: 'black', label: 'שחור', swatch: '#000000' },
  { id: 'system', label: 'לפי המכשיר', swatch: 'linear-gradient(135deg, #ffffff 50%, #1c1917 50%)' },
];

const RAMBAM_TRACKS: { id: RambamTrack; label: string; description: string }[] = [
  { id: 'three_chapters', label: 'ג׳ פרקים ליום', description: 'כל היד החזקה בשנה' },
  { id: 'one_chapter', label: 'פרק אחד ליום', description: 'משנה תורה ב־3 שנים' },
  { id: 'sefer_hamitzvot', label: 'ספר המצוות', description: 'המצוות לפי מסלול פרק אחד' },
];

const sectionTitle = 'text-xs font-semibold text-stone-700 flex items-center gap-1.5';
const optionClass = (active: boolean) =>
  `rounded-xl border text-right transition-all cursor-pointer ${
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
}) => {
  const [currentCity, setCurrentCity] = useState<CityConfig>(() => getSavedCity() || DEFAULT_CITY);
  const [isChangingCity, setIsChangingCity] = useState(false);

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
            <h2 className="font-bold text-stone-900 font-torah text-lg">הגדרות</h2>
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
          {/* Font Size */}
          <div className="space-y-2">
            <label className={sectionTitle}>
              <Type className="w-3.5 h-3.5 text-amber-800" />
              <span>גודל גופן:</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'small', label: 'קטן' },
                { id: 'medium', label: 'בינוני' },
                { id: 'large', label: 'גדול' },
                { id: 'xlarge', label: 'ענק' },
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => onUpdateSettings({ fontSize: size.id as StudySettings['fontSize'] })}
                  className={`py-2 text-xs font-medium text-center ${optionClass(settings.fontSize === size.id)}`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text font, with a sample */}
          <div className="space-y-2">
            <label className={sectionTitle}>
              <Type className="w-3.5 h-3.5 text-amber-800" />
              <span>גופן הטקסט:</span>
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
                  <span className="text-[11px] shrink-0">{f.label}</span>
                  <span className="text-lg text-stone-900 font-normal truncate" style={{ fontFamily: f.family }}>
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
              <span>צבע הממשק:</span>
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
                  <span className="text-center leading-tight">{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rashi Script Toggle */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <div className="text-xs font-semibold text-stone-900">גופן רש״י מעוטר</div>
              <div className="text-[11px] text-stone-500">הצגת פירוש רש״י בסגנון כתב מסורתי</div>
            </div>
            <button
              onClick={() => onUpdateSettings({ rashiFontScript: !settings.rashiFontScript })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.rashiFontScript ? 'bg-amber-800' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  settings.rashiFontScript ? 'left-1' : 'right-1'
                }`}
              />
            </button>
          </div>

          {/* City */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className={sectionTitle}>
              <MapPin className="w-3.5 h-3.5 text-amber-800" />
              <span>עיר לזמני היום וכניסת השבת:</span>
            </label>
            <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-900 truncate">{currentCity.nameHe}</div>
                <div className="text-[11px] text-stone-500">
                  הדלקת נרות {currentCity.candleLightingMinutes} דק׳ לפני השקיעה
                  {currentCity.isIsrael ? ' · ארץ ישראל' : ' · חוץ לארץ'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingCity(!isChangingCity)}
                className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-semibold cursor-pointer shrink-0"
              >
                {isChangingCity ? 'סגור' : 'שנה עיר'}
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
              <span>השיעורים שלי:</span>
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
                    <span>{l.label}</span>
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
              <span>מסלול לימוד הרמב״ם היומי:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {RAMBAM_TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onUpdateSettings({ rambamTrack: t.id })}
                  className={`p-2.5 ${optionClass(rambamTrack === t.id)}`}
                >
                  <div className="text-xs sm:text-sm">{t.label}</div>
                  <div className="text-[10px] text-stone-500 font-normal mt-0.5">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-stone-500 text-center">כל הבחירות נשמרות במכשיר לפעם הבאה.</p>

          {/* Reset progress */}
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                if (window.confirm('האם לאפס את סימוני הלימוד ליום המוצג?')) {
                  onResetProgress();
                }
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>אפס סימוני לימוד ליום המוצג</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            סגור הגדרות
          </button>
        </div>
      </div>
    </div>
  );
};
