import { ACTIVE_GOALS } from "../../data/activeGoals";
import {
  getActiveExpeditionContractWithProgress,
  ensureExpeditionContracts,
  getExpeditionContractRerollCost,
} from "../progression/expeditionContracts";
import { getProgressCounterValue } from "../progression/progressCounters";
import { ensureWeeklyLedger, getWeeklyLedgerContractsWithProgress } from "../progression/weeklyLedger";
import { ensureWeeklyBossState } from "../progression/weeklyBoss";
import { createPostOnboardingSimulationState } from "../stateInitializer";
import { gameReducer } from "../../state/gameReducer";

const GOAL_BY_ID = Object.fromEntries(ACTIVE_GOALS.map(goal => [goal.id, goal]));

function toInt(value = 0) {
  return Math.max(0, Math.floor(Number(value || 0)));
}

function getBoardIds(board = {}) {
  const contracts = Array.isArray(board?.contracts) ? board.contracts : [];
  return contracts.map(contract => String(contract?.id || "")).filter(Boolean);
}

function areIdListsEqual(left = [], right = []) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function buildSimulationSeedState() {
  const seeded = createPostOnboardingSimulationState({
    classId: "warrior",
    specialization: "berserker",
    level: 14,
    gold: 5_000,
    essence: 2_000,
    currentTier: 12,
  });
  return {
    ...seeded,
    sanctuary: {
      ...seeded.sanctuary,
      resources: {
        ...(seeded.sanctuary?.resources || {}),
        relicDust: 500,
        sigilFlux: 500,
      },
    },
    expedition: {
      ...(seeded.expedition || {}),
      phase: "setup",
    },
    combat: {
      ...seeded.combat,
      pendingRunSetup: true,
      pendingRunSigilId: "free",
      pendingRunSigilIds: ["free"],
      activeRunSigilId: "free",
      activeRunSigilIds: ["free"],
    },
    currentTab: "combat",
  };
}

function canForceGoalProgress(goal = null) {
  const target = goal?.target || {};
  if (target.kind === "stat") return true;
  if (target.kind === "combat" && target.key === "maxTier") return true;
  if (target.kind === "player" && target.key === "specializationSelected") return true;
  return false;
}

function setGoalAbsoluteProgress(state, goalId, absoluteProgress) {
  const goal = GOAL_BY_ID[goalId];
  if (!goal) return state;

  const safeAbsolute = toInt(absoluteProgress);
  const target = goal.target || {};

  if (target.kind === "stat") {
    const key = target.key;
    return {
      ...state,
      stats: {
        ...(state.stats || {}),
        [key]: safeAbsolute,
      },
      combat: {
        ...state.combat,
        analytics: {
          ...(state.combat?.analytics || {}),
          [key]: safeAbsolute,
        },
      },
    };
  }

  if (target.kind === "combat" && target.key === "maxTier") {
    return {
      ...state,
      combat: {
        ...state.combat,
        currentTier: Math.max(1, safeAbsolute),
        maxTier: Math.max(1, safeAbsolute),
      },
    };
  }

  if (target.kind === "player" && target.key === "specializationSelected") {
    return {
      ...state,
      player: {
        ...state.player,
        specialization: state.player?.specialization || "berserker",
      },
    };
  }

  return state;
}

function createCheck(id, label, pass, details) {
  return {
    id,
    label,
    pass: Boolean(pass),
    details: String(details || "").trim(),
  };
}

