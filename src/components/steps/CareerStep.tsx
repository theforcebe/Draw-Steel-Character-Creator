import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import careerData from '../../data/careers.json';
import perkData from '../../data/perks.json';
import cultureData from '../../data/cultures.json';
import { SKILL_GROUPS } from '../../data/skill-groups';
import { getExcludedSkills } from '../../engine/skill-dedup';

const languageList = cultureData.languages.extantLanguages as { language: string; ancestry: string }[];

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

interface PerkInfo {
  name: string;
  type: string;
  description: string;
}

const careers = careerData.careers as Record<string, CareerData>;
const perks = perkData.perks as Record<string, PerkInfo[]>;

/**
 * Build the list of choosable skills for each "slot" from the career's grantedFrom.
 * Returns an array of { groupLabel, skills[] } — one entry per choosable skill slot.
 *
 * Special case: "crafting_or_exploration" for Laborer means pick from both groups.
 * Special case: Performer's granted "Music or Perform" is a choice, not fixed.
 */
function buildSkillSlots(career: CareerData): { label: string; skills: string[] }[] {
  const slots: { label: string; skills: string[] }[] = [];

  // Handle "Music or Perform" in granted (Performer)
  if (career.skills.granted) {
    for (const g of career.skills.granted) {
      if (g === 'Music or Perform') {
        slots.push({ label: 'Music or Perform', skills: ['Music', 'Perform'] });
      }
      // Other granted skills are fixed — no slot needed
    }
  }

  if (career.skills.grantedFrom) {
    for (const [groupKey, count] of Object.entries(career.skills.grantedFrom)) {
      let skillList: string[];
      let label: string;

      if (groupKey === 'crafting_or_exploration') {
        skillList = [...(SKILL_GROUPS['crafting'] ?? []), ...(SKILL_GROUPS['exploration'] ?? [])];
        label = 'Crafting or Exploration';
      } else {
        skillList = SKILL_GROUPS[groupKey] ?? [];
        label = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
      }

      for (let i = 0; i < count; i++) {
        slots.push({ label, skills: skillList });
      }
    }
  }

  return slots;
}

/** Get the fixed (non-choosable) granted skills for a career. */
function getFixedGranted(career: CareerData): string[] {
  if (!career.skills.granted) return [];
  return career.skills.granted.filter((g) => g !== 'Music or Perform');
}

