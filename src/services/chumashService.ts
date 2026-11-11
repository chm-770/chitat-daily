import { Parasha, ChumashAliyah, ChumashVerse } from '../types/chitas';
import { BEREISHIT_COMPLETE } from '../data/bereishitComplete';
import { NOACH_COMPLETE } from '../data/noachComplete';
import { LECH_LECHA_COMPLETE } from '../data/lechLechaComplete';
import { VAYERA_COMPLETE } from '../data/vayeraComplete';
import { CHAYEI_SARA_COMPLETE } from '../data/chayeiSaraComplete';
import { TOLDOT_COMPLETE } from '../data/toldotComplete';
import { VEZOT_HABERACHAH_COMPLETE } from '../data/vezotHaberachahComplete';

export interface ParashaListItem {
  id: string;
  name: string;
  book: 'בראשית' | 'שמות' | 'ויקרא' | 'במדבר' | 'דברים';
  englishRef: string;
}

export const ALL_PARASHIYOT: ParashaListItem[] = [
  // בראשית
  { id: 'bereishit', name: 'בְּרֵאשִׁית', book: 'בראשית', englishRef: 'Genesis 1:1-6:8' },
  { id: 'noach', name: 'נֹחַ', book: 'בראשית', englishRef: 'Genesis 6:9-11:32' },
  { id: 'lech_lecha', name: 'לֶךְ־לְךָ', book: 'בראשית', englishRef: 'Genesis 12:1-17:27' },
  { id: 'vayera', name: 'וַיֵּרָא', book: 'בראשית', englishRef: 'Genesis 18:1-22:24' },
  { id: 'chayei_sara', name: 'חַיֵּי שָׂרָה', book: 'בראשית', englishRef: 'Genesis 23:1-25:18' },
  { id: 'toldot', name: 'תּוֹלְדֹת', book: 'בראשית', englishRef: 'Genesis 25:19-28:9' },
  { id: 'vayetzei', name: 'וַיֵּצֵא', book: 'בראשית', englishRef: 'Genesis 28:10-32:3' },
  { id: 'vayishlach', name: 'וַיִּשְׁלַח', book: 'בראשית', englishRef: 'Genesis 32:4-36:43' },
  { id: 'vayeshev', name: 'וַיֵּשֶׁב', book: 'בראשית', englishRef: 'Genesis 37:1-40:23' },
  { id: 'miketz', name: 'מִקֵּץ', book: 'בראשית', englishRef: 'Genesis 41:1-44:17' },
  { id: 'vayigash', name: 'וַיִּגַּשׁ', book: 'בראשית', englishRef: 'Genesis 44:18-47:27' },
  { id: 'vayechi', name: 'וַיְחִי', book: 'בראשית', englishRef: 'Genesis 47:28-50:26' },

  // שמות
  { id: 'shemot', name: 'שְׁמוֹת', book: 'שמות', englishRef: 'Exodus 1:1-6:1' },
  { id: 'vaera', name: 'וָאֵרָא', book: 'שמות', englishRef: 'Exodus 6:2-9:35' },
  { id: 'bo', name: 'בֹּא', book: 'שמות', englishRef: 'Exodus 10:1-13:16' },
  { id: 'beshalach', name: 'בְּשַׁלַּח', book: 'שמות', englishRef: 'Exodus 13:17-17:16' },
  { id: 'yitro', name: 'יִתְרוֹ', book: 'שמות', englishRef: 'Exodus 18:1-20:23' },
  { id: 'mishpatim', name: 'מִשְׁפָּטִים', book: 'שמות', englishRef: 'Exodus 21:1-24:18' },
  { id: 'terumah', name: 'תְּרוּמָה', book: 'שמות', englishRef: 'Exodus 25:1-27:19' },
  { id: 'tetzaveh', name: 'תְּצַוֶּה', book: 'שמות', englishRef: 'Exodus 27:20-30:10' },
  { id: 'ki_tisa', name: 'כִּי תִשָּׂא', book: 'שמות', englishRef: 'Exodus 30:11-34:35' },
  { id: 'vayakhel', name: 'וַיַּקְהֵל', book: 'שמות', englishRef: 'Exodus 35:1-38:20' },
  { id: 'pekudei', name: 'פְקוּדֵי', book: 'שמות', englishRef: 'Exodus 38:21-40:38' },

  // ויקרא
  { id: 'vayikra', name: 'וַיִּקְרָא', book: 'ויקרא', englishRef: 'Leviticus 1:1-5:26' },
  { id: 'tzav', name: 'צַו', book: 'ויקרא', englishRef: 'Leviticus 6:1-8:36' },
  { id: 'shmini', name: 'שְׁמִינִי', book: 'ויקרא', englishRef: 'Leviticus 9:1-11:47' },
  { id: 'tazria', name: 'תַּזְרִיעַ', book: 'ויקרא', englishRef: 'Leviticus 12:1-13:59' },
  { id: 'metzora', name: 'מְצֹרָע', book: 'ויקרא', englishRef: 'Leviticus 14:1-15:33' },
  { id: 'acharei_mot', name: 'אַחֲרֵי מוֹת', book: 'ויקרא', englishRef: 'Leviticus 16:1-18:30' },
  { id: 'kedoshim', name: 'קְדֹשִׁים', book: 'ויקרא', englishRef: 'Leviticus 19:1-20:27' },
  { id: 'emor', name: 'אֱמֹר', book: 'ויקרא', englishRef: 'Leviticus 21:1-24:23' },
  { id: 'behar', name: 'בְּהַר', book: 'ויקרא', englishRef: 'Leviticus 25:1-26:2' },
  { id: 'bechukotai', name: 'בְּחֻקֹּתַי', book: 'ויקרא', englishRef: 'Leviticus 26:3-27:34' },

  // במדבר
  { id: 'bamidbar', name: 'בְּמִדְבַּר', book: 'במדבר', englishRef: 'Numbers 1:1-4:20' },
  { id: 'nasso', name: 'נָשׂא', book: 'במדבר', englishRef: 'Numbers 4:21-7:89' },
  { id: 'behaalotcha', name: 'בְּהַעֲלֹתְךָ', book: 'במדבר', englishRef: 'Numbers 8:1-12:16' },
  { id: 'shelach', name: 'שְׁלַח־לְךָ', book: 'במדבר', englishRef: 'Numbers 13:1-15:41' },
  { id: 'korach', name: 'קֹרַח', book: 'במדבר', englishRef: 'Numbers 16:1-18:32' },
  { id: 'chukat', name: 'חֻקַּת', book: 'במדבר', englishRef: 'Numbers 19:1-22:1' },
  { id: 'balak', name: 'בָּלָק', book: 'במדבר', englishRef: 'Numbers 22:2-25:9' },
  { id: 'pinchas', name: 'פִּינְחָס', book: 'במדבר', englishRef: 'Numbers 25:10-30:1' },
  { id: 'matot', name: 'מַטּוֹת', book: 'במדבר', englishRef: 'Numbers 30:2-32:42' },
  { id: 'masei', name: 'מַסְעֵי', book: 'במדבר', englishRef: 'Numbers 33:1-36:13' },

  // דברים
  { id: 'devarim', name: 'דְּבָרִים', book: 'דברים', englishRef: 'Deuteronomy 1:1-3:22' },
  { id: 'vaetchanan', name: 'וָאֶתְחַנַּן', book: 'דברים', englishRef: 'Deuteronomy 3:23-7:11' },
  { id: 'ekev', name: 'עֵקֶב', book: 'דברים', englishRef: 'Deuteronomy 7:12-11:25' },
  { id: 'reeh', name: 'רְאֵה', book: 'דברים', englishRef: 'Deuteronomy 11:26-16:17' },
  { id: 'shoftim', name: 'שֹׁפְטִים', book: 'דברים', englishRef: 'Deuteronomy 16:18-21:9' },
  { id: 'ki_teitzei', name: 'כִּי־תֵצֵא', book: 'דברים', englishRef: 'Deuteronomy 21:10-25:19' },
  { id: 'ki_tavo', name: 'כִּי־תָבוֹא', book: 'דברים', englishRef: 'Deuteronomy 26:1-29:8' },
  { id: 'nitzavim', name: 'נִצָּבִים', book: 'דברים', englishRef: 'Deuteronomy 29:9-30:20' },
  { id: 'vayelech', name: 'וַיֵּלֶךְ', book: 'דברים', englishRef: 'Deuteronomy 31:1-31:30' },
  { id: 'haazinu', name: 'הַאֲזִינוּ', book: 'דברים', englishRef: 'Deuteronomy 32:1-32:52' },
  { id: 'vezot_haberachah', name: 'וְזֹאת הַבְּרָכָה', book: 'דברים', englishRef: 'Deuteronomy 33:1-34:12' },

  // פרשיות מחוברות
  { id: 'vayakhel_pekudei', name: 'וַיַּקְהֵל־פְקוּדֵי', book: 'שמות', englishRef: 'Exodus 35:1-40:38' },
  { id: 'tazria_metzora', name: 'תַּזְרִיעַ־מְצֹרָע', book: 'ויקרא', englishRef: 'Leviticus 12:1-15:33' },
  { id: 'acharei_mot_kedoshim', name: 'אַחֲרֵי מוֹת־קְדֹשִׁים', book: 'ויקרא', englishRef: 'Leviticus 16:1-20:27' },
  { id: 'behar_bechukotai', name: 'בְּהַר־בְּחֻקֹּתַי', book: 'ויקרא', englishRef: 'Leviticus 25:1-27:34' },
  { id: 'chukat_balak', name: 'חֻקַּת־בָּלָק', book: 'במדבר', englishRef: 'Numbers 19:1-25:9' },
  { id: 'matot_masei', name: 'מַטּוֹת־מַסְעֵי', book: 'במדבר', englishRef: 'Numbers 30:2-36:13' },
  { id: 'nitzavim_vayelech', name: 'נִצָּבִים־וַיֵּלֶךְ', book: 'דברים', englishRef: 'Deuteronomy 29:9-31:30' },
];

