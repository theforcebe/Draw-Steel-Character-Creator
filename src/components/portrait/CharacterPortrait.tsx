import { useEffect } from 'react';
import type { CharacterData } from '../../types/character';
import { ANCESTRY_ID_MAP, getTier, ANCESTRY_DEFAULTS } from './model-data';
import type { ColorOverride } from './model-data';
import { renderAncestryModel } from './ancestry-renderers';
import { ensureEnhancedModelCss } from './model-css';

// ---------------------------------------------------------------------------
// Build complete SVG string for a character
// ---------------------------------------------------------------------------

export function buildCharacterSvg(character: CharacterData): string | null {
  const ancestryId = character.ancestryId;
  if (!ancestryId) return null;

  const isRevenant = ancestryId === 'revenant';
  const modelAncestry = isRevenant
    ? (character.formerLifeAncestryId ?? 'revenant')
    : ancestryId;

  const level = character.level || 1;
  const kitId = character.classChoice?.kitId ?? null;
  const weaponId = character.portraitSettings?.weaponId ?? null;

  // Build color overrides from portrait settings
  let colorOverride: ColorOverride | undefined;
  if (character.portraitSettings) {
    const ps = character.portraitSettings;
    colorOverride = {
      skin: ps.skinColor || null,
      armor: ps.armorColor || null,
      accent: ps.accentColor || null,
      gem: ps.gemColor || null,
    };
  }

  return renderAncestryModel(
    modelAncestry,
    level,
    isRevenant,
    kitId,
    weaponId,
    colorOverride,
  );
}

// ---------------------------------------------------------------------------
// React component
// ---------------------------------------------------------------------------

interface CharacterPortraitProps {
  character: CharacterData;
  size?: number;
  className?: string;
}

export function CharacterPortrait({ character, size = 200, className = '' }: CharacterPortraitProps) {
  useEffect(() => ensureEnhancedModelCss(), []);

  const svgString = buildCharacterSvg(character);

  if (!svgString) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size * 1.3 }}
      >
        <div className="flex flex-col items-center gap-2 text-cream-dark/30">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <circle cx="12" cy="10" r="3" />
            <path d="M6.5 18.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
          </svg>
          <span className="font-heading text-[0.6rem] uppercase tracking-wider">Select Ancestry</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`character-model ${className}`}
      style={{ width: size, height: size * 1.8 }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
