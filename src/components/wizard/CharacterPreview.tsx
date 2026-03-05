import { useCharacterStore } from '../../stores/character-store';
import { computeAllStats } from '../../engine/stat-calculator';
import { getComplicationStatBonuses } from '../../engine/complication-stats';
import { CharacterPortrait } from '../portrait/CharacterPortrait';

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <span className="font-heading text-[0.6rem] uppercase tracking-wider text-gold-muted">{label}</span>
      <span className="font-body text-xs text-cream truncate text-right">
        {value || <span className="text-cream-dark/30">--</span>}
      </span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted">{label}</span>
      <span className="font-heading text-sm font-bold text-gold-light">
        {value ?? <span className="text-cream-dark/30">--</span>}
      </span>
    </div>
  );
}

function formatId(id: string): string {
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

export function CharacterPreview() {
  const character = useCharacterStore((s) => s.character);

  const stats = computeAllStats({
    level: character.level,
    ancestryId: character.ancestryId,
    formerLifeAncestryId: character.formerLifeAncestryId,
    classId: character.classChoice?.classId ?? null,
    kitId: character.classChoice?.kitId ?? null,
    selectedTraits: character.selectedTraits,
    complicationBonuses: getComplicationStatBonuses(character.complication, character.level),
  });

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Character Portrait */}
      <div className="flex justify-center">
        <CharacterPortrait character={character} size={120} />
      </div>

      <div className="text-center">
        <p className="font-display text-sm text-gold-light tracking-wider">
          {character.name || 'New Hero'}
        </p>
        <p className="font-heading text-[0.55rem] uppercase tracking-widest text-gold-muted mt-0.5">
          Level {character.level}
          {character.level > 1 && (
            <span className="ml-1 text-cream-dark/50">
              &middot; Echelon {Math.floor((character.level - 1) / 3) + 1}
            </span>
          )}
        </p>
      </div>

      <div className="divider" />

      <div className="flex flex-col">
        <Row label="Ancestry" value={character.ancestryId ? formatId(character.ancestryId) : null} />
        <Row
          label="Culture"
          value={character.culture ? `${formatId(character.culture.environment)} / ${formatId(character.culture.upbringing)}` : null}
        />
        <Row label="Career" value={character.career ? formatId(character.career.careerId) : null} />
        <Row label="Class" value={character.classChoice ? formatId(character.classChoice.classId) : null} />
        <Row label="Subclass" value={character.classChoice?.subclassId ? formatId(character.classChoice.subclassId) : null} />
        {character.classChoice?.kitId && (
          <Row label="Kit" value={formatId(character.classChoice.kitId)} />
        )}
      </div>

      {stats && (
        <>
          <div className="divider" />
          <div className="flex flex-col">
            <StatRow label="Stamina" value={stats.stamina} />
            <StatRow label="Winded" value={stats.winded} />
            <StatRow label="Recovery" value={stats.recoveryValue} />
            <StatRow label="Recoveries" value={stats.recoveries} />
            <StatRow label="Speed" value={stats.speed} />
            <StatRow label="Stability" value={stats.stability} />
          </div>
        </>
      )}

      {character.selectedTraits.length > 0 && (
        <>
          <div className="divider" />
          <div>
            <p className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted mb-1">Traits</p>
            <div className="flex flex-wrap gap-1">
              {character.selectedTraits.map((t, i) => (
                <span key={`${t.name}-${i}`} className="badge text-[0.5rem]">{t.previousLifeTrait || t.name}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
