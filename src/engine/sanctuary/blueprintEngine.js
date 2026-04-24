import { ITEM_FAMILIES } from "../../data/itemFamilies";
import { ITEMS, ITEM_RARITY_BLUEPRINT } from "../../data/items";
import { rollAffixes } from "../affixesEngine";
import { calcItemRating } from "../inventory/inventoryEngine";
import { materializeItem, normalizeLegacyBonusMap, normalizeLegacyStatKey } from "../../utils/loot";

export const BLUEPRINT_AFFIX_FAMILIES = {
  bleed_dot: {
    id: "bleed_dot",
    label: "Bleed / DoT",
    stats: ["bleedChance", "bleedDamage", "damageOnKill"],
    color: "var(--tone-danger, #D85A30)",
  },
  crit_burst: {
    id: "crit_burst",
    label: "Crit / Burst",
    stats: ["damage", "critChance", "critDamage", "critOnLowHp"],
    color: "var(--tone-accent, #4338ca)",
  },
  tempo_combo: {
    id: "tempo_combo",
    label: "Tempo / Multi-hit",
    stats: ["attackSpeed", "multiHitChance", "lifesteal"],
    color: "var(--tone-info, #0369a1)",
  },
  mark_control: {
    id: "mark_control",
    label: "Mark / Control",
    stats: ["markChance", "markEffectPerStack", "fractureChance"],
    color: "var(--tone-violet, #7c3aed)",
  },
  guard_vitality: {
    id: "guard_vitality",
    label: "Tank / Defense",
    stats: ["defense", "healthMax", "healthRegen", "blockChance", "dodgeChance", "thorns"],
    color: "var(--tone-success, #10b981)",
  },
  fortune_utility: {
    id: "fortune_utility",
    label: "Utility / Economy",
    stats: ["goldBonus", "goldBonusPct", "essenceBonus", "luck", "xpBonus", "lootBonus"],
    color: "var(--tone-warning, #f59e0b)",
  },
};

const BLUEPRINT_FAMILY_IDS = Object.keys(BLUEPRINT_AFFIX_FAMILIES);
const AFFIX_TIER_CHARGE_WEIGHTS = { 1: 4, 2: 2, 3: 1 };
const AFFIX_TIER_AFFINITY_WEIGHTS = { 1: 3, 2: 2, 3: 1 };
const FAMILY_CHARGE_CAP = 120;
const PRIMARY_AFFINITY_CAP = 70;
const SECONDARY_AFFINITY_CAP = 55;
const OFF_FAMILY_AFFINITY_CAP = 40;
const AFFINITY_STEP_PER_CHARGE = 4;
const BLUEPRINT_LEVEL_CAP = 12;
const BLUEPRINT_POWER_TUNE_CAP = 5;
const BLUEPRINT_ASCENSION_CAP = 3;
const BLUEPRINT_BASE_STEP_MULTIPLIERS = [1.035, 1.035, 1.035, 1.035, 1.03, 1.03, 1.03, 1.03, 1.025, 1.025, 1.025, 1.025];
const BLUEPRINT_IMPLICIT_STEP_MULTIPLIERS = [1.025, 1.025, 1.025, 1.025, 1.02, 1.02, 1.02, 1.02, 1.015, 1.015, 1.015, 1.015];
const BLUEPRINT_RARITY_INDEX = {
  common: 0,
  magic: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};
