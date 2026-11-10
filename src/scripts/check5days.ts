import fs from 'fs';

// Check which parasha and verses for:
// 1) 28 Cheshvan (Toldot)
// 2) 11 Kislev (Vayetzei)
// 3) 19 Tammuz (Pinchas)
// 4) 21 Av (Re'eh)
// 5) 5 Elul (Ki Teitzei)

const b = JSON.parse(fs.readFileSync('src/data/parashiyot/bereishit.json', 'utf8'));
const bam = JSON.parse(fs.readFileSync('src/data/parashiyot/bamidbar.json', 'utf8'));
const d = JSON.parse(fs.readFileSync('src/data/parashiyot/devarim.json', 'utf8'));

console.log('--- 1) Toldot ---');
b.toldot.aliyot.forEach((al: any, i: number) => {
  console.log(`Aliyah ${i + 1} (${al.rangeDescription}): ${al.verses.length} verses`);
  console.log('  first 3:', al.verses.slice(0, 3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
  console.log('  last 3:', al.verses.slice(-3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
});

console.log('--- 2) Vayetzei ---');
b.vayetzei.aliyot.forEach((al: any, i: number) => {
  console.log(`Aliyah ${i + 1} (${al.rangeDescription}): ${al.verses.length} verses`);
  console.log('  first 3:', al.verses.slice(0, 3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
  console.log('  last 3:', al.verses.slice(-3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
});

console.log('--- 3) Pinchas ---');
bam.pinchas.aliyot.forEach((al: any, i: number) => {
  console.log(`Aliyah ${i + 1} (${al.rangeDescription}): ${al.verses.length} verses`);
  console.log('  first 3:', al.verses.slice(0, 3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
  console.log('  last 3:', al.verses.slice(-3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
});

console.log('--- 4) Reeh ---');
d.reeh.aliyot.forEach((al: any, i: number) => {
  console.log(`Aliyah ${i + 1} (${al.rangeDescription}): ${al.verses.length} verses`);
  console.log('  first 3:', al.verses.slice(0, 3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
  console.log('  last 3:', al.verses.slice(-3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
});

console.log('--- 5) Ki Teitzei ---');
d.ki_teitzei.aliyot.forEach((al: any, i: number) => {
  console.log(`Aliyah ${i + 1} (${al.rangeDescription}): ${al.verses.length} verses`);
  console.log('  first 3:', al.verses.slice(0, 3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
  console.log('  last 3:', al.verses.slice(-3).map((v: any) => `${v.chapter}:${v.verseInChapter}`));
});
