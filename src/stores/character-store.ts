import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WIZARD_STEPS } from '../types/character';
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

  // Navigation
  setStep: (step: WizardStepId) => void;
  nextStep: () => void;
  prevStep: () => void;

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

      // Navigation
      setStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => {
          const currentIndex = WIZARD_STEPS.indexOf(state.currentStep);
          if (currentIndex < WIZARD_STEPS.length - 1) {
            return { currentStep: WIZARD_STEPS[currentIndex + 1] };
          }
          return state;
        }),

      prevStep: () =>
        set((state) => {
          const currentIndex = WIZARD_STEPS.indexOf(state.currentStep);
          if (currentIndex > 0) {
            return { currentStep: WIZARD_STEPS[currentIndex - 1] };
          }
          return state;
        }),

      // Setters
      setName: (name) =>
        set((state) => ({
          character: { ...state.character, name },
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
        })),

      setFormerLifeAncestry: (id) =>
        set((state) => ({
          character: { ...state.character, formerLifeAncestryId: id },
        })),

      setSelectedTraits: (traits) =>
        set((state) => ({
          character: { ...state.character, selectedTraits: traits },
        })),

      setCulture: (culture) =>
        set((state) => ({
          character: { ...state.character, culture },
        })),

      setCareer: (career) =>
        set((state) => ({
          character: { ...state.character, career },
        })),

      setClassChoice: (choice) =>
        set((state) => ({
          character: {
            ...state.character,
            classChoice: choice,
          },
        })),

      setComplication: (complication) =>
        set((state) => ({
          character: { ...state.character, complication },
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

          // Ensure portraitSettings exists and has armorColor
          if (!('portraitSettings' in character)) {
            character.portraitSettings = null;
          }
          const ps = character.portraitSettings as Record<string, unknown> | null;
          if (ps && !('armorColor' in ps)) {
            ps.armorColor = '#757575';
          }
        }
        return state;
      },
      version: 1,
    },
  ),
);
