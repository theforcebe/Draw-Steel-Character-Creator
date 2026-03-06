// ============================================================
// ANCESTRY RENDERERS
// Ported from New Armor - Models - Enhanced.html
// Contains all theme extras functions and ancestry armor functions
// ============================================================

import {
  resolveColors, HAND_POS,
  KIT_ID_MAP, ANCESTRY_ID_MAP,
  getTier, KITS,
} from './model-data';
import type { Tier, ColorOverride } from './model-data';
import { mkFilter, mkRunes, mkParticles, WEAPON_BUILDERS } from './weapon-builders';

// ============================================================
// LOCAL HELPERS
// ============================================================

const WEP_BASE_X = 96;

function mkWings(cx: number, cy: number, color: string, accent: string, level: number): string {
  const maxScale = Math.min(cx / 55, 1.0);
  const scale = Math.min(0.5 + level * 0.05, maxScale);
  const opacity = 0.45 + level * 0.04;
  return `<g transform="translate(${cx},${cy}) scale(${scale})" opacity="${opacity}">
    <path d="M0,0 Q-35,-20 -55,-5 Q-45,10 -25,8 Q-40,20 -50,35 Q-30,30 -15,15Z" fill="${color}" stroke="${accent}" stroke-width="0.8"/>
    <path d="M0,0 Q35,-20 55,-5 Q45,10 25,8 Q40,20 50,35 Q30,30 15,15Z" fill="${color}" stroke="${accent}" stroke-width="0.8"/>
    <path d="M0,0 Q-20,-10 -30,5 Q-20,12 -10,8Z" fill="${accent}" opacity="0.5"/>
    <path d="M0,0 Q20,-10 30,5 Q20,12 10,8Z" fill="${accent}" opacity="0.5"/>
  </g>`;
}

/** Resolve kit weapon SVG using the weapon-builders registry */
function getSelectedWeaponSvg(
  kit: { id: string; weaponClass: string },
  selectedWeaponId: string | undefined,
  level: number,
  acc: string,
  sf: string,
  id: string,
  ancestryId?: string,
): string {
  // Stormwight kits
  if (kit.id === 'boren') return (WEAPON_BUILDERS['boren_spirit'] ?? WEAPON_BUILDERS['unarmed'])(level, acc, sf, id);
  if (kit.id === 'corven') return (WEAPON_BUILDERS['corven_spirit'] ?? WEAPON_BUILDERS['unarmed'])(level, acc, sf, id);
  if (kit.id === 'raden') return (WEAPON_BUILDERS['raden_spirit'] ?? WEAPON_BUILDERS['unarmed'])(level, acc, sf, id);
  if (kit.id === 'vuken') return (WEAPON_BUILDERS['vuken_spirit'] ?? WEAPON_BUILDERS['unarmed'])(level, acc, sf, id);

  const hp = HAND_POS[ancestryId ?? 'human'] || HAND_POS.human;
  const dx = hp.rx - WEP_BASE_X;

  let svg = '';

  // Shield for shield kits
  if (kit.weaponClass === 'medium_shield' || kit.weaponClass === 'light_divine') {
    const shW = 16, shH = 22;
    const shx = hp.lx - shW / 2, shy = hp.ly - shH * 0.6;
    svg += `<path d="M${shx},${shy} L${shx + shW},${shy} L${shx + shW},${shy + shH * 0.7} Q${shx + shW},${shy + shH} ${shx + shW / 2},${shy + shH} Q${shx},${shy + shH} ${shx},${shy + shH * 0.7}Z" fill="${acc}" filter="url(#af_${id})" opacity="0.85"/>
    <path d="M${shx + 2},${shy + 2} L${shx + shW - 2},${shy + 2} L${shx + shW - 2},${shy + shH * 0.65} Q${shx + shW - 2},${shy + shH - 3} ${shx + shW / 2},${shy + shH - 3} Q${shx + 2},${shy + shH - 3} ${shx + 2},${shy + shH * 0.65}Z" fill="none" stroke="${sf}" stroke-width="${0.8 + level * 0.1}" opacity="0.7"/>
    ${level >= 5 ? `<circle cx="${shx + shW / 2}" cy="${shy + shH * 0.4}" r="${2 + level * 0.2}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>` : ''}`;
  }

  // Dual wield offhand
  if (kit.weaponClass === 'dual') {
    svg += `<g opacity="0.8" transform="translate(${hp.lx},${hp.ry}) scale(-1,1) translate(${-WEP_BASE_X},${-hp.ry})">` + (WEAPON_BUILDERS['dagger'] ?? WEAPON_BUILDERS['longsword'])(level, acc, sf, id + '_oh') + `</g>`;
  }

  // Ranger bow hint
  if (kit.weaponClass === 'bow_melee' && !['longbow', 'shortbow', 'crossbow', 'sling', 'atlatl'].includes(selectedWeaponId ?? '')) {
    svg += `<path d="M${hp.rx + 6},${hp.ry - 60} Q${hp.rx + 16},${hp.ry - 10} ${hp.rx + 6},${hp.ry + 40}" stroke="${acc}" stroke-width="1.5" fill="none" opacity="0.25"/>`;
  }

  // Net hint
  if (kit.weaponClass === 'polearm_net') {
    svg += `<path d="M${hp.lx},${hp.ly - 4} Q${hp.lx + 8},${hp.ly - 16} ${hp.lx + 4},${hp.ly - 28} Q${hp.lx},${hp.ly - 16} ${hp.lx - 4},${hp.ly - 4}Z" stroke="${acc}" stroke-width="1.2" fill="none" opacity="0.4"/>
    <line x1="${hp.lx}" y1="${hp.ly - 14}" x2="${hp.lx + 8}" y2="${hp.ly - 14}" stroke="${acc}" stroke-width="1" opacity="0.3"/>
    <line x1="${hp.lx - 2}" y1="${hp.ly - 8}" x2="${hp.lx + 6}" y2="${hp.ly - 8}" stroke="${acc}" stroke-width="1" opacity="0.3"/>`;
  }

  // Magic orb
  if (kit.weaponClass === 'medium_magic') {
    svg += `<ellipse cx="${hp.lx}" cy="${hp.ly - 16}" rx="${3 + level * 0.3}" ry="${3 + level * 0.3}" fill="${sf}" filter="url(#gf)" opacity="0.6" style="animation:soulPulse 1.8s infinite"/>`;
  }

  // Main weapon
  const weaponId = selectedWeaponId || 'longsword';
  const builder = WEAPON_BUILDERS[weaponId];
  if (dx !== 0) svg += `<g transform="translate(${dx},0)">`;
  if (builder) svg += builder(level, acc, sf, id);
  else svg += (WEAPON_BUILDERS['longsword'])(level, acc, sf, id);
  if (dx !== 0) svg += `</g>`;

  return svg;
}

// Shared defs builder
function defs(id: string, skinColor: string, armorColor: string, accent: string, glow: string, isRev: boolean): string {
  const gc = isRev ? '#7fffd4' : accent;
  const gs = isRev ? 3.5 : 2.5;
  return `<defs>
    ${mkFilter('gf', gc, gs)}
    <radialGradient id="sg_${id}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${skinColor}"/>
      <stop offset="100%" stop-color="${skinColor}88"/>
    </radialGradient>
    <linearGradient id="ag_${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${armorColor}"/>
      <stop offset="100%" stop-color="${armorColor}88"/>
    </linearGradient>
    <linearGradient id="acc_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accent}66"/>
    </linearGradient>
    <filter id="af_${id}">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feFlood flood-color="${glow}" result="col"/>
      <feComposite in="col" in2="blur" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

// ============================================================
// THEME EXTRAS FUNCTIONS
// ============================================================

// --- DEVIL ---
function devilThemeExtras(level: number, tier: Tier, isRev: boolean, _id: string, acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.38;
  const shoulderY = ty + 10;
  const fc = isRev ? '#7fffd4' : '#ff4500';
  const fc2 = isRev ? '#5ac8a8' : '#ff6a00';
  const sc = isRev ? '#7fffd4' : acc;

  if (level >= 1) {
    for (let i = 0; i < 2; i++) {
      const off = i * 10;
      s += `<polygon points="${cx - 36 - off},${shoulderY - 6} ${cx - 40 - off},${shoulderY - 18 - i * 4} ${cx - 32 - off},${shoulderY - 4}" fill="${sc}" opacity="${0.6 + level * 0.04}"/>`;
      s += `<polygon points="${cx + 36 + off},${shoulderY - 6} ${cx + 40 + off},${shoulderY - 18 - i * 4} ${cx + 32 + off},${shoulderY - 4}" fill="${sc}" opacity="${0.6 + level * 0.04}"/>`;
    }
    for (let i = 0; i < 2; i++) {
      const dx = i === 0 ? -38 : 38;
      s += `<path d="M${cx + dx},${shoulderY - 10} Q${cx + dx + 3},${shoulderY - 22 - i * 4} ${cx + dx - 2},${shoulderY - 32}" stroke="${fc}" stroke-width="1.5" fill="none" opacity="0.25" style="animation:emberDrift ${2 + i * 0.5}s ease-out infinite"/>`;
    }
  }

  if (level >= 3) {
    const spikeH = 14 + level * 2;
    s += `<polygon points="${cx - 48},${shoulderY - 2} ${cx - 52},${shoulderY - spikeH} ${cx - 44},${shoulderY}" fill="${sc}" opacity="0.7"/>`;
    s += `<polygon points="${cx + 48},${shoulderY - 2} ${cx + 52},${shoulderY - spikeH} ${cx + 44},${shoulderY}" fill="${sc}" opacity="0.7"/>`;
    const crackOp = 0.3 + level * 0.06;
    s += `<path d="M${cx - 12},${ty + 14} L${cx - 8},${ty + 24} L${cx - 14},${ty + 36}" stroke="${fc}" stroke-width="${0.8 + level * 0.1}" fill="none" opacity="${crackOp}"/>`;
    s += `<path d="M${cx + 10},${ty + 16} L${cx + 14},${ty + 28} L${cx + 8},${ty + 40}" stroke="${fc}" stroke-width="${0.8 + level * 0.1}" fill="none" opacity="${crackOp}"/>`;
    s += `<path d="M${cx - 4},${ty + 20} L${cx + 2},${ty + 30}" stroke="${fc2}" stroke-width="0.6" fill="none" opacity="${crackOp * 0.7}"/>`;
    const beltY = ty + h * 0.25;
    for (let i = 0; i < 3; i++) {
      const clx = cx - 16 + i * 16;
      s += `<ellipse cx="${clx}" cy="${beltY + 8 + i * 2}" rx="3" ry="4" fill="none" stroke="${isRev ? '#5ac8a8' : '#555'}" stroke-width="1.5" opacity="0.6"/>`;
    }
  }

  if (level >= 5) {
    s += `<polygon points="${cx - 46},${shoulderY + 2} ${cx - 54},${shoulderY - 28} ${cx - 50},${shoulderY - 16} ${cx - 42},${shoulderY}" fill="${sc}" opacity="0.8"/>`;
    s += `<polygon points="${cx + 46},${shoulderY + 2} ${cx + 54},${shoulderY - 28} ${cx + 50},${shoulderY - 16} ${cx + 42},${shoulderY}" fill="${sc}" opacity="0.8"/>`;
    s += `<line x1="${cx - 52}" y1="${shoulderY - 20}" x2="${cx - 58}" y2="${shoulderY - 24}" stroke="${sc}" stroke-width="1.5" opacity="0.7"/>`;
    s += `<line x1="${cx + 52}" y1="${shoulderY - 20}" x2="${cx + 58}" y2="${shoulderY - 24}" stroke="${sc}" stroke-width="1.5" opacity="0.7"/>`;
    s += `<path d="M${cx - 18},${ty + 12} L${cx - 10},${ty + 22} L${cx - 20},${ty + 38} L${cx - 12},${ty + 46}" stroke="${fc}" stroke-width="1.2" fill="none" opacity="0.5" style="animation:soulPulse 1.5s infinite"/>`;
    s += `<path d="M${cx + 16},${ty + 14} L${cx + 8},${ty + 26} L${cx + 18},${ty + 40}" stroke="${fc}" stroke-width="1.2" fill="none" opacity="0.5" style="animation:soulPulse 1.8s infinite"/>`;
    const tailX = cx + 28, tailY = h * 0.65;
    for (let i = 0; i < 3; i++) {
      s += `<polygon points="${tailX + 12 + i * 6},${tailY + i * 8} ${tailX + 16 + i * 6},${tailY - 4 + i * 8} ${tailX + 10 + i * 6},${tailY + 4 + i * 8}" fill="${sc}" opacity="${0.5 + i * 0.1}"/>`;
    }
    const sigR = 8 + level * 0.5;
    const sigY = ty + 20;
    s += `<circle cx="${cx}" cy="${sigY}" r="${sigR}" fill="none" stroke="${isRev ? '#7fffd4' : acc}" stroke-width="0.8" opacity="0.5"/>`;
    for (let i = 0; i < 5; i++) {
      const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 2) / 5) * Math.PI * 2 - Math.PI / 2;
      s += `<line x1="${cx + Math.cos(a1) * sigR}" y1="${sigY + Math.sin(a1) * sigR}" x2="${cx + Math.cos(a2) * sigR}" y2="${sigY + Math.sin(a2) * sigR}" stroke="${isRev ? '#7fffd4' : acc}" stroke-width="0.7" opacity="0.4"/>`;
    }
  }

  if (level >= 7) {
    s += `<polygon points="${cx - 44},${shoulderY} ${cx - 56},${shoulderY - 40} ${cx - 50},${shoulderY - 26} ${cx - 40},${shoulderY + 4}" fill="${sc}" opacity="0.85" filter="url(#gf)"/>`;
    s += `<polygon points="${cx + 44},${shoulderY} ${cx + 56},${shoulderY - 40} ${cx + 50},${shoulderY - 26} ${cx + 40},${shoulderY + 4}" fill="${sc}" opacity="0.85" filter="url(#gf)"/>`;
    s += `<ellipse cx="${cx}" cy="${ty + 20}" rx="22" ry="18" fill="${fc}" opacity="${0.06 + level * 0.01}" filter="url(#gf)" style="animation:soulPulse 2.5s infinite"/>`;
    const wristY = ty + h * 0.24;
    for (let side = -1; side <= 1; side += 2) {
      const wx = cx + side * 32;
      for (let i = 0; i < 3; i++) {
        s += `<ellipse cx="${wx + side * i * 4}" cy="${wristY + i * 6}" rx="3" ry="4" fill="none" stroke="${fc}" stroke-width="1.2" opacity="${0.5 - i * 0.1}" style="animation:soulPulse ${1.5 + i * 0.3}s infinite"/>`;
      }
    }
    if (tier.wings) {
      for (let i = 0; i < 3; i++) {
        s += `<polygon points="${cx - 40 - i * 8},${h * 0.42 + i * 10} ${cx - 48 - i * 8},${h * 0.38 + i * 10} ${cx - 42 - i * 8},${h * 0.44 + i * 10}" fill="${fc}" opacity="0.4"/>`;
        s += `<polygon points="${cx + 40 + i * 8},${h * 0.42 + i * 10} ${cx + 48 + i * 8},${h * 0.38 + i * 10} ${cx + 42 + i * 8},${h * 0.44 + i * 10}" fill="${fc}" opacity="0.4"/>`;
      }
    }
  }

  if (level >= 9) {
    const crownY = h * 0.08;
    s += `<ellipse cx="${cx}" cy="${crownY}" rx="20" ry="6" fill="none" stroke="${fc}" stroke-width="2.5" opacity="0.7" style="animation:soulPulse 1.5s infinite" filter="url(#gf)"/>`;
    s += `<ellipse cx="${cx}" cy="${crownY}" rx="16" ry="4" fill="none" stroke="${fc2}" stroke-width="1.5" opacity="0.5" style="animation:soulPulse 2s infinite"/>`;
    for (let i = 0; i < 5; i++) {
      const fx = cx - 16 + i * 8;
      s += `<path d="M${fx},${crownY - 4} Q${fx + 2},${crownY - 12 - i * 2} ${fx + 4},${crownY - 2}" stroke="${fc}" stroke-width="1.5" fill="none" opacity="${0.5 + i * 0.08}" style="animation:emberDrift ${1 + i * 0.3}s ease-out infinite"/>`;
    }
    s += `<path d="M${cx - 20},${ty + 10} L${cx - 12},${ty + 20} L${cx - 22},${ty + 34} L${cx - 14},${ty + 48}" stroke="${fc}" stroke-width="1.8" fill="none" opacity="0.7" style="animation:soulPulse 1.2s infinite" filter="url(#gf)"/>`;
    s += `<path d="M${cx + 18},${ty + 12} L${cx + 10},${ty + 24} L${cx + 20},${ty + 38} L${cx + 12},${ty + 50}" stroke="${fc}" stroke-width="1.8" fill="none" opacity="0.7" style="animation:soulPulse 1.4s infinite" filter="url(#gf)"/>`;
    s += `<path d="M${cx},${ty + 28} L${cx - 6},${ty + 40} L${cx + 4},${ty + 48}" stroke="${fc2}" stroke-width="1" fill="none" opacity="0.5" style="animation:soulPulse 1.6s infinite"/>`;
    s += `<ellipse cx="${cx}" cy="${ty + 24}" rx="18" ry="14" fill="none" stroke="${fc}" stroke-width="0.5" opacity="0.08" style="animation:rune 3s infinite"/>`;
    const tailBaseX = cx + 28, tailBaseY = h * 0.65;
    for (let i = 0; i < 4; i++) {
      s += `<circle cx="${tailBaseX + 14 + i * 5}" cy="${tailBaseY + i * 6}" r="${3 - i * 0.5}" fill="${fc}" opacity="${0.6 - i * 0.1}" style="animation:emberDrift ${1.2 + i * 0.3}s ease-out infinite" filter="url(#gf)"/>`;
    }
  }

  return s;
}

// --- DRAGON KNIGHT ---
function dragonKnightThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.38;
  const fc = isRev ? '#7fffd4' : '#ff8c00';
  const sc = isRev ? '#5ac8a8' : acc;

  if (level >= 1) {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const sx = cx - 18 + col * 12;
        const sy = ty + 18 + row * 10;
        s += `<path d="M${sx},${sy} L${sx + 6},${sy - 4} L${sx + 12},${sy} L${sx + 6},${sy + 4}Z" fill="${sc}" opacity="${0.08 + level * 0.02}" stroke="${sc}" stroke-width="0.3"/>`;
      }
    }
  }

  if (level >= 3) {
    for (let i = 0; i < 3; i++) {
      const sy = ty + 8 + i * 14;
      s += `<path d="M${cx - 34},${sy} L${cx - 28},${sy - 3} L${cx - 22},${sy} L${cx - 28},${sy + 3}Z" fill="${sc}" opacity="0.12"/>`;
      s += `<path d="M${cx + 22},${sy} L${cx + 28},${sy - 3} L${cx + 34},${sy} L${cx + 28},${sy + 3}Z" fill="${sc}" opacity="0.12"/>`;
    }
    const nostrilY = h * 0.27;
    s += `<path d="M${cx - 6},${nostrilY} Q${cx - 8},${nostrilY + 6} ${cx - 4},${nostrilY + 10}" stroke="${fc}" stroke-width="1" fill="none" opacity="0.35" style="animation:emberDrift 1.8s ease-out infinite"/>`;
    s += `<path d="M${cx + 6},${nostrilY} Q${cx + 8},${nostrilY + 6} ${cx + 4},${nostrilY + 10}" stroke="${fc}" stroke-width="1" fill="none" opacity="0.35" style="animation:emberDrift 2.1s ease-out infinite"/>`;
    for (let side = -1; side <= 1; side += 2) {
      const px = cx + side * 46;
      const py = ty - 2;
      for (let i = 0; i < 3; i++) {
        s += `<line x1="${px + i * 3}" y1="${py - 6}" x2="${px - 2 + i * 3}" y2="${py + 8}" stroke="${fc}" stroke-width="1" opacity="0.35" stroke-linecap="round"/>`;
      }
    }
  }

  if (level >= 5) {
    for (let i = 0; i < 4; i++) {
      const sy = h * 0.5 + i * 12;
      s += `<path d="M${cx - 16},${sy} Q${cx - 10},${sy - 4} ${cx - 4},${sy} Q${cx - 10},${sy + 3} ${cx - 16},${sy}Z" fill="${sc}" opacity="${0.15 + level * 0.02}"/>`;
      s += `<path d="M${cx + 4},${sy} Q${cx + 10},${sy - 4} ${cx + 16},${sy} Q${cx + 10},${sy + 3} ${cx + 4},${sy}Z" fill="${sc}" opacity="${0.15 + level * 0.02}"/>`;
    }
    const mouthY = h * 0.30;
    s += `<ellipse cx="${cx}" cy="${mouthY}" rx="8" ry="5" fill="${fc}" opacity="0.15" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
    for (let side = -1; side <= 1; side += 2) {
      const px = cx + side * 48;
      const py = ty - 6;
      s += `<path d="M${px},${py} Q${px + side * 8},${py - 12} ${px + side * 4},${py - 20} Q${px + side * 2},${py - 10} ${px},${py}Z" fill="${sc}" opacity="0.4"/>`;
    }
  }

  if (level >= 7) {
    s += `<ellipse cx="${cx}" cy="${ty + 18}" rx="20" ry="16" fill="${fc}" opacity="0.06" filter="url(#gf)" style="animation:soulPulse 2.5s infinite"/>`;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const sx = cx - 24 + col * 12;
        const sy = ty + 10 + row * 14;
        s += `<path d="M${sx},${sy} L${sx + 6},${sy - 5} L${sx + 12},${sy} L${sx + 6},${sy + 5}Z" fill="${sc}" opacity="${0.12 + level * 0.015}" stroke="${sc}" stroke-width="0.4"/>`;
      }
    }
    for (let i = 0; i < 3; i++) {
      const fx = cx - 10 + i * 10;
      const fy = h * 0.96;
      s += `<circle cx="${fx}" cy="${fy}" r="${2 - i * 0.3}" fill="${fc}" opacity="${0.4 - i * 0.1}" style="animation:emberDrift ${1.5 + i * 0.4}s ease-out infinite"/>`;
    }
  }

  if (level >= 9) {
    const breathY = h * 0.29;
    s += `<path d="M${cx},${breathY} Q${cx + 14},${breathY + 4} ${cx + 24},${breathY + 2} Q${cx + 18},${breathY + 8} ${cx + 30},${breathY + 6}" stroke="${fc}" stroke-width="3" fill="none" opacity="0.5" style="animation:soulPulse 1.2s infinite" filter="url(#gf)"/>`;
    s += `<path d="M${cx},${breathY} Q${cx + 10},${breathY + 6} ${cx + 20},${breathY + 8}" stroke="${isRev ? '#a0ffe0' : '#ffcc00'}" stroke-width="1.5" fill="none" opacity="0.3" style="animation:soulPulse 1.5s infinite"/>`;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const sx = cx - 22 + col * 14;
        const sy = ty + 6 + row * 14;
        s += `<path d="M${sx},${sy} L${sx + 7},${sy - 5} L${sx + 14},${sy} L${sx + 7},${sy + 5}Z" fill="none" stroke="${fc}" stroke-width="0.6" opacity="0.25" style="animation:rune ${2 + row * 0.3}s infinite"/>`;
      }
    }
    s += `<ellipse cx="${cx}" cy="${ty + 18}" rx="24" ry="20" fill="${fc}" opacity="0.05" filter="url(#gf)" style="animation:soulPulse 3s infinite"/>`;
    s += `<path d="M${cx - 30},${ty} Q${cx - 38},${ty - 8} ${cx - 32},${ty - 14}" stroke="${fc}" stroke-width="1" fill="none" opacity="0.08"/>`;
    s += `<path d="M${cx + 30},${ty} Q${cx + 38},${ty - 8} ${cx + 32},${ty - 14}" stroke="${fc}" stroke-width="1" fill="none" opacity="0.08"/>`;
  }

  return s;
}

