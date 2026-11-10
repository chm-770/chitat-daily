import React from 'react';
import { Smartphone, Download, Share, PlusSquare, X, Check, Sparkles, BookOpen, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

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
        dir="rtl"
      >
        {/* Header with App Branding */}
        <div className="bg-linear-to-l from-amber-900 via-amber-800 to-amber-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100/10 border border-amber-400/30 flex items-center justify-center p-2 shadow-inner">
              <img src="/icon.svg" alt="חת״ת יומי" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-torah tracking-wide flex items-center gap-1.5">
                <span>הורדת חִתַּ״ת לטלפון</span>
                <span className="text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-sans font-normal">
                  אפליקציה חינמית
                </span>
              </h3>
              <p className="text-xs text-amber-200/80">התקנה ישירה למסך הבית ללא צורך בחנות אפליקציות</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
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
                <p className="font-bold">האפליקציה כבר מותקנת בטלפון שלך!</p>
                <p className="text-xs text-emerald-700 mt-0.5">תוכל לפתוח אותה ישירות ממסך הבית לחוויית מסך מלא.</p>
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
                    <span>התקן כעת למסך הבית בלחיצה אחת</span>
                  </button>
                  <p className="text-xs text-stone-500">
                    לחיצה תפתח את חלונית ההתקנה של הדפדפן להוספה מיידית.
                  </p>
                </div>
              )}

              {/* Instructions Guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>{isIOS ? 'הוראות התקנה לאייפון ולאייפד (iOS Safari):' : 'כיצד להוריד ולהוסיף למסך הבית:'}</span>
                </h4>

                {isIOS ? (
                  // iOS Safari specific steps
                  <ol className="space-y-2.5 text-xs text-stone-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 font-sans">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        לחץ על כפתור <strong>השיתוף</strong> בדפדפן ספארי (סמל ריבוע עם חץ עולה{' '}
                        <Share className="w-3.5 h-3.5 inline text-blue-600 align-middle" /> בתחתית המסך).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        גלול מעט בתפריט ובחר <strong>״הוסף למסך הבית״</strong> (Add to Home Screen{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline text-stone-700 align-middle" />).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        לחץ על <strong>״הוסף״</strong> בפינה העליונה. סמל ״חת״ת יומי״ יופיע במסך הבית של הטלפון!
                      </span>
                    </li>
                  </ol>
                ) : (
                  // Android / Chrome general steps
                  <ol className="space-y-2.5 text-xs text-stone-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 font-sans">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        לחץ על תפריט הדפדפן (שלוש הנקודות <strong>⋮</strong> בפינה העליונה של Chrome).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        בחר באפשרות <strong>״התקנת האפליקציה״</strong> או <strong>״הוספה למסך הבית״</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        אשר את ההתקנה. האפליקציה תותקן מיד במסך הבית ובמגירת האפליקציות שלך!
                      </span>
                    </li>
                  </ol>
                )}
              </div>

              {/* App Advantages */}
              <div className="pt-2 border-t border-stone-200">
                <p className="text-xs font-semibold text-stone-800 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>יתרונות השימוש כאפליקציה בטלפון:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <Smartphone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>מסך מלא בלי שורת דפדפן</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>פתיחה מהירה בלחיצה אחת</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>קריאה במצב לא מקוון</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>שמירת התקדמות מקומית</span>
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
            הבנתי, תודה
          </button>
        </div>
      </div>
    </div>
  );
};
