// Color replacement approach: each model stores raw SVG + color mappings
// At render time, we do string.replaceAll to swap clothing/hair colors

export interface AncestryModelData {
  living: string;
  revenant: string;
  viewW: number;
  viewH: number;
  clothingColors: { original: string; role: 'primary' | 'dark' | 'light' | 'accent' }[];
  hairColor: string | null;
  defaultClothingColor: string;
  defaultHairColor: string;
  handR: { x: number; y: number };
  handL: { x: number; y: number };
  /** Torso bounding box for armor placement */
  torso: { x: number; y: number; w: number; h: number };
  backPos: { x: number; y: number };
  hasHair: boolean;
  /** Head center (for hair overlay positioning) */
  headCenter: { x: number; y: number };
}

// ---- Revenant filter defs shared by all revenant SVGs ----
const REV_FILTER_DEFS = `<defs>
      <filter id="rev-glow">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="soul-fire">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.5  0 0 0 0 1  0 0 0 0 0.8  0 0 0 1 0"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

function revWrap(content: string, w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${REV_FILTER_DEFS}
    <g class="rev-glow">
    ${content}
    </g>
  </svg>`;
}

// =============================================================================
// DEVIL
// =============================================================================

const devilLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="145" viewBox="0 0 80 145">
    <defs><radialGradient id="dSkin" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#c0392b"/><stop offset="100%" stop-color="#7b0d0d"/></radialGradient></defs>
    <!-- legs --><rect x="26" y="105" width="10" height="35" rx="3" fill="#6b0a0a"/>
    <rect x="44" y="105" width="10" height="35" rx="3" fill="#6b0a0a"/>
    <!-- hooves --><ellipse cx="31" cy="140" rx="7" ry="4" fill="#1a0505"/>
    <ellipse cx="49" cy="140" rx="7" ry="4" fill="#1a0505"/>
    <!-- torso --><rect x="20" y="62" width="40" height="46" rx="6" fill="url(#dSkin)"/>
    <!-- tail --><path d="M60 95 Q80 85 75 110 Q70 120 65 115" stroke="#7b0d0d" stroke-width="4" fill="none" stroke-linecap="round"/>
    <polygon points="65,115 70,125 60,118" fill="#5a0808"/>
    <!-- arms --><rect x="8" y="65" width="13" height="38" rx="5" fill="#b03020"/>
    <rect x="59" y="65" width="13" height="38" rx="5" fill="#b03020"/>
    <!-- hands --><ellipse cx="14" cy="104" rx="7" ry="5" fill="#c0392b"/>
    <ellipse cx="66" cy="104" rx="7" ry="5" fill="#c0392b"/>
    <!-- neck --><rect x="33" y="50" width="14" height="14" rx="4" fill="#b03020"/>
    <!-- head --><ellipse cx="40" cy="37" rx="18" ry="20" fill="url(#dSkin)"/>
    <!-- horns --><path d="M28 22 Q22 8 26 2" stroke="#3d0a0a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M52 22 Q58 8 54 2" stroke="#3d0a0a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- eyes --><ellipse cx="33" cy="36" rx="4" ry="3" fill="#ff6600"/>
    <ellipse cx="47" cy="36" rx="4" ry="3" fill="#ff6600"/>
    <circle cx="33" cy="36" r="2" fill="#1a0000"/>
    <circle cx="47" cy="36" r="2" fill="#1a0000"/>
    <!-- eyebrows --><path d="M29 31 L37 33" stroke="#3d0a0a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M43 33 L51 31" stroke="#3d0a0a" stroke-width="2.5" stroke-linecap="round"/>
    <!-- smile --><path d="M33 46 Q40 51 47 46" stroke="#5a0808" stroke-width="2" fill="none"/>
    <!-- fangs --><polygon points="37,48 39,53 41,48" fill="white"/>
    <!-- wing stubs --><path d="M20 70 Q5 60 8 45 Q12 55 20 62" fill="#5a0808" opacity="0.7"/>
    <path d="M60 70 Q75 60 72 45 Q68 55 60 62" fill="#5a0808" opacity="0.7"/>
    <!-- armor chest piece --><path d="M24 70 L40 78 L56 70 L56 85 L40 93 L24 85Z" fill="rgba(0,0,0,0.3)" stroke="#ff6600" stroke-width="1"/>
  </svg>`;

const devilRevenant = revWrap(`
    <!-- legs --><rect x="26" y="105" width="10" height="35" rx="3" fill="#1a3330"/>
    <rect x="44" y="105" width="10" height="35" rx="3" fill="#1a3330"/>
    <ellipse cx="31" cy="140" rx="7" ry="4" fill="#0a1a15"/>
    <ellipse cx="49" cy="140" rx="7" ry="4" fill="#0a1a15"/>
    <!-- torso --><rect x="20" y="62" width="40" height="46" rx="6" fill="#1e3d38"/>
    <!-- cracks --><line x1="32" y1="65" x2="28" y2="90" stroke="#7fffd4" stroke-width="1" opacity="0.6"/>
    <line x1="48" y1="70" x2="52" y2="95" stroke="#7fffd4" stroke-width="0.8" opacity="0.4"/>
    <!-- tail --><path d="M60 95 Q80 85 75 110 Q70 120 65 115" stroke="#2a5540" stroke-width="4" fill="none"/>
    <polygon points="65,115 70,125 60,118" fill="#1a3a2a"/>
    <!-- arms --><rect x="8" y="65" width="13" height="38" rx="5" fill="#1e3d38"/>
    <rect x="59" y="65" width="13" height="38" rx="5" fill="#1e3d38"/>
    <ellipse cx="14" cy="104" rx="7" ry="5" fill="#1e3d38"/>
    <ellipse cx="66" cy="104" rx="7" ry="5" fill="#1e3d38"/>
    <!-- neck --><rect x="33" y="50" width="14" height="14" rx="4" fill="#1a3330"/>
    <!-- head --><ellipse cx="40" cy="37" rx="18" ry="20" fill="#1e3d38"/>
    <!-- cracks head --><line x1="36" y1="20" x2="32" y2="45" stroke="#7fffd4" stroke-width="0.8" opacity="0.5"/>
    <!-- horns --><path d="M28 22 Q22 8 26 2" stroke="#0d2218" stroke-width="5" fill="none"/>
    <path d="M52 22 Q58 8 54 2" stroke="#0d2218" stroke-width="5" fill="none"/>
    <!-- soul eyes --><ellipse cx="33" cy="36" rx="5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="47" cy="36" rx="5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- horn glow --><ellipse cx="26" cy="2" rx="3" ry="3" fill="#7fffd4" opacity="0.5" filter="url(#soul-fire)"/>
    <ellipse cx="54" cy="2" rx="3" ry="3" fill="#7fffd4" opacity="0.5" filter="url(#soul-fire)"/>
    <!-- wing stubs --><path d="M20 70 Q5 60 8 45 Q12 55 20 62" fill="#0d2218" opacity="0.8"/>
    <path d="M60 70 Q75 60 72 45 Q68 55 60 62" fill="#0d2218" opacity="0.8"/>
    <!-- armor --><path d="M24 70 L40 78 L56 70 L56 85 L40 93 L24 85Z" fill="rgba(0,0,0,0.4)" stroke="#7fffd4" stroke-width="1" opacity="0.6"/>
    <!-- soul aura --><ellipse cx="40" cy="37" rx="22" ry="24" fill="none" stroke="#7fffd4" stroke-width="0.5" opacity="0.3"/>
  `, 80, 145);

// =============================================================================
// DRAGON KNIGHT
// =============================================================================

const dragonKnightLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="145" viewBox="0 0 80 145">
    <defs><linearGradient id="dkScale" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565c0"/><stop offset="100%" stop-color="#0d3b7a"/></linearGradient>
    <linearGradient id="dkArmor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#64b5f6"/><stop offset="100%" stop-color="#1976d2"/></linearGradient></defs>
    <!-- legs --><rect x="25" y="102" width="12" height="38" rx="3" fill="url(#dkScale)"/>
    <rect x="43" y="102" width="12" height="38" rx="3" fill="url(#dkScale)"/>
    <!-- scale pattern legs --><path d="M25 110 Q31 107 37 110 Q31 113 25 110Z" fill="#1976d2" opacity="0.5"/>
    <path d="M43 110 Q49 107 55 110 Q49 113 43 110Z" fill="#1976d2" opacity="0.5"/>
    <!-- tail --><path d="M55 108 Q72 100 70 125 Q68 135 62 130" stroke="#1565c0" stroke-width="6" fill="none" stroke-linecap="round"/>
    <!-- feet --><ellipse cx="31" cy="140" rx="8" ry="4" fill="#0d3b7a"/>
    <ellipse cx="49" cy="140" rx="8" ry="4" fill="#0d3b7a"/>
    <!-- torso armor --><rect x="18" y="58" width="44" height="46" rx="7" fill="url(#dkArmor)"/>
    <!-- scale chest --><path d="M22 65 Q31 60 40 65 Q49 60 58 65 Q49 70 40 68 Q31 70 22 65Z" fill="#1565c0" opacity="0.6"/>
    <path d="M22 78 Q31 73 40 78 Q49 73 58 78 Q49 83 40 81 Q31 83 22 78Z" fill="#1565c0" opacity="0.5"/>
    <!-- arms with scales --><rect x="6" y="60" width="13" height="40" rx="5" fill="url(#dkScale)"/>
    <rect x="61" y="60" width="13" height="40" rx="5" fill="url(#dkScale)"/>
    <!-- clawed hands --><ellipse cx="12" cy="102" rx="7" ry="5" fill="#1565c0"/>
    <ellipse cx="67" cy="102" rx="7" ry="5" fill="#1565c0"/>
    <!-- neck --><rect x="32" y="46" width="16" height="14" rx="4" fill="#1976d2"/>
    <!-- dragon head --><path d="M16 26 Q18 10 40 10 Q62 10 64 26 Q68 42 40 48 Q12 44 16 26Z" fill="url(#dkScale)"/>
    <!-- snout --><path d="M28 38 Q40 44 52 38 Q52 50 40 54 Q28 50 28 38Z" fill="#0d3b7a"/>
    <!-- nostrils --><circle cx="36" cy="43" r="2" fill="#1565c0"/>
    <circle cx="44" cy="43" r="2" fill="#1565c0"/>
    <!-- eyes --><ellipse cx="28" cy="28" rx="5" ry="4" fill="#ffeb3b"/>
    <ellipse cx="52" cy="28" rx="5" ry="4" fill="#ffeb3b"/>
    <ellipse cx="28" cy="28" rx="2" ry="3" fill="#1a0000"/>
    <ellipse cx="52" cy="28" rx="2" ry="3" fill="#1a0000"/>
    <!-- horns --><path d="M24 18 Q18 4 22 -2" stroke="#0a2a5c" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M56 18 Q62 4 58 -2" stroke="#0a2a5c" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- crest --><path d="M30 12 Q35 4 40 8 Q45 2 50 10" stroke="#64b5f6" stroke-width="3" fill="none"/>
  </svg>`;

const dragonKnightRevenant = revWrap(`
    <!-- legs --><rect x="25" y="102" width="12" height="38" rx="3" fill="#1a3d30"/>
    <rect x="43" y="102" width="12" height="38" rx="3" fill="#1a3d30"/>
    <ellipse cx="31" cy="140" rx="8" ry="4" fill="#0a1f18"/>
    <ellipse cx="49" cy="140" rx="8" ry="4" fill="#0a1f18"/>
    <!-- tail --><path d="M55 108 Q72 100 70 125 Q68 135 62 130" stroke="#1a3d30" stroke-width="6" fill="none"/>
    <!-- torso --><rect x="18" y="58" width="44" height="46" rx="7" fill="#1e4030"/>
    <!-- scale cracks --><path d="M22 65 Q31 60 40 65 Q49 60 58 65 Q49 70 40 68 Q31 70 22 65Z" fill="#7fffd4" opacity="0.15"/>
    <line x1="35" y1="60" x2="30" y2="98" stroke="#7fffd4" stroke-width="0.8" opacity="0.4"/>
    <!-- arms --><rect x="6" y="60" width="13" height="40" rx="5" fill="#1a3d30"/>
    <rect x="61" y="60" width="13" height="40" rx="5" fill="#1a3d30"/>
    <ellipse cx="12" cy="102" rx="7" ry="5" fill="#1a3d30"/>
    <ellipse cx="67" cy="102" rx="7" ry="5" fill="#1a3d30"/>
    <!-- neck --><rect x="32" y="46" width="16" height="14" rx="4" fill="#1a3d30"/>
    <!-- head --><path d="M16 26 Q18 10 40 10 Q62 10 64 26 Q68 42 40 48 Q12 44 16 26Z" fill="#1e4030"/>
    <!-- snout --><path d="M28 38 Q40 44 52 38 Q52 50 40 54 Q28 50 28 38Z" fill="#0d2218"/>
    <!-- soul eyes --><ellipse cx="28" cy="28" rx="6" ry="5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="52" cy="28" rx="6" ry="5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- horns --><path d="M24 18 Q18 4 22 -2" stroke="#0a2218" stroke-width="5" fill="none"/>
    <path d="M56 18 Q62 4 58 -2" stroke="#0a2218" stroke-width="5" fill="none"/>
    <!-- crest glow --><path d="M30 12 Q35 4 40 8 Q45 2 50 10" stroke="#7fffd4" stroke-width="2" fill="none" opacity="0.5"/>
    <!-- soul aura --><path d="M16 26 Q18 10 40 10 Q62 10 64 26 Q68 42 40 48 Q12 44 16 26Z" fill="none" stroke="#7fffd4" stroke-width="0.5" opacity="0.3"/>
  `, 80, 145);

// =============================================================================
// DWARF (weapon stripped: axe removed)
// =============================================================================

const dwarfLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="130" viewBox="0 0 72 130">
    <defs><linearGradient id="dwArmor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9e9e9e"/><stop offset="100%" stop-color="#546e7a"/></linearGradient></defs>
    <!-- stocky legs --><rect x="20" y="90" width="13" height="34" rx="4" fill="#546e7a"/>
    <rect x="39" y="90" width="13" height="34" rx="4" fill="#546e7a"/>
    <!-- boots --><rect x="17" y="117" width="18" height="11" rx="3" fill="#2d1a0e"/>
    <rect x="37" y="117" width="18" height="11" rx="3" fill="#2d1a0e"/>
    <!-- broad torso --><rect x="12" y="54" width="48" height="40" rx="8" fill="url(#dwArmor)"/>
    <!-- armor details --><rect x="16" y="58" width="40" height="8" rx="2" fill="#b0bec5" opacity="0.5"/>
    <circle cx="36" cy="75" r="4" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>
    <!-- belt --><rect x="12" y="88" width="48" height="6" rx="2" fill="#2d1a0e"/>
    <rect x="32" y="87" width="8" height="8" rx="1" fill="#ffd700"/>
    <!-- thick arms --><rect x="2" y="56" width="12" height="32" rx="5" fill="#607d8b"/>
    <rect x="58" y="56" width="12" height="32" rx="5" fill="#607d8b"/>
    <!-- hands --><ellipse cx="8" cy="89" rx="7" ry="5" fill="#8d6e63"/>
    <ellipse cx="64" cy="89" rx="7" ry="5" fill="#8d6e63"/>
    <!-- neck --><rect x="30" y="44" width="12" height="12" rx="3" fill="#8d6e63"/>
    <!-- head --><ellipse cx="36" cy="32" rx="17" ry="19" fill="#8d6e63"/>
    <!-- helmet --><path d="M20 28 Q20 12 36 10 Q52 12 52 28" fill="#607d8b" stroke="#9e9e9e" stroke-width="1"/>
    <!-- eyes --><ellipse cx="28" cy="32" rx="3.5" ry="3" fill="#4a2f1a"/>
    <ellipse cx="44" cy="32" rx="3.5" ry="3" fill="#4a2f1a"/>
    <!-- bushy brows --><path d="M23 27 Q28 24 33 27" stroke="#2d1a0e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M39 27 Q44 24 49 27" stroke="#2d1a0e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- beard --><path d="M22 40 Q36 52 50 40 Q48 58 36 62 Q24 58 22 40Z" fill="#5d4037"/>
    <!-- beard braids --><line x1="32" y1="52" x2="30" y2="62" stroke="#3e2723" stroke-width="2"/>
    <line x1="40" y1="52" x2="42" y2="62" stroke="#3e2723" stroke-width="2"/>
    <circle cx="30" cy="63" r="3" fill="#ffd700"/>
    <circle cx="42" cy="63" r="3" fill="#ffd700"/>
  </svg>`;

const dwarfRevenant = revWrap(`
    <!-- legs --><rect x="20" y="90" width="13" height="34" rx="4" fill="#1a2e30"/>
    <rect x="39" y="90" width="13" height="34" rx="4" fill="#1a2e30"/>
    <rect x="17" y="117" width="18" height="11" rx="3" fill="#0d1210"/>
    <rect x="37" y="117" width="18" height="11" rx="3" fill="#0d1210"/>
    <!-- torso --><rect x="12" y="54" width="48" height="40" rx="8" fill="#1e3530"/>
    <!-- cracks --><line x1="20" y1="58" x2="16" y2="88" stroke="#7fffd4" stroke-width="0.8" opacity="0.5"/>
    <line x1="48" y1="60" x2="52" y2="88" stroke="#7fffd4" stroke-width="0.8" opacity="0.4"/>
    <!-- belt --><rect x="12" y="88" width="48" height="6" rx="2" fill="#0d1a18"/>
    <rect x="32" y="87" width="8" height="8" rx="1" fill="#7fffd4" opacity="0.6"/>
    <!-- arms --><rect x="2" y="56" width="12" height="32" rx="5" fill="#1a3530"/>
    <rect x="58" y="56" width="12" height="32" rx="5" fill="#1a3530"/>
    <ellipse cx="8" cy="89" rx="7" ry="5" fill="#1a2e28"/>
    <ellipse cx="64" cy="89" rx="7" ry="5" fill="#1a2e28"/>
    <!-- neck --><rect x="30" y="44" width="12" height="12" rx="3" fill="#1a2e28"/>
    <!-- head --><ellipse cx="36" cy="32" rx="17" ry="19" fill="#1e3530"/>
    <!-- helmet --><path d="M20 28 Q20 12 36 10 Q52 12 52 28" fill="#1a3530" stroke="#7fffd4" stroke-width="0.5" opacity="0.4"/>
    <!-- soul eyes --><ellipse cx="28" cy="32" rx="4.5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="44" cy="32" rx="4.5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- ghost beard --><path d="M22 40 Q36 52 50 40 Q48 58 36 62 Q24 58 22 40Z" fill="#1a3530" opacity="0.8"/>
    <line x1="32" y1="52" x2="30" y2="62" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
    <line x1="40" y1="52" x2="42" y2="62" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
  `, 72, 130);

// =============================================================================
// HAKAAN (weapon stripped: staff removed)
// =============================================================================

const hakaanLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="155" viewBox="0 0 90 155">
    <defs><linearGradient id="hkSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8c99a"/><stop offset="100%" stop-color="#b8865a"/></linearGradient></defs>
    <!-- tall legs --><rect x="26" y="108" width="14" height="42" rx="5" fill="#8d6e63"/>
    <rect x="50" y="108" width="14" height="42" rx="5" fill="#8d6e63"/>
    <!-- boots --><rect x="22" y="140" width="21" height="13" rx="4" fill="#1a0e06"/>
    <rect x="47" y="140" width="21" height="13" rx="4" fill="#1a0e06"/>
    <!-- large torso --><rect x="16" y="62" width="58" height="50" rx="9" fill="url(#hkSkin)"/>
    <!-- simple garment --><path d="M20 68 L45 75 L70 68 L70 100 L45 108 L20 100Z" fill="rgba(0,0,0,0.15)"/>
    <!-- belt --><rect x="16" y="104" width="58" height="8" rx="3" fill="#4a2f1a"/>
    <!-- big arms --><rect x="2" y="64" width="15" height="46" rx="6" fill="#c8a078"/>
    <rect x="73" y="64" width="15" height="46" rx="6" fill="#c8a078"/>
    <!-- hands --><ellipse cx="9" cy="112" rx="9" ry="6" fill="#b8865a"/>
    <ellipse cx="81" cy="112" rx="9" ry="6" fill="#b8865a"/>
    <!-- neck --><rect x="36" y="50" width="18" height="14" rx="5" fill="#c8a078"/>
    <!-- big head --><ellipse cx="45" cy="35" rx="21" ry="22" fill="url(#hkSkin)"/>
    <!-- third eye (doomsight) --><ellipse cx="45" cy="22" rx="5" ry="4" fill="#800080"/>
    <ellipse cx="45" cy="22" rx="3" ry="2.5" fill="#ff00ff" opacity="0.6"/>
    <!-- regular eyes --><ellipse cx="34" cy="35" rx="4" ry="3.5" fill="#2d1a0e"/>
    <ellipse cx="56" cy="35" rx="4" ry="3.5" fill="#2d1a0e"/>
    <!-- brow ridge --><path d="M28 29 Q34 26 40 29" stroke="#8d6e63" stroke-width="3" fill="none"/>
    <path d="M50 29 Q56 26 62 29" stroke="#8d6e63" stroke-width="3" fill="none"/>
    <!-- mouth --><path d="M36 46 Q45 50 54 46" stroke="#8d6e63" stroke-width="2" fill="none"/>
    <!-- ritual markings --><line x1="22" y1="74" x2="30" y2="100" stroke="#ff69b4" stroke-width="1.5" opacity="0.6"/>
    <line x1="60" y1="74" x2="68" y2="100" stroke="#ff69b4" stroke-width="1.5" opacity="0.6"/>
  </svg>`;

const hakaanRevenant = revWrap(`
    <!-- legs --><rect x="26" y="108" width="14" height="42" rx="5" fill="#1e2e2a"/>
    <rect x="50" y="108" width="14" height="42" rx="5" fill="#1e2e2a"/>
    <rect x="22" y="140" width="21" height="13" rx="4" fill="#080f0c"/>
    <rect x="47" y="140" width="21" height="13" rx="4" fill="#080f0c"/>
    <!-- torso --><rect x="16" y="62" width="58" height="50" rx="9" fill="#1e3530"/>
    <!-- garment --><path d="M20 68 L45 75 L70 68 L70 100 L45 108 L20 100Z" fill="rgba(127,255,212,0.05)"/>
    <!-- belt --><rect x="16" y="104" width="58" height="8" rx="3" fill="#0d1a15"/>
    <!-- cracks --><line x1="28" y1="66" x2="22" y2="104" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
    <line x1="58" y1="68" x2="64" y2="104" stroke="#7fffd4" stroke-width="0.8" opacity="0.3"/>
    <!-- arms --><rect x="2" y="64" width="15" height="46" rx="6" fill="#1a3028"/>
    <rect x="73" y="64" width="15" height="46" rx="6" fill="#1a3028"/>
    <ellipse cx="9" cy="112" rx="9" ry="6" fill="#1a3028"/>
    <ellipse cx="81" cy="112" rx="9" ry="6" fill="#1a3028"/>
    <!-- neck --><rect x="36" y="50" width="18" height="14" rx="5" fill="#1a3028"/>
    <!-- head --><ellipse cx="45" cy="35" rx="21" ry="22" fill="#1e3530"/>
    <!-- doom eye revenant --><ellipse cx="45" cy="22" rx="6" ry="5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- soul eyes --><ellipse cx="34" cy="35" rx="5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="56" cy="35" rx="5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- ritual cracks --><line x1="22" y1="74" x2="30" y2="100" stroke="#7fffd4" stroke-width="1" opacity="0.3"/>
    <line x1="60" y1="74" x2="68" y2="100" stroke="#7fffd4" stroke-width="1" opacity="0.3"/>
  `, 90, 155);

// =============================================================================
// HIGH ELF (weapon stripped: staff + crystal removed)
// =============================================================================

const highElfLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="74" height="145" viewBox="0 0 74 145">
    <defs><linearGradient id="heSilk" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8d5ff"/><stop offset="100%" stop-color="#9c64d0"/></linearGradient></defs>
    <!-- flowing robes --><path d="M18 65 Q15 90 12 140 L37 140 L37 65Z" fill="url(#heSilk)"/>
    <path d="M56 65 Q59 90 62 140 L37 140 L37 65Z" fill="#b39ddb"/>
    <!-- robe details --><path d="M22 85 Q37 88 52 85" stroke="#7e57c2" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M20 105 Q37 108 54 105" stroke="#7e57c2" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M18 125 Q37 128 56 125" stroke="#7e57c2" stroke-width="1" fill="none" opacity="0.5"/>
    <!-- star emblem --><circle cx="37" cy="78" r="5" fill="#ffd700" opacity="0.8"/>
    <path d="M37 72 L38.5 76 L42 76 L39.5 78.5 L40.5 82 L37 80 L33.5 82 L34.5 78.5 L32 76 L35.5 76Z" fill="#fff" opacity="0.9"/>
    <!-- slim torso --><rect x="22" y="56" width="30" height="40" rx="5" fill="url(#heSilk)" opacity="0.7"/>
    <!-- arms --><rect x="10" y="58" width="12" height="36" rx="5" fill="#b39ddb"/>
    <rect x="52" y="58" width="12" height="36" rx="5" fill="#b39ddb"/>
    <!-- long hands --><ellipse cx="16" cy="95" rx="6" ry="4" fill="#d8c8f0"/>
    <ellipse cx="58" cy="95" rx="6" ry="4" fill="#d8c8f0"/>
    <!-- neck --><rect x="31" y="46" width="12" height="12" rx="4" fill="#e8d5c0"/>
    <!-- elegant head --><ellipse cx="37" cy="33" rx="16" ry="19" fill="#e8d5c0"/>
    <!-- crown --><path d="M24 20 L27 12 L30 20 L33 10 L37 16 L41 10 L44 20 L47 12 L50 20" fill="none" stroke="#ffd700" stroke-width="2"/>
    <circle cx="37" cy="16" r="3" fill="#ffd700"/>
    <!-- pointed ears --><path d="M21 30 Q14 27 16 22 Q20 26 21 30Z" fill="#e8d5c0"/>
    <path d="M53 30 Q60 27 58 22 Q54 26 53 30Z" fill="#e8d5c0"/>
    <!-- eyes --><ellipse cx="29" cy="34" rx="4" ry="3" fill="#4a0080"/>
    <ellipse cx="45" cy="34" rx="4" ry="3" fill="#4a0080"/>
    <ellipse cx="29" cy="33" rx="2" ry="1.5" fill="#cc99ff" opacity="0.8"/>
    <ellipse cx="45" cy="33" rx="2" ry="1.5" fill="#cc99ff" opacity="0.8"/>
    <!-- eyebrows --><path d="M25 29 Q29 26 33 29" stroke="#6a2080" stroke-width="1.5" fill="none"/>
    <path d="M41 29 Q45 26 49 29" stroke="#6a2080" stroke-width="1.5" fill="none"/>
    <!-- hair --><path d="M22 20 Q20 8 30 5 Q37 3 44 5 Q54 8 52 20" fill="#c8a0e8"/>
  </svg>`;

const highElfRevenant = revWrap(`
    <!-- robes --><path d="M18 65 Q15 90 12 140 L37 140 L37 65Z" fill="#1a1228"/>
    <path d="M56 65 Q59 90 62 140 L37 140 L37 65Z" fill="#160e22"/>
    <!-- robe lines --><path d="M22 85 Q37 88 52 85" stroke="#7fffd4" stroke-width="0.8" fill="none" opacity="0.3"/>
    <path d="M20 105 Q37 108 54 105" stroke="#7fffd4" stroke-width="0.8" fill="none" opacity="0.3"/>
    <!-- emblem --><circle cx="37" cy="78" r="5" fill="none" stroke="#7fffd4" stroke-width="1" opacity="0.6"/>
    <!-- torso --><rect x="22" y="56" width="30" height="40" rx="5" fill="#1a1228" opacity="0.8"/>
    <!-- arms --><rect x="10" y="58" width="12" height="36" rx="5" fill="#1a1228"/>
    <rect x="52" y="58" width="12" height="36" rx="5" fill="#1a1228"/>
    <ellipse cx="16" cy="95" rx="6" ry="4" fill="#1a2030"/>
    <ellipse cx="58" cy="95" rx="6" ry="4" fill="#1a2030"/>
    <!-- cracks in robe --><line x1="25" y1="68" x2="20" y2="100" stroke="#7fffd4" stroke-width="0.8" opacity="0.35"/>
    <!-- neck --><rect x="31" y="46" width="12" height="12" rx="4" fill="#1a2030"/>
    <!-- head --><ellipse cx="37" cy="33" rx="16" ry="19" fill="#1a2030"/>
    <!-- crown --><path d="M24 20 L27 12 L30 20 L33 10 L37 16 L41 10 L44 20 L47 12 L50 20" fill="none" stroke="#7fffd4" stroke-width="1.5" opacity="0.5"/>
    <!-- ears --><path d="M21 30 Q14 27 16 22 Q20 26 21 30Z" fill="#1a2030"/>
    <path d="M53 30 Q60 27 58 22 Q54 26 53 30Z" fill="#1a2030"/>
    <!-- soul eyes --><ellipse cx="29" cy="34" rx="5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="45" cy="34" rx="5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- hair --><path d="M22 20 Q20 8 30 5 Q37 3 44 5 Q54 8 52 20" fill="#0d0a1a"/>
  `, 74, 145);

// =============================================================================
// HUMAN (weapon stripped: sword removed)
// =============================================================================

const humanLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="74" height="145" viewBox="0 0 74 145">
    <!-- legs --><rect x="23" y="100" width="12" height="40" rx="4" fill="#5d4037"/>
    <rect x="39" y="100" width="12" height="40" rx="4" fill="#5d4037"/>
    <!-- boots --><rect x="20" y="132" width="17" height="11" rx="3" fill="#1a0e06"/>
    <rect x="37" y="132" width="17" height="11" rx="3" fill="#1a0e06"/>
    <!-- tabard --><path d="M18 62 L18 100 L37 100 L37 62Z" fill="#c62828"/>
    <path d="M37 62 L37 100 L56 100 L56 62Z" fill="#b71c1c"/>
    <!-- cross emblem --><rect x="33" y="72" width="8" height="18" rx="1" fill="#ffd700"/>
    <rect x="29" y="78" width="16" height="6" rx="1" fill="#ffd700"/>
    <!-- torso under --><rect x="18" y="58" width="38" height="45" rx="6" fill="#757575"/>
    <!-- belt --><rect x="18" y="98" width="38" height="5" rx="2" fill="#2d1a0e"/>
    <!-- arms with bracers --><rect x="6" y="60" width="13" height="38" rx="5" fill="#757575"/>
    <rect x="55" y="60" width="13" height="38" rx="5" fill="#757575"/>
    <rect x="6" y="85" width="13" height="10" rx="3" fill="#5d4037"/>
    <rect x="55" y="85" width="13" height="10" rx="3" fill="#5d4037"/>
    <!-- hands --><ellipse cx="12" cy="100" rx="7" ry="5" fill="#c8a080"/>
    <ellipse cx="62" cy="100" rx="7" ry="5" fill="#c8a080"/>
    <!-- neck --><rect x="31" y="48" width="12" height="12" rx="4" fill="#c8a080"/>
    <!-- head --><ellipse cx="37" cy="34" rx="16" ry="18" fill="#c8a080"/>
    <!-- hair --><path d="M22 26 Q22 12 37 10 Q52 12 52 26" fill="#4a2f1a"/>
    <!-- eyes --><ellipse cx="29" cy="34" rx="3.5" ry="3" fill="#2d1a0e"/>
    <ellipse cx="45" cy="34" rx="3.5" ry="3" fill="#2d1a0e"/>
    <!-- eyebrows --><path d="M25 29 Q29 27 33 29" stroke="#3d2010" stroke-width="2" fill="none"/>
    <path d="M41 29 Q45 27 49 29" stroke="#3d2010" stroke-width="2" fill="none"/>
    <!-- nose --><path d="M35 37 Q37 40 39 37" stroke="#a07858" stroke-width="1.5" fill="none"/>
    <!-- mouth --><path d="M31 44 Q37 48 43 44" stroke="#8d6040" stroke-width="2" fill="none"/>
    <!-- supernatural aura (human trait) --><circle cx="37" cy="34" r="20" fill="none" stroke="#fff8dc" stroke-width="0.5" opacity="0.4"/>
  </svg>`;

