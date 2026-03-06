// ============================================================
// DATA STRUCTURES for the enhanced character model system
// Ported from New Armor - Models - Enhanced.html
// ============================================================

// --- Tier Progression ---
export interface Tier {
  name: string;
  levels: [number, number];
  color: string;
  accent: string;
  glow: string;
  runes: boolean;
  wings: boolean;
  particles: boolean;
}

export const TIERS: Tier[] = [
  { name: 'Tier I \u2014 Initiate',   levels: [1, 2],  color: '#909090', accent: '#c0c0c0', glow: 'rgba(192,192,192,0.4)', runes: false, wings: false, particles: false },
  { name: 'Tier II \u2014 Adept',     levels: [3, 4],  color: '#6aaa6a', accent: '#8fdd8f', glow: 'rgba(100,180,100,0.4)', runes: false, wings: false, particles: false },
  { name: 'Tier III \u2014 Champion', levels: [5, 6],  color: '#c9a84c', accent: '#f0d07a', glow: 'rgba(201,168,76,0.5)',  runes: true,  wings: false, particles: false },
  { name: 'Tier IV \u2014 Legend',    levels: [7, 8],  color: '#ff6a00', accent: '#ffa040', glow: 'rgba(255,106,0,0.5)',   runes: true,  wings: true,  particles: false },
  { name: 'Tier V \u2014 Mythic',     levels: [9, 10], color: '#cc44ff', accent: '#ee88ff', glow: 'rgba(200,80,255,0.6)',  runes: true,  wings: true,  particles: true  },
];

export function getTier(level: number): Tier {
  return TIERS[Math.floor((level - 1) / 2)];
}

// --- Weapon Types ---
export interface WeaponEntry {
  id: string;
  name: string;
}

export interface WeaponCategory {
  label: string;
  weapons: WeaponEntry[];
}

export const WEAPON_TYPES: Record<string, WeaponCategory> = {
  bow: { label: 'Bow', weapons: [
    { id: 'longbow', name: 'Longbow' }, { id: 'shortbow', name: 'Shortbow' }, { id: 'crossbow', name: 'Crossbow' }, { id: 'sling', name: 'Sling' }, { id: 'atlatl', name: 'Atlatl' },
  ]},
  light: { label: 'Light', weapons: [
    { id: 'dagger', name: 'Dagger' }, { id: 'shortsword', name: 'Shortsword' }, { id: 'rapier', name: 'Rapier' }, { id: 'handaxe', name: 'Handaxe' }, { id: 'throwing_hammer', name: 'Throwing Hammer' },
  ]},
  medium: { label: 'Medium', weapons: [
    { id: 'longsword', name: 'Longsword' }, { id: 'battleaxe', name: 'Battleaxe' }, { id: 'warhammer', name: 'Warhammer' }, { id: 'club', name: 'Club' },
  ]},
  heavy: { label: 'Heavy', weapons: [
    { id: 'greatsword', name: 'Greatsword' }, { id: 'greataxe', name: 'Greataxe' }, { id: 'maul', name: 'Maul' }, { id: 'morningstar', name: 'Morningstar' },
  ]},
  polearm: { label: 'Polearm', weapons: [
    { id: 'glaive', name: 'Glaive' }, { id: 'halberd', name: 'Halberd' }, { id: 'longspear', name: 'Longspear' }, { id: 'quarterstaff', name: 'Quarterstaff' },
  ]},
  whip: { label: 'Whip', weapons: [
    { id: 'whip', name: 'Whip' }, { id: 'spiked_chain', name: 'Spiked Chain' }, { id: 'flail', name: 'Flail' },
  ]},
  ensnaring: { label: 'Ensnaring', weapons: [
    { id: 'bolas', name: 'Bolas' }, { id: 'net', name: 'Net' },
  ]},
};

// --- Kit Weapon Mapping ---
export const KIT_WEAPON_MAP: Record<string, string[]> = {
  bow: ['bow'],
  medium_melee: ['medium'],
  light_melee: ['light'],
  light_thrown: ['light'],
  light_divine: ['light'],
  dual: ['light', 'medium'],
  polearm: ['polearm'],
  polearm_net: ['polearm', 'ensnaring'],
  heavy_melee: ['heavy'],
  bow_melee: ['bow', 'medium'],
  medium_shield: ['medium'],
  medium_magic: ['medium'],
  whip: ['whip'],
  unarmed: [],
  unarmed_wild: [],
};

// --- Kit Definitions (armor + weapon class) ---
export interface KitDef {
  armorClass: string;
  weaponClass: string;
}

