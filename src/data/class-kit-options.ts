/**
 * Kit-replacement options for classes that don't use standard kits.
 * Conduit (Prayers), Elementalist (Enchantments), Null (Augmentations), Talent (Augmentations)
 *
 * Each option provides stat bonuses similar to kits.
 * Stamina bonuses with `staminaPerEchelon` scale: bonus = staminaPerEchelon * echelon
 */

export interface ClassKitOption {
  id: string;
  name: string;
  description: string;
  stamina: number | null;          // flat stamina bonus (non-scaling)
  staminaPerEchelon: number | null; // stamina that scales: value * echelon
  speed: number | null;
  stability: number | null;
  disengage: number | null;
  damage: number | null;           // flat damage bonus to specific ability type
  distance: number | null;         // ranged ability distance bonus
  damageNote: string | null;       // what the damage bonus applies to
  distanceNote: string | null;     // what the distance bonus applies to
  equipmentNote: string | null;    // armor/weapon info if applicable
}

export interface ClassKitSystem {
  classId: string;
  systemName: string;             // "Prayer", "Enchantment", "Augmentation"
  description: string;
  options: ClassKitOption[];
}

export const CLASS_KIT_SYSTEMS: Record<string, ClassKitSystem> = {
  conduit: {
    classId: 'conduit',
    systemName: 'Prayer',
    description: 'Your god grants you a blessing that shapes your divine power. Choose one prayer. You can change your prayer during a respite.',
    options: [
      {
        id: 'prayer-of-speed',
        name: 'Prayer of Speed',
        description: 'Your god blesses your flesh and infuses it with divine quickness. You gain a +1 bonus to speed and to the distance you can shift when you take the Disengage move action.',
        stamina: null,
        staminaPerEchelon: null,
        speed: 1,
        stability: null,
        disengage: 1,
        damage: null,
        distance: null,
        damageNote: null,
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'prayer-of-destruction',
        name: 'Prayer of Destruction',
        description: 'Your god infuses wrath within your being. You gain a +1 bonus to rolled damage with magic abilities.',
        stamina: null,
        staminaPerEchelon: null,
        speed: null,
        stability: null,
        disengage: null,
        damage: 1,
        distance: null,
        damageNote: 'magic abilities',
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'prayer-of-distance',
        name: 'Prayer of Distance',
        description: 'Your god blesses you with the ability to stretch your divine magic farther. You have a +2 bonus to the distance of your ranged magic abilities.',
        stamina: null,
        staminaPerEchelon: null,
        speed: null,
        stability: null,
        disengage: null,
        damage: null,
        distance: 2,
        damageNote: null,
        distanceNote: 'ranged magic abilities',
        equipmentNote: null,
      },
      {
        id: 'prayer-of-soldiers-skill',
        name: "Prayer of Soldier's Skill",
        description: "Your god gives your mind the training of a soldier. You can wear light armor and wield light weapons effectively. While you wear light armor, you gain a Stamina bonus that scales with echelon. While you wield a light weapon, you gain a +1 damage bonus with weapon abilities, including free strikes.",
        stamina: null,
        staminaPerEchelon: 3,
        speed: null,
        stability: null,
        disengage: null,
        damage: 1,
        distance: null,
        damageNote: 'light weapon abilities',
        distanceNote: null,
        equipmentNote: 'Light armor + light weapons',
      },
      {
        id: 'prayer-of-steel',
        name: 'Prayer of Steel',
        description: 'Your god fills your body with the light of creation, making you harder to hurt and move. You gain a Stamina bonus that scales with echelon. Additionally, you gain a +1 bonus to stability.',
        stamina: null,
        staminaPerEchelon: 6,
        speed: null,
        stability: 1,
        disengage: null,
        damage: null,
        distance: null,
        damageNote: null,
        distanceNote: null,
        equipmentNote: null,
      },
    ],
  },

  elementalist: {
    classId: 'elementalist',
    systemName: 'Enchantment',
    description: 'You weave elemental magic into your own being. Choose one enchantment. You can change your enchantment during a respite.',
    options: [
      {
        id: 'enchantment-of-celerity',
        name: 'Enchantment of Celerity',
        description: 'You gain a +1 bonus to speed and to the distance you can shift when you take the Disengage move action.',
        stamina: null,
        staminaPerEchelon: null,
        speed: 1,
        stability: null,
        disengage: 1,
        damage: null,
        distance: null,
        damageNote: null,
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'enchantment-of-destruction',
        name: 'Enchantment of Destruction',
        description: 'You gain a +1 bonus to rolled damage with magic abilities.',
        stamina: null,
        staminaPerEchelon: null,
        speed: null,
        stability: null,
        disengage: null,
        damage: 1,
        distance: null,
        damageNote: 'magic abilities',
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'enchantment-of-distance',
        name: 'Enchantment of Distance',
        description: 'You have a +2 bonus to the distance of your ranged magic abilities.',
        stamina: null,
        staminaPerEchelon: null,
        speed: null,
        stability: null,
        disengage: null,
        damage: null,
        distance: 2,
        damageNote: null,
        distanceNote: 'ranged magic abilities',
        equipmentNote: null,
      },
      {
        id: 'enchantment-of-battle',
        name: 'Enchantment of Battle',
        description: 'You can wear light armor and wield light weapons effectively. While you wear light armor, you gain a Stamina bonus that scales with echelon. While you wield a light weapon, you gain a +1 damage bonus with weapon abilities, including free strikes.',
        stamina: null,
        staminaPerEchelon: 3,
        speed: null,
        stability: null,
        disengage: null,
        damage: 1,
        distance: null,
        damageNote: 'light weapon abilities',
        distanceNote: null,
        equipmentNote: 'Light armor + light weapons',
      },
      {
        id: 'enchantment-of-permanence',
        name: 'Enchantment of Permanence',
        description: 'You gain a Stamina bonus that scales with echelon. Additionally, you gain a +1 bonus to stability.',
        stamina: null,
        staminaPerEchelon: 6,
        speed: null,
        stability: 1,
        disengage: null,
        damage: null,
        distance: null,
        damageNote: null,
        distanceNote: null,
        equipmentNote: null,
      },
    ],
  },

  null: {
    classId: 'null',
    systemName: 'Augmentation',
    description: 'You enhance your body with psionic power. Choose one augmentation. You can change your augmentation during a respite.',
    options: [
      {
        id: 'speed-augmentation',
        name: 'Speed Augmentation',
        description: 'You gain a +1 bonus to speed and to the distance you can shift when you take the Disengage move action.',
        stamina: null,
        staminaPerEchelon: null,
        speed: 1,
        stability: null,
        disengage: 1,
        damage: null,
        distance: null,
        damageNote: null,
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'force-augmentation',
        name: 'Force Augmentation',
        description: 'Your damage-dealing psionic abilities gain a +1 bonus to rolled damage.',
        stamina: null,
        staminaPerEchelon: null,
        speed: null,
        stability: null,
        disengage: null,
        damage: 1,
        distance: null,
        damageNote: 'psionic abilities',
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'density-augmentation',
        name: 'Density Augmentation',
        description: 'You gain a Stamina bonus that scales with echelon. Additionally, you gain a +1 bonus to stability.',
        stamina: null,
        staminaPerEchelon: 6,
        speed: null,
        stability: 1,
        disengage: null,
        damage: null,
        distance: null,
        damageNote: null,
        distanceNote: null,
        equipmentNote: null,
      },
    ],
  },

  talent: {
    classId: 'talent',
    systemName: 'Augmentation',
    description: 'You enhance your mind and body with psionic power. Choose one augmentation. You can change your augmentation during a respite.',
    options: [
      {
        id: 'talent-speed-augmentation',
        name: 'Speed Augmentation',
        description: 'You gain a +1 bonus to speed and to the distance you can shift when you take the Disengage move action.',
        stamina: null,
        staminaPerEchelon: null,
        speed: 1,
        stability: null,
        disengage: 1,
        damage: null,
        distance: null,
        damageNote: null,
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'talent-distance-augmentation',
        name: 'Distance Augmentation',
        description: 'Your ranged psionic abilities gain a +2 bonus to distance.',
        stamina: null,
        staminaPerEchelon: null,
        speed: null,
        stability: null,
        disengage: null,
        damage: null,
        distance: 2,
        damageNote: null,
        distanceNote: 'ranged psionic abilities',
        equipmentNote: null,
      },
      {
        id: 'talent-force-augmentation',
        name: 'Force Augmentation',
        description: 'Your damage-dealing psionic abilities gain a +1 bonus to rolled damage.',
        stamina: null,
        staminaPerEchelon: null,
        speed: null,
        stability: null,
        disengage: null,
        damage: 1,
        distance: null,
        damageNote: 'psionic abilities',
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'talent-density-augmentation',
        name: 'Density Augmentation',
        description: 'You gain a Stamina bonus that scales with echelon. Additionally, you gain a +1 bonus to stability.',
        stamina: null,
        staminaPerEchelon: 6,
        speed: null,
        stability: 1,
        disengage: null,
        damage: null,
        distance: null,
        damageNote: null,
        distanceNote: null,
        equipmentNote: null,
      },
      {
        id: 'talent-battle-augmentation',
        name: 'Battle Augmentation',
        description: 'You can wear light armor and wield light weapons effectively. While you wear light armor, you gain a Stamina bonus that scales with echelon. While you wield a light weapon, you gain a +1 damage bonus with weapon abilities, including free strikes.',
        stamina: null,
        staminaPerEchelon: 3,
        speed: null,
        stability: null,
        disengage: null,
        damage: 1,
        distance: null,
        damageNote: 'light weapon abilities',
        distanceNote: null,
        equipmentNote: 'Light armor + light weapons',
      },
    ],
  },
};

/**
 * Look up kit-replacement bonuses for stat calculations.
 * Returns stamina/speed/stability in the same shape as getKitBonuses().
 */
export function getClassKitOptionBonuses(
  classId: string,
  optionId: string,
): { stamina: number | null; speed: number | null; stability: number | null } {
  const system = CLASS_KIT_SYSTEMS[classId];
  if (!system) return { stamina: null, speed: null, stability: null };

  const option = system.options.find((o) => o.id === optionId);
  if (!option) return { stamina: null, speed: null, stability: null };

  // staminaPerEchelon is the base that gets multiplied by echelon in stat-calculator
  // We return it in the same `stamina` slot since the stat calculator already multiplies by echelon
  const staminaBonus = option.staminaPerEchelon ?? option.stamina;

  return {
    stamina: staminaBonus,
    speed: option.speed,
    stability: option.stability,
  };
}
