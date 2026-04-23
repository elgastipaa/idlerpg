import { ACTIVE_GOALS } from "../../data/activeGoals";
import { getGoalProgress } from "./goalEngine";

const GOAL_BY_ID = Object.fromEntries(ACTIVE_GOALS.map(goal => [goal.id, goal]));

const WEEKLY_LEDGER_LANES = [
  {
    id: "push",
    templates: [
      { id: "tier_push", goalId: "goal_reach_tier_10", gainTarget: 4, laneLabel: "Push semanal" },
      { id: "boss_push", goalId: "goal_boss_5", gainTarget: 2, laneLabel: "Push semanal" },
      { id: "kill_push", goalId: "goal_kills_1000", gainTarget: 300, laneLabel: "Push semanal" },
    ],
  },
  {
    id: "craft",
    templates: [
      { id: "upgrade_loop", goalId: "goal_upgrade_20", gainTarget: 6, laneLabel: "Forja semanal" },
      { id: "extract_loop", goalId: "goal_extract_25", gainTarget: 8, laneLabel: "Forja semanal" },
      { id: "reforge_loop", goalId: "goal_reforge_8", gainTarget: 3, laneLabel: "Forja semanal" },
      { id: "polish_loop", goalId: "goal_polish_12", gainTarget: 4, laneLabel: "Forja semanal" },
    ],
  },
  {
    id: "meta",
    templates: [
      { id: "prestige_loop", goalId: "goal_first_prestige", gainTarget: 1, laneLabel: "Meta semanal" },
      { id: "prestige_chain", goalId: "goal_prestige_3", gainTarget: 1, laneLabel: "Meta semanal" },
      { id: "echo_board", goalId: "goal_buy_relic_5", gainTarget: 2, laneLabel: "Meta semanal" },
    ],
  },
];

function hashString(input = "") {
  let hash = 2166136261;
  const source = String(input || "");
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
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

function pickWeeklyTemplate(templates = [], weekKey = "", seed = 0, laneId = "") {
  if (!templates.length) return null;
  const index = hashString(`${weekKey}:${laneId}:${seed}`) % templates.length;
  return templates[index];
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

function buildWeeklyLedgerContract(state, template = {}, { weekKey = "", startsAt = Date.now() } = {}) {
  const goal = GOAL_BY_ID[template.goalId];
  if (!goal) return null;
  return {
    id: `${weekKey}:${template.id}`,
    lane: template.id,
    laneLabel: template.laneLabel || "Contrato semanal",
    goalId: goal.id,
    baseline: Math.max(0, Number(getGoalProgress(state, goal) || 0)),
    gainTarget: Math.max(1, Number(template.gainTarget || 1)),
    reward: buildWeeklyReward(goal, template.gainTarget),
    claimed: false,
    startsAt,
  };
}

export function buildWeeklyLedger(state, now = Date.now(), previousLedger = null) {
  const startsAt = startOfUtcWeek(now);
  const weekKey = formatWeekKey(startsAt);
  const seed =
    Number(state?.accountTelemetry?.firstSeenAt || 0) +
    Number(state?.accountTelemetry?.sessionCount || 0) +
    Number(state?.prestige?.totalEchoesEarned || 0);
  const contracts = WEEKLY_LEDGER_LANES.map(lane => {
    const template = pickWeeklyTemplate(lane.templates, weekKey, seed, lane.id);
    return buildWeeklyLedgerContract(state, template, { weekKey, startsAt });
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
  const baseline = Math.max(0, Number(contract?.baseline || 0));
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
  }));
}

export function isWeeklyLedgerContractClaimable(state, contract = {}) {
  const progress = getWeeklyLedgerContractProgress(state, contract);
  return progress.completed && !contract?.claimed;
}
