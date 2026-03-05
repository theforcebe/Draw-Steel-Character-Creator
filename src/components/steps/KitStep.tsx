import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import kitsData from '../../data/kits.json';

// Fury uses kits only with berserker/reaver subclass
const FURY_KIT_SUBCLASSES = ['berserker', 'reaver'];

// Classes that do NOT use kits
const NO_KIT_CLASSES: Record<string, string> = {
  conduit: 'Prayer',
  elementalist: 'Enchantment',
  null: 'Psionic Augmentation',
  talent: 'Portfolio',
  summoner: 'Summoning Pact',
};

interface KitBonuses {
  stamina: number | null;
  speed: number | null;
  stability: number | null;
  meleeDamage: number[] | null;
  rangedDamage: number[] | null;
  meleeDistance: number | null;
  rangedDistance: number | null;
  disengage: number | null;
}

interface KitSignatureAbility {
  name: string;
  flavor: string;
  keywords: string[];
  type: string;
  distance: string;
  target: string;
  powerRoll: string;
  tier1: string;
  tier2: string;
  tier3: string;
  effect: string | null;
}

interface KitData {
  name: string;
  description: string;
  equipment: {
    armor: string;
    weapons: string[];
  };
  bonuses: KitBonuses;
  signatureAbility: KitSignatureAbility;
  animalForm?: string;
  primordialStorm?: { name: string; damageType: string };
}

const standardKits = kitsData.standardKits as unknown as Record<string, KitData>;
const stormwightKits = kitsData.stormwightKits as unknown as Record<string, KitData>;

// Filter out non-kit entries from stormwightKits (e.g. description, commonFeatures)
const STORMWIGHT_KIT_IDS = Object.keys(stormwightKits).filter(
  (k) => k !== 'description' && k !== 'commonFeatures',
);

function formatBonusLabel(key: string): string {
  const labels: Record<string, string> = {
    stamina: 'Stamina',
    speed: 'Speed',
    stability: 'Stability',
    meleeDamage: 'Melee Dmg',
    rangedDamage: 'Ranged Dmg',
    meleeDistance: 'Melee Dist',
    rangedDistance: 'Ranged Dist',
    disengage: 'Disengage',
  };
  return labels[key] ?? key;
}

function formatBonusValue(_key: string, value: number | number[]): string {
  if (Array.isArray(value)) {
    return `+${value[0]}/+${value[1]}/+${value[2]}`;
  }
  return `+${value}`;
}

function KitCard({
  kit,
  selected,
  onSelect,
}: {
  kit: KitData;
  selected: boolean;
  onSelect: () => void;
}) {
  const bonusEntries = Object.entries(kit.bonuses).filter(
    ([, v]) => v !== null,
  ) as [string, number | number[]][];

  return (
    <ParchmentCard
      selected={selected}
      onClick={onSelect}
      hoverable
      className="flex flex-col gap-3"
    >
      {/* Kit name */}
      <h3 className="font-heading text-lg text-gold tracking-wide">{kit.name}</h3>

      {/* Description */}
      <p className="font-body text-sm text-cream-dark/70 leading-relaxed">{kit.description}</p>

      {/* Equipment */}
      <div className="flex flex-col gap-1">
        <span className="font-heading text-xs text-gold-muted uppercase tracking-wider">
          Equipment
        </span>
        <div className="flex flex-wrap gap-2 text-xs font-body">
          <span className="px-2 py-0.5 rounded bg-surface-light text-cream-dark/80 border border-gold-dark/10">
            Armor: {kit.equipment.armor}
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-light text-cream-dark/80 border border-gold-dark/10">
            Weapons: {kit.equipment.weapons.join(', ')}
          </span>
        </div>
      </div>

      {/* Stormwight-specific info */}
      {kit.animalForm && (
        <div className="flex flex-wrap gap-2 text-xs font-body">
          <span className="px-2 py-0.5 rounded bg-crimson/20 text-crimson border border-crimson/30">
            Form: {kit.animalForm}
          </span>
          {kit.primordialStorm && (
            <span className="px-2 py-0.5 rounded bg-crimson/20 text-crimson border border-crimson/30">
              Storm: {kit.primordialStorm.name} ({kit.primordialStorm.damageType})
            </span>
          )}
        </div>
      )}

      {/* Bonuses */}
      {bonusEntries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {bonusEntries.map(([key, value]) => (
            <span
              key={key}
              className="px-2 py-0.5 rounded-full bg-gold/10 text-gold-light text-xs font-heading border border-gold/20"
            >
              {formatBonusLabel(key)} {formatBonusValue(key, value)}
            </span>
          ))}
        </div>
      )}

      {/* Signature Ability */}
      <div className="mt-1 pt-2 border-t border-gold-dark/10">
        <span className="font-heading text-xs text-gold-muted uppercase tracking-wider">
          Signature Ability
        </span>
        <p className="font-heading text-sm text-gold-light mt-0.5">
          {kit.signatureAbility.name}
        </p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 rounded-full bg-gold shadow-lg shadow-gold/30" />
        </div>
      )}
    </ParchmentCard>
  );
}

