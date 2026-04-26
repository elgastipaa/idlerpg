import { ACTIVE_GOALS } from "../../data/activeGoals";
import {
  resolveAccountBand,
  scaleBandReward,
  scaleBandTarget,
} from "./accountBanding";
import { buildGoalDeltaObjective, getGoalProgress } from "./goalEngine";
import { getProgressCounterValue } from "./progressCounters";
import { calcStats } from "../combat/statEngine";

const GOAL_BY_ID = Object.fromEntries(ACTIVE_GOALS.map(goal => [goal.id, goal]));

const CONTRACT_ROTATION_MS = 8 * 60 * 60 * 1000;

const CONTRACT_SLOT_DEFINITIONS = [
  {
    id: "knowledge",
    laneLabel: "Archivo del Santuario",
    templates: [
      {
        id: "knowledge_kills_short",
        label: "Registro de escaramuza",
        goalId: "goal_kills_50",
        gainTarget: 30,
        reward: { codexInk: 24, sigilFlux: 1, essence: 14 },
      },
      {
        id: "knowledge_kills",
        label: "Cartografia de bajas",
        goalId: "goal_kills_250",
        gainTarget: 140,
        reward: { codexInk: 34, sigilFlux: 2, essence: 20 },
      },
      {
        id: "knowledge_kills_long",
        label: "Atlas de exterminio",
        goalId: "goal_kills_1000",
        gainTarget: 260,
        reward: { codexInk: 52, sigilFlux: 3, essence: 34 },
      },
      {
        id: "knowledge_bosses",
        label: "Bitacora de caza",
        goalId: "goal_boss_5",
        gainTarget: 2,
        reward: { codexInk: 42, relicDust: 1, essence: 26 },
      },
      {
        id: "knowledge_boss_chain",
        label: "Cadena de coronas",
        goalId: "goal_boss_20",
        gainTarget: 4,
        reward: { codexInk: 52, relicDust: 2, essence: 34 },
      },
      {
        id: "knowledge_block_drill",
        label: "Malla defensiva",
        goalId: "goal_blocks_40",
        gainTarget: 10,
        requiresAll: ["block"],
        reward: { codexInk: 34, sigilFlux: 2, essence: 22 },
      },
      {
        id: "knowledge_evade_drill",
        label: "Cadencia evasiva",
        goalId: "goal_evades_35",
        gainTarget: 9,
        requiresAll: ["evade"],
        reward: { codexInk: 34, sigilFlux: 2, essence: 22 },
      },
      {
        id: "knowledge_bleed_boss",
        label: "Autopsia sangrante",
        goalId: "goal_boss_bleed_6",
        gainTarget: 2,
        requiresAll: ["bleed"],
        reward: { codexInk: 46, relicDust: 1, essence: 30 },
      },
      {
        id: "knowledge_fracture_boss",
        label: "Registro de fisuras",
        goalId: "goal_boss_fracture_6",
        gainTarget: 2,
        requiresAll: ["fracture"],
        reward: { codexInk: 46, relicDust: 1, essence: 30 },
      },
      {
        id: "knowledge_dual_status",
        label: "Mapa de doble presion",
        goalId: "goal_boss_dual_status_4",
        gainTarget: 1,
        requiresAtLeast: { count: 2, tags: ["bleed", "fracture", "mark"] },
        reward: { codexInk: 58, sigilFlux: 3, relicDust: 2, essence: 38 },
      },
      {
        id: "knowledge_guard_play",
        label: "Lectura de impacto",
        goalId: "goal_boss_guard_play_6",
        gainTarget: 2,
        requiresAny: ["block", "evade"],
        reward: { codexInk: 44, sigilFlux: 2, relicDust: 1, essence: 28 },
      },
      {
        id: "knowledge_rares",
        label: "Catalogo de reliquias",
        goalId: "goal_rare_25",
        gainTarget: 10,
        reward: { codexInk: 38, sigilFlux: 3, essence: 22 },
      },
      {
        id: "knowledge_epics",
        label: "Inventario violeta",
        goalId: "goal_epic_10",
        gainTarget: 3,
        reward: { codexInk: 50, sigilFlux: 2, relicDust: 1, essence: 30 },
      },
      {
        id: "knowledge_legendary",
        label: "Huella legendaria",
        goalId: "goal_legendary_5",
        gainTarget: 1,
        reward: { codexInk: 64, sigilFlux: 3, relicDust: 2, essence: 44 },
      },
      {
        id: "knowledge_t1_scan",
        label: "Escaneo de T1",
        goalId: "goal_t1_20",
        gainTarget: 4,
        reward: { codexInk: 44, sigilFlux: 2, essence: 28 },
      },
      {
        id: "knowledge_perfect_trace",
        label: "Traza perfecta",
        goalId: "goal_perfect_10",
        gainTarget: 2,
        reward: { codexInk: 48, sigilFlux: 2, relicDust: 1, essence: 30 },
      },
      {
        id: "knowledge_rating_hunt",
        label: "Peritaje de potencia",
        goalId: "goal_best_rating_400",
        gainTarget: 25,
        reward: { codexInk: 40, sigilFlux: 2, essence: 24 },
      },
      {
        id: "knowledge_tier_push",
        label: "Mapa de avance",
        goalId: "goal_reach_tier_20",
        gainTarget: 2,
        reward: { codexInk: 42, sigilFlux: 2, essence: 26 },
      },
      {
        id: "knowledge_tier_cap",
        label: "Cartografia terminal",
        goalId: "goal_reach_tier_25",
        gainTarget: 1,
        reward: { codexInk: 54, sigilFlux: 3, relicDust: 1, essence: 36 },
      },
    ],
  },
  {
    id: "forge",
    laneLabel: "Cadena de Forja",
    templates: [
      {
        id: "forge_extract",
        label: "Reciclaje dirigido",
        goalId: "goal_extract_25",
        gainTarget: 6,
        reward: { relicDust: 4, sigilFlux: 3, essence: 36 },
      },
      {
        id: "forge_extract_dense",
        label: "Triturado de lote",
        goalId: "goal_extract_25",
        gainTarget: 10,
        reward: { relicDust: 6, sigilFlux: 3, essence: 50 },
      },
      {
        id: "forge_upgrade",
        label: "Ritmo de banco",
        goalId: "goal_upgrade_20",
        gainTarget: 4,
        reward: { relicDust: 5, codexInk: 18, essence: 40 },
      },
      {
        id: "forge_upgrade_dense",
        label: "Banco al rojo vivo",
        goalId: "goal_upgrade_20",
        gainTarget: 8,
        reward: { relicDust: 7, codexInk: 24, essence: 56 },
      },
      {
        id: "forge_reforge",
        label: "Cirugia de lineas",
        goalId: "goal_reforge_8",
        gainTarget: 2,
        reward: { relicDust: 6, sigilFlux: 2, essence: 44 },
      },
      {
        id: "forge_reforge_dense",
        label: "Reconfiguracion profunda",
        goalId: "goal_reforge_8",
        gainTarget: 4,
        reward: { relicDust: 8, sigilFlux: 3, essence: 60 },
      },
      {
        id: "forge_polish",
        label: "Pulido de precision",
        goalId: "goal_polish_12",
        gainTarget: 3,
        reward: { relicDust: 4, codexInk: 12, essence: 32 },
      },
      {
        id: "forge_polish_dense",
        label: "Acabado espejo",
        goalId: "goal_polish_12",
        gainTarget: 6,
        reward: { relicDust: 6, codexInk: 18, essence: 46 },
      },
      {
        id: "forge_reroll",
        label: "Reforja controlada",
        goalId: "goal_reroll_10",
        gainTarget: 3,
        reward: { relicDust: 5, sigilFlux: 2, essence: 38 },
      },
      {
        id: "forge_reroll_dense",
        label: "Tormenta de reforjas",
        goalId: "goal_reroll_10",
        gainTarget: 5,
        reward: { relicDust: 7, sigilFlux: 3, essence: 54 },
      },
      {
        id: "forge_sell_cycle",
        label: "Ciclo de liquidacion",
        goalId: "goal_sell_50",
        gainTarget: 18,
        reward: { relicDust: 4, codexInk: 16, essence: 30 },
      },
      {
        id: "forge_sell_dense",
        label: "Barrido de mercado",
        goalId: "goal_sell_50",
        gainTarget: 28,
        reward: { relicDust: 6, codexInk: 22, sigilFlux: 2, essence: 42 },
      },
      {
        id: "forge_ascend_ping",
        label: "Impulso de ascension",
        goalId: "goal_ascend_6",
        gainTarget: 1,
        reward: { relicDust: 8, sigilFlux: 2, essence: 58 },
      },
    ],
  },
];

