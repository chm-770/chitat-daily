/**
 * Standard Hebrew Gematriya and Numeral Formatting
 * Formats numbers into standard Hebrew gematriya with correct gershayim and geresh.
 * Examples:
 *   1 -> א׳
 *   15 -> ט״ו
 *   16 -> ט״ז
 *   20 -> כ׳
 *   28 -> כ״ח
 *   106 -> ק״ו
 *   119 -> קי״ט
 *   150 -> ק״נ
 *   151 -> קנ״א
 *   176 -> קע״ו
 */

const ONES: Record<number, string> = {
  1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה',
  6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט',
};

const TENS: Record<number, string> = {
  10: 'י', 20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ',
  60: 'ס', 70: 'ע', 80: 'פ', 90: 'צ',
};

const HUNDREDS: Record<number, string> = {
  100: 'ק', 200: 'ר', 300: 'ש', 400: 'ת',
};

export function toHebrewNumeral(num: number): string {
  if (num <= 0) return `${num}`;

  let n = num;
  let raw = '';

  // Thousands (if >= 1000)
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    raw += toHebrewNumeral(thousands) + ' ';
    n %= 1000;
  }

  // Hundreds (400, 300, 200, 100, handling 500+ with tav combinations)
  while (n >= 400) {
    raw += 'ת';
    n -= 400;
  }
  if (n >= 300) {
    raw += 'ש';
    n -= 300;
  } else if (n >= 200) {
    raw += 'ר';
    n -= 200;
  } else if (n >= 100) {
    raw += 'ק';
    n -= 100;
  }

  // Special Jewish cases for 15 and 16
  if (n === 15) {
    raw += 'טו';
    n = 0;
  } else if (n === 16) {
    raw += 'טז';
    n = 0;
  } else {
    // Tens
    const tensVal = Math.floor(n / 10) * 10;
    if (tensVal > 0) {
      raw += TENS[tensVal] || '';
      n %= 10;
    }
    // Ones
    if (n > 0) {
      raw += ONES[n] || '';
      n = 0;
    }
  }

  const clean = raw.trim();
  if (clean.length === 0) return `${num}`;

  // Add geresh (׳) for single letter, gershayim (״) before last letter for multi-letter
  if (clean.length === 1) {
    return `${clean}׳`;
  }
  return `${clean.slice(0, -1)}״${clean.slice(-1)}`;
}

export function formatVerseRef(chapter: number, verse: number): string {
  return `פרק ${toHebrewNumeral(chapter)}, פסוק ${toHebrewNumeral(verse)}`;
}

export function formatChapterRef(chapter: number): string {
  return `פרק ${toHebrewNumeral(chapter)}`;
}
