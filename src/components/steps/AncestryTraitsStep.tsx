import { useEffect, useCallback } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import ancestryData from '../../data/ancestries.json';
import { SKILL_GROUPS } from '../../data/skill-groups';
import type { AncestryId, SelectedTrait } from '../../types/character';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SignatureTraitData {
  name: string;
  description: string;
  damageTypeOptions?: string[];
  runeOptions?: { name: string; description: string }[];
  benefits?: { skills?: string };
}

interface PurchasedTraitData {
  name: string;
  cost: number;
  description: string;
  repeatable?: boolean;
  damageTypeOptions?: string[];
  abilityOptions?: { name: string; description: string }[];
  ability?: { damageTypeOptions?: string[] };
}

interface AncestryDataFull {
  name: string;
  size?: string;
  ancestryPoints: number;
  ancestryPointsNote?: string;
  signatureTraits: SignatureTraitData[];
  purchasedTraits: PurchasedTraitData[];
}

const ancestries = ancestryData.ancestries as unknown as Record<string, AncestryDataFull>;

const FORMER_LIFE_OPTIONS: AncestryId[] = [
  'devil', 'dragonKnight', 'dwarf', 'wodeElf', 'highElf',
  'hakaan', 'human', 'memonek', 'orc', 'polder', 'timeRaider',
];

const DAMAGE_TYPES = ['acid', 'cold', 'corruption', 'fire', 'lightning', 'poison'];
const INTERPERSONAL_SKILLS = SKILL_GROUPS['interpersonal'] ?? [];
const CRAFTING_SKILLS = SKILL_GROUPS['crafting'] ?? [];

