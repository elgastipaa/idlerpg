import { ACTIVE_GOALS } from "../../data/activeGoals";
import {
  resolveAccountBand,
  scaleBandReward,
  scaleBandTarget,
} from "./accountBanding";
import { buildGoalDeltaObjective, getGoalProgress } from "./goalEngine";
import { calcStats } from "../combat/statEngine";

const GOAL_BY_ID = Object.fromEntries(ACTIVE_GOALS.map(goal => [goal.id, goal]));

const WEEKLY_LEDGER_LANES = [
  {
    id: "push",
    templates: [
      { id: "tier_push_entry", goalId: "goal_reach_tier_5", gainTarget: 2, laneLabel: "Push semanal" },
      { id: "tier_push", goalId: "goal_reach_tier_10", gainTarget: 4, laneLabel: "Push semanal" },
      { id: "tier_push_high", goalId: "goal_reach_tier_15", gainTarget: 3, laneLabel: "Push semanal" },
      { id: "tier_push_late", goalId: "goal_reach_tier_20", gainTarget: 2, laneLabel: "Push semanal" },
      { id: "tier_push_cap", goalId: "goal_reach_tier_25", gainTarget: 1, laneLabel: "Push semanal" },
      { id: "boss_push", goalId: "goal_boss_5", gainTarget: 2, laneLabel: "Push semanal" },
      { id: "boss_chain", goalId: "goal_boss_20", gainTarget: 5, laneLabel: "Push semanal" },
      { id: "block_loop", goalId: "goal_blocks_40", gainTarget: 20, laneLabel: "Push semanal", requiresAll: ["block"] },
      { id: "evade_loop", goalId: "goal_evades_35", gainTarget: 18, laneLabel: "Push semanal", requiresAll: ["evade"] },
      { id: "bleed_boss_route", goalId: "goal_boss_bleed_6", gainTarget: 3, laneLabel: "Push semanal", requiresAll: ["bleed"] },
      { id: "fracture_boss_route", goalId: "goal_boss_fracture_6", gainTarget: 3, laneLabel: "Push semanal", requiresAll: ["fracture"] },
      {
        id: "dual_status_route",
        goalId: "goal_boss_dual_status_4",
        gainTarget: 2,
        laneLabel: "Push semanal",
        requiresAtLeast: { count: 2, tags: ["bleed", "fracture", "mark"] },
      },
      { id: "guard_play_route", goalId: "goal_boss_guard_play_6", gainTarget: 3, laneLabel: "Push semanal", requiresAny: ["block", "evade"] },
      { id: "kill_mid", goalId: "goal_kills_250", gainTarget: 180, laneLabel: "Push semanal" },
      { id: "kill_push", goalId: "goal_kills_1000", gainTarget: 300, laneLabel: "Push semanal" },
      { id: "rare_push", goalId: "goal_rare_25", gainTarget: 12, laneLabel: "Push semanal" },
      { id: "epic_push", goalId: "goal_epic_10", gainTarget: 4, laneLabel: "Push semanal" },
      { id: "legendary_ping", goalId: "goal_legendary_5", gainTarget: 1, laneLabel: "Push semanal" },
      { id: "t1_push", goalId: "goal_t1_20", gainTarget: 5, laneLabel: "Push semanal" },
      { id: "perfect_push", goalId: "goal_perfect_10", gainTarget: 3, laneLabel: "Push semanal" },
      { id: "rating_mid", goalId: "goal_best_rating_150", gainTarget: 18, laneLabel: "Push semanal" },
      { id: "rating_push", goalId: "goal_best_rating_400", gainTarget: 35, laneLabel: "Push semanal" },
    ],
  },
  {
    id: "craft",
    templates: [
      { id: "upgrade_loop", goalId: "goal_upgrade_20", gainTarget: 6, laneLabel: "Forja semanal" },
      { id: "upgrade_dense", goalId: "goal_upgrade_20", gainTarget: 10, laneLabel: "Forja semanal" },
      { id: "extract_loop", goalId: "goal_extract_25", gainTarget: 8, laneLabel: "Forja semanal" },
      { id: "extract_dense", goalId: "goal_extract_25", gainTarget: 12, laneLabel: "Forja semanal" },
      { id: "reforge_loop", goalId: "goal_reforge_8", gainTarget: 3, laneLabel: "Forja semanal" },
      { id: "reforge_dense", goalId: "goal_reforge_8", gainTarget: 5, laneLabel: "Forja semanal" },
      { id: "polish_loop", goalId: "goal_polish_12", gainTarget: 4, laneLabel: "Forja semanal" },
      { id: "polish_dense", goalId: "goal_polish_12", gainTarget: 6, laneLabel: "Forja semanal" },
      { id: "reroll_loop", goalId: "goal_reroll_10", gainTarget: 4, laneLabel: "Forja semanal" },
      { id: "reroll_dense", goalId: "goal_reroll_10", gainTarget: 6, laneLabel: "Forja semanal" },
      { id: "sell_loop", goalId: "goal_sell_50", gainTarget: 22, laneLabel: "Forja semanal" },
      { id: "sell_dense", goalId: "goal_sell_50", gainTarget: 32, laneLabel: "Forja semanal" },
      { id: "ascend_loop", goalId: "goal_ascend_6", gainTarget: 2, laneLabel: "Forja semanal" },
    ],
  },
  {
    id: "meta",
    templates: [
      { id: "prestige_loop", goalId: "goal_first_prestige", gainTarget: 1, laneLabel: "Meta semanal" },
      { id: "prestige_chain", goalId: "goal_prestige_3", gainTarget: 1, laneLabel: "Meta semanal" },
      { id: "prestige_chain_dense", goalId: "goal_prestige_3", gainTarget: 2, laneLabel: "Meta semanal" },
      { id: "echo_board", goalId: "goal_buy_relic_5", gainTarget: 2, laneLabel: "Meta semanal" },
      { id: "echo_board_dense", goalId: "goal_buy_relic_5", gainTarget: 3, laneLabel: "Meta semanal" },
      { id: "talent_bootstrap", goalId: "goal_talents_3", gainTarget: 2, laneLabel: "Meta semanal" },
      { id: "talent_growth", goalId: "goal_talents_12", gainTarget: 3, laneLabel: "Meta semanal" },
      { id: "late_push_meta", goalId: "goal_reach_tier_25", gainTarget: 1, laneLabel: "Meta semanal" },
      { id: "master_hunt", goalId: "goal_legendary_5", gainTarget: 1, laneLabel: "Meta semanal" },
    ],
  },
];

