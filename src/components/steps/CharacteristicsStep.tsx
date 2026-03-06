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

function formatValue(v: number): string {
  return v >= 0 ? `+${v}` : `${v}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CharacteristicsStep() {
  const classChoice = useCharacterStore((s) => s.character.classChoice);
  const setClassChoice = useCharacterStore((s) => s.setClassChoice);

  const [selectedArrayIndex, setSelectedArrayIndex] = useState<number | null>(null);
  // assignments[i] = which characteristic name is assigned array value i
  const [assignments, setAssignments] = useState<(CharacteristicName | '')[]>([]);

  const classId = classChoice?.classId ?? null;

  // Reset when class changes
  useEffect(() => {
    setSelectedArrayIndex(null);
    setAssignments([]);
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

  function buildCharacteristics(arr: number[], assigns: (CharacteristicName | '')[]): Characteristics | null {
    // All slots must be assigned
    if (assigns.some((a) => !a)) return null;

    const result: Characteristics = { might: 0, agility: 0, reason: 0, intuition: 0, presence: 0 };

    // Apply fixed values
    for (const [stat, value] of Object.entries(fixedStats)) {
      result[stat as CharacteristicName] = value;
    }

    // Apply assigned array values
    assigns.forEach((stat, i) => {
      if (stat) result[stat] = arr[i];
    });

    return result;
  }

  function handleSelectArray(index: number) {
    setSelectedArrayIndex(index);
    // Reset assignments when picking a new array
    const arr = classData.arrays[index];
    const blank: (CharacteristicName | '')[] = new Array(arr.length).fill('');
    setAssignments(blank);

    // Clear characteristics until they assign all values
    if (!classChoice) return;
    setClassChoice({
      ...classChoice,
      characteristics: { might: 0, agility: 0, reason: 0, intuition: 0, presence: 0 },
    });
  }

  function handleAssign(slotIndex: number, stat: CharacteristicName | '') {
    if (selectedArrayIndex === null || !classChoice) return;
    const arr = classData.arrays[selectedArrayIndex];

    const updated = [...assignments];

    // If this stat is already assigned to a different slot, swap them
    if (stat) {
      const existingSlot = updated.findIndex((a) => a === stat);
      if (existingSlot !== -1 && existingSlot !== slotIndex) {
        updated[existingSlot] = updated[slotIndex]; // swap: give old slot the current slot's value
      }
    }

    updated[slotIndex] = stat;
    setAssignments(updated);

    // If all assigned, save to store
    const chars = buildCharacteristics(arr, updated);
    if (chars) {
      setClassChoice({ ...classChoice, characteristics: chars });
    } else {
      // Clear if incomplete
      setClassChoice({
        ...classChoice,
        characteristics: { might: 0, agility: 0, reason: 0, intuition: 0, presence: 0 },
      });
    }
  }

  const selectedArray = selectedArrayIndex !== null ? classData.arrays[selectedArrayIndex] : null;
  const allAssigned = assignments.length > 0 && assignments.every((a) => a !== '');
  const finalCharacteristics = selectedArray && allAssigned
    ? buildCharacteristics(selectedArray, assignments)
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
          Your {className} has fixed characteristics. Choose an array and assign
          each value to a remaining characteristic.
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
              <div className="rounded-2xl border-2 border-gold/60 bg-gold/10 p-1">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {classData.arrays.map((arr, index) => {
            const isSelected = selectedArrayIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectArray(index)}
                className={[
                  'relative rounded-2xl border-2 px-4 py-3 font-heading text-lg tracking-wide transition-all duration-200',
                  'hover:scale-[1.03] hover:shadow-md',
                  isSelected
                    ? 'border-gold bg-gold/15 text-gold-light shadow-md shadow-gold/10'
                    : 'border-gold-dark/30 bg-surface-light text-cream-dark/80 hover:border-gold-dark/60',
                ].join(' ')}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/40 ring-2 ring-gold/30 z-10">
                    <svg className="w-3 h-3 text-ink" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className="font-display text-base">
                  [ {formatArrayLabel(arr)} ]
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assignment UI */}
      {selectedArray && (
        <div className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-xl text-gold-light">
            <span className="h-px flex-1 bg-gradient-to-r from-gold-dark/50 to-transparent" />
            <span>Assign Values</span>
            <span className="h-px flex-1 bg-gradient-to-l from-gold-dark/50 to-transparent" />
          </h3>
          <p className="font-body mb-4 text-center text-sm text-cream-dark/70">
            Assign each array value to one of your remaining characteristics:{' '}
            {remainingStats.map((s) => capitalize(s)).join(', ')}.
          </p>
          <div className="mx-auto max-w-md flex flex-col gap-3">
            {selectedArray.map((value, slotIndex) => {
              const currentAssign = assignments[slotIndex] ?? '';
              // Available stats: remaining stats not already assigned to another slot
              const takenByOthers = assignments
                .filter((_, i) => i !== slotIndex)
                .filter(Boolean);

              return (
                <div
                  key={slotIndex}
                  className="flex items-center gap-3 rounded-2xl border border-gold-dark/20 bg-surface-light px-4 py-3"
                >
                  <span
                    className={[
                      'shrink-0 w-12 h-12 flex items-center justify-center rounded-xl font-heading text-xl font-bold',
                      value > 0
                        ? 'bg-gold/15 text-gold-light border border-gold/30'
                        : value < 0
                          ? 'bg-crimson/10 text-crimson/80 border border-crimson/20'
                          : 'bg-surface-lighter text-cream-dark/60 border border-gold-dark/15',
                    ].join(' ')}
                  >
                    {formatValue(value)}
                  </span>
                  <svg className="w-4 h-4 text-gold-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <select
                    value={currentAssign}
                    onChange={(e) => handleAssign(slotIndex, e.target.value as CharacteristicName | '')}
                    className={[
                      'flex-1 rounded-xl border px-3 py-2.5 font-heading text-sm uppercase tracking-wider outline-none transition-colors',
                      currentAssign
                        ? 'border-gold/40 bg-gold/10 text-gold-light'
                        : 'border-gold-dark/30 bg-surface text-cream-dark/60',
                      'focus:border-gold focus:ring-1 focus:ring-gold',
                    ].join(' ')}
                  >
                    <option value="">— Select —</option>
                    {remainingStats
                      .filter((s) => !takenByOthers.includes(s))
                      .map((s) => (
                        <option key={s} value={s}>
                          {capitalize(s)}
                        </option>
                      ))}
                  </select>
                </div>
              );
            })}
          </div>
          {!allAssigned && assignments.some((a) => a) && (
            <p className="mt-3 text-center font-body text-xs text-gold-muted italic">
              Assign all values to continue.
            </p>
          )}
        </div>
      )}

      {/* Result Preview */}
      {finalCharacteristics && (
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
                      'rounded-2xl border-2 p-1',
                      isFixed
                        ? 'border-gold/60 bg-gold/10'
                        : 'border-amber-600/40 bg-surface-lighter',
                    ].join(' ')}
                  >
                    <StatBlock
                      label={capitalize(stat)}
                      value={finalCharacteristics[stat]}
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
