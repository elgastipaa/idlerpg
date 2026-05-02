import React, { Suspense, lazy, useState, useEffect, useRef, useCallback, useMemo } from "react";
import packageJson from "../package.json";
import { useGame } from "./hooks/useGame";
import useViewport from "./hooks/useViewport";
import OverlayShell, { OverlaySurface } from "./components/OverlayShell";
import ForgeIcon from "./components/icons/ForgeIcon";
import { FlAsset, FlBottomNav, FlButton, FlCard, FlHeaderBar, FlTabs } from "./components/ui/forge";
import { getRarityColor } from "./constants/rarity";
import { getItemAsset } from "./utils/assetRegistry";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
  formatItemStatValue as formatStatValue,
} from "./utils/itemPresentation";
import {
  buildRunSigilChoiceProfile,
  buildRunSigilLoadoutProfile,
  formatRunSigilLoadout,
  getRunSigil,
  normalizeRunSigilIds,
  RUN_SIGILS,
} from "./data/runSigils";
import { CLASSES } from "./data/classes";
import { getMaxRunSigilSlots } from "./engine/progression/abyssProgression";
import {
  getActiveExpeditionContractWithProgress,
  getExpeditionContractRerollCost,
  getExpeditionContractsWithProgress,
} from "./engine/progression/expeditionContracts";
import {
  canOpenExpedition,
  getEffectiveOnboardingStep,
  getOnboardingTabBlockMeta,
  getOnboardingRequiredTab,
  isSanctuaryLockedDuringExpeditionTutorial,
  ONBOARDING_STEPS,
  shouldShowHeroPrimaryTab,
} from "./engine/onboarding/onboardingEngine";
import { buildTesterSnapshot, copyTextToClipboard, createDebugErrorEntry, formatDebugValue } from "./utils/testerSnapshot";
import { formatHeaderResource } from "./utils/formatHeaderResource";

const Prestige = lazy(() => import("./components/Prestige"));
const HeroView = lazy(() => import("./components/HeroView"));
const ExpeditionView = lazy(() => import("./components/ExpeditionView"));
const RegistryView = lazy(() => import("./components/RegistryView"));
const Sanctuary = lazy(() => import("./components/Sanctuary"));
const Crafting = lazy(() => import("./components/Crafting"));
const OnboardingOverlay = lazy(() => import("./components/OnboardingOverlay"));
const ExtractionOverlay = lazy(() => import("./components/ExtractionOverlay"));
const ForgeLightKitDemo = lazy(() => import("./components/ForgeLightKitDemo"));

const CHUNK_RELOAD_SIGNATURE_KEY = "idlerpg:chunk-reload-signature";
const CHUNK_LOAD_ERROR_PATTERNS = [
  "failed to fetch dynamically imported module",
  "importing a module script failed",
  "loading chunk",
  "chunkloaderror",
  "chunk script load failed",
];

function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error?.message === "string") return error.message;
  try {
    return String(error);
  } catch {
    return "";
  }
}

