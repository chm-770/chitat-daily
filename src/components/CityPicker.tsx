import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Navigation, Search } from 'lucide-react';
import {
  CITIES_LIST,
  CityConfig,
  cityDisplayName,
  defaultCandleLightingMinutes,
  saveCity,
  searchCitiesOnline,
  searchLocalCities,
} from '../services/zmanimService';
import { type Lang, useLang, useStrings } from '../i18n';

// City name in the interface language (also used by other components)
export { cityDisplayName } from '../services/zmanimService';

const STRINGS = {
  he: {
    searchOffline: 'החיפוש העולמי דורש חיבור לאינטרנט. אפשר לבחור מהרשימה.',
    geoUnsupported: 'שירותי המיקום אינם נתמכים בדפדפן זה',
    geoDenied: 'הגישה למיקום נדחתה. אפשר לחפש עיר.',
    geoFailed: 'לא ניתן לאתר מיקום. אפשר לחפש עיר.',
    locating: 'מאתר מיקום...',
    detect: 'זהה מיקום נוכחי (GPS)',
    placeholder: 'חיפוש כל עיר בעולם (למשל: צפת, פריז, מיאמי...)',
    noResults: 'לא נמצאו ערים בשם זה. אפשר לנסות לכתוב את השם באנגלית.',
    minutes: (n: number) => `${n} דק׳`,
  },
  en: {
    searchOffline: 'Searching all cities needs an internet connection. You can pick from the list.',
    geoUnsupported: 'Location services are not supported in this browser',
    geoDenied: 'Location access was denied. You can search for a city.',
    geoFailed: 'Could not find your location. You can search for a city.',
    locating: 'Finding your location...',
    detect: 'Detect current location (GPS)',
    placeholder: 'Search any city in the world (e.g. Safed, Paris, Miami...)',
    noResults: 'No city found with this name.',
    minutes: (n: number) => `${n} min`,
  },
  fr: {
    searchOffline: 'La recherche mondiale nécessite une connexion Internet. Vous pouvez choisir dans la liste.',
    geoUnsupported: 'La localisation n’est pas prise en charge par ce navigateur',
    geoDenied: 'L’accès à la localisation a été refusé. Vous pouvez rechercher une ville.',
    geoFailed: 'Impossible de vous localiser. Vous pouvez rechercher une ville.',
    locating: 'Localisation en cours...',
    detect: 'Détecter ma position (GPS)',
    placeholder: 'Rechercher une ville (ex. : Safed, Paris, Miami...)',
    noResults: 'Aucune ville trouvée avec ce nom. Essayez d’écrire le nom en anglais.',
    minutes: (n: number) => `${n} min`,
  },
};

interface CityPickerProps {
  selectedCity: CityConfig;
  onSelect: (city: CityConfig) => void;
}

/**
 * City selection: search any city in the world (online), quick list of common cities
 * (also offline) and GPS detection. The chosen city is saved and kept for next time.
 */
export const CityPicker: React.FC<CityPickerProps> = ({ selectedCity, onSelect }) => {
  const [query, setQuery] = useState('');
  const s = useStrings(STRINGS);
  const lang = useLang();
  const [onlineResults, setOnlineResults] = useState<CityConfig[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const localResults = useMemo(() => searchLocalCities(query), [query]);

  // Online search (debounced)
  useEffect(() => {
    const q = query.trim();
    setSearchError(null);
    if (q.length < 2) {
      setOnlineResults([]);
      setIsSearching(false);
      return;
    }
    const controller = new AbortController();
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchCitiesOnline(q, controller.signal)
        .then((res) => {
          setOnlineResults(res);
          setIsSearching(false);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.warn('City search failed:', err);
          setOnlineResults([]);
          setSearchError(s.searchOffline);
          setIsSearching(false);
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (city: CityConfig) => {
    saveCity(city);
    setGeoError(null);
    onSelect(city);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(s.geoUnsupported);
      return;
    }
    setIsGeolocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closest = CITIES_LIST[0];
        let minDistance = Infinity;
        for (const city of CITIES_LIST) {
          const d = Math.hypot(city.latitude - latitude, city.longitude - longitude);
          if (d < minDistance) {
            minDistance = d;
            closest = city;
          }
        }
        if (minDistance < 0.1) {
          handleSelect(closest);
        } else {
          const isIsrael = latitude >= 29.3 && latitude <= 33.5 && longitude >= 34.2 && longitude <= 35.9;
          handleSelect({
            id: `gps_${latitude.toFixed(3)}_${longitude.toFixed(3)}`,
            nameHe: 'מיקום נוכחי (GPS)',
            nameEn: 'Current Location',
            latitude,
            longitude,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || closest.timeZone,
            candleLightingMinutes: defaultCandleLightingMinutes(latitude, longitude, isIsrael),
            isIsrael,
          });
        }
        setIsGeolocating(false);
      },
      (err) => {
        setIsGeolocating(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? s.geoDenied
            : s.geoFailed
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Online results first; local ones that are not already in the online list are added after
  const results = useMemo(() => {
    if (!query.trim()) return CITIES_LIST;
    const merged = [...onlineResults];
    for (const c of localResults) {
      if (!merged.some((m) => Math.abs(m.latitude - c.latitude) < 0.05 && Math.abs(m.longitude - c.longitude) < 0.05)) {
        merged.push(c);
      }
    }
    return merged;
  }, [query, onlineResults, localResults]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={isGeolocating}
        className="w-full py-2.5 px-3 rounded-xl bg-amber-900 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-amber-800 transition-all shadow-xs cursor-pointer disabled:opacity-50"
      >
        <Navigation className={`w-4 h-4 ${isGeolocating ? 'animate-spin' : ''}`} />
        <span>{isGeolocating ? s.locating : s.detect}</span>
      </button>

      {geoError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center">{geoError}</p>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute start-3 top-2.5" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={s.placeholder}
          className="w-full ps-9 pe-9 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700 focus:bg-white text-stone-900"
        />
        {isSearching && <Loader2 className="w-4 h-4 text-amber-800 absolute end-3 top-2.5 animate-spin" />}
      </div>

      {searchError && <p className="text-[11px] text-stone-500 text-center">{searchError}</p>}

      <div className="max-h-60 overflow-y-auto space-y-1.5 p-0.5">
        {results.length === 0 && !isSearching && (
          <p className="text-xs text-stone-500 text-center py-3">{s.noResults}</p>
        )}
        {results.map((city) => {
          const isSelected =
            selectedCity.id === city.id ||
            (Math.abs(selectedCity.latitude - city.latitude) < 0.001 &&
              Math.abs(selectedCity.longitude - city.longitude) < 0.001);
          return (
            <button
              type="button"
              key={city.id}
              onClick={() => handleSelect(city)}
              className={`w-full p-2.5 rounded-xl text-start transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                  : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50 text-stone-800'
              }`}
            >
              <span className="text-xs truncate" dir="auto">{cityDisplayName(city, lang)}</span>
              {isSelected ? (
                <Check className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              ) : (
                <span className="text-[10px] text-stone-400 shrink-0">{s.minutes(city.candleLightingMinutes)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
