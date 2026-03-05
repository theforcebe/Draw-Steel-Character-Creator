import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import careerData from '../../data/careers.json';

interface CareerData {
  name: string;
  description: string;
  skills: {
    granted?: string[];
    grantedFrom?: Record<string, number>;
    grantedNote?: string;
    grantedFromNote?: string;
    quickBuild: string[];
  };
  languages: number;
  renown: number;
  wealth: number;
  projectPoints: number;
  perk: {
    group: string;
    quickBuild: string;
  };
}

const careers = careerData.careers as Record<string, CareerData>;

export function CareerStep() {
  const { character, setCareer } = useCharacterStore();
  const selectedCareerId = character.career?.careerId ?? null;

  const handleSelect = (careerId: string, career: CareerData) => {
    // Use quickBuild defaults for skills and perk
    const languages: string[] = [];
    for (let i = 0; i < career.languages; i++) {
      languages.push('');
    }

    setCareer({
      careerId,
      skills: career.skills.quickBuild,
      languages,
      perkName: career.perk.quickBuild,
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="gold-text font-heading text-3xl tracking-wide sm:text-4xl">
          Choose Your Career
        </h2>
        <p className="font-body mt-2 text-lg text-cream-dark/80">
          Your career represents what your hero did before becoming an adventurer.
        </p>
      </div>

      {/* Career grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(careers).map(([id, career]) => (
          <ParchmentCard
            key={id}
            selected={selectedCareerId === id}
            onClick={() => handleSelect(id, career)}
            hoverable
            compact
            className="flex flex-col"
          >
            {/* Career name */}
            <h3 className="font-heading text-lg font-bold text-gold-light">
              {career.name}
            </h3>

            {/* Description */}
            <p className="font-body mt-1 text-sm leading-snug text-cream-dark/70">
              {career.description}
            </p>

            {/* Skills */}
            <div className="mt-3">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-muted">
                Skills
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {career.skills.quickBuild.map((skill) => (
                  <span
                    key={skill}
                    className="badge"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Perk */}
            <div className="mt-3">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-muted">
                Perk ({career.perk.group})
              </p>
              <p className="font-body mt-0.5 text-sm italic text-cream-dark/70">
                {career.perk.quickBuild}
              </p>
            </div>

            {/* Bonus badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {career.languages > 0 && (
                <span className="rounded bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-light">
                  +{career.languages} Language{career.languages > 1 ? 's' : ''}
                </span>
              )}
              {career.renown > 0 && (
                <span className="badge-accent">
                  +{career.renown} Renown
                </span>
              )}
              {career.wealth > 0 && (
                <span className="rounded bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-light">
                  +{career.wealth} Wealth
                </span>
              )}
              {career.projectPoints > 0 && (
                <span className="rounded bg-surface-lighter px-2 py-0.5 text-xs font-semibold text-cream-dark">
                  {career.projectPoints} Project Pts
                </span>
              )}
            </div>
          </ParchmentCard>
        ))}
      </div>
    </div>
  );
}
