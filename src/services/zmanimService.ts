import { Location, Zmanim, HebrewCalendar } from '@hebcal/core';
import type { ZmanimMethod } from '../types/chitas';
import { Lang, getLang, localeOf, pick } from '../i18n';

export interface CityConfig {
  id: string;
  nameHe: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  candleLightingMinutes: number; // e.g. 40 for Jerusalem, 20 standard Israel, 18 standard Diaspora
  isIsrael: boolean;
}

export const CITIES_LIST: CityConfig[] = [
  {
    id: 'jerusalem',
    nameHe: 'ירושלים',
    nameEn: 'Jerusalem',
    latitude: 31.76904,
    longitude: 35.21633,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 40,
    isIsrael: true,
  },
  {
    id: 'bnei_brak',
    nameHe: 'בני ברק',
    nameEn: 'Bnei Brak',
    latitude: 32.0833,
    longitude: 34.8333,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'kfar_chabad',
    nameHe: 'כפר חב״ד',
    nameEn: 'Kfar Chabad',
    latitude: 31.9933,
    longitude: 34.8561,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'tel_aviv',
    nameHe: 'תל אביב - יפו',
    nameEn: 'Tel Aviv',
    latitude: 32.0853,
    longitude: 34.7818,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'haifa',
    nameHe: 'חיפה',
    nameEn: 'Haifa',
    latitude: 32.794,
    longitude: 34.9896,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'safed',
    nameHe: 'צפת',
    nameEn: 'Safed',
    latitude: 32.9646,
    longitude: 35.496,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 30,
    isIsrael: true,
  },
  {
    id: 'beitar_illit',
    nameHe: 'ביתר עילית',
    nameEn: 'Beitar Illit',
    latitude: 31.6961,
    longitude: 35.1167,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 40,
    isIsrael: true,
  },
  {
    id: 'modiin_illit',
    nameHe: 'מודיעין עילית (קרית ספר)',
    nameEn: 'Modiin Illit',
    latitude: 31.9333,
    longitude: 35.0417,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'ashdod',
    nameHe: 'אשדוד',
    nameEn: 'Ashdod',
    latitude: 31.8014,
    longitude: 34.6435,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'beer_sheva',
    nameHe: 'באר שבע',
    nameEn: 'Beer Sheva',
    latitude: 31.2518,
    longitude: 34.7913,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'netanya',
    nameHe: 'נתניה',
    nameEn: 'Netanya',
    latitude: 32.3215,
    longitude: 34.8532,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'petah_tikva',
    nameHe: 'פתח תקווה',
    nameEn: 'Petah Tikva',
    latitude: 32.0841,
    longitude: 34.8878,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'rishon_lezion',
    nameHe: 'ראשון לציון',
    nameEn: 'Rishon LeZion',
    latitude: 31.973,
    longitude: 34.7925,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'rehovot',
    nameHe: 'רחובות',
    nameEn: 'Rehovot',
    latitude: 31.8928,
    longitude: 34.8113,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'tiberias',
    nameHe: 'טבריה',
    nameEn: 'Tiberias',
    latitude: 32.794,
    longitude: 35.5312,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'elad',
    nameHe: 'אלעד',
    nameEn: 'Elad',
    latitude: 32.052,
    longitude: 34.9515,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'holon_bat_yam',
    nameHe: 'חולון / בת ים',
    nameEn: 'Holon / Bat Yam',
    latitude: 32.0158,
    longitude: 34.7874,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  {
    id: 'afula',
    nameHe: 'עפולה',
    nameEn: 'Afula',
    latitude: 32.6074,
    longitude: 35.2891,
    timeZone: 'Asia/Jerusalem',
    candleLightingMinutes: 20,
    isIsrael: true,
  },
  // Diaspora / Chabad centers
  {
    id: 'new_york',
    nameHe: 'ניו יורק (קראון הייטס)',
    nameEn: 'New York (Crown Heights)',
    latitude: 40.6694,
    longitude: -73.9422,
    timeZone: 'America/New_York',
    candleLightingMinutes: 18,
    isIsrael: false,
  },
  {
    id: 'paris',
    nameHe: 'פריז (צרפת)',
    nameEn: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    timeZone: 'Europe/Paris',
    candleLightingMinutes: 18,
    isIsrael: false,
  },
  {
    id: 'london',
    nameHe: 'לונדון (אנגליה)',
    nameEn: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    timeZone: 'Europe/London',
    candleLightingMinutes: 18,
    isIsrael: false,
  },
  {
    id: 'montreal',
    nameHe: 'מונטריאול (קנדה)',
    nameEn: 'Montreal',
    latitude: 45.5017,
    longitude: -73.5673,
    timeZone: 'America/Toronto',
    candleLightingMinutes: 18,
    isIsrael: false,
  },
  {
    id: 'moscow',
    nameHe: 'מוסקבה (רוסיה)',
    nameEn: 'Moscow',
    latitude: 55.7558,
    longitude: 37.6173,
    timeZone: 'Europe/Moscow',
    candleLightingMinutes: 18,
    isIsrael: false,
  },
  {
    id: 'buenos_aires',
    nameHe: 'בואנוס איירס (ארגנטינה)',
    nameEn: 'Buenos Aires',
    latitude: -34.6037,
    longitude: -58.3816,
    timeZone: 'America/Argentina/Buenos_Aires',
    candleLightingMinutes: 18,
    isIsrael: false,
  },
];

export const DEFAULT_CITY = CITIES_LIST[0]; // Jerusalem

/** French names of the built-in cities whose English name differs. */
const CITY_NAMES_FR: Record<string, string> = {
  jerusalem: 'Jérusalem',
  haifa: 'Haïfa',
  tiberias: 'Tibériade',
  london: 'Londres',
  montreal: 'Montréal',
  moscow: 'Moscou',
};

/** City name in the interface language (Hebrew name in Hebrew, otherwise the English / French name). */
export function cityDisplayName(city: CityConfig, lang: Lang = getLang()): string {
  if (lang === 'he') return city.nameHe;
  const en = city.nameEn || city.nameHe;
  if (lang === 'fr') {
    if (CITY_NAMES_FR[city.id]) return CITY_NAMES_FR[city.id];
    if (en === 'Jerusalem (Current Location)') return 'Jérusalem (position actuelle)';
    if (en === 'Current Location') return 'Position actuelle';
  }
  return en;
}

const CITY_STORAGE_KEY = 'chitas_user_city';

export function getUserLocationCity(): CityConfig | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('chitas_user_geo_coords') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.latitude && parsed.longitude) {
        const lat = parsed.latitude;
        const lon = parsed.longitude;
        // Check if location is in the Jerusalem metropolitan area (approx lat: 31.68 - 31.86, lon: 35.12 - 35.29)
        const isJerusalemArea = lat >= 31.68 && lat <= 31.86 && lon >= 35.12 && lon <= 35.29;
        const candleLightingMinutes = isJerusalemArea ? 40 : parsed.isIsrael ? 20 : 18;

        return {
          id: 'user_geo',
          nameHe: isJerusalemArea ? 'ירושלים (מיקום נוכחי)' : (parsed.nameHe || 'מיקום נוכחי'),
          nameEn: isJerusalemArea ? 'Jerusalem (Current Location)' : 'Current Location',
          latitude: lat,
          longitude: lon,
          timeZone: parsed.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jerusalem',
          candleLightingMinutes,
          isIsrael: parsed.isIsrael,
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function initUserGeolocation(): void {
  if (typeof window === 'undefined' || !navigator.geolocation) return;
  try {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const isIsrael = lat >= 29.3 && lat <= 33.5 && lon >= 34.2 && lon <= 35.9;
        const isJerusalemArea = lat >= 31.68 && lat <= 31.86 && lon >= 35.12 && lon <= 35.29;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || (isIsrael ? 'Asia/Jerusalem' : 'UTC');
        localStorage.setItem(
          'chitas_user_geo_coords',
          JSON.stringify({
            latitude: lat,
            longitude: lon,
            isIsrael,
            isJerusalemArea,
            timeZone: tz,
            nameHe: isJerusalemArea ? 'ירושלים (מיקום נוכחי)' : 'מיקום נוכחי',
          })
        );
      },
      () => {},
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 3600000 }
    );
  } catch {
    // ignore
  }
}

