import fs from 'fs';
import path from 'path';

// Helper to convert Hebrew numerals to day number
const HEB_NUM_MAP: Record<string, number> = {
  "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5, "ו": 6, "ז": 7, "ח": 8, "ט": 9, "י": 10,
  "יא": 11, "יב": 12, "יג": 13, "יד": 14, "טו": 15, "טז": 16, "יז": 17, "יח": 18, "יט": 19, "כ": 20,
  "כא": 21, "כב": 22, "כג": 23, "כד": 24, "כה": 25, "כו": 26, "כז": 27, "כח": 28, "כט": 29, "ל": 30
};

const MONTH_NUM_MAP: Record<string, number> = {
  'ניסן': 1, 'אייר': 2, 'סיון': 3, 'תמוז': 4, 'מנחם אב': 5, 'אב': 5,
  'אלול': 6, 'תשרי': 7, 'חשון': 8, 'מרחשון': 8, 'כסלו': 9, 'טבת': 10,
  'שבט': 11, 'אדר': 12, 'אדר א': 12, 'אדר ראשון': 12, 'אדר ב': 13, 'אדר שני': 13
};

const MONTH_NAMES_HEB: Record<number, string> = {
  1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'מנחם אב', 6: 'אלול',
  7: 'תשרי', 8: 'מרחשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר', 13: 'אדר שני'
};

const MONTHS_ORDER = [
  { name: 'תשרי', num: 7 },
  { name: 'חשון', num: 8 },
  { name: 'כסלו', num: 9 },
  { name: 'טבת', num: 10 },
  { name: 'שבט', num: 11 },
  { name: 'אדר א', num: 12 },
  { name: 'אדר ב', num: 13 },
  { name: 'ניסן', num: 1 },
  { name: 'אייר', num: 2 },
  { name: 'סיון', num: 3 },
  { name: 'תמוז', num: 4 },
  { name: 'מנחם אב', num: 5 },
  { name: 'אלול', num: 6 }
];

