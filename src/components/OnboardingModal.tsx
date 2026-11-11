import React, { useState } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { DailyStudyKey, RambamTrack, StudySettings } from '../types/chitas';
import { ALL_LESSONS, enabledLessonKeys } from '../utils/lessons';

const RAMBAM_TRACKS: { id: RambamTrack; label: string; description: string }[] = [
  { id: 'three_chapters', label: 'ג׳ פרקים ליום', description: 'כל היד החזקה בשנה' },
  { id: 'one_chapter', label: 'פרק אחד ליום', description: 'משנה תורה ב־3 שנים' },
  { id: 'sefer_hamitzvot', label: 'ספר המצוות', description: 'המצוות לפי מסלול פרק אחד' },
];

interface OnboardingModalProps {
  settings: StudySettings;
  onDone: (update: Partial<StudySettings>) => void;
}

/** First launch: which daily lessons to learn, and the Rambam track. Can be changed later in the settings. */
export const OnboardingModal: React.FC<OnboardingModalProps> = ({ settings, onDone }) => {
  const [lessons, setLessons] = useState<DailyStudyKey[]>(() => enabledLessonKeys(settings.enabledLessons));
  const [track, setTrack] = useState<RambamTrack>(settings.rambamTrack || 'three_chapters');
  const [inIsrael, setInIsrael] = useState<boolean>(settings.inIsrael ?? true);

  const toggle = (key: DailyStudyKey) =>
    setLessons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" dir="rtl">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-stone-100 space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-800" />
            <h2 className="font-bold text-stone-900 font-torah text-xl">ברוכים הבאים לחת״ת יומי</h2>
          </div>
          <p className="text-xs text-stone-600">מה תרצה ללמוד בכל יום? אפשר לשנות את זה בכל עת בהגדרות.</p>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Israel or abroad: the weekly parasha is sometimes different */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-stone-700">איפה אתה גר?</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: true, label: 'בארץ ישראל' },
                { v: false, label: 'בחוץ לארץ' },
              ].map((o) => (
                <button
                  key={o.label}
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
              לפעמים פרשת השבוע שונה בין ארץ ישראל לחוץ לארץ.
              {!inIsrael && ' לזמני היום המדויקים אפשר לבחור את העיר שלך בהגדרות.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-stone-700">מה תרצה ללמוד?</div>
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
                  <span className="text-sm">{l.label}</span>
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
              <div className="text-xs font-semibold text-stone-700">מסלול הרמב״ם:</div>
              <div className="grid grid-cols-1 gap-2">
                {RAMBAM_TRACKS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrack(t.id)}
                    className={`p-2.5 rounded-xl border text-right cursor-pointer transition-colors ${
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
            {lessons.length === 0 ? 'בחר לפחות שיעור אחד' : 'התחל ללמוד'}
          </button>
        </div>
      </div>
    </div>
  );
};
