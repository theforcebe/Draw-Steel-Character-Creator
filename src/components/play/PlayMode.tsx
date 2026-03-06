import { useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { usePlayStore } from '../../stores/play-store';
import { PlayCombat } from './PlayCombat';
import { PlayAbilities } from './PlayAbilities';
import { PlaySheet } from './PlaySheet';
import { PlayProgression } from './PlayProgression';

type PlayTab = 'combat' | 'abilities' | 'sheet' | 'progress';

const TABS: { id: PlayTab; label: string; icon: string }[] = [
  { id: 'combat', label: 'Combat', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { id: 'abilities', label: 'Abilities', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { id: 'sheet', label: 'Sheet', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8' },
  { id: 'progress', label: 'Progress', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
];

export function PlayMode() {
  const [activeTab, setActiveTab] = useState<PlayTab>('combat');
  const character = useCharacterStore((s) => s.character);
  const setMode = useCharacterStore((s) => s.setMode);
  const playState = usePlayStore((s) => {
    const id = s.activeCharacterId;
    return id ? s.states[id] ?? null : null;
  });

  if (!playState) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-lg text-gold">No play state found</p>
          <button
            type="button"
            className="btn-secondary mt-4 px-6 py-2"
            onClick={() => setMode('create')}
          >
            Back to Creator
          </button>
        </div>
      </div>
    );
  }

  const classId = character.classChoice?.classId;
  const displayName = character.name || 'Unnamed Hero';

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-2 sm:px-3 pt-2 sm:pt-3">
        <div className="mx-auto max-w-4xl panel-glass rounded-2xl px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
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
          <button
            type="button"
            onClick={() => setMode('create')}
            className="shrink-0 rounded-xl px-3 py-1.5 font-heading text-[0.6rem] tracking-wider text-gold-muted hover:text-gold hover:bg-gold/8 transition-all uppercase"
          >
            Creator
          </button>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-4">
        <div className="mx-auto max-w-4xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
          {activeTab === 'combat' && <PlayCombat />}
          {activeTab === 'abilities' && <PlayAbilities />}
          {activeTab === 'sheet' && <PlaySheet />}
          {activeTab === 'progress' && <PlayProgression />}
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
