export type CharacteristicName = 'might' | 'agility' | 'reason' | 'intuition' | 'presence';

export interface Characteristics {
  might: number;
  agility: number;
  reason: number;
  intuition: number;
  presence: number;
}

export type AncestryId =
  | 'devil'
  | 'dragonKnight'
  | 'dwarf'
  | 'wodeElf'
  | 'highElf'
  | 'hakaan'
  | 'human'
  | 'memonek'
  | 'orc'
  | 'polder'
  | 'timeRaider'
  | 'revenant';

export type EnvironmentId = 'nomadic' | 'rural' | 'secluded' | 'urban' | 'wilderness';
export type OrganizationId = 'bureaucratic' | 'communal';
export type UpbringingId = 'academic' | 'creative' | 'labor' | 'lawless' | 'martial' | 'noble';

export type ClassId =
  | 'censor'
  | 'conduit'
  | 'elementalist'
  | 'fury'
  | 'null'
  | 'shadow'
  | 'tactician'
  | 'talent'
  | 'troubadour'
  | 'summoner';

export type KitType = 'standard' | 'stormwight';

export interface SelectedTrait {
  name: string;
  cost: number;
  // Sub-choices for traits that require further selection
  damageType?: string;          // Wyrmplate, Dragon Breath, Prismatic Scales
  runeChoice?: string;          // Runic Carving (Detection/Light/Voice)
  abilityChoice?: string;       // Psionic Gift (ability name)
  skillChoices?: string[];      // Silver Tongue (1 interpersonal), Passionate Artisan (2 crafting)
  previousLifeTrait?: string;   // Revenant Previous Life: which trait from former ancestry
}

export interface CultureChoice {
  language: string;
  environment: EnvironmentId;
  organization: OrganizationId;
  upbringing: UpbringingId;
  environmentSkill: string;
  organizationSkill: string;
  upbringingSkill: string;
}

export interface CareerChoice {
  careerId: string;
  skills: string[];
  languages: string[];
  perkName: string;
}

export interface ClassChoice {
  classId: ClassId;
  subclassId: string;
  subclassSkill: string;
  characteristics: Characteristics;
  signatureAbilityName: string;
  heroicAbilities: string[];
  kitId?: string;
  secondKitId?: string;
}

export interface ComplicationChoice {
  name: string;
  skills: string[];              // chosen + fixed skills
  languages: string[];           // chosen languages
  forgottenLanguage: string;     // language lost (Shipwrecked)
  benefitChoiceIndex: number;    // for "choose one" complications (-1 = none)
}

export interface ComputedStats {
  stamina: number;
  winded: number;
  recoveryValue: number;
  recoveries: number;
  speed: number;
  stability: number;
  size: string;
  echelon: number;
}

export type HairStyle = 'short' | 'long' | 'braided' | 'mohawk' | 'ponytail' | 'bald';

export interface PortraitSettings {
  hairStyle: HairStyle;
  hairColor: string;
  clothingColor: string;
  armorColor: string;
  weaponId?: string;
  skinColor?: string;
  accentColor?: string;
  gemColor?: string;
}

export interface CharacterData {
  // Identity
  name: string;
  level: number;

  // Step choices
  ancestryId: AncestryId | null;
  formerLifeAncestryId: AncestryId | null;  // only used when ancestryId === 'revenant'
  selectedTraits: SelectedTrait[];
  culture: CultureChoice | null;
  career: CareerChoice | null;
  classChoice: ClassChoice | null;

  // Complication (expanded from just a name)
  complication: ComplicationChoice | null;
  // Keep complicationName for backward compat during migration
  complicationName?: string | null;

  // Details
  appearance: string;
  backstory: string;

  // Visual customization
  portraitSettings: PortraitSettings | null;

  // Computed (stored for display)
  computedStats: ComputedStats | null;
}

export const WIZARD_STEPS = [
  'welcome',
  'ancestry',
  'ancestry-traits',
  'culture',
  'career',
  'class',
  'subclass',
  'characteristics',
  'kit',
  'abilities',
  'complication',
  'details',
  'model',
  'review',
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number];

// ── Play Mode Types ──

export type Condition =
  | 'bleeding'
  | 'dazed'
  | 'frightened'
  | 'grabbed'
  | 'prone'
  | 'restrained'
  | 'slowed'
  | 'taunted'
  | 'weakened';

export const CONDITIONS: Condition[] = [
  'bleeding', 'dazed', 'frightened', 'grabbed', 'prone',
  'restrained', 'slowed', 'taunted', 'weakened',
];

export const CONDITION_DESCRIPTIONS: Record<Condition, string> = {
  bleeding: 'When you use a main action, triggered action, or roll using Might/Agility, lose 1d6 + level stamina after. Cannot be prevented.',
  dazed: "Can only do one thing on your turn: main action, maneuver, or move action. Can't use triggered actions or free maneuvers.",
  frightened: "Bane on rolls against fear source. Source's rolls against you gain edge. Can't willingly move closer to source.",
  grabbed: "Speed 0. Can't be force moved (except by grabber). Bane on abilities that don't target grabber.",
  prone: 'Your strikes take a bane. Melee abilities against you gain edge. Crawling costs +1 square per square. Cannot climb, jump, swim, or fly.',
  restrained: "Speed 0. Can't stand up or be force moved. Bane on ability rolls and Might/Agility tests. Abilities against you gain edge. Teleporting ends this.",
  slowed: 'Speed becomes 2 (unless already lower). Cannot shift.',
  taunted: "Double bane on ability rolls for abilities that don't target the taunter (requires line of effect).",
  weakened: 'Bane on all power rolls.',
};

export const ABILITY_GRANT_LEVELS = [2, 3, 5, 6, 8, 9] as const;

export const VICTORIES_TO_LEVEL_UP = 16;

export const CLASS_RESOURCES: Record<string, string> = {
  censor: 'Wrath',
  conduit: 'Piety',
  elementalist: 'Essence',
  fury: 'Ferocity',
  null: 'Discipline',
  shadow: 'Insight',
  tactician: 'Focus',
  talent: 'Clarity',
  troubadour: 'Drama',
  summoner: 'Essence',
};
