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
  type?: string;
  description: string;
  level: number;
  subclass?: string;
  subclass_effects?: Record<string, string>;
  feature_type?: string;
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
        name: 'Free Strike',
        type: 'Main action',
        description: 'Make a basic melee or ranged attack. Roll 2d10 + characteristic. Damage is based on your kit\'s weapon damage tiers.',
      },
      {
        name: 'Charge',
        type: 'Main action',
        description:
          'Move up to your speed in a straight line without shifting, then make a melee free strike or use an ability with the Charge keyword against a creature at the end of the move.',
      },
      {
        name: 'Defend',
        type: 'Main action',
        description:
          'All ability power rolls made against you have a double bane until the start of your next turn. No benefit while another creature is taunted by you.',
      },
      {
        name: 'Heal',
        type: 'Main action',
        description:
          'Choose an adjacent creature who can spend a Recovery or make a saving throw.',
      },
    ],
  },
  {
    category: 'Maneuvers',
    actions: [
      {
        name: 'Aid Attack',
        type: 'Maneuver',
        description: 'Choose an adjacent enemy. The next ability power roll an ally makes against them before the start of your next turn has an edge.',
      },
      {
        name: 'Catch Breath',
        type: 'Maneuver',
        description: 'Spend a Recovery to regain stamina equal to your recovery value.',
      },
      {
        name: 'Escape Grab',
        type: 'Maneuver',
        description:
          'Power Roll + M or A. ≤11: No effect. 12-16: You escape but the grabber can make a melee free strike first. 17+: You are no longer grabbed. Bane if your size is smaller than the grabber.',
      },
      {
        name: 'Grab',
        type: 'Maneuver',
        description:
          'Power Roll + M vs. adjacent creature. ≤11: No effect. 12-16: You grab, but target makes a free strike first. 17+: Target is grabbed (speed 0). Usually targets your size or smaller; Might 2+ can target up to your Might score.',
      },
      {
        name: 'Knockback',
        type: 'Maneuver',
        description:
          'Power Roll + M vs. adjacent creature. ≤11: Push 1. 12-16: Push 2. 17+: Push 3. Usually targets your size or smaller; Might 2+ can target up to your Might score.',
      },
      {
        name: 'Hide',
        type: 'Maneuver',
        description:
          'Become hidden from creatures who aren\'t observing you while you have cover or concealment from them.',
      },
      {
        name: 'Stand Up',
        type: 'Maneuver',
        description: 'Stand up from prone, ending that condition. You can also use this to make an adjacent prone creature stand up.',
      },
      {
        name: 'Drink Potion',
        type: 'Maneuver',
        description: 'Drink a potion you have equipped or give one to an adjacent willing creature.',
      },
    ],
  },
  {
    category: 'Move Actions',
    actions: [
      {
        name: 'Advance',
        type: 'Move action',
        description: 'Move a number of squares up to your speed. You can break up this movement with your maneuver and action.',
      },
      {
        name: 'Disengage',
        type: 'Move action',
        description:
          'Shift 1 square. Shifting does not provoke opportunity attacks. You can\'t shift into difficult terrain.',
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
          'When an adjacent enemy moves away without shifting, you can make a melee free strike against them as a free triggered action.',
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
  const [expandedStandard, setExpandedStandard] = useState(false);
  const [expandedClassFeatures, setExpandedClassFeatures] = useState(false);
  const [expandedAbilities, setExpandedAbilities] = useState(false);
  const [expandedKit, setExpandedKit] = useState(false);
  const [expandedTraits, setExpandedTraits] = useState(false);

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
      // Filter out features for other subclasses
      if (f.subclass && subclassId && f.subclass.toLowerCase() !== subclassId.toLowerCase()) return false;
      const fType = f.type ?? 'Passive';
      if (filter === 'all') return true;
      if (filter === 'Triggered action') {
        return fType.includes('Triggered') || fType.includes('triggered');
      }
      if (filter === 'Main action') return fType === 'Main action';
      if (filter === 'Maneuver') return fType === 'Maneuver' || fType === 'Free maneuver';
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
            className="w-full flex items-center justify-between group"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Standard Actions
            </h3>
            <span className="w-6 h-6 flex items-center justify-center rounded-lg border border-gold/20 bg-gold/5 text-gold font-heading text-sm group-hover:border-gold/40 group-hover:bg-gold/10 transition-all">
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
            className="w-full flex items-center justify-between group"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Class Features
            </h3>
            <span className="w-6 h-6 flex items-center justify-center rounded-lg border border-gold/20 bg-gold/5 text-gold font-heading text-sm group-hover:border-gold/40 group-hover:bg-gold/10 transition-all">
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
                        (feature.type ?? '').includes('triggered') || (feature.type ?? '').includes('Triggered')
                          ? 'bg-amber-900/30 text-amber-400/80'
                          : !feature.type || feature.type === 'Passive'
                            ? 'bg-blue-900/30 text-blue-400/80'
                            : feature.type === 'Free maneuver'
                              ? 'bg-emerald-900/30 text-emerald-400/80'
                              : 'bg-gold/15 text-gold',
                      ].join(' ')}
                    >
                      {feature.type ?? (feature.subclass ? `${feature.subclass}` : 'Feature')}
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
                      <div className="mt-2 px-3 py-2 rounded-xl bg-amber-900/15 border border-amber-500/20">
                        <p className="font-heading text-[0.55rem] text-amber-400/80 uppercase tracking-wider mb-1 font-semibold">
                          {match[0]}
                        </p>
                        <p className="font-body text-[0.65rem] text-cream-dark/70 leading-relaxed">
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
            className="w-full flex items-center justify-between group"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Kit Ability
            </h3>
            <span className="w-6 h-6 flex items-center justify-center rounded-lg border border-gold/20 bg-gold/5 text-gold font-heading text-sm group-hover:border-gold/40 group-hover:bg-gold/10 transition-all">
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
            className="w-full flex items-center justify-between group"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Class Abilities
            </h3>
            <span className="w-6 h-6 flex items-center justify-center rounded-lg border border-gold/20 bg-gold/5 text-gold font-heading text-sm group-hover:border-gold/40 group-hover:bg-gold/10 transition-all">
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
            className="w-full flex items-center justify-between group"
          >
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
              Ancestry &amp; Trait Actions
            </h3>
            <span className="w-6 h-6 flex items-center justify-center rounded-lg border border-gold/20 bg-gold/5 text-gold font-heading text-sm group-hover:border-gold/40 group-hover:bg-gold/10 transition-all">
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
