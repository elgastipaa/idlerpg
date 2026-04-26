import React, { useEffect } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import { getRarityColor } from "../constants/rarity";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import { buildRunOutcomeSummary } from "../utils/runOutcomeSummary";

function panelStyle() {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "var(--dense-card-radius, 12px)",
    padding: "var(--dense-panel-padding, 10px)",
    display: "grid",
    gap: "var(--dense-panel-gap, 8px)",
  };
}

function chipStyle(active = false, disabled = false) {
  return {
    border: "1px solid",
    borderColor: disabled
      ? "var(--color-border-primary, #e2e8f0)"
      : active
        ? "var(--tone-accent, #4338ca)"
        : "var(--color-border-primary, #e2e8f0)",
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : active
        ? "var(--tone-accent-soft, #eef2ff)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : active
        ? "var(--tone-accent, #4338ca)"
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "var(--dense-card-radius, 12px)",
    padding: "var(--dense-button-padding, 7px 10px)",
    cursor: disabled ? "not-allowed" : "pointer",
    textAlign: "left",
    opacity: disabled ? 0.6 : 1,
  };
}

function actionButtonStyle({ primary = false, danger = false } = {}) {
  const tone = danger
    ? "var(--tone-danger, #D85A30)"
    : primary
      ? "var(--tone-accent, #4338ca)"
      : "var(--color-border-primary, #e2e8f0)";
  const surface = danger
    ? "var(--tone-danger-soft, #fff1f2)"
    : primary
      ? "var(--tone-accent-soft, #eef2ff)"
      : "var(--color-background-secondary, #ffffff)";
  return {
    border: "1px solid",
    borderColor: tone,
    background: surface,
    color: primary || danger ? tone : "var(--color-text-primary, #1e293b)",
    borderRadius: "var(--dense-card-radius, 12px)",
    padding: "var(--dense-button-padding, 7px 10px)",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };
}

function formatExitLabel() {
  return "Extraccion al Santuario";
}

function formatDiscardRewardSummary(rewards = {}) {
  const essence = Math.max(0, Number(rewards?.essence || 0));
  const codexInk = Math.max(0, Number(rewards?.codexInk || 0));
  const sigilFlux = Math.max(0, Number(rewards?.sigilFlux || 0));
  const relicDust = Math.max(0, Number(rewards?.relicDust || 0));
  const parts = [];
  if (essence > 0) parts.push(`+${Math.floor(essence)} esencia`);
  if (codexInk > 0) parts.push(`+${Math.floor(codexInk)} tinta`);
  if (sigilFlux > 0) parts.push(`+${Math.floor(sigilFlux)} flux`);
  if (relicDust > 0) parts.push(`+${Math.floor(relicDust)} polvo`);
  return parts.length > 0 ? parts.join(" · ") : "Sin retorno";
}

