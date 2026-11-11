import { DailyProgress } from '../types/chitas';

/** YYYY-MM-DD of the date in the user's local time zone (used as the progress storage key). */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const STUDY_KEYS = ['chumash', 'tehillim', 'tanya', 'hayomYom', 'rambam'] as const;

export function emptyProgress(dateKey: string): DailyProgress {
  return {
    date: dateKey,
    chumash: false,
    tehillim: false,
    tanya: false,
    hayomYom: false,
    rambam: false,
    readItemIds: {},
  };
}

export function loadProgress(dateKey: string): DailyProgress | null {
  try {
    const saved = localStorage.getItem(`chitas_progress_${dateKey}`);
    return saved ? (JSON.parse(saved) as DailyProgress) : null;
  } catch {
    return null;
  }
}

/** Percentage (0-100) of the daily lessons (the ones the user learns) completed on that day, or null if nothing was saved. */
export function getDayProgressPercent(
  dateKey: string,
  keys: readonly (typeof STUDY_KEYS)[number][] = STUDY_KEYS
): number | null {
  const p = loadProgress(dateKey);
  if (!p || keys.length === 0) return null;
  const done = keys.filter((k) => Boolean(p[k])).length;
  return Math.round((done / keys.length) * 100);
}
