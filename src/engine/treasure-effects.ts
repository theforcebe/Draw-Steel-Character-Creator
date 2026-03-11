/**
 * Treasure Effects Engine
 *
 * Maps equipped treasures to structured stat bonuses, extra damage,
 * granted abilities, and passive effects. Used by stat-calculator
 * and play mode components.
 */

import type { InventoryItem } from '../stores/play-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TreasureLevelEffect {
  stamina?: number;
  speed?: number;
  stability?: number;
  damage?: number;
  damageAppliesTo?: 'weapon' | 'implement' | 'unarmed' | 'all';
  extraDamage?: number;
  extraDamageType?: string;
  meleeDistance?: number;
  rangedDistance?: number;
  passiveEffects?: string[];
}

export interface TreasureEffectEntry {
  slot: 'armor' | 'shield' | 'weapon' | 'implement' | 'ring' | 'hands' | 'feet' | 'neck' | 'other';
  levels: Record<string, TreasureLevelEffect>;
}

export interface TreasureBonuses {
  stamina: number;
  speed: number;
  stability: number;
  // These surface in UI but don't go into stat-calculator
  weaponDamage: number;
  implementDamage: number;
  unarmedDamage: number;
  extraDamage: { value: number; type: string; source: string }[];
  meleeDistance: number;
  rangedDistance: number;
  passiveEffects: { source: string; effects: string[] }[];
}

// ---------------------------------------------------------------------------
// Treasure Effect Data
// ---------------------------------------------------------------------------