// --- DWARF ---
function dwarfThemeExtras(level: number, _tier: Tier, isRev: boolean, id: string, acc: string, sf: string, arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const rc = isRev ? '#7fffd4' : acc;

  if (level >= 1) {
    const beardBottomY = h * 0.54;
    s += `<circle cx="${cx - 7}" cy="${beardBottomY}" r="${2.5 + level * 0.2}" fill="${rc}" opacity="0.6" filter="url(#af_${id})"/>`;
    s += `<circle cx="${cx + 7}" cy="${beardBottomY}" r="${2.5 + level * 0.2}" fill="${rc}" opacity="0.6" filter="url(#af_${id})"/>`;
    if (level >= 2) {
      s += `<circle cx="${cx}" cy="${beardBottomY + 4}" r="${2 + level * 0.15}" fill="${rc}" opacity="0.5" filter="url(#af_${id})"/>`;
    }
    const beltY = h * 0.68;
    s += `<rect x="${cx - 3}" y="${beltY - 1}" width="6" height="3" rx="0.5" fill="${rc}" opacity="0.6"/>`;
    s += `<rect x="${cx - 1}" y="${beltY + 2}" width="2" height="5" rx="0.5" fill="${rc}" opacity="0.5"/>`;
    s += `<path d="M${cx - 4},${beltY + 7} L${cx + 4},${beltY + 7} L${cx + 3},${beltY + 5} L${cx - 3},${beltY + 5}Z" fill="${rc}" opacity="0.5"/>`;
  }

  if (level >= 4) {
    const bbY = h * 0.52;
    s += `<circle cx="${cx - 10}" cy="${bbY}" r="3" fill="none" stroke="${rc}" stroke-width="1.5" opacity="0.7"/>`;
    s += `<circle cx="${cx + 10}" cy="${bbY}" r="3" fill="none" stroke="${rc}" stroke-width="1.5" opacity="0.7"/>`;
    s += `<circle cx="${cx - 7}" cy="${bbY + 8}" r="2.5" fill="${sf}" opacity="0.5" filter="url(#gf)"/>`;
    s += `<circle cx="${cx + 7}" cy="${bbY + 8}" r="2.5" fill="${sf}" opacity="0.5" filter="url(#gf)"/>`;
    const armY = h * 0.52;
    for (let i = 0; i < 3; i++) {
      const y = armY + i * 6;
      s += `<line x1="${cx - 42}" y1="${y}" x2="${cx - 34}" y2="${y}" stroke="${rc}" stroke-width="1" opacity="${0.4 + i * 0.08}"/>`;
      s += `<line x1="${cx + 34}" y1="${y}" x2="${cx + 42}" y2="${y}" stroke="${rc}" stroke-width="1" opacity="${0.4 + i * 0.08}"/>`;
    }
    const mtY = h * 0.46;
    s += `<path d="M${cx - 14},${mtY + 12} L${cx - 8},${mtY} L${cx},${mtY + 6} L${cx + 8},${mtY} L${cx + 14},${mtY + 12}" fill="none" stroke="${rc}" stroke-width="${1 + level * 0.1}" opacity="0.5"/>`;
    s += `<path d="M${cx - 9},${mtY + 2} L${cx - 8},${mtY} L${cx - 6},${mtY + 3}" fill="white" opacity="0.25"/>`;
    s += `<path d="M${cx + 6},${mtY + 3} L${cx + 8},${mtY} L${cx + 9},${mtY + 2}" fill="white" opacity="0.25"/>`;
  }

  if (level >= 7) {
    const bjY = h * 0.50;
    s += `<path d="M${cx - 12},${bjY} Q${cx - 8},${bjY + 10} ${cx - 12},${bjY + 16}" stroke="${rc}" stroke-width="1" fill="none" opacity="0.6"/>`;
    s += `<path d="M${cx + 12},${bjY} Q${cx + 8},${bjY + 10} ${cx + 12},${bjY + 16}" stroke="${rc}" stroke-width="1" fill="none" opacity="0.6"/>`;
    s += `<circle cx="${cx - 12}" cy="${bjY + 16}" r="3" fill="${sf}" filter="url(#gf)" opacity="0.7"/>`;
    s += `<circle cx="${cx + 12}" cy="${bjY + 16}" r="3" fill="${sf}" filter="url(#gf)" opacity="0.7"/>`;
    const circuitOp = 0.3 + level * 0.04;
    s += `<path d="M${cx - 44},${h * 0.36} Q${cx - 30},${h * 0.42} ${cx - 14},${h * 0.48}" stroke="${sf}" stroke-width="1" fill="none" opacity="${circuitOp}" style="animation:rune ${1.8}s infinite" filter="url(#gf)"/>`;
    s += `<path d="M${cx + 44},${h * 0.36} Q${cx + 30},${h * 0.42} ${cx + 14},${h * 0.48}" stroke="${sf}" stroke-width="1" fill="none" opacity="${circuitOp}" style="animation:rune ${1.8}s infinite"/>`;
    s += `<line x1="${cx}" y1="${h * 0.52}" x2="${cx}" y2="${h * 0.66}" stroke="${sf}" stroke-width="1" opacity="${circuitOp}" style="animation:rune 2s infinite"/>`;
    for (let i = 0; i < 2; i++) {
      const wx = cx - 20 + i * 40;
      const wy = h * 0.25 - i * 6;
      s += `<circle cx="${wx}" cy="${wy}" r="${2 + i}" fill="${sf}" opacity="0.2" style="animation:emberDrift ${2 + i * 0.5}s ease-out infinite" filter="url(#gf)"/>`;
    }
  }

  if (level >= 9) {
    const rp: number[][] = [
      [cx - 20, h * 0.44], [cx + 20, h * 0.44],
      [cx - 30, h * 0.54], [cx + 30, h * 0.54],
      [cx, h * 0.40], [cx, h * 0.60],
      [cx - 14, h * 0.68], [cx + 14, h * 0.68]
    ];
    for (let i = 0; i < rp.length - 1; i++) {
      s += `<line x1="${rp[i][0]}" y1="${rp[i][1]}" x2="${rp[i + 1][0]}" y2="${rp[i + 1][1]}" stroke="${sf}" stroke-width="0.8" opacity="0.35" style="animation:rune ${1.5 + i * 0.2}s infinite" filter="url(#gf)"/>`;
      s += `<circle cx="${rp[i][0]}" cy="${rp[i][1]}" r="2" fill="${sf}" opacity="0.5" filter="url(#gf)"/>`;
    }
    const headY = h * 0.26;
    const runeChars = ['\u16B1', '\u16A0', '\u16A6'];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const orbitR = 30;
      const ox = cx + Math.cos(angle) * orbitR;
      const oy = headY + Math.sin(angle) * orbitR * 0.4;
      s += `<rect x="${ox - 4}" y="${oy - 5}" width="8" height="10" rx="1" fill="${arm}99" stroke="${rc}" stroke-width="0.8" opacity="0.7" style="animation:float ${2 + i * 0.4}s ease-in-out infinite"/>`;
      s += `<text x="${ox}" y="${oy + 3}" font-size="7" fill="${sf}" text-anchor="middle" opacity="0.8" font-family="serif" style="animation:rune ${1.5 + i * 0.3}s infinite">${runeChars[i]}</text>`;
    }
    const beardY = h * 0.35;
    for (let i = 0; i < 4; i++) {
      s += `<line x1="${cx - 10 + i * 5}" y1="${beardY + 4}" x2="${cx - 12 + i * 5}" y2="${beardY + 20}" stroke="${isRev ? '#7fffd4' : '#c0c0c0'}" stroke-width="1" opacity="${0.2 + i * 0.05}"/>`;
    }
  }

  return s;
}

// --- HAKAAN ---
function hakaanThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, _acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.40;
  const pc = isRev ? '#7fffd4' : '#800080';
  const pc2 = isRev ? '#5ac8a8' : '#b040d0';

  if (level >= 1) {
    const armY = h * 0.48;
    for (let i = 0; i < 2 + Math.floor(level / 2); i++) {
      const y = armY + i * 8;
      s += `<line x1="${cx - 42}" y1="${y}" x2="${cx - 34}" y2="${y + 5}" stroke="${isRev ? '#5ac8a8' : '#8b6c42'}" stroke-width="1.2" opacity="0.4"/>`;
      s += `<line x1="${cx - 34}" y1="${y}" x2="${cx - 42}" y2="${y + 5}" stroke="${isRev ? '#5ac8a8' : '#8b6c42'}" stroke-width="1.2" opacity="0.4"/>`;
      s += `<line x1="${cx + 34}" y1="${y}" x2="${cx + 42}" y2="${y + 5}" stroke="${isRev ? '#5ac8a8' : '#8b6c42'}" stroke-width="1.2" opacity="0.4"/>`;
      s += `<line x1="${cx + 42}" y1="${y}" x2="${cx + 34}" y2="${y + 5}" stroke="${isRev ? '#5ac8a8' : '#8b6c42'}" stroke-width="1.2" opacity="0.4"/>`;
    }
    const eyeY = ty + 20;
    for (let side = -1; side <= 1; side += 2) {
      const ex = cx + side * 24;
      s += `<ellipse cx="${ex}" cy="${eyeY}" rx="4" ry="2.5" fill="none" stroke="${pc}" stroke-width="0.8" opacity="0.4"/>`;
      s += `<circle cx="${ex}" cy="${eyeY}" r="1.2" fill="${pc}" opacity="0.4"/>`;
    }
  }

  if (level >= 4) {
    const eyeY = h * 0.19;
    const rayLen = 8 + level * 2;
    s += `<line x1="${cx - 6}" y1="${eyeY}" x2="${cx - rayLen}" y2="${eyeY - rayLen * 0.6}" stroke="${pc}" stroke-width="0.8" opacity="0.25" style="animation:soulPulse 2s infinite"/>`;
    s += `<line x1="${cx + 6}" y1="${eyeY}" x2="${cx + rayLen}" y2="${eyeY - rayLen * 0.6}" stroke="${pc}" stroke-width="0.8" opacity="0.25" style="animation:soulPulse 2.3s infinite"/>`;
    s += `<line x1="${cx}" y1="${eyeY - 5}" x2="${cx}" y2="${eyeY - rayLen}" stroke="${pc}" stroke-width="0.8" opacity="0.3" style="animation:soulPulse 1.8s infinite"/>`;
    const spiralY = ty + 14;
    s += `<path d="M${cx - 18},${spiralY} Q${cx - 14},${spiralY - 6} ${cx - 10},${spiralY} Q${cx - 14},${spiralY + 4} ${cx - 16},${spiralY + 2}" stroke="${pc}" stroke-width="0.8" fill="none" opacity="0.3"/>`;
    s += `<path d="M${cx + 18},${spiralY} Q${cx + 14},${spiralY - 6} ${cx + 10},${spiralY} Q${cx + 14},${spiralY + 4} ${cx + 16},${spiralY + 2}" stroke="${pc}" stroke-width="0.8" fill="none" opacity="0.3"/>`;
    for (let side = -1; side <= 1; side += 2) {
      const crystX = cx + side * 48;
      const crystY = h * 0.38;
      s += `<polygon points="${crystX},${crystY} ${crystX + side * 4},${crystY - 10 - level} ${crystX + side * 2},${crystY - 2}" fill="${pc2}" opacity="${0.4 + level * 0.04}" filter="url(#gf)"/>`;
      s += `<polygon points="${crystX + side * 3},${crystY + 2} ${crystX + side * 8},${crystY - 8 - level * 0.5} ${crystX + side * 5},${crystY}" fill="${pc2}" opacity="${0.3 + level * 0.03}" filter="url(#gf)"/>`;
    }
  }

  if (level >= 7) {
    const headY = h * 0.25;
    for (let i = 0; i < 2; i++) {
      const r = 20 + i * 6;
      s += `<ellipse cx="${cx}" cy="${headY}" rx="${r}" ry="${r * 0.3}" fill="none" stroke="${pc}" stroke-width="${1 - i * 0.3}" opacity="${0.15 - i * 0.04}" style="animation:rune ${2 + i * 0.5}s infinite"/>`;
    }
    for (let side = -1; side <= 1; side += 2) {
      const crystX = cx + side * 50;
      const crystY = h * 0.35;
      s += `<polygon points="${crystX},${crystY + 4} ${crystX + side * 6},${crystY - 18 - level} ${crystX + side * 2},${crystY}" fill="${pc2}" opacity="0.5" filter="url(#gf)"/>`;
      s += `<polygon points="${crystX + side * 4},${crystY + 6} ${crystX + side * 10},${crystY - 14 - level * 0.5} ${crystX + side * 6},${crystY + 2}" fill="${pc2}" opacity="0.4" filter="url(#gf)"/>`;
      s += `<polygon points="${crystX + side * 8},${crystY + 8} ${crystX + side * 14},${crystY - 10} ${crystX + side * 10},${crystY + 4}" fill="${pc2}" opacity="0.3" filter="url(#gf)"/>`;
    }
    for (let i = 0; i < Math.min(level - 5, 4); i++) {
      const angle = (i / 4) * Math.PI * 2;
      const orbitR = 35 + i * 4;
      const ox = cx + Math.cos(angle) * orbitR;
      const oy = headY + Math.sin(angle) * orbitR * 0.4;
      s += `<polygon points="${ox},${oy - 5} ${ox + 3},${oy} ${ox},${oy + 5} ${ox - 3},${oy}" fill="${pc2}" opacity="0.4" style="animation:float ${2 + i * 0.3}s ease-in-out infinite" filter="url(#gf)"/>`;
    }
    if (level >= 8) {
      const eyeY2 = h * 0.19;
      const beamH = 20 + (level - 8) * 10;
      s += `<line x1="${cx}" y1="${eyeY2}" x2="${cx}" y2="${eyeY2 - beamH}" stroke="${pc}" stroke-width="${1.5 + (level - 8) * 0.5}" opacity="0.3" style="animation:soulPulse 1.5s infinite" filter="url(#gf)"/>`;
      s += `<circle cx="${cx}" cy="${eyeY2 - beamH}" r="${3 + (level - 8) * 2}" fill="${pc}" opacity="0.15" filter="url(#gf)" style="animation:rune 2s infinite"/>`;
    }
  }

  return s;
}

// --- HIGH ELF ---
function highElfThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, _acc: string, sf: string, arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.38;
  const sc = isRev ? '#7fffd4' : '#e8d0ff';
  const mc = isRev ? '#5ac8a8' : '#c0b0e0';

  if (level >= 1) {
    const starPositions: number[][] = [
      [cx - 16, ty + 14], [cx + 14, ty + 18], [cx - 8, ty + 32],
      [cx + 18, ty + 28], [cx, ty + 44]
    ];
    const numStars = Math.min(2 + level, starPositions.length);
    for (let i = 0; i < numStars; i++) {
      const [sx, sy] = starPositions[i];
      const sr = 1.5 + level * 0.2;
      s += `<path d="M${sx},${sy - sr} L${sx + sr * 0.4},${sy - sr * 0.4} L${sx + sr},${sy} L${sx + sr * 0.4},${sy + sr * 0.4} L${sx},${sy + sr} L${sx - sr * 0.4},${sy + sr * 0.4} L${sx - sr},${sy} L${sx - sr * 0.4},${sy - sr * 0.4}Z" fill="${sc}" opacity="${0.3 + level * 0.05}"/>`;
    }
    if (level >= 2) {
      s += `<path d="M${cx + 22},${ty + h * 0.22} Q${cx + 26},${ty + h * 0.3} ${cx + 20},${ty + h * 0.38}" stroke="${mc}" stroke-width="1" fill="none" opacity="0.25"/>`;
    }
  }

  if (level >= 4) {
    const moonY = ty + 16;
    const moonR = 6 + level * 0.4;
    s += `<circle cx="${cx}" cy="${moonY}" r="${moonR}" fill="none" stroke="${mc}" stroke-width="1" opacity="0.4"/>`;
    s += `<circle cx="${cx + moonR * 0.3}" cy="${moonY - moonR * 0.2}" r="${moonR * 0.7}" fill="${arm}" opacity="0.8"/>`;
    for (let i = 0; i < 4 + level; i++) {
      const sx = cx - 30 + (i * 7) % 60;
      const sy = ty + 10 + (i * 11) % 40;
      s += `<circle cx="${sx}" cy="${sy}" r="${0.5 + (i % 3) * 0.5}" fill="${sc}" opacity="${0.15 + (i % 3) * 0.08}"/>`;
    }
    const scrollY = ty + 6;
    s += `<path d="M${cx - 20},${scrollY} Q${cx - 16},${scrollY - 4} ${cx - 12},${scrollY} Q${cx - 8},${scrollY + 4} ${cx - 4},${scrollY}" stroke="${mc}" stroke-width="0.8" fill="none" opacity="0.35"/>`;
    s += `<path d="M${cx + 4},${scrollY} Q${cx + 8},${scrollY - 4} ${cx + 12},${scrollY} Q${cx + 16},${scrollY + 4} ${cx + 20},${scrollY}" stroke="${mc}" stroke-width="0.8" fill="none" opacity="0.35"/>`;
    const beltY = ty + h * 0.25;
    s += `<path d="M${cx - 20},${beltY} Q${cx - 14},${beltY - 3} ${cx - 8},${beltY} Q${cx - 2},${beltY + 3} ${cx + 4},${beltY}" stroke="${mc}" stroke-width="0.6" fill="none" opacity="0.3"/>`;
  }

  if (level >= 7) {
    const headY = h * 0.20;
    const haloR = 26 + level;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const hx = cx + Math.cos(angle) * haloR;
      const hy = headY + Math.sin(angle) * haloR * 0.35;
      const sr = 1.5 + (i % 2);
      s += `<path d="M${hx},${hy - sr} L${hx + sr * 0.3},${hy} L${hx},${hy + sr} L${hx - sr * 0.3},${hy}Z" fill="${sc}" opacity="${0.4 + (i % 3) * 0.1}" style="animation:soulPulse ${2 + i * 0.2}s infinite"/>`;
    }
    s += `<line x1="${cx}" y1="${h * 0.02}" x2="${cx}" y2="${h * 0.95}" stroke="${mc}" stroke-width="2" opacity="0.06" style="animation:soulPulse 3s infinite"/>`;
    s += `<line x1="${cx}" y1="${h * 0.05}" x2="${cx}" y2="${h * 0.9}" stroke="white" stroke-width="0.5" opacity="0.04"/>`;
    if (level >= 8) {
      const constellationPts: number[][] = [
        [cx, ty + 16], [cx - 20, ty + 8], [cx + 20, ty + 8],
        [cx - 32, ty - 10], [cx + 32, ty - 10], [cx, h * 0.2]
      ];
      for (let i = 0; i < constellationPts.length - 1; i++) {
        const [x1, y1] = constellationPts[i];
        const [x2, y2] = constellationPts[i + 1];
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${sc}" stroke-width="0.5" opacity="0.2" style="animation:rune ${2 + i * 0.3}s infinite"/>`;
        s += `<circle cx="${x1}" cy="${y1}" r="1.5" fill="${sf}" opacity="0.5" filter="url(#gf)"/>`;
      }
      s += `<circle cx="${constellationPts[constellationPts.length - 1][0]}" cy="${constellationPts[constellationPts.length - 1][1]}" r="1.5" fill="${sf}" opacity="0.5" filter="url(#gf)"/>`;
    }
    if (level >= 9) {
      s += `<circle cx="${cx}" cy="${h * 0.18}" r="18" fill="${mc}" opacity="0.06" filter="url(#gf)" style="animation:soulPulse 3s infinite"/>`;
      s += `<circle cx="${cx}" cy="${h * 0.18}" r="12" fill="white" opacity="0.04" filter="url(#gf)"/>`;
    }
  }

  return s;
}

// --- MEMONEK ---
function memonekThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, _acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.38;
  const gc = isRev ? '#7fffd4' : '#0288d1';
  const gc2 = isRev ? '#5ac8a8' : '#4fc3f7';

  if (level >= 1) {
    const shapes = [
      { x: cx - 38, y: ty - 4, type: 'tri' },
      { x: cx + 38, y: ty - 6, type: 'tri' },
      { x: cx - 44, y: ty + 8, type: 'hex' },
      { x: cx + 44, y: ty + 6, type: 'hex' }
    ];
    const numShapes = Math.min(1 + level, shapes.length);
    for (let i = 0; i < numShapes; i++) {
      const sh = shapes[i];
      const sz = 3 + level * 0.3;
      if (sh.type === 'tri') {
        s += `<polygon points="${sh.x},${sh.y - sz} ${sh.x + sz},${sh.y + sz * 0.6} ${sh.x - sz},${sh.y + sz * 0.6}" fill="none" stroke="${gc}" stroke-width="0.8" opacity="${0.35 + level * 0.05}" style="animation:float ${2 + i * 0.4}s ease-in-out infinite"/>`;
      } else {
        let hex = '';
        for (let j = 0; j < 6; j++) {
          const a = (j / 6) * Math.PI * 2 - Math.PI / 2;
          hex += `${sh.x + Math.cos(a) * sz},${sh.y + Math.sin(a) * sz} `;
        }
        s += `<polygon points="${hex.trim()}" fill="none" stroke="${gc}" stroke-width="0.8" opacity="${0.3 + level * 0.04}" style="animation:float ${2.2 + i * 0.3}s ease-in-out infinite"/>`;
      }
    }
  }

  if (level >= 4) {
    s += `<path d="M${cx - 36},${ty + 4} L${cx - 24},${ty + 10} L${cx - 14},${ty + 16}" stroke="${gc}" stroke-width="1" fill="none" opacity="0.35" style="animation:rune 2s infinite"/>`;
    s += `<path d="M${cx + 36},${ty + 4} L${cx + 24},${ty + 10} L${cx + 14},${ty + 16}" stroke="${gc}" stroke-width="1" fill="none" opacity="0.35" style="animation:rune 2.2s infinite"/>`;
    s += `<line x1="${cx - 8}" y1="${ty + h * 0.22}" x2="${cx - 12}" y2="${ty + h * 0.34}" stroke="${gc}" stroke-width="0.8" opacity="0.3" style="animation:rune 2.5s infinite"/>`;
    s += `<line x1="${cx + 8}" y1="${ty + h * 0.22}" x2="${cx + 12}" y2="${ty + h * 0.34}" stroke="${gc}" stroke-width="0.8" opacity="0.3" style="animation:rune 2.5s infinite"/>`;
    s += `<circle cx="${cx - 14}" cy="${ty + 16}" r="2" fill="${gc}" opacity="0.5" filter="url(#gf)"/>`;
    s += `<circle cx="${cx + 14}" cy="${ty + 16}" r="2" fill="${gc}" opacity="0.5" filter="url(#gf)"/>`;
    for (let side = -1; side <= 1; side += 2) {
      const bx = cx + side * 42;
      const by = ty - 2;
      s += `<polygon points="${bx},${by} ${bx + side * 5},${by - 10 - level} ${bx + side * 2},${by - 2}" fill="${gc2}" opacity="${0.3 + level * 0.03}" filter="url(#gf)"/>`;
      s += `<polygon points="${bx + side * 3},${by + 2} ${bx + side * 8},${by - 6 - level * 0.5} ${bx + side * 5},${by}" fill="${gc2}" opacity="${0.25 + level * 0.02}" filter="url(#gf)"/>`;
    }
  }

  if (level >= 7) {
    const centerY = h * 0.45;
    const orbitCount = Math.min(level - 4, 5);
    for (let i = 0; i < orbitCount; i++) {
      const angle = (i / orbitCount) * Math.PI * 2;
      const orbitR = 40 + i * 3;
      const ox = cx + Math.cos(angle) * orbitR;
      const oy = centerY + Math.sin(angle) * orbitR * 0.3;
      const sz = 3 + level * 0.2;
      s += `<polygon points="${ox},${oy - sz} ${ox + sz},${oy} ${ox},${oy + sz} ${ox - sz},${oy}" fill="${gc2}" opacity="0.3" style="animation:float ${1.8 + i * 0.3}s ease-in-out infinite" filter="url(#gf)"/>`;
    }
    for (let col = 0; col < 3; col++) {
      const dx = cx - 20 + col * 20;
      for (let row = 0; row < 5 + level; row++) {
        const dy = h * 0.15 + row * 8;
        if (dy > h * 0.9) break;
        s += `<circle cx="${dx}" cy="${dy}" r="${0.5 + (row % 3) * 0.3}" fill="${gc}" opacity="${0.08 + (row % 4) * 0.03}" style="animation:emberDrift ${1.5 + row * 0.2}s linear infinite; animation-delay:${col * 0.3}s"/>`;
      }
    }
    s += `<polygon points="${cx},${centerY - 18} ${cx + 18},${centerY} ${cx},${centerY + 18} ${cx - 18},${centerY}" fill="none" stroke="${gc}" stroke-width="0.6" opacity="0.1" style="animation:rune 3s infinite"/>`;
    if (level >= 9) {
      let hexPts = '';
      const hexR = 22;
      for (let j = 0; j < 6; j++) {
        const a = (j / 6) * Math.PI * 2;
        hexPts += `${cx + Math.cos(a) * hexR},${centerY + Math.sin(a) * hexR * 0.35} `;
      }
      s += `<polygon points="${hexPts.trim()}" fill="none" stroke="${gc2}" stroke-width="0.8" opacity="0.08" style="animation:rune 2.5s infinite"/>`;
      s += `<circle cx="${cx}" cy="${centerY}" r="6" fill="${gc}" opacity="0.1" filter="url(#gf)" style="animation:soulPulse 1s infinite"/>`;
    }
  }

  return s;
}

