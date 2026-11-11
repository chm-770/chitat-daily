import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import type { ChumashVerse, Parasha, StudySettings } from '../types/chitas';
import type { HebrewDateInfo } from '../utils/hebrewCalendar';
import { getCurrentParashaInfo, getParashaData } from '../services/chumashService';
import { loadOnkelos } from '../services/onkelosService';
import { SwipeVerseCard } from './SwipeVerseCard';
import { dirOf, useLang, useStrings } from '../i18n';

const STRINGS = {
  he: {
    title: 'שניים מקרא ואחד תרגום',
    subtitle: 'כל הפרשה: מקרא פעמיים ותרגום אונקלוס',
    loading: 'טוען את הפרשה…',
    error: 'טעינת הפרשה נכשלה.',
    remaining: (left: number, total: number) => `נותרו ${left} פסוקים מתוך ${total}`,
    finished: 'סיימת שניים מקרא ואחד תרגום לפרשה. שבת שלום!',
    more: (n: number) => `עוד ${n} פסוקים יופיעו אחרי שתסמן את אלה`,
    source: 'תרגום אונקלוס: מהדורת מצודה (CC BY-NC), דרך Sefaria.',
  },
  en: {
    title: "Shnayim Mikra ve'Echad Targum",
    subtitle: 'The whole parasha: the verse twice and Targum Onkelos',
    loading: 'Loading the parasha…',
    error: 'Failed to load the parasha.',
    remaining: (left: number, total: number) => `${left} of ${total} verses left`,
    finished: "You finished Shnayim Mikra ve'Echad Targum for this parasha. Good Shabbos!",
    more: (n: number) => `${n} more verses will appear as you mark these`,
    source: 'Targum Onkelos: Metsudah edition (CC BY-NC), via Sefaria.',
  },
  fr: {
    title: 'Chnayim Mikra véé\'had Targoum',
    subtitle: 'Toute la Paracha : le verset deux fois et le Targoum Onkelos',
    loading: 'Chargement de la Paracha…',
    error: 'Échec du chargement de la Paracha.',
    remaining: (left: number, total: number) => `Il reste ${left} versets sur ${total}`,
    finished: 'Vous avez terminé Chnayim Mikra véé\'had Targoum pour cette Paracha. Chabbat Chalom !',
    more: (n: number) => `${n} versets de plus apparaîtront quand vous aurez marqué ceux-ci`,
    source: 'Targoum Onkelos : édition Metsoudah (CC BY-NC), via Sefaria.',
  },
};

/** Verses shown at once (the next ones appear as these are marked) */
const PAGE = 30;

interface Row {
  id: string;
  verse: ChumashVerse;
  aliyahName: string;
  targum?: string;
}

interface ShnayimMikraViewerProps {
  dateInfo: HebrewDateInfo;
  settings: StudySettings;
  readItemIds: Record<string, boolean>;
  onMarkVersesBatch: (ids: string[]) => void;
}

/** Shnayim Mikra ve'Echad Targum: the whole parasha of the coming Shabbat, each verse twice and Onkelos. */
export const ShnayimMikraViewer: React.FC<ShnayimMikraViewerProps> = ({ dateInfo, settings, readItemIds, onMarkVersesBatch }) => {
  const s = useStrings(STRINGS);
  const lang = useLang();
  const [parasha, setParasha] = useState<Parasha | null>(null);
  const [onkelos, setOnkelos] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setParasha(null);
    setFailed(false);
    (async () => {
      try {
        const info = await getCurrentParashaInfo(dateInfo.date || new Date());
        const data = await getParashaData(info.id);
        if (data.isError) throw new Error(data.errorMessage);
        const targum = await loadOnkelos(data.book);
        if (alive) {
          setOnkelos(targum);
          setParasha(data);
        }
      } catch (e) {
        console.warn('Shnayim Mikra load failed', e);
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [dateInfo.date]);

  const rows: Row[] = useMemo(() => {
    if (!parasha) return [];
    const out: Row[] = [];
    for (const a of parasha.aliyot) {
      for (const v of a.verses) {
        const key = `${v.chapter}:${v.verseInChapter}`;
        out.push({ id: `sm_${parasha.id}_${v.chapter}_${v.verseInChapter}`, verse: v, aliyahName: a.aliyahName, targum: onkelos[key] });
      }
    }
    return out;
  }, [parasha, onkelos]);

  const remaining = rows.filter((r) => !readItemIds[r.id]);
  const shown = remaining.slice(0, PAGE);

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-lg leading-relaxed';
      case 'large':
        return 'text-2xl leading-loose';
      case 'xlarge':
        return 'text-3xl leading-loose';
      default:
        return 'text-xl leading-relaxed';
    }
  };

  // Marking a verse marks every verse before it as well (as in the daily Chumash)
  const markUpTo = (row: Row) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    const ids = rows.slice(0, idx + 1).filter((r) => !readItemIds[r.id]).map((r) => r.id);
    onMarkVersesBatch(ids);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-100 text-amber-900">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-stone-900 font-torah text-xl leading-tight">{s.title}</h1>
            <p className="text-xs text-stone-500">{s.subtitle}</p>
          </div>
        </div>
        {parasha && (
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <span className="font-torah font-bold text-amber-900 text-lg" dir="rtl" lang="he">
              פרשת {parasha.name}
            </span>
            <span className="text-xs text-stone-600 font-medium">{s.remaining(remaining.length, rows.length)}</span>
          </div>
        )}
        {parasha && rows.length > 0 && (
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-700 transition-all"
              style={{ width: `${Math.round(((rows.length - remaining.length) / rows.length) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {!parasha && !failed && (
        <div className="flex items-center justify-center gap-2 py-12 text-stone-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{s.loading}</span>
        </div>
      )}
      {failed && <p className="text-center text-sm text-red-600 py-8">{s.error}</p>}

      {parasha && remaining.length === 0 && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-5 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-900">{s.finished}</p>
        </div>
      )}

      {parasha && remaining.length > 0 && (
        <div className="space-y-3.5">
          <AnimatePresence mode="popLayout">
            {shown.flatMap((row, i) => {
              const items: React.ReactNode[] = [];
              if (i === 0 || shown[i - 1].aliyahName !== row.aliyahName) {
                items.push(
                  <div key={`h_${row.id}`} className="pt-2 text-sm font-bold text-amber-900 font-torah" dir="rtl" lang="he">
                    {row.aliyahName}
                  </div>
                );
              }
              items.push(
                <SwipeVerseCard
                  key={row.id}
                  verse={row.verse}
                  verseIndex={i}
                  onSwipeRight={() => markUpTo(row)}
                  showRashi={Boolean(settings.shnayimMikraRashi)}
                  settings={settings}
                  getFontSizeClass={getFontSizeClass}
                  twice
                  targum={row.targum}
                />
              );
              return items;
            })}
          </AnimatePresence>
          {remaining.length > PAGE && (
            <p className="text-center text-xs text-stone-500" dir={dirOf(lang)}>
              {s.more(remaining.length - PAGE)}
            </p>
          )}
        </div>
      )}

      <p className="text-center text-[11px] text-stone-400">{s.source}</p>
    </div>
  );
};
