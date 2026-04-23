import React, { Suspense, lazy, useState, useEffect, useRef, useCallback } from "react";
import packageJson from "../package.json";
import { useGame } from "./hooks/useGame";
import Sanctuary from "./components/Sanctuary";
import OnboardingOverlay from "./components/OnboardingOverlay";
import OverlayShell from "./components/OverlayShell";
import { getRarityColor } from "./constants/rarity";
import {
  buildRunSigilChoiceProfile,
  buildRunSigilLoadoutProfile,
  formatRunSigilLoadout,
  getRunSigil,
  normalizeRunSigilIds,
  RUN_SIGILS,
  summarizeRunSigilLoadout,
} from "./data/runSigils";
import { getMaxRunSigilSlots } from "./engine/progression/abyssProgression";
import {
  canOpenExpedition,
  getOnboardingRequiredTab,
  isSanctuaryLockedDuringExpeditionTutorial,
  isOnboardingTabAllowed,
  ONBOARDING_STEPS,
  shouldShowHeroPrimaryTab,
} from "./engine/onboarding/onboardingEngine";
import { buildTesterSnapshot, copyTextToClipboard, createDebugErrorEntry, formatDebugValue } from "./utils/testerSnapshot";

const Prestige = lazy(() => import("./components/Prestige"));
const HeroView = lazy(() => import("./components/HeroView"));
const ExpeditionView = lazy(() => import("./components/ExpeditionView"));
const RegistryView = lazy(() => import("./components/RegistryView"));
const ExtractionOverlay = lazy(() => import("./components/ExtractionOverlay"));

class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(`Tab render error: ${this.props.label || "tab"}`, error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.label !== this.props.label && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "18px", minHeight: "220px", display: "grid", gap: "8px", alignContent: "start" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
            Error de Tab
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
            {this.props.label || "Esta pantalla"} no se pudo renderizar.
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
            Cambia de tab y volve a entrar. Si persiste, el error ya queda logueado en consola para rastrearlo sin dejar la app en blanco.
          </div>
          {typeof this.props.onRecover === "function" && (
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onRecover();
              }}
              style={{
                width: "fit-content",
                border: "1px solid var(--color-border-primary, #e2e8f0)",
                background: "var(--color-background-secondary, #ffffff)",
                color: "var(--color-text-primary, #1e293b)",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.72rem",
                fontWeight: "900",
                cursor: "pointer",
              }}
            >
              {this.props.recoverLabel || "Recuperar"}
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const THEMES = {
  light: {
    "--color-background-primary": "#f8fafc",
    "--color-background-secondary": "#ffffff",
    "--color-background-tertiary": "#f1f5f9",
    "--color-background-info": "#e0e7ff",
    "--color-surface-overlay": "rgba(255,255,255,0.92)",
    "--color-text-primary": "#1e293b",
    "--color-text-secondary": "#475569",
    "--color-text-tertiary": "#94a3b8",
    "--color-text-info": "#4338ca",
    "--color-border-primary": "#e2e8f0",
    "--color-border-secondary": "#dbe7e3",
    "--color-border-tertiary": "#cbd5e1",
    "--color-shadow": "rgba(15,23,42,0.08)",
    "--tone-success": "#1D9E75",
    "--tone-success-strong": "#047857",
    "--tone-success-soft": "#ecfdf5",
    "--tone-danger": "#D85A30",
    "--tone-danger-strong": "#b91c1c",
    "--tone-danger-soft": "#fff1f2",
    "--tone-warning": "#f59e0b",
    "--tone-warning-soft": "#fff7ed",
    "--tone-info": "#0369a1",
    "--tone-info-soft": "#f0f9ff",
    "--tone-violet": "#7c3aed",
    "--tone-violet-soft": "#f3e8ff",
    "--tone-accent": "#534AB7",
    "--tone-accent-soft": "#eef2ff",
    "--tone-neutral-strong": "#1e293b",
    "--tone-neutral-soft": "#f8fafc",
  },
  dark: {
    "--color-background-primary": "#0b1220",
    "--color-background-secondary": "#111a2e",
    "--color-background-tertiary": "#162237",
    "--color-background-info": "#1c2b4d",
    "--color-surface-overlay": "rgba(17,26,46,0.92)",
    "--color-text-primary": "#e5eefc",
    "--color-text-secondary": "#b6c2d9",
    "--color-text-tertiary": "#7c8aa5",
    "--color-text-info": "#a5b4fc",
    "--color-border-primary": "#22314d",
    "--color-border-secondary": "#22314d",
    "--color-border-tertiary": "#30415f",
    "--color-shadow": "rgba(2,6,23,0.45)",
    "--tone-success": "#34d399",
    "--tone-success-strong": "#6ee7b7",
    "--tone-success-soft": "rgba(16,185,129,0.16)",
    "--tone-danger": "#f87171",
    "--tone-danger-strong": "#fca5a5",
    "--tone-danger-soft": "rgba(244,63,94,0.16)",
    "--tone-warning": "#fbbf24",
    "--tone-warning-soft": "rgba(245,158,11,0.16)",
    "--tone-info": "#7dd3fc",
    "--tone-info-soft": "rgba(56,189,248,0.16)",
    "--tone-violet": "#c4b5fd",
    "--tone-violet-soft": "rgba(139,92,246,0.18)",
    "--tone-accent": "#a5b4fc",
    "--tone-accent-soft": "rgba(99,102,241,0.18)",
    "--tone-neutral-strong": "#dbe7ff",
    "--tone-neutral-soft": "#162237",
  },
};

function formatOfflineValue(value) {
  if (typeof value !== "number") return value;
  return Math.floor(value).toLocaleString();
}

function formatHeaderResource(value) {
  if (typeof value !== "number") return value;
  const floored = Math.floor(value);
  const absValue = Math.abs(floored);
  if (absValue < 1000) return floored.toLocaleString();

  const units = [
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "k" },
  ];

  let unitIndex = units.findIndex(entry => absValue >= entry.threshold);
  if (unitIndex === -1) unitIndex = units.length - 1;

  let unit = units[unitIndex];
  let compactValue = Math.floor((absValue / unit.threshold) * 10) / 10;
  if (compactValue >= 999.9 && unitIndex > 0) {
    unit = units[unitIndex - 1];
    compactValue = 1.0;
  }

  const signedValue = floored < 0 ? -compactValue : compactValue;
  return `${signedValue.toFixed(1)}${unit.suffix}`;
}

function getOfflineHeadline(summary) {
  if (!summary) return "";
  if (summary.bestDropRarity === "legendary") return "Mientras dormias, una leyenda encontro el camino hasta tu mochila.";
  if (summary.bestDropRarity === "epic") return "Tu heroe cerro la sesion con un drop realmente serio.";
  if ((summary.itemsGained || 0) >= 8) return "Tu mochila amanecio cargada de botin.";
  if ((summary.killsGained || 0) >= 50) return "Tu heroe arraso con una buena parte del frente.";
  if ((summary.levelsGained || 0) >= 2) return "Volviste bastante mas fuerte que antes.";
  return "Tu heroe siguio peleando mientras no estabas mirando.";
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 3);
}