// Automatically initiate geolocation detection in browser
if (typeof window !== 'undefined') {
  initUserGeolocation();
}

export async function fetchHebcalCandleLightingForCoords(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Promise<string | null> {
  try {
    const dateStr = date.toISOString().slice(0, 10);
    const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jerusalem');
    const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&geo=pos&latitude=${latitude}&longitude=${longitude}&tzid=${tz}&c=on&start=${dateStr}&end=${dateStr}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of (data.items || [])) {
      if (item.category === 'candles' || item.title?.includes('Candle lighting')) {
        const match = item.title?.match(/(\d{1,2}:\d{2})/);
        if (match) return match[1];
        if (item.date) {
          const d = new Date(item.date);
          return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
      }
    }
  } catch (e) {
    console.warn('Failed to fetch candle lighting from Hebcal coordinates:', e);
  }
  return null;
}

/** Default minutes before sunset for Shabbat candle lighting by location. */
export function defaultCandleLightingMinutes(lat: number, lon: number, isIsrael: boolean): number {
  const isJerusalemArea = lat >= 31.68 && lat <= 31.86 && lon >= 35.12 && lon <= 35.29;
  if (isJerusalemArea) return 40;
  return isIsrael ? 20 : 18;
}

/** Search the built-in list (works offline). */
export function searchLocalCities(query: string): CityConfig[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES_LIST;
  return CITIES_LIST.filter(
    (c) => c.nameHe.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q)
  );
}

