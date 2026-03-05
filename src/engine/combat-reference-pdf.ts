import { PDFDocument, StandardFonts, rgb, degrees, PDFPage, PDFFont } from 'pdf-lib';

// ---------------------------------------------------------------------------
// Elegant black & white palette — printer-friendly, zero ink waste
// ---------------------------------------------------------------------------

const C = {
  black: rgb(0.08, 0.08, 0.08),
  dark: rgb(0.2, 0.2, 0.2),
  mid: rgb(0.4, 0.4, 0.4),
  light: rgb(0.62, 0.62, 0.62),
  rule: rgb(0.3, 0.3, 0.3),
  faintRule: rgb(0.75, 0.75, 0.75),
  headerBg: rgb(0.12, 0.12, 0.12),
  white: rgb(1, 1, 1),
};

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 40;
const COL_GAP = 20;

// ---------------------------------------------------------------------------
// Low-level drawing
// ---------------------------------------------------------------------------

function hLine(page: PDFPage, x: number, y: number, w: number, thickness = 0.5, color = C.rule) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness, color });
}

function dottedLine(page: PDFPage, x: number, y: number, w: number) {
  const dot = 1.5;
  const gap = 3;
  let cx = x;
  while (cx < x + w) {
    page.drawLine({ start: { x: cx, y }, end: { x: Math.min(cx + dot, x + w), y }, thickness: 0.4, color: C.faintRule });
    cx += dot + gap;
  }
}

function drawRect(page: PDFPage, x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

function drawBorderRect(page: PDFPage, x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>, thickness = 0.75) {
  page.drawRectangle({ x, y, width: w, height: h, borderColor: color, borderWidth: thickness, opacity: 0 });
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

interface Style {
  font: PDFFont;
  size: number;
  color: ReturnType<typeof rgb>;
  lineHeight?: number;
}

function text(page: PDFPage, s: string, x: number, y: number, st: Style) {
  page.drawText(s, { x, y, font: st.font, size: st.size, color: st.color });
}

function textCenter(page: PDFPage, s: string, y: number, st: Style, cx = PAGE_W / 2) {
  const w = st.font.widthOfTextAtSize(s, st.size);
  text(page, s, cx - w / 2, y, st);
}

/** Wrap text into a region. Returns Y after last line. */
function wrap(page: PDFPage, s: string, x: number, y: number, maxW: number, st: Style): number {
  const lh = st.lineHeight ?? st.size * 1.4;
  const words = s.split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (st.font.widthOfTextAtSize(test, st.size) > maxW && line) {
      page.drawText(line, { x, y: cy, font: st.font, size: st.size, color: st.color });
      cy -= lh;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cy, font: st.font, size: st.size, color: st.color });
    cy -= lh;
  }
  return cy;
}


// ---------------------------------------------------------------------------
// Decorative elements
// ---------------------------------------------------------------------------

/** Ornamental divider: ---- <> ---- */
function ornamentDivider(page: PDFPage, y: number, cx = PAGE_W / 2, halfW = 80) {
  hLine(page, cx - halfW, y, halfW - 6, 0.5, C.mid);
  hLine(page, cx + 6, y, halfW - 6, 0.5, C.mid);
  // Diamond in center
  const s = 3;
  page.drawRectangle({
    x: cx - s, y: y - s, width: s * 2, height: s * 2,
    borderColor: C.mid, borderWidth: 0.6, opacity: 0,
    rotate: degrees(45),
  });
}

// ---------------------------------------------------------------------------
// Section blocks
// ---------------------------------------------------------------------------

interface SectionItem { name: string; desc: string }

interface SectionOpts {
  title: string;
  items: SectionItem[];
  intro?: string;
  numbered?: boolean;
}

/** Draw a section. Returns Y after section. */
function drawSection(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  opts: SectionOpts,
  fonts: { bold: PDFFont; regular: PDFFont; oblique: PDFFont },
): number {
  const nameSize = 9;
  const descSize = 8;
  const introSize = 8;

  // Section title with double-line underline
  text(page, opts.title.toUpperCase(), x, y, { font: fonts.bold, size: 11, color: C.black });
  hLine(page, x, y - 4, w, 1.5, C.black);
  hLine(page, x, y - 6.5, w, 0.4, C.mid);

  let cy = y - 20;

  // Intro
  if (opts.intro) {
    cy = wrap(page, opts.intro, x, cy, w, {
      font: fonts.oblique, size: introSize, color: C.mid, lineHeight: introSize * 1.35,
    });
    cy -= 4;
  }

  // Items
  for (let i = 0; i < opts.items.length; i++) {
    const item = opts.items[i];
    const prefix = opts.numbered ? `${i + 1}. ` : '';

    // Name (bold)
    text(page, prefix + item.name, x + 2, cy, { font: fonts.bold, size: nameSize, color: C.black });
    cy -= 13;

    // Description (regular, indented)
    cy = wrap(page, item.desc, x + 10, cy, w - 10, {
      font: fonts.regular, size: descSize, color: C.dark, lineHeight: descSize * 1.35,
    });

    // Dotted separator
    if (i < opts.items.length - 1) {
      cy -= 2;
      dottedLine(page, x + 10, cy + 4, w - 20);
      cy -= 4;
    } else {
      cy -= 4;
    }
  }

  return cy;
}

