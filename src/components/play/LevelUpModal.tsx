import { useState, useMemo } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { computeAllStats, getEchelon } from '../../engine/stat-calculator';
import { getComplicationStatBonuses } from '../../engine/complication-stats';
import { resolveAbility } from '../../engine/ability-resolver';
import type { RawAbility } from '../../engine/ability-resolver';
import abilitiesData from '../../data/abilities.json';
import { ABILITY_GRANT_LEVELS } from '../../types/character';
import { ParchmentCard } from '../ui/ParchmentCard';

interface ClassAbilities {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: RawAbility[];
  heroic_abilities: RawAbility[];
}

const classAbilities = abilitiesData.classes as Record<string, ClassAbilities>;

function getAbilitiesForLevel(
  abilities: RawAbility[],
  targetLevel: number,
  subclassId: string | undefined,
): RawAbility[] {
  return abilities.filter((a) => {
    if (a.level !== targetLevel) return false;
    if (a.subclass) {
      if (!subclassId) return false;
      return a.subclass.toLowerCase() === subclassId.toLowerCase();
    }
    return true;
  });
}

interface LevelUpModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export function LevelUpModal({ onClose, onComplete }: LevelUpModalProps) {
  const character = useCharacterStore((s) => s.character);
  const currentLevel = character.level;
  const newLevel = currentLevel + 1;
  const classChoice = character.classChoice;

  const grantsAbility = ABILITY_GRANT_LEVELS.includes(
    newLevel as (typeof ABILITY_GRANT_LEVELS)[number],
  );

  // Get available abilities for the new level
  const availableAbilities = useMemo(() => {
    if (!grantsAbility || !classChoice) return [];
    const classData = classAbilities[classChoice.classId];
    if (!classData) return [];
    return getAbilitiesForLevel(
      classData.heroic_abilities,
      newLevel,
      classChoice.subclassId,
    );
  }, [grantsAbility, classChoice, newLevel]);

  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  // Compute stat preview for new level
  const compBonuses = getComplicationStatBonuses(character.complication, newLevel);
  const newStats = computeAllStats({
    level: newLevel,
    ancestryId: character.ancestryId,
    formerLifeAncestryId: character.formerLifeAncestryId,
    classId: classChoice?.classId ?? null,
    kitId: classChoice?.kitId ?? null,
    classKitOptionId: classChoice?.classKitOptionId ?? null,
    selectedTraits: character.selectedTraits,
    complicationBonuses: compBonuses,
  });

  const oldStats = character.computedStats;
  const oldEchelon = getEchelon(currentLevel);
  const newEchelon = getEchelon(newLevel);

  const canConfirm = !grantsAbility || availableAbilities.length === 0 || selectedAbility !== null;

  function handleConfirm() {
    if (!classChoice) return;

    // Update level
    useCharacterStore.setState((state) => {
      const updatedHeroic = [...state.character.classChoice!.heroicAbilities];
      if (selectedAbility) {
        updatedHeroic.push(selectedAbility);
      }

      return {
        character: {
          ...state.character,
          level: newLevel,
          classChoice: {
            ...state.character.classChoice!,
            heroicAbilities: updatedHeroic,
          },
        },
      };
    });

    onComplete();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl panel-glass frame-corners shadow-2xl"
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gold/10 text-center">
          <h2 className="font-display text-2xl gold-text tracking-wider">Level Up!</h2>
          <p className="font-heading text-sm text-gold-muted mt-1">
            Level {currentLevel} &rarr; Level {newLevel}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Stat Changes */}
          <div>
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold mb-3">
              Stat Changes
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {oldStats && newStats && (
                <>
                  <StatChange label="Stamina" old={oldStats.stamina} new={newStats.stamina} />
                  <StatChange label="Winded" old={oldStats.winded} new={newStats.winded} />
                  <StatChange label="Recovery Val" old={oldStats.recoveryValue} new={newStats.recoveryValue} />
                  <StatChange label="Recoveries" old={oldStats.recoveries} new={newStats.recoveries} />
                  <StatChange label="Speed" old={oldStats.speed} new={newStats.speed} />
                  <StatChange label="Stability" old={oldStats.stability} new={newStats.stability} />
                </>
              )}
              {oldEchelon !== newEchelon && (
                <div className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-gold/10 border border-gold/20">
                  <span className="font-heading text-xs uppercase tracking-wider text-gold-light">
                    Echelon {oldEchelon} &rarr; {newEchelon}
                  </span>
                  <span className="badge badge-accent text-[0.55rem]">Kit bonuses scale!</span>
                </div>
              )}
            </div>
          </div>