/**
 * Search any city / town in the world (Open-Meteo geocoding, free, no API key).
 * Results include coordinates and time zone, which is all that is needed for zmanim.
 */
export async function searchCitiesOnline(query: string, signal?: AbortSignal): Promise<CityConfig[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=15&language=he&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json();
  const results: any[] = Array.isArray(data?.results) ? data.results : [];
  return results
    .filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number' && r.timezone)
    .map((r) => {
      const isIsrael = r.country_code === 'IL';
      const details = [r.admin1, r.country].filter(Boolean).join(', ');
      return {
        id: `geo_${r.id ?? `${r.latitude}_${r.longitude}`}`,
        nameHe: details ? `${r.name} (${details})` : String(r.name),
        nameEn: String(r.name),
        latitude: r.latitude,
        longitude: r.longitude,
        timeZone: r.timezone,
        candleLightingMinutes: defaultCandleLightingMinutes(r.latitude, r.longitude, isIsrael),
        isIsrael,
      } as CityConfig;
    });
}

let inMemoryStoredCity: string | null = null;

export function getSavedCity(): CityConfig | null {
  try {
    const stored =
      typeof window !== 'undefined' && typeof localStorage !== 'undefined'
        ? localStorage.getItem(CITY_STORAGE_KEY)
        : inMemoryStoredCity;

    if (stored) {
      let cityIdOrName = stored;
      // JSON format: a full city config (cities found by search or GPS), or an old saved list city
      if (stored.startsWith('{')) {
        try {
          const parsed = JSON.parse(stored);
          const listCity = CITIES_LIST.find((c) => c.id === parsed.id);
          if (listCity) return listCity;
          if (
            typeof parsed.latitude === 'number' &&
            typeof parsed.longitude === 'number' &&
            typeof parsed.timeZone === 'string'
          ) {
            return {
              id: String(parsed.id || `custom_${parsed.latitude}_${parsed.longitude}`),
              nameHe: String(parsed.nameHe || parsed.nameEn || 'מיקום'),
              nameEn: String(parsed.nameEn || parsed.nameHe || 'Location'),
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              timeZone: parsed.timeZone,
              candleLightingMinutes: Number(parsed.candleLightingMinutes) || 18,
              isIsrael: Boolean(parsed.isIsrael),
            };
          }
          cityIdOrName = parsed.id || parsed.nameHe || parsed.nameEn || '';
        } catch {
          // fallback
        }
      }
      // Find city from authoritative CITIES_LIST by id, nameHe, or nameEn
      const found = CITIES_LIST.find(
        (c) =>
          c.id === cityIdOrName ||
          c.nameHe === cityIdOrName ||
          c.nameEn === cityIdOrName ||
          (cityIdOrName.includes('ירושלים') && c.id === 'jerusalem')
      );
      if (found) {
        return found;
      }
    }
  } catch {
    // ignore
  }
  return getUserLocationCity() || DEFAULT_CITY;
}

export function saveCity(city: CityConfig): void {
  try {
    inMemoryStoredCity = city.id;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Cities from the built-in list are stored by ID; any other city (search result / GPS)
      // is stored with its full coordinates so it is remembered for next time.
      const isListCity = CITIES_LIST.some((c) => c.id === city.id);
      localStorage.setItem(CITY_STORAGE_KEY, isListCity ? city.id : JSON.stringify(city));
    }
  } catch {
    // ignore
  }
}

export interface ZmanimMethodInfo {
  id: ZmanimMethod;
  label: string;
  description: string;
}

