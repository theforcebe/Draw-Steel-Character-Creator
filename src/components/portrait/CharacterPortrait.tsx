import { useEffect } from 'react';
import type { CharacterData } from '../../types/character';
import {
  ANCESTRY_MODELS,
  KIT_EQUIPMENT,
  MODEL_CSS,
  getWeaponOverlay,
  getArmorOverlay,
  getHairOverlay,
  recolorSvg,
  buildClothingReplacements,
  parseArmorWeight,
  parseHasShield,
} from './models';
import type { HairStyleId } from './models';

// ---------------------------------------------------------------------------
// Inject model CSS once
// ---------------------------------------------------------------------------

let cssInjected = false;
function ensureModelCss() {
  if (cssInjected) return;
  const style = document.createElement('style');
  style.textContent = MODEL_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

// ---------------------------------------------------------------------------
// Build complete SVG string for a character
// ---------------------------------------------------------------------------

/** Strip outer <svg ...> and </svg> tags, returning just the inner content */
function stripSvgWrapper(svg: string): string {
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

export function buildCharacterSvg(character: CharacterData): string | null {
  const ancestryId = character.ancestryId;
  if (!ancestryId) return null;

  // For revenants, show the former life ancestry with revenant styling
  const isRevenant = ancestryId === 'revenant';
  const modelId = isRevenant
    ? (character.formerLifeAncestryId ?? 'revenant')
    : ancestryId;

  const model = ANCESTRY_MODELS[modelId];
  if (!model) return null;

  const { viewW, viewH } = model;
  let bodySvg = isRevenant ? model.revenant : model.living;

  // Strip the <svg> wrapper — we'll composite everything in our own <svg>
  bodySvg = stripSvgWrapper(bodySvg);

  // Apply clothing color replacement (only for living models — revenant has its own palette)
  if (!isRevenant && character.portraitSettings?.clothingColor) {
    const replacements = buildClothingReplacements(model, character.portraitSettings.clothingColor);
    bodySvg = recolorSvg(bodySvg, replacements);
  }

  // Apply hair color replacement
  if (!isRevenant && model.hairColor && character.portraitSettings?.hairColor) {
    bodySvg = bodySvg.replaceAll(model.hairColor, character.portraitSettings.hairColor);
  }

  // Hair overlay
  let hairSvg = '';
  if (model.hasHair && character.portraitSettings?.hairStyle) {
    const hairColor = isRevenant
      ? '#1a2020'
      : (character.portraitSettings?.hairColor || model.defaultHairColor);
    hairSvg = getHairOverlay(
      character.portraitSettings.hairStyle as HairStyleId,
      hairColor,
      viewW,
      viewH,
      model,
    );
  }

  // Kit equipment
  let weaponSvg = '';
  let armorSvg = '';
  const kitId = character.classChoice?.kitId;
  if (kitId) {
    const kit = KIT_EQUIPMENT[kitId];
    if (kit) {
      // Weapon
      if (kit.weapons[0]) {
        weaponSvg = getWeaponOverlay(kit.weapons[0], viewW, viewH, model);
      }
      // Armor
      const armorWeight = parseArmorWeight(kit.armor);
      const hasShield = parseHasShield(kit.armor);
      const armorColor = character.portraitSettings?.armorColor || '#757575';
      armorSvg = getArmorOverlay(armorWeight, hasShield, armorColor, viewW, viewH, model);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="100%" height="100%">
    <style>
      @keyframes ghostFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      @keyframes soulPulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
      .rev-glow { animation: ghostFloat 3s ease-in-out infinite; }
      .soul-eye { animation: soulPulse 2s ease-in-out infinite; }
    </style>
    ${bodySvg}
    ${armorSvg}
    ${weaponSvg}
    ${hairSvg}
  </svg>`;
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
  useEffect(ensureModelCss, []);

  const svgString = buildCharacterSvg(character);

  if (!svgString) {
    // Placeholder when no ancestry selected
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
