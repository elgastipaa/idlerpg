import { useReducer, useEffect, useRef, useCallback } from "react";
import { gameReducer } from "../state/gameReducer";
import { initialState } from "../engine/stateInitializer";
import { isRecoveryMode, saveGame } from "../utils/storage";
import { TICK_MS } from "../constants";
import { getLifetimeXp } from "../engine/leveling";

const OFFLINE_MIN_SECONDS = 60;
const OFFLINE_CHUNK_SIZE = 120;
const SAVE_THROTTLE_MS = import.meta.env.DEV ? 600 : 1800;

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
  const recoveryMode = isRecoveryMode();
  const dispatch = useCallback((action) => {
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
      if (latestStateRef.current?.combat?.pendingRunSetup) {
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
    const id = setInterval(() => {
      if (document.hidden) return;
      if (offlineJobRef.current) return;
      if (latestStateRef.current?.combat?.pendingRunSetup) return;
      dispatch({ type: "TICK" });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dispatch]);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (recoveryMode) return;
    if (state.combat?.pendingRunSetup) return;

    const savedAt = state.savedAt;
    if (!savedAt) return;

    const elapsedMs = Math.max(0, Date.now() - savedAt);
    if (elapsedMs < OFFLINE_MIN_SECONDS * 1000) return;
    const offlineTicks = Math.max(0, Math.min(3600, Math.floor(elapsedMs / TICK_MS)));
    if (offlineTicks > 0) {
      startOfflineProgress(offlineTicks);
    }
  }, [recoveryMode, startOfflineProgress, state.savedAt]);

  useEffect(() => {
    if (recoveryMode) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        flushSave();
        return;
      }

      if (!hiddenAtRef.current) return;
      if (latestStateRef.current?.combat?.pendingRunSetup) return;

      const elapsedMs = Math.max(0, Date.now() - hiddenAtRef.current);
      hiddenAtRef.current = null;
      if (elapsedMs < OFFLINE_MIN_SECONDS * 1000) return;
      const offlineTicks = Math.max(0, Math.min(3600, Math.floor(elapsedMs / TICK_MS)));
      if (offlineTicks > 0) {
        startOfflineProgress(offlineTicks);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [flushSave, recoveryMode, startOfflineProgress]);

  useEffect(() => {
    if (recoveryMode) return undefined;

    const handlePageHide = () => flushSave();
    const handleBeforeUnload = () => flushSave();

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [flushSave, recoveryMode]);

  useEffect(() => {
    if (recoveryMode) return;
    if (saveTimerRef.current) return;
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      saveGame(latestStateRef.current);
    }, SAVE_THROTTLE_MS);
  }, [recoveryMode, state]);

  useEffect(() => () => {
    flushSave();
  }, [flushSave]);

  useEffect(() => {
    if (!import.meta.hot || recoveryMode) return undefined;
    const dispose = () => flushSave();
    import.meta.hot.dispose(dispose);
    return () => {};
  }, [flushSave, recoveryMode]);

  return { state, dispatch };
};
