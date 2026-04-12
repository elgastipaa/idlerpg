import React, { useEffect, useState } from "react";
import { SKILLS } from "../data/skills";
import { calcStats } from "../engine/combat/statEngine";
import { getEffectiveSkillCooldown } from "../engine/skills/skillEngine";

const UPGRADES_UI = [
  { id: "damage", name: "Fuerza", description: "+5% dano total", baseCost: 180, costMultiplier: 1.18, maxLevel: 50, icon: "?" },
  { id: "maxHp", name: "Vitalidad", description: "+8% HP maximo", baseCost: 200, costMultiplier: 1.18, maxLevel: 50, icon: "?" },
  { id: "critChance", name: "Precision", description: "+1% prob. critico", baseCost: 260, costMultiplier: 1.3, maxLevel: 30, icon: "?" },
  { id: "goldBonus", name: "Codicia", description: "+1 oro por victoria", baseCost: 220, costMultiplier: 1.16, maxLevel: 40, icon: "$" },
  { id: "xpBonus", name: "Sabiduria", description: "+3% XP ganada", baseCost: 240, costMultiplier: 1.18, maxLevel: 40, icon: "XP" },
  { id: "attackSpeed", name: "Celeridad", description: "+1.5% vel. ataque", baseCost: 320, costMultiplier: 1.34, maxLevel: 25, icon: "?" },
];

export default function Skills({ state, dispatch }) {
  const { player, combat } = state;
  const playerUpgrades = player.upgrades || {};
  const skillCooldowns = combat.skillCooldowns || {};
  const playerStats = calcStats(player);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const availableSkills = SKILLS.filter(skill => {
    if (skill.classId !== player.class) return false;
    if (skill.specId && skill.specId !== player.specialization) return false;
    return true;
  });

  return (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem", display: "flex", flexDirection: "column", gap: "2rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section>
        <header style={headerStyle}>
          <h2 style={titleStyle}>Atributos Pasivos</h2>
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

      <section>
        <header style={headerStyle}>
          <h2 style={titleStyle}>Habilidades Activas</h2>
          <span style={{ color: "#64748b", fontWeight: "900", fontSize: "0.8rem" }}>{availableSkills.length}</span>
        </header>

        {availableSkills.length === 0 ? (
          <div style={emptyStateStyle}>Todavia no tenes skills disponibles para tu clase.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
            {availableSkills.map(skill => {
              const cooldown = skillCooldowns[skill.id] || 0;
              const isReady = cooldown === 0;
              const effectiveCooldown = getEffectiveSkillCooldown(skill, playerStats);
              const baseCooldown = skill.cooldown || 0;
              const cooldownReduced = effectiveCooldown < baseCooldown;

              return (
                <div
                  key={skill.id}
                  style={{
                    ...skillCardStyle,
                    background: "var(--color-background-secondary, #ffffff)",
                    border: `1px solid ${isReady ? "#d1fae5" : "var(--color-border-primary, #e2e8f0)"}`,
                    boxShadow: "0 1px 2px var(--color-shadow, rgba(0,0,0,0.05))",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px" }}>
                    <div>
                      <div style={{ fontWeight: "900", fontSize: "0.9rem", color: "var(--color-text-primary, #1e293b)" }}>{skill.name}</div>
                      <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#64748b", lineHeight: "1.25" }}>
                        {skill.description}
                      </p>
                    </div>
                    <span style={readyBadgeStyle}>{isReady ? "LISTA" : `${cooldown}s`}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", gap: "10px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "bold" }}>
                      CD: {effectiveCooldown}s{cooldownReduced ? ` (base ${baseCooldown}s)` : ""}
                    </span>
                    <button
                      onClick={() => dispatch({ type: "USE_SKILL", skillId: skill.id })}
                      disabled={!isReady}
                      style={{
                        ...btnSkillStyle,
                        background: isReady ? "#1e293b" : "#9ca3af",
                        width: "auto",
                        padding: "10px 14px",
                      }}
                    >
                      USAR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

const skillCardStyle = {
  padding: "16px",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "all 0.2s ease",
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

const btnSkillStyle = {
  border: "none",
  borderRadius: "8px",
  padding: "12px",
  fontSize: "0.75rem",
  fontWeight: "900",
  color: "white",
  cursor: "pointer",
  width: "100%",
  letterSpacing: "0.05em",
};

const readyBadgeStyle = {
  fontSize: "0.6rem",
  background: "#534AB7",
  color: "white",
  padding: "2px 6px",
  borderRadius: "4px",
  fontWeight: "900",
};

const emptyStateStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  padding: "3rem 1rem",
  textAlign: "center",
  borderRadius: "12px",
  border: "2px dashed var(--color-border-primary, #e2e8f0)",
  color: "#94a3b8",
  fontSize: "0.85rem",
  fontWeight: "bold",
};
