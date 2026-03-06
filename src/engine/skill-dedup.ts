import type { CharacterData } from '../types/character';

type SkillStep = 'ancestry' | 'culture' | 'career' | 'subclass' | 'complication';

/**
 * Collect all skills chosen across character creation steps.
 */
function getUsedSkills(character: CharacterData): Record<SkillStep, string[]> {
  const result: Record<SkillStep, string[]> = {
    ancestry: [],
    culture: [],
    career: [],
    subclass: [],
    complication: [],
  };

  // Ancestry trait skills (Silver Tongue, Passionate Artisan)
  for (const trait of character.selectedTraits) {
    if (trait.skillChoices) {
      result.ancestry.push(...trait.skillChoices.filter(Boolean));
    }
  }

  // Culture skills
  if (character.culture) {
    if (character.culture.environmentSkill) result.culture.push(character.culture.environmentSkill);
    if (character.culture.organizationSkill) result.culture.push(character.culture.organizationSkill);
    if (character.culture.upbringingSkill) result.culture.push(character.culture.upbringingSkill);
  }

  // Career skills
  if (character.career) {
    result.career.push(...character.career.skills.filter(Boolean));
  }

  // Subclass skill (auto-granted)
  if (character.classChoice?.subclassSkill) {
    result.subclass.push(character.classChoice.subclassSkill);
  }

  // Complication skills
  if (character.complication) {
    result.complication.push(...character.complication.skills.filter(Boolean));
  }

  return result;
}

/**
 * Get skills that should be excluded from selection in a given step.
 * Returns all skills chosen in steps OTHER than the current one.
 */
export function getExcludedSkills(
  character: CharacterData,
  currentStep: SkillStep,
): string[] {
  const used = getUsedSkills(character);
  const excluded: string[] = [];

  const steps: SkillStep[] = ['ancestry', 'culture', 'career', 'subclass', 'complication'];
  for (const step of steps) {
    if (step !== currentStep) {
      excluded.push(...used[step]);
    }
  }

  return [...new Set(excluded)];
}