export const KITS: Record<string, KitDef> = {
  arcane_archer:  { armorClass: 'none',   weaponClass: 'bow' },
  battlemind:     { armorClass: 'light',  weaponClass: 'medium_melee' },
  cloak_dagger:   { armorClass: 'light',  weaponClass: 'light_thrown' },
  dual_wielder:   { armorClass: 'medium', weaponClass: 'dual' },
  guisarmier:     { armorClass: 'medium', weaponClass: 'polearm' },
  martial_artist: { armorClass: 'none',   weaponClass: 'unarmed' },
  mountain:       { armorClass: 'heavy',  weaponClass: 'heavy_melee' },
  panther:        { armorClass: 'none',   weaponClass: 'heavy_melee' },
  pugilist:       { armorClass: 'none',   weaponClass: 'unarmed' },
  raider:         { armorClass: 'light',  weaponClass: 'light_melee' },
  ranger:         { armorClass: 'medium', weaponClass: 'bow_melee' },
  rapid_fire:     { armorClass: 'light',  weaponClass: 'bow' },
  retiarius:      { armorClass: 'light',  weaponClass: 'polearm_net' },
  shining_armor:  { armorClass: 'heavy',  weaponClass: 'medium_shield' },
  sniper:         { armorClass: 'none',   weaponClass: 'bow' },
  spellsword:     { armorClass: 'light',  weaponClass: 'medium_magic' },
  stick_robe:     { armorClass: 'light',  weaponClass: 'polearm' },
  swashbuckler:   { armorClass: 'light',  weaponClass: 'medium_melee' },
  sword_board:    { armorClass: 'medium', weaponClass: 'medium_shield' },
  warrior_priest: { armorClass: 'heavy',  weaponClass: 'light_divine' },
  whirlwind:      { armorClass: 'none',   weaponClass: 'whip' },
  boren:          { armorClass: 'none',   weaponClass: 'unarmed' },
  corven:         { armorClass: 'none',   weaponClass: 'unarmed_wild' },
  raden:          { armorClass: 'none',   weaponClass: 'unarmed' },
  vuken:          { armorClass: 'none',   weaponClass: 'unarmed_wild' },
};

// Map from our camelCase kit IDs to the new underscore IDs
export const KIT_ID_MAP: Record<string, string> = {
  arcaneArcher: 'arcane_archer',
  battlemind: 'battlemind',
  cloakAndDagger: 'cloak_dagger',
  dualWielder: 'dual_wielder',
  guisarmier: 'guisarmier',
  martialArtist: 'martial_artist',
  mountain: 'mountain',
  panther: 'panther',
  pugilist: 'pugilist',
  raider: 'raider',
  ranger: 'ranger',
  rapidFire: 'rapid_fire',
  retiarius: 'retiarius',
  shiningArmor: 'shining_armor',
  sniper: 'sniper',
  spellsword: 'spellsword',
  stickAndRobe: 'stick_robe',
  swashbuckler: 'swashbuckler',
  swordAndBoard: 'sword_board',
  warriorPriest: 'warrior_priest',
  whirlwind: 'whirlwind',
  boren: 'boren',
  corven: 'corven',
  raden: 'raden',
  vuken: 'vuken',
};

// --- Armor Coverage ---
export interface ArmorCoverage {
  chest: boolean;
  greaves: boolean;
  pauldrons: boolean;
  helm: boolean;
  vambrace: boolean;
  shield: boolean;
}

export const ARMOR_COVERAGE: Record<string, ArmorCoverage> = {
  none:   { chest: false, greaves: false, pauldrons: false, helm: false, vambrace: false, shield: false },
  light:  { chest: true,  greaves: false, pauldrons: false, helm: false, vambrace: true,  shield: false },
  medium: { chest: true,  greaves: true,  pauldrons: true,  helm: false, vambrace: true,  shield: false },
  heavy:  { chest: true,  greaves: true,  pauldrons: true,  helm: true,  vambrace: true,  shield: false },
};

// --- Hand Positions ---
export interface HandPos {
  rx: number;
  ry: number;
  lx: number;
  ly: number;
}

export const HAND_POS: Record<string, HandPos> = {
  devil:        { rx: 97,  ry: 147, lx: 23,  ly: 147 },
  dwarf:        { rx: 97,  ry: 126, lx: 13,  ly: 126 },
  human:        { rx: 87,  ry: 124, lx: 23,  ly: 124 },
  highelf:      { rx: 87,  ry: 124, lx: 23,  ly: 124 },
  orc:          { rx: 89,  ry: 127, lx: 25,  ly: 127 },
  wodeelf:      { rx: 87,  ry: 124, lx: 23,  ly: 124 },
  memonek:      { rx: 95,  ry: 128, lx: 11,  ly: 128 },
  dragonknight: { rx: 102, ry: 134, lx: 14,  ly: 134 },
  polder:       { rx: 77,  ry: 106, lx: 13,  ly: 106 },
  revenant:     { rx: 94,  ry: 126, lx: 14,  ly: 126 },
  hakaan:       { rx: 115, ry: 150, lx: 15,  ly: 150 },
  timeraider:   { rx: 113, ry: 130, lx: 13,  ly: 130 },
};

