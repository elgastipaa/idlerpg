export const CRAFTING_RULES_VERSION = 2;
export const ITEM_ENTROPY_COSTS = {
  upgrade: 4,
  polish: 10,
  reforge: 20,
  imbue: 35,
};

export const ENTROPY_CAP_BASE_BY_RARITY = {
  common: 20,
  magic: 38,
  rare: 90,
  epic: 90,
  legendary: 112,
};

const ENTROPY_CAP_CLAMP_BY_RARITY = {
  common: { min: 14, max: 34 },
  magic: { min: 30, max: 60 },
  rare: { min: 78, max: 116 },
  epic: { min: 78, max: 116 },
  legendary: { min: 96, max: 140 },
};

const LEGACY_ENTROPY_WEIGHTS = {
  rerollCount: 18,
  reforgeCount: 16,
  polishCount: 8,
  ascendCount: 24,
  level: 2,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sanitizeRarity(rarity = "common") {
  return ENTROPY_CAP_BASE_BY_RARITY[rarity] ? rarity : "common";
}

function getItemTierEntropyBonus(itemTier = 1) {
  const tier = Math.max(1, Math.floor(Number(itemTier || 1)));
  if (tier >= 17) return 16;
  if (tier >= 13) return 12;
  if (tier >= 9) return 8;
  if (tier >= 5) return 4;
  return 0;
}

function rollCapVariance(randomFn = Math.random) {
  return Math.floor(randomFn() * 11) - 4;
}

export function countExcellentAffixes(affixes = []) {
  return (Array.isArray(affixes) ? affixes : []).filter(affix => affix?.quality === "excellent").length;
}

export function calculateEntropyCap({
  rarity = "common",
  itemTier = 1,
  isBossDrop = false,
  excellentAffixCount = 0,
  variance = 0,
  randomizeVariance = false,
  randomFn = Math.random,
} = {}) {
  const safeRarity = sanitizeRarity(rarity);
  const base = ENTROPY_CAP_BASE_BY_RARITY[safeRarity] || ENTROPY_CAP_BASE_BY_RARITY.common;
  const clampRule = ENTROPY_CAP_CLAMP_BY_RARITY[safeRarity] || ENTROPY_CAP_CLAMP_BY_RARITY.common;
  const resolvedVariance = randomizeVariance ? rollCapVariance(randomFn) : Math.round(Number(variance || 0));
  const rawCap =
    base +
    getItemTierEntropyBonus(itemTier) +
    (isBossDrop ? 6 : 0) +
    Math.max(0, Math.floor(Number(excellentAffixCount || 0))) * 4 +
    resolvedVariance;

  return clamp(Math.round(rawCap), clampRule.min, clampRule.max);
}

export function estimateLegacyEntropy(crafting = {}, level = 0) {
  const legacyTotal =
    Math.max(0, Number(crafting?.rerollCount || 0)) * LEGACY_ENTROPY_WEIGHTS.rerollCount +
    Math.max(0, Number(crafting?.reforgeCount || 0)) * LEGACY_ENTROPY_WEIGHTS.reforgeCount +
    Math.max(0, Number(crafting?.polishCount || 0)) * LEGACY_ENTROPY_WEIGHTS.polishCount +
    Math.max(0, Number(crafting?.ascendCount || 0)) * LEGACY_ENTROPY_WEIGHTS.ascendCount +
    Math.min(10, Math.max(0, Number(level || 0))) * LEGACY_ENTROPY_WEIGHTS.level;

  return Math.round(legacyTotal * 0.6);
}

function normalizeLineCraftCounts(rawCounts = {}) {
  if (!rawCounts || typeof rawCounts !== "object") return {};
  return Object.fromEntries(
    Object.entries(rawCounts)
      .filter(([index]) => Number.isInteger(Number(index)))
      .map(([index, value]) => [
        String(index),
        {
          polish: Math.max(0, Math.floor(Number(value?.polish || 0))),
          reforge: Math.max(0, Math.floor(Number(value?.reforge || 0))),
        },
      ])
  );
}

function migrateLegacyLineCraftCounts(crafting = {}) {
  const migrated = normalizeLineCraftCounts(crafting?.lineCraftCounts);
  const polishCounts = crafting?.polishCountsByIndex;
  if (!polishCounts || typeof polishCounts !== "object") return migrated;

  for (const [index, count] of Object.entries(polishCounts)) {
    if (!Number.isInteger(Number(index))) continue;
    migrated[String(index)] = {
      polish: Math.max(0, Math.floor(Number(count || 0))),
      reforge: Math.max(0, Math.floor(Number(migrated[String(index)]?.reforge || 0))),
    };
  }

  return migrated;
}

export function normalizeItemCraftingState({
  item = {},
  crafting = null,
  rarity = item?.rarity || "common",
  itemTier = item?.itemTier || 1,
  level = item?.level || 0,
  affixes = item?.affixes || [],
  isBossDrop = false,
  isNewItem = false,
  randomFn = Math.random,
} = {}) {
  const rawCrafting = crafting || item?.crafting || {};
  const excellentAffixCount = countExcellentAffixes(affixes);
  const existingCap = Number(rawCrafting?.entropyCap);
  const entropyCap = Number.isFinite(existingCap) && existingCap > 0
    ? Math.round(existingCap)
    : calculateEntropyCap({
        rarity,
        itemTier,
        isBossDrop,
        excellentAffixCount,
        randomizeVariance: isNewItem,
        randomFn,
      });
  const existingEntropy = Number(rawCrafting?.entropy);
  const entropy = Number.isFinite(existingEntropy)
    ? Math.max(0, Math.round(existingEntropy))
    : isNewItem
      ? 0
      : Math.min(Math.max(0, entropyCap - 1), estimateLegacyEntropy(rawCrafting, level));
  const stabilized = Boolean(rawCrafting?.stabilized) || entropy >= entropyCap;

  return {
    ...rawCrafting,
    entropy,
    entropyCap,
    stabilized,
    craftingRulesVersion: Math.max(
      CRAFTING_RULES_VERSION,
      Math.floor(Number(rawCrafting?.craftingRulesVersion || 0))
    ),
    lastCraftAt: rawCrafting?.lastCraftAt || null,
    history: Array.isArray(rawCrafting?.history) ? rawCrafting.history.slice(-5) : [],
    lineCraftCounts: migrateLegacyLineCraftCounts(rawCrafting),
  };
}

export function getEntropyState(crafting = {}) {
  const entropy = Math.max(0, Number(crafting?.entropy || 0));
  const cap = Math.max(1, Number(crafting?.entropyCap || 1));
  if (crafting?.stabilized || entropy >= cap) return "stabilized";
  const ratio = entropy / cap;
  if (ratio >= 0.75) return "last_attempt";
  if (ratio >= 0.4) return "tense";
  return "flexible";
}

export function getEntropyCostForMode(mode = "") {
  return Math.max(0, Number(ITEM_ENTROPY_COSTS[mode] || 0));
}

export function canSpendEntropy(crafting = {}, mode = "") {
  const entropyCost = getEntropyCostForMode(mode);
  const entropy = Math.max(0, Number(crafting?.entropy || 0));
  const entropyCap = Math.max(1, Number(crafting?.entropyCap || 1));
  const stabilized = Boolean(crafting?.stabilized) || entropy >= entropyCap;
  if (stabilized) {
    return {
      ok: false,
      reason: "stabilized",
      entropy,
      entropyCap,
      entropyCost,
      entropyAfter: entropy,
      willStabilize: true,
    };
  }
  const entropyAfter = entropy + entropyCost;
  return {
    ok: true,
    reason: "ok",
    entropy,
    entropyCap,
    entropyCost,
    entropyAfter,
    willStabilize: entropyAfter >= entropyCap,
  };
}

export function applyEntropySpend(crafting = {}, mode = "") {
  const spend = canSpendEntropy(crafting, mode);
  if (!spend.ok) {
    return {
      nextCrafting: {
        ...crafting,
        stabilized: true,
        entropy: Math.max(0, Number(crafting?.entropy || 0)),
      },
      spend,
    };
  }
  return {
    nextCrafting: {
      ...crafting,
      entropy: spend.entropyAfter,
      stabilized: spend.willStabilize,
    },
    spend,
  };
}
