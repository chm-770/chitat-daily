import { stripCantillation } from '../utils/hebrewText';
import { SAMPLE_PSALMS } from '../data/tehillimData';
import {
  TEHILLIM_MONTHLY_RANGES,
  TehillimPortionItem,
  computeTehillimRangeTitle,
} from '../utils/hebrewCalendar';
import { toHebrewNumeral } from '../utils/hebrewNumerals';
import { pick } from '../i18n';

/** Interface messages (the psalms and their Hebrew titles stay in Hebrew). */
const STRINGS = {
  he: {
    loadError: (num: number) =>
      `מִזְמוֹר ${toHebrewNumeral(num)} – שגיאה בטעינת המזמור מהרשת. בדוק את החיבור לרשת ונסה שוב.`,
  },
  en: {
    loadError: (num: number) => `Psalm ${num} – could not be loaded. Check your connection and try again.`,
  },
  fr: {
    loadError: (num: number) => `Psaume ${num} – erreur de chargement. Vérifiez votre connexion et réessayez.`,
  },
};

export interface TehillimChapter {
  number: number;
  hebrewNumber: string;
  subTitle?: string;
  fromVerse?: number;
  toVerse?: number;
  verses: { number: number; text: string }[];
}

export function getHebrewChapterNumber(num: number): string {
  return toHebrewNumeral(num);
}

function cleanHebrewVerse(raw: string): string {
  return stripCantillation(raw)
    .replace(/<[^>]*>/g, '')
    .replace(/&thinsp;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\uFB20/g, 'ע')
    .replace(/\s*\{[פס]\}\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// In-memory cache for loaded full chapters
const inMemoryCache: Record<number, TehillimChapter> = {};

// Initialize with the bundled psalms, but only those stored complete (verses 1..n with no gaps).
// Psalm 91 in the bundled data is only partial and must be loaded in full.
SAMPLE_PSALMS.filter((p) => p.verses.every((v, i) => v.number === i + 1)).forEach((p) => {
  inMemoryCache[p.id] = {
    number: p.id,
    hebrewNumber: toHebrewNumeral(p.id),
    verses: p.verses.map((v) => ({ number: v.number, text: cleanHebrewVerse(v.text) })),
  };
});

/**
 * Fetch full chapter with retry logic (requirement 9)
 */
async function fetchFullPsalmWithRetry(num: number, retries = 2): Promise<TehillimChapter> {
  if (inMemoryCache[num]) {
    return inMemoryCache[num];
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(`chitas_tehillim_ch_${num}`);
    if (cached) {
      const parsed: TehillimChapter = JSON.parse(cached);
      parsed.verses = parsed.verses.map((v) => ({ ...v, text: cleanHebrewVerse(v.text) }));
      inMemoryCache[num] = parsed;
      return parsed;
    }
  } catch {
    // Ignore storage error
  }

  // Fetch with retry
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`https://www.sefaria.org/api/v3/texts/Psalms.${num}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const he = data.versions?.find((v: any) => v.language === 'he');
        if (he && Array.isArray(he.text)) {
          const verses = he.text.map((t: string, idx: number) => ({
            number: idx + 1,
            text: cleanHebrewVerse(t),
          }));

          const chapterObj: TehillimChapter = {
            number: num,
            hebrewNumber: toHebrewNumeral(num),
            verses,
          };

          inMemoryCache[num] = chapterObj;
          try {
            localStorage.setItem(`chitas_tehillim_ch_${num}`, JSON.stringify(chapterObj));
          } catch {
            // Ignore storage overflow
          }
          return chapterObj;
        }
      }
    } catch (err) {
      if (attempt === retries) {
        console.warn(`Failed to fetch Psalm ${num} after retries:`, err);
      } else {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }

  // Fallback chapter with error indication
  const fallback: TehillimChapter = {
    number: num,
    hebrewNumber: toHebrewNumeral(num),
    verses: [
      {
        number: 1,
        text: pick(STRINGS).loadError(num),
      },
    ],
  };
  return fallback;
}

export async function fetchPsalmChapter(
  num: number,
  fromVerse?: number,
  toVerse?: number,
  customLabel?: string
): Promise<TehillimChapter> {
  const full = await fetchFullPsalmWithRetry(num);

  if (!fromVerse && !toVerse) {
    return full;
  }

  const minV = fromVerse || 1;
  const maxV = toVerse || full.verses.length;
  const slicedVerses = full.verses.filter((v) => v.number >= minV && v.number <= maxV);
  const subLabel = customLabel ? `, ${customLabel}` : '';
  const subTitle = `פסוקים ${toHebrewNumeral(minV)} – ${toHebrewNumeral(maxV)}${subLabel}`;

  return {
    number: num,
    hebrewNumber: toHebrewNumeral(num),
    subTitle,
    fromVerse: minV,
    toVerse: maxV,
    verses: slicedVerses,
  };
}

export async function getTehillimChapters(numbers: number[]): Promise<TehillimChapter[]> {
  const promises = numbers.map((n) => fetchPsalmChapter(n));
  return Promise.all(promises);
}

export async function getTehillimForDayOfMonth(
  day: number,
  isShortMonth: boolean = false
): Promise<{
  dayOfMonth: number;
  rangeText: string;
  chapters: TehillimChapter[];
}> {
  const safeDay = Math.min(Math.max(day, 1), 30);
  let itemsToLoad: TehillimPortionItem[] = [];
  let isShortConclusion = false;

  if (isShortMonth && safeDay === 29) {
    isShortConclusion = true;
    itemsToLoad = [
      ...(TEHILLIM_MONTHLY_RANGES[29]?.items || []),
      ...(TEHILLIM_MONTHLY_RANGES[30]?.items || []),
    ];
  } else {
    itemsToLoad = TEHILLIM_MONTHLY_RANGES[safeDay]?.items || TEHILLIM_MONTHLY_RANGES[1].items;
  }

  const chapters = await Promise.all(
    itemsToLoad.map((item) =>
      fetchPsalmChapter(item.chapter, item.fromVerse, item.toVerse, item.customLabel)
    )
  );

  return {
    dayOfMonth: safeDay,
    rangeText: computeTehillimRangeTitle(itemsToLoad, isShortConclusion),
    chapters,
  };
}

const CUSTOM_PSALMS_KEY = 'chitas_custom_tehillim_chapters';

export function getCustomPsalmNumbers(): number[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PSALMS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  // Default: chapter 20 (יענך ה׳ ביום צרה) and chapter 124 (הקפיטל של הרבי מליובאוויטש)
  return [20, 124];
}

export function saveCustomPsalmNumbers(numbers: number[]): void {
  try {
    localStorage.setItem(CUSTOM_PSALMS_KEY, JSON.stringify(numbers));
    window.dispatchEvent(new CustomEvent('chitas_custom_psalms_updated', { detail: numbers }));
  } catch {
    // Ignore error
  }
}
