const { getLeyningForParsha } = require('@hebcal/leyning');
const fs = require('fs');

const ALL_BOOKS = {
  bereishit: [
    { id: 'bereishit', name: 'בְּרֵאשִׁית', leyning: 'Bereshit', book: 'בראשית' },
    { id: 'noach', name: 'נֹחַ', leyning: 'Noach', book: 'בראשית' },
    { id: 'lech_lecha', name: 'לֶךְ־לְךָ', leyning: 'Lech-Lecha', book: 'בראשית' },
    { id: 'vayera', name: 'וַיֵּרָא', leyning: 'Vayera', book: 'בראשית' },
    { id: 'chayei_sara', name: 'חַיֵּי שָׂרָה', leyning: 'Chayei Sara', book: 'בראשית' },
    { id: 'toldot', name: 'תּוֹלְדֹת', leyning: 'Toldot', book: 'בראשית' },
    { id: 'vayetzei', name: 'וַיֵּצֵא', leyning: 'Vayetzei', book: 'בראשית' },
    { id: 'vayishlach', name: 'וַיִּשְׁלַח', leyning: 'Vayishlach', book: 'בראשית' },
    { id: 'vayeshev', name: 'וַיֵּשֶׁב', leyning: 'Vayeshev', book: 'בראשית' },
    { id: 'miketz', name: 'מִקֵּץ', leyning: 'Miketz', book: 'בראשית' },
    { id: 'vayigash', name: 'וַיִּגַּשׁ', leyning: 'Vayigash', book: 'בראשית' },
    { id: 'vayechi', name: 'וַיְחִי', leyning: 'Vayechi', book: 'בראשית' }
  ],
  shemot: [
    { id: 'shemot', name: 'שְׁמוֹת', leyning: 'Shemot', book: 'שמות' },
    { id: 'vaera', name: 'וָאֵרָא', leyning: 'Vaera', book: 'שמות' },
    { id: 'bo', name: 'בֹּא', leyning: 'Bo', book: 'שמות' },
    { id: 'beshalach', name: 'בְּשַׁלַּח', leyning: 'Beshalach', book: 'שמות' },
    { id: 'yitro', name: 'יִתְרוֹ', leyning: 'Yitro', book: 'שמות' },
    { id: 'mishpatim', name: 'מִשְׁפָּטִים', leyning: 'Mishpatim', book: 'שמות' },
    { id: 'terumah', name: 'תְּרוּמָה', leyning: 'Terumah', book: 'שמות' },
    { id: 'tetzaveh', name: 'תְּצַוֶּה', leyning: 'Tetzaveh', book: 'שמות' },
    { id: 'ki_tisa', name: 'כִּי תִשָּׂא', leyning: 'Ki Tisa', book: 'שמות' },
    { id: 'vayakhel', name: 'וַיַּקְהֵל', leyning: 'Vayakhel', book: 'שמות' },
    { id: 'pekudei', name: 'פְקוּדֵי', leyning: 'Pekudei', book: 'שמות' }
  ],
  vayikra: [
    { id: 'vayikra', name: 'וַיִּקְרָא', leyning: 'Vayikra', book: 'ויקרא' },
    { id: 'tzav', name: 'צַו', leyning: 'Tzav', book: 'ויקרא' },
    { id: 'shmini', name: 'שְׁמִינִי', leyning: 'Shmini', book: 'ויקרא' },
    { id: 'tazria', name: 'תַּזְרִיעַ', leyning: 'Tazria', book: 'ויקרא' },
    { id: 'metzora', name: 'מְצֹרָע', leyning: 'Metzora', book: 'ויקרא' },
    { id: 'acharei_mot', name: 'אַחֲרֵי מוֹת', leyning: 'Achrei Mot', book: 'ויקרא' },
    { id: 'kedoshim', name: 'קְדֹשִׁים', leyning: 'Kedoshim', book: 'ויקרא' },
    { id: 'emor', name: 'אֱמֹר', leyning: 'Emor', book: 'ויקרא' },
    { id: 'behar', name: 'בְּהַר', leyning: 'Behar', book: 'ויקרא' },
    { id: 'bechukotai', name: 'בְּחֻקֹּתַי', leyning: 'Bechukotai', book: 'ויקרא' }
  ],
  bamidbar: [
    { id: 'bamidbar', name: 'בְּמִדְבַּר', leyning: 'Bamidbar', book: 'במדבר' },
    { id: 'nasso', name: 'נָשׂא', leyning: 'Nasso', book: 'במדבר' },
    { id: 'behaalotcha', name: 'בְּהַעֲלֹתְךָ', leyning: "Beha'alotcha", book: 'במדבר' },
    { id: 'shelach', name: 'שְׁלַח־לְךָ', leyning: "Sh'lach", book: 'במדבר' },
    { id: 'korach', name: 'קֹרַח', leyning: 'Korach', book: 'במדבר' },
    { id: 'chukat', name: 'חֻקַּת', leyning: 'Chukat', book: 'במדבר' },
    { id: 'balak', name: 'בָּלָק', leyning: 'Balak', book: 'במדבר' },
    { id: 'pinchas', name: 'פִּינְחָס', leyning: 'Pinchas', book: 'במדבר' },
    { id: 'matot', name: 'מַטּוֹת', leyning: 'Matot', book: 'במדבר' },
    { id: 'masei', name: 'מַסְעֵי', leyning: 'Masei', book: 'במדבר' }
  ],
  devarim: [
    { id: 'devarim', name: 'דְּבָרִים', leyning: 'Devarim', book: 'דברים' },
    { id: 'vaetchanan', name: 'וָאֶתְחַנַּן', leyning: 'Vaetchanan', book: 'דברים' },
    { id: 'ekev', name: 'עֵקֶב', leyning: 'Eikev', book: 'דברים' },
    { id: 'reeh', name: 'רְאֵה', leyning: "Re'eh", book: 'דברים' },
    { id: 'shoftim', name: 'שֹׁפְטִים', leyning: 'Shoftim', book: 'דברים' },
    { id: 'ki_teitzei', name: 'כִּי־תֵצֵא', leyning: 'Ki Teitzei', book: 'דברים' },
    { id: 'ki_tavo', name: 'כִּי־תָבוֹא', leyning: 'Ki Tavo', book: 'דברים' },
    { id: 'nitzavim', name: 'נִצָּבִים', leyning: 'Nitzavim', book: 'דברים' },
    { id: 'vayelech', name: 'וַיֵּלֶךְ', leyning: 'Vayeilech', book: 'דברים' },
    { id: 'haazinu', name: 'הַאֲזִינוּ', leyning: "Ha'azinu", book: 'דברים' },
    { id: 'vezot_haberachah', name: 'וְזֹאת הַבְּרָכָה', leyning: 'Vezot Haberakhah', book: 'דברים' }
  ]
};

