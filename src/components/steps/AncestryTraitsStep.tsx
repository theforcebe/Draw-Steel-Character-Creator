import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import ancestryData from '../../data/ancestries.json';
import type { AncestryId } from '../../types/character';

interface TraitData {
  name: string;
  cost: number;
  description: string;
}

interface AncestryData {
  name: string;
  size?: string;
  ancestryPoints: number;
  signatureTraits: { name: string; description: string }[];
  purchasedTraits: TraitData[];
}

const ancestries = ancestryData.ancestries as Record<string, AncestryData>;

/** All ancestry IDs that can serve as a Revenant's former life (everything except revenant). */
const FORMER_LIFE_OPTIONS: AncestryId[] = [
  'devil', 'dragonKnight', 'dwarf', 'wodeElf', 'highElf',
  'hakaan', 'human', 'memonek', 'orc', 'polder', 'timeRaider',
];

function formatId(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function AncestryTraitsStep() {
  const { character, setSelectedTraits, setFormerLifeAncestry } = useCharacterStore();
  const ancestryId = character.ancestryId;

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
  const budget = ancestry.ancestryPoints;
  const selectedTraits = character.selectedTraits;
  const spent = selectedTraits.reduce((sum, t) => sum + t.cost, 0);
  const remaining = budget - spent;

  const isTraitSelected = (traitName: string) =>
    selectedTraits.some((t) => t.name === traitName);

  const toggleTrait = (trait: TraitData) => {
    if (isTraitSelected(trait.name)) {
      // Deselect
      setSelectedTraits(selectedTraits.filter((t) => t.name !== trait.name));
    } else if (trait.cost <= remaining) {
      // Select
      setSelectedTraits([...selectedTraits, { name: trait.name, cost: trait.cost }]);
    }
  };

  const budgetPercentage = budget > 0 ? ((budget - remaining) / budget) * 100 : 0;

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
            {ancestry.signatureTraits.map((trait) => (
              <ParchmentCard key={trait.name} compact className="border-l-4 border-l-gold opacity-90">
                <div className="flex items-start justify-between">
                  <h4 className="font-heading text-base font-semibold text-gold-light">
                    {trait.name}
                  </h4>
                  <span className="badge ml-2 shrink-0">
                    Auto
                  </span>
                </div>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-cream-dark/70">
                  {trait.description}
                </p>
              </ParchmentCard>
            ))}
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
            const selected = isTraitSelected(trait.name);
            const tooExpensive = !selected && trait.cost > remaining;

            return (
              <ParchmentCard
                key={trait.name}
                selected={selected}
                hoverable={!tooExpensive}
                compact
                onClick={() => {
                  if (!tooExpensive || selected) {
                    toggleTrait(trait);
                  }
                }}
                className={tooExpensive ? 'opacity-40 cursor-not-allowed' : ''}
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
                  </span>
                </div>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-cream-dark/70">
                  {trait.description}
                </p>
              </ParchmentCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
