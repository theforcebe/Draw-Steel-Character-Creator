import type { Characteristics } from '../types/character';

/** Shape of a raw ability from abilities.json (two schemas exist in the data) */
export interface RawAbility {
  name: string;
  cost: string;
  keywords: string[];
  type?: string;
  action?: string; // alternate field name for type
  distance: string;
  target: string;
  power_roll: string | { characteristic: string; tier1: string; tier2: string; tier3: string } | null;
  tier1?: string | null;
  tier2?: string | null;
  tier3?: string | null;
  effect?: string | null;
  flavor?: string | null;
  subclass?: string;
  level?: number;
}

/** A fully resolved ability with numeric values substituted in */
export interface ResolvedAbility {
  name: string;
  cost: string;
  keywords: string[];
  type: string;
  distance: string;
  target: string;
  powerRoll: string | null;
  tier1: string | null;
  tier2: string | null;
  tier3: string | null;
  effect: string | null;
  flavor: string | null;
}

/**
 * Normalize a raw ability from JSON (handles both data schemas).
 * Returns a consistent shape with `type`, `power_roll` (string), and top-level tiers.
 */
export function normalizeRawAbility(raw: RawAbility): {
  name: string;
  cost: string;
  keywords: string[];
  type: string;
  distance: string;
  target: string;
  power_roll: string | null;
  tier1: string | null;
  tier2: string | null;
  tier3: string | null;
  effect: string | null;
  flavor: string | null;
  subclass?: string;
  level?: number;
} {
  const abilityType = raw.type || raw.action || 'Action';

  let powerRollStr: string | null = null;
  let tier1: string | null = null;
  let tier2: string | null = null;
  let tier3: string | null = null;

  if (raw.power_roll && typeof raw.power_roll === 'object') {
    const pr = raw.power_roll;
    powerRollStr = `Power Roll + ${pr.characteristic}`;
    tier1 = pr.tier1;
    tier2 = pr.tier2;
    tier3 = pr.tier3;
  } else {
    powerRollStr = raw.power_roll as string | null;
    tier1 = raw.tier1 ?? null;
    tier2 = raw.tier2 ?? null;
    tier3 = raw.tier3 ?? null;
  }

  return {
    name: raw.name,
    cost: raw.cost,
    keywords: raw.keywords ?? [],
    type: abilityType,
    distance: raw.distance,
    target: raw.target,
    power_roll: powerRollStr,
    tier1,
    tier2,
    tier3,
    effect: raw.effect ?? null,
    flavor: raw.flavor ?? null,
    subclass: raw.subclass,
    level: raw.level,
  };
}

/** Map from single-letter abbreviation to characteristic key */
const CHAR_MAP: Record<string, keyof Characteristics> = {
  M: 'might',
  A: 'agility',
  R: 'reason',
  I: 'intuition',
  P: 'presence',
};

/** Map from full name to characteristic key */
const CHAR_NAME_MAP: Record<string, keyof Characteristics> = {
  Might: 'might',
  Agility: 'agility',
  Reason: 'reason',
  Intuition: 'intuition',
  Presence: 'presence',
};

/**
 * Compute potency thresholds from the character's characteristics.
 * strong = highest characteristic, average = highest - 1, weak = highest - 2
 */
export function computePotency(chars: Characteristics) {
  const highest = Math.max(
    chars.might,
    chars.agility,
    chars.reason,
    chars.intuition,
    chars.presence,
  );
  return {
    strong: highest,
    average: highest - 1,
    weak: highest - 2,
  };
}

/**
 * Get the numeric value of a characteristic from its single-letter abbreviation.
 */
function getCharValue(abbrev: string, chars: Characteristics): number | null {
  const key = CHAR_MAP[abbrev];
  return key != null ? chars[key] : null;
}

/**
 * Resolve a power_roll string by appending the numeric modifier.
 * e.g. "Power Roll + Might" => "Power Roll + Might (+2)" when Might = 2
 */
export function resolvePowerRoll(
  powerRoll: string,
  chars: Characteristics,
): string {
  // Match "Power Roll + CharacteristicName"
  return powerRoll.replace(
    /Power Roll \+ (\w+)/,
    (_match, charName: string) => {
      const key = CHAR_NAME_MAP[charName];
      if (key != null) {
        const value = chars[key];
        const sign = value >= 0 ? '+' : '';
        return `Power Roll + ${charName} (${sign}${value})`;
      }
      return _match;
    },
  );
}

/**
 * Resolve a single text string by substituting characteristic abbreviations
 * and potency comparisons with their numeric values.
 *
 * Handles these patterns:
 * 1. "5 + M" => "7" (sum of number and characteristic)
 * 2. "P < weak" => "2 < 0" (characteristic < potency threshold)
 * 3. Standalone single-letter characteristic as a damage value: "M damage" => "2 damage"
 *
 * Uses word boundaries to avoid replacing letters inside words.
 */
export function resolveText(text: string, chars: Characteristics): string {
  const potency = computePotency(chars);

  let result = text;

  // 1. Replace "N + X" patterns where X is a single characteristic letter.
  //    e.g. "5 + M" => "7" when M=2
  result = result.replace(
    /(\d+)\s*\+\s*([MARIP])\b/g,
    (_match, numStr: string, abbrev: string) => {
      const charVal = getCharValue(abbrev, chars);
      if (charVal != null) {
        return String(parseInt(numStr, 10) + charVal);
      }
      return _match;
    },
  );

  // 2. Replace "X < potency" patterns.
  //    e.g. "P < weak" => "2 < 0" when P=2 and weak=0
  result = result.replace(
    /\b([MARIP])\s*<\s*(weak|average|strong)\b/g,
    (_match, abbrev: string, level: string) => {
      const charVal = getCharValue(abbrev, chars);
      const potencyVal = potency[level as keyof typeof potency];
      if (charVal != null && potencyVal != null) {
        return `${charVal} < ${potencyVal}`;
      }
      return _match;
    },
  );

  // 3. Replace standalone characteristic letters used as damage modifiers.
  //    e.g. "M damage" => "2 damage", "M holy damage" => "2 holy damage"
  //    Only match when preceded by a word boundary and not part of a larger word,
  //    and followed by a space + lowercase word (to avoid replacing in prose like "Might").
  result = result.replace(
    /\b([MARIP])\b(?=\s+[a-z])/g,
    (_match, abbrev: string) => {
      const charVal = getCharValue(abbrev, chars);
      if (charVal != null) {
        return String(charVal);
      }
      return _match;
    },
  );

  return result;
}

/**
 * Resolve a full raw ability object into a ResolvedAbility with all
 * characteristic abbreviations and potency references replaced with
 * their numeric values.
 */
export function resolveAbility(
  ability: RawAbility,
  chars: Characteristics,
): ResolvedAbility {
  const n = normalizeRawAbility(ability);

  return {
    name: n.name,
    cost: n.cost,
    keywords: n.keywords,
    type: n.type,
    distance: n.distance,
    target: n.target,
    powerRoll: n.power_roll ? resolvePowerRoll(n.power_roll, chars) : null,
    tier1: n.tier1 ? resolveText(n.tier1, chars) : null,
    tier2: n.tier2 ? resolveText(n.tier2, chars) : null,
    tier3: n.tier3 ? resolveText(n.tier3, chars) : null,
    effect: n.effect ? resolveText(n.effect, chars) : null,
    flavor: n.flavor,
  };
}
