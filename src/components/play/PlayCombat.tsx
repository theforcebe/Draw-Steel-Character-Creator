import { useCharacterStore } from '../../stores/character-store';
import { usePlayStore } from '../../stores/play-store';
import {
  CONDITIONS,
  CONDITION_DESCRIPTIONS,
  CLASS_RESOURCES,
} from '../../types/character';
import type { Condition } from '../../types/character';

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-surface-light/50 border border-gold/8">
      <span className="font-heading text-lg font-bold text-gold-light">{value}</span>
      <span className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted">
        {label}
      </span>
    </div>
  );
}

function AdjustButton({
  onClick,
  children,
  variant = 'default',
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'heal' | 'damage';
  disabled?: boolean;
}) {
  const colorClasses =
    variant === 'heal'
      ? 'text-green-400 border-green-400/20 hover:bg-green-400/10 active:bg-green-400/20'
      : variant === 'damage'
        ? 'text-crimson border-crimson/20 hover:bg-crimson/10 active:bg-crimson/20'
        : 'text-gold-light border-gold/20 hover:bg-gold/10 active:bg-gold/20';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border font-heading text-lg font-bold transition-all ${colorClasses} disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export function PlayCombat() {
  const character = useCharacterStore((s) => s.character);
  const playStore = usePlayStore();
  const playState = playStore.getActiveState();

  if (!playState) return null;

  const classId = character.classChoice?.classId ?? '';
  const resourceName = CLASS_RESOURCES[classId] ?? 'Resource';
  const stats = character.computedStats;
  const characteristics = character.classChoice?.characteristics;

  const staminaPercent = playState.maxStamina > 0
    ? (playState.currentStamina / playState.maxStamina) * 100
    : 0;
  const isWinded = playState.currentStamina <= Math.floor(playState.maxStamina / 2);
  const isDying = playState.currentStamina === 0;
  const remainingRecoveries = playState.maxRecoveries - playState.usedRecoveries;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Stamina Section ── */}
      <div className="card px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-sm uppercase tracking-wider text-gold">Stamina</h3>
          {isDying && (
            <span className="badge badge-accent animate-pulse">Dying</span>
          )}
          {!isDying && isWinded && (
            <span className="badge badge-accent">Winded</span>
          )}
        </div>

        {/* Stamina Bar */}
        <div className="relative h-10 rounded-xl bg-surface/80 border border-gold/10 overflow-hidden">
          {/* Winded threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-px bg-gold/30 z-10"
            style={{ left: '50%' }}
          />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -top-0 z-10 font-heading text-[0.5rem] text-gold/40 uppercase tracking-wider"
            style={{ top: '1px' }}
          >
            winded
          </div>

          {/* Health fill */}
          <div
            className="absolute inset-y-0 left-0 transition-all duration-300 rounded-xl"
            style={{
              width: `${staminaPercent}%`,
              background: isWinded
                ? 'linear-gradient(90deg, #8b1a25, #c42b3a)'
                : 'linear-gradient(90deg, #2e7d32, #4caf50)',
            }}
          />

          {/* Temporary stamina overlay */}
          {playState.temporaryStamina > 0 && (
            <div
              className="absolute inset-y-0 transition-all duration-300 rounded-r-xl opacity-60"
              style={{
                left: `${staminaPercent}%`,
                width: `${Math.min(
                  (playState.temporaryStamina / playState.maxStamina) * 100,
                  100 - staminaPercent,
                )}%`,
                background: 'linear-gradient(90deg, #1565c0, #42a5f5)',
              }}
            />
          )}

          {/* Value display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-base font-bold text-white drop-shadow-lg">
              {playState.currentStamina}
              {playState.temporaryStamina > 0 && (
                <span className="text-blue-300 text-sm"> +{playState.temporaryStamina}</span>
              )}
              <span className="text-cream-dark/60 text-sm"> / {playState.maxStamina}</span>
            </span>
          </div>
        </div>

        {/* Stamina Controls */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <AdjustButton onClick={() => playStore.adjustStamina(-5)} variant="damage">-5</AdjustButton>
          <AdjustButton onClick={() => playStore.adjustStamina(-1)} variant="damage">-1</AdjustButton>
          <AdjustButton onClick={() => playStore.adjustStamina(1)} variant="heal">+1</AdjustButton>
          <AdjustButton onClick={() => playStore.adjustStamina(5)} variant="heal">+5</AdjustButton>
        </div>

        {/* Temporary Stamina */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/8">
          <span className="font-heading text-xs uppercase tracking-wider text-gold-muted">
            Temp Stamina
          </span>
          <div className="flex items-center gap-2">
            <AdjustButton onClick={() => playStore.adjustTemporaryStamina(-1)} variant="damage">-</AdjustButton>
            <span className="font-heading text-base font-bold text-blue-300 w-8 text-center">
              {playState.temporaryStamina}
            </span>
            <AdjustButton onClick={() => playStore.adjustTemporaryStamina(1)} variant="heal">+</AdjustButton>
          </div>
        </div>
      </div>

      {/* ── Recoveries & Resource Row ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Recoveries */}
        <div className="card px-4 py-3">
          <h3 className="font-heading text-xs uppercase tracking-wider text-gold mb-2">
            Recoveries
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-heading text-2xl font-bold text-gold-light">
                {remainingRecoveries}
              </span>
              <span className="font-heading text-sm text-gold-muted">
                /{playState.maxRecoveries}
              </span>
            </div>
            <button
              type="button"
              onClick={() => playStore.useRecovery()}
              disabled={remainingRecoveries <= 0}
              className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 font-heading text-xs uppercase tracking-wider text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Recover
            </button>
          </div>
          <p className="font-body text-[0.65rem] text-cream-dark/40 mt-1">
            +{playState.recoveryValue} stamina per recovery
          </p>
        </div>

        {/* Heroic Resource */}
        <div className="card px-4 py-3">
          <h3 className="font-heading text-xs uppercase tracking-wider text-gold mb-2">
            {resourceName}
          </h3>
          <div className="flex items-center justify-between">
            <span className="font-heading text-2xl font-bold text-gold-light">
              {playState.heroicResource}
            </span>
            <div className="flex items-center gap-1.5">
              <AdjustButton onClick={() => playStore.adjustResource(-1)}>-</AdjustButton>
              <AdjustButton onClick={() => playStore.adjustResource(1)}>+</AdjustButton>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <StatBox label="Speed" value={stats?.speed ?? 5} />
        <StatBox label="Stability" value={stats?.stability ?? 0} />
        <StatBox label="Size" value={stats?.size ?? '1M'} />
        {characteristics && (
          <>
            <div className="col-span-3 sm:col-span-2 grid grid-cols-5 gap-2 mt-1 sm:mt-0">
              {Object.entries(characteristics).map(([key, val]) => (
                <div key={key} className="flex flex-col items-center gap-0.5 rounded-xl bg-surface-light/30 border border-gold/5 py-1.5">
                  <span className="font-heading text-sm font-bold text-gold-light">
                    {val >= 0 ? `+${val}` : val}
                  </span>
                  <span className="font-heading text-[0.5rem] uppercase tracking-wider text-gold-muted">
                    {key.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Surges ── */}
      <div className="card px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-xs uppercase tracking-wider text-gold">Surges</h3>
            <p className="font-body text-[0.65rem] text-cream-dark/40 mt-0.5">
              Spend up to 3 per turn for +damage or +potency
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AdjustButton onClick={() => playStore.adjustSurges(-1)}>-</AdjustButton>
            <span className="font-heading text-xl font-bold text-gold-light w-8 text-center">
              {playState.surges}
            </span>
            <AdjustButton onClick={() => playStore.adjustSurges(1)}>+</AdjustButton>
          </div>
        </div>
      </div>

      {/* ── Conditions ── */}
      <div className="card px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-xs uppercase tracking-wider text-gold">Conditions</h3>
          {playState.activeConditions.length > 0 && (
            <button
              type="button"
              onClick={() => playStore.clearConditions()}
              className="font-heading text-[0.55rem] uppercase tracking-wider text-crimson hover:text-crimson/80 transition-all"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {CONDITIONS.map((condition) => {
            const isActive = playState.activeConditions.includes(condition);
            return (
              <button
                key={condition}
                type="button"
                onClick={() => playStore.toggleCondition(condition as Condition)}
                className={[
                  'flex flex-col items-center gap-1 px-2 py-2 rounded-xl border transition-all text-center',
                  isActive
                    ? 'border-crimson/40 bg-crimson/10 text-crimson shadow-[0_0_12px_rgba(196,43,58,0.15)]'
                    : 'border-gold/8 bg-surface-light/30 text-cream-dark/40 hover:border-gold/20 hover:text-cream-dark/60',
                ].join(' ')}
                title={CONDITION_DESCRIPTIONS[condition as Condition]}
              >
                <span className="font-heading text-[0.6rem] uppercase tracking-wider leading-tight">
                  {condition}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Rest Actions ── */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => playStore.catchBreath()}
          disabled={remainingRecoveries <= 0}
          className="flex-1 card px-4 py-3 text-center hover:border-gold/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="font-heading text-xs uppercase tracking-wider text-gold-light">
            Catch Breath
          </span>
          <p className="font-body text-[0.6rem] text-cream-dark/40 mt-0.5">
            Use 1 recovery
          </p>
        </button>
        <button
          type="button"
          onClick={() => playStore.takeRespite()}
          className="flex-1 card px-4 py-3 text-center hover:border-gold/20 transition-all cursor-pointer"
        >
          <span className="font-heading text-xs uppercase tracking-wider text-gold-light">
            Take a Respite
          </span>
          <p className="font-body text-[0.6rem] text-cream-dark/40 mt-0.5">
            Full rest & reset
          </p>
        </button>
      </div>

      {/* ── Notes ── */}
      <div className="card px-4 py-3">
        <h3 className="font-heading text-xs uppercase tracking-wider text-gold mb-2">
          Session Notes
        </h3>
        <textarea
          value={playState.notes}
          onChange={(e) => playStore.setNotes(e.target.value)}
          placeholder="Track effects, reminders, or session notes..."
          className="w-full bg-surface-light/30 border border-gold/8 rounded-xl px-3 py-2 font-body text-sm text-cream resize-none focus:border-gold/30 focus:outline-none transition-all"
          rows={3}
        />
      </div>
    </div>
  );
}
