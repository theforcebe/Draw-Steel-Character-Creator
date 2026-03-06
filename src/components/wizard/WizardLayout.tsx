import { useState, useCallback } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { usePlayStore } from '../../stores/play-store';
import type { CharacterData } from '../../types/character';
import { GoldButton } from '../ui/GoldButton';
import { exportCharacterPdf } from '../../engine/pdf-exporter';
import { getSavedCharacters, deleteCharacter } from '../../engine/character-storage';
import { computeAllStats } from '../../engine/stat-calculator';
import { getComplicationStatBonuses } from '../../engine/complication-stats';
import {
  CATEGORIES,
  getCategoryCompletion,
  getCategoryForStep,
  getOverallCompletion,
} from '../../engine/category-completion';
import type { SavedCharacter } from '../../engine/character-storage';

/* ─── Helpers ─── */

function formatId(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/* ─── Category Icons ─── */

function CategoryIcon({ id, className = '' }: { id: string; className?: string }) {
  const shared = {
    className,
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (id) {
    case 'ancestry':
      return (
        <svg {...shared}>
          <circle cx="12" cy="8" r="4" />
          <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        </svg>
      );
    case 'culture':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      );
    case 'career':
      return (
        <svg {...shared}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        </svg>
      );
    case 'class':
      return (
        <svg {...shared}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'complication':
      return (
        <svg {...shared}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'details':
      return (
        <svg {...shared}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8M16 17H8M10 9H8" />
        </svg>
      );
    default:
      return null;
  }
}

/* ─── Saved Characters Modal (unchanged) ─── */

function SavedCharactersModal({
  onClose,
  onLoad,
}: {
  onClose: () => void;
  onLoad: (data: CharacterData) => void;
}) {
  const [chars, setChars] = useState<SavedCharacter[]>(() => getSavedCharacters());

  const handleDelete = useCallback(
    (id: string) => {
      deleteCharacter(id);
      usePlayStore.getState().deletePlayState(id);
      setChars(getSavedCharacters());
    },
    [],
  );

  const handlePlay = useCallback(
    (entry: SavedCharacter) => {
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
    },
    [onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl panel-glass frame-corners shadow-2xl"
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gold/10 px-6 py-5">
          <h2 className="font-heading text-lg uppercase tracking-wider text-gold">
            Saved Characters
          </h2>
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
                <div
                  key={entry.id}
                  className="card flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-gold-light truncate">
                      {entry.name}
                    </p>
                    <p className="font-body text-xs text-cream-dark/60 mt-0.5">
                      Level {entry.data.level}
                      {entry.data.ancestryId
                        ? ` ${formatId(entry.data.ancestryId)}`
                        : ''}
                      {entry.data.classChoice?.classId
                        ? ` ${formatId(entry.data.classChoice.classId)}`
                        : ''}
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
                      onClick={() => {
                        onLoad(entry.data);
                        onClose();
                      }}
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

/* ─── Main Layout ─── */

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
  const validationError = useCharacterStore((s) => s.validationError);
  const clearValidationError = useCharacterStore((s) => s.clearValidationError);
  const [exporting, setExporting] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const isWelcome = currentStep === 'welcome';
  const isReview = currentStep === 'review';
  const currentCategory = getCategoryForStep(currentStep);
  const hasSubTabs = currentCategory != null && currentCategory.steps.length > 1;

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

  /* ── Welcome screen: full-screen, no sidebar ── */
  if (isWelcome) {
    return (
      <div className="h-screen overflow-y-auto">
        {children}
      </div>
    );
  }

  const overall = getOverallCompletion(character);
  const overallPct = overall.total > 0 ? Math.round((overall.completed / overall.total) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ════════════════════════════════════════════
          DESKTOP SIDEBAR
          ════════════════════════════════════════════ */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-gold/8 bg-gradient-to-b from-surface/95 to-ink/95 backdrop-blur-xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gold/8">
          <h1 className="font-display text-sm text-gold tracking-wider">Draw Steel</h1>
          <p className="font-heading text-[0.55rem] uppercase tracking-[0.2em] text-gold-muted mt-0.5">
            Character Creator
          </p>
        </div>

        {/* Overall progress */}
        <div className="px-5 py-3 border-b border-gold/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted">
              Overall Progress
            </span>
            <span className="font-heading text-[0.55rem] text-gold-light">
              {overall.completed}/{overall.total}
            </span>
          </div>
          <div className="h-1 rounded-full bg-surface-lighter overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Category navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const completion = getCategoryCompletion(cat, character);
            const isActive = currentCategory?.id === cat.id;
            const isComplete = completion.completed === completion.total;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setStep(cat.steps[0])}
                className={[
                  'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-gold/12 border border-gold/25'
                    : 'hover:bg-surface-lighter/50 border border-transparent',
                ].join(' ')}
              >
                <div className="flex items-center gap-2.5">
                  <CategoryIcon
                    id={cat.id}
                    className={[
                      'shrink-0 transition-colors',
                      isActive
                        ? 'text-gold'
                        : 'text-gold-muted/60 group-hover:text-gold-muted',
                    ].join(' ')}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={[
                          'font-heading text-xs uppercase tracking-wider truncate',
                          isActive
                            ? 'text-gold-light font-semibold'
                            : 'text-cream-dark/70',
                        ].join(' ')}
                      >
                        {cat.label}
                      </span>
                      <span
                        className={[
                          'font-heading text-[0.55rem] shrink-0',
                          isComplete ? 'text-gold' : 'text-cream-dark/40',
                        ].join(' ')}
                      >
                        {completion.completed}/{completion.total}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 h-0.5 rounded-full bg-surface-lighter overflow-hidden">
                      <div
                        className={[
                          'h-full rounded-full transition-all duration-500',
                          isComplete
                            ? 'bg-gold'
                            : completion.completed > 0
                              ? 'bg-gold-dark/80'
                              : 'bg-transparent',
                        ].join(' ')}
                        style={{ width: `${completion.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                {cat.optional && (
                  <span className="font-heading text-[0.45rem] uppercase tracking-wider text-cream-dark/30 ml-7">
                    Optional
                  </span>
                )}
              </button>
            );
          })}

          {/* Review & Export */}
          <div className="mt-2 pt-2 border-t border-gold/8">
            <button
              type="button"
              onClick={() => setStep('review')}
              className={[
                'w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2.5',
                isReview
                  ? 'bg-gold/12 border border-gold/25'
                  : 'hover:bg-surface-lighter/50 border border-transparent',
              ].join(' ')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isReview ? 'text-gold' : 'text-gold-muted/60'}
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span
                className={[
                  'font-heading text-xs uppercase tracking-wider',
                  isReview
                    ? 'text-gold-light font-semibold'
                    : 'text-cream-dark/70',
                ].join(' ')}
              >
                Review & Export
              </span>
            </button>
          </div>
        </nav>

        {/* Action buttons */}
        <div className="px-3 py-3 border-t border-gold/8 flex gap-2">
          <button
            type="button"
            onClick={handleNewCharacter}
            className="flex-1 rounded-xl px-3 py-2 font-heading text-[0.6rem] tracking-wider text-gold-muted hover:text-gold hover:bg-gold/8 transition-all uppercase border border-gold/10 hover:border-gold/25"
          >
            + New
          </button>
          <button
            type="button"
            onClick={() => setShowSaved(true)}
            className="flex-1 rounded-xl px-3 py-2 font-heading text-[0.6rem] tracking-wider text-gold-muted hover:text-gold hover:bg-gold/8 transition-all uppercase border border-gold/10 hover:border-gold/25"
          >
            Saved
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          MAIN CONTENT AREA
          ════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Mobile Top Bar ── */}
        <div className="lg:hidden shrink-0">
          {/* Header row */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gold/8">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNewCharacter}
                className="rounded-lg px-2 py-1.5 font-heading text-[0.55rem] text-gold-muted hover:text-gold transition-all uppercase"
              >
                + New
              </button>
              <button
                type="button"
                onClick={() => setShowSaved(true)}
                className="rounded-lg px-2 py-1.5 font-heading text-[0.55rem] text-gold-muted hover:text-gold transition-all uppercase"
              >
                Saved
              </button>
            </div>
            <span className="font-display text-xs text-gold tracking-wider">Draw Steel</span>
          </div>

          {/* Category pills — horizontal scroll */}
          <div className="flex overflow-x-auto gap-1.5 px-3 py-2 border-b border-gold/5 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const completion = getCategoryCompletion(cat, character);
              const isActive = currentCategory?.id === cat.id;
              const isComplete = completion.completed === completion.total;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStep(cat.steps[0])}
                  className={[
                    'shrink-0 px-3 py-1.5 rounded-full font-heading text-[0.6rem] uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5',
                    isActive
                      ? 'bg-gold/15 text-gold-light border border-gold/30 font-semibold'
                      : 'text-cream-dark/50 border border-transparent hover:text-cream-dark/70 hover:bg-surface-lighter/30',
                  ].join(' ')}
                >
                  {cat.label}
                  <span
                    className={[
                      'text-[0.5rem]',
                      isComplete ? 'text-gold' : 'text-cream-dark/30',
                    ].join(' ')}
                  >
                    {completion.completed}/{completion.total}
                  </span>
                </button>
              );
            })}
            {/* Review pill */}
            <button
              type="button"
              onClick={() => setStep('review')}
              className={[
                'shrink-0 px-3 py-1.5 rounded-full font-heading text-[0.6rem] uppercase tracking-wider transition-all whitespace-nowrap',
                isReview
                  ? 'bg-gold/15 text-gold-light border border-gold/30 font-semibold'
                  : 'text-cream-dark/50 border border-transparent hover:text-cream-dark/70',
              ].join(' ')}
            >
              Review
            </button>
          </div>
        </div>

        {/* ── Sub-tabs for multi-step categories ── */}
        {hasSubTabs && (
          <div className="shrink-0 flex gap-1 px-3 sm:px-4 py-2 border-b border-gold/5 overflow-x-auto scrollbar-hide">
            {currentCategory.steps.map((step) => {
              const isCurrent = currentStep === step;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setStep(step)}
                  className={[
                    'px-3 py-1.5 rounded-lg font-heading text-[0.6rem] uppercase tracking-wider transition-all whitespace-nowrap',
                    isCurrent
                      ? 'bg-gold/12 text-gold-light font-semibold border-b-2 border-gold'
                      : 'text-cream-dark/50 hover:text-cream-dark/70 hover:bg-surface-lighter/30',
                  ].join(' ')}
                >
                  {currentCategory.stepLabels[step]}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Scrollable Content ── */}
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
          <div
            className="mx-auto max-w-4xl"
            style={{ animation: 'fadeInUp 0.4s ease-out' }}
          >
            {children}
          </div>
        </main>

        {/* ── Bottom Nav ── */}
        <footer className="shrink-0 px-2 sm:px-3 pb-2 sm:pb-3 pt-1">
          {/* Validation error */}
          {validationError && (
            <div
              className="mx-auto max-w-4xl mb-2 px-4 py-2.5 rounded-xl bg-crimson/15 border border-crimson/30 flex items-center justify-between gap-3"
              style={{ animation: 'fadeInUp 0.2s ease-out' }}
            >
              <p className="font-heading text-xs uppercase tracking-wider text-crimson">
                {validationError}
              </p>
              <button
                type="button"
                onClick={clearValidationError}
                className="shrink-0 text-crimson/60 hover:text-crimson transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="mx-auto max-w-4xl panel-glass rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
            <GoldButton variant="secondary" onClick={prevStep}>
              Back
            </GoldButton>

            {/* Current position indicator */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold/20" />
              <span className="font-heading text-[0.65rem] uppercase tracking-[0.15em] text-gold-muted">
                {currentCategory ? currentCategory.label : 'Review'}
                {hasSubTabs && ` \u2014 ${currentCategory!.stepLabels[currentStep]}`}
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold/20" />
            </div>

            <GoldButton
              onClick={isReview ? handleExport : nextStep}
              disabled={isReview && exporting}
            >
              {isReview ? (exporting ? 'Exporting...' : 'Export PDF') : 'Continue'}
            </GoldButton>
          </div>
        </footer>
      </div>

      {/* ── Saved Characters Modal ── */}
      {showSaved && (
        <SavedCharactersModal
          onClose={() => setShowSaved(false)}
          onLoad={handleLoadCharacter}
        />
      )}
    </div>
  );
}
