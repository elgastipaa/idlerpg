import React, { useEffect, useState } from "react";
import { calcStats } from "../engine/combat/statEngine";
import { getClassBuildStatGroups } from "../utils/classBuildStats";

const UPGRADES_UI = [
  { id: "damage", name: "Fuerza", description: "+2% dano total", baseCost: 180, costMultiplier: 1.18, maxLevel: 50, icon: "?" },
  { id: "maxHp", name: "Vitalidad", description: "+3.5% HP maximo", baseCost: 200, costMultiplier: 1.18, maxLevel: 50, icon: "?" },
  { id: "critChance", name: "Precision", description: "+0.4% prob. critico", baseCost: 260, costMultiplier: 1.3, maxLevel: 30, icon: "?" },
  { id: "goldBonus", name: "Codicia", description: "+1 oro por victoria", baseCost: 220, costMultiplier: 1.16, maxLevel: 40, icon: "$" },
  { id: "xpBonus", name: "Sabiduria", description: "+1.5% XP ganada", baseCost: 240, costMultiplier: 1.18, maxLevel: 40, icon: "XP" },
  { id: "attackSpeed", name: "Celeridad", description: "+0.7% vel. ataque", baseCost: 320, costMultiplier: 1.34, maxLevel: 25, icon: "?" },
];

export default function Skills({ state, dispatch }) {
  const { player } = state;
  const playerUpgrades = player.upgrades || {};
  const computedStats = calcStats(player);
  const buildGroups = getClassBuildStatGroups(player.class, computedStats);
  const classLabel = player.class ? `${player.class.charAt(0).toUpperCase()}${player.class.slice(1)}` : "Clase";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section>
        <header style={headerStyle}>
          <h2 style={titleStyle}>Atributos</h2>
          <span style={{ color: "#64748b", fontWeight: "900", fontSize: "0.72rem" }}>Costos en oro</span>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
          {UPGRADES_UI.map(up => {
            const currentLevel = playerUpgrades[up.id] || 0;
            const isMaxed = currentLevel >= up.maxLevel;
            const cost = Math.floor(up.baseCost * Math.pow(up.costMultiplier, currentLevel));
            const canAfford = player.gold >= cost;
            const progress = (currentLevel / up.maxLevel) * 100;

            return (
              <div key={up.id} style={upgradeCardStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "900", fontSize: "0.85rem", color: "var(--color-text-primary, #1e293b)" }}>{up.icon} {up.name}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: "bold", color: isMaxed ? "#f59e0b" : "#94a3b8" }}>
                      {currentLevel} / {up.maxLevel}
                    </span>
                  </div>
                  <div style={progressBg}>
                    <div style={{ ...progressFill, width: `${progress}%`, background: isMaxed ? "#f59e0b" : "#1D9E75" }} />
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "0.7rem", color: "#64748b", lineHeight: "1.2" }}>{up.description}</p>
                </div>

                <button
                  disabled={!canAfford || isMaxed}
                  onClick={() => dispatch({ type: "UPGRADE_PLAYER", upgradeId: up.id })}
                  style={{
                    ...btnUpgradeStyle,
                    background: isMaxed ? "transparent" : canAfford ? "#1D9E75" : "#f1f5f9",
                    color: isMaxed ? "#f59e0b" : canAfford ? "white" : "#94a3b8",
                    border: isMaxed ? "2px solid #f59e0b" : "none",
                  }}
                >
                  {isMaxed ? "MAX" : `${cost} g`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {buildGroups.length > 0 && (
        <section>
          <header style={headerStyle}>
            <h2 style={titleStyle}>Lectura actual</h2>
            <span style={{ color: "#64748b", fontWeight: "900", fontSize: "0.72rem" }}>
              {classLabel}
            </span>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
            {buildGroups.map(group => (
              <div key={group.id} style={upgradeCardStyle}>
                <div style={{ width: "100%" }}>
                  <div style={{ fontSize: "0.62rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900", marginBottom: "8px" }}>
                    {group.label}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                    {group.entries.map(entry => (
                      <div key={entry.key} style={{ background: "var(--color-background-tertiary, #f1f5f9)", borderRadius: "10px", border: "1px solid var(--color-border-primary, #e2e8f0)", padding: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "0.54rem", color: "#64748b", textTransform: "uppercase", fontWeight: "900" }}>{entry.label}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900", marginTop: "4px" }}>{entry.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.2rem",
  borderBottom: "2px solid var(--color-background-tertiary, #f1f5f9)",
  paddingBottom: "0.6rem",
};

const titleStyle = {
  margin: 0,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: "900",
  color: "#64748b",
};

const upgradeCardStyle = {
  background: "var(--color-background-secondary, #ffffff)",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  boxShadow: "0 1px 2px var(--color-shadow, rgba(0,0,0,0.05))",
};

const progressBg = {
  width: "100%",
  height: "6px",
  background: "var(--color-background-tertiary, #f1f5f9)",
  borderRadius: "3px",
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
};

const btnUpgradeStyle = {
  borderRadius: "8px",
  padding: "10px",
  fontSize: "0.75rem",
  fontWeight: "900",
  cursor: "pointer",
  minWidth: "85px",
  textAlign: "center",
  border: "none",
  transition: "transform 0.1s",
};
