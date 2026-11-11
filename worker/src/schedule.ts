/**
 * Computes the reminders of one device: the lesson times, Sof Zman Kriat Shema (Shitas Admur
 * HaZaken, as in the app) and the candle lighting time on Erev Shabbat / Erev Yom Tov.
 * No reminder is sent on Shabbat or Yom Tov (from candle lighting until Havdalah).
 */
import { HebrewCalendar, Location, Zmanim, flags } from '@hebcal/core';

export interface ReminderCity {
  name: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  isIsrael: boolean;
  candleLightingMinutes: number;
}

export interface ReminderDoc {
  /** Time zone of the device (lesson times are in it) */
  timeZone?: string;
  city: ReminderCity;
  inIsrael?: boolean;
  lessons?: Record<string, string>;
  shema?: { enabled?: boolean; minutesBefore?: number };
  shabbat?: { enabled?: boolean; time?: string };
}

export interface Reminder {
  at: number;
  title: string;
  body: string;
  url: string;
  tag: string;
}

const LESSONS: { key: string; label: string; section: string }[] = [
  { key: 'chumash', label: 'חומש עם רש״י', section: 'chumash' },
  { key: 'tehillim', label: 'תהילים', section: 'tehillim' },
  { key: 'tanya', label: 'תניא', section: 'tanya' },
  { key: 'hayomYom', label: 'היום יום', section: 'hayom_yom' },
  { key: 'rambam', label: 'רמב״ם', section: 'rambam' },
];

const DAY = 24 * 3600 * 1000;

// ---------- Time zone helpers ----------

type YMD = { y: number; m: number; d: number };

const partsFormatters = new Map<string, Intl.DateTimeFormat>();
function parts(ms: number, timeZone: string) {
  let f = partsFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    partsFormatters.set(timeZone, f);
  }
  const out: Record<string, number> = {};
  for (const p of f.formatToParts(new Date(ms))) if (p.type !== 'literal') out[p.type] = Number(p.value);
  return { y: out.year, m: out.month, d: out.day, hh: out.hour % 24, mm: out.minute, ss: out.second };
}

function tzOffset(ms: number, timeZone: string): number {
  const p = parts(ms, timeZone);
  return Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss) - Math.floor(ms / 1000) * 1000;
}

/** The instant of a wall clock time in a time zone. */
export function wallTime(day: YMD, hh: number, mm: number, timeZone: string): number {
  const guess = Date.UTC(day.y, day.m - 1, day.d, hh, mm);
  let t = guess - tzOffset(guess, timeZone);
  t = guess - tzOffset(t, timeZone);
  return t;
}

export function localDay(ms: number, timeZone: string): YMD {
  const p = parts(ms, timeZone);
  return { y: p.y, m: p.m, d: p.d };
}

