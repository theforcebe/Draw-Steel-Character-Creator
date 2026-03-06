import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import abilitiesData from '../../data/abilities.json';
import { normalizeRawAbility } from '../../engine/ability-resolver';
import type { RawAbility } from '../../engine/ability-resolver';

type Ability = ReturnType<typeof normalizeRawAbility>;

interface ClassAbilitiesRaw {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: RawAbility[];
  heroic_abilities: RawAbility[];
}

interface ClassAbilities {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: Ability[];
  heroic_abilities: Ability[];
}

const rawClassAbilities = abilitiesData.classes as Record<string, ClassAbilitiesRaw>;

// Normalize all abilities at load time so both data schemas are handled
const classAbilities: Record<string, ClassAbilities> = {};
for (const [id, raw] of Object.entries(rawClassAbilities)) {
  classAbilities[id] = {
    resource: raw.resource,
    primary_characteristics: raw.primary_characteristics,
    signature_abilities: raw.signature_abilities.map(normalizeRawAbility),
    heroic_abilities: raw.heroic_abilities.map(normalizeRawAbility),
  };
}

/** Levels that grant new ability choices (excluding level 1 which is handled separately). */
const ABILITY_GRANT_LEVELS = [2, 3, 5, 6, 8, 9] as const;

/**
 * Extract the numeric cost from an ability cost string.
 * e.g. "3 Wrath" -> 3, "5 Wrath" -> 5, "Signature" -> 0
 */