// Map from camelCase ancestry IDs used in the app to the lowercase IDs used by the model system
export const ANCESTRY_ID_MAP: Record<string, string> = {
  devil: 'devil',
  dragonKnight: 'dragonknight',
  dwarf: 'dwarf',
  hakaan: 'hakaan',
  highElf: 'highelf',
  human: 'human',
  memonek: 'memonek',
  orc: 'orc',
  polder: 'polder',
  revenant: 'revenant',
  timeRaider: 'timeraider',
  wodeElf: 'wodeelf',
};

// --- Ancestry Defaults ---
export interface AncestryDefaults {
  skin: string;
  armor: string;
  accent: string;
  gem: string;
}

export const ANCESTRY_DEFAULTS: Record<string, AncestryDefaults> = {
  devil:        { skin: '#c0392b', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
  dragonknight: { skin: '#1565c0', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
  dwarf:        { skin: '#8d6e63', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
  hakaan:       { skin: '#c8a078', armor: '#909090', accent: '#c0c0c0', gem: '#800080' },
  highelf:      { skin: '#e8d5c0', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
  human:        { skin: '#c8a080', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
  memonek:      { skin: '#4fc3f7', armor: '#909090', accent: '#c0c0c0', gem: '#0288d1' },
  orc:          { skin: '#6d8c40', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
  polder:       { skin: '#a1887f', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
  revenant:     { skin: '#37474f', armor: '#909090', accent: '#c0c0c0', gem: '#7fffd4' },
  timeraider:   { skin: '#ff8f00', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
  wodeelf:      { skin: '#66bb6a', armor: '#909090', accent: '#c0c0c0', gem: '#c0c0c0' },
};

// --- Color Resolution ---
export interface ColorOverride {
  skin?: string | null;
  armor?: string | null;
  accent?: string | null;
  gem?: string | null;
}

export interface ResolvedColors {
  skin: string;
  armor: string;
  accent: string;
  gem: string;
  glow: string;
}

function hexToGlow(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.5)`;
}

export function resolveColors(tier: Tier, isRev: boolean, ancestryId: string, colorOverride?: ColorOverride): ResolvedColors {
  const d = ANCESTRY_DEFAULTS[ancestryId] || ANCESTRY_DEFAULTS.human;
  if (isRev) {
    return {
      skin: '#1e3030',
      armor: '#0d1e18',
      accent: '#7fffd4',
      gem: '#7fffd4',
      glow: 'rgba(127,255,212,0.5)',
    };
  }
  return {
    skin: colorOverride?.skin || d.skin,
    armor: colorOverride?.armor || tier.color,
    accent: colorOverride?.accent || tier.accent,
    gem: colorOverride?.gem || d.gem || tier.accent,
    glow: colorOverride?.armor ? hexToGlow(colorOverride.armor) : tier.glow,
  };
}

// --- Available weapons for a kit ---
export function getAvailableWeapons(kitId: string): WeaponEntry[] {
  const mappedKit = KIT_ID_MAP[kitId] || kitId;
  const kit = KITS[mappedKit];
  if (!kit) return [];
  const weaponCategories = KIT_WEAPON_MAP[kit.weaponClass] || [];
  const weapons: WeaponEntry[] = [];
  for (const cat of weaponCategories) {
    const wt = WEAPON_TYPES[cat];
    if (wt) weapons.push(...wt.weapons);
  }
  return weapons;
}

export function getKitArmorClass(kitId: string): string {
  const mappedKit = KIT_ID_MAP[kitId] || kitId;
  const kit = KITS[mappedKit];
  return kit?.armorClass || 'none';
}

// --- SVG Dimensions per ancestry ---
export const ANCESTRY_DIMENSIONS: Record<string, { w: number; h: number }> = {
  devil:        { w: 120, h: 200 },
  dragonknight: { w: 116, h: 206 },
  dwarf:        { w: 110, h: 185 },
  hakaan:       { w: 130, h: 220 },
  highelf:      { w: 110, h: 200 },
  human:        { w: 110, h: 200 },
  memonek:      { w: 108, h: 196 },
  orc:          { w: 114, h: 206 },
  polder:       { w:  90, h: 165 },
  revenant:     { w: 108, h: 198 },
  timeraider:   { w: 126, h: 210 },
  wodeelf:      { w: 110, h: 200 },
};
