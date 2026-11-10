import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  BookOpen,
  Check,
  RotateCcw,
} from 'lucide-react';
import { getHebrewChapterNumber } from '../services/tehillimService';

interface CustomPsalmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChapters: number[];
  onSave: (chapters: number[]) => void;
}

const COMMON_CHAPTERS = [
  { num: 124, label: 'קפיטל הרבי (קי״ד / קכ״ד)', desc: 'לוּלֵי יְהוָה שֶׁהָיָה לָנוּ' },
  { num: 20, label: 'רפואה וישועה', desc: 'יַעַנְךָ יְהוָה בְּיוֹם צָרָה' },
  { num: 23, label: 'פרנסה וביטחון', desc: 'יְהוָה רֹעִי לֹא אֶחְסָר' },
  { num: 91, label: 'שמירה והגנה', desc: 'יֹשֵׁב בְּסֵתֶר עֶלְיוֹן' },
  { num: 121, label: 'שמירה בדרכים', desc: 'שִׁיר לַמַּעֲלוֹת אֶשָּׂא עֵינַי' },
  { num: 130, label: 'עת רצון ופתיחת שערים', desc: 'מִמַּעֲמַקִּים קְרָאתִיךָ יְהוָה' },
  { num: 150, label: 'שבח והודיה', desc: 'כֹּל הַנְּשָׁמָה תְּהַלֵּל יָהּ' },
];

export const CustomPsalmsModal: React.FC<CustomPsalmsModalProps> = ({
  isOpen,
  onClose,
  selectedChapters,
  onSave,
}) => {
  const [currentList, setCurrentList] = useState<number[]>(selectedChapters);
  const [inputVal, setInputVal] = useState<string>('');
  const [ageVal, setAgeVal] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Always synchronize with incoming prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentList([...selectedChapters]);
      setInputVal('');
      setAgeVal('');
      setErrorMsg('');
    }
  }, [isOpen, selectedChapters]);

  if (!isOpen) return null;

  const handleAddChapter = (num: number) => {
    if (isNaN(num) || num < 1 || num > 150) {
      setErrorMsg('נא להזין מספר מזמור תקין בין 1 ל-150');
      return;
    }
    setErrorMsg('');
    if (currentList.includes(num)) {
      setErrorMsg(`מזמור ${getHebrewChapterNumber(num)} (${num}) כבר קיים ברשימה שלך`);
      return;
    }
    // Append to end of existing list without removing anything
    setCurrentList([...currentList, num]);
    setInputVal('');
  };

  const handleAddFromInput = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputVal.trim(), 10);
    handleAddChapter(parsed);
  };

  const handleAddByAge = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(ageVal.trim(), 10);
    if (isNaN(age) || age < 0 || age >= 150) {
      setErrorMsg('נא להזין גיל תקין (למשל: 30)');
      return;
    }
    // Chabad custom: say chapter of current year = age + 1
    const chapterNum = age + 1;
    handleAddChapter(chapterNum);
    setAgeVal('');
  };

  const handleRemove = (indexToRemove: number) => {
    setCurrentList(currentList.filter((_, idx) => idx !== indexToRemove));
    setErrorMsg('');
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...currentList];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setCurrentList(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= currentList.length - 1) return;
    const next = [...currentList];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setCurrentList(next);
  };

  const handleResetToDefault = () => {
    setCurrentList([20, 124]);
    setErrorMsg('');
  };

  const handleSaveAndClose = () => {
    onSave(currentList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
          <div>
            <h3 className="font-bold text-stone-900 font-torah text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-800" />
              <span>פרקי תהילים אישיים</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              הפרקים שתוסיף יישמרו מעתה לכל הימים. ניתן להוסיף, למחוק ולשנות את הסדר.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Current Selected List with Re-order & Delete */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>הרשימה שלך כעת</span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[11px]">
                  {currentList.length} פרקים
                </span>
              </span>
              {currentList.length > 0 && (
                <span className="text-[11px] text-stone-400">
                  השתמש בחצים לשינוי סדר הקריאה
                </span>
              )}
            </div>

            {currentList.length === 0 ? (
              <div className="p-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 text-stone-500 space-y-1">
                <p className="text-xs font-medium">אין כרגע פרקים אישיים ברשימה.</p>
                <p className="text-[11px] text-stone-400">הוסף מזמור למטה לפי מספר או גיל.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentList.map((num, idx) => {
                  const commonMatch = COMMON_CHAPTERS.find((c) => c.num === num);
                  return (
                    <div
                      key={`${num}_${idx}`}
                      className="flex items-center justify-between p-2.5 bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-200/80 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-stone-900 font-torah text-base flex items-center gap-2">
                            <span>מזמור {getHebrewChapterNumber(num)}</span>
                            <span className="text-xs font-sans text-stone-500 font-normal">
                              ({num})
                            </span>
                          </div>
                          {commonMatch && (
                            <div className="text-[11px] text-amber-900 font-sans">
                              {commonMatch.label}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          title="העבר למעלה"
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === currentList.length - 1}
                          title="העבר למטה"
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Chapter */}
                        <button
                          type="button"
                          onClick={() => handleRemove(idx)}
                          title="מחק פרק זה"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Forms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
            {/* By Chapter Number */}
            <form
              onSubmit={handleAddFromInput}
              className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2"
            >
              <label className="text-xs font-semibold text-stone-700 block">
                הוסף לפי מספר מזמור (1–150):
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="מספר (למשל 20)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף</span>
                </button>
              </div>
            </form>

            {/* By Age (Chabad Custom) */}
            <form
              onSubmit={handleAddByAge}
              className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2"
            >
              <label className="text-xs font-semibold text-stone-700 block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>הוסף לפי גיל (גיל + 1):</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="149"
                  value={ageVal}
                  onChange={(e) => setAgeVal(e.target.value)}
                  placeholder="גיל (למשל 28 -> פרק כ״ט)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Common Suggestions */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-semibold text-stone-500 block">
              הוספה מהירה של מזמורים מיוחדים:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {COMMON_CHAPTERS.map((item) => {
                const isAlreadySelected = currentList.includes(item.num);
                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => {
                      if (!isAlreadySelected) {
                        handleAddChapter(item.num);
                      }
                    }}
                    disabled={isAlreadySelected}
                    className={`p-2 rounded-lg text-right text-xs border transition-all flex items-center justify-between cursor-pointer ${
                      isAlreadySelected
                        ? 'bg-stone-100/70 border-stone-200 text-stone-400 cursor-default'
                        : 'bg-white hover:bg-amber-50 border-stone-200 text-stone-700 hover:border-amber-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold font-torah text-stone-800">
                        מזמור {getHebrewChapterNumber(item.num)} ({item.num})
                      </div>
                      <div className="text-[10px] text-stone-500 font-sans">{item.label}</div>
                    </div>
                    {isAlreadySelected ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-200">
                        נבחר ✓
                      </span>
                    ) : (
                      <span className="text-amber-900 hover:underline text-[11px] font-medium">
                        + הוסף
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>איפוס לברירת מחדל</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>שמור פרקים לכל הימים</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
