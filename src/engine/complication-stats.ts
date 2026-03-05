import type { ComplicationChoice } from '../types/character';
import { COMPLICATION_CHOICES } from '../data/complication-choices';

interface ComplicationBonuses {
  stamina: number;
  recoveries: number;
  stability: number;
  renown: number;
  wealth: number;
}

/**
 * Compute stat bonuses from a complication, including benefit choice
 * selections (e.g. "Infernal Contract...Bad" lets you pick +2 Renown,
 * +2 Wealth, or +3 Stamina).
 */
export function getComplicationStatBonuses(
  complication: ComplicationChoice | null | undefined,
  level: number,
): ComplicationBonuses {
  const result: ComplicationBonuses = {
    stamina: 0,
    recoveries: 0,
    stability: 0,
    renown: 0,
    wealth: 0,
  };

  if (!complication) return result;

  const meta = COMPLICATION_CHOICES[complication.name];
  if (!meta) return result;

  // Fixed stat bonuses
  if (meta.statBonuses) {
    if (meta.statBonuses.stamina) {
      if (meta.statBonuses.staminaScaling) {
        // Elemental Inside: +3 at level 1, +3 at 4, +3 at 7, +3 at 10
        let bonus = meta.statBonuses.stamina;
        if (level >= 4) bonus += meta.statBonuses.stamina;
        if (level >= 7) bonus += meta.statBonuses.stamina;
        if (level >= 10) bonus += meta.statBonuses.stamina;
        result.stamina += bonus;
      } else {
        result.stamina += meta.statBonuses.stamina;
      }
    }
    if (meta.statBonuses.recoveries) result.recoveries += meta.statBonuses.recoveries;
    if (meta.statBonuses.stability) result.stability += meta.statBonuses.stability;
    if (meta.statBonuses.renown) result.renown += meta.statBonuses.renown;
    if (meta.statBonuses.wealth) result.wealth += meta.statBonuses.wealth;
  }

  // Benefit choice (e.g. Infernal Contract...Bad)
  if (meta.benefitChoice && complication.benefitChoiceIndex >= 0) {
    const chosen = meta.benefitChoice[complication.benefitChoiceIndex];
    if (chosen) {
      if (chosen.stats.stamina) result.stamina += chosen.stats.stamina;
      if (chosen.stats.recoveries) result.recoveries += chosen.stats.recoveries;
      if (chosen.stats.stability) result.stability += chosen.stats.stability;
      if (chosen.stats.renown) result.renown += chosen.stats.renown;
      if (chosen.stats.wealth) result.wealth += chosen.stats.wealth;
    }
  }

  return result;
}
