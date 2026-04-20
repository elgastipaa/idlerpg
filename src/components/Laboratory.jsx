import React, { useEffect, useMemo, useState } from "react";
import {
  getLaboratoryCatalog,
  getSanctuaryStationState,
  SANCTUARY_STATION_DEFAULTS,
} from "../engine/sanctuary/laboratoryEngine";
import { getOnboardingResearchTargetId, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";

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

function buttonStyle({ primary = false, disabled = false } = {}) {
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
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function chipStyle(color = "var(--tone-accent, #4338ca)") {
  return {
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-tertiary, #f8fafc)",
    color,
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "0.62rem",
    fontWeight: "900",
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

export default function Laboratory({ state, dispatch }) {
  const [now, setNow] = useState(Date.now());
  const onboardingStep = state?.onboarding?.step || null;
  const spotlightResearchId = getOnboardingResearchTargetId(onboardingStep);
  const spotlightDistilleryResearch = onboardingStep === ONBOARDING_STEPS.RESEARCH_DISTILLERY;

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const sanctuary = state.sanctuary || {};
  const catalog = useMemo(() => getLaboratoryCatalog(state), [state]);
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const runningJobs = useMemo(
    () => jobs.filter(job => job?.station === "laboratory" && job?.status === "running"),
    [jobs]
  );
  const claimableJobs = useMemo(
    () => jobs.filter(job => job?.station === "laboratory" && job?.status === "claimable"),
    [jobs]
  );
  const groups = useMemo(() => {
    const mapped = {};
    for (const entry of catalog) {
      if (!mapped[entry.group]) mapped[entry.group] = [];
      mapped[entry.group].push(entry);
    }
    return mapped;
  }, [catalog]);
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

  useEffect(() => {
    if (!spotlightResearchId) return undefined;

    let frameId = null;
    const scrollToTarget = () => {
      const target = document.querySelector(`[data-onboarding-target="research-card-${spotlightResearchId}"]`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    frameId = requestAnimationFrame(scrollToTarget);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
    };
  }, [spotlightResearchId]);

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
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Laboratorio
            </div>
            <div style={{ fontSize: "1.16rem", fontWeight: "900", marginTop: "4px" }}>
              Infraestructura del Santuario
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.5, maxWidth: "70ch" }}>
              Acá se desbloquean nuevas estaciones y se mejora su capacidad. El Laboratorio no toca combate directo: ordena el crecimiento del Santuario con tinta, polvo y esencia.
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={chipStyle("var(--tone-accent, #4338ca)")}>{completedCount}/{catalog.length} estudios</span>
            <span style={chipStyle("var(--tone-success, #10b981)")}>{unlockedStations}/5 estaciones</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Tinta</div>
            <div style={{ fontSize: "0.94rem", fontWeight: "900" }}>{Math.floor(Number(sanctuary?.resources?.codexInk || 0)).toLocaleString()}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Polvo</div>
            <div style={{ fontSize: "0.94rem", fontWeight: "900" }}>{Math.floor(Number(sanctuary?.resources?.relicDust || 0)).toLocaleString()}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Esencia</div>
            <div style={{ fontSize: "0.94rem", fontWeight: "900" }}>{Math.floor(Number(state?.player?.essence || 0)).toLocaleString()}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>En curso</div>
            <div style={{ fontSize: "0.94rem", fontWeight: "900" }}>{runningJobs.length}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Listas</div>
            <div style={{ fontSize: "0.94rem", fontWeight: "900" }}>{claimableJobs.length}</div>
          </div>
        </div>
      </section>

      <section style={panelStyle("var(--tone-success, #10b981)")}>
        <div>
          <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
            Ruta del Santuario
          </div>
          <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
            Orden recomendado de funciones
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45 }}>
            El Laboratorio define en qué orden crece la cuenta. No hace falta optimizarlo: sigue esta ruta para entender el loop nuevo sin abrir sistemas demasiado pronto.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {unlockEntries.map((entry, index) => {
            const isNext = nextRecommendedUnlock?.id === entry.id;
            return (
              <div
                key={entry.id}
                style={{
                  ...metricCardStyle(),
                  borderColor: isNext ? "rgba(99,102,241,0.28)" : "var(--color-border-primary, #e2e8f0)",
                  background: isNext ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-tertiary, #f8fafc)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
                      Paso {index + 1}
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: "900", marginTop: "4px" }}>{entry.targetLabel || entry.label}</div>
                  </div>
                  <span style={chipStyle(entry.completed ? "var(--tone-success, #10b981)" : isNext ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #475569)")}>
                    {entry.completed ? "Activo" : isNext ? "Siguiente" : "Luego"}
                  </span>
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {entry.description}
                </div>
                <div style={{ fontSize: "0.68rem", color: entry.available ? "var(--color-text-secondary, #64748b)" : "var(--tone-danger, #D85A30)", lineHeight: 1.45 }}>
                  {entry.prerequisiteLabel}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={panelStyle("var(--tone-success, #10b981)")}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
              Infraestructura
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
              Estado actual de las estaciones
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
          {Object.values(SANCTUARY_STATION_DEFAULTS)
            .filter(station => station.id !== "laboratory")
            .map(station => {
              const stationState = getSanctuaryStationState(sanctuary, station.id);
              return (
                <div key={station.id} style={metricCardStyle()}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: "900" }}>{station.label}</div>
                    <span style={chipStyle(stationState.unlocked ? "var(--tone-success, #10b981)" : "var(--tone-danger, #D85A30)")}>
                      {stationState.unlocked ? "Activa" : "Bloqueada"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                    Slots: {stationState.slots} · Reduccion de tiempo: {Math.round(Number(stationState.timeReductionPct || 0) * 100)}%
                  </div>
                </div>
              );
            })}
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
              <div key={job.id} style={metricCardStyle()}>
                <div style={{ fontSize: "0.8rem", fontWeight: "900" }}>{job.input?.label || "Investigacion"}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {job.output?.summary || "El Laboratorio termino una mejora de infraestructura."}
                </div>
                <button
                  onClick={() => dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now })}
                  data-onboarding-target={
                    onboardingStep === ONBOARDING_STEPS.DISTILLERY_READY &&
                    job?.input?.researchId === "unlock_distillery"
                      ? "claim-distillery-research"
                      : undefined
                  }
                  style={buttonStyle({ primary: true })}
                >
                  Reclamar
                </button>
              </div>
            ))}
            {runningJobs.map(job => (
              <div key={job.id} style={metricCardStyle()}>
                <div style={{ fontSize: "0.8rem", fontWeight: "900" }}>{job.input?.label || "Investigacion"}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {job.output?.summary || "Mejora estructural en curso."}
                </div>
                <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--tone-info, #0369a1)" }}>
                  Termina en {formatRemaining(Number(job.endsAt || 0) - now)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.entries(groups).map(([group, entries]) => (
        <section key={group} style={panelStyle(group === "unlock" ? "var(--tone-violet, #7c3aed)" : group === "capacity" ? "var(--tone-info, #0369a1)" : "var(--tone-warning, #f59e0b)")}>
          <div>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: group === "unlock" ? "var(--tone-violet, #7c3aed)" : group === "capacity" ? "var(--tone-info, #0369a1)" : "var(--tone-warning, #f59e0b)" }}>
              {groupLabel(group)}
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
              {group === "unlock" ? "Nuevas funciones del Santuario" : group === "capacity" ? "Slots e infraestructura" : "Tiempos y rendimiento"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
            {entries.map(entry => (
              <div
                key={entry.id}
                data-onboarding-target={spotlightResearchId === entry.id ? `research-card-${entry.id}` : undefined}
                onClick={() => {
                  if (spotlightResearchId === entry.id && !spotlightDistilleryResearch) {
                    dispatch({ type: "ACK_ONBOARDING_STEP" });
                  }
                }}
                style={metricCardStyle()}
              >
                {(() => {
                  const spotlightResearch = spotlightResearchId === entry.id;
                  const tutorialLocked = spotlightResearchId != null && entry.id !== spotlightResearchId;
                  const buttonEnabled = entry.canStart && !tutorialLocked;
                  return (
                    <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "start",
                    flexWrap: "wrap",
                    borderRadius: "12px",
                    padding: spotlightResearch ? "8px 10px" : 0,
                    background: spotlightResearch ? "var(--tone-accent-soft, #eef2ff)" : "transparent",
                    boxShadow: spotlightResearch
                      ? "0 0 0 2px rgba(83,74,183,0.18), 0 10px 24px rgba(83,74,183,0.14)"
                      : "none",
                    animation: spotlightResearch ? "laboratorySpotlightPulse 1600ms ease-in-out infinite" : "none",
                    cursor: spotlightResearch && !spotlightDistilleryResearch ? "pointer" : "default",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: "900" }}>{entry.label}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                      {entry.description}
                    </div>
                  </div>
                  <span style={chipStyle(entry.completed ? "var(--tone-success, #10b981)" : entry.running ? "var(--tone-info, #0369a1)" : "var(--color-text-secondary, #475569)")}>
                    {entry.completed ? "Completa" : entry.running ? "En curso" : "Pendiente"}
                  </span>
                </div>

                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {entry.targetLabel || SANCTUARY_STATION_DEFAULTS[entry.stationId]?.label || entry.stationId} · {costLabel(entry.costs)} · {formatDuration(entry.durationMs)}
                </div>
                <div style={{ fontSize: "0.68rem", color: entry.available ? "var(--color-text-secondary, #64748b)" : "var(--tone-danger, #D85A30)", lineHeight: 1.45 }}>
                  {entry.prerequisiteLabel}
                  {!entry.available ? " · Todavia no listo." : ""}
                </div>
                {entry.missingCosts.length > 0 && !entry.completed && !entry.running && (
                  <div style={{ fontSize: "0.68rem", color: "var(--tone-warning, #f59e0b)", lineHeight: 1.45 }}>
                    Falta: {entry.missingCosts.join(" · ")}
                  </div>
                )}

                <button
                  onClick={event => {
                    event.stopPropagation();
                    dispatch({ type: "START_LAB_RESEARCH", researchId: entry.id, now });
                  }}
                  disabled={!buttonEnabled}
                  data-onboarding-target={spotlightResearch ? `research-${entry.id}` : undefined}
                  style={{
                    ...buttonStyle({ primary: buttonEnabled, disabled: !buttonEnabled }),
                    position: spotlightResearch ? "relative" : "static",
                    zIndex: spotlightResearch ? 2 : 1,
                  }}
                >
                  {entry.completed ? "Completada" : entry.running ? "En curso" : "Investigar"}
                </button>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
