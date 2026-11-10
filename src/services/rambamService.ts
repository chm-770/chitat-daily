import { RambamTrack } from '../types/chitas';
import RAMBAM_MITZVOT_HEADERS from '../data/rambamMitzvotHeaders.json';
import { HDate } from '@hebcal/core';
import {
  DailyRambam3Event,
  DailyRambamEvent,
  dailyRambam1,
  dailyRambam3,
  seferHaMitzvot,
} from '@hebcal/learning';
import { toHebrewNumeral } from '../utils/hebrewNumerals';
import { getHebrewDateInfo, HebrewDateInfo } from '../utils/hebrewCalendar';

export interface RambamChapter {
  id: string;
  heRef: string;
  chapterTitle: string;
  mitzvotIntro?: string;
  halachot: string[];
}

export interface RambamDailyLesson {
  track: RambamTrack;
  trackTitle: string;
  hebrewDate: string;
  chapters: RambamChapter[];
  errorMessage?: string;
}

export function getHebrewNumeral(num: number): string {
  return toHebrewNumeral(num);
}

const memoryCache: Record<string, RambamDailyLesson> = {};

function cleanHalachaText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<small>[^<]*<\/small>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&thinsp;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\uFB20/g, 'ע')
    .trim();
}

export const RAMBAM_BOOK_HEBREW_NAMES: Record<string, string> = {
  'Transmission of the Oral Law': 'הקדמת הרמב״ם (מסירת תורה שבעל פה)',
  'Introduction': 'הקדמת הרמב״ם',
  'Positive Commandments': 'מצוות עשה',
  'Negative Commandments': 'מצוות לא תעשה',
  'Positive Mitzvot': 'מצוות עשה',
  'Negative Mitzvot': 'מצוות לא תעשה',
  'Overview of Mishneh Torah Contents': 'תוכן החיבור',
  'Foundations of the Torah': 'הלכות יסודי התורה',
  'Human Dispositions': 'הלכות דעות',
  'Torah Study': 'הלכות תלמוד תורה',
  'Foreign Worship and Customs of the Nations': 'הלכות עבודה זרה וחקות הגוים',
  'Repentance': 'הלכות תשובה',
  'Reading the Shema': 'הלכות קריאת שמע',
  'Prayer and the Priestly Blessing': 'הלכות תפילה וברכת כהנים',
  'The Order of Prayer': 'נוסח התפילה',
  'Tefillin, Mezuzah and the Torah Scroll': 'הלכות תפילין ומזוזה וספר תורה',
  'Fringes': 'הלכות ציצית',
  'Blessings': 'הלכות ברכות',
  'Circumcision': 'הלכות מילה',
  'Sabbath': 'הלכות שבת',
  'Eruvin': 'הלכות עירובין',
  'Rest on the Tenth of Tishrei': 'הלכות שביתת עשור',
  'Rest on a Holiday': 'הלכות שביתת יום טוב',
  'Leavened and Unleavened Bread': 'הלכות חמץ ומצה',
  'Shofar, Sukkah and Lulav': 'הלכות שופר וסוכה ולולב',
  'Sheqel Dues': 'הלכות שקלים',
  'Sanctification of the New Month': 'הלכות קידוש החודש',
  'Fasts': 'הלכות תעניות',
  'Scroll of Esther and Hanukkah': 'הלכות מגילה וחנוכה',
  'Marriage': 'הלכות אישות',
  'Divorce': 'הלכות גירושין',
  'Levirate Marriage and Release': 'הלכות יבום וחליצה',
  'Virgin Maiden': 'הלכות נערה בתולה',
  'Woman Suspected of Infidelity': 'הלכות סוטה',
  'Forbidden Intercourse': 'הלכות איסורי ביאה',
  'Forbidden Foods': 'הלכות מאכלות אסורות',
  'Ritual Slaughter': 'הלכות שחיטה',
  'Oaths': 'הלכות שבועות',
  'Vows': 'הלכות נדרים',
  'Nazariteship': 'הלכות נזירות',
  'Appraisals and Devoted Property': 'הלכות ערכין וחרמין',
  'Kilayim': 'הלכות כלאים',
  'Gifts to the Poor': 'הלכות מתנות עניים',
  'Heave Offerings': 'הלכות תרומות',
  'First Tithes': 'הלכות מעשרות',
  'Second Tithes and Fourth Year\'s Fruit': 'הלכות מעשר שני ונטע רבעי',
  'First Fruits and other Gifts to Priests Outside the Sanctuary': 'הלכות ביכורים ושאר מתנות כהונה שבגבולין',
  'Sabbatical Year and the Jubilee': 'הלכות שמיטה ויובל',
  'The Chosen Temple': 'הלכות בית הבחירה',
  'Vessels of the Sanctuary and Those who Serve Therein': 'הלכות כלי המקדש והעובדים בו',
  'Admission into the Sanctuary': 'הלכות ביאת המקדש',
  'Things Forbidden on the Altar': 'הלכות איסורי מזבח',
  'Sacrificial Procedure': 'הלכות מעשה הקרבנות',
  'Daily Offerings and Additional Offerings': 'הלכות תמידין ומוספין',
  'Sacrificial Invalidation': 'הלכות פסולי המוקדשין',
  'Service on the Day of Atonement': 'הלכות עבודת יום הכפורים',
  'Trespass': 'הלכות מעילה',
  'Festal Offering': 'הלכות חגיגה',
  'Firstlings': 'הלכות בכורות',
  'Offerings for Unintentional Transgressions': 'הלכות שגגות',
  'Offerings for Those with Incomplete Atonement': 'הלכות מחוסרי כפרה',
  'Substitution': 'הלכות תמורה',
  'Defilement by a Corpse': 'הלכות טומאת מת',
  'Red Heifer': 'הלכות פרה אדומה',
  'Defilement by Leprosy': 'הלכות טומאת צרעת',
  'Those Who Defile Bed or Seat': 'הלכות מטמאי משכב ומושב',
  'Other Sources of Defilement': 'הלכות שאר אבות הטומאות',
  'Defilement of Foods': 'הלכות טומאת אוכלין',
  'Vessels': 'הלכות כלים',
  'Immersion Pools': 'הלכות מקואות',
  'Damages to Property': 'הלכות נזקי ממון',
  'Theft': 'הלכות גניבה',
  'Robbery and Lost Property': 'הלכות גזילה ואבידה',
  'One Who Injures a Person or Property': 'הלכות חובל ומזיק',
  'Murderer and the Preservation of Life': 'הלכות רוצח ושמירת נפש',
  'Sales': 'הלכות מכירה',
  'Ownerless Property and Gifts': 'הלכות זכייה ומתנה',
  'Neighbors': 'הלכות שכנים',
  'Agents and Partners': 'הלכות שלוחין ושותפין',
  'Slaves': 'הלכות עבדים',
  'Hiring': 'הלכות שכירות',
  'Borrowing and Depositing': 'הלכות שאלה ופקדון',
  'Creditor and Debtor': 'הלכות מלוה ולוה',
  'Plaintiff and Defendant': 'הלכות טוען ונטען',
  'Inheritances': 'הלכות נחלות',
  'The Sanhedrin and the Penalties within their Jurisdiction': 'הלכות סנהדרין והעונשין המסורין להם',
  'Testimony': 'הלכות עדות',
  'Rebels': 'הלכות ממרים',
  'Mourning': 'הלכות אבל',
  'Kings and Wars': 'הלכות מלכים ומלחמות',
};

