import { useMemo } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import abilitiesData from '../../data/abilities.json';
import { resolveAbility } from '../../engine/ability-resolver';
import type { RawAbility, ResolvedAbility } from '../../engine/ability-resolver';
import { CLASS_RESOURCES } from '../../types/character';

interface ClassAbilities {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: RawAbility[];
  heroic_abilities: RawAbility[];
}

const classAbilities = abilitiesData.classes as Record<string, ClassAbilities>;

function costSortKey(cost: string): number {
  if (cost === 'Signature') return 0;
  const match = cost.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 99;
}

function AbilityPlayCard({ ability }: { ability: ResolvedAbility }) {
  const hasPowerRoll = ability.powerRoll && ability.tier1;
  const costLabel = ability.cost === 'Signature' ? 'Signature' : ability.cost;

  return (
    <div className="card px-4 py-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-heading text-sm text-gold tracking-wide leading-tight">
          {ability.name}
        </h4>
        <span
          className={[
            'shrink-0 px-2 py-0.5 rounded-full text-[0.6rem] font-heading font-semibold tracking-wider uppercase whitespace-nowrap',
            ability.cost === 'Signature'
              ? 'bg-gold/15 text-gold border border-gold/25'
              : 'bg-crimson/15 text-crimson border border-crimson/25',
          ].join(' ')}
        >
          {costLabel}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.65rem] font-body text-cream-dark/60">
        <span>{ability.type}</span>
        <span>{ability.distance}</span>
        <span>{ability.target}</span>
      </div>

      {/* Keywords */}
      {ability.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ability.keywords.map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.5 rounded text-[0.5rem] font-heading uppercase tracking-wider bg-surface-light/60 text-cream-dark/50 border border-gold/5"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Power Roll + Tiers */}
      {hasPowerRoll && (
        <div className="rounded-xl bg-surface/50 border border-gold/8 overflow-hidden">
          <div className="px-3 py-1.5 bg-surface-lighter/50 border-b border-gold/8">
            <span className="font-heading text-[0.6rem] text-gold-muted uppercase tracking-wider">
              {ability.powerRoll}
            </span>
          </div>
          <div className="flex flex-col divide-y divide-gold/5">
            {[
              { label: '11-', value: ability.tier1, style: 'text-cream-dark/60' },
              { label: '12+', value: ability.tier2, style: 'text-cream-dark/70' },
              { label: '17+', value: ability.tier3, style: 'text-gold-light' },
            ].map((tier) => (
              <div key={tier.label} className="flex items-start gap-2 px-3 py-1.5">
                <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-surface-lighter/50 text-[0.5rem] font-heading font-bold text-cream-dark/50">
                  {tier.label}
                </span>
                <span className={`font-body text-xs ${tier.style} leading-snug`}>
                  {tier.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Effect */}
      {ability.effect && (
        <div>
          <span className="font-heading text-[0.5rem] text-gold-muted uppercase tracking-wider">
            Effect
          </span>
          <p className="font-body text-xs text-cream-dark/60 leading-relaxed mt-0.5">
            {ability.effect}
          </p>
        </div>
      )}
    </div>
  );
}

export function PlayAbilities() {
  const character = useCharacterStore((s) => s.character);
  const classChoice = character.classChoice;

  const resolvedAbilities = useMemo(() => {
    if (!classChoice) return [];

    const { classId, characteristics, signatureAbilityName, heroicAbilities } = classChoice;
    const classData = classAbilities[classId];
    if (!classData) return [];

    const selectedNames = new Set<string>();
    if (signatureAbilityName) selectedNames.add(signatureAbilityName);
    for (const name of heroicAbilities) {
      selectedNames.add(name);
    }
    if (selectedNames.size === 0) return [];

    const allRaw: RawAbility[] = [
      ...classData.signature_abilities,
      ...classData.heroic_abilities,
    ];

    const matched: RawAbility[] = [];
    for (const name of selectedNames) {
      const found = allRaw.find((a) => a.name === name);
      if (found) matched.push(found);
    }

    return matched
      .map((raw) => resolveAbility(raw, characteristics))
      .sort((a, b) => costSortKey(a.cost) - costSortKey(b.cost));
  }, [classChoice]);

  const resourceName = classChoice
    ? CLASS_RESOURCES[classChoice.classId] ?? 'Resource'
    : 'Resource';

  if (!classChoice || resolvedAbilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="font-heading text-lg text-gold-muted">No abilities selected</p>
        <p className="font-body text-sm text-cream-dark/40 text-center">
          Complete character creation to see your abilities here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm uppercase tracking-wider text-gold">
          Abilities
        </h2>
        <span className="badge">{resourceName}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {resolvedAbilities.map((ability) => (
          <AbilityPlayCard key={ability.name} ability={ability} />
        ))}
      </div>
    </div>
  );
}