function runExpeditionContractChecks() {
  const checks = [];

  const setupSeed = buildSimulationSeedState();
  const baseNow = Number(setupSeed?.expeditionContracts?.rotationStartedAt || Date.now()) + 1_000;
  const setupState = gameReducer(setupSeed, {
    type: "ENTER_EXPEDITION_SETUP",
    now: baseNow + 1,
  });
  const setupBoardIds = getBoardIds(setupState?.expeditionContracts || {});
  const hasSetupBoard = setupBoardIds.length >= 2;
  checks.push(
    createCheck(
      "contracts-setup-board",
      "ENTER_EXPEDITION_SETUP crea/asegura board valido",
      hasSetupBoard,
      `contracts=${setupBoardIds.length}, active=${setupState?.expeditionContracts?.activeContractId || "null"}`
    )
  );

  const selectableContract = (setupState?.expeditionContracts?.contracts || []).find(contract => !contract?.claimed) || null;
  const selectedContractId = selectableContract?.id || null;
  const selectedState = selectedContractId
    ? gameReducer(setupState, {
        type: "SELECT_EXPEDITION_CONTRACT",
        contractId: selectedContractId,
        now: baseNow + 2,
      })
    : setupState;
  const selectedBoardIds = getBoardIds(selectedState?.expeditionContracts || {});
  checks.push(
    createCheck(
      "contracts-select-stable-board",
      "SELECT_EXPEDITION_CONTRACT no refresca IDs del board",
      Boolean(selectedContractId) &&
        areIdListsEqual(setupBoardIds, selectedBoardIds) &&
        selectedState?.expeditionContracts?.activeContractId === selectedContractId,
      `selected=${selectedContractId || "none"}, idsEqual=${areIdListsEqual(setupBoardIds, selectedBoardIds)}`
    )
  );
  const selectedContractsById = Object.fromEntries(
    (selectedState?.expeditionContracts?.contracts || []).map(contract => [contract?.id, contract])
  );
  const boostedProgressState = {
    ...selectedState,
    combat: {
      ...(selectedState?.combat || {}),
      maxTier: Math.max(30, Number(selectedState?.combat?.maxTier || 1)),
      currentTier: Math.max(30, Number(selectedState?.combat?.currentTier || 1)),
    },
    stats: {
      ...(selectedState?.stats || {}),
      bestItemRating: Math.max(520, Number(selectedState?.stats?.bestItemRating || 0)),
    },
    prestige: {
      ...(selectedState?.prestige || {}),
      level: Math.max(7, Number(selectedState?.prestige?.level || 0)),
    },
  };
  const ensuredFrozenBoard = ensureExpeditionContracts(
    boostedProgressState,
    selectedState?.expeditionContracts || {},
    baseNow + 2_000
  );
  const expeditionFrozen = (ensuredFrozenBoard?.contracts || []).every(contract => {
    const previous = selectedContractsById[contract?.id];
    if (!previous) return false;
    return (
      Number(contract?.gainTarget || 0) === Number(previous?.gainTarget || 0) &&
      JSON.stringify(contract?.reward || {}) === JSON.stringify(previous?.reward || {})
    );
  });
  checks.push(
    createCheck(
      "contracts-band-freeze-until-reroll",
      "Targets/rewards de contrato quedan congelados mientras el board siga vigente",
      expeditionFrozen,
      `contracts=${(ensuredFrozenBoard?.contracts || []).length}`
    )
  );

  const rerollCost = getExpeditionContractRerollCost(selectedState?.expeditionContracts || {});
  const resourcesBeforeReroll = {
    relicDust: toInt(selectedState?.sanctuary?.resources?.relicDust || 0),
    sigilFlux: toInt(selectedState?.sanctuary?.resources?.sigilFlux || 0),
  };
  const rerolledState = gameReducer(selectedState, {
    type: "REROLL_EXPEDITION_CONTRACTS",
    now: baseNow + 3,
  });
  const rerolledBoardIds = getBoardIds(rerolledState?.expeditionContracts || {});
  const resourcesAfterReroll = {
    relicDust: toInt(rerolledState?.sanctuary?.resources?.relicDust || 0),
    sigilFlux: toInt(rerolledState?.sanctuary?.resources?.sigilFlux || 0),
  };
  const rerollExpectedDust = Math.max(0, resourcesBeforeReroll.relicDust - toInt(rerollCost?.relicDust || 0));
  const rerollExpectedFlux = Math.max(0, resourcesBeforeReroll.sigilFlux - toInt(rerollCost?.sigilFlux || 0));
  checks.push(
    createCheck(
      "contracts-reroll-updates-board-and-cost",
      "REROLL_EXPEDITION_CONTRACTS cambia board y descuenta costo",
      !areIdListsEqual(selectedBoardIds, rerolledBoardIds) &&
        resourcesAfterReroll.relicDust === rerollExpectedDust &&
        resourcesAfterReroll.sigilFlux === rerollExpectedFlux &&
        !rerolledState?.expeditionContracts?.activeContractId,
      `idsChanged=${!areIdListsEqual(selectedBoardIds, rerolledBoardIds)}, dust=${resourcesAfterReroll.relicDust}/${rerollExpectedDust}, flux=${resourcesAfterReroll.sigilFlux}/${rerollExpectedFlux}`
    )
  );

  const classSelectedState = gameReducer(selectedState, {
    type: "SELECT_CLASS",
    classId: "warrior",
    now: baseNow + 4,
  });
  const startState = gameReducer(classSelectedState, {
    type: "START_RUN",
    now: baseNow + 5,
  });
  const startBoardIds = getBoardIds(startState?.expeditionContracts || {});
  checks.push(
    createCheck(
      "contracts-start-run-stable-selection",
      "START_RUN mantiene board y contrato seleccionado",
      startState?.expedition?.phase === "active" &&
        areIdListsEqual(selectedBoardIds, startBoardIds) &&
        startState?.expeditionContracts?.activeContractId === selectedContractId,
      `phase=${startState?.expedition?.phase || "-"}, active=${startState?.expeditionContracts?.activeContractId || "null"}, class=${startState?.player?.class || "null"}`
    )
  );

  const activeBeforeCompletion = getActiveExpeditionContractWithProgress(
    startState,
    startState?.expeditionContracts || {}
  );
  const progressGoalId = activeBeforeCompletion?.goalId || null;
  const progressAbsoluteTarget = toInt(activeBeforeCompletion?.baseline || 0) + toInt(activeBeforeCompletion?.gainTarget || 0);
  const completedContractState = progressGoalId
    ? setGoalAbsoluteProgress(startState, progressGoalId, progressAbsoluteTarget)
    : startState;
  const activeAfterCompletion = getActiveExpeditionContractWithProgress(
    completedContractState,
    completedContractState?.expeditionContracts || {}
  );
  const openExtractionState = gameReducer(completedContractState, {
    type: "OPEN_EXTRACTION",
    now: baseNow + 6,
  });
  const telemetryBeforeClaim = {
    claims: toInt(openExtractionState?.accountTelemetry?.expeditionContractClaims || 0),
    completions: toInt(openExtractionState?.accountTelemetry?.expeditionContractCompletions || 0),
  };
  const claimedExtractionState = gameReducer(openExtractionState, {
    type: "CONFIRM_EXTRACTION",
    now: baseNow + 7,
  });
  const contractAfterExtraction = (claimedExtractionState?.expeditionContracts?.contracts || []).find(
    contract => contract?.id === activeAfterCompletion?.id
  );
  const claimableAfterExtraction = getActiveExpeditionContractWithProgress(
    claimedExtractionState,
    claimedExtractionState?.expeditionContracts || {}
  );
  const manualClaimState = gameReducer(claimedExtractionState, {
    type: "CLAIM_EXPEDITION_CONTRACT",
    contractId: activeAfterCompletion?.id,
    now: baseNow + 8,
  });
  const claimedContractRecord = (manualClaimState?.expeditionContracts?.contracts || []).find(
    contract => contract?.id === activeAfterCompletion?.id
  );
  const telemetryAfterClaim = {
    claims: toInt(manualClaimState?.accountTelemetry?.expeditionContractClaims || 0),
    completions: toInt(manualClaimState?.accountTelemetry?.expeditionContractCompletions || 0),
  };
  const resourcesBeforeManualClaim = {
    essence: toInt(claimedExtractionState?.player?.essence || 0),
    codexInk: toInt(claimedExtractionState?.sanctuary?.resources?.codexInk || 0),
    sigilFlux: toInt(claimedExtractionState?.sanctuary?.resources?.sigilFlux || 0),
    relicDust: toInt(claimedExtractionState?.sanctuary?.resources?.relicDust || 0),
  };
  const resourcesAfterManualClaim = {
    essence: toInt(manualClaimState?.player?.essence || 0),
    codexInk: toInt(manualClaimState?.sanctuary?.resources?.codexInk || 0),
    sigilFlux: toInt(manualClaimState?.sanctuary?.resources?.sigilFlux || 0),
    relicDust: toInt(manualClaimState?.sanctuary?.resources?.relicDust || 0),
  };
  const expeditionReward = {
    essence: toInt(activeAfterCompletion?.reward?.essence || 0),
    codexInk: toInt(activeAfterCompletion?.reward?.codexInk || 0),
    sigilFlux: toInt(activeAfterCompletion?.reward?.sigilFlux || 0),
    relicDust: toInt(activeAfterCompletion?.reward?.relicDust || 0),
  };
  checks.push(
    createCheck(
      "contracts-complete-stays-claimable-after-extraction",
      "CONFIRM_EXTRACTION deja contrato completo en estado claimable manual",
      Boolean(activeAfterCompletion?.progress?.completed) &&
        openExtractionState?.expedition?.phase === "extraction" &&
        Boolean(claimableAfterExtraction?.progress?.completed) &&
        !contractAfterExtraction?.claimed,
      `completed=${Boolean(claimableAfterExtraction?.progress?.completed)}, claimedAfterExtraction=${Boolean(contractAfterExtraction?.claimed)}`
    )
  );
  checks.push(
    createCheck(
      "contracts-manual-claim-after-extraction",
      "CLAIM_EXPEDITION_CONTRACT reclama rewards y cierra contrato activo",
      Boolean(claimedContractRecord?.claimed) &&
        !manualClaimState?.expeditionContracts?.activeContractId &&
        telemetryAfterClaim.claims === telemetryBeforeClaim.claims + 1 &&
        telemetryAfterClaim.completions === telemetryBeforeClaim.completions + 1 &&
        resourcesAfterManualClaim.essence === resourcesBeforeManualClaim.essence + expeditionReward.essence &&
        resourcesAfterManualClaim.codexInk === resourcesBeforeManualClaim.codexInk + expeditionReward.codexInk &&
        resourcesAfterManualClaim.sigilFlux === resourcesBeforeManualClaim.sigilFlux + expeditionReward.sigilFlux &&
        resourcesAfterManualClaim.relicDust === resourcesBeforeManualClaim.relicDust + expeditionReward.relicDust,
      `claimed=${Boolean(claimedContractRecord?.claimed)}, telemetryClaims=${telemetryAfterClaim.claims}/${telemetryBeforeClaim.claims + 1}, essence=${resourcesAfterManualClaim.essence}/${resourcesBeforeManualClaim.essence + expeditionReward.essence}`
    )
  );

  return checks;
}

