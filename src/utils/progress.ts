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

/** Percentage (0-100) of the 5 daily lessons completed on that day, or null if nothing was saved. */
export function getDayProgressPercent(dateKey: string): number | null {
  const p = loadProgress(dateKey);
  if (!p) return null;
  const done = STUDY_KEYS.filter((k) => Boolean(p[k])).length;
  return Math.round((done / STUDY_KEYS.length) * 100);
}
