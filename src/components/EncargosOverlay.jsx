import React, { useEffect, useMemo, useState } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import JobProgressBar from "./JobProgressBar";
import ActionToast from "./ActionToast";
import { FlBadge, FlButton, FlMetricGrid, FlPanel, FlPanelHeader } from "./ui/forge";
import { getSanctuaryErrandCatalog } from "../engine/sanctuary/jobEngine";
import useRelativeNow from "../hooks/useRelativeNow";

const ENCARGOS_STITCH_TRIAL_STORAGE_KEY = "idlerpg:trial:encargos-stitch";

function isEncargosStitchTrialEnabled() {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("encargos_stitch_trial") === "1") return true;
    return window.localStorage?.getItem(ENCARGOS_STITCH_TRIAL_STORAGE_KEY) === "1";
  } catch (_error) {
    return false;
  }
}

function panelClass(tone = "info") {
  return [
    "fl-station-panel",
    `fl-station-panel--${tone}`,
  ].join(" ");
}

function metricCardClass({ compact = false } = {}) {
  return [
    "fl-station-metric-card",
    compact ? "fl-station-metric-card--compact" : "",
  ].filter(Boolean).join(" ");
}

function chipLabelClass(tone = "info") {
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

function getProgressTier(state) {
  return Math.max(
    1,
    Number(state?.combat?.maxTier || 1),
    Number(state?.combat?.prestigeCycle?.maxTier || 1),
    Number(state?.combat?.analytics?.maxTierReached || 1),
    Number(state?.prestige?.bestHistoricTier || 1)
  );
}

export default function EncargosOverlay({ state, dispatch, isMobile = false, embedded = false, onClose }) {
  const now = useRelativeNow();
  const stitchTrialEnabled = useMemo(() => isEncargosStitchTrialEnabled(), []);
  const infoTone = stitchTrialEnabled
    ? "var(--encargos-info, #c9b2ff)"
    : "var(--tone-info, #0369a1)";
  const progressTone = stitchTrialEnabled
    ? "var(--tone-warning, #e9c349)"
    : "var(--tone-info, #0369a1)";
  const progressTrack = stitchTrialEnabled
    ? "rgba(255, 255, 255, 0.08)"
    : "var(--color-background-primary, #e2e8f0)";
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

  const content = (
    <div
      className={[
        "fl-station-overlay",
        "fl-station-overlay--errands",
        "overlay-station-body",
        "overlay-station-body--forge",
        "encargos-root",
        stitchTrialEnabled ? "encargos-root--stitch-trial" : "",
      ].filter(Boolean).join(" ")}
    >
          <FlPanel
            variant="compact"
            className={["fl-encargos-hero-panel", stitchTrialEnabled ? "fl-encargos-hero-panel--violet" : "fl-encargos-hero-panel--info"].join(" ")}
            header={(
              <FlPanelHeader
                title="Encargos"
                subtitle="Misiones auxiliares del Santuario"
                copy="Asigna equipos secundarios para recuperar recursos sin frenar la expedición principal."
                actions={(
                  <FlButton variant="secondary" size="sm" onClick={onClose}>
                    Volver
                  </FlButton>
                )}
              />
            )}
          >
            <div className="fl-encargos-hero-panel__chips">
                <FlBadge variant="pill" size="xs" tone={stitchTrialEnabled ? "arcane" : "defense"}>
                  {runningJobs.length} / {errandSlots} ocupados
                </FlBadge>
                <FlBadge variant="pill" size="xs" tone="warning">
                  {claimableJobs.length} listos
                </FlBadge>
            </div>
            <FlMetricGrid
              className="fl-encargos-hero-metrics"
              columns={5}
              mobileColumns={3}
              compact
              items={[
                { id: "errand-teams", label: "Equipos", value: errandSlots, tone: "defense" },
                { id: "errand-free", label: "Libres", value: availableSlots, tone: "success" },
                { id: "errand-tier", label: "Tier", value: progressTier, tone: stitchTrialEnabled ? "arcane" : "warning" },
                { id: "errand-running", label: "En curso", value: runningJobs.length, tone: stitchTrialEnabled ? "arcane" : "defense" },
                { id: "errand-ready", label: "Listas", value: claimableJobs.length, tone: "success" },
              ]}
            />
            <div className="fl-encargos-hero-panel__status-copy">{statusFlavor}</div>
          </FlPanel>

          <section className="overlay-split-52-48">
            <div className={panelClass(stitchTrialEnabled ? "violet" : "info")}>
              <div
                onClick={() => toggleSection("catalog")}
                {...{ style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" } }}
              >
                <div>
                  <div {...{ style: { fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: infoTone } }}>
                    Catalogo de encargos
                  </div>
                  <div {...{ style: { fontSize: "1rem", fontWeight: "900", marginTop: "4px" } }}>
                    Elegi direccion, duracion y recompensa
                  </div>
                </div>
                <FlButton
                  variant="ghost"
                  size="xs"
                  onClick={event => {
                    event.stopPropagation();
                    toggleSection("catalog");
                  }}
                >
                  {expandedSections?.catalog ? "-" : "+"}
                </FlButton>
              </div>

              {expandedSections?.catalog && (
              <div {...{ style: { display: "grid", gap: "8px" } }}>
                {catalog.map(entry => {
                  const blocked = runningJobs.length >= errandSlots;
                  const entryExpanded = Boolean(expandedCatalogEntries?.[entry.id]);
                  return (
                    <div key={entry.id} className={metricCardClass()}>
                      <div
                        onClick={() => toggleCatalogEntry(entry.id)}
                        {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", cursor: "pointer" } }}
                      >
                        <div {...{ style: { minWidth: 0 } }}>
                          <div {...{ style: { fontSize: "0.8rem", fontWeight: "900", color: entry.familyMeta?.color || "var(--color-text-primary, #1e293b)" } }}>
                            {entry.label}
                          </div>
                          {entryExpanded && (
                            <div {...{ style: { fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 } }}>
                              {entry.description}
                            </div>
                          )}
                        </div>
                        <div {...{ style: { display: "flex", gap: "6px", alignItems: "start", flexWrap: "nowrap" } }}>
                          <span
                            className={chipLabelClass("neutral")}
                            {...{ style: { color: entry.familyMeta?.color || infoTone } }}
                          >
                            {entry.rewardLabel}
                          </span>
                          <FlButton
                            variant="ghost"
                            size="xs"
                            onClick={event => {
                              event.stopPropagation();
                              toggleCatalogEntry(entry.id);
                            }}
                          >
                            {entryExpanded ? "-" : "+"}
                          </FlButton>
                        </div>
                      </div>

                      {entryExpanded && (
                        <div className="overlay-cols-1-3" {...{ style: { gap: "8px" } }}>
                          {entry.durationOptions.map(option => (
                            <div key={option.id} className={metricCardClass()}>
                              <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" } }}>
                                <div {...{ style: { fontSize: "0.74rem", fontWeight: "900" } }}>{option.shortLabel}</div>
                                <span className={chipLabelClass(stitchTrialEnabled ? "violet" : "info")}>{option.rewardsLabel}</span>
                              </div>
                              <div {...{ style: { fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.35 } }}>
                                {option.summary}
                              </div>
                              <FlButton
                                variant={!blocked ? "default" : "secondary"}
                                size="sm"
                                onClick={() => dispatch({ type: "START_SANCTUARY_ERRAND", errandId: entry.id, durationId: option.id, now })}
                                disabled={blocked}
                              >
                                {blocked ? "Sin equipo libre" : "Asignar"}
                              </FlButton>
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

            <div {...{ style: { display: "grid", gap: "12px" } }}>
              <div className={panelClass("warning")}>
                <div
                  onClick={() => toggleSection("claimable")}
                  {...{ style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" } }}
                >
                  <div>
                    <div {...{ style: { fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" } }}>
                      Recompensas listas
                    </div>
                    <div {...{ style: { fontSize: "1rem", fontWeight: "900", marginTop: "4px" } }}>
                      Equipos que ya volvieron
                    </div>
                  </div>
                  <div {...{ style: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" } }}>
                    {claimableJobs.length > 0 && canRepeatClaimedErrands && (
                      <FlButton
                        variant={stitchTrialEnabled ? "default" : "secondary"}
                        size="sm"
                        onClick={event => {
                          event.stopPropagation();
                          claimAllErrandJobs({ restart: true });
                        }}
                      >
                        Todo + repetir
                      </FlButton>
                    )}
                    {claimableJobs.length > 1 && (
                      <FlButton
                        variant={stitchTrialEnabled ? "default" : "secondary"}
                        size="sm"
                        onClick={event => {
                          event.stopPropagation();
                          claimAllErrandJobs();
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
                        toggleSection("claimable");
                      }}
                    >
                      {expandedSections?.claimable ? "-" : "+"}
                    </FlButton>
                  </div>
                </div>

                {expandedSections?.claimable && (
                  claimableJobs.length === 0 ? (
                    <div {...{ style: { fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 } }}>
                      Todavia no hay equipos de regreso. Cuando un encargo termine, podras reclamarlo aca o desde el panel general de claims del Santuario.
                    </div>
                  ) : (
                    <div {...{ style: { display: "grid", gap: "8px" } }}>
                      {claimableJobs.map(job => (
                        <div key={job.id} className={metricCardClass()}>
                          <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" } }}>
                            <div>
                              <div {...{ style: { fontSize: "0.78rem", fontWeight: "900" } }}>{job.output?.label || job.input?.label || "Encargo"}</div>
                              <div {...{ style: { fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 } }}>
                                {job.output?.summary}
                              </div>
                            </div>
                            <span className={chipLabelClass("success")}>Listo</span>
                          </div>
                          <div {...{ style: { display: "flex", gap: "6px", flexWrap: "wrap" } }}>
                            <FlButton
                              variant={stitchTrialEnabled ? "default" : "secondary"}
                              size="sm"
                              onClick={() => claimErrandJob(job, { nowAt: now })}
                            >
                              Reclamar recompensa
                            </FlButton>
                            {job?.input?.errandId && (
                              <FlButton
                                variant={stitchTrialEnabled ? "default" : "secondary"}
                                size="sm"
                                onClick={() => claimErrandJob(job, { restart: true, nowAt: now + 1 })}
                              >
                                Reclamar + repetir
                              </FlButton>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              <div className={panelClass("accent")}>
                <div
                  onClick={() => toggleSection("running")}
                  {...{ style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" } }}
                >
                  <div>
                    <div {...{ style: { fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" } }}>
                      Misiones en curso
                    </div>
                    <div {...{ style: { fontSize: "1rem", fontWeight: "900", marginTop: "4px" } }}>
                      Equipos actualmente desplegados
                    </div>
                  </div>
                  <FlButton
                    variant="ghost"
                    size="xs"
                    onClick={event => {
                      event.stopPropagation();
                      toggleSection("running");
                    }}
                  >
                    {expandedSections?.running ? "-" : "+"}
                  </FlButton>
                </div>

                {expandedSections?.running && (
                  runningJobs.length === 0 ? (
                    <div {...{ style: { fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 } }}>
                      No hay grupos fuera del Santuario en este momento.
                    </div>
                  ) : (
                    <div {...{ style: { display: "grid", gap: "8px" } }}>
                      {runningJobs.map(job => (
                        <div key={job.id} className={metricCardClass()}>
                          <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" } }}>
                            <div>
                              <div {...{ style: { fontSize: "0.78rem", fontWeight: "900" } }}>{job.output?.label || job.input?.label || "Encargo"}</div>
                              <div {...{ style: { fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 } }}>
                                {job.output?.summary}
                              </div>
                            </div>
                          </div>
                          <JobProgressBar
                            startedAt={job?.startedAt}
                            endsAt={job?.endsAt}
                            now={now}
                            tone={progressTone}
                            track={progressTrack}
                            rightLabel={formatRemaining(Number(job?.endsAt || 0) - now)}
                            compact
                          />
                          <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
                            <div {...{ style: { fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" } }}>
                              {job.input?.durationLabel || ""} · {job.output?.rewardLabel || "Recurso util"}
                            </div>
                            <FlButton
                              variant="danger-ghost"
                              size="sm"
                              onClick={() => dispatch({ type: "CANCEL_SANCTUARY_ERRAND", jobId: job.id, now })}
                            >
                              Retirar equipo
                            </FlButton>
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
    <OverlayShell isMobile={isMobile} embedded={embedded} variant="forge" contentLabel="Encargos">
      <OverlaySurface
        isMobile={isMobile}
        embedded={embedded}
        variant="forge"
        className="fl-station-overlay fl-station-overlay--errands"
      >
        {content}
      </OverlaySurface>
      <ActionToast toast={actionToast} isMobile={isMobile} />
    </OverlayShell>
  );
}