function runWeeklyLedgerChecks() {
  const checks = [];

  const weeklySeed = buildSimulationSeedState();
  const weeklyClaimNow = Number(weeklySeed?.weeklyLedger?.startsAt || Date.now()) + 60_000;
  const weeklyContracts = getWeeklyLedgerContractsWithProgress(weeklySeed, weeklySeed?.weeklyLedger || {});
  const claimTargetContract = weeklyContracts.find(contract => canForceGoalProgress(GOAL_BY_ID[contract?.goalId])) || null;

  if (!claimTargetContract) {
    checks.push(
      createCheck(
        "weekly-claim-target-resolved",
        "Existe contrato semanal compatible para smoke",
        false,
        "no compatible weekly contract found"
      )
    );
    return checks;
  }

  const completionAbsolute = toInt(claimTargetContract?.baseline || 0) + toInt(claimTargetContract?.gainTarget || 0);
  const completedWeeklyState = setGoalAbsoluteProgress(
    weeklySeed,
    claimTargetContract.goalId,
    completionAbsolute
  );

  const weeklyBeforeClaim = getWeeklyLedgerContractsWithProgress(
    completedWeeklyState,
    completedWeeklyState?.weeklyLedger || {}
  );
  const targetBeforeClaim = weeklyBeforeClaim.find(contract => contract?.id === claimTargetContract.id) || null;
  const visibleBeforeClaim = weeklyBeforeClaim.filter(contract => !contract?.claimed).map(contract => contract.id);

  const claimedWeeklyState = gameReducer(completedWeeklyState, {
    type: "CLAIM_WEEKLY_LEDGER_CONTRACT",
    contractId: claimTargetContract.id,
    now: weeklyClaimNow,
  });

  const weeklyAfterClaim = getWeeklyLedgerContractsWithProgress(
    claimedWeeklyState,
    claimedWeeklyState?.weeklyLedger || {}
  );
  const targetAfterClaim = weeklyAfterClaim.find(contract => contract?.id === claimTargetContract.id) || null;
  const visibleAfterClaim = weeklyAfterClaim.filter(contract => !contract?.claimed).map(contract => contract.id);

  checks.push(
    createCheck(
      "weekly-complete-unclaimed-remains-visible",
      "Weekly completada sin claim sigue visible en selector",
      Boolean(targetBeforeClaim?.progress?.completed) &&
        !targetBeforeClaim?.claimed &&
        visibleBeforeClaim.includes(claimTargetContract.id),
      `completed=${Boolean(targetBeforeClaim?.progress?.completed)}, visibleBefore=${visibleBeforeClaim.length}`
    )
  );

  checks.push(
    createCheck(
      "weekly-claimed-hidden-from-selector",
      "Weekly claimeada se remueve del selector",
      Boolean(targetAfterClaim?.claimed) && !visibleAfterClaim.includes(claimTargetContract.id),
      `claimed=${Boolean(targetAfterClaim?.claimed)}, visibleAfter=${visibleAfterClaim.length}`
    )
  );

  const weeklyContractsById = Object.fromEntries(
    (weeklySeed?.weeklyLedger?.contracts || []).map(contract => [contract?.id, contract])
  );
  const boostedWeeklyState = {
    ...weeklySeed,
    combat: {
      ...(weeklySeed?.combat || {}),
      maxTier: Math.max(32, Number(weeklySeed?.combat?.maxTier || 1)),
      currentTier: Math.max(32, Number(weeklySeed?.combat?.currentTier || 1)),
    },
    stats: {
      ...(weeklySeed?.stats || {}),
      bestItemRating: Math.max(600, Number(weeklySeed?.stats?.bestItemRating || 0)),
    },
    prestige: {
      ...(weeklySeed?.prestige || {}),
      level: Math.max(9, Number(weeklySeed?.prestige?.level || 0)),
    },
  };
  const ensuredWeeklyFrozen = ensureWeeklyLedger(
    boostedWeeklyState,
    weeklySeed?.weeklyLedger || {},
    weeklyClaimNow + 1_000
  );
  const weeklyFrozen = (ensuredWeeklyFrozen?.contracts || []).every(contract => {
    const previous = weeklyContractsById[contract?.id];
    if (!previous) return false;
    return (
      Number(contract?.gainTarget || 0) === Number(previous?.gainTarget || 0) &&
      JSON.stringify(contract?.reward || {}) === JSON.stringify(previous?.reward || {})
    );
  });
  checks.push(
    createCheck(
      "weekly-band-freeze-until-reset",
      "Targets/rewards weekly quedan congelados durante la misma semana",
      weeklyFrozen,
      `contracts=${(ensuredWeeklyFrozen?.contracts || []).length}`
    )
  );

  return checks;
}

