import React, { useEffect, useState } from "react";
import { calcStats } from "../engine/combat/statEngine";
import { getClassBuildStatGroups } from "../utils/classBuildStats";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";

const UPGRADES_UI = [
  { id: "damage", name: "Fuerza", description: "+2% dano total", baseCost: 180, costMultiplier: 1.18, maxLevel: 50, icon: "?" },
  { id: "maxHp", name: "Vitalidad", description: "+3.5% HP maximo", baseCost: 200, costMultiplier: 1.18, maxLevel: 50, icon: "?" },
  { id: "critChance", name: "Precision", description: "+0.4% prob. critico", baseCost: 260, costMultiplier: 1.3, maxLevel: 30, icon: "?" },
  { id: "attackSpeed", name: "Celeridad", description: "+0.7% vel. ataque", baseCost: 320, costMultiplier: 1.34, maxLevel: 25, icon: "?" },
  { id: "goldBonus", name: "Codicia", description: "+1 oro por victoria", baseCost: 220, costMultiplier: 1.16, maxLevel: 40, icon: "$" },
  { id: "xpBonus", name: "Sabiduria", description: "+1.5% XP ganada", baseCost: 240, costMultiplier: 1.18, maxLevel: 40, icon: "XP" },
];

const ATTRIBUTE_SECTIONS = [
  {
    id: "combat",
    label: "Combate",
    description: "Prioridad directa para dano, aguante y ritmo.",
    upgradeIds: ["damage", "maxHp", "critChance", "attackSpeed"],
  },
  {
    id: "economy",
    label: "Economia",
    description: "Oro y XP para acelerar la cuenta sin tocar combate directo.",
    upgradeIds: ["goldBonus", "xpBonus"],
  },
];