// בראשית and וזאת הברכה are NOT listed here: their built-in copies had wrong aliyah
// divisions, so they are loaded from the book databases (parashiyot/*.json).
// All parashiyot are loaded from the book databases (parashiyot/*.json), whose Rashi is aligned
// with Sefaria by chapter and verse (scripts/chumash/rebuild_rashi.py). The older built-in copies
// are no longer used for display.
export const BUILTIN_PARASHIYOT: Record<string, Parasha> = {};

/** Removes the open/closed section markers ({פ} / {ס}) that come from the source text. */
function stripSectionMarkers(parasha: Parasha): Parasha {
  return {
    ...parasha,
    aliyot: parasha.aliyot.map((a) => ({
      ...a,
      verses: a.verses.map((v) => ({
        ...v,
        hebrew: stripCantillation(
          v.hebrew
            .replace(/\uFB20/g, 'ע')
            .replace(/\s*\{[פס]\}\s*/g, ' ')
            .replace(/\s+/g, ' ')
        ),
        rashi: v.rashi?.map((r) => r.replace(/\uFB20/g, 'ע').replace(/\u05BD/g, '')),
      })),
    })),
  };
}

// In-memory cache for dynamically fetched parashiyot
const parashaCache: Record<string, Parasha> = {};

export function cleanVerseText(s: string): string {
  if (!s) return '';
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&thinsp;/gi, ' ')
    .replace(/&rlm;/gi, '')
    .replace(/&lrm;/gi, '')
    .replace(/\uFB20/g, 'ע')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanRashiText(s: string): string {
  if (!s) return '';
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&thinsp;/gi, ' ')
    .replace(/&rlm;/gi, '')
    .replace(/&lrm;/gi, '')
    .replace(/\uFB20/g, 'ע')
    .replace(/<(?!\/?b\b)[^>]+>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(s: string): string {
  return cleanVerseText(s);
}

import { getExactJewishDateInfo } from '../utils/jewishCalendarService';

/**
 * Fetch the current Parashat Hashavua based on the authentic Jewish calendar
 */
export async function getCurrentParashaInfo(dateInput: Date = new Date()): Promise<{
  id: string;
  name: string;
  isHoliday?: boolean;
  holidayName?: string;
  upcomingShabbatName?: string;
}> {
  const exact = getExactJewishDateInfo(dateInput);

  return {
    id: exact.parashaId,
    name: exact.parashaName,
    isHoliday: exact.isHoliday,
    holidayName: exact.holidayName,
    upcomingShabbatName: exact.upcomingShabbatName,
  };
}

import { getLeyningForParsha } from '@hebcal/leyning';
import { stripCantillation } from '../utils/hebrewText';

const LEYNING_PARASHA_NAMES: Record<string, string> = {
  bereishit: 'Bereshit',
  noach: 'Noach',
  lech_lecha: 'Lech-Lecha',
  vayera: 'Vayera',
  chayei_sara: 'Chayei Sara',
  toldot: 'Toldot',
  vayetzei: 'Vayetzei',
  vayishlach: 'Vayishlach',
  vayeshev: 'Vayeshev',
  miketz: 'Miketz',
  vayigash: 'Vayigash',
  vayechi: 'Vayechi',
  shemot: 'Shemot',
  vaera: 'Vaera',
  bo: 'Bo',
  beshalach: 'Beshalach',
  yitro: 'Yitro',
  mishpatim: 'Mishpatim',
  terumah: 'Terumah',
  tetzaveh: 'Tetzaveh',
  ki_tisa: 'Ki Tisa',
  vayakhel: 'Vayakhel',
  pekudei: 'Pekudei',
  vayikra: 'Vayikra',
  tzav: 'Tzav',
  shmini: 'Shmini',
  tazria: 'Tazria',
  metzora: 'Metzora',
  acharei_mot: 'Achrei Mot',
  kedoshim: 'Kedoshim',
  emor: 'Emor',
  behar: 'Behar',
  bechukotai: 'Bechukotai',
  bamidbar: 'Bamidbar',
  nasso: 'Nasso',
  behaalotcha: "Beha'alotcha",
  shelach: "Sh'lach",
  korach: 'Korach',
  chukat: 'Chukat',
  balak: 'Balak',
  pinchas: 'Pinchas',
  matot: 'Matot',
  masei: 'Masei',
  devarim: 'Devarim',
  vaetchanan: 'Vaetchanan',
  ekev: 'Eikev',
  reeh: "Re'eh",
  shoftim: 'Shoftim',
  ki_teitzei: 'Ki Teitzei',
  ki_tavo: 'Ki Tavo',
  nitzavim: 'Nitzavim',
  vayelech: 'Vayeilech',
  haazinu: "Ha'azinu",
  vezot_haberachah: 'Vezot Haberakhah',
  // פרשיות מחוברות
  vayakhel_pekudei: 'Vayakhel-Pekudei',
  tazria_metzora: 'Tazria-Metzora',
  acharei_mot_kedoshim: 'Achrei Mot-Kedoshim',
  behar_bechukotai: 'Behar-Bechukotai',
  chukat_balak: 'Chukat-Balak',
  matot_masei: 'Matot-Masei',
  nitzavim_vayelech: 'Nitzavim-Vayeilech',
};

// Lazy-loaded parashiyot book databases (covers all 54 parashiyot with 100% full Rashi offline)
const bookDatabases: Record<string, Record<string, Parasha>> = {};

async function loadBookParashiyot(book: string): Promise<Record<string, Parasha>> {
  if (bookDatabases[book]) return bookDatabases[book];

  let mod: any = null;
  switch (book) {
    case 'בראשית':
      mod = await import('../data/parashiyot/bereishit.json');
      break;
    case 'שמות':
      mod = await import('../data/parashiyot/shemot.json');
      break;
    case 'ויקרא':
      mod = await import('../data/parashiyot/vayikra.json');
      break;
    case 'במדבר':
      mod = await import('../data/parashiyot/bamidbar.json');
      break;
    case 'דברים':
      mod = await import('../data/parashiyot/devarim.json');
      break;
    default:
      mod = await import('../data/parashiyot/bereishit.json');
      break;
  }

  const data = (mod.default || mod) as Record<string, Parasha>;
  bookDatabases[book] = data;
  return data;
}

/**
 * Load complete Parasha with all 7 aliyot, all verses and authentic Rashi commentary
 */
export async function getParashaData(parashaId: string): Promise<Parasha> {
  // 1. Check memory cache
  if (parashaCache[parashaId]) {
    return parashaCache[parashaId];
  }

  // 2. Check built-in complete parashiyot (instantaneous, 100% offline, full Rashi)
  if (BUILTIN_PARASHIYOT[parashaId]) {
    parashaCache[parashaId] = stripSectionMarkers(BUILTIN_PARASHIYOT[parashaId]);
    return parashaCache[parashaId];
  }

  // 3. Load from pre-bundled book database (all 54 parashiyot, 100% of Rashi, completely offline)
  const meta = ALL_PARASHIYOT.find((p) => p.id === parashaId);
  if (meta) {
    try {
      const bookData = await loadBookParashiyot(meta.book);
      if (bookData && bookData[parashaId]) {
        parashaCache[parashaId] = stripSectionMarkers(bookData[parashaId]);
        return parashaCache[parashaId];
      }
    } catch (e) {
      console.warn(`Failed loading prebundled book ${meta.book}:`, e);
    }
  }

  // 4. Check persistent localStorage cache
  try {
    const cached = localStorage.getItem(`chitas_parasha_${parashaId}`);
    if (cached) {
      const parsed: Parasha = JSON.parse(cached);
      if (
        !parsed.isError &&
        parsed.aliyot &&
        parsed.aliyot.length === 7 &&
        parsed.aliyot.every((a) => a.verses && a.verses.length > 0)
      ) {
        parashaCache[parashaId] = parsed;
        return parsed;
      } else {
        localStorage.removeItem(`chitas_parasha_${parashaId}`);
      }
    }
  } catch {
    // Ignore storage parse error
  }

  if (!meta) {
    return {
      id: parashaId,
      name: 'שגיאה',
      book: 'בראשית',
      englishName: parashaId,
      aliyot: [],
      isError: true,
      errorMessage: pick(STRINGS).notFound,
    };
  }

  // 5. Dynamically fetch Parasha with real Aliyot and full Rashi from Sefaria
  try {
    const leyningName = LEYNING_PARASHA_NAMES[parashaId];
    if (leyningName) {
      const leyning = getLeyningForParsha(leyningName);
      if (leyning && leyning.fullkriyah) {
        const aliyotKeys = ['1', '2', '3', '4', '5', '6', '7'];
        const aliyotNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שביעי'];
        const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום ששי', 'שבת קודש'];

        const aliyot: ChumashAliyah[] = [];

        for (let i = 0; i < 7; i++) {
          const k = aliyotKeys[i];
          const al = (leyning.fullkriyah as any)[k];
          if (!al) continue;

          const ref = `${al.k}.${al.b}-${al.e}`;
          const rashiRef = `Rashi_on_${al.k}.${al.b}-${al.e}`;

          const [tRes, rRes] = await Promise.all([
            fetch(`https://www.sefaria.org/api/texts/${ref}?context=0`).then((r) => r.json()).catch(() => null),
            fetch(`https://www.sefaria.org/api/texts/${rashiRef}?context=0`).then((r) => r.json()).catch(() => null),
          ]);

          const verses: ChumashVerse[] = [];
          const isCrossChapter = tRes && Array.isArray(tRes.he) && Array.isArray(tRes.he[0]);
          const [startCh, startVs] = (al.b || '1:1').split(':').map(Number);

          if (isCrossChapter) {
            const tChapters = (tRes.he || []) as string[][];
            const rChapters = (rRes?.he || []) as any[][];

            let vTotalIdx = 0;
            tChapters.forEach((tCh, chIdx) => {
              const currentChapter = startCh + chIdx;
              const rCh = rChapters[chIdx] || [];
              tCh.forEach((vText, vIdx) => {
                vTotalIdx++;
                const currentVerse = chIdx === 0 ? startVs + vIdx : vIdx + 1;
                const vComms = rCh[vIdx];
                let rashiArr: string[] = [];
                if (Array.isArray(vComms)) {
                  rashiArr = vComms.map(cleanRashiText).filter(Boolean);
                } else if (typeof vComms === 'string' && vComms.trim()) {
                  rashiArr = [cleanRashiText(vComms)];
                }

                verses.push({
                  number: vTotalIdx,
                  chapter: currentChapter,
                  verseInChapter: currentVerse,
                  hebrew: cleanVerseText(vText),
                  rashi: rashiArr,
                });
              });
            });
          } else {
            const tVerses = (tRes?.he || []) as string[];
            const rVerses = (rRes?.he || []) as any[];

            tVerses.forEach((vText, vIdx) => {
              const currentVerse = startVs + vIdx;
              const vComms = rVerses[vIdx];
              let rashiArr: string[] = [];
              if (Array.isArray(vComms)) {
                rashiArr = vComms.map(cleanRashiText).filter(Boolean);
              } else if (typeof vComms === 'string' && vComms.trim()) {
                rashiArr = [cleanRashiText(vComms)];
              }

              verses.push({
                number: vIdx + 1,
                chapter: startCh,
                verseInChapter: currentVerse,
                hebrew: cleanVerseText(vText),
                rashi: rashiArr,
              });
            });
          }

          aliyot.push({
            aliyahNumber: (i + 1) as any,
            aliyahName: aliyotNames[i],
            dayOfWeek: days[i],
            rangeDescription: `${al.b} – ${al.e}`,
            summary: `עליית ${aliyotNames[i]} בפרשת ${meta.name} (${al.b} – ${al.e})`,
            verses,
          });
        }

        const allValid = aliyot.length === 7 && aliyot.every((a) => a.verses && a.verses.length > 0);
        if (allValid) {
          const dynamicParasha: Parasha = {
            id: meta.id,
            name: meta.name,
            book: meta.book,
            englishName: meta.id,
            aliyot,
          };

          parashaCache[parashaId] = dynamicParasha;
          try {
            localStorage.setItem(`chitas_parasha_${parashaId}`, JSON.stringify(dynamicParasha));
          } catch {
            // Ignore quota
          }
          return dynamicParasha;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to dynamically fetch parasha with Rashi from Sefaria', e);
  }

  // Fallback: If it's bereishit return built-in, else return clear error
  if (parashaId === 'bereishit') {
    return BEREISHIT_COMPLETE;
  }

  return {
    id: meta.id,
    name: meta.name,
    book: meta.book,
    englishName: meta.id,
    aliyot: [],
    isError: true,
    errorMessage: pick(STRINGS).loadError,
  };
}

import { HAAZINU_SHVII_ALIYAH } from '../data/haazinuComplete';
import { pick } from '../i18n';

/** Interface messages (the parasha names, aliyot and verses stay in Hebrew). */
const STRINGS = {
  he: {
    notFound: 'פרשה לא נמצאה.',
    loadError: 'שגיאה בטעינת הפרשה מספריא. לא ניתן היה להוריד את הפסוקים.',
  },
  en: {
    notFound: 'Parasha not found.',
    loadError: 'Could not load the parasha from Sefaria. The verses could not be downloaded.',
  },
  fr: {
    notFound: 'Paracha introuvable.',
    loadError: "Erreur de chargement de la Paracha depuis Sefaria. Les versets n'ont pas pu être téléchargés.",
  },
};

/**
 * Returns the 7th aliyah of LAST WEEK's parasha (שבת קודש של שבוע שעבר)
 */
export async function getPreviousParashaShviiAliyah(currentParashaId: string): Promise<{
  parashaName: string;
  parashaId: string;
  aliyah: ChumashAliyah;
}> {
  if (currentParashaId === 'vezot_haberachah') {
    return {
      parashaId: 'haazinu',
      parashaName: 'הַאֲזִינוּ',
      aliyah: HAAZINU_SHVII_ALIYAH,
    };
  }

  if (currentParashaId === 'bereishit') {
    return {
      parashaId: 'vezot_haberachah',
      parashaName: 'וְזֹאת הַבְּרָכָה',
      aliyah: {
        ...(await getParashaData('vezot_haberachah')).aliyot[6],
        dayOfWeek: 'שבת שעברה (פרשת וְזֹאת הַבְּרָכָה)',
      },
    };
  }

  if (currentParashaId === 'noach') {
    return {
      parashaId: 'bereishit',
      parashaName: 'בְּרֵאשִׁית',
      aliyah: {
        ...(await getParashaData('bereishit')).aliyot[6],
        dayOfWeek: 'שבת שעברה (פרשת בְּרֵאשִׁית)',
      },
    };
  }

  if (currentParashaId === 'lech_lecha') {
    return {
      parashaId: 'noach',
      parashaName: 'נֹחַ',
      aliyah: {
        ...NOACH_COMPLETE.aliyot[6],
        dayOfWeek: 'שבת שעברה (פרשת נֹחַ)',
      },
    };
  }

  const idx = ALL_PARASHIYOT.findIndex((p) => p.id === currentParashaId);
  const prevIdx = (idx - 1 + ALL_PARASHIYOT.length) % ALL_PARASHIYOT.length;
  const prevMeta = ALL_PARASHIYOT[prevIdx] || ALL_PARASHIYOT[0];

  try {
    const prevParasha = await getParashaData(prevMeta.id);
    const shvii =
      prevParasha.aliyot.find((a) => a.aliyahNumber === 7) ||
      prevParasha.aliyot[6] ||
      BEREISHIT_COMPLETE.aliyot[6];

    return {
      parashaId: prevMeta.id,
      parashaName: prevMeta.name,
      aliyah: {
        ...shvii,
        dayOfWeek: `שבת שעברה (פרשת ${prevMeta.name})`,
      },
    };
  } catch {
    return {
      parashaId: 'bereishit',
      parashaName: 'בְּרֵאשִׁית',
      aliyah: {
        ...BEREISHIT_COMPLETE.aliyot[6],
        dayOfWeek: 'שבת שעברה (פרשת בְּרֵאשִׁית)',
      },
    };
  }
}
