import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import cultureData from '../../data/cultures.json';
import type { EnvironmentId, OrganizationId, UpbringingId } from '../../types/character';

interface CultureAspect {
  name: string;
  description: string;
  skillOptions: string;
  quickBuild: string;
}

const environments = cultureData.environments as unknown as Record<string, CultureAspect>;
const organizations = cultureData.organizations as unknown as Record<string, CultureAspect>;
const upbringings = cultureData.upbringings as unknown as Record<string, CultureAspect>;
const languageList = cultureData.languages.extantLanguages as { language: string; ancestry: string }[];

export function CultureStep() {
  const { character, setCulture } = useCharacterStore();

  const selectedEnvironment = character.culture?.environment ?? null;
  const selectedOrganization = character.culture?.organization ?? null;
  const selectedUpbringing = character.culture?.upbringing ?? null;
  const selectedLanguage = character.culture?.language ?? '';

  const updateCulture = (
    env: EnvironmentId | null,
    org: OrganizationId | null,
    upb: UpbringingId | null,
    lang: string,
  ) => {
    if (env && org && upb) {
      // Use quickBuild defaults for skills
      const envSkill = environments[env]?.quickBuild ?? '';
      const orgSkill = organizations[org]?.quickBuild ?? '';
      const upbSkill = upbringings[upb]?.quickBuild ?? '';

      setCulture({
        environment: env,
        organization: org,
        upbringing: upb,
        language: lang || 'Caelian',
        environmentSkill: envSkill,
        organizationSkill: orgSkill,
        upbringingSkill: upbSkill,
      });
    } else if (env || org || upb || lang) {
      // Partial selection: store what we have, fill in defaults for missing
      setCulture({
        environment: env ?? 'urban',
        organization: org ?? 'communal',
        upbringing: upb ?? 'labor',
        language: lang || 'Caelian',
        environmentSkill: env ? (environments[env]?.quickBuild ?? '') : '',
        organizationSkill: org ? (organizations[org]?.quickBuild ?? '') : '',
        upbringingSkill: upb ? (upbringings[upb]?.quickBuild ?? '') : '',
      });
    }
  };

  const handleEnvironment = (id: EnvironmentId) => {
    updateCulture(id, selectedOrganization, selectedUpbringing, selectedLanguage);
  };

  const handleOrganization = (id: OrganizationId) => {
    updateCulture(selectedEnvironment, id, selectedUpbringing, selectedLanguage);
  };

  const handleUpbringing = (id: UpbringingId) => {
    updateCulture(selectedEnvironment, selectedOrganization, id, selectedLanguage);
  };

  const handleLanguage = (lang: string) => {
    updateCulture(selectedEnvironment, selectedOrganization, selectedUpbringing, lang);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="gold-text font-heading text-3xl tracking-wide sm:text-4xl">
          Define Your Culture
        </h2>
        <p className="font-body mt-2 text-lg text-cream-dark/80">
          Your culture shapes the environment, society, and upbringing that formed your hero.
        </p>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Environment column */}
        <div>
          <h3 className="mb-4 text-center font-heading text-xl text-gold-light">
            Environment
          </h3>
          <div className="flex flex-col gap-3">
            {Object.entries(environments).map(([id, env]) => (
              <ParchmentCard
                key={id}
                selected={selectedEnvironment === id}
                onClick={() => handleEnvironment(id as EnvironmentId)}
                hoverable
                compact
              >
                <h4 className="font-heading text-base font-semibold text-gold-light">
                  {env.name}
                </h4>
                <p className="font-body mt-1 text-sm leading-relaxed text-cream-dark/70">
                  {env.description}
                </p>
                <p className="font-body mt-2 text-xs italic text-gold-muted">
                  Skill: {env.skillOptions}
                </p>
              </ParchmentCard>
            ))}
          </div>
        </div>

        {/* Organization column */}
        <div>
          <h3 className="mb-4 text-center font-heading text-xl text-gold-light">
            Organization
          </h3>
          <div className="flex flex-col gap-3">
            {Object.entries(organizations).map(([id, org]) => (
              <ParchmentCard
                key={id}
                selected={selectedOrganization === id}
                onClick={() => handleOrganization(id as OrganizationId)}
                hoverable
                compact
              >
                <h4 className="font-heading text-base font-semibold text-gold-light">
                  {org.name}
                </h4>
                <p className="font-body mt-1 text-sm leading-relaxed text-cream-dark/70">
                  {org.description}
                </p>
                <p className="font-body mt-2 text-xs italic text-gold-muted">
                  Skill: {org.skillOptions}
                </p>
              </ParchmentCard>
            ))}
          </div>
        </div>

        {/* Upbringing column */}
        <div>
          <h3 className="mb-4 text-center font-heading text-xl text-gold-light">
            Upbringing
          </h3>
          <div className="flex flex-col gap-3">
            {Object.entries(upbringings).map(([id, upb]) => (
              <ParchmentCard
                key={id}
                selected={selectedUpbringing === id}
                onClick={() => handleUpbringing(id as UpbringingId)}
                hoverable
                compact
              >
                <h4 className="font-heading text-base font-semibold text-gold-light">
                  {upb.name}
                </h4>
                <p className="font-body mt-1 text-sm leading-relaxed text-cream-dark/70">
                  {upb.description}
                </p>
                <p className="font-body mt-2 text-xs italic text-gold-muted">
                  Skill: {upb.skillOptions}
                </p>
              </ParchmentCard>
            ))}
          </div>
        </div>
      </div>

      {/* Language selector */}
      <div className="mx-auto mt-8 max-w-md">
        <h3 className="mb-3 text-center font-heading text-xl text-gold-light">
          Language
        </h3>
        <p className="font-body mb-3 text-center text-sm text-cream-dark/70">
          All characters know Caelian. Choose one additional language from your culture.
        </p>
        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguage(e.target.value)}
          className="w-full rounded border border-gold-dark/30 bg-surface-light px-4 py-3 font-body text-cream outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Select a language...</option>
          {languageList.map((lang) => (
            <option key={lang.language} value={lang.language}>
              {lang.language} ({lang.ancestry})
            </option>
          ))}
        </select>
      </div>

      {/* Summary of selected skills */}
      {selectedEnvironment && selectedOrganization && selectedUpbringing && (
        <div className="mx-auto mt-8 max-w-lg">
          <div className="rounded-lg border border-gold-dark/30 bg-surface-light p-4">
            <h4 className="mb-2 font-heading text-sm uppercase tracking-wider text-gold">
              Culture Skills (Quick Build)
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                environments[selectedEnvironment]?.quickBuild,
                organizations[selectedOrganization]?.quickBuild,
                upbringings[selectedUpbringing]?.quickBuild,
              ]
                .filter(Boolean)
                .map((skill) => (
                  <span
                    key={skill}
                    className="badge"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