const humanRevenant = revWrap(`
    <!-- legs --><rect x="23" y="100" width="12" height="40" rx="4" fill="#1a1510"/>
    <rect x="39" y="100" width="12" height="40" rx="4" fill="#1a1510"/>
    <rect x="20" y="132" width="17" height="11" rx="3" fill="#080504"/>
    <rect x="37" y="132" width="17" height="11" rx="3" fill="#080504"/>
    <!-- tabard --><path d="M18 62 L18 100 L37 100 L37 62Z" fill="#2a0808"/>
    <path d="M37 62 L37 100 L56 100 L56 62Z" fill="#220606"/>
    <!-- cross --><rect x="33" y="72" width="8" height="18" rx="1" fill="#7fffd4" opacity="0.4"/>
    <rect x="29" y="78" width="16" height="6" rx="1" fill="#7fffd4" opacity="0.4"/>
    <!-- torso --><rect x="18" y="58" width="38" height="45" rx="6" fill="#1e2828"/>
    <!-- cracks --><line x1="25" y1="62" x2="20" y2="98" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
    <line x1="45" y1="65" x2="50" y2="96" stroke="#7fffd4" stroke-width="0.8" opacity="0.3"/>
    <!-- arms --><rect x="6" y="60" width="13" height="38" rx="5" fill="#1e2828"/>
    <rect x="55" y="60" width="13" height="38" rx="5" fill="#1e2828"/>
    <ellipse cx="12" cy="100" rx="7" ry="5" fill="#1a2020"/>
    <ellipse cx="62" cy="100" rx="7" ry="5" fill="#1a2020"/>
    <!-- neck --><rect x="31" y="48" width="12" height="12" rx="4" fill="#1a2020"/>
    <!-- head --><ellipse cx="37" cy="34" rx="16" ry="18" fill="#1e2828"/>
    <!-- hair --><path d="M22 26 Q22 12 37 10 Q52 12 52 26" fill="#0d0806"/>
    <!-- soul eyes --><ellipse cx="29" cy="34" rx="4.5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="45" cy="34" rx="4.5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- supernatural aura revenant --><circle cx="37" cy="34" r="20" fill="none" stroke="#7fffd4" stroke-width="0.8" opacity="0.3"/>
  `, 74, 145);

// =============================================================================
// MEMONEK
// =============================================================================

const memonekLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="74" height="145" viewBox="0 0 74 145">
    <defs><linearGradient id="memSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#4fc3f7"/></linearGradient></defs>
    <!-- legs --><rect x="23" y="100" width="11" height="40" rx="4" fill="url(#memSkin)"/>
    <rect x="40" y="100" width="11" height="40" rx="4" fill="url(#memSkin)"/>
    <!-- crystal feet --><ellipse cx="28" cy="140" rx="7" ry="4" fill="#0288d1"/>
    <ellipse cx="45" cy="140" rx="7" ry="4" fill="#0288d1"/>
    <!-- torso --><rect x="18" y="58" width="38" height="45" rx="8" fill="url(#memSkin)"/>
    <!-- geometric patterns --><polygon points="37,63 44,70 37,77 30,70" fill="none" stroke="#0288d1" stroke-width="1.5"/>
    <polygon points="37,68 41,72 37,76 33,72" fill="#81d4fa" opacity="0.5"/>
    <!-- joint seams --><line x1="18" y1="80" x2="56" y2="80" stroke="#0288d1" stroke-width="0.8" opacity="0.4"/>
    <!-- arms --><rect x="6" y="60" width="13" height="38" rx="6" fill="#b3e5fc"/>
    <rect x="55" y="60" width="13" height="38" rx="6" fill="#b3e5fc"/>
    <!-- joint rings --><ellipse cx="12" cy="80" rx="8" ry="4" fill="#4fc3f7" opacity="0.5"/>
    <ellipse cx="62" cy="80" rx="8" ry="4" fill="#4fc3f7" opacity="0.5"/>
    <!-- hands crystal --><ellipse cx="12" cy="99" rx="7" ry="5" fill="#4fc3f7"/>
    <ellipse cx="62" cy="99" rx="7" ry="5" fill="#4fc3f7"/>
    <!-- neck --><rect x="31" y="48" width="12" height="12" rx="5" fill="#b3e5fc"/>
    <!-- head --><ellipse cx="37" cy="33" rx="17" ry="19" fill="url(#memSkin)"/>
    <!-- geometric face lines --><path d="M24 28 Q37 24 50 28" stroke="#0288d1" stroke-width="0.8" opacity="0.4"/>
    <path d="M24 38 Q37 42 50 38" stroke="#0288d1" stroke-width="0.8" opacity="0.4"/>
    <!-- eyes --><ellipse cx="29" cy="32" rx="5" ry="4" fill="#0288d1"/>
    <ellipse cx="45" cy="32" rx="5" ry="4" fill="#0288d1"/>
    <ellipse cx="29" cy="32" rx="2.5" ry="2" fill="#fff" opacity="0.9"/>
    <ellipse cx="45" cy="32" rx="2.5" ry="2" fill="#fff" opacity="0.9"/>
    <!-- crystal crown/top --><polygon points="37,14 42,20 37,17 32,20" fill="#4fc3f7"/>
    <polygon points="37,12 44,18 37,15 30,18" fill="none" stroke="#0288d1" stroke-width="1"/>
    <!-- mouth line --><path d="M30 44 Q37 47 44 44" stroke="#0288d1" stroke-width="1.5" fill="none"/>
    <!-- glow lines --><line x1="19" y1="64" x2="18" y2="98" stroke="#81d4fa" stroke-width="0.5" opacity="0.4"/>
    <line x1="55" y1="64" x2="56" y2="98" stroke="#81d4fa" stroke-width="0.5" opacity="0.4"/>
  </svg>`;

const memonekRevenant = revWrap(`
    <!-- legs --><rect x="23" y="100" width="11" height="40" rx="4" fill="#0d2030"/>
    <rect x="40" y="100" width="11" height="40" rx="4" fill="#0d2030"/>
    <ellipse cx="28" cy="140" rx="7" ry="4" fill="#051015"/>
    <ellipse cx="45" cy="140" rx="7" ry="4" fill="#051015"/>
    <!-- torso --><rect x="18" y="58" width="38" height="45" rx="8" fill="#0d2030"/>
    <!-- cracked geometric --><polygon points="37,63 44,70 37,77 30,70" fill="none" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
    <!-- fracture lines --><line x1="32" y1="60" x2="28" y2="98" stroke="#7fffd4" stroke-width="0.8" opacity="0.5"/>
    <line x1="43" y1="62" x2="48" y2="96" stroke="#7fffd4" stroke-width="0.6" opacity="0.3"/>
    <!-- arms --><rect x="6" y="60" width="13" height="38" rx="6" fill="#0d2030"/>
    <rect x="55" y="60" width="13" height="38" rx="6" fill="#0d2030"/>
    <ellipse cx="12" cy="99" rx="7" ry="5" fill="#0d1a28"/>
    <ellipse cx="62" cy="99" rx="7" ry="5" fill="#0d1a28"/>
    <!-- neck --><rect x="31" y="48" width="12" height="12" rx="5" fill="#0d2030"/>
    <!-- head --><ellipse cx="37" cy="33" rx="17" ry="19" fill="#0d2030"/>
    <!-- soul eyes (crystal cracked) --><ellipse cx="29" cy="32" rx="6" ry="5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="45" cy="32" rx="6" ry="5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- crown cracked --><polygon points="37,14 42,20 37,17 32,20" fill="#0d2030" stroke="#7fffd4" stroke-width="0.8" opacity="0.5"/>
    <!-- soul seams --><line x1="18" y1="80" x2="56" y2="80" stroke="#7fffd4" stroke-width="0.5" opacity="0.3"/>
    <!-- aura --><ellipse cx="37" cy="33" rx="20" ry="22" fill="none" stroke="#7fffd4" stroke-width="0.5" opacity="0.25"/>
  `, 74, 145);

// =============================================================================
// ORC (weapon stripped: spear/axe removed)
// =============================================================================

const orcLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="84" height="148" viewBox="0 0 84 148">
    <defs><linearGradient id="orcSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6d8c40"/><stop offset="100%" stop-color="#3d5520"/></linearGradient></defs>
    <!-- legs --><rect x="24" y="100" width="14" height="42" rx="5" fill="#3d5520"/>
    <rect x="46" y="100" width="14" height="42" rx="5" fill="#3d5520"/>
    <!-- boots --><rect x="20" y="132" width="21" height="14" rx="4" fill="#1a0e06"/>
    <rect x="43" y="132" width="21" height="14" rx="4" fill="#1a0e06"/>
    <!-- fur kilt --><path d="M18 88 Q25 95 42 92 Q59 95 66 88 L68 104 L42 108 L16 104Z" fill="#4a2f1a"/>
    <!-- torso --><rect x="16" y="56" width="52" height="46" rx="8" fill="url(#orcSkin)"/>
    <!-- chest scars --><line x1="28" y1="60" x2="24" y2="84" stroke="#2d4010" stroke-width="2"/>
    <line x1="44" y1="58" x2="48" y2="82" stroke="#2d4010" stroke-width="2"/>
    <!-- belt --><rect x="16" y="96" width="52" height="7" rx="3" fill="#2d1a0e"/>
    <!-- muscle definition --><path d="M22 68 Q28 64 34 68" stroke="#4d6a28" stroke-width="2" fill="none"/>
    <path d="M50 68 Q56 64 62 68" stroke="#4d6a28" stroke-width="2" fill="none"/>
    <!-- massive arms --><rect x="2" y="58" width="15" height="42" rx="6" fill="#5a7830"/>
    <rect x="67" y="58" width="15" height="42" rx="6" fill="#5a7830"/>
    <!-- hands --><ellipse cx="9" cy="101" rx="9" ry="6" fill="#4d6a28"/>
    <ellipse cx="75" cy="101" rx="9" ry="6" fill="#4d6a28"/>
    <!-- neck --><rect x="33" y="46" width="18" height="12" rx="5" fill="#5a7830"/>
    <!-- head --><ellipse cx="42" cy="32" rx="19" ry="20" fill="url(#orcSkin)"/>
    <!-- brow ridge --><path d="M24 24 Q42 18 60 24" fill="#3d5520"/>
    <!-- eyes --><ellipse cx="32" cy="30" rx="4.5" ry="3.5" fill="#ff5722"/>
    <ellipse cx="52" cy="30" rx="4.5" ry="3.5" fill="#ff5722"/>
    <ellipse cx="32" cy="30" rx="2" ry="2" fill="#1a0000"/>
    <ellipse cx="52" cy="30" rx="2" ry="2" fill="#1a0000"/>
    <!-- tusks --><path d="M35 44 Q30 52 27 56" stroke="#f5f5f5" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M49 44 Q54 52 57 56" stroke="#f5f5f5" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <!-- nose flat --><path d="M37 36 Q42 40 47 36" stroke="#3d5520" stroke-width="2" fill="none"/>
    <!-- war paint --><line x1="25" y1="27" x2="22" y2="38" stroke="#ff5722" stroke-width="2.5"/>
    <line x1="59" y1="27" x2="62" y2="38" stroke="#ff5722" stroke-width="2.5"/>
    <line x1="38" y1="24" x2="37" y2="30" stroke="#ff5722" stroke-width="2"/>
  </svg>`;

