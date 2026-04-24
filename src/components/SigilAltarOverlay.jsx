import React, { useEffect, useMemo, useState } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import JobProgressBar from "./JobProgressBar";
import HorizontalOptionSelector from "./HorizontalOptionSelector";
import { RUN_SIGILS, getRunSigil } from "../data/runSigils";
import { getSigilInfusionRecipe } from "../engine/sanctuary/jobEngine";
import useRelativeNow from "../hooks/useRelativeNow";

function sectionPanelStyle(accent = "var(--tone-success, #10b981)") {
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

function cardStyle() {
  return {
    background: "var(--color-background-tertiary, #f8fafc)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "12px",
    padding: "10px",
    display: "grid",
    gap: "8px",
  };
}

function metricCardStyle() {
  return {
    background: "var(--color-background-tertiary, #f8fafc)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "12px",
    padding: "8px 10px",
    display: "grid",
    gap: "2px",
  };
}

function actionButtonStyle({ primary = false, disabled = false, compact = false } = {}) {
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
    padding: compact ? "7px 11px" : "10px 14px",
    fontSize: compact ? "0.68rem" : "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };
}

function chipLabelStyle(color = "var(--tone-success, #10b981)") {
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

function getInitialSigilSelection(sanctuary = {}) {
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const runningJob = jobs.find(job => job?.station === "sigilInfusion" && job?.status === "running");
  if (runningJob?.output?.sigilId || runningJob?.input?.sigilId) {
    return getRunSigil(runningJob.output?.sigilId || runningJob.input?.sigilId).id;
  }

  const sigilInfusions = sanctuary?.sigilInfusions || {};
  const storedEntry = Object.values(sigilInfusions)
    .filter(entry => Number(entry?.charges || 0) > 0)
    .sort((left, right) => Number(right?.charges || 0) - Number(left?.charges || 0))[0];
  if (storedEntry?.sigilId) return getRunSigil(storedEntry.sigilId).id;

  return RUN_SIGILS[0]?.id || "free";
}

export default function SigilAltarOverlay({ state, dispatch, isMobile = false, onClose }) {
  const now = useRelativeNow();
  const sanctuary = state.sanctuary || {};
  const [selectedSigilId, setSelectedSigilId] = useState(() => getInitialSigilSelection(sanctuary));

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
  const runningJobsBySigil = useMemo(() => {
    const grouped = {};
    for (const job of runningInfusionJobs) {
      const sigilId = getRunSigil(job?.output?.sigilId || job?.input?.sigilId || "free").id;
      if (!Array.isArray(grouped[sigilId])) grouped[sigilId] = [];
      grouped[sigilId].push(job);
    }
    return grouped;
  }, [runningInfusionJobs]);
  const infusionOptions = useMemo(
    () =>
      RUN_SIGILS.map(sigil => {
        const recipe = getSigilInfusionRecipe(sigil.id);
        const storedCharges = Math.max(0, Number(sigilInfusions?.[sigil.id]?.charges || 0));
        const runningForSigil = Array.isArray(runningJobsBySigil?.[sigil.id]) ? runningJobsBySigil[sigil.id] : [];
        const blockedBySlots = runningInfusionJobs.length >= infusionSlots;
        const blockedByFuel = Number(resources?.sigilFlux || 0) < Number(recipe?.fuelCost || 0);
        return {
          sigil,
          recipe,
          storedCharges,
          runningJobs: runningForSigil,
          blocked: blockedBySlots || blockedByFuel,
          blockedBySlots,
          blockedByFuel,
        };
      }),
    [infusionSlots, resources?.sigilFlux, runningInfusionJobs.length, runningJobsBySigil, sigilInfusions]
  );
  const selectedInfusion = useMemo(() => {
    const selected = infusionOptions.find(option => option.sigil.id === selectedSigilId);
    return selected || infusionOptions[0] || null;
  }, [infusionOptions, selectedSigilId]);

  useEffect(() => {
    if (!selectedInfusion && infusionOptions.length > 0) {
      setSelectedSigilId(infusionOptions[0].sigil.id);
      return;
    }
    if (selectedInfusion && selectedSigilId !== selectedInfusion.sigil.id) {
      setSelectedSigilId(selectedInfusion.sigil.id);
    }
  }, [infusionOptions, selectedInfusion, selectedSigilId]);

  return (
    <OverlayShell isMobile={isMobile} contentLabel="Altar de Sigilos">
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
          <section style={sectionPanelStyle("var(--tone-success, #10b981)")}>
            <div style={{ display: "grid", gap: "12px", alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
                  Altar de Sigilos
                </div>
                <div style={{ fontSize: "1.02rem", fontWeight: "900", marginTop: "4px" }}>
                  Preparación persistente de la próxima expedición
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35, maxWidth: "56ch" }}>
                  Prepara cargas con tiempo real. La próxima expedición consume automáticamente una carga del sigilo equipado.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
              <div style={metricCardStyle()}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Flux</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{Math.floor(Number(resources?.sigilFlux || 0)).toLocaleString()}</div>
              </div>
              <div style={metricCardStyle()}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Jobs</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{runningInfusionJobs.length}</div>
              </div>
              <div style={metricCardStyle()}>
                <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>Cargas</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>{totalCharges}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ ...actionButtonStyle({ compact: true }), flex: "0 0 auto" }}>
                Volver
              </button>
            </div>
          </section>

          <section className="overlay-split-54-46">
            <div style={sectionPanelStyle("var(--tone-success, #10b981)")}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
                    Infusiones
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                    Sigilos disponibles para preparación
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>
                    Convierte flux en cargas persistentes de sigilo.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <HorizontalOptionSelector
                  options={infusionOptions}
                  selectedId={selectedInfusion?.sigil?.id || selectedSigilId}
                  onSelect={option => setSelectedSigilId(option?.sigil?.id || "free")}
                  getOptionId={option => option?.sigil?.id || "free"}
                  getOptionKey={option => `sigil-option-${option?.sigil?.id || "free"}`}
                  getArrowButtonStyle={({ disabled }) => ({
                    ...actionButtonStyle({ compact: true, disabled }),
                    minWidth: "34px",
                    padding: "4px 0",
                  })}
                  getOptionButtonStyle={({ selected }) => ({
                    ...actionButtonStyle({ compact: true, primary: selected }),
                    minWidth: "118px",
                    display: "grid",
                    gap: "1px",
                    textAlign: "left",
                    flexShrink: 0,
                  })}
                  renderOption={({ option, selected }) => {
                    const runningCount = option.runningJobs.length;
                    const status = option.blocked
                      ? option.blockedBySlots
                        ? "Sin slot"
                        : "Falta flux"
                      : runningCount > 0
                        ? "En curso"
                        : "Listo";
                    return (
                      <>
                        <span style={{ fontSize: "0.65rem", fontWeight: "900" }}>{option.sigil.shortName || option.sigil.name}</span>
                        <span style={{ fontSize: "0.58rem", fontWeight: "800", color: selected ? "var(--tone-success, #10b981)" : "var(--color-text-secondary, #64748b)" }}>
                          {status}
                        </span>
                      </>
                    );
                  }}
                />

                {selectedInfusion && (
                  <div style={cardStyle()}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{selectedInfusion.sigil.name}</div>
                        <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.45 }}>
                          {selectedInfusion.recipe.summary}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <span style={chipLabelStyle("var(--tone-success, #10b981)")}>
                          {selectedInfusion.storedCharges} carga{selectedInfusion.storedCharges === 1 ? "" : "s"}
                        </span>
                        <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                          {selectedInfusion.runningJobs.length} en curso
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "3px 7px", background: "var(--color-background-primary, #f8fafc)" }}>
                        {Math.max(1, Number(selectedInfusion.recipe?.fuelCost || 0))} flux
                      </span>
                      <span style={{ fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "3px 7px", background: "var(--color-background-primary, #f8fafc)" }}>
                        {formatRemaining(selectedInfusion.recipe?.durationMs || 0)}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                        {selectedInfusion.blocked
                          ? selectedInfusion.blockedBySlots
                            ? "No hay slot libre en el altar."
                            : "Te falta flux de sigilo."
                          : "Listo para infusionar."}
                      </div>
                      <button
                        onClick={() => dispatch({ type: "START_SIGIL_INFUSION", sigilId: selectedInfusion.sigil.id, now })}
                        disabled={selectedInfusion.blocked}
                        style={actionButtonStyle({ primary: !selectedInfusion.blocked, disabled: selectedInfusion.blocked })}
                      >
                        Infusionar
                      </button>
                    </div>

                    {selectedInfusion.runningJobs.length > 0 && (
                      <div style={{ display: "grid", gap: "6px" }}>
                        {selectedInfusion.runningJobs.map(job => (
                          <JobProgressBar
                            key={job.id}
                            startedAt={job?.startedAt}
                            endsAt={job?.endsAt}
                            now={now}
                            tone="var(--tone-info, #0369a1)"
                            rightLabel={formatRemaining(Number(job?.endsAt || 0) - now)}
                            compact
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={sectionPanelStyle("var(--tone-accent, #4338ca)")}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                    Cargas guardadas
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                    Sigilos listos para la próxima run
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>
                    Se consumen automáticamente al iniciar expedición.
                  </div>
                </div>
              </div>

              <>
                {storedEntries.length === 0 ? (
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                    Todavía no hay cargas guardadas. Cuando reclamás una infusión, queda acá hasta que una expedición futura la consuma.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "8px" }}>
                    {storedEntries.map(entry => (
                      <div key={entry.sigilId} style={cardStyle()}>
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
                  <div style={cardStyle()}>
                    <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                      Trabajos del altar
                    </div>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {runningInfusionJobs.map(job => (
                        <div key={job.id} style={{ display: "grid", gap: "6px" }}>
                          <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>
                            {getRunSigil(job?.output?.sigilId || "free").name}
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
                  </div>
                )}
              </>
            </div>
          </section>
        </div>
      </OverlaySurface>
    </OverlayShell>
  );
}