function runCounterAliasChecks() {
  const checks = [];

  const state = buildSimulationSeedState();
  const aliasState = {
    ...state,
    stats: {
      ...(state.stats || {}),
      itemsExtracted: 0,
      autoExtractedItems: 0,
    },
    combat: {
      ...state.combat,
      analytics: {
        ...(state.combat?.analytics || {}),
        itemsExtracted: 0,
        autoExtractedItems: 17,
      },
    },
  };

  const canonicalExtracted = getProgressCounterValue(aliasState, "itemsExtracted", {
    warnOnDivergence: false,
  });

  checks.push(
    createCheck(
      "counter-alias-items-extracted",
      "Counter canónico itemsExtracted contempla alias autoExtractedItems",
      canonicalExtracted === 17,
      `resolved=${canonicalExtracted}`
    )
  );

  return checks;
}

function runWeeklyBossCycleChecks() {
  const checks = [];
  const seed = buildSimulationSeedState();
  const now = Date.now();

  const currentCycleBoss = ensureWeeklyBossState(seed, seed?.weeklyBoss || {}, now);
  const startedCycleBoss = {
    ...currentCycleBoss,
    attemptsUsed: Math.min(3, Number(currentCycleBoss?.attemptsUsed || 0) + 1),
    completions: {
      ...(currentCycleBoss?.completions || {}),
      normal: true,
    },
  };
  const advancedNow = now + (22 * 60 * 60 * 1000) + 5_000;
  const resetCycleBoss = ensureWeeklyBossState(
    {
      ...seed,
      combat: {
        ...(seed.combat || {}),
        weeklyBossEncounter: null,
      },
    },
    startedCycleBoss,
    advancedNow
  );

  checks.push(
    createCheck(
      "weekly-boss-cycle-reset-22h",
      "Weekly boss resetea intentos/completados al cambiar ciclo de 22h",
      (currentCycleBoss?.cycleKey || currentCycleBoss?.weekKey) !== (resetCycleBoss?.cycleKey || resetCycleBoss?.weekKey) &&
        Number(resetCycleBoss?.attemptsUsed || 0) === 0 &&
        !resetCycleBoss?.completions?.normal,
      `from=${currentCycleBoss?.cycleKey || currentCycleBoss?.weekKey}, to=${resetCycleBoss?.cycleKey || resetCycleBoss?.weekKey}, attempts=${Number(resetCycleBoss?.attemptsUsed || 0)}`
    )
  );

  return checks;
}