const BLUEPRINT_ASCENSION_RULES = {
  common: { ratingStepMult: 1.08, baseStepMult: 1.06, implicitStepMult: 1.04, essenceCost: 60, relicDust: 2 },
  magic: { ratingStepMult: 1.1, baseStepMult: 1.07, implicitStepMult: 1.05, essenceCost: 80, relicDust: 3 },
  rare: { ratingStepMult: 1.12, baseStepMult: 1.08, implicitStepMult: 1.06, essenceCost: 100, relicDust: 4 },
  epic: { ratingStepMult: 1.14, baseStepMult: 1.09, implicitStepMult: 1.07, essenceCost: 150, relicDust: 6 },
  legendary: { ratingStepMult: 1.16, baseStepMult: 1.1, implicitStepMult: 1.08, essenceCost: 220, relicDust: 8 },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function roundBonusMap(bonus = {}) {
  return Object.fromEntries(
    Object.entries(normalizeLegacyBonusMap(bonus || {}))
      .map(([stat, value]) => [stat, Math.round(Number(value || 0) * 1000) / 1000])
      .filter(([, value]) => value !== 0)
  );
}

function getStepMultiplier(stepMultipliers = [], level = 0) {
  let totalMultiplier = 1;
  for (let index = 0; index < Math.min(Math.max(0, Number(level || 0)), stepMultipliers.length); index += 1) {
    totalMultiplier *= stepMultipliers[index] || 1;
  }
  return Math.round(totalMultiplier * 100000) / 100000;
}

function buildScaledBonusDelta(bonus = {}, multiplier = 1) {
  const normalizedBonus = normalizeLegacyBonusMap(bonus || {});
  if (multiplier <= 1) return {};

  const delta = {};
  for (const [stat, value] of Object.entries(normalizedBonus)) {
    const baseValue = Number(value || 0);
    if (!baseValue) continue;
    delta[stat] = Math.round((baseValue * multiplier - baseValue) * 1000) / 1000;
  }

  return roundBonusMap(delta);
}

function findBaseItemById(itemId) {
  return ITEMS.find(item => item.id === itemId) || null;
}

function getFallbackBaseItem(slot = "weapon", rarity = "common") {
  return ITEMS.find(item => item.type === slot && item.rarity === rarity) ||
    ITEMS.find(item => item.type === slot) ||
    null;
}

function getBlueprintAscensionRule(blueprint = {}) {
  return BLUEPRINT_ASCENSION_RULES[blueprint?.rarity] || BLUEPRINT_ASCENSION_RULES.rare;
}

function createSeededRandom(seedSource = "") {
  let hash = 2166136261;
  const input = String(seedSource || "");
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildBlueprintSeedPayload(blueprint = {}, phase = "materialize") {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return `${phase}:missing`;
  return [
    phase,
    normalized.id,
    normalized.blueprintLevel || 0,
    normalized.powerTuneLevel || 0,
    normalized.ascensionTier || 0,
    normalized.materializationCount || 0,
    normalized.itemTier || 1,
    normalized.baseRating || 1,
    normalized.primaryFamily || "",
    normalized.secondaryFamily || "",
    ...Object.entries(normalized.affinity || {}).sort(([left], [right]) => left.localeCompare(right)).flat(),
  ].join("|");
}

function normalizeAffixRecord(affix = {}) {
  return {
    ...affix,
    stat: normalizeLegacyStatKey(affix?.stat),
    tier: Math.max(1, Number(affix?.tier || 3)),
    value: Number(affix?.value ?? affix?.rolledValue ?? 0) || 0,
    rolledValue: Number(affix?.rolledValue ?? affix?.value ?? 0) || 0,
    perfectRoll: !!affix?.perfectRoll,
  };
}

function makeEmptyAffinityMap() {
  return Object.fromEntries(BLUEPRINT_FAMILY_IDS.map(familyId => [familyId, 0]));
}

export function createEmptyFamilyChargeState() {
  return makeEmptyAffinityMap();
}

export function getBlueprintFamilyChargeCap() {
  return FAMILY_CHARGE_CAP;
}

export function normalizeFamilyChargeState(currentCharges = {}) {
  const next = createEmptyFamilyChargeState();
  for (const familyId of BLUEPRINT_FAMILY_IDS) {
    next[familyId] = Math.max(0, Math.min(FAMILY_CHARGE_CAP, Math.floor(Number(currentCharges?.[familyId] || 0))));
  }
  return next;
}

export function createEmptyBlueprintLoadout() {
  return {
    weapon: null,
    armor: null,
  };
}

export function getBlueprintAffixFamilyIdFromStat(stat = "") {
  const normalizedStat = normalizeLegacyStatKey(stat);
  for (const family of Object.values(BLUEPRINT_AFFIX_FAMILIES)) {
    if (family.stats.includes(normalizedStat)) return family.id;
  }
  return "fortune_utility";
}

export function getBlueprintAffixFamilyMeta(familyId = "") {
  return BLUEPRINT_AFFIX_FAMILIES[familyId] || null;
}

function getAffixFamilyScores(affixes = []) {
  const scores = makeEmptyAffinityMap();
  for (const affix of affixes || []) {
    const familyId = getBlueprintAffixFamilyIdFromStat(affix?.stat);
    const tierWeight = AFFIX_TIER_AFFINITY_WEIGHTS[Math.max(1, Number(affix?.tier || 3))] || 1;
    const bonusWeight = affix?.perfectRoll ? 1 : 0;
    scores[familyId] = (scores[familyId] || 0) + tierWeight + bonusWeight;
  }
  return scores;
}

export function buildFamilyChargesFromAffixes(affixes = [], { multiplier = 1 } = {}) {
  const charges = createEmptyFamilyChargeState();
  for (const affix of affixes || []) {
    const familyId = getBlueprintAffixFamilyIdFromStat(affix?.stat);
    const tierWeight = AFFIX_TIER_CHARGE_WEIGHTS[Math.max(1, Number(affix?.tier || 3))] || 1;
    const perfectBonus = affix?.perfectRoll ? 1 : 0;
    const amount = Math.max(1, Math.round((tierWeight + perfectBonus) * Math.max(0.1, Number(multiplier || 1))));
    charges[familyId] = (charges[familyId] || 0) + amount;
  }
  return charges;
}

function mergeChargeMaps(base = {}, extra = {}) {
  const next = normalizeFamilyChargeState(base || {});
  for (const familyId of BLUEPRINT_FAMILY_IDS) {
    const addedCharges = Math.max(0, Math.floor(Number(extra?.[familyId] || 0)));
    next[familyId] = Math.max(0, Math.min(FAMILY_CHARGE_CAP, Number(next[familyId] || 0) + addedCharges));
  }
  return next;
}

function sortFamilyScores(scores = {}) {
  return Object.entries(scores)
    .sort((left, right) => Number(right?.[1] || 0) - Number(left?.[1] || 0))
    .map(([familyId, score]) => ({ familyId, score: Number(score || 0) }));
}

function buildInitialAffinityMap(affixes = []) {
  const scores = getAffixFamilyScores(affixes);
  const sorted = sortFamilyScores(scores);
  const primaryFamily = sorted[0]?.score > 0 ? sorted[0].familyId : null;
  const secondaryFamily = sorted[1]?.score > 0 ? sorted[1].familyId : null;
  const affinity = makeEmptyAffinityMap();

  for (const { familyId, score } of sorted) {
    if (!familyId || score <= 0) continue;
    let cap = OFF_FAMILY_AFFINITY_CAP;
    if (familyId === primaryFamily) cap = Math.min(PRIMARY_AFFINITY_CAP, 18 + score * 6);
    else if (familyId === secondaryFamily) cap = Math.min(SECONDARY_AFFINITY_CAP, 8 + score * 5);
    else cap = Math.min(OFF_FAMILY_AFFINITY_CAP, score * 3);
    affinity[familyId] = Math.max(0, Math.round(cap));
  }

  return {
    affinity,
    primaryFamily,
    secondaryFamily,
  };
}

export function buildExtractedItemRecord(item, meta = {}) {
  if (!item?.id) return null;
  const affixes = Array.isArray(item.affixes) ? item.affixes.map(normalizeAffixRecord) : [];
  return {
    id: `extracted_${Date.now()}_${item.id}`,
    sourceItemId: item.id,
    sourceBaseItemId: item.itemId || item.id,
    name: item.name,
    rarity: item.rarity,
    type: item.type,
    family: item.family || null,
    familyName: item.familyName || ITEM_FAMILIES[item.family || ""]?.name || null,
    rating: Math.max(1, Math.round(Number(item.rating || 0) || 1)),
    itemTier: Math.max(1, Number(item.itemTier || item.level || 1) || 1),
    baseBonus: roundBonusMap(item.baseBonus || item.bonus || {}),
    implicitBonus: roundBonusMap(item.implicitBonus || {}),
    affixes,
    legendaryPowerId: item.legendaryPowerId || null,
    extractedAt: Date.now(),
    sourceMeta: meta,
  };
}

export function normalizeExtractedItemRecord(item = {}) {
  if (!item?.id) return null;
  return {
    ...item,
    rarity: item?.rarity || "rare",
    type: item?.type || "weapon",
    rating: Math.max(1, Math.round(Number(item?.rating || 1))),
    itemTier: Math.max(1, Number(item?.itemTier || 1)),
    baseBonus: roundBonusMap(item?.baseBonus || {}),
    implicitBonus: roundBonusMap(item?.implicitBonus || {}),
    affixes: Array.isArray(item?.affixes) ? item.affixes.map(normalizeAffixRecord) : [],
    legendaryPowerId: item?.legendaryPowerId || null,
  };
}

export function buildBlueprintFromExtractedItem(extractedItem = {}, { now = Date.now() } = {}) {
  const normalized = normalizeExtractedItemRecord(extractedItem);
  if (!normalized?.id) return null;
  const { affinity, primaryFamily, secondaryFamily } = buildInitialAffinityMap(normalized.affixes || []);
  return {
    id: `blueprint_${now}_${normalized.sourceBaseItemId || normalized.sourceItemId || normalized.id}`,
    sourceExtractedItemId: normalized.id,
    sourceBaseItemId: normalized.sourceBaseItemId || normalized.sourceItemId || null,
    sourceName: normalized.name,
    rarity: normalized.rarity,
    slot: normalized.type,
    family: normalized.family || findBaseItemById(normalized.sourceBaseItemId)?.family || null,
    familyName: normalized.familyName || ITEM_FAMILIES[normalized.family || ""]?.name || null,
    baseRating: Math.max(1, Math.round(Number(normalized.rating || 1))),
    baseBonus: roundBonusMap(normalized.baseBonus || {}),
    itemTier: Math.max(1, Number(normalized.itemTier || 1)),
    implicitBonus: roundBonusMap(normalized.implicitBonus || {}),
    legendaryPowerId: normalized.legendaryPowerId || null,
    primaryFamily,
    secondaryFamily,
    affinity,
    blueprintLevel: 0,
    powerTuneLevel: normalized.legendaryPowerId ? 0 : 0,
    ascensionTier: 0,
    materializationCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function inferLegacyBaseItem(project = {}) {
  const direct =
    findBaseItemById(project?.sourceBaseItemId) ||
    findBaseItemById(project?.sourceItemId) ||
    findBaseItemById(project?.itemId);
  if (direct) return direct;

  const family = project?.family || project?.baseType || null;
  const type = project?.type || "weapon";
  return ITEMS.find(item => item.type === type && item.family === family) ||
    ITEMS.find(item => item.type === type && item.rarity === project?.rarity) ||
    getFallbackBaseItem(type, project?.rarity);
}

export function convertLegacyProjectToBlueprint(project = {}, { now = Date.now() } = {}) {
  if (!project?.id) return null;
  const baseItem = inferLegacyBaseItem(project);
  const affixes = Array.isArray(project?.baseAffixes) && project.baseAffixes.length > 0
    ? project.baseAffixes.map(normalizeAffixRecord)
    : (Array.isArray(project?.affixes) ? project.affixes.map(normalizeAffixRecord) : []);
  const legacyExtractedItem = {
    id: `legacy_extract_${project.id}`,
    sourceItemId: project?.sourceItemId || project?.id,
    sourceBaseItemId: baseItem?.id || project?.sourceBaseItemId || project?.itemId || project?.sourceItemId || null,
    name: project?.name || baseItem?.name || "Item legado",
    rarity: project?.rarity || baseItem?.rarity || "rare",
    type: project?.type || baseItem?.type || "weapon",
    family: baseItem?.family || project?.family || project?.baseType || null,
    familyName: ITEM_FAMILIES[baseItem?.family || project?.family || project?.baseType || ""]?.name || null,
    rating: Math.max(1, Math.round(Number(project?.baseRating || project?.rating || 1))),
    itemTier: Math.max(1, Number(project?.itemTier || 1)),
    baseBonus: roundBonusMap(project?.baseBonus || baseItem?.bonus || {}),
    implicitBonus: roundBonusMap(project?.implicitBonus || {}),
    affixes,
    legendaryPowerId: project?.legendaryPowerId || null,
  };
  const blueprint = buildBlueprintFromExtractedItem(legacyExtractedItem, { now });
  if (!blueprint) return null;
  return {
    ...blueprint,
    sourceName: project?.name || blueprint.sourceName,
    blueprintLevel: Math.max(0, Number(project?.projectTier || 0)),
    updatedAt: now,
  };
}

export function normalizeBlueprintRecord(blueprint = {}) {
  if (!blueprint?.id) return null;
  const normalizedAffinity = {
    ...makeEmptyAffinityMap(),
    ...(blueprint?.affinity || {}),
  };
  const primaryFamily = normalizedAffinity[blueprint?.primaryFamily] > 0 ? blueprint.primaryFamily : null;
  const secondaryFamily =
    blueprint?.secondaryFamily && blueprint.secondaryFamily !== primaryFamily && normalizedAffinity[blueprint.secondaryFamily] > 0
      ? blueprint.secondaryFamily
      : null;
  return {
    ...blueprint,
    rarity: blueprint?.rarity || "rare",
    slot: blueprint?.slot || "weapon",
    family: blueprint?.family || null,
    familyName: blueprint?.familyName || ITEM_FAMILIES[blueprint?.family || ""]?.name || null,
    baseRating: Math.max(1, Math.round(Number(blueprint?.baseRating || 1))),
    baseBonus: roundBonusMap(blueprint?.baseBonus || {}),
    itemTier: Math.max(1, Number(blueprint?.itemTier || 1)),
    implicitBonus: roundBonusMap(blueprint?.implicitBonus || {}),
    legendaryPowerId: blueprint?.legendaryPowerId || null,
    primaryFamily,
    secondaryFamily,
    affinity: normalizedAffinity,
    blueprintLevel: Math.max(0, Math.min(BLUEPRINT_LEVEL_CAP, Number(blueprint?.blueprintLevel || 0))),
    powerTuneLevel: blueprint?.legendaryPowerId ? Math.max(0, Math.min(BLUEPRINT_POWER_TUNE_CAP, Number(blueprint?.powerTuneLevel || 0))) : 0,
    ascensionTier: Math.max(0, Math.min(BLUEPRINT_ASCENSION_CAP, Number(blueprint?.ascensionTier || 0))),
    materializationCount: Math.max(0, Number(blueprint?.materializationCount || 0)),
  };
}

export function getBlueprintLevelCap() {
  return BLUEPRINT_LEVEL_CAP;
}

export function getBlueprintPowerTuneCap() {
  return BLUEPRINT_POWER_TUNE_CAP;
}

export function getBlueprintAscensionCap() {
  return BLUEPRINT_ASCENSION_CAP;
}

export function getBlueprintEffectiveItemTier(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  return Math.max(1, Number(normalized?.itemTier || 1) + Math.max(0, Number(normalized?.ascensionTier || 0)));
}

export function getBlueprintAscensionMultipliers(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  const ascensionTier = Math.max(0, Number(normalized?.ascensionTier || 0));
  const rule = getBlueprintAscensionRule(normalized);
  return {
    rating: Math.pow(Number(rule.ratingStepMult || 1), ascensionTier),
    base: Math.pow(Number(rule.baseStepMult || 1), ascensionTier),
    implicit: Math.pow(Number(rule.implicitStepMult || 1), ascensionTier),
  };
}

export function getBlueprintStructuralMultipliers(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  const level = Math.max(0, Number(normalized?.blueprintLevel || 0));
  const ascensionMultipliers = getBlueprintAscensionMultipliers(normalized);
  return {
    base: getStepMultiplier(BLUEPRINT_BASE_STEP_MULTIPLIERS, level) * ascensionMultipliers.base,
    implicit: getStepMultiplier(BLUEPRINT_IMPLICIT_STEP_MULTIPLIERS, level) * ascensionMultipliers.implicit,
  };
}

export function getBlueprintEffectiveBaseRating(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return 0;
  const multipliers = getBlueprintStructuralMultipliers(normalized);
  const ascensionMultipliers = getBlueprintAscensionMultipliers(normalized);
  const weightedMultiplier = multipliers.base * 0.82 + multipliers.implicit * 0.18;
  const tierBonusMultiplier = 1 + Math.max(0, Number(normalized.ascensionTier || 0)) * 0.025;
  return Math.max(1, Math.round(Number(normalized.baseRating || 1) * weightedMultiplier * ascensionMultipliers.rating * tierBonusMultiplier));
}

export function getBlueprintStructureUpgradeCost(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return { relicDust: 0 };
  const level = Math.max(0, Number(normalized.blueprintLevel || 0));
  const rarityIndex = BLUEPRINT_RARITY_INDEX[normalized.rarity] || 0;
  return {
    relicDust: Math.max(2, 2 + Math.ceil(Number(normalized.itemTier || 1) / 3) + rarityIndex + level * 2 + Math.floor(level / 4) * 2),
  };
}

export function canUpgradeBlueprintStructure(blueprint = {}, resources = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return { ok: false, reason: "missing_blueprint", costs: { relicDust: 0 } };
  if (Number(normalized.blueprintLevel || 0) >= BLUEPRINT_LEVEL_CAP) {
    return { ok: false, reason: "level_cap", costs: { relicDust: 0 } };
  }
  const costs = getBlueprintStructureUpgradeCost(normalized);
  const relicDust = Math.max(0, Number(resources?.relicDust || 0));
  if (relicDust < costs.relicDust) return { ok: false, reason: "relicDust", costs };
  return { ok: true, reason: null, costs };
}

export function upgradeBlueprintStructure(blueprint = {}, { now = Date.now() } = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return null;
  if (Number(normalized.blueprintLevel || 0) >= BLUEPRINT_LEVEL_CAP) return normalized;
  return {
    ...normalized,
    blueprintLevel: Math.min(BLUEPRINT_LEVEL_CAP, Number(normalized.blueprintLevel || 0) + 1),
    updatedAt: now,
  };
}

export function buildBlueprintStructurePreview(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return null;
  const currentEffectiveRating = getBlueprintEffectiveBaseRating(normalized);
  const currentMultipliers = getBlueprintStructuralMultipliers(normalized);
  const currentLevel = Math.max(0, Number(normalized.blueprintLevel || 0));
  const nextBlueprint =
    currentLevel >= BLUEPRINT_LEVEL_CAP
      ? normalized
      : upgradeBlueprintStructure(normalized, { now: normalized.updatedAt || Date.now() });
  const nextEffectiveRating = getBlueprintEffectiveBaseRating(nextBlueprint);
  const nextMultipliers = getBlueprintStructuralMultipliers(nextBlueprint);
  return {
    currentLevel,
    nextLevel: Math.max(currentLevel, Number(nextBlueprint?.blueprintLevel || currentLevel)),
    atCap: currentLevel >= BLUEPRINT_LEVEL_CAP,
    currentEffectiveRating,
    nextEffectiveRating,
    currentMultipliers,
    nextMultipliers,
    costs: currentLevel >= BLUEPRINT_LEVEL_CAP ? { relicDust: 0 } : getBlueprintStructureUpgradeCost(normalized),
  };
}

export function getBlueprintPowerTuneCost(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id || !normalized?.legendaryPowerId) return { relicDust: 0 };
  const tuneLevel = Math.max(0, Number(normalized.powerTuneLevel || 0));
  const rarityIndex = BLUEPRINT_RARITY_INDEX[normalized.rarity] || 0;
  return {
    relicDust: Math.max(4, 4 + rarityIndex + Math.ceil(Number(normalized.itemTier || 1) / 4) + tuneLevel * 3),
  };
}

export function canTuneBlueprintPower(blueprint = {}, resources = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return { ok: false, reason: "missing_blueprint", costs: { relicDust: 0 } };
  if (!normalized?.legendaryPowerId) return { ok: false, reason: "missing_power", costs: { relicDust: 0 } };
  if (Number(normalized.powerTuneLevel || 0) >= BLUEPRINT_POWER_TUNE_CAP) {
    return { ok: false, reason: "power_tune_cap", costs: { relicDust: 0 } };
  }
  const costs = getBlueprintPowerTuneCost(normalized);
  const relicDust = Math.max(0, Number(resources?.relicDust || 0));
  if (relicDust < costs.relicDust) return { ok: false, reason: "relicDust", costs };
  return { ok: true, reason: null, costs };
}

export function tuneBlueprintPower(blueprint = {}, { now = Date.now() } = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id || !normalized?.legendaryPowerId) return null;
  if (Number(normalized.powerTuneLevel || 0) >= BLUEPRINT_POWER_TUNE_CAP) return normalized;
  return {
    ...normalized,
    powerTuneLevel: Math.min(BLUEPRINT_POWER_TUNE_CAP, Number(normalized.powerTuneLevel || 0) + 1),
    updatedAt: now,
  };
}

export function buildBlueprintPowerTunePreview(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id || !normalized?.legendaryPowerId) return null;
  const currentLevel = Math.max(0, Number(normalized.powerTuneLevel || 0));
  const atCap = currentLevel >= BLUEPRINT_POWER_TUNE_CAP;
  return {
    currentLevel,
    nextLevel: atCap ? currentLevel : currentLevel + 1,
    atCap,
    costs: atCap ? { relicDust: 0 } : getBlueprintPowerTuneCost(normalized),
  };
}

export function getBlueprintAscensionCost(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return { relicDust: 0, essence: 0 };
  const ascensionTier = Math.max(0, Number(normalized.ascensionTier || 0));
  const rule = getBlueprintAscensionRule(normalized);
  const rarityIndex = BLUEPRINT_RARITY_INDEX[normalized.rarity] || 0;
  return {
    relicDust: Math.max(1, Number(rule.relicDust || 0) + rarityIndex + ascensionTier * 3 + Math.ceil(Number(normalized.itemTier || 1) / 4)),
    essence: Math.max(20, Number(rule.essenceCost || 0) + ascensionTier * 80 + Math.ceil(Number(normalized.baseRating || 1) / 12)),
  };
}

export function canAscendBlueprint(blueprint = {}, { resources = {}, essence = 0 } = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return { ok: false, reason: "missing_blueprint", costs: { relicDust: 0, essence: 0 } };
  if (Number(normalized.ascensionTier || 0) >= BLUEPRINT_ASCENSION_CAP) {
    return { ok: false, reason: "ascension_cap", costs: { relicDust: 0, essence: 0 } };
  }
  if (Number(normalized.blueprintLevel || 0) < BLUEPRINT_LEVEL_CAP) {
    return { ok: false, reason: "level_requirement", costs: getBlueprintAscensionCost(normalized) };
  }
  const costs = getBlueprintAscensionCost(normalized);
  if (Math.max(0, Number(resources?.relicDust || 0)) < costs.relicDust) {
    return { ok: false, reason: "relicDust", costs };
  }
  if (Math.max(0, Number(essence || 0)) < costs.essence) {
    return { ok: false, reason: "essence", costs };
  }
  return { ok: true, reason: null, costs };
}

export function ascendBlueprint(blueprint = {}, { now = Date.now() } = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return null;
  if (Number(normalized.ascensionTier || 0) >= BLUEPRINT_ASCENSION_CAP) return normalized;
  return {
    ...normalized,
    ascensionTier: Math.min(BLUEPRINT_ASCENSION_CAP, Math.max(0, Number(normalized.ascensionTier || 0)) + 1),
    blueprintLevel: 0,
    updatedAt: now,
  };
}

export function buildBlueprintAscensionPreview(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return null;
  const currentAscensionTier = Math.max(0, Number(normalized.ascensionTier || 0));
  const atCap = currentAscensionTier >= BLUEPRINT_ASCENSION_CAP;
  const currentEffectiveRating = getBlueprintEffectiveBaseRating(normalized);
  const currentEffectiveTier = getBlueprintEffectiveItemTier(normalized);
  const nextBlueprint = atCap ? normalized : ascendBlueprint(normalized, { now: normalized.updatedAt || Date.now() });
  return {
    currentAscensionTier,
    nextAscensionTier: Math.max(currentAscensionTier, Number(nextBlueprint?.ascensionTier || currentAscensionTier)),
    atCap,
    levelRequirementMet: Number(normalized.blueprintLevel || 0) >= BLUEPRINT_LEVEL_CAP,
    currentEffectiveRating,
    nextEffectiveRating: getBlueprintEffectiveBaseRating(nextBlueprint),
    currentEffectiveTier,
    nextEffectiveTier: getBlueprintEffectiveItemTier(nextBlueprint),
    costs: atCap ? { relicDust: 0, essence: 0 } : getBlueprintAscensionCost(normalized),
  };
}

function getBlueprintAffinityCap(blueprint = {}, familyId = "") {
  if (familyId === blueprint?.primaryFamily) return PRIMARY_AFFINITY_CAP;
  if (familyId === blueprint?.secondaryFamily) return SECONDARY_AFFINITY_CAP;
  return OFF_FAMILY_AFFINITY_CAP;
}

export function investBlueprintAffinity(blueprint = {}, familyId = "", chargeAmount = 1) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id || !BLUEPRINT_AFFIX_FAMILIES[familyId]) return null;
  const spentCharges = Math.max(1, Math.floor(Number(chargeAmount || 1)));
  const cap = getBlueprintAffinityCap(normalized, familyId);
  const currentValue = Math.max(0, Number(normalized.affinity?.[familyId] || 0));
  const nextValue = clamp(currentValue + spentCharges * AFFINITY_STEP_PER_CHARGE, 0, cap);
  return {
    ...normalized,
    affinity: {
      ...normalized.affinity,
      [familyId]: nextValue,
    },
    updatedAt: Date.now(),
  };
}

