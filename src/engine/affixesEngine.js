import { ABYSS_PREFIXES, ABYSS_SUFFIXES, PREFIXES, SUFFIXES } from "../data/affixes";
import { ITEM_RARITY_BLUEPRINT, ITEM_ROLL_RULES_V2 } from "../data/items";
import { normalizeLegacyStatKey } from "../utils/loot";

const OVERLAP_ELIGIBLE_RARITIES = new Set(ITEM_ROLL_RULES_V2.allowBaseImplicitAffixOverlapRarities || []);

const ALL_AFFIXES = [...PREFIXES, ...SUFFIXES, ...ABYSS_PREFIXES, ...ABYSS_SUFFIXES];
const TIER_WEIGHT_BY_ITEM_TIER = [
  { maxTier: 4, weights: { 1: 0.05, 2: 0.45, 3: 1.0 } },
  { maxTier: 8, weights: { 1: 0.2, 2: 0.7, 3: 1.0 } },
  { maxTier: 12, weights: { 1: 0.45, 2: 0.9, 3: 1.0 } },
  { maxTier: 16, weights: { 1: 0.75, 2: 1.0, 3: 0.85 } },
  { maxTier: Number.POSITIVE_INFINITY, weights: { 1: 1.0, 2: 0.95, 3: 0.7 } },
];
const EXCELLENT_CHANCE_BY_RARITY = {
  common: 0,
  magic: 0.09,
  rare: 0.05,
  epic: 0.05,
  legendary: 0.07,
};

