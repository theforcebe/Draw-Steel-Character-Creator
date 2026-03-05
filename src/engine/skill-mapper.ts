import type { CharacterData } from '../types/character';

/**
 * Aggregates all skill names from a character's culture and career choices.
 * The returned names match the PDF checkbox field names exactly.
 */
export function getCharacterSkills(character: CharacterData): string[] {
  const skills: string[] = [];

  // Culture skills (one from each pillar)
  if (character.culture) {
    if (character.culture.environmentSkill) {
      skills.push(character.culture.environmentSkill);
    }
    if (character.culture.organizationSkill) {
      skills.push(character.culture.organizationSkill);
    }
    if (character.culture.upbringingSkill) {
      skills.push(character.culture.upbringingSkill);
    }
  }

  // Career skills
  if (character.career?.skills) {
    for (const skill of character.career.skills) {
      if (skill && !skills.includes(skill)) {
        skills.push(skill);
      }
    }
  }

  return skills;
}
