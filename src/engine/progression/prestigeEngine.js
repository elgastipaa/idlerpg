import { PRESTIGE_RANKS, PRESTIGE_TREE_NODES } from "../../data/prestige";
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
  "cooldownReduction",
  "skillPower",
  "sellValueBonus",
  "upgradeCostReduction",
  "rerollCostReduction",
  "polishCostReduction",
  "reforgeCostReduction",
  "ascendCostReduction",
  "fuseRarityBonus",
  "reforgeOptionCount",
];

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

export function getPrestigeRank(level = 0) {
  return PRESTIGE_RANKS.find(rank => rank.level === level) || null;
}

export function getNextPrestigeRank(level = 0) {
  return PRESTIGE_RANKS.find(rank => rank.level === level + 1) || null;
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

export function getPrestigeNodeCost(prestige, node) {
  const level = getPrestigeNodeLevel(prestige, node.id);
  if (level >= (node.maxLevel || 1)) return null;

  const baseCost = getNodeBaseCostAtLevel(node, level);
  if (baseCost == null) return null;

  const tierMultiplier = 1 + Math.max(0, (node.tier || 1) - 1) * 0.28;
  const levelMultiplier = 1 + level * 0.14;
  const investedLevels = getPrestigeTreeInvestedLevels(prestige);
  const progressionMultiplier = 1 + Math.max(0, investedLevels - 3) * 0.015;

  return Math.max(1, Math.round(baseCost * tierMultiplier * levelMultiplier * progressionMultiplier));
}

export function calculatePrestigeEchoGain(state) {
  const nextRank = getNextPrestigeRank(state.prestige?.level || 0);
  if (!nextRank) return 0;

  const extraTier = Math.max(0, (state.combat?.maxTier || 1) - nextRank.requiredTier);
  const extraLevel = Math.max(0, (state.player?.level || 1) - nextRank.requiredLevel);
  const bossPush = Math.floor((state.stats?.bossKills || 0) / 10);

  return nextRank.echoBase + Math.floor(extraTier / 2) + Math.floor(extraLevel / 12) + Math.min(3, bossPush);
}

export function canPrestige(state) {
  const nextRank = getNextPrestigeRank(state.prestige?.level || 0);
  if (!nextRank) {
    return { ok: false, nextRank: null, reason: "max" };
  }

  if ((state.player?.level || 1) < nextRank.requiredLevel) {
    return { ok: false, nextRank, reason: "level" };
  }

  if ((state.player?.gold || 0) < nextRank.goldCost) {
    return { ok: false, nextRank, reason: "gold" };
  }

  return { ok: true, nextRank, reason: null };
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
    if (!isPrestigeNodeActiveForPlayer(node, player)) continue;
    addEffects(bonuses, node.effectsPerLevel || {}, nodeLevel);
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

  return {
    level,
    echoes: Math.max(0, prestige.echoes ?? fallbackEchoes),
    spentEchoes: Math.max(0, prestige.spentEchoes || 0),
    totalEchoesEarned: Math.max(0, prestige.totalEchoesEarned ?? ((prestige.echoes ?? fallbackEchoes) + (prestige.spentEchoes || 0))),
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