export default function ExtractionOverlay({ state, dispatch, isMobile = false }) {
  const expedition = state.expedition || {};
  const preview = expedition.extractionPreview || {};
  const summary = preview.summary || {};
  const cargoOptions = preview.cargoOptions || [];
  const projectOptions = preview.projectOptions || [];
  const projectIntelLensUses = Math.max(0, Number(preview.projectIntelLensUses || 0));
  const selectedCargoIds = new Set(expedition.selectedCargoIds || []);
  const selectedProjectItemId = expedition.selectedProjectItemId || null;
  const onboardingStep = state?.onboarding?.step || null;
  const extractionTutorialActive = [
    ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO,
    ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM,
    ONBOARDING_STEPS.EXTRACTION_CONFIRM,
  ].includes(onboardingStep);
  const tutorialCargoTargetId =
    onboardingStep === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO
      ? cargoOptions[0]?.id || null
      : null;
  const tutorialProjectTargetId =
    onboardingStep === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM
      ? projectOptions[0]?.itemId || null
      : null;
  const canCancel = !extractionTutorialActive;
  const selectedProject = projectOptions.find(option => option.itemId === selectedProjectItemId) || null;
  const selectedProjectDecision = expedition?.selectedProjectDecision === "discard" ? "discard" : "keep";
  const selectedProjectDiscardSummary = formatDiscardRewardSummary(selectedProject?.discardRewards || {});
  const availableRelicSlots = Number(preview.availableSlots?.relic || preview.availableSlots?.project || 0);
  const canKeepRelic = availableRelicSlots > 0;
  const hasRelicCandidates = projectOptions.length > 0;
  const tutorialForcesRelicSelection = Boolean(tutorialProjectTargetId);
  const canToggleRelicDecision = hasRelicCandidates && !tutorialForcesRelicSelection;
  const suggestedProjectOption = projectOptions[0] || null;
  const keepDecisionActive = selectedProjectDecision !== "discard";
  const discardDecisionActive = selectedProjectDecision === "discard";
  const willKeepRelic = keepDecisionActive && canKeepRelic && Boolean(selectedProject);
  const willDiscardProject = discardDecisionActive && Boolean(selectedProject);
  const relicDecisionSummary = selectedProject
    ? keepDecisionActive
      ? canKeepRelic
        ? `Conservaras ${selectedProject.name} como reliquia y proyecto del Taller al confirmar.`
        : "El Arsenal esta lleno: no puedes conservar reliquia en esta salida."
      : `Desguazaras ${selectedProject.name} al confirmar (${selectedProjectDiscardSummary}).`
    : hasRelicCandidates
      ? "No hay pieza seleccionada: elige una para conservarla o desguazarla antes de confirmar."
      : "No aparecieron piezas elegibles en esta salida.";
  const confirmActionLabel =
    preview.prestige?.mode === "echoes"
      ? willKeepRelic
        ? "Extraer + reliquia + ecos"
        : willDiscardProject
          ? "Extraer + desguace + ecos"
          : "Extraer + ecos"
      : willKeepRelic
          ? "Confirmar extraccion con reliquia"
          : willDiscardProject
            ? "Confirmar extraccion con desguace"
            : "Confirmar extraccion";
  const outcomeSummary = buildRunOutcomeSummary(state, {
    prestigeMode: preview.prestige?.mode || "none",
    exitReason: "retire",
    selectedCargoCount: selectedCargoIds.size,
    hasRetainedItem: Boolean(willKeepRelic),
    echoes: Number(preview.prestige?.echoes || 0),
    source: "extraction",
  });
  const keepsGroup = outcomeSummary.groups.find(group => group.id === "keeps") || null;
  const resetsGroup = outcomeSummary.groups.find(group => group.id === "resets") || null;
  const quickKeeps = Array.isArray(keepsGroup?.items) ? keepsGroup.items.slice(0, 2) : [];
  const quickResets = Array.isArray(resetsGroup?.items) ? resetsGroup.items.slice(0, 2) : [];
  const conversionMode = preview.prestige?.mode || "none";
  const conversionMomentum = preview.prestige?.momentum || {};
  const conversionFinalEchoes = Math.max(0, Number(preview.prestige?.echoes || 0));
  const conversionPreExtractionEchoes = Math.max(0, Number(preview.prestige?.preExtractionEchoes || 0));
  const conversionBaseEchoes = Math.max(0, Number(conversionMomentum?.baseEchoes || 0));
  const conversionMinimumEchoes = Math.max(0, Number(preview.prestige?.minimumEchoes || 0));
  const conversionMomentumMultiplier = Number.isFinite(Number(conversionMomentum?.multiplier))
    ? Math.max(0, Number(conversionMomentum.multiplier))
    : 1;
  const conversionMomentumDeltaRaw = Math.max(0, Number(conversionMomentum?.momentumDeltaEchoes || 0));
  const conversionFirstSpikeFromBreakdown = Math.max(
    0,
    Number((preview.prestige?.breakdown || []).find(step => step.id === "first_floor")?.echoes || 0)
  );
  const conversionExtractionBonusEchoes = Math.max(0, Number(preview.prestige?.extractionBonusEchoes || 0));
  const conversionHasMomentumData =
    conversionMomentum?.baseEchoes != null || conversionMomentum?.momentumDeltaEchoes != null;
  const conversionMomentumDelta = conversionHasMomentumData
    ? conversionMomentumDeltaRaw
    : Math.max(0, conversionPreExtractionEchoes - conversionBaseEchoes);
  const conversionFirstSpikeEchoes = Math.max(
    conversionFirstSpikeFromBreakdown,
    Math.max(0, conversionPreExtractionEchoes - conversionBaseEchoes - conversionMomentumDelta)
  );
  const conversionParts = [];
  if (conversionMode === "echoes") {
    conversionParts.push(`Base ${conversionBaseEchoes}`);
    conversionParts.push(
      `Momentum x${conversionMomentumMultiplier.toFixed(2)}${conversionMomentumDelta > 0 ? ` (+${conversionMomentumDelta})` : ""}`
    );
    if (conversionMinimumEchoes > 0) {
      conversionParts.push(`Min ${conversionMinimumEchoes}`);
    } else {
      if (conversionFirstSpikeEchoes > 0) conversionParts.push(`Primer spike +${conversionFirstSpikeEchoes}`);
      if (conversionExtractionBonusEchoes > 0) conversionParts.push(`Bono extraccion +${conversionExtractionBonusEchoes}`);
    }
    if (!conversionHasMomentumData && conversionPreExtractionEchoes > 0) {
      conversionParts.push(`Run +${conversionPreExtractionEchoes}`);
    }
    if (!conversionHasMomentumData && conversionParts.length === 0 && conversionFinalEchoes > 0) {
      conversionParts.push(`Run +${conversionFinalEchoes}`);
    }
  }

  useEffect(() => {
    if (!extractionTutorialActive) return undefined;
    let cancelled = false;
    let attempt = 0;

    const selector =
      onboardingStep === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO
        ? '[data-onboarding-target="tutorial-extraction-cargo"]'
        : onboardingStep === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM
          ? '[data-onboarding-target="tutorial-extraction-item"]'
          : '[data-onboarding-target="tutorial-extraction-confirm"]';

    const scrollToTarget = () => {
      if (cancelled) return;
      const target = document.querySelector(selector);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      attempt += 1;
      if (attempt < 8) {
        window.setTimeout(scrollToTarget, 80);
      }
    };

    const timer = window.setTimeout(scrollToTarget, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [extractionTutorialActive, onboardingStep, cargoOptions.length, projectOptions.length]);

  return (
    <OverlayShell isMobile={isMobile} zIndex={9200} contentLabel="Extraccion">
      <OverlaySurface
        isMobile={isMobile}
        maxWidth="980px"
        paddingMobile="calc(12px * var(--density-scale, 1)) calc(10px * var(--density-scale, 1)) calc(14px * var(--density-scale, 1))"
        paddingDesktop="calc(14px * var(--density-scale, 1)) calc(14px * var(--density-scale, 1)) calc(16px * var(--density-scale, 1))"
      >
        <style>{`
          @keyframes extractionSpotlightPulse {
            0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.22); }
            70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
            100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
          }
        `}</style>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
            {formatExitLabel()}
          </div>
          <div style={{ fontSize: "clamp(1.08rem, 2.1vw, 1.18rem)", fontWeight: "900", marginTop: "4px" }}>
            Cierra la expedicion y elige que vuelve al Santuario
          </div>
          <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45, maxWidth: "60ch" }}>
            El valor meta ya no vive solo en la corrida. Elige bundles persistentes y, si la salida lo permite, una reliquia para tu arsenal.
          </div>
        </div>

        <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
          <section
            style={{
              ...panelStyle(),
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: isMobile ? "4px" : "6px",
              overflowX: "visible",
            }}
          >
            <Metric label="Tier maximo" value={summary.maxTier || 1} />
            <Metric label="Bosses" value={summary.bossesKilled || 0} />
            <Metric label="Kills" value={summary.kills || 0} />
            <Metric label="Duracion" value={`${summary.durationTicks || 0} ticks`} />
          </section>

          <section style={panelStyle()}>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
              Conversion
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
              {conversionMode === "echoes"
                ? `+${conversionFinalEchoes} ecos al confirmar`
                : "Salida sin conversion de ecos"}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
              {conversionParts.length > 0
                ? `${conversionParts.join(" · ")} = +${conversionFinalEchoes} ecos`
                : "Aun no hay conversion activa para esta salida."}
            </div>
          </section>

          <section style={panelStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
                  Cargo
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: "900", marginTop: "2px" }}>
                  Elige que bundles persisten
                </div>
              </div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                {selectedCargoIds.size} / {preview.availableSlots?.cargo || 0} slots
              </div>
            </div>

            <div style={{ display: "grid", gap: "8px" }}>
              {cargoOptions.length === 0 ? (
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-tertiary, #94a3b8)" }}>
                  Esta salida no genero bundles persistentes.
                </div>
              ) : cargoOptions.map(option => {
                const active = selectedCargoIds.has(option.id);
                const spotlight = tutorialCargoTargetId === option.id;
                const disabled = Boolean(tutorialCargoTargetId) && !spotlight;
                return (
                  <button
                    key={option.id}
                    onClick={() => !disabled && dispatch({ type: "SELECT_EXTRACTION_CARGO", cargoId: option.id })}
                    disabled={disabled}
                    data-onboarding-target={spotlight ? "tutorial-extraction-cargo" : undefined}
                    style={{
                      ...chipStyle(active),
                      position: spotlight ? "relative" : "static",
                      zIndex: spotlight ? 2 : 1,
                      animation: spotlight ? "extractionSpotlightPulse 1600ms ease-in-out infinite" : "none",
                      opacity: disabled ? 0.45 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: "900" }}>{option.label}</div>
                      <div style={{ fontSize: "0.68rem", fontWeight: "900", color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-tertiary, #94a3b8)" }}>
                        {`x${option.recoveredQuantity}`}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={panelStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
                  Reliquia
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: "900", marginTop: "2px" }}>
                  {canKeepRelic ? "Conservar o desguazar pieza del cierre" : "Arsenal lleno: solo desguazar pieza"}
                </div>
                {!extractionTutorialActive && hasRelicCandidates && (
                  <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.4 }}>
                    Lente de escrutinio: {projectIntelLensUses} uso(s). Toca otra vez una pieza seleccionada para revelar una linea velada.
                  </div>
                )}
              </div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                {availableRelicSlots} slot
              </div>
            </div>
            <div style={{ display: "grid", gap: "8px" }}>
              {hasRelicCandidates && (
                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                    padding: "8px",
                    border: "1px solid var(--color-border-primary, #e2e8f0)",
                    borderRadius: "12px",
                    background: "var(--color-background-tertiary, #f8fafc)",
                  }}
                >
                  <div style={{ fontSize: "0.62rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Decision de pieza
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => {
                        const fallbackItemId = selectedProjectItemId || tutorialProjectTargetId || suggestedProjectOption?.itemId || null;
                        if (!fallbackItemId) return;
                        if (!selectedProjectItemId) {
                          dispatch({ type: "SELECT_EXTRACTION_PROJECT", itemId: fallbackItemId });
                        }
                        if (!tutorialForcesRelicSelection) {
                          dispatch({ type: "SET_EXTRACTION_PROJECT_DECISION", decision: "keep" });
                        }
                      }}
                      disabled={!canKeepRelic || (tutorialForcesRelicSelection && !selectedProjectItemId)}
                      style={{
                        ...chipStyle(keepDecisionActive, !canKeepRelic || (tutorialForcesRelicSelection && !selectedProjectItemId)),
                        height: "100%",
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>Conservar pieza</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>
                        Entra al Arsenal y crea proyecto para Deep Forge.
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        if (!canToggleRelicDecision) return;
                        const fallbackItemId = selectedProjectItemId || tutorialProjectTargetId || suggestedProjectOption?.itemId || null;
                        if (!fallbackItemId) return;
                        if (!selectedProjectItemId) {
                          dispatch({ type: "SELECT_EXTRACTION_PROJECT", itemId: fallbackItemId });
                        }
                        dispatch({ type: "SET_EXTRACTION_PROJECT_DECISION", decision: "discard" });
                      }}
                      disabled={!canToggleRelicDecision}
                      style={{
                        ...chipStyle(discardDecisionActive, !canToggleRelicDecision),
                        height: "100%",
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>Descartar pieza</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>
                        Cobras recursos inmediatos por desguace.
                      </div>
                    </button>
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
                    {relicDecisionSummary}
                  </div>
                </div>
              )}
              {projectOptions.length === 0 ? (
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-tertiary, #94a3b8)", lineHeight: 1.45 }}>
                  No aparecieron candidatos elegibles para guardar en el arsenal.
                </div>
              ) : projectOptions.map(option => {
                const active = selectedProjectItemId === option.itemId;
                const spotlight = tutorialProjectTargetId === option.itemId;
                const disabled = Boolean(tutorialProjectTargetId) && !spotlight;
                const intelLines = Array.isArray(option?.intelLines) ? option.intelLines : [];
                const revealedCount = Math.max(0, Math.min(intelLines.length, Number(option?.intelRevealedCount || 0)));
                const hiddenCount = Math.max(0, intelLines.length - revealedCount);
                const canRevealIntel =
                  active &&
                  !disabled &&
                  !extractionTutorialActive &&
                  hiddenCount > 0 &&
                  projectIntelLensUses > 0;
                const suggested = option.itemId === suggestedProjectOption?.itemId;
                const discardSummary = formatDiscardRewardSummary(option?.discardRewards || {});
                const selectionStatusText = active
                  ? discardDecisionActive
                    ? ""
                    : canKeepRelic
                      ? ""
                      : "Arsenal lleno: si confirmas en conservar, no se podra guardar."
                  : "Toca para seleccionar esta pieza.";
                return (
                    <button
                      key={option.itemId}
                      onClick={() => {
                        if (disabled) return;
                        if (canRevealIntel) {
                          dispatch({ type: "REVEAL_EXTRACTION_PROJECT_INTEL", itemId: option.itemId });
                          return;
                        }
                        dispatch({ type: "SELECT_EXTRACTION_PROJECT", itemId: option.itemId });
                      }}
                      disabled={disabled}
                      data-onboarding-target={spotlight ? "tutorial-extraction-item" : undefined}
                      style={{
                        ...chipStyle(active, disabled),
                        position: spotlight ? "relative" : "static",
                        zIndex: spotlight ? 2 : 1,
                        animation: spotlight ? "extractionSpotlightPulse 1600ms ease-in-out infinite" : "none",
                        opacity: disabled ? 0.45 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: "900", color: getRarityColor(option.rarity) }}>{option.name}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {suggested && (
                            <span
                              style={{
                                fontSize: "0.56rem",
                                fontWeight: "900",
                                borderRadius: "999px",
                                padding: "2px 6px",
                                border: "1px solid rgba(99,102,241,0.2)",
                                background: "var(--tone-accent-soft, #eef2ff)",
                                color: "var(--tone-accent, #4338ca)",
                              }}
                            >
                              Sugerida
                            </span>
                          )}
                          <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                            {Math.round(option.rating || 0)}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
                        {option.rarity} · {option.type} · {option.affixCount} affix
                      </div>
                      {discardDecisionActive && (
                        <div style={{ fontSize: "0.62rem", marginTop: "4px", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>
                          Desguazar: {discardSummary}
                        </div>
                      )}
                      {selectionStatusText && (
                        <div
                          style={{
                            fontSize: "0.62rem",
                            marginTop: "4px",
                            color: active
                              ? discardDecisionActive
                                ? "var(--tone-warning, #f59e0b)"
                                : "var(--tone-danger, #D85A30)"
                              : "var(--color-text-tertiary, #94a3b8)",
                            fontWeight: "900",
                          }}
                        >
                          {selectionStatusText}
                        </div>
                      )}
                      {intelLines.length > 0 && (
                        <div style={{ display: "grid", gap: "3px", marginTop: "6px" }}>
                          {intelLines.map((line, index) => {
                            const revealed = index < revealedCount;
                            return (
                              <div
                                key={`${option.itemId}-intel-${index}`}
                                style={{
                                  fontSize: "0.62rem",
                                  fontWeight: "800",
                                  color: revealed
                                    ? "var(--color-text-secondary, #475569)"
                                    : "var(--color-text-tertiary, #94a3b8)",
                                  lineHeight: 1.35,
                                }}
                              >
                                {revealed ? `• ${line}` : "• Linea velada"}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {!extractionTutorialActive && active && hiddenCount > 0 && (
                        <div style={{ fontSize: "0.6rem", fontWeight: "900", marginTop: "6px", color: projectIntelLensUses > 0 ? "var(--tone-accent, #4338ca)" : "var(--tone-danger, #D85A30)" }}>
                          {projectIntelLensUses > 0
                            ? `Tocar de nuevo para revelar (${projectIntelLensUses} uso(s) restante(s))`
                            : "Sin usos de lente en esta salida"}
                        </div>
                      )}
                    </button>
                    );
                  })}
            </div>
          </section>

          <section style={panelStyle()}>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Contrato de Extraccion
            </div>
            <div className="overlay-cols-1-2">
              <QuickOutcomeColumn
                label="Conservas"
                tone="var(--tone-success, #10b981)"
                items={quickKeeps}
                fallback="Sin conservaciones relevantes en este modo."
              />
              <QuickOutcomeColumn
                label="Se reinicia"
                tone="var(--tone-danger, #D85A30)"
                items={quickResets}
                fallback="Sin reinicios relevantes en este modo."
              />
            </div>
          </section>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {canCancel && (
                <button onClick={() => dispatch({ type: "CANCEL_EXTRACTION" })} style={actionButtonStyle()}>
                  Volver
                </button>
              )}
              <button
                onClick={() => dispatch({ type: "CONFIRM_EXTRACTION" })}
                data-onboarding-target={onboardingStep === ONBOARDING_STEPS.EXTRACTION_CONFIRM ? "tutorial-extraction-confirm" : undefined}
                style={{
                  ...actionButtonStyle({ primary: true }),
                  position: onboardingStep === ONBOARDING_STEPS.EXTRACTION_CONFIRM ? "relative" : "static",
                  zIndex: onboardingStep === ONBOARDING_STEPS.EXTRACTION_CONFIRM ? 2 : 1,
                  animation: onboardingStep === ONBOARDING_STEPS.EXTRACTION_CONFIRM ? "extractionSpotlightPulse 1600ms ease-in-out infinite" : "none",
                }}
              >
                {confirmActionLabel}
              </button>
            </div>
          </div>
        </div>
      </OverlaySurface>
    </OverlayShell>
  );
}

function Metric({ label, value }) {
  return (
    <div
      style={{
        background: "var(--color-background-tertiary, #f8fafc)",
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        borderRadius: "12px",
        padding: "6px 8px",
        display: "grid",
        justifyItems: "center",
        alignContent: "center",
        gap: "2px",
        minWidth: 0,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "0.52rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.15, color: "var(--color-text-tertiary, #94a3b8)" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.76rem", fontWeight: "900", lineHeight: 1.15 }}>{value}</div>
    </div>
  );
}

function QuickOutcomeColumn({ label, tone, items = [], fallback = "" }) {
  return (
    <div
      style={{
        background: "var(--color-background-tertiary, #f8fafc)",
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        borderTop: `3px solid ${tone}`,
        borderRadius: "12px",
        padding: "10px",
        display: "grid",
        gap: "6px",
      }}
    >
      <div style={{ fontSize: "0.68rem", fontWeight: "900", color: tone, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      {items.length > 0 ? (
        <div style={{ display: "grid", gap: "4px" }}>
          {items.map(item => (
            <div key={`${label}-${item}`} style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
              • {item}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", lineHeight: 1.45 }}>
          {fallback}
        </div>
      )}
    </div>
  );
}