export function getRambamBookHebrewName(baseRef: string): string {
  const clean = baseRef
    .replace(/^משנה תורה,?\s*/, '')
    .replace(/^Mishneh Torah,?\s*/i, '')
    .replace(/_/g, ' ')
    .replace(/\s*\d+.*$/, '')
    .trim();

  if (RAMBAM_BOOK_HEBREW_NAMES[clean]) {
    return RAMBAM_BOOK_HEBREW_NAMES[clean];
  }
  for (const [enKey, heVal] of Object.entries(RAMBAM_BOOK_HEBREW_NAMES)) {
    if (clean.toLowerCase() === enKey.toLowerCase()) return heVal;
  }
  return clean;
}

/**
 * Locate the Rambam's introductory count and list of Mitzvot for this set of Halachot.
 * Must NEVER be shown over the Introduction (הקדמה) or unrelated chapters!
 */
function findMitzvotIntro(heRef: string, chapterNumber: number): string | undefined {
  if (chapterNumber !== 1) return undefined;
  if (
    /הקדמה|Introduction|מסירת תורה שבעל פה|Transmission|מניין המצוות|מנין המצוות|Positive Commandments|Negative Commandments|נוסח|תפלה|תפילה|הגדה|Haggadah/i.test(
      heRef
    )
  ) {
    return undefined;
  }

  const cleaned = heRef
    .replace(/^משנה תורה,?\s*/, '')
    .replace(/\s+[א-ת״׳0-9]+(-[א-ת״׳0-9]+)?$/, '')
    .trim();

  const headers = RAMBAM_MITZVOT_HEADERS as Record<string, string>;
  if (headers[cleaned]) return headers[cleaned];

  for (const [key, val] of Object.entries(headers)) {
    if (cleaned === key) return val;
    const cleanNoHilchot = key.replace(/^הלכות\s+/, '');
    if (cleaned.endsWith(cleanNoHilchot)) return val;
  }
  return undefined;
}

