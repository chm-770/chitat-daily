import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { getHebrewChapterNumber } from '../services/tehillimService';
import { useLang, useStrings, dirOf } from '../i18n';

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

const LETTER_VALUES: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400,
};

/** Value of a number written in Hebrew letters, or 0 if it contains anything else. */
function hebrewLettersToNumber(text: string): number {
  const clean = text.replace(/[\s'"׳״`]/g, '');
  if (!clean) return 0;
  let sum = 0;
  for (const ch of clean) {
    const v = LETTER_VALUES[ch];
    if (!v) return 0;
    sum += v;
  }
  return sum;
}

const STRINGS = {
  he: {
    commonLabels: {} as Record<number, string>,
    errInvalid: 'נא להזין מספר מזמור תקין בין 1 ל-150',
    errExists: (num: number) => `מזמור ${getHebrewChapterNumber(num)} (${num}) כבר קיים ברשימה שלך`,
    errLetters: 'נא לכתוב מזמור באותיות, למשל: קכא',
    title: 'פרקי תהילים אישיים',
    subtitle: 'הפרקים שתוסיף יישמרו מעתה לכל הימים. ניתן להוסיף, למחוק ולשנות את הסדר.',
    close: 'סגור',
    yourList: 'הרשימה שלך כעת',
    count: (n: number) => `${n} פרקים`,
    reorderHint: 'גרור את ⠿ כדי לשנות את הסדר',
    empty: 'אין כרגע פרקים אישיים ברשימה.',
    emptyHint: 'הוסף מזמור למטה לפי מספר או באותיות.',
    psalmName: (num: number) => `מזמור ${getHebrewChapterNumber(num)}`,
    psalmAside: (num: number) => `(${num})`,
    remove: 'מחק פרק זה',
    byNumber: 'הוסף לפי מספר מזמור (1–150):',
    numberPlaceholder: 'מספר (למשל 20)',
    add: 'הוסף',
    byLetters: 'הוסף לפי שם המזמור באותיות:',
    lettersPlaceholder: 'למשל קכא',
    dragHandle: 'גרירה לשינוי הסדר',
    reset: 'איפוס לברירת מחדל',
    cancel: 'ביטול',
    save: 'שמור פרקים לכל הימים',
  },
  en: {
    commonLabels: {
      124: "The Rebbe's kapitel (114 / 124)",
      20: 'Healing and salvation',
      23: 'Livelihood and trust',
      91: 'Safeguarding and protection',
      121: 'Protection on the road',
      130: 'A time of favor, opening the gates',
      150: 'Praise and thanksgiving',
    } as Record<number, string>,
    errInvalid: 'Please enter a psalm number between 1 and 150',
    errExists: (num: number) => `Psalm ${num} is already in your list`,
    errLetters: 'Please write the psalm in Hebrew letters, e.g. קכא',
    title: 'Personal Tehillim',
    subtitle: 'The psalms you add are kept for every day. You can add, remove and reorder them.',
    close: 'Close',
    yourList: 'Your current list',
    count: (n: number) => `${n} ${n === 1 ? 'psalm' : 'psalms'}`,
    reorderHint: 'Drag ⠿ to change the order',
    empty: 'No personal psalms in the list yet.',
    emptyHint: 'Add a psalm below by number or in Hebrew letters.',
    psalmName: (num: number) => `Psalm ${num}`,
    psalmAside: (num: number) => `(${getHebrewChapterNumber(num)})`,
    remove: 'Remove this psalm',
    byNumber: 'Add by psalm number (1–150):',
    numberPlaceholder: 'Number (e.g. 20)',
    add: 'Add',
    byLetters: 'Add by Hebrew letters:',
    lettersPlaceholder: 'e.g. קכא',
    dragHandle: 'Drag to reorder',
    reset: 'Reset to default',
    cancel: 'Cancel',
    save: 'Save for every day',
  },
  fr: {
    commonLabels: {
      124: 'Le chapitre du Rabbi (114 / 124)',
      20: 'Guérison et délivrance',
      23: 'Subsistance et confiance',
      91: 'Garde et protection',
      121: 'Protection en voyage',
      130: 'Moment de grâce, ouverture des portes',
      150: 'Louange et action de grâce',
    } as Record<number, string>,
    errInvalid: 'Veuillez saisir un numéro de psaume entre 1 et 150',
    errExists: (num: number) => `Le psaume ${num} est déjà dans votre liste`,
    errLetters: 'Veuillez écrire le psaume en lettres hébraïques, par ex. קכא',
    title: 'Téhilim personnels',
    subtitle: 'Les psaumes ajoutés sont conservés pour tous les jours. Vous pouvez en ajouter, en supprimer et changer leur ordre.',
    close: 'Fermer',
    yourList: 'Votre liste actuelle',
    count: (n: number) => `${n} psaume${n > 1 ? 's' : ''}`,
    reorderHint: "Faites glisser ⠿ pour changer l'ordre",
    empty: "Aucun psaume personnel dans la liste pour l'instant.",
    emptyHint: 'Ajoutez un psaume ci-dessous par numéro ou en lettres hébraïques.',
    psalmName: (num: number) => `Psaume ${num}`,
    psalmAside: (num: number) => `(${getHebrewChapterNumber(num)})`,
    remove: 'Supprimer ce psaume',
    byNumber: 'Ajouter par numéro de psaume (1–150) :',
    numberPlaceholder: 'Numéro (par ex. 20)',
    add: 'Ajouter',
    byLetters: 'Ajouter en lettres hébraïques :',
    lettersPlaceholder: 'par ex. קכא',
    dragHandle: 'Glisser pour réordonner',
    reset: 'Rétablir par défaut',
    cancel: 'Annuler',
    save: 'Enregistrer',
  },
};

/** One psalm of the list: drag the handle (⠿) up or down to reorder. */
const PsalmRow: React.FC<{
  num: number;
  idx: number;
  label: string;
  name: string;
  aside: string;
  removeTitle: string;
  dragTitle: string;
  onRemove: () => void;
}> = ({ num, idx, label, name, aside, removeTitle, dragTitle, onRemove }) => {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={num}
      dragListener={false}
      dragControls={controls}
      className="flex items-center justify-between p-2.5 bg-amber-50/50 border border-amber-200/80 rounded-xl select-none"
      whileDrag={{ scale: 1.02, boxShadow: '0 6px 16px rgba(0,0,0,0.12)', zIndex: 10 }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          title={dragTitle}
          aria-label={dragTitle}
          onPointerDown={(e) => controls.start(e)}
          className="p-1 -m-1 text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <span className="w-6 h-6 rounded-full bg-amber-200/80 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
          {idx + 1}
        </span>
        <div className="min-w-0">
          <div className="font-bold text-stone-900 font-torah text-base flex items-center gap-2">
            <span>{name}</span>
            <span className="text-xs font-sans text-stone-500 font-normal">{aside}</span>
          </div>
          {label && <div className="text-[11px] text-amber-900 font-sans">{label}</div>}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        title={removeTitle}
        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </Reorder.Item>
  );
};

export const CustomPsalmsModal: React.FC<CustomPsalmsModalProps> = ({
  isOpen,
  onClose,
  selectedChapters,
  onSave,
}) => {
  const lang = useLang();
  const s = useStrings(STRINGS);
  const commonLabel = (item: { num: number; label: string }) => s.commonLabels[item.num] || item.label;
  const [currentList, setCurrentList] = useState<number[]>(selectedChapters);
  const [inputVal, setInputVal] = useState<string>('');
  const [lettersVal, setLettersVal] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Always synchronize with incoming prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentList([...selectedChapters]);
      setInputVal('');
      setLettersVal('');
      setErrorMsg('');
    }
  }, [isOpen, selectedChapters]);

  if (!isOpen) return null;

  const handleAddChapter = (num: number) => {
    if (isNaN(num) || num < 1 || num > 150) {
      setErrorMsg(s.errInvalid);
      return;
    }
    setErrorMsg('');
    if (currentList.includes(num)) {
      setErrorMsg(s.errExists(num));
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

  // Psalm written in Hebrew letters (קכא, קכ״א, קכ"א…)
  const handleAddByLetters = (e: React.FormEvent) => {
    e.preventDefault();
    const num = hebrewLettersToNumber(lettersVal);
    if (!num || num > 150) {
      setErrorMsg(s.errLetters);
      return;
    }
    handleAddChapter(num);
    setLettersVal('');
  };

  const handleRemove = (indexToRemove: number) => {
    setCurrentList(currentList.filter((_, idx) => idx !== indexToRemove));
    setErrorMsg('');
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
        dir={dirOf(lang)}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
          <div>
            <h3 className="font-bold text-stone-900 font-torah text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-800" />
              <span>{s.title}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {s.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            aria-label={s.close}
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
                <span>{s.yourList}</span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap">
                  {s.count(currentList.length)}
                </span>
              </span>
              {currentList.length > 0 && (
                <span className="text-[11px] text-stone-400">
                  {s.reorderHint}
                </span>
              )}
            </div>

            {currentList.length === 0 ? (
              <div className="p-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 text-stone-500 space-y-1">
                <p className="text-xs font-medium">{s.empty}</p>
                <p className="text-[11px] text-stone-400">{s.emptyHint}</p>
              </div>
            ) : (
              <Reorder.Group axis="y" values={currentList} onReorder={setCurrentList} className="space-y-2">
                {currentList.map((num, idx) => (
                  <PsalmRow
                    key={num}
                    num={num}
                    idx={idx}
                    label={(() => {
                      const c = COMMON_CHAPTERS.find((x) => x.num === num);
                      return c ? commonLabel(c) : '';
                    })()}
                    name={s.psalmName(num)}
                    aside={s.psalmAside(num)}
                    removeTitle={s.remove}
                    dragTitle={s.dragHandle}
                    onRemove={() => handleRemove(idx)}
                  />
                ))}
              </Reorder.Group>
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
                {s.byNumber}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={s.numberPlaceholder}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{s.add}</span>
                </button>
              </div>
            </form>

            {/* By the psalm's name in Hebrew letters */}
            <form
              onSubmit={handleAddByLetters}
              className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2"
            >
              <label className="text-xs font-semibold text-stone-700 block">{s.byLetters}</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  dir="rtl"
                  lang="he"
                  value={lettersVal}
                  onChange={(e) => setLettersVal(e.target.value)}
                  placeholder={s.lettersPlaceholder}
                  maxLength={6}
                  className="flex-1 min-w-0 px-3 py-1.5 text-sm font-torah bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{s.add}</span>
                </button>
              </div>
            </form>
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
            <span>{s.reset}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            >
              {s.cancel}
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-800 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{s.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
