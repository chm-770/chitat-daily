import React from 'react';
import { motion, PanInfo } from 'motion/react';
import { TehillimChapter, getHebrewChapterNumber } from '../services/tehillimService';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface SwipePsalmCardProps {
  chapter: TehillimChapter;
  onSwipeRight: () => void;
  fontSizeClass: string;
}

export const SwipePsalmCard: React.FC<SwipePsalmCardProps> = ({
  chapter,
  onSwipeRight,
  fontSizeClass,
}) => {
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 60 || info.velocity.x > 250) {
      onSwipeRight();
    }
  };

  return (
    <motion.div
      layout
      data-swipe-verse="true"
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.4}
      data-swipe-card="true"
      data-swipe="true"
      onDragEnd={handleDragEnd}
      exit={{ x: 400, opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
      className="relative select-none cursor-grab active:cursor-grabbing bg-white rounded-2xl border border-stone-200/90 hover:border-amber-300 p-6 shadow-xs transition-shadow duration-200 space-y-4"
    >
      {/* Visual cue when swiping right */}
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-emerald-500/20 to-transparent rounded-r-2xl pointer-events-none flex items-center justify-end pr-4 opacity-0 active:opacity-100 transition-opacity">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 stroke-[2.5]" />
      </div>

      {/* Chapter Title Bar */}
      <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs font-torah">
            {getHebrewChapterNumber(chapter.number).replace(/[׳״]/g, '')}
          </span>
          <div>
            <h3 className="font-torah font-bold text-xl md:text-2xl text-amber-950">
              מִזְמוֹר {getHebrewChapterNumber(chapter.number)}
            </h3>
            {chapter.subTitle && (
              <span className="text-xs font-semibold text-amber-800 font-sans block">
                {chapter.subTitle}
              </span>
            )}
          </div>
        </div>

<span className="flex items-center gap-1 text-[11px] text-stone-400 font-sans shrink-0">
            <span>החלק ימינה לסימון</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
      </div>

      {/* Continuous Holy Verses */}
      <p
        className={`font-torah text-stone-900 font-medium ${fontSizeClass} text-justify leading-loose`}
        dir="rtl"
      >
        {chapter.verses.map((v) => (
          <React.Fragment key={v.number}>
            <span className="font-bold text-amber-900 text-sm md:text-base mx-1 select-none inline-block">
              ({getHebrewChapterNumber(v.number).replace(/[׳״]/g, '')})
            </span>
            <span>{v.text} </span>
          </React.Fragment>
        ))}
      </p>
    </motion.div>
  );
};