async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getRambamDailyLesson(
  date: Date = new Date(),
  track: RambamTrack = 'three_chapters',
  dateInfoParam?: HebrewDateInfo
): Promise<RambamDailyLesson> {
  const dateInfo = dateInfoParam || getHebrewDateInfo(date);
  const isoDate = formatDateISO(date);
  const dateKey = `${isoDate}_${track}`;

  if (memoryCache[dateKey]) {
    return memoryCache[dateKey];
  }

  try {
    const cached = localStorage.getItem(`chitas_rambam_v11_${dateKey}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.chapters && parsed.chapters.length > 0) {
        memoryCache[dateKey] = parsed;
        return parsed;
      }
    }
  } catch {}

  const trackTitle =
    track === 'three_chapters'
      ? 'ג׳ פרקים ליום'
      : track === 'one_chapter'
      ? 'פרק אחד ליום'
      : 'ספר המצוות';

  // 1. Compute the daily schedule locally (same Chabad cycles hebcal.com uses), so it works
  //    offline and also on days when the 3 chapters span two different sets of Halachot.
  const hd = new HDate(date);
  const smReading = seferHaMitzvot(hd);
  const scheduledRefs: string[] = [];
  try {
    const events =
      track === 'three_chapters'
        ? new DailyRambam3Event(hd, dailyRambam3(hd)).events
        : [new DailyRambamEvent(hd, dailyRambam1(hd))];
    for (const ev of events) {
      const match = (ev.url() || '').match(/sefaria\.org\/([^?]+)/);
      if (match) scheduledRefs.push(decodeURIComponent(match[1]));
    }
  } catch (err) {
    console.warn('Could not compute daily Rambam schedule:', err);
  }

  // --- Track: Sefer HaMitzvot ---
  if (track === 'sefer_hamitzvot') {
    if (!smReading) {
      return {
        track,
        trackTitle,
        hebrewDate: `${dateInfo.dayOfMonthHebrew} ${dateInfo.monthName}`,
        errorMessage: 'לא נמצא שיעור ספר המצוות לתאריך זה בלוח השיעורים.',
        chapters: [],
      };
    }

    // e.g. "P232, N258, N259" / "Principle 1-3" / "Nusach HaTefila, Order of Prayer"
    const title: string = smReading.reading || '';
    const chapters: RambamChapter[] = [];

    async function fetchNusachTefilah(): Promise<RambamChapter | null> {
      try {
        const res = await fetchWithRetry(
          'https://www.sefaria.org/api/v3/texts/Mishneh_Torah,_The_Order_of_Prayer?version=hebrew'
        );
        const ver = res.versions?.find((v: any) => v.language === 'he');
        const raw = Array.isArray(ver?.text)
          ? ver.text.flat(2).join('\n\n')
          : ver?.text || '';
        return {
          id: 'nusach_hatefila',
          heRef: 'סדר תפלות כל השנה (נוסח התפילה)',
          chapterTitle: 'סדר תפלות כל השנה – נוסח התפילה',
          halachot: cleanHalachaText(raw).split(/\n\n+/).filter(Boolean),
        };
      } catch (e) {
        console.warn('Could not load nusach hatefilah:', e);
        return null;
      }
    }

    async function fetchNusachHaggadah(): Promise<RambamChapter | null> {
      try {
        const res = await fetchWithRetry(
          'https://www.sefaria.org/api/v3/texts/Mishneh_Torah,_Leavened_and_Unleavened_Bread.9?version=hebrew'
        );
        const ver = res.versions?.find((v: any) => v.language === 'he');
        const raw = Array.isArray(ver?.text) ? ver.text.flat().join('\n\n') : ver?.text || '';
        return {
          id: 'nusach_hahaggadah',
          heRef: 'נוסח ההגדה',
          chapterTitle: 'נוסח ההגדה',
          halachot: cleanHalachaText(raw).split(/\n\n+/).filter(Boolean),
        };
      } catch (e) {
        console.warn('Could not load nusach hahaggadah:', e);
        return null;
      }
    }

    async function fetchMegillahChapters(megChapters: number[]): Promise<RambamChapter[]> {
      const chaps: RambamChapter[] = [];
      for (const mCh of megChapters) {
        const cHeb = toHebrewNumeral(mCh);
        let mText = '';
        try {
          const mRes = await fetchWithRetry(
            `https://www.sefaria.org/api/v3/texts/Mishneh_Torah,_Scroll_of_Esther_and_Hanukkah.${mCh}`
          );
          const ver = mRes.versions?.find((v: any) => v.language === 'he');
          mText = Array.isArray(ver?.text) ? ver.text.flat().join('\n\n') : ver?.text || '';
        } catch (e) {
          console.warn(`Could not load Megillah ch ${mCh}:`, e);
        }
        chaps.push({
          id: `megillah_chanukah_${mCh}`,
          heRef: `משנה תורה, הלכות מגילה וחנוכה פרק ${cHeb}`,
          chapterTitle: `הלכות מגילה וחנוכה – פרק ${cHeb}`,
          halachot: cleanHalachaText(mText).split(/\n\n+/).filter(Boolean),
        });
      }
      return chaps;
    }

    async function fetchMitzvah(type: 'P' | 'N', num: number): Promise<RambamChapter | null> {
      const isPos = type === 'P';
      const numHeb = toHebrewNumeral(num);
      const mTitle = isPos ? `מצות עשה ${numHeb}` : `מצות לא תעשה ${numHeb}`;
      const url = isPos
        ? `https://www.sefaria.org/api/v3/texts/Sefer_HaMitzvot,_Positive_Commandments.${num}`
        : `https://www.sefaria.org/api/v3/texts/Sefer_HaMitzvot,_Negative_Commandments.${num}`;
      try {
        const apiRes = await fetchWithRetry(url);
        const ver = apiRes.versions?.find((v: any) => v.language === 'he');
        const fullText = Array.isArray(ver?.text) ? ver.text.flat().join('\n\n') : ver?.text || '';
        return {
          id: isPos ? `mitzvah_aseh_${num}` : `mitzvah_lotaseh_${num}`,
          heRef: `ספר המצוות, ${mTitle}`,
          chapterTitle: mTitle,
          halachot: cleanHalachaText(fullText).split(/\n\n+/).filter(Boolean),
        };
      } catch (e) {
        console.warn(`Could not load mitzvah ${type}${num}:`, e);
        return null;
      }
    }

    try {
      // 1. Parse tokens sequentially across the title to match authentic Chabad.org daily order
      const tokenRegex = /(P\d+|N\d+|Introduction|Principle\s+\d+(?:-\d+)?|Order of Prayer|Nusach HaTefila|Text of the Haggadah|Haggadah|Megillah and Chanukah(?: Chapters? (\d+)-(\d+))?)/gi;
      const matches = [...title.matchAll(tokenRegex)];

      for (const m of matches) {
        const rawToken = m[1];
        if (!rawToken) continue;

        if (/^P\d+$/i.test(rawToken)) {
          const num = parseInt(rawToken.slice(1), 10);
          const ch = await fetchMitzvah('P', num);
          if (ch) chapters.push(ch);
        } else if (/^N\d+$/i.test(rawToken)) {
          const num = parseInt(rawToken.slice(1), 10);
          const ch = await fetchMitzvah('N', num);
          if (ch) chapters.push(ch);
        } else if (/Introduction/i.test(rawToken)) {
          const introRes = await fetchWithRetry(
            'https://www.sefaria.org/api/v3/texts/Sefer_HaMitzvot,_Introductions,_The_Rambam%27s_Introduction'
          );
          const ver = introRes.versions?.find((v: any) => v.language === 'he');
          const raw = Array.isArray(ver?.text) ? ver.text.flat().join('\n\n') : ver?.text || '';
          chapters.push({
            id: 'sefer_hamitzvot_intro',
            heRef: 'הקדמת הרמב״ם לספר המצוות',
            chapterTitle: 'הקדמת הרמב״ם לספר המצוות',
            halachot: cleanHalachaText(raw).split(/\n\n+/).filter(Boolean),
          });
        } else if (/Principle/i.test(rawToken)) {
          const pMatch = rawToken.match(/Principle\s+(\d+)(?:-(\d+))?/i);
          if (pMatch) {
            const pStart = parseInt(pMatch[1], 10);
            const pEnd = pMatch[2] ? parseInt(pMatch[2], 10) : pStart;
            for (let pNum = pStart; pNum <= pEnd; pNum++) {
              const pHeb = toHebrewNumeral(pNum);
              const sTitle = `ספר המצוות – שורש ${pHeb}`;
              let pText = '';
              try {
                const sRes = await fetchWithRetry(
                  `https://www.sefaria.org/api/v3/texts/Sefer_HaMitzvot,_Shorashim.${pNum}`
                );
                const ver = sRes.versions?.find((v: any) => v.language === 'he');
                pText = Array.isArray(ver?.text) ? ver.text.flat().join('\n\n') : ver?.text || '';
              } catch (e) {
                console.warn(`Could not load shoresh ${pNum}:`, e);
              }
              chapters.push({
                id: `sefer_hamitzvot_shoresh_${pNum}`,
                heRef: `ספר המצוות, שורש ${pHeb}`,
                chapterTitle: sTitle,
                halachot: cleanHalachaText(pText).split(/\n\n+/).filter(Boolean),
              });
            }
          }
        } else if (/Order of Prayer|Nusach HaTefila/i.test(rawToken)) {
          if (!chapters.some((c) => c.id === 'nusach_hatefila')) {
            const tefilahChap = await fetchNusachTefilah();
            if (tefilahChap) chapters.push(tefilahChap);
          }
        } else if (/Haggadah|Text of the Haggadah/i.test(rawToken)) {
          if (!chapters.some((c) => c.id === 'nusach_hahaggadah')) {
            const hagChap = await fetchNusachHaggadah();
            if (hagChap) chapters.push(hagChap);
          }
        } else if (/Megillah and Chanukah/i.test(rawToken)) {
          let megChs = [1, 2];
          if (m[2] && m[3]) {
            megChs = [parseInt(m[2], 10), parseInt(m[3], 10)];
          } else if (title.includes('3-4') || (!dateInfo.monthName.includes('אדר') && !title.includes('1-2'))) {
            megChs = [3, 4];
          }
          const megChaps = await fetchMegillahChapters(megChs);
          for (const mc of megChaps) {
            if (!chapters.some((c) => c.id === mc.id)) {
              chapters.push(mc);
            }
          }
        }
      }

      if (chapters.length > 0) {
        const lesson: RambamDailyLesson = {
          track,
          trackTitle,
          hebrewDate: `${dateInfo.dayOfMonthHebrew} ${dateInfo.monthName}`,
          chapters,
        };

        memoryCache[dateKey] = lesson;
        try {
          localStorage.setItem(`chitas_rambam_v11_${dateKey}`, JSON.stringify(lesson));
        } catch {}

        return lesson;
      }
    } catch (err: any) {
      console.warn('Error loading Sefer HaMitzvot:', err);
    }

    return {
      track,
      trackTitle,
      hebrewDate: `${dateInfo.dayOfMonthHebrew} ${dateInfo.monthName}`,
      errorMessage: 'שגיאה בטעינת שיעור ספר המצוות ליום זה מהשרת. אנא בדוק את החיבור לרשת ונסה שנית.',
      chapters: [],
    };
  }

  // --- Track: Mishneh Torah (3 Chapters / 1 Chapter) ---
  try {
    let sefariaRefs: string[] = [...scheduledRefs];

    // Fallback to Sefaria calendar API if needed
    if (sefariaRefs.length === 0) {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const calData = await fetchWithRetry(`https://www.sefaria.org/api/calendars?year=${y}&month=${m}&day=${d}`);
      const calItems: any[] = calData.calendar_items || [];
      const matching = calItems.filter((i) =>
        track === 'three_chapters'
          ? i.title?.en === 'Daily Rambam (3 Chapters)'
          : i.title?.en === 'Daily Rambam'
      );
      sefariaRefs = matching.map((i) => i.ref).filter(Boolean);
    }

    if (sefariaRefs.length > 0) {
      const chapters: RambamChapter[] = [];

      for (const ref of sefariaRefs) {
        const textData = await fetchWithRetry(
          `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(ref)}`
        );
        const heVersion = textData.versions?.find((v: any) => v.language === 'he');
        const textContent = heVersion?.text;

        if (Array.isArray(textContent)) {
          const isNested = Array.isArray(textContent[0]);

          if (isNested) {
            const baseRefMatch = ref.match(/^(.*?)\s*(\d+)-(\d+)$/);
            const baseName = baseRefMatch ? baseRefMatch[1] : ref;
            const startChap = baseRefMatch ? parseInt(baseRefMatch[2], 10) : 1;

            textContent.forEach((chapHalachot: any[], idx: number) => {
              if (Array.isArray(chapHalachot)) {
                const chapNum = startChap + idx;
                const cNumStr = toHebrewNumeral(chapNum);
                // Extract official halachot book name from Sefaria heIndexTitle or getRambamBookHebrewName
                const halachotName = (
                  textData.heIndexTitle?.replace(/^משנה תורה,?\s*/, '') ||
                  getRambamBookHebrewName(baseName)
                ).trim();

                const isIntro = /הקדמה|מסירת תורה שבעל פה|Introduction|Transmission/i.test(ref) || /הקדמה|מסירת תורה שבעל פה/i.test(halachotName);
                const isMinyan = /מניין המצוות|מנין המצוות|מצוות עשה|מצוות לא תעשה|Positive Commandments|Negative Commandments|Positive Mitzvot|Negative Mitzvot/i.test(ref) || /מניין המצוות|מנין המצוות|מצוות עשה|מצוות לא תעשה/i.test(halachotName);
                const isOverview = /תוכן החיבור|Overview of Mishneh Torah Contents/i.test(ref) || /תוכן החיבור/i.test(halachotName);
                const isTefilahNusach = /נוסח התפילה|Order of Prayer/i.test(ref) || /נוסח התפילה/i.test(halachotName);
                const isHaggadahNusach = /הגדה|Haggadah/i.test(ref) || /הגדה/i.test(halachotName);
                const isSpecialNoChapter = isIntro || isMinyan || isOverview || isTefilahNusach || isHaggadahNusach;

                const chapterTitle = isSpecialNoChapter ? halachotName : `${halachotName} – פרק ${cNumStr}`;
                const heRef = isSpecialNoChapter ? halachotName : `${halachotName} פרק ${cNumStr}`;
                const mitzvotIntro = isSpecialNoChapter ? undefined : findMitzvotIntro(heRef, chapNum);

                const cleanH = chapHalachot
                  .filter((h) => typeof h === 'string')
                  .map(cleanHalachaText)
                  .filter((h) => h.length > 0);

                chapters.push({
                  id: `${ref}_ch${chapNum}`,
                  heRef,
                  chapterTitle,
                  mitzvotIntro,
                  halachot: cleanH,
                });
              }
            });
          } else {
            const actualChapterNum = parseInt(
              (textData.sections && textData.sections[0]) ||
              (ref.match(/(\d+)$/) || [])[1] ||
              '1',
              10
            );
            const cNumStr = toHebrewNumeral(actualChapterNum);
            const halachotName = (
              textData.heIndexTitle?.replace(/^משנה תורה,?\s*/, '') ||
              getRambamBookHebrewName(ref)
            ).trim();

            const isIntro = /הקדמה|מסירת תורה שבעל פה|Introduction|Transmission/i.test(ref) || /הקדמה|מסירת תורה שבעל פה/i.test(halachotName);
            const isMinyan = /מניין המצוות|מנין המצוות|מצוות עשה|מצוות לא תעשה|Positive Commandments|Negative Commandments|Positive Mitzvot|Negative Mitzvot/i.test(ref) || /מניין המצוות|מנין המצוות|מצוות עשה|מצוות לא תעשה/i.test(halachotName);
            const isOverview = /תוכן החיבור|Overview of Mishneh Torah Contents/i.test(ref) || /תוכן החיבור/i.test(halachotName);
            const isTefilahNusach = /נוסח התפילה|Order of Prayer/i.test(ref) || /נוסח התפילה/i.test(halachotName);
            const isHaggadahNusach = /הגדה|Haggadah/i.test(ref) || /הגדה/i.test(halachotName);
            const isSpecialNoChapter = isIntro || isMinyan || isOverview || isTefilahNusach || isHaggadahNusach;

            const chapterTitle = isSpecialNoChapter ? halachotName : `${halachotName} – פרק ${cNumStr}`;
            const heRef = isSpecialNoChapter ? halachotName : `${halachotName} פרק ${cNumStr}`;
            const mitzvotIntro = isSpecialNoChapter ? undefined : findMitzvotIntro(heRef, actualChapterNum);

            const rawHalachot = textContent
              .filter((h) => typeof h === 'string')
              .map(cleanHalachaText)
              .filter((h) => h.length > 0);

            chapters.push({
              id: ref,
              heRef,
              chapterTitle,
              mitzvotIntro,
              halachot: rawHalachot,
            });
          }
        }
      }

      if (chapters.length > 0) {
        const lesson: RambamDailyLesson = {
          track,
          trackTitle,
          hebrewDate: `${dateInfo.dayOfMonthHebrew} ${dateInfo.monthName}`,
          chapters,
        };

        memoryCache[dateKey] = lesson;
        try {
          localStorage.setItem(`chitas_rambam_v11_${dateKey}`, JSON.stringify(lesson));
        } catch {}

        return lesson;
      }
    }
  } catch (err) {
    console.warn('Error fetching daily Rambam from Sefaria:', err);
  }

  // Clear error message, never substitute another day or fall back quietly
  return {
    track,
    trackTitle,
    hebrewDate: `${dateInfo.dayOfMonthHebrew} ${dateInfo.monthName}`,
    errorMessage: 'שגיאה בטעינת שיעור הרמב״ם ליום זה מהשרת. אנא בדוק את החיבור לרשת ונסה שנית.',
    chapters: [],
  };
}
