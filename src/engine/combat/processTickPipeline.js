import { processTick as processTickRuntime } from "./processTickRuntime";

export const TICK_STAGE_IDS = Object.freeze([
  "preCombat",
  "combat",
  "loot",
  "progress",
  "postTick",
]);

function toCount(value = 0) {
  return Math.max(0, Number(value || 0));
}

export function runPreCombatStage(state = {}) {
  const expeditionPhase = state?.expedition?.phase || "sanctuary";
  const playerClass = state?.player?.class || null;
  const hasEnemy = Boolean(state?.combat?.enemy);
  const playerHp = Math.max(0, Number(state?.player?.hp || 0));
  const playerDead = playerHp <= 0;
  const canTick = expeditionPhase === "active" && hasEnemy && !playerDead;

  return {
    stage: "preCombat",
    canTick,
    reason: canTick
      ? "ok"
      : playerDead
        ? "player_dead"
        : !hasEnemy
          ? "missing_enemy"
          : expeditionPhase !== "active"
            ? "not_active_phase"
            : "unknown",
    snapshot: {
      expeditionPhase,
      playerClass,
      hasEnemy,
      playerHp,
      currentTier: Math.max(1, Number(state?.combat?.currentTier || 1)),
      maxTier: Math.max(1, Number(state?.combat?.maxTier || 1)),
    },
  };
}

export function runCombatStage(state = {}) {
  return {
    stage: "combat",
    nextState: processTickRuntime(state),
  };
}

export function runLootStage(previousState = {}, nextState = {}) {
  const prevStats = previousState?.stats || {};
  const nextStats = nextState?.stats || {};
  const prevAnalytics = previousState?.combat?.analytics || {};
  const nextAnalytics = nextState?.combat?.analytics || {};

  const lootDelta = {
    itemsFound: toCount(nextStats?.itemsFound) - toCount(prevStats?.itemsFound),
    itemsExtracted: toCount(nextStats?.itemsExtracted) - toCount(prevStats?.itemsExtracted),
    itemsSold: toCount(nextStats?.itemsSold) - toCount(prevStats?.itemsSold),
    autoExtractedItems: toCount(nextStats?.autoExtractedItems) - toCount(prevStats?.autoExtractedItems),
    autoSoldItems: toCount(nextStats?.autoSoldItems) - toCount(prevStats?.autoSoldItems),
    analyticsItemsFound: toCount(nextAnalytics?.itemsFound) - toCount(prevAnalytics?.itemsFound),
  };

  return {
    stage: "loot",
    delta: lootDelta,
    hadLootEvent: Boolean(nextState?.combat?.latestLootEvent),
  };
}

export function runProgressStage(previousState = {}, nextState = {}) {
  const prevStats = previousState?.stats || {};
  const nextStats = nextState?.stats || {};
  const prevAnalytics = previousState?.combat?.analytics || {};
  const nextAnalytics = nextState?.combat?.analytics || {};

  const progressDelta = {
    kills: toCount(nextStats?.kills) - toCount(prevStats?.kills),
    bossKills: toCount(nextStats?.bossKills) - toCount(prevStats?.bossKills),
    analyticsKills: toCount(nextAnalytics?.kills) - toCount(prevAnalytics?.kills),
    analyticsBossKills: toCount(nextAnalytics?.bossKills) - toCount(prevAnalytics?.bossKills),
    currentTier: Math.max(1, Number(nextState?.combat?.currentTier || 1)) - Math.max(1, Number(previousState?.combat?.currentTier || 1)),
    maxTier: Math.max(1, Number(nextState?.combat?.maxTier || 1)) - Math.max(1, Number(previousState?.combat?.maxTier || 1)),
  };

  return {
    stage: "progress",
    delta: progressDelta,
  };
}

export function runPostTickStage(previousState = {}, nextState = {}, stageData = {}) {
  const logCountBefore = Array.isArray(previousState?.combat?.log) ? previousState.combat.log.length : 0;
  const logCountAfter = Array.isArray(nextState?.combat?.log) ? nextState.combat.log.length : 0;

  return {
    stage: "postTick",
    logDelta: logCountAfter - logCountBefore,
    stageData,
    nextState,
  };
}

export function processTickWithStages(state = {}, { onStage = null } = {}) {
  const preCombat = runPreCombatStage(state);
  if (typeof onStage === "function") onStage(preCombat.stage, preCombat);

  const combatStage = runCombatStage(state);
  if (typeof onStage === "function") onStage(combatStage.stage, combatStage);

  const lootStage = runLootStage(state, combatStage.nextState);
  if (typeof onStage === "function") onStage(lootStage.stage, lootStage);

  const progressStage = runProgressStage(state, combatStage.nextState);
  if (typeof onStage === "function") onStage(progressStage.stage, progressStage);

  const postTickStage = runPostTickStage(state, combatStage.nextState, {
    preCombat,
    lootStage,
    progressStage,
  });
  if (typeof onStage === "function") onStage(postTickStage.stage, postTickStage);

  return postTickStage.nextState;
}

export function processTick(state = {}) {
  return processTickWithStages(state);
}
