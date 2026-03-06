import type { ComputedStats } from '../types/character';
import ancestriesData from '../data/ancestries.json';
import kitsData from '../data/kits.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StaminaParams {
  classBaseStamina: number;
  classStaminaPerLevel: number;
  kitStaminaBonus: number;
  ancestryStaminaBonus: number;
  level: number;
}

interface SpeedParams {
  ancestryBaseSpeed: number;
  kitSpeedBonus: number;
  classSpeedBonus: number;
}

interface StabilityParams {
  kitStabilityBonus: number;
  ancestryStabilityBonus: number;
}

interface RecoveriesParams {
  classBaseRecoveries: number;
  ancestryRecoveryBonus: number;
}

interface ComplicationBonuses {
  stamina?: number;
  recoveries?: number;
  stability?: number;
}

interface ComputeAllParams {
  level: number;
  ancestryId: string | null;
  formerLifeAncestryId?: string | null;
  classId: string | null;
  kitId: string | null;
  selectedTraits: { name: string; cost: number }[];
  complicationBonuses?: ComplicationBonuses;
}

// ---------------------------------------------------------------------------
// Class base‐stat lookup
// ---------------------------------------------------------------------------

interface ClassBaseStats {
  baseStamina: number;
  staminaPerLevel: number;
  baseRecoveries: number;
  speedBonus: number;
}

const CLASS_STATS: Record<string, ClassBaseStats> = {
  censor:       { baseStamina: 21, staminaPerLevel: 9, baseRecoveries: 12, speedBonus: 0 },
  conduit:      { baseStamina: 18, staminaPerLevel: 6, baseRecoveries:  8, speedBonus: 0 },
  elementalist: { baseStamina: 18, staminaPerLevel: 6, baseRecoveries:  8, speedBonus: 0 },
  fury:         { baseStamina: 21, staminaPerLevel: 9, baseRecoveries: 10, speedBonus: 0 },
  null:         { baseStamina: 21, staminaPerLevel: 9, baseRecoveries:  8, speedBonus: 0 },
  shadow:       { baseStamina: 18, staminaPerLevel: 6, baseRecoveries:  8, speedBonus: 0 },
  tactician:    { baseStamina: 21, staminaPerLevel: 9, baseRecoveries: 10, speedBonus: 0 },
  talent:       { baseStamina: 18, staminaPerLevel: 6, baseRecoveries:  8, speedBonus: 0 },
  troubadour:   { baseStamina: 18, staminaPerLevel: 6, baseRecoveries:  8, speedBonus: 0 },
  summoner:     { baseStamina: 15, staminaPerLevel: 6, baseRecoveries:  8, speedBonus: 0 },
};

// ---------------------------------------------------------------------------
// Individual stat formulas
// ---------------------------------------------------------------------------

/**
 * Echelon = floor((level - 1) / 3) + 1
 *
 * Level 1-3 → Echelon 1, Level 4-6 → Echelon 2, etc.
 */
export function getEchelon(level: number): number {
  return Math.floor((level - 1) / 3) + 1;
}

/**
 * Stamina = classBaseStamina
 *         + (kitStaminaBonus * echelon)
 *         + ancestryStaminaBonus
 *         + ((level - 1) * classStaminaPerLevel)
 */
export function getStamina(params: StaminaParams): number {
  const echelon = getEchelon(params.level);
  return (
    params.classBaseStamina +
    params.kitStaminaBonus * echelon +
    params.ancestryStaminaBonus +
    (params.level - 1) * params.classStaminaPerLevel
  );
}

/**
 * Winded = floor(Stamina / 2)
 */
export function getWinded(stamina: number): number {
  return Math.floor(stamina / 2);
}

/**
 * Recovery Value = floor(Stamina / 3)
 */
export function getRecoveryValue(stamina: number): number {
  return Math.floor(stamina / 3);
}

/**
 * Speed = ancestryBaseSpeed + kitSpeedBonus + classSpeedBonus
 */
export function getSpeed(params: SpeedParams): number {
  return params.ancestryBaseSpeed + params.kitSpeedBonus + params.classSpeedBonus;
}

/**
 * Stability = 0 + kitStabilityBonus + ancestryStabilityBonus
 */
export function getStability(params: StabilityParams): number {
  return params.kitStabilityBonus + params.ancestryStabilityBonus;
}

/**
 * Recoveries = classBaseRecoveries + ancestryRecoveryBonus
 *
 * Human "Staying Power" trait grants +2 recoveries.
 */