export function CareerStep() {
  const character = useCharacterStore((s) => s.character);
  const setCareer = useCharacterStore((s) => s.setCareer);
  const selectedCareerId = character.career?.careerId ?? null;
  const career = selectedCareerId ? careers[selectedCareerId] : null;

  const handleSelect = (careerId: string, c: CareerData) => {
    const isSame = character.career?.careerId === careerId;

    const languages: string[] = [];
    for (let i = 0; i < c.languages; i++) {
      languages.push(isSame ? (character.career!.languages[i] ?? '') : '');
    }

    setCareer({
      careerId,
      skills: isSame ? character.career!.skills : getFixedGranted(c),
      languages,
      perkName: isSame ? character.career!.perkName : '',
    });
  };

  const handleSkillChange = (slotIndex: number, value: string) => {
    if (!character.career || !career) return;
    const fixed = getFixedGranted(career);
    const slots = buildSkillSlots(career);
    // Reconstruct skills: fixed + chosen from each slot
    const chosen = slots.map((_, i) => {
      if (i === slotIndex) return value;
      // Find the current chosen value for this slot (skills after fixed, indexed by slot position)
      return character.career!.skills[fixed.length + i] ?? '';
    });
    setCareer({ ...character.career, skills: [...fixed, ...chosen.filter(Boolean)] });
  };

  const handleLanguageChange = (index: number, value: string) => {
    if (!character.career) return;
    const updated = [...character.career.languages];
    updated[index] = value;
    setCareer({ ...character.career, languages: updated });
  };

  const handlePerkChange = (perkName: string) => {
    if (!character.career) return;
    setCareer({ ...character.career, perkName });
  };

  const skillSlots = career ? buildSkillSlots(career) : [];
  const fixedSkills = career ? getFixedGranted(career) : [];
  const perkGroup = career ? (perks[career.perk.group] ?? []) : [];

  // Derive the currently chosen value per slot from the stored skills array
  const slotValues = skillSlots.map((_, i) => character.career?.skills[fixedSkills.length + i] ?? '');

  // Skills excluded from other creation steps + within-step dedup
  const excluded = getExcludedSkills(character, 'career');

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
        {Object.entries(careers).map(([id, c]) => (
          <ParchmentCard
            key={id}
            selected={selectedCareerId === id}
            onClick={() => handleSelect(id, c)}
            hoverable
            compact
            className="flex flex-col"
          >
            <h3 className="font-heading text-lg font-bold text-gold-light">
              {c.name}
            </h3>

            <p className="font-body mt-1 text-sm leading-snug text-cream-dark/70">
              {c.description}
            </p>

            {/* Skills summary */}
            <div className="mt-3">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-muted">
                Skills
              </p>
              <p className="font-body mt-0.5 text-xs text-cream-dark/60">
                {c.skills.grantedNote || c.skills.grantedFromNote || (
                  <>
                    {getFixedGranted(c).length > 0 && <>{getFixedGranted(c).join(', ')}. </>}
                    {c.skills.grantedFrom && Object.entries(c.skills.grantedFrom).map(([g, n]) => (
                      <span key={g}>{n} from {g}. </span>
                    ))}
                  </>
                )}
              </p>
            </div>

            {/* Perk */}
            <div className="mt-3">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-muted">
                Perk ({c.perk.group})
              </p>
            </div>

            {/* Bonus badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {c.languages > 0 && (
                <span className="rounded bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-light">
                  +{c.languages} Language{c.languages > 1 ? 's' : ''}
                </span>
              )}
              {c.renown > 0 && (
                <span className="badge-accent">
                  +{c.renown} Renown
                </span>
              )}
              {c.wealth > 0 && (
                <span className="rounded bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-light">
                  +{c.wealth} Wealth
                </span>
              )}
              {c.projectPoints > 0 && (
                <span className="rounded bg-surface-lighter px-2 py-0.5 text-xs font-semibold text-cream-dark">
                  {c.projectPoints} Project Pts
                </span>
              )}
            </div>
          </ParchmentCard>
        ))}
      </div>

      {/* Skill + Perk + Language selection panel (shown when a career is selected) */}
      {selectedCareerId && career && character.career && (
        <div className="mx-auto mt-8 max-w-2xl space-y-8">
          {/* Skill selection */}
          {(fixedSkills.length > 0 || skillSlots.length > 0) && (
            <div>
              <h3 className="mb-3 text-center font-heading text-xl text-gold-light">
                Career Skills
              </h3>
              {fixedSkills.length > 0 && (
                <div className="mb-3 flex flex-wrap justify-center gap-2">
                  {fixedSkills.map((s) => (
                    <span key={s} className="badge">{s} (granted)</span>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-3">
                {skillSlots.map((slot, i) => {
                  // Filter: exclude skills from other steps + other slots in this step + fixed granted
                  const otherSlotPicks = slotValues.filter((v, j) => j !== i && v);
                  const filteredSkills = slot.skills.filter(
                    (s) => !excluded.includes(s) && !otherSlotPicks.includes(s) && !fixedSkills.includes(s),
                  );
                  return (
                    <div key={i}>
                      <label className="font-heading text-xs uppercase tracking-wider text-gold-muted">
                        Choose from {slot.label}
                      </label>
                      <select
                        value={slotValues[i]}
                        onChange={(e) => handleSkillChange(i, e.target.value)}
                        className="mt-1 w-full rounded border border-gold-dark/30 bg-surface-light px-3 py-2 font-body text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                      >
                        <option value="">Select a skill...</option>
                        {filteredSkills.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Perk selection */}
          {perkGroup.length > 0 && (
            <div>
              <h3 className="mb-3 text-center font-heading text-xl text-gold-light">
                Choose a Perk ({career.perk.group})
              </h3>
              <div className="flex flex-col gap-2">
                {perkGroup.map((p) => (
                  <ParchmentCard
                    key={p.name}
                    selected={character.career?.perkName === p.name}
                    onClick={() => handlePerkChange(p.name)}
                    hoverable
                    compact
                  >
                    <h4 className="font-heading text-sm font-semibold text-gold-light">
                      {p.name}
                    </h4>
                    <p className="font-body mt-1 text-xs leading-relaxed text-cream-dark/60">
                      {p.description.length > 200 ? p.description.slice(0, 200) + '…' : p.description}
                    </p>
                  </ParchmentCard>
                ))}
              </div>
            </div>
          )}

          {/* Language selection */}
          {character.career.languages.length > 0 && (
            <div>
              <h3 className="mb-3 text-center font-heading text-xl text-gold-light">
                Bonus Language{character.career.languages.length > 1 ? 's' : ''}
              </h3>
              <p className="font-body mb-3 text-center text-sm text-cream-dark/70">
                Your career grants {character.career.languages.length} additional language{character.career.languages.length > 1 ? 's' : ''}.
              </p>
              <div className="flex flex-col gap-3">
                {character.career.languages.map((lang, index) => (
                  <select
                    key={index}
                    value={lang}
                    onChange={(e) => handleLanguageChange(index, e.target.value)}
                    className="w-full rounded border border-gold-dark/30 bg-surface-light px-4 py-3 font-body text-cream outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
                  >
                    <option value="">Select a language...</option>
                    {languageList.map((l) => (
                      <option key={l.language} value={l.language}>
                        {l.language} ({l.ancestry})
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
