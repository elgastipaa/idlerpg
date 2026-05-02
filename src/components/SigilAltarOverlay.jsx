import React, { useEffect, useMemo, useState } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import JobProgressBar from "./JobProgressBar";
import HorizontalOptionSelector from "./HorizontalOptionSelector";
import { FlBadge, FlButton, FlMetricGrid, FlPanel, FlPanelHeader } from "./ui/forge";
import { RUN_SIGILS, getRunSigil } from "../data/runSigils";
import { getSigilInfusionRecipe } from "../engine/sanctuary/jobEngine";
import useRelativeNow from "../hooks/useRelativeNow";

function panelClass(tone = "success") {
  return [
    "fl-station-panel",
    `fl-station-panel--${tone}`,
  ].join(" ");
}

function cardClass({ compact = false } = {}) {
  return [
    "fl-station-metric-card",
    compact ? "fl-station-metric-card--compact" : "",
  ].filter(Boolean).join(" ");
}

function chipLabelClass(tone = "success") {
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

export default function SigilAltarOverlay({ state, dispatch, isMobile = false, embedded = false, onClose }) {
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

  const content = (
    <div
      className="fl-station-overlay fl-station-overlay--sigils overlay-station-body overlay-station-body--forge"
    >
          <FlPanel
            variant="compact"
            className="fl-sigils-hero-panel"
            header={(
              <FlPanelHeader
                title="Altar de Sigilos"
                subtitle="Preparación persistente de la próxima expedición"
                copy="Prepara cargas con tiempo real. La próxima expedición consume automáticamente una carga del sigilo equipado."
                actions={(
                  <FlButton variant="secondary" size="sm" onClick={onClose}>
                    Volver
                  </FlButton>
                )}
              />
            )}
          >
            <div className="fl-sigils-hero-panel__chips">
              <FlBadge variant="pill" size="xs" tone="success">
                {runningInfusionJobs.length} / {infusionSlots} jobs
              </FlBadge>
              <FlBadge variant="pill" size="xs" tone="reward">
                {Math.floor(Number(resources?.sigilFlux || 0)).toLocaleString()} flux
              </FlBadge>
              <FlBadge variant="pill" size="xs" tone="defense">
                {totalCharges} cargas
              </FlBadge>
            </div>

            <FlMetricGrid
              className="fl-sigils-hero-metrics"
              columns={3}
              mobileColumns={3}
              compact
              items={[
                {
                  id: "sigils-flux",
                  label: "Flux",
                  value: Math.floor(Number(resources?.sigilFlux || 0)).toLocaleString(),
                  tone: "arcane",
                },
                {
                  id: "sigils-jobs",
                  label: "Jobs",
                  value: runningInfusionJobs.length,
                  tone: "defense",
                },
                {
                  id: "sigils-charges",
                  label: "Cargas",
                  value: totalCharges,
                  tone: "success",
                },
              ]}
            />
          </FlPanel>

          <section className="overlay-split-54-46">
            <div className={panelClass("success")}>
              <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" } }}>
                <div>
                  <div {...{ style: { fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" } }}>
                    Infusiones
                  </div>
                  <div {...{ style: { fontSize: "1rem", fontWeight: "900", marginTop: "4px" } }}>
                    Sigilos disponibles para preparación
                  </div>
                  <div {...{ style: { fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 } }}>
                    Convierte flux en cargas persistentes de sigilo.
                  </div>
                </div>
              </div>

              <div {...{ style: { display: "grid", gap: "8px" } }}>
                <HorizontalOptionSelector
                  options={infusionOptions}
                  selectedId={selectedInfusion?.sigil?.id || selectedSigilId}
                  onSelect={option => setSelectedSigilId(option?.sigil?.id || "free")}
                  getOptionId={option => option?.sigil?.id || "free"}
                  getOptionKey={option => `sigil-option-${option?.sigil?.id || "free"}`}
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
                        <span {...{ style: { fontSize: "0.65rem", fontWeight: "900" } }}>{option.sigil.shortName || option.sigil.name}</span>
                        <span {...{ style: { fontSize: "0.58rem", fontWeight: "800", color: selected ? "var(--tone-success, #10b981)" : "var(--color-text-secondary, #64748b)" } }}>
                          {status}
                        </span>
                      </>
                    );
                  }}
                />

                {selectedInfusion && (
                  <div className={cardClass()}>
                    <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", flexWrap: "wrap" } }}>
                      <div {...{ style: { minWidth: 0 } }}>
                        <div {...{ style: { fontSize: "0.78rem", fontWeight: "900" } }}>{selectedInfusion.sigil.name}</div>
                        <div {...{ style: { fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.45 } }}>
                          {selectedInfusion.recipe.summary}
                        </div>
                      </div>
                      <div {...{ style: { display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" } }}>
                        <span className={chipLabelClass("success")}>
                          {selectedInfusion.storedCharges} carga{selectedInfusion.storedCharges === 1 ? "" : "s"}
                        </span>
                        <span className={chipLabelClass("info")}>
                          {selectedInfusion.runningJobs.length} en curso
                        </span>
                      </div>
                    </div>

                    <div {...{ style: { display: "flex", gap: "6px", flexWrap: "wrap" } }}>
                      <span {...{ style: { fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "3px 7px", background: "var(--color-background-primary, #f8fafc)" } }}>
                        {Math.max(1, Number(selectedInfusion.recipe?.fuelCost || 0))} flux
                      </span>
                      <span {...{ style: { fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "3px 7px", background: "var(--color-background-primary, #f8fafc)" } }}>
                        {formatRemaining(selectedInfusion.recipe?.durationMs || 0)}
                      </span>
                    </div>

                    <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
                      <div {...{ style: { fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" } }}>
                        {selectedInfusion.blocked
                          ? selectedInfusion.blockedBySlots
                            ? "No hay slot libre en el altar."
                            : "Te falta flux de sigilo."
                          : "Listo para infusionar."}
                      </div>
                      <FlButton
                        variant={!selectedInfusion.blocked ? "default" : "secondary"}
                        size="sm"
                        onClick={() => dispatch({ type: "START_SIGIL_INFUSION", sigilId: selectedInfusion.sigil.id, now })}
                        disabled={selectedInfusion.blocked}
                      >
                        Infusionar
                      </FlButton>
                    </div>

                    {selectedInfusion.runningJobs.length > 0 && (
                      <div {...{ style: { display: "grid", gap: "6px" } }}>
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

            <div className={panelClass("accent")}>
              <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" } }}>
                <div>
                  <div {...{ style: { fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" } }}>
                    Cargas guardadas
                  </div>
                  <div {...{ style: { fontSize: "1rem", fontWeight: "900", marginTop: "4px" } }}>
                    Sigilos listos para la próxima run
                  </div>
                  <div {...{ style: { fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 } }}>
                    Se consumen automáticamente al iniciar expedición.
                  </div>
                </div>
              </div>

              <>
                {storedEntries.length === 0 ? (
                  <div {...{ style: { fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 } }}>
                    Todavía no hay cargas guardadas. Cuando reclamás una infusión, queda acá hasta que una expedición futura la consuma.
                  </div>
                ) : (
                  <div {...{ style: { display: "grid", gap: "8px" } }}>
                    {storedEntries.map(entry => (
                      <div key={entry.sigilId} className={cardClass()}>
                        <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" } }}>
                          <div>
                            <div {...{ style: { fontSize: "0.78rem", fontWeight: "900" } }}>{entry.label || getRunSigil(entry.sigilId).name}</div>
                            <div {...{ style: { fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 } }}>
                              {entry.summary || "Carga persistente lista para una futura expedición."}
                            </div>
                          </div>
                          <span className={chipLabelClass("accent")}>
                            {Math.max(0, Number(entry?.charges || 0))} carga{Math.max(0, Number(entry?.charges || 0)) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {runningInfusionJobs.length > 0 && (
                  <div className={cardClass()}>
                    <div {...{ style: { fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" } }}>
                      Trabajos del altar
                    </div>
                    <div {...{ style: { display: "grid", gap: "8px" } }}>
                      {runningInfusionJobs.map(job => (
                        <div key={job.id} {...{ style: { display: "grid", gap: "6px" } }}>
                          <div {...{ style: { fontSize: "0.72rem", fontWeight: "900" } }}>
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
  );

  if (embedded) {
    return content;
  }

  return (
    <OverlayShell isMobile={isMobile} embedded={embedded} variant="forge" contentLabel="Altar de Sigilos">
      <OverlaySurface
        isMobile={isMobile}
        embedded={embedded}
        variant="forge"
        className="fl-station-overlay fl-station-overlay--sigils"
      >
        {content}
      </OverlaySurface>
    </OverlayShell>
  );
}
