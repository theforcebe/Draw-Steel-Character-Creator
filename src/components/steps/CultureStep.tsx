import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import cultureData from '../../data/cultures.json';
import { getSkillsFromGroups } from '../../data/skill-groups';
import { getExcludedSkills } from '../../engine/skill-dedup';
import type { EnvironmentId, OrganizationId, UpbringingId } from '../../types/character';

interface CultureAspect {
  name: string;
  description: string;
  skillOptions: string;
  skillGroups?: string[];
  specificSkills?: { skill: string; group: string }[];
  quickBuild: string;
}

const environments = cultureData.environments as unknown as Record<string, CultureAspect>;
const organizations = cultureData.organizations as unknown as Record<string, CultureAspect>;
const upbringings = cultureData.upbringings as unknown as Record<string, CultureAspect>;
const languageList = cultureData.languages.extantLanguages as { language: string; ancestry: string }[];

/** Get the list of choosable skills for a culture aspect (environment/org/upbringing). */
function getAspectSkills(aspect: CultureAspect): string[] {
  // Martial upbringing has a specific list of skills instead of full groups
  if (aspect.specificSkills) {
    return aspect.specificSkills.map((s) => s.skill);
  }
  if (aspect.skillGroups) {
    return getSkillsFromGroups(aspect.skillGroups);
  }
  return [];
}

export function CultureStep() {
  const { character, setCulture } = useCharacterStore();

  const selectedEnvironment = character.culture?.environment ?? null;
  const selectedOrganization = character.culture?.organization ?? null;
  const selectedUpbringing = character.culture?.upbringing ?? null;
  const selectedLanguage = character.culture?.language ?? '';
  const selectedEnvSkill = character.culture?.environmentSkill ?? '';
  const selectedOrgSkill = character.culture?.organizationSkill ?? '';
  const selectedUpbSkill = character.culture?.upbringingSkill ?? '';

  const updateCulture = (patch: {
    env?: EnvironmentId | null;
    org?: OrganizationId | null;
    upb?: UpbringingId | null;
    lang?: string;
    envSkill?: string;
    orgSkill?: string;
    upbSkill?: string;
  }) => {
    const env = patch.env !== undefined ? patch.env : selectedEnvironment;
    const org = patch.org !== undefined ? patch.org : selectedOrganization;
    const upb = patch.upb !== undefined ? patch.upb : selectedUpbringing;
    const lang = patch.lang !== undefined ? patch.lang : selectedLanguage;
    const envSkill = patch.envSkill !== undefined ? patch.envSkill : selectedEnvSkill;
    const orgSkill = patch.orgSkill !== undefined ? patch.orgSkill : selectedOrgSkill;
    const upbSkill = patch.upbSkill !== undefined ? patch.upbSkill : selectedUpbSkill;

    if (!env && !org && !upb) return;

    setCulture({
      environment: env ?? 'urban',
      organization: org ?? 'communal',
      upbringing: upb ?? 'labor',
      language: lang || 'Caelian',
      environmentSkill: envSkill,
      organizationSkill: orgSkill,
      upbringingSkill: upbSkill,
    });
  };

  const handleEnvironment = (id: EnvironmentId) => {
    // Reset skill when changing environment (old skill may not be valid)
    const aspect = environments[id];
    const skills = getAspectSkills(aspect);
    const keep = skills.includes(selectedEnvSkill) ? selectedEnvSkill : '';
    updateCulture({ env: id, envSkill: keep });
  };

  const handleOrganization = (id: OrganizationId) => {
    const aspect = organizations[id];
    const skills = getAspectSkills(aspect);
    const keep = skills.includes(selectedOrgSkill) ? selectedOrgSkill : '';
    updateCulture({ org: id, orgSkill: keep });
  };

  const handleUpbringing = (id: UpbringingId) => {
    const aspect = upbringings[id];
    const skills = getAspectSkills(aspect);
    const keep = skills.includes(selectedUpbSkill) ? selectedUpbSkill : '';
    updateCulture({ upb: id, upbSkill: keep });
  };

  // Skills excluded from other creation steps
  const excluded = getExcludedSkills(character, 'culture');

  // Raw skill lists per aspect
  const rawEnvSkills = selectedEnvironment ? getAspectSkills(environments[selectedEnvironment]) : [];
  const rawOrgSkills = selectedOrganization ? getAspectSkills(organizations[selectedOrganization]) : [];
  const rawUpbSkills = selectedUpbringing ? getAspectSkills(upbringings[selectedUpbringing]) : [];

  // Filter: exclude cross-step duplicates + within-step picks from other dropdowns
  const envSkills = rawEnvSkills.filter((s) => !excluded.includes(s) && s !== selectedOrgSkill && s !== selectedUpbSkill);
  const orgSkills = rawOrgSkills.filter((s) => !excluded.includes(s) && s !== selectedEnvSkill && s !== selectedUpbSkill);
  const upbSkills = rawUpbSkills.filter((s) => !excluded.includes(s) && s !== selectedEnvSkill && s !== selectedOrgSkill);

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
          {selectedEnvironment && (
            <div className="mt-3">
              <select
                value={selectedEnvSkill}
                onChange={(e) => updateCulture({ envSkill: e.target.value })}
                className="w-full rounded border border-gold-dark/30 bg-surface-light px-3 py-2 font-body text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              >
                <option value="">Choose a skill...</option>
                {envSkills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
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
          {selectedOrganization && (
            <div className="mt-3">
              <select
                value={selectedOrgSkill}
                onChange={(e) => updateCulture({ orgSkill: e.target.value })}
                className="w-full rounded border border-gold-dark/30 bg-surface-light px-3 py-2 font-body text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              >
                <option value="">Choose a skill...</option>
                {orgSkills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
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
          {selectedUpbringing && (
            <div className="mt-3">
              <select
                value={selectedUpbSkill}
                onChange={(e) => updateCulture({ upbSkill: e.target.value })}
                className="w-full rounded border border-gold-dark/30 bg-surface-light px-3 py-2 font-body text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              >
                <option value="">Choose a skill...</option>
                {upbSkills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
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
          onChange={(e) => updateCulture({ lang: e.target.value })}
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
      {(selectedEnvSkill || selectedOrgSkill || selectedUpbSkill) && (
        <div className="mx-auto mt-8 max-w-lg">
          <div className="rounded-2xl border border-gold-dark/30 bg-surface-light p-4">
            <h4 className="mb-2 font-heading text-sm uppercase tracking-wider text-gold">
              Culture Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {[selectedEnvSkill, selectedOrgSkill, selectedUpbSkill]
                .filter(Boolean)
                .map((skill) => (
                  <span key={skill} className="badge">{skill}</span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
