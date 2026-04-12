import React, { useState, useEffect } from "react";
import { useGame } from "./hooks/useGame";
import Character from "./components/Character";
import Combat from "./components/Combat";
import Inventory from "./components/Inventory";
import Skills from "./components/Skills";
import Achievements from "./components/Achievements";
import Stats from "./components/Stats";
import Crafting from "./components/Crafting";
import Talents from "./components/Talents";
import Codex from "./components/Codex";
import Prestige from "./components/Prestige";
import { getRarityColor } from "./constants/rarity";

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

const TAB_CONFIG = {
  character:    { label: "Heroe", icon: "⚔️" },
  combat:       { label: "Combate", icon: "🗡️" },
  inventory:    { label: "Mochila", icon: "🎒" },
  skills:       { label: "Habilidades", icon: "⚡" },
  talents:      { label: "Talentos", icon: "🎯" },
  crafting:     { label: "Forja", icon: "🔨" },
  prestige:     { label: "Prestigio", icon: "🜂" },
  achievements: { label: "Logros", icon: "🏆" },
  stats:        { label: "Metricas", icon: "📊" },
  codex:        { label: "Codex", icon: "📚" },
};

export default function App() {
  const { state, dispatch } = useGame();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const offlineSummary = state.combat?.offlineSummary;
  const hasTalentPoints = (state.player?.talentPoints || 0) > 0;
  const inventoryUpgrades = (state.player?.inventory || []).filter(item => {
    const compare = item.type === "weapon" ? state.player?.equipment?.weapon : state.player?.equipment?.armor;
    return (item?.rating || 0) > (compare?.rating || 0);
  }).length;
  const theme = state.settings?.theme === "dark" ? "dark" : "light";
  const themeVars = THEMES[theme];

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

  const tabs = Object.keys(TAB_CONFIG);
  const mobilePrimaryTabs = ["combat", "inventory", "crafting", "character"];
  const mobileSecondaryTabs = tabs.filter(tab => !mobilePrimaryTabs.includes(tab));
  const activeTabInMore = !mobilePrimaryTabs.includes(state.currentTab);
  const HEADER_HEIGHT_MOBILE = 86;
  const HEADER_HEIGHT_DESKTOP = 116;
  const NAV_HEIGHT_MOBILE = 72;
  const DESKTOP_MAX_WIDTH = 1180;
  const resourceSummary = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <HeaderResourcePill
        label="Oro"
        value={formatHeaderResource(state.player?.gold || 0)}
        color="var(--tone-warning, #f59e0b)"
        borderColor="rgba(245,158,11,0.22)"
        background="var(--tone-warning-soft, #fff7ed)"
      />
      <HeaderResourcePill
        label="Esencia"
        value={formatHeaderResource(state.player?.essence || 0)}
        color="var(--tone-violet, #7c3aed)"
        borderColor="rgba(124,58,237,0.22)"
        background="var(--tone-violet-soft, #f3e8ff)"
      />
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
      <header style={{ position: "fixed", top: 0, left: 0, width: "100%", height: isMobile ? `${HEADER_HEIGHT_MOBILE}px` : `${HEADER_HEIGHT_DESKTOP}px`, backgroundColor: "var(--color-background-primary, #f8fafc)", borderBottom: "1px solid var(--color-border-secondary, #e2e8f0)", zIndex: 5000, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: `${DESKTOP_MAX_WIDTH}px`, width: "100%", margin: "0 auto", padding: isMobile ? "8px 14px" : "10px 22px", display: "flex", flexDirection: "column", gap: isMobile ? "8px" : "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? "1.15rem" : "1.55rem", fontWeight: "800", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.1 }}>
                {TAB_CONFIG[state.currentTab].label}
              </h1>
              {isMobile && resourceSummary}
            </div>
            <button
              onClick={() => dispatch({ type: "TOGGLE_THEME" })}
              style={{
                border: "1px solid var(--color-border-tertiary, #cbd5e1)",
                background: "var(--color-background-secondary, #ffffff)",
                color: "var(--color-text-primary, #1e293b)",
                borderRadius: "999px",
                padding: isMobile ? "5px 9px" : "7px 11px",
                cursor: "pointer",
                fontSize: isMobile ? "0.68rem" : "0.76rem",
                fontWeight: "900",
                boxShadow: `0 6px 18px var(--color-shadow, rgba(15,23,42,0.08))`,
                flexShrink: 0,
              }}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px" }}>
              <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => dispatch({ type: "SET_TAB", tab: t })}
                    style={{
                      padding: "7px 13px",
                      cursor: "pointer",
                      backgroundColor: state.currentTab === t ? "var(--color-background-info, #e0e7ff)" : "var(--color-background-secondary, #ffffff)",
                      color: state.currentTab === t ? "var(--color-text-info, #4338ca)" : "var(--color-text-primary, #1e293b)",
                      border: "1px solid var(--color-border-tertiary, #cbd5e1)",
                      borderRadius: "8px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
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
              {resourceSummary}
            </div>
          )}
        </div>
      </header>

      <div style={{ paddingTop: isMobile ? `${HEADER_HEIGHT_MOBILE + 10}px` : `${HEADER_HEIGHT_DESKTOP + 20}px`, paddingBottom: isMobile ? "180px" : "40px", paddingLeft: isMobile ? "0px" : "24px", paddingRight: isMobile ? "0px" : "24px", maxWidth: isMobile ? "100%" : `${DESKTOP_MAX_WIDTH}px`, width: "100%", margin: "0 auto", flex: 1 }}>
        {offlineSummary && (
          <div style={{ marginBottom: "10px", background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #22314d)", borderRadius: "14px", padding: "10px 12px", color: "var(--color-text-primary, #1e293b)", boxShadow: "0 8px 20px var(--color-shadow, rgba(0,0,0,0.12))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #1D9E75)" }}>
                  Cronica Offline
                </div>
                <div style={{ fontSize: "0.84rem", fontWeight: "900", marginTop: "2px", lineHeight: 1.25 }}>
                  {getOfflineHeadline(offlineSummary)}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px" }}>
                  {formatOfflineValue(offlineSummary.simulatedSeconds)}s resueltos offline
                </div>
              </div>
              <button onClick={() => dispatch({ type: "DISMISS_OFFLINE_SUMMARY" })} style={{ border: "1px solid var(--color-border-primary, #22314d)", background: "var(--color-background-tertiary, #f1f5f9)", color: "var(--color-text-primary, #1e293b)", borderRadius: "999px", padding: "6px 10px", fontSize: "0.68rem", fontWeight: "900", cursor: "pointer" }}>
                Cerrar
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: "6px" }}>
              <OfflineMetric label="Oro" value={formatOfflineValue(offlineSummary.goldGained)} color="var(--tone-warning, #f59e0b)" />
              <OfflineMetric label="XP" value={formatOfflineValue(offlineSummary.xpGained)} color="var(--tone-violet, #c4b5fd)" />
              <OfflineMetric label="Esencia" value={formatOfflineValue(offlineSummary.essenceGained)} color="var(--tone-accent, #a78bfa)" />
              <OfflineMetric label="Kills" value={formatOfflineValue(offlineSummary.killsGained)} color="var(--tone-success, #86efac)" />
              <OfflineMetric label="Items" value={formatOfflineValue(offlineSummary.itemsGained)} color="var(--tone-info, #67e8f9)" />
              <OfflineMetric label="Niveles" value={formatOfflineValue(offlineSummary.levelsGained)} color="var(--tone-danger, #fca5a5)" />
            </div>

            {offlineSummary.bestDropName && (
              <div style={{ marginTop: "8px", background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "10px", padding: "8px 10px" }}>
                <div style={{ fontSize: "0.58rem", color: "var(--tone-success, #1D9E75)", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.08em" }}>
                  Mejor Drop
                </div>
                <div style={{ marginTop: "3px", fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.2 }}>
                  {offlineSummary.bestDropName}
                </div>
                <div style={{ marginTop: "4px", fontSize: "0.66rem", color: getRarityColor(offlineSummary.bestDropRarity), fontWeight: "900" }}>
                  {offlineSummary.bestDropRarity || "item"}{offlineSummary.bestDropHighlight?.label ? ` · ${offlineSummary.bestDropHighlight.label}` : ""}{offlineSummary.bestDropPerfectRolls ? ` · ${offlineSummary.bestDropPerfectRolls} perfect` : ""}
                </div>
              </div>
            )}
          </div>
        )}

        <main style={{ width: "100%", background: isMobile ? "transparent" : "var(--color-background-secondary, #ffffff)", borderRadius: isMobile ? "0" : "12px", border: isMobile ? "none" : "1px solid var(--color-border-tertiary, #cbd5e1)", boxShadow: isMobile ? "none" : "0 4px 20px var(--color-shadow, rgba(0,0,0,0.05))" }}>
          {state.currentTab === "character" && <Character player={state.player} dispatch={dispatch} state={state} />}
          {state.currentTab === "combat" && <Combat state={state} dispatch={dispatch} />}
          {state.currentTab === "inventory" && <Inventory state={state} player={state.player} dispatch={dispatch} />}
          {state.currentTab === "skills" && <Skills state={state} dispatch={dispatch} />}
          {state.currentTab === "talents" && <Talents state={state} dispatch={dispatch} />}
          {state.currentTab === "crafting" && <Crafting state={state} dispatch={dispatch} />}
          {state.currentTab === "prestige" && <Prestige state={state} dispatch={dispatch} />}
          {state.currentTab === "achievements" && <Achievements state={state} />}
          {state.currentTab === "stats" && <Stats state={state} dispatch={dispatch} />}
          {state.currentTab === "codex" && <Codex />}
        </main>
      </div>

      {isMobile && (
        <>
          {showMoreTabs && (
            <div style={{ position: "fixed", left: "8px", right: "8px", bottom: `${NAV_HEIGHT_MOBILE + 8}px`, zIndex: 5001, background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "8px", boxShadow: "0 14px 30px var(--color-shadow, rgba(15,23,42,0.18))", display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "6px" }}>
              {mobileSecondaryTabs.map(t => (
                <button
                  key={t}
                  onClick={() => {
                    dispatch({ type: "SET_TAB", tab: t });
                    setShowMoreTabs(false);
                  }}
                  style={{ border: "1px solid var(--color-border-primary, #e2e8f0)", background: state.currentTab === t ? "var(--color-background-info, #eef2ff)" : "var(--color-background-secondary, #fff)", color: "var(--color-text-primary, #1e293b)", borderRadius: "10px", padding: "8px 6px", fontSize: "0.68rem", fontWeight: "900", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", position: "relative" }}
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
                <button key={t} onClick={() => { dispatch({ type: "SET_TAB", tab: t }); setShowMoreTabs(false); }} style={{ flex: 1, minWidth: "56px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "2px", background: isActive ? "var(--color-background-info, #f1f5f9)" : "transparent", border: "none", outline: "none", position: "relative", paddingTop: "5px" }}>
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
            <button onClick={() => setShowMoreTabs(current => !current)} style={{ flex: 1, minWidth: "56px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "2px", background: activeTabInMore || showMoreTabs ? "var(--color-background-info, #f1f5f9)" : "transparent", border: "none", outline: "none", color: "var(--color-text-primary, #1e293b)", fontWeight: "900", position: "relative", paddingTop: "5px" }}>
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

function OfflineMetric({ label, value, color }) {
  return (
    <div style={{ background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "10px", padding: "6px 8px", display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", fontWeight: "800", marginBottom: "3px" }}>{label}</span>
      <span style={{ fontSize: "0.84rem", fontWeight: "900", color }}>{value}</span>
    </div>
  );
}

function HeaderResourcePill({ label, value, color, borderColor, background }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 9px",
        borderRadius: "999px",
        border: `1px solid ${borderColor}`,
        background,
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.78rem", fontWeight: "900", color, lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}
