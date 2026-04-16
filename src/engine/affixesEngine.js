import { ABYSS_PREFIXES, ABYSS_SUFFIXES, PREFIXES, SUFFIXES } from "../data/affixes";
import { ITEM_RARITY_BLUEPRINT, ITEM_ROLL_RULES_V2 } from "../data/items";
import { normalizeLegacyStatKey } from "../utils/loot";

const OVERLAP_ELIGIBLE_RARITIES = new Set(ITEM_ROLL_RULES_V2.allowBaseImplicitAffixOverlapRarities || []);
const REROLL_ANTI_STREAK = {
  affixIdMultiplier: 0.08,
  statMultiplier: 0.24,
};

const ALL_AFFIXES = [...PREFIXES, ...SUFFIXES, ...ABYSS_PREFIXES, ...ABYSS_SUFFIXES];
const TIER_WEIGHT_BY_ITEM_TIER = [
  { maxTier: 4, weights: { 1: 0.05, 2: 0.45, 3: 1.0 } },
  { maxTier: 8, weights: { 1: 0.2, 2: 0.7, 3: 1.0 } },
  { maxTier: 12, weights: { 1: 0.45, 2: 0.9, 3: 1.0 } },
  { maxTier: 16, weights: { 1: 0.75, 2: 1.0, 3: 0.85 } },
  { maxTier: Number.POSITIVE_INFINITY, weights: { 1: 1.0, 2: 0.95, 3: 0.7 } },
];

function weightedPick(pool, getWeight = candidate => candidate.weight || 0) {
  const totalWeight = pool.reduce((sum, candidate) => sum + getWeight(candidate), 0);
  if (totalWeight <= 0) return pool[0] || null;

  let roll = Math.random() * totalWeight;
  for (const candidate of pool) {
    const weight = getWeight(candidate);
    if (roll < weight) return candidate;
    roll -= weight;
  }

  return pool[0] || null;
}

function uniqueWeightedPick(pool, count, getWeight) {
  const remaining = [...pool];
  const result = [];
  while (remaining.length > 0 && result.length < count) {
    const picked = weightedPick(remaining, getWeight);
    if (!picked) break;
    result.push(picked);
    const index = remaining.findIndex(candidate => candidate.id === picked.id);
    if (index >= 0) remaining.splice(index, 1);
  }
  return result;
}

function rollWithinRange(range) {
  if (typeof range === "number") return range;
  if (range?.min == null || range?.max == null) return 0;
  return Math.random() * (range.max - range.min) + range.min;
}

function roundAffixValue(value) {
  return Math.round(value * 100) / 100;
}

function getAffixKind(affix) {
  if (affix.kind) return affix.kind;
  if (String(affix.id || "").startsWith("prefix_")) return "prefix";
  if (String(affix.id || "").startsWith("suffix_")) return "suffix";
  if (String(affix.id || "").startsWith("of_")) return "suffix";
  return "prefix";
}

function getTierEntries(affix) {
  return Object.entries(affix.tiers || {})
    .map(([tier, data]) => ({ tier: Number(tier), ...data }))
    .filter(entry => entry.weight > 0)
    .sort((a, b) => b.tier - a.tier);
}

function getAffixCountConfig(rarity = "common") {
  const affixCount = Math.max(0, ITEM_RARITY_BLUEPRINT?.[rarity]?.affixCount ?? 0);
  return {
    prefix: Math.ceil(affixCount / 2),
    suffix: Math.floor(affixCount / 2),
  };
}

function getTierWeightMultiplier(itemTier = 1, tier) {
  const bracket =
    TIER_WEIGHT_BY_ITEM_TIER.find(entry => itemTier <= entry.maxTier) ||
    TIER_WEIGHT_BY_ITEM_TIER[TIER_WEIGHT_BY_ITEM_TIER.length - 1];
  return bracket.weights?.[tier] ?? 1;
}

function pickTier(affix, itemTier = 1) {
  const tierPool = getTierEntries(affix);
  return weightedPick(tierPool, entry => entry.weight * getTierWeightMultiplier(itemTier, entry.tier));
}

