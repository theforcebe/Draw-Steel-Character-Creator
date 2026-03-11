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
  classKitOptionId?: string;  // For no-kit classes: prayer/enchantment/augmentation ID
  secondDomainId?: string;    // For Conduit: second domain choice
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
  bleeding: 'Whenever you use a main action, use a triggered action, or make a test or ability roll using Might or Agility, you lose Stamina equal to 1d6 + your level after the action or roll is resolved. This Stamina loss can\'t be prevented in any way, and only happens once per action.',
  dazed: 'You can do only one thing on your turn: use a main action, use a maneuver, or use a move action. You can\'t use triggered actions, free triggered actions, or free maneuvers.',
  frightened: 'Any ability roll you make against the source of your fear takes a bane. If that source is a creature, their ability rolls against you gain an edge. You can\'t willingly move closer to the source of your fear if you know their location. If you gain the frightened condition from one source while already frightened by a different source, the new condition replaces the old one.',
  grabbed: 'You have speed 0 and can\'t be force moved except by the creature, object, or effect that has you grabbed. You can\'t use the Knockback maneuver and take a bane on abilities that don\'t target what has you grabbed. If the grabber moves, they bring you with them. If the grabber\'s size equals or is less than yours, their speed is halved. A creature can grab only creatures of their size or smaller (Might 2+ can grab larger up to their Might score). Unless otherwise indicated, a creature can grab only one creature at a time. Teleporting or being force moved apart ends this condition.',
  prone: 'You are flat on the ground. Any strike you make takes a bane, and melee abilities used against you gain an edge. You must crawl to move along the ground, which costs 1 additional square per square crawled. You can\'t climb, jump, swim, or fly. If you are climbing, flying, or jumping when knocked prone, you fall. You can stand up using the Stand Up maneuver.',
  restrained: 'You have speed 0, can\'t use the Stand Up maneuver, and can\'t be force moved. You take a bane on ability rolls and on Might and Agility tests, and abilities used against you gain an edge. If you teleport while restrained, this condition ends.',
  slowed: 'You have speed 2 unless your speed is already lower, and you can\'t shift.',
  taunted: 'You have a double bane on ability rolls for any ability that doesn\'t target the creature who taunted you, as long as you have line of effect to that creature. If you gain the taunted condition from one source while already taunted by a different source, the new condition replaces the old one.',
  weakened: 'You take a bane on power rolls.',
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
