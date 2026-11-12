import React, { useState } from 'react';
import { useDoubleTap } from '../hooks/useDoubleTap';
import { motion, PanInfo } from 'motion/react';
import { Check, ArrowLeftRight } from 'lucide-react';
import { useLang, useStrings, dirOf } from '../i18n';

/** Interface strings of the swipe cards (the card itself stays a right-to-left Hebrew card). */
const STRINGS = {
  he: { swipeHint: 'החלק לסימון', done: 'הושלם ✓', paragraphOf: (n: number, total: number) => `קטע ${n} מתוך ${total}` },
  en: { swipeHint: 'Swipe to mark as read', done: 'Done ✓', paragraphOf: (n: number, total: number) => `Section ${n} of ${total}` },
  fr: { swipeHint: 'Glissez pour marquer comme lu', done: 'Terminé ✓', paragraphOf: (n: number, total: number) => `Passage ${n} sur ${total}` },
};

interface SwipeTanyaCardProps {
  id: string;
  paragraphIndex: number;
  totalParagraphs: number;
  text: string;
  fontSizeClass: string;
  onSwipeRight: () => void;
}

export const SwipeTanyaCard: React.FC<SwipeTanyaCardProps> = ({
  paragraphIndex,
  totalParagraphs,
  text,
  fontSizeClass,
  onSwipeRight,
}) => {
  const lang = useLang();
  const s = useStrings(STRINGS);
  const handleTap = useDoubleTap(() => onSwipeRight());

  // Direction of the swipe (the card leaves that way)
  const [exitDir, setExitDir] = useState<1 | -1>(1);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // When dragged sufficiently to the right, mark and disappear
    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 350) {
      setExitDir(info.offset.x < 0 || (info.offset.x === 0 && info.velocity.x < 0) ? -1 : 1);
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
      exit={{ opacity: 0, x: 260 * exitDir, transition: { duration: 0.28 } }}
      className="relative overflow-hidden rounded-2xl group select-none shadow-xs"
    >
      {/* Background revealed when the card is swiped (either side) */}
      <div
        data-swipe-card="true"
        className="absolute inset-0 bg-emerald-600 flex items-center justify-between px-6 rounded-2xl"
      >
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span dir={dirOf(lang)} lang={lang}>{s.done}</span>
        </div>

        <div className="flex items-center gap-2 text-white font-bold text-base" aria-hidden="true">
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
        dragConstraints={{ left: -260, right: 260 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        className="relative z-10 bg-white border border-stone-200/90 hover:border-emerald-300 p-6 md:p-8 rounded-2xl cursor-grab active:cursor-grabbing transition-colors duration-150"
      >
        <div className="space-y-4">
          {/* Header of paragraph */}
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <span className={`font-bold text-emerald-950 font-torah text-sm bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 ${lang === 'he' ? '' : 'shrink-0'}`}>
              <span dir={dirOf(lang)} lang={lang}>{s.paragraphOf(paragraphIndex + 1, totalParagraphs)}</span>
            </span>

            <span className={`flex items-center gap-1 text-[11px] text-stone-400 font-sans ${lang === 'he' ? 'shrink-0' : 'min-w-0'}`}>
              <span dir={dirOf(lang)} lang={lang}>{s.swipeHint}</span>
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            </span>
          </div>

          {/* Paragraph Text */}
          <p
            className={`font-torah text-stone-900 font-medium ${fontSizeClass} text-justify leading-loose whitespace-pre-line`}
            dir="rtl"
          >
            {text}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