const TREASURE_EFFECTS: Record<string, TreasureEffectEntry> = {
  // === ARMOR: LIGHT ===
  'adaptive-second-skin-of-toxins': {
    slot: 'armor',
    levels: {
      '1': { stamina: 6, passiveEffects: ['Immunity to acid and poison damage equal to highest characteristic'] },
      '5': { stamina: 12, passiveEffects: ['Immunity to acid and poison damage equal to highest characteristic', 'Adjacent creatures who damage you take 3 acid or poison damage'] },
      '9': { stamina: 21, passiveEffects: ['Immunity to acid and poison damage equal to highest characteristic', 'Adjacent creatures who damage you take 6 acid or poison damage'] },
    },
  },
  'paper-trappings': {
    slot: 'armor',
    levels: {
      '1': { stamina: 6 },
      '5': { stamina: 12 },
      '9': { stamina: 21 },
    },
  },
  'shrouded-memory': {
    slot: 'armor',
    levels: {
      '1': { stamina: 6, passiveEffects: ['Edge on tests to lie about or conceal identity'] },
      '5': { stamina: 12, passiveEffects: ['Edge on tests to lie about or conceal identity', 'Triggered action on damage: teleport up to 5 squares'] },
      '9': { stamina: 21, passiveEffects: ['Edge on tests to lie about or conceal identity', 'Triggered action on damage: teleport up to damage taken squares, become invisible to attacker'] },
    },
  },

  // === ARMOR: MEDIUM ===
  'grand-scarab': {
    slot: 'armor',
    levels: {
      '1': { stamina: 6, passiveEffects: ['Flight (must end turn on ground)'] },
      '5': { stamina: 12, passiveEffects: ['Flight (can remain airborne)'] },
      '9': { stamina: 21, passiveEffects: ['Flight; flying before a strike grants edge'] },
    },
  },
  'kuranzoi-prismscale': {
    slot: 'armor',
    levels: {
      '1': { stamina: 6, passiveEffects: ['Triggered action: slow attacker within 5 squares'] },
      '5': { stamina: 12, passiveEffects: ['Triggered action: slow attacker within 5 squares', 'Captured moment deals corruption damage equal to 2x highest characteristic'] },
      '9': { stamina: 21, passiveEffects: ['Triggered action: slow attacker within 5 squares', 'Release captured moment for +3 speed until end of next turn'] },
    },
  },

  // === ARMOR: HEAVY ===
  'star-hunter': {
    slot: 'armor',
    levels: {
      '1': { stamina: 6, passiveEffects: ['Know location of concealed creatures within 2 squares', 'Maneuver: turn invisible (ends on damage/ability/turn)'] },
      '5': { stamina: 12, passiveEffects: ['Know location of concealed creatures within 5 squares', 'Invisibility persists through turn', 'Psychic immunity 5'] },
      '9': { stamina: 21, passiveEffects: ['Know location of concealed creatures within 10 squares', 'Invisibility doesn\'t end on ability use', 'Psychic immunity 10'] },
    },
  },
  'spiny-turtle': {
    slot: 'armor',
    levels: {
      '1': { stamina: 6, passiveEffects: ['Main action: deploy 4-square wall (takes 15 damage to retract)'] },
      '5': { stamina: 12, passiveEffects: ['Main action: deploy wall (takes 25 damage to retract)', 'Spikes deal 3 damage to creatures who damage the wall'] },
      '9': { stamina: 21, passiveEffects: ['Spikes on armor: adjacent creatures who damage you take 6 damage'] },
    },
  },
  'chain-of-the-sea-and-sky': {
    slot: 'armor',
    levels: {
      '1': { stamina: 6, passiveEffects: ['Swim at full speed', 'Breathe underwater for 1 hour'] },
      '5': { stamina: 12, passiveEffects: ['Swim at full speed', 'Breathe underwater', 'Cold immunity 5', 'Glide: descend 1 square/round, 6 squares horizontal'] },
      '9': { stamina: 21, passiveEffects: ['Swim at full speed', 'Breathe underwater', 'Cold immunity 10', 'Edge on tests when feet not touching ground'] },
    },
  },

  // === SHIELDS ===
  'kings-roar': {
    slot: 'shield',
    levels: {
      '1': { stamina: 3, passiveEffects: ['Maneuver: roar pushes adjacent creature 3 squares'] },
      '5': { stamina: 6, passiveEffects: ['Maneuver: roar pushes adjacent creature 4 squares'] },
      '9': { stamina: 9, passiveEffects: ['Maneuver: roar pushes creatures within 6 squares 5 squares, targets slowed'] },
    },
  },
  'telekinetic-bulwark': {
    slot: 'shield',
    levels: {
      '1': { stamina: 2, passiveEffects: ['Triggered action: grab adjacent enemy'] },
      '5': { stamina: 5, passiveEffects: ['Triggered action: grab enemy within 10 squares', 'Enemies take bane on Escape Grab'] },
      '9': { stamina: 9, passiveEffects: ['Triggered action: grab enemy within 10 squares', 'Maneuver: pull grabbed targets up to 5 squares'] },
    },
  },

  // === WEAPONS ===
  'authoritys-end': {
    slot: 'weapon',
    levels: {
      '1': { damage: 1, damageAppliesTo: 'weapon', passiveEffects: ['Maneuver after damage: end one effect on you or ally within 5 squares'] },
      '5': { damage: 2, damageAppliesTo: 'weapon', passiveEffects: ['You and allies within 2 squares gain +1 to saving throws'] },
      '9': { damage: 3, damageAppliesTo: 'weapon', passiveEffects: ['Automatically end effects when dealing damage'] },
    },
  },
  'blade-of-quintessence': {
    slot: 'weapon',
    levels: {
      '1': { damage: 1, damageAppliesTo: 'weapon', passiveEffects: ['Can change damage type to cold, fire, lightning, or sonic'] },
      '5': { damage: 2, damageAppliesTo: 'weapon', rangedDistance: 3, passiveEffects: ['Can be used with ranged abilities; returns to you'] },
      '9': { damage: 3, damageAppliesTo: 'weapon', rangedDistance: 3, passiveEffects: ['Immunity 10 to cold, fire, lightning, and sonic'] },
    },
  },
  'blade-of-the-luxurious-fop': {
    slot: 'weapon',
    levels: {
      '1': { damage: 1, damageAppliesTo: 'weapon', passiveEffects: ['Shift 1 square after dealing rolled damage'] },
      '5': { damage: 2, damageAppliesTo: 'weapon', passiveEffects: ['Shift 1 square after dealing rolled damage', 'Fancy footwork on opportunity attacks knocks prone'] },
      '9': { damage: 3, damageAppliesTo: 'weapon', passiveEffects: ['Shift 1 square after dealing rolled damage', 'Double edge on interpersonal skill tests'] },
    },
  },
  'displacer': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'psychic', passiveEffects: ['Maneuver: trade places with damaged target'] },
      '5': { extraDamage: 2, extraDamageType: 'psychic', passiveEffects: ['Trade places with creature within 4 squares of target'] },
      '9': { extraDamage: 3, extraDamageType: 'psychic', passiveEffects: ['Trade places with creature within 8 squares'] },
    },
  },
  'executioners-blade': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'psychic', passiveEffects: ['Extra +1 psychic if target is winded', 'Gain 10 temporary stamina when first winding a target'] },
      '5': { extraDamage: 2, extraDamageType: 'psychic', passiveEffects: ['Extra +2 psychic if target is winded', 'Gain 2 surges when winding a target'] },
      '9': { extraDamage: 3, extraDamageType: 'psychic', passiveEffects: ['Extra +3 psychic if target is winded', 'Edge on abilities against winded targets'] },
    },
  },
  'icemaker-maul': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'cold', passiveEffects: ['Maneuver: create 3-burst ice field (difficult terrain)'] },
      '5': { extraDamage: 2, extraDamageType: 'cold', passiveEffects: ['Ice field becomes 4-burst', 'Gain 1 surge using ability in ice field'] },
      '9': { extraDamage: 3, extraDamageType: 'cold', passiveEffects: ['Ice field becomes 5-burst', 'Shatter enemies at 0 stamina in ice for 15 cold damage'] },
    },
  },
  'knife-of-nine': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'psychic', passiveEffects: ['Extra psychic damage increases by 1 per hit on same target (max 3)'] },
      '5': { extraDamage: 1, extraDamageType: 'psychic', passiveEffects: ['Expend indentations for extra psychic on signature ability'] },
      '9': { extraDamage: 1, extraDamageType: 'psychic', passiveEffects: ['Extra 10 psychic on drop attack from 2+ squares'] },
    },
  },
  'lance-of-the-sundered-star': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'holy', passiveEffects: ['Shift to square adjacent to pushed target'] },
      '5': { extraDamage: 2, extraDamageType: 'holy', passiveEffects: ['Can fly during Charge or shift (fall if not on ground)'] },
      '9': { extraDamage: 3, extraDamageType: 'holy', passiveEffects: ['Forced movement from push/slide can be vertical'] },
    },
  },
  'molten-constrictor': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'fire', passiveEffects: ['Tier 3 outcome automatically grabs target'] },
      '5': { extraDamage: 2, extraDamageType: 'fire', passiveEffects: ['Grabbed target takes 8 fire on Escape Grab'] },
      '9': { extraDamage: 3, extraDamageType: 'fire', passiveEffects: ['Escape takes 15 fire', 'Maneuver for free strike with another weapon'] },
    },
  },
  'onerous-bow': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'poison', passiveEffects: ['Tier 3 signature ability weakens target'] },
      '5': { extraDamage: 2, extraDamageType: 'poison', passiveEffects: ['Tier 3 weakens and slows until end of next turn'] },
      '9': { extraDamage: 3, extraDamageType: 'poison', passiveEffects: ['Take bane to target additional adjacent creatures'] },
    },
  },
  'steeltongue': {
    slot: 'weapon',
    levels: {
      '1': { meleeDistance: 1, passiveEffects: ['Bleeding (save ends) on damage against creature below average'] },
      '5': { meleeDistance: 2, passiveEffects: ['+3 damage against bleeding creatures'] },
      '9': { meleeDistance: 3, passiveEffects: ['Signature ability against bleeding creatures can be repeated as maneuver'] },
    },
  },
  'third-eye-seeker': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'psychic', passiveEffects: ['Tier 3 dazes target until end of next turn'] },
      '5': { extraDamage: 2, extraDamageType: 'psychic', passiveEffects: ['Triggered action: ranged free strike after creature uses triggered action'] },
      '9': { extraDamage: 3, extraDamageType: 'psychic', passiveEffects: ['Double edge against creatures who used psionic ability'] },
    },
  },
  'thunderhead-bident': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'sonic', passiveEffects: ['Push bonus +1 (or 1 square push on non-push abilities)'] },
      '5': { extraDamage: 2, extraDamageType: 'sonic', passiveEffects: ['Push bonus +2', 'Can be used ranged; +1 sonic per 2 squares traveled'] },
      '9': { extraDamage: 3, extraDamageType: 'sonic', passiveEffects: ['+1 sonic per square traveled', '6 sonic damage to adjacent enemies'] },
    },
  },
  'wetwork': {
    slot: 'weapon',
    levels: {
      '1': { extraDamage: 1, extraDamageType: 'psychic', passiveEffects: ['On killing blow: maneuver for melee free strike'] },
      '5': { extraDamage: 2, extraDamageType: 'psychic', passiveEffects: ['Move 2 squares before/after free strike'] },
      '9': { extraDamage: 3, extraDamageType: 'psychic', passiveEffects: ['Move full speed and use signature ability or free strike'] },
    },
  },

  // === IMPLEMENTS ===
  'abjurers-bastion': {
    slot: 'implement',
    levels: {
      '1': { damage: 1, damageAppliesTo: 'implement', passiveEffects: ['Gain temporary stamina equal to highest characteristic on damage'] },
      '5': { damage: 2, damageAppliesTo: 'implement', passiveEffects: ['Gain temporary stamina on damage', 'Maneuver: create 1-cube protection field (damage immunity 5)'] },
      '9': { damage: 3, damageAppliesTo: 'implement', passiveEffects: ['Gain temporary stamina on damage', '3-cube field within 10 squares, all creatures gain benefits'] },
    },
  },
  'brittlebreaker': {
    slot: 'implement',
    levels: {
      '1': { extraDamage: 2, extraDamageType: 'psychic', passiveEffects: ['Damage weakness 3', 'Edge on abilities if not at full stamina, double edge if winded'] },
      '5': { extraDamage: 3, extraDamageType: 'psychic', passiveEffects: ['Damage weakness 3', 'Extra damage doubled after taking 20+ damage (once per round)'] },
      '9': { extraDamage: 4, extraDamageType: 'psychic', passiveEffects: ['Damage weakness 3', 'Can take half damage dealt to repeat same ability (once per turn)'] },
    },
  },
  'chaldorb': {
    slot: 'implement',
    levels: {
      '1': { damage: 1, damageAppliesTo: 'implement', passiveEffects: ['Magic strikes must deal cold damage'] },
      '5': { damage: 2, damageAppliesTo: 'implement', passiveEffects: ['Magic strikes deal cold', '3 cold damage whirlwind to adjacent enemies'] },
      '9': { damage: 3, damageAppliesTo: 'implement', passiveEffects: ['Magic strikes deal cold', '6 cold damage to enemies within 2 squares'] },
    },
  },
  'ether-fueled-vessel': {
    slot: 'implement',
    levels: {
      '1': { damage: 1, damageAppliesTo: 'implement', passiveEffects: ['Damaged creature becomes insubstantial to you (no opportunity attacks)'] },
      '5': { damage: 2, damageAppliesTo: 'implement', passiveEffects: ['Insubstantial creatures take highest characteristic damage when you move through them'] },
      '9': { damage: 3, damageAppliesTo: 'implement', passiveEffects: ['Insubstantial non-leader/solo creatures can\'t opportunity attack your allies'] },
    },
  },
  'foesense-lenses': {
    slot: 'implement',
    levels: {
      '1': { damage: 1, damageAppliesTo: 'implement', passiveEffects: ['Use damaged creature\'s senses until end of next turn'] },
      '5': { damage: 2, damageAppliesTo: 'implement', passiveEffects: ['Weakened if 20+ rolled damage while using their senses'] },
      '9': { damage: 3, damageAppliesTo: 'implement', passiveEffects: ['Dazed if 30+ rolled damage while using their senses'] },
    },
  },
  'words-become-wonders-at-next-breath': {
    slot: 'implement',
    levels: {
      '1': { rangedDistance: 3, passiveEffects: ['Edge on Reason recall tests', 'Tome floats adjacent'] },
      '5': { rangedDistance: 5, passiveEffects: ['Triggered action: grant +3 power roll bonus to magic/psionic ability'] },
      '9': { rangedDistance: 5, passiveEffects: ['Automatic tier 3 on Reason recall tests', 'Heroic ability cost reduced by 1 (min 1)'] },
    },
  },

  // === OTHER: FEET ===
  'lightning-treads': {
    slot: 'feet',
    levels: {
      '1': { speed: 2, extraDamage: 1, extraDamageType: 'lightning' },
      '5': { speed: 2, extraDamage: 2, extraDamageType: 'lightning', passiveEffects: ['+1 lightning per square moved (max +4 total)'] },
      '9': { speed: 2, extraDamage: 3, extraDamageType: 'lightning', passiveEffects: ['+1 lightning per square moved (max +6 total)', 'Flying lightning kick maneuver: push 5 squares'] },
    },
  },

  // === OTHER: HANDS ===
  'bloody-hand-wraps': {
    slot: 'hands',
    levels: {
      '1': { damage: 1, damageAppliesTo: 'unarmed', passiveEffects: ['Once per turn: take 5 damage to Grab (no action)'] },
      '5': { damage: 2, damageAppliesTo: 'unarmed', passiveEffects: ['Once per turn: take 10 damage for melee free strike (no action)'] },
      '9': { damage: 3, damageAppliesTo: 'unarmed', passiveEffects: ['Once per turn: take 15 damage to use signature ability (no action)'] },
    },
  },

  // === OTHER: RING ===
  'bloodbound-band': {
    slot: 'ring',
    levels: {
      '1': { stamina: 6, passiveEffects: ['Bond rings during respite: share highest recovery value and spend each other\'s Recoveries'] },
      '5': { stamina: 12, passiveEffects: ['Bond rings: share recoveries', 'Damage immunity 2'] },
      '9': { stamina: 21, passiveEffects: ['Bond rings: share recoveries', 'Can sacrifice yourself when bonded creature dies'] },
    },
  },

  // === OTHER: NECK ===
  'revengers-wrap': {
    slot: 'neck',
    levels: {
      '1': { passiveEffects: ['Creature who damages you marked for revenge', 'Strike deals extra damage equal to highest characteristic against marked', 'Marked creatures become bleeding'] },
      '5': { passiveEffects: ['All creatures who damage you marked for revenge', 'Bleeding (save ends)'] },
      '9': { passiveEffects: ['Single-target abilities against 3+ marked creatures target all marked'] },
    },
  },
  'thief-of-joy': {
    slot: 'neck',
    levels: {
      // Stamina bonus is characteristic-dependent, can't pre-compute — handled as passive
      '1': { passiveEffects: ['Stamina bonus: 2x highest characteristic', 'Maneuver: learn creature level, gain envy/disdain'] },
      '5': { passiveEffects: ['Stamina bonus: 3x highest characteristic', 'Can choose envy or disdain at same level'] },
      '9': { passiveEffects: ['Stamina bonus: 5x highest characteristic', 'Can have multiple instances of envy and disdain'] },
    },
  },

  // === TRINKETS (stat-granting only) ===
  'bastion-belt': {
    slot: 'other',
    levels: {
      '1': { stamina: 3, stability: 1, passiveEffects: ['Can\'t be force moved while on the ground'] },
    },
  },
  'bracers-of-strife': {
    slot: 'other',
    levels: {
      '1': { damage: 2, damageAppliesTo: 'all', passiveEffects: ['Also grants +2 damage bonus to enemies within 2 squares'] },
    },
  },
  'chocolate-of-immovability': {
    slot: 'other',
    levels: {
      '1': { stability: 10, passiveEffects: ['Consumable effect: lasts until end of encounter', 'Speed becomes 0'] },
    },
  },
  'mirage-band': {
    slot: 'ring',
    levels: {
      '1': { passiveEffects: ['Grants "Hallucination Field" ability: 5 burst within 15 squares, targets make power roll or become frightened'] },
    },
  },
  'nullfield-resonator-ring': {
    slot: 'ring',
    levels: {
      '1': { passiveEffects: ['Grants "Nullring Strike" ability: melee free strike, 2 psychic damage, blocks next magic/psionic ability'] },
    },
  },
  'stop-n-go-coin': {
    slot: 'other',
    levels: {
      '1': { passiveEffects: ['Flip coin: heads = +1 speed, tails = -1 speed'] },
    },
  },
};