// --- ORC ---
function orcThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, _acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.38;
  const hx = cx, hy = h * 0.2;
  const wpc = isRev ? '#7fffd4' : '#ff5722';
  const bc = isRev ? '#5ac8a8' : '#e0d8c8';

  if (level >= 1) {
    s += `<path d="M${hx - 18},${hy - 6} L${hx - 15},${hy - 2} L${hx - 18},${hy + 2} L${hx - 15},${hy + 6}" stroke="${wpc}" stroke-width="${1.2 + level * 0.1}" fill="none" opacity="0.5"/>`;
    s += `<path d="M${hx + 18},${hy - 6} L${hx + 15},${hy - 2} L${hx + 18},${hy + 2} L${hx + 15},${hy + 6}" stroke="${wpc}" stroke-width="${1.2 + level * 0.1}" fill="none" opacity="0.5"/>`;
    const beltY = ty + h * 0.25;
    s += `<ellipse cx="${cx - 18}" cy="${beltY + 6}" rx="4" ry="5" fill="${bc}" opacity="0.5"/>`;
    s += `<circle cx="${cx - 20}" cy="${beltY + 4}" r="1" fill="${isRev ? '#1a3028' : '#1a0e06'}" opacity="0.5"/>`;
    s += `<circle cx="${cx - 16}" cy="${beltY + 4}" r="1" fill="${isRev ? '#1a3028' : '#1a0e06'}" opacity="0.5"/>`;
  }

  if (level >= 4) {
    const armPaintY = ty + 14;
    for (let i = 0; i < 3; i++) {
      const y = armPaintY + i * 10;
      s += `<line x1="${cx - 40}" y1="${y}" x2="${cx - 32}" y2="${y + 3}" stroke="${wpc}" stroke-width="1.5" opacity="0.4"/>`;
      s += `<line x1="${cx - 32}" y1="${y + 3}" x2="${cx - 40}" y2="${y + 6}" stroke="${wpc}" stroke-width="1.5" opacity="0.4"/>`;
      s += `<line x1="${cx + 32}" y1="${y}" x2="${cx + 40}" y2="${y + 3}" stroke="${wpc}" stroke-width="1.5" opacity="0.4"/>`;
      s += `<line x1="${cx + 40}" y1="${y + 3}" x2="${cx + 32}" y2="${y + 6}" stroke="${wpc}" stroke-width="1.5" opacity="0.4"/>`;
    }
    const pY = ty + 4;
    for (let side = -1; side <= 1; side += 2) {
      const px = cx + side * 40;
      s += `<ellipse cx="${px}" cy="${pY - 10}" rx="5" ry="6" fill="${bc}" opacity="0.5"/>`;
      s += `<circle cx="${px - 2}" cy="${pY - 12}" r="1" fill="${isRev ? '#0d2220' : '#1a0e06'}" opacity="0.5"/>`;
      s += `<circle cx="${px + 2}" cy="${pY - 12}" r="1" fill="${isRev ? '#0d2220' : '#1a0e06'}" opacity="0.5"/>`;
      s += `<path d="M${px - 3},${pY - 6} Q${px},${pY - 3} ${px + 3},${pY - 6}" stroke="${bc}" stroke-width="0.8" fill="none" opacity="0.4"/>`;
    }
    const neckY = ty - 2;
    for (let i = 0; i < 5; i++) {
      const bx = cx - 12 + i * 6;
      s += `<ellipse cx="${bx}" cy="${neckY}" rx="2" ry="3" fill="${bc}" opacity="${0.35 + i * 0.04}"/>`;
    }
  }

  if (level >= 7) {
    s += `<line x1="${hx - 22}" y1="${hy - 14}" x2="${hx - 10}" y2="${hy + 10}" stroke="${wpc}" stroke-width="2.5" opacity="0.35"/>`;
    s += `<line x1="${hx + 22}" y1="${hy - 14}" x2="${hx + 10}" y2="${hy + 10}" stroke="${wpc}" stroke-width="2.5" opacity="0.35"/>`;
    s += `<path d="M${hx - 8},${hy - 16} L${hx},${hy - 20} L${hx + 8},${hy - 16}" stroke="${wpc}" stroke-width="2" fill="none" opacity="0.4"/>`;
    s += `<line x1="${cx - 18}" y1="${ty + 10}" x2="${cx - 12}" y2="${ty + 30}" stroke="${wpc}" stroke-width="1.5" opacity="0.3"/>`;
    s += `<line x1="${cx + 18}" y1="${ty + 10}" x2="${cx + 12}" y2="${ty + 30}" stroke="${wpc}" stroke-width="1.5" opacity="0.3"/>`;
    const rackY = ty - 8;
    for (let i = 0; i < 3; i++) {
      const bx = cx - 12 + i * 12;
      s += `<rect x="${bx - 1}" y="${rackY - 16 - i * 4}" width="2" height="${14 + i * 2}" rx="1" fill="${bc}" opacity="0.4" transform="rotate(${-10 + i * 10},${bx},${rackY})"/>`;
    }
    s += `<rect x="${cx - 16}" y="${rackY - 8}" width="32" height="2" rx="1" fill="${bc}" opacity="0.35"/>`;
    if (level >= 8) {
      const rageColor = isRev ? '#7fffd4' : '#ff2200';
      s += `<ellipse cx="${cx}" cy="${ty + 20}" rx="18" ry="14" fill="${rageColor}" opacity="${0.05 + (level - 7) * 0.02}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
    }
    if (level >= 9) {
      for (let i = 0; i < 2; i++) {
        const bx = cx - 20 + i * 40;
        s += `<rect x="${bx}" y="${rackY - 24 - i * 3}" width="2.5" height="${18 + i * 2}" rx="1" fill="${bc}" opacity="0.35" transform="rotate(${-15 + i * 30},${bx},${rackY - 10})"/>`;
      }
    }
  }

  return s;
}

// --- POLDER ---
function polderThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.39;
  const sc = isRev ? '#7fffd4' : '#1a1a2e';
  const sc2 = isRev ? '#5ac8a8' : '#0d0d1a';

  if (level >= 1) {
    const footY = h * 0.92;
    for (let i = 0; i < 2 + level; i++) {
      const wx = cx - 16 + i * 8;
      s += `<path d="M${wx},${footY} Q${wx + 2},${footY - 8 - i * 2} ${wx - 1},${footY - 14 - i * 3}" stroke="${sc}" stroke-width="${1 + i * 0.2}" fill="none" opacity="${0.2 + i * 0.04}" style="animation:emberDrift ${2 + i * 0.4}s ease-out infinite"/>`;
    }
    const beltY = ty + h * 0.24;
    s += `<rect x="${cx + 14}" y="${beltY + 1}" width="6" height="7" rx="1.5" fill="${isRev ? '#0a1a15' : '#3e2010'}" opacity="0.6"/>`;
    s += `<line x1="${cx + 14}" y1="${beltY + 3}" x2="${cx + 20}" y2="${beltY + 3}" stroke="${isRev ? acc : '#5d3a1a'}" stroke-width="0.8" opacity="0.5"/>`;
    if (level >= 2) {
      s += `<line x1="${cx - 18}" y1="${beltY + 2}" x2="${cx - 18}" y2="${beltY + 10}" stroke="${isRev ? '#5ac8a8' : '#808080'}" stroke-width="1" opacity="0.4"/>`;
      s += `<circle cx="${cx - 18}" cy="${beltY + 2}" r="1.5" fill="${isRev ? '#5ac8a8' : '#a0a0a0'}" opacity="0.4"/>`;
    }
  }

  if (level >= 4) {
    const cloakY = h * 0.72;
    for (let i = 0; i < 4; i++) {
      const px = cx - 18 + i * 12;
      s += `<path d="M${px},${cloakY} Q${px + 3},${cloakY + 8 + i * 2} ${px - 2},${cloakY + 14 + i * 3}" stroke="${sc}" stroke-width="${1.5 + i * 0.3}" fill="none" opacity="${0.2 + i * 0.04}" style="animation:soulPulse ${2.5 + i * 0.3}s infinite"/>`;
    }
    for (let side = -1; side <= 1; side += 2) {
      const shx = cx + side * 28;
      const shy = ty + 16;
      s += `<rect x="${shx - 1}" y="${shy}" width="2" height="14" rx="0.5" fill="${isRev ? '#1a3a30' : '#2a2a2a'}" opacity="0.5"/>`;
      s += `<line x1="${shx}" y1="${shy}" x2="${shx}" y2="${shy + 14}" stroke="${isRev ? acc : '#606060'}" stroke-width="0.5" opacity="0.4"/>`;
    }
    const beltY = ty + h * 0.24;
    for (let i = 0; i < 2; i++) {
      s += `<circle cx="${cx - 10 + i * 6}" cy="${beltY + 8}" r="3" fill="${isRev ? '#0d2a20' : '#2d2d2d'}" opacity="0.4"/>`;
      s += `<circle cx="${cx - 10 + i * 6}" cy="${beltY + 6}" r="1" fill="${isRev ? acc : '#808080'}" opacity="0.3"/>`;
    }
  }

  if (level >= 7) {
    const wreathY = h * 0.85;
    s += `<ellipse cx="${cx}" cy="${wreathY}" rx="${18 + level}" ry="${6 + level * 0.5}" fill="${sc2}" opacity="${0.12 + level * 0.015}" style="animation:soulPulse 2.5s infinite"/>`;
    for (let i = 0; i < 3; i++) {
      const tx = cx - 14 + i * 14;
      s += `<path d="M${tx},${wreathY} Q${tx + 3},${wreathY - 12} ${tx - 2},${wreathY - 20}" stroke="${sc}" stroke-width="1.5" fill="none" opacity="${0.15 + i * 0.03}" style="animation:emberDrift ${2 + i * 0.3}s ease-out infinite"/>`;
    }
    const phaseOp = 0.06 + (level - 7) * 0.02;
    s += `<rect x="${cx - 23}" y="${ty - 2}" width="46" height="${h * 0.29 + 4}" rx="8" fill="${sc}" opacity="${phaseOp}" transform="translate(3,-2)"/>`;
    s += `<ellipse cx="${cx + 3}" cy="${h * 0.2 - 2}" rx="20" ry="22" fill="${sc}" opacity="${phaseOp}"/>`;
    for (let i = 0; i < Math.min(level - 5, 3); i++) {
      const dx = cx - 40 + i * 35;
      const dy = ty - 10 + i * 12;
      const dRot = -30 + i * 25;
      s += `<g transform="rotate(${dRot},${dx},${dy})" opacity="${0.35 + i * 0.05}" style="animation:float ${1.8 + i * 0.4}s ease-in-out infinite">`;
      s += `<polygon points="${dx},${dy - 10} ${dx + 2},${dy} ${dx},${dy + 2} ${dx - 2},${dy}" fill="${isRev ? '#7fffd4' : '#404060'}"/>`;
      s += `<rect x="${dx - 1}" y="${dy + 2}" width="2" height="6" rx="0.5" fill="${isRev ? '#5ac8a8' : '#303050'}"/>`;
      s += `</g>`;
    }
    if (level >= 9) {
      s += `<ellipse cx="${cx}" cy="${wreathY}" rx="${34 + level * 2}" ry="${18 + level}" fill="${sc2}" opacity="0.1" style="animation:soulPulse 2s infinite"/>`;
    }
  }

  return s;
}

// --- REVENANT ---
function revenantThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, _acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.38;
  const sfc = '#7fffd4';
  const sfc2 = '#5ac8a8';

  if (level >= 1) {
    for (let i = 0; i < 2 + level; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const wx = cx + side * (30 + i * 3);
      const wy = ty + 4;
      s += `<circle cx="${wx}" cy="${wy - 6 - i * 4}" r="${1.5 + i * 0.3}" fill="${sfc}" opacity="${0.25 - i * 0.04}" style="animation:emberDrift ${1.8 + i * 0.3}s ease-out infinite; animation-delay:${i * 0.3}s" filter="url(#gf)"/>`;
    }
    const gapY = ty + h * 0.15;
    s += `<line x1="${cx - 16}" y1="${gapY}" x2="${cx - 14}" y2="${gapY + 8}" stroke="${sfc2}" stroke-width="1.5" opacity="0.2"/>`;
    s += `<line x1="${cx + 14}" y1="${gapY + 2}" x2="${cx + 16}" y2="${gapY + 10}" stroke="${sfc2}" stroke-width="1.5" opacity="0.2"/>`;
    if (level >= 2) {
      s += `<path d="M${cx - 10},${gapY + 4} Q${cx},${gapY + 2} ${cx + 10},${gapY + 4}" stroke="${sfc2}" stroke-width="1" fill="none" opacity="0.15"/>`;
    }
  }

  if (level >= 4) {
    for (let side = -1; side <= 1; side += 2) {
      const wx = cx + side * 36;
      const wy = ty + h * 0.22;
      for (let i = 0; i < 4; i++) {
        s += `<ellipse cx="${wx + side * i * 3}" cy="${wy + i * 5}" rx="3" ry="4" fill="none" stroke="${sfc}" stroke-width="1" opacity="${0.3 - i * 0.05}" style="animation:soulPulse ${2 + i * 0.2}s infinite"/>`;
      }
    }
    s += `<path d="M${cx - 18},${ty + 8} Q${cx},${ty + 16} ${cx + 18},${ty + 8}" stroke="${sfc}" stroke-width="1" fill="none" opacity="0.2" style="animation:soulPulse 2.5s infinite"/>`;
    const eyeY = h * 0.22;
    s += `<path d="M${cx - 14},${eyeY} Q${cx - 18},${eyeY - 8} ${cx - 14},${eyeY - 14}" stroke="${sfc}" stroke-width="1.5" fill="none" opacity="0.3" style="animation:emberDrift 1.5s ease-out infinite" filter="url(#gf)"/>`;
    s += `<path d="M${cx + 14},${eyeY} Q${cx + 18},${eyeY - 8} ${cx + 14},${eyeY - 14}" stroke="${sfc}" stroke-width="1.5" fill="none" opacity="0.3" style="animation:emberDrift 1.8s ease-out infinite" filter="url(#gf)"/>`;
    for (let i = 0; i < 3 + level; i++) {
      const gx = cx - 20 + (i * 11) % 40;
      const gy = h * 0.88 + (i * 7) % 12;
      s += `<rect x="${gx}" y="${gy}" width="${1.5 + i % 2}" height="${1 + i % 2}" fill="${isRev ? '#2a5540' : '#4a3a2a'}" opacity="${0.2 + i * 0.02}" style="animation:emberDrift ${3 + i * 0.3}s linear infinite"/>`;
    }
  }

  if (level >= 7) {
    s += `<ellipse cx="${cx}" cy="${ty + 18}" rx="20" ry="16" fill="${sfc}" opacity="${0.06 + (level - 7) * 0.02}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
    for (let i = 0; i < Math.min(level - 5, 5); i++) {
      const angle = (i / 5) * Math.PI * 2;
      const fragR = 36 + i * 4;
      const fx = cx + Math.cos(angle) * fragR;
      const fy = h * 0.35 + Math.sin(angle) * fragR * 0.4;
      s += `<circle cx="${fx}" cy="${fy}" r="${2 + i * 0.3}" fill="${sfc}" opacity="${0.2 + i * 0.04}" style="animation:float ${2 + i * 0.3}s ease-in-out infinite; animation-delay:${i * 0.4}s" filter="url(#gf)"/>`;
    }
    for (let side = -1; side <= 1; side += 2) {
      const wx = cx + side * 38;
      const wy = ty + h * 0.2;
      for (let i = 0; i < 6; i++) {
        s += `<ellipse cx="${wx + side * Math.sin(i * 0.8) * 3}" cy="${wy + i * 5}" rx="3.5" ry="4.5" fill="none" stroke="${sfc}" stroke-width="1.2" opacity="${0.3 - i * 0.03}" style="animation:soulPulse ${1.5 + i * 0.15}s infinite; animation-delay:${i * 0.1}s"/>`;
      }
    }
    if (level >= 9) {
      const jawY = h * 0.33;
      s += `<path d="M${cx - 14},${jawY} Q${cx},${jawY + 6 + (level - 9) * 3} ${cx + 14},${jawY}" stroke="${sfc2}" stroke-width="1.5" fill="none" opacity="0.4"/>`;
      s += `<path d="M${cx},${jawY + 4} Q${cx - 4},${jawY + 12} ${cx + 2},${jawY + 18}" stroke="${sfc}" stroke-width="2" fill="none" opacity="0.25" style="animation:emberDrift 1.5s ease-out infinite" filter="url(#gf)"/>`;
      s += `<ellipse cx="${cx}" cy="${h * 0.22}" rx="8" ry="6" fill="${sfc}" opacity="0.08" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    }
  }

  return s;
}

// --- TIME RAIDER ---
function timeRaiderThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, _acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.39;
  const tc = isRev ? '#7fffd4' : '#ffcc02';
  const tc2 = isRev ? '#5ac8a8' : '#ff9800';

  if (level >= 1) {
    const hgY = ty + 12;
    const hgS = 4 + level * 0.3;
    s += `<polygon points="${cx - hgS},${hgY - hgS} ${cx + hgS},${hgY - hgS} ${cx},${hgY} ${cx + hgS},${hgY + hgS} ${cx - hgS},${hgY + hgS} ${cx},${hgY}" fill="none" stroke="${tc}" stroke-width="${0.8 + level * 0.1}" opacity="0.4"/>`;
    s += `<circle cx="${cx}" cy="${hgY - hgS * 0.3}" r="1" fill="${tc}" opacity="0.3"/>`;
    s += `<circle cx="${cx}" cy="${hgY + hgS * 0.5}" r="0.8" fill="${tc}" opacity="0.25"/>`;
    for (let i = 0; i < 2 + level; i++) {
      const sx = cx - 20 + i * 10;
      const sy = ty + 4 + (i * 7) % 20;
      s += `<line x1="${sx}" y1="${sy}" x2="${sx + 1}" y2="${sy + 8 + level}" stroke="${tc}" stroke-width="0.6" opacity="${0.12 + i * 0.02}" style="animation:rune ${2 + i * 0.3}s infinite"/>`;
    }
  }

  if (level >= 4) {
    const echoOp = 0.04 + (level - 4) * 0.015;
    s += `<ellipse cx="${cx + 4}" cy="${h * 0.25 - 2}" rx="24" ry="26" fill="${tc}" opacity="${echoOp}"/>`;
    s += `<rect x="${cx - 22 + 4}" y="${ty - 2}" width="44" height="${h * 0.29}" rx="8" fill="${tc}" opacity="${echoOp}"/>`;
    const clockY = ty + 8;
    for (let side = -1; side <= 1; side += 2) {
      const clkX = cx + side * 22;
      const clkR = 6 + level * 0.3;
      s += `<circle cx="${clkX}" cy="${clockY}" r="${clkR}" fill="none" stroke="${tc}" stroke-width="0.8" opacity="0.3"/>`;
      s += `<line x1="${clkX}" y1="${clockY}" x2="${clkX}" y2="${clockY - clkR * 0.7}" stroke="${tc}" stroke-width="0.8" opacity="0.4" style="animation:rune 2s infinite"/>`;
      s += `<line x1="${clkX}" y1="${clockY}" x2="${clkX + clkR * 0.5}" y2="${clockY}" stroke="${tc2}" stroke-width="0.6" opacity="0.3"/>`;
    }
    for (let i = 0; i < 2; i++) {
      const waveR = 22 + i * 8;
      s += `<path d="M${cx - waveR},${ty + 20} Q${cx},${ty + 20 - waveR * 0.12} ${cx + waveR},${ty + 20}" fill="none" stroke="${tc}" stroke-width="0.6" opacity="${0.08 - i * 0.02}" style="animation:soulPulse ${2.5 + i * 0.5}s infinite"/>`;
    }
  }

  if (level >= 7) {
    for (let i = 0; i < 3; i++) {
      const ringR = 22 + i * 6;
      s += `<ellipse cx="${cx}" cy="${ty + 20}" rx="${ringR}" ry="${ringR * 0.25}" fill="none" stroke="${tc}" stroke-width="${0.8 - i * 0.15}" opacity="${0.1 - i * 0.02}" style="animation:rune ${2 + i * 0.5}s infinite"/>`;
    }
    for (let i = 1; i <= 2; i++) {
      const offsetX = i * 4;
      const trailOp = 0.03 + (level - 7) * 0.01 - i * 0.01;
      if (trailOp > 0) {
        s += `<ellipse cx="${cx - offsetX}" cy="${h * 0.25}" rx="24" ry="26" fill="${tc}" opacity="${trailOp}"/>`;
        s += `<rect x="${cx - 22 - offsetX}" y="${ty}" width="44" height="${h * 0.25}" rx="8" fill="${tc}" opacity="${trailOp}"/>`;
      }
    }
    for (let i = 0; i < Math.min(level - 5, 4); i++) {
      const angle = (i / 4) * Math.PI * 2;
      const shardR = 38 + i * 5;
      const sx = cx + Math.cos(angle) * shardR;
      const sy = h * 0.4 + Math.sin(angle) * shardR * 0.35;
      const shSize = 3 + level * 0.2;
      s += `<polygon points="${sx},${sy - shSize} ${sx + shSize * 0.5},${sy} ${sx},${sy + shSize} ${sx - shSize * 0.5},${sy}" fill="${tc}" opacity="0.25" style="animation:float ${1.8 + i * 0.3}s ease-in-out infinite" filter="url(#gf)"/>`;
    }
    if (level >= 8) {
      for (let i = 0; i < 2 + (level - 8); i++) {
        const crackX = cx - 30 + i * 20;
        const crackY = h * 0.25 + i * 15;
        s += `<path d="M${crackX},${crackY} L${crackX + 4},${crackY + 6} L${crackX - 2},${crackY + 12} L${crackX + 6},${crackY + 18}" stroke="${tc}" stroke-width="1.2" fill="none" opacity="0.2" style="animation:soulPulse ${1.5 + i * 0.3}s infinite"/>`;
        s += `<circle cx="${crackX}" cy="${crackY}" r="2" fill="${tc}" opacity="0.15" filter="url(#gf)"/>`;
      }
    }
    if (level >= 9) {
      s += `<ellipse cx="${cx}" cy="${ty + 20}" rx="30" ry="8" fill="none" stroke="${tc2}" stroke-width="0.8" opacity="0.08" style="animation:rune 1.5s infinite"/>`;
      s += `<circle cx="${cx}" cy="${ty + 16}" r="12" fill="none" stroke="${tc}" stroke-width="1.5" opacity="0.1" style="animation:rune 1s infinite" filter="url(#gf)"/>`;
      s += `<circle cx="${cx}" cy="${ty + 16}" r="8" fill="none" stroke="${tc2}" stroke-width="1" opacity="0.08" style="animation:rune 1.2s infinite"/>`;
    }
  }

  return s;
}

// --- WODE ELF ---
function wodeElfThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, _acc: string, _sf: string, _arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.38;
  const lc = isRev ? '#7fffd4' : '#2e7d32';
  const lc2 = isRev ? '#5ac8a8' : '#81c784';
  const vc = isRev ? '#4ac89a' : '#33691e';
  const bkc = isRev ? '#2a5540' : '#5d4037';

  if (level >= 1) {
    const leafPositions: number[][] = [
      [cx - 14, ty + 12], [cx + 16, ty + 20], [cx - 6, ty + 36],
      [cx + 10, ty + 8], [cx - 18, ty + 28]
    ];
    const numLeaves = Math.min(2 + level, leafPositions.length);
    for (let i = 0; i < numLeaves; i++) {
      const [lx, ly] = leafPositions[i];
      const rot = -20 + i * 15;
      s += `<path d="M${lx},${ly} Q${lx + 4},${ly - 3} ${lx + 8},${ly} Q${lx + 4},${ly + 2} ${lx},${ly}Z" fill="${lc2}" opacity="${0.3 + level * 0.06}" transform="rotate(${rot},${lx + 4},${ly})"/>`;
    }
    if (level >= 2) {
      const armY = ty + 10;
      s += `<path d="M${cx - 36},${armY} Q${cx - 40},${armY + 10} ${cx - 34},${armY + 18} Q${cx - 38},${armY + 24} ${cx - 36},${armY + 30}" stroke="${vc}" stroke-width="1.2" fill="none" opacity="0.35"/>`;
      s += `<path d="M${cx - 34},${armY + 18} Q${cx - 30},${armY + 15} ${cx - 28},${armY + 18} Q${cx - 30},${armY + 20} ${cx - 34},${armY + 18}Z" fill="${lc2}" opacity="0.3"/>`;
    }
  }

  if (level >= 4) {
    s += `<path d="M${cx - 22},${ty + 6} Q${cx - 18},${ty + 14} ${cx - 14},${ty + 10} Q${cx - 10},${ty + 18} ${cx - 6},${ty + 14}" stroke="${vc}" stroke-width="1" fill="none" opacity="0.3"/>`;
    s += `<path d="M${cx + 22},${ty + 8} Q${cx + 18},${ty + 16} ${cx + 14},${ty + 12} Q${cx + 10},${ty + 20} ${cx + 6},${ty + 16}" stroke="${vc}" stroke-width="1" fill="none" opacity="0.3"/>`;
    for (let i = 0; i < 3; i++) {
      const lx = cx - 18 + i * 6;
      const ly = ty + 10 + i * 4;
      s += `<path d="M${lx},${ly} Q${lx + 3},${ly - 2} ${lx + 5},${ly} Q${lx + 3},${ly + 1} ${lx},${ly}Z" fill="${lc2}" opacity="0.3"/>`;
    }
    const headY = h * 0.2;
    s += `<path d="M${cx - 14},${headY - 20} Q${cx - 18},${headY - 28} ${cx - 14},${headY - 34}" stroke="${vc}" stroke-width="2" fill="none" opacity="0.4"/>`;
    s += `<path d="M${cx + 14},${headY - 20} Q${cx + 18},${headY - 28} ${cx + 14},${headY - 34}" stroke="${vc}" stroke-width="2" fill="none" opacity="0.4"/>`;
    s += `<circle cx="${cx - 14}" cy="${headY - 34}" r="2.5" fill="${lc}" opacity="0.4"/>`;
    s += `<circle cx="${cx + 14}" cy="${headY - 34}" r="2.5" fill="${lc}" opacity="0.4"/>`;
    s += `<path d="M${cx - 20},${ty + 20} L${cx - 18},${ty + 28} L${cx - 22},${ty + 30} L${cx - 24},${ty + 22}Z" fill="${bkc}" opacity="0.15"/>`;
    s += `<path d="M${cx + 18},${ty + 22} L${cx + 22},${ty + 30} L${cx + 20},${ty + 32} L${cx + 16},${ty + 24}Z" fill="${bkc}" opacity="0.15"/>`;
    s += `<line x1="${cx - 21}" y1="${ty + 22}" x2="${cx - 19}" y2="${ty + 28}" stroke="${bkc}" stroke-width="0.5" opacity="0.2"/>`;
    s += `<line x1="${cx + 19}" y1="${ty + 24}" x2="${cx + 21}" y2="${ty + 30}" stroke="${bkc}" stroke-width="0.5" opacity="0.2"/>`;
  }

  if (level >= 7) {
    const headY = h * 0.2;
    s += `<path d="M${cx - 14},${headY - 20} Q${cx - 22},${headY - 34} ${cx - 18},${headY - 44}" stroke="${vc}" stroke-width="2.5" fill="none" opacity="0.5"/>`;
    s += `<path d="M${cx + 14},${headY - 20} Q${cx + 22},${headY - 34} ${cx + 18},${headY - 44}" stroke="${vc}" stroke-width="2.5" fill="none" opacity="0.5"/>`;
    s += `<path d="M${cx - 20},${headY - 32} Q${cx - 28},${headY - 38} ${cx - 26},${headY - 44}" stroke="${vc}" stroke-width="1.5" fill="none" opacity="0.4"/>`;
    s += `<path d="M${cx + 20},${headY - 32} Q${cx + 28},${headY - 38} ${cx + 26},${headY - 44}" stroke="${vc}" stroke-width="1.5" fill="none" opacity="0.4"/>`;
    if (level >= 8) {
      s += `<path d="M${cx - 17},${headY - 40} Q${cx - 12},${headY - 48} ${cx - 16},${headY - 52}" stroke="${vc}" stroke-width="1.2" fill="none" opacity="0.4"/>`;
      s += `<path d="M${cx + 17},${headY - 40} Q${cx + 12},${headY - 48} ${cx + 16},${headY - 52}" stroke="${vc}" stroke-width="1.2" fill="none" opacity="0.4"/>`;
    }
    for (let i = 0; i < 4; i++) {
      const alx = cx - 26 + i * 16 + (i % 2) * 4;
      const aly = headY - 42 - (i % 2) * 6;
      s += `<path d="M${alx},${aly} Q${alx + 3},${aly - 3} ${alx + 6},${aly} Q${alx + 3},${aly + 2} ${alx},${aly}Z" fill="${lc2}" opacity="${0.35 + i * 0.05}" style="animation:soulPulse ${2 + i * 0.3}s infinite"/>`;
    }
    s += `<path d="M${cx - 22},${ty} Q${cx - 28},${ty + 14} ${cx - 20},${ty + 26} Q${cx - 24},${ty + 34} ${cx - 18},${ty + h * 0.24}" stroke="${vc}" stroke-width="1.5" fill="none" opacity="0.35" style="animation:soulPulse 2.5s infinite"/>`;
    s += `<path d="M${cx + 22},${ty} Q${cx + 28},${ty + 14} ${cx + 20},${ty + 26} Q${cx + 24},${ty + 34} ${cx + 18},${ty + h * 0.24}" stroke="${vc}" stroke-width="1.5" fill="none" opacity="0.35" style="animation:soulPulse 3s infinite"/>`;
    for (let i = 0; i < Math.min(level, 6); i++) {
      const flx = cx - 24 + (i * 13) % 48;
      const fly = h * 0.15 + (i * 17) % 30;
      s += `<path d="M${flx},${fly} Q${flx + 2},${fly - 1.5} ${flx + 4},${fly} Q${flx + 2},${fly + 1} ${flx},${fly}Z" fill="${lc2}" opacity="${0.25 + i * 0.04}" style="animation:emberDrift ${2.5 + i * 0.4}s ease-out infinite; animation-delay:${i * 0.5}s"/>`;
    }
    if (level >= 9) {
      s += `<ellipse cx="${cx}" cy="${ty + 16}" rx="18" ry="14" fill="${lc}" opacity="0.06" filter="url(#gf)" style="animation:soulPulse 3.5s infinite"/>`;
      for (let i = 0; i < 4; i++) {
        const spx = cx - 20 + i * 14;
        const spy = h * 0.1 + i * 8;
        s += `<circle cx="${spx}" cy="${spy}" r="1.5" fill="${lc2}" opacity="0.3" style="animation:float ${2 + i * 0.3}s ease-in-out infinite" filter="url(#gf)"/>`;
      }
    }
  }

  return s;
}

// --- HUMAN ---
function humanThemeExtras(level: number, _tier: Tier, isRev: boolean, _id: string, _acc: string, _sf: string, arm: string, _skin: string, w: number, h: number): string {
  let s = '';
  const cx = w / 2;
  const ty = h * 0.38;
  const hc = isRev ? '#7fffd4' : '#c9a84c';

  if (level >= 1) {
    const insY = ty + 10;
    const numStripes = Math.min(level, 3);
    for (let i = 0; i < numStripes; i++) {
      const sy = insY + i * 5;
      s += `<path d="M${cx - 8},${sy + 3} L${cx},${sy} L${cx + 8},${sy + 3}" stroke="${hc}" stroke-width="${1 + level * 0.1}" fill="none" opacity="0.4"/>`;
    }
    if (level >= 2) {
      s += `<line x1="${cx - 16}" y1="${ty + 6}" x2="${cx - 4}" y2="${ty + h * 0.22}" stroke="${isRev ? '#1a3028' : '#5d3a1a'}" stroke-width="1.5" opacity="0.3"/>`;
      s += `<line x1="${cx + 16}" y1="${ty + 6}" x2="${cx + 4}" y2="${ty + h * 0.22}" stroke="${isRev ? '#1a3028' : '#5d3a1a'}" stroke-width="1.5" opacity="0.3"/>`;
      s += `<rect x="${cx - 18}" y="${ty + 5}" width="4" height="3" rx="0.5" fill="${hc}" opacity="0.3"/>`;
      s += `<rect x="${cx + 14}" y="${ty + 5}" width="4" height="3" rx="0.5" fill="${hc}" opacity="0.3"/>`;
    }
  }

  if (level >= 4) {
    const symY = ty + 16;
    const symR = 6 + level * 0.4;
    s += `<circle cx="${cx}" cy="${symY}" r="${symR}" fill="none" stroke="${hc}" stroke-width="${0.8 + level * 0.1}" opacity="0.4"/>`;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rx1 = symR + 1;
      const rx2 = symR + 3 + level * 0.3;
      s += `<line x1="${cx + Math.cos(angle) * rx1}" y1="${symY + Math.sin(angle) * rx1}" x2="${cx + Math.cos(angle) * rx2}" y2="${symY + Math.sin(angle) * rx2}" stroke="${hc}" stroke-width="0.8" opacity="0.35"/>`;
    }
    s += `<circle cx="${cx}" cy="${symY}" r="${symR * 0.5}" fill="${hc}" opacity="0.15"/>`;
    const plumeX = cx + 8;
    const plumeY = h * 0.2 - 24;
    const plumeH = 12 + level * 2;
    s += `<path d="M${plumeX},${plumeY + plumeH} Q${plumeX + 6},${plumeY + plumeH * 0.5} ${plumeX + 4},${plumeY}" stroke="${isRev ? '#7fffd4' : '#8b1a1a'}" stroke-width="${2 + level * 0.2}" fill="none" opacity="0.5" stroke-linecap="round"/>`;
    const capeY = ty + 2;
    const capeLen = 20 + level * 4;
    s += `<path d="M${cx - 16},${capeY} Q${cx - 20},${capeY + capeLen * 0.4} ${cx - 18},${capeY + capeLen}" stroke="${isRev ? arm : '#8b1a1a'}" stroke-width="${6 + level * 0.5}" fill="none" opacity="${0.25 + level * 0.03}" stroke-linecap="round"/>`;
    s += `<path d="M${cx + 16},${capeY} Q${cx + 20},${capeY + capeLen * 0.4} ${cx + 18},${capeY + capeLen}" stroke="${isRev ? arm : '#8b1a1a'}" stroke-width="${6 + level * 0.5}" fill="none" opacity="${0.25 + level * 0.03}" stroke-linecap="round"/>`;
  }

  if (level >= 7) {
    const capeY = ty;
    const capeLen = 40 + level * 6;
    s += `<path d="M${cx - 18},${capeY} Q${cx - 26},${capeY + capeLen * 0.3} ${cx - 22},${capeY + capeLen * 0.6} Q${cx - 28},${capeY + capeLen * 0.8} ${cx - 20},${capeY + capeLen}" stroke="${isRev ? arm : '#8b1a1a'}" stroke-width="${8 + level * 0.6}" fill="none" opacity="${0.3 + level * 0.03}" stroke-linecap="round"/>`;
    s += `<path d="M${cx + 18},${capeY} Q${cx + 26},${capeY + capeLen * 0.3} ${cx + 22},${capeY + capeLen * 0.6} Q${cx + 28},${capeY + capeLen * 0.8} ${cx + 20},${capeY + capeLen}" stroke="${isRev ? arm : '#8b1a1a'}" stroke-width="${8 + level * 0.6}" fill="none" opacity="${0.3 + level * 0.03}" stroke-linecap="round"/>`;
    s += `<path d="M${cx - 16},${capeY + 4} Q${cx - 22},${capeY + capeLen * 0.3} ${cx - 18},${capeY + capeLen * 0.6}" stroke="${hc}" stroke-width="1" fill="none" opacity="0.15"/>`;
    const headY = h * 0.2;
    s += `<path d="M${cx - 16},${headY - 12} Q${cx - 12},${headY - 20} ${cx - 4},${headY - 22}" stroke="${hc}" stroke-width="1.5" fill="none" opacity="0.45"/>`;
    s += `<path d="M${cx + 16},${headY - 12} Q${cx + 12},${headY - 20} ${cx + 4},${headY - 22}" stroke="${hc}" stroke-width="1.5" fill="none" opacity="0.45"/>`;
    for (let i = 0; i < 4; i++) {
      const llx = cx - 14 + i * 4;
      const lly = headY - 14 - i * 2;
      s += `<path d="M${llx},${lly} Q${llx + 2},${lly - 3} ${llx + 4},${lly} Q${llx + 2},${lly + 1} ${llx},${lly}Z" fill="${hc}" opacity="${0.35 + i * 0.05}"/>`;
      const rlx = cx + 14 - i * 4;
      s += `<path d="M${rlx},${lly} Q${rlx - 2},${lly - 3} ${rlx - 4},${lly} Q${rlx - 2},${lly + 1} ${rlx},${lly}Z" fill="${hc}" opacity="${0.35 + i * 0.05}"/>`;
    }
    if (level >= 8) {
      const symY = ty + 16;
      const symR = 8 + level * 0.5;
      s += `<circle cx="${cx}" cy="${symY}" r="${symR}" fill="${hc}" opacity="0.1" filter="url(#gf)" style="animation:soulPulse 2.5s infinite"/>`;
    }
    if (level >= 9) {
      const banX = cx + 30;
      const banY = ty - 20;
      s += `<rect x="${banX}" y="${banY}" width="2" height="30" rx="1" fill="${hc}" opacity="0.4"/>`;
      s += `<path d="M${banX + 2},${banY} L${banX + 14},${banY + 4} L${banX + 12},${banY + 10} L${banX + 2},${banY + 8}Z" fill="${isRev ? '#2a5540' : '#8b1a1a'}" opacity="0.4"/>`;
      s += `<circle cx="${banX + 8}" cy="${banY + 5}" r="2" fill="${hc}" opacity="0.3"/>`;
      s += `<ellipse cx="${cx}" cy="${ty + 16}" rx="16" ry="12" fill="${hc}" opacity="0.06" filter="url(#gf)" style="animation:soulPulse 3s infinite"/>`;
    }
  }

  return s;
}

// ============================================================
// ANCESTRY ARMOR FUNCTIONS
// ============================================================

// --- DEVIL ARMOR ---
function buildDevilWeapon(level: number, _tier: Tier, _isRev: boolean, id: string, acc: string, sf: string): string {
  const x = 95, baseY = 60;
  const wlen = 80 + level * 6;

  if (level <= 2) {
    return `<rect x="${x}" y="${baseY}" width="4" height="${wlen}" rx="2" fill="${acc}" opacity="0.8"/>
    <rect x="${x - 6}" y="${baseY + 20}" width="16" height="4" rx="1" fill="${acc}"/>
    <polygon points="${x + 2},${baseY} ${x - 3},${baseY + 12} ${x + 7},${baseY + 12}" fill="${sf}"/>`;
  } else if (level <= 4) {
    return `<rect x="${x}" y="${baseY}" width="5" height="${wlen}" rx="2" fill="${acc}" filter="url(#af_${id})"/>
    <rect x="${x - 8}" y="${baseY + 18}" width="22" height="5" rx="2" fill="${acc}"/>
    <path d="${x + 2.5},${baseY} L${x - 4},${baseY + 16} L${x + 9},${baseY + 16}Z" fill="${sf}"/>
    <ellipse cx="${x + 2.5}" cy="${baseY + 8}" rx="4" ry="5" fill="${sf}" opacity="0.8" filter="url(#gf)"/>`;
  } else if (level <= 6) {
    return `<rect x="${x}" y="${baseY}" width="5" height="${wlen}" rx="2" fill="${acc}" filter="url(#af_${id})"/>
    <path d="M${x - 10},${baseY + 15} Q${x + 2.5},${baseY + 5} ${x + 15},${baseY + 15} Q${x + 10},${baseY + 25} ${x + 2.5},${baseY + 20} Q${x - 5},${baseY + 25} ${x - 10},${baseY + 15}Z" fill="${acc}" filter="url(#gf)"/>
    <rect x="${x - 10}" y="${baseY + 22}" width="26" height="5" rx="2" fill="${acc}"/>
    <path d="M${x - 12},${baseY + 20} L${x + 17},${baseY + 20}" stroke="${sf}" stroke-width="2"/>
    <ellipse cx="${x + 2.5}" cy="${baseY + 12}" rx="5" ry="6" fill="${sf}" opacity="0.9" filter="url(#gf)" style="animation:soulPulse 1.8s ease-in-out infinite"/>`;
  } else if (level <= 8) {
    return `<rect x="${x - 1}" y="${baseY}" width="7" height="${wlen}" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="M${x - 14},${baseY + 14} Q${x + 3},${baseY - 4} ${x + 20},${baseY + 14} Q${x + 14},${baseY + 28} ${x + 3},${baseY + 22} Q${x - 8},${baseY + 28} ${x - 14},${baseY + 14}Z" fill="${acc}" filter="url(#gf)"/>
    <path d="M${x - 16},${baseY + 22} L${x + 22},${baseY + 22}" stroke="${sf}" stroke-width="3"/>
    <path d="M${x - 18},${baseY + 26} L${x + 24},${baseY + 26}" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
    <ellipse cx="${x + 3}" cy="${baseY + 12}" rx="6" ry="8" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s ease-in-out infinite"/>
    <circle cx="${x + 3}" cy="${baseY + 12}" r="3" fill="white" opacity="0.6"/>`;
  } else {
    return `<rect x="${x - 1}" y="${baseY - 10}" width="7" height="${wlen + 10}" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="M${x - 16},${baseY + 12} Q${x + 3},${baseY - 10} ${x + 22},${baseY + 12} Q${x + 16},${baseY + 30} ${x + 3},${baseY + 24} Q${x - 10},${baseY + 30} ${x - 16},${baseY + 12}Z" fill="${acc}" filter="url(#gf)"/>
    <path d="M${x - 20},${baseY + 20} L${x + 26},${baseY + 20}" stroke="${sf}" stroke-width="4" filter="url(#gf)"/>
    <path d="M${x - 22},${baseY + 24} L${x + 28},${baseY + 24}" stroke="${acc}" stroke-width="2" opacity="0.6"/>
    <ellipse cx="${x + 3}" cy="${baseY + 10}" rx="8" ry="10" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s ease-in-out infinite"/>
    <circle cx="${x + 3}" cy="${baseY + 10}" r="4" fill="white" opacity="0.8"/>
    <circle cx="${x + 3}" cy="${baseY + 10}" r="2" fill="${acc}" opacity="1"/>
    ${mkParticles(x + 3, baseY + 10, sf, 5)}`;
  }
}

function devilArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const id = `d${level}${isRev ? 'r' : 'l'}`;
  const c = resolveColors(tier, isRev, 'devil', colorOverride);
  const skin = c.skin, arm = c.armor, acc = c.accent, sf = c.gem, glow = c.glow;

  const hasGreaves = level >= 2;
  const hasPauldrons = level >= 3;
  const hasHelm = level >= 4;
  const hasTabard = level >= 5;
  const hasRuneWork = tier.runes;
  const hasWings = tier.wings;
  const hasMythic = level >= 9;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="200" viewBox="0 0 120 200" class="${isRev ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''}">
  ${defs(id, skin, arm, acc, glow, isRev)}`;

  if (hasWings) svg += mkWings(60, 90, arm + '99', acc, level);

  svg += `<rect x="40" y="148" width="16" height="48" rx="4" fill="${skin}"/>
  <rect x="64" y="148" width="16" height="48" rx="4" fill="${skin}"/>`;

  if (hasGreaves) {
    svg += `<rect x="38" y="150" width="19" height="44" rx="4" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="62" y="150" width="19" height="44" rx="4" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <line x1="47" y1="152" x2="47" y2="192" stroke="${acc}" stroke-width="0.8" opacity="0.5"/>
    <line x1="71" y1="152" x2="71" y2="192" stroke="${acc}" stroke-width="0.8" opacity="0.5"/>`;
    svg += `<ellipse cx="47" cy="168" rx="8" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="71" cy="168" rx="8" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
  }

  svg += `<ellipse cx="48" cy="196" rx="10" ry="5" fill="${isRev ? '#0a1a15' : '#1a0505'}"/>
  <ellipse cx="72" cy="196" rx="10" ry="5" fill="${isRev ? '#0a1a15' : '#1a0505'}"/>`;

  svg += `<rect x="32" y="92" width="56" height="60" rx="9" fill="${skin}"/>`;

  if (level >= 1) {
    svg += `<path d="M32,102 L60,92 L88,102 L88,140 L60,152 L32,140Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    svg += `<path d="M38,108 L60,100 L82,108 L82,135 L60,143 L38,135Z" fill="none" stroke="${acc}" stroke-width="${0.5 + level * 0.12}" opacity="0.7"/>`;
    svg += `<ellipse cx="60" cy="118" rx="${3 + level * 0.4}" ry="${3 + level * 0.4}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s ease-in-out infinite"/>`;
  }

  if (level >= 3) {
    svg += `<path d="M34,145 L44,152 L60,148 L76,152 L86,145 L86,155 L60,160 L34,155Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  }

  if (hasTabard) {
    svg += `<path d="M42,148 L60,145 L78,148 L75,172 L60,175 L45,172Z" fill="${arm}cc" stroke="${acc}" stroke-width="0.8" opacity="0.8"/>`;
    svg += `<path d="M56,154 L60,150 L64,154 L62,160 L58,160Z" fill="${acc}" opacity="0.7"/>`;
  }

  if (hasPauldrons) {
    svg += `<path d="M32,100 Q15,92 12,78 Q20,80 28,90 Q30,95 32,100Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <path d="M88,100 Q105,92 108,78 Q100,80 92,90 Q90,95 88,100Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    if (level >= 5) {
      svg += `<path d="M14,80 Q8,70 12,62 Q18,68 22,76 Q16,78 14,80Z" fill="url(#acc_${id})"/>
      <path d="M106,80 Q112,70 108,62 Q102,68 98,76 Q104,78 106,80Z" fill="url(#acc_${id})"/>`;
    }
    if (level >= 7) {
      svg += `<path d="M10,64 Q4,56 9,48 Q15,54 18,62Z" fill="url(#acc_${id})"/>
      <path d="M110,64 Q116,56 111,48 Q105,54 102,62Z" fill="url(#acc_${id})"/>`;
    }
  }

  svg += `<rect x="14" y="94" width="18" height="52" rx="7" fill="${skin}"/>
  <rect x="88" y="94" width="18" height="52" rx="7" fill="${skin}"/>`;

  if (level >= 2) {
    svg += `<rect x="13" y="110" width="20" height="30" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="87" y="110" width="20" height="30" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <line x1="23" y1="112" x2="23" y2="138" stroke="${acc}" stroke-width="0.8" opacity="0.5"/>
    <line x1="97" y1="112" x2="97" y2="138" stroke="${acc}" stroke-width="0.8" opacity="0.5"/>`;
  }

  svg += `<ellipse cx="23" cy="147" rx="9" ry="6" fill="${skin}"/>
  <ellipse cx="97" cy="147" rx="9" ry="6" fill="${skin}"/>`;

  svg += `<rect x="50" y="78" width="20" height="16" rx="5" fill="${skin}"/>`;
  if (level >= 3) svg += `<path d="M48,82 Q60,76 72,82 Q72,90 60,93 Q48,90 48,82Z" fill="url(#ag_${id})" stroke="${acc}" stroke-width="0.6"/>`;

  svg += `<ellipse cx="60" cy="56" rx="24" ry="26" fill="${skin}"/>`;

  svg += `<path d="M42,34 Q34,16 38,8" stroke="${isRev ? '#0d2218' : '#3d0a0a'}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M78,34 Q86,16 82,8" stroke="${isRev ? '#0d2218' : '#3d0a0a'}" stroke-width="7" fill="none" stroke-linecap="round"/>`;

  if (hasHelm) {
    svg += `<path d="M36,50 Q38,26 60,22 Q82,26 84,50" fill="url(#ag_${id})" filter="url(#af_${id})" stroke="${acc}" stroke-width="0.8"/>`;
    svg += `<rect x="57" y="36" width="6" height="20" rx="2" fill="url(#acc_${id})"/>`;
    if (level >= 6) {
      svg += `<path d="M38,46 Q60,38 82,46" stroke="${acc}" stroke-width="2" fill="none"/>
      <path d="M44,52 L55,48 L65,48 L76,52" stroke="${acc}" stroke-width="1.5" fill="none"/>`;
    }
    if (level >= 8) {
      svg += `<path d="M40,32 Q36,22 40,16" stroke="${acc}" stroke-width="3" fill="none"/>
      <path d="M80,32 Q84,22 80,16" stroke="${acc}" stroke-width="3" fill="none"/>
      <circle cx="40" cy="16" r="3" fill="${sf}" filter="url(#gf)"/>
      <circle cx="80" cy="16" r="3" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  const eyeColor = isRev ? '#7fffd4' : '#ff6600';
  svg += `<ellipse cx="50" cy="56" rx="5" ry="4" fill="${eyeColor}" filter="url(#gf)" style="animation:soulPulse 2.2s ease-in-out infinite"/>
  <ellipse cx="70" cy="56" rx="5" ry="4" fill="${eyeColor}" filter="url(#gf)" style="animation:soulPulse 2.2s ease-in-out infinite; animation-delay:0.3s"/>`;

  svg += `<path d="M88,130 Q108,118 105,148 Q102,162 96,156" stroke="${skin}" stroke-width="6" fill="none" stroke-linecap="round"/>
  <polygon points="96,156 103,168 90,160" fill="${skin}"/>`;

  svg += kit ? getSelectedWeaponSvg(kit!, weaponId ?? undefined, level, acc, sf, id, 'devil') : buildDevilWeapon(level, tier, isRev, id, acc, sf);

  if (hasRuneWork) svg += mkRunes(38, 115, 44, 0, acc, 5);

  if (hasMythic) {
    svg += `<ellipse cx="60" cy="40" rx="34" ry="10" fill="none" stroke="${acc}" stroke-width="1.5" opacity="0.5" style="animation:rune 2s ease-in-out infinite"/>
    <ellipse cx="60" cy="40" rx="28" ry="8" fill="none" stroke="${sf}" stroke-width="0.5" opacity="0.4"/>`;
  }

  if (tier.particles) svg += mkParticles(60, 56, acc, 8);

  svg += devilThemeExtras(level, tier, isRev, id, acc, sf, arm, skin, 120, 200);

  svg += `</svg>`;
  return svg;
}

// --- DWARF ARMOR ---
function buildDwarfWeapon(level: number, tier: Tier, isRev: boolean, id: string, acc: string, sf: string): string {
  const sx = 92;
  if (level <= 2) {
    return `<rect x="${sx}" y="70" width="5" height="90" rx="2" fill="${isRev ? '#1a3028' : acc}" opacity="0.9"/>
    <path d="${sx},75 Q${sx - 14},68 ${sx - 12},85 Q${sx},88 ${sx},75Z" fill="${acc}"/>
    <path d="${sx + 5},75 Q${sx + 19},68 ${sx + 17},85 Q${sx + 5},88 ${sx + 5},75Z" fill="${tier.color + 'cc'}"/>`;
  } else if (level <= 4) {
    return `<rect x="${sx}" y="65" width="5" height="95" rx="2" fill="${acc}" filter="url(#af_${id})"/>
    <path d="${sx},72 Q${sx - 18},62 ${sx - 16},82 Q${sx},86 ${sx},72Z" fill="${acc}" filter="url(#gf)"/>
    <path d="${sx + 5},72 Q${sx + 23},62 ${sx + 21},82 Q${sx + 5},86 ${sx + 5},72Z" fill="${acc}" filter="url(#gf)"/>
    <ellipse cx="${sx + 2.5}" cy="80" rx="4" ry="5" fill="${sf}" filter="url(#gf)"/>`;
  } else if (level <= 6) {
    return `<rect x="${sx}" y="62" width="6" height="100" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="${sx},70 Q${sx - 22},58 ${sx - 19},82 Q${sx},87 ${sx},70Z" fill="${acc}" filter="url(#gf)"/>
    <path d="${sx + 6},70 Q${sx + 28},58 ${sx + 25},82 Q${sx + 6},87 ${sx + 6},70Z" fill="${acc}" filter="url(#gf)"/>
    <ellipse cx="${sx + 3}" cy="76" rx="5" ry="6" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>
    <path d="${sx + 3},62 L${sx - 2},70 L${sx + 8},70Z" fill="${sf}"/>`;
  } else if (level <= 8) {
    return `<rect x="${sx - 1}" y="58" width="8" height="108" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="${sx - 1},66 Q${sx - 26},52 ${sx - 22},80 Q${sx - 1},86 ${sx - 1},66Z" fill="${acc}" filter="url(#gf)"/>
    <path d="${sx + 7},66 Q${sx + 32},52 ${sx + 28},80 Q${sx + 7},86 ${sx + 7},66Z" fill="${acc}" filter="url(#gf)"/>
    <line x1="${sx - 26}" y1="64" x2="${sx + 32}" y2="64" stroke="${sf}" stroke-width="2.5"/>
    <ellipse cx="${sx + 3}" cy="72" rx="7" ry="8" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>
    <circle cx="${sx + 3}" cy="72" r="3" fill="white" opacity="0.7"/>`;
  } else {
    return `<rect x="${sx - 1}" y="54" width="8" height="116" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="${sx - 1},64 Q${sx - 30},46 ${sx - 25},78 Q${sx - 1},84 ${sx - 1},64Z" fill="${acc}" filter="url(#gf)"/>
    <path d="${sx + 7},64 Q${sx + 36},46 ${sx + 31},78 Q${sx + 7},84 ${sx + 7},64Z" fill="${acc}" filter="url(#gf)"/>
    <line x1="${sx - 30}" y1="60" x2="${sx + 36}" y2="60" stroke="${sf}" stroke-width="3.5" filter="url(#gf)"/>
    <line x1="${sx - 28}" y1="64" x2="${sx + 34}" y2="64" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
    <ellipse cx="${sx + 3}" cy="70" rx="9" ry="10" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
    <circle cx="${sx + 3}" cy="70" r="4" fill="white" opacity="0.8"/>
    <circle cx="${sx + 3}" cy="70" r="2" fill="${acc}"/>
    ${mkParticles(sx + 3, 70, sf, 5)}`;
  }
}

function dwarfArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const id = `dw${level}${isRev ? 'r' : 'l'}`;
  const c = resolveColors(tier, isRev, 'dwarf', colorOverride);
  const skin = c.skin, arm = c.armor, acc = c.accent, sf = c.gem, glow = c.glow;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="185" viewBox="0 0 110 185" class="${isRev ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''}">
  ${defs(id, skin, arm, acc, glow, isRev)}`;

  if (tier.wings) svg += mkWings(55, 75, arm + '88', acc, level);

  svg += `<rect x="30" y="126" width="18" height="50" rx="5" fill="${skin}"/>
  <rect x="62" y="126" width="18" height="50" rx="5" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="28" y="128" width="22" height="46" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="60" y="128" width="22" height="46" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <ellipse cx="39" cy="148" rx="10" ry="7" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="71" cy="148" rx="10" ry="7" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <line x1="39" y1="130" x2="39" y2="172" stroke="${acc}" stroke-width="1" opacity="0.4"/>
    <line x1="71" y1="130" x2="71" y2="172" stroke="${acc}" stroke-width="1" opacity="0.4"/>`;
  }
  svg += `<rect x="25" y="166" width="26" height="16" rx="4" fill="${isRev ? '#0d0a08' : '#1a0e06'}"/>
  <rect x="59" y="166" width="26" height="16" rx="4" fill="${isRev ? '#0d0a08' : '#1a0e06'}"/>`;
  if (level >= 4) {
    svg += `<path d="M25,168 L28,164 L50,164 L51,168Z" fill="url(#acc_${id})"/>
    <path d="M59,168 L62,164 L84,164 L85,168Z" fill="url(#acc_${id})"/>`;
  }

  svg += `<rect x="22" y="74" width="66" height="56" rx="10" fill="${skin}"/>
  <path d="M22,88 L55,76 L88,88 L88,120 L55,132 L22,120Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  svg += `<path d="M28,96 L55,86 L82,96 L82,118 L55,128 L28,118Z" fill="none" stroke="${acc}" stroke-width="${0.8 + level * 0.15}" opacity="0.7"/>`;

  if (level >= 3) {
    svg += `<rect x="42" y="94" width="26" height="22" rx="2" fill="${arm}99" stroke="${acc}" stroke-width="0.8"/>`;
    if (tier.runes) svg += mkRunes(42, 104, 26, 0, acc, 4);
    else svg += `<text x="55" y="107" font-size="8" fill="${acc}" text-anchor="middle" opacity="0.7" font-family="serif">\u169B\u169C</text>`;
  }

  svg += `<circle cx="55" cy="104" r="${2 + level * 0.3}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s ease-in-out infinite"/>`;
  svg += `<rect x="22" y="124" width="66" height="10" rx="3" fill="${isRev ? '#0d1210' : '#2d1a0e'}"/>
  <rect x="48" y="122" width="14" height="14" rx="2" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;

  if (level >= 3) {
    svg += `<path d="M22,90 Q4,80 2,64 Q12,68 18,82 Q20,86 22,90Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <path d="M88,90 Q106,80 108,64 Q98,68 92,82 Q90,86 88,90Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    if (level >= 5) {
      svg += `<path d="M4,66 Q0,54 4,44 Q10,52 14,64Z" fill="url(#acc_${id})"/>
      <path d="M106,66 Q110,54 106,44 Q100,52 96,64Z" fill="url(#acc_${id})"/>`;
    }
    if (level >= 7) {
      svg += `<path d="M2,46 Q-2,36 4,28 Q10,36 12,46Z" fill="url(#acc_${id})"/>
      <path d="M108,46 Q112,36 106,28 Q100,36 98,46Z" fill="url(#acc_${id})"/>
      <circle cx="4" cy="28" r="4" fill="${sf}" filter="url(#gf)"/>
      <circle cx="106" cy="28" r="4" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  svg += `<rect x="4" y="76" width="18" height="48" rx="7" fill="${skin}"/>
  <rect x="88" y="76" width="18" height="48" rx="7" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="3" y="90" width="20" height="32" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="87" y="90" width="20" height="32" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<ellipse cx="13" cy="126" rx="10" ry="7" fill="${skin}"/>
  <ellipse cx="97" cy="126" rx="10" ry="7" fill="${skin}"/>`;

  svg += `<rect x="43" y="62" width="24" height="16" rx="5" fill="${skin}"/>`;
  if (level >= 4) svg += `<path d="M40,66 Q55,58 70,66 Q70,78 55,82 Q40,78 40,66Z" fill="url(#ag_${id})" stroke="${acc}" stroke-width="0.8"/>`;

  svg += `<ellipse cx="55" cy="48" rx="22" ry="24" fill="${skin}"/>`;

  if (level >= 4) {
    svg += `<path d="M34,54 Q36,28 55,24 Q74,28 76,54" fill="url(#ag_${id})" filter="url(#af_${id})" stroke="${acc}" stroke-width="0.8"/>`;
    svg += `<rect x="52" y="38" width="6" height="18" rx="2" fill="url(#acc_${id})"/>`;
    svg += `<path d="M34,56 Q30,64 34,72 Q40,68 40,60Z" fill="url(#ag_${id})"/>
    <path d="M76,56 Q80,64 76,72 Q70,68 70,60Z" fill="url(#ag_${id})"/>`;
    if (level >= 6) {
      svg += `<path d="M36,42 Q48,36 55,38 Q62,36 74,42" stroke="${acc}" stroke-width="2" fill="none"/>`;
    }
    if (level >= 8) {
      svg += `<path d="M46,24 Q42,14 46,8 Q50,16 55,12 Q60,16 64,8 Q68,14 64,24" fill="url(#acc_${id})" filter="url(#gf)"/>
      <circle cx="55" cy="10" r="4" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  svg += `<path d="M36,64 Q55,80 74,64 Q72,94 55,100 Q38,94 36,64Z" fill="${isRev ? '#0d1a18' : '#5d4037'}"/>
  <line x1="50" y1="78" x2="48" y2="98" stroke="${isRev ? acc : '#3e2723'}" stroke-width="1.5" opacity="0.6"/>
  <line x1="60" y1="78" x2="62" y2="98" stroke="${isRev ? acc : '#3e2723'}" stroke-width="1.5" opacity="0.6"/>`;
  if (level >= 3) {
    svg += `<circle cx="48" cy="99" r="4" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <circle cx="62" cy="99" r="4" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
    if (level >= 6) svg += `<path d="M48,100 Q55,108 62,100" stroke="${acc}" stroke-width="1.5" fill="none"/>`;
  }

  const eyeC = isRev ? '#7fffd4' : '#4a2f1a';
  svg += `<ellipse cx="44" cy="47" rx="5" ry="4" fill="${eyeC}" ${isRev ? 'filter="url(#gf)"' : ''}/>
  <ellipse cx="66" cy="47" rx="5" ry="4" fill="${eyeC}" ${isRev ? 'filter="url(#gf)"' : ''}/>`;
  if (isRev) svg += `<circle cx="44" cy="47" r="2.5" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s ease-in-out infinite"/>
  <circle cx="66" cy="47" r="2.5" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s ease-in-out infinite; animation-delay:0.3s"/>`;

  svg += kit ? getSelectedWeaponSvg(kit!, weaponId ?? undefined, level, acc, sf, id, 'dwarf') : buildDwarfWeapon(level, tier, isRev, id, acc, sf);

  if (tier.runes) svg += mkRunes(30, 100, 50, 0, acc, 6);
  if (tier.particles) svg += mkParticles(55, 48, acc, 8);

  svg += dwarfThemeExtras(level, tier, isRev, id, acc, sf, arm, skin, 110, 185);

  svg += `</svg>`;
  return svg;
}

// --- GENERIC HUMANOID ARMOR (used by Human, High Elf, Wode Elf, Orc) ---
interface GenericArmorOptions {
  id: string;
  skinColor: string;
  armorBase: string;
  accentBase: string;
  gemColor?: string;
  isRevenant: boolean;
  hasWings?: boolean;
  weaponFn: (level: number, tier: Tier, isRev: boolean, id: string, acc: string, sf: string, arm: string, w: number, h: number) => string;
  headFn?: (hx: number, hy: number, level: number, tier: Tier, isRev: boolean, id: string, acc: string, sf: string, arm: string, skin: string) => string;
  extraFn?: (level: number, tier: Tier, isRev: boolean, id: string, acc: string, sf: string, arm: string, skin: string, w: number, h: number) => string;
  w?: number;
  h?: number;
  svgClass?: string;
  ancestryId?: string;
}

function genericArmor(level: number, tier: Tier, isRev: boolean, options: GenericArmorOptions, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const {
    id, skinColor, isRevenant,
    hasWings: optWings, weaponFn, headFn, extraFn,
    w = 110, h = 200, svgClass = '', ancestryId = 'human'
  } = options;
  const c = resolveColors(tier, isRev, ancestryId, colorOverride);
  const arm = c.armor, acc = c.accent, sf = c.gem, glow = c.glow;
  const skin = isRevenant ? '#1e2828' : (c.skin || skinColor);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="${isRevenant ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''} ${svgClass}">
  ${defs(id, skin, arm, acc, glow, isRevenant)}`;

  if ((tier.wings || optWings) && level >= 7) svg += mkWings(w / 2, h * 0.46, arm + '88', acc, level);

  const lx = w / 2 - 18, rx = w / 2 + 6;
  svg += `<rect x="${lx}" y="${h * 0.65}" width="14" height="${h * 0.3}" rx="4" fill="${skin}"/>
  <rect x="${rx}" y="${h * 0.65}" width="14" height="${h * 0.3}" rx="4" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="${lx - 2}" y="${h * 0.66}" width="18" height="${h * 0.28}" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="${rx - 2}" y="${h * 0.66}" width="18" height="${h * 0.28}" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <ellipse cx="${lx + 7}" cy="${h * 0.74}" rx="9" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="${rx + 7}" cy="${h * 0.74}" rx="9" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<rect x="${lx - 3}" y="${h * 0.88}" width="20" height="${h * 0.1}" rx="4" fill="${isRevenant ? '#050404' : '#1a0e06'}"/>
  <rect x="${rx - 3}" y="${h * 0.88}" width="20" height="${h * 0.1}" rx="4" fill="${isRevenant ? '#050404' : '#1a0e06'}"/>`;

  const ty = h * 0.38;
  const ty22 = ty + h * 0.22;
  svg += `<rect x="${w / 2 - 22}" y="${ty}" width="44" height="${h * 0.29}" rx="8" fill="${skin}"/>
  <path d="M${w / 2 - 22},${ty + 14} L${w / 2},${ty + 4} L${w / 2 + 22},${ty + 14} L${w / 2 + 22},${ty22} L${w / 2},${ty + h * 0.26} L${w / 2 - 22},${ty22}Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  svg += `<path d="M${w / 2 - 16},${ty + 18} L${w / 2},${ty + 10} L${w / 2 + 16},${ty + 18} L${w / 2 + 16},${ty + h * 0.2} L${w / 2},${ty + h * 0.24} L${w / 2 - 16},${ty + h * 0.2}Z" fill="none" stroke="${acc}" stroke-width="${0.7 + level * 0.12}" opacity="0.7"/>`;
  svg += `<circle cx="${w / 2}" cy="${ty + 16 + level}" r="${2 + level * 0.35}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s ease-in-out infinite"/>`;

  if (level >= 5) {
    svg += `<path d="M${w / 2 - 14},${ty + h * 0.22} L${w / 2},${ty + h * 0.2} L${w / 2 + 14},${ty + h * 0.22} L${w / 2 + 11},${ty + h * 0.3} L${w / 2},${ty + h * 0.32} L${w / 2 - 11},${ty + h * 0.3}Z" fill="${arm}cc" stroke="${acc}" stroke-width="0.8"/>`;
  }

  svg += `<rect x="${w / 2 - 22}" y="${ty + h * 0.25}" width="44" height="7" rx="2" fill="${isRevenant ? '#0d1210' : '#2d1a0e'}"/>
  <rect x="${w / 2 - 7}" y="${ty + h * 0.24}" width="14" height="9" rx="2" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;

  if (level >= 3) {
    const py = ty + 10;
    svg += `<path d="M${w / 2 - 22},${py + 4} Q${w / 2 - 40},${py - 8} ${w / 2 - 44},${py - 22} Q${w / 2 - 34},${py - 18} ${w / 2 - 26},${py - 2}Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <path d="M${w / 2 + 22},${py + 4} Q${w / 2 + 40},${py - 8} ${w / 2 + 44},${py - 22} Q${w / 2 + 34},${py - 18} ${w / 2 + 26},${py - 2}Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    if (level >= 6) {
      svg += `<path d="M${w / 2 - 44},${py - 20} Q${w / 2 - 52},${py - 32} ${w / 2 - 46},${py - 42} Q${w / 2 - 38},${py - 34} ${w / 2 - 36},${py - 22}Z" fill="url(#acc_${id})"/>
      <path d="M${w / 2 + 44},${py - 20} Q${w / 2 + 52},${py - 32} ${w / 2 + 46},${py - 42} Q${w / 2 + 38},${py - 34} ${w / 2 + 36},${py - 22}Z" fill="url(#acc_${id})"/>`;
    }
    if (level >= 8) {
      svg += `<circle cx="${w / 2 - 46}" cy="${py - 42}" r="4" fill="${sf}" filter="url(#gf)"/>
      <circle cx="${w / 2 + 46}" cy="${py - 42}" r="4" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  const armH = h * 0.24;
  svg += `<rect x="${w / 2 - 40}" y="${ty + 4}" width="16" height="${armH}" rx="6" fill="${skin}"/>
  <rect x="${w / 2 + 24}" y="${ty + 4}" width="16" height="${armH}" rx="6" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="${w / 2 - 41}" y="${ty + 14}" width="18" height="${h * 0.18}" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="${w / 2 + 23}" y="${ty + 14}" width="18" height="${h * 0.18}" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<ellipse cx="${w / 2 - 32}" cy="${ty + h * 0.24}" rx="9" ry="6" fill="${skin}"/>
  <ellipse cx="${w / 2 + 32}" cy="${ty + h * 0.24}" rx="9" ry="6" fill="${skin}"/>`;

  const hx = w / 2, hy = h * 0.2;
  svg += `<rect x="${hx - 9}" y="${ty - 14}" width="18" height="16" rx="5" fill="${skin}"/>`;
  svg += headFn ? headFn(hx, hy, level, tier, isRevenant, id, acc, sf, arm, skin) : '';

  if (tier.runes) svg += mkRunes(w / 2 - 20, ty + 22, 40, 0, acc, 5);
  if (tier.particles) svg += mkParticles(w / 2, hy, acc, 8);
  if (extraFn) svg += extraFn(level, tier, isRevenant, id, acc, sf, arm, skin, w, h);

  svg += kit ? getSelectedWeaponSvg(kit, weaponId ?? undefined, level, acc, sf, id, ancestryId) : weaponFn(level, tier, isRevenant, id, acc, sf, arm, w, h);

  svg += `</svg>`;
  return svg;
}

// --- HUMAN ARMOR ---
function humanHeadFn(hx: number, hy: number, level: number, _tier: Tier, isRev: boolean, id: string, acc: string, sf: string, _arm: string, skin: string): string {
  let s = `<ellipse cx="${hx}" cy="${hy}" rx="20" ry="22" fill="${skin}"/>
  <path d="M${hx - 20},${hy - 8} Q${hx - 18},${hy - 28} ${hx},${hy - 30} Q${hx + 18},${hy - 28} ${hx + 20},${hy - 8}" fill="${isRev ? '#050404' : '#4a2f1a'}"/>`;
  const ec = isRev ? '#7fffd4' : '#2d1a0e';
  s += `<ellipse cx="${hx - 8}" cy="${hy}" rx="4" ry="3" fill="${ec}" ${isRev ? 'filter="url(#gf)"' : ''}/>
  <ellipse cx="${hx + 8}" cy="${hy}" rx="4" ry="3" fill="${ec}" ${isRev ? 'filter="url(#gf)"' : ''}/>`;
  if (isRev) s += `<circle cx="${hx - 8}" cy="${hy}" r="2" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <circle cx="${hx + 8}" cy="${hy}" r="2" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite; animation-delay:0.3s"/>`;
  s += `<path d="M${hx - 8},${hy + 10} Q${hx},${hy + 14} ${hx + 8},${hy + 10}" stroke="${isRev ? '#2a5540' : '#8d6040'}" stroke-width="1.5" fill="none"/>`;
  if (level >= 4) {
    s += `<path d="M${hx - 20},${hy - 6} Q${hx - 16},${hy - 28} ${hx},${hy - 30} Q${hx + 16},${hy - 28} ${hx + 20},${hy - 6}" fill="url(#ag_${id})" stroke="${acc}" stroke-width="0.8"/>
    <rect x="${hx - 3}" y="${hy - 22}" width="6" height="14" rx="2" fill="url(#acc_${id})"/>`;
    if (level >= 6) s += `<path d="M${hx - 18},${hy - 10} Q${hx},${hy - 18} ${hx + 18},${hy - 10}" stroke="${acc}" stroke-width="1.5" fill="none"/>`;
    if (level >= 8) s += `<path d="M${hx - 12},${hy - 28} Q${hx - 8},${hy - 38} ${hx},${hy - 36} Q${hx + 8},${hy - 38} ${hx + 12},${hy - 28}" fill="url(#acc_${id})" filter="url(#gf)"/>
    <circle cx="${hx}" cy="${hy - 36}" r="3" fill="${sf}" filter="url(#gf)"/>`;
  }
  return s;
}

function humanWeaponFn(level: number, _tier: Tier, _isRev: boolean, id: string, acc: string, sf: string, _arm: string, w: number, h: number): string {
  const sx = w - 14, baseY = h * 0.2;
  const wl = h * 0.5 + level * 3;
  if (level <= 2) return `<rect x="${sx}" y="${baseY}" width="4" height="${wl}" rx="2" fill="${acc}"/>
    <rect x="${sx - 7}" y="${baseY + wl * 0.25}" width="18" height="4" rx="1" fill="${acc}"/>
    <polygon points="${sx + 2},${baseY} ${sx - 3},${baseY + 14} ${sx + 7},${baseY + 14}" fill="${sf}"/>`;
  if (level <= 4) return `<rect x="${sx}" y="${baseY}" width="5" height="${wl}" rx="2" fill="${acc}" filter="url(#af_${id})"/>
    <rect x="${sx - 9}" y="${baseY + wl * 0.22}" width="23" height="5" rx="2" fill="${acc}"/>
    <path d="M${sx + 2.5},${baseY} L${sx - 4},${baseY + 16} L${sx + 9},${baseY + 16}Z" fill="${sf}" filter="url(#gf)"/>
    <ellipse cx="${sx + 2.5}" cy="${baseY + 8}" rx="4" ry="5" fill="${sf}" filter="url(#gf)"/>`;
  if (level <= 6) return `<rect x="${sx - 1}" y="${baseY}" width="6" height="${wl}" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 12},${baseY + 12} Q${sx + 2},${baseY + 2} ${sx + 16},${baseY + 12} Q${sx + 10},${baseY + 24} ${sx + 2},${baseY + 20} Q${sx - 6},${baseY + 24} ${sx - 12},${baseY + 12}Z" fill="${acc}" filter="url(#gf)"/>
    <rect x="${sx - 11}" y="${baseY + 22}" width="26" height="5" rx="2" fill="${acc}"/>
    <ellipse cx="${sx + 2}" cy="${baseY + 12}" rx="5" ry="6" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
  if (level <= 8) return `<rect x="${sx - 1}" y="${baseY - 6}" width="7" height="${wl + 6}" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 14},${baseY + 10} Q${sx + 2},${baseY - 6} ${sx + 18},${baseY + 10} Q${sx + 12},${baseY + 28} ${sx + 2},${baseY + 22} Q${sx - 8},${baseY + 28} ${sx - 14},${baseY + 10}Z" fill="${acc}" filter="url(#gf)"/>
    <line x1="${sx - 16}" y1="${baseY + 20}" x2="${sx + 20}" y2="${baseY + 20}" stroke="${sf}" stroke-width="3"/>
    <ellipse cx="${sx + 2}" cy="${baseY + 10}" rx="7" ry="8" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>
    <circle cx="${sx + 2}" cy="${baseY + 10}" r="3" fill="white" opacity="0.7"/>`;
  return `<rect x="${sx - 1}" y="${baseY - 8}" width="7" height="${wl + 8}" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 16},${baseY + 8} Q${sx + 2},${baseY - 10} ${sx + 20},${baseY + 8} Q${sx + 14},${baseY + 30} ${sx + 2},${baseY + 24} Q${sx - 10},${baseY + 30} ${sx - 16},${baseY + 8}Z" fill="${acc}" filter="url(#gf)"/>
    <line x1="${sx - 18}" y1="${baseY + 18}" x2="${sx + 22}" y2="${baseY + 18}" stroke="${sf}" stroke-width="4" filter="url(#gf)"/>
    <ellipse cx="${sx + 2}" cy="${baseY + 8}" rx="9" ry="10" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
    <circle cx="${sx + 2}" cy="${baseY + 8}" r="4" fill="white" opacity="0.8"/>
    ${mkParticles(sx + 2, baseY + 8, sf, 5)}`;
}

function humanArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  return genericArmor(level, tier, isRev, {
    id: `h${level}${isRev ? 'r' : 'l'}`,
    skinColor: isRev ? '#1e2828' : '#c8a080',
    armorBase: tier.color,
    accentBase: tier.accent,
    isRevenant: isRev,
    ancestryId: 'human',
    headFn: humanHeadFn,
    weaponFn: humanWeaponFn,
    extraFn: humanThemeExtras,
    w: 110, h: 200
  }, kit, weaponId, colorOverride);
}

// --- HIGH ELF ARMOR ---
function highElfHeadFn(hx: number, hy: number, level: number, _tier: Tier, isRev: boolean, _id: string, acc: string, sf: string, _arm: string, skin: string): string {
  let s = `<ellipse cx="${hx}" cy="${hy}" rx="18" ry="21" fill="${skin}"/>
  <path d="M${hx - 16},${hy - 14} Q${hx - 22},${hy - 32} ${hx - 18},${hy - 38} Q${hx - 12},${hy - 28} ${hx - 16},${hy - 14}Z" fill="${skin}"/>
  <path d="M${hx + 16},${hy - 14} Q${hx + 22},${hy - 32} ${hx + 18},${hy - 38} Q${hx + 12},${hy - 28} ${hx + 16},${hy - 14}Z" fill="${skin}"/>
  <path d="M${hx - 16},${hy - 16} Q${hx - 18},${hy - 30} ${hx},${hy - 32} Q${hx + 18},${hy - 30} ${hx + 16},${hy - 16}" fill="${isRev ? '#0d0a1a' : '#c8a0e8'}"/>`;
  const ec = isRev ? '#7fffd4' : '#4a0080';
  s += `<ellipse cx="${hx - 7}" cy="${hy}" rx="4.5" ry="3.5" fill="${ec}" ${isRev ? 'filter="url(#gf)"' : ''}/>
  <ellipse cx="${hx + 7}" cy="${hy}" rx="4.5" ry="3.5" fill="${ec}" ${isRev ? 'filter="url(#gf)"' : ''}/>`;
  if (isRev) s += `<circle cx="${hx - 7}" cy="${hy}" r="2" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <circle cx="${hx + 7}" cy="${hy}" r="2" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
  if (level >= 3) {
    s += `<path d="M${hx - 14},${hy - 30} L${hx - 11},${hy - 38} L${hx - 8},${hy - 32} L${hx - 5},${hy - 40} L${hx},${hy - 34} L${hx + 5},${hy - 40} L${hx + 8},${hy - 32} L${hx + 11},${hy - 38} L${hx + 14},${hy - 30}" fill="none" stroke="${acc}" stroke-width="${1.5 + level * 0.2}" filter="url(#gf)"/>`;
    if (level >= 5) s += `<circle cx="${hx}" cy="${hy - 34}" r="3" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    if (level >= 7) s += `<circle cx="${hx - 11}" cy="${hy - 38}" r="2" fill="${sf}" filter="url(#gf)"/>
    <circle cx="${hx + 11}" cy="${hy - 38}" r="2" fill="${sf}" filter="url(#gf)"/>`;
    if (level >= 9) s += `<ellipse cx="${hx}" cy="${hy - 18}" rx="22" ry="6" fill="none" stroke="${acc}" stroke-width="1.2" opacity="0.5" style="animation:rune 2s infinite"/>`;
  } else {
    s += `<path d="M${hx - 12},${hy - 28} L${hx - 9},${hy - 36} L${hx},${hy - 30} L${hx + 9},${hy - 36} L${hx + 12},${hy - 28}" fill="none" stroke="${acc}" stroke-width="1.5"/>`;
  }
  return s;
}

function highElfWeaponFn(level: number, _tier: Tier, _isRev: boolean, id: string, acc: string, sf: string, arm: string, w: number, h: number): string {
  const sx = w - 12, by = h * 0.16;
  if (level <= 2) return `<rect x="${sx}" y="${by}" width="3" height="${h * 0.6}" rx="1.5" fill="${arm}dd"/>
    <ellipse cx="${sx + 1.5}" cy="${by - 2}" rx="7" ry="11" fill="${sf}" opacity="0.7"/>
    <ellipse cx="${sx + 1.5}" cy="${by - 2}" rx="4" ry="6" fill="white" opacity="0.5"/>`;
  if (level <= 4) return `<rect x="${sx}" y="${by}" width="4" height="${h * 0.6}" rx="2" fill="${acc}" filter="url(#af_${id})"/>
    <ellipse cx="${sx + 2}" cy="${by - 3}" rx="9" ry="13" fill="${sf}" filter="url(#gf)" opacity="0.8"/>
    <ellipse cx="${sx + 2}" cy="${by - 3}" rx="5" ry="8" fill="white" opacity="0.6"/>`;
  if (level <= 6) return `<rect x="${sx}" y="${by}" width="4" height="${h * 0.62}" rx="2" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 10},${by} Q${sx + 2},${by - 18} ${sx + 14},${by} Q${sx + 8},${by + 14} ${sx + 2},${by + 10} Q${sx - 4},${by + 14} ${sx - 10},${by}Z" fill="${sf}" filter="url(#gf)"/>
    <ellipse cx="${sx + 2}" cy="${by}" rx="5" ry="7" fill="white" opacity="0.6" style="animation:soulPulse 1.8s infinite"/>`;
  if (level <= 8) return `<rect x="${sx - 1}" y="${by}" width="5" height="${h * 0.64}" rx="2" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 14},${by + 2} Q${sx + 2},${by - 20} ${sx + 18},${by + 2} Q${sx + 12},${by + 20} ${sx + 2},${by + 14} Q${sx - 8},${by + 20} ${sx - 14},${by + 2}Z" fill="${sf}" filter="url(#gf)"/>
    <ellipse cx="${sx + 2}" cy="${by + 2}" rx="7" ry="9" fill="white" opacity="0.7" style="animation:soulPulse 1.5s infinite"/>
    <circle cx="${sx + 2}" cy="${by + 2}" r="3" fill="${acc}"/>`;
  return `<rect x="${sx - 1}" y="${by - 4}" width="5" height="${h * 0.66}" rx="2" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 16},${by} Q${sx + 2},${by - 22} ${sx + 20},${by} Q${sx + 14},${by + 22} ${sx + 2},${by + 16} Q${sx - 10},${by + 22} ${sx - 16},${by}Z" fill="${sf}" filter="url(#gf)"/>
    <ellipse cx="${sx + 2}" cy="${by}" rx="9" ry="11" fill="white" opacity="0.8" style="animation:soulPulse 1.2s infinite"/>
    <circle cx="${sx + 2}" cy="${by}" r="4" fill="${acc}"/>
    ${mkParticles(sx + 2, by, sf, 6)}`;
}

function highElfArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  return genericArmor(level, tier, isRev, {
    id: `he${level}${isRev ? 'r' : 'l'}`,
    skinColor: isRev ? '#1a2030' : '#e8d5c0',
    armorBase: tier.color, accentBase: tier.accent,
    isRevenant: isRev, ancestryId: 'highelf',
    headFn: highElfHeadFn, weaponFn: highElfWeaponFn,
    extraFn: highElfThemeExtras, hasWings: true,
    w: 110, h: 200
  }, kit, weaponId, colorOverride);
}

// --- ORC ARMOR ---
function orcHeadFn(hx: number, hy: number, level: number, _tier: Tier, isRev: boolean, id: string, acc: string, sf: string, _arm: string, skin: string): string {
  let s = `<ellipse cx="${hx}" cy="${hy}" rx="22" ry="23" fill="${skin}"/>
  <path d="M${hx - 22},${hy - 12} Q${hx},${hy - 22} ${hx + 22},${hy - 12}" fill="${isRev ? '#0d1808' : '#3d5520'}"/>`;
  const ec = isRev ? '#7fffd4' : '#ff5722';
  s += `<ellipse cx="${hx - 9}" cy="${hy - 2}" rx="5" ry="4" fill="${ec}" ${isRev ? 'filter="url(#gf)"' : ''}/>
  <ellipse cx="${hx + 9}" cy="${hy - 2}" rx="5" ry="4" fill="${ec}" ${isRev ? 'filter="url(#gf)"' : ''}/>`;
  if (isRev) s += `<circle cx="${hx - 9}" cy="${hy - 2}" r="2.5" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <circle cx="${hx + 9}" cy="${hy - 2}" r="2.5" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
  s += `<path d="M${hx - 8},${hy + 10} Q${hx - 14},${hy + 20} ${hx - 17},${hy + 26}" stroke="${isRev ? '#c0c0c088' : '#f5f5f5'}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M${hx + 8},${hy + 10} Q${hx + 14},${hy + 20} ${hx + 17},${hy + 26}" stroke="${isRev ? '#c0c0c088' : '#f5f5f5'}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  s += `<line x1="${hx - 18}" y1="${hy - 10}" x2="${hx - 14}" y2="${hy + 8}" stroke="${acc}" stroke-width="2" opacity="0.7"/>
  <line x1="${hx + 18}" y1="${hy - 10}" x2="${hx + 14}" y2="${hy + 8}" stroke="${acc}" stroke-width="2" opacity="0.7"/>`;
  if (level >= 4) {
    s += `<path d="M${hx - 22},${hy - 8} Q${hx - 20},${hy - 28} ${hx},${hy - 30} Q${hx + 20},${hy - 28} ${hx + 22},${hy - 8}" fill="url(#ag_${id})" stroke="${acc}" stroke-width="0.8"/>`;
    if (level >= 7) s += `<path d="M${hx - 16},${hy - 28} Q${hx},${hy - 40} ${hx + 16},${hy - 28}" fill="url(#acc_${id})" filter="url(#gf)"/>
    <circle cx="${hx}" cy="${hy - 38}" r="4" fill="${sf}" filter="url(#gf)"/>`;
  }
  return s;
}

function orcWeaponFn(level: number, tier: Tier, isRev: boolean, id: string, acc: string, sf: string, _arm: string, w: number, h: number): string {
  const sx = w - 16, by = h * 0.18;
  const wl = h * 0.52 + level * 4;
  if (level <= 2) return `<rect x="${sx}" y="${by}" width="5" height="${wl}" rx="2" fill="${isRev ? '#1a2810' : acc}" opacity="0.9"/>
    <path d="M${sx},${by + 6} Q${sx - 16},${by - 2} ${sx - 14},${by + 18} Q${sx},${by + 22} ${sx},${by + 6}Z" fill="${acc}"/>
    <path d="M${sx + 5},${by + 6} Q${sx + 21},${by - 2} ${sx + 19},${by + 18} Q${sx + 5},${by + 22} ${sx + 5},${by + 6}Z" fill="${tier.color}cc"/>`;
  if (level <= 4) return `<rect x="${sx}" y="${by}" width="5" height="${wl}" rx="2" fill="${acc}" filter="url(#af_${id})"/>
    <path d="M${sx},${by + 8} Q${sx - 20},${by - 4} ${sx - 17},${by + 22} Q${sx},${by + 26} ${sx},${by + 8}Z" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx + 5},${by + 8} Q${sx + 25},${by - 4} ${sx + 22},${by + 22} Q${sx + 5},${by + 26} ${sx + 5},${by + 8}Z" fill="${acc}" filter="url(#gf)"/>
    <ellipse cx="${sx + 2.5}" cy="${by + 16}" rx="4" ry="5" fill="${sf}" filter="url(#gf)"/>`;
  if (level <= 6) return `<rect x="${sx - 1}" y="${by}" width="7" height="${wl}" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 1},${by + 10} Q${sx - 24},${by - 4} ${sx - 20},${by + 26} Q${sx - 1},${by + 30} ${sx - 1},${by + 10}Z" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx + 7},${by + 10} Q${sx + 30},${by - 4} ${sx + 26},${by + 26} Q${sx + 7},${by + 30} ${sx + 7},${by + 10}Z" fill="${acc}" filter="url(#gf)"/>
    <ellipse cx="${sx + 3}" cy="${by + 18}" rx="6" ry="7" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
  if (level <= 8) return `<rect x="${sx - 1}" y="${by - 4}" width="8" height="${wl + 4}" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 1},${by + 8} Q${sx - 28},${by - 8} ${sx - 22},${by + 28} Q${sx - 1},${by + 34} ${sx - 1},${by + 8}Z" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx + 7},${by + 8} Q${sx + 34},${by - 8} ${sx + 28},${by + 28} Q${sx + 7},${by + 34} ${sx + 7},${by + 8}Z" fill="${acc}" filter="url(#gf)"/>
    <line x1="${sx - 28}" y1="${by + 4}" x2="${sx + 34}" y2="${by + 4}" stroke="${sf}" stroke-width="3" filter="url(#gf)"/>
    <ellipse cx="${sx + 3}" cy="${by + 16}" rx="8" ry="9" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
  return `<rect x="${sx - 1}" y="${by - 6}" width="8" height="${wl + 6}" rx="3" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx - 1},${by + 6} Q${sx - 32},${by - 10} ${sx - 25},${by + 30} Q${sx - 1},${by + 36} ${sx - 1},${by + 6}Z" fill="${acc}" filter="url(#gf)"/>
    <path d="M${sx + 7},${by + 6} Q${sx + 38},${by - 10} ${sx + 31},${by + 30} Q${sx + 7},${by + 36} ${sx + 7},${by + 6}Z" fill="${acc}" filter="url(#gf)"/>
    <line x1="${sx - 32}" y1="${by + 2}" x2="${sx + 38}" y2="${by + 2}" stroke="${sf}" stroke-width="4" filter="url(#gf)"/>
    <ellipse cx="${sx + 3}" cy="${by + 14}" rx="10" ry="11" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
    <circle cx="${sx + 3}" cy="${by + 14}" r="5" fill="white" opacity="0.7"/>
    ${mkParticles(sx + 3, by + 14, sf, 6)}`;
}

function orcArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  return genericArmor(level, tier, isRev, {
    id: `o${level}${isRev ? 'r' : 'l'}`,
    skinColor: isRev ? '#1a2e10' : '#6d8c40',
    armorBase: tier.color, accentBase: tier.accent,
    isRevenant: isRev, ancestryId: 'orc',
    headFn: orcHeadFn, weaponFn: orcWeaponFn,
    extraFn: orcThemeExtras, w: 114, h: 206
  }, kit, weaponId, colorOverride);
}

// --- WODE ELF ARMOR ---
function wodeElfHeadFn(hx: number, hy: number, level: number, _tier: Tier, isRev: boolean, id: string, acc: string, sf: string, _arm: string, skin: string): string {
  let s = `<ellipse cx="${hx}" cy="${hy}" rx="18" ry="20" fill="${skin}"/>
  <path d="M${hx - 16},${hy - 14} Q${hx - 24},${hy - 28} ${hx - 20},${hy - 36} Q${hx - 14},${hy - 24} ${hx - 16},${hy - 14}Z" fill="${skin}"/>
  <path d="M${hx + 16},${hy - 14} Q${hx + 24},${hy - 28} ${hx + 20},${hy - 36} Q${hx + 14},${hy - 24} ${hx + 16},${hy - 14}Z" fill="${skin}"/>
  <path d="M${hx - 14},${hy - 18} Q${hx - 12},${hy - 30} ${hx},${hy - 32} Q${hx + 12},${hy - 30} ${hx + 14},${hy - 18}" fill="${isRev ? '#050808' : '#1b5e20'}"/>`;
  const ec = isRev ? '#7fffd4' : '#1b5e20';
  s += `<ellipse cx="${hx - 7}" cy="${hy}" rx="4" ry="3" fill="${ec}" ${isRev ? 'filter="url(#gf)"' : ''}/>
  <ellipse cx="${hx + 7}" cy="${hy}" rx="4" ry="3" fill="${ec}" ${isRev ? 'filter="url(#gf)"' : ''}/>`;
  if (isRev) s += `<circle cx="${hx - 7}" cy="${hy}" r="2" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <circle cx="${hx + 7}" cy="${hy}" r="2" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
  if (level >= 4) {
    s += `<path d="M${hx - 18},${hy - 8} Q${hx - 16},${hy - 28} ${hx},${hy - 30} Q${hx + 16},${hy - 28} ${hx + 18},${hy - 8}" fill="url(#ag_${id})" stroke="${acc}" stroke-width="0.8"/>`;
    s += `<path d="M${hx - 18},${hy - 14} Q${hx - 26},${hy - 22} ${hx - 20},${hy - 28} Q${hx - 14},${hy - 22} ${hx - 18},${hy - 14}Z" fill="${acc}" opacity="0.7"/>
    <path d="M${hx + 18},${hy - 14} Q${hx + 26},${hy - 22} ${hx + 20},${hy - 28} Q${hx + 14},${hy - 22} ${hx + 18},${hy - 14}Z" fill="${acc}" opacity="0.7"/>`;
    if (level >= 7) s += `<path d="M${hx - 10},${hy - 28} Q${hx},${hy - 42} ${hx + 10},${hy - 28}" fill="url(#acc_${id})" filter="url(#gf)"/>
    <circle cx="${hx}" cy="${hy - 40}" r="3" fill="${sf}" filter="url(#gf)"/>`;
  }
  return s;
}

function wodeElfWeaponFn(level: number, _tier: Tier, isRev: boolean, id: string, acc: string, sf: string, _arm: string, w: number, h: number): string {
  const sx = w - 8, by = h * 0.14;
  const bh = h * 0.58 + level * 3;
  if (level <= 2) return `<path d="M${sx},${by} Q${sx + 12},${by + bh * 0.5} ${sx},${by + bh}" stroke="${isRev ? '#1a0e06' : acc}" stroke-width="3.5" fill="none"/>
    <line x1="${sx}" y1="${by + 6}" x2="${sx}" y2="${by + bh - 6}" stroke="${sf}" stroke-width="1" opacity="0.8"/>`;
  if (level <= 4) return `<path d="M${sx},${by} Q${sx + 16},${by + bh * 0.5} ${sx},${by + bh}" stroke="${acc}" stroke-width="4" fill="none" filter="url(#af_${id})"/>
    <line x1="${sx}" y1="${by + 6}" x2="${sx}" y2="${by + bh - 6}" stroke="${sf}" stroke-width="1.5"/>
    <ellipse cx="${sx + 8}" cy="${by + bh * 0.5}" rx="4" ry="4" fill="${sf}" filter="url(#gf)"/>`;
  if (level <= 6) return `<path d="M${sx},${by} Q${sx + 20},${by + bh * 0.5} ${sx},${by + bh}" stroke="${acc}" stroke-width="4.5" fill="none" filter="url(#gf)"/>
    <line x1="${sx}" y1="${by + 6}" x2="${sx}" y2="${by + bh - 6}" stroke="${sf}" stroke-width="2"/>
    <ellipse cx="${sx + 10}" cy="${by + bh * 0.5}" rx="6" ry="6" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>
    <path d="M${sx},${by} L${sx - 4},${by - 8} L${sx + 4},${by - 4}" fill="${acc}"/>`;
  if (level <= 8) return `<path d="M${sx},${by} Q${sx + 24},${by + bh * 0.5} ${sx},${by + bh}" stroke="${acc}" stroke-width="5" fill="none" filter="url(#gf)"/>
    <line x1="${sx}" y1="${by + 6}" x2="${sx}" y2="${by + bh - 6}" stroke="${sf}" stroke-width="2.5"/>
    <ellipse cx="${sx + 12}" cy="${by + bh * 0.5}" rx="8" ry="8" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>
    <circle cx="${sx + 12}" cy="${by + bh * 0.5}" r="4" fill="white" opacity="0.7"/>
    <path d="M${sx},${by} L${sx - 5},${by - 10} L${sx + 5},${by - 5}" fill="${acc}" filter="url(#gf)"/>`;
  return `<path d="M${sx},${by} Q${sx + 28},${by + bh * 0.5} ${sx},${by + bh}" stroke="${acc}" stroke-width="5.5" fill="none" filter="url(#gf)"/>
    <line x1="${sx}" y1="${by + 6}" x2="${sx}" y2="${by + bh - 6}" stroke="${sf}" stroke-width="3" filter="url(#gf)"/>
    <ellipse cx="${sx + 14}" cy="${by + bh * 0.5}" rx="10" ry="10" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
    <circle cx="${sx + 14}" cy="${by + bh * 0.5}" r="5" fill="white" opacity="0.8"/>
    <path d="M${sx},${by} L${sx - 6},${by - 12} L${sx + 6},${by - 6}" fill="${acc}" filter="url(#gf)"/>
    ${mkParticles(sx + 14, by + bh * 0.5, sf, 5)}`;
}

function wodeElfArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  return genericArmor(level, tier, isRev, {
    id: `we${level}${isRev ? 'r' : 'l'}`,
    skinColor: isRev ? '#0d1e10' : '#66bb6a',
    armorBase: tier.color, accentBase: tier.accent,
    isRevenant: isRev, ancestryId: 'wodeelf',
    headFn: wodeElfHeadFn, weaponFn: wodeElfWeaponFn,
    extraFn: wodeElfThemeExtras, w: 110, h: 200
  }, kit, weaponId, colorOverride);
}

// ============================================================
// MEMONEK ARMOR
// ============================================================

function memonekArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const id = `m${level}${isRev ? 'r' : 'l'}`;
  const c = resolveColors(tier, isRev, 'memonek', colorOverride);
  const skin = c.skin, arm = c.armor, acc = c.accent, sf = c.gem;
  const glow = c.glow;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="196" viewBox="0 0 108 196" class="${isRev ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''}">
  ${defs(id, skin, arm, acc, glow, isRev)}`;

  if (tier.wings) svg += mkWings(54, 78, arm + 'aa', acc, level);

  // Crystal legs
  svg += `<rect x="32" y="128" width="16" height="58" rx="6" fill="${skin}"/>
  <rect x="60" y="128" width="16" height="58" rx="6" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="30" y="130" width="20" height="54" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="58" y="130" width="20" height="54" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <!-- joint rings -->
    <ellipse cx="40" cy="152" rx="12" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="68" cy="152" rx="12" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <!-- segment lines -->
    <line x1="40" y1="132" x2="40" y2="180" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
    <line x1="68" y1="132" x2="68" y2="180" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>`;
  }
  // Crystal feet
  svg += `<polygon points="28,183 52,183 50,192 30,192" fill="${isRev ? '#051015' : '#0288d1'}"/>
  <polygon points="56,183 80,183 78,192 58,192" fill="${isRev ? '#051015' : '#0288d1'}"/>`;

  // Crystal torso (geometric)
  svg += `<rect x="24" y="74" width="60" height="58" rx="12" fill="${skin}"/>
  <polygon points="54,76 84,84 84,122 54,130 24,122 24,84" fill="url(#ag_${id})" filter="url(#af_${id})"/>
  <polygon points="54,82 78,88 78,118 54,124 30,118 30,88" fill="none" stroke="${acc}" stroke-width="${0.8 + level * 0.15}" opacity="0.8"/>
  <polygon points="54,90 70,94 70,112 54,116 38,112 38,94" fill="${arm}66"/>`;

  // Crystal core gem
  svg += `<polygon points="54,96 62,100 62,108 54,112 46,108 46,100" fill="${sf}" filter="url(#gf)" style="animation:soulPulse ${2 - level * 0.1}s ease-in-out infinite"/>`;

  // Geometric patterns (more complex = higher level)
  for (let i = 0; i < level && i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const rx = 54 + Math.cos(ang) * 22;
    const ry = 103 + Math.sin(ang) * 16;
    svg += `<circle cx="${rx}" cy="${ry}" r="${1 + level * 0.2}" fill="${acc}" opacity="${0.4 + i * 0.05}" filter="url(#af_${id})"/>`;
  }

  // Arms (4-jointed crystal arms)
  svg += `<rect x="6" y="76" width="18" height="52" rx="8" fill="${skin}"/>
  <rect x="84" y="76" width="18" height="52" rx="8" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="5" y="86" width="20" height="38" rx="8" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="83" y="86" width="20" height="38" rx="8" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <ellipse cx="15" cy="104" rx="12" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="93" cy="104" rx="12" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<polygon points="2,126 20,122 24,128 20,134 2,130" fill="${skin}"/>
  <polygon points="84,122 102,126 106,130 102,134 84,128" fill="${skin}"/>`;

  // Neck
  svg += `<rect x="44" y="60" width="20" height="16" rx="8" fill="${skin}"/>`;
  if (level >= 3) svg += `<ellipse cx="54" cy="68" rx="14" ry="9" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;

  // Crystal head
  svg += `<polygon points="54,16 78,28 78,56 54,68 30,56 30,28" fill="${skin}"/>`;
  svg += `<polygon points="54,22 74,32 74,52 54,62 34,52 34,32" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  svg += `<polygon points="54,28 68,36 68,48 54,56 40,48 40,36" fill="${arm}88"/>`;

  // Crystal crown
  if (level >= 3) {
    svg += `<polygon points="54,16 58,6 62,16" fill="url(#acc_${id})" filter="url(#gf)"/>`;
    if (level >= 5) svg += `<polygon points="44,18 40,8 48,18" fill="url(#acc_${id})" filter="url(#gf)"/>
    <polygon points="64,18 68,8 60,18" fill="url(#acc_${id})" filter="url(#gf)"/>`;
    if (level >= 7) {
      svg += `<polygon points="36,22 30,12 38,24" fill="url(#acc_${id})" filter="url(#gf)"/>
      <polygon points="72,22 78,12 70,24" fill="url(#acc_${id})" filter="url(#gf)"/>`;
      svg += `<circle cx="54" cy="6" r="4" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    }
  }

  // Eyes
  const ey = isRev ? '#7fffd4' : '#0288d1';
  svg += `<ellipse cx="44" cy="38" rx="6" ry="5" fill="${ey}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <ellipse cx="64" cy="38" rx="6" ry="5" fill="${ey}" filter="url(#gf)" style="animation:soulPulse 2s infinite; animation-delay:0.3s"/>
  <ellipse cx="44" cy="38" rx="3" ry="2.5" fill="white" opacity="0.8"/>
  <ellipse cx="64" cy="38" rx="3" ry="2.5" fill="white" opacity="0.8"/>`;

  // Weapon: kit-routed (default: crystal shard blade)
  if (kit) {
    svg += getSelectedWeaponSvg(kit!, weaponId ?? undefined, level, acc, sf, id, 'memonek');
  } else {
    const wx = 92;
    if (level <= 2) {
      svg += `<polygon points="${wx},60 ${wx + 8},80 ${wx},160 ${wx - 8},80" fill="${acc}" opacity="0.8"/>`;
    } else if (level <= 4) {
      svg += `<polygon points="${wx},52 ${wx + 10},72 ${wx},160 ${wx - 10},72" fill="${acc}" filter="url(#af_${id})"/>
      <ellipse cx="${wx}" cy="60" rx="7" ry="9" fill="${sf}" filter="url(#gf)"/>`;
    } else if (level <= 6) {
      svg += `<polygon points="${wx},46 ${wx + 12},68 ${wx},162 ${wx - 12},68" fill="${acc}" filter="url(#gf)"/>
      <polygon points="${wx - 14},62 ${wx + 14},62 ${wx + 10},72 ${wx - 10},72" fill="${acc}"/>
      <ellipse cx="${wx}" cy="56" rx="9" ry="11" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    } else if (level <= 8) {
      svg += `<polygon points="${wx},40 ${wx + 14},65 ${wx},164 ${wx - 14},65" fill="${acc}" filter="url(#gf)"/>
      <polygon points="${wx - 16},58 ${wx + 16},58 ${wx + 12},70 ${wx - 12},70" fill="${acc}" filter="url(#gf)"/>
      <ellipse cx="${wx}" cy="50" rx="11" ry="13" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>
      <circle cx="${wx}" cy="50" r="5" fill="white" opacity="0.7"/>`;
    } else {
      svg += `<polygon points="${wx},34 ${wx + 16},62 ${wx},166 ${wx - 16},62" fill="${acc}" filter="url(#gf)"/>
      <polygon points="${wx - 18},54 ${wx + 18},54 ${wx + 14},68 ${wx - 14},68" fill="${acc}" filter="url(#gf)"/>
      <line x1="${wx - 18}" y1="50" x2="${wx + 18}" y2="50" stroke="${sf}" stroke-width="3" filter="url(#gf)"/>
      <ellipse cx="${wx}" cy="44" rx="13" ry="15" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
      <circle cx="${wx}" cy="44" r="6" fill="white" opacity="0.8"/>
      ${mkParticles(wx, 44, sf, 6)}`;
    }
  }

  if (tier.runes) svg += mkRunes(30, 94, 48, 0, acc, 6);
  if (tier.particles) svg += mkParticles(54, 38, acc, 8);

  svg += memonekThemeExtras(level, tier, isRev, id, acc, sf, arm, skin, 108, 196);

  svg += `</svg>`;
  return svg;
}

// ============================================================
// DRAGON KNIGHT ARMOR
// ============================================================

function dragonKnightArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const id = `dk${level}${isRev ? 'r' : 'l'}`;
  const c = resolveColors(tier, isRev, 'dragonknight', colorOverride);
  const skin = c.skin, arm = c.armor, acc = c.accent, sf = c.gem;
  const glow = c.glow;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="116" height="206" viewBox="0 0 116 206" class="${isRev ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''}">
  ${defs(id, skin, arm, acc, glow, isRev)}`;

  if (tier.wings) svg += mkWings(58, 84, arm + '88', acc, level);

  // Scaled legs
  svg += `<rect x="34" y="134" width="18" height="60" rx="5" fill="${skin}"/>
  <rect x="64" y="134" width="18" height="60" rx="5" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="32" y="136" width="22" height="56" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="62" y="136" width="22" height="56" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    // Scale pattern
    for (let i = 0; i < 3; i++) {
      svg += `<path d="M32,${140 + i * 14} Q43,${136 + i * 14} 54,${140 + i * 14} Q43,${144 + i * 14} 32,${140 + i * 14}Z" fill="${acc}" opacity="0.2"/>
      <path d="M62,${140 + i * 14} Q73,${136 + i * 14} 84,${140 + i * 14} Q73,${144 + i * 14} 62,${140 + i * 14}Z" fill="${acc}" opacity="0.2"/>`;
    }
    svg += `<ellipse cx="43" cy="158" rx="11" ry="7" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="73" cy="158" rx="11" ry="7" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
  }
  // Clawed feet
  svg += `<path d="M30,190 L54,190 L52,200 L32,200Z" fill="${isRev ? '#051015' : '#0d3b7a'}"/>
  <path d="M60,190 L84,190 L82,200 L62,200Z" fill="${isRev ? '#051015' : '#0d3b7a'}"/>`;
  if (level >= 3) {
    svg += `<line x1="36" y1="196" x2="32" y2="206" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
    <line x1="43" y1="198" x2="43" y2="206" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
    <line x1="50" y1="196" x2="54" y2="206" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
    <line x1="66" y1="196" x2="62" y2="206" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
    <line x1="73" y1="198" x2="73" y2="206" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
    <line x1="80" y1="196" x2="84" y2="206" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>`;
  }

  // Tail
  svg += `<path d="M82,150 Q106,138 104,168 Q102,180 96,174" stroke="${skin}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  if (level >= 4) svg += `<polygon points="96,174 104,186 91,180" fill="${acc}" opacity="0.7"/>`;

  // Torso (wide, draconic)
  svg += `<rect x="22" y="78" width="72" height="60" rx="10" fill="${skin}"/>
  <path d="M22,94 L58,80 L94,94 L94,128 L58,140 L22,128Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  svg += `<path d="M28,100 L58,88 L88,100 L88,124 L58,134 L28,124Z" fill="none" stroke="${acc}" stroke-width="${0.8 + level * 0.14}" opacity="0.7"/>`;

  // Scale chest
  for (let row = 0; row < 2 + Math.floor(level / 3); row++) {
    for (let col = 0; col < 4; col++) {
      svg += `<path d="M${30 + col * 16},${98 + row * 12} Q${38 + col * 16},${94 + row * 12} ${46 + col * 16},${98 + row * 12} Q${38 + col * 16},${102 + row * 12} ${30 + col * 16},${98 + row * 12}Z" fill="${acc}" opacity="${0.12 + level * 0.02}"/>`;
    }
  }

  // Chest gem
  svg += `<circle cx="58" cy="108" r="${3 + level * 0.4}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse ${2 - level * 0.1}s ease-in-out infinite"/>`;

  // Belt
  svg += `<rect x="22" y="132" width="72" height="8" rx="3" fill="${isRev ? '#0a1a15' : '#0d3b7a'}"/>
  <rect x="50" y="130" width="16" height="12" rx="2" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;

  // Pauldrons (draconic)
  if (level >= 3) {
    svg += `<path d="M22,96 Q2,84 0,66 Q10,70 16,84 Q18,88 22,96Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <path d="M94,96 Q114,84 116,66 Q106,70 100,84 Q98,88 94,96Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    if (level >= 5) {
      svg += `<path d="M2,68 Q-2,56 2,46 Q8,54 12,66Z" fill="url(#acc_${id})"/>
      <path d="M114,68 Q118,56 114,46 Q108,54 104,66Z" fill="url(#acc_${id})"/>`;
    }
    if (level >= 7) {
      svg += `<path d="M0,48 Q-4,38 2,28 Q8,36 10,48Z" fill="url(#acc_${id})"/>
      <path d="M116,48 Q120,38 114,28 Q108,36 106,48Z" fill="url(#acc_${id})"/>
      <circle cx="2" cy="28" r="5" fill="${sf}" filter="url(#gf)"/>
      <circle cx="114" cy="28" r="5" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  // Arms
  svg += `<rect x="4" y="80" width="20" height="52" rx="8" fill="${skin}"/>
  <rect x="92" y="80" width="20" height="52" rx="8" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="3" y="92" width="22" height="36" rx="7" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="91" y="92" width="22" height="36" rx="7" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    // Scale arms
    for (let i = 0; i < 2; i++) {
      svg += `<path d="M3,${95 + i * 12} Q14,${91 + i * 12} 25,${95 + i * 12} Q14,${99 + i * 12} 3,${95 + i * 12}Z" fill="${acc}" opacity="0.15"/>
      <path d="M91,${95 + i * 12} Q102,${91 + i * 12} 113,${95 + i * 12} Q102,${99 + i * 12} 91,${95 + i * 12}Z" fill="${acc}" opacity="0.15"/>`;
    }
  }
  svg += `<ellipse cx="14" cy="134" rx="11" ry="7" fill="${skin}"/>
  <ellipse cx="102" cy="134" rx="11" ry="7" fill="${skin}"/>`;
  // Claws
  svg += `<line x1="8" y1="138" x2="4" y2="146" stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  <line x1="14" y1="140" x2="14" y2="148" stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  <line x1="20" y1="138" x2="24" y2="146" stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  <line x1="96" y1="138" x2="92" y2="146" stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  <line x1="102" y1="140" x2="102" y2="148" stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  <line x1="108" y1="138" x2="112" y2="146" stroke="${acc}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`;

  // Neck/gorget
  svg += `<rect x="42" y="66" width="32" height="16" rx="7" fill="${skin}"/>`;
  if (level >= 3) svg += `<path d="M38,70 Q58,62 78,70 Q78,82 58,86 Q38,82 38,70Z" fill="url(#ag_${id})" stroke="${acc}" stroke-width="0.8"/>`;

  // Dragon head
  svg += `<path d="M22,44 Q24,24 58,20 Q92,24 94,44 Q100,62 58,68 Q16,62 22,44Z" fill="${skin}"/>
  <path d="M38,50 Q58,60 78,50 Q78,66 58,72 Q38,66 38,50Z" fill="${isRev ? '#0a1a15' : '#0d3b7a'}"/>`;
  // Nostrils
  svg += `<circle cx="50" cy="56" r="3" fill="${isRev ? '#0d2220' : '#1565c0'}"/>
  <circle cx="66" cy="56" r="3" fill="${isRev ? '#0d2220' : '#1565c0'}"/>`;

  // Dragon eyes
  const ey2 = isRev ? '#7fffd4' : '#ffeb3b';
  svg += `<ellipse cx="36" cy="38" rx="7" ry="6" fill="${ey2}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <ellipse cx="80" cy="38" rx="7" ry="6" fill="${ey2}" filter="url(#gf)" style="animation:soulPulse 2s infinite; animation-delay:0.3s"/>
  <ellipse cx="36" cy="38" rx="3" ry="4" fill="${isRev ? '#051015' : '#1a0000'}"/>
  <ellipse cx="80" cy="38" rx="3" ry="4" fill="${isRev ? '#051015' : '#1a0000'}"/>`;

  // Horns
  svg += `<path d="M32,26 Q24,10 28,2" stroke="${isRev ? '#0a1e18' : '#0a2a5c'}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M84,26 Q92,10 88,2" stroke="${isRev ? '#0a1e18' : '#0a2a5c'}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  if (level >= 4) {
    svg += `<path d="M32,26 Q24,10 28,2 Q30,12 32,26Z" fill="url(#acc_${id})" opacity="0.3"/>
    <path d="M84,26 Q92,10 88,2 Q86,12 84,26Z" fill="url(#acc_${id})" opacity="0.3"/>`;
    if (level >= 7) {
      svg += `<circle cx="28" cy="2" r="4" fill="${sf}" filter="url(#gf)"/>
      <circle cx="88" cy="2" r="4" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  // Helm
  if (level >= 4) {
    svg += `<path d="M24,40 Q26,20 58,16 Q90,20 92,40" fill="url(#ag_${id})" filter="url(#af_${id})" stroke="${acc}" stroke-width="0.8"/>`;
    if (level >= 6) svg += `<path d="M30,32 Q58,24 86,32" stroke="${acc}" stroke-width="2" fill="none"/>`;
    if (level >= 8) {
      svg += `<path d="M40,18 Q50,8 58,10 Q66,8 76,18" fill="url(#acc_${id})" filter="url(#gf)"/>
      <circle cx="58" cy="10" r="5" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  // Dragon weapon -- kit-routed (default: lance/glaive)
  if (kit) {
    svg += getSelectedWeaponSvg(kit!, weaponId ?? undefined, level, acc, sf, id, 'dragonknight');
  } else {
    const wx2 = 100;
    if (level <= 2) {
      svg += `<rect x="${wx2}" y="40" width="5" height="120" rx="2" fill="${acc}" opacity="0.9"/>
      <polygon points="${wx2 + 2.5},40 ${wx2 - 6},58 ${wx2 + 11},58" fill="${sf}"/>`;
    } else if (level <= 4) {
      svg += `<rect x="${wx2}" y="36" width="6" height="128" rx="3" fill="${acc}" filter="url(#af_${id})"/>
      <path d="M${wx2 + 3},36 L${wx2 - 8},58 L${wx2 + 14},58Z" fill="${sf}" filter="url(#gf)"/>
      <ellipse cx="${wx2 + 3}" cy="46" rx="5" ry="8" fill="${sf}" filter="url(#gf)"/>`;
    } else if (level <= 6) {
      svg += `<rect x="${wx2 - 1}" y="30" width="8" height="136" rx="3" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx2 + 3},30 L${wx2 - 12},56 L${wx2 + 18},56Z" fill="${sf}" filter="url(#gf)"/>
      <rect x="${wx2 - 8}" y="58" width="24" height="5" rx="2" fill="${acc}"/>
      <ellipse cx="${wx2 + 3}" cy="42" rx="7" ry="10" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    } else if (level <= 8) {
      svg += `<rect x="${wx2 - 1}" y="24" width="9" height="144" rx="4" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx2 + 3.5},24 L${wx2 - 15},54 L${wx2 + 22},54Z" fill="${sf}" filter="url(#gf)"/>
      <rect x="${wx2 - 10}" y="56" width="28" height="6" rx="3" fill="${acc}" filter="url(#gf)"/>
      <ellipse cx="${wx2 + 3.5}" cy="38" rx="9" ry="12" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>
      <circle cx="${wx2 + 3.5}" cy="38" r="4" fill="white" opacity="0.7"/>`;
    } else {
      svg += `<rect x="${wx2 - 2}" y="18" width="10" height="150" rx="4" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx2 + 3},18 L${wx2 - 18},52 L${wx2 + 24},52Z" fill="${sf}" filter="url(#gf)"/>
      <rect x="${wx2 - 12}" y="54" width="32" height="7" rx="3" fill="${acc}" filter="url(#gf)"/>
      <line x1="${wx2 - 14}" y1="58" x2="${wx2 + 20}" y2="58" stroke="${sf}" stroke-width="2" filter="url(#gf)"/>
      <ellipse cx="${wx2 + 3}" cy="34" rx="11" ry="14" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
      <circle cx="${wx2 + 3}" cy="34" r="5" fill="white" opacity="0.8"/>
      ${mkParticles(wx2 + 3, 34, sf, 6)}`;
    }
  }

  if (tier.runes) svg += mkRunes(28, 106, 60, 0, acc, 7);
  if (tier.particles) svg += mkParticles(58, 38, acc, 10);

  svg += dragonKnightThemeExtras(level, tier, isRev, id, acc, sf, arm, skin, 116, 206);

  svg += `</svg>`;
  return svg;
}

// ============================================================
// POLDER ARMOR
// ============================================================

function polderArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const id = `p${level}${isRev ? 'r' : 'l'}`;
  const c = resolveColors(tier, isRev, 'polder', colorOverride);
  const skin = c.skin, arm = c.armor, acc = c.accent, sf = c.gem;
  const glow = c.glow;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="165" viewBox="0 0 90 165" class="${isRev ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''}">
  ${defs(id, skin, arm, acc, glow, isRev)}`;

  if (tier.wings && level >= 7) svg += mkWings(45, 68, arm + '88', acc, level);

  // Short legs
  svg += `<rect x="26" y="106" width="14" height="46" rx="5" fill="${skin}"/>
  <rect x="50" y="106" width="14" height="46" rx="5" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="24" y="108" width="18" height="42" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="48" y="108" width="18" height="42" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <ellipse cx="33" cy="126" rx="10" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="57" cy="126" rx="10" ry="6" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
  }
  // Big hairy feet
  svg += `<ellipse cx="33" cy="152" rx="14" ry="7" fill="${isRev ? '#080806' : '#3e2010'}"/>
  <ellipse cx="57" cy="152" rx="14" ry="7" fill="${isRev ? '#080806' : '#3e2010'}"/>`;
  if (level >= 3) {
    // Fancy foot armor
    svg += `<path d="M20,150 L46,148 L47,156 L19,158Z" fill="url(#acc_${id})"/>
    <path d="M44,150 L70,148 L71,156 L43,158Z" fill="url(#acc_${id})"/>`;
  }

  // Shadow pool (polder trait -- bigger at higher levels)
  const shadowR = 20 + level * 3;
  svg += `<ellipse cx="45" cy="154" rx="${shadowR}" ry="${shadowR * 0.3}" fill="${isRev ? 'rgba(0,30,20,0.7)' : 'rgba(0,0,0,0.4)'}" filter="url(#gf)" style="animation:soulPulse ${2.5 - level * 0.15}s infinite"/>`;
  if (level >= 5) {
    // Shadow tendrils
    for (let i = 0; i < Math.floor(level / 2); i++) {
      const angle = (i / Math.floor(level / 2)) * Math.PI * 2;
      const tx = 45 + Math.cos(angle) * shadowR;
      const ty2 = 154 + Math.sin(angle) * shadowR * 0.3;
      svg += `<line x1="45" y1="154" x2="${tx}" y2="${ty2}" stroke="${isRev ? acc : '#000'}" stroke-width="1.5" opacity="${0.3 + i * 0.05}" style="animation:soulPulse ${1.5 + i * 0.2}s infinite"/>`;
    }
  }

  // Torso
  svg += `<rect x="20" y="64" width="50" height="46" rx="9" fill="${skin}"/>
  <path d="M20,76 L45,66 L70,76 L70,100 L45,110 L20,100Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
  <path d="M26,80 L45,72 L64,80 L64,97 L45,104 L26,97Z" fill="none" stroke="${acc}" stroke-width="${0.7 + level * 0.13}" opacity="0.7"/>`;
  // Fancy buttons
  svg += `<circle cx="45" cy="78" r="${2 + level * 0.25}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <circle cx="45" cy="88" r="${1.5 + level * 0.2}" fill="${sf}" opacity="0.7" filter="url(#gf)"/>`;
  if (level >= 5) svg += `<circle cx="45" cy="97" r="${1.5 + level * 0.15}" fill="${sf}" opacity="0.5" filter="url(#gf)"/>`;

  // Belt
  svg += `<rect x="20" y="104" width="50" height="7" rx="3" fill="${isRev ? '#0d0a08' : '#2d1a0e'}"/>
  <rect x="38" y="102" width="14" height="10" rx="2" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;

  // Arms
  svg += `<rect x="5" y="66" width="16" height="38" rx="6" fill="${skin}"/>
  <rect x="69" y="66" width="16" height="38" rx="6" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="4" y="74" width="18" height="26" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="68" y="74" width="18" height="26" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<ellipse cx="13" cy="106" rx="9" ry="6" fill="${skin}"/>
  <ellipse cx="77" cy="106" rx="9" ry="6" fill="${skin}"/>`;

  // Neck
  svg += `<rect x="38" y="54" width="14" height="12" rx="5" fill="${skin}"/>`;

  // Round head
  svg += `<ellipse cx="45" cy="40" rx="20" ry="22" fill="${skin}"/>`;
  // Big hat (iconic polder)
  svg += `<ellipse cx="45" cy="22" rx="18" ry="5" fill="${isRev ? '#080604' : '#2d1a0e'}"/>
  <rect x="30" y="8" width="30" height="15" rx="4" fill="${isRev ? '#0a0806' : '#3e2010'}"/>
  <ellipse cx="45" cy="8" rx="15" ry="4" fill="${isRev ? '#080604' : '#2d1a0e'}"/>`;
  if (level >= 3) {
    // Hat band
    svg += `<rect x="30" y="18" width="30" height="4" rx="2" fill="url(#acc_${id})"/>`;
    if (level >= 5) svg += `<circle cx="45" cy="8" r="3" fill="${sf}" filter="url(#gf)"/>`;
    if (level >= 7) {
      svg += `<path d="M32,8 Q38,2 45,4 Q52,2 58,8" stroke="${acc}" stroke-width="1.5" fill="none" filter="url(#gf)"/>`;
      if (level >= 9) svg += `<circle cx="32" cy="8" r="2.5" fill="${sf}" filter="url(#gf)"/>
      <circle cx="58" cy="8" r="2.5" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  // Cheeks / face
  if (!isRev) {
    svg += `<circle cx="34" cy="44" r="5" fill="#ff8a80" opacity="0.35"/>
    <circle cx="56" cy="44" r="5" fill="#ff8a80" opacity="0.35"/>`;
  }

  // Eyes
  const ey3 = isRev ? '#7fffd4' : '#1a0e06';
  svg += `<ellipse cx="37" cy="38" rx="4.5" ry="4" fill="${ey3}" ${isRev ? 'filter="url(#gf)"' : ''}/>
  <ellipse cx="53" cy="38" rx="4.5" ry="4" fill="${ey3}" ${isRev ? 'filter="url(#gf)"' : ''}/>`;
  if (isRev) svg += `<circle cx="37" cy="38" r="2" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <circle cx="53" cy="38" r="2" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;

  // Dagger/Shadow Blade weapon -- kit routed
  if (kit) {
    svg += getSelectedWeaponSvg(kit!, weaponId ?? undefined, level, acc, sf, id, 'polder');
  } else {
    const wx3 = 74;
    if (level <= 2) {
      svg += `<rect x="${wx3}" y="60" width="3.5" height="52" rx="1.5" fill="${acc}" opacity="0.9"/>
      <rect x="${wx3 - 6}" y="72" width="16" height="3" rx="1" fill="${acc}"/>`;
    } else if (level <= 4) {
      svg += `<rect x="${wx3}" y="56" width="4" height="58" rx="2" fill="${acc}" filter="url(#af_${id})"/>
      <rect x="${wx3 - 7}" y="68" width="18" height="4" rx="2" fill="${acc}"/>
      <polygon points="${wx3 + 2},56 ${wx3 - 4},68 ${wx3 + 8},68" fill="${sf}" filter="url(#gf)"/>`;
    } else if (level <= 6) {
      svg += `<rect x="${wx3 - 1}" y="52" width="5" height="64" rx="2" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx3 - 10},66 Q${wx3 + 1.5},56 ${wx3 + 13},66 Q${wx3 + 8},76 ${wx3 + 1.5},72 Q${wx3 - 5},76 ${wx3 - 10},66Z" fill="${sf}" filter="url(#gf)"/>
      <rect x="${wx3 - 8}" y="74" width="20" height="4" rx="2" fill="${acc}"/>`;
    } else if (level <= 8) {
      svg += `<rect x="${wx3 - 1}" y="48" width="5" height="70" rx="2" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx3 - 12},64 Q${wx3 + 1.5},50 ${wx3 + 15},64 Q${wx3 + 9},78 ${wx3 + 1.5},72 Q${wx3 - 6},78 ${wx3 - 12},64Z" fill="${sf}" filter="url(#gf)"/>
      <rect x="${wx3 - 9}" y="74" width="24" height="5" rx="2" fill="${acc}" filter="url(#gf)"/>
      <ellipse cx="${wx3 + 1.5}" cy="62" rx="6" ry="8" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    } else {
      svg += `<rect x="${wx3 - 1}" y="44" width="6" height="78" rx="3" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx3 - 14},62 Q${wx3 + 2},46 ${wx3 + 18},62 Q${wx3 + 12},80 ${wx3 + 2},74 Q${wx3 - 8},80 ${wx3 - 14},62Z" fill="${sf}" filter="url(#gf)"/>
      <rect x="${wx3 - 10}" y="76" width="28" height="6" rx="3" filter="url(#gf)" fill="${acc}"/>
      <ellipse cx="${wx3 + 2}" cy="60" rx="8" ry="10" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
      <circle cx="${wx3 + 2}" cy="60" r="4" fill="white" opacity="0.8"/>
      ${mkParticles(wx3 + 2, 60, sf, 5)}`;
    }
  }

  if (tier.runes) svg += mkRunes(22, 80, 46, 0, acc, 4);
  if (tier.particles) svg += mkParticles(45, 40, acc, 6);

  svg += polderThemeExtras(level, tier, isRev, id, acc, sf, arm, skin, 90, 165);

  svg += `</svg>`;
  return svg;
}

