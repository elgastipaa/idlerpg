import React, { useEffect, useMemo, useState } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import JobProgressBar from "./JobProgressBar";
import ActionToast from "./ActionToast";
import { getSanctuaryErrandCatalog } from "../engine/sanctuary/jobEngine";
import useRelativeNow from "../hooks/useRelativeNow";

function panelStyle(accent = "var(--tone-info, #0369a1)") {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderTop: `3px solid ${accent}`,
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "12px",
    alignSelf: "start",
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

function actionButtonStyle({ primary = false, disabled = false, danger = false, compact = false } = {}) {
  const tone = danger
    ? "var(--tone-danger, #D85A30)"
    : primary
      ? "var(--tone-info, #0369a1)"
      : "var(--color-border-primary, #e2e8f0)";
  const surface = danger
    ? "var(--tone-danger-soft, #fff1f2)"
    : primary
      ? "var(--tone-info-soft, #f0f9ff)"
      : "var(--color-background-secondary, #ffffff)";
  return {
    border: "1px solid",
    borderColor: disabled ? "var(--color-border-primary, #e2e8f0)" : tone,
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : surface,
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : danger || primary
        ? tone
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: compact ? "7px 11px" : "10px 14px",
    fontSize: compact ? "0.68rem" : "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function chipLabelStyle(color = "var(--tone-info, #0369a1)") {
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

function getProgressTier(state) {
  return Math.max(
    1,
    Number(state?.combat?.maxTier || 1),
    Number(state?.combat?.prestigeCycle?.maxTier || 1),
    Number(state?.combat?.analytics?.maxTierReached || 1),
    Number(state?.prestige?.bestHistoricTier || 1)
  );
}

export default function EncargosOverlay({ state, dispatch, isMobile = false, onClose }) {
  const now = useRelativeNow();
  const [actionToast, setActionToast] = useState(null);
  const [expandedSections, setExpandedSections] = useState(() => {
    const sanctuary = state?.sanctuary || {};
    const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
    const hasClaimable = jobs.some(job => job?.station === "errands" && job?.status === "claimable");
    const hasRunning = jobs.some(job => job?.station === "errands" && job?.status === "running");
    return {
      catalog: true,
      claimable: hasClaimable,
      running: hasRunning,
    };
  });
  const [expandedCatalogEntries, setExpandedCatalogEntries] = useState(() => {
    const initialCatalog = getSanctuaryErrandCatalog(getProgressTier(state));
    const firstEntryId = initialCatalog?.[0]?.id;
    return firstEntryId ? { [firstEntryId]: true } : {};
  });

  useEffect(() => {
    if (!actionToast?.id) return undefined;
    const id = window.setTimeout(() => setActionToast(null), 1700);
    return () => window.clearTimeout(id);
  }, [actionToast?.id]);

  const sanctuary = state.sanctuary || {};
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const errandSlots = Math.max(1, Number(sanctuary?.stations?.errands?.slots || 2));
  const runningJobs = useMemo(
    () => jobs.filter(job => job?.station === "errands" && job?.status === "running"),
    [jobs]
  );
  const claimableJobs = useMemo(
    () => jobs.filter(job => job?.station === "errands" && job?.status === "claimable"),
    [jobs]
  );
  const progressTier = getProgressTier(state);
  const catalog = useMemo(() => getSanctuaryErrandCatalog(progressTier), [progressTier]);
  const availableSlots = Math.max(0, errandSlots - runningJobs.length);
  const statusFlavor =
    claimableJobs.length > 0
      ? "El equipo ha vuelto. Han recuperado materiales y fragmentos utiles."
      : runningJobs.length > 0
        ? "Un grupo del Santuario esta en mision. Regresara en breve."
        : "El Santuario tiene equipos disponibles. Asigna un encargo y volveran con recursos utiles.";

  function claimErrandJob(job, { restart = false, nowAt = Date.now() } = {}) {
    if (!job?.id) return;
    dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now: nowAt });
    if (!restart || !job?.input?.errandId) return;
    dispatch({
      type: "START_SANCTUARY_ERRAND",
      errandId: job.input.errandId,
      durationId: job.input.durationId || "short",
      now: nowAt + 1,
    });
  }

  function claimAllErrandJobs({ restart = false } = {}) {
    if (claimableJobs.length <= 0) return;
    const claimAt = Date.now();
    let restartedCount = 0;
    claimableJobs.forEach((job, index) => {
      const canRestart = restart && Boolean(job?.input?.errandId);
      claimErrandJob(job, { restart: canRestart, nowAt: claimAt + (index * 2) });
      if (canRestart) restartedCount += 1;
    });
    setActionToast({
      id: Date.now(),
      tone: restart ? "info" : "success",
      message: restart
        ? `Reclamaste ${claimableJobs.length} y relanzaste ${restartedCount}.`
        : `Reclamaste ${claimableJobs.length} encargos.`,
    });
  }

  const canRepeatClaimedErrands = claimableJobs.some(job => job?.input?.errandId);

  function toggleSection(section) {
    setExpandedSections(current => ({
      ...current,
      [section]: !current?.[section],
    }));
  }

  function toggleCatalogEntry(entryId) {
    setExpandedCatalogEntries(current => ({
      ...current,
      [entryId]: !current?.[entryId],
    }));
  }

  return (
    <OverlayShell isMobile={isMobile} contentLabel="Encargos">
      <OverlaySurface isMobile={isMobile}>
        <div style={{
          padding: "1rem",
          display: "grid",
          gap: "1rem",
          alignItems: "start",
          alignContent: "start",
          background: "var(--color-background-primary, #f8fafc)",
          color: "var(--color-text-primary, #1e293b)",
        }}>
          <section style={panelStyle("var(--tone-info, #0369a1)")}>
            <div style={{ display: "grid", gap: "12px", alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                  Encargos
                </div>
                <div style={{ fontSize: "1.02rem", fontWeight: "900", marginTop: "4px" }}>
                  Misiones auxiliares del Santuario
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35, maxWidth: "56ch" }}>
                  Asigna equipos secundarios para recuperar recursos sin frenar la expedición principal.
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px", lineHeight: 1.35, maxWidth: "56ch" }}>
                  {statusFlavor}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                {runningJobs.length} / {errandSlots} ocupados
              </span>
              <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                {claimableJobs.length} listos
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                  Equipos
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{errandSlots}</div>
              </div>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                  Libres
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{availableSlots}</div>
              </div>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                  Tier
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{progressTier}</div>
              </div>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                  En curso
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{runningJobs.length}</div>
              </div>
              <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                  Listas
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{claimableJobs.length}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ ...actionButtonStyle({ compact: true }), flex: "0 0 auto" }}>
                Volver
              </button>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.08fr 0.92fr", gap: "12px" }}>
            <div style={panelStyle("var(--tone-info, #0369a1)")}>
              <div
                onClick={() => toggleSection("catalog")}
                style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" }}
              >
                <div>
                  <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                    Catalogo de encargos
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                    Elegi direccion, duracion y recompensa
                  </div>
                </div>
                <button
                  onClick={event => {
                    event.stopPropagation();
                    toggleSection("catalog");
                  }}
                  style={{ ...actionButtonStyle({ compact: true }), minWidth: "34px", padding: "4px 0", flex: "0 0 auto" }}
                >
                  {expandedSections?.catalog ? "-" : "+"}
                </button>
              </div>

              {expandedSections?.catalog && (
              <div style={{ display: "grid", gap: "8px" }}>
                {catalog.map(entry => {
                  const blocked = runningJobs.length >= errandSlots;
                  const entryExpanded = Boolean(expandedCatalogEntries?.[entry.id]);
                  return (
                    <div key={entry.id} style={{ ...metricCardStyle(), padding: "9px 10px", gap: "8px" }}>
                      <div
                        onClick={() => toggleCatalogEntry(entry.id)}
                        style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", cursor: "pointer" }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: "900", color: entry.familyMeta?.color || "var(--color-text-primary, #1e293b)" }}>
                            {entry.label}
                          </div>
                          {entryExpanded && (
                            <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 }}>
                              {entry.description}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "start", flexWrap: "nowrap" }}>
                          <span style={chipLabelStyle(entry.familyMeta?.color || "var(--tone-info, #0369a1)")}>
                            {entry.rewardLabel}
                          </span>
                          <button
                            onClick={event => {
                              event.stopPropagation();
                              toggleCatalogEntry(entry.id);
                            }}
                            style={{ ...actionButtonStyle({ compact: true }), minWidth: "34px", padding: "4px 0", flex: "0 0 auto" }}
                          >
                            {entryExpanded ? "-" : "+"}
                          </button>
                        </div>
                      </div>

                      {entryExpanded && (
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0,1fr))", gap: "8px" }}>
                          {entry.durationOptions.map(option => (
                            <div key={option.id} style={{ ...metricCardStyle(), padding: "9px 10px", gap: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                                <div style={{ fontSize: "0.74rem", fontWeight: "900" }}>{option.shortLabel}</div>
                                <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>{option.rewardsLabel}</span>
                              </div>
                              <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.35 }}>
                                {option.summary}
                              </div>
                              <button
                                onClick={() => dispatch({ type: "START_SANCTUARY_ERRAND", errandId: entry.id, durationId: option.id, now })}
                                disabled={blocked}
                                style={actionButtonStyle({ primary: !blocked, disabled: blocked, compact: true })}
                              >
                                {blocked ? "Sin equipo libre" : "Asignar"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <div style={panelStyle("var(--tone-warning, #f59e0b)")}>
                <div
                  onClick={() => toggleSection("claimable")}
                  style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                      Recompensas listas
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                      Equipos que ya volvieron
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {claimableJobs.length > 0 && canRepeatClaimedErrands && (
                      <button
                        onClick={event => {
                          event.stopPropagation();
                          claimAllErrandJobs({ restart: true });
                        }}
                        style={actionButtonStyle({ compact: true })}
                      >
                        Todo + repetir
                      </button>
                    )}
                    {claimableJobs.length > 1 && (
                      <button
                        onClick={event => {
                          event.stopPropagation();
                          claimAllErrandJobs();
                        }}
                        style={actionButtonStyle({ primary: true, compact: true })}
                      >
                        Reclamar todo
                      </button>
                    )}
                    <button
                      onClick={event => {
                        event.stopPropagation();
                        toggleSection("claimable");
                      }}
                      style={{ ...actionButtonStyle({ compact: true }), minWidth: "34px", padding: "4px 0", flex: "0 0 auto" }}
                    >
                      {expandedSections?.claimable ? "-" : "+"}
                    </button>
                  </div>
                </div>

                {expandedSections?.claimable && (
                  claimableJobs.length === 0 ? (
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                      Todavia no hay equipos de regreso. Cuando un encargo termine, podras reclamarlo aca o desde el panel general de claims del Santuario.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "8px" }}>
                      {claimableJobs.map(job => (
                        <div key={job.id} style={{ ...metricCardStyle(), padding: "10px 12px", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                            <div>
                              <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{job.output?.label || job.input?.label || "Encargo"}</div>
                              <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 }}>
                                {job.output?.summary}
                              </div>
                            </div>
                            <span style={chipLabelStyle("var(--tone-success, #10b981)")}>Listo</span>
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => claimErrandJob(job, { nowAt: now })}
                              style={actionButtonStyle({ primary: true, compact: true })}
                            >
                              Reclamar recompensa
                            </button>
                            {job?.input?.errandId && (
                              <button
                                onClick={() => claimErrandJob(job, { restart: true, nowAt: now + 1 })}
                                style={actionButtonStyle({ compact: true })}
                              >
                                Reclamar + repetir
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div style={panelStyle("var(--tone-accent, #4338ca)")}>
                <div
                  onClick={() => toggleSection("running")}
                  style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                      Misiones en curso
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                      Equipos actualmente desplegados
                    </div>
                  </div>
                  <button
                    onClick={event => {
                      event.stopPropagation();
                      toggleSection("running");
                    }}
                    style={{ ...actionButtonStyle({ compact: true }), minWidth: "34px", padding: "4px 0", flex: "0 0 auto" }}
                  >
                    {expandedSections?.running ? "-" : "+"}
                  </button>
                </div>

                {expandedSections?.running && (
                  runningJobs.length === 0 ? (
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                      No hay grupos fuera del Santuario en este momento.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "8px" }}>
                      {runningJobs.map(job => (
                        <div key={job.id} style={{ ...metricCardStyle(), padding: "10px 12px", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                            <div>
                              <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{job.output?.label || job.input?.label || "Encargo"}</div>
                              <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 }}>
                                {job.output?.summary}
                              </div>
                            </div>
                          </div>
                          <JobProgressBar
                            startedAt={job?.startedAt}
                            endsAt={job?.endsAt}
                            now={now}
                            tone="var(--tone-info, #0369a1)"
                            rightLabel={formatRemaining(Number(job?.endsAt || 0) - now)}
                            compact
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                              {job.input?.durationLabel || ""} · {job.output?.rewardLabel || "Recurso util"}
                            </div>
                            <button
                              onClick={() => dispatch({ type: "CANCEL_SANCTUARY_ERRAND", jobId: job.id, now })}
                              style={actionButtonStyle({ danger: true, compact: true })}
                            >
                              Retirar equipo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        </div>
      </OverlaySurface>
      <ActionToast toast={actionToast} isMobile={isMobile} />
    </OverlayShell>
  );
}
