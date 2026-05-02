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
import {
  FlAsset,
  FlBadge,
  FlBuildIdentityCard,
  FlButton,
  FlHeroScreenHeaderModule,
  FlModulePanel,
  FlProgressBar,
  FlQuickStatRow,
  FlQuickStatsGroup,
  FlTag,
} from "./ui/forge";

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
    const classChoiceGridClass = [
      "character-class-choice__grid",
      isMobile ? "character-class-choice__grid--single" : "",
    ].filter(Boolean).join(" ");

    return (
      <div className={classChoiceRootClass}>
        <header className="character-class-choice__header">
          <div className="character-class-choice__title">Elige tu Senda</div>
          <p className="character-class-choice__note">La clase se reinicia con cada prestigio.</p>
        </header>

        <div className={classChoiceGridClass}>
          {CLASSES.map(clase => (
            <div
              key={clase.id}
              onClick={() => dispatch({ type: "SELECT_CLASS", classId: clase.id })}
              className="character-class-choice__card fl-card"
            >
              <div className="character-class-choice__icon">{clase.icon || "?"}</div>
              <div className="character-class-choice__name">{clase.name}</div>
              <span className="character-class-choice__playstyle fl-badge">{clase.playstyle || "Clase"}</span>
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
    { val: player.damagePct, label: `+${Math.round((player.damagePct || 0) * 100)}% dano`, tone: "success" },
    { val: player.hpPct, label: `+${Math.round((player.hpPct || 0) * 100)}% vida`, tone: "success" },
    { val: player.flatGold, label: `+${formatNumber(player.flatGold || 0)} oro/kill`, tone: "warning" },
    { val: player.xpPct, label: `+${Math.round((player.xpPct || 0) * 100)}% XP`, tone: "arcane" },
    { val: player.flatCrit, label: `+${Math.round((player.flatCrit || 0) * 100)}% crit`, tone: "danger" },
  ].filter(modifier => modifier.val > 0);
  const buildIdentityTone = getBuildToneFromColor(buildTag?.color);

  if (player.specialization) {
    return (
      <div className="character-root character-root--forge-light">
        <FlHeroScreenHeaderModule
          className={[
            "forge-character-hero-module",
            spotlightHeroOverview ? "forge-character-hero-module--spotlight" : "",
          ].filter(Boolean).join(" ")}
          title="Heroe"
          headline={currentSpec?.name || player.specialization}
          subtitle={buildTag?.name || player.class}
          portrait={(
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
          )}
          chips={(
            <div className="forge-character-chip-row">
              <FlBadge
                tone="warning"
                variant="rect"
                size="sm"
                icon={<ForgeIcon name="combat" size={14} />}
              >
                {player.class}
              </FlBadge>
              <FlBadge tone="defense" variant="rect" size="sm">
                {currentSpec?.name || player.specialization}
              </FlBadge>
              {buildTag?.name && (
                <FlBadge tone={buildIdentityTone} variant="rect" size="sm">
                  {buildTag.name}
                </FlBadge>
              )}
            </div>
          )}
          data-onboarding-target={spotlightHeroOverview ? "hero-overview" : undefined}
          onClick={() => spotlightHeroOverview && dispatch({ type: "ACK_ONBOARDING_STEP" })}
        >
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
        </FlHeroScreenHeaderModule>

        <FlModulePanel title="Build actual" className="forge-character-build-module" bodyClassName="forge-character-build-module__body">
          <div className="forge-character-build-grid">
            <FlBuildIdentityCard
              icon="armor"
              title={currentSpec?.name || player.specialization}
              description={currentSpec?.description || "Tu subclase define el enfoque principal de esta run."}
              meta="Activa"
              active
            />

            <FlBuildIdentityCard
              icon="hero"
              title={buildTag?.name || "Build en desarrollo"}
              description={buildTag?.description || "Todavia no hay suficiente senal de equipo y talentos para fijar una identidad fuerte."}
              meta="Identidad de build"
            />
          </div>

          {modifiers.length > 0 && (
            <div className="forge-character-modifiers">
              {modifiers.map(modifier => (
                <FlTag
                  key={modifier.label}
                  tone={getTagToneFromModifier(modifier.tone)}
                  size="xs"
                  className="forge-character-modifier-tag"
                >
                  {modifier.label}
                </FlTag>
              ))}
            </div>
          )}
        </FlModulePanel>

        <FlModulePanel title="Lectura Rapida" className="forge-character-quick-module" bodyClassName="forge-character-quick-module__body">
          <p className="forge-character-quick-copy">
            Metricas activas para esta run y esta build. Si una mecanica no participa, no aparece aca.
          </p>
          <FlQuickStatsGroup>
            {quickReadRows.map(row => (
              <FlQuickStatRow
                key={row.label}
                icon={getQuickReadIcon(row.label)}
                label={row.label}
                value={row.value}
              />
            ))}
          </FlQuickStatsGroup>
        </FlModulePanel>
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
  const barsClassName = [
    "character-pre-spec-bars",
    isMobile ? "character-pre-spec-bars--single" : "",
  ].filter(Boolean).join(" ");
  const specGridClassName = [
    "character-spec-grid",
    availableSpecs.length > 1 ? "" : "character-spec-grid--single",
    specTutorialActive && isNarrowMobile ? "character-spec-grid--compact-gap" : "",
  ].filter(Boolean).join(" ");
  const buildToneClass = getBuildToneClass(buildTag?.color);

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
                <span className={["character-pre-spec-chip", "character-pre-spec-chip--build", buildToneClass].filter(Boolean).join(" ")}>
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

        <div className={barsClassName}>
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
                <div className={["character-pre-spec-build-tag-title", buildToneClass].filter(Boolean).join(" ")}>
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
                  <FlTag
                    key={modifier.label}
                    tone={getTagToneFromModifier(modifier.tone)}
                    size="xs"
                    className="forge-character-modifier-tag"
                  >
                    {modifier.label}
                  </FlTag>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={specGridClassName}>
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
                  <FlButton
                    disabled={!canUnlock}
                    data-onboarding-target={spotlightSpec ? "choose-spec" : undefined}
                    onClick={() => dispatch({ type: "SELECT_SPECIALIZATION", specId: spec.id })}
                    className={[
                      "character-spec-card__button",
                      spotlightSpec ? "character-spec-card__button--spotlight" : "",
                    ].filter(Boolean).join(" ")}
                    variant={canUnlock ? "success" : "secondary"}
                    size="sm"
                  >
                    Elegir
                  </FlButton>
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
        <FlQuickStatsGroup className="character-pre-spec-quick-stats">
          {quickReadRows.map(row => (
            <FlQuickStatRow
              key={row.label}
              icon={getQuickReadIcon(row.label)}
              label={row.label}
              value={row.value}
            />
          ))}
        </FlQuickStatsGroup>
      </section>
    </div>
  );
}

function ProgressCard({ label, value, percentage, tone }) {
  const isDangerTone = String(tone).includes("danger");
  const progressType = isDangerTone ? "danger" : "success";
  return (
    <div className="character-progress-card">
      <div className="character-progress-card__meta">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <FlProgressBar
        className="character-progress-card__progress"
        type={progressType}
        percent={percentage}
        size="xs"
        showValue={false}
      />
    </div>
  );
}

function ForgeCharacterBar({ icon, label, value, percentage, tone = "green" }) {
  const progressTypeMap = {
    green: "success",
    purple: "arcane",
  };
  const progressType = progressTypeMap[tone] || "progress";
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
        <FlProgressBar
          className="forge-character-bar-progress"
          type={progressType}
          percent={Math.max(0, Math.min(100, percentage))}
          size="xs"
          showValue={false}
        />
      </div>
    </div>
  );
}

function getBuildToneClass(color = "") {
  const normalized = String(color || "").toLowerCase();
  if (normalized.includes("d85a30")) return "is-tone-danger";
  if (normalized.includes("1d9e75")) return "is-tone-success";
  if (normalized.includes("f59e0b")) return "is-tone-warning";
  if (normalized.includes("534ab7")) return "is-tone-arcane";
  return "is-tone-arcane";
}

function getBuildToneFromColor(color = "") {
  const normalized = String(color || "").toLowerCase();
  if (normalized.includes("d85a30")) return "danger";
  if (normalized.includes("1d9e75")) return "success";
  if (normalized.includes("f59e0b")) return "warning";
  if (normalized.includes("534ab7")) return "arcane";
  return "arcane";
}

function getTagToneFromModifier(tone = "") {
  const normalized = String(tone || "").toLowerCase();
  if (normalized === "success") return "success";
  if (normalized === "danger") return "danger";
  if (normalized === "warning") return "warning";
  if (normalized === "arcane") return "arcane";
  if (normalized === "defense") return "defense";
  if (normalized === "reward") return "reward";
  return "neutral";
}