// ---------------------------------------------------------------------------
// Boxed callout (e.g. "Your Turn" summary)
// ---------------------------------------------------------------------------

interface CalloutItem { label: string; desc: string }

function drawCalloutBox(
  page: PDFPage,
  x: number, y: number, w: number,
  title: string,
  items: CalloutItem[],
  fonts: { bold: PDFFont; regular: PDFFont },
): number {
  const padding = 12;
  const innerW = w - padding * 2;
  const itemH = 16;
  const boxH = 24 + items.length * itemH + 8;

  // Box border (double line effect)
  drawBorderRect(page, x, y - boxH, w, boxH, C.black, 1.5);
  drawBorderRect(page, x + 2, y - boxH + 2, w - 4, boxH - 4, C.mid, 0.4);

  // Title
  text(page, title.toUpperCase(), x + padding, y - 18, {
    font: fonts.bold, size: 12, color: C.black,
  });
  hLine(page, x + padding, y - 22, innerW, 0.5, C.mid);

  let cy = y - 36;
  for (const item of items) {
    const labelStr = item.label + ':';
    const labelW = fonts.bold.widthOfTextAtSize(labelStr + ' ', 9);
    text(page, labelStr, x + padding, cy, { font: fonts.bold, size: 9, color: C.black });
    text(page, item.desc, x + padding + labelW, cy, { font: fonts.regular, size: 8, color: C.dark });
    cy -= itemH;
  }

  return y - boxH;
}

// ---------------------------------------------------------------------------
// Page header & footer
// ---------------------------------------------------------------------------

function drawHeader(
  page: PDFPage,
  title: string,
  subtitle: string,
  fonts: { bold: PDFFont; regular: PDFFont },
) {
  // Top band
  drawRect(page, 0, PAGE_H - 48, PAGE_W, 48, C.headerBg);

  textCenter(page, title, PAGE_H - 30, { font: fonts.bold, size: 20, color: C.white });
  textCenter(page, subtitle, PAGE_H - 43, { font: fonts.regular, size: 8, color: C.light });

  // Thick rule below header
  hLine(page, MARGIN, PAGE_H - 52, PAGE_W - MARGIN * 2, 2, C.black);
  hLine(page, MARGIN, PAGE_H - 55, PAGE_W - MARGIN * 2, 0.4, C.mid);
}

function drawFooter(page: PDFPage, pageNum: number, total: number, fonts: { regular: PDFFont }) {
  const footerLeft = 'DRAW STEEL  //  Combat Reference';
  const footerRight = `Page ${pageNum} of ${total}`;
  hLine(page, MARGIN, 28, PAGE_W - MARGIN * 2, 0.5, C.mid);
  text(page, footerLeft, MARGIN, 16, { font: fonts.regular, size: 6.5, color: C.mid });
  const rw = fonts.regular.widthOfTextAtSize(footerRight, 6.5);
  text(page, footerRight, PAGE_W - MARGIN - rw, 16, { font: fonts.regular, size: 6.5, color: C.mid });
}

// ---------------------------------------------------------------------------
// PDF Generation
// ---------------------------------------------------------------------------

