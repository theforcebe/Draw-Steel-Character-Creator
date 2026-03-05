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
  characteristics: Characteristics;
  signatureAbilityName: string;
  heroicAbilities: string[];
  kitId?: string;
  secondKitId?: string;
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

  // Optional
  complicationName: string | null;

  // Details
  appearance: string;
  backstory: string;

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
  'review',
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number];
