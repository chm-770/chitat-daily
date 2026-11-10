import fs from 'fs';

interface Verse {
  number: number;
  chapter?: number;
  verseInChapter?: number;
  hebrew: string;
  rashi?: string[];
}

interface Aliyah {
  aliyahNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  aliyahName: string;
  dayOfWeek: string;
  rangeDescription: string;
  verses: Verse[];
  summary: string;
}

interface Parasha {
  id: string;
  name: string;
  book: string;
  englishName: string;
  aliyot: Aliyah[];
}

const ALIYOT_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שביעי'];
const DAYS_OF_WEEK = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום ששי',
  'שבת קודש',
];

// Helper to partition an array of verses by (chap, verse) ranges
function partitionVerses(
  allVerses: Verse[],
  ranges: { startCh: number; startV: number; endCh: number; endV: number }[],
  parashaName: string
): Aliyah[] {
  const aliyot: Aliyah[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    const versesInAliyah = allVerses.filter(v => {
      if (!v.chapter || !v.verseInChapter) return false;
      const isAfterStart =
        v.chapter > r.startCh || (v.chapter === r.startCh && v.verseInChapter >= r.startV);
      const isBeforeEnd =
        v.chapter < r.endCh || (v.chapter === r.endCh && v.verseInChapter <= r.endV);
      return isAfterStart && isBeforeEnd;
    });

    // Re-index number within aliyah 1..N
    versesInAliyah.forEach((v, idx) => {
      v.number = idx + 1;
    });

    const rangeDesc = `${r.startCh}:${r.startV} – ${r.endCh}:${r.endV}`;
    aliyot.push({
      aliyahNumber: (i + 1) as any,
      aliyahName: ALIYOT_NAMES[i],
      dayOfWeek: DAYS_OF_WEEK[i],
      rangeDescription: rangeDesc,
      summary: `עליית ${ALIYOT_NAMES[i]} בפרשת ${parashaName} (${rangeDesc})`,
      verses: versesInAliyah,
    });
  }

  return aliyot;
}

