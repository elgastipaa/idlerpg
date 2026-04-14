import React, { Suspense, lazy, useState, useEffect } from "react";
import { useGame } from "./hooks/useGame";
import Character from "./components/Character";
import Combat from "./components/Combat";
import Inventory from "./components/Inventory";
import { getRarityColor } from "./constants/rarity";
import { getRunSigil, RUN_SIGILS } from "./data/runSigils";

const Skills = lazy(() => import("./components/Skills"));
const Achievements = lazy(() => import("./components/Achievements"));
const Stats = lazy(() => import("./components/Stats"));
const Crafting = lazy(() => import("./components/Crafting"));
const Talents = lazy(() => import("./components/Talents"));
const Codex = lazy(() => import("./components/Codex"));
const Prestige = lazy(() => import("./components/Prestige"));

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
              Ir a Combate
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

function renderCurrentTab(currentTab, state, dispatch) {
  if (currentTab === "character") return <Character player={state.player} dispatch={dispatch} state={state} />;
  if (currentTab === "combat") return <Combat state={state} dispatch={dispatch} />;
  if (currentTab === "inventory") return <Inventory state={state} player={state.player} dispatch={dispatch} />;
  if (currentTab === "skills") return <Skills state={state} dispatch={dispatch} />;
  if (currentTab === "talents") return <Talents state={state} dispatch={dispatch} />;
  if (currentTab === "crafting") return <Crafting state={state} dispatch={dispatch} />;
  if (currentTab === "prestige") return <Prestige state={state} dispatch={dispatch} />;
  if (currentTab === "achievements") return <Achievements state={state} />;
  if (currentTab === "stats") return <Stats state={state} dispatch={dispatch} mode="stats" />;
  if (currentTab === "lab") return <Stats state={state} dispatch={dispatch} mode="lab" />;
  if (currentTab === "codex") return <Codex state={state} dispatch={dispatch} />;
  return null;
}

const TAB_CONFIG = {
  character:    { label: "Heroe", icon: "⚔️" },
  combat:       { label: "Combate", icon: "🗡️" },
  inventory:    { label: "Mochila", icon: "🎒" },
  skills:       { label: "Atributos", icon: "⬆️" },
  talents:      { label: "Talentos", icon: "🎯" },
  crafting:     { label: "Forja", icon: "🔨" },
  prestige:     { label: "Prestigio", icon: "🜂" },
  achievements: { label: "Logros", icon: "🏆" },
  stats:        { label: "Metricas", icon: "📊" },
  lab:          { label: "Lab", icon: "🧪" },
  codex:        { label: "Codex", icon: "📚" },
};