export function buildBlueprintChargeReward(extractedItem = {}, { multiplier = 1 } = {}) {
  const normalized = normalizeExtractedItemRecord(extractedItem);
  return mergeChargeMaps(
    createEmptyFamilyChargeState(),
    buildFamilyChargesFromAffixes(normalized?.affixes || [], { multiplier })
  );
}

export function addBlueprintCharges(currentCharges = {}, extraCharges = {}) {
  return mergeChargeMaps(currentCharges, extraCharges);
}

function buildBlueprintStatWeights(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  const statWeights = {};
  const itemFamily = ITEM_FAMILIES[normalized?.family || ""] || null;

  for (const stat of itemFamily?.preferredStats || []) {
    const normalizedStat = normalizeLegacyStatKey(stat);
    statWeights[normalizedStat] = Math.max(Number(statWeights[normalizedStat] || 0), 1.3);
  }

  for (const [familyId, rawAffinity] of Object.entries(normalized?.affinity || {})) {
    const family = BLUEPRINT_AFFIX_FAMILIES[familyId];
    if (!family) continue;
    const affinity = Math.max(0, Number(rawAffinity || 0));
    if (affinity <= 0) continue;
    const weightMultiplier = 1 + affinity / 20;
    for (const stat of family.stats) {
      const normalizedStat = normalizeLegacyStatKey(stat);
      statWeights[normalizedStat] = Math.max(Number(statWeights[normalizedStat] || 0), weightMultiplier);
    }
  }

  return statWeights;
}

