import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Condition } from '../types/character';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;       // 'artifact' | 'consumable' | 'leveled' | 'trinket'
  description: string;
  charges?: number;        // for consumables with charges
  maxCharges?: number;
  isEquipped?: boolean;
  notes?: string;
}

export interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number;
  isPlayer: boolean;
  isActive: boolean;
}

export interface PlayCharacterState {
  currentStamina: number;
  maxStamina: number;
  temporaryStamina: number;
  usedRecoveries: number;
  maxRecoveries: number;
  recoveryValue: number;
  heroicResource: number;
  surges: number;
  victories: number;
  activeConditions: Condition[];
  notes: string;
  inventory: InventoryItem[];
  // Initiative tracker
  initiative: InitiativeEntry[];
  // Ability usage tracking (ability names used this encounter)
  usedAbilities: string[];
  // Earned title IDs
  earnedTitles: string[];
}

function createDefaultPlayState(
  maxStamina: number,
  maxRecoveries: number,
  recoveryValue: number,
): PlayCharacterState {
  return {
    currentStamina: maxStamina,
    maxStamina,
    temporaryStamina: 0,
    usedRecoveries: 0,
    maxRecoveries,
    recoveryValue,
    heroicResource: 0,
    surges: 0,
    victories: 0,
    activeConditions: [],
    notes: '',
    inventory: [],
    initiative: [],
    usedAbilities: [],
    earnedTitles: [],
  };
}

interface PlayStore {
  states: Record<string, PlayCharacterState>;
  activeCharacterId: string | null;

  getActiveState: () => PlayCharacterState | null;
  initPlayState: (
    characterId: string,
    maxStamina: number,
    maxRecoveries: number,
    recoveryValue: number,
  ) => void;
  setActiveCharacter: (id: string | null) => void;

  // Combat actions
  adjustStamina: (delta: number) => void;
  setStamina: (value: number) => void;
  adjustTemporaryStamina: (delta: number) => void;
  useRecovery: () => void;
  resetRecoveries: () => void;
  adjustResource: (delta: number) => void;
  setResource: (value: number) => void;
  adjustSurges: (delta: number) => void;
  toggleCondition: (condition: Condition) => void;
  clearConditions: () => void;
  addVictory: () => void;
  removeVictory: () => void;
  resetVictories: () => void;
  setNotes: (notes: string) => void;
  takeRespite: () => void;
  catchBreath: () => void;
  updateMaxStats: (
    maxStamina: number,
    maxRecoveries: number,
    recoveryValue: number,
  ) => void;
  deletePlayState: (characterId: string) => void;

  // Inventory actions
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string) => void;
  useCharge: (itemId: string) => void;
  toggleEquip: (itemId: string) => void;
  updateItemNotes: (itemId: string, notes: string) => void;

  // Initiative actions
  addInitiativeEntry: (entry: InitiativeEntry) => void;
  removeInitiativeEntry: (id: string) => void;
  setActiveInitiative: (id: string) => void;
  nextInitiative: () => void;
  clearInitiative: () => void;
  updateInitiativeOrder: (entries: InitiativeEntry[]) => void;

  // Ability usage actions
  toggleAbilityUsed: (abilityName: string) => void;
  resetUsedAbilities: () => void;

  // Title actions
  addTitle: (titleId: string) => void;
  removeTitle: (titleId: string) => void;
}