export async function exportCombatReferencePdf(): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const oblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const boldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
  const fonts = { bold, regular, oblique, boldOblique };

  const TOTAL_PAGES = 3;
  const contentW = PAGE_W - MARGIN * 2;
  const colW = (contentW - COL_GAP) / 2;

  // =========================================================================
  // PAGE 1 — Your Turn & Standard Actions
  // =========================================================================
  const p1 = pdfDoc.addPage([PAGE_W, PAGE_H]);
  drawHeader(p1, 'COMBAT REFERENCE', 'Standard Actions & Turn Structure', fonts);

  let y1 = PAGE_H - 70;

  // --- YOUR TURN callout box ---
  y1 = drawCalloutBox(p1, MARGIN, y1, contentW, 'Your Turn', [
    { label: 'Move Action', desc: 'Move up to your speed in squares. You can split movement before and after your other actions.' },
    { label: 'Main Action', desc: 'Your primary action each turn -- attack, use an ability, charge, catch breath, defend, stride, or aid.' },
    { label: 'Maneuver', desc: 'One minor action in addition to your main action -- disengage, hide, grab, knockback, drink potion, etc.' },
    { label: 'Free Actions', desc: 'Free maneuvers and free triggered actions cost nothing. Use them when their conditions are met.' },
    { label: 'Triggered Action', desc: 'A reaction used outside your turn. You get one triggered action per round unless stated otherwise.' },
  ], fonts);

  y1 -= 18;
  ornamentDivider(p1, y1);
  y1 -= 16;

  // --- Two columns: Main Actions | Maneuvers ---
  let leftY = y1;
  let rightY = y1;

  leftY = drawSection(p1, MARGIN, leftY, colW, {
    title: 'Main Actions',
    intro: 'Every hero can take these actions on their turn regardless of class or level.',
    items: [
      { name: 'Free Strike', desc: 'Make a basic melee or ranged attack. Roll 2d10 + characteristic. Damage is based on your kit\'s weapon damage tiers.' },
      { name: 'Charge', desc: 'Move up to your speed in a straight line, then make a melee free strike. You cannot shift or make ranged attacks during a charge.' },
      { name: 'Catch Breath', desc: 'Spend one recovery to regain stamina equal to your recovery value. Your primary way to heal during combat.' },
      { name: 'Defend', desc: 'Take a defensive stance. Enemies have a bane on ability rolls against you until the start of your next turn. Ends early if force moved.' },
      { name: 'Stride', desc: 'Move up to your speed again. This is in addition to your normal move action, letting you cover extra ground.' },
      { name: 'Aid', desc: 'Help an ally with a test. They gain an edge on their next test before the end of their next turn.' },
    ],
  }, fonts);

  rightY = drawSection(p1, MARGIN + colW + COL_GAP, rightY, colW, {
    title: 'Maneuvers',
    intro: 'A maneuver is a minor action taken in addition to your main action. One per turn unless stated otherwise.',
    items: [
      { name: 'Disengage (Shift)', desc: 'Shift a number of squares up to your disengage value (usually 1). Shifting does not provoke opportunity attacks.' },
      { name: 'Drink Potion', desc: 'Consume a healing potion or other consumable you are carrying. Can also be administered to an adjacent ally.' },
      { name: 'Knockback', desc: 'Push an adjacent creature of your size or smaller 1 square. This is forced movement and does not provoke opportunity attacks.' },
      { name: 'Grab', desc: 'Grab an adjacent creature of your size or smaller. They resist with a Might or Agility test vs. your Might. A grabbed creature has speed 0.' },
      { name: 'Hide', desc: 'If concealed or behind cover, make an Agility test to become hidden. Attacking or moving into the open ends this.' },
      { name: 'Make or Assist a Test', desc: 'Use a skill in combat or assist an ally\'s test, giving them an edge.' },
      { name: 'Stand Up', desc: 'If prone, use your maneuver to stand. Does not cost extra movement.' },
    ],
  }, fonts);

  // Triggered actions below both columns
  let trigY = Math.min(leftY, rightY) - 14;
  hLine(p1, MARGIN, trigY + 6, contentW, 0.4, C.faintRule);

  trigY = drawSection(p1, MARGIN, trigY, contentW, {
    title: 'Triggered Actions',
    intro: 'Triggered actions are reactions used outside your turn when specific conditions are met. You get one per round.',
    items: [
      { name: 'Opportunity Attack', desc: 'When an adjacent enemy moves away from you without shifting, make a melee free strike against them as a reaction.' },
    ],
  }, fonts);

  drawFooter(p1, 1, TOTAL_PAGES, { regular });

  // =========================================================================
  // PAGE 2 — Power Rolls, Surges, Potency, Stamina & Dying
  // =========================================================================
  const p2 = pdfDoc.addPage([PAGE_W, PAGE_H]);
  drawHeader(p2, 'COMBAT RULES', 'Rolls, Resources & Survival', fonts);

  let y2 = PAGE_H - 70;

  // --- Power Rolls (full width, important) ---
  y2 = drawSection(p2, MARGIN, y2, contentW, {
    title: 'Power Rolls',
    intro: 'All ability rolls use 2d10 + characteristic. Unlike tests, power rolls always produce an effect -- the roll determines the tier of the outcome.',
    items: [
      { name: 'Tier 1  --  11 or lower', desc: 'The weakest result. You still deal some damage or apply a lesser effect. No power roll is ever a complete miss in Draw Steel.' },
      { name: 'Tier 2  --  12 to 16', desc: 'A solid result. You deal moderate damage and apply the standard version of the ability\'s effect.' },
      { name: 'Tier 3  --  17 or higher', desc: 'The best result. Maximum damage and the strongest version of the ability\'s effect.' },
      { name: 'Critical Hit', desc: 'If the 2d10 show a natural 19 or 20 (before modifiers) on a main action power roll, you score a critical hit and immediately gain an additional main action.' },
      { name: 'Edges & Banes', desc: 'An edge adds +2 to your roll. A bane subtracts 2. They stack, and equal edges and banes cancel each other out.' },
    ],
  }, fonts);

  y2 -= 10;
  ornamentDivider(p2, y2);
  y2 -= 14;

  // Two columns: Surges + Potency | Stamina & Dying
  let p2Left = y2;
  let p2Right = y2;

  p2Left = drawSection(p2, MARGIN, p2Left, colW, {
    title: 'Surges',
    intro: 'Surges are a combat resource that let you push beyond normal limits. Unspent surges are lost when combat ends.',
    items: [
      { name: 'Extra Damage', desc: 'When dealing rolled damage, spend up to 3 surges to deal extra damage to one target. Each surge adds damage equal to your highest characteristic score.' },
      { name: 'Boost Potency', desc: 'When targeting a creature with a potency effect, spend 2 surges to increase potency by 1 tier for that target. Max +1 from surges.' },
    ],
  }, fonts);

  p2Left -= 10;

  p2Left = drawSection(p2, MARGIN, p2Left, colW, {
    title: 'Potency',
    intro: 'Many abilities impose effects that targets resist with their characteristic scores. Your potency values set the threshold.',
    items: [
      { name: 'Strong', desc: 'Equal to your highest characteristic score. Hardest for enemies to resist.' },
      { name: 'Average', desc: 'Highest characteristic - 1.' },
      { name: 'Weak', desc: 'Highest characteristic - 2. Easiest for enemies to resist.' },
      { name: 'Notation', desc: '"M<w" means if target\'s Might < your weak potency, they suffer the effect. M=Might, A=Agility, R=Reason, I=Intuition, P=Presence. w=weak, v=average, s=strong.' },
    ],
  }, fonts);

  p2Right = drawSection(p2, MARGIN + colW + COL_GAP, p2Right, colW, {
    title: 'Stamina & Dying',
    intro: 'Stamina is your ability to keep fighting. When it runs out, you are in mortal danger.',
    items: [
      { name: 'Winded', desc: 'When stamina drops to your winded value or below, you are winded. Some abilities have bonus effects on winded targets.' },
      { name: 'Dying', desc: 'At 0 stamina, you begin dying. Each turn, roll 1d10: on 6+, spend a recovery to regain stamina. On 5 or less, lose a recovery.' },
      { name: 'Death', desc: 'If you begin a turn dying with 0 recoveries, your hero dies.' },
      { name: 'Recoveries', desc: 'Your pool of healing. Spend a recovery to regain stamina equal to your recovery value. Catch Breath costs one recovery.' },
    ],
  }, fonts);

  p2Right -= 10;

  p2Right = drawSection(p2, MARGIN + colW + COL_GAP, p2Right, colW, {
    title: 'Distances & Areas',
    intro: 'How abilities specify their reach.',
    items: [
      { name: 'Melee X', desc: 'Contact range. X = max squares. Melee 1 means adjacent only.' },
      { name: 'Ranged X', desc: 'X = max squares. Ranged strikes while adjacent to an enemy take a bane.' },
      { name: 'Burst / Aura', desc: 'Burst X: instant radius from you. Aura X: radius that moves with you for the duration.' },
      { name: 'Line / Wall / Cube', desc: 'Line AxB: A long, B wide. Wall X: connected squares, blocks line of effect. Cube X: X per side.' },
    ],
  }, fonts);

  drawFooter(p2, 2, TOTAL_PAGES, { regular });

  // =========================================================================
  // PAGE 3 — Conditions & Effect Durations
  // =========================================================================
  const p3 = pdfDoc.addPage([PAGE_W, PAGE_H]);
  drawHeader(p3, 'CONDITIONS & EFFECTS', 'Status Effects, Durations & Keywords', fonts);

  let y3 = PAGE_H - 70;

  // Full-width intro
  y3 = wrap(p3, 'Conditions are negative status effects imposed by abilities. A creature can suffer multiple different conditions simultaneously. Below is every condition in the game with its full mechanical effect.', MARGIN, y3, contentW, {
    font: oblique, size: 9, color: C.mid, lineHeight: 13,
  });
  y3 -= 6;
  hLine(p3, MARGIN, y3 + 3, contentW, 0.5, C.mid);
  y3 -= 10;

  // Two-column conditions
  const allConditions: SectionItem[] = [
    { name: 'Bleeding', desc: 'Whenever you use a main action, triggered action, or roll using Might/Agility, lose stamina equal to 1d6 + your level after the action. This loss cannot be prevented.' },
    { name: 'Dazed', desc: 'You can only do one thing on your turn: a main action, a maneuver, or a move action. You cannot use triggered actions, free triggered actions, or free maneuvers.' },
    { name: 'Frightened', desc: 'Ability rolls against the fear source take a bane. The source\'s rolls against you gain an edge. You cannot willingly move closer to the source.' },
    { name: 'Grabbed', desc: 'Speed 0. Cannot be force moved except by the grabber. Cannot use Knockback. Bane on abilities not targeting the grabber. Move with the grabber.' },
    { name: 'Prone', desc: 'Your strikes take a bane. Melee abilities against you gain an edge. Must crawl (1 extra square per square moved). Cannot climb, jump, swim, or fly.' },
    { name: 'Restrained', desc: 'Speed 0. Cannot stand up or be force moved. Bane on ability rolls and Might/Agility tests. Abilities against you gain an edge. Teleporting ends this.' },
    { name: 'Slowed', desc: 'Your speed becomes 2 (unless already lower) and you cannot shift.' },
    { name: 'Taunted', desc: 'Double bane on ability rolls for abilities that don\'t target the taunting creature, as long as you have line of effect to them.' },
    { name: 'Weakened', desc: 'You take a bane on all power rolls.' },
  ];

  // Split conditions across two columns
  const midIdx = 5; // 5 left, 4 right
  const leftConds = allConditions.slice(0, midIdx);
  const rightConds = allConditions.slice(midIdx);

  let p3Left = y3;
  let p3Right = y3;

  p3Left = drawSection(p3, MARGIN, p3Left, colW, {
    title: 'Conditions',
    items: leftConds,
  }, fonts);

  p3Right = drawSection(p3, MARGIN + colW + COL_GAP, p3Right, colW, {
    title: 'Conditions (cont.)',
    items: rightConds,
  }, fonts);

  // Ending Effects below
  let effY = Math.min(p3Left, p3Right) - 12;
  ornamentDivider(p3, effY + 4);
  effY -= 10;

  // Two columns: Ending Effects | Keywords
  let effLeft = effY;
  let effRight = effY;

  effLeft = drawSection(p3, MARGIN, effLeft, colW, {
    title: 'Effect Durations',
    intro: 'Abilities note how long their effects last using these tags.',
    items: [
      { name: 'EoT (End of Turn)', desc: 'Lasts until the end of the target\'s next turn. If imposed on their current turn, ends at end of that turn.' },
      { name: 'Save Ends', desc: 'Target rolls 1d10 at the end of each of their turns. On 6+, the effect ends.' },
      { name: 'End of Encounter', desc: 'Lasts until combat ends. Outside combat, lasts 5 minutes.' },
    ],
  }, fonts);

  effRight = drawSection(p3, MARGIN + colW + COL_GAP, effRight, colW, {
    title: 'Ability Keywords',
    intro: 'Keywords describe the nature of an ability and may interact with other rules.',
    items: [
      { name: 'Area', desc: 'Creates an area of effect. Treated differently than strikes against specific targets.' },
      { name: 'Charge', desc: 'Can be used with the Charge action instead of a melee free strike.' },
      { name: 'Magic / Psionic', desc: 'Powered by magical or psionic energy. May interact with resistances and special rules.' },
      { name: 'Melee / Ranged', desc: 'Melee requires contact; Ranged works at distance. Ranged strikes adjacent to enemies take a bane.' },
      { name: 'Strike', desc: 'Targets specific creatures/objects and harms them via a power roll. Not an area effect.' },
      { name: 'Weapon', desc: 'Must be used with a weapon (blade, bow, unarmed, claws, etc.).' },
    ],
  }, fonts);

  drawFooter(p3, 3, TOTAL_PAGES, { regular });

  // =========================================================================
  // Save & Download
  // =========================================================================
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Draw-Steel-Combat-Reference.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
