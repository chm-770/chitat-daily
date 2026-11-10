import fs from 'fs';

interface RawHayomYom {
  date: { month: string; day: string };
  hayomYom: {
    english: string;
    hebrew: string;
  };
}

interface AuthenticHayomYomDay {
  hebrewDate: string;
  monthName: string;
  dayNumber: number;
  monthNumber: number;
  dayTitle?: string;
  text: string[];
}

const MONTH_MAP: Record<string, { num: number; heb: string }> = {
  'Tishrei': { num: 7, heb: 'תשרי' },
  'Cheshvan': { num: 8, heb: 'חשון' },
  'Kislev': { num: 9, heb: 'כסלו' },
  'Tevet': { num: 10, heb: 'טבת' },
  "Sh'vat": { num: 11, heb: 'שבט' },
  'Adar I': { num: 12, heb: 'אדר א׳' },
  'Adar II': { num: 13, heb: 'אדר ב׳' },
  'Nissan': { num: 1, heb: 'ניסן' },
  'iyyar': { num: 2, heb: 'אייר' },
  'Sivan': { num: 3, heb: 'סיון' },
  'Tamuz': { num: 4, heb: 'תמוז' },
  'Av': { num: 5, heb: 'מנחם אב' },
  'Elul': { num: 6, heb: 'אלול' },
  'Chai': { num: 6, heb: 'אלול' }
};

const HEB_NUM_MAP: Record<number, string> = {
  1: "א׳", 2: "ב׳", 3: "ג׳", 4: "ד׳", 5: "ה׳", 6: "ו׳", 7: "ז׳", 8: "ח׳", 9: "ט׳", 10: "י׳",
  11: "י״א", 12: "י״ב", 13: "י״ג", 14: "י״ד", 15: "ט״ו", 16: "ט״ז", 17: "י״ז", 18: "י״ח", 19: "י״ט", 20: "כ׳",
  21: "כ״א", 22: "כ״ב", 23: "כ״ג", 24: "כ״ד", 25: "כ״ה", 26: "כ״ו", 27: "כ״ז", 28: "כ״ח", 29: "כ״ט", 30: "ל׳"
};

const HEB_NUM_PARSER: Record<string, number> = {
  "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5, "ו": 6, "ז": 7, "ח": 8, "ט": 9, "י": 10,
  "יא": 11, "יב": 12, "יג": 13, "יד": 14, "טו": 15, "טז": 16, "יז": 17, "יח": 18, "יט": 19, "כ": 20,
  "כא": 21, "כב": 22, "כג": 23, "כד": 24, "כה": 25, "כו": 26, "כז": 27, "כח": 28, "כט": 29, "ל": 30
};

