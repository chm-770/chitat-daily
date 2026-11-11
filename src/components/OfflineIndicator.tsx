import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { useStrings } from '../i18n';

const STRINGS = {
  he: { offline: 'מצב לא מקוון — הטקסטים שנטענו זמינים במלואם מהזיכרון המקומי' },
  en: { offline: 'Offline — texts already loaded are fully available from this device' },
  fr: { offline: 'Hors ligne — les textes déjà chargés restent disponibles sur cet appareil' },
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const s = useStrings(STRINGS);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 start-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-900/95 text-amber-50 px-4 py-2.5 text-xs font-medium shadow-xl border border-amber-700/60 backdrop-blur-xs animate-in fade-in slide-in-from-bottom-3"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
      </span>
      <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
      <span>{s.offline}</span>
    </div>
  );
};