const orcRevenant = revWrap(`
    <!-- legs --><rect x="24" y="100" width="14" height="42" rx="5" fill="#1a2810"/>
    <rect x="46" y="100" width="14" height="42" rx="5" fill="#1a2810"/>
    <rect x="20" y="132" width="21" height="14" rx="4" fill="#080a04"/>
    <rect x="43" y="132" width="21" height="14" rx="4" fill="#080a04"/>
    <!-- fur kilt --><path d="M18 88 Q25 95 42 92 Q59 95 66 88 L68 104 L42 108 L16 104Z" fill="#0d0806"/>
    <!-- torso --><rect x="16" y="56" width="52" height="46" rx="8" fill="#1a2e10"/>
    <!-- scar cracks --><line x1="28" y1="60" x2="24" y2="84" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
    <line x1="44" y1="58" x2="48" y2="82" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
    <!-- belt --><rect x="16" y="96" width="52" height="7" rx="3" fill="#0d0a06"/>
    <!-- arms --><rect x="2" y="58" width="15" height="42" rx="6" fill="#1a2e10"/>
    <rect x="67" y="58" width="15" height="42" rx="6" fill="#1a2e10"/>
    <ellipse cx="9" cy="101" rx="9" ry="6" fill="#142210"/>
    <ellipse cx="75" cy="101" rx="9" ry="6" fill="#142210"/>
    <!-- neck --><rect x="33" y="46" width="18" height="12" rx="5" fill="#1a2810"/>
    <!-- head --><ellipse cx="42" cy="32" rx="19" ry="20" fill="#1a2e10"/>
    <!-- brow --><path d="M24 24 Q42 18 60 24" fill="#0d1808"/>
    <!-- soul eyes --><ellipse cx="32" cy="30" rx="5.5" ry="4.5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="52" cy="30" rx="5.5" ry="4.5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- tusks --><path d="M35 44 Q30 52 27 56" stroke="#d0d0d0" stroke-width="3.5" fill="none" opacity="0.6"/>
    <path d="M49 44 Q54 52 57 56" stroke="#d0d0d0" stroke-width="3.5" fill="none" opacity="0.6"/>
    <!-- war paint glow --><line x1="25" y1="27" x2="22" y2="38" stroke="#7fffd4" stroke-width="2" opacity="0.4"/>
    <line x1="59" y1="27" x2="62" y2="38" stroke="#7fffd4" stroke-width="2" opacity="0.4"/>
  `, 84, 148);

// =============================================================================
// POLDER (weapon stripped: dagger removed)
// =============================================================================

const polderLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="118" viewBox="0 0 64 118">
    <!-- short legs --><rect x="18" y="80" width="10" height="32" rx="4" fill="#4a2f1a"/>
    <rect x="36" y="80" width="10" height="32" rx="4" fill="#4a2f1a"/>
    <!-- large feet --><ellipse cx="23" cy="112" rx="10" ry="5" fill="#3e2010"/>
    <ellipse cx="41" cy="112" rx="10" ry="5" fill="#3e2010"/>
    <!-- hairy feet detail --><path d="M15 110 Q23 107 31 110" stroke="#5d4037" stroke-width="2" fill="none"/>
    <path d="M33 110 Q41 107 49 110" stroke="#5d4037" stroke-width="2" fill="none"/>
    <!-- torso --><rect x="14" y="46" width="36" height="38" rx="7" fill="#795548"/>
    <!-- waistcoat --><path d="M18 50 L32 56 L46 50 L46 78 L32 84 L18 78Z" fill="#e91e63" opacity="0.8"/>
    <!-- buttons --><circle cx="32" cy="58" r="2" fill="#ffd700"/>
    <circle cx="32" cy="66" r="2" fill="#ffd700"/>
    <circle cx="32" cy="74" r="2" fill="#ffd700"/>
    <!-- shadow effect (polder power) --><ellipse cx="32" cy="80" rx="18" ry="6" fill="rgba(0,0,0,0.5)" opacity="0.4"/>
    <!-- arms --><rect x="4" y="48" width="11" height="30" rx="5" fill="#8d6e63"/>
    <rect x="49" y="48" width="11" height="30" rx="5" fill="#8d6e63"/>
    <ellipse cx="9" cy="79" rx="6" ry="4" fill="#795548"/>
    <ellipse cx="55" cy="79" rx="6" ry="4" fill="#795548"/>
    <!-- neck --><rect x="27" y="36" width="10" height="12" rx="4" fill="#a1887f"/>
    <!-- round head --><ellipse cx="32" cy="25" rx="16" ry="17" fill="#a1887f"/>
    <!-- hat --><ellipse cx="32" cy="12" rx="14" ry="4" fill="#2d1a0e"/>
    <rect x="22" y="5" width="20" height="9" rx="3" fill="#3e2010"/>
    <ellipse cx="32" cy="5" rx="10" ry="3" fill="#2d1a0e"/>
    <path d="M25 6 Q29 3 32 5 Q35 3 39 6" stroke="#ffd700" stroke-width="1" fill="none"/>
    <!-- eyes --><ellipse cx="25" cy="26" rx="3.5" ry="3" fill="#1a0e06"/>
    <ellipse cx="39" cy="26" rx="3.5" ry="3" fill="#1a0e06"/>
    <circle cx="25" cy="25" r="1.2" fill="#8d6e63"/>
    <circle cx="39" cy="25" r="1.2" fill="#8d6e63"/>
    <!-- rosy cheeks --><circle cx="20" cy="30" r="4" fill="#ff8a80" opacity="0.4"/>
    <circle cx="44" cy="30" r="4" fill="#ff8a80" opacity="0.4"/>
    <!-- smile --><path d="M26 34 Q32 38 38 34" stroke="#5d4037" stroke-width="2" fill="none"/>
  </svg>`;

const polderRevenant = revWrap(`
    <!-- legs --><rect x="18" y="80" width="10" height="32" rx="4" fill="#1a1510"/>
    <rect x="36" y="80" width="10" height="32" rx="4" fill="#1a1510"/>
    <ellipse cx="23" cy="112" rx="10" ry="5" fill="#0d0a08"/>
    <ellipse cx="41" cy="112" rx="10" ry="5" fill="#0d0a08"/>
    <!-- torso --><rect x="14" y="46" width="36" height="38" rx="7" fill="#1a1e1a"/>
    <!-- ghost waistcoat --><path d="M18 50 L32 56 L46 50 L46 78 L32 84 L18 78Z" fill="rgba(127,255,212,0.06)"/>
    <!-- shadow polder power enhanced --><ellipse cx="32" cy="80" rx="22" ry="8" fill="rgba(0,20,10,0.7)" filter="url(#soul-fire)"/>
    <!-- shadow tendrils --><path d="M14 78 Q8 82 6 90" stroke="#003322" stroke-width="2" fill="none"/>
    <path d="M50 78 Q56 82 58 90" stroke="#003322" stroke-width="2" fill="none"/>
    <!-- arms --><rect x="4" y="48" width="11" height="30" rx="5" fill="#1a1e18"/>
    <rect x="49" y="48" width="11" height="30" rx="5" fill="#1a1e18"/>
    <ellipse cx="9" cy="79" rx="6" ry="4" fill="#151810"/>
    <ellipse cx="55" cy="79" rx="6" ry="4" fill="#151810"/>
    <!-- neck --><rect x="27" y="36" width="10" height="12" rx="4" fill="#1a1e18"/>
    <!-- head --><ellipse cx="32" cy="25" rx="16" ry="17" fill="#1a1e18"/>
    <!-- hat --><ellipse cx="32" cy="12" rx="14" ry="4" fill="#080806"/>
    <rect x="22" y="5" width="20" height="9" rx="3" fill="#0a0806"/>
    <ellipse cx="32" cy="5" rx="10" ry="3" fill="#080604"/>
    <!-- soul eyes --><ellipse cx="25" cy="26" rx="4.5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="39" cy="26" rx="4.5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- cracks --><line x1="18" y1="50" x2="14" y2="80" stroke="#7fffd4" stroke-width="0.8" opacity="0.35"/>
  `, 64, 118);

// =============================================================================
// REVENANT
// =============================================================================

const revenantLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="74" height="145" viewBox="0 0 74 145">
    <defs><linearGradient id="revSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#607d8b"/><stop offset="100%" stop-color="#37474f"/></linearGradient></defs>
    <!-- legs --><rect x="23" y="100" width="12" height="40" rx="4" fill="#455a64"/>
    <rect x="39" y="100" width="12" height="40" rx="4" fill="#455a64"/>
    <!-- feet --><ellipse cx="29" cy="140" rx="8" ry="4" fill="#263238"/>
    <ellipse cx="45" cy="140" rx="8" ry="4" fill="#263238"/>
    <!-- tattered cloak --><path d="M14 60 Q10 100 8 140" stroke="#37474f" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M60 60 Q64 100 66 140" stroke="#37474f" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- torso --><rect x="18" y="58" width="38" height="44" rx="6" fill="url(#revSkin)"/>
    <!-- ribcage showing --><line x1="24" y1="68" x2="50" y2="68" stroke="#546e7a" stroke-width="1.5" opacity="0.5"/>
    <line x1="24" y1="75" x2="50" y2="75" stroke="#546e7a" stroke-width="1.5" opacity="0.5"/>
    <line x1="24" y1="82" x2="50" y2="82" stroke="#546e7a" stroke-width="1.5" opacity="0.4"/>
    <line x1="37" y1="62" x2="37" y2="98" stroke="#546e7a" stroke-width="1" opacity="0.4"/>
    <!-- arms --><rect x="6" y="60" width="13" height="38" rx="5" fill="#546e7a"/>
    <rect x="55" y="60" width="13" height="38" rx="5" fill="#546e7a"/>
    <!-- bony hands --><ellipse cx="12" cy="99" rx="7" ry="4" fill="#455a64"/>
    <ellipse cx="62" cy="99" rx="7" ry="4" fill="#455a64"/>
    <!-- neck --><rect x="31" y="48" width="12" height="12" rx="4" fill="#546e7a"/>
    <!-- skull head --><ellipse cx="37" cy="33" rx="17" ry="18" fill="url(#revSkin)"/>
    <!-- skull sutures --><path d="M20 28 Q37 22 54 28" stroke="#455a64" stroke-width="1" opacity="0.5"/>
    <!-- eyes (basic, not fully awoken) --><ellipse cx="28" cy="32" rx="5" ry="5" fill="#37474f"/>
    <ellipse cx="46" cy="32" rx="5" ry="5" fill="#37474f"/>
    <ellipse cx="28" cy="32" rx="2.5" ry="2.5" fill="#7fffd4" opacity="0.3"/>
    <ellipse cx="46" cy="32" rx="2.5" ry="2.5" fill="#7fffd4" opacity="0.3"/>
    <!-- nasal cavity --><path d="M35 40 Q37 43 39 40" stroke="#37474f" stroke-width="2" fill="none"/>
    <!-- teeth smile --><path d="M28 47 Q37 52 46 47" stroke="#607d8b" stroke-width="1" fill="none"/>
    <line x1="31" y1="47" x2="31" y2="52" stroke="#b0bec5" stroke-width="1.5"/>
    <line x1="35" y1="48" x2="35" y2="53" stroke="#b0bec5" stroke-width="1.5"/>
    <line x1="39" y1="48" x2="39" y2="53" stroke="#b0bec5" stroke-width="1.5"/>
    <line x1="43" y1="47" x2="43" y2="52" stroke="#b0bec5" stroke-width="1.5"/>
    <!-- soul ember faint --><circle cx="28" cy="32" r="3" fill="#7fffd4" opacity="0.15"/>
    <circle cx="46" cy="32" r="3" fill="#7fffd4" opacity="0.15"/>
  </svg>`;

const revenantRevenant = revWrap(`
    <!-- legs --><rect x="23" y="100" width="12" height="40" rx="4" fill="#1a2830"/>
    <rect x="39" y="100" width="12" height="40" rx="4" fill="#1a2830"/>
    <ellipse cx="29" cy="140" rx="8" ry="4" fill="#0a1218"/>
    <ellipse cx="45" cy="140" rx="8" ry="4" fill="#0a1218"/>
    <!-- cloak --><path d="M14 60 Q10 100 8 140" stroke="#0d1820" stroke-width="8" fill="none"/>
    <path d="M60 60 Q64 100 66 140" stroke="#0d1820" stroke-width="8" fill="none"/>
    <!-- torso --><rect x="18" y="58" width="38" height="44" rx="6" fill="#1a2830"/>
    <!-- ribs glowing --><line x1="24" y1="68" x2="50" y2="68" stroke="#7fffd4" stroke-width="1.5" opacity="0.35"/>
    <line x1="24" y1="75" x2="50" y2="75" stroke="#7fffd4" stroke-width="1.5" opacity="0.35"/>
    <line x1="24" y1="82" x2="50" y2="82" stroke="#7fffd4" stroke-width="1.2" opacity="0.25"/>
    <line x1="37" y1="62" x2="37" y2="98" stroke="#7fffd4" stroke-width="1" opacity="0.25"/>
    <!-- arms --><rect x="6" y="60" width="13" height="38" rx="5" fill="#1a2830"/>
    <rect x="55" y="60" width="13" height="38" rx="5" fill="#1a2830"/>
    <ellipse cx="12" cy="99" rx="7" ry="4" fill="#1a2830"/>
    <ellipse cx="62" cy="99" rx="7" ry="4" fill="#1a2830"/>
    <!-- neck --><rect x="31" y="48" width="12" height="12" rx="4" fill="#1a2830"/>
    <!-- skull --><ellipse cx="37" cy="33" rx="17" ry="18" fill="#1a2830"/>
    <!-- bright awakened eyes --><ellipse cx="28" cy="32" rx="6" ry="6" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye" style="animation-delay:0.2s"/>
    <ellipse cx="46" cy="32" rx="6" ry="6" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye" style="animation-delay:0.5s"/>
    <!-- nasal --><path d="M35 40 Q37 43 39 40" stroke="#7fffd4" stroke-width="1.5" fill="none" opacity="0.4"/>
    <!-- glowing teeth --><line x1="31" y1="47" x2="31" y2="52" stroke="#7fffd4" stroke-width="1.5" opacity="0.5"/>
    <line x1="35" y1="48" x2="35" y2="53" stroke="#7fffd4" stroke-width="1.5" opacity="0.5"/>
    <line x1="39" y1="48" x2="39" y2="53" stroke="#7fffd4" stroke-width="1.5" opacity="0.5"/>
    <line x1="43" y1="47" x2="43" y2="52" stroke="#7fffd4" stroke-width="1.5" opacity="0.5"/>
    <!-- intense glow aura --><ellipse cx="37" cy="33" rx="20" ry="21" fill="none" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
    <ellipse cx="37" cy="33" rx="25" ry="26" fill="none" stroke="#7fffd4" stroke-width="0.5" opacity="0.2"/>
  `, 74, 145);