function buildBlueprintLikelyStats(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  const itemFamily = ITEM_FAMILIES[normalized?.family || ""] || null;
  const statWeights = buildBlueprintStatWeights(normalized);
  const contributions = {};

  for (const stat of itemFamily?.preferredStats || []) {
    const normalizedStat = normalizeLegacyStatKey(stat);
    if (!normalizedStat) continue;
    contributions[normalizedStat] = {
      stat: normalizedStat,
      weight: Math.max(Number(statWeights[normalizedStat] || 0), 1.15),
      source: "family",
      families: [],
    };
  }

  for (const [familyId, family] of Object.entries(BLUEPRINT_AFFIX_FAMILIES)) {
    const affinity = Math.max(0, Number(normalized?.affinity?.[familyId] || 0));
    if (affinity <= 0) continue;
    for (const stat of family.stats) {
      const normalizedStat = normalizeLegacyStatKey(stat);
      const existing = contributions[normalizedStat] || {
        stat: normalizedStat,
        weight: 0,
        source: "affinity",
        families: [],
      };
      existing.weight = Math.max(existing.weight, Number(statWeights[normalizedStat] || 0), 1 + affinity / 20);
      existing.families = Array.from(new Set([...(existing.families || []), familyId]));
      existing.source = existing.source === "family" ? "hybrid" : "affinity";
      contributions[normalizedStat] = existing;
    }
  }

  return Object.values(contributions)
    .sort((left, right) => Number(right.weight || 0) - Number(left.weight || 0))
    .slice(0, 6);
}