function buildRolledAffix(affix, tierEntry) {
  const rolledValue = roundAffixValue(rollWithinRange(tierEntry.value));
  const min = tierEntry.value?.min ?? tierEntry.value ?? rolledValue;
  const max = tierEntry.value?.max ?? tierEntry.value ?? rolledValue;
  const highThreshold = min + (max - min) * 0.98;

  return {
    id: affix.id,
    stat: normalizeLegacyStatKey(affix.stat),
    scaling: affix.scaling,
    category: affix.category,
    kind: getAffixKind(affix),
    tier: tierEntry.tier,
    tierLabel: tierEntry.label,
    label: tierEntry.label,
    source: affix.source || "base",
    value: rolledValue,
    rolledValue,
    range: { min, max },
    baseValue: rolledValue,
    baseRolledValue: rolledValue,
    baseRange: { min, max },
    perfectRoll: tierEntry.tier === 1 && rolledValue >= highThreshold,
  };
}

function findAffixDefinition(affixId) {
  return ALL_AFFIXES.find(affix => affix.id === affixId) || null;
}

function filterByCategory(pool, usedCategories) {
  return pool.filter(affix => !usedCategories.has(affix.category));
}

function getAffixPoolWeight({
  affix,
  itemTier = 1,
  favoredStats = [],
  favoredStatWeightMultiplier = 2.4,
  disfavoredAffixIds = [],
  disfavoredStats = [],
  state,
  allowExistingStatOverlap = false,
  overlapPenalty = 0.3,
  maxExistingStatOverlaps = 1,
  disfavoredAffixIdWeightMultiplier = 1,
  disfavoredStatWeightMultiplier = 1,
}) {
  const normalizedStat = normalizeLegacyStatKey(affix.stat);
  const tiers = getTierEntries(affix);
  const baseWeight = tiers.reduce((sum, entry) => sum + entry.weight * getTierWeightMultiplier(itemTier, entry.tier), 0);
  const favoredBonus = favoredStats.includes(normalizedStat) ? favoredStatWeightMultiplier : 1;
  if (baseWeight <= 0) return 0;
  if (state.usedAffixIds.has(affix.id)) return 0;
  if (state.usedAffixStats.has(normalizedStat)) return 0;

  const overlapsExisting = state.existingStats.has(normalizedStat);
  if (overlapsExisting && !allowExistingStatOverlap) return 0;
  if (overlapsExisting && state.overlapCount >= maxExistingStatOverlaps) return 0;

  const overlapMultiplier = overlapsExisting ? Math.max(0, Math.min(1, overlapPenalty)) : 1;
  const disfavoredIdMultiplier = disfavoredAffixIds.includes(affix.id)
    ? Math.max(0, Math.min(1, disfavoredAffixIdWeightMultiplier))
    : 1;
  const disfavoredStatMultiplier = disfavoredStats.includes(normalizedStat)
    ? Math.max(0, Math.min(1, disfavoredStatWeightMultiplier))
    : 1;

  return baseWeight * favoredBonus * overlapMultiplier * disfavoredIdMultiplier * disfavoredStatMultiplier;
}

function rollSingleAffix(pool, state, options = {}) {
  const {
    itemTier = 1,
    favoredStats = [],
    favoredStatWeightMultiplier = 2.4,
    disfavoredAffixIds = [],
    disfavoredStats = [],
    allowExistingStatOverlap = false,
    overlapPenalty = 0.3,
    maxExistingStatOverlaps = 1,
    disfavoredAffixIdWeightMultiplier = 1,
    disfavoredStatWeightMultiplier = 1,
  } = options;
  const available = filterByCategory(pool, state.usedCategories);
  if (!available.length) return null;

  const pickedAffix = weightedPick(available, affix => getAffixPoolWeight({
    affix,
    itemTier,
    favoredStats,
    favoredStatWeightMultiplier,
    disfavoredAffixIds,
    disfavoredStats,
    state,
    allowExistingStatOverlap,
    overlapPenalty,
    maxExistingStatOverlaps,
    disfavoredAffixIdWeightMultiplier,
    disfavoredStatWeightMultiplier,
  }));
  if (!pickedAffix) return null;

  const tierEntry = pickTier(pickedAffix, itemTier);
  if (!tierEntry) return null;

  const normalizedStat = normalizeLegacyStatKey(pickedAffix.stat);
  state.usedCategories.add(pickedAffix.category);
  state.usedAffixIds.add(pickedAffix.id);
  state.usedAffixStats.add(normalizedStat);
  if (state.existingStats.has(normalizedStat)) {
    state.overlapCount += 1;
  }
  return buildRolledAffix(pickedAffix, tierEntry);
}

