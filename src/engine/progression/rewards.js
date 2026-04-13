import { generateLoot } from "../../utils/loot";
import { getLegendaryPowerMasteryMap } from "./codexEngine";

// Pipeline de recompensas al matar un enemigo.
// Futuro: mapas y dungeons pueden agregar multiplicadores al context.

export function calculateRewards({ enemy, playerStats, player = null, codex = null, eventMods, prestige, isCrit, unlockedTalents }) {
  const critGoldBonus = (isCrit && unlockedTalents.includes("rogue_opportunist")) ? 5 : 0;
  const discoveredPowerIds = Object.entries(codex?.powerDiscoveries || {})
    .filter(([, discoveries]) => Number(discoveries || 0) > 0)
    .map(([powerId]) => powerId);
  const powerMasteryMap = getLegendaryPowerMasteryMap(codex || {});

  const goldGained = Math.floor(
    (enemy.goldReward + playerStats.flatGold + critGoldBonus) *
    (1 + playerStats.goldPct) * (eventMods.goldMult || 1)
  );

  const xpGained = Math.floor(
    enemy.xpReward * (1 + playerStats.xpPct) * (eventMods.xpMult || 1)
  );

  const essenceGained = Math.floor(
    Math.max(0, (enemy.isBoss ? 5 : 1) + (playerStats.essenceBonus || 0)) *
      (eventMods.essenceMult || 1)
  );

  const loot = generateLoot({
    enemy,
    luck: playerStats.luck || 0,
    lootBonus: playerStats.lootBonus || 0,
    favoredFamilies: enemy?.favoredFamilies || [],
    favoredStats: enemy?.favoredStats || [],
    discoveredPowerIds,
    powerMasteryMap,
    discoveredPowerBias: player?.prestigeBonuses?.discoveredPowerBias || 0,
    favoredStatWeightMultiplier: enemy?.isBoss ? 3.2 : 2.4,
    rarityFloor: enemy?.guaranteedRarityFloor || null,
    rarityBonus: enemy?.dropRarityBonus || 0,
  });

  return { goldGained, xpGained, essenceGained, loot };
}