function buildOfflineSummaryKey(summary = {}) {
  return [
    summary?.simulatedSeconds || 0,
    summary?.goldGained || 0,
    summary?.xpGained || 0,
    summary?.essenceGained || 0,
    summary?.killsGained || 0,
    summary?.itemsGained || 0,
    summary?.levelsGained || 0,
    summary?.bestDropName || "",
  ].join("|");
}

function buildActionToastFromLog(logLine = "") {
  const text = String(logLine || "").trim();
  if (!text) return null;

  if (text.startsWith("MOCHILA LLENA:")) {
    return {
      tone: "warning",
      label: text.replace("MOCHILA LLENA:", "Mochila llena ·"),
    };
  }

  if (text.startsWith("OBJETIVO:")) {
    return {
      tone: "success",
      label: text.replace("OBJETIVO:", "Objetivo ·"),
    };
  }

  if (!text.startsWith("SANTUARIO:")) return null;

  const label = text.replace("SANTUARIO:", "").trim();
  let tone = "info";
  if (/reclamad|vuelve|completa|convierte|desguaza|alcanza/i.test(label)) {
    tone = "success";
  } else if (/retirado|pierde|sin recuperacion/i.test(label)) {
    tone = "warning";
  }

  return { tone, label };
}

function isPrestigeTabUnlocked(state) {
  return Number(state?.prestige?.level || 0) > 0 || Number(state?.prestige?.totalEchoesEarned || 0) > 0;
}

function getPrimaryTab(tab = "sanctuary") {
  if (tab === "inventory" || tab === "crafting" || tab === "codex" || tab === "combat") return "combat";
  if (tab === "skills" || tab === "talents" || tab === "character") return "character";
  if (tab === "account" || tab === "achievements" || tab === "stats" || tab === "system" || tab === "registry") return "registry";
  if (tab === "prestige") return "prestige";
  return "sanctuary";
}

function getVisiblePrimaryTab(tab = "sanctuary", state = {}) {
  const primaryTab = getPrimaryTab(tab);
  if (primaryTab === "prestige" && !isPrestigeTabUnlocked(state)) return "sanctuary";
  return primaryTab;
}

function getDefaultTabForPrimaryTab(primaryTab = "sanctuary") {
  if (primaryTab === "combat") return "combat";
  if (primaryTab === "character") return "character";
  if (primaryTab === "prestige") return "prestige";
  if (primaryTab === "registry") return "registry";
  return "sanctuary";
}

function isPrimaryTabAllowed(primaryTab = "sanctuary", onboardingStep = null, state = {}) {
  if (!state?.player?.class && state?.expedition?.phase === "setup") {
    return primaryTab === "sanctuary";
  }
  if (primaryTab === "sanctuary" && isSanctuaryLockedDuringExpeditionTutorial(state)) {
    return false;
  }
  if (!onboardingStep) return true;
  if (primaryTab === "combat") {
    return ["combat", "inventory", "crafting", "codex"].some(tab => isOnboardingTabAllowed(onboardingStep, tab));
  }
  if (primaryTab === "character") {
    return ["character", "skills", "talents"].some(tab => isOnboardingTabAllowed(onboardingStep, tab));
  }
  return isOnboardingTabAllowed(onboardingStep, getDefaultTabForPrimaryTab(primaryTab));
}

function renderCurrentTab(currentTab, state, dispatch) {
  const primaryTab = getVisiblePrimaryTab(currentTab, state);
  if (primaryTab === "sanctuary") return <Sanctuary state={state} dispatch={dispatch} />;
  if (primaryTab === "character") return <HeroView state={state} dispatch={dispatch} />;
  if (primaryTab === "combat") return <ExpeditionView state={state} dispatch={dispatch} />;
  if (primaryTab === "prestige") return <Prestige state={state} dispatch={dispatch} />;
  if (primaryTab === "registry") return <RegistryView state={state} dispatch={dispatch} />;
  return null;
}

const PRIMARY_TAB_CONFIG = {
  sanctuary:    { label: "Santuario", icon: "🕯️" },
  character:    { label: "Heroe", icon: "⚔️" },
  combat:       { label: "Expedicion", icon: "🗡️" },
  prestige:     { label: "Ecos", icon: "🜂" },
  registry:     { label: "Mas", icon: "🗂️" },
};

const APP_VERSION = packageJson?.version || "0.0.0";
const DEBUG_TRIPLE_CLICK_WINDOW_MS = 750;
const MAX_RECENT_ERROR_ENTRIES = 20;