// ============================================================
// REVENANT ARMOR (revenantArmorBase in HTML)
// ============================================================

function revenantArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const id = `rv${level}${isRev ? 'r' : 'l'}`;
  const c = resolveColors(tier, isRev, 'revenant', colorOverride);
  const skin = isRev ? '#0f1e20' : (colorOverride?.skin || '#37474f');
  const arm = c.armor, acc = c.accent, glow = c.glow;
  const sf = '#7fffd4'; // soul fire always teal for revenant

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="198" viewBox="0 0 108 198" class="${isRev ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''}">
  ${defs(id, skin, arm, acc, glow, isRev)}`;

  // Soul mist / aura (always present)
  svg += `<ellipse cx="54" cy="154" rx="${25 + level * 3}" ry="${8 + level}" fill="${sf}" opacity="${0.05 + level * 0.012}" filter="url(#gf)" style="animation:soulPulse ${2 - level * 0.1}s infinite"/>`;

  if (tier.wings && level >= 7) svg += mkWings(54, 80, arm + 'aa', acc, level);

  // Skeletal legs
  svg += `<rect x="32" y="126" width="14" height="60" rx="5" fill="${skin}"/>
  <rect x="62" y="126" width="14" height="60" rx="5" fill="${skin}"/>`;

  // Bone armor legs
  if (level >= 2) {
    svg += `<rect x="30" y="128" width="18" height="56" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="60" y="128" width="18" height="56" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <!-- Rib-like knee caps -->
    <ellipse cx="39" cy="150" rx="11" ry="7" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="69" cy="150" rx="11" ry="7" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
    // Bone seam lines
    svg += `<line x1="39" y1="130" x2="39" y2="180" stroke="${acc}" stroke-width="1" opacity="0.3"/>
    <line x1="69" y1="130" x2="69" y2="180" stroke="${acc}" stroke-width="1" opacity="0.3"/>`;
  }

  // Feet
  svg += `<rect x="24" y="176" width="26" height="14" rx="4" fill="${isRev ? '#040a0c' : '#263238'}"/>
  <rect x="58" y="176" width="26" height="14" rx="4" fill="${isRev ? '#040a0c' : '#263238'}"/>`;

  // Tattered cloak (iconic revenant)
  const cloakOpacity = 0.5 + level * 0.04;
  svg += `<path d="M16,82 Q8,120 4,194" stroke="${arm}" stroke-width="${10 + level * 0.5}" fill="none" stroke-linecap="round" opacity="${cloakOpacity}"/>
  <path d="M92,82 Q100,120 104,194" stroke="${arm}" stroke-width="${10 + level * 0.5}" fill="none" stroke-linecap="round" opacity="${cloakOpacity}"/>`;
  if (level >= 5) {
    // Cloak tears
    svg += `<path d="M8,140 Q12,148 6,156" stroke="${acc}" stroke-width="0.8" fill="none" opacity="0.3"/>
    <path d="M100,140 Q96,148 102,156" stroke="${acc}" stroke-width="0.8" fill="none" opacity="0.3"/>`;
  }

  // TORSO with ribcage
  svg += `<rect x="22" y="76" width="64" height="54" rx="9" fill="${skin}"/>
  <path d="M22,90 L54,78 L86,90 L86,120 L54,130 L22,120Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;

  // Ribcage detail (revenant trait)
  for (let i = 0; i < 3 + Math.floor(level / 3); i++) {
    svg += `<path d="M28,${92 + i * 10} Q54,${88 + i * 10} 80,${92 + i * 10}" stroke="${acc}" stroke-width="1.2" fill="none" opacity="${0.25 + i * 0.04}"/>`;
  }
  svg += `<line x1="54" y1="80" x2="54" y2="128" stroke="${acc}" stroke-width="1" opacity="0.2"/>`;

  // Soul gem (always glowing)
  svg += `<circle cx="54" cy="104" r="${3 + level * 0.45}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse ${1.8 - level * 0.08}s ease-in-out infinite; filter:url(#gf)"/>`;

  // Armor chest
  svg += `<path d="M28,96 L54,86 L80,96 L80,120 L54,128 L28,120Z" fill="none" stroke="${acc}" stroke-width="${0.8 + level * 0.15}" opacity="0.7"/>`;

  // Belt / sash
  svg += `<rect x="22" y="124" width="64" height="8" rx="3" fill="${isRev ? '#04080a' : '#263238'}"/>
  <rect x="46" y="122" width="16" height="12" rx="2" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;

  // Pauldrons
  if (level >= 3) {
    svg += `<path d="M22,92 Q4,82 2,66 Q12,70 16,82 Q18,88 22,92Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <path d="M86,92 Q104,82 106,66 Q96,70 92,82 Q90,88 86,92Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    if (level >= 5) {
      svg += `<path d="M4,68 Q0,56 4,46 Q10,54 14,66Z" fill="url(#acc_${id})"/>
      <path d="M104,68 Q108,56 104,46 Q98,54 94,66Z" fill="url(#acc_${id})"/>`;
    }
    if (level >= 7) {
      svg += `<path d="M2,48 Q-2,38 4,28 Q10,36 12,48Z" fill="url(#acc_${id})"/>
      <path d="M106,48 Q110,38 104,28 Q98,36 96,48Z" fill="url(#acc_${id})"/>
      <circle cx="4" cy="28" r="5" fill="${sf}" filter="url(#gf)"/>
      <circle cx="104" cy="28" r="5" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  // Arms
  svg += `<rect x="4" y="78" width="20" height="46" rx="7" fill="${skin}"/>
  <rect x="84" y="78" width="20" height="46" rx="7" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="3" y="90" width="22" height="30" rx="7" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="83" y="90" width="22" height="30" rx="7" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<ellipse cx="14" cy="126" rx="11" ry="7" fill="${skin}"/>
  <ellipse cx="94" cy="126" rx="11" ry="7" fill="${skin}"/>`;
  // Bony fingers
  svg += `<line x1="8" y1="130" x2="5" y2="138" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
  <line x1="14" y1="132" x2="14" y2="140" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
  <line x1="20" y1="130" x2="23" y2="138" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
  <line x1="88" y1="130" x2="85" y2="138" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
  <line x1="94" y1="132" x2="94" y2="140" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
  <line x1="100" y1="130" x2="103" y2="138" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>`;

  // Neck
  svg += `<rect x="44" y="64" width="20" height="14" rx="5" fill="${skin}"/>`;
  if (level >= 3) svg += `<path d="M40,68 Q54,60 68,68 Q68,78 54,82 Q40,78 40,68Z" fill="url(#ag_${id})" stroke="${acc}" stroke-width="0.8"/>`;

  // SKULL HEAD
  svg += `<ellipse cx="54" cy="46" rx="24" ry="26" fill="${skin}"/>`;

  // Skull sutures
  svg += `<path d="M32,38 Q54,30 76,38" stroke="${acc}" stroke-width="0.8" fill="none" opacity="0.3"/>
  <line x1="54" y1="22" x2="54" y2="52" stroke="${acc}" stroke-width="0.5" opacity="0.2"/>`;

  // Helm
  if (level >= 4) {
    svg += `<path d="M30,50 Q32,24 54,20 Q76,24 78,50" fill="url(#ag_${id})" filter="url(#af_${id})" stroke="${acc}" stroke-width="0.8"/>`;
    // Crown-like helm top
    if (level >= 6) {
      svg += `<path d="M36,30 L30,18 L40,28 L46,14 L54,24 L62,14 L68,28 L78,18 L72,30" stroke="${acc}" stroke-width="2" fill="none" filter="url(#gf)"/>`;
    }
    if (level >= 8) {
      svg += `<path d="M40,20 Q46,8 54,6 Q62,8 68,20" fill="url(#acc_${id})" filter="url(#gf)"/>
      <circle cx="54" cy="6" r="5" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    }
  }

  // SKULL EYE SOCKETS (always glowing)
  const eyeSize = 6 + level * 0.4;
  svg += `<ellipse cx="40" cy="44" rx="${eyeSize}" ry="${eyeSize}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse ${2 - level * 0.1}s ease-in-out infinite"/>
  <ellipse cx="68" cy="44" rx="${eyeSize}" ry="${eyeSize}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse ${2 - level * 0.1}s ease-in-out infinite; animation-delay:0.3s"/>`;
  // Nasal cavity
  svg += `<path d="M50,55 Q54,60 58,55" stroke="${acc}" stroke-width="2" fill="none" opacity="0.5"/>`;
  // Teeth
  const toothW = 1.5 + level * 0.1;
  for (let i = 0; i < 6; i++) {
    svg += `<line x1="${38 + i * 6}" y1="64" x2="${38 + i * 6}" y2="${70 + level * 0.4}" stroke="${acc}" stroke-width="${toothW}" opacity="${0.4 + level * 0.04}"/>`;
  }

  // WEAPON -- kit-routed (default: soul scythe)
  if (kit) {
    svg += getSelectedWeaponSvg(kit!, weaponId ?? undefined, level, acc, sf, id, 'revenant');
  } else {
    const wx4 = 90;
    if (level <= 2) {
      svg += `<rect x="${wx4}" y="30" width="4" height="130" rx="2" fill="${arm}dd" stroke="${acc}" stroke-width="0.5"/>
      <path d="M${wx4 + 2},30 Q${wx4 - 20},40 ${wx4 - 18},60 Q${wx4},55 ${wx4 + 2},30Z" fill="${acc}" opacity="0.8"/>`;
    } else if (level <= 4) {
      svg += `<rect x="${wx4 - 1}" y="24" width="5" height="138" rx="2" fill="${arm}ee" filter="url(#af_${id})"/>
      <path d="M${wx4 + 1.5},24 Q${wx4 - 24},36 ${wx4 - 22},62 Q${wx4 + 1.5},56 ${wx4 + 1.5},24Z" fill="${acc}" filter="url(#gf)"/>
      <ellipse cx="${wx4 + 1.5}" cy="40" rx="5" ry="7" fill="${sf}" filter="url(#gf)"/>`;
    } else if (level <= 6) {
      svg += `<rect x="${wx4 - 1}" y="18" width="6" height="146" rx="3" fill="${arm}ee" filter="url(#gf)"/>
      <path d="M${wx4 + 2},18 Q${wx4 - 28},32 ${wx4 - 26},64 Q${wx4 + 2},58 ${wx4 + 2},18Z" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx4 - 28},38 L${wx4 + 8},38" stroke="${sf}" stroke-width="2"/>
      <ellipse cx="${wx4 + 2}" cy="32" rx="7" ry="9" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    } else if (level <= 8) {
      svg += `<rect x="${wx4 - 2}" y="12" width="7" height="154" rx="3" fill="${arm}ee" filter="url(#gf)"/>
      <path d="M${wx4 + 1.5},12 Q${wx4 - 32},28 ${wx4 - 30},66 Q${wx4 + 1.5},60 ${wx4 + 1.5},12Z" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx4 - 32},34 L${wx4 + 8},34" stroke="${sf}" stroke-width="3" filter="url(#gf)"/>
      <path d="M${wx4 - 34},38 L${wx4 + 10},38" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
      <ellipse cx="${wx4 + 1.5}" cy="26" rx="9" ry="11" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>
      <circle cx="${wx4 + 1.5}" cy="26" r="4" fill="white" opacity="0.7"/>`;
    } else {
      svg += `<rect x="${wx4 - 2}" y="6" width="7" height="162" rx="3" fill="${arm}ee" filter="url(#gf)"/>
      <path d="M${wx4 + 1.5},6 Q${wx4 - 36},24 ${wx4 - 34},68 Q${wx4 + 1.5},62 ${wx4 + 1.5},6Z" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx4 - 36},28 L${wx4 + 10},28" stroke="${sf}" stroke-width="4" filter="url(#gf)"/>
      <path d="M${wx4 - 38},32 L${wx4 + 12},32" stroke="${acc}" stroke-width="2" opacity="0.5"/>
      <ellipse cx="${wx4 + 1.5}" cy="20" rx="11" ry="13" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
      <circle cx="${wx4 + 1.5}" cy="20" r="5" fill="white" opacity="0.8"/>
      <circle cx="${wx4 + 1.5}" cy="20" r="2.5" fill="${acc}"/>
      ${mkParticles(wx4 + 1.5, 20, sf, 7)}`;
    }
  }

  if (tier.runes) svg += mkRunes(26, 98, 56, 0, acc, 7);
  if (tier.particles) svg += mkParticles(54, 44, sf, 10);

  svg += revenantThemeExtras(level, tier, isRev, id, acc, sf, arm, skin, 108, 198);

  svg += `</svg>`;
  return svg;
}

