import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { useStrings } from '../i18n';

const STRINGS = {
  he: {
    cardTitle: 'הורד את האפליקציה לטלפון',
    cardText: 'לימוד חת״ת במסך מלא, פתיחה ישירה ממסך הבית וזמינות ללא אינטרנט',
    installNow: 'התקן עכשיו',
    headerTitle: 'הורדת האפליקציה למסך הבית בטלפון',
    download: 'הורד לטלפון',
    install: 'התקן',
  },
  en: {
    cardTitle: 'Get the app on your phone',
    cardText: 'Study Chitas full screen, open it straight from the home screen, and read offline',
    installNow: 'Install now',
    headerTitle: 'Add the app to your phone’s home screen',
    download: 'Get the app',
    install: 'Install',
  },
  fr: {
    cardTitle: 'Installez l’application sur votre téléphone',
    cardText: 'Étudiez le \'Hitat en plein écran, ouvrez-le depuis l’écran d’accueil, même sans Internet',
    installNow: 'Installer',
    headerTitle: 'Ajouter l’application à l’écran d’accueil du téléphone',
    download: 'Installer l’app',
    install: 'Installer',
  },
};

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const s = useStrings(STRINGS);

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
                {s.cardTitle}
              </h4>
              <p className="text-xs text-stone-600">
                {s.cardText}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{s.installNow}</span>
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
        title={s.headerTitle}
        className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-amber-50 font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-200" />
        <span className="hidden sm:inline">{s.download}</span>
        <span className="sm:hidden">{s.install}</span>
      </button>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
