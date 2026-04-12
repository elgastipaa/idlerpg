export const ASCEND_BASE_COSTS = {
  common: { gold: 2500, essence: 40, minLevel: 2 },
  magic: { gold: 9000, essence: 120, minLevel: 4 },
  rare: { gold: 28000, essence: 320, minLevel: 6 },
  epic: { gold: 90000, essence: 900, minLevel: 8 },
};

export const ESSENCE_COST_MULTIPLIERS = {
  reroll: 2.8,
  polish: 6.0,
  reforge: 7.0,
  ascend: 4.5,
};

function scaleEssenceCost(value, multiplier) {
  return Math.max(1, Math.round((value || 0) * multiplier));
}

export const ASCEND_COSTS = Object.fromEntries(
  Object.entries(ASCEND_BASE_COSTS).map(([rarity, rules]) => [
    rarity,
    {
      ...rules,
      essence: scaleEssenceCost(rules.essence, ESSENCE_COST_MULTIPLIERS.ascend),
    },
  ])
);

export const CRAFTING_BASE_COSTS = {
  reroll: { gold: 1500, essence: scaleEssenceCost(25, ESSENCE_COST_MULTIPLIERS.reroll) },
  polish: { gold: 1000, essence: scaleEssenceCost(15, ESSENCE_COST_MULTIPLIERS.polish) },
  reforge: { gold: 3200, essence: scaleEssenceCost(50, ESSENCE_COST_MULTIPLIERS.reforge) },
};

export const REROLL_RARITY_MULTIPLIER = {
  common: 0.75,
  magic: 1,
  rare: 2.2,
  epic: 4.5,
  legendary: 8,
};

export const POLISH_RARITY_MULTIPLIER = {
  common: 0.75,
  magic: 1,
  rare: 2,
  epic: 3.8,
  legendary: 6.5,
};

export const REFORGE_RARITY_MULTIPLIER = {
  common: 1,
  magic: 1.35,
  rare: 2.8,
  epic: 5.2,
  legendary: 9,
};

const TARGETED_AFFIX_TIER_MULTIPLIER = {
  1: 1.75,
  2: 1.3,
  3: 1,
};

function getCraftingState(item) {
  return {
    rerollCount: item?.crafting?.rerollCount || 0,
    polishCount: item?.crafting?.polishCount || 0,
    reforgeCount: item?.crafting?.reforgeCount || 0,
  };
}

function getReduction(player, key) {
  return Math.max(0, Math.min(0.65, player?.prestigeBonuses?.[key] || 0));
}

function getTargetedTierMultiplier(affix) {
  return TARGETED_AFFIX_TIER_MULTIPLIER[affix?.tier || 3] || 1;
}

export function getRerollCosts(item, player = {}) {
  const craftingState = getCraftingState(item);
  const rarityMult = REROLL_RARITY_MULTIPLIER[item?.rarity] || 1;
  const reduction = getReduction(player, "rerollCostReduction");
  return {
    gold: Math.floor(
      CRAFTING_BASE_COSTS.reroll.gold *
      rarityMult *
      (1 + craftingState.rerollCount * 0.45) *
      (1 - reduction)
    ),
    essence: Math.floor(
      CRAFTING_BASE_COSTS.reroll.essence *
      rarityMult *
      (1 + craftingState.rerollCount * 0.35) *
      (1 - reduction)
    ),
  };
}

export function getPolishCosts(item, player = {}, affix = null) {
  const craftingState = getCraftingState(item);
  const rarityMult = POLISH_RARITY_MULTIPLIER[item?.rarity] || 1;
  const reduction = getReduction(player, "polishCostReduction");
  const tierMult = getTargetedTierMultiplier(affix);
  return {
    gold: Math.floor(
      CRAFTING_BASE_COSTS.polish.gold *
      rarityMult *
      tierMult *
      (1 + craftingState.polishCount * 0.45) *
      (1 - reduction)
    ),
    essence: Math.floor(
      CRAFTING_BASE_COSTS.polish.essence *
      rarityMult *
      tierMult *
      (1 + craftingState.polishCount * 0.35) *
      (1 - reduction)
    ),
  };
}

export function getReforgeCosts(item, player = {}, affix = null) {
  const craftingState = getCraftingState(item);
  const rarityMult = REFORGE_RARITY_MULTIPLIER[item?.rarity] || 1;
  const reduction = getReduction(player, "reforgeCostReduction");
  const tierMult = getTargetedTierMultiplier(affix);
  return {
    gold: Math.floor(
      CRAFTING_BASE_COSTS.reforge.gold *
      rarityMult *
      tierMult *
      (1 + craftingState.reforgeCount * 0.65) *
      (1 - reduction)
    ),
    essence: Math.floor(
      CRAFTING_BASE_COSTS.reforge.essence *
      rarityMult *
      tierMult *
      (1 + craftingState.reforgeCount * 0.5) *
      (1 - reduction)
    ),
  };
}

export function getAscendCosts(item, player = {}) {
  const ascendRule = ASCEND_COSTS[item?.rarity];
  if (!ascendRule) return null;
  const reduction = getReduction(player, "ascendCostReduction");
  return {
    minLevel: ascendRule.minLevel,
    gold: Math.floor((ascendRule.gold || 0) * (1 - reduction)),
    essence: Math.floor((ascendRule.essence || 0) * (1 - reduction)),
  };
}