const TEMPLATE_CAPABILITY_KEYS = Object.freeze(["bleed", "fracture", "mark", "block", "evade"]);

function hashString(input = "") {
  let hash = 2166136261;
  const source = String(input || "");
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function getTemplateCapabilities(state = {}) {
  const empty = {
    bleed: false,
    fracture: false,
    mark: false,
    block: false,
    evade: false,
  };
  try {
    const stats = calcStats(state?.player || {});
    return {
      bleed: Number(stats?.bleedChance || 0) > 0,
      fracture: Number(stats?.fractureChance || 0) > 0,
      mark: Number(stats?.markChance || 0) > 0,
      block: Number(stats?.blockChance || 0) > 0,
      evade: Number(stats?.dodgeChance || 0) > 0,
    };
  } catch (_error) {
    return empty;
  }
}

function hasCapability(capabilities = {}, key = "") {
  if (!TEMPLATE_CAPABILITY_KEYS.includes(key)) return false;
  return Boolean(capabilities?.[key]);
}

function isTemplateEligible(template = {}, capabilities = {}) {
  const requiresAll = Array.isArray(template?.requiresAll) ? template.requiresAll : [];
  if (requiresAll.some(capabilityKey => !hasCapability(capabilities, capabilityKey))) {
    return false;
  }
  const requiresAny = Array.isArray(template?.requiresAny) ? template.requiresAny : [];
  if (requiresAny.length > 0 && !requiresAny.some(capabilityKey => hasCapability(capabilities, capabilityKey))) {
    return false;
  }
  const requiresAtLeast = template?.requiresAtLeast;
  if (requiresAtLeast?.tags) {
    const tags = Array.isArray(requiresAtLeast.tags) ? requiresAtLeast.tags : [];
    const requiredCount = Math.max(1, Number(requiresAtLeast.count || 1));
    const availableCount = tags.filter(capabilityKey => hasCapability(capabilities, capabilityKey)).length;
    if (availableCount < requiredCount) return false;
  }
  return true;
}

function startOfUtcWeek(now = Date.now()) {
  const date = new Date(Number(now || Date.now()));
  const day = date.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - diffToMonday);
  return date.getTime();
}

