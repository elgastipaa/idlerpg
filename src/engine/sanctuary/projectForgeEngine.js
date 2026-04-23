import { ABYSS_PREFIXES, ABYSS_SUFFIXES } from "../../data/affixes";
import { polishAffix } from "../affixesEngine";
import { buildReforgePreview } from "../crafting/craftingEngine";

const PROJECT_RARITY_INDEX = { rare: 1, epic: 2, legendary: 3 };
const PROJECT_PROGRESS_RULES = {
  rare: {
    ratingStepMult: 1.035,
    affixStepMult: 1.025,
    ascensionRatingStepMult: 1.12,
    ascensionAffixStepMult: 1.08,
    ascendEssence: 108,
    ascendDust: 3,
    imprintEssence: 100,
  },
  epic: {
    ratingStepMult: 1.04,
    affixStepMult: 1.028,
    ascensionRatingStepMult: 1.14,
    ascensionAffixStepMult: 1.09,
    ascendEssence: 162,
    ascendDust: 5,
    imprintEssence: 125,
  },
  legendary: {
    ratingStepMult: 1.045,
    affixStepMult: 1.03,
    ascensionRatingStepMult: 1.16,
    ascensionAffixStepMult: 1.1,
    ascendEssence: 228,
    ascendDust: 7,
    imprintEssence: 150,
  },
};

function getProjectRarityIndex(project = {}) {
  return PROJECT_RARITY_INDEX[project?.rarity] || 1;
}

function getProjectProgressRule(project = {}) {
  return PROJECT_PROGRESS_RULES[project?.rarity] || PROJECT_PROGRESS_RULES.rare;
}

function getNumericAffixScore(affix = {}) {
  const numericValue = Math.abs(Number(affix?.value ?? affix?.rolledValue ?? 0) || 0);
  return numericValue + Math.max(0, Number(affix?.tier || 0)) * 12;
}

