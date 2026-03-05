import { useCharacterStore } from '../../stores/character-store';
import { CharacterPortrait, buildCharacterSvg } from '../portrait/CharacterPortrait';
import { ANCESTRY_MODELS, KIT_EQUIPMENT, parseArmorWeight } from '../portrait/models';
import type { CharacterData, HairStyle, PortraitSettings } from '../../types/character';

function exportModelImage(character: CharacterData) {
  const svgString = buildCharacterSvg(character);
  if (!svgString) return;

  // Create a canvas and render the SVG to it
  const canvas = document.createElement('canvas');
  const scale = 4; // 4x for high DPI
  const modelId = character.ancestryId === 'revenant'
    ? (character.formerLifeAncestryId ?? 'revenant')
    : character.ancestryId;
  const model = modelId ? ANCESTRY_MODELS[modelId] : null;
  const vw = model?.viewW ?? 80;
  const vh = model?.viewH ?? 145;

  canvas.width = vw * scale;
  canvas.height = vh * scale;
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

const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'long', label: 'Long' },
  { id: 'braided', label: 'Braided' },
  { id: 'mohawk', label: 'Mohawk' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'bald', label: 'Bald' },
];

const PRESET_HAIR_COLORS = [
  '#1a0a00', '#3b1a00', '#5d4037', '#8d6e63', '#b8860b',
  '#c9a84c', '#f5deb3', '#ff4500', '#8b0000', '#2c1a4a',
  '#1b5e20', '#e0e0e0', '#f5f5f5',
];

const PRESET_CLOTHING_COLORS = [
  '#c62828', '#ad1457', '#6a1b9a', '#283593', '#1565c0',
  '#00838f', '#2e7d32', '#558b2f', '#f57f17', '#e65100',
  '#4e342e', '#37474f', '#212121', '#757575', '#c9a84c',
];

const PRESET_ARMOR_COLORS = [
  '#9e9e9e', '#757575', '#424242', '#212121',
  '#c9a84c', '#b8860b', '#8b4513', '#cd7f32',
  '#1565c0', '#c62828', '#2e7d32', '#4a148c',
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

export function ModelStep() {
  const character = useCharacterStore((s) => s.character);
  const setPortraitSettings = useCharacterStore((s) => s.setPortraitSettings);

  const ancestryId = character.ancestryId;
  const modelId = ancestryId === 'revenant'
    ? (character.formerLifeAncestryId ?? 'revenant')
    : ancestryId;

  const model = modelId ? ANCESTRY_MODELS[modelId] : null;
  const isRevenant = ancestryId === 'revenant';

  // Get current or default settings
  const settings: PortraitSettings = character.portraitSettings ?? {
    hairStyle: 'short',
    hairColor: model?.defaultHairColor ?? '#4a2f1a',
    clothingColor: model?.defaultClothingColor ?? '#c62828',
    armorColor: '#757575',
  };

  const update = (partial: Partial<PortraitSettings>) => {
    setPortraitSettings({ ...settings, ...partial });
  };

  // Does this ancestry have customizable hair?
  const showHair = model?.hasHair && !isRevenant;

  // Does the kit have armor?
  const kitId = character.classChoice?.kitId;
  const kit = kitId ? KIT_EQUIPMENT[kitId] : null;
  const armorWeight = kit ? parseArmorWeight(kit.armor) : 'none';
  const showArmor = armorWeight !== 'none';

  const labelClasses = 'font-heading text-xs uppercase tracking-wider text-gold-muted';

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Character Model</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          Customize your hero's appearance. This model will appear on your character sheet.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-4xl mx-auto w-full">
        {/* Model Preview */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4">
          <div className="relative bg-gradient-to-b from-surface-light/50 to-surface/30 rounded-xl border border-gold/10 p-6">
            <CharacterPortrait character={character} size={220} />
          </div>
          {!ancestryId && (
            <p className="text-cream-dark/40 font-body text-sm">Select an ancestry first to see your model.</p>
          )}
          {ancestryId && (
            <button
              type="button"
              onClick={() => exportModelImage(character)}
              className="mt-2 px-4 py-2 rounded-lg border border-gold/30 font-heading text-xs uppercase tracking-wider text-gold-muted hover:text-gold hover:border-gold/60 transition-all"
            >
              Export Model Image
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col gap-6 min-w-[280px]">
          {/* Clothing Color */}
          {!isRevenant && (
            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Clothing Color</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CLOTHING_COLORS.map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    selected={settings.clothingColor === c}
                    onClick={() => update({ clothingColor: c })}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[0.6rem] text-cream-dark/40 font-heading uppercase">Custom:</span>
                <input
                  type="color"
                  value={settings.clothingColor}
                  onChange={(e) => update({ clothingColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gold/20 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          )}

          {/* Armor Color */}
          {showArmor && (
            <div className="flex flex-col gap-2">
              <label className={labelClasses}>
                Armor Color
                <span className="ml-2 text-cream-dark/40 normal-case tracking-normal">
                  ({armorWeight} armor)
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ARMOR_COLORS.map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    selected={settings.armorColor === c}
                    onClick={() => update({ armorColor: c })}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[0.6rem] text-cream-dark/40 font-heading uppercase">Custom:</span>
                <input
                  type="color"
                  value={settings.armorColor}
                  onChange={(e) => update({ armorColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gold/20 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          )}

          {/* Hair Style */}
          {showHair && (
            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Hair Style</label>
              <div className="flex flex-wrap gap-2">
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => update({ hairStyle: h.id })}
                    className={`px-3 py-1.5 rounded-lg font-heading text-xs uppercase tracking-wider border transition-all ${
                      settings.hairStyle === h.id
                        ? 'border-gold bg-gold/10 text-gold-light'
                        : 'border-gold/15 text-cream-dark/50 hover:border-gold/30 hover:text-cream-dark/70'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hair Color */}
          {showHair && settings.hairStyle !== 'bald' && (
            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Hair Color</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HAIR_COLORS.map((c) => (
                  <ColorSwatch
                    key={c}
                    color={c}
                    selected={settings.hairColor === c}
                    onClick={() => update({ hairColor: c })}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[0.6rem] text-cream-dark/40 font-heading uppercase">Custom:</span>
                <input
                  type="color"
                  value={settings.hairColor}
                  onChange={(e) => update({ hairColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gold/20 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          )}

          {/* Info for revenant */}
          {isRevenant && (
            <div className="rounded-lg border border-gold/10 bg-surface-light/30 p-4">
              <p className="font-body text-sm text-cream-dark/60">
                Revenant models use a spectral green palette. Clothing and hair customization
                applies to living versions of your character.
              </p>
            </div>
          )}

          {/* Info for no-hair ancestries */}
          {!showHair && !isRevenant && model && (
            <div className="rounded-lg border border-gold/10 bg-surface-light/30 p-3">
              <p className="font-body text-xs text-cream-dark/40">
                {modelId === 'dragonKnight' && 'Dragon Knights have natural scale crests instead of hair.'}
                {modelId === 'memonek' && 'Memonek are crystalline beings with no natural hair.'}
                {modelId === 'timeRaider' && 'Time Raiders have insectoid carapaces rather than hair.'}
                {modelId === 'devil' && 'Devil horns and features are part of their natural form.'}
                {modelId === 'orc' && 'Orc war paint and features are fixed to their model.'}
                {modelId === 'polder' && 'Polder wear traditional hats as part of their look.'}
                {modelId === 'hakaan' && 'Hakaan ritual markings are part of their cultural identity.'}
                {modelId === 'revenant' && 'The Revenant form shows the skeletal undead state.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
