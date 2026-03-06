import { useCharacterStore } from '../../stores/character-store';
import { getCharacterSkills } from '../../engine/skill-mapper';
import { CharacterPortrait } from '../portrait/CharacterPortrait';
import { CLASS_RESOURCES } from '../../types/character';
import classFeaturesData from '../../data/class-features.json';

interface ClassFeature {
  name: string;
  type: string;
  description: string;
  level: number;
  subclass_effects?: Record<string, string>;
}
interface ClassFeaturesEntry {
  resource_name: string;
  resource_generation: string[];
  features: ClassFeature[];
}
const classFeatures = (classFeaturesData as { classes: Record<string, ClassFeaturesEntry> }).classes;

function formatId(id: string): string {
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card px-4 py-3">
      <h3 className="font-heading text-xs uppercase tracking-wider text-gold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex justify-between items-baseline py-1 border-b border-gold/5 last:border-b-0">
      <span className="font-heading text-[0.65rem] uppercase tracking-wider text-gold-muted">{label}</span>
      <span className="font-body text-sm text-cream">{value}</span>
    </div>
  );
}

export function PlaySheet() {
  const character = useCharacterStore((s) => s.character);
  const stats = character.computedStats;
  const classChoice = character.classChoice;
  const allSkills = getCharacterSkills(character);

  // Aggregate languages
  const langs = new Set(['Caelian']);
  if (character.culture?.language) langs.add(character.culture.language);
  character.career?.languages?.filter(Boolean).forEach((l) => langs.add(l));
  character.complication?.languages?.filter(Boolean).forEach((l) => langs.add(l));
  const forgotten = character.complication?.forgottenLanguage;
  if (forgotten) langs.delete(forgotten);

  const resourceName = classChoice ? CLASS_RESOURCES[classChoice.classId] ?? 'Resource' : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Identity */}
      <div className="card px-4 py-4 flex flex-col items-center text-center">
        <CharacterPortrait character={character} size={140} />
        <h2 className="font-display text-xl text-gold-light tracking-wider mt-2">
          {character.name || 'Unnamed Hero'}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span className="badge">Level {character.level}</span>
          {character.ancestryId && (
            <span className="badge">{formatId(character.ancestryId)}</span>
          )}
          {classChoice?.classId && (
            <span className="badge badge-accent">{formatId(classChoice.classId)}</span>
          )}
          {classChoice?.subclassId && (
            <span className="badge">{formatId(classChoice.subclassId)}</span>
          )}
        </div>
        {(character.appearance || character.backstory) && (
          <div className="border-t border-gold/8 pt-2 mt-3 w-full text-left">
            {character.appearance && (
              <p className="font-body text-xs text-cream-dark/60 italic">{character.appearance}</p>
            )}
            {character.backstory && (
              <p className="font-body text-xs text-cream-dark/50 mt-1">{character.backstory}</p>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Stamina', value: stats.stamina },
            { label: 'Winded', value: stats.winded },
            { label: 'Recovery', value: stats.recoveryValue },
            { label: 'Recoveries', value: stats.recoveries },
            { label: 'Speed', value: stats.speed },
            { label: 'Stability', value: stats.stability },
            { label: 'Size', value: stats.size },
            { label: 'Echelon', value: stats.echelon },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5 rounded-xl bg-surface-light/30 border border-gold/5 py-2">
              <span className="font-heading text-base font-bold text-gold-light">{s.value}</span>
              <span className="font-heading text-[0.5rem] uppercase tracking-wider text-gold-muted">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Characteristics */}
      {classChoice?.characteristics && (
        <Section title="Characteristics">
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(classChoice.characteristics).map(([key, val]) => (
              <div key={key} className="flex flex-col items-center gap-0.5">
                <span className="font-heading text-lg font-bold text-gold-light">
                  {val >= 0 ? `+${val}` : val}
                </span>
                <span className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted">
                  {key}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Class & Kit */}
      {classChoice && (
        <Section title="Class">
          <Row label="Class" value={formatId(classChoice.classId)} />
          <Row label="Subclass" value={classChoice.subclassId ? formatId(classChoice.subclassId) : null} />
          {resourceName && <Row label="Resource" value={resourceName} />}
          <Row label="Signature" value={classChoice.signatureAbilityName} />
          {classChoice.heroicAbilities.length > 0 && (
            <Row label="Heroic" value={classChoice.heroicAbilities.join(', ')} />
          )}
          <Row label="Kit" value={classChoice.kitId ? formatId(classChoice.kitId) : null} />
          {classChoice.subclassSkill && <Row label="Subclass Skill" value={classChoice.subclassSkill} />}
        </Section>
      )}

      {/* Class Features */}
      {classChoice?.classId && classFeatures[classChoice.classId] && (() => {
        const cf = classFeatures[classChoice.classId];
        const features = cf.features.filter((f) => f.level <= character.level);
        return (
          <Section title="Class Features">
            <div className="mb-1.5">
              <span className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted">
                {cf.resource_name} Generation
              </span>
              <ul className="mt-0.5 flex flex-col gap-0.5">
                {cf.resource_generation.map((rule, i) => (
                  <li key={i} className="font-body text-[0.55rem] text-cream-dark/60 pl-1.5 border-l border-gold/10">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            {features.map((f) => {
              const subMatch = f.subclass_effects && classChoice.subclassId
                ? Object.entries(f.subclass_effects).find(
                    ([key]) => key.toLowerCase() === classChoice.subclassId.toLowerCase(),
                  )
                : null;
              return (
                <div key={f.name} className="py-1 border-b border-gold/5 last:border-b-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading text-[0.65rem] text-gold-light">{f.name}</span>
                    <span className="text-[0.5rem] font-heading uppercase tracking-wider text-cream-dark/30">
                      {f.type}
                    </span>
                  </div>
                  <p className="font-body text-[0.55rem] text-cream-dark/50 mt-0.5 leading-relaxed">{f.description}</p>
                  {subMatch && (
                    <p className="font-body text-[0.55rem] text-gold-muted/70 mt-0.5 pl-1.5 border-l border-gold/10">
                      {subMatch[0]}: {subMatch[1]}
                    </p>
                  )}
                </div>
              );
            })}
          </Section>
        );
      })()}

      {/* Ancestry & Traits */}
      <Section title="Ancestry">
        <Row label="Ancestry" value={character.ancestryId ? formatId(character.ancestryId) : null} />
        {character.ancestryId === 'revenant' && character.formerLifeAncestryId && (
          <Row label="Former Life" value={formatId(character.formerLifeAncestryId)} />
        )}
        {character.selectedTraits.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {character.selectedTraits.map((t, i) => (
              <span key={`${t.name}-${i}`} className="badge text-[0.55rem]">
                {t.previousLifeTrait || t.name}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* Culture */}
      {character.culture && (
        <Section title="Culture">
          <Row label="Environment" value={formatId(character.culture.environment)} />
          <Row label="Organization" value={formatId(character.culture.organization)} />
          <Row label="Upbringing" value={formatId(character.culture.upbringing)} />
          <Row label="Language" value={character.culture.language} />
        </Section>
      )}

      {/* Career */}
      {character.career && (
        <Section title="Career">
          <Row label="Career" value={formatId(character.career.careerId)} />
          <Row label="Perk" value={character.career.perkName} />
        </Section>
      )}

      {/* Complication */}
      {character.complication && (
        <Section title="Complication">
          <Row label="Name" value={character.complication.name} />
        </Section>
      )}

      {/* Skills */}
      {allSkills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1">
            {allSkills.sort().map((s) => (
              <span key={s} className="badge text-[0.55rem]">{s}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Languages */}
      {langs.size > 0 && (
        <Section title="Languages">
          <div className="flex flex-wrap gap-1">
            {[...langs].map((l) => (
              <span key={l} className="badge text-[0.55rem]">{l}</span>
            ))}
          </div>
          {forgotten && (
            <p className="font-body text-[0.6rem] text-crimson/70 italic mt-1">
              Forgotten: {forgotten}
            </p>
          )}
        </Section>
      )}
    </div>
  );
}
