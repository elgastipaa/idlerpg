import React, { useEffect, useMemo, useState } from "react";
import { CLASSES } from "../data/classes";
import { xpRequired } from "../engine/leveling";
import { getPlayerBuildTag } from "../utils/buildIdentity";
import { getRarityColor } from "../constants/rarity";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
  formatItemNumber as formatNumber,
  formatItemStatValue as formatStatValue,
  getUpgradeDisplay,
  formatImplicitSummary,
  getPrioritizedStatEntries,
  formatEconomySummary,
  getWorkedLabel,
} from "../utils/itemPresentation";

function getRequirementText(unlockCondition = {}) {
  if (unlockCondition.stat === "kills") return `${unlockCondition.value} kills`;
  if (unlockCondition.stat === "level") return `Nivel ${unlockCondition.value}`;
  if (unlockCondition.stat === "gold") return `${unlockCondition.value} oro`;
  return "Sin requisito";
}

function canUnlockSpec(spec, player, kills) {
  const unlockCondition = spec.unlockCondition || {};
  if (unlockCondition.stat === "kills") return kills >= unlockCondition.value;
  if (unlockCondition.stat === "level") return player.level >= unlockCondition.value;
  if (unlockCondition.stat === "gold") return (player.gold || 0) >= unlockCondition.value;
  return true;
}