export function getRecoveries(params: RecoveriesParams): number {
  return params.classBaseRecoveries + params.ancestryRecoveryBonus;
}

// ---------------------------------------------------------------------------
// Helpers for looking up data from JSON
// ---------------------------------------------------------------------------

type AncestryMap = typeof ancestriesData.ancestries;
type AncestryKey = keyof AncestryMap;
type AncestryEntry = AncestryMap[AncestryKey];

interface PurchasedTrait {
  name: string;
  cost: number;
  speedOverride?: number;
  stabilityBonus?: number;
  staminaBonus?: { level1: number; level4: number; level7: number; level10: number };
  recoveriesBonus?: number;
  [key: string]: unknown;
}

function getAncestry(ancestryId: string): AncestryEntry | null {
  const ancestries = ancestriesData.ancestries as Record<string, AncestryEntry>;
  return ancestries[ancestryId] ?? null;
}

interface KitBonuses {
  stamina: number | null;
  speed: number | null;
  stability: number | null;
}

function getKitBonuses(kitId: string): KitBonuses {
  const standardKits = kitsData.standardKits as Record<string, { bonuses?: Record<string, unknown> }>;
  const stormwightKits = kitsData.stormwightKits as Record<string, { bonuses?: Record<string, unknown> }>;

  const kit = standardKits[kitId] ?? stormwightKits[kitId];
  if (!kit?.bonuses) {
    return { stamina: null, speed: null, stability: null };
  }

  const b = kit.bonuses as Record<string, unknown>;
  return {
    stamina: typeof b.stamina === 'number' ? b.stamina : null,
    speed: typeof b.speed === 'number' ? b.speed : null,
    stability: typeof b.stability === 'number' ? b.stability : null,
  };
}

/**
 * Resolve the character's effective speed from ancestry data and selected
 * traits. Traits such as "Beast Legs" (devil), "Swift" (wode elf), and
 * "Lightning Nimbleness" (memonek) override the ancestry's base speed.
 */
function resolveAncestrySpeed(
  ancestry: AncestryEntry,
  selectedTraits: { name: string; cost: number }[],
): number {
  const defaultSpeed = ancestry.speed ?? 5;

  // Check selected traits for speed overrides
  const traitNames = new Set(selectedTraits.map((t) => t.name));
  const purchasedTraits = (ancestry.purchasedTraits ?? []) as PurchasedTrait[];

  for (const trait of purchasedTraits) {
    if (traitNames.has(trait.name) && trait.speedOverride != null) {
      return trait.speedOverride;
    }
  }

  return defaultSpeed;
}

/**
 * Sum up stability bonuses granted by selected ancestry traits
 * (e.g. Dwarf or Orc "Grounded" trait gives +1 stability).
 */
function resolveAncestryStabilityBonus(
  ancestry: AncestryEntry,
  selectedTraits: { name: string; cost: number }[],
): number {
  const traitNames = new Set(selectedTraits.map((t) => t.name));
  const purchasedTraits = (ancestry.purchasedTraits ?? []) as PurchasedTrait[];

  let bonus = 0;
  for (const trait of purchasedTraits) {
    if (traitNames.has(trait.name) && trait.stabilityBonus != null) {
      bonus += trait.stabilityBonus;
    }
  }
  return bonus;
}

/**
 * Resolve stamina bonuses from ancestry traits.
 * Currently only the Dwarf "Spark Off Your Skin" trait grants a stamina
 * bonus that scales at specific level breakpoints (6 at level 1, 12 at
 * level 4, 18 at level 7, 24 at level 10).
 */
function resolveAncestryStaminaBonus(
  ancestry: AncestryEntry,
  selectedTraits: { name: string; cost: number }[],
  level: number,
): number {
  const traitNames = new Set(selectedTraits.map((t) => t.name));
  const purchasedTraits = (ancestry.purchasedTraits ?? []) as PurchasedTrait[];

  let bonus = 0;
  for (const trait of purchasedTraits) {
    if (traitNames.has(trait.name) && trait.staminaBonus != null) {
      const sb = trait.staminaBonus;
      if (level >= 10) {
        bonus += sb.level10;
      } else if (level >= 7) {
        bonus += sb.level7;
      } else if (level >= 4) {
        bonus += sb.level4;
      } else {
        bonus += sb.level1;
      }
    }
  }
  return bonus;
}

/**
 * Resolve recovery bonuses from ancestry traits.
 * Human "Staying Power" trait grants +2 recoveries.
 */