function getBlueprintTierBiasSummary(itemTier = 1) {
  const tier = Math.max(1, Number(itemTier || 1));
  if (tier <= 4) {
    return {
      label: "Rango bajo",
      detail: "Predominan lineas T2/T3. Un roll T1 es raro.",
    };
  }
  if (tier <= 8) {
    return {
      label: "Rango mixto bajo",
      detail: "T2/T3 siguen siendo lo mas comun, con algunas lineas altas.",
    };
  }
  if (tier <= 12) {
    return {
      label: "Rango medio",
      detail: "T2 aparece seguido y ya puede salir alguna linea T1.",
    };
  }
  if (tier <= 16) {
    return {
      label: "Rango alto",
      detail: "T1/T2 ya son frecuentes, aunque todavia pueden salir lineas T3.",
    };
  }
  return {
    label: "Rango muy alto",
    detail: "El techo es alto: T1 comun, pero el roll nunca queda totalmente fijo.",
  };
}

function getBlueprintStructureBand(multiplier = 1) {
  const value = Math.max(1, Number(multiplier || 1));
  if (value < 1.08) return "leve";
  if (value < 1.18) return "moderada";
  if (value < 1.32) return "fuerte";
  return "muy fuerte";
}

export function getBlueprintAffinityStrengthLabel(score = 0) {
  const value = Math.max(0, Number(score || 0));
  if (value >= 60) return "muy alta";
  if (value >= 45) return "alta";
  if (value >= 25) return "media";
  return "baja";
}

