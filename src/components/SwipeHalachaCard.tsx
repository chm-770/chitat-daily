import React from 'react';
import { useDoubleTap } from '../hooks/useDoubleTap';
import { motion, PanInfo } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { useLang, useStrings, dirOf } from '../i18n';

/** Interface strings of the swipe cards (the card itself stays a right-to-left Hebrew card). */
const STRINGS = {
  he: { swipeHint: 'החלק ימינה לסימון', done: 'הושלם ✓' },
  en: { swipeHint: 'Swipe to mark as read', done: 'Done ✓' },
  fr: { swipeHint: 'Glissez pour marquer comme lu', done: 'Terminé ✓' },
};

interface SwipeHalachaCardProps {
  id: string;
  chapterTitle?: string;
  halachaNumberStr: string;
  /** Label before the number: 'הלכה' (Mishneh Torah) or 'מצוה' (Sefer HaMitzvot) */
  itemLabel?: string;
  totalInChapter: number;
  text: string;
  fontSizeClass: string;
  onSwipeRight: () => void;
}

export const SwipeHalachaCard: React.FC<SwipeHalachaCardProps> = ({
  chapterTitle,
  halachaNumberStr,
  itemLabel = 'הלכה',
  totalInChapter,
  text,
  fontSizeClass,
  onSwipeRight,
}) => {
  const lang = useLang();
  const s = useStrings(STRINGS);
  const handleTap = useDoubleTap(() => onSwipeRight());

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 350) {
      onSwipeRight();
    }
  };

  return (
    <motion.div
      layout
      data-swipe-card="true"
      data-swipe="true"
      dir="rtl"
      lang="he"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 260, transition: { duration: 0.28 } }}
      className="relative overflow-hidden rounded-2xl group select-none shadow-xs"
    >
      {/* Background reveal on swipe right */}
      <div
        data-swipe-card="true"
        className="absolute inset-0 bg-emerald-600 flex items-center justify-start px-6 rounded-2xl"
      >
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span dir={dirOf(lang)} lang={lang}>{s.done}</span>
        </div>
      </div>

      {/* Draggable Foreground Card */}
      <motion.div
        data-swipe-card="true"
        data-swipe="true"
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 260 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        className="relative z-10 bg-white border border-stone-200/90 hover:border-purple-300 p-6 md:p-7 rounded-2xl cursor-grab active:cursor-grabbing transition-colors duration-150"
      >
        <div className="space-y-4">
          {/* Halacha Header */}
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              {halachaNumberStr && (
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-950 flex items-center justify-center font-bold text-xs font-torah">
                  {halachaNumberStr}
                </span>
              )}
              <span className="font-bold text-stone-900 font-torah text-sm">
                {halachaNumberStr ? `${itemLabel} ${halachaNumberStr}` : itemLabel}
                {chapterTitle ? ` · ${chapterTitle}` : ''}
              </span>
            </div>

            <span className={`flex items-center gap-1 text-[11px] text-stone-400 font-sans ${lang === 'he' ? 'shrink-0' : 'min-w-0'}`}>
              <span dir={dirOf(lang)} lang={lang}>{s.swipeHint}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </span>
          </div>

          {/* Halacha Text */}
          <p
            className={`font-torah text-stone-900 font-medium ${fontSizeClass} text-justify leading-loose`}
            dir="rtl"
          >
            {halachaNumberStr && (
              <span className="font-bold text-purple-950 text-base md:text-lg ml-2 select-none">
                ({halachaNumberStr})
              </span>
            )}
            <span className="whitespace-pre-line">{text}</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