function resolveAncestryRecoveryBonus(
  ancestry: AncestryEntry,
  selectedTraits: { name: string; cost: number }[],
): number {
  const traitNames = new Set(selectedTraits.map((t) => t.name));
  const purchasedTraits = (ancestry.purchasedTraits ?? []) as PurchasedTrait[];

  let bonus = 0;
  for (const trait of purchasedTraits) {
    if (traitNames.has(trait.name) && trait.recoveriesBonus != null) {
      bonus += trait.recoveriesBonus;
    }
  }
  return bonus;
}

/**
 * Resolve the character's size from ancestry data. Hakaan is 1L, Polder
 * is 1S, and Revenant varies based on former life. Most ancestries are 1M.
 *
 * If the ancestry's size is "varies" (Revenant) and a former life ancestry
 * is provided, the former life ancestry's size is used instead.
 */
function resolveSize(ancestry: AncestryEntry, formerLifeAncestry?: AncestryEntry | null): string {
  const size = (ancestry.size as string) ?? '1M';
  if (size === 'varies' && formerLifeAncestry) {
    return (formerLifeAncestry.size as string) ?? '1M';
  }
  return size;
}

// ---------------------------------------------------------------------------
// Aggregate stat computation
// ---------------------------------------------------------------------------

/**
 * Compute all derived stats for a character given their current build
 * choices. Returns `null` if a required piece of data (class) is missing.
 */
export function computeAllStats(params: ComputeAllParams): ComputedStats | null {
  const { level, ancestryId, formerLifeAncestryId, classId, kitId, selectedTraits, complicationBonuses } = params;

  // A class is required to compute stats
  if (classId == null) {
    return null;
  }

  const classStats = CLASS_STATS[classId];
  if (classStats == null) {
    return null;
  }

  // Ancestry data (optional — defaults used when no ancestry is selected)
  const ancestry = ancestryId != null ? getAncestry(ancestryId) : null;

  const ancestryBaseSpeed = ancestry != null
    ? resolveAncestrySpeed(ancestry, selectedTraits)
    : 5;

  const ancestryStabilityBonus = ancestry != null
    ? resolveAncestryStabilityBonus(ancestry, selectedTraits)
    : 0;

  const ancestryStaminaBonus = ancestry != null
    ? resolveAncestryStaminaBonus(ancestry, selectedTraits, level)
    : 0;

  const ancestryRecoveryBonus = ancestry != null
    ? resolveAncestryRecoveryBonus(ancestry, selectedTraits)
    : 0;

  // Look up former life ancestry for Revenant size resolution
  const formerLifeAncestry = (ancestryId === 'revenant' && formerLifeAncestryId)
    ? getAncestry(formerLifeAncestryId)
    : null;

  const size = ancestry != null ? resolveSize(ancestry, formerLifeAncestry) : '1M';

  // Kit bonuses (optional — zeroes when no kit is selected)
  const kit = kitId != null ? getKitBonuses(kitId) : { stamina: null, speed: null, stability: null };
  const kitStaminaBonus = kit.stamina ?? 0;
  const kitSpeedBonus = kit.speed ?? 0;
  const kitStabilityBonus = kit.stability ?? 0;

  // Echelon
  const echelon = getEchelon(level);

  // Complication bonuses
  const compStamina = complicationBonuses?.stamina ?? 0;
  const compRecoveries = complicationBonuses?.recoveries ?? 0;
  const compStability = complicationBonuses?.stability ?? 0;

  // Stamina & derived
  const stamina = getStamina({
    classBaseStamina: classStats.baseStamina,
    classStaminaPerLevel: classStats.staminaPerLevel,
    kitStaminaBonus,
    ancestryStaminaBonus: ancestryStaminaBonus + compStamina,
    level,
  });

  const winded = getWinded(stamina);
  const recoveryValue = getRecoveryValue(stamina);

  // Recoveries
  const recoveries = getRecoveries({
    classBaseRecoveries: classStats.baseRecoveries,
    ancestryRecoveryBonus: ancestryRecoveryBonus + compRecoveries,
  });

  // Speed
  const speed = getSpeed({
    ancestryBaseSpeed,
    kitSpeedBonus,
    classSpeedBonus: classStats.speedBonus,
  });

  // Stability
  const stability = getStability({
    kitStabilityBonus,
    ancestryStabilityBonus: ancestryStabilityBonus + compStability,
  });

  return {
    stamina,
    winded,
    recoveryValue,
    recoveries,
    speed,
    stability,
    size,
    echelon,
  };
}
