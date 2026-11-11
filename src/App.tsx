import React, { useState, useEffect, useRef } from 'react';
import { StudyCategory, DailyProgress, StudySettings, DailyStudyKey } from './types/chitas';
import { getHebrewDateInfo, HebrewDateInfo } from './utils/hebrewCalendar';
import { getCurrentParashaInfo } from './services/chumashService';
import { Header } from './components/Header';
import { DateSelectorBar } from './components/DateSelectorBar';
import { DailyOverview } from './components/DailyOverview';
import { ChumashViewer } from './components/ChumashViewer';
import { TehillimViewer } from './components/TehillimViewer';
import { TanyaViewer } from './components/TanyaViewer';
import { HayomYomViewer } from './components/HayomYomViewer';
import { RambamViewer } from './components/RambamViewer';
import { StudySettingsModal } from './components/StudySettingsModal';
import { ZmanimModal } from './components/ZmanimModal';
import { BottomInstallPrompt } from './components/BottomInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CalendarModal } from './components/CalendarModal';
import { getSavedCity, DEFAULT_CITY } from './services/zmanimService';
import { emptyProgress, loadProgress, localDateKey } from './utils/progress';
import { enabledLessonKeys, nextSection, sectionSequence, textFontFamily } from './utils/lessons';
import { OnboardingModal } from './components/OnboardingModal';

const DEFAULT_SETTINGS: StudySettings = {
  fontSize: 'medium',
  fontFamily: 'serif',
  theme: 'parchment',
  showRashi: true,
  rashiFontScript: true,
  rambamTrack: 'three_chapters',
  zmanimMethod: 'chabad',
};

