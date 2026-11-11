import { DailyStudyKey, StudyCategory, TextFont } from '../types/chitas';

export const ALL_LESSONS: { key: DailyStudyKey; category: StudyCategory; label: string }[] = [
  { key: 'chumash', category: 'chumash', label: 'חומש עם רש״י' },
  { key: 'tehillim', category: 'tehillim', label: 'תהילים' },
  { key: 'tanya', category: 'tanya', label: 'תניא' },
  { key: 'hayomYom', category: 'hayom_yom', label: 'היום יום' },
  { key: 'rambam', category: 'rambam', label: 'רמב״ם' },
];

export function enabledLessonKeys(enabled?: DailyStudyKey[]): DailyStudyKey[] {
  const list = enabled && enabled.length > 0 ? enabled : ALL_LESSONS.map((l) => l.key);
  return ALL_LESSONS.map((l) => l.key).filter((k) => list.includes(k));
}

/** Sections in order: the home page, then the lessons the user learns. */
export function sectionSequence(enabled?: DailyStudyKey[]): StudyCategory[] {
  const keys = enabledLessonKeys(enabled);
  return ['overview', ...ALL_LESSONS.filter((l) => keys.includes(l.key)).map((l) => l.category)];
}

/** The section after `current` (back to the home page after the last lesson). */
export function nextSection(current: StudyCategory, enabled?: DailyStudyKey[]): StudyCategory {
  const seq = sectionSequence(enabled);
  const i = seq.indexOf(current);
  return i >= 0 && i < seq.length - 1 ? seq[i + 1] : 'overview';
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
