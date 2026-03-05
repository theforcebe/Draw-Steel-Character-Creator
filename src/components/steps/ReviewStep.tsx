import { useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import { exportCharacterPdf, exportAbilityCardsPdf } from '../../engine/pdf-exporter';
import { exportCombatReferencePdf } from '../../engine/combat-reference-pdf';
import { BattleCardsView } from '../battle/BattleCardsView';
import { getCharacterSkills } from '../../engine/skill-mapper';
import { saveCharacter } from '../../engine/character-storage';
import { CharacterPortrait } from '../portrait/CharacterPortrait';
import type { CharacterData } from '../../types/character';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-sm uppercase tracking-wider text-gold mb-2">
      {children}
    </h3>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-gold/10 last:border-b-0">
      <span className="font-heading text-xs uppercase tracking-wider text-gold-muted">{label}</span>
      <span className="font-body text-sm text-cream font-medium">{value ?? '--'}</span>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-surface-light border border-gold-dark/40">
      <span className="font-heading text-lg font-bold text-gold-light">
        {value !== undefined ? value : '--'}
      </span>
      <span className="font-heading text-[0.6rem] uppercase tracking-wider text-gold/60">
        {label}
      </span>
    </div>
  );
}

function formatId(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function ExportButtons({ character }: { character: CharacterData }) {
  const [exporting, setExporting] = useState(false);
  const [exportingCards, setExportingCards] = useState(false);
  const [exportingRef, setExportingRef] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleExportSheet() {
    setExporting(true);
    try {
      await exportCharacterPdf(character);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  }

  async function handleExportCards() {
    setExportingCards(true);
    try {
      await exportAbilityCardsPdf(character);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExportingCards(false);
    }
  }

  async function handleExportCombatRef() {
    setExportingRef(true);
    try {
      await exportCombatReferencePdf();
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExportingRef(false);
    }
  }

  function handleSave() {
    saveCharacter(character);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-4 pb-8">
      <button
        type="button"
        className="btn-primary text-lg px-10 py-4"
        onClick={handleSave}
      >
        {saved ? 'Saved!' : 'Save Character'}
      </button>
      <div className="divider w-48 my-2" />
      <button
        type="button"
        className="btn-primary text-lg px-10 py-4"
        disabled={exporting}
        onClick={handleExportSheet}
      >
        {exporting ? 'Exporting...' : 'Export Character Sheet'}
      </button>
      <button
        type="button"
        className="btn-primary text-lg px-10 py-4"
        disabled={exportingCards}
        onClick={handleExportCards}
      >
        {exportingCards ? 'Exporting...' : 'Export Ability Cards'}
      </button>
      <div className="divider w-48 my-2" />
      <button
        type="button"
        className="btn-secondary text-sm px-8 py-3"
        disabled={exportingRef}
        onClick={handleExportCombatRef}
      >
        {exportingRef ? 'Exporting...' : 'Download Combat Reference'}
      </button>
    </div>
  );
}

export function ReviewStep() {
  const character = useCharacterStore((s) => s.character);
  const [activeTab, setActiveTab] = useState<'overview' | 'battleCards'>('overview');

  const ancestryLabel = character.ancestryId ? formatId(character.ancestryId) : null;

  const cultureEnv = character.culture?.environment ? formatId(character.culture.environment) : null;
  const cultureOrg = character.culture?.organization ? formatId(character.culture.organization) : null;
  const cultureUp = character.culture?.upbringing ? formatId(character.culture.upbringing) : null;

  const careerLabel = character.career?.careerId ? formatId(character.career.careerId) : null;

  const classLabel = character.classChoice?.classId ? formatId(character.classChoice.classId) : null;
  const subclassLabel = character.classChoice?.subclassId
    ? formatId(character.classChoice.subclassId)
    : null;

  const traits = character.selectedTraits;
  const stats = character.computedStats;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Review Your Hero</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          Review your choices before finalizing your character.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex justify-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={[
            'px-5 py-2 rounded-t font-heading text-sm tracking-wide transition-all',
            activeTab === 'overview'
              ? 'bg-surface-light text-gold-light border border-gold/20 border-b-0'
              : 'text-gold-muted hover:text-gold',
          ].join(' ')}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('battleCards')}
          className={[
            'px-5 py-2 rounded-t font-heading text-sm tracking-wide transition-all',
            activeTab === 'battleCards'
              ? 'bg-surface-light text-gold-light border border-gold/20 border-b-0'
              : 'text-gold-muted hover:text-gold',
          ].join(' ')}
        >
          Battle Cards
        </button>
      </div>

      {activeTab === 'battleCards' ? (
        <BattleCardsView />
      ) : (
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">
        {/* Hero Identity */}
        <ParchmentCard>
          <div className="flex flex-col items-center mb-3">
            <CharacterPortrait character={character} size={180} />
            <h2 className="font-display text-2xl text-gold-light tracking-wider mt-2">
              {character.name || 'Unnamed Hero'}
            </h2>
            <p className="font-heading text-xs uppercase tracking-widest text-gold-muted mt-1">
              Level {character.level}
            </p>
          </div>
          {(character.appearance || character.backstory) && (
            <div className="border-t border-gold/10 pt-3 mt-3 flex flex-col gap-2">
              {character.appearance && (
                <p className="font-body text-sm text-cream-dark/80 italic leading-relaxed">
                  {character.appearance}
                </p>
              )}
              {character.backstory && (
                <p className="font-body text-sm text-cream-dark/70 leading-relaxed">
                  {character.backstory}
                </p>
              )}
            </div>
          )}
        </ParchmentCard>

        {/* Ancestry & Traits */}
        <ParchmentCard>
          <SectionHeading>Ancestry</SectionHeading>
          <DetailRow label="Ancestry" value={ancestryLabel} />
          {character.ancestryId === 'revenant' && character.formerLifeAncestryId && (
            <DetailRow label="Former Life" value={formatId(character.formerLifeAncestryId)} />
          )}
          {traits.length > 0 && (
            <div className="mt-2">
              <span className="font-heading text-xs uppercase tracking-wider text-gold-muted">
                Traits:{' '}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {traits.map((t, i) => {
                  const extras: string[] = [];
                  if (t.damageType) extras.push(`Damage: ${t.damageType}`);
                  if (t.runeChoice) extras.push(`Rune: ${t.runeChoice}`);
                  if (t.abilityChoice) extras.push(`Ability: ${t.abilityChoice}`);
                  if (t.skillChoices?.length) extras.push(`Skills: ${t.skillChoices.join(', ')}`);
                  // Show the chosen trait name as the display name for Previous Life
                  const displayName = t.previousLifeTrait
                    ? `${t.previousLifeTrait} (via Previous Life)`
                    : t.name;
                  return (
                    <span key={`${t.name}-${i}`} className="font-body text-sm text-cream">
                      {displayName}{t.cost > 0 ? ` (${t.cost}pt)` : ''}
                      {extras.length > 0 && (
                        <span className="text-gold-muted"> — {extras.join(', ')}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </ParchmentCard>

        {/* Culture */}
        <ParchmentCard>
          <SectionHeading>Culture</SectionHeading>
          <DetailRow label="Environment" value={cultureEnv} />
          <DetailRow label="Organization" value={cultureOrg} />
          <DetailRow label="Upbringing" value={cultureUp} />
          {character.culture?.language && (
            <DetailRow label="Language" value={character.culture.language} />
          )}
          {(character.culture?.environmentSkill || character.culture?.organizationSkill || character.culture?.upbringingSkill) && (
            <DetailRow
              label="Culture Skills"
              value={[
                character.culture?.environmentSkill,
                character.culture?.organizationSkill,
                character.culture?.upbringingSkill,
              ].filter(Boolean).join(', ')}
            />
          )}
        </ParchmentCard>

        {/* Career */}
        <ParchmentCard>
          <SectionHeading>Career</SectionHeading>
          <DetailRow label="Career" value={careerLabel} />
          {character.career?.skills && character.career.skills.length > 0 && (
            <DetailRow label="Skills" value={character.career.skills.join(', ')} />
          )}
          {character.career?.languages && character.career.languages.filter(Boolean).length > 0 && (
            <DetailRow label="Languages" value={character.career.languages.filter(Boolean).join(', ')} />
          )}
          {character.career?.perkName && (
            <DetailRow label="Perk" value={character.career.perkName} />
          )}
        </ParchmentCard>

        {/* Class */}
        <ParchmentCard>
          <SectionHeading>Class</SectionHeading>
          <DetailRow label="Class" value={classLabel} />
          <DetailRow label="Subclass" value={subclassLabel} />
          {character.classChoice?.signatureAbilityName && (
            <DetailRow label="Signature Ability" value={character.classChoice.signatureAbilityName} />
          )}
          {character.classChoice?.heroicAbilities && character.classChoice.heroicAbilities.length > 0 && (
            <DetailRow
              label="Heroic Abilities"
              value={character.classChoice.heroicAbilities.join(', ')}
            />
          )}
          {character.classChoice?.kitId && (
            <DetailRow label="Kit" value={formatId(character.classChoice.kitId)} />
          )}
          {character.classChoice?.subclassSkill && (
            <DetailRow label="Subclass Skill" value={character.classChoice.subclassSkill} />
          )}
        </ParchmentCard>

        {/* Complication */}
        {character.complication && (
          <ParchmentCard>
            <SectionHeading>Complication</SectionHeading>
            <DetailRow label="Name" value={character.complication.name} />
            {character.complication.skills.length > 0 && (
              <DetailRow label="Skills" value={character.complication.skills.join(', ')} />
            )}
            {character.complication.languages.filter(Boolean).length > 0 && (
              <DetailRow label="Languages" value={character.complication.languages.filter(Boolean).join(', ')} />
            )}
            {character.complication.forgottenLanguage && (
              <DetailRow label="Forgotten" value={character.complication.forgottenLanguage} />
            )}
          </ParchmentCard>
        )}

        {/* Characteristics */}
        {character.classChoice?.characteristics && (
          <ParchmentCard>
            <SectionHeading>Characteristics</SectionHeading>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {Object.entries(character.classChoice.characteristics).map(([key, val]) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <span className="font-heading text-lg font-bold text-gold-light">
                    {val >= 0 ? `+${val}` : val}
                  </span>
                  <span className="font-heading text-[0.6rem] uppercase tracking-wider text-gold-muted">
                    {key.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </ParchmentCard>
        )}

        {/* Computed Stats */}
        {stats && (
          <ParchmentCard>
            <SectionHeading>Computed Stats</SectionHeading>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
              <StatBadge label="Stamina" value={stats.stamina} />
              <StatBadge label="Winded" value={stats.winded} />
              <StatBadge label="Recovery" value={stats.recoveryValue} />
              <StatBadge label="Speed" value={stats.speed} />
              <StatBadge label="Stability" value={stats.stability} />
              <StatBadge label="Recoveries" value={stats.recoveries} />
            </div>
          </ParchmentCard>
        )}

        {/* Aggregated Skills */}
        {(() => {
          const allSkills = getCharacterSkills(character);
          if (allSkills.length === 0) return null;
          return (
            <ParchmentCard>
              <SectionHeading>All Skills</SectionHeading>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.sort().map((s) => (
                  <span key={s} className="badge text-xs">{s}</span>
                ))}
              </div>
            </ParchmentCard>
          );
        })()}

        {/* Aggregated Languages */}
        {(() => {
          const langs: string[] = ['Caelian'];
          if (character.culture?.language) langs.push(character.culture.language);
          if (character.career?.languages) langs.push(...character.career.languages.filter(Boolean));
          if (character.complication?.languages) langs.push(...character.complication.languages.filter(Boolean));
          const forgotten = character.complication?.forgottenLanguage;
          const filtered = forgotten ? langs.filter((l) => l !== forgotten) : langs;
          const unique = [...new Set(filtered)];
          if (unique.length <= 1) return null;
          return (
            <ParchmentCard>
              <SectionHeading>Languages</SectionHeading>
              <div className="flex flex-wrap gap-1.5">
                {unique.map((l) => (
                  <span key={l} className="badge text-xs">{l}</span>
                ))}
              </div>
              {forgotten && (
                <p className="mt-2 font-body text-xs text-crimson/80 italic">
                  Forgotten: {forgotten}
                </p>
              )}
            </ParchmentCard>
          );
        })()}

        {/* Export Buttons */}
        <ExportButtons character={character} />
      </div>
      )}
    </div>
  );
}
