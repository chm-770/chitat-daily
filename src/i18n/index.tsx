/**
 * Interface language (Hebrew, English, French). Only the interface is translated: the Torah
 * texts (Chumash, Rashi, Tehillim, Tanya, Hayom Yom, Rambam) and Hebrew names stay in Hebrew.
 *
 * Each component keeps its own strings next to it:
 *   const STRINGS = { he: { title: 'הגדרות' }, en: { title: 'Settings' }, fr: { title: 'Paramètres' } };
 *   const s = useStrings(STRINGS);   // inside the component
 *   ... {s.title}
 * Code outside React (services) uses `pick(STRINGS)` which reads the current language.
 */
import React, { createContext, useContext } from 'react';

export type Lang = 'he' | 'en' | 'fr';

export const LANGUAGES: { id: Lang; label: string }[] = [
  { id: 'he', label: 'עברית' },
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
];

export type Strings<T> = { he: T; en: T; fr: T };

/** Language of the device on first launch (French / English, otherwise Hebrew). */
export function detectLang(): Lang {
  try {
    for (const l of navigator.languages || [navigator.language]) {
      const code = (l || '').slice(0, 2).toLowerCase();
      if (code === 'he' || code === 'iw') return 'he';
      if (code === 'fr') return 'fr';
      if (code === 'en') return 'en';
    }
  } catch {
    // ignore
  }
  return 'he';
}

let current: Lang = 'he';

export function setCurrentLang(lang: Lang) {
  current = lang;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = dirOf(lang);
  }
}

export function getLang(): Lang {
  return current;
}

export function dirOf(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'he' ? 'rtl' : 'ltr';
}

/** Locale for dates and numbers. */
export function localeOf(lang: Lang = current): string {
  return lang === 'he' ? 'he-IL' : lang === 'fr' ? 'fr-FR' : 'en-US';
}

/** Strings of the current language, for code outside React. */
export function pick<T>(strings: Strings<T>, lang: Lang = current): T {
  return strings[lang] || strings.he;
}

const LangContext = createContext<Lang>('he');

export const LangProvider: React.FC<{ lang: Lang; children: React.ReactNode }> = ({ lang, children }) => (
  <LangContext.Provider value={lang}>{children}</LangContext.Provider>
);

export function useLang(): Lang {
  return useContext(LangContext);
}

/** Strings of the current language, inside a component. */
export function useStrings<T>(strings: Strings<T>): T {
  return pick(strings, useLang());
}
