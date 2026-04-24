import { useReducer, useEffect, useRef, useCallback } from "react";
import { gameReducer } from "../state/gameReducer";
import { initialState } from "../engine/stateInitializer";
import { buildPersistedState, buildRecoveryExitUrl, clearGame, getSaveMode, isRecoveryMode, saveGame } from "../utils/storage";
import { TICK_MS } from "../constants";
import { getLifetimeXp } from "../engine/leveling";
import { shouldSyncSanctuaryJobsDuringOnboarding } from "../engine/onboarding/onboardingEngine";

const OFFLINE_MIN_SECONDS = 60;
const OFFLINE_CHUNK_SIZE = 120;
const SAVE_THROTTLE_MS = import.meta.env.DEV ? 800 : 2200;
const SAVE_IDLE_TIMEOUT_MS = 1400;
const ACCOUNT_TICK_MS = 5000;
const OFFLINE_JOB_STALL_MS = 12000;

function scheduleIdleWork(callback, timeout = SAVE_IDLE_TIMEOUT_MS) {
  if (typeof window === "undefined") return null;
  if (typeof window.requestIdleCallback === "function") {
    return {
      type: "idle",
      id: window.requestIdleCallback(callback, { timeout }),
    };
  }
  return {
    type: "timeout",
    id: window.setTimeout(callback, 0),
  };
}

function cancelIdleWork(handle) {
  if (!handle || typeof window === "undefined") return;
  if (handle.type === "idle" && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(handle.id);
    return;
  }
  window.clearTimeout(handle.id);
}

function cloneActionForDebug(action = {}) {
  try {
    return JSON.parse(JSON.stringify(action));
  } catch {
    return {
      type: action?.type || "UNKNOWN_ACTION",
      meta: action?.meta || {},
    };
  }
}

function buildPersistedSignature(state = {}) {
  try {
    return JSON.stringify(buildPersistedState(state));
  } catch {
    return null;
  }
}

function buildOfflineSnapshot(state = {}) {
  return {
    gold: Math.max(0, Math.floor(state.player?.gold || 0)),
    totalXp: getLifetimeXp(state.player?.level || 1, state.player?.xp || 0),
    essence: Math.max(0, Math.floor(state.player?.essence || 0)),
    kills: Math.max(0, Math.floor(state.stats?.kills || 0)),
    itemsFound: Math.max(0, Math.floor(state.stats?.itemsFound || 0)),
    level: Math.max(1, Math.floor(state.player?.level || 1)),
  };
}

function buildOfflineSummary(before, after, simulatedSeconds = 0) {
  const bestLootEvent = after?.combat?.latestLootEvent || null;
  const bestDropSource =
    bestLootEvent
      ? {
          bestDropName: bestLootEvent.name,
          bestDropRarity: bestLootEvent.rarity,
          bestDropHighlight: bestLootEvent.highlight,
          bestDropPerfectRolls: bestLootEvent.perfectRollCount,
        }
      : after?.combat?.runStats?.bestDropName
        ? after?.combat?.runStats
        : after?.combat?.lastRunSummary;

  return {
    simulatedSeconds,
    goldGained: Math.max(0, Math.floor((after?.player?.gold || 0) - (before?.gold || 0))),
    xpGained: Math.max(0, Math.floor(getLifetimeXp(after?.player?.level || 1, after?.player?.xp || 0) - (before?.totalXp || 0))),
    essenceGained: Math.max(0, Math.floor((after?.player?.essence || 0) - (before?.essence || 0))),
    killsGained: Math.max(0, Math.floor((after?.stats?.kills || 0) - (before?.kills || 0))),
    itemsGained: Math.max(0, Math.floor((after?.stats?.itemsFound || 0) - (before?.itemsFound || 0))),
    levelsGained: Math.max(0, Math.floor((after?.player?.level || 0) - (before?.level || 0))),
    bestDropName: bestDropSource?.bestDropName || null,
    bestDropRarity: bestDropSource?.bestDropRarity || null,
    bestDropHighlight: bestDropSource?.bestDropHighlight || null,
    bestDropPerfectRolls: bestDropSource?.bestDropPerfectRolls || 0,
  };
}

