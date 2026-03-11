/**
 * Hook that computes character stats including treasure bonuses from equipped inventory.
 * Used by play mode components to get accurate stats that account for equipped treasures.
 */

import { useMemo } from 'react';
import { useCharacterStore } from '../stores/character-store';
import { usePlayStore } from '../stores/play-store';
import { computeAllStats } from '../engine/stat-calculator';
import { getComplicationStatBonuses } from '../engine/complication-stats';
import { computeTreasureBonuses } from '../engine/treasure-effects';
import type { ComputedStats } from '../types/character';
import type { TreasureBonuses } from '../engine/treasure-effects';

interface TreasureAwareStats {
  stats: ComputedStats | null;
  treasureBonuses: TreasureBonuses;
  /** Stats without treasure bonuses (base stats) */
  baseStats: ComputedStats | null;
}

export function useTreasureStats(): TreasureAwareStats {
  const character = useCharacterStore((s) => s.character);
  const playState = usePlayStore((s) => s.getActiveState());

  return useMemo(() => {
    const inventory = playState?.inventory ?? [];
    const equipped = inventory.filter((i) => i.isEquipped);
    const tBonuses = computeTreasureBonuses(equipped, character.level);

    const complicationBonuses = character.complication
      ? getComplicationStatBonuses(character.complication, character.level)
      : undefined;

    const baseParams = {
      level: character.level,
      ancestryId: character.ancestryId,
      formerLifeAncestryId: character.formerLifeAncestryId,
      classId: character.classChoice?.classId ?? null,
      kitId: character.classChoice?.kitId ?? null,
      classKitOptionId: character.classChoice?.classKitOptionId,
      selectedTraits: character.selectedTraits,
      complicationBonuses,
    };

    const baseStats = computeAllStats(baseParams);

    const statsWithTreasures = computeAllStats({
      ...baseParams,
      treasureBonuses: {
        stamina: tBonuses.stamina,
        speed: tBonuses.speed,
        stability: tBonuses.stability,
      },
    });

    return {
      stats: statsWithTreasures,
      treasureBonuses: tBonuses,
      baseStats,
    };
  }, [character, playState?.inventory]);
}