/** The methods the user can choose from in the settings (Hebrew). */
export const ZMANIM_METHODS: ZmanimMethodInfo[] = [
  {
    id: 'chabad',
    label: 'חב״ד – שיטת אדמו״ר הזקן',
    description: 'זמנים לפי שולחן ערוך ואחרונים של בעל התניא (כמו בלוחות חב״ד)',
  },
  {
    id: 'gra',
    label: 'הגר״א',
    description: 'שעות זמניות מהנץ עד השקיעה; צאת הכוכבים 8.5°',
  },
  {
    id: 'mga72',
    label: 'מגן אברהם – 72 דקות',
    description: 'שעות זמניות מעלות השחר (72 דק׳) עד צאת הכוכבים; צאת לרבנו תם',
  },
  {
    id: 'mga16',
    label: 'מגן אברהם – 16.1°',
    description: 'שעות זמניות מעלות השחר (16.1°) עד צאת הכוכבים',
  },
  {
    id: 'all',
    label: 'כל השיטות',
    description: 'הצגת כל הזמנים לפי כל השיטות יחד',
  },
];

const ZMANIM_METHODS_I18N: Record<Lang, ZmanimMethodInfo[]> = {
  he: ZMANIM_METHODS,
  en: [
    {
      id: 'chabad',
      label: 'Alter Rebbe (Chabad)',
      description: 'Times according to the Shulchan Aruch of the Alter Rebbe (as in Chabad calendars)',
    },
    {
      id: 'gra',
      label: 'Gra',
      description: 'Proportional hours from sunrise to sunset; Tzeit HaKochavim at 8.5°',
    },
    {
      id: 'mga72',
      label: 'Magen Avraham – 72 minutes',
      description: 'Proportional hours from Alot HaShachar (72 min) to Tzeit HaKochavim; Tzeit of Rabbeinu Tam',
    },
    {
      id: 'mga16',
      label: 'Magen Avraham – 16.1°',
      description: 'Proportional hours from Alot HaShachar (16.1°) to Tzeit HaKochavim',
    },
    {
      id: 'all',
      label: 'All opinions',
      description: 'Show the times of every opinion together',
    },
  ],
  fr: [
    {
      id: 'chabad',
      label: 'Admour Hazaken (Habad)',
      description: "Horaires selon le Choul'han Aroukh de l'Admour Hazaken (comme dans les calendriers Habad)",
    },
    {
      id: 'gra',
      label: 'Gra',
      description: 'Heures proportionnelles du lever au coucher du soleil ; Tsèt Hakokhavim à 8,5°',
    },
    {
      id: 'mga72',
      label: 'Maguen Avraham – 72 minutes',
      description: "Heures proportionnelles de Alot Hacha'har (72 min) à Tsèt Hakokhavim ; Tsèt selon Rabbénou Tam",
    },
    {
      id: 'mga16',
      label: 'Maguen Avraham – 16,1°',
      description: "Heures proportionnelles de Alot Hacha'har (16,1°) à Tsèt Hakokhavim",
    },
    {
      id: 'all',
      label: 'Toutes les opinions',
      description: 'Afficher ensemble les horaires de toutes les opinions',
    },
  ],
};

/** The zmanim methods with labels in the interface language. */
export function getZmanimMethods(lang: Lang = getLang()): ZmanimMethodInfo[] {
  return ZMANIM_METHODS_I18N[lang] || ZMANIM_METHODS;
}

export function getZmanimMethodLabel(method: ZmanimMethod | undefined, lang: Lang = getLang()): string {
  const list = getZmanimMethods(lang);
  return list.find((m) => m.id === (method || 'chabad'))?.label || list[0].label;
}

