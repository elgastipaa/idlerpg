import React, { useEffect, useMemo, useState } from "react";
import {
  getLaboratoryCatalog,
  getSanctuaryStationState,
  SANCTUARY_STATION_DEFAULTS,
} from "../engine/sanctuary/laboratoryEngine";

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

export default function Laboratory({ state, dispatch }) {
  const [now, setNow] = useState(Date.now());

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
  const completedCount = catalog.filter(entry => entry.completed).length;
  const unlockedStations = Object.values(SANCTUARY_STATION_DEFAULTS)
    .filter(station => station.id !== "laboratory")
    .filter(station => getSanctuaryStationState(sanctuary, station.id).unlocked).length;

  return (
    <div style={{ padding: "1rem", display: "grid", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
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
                <button onClick={() => dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now })} style={buttonStyle({ primary: true })}>
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
              <div key={entry.id} style={metricCardStyle()}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", flexWrap: "wrap" }}>
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
                  {SANCTUARY_STATION_DEFAULTS[entry.stationId]?.label || entry.stationId} · {costLabel(entry.costs)} · {formatDuration(entry.durationMs)}
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
                  onClick={() => dispatch({ type: "START_LAB_RESEARCH", researchId: entry.id, now })}
                  disabled={!entry.canStart}
                  style={buttonStyle({ primary: entry.canStart, disabled: !entry.canStart })}
                >
                  {entry.completed ? "Completada" : entry.running ? "En curso" : "Investigar"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
