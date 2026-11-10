import fs from 'fs';
import path from 'path';

// Helper to convert Hebrew numerals / letters to day number
const HEB_NUM_MAP: Record<string, number> = {
  "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5, "ו": 6, "ז": 7, "ח": 8, "ט": 9, "י": 10,
  "יא": 11, "יב": 12, "יג": 13, "יד": 14, "טו": 15, "טז": 16, "יז": 17, "יח": 18, "יט": 19, "כ": 20,
  "כא": 21, "כב": 22, "כג": 23, "כד": 24, "כה": 25, "כו": 26, "כז": 27, "כח": 28, "כט": 29, "ל": 30
};

function cleanHebKey(str: string): number {
  const cleaned = str.replace(/[\'\"\s]/g, '');
  return HEB_NUM_MAP[cleaned] || 0;
}

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

async function main() {
  const rawPDF2 = fs.readFileSync('temp_pdf2_text.txt', 'utf-8');

  // Regex to split into months
  const monthRegex = /(תשרי|חשון|כסלו|טבת|שבט|אדר\s*א[\'\s]*|אדר\s*ב[\'\s]*|ניסן|אייר|סיון|תמוז|מנחם\s*אב)\s+ליום/g;
  let match: RegExpExecArray | null;
  const monthIndices: { rawName: string; index: number }[] = [];
  while ((match = monthRegex.exec(rawPDF2)) !== null) {
    monthIndices.push({ rawName: match[1].trim(), index: match.index });
  }

  const database: Record<string, { hebrewDate: string; monthName: string; dayNumber: number; monthNumber: number; text: string[] }> = {};

  for (let m = 0; m < monthIndices.length; m++) {
    const mInfo = monthIndices[m];
    const monthDef = MONTHS_ORDER[m];
    const startIdx = mInfo.index;
    const endIdx = m + 1 < monthIndices.length ? monthIndices[m + 1].index : rawPDF2.length;
    const monthChunk = rawPDF2.slice(startIdx, endIdx);

    // Split by "ליום <day>"
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

      // Clean up headers like "---PAGE_XX---"
      textChunk = textChunk.replace(/---PAGE_\d+---/g, '').trim();

      // Split paragraphs
      const paragraphs = textChunk
        .split(/(?:\r?\n|\s{3,})/)
        .map((p) => p.trim())
        .filter((p) => p.length > 5 && !p.startsWith('שיעורים') && !p.startsWith('---'));

      if (paragraphs.length > 0) {
        const key = `${dayNum}_${monthDef.num}`;
        database[key] = {
          hebrewDate: `${dInfo.dayStr} ${monthDef.name}`,
          monthName: monthDef.name,
          dayNumber: dayNum,
          monthNumber: monthDef.num,
          text: paragraphs
        };
      }
    }
  }

  console.log('Total days parsed from PDF 2:', Object.keys(database).length);
  // Check sample: 22 Cheshvan (22_8) and 23 Cheshvan (23_8)
  console.log('Sample 22_8:', database['22_8']);
  console.log('Sample 23_8:', database['23_8']);
}

main().catch(console.error);
