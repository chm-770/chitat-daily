export type StudyCategory = 'overview' | 'chumash' | 'tehillim' | 'tanya' | 'hayom_yom' | 'rambam' | 'about';

export interface ChumashVerse {
  number: number;
  chapter?: number;
  verseInChapter?: number;
  hebrew: string;
  rashi?: string[];
  explanation?: string;
}

export interface ChumashAliyah {
  aliyahNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  aliyahName: string; // ראשון, שני וכו'
  dayOfWeek: string;  // יום ראשון, יום שני וכו'
  rangeDescription: string;
  verses: ChumashVerse[];
  summary: string;
}

export interface Parasha {
  id: string;
  name: string;
  book: 'בראשית' | 'שמות' | 'ויקרא' | 'במדבר' | 'דברים';
  englishName: string;
  aliyot: ChumashAliyah[];
  isError?: boolean;
  errorMessage?: string;
}

export interface PsalmVerse {
  number: number;
  text: string;
}

export interface Psalm {
  id: number;
  title: string;
  verses: PsalmVerse[];
  theme: string;
}

export interface TehillimDayPortion {
  dayOfMonth: number;
  psalmRange: string;
  psalmNumbers: number[];
  psalms: Psalm[];
}

export interface TanyaSection {
  id: string;
  dateKey: string; // e.g. "Tishrei 20" or "Day 1"
  bookPart: 'לקוטי אמרים' | 'שער היחוד והאמונה' | 'אגרת התשובה' | 'אגרת הקודש' | 'קונטרס אחרון';
  chapter: string;
  hebrewTitle: string;
  originalText: string[];
  explanation: string;
  practicalTakeaway: string;
}

export interface HayomYomEntry {
  hebrewDate: string;
  gregorianReference: string;
  aphorism: string;
  chabadCustom: string;
  rebbesInsight: string;
}

export interface RambamPortion {
  date: string;
  seferMitzvot: {
    mitzvotNumbers: string;
    description: string;
    text: string;
  };
  threeChapters: {
    sectionName: string;
    chapters: string;
    summary: string;
    details: string[];
  };
  oneChapter: {
    sectionName: string;
    chapter: string;
    summary: string;
  };
}

export type DailyStudyKey = 'chumash' | 'tehillim' | 'tanya' | 'hayomYom' | 'rambam';

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  chumash: boolean;
  tehillim: boolean;
  tanya: boolean;
  hayomYom: boolean;
  rambam: boolean;
  readItemIds?: Record<string, boolean>; // Individual verses/paragraphs/psalms marked as read
}

export type RambamTrack = 'three_chapters' | 'one_chapter' | 'sefer_hamitzvot';

export type ZmanimMethod = 'chabad' | 'gra' | 'mga72' | 'mga16' | 'all';

export type TextFont = 'frank' | 'david' | 'noto-serif' | 'noto-sans' | 'assistant';

export type ThemeMode = 'parchment' | 'light' | 'dark' | 'black' | 'system';

export interface StudySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'serif' | 'sans';
  theme: ThemeMode;
  showRashi: boolean;
  rashiFontScript: boolean; // Traditional Rashi script vs standard Hebrew
  rambamTrack?: RambamTrack; // Defined in settings, defaults to 'three_chapters'
  zmanimMethod?: ZmanimMethod; // Defined in settings, defaults to 'chabad'
  /** The daily lessons the user learns (chosen on first launch, changeable in the settings) */
  enabledLessons?: DailyStudyKey[];
  /** The first-launch menu was completed */
  onboardingDone?: boolean;
  /** Font of the Torah texts */
  textFont?: TextFont;
}