function TacticianKitSelection() {
  const classChoice = useCharacterStore((s) => s.character.classChoice);
  const setClassChoice = useCharacterStore((s) => s.setClassChoice);

  if (!classChoice) return null;

  const kitEntries = Object.entries(standardKits);

  function handleSelectFirst(kitId: string) {
    if (!classChoice) return;
    // If selecting the same kit that's already secondKitId, clear secondKitId
    const newSecondKitId = classChoice.secondKitId === kitId ? '' : classChoice.secondKitId;
    setClassChoice({ ...classChoice, kitId, secondKitId: newSecondKitId ?? '' });
  }

  function handleSelectSecond(kitId: string) {
    if (!classChoice) return;
    // Can't pick the same as first kit
    if (kitId === classChoice.kitId) return;
    setClassChoice({ ...classChoice, secondKitId: kitId });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Field Arsenal</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          As a Tactician, you select <strong className="text-gold-light">two kits</strong> via your
          Field Arsenal feature. Choose your primary and secondary kit below.
        </p>
      </div>

      {/* Primary Kit */}
      <div>
        <h3 className="font-heading text-lg text-gold-light mb-3 tracking-wide">
          Primary Kit
          {classChoice.kitId && (
            <span className="ml-2 text-sm text-cream-dark/60">
              ({standardKits[classChoice.kitId]?.name ?? classChoice.kitId})
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kitEntries.map(([id, kit]) => (
            <KitCard
              key={`first-${id}`}

              kit={kit}
              selected={classChoice.kitId === id}
              onSelect={() => handleSelectFirst(id)}
            />
          ))}
        </div>
      </div>

      {/* Secondary Kit */}
      <div>
        <h3 className="font-heading text-lg text-gold-light mb-3 tracking-wide">
          Secondary Kit
          {classChoice.secondKitId && (
            <span className="ml-2 text-sm text-cream-dark/60">
              ({standardKits[classChoice.secondKitId]?.name ?? classChoice.secondKitId})
            </span>
          )}
        </h3>
        {!classChoice.kitId ? (
          <p className="font-body text-cream-dark/40 italic">Select your primary kit first.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kitEntries
              .filter(([id]) => id !== classChoice.kitId)
              .map(([id, kit]) => (
                <KitCard
                  key={`second-${id}`}

                  kit={kit}
                  selected={classChoice.secondKitId === id}
                  onSelect={() => handleSelectSecond(id)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function KitStep() {
  const classChoice = useCharacterStore((s) => s.character.classChoice);
  const setClassChoice = useCharacterStore((s) => s.setClassChoice);

  // No class selected
  if (!classChoice) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="font-heading text-xl text-gold-dark tracking-wide">Select a class first</p>
        <p className="font-body text-cream-dark/50">
          Return to the Class step to choose your hero's class before selecting a kit.
        </p>
      </div>
    );
  }

  const { classId, subclassId } = classChoice;

  // No-kit classes: conduit, elementalist, null, talent, summoner
  if (classId in NO_KIT_CLASSES) {
    const altName = NO_KIT_CLASSES[classId];
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <h2 className="font-heading text-2xl text-gold tracking-wide">{altName}</h2>
        <p className="font-body text-cream-dark/60 text-center max-w-md">
          This class uses <strong className="text-gold-light">{altName}</strong> instead of kits.
          Coming soon...
        </p>
      </div>
    );
  }

  // Tactician: two kits via Field Arsenal
  if (classId === 'tactician') {
    return <TacticianKitSelection />;
  }

  // Determine which kit set to show
  const isStormwight = classId === 'fury' && subclassId === 'stormwight';
  const isFuryWithoutKit =
    classId === 'fury' && !FURY_KIT_SUBCLASSES.includes(subclassId) && !isStormwight;

  // Fury with a subclass that's neither berserker/reaver nor stormwight
  if (isFuryWithoutKit) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="font-heading text-xl text-gold-dark tracking-wide">
          Select a Fury subclass first
        </p>
        <p className="font-body text-cream-dark/50 text-center max-w-md">
          Return to the Subclass step to choose Berserker, Reaver, or Stormwight before selecting a
          kit.
        </p>
      </div>
    );
  }

  const kitEntries = isStormwight
    ? STORMWIGHT_KIT_IDS.map((id) => [id, stormwightKits[id]] as [string, KitData])
    : (Object.entries(standardKits) as [string, KitData][]);

  const kitTypeLabel = isStormwight ? 'Stormwight Kit' : 'Kit';

  function handleSelect(kitId: string) {
    if (!classChoice) return;
    setClassChoice({ ...classChoice, kitId });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">
          Choose Your {kitTypeLabel}
        </h2>
        <p className="font-body text-cream-dark/60 mt-2">
          {isStormwight
            ? 'As a Stormwight, you channel your primal ferocity through an animal form. Each kit grants unique shapeshifting abilities and growing power.'
            : 'Your kit determines your weapons, armor, and fighting style. You can change your kit during a respite.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kitEntries.map(([id, kit]) => (
          <KitCard
            key={id}
            kit={kit}
            selected={classChoice.kitId === id}
            onSelect={() => handleSelect(id)}
          />
        ))}
      </div>
    </div>
  );
}
