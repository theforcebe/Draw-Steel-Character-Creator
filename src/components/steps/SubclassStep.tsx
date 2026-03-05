import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';

interface SubclassInfo {
  id: string;
  name: string;
  description: string;
  skill: string;
}

const SUBCLASSES: Record<string, SubclassInfo[]> = {
  censor: [
    { id: 'exorcist', name: 'Exorcist', description: 'Teleport toward judged creatures and punish the wicked with righteous fury', skill: 'Read Person' },
    { id: 'oracle', name: 'Oracle', description: 'Deal holy damage to judged creatures through divine visions of their sins', skill: 'Magic' },
    { id: 'paragon', name: 'Paragon', description: 'Pull judged creatures toward you with commanding divine authority', skill: 'Lead' },
  ],
  conduit: [
    { id: 'creation', name: 'Creation Domain', description: 'Channel the power of creation to shape and heal', skill: '' },
    { id: 'death', name: 'Death Domain', description: 'Command the boundary between life and death', skill: '' },
    { id: 'fate', name: 'Fate Domain', description: 'Manipulate destiny and probability', skill: '' },
    { id: 'knowledge', name: 'Knowledge Domain', description: 'Access divine knowledge and insight', skill: '' },
    { id: 'life', name: 'Life Domain', description: 'Channel pure healing and restorative energy', skill: '' },
    { id: 'love', name: 'Love Domain', description: 'Inspire devotion and emotional bonds', skill: '' },
    { id: 'nature', name: 'Nature Domain', description: 'Command the forces of the natural world', skill: '' },
    { id: 'protection', name: 'Protection Domain', description: 'Shield allies with divine barriers', skill: '' },
    { id: 'storm', name: 'Storm Domain', description: 'Wield lightning and thunder against foes', skill: '' },
    { id: 'sun', name: 'Sun Domain', description: 'Burn away darkness with radiant light', skill: '' },
    { id: 'trickery', name: 'Trickery Domain', description: 'Deceive and confound enemies with divine mischief', skill: '' },
    { id: 'war', name: 'War Domain', description: 'Empower yourself and allies for holy warfare', skill: '' },
  ],
  elementalist: [
    { id: 'earth', name: 'Acolyte of Earth', description: 'Gain stability when using Earth magic abilities, becoming an immovable force', skill: '' },
    { id: 'fire', name: 'Acolyte of Fire', description: 'Deal extra damage with Fire magic abilities, incinerating your foes', skill: '' },
    { id: 'green', name: 'Acolyte of the Green', description: 'Gain temporary Stamina when dealing damage with nature magic', skill: '' },
    { id: 'void', name: 'Acolyte of the Mystery', description: 'Extend the distance of Void magic abilities, reaching across the battlefield', skill: '' },
  ],
  fury: [
    { id: 'berserker', name: 'Berserker', description: 'Channel ferocity into raw physical might, pushing foes with devastating force', skill: 'Lift' },
    { id: 'reaver', name: 'Reaver', description: 'Channel ferocity into instinct and cunning, sliding around the battlefield', skill: 'Hide' },
    { id: 'stormwight', name: 'Stormwight', description: 'Channel ferocity into primordial storms and animal forms', skill: 'Track' },
  ],
  null: [
    { id: 'chronokinetic', name: 'Chronokinetic', description: 'Unmoor from temporal reality to manipulate time on the battlefield', skill: '' },
    { id: 'cryokinetic', name: 'Cryokinetic', description: 'Tap into absolute cold to freeze and shatter your enemies', skill: '' },
    { id: 'metakinetic', name: 'Metakinetic', description: 'See through the illusions of the universe to redirect force', skill: '' },
  ],
  shadow: [
    { id: 'blackAsh', name: 'College of Black Ash', description: 'Master teleportation and shadow manipulation to strike from anywhere', skill: 'Magic' },
    { id: 'causticAlchemy', name: 'College of Caustic Alchemy', description: 'Craft acids, bombs, and poisons for devastating assassination techniques', skill: 'Alchemy' },
    { id: 'harlequinMask', name: 'College of the Harlequin Mask', description: 'Use illusion magic and infiltration to deceive and confound foes', skill: 'Lie' },
  ],
  tactician: [
    { id: 'insurgent', name: 'Insurgent', description: 'Do whatever it takes — covert operations and advanced tactics', skill: '' },
    { id: 'mastermind', name: 'Mastermind', description: 'Encyclopedic warfare knowledge and overwatch capabilities', skill: '' },
    { id: 'vanguard', name: 'Vanguard', description: 'Lead from the front with commanding presence and parrying strikes', skill: '' },
  ],
  talent: [
    { id: 'chronopathy', name: 'Chronopathy', description: 'View and manipulate time, accelerating allies and forcing rerolls', skill: '' },
    { id: 'telekinesis', name: 'Telekinesis', description: 'Physically manipulate creatures and objects with your mind', skill: '' },
    { id: 'telepathy', name: 'Telepathy', description: 'Communicate with, read, and influence minds around you', skill: '' },
  ],
  troubadour: [
    { id: 'auteur', name: 'Auteur', description: 'Manipulate the sequence of events and rewrite the story of battle', skill: 'Brag' },
    { id: 'duelist', name: 'Duelist', description: 'Perform dramatic combat dances with acrobatic flair', skill: 'Gymnastics' },
    { id: 'virtuoso', name: 'Virtuoso', description: 'Channel magic through music and song to inspire and devastate', skill: 'Music' },
  ],
  summoner: [
    { id: 'beastLord', name: 'Beast Lord', description: 'Command powerful natural creatures to fight by your side', skill: '' },
    { id: 'demonBinder', name: 'Demon Binder', description: 'Bind and control fiendish entities from other planes', skill: '' },
    { id: 'spiritCaller', name: 'Spirit Caller', description: 'Summon spectral spirits from the ethereal realm', skill: '' },
  ],
};

