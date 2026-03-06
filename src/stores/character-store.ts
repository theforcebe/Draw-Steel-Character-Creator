import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WIZARD_STEPS } from '../types/character';
import { validateStep } from '../engine/step-validation';
import type {
  CharacterData,
  AncestryId,
  SelectedTrait,
  CultureChoice,
  CareerChoice,
  ClassChoice,
  ComplicationChoice,
  PortraitSettings,
  WizardStepId,
} from '../types/character';

const DEFAULT_CHARACTER: CharacterData = {
  name: '',
  level: 1,
  ancestryId: null,
  formerLifeAncestryId: null,
  selectedTraits: [],
  culture: null,
  career: null,
  classChoice: null,
  complication: null,
  appearance: '',
  backstory: '',
  portraitSettings: null,
  computedStats: null,
};

interface CharacterStore {
  character: CharacterData;
  currentStep: WizardStepId;
  mode: 'create' | 'play';
  playingCharacterId: string | null;
  validationError: string | null;

  // Navigation
  setStep: (step: WizardStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  clearValidationError: () => void;

  // Mode
  setMode: (mode: 'create' | 'play') => void;
  setPlayingCharacterId: (id: string | null) => void;

  // Setters
  setName: (name: string) => void;
  setLevel: (level: number) => void;
  setAncestry: (id: AncestryId) => void;
  setFormerLifeAncestry: (id: AncestryId | null) => void;
  setSelectedTraits: (traits: SelectedTrait[]) => void;
  setCulture: (culture: CultureChoice) => void;
  setCareer: (career: CareerChoice) => void;
  setClassChoice: (choice: ClassChoice) => void;
  setComplication: (complication: ComplicationChoice | null) => void;
  setAppearance: (text: string) => void;
  setBackstory: (text: string) => void;
  setPortraitSettings: (settings: PortraitSettings) => void;

  // Reset
  resetCharacter: () => void;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      character: { ...DEFAULT_CHARACTER },
      currentStep: 'welcome',
      mode: 'create',
      playingCharacterId: null,
      validationError: null,

      // Navigation
      setStep: (step) => set({ currentStep: step, validationError: null }),

      nextStep: () =>
        set((state) => {
          const currentIndex = WIZARD_STEPS.indexOf(state.currentStep);
          if (currentIndex < WIZARD_STEPS.length - 1) {
            const result = validateStep(state.currentStep, state.character);
            if (!result.valid) {
              return { validationError: result.message };
            }
            return { currentStep: WIZARD_STEPS[currentIndex + 1], validationError: null };
          }
          return state;
        }),

      prevStep: () =>
        set((state) => {
          const currentIndex = WIZARD_STEPS.indexOf(state.currentStep);
          if (currentIndex > 0) {
            return { currentStep: WIZARD_STEPS[currentIndex - 1], validationError: null };
          }
          return state;
        }),

      clearValidationError: () => set({ validationError: null }),

      // Mode
      setMode: (mode) => set({ mode }),
      setPlayingCharacterId: (id) => set({ playingCharacterId: id }),

      // Setters
      setName: (name) =>
        set((state) => ({
          character: { ...state.character, name },
          validationError: null,
        })),

      setLevel: (level) =>
        set((state) => ({
          character: { ...state.character, level },
        })),

      setAncestry: (id) =>
        set((state) => ({
          character: {
            ...state.character,
            ancestryId: id,
            formerLifeAncestryId: null,
            selectedTraits: [],
            computedStats: null,
          },
          validationError: null,
        })),

      setFormerLifeAncestry: (id) =>
        set((state) => ({
          character: { ...state.character, formerLifeAncestryId: id },
          validationError: null,
        })),

      setSelectedTraits: (traits) =>
        set((state) => ({
          character: { ...state.character, selectedTraits: traits },
          validationError: null,
        })),

      setCulture: (culture) =>
        set((state) => ({
          character: { ...state.character, culture },
          validationError: null,
        })),

      setCareer: (career) =>
        set((state) => ({
          character: { ...state.character, career },
          validationError: null,
        })),

      setClassChoice: (choice) =>
        set((state) => ({
          character: {
            ...state.character,
            classChoice: choice,
          },
          validationError: null,
        })),

      setComplication: (complication) =>
        set((state) => ({
          character: { ...state.character, complication },
          validationError: null,
        })),

      setAppearance: (text) =>
        set((state) => ({
          character: { ...state.character, appearance: text },
        })),

      setBackstory: (text) =>
        set((state) => ({
          character: { ...state.character, backstory: text },
        })),

      setPortraitSettings: (settings) =>
        set((state) => ({
          character: { ...state.character, portraitSettings: settings },
        })),

      // Reset
      resetCharacter: () =>
        set({
          character: { ...DEFAULT_CHARACTER },
          currentStep: 'welcome',
          mode: 'create',
          playingCharacterId: null,
          validationError: null,
        }),
    }),
    {
      name: 'draw-steel-character',
      // Migrate old data: convert complicationName -> complication
      migrate: (persisted: unknown, _version: number) => {
        const state = persisted as Record<string, unknown>;
        const character = state.character as Record<string, unknown> | undefined;
        if (character) {
          // Migrate complicationName to complication object
          if ('complicationName' in character && character.complicationName && !character.complication) {
            character.complication = {
              name: character.complicationName as string,
              skills: [],
              languages: [],
              forgottenLanguage: '',
              benefitChoiceIndex: -1,
            };
          }
          delete character.complicationName;

          // Ensure complication defaults
          if (!character.complication) {
            character.complication = null;
          }

          // Ensure classChoice has subclassSkill
          const classChoice = character.classChoice as Record<string, unknown> | null;
          if (classChoice && !('subclassSkill' in classChoice)) {
            classChoice.subclassSkill = '';
          }

          // Ensure portraitSettings exists and has all expected fields
          if (!('portraitSettings' in character)) {
            character.portraitSettings = null;
          }
          const ps = character.portraitSettings as Record<string, unknown> | null;
          if (ps) {
            if (!('armorColor' in ps)) ps.armorColor = '#757575';
            // New fields from enhanced model system (weaponId, skinColor, accentColor, gemColor)
            // These default to undefined/null which is fine — the model system uses ancestry defaults
          }
        }
        // Ensure mode and playingCharacterId exist
        if (!('mode' in state)) {
          state.mode = 'create';
        }
        if (!('playingCharacterId' in state)) {
          state.playingCharacterId = null;
        }
        return state;
      },
      version: 1,
    },
  ),
);
