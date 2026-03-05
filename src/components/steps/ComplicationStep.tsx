import { useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import complicationsData from '../../data/complications.json';
import cultureData from '../../data/cultures.json';
import { COMPLICATION_CHOICES } from '../../data/complication-choices';
import { SKILL_GROUPS, getSkillsFromGroups, getSkillsExcludingGroups, getAllSkills } from '../../data/skill-groups';
import type { ComplicationChoice } from '../../types/character';

interface Complication {
  name: string;
  benefit: string;
  drawback: string;
}

const complications: Complication[] = complicationsData.complications;
const extantLanguages = cultureData.languages.extantLanguages as { language: string; ancestry: string }[];
const deadLanguages = cultureData.languages.deadLanguages as { language: string; ancestry: string }[];
const allLanguages = [...extantLanguages, ...deadLanguages];

function getLanguageOptions(type: 'extant' | 'dead' | 'any') {
  if (type === 'extant') return extantLanguages;
  if (type === 'dead') return deadLanguages;
  return allLanguages;
}

function getAvailableSkills(meta: { fromGroups?: string[]; specificSkills?: string[]; excludeGroups?: string[] }): string[] {
  if (meta.specificSkills) return meta.specificSkills;
  if (meta.excludeGroups) return getSkillsExcludingGroups(meta.excludeGroups);
  if (meta.fromGroups) return getSkillsFromGroups(meta.fromGroups);
  return getAllSkills();
}

export function ComplicationStep() {
  const character = useCharacterStore((s) => s.character);
  const complication = character.complication;
  const setComplication = useCharacterStore((s) => s.setComplication);

  // Build the character's known languages for the forgotten language picker
  const knownLanguages: string[] = ['Caelian'];
  if (character.culture?.language) knownLanguages.push(character.culture.language);
  if (character.career?.languages) knownLanguages.push(...character.career.languages.filter(Boolean));
  const uniqueKnownLanguages = [...new Set(knownLanguages)];

  const [useComplication, setUseComplication] = useState(complication !== null);

  const selectedName = complication?.name ?? null;

  function handleToggle() {
    const next = !useComplication;
    setUseComplication(next);
    if (!next) {
      setComplication(null);
    }
  }

  function handleSelect(name: string) {
    if (name === selectedName) {
      setComplication(null);
      return;
    }

    const meta = COMPLICATION_CHOICES[name];

    // Build initial skills from fixed skills
    const fixedSkills = meta?.fixedSkills ?? [];

    // Count how many chooseable skill slots
    const totalSkillSlots = (meta?.skillChoices ?? []).reduce((sum, c) => sum + c.count, 0);
    const chooseableSlots: string[] = new Array(totalSkillSlots).fill('');

    // Count language slots
    const totalLangSlots = (meta?.languageChoices ?? []).reduce((sum, c) => sum + c.count, 0);
    const langSlots: string[] = new Array(totalLangSlots).fill('');

    setComplication({
      name,
      skills: [...fixedSkills, ...chooseableSlots],
      languages: langSlots,
      forgottenLanguage: '',
      benefitChoiceIndex: -1,
    });
  }

  function handleSkillChange(index: number, value: string) {
    if (!complication) return;
    const updated = [...complication.skills];
    updated[index] = value;
    setComplication({ ...complication, skills: updated });
  }

  function handleLanguageChange(index: number, value: string) {
    if (!complication) return;
    const updated = [...complication.languages];
    updated[index] = value;
    setComplication({ ...complication, languages: updated });
  }

  function handleForgottenLanguageChange(value: string) {
    if (!complication) return;
    setComplication({ ...complication, forgottenLanguage: value });
  }

  function handleBenefitChoice(index: number) {
    if (!complication) return;
    setComplication({ ...complication, benefitChoiceIndex: index });
  }

  const meta = selectedName ? COMPLICATION_CHOICES[selectedName] : null;
  const fixedSkillCount = meta?.fixedSkills?.length ?? 0;
  const hasChoices = meta && (
    (meta.skillChoices && meta.skillChoices.length > 0) ||
    (meta.languageChoices && meta.languageChoices.length > 0) ||
    meta.languageLoss ||
    meta.benefitChoice
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Complication</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          Complications add narrative depth with both benefits and drawbacks.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className="font-heading text-sm text-gold/80 tracking-wide">
          Use a Complication?
        </span>
        <button
          type="button"
          onClick={handleToggle}
          className={[
            'relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer border',
            useComplication
              ? 'bg-gold-dark border-gold shadow-[0_0_8px_rgba(201,168,76,0.3)]'
              : 'bg-ink/60 border-gold-dark/40',
          ].join(' ')}
        >
          <div
            className={[
              'absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300',
              useComplication
                ? 'left-7 bg-gold-light shadow-lg'
                : 'left-0.5 bg-gold-dark/60',
            ].join(' ')}
          />
        </button>
      </div>

      {!useComplication ? (
        <div className="text-center py-12">
          <p className="font-body text-lg text-cream-dark/40 italic">
            Complications are optional. You can proceed without one.
          </p>
        </div>
      ) : (
        <>
          <div className="max-h-[60vh] overflow-y-auto pr-2 flex flex-col gap-4">
            {complications.map((comp) => (
              <ParchmentCard
                key={comp.name}
                selected={selectedName === comp.name}
                hoverable
                compact
                onClick={() => handleSelect(comp.name)}
              >
                <h3 className="font-heading text-lg font-bold text-gold-light mb-3">
                  {comp.name}
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-heading text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Benefit
                      </span>
                      <p className="font-body text-sm text-cream-dark/70 leading-relaxed mt-0.5">
                        {comp.benefit}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-red-400" />
                    <div>
                      <span className="font-heading text-xs font-semibold uppercase tracking-wider text-red-400">
                        Drawback
                      </span>
                      <p className="font-body text-sm text-cream-dark/70 leading-relaxed mt-0.5">
                        {comp.drawback}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show badges for what this complication grants */}
                {COMPLICATION_CHOICES[comp.name] && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {COMPLICATION_CHOICES[comp.name].fixedSkills?.map((s) => (
                      <span key={s} className="badge">{s}</span>
                    ))}
                    {COMPLICATION_CHOICES[comp.name].skillChoices?.map((c, i) => (
                      <span key={`sc-${i}`} className="rounded bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-light">
                        +{c.count} Skill{c.count > 1 ? 's' : ''} (choose)
                      </span>
                    ))}
                    {COMPLICATION_CHOICES[comp.name].languageChoices?.map((c, i) => (
                      <span key={`lc-${i}`} className="rounded bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-light">
                        +{c.count} {c.type} language{c.count > 1 ? 's' : ''}
                      </span>
                    ))}
                    {COMPLICATION_CHOICES[comp.name].statBonuses && (
                      <StatBonusBadges bonuses={COMPLICATION_CHOICES[comp.name].statBonuses!} />
                    )}
                    {COMPLICATION_CHOICES[comp.name].benefitChoice && (
                      <span className="rounded bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-light">
                        Choose benefit
                      </span>
                    )}
                  </div>
                )}
              </ParchmentCard>
            ))}
          </div>

          {/* Choice UI for selected complication */}
          {selectedName && complication && hasChoices && (
            <div className="mx-auto mt-4 w-full max-w-lg">
              <div className="rounded-lg border border-gold-dark/30 bg-surface-light p-5">
                <h4 className="mb-4 font-heading text-sm uppercase tracking-wider text-gold">
                  {selectedName} — Choices
                </h4>

                {/* Fixed skills display */}
                {meta?.fixedSkills && meta.fixedSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-muted mb-1">
                      Granted Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {meta.fixedSkills.map((s) => (
                        <span key={s} className="badge">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chooseable skills */}
                {meta?.skillChoices?.map((choice, choiceIdx) => {
                  const available = getAvailableSkills(choice);
                  // Calculate the offset into the complication.skills array
                  let offset = fixedSkillCount;
                  for (let i = 0; i < choiceIdx; i++) {
                    offset += (meta.skillChoices![i].count);
                  }

                  const groupLabel = choice.fromGroups
                    ? choice.fromGroups.join(' or ')
                    : choice.excludeGroups
                      ? `any except ${choice.excludeGroups.join(', ')}`
                      : choice.specificSkills
                        ? 'listed skills'
                        : 'any group';

                  return (
                    <div key={choiceIdx} className="mb-4">
                      <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-muted mb-2">
                        Choose {choice.count} skill{choice.count > 1 ? 's' : ''} ({groupLabel})
                      </p>
                      <div className="flex flex-col gap-2">
                        {Array.from({ length: choice.count }).map((_, slotIdx) => (
                          <select
                            key={slotIdx}
                            value={complication.skills[offset + slotIdx] ?? ''}
                            onChange={(e) => handleSkillChange(offset + slotIdx, e.target.value)}
                            className="w-full rounded border border-gold-dark/30 bg-surface-light px-3 py-2 font-body text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                          >
                            <option value="">Select a skill...</option>
                            {available.map((skill) => (
                              <option key={skill} value={skill}>{skill}</option>
                            ))}
                          </select>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Language choices */}
                {meta?.languageChoices?.map((choice, choiceIdx) => {
                  const options = getLanguageOptions(choice.type);
                  let offset = 0;
                  for (let i = 0; i < choiceIdx; i++) {
                    offset += (meta.languageChoices![i].count);
                  }

                  return (
                    <div key={`lang-${choiceIdx}`} className="mb-4">
                      <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-muted mb-2">
                        Choose {choice.count} {choice.type} language{choice.count > 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-col gap-2">
                        {Array.from({ length: choice.count }).map((_, slotIdx) => (
                          <select
                            key={slotIdx}
                            value={complication.languages[offset + slotIdx] ?? ''}
                            onChange={(e) => handleLanguageChange(offset + slotIdx, e.target.value)}
                            className="w-full rounded border border-gold-dark/30 bg-surface-light px-3 py-2 font-body text-sm text-cream outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                          >
                            <option value="">Select a language...</option>
                            {options.map((l) => (
                              <option key={l.language} value={l.language}>
                                {l.language} ({l.ancestry})
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Language loss (Shipwrecked) */}
                {meta?.languageLoss && (
                  <div className="mb-4">
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
                      Forget {meta.languageLoss} known language
                    </p>
                    <select
                      value={complication.forgottenLanguage}
                      onChange={(e) => handleForgottenLanguageChange(e.target.value)}
                      className="w-full rounded border border-red-400/30 bg-surface-light px-3 py-2 font-body text-sm text-cream outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                    >
                      <option value="">Select a language to forget...</option>
                      {uniqueKnownLanguages
                        .filter((l) => l !== 'Caelian') // Can't forget Caelian
                        .map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Benefit choice (Infernal Contract) */}
                {meta?.benefitChoice && (
                  <div className="mb-4">
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-muted mb-2">
                      Choose one benefit
                    </p>
                    <div className="flex flex-col gap-2">
                      {meta.benefitChoice.map((option, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleBenefitChoice(idx)}
                          className={[
                            'w-full rounded border px-4 py-2 text-left font-body text-sm transition-all',
                            complication.benefitChoiceIndex === idx
                              ? 'border-gold bg-gold/10 text-gold-light'
                              : 'border-gold-dark/30 text-cream-dark/70 hover:border-gold/50',
                          ].join(' ')}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatBonusBadges({ bonuses }: { bonuses: { stamina?: number; recoveries?: number; stability?: number; renown?: number; wealth?: number } }) {
  const parts: string[] = [];
  if (bonuses.stamina) parts.push(`${bonuses.stamina > 0 ? '+' : ''}${bonuses.stamina} Stamina`);
  if (bonuses.recoveries) parts.push(`${bonuses.recoveries > 0 ? '+' : ''}${bonuses.recoveries} Recoveries`);
  if (bonuses.stability) parts.push(`${bonuses.stability > 0 ? '+' : ''}${bonuses.stability} Stability`);
  if (bonuses.renown) parts.push(`${bonuses.renown > 0 ? '+' : ''}${bonuses.renown} Renown`);
  if (bonuses.wealth) parts.push(`${bonuses.wealth > 0 ? '+' : ''}${bonuses.wealth} Wealth`);
  return (
    <>
      {parts.map((p) => (
        <span key={p} className="badge-accent">{p}</span>
      ))}
    </>
  );
}