export function materializeBlueprintItem(blueprint = {}, { now = Date.now() } = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return null;
  const randomFn = createSeededRandom(buildBlueprintSeedPayload(normalized, `materialize:${normalized.materializationCount || 0}`));

  const baseItem =
    findBaseItemById(normalized.sourceBaseItemId) ||
    getFallbackBaseItem(normalized.slot, normalized.rarity);
  if (!baseItem) return null;

  const rarity = normalized.rarity || baseItem.rarity || "rare";
  const itemTier = getBlueprintEffectiveItemTier(normalized);
  const baseBonus = Object.keys(normalized.baseBonus || {}).length > 0
    ? normalized.baseBonus
    : normalizeLegacyBonusMap(baseItem.bonus || {});
  const structureMultipliers = getBlueprintStructuralMultipliers(normalized);
  const structureBaseBonus = buildScaledBonusDelta(baseBonus, structureMultipliers.base);
  const structureImplicitBonus = buildScaledBonusDelta(normalized.implicitBonus || {}, structureMultipliers.implicit);
  const existingStats = [
    ...Object.keys(baseBonus || {}).filter(stat => Number(baseBonus?.[stat] || 0) > 0),
    ...Object.keys(normalized.implicitBonus || {}).filter(stat => Number(normalized.implicitBonus?.[stat] || 0) > 0),
  ];
  const statWeights = buildBlueprintStatWeights(normalized);
  const strongestFamily = sortFamilyScores(normalized.affinity || {})[0];
  const favoredStats = strongestFamily?.familyId
    ? [...(BLUEPRINT_AFFIX_FAMILIES[strongestFamily.familyId]?.stats || [])]
    : [...(ITEM_FAMILIES[normalized.family || ""]?.preferredStats || [])];
  const favoredStatWeightMultiplier = strongestFamily?.score >= 60 ? 5.5 : 3.2;
  const affixes = rollAffixes({
    rarity,
    itemTier,
    favoredStats,
    favoredStatWeights: statWeights,
    favoredStatWeightMultiplier,
    existingStats,
    randomFn,
  });
  const materialized = materializeItem({
    baseItem,
    rarity,
    tier: itemTier,
    affixes,
    baseBonusOverride: baseBonus,
    existingId: `bp_item_${normalized.id}_${normalized.materializationCount || 0}_${now}`,
    itemTierOverride: itemTier,
  });
  if (!materialized) return null;

  const nextItem = {
    ...materialized,
    legendaryPowerId: normalized.legendaryPowerId || materialized.legendaryPowerId || null,
    blueprintId: normalized.id,
    blueprintSourceName: normalized.sourceName,
    blueprintLevel: normalized.blueprintLevel || 0,
    powerTuneLevel: normalized.powerTuneLevel || 0,
    ascensionTier: normalized.ascensionTier || 0,
    blueprintStructureBonus: structureBaseBonus,
    blueprintImplicitStructureBonus: structureImplicitBonus,
    rating: 0,
  };
  const nextBaseBonus = roundBonusMap({
    ...(materialized.baseBonus || {}),
    ...(structureBaseBonus || {}),
  });
  const nextImplicitUpgradeBonus = roundBonusMap({
    ...(materialized.implicitUpgradeBonus || {}),
    ...(structureImplicitBonus || {}),
  });
  const nextBonus = roundBonusMap({
    ...(materialized.bonus || {}),
    ...(structureBaseBonus || {}),
    ...(structureImplicitBonus || {}),
  });
  return {
    ...nextItem,
    baseBonus: nextBaseBonus,
    implicitUpgradeBonus: nextImplicitUpgradeBonus,
    bonus: nextBonus,
    rating: calcItemRating({
      ...nextItem,
      baseBonus: nextBaseBonus,
      implicitUpgradeBonus: nextImplicitUpgradeBonus,
      bonus: nextBonus,
    }),
  };
}

