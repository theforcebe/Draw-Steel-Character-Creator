import { useCharacterStore } from '../../stores/character-store';
import { CharacterPortrait, buildCharacterSvg } from '../portrait/CharacterPortrait';
import {
  ANCESTRY_ID_MAP,
  ANCESTRY_DEFAULTS,
  ANCESTRY_DIMENSIONS,
  getTier,
  getAvailableWeapons,
  getKitArmorClass,
} from '../portrait/model-data';
import type { CharacterData, PortraitSettings } from '../../types/character';

function exportModelImage(character: CharacterData) {
  const svgString = buildCharacterSvg(character);
  if (!svgString) return;

  const ancestryId = character.ancestryId;
  const modelAncestry = ancestryId === 'revenant'
    ? (character.formerLifeAncestryId ?? 'revenant')
    : ancestryId;
  const mappedId = modelAncestry ? (ANCESTRY_ID_MAP[modelAncestry] || modelAncestry) : 'human';
  const dims = ANCESTRY_DIMENSIONS[mappedId] || { w: 110, h: 200 };

  const canvas = document.createElement('canvas');
  const scale = 4;
  canvas.width = dims.w * scale;
  canvas.height = dims.h * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    const name = character.name || 'character';
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-model.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  img.src = url;
}

const PRESET_SKIN_COLORS = [
  '#c8a080', '#e8d5c0', '#8d6e63', '#5d4037', '#3e2723',
  '#c0392b', '#1565c0', '#66bb6a', '#6d8c40', '#4fc3f7',
  '#ff8f00', '#a1887f', '#37474f',
];

const PRESET_ARMOR_COLORS = [
  '#909090', '#757575', '#424242', '#212121',
  '#c9a84c', '#b8860b', '#8b4513', '#cd7f32',
  '#1565c0', '#c62828', '#2e7d32', '#4a148c',
  '#6aaa6a', '#ff6a00', '#cc44ff',
];

const PRESET_ACCENT_COLORS = [
  '#c0c0c0', '#f0d07a', '#8fdd8f', '#ffa040', '#ee88ff',
  '#7fffd4', '#ffcc02', '#e8d0ff', '#ff5722', '#0288d1',
];

const PRESET_GEM_COLORS = [
  '#c0c0c0', '#c9a84c', '#800080', '#0288d1', '#7fffd4',
  '#c62828', '#2e7d32', '#ff6a00', '#cc44ff', '#ffcc02',
];

function ColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-7 h-7 rounded-full border-2 transition-all ${
        selected ? 'border-gold scale-110 shadow-[0_0_8px_rgba(201,168,76,0.5)]' : 'border-transparent hover:border-gold/40'
      }`}
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

function ColorRow({ label, colors, value, onChange }: {
  label: string;
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  const labelClasses = 'font-heading text-xs uppercase tracking-wider text-gold-muted';
  return (
    <div className="flex flex-col gap-2">
      <label className={labelClasses}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((c) => (
          <ColorSwatch key={c} color={c} selected={value === c} onClick={() => onChange(c)} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[0.6rem] text-cream-dark/40 font-heading uppercase">Custom:</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-gold/20 cursor-pointer bg-transparent"
        />
      </div>
    </div>
  );
}

export function ModelStep() {
  const character = useCharacterStore((s) => s.character);
  const setPortraitSettings = useCharacterStore((s) => s.setPortraitSettings);

  const ancestryId = character.ancestryId;
  const modelAncestry = ancestryId === 'revenant'
    ? (character.formerLifeAncestryId ?? 'revenant')
    : ancestryId;
  const isRevenant = ancestryId === 'revenant';
  const mappedId = modelAncestry ? (ANCESTRY_ID_MAP[modelAncestry] || modelAncestry) : '';
  const defaults = ANCESTRY_DEFAULTS[mappedId] || ANCESTRY_DEFAULTS.human;

  const level = character.level || 1;
  const tier = getTier(level);

  // Available weapons from kit
  const kitId = character.classChoice?.kitId;
  const availableWeapons = kitId ? getAvailableWeapons(kitId) : [];
  const armorClass = kitId ? getKitArmorClass(kitId) : 'none';

  // Current or default settings
  const settings: PortraitSettings = character.portraitSettings ?? {
    hairStyle: 'short',
    hairColor: '#4a2f1a',
    clothingColor: '#c62828',
    armorColor: defaults.armor,
    skinColor: defaults.skin,
    accentColor: defaults.accent,
    gemColor: defaults.gem,
  };

  const update = (partial: Partial<PortraitSettings>) => {
    setPortraitSettings({ ...settings, ...partial });
  };

  const labelClasses = 'font-heading text-xs uppercase tracking-wider text-gold-muted';

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Character Model</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          Customize your hero's appearance. This model will appear on your character sheet.
        </p>
      </div>

      {/* Tier Badge */}
      {ancestryId && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border border-gold/15 bg-surface-light/30">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
            <span className="font-heading text-xs uppercase tracking-wider text-gold-muted">
              {tier.name}
            </span>
            {tier.runes && <span className="text-[0.55rem] text-gold-muted/60">Runes</span>}
            {tier.wings && <span className="text-[0.55rem] text-gold-muted/60">Wings</span>}
            {tier.particles && <span className="text-[0.55rem] text-gold-muted/60">Particles</span>}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center max-w-4xl mx-auto w-full">
        {/* Model Preview */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          <div className="relative bg-gradient-to-b from-surface-light/50 to-surface/30 rounded-2xl border border-gold/10 p-6">
            <CharacterPortrait character={character} size={220} />
          </div>
          {!ancestryId && (
            <p className="text-cream-dark/40 font-body text-sm">Select an ancestry first to see your model.</p>
          )}
          {ancestryId && (
            <button
              type="button"
              onClick={() => exportModelImage(character)}
              className="mt-2 px-4 py-2 rounded-2xl border border-gold/30 font-heading text-xs uppercase tracking-wider text-gold-muted hover:text-gold hover:border-gold/60 transition-all"
            >
              Export Model Image
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col gap-6 min-w-[280px]">
          {/* Weapon Selection */}
          {availableWeapons.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Weapon</label>
              <select
                value={settings.weaponId || ''}
                onChange={(e) => update({ weaponId: e.target.value || undefined })}
                className="bg-surface border border-gold/20 rounded-xl px-3 py-2 font-body text-sm text-cream-dark/80 focus:border-gold/50 focus:outline-none"
              >
                <option value="">Default</option>
                {availableWeapons.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Skin Color */}
          {!isRevenant && (
            <ColorRow
              label="Skin Color"
              colors={PRESET_SKIN_COLORS}
              value={settings.skinColor || defaults.skin}
              onChange={(c) => update({ skinColor: c })}
            />
          )}

          {/* Armor Color */}
          <ColorRow
            label={`Armor Color${armorClass !== 'none' ? ` (${armorClass})` : ''}`}
            colors={PRESET_ARMOR_COLORS}
            value={settings.armorColor || tier.color}
            onChange={(c) => update({ armorColor: c })}
          />

          {/* Accent Color */}
          {!isRevenant && (
            <ColorRow
              label="Accent Color"
              colors={PRESET_ACCENT_COLORS}
              value={settings.accentColor || defaults.accent}
              onChange={(c) => update({ accentColor: c })}
            />
          )}

          {/* Gem Color */}
          {!isRevenant && (
            <ColorRow
              label="Gem Color"
              colors={PRESET_GEM_COLORS}
              value={settings.gemColor || defaults.gem}
              onChange={(c) => update({ gemColor: c })}
            />
          )}

          {/* Info for revenant */}
          {isRevenant && (
            <div className="rounded-2xl border border-gold/10 bg-surface-light/30 p-4">
              <p className="font-body text-sm text-cream-dark/60">
                Revenant models use a spectral teal palette. Color customization
                applies to living versions of your character.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