export function rollAffixes({
  rarity,
  itemTier = 1,
  favoredStats = [],
  favoredStatWeightMultiplier = 2.4,
  disfavoredAffixIds = [],
  disfavoredStats = [],
  existingStats = [],
  allowExistingStatOverlap = OVERLAP_ELIGIBLE_RARITIES.has(rarity),
  overlapPenalty = ITEM_ROLL_RULES_V2.overlapAffixWeightPenalty ?? 0.3,
  maxExistingStatOverlaps = ITEM_ROLL_RULES_V2.maxOverlapsWithBaseOrImplicit ?? 1,
  disfavoredAffixIdWeightMultiplier = 1,
  disfavoredStatWeightMultiplier = 1,
}) {
  const normalizedFavoredStats = (favoredStats || []).map(normalizeLegacyStatKey);
  const normalizedDisfavoredStats = (disfavoredStats || []).map(normalizeLegacyStatKey);
  const config = getAffixCountConfig(rarity);
  const state = {
    usedCategories: new Set(),
    usedAffixIds: new Set(),
    usedAffixStats: new Set(),
    existingStats: new Set((existingStats || []).map(normalizeLegacyStatKey)),
    overlapCount: 0,
  };
  const result = [];

  for (let index = 0; index < config.prefix; index += 1) {
    const rolled = rollSingleAffix(PREFIXES, state, {
      itemTier,
      favoredStats: normalizedFavoredStats,
      favoredStatWeightMultiplier,
      disfavoredAffixIds,
      disfavoredStats: normalizedDisfavoredStats,
      allowExistingStatOverlap,
      overlapPenalty,
      maxExistingStatOverlaps,
      disfavoredAffixIdWeightMultiplier,
      disfavoredStatWeightMultiplier,
    });
    if (rolled) result.push(rolled);
  }

  for (let index = 0; index < config.suffix; index += 1) {
    const rolled = rollSingleAffix(SUFFIXES, state, {
      itemTier,
      favoredStats: normalizedFavoredStats,
      favoredStatWeightMultiplier,
      disfavoredAffixIds,
      disfavoredStats: normalizedDisfavoredStats,
      allowExistingStatOverlap,
      overlapPenalty,
      maxExistingStatOverlaps,
      disfavoredAffixIdWeightMultiplier,
      disfavoredStatWeightMultiplier,
    });
    if (rolled) result.push(rolled);
  }

  return result;
}

export function ensureAffixCountForRarity({
  affixes = [],
  rarity = "common",
  itemTier = 1,
  baseBonus = {},
  implicitBonus = {},
  favoredStats = [],
} = {}) {
  const currentAffixes = [...(affixes || [])];
  const targetCount = Math.max(0, ITEM_RARITY_BLUEPRINT?.[rarity]?.affixCount ?? currentAffixes.length);
  if (currentAffixes.length >= targetCount) return currentAffixes;

  const existingStats = [
    ...Object.keys(baseBonus || {}).filter(stat => (baseBonus?.[stat] || 0) > 0),
    ...Object.keys(implicitBonus || {}).filter(stat => (implicitBonus?.[stat] || 0) > 0),
    ...currentAffixes.map(affix => affix?.stat).filter(Boolean),
  ];

  const rolledExtras = rollAffixes({
    rarity,
    itemTier,
    favoredStats: favoredStats.length > 0 ? favoredStats : currentAffixes.map(affix => affix?.stat).filter(Boolean),
    existingStats,
    allowExistingStatOverlap: OVERLAP_ELIGIBLE_RARITIES.has(rarity),
    overlapPenalty: ITEM_ROLL_RULES_V2.overlapAffixWeightPenalty ?? 0.3,
    maxExistingStatOverlaps: ITEM_ROLL_RULES_V2.maxOverlapsWithBaseOrImplicit ?? 1,
  });

  const nextAffixes = [...currentAffixes];
  for (const rolledAffix of rolledExtras) {
    if (!rolledAffix) continue;
    const duplicated = nextAffixes.some(
      affix => affix?.id === rolledAffix.id || normalizeLegacyStatKey(affix?.stat) === normalizeLegacyStatKey(rolledAffix?.stat)
    );
    if (duplicated) continue;
    nextAffixes.push(rolledAffix);
    if (nextAffixes.length >= targetCount) break;
  }

  return nextAffixes;
}

