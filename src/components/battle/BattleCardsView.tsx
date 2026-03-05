import { useMemo } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import abilitiesData from '../../data/abilities.json';
import { resolveAbility } from '../../engine/ability-resolver';
import type { RawAbility, ResolvedAbility } from '../../engine/ability-resolver';
import { BattleCard } from './BattleCard';

interface ClassAbilities {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: RawAbility[];
  heroic_abilities: RawAbility[];
}

const classAbilities = abilitiesData.classes as Record<string, ClassAbilities>;

/** Capitalize a classId for display, e.g. "censor" => "Censor" */
function formatClassName(classId: string): string {
  return classId.charAt(0).toUpperCase() + classId.slice(1);
}

/** Sort order for ability cost groups */
function costSortKey(cost: string): number {
  if (cost === 'Signature') return 0;
  const match = cost.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 99;
}

/** Group resolved abilities by cost label */
function groupByCost(
  abilities: ResolvedAbility[],
): { label: string; abilities: ResolvedAbility[] }[] {
  const groups = new Map<string, ResolvedAbility[]>();

  for (const ability of abilities) {
    const key = ability.cost;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(ability);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => costSortKey(a) - costSortKey(b))
    .map(([label, groupAbilities]) => ({ label, abilities: groupAbilities }));
}

export function BattleCardsView() {
  const character = useCharacterStore((s) => s.character);
  const classChoice = character.classChoice;

  const resolvedAbilities = useMemo(() => {
    if (!classChoice) return [];

    const { classId, characteristics, signatureAbilityName, heroicAbilities } =
      classChoice;
    const classData = classAbilities[classId];
    if (!classData) return [];

    const selectedNames = new Set<string>();
    if (signatureAbilityName) selectedNames.add(signatureAbilityName);
    for (const name of heroicAbilities) {
      selectedNames.add(name);
    }

    if (selectedNames.size === 0) return [];

    // Find the raw abilities that match the selected names
    const allRawAbilities: RawAbility[] = [
      ...classData.signature_abilities,
      ...classData.heroic_abilities,
    ];

    const matched: RawAbility[] = [];
    for (const name of selectedNames) {
      const found = allRawAbilities.find((a) => a.name === name);
      if (found) matched.push(found);
    }

    // Resolve each ability with the character's characteristics
    return matched.map((raw) => resolveAbility(raw, characteristics));
  }, [classChoice]);

  // No class selected
  if (!classChoice) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-4">
        <h2 className="font-heading text-2xl text-gold-dark tracking-wide">
          No Character Data
        </h2>
        <p className="font-body text-cream-dark/50 text-center max-w-md">
          Complete the character creation wizard to generate your battle cards.
          You need to select a class and abilities first.
        </p>
      </div>
    );
  }

  // No abilities selected
  if (resolvedAbilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-4">
        <h2 className="font-heading text-2xl text-gold-dark tracking-wide">
          No Abilities Selected
        </h2>
        <p className="font-body text-cream-dark/50 text-center max-w-md">
          Return to the Abilities step in the wizard to choose your signature
          ability and heroic abilities. Your battle cards will appear here once
          selected.
        </p>
      </div>
    );
  }

  const grouped = groupByCost(resolvedAbilities);
  const className = formatClassName(classChoice.classId);
  const displayName = character.name || 'Unnamed Hero';

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl gold-text tracking-wide">
            {displayName}
          </h1>
          <p className="font-heading text-sm text-gold-muted tracking-wider uppercase mt-1">
            {className} -- Battle Cards
          </p>
        </div>
        <button
          type="button"
          className="btn-primary print:hidden"
          onClick={() => window.print()}
        >
          Print Battle Cards
        </button>
      </div>

      <div className="divider" />

      {/* Ability groups */}
      {grouped.map((group) => (
        <section key={group.label}>
          <h2 className="font-heading text-lg text-gold-light tracking-wide mb-3">
            {group.label === 'Signature'
              ? 'Signature Ability'
              : `${group.label} Abilities`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {group.abilities.map((ability) => (
              <BattleCard key={ability.name} ability={ability} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