function formatId(id: string): string {
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

// ---------------------------------------------------------------------------
// Helpers to detect sub-choice traits
// ---------------------------------------------------------------------------

function signatureNeedsChoice(t: SignatureTraitData): boolean {
  return !!(t.damageTypeOptions || t.runeOptions || t.benefits?.skills);
}


// ---------------------------------------------------------------------------
// Sub-choice rendering
// ---------------------------------------------------------------------------

function SubChoiceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
      <label className="font-heading text-xs uppercase tracking-wider text-gold-muted">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-gold-dark/30 bg-surface-light px-3 py-1.5 font-body text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold"
      >
        <option value="">Choose...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AncestryTraitsStep() {
  const { character, setSelectedTraits, setFormerLifeAncestry } = useCharacterStore();
  const ancestryId = character.ancestryId;

  // Ensure signature traits that need choices are stored in selectedTraits (cost 0)
  const ensureSignatureTraits = useCallback(() => {
    if (!ancestryId || !ancestries[ancestryId]) return;
    const ancestry = ancestries[ancestryId];
    const existing = character.selectedTraits;
    const sigNeedingChoice = ancestry.signatureTraits.filter(signatureNeedsChoice);
    const missing = sigNeedingChoice.filter((s) => !existing.some((t) => t.name === s.name));
    if (missing.length > 0) {
      setSelectedTraits([
        ...existing,
        ...missing.map((s) => ({ name: s.name, cost: 0 })),
      ]);
    }
  }, [ancestryId, character.selectedTraits, setSelectedTraits]);

  useEffect(() => {
    ensureSignatureTraits();
    // Only run when ancestryId changes, not on every selectedTraits change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ancestryId]);

  if (!ancestryId || !ancestries[ancestryId]) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="font-body text-lg text-cream-dark/80">
          Please select an ancestry first.
        </p>
      </div>
    );
  }

  const ancestry = ancestries[ancestryId];
  // Revenant: if size 1S (polder former life), budget is 3 instead of 2
  let budget = ancestry.ancestryPoints;
  if (ancestryId === 'revenant' && character.formerLifeAncestryId) {
    const formerSize = (ancestries[character.formerLifeAncestryId]?.size ?? '1M');
    if (formerSize === '1S') budget = 3;
  }
  const selectedTraits = character.selectedTraits;
  // Only count purchased trait costs (signature traits have cost 0)
  const spent = selectedTraits.reduce((sum, t) => sum + t.cost, 0);
  const remaining = budget - spent;

  const isTraitSelected = (traitName: string) =>
    selectedTraits.some((t) => t.name === traitName);

  const getSelectedTrait = (traitName: string): SelectedTrait | undefined =>
    selectedTraits.find((t) => t.name === traitName);

  /** Get ALL instances of a repeatable trait. */
  const getTraitInstances = (traitName: string): { trait: SelectedTrait; index: number }[] =>
    selectedTraits
      .map((t, i) => ({ trait: t, index: i }))
      .filter(({ trait: t }) => t.name === traitName);

  const updateTraitField = (traitName: string, patch: Partial<SelectedTrait>) => {
    setSelectedTraits(
      selectedTraits.map((t) => (t.name === traitName ? { ...t, ...patch } : t)),
    );
  };

  /** Update a specific instance of a repeatable trait by its array index. */
  const updateTraitAtIndex = (index: number, patch: Partial<SelectedTrait>) => {
    setSelectedTraits(
      selectedTraits.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  };

  /** Remove a specific instance by array index. */
  const removeTraitAtIndex = (index: number) => {
    setSelectedTraits(selectedTraits.filter((_, i) => i !== index));
  };

  const toggleTrait = (trait: PurchasedTraitData) => {
    // Repeatable traits: always add a new instance (never toggle off via card click)
    if (trait.repeatable) {
      if (trait.cost <= remaining) {
        setSelectedTraits([...selectedTraits, { name: trait.name, cost: trait.cost }]);
      }
      return;
    }
    if (isTraitSelected(trait.name)) {
      setSelectedTraits(selectedTraits.filter((t) => t.name !== trait.name));
    } else if (trait.cost <= remaining) {
      setSelectedTraits([...selectedTraits, { name: trait.name, cost: trait.cost }]);
    }
  };

  const budgetPercentage = budget > 0 ? ((budget - remaining) / budget) * 100 : 0;

  // Get former ancestry's purchased traits (for Revenant Previous Life)
  const formerAncestry = character.formerLifeAncestryId
    ? ancestries[character.formerLifeAncestryId]
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-5 text-center">
        <h2 className="gold-text font-heading text-2xl tracking-wide sm:text-3xl">
          {ancestry.name} Traits
        </h2>
        <p className="mt-2 font-body text-base text-cream-dark/80">
          Spend your ancestry points on purchasable traits.
        </p>
      </div>

      {/* Budget tracker */}
      <div className="mx-auto mb-6 max-w-md">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm uppercase tracking-wider text-gold-light">
            Trait Points
          </span>
          <span className="font-heading text-lg text-gold">
            {remaining} of {budget} remaining
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-lighter/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light transition-all duration-300"
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>
      </div>

      {/* Former Life Picker (Revenant only) */}
      {ancestryId === 'revenant' && (
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 font-heading text-lg text-gold-light">
            <span className="h-px flex-1 bg-gradient-to-r from-gold-dark/50 to-transparent" />
            <span>Former Life</span>
            <span className="h-px flex-1 bg-gradient-to-l from-gold-dark/50 to-transparent" />
          </h3>
          <ParchmentCard compact className="border-l-4 border-l-gold">
            <p className="mb-3 font-body text-sm leading-relaxed text-cream-dark/80">
              Choose the ancestry you were before you died. Your size is determined by
              your former life ancestry.
            </p>
            <select
              className="w-full rounded border border-gold-dark/40 bg-surface px-3 py-2 font-body text-sm text-cream-dark focus:border-gold focus:outline-none"
              value={character.formerLifeAncestryId ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormerLifeAncestry(val ? (val as AncestryId) : null);
                // Clear Previous Life trait selections when former ancestry changes
                setSelectedTraits(
                  selectedTraits.filter((t) => !t.name.startsWith('Previous Life')),
                );
              }}
            >
              <option value="">-- Select Former Life Ancestry --</option>
              {FORMER_LIFE_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {ancestries[id]?.name ?? formatId(id)}
                </option>
              ))}
            </select>
            {character.formerLifeAncestryId && ancestries[character.formerLifeAncestryId] && (
              <p className="mt-2 font-heading text-sm text-gold">
                Size: {ancestries[character.formerLifeAncestryId].size ?? '1M'}
              </p>
            )}
          </ParchmentCard>
        </div>
      )}

      {/* Signature Traits */}
      {ancestry.signatureTraits.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 font-heading text-lg text-gold-light">
            <span className="h-px flex-1 bg-gradient-to-r from-gold-dark/50 to-transparent" />
            <span>Signature Traits</span>
            <span className="h-px flex-1 bg-gradient-to-l from-gold-dark/50 to-transparent" />
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {ancestry.signatureTraits.map((trait) => {
              const stored = getSelectedTrait(trait.name);
              return (
                <ParchmentCard key={trait.name} compact className="border-l-4 border-l-gold opacity-90">
                  <div className="flex items-start justify-between">
                    <h4 className="font-heading text-base font-semibold text-gold-light">
                      {trait.name}
                    </h4>
                    <span className="badge ml-2 shrink-0">Auto</span>
                  </div>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-cream-dark/70">
                    {trait.description}
                  </p>

                  {/* Silver Tongue: pick 1 interpersonal skill */}
                  {trait.benefits?.skills && (
                    <SubChoiceSelect
                      label={trait.benefits.skills}
                      value={stored?.skillChoices?.[0] ?? ''}
                      options={INTERPERSONAL_SKILLS.map((s) => ({ value: s, label: s }))}
                      onChange={(v) => updateTraitField(trait.name, { skillChoices: v ? [v] : [] })}
                    />
                  )}

                  {/* Wyrmplate: pick damage type */}
                  {trait.damageTypeOptions && (
                    <SubChoiceSelect
                      label="Choose damage immunity type"
                      value={stored?.damageType ?? ''}
                      options={trait.damageTypeOptions.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                      onChange={(v) => updateTraitField(trait.name, { damageType: v })}
                    />
                  )}

                  {/* Runic Carving: pick rune */}
                  {trait.runeOptions && (
                    <SubChoiceSelect
                      label="Choose rune"
                      value={stored?.runeChoice ?? ''}
                      options={trait.runeOptions.map((r) => ({ value: r.name, label: `${r.name} — ${r.description.slice(0, 60)}…` }))}
                      onChange={(v) => updateTraitField(trait.name, { runeChoice: v })}
                    />
                  )}
                </ParchmentCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Purchasable Traits */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-heading text-lg text-gold-light">
          <span className="h-px flex-1 bg-gradient-to-r from-gold-dark/50 to-transparent" />
          <span>Purchasable Traits</span>
          <span className="h-px flex-1 bg-gradient-to-l from-gold-dark/50 to-transparent" />
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {ancestry.purchasedTraits.map((trait) => {
            const isRepeatable = !!trait.repeatable;
            const instances = getTraitInstances(trait.name);
            const selected = instances.length > 0;
            const canAfford = trait.cost <= remaining;
            const tooExpensive = !selected && !canAfford;
            const stored = !isRepeatable ? getSelectedTrait(trait.name) : undefined;

            // Previous Life traits: only show if former ancestry is chosen (Revenant)
            if (trait.name.startsWith('Previous Life') && !formerAncestry) {
              return null;
            }

            // Determine available former traits for Previous Life
            const previousLifeTraits = trait.name.startsWith('Previous Life') && formerAncestry
              ? formerAncestry.purchasedTraits.filter((ft: PurchasedTraitData) => ft.cost === trait.cost)
              : [];

            // Dragon Breath / ability damage type options
            const abilityDamageTypes = trait.ability?.damageTypeOptions;

            return (
              <ParchmentCard
                key={trait.name}
                selected={selected}
                hoverable={isRepeatable ? canAfford : (!tooExpensive)}
                compact
                onClick={() => {
                  if (isRepeatable) {
                    if (canAfford) toggleTrait(trait);
                  } else if (!tooExpensive || selected) {
                    toggleTrait(trait);
                  }
                }}
                className={(!isRepeatable && tooExpensive) ? 'opacity-40 cursor-not-allowed' : ''}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-heading text-base font-semibold text-gold-light">
                    {trait.name}
                  </h4>
                  <span
                    className={`ml-2 shrink-0 rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      selected
                        ? 'bg-gold text-ink'
                        : tooExpensive
                          ? 'bg-surface-lighter/50 text-cream-dark/30'
                          : 'bg-crimson/15 text-crimson'
                    }`}
                  >
                    {trait.cost} {trait.cost === 1 ? 'Point' : 'Points'}
                    {isRepeatable && ' each'}
                  </span>
                </div>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-cream-dark/70">
                  {trait.description}
                </p>

                {/* Repeatable trait: "Add Another" button + list of instances */}
                {isRepeatable && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {instances.map(({ trait: inst, index }, i) => {
                      // Find the former trait data for cascading sub-choices
                      const chosenFormerTrait = inst.previousLifeTrait && formerAncestry
                        ? formerAncestry.purchasedTraits.find((ft: PurchasedTraitData) => ft.name === inst.previousLifeTrait)
                        : null;

                      return (
                        <div key={index} className="mt-3 rounded border border-gold-dark/20 bg-surface/50 p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-heading text-xs text-gold-muted">Instance {i + 1}</span>
                            <button
                              type="button"
                              className="rounded bg-crimson/15 px-2 py-0.5 text-xs font-semibold text-crimson hover:bg-crimson/25 transition-colors"
                              onClick={() => removeTraitAtIndex(index)}
                            >
                              Remove
                            </button>
                          </div>

                          {/* Previous Life: pick a trait from former ancestry */}
                          {trait.name.startsWith('Previous Life') && previousLifeTraits.length > 0 && (
                            <>
                              <SubChoiceSelect
                                label={`Choose a ${trait.cost}-point trait from ${formerAncestry?.name}`}
                                value={inst.previousLifeTrait ?? ''}
                                options={previousLifeTraits
                                  .filter((ft: PurchasedTraitData) => {
                                    // Don't allow picking the same trait another instance already chose
                                    const otherPicks = instances
                                      .filter(({ index: idx }) => idx !== index)
                                      .map(({ trait: t }) => t.previousLifeTrait);
                                    return !otherPicks.includes(ft.name);
                                  })
                                  .map((ft: PurchasedTraitData) => ({ value: ft.name, label: ft.name }))}
                                onChange={(v) => updateTraitAtIndex(index, { previousLifeTrait: v, damageType: undefined, abilityChoice: undefined })}
                              />
                              {/* Show chosen trait description */}
                              {chosenFormerTrait && (
                                <p className="mt-1.5 rounded bg-surface/70 px-3 py-2 font-body text-xs leading-relaxed text-cream-dark/70 border border-gold-dark/15">
                                  <span className="font-heading text-gold-light">{chosenFormerTrait.name}:</span>{' '}
                                  {chosenFormerTrait.description}
                                </p>
                              )}

                              {/* Cascading sub-choice: if the chosen former trait has its own options */}
                              {chosenFormerTrait?.ability?.damageTypeOptions && (
                                <SubChoiceSelect
                                  label={`${chosenFormerTrait.name}: Choose damage type`}
                                  value={inst.damageType ?? ''}
                                  options={chosenFormerTrait.ability.damageTypeOptions.map((d: string) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                                  onChange={(v) => updateTraitAtIndex(index, { damageType: v })}
                                />
                              )}
                              {chosenFormerTrait?.damageTypeOptions && (
                                <SubChoiceSelect
                                  label={`${chosenFormerTrait.name}: Choose damage type`}
                                  value={inst.damageType ?? ''}
                                  options={chosenFormerTrait.damageTypeOptions.map((d: string) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                                  onChange={(v) => updateTraitAtIndex(index, { damageType: v })}
                                />
                              )}
                              {chosenFormerTrait?.abilityOptions && (
                                <SubChoiceSelect
                                  label={`${chosenFormerTrait.name}: Choose ability`}
                                  value={inst.abilityChoice ?? ''}
                                  options={(chosenFormerTrait.abilityOptions as { name: string; description: string }[]).map((a) => ({ value: a.name, label: a.name }))}
                                  onChange={(v) => updateTraitAtIndex(index, { abilityChoice: v })}
                                />
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                    {canAfford && (
                      <button
                        type="button"
                        className="mt-2 w-full rounded border border-dashed border-gold-dark/30 py-1.5 text-xs font-heading text-gold-muted hover:border-gold/50 hover:text-gold-light transition-colors"
                        onClick={() => toggleTrait(trait)}
                      >
                        + Add Another ({trait.cost} pt)
                      </button>
                    )}
                  </div>
                )}

                {/* Non-repeatable sub-choices (only shown when trait is selected) */}
                {!isRepeatable && selected && (
                  <>
                    {/* Dragon Breath: pick damage type */}
                    {abilityDamageTypes && (
                      <SubChoiceSelect
                        label="Choose damage type"
                        value={stored?.damageType ?? ''}
                        options={abilityDamageTypes.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                        onChange={(v) => updateTraitField(trait.name, { damageType: v })}
                      />
                    )}

                    {/* Prismatic Scales: pick second damage immunity */}
                    {trait.name === 'Prismatic Scales' && (
                      <SubChoiceSelect
                        label="Choose permanent damage immunity"
                        value={stored?.damageType ?? ''}
                        options={DAMAGE_TYPES.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                        onChange={(v) => updateTraitField(trait.name, { damageType: v })}
                      />
                    )}

                    {/* Psionic Gift: pick ability */}
                    {trait.abilityOptions && (
                      <SubChoiceSelect
                        label="Choose signature ability"
                        value={stored?.abilityChoice ?? ''}
                        options={trait.abilityOptions.map((a) => ({ value: a.name, label: `${a.name} — ${a.description.slice(0, 50)}…` }))}
                        onChange={(v) => updateTraitField(trait.name, { abilityChoice: v })}
                      />
                    )}

                    {/* Passionate Artisan: pick 2 crafting skills */}
                    {trait.name === 'Passionate Artisan' && (
                      <>
                        <SubChoiceSelect
                          label="First crafting skill"
                          value={stored?.skillChoices?.[0] ?? ''}
                          options={CRAFTING_SKILLS.map((s) => ({ value: s, label: s }))}
                          onChange={(v) => updateTraitField(trait.name, { skillChoices: [v, stored?.skillChoices?.[1] ?? ''].filter(Boolean) })}
                        />
                        <SubChoiceSelect
                          label="Second crafting skill"
                          value={stored?.skillChoices?.[1] ?? ''}
                          options={CRAFTING_SKILLS.filter((s) => s !== stored?.skillChoices?.[0]).map((s) => ({ value: s, label: s }))}
                          onChange={(v) => updateTraitField(trait.name, { skillChoices: [stored?.skillChoices?.[0] ?? '', v].filter(Boolean) })}
                        />
                      </>
                    )}

                    {/* Non-repeatable Previous Life (2 Points): pick a trait */}
                    {trait.name.startsWith('Previous Life') && previousLifeTraits.length > 0 && (
                      <>
                        <SubChoiceSelect
                          label={`Choose a ${trait.cost}-point trait from ${formerAncestry?.name}`}
                          value={stored?.previousLifeTrait ?? ''}
                          options={previousLifeTraits.map((ft: PurchasedTraitData) => ({ value: ft.name, label: ft.name }))}
                          onChange={(v) => updateTraitField(trait.name, { previousLifeTrait: v, damageType: undefined, abilityChoice: undefined })}
                        />
                        {/* Cascading sub-choices for the chosen former trait */}
                        {(() => {
                          const chosenFormerTrait = stored?.previousLifeTrait && formerAncestry
                            ? formerAncestry.purchasedTraits.find((ft: PurchasedTraitData) => ft.name === stored.previousLifeTrait)
                            : null;
                          if (!chosenFormerTrait) return null;
                          return (
                            <>
                              {/* Show chosen trait description */}
                              <p className="mt-1.5 rounded bg-surface/70 px-3 py-2 font-body text-xs leading-relaxed text-cream-dark/70 border border-gold-dark/15">
                                <span className="font-heading text-gold-light">{chosenFormerTrait.name}:</span>{' '}
                                {chosenFormerTrait.description}
                              </p>
                              {chosenFormerTrait.ability?.damageTypeOptions && (
                                <SubChoiceSelect
                                  label={`${chosenFormerTrait.name}: Choose damage type`}
                                  value={stored?.damageType ?? ''}
                                  options={chosenFormerTrait.ability.damageTypeOptions.map((d: string) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                                  onChange={(v) => updateTraitField(trait.name, { damageType: v })}
                                />
                              )}
                              {chosenFormerTrait.damageTypeOptions && (
                                <SubChoiceSelect
                                  label={`${chosenFormerTrait.name}: Choose damage type`}
                                  value={stored?.damageType ?? ''}
                                  options={chosenFormerTrait.damageTypeOptions.map((d: string) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
                                  onChange={(v) => updateTraitField(trait.name, { damageType: v })}
                                />
                              )}
                              {chosenFormerTrait.abilityOptions && (
                                <SubChoiceSelect
                                  label={`${chosenFormerTrait.name}: Choose ability`}
                                  value={stored?.abilityChoice ?? ''}
                                  options={(chosenFormerTrait.abilityOptions as { name: string; description: string }[]).map((a) => ({ value: a.name, label: a.name }))}
                                  onChange={(v) => updateTraitField(trait.name, { abilityChoice: v })}
                                />
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}
              </ParchmentCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
