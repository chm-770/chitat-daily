import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running as an installed PWA on device, hide button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'card') {
    return (
      <>
        <div
          onClick={handleClick}
          className={`p-4 rounded-xl border border-amber-300/80 bg-gradient-to-l from-amber-100/70 via-amber-50 to-orange-50/60 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all hover:shadow-sm ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900 font-torah">
                הורד את האפליקציה לטלפון
              </h4>
              <p className="text-xs text-stone-600">
                לימוד חת״ת במסך מלא, פתיחה ישירה ממסך הבית וזמינות ללא אינטרנט
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>התקן עכשיו</span>
          </button>
        </div>

        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // Header button variant (compact & prominent)
  return (
    <>
      <button
        onClick={handleClick}
        title="הורדת האפליקציה למסך הבית בטלפון"
        className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-amber-50 font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-200" />
        <span className="hidden sm:inline">הורד לטלפון</span>
        <span className="sm:hidden">התקן</span>
      </button>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