function formatWeekKey(startAt = Date.now()) {
  const date = new Date(startAt);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildWeeklyReward(goal = {}, gainTarget = 1) {
  const baseReward = goal.reward || {};
  const scale = Math.max(1, Number(gainTarget || 1));
  return {
    gold: Math.max(140, Math.round(Number(baseReward.gold || 0) * 0.55) + scale * 14),
    essence: Math.max(10, Math.round(Number(baseReward.essence || 0) * 0.5) + Math.max(1, Math.floor(scale / 2))),
    talentPoints: baseReward.talentPoints ? 1 : 0,
  };
}

function pickWeeklyTemplate(
  templates = [],
  weekKey = "",
  seed = 0,
  laneId = "",
  capabilities = null
) {
  if (!templates.length) return null;
  const startIndex = hashString(`${weekKey}:${laneId}:${seed}`) % templates.length;
  for (let offset = 0; offset < templates.length; offset += 1) {
    const template = templates[(startIndex + offset) % templates.length];
    if (!capabilities || isTemplateEligible(template, capabilities)) {
      return template || null;
    }
  }
  return templates[startIndex] || null;
}

export function createEmptyWeeklyLedger() {
  return {
    version: 1,
    weekKey: null,
    startsAt: null,
    refreshCount: 0,
    contracts: [],
  };
}

export function getCurrentWeeklyLedgerWeekKey(now = Date.now()) {
  return formatWeekKey(startOfUtcWeek(now));
}

function buildWeeklyLedgerContract(state, template = {}, {
  weekKey = "",
  startsAt = Date.now(),
  accountBand = null,
} = {}) {
  const goal = GOAL_BY_ID[template.goalId];
  if (!goal) return null;
  const resolvedBand = accountBand?.id
    ? accountBand
    : resolveAccountBand(state);
  const gainTarget = scaleBandTarget(template.gainTarget, resolvedBand);
  const reward = scaleBandReward(buildWeeklyReward(goal, gainTarget), resolvedBand);
  return {
    id: `${weekKey}:${template.id}`,
    lane: template.id,
    laneLabel: template.laneLabel || "Contrato semanal",
    goalId: goal.id,
    baseline: Math.max(0, Number(getGoalProgress(state, goal) || 0)),
    gainTarget,
    reward,
    bandId: resolvedBand.id || "mid",
    bandSnapshot: {
      maxTier: Math.max(1, Number(resolvedBand?.snapshot?.maxTier || 1)),
      prestigeLevel: Math.max(0, Number(resolvedBand?.snapshot?.prestigeLevel || 0)),
      bestItemRating: Math.max(0, Number(resolvedBand?.snapshot?.bestItemRating || 0)),
      expeditionClaims: Math.max(0, Number(resolvedBand?.snapshot?.expeditionClaims || 0)),
      weeklyClaims: Math.max(0, Number(resolvedBand?.snapshot?.weeklyClaims || 0)),
    },
    claimed: false,
    startsAt,
  };
}

export function buildWeeklyLedger(state, now = Date.now(), previousLedger = null) {
  const startsAt = startOfUtcWeek(now);
  const weekKey = formatWeekKey(startsAt);
  const accountBand = resolveAccountBand(state);
  const templateCapabilities = getTemplateCapabilities(state);
  const seed =
    Number(state?.accountTelemetry?.firstSeenAt || 0) +
    Number(state?.accountTelemetry?.sessionCount || 0) +
    Number(state?.prestige?.totalEchoesEarned || 0);
  const contracts = WEEKLY_LEDGER_LANES.map(lane => {
    const template = pickWeeklyTemplate(lane.templates, weekKey, seed, lane.id, templateCapabilities);
    return buildWeeklyLedgerContract(state, template, {
      weekKey,
      startsAt,
      accountBand,
    });
  }).filter(Boolean);

  return {
    ...createEmptyWeeklyLedger(),
    weekKey,
    startsAt,
    refreshCount: Math.max(0, Number(previousLedger?.refreshCount || 0)) + 1,
    contracts,
  };
}

export function ensureWeeklyLedger(state, ledger = {}, now = Date.now()) {
  const nextWeekKey = getCurrentWeeklyLedgerWeekKey(now);
  const currentContracts = Array.isArray(ledger?.contracts) ? ledger.contracts : [];
  const validForWeek = ledger?.weekKey === nextWeekKey && currentContracts.length > 0;
  if (validForWeek) {
    return {
      ...createEmptyWeeklyLedger(),
      ...ledger,
      contracts: currentContracts.map(contract => ({
        ...contract,
        claimed: !!contract?.claimed,
        bandId: contract?.bandId || "mid",
        bandSnapshot: {
          maxTier: Math.max(1, Number(contract?.bandSnapshot?.maxTier || 1)),
          prestigeLevel: Math.max(0, Number(contract?.bandSnapshot?.prestigeLevel || 0)),
          bestItemRating: Math.max(0, Number(contract?.bandSnapshot?.bestItemRating || 0)),
          expeditionClaims: Math.max(0, Number(contract?.bandSnapshot?.expeditionClaims || 0)),
          weeklyClaims: Math.max(0, Number(contract?.bandSnapshot?.weeklyClaims || 0)),
        },
        baseline: Math.max(0, Number(contract?.baseline || 0)),
        gainTarget: Math.max(1, Number(contract?.gainTarget || 1)),
        reward: {
          gold: Math.max(0, Number(contract?.reward?.gold || 0)),
          essence: Math.max(0, Number(contract?.reward?.essence || 0)),
          talentPoints: Math.max(0, Number(contract?.reward?.talentPoints || 0)),
        },
      })),
    };
  }
  return buildWeeklyLedger(state, now, ledger);
}

export function getWeeklyLedgerContractProgress(state, contract = {}) {
  const goal = GOAL_BY_ID[contract.goalId];
  if (!goal) {
    return {
      current: 0,
      target: Math.max(1, Number(contract?.gainTarget || 1)),
      percent: 0,
      completed: false,
      remaining: Math.max(1, Number(contract?.gainTarget || 1)),
      absoluteProgress: 0,
      goal: null,
    };
  }
  const absoluteProgress = Math.max(0, Number(getGoalProgress(state, goal) || 0));
  const rawBaseline = Math.max(0, Number(contract?.baseline || 0));
  const baseline = Math.min(rawBaseline, absoluteProgress);
  const target = Math.max(1, Number(contract?.gainTarget || 1));
  const current = Math.max(0, absoluteProgress - baseline);
  return {
    current: Math.min(target, current),
    target,
    percent: Math.max(0, Math.min(100, (current / target) * 100)),
    completed: current >= target,
    remaining: Math.max(0, target - current),
    absoluteProgress,
    goal,
  };
}

export function getWeeklyLedgerContractsWithProgress(state, ledger = {}) {
  const contracts = Array.isArray(ledger?.contracts) ? ledger.contracts : [];
  return contracts.map(contract => ({
    ...contract,
    progress: getWeeklyLedgerContractProgress(state, contract),
    goal: GOAL_BY_ID[contract.goalId] || null,
    objectiveDescription: buildGoalDeltaObjective(
      GOAL_BY_ID[contract.goalId] || null,
      Math.max(1, Number(contract?.gainTarget || 1))
    ),
  }));
}

export function isWeeklyLedgerContractClaimable(state, contract = {}) {
  const progress = getWeeklyLedgerContractProgress(state, contract);
  return progress.completed && !contract?.claimed;
}