export function buildBlueprintMaterializationPreview(blueprint = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return null;
  const baseItem =
    findBaseItemById(normalized.sourceBaseItemId) ||
    getFallbackBaseItem(normalized.slot, normalized.rarity);
  const affinityRanking = sortFamilyScores(normalized.affinity || {}).filter(entry => entry.score > 0).slice(0, 2);
  const structureMultipliers = getBlueprintStructuralMultipliers(normalized);
  const baseStats = Object.keys(normalized.baseBonus || {}).filter(stat => Number(normalized.baseBonus?.[stat] || 0) > 0);
  const implicitStats = Object.keys(normalized.implicitBonus || {}).filter(stat => Number(normalized.implicitBonus?.[stat] || 0) > 0);
  const likelyStats = buildBlueprintLikelyStats(normalized);
  const effectiveTier = getBlueprintEffectiveItemTier(normalized);
  return {
    slot: normalized.slot,
    rarity: normalized.rarity,
    family: normalized.family || baseItem?.family || null,
    familyName:
      normalized.familyName ||
      (normalized.family || baseItem?.family
        ? ITEM_FAMILIES[normalized.family || baseItem?.family || ""]?.name || null
        : null),
    effectiveTier,
    effectiveRating: getBlueprintEffectiveBaseRating(normalized),
    affixCount: ITEM_RARITY_BLUEPRINT?.[normalized.rarity]?.affixCount ?? 0,
    baseStats,
    implicitStats,
    likelyStats,
    tierBias: getBlueprintTierBiasSummary(effectiveTier),
    structureBands: {
      base: getBlueprintStructureBand(structureMultipliers.base),
      implicit: getBlueprintStructureBand(structureMultipliers.implicit),
    },
    topFamilies: affinityRanking.map(entry => ({
      ...entry,
      meta: BLUEPRINT_AFFIX_FAMILIES[entry.familyId] || null,
      strengthLabel: getBlueprintAffinityStrengthLabel(entry.score),
    })),
    hasLegendaryPower: !!normalized.legendaryPowerId,
    powerTuneLevel: Math.max(0, Number(normalized.powerTuneLevel || 0)),
  };
}