function getChunkErrorSignature(error) {
  const message = getErrorMessage(error);
  const stack = typeof error?.stack === "string" ? error.stack : "";
  const payload = `${message}\n${stack}`;
  const absoluteUrlMatch = payload.match(/https?:\/\/[^\s)'"]+/i);
  if (absoluteUrlMatch) return absoluteUrlMatch[0];
  const assetPathMatch = payload.match(/\/assets\/[^\s)'"]+\.js/i);
  if (assetPathMatch) return assetPathMatch[0];
  return message.slice(0, 180) || "dynamic-import";
}

function isChunkLoadError(error) {
  const message = getErrorMessage(error).toLowerCase();
  if (!message) return false;
  return CHUNK_LOAD_ERROR_PATTERNS.some(pattern => message.includes(pattern));
}

function recoverFromChunkLoadError(error, source = "unknown") {
  if (typeof window === "undefined") return false;
  if (!isChunkLoadError(error)) return false;
  const signature = getChunkErrorSignature(error);
  const previousSignature = window.sessionStorage?.getItem(CHUNK_RELOAD_SIGNATURE_KEY) || "";
  if (previousSignature === signature) {
    console.error(`[chunk-reload] ${source}: already retried for ${signature}`);
    return false;
  }
  window.sessionStorage?.setItem(CHUNK_RELOAD_SIGNATURE_KEY, signature);
  console.warn(`[chunk-reload] ${source}: hard reload for ${signature}`);
  window.location.reload();
  return true;
}

class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (recoverFromChunkLoadError(error, `tab:${this.props.label || "tab"}`)) return;
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
        <div {...{ style: { padding: "18px", minHeight: "220px", display: "grid", gap: "8px", alignContent: "start" } }}>
          <div {...{ style: { fontSize: "0.72rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" } }}>
            Error de Tab
          </div>
          <div {...{ style: { fontSize: "0.95rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
            {this.props.label || "Esta pantalla"} no se pudo renderizar.
          </div>
          <div {...{ style: { fontSize: "0.72rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 } }}>
            Cambia de tab y volve a entrar. Si persiste, el error ya queda logueado en consola para rastrearlo sin dejar la app en blanco.
          </div>
          {typeof this.props.onRecover === "function" && (
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onRecover();
              }}
              {...{ style: {
                width: "fit-content",
                border: "1px solid var(--color-border-primary, #e2e8f0)",
                background: "var(--color-background-secondary, #ffffff)",
                color: "var(--color-text-primary, #1e293b)",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.72rem",
                fontWeight: "900",
                cursor: "pointer",
              } }}
            >
              {this.props.recoverLabel || "Recuperar"}
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            {...{ style: {
              width: "fit-content",
              border: "1px solid var(--color-border-primary, #e2e8f0)",
              background: "var(--color-background-secondary, #ffffff)",
              color: "var(--color-text-primary, #1e293b)",
              borderRadius: "10px",
              padding: "8px 12px",
              fontSize: "0.72rem",
              fontWeight: "900",
              cursor: "pointer",
            } }}
          >
            Recargar cliente
          </button>
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

  if (text.startsWith("LOGRO:")) {
    return {
      tone: "success",
      label: text.replace("LOGRO:", "Logro ·"),
    };
  }

  if (text.startsWith("HITO DE ABISMO:")) {
    return {
      tone: "success",
      label: text.replace("HITO DE ABISMO:", "Hito de Abismo ·"),
    };
  }

  if (text.startsWith("CODEX:")) {
    return {
      tone: "success",
      label: text.replace("CODEX:", "Codex ·"),
    };
  }

  if (text.startsWith("LEDGER:")) {
    const label = text.replace("LEDGER:", "Ledger ·");
    const tone = /reclamad|listo para reclamar|complet/i.test(label) ? "success" : "info";
    return {
      tone,
      label,
    };
  }

  if (text.startsWith("CONTRATO:")) {
    const label = text.replace("CONTRATO:", "Contrato ·");
    const tone = /reclamad|listo para reclamar|complet/i.test(label) ? "success" : "info";
    return {
      tone,
      label,
    };
  }

  if (text.startsWith("Seguridad:")) {
    return {
      tone: "warning",
      label: text.replace("Seguridad:", "Accion bloqueada ·"),
    };
  }

  if (text.startsWith("EXTRACCION:")) {
    const label = text.replace("EXTRACCION:", "").trim();
    const tone = /fall|bloque|pierde|riesgo|cancel/i.test(label) ? "warning" : "info";
    return { tone, label: `Extraccion · ${label}` };
  }

  if (!text.startsWith("SANTUARIO:")) {
    if (/bloquead|fallid|sin recuperacion|pierde/i.test(text)) {
      return { tone: "warning", label: text };
    }
    if (/desbloque|completa|reclama|listo para/i.test(text)) {
      return { tone: "success", label: text };
    }
    return null;
  }

  const label = text.replace("SANTUARIO:", "").trim();
  let tone = "info";
  if (/reclamad|vuelve|completa|convierte|desguaza|alcanza|desbloque/i.test(label)) {
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

function getForgeLightV2Screen(primaryTab = "sanctuary", tab = "sanctuary") {
  if (primaryTab === "combat") {
    if (tab === "inventory" || tab === "crafting" || tab === "codex") return tab;
    return "combat";
  }
  if (primaryTab === "character") {
    if (tab === "skills" || tab === "talents") return tab;
    return "character";
  }
  if (primaryTab === "registry") {
    if (tab === "stats" || tab === "account" || tab === "achievements" || tab === "system") return tab;
    return "account";
  }
  if (primaryTab === "prestige") return "prestige";
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
    return ["combat", "inventory", "crafting", "codex"].some(tab =>
      !getOnboardingTabBlockMeta(onboardingStep, tab, state).blocked
    );
  }
  if (primaryTab === "character") {
    return ["character", "skills", "talents"].some(tab =>
      !getOnboardingTabBlockMeta(onboardingStep, tab, state).blocked
    );
  }
  return !getOnboardingTabBlockMeta(
    onboardingStep,
    getDefaultTabForPrimaryTab(primaryTab),
    state
  ).blocked;
}

const PRIMARY_TAB_CONFIG = {
  sanctuary:    { label: "Santuario", icon: "sanctuary" },
  character:    { label: "Heroe", icon: "hero" },
  combat:       { label: "Expedicion", icon: "combat" },
  prestige:     { label: "Ecos", icon: "echoes" },
  registry:     { label: "Mas", icon: "more" },
};
const PRIMARY_TAB_COMPONENTS = {
  sanctuary: Sanctuary,
  character: HeroView,
  combat: ExpeditionView,
  prestige: Prestige,
  registry: RegistryView,
};
// Visual-only Stitch shell trial. Flip to false to restore the previous App shell.
const APP_STITCH_VISUAL_TRIAL = false;
// Keeps the global shell skin lightweight: no blur, masks, or continuous animations.
const APP_STITCH_PERF_SAFE = true;
const FORGE_LIGHT_V2_ACTIVE = true;

const APP_VERSION = packageJson?.version || "0.0.0";
const DEBUG_TRIPLE_CLICK_WINDOW_MS = 750;
const MAX_RECENT_ERROR_ENTRIES = 20;

function PrimaryTabIcon({ id, active = false, size = 20 }) {
  const config = PRIMARY_TAB_CONFIG[id] || PRIMARY_TAB_CONFIG.registry;
  return (
    <span
      className={[
        "fl-primary-tab-icon",
        size >= 24 ? "fl-primary-tab-icon--lg" : "",
        active ? "fl-primary-tab-icon--active" : "",
      ].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {config.icon === "more" ? (
        <ForgeIcon name="more" size={size} />
      ) : (
        <FlAsset
          className="fl-primary-tab-asset"
          kind="system"
          assetId={config.icon}
          size="sm"
          fallbackIcon={config.icon}
          alt=""
        />
      )}
    </span>
  );
}

function getHeaderHeroName(player = {}) {
  return player?.name || player?.class || "Heroe";
}

function getHeaderHeroPower(player = {}) {
  const explicit = Number(player?.power || player?.combatPower || player?.rating || 0);
  const equipmentRating = Number(player?.equipment?.weapon?.rating || 0) + Number(player?.equipment?.armor?.rating || 0);
  return Math.max(0, Math.round(explicit || equipmentRating || 0));
}

function buildReforgeOptionKey(option = {}, index = 0) {
  return `${option?.id || "opt"}::${option?.stat || "stat"}::${option?.quality || "normal"}::${option?.rolledValue ?? option?.value ?? 0}::${index}`;
}

function findPlayerItemById(player = {}, itemId = null) {
  if (!itemId) return null;
  const inventory = Array.isArray(player?.inventory) ? player.inventory : [];
  const inventoryMatch = inventory.find(item => item?.id === itemId);
  if (inventoryMatch) return inventoryMatch;
  if (player?.equipment?.weapon?.id === itemId) return player.equipment.weapon;
  if (player?.equipment?.armor?.id === itemId) return player.equipment.armor;
  return null;
}

const AppHeader = React.memo(function AppHeader({
  currentPrimaryLabel,
  reforgeLocked,
  onHeaderDebugTap,
  resources,
  onToggleTheme,
  player,
}) {
  const heroName = getHeaderHeroName(player);
  const heroLevel = Math.max(1, Number(player?.level || 1));
  const heroPower = getHeaderHeroPower(player);
  const heroClass = player?.class || "warrior";
  const heroClassLabel = player?.specialization || "Libre";

  return (
    <FlHeaderBar
      className="app-header-shell"
      hero={{ name: heroName, level: heroLevel, class: heroClass }}
      resources={resources}
      status={heroClassLabel}
      activeContext={`${currentPrimaryLabel || "Santuario"} · ${formatHeaderResource(heroPower)} poder`}
      badge={reforgeLocked ? "Reforja" : ""}
      menuAction={{ onClick: onToggleTheme, ariaLabel: "Cambiar tema", icon: "grid" }}
      onHeroClick={onHeaderDebugTap}
    />
  );
});

const DesktopPrimaryTabs = React.memo(function DesktopPrimaryTabs({
  entries,
  onTabPress,
}) {
  const items = entries.map(entry => {
    let badge = null;
    let badgeTone = "danger";
    if (entry.showSanctuaryBadge) {
      badge = entry.sanctuaryBadgeValue;
      badgeTone = "warning";
    } else if (entry.showInventoryBadge) {
      badge = entry.inventoryBadgeValue;
      badgeTone = "success";
    } else if (entry.showTalentBadge) {
      badge = entry.talentBadgeValue;
      badgeTone = "danger";
    }

    return {
      id: entry.id,
      label: PRIMARY_TAB_CONFIG[entry.id].label,
      icon: <PrimaryTabIcon id={entry.id} active={entry.isActive} size={19} />,
      disabled: entry.hardDisabled,
      onboardingTarget: entry.onboardingTarget,
      badge,
      badgeTone,
      className: [
        entry.hasSpotlight ? "app-primary-tab-button--spotlight" : "",
        entry.blockedByOnboarding ? "app-primary-tab-button--blocked" : "",
      ].filter(Boolean).join(" "),
    };
  });

  return (
    <div className="app-desktop-primary-tabs">
      <FlTabs
        className="app-desktop-primary-tabs__nav"
        items={items}
        activeId={entries.find(entry => entry.isActive)?.id}
        variant="forge"
        scrollable={false}
        fullWidth
        ariaLabel="Secciones principales"
        onChange={onTabPress}
      />
    </div>
  );
});

const MobilePrimaryTabs = React.memo(function MobilePrimaryTabs({
  entries,
  onTabPress,
}) {
  const activeEntry = entries.find(entry => entry.isActive);
  const items = entries.map(entry => {
    const config = PRIMARY_TAB_CONFIG[entry.id] || {};
    let badge = null;
    let badgeTone = "danger";
    if (entry.showSanctuaryBadge) {
      badge = entry.sanctuaryBadgeValue;
      badgeTone = "warning";
    } else if (entry.showInventoryBadge) {
      badge = entry.inventoryBadgeValue;
      badgeTone = "success";
    } else if (entry.showTalentBadge) {
      badge = entry.talentBadgeValue;
      badgeTone = "danger";
    }

    return {
      id: entry.id,
      label: config.label || entry.id,
      icon: <PrimaryTabIcon id={entry.id} active={entry.isActive} size={25} />,
      active: entry.isActive,
      disabled: entry.hardDisabled,
      locked: entry.blockedByOnboarding,
      hasSpotlight: entry.hasSpotlight,
      onboardingTarget: entry.onboardingTarget,
      badge,
      badgeTone,
    };
  });

  return (
    <FlBottomNav
      className="app-mobile-primary-tabs"
      items={items}
      activeId={activeEntry?.id}
      variant="icon-label"
      fixed
      safeArea
      onChange={onTabPress}
    />
  );
});

const PrimaryTabPane = React.memo(
  function PrimaryTabPane({ component: Component, tabState, dispatch }) {
    return <Component state={tabState} dispatch={dispatch} />;
  },
  (prevProps, nextProps) =>
    prevProps.component === nextProps.component &&
    prevProps.tabState === nextProps.tabState &&
    prevProps.dispatch === nextProps.dispatch
);

const PrimaryTabViewport = React.memo(
  function PrimaryTabViewport({
    currentPrimaryLabel,
    recoverToTab,
    component,
    tabState,
    dispatch,
  }) {
    return (
      <main className="app-primary-viewport">
        <TabErrorBoundary
          label={currentPrimaryLabel}
          recoverLabel={recoverToTab === "combat" ? "Ir a Expedicion" : "Ir al Santuario"}
          onRecover={() => dispatch({ type: "SET_TAB", tab: recoverToTab })}
        >
          <Suspense fallback={<TabLoadingCard label={currentPrimaryLabel} />}>
            <PrimaryTabPane component={component} tabState={tabState} dispatch={dispatch} />
          </Suspense>
        </TabErrorBoundary>
      </main>
    );
  },
  (prevProps, nextProps) =>
    prevProps.currentPrimaryLabel === nextProps.currentPrimaryLabel &&
    prevProps.recoverToTab === nextProps.recoverToTab &&
    prevProps.component === nextProps.component &&
    prevProps.tabState === nextProps.tabState &&
    prevProps.dispatch === nextProps.dispatch
);

function GameApp({ forceForgeLightCombatTrial = false }) {
  const { state, dispatch, getRecentActions } = useGame();
  const { isMobile } = useViewport();
  const [showLegacySavePrompt, setShowLegacySavePrompt] = useState(false);
  const [testerToast, setTesterToast] = useState(null);
  const [actionToast, setActionToast] = useState(null);
  const contentRef = useRef(null);
  const prevTabRef = useRef(null);
  const recentErrorLogRef = useRef([]);
  const headerTapTimesRef = useRef([]);
  const previousCombatLogRef = useRef(null);
  const directCraftingOpenRef = useRef(false);
  const directCraftingRequested =
    typeof window !== "undefined" &&
    (
      ["#crafting", "#forja", "#forge"].includes(window.location.hash.toLowerCase()) ||
      ["crafting"].includes((new URLSearchParams(window.location.search).get("open") || "").toLowerCase()) ||
      ["crafting"].includes((new URLSearchParams(window.location.search).get("screen") || "").toLowerCase())
    );
  const offlineSummary = state.combat?.offlineSummary;
  const talentPoints = Math.max(0, Number(state.player?.talentPoints || 0));
  const hasTalentPoints = talentPoints > 0;
  const reforgeLocked = !!state.combat?.reforgeSession;
  const inventoryUpgrades = useMemo(
    () =>
      (state.player?.inventory || []).filter(item => {
        const compare = item.type === "weapon" ? state.player?.equipment?.weapon : state.player?.equipment?.armor;
        return (item?.rating || 0) > (compare?.rating || 0);
      }).length,
    [state.player?.equipment?.armor, state.player?.equipment?.weapon, state.player?.inventory]
  );
  const sanctuaryPendingActions = useMemo(
    () => {
      const claimableJobs = Array.isArray(state?.sanctuary?.jobs)
        ? state.sanctuary.jobs.filter(job => job?.status === "claimable").length
        : 0;
      const extractionPending = state?.expedition?.phase === "extraction" ? 1 : 0;
      return claimableJobs + extractionPending;
    },
    [state?.expedition?.phase, state?.sanctuary?.jobs]
  );
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
    const handleUnhandledRejection = event => {
      if (recoverFromChunkLoadError(event?.reason, "unhandledrejection")) {
        if (typeof event?.preventDefault === "function") event.preventDefault();
      }
    };
    const handleWindowError = event => {
      const targetSrc = event?.target?.src;
      if (typeof targetSrc === "string" && /\/assets\/.+\.js($|\?)/i.test(targetSrc)) {
        recoverFromChunkLoadError(new Error(`Chunk script load failed: ${targetSrc}`), "window.error");
      }
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError, true);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError, true);
    };
  }, []);

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
      @keyframes appActionToastPulseSuccess {
        0% { transform: translateX(-50%) scale(0.98); box-shadow: 0 10px 22px rgba(15,23,42,0.08); }
        50% { transform: translateX(-50%) scale(1); box-shadow: 0 14px 30px rgba(16,185,129,0.18); }
        100% { transform: translateX(-50%) scale(1); box-shadow: 0 12px 24px rgba(15,23,42,0.12); }
      }
      @keyframes appActionToastPulseWarning {
        0% { transform: translateX(-50%) scale(0.98); box-shadow: 0 10px 22px rgba(15,23,42,0.08); }
        50% { transform: translateX(-50%) scale(1.01); box-shadow: 0 14px 30px rgba(245,158,11,0.22); }
        100% { transform: translateX(-50%) scale(1); box-shadow: 0 12px 24px rgba(15,23,42,0.12); }
      }
    `;
    document.head.appendChild(style);
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

  const HEADER_HEIGHT_MOBILE = 48;
  const HEADER_HEIGHT_DESKTOP = 54;
  const NAV_HEIGHT_MOBILE = 72;
  const DESKTOP_MAX_WIDTH = 1180;
  const onboardingStep = state?.onboarding?.step || null;
  const onboardingTabState = useMemo(
    () => ({
      onboarding: state?.onboarding,
      player: { class: state?.player?.class },
      expedition: { phase: state?.expedition?.phase },
      currentTab: state?.currentTab,
      sanctuary: {
        jobs: state?.sanctuary?.jobs,
        stations: { distillery: { unlocked: state?.sanctuary?.stations?.distillery?.unlocked } },
      },
      __liveNow: state?.__liveNow,
    }),
    [
      state?.__liveNow,
      state?.currentTab,
      state?.expedition?.phase,
      state?.onboarding,
      state?.player?.class,
      state?.sanctuary?.jobs,
      state?.sanctuary?.stations?.distillery?.unlocked,
    ]
  );
  const onboardingEvaluationState = onboardingStep ? onboardingTabState : null;
  const effectiveOnboardingStep = useMemo(
    () => getEffectiveOnboardingStep(onboardingStep, onboardingEvaluationState || {}),
    [onboardingEvaluationState, onboardingStep]
  );
  const currentTab = forceForgeLightCombatTrial ? "combat" : state.currentTab;
  const currentPrimaryTab = getVisiblePrimaryTab(currentTab, state);
  const prestigeTabUnlocked = isPrestigeTabUnlocked(state);
  const expeditionUnlocked = canOpenExpedition(state);
  const showHeroPrimaryTab = shouldShowHeroPrimaryTab(state);
  const visiblePrimaryTabs = useMemo(
    () => ["sanctuary", "combat", ...(showHeroPrimaryTab ? ["character"] : []), ...(prestigeTabUnlocked ? ["prestige"] : []), "registry"],
    [prestigeTabUnlocked, showHeroPrimaryTab]
  );
  const sanctuaryOnboardingScrollLocked = [
    ONBOARDING_STEPS.OPEN_LABORATORY,
    ONBOARDING_STEPS.RESEARCH_DISTILLERY,
    ONBOARDING_STEPS.DISTILLERY_READY,
    ONBOARDING_STEPS.OPEN_DISTILLERY,
    ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
  ].includes(onboardingStep);
  const sanctuaryPrimaryBlocked = useMemo(
    () => {
      if (!onboardingEvaluationState) return false;
      return !isPrimaryTabAllowed("sanctuary", onboardingStep, onboardingEvaluationState);
    },
    [
      onboardingEvaluationState,
      onboardingStep,
    ]
  );
  const onboardingPrimaryBlockedMap = useMemo(() => {
    if (!onboardingEvaluationState) return null;
    const blockedByTab = {};
    visiblePrimaryTabs.forEach(tabId => {
      blockedByTab[tabId] = !isPrimaryTabAllowed(tabId, onboardingStep, onboardingEvaluationState);
    });
    return blockedByTab;
  }, [onboardingEvaluationState, onboardingStep, visiblePrimaryTabs]);
  const primaryTabEntries = useMemo(
    () =>
      visiblePrimaryTabs.map(tabId => {
        const isActive = currentPrimaryTab === tabId;
        const blockedByOnboarding = onboardingPrimaryBlockedMap
          ? Boolean(onboardingPrimaryBlockedMap[tabId])
          : tabId === "sanctuary"
            ? sanctuaryPrimaryBlocked
            : false;
        const hardDisabled =
          (reforgeLocked && !isActive) ||
          (tabId === "combat" && !expeditionUnlocked);
        const spotlightHeroPrimary =
          (onboardingStep === ONBOARDING_STEPS.OPEN_HERO || effectiveOnboardingStep === ONBOARDING_STEPS.OPEN_HERO) &&
          tabId === "character";
        const spotlightPrestigePrimary =
          (onboardingStep === ONBOARDING_STEPS.FIRST_ECHOES || effectiveOnboardingStep === ONBOARDING_STEPS.FIRST_ECHOES) &&
          tabId === "prestige";
        const spotlightSanctuaryPrimary =
          (onboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY || effectiveOnboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY) &&
          tabId === "sanctuary";
        const hasSpotlight = spotlightHeroPrimary || spotlightPrestigePrimary || spotlightSanctuaryPrimary;
        const onboardingTarget = spotlightSanctuaryPrimary
          ? "primary-sanctuary-tab"
          : spotlightHeroPrimary
            ? "primary-hero-tab"
            : spotlightPrestigePrimary
              ? "primary-prestige-tab"
              : undefined;
        return {
          id: tabId,
          isActive,
          blockedByOnboarding,
          hardDisabled,
          hasSpotlight,
          onboardingTarget,
          showInventoryBadge: tabId === "combat" && inventoryUpgrades > 0,
          inventoryBadgeValue: inventoryUpgrades > 9 ? "9+" : String(inventoryUpgrades),
          showTalentBadge: tabId === "character" && hasTalentPoints,
          talentBadgeValue: String(talentPoints),
          showSanctuaryBadge: tabId === "sanctuary" && sanctuaryPendingActions > 0,
          sanctuaryBadgeValue: sanctuaryPendingActions > 9 ? "9+" : String(sanctuaryPendingActions),
        };
      }),
    [
      currentPrimaryTab,
      effectiveOnboardingStep,
      expeditionUnlocked,
      hasTalentPoints,
      inventoryUpgrades,
      onboardingPrimaryBlockedMap,
      onboardingStep,
      reforgeLocked,
      sanctuaryPendingActions,
      sanctuaryPrimaryBlocked,
      talentPoints,
      visiblePrimaryTabs,
    ]
  );

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

  const scrollAppToTop = useCallback((behavior = "auto") => {
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
  }, []);

  const scrollAppToTopSoon = useCallback((behavior = "auto") => {
    scrollAppToTop(behavior);
    window.requestAnimationFrame(() => {
      scrollAppToTop(behavior);
      window.requestAnimationFrame(() => {
        scrollAppToTop(behavior);
      });
    });
  }, [scrollAppToTop]);

  useEffect(() => {
    if (prevTabRef.current !== state.currentTab) {
      scrollAppToTopSoon();
      prevTabRef.current = state.currentTab;
    }
  }, [scrollAppToTopSoon, state.currentTab]);

  useEffect(() => {
    if (!forceForgeLightCombatTrial || state.currentTab === "combat") return;
    dispatch({ type: "SET_TAB", tab: "combat" });
  }, [dispatch, forceForgeLightCombatTrial, state.currentTab]);

  useEffect(() => {
    if (directCraftingOpenRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    const requestedEntry = (params.get("open") || params.get("screen") || params.get("captureScreen") || "").toLowerCase();
    const shouldOpenCrafting = hash === "#crafting" || hash === "#forja" || hash === "#forge" || requestedEntry === "crafting";
    if (!shouldOpenCrafting) return;
    directCraftingOpenRef.current = true;
    dispatch({ type: "OPEN_SANCTUARY_FORGE", meta: { replay: false, forceDirectEntry: true } });
  }, [dispatch]);

  useEffect(() => {
    if (!shouldOfferLegacyRepair) {
      setShowLegacySavePrompt(false);
      return;
    }
    setShowLegacySavePrompt(true);
  }, [shouldOfferLegacyRepair]);

  const getPrimaryTabDestination = useCallback((tab) => {
    const requiredOnboardingTab = getOnboardingRequiredTab(onboardingStep);
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
  }, [onboardingStep]);

  const handlePrimaryTabPress = useCallback((tab) => {
    const destinationTab = getPrimaryTabDestination(tab);
    const isActive = currentPrimaryTab === tab;
    if (isActive) {
      if (tab === "sanctuary" && sanctuaryOnboardingScrollLocked) {
        return;
      }
      if (state.expedition?.phase === "extraction") {
        dispatch({ type: "SET_TAB", tab: destinationTab });
        return;
      }
      window.dispatchEvent(new CustomEvent("primary-tab-reselected", { detail: { tab } }));
      if (currentTab !== destinationTab) {
        dispatch({ type: "SET_TAB", tab: destinationTab });
      } else {
        scrollAppToTopSoon("smooth");
      }
      return;
    }
    if (!isPrimaryTabAllowed(tab, onboardingStep, onboardingEvaluationState || {})) {
      const tabBlockMeta = getOnboardingTabBlockMeta(
        onboardingStep,
        destinationTab,
        onboardingEvaluationState || {}
      );
      const requiredTab = tabBlockMeta.requiredTab || getOnboardingRequiredTab(onboardingStep);
      const requiredPrimary = requiredTab
        ? getPrimaryTab(requiredTab)
        : null;
      const requiredLabel = requiredPrimary
        ? PRIMARY_TAB_CONFIG[requiredPrimary]?.label || "la seccion requerida"
        : "la seccion requerida";
      setActionToast({
        id: `action-toast-${Date.now()}`,
        tone: "warning",
        label: tabBlockMeta.message || `Completa este paso primero en ${requiredLabel}.`,
      });
      return;
    }
    if (tab === "combat" && !expeditionUnlocked) {
      setActionToast({
        id: `action-toast-${Date.now()}`,
        tone: "info",
        label: "Primero inicia una expedicion desde Santuario.",
      });
      dispatch({ type: "SET_TAB", tab: "sanctuary" });
      return;
    }
    dispatch({ type: "SET_TAB", tab: destinationTab });
  }, [
    currentTab,
    currentPrimaryTab,
    dispatch,
    expeditionUnlocked,
    getPrimaryTabDestination,
    onboardingEvaluationState,
    onboardingStep,
    sanctuaryOnboardingScrollLocked,
    state.expedition?.phase,
    scrollAppToTopSoon,
  ]);
  const headerResources = useMemo(() => [
    ...(showActiveRunSigil ? [{
      id: "run-sigil",
      glyph: "⛊",
      label: "",
      ariaLabel: "Sigilo activo",
      value: activeRunSigilLabel,
      tone: "arcane",
    }] : []),
    {
      id: "gold",
      type: "gold",
      glyph: "🪙",
      label: "",
      ariaLabel: "Oro",
      value: formatHeaderResource(state.player?.gold || 0),
      tone: "gold",
      showPlus: true,
    },
    {
      id: "essence",
      type: "essence",
      glyph: "💎",
      label: "",
      ariaLabel: "Esencia",
      value: formatHeaderResource(state.player?.essence || 0),
      tone: "arcane",
      showPlus: true,
    },
  ], [activeRunSigilLabel, showActiveRunSigil, state.player?.essence, state.player?.gold]);
  const handleThemeToggle = useCallback(() => {
    dispatch({ type: "TOGGLE_THEME" });
  }, [dispatch]);
  const sanctuaryPrimaryState = useMemo(
    () => ({
      currentTab,
      player: state.player,
      sanctuary: state.sanctuary,
      onboarding: state.onboarding,
      expedition: state.expedition,
      combat: {
        pendingRunSetup: state.combat?.pendingRunSetup || false,
        maxTier: state.combat?.maxTier || 1,
        analytics: state.combat?.analytics || {},
        prestigeCycle: state.combat?.prestigeCycle || null,
      },
      prestige: state.prestige,
      abyss: state.abyss,
      __liveNow: state.__liveNow,
    }),
    [
      currentTab,
      state.__liveNow,
      state.abyss,
      state.combat?.analytics,
      state.combat?.maxTier,
      state.combat?.pendingRunSetup,
      state.combat?.prestigeCycle,
      state.expedition,
      state.onboarding,
      state.player,
      state.prestige,
      state.sanctuary,
    ]
  );
  const characterPrimaryState = useMemo(
    () => ({
      currentTab,
      player: state.player,
      onboarding: state.onboarding,
      stats: state.stats,
      combat: {
        reforgeSession: state.combat?.reforgeSession || null,
      },
    }),
    [
      currentTab,
      state.combat?.reforgeSession,
      state.onboarding,
      state.player,
      state.stats,
    ]
  );
  const expeditionPrimaryState = useMemo(
    () => ({
      currentTab,
      player: state.player,
      stats: state.stats,
      combat: state.combat,
      onboarding: state.onboarding,
      settings: state.settings,
      codex: state.codex,
      abyss: state.abyss,
      sanctuary: state.sanctuary,
      expeditionContracts: state.expeditionContracts,
      weeklyLedger: state.weeklyLedger,
      weeklyBoss: state.weeklyBoss,
      expedition: state.expedition,
      __liveNow: state.__liveNow,
      forgeLightCombatTrial: forceForgeLightCombatTrial,
    }),
    [
      currentTab,
      forceForgeLightCombatTrial,
      state.__liveNow,
      state.abyss,
      state.codex,
      state.combat,
      state.expedition,
      state.expeditionContracts,
      state.onboarding,
      state.player,
      state.stats,
      state.sanctuary,
      state.settings,
      state.weeklyBoss,
      state.weeklyLedger,
    ]
  );
  const prestigePrimaryState = useMemo(
    () => ({
      player: state.player,
      prestige: state.prestige,
      onboarding: state.onboarding,
      abyss: state.abyss,
      combat: {
        currentTier: state.combat?.currentTier || 1,
        maxTier: state.combat?.maxTier || 1,
        prestigeCycle: state.combat?.prestigeCycle || null,
        activeRunSigilId: state.combat?.activeRunSigilId || "free",
        activeRunSigilIds: state.combat?.activeRunSigilIds || [state.combat?.activeRunSigilId || "free"],
      },
    }),
    [
      state.abyss,
      state.combat?.activeRunSigilId,
      state.combat?.activeRunSigilIds,
      state.combat?.currentTier,
      state.combat?.maxTier,
      state.combat?.prestigeCycle,
      state.onboarding,
      state.player,
      state.prestige,
    ]
  );
  const registryPrimaryState = useMemo(
    () => ({
      currentTab,
      player: state.player,
      onboarding: state.onboarding,
      expedition: state.expedition,
      settings: state.settings,
      achievements: state.achievements,
      replay: state.replay,
      replayLibrary: state.replayLibrary,
      codex: state.codex,
      sanctuary: state.sanctuary,
      prestige: state.prestige,
      abyss: state.abyss,
      appearanceProfile: state.appearanceProfile,
      weeklyLedger: state.weeklyLedger,
      accountTelemetry: state.accountTelemetry,
      saveDiagnostics: state.saveDiagnostics,
      goals: state.goals,
      stats: state.stats,
      savedAt: state.savedAt,
      __liveNow: state.__liveNow,
      combat: {
        currentTier: state.combat?.currentTier || 1,
        maxTier: state.combat?.maxTier || 1,
        ticksInCurrentRun: state.combat?.ticksInCurrentRun || 0,
        runStats: state.combat?.runStats || {},
        performanceSnapshot: state.combat?.performanceSnapshot || {},
        analytics: state.combat?.analytics || {},
        lastRunSummary: state.combat?.lastRunSummary || null,
        reforgeSession: state.combat?.reforgeSession || null,
      },
    }),
    [
      currentTab,
      state.__liveNow,
      state.abyss,
      state.accountTelemetry,
      state.achievements,
      state.appearanceProfile,
      state.codex,
      state.combat?.analytics,
      state.combat?.currentTier,
      state.combat?.lastRunSummary,
      state.combat?.maxTier,
      state.combat?.performanceSnapshot,
      state.combat?.reforgeSession,
      state.combat?.runStats,
      state.combat?.ticksInCurrentRun,
      state.expedition,
      state.goals,
      state.onboarding,
      state.player,
      state.prestige,
      state.replay,
      state.replayLibrary,
      state.sanctuary,
      state.saveDiagnostics,
      state.savedAt,
      state.settings,
      state.stats,
      state.weeklyLedger,
    ]
  );
  const activePrimaryTabState = useMemo(() => {
    if (currentPrimaryTab === "sanctuary") return sanctuaryPrimaryState;
    if (currentPrimaryTab === "character") return characterPrimaryState;
    if (currentPrimaryTab === "combat") return expeditionPrimaryState;
    if (currentPrimaryTab === "prestige") return prestigePrimaryState;
    return registryPrimaryState;
  }, [
    characterPrimaryState,
    currentPrimaryTab,
    expeditionPrimaryState,
    prestigePrimaryState,
    registryPrimaryState,
    sanctuaryPrimaryState,
  ]);
  const currentPrimaryLabel = PRIMARY_TAB_CONFIG[currentPrimaryTab].label;
  const recoverToTab = ["active", "setup"].includes(state.expedition?.phase || "sanctuary")
    ? "combat"
    : "sanctuary";
  const ActivePrimaryTabComponent = PRIMARY_TAB_COMPONENTS[currentPrimaryTab] || Sanctuary;
  const forgeExpeditionShellActive = currentPrimaryTab === "combat";
  const forgeCombatShellActive = currentPrimaryTab === "combat" && currentTab === "combat";
  const forgeTalentsShellActive = currentPrimaryTab === "character" && currentTab === "talents";
  const forgeCharacterShellActive = currentPrimaryTab === "character";
  const forgePrestigeShellActive = currentPrimaryTab === "prestige";
  const forgeLightV2Screen = getForgeLightV2Screen(currentPrimaryTab, currentTab);
  const appShellRootClassName = [
    "app-shell-root",
    forgeExpeditionShellActive ? "app-shell-root--forge-expedition" : "",
    forgeCombatShellActive ? "app-shell-root--forge-combat" : "",
    forgeCharacterShellActive ? "app-shell-root--forge-character" : "",
    forgePrestigeShellActive ? "app-shell-root--forge-prestige" : "",
    forgeTalentsShellActive ? "app-shell-root--forge-talents" : "",
    forceForgeLightCombatTrial ? "app-shell-root--forge-light-prueba" : "",
    FORGE_LIGHT_V2_ACTIVE ? "app-shell-root--forge-light-v2" : "",
    APP_STITCH_VISUAL_TRIAL ? "app-shell-root--stitch-trial" : "",
    APP_STITCH_VISUAL_TRIAL && APP_STITCH_PERF_SAFE ? "app-shell-root--stitch-perf-safe" : "",
  ].filter(Boolean).join(" ");

  useEffect(() => {
    const shouldLockTalentsScroll = isMobile && forgeTalentsShellActive;
    document.documentElement.classList.toggle("app-forge-talents-scroll-lock", shouldLockTalentsScroll);
    document.body.classList.toggle("app-forge-talents-scroll-lock", shouldLockTalentsScroll);

    return () => {
      document.documentElement.classList.remove("app-forge-talents-scroll-lock");
      document.body.classList.remove("app-forge-talents-scroll-lock");
    };
  }, [forgeTalentsShellActive, isMobile]);

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
    <div className={appShellRootClassName} data-fl-screen={FORGE_LIGHT_V2_ACTIVE ? forgeLightV2Screen : undefined}>
      <AppHeader
        isMobile={isMobile}
        currentPrimaryLabel={currentPrimaryLabel}
        reforgeLocked={reforgeLocked}
        onHeaderDebugTap={handleHeaderDebugTap}
        resources={headerResources}
        onToggleTheme={handleThemeToggle}
        player={state.player}
      />

      <div ref={contentRef} className="app-shell-content" {...{ style: { "--app-content-max-width": `${DESKTOP_MAX_WIDTH}px` } }}>
        {!isMobile && <DesktopPrimaryTabs entries={primaryTabEntries} onTabPress={handlePrimaryTabPress} />}
        {offlineSummary && (
          <OfflineSummaryPanel
            summary={offlineSummary}
            isMobile={isMobile}
            onDismiss={() => dispatch({ type: "DISMISS_OFFLINE_SUMMARY" })}
          />
        )}

        {directCraftingRequested ? (
          <Suspense fallback={<div className="subview-loading-card">Cargando Forja...</div>}>
            <Crafting
              state={state}
              dispatch={dispatch}
              onClose={() => {
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
                dispatch({ type: "SET_TAB", tab: "sanctuary", meta: { replay: false } });
              }}
            />
          </Suspense>
        ) : (
          <PrimaryTabViewport
            currentPrimaryLabel={currentPrimaryLabel}
            recoverToTab={recoverToTab}
            component={ActivePrimaryTabComponent}
            tabState={activePrimaryTabState}
            dispatch={dispatch}
          />
        )}
      </div>

      {state.combat?.pendingRunSetup && (
        <RunSigilOverlay
          isMobile={isMobile}
          state={state}
          pendingRunSigilIds={pendingRunSigilIds}
          onSelectClass={classId => dispatch({ type: "SELECT_CLASS", classId })}
          onSelect={(sigilId, slotIndex) => dispatch({ type: "SELECT_RUN_SIGIL", sigilId, slotIndex })}
          onSelectContract={contractId => dispatch({ type: "SELECT_EXPEDITION_CONTRACT", contractId, now: Date.now() })}
          onRerollContracts={() => dispatch({ type: "REROLL_EXPEDITION_CONTRACTS", now: Date.now() })}
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

      <ReforgeDecisionOverlay
        state={state}
        dispatch={dispatch}
        isMobile={isMobile}
      />

      {!forceForgeLightCombatTrial && (
        <Suspense fallback={null}>
          <OnboardingOverlay state={state} dispatch={dispatch} isMobile={isMobile} />
        </Suspense>
      )}

      {showLegacySavePrompt && (
        <div
          {...{ style: {
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.58)",
            zIndex: 6500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "18px" : "28px",
          } }}
        >
          <div
            {...{ style: {
              width: "100%",
              maxWidth: "520px",
              background: "var(--color-background-secondary, #ffffff)",
              border: "1px solid var(--color-border-primary, #e2e8f0)",
              borderRadius: "18px",
              padding: isMobile ? "18px" : "22px",
              display: "grid",
              gap: "12px",
              boxShadow: "0 24px 60px rgba(2, 6, 23, 0.35)",
            } }}
          >
            <div {...{ style: { fontSize: "0.68rem", fontWeight: "900", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--tone-warning, #f59e0b)" } }}>
              Save legado detectado
            </div>
            <div {...{ style: { fontSize: isMobile ? "1rem" : "1.08rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
              Save viejo para el sistema actual
            </div>
            <div {...{ style: { fontSize: "0.78rem", lineHeight: 1.55, color: "var(--color-text-secondary, #475569)" } }}>
              Por favor reparalo en <strong>Mas &gt; Sistema &gt; Reparar save</strong>, o más recomendado, <strong>reiniciá tu progreso</strong>. Este aviso solo va a aparecer hasta <strong>3 veces</strong>.
            </div>
            <div {...{ style: { display: "flex", gap: "8px", flexWrap: "wrap" } }}>
              <button
                onClick={handleLegacyRepairRoute}
                {...{ style: {
                  border: "none",
                  background: "var(--tone-warning, #f59e0b)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "0.76rem",
                  fontWeight: "900",
                  cursor: "pointer",
                } }}
              >
                Ir a Mas &gt; Sistema
              </button>
              <button
                onClick={dismissLegacySavePrompt}
                {...{ style: {
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  background: "var(--color-background-secondary, #ffffff)",
                  color: "var(--color-text-primary, #1e293b)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "0.76rem",
                  fontWeight: "900",
                  cursor: "pointer",
                } }}
              >
                Más tarde
              </button>
            </div>
          </div>
        </div>
      )}

      {testerToast && (
        <div
          {...{ style: {
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
          } }}
        >
          {testerToast.label}
        </div>
      )}

      {actionToast && !forceForgeLightCombatTrial && (
        <div
          {...{ style: {
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
            animation:
              actionToast.tone === "warning"
                ? "appActionToastPulseWarning 980ms ease-out"
                : actionToast.tone === "success"
                  ? "appActionToastPulseSuccess 900ms ease-out"
                  : undefined,
          } }}
        >
          {actionToast.label}
        </div>
      )}

      {isMobile && <MobilePrimaryTabs entries={primaryTabEntries} navHeight={NAV_HEIGHT_MOBILE} onTabPress={handlePrimaryTabPress} />}
    </div>
  );
}

function ReforgeDecisionOverlay({ state, dispatch, isMobile = false }) {
  const session = state?.combat?.reforgeSession || null;
  const player = state?.player || {};
  const item = useMemo(
    () => findPlayerItemById(player, session?.itemId),
    [player, session?.itemId]
  );
  const affixIndex = Number.isInteger(Number(session?.affixIndex))
    ? Number(session.affixIndex)
    : null;
  const options = useMemo(
    () => (Array.isArray(session?.options) ? session.options : []),
    [session?.options]
  );
  const [selectedOptionKey, setSelectedOptionKey] = useState(null);

  useEffect(() => {
    if (!session) {
      setSelectedOptionKey(null);
      return;
    }
    if (options.length <= 0) {
      setSelectedOptionKey(null);
      return;
    }
    const hasCurrent = selectedOptionKey && options.some((option, index) => buildReforgeOptionKey(option, index) === selectedOptionKey);
    if (hasCurrent) return;
    setSelectedOptionKey(buildReforgeOptionKey(options[0], 0));
  }, [options, selectedOptionKey, session]);

  const selectedOption = useMemo(() => {
    if (!selectedOptionKey) return null;
    const tuple = options.find((option, index) => buildReforgeOptionKey(option, index) === selectedOptionKey);
    return tuple || null;
  }, [options, selectedOptionKey]);

  const cancelReforge = () => {
    dispatch({ type: "CRAFT_CANCEL_REFORGE_SESSION" });
  };

  const confirmReforge = () => {
    if (!session?.itemId || affixIndex == null || !selectedOption) return;
    dispatch({
      type: "CRAFT_REFORGE_ITEM",
      payload: {
        itemId: session.itemId,
        affixIndex,
        replacementAffix: selectedOption,
      },
    });
  };

  const selectedAffix = item?.affixes?.[affixIndex] || null;
  const hasBrokenSession = !item || affixIndex == null || options.length <= 0;

  if (!session) return null;

  return (
    <OverlayShell
      isMobile={isMobile}
      mode="hard"
      contentLabel="Decision de reforja"
      closeOnEscape={false}
      dismissOnBackdrop={false}
      blockBackgroundScroll
      zIndex={9950}
      backdrop="rgba(2,6,23,0.78)"
    >
      <div
        {...{ style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: isMobile ? "flex-end" : "center",
          justifyContent: "center",
          padding: isMobile ? "10px" : "24px",
          boxSizing: "border-box",
          pointerEvents: "auto",
        } }}
      >
        <section
          {...{ style: {
            width: "min(560px, 100%)",
            maxHeight: isMobile ? "78dvh" : "82vh",
            overflow: "hidden",
            border: "1px solid var(--color-border-primary, #e2e8f0)",
            borderRadius: isMobile ? "16px" : "18px",
            background: "var(--color-background-secondary, #ffffff)",
            boxShadow: "0 24px 60px rgba(2,6,23,0.35)",
            padding: isMobile ? "14px 12px 16px" : "16px 16px 18px",
            display: "grid",
            gap: "10px",
          } }}
        >
          <div {...{ style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" } }}>
            <div {...{ style: { minWidth: 0 } }}>
              <div {...{ style: { fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" } }}>
                Reforja activa
              </div>
              <div {...{ style: { fontSize: "0.92rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.2 } }}>
                {hasBrokenSession ? "Sesion de reforja trabada" : "Elige una opcion y confirma"}
              </div>
            </div>
          </div>

          {item && (
            <div {...{ style: { border: "1px solid var(--color-border-primary, #e2e8f0)", borderLeft: `3px solid ${getRarityColor(item?.rarity)}`, borderRadius: "10px", padding: "9px", display: "grid", gap: "4px" } }}>
              <div {...{ style: { fontSize: "0.76rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                {item.name}
              </div>
              {selectedAffix && (
                <div {...{ style: { fontSize: "0.64rem", color: "var(--color-text-secondary, #475569)", fontWeight: "800" } }}>
                  Linea objetivo: {STAT_LABELS[selectedAffix?.stat] || selectedAffix?.stat} · +{formatStatValue(selectedAffix?.stat, selectedAffix?.rolledValue ?? selectedAffix?.value ?? 0)}
                </div>
              )}
            </div>
          )}

          {hasBrokenSession ? (
            <div {...{ style: { fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 } }}>
              No se pudo reconstruir la preview de reforja. Cancela para destrabar y vuelve a intentar.
            </div>
          ) : (
            <div {...{ style: { display: "grid", gap: "6px", maxHeight: isMobile ? "34dvh" : "40vh", overflowY: "auto", paddingRight: "2px" } }}>
              {options.map((option, index) => {
                const optionKey = buildReforgeOptionKey(option, index);
                const selected = optionKey === selectedOptionKey;
                return (
                  <button
                    key={optionKey}
                    onClick={() => setSelectedOptionKey(optionKey)}
                    {...{ style: {
                      border: `1px solid ${selected ? "var(--tone-violet, #7c3aed)" : "var(--color-border-primary, #e2e8f0)"}`,
                      background: selected ? "var(--tone-violet-soft, #f3e8ff)" : "var(--color-background-secondary, #fff)",
                      borderRadius: "10px",
                      padding: "8px 9px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "grid",
                      gap: "3px",
                    } }}
                  >
                    <div {...{ style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" } }}>
                      <span {...{ style: { fontSize: "0.69rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                        {STAT_LABELS[option?.stat] || option?.stat || "Affix"}
                      </span>
                      <span {...{ style: { fontSize: "0.56rem", fontWeight: "900", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "2px 7px", color: "var(--color-text-secondary, #475569)", background: "var(--color-background-tertiary, #f8fafc)" } }}>
                        {index === 0 ? "Actual" : "Opcion"}
                      </span>
                    </div>
                    <div {...{ style: { fontSize: "0.64rem", fontWeight: "800", color: "var(--color-text-secondary, #475569)" } }}>
                      +{formatStatValue(option?.stat, option?.rolledValue ?? option?.value ?? 0)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div {...{ style: { display: "grid", gridTemplateColumns: "1fr", gap: "8px", alignItems: "center" } }}>
            {hasBrokenSession ? (
              <button
                onClick={cancelReforge}
                {...{ style: {
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  background: "var(--color-background-secondary, #ffffff)",
                  color: "var(--color-text-primary, #1e293b)",
                  borderRadius: "10px",
                  padding: "9px 12px",
                  fontSize: "0.68rem",
                  fontWeight: "900",
                  cursor: "pointer",
                } }}
              >
                Cancelar reforja
              </button>
            ) : (
              <button
                disabled={!selectedOption}
                onClick={confirmReforge}
                {...{ style: {
                  border: "1px solid rgba(30,41,59,0.2)",
                  background: !selectedOption
                    ? "linear-gradient(180deg, #475569 0%, #334155 100%)"
                    : "linear-gradient(180deg, #243244 0%, #1e293b 100%)",
                  color: "#ffffff",
                  borderRadius: "10px",
                  minHeight: "58px",
                  padding: "8px 12px",
                  fontSize: "0.68rem",
                  fontWeight: "900",
                  cursor: !selectedOption ? "not-allowed" : "pointer",
                  opacity: !selectedOption ? 0.8 : 1,
                  boxShadow: "0 8px 18px rgba(15,23,42,0.16)",
                  display: "grid",
                  gap: "2px",
                  alignContent: "center",
                  justifyItems: "center",
                } }}
              >
                <span {...{ style: { fontSize: "0.64rem", fontWeight: "900", lineHeight: 1.1 } }}>Aplicar opcion</span>
                <span {...{ style: { fontSize: "0.53rem", fontWeight: "900", lineHeight: 1.1 } }}>Costo ya pagado</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </OverlayShell>
  );
}

function TabLoadingCard({ label }) {
  return (
    <div {...{ style: { padding: "18px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "220px", color: "var(--color-text-secondary, #475569)", fontWeight: "900", fontSize: "0.82rem" } }}>
      Cargando {label}...
    </div>
  );
}

function OverlayLoadingCard({ label, isMobile = false }) {
  return (
    <OverlayShell isMobile={isMobile}>
      <div {...{ style: { width: "100%", maxWidth: "480px", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", background: "var(--color-background-secondary, #ffffff)", color: "var(--color-text-secondary, #475569)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", padding: isMobile ? "18px 16px 20px" : "20px 22px", textAlign: "center", fontSize: "0.82rem", fontWeight: "900" } }}>
        Cargando {label}...
      </div>
    </OverlayShell>
  );
}

function OfflineMetric({ label, value, icon, tone = "default" }) {
  return (
    <div className="fl-offline-reward-cell" data-tone={tone}>
      <span className="fl-offline-reward-icon" aria-hidden="true">{icon}</span>
      <div className="fl-offline-reward-copy">
        <span className="fl-offline-reward-label">{label}</span>
        <strong className="fl-offline-reward-value">{value}</strong>
      </div>
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
  const bestDropAsset = getItemAsset("relic_warblade");
  const bestDropHighlight = typeof summary.bestDropHighlight === "string"
    ? summary.bestDropHighlight
    : summary.bestDropHighlight?.label;

  return (
    <section className="fl-offline-modal" role="status" aria-label="Cronica offline">
      <div className="fl-offline-header">
        <div className="fl-offline-title">✦ Cronica Offline</div>
        <button
          type="button"
          className="fl-offline-close"
          onClick={onDismiss}
          aria-label="Cerrar cronica offline"
          title="Cerrar"
        >
          ✕
        </button>
      </div>
      <div className="fl-offline-body">
        <div className="fl-offline-headline">{getOfflineHeadline(summary)}</div>
        <div className="fl-offline-time">⏳ {animatedValue(summary.simulatedSeconds)}s resueltos offline</div>

        <div className="fl-offline-bar">
          <div className="fl-offline-bar-label">
            <span>Resolviendo resumen</span>
            <span className="fl-offline-bar-value">{progressPercent}%</span>
          </div>
          <div className="fl-offline-bar-track fl-offline-bar-track--progress">
            <div
              className="fl-offline-bar-fill"
              style={{ "--fl-offline-progress": `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="fl-offline-rewards-grid">
          <OfflineMetric label="Oro" value={animatedValue(summary.goldGained)} icon="🪙" tone="gold" />
          <OfflineMetric label="XP" value={animatedValue(summary.xpGained)} icon="✦" tone="xp" />
          <OfflineMetric label="Esencia" value={animatedValue(summary.essenceGained)} icon="💎" tone="essence" />
          <OfflineMetric label="Kills" value={animatedValue(summary.killsGained)} icon="💀" tone="default" />
          <OfflineMetric label="Items" value={animatedValue(summary.itemsGained)} icon="🎁" tone="default" />
          <OfflineMetric label="Niveles" value={animatedValue(summary.levelsGained)} icon="⛊" tone="success" />
        </div>

        {summary.bestDropName && (
          <div
            className={[
              "fl-offline-best-drop",
              bestDropVisible ? "fl-offline-best-drop--visible" : "",
            ].filter(Boolean).join(" ")}
          >
            <div className="fl-offline-best-drop-frame">
              <FlAsset
                asset={bestDropAsset}
                kind="item"
                size={isMobile ? "md" : "lg"}
                fit="contain"
                rarity={summary.bestDropRarity || "epic"}
                className="fl-offline-best-drop-asset"
                alt=""
              />
            </div>
            <div className="fl-offline-best-drop-copy">
              <div className="fl-offline-best-drop-label">Mejor Drop ◈</div>
              <div className="fl-offline-best-drop-name">{summary.bestDropName}</div>
              <div className="fl-offline-best-drop-rarity" data-rarity={summary.bestDropRarity || "common"}>
                {summary.bestDropRarity || "item"}{bestDropHighlight ? ` · ${bestDropHighlight}` : ""}{summary.bestDropPerfectRolls ? ` · ${summary.bestDropPerfectRolls} perfect` : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function RunSigilOverlay({
  isMobile,
  state,
  pendingRunSigilIds,
  onSelectClass,
  onSelect,
  onStart,
  onSelectContract,
  onRerollContracts,
  prestigeLevel,
  sigilSlotCount = 1,
}) {
  const SIGIL_CARD_COPY_LINES = 4;
  const SIGIL_CARD_COPY_FONT_REM = 0.6;
  const SIGIL_CARD_COPY_LINE_HEIGHT = 1.4;
  const SIGIL_CARD_COPY_HEIGHT_REM =
    SIGIL_CARD_COPY_LINES * SIGIL_CARD_COPY_FONT_REM * SIGIL_CARD_COPY_LINE_HEIGHT;
  const denseMobileLayout = isMobile;
  const preRunCardPadding = denseMobileLayout ? "8px" : "10px";
  const preRunCardGap = denseMobileLayout ? "6px" : "8px";
  const preRunProgressHeight = denseMobileLayout ? "4px" : "6px";
  const preRunOptionPadding = denseMobileLayout ? "8px" : "10px";
  const preRunOptionGap = denseMobileLayout ? "5px" : "7px";
  const preRunOptionTitleSize = denseMobileLayout ? "0.68rem" : "0.72rem";
  const preRunOptionMetaSize = denseMobileLayout ? "0.56rem" : "0.58rem";
  const preRunOptionCopySize = denseMobileLayout ? "0.58rem" : "0.6rem";
  const preRunOptionChipSize = denseMobileLayout ? "0.52rem" : "0.54rem";
  const preRunSelectorColWidth = denseMobileLayout ? "34px" : "40px";
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [sigilCarouselIndex, setSigilCarouselIndex] = useState(0);
  const runSigilsUnlocked = Number(prestigeLevel || 0) >= 1;
  const availableRunSigils = useMemo(
    () => (runSigilsUnlocked ? RUN_SIGILS : [getRunSigil("free")]),
    [runSigilsUnlocked]
  );
  useEffect(() => {
    if (activeSlotIndex < sigilSlotCount) return;
    setActiveSlotIndex(0);
  }, [activeSlotIndex, sigilSlotCount]);

  const currentPendingRunSigil = getRunSigil(pendingRunSigilIds?.[activeSlotIndex] || "free");
  const currentLoadoutProfile = buildRunSigilLoadoutProfile(pendingRunSigilIds);
  const compactLoadoutBoosts = (currentLoadoutProfile.boosts || []).slice(0, 3).map(item => item.label);
  const compactLoadoutTradeoffs = (currentLoadoutProfile.tradeoffs || []).slice(0, 3).map(item => item.label);
  const selectedClass = useMemo(
    () => CLASSES.find(clase => clase.id === state?.player?.class) || null,
    [state?.player?.class]
  );
  const selectedSpec = useMemo(
    () => selectedClass?.specializations?.find(spec => spec.id === state?.player?.specialization) || null,
    [selectedClass, state?.player?.specialization]
  );
  const expeditionContracts = state?.expeditionContracts || {};
  const expeditionContractEntries = useMemo(
    () => getExpeditionContractsWithProgress(state, expeditionContracts),
    [state, expeditionContracts]
  );
  const activeExpeditionContract = useMemo(
    () => getActiveExpeditionContractWithProgress(state, expeditionContracts),
    [state, expeditionContracts]
  );
  const featuredExpeditionContract =
    activeExpeditionContract ||
    expeditionContractEntries.find(contract => !contract?.claimed) ||
    expeditionContractEntries[0] ||
    null;
  const contractRerollCost = useMemo(
    () => getExpeditionContractRerollCost(expeditionContracts),
    [expeditionContracts]
  );
  const canRerollExpeditionContracts = useMemo(() => {
    const relicDust = Number(state?.sanctuary?.resources?.relicDust || 0);
    const sigilFlux = Number(state?.sanctuary?.resources?.sigilFlux || 0);
    return (
      relicDust >= Number(contractRerollCost?.relicDust || 0) &&
      sigilFlux >= Number(contractRerollCost?.sigilFlux || 0)
    );
  }, [
    contractRerollCost?.relicDust,
    contractRerollCost?.sigilFlux,
    state?.sanctuary?.resources?.relicDust,
    state?.sanctuary?.resources?.sigilFlux,
  ]);
  useEffect(() => {
    const selectedIndex = availableRunSigils.findIndex(sigil => sigil.id === currentPendingRunSigil.id);
    if (selectedIndex >= 0) {
      setSigilCarouselIndex(selectedIndex);
      return;
    }
    setSigilCarouselIndex(0);
  }, [activeSlotIndex, availableRunSigils, currentPendingRunSigil.id]);
  const canStartRun = Boolean(selectedClass);
  const currentCarouselSigil =
    availableRunSigils[sigilCarouselIndex] ||
    availableRunSigils[0] ||
    getRunSigil("free");
  const currentCarouselProfile = useMemo(
    () => buildRunSigilChoiceProfile(currentCarouselSigil?.id || "free"),
    [currentCarouselSigil?.id]
  );

  function handleCycleSigil(direction = 1) {
    const total = availableRunSigils.length;
    if (total <= 0) return;
    const normalizedDirection = direction < 0 ? -1 : 1;
    const nextIndex = (sigilCarouselIndex + normalizedDirection + total) % total;
    const nextSigil = availableRunSigils[nextIndex];
    setSigilCarouselIndex(nextIndex);
    if (nextSigil) onSelect(nextSigil.id, activeSlotIndex);
  }

  return (
    <OverlayShell
      isMobile={isMobile}
      mode="hard"
      zIndex={9000}
      contentLabel="Preparacion Pre-Run"
      backdrop="rgba(2,6,23,0.72)"
    >
      <OverlaySurface
        isMobile={isMobile}
        maxWidth="920px"
        paddingMobile="0"
        paddingDesktop="0"
        gap="0"
        {...{ style: {
          background: "var(--color-background-secondary, #fff)",
          color: "var(--color-text-primary, #1e293b)",
          borderRadius: isMobile ? "0" : "18px",
          border: "1px solid var(--color-border-primary, #e2e8f0)",
          boxShadow: "0 24px 60px rgba(2,6,23,0.35)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "100vh",
          overflow: "auto",
        } }}
      >
        <div {...{ style: { padding: isMobile ? "18px 16px 12px" : "20px 22px 14px", borderBottom: "1px solid var(--color-border-primary, #e2e8f0)" } }}>
          <div {...{ style: { fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" } }}>
            {prestigeLevel <= 1 ? "Preparacion de salida" : "Pre-Run"}
          </div>
          <div {...{ style: { fontSize: isMobile ? "1.05rem" : "1.18rem", fontWeight: "900", marginTop: "4px" } }}>
            Clase, contrato y sigilos para esta expedicion
          </div>
          <div {...{ style: { fontSize: "0.76rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45 } }}>
            El contrato se fija al iniciar la run. Los sigilos definen el sesgo de drop y riesgo para esta salida.
          </div>
          {sigilSlotCount > 1 && (
            <div {...{ style: { fontSize: "0.72rem", color: "var(--tone-accent, #4338ca)", marginTop: "8px", fontWeight: "900" } }}>
              Abismo IV activo: podes equipar 2 sigilos. No se repiten.
            </div>
          )}
        </div>

        <div {...{ style: { padding: isMobile ? "12px 14px 0" : "16px 22px 0", display: "grid", gap: denseMobileLayout ? "8px" : "10px" } }}>
          <div {...{ style: { border: "1px solid var(--color-border-primary, #e2e8f0)", background: "var(--color-background-tertiary, #f8fafc)", borderRadius: "14px", padding: preRunCardPadding, display: "grid", gap: preRunCardGap } }}>
            <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "start" } }}>
              <div {...{ style: { fontSize: denseMobileLayout ? "0.54rem" : "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--tone-accent, #4338ca)" } }}>
                Clase
              </div>
            </div>

            {selectedClass && (
              <div {...{ style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } }}>
                <span {...{ style: { fontSize: "0.62rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)", background: "var(--tone-accent-soft, #eef2ff)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "999px", padding: "3px 7px" } }}>
                  {selectedClass.icon} {selectedClass.name}
                </span>
                {selectedSpec && (
                  <span {...{ style: { fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", background: "var(--color-background-secondary, #ffffff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "3px 7px" } }}>
                    {selectedSpec.name}
                  </span>
                )}
              </div>
            )}

            <div {...{ style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: denseMobileLayout ? "6px" : "8px" } }}>
              {CLASSES.map(clase => {
                const selected = selectedClass?.id === clase.id;
                return (
                  <button
                    key={clase.id}
                    onClick={() => {
                      if (typeof onSelectClass === "function") onSelectClass(clase.id);
                    }}
                    {...{ style: {
                      border: selected ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--color-border-primary, #e2e8f0)",
                      background: selected ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #ffffff)",
                      color: selected ? "var(--tone-accent, #4338ca)" : "var(--color-text-primary, #1e293b)",
                      borderRadius: "10px",
                      padding: denseMobileLayout ? "7px 9px" : "8px 10px",
                      fontSize: "0.62rem",
                      fontWeight: "900",
                      cursor: "pointer",
                      display: "grid",
                      gap: "2px",
                      textAlign: "left",
                    } }}
                  >
                    <span {...{ style: { fontSize: denseMobileLayout ? "0.68rem" : "0.72rem", fontWeight: "900" } }}>
                      {clase.icon} {clase.name}
                    </span>
                    <span {...{ style: { fontSize: denseMobileLayout ? "0.54rem" : "0.56rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", lineHeight: 1.35 } }}>
                      {clase.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div {...{ style: { border: "1px solid var(--color-border-primary, #e2e8f0)", background: "var(--color-background-tertiary, #f8fafc)", borderRadius: "14px", padding: preRunCardPadding, display: "grid", gap: preRunCardGap } }}>
            <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "start" } }}>
              <div {...{ style: { fontSize: denseMobileLayout ? "0.54rem" : "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--tone-danger, #ef4444)" } }}>
                Contrato
              </div>
              <button
                onClick={() => {
                  if (typeof onRerollContracts === "function") onRerollContracts();
                }}
                disabled={!canRerollExpeditionContracts}
                {...{ style: {
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  background: canRerollExpeditionContracts ? "var(--color-background-secondary, #ffffff)" : "var(--color-background-tertiary, #f8fafc)",
                  color: canRerollExpeditionContracts ? "var(--color-text-secondary, #475569)" : "var(--color-text-tertiary, #94a3b8)",
                  borderRadius: "999px",
                  padding: denseMobileLayout ? "5px 9px" : "6px 10px",
                  fontSize: denseMobileLayout ? "0.56rem" : "0.58rem",
                  fontWeight: "900",
                  cursor: canRerollExpeditionContracts ? "pointer" : "not-allowed",
                } }}
              >
                {`Reroll (${Number(contractRerollCost?.relicDust || 0)} polvo · ${Number(contractRerollCost?.sigilFlux || 0)} flux)`}
              </button>
            </div>

            <div {...{ style: { fontSize: denseMobileLayout ? "0.6rem" : "0.62rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.35 } }}>
              {featuredExpeditionContract
                ? `${featuredExpeditionContract.title || featuredExpeditionContract.goal?.name || "Objetivo"}`
                : "No hay contrato activo. Selecciona uno antes de iniciar."}
            </div>

            {featuredExpeditionContract && (
              <div {...{ style: { height: preRunProgressHeight, borderRadius: "999px", overflow: "hidden", background: "var(--color-background-secondary, #ffffff)", border: "1px solid var(--color-border-primary, #e2e8f0)" } }}>
                <div
                  {...{ style: {
                    width: `${Math.max(0, Math.min(100, Number(featuredExpeditionContract.progress?.percent || 0)))}%`,
                    height: "100%",
                    background: featuredExpeditionContract.progress?.completed ? "var(--tone-success, #10b981)" : "var(--tone-warning, #f59e0b)",
                  } }}
                />
              </div>
            )}

            {expeditionContractEntries.length > 0 && (
              <div {...{ style: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: denseMobileLayout ? "6px" : "8px" } }}>
                {expeditionContractEntries.map(contract => {
                  const selected = contract?.id === (expeditionContracts?.activeContractId || null);
                  const claimed = Boolean(contract?.claimed);
                  const optionDisabled = claimed;
                  const progressCurrent = Number(contract.progress?.current || 0);
                  const progressTarget = Number(contract.progress?.target || 1);
                  const statusLabel = claimed
                    ? "Reclamado"
                    : contract.progress?.completed
                      ? "Listo"
                      : `${progressCurrent}/${progressTarget}`;
                  const missionDetail =
                    contract?.objectiveDescription ||
                    contract?.goal?.description ||
                    contract?.goal?.name ||
                    contract?.title ||
                    "Completa el objetivo del contrato.";
                  const rewardParts = [];
                  if (Number(contract?.reward?.essence || 0) > 0) rewardParts.push(`+${Number(contract.reward.essence)} esencia`);
                  if (Number(contract?.reward?.codexInk || 0) > 0) rewardParts.push(`+${Number(contract.reward.codexInk)} tinta`);
                  if (Number(contract?.reward?.sigilFlux || 0) > 0) rewardParts.push(`+${Number(contract.reward.sigilFlux)} flux`);
                  if (Number(contract?.reward?.relicDust || 0) > 0) rewardParts.push(`+${Number(contract.reward.relicDust)} polvo`);
                  return (
                    <button
                      key={contract.id}
                      onClick={() => {
                        if (typeof onSelectContract === "function") onSelectContract(contract.id);
                      }}
                      disabled={optionDisabled}
                      {...{ style: {
                        textAlign: "left",
                        display: "grid",
                        gap: preRunOptionGap,
                        padding: preRunOptionPadding,
                        borderRadius: "12px",
                        background: selected
                          ? "var(--tone-accent-soft, #eef2ff)"
                          : claimed
                            ? "rgba(16,185,129,0.1)"
                            : "var(--color-background-secondary, #ffffff)",
                        border: selected ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--color-border-primary, #e2e8f0)",
                        color: selected
                          ? "var(--tone-accent, #4338ca)"
                          : claimed
                            ? "var(--tone-success-strong, #047857)"
                            : "var(--color-text-secondary, #475569)",
                        fontSize: "0.62rem",
                        fontWeight: "800",
                        cursor: optionDisabled ? "not-allowed" : "pointer",
                        opacity: optionDisabled ? 0.72 : 1,
                      } }}
                    >
                      <div {...{ style: { display: "flex", justifyContent: "space-between", gap: denseMobileLayout ? "6px" : "8px", alignItems: "start" } }}>
                        <span {...{ style: { fontSize: preRunOptionTitleSize, fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                          {contract.title || contract.goal?.name || "Contrato"}
                        </span>
                        <span {...{ style: { fontSize: preRunOptionMetaSize, fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" } }}>
                          {statusLabel}
                        </span>
                      </div>
                      <div
                        {...{ style: {
                          fontSize: preRunOptionCopySize,
                          lineHeight: 1.35,
                          color: "var(--color-text-secondary, #475569)",
                          display: "-webkit-box",
                          WebkitLineClamp: denseMobileLayout ? 2 : 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        } }}
                      >
                        {missionDetail}
                      </div>
                      <div {...{ style: { fontSize: preRunOptionMetaSize, fontWeight: "900", color: "var(--tone-info, #0369a1)" } }}>
                        Objetivo: {progressCurrent}/{progressTarget}
                      </div>
                      <div {...{ style: { display: "flex", gap: denseMobileLayout ? "3px" : "4px", flexWrap: "wrap" } }}>
                        {rewardParts.length > 0 ? rewardParts.map(reward => (
                          <span
                            key={`${contract.id}-${reward}`}
                            {...{ style: {
                              fontSize: preRunOptionChipSize,
                              fontWeight: "900",
                              color: "var(--tone-success-strong, #047857)",
                              background: "var(--tone-success-soft, #ecfdf5)",
                              border: "1px solid rgba(16,185,129,0.18)",
                              borderRadius: "999px",
                              padding: denseMobileLayout ? "2px 5px" : "2px 6px",
                            } }}
                          >
                            {reward}
                          </span>
                        )) : (
                          <span {...{ style: { fontSize: preRunOptionChipSize, fontWeight: "800", color: "var(--color-text-tertiary, #94a3b8)" } }}>
                            Sin recompensa definida
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div {...{ style: { border: "1px solid var(--color-border-primary, #e2e8f0)", background: "var(--color-background-tertiary, #f8fafc)", borderRadius: "14px", padding: preRunCardPadding, display: "grid", gap: denseMobileLayout ? "6px" : "7px" } }}>
            <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "start" } }}>
              <div {...{ style: { display: "grid", gap: "4px" } }}>
                <div {...{ style: { fontSize: denseMobileLayout ? "0.54rem" : "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--tone-accent, #4338ca)" } }}>
                  Sigilo
                </div>
                <div {...{ style: { fontSize: denseMobileLayout ? "0.9rem" : "0.94rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                  Sesgo de expedicion
                </div>
              </div>
              <div {...{ style: { fontSize: denseMobileLayout ? "0.62rem" : "0.64rem", fontWeight: "900", color: "var(--tone-info, #0369a1)" } }}>
                Slot activo: {activeSlotIndex + 1} · {currentPendingRunSigil.shortName || currentPendingRunSigil.name}
              </div>
            </div>

            <div {...{ style: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: denseMobileLayout ? "6px" : "8px" } }}>
              <CompactSigilSummaryLine
                label="Premia"
                tone="success"
                items={compactLoadoutBoosts}
                emptyLabel="Sin sesgo positivo fuerte."
              />
              <CompactSigilSummaryLine
                label="Cede"
                tone="danger"
                items={compactLoadoutTradeoffs}
                emptyLabel="Sin coste de oportunidad relevante."
              />
            </div>

            {sigilSlotCount > 1 && (
              <div {...{ style: { display: "flex", gap: denseMobileLayout ? "6px" : "8px", flexWrap: "wrap" } }}>
                {pendingRunSigilIds.map((sigilId, index) => {
                  const sigil = getRunSigil(sigilId);
                  const active = index === activeSlotIndex;
                  return (
                    <button
                      key={`sigil-slot-${index + 1}`}
                      onClick={() => setActiveSlotIndex(index)}
                      {...{ style: {
                        border: "1px solid",
                        borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #e2e8f0)",
                        background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #fff)",
                        color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #475569)",
                        borderRadius: "999px",
                        padding: denseMobileLayout ? "6px 10px" : "7px 11px",
                        fontSize: denseMobileLayout ? "0.64rem" : "0.68rem",
                        fontWeight: "900",
                        cursor: "pointer",
                      } }}
                    >
                      {`Slot ${index + 1}: ${sigil.shortName || sigil.name}`}
                    </button>
                  );
                })}
              </div>
            )}

            <div {...{ style: { display: "grid", gridTemplateColumns: `${preRunSelectorColWidth} minmax(0, 1fr) ${preRunSelectorColWidth}`, gap: denseMobileLayout ? "6px" : "8px", alignItems: "stretch" } }}>
              <button
                onClick={() => handleCycleSigil(-1)}
                disabled={availableRunSigils.length <= 1}
                {...{ style: {
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  background: availableRunSigils.length > 1 ? "var(--color-background-secondary, #ffffff)" : "var(--color-background-tertiary, #f8fafc)",
                  color: availableRunSigils.length > 1 ? "var(--color-text-secondary, #475569)" : "var(--color-text-tertiary, #94a3b8)",
                  borderRadius: "10px",
                  padding: denseMobileLayout ? "7px 5px" : "8px 6px",
                  fontSize: denseMobileLayout ? "0.74rem" : "0.8rem",
                  fontWeight: "900",
                  cursor: availableRunSigils.length > 1 ? "pointer" : "not-allowed",
                } }}
              >
                {"<"}
              </button>
              {currentCarouselSigil && (
                <button
                  onClick={() => onSelect(currentCarouselSigil.id, activeSlotIndex)}
                  {...{ style: {
                    textAlign: "left",
                    border: "1px solid",
                    borderColor: currentPendingRunSigil.id === currentCarouselSigil.id ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #e2e8f0)",
                    background: currentPendingRunSigil.id === currentCarouselSigil.id ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #ffffff)",
                    color: "inherit",
                    borderRadius: "12px",
                    padding: preRunOptionPadding,
                    cursor: "pointer",
                    display: "grid",
                    gap: preRunOptionGap,
                  } }}
                >
                  <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" } }}>
                    <div {...{ style: { display: "grid", gap: "2px" } }}>
                      <div {...{ style: { fontSize: preRunOptionTitleSize, fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                        {currentCarouselSigil.name}
                      </div>
                      <div {...{ style: { fontSize: preRunOptionChipSize, fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: currentPendingRunSigil.id === currentCarouselSigil.id ? "var(--tone-accent, #4338ca)" : "var(--color-text-tertiary, #94a3b8)" } }}>
                        {currentCarouselSigil.focus}
                      </div>
                    </div>
                    <div {...{ style: { display: "flex", alignItems: "center", gap: "6px" } }}>
                      <span {...{ style: { fontSize: preRunOptionChipSize, fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" } }}>
                        {availableRunSigils.length > 0
                          ? `${sigilCarouselIndex + 1}/${availableRunSigils.length}`
                          : "0/0"}
                      </span>
                      <span {...{ style: { minWidth: "18px", height: "18px", borderRadius: "999px", border: "2px solid", borderColor: currentPendingRunSigil.id === currentCarouselSigil.id ? "var(--tone-accent, #4338ca)" : "var(--color-border-tertiary, #cbd5e1)", background: currentPendingRunSigil.id === currentCarouselSigil.id ? "var(--tone-accent, #4338ca)" : "transparent" } }} />
                    </div>
                  </div>
                  <div {...{ style: {
                    fontSize: preRunOptionCopySize,
                    color: "var(--color-text-secondary, #475569)",
                    lineHeight: SIGIL_CARD_COPY_LINE_HEIGHT,
                    minHeight: `${SIGIL_CARD_COPY_HEIGHT_REM}rem`,
                    maxHeight: `${SIGIL_CARD_COPY_HEIGHT_REM}rem`,
                    display: "-webkit-box",
                    WebkitLineClamp: SIGIL_CARD_COPY_LINES,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  } }}>
                    {currentCarouselSigil.summary}
                  </div>
                </button>
              )}
              <button
                onClick={() => handleCycleSigil(1)}
                disabled={availableRunSigils.length <= 1}
                {...{ style: {
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  background: availableRunSigils.length > 1 ? "var(--color-background-secondary, #ffffff)" : "var(--color-background-tertiary, #f8fafc)",
                  color: availableRunSigils.length > 1 ? "var(--color-text-secondary, #475569)" : "var(--color-text-tertiary, #94a3b8)",
                  borderRadius: "10px",
                  padding: denseMobileLayout ? "7px 5px" : "8px 6px",
                  fontSize: denseMobileLayout ? "0.74rem" : "0.8rem",
                  fontWeight: "900",
                  cursor: availableRunSigils.length > 1 ? "pointer" : "not-allowed",
                } }}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>

        <div {...{ style: { padding: isMobile ? "0 14px 16px" : "0 22px 22px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: denseMobileLayout ? "10px" : "12px", flexWrap: "wrap" } }}>
          <button
            onClick={onStart}
            disabled={!canStartRun}
            {...{ style: {
              border: canStartRun ? "1px solid var(--tone-accent, #4338ca)" : "1px solid var(--color-border-primary, #e2e8f0)",
              background: canStartRun ? "var(--tone-accent, #4338ca)" : "var(--color-background-tertiary, #f8fafc)",
              color: canStartRun ? "#fff" : "var(--color-text-tertiary, #94a3b8)",
              borderRadius: "12px",
              padding: denseMobileLayout ? "9px 12px" : "10px 14px",
              fontSize: denseMobileLayout ? "0.68rem" : "0.72rem",
              fontWeight: "900",
              cursor: canStartRun ? "pointer" : "not-allowed",
            } }}
          >
            Empezar corrida
          </button>
        </div>
      </OverlaySurface>
    </OverlayShell>
  );
}

function CompactSigilSummaryLine({ label, tone = "success", items = [], emptyLabel = "" }) {
  const palette =
    tone === "danger"
      ? {
          label: "var(--tone-danger, #b91c1c)",
          text: "var(--tone-danger, #b91c1c)",
          bg: "var(--tone-danger-soft, #fff1f2)",
          border: "rgba(244,63,94,0.18)",
        }
      : {
          label: "var(--tone-success-strong, #047857)",
          text: "var(--tone-success-strong, #047857)",
          bg: "var(--tone-success-soft, #ecfdf5)",
          border: "rgba(16,185,129,0.18)",
        };
  const compactText = Array.isArray(items) && items.length > 0 ? items.join(" · ") : emptyLabel;
  return (
    <div
      {...{ style: {
        display: "grid",
        gap: "3px",
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        borderRadius: "10px",
        padding: "6px 8px",
      } }}
    >
      <div {...{ style: { fontSize: "0.52rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: palette.label } }}>
        {label}
      </div>
      <div {...{ style: { fontSize: "0.62rem", fontWeight: "800", color: compactText ? palette.text : "var(--color-text-tertiary, #94a3b8)", lineHeight: 1.35 } }}>
        {compactText || emptyLabel}
      </div>
    </div>
  );
}

export default function App() {
  const showForgeLightKitDemo = typeof window !== "undefined" && window.location.hash === "#forge-light-kit-demo";
  const showForgeLightCombatTrial = typeof window !== "undefined" && window.location.hash === "#forge-light-prueba";

  if (showForgeLightKitDemo) {
    return (
      <Suspense fallback={<div className="fl-kit-demo__loading">Cargando Forge Light UI Kit...</div>}>
        <ForgeLightKitDemo />
      </Suspense>
    );
  }

  return <GameApp forceForgeLightCombatTrial={showForgeLightCombatTrial} />;
}
