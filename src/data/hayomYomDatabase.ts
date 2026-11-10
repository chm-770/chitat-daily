import { HDate } from '@hebcal/core';
import { toHebrewNumeral } from '../utils/hebrewNumerals';
import { HebrewDateInfo } from '../utils/hebrewCalendar';
import ALL_HAYOM_YOM_DAYS from './hayomYomDatabase.json';

/**
 * חוק ברזל: אסור בשום אופן להמציא, לסכם או לנסח מחדש פתגמים או מנהגים של ספר ״היום יום״.
 * כל הטקסטים מועתקים מילה במילה מתוך ספר ״היום יום״ המקורי של חסידות חב״ד (הוצאת קה״ת).
 * בימים שנאמרו במקורם ביידיש: מובא הטקסט המקורי ביידיש, ולאחריו ״תרגום לעברית:״ והתרגום המדויק.
 * ללא ניקוד, ללא שורות תקציר שיעורים (חומש, תהילים, תניא), אלא אך ורק הפתגם/ההוראה היומית של הרבי.
 */

export interface AuthenticHayomYomDay {
  hebrewDate: string;
  monthName: string;
  dayNumber: number;
  monthNumber: number;
  dayTitle?: string;
  text: string[];
}

export const HEBREW_MONTH_NAMES_MAP: Record<number, string> = {
  1: 'ניסן',
  2: 'אייר',
  3: 'סיון',
  4: 'תמוז',
  5: 'מנחם אב',
  6: 'אלול',
  7: 'תשרי',
  8: 'מרחשון',
  9: 'כסלו',
  10: 'טבת',
  11: 'שבט',
  12: 'אדר',
  13: 'אדר ב׳',
};

export const SEFER_HAYOM_YOM: Record<string, AuthenticHayomYomDay> = ALL_HAYOM_YOM_DAYS as unknown as Record<string, AuthenticHayomYomDay>;

// Calendar line at the start of כ״ט חשון, e.g. "מברכים ר"ח כסלו. אמירת כל התהלים בהשכמה. יום התוועדות."
const PREVIOUS_DAY_CALENDAR_LINE = /^מברכים ר"ח [^.]*\.\s*אמירת כל התה[י]?לים בהשכמה\.\s*יום התוועדות\.\s*/;

/** Day label as written in the source, e.g. ד' / י"ד / כ"ט. */
function sourceDayLabel(day: number): string {
  const letters = toHebrewNumeral(day).replace(/[׳״'"]/g, '');
  return letters.length === 1 ? `${letters}'` : `${letters.slice(0, -1)}"${letters.slice(-1)}`;
}

/** Heading paragraphs that separate אדר א׳ and אדר ב׳ in a regular year, e.g. "ד' אדר א'". */
export function isAdarSectionHeading(paragraph: string): boolean {
  return /^\S{1,3} אדר [אב]'$/.test(paragraph.trim());
}

export function getHayomYomForHebrewDate(
  dayNumber: number,
  monthNumber: number,
  dateInfo?: HebrewDateInfo
): AuthenticHayomYomDay {
  // In a regular (non-leap) year, Adar shows the entries of both אדר א׳ and אדר ב׳ for that day,
  // each under its own heading.
  if (monthNumber === 12 && dateInfo?.date && !new HDate(dateInfo.date).isLeapYear()) {
    const adar1 = SEFER_HAYOM_YOM[`${dayNumber}_12`];
    const adar2 = SEFER_HAYOM_YOM[`${dayNumber}_13`];
    if (adar1?.text?.length && adar2?.text?.length) {
      const label = sourceDayLabel(dayNumber);
      return {
        ...adar1,
        hebrewDate: `${dateInfo.dayOfMonthHebrew || toHebrewNumeral(dayNumber)} ${dateInfo.monthName || 'אדר'}`,
        monthName: dateInfo.monthName || 'אדר',
        dayNumber,
        monthNumber,
        text: [`${label} אדר א'`, ...adar1.text, `${label} אדר ב'`, ...adar2.text],
      };
    }
  }

  const key = `${dayNumber}_${monthNumber}`;
  const dayEntry = SEFER_HAYOM_YOM[key];

  const monthName = dateInfo?.monthName || HEBREW_MONTH_NAMES_MAP[monthNumber] || 'חודש';
  const dayHebrewStr = dateInfo?.dayOfMonthHebrew || toHebrewNumeral(dayNumber);
  const fullHebrewDate = `${dayHebrewStr} ${monthName}`;

  if (dayEntry && dayEntry.text && dayEntry.text.length > 0) {
    const text = [...dayEntry.text];

    return {
      ...dayEntry,
      hebrewDate: fullHebrewDate,
      monthName,
      dayNumber,
      monthNumber,
      text,
    };
  }

  // ל׳ חשון / ל׳ כסלו: the original book has no entry for these days, because in the
  // years it was written (כסלו תש״ג, חשון תש״ד) these months had only 29 days.
  // By the owner's decision, show the פתגם of כ״ט (the previous day) on these days,
  // without the calendar line of כ״ט (מברכים החודש, אמירת תהלים, התוועדות).
  if (dayNumber === 30 && (monthNumber === 8 || monthNumber === 9)) {
    const previous = SEFER_HAYOM_YOM[`29_${monthNumber}`];
    if (previous && previous.text && previous.text.length > 0) {
      const text = previous.text
        .map((p) => p.replace(PREVIOUS_DAY_CALENDAR_LINE, '').trim())
        .filter((p) => p.length > 0);
      return {
        hebrewDate: fullHebrewDate,
        monthName,
        dayNumber,
        monthNumber,
        text,
      };
    }
  }

  // If day is missing or failed: clear error message, never substitute another day
  return {
    hebrewDate: fullHebrewDate,
    monthName,
    dayNumber,
    monthNumber,
    text: [
      `לא נמצא פתגם ״היום יום״ עבור תאריך ${fullHebrewDate}. אנא וודא כי התאריך תקין.`
    ]
  };
}