// ---------------------------------------------------------------------------
// Level tier resolution
// ---------------------------------------------------------------------------

/**
 * Determine which level tier a treasure is active at based on character level.
 * Leveled treasures have tiers at 1, 5, and 9.
 * Trinkets and artifacts always use tier "1".
 */
export function getTreasureLevelTier(characterLevel: number): string {
  if (characterLevel >= 9) return '9';
  if (characterLevel >= 5) return '5';
  return '1';
}

// ---------------------------------------------------------------------------
// Effect lookup
// ---------------------------------------------------------------------------

export function getTreasureEffects(treasureId: string): TreasureEffectEntry | null {
  return TREASURE_EFFECTS[treasureId] ?? null;
}

export function getTreasureEffectAtLevel(
  treasureId: string,
  characterLevel: number,
): TreasureLevelEffect | null {
  const entry = TREASURE_EFFECTS[treasureId];
  if (!entry) return null;

  const tier = getTreasureLevelTier(characterLevel);
  // Fall back to lower tiers if current tier doesn't exist
  return entry.levels[tier] ?? entry.levels['5'] ?? entry.levels['1'] ?? null;
}

// ---------------------------------------------------------------------------
// Slot conflict detection
// ---------------------------------------------------------------------------

const EXCLUSIVE_SLOTS = new Set(['armor', 'shield', 'weapon', 'implement', 'hands', 'feet', 'neck']);

