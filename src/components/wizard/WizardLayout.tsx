import { useState, useCallback } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { WIZARD_STEPS } from '../../types/character';
import type { WizardStepId } from '../../types/character';
import type { CharacterData } from '../../types/character';
import { CharacterPreview } from './CharacterPreview';
import { GoldButton } from '../ui/GoldButton';
import { exportCharacterPdf } from '../../engine/pdf-exporter';
import { getSavedCharacters, deleteCharacter } from '../../engine/character-storage';
import type { SavedCharacter } from '../../engine/character-storage';

const STEP_LABELS: Record<WizardStepId, string> = {
  welcome: 'Start',
  ancestry: 'Ancestry',
  'ancestry-traits': 'Traits',
  culture: 'Culture',
  career: 'Career',
  class: 'Class',
  subclass: 'Subclass',
  characteristics: 'Stats',
  kit: 'Kit',
  abilities: 'Abilities',
  complication: 'Complication',
  details: 'Details',
  model: 'Model',
  review: 'Review',
};

function formatId(id: string): string {
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function SavedCharactersModal({
  onClose,
  onLoad,
}: {
  onClose: () => void;
  onLoad: (data: CharacterData) => void;
}) {
  const [chars, setChars] = useState<SavedCharacter[]>(() => getSavedCharacters());

  const handleDelete = useCallback((id: string) => {
    deleteCharacter(id);
    setChars(getSavedCharacters());
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg max-h-[80vh] flex flex-col rounded-lg border border-gold-dark/40 bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gold/10 px-5 py-4">
          <h2 className="font-heading text-lg uppercase tracking-wider text-gold">Saved Characters</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 font-heading text-sm text-gold-muted hover:text-gold transition-colors"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {chars.length === 0 ? (
            <p className="text-center font-body text-sm text-cream-dark/50 italic py-8">
              No saved characters yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {chars.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border border-gold-dark/30 bg-surface-light px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-gold-light truncate">
                      {entry.name}
                    </p>
                    <p className="font-body text-xs text-cream-dark/60">
                      Level {entry.data.level}
                      {entry.data.ancestryId ? ` ${formatId(entry.data.ancestryId)}` : ''}
                      {entry.data.classChoice?.classId ? ` ${formatId(entry.data.classChoice.classId)}` : ''}
                      {' — '}
                      {new Date(entry.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      className="rounded bg-gold/20 px-3 py-1.5 font-heading text-xs font-semibold text-gold-light hover:bg-gold/30 transition-colors"
                      onClick={() => { onLoad(entry.data); onClose(); }}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="rounded bg-crimson/15 px-3 py-1.5 font-heading text-xs font-semibold text-crimson hover:bg-crimson/25 transition-colors"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface WizardLayoutProps {
  children: React.ReactNode;
}

export function WizardLayout({ children }: WizardLayoutProps) {
  const character = useCharacterStore((s) => s.character);
  const currentStep = useCharacterStore((s) => s.currentStep);
  const setStep = useCharacterStore((s) => s.setStep);
  const nextStep = useCharacterStore((s) => s.nextStep);
  const prevStep = useCharacterStore((s) => s.prevStep);
  const resetCharacter = useCharacterStore((s) => s.resetCharacter);
  const [exporting, setExporting] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const currentIndex = WIZARD_STEPS.indexOf(currentStep);
  const isWelcome = currentStep === 'welcome';
  const isLast = currentIndex === WIZARD_STEPS.length - 1;

  async function handleExport() {
    setExporting(true);
    try {
      await exportCharacterPdf(character);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  }

  function handleNewCharacter() {
    resetCharacter();
    setStep('welcome');
  }

  function handleLoadCharacter(data: CharacterData) {
    resetCharacter();
    useCharacterStore.setState({ character: { ...data }, currentStep: 'review' });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Compact Progress Bar */}
      {!isWelcome && (
        <nav className="shrink-0 border-b border-gold/10 bg-ink/80 px-2 py-2">
          <div className="mx-auto flex max-w-6xl items-center gap-1">
            {/* Nav action buttons */}
            <button
              type="button"
              onClick={handleNewCharacter}
              className="shrink-0 rounded px-2 py-1 font-heading text-[0.55rem] sm:text-[0.6rem] tracking-wide text-gold-muted hover:text-gold hover:bg-gold/5 transition-all"
              title="New Character"
            >
              + New
            </button>
            <button
              type="button"
              onClick={() => setShowSaved(true)}
              className="shrink-0 rounded px-2 py-1 font-heading text-[0.55rem] sm:text-[0.6rem] tracking-wide text-gold-muted hover:text-gold hover:bg-gold/5 transition-all"
              title="Saved Characters"
            >
              Saved
            </button>
            <div className="mx-1 h-4 w-px bg-gold-dark/30" />
            {WIZARD_STEPS.filter((_, i) => i > 0).map((step, i) => {
              const realIndex = i + 1;
              const isPast = realIndex < currentIndex;
              const isCurrent = realIndex === currentIndex;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => isPast && setStep(step)}
                  className={[
                    'flex-1 py-1 text-center font-heading transition-all duration-200 rounded',
                    'text-[0.55rem] sm:text-[0.6rem] tracking-wide',
                    isCurrent
                      ? 'bg-gold/15 text-gold-light font-semibold'
                      : isPast
                        ? 'text-gold-muted hover:text-gold cursor-pointer hover:bg-gold/5'
                        : 'text-cream-dark/30 cursor-default',
                  ].join(' ')}
                >
                  {STEP_LABELS[step]}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1">
        {/* Scrollable Content */}
        <main className={`flex-1 overflow-y-auto ${isWelcome ? '' : 'px-4 py-6 lg:px-8'}`}>
          <div className={isWelcome ? '' : 'mx-auto max-w-4xl'}>
            {children}
          </div>
        </main>

        {/* Sidebar Preview (hidden on welcome + mobile) */}
        {!isWelcome && (
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-gold/10 bg-ink/50 xl:block">
            <CharacterPreview />
          </aside>
        )}
      </div>

      {/* Bottom Nav */}
      {!isWelcome && (
        <footer className="shrink-0 border-t border-gold/10 bg-ink/60 px-4 py-2.5">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <GoldButton variant="secondary" onClick={prevStep}>
              Back
            </GoldButton>
            <span className="font-heading text-[0.6rem] uppercase tracking-widest text-gold-muted">
              {currentIndex} / {WIZARD_STEPS.length - 1}
            </span>
            <GoldButton
              onClick={isLast ? handleExport : nextStep}
              disabled={isLast && exporting}
            >
              {isLast ? (exporting ? 'Exporting...' : 'Export PDF') : 'Continue'}
            </GoldButton>
          </div>
        </footer>
      )}

      {/* Saved Characters Modal */}
      {showSaved && (
        <SavedCharactersModal
          onClose={() => setShowSaved(false)}
          onLoad={handleLoadCharacter}
        />
      )}
    </div>
  );
}