export default function Character({ player, dispatch, state }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const kills = state?.stats?.kills || 0;
  const selectedClass = useMemo(() => CLASSES.find(clase => clase.id === player.class) || null, [player.class]);
  const availableSpecs = selectedClass?.specializations || [];
  const buildTag = useMemo(() => (player.class ? getPlayerBuildTag(player) : null), [player]);

  if (!player.class) {
    return (
      <div style={{ padding: isMobile ? "1rem" : "1.5rem", maxWidth: "800px", margin: "0 auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
        <header style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ margin: 0, fontSize: isMobile ? "1.4rem" : "1.7rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>Elige tu Senda</div>
          <p style={{ color: "#D85A30", fontWeight: "bold", fontSize: "0.85rem", marginTop: "8px" }}>Esta eleccion es permanente.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
          {CLASSES.map(clase => (
            <div
              key={clase.id}
              onClick={() => dispatch({ type: "SELECT_CLASS", classId: clase.id })}
              style={{
                background: "var(--color-background-secondary, #ffffff)",
                padding: isMobile ? "1.2rem" : "1.5rem",
                borderRadius: "12px",
                border: "1px solid var(--color-border-primary, #e2e8f0)",
                cursor: "pointer",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "transform 0.1s",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>{clase.icon || "?"}</div>
              <div style={{ margin: "0 0 5px 0", fontSize: "1.1rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>{clase.name}</div>
              <span style={{ fontSize: "0.65rem", background: "#534AB7", color: "#ffffff", padding: "3px 10px", borderRadius: "10px", fontWeight: "bold", textTransform: "uppercase" }}>{clase.playstyle || "Clase"}</span>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary, #64748b)", marginTop: "12px", lineHeight: "1.4" }}>{clase.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hpPercentage = Math.max(0, Math.min((player.hp / Math.max(1, player.maxHp || 1)) * 100, 100));
  const xpNextLevel = xpRequired(player.level);
  const xpPercentage = Math.min((player.xp / Math.max(1, xpNextLevel)) * 100, 100);
  const modifiers = [
    { val: player.damagePct, label: `+${Math.round((player.damagePct || 0) * 100)}% dano`, color: "#1D9E75" },
    { val: player.hpPct, label: `+${Math.round((player.hpPct || 0) * 100)}% vida`, color: "#1D9E75" },
    { val: player.flatGold, label: `+${formatNumber(player.flatGold || 0)} oro/kill`, color: "#f59e0b" },
    { val: player.xpPct, label: `+${Math.round((player.xpPct || 0) * 100)}% XP`, color: "#534AB7" },
    { val: player.flatCrit, label: `+${Math.round((player.flatCrit || 0) * 100)}% crit`, color: "#D85A30" },
  ].filter(modifier => modifier.val > 0);

  const statTiles = [
    { label: "Dano", value: formatNumber(player.damage || 0) },
    { label: "Defensa", value: formatNumber(player.defense || 0) },
    { label: "Critico", value: `${((player.critChance || 0) * 100).toFixed(1)}%` },
    { label: "Vida Max", value: formatNumber(player.maxHp || 0) },
    { label: "Regen", value: formatNumber(player.regen || 0) },
    { label: "Nivel", value: formatNumber(player.level || 1) },
  ];

  return (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <header style={headerCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em" }}>Heroe</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              <span style={classChipStyle}>{selectedClass?.icon || "?"} {player.class}</span>
              {player.specialization && <span style={specChipStyle}>{selectedClass?.specializations?.find(spec => spec.id === player.specialization)?.name || player.specialization}</span>}
              {buildTag?.name && <span style={{ ...buildChipStyle, color: buildTag.color || "#1e293b", borderColor: `${buildTag.color || "#534AB7"}33` }}>{buildTag.name}</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>Nivel {formatNumber(player.level || 1)}</div>
            <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "2px" }}>{formatNumber(kills)} kills</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px", marginTop: "12px" }}>
          <ProgressCard label="Vida" value={`${formatNumber(Math.floor(player.hp || 0))} / ${formatNumber(player.maxHp || 0)}`} percentage={hpPercentage} tone={hpPercentage > 30 ? "var(--tone-success, #1D9E75)" : "var(--tone-danger, #D85A30)"} />
          <ProgressCard label="Experiencia" value={`${formatNumber(Math.floor(player.xp || 0))} / ${formatNumber(xpNextLevel)}`} percentage={xpPercentage} tone="var(--tone-accent, #534AB7)" />
        </div>
      </header>

      <section style={sectionCardStyle}>
        <div style={sectionTitleStyle}>Lectura Rapida</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))", gap: "8px" }}>
          {statTiles.map(tile => <StatCard key={tile.label} label={tile.label} value={tile.value} />)}
        </div>
        {modifiers.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
            {modifiers.map(modifier => (
              <span key={modifier.label} style={{ fontSize: "0.62rem", fontWeight: "900", color: modifier.color, background: `${modifier.color}15`, padding: "3px 8px", borderRadius: "999px", border: `1px solid ${modifier.color}22` }}>
                {modifier.label}
              </span>
            ))}
          </div>
        )}
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionTitleStyle}>Equipo Actual</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
          <EquipmentCard label="Arma" item={player.equipment.weapon} />
          <EquipmentCard label="Armadura" item={player.equipment.armor} />
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
        <div style={sectionCardStyle}>
          <div style={sectionTitleStyle}>Especializacion</div>
          {player.specialization ? (
            <>
              <div style={{ fontSize: "0.9rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>{selectedClass?.specializations?.find(spec => spec.id === player.specialization)?.name || player.specialization}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.4 }}>
                {selectedClass?.specializations?.find(spec => spec.id === player.specialization)?.description || "Tu rama actual ya define el ritmo de esta build."}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {availableSpecs.map(spec => {
                const canUnlock = canUnlockSpec(spec, player, kills);
                const reqText = getRequirementText(spec.unlockCondition);
                return (
                  <div key={spec.id} style={{ background: canUnlock ? "var(--color-background-tertiary, #f8fafc)" : "var(--tone-warning-soft, #fff7ed)", border: `1px solid ${canUnlock ? "var(--color-border-primary, #e2e8f0)" : "#fed7aa"}`, borderRadius: "10px", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.76rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>{spec.name}</div>
                      <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.35, marginTop: "3px" }}>{spec.description}</div>
                      <div style={{ fontSize: "0.6rem", color: canUnlock ? "var(--tone-success, #1D9E75)" : "var(--tone-danger, #D85A30)", fontWeight: "900", marginTop: "4px" }}>Req: {reqText}</div>
                    </div>
                    <button
                      disabled={!canUnlock}
                      onClick={() => dispatch({ type: "SELECT_SPECIALIZATION", specId: spec.id })}
                      style={{ background: canUnlock ? "var(--tone-success, #1D9E75)" : "var(--color-background-tertiary, #f1f5f9)", color: canUnlock ? "#fff" : "var(--color-text-tertiary, #94a3b8)", border: "none", padding: "8px 10px", borderRadius: "8px", fontSize: "0.66rem", fontWeight: "900", cursor: canUnlock ? "pointer" : "not-allowed", flexShrink: 0 }}
                    >
                      Elegir
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={sectionCardStyle}>
          <div style={sectionTitleStyle}>Identidad de Build</div>
          <div style={{ fontSize: "0.92rem", color: buildTag?.color || "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>{buildTag?.name || "Warrior en desarrollo"}</div>
          <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.4 }}>{buildTag?.description || "Todavia no hay suficiente senal de equipo y talentos para definir una identidad fuerte."}</div>
        </div>
      </section>
    </div>
  );
}

function ProgressCard({ label, value, percentage, tone }) {
  return (
    <div style={{ background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: "6px", fontWeight: "900", gap: "8px" }}>
        <span>{label}</span>
        <span style={{ color: "var(--color-text-secondary, #64748b)" }}>{value}</span>
      </div>
      <div style={{ width: "100%", height: "8px", background: "var(--color-border-primary, #e2e8f0)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: tone, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: "var(--color-background-tertiary, #f8fafc)", padding: "10px 8px", borderRadius: "12px", textAlign: "center", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
      <div style={{ margin: 0, fontSize: "0.55rem", color: "var(--color-text-secondary, #64748b)", textTransform: "uppercase", fontWeight: "900" }}>{label}</div>
      <div style={{ margin: "3px 0 0", fontSize: "0.92rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{value}</div>
    </div>
  );
}

function EquipmentCard({ label, item }) {
  if (!item) {
    return (
      <div style={{ ...equipmentCardStyle, border: "1px dashed var(--color-border-primary, #cbd5e1)", justifyContent: "center", minHeight: "110px" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sin {label}</div>
      </div>
    );
  }

  const topStats = getPrioritizedStatEntries(item.bonus || {}, 3);
  const workedLabel = getWorkedLabel(item);
  const hasPerfect = (item.affixes || []).some(affix => affix.perfectRoll);
  const implicitSummary = formatImplicitSummary(item);
  const economySummary = formatEconomySummary(item.bonus || {});

  return (
    <div style={{ ...equipmentCardStyle, borderLeft: `4px solid ${getRarityColor(item.rarity)}` }}>
      {hasPerfect && <div style={{ position: "absolute", top: "10px", right: "12px", fontSize: "0.82rem", color: "var(--tone-warning, #f59e0b)" }}>★</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900", lineHeight: 1.2, marginTop: "3px" }}>{item.name}</div>
          <div style={{ fontSize: "0.58rem", color: getRarityColor(item.rarity), textTransform: "uppercase", fontWeight: "800", marginTop: "3px" }}>
            {item.rarity}{getUpgradeDisplay(item.level) ? ` · ${getUpgradeDisplay(item.level)}` : ""}{item.familyName ? ` · ${item.familyName}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: "4px", flexShrink: 0 }}>
          <div style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", fontWeight: "900" }}>Rating</div>
          <div style={{ fontSize: "0.84rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{formatNumber(item.rating || 0)}</div>
        </div>
      </div>

      {topStats.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {topStats.map(([key, value]) => (
            <span key={key} style={statPillStyle}>
              {STAT_LABELS[key] || key} <strong style={{ color: "var(--color-text-primary, #1e293b)" }}>+{formatStatValue(key, value)}</strong>
            </span>
          ))}
        </div>
      )}

      {economySummary && <div style={{ fontSize: "0.6rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>Eco: {economySummary}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", fontSize: "0.6rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>
        <span>{(item.affixes || []).length} affixes</span>
        {workedLabel && <span style={workedLabelStyle}>{workedLabel}</span>}
      </div>

      {implicitSummary && <div style={{ fontSize: "0.62rem", color: "var(--color-text-info, #4338ca)", fontWeight: "800" }}>Implicit: {implicitSummary}</div>}
    </div>
  );
}

const headerCardStyle = {
  background: "var(--color-background-secondary, #fff)",
  borderRadius: "16px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  padding: "12px",
  boxShadow: "0 2px 6px var(--color-shadow, rgba(0,0,0,0.04))",
};

const sectionCardStyle = {
  background: "var(--color-background-secondary, #fff)",
  borderRadius: "16px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  padding: "12px",
  boxShadow: "0 2px 6px var(--color-shadow, rgba(0,0,0,0.04))",
};

const sectionTitleStyle = {
  fontSize: "0.62rem",
  color: "var(--color-text-tertiary, #94a3b8)",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "10px",
};

const classChipStyle = {
  fontSize: "0.62rem",
  background: "var(--tone-accent, #534AB7)",
  color: "#ffffff",
  padding: "4px 10px",
  borderRadius: "999px",
  fontWeight: "900",
  textTransform: "uppercase",
};

const specChipStyle = {
  fontSize: "0.6rem",
  background: "var(--tone-danger-soft, #fff1f2)",
  color: "var(--tone-danger, #D85A30)",
  padding: "4px 10px",
  borderRadius: "999px",
  fontWeight: "900",
  textTransform: "uppercase",
  border: "1px solid rgba(216,90,48,0.2)",
};

const buildChipStyle = {
  fontSize: "0.6rem",
  background: "var(--tone-success-soft, #ecfdf5)",
  padding: "4px 10px",
  borderRadius: "999px",
  fontWeight: "900",
  border: "1px solid rgba(29,158,117,0.2)",
};

const equipmentCardStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  background: "var(--color-background-tertiary, #f8fafc)",
  borderRadius: "14px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  padding: "12px",
  minWidth: 0,
};

const statPillStyle = {
  fontSize: "0.62rem",
  color: "var(--color-text-secondary, #64748b)",
  background: "var(--color-background-secondary, #fff)",
  padding: "3px 8px",
  borderRadius: "999px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
};

const workedLabelStyle = {
  fontSize: "0.56rem",
  color: "var(--tone-accent, #4338ca)",
  background: "var(--tone-accent-soft, #eef2ff)",
  border: "1px solid var(--tone-accent, #c7d2fe)",
  borderRadius: "999px",
  padding: "2px 6px",
  fontWeight: "900",
  letterSpacing: "0.03em",
};
