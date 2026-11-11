import { HDate, Sedra } from '@hebcal/core';
import { TEHILLIM_MONTHLY_RANGES } from './hebrewCalendar';
import chaptersIndexData from '../data/tanyaChaptersIndex.json';
import { getSavedCity } from '../services/zmanimService';

/** True when the user's selected (or detected) city is in Israel. Defaults to Israel (Jerusalem). */
export function isUserInIsrael(): boolean {
  try {
    // A city the user chose decides; otherwise the answer to the first-launch question
    if (typeof localStorage !== 'undefined' && localStorage.getItem('chitas_user_city')) {
      return getSavedCity()?.isIsrael ?? true;
    }
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('chitas_settings') : null;
    const inIsrael = saved ? JSON.parse(saved).inIsrael : undefined;
    if (typeof inIsrael === 'boolean') return inIsrael;
    return getSavedCity()?.isIsrael ?? true;
  } catch {
    return true;
  }
}

export interface ExactJewishDateInfo {
  date: Date;
  hdate: HDate;
  dayOfMonth: number;
  dayOfMonthHebrew: string;
  monthName: string;
  yearHebrew: string;
  dayOfWeekIndex: number; // 0 = Sunday, 6 = Saturday
  dayOfWeekHebrew: string;
  isShabbat: boolean;
  isHoliday: boolean;
  holidayName?: string;
  upcomingShabbatIsHoliday: boolean;
  upcomingShabbatName: string;
  parashaId: string;
  parashaName: string;
  parashaHebrewTitle: string;
  chumashAliyahName: string;
  tehillimMonthlyPortion: string;
  tanyaPortionName: string;
  daysInMonth?: number;
}

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שבת קודש'];
const ALIYOT_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שביעי'];