          {/* Ability Selection */}
          {grantsAbility && availableAbilities.length > 0 && (
            <div>
              <h3 className="font-heading text-xs uppercase tracking-wider text-gold mb-1">
                Choose New Ability
              </h3>
              <p className="font-body text-[0.65rem] text-cream-dark/40 mb-3">
                Select one heroic ability unlocked at level {newLevel}.
              </p>
              <div className="flex flex-col gap-3">
                {availableAbilities.map((ability) => {
                  const resolved = classChoice
                    ? resolveAbility(ability, classChoice.characteristics)
                    : null;
                  const isSelected = selectedAbility === ability.name;
                  return (
                    <ParchmentCard
                      key={ability.name}
                      selected={isSelected}
                      onClick={() => setSelectedAbility(ability.name)}
                      hoverable
                      compact
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-heading text-sm text-gold tracking-wide">
                          {ability.name}
                        </h4>
                        <span className="shrink-0 badge badge-accent text-[0.55rem]">
                          {ability.cost}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 text-[0.6rem] font-body text-cream-dark/50 mt-1">
                        <span>{ability.type}</span>
                        <span>{ability.distance}</span>
                        <span>{ability.target}</span>
                      </div>
                      {resolved && resolved.powerRoll && (
                        <p className="font-heading text-[0.55rem] text-gold-muted mt-1">
                          {resolved.powerRoll}
                        </p>
                      )}
                      {resolved?.tier1 && (
                        <div className="mt-1.5 text-[0.6rem] font-body text-cream-dark/50 flex flex-col gap-0.5">
                          <span>11-: {resolved.tier1}</span>
                          <span>12+: {resolved.tier2}</span>
                          <span className="text-gold-light">17+: {resolved.tier3}</span>
                        </div>
                      )}
                      {resolved?.effect && (
                        <p className="font-body text-[0.6rem] text-cream-dark/40 mt-1">
                          Effect: {resolved.effect}
                        </p>
                      )}
                    </ParchmentCard>
                  );
                })}
              </div>
            </div>
          )}

          {grantsAbility && availableAbilities.length === 0 && (
            <div className="rounded-2xl border border-gold/10 bg-surface-light/30 p-4 text-center">
              <p className="font-body text-sm text-cream-dark/50">
                No new abilities are available for your class/subclass at level {newLevel}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gold/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-5 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="btn-primary px-6 py-2"
          >
            Confirm Level Up
          </button>
        </div>
      </div>
    </div>
  );
}

function StatChange({
  label,
  old: oldVal,
  new: newVal,
}: {
  label: string;
  old: number;
  new: number;
}) {
  const diff = newVal - oldVal;
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-light/30 border border-gold/5">
      <span className="font-heading text-[0.6rem] uppercase tracking-wider text-gold-muted">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="font-heading text-sm text-cream-dark/50">{oldVal}</span>
        <span className="text-gold-muted">&rarr;</span>
        <span className="font-heading text-sm font-bold text-gold-light">{newVal}</span>
        {diff > 0 && (
          <span className="text-green-400 text-xs font-heading">+{diff}</span>
        )}
      </div>
    </div>
  );
}