export function rerollAffixes(item, itemTier) {
  const previousAffixIds = (item?.affixes || []).map(affix => affix?.id).filter(Boolean);
  const previousAffixStats = (item?.affixes || []).map(affix => normalizeLegacyStatKey(affix?.stat)).filter(Boolean);
  const existingStats = [
    ...Object.entries(item?.baseBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => normalizeLegacyStatKey(stat)),
    ...Object.entries(item?.implicitBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => normalizeLegacyStatKey(stat)),
  ];

  return rollAffixes({
    rarity: item.rarity,
    itemTier,
    disfavoredAffixIds: previousAffixIds,
    disfavoredStats: previousAffixStats,
    existingStats,
    allowExistingStatOverlap: OVERLAP_ELIGIBLE_RARITIES.has(item.rarity),
    overlapPenalty: ITEM_ROLL_RULES_V2.overlapAffixWeightPenalty ?? 0.3,
    maxExistingStatOverlaps: ITEM_ROLL_RULES_V2.maxOverlapsWithBaseOrImplicit ?? 1,
    disfavoredAffixIdWeightMultiplier: REROLL_ANTI_STREAK.affixIdMultiplier,
    disfavoredStatWeightMultiplier: REROLL_ANTI_STREAK.statMultiplier,
  });
}

export function polishAffix(item, affixIndex) {
  const currentAffixes = item.affixes || [];
  const targetAffix = currentAffixes[affixIndex];
  if (!targetAffix?.id || !targetAffix?.tier) return currentAffixes;

  const definition = findAffixDefinition(targetAffix.id);
  const tierEntry = definition?.tiers?.[targetAffix.tier];
  if (!definition || !tierEntry) return currentAffixes;

  return currentAffixes.map((affix, index) => (
    index === affixIndex
      ? buildRolledAffix(definition, { tier: targetAffix.tier, ...tierEntry })
      : affix
  ));
}

export function generateReforgeOptions(item, affixIndex, optionCount = 2, favoredStats = [], extraPool = []) {
  const currentAffixes = item?.affixes || [];
  const targetAffix = currentAffixes[affixIndex];
  if (!targetAffix?.id) return [];

  const kind = getAffixKind(targetAffix);
  const extraKindPool = (extraPool || []).filter(affix => getAffixKind(affix) === kind);
  const pool = [...(kind === "suffix" ? SUFFIXES : PREFIXES), ...extraKindPool];
  const usedCategories = new Set(
    currentAffixes
      .filter((affix, index) => index !== affixIndex)
      .map(affix => affix.category)
  );
  const usedIds = new Set(
    currentAffixes
      .filter((affix, index) => index !== affixIndex)
      .map(affix => affix.id)
  );
  const usedStats = new Set(
    currentAffixes
      .filter((affix, index) => index !== affixIndex)
      .map(affix => normalizeLegacyStatKey(affix.stat))
  );
  const existingStats = new Set([
    ...Object.entries(item?.baseBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => normalizeLegacyStatKey(stat)),
    ...Object.entries(item?.implicitBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => normalizeLegacyStatKey(stat)),
  ]);
  const allowExistingStatOverlap = OVERLAP_ELIGIBLE_RARITIES.has(item?.rarity);
  const overlapPenalty = ITEM_ROLL_RULES_V2.overlapAffixWeightPenalty ?? 0.3;
  const maxExistingStatOverlaps = ITEM_ROLL_RULES_V2.maxOverlapsWithBaseOrImplicit ?? 1;
  const existingOverlapCount = currentAffixes
    .filter((affix, index) => index !== affixIndex)
    .filter(affix => existingStats.has(normalizeLegacyStatKey(affix.stat)))
    .length;

  const eligible = pool.filter(affix => {
    if (usedIds.has(affix.id)) return false;
    if (usedCategories.has(affix.category)) return false;
    if (usedStats.has(normalizeLegacyStatKey(affix.stat))) return false;
    if (affix.id === targetAffix.id) return false;
    if (!existingStats.has(normalizeLegacyStatKey(affix.stat))) return true;
    if (!allowExistingStatOverlap) return false;
    return existingOverlapCount < maxExistingStatOverlaps;
  });
  const itemTier = item?.itemTier || item?.level || 1;
  const chosen = uniqueWeightedPick(eligible, optionCount, affix => {
    const weight = getAffixPoolWeight({
      affix,
      itemTier,
      favoredStats,
      state: {
        usedAffixIds: new Set(),
        usedAffixStats: usedStats,
        existingStats,
        overlapCount: existingOverlapCount,
      },
      allowExistingStatOverlap,
      overlapPenalty,
      maxExistingStatOverlaps,
    });
    return weight;
  });

  return chosen
    .map(affix => {
      const tierEntry = pickTier(affix, itemTier);
      if (!tierEntry) return null;
      return buildRolledAffix(affix, tierEntry);
    })
    .filter(Boolean);
}

