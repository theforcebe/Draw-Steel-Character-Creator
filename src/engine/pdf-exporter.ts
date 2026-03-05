import { PDFDocument, PDFTextField, PDFName, PDFString, StandardFonts } from 'pdf-lib';
import type { PDFForm } from 'pdf-lib';
import type { CharacterData } from '../types/character';
import { computeAllStats } from './stat-calculator';
import { getCharacterSkills } from './skill-mapper';
import { getComplicationStatBonuses } from './complication-stats';
import abilitiesData from '../data/abilities.json';
import kitsData from '../data/kits.json';
import complicationsData from '../data/complications.json';
import perksData from '../data/perks.json';
import ancestriesData from '../data/ancestries.json';
import careersData from '../data/careers.json';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeSetText(form: PDFForm, name: string, value: string) {
  try {
    form.getTextField(name).setText(value);
  } catch {
    /* field not found in template */
  }
}

function safeCheck(form: PDFForm, name: string) {
  try {
    form.getCheckBox(name).check();
  } catch {
    /* field not found in template */
  }
}

function safeSelectRadio(form: PDFForm, name: string, value: string) {
  try {
    form.getRadioGroup(name).select(value);
  } catch {
    /* field or option not found */
  }
}

/**
 * Prepare all text fields for filling:
 * 1. Disable rich text formatting (prevents crashes)
 * 2. Override Default Appearance to use /Helvetica at an appropriate size
 *    (the template uses BerlingskeSlab which pdf-lib can't render)
 * 3. Clear existing values
 */
function prepareAllFields(form: PDFForm) {
  for (const field of form.getFields()) {
    if (!(field instanceof PDFTextField)) continue;

    try { field.disableRichFormatting(); } catch { /* ignore */ }

    // Measure field widget dimensions
    let fh = 15;
    let fw = 100;
    try {
      const rect = field.acroField.getWidgets()[0].getRectangle();
      fh = Math.abs(rect.height);
      fw = Math.abs(rect.width);
    } catch { /* ignore */ }

    // Pick font size that fits the field
    let sz: number;
    if (fh > 50) sz = 7;        // multiline text boxes
    else if (fh <= 12) sz = 6;
    else if (fh <= 14) sz = 7;
    else if (fh <= 16) sz = 8;
    else if (fh <= 22) sz = 10;
    else if (fh <= 30) sz = 14;
    else sz = 8;

    // Narrow fields need smaller font to fit content
    if (fw <= 18 && sz > 6) sz = 6;
    else if (fw <= 30 && sz > 10) sz = 10;

    // Force DA to Helvetica (must happen BEFORE updateFieldAppearances)
    field.acroField.dict.set(
      PDFName.of('DA'),
      PDFString.of(`/Helvetica ${sz} Tf 0 g`),
    );

    try { field.setText(''); } catch { /* ignore */ }
  }
}

