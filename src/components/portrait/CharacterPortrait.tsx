import type { CharacterData } from '../../types/character';

// ---------------------------------------------------------------------------
// Class color themes
// ---------------------------------------------------------------------------

const CLASS_COLORS: Record<string, { primary: string; glow: string }> = {
  censor:      { primary: '#f0d47a', glow: 'rgba(240,212,122,0.3)' },
  conduit:     { primary: '#7ab8f0', glow: 'rgba(122,184,240,0.3)' },
  elementalist:{ primary: '#f09a5a', glow: 'rgba(240,154,90,0.3)' },
  fury:        { primary: '#e05545', glow: 'rgba(224,85,69,0.3)' },
  null:        { primary: '#b07af0', glow: 'rgba(176,122,240,0.3)' },
  shadow:      { primary: '#8a6fbf', glow: 'rgba(138,111,191,0.3)' },
  tactician:   { primary: '#6fa8bf', glow: 'rgba(111,168,191,0.3)' },
  talent:      { primary: '#c47af0', glow: 'rgba(196,122,240,0.3)' },
  troubadour:  { primary: '#5abfa0', glow: 'rgba(90,191,160,0.3)' },
  summoner:    { primary: '#7abf5a', glow: 'rgba(122,191,90,0.3)' },
};

const DEFAULT_COLORS = { primary: '#d4a843', glow: 'rgba(212,168,67,0.2)' };

// ---------------------------------------------------------------------------
// Armor visual configs
// ---------------------------------------------------------------------------

type ArmorType = 'none' | 'light' | 'medium' | 'heavy';

function getArmorType(armorStr?: string): ArmorType {
  if (!armorStr) return 'none';
  if (armorStr.includes('heavy')) return 'heavy';
  if (armorStr.includes('medium')) return 'medium';
  if (armorStr.includes('light')) return 'light';
  return 'none';
}

function getHasShield(armorStr?: string): boolean {
  return !!armorStr?.includes('shield');
}

// ---------------------------------------------------------------------------
// Ancestry silhouette paths (bust portraits in 200x260 viewBox)
// ---------------------------------------------------------------------------

function HumanSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Head */}
      <ellipse cx="100" cy="95" rx="32" ry="38" fill={fill} />
      {/* Hair */}
      <path d="M68 88 Q68 58 100 55 Q132 58 132 88 Q125 72 100 70 Q75 72 68 88Z" fill={fill} opacity="0.8" />
      {/* Neck */}
      <rect x="88" y="130" width="24" height="20" rx="4" fill={fill} />
      {/* Shoulders */}
      <path d="M45 185 Q50 150 88 148 L112 148 Q150 150 155 185 L155 210 Q130 195 100 195 Q70 195 45 210Z" fill={fill} />
    </g>
  );
}

function DevilSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Horns */}
      <path d="M62 75 Q55 40 48 22 Q58 45 68 65Z" fill={fill} opacity="0.9" />
      <path d="M138 75 Q145 40 152 22 Q142 45 132 65Z" fill={fill} opacity="0.9" />
      {/* Head */}
      <ellipse cx="100" cy="95" rx="30" ry="36" fill={fill} />
      {/* Pointed ears */}
      <path d="M70 88 L58 75 L72 85Z" fill={fill} />
      <path d="M130 88 L142 75 L128 85Z" fill={fill} />
      {/* Sharp chin */}
      <path d="M82 125 L100 138 L118 125 Q100 132 82 125Z" fill={fill} opacity="0.7" />
      {/* Neck */}
      <rect x="88" y="128" width="24" height="22" rx="4" fill={fill} />
      {/* Shoulders */}
      <path d="M42 185 Q48 148 88 146 L112 146 Q152 148 158 185 L158 210 Q130 195 100 195 Q70 195 42 210Z" fill={fill} />
    </g>
  );
}

function DragonKnightSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Head crest/ridge */}
      <path d="M88 52 L100 38 L112 52 Q108 48 100 46 Q92 48 88 52Z" fill={fill} opacity="0.9" />
      {/* Head - broader, more angular */}
      <path d="M66 100 Q66 62 100 58 Q134 62 134 100 Q134 128 100 135 Q66 128 66 100Z" fill={fill} />
      {/* Jaw ridges */}
      <path d="M66 105 L58 112 L66 108Z" fill={fill} opacity="0.7" />
      <path d="M134 105 L142 112 L134 108Z" fill={fill} opacity="0.7" />
      {/* Neck scales */}
      <path d="M85 132 L100 140 L115 132 L115 155 L85 155Z" fill={fill} />
      {/* Broad shoulders */}
      <path d="M38 190 Q42 150 85 148 L115 148 Q158 150 162 190 L162 215 Q130 198 100 198 Q70 198 38 215Z" fill={fill} />
      {/* Shoulder ridges */}
      <path d="M52 168 L42 160 L50 172Z" fill={fill} opacity="0.7" />
      <path d="M148 168 L158 160 L150 172Z" fill={fill} opacity="0.7" />
    </g>
  );
}

function DwarfSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Head - wider */}
      <ellipse cx="100" cy="92" rx="35" ry="34" fill={fill} />
      {/* Hair/helm */}
      <path d="M65 85 Q65 62 100 58 Q135 62 135 85 Q128 70 100 68 Q72 70 65 85Z" fill={fill} opacity="0.85" />
      {/* Beard */}
      <path d="M72 110 Q72 148 100 158 Q128 148 128 110 Q120 130 100 135 Q80 130 72 110Z" fill={fill} opacity="0.75" />
      {/* Thick neck */}
      <rect x="82" y="125" width="36" height="20" rx="6" fill={fill} />
      {/* Very broad shoulders */}
      <path d="M35 188 Q40 150 82 148 L118 148 Q160 150 165 188 L165 215 Q130 198 100 198 Q70 198 35 215Z" fill={fill} />
    </g>
  );
}

function WodeElfSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Long pointed ears */}
      <path d="M68 90 L42 62 L66 82Z" fill={fill} />
      <path d="M132 90 L158 62 L134 82Z" fill={fill} />
      {/* Head - narrow, elegant */}
      <ellipse cx="100" cy="92" rx="27" ry="38" fill={fill} />
      {/* Leaf crown hints */}
      <path d="M78 62 L85 52 L92 62 Q88 58 78 62Z" fill={fill} opacity="0.6" />
      <path d="M108 62 L115 52 L122 62 Q118 58 108 62Z" fill={fill} opacity="0.6" />
      {/* Slender neck */}
      <rect x="90" y="128" width="20" height="24" rx="4" fill={fill} />
      {/* Slim shoulders */}
      <path d="M52 190 Q58 152 90 150 L110 150 Q142 152 148 190 L148 215 Q126 200 100 200 Q74 200 52 215Z" fill={fill} />
    </g>
  );
}

function HighElfSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Upswept pointed ears */}
      <path d="M68 88 L48 55 L70 80Z" fill={fill} />
      <path d="M132 88 L152 55 L130 80Z" fill={fill} />
      {/* Head - narrow, regal */}
      <ellipse cx="100" cy="92" rx="28" ry="37" fill={fill} />
      {/* Tiara/crown */}
      <path d="M80 60 L86 48 L92 58 L100 42 L108 58 L114 48 L120 60 Q100 55 80 60Z" fill={fill} opacity="0.7" />
      {/* Elegant neck */}
      <rect x="90" y="127" width="20" height="24" rx="4" fill={fill} />
      {/* Refined shoulders */}
      <path d="M50 190 Q56 152 90 150 L110 150 Q144 152 150 190 L150 215 Q126 200 100 200 Q74 200 50 215Z" fill={fill} />
    </g>
  );
}

function HakaanSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Large head */}
      <ellipse cx="100" cy="90" rx="38" ry="40" fill={fill} />
      {/* Strong brow */}
      <path d="M62 80 Q80 72 100 72 Q120 72 138 80 L138 76 Q120 68 100 68 Q80 68 62 76Z" fill={fill} opacity="0.8" />
      {/* Thick neck */}
      <rect x="78" y="126" width="44" height="22" rx="8" fill={fill} />
      {/* Massive shoulders */}
      <path d="M30 192 Q36 148 78 146 L122 146 Q164 148 170 192 L170 220 Q135 200 100 200 Q65 200 30 220Z" fill={fill} />
    </g>
  );
}

function MemonekSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Geometric head */}
      <path d="M72 62 L100 52 L128 62 L132 100 L124 130 L100 138 L76 130 L68 100Z" fill={fill} />
      {/* Circuit lines on face */}
      <line x1="100" y1="65" x2="100" y2="85" stroke={fill} strokeWidth="1.5" opacity="0.4" />
      <line x1="82" y1="90" x2="92" y2="90" stroke={fill} strokeWidth="1.5" opacity="0.4" />
      <line x1="108" y1="90" x2="118" y2="90" stroke={fill} strokeWidth="1.5" opacity="0.4" />
      <line x1="88" y1="105" x2="112" y2="105" stroke={fill} strokeWidth="1.5" opacity="0.4" />
      {/* Neck */}
      <rect x="90" y="132" width="20" height="18" rx="2" fill={fill} />
      {/* Angular shoulders */}
      <path d="M48 188 L55 150 L90 148 L110 148 L145 150 L152 188 L152 210 Q128 196 100 196 Q72 196 48 210Z" fill={fill} />
    </g>
  );
}

function OrcSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Head - broad and powerful */}
      <ellipse cx="100" cy="92" rx="35" ry="36" fill={fill} />
      {/* Pointed ears */}
      <path d="M65 85 L52 72 L67 82Z" fill={fill} />
      <path d="M135 85 L148 72 L133 82Z" fill={fill} />
      {/* Lower tusks */}
      <path d="M80 118 L76 130 L82 120Z" fill={fill} opacity="0.9" />
      <path d="M120 118 L124 130 L118 120Z" fill={fill} opacity="0.9" />
      {/* Strong jaw */}
      <path d="M72 108 Q100 128 128 108 Q128 120 100 126 Q72 120 72 108Z" fill={fill} opacity="0.7" />
      {/* Thick neck */}
      <rect x="82" y="124" width="36" height="22" rx="6" fill={fill} />
      {/* Broad muscular shoulders */}
      <path d="M35 190 Q40 148 82 146 L118 146 Q160 148 165 190 L165 215 Q132 198 100 198 Q68 198 35 215Z" fill={fill} />
    </g>
  );
}

function PolderSilhouette({ fill }: { fill: string }) {
  return (
    <g transform="translate(0, 30)">
      {/* Small rounded head */}
      <ellipse cx="100" cy="105" rx="24" ry="26" fill={fill} />
      {/* Curly hair suggestion */}
      <circle cx="82" cy="85" r="8" fill={fill} opacity="0.6" />
      <circle cx="100" cy="80" r="9" fill={fill} opacity="0.6" />
      <circle cx="118" cy="85" r="8" fill={fill} opacity="0.6" />
      <circle cx="88" cy="82" r="6" fill={fill} opacity="0.5" />
      <circle cx="112" cy="82" r="6" fill={fill} opacity="0.5" />
      {/* Slim neck */}
      <rect x="92" y="128" width="16" height="16" rx="3" fill={fill} />
      {/* Narrow shoulders (smaller build) */}
      <path d="M62 180 Q68 148 92 146 L108 146 Q132 148 138 180 L138 205 Q120 192 100 192 Q80 192 62 205Z" fill={fill} />
    </g>
  );
}

function RevenantSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Hood/cowl */}
      <path d="M58 105 Q58 48 100 42 Q142 48 142 105 Q135 55 100 50 Q65 55 58 105Z" fill={fill} opacity="0.7" />
      {/* Gaunt skull-like head */}
      <ellipse cx="100" cy="92" rx="28" ry="35" fill={fill} />
      {/* Hollow eye sockets */}
      <ellipse cx="87" cy="86" rx="7" ry="8" fill="#0e0a07" />
      <ellipse cx="113" cy="86" rx="7" ry="8" fill="#0e0a07" />
      {/* Glowing eyes */}
      <ellipse cx="87" cy="86" rx="3" ry="3.5" fill={fill} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="113" cy="86" rx="3" ry="3.5" fill={fill} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
      </ellipse>
      {/* Gaunt jaw */}
      <path d="M78 110 Q100 125 122 110 Q118 120 100 125 Q82 120 78 110Z" fill={fill} opacity="0.6" />
      {/* Neck */}
      <rect x="88" y="122" width="24" height="22" rx="4" fill={fill} />
      {/* Tattered shoulder cloak */}
      <path d="M40 188 Q46 148 88 146 L112 146 Q154 148 160 188 L160 215 Q130 198 100 198 Q70 198 40 215Z" fill={fill} />
      <path d="M40 188 L38 210 L45 195Z" fill={fill} opacity="0.5" />
      <path d="M160 188 L162 210 L155 195Z" fill={fill} opacity="0.5" />
    </g>
  );
}

function TimeRaiderSilhouette({ fill }: { fill: string }) {
  return (
    <g>
      {/* Crystal crown spires */}
      <path d="M78 58 L82 35 L86 58Z" fill={fill} opacity="0.8" />
      <path d="M92 55 L100 28 L108 55Z" fill={fill} opacity="0.9" />
      <path d="M114 58 L118 35 L122 58Z" fill={fill} opacity="0.8" />
      {/* Angular head */}
      <path d="M68 65 L100 58 L132 65 L136 100 L126 128 L100 136 L74 128 L64 100Z" fill={fill} />
      {/* Temporal lines */}
      <path d="M80 75 L80 95" stroke={fill} strokeWidth="1" opacity="0.3" />
      <path d="M120 75 L120 95" stroke={fill} strokeWidth="1" opacity="0.3" />
      {/* Neck */}
      <rect x="88" y="132" width="24" height="18" rx="3" fill={fill} />
      {/* Angular shoulders */}
      <path d="M44 188 L52 148 L88 146 L112 146 L148 148 L156 188 L156 215 Q130 198 100 198 Q70 198 44 215Z" fill={fill} />
      {/* Crystal shoulder accents */}
      <path d="M52 158 L44 148 L54 152Z" fill={fill} opacity="0.6" />
      <path d="M148 158 L156 148 L146 152Z" fill={fill} opacity="0.6" />
    </g>
  );
}

const ANCESTRY_COMPONENTS: Record<string, React.FC<{ fill: string }>> = {
  devil: DevilSilhouette,
  dragonKnight: DragonKnightSilhouette,
  dwarf: DwarfSilhouette,
  wodeElf: WodeElfSilhouette,
  highElf: HighElfSilhouette,
  hakaan: HakaanSilhouette,
  human: HumanSilhouette,
  memonek: MemonekSilhouette,
  orc: OrcSilhouette,
  polder: PolderSilhouette,
  revenant: RevenantSilhouette,
  timeRaider: TimeRaiderSilhouette,
};

// ---------------------------------------------------------------------------
// Armor overlay
// ---------------------------------------------------------------------------

