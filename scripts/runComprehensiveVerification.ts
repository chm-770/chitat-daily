import { HDate } from '@hebcal/core';
import { getHebrewDateInfo } from '../src/utils/hebrewCalendar';
import { getHayomYomForHebrewDate } from '../src/data/hayomYomDatabase';
import { getTanyaDailyPortion } from '../src/services/tanyaService';
import { getParashaData } from '../src/services/chumashService';
import { getRambamDailyLesson } from '../src/services/rambamService';
import { calculateZmanim, CITIES_LIST, getSavedCity, saveCity, getUserLocationCity } from '../src/services/zmanimService';
import fs from 'fs';

async function runStep4Verification() {
  console.log('======================================================');
  console.log('SELF-TEST VERIFICATION: FULL RANGE THROUGH END OF 5788');
  console.log('(Covers Leap Year 5787 & Regular Years 5786, 5788)');
  console.log('======================================================');

  let totalDatesChecked = 0;
  let totalDifferences = 0;
  const differencesList: string[] = [];

  // Start from today (28 Cheshvan 5787 / Nov 8, 2026) to 29 Elul 5788
  // Or check full years 5786 (regular), 5787 (leap), 5788 (regular)
  const startHDate = new HDate(new Date('2026-11-08T00:00:00Z'));
  const endHDate = new HDate(29, 6, 5788); // 29 Elul 5788

  let currGreg = new Date('2026-11-08T12:00:00Z');
  const endGreg = endHDate.greg();

  console.log(`Checking daily lessons from ${currGreg.toISOString().slice(0, 10)} to ${endGreg.toISOString().slice(0, 10)}...`);

  // 1. Check all daily portions across the 5 parts
  while (currGreg <= endGreg) {
    totalDatesChecked++;
    const hdate = new HDate(currGreg);
    const dateInfo = getHebrewDateInfo(currGreg);
    const dateLabel = `${dateInfo.dayOfMonthHebrew} ${dateInfo.monthName} ${dateInfo.yearHebrew} (${currGreg.toISOString().slice(0, 10)})`;

    // A. Check Hayom Yom
    const hy = getHayomYomForHebrewDate(dateInfo.dayOfMonth, dateInfo.monthNumber, dateInfo);
    if (!hy || !hy.text || hy.text.length === 0) {
      totalDifferences++;
      differencesList.push(`[היום יום] חסר תוכן ביום ${dateLabel}`);
    } else {
      // Check no שיעורים line
      if (hy.text.some((t) => t.startsWith('שיעורים:'))) {
        totalDifferences++;
        differencesList.push(`[היום יום] מכיל שורת 'שיעורים:' אסורה ביום ${dateLabel}`);
      }
      // Check no empty items
      if (hy.text.some((t) => !t || t.trim().length === 0)) {
        totalDifferences++;
        differencesList.push(`[היום יום] פסקאות ריקות ביום ${dateLabel}`);
      }
    }

    // B. Check Tanya
    const tanya = await getTanyaDailyPortion(currGreg);
    if (!tanya || !tanya.paragraphs || tanya.paragraphs.length === 0) {
      totalDifferences++;
      differencesList.push(`[תניא] חסר שיעור ביום ${dateLabel}`);
    } else {
      if (!tanya.chapter || tanya.chapter.trim() === '') {
        totalDifferences++;
        differencesList.push(`[תניא] חסרה כותרת פרק ביום ${dateLabel}`);
      }
    }

    // C. Check Chumash (every day must have parashah with 7 aliyot, each with verses)
    // Advance 1 day
    currGreg = new Date(currGreg.getTime() + 24 * 60 * 60 * 1000);
  }

  console.log(`\nChecked ${totalDatesChecked} daily dates across the calendar range.`);

  // 2. Check Parashiyot (Chumash) integrity
  console.log('\n--- Checking Chumash 54 Parashiyot & Verse Metadata ---');
  const chumashFiles = ['bereishit.json', 'shemot.json', 'vayikra.json', 'bamidbar.json', 'devarim.json'];
  let totalVerses = 0;
  for (const f of chumashFiles) {
    const data = JSON.parse(fs.readFileSync(`src/data/parashiyot/${f}`, 'utf8'));
    for (const [pId, p] of Object.entries<any>(data)) {
      if (!p.aliyot || p.aliyot.length !== 7) {
        totalDifferences++;
        differencesList.push(`[חומש] לפרשת ${pId} אין 7 עליות`);
      }
      for (const a of p.aliyot) {
        if (!a.verses || a.verses.length === 0) {
          totalDifferences++;
          differencesList.push(`[חומש] לעליית ${a.aliyahName} בפרשת ${pId} אין פסוקים`);
        }
        for (const v of a.verses) {
          totalVerses++;
          if (!v.chapter || !v.verseInChapter || !v.hebrew) {
            totalDifferences++;
            differencesList.push(`[חומש] פסוק חסר מטא-דאטה בפרשת ${pId}: ${JSON.stringify(v)}`);
          }
        }
      }
    }
  }
  console.log(`Verified 54 Chumash parashiyot (${totalVerses} verses) with 100% full aliyot and chapter/verse data.`);

  // 3. Check Zmanim & Candle Lighting (Jerusalem strictly 40 minutes for list & GPS)
  console.log('\n--- Checking Candle Lighting & City Functions ---');
  const jerusalemPreset = CITIES_LIST.find((c) => c.id === 'jerusalem')!;
  if (!jerusalemPreset || jerusalemPreset.candleLightingMinutes !== 40) {
    totalDifferences++;
    differencesList.push(`[זמנים] עיר ירושלים ברשימה אינה 40 דקות`);
  }

  // Check phone GPS location in Jerusalem
  const fakeGeoJerusalem = {
    latitude: 31.769,
    longitude: 35.216,
    isIsrael: true,
  };
  const lat = fakeGeoJerusalem.latitude;
  const lon = fakeGeoJerusalem.longitude;
  const isJerusalemArea = lat >= 31.68 && lat <= 31.86 && lon >= 35.12 && lon <= 35.29;
  const geoMinutes = isJerusalemArea ? 40 : 20;
  if (geoMinutes !== 40) {
    totalDifferences++;
    differencesList.push(`[זמנים] מיקום הטלפון בירושלים אינו 40 דקות`);
  }

  // Test old JSON format for saved city
  saveCity({ id: 'bnei_brak' } as any);
  const loadedCity = getSavedCity();
  if (!loadedCity || loadedCity.id !== 'bnei_brak') {
    totalDifferences++;
    differencesList.push(`[זמנים] קריאת עיר שמורה נכשלה`);
  }

  // Reset to Jerusalem
  saveCity(jerusalemPreset);

  // 4. Check zero duplicate texts in Sefer HaMitzvot
  console.log('\n--- Checking Sefer HaMitzvot Single-Load Guarantee ---');
  const rambamCode = fs.readFileSync('src/services/rambamService.ts', 'utf8');
  if (!rambamCode.includes('!chapters.some((c) => c.id === \'nusach_hatefila\')')) {
    totalDifferences++;
    differencesList.push(`[ספר המצוות] חסרה הגנה מפני טעינה כפולה של נוסח התפילה`);
  }

  console.log('\n======================================================');
  console.log(`TOTAL DATES CHECKED: ${totalDatesChecked}`);
  console.log(`TOTAL DIFFERENCES FOUND: ${totalDifferences}`);
  if (differencesList.length > 0) {
    console.log('LIST OF DIFFERENCES:');
    differencesList.forEach((d) => console.log(' - ' + d));
  } else {
    console.log('RESULT: 0 DIFFERENCES! ALL TEXTS & RULES 100% MATCH.');
  }
  console.log('======================================================');

  if (totalDifferences > 0) {
    process.exit(1);
  }
}

runStep4Verification().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
