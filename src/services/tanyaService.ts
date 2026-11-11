import { HDate } from '@hebcal/core';
import { pick } from '../i18n';

/** Interface messages (the Tanya text, chapter names and Hebrew dates stay in Hebrew). */
const STRINGS = {
  he: { notFound: (day: string) => `לא נמצא שיעור תניא עבור יום ${day} בלוח השיעורים.` },
  en: { notFound: (day: string) => `No Tanya lesson was found for ${day} in the schedule.` },
  fr: { notFound: (day: string) => `Aucun cours de Tanya n'a été trouvé pour le ${day} dans le calendrier.` },
};

export interface TanyaDailyPortion {
  dateHebrew: string;
  hebrewRef: string;
  bookPart: string;
  chapter: string;
  isLeapYear: boolean;
  cycleNote: string;
  paragraphs: string[];
}

interface TanyaEntry {
  dateTag: string;
  bookPart: string;
  cycle: string;
  chapter?: string;
  text: string;
}

let dbCache: Record<string, TanyaEntry> | null = null;

async function getTanyaDatabase(): Promise<Record<string, TanyaEntry>> {
  if (dbCache) return dbCache;
  const mod = await import('../data/tanyaUnifiedDatabase.json');
  dbCache = (mod.default || mod) as Record<string, TanyaEntry>;
  return dbCache;
}

const HEBREW_DAYS_NUM: Record<number, string> = {
  1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
  11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו', 16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט', 20: 'כ',
  21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה', 26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט', 30: 'ל',
};

const HEBREW_NUMERALS_DISPLAY: Record<number, string> = {
  1: "א׳", 2: "ב׳", 3: "ג׳", 4: "ד׳", 5: "ה׳", 6: "ו׳", 7: "ז׳", 8: "ח׳", 9: "ט׳", 10: "י׳",
  11: "י״א", 12: "י״ב", 13: "י״ג", 14: "י״ד", 15: "ט״ו", 16: "ט״ז", 17: "י״ז", 18: "י״ח", 19: "י״ט", 20: "כ׳",
  21: "כ״א", 22: "כ״ב", 23: "כ״ג", 24: "כ״ד", 25: "כ״ה", 26: "כ״ו", 27: "כ״ז", 28: "כ״ח", 29: "כ״ט", 30: "ל׳",
};

const MONTH_SEARCH_MAP: Record<number, string[]> = {
  1: ['ניסן'],
  2: ['אייר'],
  3: ['סיון'],
  4: ['תמוז'],
  5: ['מנחם_אב', 'אב'],
  6: ['אלול'],
  7: ['תשרי'],
  8: ['חשון'],
  9: ['כסלו'],
  10: ['טבת'],
  11: ['שבט'],
  12: ['אדר', "אדר-א'"],
  13: ["אדר-ב'"],
};

const HEBREW_MONTH_DISPLAY: Record<number, string> = {
  1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'מנחם אב', 6: 'אלול',
  7: 'תשרי', 8: 'מרחשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר', 13: 'אדר ב׳',
};

/**
 * Determine if the current Tanya study cycle is a leap year.
 * The Tanya study cycle begins on 19 Kislev and concludes on 18 Kislev of the following year.
 * Therefore, in Tishrei (7), Cheshvan (8), and Kislev (9) before 19 Kislev,
 * the ongoing cycle is the one that started on 19 Kislev of the previous calendar year (currentHYear - 1).
 */
function isTanyaCycleLeapYear(date: Date): { isLeap: boolean; currentHYear: number } {
  const hdate = new HDate(date);
  const currentHYear = hdate.getFullYear();
  const month = hdate.getMonth(); // 7=Tishrei, 8=Cheshvan, 9=Kislev
  const day = hdate.getDate();

  let cycleYear = currentHYear;
  // If we are in Tishrei (7), Cheshvan (8), or Kislev (9) before 19th:
  if (month === 7 || month === 8 || (month === 9 && day < 19)) {
    cycleYear = currentHYear - 1;
  }
  const isLeap = HDate.isLeapYear(cycleYear);
  return { isLeap, currentHYear };
}

/**
 * Strip vowels / nikkud and cantillation marks from Hebrew text,
 * returning authentic, clean unpointed Hebrew as in the original Tanya editions.
 */
export function stripHebrewNikkud(text: string): string {
  if (!text) return '';
  return text.replace(/[\u0591-\u05BD\u05BF-\u05C2\u05C4-\u05C7]/g, '');
}

/**
 * Clean and format authentic text into paragraphs while preserving all words,
 * unvocalized without nikkud as in the original Tanya.
 */
