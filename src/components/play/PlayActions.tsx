import { useMemo, useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import abilitiesData from '../../data/abilities.json';
import classFeaturesData from '../../data/class-features.json';
import kitsData from '../../data/kits.json';
import ancestriesData from '../../data/ancestries.json';
import { resolveAbility } from '../../engine/ability-resolver';
import type { RawAbility, ResolvedAbility } from '../../engine/ability-resolver';

interface ClassAbilities {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: RawAbility[];
  heroic_abilities: RawAbility[];
}

const classAbilities = abilitiesData.classes as Record<string, ClassAbilities>;

interface KitSignatureAbility {
  name: string;
  flavor?: string;
  keywords: string[];
  type: string;
  distance: string;
  target: string;
  powerRoll?: string;
  tier1?: string;
  tier2?: string;
  tier3?: string;
  effect?: string;
}

interface KitData {
  name: string;
  description: string;
  signatureAbility?: KitSignatureAbility;
}

const standardKits = (kitsData as Record<string, unknown>).standardKits as Record<string, KitData>;

interface AncestryTrait {
  name: string;
  cost: number;
  description: string;
  ability?: {
    name: string;
    keywords: string[];
    type: string;
    distance: string;
    target: string;
    power_roll?: string;
    tier1?: string;
    tier2?: string;
    tier3?: string;
    effect?: string;
  };
}

interface AncestryData {
  name: string;
  signatureTraits: { name: string; description: string }[];
  purchasedTraits: AncestryTrait[];
}

const ancestries = (ancestriesData as Record<string, unknown>).ancestries as Record<string, AncestryData>;

interface ClassFeature {
  name: string;
  type: string;
  description: string;
  level: number;
  subclass_effects?: Record<string, string>;
}

interface ClassFeaturesEntry {
  resource_name: string;
  resource_generation: string[];
  features: ClassFeature[];
}

const classFeatures = (classFeaturesData as { classes: Record<string, ClassFeaturesEntry> }).classes;

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

/** Check if a type string loosely matches a filter category */
function matchesFilter(type: string, filter: ActionCategory): boolean {
  if (filter === 'all') return true;
  if (filter === 'Triggered action') {
    return type.includes('Triggered') || type.includes('triggered');
  }
  return type === filter;
}

export function PlayActions() {
  const character = useCharacterStore((s) => s.character);
  const classChoice = character.classChoice;
  const [filter, setFilter] = useState<ActionCategory>('all');
  const [expandedStandard, setExpandedStandard] = useState(true);
  const [expandedClassFeatures, setExpandedClassFeatures] = useState(true);
  const [expandedAbilities, setExpandedAbilities] = useState(true);
  const [expandedKit, setExpandedKit] = useState(true);
  const [expandedTraits, setExpandedTraits] = useState(true);

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

  // Kit signature ability
  const kitAbility = useMemo(() => {
    const kitId = classChoice?.kitId;
    if (!kitId) return null;
    const kit = standardKits[kitId];
    if (!kit?.signatureAbility) return null;
    return kit.signatureAbility;
  }, [classChoice?.kitId]);

  // Ancestry traits with triggered/special actions
  const traitActions = useMemo(() => {
    const ancestryId = character.ancestryId === 'revenant'
      ? character.formerLifeAncestryId
      : character.ancestryId;
    if (!ancestryId) return [];

    const ancestry = ancestries[ancestryId];
    if (!ancestry) return [];

    const selectedTraitNames = new Set(character.selectedTraits.map((t) => t.name));

    const result: { name: string; description: string; type: string; hasAbility: boolean; ability?: AncestryTrait['ability'] }[] = [];

    // Signature traits (always active)
    for (const trait of ancestry.signatureTraits) {
      const desc = trait.description.toLowerCase();
      if (desc.includes('triggered') || desc.includes('free strike') || desc.includes('maneuver') || desc.includes('action')) {
        result.push({ name: trait.name, description: trait.description, type: 'Signature Trait', hasAbility: false });
      }
    }

    // Purchased traits (only selected ones)
    for (const trait of ancestry.purchasedTraits) {
      if (!selectedTraitNames.has(trait.name)) continue;
      const desc = trait.description.toLowerCase();
      if (desc.includes('triggered') || desc.includes('free strike') || desc.includes('maneuver')) {
        result.push({
          name: trait.name,
          description: trait.description,
          type: 'Ancestry Trait',
          hasAbility: !!trait.ability,
          ability: trait.ability,
        });
      }
    }

    return result;
  }, [character.ancestryId, character.formerLifeAncestryId, character.selectedTraits]);

  // Class features (triggered actions, resource gen, passives)
  const subclassId = classChoice?.subclassId;
  const classFeaturesForClass = useMemo(() => {
    const classId = classChoice?.classId;
    if (!classId) return null;
    return classFeatures[classId] ?? null;
  }, [classChoice?.classId]);

  const filteredClassFeatures = useMemo(() => {
    if (!classFeaturesForClass) return [];
    const level = character.level ?? 1;
    return classFeaturesForClass.features.filter((f) => {
      if (f.level > level) return false;
      if (filter === 'all') return true;
      if (filter === 'Triggered action') {
        return f.type.includes('Triggered') || f.type.includes('triggered');
      }
      if (filter === 'Main action') return f.type === 'Main action';
      if (filter === 'Maneuver') return f.type === 'Maneuver' || f.type === 'Free maneuver';
      return false;
    });
  }, [classFeaturesForClass, character.level, filter]);

  const showClassFeatures = classFeaturesForClass && (filter === 'all' || filteredClassFeatures.length > 0);

  // Filter standard actions
  const filteredStandard = STANDARD_ACTIONS.filter((cat) => {
    if (filter === 'all') return true;
    return cat.actions.some((a) => matchesFilter(a.type, filter));
  }).map((cat) => ({
    ...cat,
    actions: filter === 'all'
      ? cat.actions
      : cat.actions.filter((a) => matchesFilter(a.type, filter)),
  })).filter((cat) => cat.actions.length > 0);

  // Filter abilities
  const filteredAbilities = Array.from(abilityGroups.entries()).filter(([type]) =>
    matchesFilter(type, filter),
  );

  // Filter kit ability
  const showKit = kitAbility && (filter === 'all' || matchesFilter(kitAbility.type, filter));

  // Filter trait actions
  const showTraits = traitActions.length > 0 && (filter === 'all' || filter === 'Triggered action');

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
              {expandedStandard ? '\u2212' : '+'}
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

      {/* Class Features */}
      {showClassFeatures && classFeaturesForClass && (
        <div className="card px-4 py-3">
          <button
            type="button"
            onClick={() => setExpandedClassFeatures(!expandedClassFeatures)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Class Features
            </h3>
            <span className="font-heading text-xs text-gold-muted">
              {expandedClassFeatures ? '\u2212' : '+'}
            </span>
          </button>

          {expandedClassFeatures && (
            <div className="mt-3 flex flex-col gap-2">
              {/* Resource Generation Rules */}
              {filter === 'all' && (
                <div className="px-3 py-2.5 rounded-xl bg-surface-light/20 border border-gold/5 mb-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-heading text-xs text-gold-light font-semibold">
                      {classFeaturesForClass.resource_name} Generation
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[0.5rem] font-heading font-semibold tracking-wider uppercase bg-gold/15 text-gold">
                      Resource
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {classFeaturesForClass.resource_generation.map((rule, i) => (
                      <li
                        key={i}
                        className="font-body text-[0.65rem] text-cream-dark/50 leading-relaxed pl-2 border-l border-gold/10"
                      >
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feature Actions */}
              {filteredClassFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className="px-3 py-2.5 rounded-xl bg-surface-light/20 border border-gold/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-heading text-xs text-gold-light font-semibold">
                      {feature.name}
                    </span>
                    <span
                      className={[
                        'shrink-0 px-2 py-0.5 rounded-full text-[0.5rem] font-heading font-semibold tracking-wider uppercase',
                        feature.type.includes('triggered') || feature.type.includes('Triggered')
                          ? 'bg-amber-900/30 text-amber-400/80'
                          : feature.type === 'Passive'
                            ? 'bg-blue-900/30 text-blue-400/80'
                            : feature.type === 'Free maneuver'
                              ? 'bg-emerald-900/30 text-emerald-400/80'
                              : 'bg-gold/15 text-gold',
                      ].join(' ')}
                    >
                      {feature.type}
                    </span>
                  </div>
                  <p className="font-body text-[0.65rem] text-cream-dark/50 mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.subclass_effects && subclassId && (() => {
                    const match = Object.entries(feature.subclass_effects).find(
                      ([key]) => key.toLowerCase() === subclassId.toLowerCase(),
                    );
                    if (!match) return null;
                    return (
                      <div className="mt-1.5 px-2 py-1.5 rounded-lg bg-gold/5 border border-gold/10">
                        <p className="font-heading text-[0.5rem] text-gold-muted uppercase tracking-wider mb-0.5">
                          {match[0]}
                        </p>
                        <p className="font-body text-[0.6rem] text-cream-dark/60 leading-relaxed">
                          {match[1]}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kit Signature Ability */}
      {showKit && kitAbility && (
        <div className="card px-4 py-3">
          <button
            type="button"
            onClick={() => setExpandedKit(!expandedKit)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Kit Ability
            </h3>
            <span className="font-heading text-xs text-gold-muted">
              {expandedKit ? '\u2212' : '+'}
            </span>
          </button>

          {expandedKit && (
            <div className="mt-3">
              <div className="px-3 py-2.5 rounded-xl bg-surface-light/20 border border-gold/5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-heading text-xs text-gold-light font-semibold">
                    {kitAbility.name}
                  </span>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[0.5rem] font-heading font-semibold tracking-wider uppercase bg-gold/15 text-gold">
                    Kit
                  </span>
                </div>
                {kitAbility.flavor && (
                  <p className="font-body text-[0.6rem] text-cream-dark/40 italic mt-0.5">
                    {kitAbility.flavor}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-2 text-[0.6rem] font-body text-cream-dark/40 mt-1">
                  <span>{kitAbility.type}</span>
                  <span>{kitAbility.distance}</span>
                  <span>{kitAbility.target}</span>
                </div>
                {kitAbility.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {kitAbility.keywords.map((kw) => (
                      <span key={kw} className="text-[0.5rem] font-heading uppercase tracking-wider text-gold-muted/60 bg-gold/5 px-1.5 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
                {kitAbility.powerRoll && (
                  <p className="font-heading text-[0.55rem] text-gold-muted mt-1">
                    Power Roll + {kitAbility.powerRoll}
                  </p>
                )}
                {kitAbility.tier1 && (
                  <div className="mt-1 text-[0.6rem] font-body text-cream-dark/45 flex flex-col gap-0.5">
                    <span>11-: {kitAbility.tier1}</span>
                    <span>12+: {kitAbility.tier2}</span>
                    <span className="text-gold-light/80">17+: {kitAbility.tier3}</span>
                  </div>
                )}
                {kitAbility.effect && (
                  <p className="font-body text-[0.6rem] text-cream-dark/40 mt-1">
                    Effect: {kitAbility.effect}
                  </p>
                )}
              </div>
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
              Class Abilities
            </h3>
            <span className="font-heading text-xs text-gold-muted">
              {expandedAbilities ? '\u2212' : '+'}
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

      {/* Ancestry & Trait Triggered Actions */}
      {showTraits && (
        <div className="card px-4 py-3">
          <button
            type="button"
            onClick={() => setExpandedTraits(!expandedTraits)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Ancestry &amp; Trait Actions
            </h3>
            <span className="font-heading text-xs text-gold-muted">
              {expandedTraits ? '\u2212' : '+'}
            </span>
          </button>

          {expandedTraits && (
            <div className="mt-3 flex flex-col gap-1.5">
              {traitActions.map((trait) => (
                <div
                  key={trait.name}
                  className="px-3 py-2.5 rounded-xl bg-surface-light/20 border border-gold/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-heading text-xs text-gold-light font-semibold">
                      {trait.name}
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[0.5rem] font-heading font-semibold tracking-wider uppercase bg-emerald-900/30 text-emerald-400/80">
                      {trait.type}
                    </span>
                  </div>
                  <p className="font-body text-[0.6rem] text-cream-dark/50 mt-1 leading-relaxed">
                    {trait.description}
                  </p>
                  {trait.hasAbility && trait.ability && (
                    <div className="mt-2 px-2 py-2 rounded-lg bg-surface/30 border border-gold/5">
                      <div className="flex flex-wrap gap-x-2 text-[0.55rem] font-body text-cream-dark/40">
                        <span>{trait.ability.type}</span>
                        <span>{trait.ability.distance}</span>
                        <span>{trait.ability.target}</span>
                      </div>
                      {trait.ability.tier1 && (
                        <div className="mt-1 text-[0.55rem] font-body text-cream-dark/40 flex flex-col gap-0.5">
                          <span>11-: {trait.ability.tier1}</span>
                          <span>12+: {trait.ability.tier2}</span>
                          <span className="text-gold-light/80">17+: {trait.ability.tier3}</span>
                        </div>
                      )}
                      {trait.ability.effect && (
                        <p className="font-body text-[0.55rem] text-cream-dark/40 mt-1">
                          Effect: {trait.ability.effect}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {filteredAbilities.length === 0 && filteredStandard.length === 0 && !showClassFeatures && !showKit && !showTraits && (
        <div className="text-center py-8">
          <p className="font-body text-sm text-cream-dark/40">
            No actions match the current filter.
          </p>
        </div>
      )}
    </div>
  );
}
