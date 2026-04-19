import React, { useEffect, useMemo, useState } from "react";
import { getSanctuaryErrandCatalog } from "../engine/sanctuary/jobEngine";

function panelStyle() {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "10px",
  };
}

function actionButtonStyle({ primary = false, disabled = false, danger = false } = {}) {
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
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };
}

function chipLabelStyle(color = "var(--tone-info, #0369a1)") {
  return {
    padding: "4px 8px",
    borderRadius: "999px",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-tertiary, #f8fafc)",
    color,
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
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

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

  return (
    <div style={{ position: "fixed", inset: isMobile ? "0 0 calc(72px + env(safe-area-inset-bottom)) 0" : 0, background: "rgba(2,6,23,0.72)", zIndex: isMobile ? 4800 : 9300, display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center", padding: isMobile ? "0" : "24px" }}>
      <div style={{ width: "100%", maxWidth: "1180px", maxHeight: "100%", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "16px 14px 18px" : "20px 22px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
              Encargos del Santuario
            </div>
            <div style={{ fontSize: isMobile ? "1.08rem" : "1.18rem", fontWeight: "900", marginTop: "4px" }}>
              Misiones paralelas de equipos auxiliares
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45, maxWidth: "72ch" }}>
              Los encargos no usan a tu heroe principal. Elegis exactamente que queres mejorar y el Santuario manda un equipo a buscarlo. El RNG afecta solo la cantidad final, no la direccion.
            </div>
          </div>
          <div style={{ display: "grid", gap: "8px", justifyItems: isMobile ? "stretch" : "end" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                {runningJobs.length} / {errandSlots} ocupados
              </span>
              <span style={chipLabelStyle("var(--tone-success, #10b981)")}>
                {availableSlots} libres
              </span>
              <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                {claimableJobs.length} recompensas
              </span>
            </div>
            <button onClick={onClose} style={actionButtonStyle()}>
              Volver al Santuario
            </button>
          </div>
        </div>

        <div style={panelStyle()}>
          <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
            {statusFlavor}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>Tier de progreso {progressTier}</span>
            <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>Escalado de rewards activo</span>
          </div>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.08fr 0.92fr", gap: "12px" }}>
          <div style={panelStyle()}>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                Catalogo de encargos
              </div>
              <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                Elegi direccion, duracion y reward esperada
              </div>
            </div>

            <div style={{ display: "grid", gap: "8px" }}>
              {catalog.map(entry => {
                const blocked = runningJobs.length >= errandSlots;
                return (
                  <div key={entry.id} style={panelStyle()}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: "900", color: entry.familyMeta?.color || "var(--color-text-primary, #1e293b)" }}>
                          {entry.label}
                        </div>
                        <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                          {entry.description}
                        </div>
                      </div>
                      <span style={chipLabelStyle(entry.familyMeta?.color || "var(--tone-info, #0369a1)")}>
                        {entry.rewardLabel}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0,1fr))", gap: "8px" }}>
                      {entry.durationOptions.map(option => (
                        <div key={option.id} style={{ ...panelStyle(), gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                            <div style={{ fontSize: "0.74rem", fontWeight: "900" }}>{option.shortLabel}</div>
                            <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>{option.rewardsLabel}</span>
                          </div>
                          <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                            {option.summary}
                          </div>
                          <button
                            onClick={() => dispatch({ type: "START_SANCTUARY_ERRAND", errandId: entry.id, durationId: option.id, now })}
                            disabled={blocked}
                            style={actionButtonStyle({ primary: !blocked, disabled: blocked })}
                          >
                            {blocked ? "Sin equipo libre" : "Asignar"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            <div style={panelStyle()}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                  Recompensas listas
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                  Equipos que ya volvieron
                </div>
              </div>

              {claimableJobs.length === 0 ? (
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  Todavia no hay equipos de regreso. Cuando un encargo termine, podras reclamarlo aca o desde el panel general de claims del Santuario.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {claimableJobs.map(job => (
                    <div key={job.id} style={panelStyle()}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{job.output?.label || job.input?.label || "Encargo"}</div>
                          <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                            {job.output?.summary}
                          </div>
                        </div>
                        <span style={chipLabelStyle("var(--tone-success, #10b981)")}>Listo</span>
                      </div>
                      <button
                        onClick={() => dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now })}
                        style={actionButtonStyle({ primary: true })}
                      >
                        Reclamar recompensa
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={panelStyle()}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                  Misiones en curso
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                  Equipos actualmente desplegados
                </div>
              </div>

              {runningJobs.length === 0 ? (
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  No hay grupos fuera del Santuario en este momento.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {runningJobs.map(job => (
                    <div key={job.id} style={panelStyle()}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{job.output?.label || job.input?.label || "Encargo"}</div>
                          <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                            {job.output?.summary}
                          </div>
                        </div>
                        <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                          {formatRemaining(Number(job.endsAt || 0) - now)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                          {job.input?.durationLabel || ""} · {job.output?.rewardLabel || "Recurso util"}
                        </div>
                        <button
                          onClick={() => dispatch({ type: "CANCEL_SANCTUARY_ERRAND", jobId: job.id, now })}
                          style={actionButtonStyle({ danger: true })}
                        >
                          Retirar equipo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