function formatTextToParagraphs(text: string): string[] {
  if (!text) return [];

  const unpointedText = stripHebrewNikkud(text);

  // Split on double newlines or clean paragraph boundaries
  const rawParagraphs = unpointedText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (rawParagraphs.length > 1) {
    return rawParagraphs;
  }

  // If text is one single huge block, split into readable paragraph chunks naturally
  // around colon ':' or period '.' or 'כו׳' where sentences end
  const sentences = unpointedText.split(/(?<=[.:׃]|כו׳)\s+/);
  const paragraphs: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > 320) {
      if (currentChunk) paragraphs.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk.trim()) {
    paragraphs.push(currentChunk.trim());
  }

  return paragraphs.length > 0 ? paragraphs : [unpointedText];
}

/**
 * Extract a suitable chapter/section title from the portion text or book part
 */
function extractPortionTitle(bookPart: string, paragraphs: string[]): string {
  if (paragraphs.length === 0) return bookPart;

  const firstLine = paragraphs[0];

  // Check for common opening headings like "פרק ...", "איגרת ...", "קונטרס ...", "שער ..."
  const headingMatch = firstLine.match(/^(פרק\s+[א-ת״׳]+|איגרת\s+[א-ת״׳]+|קונטרס\s+[^\n]+|שער\s+[^\n]+)/);
  if (headingMatch) {
    return headingMatch[1];
  }

  // If first line starts with bold markers or short title
  if (firstLine.length < 50) {
    return `${bookPart} – ${firstLine}`;
  }

  return bookPart;
}

export async function getTanyaDailyPortion(date: Date = new Date()): Promise<TanyaDailyPortion> {
  const hdate = new HDate(date);
  const { isLeap } = isTanyaCycleLeapYear(date);
  const monthNum = hdate.getMonth();
  const dayNum = hdate.getDate();

  const dayStr = HEBREW_DAYS_NUM[dayNum] || `${dayNum}`;
  const dayDisplay = HEBREW_NUMERALS_DISPLAY[dayNum] || `${dayNum}`;
  let monthDisplay = HEBREW_MONTH_DISPLAY[monthNum] || 'תשרי';
  if (isLeap && monthNum === 12) {
    monthDisplay = 'אדר א׳';
  } else if (isLeap && monthNum === 13) {
    monthDisplay = 'אדר ב׳';
  }
  const displayTitle = `${dayDisplay} ב${monthDisplay}`;
  const cyclePrefix = isLeap ? 'leap' : 'regular';

  const searchMonthNames = MONTH_SEARCH_MAP[monthNum] || ['תשרי'];

  let entry: TanyaEntry | null = null;
  const tanyaDb = await getTanyaDatabase();

  // Direct lookup in authentic Tanya database
  for (const mName of searchMonthNames) {
    const key = `${cyclePrefix}_${dayStr}_${mName}`;
    if (tanyaDb[key]) {
      entry = tanyaDb[key];
      break;
    }
  }

  // If entry is missing for this day, return error message immediately (Rule 5: never substitute silently)
  if (!entry) {
    return {
      dateHebrew: displayTitle,
      hebrewRef: 'ספר התניא קדישא',
      bookPart: 'ספר התניא',
      chapter: '',
      isLeapYear: isLeap,
      cycleNote: isLeap ? 'שנה מעוברת' : 'שנה פשוטה',
      paragraphs: [pick(STRINGS).notFound(displayTitle)],
    };
  }

  // In a 29-day month the schedule's portion for day 30 is learned together with day 29.
  let rawText = entry.text || '';
  if (dayNum === 29 && hdate.daysInMonth() === 29) {
    for (const mName of searchMonthNames) {
      const extra = tanyaDb[`${cyclePrefix}_${HEBREW_DAYS_NUM[30]}_${mName}`];
      if (extra && extra.text) {
        rawText = `${rawText}\n\n${extra.text}`;
        break;
      }
    }
  }
  const bookPart = entry.bookPart || 'ספר התניא';
  const paragraphs = formatTextToParagraphs(rawText);

  // Determine authentic chapter / section heading directly from unified table entry
  let chapter = '';
  if (entry.chapter) {
    const val = entry.chapter;
    if (val.startsWith('פרק ')) {
      chapter = `${bookPart} – ${val}`;
    } else if (val.startsWith('שער היחוד והאמונה')) {
      chapter = val.replace('שער היחוד והאמונה ', 'שער היחוד והאמונה – ');
    } else if (val.startsWith('אגרת התשובה')) {
      chapter = val.replace('אגרת התשובה ', 'אגרת התשובה – ');
    } else {
      chapter = val;
    }
  }

  if (!chapter) {
    chapter = extractPortionTitle(bookPart, paragraphs);
    if (chapter === bookPart) {
      chapter = `${bookPart} – שיעור יומי`;
    }
  }

  return {
    dateHebrew: displayTitle,
    hebrewRef: bookPart,
    bookPart,
    chapter,
    isLeapYear: isLeap,
    cycleNote: isLeap ? 'שנה מעוברת' : 'שנה פשוטה',
    paragraphs,
  };
}