function addDays(day: YMD, n: number): YMD {
  const t = new Date(Date.UTC(day.y, day.m - 1, day.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function key(day: YMD) {
  return `${day.y}-${day.m}-${day.d}`;
}

/** Noon of that calendar day: hebcal reads the local year/month/day of a Date. */
function asDate(day: YMD): Date {
  return new Date(day.y, day.m - 1, day.d, 12);
}

export function formatTime(ms: number, timeZone: string): string {
  const p = parts(ms, timeZone);
  return `${String(p.hh).padStart(2, '0')}:${String(p.mm).padStart(2, '0')}`;
}

function parseHHMM(s?: string): [number, number] | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  return hh < 24 && mm < 60 ? [hh, mm] : null;
}

// ---------- Calendar of one city ----------

interface DayInfo {
  holy: boolean;
  chagName: string | null;
  sunset: number | null;
  shma: number | null;
  havdalah: number | null;
}

export class CityCalendar {
  private cache = new Map<string, DayInfo>();
  private loc: Location;

  constructor(private city: ReminderCity, private inIsrael: boolean) {
    this.loc = new Location(city.latitude, city.longitude, inIsrael, city.timeZone, city.name, inIsrael ? 'IL' : 'US');
  }

  get timeZone() {
    return this.city.timeZone;
  }

  day(day: YMD): DayInfo {
    const k = key(day);
    const cached = this.cache.get(k);
    if (cached) return cached;
    const date = asDate(day);
    const z = new Zmanim(this.loc, date, false);
    const ms = (d: Date | null) => (d && !isNaN(d.getTime()) ? d.getTime() : null);
    let holy = new Date(Date.UTC(day.y, day.m - 1, day.d)).getUTCDay() === 6;
    let chagName: string | null = null;
    let havdalah: number | null = null;
    const events = HebrewCalendar.calendar({
      start: date,
      end: date,
      il: this.inIsrael,
      location: this.loc,
      candlelighting: true,
      candleLightingMins: this.city.candleLightingMinutes,
    });
    for (const ev of events) {
      if (ev.getFlags() & flags.CHAG) {
        holy = true;
        chagName = chagName || ev.render('he-x-NoNikud');
      }
      if (ev.getDesc() === 'Havdalah') havdalah = ms((ev as any).eventTime || null);
    }
    const sunset = ms(z.sunset());
    const info: DayInfo = {
      holy,
      chagName,
      sunset,
      shma: ms(z.sofZmanShmaBaalHatanya()),
      havdalah: havdalah ?? (sunset !== null ? sunset + 50 * 60 * 1000 : null),
    };
    this.cache.set(k, info);
    return info;
  }

  candleLighting(day: YMD): number | null {
    const s = this.day(day).sunset;
    return s === null ? null : s - this.city.candleLightingMinutes * 60 * 1000;
  }

  /** True from candle lighting before Shabbat / Yom Tov until Havdalah. */
  isBlocked(ms: number): boolean {
    const day = localDay(ms, this.city.timeZone);
    const today = this.day(day);
    const tomorrow = this.day(addDays(day, 1));
    if (today.holy) {
      return tomorrow.holy || today.havdalah === null || ms < today.havdalah;
    }
    const candle = this.candleLighting(day);
    return tomorrow.holy && candle !== null && ms >= candle;
  }
}

/** Title of the notification on the eve of Shabbat / Yom Tov. */
function erevTitle(chagName: string | null): string {
  if (!chagName) return 'ערב שבת קודש';
  if (/^פסח ז/.test(chagName)) return 'ערב שביעי של פסח';
  const name = chagName.replace(/\s*\d{4}$/, '').replace(/\s+[א-ת]׳$/, '');
  if (name === 'ראש השנה') return 'ערב ראש השנה';
  if (name === 'יום כיפור') return 'ערב יום הכיפורים';
  return `ערב חג ${name}`;
}

function joinHebrew(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}`;
}

/** All reminders of the device between `from` and `to` (ms), Shabbat and Yom Tov left out. */
export function computeReminders(doc: ReminderDoc, from: number, to: number, appUrl = ''): Reminder[] {
  const cal = new CityCalendar(doc.city, doc.inIsrael ?? doc.city.isIsrael);
  const deviceTz = doc.timeZone || doc.city.timeZone;
  const out: Reminder[] = [];
  const days = (tz: string) => {
    const list: YMD[] = [];
    const first = localDay(from, tz);
    for (let i = -1; i <= Math.ceil((to - from) / DAY) + 1; i++) list.push(addDays(first, i));
    return list;
  };

  // Lessons, grouped by time
  const byTime = new Map<string, typeof LESSONS>();
  for (const l of LESSONS) {
    const t = doc.lessons?.[l.key];
    if (parseHHMM(t)) byTime.set(t!, [...(byTime.get(t!) || []), l]);
  }
  for (const day of days(deviceTz)) {
    for (const [t, lessons] of byTime) {
      const [hh, mm] = parseHHMM(t)!;
      out.push({
        at: wallTime(day, hh, mm, deviceTz),
        title: 'חת״ת יומי',
        body: `הגיע הזמן ללמוד ${joinHebrew(lessons.map((l) => l.label))} של היום`,
        url: `${appUrl}/${lessons.length === 1 ? `?section=${lessons[0].section}` : ''}`,
        tag: `lesson-${t}`,
      });
    }
  }

  for (const day of days(cal.timeZone)) {
    const info = cal.day(day);

    if (doc.shema?.enabled && info.shma !== null) {
      const before = doc.shema.minutesBefore || 30;
      out.push({
        at: info.shma - before * 60 * 1000,
        title: 'סוף זמן קריאת שמע',
        body: `בשעה ${formatTime(info.shma, cal.timeZone)} (${before === 60 ? 'בעוד שעה' : `בעוד ${before} דקות`}) ב${doc.city.name}`,
        url: `${appUrl}/`,
        tag: 'shema',
      });
    }

    const t = parseHHMM(doc.shabbat?.time);
    const tomorrow = cal.day(addDays(day, 1));
    const candle = cal.candleLighting(day);
    if (doc.shabbat?.enabled && t && !info.holy && tomorrow.holy && candle !== null) {
      const at = wallTime(day, t[0], t[1], cal.timeZone);
      if (at < candle) {
        out.push({
          at,
          title: erevTitle(tomorrow.chagName),
          body: `הדלקת נרות היום ב${doc.city.name} בשעה ${formatTime(candle, cal.timeZone)}`,
          url: `${appUrl}/`,
          tag: 'shabbat',
        });
      }
    }
  }

  return out
    .filter((r) => r.at >= from && r.at <= to && !cal.isBlocked(r.at))
    .sort((a, b) => a.at - b.at);
}