function roundToItemScale(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function cloneAffixRecord(affix = {}) {
  return {
    ...affix,
    value: roundToItemScale(affix?.value ?? affix?.rolledValue ?? 0),
    rolledValue: roundToItemScale(affix?.rolledValue ?? affix?.value ?? 0),
    range: affix?.range
      ? {
          min: roundToItemScale(affix.range.min),
          max: roundToItemScale(affix.range.max),
        }
      : affix?.range || null,
    baseRange: affix?.baseRange
      ? {
          min: roundToItemScale(affix.baseRange.min),
          max: roundToItemScale(affix.baseRange.max),
        }
      : affix?.baseRange || null,
  };
}

function getProjectProgressMultipliers(project = {}, overrides = {}) {
  const rule = getProjectProgressRule(project);
  const upgradeLevel = Math.max(0, Number(overrides?.upgradeLevel ?? project?.upgradeLevel ?? 0));
  const ascensionTier = Math.max(0, Number(overrides?.ascensionTier ?? project?.ascensionTier ?? 0));
  return {
    upgradeLevel,
    ascensionTier,
    ratingMult:
      Math.pow(rule.ratingStepMult, upgradeLevel) *
      Math.pow(rule.ascensionRatingStepMult, ascensionTier),
    affixMult:
      Math.pow(rule.affixStepMult, upgradeLevel) *
      Math.pow(rule.ascensionAffixStepMult, ascensionTier),
  };
}

function deriveBaseAffixes(project = {}) {
  if (Array.isArray(project?.baseAffixes) && project.baseAffixes.length > 0) {
    return project.baseAffixes.map(cloneAffixRecord);
  }

  const { affixMult } = getProjectProgressMultipliers(project);
  const safeMult = affixMult > 0 ? affixMult : 1;
  return (Array.isArray(project?.affixes) ? project.affixes : []).map(affix => {
    const currentValue = Number(affix?.value ?? affix?.rolledValue ?? 0) || 0;
    const currentRolledValue = Number(affix?.rolledValue ?? affix?.value ?? 0) || 0;
    const currentRangeMin = Number(affix?.range?.min ?? affix?.baseRange?.min ?? currentValue) || 0;
    const currentRangeMax = Number(affix?.range?.max ?? affix?.baseRange?.max ?? currentValue) || 0;
    return cloneAffixRecord({
      ...affix,
      value: currentValue / safeMult,
      rolledValue: currentRolledValue / safeMult,
      range: {
        min: currentRangeMin / safeMult,
        max: currentRangeMax / safeMult,
      },
      baseValue: currentValue / safeMult,
      baseRolledValue: currentRolledValue / safeMult,
      baseRange: {
        min: currentRangeMin / safeMult,
        max: currentRangeMax / safeMult,
      },
    });
  });
}

function deriveBaseRating(project = {}) {
  if (Number.isFinite(Number(project?.baseRating))) {
    return Math.max(1, Math.round(Number(project.baseRating)));
  }
  const { ratingMult } = getProjectProgressMultipliers(project);
  const safeMult = ratingMult > 0 ? ratingMult : 1;
  return Math.max(1, Math.round(Number(project?.rating || 1) / safeMult));
}

function buildProgressedAffix(baseAffix = {}, affixMult = 1) {
  const baseValue = Number(baseAffix?.value ?? baseAffix?.rolledValue ?? 0) || 0;
  const baseRolledValue = Number(baseAffix?.rolledValue ?? baseAffix?.value ?? 0) || 0;
  const baseRangeMin = Number(baseAffix?.range?.min ?? baseAffix?.baseRange?.min ?? baseValue) || 0;
  const baseRangeMax = Number(baseAffix?.range?.max ?? baseAffix?.baseRange?.max ?? baseValue) || 0;
  return {
    ...baseAffix,
    value: roundToItemScale(baseValue * affixMult),
    rolledValue: roundToItemScale(baseRolledValue * affixMult),
    range: {
      min: roundToItemScale(baseRangeMin * affixMult),
      max: roundToItemScale(baseRangeMax * affixMult),
    },
    baseValue: roundToItemScale(baseValue),
    baseRolledValue: roundToItemScale(baseRolledValue),
    baseRange: {
      min: roundToItemScale(baseRangeMin),
      max: roundToItemScale(baseRangeMax),
    },
  };
}

function buildProjectCraftingState(project = {}) {
  const crafting = project?.crafting || {};
  const polishCountsByIndex = crafting?.polishCountsByIndex && typeof crafting.polishCountsByIndex === "object"
    ? Object.fromEntries(
        Object.entries(crafting.polishCountsByIndex)
          .filter(([key]) => Number.isInteger(Number(key)))
          .map(([key, value]) => [String(key), Math.max(0, Number(value || 0))])
      )
    : {};

  return {
    rerollCount: Math.max(0, Number(crafting?.rerollCount || 0)),
    polishCount: Math.max(0, Number(crafting?.polishCount || 0)),
    reforgeCount: Math.max(0, Number(crafting?.reforgeCount || 0)),
    ascendCount: Math.max(0, Number(crafting?.ascendCount || 0)),
    polishCountsByIndex,
    focusedAffixIndex: Number.isInteger(crafting?.focusedAffixIndex) ? Number(crafting.focusedAffixIndex) : null,
    focusedAffixStat: crafting?.focusedAffixStat || null,
  };
}

function buildUpdatedProject(project, nextAffixes = [], nextCrafting = null) {
  const currentScore = Math.max(1, (project?.affixes || []).reduce((total, affix) => total + getNumericAffixScore(affix), 0));
  const nextScore = Math.max(1, (nextAffixes || []).reduce((total, affix) => total + getNumericAffixScore(affix), 0));
  const scoreRatio = Math.max(0.9, Math.min(1.18, nextScore / currentScore));

  return {
    ...project,
    affixes: [...nextAffixes],
    rating: Math.max(1, Math.round(Number(project?.rating || 0) * scoreRatio)),
    crafting: nextCrafting || buildProjectCraftingState(project),
  };
}

function rebuildProjectProgression(project = {}, overrides = {}) {
  const normalized = {
    ...project,
    projectTier: Math.max(0, Number(overrides?.projectTier ?? project?.projectTier ?? 0)),
    upgradeLevel: Math.max(0, Number(overrides?.upgradeLevel ?? project?.upgradeLevel ?? 0)),
    upgradeCap: Math.max(1, Number(overrides?.upgradeCap ?? project?.upgradeCap ?? 15)),
    ascensionTier: Math.max(0, Number(overrides?.ascensionTier ?? project?.ascensionTier ?? 0)),
    powerTier: Math.max(0, Number(overrides?.powerTier ?? project?.powerTier ?? 0)),
    legendaryPowerId: overrides?.legendaryPowerId ?? project?.legendaryPowerId ?? null,
    crafting: overrides?.crafting || buildProjectCraftingState(project),
  };
  const baseAffixes = Array.isArray(overrides?.baseAffixes)
    ? overrides.baseAffixes.map(cloneAffixRecord)
    : deriveBaseAffixes(project);
  const baseRating = Number.isFinite(Number(overrides?.baseRating))
    ? Math.max(1, Math.round(Number(overrides.baseRating)))
    : deriveBaseRating(project);
  const { ratingMult, affixMult } = getProjectProgressMultipliers(normalized);

  return {
    ...normalized,
    baseRating,
    baseAffixes,
    rating: Math.max(1, Math.round(baseRating * ratingMult)),
    affixes: baseAffixes.map(affix => buildProgressedAffix(affix, affixMult)),
  };
}

export function normalizeProjectRecord(project = {}) {
  return rebuildProjectProgression({
    ...project,
    projectTier: Math.max(0, Number(project?.projectTier || 0)),
    upgradeLevel: Math.max(0, Number(project?.upgradeLevel || 0)),
    upgradeCap: Math.max(1, Number(project?.upgradeCap || 15)),
    ascensionTier: Math.max(0, Number(project?.ascensionTier || 0)),
    powerTier: Math.max(project?.legendaryPowerId ? 1 : 0, Number(project?.powerTier || 0)),
    affixes: Array.isArray(project?.affixes) ? [...project.affixes] : [],
    crafting: buildProjectCraftingState(project),
  });
}

export function getDeepForgeCosts(project = {}, mode = "polish", affixIndex = null) {
  const rarityIndex = getProjectRarityIndex(project);
  const rule = getProjectProgressRule(project);
  const crafting = buildProjectCraftingState(project);
  const currentUpgradeLevel = Math.max(0, Number(project?.upgradeLevel || 0));
  const targetAffix = affixIndex == null ? null : (project?.affixes || [])[affixIndex] || null;
  const tierIndex = Math.max(1, Number(targetAffix?.tier || 1));

  if (mode === "polish") {
    return {
      essence: Math.floor((20 + rarityIndex * 10 + currentUpgradeLevel * 2) * (1 + crafting.polishCount * 0.3)),
      relicDust: Math.max(1, Math.floor((rarityIndex + tierIndex - 1) / 2)),
    };
  }

  if (mode === "reforge") {
    return {
      essence: Math.floor((28 + rarityIndex * 14 + currentUpgradeLevel * 2) * (1 + crafting.reforgeCount * 0.26)),
      relicDust: Math.max(1, rarityIndex + Math.floor(currentUpgradeLevel / 5)),
    };
  }

  if (mode === "ascend") {
    return {
      essence: Math.floor(rule.ascendEssence * (1 + Math.max(0, Number(project?.ascensionTier || 0)) * 0.34)),
      relicDust: Math.max(1, rule.ascendDust + Math.floor(Math.max(0, Number(project?.ascensionTier || 0)) / 2)),
    };
  }

  return { essence: 0, relicDust: 0 };
}

export function canDeepForgeProject(project = {}, resources = {}, mode = "polish", affixIndex = null, options = {}) {
  const targetAffix = affixIndex == null ? null : (project?.affixes || [])[affixIndex] || null;
  if (!project?.id) return { ok: false, reason: "missing_project", costs: { essence: 0, relicDust: 0 } };
  if ((mode === "polish" || mode === "reforge") && !targetAffix) {
    return { ok: false, reason: "missing_affix", costs: { essence: 0, relicDust: 0 } };
  }

  const costs = getDeepForgeCosts(project, mode, affixIndex);
  if (mode === "ascend" && Math.max(0, Number(project?.upgradeLevel || 0)) < Math.max(1, Number(project?.upgradeCap || 15))) {
    return { ok: false, reason: "upgrade_cap", costs };
  }

  const selectedPowerId = options?.selectedPowerId || null;
  const changingPower = mode === "ascend" && selectedPowerId && selectedPowerId !== project?.legendaryPowerId;
  if (changingPower) {
    if (project?.rarity !== "legendary") {
      return { ok: false, reason: "not_legendary", costs };
    }
    if (!Array.isArray(options?.unlockedPowerIds) || !options.unlockedPowerIds.includes(selectedPowerId)) {
      return { ok: false, reason: "power_locked", costs };
    }
  }

  const imprintReduction = Math.max(0, Math.min(0.95, Number(options?.imprintReduction || 0)));
  const totalCosts =
    changingPower
      ? {
          essence: costs.essence + Math.max(0, Math.floor(getProjectProgressRule(project).imprintEssence * (1 - imprintReduction))),
          relicDust: costs.relicDust,
        }
      : costs;
  const essence = Math.max(0, Number(resources?.essence ?? resources?.playerEssence ?? 0));
  const relicDust = Math.max(0, Number(resources?.relicDust || 0));
  if (essence < totalCosts.essence) return { ok: false, reason: "essence", costs: totalCosts };
  if (relicDust < totalCosts.relicDust) return { ok: false, reason: "relicDust", costs: totalCosts };
  return { ok: true, reason: "ok", costs: totalCosts };
}

export function deepForgeUpgradeProject(project = {}, nextUpgradeLevel = 1) {
  if (!project?.id) return null;
  return rebuildProjectProgression(normalizeProjectRecord(project), {
    upgradeLevel: Math.max(0, Number(nextUpgradeLevel || 0)),
  });
}

export function deepForgePolishProject(project = {}, affixIndex = null) {
  if (affixIndex == null) return null;
  const normalized = normalizeProjectRecord(project);
  const baseAffixes = Array.isArray(normalized?.baseAffixes) ? normalized.baseAffixes : [];
  if (!baseAffixes[affixIndex]) return null;
  const nextBaseAffixes = polishAffix({ affixes: baseAffixes }, affixIndex);
  const currentScore = Math.max(1, baseAffixes.reduce((total, affix) => total + getNumericAffixScore(affix), 0));
  const nextScore = Math.max(1, nextBaseAffixes.reduce((total, affix) => total + getNumericAffixScore(affix), 0));
  const scoreRatio = Math.max(0.9, Math.min(1.18, nextScore / currentScore));
  const crafting = buildProjectCraftingState(normalized);
  const nextCrafting = {
    ...crafting,
    polishCount: crafting.polishCount + 1,
    polishCountsByIndex: {
      ...crafting.polishCountsByIndex,
      [String(affixIndex)]: Math.max(0, Number(crafting.polishCountsByIndex?.[String(affixIndex)] || 0)) + 1,
    },
  };
  return rebuildProjectProgression(normalized, {
    baseAffixes: nextBaseAffixes,
    baseRating: Math.max(1, Math.round(Number(normalized?.baseRating || normalized?.rating || 1) * scoreRatio)),
    crafting: nextCrafting,
  });
}

export function buildDeepForgeReforgePreview(project = {}, affixIndex = null, { allowAbyssAffixes = false, favoredStats = [] } = {}) {
  if (affixIndex == null) return [];
  const normalized = normalizeProjectRecord(project);
  const extraPool = allowAbyssAffixes && ["epic", "legendary"].includes(project?.rarity)
    ? [...ABYSS_PREFIXES, ...ABYSS_SUFFIXES]
    : [];
  return buildReforgePreview(
    {
      ...normalized,
      affixes: Array.isArray(normalized?.baseAffixes) ? normalized.baseAffixes.map(cloneAffixRecord) : [],
    },
    affixIndex,
    project?.rarity === "epic" || project?.rarity === "legendary" ? 3 : 2,
    favoredStats,
    extraPool
  );
}

export function deepForgeApplyReforge(project = {}, affixIndex = null, replacementAffix = null) {
  if (affixIndex == null || !replacementAffix) return null;
  const normalized = normalizeProjectRecord(project);
  const baseAffixes = Array.isArray(normalized?.baseAffixes) ? [...normalized.baseAffixes] : [];
  if (!baseAffixes[affixIndex]) return null;

  baseAffixes[affixIndex] = cloneAffixRecord({
    ...replacementAffix,
    source: replacementAffix?.source || baseAffixes[affixIndex]?.source || null,
  });

  const currentScore = Math.max(1, normalized.baseAffixes.reduce((total, affix) => total + getNumericAffixScore(affix), 0));
  const nextScore = Math.max(1, baseAffixes.reduce((total, affix) => total + getNumericAffixScore(affix), 0));
  const scoreRatio = Math.max(0.9, Math.min(1.18, nextScore / currentScore));
  const crafting = buildProjectCraftingState(normalized);
  const nextCrafting = {
    ...crafting,
    reforgeCount: crafting.reforgeCount + 1,
    focusedAffixIndex: affixIndex,
    focusedAffixStat: replacementAffix?.stat || null,
  };

  return rebuildProjectProgression(normalized, {
    baseAffixes,
    baseRating: Math.max(1, Math.round(Number(normalized?.baseRating || normalized?.rating || 1) * scoreRatio)),
    crafting: nextCrafting,
  });
}

export function deepForgeAscendProject(project = {}, { selectedPowerId = null } = {}) {
  const normalized = normalizeProjectRecord(project);
  const crafting = buildProjectCraftingState(normalized);
  const nextAscensionTier = Math.max(0, Number(normalized?.ascensionTier || 0)) + 1;
  const nextProjectTier = Math.max(0, Number(normalized?.projectTier || 0)) + 1;
  const nextLegendaryPowerId = selectedPowerId || normalized?.legendaryPowerId || null;
  const nextPowerTier = nextLegendaryPowerId ? Math.max(1, Number(normalized?.powerTier || 0)) : 0;
  const nextCrafting = {
    ...crafting,
    ascendCount: crafting.ascendCount + 1,
  };

  return rebuildProjectProgression(normalized, {
    upgradeLevel: 0,
    ascensionTier: nextAscensionTier,
    projectTier: nextProjectTier,
    powerTier: nextPowerTier,
    legendaryPowerId: nextLegendaryPowerId,
    crafting: nextCrafting,
  });
}
