import React, { useEffect, useMemo, useState } from "react";

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
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };
}

function chipLabelStyle(color = "var(--tone-violet, #7c3aed)") {
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

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const sanctuary = state.sanctuary || {};
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

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.72)", zIndex: 9300, display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center", padding: isMobile ? "0" : "24px" }}>
      <div style={{ width: "100%", maxWidth: "1120px", maxHeight: "100vh", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "18px 16px 20px" : "20px 22px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
              Destileria
            </div>
            <div style={{ fontSize: isMobile ? "1.08rem" : "1.18rem", fontWeight: "900", marginTop: "4px" }}>
              Procesamiento persistente de cargo recuperado
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45, maxWidth: "70ch" }}>
              Acá convertís bundles recuperados en recursos de cuenta. La estación puede crecer más adelante con recetas, refinados avanzados y decisiones de prioridad sin recargar el hub principal.
            </div>
          </div>
          <div style={{ display: "grid", gap: "8px", justifyItems: isMobile ? "stretch" : "end" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={chipLabelStyle("var(--tone-violet, #7c3aed)")}>
                {runningJobs.length} / {distillerySlots} jobs
              </span>
              <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                {claimableJobs.length} claims
              </span>
              <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                {totalBundleQuantity} bundles
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
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
                  Cargo en espera
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                  Bundles listos para refinar
                </div>
              </div>
              <span style={chipLabelStyle("var(--tone-violet, #7c3aed)")}>
                {cargoInventory.length} tipos
              </span>
            </div>

            {cargoInventory.length === 0 ? (
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                No hay cargo persistente en espera. Extrae bundles desde una expedición para alimentar esta estación.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {cargoInventory.map(bundle => {
                  const preview = getDistillPreview(bundle);
                  const blocked = runningJobs.length >= distillerySlots;
                  return (
                    <div key={bundle.id} style={panelStyle()}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{bundle.label}</div>
                          <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
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
                        <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                          {blocked ? "No hay slot libre en la Destilería." : "Listo para procesarse en tiempo real."}
                        </div>
                        <button
                          onClick={() => dispatch({ type: "START_DISTILLERY_JOB", cargoId: bundle.id, now })}
                          disabled={blocked}
                          style={actionButtonStyle({ primary: !blocked, disabled: blocked })}
                        >
                          Destilar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            <div style={panelStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                    Reservas refinadas
                  </div>
                  <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                    Recursos actuales del Santuario
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
                <div style={panelStyle()}>
                  <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                    Tinta
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{Math.floor(Number(resources?.codexInk || 0)).toLocaleString()}</div>
                </div>
                <div style={panelStyle()}>
                  <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                    Flux
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{Math.floor(Number(resources?.sigilFlux || 0)).toLocaleString()}</div>
                </div>
                <div style={panelStyle()}>
                  <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                    Polvo
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{Math.floor(Number(resources?.relicDust || 0)).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {(runningJobs.length > 0 || claimableJobs.length > 0) && (
              <div style={panelStyle()}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                      Trabajos de la estación
                    </div>
                    <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                      Estado de refinado
                    </div>
                  </div>
                </div>

                {claimableJobs.length > 0 && (
                  <div style={{ display: "grid", gap: "8px" }}>
                    {claimableJobs.map(job => (
                      <div key={job.id} style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
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

                {runningJobs.length > 0 && (
                  <div style={{ display: "grid", gap: "8px" }}>
                    {runningJobs.map(job => (
                      <div key={job.id} style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
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
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
