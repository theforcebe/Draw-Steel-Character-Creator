import { useState, useCallback, useRef } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { usePlayStore } from '../../stores/play-store';
import { getSavedCharacters, deleteCharacter } from '../../engine/character-storage';
import { computeAllStats } from '../../engine/stat-calculator';
import { getComplicationStatBonuses } from '../../engine/complication-stats';
import { exportAllData, importData } from '../../engine/data-export';
import type { SavedCharacter } from '../../engine/character-storage';

function getEchelon(level: number): number {
  return Math.floor((level - 1) / 3) + 1;
}

function formatId(id: string): string {
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function SavedCharacterCard({
  entry,
  onLoad,
  onPlay,
  onDelete,
}: {
  entry: SavedCharacter;
  onLoad: (entry: SavedCharacter) => void;
  onPlay: (entry: SavedCharacter) => void;
  onDelete: (id: string) => void;
}) {
  const d = entry.data;
  const date = new Date(entry.savedAt);
  const hasClass = !!d.classChoice;
  return (
    <div className="card flex items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold text-gold-light truncate">
          {entry.name}
        </p>
        <p className="font-body text-xs text-cream-dark/60 mt-0.5">
          Level {d.level}
          {d.ancestryId ? ` ${formatId(d.ancestryId)}` : ''}
          {d.classChoice?.classId ? ` ${formatId(d.classChoice.classId)}` : ''}
          {' — '}
          {date.toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        {hasClass && (
          <button
            type="button"
            className="rounded-xl bg-gold/15 px-3.5 py-2 font-heading text-xs font-semibold text-gold hover:bg-gold/25 transition-all border border-gold/20 hover:border-gold/40"
            onClick={() => onPlay(entry)}
          >
            Play
          </button>
        )}
        <button
          type="button"
          className="rounded-xl bg-gold/10 px-3.5 py-2 font-heading text-xs font-semibold text-gold-light hover:bg-gold/20 transition-all border border-gold/10 hover:border-gold/30"
          onClick={() => onLoad(entry)}
        >
          Load
        </button>
        <button
          type="button"
          className="rounded-xl bg-crimson/8 px-3.5 py-2 font-heading text-xs font-semibold text-crimson hover:bg-crimson/15 transition-all border border-crimson/10 hover:border-crimson/25"
          onClick={() => onDelete(entry.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function WelcomeStep() {
  const character = useCharacterStore((s) => s.character);
  const nextStep = useCharacterStore((s) => s.nextStep);
  const resetCharacter = useCharacterStore((s) => s.resetCharacter);
  const setLevel = useCharacterStore((s) => s.setLevel);
  const hasExistingCharacter = character.ancestryId !== null;
  const level = character.level;
  const echelon = getEchelon(level);

  const [savedChars, setSavedChars] = useState<SavedCharacter[]>(() => getSavedCharacters());
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSaved = useCallback(() => setSavedChars(getSavedCharacters()), []);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importData(file);
      setImportStatus(`Imported ${result.imported} character${result.imported !== 1 ? 's' : ''}${result.skipped ? `, ${result.skipped} already existed` : ''}`);
      refreshSaved();
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err) {
      setImportStatus(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
      setTimeout(() => setImportStatus(null), 4000);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, [refreshSaved]);

  const handleLoad = (entry: SavedCharacter) => {
    const store = useCharacterStore.getState();
    store.resetCharacter();
    useCharacterStore.setState({ character: { ...entry.data }, currentStep: 'review', playingCharacterId: entry.id });
  };

  const handlePlay = (entry: SavedCharacter) => {
    const data = entry.data;
    // Compute stats
    const compBonuses = getComplicationStatBonuses(data.complication, data.level);
    const stats = computeAllStats({
      level: data.level,
      ancestryId: data.ancestryId,
      formerLifeAncestryId: data.formerLifeAncestryId,
      classId: data.classChoice?.classId ?? null,
      kitId: data.classChoice?.kitId ?? null,
      classKitOptionId: data.classChoice?.classKitOptionId ?? null,
      selectedTraits: data.selectedTraits,
      complicationBonuses: compBonuses,
    });
    const charWithStats = { ...data, computedStats: stats ?? data.computedStats };

    // Load character into store
    useCharacterStore.setState({
      character: charWithStats,
      playingCharacterId: entry.id,
      mode: 'play',
    });

    // Initialize play state
    const stamina = stats?.stamina ?? data.computedStats?.stamina ?? 21;
    const recoveries = stats?.recoveries ?? data.computedStats?.recoveries ?? 8;
    const recoveryValue = stats?.recoveryValue ?? data.computedStats?.recoveryValue ?? 7;
    usePlayStore.getState().initPlayState(entry.id, stamina, recoveries, recoveryValue);
  };

  const handleDelete = (id: string) => {
    deleteCharacter(id);
    usePlayStore.getState().deletePlayState(id);
    refreshSaved();
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center relative"
      style={{ animation: 'fadeInUp 0.5s ease-out' }}
    >
      {/* Atmospheric background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-[100px]" />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-xl">
        {/* Ornamental top line */}
        <div className="ornament-rule mb-10">
          <div className="w-2 h-2 rotate-45 bg-gold/40" />
        </div>

        {/* Title */}
        <h1 className="gold-text font-display text-5xl tracking-wider sm:text-6xl md:text-7xl">
          Draw Steel
        </h1>

        {/* Subtitle */}
        <h2 className="mt-3 font-heading text-xl tracking-[0.15em] text-cream-dark/80 sm:text-2xl uppercase">
          Character Creator
        </h2>

        {/* Ornamental divider */}
        <div className="ornament-rule my-8">
          <div className="w-1.5 h-1.5 rotate-45 border border-gold/50" />
        </div>

        {/* Tagline */}
        <p className="font-body text-lg italic text-cream-dark/70 sm:text-xl">
          Forge your hero for the world of Orden
        </p>

        {/* ── Level Selector ── */}
        <div className="mt-10 panel-glass rounded-2xl p-6 frame-corners">
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-gold-muted mb-4">
            Hero Level
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={[
                  'flex h-11 w-11 items-center justify-center rounded-xl font-heading text-sm font-bold transition-all duration-300',
                  lvl === level
                    ? 'bg-gradient-to-b from-gold-light to-gold text-ink shadow-[0_0_20px_rgba(212,168,67,0.3)] scale-110 border border-gold-light/30'
                    : 'bg-surface-light/50 text-cream-dark/60 border border-gold/8 hover:border-gold/25 hover:text-gold-light hover:bg-surface-lighter/50',
                ].join(' ')}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="font-body text-sm text-cream-dark/70 mt-4">
            Level {level}
            <span className="text-gold-muted ml-2">
              &mdash; Echelon {echelon}
            </span>
          </p>
        </div>

        {/* ── Action Buttons ── */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
          <button
            className="btn-primary w-full sm:w-auto min-w-[220px] rounded-2xl px-10 py-4 text-base"
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
              className="btn-secondary w-full sm:w-auto min-w-[220px] rounded-2xl px-10 py-4 text-base"
              onClick={() => nextStep()}
            >
              Continue Building
            </button>
          )}
        </div>

        {/* ── Saved Characters ── */}
        {savedChars.length > 0 && (
          <div className="mt-12">
            <div className="ornament-rule mb-6">
              <span className="font-heading text-[0.65rem] uppercase tracking-[0.2em] text-gold-muted px-4">
                Saved Characters
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {savedChars.map((entry) => (
                <SavedCharacterCard
                  key={entry.id}
                  entry={entry}
                  onLoad={handleLoad}
                  onPlay={handlePlay}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Backup / Restore ── */}
        <div className="mt-10">
          <div className="ornament-rule mb-5">
            <span className="font-heading text-[0.65rem] uppercase tracking-[0.2em] text-gold-muted px-4">
              Backup &amp; Restore
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm"
              onClick={() => exportAllData()}
            >
              Export Backup
            </button>
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
          {importStatus && (
            <p className="font-body text-sm text-gold text-center mt-3">{importStatus}</p>
          )}
          <p className="font-body text-xs text-cream-dark/30 text-center mt-2">
            Characters are saved locally in your browser. Export a backup to keep your data safe.
          </p>
        </div>

        {/* Ornamental bottom */}
        <div className="ornament-rule mt-12 mb-4">
          <div className="w-2 h-2 rotate-45 bg-gold/40" />
        </div>

        {/* Flavor text */}
        <p className="max-w-sm mx-auto font-body text-sm leading-relaxed text-cream-dark/40">
          Build your character step by step &mdash; choose an ancestry, define
          your culture, select a career, and pick a class to become a hero of the
          world of Orden.
        </p>
      </div>
    </div>
  );
}
