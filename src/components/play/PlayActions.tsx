import { useMemo, useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import abilitiesData from '../../data/abilities.json';
import { resolveAbility } from '../../engine/ability-resolver';
import type { RawAbility, ResolvedAbility } from '../../engine/ability-resolver';

interface ClassAbilities {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: RawAbility[];
  heroic_abilities: RawAbility[];
}

const classAbilities = abilitiesData.classes as Record<string, ClassAbilities>;

const STANDARD_ACTIONS: {
  category: string;
  actions: { name: string; type: string; description: string }[];
}[] = [
  {
    category: 'Main Actions',
    actions: [
      {
        name: 'Attack',
        type: 'Main action',
        description: 'Use one of your abilities that requires a main action.',
      },
      {
        name: 'Charge',
        type: 'Main action',
        description:
          'Move up to your speed in a straight line, then make a melee free strike or use an ability with the Charge keyword against a target adjacent to you at the end of the move.',
      },
      {
        name: 'Defend',
        type: 'Main action',
        description:
          'You have a double edge on resistance rolls until the start of your next turn and enemies take a bane on attacks against you.',
      },
      {
        name: 'Heal',
        type: 'Main action',
        description:
          'Spend a Recovery to regain Stamina equal to your recovery value. You can also use this on an adjacent dying ally.',
      },
    ],
  },
  {
    category: 'Maneuvers',
    actions: [
      {
        name: 'Drink Potion',
        type: 'Maneuver',
        description: 'Drink a potion you have equipped or give one to an adjacent willing creature.',
      },
      {
        name: 'Knockback',
        type: 'Maneuver',
        description:
          'Push an adjacent creature 1 square. If the creature is your size or smaller, this automatically succeeds.',
      },
      {
        name: 'Make or Assist a Test',
        type: 'Maneuver',
        description: 'Make a test using a skill, or assist an adjacent ally with their test.',
      },
      {
        name: 'Stand Up',
        type: 'Maneuver',
        description: 'Stand up from prone. Can only be used while prone.',
      },
      {
        name: 'Grab',
        type: 'Maneuver',
        description:
          'Attempt to grab an adjacent creature of your size or smaller. Make a Might test vs. their Might or Agility.',
      },
      {
        name: 'Hide',
        type: 'Maneuver',
        description:
          'While you have cover or concealment, make an Agility test to become hidden.',
      },
    ],
  },
  {
    category: 'Move Actions',
    actions: [
      {
        name: 'Move',
        type: 'Move action',
        description: 'Move up to your speed in squares.',
      },
      {
        name: 'Shift',
        type: 'Move action',
        description:
          'Move 1 square without provoking opportunity attacks (disengage). Some kits grant bonus disengage squares.',
      },
    ],
  },
  {
    category: 'Triggered Actions',
    actions: [
      {
        name: 'Opportunity Attack',
        type: 'Triggered action',
        description:
          'When an enemy adjacent to you moves away without shifting, you can make a free strike against them.',
      },
    ],
  },
  {
    category: 'Free Actions',
    actions: [
      {
        name: 'Free Strike',
        type: 'Free',
        description:
          'A basic attack available to all heroes. Melee: 2 + M damage. Ranged: 2 + A damage. Used with opportunity attacks and charges.',
      },
    ],
  },
];

type ActionCategory = 'all' | 'Main action' | 'Maneuver' | 'Move action' | 'Triggered action' | 'Free maneuver' | 'Free triggered action';

const CATEGORY_FILTERS: { id: ActionCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Main action', label: 'Main' },
  { id: 'Maneuver', label: 'Maneuver' },
  { id: 'Move action', label: 'Move' },
  { id: 'Triggered action', label: 'Triggered' },
];

export function PlayActions() {
  const character = useCharacterStore((s) => s.character);
  const classChoice = character.classChoice;
  const [filter, setFilter] = useState<ActionCategory>('all');
  const [expandedStandard, setExpandedStandard] = useState(true);
  const [expandedAbilities, setExpandedAbilities] = useState(true);

  // Group character abilities by action type
  const abilityGroups = useMemo(() => {
    if (!classChoice) return new Map<string, ResolvedAbility[]>();

    const { classId, characteristics, signatureAbilityName, heroicAbilities } = classChoice;
    const classData = classAbilities[classId];
    if (!classData) return new Map<string, ResolvedAbility[]>();

    const selectedNames = new Set<string>();
    if (signatureAbilityName) selectedNames.add(signatureAbilityName);
    for (const name of heroicAbilities) selectedNames.add(name);

    const allRaw: RawAbility[] = [
      ...classData.signature_abilities,
      ...classData.heroic_abilities,
    ];

    const groups = new Map<string, ResolvedAbility[]>();
    for (const name of selectedNames) {
      const raw = allRaw.find((a) => a.name === name);
      if (!raw) continue;
      const resolved = resolveAbility(raw, characteristics);
      const type = resolved.type;
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type)!.push(resolved);
    }
    return groups;
  }, [classChoice]);

  // Filter standard actions
  const filteredStandard = STANDARD_ACTIONS.filter((cat) => {
    if (filter === 'all') return true;
    return cat.actions.some((a) => a.type === filter || (filter === 'Triggered action' && a.type.includes('Triggered')));
  }).map((cat) => ({
    ...cat,
    actions: filter === 'all'
      ? cat.actions
      : cat.actions.filter((a) => a.type === filter || (filter === 'Triggered action' && a.type.includes('Triggered'))),
  })).filter((cat) => cat.actions.length > 0);

  // Filter abilities
  const filteredAbilities = Array.from(abilityGroups.entries()).filter(([type]) => {
    if (filter === 'all') return true;
    return type === filter;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={[
              'px-3 py-1.5 rounded-xl font-heading text-[0.6rem] uppercase tracking-wider border transition-all',
              filter === f.id
                ? 'border-gold bg-gold/10 text-gold-light'
                : 'border-gold/8 text-cream-dark/40 hover:border-gold/25 hover:text-cream-dark/60',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Standard Actions */}
      {filteredStandard.length > 0 && (
        <div className="card px-4 py-3">
          <button
            type="button"
            onClick={() => setExpandedStandard(!expandedStandard)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Standard Actions
            </h3>
            <span className="font-heading text-xs text-gold-muted">
              {expandedStandard ? '−' : '+'}
            </span>
          </button>

          {expandedStandard && (
            <div className="mt-3 flex flex-col gap-2">
              {filteredStandard.map((cat) => (
                <div key={cat.category}>
                  <p className="font-heading text-[0.6rem] uppercase tracking-wider text-gold-muted/60 mb-1.5">
                    {cat.category}
                  </p>
                  {cat.actions.map((action) => (
                    <div
                      key={action.name}
                      className="px-3 py-2 rounded-xl bg-surface-light/20 border border-gold/5 mb-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs text-gold-light font-semibold">
                          {action.name}
                        </span>
                        <span className="text-[0.5rem] font-heading uppercase tracking-wider text-cream-dark/30">
                          {action.type}
                        </span>
                      </div>
                      <p className="font-body text-[0.65rem] text-cream-dark/50 mt-0.5 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Character Abilities by Type */}
      {filteredAbilities.length > 0 && (
        <div className="card px-4 py-3">
          <button
            type="button"
            onClick={() => setExpandedAbilities(!expandedAbilities)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Your Abilities
            </h3>
            <span className="font-heading text-xs text-gold-muted">
              {expandedAbilities ? '−' : '+'}
            </span>
          </button>

          {expandedAbilities && (
            <div className="mt-3 flex flex-col gap-3">
              {filteredAbilities.map(([type, abilities]) => (
                <div key={type}>
                  <p className="font-heading text-[0.6rem] uppercase tracking-wider text-gold-muted/60 mb-1.5">
                    {type}
                  </p>
                  {abilities.map((ability) => (
                    <div
                      key={ability.name}
                      className="px-3 py-2.5 rounded-xl bg-surface-light/20 border border-gold/5 mb-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-heading text-xs text-gold-light font-semibold">
                          {ability.name}
                        </span>
                        <span
                          className={[
                            'shrink-0 px-2 py-0.5 rounded-full text-[0.5rem] font-heading font-semibold tracking-wider uppercase',
                            ability.cost === 'Signature'
                              ? 'bg-gold/15 text-gold'
                              : 'bg-crimson/15 text-crimson',
                          ].join(' ')}
                        >
                          {ability.cost}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-2 text-[0.6rem] font-body text-cream-dark/40 mt-0.5">
                        <span>{ability.distance}</span>
                        <span>{ability.target}</span>
                      </div>
                      {ability.powerRoll && (
                        <p className="font-heading text-[0.55rem] text-gold-muted mt-1">
                          {ability.powerRoll}
                        </p>
                      )}
                      {ability.tier1 && (
                        <div className="mt-1 text-[0.6rem] font-body text-cream-dark/45 flex flex-col gap-0.5">
                          <span>11-: {ability.tier1}</span>
                          <span>12+: {ability.tier2}</span>
                          <span className="text-gold-light/80">17+: {ability.tier3}</span>
                        </div>
                      )}
                      {ability.effect && (
                        <p className="font-body text-[0.6rem] text-cream-dark/40 mt-1">
                          Effect: {ability.effect}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {filteredAbilities.length === 0 && filteredStandard.length === 0 && (
        <div className="text-center py-8">
          <p className="font-body text-sm text-cream-dark/40">
            No actions match the current filter.
          </p>
        </div>
      )}
    </div>
  );
}