function getNumericCost(cost: string): number {
  const match = cost.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Filter heroic abilities for level 1 character selection.
 * At level 1, heroes get one 3-cost and one 5-cost ability.
 * Exclude abilities that require a subclass or higher level.
 */
function getLevel1HeroicAbilities(abilities: Ability[]): {
  cost3: Ability[];
  cost5: Ability[];
} {
  const eligible = abilities.filter((a) => {
    // Exclude abilities with a subclass requirement
    if (a.subclass) return false;
    // Exclude abilities with a level requirement > 1
    if (a.level && a.level > 1) return false;
    return true;
  });

  return {
    cost3: eligible.filter((a) => getNumericCost(a.cost) === 3),
    cost5: eligible.filter((a) => getNumericCost(a.cost) === 5),
  };
}

/**
 * Get abilities unlocked at a specific level, filtered by subclass.
 * Abilities with no subclass are available to everyone.
 * Abilities with a subclass are only available if the character has that subclass.
 */
function getAbilitiesForLevel(
  abilities: Ability[],
  targetLevel: number,
  characterSubclassId: string | undefined,
): Ability[] {
  return abilities.filter((a) => {
    if (a.level !== targetLevel) return false;
    if (a.subclass) {
      if (!characterSubclassId) return false;
      return a.subclass.toLowerCase() === characterSubclassId.toLowerCase();
    }
    return true;
  });
}

function AbilityCard({
  ability,
  selected,
  onSelect,
}: {
  ability: Ability;
  selected: boolean;
  onSelect: () => void;
}) {
  const hasPowerRoll = ability.power_roll && ability.tier1;
  const costLabel =
    ability.cost === 'Signature' ? 'Signature' : ability.cost;

  return (
    <ParchmentCard
      selected={selected}
      onClick={onSelect}
      hoverable
      className="flex flex-col gap-2.5 relative"
    >
      {/* Header: Name + Cost badge */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-heading text-base text-gold tracking-wide leading-tight">
          {ability.name}
        </h4>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={[
              'px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold tracking-wider uppercase whitespace-nowrap',
              ability.cost === 'Signature'
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-crimson/20 text-crimson border border-crimson/30',
            ].join(' ')}
          >
            {costLabel}
          </span>
        </div>
      </div>

      {/* Flavor text */}
      {ability.flavor && (
        <p className="font-body text-xs text-cream-dark/50 italic leading-relaxed">
          {ability.flavor}
        </p>
      )}

      {/* Keywords */}
      {ability.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ability.keywords.map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.5 rounded text-[10px] font-heading uppercase tracking-wider bg-surface-light text-cream-dark/70 border border-gold-dark/10"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Action type, distance, target */}
      <div className="flex flex-col gap-1 text-xs font-body text-cream-dark/80">
        <div className="flex gap-4">
          <span>
            <strong className="text-gold-muted">Type:</strong> {ability.type}
          </span>
          <span>
            <strong className="text-gold-muted">Distance:</strong> {ability.distance}
          </span>
        </div>
        <span>
          <strong className="text-gold-muted">Target:</strong> {ability.target}
        </span>
      </div>

      {/* Power Roll + Tiers */}
      {hasPowerRoll && (
        <div className="mt-1 rounded-xl bg-surface/50 border border-gold-dark/10 overflow-hidden">
          {/* Power roll header */}
          <div className="px-3 py-1.5 bg-surface-lighter border-b border-gold-dark/10">
            <span className="font-heading text-xs text-gold-muted uppercase tracking-wider">
              {ability.power_roll}
            </span>
          </div>

          {/* Tier results */}
          <div className="flex flex-col divide-y divide-gold-dark/10">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-surface-lighter text-cream-dark/60 text-[10px] font-heading font-bold">
                11-
              </span>
              <span className="font-body text-xs text-cream-dark/70">{ability.tier1}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-surface-lighter text-cream-dark/80 text-[10px] font-heading font-bold">
                12+
              </span>
              <span className="font-body text-xs text-cream-dark/80">{ability.tier2}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-gold/20 text-gold-light text-[10px] font-heading font-bold">
                17+
              </span>
              <span className="font-body text-xs text-gold-light">{ability.tier3}</span>
            </div>
          </div>
        </div>
      )}

      {/* Effect text */}
      {ability.effect && (
        <div className="mt-0.5">
          <span className="font-heading text-[10px] text-gold-muted uppercase tracking-wider">
            Effect
          </span>
          <p className="font-body text-xs text-cream-dark/70 leading-relaxed mt-0.5">
            {ability.effect}
          </p>
        </div>
      )}

    </ParchmentCard>
  );
}

export function AbilitiesStep() {
  const classChoice = useCharacterStore((s) => s.character.classChoice);
  const characterLevel = useCharacterStore((s) => s.character.level);
  const setClassChoice = useCharacterStore((s) => s.setClassChoice);

  // No class selected
  if (!classChoice) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="font-heading text-xl text-gold-dark tracking-wide">Select a class first</p>
        <p className="font-body text-cream-dark/50">
          Return to the Class step to choose your hero's class before selecting abilities.
        </p>
      </div>
    );
  }

  const { classId, subclassId } = classChoice;
  const classData = classAbilities[classId];

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="font-heading text-xl text-gold-dark tracking-wide">
          Ability data not found
        </p>
        <p className="font-body text-cream-dark/50">
          No abilities data available for this class yet. Coming soon...
        </p>
      </div>
    );
  }

  const { resource, signature_abilities, heroic_abilities } = classData;
  const { cost3, cost5 } = getLevel1HeroicAbilities(heroic_abilities);

  const selectedSigName = classChoice.signatureAbilityName;
  const selectedHeroic = classChoice.heroicAbilities ?? [];

  // The selected 3-cost and 5-cost abilities (level 1)
  const selected3Cost = selectedHeroic.find((name) =>
    cost3.some((a) => a.name === name),
  );
  const selected5Cost = selectedHeroic.find((name) =>
    cost5.some((a) => a.name === name),
  );

  // Build lookup of level-based abilities for levels the character has reached
  const levelAbilityGroups: { level: number; abilities: Ability[]; selectedName: string | undefined }[] = [];
  for (const lvl of ABILITY_GRANT_LEVELS) {
    if (characterLevel < lvl) break;
    const abilities = getAbilitiesForLevel(heroic_abilities, lvl, subclassId);
    if (abilities.length === 0) continue;
    const selectedName = selectedHeroic.find((name) =>
      abilities.some((a) => a.name === name),
    );
    levelAbilityGroups.push({ level: lvl, abilities, selectedName });
  }

  function handleSelectSignature(name: string) {
    if (!classChoice) return;
    setClassChoice({
      ...classChoice,
      signatureAbilityName: name,
    });
  }

  /**
   * Rebuild the heroicAbilities array preserving selections from other sections.
   * Each section "owns" its own set of ability names; when a new pick is made in a
   * section, we remove any previous pick from that same section and add the new one.
   */
  function handleSelectInSection(name: string, sectionAbilityNames: string[]) {
    if (!classChoice) return;
    const prev = classChoice.heroicAbilities ?? [];
    // Remove any existing pick from this section, then add the new one
    const filtered = prev.filter((n) => !sectionAbilityNames.includes(n));
    setClassChoice({
      ...classChoice,
      heroicAbilities: [...filtered, name],
    });
  }

  function handleSelectHeroic3(name: string) {
    handleSelectInSection(name, cost3.map((a) => a.name));
  }

  function handleSelectHeroic5(name: string) {
    handleSelectInSection(name, cost5.map((a) => a.name));
  }

  function handleSelectLevelAbility(name: string, sectionAbilities: Ability[]) {
    handleSelectInSection(name, sectionAbilities.map((a) => a.name));
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Choose Your Abilities</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          Select a signature ability and your starting heroic abilities. Your class resource is{' '}
          <strong className="text-gold-light">{resource}</strong>.
        </p>
      </div>

      {/* Signature Abilities Section */}
      {signature_abilities.length > 0 ? (
        <section>
          <div className="mb-4">
            <h3 className="font-heading text-lg text-gold-light tracking-wide">
              Signature Ability
            </h3>
            <p className="font-body text-xs text-cream-dark/50 mt-1">
              Choose one signature ability. This ability costs no {resource} and defines your core
              combat style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signature_abilities.map((ability) => (
              <AbilityCard
                key={ability.name}
                ability={ability}

                selected={selectedSigName === ability.name}
                onSelect={() => handleSelectSignature(ability.name)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="card px-5 py-4">
            <h3 className="font-heading text-base text-gold-light tracking-wide mb-1">
              Signature Ability
            </h3>
            <p className="font-body text-xs text-cream-dark/50">
              Your signature ability comes from your kit selection. Make sure you've chosen a kit
              in the Kit step.
            </p>
          </div>
        </section>
      )}

      {/* Heroic Abilities - 3 Cost */}
      {cost3.length > 0 && (
        <section>
          <div className="mb-4">
            <h3 className="font-heading text-lg text-gold-light tracking-wide">
              3-Cost Heroic Ability
            </h3>
            <p className="font-body text-xs text-cream-dark/50 mt-1">
              Choose one ability that costs 3 {resource}.
              {selected3Cost && (
                <span className="ml-1 text-gold">
                  Selected: {selected3Cost}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cost3.map((ability) => (
              <AbilityCard
                key={ability.name}
                ability={ability}

                selected={selected3Cost === ability.name}
                onSelect={() => handleSelectHeroic3(ability.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Heroic Abilities - 5 Cost */}
      {cost5.length > 0 && (
        <section>
          <div className="mb-4">
            <h3 className="font-heading text-lg text-gold-light tracking-wide">
              5-Cost Heroic Ability
            </h3>
            <p className="font-body text-xs text-cream-dark/50 mt-1">
              Choose one ability that costs 5 {resource}.
              {selected5Cost && (
                <span className="ml-1 text-gold">
                  Selected: {selected5Cost}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cost5.map((ability) => (
              <AbilityCard
                key={ability.name}
                ability={ability}

                selected={selected5Cost === ability.name}
                onSelect={() => handleSelectHeroic5(ability.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Higher-level ability sections */}
      {levelAbilityGroups.map(({ level: lvl, abilities, selectedName }) => (
        <section key={lvl}>
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-heading text-lg text-gold-light tracking-wide">
                Level {lvl} Ability
              </h3>
              <span className="badge text-[0.6rem]">Lv {lvl}</span>
            </div>
            <p className="font-body text-xs text-cream-dark/50 mt-1">
              Choose one heroic ability unlocked at level {lvl}.
              {selectedName && (
                <span className="ml-1 text-gold">
                  Selected: {selectedName}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {abilities.map((ability) => (
              <AbilityCard
                key={ability.name}
                ability={ability}
                selected={selectedName === ability.name}
                onSelect={() => handleSelectLevelAbility(ability.name, abilities)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
