import { useReducer, useEffect, useRef, useCallback } from "react";
import { gameReducer } from "../state/gameReducer";
import { initialState } from "../engine/stateInitializer";
import { saveGame } from "../utils/storage";
import { TICK_MS } from "../constants";

const OFFLINE_MIN_SECONDS = 300;

export const useGame = () => {
  const [state, rawDispatch] = useReducer(gameReducer, initialState);
  const hydratedRef = useRef(false);
  const hiddenAtRef = useRef(null);
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
    const id = setInterval(() => {
      if (document.hidden) return;
      dispatch({ type: "TICK" });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const savedAt = state.savedAt;
    if (!savedAt) return;

    const elapsedMs = Math.max(0, Date.now() - savedAt);
    if (elapsedMs < OFFLINE_MIN_SECONDS * 1000) return;
    const offlineTicks = Math.max(0, Math.min(3600, Math.floor(elapsedMs / TICK_MS)));
    if (offlineTicks > 0) {
      dispatch({ type: "BULK_TICK", count: offlineTicks, source: "offline" });
    }
  }, [state.savedAt]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        return;
      }

      if (!hiddenAtRef.current) return;

      const elapsedMs = Math.max(0, Date.now() - hiddenAtRef.current);
      hiddenAtRef.current = null;
      if (elapsedMs < OFFLINE_MIN_SECONDS * 1000) return;
      const offlineTicks = Math.max(0, Math.min(3600, Math.floor(elapsedMs / TICK_MS)));
      if (offlineTicks > 0) {
        dispatch({ type: "BULK_TICK", count: offlineTicks, source: "offline" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    saveGame(state);
  }, [state]);

  return { state, dispatch };
};