export function SubclassStep() {
  const classChoice = useCharacterStore((s) => s.character.classChoice);
  const setClassChoice = useCharacterStore((s) => s.setClassChoice);

  if (!classChoice) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="font-body text-lg text-cream-dark/80">
          Select a class first.
        </p>
      </div>
    );
  }

  const classId = classChoice.classId;
  const subclasses = SUBCLASSES[classId] ?? [];
  const selectedSubId = classChoice.subclassId;

  function handleSelect(subId: string) {
    if (!classChoice) return;
    const sub = subclasses.find((s) => s.id === subId);
    // Clear kit when subclass changes (stormwight kits are incompatible with other subclasses)
    const subclassChanged = classChoice.subclassId !== subId;
    setClassChoice({
      ...classChoice,
      subclassId: subId,
      subclassSkill: sub?.skill ?? '',
      kitId: subclassChanged ? undefined : classChoice.kitId,
      secondKitId: subclassChanged ? undefined : classChoice.secondKitId,
    });
  }

  const className = classId.charAt(0).toUpperCase() + classId.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="gold-text font-heading text-3xl tracking-wide sm:text-4xl">
          Choose Your Subclass
        </h2>
        <p className="font-body mt-2 text-lg text-cream-dark/80">
          {classId === 'conduit'
            ? `Select a domain for your ${className}. In a future update you will choose two domains.`
            : `Select a specialization for your ${className}.`}
        </p>
      </div>

      {/* Subclass grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subclasses.map((sub) => (
          <ParchmentCard
            key={sub.id}
            selected={selectedSubId === sub.id}
            onClick={() => handleSelect(sub.id)}
            hoverable
            compact
            className="flex flex-col"
          >
            {/* Subclass name */}
            <h3 className="font-heading text-xl font-semibold text-gold-light">
              {sub.name}
            </h3>

            {/* Description */}
            <p className="font-body mt-2 flex-1 text-sm leading-relaxed text-cream-dark/70">
              {sub.description}
            </p>

            {/* Granted skill badge */}
            {sub.skill && (
              <div className="mt-3">
                <span className="rounded bg-gold-dark/15 px-2 py-0.5 text-xs font-semibold text-gold-muted">
                  Skill: {sub.skill}
                </span>
              </div>
            )}
          </ParchmentCard>
        ))}
      </div>
    </div>
  );
}
