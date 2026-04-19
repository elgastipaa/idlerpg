import React, { useEffect, useMemo, useState } from "react";
import { RUN_SIGILS, getRunSigil } from "../data/runSigils";
import { getSigilInfusionRecipe } from "../engine/sanctuary/jobEngine";

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

function actionButtonStyle({ primary = false, disabled = false } = {}) {
  return {
    border: "1px solid",
    borderColor: disabled
      ? "var(--color-border-primary, #e2e8f0)"
      : primary
        ? "var(--tone-success, #10b981)"
        : "var(--color-border-primary, #e2e8f0)",
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : primary
        ? "var(--tone-success-soft, #ecfdf5)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : primary
        ? "var(--tone-success, #10b981)"
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };
}

function chipLabelStyle(color = "var(--tone-success, #10b981)") {
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

export default function SigilAltarOverlay({ state, dispatch, isMobile = false, onClose }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const sanctuary = state.sanctuary || {};
  const resources = sanctuary?.resources || {};
  const sigilInfusions = sanctuary?.sigilInfusions || {};
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const infusionSlots = Math.max(1, Number(sanctuary?.stations?.sigilInfusion?.slots || 1));
  const runningInfusionJobs = useMemo(
    () => jobs.filter(job => job?.station === "sigilInfusion" && job?.status === "running"),
    [jobs]
  );
  const storedEntries = useMemo(
    () => Object.values(sigilInfusions).sort((left, right) => Number(right?.charges || 0) - Number(left?.charges || 0)),
    [sigilInfusions]
  );
  const totalCharges = storedEntries.reduce((total, entry) => total + Math.max(0, Number(entry?.charges || 0)), 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.72)", zIndex: 9300, display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center", padding: isMobile ? "0" : "24px" }}>
      <div style={{ width: "100%", maxWidth: "1120px", maxHeight: "100vh", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "18px 16px 20px" : "20px 22px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
              Altar de Sigilos
            </div>
            <div style={{ fontSize: isMobile ? "1.08rem" : "1.18rem", fontWeight: "900", marginTop: "4px" }}>
              Preparación persistente de la próxima expedición
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45, maxWidth: "68ch" }}>
              El altar concentra tanto la infusión activa como las cargas guardadas. Preparás sigilos con tiempo real y luego la próxima expedición consume automáticamente una carga si ese sigilo está equipado.
            </div>
          </div>
          <div style={{ display: "grid", gap: "8px", justifyItems: isMobile ? "stretch" : "end" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={chipLabelStyle("var(--tone-success, #10b981)")}>
                {runningInfusionJobs.length} / {infusionSlots} jobs
              </span>
              <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>
                {Math.floor(Number(resources?.sigilFlux || 0)).toLocaleString()} flux
              </span>
              <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                {totalCharges} cargas
              </span>
            </div>
            <button onClick={onClose} style={actionButtonStyle()}>
              Volver al Santuario
            </button>
          </div>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: "12px" }}>
          <div style={panelStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
                  Infusiones
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                  Sigilos disponibles para preparación
                </div>
              </div>
              <span style={chipLabelStyle("var(--tone-success, #10b981)")}>
                {runningInfusionJobs.length} / {infusionSlots} ocupados
              </span>
            </div>

            <div style={{ display: "grid", gap: "8px" }}>
              {RUN_SIGILS.map(sigil => {
                const recipe = getSigilInfusionRecipe(sigil.id);
                const storedCharges = Math.max(0, Number(sigilInfusions?.[sigil.id]?.charges || 0));
                const blocked =
                  runningInfusionJobs.length >= infusionSlots ||
                  Number(resources?.sigilFlux || 0) < Number(recipe?.fuelCost || 0);
                return (
                  <div key={sigil.id} style={panelStyle()}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{sigil.name}</div>
                        <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                          {recipe.summary}
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: "4px", justifyItems: "end" }}>
                        <span style={chipLabelStyle("var(--tone-success, #10b981)")}>
                          {storedCharges > 0 ? `${storedCharges} carga${storedCharges > 1 ? "s" : ""}` : "Sin carga"}
                        </span>
                        <span style={{ fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" }}>
                          {Math.max(1, Number(recipe?.fuelCost || 0))} flux · {formatRemaining(recipe?.durationMs || 0)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                        {blocked
                          ? runningInfusionJobs.length >= infusionSlots
                            ? "No hay slot libre en el altar."
                            : "Te falta flux de sigilo."
                          : "Listo para infusionar."}
                      </div>
                      <button
                        onClick={() => dispatch({ type: "START_SIGIL_INFUSION", sigilId: sigil.id, now })}
                        disabled={blocked}
                        style={actionButtonStyle({ primary: !blocked, disabled: blocked })}
                      >
                        Infusionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={panelStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                  Cargas guardadas
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                  Sigilos listos para ser consumidos por la próxima run
                </div>
              </div>
              <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>
                {totalCharges} totales
              </span>
            </div>

            {storedEntries.length === 0 ? (
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                Todavía no hay cargas guardadas. Cuando reclamás una infusión, queda acá hasta que una expedición futura la consuma.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {storedEntries.map(entry => (
                  <div key={entry.sigilId} style={panelStyle()}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{entry.label || getRunSigil(entry.sigilId).name}</div>
                        <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                          {entry.summary || "Carga persistente lista para una futura expedición."}
                        </div>
                      </div>
                      <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>
                        {Math.max(0, Number(entry?.charges || 0))} carga{Math.max(0, Number(entry?.charges || 0)) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {runningInfusionJobs.length > 0 && (
              <div style={panelStyle()}>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                  Trabajos del altar
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {runningInfusionJobs.map(job => (
                    <div key={job.id} style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>
                        {getRunSigil(job.output?.sigilId || "free").name}
                      </div>
                      <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                        {formatRemaining(Number(job.endsAt || 0) - now)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
