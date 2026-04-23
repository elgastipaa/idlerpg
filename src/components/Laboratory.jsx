import React, { useEffect, useMemo, useState } from "react";
import JobProgressBar from "./JobProgressBar";
import {
  getLaboratoryCatalog,
  getSanctuaryStationState,
  SANCTUARY_STATION_DEFAULTS,
} from "../engine/sanctuary/laboratoryEngine";
import { getEffectiveOnboardingStep, getOnboardingResearchTargetId, getOnboardingStepInteractionMode, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";

function panelStyle(accent = "var(--tone-accent, #4338ca)") {
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

function buttonStyle({ primary = false, disabled = false, compact = false } = {}) {
  return {
    border: "1px solid",
    borderColor: disabled
      ? "var(--color-border-primary, #e2e8f0)"
      : primary
        ? "var(--tone-accent, #4338ca)"
        : "var(--color-border-primary, #e2e8f0)",
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : primary
        ? "var(--tone-accent-soft, #eef2ff)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : primary
        ? "var(--tone-accent, #4338ca)"
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: compact ? "7px 11px" : "10px 14px",
    fontSize: compact ? "0.68rem" : "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function chipStyle(color = "var(--tone-accent, #4338ca)") {
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

function formatDuration(ms = 0) {
  const totalMinutes = Math.max(1, Math.round(Number(ms || 0) / 60000));
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes ? ` ${minutes}m` : ""}`;
  }
  return `${totalMinutes}m`;
}

function groupLabel(group = "") {
  if (group === "unlock") return "Funciones";
  if (group === "capacity") return "Capacidad";
  if (group === "efficiency") return "Eficiencia";
  return group;
}

function costLabel(costs = {}) {
  const parts = [];
  if (Number(costs?.codexInk || 0) > 0) parts.push(`${Math.floor(Number(costs.codexInk || 0))} tinta`);
  if (Number(costs?.relicDust || 0) > 0) parts.push(`${Math.floor(Number(costs.relicDust || 0))} polvo`);
  if (Number(costs?.essence || 0) > 0) parts.push(`${Math.floor(Number(costs.essence || 0))} esencia`);
  return parts.join(" · ") || "Sin costo";
}

function unlockOrderIndex(researchId = "") {
  const order = [
    "unlock_distillery",
    "unlock_deep_forge",
    "unlock_library",
    "unlock_errands",
    "unlock_sigil_altar",
    "unlock_abyss_portal",
  ];
  const index = order.indexOf(researchId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export default function Laboratory({ state, dispatch, onBack, backDisabled = false, backTarget }) {
  const [now, setNow] = useState(Date.now());
  const [expandedResearchCards, setExpandedResearchCards] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({
    unlock: false,
    capacity: false,
    efficiency: false,
  });
  const onboardingStep = getEffectiveOnboardingStep(state?.onboarding?.step || null, { ...state, __liveNow: now });
  const onboardingMode = getOnboardingStepInteractionMode(onboardingStep, { ...state, __liveNow: now });
  const spotlightResearchId =
    onboardingMode === "forced" ? getOnboardingResearchTargetId(onboardingStep) : null;
  const spotlightDistilleryResearch = onboardingStep === ONBOARDING_STEPS.RESEARCH_DISTILLERY;

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const sanctuary = state.sanctuary || {};
  const catalog = useMemo(() => getLaboratoryCatalog(state), [state]);
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const effectiveJobs = useMemo(
    () => jobs.map(job => (
      job?.status === "running" && Number(job?.endsAt || 0) <= now
        ? { ...job, status: "claimable" }
        : job
    )),
    [jobs, now]
  );
  const runningJobs = useMemo(
    () => effectiveJobs.filter(job => job?.station === "laboratory" && job?.status === "running"),
    [effectiveJobs]
  );
  const claimableJobs = useMemo(
    () => effectiveJobs.filter(job => job?.station === "laboratory" && job?.status === "claimable"),
    [effectiveJobs]
  );
  const runningResearchEndsAt = useMemo(
    () =>
      Object.fromEntries(
        runningJobs
          .map(job => [job?.input?.researchId, Number(job?.endsAt || 0)])
          .filter(([researchId]) => Boolean(researchId))
      ),
    [runningJobs]
  );
  const runningResearchTimingById = useMemo(
    () =>
      Object.fromEntries(
        runningJobs
          .map(job => [
            job?.input?.researchId,
            {
              startedAt: Number(job?.startedAt || 0),
              endsAt: Number(job?.endsAt || 0),
            },
          ])
          .filter(([researchId]) => Boolean(researchId))
      ),
    [runningJobs]
  );
  const unresolvedDistilleryResearch = useMemo(
    () => effectiveJobs.find(
      job =>
        job?.station === "laboratory" &&
        job?.input?.researchId === "unlock_distillery" &&
        (job?.status === "running" || job?.status === "claimable")
    ),
    [effectiveJobs]
  );
  const distilleryActuallyUnlocked = Boolean(sanctuary?.stations?.distillery?.unlocked);
  const forceDistilleryReadyVisuals =
    Boolean(unresolvedDistilleryResearch) &&
    !distilleryActuallyUnlocked;
  const groups = useMemo(() => {
    const mapped = {};
    for (const entry of catalog) {
      if (!mapped[entry.group]) mapped[entry.group] = [];
      mapped[entry.group].push(entry);
    }
    return mapped;
  }, [catalog]);
  const spotlightResearchEntry = useMemo(
    () => (spotlightResearchId ? catalog.find(entry => entry.id === spotlightResearchId) || null : null),
    [catalog, spotlightResearchId]
  );
  const spotlightGroupExpanded = spotlightResearchEntry?.group
    ? Boolean(expandedGroups?.[spotlightResearchEntry.group])
    : false;
  const unlockEntries = useMemo(
    () =>
      catalog
        .filter(entry => entry.group === "unlock")
        .sort((left, right) => unlockOrderIndex(left.id) - unlockOrderIndex(right.id)),
    [catalog]
  );
  const nextRecommendedUnlock = useMemo(
    () => unlockEntries.find(entry => !entry.completed),
    [unlockEntries]
  );
  const completedCount = catalog.filter(entry => entry.completed).length;
  const unlockedStations = Object.values(SANCTUARY_STATION_DEFAULTS)
    .filter(station => station.id !== "laboratory")
    .filter(station => getSanctuaryStationState(sanctuary, station.id).unlocked).length;

  function toggleResearchCard(entryId) {
    setExpandedResearchCards(current => ({
      ...current,
      [entryId]: !current?.[entryId],
    }));
  }

  function toggleGroup(group) {
    setExpandedGroups(current => ({
      ...current,
      [group]: !current?.[group],
    }));
  }

  useEffect(() => {
    if (!spotlightResearchId || !spotlightResearchEntry?.group) return undefined;
    setExpandedGroups(current => (
      current?.[spotlightResearchEntry.group]
        ? current
        : { ...current, [spotlightResearchEntry.group]: true }
    ));
    setExpandedResearchCards(current => (
      current?.[spotlightResearchId]
        ? current
        : { ...current, [spotlightResearchId]: true }
    ));
    return undefined;
  }, [spotlightResearchEntry?.group, spotlightResearchId]);

  useEffect(() => {
    if (!spotlightResearchId) return undefined;

    let frameId = null;
    let timeoutId = null;
    let attempts = 0;

    const scrollToTarget = () => {
      const target = document.querySelector(`[data-onboarding-target="research-card-${spotlightResearchId}"]`);
      if (!(target instanceof HTMLElement)) {
        attempts += 1;
        if (attempts < 10) {
          timeoutId = window.setTimeout(() => {
            frameId = window.requestAnimationFrame(scrollToTarget);
          }, 90);
        }
        return;
      }

      target.scrollIntoView({
        behavior: attempts === 0 ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });

      attempts += 1;
      if (attempts < 4) {
        timeoutId = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(scrollToTarget);
        }, 90);
      }
    };

    frameId = requestAnimationFrame(scrollToTarget);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [spotlightGroupExpanded, spotlightResearchId]);

  return (
    <div style={{ padding: "1rem", display: "grid", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <style>{`
        @keyframes laboratorySpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.22); }
          70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
          100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
        }
      `}</style>
      <section style={panelStyle("var(--tone-accent, #4338ca)")}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "12px", alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Laboratorio
            </div>
            <div style={{ fontSize: "1.02rem", fontWeight: "900", marginTop: "4px" }}>
              Infraestructura del Santuario
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35, maxWidth: "56ch" }}>
              Desbloquea funciones y mejora capacidad con tinta, polvo y esencia.
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              disabled={backDisabled}
              data-onboarding-target={backTarget}
              style={{ ...buttonStyle({ compact: true, disabled: backDisabled }), opacity: backDisabled ? 0.6 : 1, flex: "0 0 auto" }}
            >
              Volver
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span style={chipStyle("var(--tone-accent, #4338ca)")}>{completedCount}/{catalog.length} estudios</span>
          <span style={chipStyle("var(--tone-success, #10b981)")}>{unlockedStations}/5 estaciones</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
          <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Tinta</div>
            <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{Math.floor(Number(sanctuary?.resources?.codexInk || 0)).toLocaleString()}</div>
          </div>
          <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Polvo</div>
            <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{Math.floor(Number(sanctuary?.resources?.relicDust || 0)).toLocaleString()}</div>
          </div>
          <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Esencia</div>
            <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{Math.floor(Number(state?.player?.essence || 0)).toLocaleString()}</div>
          </div>
          <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>En curso</div>
            <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{runningJobs.length}</div>
          </div>
          <div style={{ ...metricCardStyle(), padding: "8px 10px", gap: "2px" }}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Listas</div>
            <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{claimableJobs.length}</div>
          </div>
        </div>
      </section>

      {(claimableJobs.length > 0 || runningJobs.length > 0) && (
        <section style={panelStyle("var(--tone-warning, #f59e0b)")}>
          <div>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
              Cola de investigacion
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
              Trabajos del Laboratorio
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
            {claimableJobs.map(job => (
              <div
                key={job.id}
                data-onboarding-target={
                  forceDistilleryReadyVisuals &&
                  job?.input?.researchId === "unlock_distillery"
                    ? "claim-distillery-research-card"
                    : undefined
                }
                style={{
                  ...metricCardStyle(),
                  position:
                    forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                      ? "relative"
                      : "static",
                  zIndex:
                    forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                      ? 2
                      : 1,
                  boxShadow:
                    forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                      ? "0 0 0 2px rgba(83,74,183,0.18), 0 12px 28px rgba(83,74,183,0.14)"
                      : metricCardStyle().boxShadow,
                  animation:
                    forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                      ? "laboratorySpotlightPulse 1600ms ease-in-out infinite"
                      : "none",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: "900" }}>{job.input?.label || "Investigacion"}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {job.output?.summary || "El Laboratorio termino una mejora de infraestructura."}
                </div>
                <button
                  onClick={() => dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now })}
                  data-onboarding-target={
                    forceDistilleryReadyVisuals &&
                    job?.input?.researchId === "unlock_distillery"
                      ? "claim-distillery-research"
                      : undefined
                  }
                  style={{
                    ...buttonStyle({ primary: true, compact: true }),
                    position:
                      forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                        ? "relative"
                        : "static",
                    zIndex:
                      forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                        ? 3
                        : 1,
                  }}
                >
                  Reclamar
                </button>
              </div>
            ))}
            {runningJobs.map(job => (
              <div
                key={job.id}
                data-onboarding-target={
                  forceDistilleryReadyVisuals &&
                  job?.input?.researchId === "unlock_distillery"
                    ? "running-distillery-research"
                    : undefined
                }
                style={{
                  ...metricCardStyle(),
                  position:
                    forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                      ? "relative"
                      : "static",
                  zIndex:
                    forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                      ? 2
                      : 1,
                  boxShadow:
                    forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                      ? "0 0 0 2px rgba(83,74,183,0.18), 0 12px 28px rgba(83,74,183,0.14)"
                      : metricCardStyle().boxShadow,
                  animation:
                    forceDistilleryReadyVisuals && job?.input?.researchId === "unlock_distillery"
                      ? "laboratorySpotlightPulse 1600ms ease-in-out infinite"
                      : "none",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: "900" }}>{job.input?.label || "Investigacion"}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {job.output?.summary || "Mejora estructural en curso."}
                </div>
                <JobProgressBar
                  startedAt={job?.startedAt}
                  endsAt={job?.endsAt}
                  now={now}
                  tone="var(--tone-info, #0369a1)"
                  rightLabel={formatRemaining(Number(job?.endsAt || 0) - now)}
                  compact
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.entries(groups).map(([group, entries]) => (
        <section key={group} style={panelStyle(group === "unlock" ? "var(--tone-violet, #7c3aed)" : group === "capacity" ? "var(--tone-info, #0369a1)" : "var(--tone-warning, #f59e0b)")}>
          <div
            onClick={() => toggleGroup(group)}
            style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", cursor: "pointer" }}
          >
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: group === "unlock" ? "var(--tone-violet, #7c3aed)" : group === "capacity" ? "var(--tone-info, #0369a1)" : "var(--tone-warning, #f59e0b)" }}>
                {groupLabel(group)}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                {group === "unlock" ? "Nuevas funciones del Santuario" : group === "capacity" ? "Slots e infraestructura" : "Tiempos y rendimiento"}
              </div>
            </div>
            <button
              onClick={event => {
                event.stopPropagation();
                toggleGroup(group);
              }}
              style={{ ...buttonStyle({ compact: true }), minWidth: "34px", padding: "4px 0", flex: "0 0 auto" }}
            >
              {expandedGroups?.[group] ? "-" : "+"}
            </button>
          </div>

          {expandedGroups?.[group] && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${group === "unlock" ? "240px" : "280px"}, 1fr))`, gap: "10px" }}>
            {[...entries]
              .sort((left, right) => {
                const getPriority = entry => {
                  if (entry.running) return 0;
                  if (!entry.completed) return 1;
                  return 2;
                };
                const priorityDiff = getPriority(left) - getPriority(right);
                if (priorityDiff !== 0) return priorityDiff;
                const completedDiff = Number(left.completed) - Number(right.completed);
                if (completedDiff !== 0) return completedDiff;
                if (group === "unlock") return unlockOrderIndex(left.id) - unlockOrderIndex(right.id);
                return 0;
              })
              .map(entry => (
              <div
                key={entry.id}
                data-onboarding-target={spotlightResearchId === entry.id ? `research-card-${entry.id}` : undefined}
                onClick={() => {
                  if (spotlightResearchId === entry.id && !spotlightDistilleryResearch) {
                    dispatch({ type: "ACK_ONBOARDING_STEP" });
                  }
                }}
                style={{
                  ...metricCardStyle(),
                  padding: group === "unlock" ? "9px 10px" : "10px 12px",
                  gap: group === "unlock" ? "6px" : "4px",
                  position: "relative",
                }}
              >
                {(() => {
                  const spotlightResearch = spotlightResearchId === entry.id;
                  const tutorialLocked = spotlightResearchId != null && entry.id !== spotlightResearchId;
                  const buttonEnabled = entry.canStart && !tutorialLocked;
                  const isCollapsibleResearch = entry.completed || entry.running;
                  const collapsedResearchCard = isCollapsibleResearch && !expandedResearchCards?.[entry.id];
                  const compactMetaStyle = {
                    fontSize: "0.62rem",
                    fontWeight: "900",
                    color: "var(--color-text-secondary, #64748b)",
                    background: "var(--color-background-primary, #f8fafc)",
                    border: "1px solid var(--color-border-primary, #e2e8f0)",
                    borderRadius: "999px",
                    padding: "3px 7px",
                  };
                  return (
                    <>
                <div
                  onClick={() => {
                    if (isCollapsibleResearch) {
                      toggleResearchCard(entry.id);
                    }
                  }}
                  style={{
                    display: "block",
                    borderRadius: "12px",
                    padding: spotlightResearch ? "8px 10px" : 0,
                    background: spotlightResearch ? "var(--tone-accent-soft, #eef2ff)" : "transparent",
                    boxShadow: spotlightResearch
                      ? "0 0 0 2px rgba(83,74,183,0.18), 0 10px 24px rgba(83,74,183,0.14)"
                      : "none",
                    animation: spotlightResearch ? "laboratorySpotlightPulse 1600ms ease-in-out infinite" : "none",
                    cursor: isCollapsibleResearch || (spotlightResearch && !spotlightDistilleryResearch) ? "pointer" : "default",
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: isCollapsibleResearch ? "88px" : "78px" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: "900" }}>{entry.label}</div>
                    {entry.running && (
                      <div style={{ display: "grid", gap: "4px", marginTop: "4px" }}>
                        <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.3 }}>
                          Termina en {formatRemaining(Number(runningResearchEndsAt?.[entry.id] || 0) - now)}
                        </div>
                        <JobProgressBar
                          startedAt={runningResearchTimingById?.[entry.id]?.startedAt}
                          endsAt={runningResearchTimingById?.[entry.id]?.endsAt}
                          now={now}
                          tone="var(--tone-info, #0369a1)"
                          rightLabel={formatRemaining(Number(runningResearchEndsAt?.[entry.id] || 0) - now)}
                          compact
                        />
                      </div>
                    )}
                    {!collapsedResearchCard && !entry.running && (
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35 }}>
                        {entry.description}
                      </div>
                    )}
                  </div>
                  <div style={{ position: "absolute", top: spotlightResearch ? "17px" : "9px", right: spotlightResearch ? "20px" : "10px", display: "flex", gap: "6px", alignItems: "flex-start", flexWrap: "nowrap", justifyContent: "flex-end" }}>
                    <span style={chipStyle(entry.completed ? "var(--tone-success, #10b981)" : entry.running ? "var(--tone-info, #0369a1)" : "var(--color-text-secondary, #475569)")}>
                      {entry.completed ? "Completa" : entry.running ? "En curso" : "Pendiente"}
                    </span>
                    {isCollapsibleResearch && (
                      <button
                        onClick={event => {
                          event.stopPropagation();
                          toggleResearchCard(entry.id);
                        }}
                        style={{ ...buttonStyle({ compact: true }), minWidth: "34px", padding: "4px 0" }}
                      >
                        {collapsedResearchCard ? "+" : "-"}
                      </button>
                    )}
                  </div>
                </div>

                {!collapsedResearchCard && (
                  <>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span style={compactMetaStyle}>{costLabel(entry.costs)}</span>
                      <span style={compactMetaStyle}>{formatDuration(entry.durationMs)}</span>
                    </div>
                    {!entry.available && (
                      <div style={{ fontSize: "0.66rem", color: "var(--tone-danger, #D85A30)", lineHeight: 1.35 }}>
                        {entry.prerequisiteLabel} · Todavia no listo.
                      </div>
                    )}
                    {entry.missingCosts.length > 0 && !entry.completed && !entry.running && (
                      <div style={{ fontSize: "0.66rem", color: "var(--tone-warning, #f59e0b)", lineHeight: 1.35 }}>
                        Falta: {entry.missingCosts.join(" · ")}
                      </div>
                    )}

                    {!entry.completed && !entry.running && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={event => {
                            event.stopPropagation();
                            dispatch({ type: "START_LAB_RESEARCH", researchId: entry.id, now });
                          }}
                          disabled={!buttonEnabled}
                          data-onboarding-target={spotlightResearch ? `research-${entry.id}` : undefined}
                          style={{
                            ...buttonStyle({ primary: buttonEnabled, disabled: !buttonEnabled, compact: group === "unlock" }),
                            position: spotlightResearch ? "relative" : "static",
                            zIndex: spotlightResearch ? 2 : 1,
                            justifySelf: "start",
                          }}
                        >
                          {entry.running ? "En curso" : "Iniciar"}
                        </button>
                      </div>
                    )}
                  </>
                )}
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
          )}
        </section>
      ))}
    </div>
  );
}
