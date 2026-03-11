import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { usePlayStore } from '../../stores/play-store';
import type { InitiativeEntry } from '../../stores/play-store';
import {
  CONDITIONS,
  CONDITION_DESCRIPTIONS,
  CLASS_RESOURCES,
} from '../../types/character';
import type { Condition } from '../../types/character';
import { useTreasureStats } from '../../hooks/useTreasureStats';

function StatBox({ label, value, bonus }: { label: string; value: number | string; bonus?: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-surface-light/50 border border-gold/8">
      <div className="flex items-baseline gap-0.5">
        <span className="font-heading text-lg font-bold text-gold-light">{value}</span>
        {bonus != null && bonus > 0 && (
          <span className="font-heading text-[0.5rem] text-emerald-400">+{bonus}</span>
        )}
      </div>
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

function InitiativeTracker() {
  const playStore = usePlayStore();
  const playState = playStore.getActiveState();
  const character = useCharacterStore((s) => s.character);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInit, setNewInit] = useState('');

  if (!playState) return null;

  const entries = playState.initiative ?? [];

  function handleAdd() {
    const name = newName.trim() || 'Unnamed';
    const init = parseInt(newInit, 10) || 0;
    const entry: InitiativeEntry = {
      id: `init-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      initiative: init,
      isPlayer: false,
      isActive: entries.length === 0,
    };
    playStore.addInitiativeEntry(entry);
    setNewName('');
    setNewInit('');
    setShowAdd(false);
  }

  function handleAddSelf() {
    const name = character.name || 'Hero';
    const entry: InitiativeEntry = {
      id: `init-self-${Date.now()}`,
      name,
      initiative: 0,
      isPlayer: true,
      isActive: entries.length === 0,
    };
    playStore.addInitiativeEntry(entry);
  }

  return (
    <div className="card px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-xs uppercase tracking-wider text-gold">Initiative</h3>
        <div className="flex gap-1.5">
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => playStore.nextInitiative()}
              className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted hover:text-gold transition-all px-2 py-1 rounded-lg border border-gold/10 hover:border-gold/30"
            >
              Next Turn
            </button>
          )}
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => playStore.clearInitiative()}
              className="font-heading text-[0.55rem] uppercase tracking-wider text-crimson/60 hover:text-crimson transition-all px-2 py-1 rounded-lg border border-crimson/10 hover:border-crimson/30"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="flex flex-col gap-1 mb-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={[
                'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all',
                entry.isActive
                  ? 'bg-gold/10 border border-gold/25 shadow-[0_0_12px_rgba(212,168,67,0.1)]'
                  : 'bg-surface-light/20 border border-gold/5',
              ].join(' ')}
            >
              <span className={[
                'font-heading text-sm font-bold w-8 text-center',
                entry.isActive ? 'text-gold' : 'text-gold-muted',
              ].join(' ')}>
                {entry.initiative}
              </span>
              <span className={[
                'flex-1 font-heading text-xs tracking-wide truncate',
                entry.isPlayer ? 'text-gold-light' : 'text-cream-dark/70',
                entry.isActive ? 'font-semibold' : '',
              ].join(' ')}>
                {entry.name}
                {entry.isPlayer && (
                  <span className="ml-1 text-[0.5rem] text-gold/50 uppercase">(you)</span>
                )}
              </span>
              {entry.isActive && (
                <span className="shrink-0 w-2 h-2 rounded-full bg-gold animate-pulse" />
              )}
              <button
                type="button"
                onClick={() => playStore.removeInitiativeEntry(entry.id)}
                className="shrink-0 text-[0.6rem] text-crimson/40 hover:text-crimson transition-all px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-[0.65rem] text-cream-dark/30 mb-2">
          No initiative order set. Add combatants to start tracking turns.
        </p>
      )}

      {showAdd ? (
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="flex-1 px-2 py-1.5 rounded-lg bg-surface-light/20 border border-gold/10 text-cream-dark/80 font-body text-xs placeholder:text-cream-dark/30 focus:outline-none focus:border-gold/30"
          />
          <input
            type="number"
            value={newInit}
            onChange={(e) => setNewInit(e.target.value)}
            placeholder="Init"
            className="w-14 px-2 py-1.5 rounded-lg bg-surface-light/20 border border-gold/10 text-cream-dark/80 font-body text-xs text-center placeholder:text-cream-dark/30 focus:outline-none focus:border-gold/30"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-2 py-1.5 rounded-lg bg-gold/10 border border-gold/20 font-heading text-[0.55rem] uppercase tracking-wider text-gold hover:bg-gold/20 transition-all"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowAdd(false); setNewName(''); setNewInit(''); }}
            className="px-1.5 py-1.5 text-[0.55rem] text-cream-dark/40 hover:text-cream-dark/60 transition-all"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-1">
          {!entries.some((e) => e.isPlayer) && (
            <button
              type="button"
              onClick={handleAddSelf}
              className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted hover:text-gold transition-all px-2 py-1 rounded-lg border border-gold/10 hover:border-gold/30"
            >
              + Add Self
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted hover:text-gold transition-all px-2 py-1 rounded-lg border border-gold/10 hover:border-gold/30"
          >
            + Add Combatant
          </button>
        </div>
      )}
    </div>
  );
}

export function PlayCombat() {
  const character = useCharacterStore((s) => s.character);
  const playStore = usePlayStore();
  const playState = playStore.getActiveState();
  const { stats: treasureStats, treasureBonuses } = useTreasureStats();

  // Sync max stats when treasure bonuses change (equip/unequip)
  useEffect(() => {
    if (!playState || !treasureStats) return;
    if (
      treasureStats.stamina !== playState.maxStamina ||
      treasureStats.recoveries !== playState.maxRecoveries ||
      treasureStats.recoveryValue !== playState.recoveryValue
    ) {
      playStore.syncMaxStats(
        treasureStats.stamina,
        treasureStats.recoveries,
        treasureStats.recoveryValue,
      );
    }
  }, [treasureStats?.stamina, treasureStats?.recoveries, treasureStats?.recoveryValue]);

  if (!playState) return null;

  const classId = character.classChoice?.classId ?? '';
  const resourceName = CLASS_RESOURCES[classId] ?? 'Resource';
  const stats = treasureStats ?? character.computedStats;
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
        <StatBox label="Speed" value={stats?.speed ?? 5} bonus={treasureBonuses.speed || undefined} />
        <StatBox label="Stability" value={stats?.stability ?? 0} bonus={treasureBonuses.stability || undefined} />
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

      {/* ── Treasure Bonuses (if any equipped) ── */}
      {(treasureBonuses.weaponDamage > 0 || treasureBonuses.implementDamage > 0 ||
        treasureBonuses.unarmedDamage > 0 || treasureBonuses.extraDamage.length > 0 ||
        treasureBonuses.meleeDistance > 0 || treasureBonuses.rangedDistance > 0) && (
        <div className="card px-4 py-2.5">
          <h3 className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted mb-1.5">Treasure Bonuses</h3>
          <div className="flex flex-wrap gap-1.5">
            {treasureBonuses.weaponDamage > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-heading uppercase tracking-wider text-emerald-400 bg-emerald-900/20 border border-emerald-500/20">
                +{treasureBonuses.weaponDamage} Weapon Dmg
              </span>
            )}
            {treasureBonuses.implementDamage > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-heading uppercase tracking-wider text-emerald-400 bg-emerald-900/20 border border-emerald-500/20">
                +{treasureBonuses.implementDamage} Implement Dmg
              </span>
            )}
            {treasureBonuses.unarmedDamage > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-heading uppercase tracking-wider text-emerald-400 bg-emerald-900/20 border border-emerald-500/20">
                +{treasureBonuses.unarmedDamage} Unarmed Dmg
              </span>
            )}
            {treasureBonuses.extraDamage.map((ed) => (
              <span key={`${ed.source}-${ed.type}`} className="px-2 py-0.5 rounded-full text-[0.5rem] font-heading uppercase tracking-wider text-purple-400 bg-purple-900/20 border border-purple-500/20">
                +{ed.value} {ed.type}
              </span>
            ))}
            {treasureBonuses.meleeDistance > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-heading uppercase tracking-wider text-sky-400 bg-sky-900/20 border border-sky-500/20">
                +{treasureBonuses.meleeDistance} Melee Dist
              </span>
            )}
            {treasureBonuses.rangedDistance > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[0.5rem] font-heading uppercase tracking-wider text-sky-400 bg-sky-900/20 border border-sky-500/20">
                +{treasureBonuses.rangedDistance} Ranged Dist
              </span>
            )}
          </div>
        </div>
      )}

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

      {/* ── Initiative Tracker ── */}
      <InitiativeTracker />

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
        {/* Active condition descriptions */}
        {playState.activeConditions.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {playState.activeConditions.map((condition) => (
              <div
                key={`desc-${condition}`}
                className="px-3 py-2 rounded-xl bg-crimson/5 border border-crimson/15"
              >
                <span className="font-heading text-[0.6rem] uppercase tracking-wider text-crimson font-semibold">
                  {condition}
                </span>
                <p className="font-body text-[0.6rem] text-cream-dark/60 mt-0.5 leading-relaxed">
                  {CONDITION_DESCRIPTIONS[condition as Condition]}
                </p>
              </div>
            ))}
          </div>
        )}
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
