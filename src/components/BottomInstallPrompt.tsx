import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { dirOf, useLang, useStrings } from '../i18n';

const STRINGS = {
  he: {
    title: 'התקן את חת״ת יומי במכשיר',
    subtitle: 'הוספת קיצור דרך למסך הבית וקריאה מהירה',
    install: 'התקן',
    dismiss: 'סגור הצעה זו',
    guideTitle: 'הוספה למסך הבית בטלפון',
    step1: (
      <>
        1. לחץ על כפתור <strong>שיתוף (Share)</strong> בתחתית הדפדפן
      </>
    ) as React.ReactNode,
    step2: (
      <>
        2. גלול ובחר <strong>'הוסף למסך הבית' (Add to Home Screen)</strong>
      </>
    ) as React.ReactNode,
  },
  en: {
    title: 'Install Daily Chitas on your device',
    subtitle: 'Add a home screen shortcut for quick reading',
    install: 'Install',
    dismiss: 'Close this suggestion',
    guideTitle: 'Add to your phone’s home screen',
    step1: (
      <>
        1. Tap the <strong>Share</strong> button at the bottom of the browser
      </>
    ),
    step2: (
      <>
        2. Scroll and choose <strong>Add to Home Screen</strong>
      </>
    ),
  },
  fr: {
    title: 'Installez \'Hitat quotidien sur votre appareil',
    subtitle: 'Un raccourci sur l’écran d’accueil pour lire rapidement',
    install: 'Installer',
    dismiss: 'Fermer cette suggestion',
    guideTitle: 'Ajouter à l’écran d’accueil du téléphone',
    step1: (
      <>
        1. Touchez le bouton <strong>Partager</strong> en bas du navigateur
      </>
    ),
    step2: (
      <>
        2. Faites défiler et choisissez <strong>« Sur l’écran d’accueil »</strong>
      </>
    ),
  },
};

const DISMISS_KEY = 'chitas_dismiss_install_bottom_ts';

export const BottomInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const s = useStrings(STRINGS);
  const lang = useLang();

  useEffect(() => {
    // If already installed as PWA or in standalone mode, do not show
    if (isInstalled) {
      setIsDismissed(true);
      return;
    }

    try {
      const dismissedTs = localStorage.getItem(DISMISS_KEY);
      if (dismissedTs) {
        const diffHours = (Date.now() - parseInt(dismissedTs, 10)) / (1000 * 60 * 60);
        // If dismissed within the last 12 hours, keep hidden
        if (diffHours < 12) {
          setIsDismissed(true);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Delay slight moment so it pops up smoothly after entering via link
    const timer = setTimeout(() => {
      setIsDismissed(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      // Directly execute the install action without intermediate explanations!
      const outcome = await install();
      if (outcome) {
        setIsDismissed(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback: prompt or guide
      setShowIOSGuide(true);
    }
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:start-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300"
      dir={dirOf(lang)}
    >
      <div className="bg-amber-950 text-amber-50 rounded-2xl shadow-2xl border border-amber-700/50 p-3.5 sm:p-4 backdrop-blur-md">
        {!showIOSGuide ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center shrink-0 border border-amber-600/40 shadow-xs">
                <Smartphone className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white font-torah truncate">
                  {s.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-amber-200/80 truncate">
                  {s.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{s.install}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={s.dismiss}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Instant 2-step guide for iOS Safari where native prompt API doesn't exist */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 font-torah">
                <span>{s.guideTitle}</span>
              </h4>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-amber-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] sm:text-xs text-amber-200 space-y-1 bg-amber-900/60 p-2.5 rounded-xl border border-amber-800/70">
              <div className="flex items-center gap-2">
                <Share className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{s.step1}</span>
              </div>
              <div className="flex items-center gap-2">
                <PlusSquare className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{s.step2}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