export default function App() {
  // App shortcuts (manifest) open a section directly, e.g. /?section=chumash
  const [currentCategory, setCurrentCategory] = useState<StudyCategory>(() => {
    try {
      const section = new URLSearchParams(window.location.search).get('section');
      const allowed: StudyCategory[] = ['overview', 'chumash', 'tehillim', 'tanya', 'hayom_yom', 'rambam'];
      return allowed.includes(section as StudyCategory) ? (section as StudyCategory) : 'overview';
    } catch {
      return 'overview';
    }
  });
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dateInfo, setDateInfo] = useState<HebrewDateInfo>(() => getHebrewDateInfo(new Date()));
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isZmanimOpen, setIsZmanimOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  // Changes when the user picks another city, to refresh the parasha (Israel / Diaspora) and times
  const [cityId, setCityId] = useState<string>(() => (getSavedCity() || DEFAULT_CITY).id);
  const [undoStack, setUndoStack] = useState<string[][]>([]);

  // Cache invalidation: automatically generated build timestamp purges outdated cache on every release
  useEffect(() => {
    try {
      const currentVersion = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : 'dev';
      const storedVersion = localStorage.getItem('chitas_content_version');
      if (storedVersion !== currentVersion) {
        // Clear all cached Rambam, Sefer HaMitzvot, Chumash, and old query data
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (
            k &&
            (k.startsWith('chitas_rambam') ||
              k.startsWith('chitas_parasha') ||
              k.startsWith('chitas_sefer_hamitzvot'))
          ) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem('chitas_content_version', currentVersion);
      }
    } catch {
      // ignore
    }
  }, []);

  const [settings, setSettings] = useState<StudySettings>(() => {
    try {
      const saved = localStorage.getItem('chitas_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Local date (not UTC), so that after midnight in Israel progress is saved under the right day
  const dateKey = localDateKey(currentDate);

  const [progress, setProgress] = useState<DailyProgress>(() => loadProgress(dateKey) || emptyProgress(dateKey));


  // Sync dateInfo and parasha when currentDate changes
  useEffect(() => {
    const baseInfo = getHebrewDateInfo(currentDate);
    setDateInfo(baseInfo);

    getCurrentParashaInfo(currentDate).then((info) => {
      setDateInfo((prev) => ({
        ...prev,
        parashaName: info.name,
      }));
    });
  }, [currentDate, cityId, settings.inIsrael]);

  // Load progress corresponding to the selected date
  useEffect(() => {
    setProgress(loadProgress(dateKey) || emptyProgress(dateKey));
  }, [dateKey]);

  // Interface color theme (applied to <html> so modals and the page background follow it)
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      let mode = settings.theme;
      if (mode === 'system') {
        mode = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.classList.toggle('theme-dark', mode === 'dark');
      root.classList.toggle('theme-black', mode === 'black');
      root.style.setProperty('--torah-font', textFontFamily(settings.textFont));
    };
    apply();
    if (settings.theme === 'system' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', apply);
      return () => mq.removeEventListener?.('change', apply);
    }
  }, [settings.theme, settings.textFont]);

  useEffect(() => {
    try {
      localStorage.setItem('chitas_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    // Right after switching days, `progress` still holds the previous day until it is reloaded
    if (progress.date && progress.date !== dateKey) return;
    try {
      const isEmpty =
        !progress.chumash && !progress.tehillim && !progress.tanya && !progress.hayomYom && !progress.rambam &&
        !Object.values(progress.readItemIds || {}).some(Boolean);
      // Don't store days that were only viewed, so the calendar shows progress only where there is some
      if (!isEmpty || localStorage.getItem(`chitas_progress_${dateKey}`)) {
        localStorage.setItem(`chitas_progress_${dateKey}`, JSON.stringify({ ...progress, date: dateKey }));
      }
    } catch {
      // ignore
    }

  }, [progress, dateKey]);

  // Mark a batch of items (e.g. cascading verses) as read
  const handleMarkBatch = (ids: string[]) => {
    if (ids.length === 0) return;
    setProgress((prev) => {
      const updated = { ...(prev.readItemIds || {}) };
      ids.forEach((id) => {
        updated[id] = true;
      });
      return {
        ...prev,
        readItemIds: updated,
      };
    });
    setUndoStack((prev) => [...prev, ids]);
  };

  // Mark an individual item (verse, psalm, paragraph) as read via swipe to right
  const handleMarkItemRead = (id: string) => {
    setProgress((prev) => {
      const currentRead = Boolean(prev.readItemIds?.[id]);
      const nextRead = !currentRead;
      const updatedReadItemIds = {
        ...(prev.readItemIds || {}),
        [id]: nextRead,
      };

      if (nextRead) {
        setUndoStack((stack) => [...stack, [id]]);
      } else {
        setUndoStack((stack) => stack.filter((batch) => !batch.includes(id)));
      }

      return {
        ...prev,
        readItemIds: updatedReadItemIds,
      };
    });
  };

  // Undo button (small backward arrow at top)
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastBatch = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    setProgress((prev) => {
      const updatedReadItemIds = { ...(prev.readItemIds || {}) };
      lastBatch.forEach((id) => {
        updatedReadItemIds[id] = false;
      });

      return {
        ...prev,
        readItemIds: updatedReadItemIds,
      };
    });
  };

  const handleSetProgressCompleted = (key: DailyStudyKey, completed: boolean) => {
    setProgress((prev) => {
      let updatedReadItemIds = { ...(prev.readItemIds || {}) };
      if (!completed) {
        // If unmarking / resetting, clear all read item IDs for this key
        Object.keys(updatedReadItemIds).forEach((id) => {
          if (id.startsWith(key)) {
            updatedReadItemIds[id] = false;
          }
        });
      }
      return {
        ...prev,
        [key]: completed,
        readItemIds: updatedReadItemIds,
      };
    });
  };

  const handleToggleProgress = (key: DailyStudyKey) => {
    setProgress((prev) => {
      const nextVal = !prev[key];
      let updatedReadItemIds = { ...(prev.readItemIds || {}) };
      if (!nextVal) {
        // If unmarking / canceling, clear all read item IDs for this key
        Object.keys(updatedReadItemIds).forEach((id) => {
          if (id.startsWith(key)) {
            updatedReadItemIds[id] = false;
          }
        });
      }
      return {
        ...prev,
        [key]: nextVal,
        readItemIds: updatedReadItemIds,
      };
    });
  };

  const handleResetProgress = () => {
    setProgress(emptyProgress(dateKey));
    setUndoStack([]);
    setIsSettingsOpen(false);
  };

  const handleUpdateSettings = (newSettings: Partial<StudySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      // Saved right away: the parasha (Israel / Diaspora) is computed from the saved settings
      try {
        localStorage.setItem('chitas_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const SECTIONS_SEQUENCE: StudyCategory[] = sectionSequence(settings.enabledLessons);
  const advanceFrom = (cat: StudyCategory) => {
    setCurrentCategory(nextSection(cat, settings.enabledLessons));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchOnVerseCardRef = useRef<boolean>(false);

  const goToNextSection = () => {
    const currentIndex = SECTIONS_SEQUENCE.indexOf(currentCategory);
    if (currentIndex !== -1 && currentIndex < SECTIONS_SEQUENCE.length - 1) {
      setCurrentCategory(SECTIONS_SEQUENCE[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevSection = () => {
    const currentIndex = SECTIONS_SEQUENCE.indexOf(currentCategory);
    if (currentIndex > 0) {
      setCurrentCategory(SECTIONS_SEQUENCE[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    const target = e.target as HTMLElement;
    touchOnVerseCardRef.current = Boolean(
      target.closest(
        '[data-swipe-verse="true"], [data-swipe-card="true"], [data-swipe="true"], .cursor-grab, [drag="x"], button, a, input, [role="button"]'
      )
    );
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    if (touchOnVerseCardRef.current) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      return;
    }

    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Detect horizontal swipe across the page background
    if (Math.abs(diffX) > 85 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      // Swiping page to the right navigates to the next section
      if (diffX > 0) {
        goToNextSection();
      } else {
        goToPrevSection();
      }
    }
  };

  // In the dark / black themes the color scales are mirrored (see themes.css), so the
  // light classes below render dark there.
  const getThemeClass = () => {
    if (settings.theme === 'parchment') return 'bg-amber-50/30 text-stone-900 min-h-screen';
    return 'bg-white text-stone-900 min-h-screen';
  };

  const handleCityChanged = (city: { id: string }) => {
    setCityId(`${city.id}_${Date.now()}`);
  };

  return (
    <div className={getThemeClass()} dir="rtl">
      {/* Top Header with navigation, green checkmarks on completed items, and small undo arrow */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        progress={progress}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenZmanim={() => setIsZmanimOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        canUndo={undoStack.length > 0}
        onUndo={handleUndo}
        fontSize={settings.fontSize}
        onChangeFontSize={(size) => handleUpdateSettings({ fontSize: size })}
        enabledLessons={settings.enabledLessons}
      />

      {/* Date Navigation & Calendar Selector Bar */}
      <DateSelectorBar
        key={`date_${cityId}`}
        currentDate={currentDate}
        dateInfo={dateInfo}
        onSelectDate={(newDate) => {
          setCurrentDate(newDate);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area with page swipe gesture support */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
      >

        {/* Dynamic Category Views */}
        {currentCategory === 'overview' && (
          <DailyOverview
            key={`overview_${cityId}`}
            dateInfo={dateInfo}
            rambamTrack={settings.rambamTrack}
            progress={progress}
            onToggleProgress={handleToggleProgress}
            onSelectCategory={setCurrentCategory}
            enabledLessons={settings.enabledLessons}
          />
        )}

        {currentCategory === 'chumash' && (
          <ChumashViewer
            key={`chumash_${cityId}_${settings.inIsrael}`}
            dateInfo={dateInfo}
            isCompleted={progress.chumash}
            onToggleCompleted={() => handleToggleProgress('chumash')}
            onSetCompleted={(val) => handleSetProgressCompleted('chumash', val)}
            settings={settings}
            readItemIds={progress.readItemIds || {}}
            onMarkItemRead={handleMarkItemRead}
            onMarkVersesBatch={handleMarkBatch}
            onAdvanceToNext={() => advanceFrom('chumash')}
          />
        )}

        {currentCategory === 'tehillim' && (
          <TehillimViewer
            dateInfo={dateInfo}
            isCompleted={progress.tehillim}
            onToggleCompleted={() => handleToggleProgress('tehillim')}
            onSetCompleted={(val) => handleSetProgressCompleted('tehillim', val)}
            settings={settings}
            readItemIds={progress.readItemIds || {}}
            onMarkItemRead={handleMarkItemRead}
            onMarkBatch={handleMarkBatch}
            onAdvanceToNext={() => advanceFrom('tehillim')}
          />
        )}

        {currentCategory === 'tanya' && (
          <TanyaViewer
            dateInfo={dateInfo}
            isCompleted={progress.tanya}
            onToggleCompleted={() => handleToggleProgress('tanya')}
            onSetCompleted={(val) => handleSetProgressCompleted('tanya', val)}
            settings={settings}
            readItemIds={progress.readItemIds || {}}
            onMarkItemRead={handleMarkItemRead}
            onAdvanceToNext={() => advanceFrom('tanya')}
          />
        )}

        {currentCategory === 'hayom_yom' && (
          <HayomYomViewer
            dateInfo={dateInfo}
            isCompleted={progress.hayomYom}
            onToggleCompleted={() => handleToggleProgress('hayomYom')}
            onSetCompleted={(val) => handleSetProgressCompleted('hayomYom', val)}
            readItemIds={progress.readItemIds || {}}
            onMarkItemRead={handleMarkItemRead}
            onAdvanceToNext={() => advanceFrom('hayom_yom')}
          />
        )}

        {currentCategory === 'rambam' && (
          <RambamViewer
            dateInfo={dateInfo}
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateTrack={(t) => handleUpdateSettings({ rambamTrack: t })}
            isCompleted={progress.rambam}
            onToggleCompleted={() => handleToggleProgress('rambam')}
            onSetCompleted={(done) => {
              if (progress.rambam !== done) handleToggleProgress('rambam');
            }}
            readItemIds={progress.readItemIds || {}}
            onMarkItemRead={handleMarkItemRead}
            onMarkBatch={handleMarkBatch}
            onAdvanceToNext={() => advanceFrom('rambam')}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="mt-16 border-t border-amber-900/10 bg-amber-50/40 py-8 text-stone-600 text-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 font-torah text-base">חִתַּ״ת יומי</span>
            <span aria-hidden="true">·</span>
            <span>חומש, תהילים, תניא, היום יום ורמב״ם</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-amber-900 transition-colors cursor-pointer"
            >
              הגדרות קריאה
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => window.print()}
              className="hover:text-amber-900 transition-colors cursor-pointer"
            >
              הדפסת שיעור
            </button>
            <span aria-hidden="true">·</span>
            <a href="/sources.html" className="hover:text-amber-900 transition-colors">
              מקורות
            </a>
            <span aria-hidden="true">·</span>
            <a href="/privacy.html" className="hover:text-amber-900 transition-colors">
              מדיניות פרטיות
            </a>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <StudySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetProgress={handleResetProgress}
        onCityChanged={handleCityChanged}
      />

      {/* Halachic Zmanim Modal */}
      <ZmanimModal
        isOpen={isZmanimOpen}
        onClose={() => setIsZmanimOpen(false)}
        initialDate={currentDate}
        onCityChanged={handleCityChanged}
      />

      {/* First launch: which lessons to learn and which Rambam track */}
      {!settings.onboardingDone && (
        <OnboardingModal
          settings={settings}
          onDone={(update: Partial<StudySettings>) => handleUpdateSettings({ ...update, onboardingDone: true })}
        />
      )}

      {/* Calendar with daily study progress */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={currentDate}
        enabledLessons={settings.enabledLessons}
        onSelectDate={(d) => {
          setCurrentDate(d);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Bottom Floating Install Prompt (triggers direct install / home screen shortcut action) */}
      <BottomInstallPrompt />

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
