import { useState, useCallback } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { usePlayStore } from '../../stores/play-store';
import { WIZARD_STEPS } from '../../types/character';
import type { WizardStepId } from '../../types/character';
import type { CharacterData } from '../../types/character';
import { CharacterPreview } from './CharacterPreview';
import { GoldButton } from '../ui/GoldButton';
import { exportCharacterPdf } from '../../engine/pdf-exporter';
import { getSavedCharacters, deleteCharacter } from '../../engine/character-storage';
import { computeAllStats } from '../../engine/stat-calculator';
import { getComplicationStatBonuses } from '../../engine/complication-stats';
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
    usePlayStore.getState().deletePlayState(id);
    setChars(getSavedCharacters());
  }, []);

  const handlePlay = useCallback((entry: SavedCharacter) => {
    const data = entry.data;
    const compBonuses = getComplicationStatBonuses(data.complication, data.level);
    const stats = computeAllStats({
      level: data.level,
      ancestryId: data.ancestryId,
      formerLifeAncestryId: data.formerLifeAncestryId,
      classId: data.classChoice?.classId ?? null,
      kitId: data.classChoice?.kitId ?? null,
      selectedTraits: data.selectedTraits,
      complicationBonuses: compBonuses,
    });
    const charWithStats = { ...data, computedStats: stats ?? data.computedStats };

    useCharacterStore.setState({
      character: charWithStats,
      playingCharacterId: entry.id,
      mode: 'play',
    });

    const stamina = stats?.stamina ?? data.computedStats?.stamina ?? 21;
    const recoveries = stats?.recoveries ?? data.computedStats?.recoveries ?? 8;
    const recoveryValue = stats?.recoveryValue ?? data.computedStats?.recoveryValue ?? 7;
    usePlayStore.getState().initPlayState(entry.id, stamina, recoveries, recoveryValue);
    onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl panel-glass frame-corners shadow-2xl"
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gold/10 px-6 py-5">
          <h2 className="font-heading text-lg uppercase tracking-wider text-gold">Saved Characters</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 font-heading text-sm text-gold-muted hover:text-gold hover:bg-gold/10 transition-all"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {chars.length === 0 ? (
            <p className="text-center font-body text-sm text-cream-dark/50 italic py-8">
              No saved characters yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {chars.map((entry) => (
                <div key={entry.id} className="card flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-gold-light truncate">
                      {entry.name}
                    </p>
                    <p className="font-body text-xs text-cream-dark/60 mt-0.5">
                      Level {entry.data.level}
                      {entry.data.ancestryId ? ` ${formatId(entry.data.ancestryId)}` : ''}
                      {entry.data.classChoice?.classId ? ` ${formatId(entry.data.classChoice.classId)}` : ''}
                      {' — '}
                      {new Date(entry.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {entry.data.classChoice && (
                      <button
                        type="button"
                        className="rounded-xl bg-gold/15 px-3.5 py-2 font-heading text-xs font-semibold text-gold hover:bg-gold/25 transition-all border border-gold/20 hover:border-gold/40"
                        onClick={() => handlePlay(entry)}
                      >
                        Play
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-xl bg-gold/10 px-3.5 py-2 font-heading text-xs font-semibold text-gold-light hover:bg-gold/20 transition-all border border-gold/10 hover:border-gold/30"
                      onClick={() => { onLoad(entry.data); onClose(); }}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-crimson/8 px-3.5 py-2 font-heading text-xs font-semibold text-crimson hover:bg-crimson/15 transition-all border border-crimson/10 hover:border-crimson/25"
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

  const stepsToShow = WIZARD_STEPS.filter((_, i) => i > 0);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ──── Top Navigation ──── */}
      {!isWelcome && (
        <nav className="shrink-0 px-2 sm:px-3 pt-2 sm:pt-3 pb-1">
          <div className="mx-auto max-w-6xl panel-glass rounded-2xl px-2 py-2">
            {/* Mobile: compact row with current step + nav arrows */}
            <div className="flex sm:hidden items-center gap-1 px-1">
              <button
                type="button"
                onClick={handleNewCharacter}
                className="shrink-0 rounded-xl px-2 py-1.5 font-heading text-[0.55rem] tracking-wider text-gold-muted hover:text-gold transition-all uppercase"
              >
                + New
              </button>
              <button
                type="button"
                onClick={() => setShowSaved(true)}
                className="shrink-0 rounded-xl px-2 py-1.5 font-heading text-[0.55rem] tracking-wider text-gold-muted hover:text-gold transition-all uppercase"
              >
                Saved
              </button>
              <div className="flex-1 text-center">
                <span className="font-heading text-[0.65rem] uppercase tracking-wider text-gold-light font-semibold">
                  {STEP_LABELS[currentStep]}
                </span>
              </div>
              <span className="font-heading text-[0.55rem] text-gold-muted tracking-wider">
                {currentIndex}/{WIZARD_STEPS.length - 1}
              </span>
            </div>

            {/* Desktop: full step bar */}
            <div className="hidden sm:flex items-center gap-1">
              {/* Action buttons */}
              <button
                type="button"
                onClick={handleNewCharacter}
                className="shrink-0 rounded-xl px-3 py-2 font-heading text-[0.6rem] tracking-wider text-gold-muted hover:text-gold hover:bg-gold/8 transition-all uppercase"
                title="New Character"
              >
                + New
              </button>
              <button
                type="button"
                onClick={() => setShowSaved(true)}
                className="shrink-0 rounded-xl px-3 py-2 font-heading text-[0.6rem] tracking-wider text-gold-muted hover:text-gold hover:bg-gold/8 transition-all uppercase"
                title="Saved Characters"
              >
                Saved
              </button>

              {/* Separator */}
              <div className="mx-2 h-5 w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent" />

              {/* Step buttons */}
              {stepsToShow.map((step, i) => {
                const realIndex = i + 1;
                const isPast = realIndex < currentIndex;
                const isCurrent = realIndex === currentIndex;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => isPast && setStep(step)}
                    className={[
                      'flex-1 py-2 text-center font-heading transition-all duration-300 rounded-xl relative',
                      'text-[0.55rem] lg:text-[0.6rem] tracking-wider uppercase',
                      isCurrent
                        ? 'nav-step-active'
                        : isPast
                          ? 'text-gold-muted/80 hover:text-gold cursor-pointer hover:bg-gold/5'
                          : 'text-cream-dark/20 cursor-default',
                    ].join(' ')}
                  >
                    {STEP_LABELS[step]}
                  </button>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-2 mb-1">
              {stepsToShow.map((step, i) => {
                const realIndex = i + 1;
                return (
                  <div
                    key={step}
                    className={[
                      'progress-dot',
                      realIndex === currentIndex ? 'progress-dot-active' : '',
                      realIndex < currentIndex ? 'progress-dot-past' : '',
                    ].join(' ')}
                  />
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* ──── Main Content Area ──── */}
      <div className="flex min-h-0 flex-1">
        {/* Scrollable Content */}
        <main className={`flex-1 overflow-y-auto ${isWelcome ? '' : 'px-3 py-4 sm:px-4 sm:py-6 lg:px-8'}`}>
          <div className={isWelcome ? '' : 'mx-auto max-w-4xl'} style={!isWelcome ? { animation: 'fadeInUp 0.4s ease-out' } : undefined}>
            {children}
          </div>
        </main>

        {/* ──── Sidebar ──── */}
        {!isWelcome && (
          <aside className="hidden w-72 shrink-0 overflow-y-auto xl:block p-3 pl-0">
            <div className="h-full rounded-2xl panel-glass frame-corners overflow-hidden">
              {/* Sidebar header */}
              <div className="px-4 py-3 border-b border-gold/8">
                <p className="font-heading text-[0.6rem] uppercase tracking-[0.2em] text-gold-muted text-center">
                  Character Sheet
                </p>
              </div>
              <CharacterPreview />
            </div>
          </aside>
        )}
      </div>

      {/* ──── Bottom Nav ──── */}
      {!isWelcome && (
        <footer className="shrink-0 px-2 sm:px-3 pb-2 sm:pb-3 pt-1">
          <div className="mx-auto max-w-4xl panel-glass rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
            <GoldButton variant="secondary" onClick={prevStep}>
              Back
            </GoldButton>

            {/* Step counter — hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold/20" />
              <span className="font-heading text-[0.65rem] uppercase tracking-[0.15em] text-gold-muted">
                Step {currentIndex} of {WIZARD_STEPS.length - 1}
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold/20" />
            </div>

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
