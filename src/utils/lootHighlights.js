import { itemMatchesBuildTag } from "./buildIdentity";
import { getItemLegendaryPower } from "./legendaryPowers";

const RARITY_SCORE = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const OFFENSE_KEYS = [
  "damage",
  "critChance",
  "critDamage",
  "attackSpeed",
  "multiHitChance",
  "bleedChance",
  "bleedDamage",
  "fractureChance",
  "lifesteal",
  "damageOnKill",
  "critOnLowHp",
];

function countMatchingStats(stats, keys) {
  return keys.reduce((total, key) => total + ((stats[key] || 0) > 0 ? 1 : 0), 0);
}

function getWishlistMatches(item, wishlistAffixes = []) {
  const affixStats = new Set((item?.affixes || []).map(affix => affix.stat));
  return wishlistAffixes.filter(stat => affixStats.has(stat));
}

function getHuntMatches(item, huntContext = null) {
  if (!item || !huntContext) {
    return { isMatch: false, familyMatch: false, matchingStats: [], strength: 0 };
  }

  const favoredFamilies = huntContext?.favoredFamilies || [];
  const favoredStats = huntContext?.favoredStats || [];
  const familyMatch = favoredFamilies.includes(item.family);
  const affixStats = new Set((item?.affixes || []).map(affix => affix.stat));
  const bonusStats = new Set(Object.keys(item?.bonus || {}).filter(stat => (item?.bonus?.[stat] || 0) > 0));
  const matchingStats = favoredStats.filter(stat => affixStats.has(stat) || bonusStats.has(stat));
  const strength = (familyMatch ? 2 : 0) + matchingStats.length;

  return {
    isMatch: familyMatch || matchingStats.length > 0,
    familyMatch,
    matchingStats,
    strength,
  };
}

export function getItemCraftVisual(item) {
  if ((item?.crafting?.ascendCount || 0) > 0) {
    return { label: "Ascendido", tone: "ascended", glow: "0 0 0 2px rgba(250,204,21,0.16), 0 12px 28px rgba(250,204,21,0.18)" };
  }
  const level = item?.level ?? 0;
  const affixes = item?.affixes || [];
  const t1Count = affixes.filter(affix => affix.tier === 1).length;
  const perfectCount = affixes.filter(affix => affix.perfectRoll).length;
  const investment = (item?.crafting?.rerollCount || 0) + (item?.crafting?.polishCount || 0) + (item?.crafting?.reforgeCount || 0);

  if (level >= 9 || (t1Count >= 2 && perfectCount >= 1)) {
    return { label: "Obra Maestra", tone: "masterwork", glow: "0 0 0 2px rgba(245,158,11,0.18), 0 12px 28px rgba(245,158,11,0.18)" };
  }
  if (level >= 6 || investment >= 4) {
    return { label: "Forjado", tone: "forged", glow: "0 0 0 2px rgba(14,165,233,0.15), 0 10px 22px rgba(14,165,233,0.12)" };
  }
  if (investment >= 1) {
    return { label: "Trabajado", tone: "crafted", glow: "0 0 0 2px rgba(99,102,241,0.12), 0 8px 18px rgba(99,102,241,0.10)" };
  }
  return null;
}