async function fixVayigash() {
  const file = 'src/data/parashiyot/bereishit.json';
  const data: Record<string, Parasha> = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const v = data['vayigash'];

  // Flatten all verses and correctly assign chapter and verseInChapter
  const allVerses = v.aliyot.flatMap(a => a.verses);
  console.log('Original Vayigash verses count:', allVerses.length);

  // Vayigash begins at Genesis 44:18 (chapter 44 has 34 verses, 45 has 28, 46 has 34, 47 has 27)
  let ch = 44;
  let vs = 18;
  allVerses.forEach((vObj) => {
    vObj.chapter = ch;
    vObj.verseInChapter = vs;

    if (ch === 44 && vs === 34) {
      ch = 45;
      vs = 1;
    } else if (ch === 45 && vs === 28) {
      ch = 46;
      vs = 1;
    } else if (ch === 46 && vs === 34) {
      ch = 47;
      vs = 1;
    } else {
      vs++;
    }
  });

  const kehotRanges = [
    { startCh: 44, startV: 18, endCh: 44, endV: 24 }, // 1st: 44:18 - 44:24
    { startCh: 44, startV: 25, endCh: 45, endV: 7 },  // 2nd: 44:25 - 45:7
    { startCh: 45, startV: 8, endCh: 45, endV: 27 },  // 3rd: 45:8 - 45:27
    { startCh: 45, startV: 28, endCh: 46, endV: 7 },  // 4th: 45:28 - 46:7
    { startCh: 46, startV: 8, endCh: 46, endV: 27 },  // 5th: 46:8 - 46:27
    { startCh: 46, startV: 28, endCh: 47, endV: 10 }, // 6th: 46:28 - 47:10
    { startCh: 47, startV: 11, endCh: 47, endV: 27 }, // 7th: 47:11 - 47:27
  ];

  v.aliyot = partitionVerses(allVerses, kehotRanges, v.name);
  console.log('Vayigash aliyot counts:', v.aliyot.map(a => `${a.rangeDescription}: ${a.verses.length}`));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

async function fixTerumah() {
  const file = 'src/data/parashiyot/shemot.json';
  const data: Record<string, Parasha> = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const p = data['terumah'];
  const allVerses = p.aliyot.flatMap(a => a.verses);

  // Correct chapter & verse in Exodus 25:1 to 27:19
  // 25 has 40 verses, 26 has 37 verses, 27:1-19 has 19 verses
  let ch = 25;
  let vs = 1;
  allVerses.forEach((vObj) => {
    vObj.chapter = ch;
    vObj.verseInChapter = vs;

    if (ch === 25 && vs === 40) {
      ch = 26;
      vs = 1;
    } else if (ch === 26 && vs === 37) {
      ch = 27;
      vs = 1;
    } else {
      vs++;
    }
  });

  const kehotRanges = [
    { startCh: 25, startV: 1, endCh: 25, endV: 16 },
    { startCh: 25, startV: 17, endCh: 25, endV: 30 },
    { startCh: 25, startV: 31, endCh: 26, endV: 14 },
    { startCh: 26, startV: 15, endCh: 26, endV: 30 },
    { startCh: 26, startV: 31, endCh: 26, endV: 37 },
    { startCh: 27, startV: 1, endCh: 27, endV: 8 },
    { startCh: 27, startV: 9, endCh: 27, endV: 19 },
  ];

  p.aliyot = partitionVerses(allVerses, kehotRanges, p.name);
  console.log('Terumah aliyot counts:', p.aliyot.map(a => `${a.rangeDescription}: ${a.verses.length}`));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

async function fixNasso() {
  const file = 'src/data/parashiyot/bamidbar.json';
  const data: Record<string, Parasha> = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const p = data['nasso'];
  const allVerses = p.aliyot.flatMap(a => a.verses);

  // Numbers 4:21 to 7:89
  // 4:21-49 (29 verses), 5:1-31 (31 verses), 6:1-27 (27 verses), 7:1-89 (89 verses)
  let ch = 4;
  let vs = 21;
  allVerses.forEach((vObj) => {
    vObj.chapter = ch;
    vObj.verseInChapter = vs;

    if (ch === 4 && vs === 49) {
      ch = 5;
      vs = 1;
    } else if (ch === 5 && vs === 31) {
      ch = 6;
      vs = 1;
    } else if (ch === 6 && vs === 27) {
      ch = 7;
      vs = 1;
    } else {
      vs++;
    }
  });

  const kehotRanges = [
    { startCh: 4, startV: 21, endCh: 4, endV: 28 },
    { startCh: 4, startV: 29, endCh: 4, endV: 49 },
    { startCh: 5, startV: 1, endCh: 5, endV: 10 },
    { startCh: 5, startV: 11, endCh: 6, endV: 27 },
    { startCh: 7, startV: 1, endCh: 7, endV: 41 },
    { startCh: 7, startV: 42, endCh: 7, endV: 83 },
    { startCh: 7, startV: 84, endCh: 7, endV: 89 },
  ];

  p.aliyot = partitionVerses(allVerses, kehotRanges, p.name);
  console.log('Nasso aliyot counts:', p.aliyot.map(a => `${a.rangeDescription}: ${a.verses.length}`));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

async function fixDevarim() {
  const file = 'src/data/parashiyot/devarim.json';
  const data: Record<string, Parasha> = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const p = data['devarim'];
  const allVerses = p.aliyot.flatMap(a => a.verses);

  // Deut 1:1 to 3:22
  // 1:1-46 (46 verses), 2:1-37 (37 verses), 3:1-22 (22 verses)
  let ch = 1;
  let vs = 1;
  allVerses.forEach((vObj) => {
    vObj.chapter = ch;
    vObj.verseInChapter = vs;

    if (ch === 1 && vs === 46) {
      ch = 2;
      vs = 1;
    } else if (ch === 2 && vs === 37) {
      ch = 3;
      vs = 1;
    } else {
      vs++;
    }
  });

  const kehotRanges = [
    { startCh: 1, startV: 1, endCh: 1, endV: 11 },
    { startCh: 1, startV: 12, endCh: 1, endV: 21 },
    { startCh: 1, startV: 22, endCh: 1, endV: 38 },
    { startCh: 1, startV: 39, endCh: 2, endV: 1 },
    { startCh: 2, startV: 2, endCh: 2, endV: 30 },
    { startCh: 2, startV: 31, endCh: 3, endV: 14 },
    { startCh: 3, startV: 15, endCh: 3, endV: 22 },
  ];

  p.aliyot = partitionVerses(allVerses, kehotRanges, p.name);
  console.log('Devarim aliyot counts:', p.aliyot.map(a => `${a.rangeDescription}: ${a.verses.length}`));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// Fix Chayei Sara and Toldot .ts files to include chapter and verseInChapter
async function fixChayeiSaraAndToldotFiles() {
  const bData: Record<string, Parasha> = JSON.parse(fs.readFileSync('src/data/parashiyot/bereishit.json', 'utf-8'));

  const cs = bData['chayei_sara'];
  if (cs) {
    const csContent = `import { Parasha } from '../types/chitas';\n\nexport const CHAYEI_SARA_COMPLETE: Parasha = ${JSON.stringify(cs, null, 2)};\n`;
    fs.writeFileSync('src/data/chayeiSaraComplete.ts', csContent, 'utf-8');
    console.log('Updated src/data/chayeiSaraComplete.ts with chapters & verses');
  }

  const toldot = bData['toldot'];
  if (toldot) {
    const toldotContent = `import { Parasha } from '../types/chitas';\n\nexport const TOLDOT_COMPLETE: Parasha = ${JSON.stringify(toldot, null, 2)};\n`;
    fs.writeFileSync('src/data/toldotComplete.ts', toldotContent, 'utf-8');
    console.log('Updated src/data/toldotComplete.ts with chapters & verses');
  }
}

async function run() {
  await fixVayigash();
  await fixTerumah();
  await fixNasso();
  await fixDevarim();
  await fixChayeiSaraAndToldotFiles();
  console.log('All 4 parashiyot and built-in files fixed successfully!');
}

run();
