import { useState, useCallback, useRef, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { usePlayStore } from '../../stores/play-store';
import { updateSavedCharacter } from '../../engine/character-storage';
import { exportAllData } from '../../engine/data-export';
import { PlayCombat } from './PlayCombat';
import { PlayAbilities } from './PlayAbilities';
import { PlayActions } from './PlayActions';
import { PlaySheet } from './PlaySheet';
import { PlayProgression } from './PlayProgression';
import { PlayInventory } from './PlayInventory';

class TabErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Tab render error:', error, info); }
  componentDidUpdate(prevProps: { children: ReactNode }) {
    if (prevProps.children !== this.props.children && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="text-center py-12">
          <p className="font-heading text-sm text-crimson mb-2">Something went wrong rendering this tab.</p>
          <p className="font-body text-xs text-cream-dark/40 mb-4">{this.state.error.message}</p>
          <button type="button" onClick={() => { this.setState({ error: null }); this.props.onReset(); }}
            className="px-4 py-2 rounded-xl border border-gold/30 font-heading text-xs uppercase tracking-wider text-gold-muted hover:text-gold">
            Go to Combat Tab
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type PlayTab = 'combat' | 'actions' | 'abilities' | 'inventory' | 'sheet' | 'progress';

const TABS: { id: PlayTab; label: string; icon: string }[] = [
  { id: 'combat', label: 'Combat', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { id: 'actions', label: 'Actions', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'abilities', label: 'Abilities', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { id: 'inventory', label: 'Loot', icon: 'M21 8l-2-4H5L3 8m18 0v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8m18 0H3m9 4v4m-2-2h4' },
  { id: 'sheet', label: 'Sheet', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
  { id: 'progress', label: 'Progress', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
];

export function PlayMode() {
  const [activeTab, setActiveTab] = useState<PlayTab>('combat');
  const [showMenu, setShowMenu] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [saveFlash, setSaveFlash] = useState(false);
  const character = useCharacterStore((s) => s.character);
  const setMode = useCharacterStore((s) => s.setMode);
  const playingCharacterId = useCharacterStore((s) => s.playingCharacterId);
  const playState = usePlayStore((s) => {
    const id = s.activeCharacterId;
    return id ? s.states[id] ?? null : null;
  });

  const saveProgress = useCallback(() => {
    if (playingCharacterId) {
      updateSavedCharacter(playingCharacterId, character);
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1500);
    }
  }, [playingCharacterId, character]);

  const handleSaveAndExit = useCallback(() => {
    if (playingCharacterId) {
      updateSavedCharacter(playingCharacterId, character);
    }
    setMode('create');
    useCharacterStore.setState({ currentStep: 'welcome' });
  }, [playingCharacterId, character, setMode]);

  const handleExport = useCallback(() => {
    if (playingCharacterId) {
      updateSavedCharacter(playingCharacterId, character);
    }
    exportAllData();
    setShowMenu(false);
  }, [playingCharacterId, character]);

  if (!playState) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-lg text-gold">No play state found</p>
          <button
            type="button"
            className="btn-secondary mt-4 px-6 py-2"
            onClick={() => {
              setMode('create');
              useCharacterStore.setState({ currentStep: 'welcome' });
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const classId = character.classChoice?.classId;
  const displayName = character.name || 'Unnamed Hero';

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="shrink-0 px-2 sm:px-3 pt-2 sm:pt-3">
        <div className="mx-auto max-w-4xl panel-glass rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="font-heading text-sm sm:text-base text-gold-light tracking-wide truncate">
              {displayName}
            </h1>
            <span className="badge shrink-0">Lv {character.level}</span>
            {classId && (
              <span className="hidden sm:inline badge badge-accent">
                {classId.charAt(0).toUpperCase() + classId.slice(1)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 relative">
            {/* Save button */}
            <button
              type="button"
              onClick={saveProgress}
              disabled={!playingCharacterId}
              className={[
                'rounded-xl p-2 transition-all',
                saveFlash
                  ? 'text-gold bg-gold/15'
                  : 'text-gold-muted hover:text-gold hover:bg-gold/8',
                !playingCharacterId ? 'opacity-30 cursor-not-allowed' : '',
              ].join(' ')}
              title="Save progress"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                {saveFlash ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </>
                )}
              </svg>
            </button>

            {/* Menu button */}
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-xl p-2 text-gold-muted hover:text-gold hover:bg-gold/8 transition-all"
              title="Menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Dropdown menu — rendered outside header to escape backdrop-filter stacking context */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div
            className="fixed z-50 w-52 panel-glass rounded-xl border border-gold/15 shadow-xl py-1.5"
            style={{
              top: menuBtnRef.current ? menuBtnRef.current.getBoundingClientRect().bottom + 8 : 60,
              right: menuBtnRef.current ? window.innerWidth - menuBtnRef.current.getBoundingClientRect().right : 8,
            }}
          >
            <button
              type="button"
              onClick={() => { saveProgress(); setShowMenu(false); }}
              disabled={!playingCharacterId}
              className="w-full px-4 py-2.5 text-left font-heading text-xs uppercase tracking-wider text-gold-light hover:bg-gold/8 transition-all flex items-center gap-2.5 disabled:opacity-30"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Progress
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="w-full px-4 py-2.5 text-left font-heading text-xs uppercase tracking-wider text-gold-light hover:bg-gold/8 transition-all flex items-center gap-2.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Backup
            </button>
            <div className="border-t border-gold/10 my-1.5" />
            <button
              type="button"
              onClick={() => { setShowMenu(false); setMode('create'); useCharacterStore.setState({ currentStep: 'review' }); }}
              className="w-full px-4 py-2.5 text-left font-heading text-xs uppercase tracking-wider text-gold-light hover:bg-gold/8 transition-all flex items-center gap-2.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Character
            </button>
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="w-full px-4 py-2.5 text-left font-heading text-xs uppercase tracking-wider text-crimson/80 hover:bg-crimson/8 transition-all flex items-center gap-2.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Save &amp; Exit
            </button>
          </div>
        </>
      )}

      {/* Save flash notification */}
      {saveFlash && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-gold/15 border border-gold/30 font-heading text-xs uppercase tracking-wider text-gold shadow-lg" style={{ animation: 'fadeInUp 0.2s ease-out' }}>
          Progress saved
        </div>
      )}

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-4">
        <div className="mx-auto max-w-4xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
          <TabErrorBoundary onReset={() => setActiveTab('combat')}>
            {activeTab === 'combat' && <PlayCombat />}
            {activeTab === 'actions' && <PlayActions />}
            {activeTab === 'abilities' && <PlayAbilities />}
            {activeTab === 'inventory' && <PlayInventory />}
            {activeTab === 'sheet' && <PlaySheet />}
            {activeTab === 'progress' && <PlayProgression />}
          </TabErrorBoundary>
        </div>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="shrink-0 px-2 sm:px-3 pb-2 sm:pb-3 pt-1">
        <div className="mx-auto max-w-4xl panel-glass rounded-2xl px-2 py-1.5 flex items-center justify-around">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex flex-col items-center gap-0.5 px-3 sm:px-5 py-1.5 rounded-xl transition-all',
                  isActive
                    ? 'text-gold-light bg-gold/10'
                    : 'text-cream-dark/40 hover:text-gold-muted',
                ].join(' ')}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d={tab.icon} />
                </svg>
                <span className="font-heading text-[0.55rem] uppercase tracking-wider">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
