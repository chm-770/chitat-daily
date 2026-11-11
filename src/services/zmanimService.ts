import { Location, Zmanim, HebrewCalendar } from '@hebcal/core';
import type { ZmanimMethod } from '../types/chitas';

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

/** The methods the user can choose from in the settings. */
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

export function getZmanimMethodLabel(method: ZmanimMethod | undefined): string {
  return ZMANIM_METHODS.find((m) => m.id === (method || 'chabad'))?.label || ZMANIM_METHODS[0].label;
}

export interface ZmanItem {
  id: string;
  titleHe: string;
  timeStr: string;
  opinion?: string;
  highlightChabad?: boolean;
  dateObj?: Date;
}

export interface DayZmanimResult {
  city: CityConfig;
  date: Date;
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

  // Halachic order of daily times, according to the chosen method
  if (method === 'chabad') {
    // Shitas Admur HaZaken (Baal HaTanya), as in Chabad calendars
    add('alot', 'עלות השחר', zman.alosBaalHatanya());
    add('neitz', 'הנץ החמה', zman.sunrise());
    add('shma', 'סוף זמן קריאת שמע', zman.sofZmanShmaBaalHatanya());
    add('tefilah', 'סוף זמן תפילה', zman.sofZmanTfilaBaalHatanya());
    add('chatzot', 'חצות היום', zman.chatzot());
    add('mincha_gedola', 'מנחה גדולה', zman.minchaGedolaBaalHatanya());
    add('mincha_ketana', 'מנחה קטנה', zman.minchaKetanaBaalHatanya());
    add('plag', 'פלג המנחה', zman.plagHaminchaBaalHatanya());
    add('shkiah', 'שקיעת החמה', zman.sunset());
    add('tzeit', 'צאת הכוכבים', zman.tzaisBaalHatanya());
    add('chatzot_night', 'חצות הלילה', zman.chatzotNight());
  } else if (method === 'gra') {
    add('alot', 'עלות השחר', zman.alotHaShachar(), '16.1°');
    add('misheyakir', 'משיכיר (טלית ותפילין)', zman.misheyakir(), '10.2°');
    add('neitz', 'הנץ החמה', zman.sunrise());
    add('shma', 'סוף זמן קריאת שמע', zman.sofZmanShma(), 'הגר״א');
    add('tefilah', 'סוף זמן תפילה', zman.sofZmanTfilla(), 'הגר״א');
    add('chatzot', 'חצות היום', zman.chatzot());
    add('mincha_gedola', 'מנחה גדולה', zman.minchaGedola(), 'הגר״א');
    add('mincha_ketana', 'מנחה קטנה', zman.minchaKetana(), 'הגר״א');
    add('plag', 'פלג המנחה', zman.plagHaMincha(), 'הגר״א');
    add('shkiah', 'שקיעת החמה', zman.sunset());
    add('tzeit', 'צאת הכוכבים', zman.tzeit(), '8.5°');
    add('chatzot_night', 'חצות הלילה', zman.chatzotNight());
  } else if (method === 'mga72') {
    add('alot', 'עלות השחר', zman.alotHaShachar72(), '72 דק׳ לפני הנץ');
    add('misheyakir', 'משיכיר (טלית ותפילין)', zman.misheyakir(), '10.2°');
    add('neitz', 'הנץ החמה', zman.sunrise());
    add('shma', 'סוף זמן קריאת שמע', zman.sofZmanShmaMGA(), 'מגן אברהם (72 דק׳)');
    add('tefilah', 'סוף זמן תפילה', zman.sofZmanTfillaMGA(), 'מגן אברהם (72 דק׳)');
    add('chatzot', 'חצות היום', zman.chatzot());
    add('mincha_gedola', 'מנחה גדולה', zman.minchaGedolaMGA(), 'מגן אברהם');
    add('mincha_ketana', 'מנחה קטנה', zman.minchaKetanaMGA(), 'מגן אברהם');
    add('plag', 'פלג המנחה', zman.plagHaMincha(), 'הגר״א');
    add('shkiah', 'שקיעת החמה', zman.sunset());
    add('tzeit', 'צאת הכוכבים', zman.tzeit(), '8.5°');
    add('tzeit_72', 'צאת הכוכבים (רבנו תם)', zman.tzeit72(), '72 דק׳ אחרי השקיעה');
    add('chatzot_night', 'חצות הלילה', zman.chatzotNight());
  } else if (method === 'mga16') {
    add('alot', 'עלות השחר', zman.alotHaShachar(), '16.1°');
    add('misheyakir', 'משיכיר (טלית ותפילין)', zman.misheyakir(), '10.2°');
    add('neitz', 'הנץ החמה', zman.sunrise());
    add('shma', 'סוף זמן קריאת שמע', zman.sofZmanShmaMGA16Point1(), 'מגן אברהם (16.1°)');
    add('tefilah', 'סוף זמן תפילה', zman.sofZmanTfillaMGA16Point1(), 'מגן אברהם (16.1°)');
    add('chatzot', 'חצות היום', zman.chatzot());
    add('mincha_gedola', 'מנחה גדולה', zman.minchaGedola(), 'הגר״א');
    add('mincha_ketana', 'מנחה קטנה', zman.minchaKetana(), 'הגר״א');
    add('plag', 'פלג המנחה', zman.plagHaMincha(), 'הגר״א');
    add('shkiah', 'שקיעת החמה', zman.sunset());
    add('tzeit', 'צאת הכוכבים', zman.tzeit(), '8.5°');
    add('chatzot_night', 'חצות הלילה', zman.chatzotNight());
  } else {
    add('alot_72', 'עלות השחר (72 דקות)', zman.alotHaShachar72(), '72 דק׳ לפני הנץ');
    add('alot_16', 'עלות השחר (16.1°)', zman.alotHaShachar(), 'מעלות השמש');
    add('alot_chabad', 'עלות השחר (אדמו״ר הזקן)', zman.alosBaalHatanya(), 'חב״ד', true);
    add('misheyakir', 'משיכיר (טלית ותפילין)', zman.misheyakir(), '10.2°');
    add('neitz', 'הנץ החמה', zman.sunrise(), 'מישור');
    add('shma_chabad', 'סוף זמן ק״ש (אדמו״ר הזקן)', zman.sofZmanShmaBaalHatanya(), 'חב״ד', true);
    add('shma_mga', 'סוף זמן ק״ש (מגן אברהם 72 דק׳)', zman.sofZmanShmaMGA(), 'מג״א');
    add('shma_mga16', 'סוף זמן ק״ש (מגן אברהם 16.1°)', zman.sofZmanShmaMGA16Point1(), 'מג״א');
    add('shma_gra', 'סוף זמן ק״ש (הגר״א)', zman.sofZmanShma(), 'הגר״א');
    add('tefilah_chabad', 'סוף זמן תפילה (אדמו״ר הזקן)', zman.sofZmanTfilaBaalHatanya(), 'חב״ד', true);
    add('tefilah_mga', 'סוף זמן תפילה (מגן אברהם 72 דק׳)', zman.sofZmanTfillaMGA(), 'מג״א');
    add('tefilah_gra', 'סוף זמן תפילה (הגר״א)', zman.sofZmanTfilla(), 'הגר״א');
    add('chatzot', 'חצות היום', zman.chatzot());
    add('mincha_gedola_chabad', 'מנחה גדולה (אדמו״ר הזקן)', zman.minchaGedolaBaalHatanya(), 'חב״ד', true);
    add('mincha_gedola_gra', 'מנחה גדולה (הגר״א)', zman.minchaGedola(), 'הגר״א');
    add('mincha_ketana_chabad', 'מנחה קטנה (אדמו״ר הזקן)', zman.minchaKetanaBaalHatanya(), 'חב״ד', true);
    add('mincha_ketana', 'מנחה קטנה (הגר״א)', zman.minchaKetana(), 'הגר״א');
    add('plag_chabad', 'פלג המנחה (אדמו״ר הזקן)', zman.plagHaminchaBaalHatanya(), 'חב״ד', true);
    add('plag_gra', 'פלג המנחה (הגר״א)', zman.plagHaMincha(), 'הגר״א');
    add('shkiah', 'שקיעת החמה', zman.sunset(), 'מישור');
    add('tzeit_chabad', 'צאת הכוכבים (אדמו״ר הזקן)', zman.tzaisBaalHatanya(), 'חב״ד', true);
    add('tzeit_regular', 'צאת הכוכבים (8.5°)', zman.tzeit(), '3 כוכבים בינוניים');
    add('tzeit_72', 'צאת הכוכבים (רבנו תם)', zman.tzeit72(), '72 דקות');
    add('chatzot_night', 'חצות הלילה', zman.chatzotNight());
  }

  return {
    city,
    date,
    dateStrHebrew: date.toLocaleDateString('he-IL', {
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
