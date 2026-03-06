import { validateStep } from './step-validation';
import type { CharacterData, WizardStepId } from '../types/character';

export interface Category {
  id: string;
  label: string;
  steps: WizardStepId[];
  stepLabels: Record<string, string>;
  optional?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    id: 'ancestry',
    label: 'Ancestry',
    steps: ['ancestry', 'ancestry-traits'],
    stepLabels: { ancestry: 'Ancestry', 'ancestry-traits': 'Traits' },
  },
  {
    id: 'culture',
    label: 'Culture',
    steps: ['culture'],
    stepLabels: { culture: 'Culture' },
  },
  {
    id: 'career',
    label: 'Career',
    steps: ['career'],
    stepLabels: { career: 'Career' },
  },
  {
    id: 'class',
    label: 'Class',
    steps: ['class', 'subclass', 'characteristics', 'kit', 'abilities'],
    stepLabels: {
      class: 'Class',
      subclass: 'Subclass',
      characteristics: 'Stats',
      kit: 'Kit',
      abilities: 'Abilities',
    },
  },
  {
    id: 'complication',
    label: 'Complication',
    steps: ['complication'],
    stepLabels: { complication: 'Complication' },
    optional: true,
  },
  {
    id: 'details',
    label: 'Details',
    steps: ['details', 'model'],
    stepLabels: { details: 'Details', model: '3D Model' },
  },
];

export function getCategoryCompletion(
  category: Category,
  character: CharacterData,
): { completed: number; total: number; percentage: number } {
  let completed = 0;
  const total = category.steps.length;
  for (const step of category.steps) {
    if (validateStep(step, character).valid) completed++;
  }
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 100,
  };
}

export function getCategoryForStep(step: WizardStepId): Category | null {
  return CATEGORIES.find((c) => c.steps.includes(step)) ?? null;
}

export function getOverallCompletion(character: CharacterData): {
  completed: number;
  total: number;
} {
  let completed = 0;
  let total = 0;
  for (const cat of CATEGORIES) {
    const result = getCategoryCompletion(cat, character);
    completed += result.completed;
    total += result.total;
  }
  return { completed, total };
}
