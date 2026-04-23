import React, { useEffect, useMemo, useRef, useState } from "react";
import OverlayShell from "./OverlayShell";
import {
  getEffectiveOnboardingStep,
  getOnboardingTutorialBundleId,
  ONBOARDING_STEPS,
} from "../engine/onboarding/onboardingEngine";

function panelStyle(accent = "var(--tone-violet, #7c3aed)") {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderTop: `3px solid ${accent}`,
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "12px",
    boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
  };
}

function metricCardStyle() {
  return {
    background: "var(--color-background-tertiary, #f8fafc)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "12px",
    padding: "10px 12px",
    display: "grid",
    gap: "4px",
  };
}

function actionButtonStyle({ primary = false, disabled = false, compact = false } = {}) {
  return {
    border: "1px solid",
    borderColor: disabled
      ? "var(--color-border-primary, #e2e8f0)"
      : primary
        ? "var(--tone-violet, #7c3aed)"
        : "var(--color-border-primary, #e2e8f0)",
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : primary
        ? "var(--tone-violet-soft, #f3e8ff)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : primary
        ? "var(--tone-violet, #7c3aed)"
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: compact ? "7px 11px" : "10px 14px",
    fontSize: compact ? "0.68rem" : "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function chipLabelStyle(color = "var(--tone-violet, #7c3aed)") {
  return {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "24px",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-tertiary, #f8fafc)",
    color,
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "0.62rem",
    fontWeight: "900",
    lineHeight: 1,
  };
}

function formatRemaining(ms = 0) {
  const remainingMs = Math.max(0, Number(ms || 0));
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getDistillPreview(bundle = {}) {
  const quantity = Math.max(1, Number(bundle?.quantity || 1));
  if (bundle?.type === "essence_cache") {
    return { amount: quantity * 45, label: "Esencia refinada", duration: "20m" };
  }
  if (bundle?.type === "codex_trace") {
    return { amount: quantity, label: "Tinta de Biblioteca", duration: "30m" };
  }
  if (bundle?.type === "sigil_residue") {
    return { amount: quantity, label: "Flux de Sigilo", duration: "45m" };
  }
  if (bundle?.type === "relic_shard") {
    return { amount: quantity, label: "Polvo de Reliquia", duration: "60m" };
  }
  return { amount: quantity, label: "Recurso refinado", duration: "20m" };
}

export default function DistilleryOverlay({ state, dispatch, isMobile = false, onClose }) {
  const [now, setNow] = useState(Date.now());
  const [expandedSections, setExpandedSections] = useState({
    cargo: false,
    jobs: false,
  });
  const tutorialStartGuardRef = useRef({ cargoId: null, at: 0 });

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const sanctuary = state.sanctuary || {};
  const onboardingStep = getEffectiveOnboardingStep(state?.onboarding?.step || null, {
    ...state,
    __liveNow: now,
  });
  const tutorialBundleId = getOnboardingTutorialBundleId(state);
  const cargoInventory = Array.isArray(sanctuary?.cargoInventory) ? sanctuary.cargoInventory : [];
  const resources = sanctuary?.resources || {};
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const distillerySlots = Math.max(1, Number(sanctuary?.stations?.distillery?.slots || 1));

  const runningJobs = useMemo(
    () => jobs.filter(job => job?.station === "distillery" && job?.status === "running"),
    [jobs]
  );
  const claimableJobs = useMemo(
    () => jobs.filter(job => job?.station === "distillery" && job?.status === "claimable"),
    [jobs]
  );
  const totalBundleQuantity = cargoInventory.reduce((total, bundle) => total + Math.max(0, Number(bundle?.quantity || 0)), 0);

  function startDistilleryJob(cargoId) {
    const triggerAt = Date.now();
    const lastTrigger = tutorialStartGuardRef.current;
    if (lastTrigger.cargoId === cargoId && triggerAt - lastTrigger.at < 400) {
      return;
    }
    tutorialStartGuardRef.current = { cargoId, at: triggerAt };
    dispatch({
      type:
        onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
          ? "START_TUTORIAL_DISTILLERY_JOB"
          : "START_DISTILLERY_JOB",
      cargoId,
      now: triggerAt,
    });
  }

  function handleTutorialBundleStart(event, cargoId, blocked) {
    if (blocked) return;
    event?.preventDefault?.();
    startDistilleryJob(cargoId);
  }

  function toggleSection(section) {
    setExpandedSections(current => ({
      ...current,
      [section]: !current?.[section],
    }));
  }

  useEffect(() => {
    if (onboardingStep !== ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) return undefined;

    let frameId = null;
    const scrollToTutorialBundle = () => {
      const target =
        document.querySelector('[data-onboarding-target="tutorial-distillery-start"]') ||
        document.querySelector('[data-onboarding-target="tutorial-distillery-bundle"]');
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    frameId = requestAnimationFrame(scrollToTutorialBundle);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
    };
  }, [cargoInventory.length, onboardingStep]);

  return (
    <OverlayShell isMobile={isMobile}>
      <div style={{ width: "100%", maxWidth: "1220px", maxHeight: "100%", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "12px 10px 16px" : "14px 14px 16px" }}>
        <style>{`
          @keyframes distillerySpotlightPulse {
            0% { box-shadow: 0 0 0 0 rgba(124,58,237,0.22); }
            70% { box-shadow: 0 0 0 10px rgba(124,58,237,0); }
            100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
          }
        `}</style>
        <div style={{ padding: "1rem", display: "grid", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
          <section style={panelStyle("var(--tone-violet, #7c3aed)")}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "12px", alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
                  Destileria
                </div>
                <div style={{ fontSize: "1.02rem", fontWeight: "900", marginTop: "4px" }}>
                  Refinado del Santuario
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35, maxWidth: "56ch" }}>
                  Convierte bundles en tinta, flux y polvo.
                </div>
              </div>
              <button onClick={onClose} style={{ ...actionButtonStyle({ compact: true }), flex: "0 0 auto" }}>
                Volver
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={chipLabelStyle("var(--tone-violet, #7c3aed)")}>
                {runningJobs.length} / {distillerySlots} jobs
              </span>
              <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                {claimableJobs.length} claims
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Bundles</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{totalBundleQuantity}</div>
              </div>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Tinta</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{Math.floor(Number(resources?.codexInk || 0)).toLocaleString()}</div>
              </div>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Flux</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{Math.floor(Number(resources?.sigilFlux || 0)).toLocaleString()}</div>
              </div>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Polvo</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{Math.floor(Number(resources?.relicDust || 0)).toLocaleString()}</div>
              </div>
            </div>
          </section>

          <section style={panelStyle("var(--tone-violet, #7c3aed)")}>
            <div
              onClick={() => toggleSection("cargo")}
              style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" }}
            >
              <div>
                <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
                  Cargo en espera
                </div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                  Bundles listos para refinar
                </div>
              </div>
              <button
                onClick={event => {
                  event.stopPropagation();
                  toggleSection("cargo");
                }}
                style={{ ...actionButtonStyle({ compact: true }), minWidth: "34px", padding: "4px 0", flex: "0 0 auto" }}
              >
                {expandedSections?.cargo ? "-" : "+"}
              </button>
            </div>

            {expandedSections?.cargo && (cargoInventory.length === 0 ? (
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                No hay cargo persistente en espera. Extrae bundles desde una expedición para alimentar esta estación.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                {cargoInventory.map(bundle => {
                  const preview = getDistillPreview(bundle);
                  const tutorialBundleActive =
                    onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB &&
                    bundle.id === tutorialBundleId;
                  const tutorialLocked =
                    onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB &&
                    bundle.id !== tutorialBundleId;
                  const blocked =
                    tutorialLocked ||
                    (!tutorialBundleActive && runningJobs.length >= distillerySlots);
                  return (
                    <div
                      key={bundle.id}
                      onPointerUp={
                        tutorialBundleActive
                          ? event => handleTutorialBundleStart(event, bundle.id, blocked)
                          : undefined
                      }
                      onTouchEnd={
                        tutorialBundleActive
                          ? event => handleTutorialBundleStart(event, bundle.id, blocked)
                          : undefined
                      }
                      onClick={
                        tutorialBundleActive
                          ? event => handleTutorialBundleStart(event, bundle.id, blocked)
                          : undefined
                      }
                      data-onboarding-target={
                        tutorialBundleActive
                          ? "tutorial-distillery-bundle"
                          : undefined
                      }
                      style={{
                        ...metricCardStyle(),
                        padding: "9px 10px",
                        gap: "6px",
                        position: tutorialBundleActive ? "relative" : "static",
                        zIndex: tutorialBundleActive ? 2 : 1,
                        boxShadow: tutorialBundleActive
                          ? "0 0 0 2px rgba(124,58,237,0.18), 0 12px 28px rgba(124,58,237,0.14)"
                          : metricCardStyle().boxShadow,
                        animation: tutorialBundleActive ? "distillerySpotlightPulse 1600ms ease-in-out infinite" : "none",
                        cursor: tutorialBundleActive && !blocked ? "pointer" : "default",
                        touchAction: tutorialBundleActive ? "manipulation" : "auto",
                        pointerEvents: "auto",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: "900" }}>{bundle.label}</div>
                          <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 }}>
                            {bundle.description}
                          </div>
                        </div>
                        <div style={{ display: "grid", gap: "4px", justifyItems: "end" }}>
                          <span style={chipLabelStyle("var(--tone-violet, #7c3aed)")}>x{Math.max(1, Number(bundle?.quantity || 1))}</span>
                          <span style={{ fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" }}>
                            {preview.amount} {preview.label} · {preview.duration}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontSize: "0.62rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                          {blocked ? "No hay slot libre en la Destilería." : "Listo para procesarse en tiempo real."}
                        </div>
                        <button
                          onPointerUp={
                            tutorialBundleActive
                              ? event => {
                                  event.stopPropagation();
                                  handleTutorialBundleStart(event, bundle.id, blocked);
                                }
                              : undefined
                          }
                          onTouchEnd={
                            tutorialBundleActive
                              ? event => {
                                  event.stopPropagation();
                                  handleTutorialBundleStart(event, bundle.id, blocked);
                                }
                              : undefined
                          }
                          onClick={
                            tutorialBundleActive
                              ? event => {
                                  event.stopPropagation();
                                  handleTutorialBundleStart(event, bundle.id, blocked);
                                }
                              : () => startDistilleryJob(bundle.id)
                          }
                          disabled={blocked}
                          data-onboarding-target={
                            tutorialBundleActive
                              ? "tutorial-distillery-start"
                              : undefined
                          }
                          style={{
                            ...actionButtonStyle({ primary: !blocked, disabled: blocked, compact: true }),
                            position: tutorialBundleActive ? "relative" : "static",
                            zIndex: tutorialBundleActive ? 3 : 1,
                            touchAction: tutorialBundleActive ? "manipulation" : "auto",
                            pointerEvents: "auto",
                          }}
                        >
                          {tutorialLocked ? "Bloqueado por tutorial" : "Destilar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </section>

          {(runningJobs.length > 0 || claimableJobs.length > 0) && (
            <section style={panelStyle("var(--tone-warning, #f59e0b)")}>
              <div
                onClick={() => toggleSection("jobs")}
                style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" }}
              >
                <div>
                  <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                    Trabajos de la estación
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                    Estado de refinado
                  </div>
                </div>
                <button
                  onClick={event => {
                    event.stopPropagation();
                    toggleSection("jobs");
                  }}
                  style={{ ...actionButtonStyle({ compact: true }), minWidth: "34px", padding: "4px 0", flex: "0 0 auto" }}
                >
                  {expandedSections?.jobs ? "-" : "+"}
                </button>
              </div>

              {expandedSections?.jobs && claimableJobs.length > 0 && (
                <div style={{ display: "grid", gap: "8px" }}>
                  {claimableJobs.map(job => (
                    <div key={job.id} style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap", padding: "6px 0" }}>
                      <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>{job.output?.label || "Refinado listo"}</div>
                        <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>
                          {job.output?.amount || 0} listo para reclamar
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now })}
                        style={actionButtonStyle({ primary: true })}
                      >
                        Reclamar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {expandedSections?.jobs && runningJobs.length > 0 && (
                <div style={{ display: "grid", gap: "8px" }}>
                  {runningJobs.map(job => (
                    <div key={job.id} style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap", padding: "6px 0" }}>
                      <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>{job.output?.label || "Refinado"}</div>
                        <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>
                          {job.output?.amount || 0} en proceso
                        </div>
                      </div>
                      <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                        {formatRemaining(Number(job.endsAt || 0) - now)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </OverlayShell>
  );
}
