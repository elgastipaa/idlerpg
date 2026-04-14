import { PRESTIGE_BRANCHES, PRESTIGE_RANKS, PRESTIGE_TREE_NODES } from "../../data/prestige";
import { getRunSigilPrestigeModifiers } from "../../data/runSigils";
import { refreshStats } from "../combat/statEngine";

const BONUS_KEYS = [
  "damagePct",
  "defensePct",
  "hpPct",
  "flatDamage",
  "flatDefense",
  "healthRegen",
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
];

const BRANCH_SCOPE = Object.fromEntries(
  PRESTIGE_BRANCHES.map(branch => [branch.id, branch.scope || "universal"])
);

const UNIVERSAL_PRESTIGE_KEYS = new Set([
  "damagePct",
  "defensePct",
  "hpPct",
  "flatDamage",
  "flatDefense",
  "healthRegen",
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
]);

function emptyBonuses() {
  return BONUS_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

function addEffects(target, effects = {}, multiplier = 1) {
  for (const [key, value] of Object.entries(effects)) {
    target[key] = (target[key] || 0) + value * multiplier;
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

export function getPrestigeRank(level = 0) {
  const numericLevel = Math.max(0, Number(level || 0));
  const unlocked = PRESTIGE_RANKS.filter(rank => rank.level <= numericLevel);
  return unlocked[unlocked.length - 1] || null;
}

export function getNextPrestigeRank(level = 0) {
  const numericLevel = Math.max(0, Number(level || 0));
  return PRESTIGE_RANKS.find(rank => rank.level > numericLevel) || null;
}

export function getPrestigeNodeLevel(prestige, nodeId) {
  return prestige?.nodes?.[nodeId] || 0;
}

function getPrestigeTreeInvestedLevels(prestige = {}) {
  return Object.values(prestige?.nodes || {}).reduce((total, level) => total + Math.max(0, level || 0), 0);
}

function sanitizeWholeNumber(value, { fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(numeric)));
}

function sanitizeReasonableWholeNumber(value, { fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  if (numeric < min || numeric > max) return fallback;
  return Math.floor(numeric);
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

export function createEmptyPrestigeCycleProgress(seed = {}) {
  return {
    kills: sanitizeReasonableWholeNumber(seed.kills, { fallback: 0, max: 1_000_000 }),
    bossKills: sanitizeReasonableWholeNumber(seed.bossKills, { fallback: 0, max: 100_000 }),
    maxTier: Math.max(1, sanitizeReasonableWholeNumber(seed.maxTier ?? 1, { fallback: 1, max: 250 })),
    maxLevel: Math.max(1, sanitizeReasonableWholeNumber(seed.maxLevel ?? 1, { fallback: 1, max: 2_000 })),
    bestItemRating: sanitizeReasonableWholeNumber(seed.bestItemRating, { fallback: 0, max: 100_000 }),
  };
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
  const runSigil = getRunSigilPrestigeModifiers(state?.combat?.activeRunSigilId || "free");

  const tierEchoes =
    progress.maxTier >= 2
      ? Math.max(0, Math.floor((1 + Math.floor(Math.max(0, progress.maxTier - 2) / 4)) * (runSigil.tierEchoMult || 1)))
      : 0;
  const levelEchoes =
    progress.maxLevel >= 8
      ? Math.max(0, Math.floor((1 + Math.floor(Math.max(0, progress.maxLevel - 8) / 18)) * (runSigil.levelEchoMult || 1)))
      : 0;
  const lootEchoes =
    progress.bestItemRating >= 120
      ? 1 + Math.floor(Math.max(0, progress.bestItemRating - 120) / 320)
      : 0;
  const momentumEchoes =
    progress.maxTier >= 15
      ? 2
      : progress.maxTier >= 8
        ? 1
        : 0;

  const echoes = Math.max(0, tierEchoes + levelEchoes + lootEchoes + momentumEchoes);
  const hasMinimumRun =
    progress.maxTier >= 3 ||
    progress.maxLevel >= 10 ||
    progress.kills >= 50;

  return {
    echoes,
    ready: hasMinimumRun && echoes > 0,
    progress,
    breakdown: [
      { id: "tier", label: "Tier maximo", value: progress.maxTier, echoes: tierEchoes },
      { id: "level", label: "Nivel maximo", value: progress.maxLevel, echoes: levelEchoes },
      { id: "loot", label: "Mejor item", value: progress.bestItemRating, echoes: lootEchoes },
      { id: "momentum", label: "Momentum", value: progress.maxTier >= 18 ? "Late" : progress.maxTier >= 10 ? "Mid" : "-", echoes: momentumEchoes },
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
    nextRank: getNextPrestigeRank(state.prestige?.level || 0),
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

export function canPurchasePrestigeNode(state, node) {
  const prestige = state.prestige || {};
  const currentLevel = getPrestigeNodeLevel(prestige, node.id);
  const availableEchoes = prestige.echoes || 0;
  const cost = getPrestigeNodeCost(prestige, node);

  if (currentLevel >= (node.maxLevel || 1)) return { ok: false, reason: "maxed", cost };
  if (!isPrestigeNodeActiveForPlayer(node, state.player)) return { ok: false, reason: "class", cost };

  const missing = (node.requires || []).filter(reqId => getPrestigeNodeLevel(prestige, reqId) <= 0);
  if (missing.length > 0) return { ok: false, reason: "requires", cost, missing };

  if (cost == null || availableEchoes < cost) return { ok: false, reason: "echoes", cost };

  return { ok: true, reason: null, cost };
}

export function computePrestigeBonuses(prestige = {}, player = {}) {
  const bonuses = emptyBonuses();
  const nodes = prestige.nodes || {};
  const level = prestige.level || 0;

  for (const rank of PRESTIGE_RANKS) {
    if (rank.level > level) break;
    addEffects(bonuses, rank.passiveEffects || {});
  }

  for (const node of PRESTIGE_TREE_NODES) {
    const nodeLevel = nodes[node.id] || 0;
    if (!nodeLevel) continue;
    addEffects(bonuses, filterNodeEffectsForPlayer(node, player, node.effectsPerLevel || {}), nodeLevel);
  }

  return bonuses;
}

export function getPrestigeBonusRows(prestige = {}, player = {}) {
  const bonuses = computePrestigeBonuses(prestige, player);
  return Object.entries(bonuses).filter(([, value]) => Math.abs(value) > 0);
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

  return {
    level,
    echoes: safeEchoes,
    spentEchoes: safeSpentEchoes,
    totalEchoesEarned: safeTotalEchoesEarned,
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
