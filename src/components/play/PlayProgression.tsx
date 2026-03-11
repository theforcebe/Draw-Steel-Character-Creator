import { useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { usePlayStore } from '../../stores/play-store';
import { VICTORIES_TO_LEVEL_UP, ABILITY_GRANT_LEVELS } from '../../types/character';
import { computeAllStats, getEchelon } from '../../engine/stat-calculator';
import { getComplicationStatBonuses } from '../../engine/complication-stats';
import { updateSavedCharacter } from '../../engine/character-storage';
import { LevelUpModal } from './LevelUpModal';
import { FormattedGameText } from './FormattedGameText';
import abilitiesData from '../../data/abilities.json';
import titlesData from '../../data/titles.json';
import type { RawAbility } from '../../engine/ability-resolver';

interface TitleEntry {
  id: string;
  name: string;
  echelon: number;
  prerequisite: string;
  effect: string;
  flavor?: string;
  special?: string;
}

interface ClassAbilities {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: RawAbility[];
  heroic_abilities: RawAbility[];
}

const classAbilities = abilitiesData.classes as Record<string, ClassAbilities>;

/**
 * Find abilities that were picked at a specific level.
 * Matches heroicAbilities entries against the abilities data
 * to find ones with `level === targetLevel`.
 */
function getAbilitiesPickedAtLevel(
  heroicAbilities: string[],
  classId: string,
  subclassId: string | undefined,
  targetLevel: number,
): string[] {
  const classData = classAbilities[classId];
  if (!classData) return [];

  return heroicAbilities.filter((name) => {
    const ability = classData.heroic_abilities.find((a) => a.name === name);
    if (!ability) return false;
    if (ability.level !== targetLevel) return false;
    // Also check subclass match
    if (ability.subclass) {
      if (!subclassId) return false;
      return ability.subclass.toLowerCase() === subclassId.toLowerCase();
    }
    return true;
  });
}

function recalcAndSave(playStore: ReturnType<typeof usePlayStore.getState>, playingCharacterId: string | null) {
  const char = useCharacterStore.getState().character;
  const compBonuses = getComplicationStatBonuses(char.complication, char.level);
  const newStats = computeAllStats({
    level: char.level,
    ancestryId: char.ancestryId,
    formerLifeAncestryId: char.formerLifeAncestryId,
    classId: char.classChoice?.classId ?? null,
    kitId: char.classChoice?.kitId ?? null,
    classKitOptionId: char.classChoice?.classKitOptionId ?? null,
    selectedTraits: char.selectedTraits,
    complicationBonuses: compBonuses,
  });
  if (newStats) {
    useCharacterStore.setState({
      character: { ...char, computedStats: newStats },
    });
    playStore.updateMaxStats(newStats.stamina, newStats.recoveries, newStats.recoveryValue);
  }
  if (playingCharacterId) {
    updateSavedCharacter(playingCharacterId, useCharacterStore.getState().character);
  }
}

export function PlayProgression() {
  const character = useCharacterStore((s) => s.character);
  const playStore = usePlayStore();
  const playState = playStore.getActiveState();
  const playingCharacterId = useCharacterStore((s) => s.playingCharacterId);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);

  if (!playState) return null;

  const currentLevel = character.level;
  const maxLevel = 10;
  const canLevelUp = currentLevel < maxLevel && playState.victories >= VICTORIES_TO_LEVEL_UP;
  const canRevert = currentLevel > 1;
  const echelon = getEchelon(currentLevel);
  const nextEchelon = currentLevel < maxLevel ? getEchelon(currentLevel + 1) : echelon;
  const echelonChanges = nextEchelon !== echelon;
  const nextLevelGrantsAbility = ABILITY_GRANT_LEVELS.includes(
    (currentLevel + 1) as (typeof ABILITY_GRANT_LEVELS)[number],
  );
  const progressPercent = Math.min(
    (playState.victories / VICTORIES_TO_LEVEL_UP) * 100,
    100,
  );

  // What would be removed if reverting
  const currentLevelIsGrantLevel = ABILITY_GRANT_LEVELS.includes(
    currentLevel as (typeof ABILITY_GRANT_LEVELS)[number],
  );
  const abilitiesToRemove = currentLevelIsGrantLevel && character.classChoice
    ? getAbilitiesPickedAtLevel(
        character.classChoice.heroicAbilities,
        character.classChoice.classId,
        character.classChoice.subclassId,
        currentLevel,
      )
    : [];

  function handleLevelUp() {
    setShowLevelUp(true);
  }

  function handleLevelUpComplete() {
    setShowLevelUp(false);
    playStore.resetVictories();
    recalcAndSave(playStore, playingCharacterId);
  }

  function handleRevertLevel() {
    if (!character.classChoice || currentLevel <= 1) return;

    const newLevel = currentLevel - 1;
    const updatedHeroic = character.classChoice.heroicAbilities.filter(
      (name) => !abilitiesToRemove.includes(name),
    );

    useCharacterStore.setState((state) => ({
      character: {
        ...state.character,
        level: newLevel,
        classChoice: {
          ...state.character.classChoice!,
          heroicAbilities: updatedHeroic,
        },
      },
    }));

    // Give back victories
    playStore.resetVictories();
    // Add back the threshold so they're at max
    for (let i = 0; i < VICTORIES_TO_LEVEL_UP; i++) {
      playStore.addVictory();
    }

    recalcAndSave(playStore, playingCharacterId);
    setShowRevertConfirm(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Level Info */}
      <div className="card px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="font-heading text-4xl font-bold text-gold-light">
            {currentLevel}
          </span>
          <div className="text-left">
            <p className="font-heading text-sm uppercase tracking-wider text-gold">
              Level
            </p>
            <p className="font-heading text-xs text-gold-muted">
              Echelon {echelon}
            </p>
          </div>
        </div>
        {currentLevel >= maxLevel && (
          <p className="font-body text-sm text-gold italic">Maximum level reached!</p>
        )}
      </div>

      {/* Victory Tracker */}
      <div className="card px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-sm uppercase tracking-wider text-gold">
            Victories
          </h3>
          <span className="font-heading text-xs text-gold-muted">
            {playState.victories} / {VICTORIES_TO_LEVEL_UP} to level up
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-6 rounded-xl bg-surface/80 border border-gold/10 overflow-hidden mb-3">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-500 rounded-xl"
            style={{
              width: `${progressPercent}%`,
              background: canLevelUp
                ? 'linear-gradient(90deg, #d4a843, #f0d47a)'
                : 'linear-gradient(90deg, #a07c2a, #d4a843)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-xs font-bold text-white drop-shadow-lg">
              {playState.victories} / {VICTORIES_TO_LEVEL_UP}
            </span>
          </div>
        </div>

        {/* Victory Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => playStore.removeVictory()}
            disabled={playState.victories <= 0}
            className="flex items-center justify-center w-12 h-12 rounded-xl border border-gold/20 font-heading text-lg font-bold text-gold-muted hover:bg-gold/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            -1
          </button>
          <div className="flex flex-col items-center">
            <span className="font-heading text-3xl font-bold text-gold-light">
              {playState.victories}
            </span>
            <span className="font-heading text-[0.6rem] uppercase tracking-wider text-gold-muted">
              victories
            </span>
          </div>
          <button
            type="button"
            onClick={() => playStore.addVictory()}
            className="flex items-center justify-center w-12 h-12 rounded-xl border border-gold/20 font-heading text-lg font-bold text-gold-light hover:bg-gold/10 transition-all"
          >
            +1
          </button>
        </div>
      </div>

      {/* Level Up Button */}
      {currentLevel < maxLevel && (
        <button
          type="button"
          onClick={handleLevelUp}
          disabled={!canLevelUp}
          className={[
            'card px-5 py-5 text-center transition-all',
            canLevelUp
              ? 'border-gold/40 shadow-[0_0_30px_rgba(212,168,67,0.15)] cursor-pointer hover:border-gold/60'
              : 'opacity-40 cursor-not-allowed',
          ].join(' ')}
        >
          <p className="font-heading text-lg uppercase tracking-wider text-gold-light font-bold">
            Level Up to {currentLevel + 1}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {echelonChanges && (
              <span className="badge badge-accent">
                Echelon {echelon} &rarr; {nextEchelon}
              </span>
            )}
            {nextLevelGrantsAbility && (
              <span className="badge">New Ability</span>
            )}
          </div>
          {!canLevelUp && (
            <p className="font-body text-xs text-cream-dark/40 mt-2">
              Earn {VICTORIES_TO_LEVEL_UP - playState.victories} more{' '}
              {VICTORIES_TO_LEVEL_UP - playState.victories === 1 ? 'victory' : 'victories'} to level up
            </p>
          )}
        </button>
      )}

      {/* Next Level Preview */}
      {currentLevel < maxLevel && (
        <div className="card px-4 py-3">
          <h3 className="font-heading text-xs uppercase tracking-wider text-gold mb-2">
            At Level {currentLevel + 1}
          </h3>
          <div className="flex flex-col gap-1 font-body text-xs text-cream-dark/60">
            {echelonChanges && (
              <p>
                Echelon increases to {nextEchelon} &mdash; kit bonuses scale up
              </p>
            )}
            {nextLevelGrantsAbility && (
              <p>
                New heroic ability slot unlocked
              </p>
            )}
            <p>
              Stamina increases by{' '}
              {character.classChoice?.classId
                ? ['censor', 'fury', 'null', 'tactician'].includes(character.classChoice.classId)
                  ? 9
                  : 6
                : '?'}
            </p>
          </div>
        </div>
      )}

      {/* Revert Level */}
      {canRevert && (
        <div className="card px-4 py-3">
          {!showRevertConfirm ? (
            <button
              type="button"
              onClick={() => setShowRevertConfirm(true)}
              className="w-full text-center font-heading text-xs uppercase tracking-wider text-crimson/70 hover:text-crimson transition-all py-1"
            >
              Revert to Level {currentLevel - 1}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="font-heading text-xs uppercase tracking-wider text-crimson text-center">
                Revert to Level {currentLevel - 1}?
              </p>
              {abilitiesToRemove.length > 0 && (
                <p className="font-body text-xs text-cream-dark/50 text-center">
                  This will remove:{' '}
                  <span className="text-crimson/80">{abilitiesToRemove.join(', ')}</span>
                </p>
              )}
              <p className="font-body text-xs text-cream-dark/40 text-center">
                Stats will recalculate and victories will be restored.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRevertConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-gold/15 font-heading text-xs uppercase tracking-wider text-gold-muted hover:bg-gold/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRevertLevel}
                  className="px-4 py-2 rounded-xl bg-crimson/10 border border-crimson/20 font-heading text-xs uppercase tracking-wider text-crimson hover:bg-crimson/20 transition-all"
                >
                  Confirm Revert
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Titles ── */}
      <TitleSection echelon={echelon} />

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          onClose={() => setShowLevelUp(false)}
          onComplete={handleLevelUpComplete}
        />
      )}
    </div>
  );
}

const allTitles = (titlesData as { titles: TitleEntry[] }).titles;

function TitleSection({ echelon }: { echelon: number }) {
  const playStore = usePlayStore();
  const playState = playStore.getActiveState();
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [filterEchelon, setFilterEchelon] = useState<number | 'all'>('all');
  const [titleSearch, setTitleSearch] = useState('');

  if (!playState) return null;

  const earnedTitles = playState.earnedTitles ?? [];
  const filteredTitles = allTitles.filter((t) => {
    if (filterEchelon !== 'all' && t.echelon !== filterEchelon) return false;
    if (titleSearch && !t.name.toLowerCase().includes(titleSearch.toLowerCase())) return false;
    return true;
  });

  const earnedList = allTitles.filter((t) => earnedTitles.includes(t.id));

  return (
    <div className="card px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
          Titles ({earnedTitles.length} earned)
        </h3>
      </div>

      {/* Earned Titles */}
      {earnedList.length > 0 && (
        <div className="mb-3">
          <span className="font-heading text-[0.6rem] uppercase tracking-wider text-gold-muted">
            Earned
          </span>
          <div className="flex flex-col gap-1 mt-1">
            {earnedList.map((title) => (
              <div
                key={`earned-${title.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-gold/8 border border-gold/20"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[0.5rem] font-heading uppercase tracking-wider bg-gold/15 text-gold border border-gold/25">
                    E{title.echelon}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedTitle(expandedTitle === title.id ? null : title.id)}
                    className="font-heading text-xs text-gold-light hover:text-gold transition-all text-left truncate"
                  >
                    {title.name}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => playStore.removeTitle(title.id)}
                  className="shrink-0 px-1.5 py-0.5 rounded text-[0.5rem] text-crimson/50 hover:text-crimson border border-crimson/10 hover:border-crimson/30 transition-all"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Echelon filter */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        <span className="font-heading text-[0.6rem] uppercase tracking-wider text-gold-muted mr-1">
          Browse:
        </span>
        {(['all', 1, 2, 3, 4] as const).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setFilterEchelon(e)}
            className={[
              'px-2 py-0.5 rounded-full text-[0.55rem] font-heading uppercase tracking-wider transition-all',
              filterEchelon === e
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'text-cream-dark/40 border border-gold/5 hover:border-gold/15',
            ].join(' ')}
          >
            {e === 'all' ? 'All' : `Echelon ${e}`}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={titleSearch}
        onChange={(e) => setTitleSearch(e.target.value)}
        placeholder="Search titles..."
        className="w-full px-3 py-1.5 rounded-lg bg-surface-light/20 border border-gold/10 text-cream-dark/80 font-body text-xs placeholder:text-cream-dark/30 focus:outline-none focus:border-gold/30 mb-2"
      />

      {/* Title List */}
      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
        {filteredTitles.map((title) => {
          const isEarned = earnedTitles.includes(title.id);
          const isExpanded = expandedTitle === title.id;
          const isAvailable = title.echelon <= echelon;

          return (
            <div key={title.id}>
              <div
                className={[
                  'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all',
                  isEarned ? 'bg-gold/8' : isAvailable ? 'hover:bg-gold/5' : 'opacity-40',
                ].join(' ')}
              >
                <span className={[
                  'shrink-0 px-1.5 py-0.5 rounded text-[0.5rem] font-heading uppercase tracking-wider border',
                  title.echelon <= echelon
                    ? 'text-gold bg-gold/10 border-gold/20'
                    : 'text-cream-dark/30 bg-surface-light/20 border-gold/5',
                ].join(' ')}>
                  E{title.echelon}
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedTitle(isExpanded ? null : title.id)}
                  className="flex-1 font-heading text-[0.6rem] text-cream-dark/70 hover:text-gold-light transition-all text-left truncate"
                >
                  {title.name}
                </button>
                {!isEarned && isAvailable && (
                  <button
                    type="button"
                    onClick={() => playStore.addTitle(title.id)}
                    className="shrink-0 text-[0.5rem] text-gold/30 hover:text-gold/60 font-heading transition-all"
                  >
                    +EARN
                  </button>
                )}
                {isEarned && (
                  <span className="shrink-0 text-[0.5rem] text-gold font-heading">Earned</span>
                )}
              </div>
              {isExpanded && (
                <div className="px-3 py-2 mx-2 mb-1 rounded-lg bg-surface-light/10 border border-gold/8">
                  {title.flavor && (
                    <p className="font-body text-[0.65rem] text-cream-dark/40 italic mb-1.5">
                      &ldquo;{title.flavor}&rdquo;
                    </p>
                  )}
                  <p className="font-body text-[0.65rem] text-cream-dark/50 mb-1">
                    <span className="font-heading text-[0.55rem] text-gold-muted uppercase tracking-wider">
                      Prerequisite:{' '}
                    </span>
                    {title.prerequisite}
                  </p>
                  <div className="font-body text-[0.65rem] text-cream-dark/60 leading-relaxed">
                    <span className="font-heading text-[0.55rem] text-gold-muted uppercase tracking-wider">
                      Effect:{' '}
                    </span>
                    <FormattedGameText text={title.effect} className="mt-0.5" />
                  </div>
                  {title.special && (
                    <p className="font-body text-[0.65rem] text-crimson/70 mt-1">
                      <span className="font-heading text-[0.55rem] text-crimson/50 uppercase tracking-wider">
                        Special:{' '}
                      </span>
                      {title.special}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