function ArmorOverlay({ type, hasShield, color }: { type: ArmorType; hasShield: boolean; color: string }) {
  return (
    <g opacity="0.45">
      {type === 'light' && (
        <>
          {/* Leather shoulder pads */}
          <path d="M50 180 Q55 168 75 165 L80 172 Q60 174 55 182Z" fill={color} />
          <path d="M150 180 Q145 168 125 165 L120 172 Q140 174 145 182Z" fill={color} />
        </>
      )}
      {type === 'medium' && (
        <>
          {/* Breastplate / scale armor */}
          <path d="M75 165 L125 165 L130 195 Q115 200 100 200 Q85 200 70 195Z" fill={color} opacity="0.5" />
          {/* Shoulder guards */}
          <path d="M45 182 Q50 162 75 158 L82 168 Q58 170 52 185Z" fill={color} />
          <path d="M155 182 Q150 162 125 158 L118 168 Q142 170 148 185Z" fill={color} />
        </>
      )}
      {type === 'heavy' && (
        <>
          {/* Full plate chest */}
          <path d="M70 158 L130 158 L135 200 Q115 208 100 208 Q85 208 65 200Z" fill={color} opacity="0.5" />
          {/* Large pauldrons */}
          <path d="M38 185 Q42 155 70 152 L80 165 Q52 162 46 188Z" fill={color} />
          <path d="M162 185 Q158 155 130 152 L120 165 Q148 162 154 188Z" fill={color} />
          {/* Gorget */}
          <path d="M82 148 Q100 142 118 148 Q118 155 100 152 Q82 155 82 148Z" fill={color} />
        </>
      )}
      {hasShield && (
        <g transform="translate(148, 175) rotate(15)">
          {/* Shield */}
          <path d="M0 -12 L12 -6 L12 10 L0 18 L-12 10 L-12 -6Z" fill={color} opacity="0.7" stroke={color} strokeWidth="1" />
          <line x1="0" y1="-8" x2="0" y2="14" stroke={color} strokeWidth="1.5" opacity="0.5" />
        </g>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Weapon overlay
// ---------------------------------------------------------------------------

function WeaponOverlay({ weapons, color }: { weapons: string[]; color: string }) {
  const primary = weapons[0];
  if (!primary) return null;

  return (
    <g opacity="0.4">
      {primary === 'bow' && (
        <g transform="translate(155, 90) rotate(25)">
          {/* Bow */}
          <path d="M0 -40 Q15 0 0 40" fill="none" stroke={color} strokeWidth="2.5" />
          <line x1="0" y1="-38" x2="0" y2="38" stroke={color} strokeWidth="0.8" opacity="0.6" />
        </g>
      )}
      {primary === 'heavy' && (
        <g transform="translate(42, 70) rotate(-10)">
          {/* Greatsword on back */}
          <rect x="-3" y="0" width="6" height="90" rx="1" fill={color} />
          <rect x="-12" y="-2" width="24" height="6" rx="2" fill={color} />
          <rect x="-2" y="-8" width="4" height="8" rx="1" fill={color} />
        </g>
      )}
      {primary === 'medium' && (
        <g transform="translate(150, 165) rotate(30)">
          {/* Sword at hip */}
          <rect x="-2" y="0" width="4" height="50" rx="1" fill={color} />
          <rect x="-6" y="-2" width="12" height="4" rx="1" fill={color} />
          <rect x="-1.5" y="-6" width="3" height="5" rx="1" fill={color} />
        </g>
      )}
      {primary === 'light' && (
        <>
          {/* Dual daggers */}
          <g transform="translate(148, 172) rotate(25)">
            <rect x="-1.5" y="0" width="3" height="28" rx="1" fill={color} />
            <rect x="-4" y="-1" width="8" height="3" rx="1" fill={color} />
          </g>
          {weapons.length <= 1 && (
            <g transform="translate(52, 172) rotate(-25)">
              <rect x="-1.5" y="0" width="3" height="28" rx="1" fill={color} />
              <rect x="-4" y="-1" width="8" height="3" rx="1" fill={color} />
            </g>
          )}
        </>
      )}
      {primary === 'polearm' && (
        <g transform="translate(155, 50) rotate(8)">
          {/* Spear/polearm */}
          <rect x="-2" y="0" width="4" height="130" rx="1" fill={color} />
          <path d="M-5 0 L0 -12 L5 0Z" fill={color} />
        </g>
      )}
      {primary === 'unarmed' && (
        <>
          {/* Wrapped fist indicators */}
          <circle cx="48" cy="195" r="5" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="152" cy="195" r="5" fill="none" stroke={color} strokeWidth="1.5" />
        </>
      )}
      {primary === 'whip' && (
        <g transform="translate(155, 170)">
          {/* Coiled whip */}
          <path d="M0 0 Q8 -10 5 -20 Q2 -28 8 -35 Q14 -42 10 -50" fill="none" stroke={color} strokeWidth="2" />
        </g>
      )}
      {primary === 'ensnaring' && (
        <g transform="translate(48, 165)">
          {/* Net */}
          <circle cx="0" cy="0" r="12" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="-8" y1="-8" x2="8" y2="8" stroke={color} strokeWidth="0.8" />
          <line x1="8" y1="-8" x2="-8" y2="8" stroke={color} strokeWidth="0.8" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke={color} strokeWidth="0.8" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke={color} strokeWidth="0.8" />
        </g>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Portrait frame
// ---------------------------------------------------------------------------

function PortraitFrame({ color }: { color: string }) {
  return (
    <g>
      {/* Outer ornate border */}
      <ellipse cx="100" cy="130" rx="92" ry="115" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
      {/* Inner border */}
      <ellipse cx="100" cy="130" rx="86" ry="110" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2" />
      {/* Top ornament */}
      <path d="M80 18 L90 12 L100 8 L110 12 L120 18" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="100" cy="8" r="2.5" fill={color} opacity="0.5" />
      {/* Bottom ornament */}
      <path d="M75 242 L90 248 L100 252 L110 248 L125 242" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="100" cy="252" r="2.5" fill={color} opacity="0.5" />
      {/* Side ornaments */}
      <circle cx="8" cy="130" r="1.5" fill={color} opacity="0.3" />
      <circle cx="192" cy="130" r="1.5" fill={color} opacity="0.3" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface CharacterPortraitProps {
  character: CharacterData;
  size?: number;
}

export function CharacterPortrait({ character, size = 200 }: CharacterPortraitProps) {
  const classId = character.classChoice?.classId;
  const colors = classId ? (CLASS_COLORS[classId] ?? DEFAULT_COLORS) : DEFAULT_COLORS;
  const ancestryId = character.ancestryId ?? 'human';
  const AncestryComponent = ANCESTRY_COMPONENTS[ancestryId] ?? HumanSilhouette;

  // Get kit equipment info
  const kitId = character.classChoice?.kitId;
  let armorStr: string | undefined;
  let weaponsList: string[] = [];

  if (kitId) {
    try {
      // Dynamic import won't work, access from kits data at runtime
      // We'll pass equipment info through props or read from a lightweight map
      const kitEquip = KIT_EQUIPMENT[kitId];
      if (kitEquip) {
        armorStr = kitEquip.armor;
        weaponsList = kitEquip.weapons;
      }
    } catch {
      // Fallback - no equipment overlay
    }
  }

  const armorType = getArmorType(armorStr);
  const hasShield = getHasShield(armorStr);

  // Silhouette fill: dark with subtle class color tint
  const silhouetteFill = `color-mix(in srgb, ${colors.primary} 25%, #2a1f18)`;

  return (
    <svg
      viewBox="0 0 200 260"
      width={size}
      height={size * 1.3}
      className="drop-shadow-lg"
    >
      <defs>
        {/* Background radial glow */}
        <radialGradient id={`glow-${classId ?? 'default'}`} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor={colors.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <ellipse cx="100" cy="120" rx="80" ry="100" fill={`url(#glow-${classId ?? 'default'})`} />

      {/* Ancestry silhouette */}
      <AncestryComponent fill={silhouetteFill} />

      {/* Armor overlay */}
      {armorType !== 'none' || hasShield ? (
        <ArmorOverlay type={armorType} hasShield={hasShield} color={colors.primary} />
      ) : null}

      {/* Weapon overlay */}
      {weaponsList.length > 0 && (
        <WeaponOverlay weapons={weaponsList} color={colors.primary} />
      )}

      {/* Portrait frame */}
      <PortraitFrame color={colors.primary} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Lightweight kit equipment lookup (to avoid importing full JSON)
// ---------------------------------------------------------------------------

const KIT_EQUIPMENT: Record<string, { armor: string; weapons: string[] }> = {
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
  // Stormwight kits (unarmed / animal forms)
  stormwightBase:{ armor: 'none', weapons: ['unarmed'] },
  boren:         { armor: 'none', weapons: ['unarmed'] },
  corven:        { armor: 'none', weapons: ['unarmed'] },
  raden:         { armor: 'none', weapons: ['unarmed'] },
  vuken:         { armor: 'none', weapons: ['unarmed'] },
};
