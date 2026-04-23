export function handleAccountStateAction(state, action, dependencies) {
  const {
    createFreshState,
    deriveExpeditionPhase,
    getAccountTelemetry,
    getSaveDiagnostics,
    mergeStateWithDefaults,
    trackAccountPhaseTime,
  } = dependencies;

  switch (action?.type) {
    case "RESET_ALL_PROGRESS":
      return createFreshState();

    case "START_ACCOUNT_SESSION": {
      const now = Number(action.now || Date.now());
      const telemetry = getAccountTelemetry(state);
      return {
        ...state,
        accountTelemetry: {
          ...telemetry,
          firstSeenAt: telemetry.firstSeenAt || now,
          lastActiveAt: now,
          lastSessionStartedAt: now,
          currentSessionSeconds: 0,
          sessionCount: Math.max(0, Number(telemetry.sessionCount || 0)) + 1,
          saveResets: Math.max(0, Number(telemetry.saveResets || 0)) + (action.reset ? 1 : 0),
        },
      };
    }

    case "TRACK_ACCOUNT_TIME": {
      const seconds = Math.max(0, Math.floor(Number(action.seconds || 0)));
      if (seconds <= 0) return state;
      const phase = action.phase || state.expedition?.phase || deriveExpeditionPhase(state);
      return {
        ...state,
        accountTelemetry: trackAccountPhaseTime(
          getAccountTelemetry(state),
          phase,
          seconds,
          Number(action.now || Date.now())
        ),
      };
    }

    case "TRACK_OFFLINE_TIME": {
      const seconds = Math.max(0, Math.floor(Number(action.seconds || 0)));
      if (seconds <= 0) return state;
      const telemetry = getAccountTelemetry(state);
      return {
        ...state,
        accountTelemetry: {
          ...telemetry,
          totalOfflineSeconds: Math.max(0, Number(telemetry.totalOfflineSeconds || 0)) + seconds,
          offlineRecoveryCount: Math.max(0, Number(telemetry.offlineRecoveryCount || 0)) + 1,
          longestOfflineSeconds: Math.max(Math.max(0, Number(telemetry.longestOfflineSeconds || 0)), seconds),
          lastActiveAt: Number(action.now || Date.now()),
        },
      };
    }

    case "REPAIR_SAVE_STATE": {
      const repairedState = mergeStateWithDefaults(createFreshState(), state);
      const telemetry = {
        ...getAccountTelemetry(repairedState),
        saveRepairs: Math.max(0, Number(repairedState?.accountTelemetry?.saveRepairs || 0)) + 1,
        lastActiveAt: Number(action.now || Date.now()),
      };
      return {
        ...repairedState,
        accountTelemetry: telemetry,
        saveDiagnostics: {
          ...getSaveDiagnostics(repairedState),
          legacyNeedsRepair: false,
          lastRepairAt: Number(action.now || Date.now()),
        },
        combat: {
          ...repairedState.combat,
          log: [
            ...(repairedState.combat?.log || []),
            "SAVE: estado reparado y remigrado con la version actual.",
          ].slice(-20),
        },
      };
    }

    case "DISMISS_LEGACY_SAVE_PROMPT": {
      const diagnostics = getSaveDiagnostics(state);
      if (!diagnostics.legacyNeedsRepair) return state;
      return {
        ...state,
        saveDiagnostics: {
          ...diagnostics,
          legacyPromptShownCount: Math.min(3, Math.max(0, Number(diagnostics.legacyPromptShownCount || 0)) + 1),
        },
      };
    }

    default:
      return null;
  }
}