export function getLootHighlights({ item, equippedItem = null, activeBuildTag = null, wishlistAffixes = [], huntContext = null }) {
  if (!item) return [];

  const stats = item.bonus || {};
  const affixes = item.affixes || [];
  const perfectRollCount = affixes.filter(affix => affix.perfectRoll).length;
  const t1AffixCount = affixes.filter(affix => affix.tier === 1).length;
  const ratingMargin = (item.rating || 0) - (equippedItem?.rating || 0);
  const offensiveAffixCount = countMatchingStats(stats, OFFENSE_KEYS);
  const wishlistMatches = getWishlistMatches(item, wishlistAffixes);
  const craftVisual = getItemCraftVisual(item);
  const huntMatches = getHuntMatches(item, huntContext);
  const legendaryPower = getItemLegendaryPower(item);

  const highlights = [
    legendaryPower && { id: "enabler", label: "Build Enabler", tone: "enabler", priority: 980 },
    item.rarity === "legendary" && { id: "legendary", label: "Legendario", tone: "legendary", priority: 1000 },
    item.rarity === "epic" && { id: "epic", label: "Epico", tone: "epic", priority: 900 },
    perfectRollCount > 0 && { id: "perfect", label: perfectRollCount > 1 ? `${perfectRollCount} Perfect` : "Perfect Roll", tone: "perfect", priority: 850 },
    t1AffixCount > 0 && { id: "t1", label: t1AffixCount > 1 ? `${t1AffixCount}x T1` : "Affix T1", tone: "t1", priority: 760 },
    huntMatches.isMatch && {
      id: "hunt",
      label:
        huntMatches.familyMatch && huntMatches.matchingStats.length > 0
          ? "Caza Cumplida"
          : huntMatches.familyMatch
            ? "Drop Objetivo"
            : "Stat Objetivo",
      tone: "hunt",
      priority: 745 + (huntMatches.strength * 12),
    },
    wishlistMatches.length > 0 && { id: "wishlist", label: wishlistMatches.length > 1 ? `${wishlistMatches.length} Deseados` : "Wishlist", tone: "wishlist", priority: 720 },
    ratingMargin >= 8 && { id: "upgrade", label: "Upgrade", tone: "upgrade", priority: 650 },
    itemMatchesBuildTag(item, activeBuildTag) && { id: "build", label: "Sinergia", tone: "build", priority: 560 },
    offensiveAffixCount >= 2 && { id: "offense", label: "Ofensivo", tone: "offense", priority: 420 },
    craftVisual && { id: "craft", label: craftVisual.label, tone: craftVisual.tone, priority: craftVisual.tone === "masterwork" ? 810 : craftVisual.tone === "forged" ? 500 : 340 },
  ].filter(Boolean);

  return highlights.sort((a, b) => b.priority - a.priority);
}

function getAnnouncedHighlights(item, highlights = [], { hasActiveHuntObjectives = false } = {}) {
  const rarity = item?.rarity || "common";
  const isEpicPlus = rarity === "epic" || rarity === "legendary";
  const announceableIds = isEpicPlus
    ? new Set(["legendary", "epic"])
    : hasActiveHuntObjectives
      ? new Set(["wishlist"])
      : new Set();
  return highlights.filter(highlight => announceableIds.has(highlight.id));
}

export function summarizeLootEvent({ item, equippedItem = null, activeBuildTag = null, wishlistAffixes = [], huntContext = null }) {
  const highlights = getLootHighlights({ item, equippedItem, activeBuildTag, wishlistAffixes, huntContext });
  const topHighlight = highlights[0] || null;
  const hasActiveHuntObjectives = Array.isArray(wishlistAffixes) && wishlistAffixes.length > 0;
  const announcedHighlights = getAnnouncedHighlights(item, highlights, { hasActiveHuntObjectives });
  const announcedHighlight = announcedHighlights[0] || null;
  const perfectRollCount = (item?.affixes || []).filter(affix => affix.perfectRoll).length;
  const t1AffixCount = (item?.affixes || []).filter(affix => affix.tier === 1).length;
  const wishlistMatches = getWishlistMatches(item, wishlistAffixes);
  const craftVisual = getItemCraftVisual(item);
  const huntMatches = getHuntMatches(item, huntContext);
  const legendaryPower = getItemLegendaryPower(item);
  const rating = item?.rating || 0;
  const ratingMargin = rating - (equippedItem?.rating || 0);
  const score =
    ((RARITY_SCORE[item?.rarity] || 0) * 5000) +
    ((topHighlight?.priority || 0) * 6) +
    rating +
    (Math.max(0, ratingMargin) * 35) +
    (perfectRollCount * 1200) +
    (t1AffixCount * 700) +
    (legendaryPower ? 4200 : 0) +
    (huntMatches.isMatch ? (huntMatches.familyMatch ? 900 : 320) + (huntMatches.matchingStats.length * 180) : 0) +
    (wishlistMatches.length * 240) +
    (craftVisual?.tone === "masterwork" ? 800 : craftVisual?.tone === "forged" ? 280 : 0);

  return {
    id: `${item?.id || item?.itemId || "drop"}_${Date.now()}`,
    itemId: item?.id || item?.itemId || null,
    name: item?.name || "",
    rarity: item?.rarity || "common",
    rating,
    score,
    highlight: announcedHighlight,
    topHighlight,
    highlights,
    announcedHighlights,
    hasActiveHuntObjectives,
    perfectRollCount,
    t1AffixCount,
    affixSummaries: (item?.affixes || []).slice(0, 4).map(affix => ({
      stat: affix.stat,
      tier: affix.tier,
      perfectRoll: !!affix.perfectRoll,
      value: affix.rolledValue ?? affix.value ?? 0,
    })),
    wishlistMatches,
    huntMatches,
    legendaryPower,
    craftVisual,
    ratingMargin,
    timestamp: Date.now(),
  };
}