export function runContractsWeeklyRegression() {
  const checks = [
    ...runExpeditionContractChecks(),
    ...runWeeklyLedgerChecks(),
    ...runCounterAliasChecks(),
    ...runWeeklyBossCycleChecks(),
  ];
  const failedChecks = checks.filter(check => !check.pass);
  return {
    pass: failedChecks.length === 0,
    checks,
    failedChecks,
  };
}

export function formatContractsWeeklyRegressionReport(report = {}) {
  const checks = Array.isArray(report?.checks) ? report.checks : [];
  const failedChecks = Array.isArray(report?.failedChecks) ? report.failedChecks : [];
  const lines = [
    "IdleRPG Contracts + Weekly Regression",
    "===================================",
    `Resultado: ${report?.pass ? "PASS" : "FAIL"}`,
    "",
    "Checks",
    "------",
  ];

  checks.forEach(check => {
    lines.push(`${check.pass ? "[OK]" : "[FAIL]"} ${check.label}`);
    lines.push(`  ${check.details}`);
  });

  if (failedChecks.length > 0) {
    lines.push("");
    lines.push("Failed Checks");
    lines.push("-------------");
    failedChecks.forEach(check => {
      lines.push(`- ${check.id}: ${check.details}`);
    });
  }

  return lines.join("\n");
}
