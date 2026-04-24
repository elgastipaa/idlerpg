import { PRESTIGE_BRANCHES, PRESTIGE_TREE_NODES } from "../../data/prestige";
import { getRunSigilPrestigeModifiers } from "../../data/runSigils";
import { refreshStats } from "../combat/statEngine";
import { hasAbyssUnlock } from "./abyssProgression";

const BONUS_KEYS = [
  "damagePct",
  "defensePct",
  "hpPct",
  "flatDamage",
  "flatDefense",
  "healthRegen",
  "regenPctMaxHp",
  "flatCrit",
  "goldPct",
  "xpPct",
  "attackSpeed",
  "lifesteal",
  "dodgeChance",
  "blockChance",
  "critDamage",
  "critOnLowHp",
  "damageOnKill",
  "thorns",
  "thornsDefenseRatio",
  "essenceBonus",
  "lootBonus",
  "luck",
  "multiHitChance",
  "flowHits",
  "markChance",
  "markEffectPerStack",
  "flowBonusMult",
  "markTransferPct",
  "freshTargetDamage",
  "chainBurst",
  "volatileCasting",
  "controlMastery",
  "cataclysm",
  "sellValueBonus",
  "upgradeCostReduction",
  "rerollCostReduction",
  "polishCostReduction",
  "reforgeCostReduction",
  "ascendCostReduction",
  "ascendImprintCostReduction",
  "reforgeOptionCount",
  "discoveredPowerBias",
  "abyssDamagePct",
  "abyssEnemyAffixPenaltyReduction",
  "abyssNormalEnemyPenaltyReduction",
  "abyssLootQuality",
  "abyssEssenceMult",
  "abyssBossMechanicMitigation",
  "abyssMutatorOffensePct",
];

const BRANCH_SCOPE = Object.fromEntries(
  PRESTIGE_BRANCHES.map(branch => [branch.id, branch.scope || "universal"])
);
const BRANCH_BY_ID = Object.fromEntries(
  PRESTIGE_BRANCHES.map(branch => [branch.id, branch])
);

const UNIVERSAL_PRESTIGE_KEYS = new Set([
  "damagePct",
  "defensePct",
  "hpPct",
  "flatDamage",
  "flatDefense",
  "healthRegen",
  "regenPctMaxHp",
  "flatCrit",
  "goldPct",
  "xpPct",
  "attackSpeed",
  "lifesteal",
  "dodgeChance",
  "blockChance",
  "critDamage",
  "critOnLowHp",
  "damageOnKill",
  "thorns",
  "thornsDefenseRatio",
  "essenceBonus",
  "lootBonus",
  "luck",
  "multiHitChance",
  "sellValueBonus",
  "upgradeCostReduction",
  "rerollCostReduction",
  "polishCostReduction",
  "reforgeCostReduction",
  "ascendCostReduction",
  "ascendImprintCostReduction",
  "reforgeOptionCount",
  "discoveredPowerBias",
  "abyssDamagePct",
  "abyssEnemyAffixPenaltyReduction",
  "abyssNormalEnemyPenaltyReduction",
  "abyssLootQuality",
  "abyssEssenceMult",
  "abyssBossMechanicMitigation",
  "abyssMutatorOffensePct",
]);

const FIRST_PRESTIGE_MIN_ECHOES = 1;
const PRESTIGE_BASE_SCORE_PER_ECHO = 15;
const PRESTIGE_LEVEL_SCORE_WEIGHT = 0.35;
const PRESTIGE_BOSS_SCORE_WEIGHT = 5;
const PRESTIGE_RESONANCE_BRACKETS = [
  { upto: 2, effectsPerEcho: { damagePct: 0.025, goldPct: 0.04, xpPct: 0.02 } },
  { upto: 8, effectsPerEcho: { damagePct: 0.01, goldPct: 0.02, xpPct: 0.012, hpPct: 0.008 } },
  { upto: 20, effectsPerEcho: { damagePct: 0.005, goldPct: 0.012, xpPct: 0.008, hpPct: 0.004, essenceBonus: 0.015 } },
  { upto: 50, effectsPerEcho: { damagePct: 0.0025, goldPct: 0.006, xpPct: 0.004, hpPct: 0.002, essenceBonus: 0.008, lootBonus: 0.0015 } },
  { upto: Number.POSITIVE_INFINITY, effectsPerEcho: { damagePct: 0.001, goldPct: 0.003, xpPct: 0.002, hpPct: 0.001, essenceBonus: 0.004, lootBonus: 0.0008 } },
];

