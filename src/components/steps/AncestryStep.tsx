import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import ancestryData from '../../data/ancestries.json';
import type { AncestryId } from '../../types/character';

const ancestries = ancestryData.ancestries as Record<
  string,
  {
    name: string;
    size: string;
    speed: number;
    stability: number;
    ancestryPoints: number;
    measurements: { height: string; weight: string; lifeExpectancy: string };
    signatureTraits: { name: string; description: string }[];
    purchasedTraits: { name: string; cost: number; description: string }[];
  }
>;

export function AncestryStep() {
  const { character, setAncestry } = useCharacterStore();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Section header */}
      <div className="mb-6 text-center">
        <h2 className="gold-text font-heading text-2xl tracking-wide sm:text-3xl">
          Choose Your Ancestry
        </h2>
        <p className="mt-2 font-body text-base text-cream-dark/80">
          Your ancestry shapes your hero&apos;s physical traits, innate abilities, and heritage.
        </p>
      </div>

      {/* Ancestry grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Object.entries(ancestries).map(([id, ancestry]) => (
          <ParchmentCard
            key={id}
            selected={character.ancestryId === id}
            onClick={() => setAncestry(id as AncestryId)}
            hoverable
            compact
            className="flex flex-col"
          >
            {/* Ancestry name */}
            <h3 className="font-heading text-lg font-semibold text-gold-light">
              {ancestry.name}
            </h3>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="badge">
                Size {ancestry.size}
              </span>
              <span className="badge">
                Speed {ancestry.speed}
              </span>
              <span className="badge-accent">
                {ancestry.ancestryPoints} Trait Points
              </span>
            </div>

            {/* Measurements as description */}
            <p className="mt-2 font-body text-sm leading-relaxed text-cream-dark/70">
              {ancestry.measurements.height} tall, {ancestry.measurements.weight}
            </p>

            {/* Signature trait preview */}
            {ancestry.signatureTraits.length > 0 && (
              <p className="mt-1.5 font-body text-xs italic text-gold-muted">
                Signature: {ancestry.signatureTraits.map((t) => t.name).join(', ')}
              </p>
            )}
          </ParchmentCard>
        ))}
      </div>
    </div>
  );
}