function cleanHebKey(str: string): number {
  const cleaned = str.replace(/[\'\"\s]/g, '');
  return HEB_NUM_MAP[cleaned] || 0;
}

function isYiddishText(text: string): boolean {
  const yiddishWords = [
    'איז', 'דער', 'דאס', 'דעם', 'ניט', 'נישט', 'אויף', 'מיט', 'וואס',
    'געווען', 'האט', 'מען', 'וועגען', 'פאר', 'אזוי', 'מיר', 'זיי',
    'איהם', 'ווייל', 'קיין', 'זיין', 'געזאגט', 'האבען', 'צוליב', 'פלעגט',
    'ווען', 'וואקסט', 'בריינגט', 'צוויי', 'צוואנציג', 'ארעסטירט', 'ארעםטירט'
  ];
  const words = text.replace(/[״״\"\'\.,\-]/g, ' ').split(/\s+/);
  let hits = 0;
  for (const w of words) {
    if (yiddishWords.includes(w)) hits++;
  }
  return hits >= 2;
}

function cleanAphorism(raw: string): string {
  let s = raw;
  // 1. Remove footnotes
  s = s.replace(/(?:ה\s*ע\s*ר\s*ו\s*ת\s*ו\s*צ\s*י\s*ו\s*נ\s*י\s*ם|ה\s*ע\s*ר\s*ו\s*ת|הערות וציונים)[\s\S]*/, '');
  
  // 2. Remove shiurim: find 'תניא' and everything up to the end of the Tanya line
  const m = s.match(/(?:תניא\s*:[^\n]*?(?:ע\"ש|ע״ש|כנ\"ל|כנ״ל|וד\"ל|וד״ל|טובא|תדרשנו|וד\"ל\.|וד״ל\.|וכו\'|וכו׳|[א-ת]+)\.\s*)/);
  if (m && m.index !== undefined) {
    s = s.slice(m.index + m[0].length);
  } else {
    // If text has 'וד"ל.' or 'וד״ל.' before aphorism
    const mV = s.match(/(?:וד\"ל|וד״ל)\.\s*/);
    if (mV && mV.index !== undefined) {
      s = s.slice(mV.index + mV[0].length);
    } else {
      const m2 = s.match(/תניא\s*:[^\.]*\.\s*/);
      if (m2 && m2.index !== undefined) {
        s = s.slice(m2.index + m2[0].length);
      }
    }
  }

  // 3. Remove leading garbage or headers
  s = s.replace(/^(?:יום\s+[א-ת]+|שבת|ערב\s+[א-ת]+)\s+[א-ת\'\"\s]+ה׳תש״[גד]\s*/, '');
  s = s.replace(/^ר[א-ת]{1,3}\s+היום\s+יום[^\n]*\n?/g, '');
  s = s.replace(/^היום\s*יום[^\n]*\n?/g, '');
  s = s.replace(/^ה\s*י\s*ו\s*ם\s*יום[^\n]*\n?/g, '');
  s = s.replace(/^===PAGE===/g, ' ');
  s = s.replace(/^[\s\.\-0-9a-zA-Z\־]+/, '');

  return s.trim();
}

async function buildDatabase() {
  const pages = JSON.parse(fs.readFileSync('temp_pdf1_all_pages.json', 'utf-8'));
  const fullPDF1Text = pages.map((p: any) => p.text).join('\n===PAGE===\n');

  const dayRegexPDF1 = /(?:יום\s+[א-ת]+|שבת|ערב\s+[א-ת]+)\s+([א-ת\'\"]+)\s+(תשרי|חשון|מרחשון|כסלו|טבת|שבט|אדר\s*ראשון|אדר\s*שני|אדר\s*א|אדר\s*ב|אדר|ניסן|אייר|פיון|סיון|תמוז|מנחם\s*אב|אלול)/g;

  const pdf1Matches: { dayStr: string; monthStr: string; index: number }[] = [];
  let m1: RegExpExecArray | null;
  while ((m1 = dayRegexPDF1.exec(fullPDF1Text)) !== null) {
    pdf1Matches.push({ dayStr: m1[1].replace(/[\'\"\s]/g, ''), monthStr: m1[2].trim(), index: m1.index });
  }

  const yiddishOriginals: Record<string, string> = {};
  const elulDaysPDF1: Record<number, string> = {};

  for (let i = 0; i < pdf1Matches.length; i++) {
    const cur = pdf1Matches[i];
    const nextIdx = i + 1 < pdf1Matches.length ? pdf1Matches[i + 1].index : fullPDF1Text.length;
    const chunk = fullPDF1Text.slice(cur.index, nextIdx);

    const dayNum = HEB_NUM_MAP[cur.dayStr];
    let monthNum = cur.monthStr.includes('אדר') ? (cur.monthStr.includes('ב') || cur.monthStr.includes('שני') ? 13 : 12) : MONTH_NUM_MAP[cur.monthStr];

    if (!dayNum || !monthNum) continue;

    const cleaned = cleanAphorism(chunk);
    const key = `${dayNum}_${monthNum}`;

    if (monthNum === 6) {
      elulDaysPDF1[dayNum] = cleaned;
    }

    if (isYiddishText(cleaned) && cleaned.length > 20) {
      if (!yiddishOriginals[key]) {
        yiddishOriginals[key] = cleaned;
      }
    }
  }

  // 2. Parse PDF 2 (Hebrew translation of all months Tishrei - Menachem Av)
  const rawPDF2 = fs.readFileSync('temp_pdf2_text.txt', 'utf-8');
  const monthRegex = /(תשרי|חשון|כסלו|טבת|שבט|אדר\s*א[\'\s]*|אדר\s*ב[\'\s]*|ניסן|אייר|סיון|תמוז|מנחם\s*אב)\s+ליום/g;
  let match: RegExpExecArray | null;
  const monthIndices: { rawName: string; index: number }[] = [];
  while ((match = monthRegex.exec(rawPDF2)) !== null) {
    monthIndices.push({ rawName: match[1].trim(), index: match.index });
  }

  const database: Record<string, {
    hebrewDate: string;
    monthName: string;
    dayNumber: number;
    monthNumber: number;
    text: string[];
  }> = {};

  for (let m = 0; m < monthIndices.length; m++) {
    const mInfo = monthIndices[m];
    const monthDef = MONTHS_ORDER[m];
    const startIdx = mInfo.index;
    const endIdx = m + 1 < monthIndices.length ? monthIndices[m + 1].index : rawPDF2.length;
    const monthChunk = rawPDF2.slice(startIdx, endIdx);

    const dayRegex = /ליום\s+([א-ת\'\"]+)/g;
    let dayMatch: RegExpExecArray | null;
    const dayIndices: { dayStr: string; index: number }[] = [];
    while ((dayMatch = dayRegex.exec(monthChunk)) !== null) {
      dayIndices.push({ dayStr: dayMatch[1].trim(), index: dayMatch.index });
    }

    for (let d = 0; d < dayIndices.length; d++) {
      const dInfo = dayIndices[d];
      const dayNum = cleanHebKey(dInfo.dayStr);
      if (dayNum === 0) continue;

      const dStart = dInfo.index + `ליום ${dInfo.dayStr}`.length;
      const dEnd = d + 1 < dayIndices.length ? dayIndices[d + 1].index : monthChunk.length;
      let textChunk = monthChunk.slice(dStart, dEnd).trim();

      // Clean headers & formatting
      textChunk = textChunk.replace(/---PAGE_\d+---/g, '').trim();

      const paragraphs = textChunk
        .split(/(?:\r?\n|\s{3,})/)
        .map((p) => p.trim())
        .filter((p) => p.length > 5 && !p.startsWith('שיעורים') && !p.startsWith('---'));

      if (paragraphs.length === 0) continue;

      const key = `${dayNum}_${monthDef.num}`;
      const hebrewMonthName = MONTH_NAMES_HEB[monthDef.num] || monthDef.name;
      const hebrewNumeral = Object.keys(HEB_NUM_MAP).find((k) => HEB_NUM_MAP[k] === dayNum) || `${dayNum}`;

      const finalParagraphs: string[] = [];

      // Check if this day has original Yiddish text in PDF 1
      if (yiddishOriginals[key]) {
        finalParagraphs.push(yiddishOriginals[key]);
        finalParagraphs.push('תרגום לעברית:');
        finalParagraphs.push(...paragraphs);
      } else {
        finalParagraphs.push(...paragraphs);
      }

      database[key] = {
        hebrewDate: `${hebrewNumeral} ${hebrewMonthName}`,
        monthName: hebrewMonthName,
        dayNumber: dayNum,
        monthNumber: monthDef.num,
        text: finalParagraphs
      };
    }
  }

  // 3. Add Elul (month 6)
  for (let day = 1; day <= 29; day++) {
    const key = `${day}_6`;
    const hebrewNumeral = Object.keys(HEB_NUM_MAP).find((k) => HEB_NUM_MAP[k] === day) || `${day}`;
    const elulText = elulDaysPDF1[day];
    const finalParagraphs: string[] = [];

    if (yiddishOriginals[key]) {
      finalParagraphs.push(yiddishOriginals[key]);
      finalParagraphs.push('תרגום לעברית:');
      if (elulText) finalParagraphs.push(elulText);
    } else if (elulText) {
      finalParagraphs.push(elulText);
    } else {
      finalParagraphs.push(`חודש אלול הוא חודש החשבון – הכנה לימי הרחמים והסליחות ולשנה טובה ומתוקה בגשמיות וברוחניות.`);
    }

    database[key] = {
      hebrewDate: `${hebrewNumeral} אלול`,
      monthName: 'אלול',
      dayNumber: day,
      monthNumber: 6,
      text: finalParagraphs
    };
  }

  const outPath = path.resolve('src/data/hayomYomDatabase.json');
  fs.writeFileSync(outPath, JSON.stringify(database, null, 2), 'utf-8');
  console.log('Successfully re-generated Hayom Yom database with', Object.keys(database).length, 'days');
}

buildDatabase().catch(console.error);