/** Names of the zmanim (computed when the times are calculated, in the interface language). */
const ZMAN_TITLES = {
  he: {
    alot: 'עלות השחר',
    neitz: 'הנץ החמה',
    shma: 'סוף זמן קריאת שמע',
    tefilah: 'סוף זמן תפילה',
    chatzot: 'חצות היום',
    minchaGedola: 'מנחה גדולה',
    minchaKetana: 'מנחה קטנה',
    plag: 'פלג המנחה',
    shkiah: 'שקיעת החמה',
    tzeit: 'צאת הכוכבים',
    chatzotNight: 'חצות הלילה',
    misheyakir: 'משיכיר (טלית ותפילין)',
    tzeitRT: 'צאת הכוכבים (רבנו תם)',
    alot72: 'עלות השחר (72 דקות)',
    alot16: 'עלות השחר (16.1°)',
    alotChabad: 'עלות השחר (אדמו״ר הזקן)',
    shmaChabad: 'סוף זמן ק״ש (אדמו״ר הזקן)',
    shmaMga: 'סוף זמן ק״ש (מגן אברהם 72 דק׳)',
    shmaMga16: 'סוף זמן ק״ש (מגן אברהם 16.1°)',
    shmaGra: 'סוף זמן ק״ש (הגר״א)',
    tefilahChabad: 'סוף זמן תפילה (אדמו״ר הזקן)',
    tefilahMga: 'סוף זמן תפילה (מגן אברהם 72 דק׳)',
    tefilahGra: 'סוף זמן תפילה (הגר״א)',
    minchaGedolaChabad: 'מנחה גדולה (אדמו״ר הזקן)',
    minchaGedolaGra: 'מנחה גדולה (הגר״א)',
    minchaKetanaChabad: 'מנחה קטנה (אדמו״ר הזקן)',
    minchaKetanaGra: 'מנחה קטנה (הגר״א)',
    plagChabad: 'פלג המנחה (אדמו״ר הזקן)',
    plagGra: 'פלג המנחה (הגר״א)',
    tzeitChabad: 'צאת הכוכבים (אדמו״ר הזקן)',
    tzeitRegular: 'צאת הכוכבים (8.5°)',
  },
  en: {
    alot: 'Alot HaShachar',
    neitz: 'Netz HaChamah (sunrise)',
    shma: 'Sof Zman Kriat Shema',
    tefilah: 'Sof Zman Tefillah',
    chatzot: 'Chatzot',
    minchaGedola: 'Mincha Gedolah',
    minchaKetana: 'Mincha Ketanah',
    plag: 'Plag HaMincha',
    shkiah: 'Shkiah (sunset)',
    tzeit: 'Tzeit HaKochavim',
    chatzotNight: 'Chatzot HaLailah (midnight)',
    misheyakir: 'Misheyakir (tallit and tefillin)',
    tzeitRT: 'Tzeit HaKochavim (Rabbeinu Tam)',
    alot72: 'Alot HaShachar (72 minutes)',
    alot16: 'Alot HaShachar (16.1°)',
    alotChabad: 'Alot HaShachar (Alter Rebbe)',
    shmaChabad: 'Sof Zman Kriat Shema (Alter Rebbe)',
    shmaMga: 'Sof Zman Kriat Shema (Magen Avraham, 72 min)',
    shmaMga16: 'Sof Zman Kriat Shema (Magen Avraham, 16.1°)',
    shmaGra: 'Sof Zman Kriat Shema (Gra)',
    tefilahChabad: 'Sof Zman Tefillah (Alter Rebbe)',
    tefilahMga: 'Sof Zman Tefillah (Magen Avraham, 72 min)',
    tefilahGra: 'Sof Zman Tefillah (Gra)',
    minchaGedolaChabad: 'Mincha Gedolah (Alter Rebbe)',
    minchaGedolaGra: 'Mincha Gedolah (Gra)',
    minchaKetanaChabad: 'Mincha Ketanah (Alter Rebbe)',
    minchaKetanaGra: 'Mincha Ketanah (Gra)',
    plagChabad: 'Plag HaMincha (Alter Rebbe)',
    plagGra: 'Plag HaMincha (Gra)',
    tzeitChabad: 'Tzeit HaKochavim (Alter Rebbe)',
    tzeitRegular: 'Tzeit HaKochavim (8.5°)',
  },
  fr: {
    alot: "Alot Hacha'har",
    neitz: "Nets Ha'hama (lever du soleil)",
    shma: 'Fin du Chéma (Sof Zman Kriat Chéma)',
    tefilah: 'Fin de la Téfila',
    chatzot: "'Hatsot",
    minchaGedola: "Min'ha Guedola",
    minchaKetana: "Min'ha Ketana",
    plag: "Plag Hamin'ha",
    shkiah: 'Chkia (coucher du soleil)',
    tzeit: 'Tsèt Hakokhavim',
    chatzotNight: "'Hatsot de la nuit",
    misheyakir: 'Michéyakir (talit et téfilines)',
    tzeitRT: 'Tsèt Hakokhavim (Rabbénou Tam)',
    alot72: "Alot Hacha'har (72 minutes)",
    alot16: "Alot Hacha'har (16,1°)",
    alotChabad: "Alot Hacha'har (Admour Hazaken)",
    shmaChabad: 'Fin du Chéma (Admour Hazaken)',
    shmaMga: 'Fin du Chéma (Maguen Avraham, 72 min)',
    shmaMga16: 'Fin du Chéma (Maguen Avraham, 16,1°)',
    shmaGra: 'Fin du Chéma (Gra)',
    tefilahChabad: 'Fin de la Téfila (Admour Hazaken)',
    tefilahMga: 'Fin de la Téfila (Maguen Avraham, 72 min)',
    tefilahGra: 'Fin de la Téfila (Gra)',
    minchaGedolaChabad: "Min'ha Guedola (Admour Hazaken)",
    minchaGedolaGra: "Min'ha Guedola (Gra)",
    minchaKetanaChabad: "Min'ha Ketana (Admour Hazaken)",
    minchaKetanaGra: "Min'ha Ketana (Gra)",
    plagChabad: "Plag Hamin'ha (Admour Hazaken)",
    plagGra: "Plag Hamin'ha (Gra)",
    tzeitChabad: 'Tsèt Hakokhavim (Admour Hazaken)',
    tzeitRegular: 'Tsèt Hakokhavim (8,5°)',
  },
};

