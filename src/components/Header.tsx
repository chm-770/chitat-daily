import React, { useRef, useEffect } from 'react';
import { StudyCategory, DailyProgress, StudySettings } from '../types/chitas';
import { Check, Undo2, Settings, Clock, CalendarDays } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentCategory: StudyCategory;
  onSelectCategory: (cat: StudyCategory) => void;
  progress: DailyProgress;
  onOpenSettings: () => void;
  onOpenZmanim: () => void;
  onOpenCalendar: () => void;
  canUndo: boolean;
  onUndo: () => void;
  fontSize: StudySettings['fontSize'];
  onChangeFontSize: (size: StudySettings['fontSize']) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  progress,
  onOpenSettings,
  onOpenZmanim,
  onOpenCalendar,
  canUndo,
  onUndo,
  fontSize,
  onChangeFontSize,
}) => {
  const fontSizes: StudySettings['fontSize'][] = ['small', 'medium', 'large', 'xlarge'];
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentCategory]);

  const handleDecreaseFont = () => {
    const currentIndex = fontSizes.indexOf(fontSize);
    if (currentIndex > 0) {
      onChangeFontSize(fontSizes[currentIndex - 1]);
    }
  };

  const handleIncreaseFont = () => {
    const currentIndex = fontSizes.indexOf(fontSize);
    if (currentIndex < fontSizes.length - 1) {
      onChangeFontSize(fontSizes[currentIndex + 1]);
    }
  };

  const navItems: {
    id: StudyCategory;
    label: string;
    isCompleted?: boolean;
  }[] = [
    { id: 'overview', label: 'ראשי' },
    { id: 'chumash', label: 'חומש היומי', isCompleted: progress.chumash },
    { id: 'tehillim', label: 'תהילים היומי', isCompleted: progress.tehillim },
    { id: 'tanya', label: 'תניא היומי', isCompleted: progress.tanya },
    { id: 'hayom_yom', label: 'היום יום', isCompleted: progress.hayomYom },
    { id: 'rambam', label: 'רמב״ם היומי', isCompleted: progress.rambam },
  ];

  return (
    <header className="sticky top-0 z-30 bg-amber-50/95 backdrop-blur-md border-b border-amber-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Single text element wordmark + זמני היום button (between חת״ת and התקן) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onSelectCategory('overview')}
            className="text-xl font-bold tracking-tight text-amber-950 font-torah hover:opacity-85 transition-opacity text-right flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span className="text-2xl text-amber-800">חִתַּ״ת</span>
            <span className="hidden xl:inline text-xs text-amber-900/70 font-sans font-medium">
              הלימוד היומי
            </span>
          </button>

          {/* זמני היום Button - placed between חת״ת and התקן */}
          <button
            onClick={onOpenZmanim}
            title="זמני היום הלכתיים לפי העיר שנבחרה"
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-100/90 hover:bg-amber-200/90 text-amber-950 border border-amber-300 font-semibold text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            <Clock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span>זמני היום</span>
          </button>
        </div>

        {/* Zone 2: Navigation links with GREEN CHECKMARK (V) when completed! */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = currentCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`relative py-1.5 px-2 flex items-center gap-1.5 text-xs xl:text-sm rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'text-amber-950 font-bold bg-amber-100/60'
                    : 'text-stone-700 hover:text-amber-950 hover:bg-amber-100/30'
                }`}
              >
                <span>{item.label}</span>

                {/* Green V Checkmark Badge directly in top menu when completed! */}
                {item.isCompleted !== undefined && (
                  <span
                    title={item.isCompleted ? 'הושלם היום ✓' : 'טרם הושלם'}
                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-all ${
                      item.isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border border-stone-300 text-transparent'
                    }`}
                  >
                    {item.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                )}

                {isActive && (
                  <span className="absolute bottom-0 inset-x-2 h-0.5 bg-amber-800 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions - PWA Install, Undo arrow, Font size controls, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Small backward arrow for Undo (בטל העברה אחרונה) */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title={canUndo ? 'בטל את ההעברה האחרונה (Undo)' : 'אין פעולות לביטול'}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
              canUndo
                ? 'bg-white text-stone-800 border-amber-300 hover:bg-amber-100/70 hover:border-amber-400 active:scale-95 shadow-xs'
                : 'bg-stone-100/60 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
          </button>

          {/* Quick Font Size Adjuster Controls (A- / A+) */}
          <div className="hidden sm:flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handleDecreaseFont}
              disabled={fontSize === 'small'}
              title="הקטן גודל טקסט"
              className="px-2 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5"
            >
              <span>A-</span>
            </button>
            <span className="text-stone-200">|</span>
            <button
              onClick={handleIncreaseFont}
              disabled={fontSize === 'xlarge'}
              title="הגדל גודל טקסט"
              className="px-2 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5"
            >
              <span>A+</span>
            </button>
          </div>

          {/* Calendar: pick a day and see the study progress of each day */}
          <button
            onClick={onOpenCalendar}
            title="לוח שנה והתקדמות הלימוד"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800" />
          </button>

          {/* Settings modal trigger */}
          <button
            onClick={onOpenSettings}
            title="הגדרות קריאה ועיצוב"
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden md:inline">הגדרות</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Bar */}
      <div className="lg:hidden overflow-x-auto py-2 px-3 border-t border-amber-900/5 bg-amber-50/70 flex gap-1.5 no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentCategory === item.id;
          return (
            <button
              key={item.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSelectCategory(item.id)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-amber-900 text-amber-50 font-semibold'
                  : 'bg-white/80 text-stone-700 hover:bg-amber-100/70 border border-stone-200/60'
              }`}
            >
              <span>{item.label}</span>

              {/* Green V checkmark badge in mobile top menu */}
              {item.isCompleted !== undefined && (
                <span
                  className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ${
                    item.isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'border border-stone-300 text-transparent'
                  }`}
                >
                  {item.isCompleted && <Check className="w-2 h-2 stroke-[3]" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
