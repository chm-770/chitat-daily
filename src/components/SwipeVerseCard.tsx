import React, { useState } from 'react';
import { useDoubleTap } from '../hooks/useDoubleTap';
import { vocalizeRashiHeading } from '../utils/hebrewText';
import { motion, PanInfo } from 'motion/react';
import { ArrowLeftRight } from 'lucide-react';
import { ChumashVerse, StudySettings } from '../types/chitas';
import { toHebrewNumeral } from '../utils/hebrewNumerals';
import { useLang, useStrings, dirOf } from '../i18n';

/** Interface strings of the swipe cards (the card itself stays a right-to-left Hebrew card). */
const STRINGS = {
  he: { swipeHint: 'החלק לסימון', done: 'הושלם ✓', rashi: 'פירוש רש״י:', targum: 'תרגום אונקלוס:' },
  en: { swipeHint: 'Swipe to mark as read', done: 'Done ✓', rashi: 'Rashi:', targum: 'Targum Onkelos:' },
  fr: { swipeHint: 'Glissez pour marquer comme lu', done: 'Terminé ✓', rashi: 'Commentaire de Rachi :', targum: 'Targoum Onkelos :' },
};

interface SwipeVerseCardProps {
  verse: ChumashVerse;
  verseIndex: number;
  onSwipeRight: (verseIndex: number) => void;
  showRashi: boolean;
  settings: StudySettings;
  getFontSizeClass: () => string;
  /** Shnayim Mikra: the verse is printed twice, then Targum Onkelos */
  twice?: boolean;
  targum?: string;
}

function parseRashiComment(rawText: string): { dibbur: string; body: string } {
  if (!rawText) return { dibbur: '', body: '' };

  // If text already starts with <b>...</b> (Dibbur HaMaschil)
  const bMatch = rawText.match(/^\s*<b>(.*?)<\/b>\s*(.*)/s);
  if (bMatch) {
    return { dibbur: bMatch[1].trim(), body: bMatch[2].trim() };
  }

  // If starts with dibbur hamaschil ending with period, colon, or dash within first 55 chars
  const pMatch = rawText.match(/^([^.:–—\-]{1,55}[.:–—\-])\s*(.*)$/s);
  if (pMatch) {
    return { dibbur: pMatch[1].trim(), body: pMatch[2].trim() };
  }

  return { dibbur: '', body: rawText };
}

function renderRashiBody(bodyText: string): React.ReactNode {
  if (!bodyText) return null;
  // Clean any non-b HTML tags (e.g. <small>, <span>, etc.)
  const cleaned = bodyText
    .replace(/<(?!\/?b\b)[^>]+>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&thinsp;/gi, ' ')
    .replace(/&rlm;/gi, '')
    .replace(/&lrm;/gi, '');

  // Split on <b>...</b> tags to render inner verse citations in bold Hebrew
  const segments = cleaned.split(/(<b>.*?<\/b>)/gs);
  return segments.map((seg, idx) => {
    const boldMatch = seg.match(/^<b>(.*?)<\/b>$/s);
    if (boldMatch) {
      return (
        <strong
          key={idx}
          className="font-bold text-stone-950 font-torah text-[15px] mx-0.5 inline-block"
        >
          {boldMatch[1]}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{seg}</React.Fragment>;
  });
}

export const SwipeVerseCard: React.FC<SwipeVerseCardProps> = ({
  verse,
  verseIndex,
  onSwipeRight,
  showRashi,
  settings,
  getFontSizeClass,
  twice = false,
  targum,
}) => {
  const lang = useLang();
  const s = useStrings(STRINGS);
  const handleTap = useDoubleTap(() => onSwipeRight(verseIndex));

  // Direction of the swipe (the card leaves that way)
  const [exitDir, setExitDir] = useState<1 | -1>(1);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // If dragged to the right by more than 50px or flicked quickly
    if (Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 200) {
      setExitDir(info.offset.x < 0 || (info.offset.x === 0 && info.velocity.x < 0) ? -1 : 1);
      onSwipeRight(verseIndex);
    }
  };

  const verseRefLabel = verse.chapter && verse.verseInChapter
    ? `פרק ${toHebrewNumeral(verse.chapter)}, פסוק ${toHebrewNumeral(verse.verseInChapter)}`
    : `פסוק ${toHebrewNumeral(verse.number)}`;

  return (
    <motion.div
      layout
      data-swipe-verse="true"
      dir="rtl"
      lang="he"
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
        onTap={handleTap}
      exit={{ x: 400 * exitDir, opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
      className="relative select-none cursor-grab active:cursor-grabbing bg-white rounded-xl border border-stone-200/90 hover:border-amber-300 p-5 shadow-xs transition-shadow duration-200"
    >
      <div className="space-y-3">
        {/* Clean verse badge */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded font-torah ${lang === 'he' ? '' : 'shrink-0'}`}>
            {verseRefLabel}
          </span>
<span className={`flex items-center gap-1 text-[11px] text-stone-400 font-sans ${lang === 'he' ? 'shrink-0' : 'min-w-0'}`}>
            <span dir={dirOf(lang)} lang={lang}>{s.swipeHint}</span>
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
          </span>
        </div>

        {/* Holy Torah verse */}
        <p
          className={`font-torah text-stone-900 font-medium ${getFontSizeClass()}`}
          dir="rtl"
        >
          {verse.hebrew}
        </p>
        {twice && (
          <p className={`font-torah text-stone-900 font-medium ${getFontSizeClass()}`} dir="rtl">
            {verse.hebrew}
          </p>
        )}

        {/* Targum Onkelos (Shnayim Mikra) */}
        {targum && (
          <div className="pt-2.5 border-t border-amber-900/10 space-y-1">
            <span className="text-xs font-bold text-stone-500 font-sans" dir={dirOf(lang)} lang={lang}>
              {s.targum}
            </span>
            <p className="font-torah text-stone-800 text-base md:text-lg leading-relaxed" dir="rtl" lang="arc">
              {targum}
            </p>
          </div>
        )}

        {/* Rashi commentary with bolded Dibbur HaMaschil */}
        {showRashi && verse.rashi && verse.rashi.length > 0 && (
          <div className="pt-2.5 border-t border-amber-900/10 space-y-1.5">
            <span className="text-xs font-bold text-stone-500 font-sans" dir={dirOf(lang)} lang={lang}>
              {s.rashi}
            </span>
            <div className="space-y-2 pr-3 border-r-2 border-amber-400">
              {verse.rashi.map((r, i) => {
                const parsed = parseRashiComment(r);
                return (
                  <p
                    key={i}
                    className={`text-stone-800 text-sm md:text-base leading-relaxed ${
                      settings.rashiFontScript ? 'font-rashi' : 'font-torah'
                    }`}
                  >
                    {parsed.dibbur ? (
                      <>
                        <strong className="font-bold text-stone-950 font-torah text-base ml-1 inline-block">
                          {vocalizeRashiHeading(parsed.dibbur, verse.hebrew)}
                        </strong>{' '}
                        <span>{renderRashiBody(parsed.body)}</span>
                      </>
                    ) : (
                      <span>{renderRashiBody(parsed.body)}</span>
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
