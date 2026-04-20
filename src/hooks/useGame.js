import { useReducer, useEffect, useRef, useCallback } from "react";
import { gameReducer } from "../state/gameReducer";
import { initialState } from "../engine/stateInitializer";
import { clearGame, isRecoveryMode, saveGame } from "../utils/storage";
import { TICK_MS } from "../constants";
import { getLifetimeXp } from "../engine/leveling";

const OFFLINE_MIN_SECONDS = 60;
const OFFLINE_CHUNK_SIZE = 120;
const SAVE_THROTTLE_MS = import.meta.env.DEV ? 600 : 1800;
const ACCOUNT_TICK_MS = 5000;

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

export const useGame = () => {
  const [state, rawDispatch] = useReducer(gameReducer, initialState);
  const hydratedRef = useRef(false);
  const hiddenAtRef = useRef(null);
  const latestStateRef = useRef(state);
  const saveTimerRef = useRef(null);
  const offlineJobRef = useRef(null);
  const accountSessionStartedRef = useRef(false);
  const lastAccountTrackedAtRef = useRef(null);
  const recoveryMode = isRecoveryMode();
  const dispatch = useCallback((action) => {
    if (action?.type === "RESET_ALL_PROGRESS") {
      const now = Date.now();
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      offlineJobRef.current = null;
      hiddenAtRef.current = null;
      accountSessionStartedRef.current = true;
      lastAccountTrackedAtRef.current = now;
      clearGame();
      rawDispatch({
        type: "RESET_ALL_PROGRESS",
        meta: {
          ...(action?.meta || {}),
          source: "ui",
        },
      });
      rawDispatch({
        type: "START_ACCOUNT_SESSION",
        now,
        reset: true,
        meta: {
          ...(action?.meta || {}),
          source: "system",
        },
      });
      return;
    }

    const inferredSource =
      action?.meta?.source ||
      (action?.type === "TICK"
        ? "system"
        : action?.type === "BULK_TICK"
          ? (action?.source === "offline" ? "offline" : "system")
          : "ui");

    rawDispatch({
      ...action,
      meta: {
        ...(action?.meta || {}),
        source: inferredSource,
      },
    });
  }, []);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const flushAccountTime = useCallback((now = Date.now()) => {
    if (recoveryMode) return;
    if (document.hidden) return;
    if (!accountSessionStartedRef.current) return;
    if (!lastAccountTrackedAtRef.current) {
      lastAccountTrackedAtRef.current = now;
      return;
    }
    const elapsedSeconds = Math.max(0, Math.floor((now - lastAccountTrackedAtRef.current) / 1000));
    if (elapsedSeconds <= 0) return;
    lastAccountTrackedAtRef.current = now;
    dispatch({
      type: "TRACK_ACCOUNT_TIME",
      seconds: elapsedSeconds,
      phase: latestStateRef.current?.expedition?.phase || "sanctuary",
      now,
      meta: { replay: false },
    });
  }, [dispatch, recoveryMode]);

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
    dispatch({ type: "SYNC_SANCTUARY_JOBS", now: Date.now() });
  }, [dispatch, recoveryMode]);

  const flushSave = useCallback(() => {
    if (recoveryMode) return;
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    saveGame(latestStateRef.current);
  }, [recoveryMode]);

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
      if (document.hidden) return;
      if (offlineJobRef.current) return;
      if (latestStateRef.current?.expedition?.phase !== "active") return;
      if (latestStateRef.current?.onboarding?.step) return;
      dispatch({ type: "TICK" });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dispatch]);

  useEffect(() => {
    if (recoveryMode) return undefined;
    const id = setInterval(() => {
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
    const handleVisibilityChange = () => {
      if (document.hidden) {
        flushAccountTime(Date.now());
        hiddenAtRef.current = Date.now();
        flushSave();
        return;
      }

      const restoreAt = Date.now();
      dispatch({ type: "SYNC_SANCTUARY_JOBS", now: Date.now() });

      if (!hiddenAtRef.current) return;
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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [dispatch, flushAccountTime, flushSave, recoveryMode, startOfflineProgress]);

  useEffect(() => {
    if (recoveryMode) return undefined;

    const handlePageHide = () => {
      flushAccountTime(Date.now());
      flushSave();
    };
    const handleBeforeUnload = () => {
      flushAccountTime(Date.now());
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
    if (saveTimerRef.current) return;
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      saveGame(latestStateRef.current);
    }, SAVE_THROTTLE_MS);
  }, [recoveryMode, state]);

  useEffect(() => () => {
    flushAccountTime(Date.now());
    flushSave();
  }, [flushAccountTime, flushSave]);

  useEffect(() => {
    if (!import.meta.hot || recoveryMode) return undefined;
    const dispose = () => {
      flushAccountTime(Date.now());
      flushSave();
    };
    import.meta.hot.dispose(dispose);
    return () => {};
  }, [flushAccountTime, flushSave, recoveryMode]);

  return { state, dispatch };
};
