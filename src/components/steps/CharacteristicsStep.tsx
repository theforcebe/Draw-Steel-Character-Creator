import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { StatBlock } from '../ui/StatBlock';
import type { CharacteristicName, Characteristics } from '../../types/character';

interface ClassCharacteristics {
  fixed: Record<string, number>;
  arrays: number[][];
}

const CLASS_CHARACTERISTICS: Record<string, ClassCharacteristics> = {
  censor: { fixed: { might: 2, presence: 2 }, arrays: [[2, -1, -1], [1, 1, -1], [1, 0, 0]] },
  conduit: { fixed: { intuition: 2 }, arrays: [[2, 2, -1, -1], [2, 1, 1, -1], [2, 1, 0, 0], [1, 1, 1, 0]] },
  elementalist: { fixed: { reason: 2 }, arrays: [[2, 2, -1, -1], [2, 1, 1, -1], [2, 1, 0, 0], [1, 1, 1, 0]] },
  fury: { fixed: { might: 2, agility: 2 }, arrays: [[2, -1, -1], [1, 1, -1], [1, 0, 0]] },
  null: { fixed: { agility: 2, intuition: 2 }, arrays: [[2, -1, -1], [1, 1, -1], [1, 0, 0]] },
  shadow: { fixed: { agility: 2 }, arrays: [[2, 2, -1, -1], [2, 1, 1, -1], [2, 1, 0, 0], [1, 1, 1, 0]] },
  tactician: { fixed: { might: 2, reason: 2 }, arrays: [[2, -1, -1], [1, 1, -1], [1, 0, 0]] },
  talent: { fixed: { reason: 2, presence: 2 }, arrays: [[2, -1, -1], [1, 1, -1], [1, 0, 0]] },
  troubadour: { fixed: { agility: 2, presence: 2 }, arrays: [[2, -1, -1], [1, 1, -1], [1, 0, 0]] },
  summoner: { fixed: { reason: 2, presence: 2 }, arrays: [[2, -1, -1], [1, 1, -1], [1, 0, 0]] },
};

const ALL_CHARACTERISTICS: CharacteristicName[] = ['might', 'agility', 'reason', 'intuition', 'presence'];

function formatArrayLabel(arr: number[]): string {
  return arr
    .map((v) => (v >= 0 ? `+${v}` : `${v}`))
    .join(', ');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CharacteristicsStep() {
  const classChoice = useCharacterStore((s) => s.character.classChoice);
  const setClassChoice = useCharacterStore((s) => s.setClassChoice);

  const [selectedArrayIndex, setSelectedArrayIndex] = useState<number | null>(null);

  // Reset array selection when class changes
  const classId = classChoice?.classId ?? null;
  useEffect(() => {
    setSelectedArrayIndex(null);
  }, [classId]);

  if (!classChoice) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="font-body text-lg text-cream-dark/80">
          Select a class first.
        </p>
      </div>
    );
  }

  const classData = CLASS_CHARACTERISTICS[classChoice.classId];
  if (!classData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="font-body text-lg text-cream-dark/80">
          No characteristic data available for this class.
        </p>
      </div>
    );
  }

  const fixedStats = classData.fixed;
  const remainingStats = ALL_CHARACTERISTICS.filter((stat) => !(stat in fixedStats));

  function buildCharacteristics(arrayIndex: number): Characteristics {
    const arr = classData.arrays[arrayIndex];
    const result: Characteristics = { might: 0, agility: 0, reason: 0, intuition: 0, presence: 0 };

    // Apply fixed values
    for (const [stat, value] of Object.entries(fixedStats)) {
      result[stat as CharacteristicName] = value;
    }

    // Auto-assign array values to remaining stats in alphabetical order
    const sorted = [...remainingStats].sort();
    sorted.forEach((stat, i) => {
      result[stat] = arr[i];
    });

    return result;
  }

  function handleSelectArray(index: number) {
    setSelectedArrayIndex(index);

    if (!classChoice) return;
    const characteristics = buildCharacteristics(index);
    setClassChoice({
      ...classChoice,
      characteristics,
    });
  }

  const currentCharacteristics = selectedArrayIndex !== null
    ? buildCharacteristics(selectedArrayIndex)
    : null;

  const className = classChoice.classId.charAt(0).toUpperCase() + classChoice.classId.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="gold-text font-heading text-3xl tracking-wide sm:text-4xl">
          Set Characteristics
        </h2>
        <p className="font-body mt-2 text-lg text-cream-dark/80">
          Your {className} has fixed characteristics and an array you assign to the rest.
        </p>
      </div>

      {/* Fixed Characteristics */}
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-xl text-gold-light">
          <span className="h-px flex-1 bg-gradient-to-r from-gold-dark/50 to-transparent" />
          <span>Fixed Characteristics</span>
          <span className="h-px flex-1 bg-gradient-to-l from-gold-dark/50 to-transparent" />
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {Object.entries(fixedStats).map(([stat, value]) => (
            <div key={stat} className="flex flex-col items-center gap-1">
              <div className="rounded-lg border-2 border-gold/60 bg-gold/10 p-1">
                <StatBlock label={capitalize(stat)} value={value} size="md" />
              </div>
              <span className="font-body text-xs uppercase tracking-wider text-gold/70">
                Locked
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Array Selection */}
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-xl text-gold-light">
          <span className="h-px flex-1 bg-gradient-to-r from-gold-dark/50 to-transparent" />
          <span>Choose an Array</span>
          <span className="h-px flex-1 bg-gradient-to-l from-gold-dark/50 to-transparent" />
        </h3>
        <p className="font-body mb-4 text-center text-sm text-cream-dark/70">
          Values are assigned to{' '}
          {remainingStats.sort().map((s) => capitalize(s)).join(', ')}{' '}
          in alphabetical order.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {classData.arrays.map((arr, index) => {
            const isSelected = selectedArrayIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectArray(index)}
                className={[
                  'rounded-lg border-2 px-4 py-3 font-heading text-lg tracking-wide transition-all duration-200',
                  'hover:scale-[1.03] hover:shadow-md',
                  isSelected
                    ? 'border-gold bg-gold/15 text-gold-light shadow-md shadow-gold/10'
                    : 'border-gold-dark/30 bg-surface-light text-cream-dark/80 hover:border-gold-dark/60',
                ].join(' ')}
              >
                <span className="font-display text-base">
                  [ {formatArrayLabel(arr)} ]
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Preview */}
      {currentCharacteristics && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-heading text-xl text-gold-light">
            <span className="h-px flex-1 bg-gradient-to-r from-gold-dark/50 to-transparent" />
            <span>Final Characteristics</span>
            <span className="h-px flex-1 bg-gradient-to-l from-gold-dark/50 to-transparent" />
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ALL_CHARACTERISTICS.map((stat) => {
              const isFixed = stat in fixedStats;
              return (
                <div key={stat} className="flex flex-col items-center gap-1">
                  <div
                    className={[
                      'rounded-lg border-2 p-1',
                      isFixed
                        ? 'border-gold/60 bg-gold/10'
                        : 'border-amber-600/40 bg-surface-lighter',
                    ].join(' ')}
                  >
                    <StatBlock
                      label={capitalize(stat)}
                      value={currentCharacteristics[stat]}
                      size="md"
                    />
                  </div>
                  <span
                    className={[
                      'font-body text-xs uppercase tracking-wider',
                      isFixed ? 'text-gold/70' : 'text-cream-dark/60',
                    ].join(' ')}
                  >
                    {isFixed ? 'Fixed' : 'Array'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
