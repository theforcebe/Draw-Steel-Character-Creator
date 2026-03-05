import { useState, useCallback } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { getSavedCharacters, deleteCharacter } from '../../engine/character-storage';
import type { SavedCharacter } from '../../engine/character-storage';
import type { CharacterData } from '../../types/character';

function getEchelon(level: number): number {
  return Math.floor((level - 1) / 3) + 1;
}

function formatId(id: string): string {
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function SavedCharacterCard({
  entry,
  onLoad,
  onDelete,
}: {
  entry: SavedCharacter;
  onLoad: (data: CharacterData) => void;
  onDelete: (id: string) => void;
}) {
  const d = entry.data;
  const date = new Date(entry.savedAt);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gold-dark/30 bg-surface-light px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold text-gold-light truncate">
          {entry.name}
        </p>
        <p className="font-body text-xs text-cream-dark/60">
          Level {d.level}
          {d.ancestryId ? ` ${formatId(d.ancestryId)}` : ''}
          {d.classChoice?.classId ? ` ${formatId(d.classChoice.classId)}` : ''}
          {' — '}
          {date.toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          className="rounded bg-gold/20 px-3 py-1.5 font-heading text-xs font-semibold text-gold-light hover:bg-gold/30 transition-colors"
          onClick={() => onLoad(entry.data)}
        >
          Load
        </button>
        <button
          type="button"
          className="rounded bg-crimson/15 px-3 py-1.5 font-heading text-xs font-semibold text-crimson hover:bg-crimson/25 transition-colors"
          onClick={() => onDelete(entry.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function WelcomeStep() {
  const { character, nextStep, resetCharacter } = useCharacterStore();
  const setLevel = useCharacterStore((s) => s.setLevel);
  const hasExistingCharacter = character.ancestryId !== null;
  const level = character.level;
  const echelon = getEchelon(level);

  const [savedChars, setSavedChars] = useState<SavedCharacter[]>(() => getSavedCharacters());

  const refreshSaved = useCallback(() => setSavedChars(getSavedCharacters()), []);

  const handleLoad = (data: CharacterData) => {
    // Replace the current character state with the saved one
    const store = useCharacterStore.getState();
    store.resetCharacter();
    // Set each field from the saved data
    useCharacterStore.setState({ character: { ...data }, currentStep: 'review' });
  };

  const handleDelete = (id: string) => {
    deleteCharacter(id);
    refreshSaved();
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Decorative top border */}
      <div className="mb-8 h-px w-64 bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* Main title */}
      <h1 className="gold-text font-display text-5xl tracking-wider sm:text-6xl md:text-7xl">
        Draw Steel
      </h1>

      {/* Subtitle */}
      <h2 className="mt-4 font-heading text-2xl tracking-wide text-gold-light sm:text-3xl">
        Character Creator
      </h2>

      {/* Decorative divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-dark" />
        <div className="h-2 w-2 rotate-45 border border-gold-dark" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-dark" />
      </div>

      {/* Tagline */}
      <p className="font-body text-xl italic text-cream-dark sm:text-2xl">
        Forge your hero for the world of Orden
      </p>

      {/* Level Selector */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="font-heading text-sm uppercase tracking-wider text-gold-muted">
          Hero Level
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={[
                'flex h-10 w-10 items-center justify-center rounded-md font-heading text-sm font-bold transition-all duration-150',
                lvl === level
                  ? 'bg-gold text-surface shadow-lg shadow-gold/30 scale-110'
                  : 'bg-surface-light text-cream-dark/70 border border-gold-dark/20 hover:border-gold/50 hover:text-gold-light',
              ].join(' ')}
            >
              {lvl}
            </button>
          ))}
        </div>
        <p className="font-body text-sm text-cream-dark">
          Level {level}{' '}
          <span className="text-gold-muted">
            &mdash; Echelon {echelon}
          </span>
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <button
          className="btn-primary min-w-[220px] px-10 py-4 text-lg"
          onClick={() => {
            resetCharacter();
            setLevel(level);
            nextStep();
          }}
        >
          Forge a New Hero
        </button>

        {hasExistingCharacter && (
          <button
            className="btn-secondary min-w-[220px] px-10 py-4 text-lg"
            onClick={() => nextStep()}
          >
            Continue Building
          </button>
        )}
      </div>

      {/* Saved Characters Gallery */}
      {savedChars.length > 0 && (
        <div className="mt-12 w-full max-w-lg">
          <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-gold-dark/50 to-transparent" />
          <h3 className="mb-4 font-heading text-lg uppercase tracking-wider text-gold-muted">
            Saved Characters
          </h3>
          <div className="flex flex-col gap-2">
            {savedChars.map((entry) => (
              <SavedCharacterCard
                key={entry.id}
                entry={entry}
                onLoad={handleLoad}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Decorative bottom border */}
      <div className="mt-12 h-px w-64 bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* Flavor text */}
      <p className="mt-8 max-w-md font-body text-sm leading-relaxed text-cream-dark/60">
        Build your character step by step &mdash; choose an ancestry, define
        your culture, select a career, and pick a class to become a hero of the
        world of Orden.
      </p>
    </div>
  );
}