export default function App() {
  const { state, dispatch, getRecentActions } = useGame();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLegacySavePrompt, setShowLegacySavePrompt] = useState(false);
  const [testerToast, setTesterToast] = useState(null);
  const [actionToast, setActionToast] = useState(null);
  const contentRef = useRef(null);
  const prevTabRef = useRef(null);
  const recentErrorLogRef = useRef([]);
  const headerTapTimesRef = useRef([]);
  const previousCombatLogRef = useRef(null);
  const offlineSummary = state.combat?.offlineSummary;
  const hasTalentPoints = (state.player?.talentPoints || 0) > 0;
  const reforgeLocked = !!state.combat?.reforgeSession;
  const inventoryUpgrades = (state.player?.inventory || []).filter(item => {
    const compare = item.type === "weapon" ? state.player?.equipment?.weapon : state.player?.equipment?.armor;
    return (item?.rating || 0) > (compare?.rating || 0);
  }).length;
  const theme = state.settings?.theme === "dark" ? "dark" : "light";
  const themeVars = THEMES[theme];
  const runSigilSlotCount = getMaxRunSigilSlots(state?.abyss || {});
  const activeRunSigilIds = normalizeRunSigilIds(
    state.combat?.activeRunSigilIds || state.combat?.activeRunSigilId || "free",
    { slots: runSigilSlotCount }
  );
  const pendingRunSigilIds = normalizeRunSigilIds(
    state.combat?.pendingRunSigilIds || state.combat?.pendingRunSigilId || "free",
    { slots: runSigilSlotCount }
  );
  const activeRunSigilLabel = formatRunSigilLoadout(activeRunSigilIds, { short: true });
  const showActiveRunSigil = Number(state.prestige?.level || 0) >= 1 && !state.combat?.pendingRunSetup;

  useEffect(() => {
    document.body.style.margin = "0";
    const style = document.createElement("style");
    style.innerHTML = `
      * { box-sizing: border-box; }
      body {
        background-color: var(--color-background-primary, #f8fafc);
        color: var(--color-text-primary, #1e293b);
        margin: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `;
    document.head.appendChild(style);

    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.style.colorScheme = theme;
    document.body.style.backgroundColor = themeVars["--color-background-primary"];
    document.body.style.color = themeVars["--color-text-primary"];
  }, [theme, themeVars]);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-header-offset", `${isMobile ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT_DESKTOP}px`);
  }, [isMobile]);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-bottom-nav-offset", `${isMobile ? NAV_HEIGHT_MOBILE : 0}px`);
  }, [isMobile]);

  const HEADER_HEIGHT_MOBILE = 62;
  const HEADER_HEIGHT_DESKTOP = 68;
  const NAV_HEIGHT_MOBILE = 72;
  const DESKTOP_MAX_WIDTH = 1180;
  const onboardingStep = state?.onboarding?.step || null;
  const currentPrimaryTab = getVisiblePrimaryTab(state.currentTab, state);
  const prestigeTabUnlocked = isPrestigeTabUnlocked(state);
  const expeditionUnlocked = canOpenExpedition(state);
  const showHeroPrimaryTab = shouldShowHeroPrimaryTab(state);
  const visiblePrimaryTabs = ["sanctuary", "combat", ...(showHeroPrimaryTab ? ["character"] : []), ...(prestigeTabUnlocked ? ["prestige"] : []), "registry"];
  const sanctuaryOnboardingScrollLocked = [
    ONBOARDING_STEPS.OPEN_LABORATORY,
    ONBOARDING_STEPS.RESEARCH_DISTILLERY,
    ONBOARDING_STEPS.DISTILLERY_READY,
    ONBOARDING_STEPS.OPEN_DISTILLERY,
    ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
  ].includes(onboardingStep);

  const pushRecentError = useCallback((entry) => {
    if (!entry) return;
    recentErrorLogRef.current = [...recentErrorLogRef.current, entry].slice(-MAX_RECENT_ERROR_ENTRIES);
  }, []);

  useEffect(() => {
    const handleWindowError = (event) => {
      pushRecentError(createDebugErrorEntry("window.error", {
        message: event?.message || "Error no capturado",
        stack: event?.error?.stack || null,
        file: event?.filename || null,
        line: event?.lineno,
        column: event?.colno,
      }));
    };

    const handleUnhandledRejection = (event) => {
      pushRecentError(createDebugErrorEntry("unhandledrejection", {
        message: formatDebugValue(event?.reason),
        stack: event?.reason?.stack || null,
        detail: formatDebugValue(event?.reason, { maxLength: 720 }),
      }));
    };

    const originalConsoleError = console.error.bind(console);
    console.error = (...args) => {
      const firstErrorLike = args.find(arg => arg instanceof Error || typeof arg?.stack === "string");
      pushRecentError(createDebugErrorEntry("console.error", {
        message: args.map(arg => formatDebugValue(arg)).join(" | "),
        stack: firstErrorLike?.stack || null,
        detail: args.slice(0, 4).map(arg => formatDebugValue(arg, { maxLength: 420 })).join(" || "),
      }));
      originalConsoleError(...args);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [pushRecentError]);

  useEffect(() => {
    if (!testerToast) return undefined;
    const timeout = window.setTimeout(() => setTesterToast(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [testerToast]);

  useEffect(() => {
    if (!actionToast) return undefined;
    const timeout = window.setTimeout(() => setActionToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [actionToast]);

  const combatLog = state.combat?.log || [];

  useEffect(() => {
    if (previousCombatLogRef.current == null) {
      previousCombatLogRef.current = combatLog;
      return;
    }
    const previousLog = Array.isArray(previousCombatLogRef.current) ? previousCombatLogRef.current : [];
    const nextEntries =
      combatLog.length >= previousLog.length
        ? combatLog.slice(previousLog.length)
        : combatLog;
    previousCombatLogRef.current = combatLog;
    const nextToastLine = [...nextEntries]
      .reverse()
      .find(entry => buildActionToastFromLog(entry));
    if (!nextToastLine) return;
    const nextToast = buildActionToastFromLog(nextToastLine);
    if (!nextToast) return;
    setActionToast({
      ...nextToast,
      id: `action-toast-${Date.now()}`,
    });
  }, [combatLog]);

  const triggerTesterSnapshot = useCallback(async () => {
    const payload = buildTesterSnapshot(state, {
      version: APP_VERSION,
      recentErrors: recentErrorLogRef.current,
      recentActions: getRecentActions(),
    });
    try {
      await copyTextToClipboard(JSON.stringify(payload, null, 2));
      setTesterToast({ tone: "success", label: "Reporte copiado" });
    } catch (error) {
      pushRecentError(createDebugErrorEntry("tester.snapshot", {
        message: "No se pudo copiar el reporte de tester.",
        stack: error?.stack || null,
        detail: formatDebugValue(error),
      }));
      setTesterToast({ tone: "danger", label: "No se pudo copiar" });
    }
  }, [getRecentActions, pushRecentError, state]);

  const handleHeaderDebugTap = useCallback(() => {
    const now = Date.now();
    const recentTaps = [...headerTapTimesRef.current, now]
      .filter(timestamp => now - timestamp <= DEBUG_TRIPLE_CLICK_WINDOW_MS)
      .slice(-3);
    headerTapTimesRef.current = recentTaps;
    if (recentTaps.length === 3) {
      headerTapTimesRef.current = [];
      triggerTesterSnapshot();
    }
  }, [triggerTesterSnapshot]);
  const saveDiagnostics = state.saveDiagnostics || {};
  const shouldOfferLegacyRepair =
    Boolean(saveDiagnostics.legacyNeedsRepair) &&
    Number(saveDiagnostics.legacyPromptShownCount || 0) < 3;

  function scrollAppToTop(behavior = "auto") {
    const scrollRoot = document.scrollingElement || document.documentElement || document.body;
    window.scrollTo({ top: 0, behavior });
    if (typeof document.documentElement.scrollTo === "function") {
      document.documentElement.scrollTo({ top: 0, behavior });
    } else if (behavior !== "smooth") {
      document.documentElement.scrollTop = 0;
    }
    if (typeof document.body.scrollTo === "function") {
      document.body.scrollTo({ top: 0, behavior });
    } else if (behavior !== "smooth") {
      document.body.scrollTop = 0;
    }
    if (scrollRoot && typeof scrollRoot.scrollTo === "function") {
      scrollRoot.scrollTo({ top: 0, behavior });
    } else if (scrollRoot && behavior !== "smooth") {
      scrollRoot.scrollTop = 0;
    }
    if (contentRef.current) {
      if (typeof contentRef.current.scrollTo === "function") {
        contentRef.current.scrollTo({ top: 0, behavior });
      } else if (behavior !== "smooth") {
        contentRef.current.scrollTop = 0;
      }
    }
  }

  function scrollAppToTopSoon(behavior = "auto") {
    scrollAppToTop(behavior);
    window.requestAnimationFrame(() => {
      scrollAppToTop(behavior);
      window.requestAnimationFrame(() => {
        scrollAppToTop(behavior);
      });
    });
  }

  useEffect(() => {
    if (prevTabRef.current !== state.currentTab) {
      scrollAppToTopSoon();
      prevTabRef.current = state.currentTab;
    }
  }, [state.currentTab]);

  useEffect(() => {
    if (!shouldOfferLegacyRepair) {
      setShowLegacySavePrompt(false);
      return;
    }
    setShowLegacySavePrompt(true);
  }, [shouldOfferLegacyRepair]);

  function getPrimaryTabDestination(tab) {
    const requiredOnboardingTab = getOnboardingRequiredTab(state?.onboarding?.step || null);
    if (
      tab === "combat" &&
      ["combat", "inventory", "crafting", "codex"].includes(requiredOnboardingTab)
    ) {
      return requiredOnboardingTab;
    }
    if (
      tab === "character" &&
      ["character", "skills", "talents"].includes(requiredOnboardingTab)
    ) {
      return requiredOnboardingTab;
    }
    return getDefaultTabForPrimaryTab(tab);
  }

  function handlePrimaryTabPress(tab) {
    const destinationTab = getPrimaryTabDestination(tab);
    const isActive = currentPrimaryTab === tab;
    if (isActive) {
      if (tab === "sanctuary" && sanctuaryOnboardingScrollLocked) {
        return;
      }
      window.dispatchEvent(new CustomEvent("primary-tab-reselected", { detail: { tab } }));
      if (state.currentTab !== destinationTab) {
        dispatch({ type: "SET_TAB", tab: destinationTab });
      } else {
        scrollAppToTopSoon("smooth");
      }
      return;
    }
    if (!isPrimaryTabAllowed(tab, onboardingStep, state)) {
      return;
    }
    if (tab === "combat" && !expeditionUnlocked) {
      dispatch({ type: "SET_TAB", tab: "sanctuary" });
      return;
    }
    dispatch({ type: "SET_TAB", tab: destinationTab });
  }
  const resourceSummary = (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflowX: "auto", scrollbarWidth: "none" }}>
      {showActiveRunSigil && (
        <HeaderCompactChip
          text={activeRunSigilLabel}
          color="var(--tone-accent, #4338ca)"
          borderColor="rgba(99,102,241,0.22)"
          background="var(--tone-accent-soft, #eef2ff)"
        />
      )}
      <HeaderResourcePill
        label="Oro"
        value={formatHeaderResource(state.player?.gold || 0)}
        color="var(--tone-warning, #f59e0b)"
        borderColor="rgba(245,158,11,0.22)"
        background="var(--tone-warning-soft, #fff7ed)"
        compact
      />
      <HeaderResourcePill
        label="Esencia"
        value={formatHeaderResource(state.player?.essence || 0)}
        color="var(--tone-violet, #7c3aed)"
        borderColor="rgba(124,58,237,0.22)"
        background="var(--tone-violet-soft, #f3e8ff)"
        compact
      />
    </div>
  );

  function dismissLegacySavePrompt() {
    if (!showLegacySavePrompt) return;
    setShowLegacySavePrompt(false);
    dispatch({ type: "DISMISS_LEGACY_SAVE_PROMPT", meta: { replay: false } });
  }

  function handleLegacyRepairRoute() {
    dismissLegacySavePrompt();
    dispatch({ type: "SET_TAB", tab: "system", meta: { replay: false } });
  }

  return (
    <div style={{ backgroundColor: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
      <header style={{ position: "fixed", top: 0, left: 0, width: "100%", height: isMobile ? `${HEADER_HEIGHT_MOBILE}px` : `${HEADER_HEIGHT_DESKTOP}px`, backgroundColor: "var(--color-background-primary, #f8fafc)", borderBottom: "1px solid var(--color-border-secondary, #e2e8f0)", zIndex: 5000, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: `${DESKTOP_MAX_WIDTH}px`, width: "100%", margin: "0 auto", padding: isMobile ? "8px 14px" : "10px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: "8px" }} onClick={handleHeaderDebugTap}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? "1.15rem" : "1.55rem", fontWeight: "800", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.1 }}>
                {PRIMARY_TAB_CONFIG[currentPrimaryTab].label}
              </h1>
            </div>
            {reforgeLocked && (
              <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--tone-violet, #6d28d9)", padding: "3px 7px", borderRadius: "999px", background: "var(--tone-violet-soft, #f3e8ff)", border: "1px solid rgba(124,58,237,0.18)", whiteSpace: "nowrap", flexShrink: 0 }}>
                Reforja
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: isMobile ? 1 : "0 1 auto", justifyContent: "flex-end" }}>
            <div style={{ minWidth: 0, maxWidth: isMobile ? "calc(100vw - 120px)" : "100%" }}>
              {resourceSummary}
            </div>
            <button
              onClick={() => dispatch({ type: "TOGGLE_THEME" })}
              title="Cambiar tema"
              aria-label="Cambiar tema"
              style={themeToggleButtonStyle(isMobile)}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </header>

      <div ref={contentRef} style={{ paddingTop: isMobile ? `${HEADER_HEIGHT_MOBILE}px` : `${HEADER_HEIGHT_DESKTOP}px`, paddingBottom: isMobile ? "180px" : "40px", paddingLeft: isMobile ? "0px" : "24px", paddingRight: isMobile ? "0px" : "24px", maxWidth: isMobile ? "100%" : `${DESKTOP_MAX_WIDTH}px`, width: "100%", margin: "0 auto", flex: 1 }}>
        <style>{`
          @keyframes appPrimaryTabSpotlightPulse {
            0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.22); }
            70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
            100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
          }
        `}</style>
        {!isMobile && (
          <div style={{ marginBottom: "12px", background: "var(--color-background-secondary, #ffffff)", border: "1px solid var(--color-border-tertiary, #cbd5e1)", borderRadius: "12px", boxShadow: "0 4px 20px var(--color-shadow, rgba(0,0,0,0.05))", padding: "10px 12px" }}>
            <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {visiblePrimaryTabs.map((t) => (
                (() => {
                  const disabled =
                    (reforgeLocked && currentPrimaryTab !== t) ||
                    (t === "combat" && !expeditionUnlocked) ||
                    !isPrimaryTabAllowed(t, onboardingStep, state);
                  const spotlightHeroPrimary = onboardingStep === ONBOARDING_STEPS.OPEN_HERO && t === "character";
                  const spotlightPrestigePrimary = onboardingStep === ONBOARDING_STEPS.FIRST_ECHOES && t === "prestige";
                  const spotlightSanctuaryPrimary = onboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY && t === "sanctuary";
                  return (
                    <button
                      key={t}
                      disabled={disabled}
                      data-onboarding-target={
                        spotlightSanctuaryPrimary
                          ? "primary-sanctuary-tab"
                          : spotlightHeroPrimary
                          ? "primary-hero-tab"
                          : spotlightPrestigePrimary
                            ? "primary-prestige-tab"
                            : undefined
                      }
                      onClick={() => handlePrimaryTabPress(t)}
                      style={{
                        padding: "7px 13px",
                        cursor: disabled ? "not-allowed" : "pointer",
                        backgroundColor: currentPrimaryTab === t ? "var(--color-background-info, #e0e7ff)" : "var(--color-background-secondary, #ffffff)",
                        color: disabled ? "var(--color-text-tertiary, #94a3b8)" : currentPrimaryTab === t ? "var(--color-text-info, #4338ca)" : "var(--color-text-primary, #1e293b)",
                        border: "1px solid var(--color-border-tertiary, #cbd5e1)",
                        borderRadius: "8px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                        opacity: disabled ? 0.55 : 1,
                        position: spotlightHeroPrimary || spotlightPrestigePrimary || spotlightSanctuaryPrimary ? "relative" : "static",
                        zIndex: spotlightHeroPrimary || spotlightPrestigePrimary || spotlightSanctuaryPrimary ? 2 : 1,
                        boxShadow: spotlightHeroPrimary || spotlightPrestigePrimary || spotlightSanctuaryPrimary
                          ? "0 0 0 2px rgba(83,74,183,0.18), 0 12px 28px rgba(83,74,183,0.18)"
                          : "none",
                        animation: spotlightHeroPrimary || spotlightPrestigePrimary || spotlightSanctuaryPrimary ? "appPrimaryTabSpotlightPulse 1600ms ease-in-out infinite" : "none",
                      }}
                    >
                  <span>{PRIMARY_TAB_CONFIG[t].icon}</span>
                  {PRIMARY_TAB_CONFIG[t].label}
                  {t === "character" && hasTalentPoints && (
                    <span style={{ marginLeft: "4px", minWidth: "18px", height: "18px", padding: "0 6px", borderRadius: "999px", background: "var(--tone-danger, #ef4444)", color: "#fff", fontSize: "0.62rem", fontWeight: "900", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {state.player.talentPoints}
                    </span>
                  )}
                  {t === "combat" && inventoryUpgrades > 0 && (
                    <span style={{ marginLeft: "4px", minWidth: "18px", height: "18px", padding: "0 6px", borderRadius: "999px", background: "var(--tone-success, #10b981)", color: "#fff", fontSize: "0.62rem", fontWeight: "900", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {inventoryUpgrades > 9 ? "9+" : inventoryUpgrades}
                    </span>
                  )}
                    </button>
                  );
                })()
              ))}
            </nav>
          </div>
        )}
        {offlineSummary && (
          <OfflineSummaryPanel
            summary={offlineSummary}
            isMobile={isMobile}
            onDismiss={() => dispatch({ type: "DISMISS_OFFLINE_SUMMARY" })}
          />
        )}

        <main style={{ width: "100%", background: isMobile ? "transparent" : "var(--color-background-secondary, #ffffff)", borderRadius: isMobile ? "0" : "12px", border: isMobile ? "none" : "1px solid var(--color-border-tertiary, #cbd5e1)", boxShadow: isMobile ? "none" : "0 4px 20px var(--color-shadow, rgba(0,0,0,0.05))" }}>
          <TabErrorBoundary
            label={PRIMARY_TAB_CONFIG[currentPrimaryTab].label}
            recoverLabel={
              ["active", "setup"].includes(state.expedition?.phase || "sanctuary")
                ? "Ir a Expedicion"
                : "Ir al Santuario"
            }
            onRecover={() => dispatch({
              type: "SET_TAB",
              tab: ["active", "setup"].includes(state.expedition?.phase || "sanctuary") ? "combat" : "sanctuary",
            })}
          >
            <Suspense fallback={<TabLoadingCard label={PRIMARY_TAB_CONFIG[currentPrimaryTab].label} />}>
              {renderCurrentTab(state.currentTab, state, dispatch)}
            </Suspense>
          </TabErrorBoundary>
        </main>
      </div>

      {state.combat?.pendingRunSetup && state.player?.class && (
        <RunSigilOverlay
          isMobile={isMobile}
          pendingRunSigilIds={pendingRunSigilIds}
          onSelect={(sigilId, slotIndex) => dispatch({ type: "SELECT_RUN_SIGIL", sigilId, slotIndex })}
          onStart={() => dispatch({ type: "START_RUN" })}
          prestigeLevel={state.prestige?.level || 0}
          sigilSlotCount={runSigilSlotCount}
        />
      )}

      {state.expedition?.phase === "extraction" && (
        <Suspense fallback={<OverlayLoadingCard label="extraccion" isMobile={isMobile} />}>
          <ExtractionOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobile}
          />
        </Suspense>
      )}

      <OnboardingOverlay state={state} dispatch={dispatch} isMobile={isMobile} />

      {showLegacySavePrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.58)",
            zIndex: 6500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "18px" : "28px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "var(--color-background-secondary, #ffffff)",
              border: "1px solid var(--color-border-primary, #e2e8f0)",
              borderRadius: "18px",
              padding: isMobile ? "18px" : "22px",
              display: "grid",
              gap: "12px",
              boxShadow: "0 24px 60px rgba(2, 6, 23, 0.35)",
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: "900", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--tone-warning, #f59e0b)" }}>
              Save legado detectado
            </div>
            <div style={{ fontSize: isMobile ? "1rem" : "1.08rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
              Save viejo para el sistema actual
            </div>
            <div style={{ fontSize: "0.78rem", lineHeight: 1.55, color: "var(--color-text-secondary, #475569)" }}>
              Por favor reparalo en <strong>Mas &gt; Sistema &gt; Reparar save</strong>, o más recomendado, <strong>reiniciá tu progreso</strong>. Este aviso solo va a aparecer hasta <strong>3 veces</strong>.
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={handleLegacyRepairRoute}
                style={{
                  border: "none",
                  background: "var(--tone-warning, #f59e0b)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "0.76rem",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                Ir a Mas &gt; Sistema
              </button>
              <button
                onClick={dismissLegacySavePrompt}
                style={{
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  background: "var(--color-background-secondary, #ffffff)",
                  color: "var(--color-text-primary, #1e293b)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "0.76rem",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                Más tarde
              </button>
            </div>
          </div>
        </div>
      )}

      {testerToast && (
        <div
          style={{
            position: "fixed",
            top: isMobile ? `${HEADER_HEIGHT_MOBILE + 10}px` : `${HEADER_HEIGHT_DESKTOP + 12}px`,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 7200,
            borderRadius: "999px",
            padding: "8px 12px",
            fontSize: "0.72rem",
            fontWeight: "900",
            border: `1px solid ${testerToast.tone === "danger" ? "rgba(216,90,48,0.28)" : "rgba(29,158,117,0.24)"}`,
            background: testerToast.tone === "danger" ? "var(--tone-danger-soft, #fff1f2)" : "var(--tone-success-soft, #ecfdf5)",
            color: testerToast.tone === "danger" ? "var(--tone-danger, #D85A30)" : "var(--tone-success-strong, #047857)",
            boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
            pointerEvents: "none",
          }}
        >
          {testerToast.label}
        </div>
      )}

      {actionToast && (
        <div
          style={{
            position: "fixed",
            top: isMobile
              ? `${HEADER_HEIGHT_MOBILE + (testerToast ? 52 : 10)}px`
              : `${HEADER_HEIGHT_DESKTOP + (testerToast ? 54 : 12)}px`,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 7190,
            borderRadius: "999px",
            padding: "8px 12px",
            fontSize: "0.72rem",
            fontWeight: "900",
            border: `1px solid ${
              actionToast.tone === "success"
                ? "rgba(29,158,117,0.24)"
                : actionToast.tone === "warning"
                  ? "rgba(245,158,11,0.26)"
                  : "rgba(3,105,161,0.24)"
            }`,
            background:
              actionToast.tone === "success"
                ? "var(--tone-success-soft, #ecfdf5)"
                : actionToast.tone === "warning"
                  ? "var(--tone-warning-soft, #fff7ed)"
                  : "var(--tone-info-soft, #f0f9ff)",
            color:
              actionToast.tone === "success"
                ? "var(--tone-success-strong, #047857)"
                : actionToast.tone === "warning"
                  ? "var(--tone-warning, #f59e0b)"
                  : "var(--tone-info, #0369a1)",
            boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
            pointerEvents: "none",
            maxWidth: isMobile ? "calc(100vw - 28px)" : "640px",
            textAlign: "center",
          }}
        >
          {actionToast.label}
        </div>
      )}

      {isMobile && (
        <>
          <nav style={{ position: "fixed", bottom: 0, left: 0, width: "100%", height: `${NAV_HEIGHT_MOBILE}px`, backgroundColor: "var(--color-background-secondary, #ffffff)", borderTop: "1px solid var(--color-border-secondary, #e2e8f0)", display: "flex", zIndex: 5000, paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "content-box" }}>
            {visiblePrimaryTabs.map((t) => {
              const isActive = currentPrimaryTab === t;
              const disabled =
                (reforgeLocked && !isActive) ||
                (t === "combat" && !expeditionUnlocked) ||
                !isPrimaryTabAllowed(t, onboardingStep, state);
              const spotlightHeroPrimary = onboardingStep === ONBOARDING_STEPS.OPEN_HERO && t === "character";
              const spotlightPrestigePrimary = onboardingStep === ONBOARDING_STEPS.FIRST_ECHOES && t === "prestige";
              const spotlightSanctuaryPrimary = onboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY && t === "sanctuary";
              return (
                <button
                  key={t}
                  disabled={disabled}
                  data-onboarding-target={
                    spotlightSanctuaryPrimary
                      ? "primary-sanctuary-tab"
                      : spotlightHeroPrimary
                      ? "primary-hero-tab"
                      : spotlightPrestigePrimary
                        ? "primary-prestige-tab"
                        : undefined
                  }
                  onClick={() => handlePrimaryTabPress(t)}
                  style={{
                    flex: 1,
                    minWidth: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "2px",
                    background: isActive ? "var(--color-background-info, #f1f5f9)" : "transparent",
                    border: "none",
                    outline: "none",
                    position: "relative",
                    paddingTop: "5px",
                    opacity: disabled ? 0.45 : 1,
                    boxShadow: spotlightHeroPrimary || spotlightPrestigePrimary || spotlightSanctuaryPrimary
                      ? "0 0 0 2px rgba(83,74,183,0.18), 0 10px 24px rgba(83,74,183,0.16)"
                      : "none",
                    animation: spotlightHeroPrimary || spotlightPrestigePrimary || spotlightSanctuaryPrimary ? "appPrimaryTabSpotlightPulse 1600ms ease-in-out infinite" : "none",
                    zIndex: spotlightHeroPrimary || spotlightPrestigePrimary || spotlightSanctuaryPrimary ? 2 : 1,
                  }}
                >
                  <span style={{ filter: isActive ? "none" : "grayscale(1) opacity(0.5)", position: "relative", fontSize: "21px", lineHeight: 1 }}>
                    {PRIMARY_TAB_CONFIG[t].icon}
                  </span>
                  <span style={{ fontSize: "0.56rem", fontWeight: "900", color: isActive ? "var(--color-text-info, #4338ca)" : "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {PRIMARY_TAB_CONFIG[t].label}
                  </span>
                  {t === "combat" && inventoryUpgrades > 0 && (
                    <span style={{ position: "absolute", top: "6px", right: "14px", minWidth: "16px", height: "16px", padding: "0 5px", borderRadius: "999px", background: "var(--tone-success, #10b981)", color: "#fff", fontSize: "0.56rem", fontWeight: "900", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {inventoryUpgrades > 9 ? "9+" : inventoryUpgrades}
                    </span>
                  )}
                  {t === "character" && hasTalentPoints && (
                    <span style={{ position: "absolute", top: "6px", right: "12px", minWidth: "16px", height: "16px", padding: "0 5px", borderRadius: "999px", background: "var(--tone-danger, #ef4444)", color: "#fff", fontSize: "0.56rem", fontWeight: "900", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {state.player.talentPoints}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}

function TabLoadingCard({ label }) {
  return (
    <div style={{ padding: "18px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "220px", color: "var(--color-text-secondary, #475569)", fontWeight: "900", fontSize: "0.82rem" }}>
      Cargando {label}...
    </div>
  );
}

function OverlayLoadingCard({ label, isMobile = false }) {
  return (
    <OverlayShell isMobile={isMobile}>
      <div style={{ width: "100%", maxWidth: "480px", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", background: "var(--color-background-secondary, #ffffff)", color: "var(--color-text-secondary, #475569)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", padding: isMobile ? "18px 16px 20px" : "20px 22px", textAlign: "center", fontSize: "0.82rem", fontWeight: "900" }}>
        Cargando {label}...
      </div>
    </OverlayShell>
  );
}

function OfflineMetric({ label, value, color }) {
  return (
    <div style={{ background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "10px", padding: "6px 8px", display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", fontWeight: "800", marginBottom: "3px" }}>{label}</span>
      <span style={{ fontSize: "0.84rem", fontWeight: "900", color }}>{value}</span>
    </div>
  );
}

function OfflineSummaryPanel({ summary, isMobile, onDismiss }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const summaryKey = buildOfflineSummaryKey(summary);

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();
    const durationMs = 1450;

    setAnimationProgress(0);

    const tick = now => {
      const raw = Math.min(1, (now - startedAt) / durationMs);
      setAnimationProgress(easeOutCubic(raw));
      if (raw < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [summaryKey]);

  const animatedValue = value => formatOfflineValue((Number(value || 0) * animationProgress));
  const bestDropVisible = animationProgress >= 0.62;
  const progressPercent = Math.round(animationProgress * 100);

  return (
    <div style={{ marginBottom: "10px", background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #22314d)", borderRadius: "14px", padding: "10px 12px", color: "var(--color-text-primary, #1e293b)", boxShadow: "0 8px 20px var(--color-shadow, rgba(0,0,0,0.12))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", marginBottom: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #1D9E75)" }}>
            Cronica Offline
          </div>
          <div style={{ fontSize: "0.84rem", fontWeight: "900", marginTop: "2px", lineHeight: 1.25 }}>
            {getOfflineHeadline(summary)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px" }}>
            {animatedValue(summary.simulatedSeconds)}s resueltos offline
          </div>
        </div>
        <button onClick={onDismiss} style={{ border: "1px solid var(--color-border-primary, #22314d)", background: "var(--color-background-tertiary, #f1f5f9)", color: "var(--color-text-primary, #1e293b)", borderRadius: "999px", padding: "6px 10px", fontSize: "0.68rem", fontWeight: "900", cursor: "pointer" }}>
          Cerrar
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <span style={{ fontSize: "0.56rem", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.08em" }}>
            Resolviendo resumen
          </span>
          <span style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900" }}>
            {progressPercent}%
          </span>
        </div>
        <div style={{ width: "100%", height: "8px", borderRadius: "999px", overflow: "hidden", background: "var(--color-background-tertiary, #f1f5f9)", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
          <div style={{ width: `${progressPercent}%`, height: "100%", background: "linear-gradient(90deg, var(--tone-success, #1D9E75) 0%, var(--tone-accent, #534AB7) 100%)", transition: "width 60ms linear" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: "6px" }}>
        <OfflineMetric label="Oro" value={animatedValue(summary.goldGained)} color="var(--tone-warning, #f59e0b)" />
        <OfflineMetric label="XP" value={animatedValue(summary.xpGained)} color="var(--tone-violet, #c4b5fd)" />
        <OfflineMetric label="Esencia" value={animatedValue(summary.essenceGained)} color="var(--tone-accent, #a78bfa)" />
        <OfflineMetric label="Kills" value={animatedValue(summary.killsGained)} color="var(--tone-success, #86efac)" />
        <OfflineMetric label="Items" value={animatedValue(summary.itemsGained)} color="var(--tone-info, #67e8f9)" />
        <OfflineMetric label="Niveles" value={animatedValue(summary.levelsGained)} color="var(--tone-danger, #fca5a5)" />
      </div>

      {summary.bestDropName && (
        <div style={{ marginTop: "8px", background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "10px", padding: "8px 10px", opacity: bestDropVisible ? 1 : 0, transform: bestDropVisible ? "translateY(0)" : "translateY(6px)", transition: "opacity 220ms ease, transform 220ms ease" }}>
          <div style={{ fontSize: "0.58rem", color: "var(--tone-success, #1D9E75)", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.08em" }}>
            Mejor Drop
          </div>
          <div style={{ marginTop: "3px", fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.2 }}>
            {summary.bestDropName}
          </div>
          <div style={{ marginTop: "4px", fontSize: "0.66rem", color: getRarityColor(summary.bestDropRarity), fontWeight: "900" }}>
            {summary.bestDropRarity || "item"}{summary.bestDropHighlight?.label ? ` · ${summary.bestDropHighlight.label}` : ""}{summary.bestDropPerfectRolls ? ` · ${summary.bestDropPerfectRolls} perfect` : ""}
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderResourcePill({ label, value, color, borderColor, background, compact = false }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: compact ? "4px 8px" : "5px 9px",
        borderRadius: "999px",
        border: `1px solid ${borderColor}`,
        background,
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: compact ? "0.52rem" : "0.58rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <span style={{ fontSize: compact ? "0.72rem" : "0.78rem", fontWeight: "900", color, lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

function HeaderCompactChip({ text, color, borderColor, background }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        borderRadius: "999px",
        border: `1px solid ${borderColor}`,
        background,
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: "0.7rem", fontWeight: "900", color, lineHeight: 1, whiteSpace: "nowrap" }}>
        {text}
      </span>
    </div>
  );
}

function themeToggleButtonStyle(isMobile = false) {
  return {
    border: "1px solid var(--color-border-tertiary, #cbd5e1)",
    background: "var(--color-background-secondary, #ffffff)",
    color: "var(--color-text-primary, #1e293b)",
    borderRadius: "999px",
    width: isMobile ? "34px" : "38px",
    height: isMobile ? "34px" : "38px",
    padding: 0,
    cursor: "pointer",
    fontSize: isMobile ? "0.94rem" : "1rem",
    fontWeight: "900",
    lineHeight: 1,
    boxShadow: "0 6px 18px var(--color-shadow, rgba(15,23,42,0.08))",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function RunSigilOverlay({ isMobile, pendingRunSigilIds, onSelect, onStart, prestigeLevel, sigilSlotCount = 1 }) {
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  useEffect(() => {
    if (activeSlotIndex < sigilSlotCount) return;
    setActiveSlotIndex(0);
  }, [activeSlotIndex, sigilSlotCount]);

  const currentPendingRunSigil = getRunSigil(pendingRunSigilIds?.[activeSlotIndex] || "free");
  const currentLoadoutName = formatRunSigilLoadout(pendingRunSigilIds);
  const currentLoadoutSummary = summarizeRunSigilLoadout(pendingRunSigilIds);
  const currentLoadoutProfile = buildRunSigilLoadoutProfile(pendingRunSigilIds);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.72)", zIndex: 9000, display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center", padding: isMobile ? "0" : "24px" }}>
      <div style={{ width: "100%", maxWidth: "920px", background: "var(--color-background-secondary, #fff)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "flex", flexDirection: "column", maxHeight: "100vh", overflow: "auto" }}>
        <div style={{ padding: isMobile ? "18px 16px 12px" : "20px 22px 14px", borderBottom: "1px solid var(--color-border-primary, #e2e8f0)" }}>
          <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
            {prestigeLevel <= 1 ? "Sigilos Desbloqueados" : "Proxima Run"}
          </div>
          <div style={{ fontSize: isMobile ? "1.05rem" : "1.18rem", fontWeight: "900", marginTop: "4px" }}>
            Elegi como queres sesgar esta corrida
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45 }}>
            El sigilo queda fijo hasta el proximo prestigio. Si no queres sesgar la corrida, elegi <strong>Libre</strong>.
          </div>
          {sigilSlotCount > 1 && (
            <div style={{ fontSize: "0.72rem", color: "var(--tone-accent, #4338ca)", marginTop: "8px", fontWeight: "900" }}>
              Abismo IV activo: podes equipar 2 sigilos. No se repiten.
            </div>
          )}
        </div>

        <div style={{ padding: isMobile ? "14px 16px 0" : "16px 22px 0", display: "grid", gap: "10px" }}>
          <div style={{ border: "1px solid var(--color-border-primary, #e2e8f0)", background: "var(--color-background-tertiary, #f8fafc)", borderRadius: "14px", padding: "12px", display: "grid", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "start" }}>
              <div style={{ display: "grid", gap: "4px" }}>
                <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--tone-accent, #4338ca)" }}>
                  Loadout actual
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                  {currentLoadoutName}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {currentLoadoutSummary}
                </div>
              </div>
              <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--tone-info, #0369a1)" }}>
                Slot activo: {activeSlotIndex + 1} · {currentPendingRunSigil.shortName || currentPendingRunSigil.name}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
              <SigilProfileGroup title="Esta run premia" tone="success" items={currentLoadoutProfile.boosts} emptyLabel="Sin sesgo positivo fuerte." />
              <SigilProfileGroup title="Esta run cede" tone="danger" items={currentLoadoutProfile.tradeoffs} emptyLabel="Sin coste de oportunidad relevante." />
            </div>
          </div>
        </div>

        {sigilSlotCount > 1 && (
          <div style={{ padding: isMobile ? "12px 16px 0" : "14px 22px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {pendingRunSigilIds.map((sigilId, index) => {
              const sigil = getRunSigil(sigilId);
              const active = index === activeSlotIndex;
              return (
                <button
                  key={`sigil-slot-${index + 1}`}
                  onClick={() => setActiveSlotIndex(index)}
                  style={{
                    border: "1px solid",
                    borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #e2e8f0)",
                    background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #fff)",
                    color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #475569)",
                    borderRadius: "999px",
                    padding: "7px 11px",
                    fontSize: "0.68rem",
                    fontWeight: "900",
                    cursor: "pointer",
                  }}
                >
                  {`Slot ${index + 1}: ${sigil.shortName || sigil.name}`}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ padding: isMobile ? "14px 16px 18px" : "18px 22px 22px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
          {RUN_SIGILS.map(sigil => {
            const active = currentPendingRunSigil.id === sigil.id;
            const selectedSlots = (pendingRunSigilIds || [])
              .map((selectedId, index) => (selectedId === sigil.id ? index + 1 : null))
              .filter(Boolean);
            const sigilProfile = buildRunSigilChoiceProfile(sigil.id);
            return (
              <button
                key={sigil.id}
                onClick={() => onSelect(sigil.id, activeSlotIndex)}
                style={{
                  textAlign: "left",
                  border: "1px solid",
                  borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #e2e8f0)",
                  background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-tertiary, #f8fafc)",
                  color: "inherit",
                  borderRadius: "14px",
                  padding: "14px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: "900" }}>{sigil.name}</div>
                    <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-tertiary, #94a3b8)", marginTop: "3px" }}>
                      {sigil.focus}
                    </div>
                  </div>
                  <div style={{ display: "grid", justifyItems: "end", gap: "4px" }}>
                    {selectedSlots.length > 0 && (
                      <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)", background: "var(--tone-accent-soft, #eef2ff)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: "999px", padding: "2px 6px" }}>
                        {selectedSlots.map(slot => `S${slot}`).join(" · ")}
                      </span>
                    )}
                    <span style={{ minWidth: "18px", height: "18px", borderRadius: "999px", border: "2px solid", borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-tertiary, #cbd5e1)", background: active ? "var(--tone-accent, #4338ca)" : "transparent" }} />
                  </div>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #475569)", marginTop: "8px", lineHeight: 1.45 }}>
                  {sigil.summary}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px", marginTop: "10px" }}>
                  <SigilProfileGroup title="Premia" tone="success" items={sigilProfile.boosts} emptyLabel="Sin premio directo." compact />
                  <SigilProfileGroup title="Cede" tone="danger" items={sigilProfile.tradeoffs} emptyLabel="Sin coste visible." compact />
                </div>
                <div style={{ marginTop: "8px", padding: "8px 9px", borderRadius: "10px", background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
                  <div style={{ fontSize: "0.54rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
                    Cuando elegirlo
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #475569)", marginTop: "4px", lineHeight: 1.4, fontWeight: "800" }}>
                    {sigil.whenToPick}
                  </div>
                </div>
                <div style={{ marginTop: "10px", display: "grid", gap: "6px" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--tone-success-strong, #047857)" }}>
                    Ventajas
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {(sigil.strengths || []).map(line => (
                      <span key={`${sigil.id}-plus-${line}`} style={{ fontSize: "0.62rem", fontWeight: "800", color: "var(--tone-success-strong, #047857)", background: "var(--tone-success-soft, #ecfdf5)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: "999px", padding: "4px 7px" }}>
                        {line}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.6rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--tone-danger, #b91c1c)", marginTop: "4px" }}>
                    Coste de oportunidad
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {(sigil.tradeoffs || []).map(line => (
                      <span key={`${sigil.id}-minus-${line}`} style={{ fontSize: "0.62rem", fontWeight: "800", color: "var(--tone-danger, #b91c1c)", background: "var(--tone-danger-soft, #fff1f2)", border: "1px solid rgba(244,63,94,0.18)", borderRadius: "999px", padding: "4px 7px" }}>
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: isMobile ? "0 16px 18px" : "0 22px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: "3px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)" }}>
              Seleccion actual: <strong style={{ color: "var(--color-text-primary, #1e293b)" }}>{currentLoadoutName}</strong>
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>
              {currentLoadoutSummary}
            </div>
          </div>
          <button
            onClick={onStart}
            style={{
              border: "1px solid var(--tone-accent, #4338ca)",
              background: "var(--tone-accent, #4338ca)",
              color: "#fff",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "0.72rem",
              fontWeight: "900",
              cursor: "pointer",
            }}
          >
            Empezar corrida
          </button>
        </div>
      </div>
    </div>
  );
}

function SigilProfileGroup({ title, tone = "success", items = [], emptyLabel = "", compact = false }) {
  const palette =
    tone === "danger"
      ? {
          label: "var(--tone-danger, #b91c1c)",
          bg: "var(--tone-danger-soft, #fff1f2)",
          border: "rgba(244,63,94,0.18)",
          text: "var(--tone-danger, #b91c1c)",
        }
      : {
          label: "var(--tone-success-strong, #047857)",
          bg: "var(--tone-success-soft, #ecfdf5)",
          border: "rgba(16,185,129,0.18)",
          text: "var(--tone-success-strong, #047857)",
        };

  return (
    <div style={{ display: "grid", gap: compact ? "5px" : "6px" }}>
      <div style={{ fontSize: compact ? "0.56rem" : "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: palette.label }}>
        {title}
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {items.length > 0 ? items.map(item => (
          <span
            key={item.label}
            style={{
              fontSize: compact ? "0.58rem" : "0.62rem",
              fontWeight: "800",
              color: palette.text,
              background: palette.bg,
              border: `1px solid ${palette.border}`,
              borderRadius: "999px",
              padding: compact ? "3px 6px" : "4px 7px",
            }}
          >
            {item.label}
          </span>
        )) : (
          <span style={{ fontSize: compact ? "0.58rem" : "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>
            {emptyLabel}
          </span>
        )}
      </div>
    </div>
  );
}
