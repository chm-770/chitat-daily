import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStrings } from '../i18n';

const STRINGS = {
  he: { done: 'סיימתי ✓' },
  en: { done: 'Done ✓' },
  fr: { done: 'Terminé ✓' },
};

/** Small green "סיימתי ✓" badge shown on a finished lesson (same as in the Chumash and Tehillim). */
export const CompletedBadge: React.FC = () => {
  const s = useStrings(STRINGS);
  return (
    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
      <span>{s.done}</span>
    </span>
  );
};
