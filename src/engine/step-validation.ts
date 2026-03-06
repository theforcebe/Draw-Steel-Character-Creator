import type { CharacterData, WizardStepId } from '../types/character';

export function validateStep(
  step: WizardStepId,
  character: CharacterData,
): { valid: boolean; message: string } {
  switch (step) {
    case 'welcome':
      return { valid: true, message: '' };

    case 'ancestry':
      if (!character.ancestryId) return { valid: false, message: 'Please select an ancestry.' };
      return { valid: true, message: '' };

    case 'ancestry-traits':
      if (character.ancestryId === 'revenant' && !character.formerLifeAncestryId)
        return { valid: false, message: 'Revenants must choose a former life ancestry.' };
      return { valid: true, message: '' };

    case 'culture':
      if (!character.culture) return { valid: false, message: 'Please select your culture options.' };
      if (!character.culture.environmentSkill) return { valid: false, message: 'Please choose an environment skill.' };
      if (!character.culture.organizationSkill) return { valid: false, message: 'Please choose an organization skill.' };
      if (!character.culture.upbringingSkill) return { valid: false, message: 'Please choose an upbringing skill.' };
      if (!character.culture.language) return { valid: false, message: 'Please select a language.' };
      return { valid: true, message: '' };

    case 'career':
      if (!character.career) return { valid: false, message: 'Please select a career.' };
      if (!character.career.perkName) return { valid: false, message: 'Please choose a perk.' };
      if (character.career.languages.some((l) => !l))
        return { valid: false, message: 'Please select all career languages.' };
      return { valid: true, message: '' };

    case 'class':
      if (!character.classChoice) return { valid: false, message: 'Please select a class.' };
      return { valid: true, message: '' };

    case 'subclass':
      if (!character.classChoice?.subclassId) return { valid: false, message: 'Please select a subclass.' };
      return { valid: true, message: '' };

    case 'characteristics': {
      if (!character.classChoice) return { valid: false, message: 'Please select a class first.' };
      const chars = character.classChoice.characteristics;
      const allZero = Object.values(chars).every((v) => v === 0);
      if (allZero) return { valid: false, message: 'Please choose a characteristic array.' };
      return { valid: true, message: '' };
    }

    case 'kit':
      if (!character.classChoice?.kitId) return { valid: false, message: 'Please select a kit.' };
      return { valid: true, message: '' };

    case 'abilities':
      if (!character.classChoice?.signatureAbilityName)
        return { valid: false, message: 'Please choose a signature ability.' };
      if (character.classChoice.heroicAbilities.length < 2)
        return { valid: false, message: 'Please choose your heroic abilities (one 3-cost and one 5-cost).' };
      return { valid: true, message: '' };

    case 'complication':
      return { valid: true, message: '' };

    case 'details':
      if (!character.name.trim()) return { valid: false, message: 'Please enter a character name.' };
      return { valid: true, message: '' };

    case 'model':
      return { valid: true, message: '' };

    case 'review':
      return { valid: true, message: '' };

    default:
      return { valid: true, message: '' };
  }
}
