export interface HebrewDateInfo {
  date?: Date;
  dayOfMonth: number;
  dayOfMonthHebrew: string;
  monthName: string;
  monthNumber: number; // 7 = Tishrei, 8 = Cheshvan, etc.
  yearHebrew: string;
  dayOfWeekHebrew: string;
  dayOfWeekIndex: number; // 0 for Sunday, 6 for Saturday
  parashaName: string;
  isShabbat: boolean;
  isHoliday?: boolean;
  holidayName?: string;
  upcomingShabbatIsHoliday?: boolean;
  upcomingShabbatName?: string;
  chumashAliyahName: string;
  tehillimMonthlyPortion: string;
  tanyaPortionName: string;
  daysInMonth?: number;
}

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שבת קודש'];
const ALIYOT_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שביעי'];

const HEBREW_NUMERALS: Record<number, string> = {
  1: "א׳", 2: "ב׳", 3: "ג׳", 4: "ד׳", 5: "ה׳", 6: "ו׳", 7: "ז׳", 8: "ח׳", 9: "ט׳", 10: "י׳",
  11: "י״א", 12: "י״ב", 13: "י״ג", 14: "י״ד", 15: "ט״ו", 16: "ט״ז", 17: "י״ז", 18: "י״ח", 19: "י״ט", 20: "כ׳",
  21: "כ״א", 22: "כ״ב", 23: "כ״ג", 24: "כ״ד", 25: "כ״ה", 26: "כ״ו", 27: "כ״ז", 28: "כ״ח", 29: "כ״ט", 30: "ל׳"
};

import { toHebrewNumeral } from './hebrewNumerals';

export interface TehillimPortionItem {
  chapter: number;
  fromVerse?: number;
  toVerse?: number;
  customLabel?: string;
}

export function computeTehillimRangeTitle(
  items: TehillimPortionItem[],
  isShortMonthConclusion: boolean = false
): string {
  if (!items || items.length === 0) return '';
  if (isShortMonthConclusion) {
    return `פרקים ${toHebrewNumeral(140)} – ${toHebrewNumeral(150)} (סיום ספר התהילים לחודש חסר)`;
  }
  if (items.length === 1) {
    const it = items[0];
    if (it.fromVerse && it.toVerse) {
      const label = it.customLabel ? `, ${it.customLabel}` : '';
      return `פרק ${toHebrewNumeral(it.chapter)} (פסוקים ${toHebrewNumeral(it.fromVerse)} – ${toHebrewNumeral(it.toVerse)}${label})`;
    }
    return `פרק ${toHebrewNumeral(it.chapter)}`;
  }

  const firstCh = items[0].chapter;
  const lastCh = items[items.length - 1].chapter;
  const base = `פרקים ${toHebrewNumeral(firstCh)} – ${toHebrewNumeral(lastCh)}`;
  if (firstCh === 120 && lastCh === 134) {
    return `${base} (שיר המעלות)`;
  }
  return base;
}

const RAW_TEHILLIM_DAYS: Record<number, TehillimPortionItem[]> = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => ({ chapter: c })),
  2: [10, 11, 12, 13, 14, 15, 16, 17].map((c) => ({ chapter: c })),
  3: [18, 19, 20, 21, 22].map((c) => ({ chapter: c })),
  4: [23, 24, 25, 26, 27, 28].map((c) => ({ chapter: c })),
  5: [29, 30, 31, 32, 33, 34].map((c) => ({ chapter: c })),
  6: [35, 36, 37, 38].map((c) => ({ chapter: c })),
  7: [39, 40, 41, 42, 43].map((c) => ({ chapter: c })),
  8: [44, 45, 46, 47, 48].map((c) => ({ chapter: c })),
  9: [49, 50, 51, 52, 53, 54].map((c) => ({ chapter: c })),
  10: [55, 56, 57, 58, 59].map((c) => ({ chapter: c })),
  11: [60, 61, 62, 63, 64, 65].map((c) => ({ chapter: c })),
  12: [66, 67, 68].map((c) => ({ chapter: c })),
  13: [69, 70, 71].map((c) => ({ chapter: c })),
  14: [72, 73, 74, 75, 76].map((c) => ({ chapter: c })),
  15: [77, 78].map((c) => ({ chapter: c })),
  16: [79, 80, 81, 82].map((c) => ({ chapter: c })),
  17: [83, 84, 85, 86, 87].map((c) => ({ chapter: c })),
  18: [88, 89].map((c) => ({ chapter: c })),
  19: [90, 91, 92, 93, 94, 95, 96].map((c) => ({ chapter: c })),
  20: [97, 98, 99, 100, 101, 102, 103].map((c) => ({ chapter: c })),
  21: [104, 105].map((c) => ({ chapter: c })),
  22: [106, 107].map((c) => ({ chapter: c })),
  23: [108, 109, 110, 111, 112].map((c) => ({ chapter: c })),
  24: [113, 114, 115, 116, 117, 118].map((c) => ({ chapter: c })),
  25: [{ chapter: 119, fromVerse: 1, toVerse: 96, customLabel: "אותיות א׳–ל׳" }],
  26: [{ chapter: 119, fromVerse: 97, toVerse: 176, customLabel: "אותיות מ׳–ת׳" }],
  27: [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134].map((c) => ({ chapter: c })),
  28: [135, 136, 137, 138, 139].map((c) => ({ chapter: c })),
  29: [140, 141, 142, 143, 144].map((c) => ({ chapter: c })),
  30: [145, 146, 147, 148, 149, 150].map((c) => ({ chapter: c })),
};

// Monthly Tehillim division: Day 1 to 30, computed dynamically from items
export const TEHILLIM_MONTHLY_RANGES: Record<
  number,
  { range: string; numbers: number[]; items: TehillimPortionItem[] }
> = Object.fromEntries(
  Object.entries(RAW_TEHILLIM_DAYS).map(([dayStr, items]) => {
    const day = parseInt(dayStr, 10);
    return [
      day,
      {
        range: computeTehillimRangeTitle(items),
        numbers: Array.from(new Set(items.map((it) => it.chapter))),
        items,
      },
    ];
  })
);

import { getExactJewishDateInfo } from './jewishCalendarService';

export function getHebrewDateInfo(date: Date = new Date()): HebrewDateInfo {
  const exact = getExactJewishDateInfo(date);

  return {
    date,
    dayOfMonth: exact.dayOfMonth,
    dayOfMonthHebrew: exact.dayOfMonthHebrew,
    monthName: exact.monthName,
    monthNumber: exact.hdate.getMonth(),
    yearHebrew: exact.yearHebrew,
    dayOfWeekHebrew: exact.dayOfWeekHebrew,
    dayOfWeekIndex: exact.dayOfWeekIndex,
    parashaName: exact.parashaName,
    isShabbat: exact.isShabbat,
    isHoliday: exact.isHoliday,
    holidayName: exact.holidayName,
    upcomingShabbatIsHoliday: exact.upcomingShabbatIsHoliday,
    upcomingShabbatName: exact.upcomingShabbatName,
    chumashAliyahName: exact.chumashAliyahName,
    tehillimMonthlyPortion: exact.tehillimMonthlyPortion,
    tanyaPortionName: exact.tanyaPortionName,
    daysInMonth: exact.daysInMonth,
  };
}
