/* Checks the reminder schedule on known dates. Run: npm test */
import { computeReminders, formatTime, type ReminderDoc } from '../src/schedule';

const jerusalem: ReminderDoc = {
  timeZone: 'Asia/Jerusalem',
  city: { name: 'ירושלים', latitude: 31.76904, longitude: 35.21633, timeZone: 'Asia/Jerusalem', isIsrael: true, candleLightingMinutes: 40 },
  inIsrael: true,
  lessons: { chumash: '07:30', tanya: '07:30', rambam: '21:00', tehillim: '', hayomYom: '' },
  shema: { enabled: true, minutesBefore: 30 },
  shabbat: { enabled: true, time: '09:00' },
};
const paris: ReminderDoc = {
  ...jerusalem,
  timeZone: 'Europe/Paris',
  city: { name: 'פריז', latitude: 48.8566, longitude: 2.3522, timeZone: 'Europe/Paris', isIsrael: false, candleLightingMinutes: 18 },
  inIsrael: false,
};

function show(doc: ReminderDoc, fromIso: string, days: number) {
  const from = Date.parse(fromIso);
  for (const r of computeReminders(doc, from, from + days * 86400000, 'https://chitatdaily.pages.dev')) {
    const day = new Date(r.at).toLocaleDateString('he-IL', { timeZone: doc.city.timeZone, weekday: 'short', day: 'numeric', month: 'numeric' });
    console.log(`${day} ${formatTime(r.at, doc.timeZone!)} | ${r.title} | ${r.body} | ${r.url}`);
  }
}

console.log('== Jerusalem, week of 13 Nov 2026 (Friday) ==');
show(jerusalem, '2026-11-11T00:00:00+02:00', 6);
console.log('\n== Paris, Shavuot 2027 (6–7 Sivan = 11–12 June) ==');
show(paris, '2027-06-09T00:00:00+02:00', 6);
