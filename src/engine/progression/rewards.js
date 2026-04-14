import { generateLoot } from "../../utils/loot";
import { getLegendaryPowerMasteryMap } from "./codexEngine";
import { getRunSigilRewardModifiers } from "../../data/runSigils";

// Pipeline de recompensas al matar un enemigo.
// Futuro: mapas y dungeons pueden agregar multiplicadores al context.

function mergeRarityBonus(...bonusEntries) {
  const merged = {};
  for (const entry of bonusEntries) {
    if (typeof entry === "number") {
      merged.common = (merged.common || 0) + entry;
      continue;
    }
    for (const [key, value] of Object.entries(entry || {})) {
      merged[key] = (merged[key] || 0) + Number(value || 0);
    }
  }
  return merged;
}

export function calculateRewards({
  enemy,
  playerStats,
  player = null,
  codex = null,
  eventMods,
  prestige,
  isCrit,
  unlockedTalents,
  runSigilId = "free",
}) {
  const runSigil = getRunSigilRewardModifiers(runSigilId);
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
    enemy.xpReward * (1 + playerStats.xpPct) * (eventMods.xpMult || 1) * (runSigil.xpMult || 1)
  );

  const essenceGained = Math.floor(
    Math.max(0, (enemy.essenceReward || (enemy.isBoss ? 5 : 1)) + (playerStats.essenceBonus || 0)) *
      (eventMods.essenceMult || 1) *
      (runSigil.essenceMult || 1)
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
    powerHuntMultiplier: runSigil.powerHuntMultiplier || 1,
    preferredArchetypes: [player?.specialization, player?.class].filter(Boolean),
    preferredPowerBias: 0.45,
    offArchetypeLegendaryPenalty: 0.86,
    favoredStatWeightMultiplier: enemy?.isBoss ? 3.2 : 2.4,
    rarityFloor: enemy?.guaranteedRarityFloor || null,
    rarityBonus: mergeRarityBonus(enemy?.dropRarityBonus || 0, runSigil.rarityBonus || {}),
  });

  return { goldGained, xpGained, essenceGained, loot };
}