export default function App() {
  const { state, dispatch } = useGame();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const offlineSummary = state.combat?.offlineSummary;
  const hasTalentPoints = (state.player?.talentPoints || 0) > 0;
  const reforgeLocked = !!state.combat?.reforgeSession;
  const inventoryUpgrades = (state.player?.inventory || []).filter(item => {
    const compare = item.type === "weapon" ? state.player?.equipment?.weapon : state.player?.equipment?.armor;
    return (item?.rating || 0) > (compare?.rating || 0);
  }).length;
  const theme = state.settings?.theme === "dark" ? "dark" : "light";
  const themeVars = THEMES[theme];
  const activeRunSigil = getRunSigil(state.combat?.activeRunSigilId || "free");
  const pendingRunSigil = getRunSigil(state.combat?.pendingRunSigilId || "free");
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
    if (!isMobile) setShowMoreTabs(false);
  }, [isMobile, state.currentTab]);

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

  const tabs = Object.keys(TAB_CONFIG);
  const mobilePrimaryTabs = ["combat", "inventory", "crafting", "character"];
  const mobileSecondaryTabs = tabs.filter(tab => !mobilePrimaryTabs.includes(tab));
  const activeTabInMore = !mobilePrimaryTabs.includes(state.currentTab);
  const HEADER_HEIGHT_MOBILE = 62;
  const HEADER_HEIGHT_DESKTOP = 68;
  const NAV_HEIGHT_MOBILE = 72;
  const DESKTOP_MAX_WIDTH = 1180;
  const resourceSummary = (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflowX: "auto", scrollbarWidth: "none" }}>
      {showActiveRunSigil && (
        <HeaderCompactChip
          text={activeRunSigil.shortName || activeRunSigil.name}
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

  return (
    <div style={{ backgroundColor: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
      <header style={{ position: "fixed", top: 0, left: 0, width: "100%", height: isMobile ? `${HEADER_HEIGHT_MOBILE}px` : `${HEADER_HEIGHT_DESKTOP}px`, backgroundColor: "var(--color-background-primary, #f8fafc)", borderBottom: "1px solid var(--color-border-secondary, #e2e8f0)", zIndex: 5000, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: `${DESKTOP_MAX_WIDTH}px`, width: "100%", margin: "0 auto", padding: isMobile ? "8px 14px" : "10px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? "1.15rem" : "1.55rem", fontWeight: "800", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.1 }}>
                {TAB_CONFIG[state.currentTab].label}
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

      <div style={{ paddingTop: isMobile ? `${HEADER_HEIGHT_MOBILE}px` : `${HEADER_HEIGHT_DESKTOP}px`, paddingBottom: isMobile ? "180px" : "40px", paddingLeft: isMobile ? "0px" : "24px", paddingRight: isMobile ? "0px" : "24px", maxWidth: isMobile ? "100%" : `${DESKTOP_MAX_WIDTH}px`, width: "100%", margin: "0 auto", flex: 1 }}>
        {!isMobile && (
          <div style={{ marginBottom: "12px", background: "var(--color-background-secondary, #ffffff)", border: "1px solid var(--color-border-tertiary, #cbd5e1)", borderRadius: "12px", boxShadow: "0 4px 20px var(--color-shadow, rgba(0,0,0,0.05))", padding: "10px 12px" }}>
            <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {tabs.map((t) => (
                <button
                  key={t}
                  disabled={reforgeLocked && state.currentTab !== t}
                  onClick={() => dispatch({ type: "SET_TAB", tab: t })}
                  style={{
                    padding: "7px 13px",
                    cursor: reforgeLocked && state.currentTab !== t ? "not-allowed" : "pointer",
                    backgroundColor: state.currentTab === t ? "var(--color-background-info, #e0e7ff)" : "var(--color-background-secondary, #ffffff)",
                    color: reforgeLocked && state.currentTab !== t ? "var(--color-text-tertiary, #94a3b8)" : state.currentTab === t ? "var(--color-text-info, #4338ca)" : "var(--color-text-primary, #1e293b)",
                    border: "1px solid var(--color-border-tertiary, #cbd5e1)",
                    borderRadius: "8px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                    opacity: reforgeLocked && state.currentTab !== t ? 0.55 : 1,
                  }}
                >
                  <span>{TAB_CONFIG[t].icon}</span>
                  {TAB_CONFIG[t].label}
                  {t === "talents" && hasTalentPoints && (
                    <span style={{ marginLeft: "4px", minWidth: "18px", height: "18px", padding: "0 6px", borderRadius: "999px", background: "var(--tone-danger, #ef4444)", color: "#fff", fontSize: "0.62rem", fontWeight: "900", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {state.player.talentPoints}
                    </span>
                  )}
                </button>
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
            label={TAB_CONFIG[state.currentTab].label}
            onRecover={() => dispatch({ type: "SET_TAB", tab: "combat" })}
          >
            <Suspense fallback={<TabLoadingCard label={TAB_CONFIG[state.currentTab].label} />}>
              {renderCurrentTab(state.currentTab, state, dispatch)}
            </Suspense>
          </TabErrorBoundary>
        </main>
      </div>

      {state.combat?.pendingRunSetup && state.player?.class && (
        <RunSigilOverlay
          isMobile={isMobile}
          pendingRunSigil={pendingRunSigil}
          onSelect={(sigilId) => dispatch({ type: "SELECT_RUN_SIGIL", sigilId })}
          onStart={() => dispatch({ type: "START_RUN" })}
          prestigeLevel={state.prestige?.level || 0}
        />
      )}

      {isMobile && (
        <>
          {showMoreTabs && (
            <div style={{ position: "fixed", left: "8px", right: "8px", bottom: `${NAV_HEIGHT_MOBILE + 8}px`, zIndex: 5001, background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "8px", boxShadow: "0 14px 30px var(--color-shadow, rgba(15,23,42,0.18))", display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "6px" }}>
              {mobileSecondaryTabs.map(t => (
                <button
                  key={t}
                  disabled={reforgeLocked && state.currentTab !== t}
                  onClick={() => {
                    dispatch({ type: "SET_TAB", tab: t });
                    setShowMoreTabs(false);
                  }}
                  style={{ border: "1px solid var(--color-border-primary, #e2e8f0)", background: state.currentTab === t ? "var(--color-background-info, #eef2ff)" : "var(--color-background-secondary, #fff)", color: reforgeLocked && state.currentTab !== t ? "var(--color-text-tertiary, #94a3b8)" : "var(--color-text-primary, #1e293b)", borderRadius: "10px", padding: "8px 6px", fontSize: "0.68rem", fontWeight: "900", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: reforgeLocked && state.currentTab !== t ? "not-allowed" : "pointer", position: "relative", opacity: reforgeLocked && state.currentTab !== t ? 0.55 : 1 }}
                >
                  <span>{TAB_CONFIG[t].icon}</span>
                  <span>{TAB_CONFIG[t].label}</span>
                  {t === "talents" && hasTalentPoints && (
                    <span style={{ position: "absolute", top: "4px", right: "4px", minWidth: "16px", height: "16px", padding: "0 5px", borderRadius: "999px", background: "var(--tone-danger, #ef4444)", color: "#fff", fontSize: "0.56rem", fontWeight: "900", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {state.player.talentPoints}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          <nav style={{ position: "fixed", bottom: 0, left: 0, width: "100%", height: `${NAV_HEIGHT_MOBILE}px`, backgroundColor: "var(--color-background-secondary, #ffffff)", borderTop: "1px solid var(--color-border-secondary, #e2e8f0)", display: "flex", zIndex: 5000, paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "content-box" }}>
            {mobilePrimaryTabs.map((t) => {
              const isActive = state.currentTab === t;
              return (
                <button key={t} disabled={reforgeLocked && !isActive} onClick={() => { dispatch({ type: "SET_TAB", tab: t }); setShowMoreTabs(false); }} style={{ flex: 1, minWidth: "56px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "2px", background: isActive ? "var(--color-background-info, #f1f5f9)" : "transparent", border: "none", outline: "none", position: "relative", paddingTop: "5px", opacity: reforgeLocked && !isActive ? 0.45 : 1 }}>
                  <span style={{ filter: isActive ? "none" : "grayscale(1) opacity(0.5)", position: "relative", fontSize: "21px", lineHeight: 1 }}>
                    {TAB_CONFIG[t].icon}
                  </span>
                  <span style={{ fontSize: "0.56rem", fontWeight: "900", color: isActive ? "var(--color-text-info, #4338ca)" : "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {TAB_CONFIG[t].label}
                  </span>
                  {t === "inventory" && inventoryUpgrades > 0 && (
                    <span style={{ position: "absolute", top: "6px", right: "14px", minWidth: "16px", height: "16px", padding: "0 5px", borderRadius: "999px", background: "var(--tone-success, #10b981)", color: "#fff", fontSize: "0.56rem", fontWeight: "900", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {inventoryUpgrades > 9 ? "9+" : inventoryUpgrades}
                    </span>
                  )}
                </button>
              );
            })}
            <button disabled={reforgeLocked} onClick={() => setShowMoreTabs(current => !current)} style={{ flex: 1, minWidth: "56px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "2px", background: activeTabInMore || showMoreTabs ? "var(--color-background-info, #f1f5f9)" : "transparent", border: "none", outline: "none", color: "var(--color-text-primary, #1e293b)", fontWeight: "900", position: "relative", paddingTop: "5px", opacity: reforgeLocked ? 0.45 : 1 }}>
              <span style={{ fontSize: "20px", lineHeight: 1 }}>···</span>
              <span style={{ fontSize: "0.56rem", fontWeight: "900", color: activeTabInMore || showMoreTabs ? "var(--color-text-info, #4338ca)" : "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Mas
              </span>
              {hasTalentPoints && (
                <span style={{ position: "absolute", top: "12px", right: "15px", width: "9px", height: "9px", borderRadius: "999px", background: "var(--tone-danger, #ef4444)" }} />
              )}
            </button>
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

function RunSigilOverlay({ isMobile, pendingRunSigil, onSelect, onStart, prestigeLevel }) {
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
        </div>

        <div style={{ padding: isMobile ? "14px 16px 18px" : "18px 22px 22px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
          {RUN_SIGILS.map(sigil => {
            const active = pendingRunSigil.id === sigil.id;
            return (
              <button
                key={sigil.id}
                onClick={() => onSelect(sigil.id)}
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
                  <span style={{ minWidth: "18px", height: "18px", borderRadius: "999px", border: "2px solid", borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-tertiary, #cbd5e1)", background: active ? "var(--tone-accent, #4338ca)" : "transparent" }} />
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #475569)", marginTop: "8px", lineHeight: 1.45 }}>
                  {sigil.summary}
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
              Seleccion actual: <strong style={{ color: "var(--color-text-primary, #1e293b)" }}>{pendingRunSigil.name}</strong>
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>
              {pendingRunSigil.summary}
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
