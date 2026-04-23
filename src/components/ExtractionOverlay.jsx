import React, { useEffect } from "react";
import OverlayShell from "./OverlayShell";
import { getRarityColor } from "../constants/rarity";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import { buildRunOutcomeSummary } from "../utils/runOutcomeSummary";

function panelStyle() {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "8px",
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
    borderRadius: "12px",
    padding: "10px 12px",
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
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: "pointer",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };
}

function formatExitLabel(exitReason = "retire") {
  if (exitReason === "death") return "Extraccion de Emergencia";
  return "Extraccion al Santuario";
}

export default function ExtractionOverlay({ state, dispatch, isMobile = false }) {
  const expedition = state.expedition || {};
  const preview = expedition.extractionPreview || {};
  const summary = preview.summary || {};
  const cargoOptions = preview.cargoOptions || [];
  const projectOptions = preview.projectOptions || [];
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
  const canCancel = expedition.exitReason !== "death" && !extractionTutorialActive;
  const selectedProject = projectOptions.find(option => option.itemId === selectedProjectItemId) || null;
  const projectUnlocked = Number(preview.availableSlots?.project || 0) > 0;
  const extractionSteps = [
    {
      label: "1. Rescatas valor",
      body:
        selectedCargoIds.size > 0
          ? `${selectedCargoIds.size} bundle${selectedCargoIds.size === 1 ? "" : "s"} persistiran en el Santuario.`
          : "Si eliges bundles, esos recursos van a la Destileria y al resto de estaciones.",
    },
    {
      label: "2. Decides el item",
      body: projectUnlocked
        ? selectedProject
          ? `${selectedProject.name} quedara guardado como item rescatado temporal. Luego decides si se vuelve blueprint o si lo rompes para ganar cargas.`
          : "El item rescatado no vuelve equipado. Primero queda guardado en el Santuario y recien despues eliges blueprint o desguace."
        : "En este tramo del onboarding solo rescatas cargo. Los items persistentes aparecen mas adelante, cuando ya entiendes Ecos y Santuario.",
    },
    {
      label: "3. Conversion de run",
      body:
        preview.prestige?.mode === "echoes"
          ? `Esta salida tambien se convierte en +${preview.prestige.echoes || 0} Ecos.`
          : preview.prestige?.mode === "emergency"
            ? `La emergencia recupera menos valor, pero aun asi convierte +${preview.prestige.echoes || 0} Ecos.`
            : "Esta salida vuelve al Santuario sin convertir a Ecos todavia.",
    },
  ];
  const outcomeSummary = buildRunOutcomeSummary(state, {
    prestigeMode: preview.prestige?.mode || "none",
    exitReason: expedition.exitReason === "death" ? "death" : "retire",
    selectedCargoCount: selectedCargoIds.size,
    hasRetainedItem: Boolean(selectedProject),
    echoes: Number(preview.prestige?.echoes || 0),
    source: "extraction",
  });

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
    <OverlayShell isMobile={isMobile} zIndex={9200}>
      <div style={{ width: "100%", maxWidth: "980px", maxHeight: "100%", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "18px 16px 20px" : "20px 22px 22px" }}>
        <style>{`
          @keyframes extractionSpotlightPulse {
            0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.22); }
            70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
            100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
          }
        `}</style>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: expedition.exitReason === "death" ? "var(--tone-danger, #D85A30)" : "var(--tone-accent, #4338ca)" }}>
              {formatExitLabel(expedition.exitReason)}
            </div>
            <div style={{ fontSize: isMobile ? "1.08rem" : "1.18rem", fontWeight: "900", marginTop: "4px" }}>
              Cierra la expedicion y elige que vuelve al Santuario
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45, maxWidth: "60ch" }}>
              El valor meta ya no vive solo en la corrida. Elige bundles persistentes y, si la salida lo permite, un item para rescatar temporalmente en el Santuario.
            </div>
          </div>
          <div style={{ display: "grid", gap: "6px", justifyItems: isMobile ? "stretch" : "end" }}>
            <div style={{ padding: "8px 10px", borderRadius: "999px", background: expedition.exitReason === "death" ? "var(--tone-danger-soft, #fff1f2)" : "var(--tone-accent-soft, #eef2ff)", border: "1px solid", borderColor: expedition.exitReason === "death" ? "rgba(244,63,94,0.18)" : "rgba(99,102,241,0.18)", color: expedition.exitReason === "death" ? "var(--tone-danger, #D85A30)" : "var(--tone-accent, #4338ca)", fontSize: "0.66rem", fontWeight: "900" }}>
              {expedition.exitReason === "death" ? "Riesgo activo" : "Salida controlada"}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>
              {preview.prestige?.mode === "echoes"
                ? `Conversion a ecos lista: +${preview.prestige.echoes || 0} ecos`
                : preview.prestige?.mode === "emergency"
                  ? `Conversion de emergencia: +${preview.prestige.echoes || 0} ecos`
                  : "Sin conversion a ecos en esta salida"}
            </div>
          </div>
        </div>

        <section style={{ ...panelStyle(), gridTemplateColumns: isMobile ? "repeat(2, minmax(0,1fr))" : "repeat(4, minmax(0,1fr))" }}>
          <Metric label="Tier maximo" value={summary.maxTier || 1} />
          <Metric label="Bosses" value={summary.bossesKilled || 0} />
          <Metric label="Kills" value={summary.kills || 0} />
          <Metric label="Duracion" value={`${summary.durationTicks || 0} ticks`} />
        </section>

        <section style={panelStyle()}>
          <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
            Que pasa despues
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
            {extractionSteps.map(step => (
              <div key={step.label} style={{ background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "10px", display: "grid", gap: "4px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{step.label}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {step.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={panelStyle()}>
          <div style={{ display: "grid", gap: "4px" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
              Resumen de salida
            </div>
            <div style={{ fontSize: "0.94rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
              {outcomeSummary.title}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
            {outcomeSummary.groups.map(group => (
              <OutcomeGroup key={group.id} group={group} />
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr", gap: "12px" }}>
          <div style={panelStyle()}>
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
                        {expedition.exitReason === "death" ? `Recuperas ${option.recoveredQuantity}` : `x${option.recoveredQuantity}`}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            <div style={panelStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
                    Item rescatado
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: "900", marginTop: "2px" }}>
                    {Number(preview.availableSlots?.project || 0) > 0 ? "Guarda una pieza para decidir luego" : "Sin slot disponible"}
                  </div>
                </div>
                <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                  {preview.availableSlots?.project || 0} slot
                </div>
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                {projectOptions.length === 0 ? (
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-tertiary, #94a3b8)", lineHeight: 1.45 }}>
                    {expedition.exitReason === "death"
                      ? "La salida de emergencia no asegura items rescatados. Mas adelante entran seguros."
                      : "No aparecieron candidatos elegibles para rescatar en esta salida."}
                  </div>
              ) : projectOptions.map(option => {
                const active = selectedProjectItemId === option.itemId;
                const spotlight = tutorialProjectTargetId === option.itemId;
                const disabled =
                  Number(preview.availableSlots?.project || 0) <= 0 ||
                  (Boolean(tutorialProjectTargetId) && !spotlight);
                return (
                    <button
                      key={option.itemId}
                      onClick={() => !disabled && dispatch({ type: "SELECT_EXTRACTION_PROJECT", itemId: option.itemId })}
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
                        <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                          {Math.round(option.rating || 0)}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
                        {option.rarity} · {option.type} · {option.affixCount} affix
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={panelStyle()}>
              <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                Conversion
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {preview.prestige?.mode === "echoes"
                  ? `+${preview.prestige.echoes || 0} ecos al confirmar`
                  : preview.prestige?.mode === "emergency"
                    ? `Conversion de emergencia: +${preview.prestige.echoes || 0} ecos`
                    : expedition.exitReason === "death"
                      ? "Sin ecos a menos que la run ya hubiera alcanzado el gate"
                      : "Salida sin conversion de ecos"}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                {expedition.exitReason === "death"
                  ? "La salida por muerte recupera menos cargo y no asegura items rescatados en este MVP."
                  : "El item rescatado no vuelve como gear directo. Luego decides si romperlo o convertirlo en blueprint."}
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
            {summary.bestDropName
              ? `Mejor drop de la expedicion: ${summary.bestDropName}${summary.bestDropRarity ? ` · ${summary.bestDropRarity}` : ""}.`
              : "No hubo drop destacado en esta salida."}
          </div>
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
                ...actionButtonStyle({ primary: preview.prestige?.mode !== "emergency", danger: preview.prestige?.mode === "emergency" }),
                position: onboardingStep === ONBOARDING_STEPS.EXTRACTION_CONFIRM ? "relative" : "static",
                zIndex: onboardingStep === ONBOARDING_STEPS.EXTRACTION_CONFIRM ? 2 : 1,
                animation: onboardingStep === ONBOARDING_STEPS.EXTRACTION_CONFIRM ? "extractionSpotlightPulse 1600ms ease-in-out infinite" : "none",
              }}
            >
              {preview.prestige?.mode === "echoes"
                ? "Extraer y convertir a ecos"
                : preview.prestige?.mode === "emergency"
                  ? "Aceptar emergencia"
                  : "Confirmar extraccion"}
            </button>
          </div>
        </div>
      </div>
    </OverlayShell>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "10px 12px", display: "grid", gap: "4px" }}>
      <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{value}</div>
    </div>
  );
}

function OutcomeGroup({ group }) {
  return (
    <div
      style={{
        background: "var(--color-background-tertiary, #f8fafc)",
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        borderRadius: "12px",
        padding: "10px",
        display: "grid",
        gap: "8px",
        alignContent: "start",
      }}
    >
      <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {group.label}
      </div>
      <ul style={{ margin: 0, paddingLeft: "16px", display: "grid", gap: "6px", color: "var(--color-text-secondary, #64748b)", fontSize: "0.68rem", lineHeight: 1.45 }}>
        {group.items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
