import { ACTIVE_GOALS } from "../../data/activeGoals";
import { isGoalCompleted } from "../../engine/progression/goalEngine";
import { isWeeklyLedgerContractClaimable } from "../../engine/progression/weeklyLedger";
import { createEmptySessionAnalytics } from "../../utils/runTelemetry";

export function handleProgressionMetaAction(state, action, { withAchievementProgress }) {
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
