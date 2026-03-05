import type { ResolvedAbility } from '../../engine/ability-resolver';

interface BattleCardProps {
  ability: ResolvedAbility;
}

export function BattleCard({ ability }: BattleCardProps) {
  const hasPowerRoll = ability.powerRoll && ability.tier1;
  const isSignature = ability.cost === 'Signature';

  return (
    <div className="card rounded-lg flex flex-col gap-0 overflow-hidden">
      {/* Header: Name + Cost badge */}
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
        <h3 className="font-heading text-base text-gold tracking-wide leading-tight">
          {ability.name}
        </h3>
        <span
          className={[
            'shrink-0 px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold tracking-wider uppercase whitespace-nowrap',
            isSignature
              ? 'bg-gold/20 text-gold border border-gold/30'
              : 'bg-crimson/20 text-crimson border border-crimson/30',
          ].join(' ')}
        >
          {ability.cost}
        </span>
      </div>

      {/* Type + Keywords */}
      <div className="px-4 pb-2 flex flex-col gap-1.5">
        <div className="font-body text-xs text-cream-dark/80">
          <strong className="text-gold-muted">Type:</strong> {ability.type}
        </div>
        {ability.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ability.keywords.map((kw) => (
              <span
                key={kw}
                className="badge"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="divider mx-4" />

      {/* Distance + Target */}
      <div className="px-4 py-2 flex flex-wrap gap-x-6 gap-y-1 text-xs font-body text-cream-dark/80">
        <span>
          <strong className="text-gold-muted">Distance:</strong>{' '}
          {ability.distance}
        </span>
        <span>
          <strong className="text-gold-muted">Target:</strong>{' '}
          {ability.target}
        </span>
      </div>

      {/* Power Roll + Tiers */}
      {hasPowerRoll && (
        <>
          <div className="divider mx-4" />
          <div className="mx-4 my-2 rounded-md bg-surface/60 border border-gold-dark/10 overflow-hidden">
            {/* Power roll header */}
            <div className="px-3 py-1.5 bg-surface-lighter/60 border-b border-gold-dark/10">
              <span className="font-heading text-xs text-gold-muted uppercase tracking-wider">
                {ability.powerRoll}
              </span>
            </div>

            {/* Tier results */}
            <div className="flex flex-col divide-y divide-gold-dark/10">
              {/* Tier 1 (11-) */}
              <div className="flex items-center gap-2.5 px-3 py-1.5">
                <span className="shrink-0 w-8 text-center py-0.5 rounded bg-surface-lighter text-cream-dark/50 text-[10px] font-heading font-bold tracking-wide">
                  11-
                </span>
                <span className="font-body text-xs text-cream-dark/60">
                  {ability.tier1}
                </span>
              </div>

              {/* Tier 2 (12-16) */}
              <div className="flex items-center gap-2.5 px-3 py-1.5">
                <span className="shrink-0 w-8 text-center py-0.5 rounded bg-surface-lighter text-cream-dark/70 text-[10px] font-heading font-bold tracking-wide">
                  12+
                </span>
                <span className="font-body text-xs text-cream-dark/80">
                  {ability.tier2}
                </span>
              </div>

              {/* Tier 3 (17+) */}
              <div className="flex items-center gap-2.5 px-3 py-1.5">
                <span className="shrink-0 w-8 text-center py-0.5 rounded bg-gold/15 text-gold-light text-[10px] font-heading font-bold tracking-wide">
                  17+
                </span>
                <span className="font-body text-xs text-gold-light">
                  {ability.tier3}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Effect */}
      {ability.effect && (
        <>
          <div className="divider mx-4" />
          <div className="px-4 py-2">
            <span className="font-heading text-[10px] text-gold-muted uppercase tracking-wider">
              Effect
            </span>
            <p className="font-body text-xs text-cream-dark/70 leading-relaxed mt-0.5">
              {ability.effect}
            </p>
          </div>
        </>
      )}

      {/* Flavor */}
      {ability.flavor && (
        <div className="px-4 pb-3 pt-1">
          <p className="font-body text-[11px] text-cream-dark/40 italic leading-relaxed">
            {ability.flavor}
          </p>
        </div>
      )}
    </div>
  );
}