export default function Skills({ state, dispatch }) {
  const { player } = state;
  const onboardingStep = state?.onboarding?.step || null;
  const spotlightAttributes = onboardingStep === ONBOARDING_STEPS.SPEND_ATTRIBUTE;
  const playerUpgrades = player.upgrades || {};
  const computedStats = calcStats(player);
  const buildGroups = getClassBuildStatGroups(player.class, computedStats);
  const classLabel = player.class ? `${player.class.charAt(0).toUpperCase()}${player.class.slice(1)}` : "Clase";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const upgradeSections = ATTRIBUTE_SECTIONS.map(section => ({
    ...section,
    upgrades: section.upgradeIds
      .map(id => UPGRADES_UI.find(entry => entry.id === id))
      .filter(Boolean),
  }));

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (!spotlightAttributes) return undefined;
    let cancelled = false;
    let attempt = 0;

    const scrollToForceUpgrade = () => {
      if (cancelled) return;
      const target = document.querySelector('[data-onboarding-target="upgrade-attribute"]');
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      attempt += 1;
      if (attempt < 8) {
        window.setTimeout(scrollToForceUpgrade, 80);
      }
    };

    const timer = window.setTimeout(scrollToForceUpgrade, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [spotlightAttributes]);

  return (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <style>{`
        @keyframes skillsSpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(29,158,117,0.24); }
          70% { box-shadow: 0 0 0 10px rgba(29,158,117,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
      `}</style>
      {buildGroups.length > 0 && (
        <section>
          <header style={headerStyle}>
            <h2 style={titleStyle}>Lectura actual</h2>
            <span style={{ color: "#64748b", fontWeight: "900", fontSize: "0.72rem" }}>
              {classLabel}
            </span>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
            {buildGroups.map(group => (
              <div key={group.id} style={readingGroupStyle}>
                <div style={{ width: "100%" }}>
                  <div style={{ fontSize: "0.58rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900", marginBottom: "8px" }}>
                    {group.label}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                    {group.entries.map(entry => (
                      <div key={entry.key} style={readingEntryStyle}>
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

      <section>
        <header style={headerStyle}>
          <h2 style={titleStyle}>Atributos</h2>
          <span style={{ color: "#64748b", fontWeight: "900", fontSize: "0.72rem" }}>Costos en oro</span>
        </header>

        <div style={{ display: "grid", gap: "12px" }}>
          {upgradeSections.map(section => (
            <section key={section.id} style={attributeSectionStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "900" }}>
                    {section.label}
                  </div>
                  <div style={{ fontSize: "0.66rem", color: "#94a3b8", marginTop: "3px", lineHeight: 1.35 }}>
                    {section.description}
                  </div>
                </div>
                <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: "900" }}>
                  {section.upgrades.length} atributo{section.upgrades.length === 1 ? "" : "s"}
                </div>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {section.upgrades.map(up => {
                  const currentLevel = playerUpgrades[up.id] || 0;
                  const isMaxed = currentLevel >= up.maxLevel;
                  const cost = Math.floor(up.baseCost * Math.pow(up.costMultiplier, currentLevel));
                  const canAfford = player.gold >= cost;
                  const spotlightUpgrade = spotlightAttributes && up.id === "damage" && !isMaxed;
                  const lockedByTutorial = spotlightAttributes && up.id !== "damage";
                  const progress = (currentLevel / up.maxLevel) * 100;

                  return (
                    <div
                      key={up.id}
                      data-onboarding-target={spotlightUpgrade ? "upgrade-attribute-card" : undefined}
                      style={{
                        ...attributeRowStyle,
                        position: spotlightUpgrade ? "relative" : "static",
                        zIndex: spotlightUpgrade ? 2 : 1,
                        boxShadow: spotlightUpgrade
                          ? "0 0 0 2px rgba(29,158,117,0.16), 0 12px 28px rgba(29,158,117,0.14)"
                          : attributeRowStyle.boxShadow,
                        animation: spotlightUpgrade ? "skillsSpotlightPulse 1600ms ease-in-out infinite" : "none",
                        opacity: lockedByTutorial ? 0.42 : 1,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: "900", fontSize: "0.78rem", color: "var(--color-text-primary, #1e293b)" }}>{up.icon} {up.name}</span>
                          <span style={{ fontSize: "0.62rem", fontWeight: "900", color: isMaxed ? "#f59e0b" : "#94a3b8" }}>
                            {currentLevel}/{up.maxLevel}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.64rem", color: "#64748b", marginTop: "4px", lineHeight: 1.3 }}>{up.description}</div>
                        <div style={{ ...progressBg, marginTop: "8px", height: "5px" }}>
                          <div style={{ ...progressFill, width: `${progress}%`, background: isMaxed ? "#f59e0b" : "#1D9E75" }} />
                        </div>
                      </div>

                      <button
                        disabled={lockedByTutorial || !canAfford || isMaxed}
                        onClick={() => dispatch({ type: "UPGRADE_PLAYER", upgradeId: up.id })}
                        data-onboarding-target={spotlightUpgrade ? "upgrade-attribute" : undefined}
                        style={{
                          ...btnUpgradeStyle,
                          minWidth: "92px",
                          background: isMaxed ? "transparent" : canAfford ? "#1D9E75" : "#f1f5f9",
                          color: isMaxed ? "#f59e0b" : canAfford ? "white" : "#94a3b8",
                          border: isMaxed ? "2px solid #f59e0b" : "none",
                          position: spotlightUpgrade ? "relative" : "static",
                          zIndex: spotlightUpgrade ? 3 : 1,
                          boxShadow: spotlightUpgrade ? "0 0 0 2px rgba(29,158,117,0.18), 0 10px 22px rgba(29,158,117,0.24)" : "none",
                          cursor: lockedByTutorial ? "not-allowed" : btnUpgradeStyle.cursor,
                          opacity: lockedByTutorial ? 0.55 : 1,
                        }}
                      >
                        {isMaxed ? "MAX" : `${cost} g`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
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

const readingGroupStyle = {
  background: "var(--color-background-secondary, #ffffff)",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  boxShadow: "0 1px 2px var(--color-shadow, rgba(0,0,0,0.05))",
};

const readingEntryStyle = {
  background: "var(--color-background-tertiary, #f1f5f9)",
  borderRadius: "10px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  padding: "8px",
  textAlign: "center",
};

const attributeSectionStyle = {
  background: "var(--color-background-secondary, #ffffff)",
  borderRadius: "12px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  padding: "12px",
  display: "grid",
  gap: "10px",
  boxShadow: "0 1px 2px var(--color-shadow, rgba(0,0,0,0.05))",
};

const attributeRowStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "12px",
  alignItems: "center",
  boxShadow: "0 1px 2px var(--color-shadow, rgba(0,0,0,0.04))",
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
