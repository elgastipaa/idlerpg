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
import { getClassPortraitAsset } from "../utils/assetRegistry";
import ForgeIcon from "./icons/ForgeIcon";
import { FlAsset } from "./ui/forge";

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

function getQuickReadIcon(label = "") {
  const normalized = String(label || "").toLowerCase();
  if (normalized.includes("dano")) return "combat";
  if (normalized.includes("defensa") || normalized.includes("bloqueo")) return "armor";
  if (normalized.includes("crit")) return "mark";
  if (normalized.includes("vida") || normalized.includes("regen") || normalized.includes("robo")) return "bleed";
  if (normalized.includes("xp")) return "xp";
  if (normalized.includes("oro")) return "gold";
  return "hero";
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
    const classChoiceRootClass = [
      "character-class-choice",
      isMobile ? "character-class-choice--mobile" : "",
    ].filter(Boolean).join(" ");
    const classChoiceGridProps = {
      style: {
        "--character-class-grid-columns": isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
      },
    };

    return (
      <div className={classChoiceRootClass}>
        <header className="character-class-choice__header">
          <div className="character-class-choice__title">Elige tu Senda</div>
          <p className="character-class-choice__note">La clase se reinicia con cada prestigio.</p>
        </header>

        <div className="character-class-choice__grid" {...classChoiceGridProps}>
          {CLASSES.map(clase => (
            <div
              key={clase.id}
              onClick={() => dispatch({ type: "SELECT_CLASS", classId: clase.id })}
              className="character-class-choice__card fl-card"
            >
              <div className="character-class-choice__icon">{clase.icon || "?"}</div>
              <div className="character-class-choice__name">{clase.name}</div>
              <span className="character-class-choice__playstyle fl2-badge">{clase.playstyle || "Clase"}</span>
              <p className="character-class-choice__description">{clase.description}</p>
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
  const characterPortraitAsset = getClassPortraitAsset(player.specialization || player.class);
  const modifiers = [
    { val: player.damagePct, label: `+${Math.round((player.damagePct || 0) * 100)}% dano`, color: "#1D9E75" },
    { val: player.hpPct, label: `+${Math.round((player.hpPct || 0) * 100)}% vida`, color: "#1D9E75" },
    { val: player.flatGold, label: `+${formatNumber(player.flatGold || 0)} oro/kill`, color: "#f59e0b" },
    { val: player.xpPct, label: `+${Math.round((player.xpPct || 0) * 100)}% XP`, color: "#534AB7" },
    { val: player.flatCrit, label: `+${Math.round((player.flatCrit || 0) * 100)}% crit`, color: "#D85A30" },
  ].filter(modifier => modifier.val > 0);

  if (player.specialization) {
    return (
      <div className="character-root character-root--forge-light">
        <header
          className={[
            "forge-character-hero-card",
            spotlightHeroOverview ? "forge-character-hero-card--spotlight" : "",
          ].filter(Boolean).join(" ")}
          data-onboarding-target={spotlightHeroOverview ? "hero-overview" : undefined}
          onClick={() => spotlightHeroOverview && dispatch({ type: "ACK_ONBOARDING_STEP" })}
        >
          <div className="forge-character-portrait" aria-hidden="true">
            <div className="forge-character-portrait-glow" />
            <FlAsset
              asset={characterPortraitAsset}
              kind="portrait"
              size="full"
              fit="cover"
              className="forge-character-portrait-asset"
              imgClassName="forge-character-portrait-img"
              fallbackIcon="hero"
              loading="eager"
              alt=""
            />
            <span className="forge-character-level-badge">{formatNumber(player.level || 1)}</span>
          </div>

          <div className="forge-character-main">
            <div className="forge-character-heading-row">
              <div className="forge-character-title-block">
                <div className="forge-character-kicker">Heroe</div>
                <div className="forge-character-chip-row">
                  <span className="forge-character-chip forge-character-chip--class">
                    <ForgeIcon name="combat" size={16} />
                    {player.class}
                  </span>
                  <span className="forge-character-chip forge-character-chip--spec">
                    {currentSpec?.name || player.specialization}
                  </span>
                  {buildTag?.name && (
                    <span className="forge-character-chip forge-character-chip--build">
                      {buildTag.name}
                    </span>
                  )}
                </div>
                <div className="forge-character-description">
                  {currentSpec?.description || buildTag?.description || "Tu ficha resume la build activa y el estado real de esta run."}
                </div>
              </div>

              <div className="forge-character-level-summary">
                <span>Nivel {formatNumber(player.level || 1)}</span>
                <small><ForgeIcon name="skull" size={14} /> {formatNumber(kills)} bajas</small>
              </div>
            </div>

            <div className="forge-character-bars">
              <ForgeCharacterBar
                icon="bleed"
                label="Vida"
                value={`${formatNumber(Math.floor(displayedHp || 0))} / ${formatNumber(displayedMaxHp || 0)}`}
                percentage={hpPercentage}
                tone="green"
              />
              <ForgeCharacterBar
                icon="xp"
                label="Experiencia"
                value={`${formatNumber(Math.floor(player.xp || 0))} / ${formatNumber(xpNextLevel)}`}
                percentage={xpPercentage}
                tone="purple"
              />
            </div>
          </div>
        </header>

        <section className="forge-character-section">
          <div className="forge-character-section-title">Build actual</div>
          <div className="forge-character-build-grid">
            <article className="forge-character-build-card forge-character-build-card--active">
              <div className="forge-character-build-icon" aria-hidden="true">
                <ForgeIcon name="armor" size={32} />
              </div>
              <div className="forge-character-build-copy">
                <strong>{currentSpec?.name || player.specialization}</strong>
                <span>{currentSpec?.description || "Tu subclase define el enfoque principal de esta run."}</span>
                <small>Activa</small>
              </div>
            </article>

            <article className="forge-character-build-card">
              <div className="forge-character-build-icon" aria-hidden="true">
                <ForgeIcon name="hero" size={32} />
              </div>
              <div className="forge-character-build-copy">
                <strong>{buildTag?.name || "Build en desarrollo"}</strong>
                <span>{buildTag?.description || "Todavia no hay suficiente senal de equipo y talentos para fijar una identidad fuerte."}</span>
                <small>Identidad de build</small>
              </div>
            </article>
          </div>

          {modifiers.length > 0 && (
            <div className="forge-character-modifiers">
              {modifiers.map(modifier => (
                <span key={modifier.label} {...{ style: { "--modifier-color": modifier.color } }}>
                  {modifier.label}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="forge-character-section">
          <div className="forge-character-section-title">Lectura Rapida</div>
          <p className="forge-character-section-copy">
            Metricas activas para esta run y esta build. Si una mecanica no participa, no aparece aca.
          </p>
          <div className="forge-character-table">
            {quickReadRows.map(row => (
              <div key={row.label} className="forge-character-data-row">
                <span className="forge-character-data-icon" aria-hidden="true">
                  <ForgeIcon name={getQuickReadIcon(row.label)} size={18} />
                </span>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const preSpecRootClass = [
    "character-pre-spec",
    isMobile ? "character-pre-spec--mobile" : "",
  ].filter(Boolean).join(" ");
  const preSpecHeaderClass = [
    "character-pre-spec-header",
    spotlightHeroOverview ? "character-pre-spec-header--spotlight" : "",
  ].filter(Boolean).join(" ");
  const barsProps = {
    style: {
      "--character-pre-spec-bars-columns": isMobile ? "1fr" : "1fr 1fr",
    },
  };
  const specGridProps = {
    style: {
      "--character-spec-grid-columns": availableSpecs.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr",
      "--character-spec-grid-gap": isNarrowMobile ? "6px" : "8px",
    },
  };

  return (
    <div className={preSpecRootClass}>
      <header
        className={preSpecHeaderClass}
        data-onboarding-target={spotlightHeroOverview ? "hero-overview" : undefined}
        onClick={() => spotlightHeroOverview && dispatch({ type: "ACK_ONBOARDING_STEP" })}
      >
        <div className="character-pre-spec-header__row">
          <div className="character-pre-spec-header__copy">
            <div className="character-pre-spec-eyebrow">Heroe</div>
            <div className="character-pre-spec-chips">
              <span className="character-pre-spec-chip">{selectedClass?.icon || "?"} {player.class}</span>
              {player.specialization && <span className="character-pre-spec-chip character-pre-spec-chip--spec">{currentSpec?.name || player.specialization}</span>}
              {buildTag?.name && (
                <span className="character-pre-spec-chip character-pre-spec-chip--build" {...{ style: { "--build-chip-tone": buildTag.color || "#534AB7" } }}>
                  {buildTag.name}
                </span>
              )}
            </div>
            <div className="character-pre-spec-description">
              {currentSpec?.description || buildTag?.description || "Tu ficha resume la build activa y el estado real de esta run."}
            </div>
          </div>
          <div className="character-pre-spec-level">
            <div>Nivel {formatNumber(player.level || 1)}</div>
            <span>{formatNumber(kills)} bajas</span>
          </div>
        </div>

        <div className="character-pre-spec-bars" {...barsProps}>
          <ProgressCard label="Vida" value={`${formatNumber(Math.floor(displayedHp || 0))} / ${formatNumber(displayedMaxHp || 0)}`} percentage={hpPercentage} tone={hpPercentage > 30 ? "var(--tone-success, #1D9E75)" : "var(--tone-danger, #D85A30)"} />
          <ProgressCard label="Experiencia" value={`${formatNumber(Math.floor(player.xp || 0))} / ${formatNumber(xpNextLevel)}`} percentage={xpPercentage} tone="var(--tone-accent, #534AB7)" />
        </div>
      </header>

      <section className="character-pre-spec-section fl-card">
        <div className="character-pre-spec-section-title">Build actual</div>
        {player.specialization ? (
          <div className="character-pre-spec-build">
            <div className="character-pre-spec-build-row">
              <div className="character-pre-spec-build-copy">
                <div className="character-pre-spec-build-title">
                  {currentSpec?.name || player.specialization}
                </div>
                <div className="character-pre-spec-build-description">
                  {currentSpec?.description || "Tu subclase define el enfoque principal de esta run."}
                </div>
              </div>
              <div className={["character-pre-spec-build-tag", isMobile ? "character-pre-spec-build-tag--full" : ""].filter(Boolean).join(" ")}>
                <div className="character-pre-spec-eyebrow">
                  Identidad de build
                </div>
                <div className="character-pre-spec-build-tag-title" {...{ style: { "--build-tag-tone": buildTag?.color || "var(--fl2-text)" } }}>
                  {buildTag?.name || "Build en desarrollo"}
                </div>
                <div className="character-pre-spec-build-tag-description">
                  {buildTag?.description || "Todavia no hay suficiente senal de equipo y talentos para fijar una identidad fuerte."}
                </div>
              </div>
            </div>
            {modifiers.length > 0 && (
              <div className="forge-character-modifiers">
                {modifiers.map(modifier => (
                  <span key={modifier.label} {...{ style: { "--modifier-color": modifier.color } }}>
                    {modifier.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="character-spec-grid" {...specGridProps}>
            {availableSpecs.map(spec => {
              const canUnlock = specTutorialActive || canUnlockSpec(spec, player, kills);
              const reqText = getRequirementText(spec.unlockCondition);
              const spotlightSpec = tutorialSpecIds.includes(spec.id);
              return (
                <div
                  key={spec.id}
                  data-onboarding-target={spotlightSpec ? "choose-spec-card" : undefined}
                  className={[
                    "character-spec-card",
                    canUnlock ? "character-spec-card--available" : "character-spec-card--locked",
                    spotlightSpec ? "character-spec-card--spotlight" : "",
                    specTutorialActive && isNarrowMobile ? "character-spec-card--compact" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="character-spec-card__copy">
                    <div className="character-spec-card__title">{spec.name}</div>
                    <div className="character-spec-card__description">{spec.description}</div>
                    <div className={["character-spec-card__requirement", canUnlock ? "character-spec-card__requirement--available" : ""].filter(Boolean).join(" ")}>
                      {specTutorialActive ? "Tutorial: elige una subclase" : `Req: ${reqText}`}
                    </div>
                  </div>
                  <button
                    disabled={!canUnlock}
                    data-onboarding-target={spotlightSpec ? "choose-spec" : undefined}
                    onClick={() => dispatch({ type: "SELECT_SPECIALIZATION", specId: spec.id })}
                    className={[
                      "character-spec-card__button",
                      "fl2-button",
                      canUnlock ? "fl2-button--success" : "",
                      spotlightSpec ? "character-spec-card__button--spotlight" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    Elegir
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="character-pre-spec-section fl-card">
        <div className="character-pre-spec-section-title">Lectura Rapida</div>
        <div className="character-pre-spec-section-copy">
          Metricas activas para esta run y esta build. Si una mecanica no participa, no aparece aca.
        </div>
        <div className="character-pre-spec-table">
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
  const fillProps = {
    style: {
      "--character-progress-width": `${percentage}%`,
      "--character-progress-tone": tone,
    },
  };
  return (
    <div className="character-progress-card">
      <div className="character-progress-card__meta">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="character-progress-card__track">
        <div className="character-progress-card__fill" {...fillProps} />
      </div>
    </div>
  );
}

function ForgeCharacterBar({ icon, label, value, percentage, tone = "green" }) {
  const fillProps = { style: { "--forge-character-bar-width": `${Math.max(0, Math.min(100, percentage))}%` } };
  return (
    <div className={`forge-character-bar forge-character-bar--${tone}`}>
      <div className="forge-character-bar-icon" aria-hidden="true">
        <ForgeIcon name={icon} size={26} />
      </div>
      <div className="forge-character-bar-copy">
        <div className="forge-character-bar-meta">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
        <div className="forge-character-bar-track">
          <span {...fillProps} />
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value, accent, isLast = false }) {
  const rowProps = { style: { "--character-data-accent": accent || "var(--fl2-text)" } };
  return (
    <div
      className={["character-data-row", isLast ? "character-data-row--last" : ""].filter(Boolean).join(" ")}
      {...rowProps}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