function formatId(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// Ability data lookup
// ---------------------------------------------------------------------------

interface AbilityEntry {
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
  effect?: string | null;
}

interface ClassAbilities {
  resource: string;
  primary_characteristics: string[];
  signature_abilities: AbilityEntry[];
  heroic_abilities: AbilityEntry[];
}

const classAbilities = abilitiesData.classes as Record<string, ClassAbilities>;

function findAbility(classId: string, abilityName: string): AbilityEntry | null {
  const classData = classAbilities[classId];
  if (!classData) return null;
  const allAbilities = [...classData.signature_abilities, ...classData.heroic_abilities];
  return allAbilities.find((a) => a.name === abilityName) ?? null;
}

// ---------------------------------------------------------------------------
// Kit data lookup
// ---------------------------------------------------------------------------

interface KitData {
  name?: string;
  bonuses?: {
    stamina?: number | null;
    speed?: number | null;
    stability?: number | null;
    meleeDamage?: number[] | null;
    rangedDamage?: number[] | null;
    meleeDistance?: number | null;
    rangedDistance?: number | null;
    disengage?: number | null;
  };
  equipment?: {
    armor?: string;
    weapons?: string[];
  };
}

function getKit(kitId: string): KitData | null {
  const standardKits = kitsData.standardKits as Record<string, KitData>;
  const stormwightKits = kitsData.stormwightKits as Record<string, KitData>;
  return standardKits[kitId] ?? stormwightKits[kitId] ?? null;
}

// ---------------------------------------------------------------------------
// Complication lookup
// ---------------------------------------------------------------------------

interface ComplicationEntry {
  name: string;
  benefit: string;
  drawback: string;
}

const complicationsList = complicationsData.complications as ComplicationEntry[];

function findComplication(name: string): ComplicationEntry | null {
  return complicationsList.find((c) => c.name === name) ?? null;
}

// ---------------------------------------------------------------------------
// Perk lookup
// ---------------------------------------------------------------------------

interface PerkEntry {
  name: string;
  type: string;
  description: string;
}

const allPerks: PerkEntry[] = [];
for (const group of Object.values(perksData.perks as Record<string, PerkEntry[]>)) {
  allPerks.push(...group);
}

function findPerk(name: string): PerkEntry | null {
  return allPerks.find((p) => p.name === name) ?? null;
}

// ---------------------------------------------------------------------------
// Ancestry trait lookup
// ---------------------------------------------------------------------------

interface AncestryTrait {
  name: string;
  cost: number;
  description?: string;
}

function getAncestryTraitDescriptions(ancestryId: string, traitNames: string[]): string {
  const ancestries = ancestriesData.ancestries as unknown as Record<string, { purchasedTraits?: AncestryTrait[]; signatureTraits?: AncestryTrait[] }>;
  const ancestry = ancestries[ancestryId];
  if (!ancestry) return traitNames.join(', ');

  const allTraits = [...(ancestry.signatureTraits ?? []), ...(ancestry.purchasedTraits ?? [])];
  const lines: string[] = [];
  for (const name of traitNames) {
    const trait = allTraits.find((t) => t.name === name);
    if (trait?.description) {
      lines.push(`${trait.name}: ${trait.description}`);
    } else {
      lines.push(name);
    }
  }
  return lines.join('\n\n');
}

// ---------------------------------------------------------------------------
// Career data lookup
// ---------------------------------------------------------------------------

interface CareerDataEntry {
  name: string;
  description: string;
  wealth: number;
  renown: number;
  projectPoints: number;
}

const careersMap = careersData.careers as Record<string, CareerDataEntry>;

function getCareerData(careerId: string): CareerDataEntry | null {
  return careersMap[careerId] ?? null;
}

// ---------------------------------------------------------------------------
// Potency
// ---------------------------------------------------------------------------

function computePotency(character: CharacterData): { strong: number; average: number; weak: number } {
  const chars = character.classChoice?.characteristics;
  if (!chars) return { strong: 0, average: 0, weak: 0 };
  const highest = Math.max(chars.might, chars.agility, chars.reason, chars.intuition, chars.presence);
  return { strong: highest, average: highest - 1, weak: highest - 2 };
}

// ---------------------------------------------------------------------------
// Selected abilities
// ---------------------------------------------------------------------------

function getSelectedAbilities(character: CharacterData): AbilityEntry[] {
  const classId = character.classChoice?.classId;
  if (!classId) return [];
  const abilities: AbilityEntry[] = [];

  if (character.classChoice?.signatureAbilityName) {
    const sig = findAbility(classId, character.classChoice.signatureAbilityName);
    if (sig) abilities.push(sig);
  }
  if (character.classChoice?.heroicAbilities) {
    for (const name of character.classChoice.heroicAbilities) {
      const heroic = findAbility(classId, name);
      if (heroic) abilities.push(heroic);
    }
  }
  return abilities;
}

// ---------------------------------------------------------------------------
// Ability type classification
// ---------------------------------------------------------------------------

function getAbilityType(ability: AbilityEntry): string {
  const cost = (ability.cost ?? '').toLowerCase();
  if (cost === 'signature') return 'Signature';
  if (cost.includes('wrath') || cost.includes('piety') || cost.includes('essence') ||
      cost.includes('ferocity') || cost.includes('discipline') || cost.includes('insight') ||
      cost.includes('focus') || cost.includes('clarity') || cost.includes('drama')) {
    return 'Heroic';
  }
  return 'Other';
}

// ---------------------------------------------------------------------------
// Fill ability grid
// ---------------------------------------------------------------------------

function fillAbilitySlot(form: PDFForm, ability: AbilityEntry, row: number, col: number) {
  const suffix = `.${row}.${col}`;
  safeSetText(form, `Ability Name${suffix}`, ability.name);
  safeSetText(form, `Ability Cost${suffix}`, ability.cost ?? '');
  safeSetText(form, `Ability Target${suffix}`, ability.target ?? '');
  safeSetText(form, `Ability Distance${suffix}`, ability.distance ?? '');
  safeSetText(form, `Ability Keywords${suffix}`, (ability.keywords ?? []).join(', '));
  safeSetText(form, `Ability Action${suffix}`, ability.type ?? '');

  const details: string[] = [];
  if (ability.power_roll) details.push(`Roll: ${ability.power_roll}`);
  if (ability.tier1) details.push(`11-: ${ability.tier1}`);
  if (ability.tier2) details.push(`12-16: ${ability.tier2}`);
  if (ability.tier3) details.push(`17+: ${ability.tier3}`);
  if (ability.effect) details.push(`Effect: ${ability.effect}`);
  safeSetText(form, `Ability Details${suffix}`, details.join('\n'));

  // Ability type radio: row 0 = "Ability Type.{col}", rows 1+ = "Ability Type{row}.{col}"
  const radioName = row === 0 ? `Ability Type.${col}` : `Ability Type${row}.${col}`;
  safeSelectRadio(form, radioName, getAbilityType(ability));
}

function fillAbilityGrid(form: PDFForm, abilities: AbilityEntry[]) {
  let index = 0;
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 6; row++) {
      if (index >= abilities.length) return;
      fillAbilitySlot(form, abilities[index], row, col);
      index++;
    }
  }
}

