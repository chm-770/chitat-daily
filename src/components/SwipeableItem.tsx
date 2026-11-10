import React, { useState } from 'react';
import { motion, PanInfo } from 'motion/react';
import { Check, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

interface SwipeableItemProps {
  id: string;
  isRead: boolean;
  onMarkRead: (id: string) => void;
  children: React.ReactNode;
  label?: string;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  id,
  isRead,
  onMarkRead,
  children,
  label,
}) => {
  const [dragOffset, setDragOffset] = useState<number>(0);

  const handleDrag = (_: any, info: PanInfo) => {
    // Only allow dragging to the right (positive x in standard coordinates)
    if (info.offset.x > 0) {
      setDragOffset(info.offset.x);
    } else {
      setDragOffset(0);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    // If dragged sufficiently to the right (> 75px or flicked with velocity)
    if (info.offset.x > 70 || info.velocity.x > 300) {
      if (!isRead) {
        onMarkRead(id);
      }
    }
    setDragOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl group select-none">
      {/* Background reveal on drag to right (in RTL, dragging towards right) */}
      <div
        className={`absolute inset-0 flex items-center justify-start px-5 rounded-xl transition-colors duration-200 ${
          isRead || dragOffset > 40
            ? 'bg-emerald-600 text-white'
            : 'bg-emerald-100/80 text-emerald-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>{isRead ? 'נקרא בהצלחה' : 'שחרר לסימון כנקרא'}</span>
        </div>
      </div>

      {/* Foreground card */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 140 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ x: isRead ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`relative z-10 p-5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
          isRead
            ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
            : 'bg-white border-stone-200/90 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            {children}
          </div>

          {/* Quick Action Button on the side: Slide right / Mark as read */}
          <div className="shrink-0 flex flex-col items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => onMarkRead(id)}
              title={isRead ? 'לחץ לביטול סימון' : 'העבר ימינה או לחץ לסימון כנקרא'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isRead
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200'
              }`}
            >
              {isRead ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="font-bold">נקרא ✓</span>
                </>
              ) : (
                <>
                  <span className="text-[11px]">החלק ימינה</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {label && (
              <span className="text-[10px] text-stone-400 font-mono tabular-nums">
                {label}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
