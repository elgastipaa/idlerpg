import { ITEMS, ITEM_RARITY_BLUEPRINT, ITEM_ROLL_RULES_V2 } from "../data/items";
import { ITEM_FAMILIES } from "../data/itemFamilies";
import { ensureAffixCountForRarity, rollAffixes } from "../engine/affixesEngine";
import { getLegendaryPowerById, isLegendaryContentUnlocked } from "./legendaryPowers";

const DROP_CONFIG = {
  base: 0.08,
  bossBonus: 0.3,
  luckScale: 0.0002,
  lootBonusScale: 0.2,
  cap: 0.55,
};

const RARITY_ORDER = ["legendary", "epic", "rare", "magic", "common"];

const RARITY_CONFIG = {
  legendary: { base: 0.00002, boss: 0.00025, tier: 0.00002, luck: 0.000003 },
  epic: { base: 0.0008, boss: 0.004, tier: 0.00018, luck: 0.00003 },
  rare: { base: 0.02, boss: 0.05, tier: 0.0012, luck: 0.00012 },
  magic: { base: 0.14, boss: 0.08, tier: 0.0025, luck: 0.00022 },
};

const RARITY_RANK = {
  common: 1,
  magic: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

const PERCENT_STATS = new Set([
  "critChance",
  "critDamage",
  "attackSpeed",
  "multiHitChance",
  "bleedChance",
  "bleedDamage",
  "fractureChance",
  "markChance",
  "markEffectPerStack",
  "lifesteal",
  "dodgeChance",
  "blockChance",
  "critOnLowHp",
  "xpBonus",
  "lootBonus",
  "goldBonusPct",
]);

export function normalizeLegacyStatKey(stat) {
  if (stat === "cooldownReduction") return "multiHitChance";
  if (stat === "skillPower") return "critDamage";
  return stat;
}

export function normalizeLegacyBonusMap(bonus = {}) {
  const normalized = {};
  for (const [rawKey, rawValue] of Object.entries(bonus || {})) {
    const key = normalizeLegacyStatKey(rawKey);
    const value = Number(rawValue || 0);
    if (!value) continue;
    normalized[key] = Math.round(((normalized[key] || 0) + value) * 100) / 100;
  }
  return normalized;
}

const RARE_AFFIX_UPGRADE_STEP_MULTIPLIERS = [1.09, 1.09, 1.18, 1.18];

function roundAffixStoredValue(value) {
  return Math.round(Number(value || 0) * 1000) / 1000;
}

function normalizeAffixBaseRange(range = {}) {
  const rawMin = range?.min ?? range?.value ?? 0;
  const rawMax = range?.max ?? range?.value ?? rawMin;
  return {
    min: roundAffixStoredValue(rawMin),
    max: roundAffixStoredValue(rawMax),
  };
}

function getAffixBaseSnapshot(affix = {}) {
  const normalizedBaseRange = normalizeAffixBaseRange(affix?.baseRange || affix?.range || {});
  const baseRolledValue = roundAffixStoredValue(
    affix?.baseRolledValue ?? affix?.baseValue ?? affix?.rolledValue ?? affix?.value ?? 0
  );
  const baseValue = roundAffixStoredValue(
    affix?.baseValue ?? affix?.baseRolledValue ?? affix?.value ?? affix?.rolledValue ?? baseRolledValue
  );

  return {
    baseValue,
    baseRolledValue,
    baseRange: normalizedBaseRange,
  };
}

export function getRareAffixUpgradeMultiplier(level = 0) {
  const targetLevel = Math.max(0, Math.min(10, Number(level || 0)));
  if (targetLevel <= 6) return 1;

  let multiplier = 1;
  for (let levelIndex = 7; levelIndex <= targetLevel; levelIndex += 1) {
    multiplier *= RARE_AFFIX_UPGRADE_STEP_MULTIPLIERS[levelIndex - 7] || 1;
  }

  return Math.round(multiplier * 10000) / 10000;
}

export function scaleAffixesForItemLevel(affixes = [], rarity = "common", level = 0) {
  const affixMultiplier = rarity === "rare" ? getRareAffixUpgradeMultiplier(level) : 1;

  return (affixes || []).map(affix => {
    const { baseValue, baseRolledValue, baseRange } = getAffixBaseSnapshot(affix);

    return {
      ...affix,
      baseValue,
      baseRolledValue,
      baseRange,
      value: roundAffixStoredValue(baseValue * affixMultiplier),
      rolledValue: roundAffixStoredValue(baseRolledValue * affixMultiplier),
      range: {
        min: roundAffixStoredValue((baseRange?.min || 0) * affixMultiplier),
        max: roundAffixStoredValue((baseRange?.max || 0) * affixMultiplier),
      },
      upgradeAffixMultiplier: affixMultiplier,
    };
  });
}

export function generateLoot({
  enemy = null,
  luck = 0,
  lootBonus = 0,
  favoredFamilies = [],
  favoredStats = [],
  discoveredPowerIds = [],
  powerMasteryMap = {},
  discoveredPowerBias = 0,
  powerHuntMultiplier = 1,
  preferredArchetypes = [],
  preferredPowerBias = 0.42,
  offArchetypeLegendaryPenalty = 0.86,
  favoredStatWeightMultiplier = 2.4,
  rarityFloor = null,
  rarityBonus = 0,
  abyss = {},
} = {}) {
  const tier = enemy?.tier || 1;
  let dropChance = DROP_CONFIG.base;

  if (enemy?.isBoss) dropChance += DROP_CONFIG.bossBonus;
  dropChance += luck * DROP_CONFIG.luckScale;
  dropChance += Math.max(0, lootBonus) * DROP_CONFIG.lootBonusScale;
  dropChance = Math.min(DROP_CONFIG.cap, dropChance);

  if (Math.random() > dropChance) return null;

  const rarity = rollRarity({ enemy, tier, luck, rarityFloor, rarityBonus });
  const baseItem = pickItemByRarity(rarity, favoredFamilies, enemy, {
    discoveredPowerIds,
    powerMasteryMap,
    discoveredPowerBias,
    powerHuntMultiplier,
    preferredArchetypes,
    preferredPowerBias,
    offArchetypeLegendaryPenalty,
    abyss,
  });
  if (!baseItem) return null;
  const family = getFamilyForBaseItem(baseItem);
  const resolvedFavoredStats = [
    ...new Set(
      [
        ...(favoredStats || []),
        ...((family?.preferredStats || [])),
      ].map(normalizeLegacyStatKey)
    ),
  ];
  const baseBonus = buildBaseBonusForItem({ baseItem, rarity, tier });
  const { implicitBonus } = getFamilyImplicit(baseItem, rarity);
  const existingStats = [
    ...Object.entries(baseBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => stat),
    ...Object.entries(implicitBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => stat),
  ];

  return materializeItem({
    baseItem,
    rarity,
    tier,
    baseBonusOverride: baseBonus,
    affixes: rollAffixes({
      rarity,
      itemTier: tier,
      favoredStats: resolvedFavoredStats,
      favoredStatWeightMultiplier,
      existingStats,
      allowExistingStatOverlap: (ITEM_ROLL_RULES_V2.allowBaseImplicitAffixOverlapRarities || []).includes(rarity),
      overlapPenalty: ITEM_ROLL_RULES_V2.overlapAffixWeightPenalty ?? 0.3,
      maxExistingStatOverlaps: ITEM_ROLL_RULES_V2.maxOverlapsWithBaseOrImplicit ?? 1,
    }),
  });
}

function rollRarity({ enemy, tier, luck, rarityFloor = null, rarityBonus = 0 }) {
  const isBoss = !!enemy?.isBoss;
  const roll = Math.random();
  let accumulated = 0;
  const minRank = rarityFloor ? (RARITY_RANK[rarityFloor] || 1) : 1;

  for (const rarity of ["legendary", "epic", "rare", "magic"]) {
    if (!ITEMS.some(item => item.rarity === rarity)) continue;
    const config = RARITY_CONFIG[rarity];
    const eligible = (RARITY_RANK[rarity] || 1) >= minRank;
    const rarityBonusValue =
      typeof rarityBonus === "number"
        ? rarityBonus
        : (rarityBonus?.[rarity] || 0);
    const earlyTierBonus =
      rarity === "rare"
        ? (tier <= 6 ? 0.004 + Math.max(0, tier - 3) * 0.0015 : 0)
        : rarity === "magic"
          ? (tier <= 4 ? 0.01 : 0)
          : 0;
    const chance =
      eligible
        ? config.base +
          (isBoss ? config.boss : 0) +
          Math.max(0, tier - 1) * config.tier +
          luck * config.luck +
          earlyTierBonus +
          rarityBonusValue
        : 0;

    accumulated += chance;
    if (roll <= accumulated) return rarity;
  }

  return minRank > 1 ? rarityFloor : "common";
}

function getDropBiasMultiplier(
  item,
  favoredFamilies = [],
  enemy = null,
  {
    discoveredPowerIds = [],
    powerMasteryMap = {},
    discoveredPowerBias = 0,
    powerHuntMultiplier = 1,
    preferredArchetypes = [],
    preferredPowerBias = 0.42,
    offArchetypeLegendaryPenalty = 0.86,
    abyss = {},
  } = {}
) {
  let multiplier = 1;
  const huntSources = item?.huntSources || {};
  const discoveredSet = new Set(discoveredPowerIds || []);
  const preferredArchetypeSet = new Set((preferredArchetypes || []).filter(Boolean));
  const targetedByEnemy =
    (enemy?.id && (huntSources.bosses || []).includes(enemy.id)) ||
    (enemy?.family && (huntSources.families || []).includes(enemy.family));
  const legendaryPower = item?.legendaryPowerId ? getLegendaryPowerById(item.legendaryPowerId) : null;
  const matchesPreferredPower =
    !legendaryPower?.archetype ||
    legendaryPower.archetype === "general" ||
    preferredArchetypeSet.has(legendaryPower.archetype);

  if (enemy?.id && (huntSources.bosses || []).includes(enemy.id)) {
    multiplier *= 8;
  } else if (enemy?.family && (huntSources.families || []).includes(enemy.family)) {
    multiplier *= 3.5;
  }

  if (targetedByEnemy && item?.legendaryPowerId && discoveredSet.has(item.legendaryPowerId)) {
    const masteryBias = Number(powerMasteryMap?.[item.legendaryPowerId]?.huntBias || 0);
    const totalBias = Math.max(0, discoveredPowerBias + masteryBias);
    if (totalBias > 0) {
      multiplier *= 1 + totalBias;
    }
  }

  if (targetedByEnemy && item?.legendaryPowerId) {
    multiplier *= Math.max(0.1, Number(powerHuntMultiplier || 1));
  }

  if (item?.legendaryPowerId && preferredArchetypeSet.size > 0) {
    if (matchesPreferredPower) {
      multiplier *= 1 + Math.max(0, Number(preferredPowerBias || 0));
    } else if (legendaryPower?.archetype && legendaryPower.archetype !== "general") {
      multiplier *= Math.max(0.4, Number(offArchetypeLegendaryPenalty || 1));
    }
  }

  if (favoredFamilies.length && favoredFamilies.includes(item.family)) {
    multiplier *= 1.8;
  }

  return multiplier;
}

function pickItemByRarity(rarity, favoredFamilies = [], enemy = null, options = {}) {
  const startIndex = Math.max(0, RARITY_ORDER.indexOf(rarity));

  for (let index = startIndex; index < RARITY_ORDER.length; index += 1) {
    const pool = ITEMS.filter(item => item.rarity === RARITY_ORDER[index] && isLegendaryContentUnlocked(item, options.abyss));
    if (!pool.length) continue;
    return pickWeightedItem(pool, item => (item.dropChance || 1) * getDropBiasMultiplier(item, favoredFamilies, enemy, options));
  }

  return null;
}

function pickWeightedItem(pool, getWeight = item => item.dropChance || 1) {
  const totalWeight = pool.reduce((sum, item) => sum + (getWeight(item) || 0), 0);
  let roll = Math.random() * totalWeight;

  for (const item of pool) {
    roll -= getWeight(item) || 0;
    if (roll <= 0) return item;
  }

  return pool[pool.length - 1];
}

function weightedPick(pool, getWeight = (entry) => entry.weight || 0) {
  const totalWeight = pool.reduce((sum, entry) => sum + Math.max(0, getWeight(entry) || 0), 0);
  if (totalWeight <= 0) return null;

  let roll = Math.random() * totalWeight;
  for (const entry of pool) {
    const weight = Math.max(0, getWeight(entry) || 0);
    if (roll < weight) return entry;
    roll -= weight;
  }
  return pool[pool.length - 1] || null;
}

function roundStatValue(stat, value) {
  if (PERCENT_STATS.has(normalizeLegacyStatKey(stat))) return Math.round(value * 1000) / 1000;
  return Math.round(value * 100) / 100;
}

function getTierScale(stat, tier = 1) {
  const delta = Math.max(0, (tier || 1) - 1);
  if (PERCENT_STATS.has(normalizeLegacyStatKey(stat))) return 1 + delta * 0.025;
  return 1 + delta * 0.1;
}

function rollStatFromRange(stat, range, tier = 1) {
  if (!range) return 0;
  const min = range.min ?? range[0] ?? range.value ?? 0;
  const max = range.max ?? range[1] ?? range.value ?? min;
  const raw = min === max ? min : min + Math.random() * (max - min);
  return roundStatValue(stat, raw * getTierScale(stat, tier));
}

function getBaseCountForRarity(rarity = "common") {
  return ITEM_RARITY_BLUEPRINT?.[rarity]?.baseCount || 1;
}

function getFamilyForBaseItem(baseItem) {
  const familyId = getItemFamilyId(baseItem);
  return familyId ? ITEM_FAMILIES[familyId] : null;
}

function addMissingBaseStats({
  family,
  baseBonus,
  requiredCount,
  tier,
}) {
  const result = normalizeLegacyBonusMap(baseBonus || {});
  const usedStats = new Set(Object.entries(result).filter(([, value]) => (value || 0) > 0).map(([stat]) => stat));
  const primaryStat = family?.primaryBase || null;

  if (primaryStat && !usedStats.has(primaryStat)) {
    const primaryRange = family?.primaryBaseRange || null;
    const primaryValue = rollStatFromRange(primaryStat, primaryRange, tier);
    if (primaryValue > 0) {
      result[primaryStat] = primaryValue;
      usedStats.add(primaryStat);
    }
  }

  const extras = [...(family?.extraBases || [])];
  while (usedStats.size < requiredCount && extras.length > 0) {
    const eligible = extras.filter(entry => !usedStats.has(entry.stat));
    if (!eligible.length) break;
    const picked = weightedPick(eligible, entry => entry.weight || 1);
    if (!picked?.stat) break;
    const rolled = rollStatFromRange(picked.stat, picked.range, tier);
    if (rolled > 0) {
      result[picked.stat] = rolled;
      usedStats.add(picked.stat);
    }
    const pickedIdx = extras.findIndex(entry => entry.stat === picked.stat);
    if (pickedIdx >= 0) extras.splice(pickedIdx, 1);
  }

  return result;
}

export function buildBaseBonusForItem({
  baseItem,
  rarity,
  tier = 1,
  existingBaseBonus = null,
  ensureMinBaseLines = false,
}) {
  const family = getFamilyForBaseItem(baseItem);
  const requiredCount = getBaseCountForRarity(rarity);
  const fallbackBase = normalizeLegacyBonusMap(baseItem?.bonus || {});
  const sourceBase = existingBaseBonus
    ? normalizeLegacyBonusMap(existingBaseBonus)
    : (family?.primaryBase ? {} : fallbackBase);

  if (!family?.primaryBase) return sourceBase;
  if (!ensureMinBaseLines && existingBaseBonus) return sourceBase;

  const rolled = addMissingBaseStats({
    family,
    baseBonus: sourceBase,
    requiredCount,
    tier,
  });

  return Object.keys(rolled).length ? rolled : fallbackBase;
}

function getAffixKind(affix) {
  if (affix.kind) return affix.kind;
  if (String(affix.id || "").startsWith("suffix_")) return "suffix";
  if (String(affix.id || "").startsWith("of_")) return "suffix";
  return "prefix";
}

function resolveBonusKey(affix) {
  if (affix.stat === "goldBonus" && affix.scaling === "percent") return "goldBonusPct";
  return normalizeLegacyStatKey(affix.stat);
}

export function mergeBonusMaps(...bonusMaps) {
  const merged = {};

  for (const bonusMap of bonusMaps) {
    for (const [key, value] of Object.entries(normalizeLegacyBonusMap(bonusMap || {}))) {
      merged[key] = Math.round(((merged[key] || 0) + value) * 100) / 100;
    }
  }

  return merged;
}

export function computeUpgradeBonus(baseBonus = {}, itemType = "weapon", level = 0) {
  const steps = Math.max(0, level || 0);
  if (steps <= 0) return {};

  const result = {};
  const buildCompoundBonus = (value, stepMultipliers = []) => {
    const baseValue = Math.max(0, Number(value || 0));
    if (baseValue <= 0) return 0;

    let totalMultiplier = 1;
    for (let index = 0; index < Math.min(steps, stepMultipliers.length); index += 1) {
      totalMultiplier *= stepMultipliers[index];
    }
    return Math.round((baseValue * totalMultiplier - baseValue) * 100) / 100;
  };

  const coreStepMultipliers =
    itemType === "weapon"
      ? [1.13, 1.13, 1.13, 1.13, 1.13, 1.18, 1.18, 1.18, 1.32, 1.32]
      : [1.125, 1.125, 1.125, 1.125, 1.125, 1.175, 1.175, 1.175, 1.3, 1.3];
  const healthStepMultipliers = [1.1, 1.1, 1.1, 1.1, 1.1, 1.145, 1.145, 1.145, 1.26, 1.26];

  if (itemType === "weapon" && (baseBonus.damage || 0) > 0) {
    result.damage = buildCompoundBonus(baseBonus.damage || 0, coreStepMultipliers);
  }

  if (itemType === "armor" && (baseBonus.defense || 0) > 0) {
    result.defense = buildCompoundBonus(baseBonus.defense || 0, coreStepMultipliers);
  }

  if ((baseBonus.healthMax || 0) > 0) {
    result.healthMax = buildCompoundBonus(baseBonus.healthMax || 0, healthStepMultipliers);
  }

  return Object.fromEntries(Object.entries(result).filter(([, value]) => value > 0));
}

export function computeImplicitUpgradeBonus(implicitBonus = {}, itemType = "weapon", level = 0) {
  const steps = Math.max(0, level || 0);
  if (steps <= 0 || !implicitBonus || typeof implicitBonus !== "object") return {};

  const stepMultipliers =
    itemType === "weapon"
      ? [1.08, 1.08, 1.08, 1.08, 1.08, 1.095, 1.095, 1.095, 1.21, 1.21]
      : [1.0845, 1.0845, 1.0845, 1.0845, 1.0845, 1.1007, 1.1007, 1.1007, 1.2248, 1.2248];
  let totalMultiplier = 1;
  for (let index = 0; index < Math.min(steps, stepMultipliers.length); index += 1) {
    totalMultiplier *= stepMultipliers[index];
  }

  return Object.fromEntries(
    Object.entries(implicitBonus)
      .map(([stat, value]) => {
        const baseValue = Math.max(0, Number(value || 0));
        const upgradedValue = baseValue * totalMultiplier;
        return [stat, Math.round((upgradedValue - baseValue) * 1000) / 1000];
      })
      .filter(([, value]) => value > 0)
  );
}

function getItemFamilyId(baseItem) {
  return baseItem?.family || null;
}

function getFamilyImplicit(baseItem, rarity) {
  const familyId = getItemFamilyId(baseItem);
  const family = familyId ? ITEM_FAMILIES[familyId] : null;
  return {
    familyId,
    familyName: family?.name || null,
    implicitBonus: normalizeLegacyBonusMap(family?.implicitByRarity?.[rarity] || {}),
  };
}

export function buildItemFromAffixes(baseItem, affixes) {
  let name = baseItem.name;
  const bonus = { ...(baseItem.bonus || {}) };

  const prefixes = affixes.filter(affix => getAffixKind(affix) === "prefix");
  const suffixes = affixes.filter(affix => getAffixKind(affix) === "suffix");

  for (const affix of prefixes) {
    const label = affix.tierLabel || affix.label;
    if (label) name = `${label} ${name}`;
    const value = affix.rolledValue ?? affix.value ?? 0;
    const bonusKey = resolveBonusKey(affix);
    bonus[bonusKey] = Math.round(((bonus[bonusKey] || 0) + value) * 100) / 100;
  }

  for (const affix of suffixes) {
    const label = affix.tierLabel || affix.label;
    if (label) name = `${name} ${label}`;
    const value = affix.rolledValue ?? affix.value ?? 0;
    const bonusKey = resolveBonusKey(affix);
    bonus[bonusKey] = Math.round(((bonus[bonusKey] || 0) + value) * 100) / 100;
  }

  return { name, bonus };
}

function getDropItemLevel() {
  return 0;
}

export function materializeItem({
  baseItem,
  rarity,
  tier = 1,
  affixes = [],
  baseBonusOverride = null,
  existingId = null,
  levelOverride = null,
  itemTierOverride = null,
  craftingOverride = null,
}) {
  if (!baseItem) return null;
  const resolvedTier = itemTierOverride || tier;
  const itemLevel = levelOverride ?? getDropItemLevel(resolvedTier);
  const resolvedBaseBonus = buildBaseBonusForItem({
    baseItem,
    rarity,
    tier: resolvedTier,
    existingBaseBonus: baseBonusOverride,
    ensureMinBaseLines: false,
  });
  const upgradeBonus = computeUpgradeBonus(resolvedBaseBonus || {}, baseItem.type, itemLevel);
  const { familyId, familyName, implicitBonus } = getFamilyImplicit(baseItem, rarity);
  const implicitUpgradeBonus = computeImplicitUpgradeBonus(implicitBonus, baseItem.type, itemLevel);
  const ensuredAffixes = ensureAffixCountForRarity({
    affixes,
    rarity,
    itemTier: resolvedTier,
    baseBonus: resolvedBaseBonus || {},
    implicitBonus,
  });
  const normalizedAffixes = scaleAffixesForItemLevel(ensuredAffixes, rarity, itemLevel);
  const implicitBaseItem = {
    ...baseItem,
    bonus: mergeBonusMaps(resolvedBaseBonus || {}, upgradeBonus, implicitBonus, implicitUpgradeBonus),
  };
  const { name, bonus } = buildItemFromAffixes(implicitBaseItem, normalizedAffixes);

  return {
    ...baseItem,
    id: existingId || `${baseItem.id}_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    itemId: baseItem.id,
    family: familyId,
    familyName,
    rarity,
    name,
    bonus,
    baseBonus: { ...(resolvedBaseBonus || {}) },
    upgradeBonus,
    implicitBonus,
    implicitUpgradeBonus,
    affixes: normalizedAffixes,
    itemTier: resolvedTier,
    level: itemLevel,
    crafting: {
      rerollCount: 0,
      polishCount: 0,
      reforgeCount: 0,
      ...(craftingOverride || {}),
    },
  };
}

export function normalizeStoredItem(item) {
  if (!item) return item;
  const baseItem = ITEMS.find(candidate => candidate.id === (item.itemId || item.id));
  if (!baseItem) return item;
  const storedItemTier = item.itemTier ?? 1;
  const normalizedAffixes = (item.affixes || []).map(affix => ({
    ...affix,
    stat: normalizeLegacyStatKey(affix?.stat),
    baseValue: affix?.baseValue,
    baseRolledValue: affix?.baseRolledValue,
    baseRange: affix?.baseRange,
  }));

  const normalized = materializeItem({
    baseItem,
    rarity: item.rarity || baseItem.rarity,
    tier: storedItemTier,
    affixes: normalizedAffixes,
    baseBonusOverride: normalizeLegacyBonusMap(item.baseBonus || baseItem.bonus || {}),
    existingId: item.id,
    levelOverride: item.level ?? null,
    itemTierOverride: storedItemTier,
    craftingOverride: item.crafting || null,
  });

  return {
    ...normalized,
    sellValue: item.sellValue || baseItem.sellValue,
    dropChance: item.dropChance || baseItem.dropChance,
    rating: item.rating,
  };
}