// ============================================================
// HAKAAN ARMOR
// ============================================================

function hakaanArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const id = `hk${level}${isRev ? 'r' : 'l'}`;
  const c = resolveColors(tier, isRev, 'hakaan', colorOverride);
  const skin = c.skin, arm = c.armor, acc = c.accent, sf = c.gem;
  const glow = c.glow;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="130" height="220" viewBox="0 0 130 220" class="${isRev ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''}">
  ${defs(id, skin, arm, acc, glow, isRev)}`;

  if (tier.wings && level >= 7) svg += mkWings(65, 96, arm + '88', acc, level);

  // TALL legs
  svg += `<rect x="38" y="148" width="20" height="62" rx="6" fill="${skin}"/>
  <rect x="72" y="148" width="20" height="62" rx="6" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="36" y="150" width="24" height="58" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="70" y="150" width="24" height="58" rx="6" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <ellipse cx="48" cy="172" rx="14" ry="8" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="82" cy="172" rx="14" ry="8" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<rect x="32" y="200" width="32" height="18" rx="5" fill="${isRev ? '#060a08' : '#1a0e06'}"/>
  <rect x="66" y="200" width="32" height="18" rx="5" fill="${isRev ? '#060a08' : '#1a0e06'}"/>`;

  // LARGE torso
  svg += `<rect x="24" y="88" width="82" height="64" rx="12" fill="${skin}"/>
  <path d="M24,104 L65,90 L106,104 L106,142 L65,152 L24,142Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
  <path d="M30,110 L65,98 L100,110 L100,138 L65,146 L30,138Z" fill="none" stroke="${acc}" stroke-width="${0.9 + level * 0.15}" opacity="0.7"/>`;

  // Third eye / doomsight (hakaan trait)
  const doomR = 4 + level * 0.5;
  svg += `<circle cx="65" cy="118" r="${doomR + 4}" fill="${arm}88"/>
  <circle cx="65" cy="118" r="${doomR}" fill="${isRev ? sf : '#800080'}" filter="url(#gf)" style="animation:soulPulse ${1.5 - level * 0.05}s ease-in-out infinite"/>`;

  // Ritual markings
  svg += `<line x1="34" y1="100" x2="44" y2="138" stroke="${acc}" stroke-width="1.5" opacity="0.4"/>
  <line x1="86" y1="100" x2="96" y2="138" stroke="${acc}" stroke-width="1.5" opacity="0.4"/>`;
  if (level >= 5) {
    svg += `<line x1="34" y1="108" x2="38" y2="130" stroke="${acc}" stroke-width="1" opacity="0.3"/>
    <line x1="92" y1="108" x2="96" y2="130" stroke="${acc}" stroke-width="1" opacity="0.3"/>`;
  }

  // Belt
  svg += `<rect x="24" y="144" width="82" height="10" rx="4" fill="${isRev ? '#0a1210' : '#2d1a0e'}"/>
  <rect x="56" y="142" width="18" height="14" rx="3" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;

  // Big pauldrons
  if (level >= 3) {
    svg += `<path d="M24,106 Q2,92 0,72 Q12,78 18,94Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <path d="M106,106 Q128,92 130,72 Q118,78 112,94Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    if (level >= 5) {
      svg += `<path d="M2,74 Q-2,60 2,48 Q10,58 14,72Z" fill="url(#acc_${id})"/>
      <path d="M128,74 Q132,60 128,48 Q120,58 116,72Z" fill="url(#acc_${id})"/>`;
    }
    if (level >= 7) {
      svg += `<path d="M0,50 Q-4,38 2,26 Q10,36 12,50Z" fill="url(#acc_${id})"/>
      <path d="M130,50 Q134,38 128,26 Q120,36 118,50Z" fill="url(#acc_${id})"/>
      <circle cx="2" cy="26" r="5" fill="${sf}" filter="url(#gf)"/>
      <circle cx="128" cy="26" r="5" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  // BIG arms
  svg += `<rect x="4" y="90" width="22" height="58" rx="8" fill="${skin}"/>
  <rect x="104" y="90" width="22" height="58" rx="8" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="3" y="104" width="24" height="40" rx="8" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="103" y="104" width="24" height="40" rx="8" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<ellipse cx="15" cy="150" rx="14" ry="9" fill="${skin}"/>
  <ellipse cx="115" cy="150" rx="14" ry="9" fill="${skin}"/>`;

  // Neck gorget
  svg += `<rect x="52" y="74" width="26" height="16" rx="7" fill="${skin}"/>`;
  if (level >= 3) svg += `<path d="M48,78 Q65,68 82,78 Q82,92 65,96 Q48,92 48,78Z" fill="url(#ag_${id})" stroke="${acc}" stroke-width="0.8"/>`;

  // Large head
  svg += `<ellipse cx="65" cy="56" rx="28" ry="30" fill="${skin}"/>`;
  // Helm
  if (level >= 4) {
    svg += `<path d="M38,62 Q40,28 65,22 Q90,28 92,62" fill="url(#ag_${id})" filter="url(#af_${id})" stroke="${acc}" stroke-width="0.8"/>`;
    if (level >= 6) svg += `<path d="M44,40 Q65,30 86,40" stroke="${acc}" stroke-width="2" fill="none"/>`;
    if (level >= 8) {
      svg += `<path d="M50,24 Q58,10 65,8 Q72,10 80,24" fill="url(#acc_${id})" filter="url(#gf)"/>
      <circle cx="65" cy="8" r="6" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    }
  }

  // Third eye on forehead (doomsight) - EXTRA prominent
  const fDoomR = 5 + level * 0.5;
  svg += `<circle cx="65" cy="42" r="${fDoomR}" fill="${isRev ? sf : '#800080'}" filter="url(#gf)" style="animation:soulPulse ${1.5 - level * 0.06}s ease-in-out infinite"/>`;
  if (level >= 5) svg += `<circle cx="65" cy="42" r="${fDoomR + 4}" fill="none" stroke="${isRev ? sf : '#800080'}" stroke-width="1" opacity="0.5" style="animation:rune 2s infinite"/>`;

  // Regular eyes
  const eyeC2 = isRev ? '#7fffd4' : '#2d1a0e';
  svg += `<ellipse cx="50" cy="54" rx="5" ry="4.5" fill="${eyeC2}" ${isRev ? 'filter="url(#gf)"' : ''}/>
  <ellipse cx="80" cy="54" rx="5" ry="4.5" fill="${eyeC2}" ${isRev ? 'filter="url(#gf)"' : ''}/>`;
  if (isRev) svg += `<circle cx="50" cy="54" r="2.5" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <circle cx="80" cy="54" r="2.5" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;

  // Nose/mouth
  svg += `<path d="M56,64 Q65,70 74,64" stroke="${isRev ? '#1a3028' : '#8d6e63'}" stroke-width="2" fill="none"/>`;

  // STAFF weapon -- kit-routed
  if (kit) {
    svg += getSelectedWeaponSvg(kit!, weaponId ?? undefined, level, acc, sf, id, 'hakaan');
  } else {
    const wx5 = 108;
    if (level <= 2) {
      svg += `<rect x="${wx5}" y="40" width="5" height="150" rx="2" fill="${arm}dd"/>
      <circle cx="${wx5 + 2.5}" cy="38" r="10" fill="${isRev ? sf : '#800080'}" opacity="0.7"/>
      <circle cx="${wx5 + 2.5}" cy="38" r="5" fill="white" opacity="0.5"/>`;
    } else if (level <= 4) {
      svg += `<rect x="${wx5}" y="36" width="6" height="156" rx="3" fill="${acc}" filter="url(#af_${id})"/>
      <circle cx="${wx5 + 3}" cy="32" r="13" fill="${isRev ? sf : '#800080'}" filter="url(#gf)" opacity="0.8"/>
      <circle cx="${wx5 + 3}" cy="32" r="7" fill="white" opacity="0.6"/>`;
    } else if (level <= 6) {
      svg += `<rect x="${wx5 - 1}" y="30" width="7" height="164" rx="3" fill="${acc}" filter="url(#gf)"/>
      <circle cx="${wx5 + 2.5}" cy="26" r="16" fill="${isRev ? sf : '#800080'}" filter="url(#gf)"/>
      <circle cx="${wx5 + 2.5}" cy="26" r="9" fill="white" opacity="0.7" style="animation:soulPulse 1.8s infinite"/>
      <circle cx="${wx5 + 2.5}" cy="26" r="4" fill="${acc}"/>`;
    } else if (level <= 8) {
      svg += `<rect x="${wx5 - 1}" y="24" width="8" height="170" rx="4" fill="${acc}" filter="url(#gf)"/>
      <circle cx="${wx5 + 3}" cy="18" r="18" fill="${isRev ? sf : '#800080'}" filter="url(#gf)"/>
      <circle cx="${wx5 + 3}" cy="18" r="10" fill="white" opacity="0.8" style="animation:soulPulse 1.5s infinite"/>
      <circle cx="${wx5 + 3}" cy="18" r="5" fill="${acc}"/>
      <path d="M${wx5 - 10},22 L${wx5 + 16},22" stroke="${sf}" stroke-width="2"/>`;
    } else {
      svg += `<rect x="${wx5 - 2}" y="18" width="9" height="178" rx="4" fill="${acc}" filter="url(#gf)"/>
      <circle cx="${wx5 + 2.5}" cy="10" r="22" fill="${isRev ? sf : '#800080'}" filter="url(#gf)"/>
      <circle cx="${wx5 + 2.5}" cy="10" r="12" fill="white" opacity="0.85" style="animation:soulPulse 1.2s infinite"/>
      <circle cx="${wx5 + 2.5}" cy="10" r="6" fill="${acc}"/>
      <path d="M${wx5 - 14},14 L${wx5 + 19},14" stroke="${sf}" stroke-width="3" filter="url(#gf)"/>
      <path d="M${wx5 - 16},18 L${wx5 + 21},18" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>
      ${mkParticles(wx5 + 2.5, 10, sf, 7)}`;
    }
  }

  if (tier.runes) svg += mkRunes(28, 112, 74, 0, acc, 8);
  if (tier.particles) svg += mkParticles(65, 56, acc, 10);

  svg += hakaanThemeExtras(level, tier, isRev, id, acc, sf, arm, skin, 130, 220);

  svg += `</svg>`;
  return svg;
}

// ============================================================
// TIME RAIDER ARMOR
// ============================================================

function timeRaiderArmor(level: number, tier: Tier, isRev: boolean, kit: { id: string; weaponClass: string } | undefined, weaponId: string | null, colorOverride?: ColorOverride): string {
  const id = `tr${level}${isRev ? 'r' : 'l'}`;
  const c = resolveColors(tier, isRev, 'timeraider', colorOverride);
  const skin = c.skin, arm = c.armor, acc = c.accent, sf = c.gem;
  const glow = c.glow;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="126" height="210" viewBox="0 0 126 210" class="${isRev ? 'rev-svg' : 'living-svg'}${level >= 7 ? ' high-lv' : ''}">
  ${defs(id, skin, arm, acc, glow, isRev)}`;

  if (tier.wings && level >= 7) svg += mkWings(63, 88, arm + '88', acc, level);

  // Legs
  svg += `<rect x="36" y="136" width="16" height="58" rx="5" fill="${skin}"/>
  <rect x="74" y="136" width="16" height="58" rx="5" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="34" y="138" width="20" height="54" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="72" y="138" width="20" height="54" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <ellipse cx="44" cy="160" rx="12" ry="7" fill="url(#acc_${id})" filter="url(#af_${id})"/>
    <ellipse cx="82" cy="160" rx="12" ry="7" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;
    // Tech panel lines
    svg += `<line x1="34" y1="148" x2="54" y2="148" stroke="${acc}" stroke-width="1" opacity="0.4"/>
    <line x1="72" y1="148" x2="92" y2="148" stroke="${acc}" stroke-width="1" opacity="0.4"/>`;
  }
  svg += `<rect x="28" y="186" width="28" height="16" rx="4" fill="${isRev ? '#050404' : '#2d1a0e'}"/>
  <rect x="70" y="186" width="28" height="16" rx="4" fill="${isRev ? '#050404' : '#2d1a0e'}"/>`;

  // Torso
  svg += `<rect x="22" y="82" width="82" height="58" rx="10" fill="${skin}"/>
  <path d="M22,96 L63,84 L104,96 L104,130 L63,140 L22,130Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;

  // Tech panels
  svg += `<rect x="28" y="92" width="22" height="20" rx="3" fill="${arm}99" stroke="${acc}" stroke-width="0.8"/>
  <rect x="76" y="92" width="22" height="20" rx="3" fill="${arm}99" stroke="${acc}" stroke-width="0.8"/>`;
  if (tier.runes) {
    svg += mkRunes(28, 104, 22, 0, acc, 3);
    svg += mkRunes(76, 104, 22, 0, acc, 3);
  } else {
    svg += `<text x="39" y="104" font-size="7" fill="${acc}" text-anchor="middle" opacity="0.7">\u2B21\u2B21</text>
    <text x="87" y="104" font-size="7" fill="${acc}" text-anchor="middle" opacity="0.7">\u2B21\u2B21</text>`;
  }
  // Circuit lines
  svg += `<line x1="22" y1="112" x2="104" y2="112" stroke="${acc}" stroke-width="1" opacity="0.4"/>
  <circle cx="63" cy="112" r="${3 + level * 0.3}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse ${1.8 - level * 0.08}s infinite"/>`;

  // Belt
  svg += `<rect x="22" y="134" width="82" height="8" rx="3" fill="${isRev ? '#080604' : '#2d1a0e'}"/>
  <rect x="54" y="132" width="18" height="12" rx="2" fill="url(#acc_${id})" filter="url(#af_${id})"/>`;

  // Pauldrons
  if (level >= 3) {
    svg += `<path d="M22,98 Q4,88 2,72 Q12,76 16,90Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <path d="M104,98 Q122,88 124,72 Q114,76 110,90Z" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
    if (level >= 5) {
      svg += `<path d="M4,74 Q0,62 4,52 Q10,60 14,72Z" fill="url(#acc_${id})"/>
      <path d="M122,74 Q126,62 122,52 Q116,60 112,72Z" fill="url(#acc_${id})"/>`;
    }
    if (level >= 7) {
      svg += `<circle cx="4" cy="52" r="5" fill="${sf}" filter="url(#gf)"/>
      <circle cx="122" cy="52" r="5" fill="${sf}" filter="url(#gf)"/>`;
    }
  }

  // 4 ARMS (Time Raider trait)
  // Upper arms
  svg += `<rect x="4" y="84" width="18" height="44" rx="7" fill="${skin}"/>
  <rect x="104" y="84" width="18" height="44" rx="7" fill="${skin}"/>`;
  if (level >= 2) {
    svg += `<rect x="3" y="94" width="20" height="30" rx="7" fill="url(#ag_${id})" filter="url(#af_${id})"/>
    <rect x="103" y="94" width="20" height="30" rx="7" fill="url(#ag_${id})" filter="url(#af_${id})"/>`;
  }
  svg += `<ellipse cx="13" cy="130" rx="11" ry="7" fill="${skin}"/>
  <ellipse cx="113" cy="130" rx="11" ry="7" fill="${skin}"/>`;

  // Lower arms (smaller)
  svg += `<rect x="6" y="106" width="14" height="36" rx="6" fill="${skin}88"/>
  <rect x="106" y="106" width="14" height="36" rx="6" fill="${skin}88"/>`;
  if (level >= 2) {
    svg += `<rect x="5" y="114" width="16" height="24" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})" opacity="0.7"/>
    <rect x="105" y="114" width="16" height="24" rx="5" fill="url(#ag_${id})" filter="url(#af_${id})" opacity="0.7"/>`;
  }
  svg += `<ellipse cx="13" cy="144" rx="9" ry="6" fill="${skin}88"/>
  <ellipse cx="113" cy="144" rx="9" ry="6" fill="${skin}88"/>`;

  // Neck
  svg += `<rect x="50" y="68" width="26" height="16" rx="7" fill="${skin}"/>`;

  // Head (insectoid with multi-eyes)
  svg += `<ellipse cx="63" cy="52" rx="24" ry="26" fill="${skin}"/>`;
  if (level >= 4) {
    svg += `<path d="M40,56 Q42,30 63,26 Q84,30 86,56" fill="url(#ag_${id})" filter="url(#af_${id})" stroke="${acc}" stroke-width="0.8"/>`;
    if (level >= 8) svg += `<path d="M46,28 Q54,14 63,12 Q72,14 80,28" fill="url(#acc_${id})" filter="url(#gf)"/>
    <circle cx="63" cy="12" r="5" fill="${sf}" filter="url(#gf)"/>`;
  }

  // Mandibles
  svg += `<path d="M44,62 Q36,72 34,82" stroke="${skin}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M82,62 Q90,72 92,82" stroke="${skin}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (level >= 3) svg += `<circle cx="34" cy="82" r="4" fill="${acc}" filter="url(#af_${id})"/>
  <circle cx="92" cy="82" r="4" fill="${acc}" filter="url(#af_${id})"/>`;

  // 4 eyes (time raider)
  const eyeC3 = isRev ? '#7fffd4' : '#ffcc02';
  svg += `<ellipse cx="48" cy="46" rx="6" ry="5" fill="${eyeC3}" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>
  <ellipse cx="58" cy="42" rx="5" ry="4.5" fill="${eyeC3}" filter="url(#gf)" style="animation:soulPulse 2s infinite; animation-delay:0.25s"/>
  <ellipse cx="68" cy="42" rx="5" ry="4.5" fill="${eyeC3}" filter="url(#gf)" style="animation:soulPulse 2s infinite; animation-delay:0.5s"/>
  <ellipse cx="78" cy="46" rx="6" ry="5" fill="${eyeC3}" filter="url(#gf)" style="animation:soulPulse 2s infinite; animation-delay:0.75s"/>`;
  svg += `<circle cx="48" cy="46" r="2.5" fill="${isRev ? '#050304' : '#1a0800'}"/>
  <circle cx="58" cy="42" r="2" fill="${isRev ? '#050304' : '#1a0800'}"/>
  <circle cx="68" cy="42" r="2" fill="${isRev ? '#050304' : '#1a0800'}"/>
  <circle cx="78" cy="46" r="2.5" fill="${isRev ? '#050304' : '#1a0800'}"/>`;

  // Time device on chest
  svg += `<circle cx="63" cy="112" r="${8 + level * 0.5}" fill="none" stroke="${acc}" stroke-width="1.5" opacity="0.7" style="animation:rune 2s infinite"/>
  <circle cx="63" cy="112" r="${5 + level * 0.3}" fill="none" stroke="${sf}" stroke-width="0.8" opacity="0.4"/>`;

  // Dual weapons (time raider has 4 arms = 2 weapons) -- kit-routed
  if (kit) {
    svg += getSelectedWeaponSvg(kit!, weaponId ?? undefined, level, acc, sf, id, 'timeraider');
    // Always show second weapon on off-hand for 4-armed time raider
    if (level >= 5) {
      svg += `<g opacity="0.6"><rect x="4" y="60" width="${3 + level * 0.2}" height="${80 + level * 3}" rx="2" fill="${acc}" filter="url(#gf)"/>
      <path d="M5.5,60 L-0.5,74 L11.5,74Z" fill="${sf}" filter="url(#gf)"/></g>`;
    }
  } else {
    // Primary weapon (right)
    const wx6 = 106;
    if (level <= 2) {
      svg += `<rect x="${wx6}" y="60" width="4" height="110" rx="2" fill="${acc}" opacity="0.9"/>
      <rect x="${wx6 - 7}" y="80" width="18" height="4" rx="1" fill="${acc}"/>
      <polygon points="${wx6 + 2},60 ${wx6 - 3},74 ${wx6 + 7},74" fill="${sf}"/>`;
    } else if (level <= 4) {
      svg += `<rect x="${wx6}" y="56" width="5" height="116" rx="2" fill="${acc}" filter="url(#af_${id})"/>
      <rect x="${wx6 - 8}" y="76" width="22" height="5" rx="2" fill="${acc}"/>
      <path d="M${wx6 + 2.5},56 L${wx6 - 4},70 L${wx6 + 9},70Z" fill="${sf}" filter="url(#gf)"/>
      <ellipse cx="${wx6 + 2.5}" cy="64" rx="4" ry="5" fill="${sf}" filter="url(#gf)"/>`;
    } else if (level <= 6) {
      svg += `<rect x="${wx6 - 1}" y="50" width="6" height="122" rx="3" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx6 - 10},68 Q${wx6 + 2},56 ${wx6 + 14},68 Q${wx6 + 8},80 ${wx6 + 2},74 Q${wx6 - 4},80 ${wx6 - 10},68Z" fill="${acc}" filter="url(#gf)"/>
      <rect x="${wx6 - 9}" y="78" width="24" height="5" rx="2" fill="${acc}"/>
      <ellipse cx="${wx6 + 2}" cy="64" rx="5" ry="6" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    } else if (level <= 8) {
      svg += `<rect x="${wx6 - 1}" y="44" width="7" height="130" rx="3" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx6 - 12},64 Q${wx6 + 2},50 ${wx6 + 16},64 Q${wx6 + 10},80 ${wx6 + 2},74 Q${wx6 - 6},80 ${wx6 - 12},64Z" fill="${acc}" filter="url(#gf)"/>
      <line x1="${wx6 - 14}" y1="74" x2="${wx6 + 18}" y2="74" stroke="${sf}" stroke-width="3"/>
      <ellipse cx="${wx6 + 2}" cy="60" rx="7" ry="8" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>
      <circle cx="${wx6 + 2}" cy="60" r="3" fill="white" opacity="0.7"/>`;
    } else {
      svg += `<rect x="${wx6 - 1}" y="38" width="7" height="138" rx="3" fill="${acc}" filter="url(#gf)"/>
      <path d="M${wx6 - 14},60 Q${wx6 + 2},44 ${wx6 + 18},60 Q${wx6 + 12},78 ${wx6 + 2},72 Q${wx6 - 8},78 ${wx6 - 14},60Z" fill="${acc}" filter="url(#gf)"/>
      <line x1="${wx6 - 16}" y1="70" x2="${wx6 + 20}" y2="70" stroke="${sf}" stroke-width="4" filter="url(#gf)"/>
      <ellipse cx="${wx6 + 2}" cy="56" rx="9" ry="10" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.2s infinite"/>
      <circle cx="${wx6 + 2}" cy="56" r="4" fill="white" opacity="0.8"/>
      ${mkParticles(wx6 + 2, 56, sf, 5)}`;
    }
    // Secondary weapon (left hand, appears at level 5+)
    if (level >= 5) {
      const wx7 = 4;
      const wlen7 = 80 + level * 3;
      svg += `<rect x="${wx7}" y="60" width="${3 + level * 0.2}" height="${wlen7}" rx="2" fill="${acc}" filter="url(#gf)" opacity="0.6"/>
      <path d="M${wx7 + 1.5},60 L${wx7 - 6},74 L${wx7 + 9},74Z" fill="${sf}" opacity="0.7" filter="url(#gf)"/>`;
    }
  }

  if (tier.particles) svg += mkParticles(63, 52, acc, 10);

  svg += timeRaiderThemeExtras(level, tier, isRev, id, acc, sf, arm, skin, 126, 210);

  svg += `</svg>`;
  return svg;
}

