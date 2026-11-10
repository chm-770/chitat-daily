import fs from 'fs';

// 1 & 2: Vayigash Aliyot 1 and 2
const bereishitPath = 'src/data/parashiyot/bereishit.json';
const bereishit = JSON.parse(fs.readFileSync(bereishitPath, 'utf8'));

const vayigash = bereishit.vayigash;
const vAl1 = vayigash.aliyot[0];
const vAl2 = vayigash.aliyot[1];

// If not yet 13 verses, repartition
if (vAl1.verses.length !== 13) {
  // Aliyah 1 is 44:18-44:24 (7 verses) + 44:25-44:30 (6 verses)
  const movedToAl1 = vAl2.verses.slice(0, 6);
  const remainingAl2 = vAl2.verses.slice(6);

  vAl1.verses = [...vAl1.verses, ...movedToAl1];
  vAl1.rangeDescription = '44:18 – 44:30';
  vAl1.summary = 'עליית ראשון בפרשת וַיִּגַּשׁ (44:18 – 44:30)';
  vAl1.verses.forEach((v: any, idx: number) => {
    v.number = idx + 1;
  });

  vAl2.verses = remainingAl2;
  vAl2.rangeDescription = '44:31 – 45:7';
  vAl2.summary = 'עליית שני בפרשת וַיִּגַּשׁ (44:31 – 45:7)';
  vAl2.verses.forEach((v: any, idx: number) => {
    v.number = idx + 1;
  });
}

console.log('Vayigash:');
console.log('  Aliyah 1 verses count:', vAl1.verses.length, 'range:', vAl1.rangeDescription);
console.log('  Aliyah 2 verses count:', vAl2.verses.length, 'range:', vAl2.rangeDescription);

// 3. Toldot Aliyah 1 in bereishit.json and toldotComplete.ts
// Range 25:19-26:5: Verses 1..16 are ch 25 (vs 19..34), Verses 17..21 are ch 26 (vs 1..5)
const toldotAl1 = bereishit.toldot.aliyot[0];
toldotAl1.verses.forEach((v: any, idx: number) => {
  if (idx < 16) {
    v.chapter = 25;
    v.verseInChapter = 19 + idx;
  } else {
    v.chapter = 26;
    v.verseInChapter = 1 + (idx - 16);
  }
});

// Update toldotComplete.ts
const toldotCompletePath = 'src/data/toldotComplete.ts';
let toldotCompleteContent = fs.readFileSync(toldotCompletePath, 'utf8');
const eqIdx = toldotCompleteContent.indexOf('=');
const jsonStart = toldotCompleteContent.indexOf('{', eqIdx);
const jsonEnd = toldotCompleteContent.lastIndexOf('}');
if (jsonStart !== -1 && jsonEnd !== -1) {
  const tObj = JSON.parse(toldotCompleteContent.slice(jsonStart, jsonEnd + 1));
  tObj.aliyot[0].verses.forEach((v: any, idx: number) => {
    if (idx < 16) {
      v.chapter = 25;
      v.verseInChapter = 19 + idx;
    } else {
      v.chapter = 26;
      v.verseInChapter = 1 + (idx - 16);
    }
  });
  const newToldotComplete = `import { Parasha } from '../types/chitas';\n\nexport const TOLDOT_COMPLETE: Parasha = ${JSON.stringify(tObj, null, 2)};\n`;
  fs.writeFileSync(toldotCompletePath, newToldotComplete, 'utf8');
  console.log('Updated toldotComplete.ts');
}

// 3. Vayetzei Aliyah 7 in bereishit.json: 31:43 – 32:3
// In Hebrew: Genesis 31 has 54 verses (31:43..54 = 12 verses), Chapter 32 has 3 verses (32:1..3 = 3 verses). Total 15 verses.
const vayetzeiAl7 = bereishit.vayetzei.aliyot[6];
vayetzeiAl7.verses.forEach((v: any, idx: number) => {
  if (idx < 12) {
    v.chapter = 31;
    v.verseInChapter = 43 + idx;
  } else {
    v.chapter = 32;
    v.verseInChapter = 1 + (idx - 12);
  }
});

fs.writeFileSync(bereishitPath, JSON.stringify(bereishit, null, 2), 'utf8');
console.log('Updated bereishit.json');

// 3. Pinchas Aliyah 7 in bamidbar.json: 29:12 – 30:1
// In Hebrew: Numbers 29 has 39 verses (29:12..39 = 28 verses), Chapter 30 has 1 verse (30:1 = 1 verse). Total 29 verses.
const bamidbarPath = 'src/data/parashiyot/bamidbar.json';
const bamidbar = JSON.parse(fs.readFileSync(bamidbarPath, 'utf8'));
const pinchasAl7 = bamidbar.pinchas.aliyot[6];
pinchasAl7.verses.forEach((v: any, idx: number) => {
  if (idx < 28) {
    v.chapter = 29;
    v.verseInChapter = 12 + idx;
  } else {
    v.chapter = 30;
    v.verseInChapter = 1 + (idx - 28);
  }
});
fs.writeFileSync(bamidbarPath, JSON.stringify(bamidbar, null, 2), 'utf8');
console.log('Updated bamidbar.json (Pinchas Aliyah 7)');

// 3. Re'eh Aliyah 3 in devarim.json: 12:29 – 13:19
// In Hebrew: Deut 12 has 31 verses (12:29..31 = 3 verses), Chapter 13 has 19 verses (13:1..19 = 19 verses). Total 22 verses.
const devarimPath = 'src/data/parashiyot/devarim.json';
const devarim = JSON.parse(fs.readFileSync(devarimPath, 'utf8'));

const reehAl3 = devarim.reeh.aliyot[2];
reehAl3.verses.forEach((v: any, idx: number) => {
  if (idx < 3) {
    v.chapter = 12;
    v.verseInChapter = 29 + idx;
  } else {
    v.chapter = 13;
    v.verseInChapter = 1 + (idx - 3);
  }
});

// 3. Ki Teitzei Aliyah 3 in devarim.json: 22:8 – 23:7
// In Hebrew: Deut 22 has 29 verses (22:8..29 = 22 verses), Chapter 23 has 7 verses (23:1..7 = 7 verses). Total 29 verses.
const kiTeitzeiAl3 = devarim.ki_teitzei.aliyot[2];
kiTeitzeiAl3.verses.forEach((v: any, idx: number) => {
  if (idx < 22) {
    v.chapter = 22;
    v.verseInChapter = 8 + idx;
  } else {
    v.chapter = 23;
    v.verseInChapter = 1 + (idx - 22);
  }
});

fs.writeFileSync(devarimPath, JSON.stringify(devarim, null, 2), 'utf8');
console.log('Updated devarim.json (Reeh & Ki Teitzei)');