function emptyBonuses() {
  return BONUS_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

function addEffects(target, effects = {}, multiplier = 1) {
  for (const [key, value] of Object.entries(effects || {})) {
    target[key] = (target[key] || 0) + Number(value || 0) * multiplier;
  }
  return target;
}

function filterNodeEffectsForPlayer(node, player, effects = {}) {
  const branchScope = BRANCH_SCOPE[node?.branch] || "universal";
  const classMatches = branchScope === "universal" || !player?.class || player.class === branchScope;
  const specMatches =
    !node?.requiresSpecialization || !player?.specialization || player.specialization === node.requiresSpecialization;

  if (classMatches && specMatches) {
    return effects;
  }

  const filtered = {};
  for (const [key, value] of Object.entries(effects || {})) {
    if (UNIVERSAL_PRESTIGE_KEYS.has(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

function sanitizeReasonableWholeNumber(value, { fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  if (numeric < min || numeric > max) return fallback;
  return Math.floor(numeric);
}

export function getPrestigeNodeLevel(prestige, nodeId) {
  return prestige?.nodes?.[nodeId] || 0;
}

function getPrestigeTreeInvestedLevels(prestige = {}) {
  return Object.values(prestige?.nodes || {}).reduce((total, level) => total + Math.max(0, level || 0), 0);
}

function getNodeBaseCostAtLevel(node, level = 0) {
  const costs = node?.costs || [];
  if (!costs.length) return null;
  if (costs[level] != null) return costs[level];

  const last = costs[costs.length - 1];
  const overflow = Math.max(0, level - (costs.length - 1));
  return Math.ceil(last * Math.pow(1.35, overflow));
}

function getPrestigeTreeMaxSpend() {
  return PRESTIGE_TREE_NODES.reduce((total, node) => {
    const maxLevel = Math.max(0, Number(node?.maxLevel || 0));
    let nodeTotal = 0;
    for (let level = 0; level < maxLevel; level += 1) {
      nodeTotal += getNodeBaseCostAtLevel(node, level) || 0;
    }
    return total + nodeTotal;
  }, 0);
}

const PRESTIGE_TREE_MAX_SPEND = getPrestigeTreeMaxSpend();
const PRESTIGE_ECHO_STORAGE_CAP = Math.max(1000, PRESTIGE_TREE_MAX_SPEND * 8);

export function getPrestigeResonanceBonuses(totalEchoesEarned = 0) {
  const safeEchoes = Math.max(0, Math.floor(Number(totalEchoesEarned || 0)));
  const bonuses = emptyBonuses();
  let consumed = 0;

  for (const bracket of PRESTIGE_RESONANCE_BRACKETS) {
    const limit = Number(bracket?.upto || 0);
    if (safeEchoes <= consumed) break;
    const echoesInBracket = Math.max(0, Math.min(safeEchoes, limit) - consumed);
    if (echoesInBracket <= 0) continue;
    addEffects(bonuses, bracket.effectsPerEcho || {}, echoesInBracket);
    consumed += echoesInBracket;
  }

  return bonuses;
}

export function getPrestigeResonanceDeltaForNextEcho(totalEchoesEarned = 0) {
  const current = getPrestigeResonanceBonuses(totalEchoesEarned);
  const next = getPrestigeResonanceBonuses(Math.max(0, Number(totalEchoesEarned || 0)) + 1);
  const delta = emptyBonuses();

  for (const key of BONUS_KEYS) {
    delta[key] = Number(next[key] || 0) - Number(current[key] || 0);
  }

  return delta;
}

export function getPrestigeResonanceSummary(prestige = {}) {
  const totalEchoesEarned = Math.max(0, Math.floor(Number(prestige?.totalEchoesEarned || 0)));
  const bonuses = getPrestigeResonanceBonuses(totalEchoesEarned);
  const nextEchoDelta = getPrestigeResonanceDeltaForNextEcho(totalEchoesEarned);
  return {
    totalEchoesEarned,
    bonuses,
    bonusRows: Object.entries(bonuses).filter(([, value]) => Math.abs(Number(value || 0)) > 0),
    nextEchoRows: Object.entries(nextEchoDelta).filter(([, value]) => Math.abs(Number(value || 0)) > 0),
  };
}

export function createEmptyPrestigeCycleProgress(seed = {}) {
  return {
    kills: sanitizeReasonableWholeNumber(seed.kills, { fallback: 0, max: 1_000_000 }),
    bossKills: sanitizeReasonableWholeNumber(seed.bossKills, { fallback: 0, max: 100_000 }),
    maxTier: Math.max(1, sanitizeReasonableWholeNumber(seed.maxTier ?? 1, { fallback: 1, max: 250 })),
    maxLevel: Math.max(1, sanitizeReasonableWholeNumber(seed.maxLevel ?? 1, { fallback: 1, max: 2_000 })),
    bestItemRating: sanitizeReasonableWholeNumber(seed.bestItemRating, { fallback: 0, max: 100_000 }),
  };
}

export function getPrestigeMomentumMultiplier(currentTier = 0, historicBestTier = 0) {
  const current = Math.max(0, Number(currentTier || 0));
  const best = Math.max(0, Number(historicBestTier || 0));
  if (best <= 0) return 1;

  const ratio = current / Math.max(1, best);
  if (current >= best + 5) return 2.2;
  if (ratio >= 1) return 1.65;
  if (ratio >= 0.8) return 1.22;
  if (ratio >= 0.5) return 1;
  return 0.6;
}

function getPrestigeMomentumLabel(multiplier = 1, currentTier = 0, historicBestTier = 0) {
  const current = Math.max(0, Number(currentTier || 0));
  const best = Math.max(0, Number(historicBestTier || 0));
  if (best <= 0) return "Primera medicion";
  if (current >= best + 5) return "Rompe record";
  if (current >= best) return "Nuevo record";
  if (multiplier >= 1.3) return "Cerca del record";
  if (multiplier >= 1) return "Mantiene el ritmo";
  return "Muy por debajo del record";
}

export function getPrestigeNodeCost(prestige, node) {
  const level = getPrestigeNodeLevel(prestige, node.id);
  if (level >= (node.maxLevel || 1)) return null;

  const baseCost = getNodeBaseCostAtLevel(node, level);
  if (baseCost == null) return null;

  const tierMultiplier = 1 + Math.max(0, (node.tier || 1) - 1) * 0.18;
  const levelMultiplier = 1 + level * 0.1;
  const investedLevels = getPrestigeTreeInvestedLevels(prestige);
  const progressionMultiplier = 1 + Math.max(0, investedLevels - 6) * 0.01;

  return Math.max(1, Math.round(baseCost * tierMultiplier * levelMultiplier * progressionMultiplier));
}

function getPrestigeProgressSnapshot(state = {}) {
  const player = state.player || {};
  const cycle = createEmptyPrestigeCycleProgress(state.combat?.prestigeCycle || {
    maxTier: state.combat?.maxTier || state.combat?.currentTier || 1,
    maxLevel: player.level || 1,
  });

  return {
    ...cycle,
    currentHpRatio: Math.max(0, Math.min(1, Number((player.hp || 0) / Math.max(1, player.maxHp || 1)))),
  };
}

export function getPrestigePreview(state = {}) {
  const progress = getPrestigeProgressSnapshot(state);
  const runSigil = getRunSigilPrestigeModifiers(
    state?.combat?.activeRunSigilIds || state?.combat?.activeRunSigilId || "free"
  );
  const historicBestTier = Math.max(0, Number(state?.prestige?.bestHistoricTier || 0));
  const totalEchoesEarned = Math.max(0, Number(state?.prestige?.totalEchoesEarned || 0));
  const tierBaseScore = Math.pow(Math.max(1, progress.maxTier), 1.4) * Math.max(0, Number(runSigil.tierEchoMult || 1));
  const levelBaseScore =
    Math.max(0, Number(progress.maxLevel || 1)) *
    PRESTIGE_LEVEL_SCORE_WEIGHT *
    Math.max(0, Number(runSigil.levelEchoMult || 1));
  const bossBaseScore = Math.max(0, Number(progress.bossKills || 0)) * PRESTIGE_BOSS_SCORE_WEIGHT;
  const rawBaseScore = tierBaseScore + levelBaseScore + bossBaseScore;
  const baseEchoes = Math.max(0, Math.floor(rawBaseScore / PRESTIGE_BASE_SCORE_PER_ECHO));
  const momentumMultiplier = getPrestigeMomentumMultiplier(progress.maxTier, historicBestTier);
  const echoedWithMomentum = Math.max(0, Math.floor(baseEchoes * momentumMultiplier));
  const momentumDeltaEchoes = echoedWithMomentum - baseEchoes;
  const firstPrestigeFloorDelta =
    totalEchoesEarned <= 0
      ? Math.max(0, FIRST_PRESTIGE_MIN_ECHOES - echoedWithMomentum)
      : 0;
  const echoes = echoedWithMomentum + firstPrestigeFloorDelta;
  const isFirstPrestige = totalEchoesEarned <= 0;
  const hasMinimumRun = isFirstPrestige
    ? (
        progress.maxTier >= 6 ||
        progress.bossKills >= 1 ||
        progress.maxLevel >= 14
      )
    : (
        progress.maxTier >= 4 ||
        progress.maxLevel >= 12 ||
        progress.kills >= 80
      );
  const minimumRunLabel = isFirstPrestige
    ? "Primer prestige: Tier 6, 1 boss o Nivel 14"
    : "Minimo: Tier 4, Nivel 12 o 80 bajas";

  return {
    echoes,
    ready: hasMinimumRun && echoes > 0,
    progress,
    isFirstPrestige,
    minimumRunLabel,
    momentum: {
      historicBestTier,
      currentTier: progress.maxTier,
      ratioToBest:
        historicBestTier > 0
          ? progress.maxTier / Math.max(1, historicBestTier)
          : 1,
      multiplier: momentumMultiplier,
      label: getPrestigeMomentumLabel(momentumMultiplier, progress.maxTier, historicBestTier),
      baseEchoes,
      momentumDeltaEchoes,
      rawBaseScore,
      normalizedBaseScorePerEcho: PRESTIGE_BASE_SCORE_PER_ECHO,
    },
    breakdown: [
      { id: "base", label: "Base", value: progress.maxTier, echoes: baseEchoes },
      { id: "momentum", label: "Momentum", value: `x${momentumMultiplier.toFixed(1)}`, echoes: momentumDeltaEchoes },
      ...(firstPrestigeFloorDelta > 0 ? [{ id: "first_floor", label: "Primer spike", value: `${FIRST_PRESTIGE_MIN_ECHOES} ecos min`, echoes: firstPrestigeFloorDelta }] : []),
    ],
  };
}

export function calculatePrestigeEchoGain(state) {
  return getPrestigePreview(state).echoes;
}

export function canPrestige(state) {
  const preview = getPrestigePreview(state);
  return {
    ok: preview.ready,
    reason: preview.ready ? null : "progress",
    echoes: preview.echoes,
    preview,
  };
}

export function isPrestigeNodeActiveForPlayer(node, player) {
  if (node.requiresClass && player?.class !== node.requiresClass) return false;
  if (node.requiresSpecialization && player?.specialization !== node.requiresSpecialization) return false;
  return true;
}

export function isPrestigeBranchUnlocked(state = {}, branch = {}) {
  const unlockKey = branch?.unlockKey || null;
  return !unlockKey || hasAbyssUnlock(state?.abyss || {}, unlockKey);
}

export function canPurchasePrestigeNode(state, node) {
  const prestige = state.prestige || {};
  const currentLevel = getPrestigeNodeLevel(prestige, node.id);
  const availableEchoes = prestige.echoes || 0;
  const cost = getPrestigeNodeCost(prestige, node);
  const branch = BRANCH_BY_ID[node?.branch] || null;

  if (currentLevel >= (node.maxLevel || 1)) return { ok: false, reason: "maxed", cost };
  if (!isPrestigeBranchUnlocked(state, branch)) return { ok: false, reason: "unlock", cost, unlockKey: branch?.unlockKey || node?.unlockKey || null };
  if (!isPrestigeNodeActiveForPlayer(node, state.player)) return { ok: false, reason: "class", cost };

  const missing = (node.requires || []).filter(reqId => getPrestigeNodeLevel(prestige, reqId) <= 0);
  if (missing.length > 0) return { ok: false, reason: "requires", cost, missing };
  const excluded = (node.excludes || []).filter(reqId => getPrestigeNodeLevel(prestige, reqId) > 0);
  if (excluded.length > 0) return { ok: false, reason: "exclusive", cost, excluded };

  if (cost == null || availableEchoes < cost) return { ok: false, reason: "echoes", cost };

  return { ok: true, reason: null, cost };
}

export function computePrestigeBonuses(prestige = {}, player = {}) {
  const bonuses = getPrestigeResonanceBonuses(prestige.totalEchoesEarned || 0);
  const nodes = prestige.nodes || {};

  for (const node of PRESTIGE_TREE_NODES) {
    const nodeLevel = nodes[node.id] || 0;
    if (!nodeLevel) continue;
    addEffects(bonuses, filterNodeEffectsForPlayer(node, player, node.effectsPerLevel || {}), nodeLevel);
  }

  return bonuses;
}

export function getPrestigeBonusRows(prestige = {}, player = {}) {
  const bonuses = computePrestigeBonuses(prestige, player);
  return Object.entries(bonuses).filter(([, value]) => Math.abs(Number(value || 0)) > 0);
}

export function normalizePrestigeState(prestige = {}) {
  const level = prestige.level || 0;
  const hasTreeData = prestige.echoes != null || prestige.spentEchoes != null || prestige.nodes;
  const fallbackEchoes = hasTreeData ? 0 : level * 6;
  const safeEchoes = sanitizeReasonableWholeNumber(prestige.echoes ?? fallbackEchoes, {
    fallback: fallbackEchoes,
    max: PRESTIGE_ECHO_STORAGE_CAP,
  });
  const safeSpentEchoes = sanitizeReasonableWholeNumber(prestige.spentEchoes || 0, {
    fallback: 0,
    max: PRESTIGE_TREE_MAX_SPEND,
  });
  const safeTotalEchoesEarned = sanitizeReasonableWholeNumber(
    prestige.totalEchoesEarned ?? (safeEchoes + safeSpentEchoes),
    {
      fallback: safeEchoes + safeSpentEchoes,
      max: PRESTIGE_ECHO_STORAGE_CAP + PRESTIGE_TREE_MAX_SPEND,
    }
  );
  const safeBestHistoricTier = sanitizeReasonableWholeNumber(prestige.bestHistoricTier || 0, {
    fallback: 0,
    max: 10_000,
  });

  return {
    level,
    echoes: safeEchoes,
    spentEchoes: safeSpentEchoes,
    totalEchoesEarned: safeTotalEchoesEarned,
    bestHistoricTier: safeBestHistoricTier,
    nodes: { ...(prestige.nodes || {}) },
  };
}

export function syncPrestigeBonuses(player, prestige) {
  const prestigeBonuses = computePrestigeBonuses(prestige, player);
  const refreshed = refreshStats({
    ...player,
    prestigeBonuses,
  });
  return {
    ...refreshed,
    hp: Math.min(refreshed.maxHp, refreshed.hp ?? refreshed.maxHp),
  };
}
