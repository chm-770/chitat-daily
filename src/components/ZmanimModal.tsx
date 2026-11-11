import React, { useState, useEffect, useMemo } from 'react';
import {
  CityConfig,
  DEFAULT_CITY,
  getSavedCity,
  calculateZmanim,
  DayZmanimResult,
} from '../services/zmanimService';
import { CityPicker } from './CityPicker';
import { Clock, MapPin, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface ZmanimModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  onCityChanged?: (city: CityConfig) => void;
}

export const ZmanimModal: React.FC<ZmanimModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  onCityChanged,
}) => {
  const [selectedCity, setSelectedCity] = useState<CityConfig>(() => {
    return getSavedCity() || DEFAULT_CITY;
  });

  const [hasChosenCityExplicitly, setHasChosenCityExplicitly] = useState<boolean>(() => {
    return Boolean(getSavedCity());
  });

  const [isChangingCity, setIsChangingCity] = useState<boolean>(false);
  const [viewDate, setViewDate] = useState<Date>(() => initialDate || new Date());

  // Pick up a city changed elsewhere (e.g. in the settings) when the window opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCity(getSavedCity() || DEFAULT_CITY);
    }
  }, [isOpen]);

  // Sync with initialDate if updated
  useEffect(() => {
    if (initialDate) {
      setViewDate(initialDate);
    }
  }, [initialDate]);

  // If user opened modal and hasn't chosen city yet, show city selection first!
  useEffect(() => {
    if (isOpen && !hasChosenCityExplicitly) {
      setIsChangingCity(true);
    }
  }, [isOpen, hasChosenCityExplicitly]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const zmanimData: DayZmanimResult = useMemo(() => {
    // Zmanim according to the Alter Rebbe (Baal HaTanya), as in Chabad calendars (see sources page)
    return calculateZmanim(selectedCity, viewDate, 'chabad');
  }, [selectedCity, viewDate]);

  const handleSelectCity = (city: CityConfig) => {
    setSelectedCity(city);
    setHasChosenCityExplicitly(true);
    setIsChangingCity(false);
    if (onCityChanged) {
      onCityChanged(city);
    }
  };

  const handlePrevDay = () => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() - 1);
    setViewDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + 1);
    setViewDate(next);
  };

  const handleResetToToday = () => {
    setViewDate(new Date());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl bg-amber-50 rounded-2xl shadow-2xl border border-amber-900/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-l from-amber-900 via-amber-800 to-amber-900 text-amber-50 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-700/60 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-torah tracking-wide flex items-center gap-2">
                <span>זמני היום</span>
                <span className="text-2xl leading-none">·</span>
                <span className="text-amber-200 text-sm font-sans font-medium">
                  {selectedCity.nameHe}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-amber-200 hover:text-white transition-colors cursor-pointer"
            title="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City selection banner or view */}
        <div className="bg-amber-100/70 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-amber-950 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span className="text-stone-600">עיר נבחרת:</span>
            <span className="font-bold text-amber-950">{selectedCity.nameHe}</span>
            <span className="text-stone-500 text-[10px] hidden sm:inline">
              ({selectedCity.candleLightingMinutes} דק׳ הדלקת נרות)
            </span>
          </div>

          <button
            onClick={() => setIsChangingCity(!isChangingCity)}
            className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 font-semibold cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            {isChangingCity ? 'חזרה לזמנים' : 'שנה עיר / זהה מיקום'}
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* City Selection View */}
          {isChangingCity ? (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="font-bold text-stone-900 text-sm font-torah">
                בחר עיר לקביעת זמני היום וכניסת השבת
              </h4>
              <CityPicker selectedCity={selectedCity} onSelect={handleSelectCity} />
            </div>
          ) : (
            /* Zmanim Display View */
            <div className="space-y-4">
              {/* Date Navigation Bar */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-stone-200 p-2 shadow-2xs">
                <button
                  onClick={handlePrevDay}
                  title="יום קודם"
                  className="p-1.5 rounded-lg hover:bg-amber-100/50 text-stone-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <div className="font-bold text-stone-900 text-xs sm:text-sm font-torah">
                    {zmanimData.dateStrHebrew}
                  </div>
                  {viewDate.toDateString() !== new Date().toDateString() && (
                    <button
                      onClick={handleResetToToday}
                      className="text-[10px] text-amber-800 hover:underline cursor-pointer"
                    >
                      חזור להיום
                    </button>
                  )}
                </div>

                <button
                  onClick={handleNextDay}
                  title="יום הבא"
                  className="p-1.5 rounded-lg hover:bg-amber-100/50 text-stone-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Friday Candle Lighting Highlight Banner */}
              {zmanimData.isFriday && zmanimData.candleLightingTime && (
                <div className="p-3.5 rounded-xl bg-gradient-to-l from-amber-100 via-orange-50 to-amber-100 border border-amber-300 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🕯️</span>
                    <div>
                      <h4 className="font-bold text-amber-950 text-sm font-torah">
                        הדלקת נרות שבת קודש
                      </h4>
                      <p className="text-[10px] text-amber-800">
                        לפי {selectedCity.nameHe} ({selectedCity.candleLightingMinutes} דק׳ לפני
                        השקיעה)
                      </p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono tracking-tight bg-white/80 px-3 py-1 rounded-lg border border-amber-300">
                    {zmanimData.candleLightingTime}
                  </div>
                </div>
              )}

              {/* Saturday Havdalah Highlight Banner */}
              {zmanimData.havdalahTime && (
                <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-stone-700">מוצאי שבת - הבדלה וצאת השבת:</span>
                  <span className="font-bold text-stone-900 font-mono text-sm bg-white px-2 py-0.5 rounded border border-stone-300">
                    {zmanimData.havdalahTime}
                  </span>
                </div>
              )}

              {/* Zmanim Table / Cards */}
              <div className="bg-white rounded-xl border border-stone-200 shadow-2xs divide-y divide-stone-100 overflow-hidden">
                {zmanimData.items
                  .map((item) => {
                    return (
                      <div
                        key={item.id}
                        className={`px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                          item.highlightChabad
                            ? 'bg-amber-50/50 hover:bg-amber-50'
                            : 'hover:bg-stone-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.highlightChabad && (
                            <span
                              title="לשיטת רבנו הזקן בעל התניא"
                              className="w-1.5 h-1.5 rounded-full bg-amber-600"
                            />
                          )}
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                              <span>{item.titleHe}</span>
                              {item.highlightChabad && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200/70 font-sans">
                                  חב״ד
                                </span>
                              )}
                            </div>
                            {item.opinion && (
                              <div className="text-[10px] text-stone-500 font-sans">
                                {item.opinion}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="font-mono text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                          {item.timeStr}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="text-center text-[10px] text-stone-500 leading-relaxed">
                מחושב לפי הקואורדינטות המדויקות של {selectedCity.nameHe} ואופק המישורין.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100/80 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span>עיר: {selectedCity.nameHe}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-medium cursor-pointer shadow-2xs"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
