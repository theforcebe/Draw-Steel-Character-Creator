/**
 * Metadata for complications that grant mechanical character sheet choices.
 * Only complications that affect skills, languages, stats, or require
 * a benefit choice are listed here.
 */

export interface ComplicationSkillChoice {
  count: number;
  fromGroups?: string[];        // skill groups to choose from
  specificSkills?: string[];    // specific skills to choose from
  excludeGroups?: string[];     // "any group except these"
}

export interface ComplicationLanguageChoice {
  count: number;
  type: 'extant' | 'dead' | 'any';
}

export interface ComplicationStatBonus {
  stamina?: number;
  recoveries?: number;
  stability?: number;
  renown?: number;
  wealth?: number;
  staminaScaling?: boolean; // if true, stamina bonus repeats at 4/7/10
}

export interface ComplicationBenefitOption {
  label: string;
  stats: ComplicationStatBonus;
}

export interface ComplicationMeta {
  fixedSkills?: string[];
  skillChoices?: ComplicationSkillChoice[];
  languageChoices?: ComplicationLanguageChoice[];
  languageLoss?: number; // number of known languages to forget
  statBonuses?: ComplicationStatBonus;
  benefitChoice?: ComplicationBenefitOption[]; // pick one of these
}

export const COMPLICATION_CHOICES: Record<string, ComplicationMeta> = {
  'Consuming Interest': {
    skillChoices: [{ count: 1, fromGroups: ['lore'] }],
  },
  'Crash Landed': {
    fixedSkills: ['Timescape'],
  },
  'Curse of Punishment': {
    statBonuses: { recoveries: 1 },
  },
  'Curse of Stone': {
    statBonuses: { stability: 1 },
  },
  'Disgraced': {
    skillChoices: [{ count: 1, fromGroups: ['interpersonal', 'intrigue'] }],
    statBonuses: { renown: 1 },
  },
  'Elemental Inside': {
    statBonuses: { stamina: 3, staminaScaling: true },
  },
  'Exile': {
    languageChoices: [{ count: 1, type: 'extant' }],
  },
  'Fallen Immortal': {
    fixedSkills: ['Religion'],
  },
  'Grifter': {
    skillChoices: [{ count: 1, fromGroups: ['intrigue'] }],
  },
  'Hunted': {
    skillChoices: [{ count: 1, fromGroups: ['intrigue'] }],
  },
  'Hunter': {
    skillChoices: [{
      count: 1,
      specificSkills: [
        'Interrogate', 'Alertness', 'Eavesdrop', 'Search',
        'Track', 'Criminal Underworld', 'Rumors', 'Society',
      ],
    }],
  },
  'Indebted': {
    statBonuses: { wealth: -5 },
  },
  'Infernal Contract ... But, Like, Bad': {
    benefitChoice: [
      { label: '+2 Renown', stats: { renown: 2 } },
      { label: '+2 Wealth', stats: { wealth: 2 } },
      { label: '+3 Stamina', stats: { stamina: 3 } },
    ],
  },
  'Ivory Tower': {
    skillChoices: [{ count: 3 }], // any group
    languageChoices: [{ count: 1, type: 'dead' }],
  },
  'Master Chef': {
    fixedSkills: ['Cooking'],
  },
  'Outlaw': {
    statBonuses: { renown: 1 },
  },
  'Primordial Sickness': {
    statBonuses: { recoveries: -1 },
  },
  'Promising Apprentice': {
    skillChoices: [{ count: 1, fromGroups: ['crafting'] }],
  },
  'Raised by Beasts': {
    fixedSkills: ['Handle Animals'],
  },
  'Runaway': {
    skillChoices: [{ count: 1, fromGroups: ['crafting'] }],
  },
  'Secret Identity': {
    skillChoices: [{ count: 1, fromGroups: ['intrigue'] }],
  },
  'Shattered Legacy': {
    languageChoices: [{ count: 1, type: 'any' }],
  },
  'Shipwrecked': {
    skillChoices: [{ count: 2, fromGroups: ['exploration'] }],
    languageLoss: 1,
  },
  'Silent Sentinel': {
    fixedSkills: ['Eavesdrop', 'Sneak'],
    skillChoices: [{ count: 1, fromGroups: ['lore'] }],
  },
  'Vow of Duty': {
    statBonuses: { stability: 1 },
  },
  'Wodewalker': {
    // Recovery value + highest characteristic - too complex for static bonus,
    // noted here for documentation but handled specially in stat calculator
  },
  'Wrongly Imprisoned': {
    skillChoices: [{ count: 2, excludeGroups: ['interpersonal'] }],
  },
};