/**
 * Returns the treasure IDs that would conflict with equipping a given treasure.
 * Armor is exclusive (one at a time). Shields stack with armor.
 * Weapons/implements/hands/feet/neck are one at a time.
 * Rings and "other" have no exclusion.
 */
export function getConflictingItems(
  treasureId: string,
  equippedItems: InventoryItem[],
): string[] {
  const entry = TREASURE_EFFECTS[treasureId];
  if (!entry) return [];

  const slot = entry.slot;
  if (!EXCLUSIVE_SLOTS.has(slot)) return [];

  return equippedItems
    .filter((item) => {
      if (!item.isEquipped || !item.treasureId) return false;
      const otherEntry = TREASURE_EFFECTS[item.treasureId];
      if (!otherEntry) return false;
      return otherEntry.slot === slot;
    })
    .map((item) => item.id);
}

// ---------------------------------------------------------------------------
// Aggregate bonus computation
// ---------------------------------------------------------------------------

/**
 * Compute total bonuses from all equipped treasures.
 * This is the main entry point for the stat pipeline.
 */
export function computeTreasureBonuses(
  equippedItems: InventoryItem[],
  characterLevel: number,
): TreasureBonuses {
  const result: TreasureBonuses = {
    stamina: 0,
    speed: 0,
    stability: 0,
    weaponDamage: 0,
    implementDamage: 0,
    unarmedDamage: 0,
    extraDamage: [],
    meleeDistance: 0,
    rangedDistance: 0,
    passiveEffects: [],
  };

  for (const item of equippedItems) {
    if (!item.isEquipped || !item.treasureId) continue;
    // Skip consumables — they use charges, not equip
    if (item.category === 'consumable') continue;

    const effect = getTreasureEffectAtLevel(item.treasureId, characterLevel);
    if (!effect) continue;

    // Stamina
    if (effect.stamina) result.stamina += effect.stamina;

    // Speed
    if (effect.speed) result.speed += effect.speed;

    // Stability
    if (effect.stability) result.stability += effect.stability;

    // Damage bonuses (by type)
    if (effect.damage) {
      const appliesTo = effect.damageAppliesTo ?? 'all';
      if (appliesTo === 'weapon') result.weaponDamage += effect.damage;
      else if (appliesTo === 'implement') result.implementDamage += effect.damage;
      else if (appliesTo === 'unarmed') result.unarmedDamage += effect.damage;
      else {
        result.weaponDamage += effect.damage;
        result.implementDamage += effect.damage;
        result.unarmedDamage += effect.damage;
      }
    }

    // Extra typed damage
    if (effect.extraDamage && effect.extraDamageType) {
      result.extraDamage.push({
        value: effect.extraDamage,
        type: effect.extraDamageType,
        source: item.name,
      });
    }

    // Distance bonuses
    if (effect.meleeDistance) result.meleeDistance += effect.meleeDistance;
    if (effect.rangedDistance) result.rangedDistance += effect.rangedDistance;

    // Passive effects
    if (effect.passiveEffects && effect.passiveEffects.length > 0) {
      result.passiveEffects.push({
        source: item.name,
        effects: effect.passiveEffects,
      });
    }
  }

  return result;
}