// =============================================================================
// TIME RAIDER
// =============================================================================

const timeRaiderLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="148" viewBox="0 0 80 148">
    <defs><linearGradient id="trSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff8f00"/><stop offset="100%" stop-color="#e65100"/></linearGradient></defs>
    <!-- legs --><rect x="24" y="100" width="12" height="42" rx="4" fill="#bf360c"/>
    <rect x="44" y="100" width="12" height="42" rx="4" fill="#bf360c"/>
    <!-- boots --><rect x="20" y="132" width="19" height="14" rx="4" fill="#2d1a0e"/>
    <rect x="41" y="132" width="19" height="14" rx="4" fill="#2d1a0e"/>
    <!-- asymmetric gear --><rect x="14" y="60" width="52" height="44" rx="7" fill="url(#trSkin)"/>
    <!-- tech panels --><rect x="18" y="64" width="16" height="16" rx="2" fill="#ff5722" opacity="0.6"/>
    <rect x="46" y="64" width="16" height="16" rx="2" fill="#ff5722" opacity="0.6"/>
    <!-- circuit lines --><line x1="18" y1="80" x2="62" y2="80" stroke="#ffcc02" stroke-width="1"/>
    <line x1="18" y1="88" x2="62" y2="88" stroke="#ffcc02" stroke-width="0.8" opacity="0.6"/>
    <circle cx="40" cy="80" r="3" fill="#ffcc02"/>
    <!-- extra arms (time raider has 4 arms) --><rect x="2" y="60" width="13" height="36" rx="5" fill="#e65100"/>
    <rect x="65" y="60" width="13" height="36" rx="5" fill="#e65100"/>
    <rect x="4" y="80" width="10" height="28" rx="4" fill="#bf360c"/>
    <rect x="66" y="80" width="10" height="28" rx="4" fill="#bf360c"/>
    <!-- 4 hands --><ellipse cx="8" cy="97" rx="7" ry="4" fill="#e65100"/>
    <ellipse cx="72" cy="97" rx="7" ry="4" fill="#e65100"/>
    <ellipse cx="9" cy="109" rx="6" ry="4" fill="#bf360c"/>
    <ellipse cx="71" cy="109" rx="6" ry="4" fill="#bf360c"/>
    <!-- neck --><rect x="32" y="48" width="16" height="14" rx="5" fill="#e65100"/>
    <!-- head --><ellipse cx="40" cy="34" rx="18" ry="20" fill="url(#trSkin)"/>
    <!-- time raider: crystalline eyes x4 --><ellipse cx="28" cy="30" rx="4" ry="3.5" fill="#ffcc02"/>
    <ellipse cx="38" cy="28" rx="3.5" ry="3" fill="#ffd740"/>
    <ellipse cx="42" cy="28" rx="3.5" ry="3" fill="#ffd740"/>
    <ellipse cx="52" cy="30" rx="4" ry="3.5" fill="#ffcc02"/>
    <circle cx="28" cy="30" r="1.5" fill="#1a0800"/>
    <circle cx="38" cy="28" r="1.2" fill="#1a0800"/>
    <circle cx="42" cy="28" r="1.2" fill="#1a0800"/>
    <circle cx="52" cy="30" r="1.5" fill="#1a0800"/>
    <!-- mandibles --><path d="M30 44 Q36 50 32 56" stroke="#e65100" stroke-width="3" fill="none"/>
    <path d="M50 44 Q44 50 48 56" stroke="#e65100" stroke-width="3" fill="none"/>
    <!-- time device --><circle cx="40" cy="80" r="8" fill="none" stroke="#ffcc02" stroke-width="1.5"/>
    <!-- head crest --><path d="M26 16 Q40 8 54 16" stroke="#ff5722" stroke-width="3" fill="none"/>
  </svg>`;

const timeRaiderRevenant = revWrap(`
    <!-- legs --><rect x="24" y="100" width="12" height="42" rx="4" fill="#1a1808"/>
    <rect x="44" y="100" width="12" height="42" rx="4" fill="#1a1808"/>
    <rect x="20" y="132" width="19" height="14" rx="4" fill="#0a0604"/>
    <rect x="41" y="132" width="19" height="14" rx="4" fill="#0a0604"/>
    <!-- torso --><rect x="14" y="60" width="52" height="44" rx="7" fill="#1a1e10"/>
    <!-- panels --><rect x="18" y="64" width="16" height="16" rx="2" fill="#1a1e10" stroke="#7fffd4" stroke-width="0.8" opacity="0.4"/>
    <rect x="46" y="64" width="16" height="16" rx="2" fill="#1a1e10" stroke="#7fffd4" stroke-width="0.8" opacity="0.4"/>
    <!-- circuit glow --><line x1="18" y1="80" x2="62" y2="80" stroke="#7fffd4" stroke-width="1" opacity="0.4"/>
    <!-- 4 arms --><rect x="2" y="60" width="13" height="36" rx="5" fill="#1a1808"/>
    <rect x="65" y="60" width="13" height="36" rx="5" fill="#1a1808"/>
    <rect x="4" y="80" width="10" height="28" rx="4" fill="#141208"/>
    <rect x="66" y="80" width="10" height="28" rx="4" fill="#141208"/>
    <ellipse cx="8" cy="97" rx="7" ry="4" fill="#1a1808"/>
    <ellipse cx="72" cy="97" rx="7" ry="4" fill="#1a1808"/>
    <ellipse cx="9" cy="109" rx="6" ry="4" fill="#141208"/>
    <ellipse cx="71" cy="109" rx="6" ry="4" fill="#141208"/>
    <!-- neck --><rect x="32" y="48" width="16" height="14" rx="5" fill="#1a1a10"/>
    <!-- head --><ellipse cx="40" cy="34" rx="18" ry="20" fill="#1a1e10"/>
    <!-- 4 soul eyes --><ellipse cx="28" cy="30" rx="5" ry="4.5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="38" cy="28" rx="4.5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye" style="animation-delay:0.3s"/>
    <ellipse cx="42" cy="28" rx="4.5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye" style="animation-delay:0.6s"/>
    <ellipse cx="52" cy="30" rx="5" ry="4.5" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye" style="animation-delay:0.9s"/>
    <!-- mandibles --><path d="M30 44 Q36 50 32 56" stroke="#1a2810" stroke-width="3" fill="none"/>
    <path d="M50 44 Q44 50 48 56" stroke="#1a2810" stroke-width="3" fill="none"/>
    <!-- time device glow --><circle cx="40" cy="80" r="8" fill="none" stroke="#7fffd4" stroke-width="1" opacity="0.5"/>
    <circle cx="40" cy="80" r="4" fill="#7fffd4" opacity="0.15" filter="url(#soul-fire)"/>
    <!-- cracks --><line x1="28" y1="64" x2="24" y2="98" stroke="#7fffd4" stroke-width="0.8" opacity="0.3"/>
  `, 80, 148);

// =============================================================================
// WODE ELF (weapon stripped: bow removed)
// =============================================================================

const wodeElfLiving = `<svg xmlns="http://www.w3.org/2000/svg" width="74" height="145" viewBox="0 0 74 145">
    <defs><linearGradient id="weSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a5d6a7"/><stop offset="100%" stop-color="#388e3c"/></linearGradient></defs>
    <!-- legs --><rect x="23" y="100" width="12" height="40" rx="4" fill="#2e7d32"/>
    <rect x="39" y="100" width="12" height="40" rx="4" fill="#2e7d32"/>
    <!-- leather boots --><rect x="20" y="130" width="18" height="13" rx="4" fill="#1a0e06"/>
    <rect x="36" y="130" width="18" height="13" rx="4" fill="#1a0e06"/>
    <!-- body --><rect x="18" y="58" width="38" height="44" rx="6" fill="url(#weSkin)"/>
    <!-- leaf armor --><path d="M18 62 Q26 58 34 62 Q26 66 18 62Z" fill="#1b5e20" opacity="0.7"/>
    <path d="M40 62 Q48 58 56 62 Q48 66 40 62Z" fill="#1b5e20" opacity="0.7"/>
    <path d="M18 76 Q27 72 37 76 Q27 80 18 76Z" fill="#1b5e20" opacity="0.6"/>
    <path d="M37 76 Q46 72 56 76 Q46 80 37 76Z" fill="#1b5e20" opacity="0.6"/>
    <!-- forest cloak --><path d="M13 60 Q6 95 5 135" stroke="#1b5e20" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M61 60 Q68 95 69 135" stroke="#1b5e20" stroke-width="9" fill="none" stroke-linecap="round"/>
    <!-- arms --><rect x="6" y="60" width="13" height="38" rx="5" fill="#388e3c"/>
    <rect x="55" y="60" width="13" height="38" rx="5" fill="#388e3c"/>
    <ellipse cx="12" cy="99" rx="7" ry="4" fill="#2e7d32"/>
    <ellipse cx="62" cy="99" rx="7" ry="4" fill="#2e7d32"/>
    <!-- neck --><rect x="31" y="48" width="12" height="12" rx="4" fill="#66bb6a"/>
    <!-- head --><ellipse cx="37" cy="33" rx="15" ry="18" fill="#66bb6a"/>
    <!-- pointed ears longer --><path d="M22 28 Q13 22 15 16 Q19 22 22 28Z" fill="#66bb6a"/>
    <path d="M52 28 Q61 22 59 16 Q55 22 52 28Z" fill="#66bb6a"/>
    <!-- eyes --><ellipse cx="29" cy="33" rx="4" ry="3" fill="#1b5e20"/>
    <ellipse cx="45" cy="33" rx="4" ry="3" fill="#1b5e20"/>
    <ellipse cx="29" cy="32" rx="1.5" ry="1.5" fill="#a5d6a7"/>
    <ellipse cx="45" cy="32" rx="1.5" ry="1.5" fill="#a5d6a7"/>
    <!-- markings --><path d="M25 28 Q29 26 33 28" stroke="#1b5e20" stroke-width="1.5" fill="none"/>
    <path d="M41 28 Q45 26 49 28" stroke="#1b5e20" stroke-width="1.5" fill="none"/>
    <!-- mouth --><path d="M30 42 Q37 46 44 42" stroke="#2e7d32" stroke-width="1.5" fill="none"/>
    <!-- hair with leaves --><path d="M22 20 Q22 8 37 6 Q52 8 52 20" fill="#1b5e20"/>
    <ellipse cx="29" cy="8" rx="5" ry="3" fill="#2e7d32" transform="rotate(-30 29 8)"/>
    <ellipse cx="37" cy="6" rx="5" ry="3" fill="#388e3c"/>
    <ellipse cx="45" cy="8" rx="5" ry="3" fill="#2e7d32" transform="rotate(30 45 8)"/>
  </svg>`;

const wodeElfRevenant = revWrap(`
    <!-- legs --><rect x="23" y="100" width="12" height="40" rx="4" fill="#0d1a0e"/>
    <rect x="39" y="100" width="12" height="40" rx="4" fill="#0d1a0e"/>
    <rect x="20" y="130" width="18" height="13" rx="4" fill="#050804"/>
    <rect x="36" y="130" width="18" height="13" rx="4" fill="#050804"/>
    <!-- body --><rect x="18" y="58" width="38" height="44" rx="6" fill="#0d1e10"/>
    <!-- leaf armor dead --><path d="M18 62 Q26 58 34 62 Q26 66 18 62Z" fill="#0d1508" opacity="0.8"/>
    <path d="M40 62 Q48 58 56 62 Q48 66 40 62Z" fill="#0d1508" opacity="0.8"/>
    <!-- forest cloak --><path d="M13 60 Q6 95 5 135" stroke="#0d1808" stroke-width="9" fill="none"/>
    <path d="M61 60 Q68 95 69 135" stroke="#0d1808" stroke-width="9" fill="none"/>
    <!-- arms --><rect x="6" y="60" width="13" height="38" rx="5" fill="#0d1e10"/>
    <rect x="55" y="60" width="13" height="38" rx="5" fill="#0d1e10"/>
    <ellipse cx="12" cy="99" rx="7" ry="4" fill="#0d1808"/>
    <ellipse cx="62" cy="99" rx="7" ry="4" fill="#0d1808"/>
    <!-- cracks --><line x1="25" y1="62" x2="20" y2="98" stroke="#7fffd4" stroke-width="0.8" opacity="0.4"/>
    <!-- neck --><rect x="31" y="48" width="12" height="12" rx="4" fill="#0d1e10"/>
    <!-- head --><ellipse cx="37" cy="33" rx="15" ry="18" fill="#0d1e10"/>
    <!-- ears --><path d="M22 28 Q13 22 15 16 Q19 22 22 28Z" fill="#0d1e10"/>
    <path d="M52 28 Q61 22 59 16 Q55 22 52 28Z" fill="#0d1e10"/>
    <!-- soul eyes --><ellipse cx="29" cy="33" rx="5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <ellipse cx="45" cy="33" rx="5" ry="4" fill="#7fffd4" filter="url(#soul-fire)" class="soul-eye"/>
    <!-- hair --><path d="M22 20 Q22 8 37 6 Q52 8 52 20" fill="#050808"/>
    <!-- nature aura --><ellipse cx="37" cy="33" rx="18" ry="21" fill="none" stroke="#7fffd4" stroke-width="0.5" opacity="0.25"/>
  `, 74, 145);

// =============================================================================
// EXPORTED MODEL MAP
// =============================================================================

export const ANCESTRY_MODELS: Record<string, AncestryModelData> = {
  devil: {
    living: devilLiving, revenant: devilRevenant,
    viewW: 80, viewH: 145,
    clothingColors: [{ original: '#ff6600', role: 'accent' }],
    hairColor: null, defaultClothingColor: '#ff6600', defaultHairColor: '#ff6600',
    handR: { x: 66, y: 104 }, handL: { x: 14, y: 104 },
    torso: { x: 20, y: 62, w: 40, h: 46 },
    backPos: { x: 60, y: 80 }, hasHair: false, headCenter: { x: 40, y: 37 },
  },
  dragonKnight: {
    living: dragonKnightLiving, revenant: dragonKnightRevenant,
    viewW: 80, viewH: 145,
    clothingColors: [
      { original: '#64b5f6', role: 'light' },
      { original: '#1976d2', role: 'primary' },
      { original: '#1565c0', role: 'dark' },
    ],
    hairColor: null, defaultClothingColor: '#1976d2', defaultHairColor: '#1976d2',
    handR: { x: 67, y: 102 }, handL: { x: 12, y: 102 },
    torso: { x: 18, y: 58, w: 44, h: 46 },
    backPos: { x: 62, y: 80 }, hasHair: false, headCenter: { x: 40, y: 28 },
  },
  dwarf: {
    living: dwarfLiving, revenant: dwarfRevenant,
    viewW: 72, viewH: 130,
    clothingColors: [
      { original: '#9e9e9e', role: 'primary' },
      { original: '#546e7a', role: 'dark' },
      { original: '#607d8b', role: 'accent' },
      { original: '#b0bec5', role: 'light' },
    ],
    hairColor: '#5d4037', defaultClothingColor: '#9e9e9e', defaultHairColor: '#5d4037',
    handR: { x: 64, y: 89 }, handL: { x: 8, y: 89 },
    torso: { x: 12, y: 54, w: 48, h: 40 },
    backPos: { x: 58, y: 70 }, hasHair: true, headCenter: { x: 36, y: 32 },
  },
  hakaan: {
    living: hakaanLiving, revenant: hakaanRevenant,
    viewW: 90, viewH: 155,
    clothingColors: [{ original: '#4a2f1a', role: 'dark' }],
    hairColor: null, defaultClothingColor: '#4a2f1a', defaultHairColor: '#4a2f1a',
    handR: { x: 81, y: 112 }, handL: { x: 9, y: 112 },
    torso: { x: 16, y: 62, w: 58, h: 50 },
    backPos: { x: 73, y: 85 }, hasHair: false, headCenter: { x: 45, y: 35 },
  },
  highElf: {
    living: highElfLiving, revenant: highElfRevenant,
    viewW: 74, viewH: 145,
    clothingColors: [
      { original: '#e8d5ff', role: 'light' },
      { original: '#9c64d0', role: 'primary' },
      { original: '#b39ddb', role: 'accent' },
      { original: '#7e57c2', role: 'dark' },
    ],
    hairColor: '#c8a0e8', defaultClothingColor: '#9c64d0', defaultHairColor: '#c8a0e8',
    handR: { x: 58, y: 95 }, handL: { x: 16, y: 95 },
    torso: { x: 22, y: 56, w: 30, h: 40 },
    backPos: { x: 56, y: 80 }, hasHair: true, headCenter: { x: 37, y: 33 },
  },
  human: {
    living: humanLiving, revenant: humanRevenant,
    viewW: 74, viewH: 145,
    clothingColors: [
      { original: '#c62828', role: 'primary' },
      { original: '#b71c1c', role: 'dark' },
      { original: '#ffd700', role: 'accent' },
    ],
    hairColor: '#4a2f1a', defaultClothingColor: '#c62828', defaultHairColor: '#4a2f1a',
    handR: { x: 62, y: 100 }, handL: { x: 12, y: 100 },
    torso: { x: 18, y: 58, w: 38, h: 45 },
    backPos: { x: 56, y: 80 }, hasHair: true, headCenter: { x: 37, y: 34 },
  },
  memonek: {
    living: memonekLiving, revenant: memonekRevenant,
    viewW: 74, viewH: 145,
    clothingColors: [
      { original: '#0288d1', role: 'primary' },
      { original: '#4fc3f7', role: 'light' },
      { original: '#81d4fa', role: 'accent' },
    ],
    hairColor: null, defaultClothingColor: '#0288d1', defaultHairColor: '#0288d1',
    handR: { x: 62, y: 99 }, handL: { x: 12, y: 99 },
    torso: { x: 18, y: 58, w: 38, h: 45 },
    backPos: { x: 56, y: 80 }, hasHair: false, headCenter: { x: 37, y: 33 },
  },
  orc: {
    living: orcLiving, revenant: orcRevenant,
    viewW: 84, viewH: 148,
    clothingColors: [
      { original: '#4a2f1a', role: 'primary' },
      { original: '#ff5722', role: 'accent' },
    ],
    hairColor: null, defaultClothingColor: '#4a2f1a', defaultHairColor: '#4a2f1a',
    handR: { x: 75, y: 101 }, handL: { x: 9, y: 101 },
    torso: { x: 16, y: 56, w: 52, h: 46 },
    backPos: { x: 67, y: 78 }, hasHair: false, headCenter: { x: 42, y: 32 },
  },
  polder: {
    living: polderLiving, revenant: polderRevenant,
    viewW: 64, viewH: 118,
    clothingColors: [
      { original: '#e91e63', role: 'primary' },
      { original: '#ffd700', role: 'accent' },
    ],
    hairColor: null, defaultClothingColor: '#e91e63', defaultHairColor: '#e91e63',
    handR: { x: 55, y: 79 }, handL: { x: 9, y: 79 },
    torso: { x: 14, y: 46, w: 36, h: 38 },
    backPos: { x: 49, y: 62 }, hasHair: false, headCenter: { x: 32, y: 25 },
  },
  revenant: {
    living: revenantLiving, revenant: revenantRevenant,
    viewW: 74, viewH: 145,
    clothingColors: [
      { original: '#37474f', role: 'dark' },
      { original: '#455a64', role: 'primary' },
      { original: '#546e7a', role: 'accent' },
      { original: '#607d8b', role: 'light' },
    ],
    hairColor: null, defaultClothingColor: '#455a64', defaultHairColor: '#455a64',
    handR: { x: 62, y: 99 }, handL: { x: 12, y: 99 },
    torso: { x: 18, y: 58, w: 38, h: 44 },
    backPos: { x: 56, y: 80 }, hasHair: false, headCenter: { x: 37, y: 33 },
  },
  timeRaider: {
    living: timeRaiderLiving, revenant: timeRaiderRevenant,
    viewW: 80, viewH: 148,
    clothingColors: [
      { original: '#ff5722', role: 'primary' },
      { original: '#ffcc02', role: 'accent' },
    ],
    hairColor: null, defaultClothingColor: '#ff5722', defaultHairColor: '#ff5722',
    handR: { x: 72, y: 97 }, handL: { x: 8, y: 97 },
    torso: { x: 14, y: 60, w: 52, h: 44 },
    backPos: { x: 65, y: 80 }, hasHair: false, headCenter: { x: 40, y: 34 },
  },
  wodeElf: {
    living: wodeElfLiving, revenant: wodeElfRevenant,
    viewW: 74, viewH: 145,
    clothingColors: [
      { original: '#1b5e20', role: 'dark' },
      { original: '#388e3c', role: 'primary' },
      { original: '#2e7d32', role: 'accent' },
    ],
    hairColor: '#1b5e20', defaultClothingColor: '#388e3c', defaultHairColor: '#1b5e20',
    handR: { x: 62, y: 99 }, handL: { x: 12, y: 99 },
    torso: { x: 18, y: 58, w: 38, h: 44 },
    backPos: { x: 56, y: 80 }, hasHair: true, headCenter: { x: 37, y: 33 },
  },
};

// =============================================================================
// WEAPON OVERLAYS — anchored to each model's hand/back positions
// =============================================================================

/** Build a weapon SVG placed at the model's actual hand/back positions */
export function getWeaponOverlay(weaponType: string, _vw: number, _vh: number, model?: AncestryModelData): string {
  if (!model) return '';
  const { handR, handL, backPos, torso } = model;
  const cx = torso.x + torso.w / 2; // body center X

  switch (weaponType) {
    case 'bow': {
      // Elegant longbow held at right side, curves from above shoulder to below hip
      const bx = handR.x + 2;
      const topY = torso.y - 14;
      const botY = handR.y + 22;
      const midY = (topY + botY) / 2;
      const bulge = 10;
      return `<g>
        <!-- bow stave -->
        <path d="M${bx} ${topY} Q${bx + bulge} ${midY - 15} ${bx + 2} ${midY} Q${bx + bulge} ${midY + 15} ${bx} ${botY}"
          stroke="#5d4037" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- wood grain highlight -->
        <path d="M${bx} ${topY + 4} Q${bx + bulge - 2} ${midY - 12} ${bx + 1} ${midY}"
          stroke="#8d6e63" stroke-width="1" fill="none" opacity="0.5"/>
        <!-- bowstring -->
        <line x1="${bx + 1}" y1="${topY + 2}" x2="${bx}" y2="${botY - 2}" stroke="#c9a84c" stroke-width="0.7"/>
        <!-- nock tips -->
        <circle cx="${bx}" cy="${topY}" r="1.5" fill="#5d4037"/>
        <circle cx="${bx}" cy="${botY}" r="1.5" fill="#5d4037"/>
      </g>`;
    }
    case 'heavy': {
      // Greatsword slung on back, hilt over right shoulder
      const sx = backPos.x + 4;
      const topY = torso.y - 18;
      const bladeLen = torso.h + 28;
      return `<g>
        <!-- blade -->
        <rect x="${sx - 2}" y="${topY}" width="5" height="${bladeLen}" rx="1" fill="#b0bec5"/>
        <!-- blade edge highlight -->
        <rect x="${sx - 1}" y="${topY + 2}" width="2" height="${bladeLen - 8}" rx="0.5" fill="#e0e0e0" opacity="0.5"/>
        <!-- fuller groove -->
        <line x1="${sx + 0.5}" y1="${topY + 6}" x2="${sx + 0.5}" y2="${topY + bladeLen - 12}" stroke="#90a4ae" stroke-width="1" opacity="0.6"/>
        <!-- crossguard -->
        <rect x="${sx - 7}" y="${topY + bladeLen - 4}" width="15" height="4" rx="1.5" fill="#757575"/>
        <rect x="${sx - 8}" y="${topY + bladeLen - 3}" width="17" height="2" rx="1" fill="#9e9e9e" opacity="0.5"/>
        <!-- grip -->
        <rect x="${sx - 0.5}" y="${topY + bladeLen}" width="2" height="10" rx="1" fill="#4a2f1a"/>
        <!-- leather wrap -->
        <line x1="${sx - 1}" y1="${topY + bladeLen + 2}" x2="${sx + 2}" y2="${topY + bladeLen + 4}" stroke="#3e2723" stroke-width="0.8"/>
        <line x1="${sx - 1}" y1="${topY + bladeLen + 5}" x2="${sx + 2}" y2="${topY + bladeLen + 7}" stroke="#3e2723" stroke-width="0.8"/>
        <!-- pommel -->
        <circle cx="${sx + 0.5}" cy="${topY + bladeLen + 12}" r="2.5" fill="#c9a84c"/>
        <circle cx="${sx + 0.5}" cy="${topY + bladeLen + 12}" r="1" fill="#ffd700" opacity="0.6"/>
      </g>`;
    }
    case 'medium': {
      // Longsword at right hip, angled
      const hx = handR.x - 2;
      const hy = handR.y - 20;
      const bladeLen = torso.h * 0.85;
      return `<g transform="translate(${hx},${hy}) rotate(15)">
        <!-- blade -->
        <rect x="-1.5" y="${-bladeLen}" width="4" height="${bladeLen}" rx="0.5" fill="#b0bec5"/>
        <rect x="-0.5" y="${-bladeLen + 2}" width="2" height="${bladeLen - 6}" rx="0.3" fill="#e0e0e0" opacity="0.4"/>
        <!-- fuller -->
        <line x1="0.5" y1="${-bladeLen + 4}" x2="0.5" y2="-6" stroke="#90a4ae" stroke-width="0.7" opacity="0.5"/>
        <!-- blade tip -->
        <path d="M-1.5 ${-bladeLen} L0.5 ${-bladeLen - 4} L2.5 ${-bladeLen}" fill="#b0bec5"/>
        <!-- crossguard -->
        <rect x="-5" y="-2" width="11" height="3" rx="1" fill="#757575"/>
        <!-- grip -->
        <rect x="-0.5" y="1" width="2" height="8" rx="0.5" fill="#4a2f1a"/>
        <line x1="-0.8" y1="2.5" x2="1.8" y2="3.5" stroke="#3e2723" stroke-width="0.6"/>
        <line x1="-0.8" y1="5" x2="1.8" y2="6" stroke="#3e2723" stroke-width="0.6"/>
        <!-- pommel -->
        <circle cx="0.5" cy="10.5" r="2" fill="#c9a84c"/>
      </g>`;
    }
    case 'light': {
      // Dual daggers, one at each hip
      const dLen = torso.h * 0.42;
      return `<g>
        <!-- right dagger -->
        <g transform="translate(${handR.x - 1},${handR.y - 12}) rotate(12)">
          <rect x="-1" y="${-dLen}" width="2.5" height="${dLen}" rx="0.3" fill="#b0bec5"/>
          <path d="M-1 ${-dLen} L0.25 ${-dLen - 3} L1.5 ${-dLen}" fill="#d0d0d0"/>
          <rect x="-3" y="-1" width="7" height="2.5" rx="0.8" fill="#757575"/>
          <rect x="-0.5" y="1.5" width="1.5" height="5" rx="0.5" fill="#4a2f1a"/>
          <circle cx="0.25" cy="7.5" r="1.3" fill="#c9a84c"/>
        </g>
        <!-- left dagger -->
        <g transform="translate(${handL.x + 1},${handL.y - 12}) rotate(-12)">
          <rect x="-1" y="${-dLen}" width="2.5" height="${dLen}" rx="0.3" fill="#b0bec5"/>
          <path d="M-1 ${-dLen} L0.25 ${-dLen - 3} L1.5 ${-dLen}" fill="#d0d0d0"/>
          <rect x="-3" y="-1" width="7" height="2.5" rx="0.8" fill="#757575"/>
          <rect x="-0.5" y="1.5" width="1.5" height="5" rx="0.5" fill="#4a2f1a"/>
          <circle cx="0.25" cy="7.5" r="1.3" fill="#c9a84c"/>
        </g>
      </g>`;
    }
    case 'polearm': {
      // Spear/halberd held beside right side, tip above head
      const px = handR.x + 4;
      const tipY = torso.y - 30;
      const shaftBot = handR.y + 20;
      const shaftLen = shaftBot - tipY;
      return `<g>
        <!-- shaft -->
        <rect x="${px - 1.5}" y="${tipY + 10}" width="3" height="${shaftLen - 10}" rx="1" fill="#5d4037"/>
        <!-- wood grain -->
        <line x1="${px - 0.5}" y1="${tipY + 20}" x2="${px - 0.5}" y2="${shaftBot - 5}" stroke="#8d6e63" stroke-width="0.5" opacity="0.4"/>
        <!-- spearhead -->
        <path d="M${px - 4} ${tipY + 12} L${px} ${tipY} L${px + 4} ${tipY + 12} L${px + 2} ${tipY + 14} L${px - 2} ${tipY + 14}Z" fill="#9e9e9e"/>
        <path d="M${px - 2} ${tipY + 12} L${px} ${tipY + 2} L${px + 2} ${tipY + 12}" fill="#c0c0c0" opacity="0.5"/>
        <!-- lugs/wings -->
        <path d="M${px - 2} ${tipY + 14} L${px - 5} ${tipY + 18} L${px - 2} ${tipY + 16}" fill="#757575"/>
        <path d="M${px + 2} ${tipY + 14} L${px + 5} ${tipY + 18} L${px + 2} ${tipY + 16}" fill="#757575"/>
        <!-- butt cap -->
        <rect x="${px - 2}" y="${shaftBot - 2}" width="4" height="3" rx="1" fill="#757575"/>
      </g>`;
    }
    case 'unarmed': {
      // Wrapped fist bindings / knuckle wraps
      const r = torso.w * 0.04;
      return `<g>
        <!-- right hand wraps -->
        <ellipse cx="${handR.x}" cy="${handR.y}" rx="${r + 3}" ry="${r + 1.5}" fill="none" stroke="#c9a84c" stroke-width="1.2"/>
        <line x1="${handR.x - r}" y1="${handR.y - 1}" x2="${handR.x + r}" y2="${handR.y + 1}" stroke="#c9a84c" stroke-width="0.8" opacity="0.6"/>
        <!-- left hand wraps -->
        <ellipse cx="${handL.x}" cy="${handL.y}" rx="${r + 3}" ry="${r + 1.5}" fill="none" stroke="#c9a84c" stroke-width="1.2"/>
        <line x1="${handL.x - r}" y1="${handL.y - 1}" x2="${handL.x + r}" y2="${handL.y + 1}" stroke="#c9a84c" stroke-width="0.8" opacity="0.6"/>
      </g>`;
    }
    case 'whip': {
      // Coiled whip trailing from right hand
      const wx = handR.x;
      const wy = handR.y;
      return `<g>
        <path d="M${wx} ${wy} Q${wx + 8} ${wy - 12} ${wx + 5} ${wy - 24}
                 Q${wx + 2} ${wy - 34} ${wx + 8} ${wy - 42}
                 Q${wx + 12} ${wy - 50} ${wx + 6} ${wy - 58}"
          fill="none" stroke="#5d4037" stroke-width="2.5" stroke-linecap="round"/>
        <!-- whip highlights -->
        <path d="M${wx + 1} ${wy - 2} Q${wx + 7} ${wy - 14} ${wx + 4} ${wy - 25}"
          fill="none" stroke="#8d6e63" stroke-width="0.8" opacity="0.5"/>
        <!-- handle -->
        <rect x="${wx - 1}" y="${wy - 2}" width="3" height="7" rx="1" fill="#3e2723"/>
        <circle cx="${wx + 0.5}" cy="${wy + 6}" r="1.5" fill="#c9a84c"/>
      </g>`;
    }
    case 'ensnaring': {
      // Net bundled at left hip
      const nx = handL.x;
      const ny = handL.y - 8;
      const r = torso.w * 0.16;
      return `<g>
        <!-- net bundle -->
        <ellipse cx="${nx}" cy="${ny}" rx="${r}" ry="${r * 0.75}" fill="none" stroke="#8d6e63" stroke-width="1.5"/>
        <!-- net weave pattern -->
        <line x1="${nx - r * 0.7}" y1="${ny - r * 0.5}" x2="${nx + r * 0.7}" y2="${ny + r * 0.5}" stroke="#8d6e63" stroke-width="0.7" opacity="0.6"/>
        <line x1="${nx + r * 0.7}" y1="${ny - r * 0.5}" x2="${nx - r * 0.7}" y2="${ny + r * 0.5}" stroke="#8d6e63" stroke-width="0.7" opacity="0.6"/>
        <line x1="${nx}" y1="${ny - r * 0.7}" x2="${nx}" y2="${ny + r * 0.7}" stroke="#8d6e63" stroke-width="0.7" opacity="0.5"/>
        <line x1="${nx - r * 0.8}" y1="${ny}" x2="${nx + r * 0.8}" y2="${ny}" stroke="#8d6e63" stroke-width="0.7" opacity="0.5"/>
        <!-- trailing rope -->
        <path d="M${nx} ${ny + r * 0.7} Q${nx - 3} ${ny + r * 1.2} ${nx + 2} ${ny + r * 1.8}"
          stroke="#8d6e63" stroke-width="1" fill="none" opacity="0.5"/>
        <!-- trident (retiarius secondary) -->
        <g transform="translate(${cx + 2},${torso.y - 10}) rotate(5)">
          <rect x="-1" y="0" width="2.5" height="${torso.h * 0.9}" rx="0.8" fill="#5d4037"/>
          <path d="M-4 2 L0.25 -6 L4.5 2" fill="none" stroke="#9e9e9e" stroke-width="1.5"/>
          <line x1="-3" y1="0" x2="-3" y2="-3" stroke="#9e9e9e" stroke-width="1.5"/>
          <line x1="4" y1="0" x2="4" y2="-3" stroke="#9e9e9e" stroke-width="1.5"/>
          <line x1="0.25" y1="-6" x2="0.25" y2="-3" stroke="#9e9e9e" stroke-width="1"/>
        </g>
      </g>`;
    }
    default:
      return '';
  }
}

// =============================================================================
// ARMOR OVERLAYS — fitted to each model's actual torso bounds
// =============================================================================

export type ArmorWeight = 'none' | 'light' | 'medium' | 'heavy';

export function getArmorOverlay(weight: ArmorWeight, hasShield: boolean, color: string, _vw: number, _vh: number, model?: AncestryModelData): string {
  if ((weight === 'none' && !hasShield) || !model) return '';
  const { torso, handL } = model;
  const tx = torso.x;
  const ty = torso.y;
  const tw = torso.w;
  const th = torso.h;
  const cx = tx + tw / 2;
  const darkColor = adjustBrightness(color, -40);
  const lightColor = adjustBrightness(color, 30);
  const midColor = adjustBrightness(color, -15);

  let svg = '<g>';

  if (weight === 'light') {
    // Leather armor: shoulder pads + chest strap + bracers
    const padW = tw * 0.22;
    const padH = th * 0.22;
    svg += `
      <!-- left shoulder pad -->
      <path d="M${tx - 1} ${ty + padH * 0.6}
               Q${tx + 1} ${ty - padH * 0.3} ${tx + padW} ${ty - padH * 0.2}
               L${tx + padW + 2} ${ty + padH * 0.4}
               Q${tx + padW * 0.5} ${ty + padH * 0.8} ${tx - 1} ${ty + padH * 0.6}Z"
        fill="${color}" opacity="0.75"/>
      <path d="M${tx + 1} ${ty + padH * 0.2} Q${tx + padW * 0.5} ${ty - padH * 0.1} ${tx + padW} ${ty}"
        stroke="${lightColor}" stroke-width="0.6" fill="none" opacity="0.4"/>
      <!-- right shoulder pad -->
      <path d="M${tx + tw + 1} ${ty + padH * 0.6}
               Q${tx + tw - 1} ${ty - padH * 0.3} ${tx + tw - padW} ${ty - padH * 0.2}
               L${tx + tw - padW - 2} ${ty + padH * 0.4}
               Q${tx + tw - padW * 0.5} ${ty + padH * 0.8} ${tx + tw + 1} ${ty + padH * 0.6}Z"
        fill="${color}" opacity="0.75"/>
      <!-- chest strap -->
      <path d="M${cx - tw * 0.3} ${ty + th * 0.1}
               L${cx + tw * 0.3} ${ty + th * 0.1}
               L${cx + tw * 0.28} ${ty + th * 0.2}
               L${cx - tw * 0.28} ${ty + th * 0.2}Z"
        fill="${darkColor}" opacity="0.45"/>
      <!-- strap buckle -->
      <rect x="${cx - 1.5}" y="${ty + th * 0.1}" width="3" height="3" rx="0.5" fill="#c9a84c" opacity="0.7"/>
      <!-- bracers -->
      <rect x="${model.handR.x - 4}" y="${model.handR.y - 14}" width="7" height="8" rx="2" fill="${midColor}" opacity="0.55"/>
      <rect x="${model.handL.x - 3}" y="${model.handL.y - 14}" width="7" height="8" rx="2" fill="${midColor}" opacity="0.55"/>`;
  } else if (weight === 'medium') {
    // Scale/chain mail: breastplate + pronounced pauldrons + belt
    const padW = tw * 0.25;
    svg += `
      <!-- breastplate -->
      <path d="M${tx + tw * 0.15} ${ty + 2}
               L${tx + tw * 0.85} ${ty + 2}
               L${tx + tw * 0.88} ${ty + th * 0.7}
               Q${cx} ${ty + th * 0.78} ${tx + tw * 0.12} ${ty + th * 0.7}Z"
        fill="${color}" opacity="0.55"/>
      <!-- chest plate center ridge -->
      <line x1="${cx}" y1="${ty + 4}" x2="${cx}" y2="${ty + th * 0.55}" stroke="${lightColor}" stroke-width="1" opacity="0.35"/>
      <!-- scale pattern -->
      <path d="M${tx + tw * 0.2} ${ty + th * 0.25} Q${cx} ${ty + th * 0.2} ${tx + tw * 0.8} ${ty + th * 0.25}"
        stroke="${darkColor}" stroke-width="0.8" fill="none" opacity="0.4"/>
      <path d="M${tx + tw * 0.2} ${ty + th * 0.38} Q${cx} ${ty + th * 0.33} ${tx + tw * 0.8} ${ty + th * 0.38}"
        stroke="${darkColor}" stroke-width="0.8" fill="none" opacity="0.35"/>
      <path d="M${tx + tw * 0.22} ${ty + th * 0.51} Q${cx} ${ty + th * 0.46} ${tx + tw * 0.78} ${ty + th * 0.51}"
        stroke="${darkColor}" stroke-width="0.8" fill="none" opacity="0.3"/>
      <!-- left pauldron -->
      <path d="M${tx - 2} ${ty + padW * 0.5}
               Q${tx} ${ty - padW * 0.4} ${tx + padW * 1.2} ${ty - padW * 0.3}
               L${tx + padW * 1.3} ${ty + padW * 0.5}
               Q${tx + padW * 0.6} ${ty + padW * 0.7} ${tx - 2} ${ty + padW * 0.5}Z"
        fill="${darkColor}" opacity="0.8"/>
      <path d="M${tx} ${ty + padW * 0.15} Q${tx + padW * 0.6} ${ty - padW * 0.2} ${tx + padW * 1.1} ${ty - padW * 0.1}"
        stroke="${lightColor}" stroke-width="0.6" fill="none" opacity="0.3"/>
      <!-- right pauldron -->
      <path d="M${tx + tw + 2} ${ty + padW * 0.5}
               Q${tx + tw} ${ty - padW * 0.4} ${tx + tw - padW * 1.2} ${ty - padW * 0.3}
               L${tx + tw - padW * 1.3} ${ty + padW * 0.5}
               Q${tx + tw - padW * 0.6} ${ty + padW * 0.7} ${tx + tw + 2} ${ty + padW * 0.5}Z"
        fill="${darkColor}" opacity="0.8"/>
      <!-- belt -->
      <rect x="${tx}" y="${ty + th * 0.72}" width="${tw}" height="${th * 0.08}" rx="1.5" fill="${darkColor}" opacity="0.7"/>
      <rect x="${cx - 2}" y="${ty + th * 0.71}" width="4" height="${th * 0.1}" rx="1" fill="#c9a84c" opacity="0.7"/>`;
  } else if (weight === 'heavy') {
    // Full plate: cuirass + gorget + massive pauldrons + faulds + vambraces
    const padW = tw * 0.28;
    svg += `
      <!-- cuirass -->
      <path d="M${tx + tw * 0.1} ${ty - 2}
               L${tx + tw * 0.9} ${ty - 2}
               L${tx + tw * 0.95} ${ty + th * 0.75}
               Q${cx} ${ty + th * 0.85} ${tx + tw * 0.05} ${ty + th * 0.75}Z"
        fill="${color}" opacity="0.6"/>
      <!-- chest plate ridge -->
      <line x1="${cx}" y1="${ty + 2}" x2="${cx}" y2="${ty + th * 0.6}" stroke="${lightColor}" stroke-width="1.2" opacity="0.3"/>
      <!-- pectoral lines -->
      <path d="M${cx} ${ty + th * 0.12}
               Q${tx + tw * 0.3} ${ty + th * 0.18} ${tx + tw * 0.15} ${ty + th * 0.3}"
        stroke="${lightColor}" stroke-width="0.8" fill="none" opacity="0.25"/>
      <path d="M${cx} ${ty + th * 0.12}
               Q${tx + tw * 0.7} ${ty + th * 0.18} ${tx + tw * 0.85} ${ty + th * 0.3}"
        stroke="${lightColor}" stroke-width="0.8" fill="none" opacity="0.25"/>
      <!-- rivet lines -->
      <line x1="${tx + tw * 0.15}" y1="${ty + th * 0.42}" x2="${tx + tw * 0.85}" y2="${ty + th * 0.42}"
        stroke="${lightColor}" stroke-width="0.6" opacity="0.2"/>
      <line x1="${tx + tw * 0.18}" y1="${ty + th * 0.56}" x2="${tx + tw * 0.82}" y2="${ty + th * 0.56}"
        stroke="${lightColor}" stroke-width="0.5" opacity="0.18"/>
      <!-- gorget (neck guard) -->
      <path d="M${cx - tw * 0.18} ${ty - 4}
               Q${cx} ${ty - 8} ${cx + tw * 0.18} ${ty - 4}
               Q${cx + tw * 0.15} ${ty} ${cx} ${ty - 1}
               Q${cx - tw * 0.15} ${ty} ${cx - tw * 0.18} ${ty - 4}Z"
        fill="${darkColor}" opacity="0.75"/>
      <!-- left pauldron (massive) -->
      <path d="M${tx - 3} ${ty + padW * 0.4}
               Q${tx - 1} ${ty - padW * 0.55} ${tx + padW * 1.4} ${ty - padW * 0.4}
               L${tx + padW * 1.5} ${ty + padW * 0.5}
               Q${tx + padW * 0.7} ${ty + padW * 0.8} ${tx - 3} ${ty + padW * 0.4}Z"
        fill="${darkColor}" opacity="0.85"/>
      <path d="M${tx - 1} ${ty} Q${tx + padW * 0.7} ${ty - padW * 0.3} ${tx + padW * 1.3} ${ty - padW * 0.15}"
        stroke="${lightColor}" stroke-width="0.7" fill="none" opacity="0.3"/>
      <path d="M${tx} ${ty + padW * 0.2} Q${tx + padW * 0.6} ${ty} ${tx + padW * 1.2} ${ty + padW * 0.1}"
        stroke="${lightColor}" stroke-width="0.5" fill="none" opacity="0.2"/>
      <!-- right pauldron (massive) -->
      <path d="M${tx + tw + 3} ${ty + padW * 0.4}
               Q${tx + tw + 1} ${ty - padW * 0.55} ${tx + tw - padW * 1.4} ${ty - padW * 0.4}
               L${tx + tw - padW * 1.5} ${ty + padW * 0.5}
               Q${tx + tw - padW * 0.7} ${ty + padW * 0.8} ${tx + tw + 3} ${ty + padW * 0.4}Z"
        fill="${darkColor}" opacity="0.85"/>
      <!-- faulds (hip plates) -->
      <rect x="${tx + tw * 0.05}" y="${ty + th * 0.72}" width="${tw * 0.9}" height="${th * 0.12}" rx="1.5" fill="${midColor}" opacity="0.55"/>
      <line x1="${cx - tw * 0.15}" y1="${ty + th * 0.72}" x2="${cx - tw * 0.15}" y2="${ty + th * 0.84}"
        stroke="${darkColor}" stroke-width="0.8" opacity="0.4"/>
      <line x1="${cx + tw * 0.15}" y1="${ty + th * 0.72}" x2="${cx + tw * 0.15}" y2="${ty + th * 0.84}"
        stroke="${darkColor}" stroke-width="0.8" opacity="0.4"/>
      <!-- belt -->
      <rect x="${tx}" y="${ty + th * 0.68}" width="${tw}" height="${th * 0.06}" rx="1" fill="${darkColor}" opacity="0.8"/>
      <rect x="${cx - 2.5}" y="${ty + th * 0.67}" width="5" height="${th * 0.08}" rx="1.2" fill="#c9a84c" opacity="0.8"/>
      <!-- vambraces -->
      <rect x="${model.handR.x - 5}" y="${model.handR.y - 16}" width="9" height="10" rx="2.5" fill="${midColor}" opacity="0.6"/>
      <line x1="${model.handR.x - 3}" y1="${model.handR.y - 14}" x2="${model.handR.x + 2}" y2="${model.handR.y - 14}"
        stroke="${lightColor}" stroke-width="0.5" opacity="0.3"/>
      <rect x="${model.handL.x - 4}" y="${model.handL.y - 16}" width="9" height="10" rx="2.5" fill="${midColor}" opacity="0.6"/>`;
  }

  if (hasShield) {
    // Kite shield held on left arm
    const shX = handL.x;
    const shY = handL.y - th * 0.25;
    const shW = tw * 0.22;
    const shH = th * 0.45;
    svg += `
      <!-- shield body -->
      <path d="M${shX} ${shY - shH * 0.4}
               L${shX + shW} ${shY - shH * 0.2}
               L${shX + shW * 0.9} ${shY + shH * 0.4}
               L${shX + shW * 0.5} ${shY + shH * 0.6}
               L${shX + shW * 0.1} ${shY + shH * 0.4}
               L${shX} ${shY - shH * 0.2}Z"
        fill="${color}" opacity="0.85" stroke="${darkColor}" stroke-width="1"/>
      <!-- shield boss -->
      <circle cx="${shX + shW * 0.5}" cy="${shY + shH * 0.05}" r="${shW * 0.2}" fill="${darkColor}" opacity="0.6"/>
      <circle cx="${shX + shW * 0.5}" cy="${shY + shH * 0.05}" r="${shW * 0.1}" fill="${lightColor}" opacity="0.4"/>
      <!-- shield cross -->
      <line x1="${shX + shW * 0.5}" y1="${shY - shH * 0.3}" x2="${shX + shW * 0.5}" y2="${shY + shH * 0.5}"
        stroke="${lightColor}" stroke-width="1" opacity="0.3"/>
      <line x1="${shX + shW * 0.1}" y1="${shY + shH * 0.05}" x2="${shX + shW * 0.9}" y2="${shY + shH * 0.05}"
        stroke="${lightColor}" stroke-width="1" opacity="0.3"/>`;
  }

  svg += '</g>';
  return svg;
}

// =============================================================================
// HAIR STYLE OVERLAYS — positioned at each model's actual head
// =============================================================================

export type HairStyleId = 'short' | 'long' | 'braided' | 'mohawk' | 'ponytail' | 'bald';

export function getHairOverlay(style: HairStyleId, color: string, _vw: number, _vh: number, model?: AncestryModelData): string {
  if (style === 'bald' || !model) return '';
  const { headCenter } = model;
  const hx = headCenter.x;
  const hy = headCenter.y;
  // Scale hair radius based on head (roughly 16px radius for a 74px wide model)
  const r = model.viewW * 0.22;
  const darkHair = adjustBrightness(color, -25);

  switch (style) {
    case 'short':
      return `<g>
        <path d="M${hx - r} ${hy - 4}
                 Q${hx - r} ${hy - r * 1.1} ${hx} ${hy - r * 1.2}
                 Q${hx + r} ${hy - r * 1.1} ${hx + r} ${hy - 4}
                 Q${hx + r * 0.7} ${hy - r * 0.6} ${hx} ${hy - r * 0.7}
                 Q${hx - r * 0.7} ${hy - r * 0.6} ${hx - r} ${hy - 4}Z"
          fill="${color}"/>
        <path d="M${hx - r * 0.6} ${hy - r * 0.8}
                 Q${hx} ${hy - r * 1.05} ${hx + r * 0.6} ${hy - r * 0.8}"
          stroke="${darkHair}" stroke-width="0.8" fill="none" opacity="0.3"/>
      </g>`;
    case 'long': {
      const shoulderY = model.torso.y + model.torso.h * 0.3;
      return `<g>
        <!-- crown -->
        <path d="M${hx - r} ${hy - 4}
                 Q${hx - r} ${hy - r * 1.1} ${hx} ${hy - r * 1.2}
                 Q${hx + r} ${hy - r * 1.1} ${hx + r} ${hy - 4}
                 Q${hx + r * 0.7} ${hy - r * 0.6} ${hx} ${hy - r * 0.7}
                 Q${hx - r * 0.7} ${hy - r * 0.6} ${hx - r} ${hy - 4}Z"
          fill="${color}"/>
        <!-- left drape -->
        <path d="M${hx - r} ${hy - 2} Q${hx - r - 2} ${hy + r} ${hx - r - 1} ${shoulderY}"
          stroke="${color}" stroke-width="${r * 0.5}" fill="none" stroke-linecap="round"/>
        <path d="M${hx - r + 0.5} ${hy} Q${hx - r - 1} ${hy + r * 0.6} ${hx - r} ${shoulderY - 4}"
          stroke="${darkHair}" stroke-width="${r * 0.15}" fill="none" opacity="0.3"/>
        <!-- right drape -->
        <path d="M${hx + r} ${hy - 2} Q${hx + r + 2} ${hy + r} ${hx + r + 1} ${shoulderY}"
          stroke="${color}" stroke-width="${r * 0.5}" fill="none" stroke-linecap="round"/>
      </g>`;
    }
    case 'braided': {
      const braidEnd = model.torso.y + model.torso.h * 0.45;
      const beadColor = adjustBrightness(color, 40);
      return `<g>
        <!-- crown -->
        <path d="M${hx - r} ${hy - 4}
                 Q${hx - r} ${hy - r * 1.1} ${hx} ${hy - r * 1.2}
                 Q${hx + r} ${hy - r * 1.1} ${hx + r} ${hy - 4}
                 Q${hx + r * 0.7} ${hy - r * 0.6} ${hx} ${hy - r * 0.7}
                 Q${hx - r * 0.7} ${hy - r * 0.6} ${hx - r} ${hy - 4}Z"
          fill="${color}"/>
        <!-- left braid -->
        <path d="M${hx - r * 0.5} ${hy + 2}
                 Q${hx - r * 0.7} ${hy + r * 0.8} ${hx - r * 0.5} ${hy + r * 1.5}
                 Q${hx - r * 0.3} ${hy + r * 2} ${hx - r * 0.5} ${braidEnd}"
          stroke="${color}" stroke-width="${r * 0.32}" fill="none"/>
        <circle cx="${hx - r * 0.5}" cy="${braidEnd + 2}" r="${r * 0.15}" fill="${beadColor}"/>
        <!-- right braid -->
        <path d="M${hx + r * 0.5} ${hy + 2}
                 Q${hx + r * 0.7} ${hy + r * 0.8} ${hx + r * 0.5} ${hy + r * 1.5}
                 Q${hx + r * 0.3} ${hy + r * 2} ${hx + r * 0.5} ${braidEnd}"
          stroke="${color}" stroke-width="${r * 0.32}" fill="none"/>
        <circle cx="${hx + r * 0.5}" cy="${braidEnd + 2}" r="${r * 0.15}" fill="${beadColor}"/>
      </g>`;
    }
    case 'mohawk':
      return `<g>
        <path d="M${hx - r * 0.2} ${hy - r * 0.6}
                 Q${hx - r * 0.1} ${hy - r * 1.6} ${hx} ${hy - r * 1.8}
                 Q${hx + r * 0.1} ${hy - r * 1.6} ${hx + r * 0.2} ${hy - r * 0.6}Z"
          fill="${color}"/>
        <path d="M${hx - r * 0.08} ${hy - r * 0.8}
                 Q${hx} ${hy - r * 1.5} ${hx + r * 0.08} ${hy - r * 0.8}"
          fill="${darkHair}" opacity="0.3"/>
      </g>`;
    case 'ponytail': {
      const tailEnd = model.torso.y + model.torso.h * 0.3;
      return `<g>
        <!-- crown -->
        <path d="M${hx - r} ${hy - 4}
                 Q${hx - r} ${hy - r * 1.1} ${hx} ${hy - r * 1.2}
                 Q${hx + r} ${hy - r * 1.1} ${hx + r} ${hy - 4}
                 Q${hx + r * 0.7} ${hy - r * 0.6} ${hx} ${hy - r * 0.7}
                 Q${hx - r * 0.7} ${hy - r * 0.6} ${hx - r} ${hy - 4}Z"
          fill="${color}"/>
        <!-- tie point -->
        <circle cx="${hx + r * 0.5}" cy="${hy - r * 0.5}" r="${r * 0.12}" fill="${adjustBrightness(color, 30)}"/>
        <!-- tail -->
        <path d="M${hx + r * 0.5} ${hy - r * 0.4}
                 Q${hx + r * 1.2} ${hy} ${hx + r * 1.1} ${hy + r * 0.8}
                 Q${hx + r * 1.0} ${hy + r * 1.4} ${hx + r * 0.8} ${tailEnd}"
          stroke="${color}" stroke-width="${r * 0.35}" fill="none" stroke-linecap="round"/>
      </g>`;
    }
    default:
      return '';
  }
}

// =============================================================================
// UTILITY: Adjust hex brightness
// =============================================================================

function adjustBrightness(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(h.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(h.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(h.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// =============================================================================
// CSS for model animations
// =============================================================================

export const MODEL_CSS = `
@keyframes ghostFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes soulPulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
.rev-glow { animation: ghostFloat 3s ease-in-out infinite; }
.soul-eye { animation: soulPulse 2s ease-in-out infinite; }
`;

// =============================================================================
// Kit equipment lookup
// =============================================================================

export const KIT_EQUIPMENT: Record<string, { armor: string; weapons: string[] }> = {
  arcaneArcher:  { armor: 'none', weapons: ['bow'] },
  battlemind:    { armor: 'light', weapons: ['medium'] },
  cloakAndDagger:{ armor: 'light', weapons: ['light'] },
  dualWielder:   { armor: 'medium', weapons: ['light', 'medium'] },
  guisarmier:    { armor: 'medium', weapons: ['polearm'] },
  martialArtist: { armor: 'none', weapons: ['unarmed'] },
  mountain:      { armor: 'heavy', weapons: ['heavy'] },
  panther:       { armor: 'none', weapons: ['heavy'] },
  pugilist:      { armor: 'none', weapons: ['unarmed'] },
  raider:        { armor: 'light, shield', weapons: ['light'] },
  ranger:        { armor: 'medium', weapons: ['bow', 'medium'] },
  rapidFire:     { armor: 'light', weapons: ['bow'] },
  retiarius:     { armor: 'light', weapons: ['ensnaring', 'polearm'] },
  shiningArmor:  { armor: 'heavy, shield', weapons: ['medium'] },
  sniper:        { armor: 'none', weapons: ['bow'] },
  spellsword:    { armor: 'light, shield', weapons: ['medium'] },
  stickAndRobe:  { armor: 'light', weapons: ['polearm'] },
  swashbuckler:  { armor: 'light', weapons: ['medium'] },
  swordAndBoard: { armor: 'medium, shield', weapons: ['medium'] },
  warriorPriest: { armor: 'heavy', weapons: ['light'] },
  whirlwind:     { armor: 'none', weapons: ['whip'] },
  boren:         { armor: 'none', weapons: ['unarmed'] },
  corven:        { armor: 'none', weapons: ['unarmed'] },
  raden:         { armor: 'none', weapons: ['unarmed'] },
  vuken:         { armor: 'none', weapons: ['unarmed'] },
};

export function parseArmorWeight(armorStr: string): ArmorWeight {
  if (armorStr.includes('heavy')) return 'heavy';
  if (armorStr.includes('medium')) return 'medium';
  if (armorStr.includes('light')) return 'light';
  return 'none';
}

export function parseHasShield(armorStr: string): boolean {
  return armorStr.includes('shield');
}

// =============================================================================
// Color replacement for clothing recolor
// =============================================================================

export function recolorSvg(
  svg: string,
  clothingReplacements: Array<{ original: string; replacement: string }>,
): string {
  let result = svg;
  for (const { original, replacement } of clothingReplacements) {
    result = result.replaceAll(original, replacement);
  }
  return result;
}

/** Generate clothing color replacements from a target color, respecting role-based brightness */
export function buildClothingReplacements(
  model: AncestryModelData,
  targetColor: string,
): Array<{ original: string; replacement: string }> {
  return model.clothingColors.map(({ original, role }) => {
    let replacement: string;
    switch (role) {
      case 'light': replacement = adjustBrightness(targetColor, 40); break;
      case 'dark': replacement = adjustBrightness(targetColor, -40); break;
      case 'accent': replacement = adjustBrightness(targetColor, 20); break;
      case 'primary':
      default: replacement = targetColor; break;
    }
    return { original, replacement };
  });
}