const HEBREW_MONTH_NAMES: Record<number, string> = {
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

const HEBREW_NUMERALS: Record<number, string> = {
  1: "א׳", 2: "ב׳", 3: "ג׳", 4: "ד׳", 5: "ה׳", 6: "ו׳", 7: "ז׳", 8: "ח׳", 9: "ט׳", 10: "י׳",
  11: "י״א", 12: "י״ב", 13: "י״ג", 14: "י״ד", 15: "ט״ו", 16: "ט״ז", 17: "י״ז", 18: "י״ח", 19: "י״ט", 20: "כ׳",
  21: "כ״א", 22: "כ״ב", 23: "כ״ג", 24: "כ״ד", 25: "כ״ה", 26: "כ״ו", 27: "כ״ז", 28: "כ״ח", 29: "כ״ט", 30: "ל׳"
};

// Comprehensive map of Hebcal English Sedra / Parsha names to our canonical IDs and Hebrew names
export const HEBCAL_PARASHA_MAP: Record<string, { id: string; name: string; book: 'בראשית' | 'שמות' | 'ויקרא' | 'במדבר' | 'דברים' }> = {
  'Bereshit': { id: 'bereishit', name: 'בְּרֵאשִׁית', book: 'בראשית' },
  'Noach': { id: 'noach', name: 'נֹחַ', book: 'בראשית' },
  'Lech-Lecha': { id: 'lech_lecha', name: 'לֶךְ־לְךָ', book: 'בראשית' },
  'Vayera': { id: 'vayera', name: 'וַיֵּרָא', book: 'בראשית' },
  'Chayei Sara': { id: 'chayei_sara', name: 'חַיֵּי שָׂרָה', book: 'בראשית' },
  'Toldot': { id: 'toldot', name: 'תּוֹלְדֹת', book: 'בראשית' },
  'Vayetzei': { id: 'vayetzei', name: 'וַיֵּצֵא', book: 'בראשית' },
  'Vayishlach': { id: 'vayishlach', name: 'וַיִּשְׁלַח', book: 'בראשית' },
  'Vayeshev': { id: 'vayeshev', name: 'וַיֵּשֶׁב', book: 'בראשית' },
  'Miketz': { id: 'miketz', name: 'מִקֵּץ', book: 'בראשית' },
  'Vayigash': { id: 'vayigash', name: 'וַיִּגַּשׁ', book: 'בראשית' },
  'Vayechi': { id: 'vayechi', name: 'וַיְחִי', book: 'בראשית' },

  'Shemot': { id: 'shemot', name: 'שְׁמוֹת', book: 'שמות' },
  'Vaera': { id: 'vaera', name: 'וָאֵרָא', book: 'שמות' },
  'Bo': { id: 'bo', name: 'בֹּא', book: 'שמות' },
  'Beshalach': { id: 'beshalach', name: 'בְּשַׁלַּח', book: 'שמות' },
  'Yitro': { id: 'yitro', name: 'יִתְרוֹ', book: 'שמות' },
  'Mishpatim': { id: 'mishpatim', name: 'מִשְׁפָּטִים', book: 'שמות' },
  'Terumah': { id: 'terumah', name: 'תְּרוּמָה', book: 'שמות' },
  'Tetzaveh': { id: 'tetzaveh', name: 'תְּצַוֶּה', book: 'שמות' },
  'Ki Tisa': { id: 'ki_tisa', name: 'כִּי תִשָּׂא', book: 'שמות' },
  'Vayakhel': { id: 'vayakhel', name: 'וַיַּקְהֵל', book: 'שמות' },
  'Pekudei': { id: 'pekudei', name: 'פְקוּדֵי', book: 'שמות' },

  'Vayikra': { id: 'vayikra', name: 'וַיִּקְרָא', book: 'ויקרא' },
  'Tzav': { id: 'tzav', name: 'צַו', book: 'ויקרא' },
  'Shmini': { id: 'shmini', name: 'שְׁמִינִי', book: 'ויקרא' },
  'Tazria': { id: 'tazria', name: 'תַּזְרִיעַ', book: 'ויקרא' },
  'Metzora': { id: 'metzora', name: 'מְצֹרָע', book: 'ויקרא' },
  'Achrei Mot': { id: 'acharei_mot', name: 'אַחֲרֵי מוֹת', book: 'ויקרא' },
  'Kedoshim': { id: 'kedoshim', name: 'קְדֹשִׁים', book: 'ויקרא' },
  'Emor': { id: 'emor', name: 'אֱמֹר', book: 'ויקרא' },
  'Behar': { id: 'behar', name: 'בְּהַר', book: 'ויקרא' },
  'Bechukotai': { id: 'bechukotai', name: 'בְּחֻקֹּתַי', book: 'ויקרא' },

  'Bamidbar': { id: 'bamidbar', name: 'בְּמִדְבַּר', book: 'במדבר' },
  'Nasso': { id: 'nasso', name: 'נָשׂא', book: 'במדבר' },
  "Beha'alotcha": { id: 'behaalotcha', name: 'בְּהַעֲלֹתְךָ', book: 'במדבר' },
  "Sh'lach": { id: 'shelach', name: 'שְׁלַח־לְךָ', book: 'במדבר' },
  'Korach': { id: 'korach', name: 'קֹרַח', book: 'במדבר' },
  'Chukat': { id: 'chukat', name: 'חֻקַּת', book: 'במדבר' },
  'Balak': { id: 'balak', name: 'בָּלָק', book: 'במדבר' },
  'Pinchas': { id: 'pinchas', name: 'פִּינְחָס', book: 'במדבר' },
  'Matot': { id: 'matot', name: 'מַטּוֹת', book: 'במדבר' },
  'Masei': { id: 'masei', name: 'מַסְעֵי', book: 'במדבר' },

  'Devarim': { id: 'devarim', name: 'דְּבָרִים', book: 'דברים' },
  'Vaetchanan': { id: 'vaetchanan', name: 'וָאֶתְחַנַּן', book: 'דברים' },
  'Eikev': { id: 'ekev', name: 'עֵקֶב', book: 'דברים' },
  "Re'eh": { id: 'reeh', name: 'רְאֵה', book: 'דברים' },
  'Shoftim': { id: 'shoftim', name: 'שֹׁפְטִים', book: 'דברים' },
  'Ki Teitzei': { id: 'ki_teitzei', name: 'כִּי־תֵצֵא', book: 'דברים' },
  'Ki Tavo': { id: 'ki_tavo', name: 'כִּי־תָבוֹא', book: 'דברים' },
  'Nitzavim': { id: 'nitzavim', name: 'נִצָּבִים', book: 'דברים' },
  'Vayeilech': { id: 'vayelech', name: 'וַיֵּלֶךְ', book: 'דברים' },
  'Vayelech': { id: 'vayelech', name: 'וַיֵּלֶךְ', book: 'דברים' },
  "Ha'Azinu": { id: 'haazinu', name: 'הַאֲזִינוּ', book: 'דברים' },
  "Ha'azinu": { id: 'haazinu', name: 'הַאֲזִינוּ', book: 'דברים' },
  'Vezot Haberakhah': { id: 'vezot_haberachah', name: 'וְזֹאת הַבְּרָכָה', book: 'דברים' },

  // Connected (Doubled) Parashiyot
  'Vayakhel-Pekudei': { id: 'vayakhel_pekudei', name: 'וַיַּקְהֵל־פְקוּדֵי', book: 'שמות' },
  'Tazria-Metzora': { id: 'tazria_metzora', name: 'תַּזְרִיעַ־מְצֹרָע', book: 'ויקרא' },
  'Achrei Mot-Kedoshim': { id: 'acharei_mot_kedoshim', name: 'אַחֲרֵי מוֹת־קְדֹשִׁים', book: 'ויקרא' },
  'Acharei Mot-Kedoshim': { id: 'acharei_mot_kedoshim', name: 'אַחֲרֵי מוֹת־קְדֹשִׁים', book: 'ויקרא' },
  'Behar-Bechukotai': { id: 'behar_bechukotai', name: 'בְּהַר־בְּחֻקֹּתַי', book: 'ויקרא' },
  'Chukat-Balak': { id: 'chukat_balak', name: 'חֻקַּת־בָּלָק', book: 'במדבר' },
  'Matot-Masei': { id: 'matot_masei', name: 'מַטּוֹת־מַסְעֵי', book: 'במדבר' },
  'Nitzavim-Vayeilech': { id: 'nitzavim_vayelech', name: 'נִצָּבִים־וַיֵּלֶךְ', book: 'דברים' },
};

function stripHebrewNikkud(s: string): string {
  if (!s) return '';
  return s.replace(/[\u0591-\u05BD\u05BF-\u05C2\u05C4-\u05C7]/g, '').trim();
}

export function normalizeParashaKey(s: string): string {
  if (!s) return '';
  return s.toLowerCase().replace(/[^a-z]/g, '');
}

export function findParashaByRawName(rawName: string): {
  id: string;
  name: string;
  book: 'בראשית' | 'שמות' | 'ויקרא' | 'במדבר' | 'דברים';
} {
  if (!rawName) return HEBCAL_PARASHA_MAP['Bereshit'];
  if (HEBCAL_PARASHA_MAP[rawName]) return HEBCAL_PARASHA_MAP[rawName];

  // 1. Check English normalized match
  const normTarget = normalizeParashaKey(rawName);
  if (normTarget) {
    for (const [k, v] of Object.entries(HEBCAL_PARASHA_MAP)) {
      if (normalizeParashaKey(k) === normTarget) {
        return v;
      }
    }
  }

  // 2. Check Hebrew unpointed match
  const unpointedTarget = stripHebrewNikkud(rawName);
  for (const v of Object.values(HEBCAL_PARASHA_MAP)) {
    if (stripHebrewNikkud(v.name) === unpointedTarget || v.name === rawName) {
      return v;
    }
  }

  // 3. Handle joined names
  if (rawName.includes('-') || rawName.includes('־')) {
    const parts = rawName.split(/[-־]/);
    const unpointedParts = parts.map(stripHebrewNikkud).join('');
    for (const v of Object.values(HEBCAL_PARASHA_MAP)) {
      if (stripHebrewNikkud(v.name).replace(/[-־\s]/g, '') === unpointedParts) {
        return v;
      }
    }
  }

  return HEBCAL_PARASHA_MAP['Bereshit'];
}

// Hebrew translations for holiday names
const HOLIDAY_TRANSLATIONS: Record<string, string> = {
  'Rosh Hashana': 'ראש השנה',
  'Yom Kippur': 'יום הכיפורים',
  'Sukkot': 'חג הסוכות',
  'Shmini Atzeret': 'שמיני עצרת / שמחת תורה',
  'Simchat Torah': 'שמחת תורה',
  'Pesach': 'חג הפסח',
  'Shavuot': 'חג השבועות',
};

/**
 * Accurately calculate the exact Jewish date and the exact weekly Torah portion
 * based on the halachic Hebrew calendar rules.
 */
export function getExactJewishDateInfo(dateInput: Date = new Date(), isIsrael: boolean = isUserInIsrael()): ExactJewishDateInfo {
  const hdate = new HDate(dateInput);
  const dayOfWeekIndex = dateInput.getDay();
  const dayOfWeekHebrew = `יום ${HEBREW_DAYS[dayOfWeekIndex]}`;
  const isShabbat = dayOfWeekIndex === 6;
  const chumashAliyahName = `עליית ${ALIYOT_NAMES[dayOfWeekIndex]}`;

  const dayOfMonth = hdate.getDate();
  const dayOfMonthHebrew = HEBREW_NUMERALS[dayOfMonth] || `${dayOfMonth}`;
  const monthNumber = hdate.getMonth();
  const isLeap = hdate.isLeapYear();
  let monthName = HEBREW_MONTH_NAMES[monthNumber] || hdate.getMonthName();
  if (isLeap && monthNumber === 12) {
    monthName = 'אדר א׳';
  } else if (isLeap && monthNumber === 13) {
    monthName = 'אדר ב׳';
  }
  const gematriyaParts = hdate.renderGematriya ? hdate.renderGematriya(true).split(' ') : [];
  const yearHebrew = gematriyaParts.length > 0 ? gematriyaParts[gematriyaParts.length - 1] : `ה׳תשפ״ז`;

  const daysInMonth = typeof hdate.daysInMonth === 'function' ? hdate.daysInMonth() : 30;
  const isShortMonth = daysInMonth === 29;

  let tehillimMonthlyPortion = '';
  if (isShortMonth && dayOfMonth === 29) {
    tehillimMonthlyPortion = 'פרקים ק״מ – ק״נ (סיום לחודש חסר)';
  } else {
    const tehillimInfo = TEHILLIM_MONTHLY_RANGES[dayOfMonth] || TEHILLIM_MONTHLY_RANGES[1];
    tehillimMonthlyPortion = tehillimInfo.range;
  }

  // Calculate Sedra and Parashat Hashavua using Halachic algorithms
  const sedra = new Sedra(hdate.getFullYear(), isIsrael);

  // 1. Next Saturday (Shabbat) reading
  const nextSatHDate = hdate.onOrAfter(6);
  const shabbatLookup = sedra.lookup(nextSatHDate);

  const rawShabbatName = shabbatLookup?.parsha?.length
    ? (shabbatLookup.parsha.length > 1 ? shabbatLookup.parsha.join('-') : shabbatLookup.parsha[0])
    : '';
  const upcomingShabbatIsHoliday = Boolean(shabbatLookup?.chag);
  const upcomingShabbatName = HOLIDAY_TRANSLATIONS[rawShabbatName] || (shabbatLookup?.chag ? rawShabbatName : `פרשת ${rawShabbatName}`);

  // 2. Weekly Torah portion for the daily Chumash study
  // In Chitas:
  // - On regular weeks: it's the upcoming Shabbat parashah (joined if double).
  // - When upcoming Shabbat is a festival (chag: true):
  //   * If in Tishrei (Sukkot / Simchat Torah):
  //     If before / on Simchat Torah (up to 23 Tishrei): Vezot Haberakhah!
  //     If after Simchat Torah: Bereshit!
  //   * If Pesach: the next regular parashah after the holiday.
  let determinedParashaName = 'Bereshit';
  let isHoliday = false;
  let holidayName: string | undefined = undefined;

  if (upcomingShabbatIsHoliday) {
    isHoliday = true;
    holidayName = upcomingShabbatName;

    if (monthNumber === 7) {
      // Month of Tishrei
      // Simchat Torah: 22 Tishrei in Israel, 23 Tishrei in the Diaspora
      if (dayOfMonth <= (isIsrael ? 22 : 23)) {
        determinedParashaName = 'Vezot Haberakhah';
      } else {
        determinedParashaName = 'Bereshit';
      }
    } else {
      // Find the next Shabbat that is not a holiday
      let testSat = nextSatHDate.add(7);
      for (let i = 0; i < 4; i++) {
        const testLookup = sedra.lookup(testSat);
        if (!testLookup.chag && testLookup.parsha && testLookup.parsha.length > 0) {
          determinedParashaName = testLookup.parsha.length > 1
            ? testLookup.parsha.join('-')
            : testLookup.parsha[0];
          break;
        }
        testSat = testSat.add(7);
      }
    }
  } else if (shabbatLookup && shabbatLookup.parsha && shabbatLookup.parsha.length > 0) {
    determinedParashaName = shabbatLookup.parsha.length > 1
      ? shabbatLookup.parsha.join('-')
      : shabbatLookup.parsha[0];
  }

  // Lookup in our comprehensive Parasha map
  const mapped = HEBCAL_PARASHA_MAP[determinedParashaName] || HEBCAL_PARASHA_MAP['Bereshit'];
  const parashaId = mapped.id;
  const parashaName = mapped.name;
  const parashaHebrewTitle = `פרשת ${mapped.name}`;

  // Determine authentic Tanya portion name for this day
  const HEB_DAYS_KEYS: Record<number, string> = {
    1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
    11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו', 16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט', 20: 'כ',
    21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה', 26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט', 30: 'ל',
  };
  const MONTH_KEYS_MAP: Record<number, string[]> = {
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

  const currentHYear = hdate.getFullYear();
  let cycleYear = currentHYear;
  if (monthNumber === 7 || monthNumber === 8 || (monthNumber === 9 && dayOfMonth < 19)) {
    cycleYear = currentHYear - 1;
  }
  const isTanyaLeap = HDate.isLeapYear(cycleYear);
  const searchCycles = isTanyaLeap ? ['leap', 'regular'] : ['regular', 'leap'];
  const dayK = HEB_DAYS_KEYS[dayOfMonth] || `${dayOfMonth}`;
  const mSearch = MONTH_KEYS_MAP[monthNumber] || ['תשרי'];

  let resolvedTanyaName = '';
  for (const c of searchCycles) {
    const cMap = (chaptersIndexData as any)[c] || {};
    for (const mName of mSearch) {
      const k = `${dayK}_${mName}`;
      if (cMap[k]) {
        const val = cMap[k] as string;
        if (val.startsWith('פרק ')) {
          resolvedTanyaName = `לקוטי אמרים – ${val}`;
        } else if (val.startsWith('שער היחוד והאמונה')) {
          resolvedTanyaName = val.replace('שער היחוד והאמונה ', 'שער היחוד והאמונה – ');
        } else if (val.startsWith('אגרת התשובה')) {
          resolvedTanyaName = val.replace('אגרת התשובה ', 'אגרת התשובה – ');
        } else {
          resolvedTanyaName = val;
        }
        break;
      }
    }
    if (resolvedTanyaName) break;
  }

  const tanyaPortionName = resolvedTanyaName || `ספר התניא (שיעור ליום ${dayOfMonthHebrew} ב${monthName})`;

  return {
    date: dateInput,
    hdate,
    dayOfMonth,
    dayOfMonthHebrew,
    monthName,
    yearHebrew,
    dayOfWeekIndex,
    dayOfWeekHebrew,
    isShabbat,
    isHoliday,
    holidayName,
    upcomingShabbatIsHoliday,
    upcomingShabbatName,
    parashaId,
    parashaName,
    parashaHebrewTitle,
    chumashAliyahName,
    tehillimMonthlyPortion,
    tanyaPortionName,
    daysInMonth,
  };
}
