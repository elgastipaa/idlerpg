import { createEmptyOnboardingState, normalizeOnboardingState } from "../../engine/onboarding/onboardingEngine";
import { SANCTUARY_STATION_DEFAULTS } from "../../engine/sanctuary/laboratoryEngine";
import { buildReplayLibraryEntry, createEmptyReplayLog, normalizeReplayLibrary } from "../../utils/replayLog";
import { createEmptySessionAnalytics } from "../../utils/runTelemetry";

export function handleSystemUiAction(state, action) {
  switch (action?.type) {
    case "OPEN_LABORATORY":
    case "OPEN_DISTILLERY":
    case "CLOSE_LABORATORY":
      return {
        ...state,
        currentTab: "sanctuary",
      };

    case "RESET_SESSION_ANALYTICS":
      return {
        ...state,
        combat: {
          ...state.combat,
          analytics: createEmptySessionAnalytics(),
          log: [
            ...(state.combat?.log || []),
            "Telemetria de sesion reiniciada.",
          ].slice(-20),
        },
      };

    case "RESET_REPLAY_LOG":
      return {
        ...state,
        replay: createEmptyReplayLog(),
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "Replay de sesion reiniciado.",
          ].slice(-20),
        },
      };

    case "SAVE_CURRENT_REPLAY_TO_LIBRARY": {
      const currentReplay = state.replay || createEmptyReplayLog();
      const hasReplayData = (currentReplay.actions || []).length > 0 || (currentReplay.milestones || []).length > 0;
      if (!hasReplayData) return state;

      const nextLibrary = normalizeReplayLibrary({
        entries: [
          ...(state.replayLibrary?.entries || []),
          buildReplayLibraryEntry({ replay: currentReplay }, { label: action.label }),
        ],
      });

      return {
        ...state,
        replayLibrary: nextLibrary,
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `Replay guardado en biblioteca${action.label ? `: ${action.label}` : "."}`,
          ].slice(-20),
        },
      };
    }

    case "IMPORT_REPLAY_LIBRARY": {
      const entries = Array.isArray(action.entries) ? action.entries : [];
      if (entries.length === 0) return state;
      const nextLibrary = normalizeReplayLibrary({
        entries: [
          ...(state.replayLibrary?.entries || []),
          ...entries,
        ],
      });

      return {
        ...state,
        replayLibrary: nextLibrary,
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `${entries.length} replay(s) importados a la biblioteca.`,
          ].slice(-20),
        },
      };
    }

    case "TOGGLE_REPLAY_LIBRARY_ENTRY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({
          entries: (state.replayLibrary?.entries || []).map(entry =>
            entry.id === action.replayId ? { ...entry, isActive: !entry.isActive } : entry
          ),
        }),
      };

    case "DELETE_REPLAY_LIBRARY_ENTRY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({
          entries: (state.replayLibrary?.entries || []).filter(entry => entry.id !== action.replayId),
        }),
      };

    case "CLEAR_REPLAY_LIBRARY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({ entries: [] }),
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "Biblioteca de replays vaciada.",
          ].slice(-20),
        },
      };

    case "UPDATE_LOOT_RULES":
      return {
        ...state,
        settings: {
          ...state.settings,
          lootRules: {
            ...(state.settings?.lootRules || {}),
            ...(action.lootRules || {}),
          },
        },
      };

    case "TOGGLE_THEME":
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: state.settings?.theme === "dark" ? "light" : "dark",
        },
      };

    case "ACK_ONBOARDING_STEP":
      return {
        ...state,
        onboarding: normalizeOnboardingState(state.onboarding || createEmptyOnboardingState()),
      };

    case "DEV_UNLOCK_ALL_SANCTUARY_STATIONS": {
      const currentSanctuary = state?.sanctuary || {};
      const currentStations = currentSanctuary?.stations || {};
      const nextStations = Object.fromEntries(
        Object.entries(SANCTUARY_STATION_DEFAULTS).map(([stationId, defaults]) => [
          stationId,
          {
            ...defaults,
            ...(currentStations?.[stationId] || {}),
            unlocked: true,
          },
        ])
      );

      return {
        ...state,
        sanctuary: {
          ...currentSanctuary,
          stations: {
            ...currentStations,
            ...nextStations,
          },
          laboratory: {
            ...(currentSanctuary?.laboratory || {}),
            completed: {
              ...((currentSanctuary?.laboratory || {}).completed || {}),
              unlock_distillery: true,
              unlock_deep_forge: true,
              unlock_library: true,
              unlock_errands: true,
              unlock_sigil_altar: true,
            },
          },
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "SANTUARIO: Modo dev activa todas las estaciones para pruebas.",
          ].slice(-20),
        },
      };
    }

    case "SET_THEME":
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.theme === "dark" ? "dark" : "light",
        },
      };

    default:
      return null;
  }
}
