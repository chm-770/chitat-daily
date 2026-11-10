import { HDate } from '@hebcal/core';
import { getHebrewDateInfo } from '../src/utils/hebrewCalendar';
import { getCurrentParashaInfo, ALL_PARASHIYOT } from '../src/services/chumashService';
import { getTanyaDailyPortion } from '../src/services/tanyaService';
import { getHayomYomForHebrewDate } from '../src/data/hayomYomDatabase';

async function verifyYear(yearNum: number, isLeapExpected: boolean) {
  console.log(`\n======================================================`);
  console.log(`Testing Full Hebrew Year ${yearNum} (${isLeapExpected ? 'Leap Year' : 'Regular Year'})`);
  console.log(`======================================================`);

  const startDate = new HDate(1, 7, yearNum).greg(); // 1 Tishrei
  const endDate = new HDate(29, 6, yearNum).greg();  // 29 Elul

  const parashaIdsSet = new Set(ALL_PARASHIYOT.map(p => p.id));
  
  let totalDays = 0;
  let errorsCount = 0;
  const recordedTanyaTexts: string[] = [];
  const recordedHayomYomTexts: string[] = [];

  let cur = new Date(startDate);
  // Iterate until day after endDate
  while (cur <= endDate) {
    totalDays++;
    const dateInfo = getHebrewDateInfo(cur);
    const dateStr = `${dateInfo.dayOfMonthHebrew} ב${dateInfo.monthName} ${dateInfo.yearHebrew}`;

    // 1. Verify Month Name distinguishes Adar I and Adar II in leap year
    if (isLeapExpected) {
      if (dateInfo.monthNumber === 12 && dateInfo.monthName !== 'אדר א׳') {
        console.error(`[FAIL] ${dateStr}: Expected 'אדר א׳' in leap year, got '${dateInfo.monthName}'`);
        errorsCount++;
      }
      if (dateInfo.monthNumber === 13 && dateInfo.monthName !== 'אדר ב׳') {
        console.error(`[FAIL] ${dateStr}: Expected 'אדר ב׳' in leap year, got '${dateInfo.monthName}'`);
        errorsCount++;
      }
    } else {
      if (dateInfo.monthNumber === 12 && dateInfo.monthName !== 'אדר') {
        console.error(`[FAIL] ${dateStr}: Expected 'אדר' in regular year, got '${dateInfo.monthName}'`);
        errorsCount++;
      }
    }

    // 2. Verify Chumash Parashah is identified
    const pInfo = await getCurrentParashaInfo(cur);
    if (!pInfo.id || !parashaIdsSet.has(pInfo.id)) {
      console.error(`[FAIL] ${dateStr}: Unrecognized Parasha ID '${pInfo.id}' (${pInfo.name})`);
      errorsCount++;
    }

    // 3. Verify Tehillim Portion
    if (!dateInfo.tehillimMonthlyPortion || !dateInfo.tehillimMonthlyPortion.includes('פרק')) {
      console.error(`[FAIL] ${dateStr}: Missing or invalid Tehillim portion '${dateInfo.tehillimMonthlyPortion}'`);
      errorsCount++;
    }

    // 4. Verify Tanya Portion
    const tanya = await getTanyaDailyPortion(cur);
    if (!tanya || !tanya.paragraphs || tanya.paragraphs.length === 0) {
      console.error(`[FAIL] ${dateStr}: Missing Tanya portion`);
      errorsCount++;
    } else {
      const fullTanyaText = tanya.paragraphs.join(' ');
      // Check title does not duplicate "לקוטי אמרים – לקוטי אמרים"
      if (tanya.chapter.includes('לקוטי אמרים – לקוטי אמרים')) {
        console.error(`[FAIL] ${dateStr}: Duplicate Tanya chapter title: '${tanya.chapter}'`);
        errorsCount++;
      }
      // Check for word collisions
      if (/הגהה[א-ת]/.test(fullTanyaText)) {
        console.error(`[FAIL] ${dateStr}: Found 'הגהה' sticking to Hebrew word without space in Tanya`);
        errorsCount++;
      }
      if (fullTanyaText.includes('ספרלקוטי')) {
        console.error(`[FAIL] ${dateStr}: Found 'ספרלקוטי' without space in Tanya`);
        errorsCount++;
      }
      // Check no Latin characters in Hebrew text
      const latinMatch = fullTanyaText.match(/[a-zA-Z]{3,}/);
      if (latinMatch) {
        console.error(`[FAIL] ${dateStr}: Unexpected Latin characters in Tanya: '${latinMatch[0]}'`);
        errorsCount++;
      }
    }

    // 5. Verify Hayom Yom
    const hy = getHayomYomForHebrewDate(dateInfo.dayOfMonth, dateInfo.monthNumber, dateInfo);
    if (!hy || !hy.text || hy.text.length === 0) {
      console.error(`[FAIL] ${dateStr}: Missing Hayom Yom entry`);
      errorsCount++;
    } else {
      const hyStr = hy.text.join(' ');
      // Check for forbidden invented Elul sentence
      if (hyStr.includes('חודש אלול הוא חודש החשבון')) {
        console.error(`[FAIL] ${dateStr}: Found invented sentence 'חודש אלול הוא חודש החשבון' in Hayom Yom!`);
        errorsCount++;
      }
      // Check for removed attribution banner
      if (hyStr.includes('כל הפתגמים באפליקציה מועתקים נאמנה')) {
        console.error(`[FAIL] ${dateStr}: Found removed attribution string in Hayom Yom!`);
        errorsCount++;
      }
      // Check for OCR errors like 'חםידות' or 'אץ'
      if (hyStr.includes('חםידות') || hyStr.includes(' חםידים ')) {
        console.error(`[FAIL] ${dateStr}: Found OCR error 'חםידות' in Hayom Yom!`);
        errorsCount++;
      }
    }

    // Step to next day (add 24h + 1h to avoid DST boundary issues)
    cur = new Date(cur.getTime() + 25 * 3600 * 1000);
    cur.setHours(12, 0, 0, 0);
  }

  console.log(`Year ${yearNum} completed: ${totalDays} days checked. Total errors: ${errorsCount}`);
  if (errorsCount > 0) {
    throw new Error(`Verification failed for year ${yearNum} with ${errorsCount} errors!`);
  }
}

async function main() {
  console.log('Starting Automated Chitas Year Verification...');
  // Regular year 5786 (non-leap)
  await verifyYear(5786, false);
  // Leap year 5784 (leap)
  await verifyYear(5784, true);
  console.log('\n======================================================');
  console.log('ALL TESTS PASSED! Every day in regular and leap year is 100% verified.');
  console.log('======================================================\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
