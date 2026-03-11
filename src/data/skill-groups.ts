/**
 * Master list of all skills organized by skill group.
 * Source: Draw Steel Heroes v1.01.pdf
 */

export const SKILL_GROUPS: Record<string, string[]> = {
  crafting: [
    'Alchemy', 'Architecture', 'Blacksmithing', 'Carpentry', 'Cooking',
    'Fletching', 'Forgery', 'Jewelry', 'Mechanics', 'Tailoring',
  ],
  exploration: [
    'Climb', 'Drive', 'Endurance', 'Gymnastics', 'Heal',
    'Jump', 'Lift', 'Navigate', 'Ride', 'Swim',
  ],
  interpersonal: [
    'Brag', 'Empathize', 'Flirt', 'Gamble', 'Handle Animals',
    'Interrogate', 'Intimidate', 'Lead', 'Lie', 'Music',
    'Perform', 'Persuade', 'Read Person',
  ],
  intrigue: [
    'Alertness', 'Conceal Object', 'Disguise', 'Eavesdrop',
    'Escape Artist', 'Hide', 'Pick Lock', 'Pick Pocket',
    'Sabotage', 'Search', 'Sneak', 'Track',
  ],
  lore: [
    'Criminal Underworld', 'Culture', 'History', 'Magic', 'Monsters',
    'Nature', 'Psionics', 'Religion', 'Rumors', 'Society',
    'Strategy', 'Timescape',
  ],
};

/** All skill group names */
export const SKILL_GROUP_NAMES = Object.keys(SKILL_GROUPS) as (keyof typeof SKILL_GROUPS)[];

/** Get all skills from multiple groups */
export function getSkillsFromGroups(groups: string[]): string[] {
  const skills: string[] = [];
  for (const group of groups) {
    // Handle restricted groups like "interpersonal (Music or Perform only)"
    const match = group.match(/^(\w+)\s*\((.+?)only\)$/i);
    if (match) {
      const specificSkills = match[2].split(/\s+or\s+/i).map((s) => s.trim());
      skills.push(...specificSkills);
    } else if (SKILL_GROUPS[group]) {
      skills.push(...SKILL_GROUPS[group]);
    }
  }
  return [...new Set(skills)];
}

/** Get all skills from all groups EXCEPT the named groups */
export function getSkillsExcludingGroups(excludeGroups: string[]): string[] {
  const skills: string[] = [];
  for (const [group, groupSkills] of Object.entries(SKILL_GROUPS)) {
    if (!excludeGroups.includes(group)) {
      skills.push(...groupSkills);
    }
  }
  return skills;
}

/** Get all skills from all groups */
export function getAllSkills(): string[] {
  return Object.values(SKILL_GROUPS).flat();
}