// ============================================================
// EXPORTS
// ============================================================

export type AncestryRendererFn = (
  level: number,
  tier: Tier,
  isRev: boolean,
  kit: { id: string; weaponClass: string } | undefined,
  weaponId: string | null,
  colorOverride?: ColorOverride,
) => string;

export const ANCESTRY_RENDERERS: Record<string, AncestryRendererFn> = {
  devil: devilArmor,
  dragonknight: dragonKnightArmor,
  dwarf: dwarfArmor,
  hakaan: hakaanArmor,
  highelf: highElfArmor,
  human: humanArmor,
  memonek: memonekArmor,
  orc: orcArmor,
  polder: polderArmor,
  revenant: revenantArmor,
  timeraider: timeRaiderArmor,
  wodeelf: wodeElfArmor,
};

export function renderAncestryModel(
  ancestryId: string | null,
  level: number,
  isRev: boolean,
  kitId: string | null,
  weaponId: string | null,
  colorOverride?: ColorOverride,
): string {
  if (!ancestryId) return '';
  const mapped = ANCESTRY_ID_MAP[ancestryId] || ancestryId;
  const tier = getTier(level);

  let kit: { id: string; weaponClass: string } | undefined;
  if (kitId) {
    const mappedKit = KIT_ID_MAP[kitId] || kitId;
    const kitDef = KITS[mappedKit];
    kit = kitDef
      ? { id: mappedKit, weaponClass: kitDef.weaponClass }
      : { id: mappedKit, weaponClass: 'unarmed' };
  }

  const renderer = ANCESTRY_RENDERERS[mapped];
  if (!renderer) return '';

  const svg = renderer(level, tier, isRev, kit, weaponId, colorOverride);

  // Pad the viewBox so weapons, wings, and head decorations aren't clipped.
  // Also remove fixed width/height so the SVG scales to fill its container.
  return svg
    .replace(
      /viewBox="(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)"/,
      (_, x, y, w, h) => {
        const pad = { left: 25, top: 25, right: 35, bottom: 10 };
        return `viewBox="${Number(x) - pad.left} ${Number(y) - pad.top} ${Number(w) + pad.left + pad.right} ${Number(h) + pad.top + pad.bottom}"`;
      },
    )
    .replace(/\s+width="\d+\.?\d*"/, '')
    .replace(/\s+height="\d+\.?\d*"/, '');
}
