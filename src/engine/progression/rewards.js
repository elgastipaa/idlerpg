import { generateLoot } from "../../utils/loot";

// Pipeline de recompensas al matar un enemigo.
// Futuro: mapas y dungeons pueden agregar multiplicadores al context.

export function calculateRewards({ enemy, playerStats, eventMods, prestige, isCrit, unlockedTalents }) {
  const critGoldBonus = (isCrit && unlockedTalents.includes("rogue_opportunist")) ? 5 : 0;

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
    rarityFloor: enemy?.guaranteedRarityFloor || null,
    rarityBonus: enemy?.dropRarityBonus || 0,
  });

  return { goldGained, xpGained, essenceGained, loot };
}