function isYiddish(text: string): boolean {
  if (!text) return false;
  const yiddishWords = [
    'איז', 'דער', 'דאס', 'דעם', 'ניט', 'נישט', 'אויף', 'מיט', 'וואס',
    'געווען', 'האט', 'מען', 'וועגען', 'פאר', 'אזוי', 'מיר', 'זיי',
    'איהם', 'ווייל', 'קיין', 'זיין', 'געזאגט', 'האבען', 'צוליב', 'פלעגט',
    'ווען', 'וואקסט', 'בריינגט', 'צוויי', 'צוואנציג', 'ארעסטירט', 'אידען',
    'האב', 'האלט', 'טאן', 'אידין', 'יריד', 'ווארט'
  ];
  const words = text.replace(/[״״\"\'\.,\-]/g, ' ').split(/\s+/);
  let hits = 0;
  for (const w of words) {
    if (yiddishWords.includes(w)) hits++;
  }
  return hits >= 2;
}

// Parse PDF 2 into a map: `${day}_${month}` -> clean Hebrew text
function parsePDF2Translations(): Record<string, string> {
  const map: Record<string, string> = {};
  if (!fs.existsSync('/tmp/pdf2_full.txt')) return map;
  const content = fs.readFileSync('/tmp/pdf2_full.txt', 'utf-8');

  const monthTokens = [
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
    { name: 'אב', num: 5 },
    { name: 'אלול', num: 6 },
  ];

  const monthRanges: { num: number; startIdx: number }[] = [];
  monthTokens.forEach(m => {
    let searchName = m.name;
    let idx = content.indexOf(`  ${searchName}  `);
    if (idx === -1) idx = content.indexOf(` ${searchName} `);
    if (idx === -1) idx = content.indexOf(searchName);
    if (idx !== -1) {
      monthRanges.push({ num: m.num, startIdx: idx });
    }
  });

  monthRanges.sort((a, b) => a.startIdx - b.startIdx);

  for (let i = 0; i < monthRanges.length; i++) {
    const cur = monthRanges[i];
    const nextStart = i + 1 < monthRanges.length ? monthRanges[i + 1].startIdx : content.length;
    const monthText = content.substring(cur.startIdx, nextStart);

    // Matches e.g. "ליום א '", "ליום כ'ד", "ליום כ'ח", "ליום ל '"
    const dayRegex = /ליום\s+([א-ת\']+)\s*\'?\s+/g;
    const dayMatches: { dayNum: number; index: number }[] = [];
    let dm: RegExpExecArray | null;
    while ((dm = dayRegex.exec(monthText)) !== null) {
      const cleanHeb = dm[1].replace(/[\'\"]/g, '').trim();
      const dayNum = HEB_NUM_PARSER[cleanHeb];
      if (dayNum) {
        dayMatches.push({ dayNum, index: dm.index + dm[0].length });
      }
    }

    for (let j = 0; j < dayMatches.length; j++) {
      const dMatch = dayMatches[j];
      const nextDayIdx = j + 1 < dayMatches.length ? dayMatches[j + 1].index - 10 : monthText.length;
      let rawDayText = monthText.substring(dMatch.index, nextDayIdx);
      rawDayText = rawDayText.replace(/--+ \d+/g, '').replace(/--+/g, '').trim();
      if (rawDayText.length > 5) {
        const key = `${dMatch.dayNum}_${cur.num}`;
        map[key] = rawDayText;
      }
    }
  }

  return map;
}

const SPECIAL_DAYS_HEBREW: Record<string, string[]> = {
  '19_9': [
    'אין הש"ץ מתעטף בטלית למנחה או למעריב, לא בשבת ויו"ט ולא בר"ה. הילולא [יום הסתלקותו] של המגיד - ממעזריטש - ג\' וישב, תקל"ג, ומנוחתו כבוד [=קבורתו] באנאפאלי. אדמו"ר הזקן יצא לחירות ממאסרו הראשון - יט כסלו, ג\' וישב, תקנ"ט, לפנות ערב.',
    'ממכתב רבינו הזקן: ברם כגון דא צריך להודיע, כי יום אשר עשה ד\' לנו יום יט כסלו, יום ג\' שהוכפל בו כי טוב, יום הלולא רבא של רבינו הקדוש נ"ע, וכשקריתי בס\' תהילים בפסוק \'פדה בשלום נפשי\', קודם שהתחלתי פסוק שלאחריו, יצאתי בשלום מד\' שלום. * * * יום התוועדות וקבלת החלטות טובות בקביעות עתים לתורה הנגלית ודא"ח ברבים, וחיזוק דרכי החסידים באהבת רעים. נוהגים לסדר חלוקת הש"ס, וע"פ הסדר המבואר באגה"ק ד"ה "הוכח תוכיח". בליובאוויטש משנת תרס"ג ואילך היו מסדרים חלוקת הש"ס כ"ד בטבת - יום הלולא של רבינו הזקן - מפני אפס הפנאי ביט כסלו.'
  ],
  '26_9': [
    'מברכים ר"ח טבת. אמירת כל התהלים בהשכמה. יום התוועדות. טל ומטר. נר חנוכה אחר הבדלה וקודם אמירת ויתן לך. בביהכ"נ נ"ח קודם הבדלה. ביום שבת קודש שמברכים החודש, השכם בבקר יתקבצו אנ"ש לביהכ"נ להגיד כל התהלים. אחר האמירה ילמדו כשעה מאמר של חסידות שיהיה מובן לכל, ואח"כ תפלה. מועד התוועדות כפי הזמן שיגבילו, מתאים לתנאי המקום, מקום דירתם להצלחה בגשמיות ורוחניות. אחר אמירת כל התהלים בשבת מברכים יאמרו קדיש יתום. ואם יש חיוב - יארצייט או אבל - אומרים קדיש יתום אחר כל ספר.'
  ],
  '7_11': [
    'בהיות אדמו"ר הזקן בן תשע שנה למד חכמת ההנדסה והתכונה. בן עשר - סידר לו לוח על חמש עשרה שנה. בהיותו בן שנים עשר נזדמן שלמד ברבים הל\' קידוש החודש להרמב"ם, ולא מצאו הגאונים, שהיו באותו מעמד, ידיהם ורגליהם בבית המדרש.'
  ],
  '15_11': [
    'אין אומרים תחנון. כשנגשו להדפיס חלק שני של ה"תורה אור" - כבר נודע להחסידים, אשר ישנם הגהות וביאורים מה"צמח צדק" על המאמרים. ויפצירו בהצ"צ אשר ידפיסם עם המאמרים, וימאן הצ"צ. ויחלום חלום אשר זקנו אדמו"ר הזקן בא לבקרו ומבקשו להדפיסם, מ"מ העלים הדבר, עד אשר גם שלשה מבניו חלמו החלום הזה ויספרו לאביהם, ואז הסכים להדפיס גם הגהותיו וביאוריו לחלק השני, ויקראו לו בשם "לקוטי תורה".'
  ],
  '18_6': [
    'לששי עולה הבעל קורא, ומעצמו. יום הולדת את הבעל שם טוב בשנת תנ"ח. יום שנתגלה אליו מורו ורבו הקדוש - תפ"ד. יום שנתגלה הבעל שם טוב - תצ"ד. יום הולדת את רבינו הזקן - תק"ה.',
    'ראשי פרקים ממאמר הבעש"ט שבת תבוא, ח"י אלול תרנ"ב [אחר קבלת שבת]: והיה כי תבוא אל הארץ אשר ה\' אלקיך נותן לך נחלה וירשתה וישבת בה. ארץ לשון מרוצה ולשון רצון. כשבאים אל הרצון שהוא מתנה מלמעלה וירושה לכל אחד מישראל, אזי העבודה היא: וישבת בה - להוריד בהתיישבות. ולקחת ושמת בטנא - המשכת אורות בכלים. והלכת אל המקום אשר יבחר ה\' אלקיך - שיידע האדם כי בהליכתו ממקום למקום אין זה מעצמו אלא מוליכים אותו מלמעלה. והכוונה בזה: לשכן שמו שם - לפרסם אלקות במקומו, בברכה ובפסוק תהלים ומסירות נפש על פרסום אלקות.'
  ]
};

async function run() {
  const rawData: RawHayomYom[] = JSON.parse(fs.readFileSync('/tmp/hayomYomsFull.json', 'utf-8'));
  const pdf2Translations = parsePDF2Translations();
  console.log('Parsed PDF 2 translations count:', Object.keys(pdf2Translations).length);

  const database: Record<string, AuthenticHayomYomDay> = {};

  rawData.forEach(item => {
    const mInfo = MONTH_MAP[item.date.month];
    if (!mInfo) {
      console.warn('Unknown month:', item.date.month);
      return;
    }

    let dayNum = parseInt(item.date.day, 10);
    if (item.date.month === 'Chai') {
      dayNum = 18;
    }

    const key = `${dayNum}_${mInfo.num}`;
    const dayHeb = HEB_NUM_MAP[dayNum] || `${dayNum}`;
    const fullHebrewDate = `${dayHeb} ${mInfo.heb}`;

    let paragraphs: string[] = [];

    // Special days override if short in raw JSON
    if (SPECIAL_DAYS_HEBREW[key]) {
      paragraphs = SPECIAL_DAYS_HEBREW[key];
    } else {
      let rawHeb = (item.hayomYom.hebrew || '').trim();

      if (isYiddish(rawHeb)) {
        paragraphs.push(rawHeb);
        paragraphs.push('תרגום לעברית:');

        const trans = pdf2Translations[key];
        if (trans && trans.length > 10) {
          paragraphs.push(trans);
        } else {
          paragraphs.push(rawHeb);
        }
      } else {
        if (rawHeb.length > 0) {
          paragraphs.push(rawHeb);
        } else if (pdf2Translations[key]) {
          paragraphs.push(pdf2Translations[key]);
        }
      }
    }

    database[key] = {
      hebrewDate: fullHebrewDate,
      monthName: mInfo.heb,
      dayNumber: dayNum,
      monthNumber: mInfo.num,
      text: paragraphs
    };
  });

  console.log('Built Hayom Yom database entries:', Object.keys(database).length);

  ['30_9', '28_4', '29_4', '30_8'].forEach(k => {
    console.log(`Key ${k} exists:`, !!database[k], database[k]?.text?.[0]?.substring(0, 40));
  });

  let inventedCount = 0;
  Object.values(database).forEach(v => {
    if (JSON.stringify(v).includes('חודש אלול הוא חודש החשבון')) {
      inventedCount++;
    }
  });
  console.log('Invented Elul sentences count:', inventedCount);

  fs.writeFileSync('src/data/hayomYomDatabase.json', JSON.stringify(database, null, 2), 'utf-8');
  console.log('Saved src/data/hayomYomDatabase.json successfully.');
}

run();