function weightedPick(pool, getWeight = candidate => candidate.weight || 0, randomFn = Math.random) {
  const totalWeight = pool.reduce((sum, candidate) => sum + getWeight(candidate), 0);
  if (totalWeight <= 0) return pool[0] || null;

  let roll = randomFn() * totalWeight;
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

function rollWithinRange(range, randomFn = Math.random) {
  if (typeof range === "number") return range;
  if (range?.min == null || range?.max == null) return 0;
  return randomFn() * (range.max - range.min) + range.min;
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

function getAffixCategory(affix = {}) {
  const existingCategory = String(affix?.category || "");
  if (existingCategory.startsWith("abyss_")) return existingCategory;

  const normalizedStat = normalizeLegacyStatKey(affix?.stat);
  const affixId = String(affix?.id || "");

  switch (normalizedStat) {
    case "damage":
      return "offense_damage_flat";
    case "damageOnKill":
      return "offense_execute";
    case "critChance":
      return "offense_precision";
    case "critDamage":
      return affixId.includes("skill_power") ? "utility_arcana" : "offense_crit_power";
    case "attackSpeed":
      return "offense_speed";
    case "multiHitChance":
      return affixId.includes("cooldown") ? "utility_combo" : "offense_combo";
    case "markChance":
      return "offense_mark";
    case "markEffectPerStack":
      return "offense_mark_power";
    case "bleedChance":
      return "offense_bleed";
    case "bleedDamage":
      return "offense_bleed_power";
    case "fractureChance":
      return "offense_fracture";
    case "lifesteal":
      return "offense_leech";
    case "critOnLowHp":
      return "offense_execute_crit";
    case "thorns":
      return "offense_retaliation";
    case "defense":
      return "defense_armor";
    case "healthMax":
      return "defense_vitality";
    case "healthRegen":
      return "defense_regen";
    case "dodgeChance":
      return "defense_evasion";
    case "blockChance":
      return "defense_guard";
    case "goldBonus":
      return "economy_gold";
    case "goldBonusPct":
      return "economy_gold_pct";
    case "xpBonus":
      return "economy_xp";
    case "essenceBonus":
      return "economy_essence";
    case "lootBonus":
      return "economy_loot";
    case "luck":
      return "economy_luck";
    default:
      return existingCategory || `${getAffixKind(affix)}_${normalizedStat || "misc"}`;
  }
}

function normalizeRange(range = null) {
  if (!range) return null;
  if (typeof range === "number") {
    return { min: roundAffixValue(range), max: roundAffixValue(range) };
  }
  const min = Number(range?.min ?? range?.value ?? 0);
  const max = Number(range?.max ?? range?.value ?? min);
  return {
    min: roundAffixValue(Math.min(min, max)),
    max: roundAffixValue(Math.max(min, max)),
  };
}

function mergeRanges(ranges = []) {
  const valid = ranges.filter(entry => entry && Number.isFinite(entry.min) && Number.isFinite(entry.max));
  if (!valid.length) return null;
  return {
    min: Math.min(...valid.map(entry => entry.min)),
    max: Math.max(...valid.map(entry => entry.max)),
  };
}

function deriveAffixRanges(affix = {}, fallbackRange = null) {
  const tiers = affix?.tiers || {};
  const tier1 = normalizeRange(tiers?.[1]?.value ?? null);
  const tier2 = normalizeRange(tiers?.[2]?.value ?? null);
  const tier3 = normalizeRange(tiers?.[3]?.value ?? null);
  const fallback = normalizeRange(fallbackRange);
  const normalRange = mergeRanges([tier3, tier2]) || tier3 || tier2 || tier1 || fallback;
  const excellentRange = tier1 || normalRange || fallback;
  return { normalRange, excellentRange };
}

function resolveAffixQuality(affix = {}) {
  if (affix?.quality === "excellent") return "excellent";
  if (Number(affix?.legacyTier || affix?.tier || 0) === 1) return "excellent";
  if (affix?.lootOnlyQuality) return "excellent";
  return "normal";
}

function getTierEntries(affix, { includeExcellent = true } = {}) {
  return Object.entries(affix.tiers || {})
    .map(([tier, data]) => ({ tier: Number(tier), ...data }))
    .filter(entry => entry.weight > 0 && (includeExcellent || entry.tier !== 1))
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

function getExcellentChance({ rarity = "common", itemTier = 1, isBossDrop = false } = {}) {
  const tier = Math.max(1, Number(itemTier || 1));
  const tierBonus = tier >= 16 ? 0.02 : tier >= 9 ? 0.01 : 0;
  const bossBonus = isBossDrop ? 0.02 : 0;
  return Math.max(0, Math.min(0.12, (EXCELLENT_CHANCE_BY_RARITY[rarity] || 0) + tierBonus + bossBonus));
}

function shouldRollExcellent({ rarity = "common", itemTier = 1, isBossDrop = false, randomFn = Math.random } = {}) {
  return randomFn() < getExcellentChance({ rarity, itemTier, isBossDrop });
}

function pickTier(affix, itemTier = 1, randomFn = Math.random, { quality = "normal" } = {}) {
  if (quality === "excellent") {
    const excellentTier = getTierEntries(affix).find(entry => entry.tier === 1);
    if (excellentTier) return excellentTier;
  }
  const tierPool = getTierEntries(affix, { includeExcellent: false });
  const fallbackPool = tierPool.length > 0 ? tierPool : getTierEntries(affix);
  return weightedPick(fallbackPool, entry => entry.weight * getTierWeightMultiplier(itemTier, entry.tier), randomFn);
}

function buildRolledAffix(affix, tierEntry, randomFn = Math.random, { quality = null } = {}) {
  const rolledValue = roundAffixValue(rollWithinRange(tierEntry.value, randomFn));
  const min = tierEntry.value?.min ?? tierEntry.value ?? rolledValue;
  const max = tierEntry.value?.max ?? tierEntry.value ?? rolledValue;
  const resolvedQuality = quality || (tierEntry.tier === 1 ? "excellent" : "normal");

  return {
    id: affix.id,
    stat: normalizeLegacyStatKey(affix.stat),
    scaling: affix.scaling,
    category: getAffixCategory(affix),
    kind: getAffixKind(affix),
    legacyTier: tierEntry.tier,
    quality: resolvedQuality,
    qualityLabel: resolvedQuality === "excellent" ? "Excelente" : "Normal",
    lootOnlyQuality: resolvedQuality === "excellent",
    source: affix.source || "base",
    value: rolledValue,
    rolledValue,
    range: { min, max },
    baseValue: rolledValue,
    baseRolledValue: rolledValue,
    baseRange: { min, max },
  };
}

function findAffixDefinition(affixId) {
  return ALL_AFFIXES.find(affix => affix.id === affixId) || null;
}

function filterByCategory(pool, usedCategories) {
  return pool.filter(affix => !usedCategories.has(getAffixCategory(affix)));
}

function getAffixPoolWeight({
  affix,
  itemTier = 1,
  favoredStats = [],
  favoredStatWeights = {},
  favoredStatWeightMultiplier = 2.4,
  state,
  allowExistingStatOverlap = false,
  overlapPenalty = 0.3,
  maxExistingStatOverlaps = 1,
}) {
  const normalizedStat = normalizeLegacyStatKey(affix.stat);
  const tiers = getTierEntries(affix);
  const baseWeight = tiers.reduce((sum, entry) => sum + entry.weight * getTierWeightMultiplier(itemTier, entry.tier), 0);
  const explicitWeight = Math.max(0, Number(favoredStatWeights?.[normalizedStat] || 0));
  const favoredBonus = explicitWeight > 0
    ? explicitWeight
    : (favoredStats.includes(normalizedStat) ? favoredStatWeightMultiplier : 1);
  if (baseWeight <= 0) return 0;
  if (state.usedAffixIds.has(affix.id)) return 0;
  if (state.usedAffixStats.has(normalizedStat)) return 0;

  const overlapsExisting = state.existingStats.has(normalizedStat);
  if (overlapsExisting && !allowExistingStatOverlap) return 0;
  if (overlapsExisting && state.overlapCount >= maxExistingStatOverlaps) return 0;

  const overlapMultiplier = overlapsExisting ? Math.max(0, Math.min(1, overlapPenalty)) : 1;
  return baseWeight * favoredBonus * overlapMultiplier;
}

function rollSingleAffix(pool, state, options = {}) {
  const {
    itemTier = 1,
    favoredStats = [],
    favoredStatWeights = {},
    favoredStatWeightMultiplier = 2.4,
    allowExistingStatOverlap = false,
    overlapPenalty = 0.3,
    maxExistingStatOverlaps = 1,
    rarity = "common",
    isBossDrop = false,
    allowExcellentQuality = false,
    randomFn = Math.random,
  } = options;
  const available = filterByCategory(pool, state.usedCategories);
  if (!available.length) return null;

  const pickedAffix = weightedPick(available, affix => getAffixPoolWeight({
    affix,
    itemTier,
    favoredStats,
    favoredStatWeights,
    favoredStatWeightMultiplier,
    state,
    allowExistingStatOverlap,
    overlapPenalty,
    maxExistingStatOverlaps,
  }), randomFn);
  if (!pickedAffix) return null;

  const quality = allowExcellentQuality && shouldRollExcellent({ rarity, itemTier, isBossDrop, randomFn })
    ? "excellent"
    : "normal";
  const tierEntry = pickTier(pickedAffix, itemTier, randomFn, { quality });
  if (!tierEntry) return null;
  const resolvedQuality = quality === "excellent" && tierEntry.tier === 1 ? "excellent" : "normal";

  const normalizedStat = normalizeLegacyStatKey(pickedAffix.stat);
  state.usedCategories.add(getAffixCategory(pickedAffix));
  state.usedAffixIds.add(pickedAffix.id);
  state.usedAffixStats.add(normalizedStat);
  if (state.existingStats.has(normalizedStat)) {
    state.overlapCount += 1;
  }
  return buildRolledAffix(pickedAffix, tierEntry, randomFn, { quality: resolvedQuality });
}

export function rollAffixes({
  rarity,
  itemTier = 1,
  favoredStats = [],
  favoredStatWeights = {},
  favoredStatWeightMultiplier = 2.4,
  existingStats = [],
  allowExistingStatOverlap = OVERLAP_ELIGIBLE_RARITIES.has(rarity),
  overlapPenalty = ITEM_ROLL_RULES_V2.overlapAffixWeightPenalty ?? 0.3,
  maxExistingStatOverlaps = ITEM_ROLL_RULES_V2.maxOverlapsWithBaseOrImplicit ?? 1,
  isBossDrop = false,
  allowExcellentQuality = false,
  randomFn = Math.random,
}) {
  const normalizedFavoredStats = (favoredStats || []).map(normalizeLegacyStatKey);
  const normalizedFavoredStatWeights = Object.fromEntries(
    Object.entries(favoredStatWeights || {})
      .map(([stat, weight]) => [normalizeLegacyStatKey(stat), Math.max(0, Number(weight || 0))])
      .filter(([, weight]) => weight > 0)
  );
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
      favoredStatWeights: normalizedFavoredStatWeights,
      favoredStatWeightMultiplier,
      allowExistingStatOverlap,
      overlapPenalty,
      maxExistingStatOverlaps,
      rarity,
      isBossDrop,
      allowExcellentQuality,
      randomFn,
    });
    if (rolled) result.push(rolled);
  }

  for (let index = 0; index < config.suffix; index += 1) {
    const rolled = rollSingleAffix(SUFFIXES, state, {
      itemTier,
      favoredStats: normalizedFavoredStats,
      favoredStatWeights: normalizedFavoredStatWeights,
      favoredStatWeightMultiplier,
      allowExistingStatOverlap,
      overlapPenalty,
      maxExistingStatOverlaps,
      rarity,
      isBossDrop,
      allowExcellentQuality,
      randomFn,
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
  favoredStatWeights = {},
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
    favoredStatWeights,
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
  const existingStats = [
    ...Object.entries(item?.baseBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => normalizeLegacyStatKey(stat)),
    ...Object.entries(item?.implicitBonus || {}).filter(([, value]) => (value || 0) > 0).map(([stat]) => normalizeLegacyStatKey(stat)),
  ];

  return rollAffixes({
    rarity: item.rarity,
    itemTier,
    existingStats,
    allowExistingStatOverlap: OVERLAP_ELIGIBLE_RARITIES.has(item.rarity),
    overlapPenalty: ITEM_ROLL_RULES_V2.overlapAffixWeightPenalty ?? 0.3,
    maxExistingStatOverlaps: ITEM_ROLL_RULES_V2.maxOverlapsWithBaseOrImplicit ?? 1,
  });
}

export function polishAffix(item, affixIndex) {
  const currentAffixes = item.affixes || [];
  const targetAffix = currentAffixes[affixIndex];
  if (!targetAffix?.id) return currentAffixes;

  const definition = findAffixDefinition(targetAffix.id);
  if (!definition) return currentAffixes;
  const quality = resolveAffixQuality(targetAffix);
  const { normalRange, excellentRange } = deriveAffixRanges(
    definition,
    targetAffix?.baseRange || targetAffix?.range || null
  );
  const selectedRange = quality === "excellent" ? (excellentRange || normalRange) : (normalRange || excellentRange);
  if (!selectedRange) return currentAffixes;
  const rolledValue = roundAffixValue(rollWithinRange(selectedRange));

  return currentAffixes.map((affix, index) => (
    index !== affixIndex
      ? affix
      : {
          ...affix,
          id: definition.id,
          stat: normalizeLegacyStatKey(definition.stat),
          scaling: definition.scaling || affix.scaling,
          category: getAffixCategory(definition),
          kind: getAffixKind(definition),
          quality,
          qualityLabel: quality === "excellent" ? "Excelente" : "Normal",
          lootOnlyQuality: quality === "excellent" ? true : Boolean(affix?.lootOnlyQuality),
          source: definition.source || affix.source || "base",
          legacyTier:
            Number(affix?.legacyTier || affix?.tier || 0) > 0
              ? Number(affix?.legacyTier || affix?.tier || 0)
              : (quality === "excellent" ? 1 : 2),
          value: rolledValue,
          rolledValue,
          range: { ...selectedRange },
          baseValue: rolledValue,
          baseRolledValue: rolledValue,
          baseRange: { ...selectedRange },
        }
  ));
}

export function generateReforgeOptions(item, affixIndex, optionCount = 2, favoredStats = [], extraPool = []) {
  const currentAffixes = item?.affixes || [];
  const targetAffix = currentAffixes[affixIndex];
  if (!targetAffix?.id) return [];
  const targetStat = normalizeLegacyStatKey(targetAffix.stat);

  const kind = getAffixKind(targetAffix);
  const extraKindPool = (extraPool || []).filter(affix => getAffixKind(affix) === kind);
  const pool = [...(kind === "suffix" ? SUFFIXES : PREFIXES), ...extraKindPool];
  const usedCategories = new Set(
    currentAffixes
      .filter((affix, index) => index !== affixIndex)
      .map(affix => getAffixCategory(affix))
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
    const normalizedStat = normalizeLegacyStatKey(affix.stat);
    if (usedIds.has(affix.id)) return false;
    if (usedCategories.has(getAffixCategory(affix))) return false;
    if (usedStats.has(normalizedStat)) return false;
    if (affix.id === targetAffix.id) return false;
    if (normalizedStat === targetStat) return false;
    if (!existingStats.has(normalizedStat)) return true;
    if (!allowExistingStatOverlap) return false;
    return existingOverlapCount < maxExistingStatOverlaps;
  });
  const itemTier = item?.itemTier || item?.level || 1;
  const chosen = [];
  const chosenStats = new Set();
  const remaining = [...eligible];
  while (remaining.length > 0 && chosen.length < optionCount) {
    const picked = weightedPick(remaining, affix => {
      const weight = getAffixPoolWeight({
        affix,
        itemTier,
        favoredStats,
        state: {
          usedAffixIds: new Set(),
          usedAffixStats: new Set([...usedStats, ...chosenStats]),
          existingStats,
          overlapCount: existingOverlapCount,
        },
        allowExistingStatOverlap,
        overlapPenalty,
        maxExistingStatOverlaps,
      });
      return weight;
    });
    if (!picked) break;
    const pickedStat = normalizeLegacyStatKey(picked.stat);
    chosen.push(picked);
    chosenStats.add(pickedStat);
    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      const candidate = remaining[index];
      if (!candidate) continue;
      if (candidate.id === picked.id || normalizeLegacyStatKey(candidate.stat) === pickedStat) {
        remaining.splice(index, 1);
      }
    }
  }

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
  const usedCategories = new Set((item.affixes || []).map(affix => getAffixCategory(affix)));
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
    if (usedCategories.has(getAffixCategory(affix))) return false;
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