const REROLL_BASE_COST = {
  relicDust: 2,
  sigilFlux: 1,
};

function hashString(input = "") {
  let hash = 2166136261;
  const source = String(input || "");
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function normalizeReward(reward = {}) {
  return {
    codexInk: Math.max(0, Math.floor(Number(reward?.codexInk || 0))),
    sigilFlux: Math.max(0, Math.floor(Number(reward?.sigilFlux || 0))),
    relicDust: Math.max(0, Math.floor(Number(reward?.relicDust || 0))),
    essence: Math.max(0, Math.floor(Number(reward?.essence || 0))),
  };
}

const TEMPLATE_CAPABILITY_KEYS = Object.freeze(["bleed", "fracture", "mark", "block", "evade"]);

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

function pickTemplateForSlot(slotDefinition, seedLabel = "", capabilities = null) {
  const templates = Array.isArray(slotDefinition?.templates) ? slotDefinition.templates : [];
  if (templates.length <= 0) return null;
  const startIndex = hashString(seedLabel) % templates.length;
  for (let offset = 0; offset < templates.length; offset += 1) {
    const template = templates[(startIndex + offset) % templates.length];
    if (!capabilities || isTemplateEligible(template, capabilities)) {
      return template || null;
    }
  }
  return templates[startIndex] || null;
}

function buildContractFromTemplate(state, slotDefinition, template, {
  now = Date.now(),
  rotationKey = "",
  rotationEndsAt = null,
  rerollCount = 0,
  accountBand = null,
} = {}) {
  if (!slotDefinition?.id || !template?.id) return null;
  const goal = GOAL_BY_ID[template.goalId];
  if (!goal) return null;
  const baseline = Math.max(0, Number(getGoalProgress(state, goal) || 0));
  const resolvedBand = accountBand?.id
    ? accountBand
    : resolveAccountBand(state);
  const scaledGainTarget = scaleBandTarget(template.gainTarget, resolvedBand);
  const scaledReward = normalizeReward(scaleBandReward(template.reward, resolvedBand));

  return {
    id: `${rotationKey}:${slotDefinition.id}:${template.id}:${rerollCount}`,
    slotId: slotDefinition.id,
    laneLabel: slotDefinition.laneLabel || "Contrato de expedicion",
    title: template.label || goal.name,
    goalId: goal.id,
    baseline,
    gainTarget: scaledGainTarget,
    reward: scaledReward,
    bandId: resolvedBand.id || "mid",
    bandSnapshot: {
      maxTier: Math.max(1, Number(resolvedBand?.snapshot?.maxTier || 1)),
      prestigeLevel: Math.max(0, Number(resolvedBand?.snapshot?.prestigeLevel || 0)),
      bestItemRating: Math.max(0, Number(resolvedBand?.snapshot?.bestItemRating || 0)),
      expeditionClaims: Math.max(0, Number(resolvedBand?.snapshot?.expeditionClaims || 0)),
      weeklyClaims: Math.max(0, Number(resolvedBand?.snapshot?.weeklyClaims || 0)),
    },
    claimed: false,
    readyToClaim: false,
    createdAt: Number(now || Date.now()) || Date.now(),
    expiresAt: Number(rotationEndsAt || 0) > 0 ? Number(rotationEndsAt) : null,
  };
}

function sanitizeContract(contract = {}) {
  return {
    ...contract,
    baseline: Math.max(0, Number(contract?.baseline || 0)),
    gainTarget: Math.max(1, Number(contract?.gainTarget || 1)),
    reward: normalizeReward(contract?.reward || {}),
    bandId: contract?.bandId || "mid",
    bandSnapshot: {
      maxTier: Math.max(1, Number(contract?.bandSnapshot?.maxTier || 1)),
      prestigeLevel: Math.max(0, Number(contract?.bandSnapshot?.prestigeLevel || 0)),
      bestItemRating: Math.max(0, Number(contract?.bandSnapshot?.bestItemRating || 0)),
      expeditionClaims: Math.max(0, Number(contract?.bandSnapshot?.expeditionClaims || 0)),
      weeklyClaims: Math.max(0, Number(contract?.bandSnapshot?.weeklyClaims || 0)),
    },
    claimed: Boolean(contract?.claimed),
    readyToClaim: Boolean(contract?.readyToClaim),
  };
}

export function createEmptyExpeditionContracts() {
  return {
    version: 1,
    rotationKey: null,
    rotationStartedAt: null,
    rotationEndsAt: null,
    rerollCount: 0,
    lastRerolledAt: null,
    contracts: [],
    activeContractId: null,
  };
}

export function getExpeditionContractRotationStart(now = Date.now()) {
  const safeNow = Number(now || Date.now()) || Date.now();
  return Math.floor(safeNow / CONTRACT_ROTATION_MS) * CONTRACT_ROTATION_MS;
}

export function formatExpeditionContractRotationKey(rotationStartAt = Date.now()) {
  const date = new Date(Number(rotationStartAt || Date.now()));
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const bucket = String(Math.floor(date.getUTCHours() / 8));
  return `${year}-${month}-${day}-R${bucket}`;
}

export function buildExpeditionContracts(state, {
  now = Date.now(),
  rerollCount = 0,
  previousBoard = null,
} = {}) {
  const rotationStartedAt = getExpeditionContractRotationStart(now);
  const rotationEndsAt = rotationStartedAt + CONTRACT_ROTATION_MS;
  const rotationKey = formatExpeditionContractRotationKey(rotationStartedAt);
  const stableSeed =
    Number(state?.accountTelemetry?.firstSeenAt || 0) +
    Number(state?.accountTelemetry?.sessionCount || 0) +
    Number(state?.prestige?.totalEchoesEarned || 0) +
    Number(getProgressCounterValue(state, "bossKills", { warnOnDivergence: false }) || 0);
  const accountBand = resolveAccountBand(state);
  const templateCapabilities = getTemplateCapabilities(state);

  const contracts = CONTRACT_SLOT_DEFINITIONS.map(slotDefinition => {
    const template = pickTemplateForSlot(
      slotDefinition,
      `${rotationKey}:${slotDefinition.id}:${stableSeed}:${Math.max(0, Number(rerollCount || 0))}`,
      templateCapabilities
    );
    return buildContractFromTemplate(state, slotDefinition, template, {
      now,
      rotationKey,
      rotationEndsAt,
      rerollCount,
      accountBand,
    });
  }).filter(Boolean);

  const nextBoard = {
    ...createEmptyExpeditionContracts(),
    rotationKey,
    rotationStartedAt,
    rotationEndsAt,
    rerollCount: Math.max(0, Number(rerollCount || 0)),
    lastRerolledAt: Number(previousBoard?.lastRerolledAt || 0) > 0 ? Number(previousBoard.lastRerolledAt) : null,
    contracts,
    activeContractId: null,
  };

  const previousContracts = Array.isArray(previousBoard?.contracts) ? previousBoard.contracts : [];
  const previousActiveContractId = previousBoard?.activeContractId || null;
  if (previousActiveContractId && previousContracts.some(contract => contract?.id === previousActiveContractId)) {
    const normalizedPreviousId = String(previousActiveContractId);
    if (contracts.some(contract => String(contract?.id) === normalizedPreviousId)) {
      nextBoard.activeContractId = normalizedPreviousId;
    }
  }

  return nextBoard;
}

function sanitizeExistingBoard(board = {}) {
  const sanitizedContracts = Array.isArray(board?.contracts)
    ? board.contracts.map(contract => sanitizeContract(contract)).filter(contract => !!contract?.id)
    : [];
  return {
    ...createEmptyExpeditionContracts(),
    ...board,
    rerollCount: Math.max(0, Number(board?.rerollCount || 0)),
    contracts: sanitizedContracts,
    activeContractId: board?.activeContractId || null,
  };
}

export function ensureExpeditionContracts(state, board = {}, now = Date.now()) {
  const sanitizedBoard = sanitizeExistingBoard(board);
  const rotationStartedAt = getExpeditionContractRotationStart(now);
  const expectedRotationKey = formatExpeditionContractRotationKey(rotationStartedAt);
  const hasContracts = sanitizedBoard.contracts.length >= CONTRACT_SLOT_DEFINITIONS.length;
  const isActiveRun = ["active", "extraction"].includes(state?.expedition?.phase || "sanctuary");
  const stillValidRotation = sanitizedBoard.rotationKey === expectedRotationKey;

  if (hasContracts && (stillValidRotation || isActiveRun)) {
    return {
      ...sanitizedBoard,
      activeContractId: sanitizedBoard.contracts.some(contract => contract?.id === sanitizedBoard.activeContractId)
        ? sanitizedBoard.activeContractId
        : null,
    };
  }

  return buildExpeditionContracts(state, {
    now,
    rerollCount: 0,
    previousBoard: sanitizedBoard,
  });
}

export function getExpeditionContractRerollCost(board = {}) {
  const rerollCount = Math.max(0, Number(board?.rerollCount || 0));
  const costScale = 1 + Math.floor(rerollCount / 2);
  return {
    relicDust: Math.max(1, REROLL_BASE_COST.relicDust * costScale),
    sigilFlux: Math.max(0, REROLL_BASE_COST.sigilFlux + Math.floor(rerollCount / 3)),
  };
}

export function canRerollExpeditionContracts(state, board = {}) {
  const cost = getExpeditionContractRerollCost(board);
  const resources = state?.sanctuary?.resources || {};
  return (
    Number(resources?.relicDust || 0) >= Number(cost.relicDust || 0) &&
    Number(resources?.sigilFlux || 0) >= Number(cost.sigilFlux || 0)
  );
}

export function rerollExpeditionContracts(state, board = {}, now = Date.now()) {
  if (!canRerollExpeditionContracts(state, board)) return null;
  const nextRerollCount = Math.max(0, Number(board?.rerollCount || 0)) + 1;
  const nextBoard = buildExpeditionContracts(state, {
    now,
    rerollCount: nextRerollCount,
    previousBoard: {
      ...board,
      lastRerolledAt: Number(now || Date.now()) || Date.now(),
    },
  });
  return {
    board: {
      ...nextBoard,
      activeContractId: null,
      lastRerolledAt: Number(now || Date.now()) || Date.now(),
    },
    cost: getExpeditionContractRerollCost(board),
  };
}

export function getExpeditionContractProgress(state, contract = {}) {
  const goal = GOAL_BY_ID[contract?.goalId];
  const target = Math.max(1, Number(contract?.gainTarget || 1));
  const lockedComplete = Boolean(contract?.readyToClaim && !contract?.claimed);

  if (lockedComplete) {
    return {
      current: target,
      target,
      percent: 100,
      completed: true,
      remaining: 0,
      absoluteProgress: Math.max(0, Number(contract?.baseline || 0)) + target,
      goal: goal || null,
    };
  }

  if (!goal) {
    return {
      current: 0,
      target,
      percent: 0,
      completed: false,
      remaining: target,
      absoluteProgress: 0,
      goal: null,
    };
  }

  const absoluteProgress = Math.max(0, Number(getGoalProgress(state, goal) || 0));
  const rawBaseline = Math.max(0, Number(contract?.baseline || 0));
  const baseline = Math.min(rawBaseline, absoluteProgress);
  const current = Math.max(0, absoluteProgress - baseline);
  const completed = current >= target;

  return {
    current: Math.min(target, current),
    target,
    percent: Math.max(0, Math.min(100, (current / target) * 100)),
    completed,
    remaining: Math.max(0, target - current),
    absoluteProgress,
    goal,
  };
}

export function getExpeditionContractsWithProgress(state, board = {}) {
  const contracts = Array.isArray(board?.contracts) ? board.contracts : [];
  return contracts.map(contract => {
    const progress = getExpeditionContractProgress(state, contract);
    const objectiveDescription = buildGoalDeltaObjective(progress.goal, progress.target);
    return {
      ...contract,
      progress,
      goal: progress.goal,
      objectiveDescription,
      objectiveHint: progress.goal?.hint || null,
    };
  });
}

export function isExpeditionContractClaimable(state, contract = {}) {
  if (contract?.claimed) return false;
  if (contract?.readyToClaim) return true;
  const progress = getExpeditionContractProgress(state, contract);
  return progress.completed;
}

export function getActiveExpeditionContractWithProgress(state, board = {}) {
  const contracts = getExpeditionContractsWithProgress(state, board);
  const activeContractId = board?.activeContractId || null;
  if (!activeContractId) return null;
  return contracts.find(contract => contract?.id === activeContractId) || null;
}
