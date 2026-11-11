import React from 'react';
import { Smartphone, Download, Share, PlusSquare, X, Check, Sparkles, BookOpen, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { dirOf, useLang, useStrings } from '../i18n';

const STRINGS = {
  he: {
    appName: 'חת״ת יומי',
    title: 'הורדת חִתַּ״ת לטלפון',
    free: 'אפליקציה חינמית',
    subtitle: 'התקנה ישירה למסך הבית ללא צורך בחנות אפליקציות',
    close: 'סגור',
    installedTitle: 'האפליקציה כבר מותקנת בטלפון שלך!',
    installedText: 'תוכל לפתוח אותה ישירות ממסך הבית לחוויית מסך מלא.',
    installOneClick: 'התקן כעת למסך הבית בלחיצה אחת',
    installHint: 'לחיצה תפתח את חלונית ההתקנה של הדפדפן להוספה מיידית.',
    iosTitle: 'הוראות התקנה לאייפון ולאייפד (iOS Safari):',
    genericTitle: 'כיצד להוריד ולהוסיף למסך הבית:',
    ios1: (share: React.ReactNode): React.ReactNode => (
      <>
        לחץ על כפתור <strong>השיתוף</strong> בדפדפן ספארי (סמל ריבוע עם חץ עולה{' '}
        {share} בתחתית המסך).
      </>
    ),
    ios2: (plus: React.ReactNode): React.ReactNode => (
      <>
        גלול מעט בתפריט ובחר <strong>״הוסף למסך הבית״</strong> (Add to Home Screen{' '}
        {plus}).
      </>
    ),
    ios3: (
      <>
        לחץ על <strong>״הוסף״</strong> בפינה העליונה. סמל ״חת״ת יומי״ יופיע במסך הבית של הטלפון!
      </>
    ) as React.ReactNode,
    android1: (
      <>
        לחץ על תפריט הדפדפן (שלוש הנקודות <strong>⋮</strong> בפינה העליונה של Chrome).
      </>
    ) as React.ReactNode,
    android2: (
      <>
        בחר באפשרות <strong>״התקנת האפליקציה״</strong> או <strong>״הוספה למסך הבית״</strong>.
      </>
    ) as React.ReactNode,
    android3: 'אשר את ההתקנה. האפליקציה תותקן מיד במסך הבית ובמגירת האפליקציות שלך!' as React.ReactNode,
    advantages: 'יתרונות השימוש כאפליקציה בטלפון:',
    adv1: 'מסך מלא בלי שורת דפדפן',
    adv2: 'פתיחה מהירה בלחיצה אחת',
    adv3: 'קריאה במצב לא מקוון',
    adv4: 'שמירת התקדמות מקומית',
    gotIt: 'הבנתי, תודה',
  },
  en: {
    appName: 'Daily Chitas',
    title: 'Get Chitas on your phone',
    free: 'Free app',
    subtitle: 'Install straight to the home screen, no app store needed',
    close: 'Close',
    installedTitle: 'The app is already installed on your phone!',
    installedText: 'Open it straight from the home screen for a full-screen experience.',
    installOneClick: 'Install to the home screen in one tap',
    installHint: 'This opens the browser’s install window to add it right away.',
    iosTitle: 'Installing on iPhone and iPad (iOS Safari):',
    genericTitle: 'How to add it to your home screen:',
    ios1: (share: React.ReactNode) => (
      <>
        Tap the <strong>Share</strong> button in Safari (the square with an up arrow {share} at the bottom of the
        screen).
      </>
    ),
    ios2: (plus: React.ReactNode) => (
      <>
        Scroll down the menu and choose <strong>“Add to Home Screen”</strong> {plus}.
      </>
    ),
    ios3: (
      <>
        Tap <strong>“Add”</strong> in the top corner. The “Daily Chitas” icon will appear on your home screen!
      </>
    ),
    android1: (
      <>
        Open the browser menu (the three dots <strong>⋮</strong> in the top corner of Chrome).
      </>
    ),
    android2: (
      <>
        Choose <strong>“Install app”</strong> or <strong>“Add to Home screen”</strong>.
      </>
    ),
    android3: 'Confirm the installation. The app will appear on your home screen and in your app drawer!',
    advantages: 'Why use it as an app:',
    adv1: 'Full screen, no browser bar',
    adv2: 'Opens in one tap',
    adv3: 'Read offline',
    adv4: 'Progress saved on the device',
    gotIt: 'Got it, thanks',
  },
  fr: {
    appName: '\'Hitat quotidien',
    title: 'Le \'Hitat sur votre téléphone',
    free: 'Application gratuite',
    subtitle: 'Installation directe sur l’écran d’accueil, sans passer par un store',
    close: 'Fermer',
    installedTitle: 'L’application est déjà installée sur votre téléphone !',
    installedText: 'Vous pouvez l’ouvrir directement depuis l’écran d’accueil, en plein écran.',
    installOneClick: 'Installer sur l’écran d’accueil en un geste',
    installHint: 'La fenêtre d’installation du navigateur s’ouvrira pour l’ajouter immédiatement.',
    iosTitle: 'Installation sur iPhone et iPad (iOS Safari) :',
    genericTitle: 'Comment l’ajouter à l’écran d’accueil :',
    ios1: (share: React.ReactNode) => (
      <>
        Touchez le bouton <strong>Partager</strong> de Safari (le carré avec une flèche vers le haut {share} en bas
        de l’écran).
      </>
    ),
    ios2: (plus: React.ReactNode) => (
      <>
        Faites défiler le menu et choisissez <strong>« Sur l’écran d’accueil »</strong> {plus}.
      </>
    ),
    ios3: (
      <>
        Touchez <strong>« Ajouter »</strong> en haut de l’écran. L’icône « \'Hitat quotidien » apparaîtra sur votre
        écran d’accueil !
      </>
    ),
    android1: (
      <>
        Ouvrez le menu du navigateur (les trois points <strong>⋮</strong> en haut de Chrome).
      </>
    ),
    android2: (
      <>
        Choisissez <strong>« Installer l’application »</strong> ou <strong>« Ajouter à l’écran d’accueil »</strong>.
      </>
    ),
    android3: 'Confirmez l’installation. L’application apparaîtra aussitôt sur l’écran d’accueil et dans la liste des applications !',
    advantages: 'Les avantages de l’application :',
    adv1: 'Plein écran, sans barre du navigateur',
    adv2: 'Ouverture en un geste',
    adv3: 'Lecture hors ligne',
    adv4: 'Progression enregistrée sur l’appareil',
    gotIt: 'J’ai compris, merci',
  },
};

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const s = useStrings(STRINGS);
  const lang = useLang();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-amber-200 overflow-hidden text-stone-900"
        onClick={(e) => e.stopPropagation()}
        dir={dirOf(lang)}
      >
        {/* Header with App Branding */}
        <div className="bg-linear-to-l from-amber-900 via-amber-800 to-amber-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100/10 border border-amber-400/30 flex items-center justify-center p-2 shadow-inner">
              <img src="/icon.svg" alt={s.appName} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-torah tracking-wide flex items-center gap-1.5">
                <span>{s.title}</span>
                <span className="text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-sans font-normal">
                  {s.free}
                </span>
              </h3>
              <p className="text-xs text-amber-200/80">{s.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={s.close}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status: Already installed */}
          {isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="text-sm">
                <p className="font-bold">{s.installedTitle}</p>
                <p className="text-xs text-emerald-700 mt-0.5">{s.installedText}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Direct Install Button (When browser supports native prompt) */}
              {isInstallable && (
                <div className="text-center space-y-3">
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Download className="w-5 h-5" />
                    <span>{s.installOneClick}</span>
                  </button>
                  <p className="text-xs text-stone-500">
                    {s.installHint}
                  </p>
                </div>
              )}

              {/* Instructions Guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>{isIOS ? s.iosTitle : s.genericTitle}</span>
                </h4>

                {isIOS ? (
                  // iOS Safari specific steps
                  <ol className="space-y-2.5 text-xs text-stone-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 font-sans">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </span>
                      <span>{s.ios1(<Share className="w-3.5 h-3.5 inline text-blue-600 align-middle" />)}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </span>
                      <span>{s.ios2(<PlusSquare className="w-3.5 h-3.5 inline text-stone-700 align-middle" />)}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        3
                      </span>
                      <span>{s.ios3}</span>
                    </li>
                  </ol>
                ) : (
                  // Android / Chrome general steps
                  <ol className="space-y-2.5 text-xs text-stone-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 font-sans">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </span>
                      <span>{s.android1}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </span>
                      <span>{s.android2}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        3
                      </span>
                      <span>{s.android3}</span>
                    </li>
                  </ol>
                )}
              </div>

              {/* App Advantages */}
              <div className="pt-2 border-t border-stone-200">
                <p className="text-xs font-semibold text-stone-800 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{s.advantages}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <Smartphone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{s.adv1}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{s.adv2}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{s.adv3}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{s.adv4}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs transition-colors cursor-pointer"
          >
            {s.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};