function cleanTorahText(raw) {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/&thinsp;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\{[פ|ס]\}/g, '')
    .replace(/[a-zA-Z]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanRashiText(s) {
  if (!s) return '';
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&thinsp;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeComments(c) {
  if (!c) return [];
  if (Array.isArray(c)) {
    return c.map(cleanRashiText).filter(Boolean);
  }
  if (typeof c === 'string' && c.trim()) {
    return [cleanRashiText(c)];
  }
  return [];
}

async function buildParasha(meta) {
  const leyning = getLeyningForParsha(meta.leyning);
  const aliyotKeys = ['1', '2', '3', '4', '5', '6', '7'];
  const aliyotNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שביעי'];
  const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום ששי', 'שבת קודש'];

  const aliyot = [];

  for (let i = 0; i < 7; i++) {
    const k = aliyotKeys[i];
    const al = leyning.fullkriyah[k];
    if (!al) continue;

    const ref = `${al.k}.${al.b}-${al.e}`;
    const rashiRef = `Rashi_on_${al.k}.${al.b}-${al.e}`;

    const [tRes, rRes] = await Promise.all([
      fetch(`https://www.sefaria.org/api/texts/${ref}?context=0`).then(r => r.json()).catch(() => ({})),
      fetch(`https://www.sefaria.org/api/texts/${rashiRef}?context=0`).then(r => r.json()).catch(() => ({}))
    ]);

    // Check if spanning multiple chapters
    const isSpanning = Boolean(
      tRes.isSpanning ||
      (Array.isArray(tRes.he) && Array.isArray(tRes.he[0]) && Array.isArray(tRes.he[1]))
    );

    // Extract Torah verses
    const tVerses = [];
    if (Array.isArray(tRes.he)) {
      if (isSpanning || (Array.isArray(tRes.he[0]) && typeof tRes.he[0][0] === 'string')) {
        for (const ch of tRes.he) {
          if (Array.isArray(ch)) {
            for (const v of ch) {
              if (typeof v === 'string') tVerses.push(cleanTorahText(v));
            }
          } else if (typeof ch === 'string') {
            tVerses.push(cleanTorahText(ch));
          }
        }
      } else {
        for (const v of tRes.he) {
          if (typeof v === 'string') tVerses.push(cleanTorahText(v));
        }
      }
    }

    // Extract Rashi verses array (1-to-1 match with tVerses)
    const rVerses = [];
    if (Array.isArray(rRes.he)) {
      if (isSpanning) {
        // Chapters array -> each chapter is verses array -> each verse is comments array
        for (const ch of rRes.he) {
          if (Array.isArray(ch)) {
            for (const vComments of ch) {
              rVerses.push(normalizeComments(vComments));
            }
          }
        }
      } else {
        // Single chapter: data.he is verses array -> each verse is comments array
        for (const vComments of rRes.he) {
          rVerses.push(normalizeComments(vComments));
        }
      }
    }

    const verses = [];
    for (let vIdx = 0; vIdx < tVerses.length; vIdx++) {
      const rashiArr = rVerses[vIdx] || [];
      verses.push({
        number: vIdx + 1,
        hebrew: tVerses[vIdx],
        rashi: rashiArr
      });
    }

    aliyot.push({
      aliyahNumber: i + 1,
      aliyahName: aliyotNames[i],
      dayOfWeek: days[i],
      rangeDescription: `${al.b} – ${al.e}`,
      summary: `עליית ${aliyotNames[i]} בפרשת ${meta.name} (${al.b} – ${al.e})`,
      verses
    });
  }

  return {
    id: meta.id,
    name: meta.name,
    englishName: meta.leyning,
    book: meta.book,
    aliyot
  };
}

async function generateBook(bookKey) {
  const parashiyot = ALL_BOOKS[bookKey];
  const outPath = `./src/data/parashiyot/${bookKey}.json`;
  console.log(`Starting ${bookKey} (${parashiyot.length} parashiyot)...`);

  const bookData = {};
  for (const p of parashiyot) {
    console.log(`  Fetching ${p.id} (${p.name})...`);
    bookData[p.id] = await buildParasha(p);
  }

  fs.writeFileSync(outPath, JSON.stringify(bookData), 'utf8');
  console.log(`Finished ${bookKey} -> ${outPath}`);
}

const targetBook = process.argv[2] || 'all';

async function main() {
  if (targetBook === 'all') {
    for (const b of Object.keys(ALL_BOOKS)) {
      await generateBook(b);
    }
  } else if (ALL_BOOKS[targetBook]) {
    await generateBook(targetBook);
  } else {
    console.error('Unknown book:', targetBook);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
