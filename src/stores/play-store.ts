import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Condition } from '../types/character';

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
          return states[activeCharacterId] ?? null;
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
      };
    },
    { name: 'draw-steel-play-states' },
  ),
);
