import fs from 'fs';

// Helper to slice verses from a parasha by chapter:verse range
function getVersesInRange(allVerses: any[], startCh: number, startVs: number, endCh: number, endVs: number) {
  return allVerses.filter(v => {
    if (v.chapter < startCh || v.chapter > endCh) return false;
    if (v.chapter === startCh && v.verseInChapter < startVs) return false;
    if (v.chapter === endCh && v.verseInChapter > endVs) return false;
    return true;
  });
}

function combineParashiyot(
  bookPath: string,
  connectedId: string,
  connectedName: string,
  bookName: any,
  part1Id: string,
  part2Id: string,
  ranges: Array<{ b: string; e: string }>
) {
  const data = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
  const p1 = data[part1Id];
  const p2 = data[part2Id];
  if (!p1 || !p2) {
    console.error(`Missing ${part1Id} or ${part2Id} in ${bookPath}`);
    return;
  }

  const allVerses = [
    ...p1.aliyot.flatMap((a: any) => a.verses),
    ...p2.aliyot.flatMap((a: any) => a.verses)
  ];

  const aliyotNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'ששי', 'שביעי'];
  const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום ששי', 'שבת קודש'];

  const aliyot = ranges.map((r, i) => {
    const [bCh, bVs] = r.b.split(':').map(Number);
    const [eCh, eVs] = r.e.split(':').map(Number);
    const verses = getVersesInRange(allVerses, bCh, bVs, eCh, eVs).map((v, idx) => ({
      ...v,
      number: idx + 1
    }));

    return {
      aliyahNumber: (i + 1) as any,
      aliyahName: aliyotNames[i],
      dayOfWeek: days[i],
      rangeDescription: `${r.b} – ${r.e}`,
      summary: `עליית ${aliyotNames[i]} בפרשת ${connectedName} (${r.b} – ${r.e})`,
      verses
    };
  });

  data[connectedId] = {
    id: connectedId,
    name: connectedName,
    book: bookName,
    englishName: connectedId,
    aliyot
  };

  fs.writeFileSync(bookPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Added ${connectedId} to ${bookPath}: 7 aliyot, total verses: ${aliyot.reduce((acc, a) => acc + a.verses.length, 0)}`);
}

// 1. Vayakhel-Pekudei (shemot)
combineParashiyot(
  'src/data/parashiyot/shemot.json',
  'vayakhel_pekudei',
  'וַיַּקְהֵל־פְקוּדֵי',
  'שמות',
  'vayakhel',
  'pekudei',
  [
    { b: '35:1', e: '35:29' },
    { b: '35:30', e: '37:16' },
    { b: '37:17', e: '37:29' },
    { b: '38:1', e: '38:20' },
    { b: '38:21', e: '39:1' },
    { b: '39:2', e: '39:21' },
    { b: '39:22', e: '40:38' }
  ]
);

// 2. Tazria-Metzora (vayikra)
combineParashiyot(
  'src/data/parashiyot/vayikra.json',
  'tazria_metzora',
  'תַּזְרִיעַ־מְצֹרָע',
  'ויקרא',
  'tazria',
  'metzora',
  [
    { b: '12:1', e: '13:39' },
    { b: '13:40', e: '13:54' },
    { b: '13:55', e: '14:12' },
    { b: '14:13', e: '14:20' },
    { b: '14:21', e: '14:32' },
    { b: '14:33', e: '15:15' },
    { b: '15:16', e: '15:33' }
  ]
);

// 3. Acharei Mot-Kedoshim (vayikra)
combineParashiyot(
  'src/data/parashiyot/vayikra.json',
  'acharei_mot_kedoshim',
  'אַחֲרֵי מוֹת־קְדֹשִׁים',
  'ויקרא',
  'acharei_mot',
  'kedoshim',
  [
    { b: '16:1', e: '17:7' },
    { b: '17:8', e: '18:5' },
    { b: '18:6', e: '18:21' },
    { b: '18:22', e: '19:14' },
    { b: '19:15', e: '19:32' },
    { b: '19:33', e: '20:7' },
    { b: '20:8', e: '20:27' }
  ]
);

// 4. Behar-Bechukotai (vayikra)
combineParashiyot(
  'src/data/parashiyot/vayikra.json',
  'behar_bechukotai',
  'בְּהַר־בְּחֻקֹּתַי',
  'ויקרא',
  'behar',
  'bechukotai',
  [
    { b: '25:1', e: '25:18' },
    { b: '25:19', e: '25:28' },
    { b: '25:29', e: '25:38' },
    { b: '25:39', e: '26:9' },
    { b: '26:10', e: '26:46' },
    { b: '27:1', e: '27:15' },
    { b: '27:16', e: '27:34' }
  ]
);

// 5. Chukat-Balak (bamidbar)
combineParashiyot(
  'src/data/parashiyot/bamidbar.json',
  'chukat_balak',
  'חֻקַּת־בָּלָק',
  'במדבר',
  'chukat',
  'balak',
  [
    { b: '19:1', e: '20:6' },
    { b: '20:7', e: '21:9' },
    { b: '21:10', e: '21:20' },
    { b: '21:21', e: '22:12' },
    { b: '22:13', e: '22:38' },
    { b: '22:39', e: '23:26' },
    { b: '23:27', e: '25:9' }
  ]
);

// 6. Matot-Masei (bamidbar)
combineParashiyot(
  'src/data/parashiyot/bamidbar.json',
  'matot_masei',
  'מַטּוֹת־מַסְעֵי',
  'במדבר',
  'matot',
  'masei',
  [
    { b: '30:2', e: '31:12' },
    { b: '31:13', e: '31:54' },
    { b: '32:1', e: '32:19' },
    { b: '32:20', e: '33:49' },
    { b: '33:50', e: '34:15' },
    { b: '34:16', e: '35:8' },
    { b: '35:9', e: '36:13' }
  ]
);

// 7. Nitzavim-Vayelech (devarim)
combineParashiyot(
  'src/data/parashiyot/devarim.json',
  'nitzavim_vayelech',
  'נִצָּבִים־וַיֵּלֶךְ',
  'דברים',
  'nitzavim',
  'vayelech',
  [
    { b: '29:9', e: '29:28' },
    { b: '30:1', e: '30:6' },
    { b: '30:7', e: '30:14' },
    { b: '30:15', e: '31:3' },
    { b: '31:4', e: '31:9' },
    { b: '31:10', e: '31:19' },
    { b: '31:20', e: '31:30' }
  ]
);
