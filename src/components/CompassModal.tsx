import React, { useEffect, useRef, useState } from 'react';
import { Compass, LocateFixed, X } from 'lucide-react';
import { dirOf, useLang, useStrings } from '../i18n';
import { DEFAULT_CITY, cityDisplayName, getSavedCity, type CityConfig } from '../services/zmanimService';

/** Har HaBayit (the place of the Kodesh HaKodashim), Jerusalem */
const TEMPLE_MOUNT = { lat: 31.77805, lon: 35.23535 };

const STRINGS = {
  he: {
    title: 'כיוון התפילה',
    subtitle: 'הכיוון לירושלים, להר הבית',
    from: 'לפי המיקום:',
    useLocation: 'לפי המיקום הנוכחי',
    locating: 'מאתר מיקום…',
    locationFailed: 'לא הצלחנו לקבל את המיקום. הכיוון מחושב לפי העיר שנבחרה.',
    degrees: (d: number) => `\u2066${d}°\u2069 מהצפון`,
    distance: (km: number) => `${km.toLocaleString('he-IL')} ק״מ מירושלים`,
    start: 'הפעלת המצפן',
    holdFlat: 'החזק את הטלפון שטוח, והסתובב עד שהחץ מצביע למעלה.',
    facing: 'אתה פונה לכיוון ירושלים ✓',
    turnRight: (d: number) => `הסתובב ימינה \u2066${d}°\u2069`,
    turnLeft: (d: number) => `הסתובב שמאלה \u2066${d}°\u2069`,
    noSensor:
      'לא נמצא מצפן במכשיר הזה. אפשר להיעזר במעלות: הכיוון לירושלים הוא החץ, כשהצפון למעלה.',
    calibrate: 'אם הכיוון נראה לא מדויק, הזז את הטלפון בצורת הספרה 8 כדי לכייל את המצפן.',
    note: 'הכיוון הוא הקו הקצר ביותר לירושלים על פני כדור הארץ. בחוץ לארץ יש שנוהגים לפנות למזרח – כדאי לנהוג לפי מנהג המקום.',
    close: 'סגירה',
    n: 'צ',
    jerusalem: 'ירושלים',
  },
  en: {
    title: 'Direction of prayer',
    subtitle: 'The direction of Jerusalem, the Temple Mount',
    from: 'From:',
    useLocation: 'Use my current location',
    locating: 'Finding your location…',
    locationFailed: 'Could not get your location. The direction is calculated for the selected city.',
    degrees: (d: number) => `${d}° from north`,
    distance: (km: number) => `${km.toLocaleString('en-US')} km from Jerusalem`,
    start: 'Start the compass',
    holdFlat: 'Hold the phone flat and turn until the arrow points up.',
    facing: 'You are facing Jerusalem ✓',
    turnRight: (d: number) => `Turn right ${d}°`,
    turnLeft: (d: number) => `Turn left ${d}°`,
    noSensor: 'No compass was found on this device. The arrow shows the direction of Jerusalem with north at the top.',
    calibrate: 'If the direction looks wrong, move the phone in a figure 8 to calibrate the compass.',
    note: 'The direction is the shortest line to Jerusalem over the globe. Outside Israel some communities face east – follow the local custom.',
    close: 'Close',
    n: 'N',
    jerusalem: 'Jerusalem',
  },
  fr: {
    title: 'Direction de la prière',
    subtitle: 'La direction de Jérusalem, le mont du Temple',
    from: 'Depuis :',
    useLocation: 'Utiliser ma position actuelle',
    locating: 'Localisation…',
    locationFailed: "Impossible d'obtenir votre position. La direction est calculée pour la ville choisie.",
    degrees: (d: number) => `${d}° depuis le nord`,
    distance: (km: number) => `${km.toLocaleString('fr-FR')} km de Jérusalem`,
    start: 'Activer la boussole',
    holdFlat: "Tenez le téléphone à plat et tournez jusqu'à ce que la flèche pointe vers le haut.",
    facing: 'Vous êtes tourné vers Jérusalem ✓',
    turnRight: (d: number) => `Tournez à droite de ${d}°`,
    turnLeft: (d: number) => `Tournez à gauche de ${d}°`,
    noSensor: "Aucune boussole n'a été trouvée sur cet appareil. La flèche indique Jérusalem, le nord étant en haut.",
    calibrate: 'Si la direction semble fausse, faites un 8 avec le téléphone pour calibrer la boussole.',
    note: "La direction est la ligne la plus courte vers Jérusalem sur le globe. Hors d'Israël, certaines communautés se tournent vers l'est – suivez la coutume locale.",
    close: 'Fermer',
    n: 'N',
    jerusalem: 'Jérusalem',
  },
};

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Initial great-circle bearing (degrees from true north) from a point to Jerusalem. */
export function bearingToJerusalem(lat: number, lon: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(TEMPLE_MOUNT.lat);
  const Δλ = toRad(TEMPLE_MOUNT.lon - lon);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function distanceKm(lat: number, lon: number): number {
  const R = 6371;
  const dφ = toRad(TEMPLE_MOUNT.lat - lat);
  const dλ = toRad(TEMPLE_MOUNT.lon - lon);
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(TEMPLE_MOUNT.lat)) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

type SensorState = 'idle' | 'needs-permission' | 'active' | 'unavailable';

export const CompassModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const s = useStrings(STRINGS);
  const lang = useLang();
  const [city, setCity] = useState<CityConfig>(() => getSavedCity() || DEFAULT_CITY);
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const [sensor, setSensor] = useState<SensorState>('idle');
  // Continuous rotation angle (avoids spinning the long way round when crossing north)
  const roseAngle = useRef(0);
  const [roseDisplay, setRoseDisplay] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setCity(getSavedCity() || DEFAULT_CITY);
    setLocError(false);
  }, [isOpen]);

  const lat = here?.lat ?? city.latitude;
  const lon = here?.lon ?? city.longitude;
  const bearing = bearingToJerusalem(lat, lon);
  const km = Math.round(distanceKm(lat, lon));

  // Compass sensor
  useEffect(() => {
    if (!isOpen) return;
    const D = (window as any).DeviceOrientationEvent;
    if (!D) {
      setSensor('unavailable');
      return;
    }
    if (typeof D.requestPermission === 'function' && sensor !== 'active') {
      // iPhone: needs a tap to ask permission
      setSensor('needs-permission');
      return;
    }
    return listen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function listen() {
    let got = false;
    const onOrient = (e: any) => {
      let h: number | null = null;
      if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
      else if (e.absolute && typeof e.alpha === 'number') h = 360 - e.alpha;
      if (h === null) return;
      const screenAngle = (screen.orientation && screen.orientation.angle) || (window as any).orientation || 0;
      h = (h + screenAngle + 360) % 360;
      got = true;
      setSensor('active');
      setHeading(h);
      // Shortest turn from the previous angle
      const target = -h;
      let delta = ((target - roseAngle.current) % 360 + 540) % 360 - 180;
      roseAngle.current += delta;
      setRoseDisplay(roseAngle.current);
    };
    const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(evt, onOrient, true);
    const timer = window.setTimeout(() => {
      if (!got) setSensor('unavailable');
    }, 2500);
    return () => {
      window.removeEventListener(evt, onOrient, true);
      window.clearTimeout(timer);
    };
  }

  const cleanup = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => cleanup.current?.(), []);
  useEffect(() => {
    if (!isOpen) {
      cleanup.current?.();
      cleanup.current = undefined;
      setHeading(null);
      setSensor('idle');
    }
  }, [isOpen]);

  const requestSensor = async () => {
    try {
      const res = await (window as any).DeviceOrientationEvent.requestPermission();
      if (res === 'granted') cleanup.current = listen();
      else setSensor('unavailable');
    } catch {
      setSensor('unavailable');
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setLocError(true);
      return;
    }
    setLocating(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  if (!isOpen) return null;

  // Relative angle of Jerusalem on the screen (0 = straight ahead)
  const relative = heading === null ? bearing : (bearing - heading + 360) % 360;
  const turn = relative > 180 ? relative - 360 : relative; // -180..180, positive = to the right
  const facing = heading !== null && Math.abs(turn) <= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" dir={dirOf(lang)}>
      <div className="bg-white rounded-2xl max-w-sm w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-800" />
            <div>
              <h2 className="font-bold text-stone-900 font-torah text-lg leading-tight">{s.title}</h2>
              <p className="text-[11px] text-stone-500">{s.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={s.close} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-center">
          {/* Compass dial: rotates with the phone, the arrow points to Jerusalem */}
          <div className="relative mx-auto w-64 h-64 max-w-full">
            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{ transform: `rotate(${heading === null ? 0 : roseDisplay}deg)` }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="96" fill="var(--color-amber-50, #fffbeb)" stroke="#d6a76a" strokeWidth="2" />
                {Array.from({ length: 72 }).map((_, i) => (
                  <line
                    key={i}
                    x1="100"
                    y1={i % 18 === 0 ? 8 : i % 2 === 0 ? 10 : 12}
                    x2="100"
                    y2="16"
                    stroke={i === 0 ? '#b91c1c' : '#a8a29e'}
                    strokeWidth={i % 18 === 0 ? 2.5 : 1}
                    transform={`rotate(${i * 5} 100 100)`}
                  />
                ))}
                <text x="100" y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill="#b91c1c">
                  {s.n}
                </text>
                {/* Arrow to Jerusalem */}
                <g transform={`rotate(${bearing} 100 100)`}>
                  <line x1="100" y1="100" x2="100" y2="38" stroke={facing ? '#047857' : '#78350f'} strokeWidth="5" strokeLinecap="round" />
                  <polygon points="100,24 89,44 111,44" fill={facing ? '#047857' : '#78350f'} />
                </g>
                <circle cx="100" cy="100" r="6" fill="#78350f" />
              </svg>
            </div>
            {/* Fixed marker: the direction the phone points to */}
            {heading !== null && <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-stone-800" />}
          </div>

          <div className="space-y-1">
            {facing ? (
              <p className="text-base font-bold text-emerald-700">{s.facing}</p>
            ) : heading !== null ? (
              <p className="text-base font-bold text-amber-950">
                {turn > 0 ? s.turnRight(Math.round(turn)) : s.turnLeft(Math.round(-turn))}
              </p>
            ) : null}
            <p className="text-sm text-stone-700">
              <span className="font-semibold">{s.jerusalem}:</span> {s.degrees(Math.round(bearing))}
            </p>
            <p className="text-xs text-stone-500">{s.distance(km)}</p>
          </div>

          {sensor === 'needs-permission' && (
            <button onClick={requestSensor} className="px-4 py-2 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-sm font-bold cursor-pointer">
              {s.start}
            </button>
          )}
          {sensor === 'active' && <p className="text-[11px] text-stone-500">{s.holdFlat}</p>}
          {sensor === 'unavailable' && <p className="text-[11px] text-stone-500">{s.noSensor}</p>}

          <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-start">
            <div className="min-w-0 text-xs">
              <span className="text-stone-500">{s.from} </span>
              <span className="font-bold text-stone-900" dir="auto">
                {here ? `${here.lat.toFixed(3)}, ${here.lon.toFixed(3)}` : cityDisplayName(city, lang)}
              </span>
            </div>
            {!here && (
              <button
                onClick={locate}
                disabled={locating}
                className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 disabled:opacity-60"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>{locating ? s.locating : s.useLocation}</span>
              </button>
            )}
          </div>
          {locError && <p className="text-[11px] text-red-600">{s.locationFailed}</p>}

          {sensor === 'active' && <p className="text-[11px] text-stone-400">{s.calibrate}</p>}
          <p className="text-[11px] text-stone-400 leading-relaxed">{s.note}</p>
        </div>
      </div>
    </div>
  );
};
