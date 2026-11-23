import { DailyStudyKey, StudyCategory, TextFont } from '../types/chitas';
import { Lang, getLang } from '../i18n';

export const ALL_LESSONS: { key: DailyStudyKey; category: StudyCategory; label: string }[] = [
  { key: 'chumash', category: 'chumash', label: 'חומש עם רש״י' },
  { key: 'tehillim', category: 'tehillim', label: 'תהילים' },
  { key: 'tanya', category: 'tanya', label: 'תניא' },
  { key: 'hayomYom', category: 'hayom_yom', label: 'היום יום' },
  { key: 'rambam', category: 'rambam', label: 'רמב״ם' },
];

/** Lesson names in the interface languages (`ALL_LESSONS[].label` stays the Hebrew name). */
const LESSON_LABELS: Record<Lang, Record<DailyStudyKey, string>> = {
  he: {
    chumash: 'חומש עם רש״י',
    tehillim: 'תהילים',
    tanya: 'תניא',
    hayomYom: 'היום יום',
    rambam: 'רמב״ם',
  },
  en: {
    chumash: 'Chumash with Rashi',
    tehillim: 'Tehillim',
    tanya: 'Tanya',
    hayomYom: 'Hayom Yom',
    rambam: 'Rambam',
  },
  fr: {
    chumash: "'Houmach avec Rachi",
    tehillim: 'Téhilim',
    tanya: 'Tanya',
    hayomYom: 'Hayom Yom',
    rambam: 'Rambam',
  },
};

/** Name of a lesson in the given language (default: the current interface language). */
export function lessonLabel(key: DailyStudyKey, lang: Lang = getLang()): string {
  return (LESSON_LABELS[lang] || LESSON_LABELS.he)[key] || LESSON_LABELS.he[key];
}

const DEFAULT_ORDER: DailyStudyKey[] = ALL_LESSONS.map((l) => l.key);
let order: DailyStudyKey[] = DEFAULT_ORDER;

/** A complete order of the five lessons (unknown keys dropped, missing ones added at the end). */
export function normalizeLessonOrder(o?: DailyStudyKey[]): DailyStudyKey[] {
  const valid = (o || []).filter((k, i, a) => DEFAULT_ORDER.includes(k) && a.indexOf(k) === i);
  return [...valid, ...DEFAULT_ORDER.filter((k) => !valid.includes(k))];
}

let enabledNow: DailyStudyKey[] | undefined;

/** The order (and the chosen lessons) from the settings, set by App on every render. */
export function setLessonOrder(o?: DailyStudyKey[], enabled?: DailyStudyKey[]) {
  order = normalizeLessonOrder(o);
  enabledNow = enabled;
}

/** The five lessons in the user's order. */
export function lessonsInOrder() {
  return order.map((k) => ALL_LESSONS.find((l) => l.key === k)!);
}

export function enabledLessonKeys(enabled?: DailyStudyKey[]): DailyStudyKey[] {
  const list = enabled && enabled.length > 0 ? enabled : DEFAULT_ORDER;
  return order.filter((k) => list.includes(k));
}

/** Sections in order: the home page, then the lessons the user learns. */
export function sectionSequence(enabled?: DailyStudyKey[]): StudyCategory[] {
  const keys = enabledLessonKeys(enabled);
  return ['overview', ...lessonsInOrder().filter((l) => keys.includes(l.key)).map((l) => l.category)];
}

/** The section after `current` (back to the home page after the last lesson). */
export function nextSection(current: StudyCategory, enabled?: DailyStudyKey[]): StudyCategory {
  const seq = sectionSequence(enabled);
  const i = seq.indexOf(current);
  return i >= 0 && i < seq.length - 1 ? seq[i + 1] : 'overview';
}

/** Name of the lesson that comes after `current` in the user's order ("the home page" after the last one). */
export function nextLessonName(current: StudyCategory, lang: Lang = getLang()): string {
  const next = nextSection(current, enabledNow);
  const lesson = ALL_LESSONS.find((l) => l.category === next);
  if (lesson) return lessonLabel(lesson.key, lang);
  // Hebrew: joined to "ל" in the button ("המשך לעמוד הראשי")
  return { he: 'עמוד הראשי', en: 'the home page', fr: "la page d'accueil" }[lang];
}

export const TEXT_FONTS: { id: TextFont; label: string; family: string }[] = [
  { id: 'frank', label: 'פרנק רוהל', family: "'Frank Ruhl Libre', 'David Libre', 'Noto Serif Hebrew', serif" },
  { id: 'david', label: 'דוד', family: "'David Libre', 'Frank Ruhl Libre', serif" },
  { id: 'noto-serif', label: 'נוטו', family: "'Noto Serif Hebrew', 'Frank Ruhl Libre', serif" },
  { id: 'noto-sans', label: 'נוטו סאנס', family: "'Noto Sans Hebrew', 'Assistant', sans-serif" },
  { id: 'assistant', label: 'אסיסטנט', family: "'Assistant', 'Noto Sans Hebrew', sans-serif" },
];

export function textFontFamily(font?: TextFont): string {
  return (TEXT_FONTS.find((f) => f.id === font) || TEXT_FONTS[0]).family;
}