/** Opinion / method notes shown under a zman. */
const ZMAN_OPINIONS = {
  he: {
    gra: 'הגר״א',
    mga: 'מגן אברהם',
    mga72: 'מגן אברהם (72 דק׳)',
    mga16: 'מגן אברהם (16.1°)',
    mgaAbbr: 'מג״א',
    chabad: 'חב״ד',
    before72: '72 דק׳ לפני הנץ',
    after72: '72 דק׳ אחרי השקיעה',
    solarAngle: 'מעלות השמש',
    seaLevel: 'מישור',
    stars3: '3 כוכבים בינוניים',
    min72: '72 דקות',
    deg161: '16.1°',
    deg102: '10.2°',
    deg85: '8.5°',
  },
  en: {
    gra: 'Gra',
    mga: 'Magen Avraham',
    mga72: 'Magen Avraham (72 min)',
    mga16: 'Magen Avraham (16.1°)',
    mgaAbbr: 'Magen Avraham',
    chabad: 'Chabad',
    before72: '72 min before sunrise',
    after72: '72 min after sunset',
    solarAngle: 'Solar depression angle',
    seaLevel: 'Sea level',
    stars3: '3 medium stars',
    min72: '72 minutes',
    deg161: '16.1°',
    deg102: '10.2°',
    deg85: '8.5°',
  },
  fr: {
    gra: 'Gra',
    mga: 'Maguen Avraham',
    mga72: 'Maguen Avraham (72 min)',
    mga16: 'Maguen Avraham (16,1°)',
    mgaAbbr: 'Maguen Avraham',
    chabad: 'Habad',
    before72: '72 min avant le lever du soleil',
    after72: '72 min après le coucher du soleil',
    solarAngle: 'Angle du soleil sous l’horizon',
    seaLevel: 'Niveau de la mer',
    stars3: '3 étoiles moyennes',
    min72: '72 minutes',
    deg161: '16,1°',
    deg102: '10,2°',
    deg85: '8,5°',
  },
};

export interface ZmanItem {
  id: string;
  /** Name of the zman in the interface language at calculation time (Hebrew in Hebrew mode). */
  titleHe: string;
  timeStr: string;
  opinion?: string;
  highlightChabad?: boolean;
  dateObj?: Date;
}

export interface DayZmanimResult {
  city: CityConfig;
  date: Date;
  /** Gregorian date, formatted for the interface language (name kept for compatibility). */
  dateStrHebrew: string;
  isFriday: boolean;
  candleLightingTime: string | null;
  havdalahTime: string | null;
  items: ZmanItem[];
}