export const usePlayStore = create<PlayStore>()(
  persist(
    (set, get) => {
      function updateActive(
        updater: (state: PlayCharacterState) => PlayCharacterState,
      ) {
        const { activeCharacterId, states } = get();
        if (!activeCharacterId || !states[activeCharacterId]) return;
        set({
          states: {
            ...states,
            [activeCharacterId]: updater(states[activeCharacterId]),
          },
        });
      }

      return {
        states: {},
        activeCharacterId: null,

        getActiveState: () => {
          const { activeCharacterId, states } = get();
          if (!activeCharacterId) return null;
          const state = states[activeCharacterId];
          if (!state) return null;
          // Backward compat: ensure new fields exist for old play states
          if (!state.inventory) state.inventory = [];
          if (!state.initiative) state.initiative = [];
          if (!state.usedAbilities) state.usedAbilities = [];
          if (!state.earnedTitles) state.earnedTitles = [];
          return state;
        },

        initPlayState: (characterId, maxStamina, maxRecoveries, recoveryValue) => {
          const { states } = get();
          if (states[characterId]) {
            // Existing state — update max values but keep current progress
            set({
              activeCharacterId: characterId,
              states: {
                ...states,
                [characterId]: {
                  ...states[characterId],
                  maxStamina,
                  maxRecoveries,
                  recoveryValue,
                },
              },
            });
          } else {
            set({
              activeCharacterId: characterId,
              states: {
                ...states,
                [characterId]: createDefaultPlayState(maxStamina, maxRecoveries, recoveryValue),
              },
            });
          }
        },

        setActiveCharacter: (id) => set({ activeCharacterId: id }),

        adjustStamina: (delta) =>
          updateActive((s) => ({
            ...s,
            currentStamina: Math.max(0, Math.min(s.maxStamina, s.currentStamina + delta)),
          })),

        setStamina: (value) =>
          updateActive((s) => ({
            ...s,
            currentStamina: Math.max(0, Math.min(s.maxStamina, value)),
          })),

        adjustTemporaryStamina: (delta) =>
          updateActive((s) => ({
            ...s,
            temporaryStamina: Math.max(0, s.temporaryStamina + delta),
          })),

        useRecovery: () =>
          updateActive((s) => {
            if (s.usedRecoveries >= s.maxRecoveries) return s;
            return {
              ...s,
              currentStamina: Math.min(s.maxStamina, s.currentStamina + s.recoveryValue),
              usedRecoveries: s.usedRecoveries + 1,
            };
          }),

        resetRecoveries: () =>
          updateActive((s) => ({ ...s, usedRecoveries: 0 })),

        adjustResource: (delta) =>
          updateActive((s) => ({
            ...s,
            heroicResource: Math.max(0, s.heroicResource + delta),
          })),

        setResource: (value) =>
          updateActive((s) => ({
            ...s,
            heroicResource: Math.max(0, value),
          })),

        adjustSurges: (delta) =>
          updateActive((s) => ({
            ...s,
            surges: Math.max(0, s.surges + delta),
          })),

        toggleCondition: (condition) =>
          updateActive((s) => ({
            ...s,
            activeConditions: s.activeConditions.includes(condition)
              ? s.activeConditions.filter((c) => c !== condition)
              : [...s.activeConditions, condition],
          })),

        clearConditions: () =>
          updateActive((s) => ({ ...s, activeConditions: [] })),

        addVictory: () =>
          updateActive((s) => ({ ...s, victories: s.victories + 1 })),

        removeVictory: () =>
          updateActive((s) => ({ ...s, victories: Math.max(0, s.victories - 1) })),

        resetVictories: () =>
          updateActive((s) => ({ ...s, victories: 0 })),

        setNotes: (notes) =>
          updateActive((s) => ({ ...s, notes })),

        takeRespite: () =>
          updateActive((s) => ({
            ...s,
            currentStamina: s.maxStamina,
            temporaryStamina: 0,
            usedRecoveries: 0,
            heroicResource: 0,
            surges: 0,
            activeConditions: [],
            usedAbilities: [],
          })),

        catchBreath: () =>
          updateActive((s) => {
            if (s.usedRecoveries >= s.maxRecoveries) return s;
            return {
              ...s,
              currentStamina: Math.min(s.maxStamina, s.currentStamina + s.recoveryValue),
              usedRecoveries: s.usedRecoveries + 1,
            };
          }),

        updateMaxStats: (maxStamina, maxRecoveries, recoveryValue) =>
          updateActive((s) => ({
            ...s,
            maxStamina,
            maxRecoveries,
            recoveryValue,
            currentStamina: maxStamina,
            usedRecoveries: 0,
          })),

        deletePlayState: (characterId) => {
          const { states, activeCharacterId } = get();
          const newStates = { ...states };
          delete newStates[characterId];
          set({
            states: newStates,
            activeCharacterId: activeCharacterId === characterId ? null : activeCharacterId,
          });
        },

        // Inventory actions
        addInventoryItem: (item) =>
          updateActive((s) => ({
            ...s,
            inventory: [...(s.inventory ?? []), item],
          })),

        removeInventoryItem: (itemId) =>
          updateActive((s) => ({
            ...s,
            inventory: (s.inventory ?? []).filter((i) => i.id !== itemId),
          })),

        useCharge: (itemId) =>
          updateActive((s) => ({
            ...s,
            inventory: (s.inventory ?? []).map((i) =>
              i.id === itemId && i.charges != null && i.charges > 0
                ? { ...i, charges: i.charges - 1 }
                : i,
            ),
          })),

        toggleEquip: (itemId) =>
          updateActive((s) => ({
            ...s,
            inventory: (s.inventory ?? []).map((i) =>
              i.id === itemId ? { ...i, isEquipped: !i.isEquipped } : i,
            ),
          })),

        updateItemNotes: (itemId, notes) =>
          updateActive((s) => ({
            ...s,
            inventory: (s.inventory ?? []).map((i) =>
              i.id === itemId ? { ...i, notes } : i,
            ),
          })),

        // Initiative actions
        addInitiativeEntry: (entry) =>
          updateActive((s) => ({
            ...s,
            initiative: [...(s.initiative ?? []), entry]
              .sort((a, b) => b.initiative - a.initiative),
          })),

        removeInitiativeEntry: (id) =>
          updateActive((s) => ({
            ...s,
            initiative: (s.initiative ?? []).filter((e) => e.id !== id),
          })),

        setActiveInitiative: (id) =>
          updateActive((s) => ({
            ...s,
            initiative: (s.initiative ?? []).map((e) => ({
              ...e,
              isActive: e.id === id,
            })),
          })),

        nextInitiative: () =>
          updateActive((s) => {
            const entries = s.initiative ?? [];
            if (entries.length === 0) return s;
            const activeIdx = entries.findIndex((e) => e.isActive);
            const nextIdx = activeIdx < 0 ? 0 : (activeIdx + 1) % entries.length;
            return {
              ...s,
              initiative: entries.map((e, i) => ({ ...e, isActive: i === nextIdx })),
            };
          }),

        clearInitiative: () =>
          updateActive((s) => ({ ...s, initiative: [] })),

        updateInitiativeOrder: (entries) =>
          updateActive((s) => ({ ...s, initiative: entries })),

        // Ability usage actions
        toggleAbilityUsed: (abilityName) =>
          updateActive((s) => {
            const used = s.usedAbilities ?? [];
            return {
              ...s,
              usedAbilities: used.includes(abilityName)
                ? used.filter((n) => n !== abilityName)
                : [...used, abilityName],
            };
          }),

        resetUsedAbilities: () =>
          updateActive((s) => ({ ...s, usedAbilities: [] })),

        // Title actions
        addTitle: (titleId) =>
          updateActive((s) => ({
            ...s,
            earnedTitles: [...(s.earnedTitles ?? []), titleId],
          })),

        removeTitle: (titleId) =>
          updateActive((s) => ({
            ...s,
            earnedTitles: (s.earnedTitles ?? []).filter((t) => t !== titleId),
          })),
      };
    },
    { name: 'draw-steel-play-states' },
  ),
);