export function upgradeAffixes(affixes, factor = 1.1) {
  return affixes.map(affix => {
    const nextValue = roundAffixValue((affix.rolledValue ?? affix.value ?? 0) * factor);
    return {
      ...affix,
      value: nextValue,
      rolledValue: nextValue,
      perfectRoll: !!affix.perfectRoll,
    };
  });
}

export function addAffix(item) {
  const usedCategories = new Set((item.affixes || []).map(affix => affix.category));
  const usedIds = new Set((item.affixes || []).map(affix => affix.id));
  const usedStats = new Set((item.affixes || []).map(affix => normalizeLegacyStatKey(affix.stat)));
  const existingStats = new Set([
    ...Object.entries(item?.baseBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => normalizeLegacyStatKey(stat)),
    ...Object.entries(item?.implicitBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => normalizeLegacyStatKey(stat)),
  ]);
  const allowExistingStatOverlap = OVERLAP_ELIGIBLE_RARITIES.has(item?.rarity);
  const overlapPenalty = ITEM_ROLL_RULES_V2.overlapAffixWeightPenalty ?? 0.3;
  const maxExistingStatOverlaps = ITEM_ROLL_RULES_V2.maxOverlapsWithBaseOrImplicit ?? 1;
  const existingOverlapCount = (item.affixes || []).filter(affix => existingStats.has(normalizeLegacyStatKey(affix.stat))).length;
  const pool = ALL_AFFIXES.filter(affix => {
    if (usedIds.has(affix.id)) return false;
    if (usedCategories.has(affix.category)) return false;
    if (usedStats.has(normalizeLegacyStatKey(affix.stat))) return false;
    if (!existingStats.has(normalizeLegacyStatKey(affix.stat))) return true;
    if (!allowExistingStatOverlap) return false;
    return existingOverlapCount < maxExistingStatOverlaps;
  });
  if (!pool.length) return item.affixes || [];

  const pickedAffix = weightedPick(pool, affix => {
    const tiers = getTierEntries(affix);
    const baseWeight = tiers.reduce((sum, entry) => sum + entry.weight, 0);
    if (existingStats.has(normalizeLegacyStatKey(affix.stat))) return baseWeight * overlapPenalty;
    return baseWeight;
  });
  if (!pickedAffix) return item.affixes || [];

  const tierEntry = pickTier(pickedAffix, item.itemTier || item.level || 1);
  if (!tierEntry) return item.affixes || [];

  return [...(item.affixes || []), buildRolledAffix(pickedAffix, tierEntry)];
}

export function mergeAffixes(affixesA, affixesB) {
  const merged = {};

  [...affixesA, ...affixesB].forEach(affix => {
    const key = normalizeLegacyStatKey(affix.stat);
    const currentValue = affix.rolledValue ?? affix.value ?? 0;
    const previousValue = merged[key]?.rolledValue ?? merged[key]?.value ?? -Infinity;
    if (!merged[key] || currentValue > previousValue) {
      merged[key] = affix;
    }
  });

  return Object.values(merged);
}