export function materializeBlueprintLoadout(blueprints = [], activeBlueprints = {}, { now = Date.now() } = {}) {
  const normalizedBlueprints = (blueprints || []).map(normalizeBlueprintRecord).filter(Boolean);
  const byId = Object.fromEntries(normalizedBlueprints.map(blueprint => [blueprint.id, blueprint]));
  const weaponBlueprint = byId[activeBlueprints?.weapon] || null;
  const armorBlueprint = byId[activeBlueprints?.armor] || null;
  return {
    weapon: weaponBlueprint ? materializeBlueprintItem(weaponBlueprint, { now }) : null,
    armor: armorBlueprint ? materializeBlueprintItem(armorBlueprint, { now: now + 1 }) : null,
  };
}

export function consumeBlueprintMaterialization(blueprints = [], activeBlueprints = {}, { now = Date.now() } = {}) {
  const activeIds = new Set(Object.values(activeBlueprints || {}).filter(Boolean));
  return (blueprints || []).map(rawBlueprint => {
    const blueprint = normalizeBlueprintRecord(rawBlueprint);
    if (!blueprint?.id || !activeIds.has(blueprint.id)) return blueprint;
    return {
      ...blueprint,
      materializationCount: Math.max(0, Number(blueprint.materializationCount || 0)) + 1,
      updatedAt: now,
    };
  });
}

export function ensureValidActiveBlueprints(blueprints = [], activeBlueprints = {}) {
  const normalizedBlueprints = (blueprints || []).map(normalizeBlueprintRecord).filter(Boolean);
  const loadout = {
    ...createEmptyBlueprintLoadout(),
    ...(activeBlueprints || {}),
  };
  const bySlot = {
    weapon: normalizedBlueprints.filter(blueprint => blueprint.slot === "weapon"),
    armor: normalizedBlueprints.filter(blueprint => blueprint.slot === "armor"),
  };

  for (const slot of ["weapon", "armor"]) {
    const activeId = loadout[slot];
    if (activeId && bySlot[slot].some(blueprint => blueprint.id === activeId)) continue;
    loadout[slot] = bySlot[slot][0]?.id || null;
  }

  return loadout;
}
