import { ACTIVE_GOALS } from "../../data/activeGoals";
import { isExpeditionContractClaimable } from "../../engine/progression/expeditionContracts";
import { isGoalCompleted } from "../../engine/progression/goalEngine";
import { isWeeklyLedgerContractClaimable } from "../../engine/progression/weeklyLedger";
import { createEmptySessionAnalytics } from "../../utils/runTelemetry";

export function handleProgressionMetaAction(
  state,
  action,
  {
    withAchievementProgress,
    getAccountTelemetry = rawState => ({ ...(rawState?.accountTelemetry || {}) }),
    getCurrentOnlineSeconds = () => 0,
  } = {}
) {
  if (action?.type === "CLAIM_EXPEDITION_CONTRACT") {
    const expeditionContracts = state?.expeditionContracts || {};
    const contracts = Array.isArray(expeditionContracts?.contracts) ? expeditionContracts.contracts : [];
    const contractIndex = contracts.findIndex(contract => contract?.id === action.contractId);
    if (contractIndex < 0) return state;
    const contract = contracts[contractIndex];
    if (!isExpeditionContractClaimable(state, contract)) return state;

    const reward = contract.reward || {};
    const essenceGain = Math.max(0, Number(reward?.essence || 0));
    const codexInkGain = Math.max(0, Number(reward?.codexInk || 0));
    const sigilFluxGain = Math.max(0, Number(reward?.sigilFlux || 0));
    const relicDustGain = Math.max(0, Number(reward?.relicDust || 0));
    const nextContracts = contracts.map((entry, index) =>
      index === contractIndex ? { ...entry, claimed: true, readyToClaim: false } : entry
    );
    const rewardParts = [];
    if (essenceGain > 0) rewardParts.push(`+${essenceGain} esencia`);
    if (codexInkGain > 0) rewardParts.push(`+${codexInkGain} tinta`);
    if (sigilFluxGain > 0) rewardParts.push(`+${sigilFluxGain} flux`);
    if (relicDustGain > 0) rewardParts.push(`+${relicDustGain} polvo`);
    const rewardLabel = rewardParts.length > 0 ? rewardParts.join(", ") : "sin recompensa";
    const nextActiveContractId = expeditionContracts?.activeContractId === contract.id
      ? null
      : expeditionContracts?.activeContractId || null;

    const baseTelemetry = getAccountTelemetry(state);
    const nextTelemetry = {
      ...baseTelemetry,
      expeditionContractCompletions: Math.max(0, Number(baseTelemetry?.expeditionContractCompletions || 0)) + 1,
      expeditionContractClaims: Math.max(0, Number(baseTelemetry?.expeditionContractClaims || 0)) + 1,
    };
    if (nextTelemetry.firstExpeditionContractClaimAtOnlineSeconds == null) {
      nextTelemetry.firstExpeditionContractClaimAtOnlineSeconds = getCurrentOnlineSeconds(nextTelemetry);
    }

    return withAchievementProgress({
      ...state,
      player: {
        ...state.player,
        essence: (state.player.essence || 0) + essenceGain,
      },
      sanctuary: {
        ...(state.sanctuary || {}),
        resources: {
          ...((state.sanctuary || {}).resources || {}),
          codexInk: Math.max(0, Number(state?.sanctuary?.resources?.codexInk || 0) + codexInkGain),
          sigilFlux: Math.max(0, Number(state?.sanctuary?.resources?.sigilFlux || 0) + sigilFluxGain),
          relicDust: Math.max(0, Number(state?.sanctuary?.resources?.relicDust || 0) + relicDustGain),
        },
      },
      expeditionContracts: {
        ...expeditionContracts,
        contracts: nextContracts,
        activeContractId: nextActiveContractId,
      },
      accountTelemetry: nextTelemetry,
      combat: {
        ...state.combat,
        analytics: {
          ...(state.combat.analytics || createEmptySessionAnalytics()),
          expeditionContractsCompleted: Math.max(0, Number(state?.combat?.analytics?.expeditionContractsCompleted || 0)) + 1,
        },
        log: [
          ...(state.combat.log || []),
          `CONTRATO: ${contract?.title || contract?.goal?.name || "Contrato"} reclamado (${rewardLabel}).`,
        ].slice(-20),
      },
    });
  }

  if (action?.type === "CLAIM_GOAL") {
    const goal = ACTIVE_GOALS.find(candidate => candidate.id === action.goalId);
    if (!goal) return null;
    if ((state.goals?.claimed || []).includes(goal.id)) return state;
    if (!isGoalCompleted(state, goal)) return state;

    const reward = goal.reward || {};
    return withAchievementProgress({
      ...state,
      player: {
        ...state.player,
        gold: (state.player.gold || 0) + (reward.gold || 0),
        essence: (state.player.essence || 0) + (reward.essence || 0),
        talentPoints: (state.player.talentPoints || 0) + (reward.talentPoints || 0),
      },
      goals: {
        ...state.goals,
        claimed: [...(state.goals?.claimed || []), goal.id],
      },
      combat: {
        ...state.combat,
        analytics: {
          ...(state.combat.analytics || createEmptySessionAnalytics()),
          goldEarned: (state.combat.analytics?.goldEarned || 0) + (reward.gold || 0),
          essenceEarned: (state.combat.analytics?.essenceEarned || 0) + (reward.essence || 0),
          goldBySource: {
            ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
            goals: (state.combat.analytics?.goldBySource?.goals || 0) + (reward.gold || 0),
          },
          essenceBySource: {
            ...(state.combat.analytics?.essenceBySource || createEmptySessionAnalytics().essenceBySource),
            goals: (state.combat.analytics?.essenceBySource?.goals || 0) + (reward.essence || 0),
          },
        },
        log: [
          ...(state.combat.log || []),
          `OBJETIVO: ${goal.name} reclamado (+${reward.gold || 0} oro, +${reward.essence || 0} esencia${reward.talentPoints ? `, +${reward.talentPoints} TP` : ""})`,
        ].slice(-20),
      },
    });
  }

  if (action?.type === "CLAIM_WEEKLY_LEDGER_CONTRACT") {
    const contracts = Array.isArray(state?.weeklyLedger?.contracts) ? state.weeklyLedger.contracts : [];
    const contractIndex = contracts.findIndex(contract => contract?.id === action.contractId);
    if (contractIndex < 0) return state;
    const contract = contracts[contractIndex];
    if (!isWeeklyLedgerContractClaimable(state, contract)) return state;

    const reward = contract.reward || {};
    const goal = ACTIVE_GOALS.find(candidate => candidate.id === contract.goalId);
    const nextContracts = contracts.map((entry, index) =>
      index === contractIndex ? { ...entry, claimed: true } : entry
    );

    const baseTelemetry = getAccountTelemetry(state);
    const nextTelemetry = {
      ...baseTelemetry,
      weeklyLedgerClaims: Math.max(0, Number(baseTelemetry?.weeklyLedgerClaims || 0)) + 1,
    };
    if (nextTelemetry.firstWeeklyClaimAtOnlineSeconds == null) {
      nextTelemetry.firstWeeklyClaimAtOnlineSeconds = getCurrentOnlineSeconds(nextTelemetry);
    }

    return withAchievementProgress({
      ...state,
      player: {
        ...state.player,
        gold: (state.player.gold || 0) + (reward.gold || 0),
        essence: (state.player.essence || 0) + (reward.essence || 0),
        talentPoints: (state.player.talentPoints || 0) + (reward.talentPoints || 0),
      },
      weeklyLedger: {
        ...state.weeklyLedger,
        contracts: nextContracts,
      },
      accountTelemetry: nextTelemetry,
      combat: {
        ...state.combat,
        analytics: {
          ...(state.combat.analytics || createEmptySessionAnalytics()),
          goldEarned: (state.combat.analytics?.goldEarned || 0) + (reward.gold || 0),
          essenceEarned: (state.combat.analytics?.essenceEarned || 0) + (reward.essence || 0),
          goldBySource: {
            ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
            goals: (state.combat.analytics?.goldBySource?.goals || 0) + (reward.gold || 0),
          },
          essenceBySource: {
            ...(state.combat.analytics?.essenceBySource || createEmptySessionAnalytics().essenceBySource),
            goals: (state.combat.analytics?.essenceBySource?.goals || 0) + (reward.essence || 0),
          },
        },
        log: [
          ...(state.combat.log || []),
          `LEDGER: ${(contract.laneLabel || "Contrato semanal")} · ${goal?.name || "objetivo"} reclamado (+${reward.gold || 0} oro, +${reward.essence || 0} esencia${reward.talentPoints ? `, +${reward.talentPoints} TP` : ""})`,
        ].slice(-20),
      },
    });
  }

  return null;
}
