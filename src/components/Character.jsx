import React, { useEffect, useMemo } from "react";
import useViewport from "../hooks/useViewport";
import { CLASSES } from "../data/classes";
import { xpRequired } from "../engine/leveling";
import { calcStats } from "../engine/combat/statEngine";
import { getOnboardingStepInteractionMode, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import { getPlayerBuildTag } from "../utils/buildIdentity";
import {
  formatItemNumber as formatNumber,
} from "../utils/itemPresentation";

function getRequirementText(unlockCondition = {}) {
  if (unlockCondition.stat === "kills") return `${unlockCondition.value} bajas`;
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

function formatPercent(value, digits = 1) {
  return `${(Number(value || 0) * 100).toFixed(digits)}%`;
}

function formatRange(minValue = 1, maxValue = 1) {
  return `${Math.round((minValue || 1) * 100)}-${Math.round((maxValue || 1) * 100)}%`;
}

function buildCharacterQuickRows(classId, stats = {}) {
  const baseRows = [
    { label: "Dano", value: formatNumber(stats.damage || 0) },
    { label: "Defensa", value: formatNumber(stats.defense || 0) },
    { label: "Critico", value: formatPercent(stats.critChance || 0) },
    { label: "Vida Max", value: formatNumber(stats.maxHp || 0) },
    { label: "Regen", value: formatNumber(stats.regen || 0) },
  ];

  const warriorRows = [
    (stats.attackSpeed || 0) > 0 ? { label: "Velocidad", value: formatPercent(stats.attackSpeed || 0) } : null,
    (stats.multiHitChance || 0) > 0 ? { label: "Multi-hit", value: formatPercent(stats.multiHitChance || 0) } : null,
    (stats.lifesteal || 0) > 0 ? { label: "Robo de vida", value: formatPercent(stats.lifesteal || 0) } : null,
    (stats.blockChance || 0) > 0 ? { label: "Bloqueo", value: formatPercent(stats.blockChance || 0) } : null,
    (stats.bleedChance || 0) > 0 ? { label: "Sangrado", value: formatPercent(stats.bleedChance || 0) } : null,
    (stats.fractureChance || 0) > 0 ? { label: "Fractura", value: formatPercent(stats.fractureChance || 0) } : null,
  ].filter(Boolean);

  const mageRows = [
    { label: "Rango de dano", value: formatRange(stats.damageRangeMin, stats.damageRangeMax) },
    (stats.perfectCast || 0) > 0 ? { label: "Perfect Cast", value: "Sin multi-hit · rango estable" } : null,
    (stats.multiHitChance || 0) > 0 ? { label: "Multi-hit", value: formatPercent(stats.multiHitChance || 0) } : null,
    (stats.markChance || 0) > 0 ? { label: "Marca", value: formatPercent(stats.markChance || 0) } : null,
    (stats.markEffectPerStack || 0) > 0 ? { label: "Potencia Marca", value: formatPercent(stats.markEffectPerStack || 0) } : null,
    (stats.flowBonusMult || 1) > 1 ? { label: "Flow", value: formatPercent((stats.flowBonusMult || 1) - 1) } : null,
    (stats.markTransferPct || 0) > 0 ? { label: "Time Loop", value: formatPercent(stats.markTransferPct || 0) } : null,
    (stats.absoluteControlMarkedMult || 1) > 1
      ? { label: "Control Absoluto", value: `Marcado +${Math.round(((stats.absoluteControlMarkedMult || 1) - 1) * 100)}% / Sin marca -${Math.round((1 - (stats.absoluteControlUnmarkedMult || 1)) * 100)}%` }
      : null,
    (stats.controlMastery || 0) > 0 ? { label: "Control", value: formatPercent(stats.controlMastery || 0) } : null,
    (stats.volatileCasting || 0) > 0 ? { label: "Volatilidad", value: `Activa ${formatNumber(stats.volatileCasting || 0)} · piso mas alto` } : null,
  ].filter(Boolean);

  return [...baseRows, ...(classId === "mage" ? mageRows : warriorRows)];
}

export default function Character({ player, dispatch, state }) {
  const { isMobile, viewportWidth } = useViewport();

  const kills = state?.stats?.kills || 0;
  const selectedClass = useMemo(() => CLASSES.find(clase => clase.id === player.class) || null, [player.class]);
  const availableSpecs = selectedClass?.specializations || [];
  const buildTag = useMemo(() => (player.class ? getPlayerBuildTag(player) : null), [player]);
  const computedStats = useMemo(() => calcStats(player), [player]);
  const onboardingStep = state?.onboarding?.step || null;
  const onboardingMode = getOnboardingStepInteractionMode(onboardingStep, state);
  const specTutorialActive = onboardingStep === ONBOARDING_STEPS.CHOOSE_SPEC;
  const spotlightHeroOverview =
    onboardingStep === ONBOARDING_STEPS.HERO_INTRO && onboardingMode === "forced";
  const tutorialSpecIds = specTutorialActive ? availableSpecs.map(spec => spec.id) : [];
  const isNarrowMobile = isMobile && viewportWidth < 420;

  useEffect(() => {
    if (!specTutorialActive) return undefined;
    let frameId = null;
    const scrollToSpecSection = () => {
      const target = document.querySelector('[data-onboarding-target="choose-spec-card"]');
      if (!(target instanceof HTMLElement)) return;
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    };
    frameId = requestAnimationFrame(scrollToSpecSection);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
    };
  }, [specTutorialActive, tutorialSpecIds.length]);

  const quickReadRows = useMemo(() => buildCharacterQuickRows(player.class, computedStats), [player.class, computedStats]);

  if (!player.class) {
    return (
      <div style={{ padding: isMobile ? "calc(0.92rem * var(--density-scale, 1))" : "calc(1.2rem * var(--density-scale, 1))", maxWidth: "800px", margin: "0 auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
        <header style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ margin: 0, fontSize: isMobile ? "1.4rem" : "1.7rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>Elige tu Senda</div>
          <p style={{ color: "#D85A30", fontWeight: "bold", fontSize: "0.85rem", marginTop: "8px" }}>La clase se reinicia con cada prestigio.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
          {CLASSES.map(clase => (
            <div
              key={clase.id}
              onClick={() => dispatch({ type: "SELECT_CLASS", classId: clase.id })}
              style={{
                background: "var(--color-background-secondary, #ffffff)",
                padding: isMobile
                  ? "calc(0.95rem * var(--density-scale, 1))"
                  : "calc(1.15rem * var(--density-scale, 1))",
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

  const displayedMaxHp = Math.max(1, computedStats.maxHp || player.maxHp || 1);
  const displayedHp = Math.max(0, Math.min(player.hp || displayedMaxHp, displayedMaxHp));
  const hpPercentage = Math.max(0, Math.min((displayedHp / displayedMaxHp) * 100, 100));
  const xpNextLevel = xpRequired(player.level);
  const xpPercentage = Math.min((player.xp / Math.max(1, xpNextLevel)) * 100, 100);
  const currentSpec = selectedClass?.specializations?.find(spec => spec.id === player.specialization) || null;
  const modifiers = [
    { val: player.damagePct, label: `+${Math.round((player.damagePct || 0) * 100)}% dano`, color: "#1D9E75" },
    { val: player.hpPct, label: `+${Math.round((player.hpPct || 0) * 100)}% vida`, color: "#1D9E75" },
    { val: player.flatGold, label: `+${formatNumber(player.flatGold || 0)} oro/kill`, color: "#f59e0b" },
    { val: player.xpPct, label: `+${Math.round((player.xpPct || 0) * 100)}% XP`, color: "#534AB7" },
    { val: player.flatCrit, label: `+${Math.round((player.flatCrit || 0) * 100)}% crit`, color: "#D85A30" },
  ].filter(modifier => modifier.val > 0);

  return (
    <div style={{ padding: isMobile ? "calc(0.9rem * var(--density-scale, 1))" : "calc(1.1rem * var(--density-scale, 1))", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "calc(0.75rem * var(--density-scale, 1))", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <style>{`
        @keyframes chooseSpecPulse {
          0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.2); }
          70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
          100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
        }
      `}</style>
      <header
        data-onboarding-target={spotlightHeroOverview ? "hero-overview" : undefined}
        onClick={() => spotlightHeroOverview && dispatch({ type: "ACK_ONBOARDING_STEP" })}
        style={{
          ...headerCardStyle,
          position: spotlightHeroOverview ? "relative" : "static",
          zIndex: spotlightHeroOverview ? 2 : 1,
          boxShadow: spotlightHeroOverview
            ? "0 0 0 2px rgba(83,74,183,0.18), 0 12px 30px rgba(83,74,183,0.16)"
            : headerCardStyle.boxShadow,
          animation: spotlightHeroOverview ? "chooseSpecPulse 1600ms ease-in-out infinite" : "none",
          cursor: spotlightHeroOverview ? "pointer" : "default",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: "4px" }}>
            <div style={{ fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em" }}>Heroe</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              <span style={classChipStyle}>{selectedClass?.icon || "?"} {player.class}</span>
              {player.specialization && <span style={specChipStyle}>{currentSpec?.name || player.specialization}</span>}
              {buildTag?.name && <span style={{ ...buildChipStyle, color: buildTag.color || "#1e293b", borderColor: `${buildTag.color || "#534AB7"}33` }}>{buildTag.name}</span>}
            </div>
            <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.35 }}>
              {currentSpec?.description || buildTag?.description || "Tu ficha resume la build activa y el estado real de esta run."}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.84rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>Nivel {formatNumber(player.level || 1)}</div>
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "2px" }}>{formatNumber(kills)} bajas</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px", marginTop: "10px" }}>
          <ProgressCard label="Vida" value={`${formatNumber(Math.floor(displayedHp || 0))} / ${formatNumber(displayedMaxHp || 0)}`} percentage={hpPercentage} tone={hpPercentage > 30 ? "var(--tone-success, #1D9E75)" : "var(--tone-danger, #D85A30)"} />
          <ProgressCard label="Experiencia" value={`${formatNumber(Math.floor(player.xp || 0))} / ${formatNumber(xpNextLevel)}`} percentage={xpPercentage} tone="var(--tone-accent, #534AB7)" />
        </div>
      </header>

      <section style={sectionCardStyle}>
        <div style={sectionTitleStyle}>Build actual</div>
        {player.specialization ? (
          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.92rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>
                  {currentSpec?.name || player.specialization}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.4 }}>
                  {currentSpec?.description || "Tu subclase define el enfoque principal de esta run."}
                </div>
              </div>
              <div style={{ minWidth: isMobile ? "100%" : "220px", padding: "10px 12px", borderRadius: "12px", background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
                <div style={{ fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Identidad de build
                </div>
                <div style={{ fontSize: "0.82rem", color: buildTag?.color || "var(--color-text-primary, #1e293b)", fontWeight: "900", marginTop: "4px" }}>
                  {buildTag?.name || "Build en desarrollo"}
                </div>
                <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>
                  {buildTag?.description || "Todavia no hay suficiente senal de equipo y talentos para fijar una identidad fuerte."}
                </div>
              </div>
            </div>
            {modifiers.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {modifiers.map(modifier => (
                  <span key={modifier.label} style={{ fontSize: "0.62rem", fontWeight: "900", color: modifier.color, background: `${modifier.color}15`, padding: "3px 8px", borderRadius: "999px", border: `1px solid ${modifier.color}22` }}>
                    {modifier.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: availableSpecs.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr",
              gap: isNarrowMobile ? "6px" : "8px",
            }}
          >
            {availableSpecs.map(spec => {
              const canUnlock = specTutorialActive || canUnlockSpec(spec, player, kills);
              const reqText = getRequirementText(spec.unlockCondition);
              const spotlightSpec = tutorialSpecIds.includes(spec.id);
              return (
                <div
                  key={spec.id}
                  data-onboarding-target={spotlightSpec ? "choose-spec-card" : undefined}
                  style={{
                    background: canUnlock ? "var(--color-background-tertiary, #f8fafc)" : "var(--tone-warning-soft, #fff7ed)",
                    border: `1px solid ${canUnlock ? "var(--color-border-primary, #e2e8f0)" : "#fed7aa"}`,
                    borderRadius: "10px",
                    padding: specTutorialActive && isNarrowMobile ? "8px" : "10px",
                    display: "grid",
                    gap: specTutorialActive && isNarrowMobile ? "6px" : "8px",
                    position: spotlightSpec ? "relative" : "static",
                    zIndex: spotlightSpec ? 2 : 1,
                    boxShadow: spotlightSpec
                      ? "0 0 0 2px rgba(83,74,183,0.2), 0 0 0 8px rgba(83,74,183,0.08), 0 12px 28px rgba(83,74,183,0.18)"
                      : "none",
                    animation: spotlightSpec ? "chooseSpecPulse 1600ms ease-in-out infinite" : "none",
                    transform: spotlightSpec ? "translateY(-1px)" : "none",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: specTutorialActive && isNarrowMobile ? "0.7rem" : "0.76rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>{spec.name}</div>
                    <div style={{ fontSize: specTutorialActive && isNarrowMobile ? "0.58rem" : "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.35, marginTop: "3px" }}>{spec.description}</div>
                    <div style={{ fontSize: specTutorialActive && isNarrowMobile ? "0.55rem" : "0.6rem", color: canUnlock ? "var(--tone-success, #1D9E75)" : "var(--tone-danger, #D85A30)", fontWeight: "900", marginTop: "4px" }}>
                      {specTutorialActive ? "Tutorial: elige una subclase" : `Req: ${reqText}`}
                    </div>
                  </div>
                  <button
                    disabled={!canUnlock}
                    data-onboarding-target={spotlightSpec ? "choose-spec" : undefined}
                    onClick={() => dispatch({ type: "SELECT_SPECIALIZATION", specId: spec.id })}
                    style={{
                      background: canUnlock ? "var(--tone-success, #1D9E75)" : "var(--color-background-tertiary, #f1f5f9)",
                      color: canUnlock ? "#fff" : "var(--color-text-tertiary, #94a3b8)",
                      border: "none",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      fontSize: "0.66rem",
                      fontWeight: "900",
                      cursor: canUnlock ? "pointer" : "not-allowed",
                      flexShrink: 0,
                      width: "100%",
                      position: spotlightSpec ? "relative" : "static",
                      zIndex: spotlightSpec ? 3 : 1,
                    }}
                  >
                    Elegir
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionTitleStyle}>Lectura Rapida</div>
        <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4, marginBottom: "10px" }}>
          Metricas activas para esta run y esta build. Si una mecanica no participa, no aparece aca.
        </div>
        <div style={tableStyle}>
          {quickReadRows.map((row, index) => (
            <DataRow
              key={row.label}
              label={row.label}
              value={row.value}
              accent={row.accent}
              isLast={index === quickReadRows.length - 1}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProgressCard({ label, value, percentage, tone }) {
  return (
    <div style={{ background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "8px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.66rem", marginBottom: "5px", fontWeight: "900", gap: "8px" }}>
        <span>{label}</span>
        <span style={{ color: "var(--color-text-secondary, #64748b)" }}>{value}</span>
      </div>
      <div style={{ width: "100%", height: "6px", background: "var(--color-border-primary, #e2e8f0)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: tone, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function DataRow({ label, value, accent, isLast = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: isLast ? "none" : "1px solid #eef2f7" }}>
      <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>{label}</span>
      <span style={{ fontSize: "0.76rem", color: accent || "var(--color-text-primary, #1e293b)", fontWeight: "900", textAlign: "right" }}>{value}</span>
    </div>
  );
}

const headerCardStyle = {
  background: "var(--color-background-secondary, #fff)",
  borderRadius: "16px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  padding: "10px 12px",
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
  background: "var(--color-background-tertiary, #f8fafc)",
  color: "var(--color-text-primary, #1e293b)",
  padding: "4px 10px",
  borderRadius: "999px",
  fontWeight: "900",
  textTransform: "uppercase",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
};

const specChipStyle = {
  fontSize: "0.6rem",
  background: "var(--color-background-tertiary, #f8fafc)",
  color: "var(--color-text-secondary, #475569)",
  padding: "4px 10px",
  borderRadius: "999px",
  fontWeight: "900",
  textTransform: "uppercase",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
};

const buildChipStyle = {
  fontSize: "0.6rem",
  background: "var(--color-background-tertiary, #f8fafc)",
  padding: "4px 10px",
  borderRadius: "999px",
  fontWeight: "900",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
};

const tableStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  borderRadius: "12px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  padding: "0 12px",
};
