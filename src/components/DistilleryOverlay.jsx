import React, { useEffect, useMemo, useRef, useState } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import JobProgressBar from "./JobProgressBar";
import ActionToast from "./ActionToast";
import { FlBadge, FlButton, FlMetricGrid, FlPanel, FlPanelHeader } from "./ui/forge";
import useRelativeNow from "../hooks/useRelativeNow";
import {
  getEffectiveOnboardingStep,
  getOnboardingTutorialBundleId,
  ONBOARDING_STEPS,
} from "../engine/onboarding/onboardingEngine";

function panelClass(tone = "violet") {
  return [
    "fl-station-panel",
    `fl-station-panel--${tone}`,
  ].join(" ");
}

function chipLabelClass(tone = "violet") {
  return [
    "fl-station-chip",
    `fl-station-chip--${tone}`,
  ].join(" ");
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

export default function DistilleryOverlay({ state, dispatch, isMobile = false, embedded = false, onClose }) {
  const now = useRelativeNow();
  const [actionToast, setActionToast] = useState(null);
  const [expandedSections, setExpandedSections] = useState(() => {
    const sanctuary = state?.sanctuary || {};
    const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
    const hasActiveDistilleryJobs = jobs.some(
      job =>
        job?.station === "distillery" &&
        (job?.status === "running" || job?.status === "claimable")
    );
    return {
      cargo: true,
      jobs: hasActiveDistilleryJobs,
    };
  });
  const tutorialStartGuardRef = useRef({ cargoId: null, at: 0 });
  const toastTimerRef = useRef(null);

  useEffect(() => () => {
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
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

  function showActionToast(message, tone = "success") {
    const id = Date.now();
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setActionToast({ id, message, tone });
    toastTimerRef.current = window.setTimeout(() => {
      setActionToast(current => (current?.id === id ? null : current));
      toastTimerRef.current = null;
    }, 1700);
  }

  function pickRestartCargoId(preferredType = null, pool = []) {
    if (!Array.isArray(pool) || pool.length <= 0) return null;
    const preferredIndex = preferredType
      ? pool.findIndex(entry => entry?.type === preferredType)
      : -1;
    const index = preferredIndex >= 0 ? preferredIndex : 0;
    const selected = pool[index];
    if (!selected?.id) return null;
    pool.splice(index, 1);
    return selected.id;
  }

  function claimDistilleryJob(job, { restart = false, restartCargoId = null, nowAt = Date.now() } = {}) {
    if (!job?.id) return false;
    dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now: nowAt });
    if (!restart || !restartCargoId) return false;
    dispatch({ type: "START_DISTILLERY_JOB", cargoId: restartCargoId, now: nowAt + 1 });
    return true;
  }

  function claimAllDistilleryJobs({ restart = false } = {}) {
    if (claimableJobs.length <= 0) return;
    const claimAt = Date.now();
    const restartPool = [...cargoInventory];
    let restartedCount = 0;
    claimableJobs.forEach((job, index) => {
      const restartCargoId = restart
        ? pickRestartCargoId(job?.input?.cargoType || null, restartPool)
        : null;
      const restarted = claimDistilleryJob(job, {
        restart,
        restartCargoId,
        nowAt: claimAt + (index * 2),
      });
      if (restarted) restartedCount += 1;
    });
    showActionToast(
      restart
        ? `Reclamaste ${claimableJobs.length} y relanzaste ${restartedCount}.`
        : `Reclamaste ${claimableJobs.length} trabajos de Destilería.`,
      restart ? "info" : "success"
    );
  }

  const canRepeatClaimedDistillery = claimableJobs.length > 0 && cargoInventory.length > 0;

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
    setExpandedSections(current => (
      current?.cargo
        ? current
        : { ...current, cargo: true }
    ));
    return undefined;
  }, [onboardingStep]);

  useEffect(() => {
    if (onboardingStep !== ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) return undefined;

    let frameId = null;
    let timeoutId = null;
    let attempts = 0;

    const scrollToTutorialBundle = () => {
      const target =
        document.querySelector('[data-onboarding-target="tutorial-distillery-bundle"]') ||
        document.querySelector('[data-onboarding-target="tutorial-distillery-start"]');
      if (!(target instanceof HTMLElement)) {
        attempts += 1;
        if (attempts < 12) {
          timeoutId = window.setTimeout(() => {
            frameId = window.requestAnimationFrame(scrollToTutorialBundle);
          }, 90);
        }
        return;
      }

      const topSafe = isMobile ? 120 : 112;
      const bottomSafe = isMobile ? 92 : 28;
      const visibleBottom = Math.max(topSafe + 48, window.innerHeight - bottomSafe);

      target.scrollIntoView({
        block: isMobile ? "center" : "start",
        inline: "nearest",
        behavior: "auto",
      });

      const rect = target.getBoundingClientRect();
      if (rect.top < topSafe) {
        window.scrollBy({
          top: rect.top - topSafe - 10,
          behavior: "auto",
        });
      } else if (rect.bottom > visibleBottom) {
        window.scrollBy({
          top: rect.bottom - visibleBottom + 10,
          behavior: "auto",
        });
      }

      attempts += 1;
      if (attempts < 6) {
        timeoutId = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(scrollToTutorialBundle);
        }, 90);
      }
    };

    frameId = requestAnimationFrame(scrollToTutorialBundle);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [cargoInventory.length, expandedSections?.cargo, isMobile, onboardingStep]);

  const content = (
    <div
      className="fl-station-overlay fl-station-overlay--distillery overlay-station-body overlay-station-body--forge"
    >
          <FlPanel
            variant="compact"
            className="fl-distillery-hero-panel"
            header={(
              <FlPanelHeader
                title="Destileria"
                subtitle="Procesamiento del Santuario"
                copy="Convierte bundles en tinta, flux y polvo."
                actions={(
                  <FlButton variant="secondary" size="sm" onClick={onClose}>
                    Volver
                  </FlButton>
                )}
              />
            )}
          >
            <div className="fl-distillery-hero-panel__chips">
              <FlBadge variant="pill" size="xs" tone="arcane">
                {runningJobs.length} / {distillerySlots} jobs
              </FlBadge>
              <FlBadge variant="pill" size="xs" tone="warning">
                {claimableJobs.length} claims
              </FlBadge>
            </div>
            <FlMetricGrid
              className="fl-distillery-hero-metrics"
              columns={4}
              mobileColumns={3}
              compact
              items={[
                {
                  id: "dist-bundles",
                  label: "Bundles",
                  value: totalBundleQuantity,
                  tone: "warning",
                },
                {
                  id: "dist-ink",
                  label: "Tinta",
                  value: Math.floor(Number(resources?.codexInk || 0)).toLocaleString(),
                  tone: "arcane",
                },
                {
                  id: "dist-flux",
                  label: "Flux",
                  value: Math.floor(Number(resources?.sigilFlux || 0)).toLocaleString(),
                  tone: "defense",
                },
                {
                  id: "dist-dust",
                  label: "Polvo",
                  value: Math.floor(Number(resources?.relicDust || 0)).toLocaleString(),
                  tone: "success",
                },
              ]}
            />
          </FlPanel>

          <section className={panelClass("violet")}>
            <div
              onClick={() => toggleSection("cargo")}
              {...{ style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" } }}
            >
              <div>
                <div {...{ style: { fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" } }}>
                  Cargo en espera
                </div>
                <div {...{ style: { fontSize: "1rem", fontWeight: "900", marginTop: "4px" } }}>
                  Bundles listos para refinar
                </div>
              </div>
              <FlButton
                variant="ghost"
                size="xs"
                onClick={event => {
                  event.stopPropagation();
                  toggleSection("cargo");
                }}
              >
                {expandedSections?.cargo ? "-" : "+"}
              </FlButton>
            </div>

            {expandedSections?.cargo && (cargoInventory.length === 0 ? (
              <div {...{ style: { fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 } }}>
                No hay cargo persistente en espera. Extrae bundles desde una expedición para alimentar esta estación.
              </div>
            ) : (
              <div {...{ style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" } }}>
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
                      {...{ style: {
                        padding: "9px 10px",
                        gap: "6px",
                        background: "var(--fl-surface-bg-soft)",
                        border: "1px solid var(--fl-surface-border)",
                        borderRadius: "12px",
                        display: "grid",
                        position: tutorialBundleActive ? "relative" : "static",
                        zIndex: tutorialBundleActive ? 2 : 1,
                        boxShadow: tutorialBundleActive
                          ? "0 0 0 2px rgba(124,58,237,0.18), 0 12px 28px rgba(124,58,237,0.14)"
                          : "0 8px 18px rgba(0,0,0,0.22)",
                        animation: tutorialBundleActive ? "distillerySpotlightPulse 1600ms ease-in-out infinite" : "none",
                        cursor: tutorialBundleActive && !blocked ? "pointer" : "default",
                        touchAction: tutorialBundleActive ? "manipulation" : "auto",
                        pointerEvents: "auto",
                      } }}
                    >
                      <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" } }}>
                        <div>
                          <div {...{ style: { fontSize: "0.82rem", fontWeight: "900", lineHeight: 1.2 } }}>{bundle.label}</div>
                          <div {...{ style: { fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 } }}>
                            {bundle.description}
                          </div>
                        </div>
                        <div {...{ style: { display: "grid", gap: "4px", justifyItems: "end", textAlign: "right" } }}>
                          <span className={chipLabelClass("violet")}>x{Math.max(1, Number(bundle?.quantity || 1))}</span>
                          <span {...{ style: { fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" } }}>
                            {preview.amount} {preview.label} · {preview.duration}
                          </span>
                        </div>
                      </div>

                      <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
                        <div {...{ style: { fontSize: "0.62rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" } }}>
                          {blocked ? "No hay slot libre en la Destilería." : "Listo para procesarse en tiempo real."}
                        </div>
                        <FlButton
                          variant={!blocked ? "default" : "secondary"}
                          size="sm"
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
                          {...{ style: {
                            position: tutorialBundleActive ? "relative" : "static",
                            zIndex: tutorialBundleActive ? 3 : 1,
                            touchAction: tutorialBundleActive ? "manipulation" : "auto",
                            pointerEvents: "auto",
                          } }}
                        >
                          {tutorialLocked ? "Bloqueado por tutorial" : "Destilar"}
                        </FlButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </section>

          {(runningJobs.length > 0 || claimableJobs.length > 0) && (
            <section className={panelClass("warning")}>
              <div
                onClick={() => toggleSection("jobs")}
                {...{ style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" } }}
              >
                <div>
                  <div {...{ style: { fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" } }}>
                    Trabajos de la estación
                  </div>
                  <div {...{ style: { fontSize: "1rem", fontWeight: "900", marginTop: "4px" } }}>
                    Estado de refinado
                  </div>
                </div>
                <div {...{ style: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" } }}>
                  {canRepeatClaimedDistillery && (
                    <FlButton
                      variant="secondary"
                      size="sm"
                      onClick={event => {
                        event.stopPropagation();
                        claimAllDistilleryJobs({ restart: true });
                      }}
                    >
                      Todo + repetir
                    </FlButton>
                  )}
                  {claimableJobs.length > 1 && (
                    <FlButton
                      variant="default"
                      size="sm"
                      onClick={event => {
                        event.stopPropagation();
                        claimAllDistilleryJobs();
                      }}
                    >
                      Reclamar todo
                    </FlButton>
                  )}
                  <FlButton
                    variant="ghost"
                    size="xs"
                    onClick={event => {
                      event.stopPropagation();
                      toggleSection("jobs");
                    }}
                  >
                    {expandedSections?.jobs ? "-" : "+"}
                  </FlButton>
                </div>
              </div>

              {expandedSections?.jobs && claimableJobs.length > 0 && (
                <div {...{ style: { display: "grid", gap: "8px" } }}>
                  {claimableJobs.map(job => (
                    <div key={job.id} {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap", padding: "6px 0" } }}>
                      <div>
                        <div {...{ style: { fontSize: "0.72rem", fontWeight: "900" } }}>{job.output?.label || "Refinado listo"}</div>
                        <div {...{ style: { fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" } }}>
                          {job.output?.amount || 0} listo para reclamar
                        </div>
                      </div>
                      <FlButton
                        variant="default"
                        size="sm"
                        onClick={() => claimDistilleryJob(job, { nowAt: now })}
                      >
                        Reclamar
                      </FlButton>
                    </div>
                  ))}
                </div>
              )}

              {expandedSections?.jobs && runningJobs.length > 0 && (
                <div {...{ style: { display: "grid", gap: "8px" } }}>
                  {runningJobs.map(job => (
                    <div key={job.id} {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap", padding: "6px 0" } }}>
                      <div>
                        <div {...{ style: { fontSize: "0.72rem", fontWeight: "900" } }}>{job.output?.label || "Refinado"}</div>
                        <div {...{ style: { fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" } }}>
                          {job.output?.amount || 0} en proceso
                        </div>
                      </div>
                      <div className="overlay-job-progress-wrap">
                        <JobProgressBar
                          startedAt={job?.startedAt}
                          endsAt={job?.endsAt}
                          now={now}
                          tone="var(--tone-info, #0369a1)"
                          rightLabel={formatRemaining(Number(job?.endsAt || 0) - now)}
                          compact
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
    </div>
  );

  if (embedded) {
    return (
      <>
        {content}
        <ActionToast toast={actionToast} isMobile={isMobile} />
      </>
    );
  }

  return (
    <OverlayShell isMobile={isMobile} embedded={embedded} variant="forge" contentLabel="Destileria">
      <OverlaySurface
        isMobile={isMobile}
        embedded={embedded}
        variant="forge"
        className="fl-station-overlay fl-station-overlay--distillery"
      >
        {content}
      </OverlaySurface>
      <ActionToast toast={actionToast} isMobile={isMobile} />
    </OverlayShell>
  );
}
