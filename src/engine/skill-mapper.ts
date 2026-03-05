import type { CharacterData } from '../types/character';

/**
 * Aggregates all skill names from ALL sources on a character:
 * - Culture (environment, organization, upbringing)
 * - Career (granted + chosen from grantedFrom groups)
 * - Complication (fixed + chosen skills)
 * - Ancestry traits (Silver Tongue, Passionate Artisan)
 * - Subclass (granted skill)
 *
 * The returned names match the PDF checkbox field names exactly.
 */
export function getCharacterSkills(character: CharacterData): string[] {
  const skills: string[] = [];
  const add = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      skills.push(skill);
    }
  };

  // Culture skills (one from each pillar)
  if (character.culture) {
    add(character.culture.environmentSkill);
    add(character.culture.organizationSkill);
    add(character.culture.upbringingSkill);
  }

  // Career skills
  if (character.career?.skills) {
    for (const skill of character.career.skills) {
      add(skill);
    }
  }

  // Complication skills (fixed + chosen)
  if (character.complication?.skills) {
    for (const skill of character.complication.skills) {
      add(skill);
    }
  }

  // Ancestry trait skills (Silver Tongue, Passionate Artisan)
  if (character.selectedTraits) {
    for (const trait of character.selectedTraits) {
      if (trait.skillChoices) {
        for (const skill of trait.skillChoices) {
          add(skill);
        }
      }
    }
  }

  // Subclass granted skill
  if (character.classChoice?.subclassSkill) {
    add(character.classChoice.subclassSkill);
  }

  return skills;
}