function formatZmanTime(
  val: any,
  timeZone: string
): { timeStr: string; dateObj?: Date } {
  if (!val) return { timeStr: '--:--' };
  let d: Date | null = null;
  if (val instanceof Date) {
    d = val;
  } else if (val && typeof val === 'object' && 'epochMilliseconds' in val) {
    d = new Date(val.epochMilliseconds);
  } else if (typeof val === 'number') {
    d = new Date(val);
  }

  if (!d || isNaN(d.getTime())) return { timeStr: '--:--' };

  try {
    const str = d.toLocaleTimeString('he-IL', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return { timeStr: str, dateObj: d };
  } catch {
    return {
      timeStr: d.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      dateObj: d,
    };
  }
}

export function calculateZmanim(
  city: CityConfig,
  date: Date = new Date(),
  method: ZmanimMethod = 'chabad'
): DayZmanimResult {
  const loc = new Location(
    city.latitude,
    city.longitude,
    city.isIsrael,
    city.timeZone,
    city.nameHe,
    city.isIsrael ? 'IL' : 'US'
  );

  const zman = new Zmanim(loc, date, false);
  const timeZone = city.timeZone;

  // Candle lighting and Havdalah
  let candleLightingTime: string | null = null;
  let havdalahTime: string | null = null;

  try {
    const cal = HebrewCalendar.calendar({
      location: loc,
      candlelighting: true,
      candleLightingMins: city.candleLightingMinutes,
      start: date,
      end: date,
    });
    for (const ev of cal) {
      const desc = ev.getDesc();
      const timedEv = ev as any;
      if (desc === 'Candle lighting') {
        candleLightingTime = timedEv.eventTimeStr || null;
      } else if (desc === 'Havdalah') {
        havdalahTime = timedEv.eventTimeStr || null;
      }
    }
  } catch (err) {
    console.warn('Error calculating candle lighting:', err);
  }

  // Ensure Friday candle lighting strictly respects city.candleLightingMinutes (e.g. 40 min before sunset for Jerusalem)
  const dayOfWeek = date.getDay(); // 5 = Friday
  const isFriday = dayOfWeek === 5;

  if (isFriday) {
    try {
      const shkiah = zman.sunset();
      if (shkiah) {
        const candleDate = new Date(shkiah.getTime() - city.candleLightingMinutes * 60 * 1000);
        candleLightingTime = formatZmanTime(candleDate, timeZone).timeStr;
      }
    } catch {
      // ignore
    }
  }

  const items: ZmanItem[] = [];

  const add = (
    id: string,
    titleHe: string,
    val: any,
    opinion?: string,
    highlightChabad?: boolean
  ) => {
    const { timeStr, dateObj } = formatZmanTime(val, timeZone);
    if (timeStr !== '--:--') {
      items.push({
        id,
        titleHe,
        timeStr,
        opinion,
        highlightChabad,
        dateObj,
      });
    }
  };

  const T = pick(ZMAN_TITLES);
  const O = pick(ZMAN_OPINIONS);

  // Halachic order of daily times, according to the chosen method
  if (method === 'chabad') {
    // Shitas Admur HaZaken (Baal HaTanya), as in Chabad calendars
    add('alot', T.alot, zman.alosBaalHatanya());
    add('neitz', T.neitz, zman.sunrise());
    add('shma', T.shma, zman.sofZmanShmaBaalHatanya());
    add('tefilah', T.tefilah, zman.sofZmanTfilaBaalHatanya());
    add('chatzot', T.chatzot, zman.chatzot());
    add('mincha_gedola', T.minchaGedola, zman.minchaGedolaBaalHatanya());
    add('mincha_ketana', T.minchaKetana, zman.minchaKetanaBaalHatanya());
    add('plag', T.plag, zman.plagHaminchaBaalHatanya());
    add('shkiah', T.shkiah, zman.sunset());
    add('tzeit', T.tzeit, zman.tzaisBaalHatanya());
    add('chatzot_night', T.chatzotNight, zman.chatzotNight());
  } else if (method === 'gra') {
    add('alot', T.alot, zman.alotHaShachar(), O.deg161);
    add('misheyakir', T.misheyakir, zman.misheyakir(), O.deg102);
    add('neitz', T.neitz, zman.sunrise());
    add('shma', T.shma, zman.sofZmanShma(), O.gra);
    add('tefilah', T.tefilah, zman.sofZmanTfilla(), O.gra);
    add('chatzot', T.chatzot, zman.chatzot());
    add('mincha_gedola', T.minchaGedola, zman.minchaGedola(), O.gra);
    add('mincha_ketana', T.minchaKetana, zman.minchaKetana(), O.gra);
    add('plag', T.plag, zman.plagHaMincha(), O.gra);
    add('shkiah', T.shkiah, zman.sunset());
    add('tzeit', T.tzeit, zman.tzeit(), O.deg85);
    add('chatzot_night', T.chatzotNight, zman.chatzotNight());
  } else if (method === 'mga72') {
    add('alot', T.alot, zman.alotHaShachar72(), O.before72);
    add('misheyakir', T.misheyakir, zman.misheyakir(), O.deg102);
    add('neitz', T.neitz, zman.sunrise());
    add('shma', T.shma, zman.sofZmanShmaMGA(), O.mga72);
    add('tefilah', T.tefilah, zman.sofZmanTfillaMGA(), O.mga72);
    add('chatzot', T.chatzot, zman.chatzot());
    add('mincha_gedola', T.minchaGedola, zman.minchaGedolaMGA(), O.mga);
    add('mincha_ketana', T.minchaKetana, zman.minchaKetanaMGA(), O.mga);
    add('plag', T.plag, zman.plagHaMincha(), O.gra);
    add('shkiah', T.shkiah, zman.sunset());
    add('tzeit', T.tzeit, zman.tzeit(), O.deg85);
    add('tzeit_72', T.tzeitRT, zman.tzeit72(), O.after72);
    add('chatzot_night', T.chatzotNight, zman.chatzotNight());
  } else if (method === 'mga16') {
    add('alot', T.alot, zman.alotHaShachar(), O.deg161);
    add('misheyakir', T.misheyakir, zman.misheyakir(), O.deg102);
    add('neitz', T.neitz, zman.sunrise());
    add('shma', T.shma, zman.sofZmanShmaMGA16Point1(), O.mga16);
    add('tefilah', T.tefilah, zman.sofZmanTfillaMGA16Point1(), O.mga16);
    add('chatzot', T.chatzot, zman.chatzot());
    add('mincha_gedola', T.minchaGedola, zman.minchaGedola(), O.gra);
    add('mincha_ketana', T.minchaKetana, zman.minchaKetana(), O.gra);
    add('plag', T.plag, zman.plagHaMincha(), O.gra);
    add('shkiah', T.shkiah, zman.sunset());
    add('tzeit', T.tzeit, zman.tzeit(), O.deg85);
    add('chatzot_night', T.chatzotNight, zman.chatzotNight());
  } else {
    add('alot_72', T.alot72, zman.alotHaShachar72(), O.before72);
    add('alot_16', T.alot16, zman.alotHaShachar(), O.solarAngle);
    add('alot_chabad', T.alotChabad, zman.alosBaalHatanya(), O.chabad, true);
    add('misheyakir', T.misheyakir, zman.misheyakir(), O.deg102);
    add('neitz', T.neitz, zman.sunrise(), O.seaLevel);
    add('shma_chabad', T.shmaChabad, zman.sofZmanShmaBaalHatanya(), O.chabad, true);
    add('shma_mga', T.shmaMga, zman.sofZmanShmaMGA(), O.mgaAbbr);
    add('shma_mga16', T.shmaMga16, zman.sofZmanShmaMGA16Point1(), O.mgaAbbr);
    add('shma_gra', T.shmaGra, zman.sofZmanShma(), O.gra);
    add('tefilah_chabad', T.tefilahChabad, zman.sofZmanTfilaBaalHatanya(), O.chabad, true);
    add('tefilah_mga', T.tefilahMga, zman.sofZmanTfillaMGA(), O.mgaAbbr);
    add('tefilah_gra', T.tefilahGra, zman.sofZmanTfilla(), O.gra);
    add('chatzot', T.chatzot, zman.chatzot());
    add('mincha_gedola_chabad', T.minchaGedolaChabad, zman.minchaGedolaBaalHatanya(), O.chabad, true);
    add('mincha_gedola_gra', T.minchaGedolaGra, zman.minchaGedola(), O.gra);
    add('mincha_ketana_chabad', T.minchaKetanaChabad, zman.minchaKetanaBaalHatanya(), O.chabad, true);
    add('mincha_ketana', T.minchaKetanaGra, zman.minchaKetana(), O.gra);
    add('plag_chabad', T.plagChabad, zman.plagHaminchaBaalHatanya(), O.chabad, true);
    add('plag_gra', T.plagGra, zman.plagHaMincha(), O.gra);
    add('shkiah', T.shkiah, zman.sunset(), O.seaLevel);
    add('tzeit_chabad', T.tzeitChabad, zman.tzaisBaalHatanya(), O.chabad, true);
    add('tzeit_regular', T.tzeitRegular, zman.tzeit(), O.stars3);
    add('tzeit_72', T.tzeitRT, zman.tzeit72(), O.min72);
    add('chatzot_night', T.chatzotNight, zman.chatzotNight());
  }

  return {
    city,
    date,
    dateStrHebrew: date.toLocaleDateString(localeOf(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    isFriday,
    candleLightingTime,
    havdalahTime,
    items,
  };
}

/** Shabbat ends (havdalah) on the Saturday after the given Friday. */
export function getShabbatEndTime(city: CityConfig, friday: Date = new Date()): string | null {
  const saturday = new Date(friday);
  saturday.setDate(saturday.getDate() + 1);
  return calculateZmanim(city, saturday).havdalahTime;
}

export function getFridayCandleLighting(
  city: CityConfig,
  date: Date = new Date()
): string | null {
  const result = calculateZmanim(city, date);
  return result.candleLightingTime;
}