// ---------------------------------------------------------------------------
// Character Sheet Export
// ---------------------------------------------------------------------------

export async function exportCharacterPdf(character: CharacterData): Promise<void> {
  const templateUrl = `${import.meta.env.BASE_URL}templates/character-sheet.pdf`;
  const templateBytes = await fetch(templateUrl).then((res) => {
    if (!res.ok) throw new Error(`Failed to load PDF template: ${res.status} ${res.statusText}`);
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(templateBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const form = pdfDoc.getForm();

  // Prepare: override fonts to Helvetica + set appropriate sizes + clear values
  prepareAllFields(form);

  // --- Recompute stats ---
  const stats = computeAllStats({
    level: character.level,
    ancestryId: character.ancestryId,
    formerLifeAncestryId: character.formerLifeAncestryId,
    classId: character.classChoice?.classId ?? null,
    kitId: character.classChoice?.kitId ?? null,
    selectedTraits: character.selectedTraits,
    complicationBonuses: getComplicationStatBonuses(character.complication, character.level),
  });

  const classId = character.classChoice?.classId;
  const classData = classId ? classAbilities[classId] : null;
  const kit = character.classChoice?.kitId ? getKit(character.classChoice.kitId) : null;
  const potency = computePotency(character);

  // --- Identity ---
  safeSetText(form, 'Character Name', character.name || 'Unnamed Hero');
  safeSetText(form, 'Level', String(character.level));
  safeSetText(form, 'Ancestry', character.ancestryId ? formatId(character.ancestryId) : '');
  safeSetText(form, 'Class', classId ? formatId(classId) : '');
  safeSetText(form, 'Subclass', character.classChoice?.subclassId ? formatId(character.classChoice.subclassId) : '');
  safeSetText(form, 'Career', character.career?.careerId ? formatId(character.career.careerId) : '');

  // --- Characteristics ---
  const chars = character.classChoice?.characteristics;
  if (chars) {
    safeSetText(form, 'Might', String(chars.might));
    safeSetText(form, 'Agility', String(chars.agility));
    safeSetText(form, 'Reason', String(chars.reason));
    safeSetText(form, 'Intuition', String(chars.intuition));
    safeSetText(form, 'Presence', String(chars.presence));
  }

  // --- Computed stats ---
  if (stats) {
    safeSetText(form, 'stamina max', String(stats.stamina));
    safeSetText(form, 'winded count', String(stats.winded));
    safeSetText(form, 'recov stamina', String(stats.recoveryValue));
    safeSetText(form, 'recov max', String(stats.recoveries));
    safeSetText(form, 'Speed', String(stats.speed));
    safeSetText(form, 'Size', stats.size);
    safeSetText(form, 'Stability', String(stats.stability));
    safeSetText(form, 'dying count', String(Math.floor(stats.winded / 2)));
  }

  // --- Disengage ---
  const disengageBonus = kit?.bonuses?.disengage ?? 0;
  safeSetText(form, 'Disengage', String(1 + disengageBonus));

  // --- Potency ---
  safeSetText(form, 'Potency Strong', String(potency.strong));
  safeSetText(form, 'Potency Average', String(potency.average));
  safeSetText(form, 'Potency Weak', String(potency.weak));

  // --- Kit damage bonuses (separate tier fields) ---
  if (kit?.bonuses?.meleeDamage) {
    const md = kit.bonuses.meleeDamage;
    safeSetText(form, 'Melee Weapon Damage T1', md[0] != null ? `+${md[0]}` : '');
    safeSetText(form, 'Melee Weapon Damage T2', md[1] != null ? `+${md[1]}` : '');
    safeSetText(form, 'Melee Weapon Damage T3', md[2] != null ? `+${md[2]}` : '');
  }
  if (kit?.bonuses?.rangedDamage) {
    const rd = kit.bonuses.rangedDamage;
    safeSetText(form, 'Ranged Weapon Damage T1', rd[0] != null ? `+${rd[0]}` : '');
    safeSetText(form, 'Ranged Weapon Damage T2', rd[1] != null ? `+${rd[1]}` : '');
    safeSetText(form, 'Ranged Weapon Damage T3', rd[2] != null ? `+${rd[2]}` : '');
  }

  // --- Equipment & Modifiers ---
  const kitName = kit?.name ?? (character.classChoice?.kitId ? formatId(character.classChoice.kitId) : '');
  const weapons = kit?.equipment?.weapons ?? [];
  const weaponLabel = weapons.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(', ');

  // Modifier Name = kit name, Weapon/Implement = weapon types from kit
  safeSetText(form, 'Modifier Name', kitName);
  safeSetText(form, 'Weapon/Implement', weaponLabel);
  safeSetText(form, 'Armor', kit?.equipment?.armor ? kit.equipment.armor.charAt(0).toUpperCase() + kit.equipment.armor.slice(1) : 'None');

  // Check the "Modifier Kit" checkbox to indicate this is a kit
  if (kit) safeCheck(form, 'Modifier Kit');

  // Modifier bonus fields
  safeSetText(form, 'Stamina Modifier', kit?.bonuses?.stamina ? `+${kit.bonuses.stamina}` : '--');
  safeSetText(form, 'Speed Modifier', kit?.bonuses?.speed ? `+${kit.bonuses.speed}` : '--');
  safeSetText(form, 'Stability Modifier', kit?.bonuses?.stability ? `+${kit.bonuses.stability}` : '--');
  safeSetText(form, 'Disengage Modifier', kit?.bonuses?.disengage ? `+${kit.bonuses.disengage}` : '--');
  safeSetText(form, 'Melee Modifier', kit?.bonuses?.meleeDistance ? `+${kit.bonuses.meleeDistance}` : '--');
  safeSetText(form, 'Ranged Modifier', kit?.bonuses?.rangedDistance ? `+${kit.bonuses.rangedDistance}` : '--');

  // Modifier Benefits: summarize what the kit provides
  if (kit) {
    const benefits: string[] = [];
    if (kit.bonuses?.stamina) benefits.push(`+${kit.bonuses.stamina} Stamina`);
    if (kit.bonuses?.speed) benefits.push(`+${kit.bonuses.speed} Speed`);
    if (kit.bonuses?.stability) benefits.push(`+${kit.bonuses.stability} Stability`);
    if (kit.bonuses?.disengage) benefits.push(`+${kit.bonuses.disengage} Disengage`);
    if (kit.bonuses?.meleeDamage) benefits.push(`Melee Dmg +${kit.bonuses.meleeDamage.join('/+')}`);
    if (kit.bonuses?.rangedDamage) benefits.push(`Ranged Dmg +${kit.bonuses.rangedDamage.join('/+')}`);
    if (kit.bonuses?.meleeDistance) benefits.push(`+${kit.bonuses.meleeDistance} Melee Distance`);
    if (kit.bonuses?.rangedDistance) benefits.push(`+${kit.bonuses.rangedDistance} Ranged Distance`);
    safeSetText(form, 'Modifier Benefits', benefits.join('\n'));
  }

  // --- Heroic Resource ---
  safeSetText(form, 'resource name', classData?.resource ?? '');

  // --- Culture ---
  if (character.culture) {
    safeSetText(form, 'Culture Environment', formatId(character.culture.environment));
    safeSetText(form, 'Culture Organization', formatId(character.culture.organization));
    safeSetText(form, 'Culture Upbringing', formatId(character.culture.upbringing));
    safeSetText(form, 'Environment Details', character.culture.environmentSkill);
    safeSetText(form, 'Organization Details', character.culture.organizationSkill);
    safeSetText(form, 'Upbringing Details', character.culture.upbringingSkill);
  }

  // --- Career ---
  if (character.career) {
    const careerData = getCareerData(character.career.careerId);
    safeSetText(form, 'Career Name', formatId(character.career.careerId));
    // Career Benefit: full perk description
    const perkInfo = character.career.perkName ? findPerk(character.career.perkName) : null;
    safeSetText(form, 'Career Benefit', perkInfo
      ? `${perkInfo.name}: ${perkInfo.description}`
      : character.career.perkName || '');
    // Career Inciting Incident: career description
    if (careerData?.description) {
      safeSetText(form, 'Career Inciting Incident', careerData.description);
    }
    // Wealth & Renown from career + complication
    const compBonuses = getComplicationStatBonuses(character.complication, character.level);
    const wealth = 1 + (careerData?.wealth ?? 0) + (compBonuses.wealth ?? 0);
    const renown = (careerData?.renown ?? 0) + (compBonuses.renown ?? 0);
    safeSetText(form, 'Wealth', String(wealth));
    safeSetText(form, 'Renown', String(renown));
  }

  // --- Languages (from all sources) ---
  const languages: string[] = ['Caelian'];
  if (character.culture?.language) languages.push(character.culture.language);
  if (character.career?.languages) languages.push(...character.career.languages.filter(Boolean));
  if (character.complication?.languages) languages.push(...character.complication.languages.filter(Boolean));
  // Remove forgotten language (Shipwrecked)
  const forgotten = character.complication?.forgottenLanguage;
  const filteredLanguages = forgotten
    ? languages.filter((l) => l !== forgotten)
    : languages;
  // Deduplicate
  const uniqueLanguages = [...new Set(filteredLanguages)];
  safeSetText(form, 'Languages', uniqueLanguages.join(', '));

  // --- Perks (name + full description) ---
  if (character.career?.perkName) {
    const perkInfo = findPerk(character.career.perkName);
    safeSetText(form, 'Perks 1', perkInfo
      ? `${perkInfo.name} (${perkInfo.type})\n${perkInfo.description}`
      : character.career.perkName);
  }

  // --- Complication (name + full benefit/drawback details) ---
  const complicationName = character.complication?.name ?? '';
  safeSetText(form, 'Complication Name', complicationName);
  if (complicationName) {
    const comp = findComplication(complicationName);
    if (comp) {
      const details: string[] = [];
      if (comp.benefit) details.push(`Benefit: ${comp.benefit}`);
      if (comp.drawback && !comp.drawback.startsWith('(')) details.push(`Drawback: ${comp.drawback}`);
      safeSetText(form, 'Complication Details', details.join('\n\n'));
    }
  }

  // --- Traits (full descriptions) ---
  if (character.ancestryId && character.selectedTraits.length > 0) {
    const traitDescriptions = getAncestryTraitDescriptions(
      character.ancestryId,
      character.selectedTraits.map((t) => t.name),
    );
    safeSetText(form, 'Traits List', traitDescriptions);
  }

  // --- Class features ---
  const classFeatures: string[] = [];
  if (classId) classFeatures.push(formatId(classId));
  if (character.classChoice?.subclassId) classFeatures.push(`Subclass: ${formatId(character.classChoice.subclassId)}`);
  if (classData?.resource) classFeatures.push(`Resource: ${classData.resource}`);
  if (classData?.primary_characteristics) {
    classFeatures.push(`Primary: ${classData.primary_characteristics.join(', ')}`);
  }
  safeSetText(form, 'Class Features 1', classFeatures.join('\n'));
  safeSetText(form, 'Class Features List', classFeatures.join('\n'));

  // --- Heroic Resource Rules ---
  if (classData?.resource) {
    safeSetText(form, 'Heroic Resource Rules 1',
      `${classData.resource}: You gain ${classData.resource} when you use abilities in combat. Spend ${classData.resource} to power heroic abilities.`);
  }

  // --- Save Value ---
  if (stats) {
    safeSetText(form, 'Save Value', String(Math.floor(stats.winded / 2)));
    // Default current values to max
    safeSetText(form, 'Current Stamina', String(stats.stamina));
    safeSetText(form, 'Recoveries', String(stats.recoveries));
  }

  // --- Resource / Surges / XP defaults ---
  safeSetText(form, 'Resource Count', '0');
  safeSetText(form, 'Surges', '0');
  safeSetText(form, 'XP', '0');

  // --- Skill checkboxes ---
  const skills = getCharacterSkills(character);
  for (const skill of skills) {
    safeCheck(form, skill);
  }

  // --- Ability grid (6 rows x 3 cols = 18 slots) ---
  const abilities = getSelectedAbilities(character);
  fillAbilityGrid(form, abilities);

  // --- Main Actions / Maneuvers / Triggered Actions lists ---
  const mainActions: string[] = [];
  const maneuverLines: string[] = [];
  const triggeredLines: string[] = [];

  // Categorize character abilities with descriptions
  for (const ability of abilities) {
    const actionType = (ability.type ?? '').toLowerCase();
    // Build a compact description
    const parts: string[] = [`${ability.name} (${ability.cost ?? ''})`];
    if (ability.distance && ability.distance !== '--') parts[0] += ` - ${ability.distance}`;
    if (ability.effect) parts.push(`  ${ability.effect}`);

    if (actionType.includes('maneuver') && !actionType.includes('free')) {
      maneuverLines.push(parts.join('\n'));
    } else if (actionType.includes('triggered') || actionType.includes('free triggered')) {
      triggeredLines.push(parts.join('\n'));
    } else {
      mainActions.push(parts.join('\n'));
    }
  }

  // Standard actions everyone has
  mainActions.push('Free Strike - Basic attack (melee or ranged)');
  mainActions.push('Charge - Move up to speed, then free strike');
  mainActions.push('Catch Breath - Spend a recovery to regain stamina');

  // Maneuvers preamble + standard maneuvers
  const maneuverIntro = 'A maneuver is a minor action you can take on your turn in addition to your main action.';
  const standardManeuvers = [
    'Disengage - Shift up to your disengage value',
    'Drink Potion - Consume a potion you have',
    'Knockback - Push an adjacent creature 1 square',
    'Grab - Grab an adjacent creature (resist with MGT/AGL)',
    'Hide - Attempt to become hidden from enemies',
    'Make or Assist a Test - Use a skill or help an ally',
  ];

  // Triggered actions: class-specific abilities first, then standard
  // Look up ALL class abilities that are triggered (not just selected ones)
  if (classId && classData) {
    const allClassAbilities = [...classData.signature_abilities, ...classData.heroic_abilities];
    for (const ab of allClassAbilities) {
      const t = (ab.type ?? '').toLowerCase();
      if ((t.includes('triggered') || t.includes('free triggered')) && !triggeredLines.some((l) => l.startsWith(ab.name))) {
        const parts: string[] = [`${ab.name} (${ab.cost})`];
        if (ab.distance && ab.distance !== '--') parts[0] += ` - ${ab.distance}`;
        if (ab.effect) parts.push(`  ${ab.effect}`);
        triggeredLines.push(parts.join('\n'));
      }
    }
  }
  triggeredLines.push('Opportunity Attack - Free strike when enemy leaves adjacent square without shifting');

  safeSetText(form, 'Main Actions List', mainActions.join('\n'));
  safeSetText(form, 'Maneuvers List', maneuverIntro + '\n\n' + [...maneuverLines, ...standardManeuvers].join('\n'));
  safeSetText(form, 'Triggered Actions List', triggeredLines.join('\n'));

  // --- Render all field appearances with Helvetica ---
  form.updateFieldAppearances(helvetica);

  // --- Save and download ---
  const pdfBytes = await pdfDoc.save();
  triggerDownload(pdfBytes, `${character.name || 'character'}-character-sheet.pdf`);
}

// ---------------------------------------------------------------------------
// Ability Cards Export
// ---------------------------------------------------------------------------

export async function exportAbilityCardsPdf(character: CharacterData): Promise<void> {
  const templateUrl = `${import.meta.env.BASE_URL}templates/ability-cards.pdf`;
  const templateBytes = await fetch(templateUrl).then((res) => {
    if (!res.ok) throw new Error(`Failed to load ability cards template: ${res.status} ${res.statusText}`);
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(templateBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const form = pdfDoc.getForm();
  prepareAllFields(form);

  const abilities = getSelectedAbilities(character);
  fillAbilityGrid(form, abilities);

  form.updateFieldAppearances(helvetica);

  const pdfBytes = await pdfDoc.save();
  triggerDownload(pdfBytes, `${character.name || 'character'}-ability-cards.pdf`);
}

// ---------------------------------------------------------------------------
// Browser download helper
// ---------------------------------------------------------------------------

function triggerDownload(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