function hasExpeditionRunEvidence(snapshot = {}) {
  const expedition = snapshot?.expedition || {};
  const combat = snapshot?.combat || {};
  const telemetry = snapshot?.accountTelemetry || {};
  const hasRunIdentity = Boolean(expedition.id && expedition.startedAt);
  return (
    hasRunIdentity ||
    Number(combat.ticksInCurrentRun || 0) > 0 ||
    Number(combat.sessionKills || 0) > 0 ||
    Number(telemetry.currentExpeditionSeconds || 0) > 0
  );
}

function isAppBackgrounded() {
  if (typeof document === "undefined") return false;
  if (document.visibilityState === "visible") return false;
  if (typeof document.hasFocus === "function" && document.hasFocus()) return false;
  return Boolean(document.hidden);
}

export const useGame = () => {
  const [state, rawDispatch] = useReducer(gameReducer, initialState);
  const hydratedRef = useRef(false);
  const hiddenAtRef = useRef(null);
  const latestStateRef = useRef(state);
  const saveTimerRef = useRef(null);
  const saveCommitRef = useRef(null);
  const offlineJobRef = useRef(null);
  const accountSessionStartedRef = useRef(false);
  const lastAccountTrackedAtRef = useRef(null);
  const recentActionsRef = useRef([]);
  const lastPersistedSignatureRef = useRef(null);
  const saveMode = getSaveMode();
  const recoveryMode = isRecoveryMode();

  const prepareAction = useCallback((action) => {
    if (action?.type === "RESET_ALL_PROGRESS") {
      return {
        ...action,
        meta: {
          ...(action?.meta || {}),
          source: "ui",
        },
      };
    }

    const inferredSource =
      action?.meta?.source ||
      (action?.type === "TICK"
        ? "system"
        : action?.type === "BULK_TICK"
          ? (action?.source === "offline" ? "offline" : "system")
          : "ui");

    return {
      ...action,
      meta: {
        ...(action?.meta || {}),
        source: inferredSource,
      },
    };
  }, []);

  const cancelScheduledSave = useCallback(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (saveCommitRef.current) {
      cancelIdleWork(saveCommitRef.current);
      saveCommitRef.current = null;
    }
  }, []);

  const saveState = useCallback((nextState, { force = false } = {}) => {
    if (recoveryMode) return false;
    const signature = buildPersistedSignature(nextState);
    if (!force && signature && signature === lastPersistedSignatureRef.current) {
      return false;
    }
    const didSave = saveGame(nextState);
    if (didSave && signature) {
      lastPersistedSignatureRef.current = signature;
    }
    return didSave;
  }, [recoveryMode]);

  const projectDispatch = useCallback((action, { persist = false } = {}) => {
    const preparedAction = prepareAction(action);
    recentActionsRef.current = [
      ...recentActionsRef.current,
      { capturedAt: new Date().toISOString(), action: cloneActionForDebug(preparedAction) },
    ].slice(-20);
    const projectedState = gameReducer(latestStateRef.current, preparedAction);
    latestStateRef.current = projectedState;
    rawDispatch(preparedAction);
    if (persist && !recoveryMode) {
      cancelScheduledSave();
      saveState(projectedState);
    }
    return projectedState;
  }, [cancelScheduledSave, prepareAction, recoveryMode, saveState]);

  const dispatch = useCallback((action) => {
    if (action?.type === "RESET_ALL_PROGRESS") {
      const now = Date.now();
      cancelScheduledSave();
      offlineJobRef.current = null;
      hiddenAtRef.current = null;
      accountSessionStartedRef.current = true;
      lastAccountTrackedAtRef.current = now;
      lastPersistedSignatureRef.current = null;
      clearGame();
      const resetAction = prepareAction({
        type: "RESET_ALL_PROGRESS",
        meta: action?.meta,
      });
      recentActionsRef.current = [
        ...recentActionsRef.current,
        { capturedAt: new Date().toISOString(), action: cloneActionForDebug(resetAction) },
      ].slice(-20);
      rawDispatch(resetAction);
      const sessionAction = prepareAction({
        type: "START_ACCOUNT_SESSION",
        now,
        reset: true,
        meta: {
          ...(action?.meta || {}),
          source: "system",
        },
      });
      recentActionsRef.current = [
        ...recentActionsRef.current,
        { capturedAt: new Date().toISOString(), action: cloneActionForDebug(sessionAction) },
      ].slice(-20);
      rawDispatch(sessionAction);
      return;
    }

    const preparedAction = prepareAction(action);
    recentActionsRef.current = [
      ...recentActionsRef.current,
      { capturedAt: new Date().toISOString(), action: cloneActionForDebug(preparedAction) },
    ].slice(-20);
    rawDispatch(preparedAction);
  }, [cancelScheduledSave, prepareAction]);

  useEffect(() => {
    if (!saveMode.wipe) return;
    clearGame();
    const nextUrl = buildRecoveryExitUrl();
    if (window.location.href === nextUrl) return;
    window.location.replace(nextUrl);
  }, [saveMode.wipe]);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const flushAccountTime = useCallback((now = Date.now(), { persist = false, allowHidden = false } = {}) => {
    if (recoveryMode) return;
    if (isAppBackgrounded() && !allowHidden) return;
    if (!accountSessionStartedRef.current) return;
    if (!lastAccountTrackedAtRef.current) {
      lastAccountTrackedAtRef.current = now;
      return;
    }
    const elapsedSeconds = Math.max(0, Math.floor((now - lastAccountTrackedAtRef.current) / 1000));
    if (elapsedSeconds <= 0) return;
    lastAccountTrackedAtRef.current = now;
    const accountTimeAction = {
      type: "TRACK_ACCOUNT_TIME",
      seconds: elapsedSeconds,
      phase: latestStateRef.current?.expedition?.phase || "sanctuary",
      now,
      meta: { replay: false },
    };
    if (persist) {
      projectDispatch(accountTimeAction, { persist: true });
      return;
    }
    dispatch(accountTimeAction);
  }, [dispatch, projectDispatch, recoveryMode]);

  const shouldRepairFrozenExpedition = useCallback((snapshot = {}) => {
    const expedition = snapshot?.expedition || {};
    const combat = snapshot?.combat || {};
    const phase = expedition?.phase || "sanctuary";
    const hasRunEvidence = hasExpeditionRunEvidence(snapshot);

    if (!snapshot?.player?.class) return false;
    if (phase === "extraction") return false;

    const needsPhaseRepair =
      phase !== "active" &&
      phase !== "setup" &&
      !combat?.pendingRunSetup &&
      hasRunEvidence;
    const needsEnemyRepair =
      phase === "active" &&
      !combat?.enemy;
    const needsIdentityRepair =
      phase === "active" &&
      hasRunEvidence &&
      (!expedition?.id || !expedition?.startedAt);

    return needsPhaseRepair || needsEnemyRepair || needsIdentityRepair;
  }, []);

  const requestExpeditionRepair = useCallback((reason = "runtime_guard") => {
    const snapshot = latestStateRef.current;
    if (!shouldRepairFrozenExpedition(snapshot)) return false;
    dispatch({
      type: "REPAIR_EXPEDITION_STATE",
      reason,
      now: Date.now(),
      meta: { source: "system", replay: false },
    });
    return true;
  }, [dispatch, shouldRepairFrozenExpedition]);

  useEffect(() => {
    if (recoveryMode) return;
    if (accountSessionStartedRef.current) return;
    const now = Date.now();
    accountSessionStartedRef.current = true;
    lastAccountTrackedAtRef.current = now;
    dispatch({ type: "START_ACCOUNT_SESSION", now, meta: { replay: false, source: "system" } });
  }, [dispatch, recoveryMode]);

  useEffect(() => {
    if (recoveryMode) return;
    if (!shouldSyncSanctuaryJobsDuringOnboarding(latestStateRef.current)) return;
    dispatch({ type: "SYNC_SANCTUARY_JOBS", now: Date.now() });
  }, [dispatch, recoveryMode]);

  const flushSave = useCallback(() => {
    if (recoveryMode) return;
    cancelScheduledSave();
    saveState(latestStateRef.current, { force: true });
  }, [cancelScheduledSave, recoveryMode, saveState]);

  const startOfflineProgress = useCallback((offlineTicks) => {
    if (recoveryMode) return;
    if (latestStateRef.current?.onboarding?.step) return;
    const count = Math.max(0, Math.min(3600, Math.floor(offlineTicks || 0)));
    if (count <= 0) return;

    if (offlineJobRef.current) {
      offlineJobRef.current.remaining += count;
      offlineJobRef.current.total += count;
      return;
    }

    offlineJobRef.current = {
      remaining: count,
      total: count,
      before: buildOfflineSnapshot(latestStateRef.current),
      lastProgressAt: Date.now(),
    };

    const step = () => {
      const job = offlineJobRef.current;
      if (!job) return;
      if (latestStateRef.current?.onboarding?.step) {
        offlineJobRef.current = null;
        return;
      }
      if (latestStateRef.current?.expedition?.phase !== "active") {
        offlineJobRef.current = null;
        return;
      }

      if (job.remaining <= 0) {
        const finalState = latestStateRef.current;
        dispatch({
          type: "SET_OFFLINE_SUMMARY",
          summary: buildOfflineSummary(job.before, finalState, job.total),
        });
        offlineJobRef.current = null;
        return;
      }

      const chunk = Math.min(OFFLINE_CHUNK_SIZE, job.remaining);
      job.remaining -= chunk;
      job.lastProgressAt = Date.now();
      dispatch({ type: "BULK_TICK", count: chunk, source: "offline_chunk" });
      window.setTimeout(step, 0);
    };

    window.setTimeout(step, 0);
  }, [dispatch, recoveryMode]);

  useEffect(() => {
    if (recoveryMode) return undefined;
    const id = window.setInterval(() => {
      flushAccountTime(Date.now());
    }, ACCOUNT_TICK_MS);
    return () => window.clearInterval(id);
  }, [flushAccountTime, recoveryMode]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isAppBackgrounded()) return;

      const offlineJob = offlineJobRef.current;
      if (offlineJob) {
        const stalledForMs = Date.now() - Number(offlineJob.lastProgressAt || 0);
        if (stalledForMs > OFFLINE_JOB_STALL_MS) {
          offlineJobRef.current = null;
          dispatch({
            type: "REPAIR_EXPEDITION_STATE",
            reason: "offline_job_stall",
            telemetryOnly: true,
            now: Date.now(),
            meta: { source: "system", replay: false },
          });
        }
      }

      if (requestExpeditionRepair("tick_guard")) return;
      if (offlineJobRef.current) return;
      if (latestStateRef.current?.expedition?.phase !== "active") return;
      if (latestStateRef.current?.onboarding?.step === "hunt_intro") return;
      dispatch({ type: "TICK" });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dispatch, requestExpeditionRepair]);

  useEffect(() => {
    if (recoveryMode) return undefined;
    const id = setInterval(() => {
      if (!shouldSyncSanctuaryJobsDuringOnboarding(latestStateRef.current)) return;
      const jobs = latestStateRef.current?.sanctuary?.jobs || [];
      if (!jobs.some(job => job?.status === "running")) return;
      dispatch({ type: "SYNC_SANCTUARY_JOBS", now: Date.now() });
    }, 5000);
    return () => clearInterval(id);
  }, [dispatch, recoveryMode]);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (recoveryMode) return;

    const savedAt = state.savedAt;
    if (!savedAt) return;

    const elapsedMs = Math.max(0, Date.now() - savedAt);
    const offlineSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    if (offlineSeconds > 0) {
      dispatch({ type: "TRACK_OFFLINE_TIME", seconds: offlineSeconds, now: Date.now(), meta: { replay: false } });
    }
    if (state.expedition?.phase === "active" && elapsedMs >= OFFLINE_MIN_SECONDS * 1000) {
      const offlineTicks = Math.max(0, Math.min(3600, Math.floor(elapsedMs / TICK_MS)));
      if (offlineTicks > 0) {
        startOfflineProgress(offlineTicks);
      }
    }
  }, [dispatch, recoveryMode, startOfflineProgress, state.expedition?.phase, state.savedAt]);

  useEffect(() => {
    if (recoveryMode) return;
    const handleBackground = () => {
      const now = Date.now();
      flushAccountTime(now, { persist: true, allowHidden: true });
      hiddenAtRef.current = now;
      flushSave();
    };

    const handleForeground = (source = "foreground") => {
      const restoreAt = Date.now();
      if (shouldSyncSanctuaryJobsDuringOnboarding(latestStateRef.current)) {
        dispatch({ type: "SYNC_SANCTUARY_JOBS", now: restoreAt });
      }
      requestExpeditionRepair(source);

      if (!hiddenAtRef.current) {
        lastAccountTrackedAtRef.current = restoreAt;
        return;
      }

      const elapsedMs = Math.max(0, restoreAt - hiddenAtRef.current);
      hiddenAtRef.current = null;
      const offlineSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
      if (offlineSeconds > 0) {
        dispatch({ type: "TRACK_OFFLINE_TIME", seconds: offlineSeconds, now: restoreAt, meta: { replay: false } });
      }
      lastAccountTrackedAtRef.current = restoreAt;
      if (latestStateRef.current?.expedition?.phase === "active" && elapsedMs >= OFFLINE_MIN_SECONDS * 1000) {
        const offlineTicks = Math.max(0, Math.min(3600, Math.floor(elapsedMs / TICK_MS)));
        if (offlineTicks > 0) {
          startOfflineProgress(offlineTicks);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (isAppBackgrounded()) {
        handleBackground();
        return;
      }
      handleForeground("visibility_restore");
    };
    const handleFocus = () => handleForeground("focus_restore");
    const handlePageShow = () => handleForeground("pageshow_restore");
    const handleBlur = () => {
      if (!isAppBackgrounded()) return;
      handleBackground();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("blur", handleBlur);
    };
  }, [dispatch, flushAccountTime, flushSave, recoveryMode, requestExpeditionRepair, startOfflineProgress]);

  useEffect(() => {
    if (recoveryMode) return undefined;

    const handlePageHide = () => {
      hiddenAtRef.current = Date.now();
      flushAccountTime(Date.now(), { persist: true, allowHidden: true });
      flushSave();
    };
    const handleBeforeUnload = () => {
      flushAccountTime(Date.now(), { persist: true, allowHidden: true });
      flushSave();
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushAccountTime, flushSave, recoveryMode]);

  useEffect(() => {
    if (recoveryMode) return;
    if (saveTimerRef.current || saveCommitRef.current) return;
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      saveCommitRef.current = scheduleIdleWork(() => {
        saveCommitRef.current = null;
        saveState(latestStateRef.current);
      });
    }, SAVE_THROTTLE_MS);
  }, [recoveryMode, saveState, state]);

  useEffect(() => () => {
    flushAccountTime(Date.now(), { persist: true, allowHidden: true });
    flushSave();
  }, [flushAccountTime, flushSave]);

  useEffect(() => {
    if (!import.meta.hot || recoveryMode) return undefined;
    const dispose = () => {
      flushAccountTime(Date.now(), { persist: true, allowHidden: true });
      flushSave();
    };
    import.meta.hot.dispose(dispose);
    return () => {};
  }, [flushAccountTime, flushSave, recoveryMode]);

  return { state, dispatch, getRecentActions: () => recentActionsRef.current };
};
