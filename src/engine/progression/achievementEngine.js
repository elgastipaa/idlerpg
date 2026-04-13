import { ACHIEVEMENTS } from "../../data/achievements";

export function getAchievementProgress(state, achievement) {
  const { stats, player, combat } = state;
  const stat = achievement.condition?.stat;

  switch (stat) {
    case "kills":
      return stats?.kills || 0;
    case "itemsFound":
      return stats?.itemsFound || 0;
    case "gold":
      return player?.gold || 0;
    case "level":
      return player?.level || 0;
    case "tier":
      return combat?.maxTier || 0;
    case "bossKills":
      return stats?.bossKills || 0;
    case "deaths":
      return stats?.deaths || 0;
    case "magicItemsFound":
    case "rareItemsFound":
    case "epicItemsFound":
    case "legendaryItemsFound":
    case "perfectRollsFound":
    case "t1AffixesFound":
    case "itemsSold":
    case "itemsExtracted":
    case "autoSoldItems":
    case "autoExtractedItems":
    case "upgradesCrafted":
    case "rerollsCrafted":
    case "ascendsCrafted":
    case "prestigeCount":
    case "talentsUnlocked":
    case "talentResets":
    case "bestItemRating":
      return stats?.[stat] || 0;
    default:
      return 0;
  }
}

export function checkAchievements(state) {
  const newAchievements = [...(state.achievements || [])];
  let bonusGold = 0;
  const unlocked = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (newAchievements.includes(achievement.id)) return;
    const current = getAchievementProgress(state, achievement);
    if (current >= achievement.condition.value) {
      newAchievements.push(achievement.id);
      bonusGold += achievement.reward || 0;
      unlocked.push(achievement);
    }
  });

  return { newAchievements, bonusGold, unlocked };
}
