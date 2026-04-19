import React, { useEffect, useMemo, useState } from "react";
import DistilleryOverlay from "./DistilleryOverlay";
import EncargosOverlay from "./EncargosOverlay";
import BlueprintForgeOverlay from "./BlueprintForgeOverlay";
import SigilAltarOverlay from "./SigilAltarOverlay";
import BibliotecaOverlay from "./BibliotecaOverlay";
import LaboratoryOverlay from "./LaboratoryOverlay";
import { getRunSigil } from "../data/runSigils";
import { getSanctuaryStationState } from "../engine/sanctuary/laboratoryEngine";

function sectionCardStyle(accent = "var(--tone-accent, #4338ca)") {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "12px",
    boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
    borderTop: `3px solid ${accent}`,
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

function actionButtonStyle({ primary = false, disabled = false } = {}) {
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
    boxShadow: disabled ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };
}

function stationButtonStyle({
  tone = "var(--tone-accent, #4338ca)",
  surface = "var(--tone-accent-soft, #eef2ff)",
  disabled = false,
} = {}) {
  return {
    border: "1px solid",
    borderColor: disabled ? "var(--color-border-primary, #e2e8f0)" : tone,
    background: disabled ? "var(--color-background-tertiary, #f8fafc)" : surface,
    color: disabled ? "var(--color-text-tertiary, #94a3b8)" : tone,
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.02)",
  };
}

function chipStyle(accent = "var(--tone-accent, #4338ca)") {
  return {
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-tertiary, #f8fafc)",
    color: accent,
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "0.62rem",
    fontWeight: "900",
  };
}

function formatPhaseLabel(phase = "sanctuary") {
  if (phase === "active") return "Expedicion activa";
  if (phase === "setup") return "Preparando expedicion";
  if (phase === "extraction") return "Extraccion abierta";
  return "En Santuario";
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

function resourceLabel(resourceKey = "") {
  if (resourceKey === "codexInk") return "Tinta de Biblioteca";
  if (resourceKey === "sigilFlux") return "Flux de Sigilo";
  if (resourceKey === "relicDust") return "Polvo de Reliquia";
  return resourceKey;
}

function jobStationLabel(station = "") {
  if (station === "distillery") return "Destileria";
  if (station === "errands") return "Encargos";
  if (station === "sigilInfusion") return "Altar de Sigilos";
  if (station === "codexResearch") return "Biblioteca";
  if (station === "deepForge") return "Forja Profunda";
  if (station === "laboratory") return "Laboratorio";
  return "Santuario";
}

function jobTitle(job = {}) {
  if (job.type === "distill_bundle") return job.output?.label || "Destilacion";
  if (job.type === "sanctuary_errand") return job.output?.label || job.input?.label || "Encargo";
  if (job.type === "infuse_sigil") return `Infusion · ${getRunSigil(job.output?.sigilId || "free").name}`;
  if (job.type === "scrap_extracted_item") return `Desguace · ${job.input?.itemName || "Item"}`;
  if (job.type === "codex_research") return `Biblioteca · ${job.input?.label || "Investigacion"}`;
  if (job.type === "laboratory_research") return `Laboratorio · ${job.input?.label || "Infraestructura"}`;
  return "Job";
}

function jobSummary(job = {}) {
  if (job.type === "distill_bundle") {
    return `Procesa ${job.input?.quantity || 0} bundle(s) para devolver ${job.output?.amount || 0} ${job.output?.label || "recursos"}.`;
  }
  if (job.type === "sanctuary_errand") {
    return job.output?.summary || "El Santuario envia un equipo a recuperar recursos utiles.";
  }
  if (job.type === "infuse_sigil") {
    return job.output?.summary || "Prepara un sigilo para una futura expedicion.";
  }
  if (job.type === "scrap_extracted_item") {
    return job.output?.summary || "Desguaza un item rescatado y devuelve cargas de afinidad.";
  }
  if (job.type === "codex_research") {
    return job.output?.summary || "Activa un nuevo hito de la Biblioteca con tinta y tiempo real.";
  }
  if (job.type === "laboratory_research") {
    return job.output?.summary || "Mejora la infraestructura del Santuario con investigación persistente.";
  }
  if (job.type === "forge_project") {
    return `Sube ${job.input?.project?.name || "proyecto"} a +${job.output?.nextUpgradeLevel || 1} dentro de la capa persistente.`;
  }
  return "Trabajo persistente del Santuario.";
}

export default function Sanctuary({ state, dispatch }) {
  const [now, setNow] = useState(Date.now());
  const [showDistillery, setShowDistillery] = useState(false);
  const [showErrands, setShowErrands] = useState(false);
  const [showDeepForge, setShowDeepForge] = useState(false);
  const [showSigilAltar, setShowSigilAltar] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLaboratory, setShowLaboratory] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(window.innerWidth < 768);

  function closeAllOverlays() {
    setShowDistillery(false);
    setShowErrands(false);
    setShowDeepForge(false);
    setShowSigilAltar(false);
    setShowLibrary(false);
    setShowLaboratory(false);
  }

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const handler = event => {
      if (event?.detail?.tab === "sanctuary") {
        closeAllOverlays();
      }
    };
    window.addEventListener("primary-tab-reselected", handler);
    return () => window.removeEventListener("primary-tab-reselected", handler);
  }, []);

  const expeditionPhase = state.expedition?.phase || "sanctuary";
  const hasClass = Boolean(state.player?.class);
  const hasSpec = Boolean(state.player?.specialization);
  const sanctuary = state.sanctuary || {};
  const extractedItems = Array.isArray(sanctuary?.extractedItems) ? sanctuary.extractedItems : [];
  const blueprints = Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints : [];
  const stashCount = Number(extractedItems.length || 0);
  const blueprintCount = Number(blueprints.length || 0);
  const cargoInventory = Array.isArray(sanctuary?.cargoInventory) ? sanctuary.cargoInventory : [];
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const resources = sanctuary?.resources || {};
  const familyCharges = sanctuary?.familyCharges || {};
  const activeBlueprints = sanctuary?.activeBlueprints || {};
  const sigilInfusions = sanctuary?.sigilInfusions || {};
  const distillerySlots = Number(sanctuary?.stations?.distillery?.slots || 1);
  const errandSlots = Number(sanctuary?.stations?.errands?.slots || 2);
  const infusionSlots = Number(sanctuary?.stations?.sigilInfusion?.slots || 1);
  const librarySlots = Number(sanctuary?.stations?.codexResearch?.slots || 1);
  const deepForgeSlots = Number(sanctuary?.stations?.deepForge?.slots || 1);
  const distilleryStation = getSanctuaryStationState(sanctuary, "distillery");
  const libraryStation = getSanctuaryStationState(sanctuary, "codexResearch");
  const errandStation = getSanctuaryStationState(sanctuary, "errands");
  const infusionStation = getSanctuaryStationState(sanctuary, "sigilInfusion");
  const deepForgeStation = getSanctuaryStationState(sanctuary, "deepForge");
  const laboratoryStation = getSanctuaryStationState(sanctuary, "laboratory");

  const claimableJobs = useMemo(
    () => jobs.filter(job => job?.status === "claimable"),
    [jobs]
  );
  const runningJobs = useMemo(
    () => jobs.filter(job => job?.status === "running").sort((left, right) => Number(left?.endsAt || 0) - Number(right?.endsAt || 0)),
    [jobs]
  );
  const runningByStation = useMemo(() => {
    const counts = {};
    for (const job of runningJobs) {
      counts[job.station] = (counts[job.station] || 0) + 1;
    }
    return counts;
  }, [runningJobs]);
  const laboratoryRunningCount = Number(runningByStation.laboratory || 0);
  const laboratoryClaimableCount = claimableJobs.filter(job => job?.station === "laboratory").length;
  const laboratoryCompletedCount = Object.keys(sanctuary?.laboratory?.completed || {}).length;

  const expeditionCta = useMemo(() => {
    if (expeditionPhase === "active") {
      return {
        label: "Volver a Expedicion",
        primary: true,
        action: () => dispatch({ type: "SET_TAB", tab: "combat" }),
        helper: "Tu expedicion sigue activa. Podes volver al frente o seguir operando el Santuario mientras corre.",
      };
    }
    if (expeditionPhase === "extraction") {
      return {
        label: "Resolver extraccion",
        primary: true,
        action: () => dispatch({ type: "SET_TAB", tab: "sanctuary" }),
        helper: "La expedicion ya cerro. Primero confirma la extraccion abierta para volver a salir.",
      };
    }
    if (!hasClass || !hasSpec) {
      return {
        label: hasClass ? "Elegir especializacion" : "Elegir heroe",
        primary: true,
        action: () => dispatch({ type: "SET_TAB", tab: "character" }),
        helper: "Antes de salir, defini clase y especializacion para esta expedicion.",
      };
    }
    if (expeditionPhase === "setup" || state.combat?.pendingRunSetup) {
      return {
        label: "Preparar expedicion",
        primary: true,
        action: () => dispatch({ type: "ENTER_EXPEDITION_SETUP" }),
        helper: "Termina de configurar sigilos y sali con la proxima expedicion.",
      };
    }
    return {
      label: "Ir a Expedicion",
      primary: true,
      action: () => dispatch({ type: "SET_TAB", tab: "combat" }),
      helper: "Tu heroe ya esta listo. Vuelve al combate cuando quieras.",
    };
  }, [dispatch, expeditionPhase, hasClass, hasSpec, state.combat?.pendingRunSetup]);

  const expeditionLabel = hasClass
    ? `${state.player.class}${hasSpec ? ` · ${state.player.specialization}` : ""}`
    : "Sin heroe asignado";

  const totalStoredSigilCharges = useMemo(
    () => Object.values(sigilInfusions).reduce((total, entry) => total + Math.max(0, Number(entry?.charges || 0)), 0),
    [sigilInfusions]
  );
  const runningLibraryJobs = useMemo(
    () => jobs.filter(job => job?.station === "codexResearch" && job?.status === "running"),
    [jobs]
  );
  const claimableLibraryJobs = useMemo(
    () => jobs.filter(job => job?.station === "codexResearch" && job?.status === "claimable"),
    [jobs]
  );
  const totalCargoQuantity = useMemo(
    () => cargoInventory.reduce((total, bundle) => total + Math.max(0, Number(bundle?.quantity || 0)), 0),
    [cargoInventory]
  );
  const runningErrandJobs = useMemo(
    () => jobs.filter(job => job?.station === "errands" && job?.status === "running"),
    [jobs]
  );
  const claimableErrandJobs = useMemo(
    () => jobs.filter(job => job?.station === "errands" && job?.status === "claimable"),
    [jobs]
  );
  const errandFlavorText = useMemo(() => {
    if (claimableErrandJobs.length > 0) {
      return "El equipo ha vuelto. Han recuperado materiales y fragmentos utiles.";
    }
    if (runningErrandJobs.length > 0) {
      return "Un grupo del Santuario esta en mision. Regresara en breve.";
    }
    return "El Santuario tiene equipos disponibles. Asigna un encargo y volveran con recursos utiles.";
  }, [claimableErrandJobs.length, runningErrandJobs.length]);

  return (
    <div style={{ padding: "0.9rem", display: "grid", gap: "0.9rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section style={sectionCardStyle("var(--tone-accent, #4338ca)")}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Santuario
            </div>
            <div style={{ fontSize: "1.08rem", fontWeight: "900", marginTop: "4px" }}>
              Hub persistente
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ padding: "8px 10px", borderRadius: "999px", border: "1px solid rgba(99,102,241,0.18)", background: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)", fontSize: "0.68rem", fontWeight: "900", whiteSpace: "nowrap" }}>
              {formatPhaseLabel(expeditionPhase)}
            </div>
            <button onClick={expeditionCta.action} style={actionButtonStyle({ primary: expeditionCta.primary })}>
              {expeditionCta.label}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Heroe de guardia
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{expeditionLabel}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Stash temporal
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{stashCount}/{Number(sanctuary?.extractionUpgrades?.extractedItemSlots || 3)} items</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Blueprints
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{blueprintCount} activos/persistidos</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Cargo persistente
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{cargoInventory.length} bundles</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Claims listos
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{claimableJobs.length}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
          {Object.entries(resources).map(([key, value]) => (
            <div key={key} style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                {resourceLabel(key)}
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{Math.floor(Number(value || 0)).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
          <span style={{ fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{expeditionLabel}.</span>{" "}
            {expeditionCta.helper}
        </div>
      </section>

      {claimableJobs.length > 0 && (
      <section style={sectionCardStyle("var(--tone-warning, #f59e0b)")}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
              Claims
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>Listos para reclamar</div>
          </div>
          <div style={chipStyle("var(--tone-warning, #f59e0b)")}>
            {claimableJobs.length} disponibles
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          {claimableJobs.map(job => (
            <div key={job.id} style={metricCardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: "0.76rem", fontWeight: "900" }}>{jobTitle(job)}</div>
                  <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                    {jobStationLabel(job.station)}
                  </div>
                </div>
                <span style={chipStyle("var(--tone-success, #10b981)")}>Listo</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                  {jobSummary(job)}
                </div>
                <button onClick={() => dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now })} style={actionButtonStyle({ primary: true })}>
                  Reclamar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        <div style={sectionCardStyle("var(--tone-accent, #4338ca)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                Biblioteca
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Archivo, maestrias e investigacion del Santuario
              </div>
            </div>
            <div style={chipStyle("var(--tone-accent, #4338ca)")}>
              {libraryStation.unlocked ? `${runningLibraryJobs.length} / ${librarySlots} estudios` : "Bloqueada"}
            </div>
          </div>

          <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
            {libraryStation.unlocked
              ? "Archivo, maestrias e investigaciones."
              : "Desbloqueala desde Laboratorio."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Tinta
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {Math.floor(Number(resources?.codexInk || 0)).toLocaleString()}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Recompensas
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {claimableLibraryJobs.length}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                En curso
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {runningLibraryJobs.length}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>Conocimiento persistente del Santuario.</div>
            <button
              onClick={() => (libraryStation.unlocked ? setShowLibrary(true) : setShowLaboratory(true))}
              style={stationButtonStyle({
                tone: "var(--tone-accent, #4338ca)",
                surface: "var(--tone-accent-soft, #eef2ff)",
              })}
            >
              {libraryStation.unlocked ? "Abrir Biblioteca" : "Investigar en Laboratorio"}
            </button>
          </div>
        </div>

        <div style={sectionCardStyle("var(--tone-violet, #7c3aed)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
                Destileria
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Estación separada para refinar cargo persistente
              </div>
            </div>
            <div style={chipStyle("var(--tone-violet, #7c3aed)")}>
              {distilleryStation.unlocked ? `${runningByStation.distillery || 0} / ${distillerySlots} ocupados` : "Bloqueada"}
            </div>
          </div>

          <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
            {distilleryStation.unlocked
              ? "Refina cargo persistente en tiempo real."
              : "Desbloqueala desde Laboratorio."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Bundles
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {totalCargoQuantity}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Tipos
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {cargoInventory.length}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Claims
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {jobs.filter(job => job?.station === "distillery" && job?.status === "claimable").length}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>Convierte bundles en recursos utiles.</div>
            <button
              onClick={() => (distilleryStation.unlocked ? setShowDistillery(true) : setShowLaboratory(true))}
              style={stationButtonStyle({
                tone: "var(--tone-violet, #7c3aed)",
                surface: "var(--tone-violet-soft, #f3e8ff)",
              })}
            >
              {distilleryStation.unlocked ? "Abrir Destileria" : "Investigar en Laboratorio"}
            </button>
          </div>
        </div>

        <div style={sectionCardStyle("var(--tone-info, #0369a1)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                Encargos
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Equipos del Santuario para misiones paralelas
              </div>
            </div>
            <div style={chipStyle("var(--tone-info, #0369a1)")}>
              {errandStation.unlocked ? `${runningErrandJobs.length} / ${errandSlots} equipos ocupados` : "Bloqueada"}
            </div>
          </div>

          <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
            {errandStation.unlocked
              ? errandFlavorText
              : "Desbloquealos desde Laboratorio."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Disponibles
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {Math.max(0, errandSlots - runningErrandJobs.length)}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                En curso
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {runningErrandJobs.length}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Recompensas
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {claimableErrandJobs.length}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>Envia equipos y reclama recursos.</div>
            <button
              onClick={() => (errandStation.unlocked ? setShowErrands(true) : setShowLaboratory(true))}
              style={stationButtonStyle({
                tone: "var(--tone-info, #0369a1)",
                surface: "var(--tone-info-soft, #f0f9ff)",
              })}
            >
              {errandStation.unlocked ? "Abrir Encargos" : "Investigar en Laboratorio"}
            </button>
          </div>
        </div>

        <div style={sectionCardStyle("var(--tone-success, #10b981)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
                Altar de Sigilos
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Estación separada para preparar la próxima expedición
              </div>
            </div>
            <div style={chipStyle("var(--tone-success, #10b981)")}>
              {infusionStation.unlocked ? `${runningByStation.sigilInfusion || 0} / ${infusionSlots} jobs` : "Bloqueada"}
            </div>
          </div>

          <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
            {infusionStation.unlocked
              ? "Prepara sigilos para futuras runs."
              : "Desbloquealo desde Laboratorio."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Flux
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {Math.floor(Number(resources?.sigilFlux || 0)).toLocaleString()}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Cargas listas
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {totalStoredSigilCharges}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Trabajos
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {runningByStation.sigilInfusion || 0}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>Guarda cargas y prepara la siguiente expedicion.</div>
            <button
              onClick={() => (infusionStation.unlocked ? setShowSigilAltar(true) : setShowLaboratory(true))}
              style={stationButtonStyle({
                tone: "var(--tone-success, #10b981)",
                surface: "var(--tone-success-soft, #ecfdf5)",
              })}
            >
              {infusionStation.unlocked ? "Abrir Altar de Sigilos" : "Investigar en Laboratorio"}
            </button>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        <div style={sectionCardStyle("var(--tone-danger, #D85A30)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
                Stash temporal
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Items rescatados desde extraccion
              </div>
            </div>
            <div style={chipStyle("var(--tone-danger, #D85A30)")}>
              {extractedItems.length} / {Number(sanctuary?.extractionUpgrades?.extractedItemSlots || 3)} slots
            </div>
          </div>

          {extractedItems.length === 0 ? (
            <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
              Extrae una pieza y luego decidí si convertirla en blueprint o desguazarla.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {extractedItems.map(item => {
                const scrapBlocked = (runningByStation.deepForge || 0) >= deepForgeSlots;
                return (
                  <div key={item.id} style={metricCardStyle()}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{item.name}</div>
                        <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                          {item.rarity} · {item.type} · rating {Math.round(Number(item?.rating || 0))} · {Array.isArray(item?.affixes) ? item.affixes.length : 0} affix
                        </div>
                      </div>
                      <span style={chipStyle("var(--tone-danger, #D85A30)")}>
                        {item.legendaryPowerId ? "Legendary" : "Rescatado"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>Blueprint ahora o desguace con retorno mayor.</div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => dispatch({ type: "CONVERT_EXTRACTED_ITEM_TO_BLUEPRINT", extractedItemId: item.id, now })}
                          style={actionButtonStyle({ primary: true })}
                        >
                          Convertir a blueprint
                        </button>
                        <button
                          onClick={() => dispatch({ type: "START_SCRAP_EXTRACTED_ITEM_JOB", extractedItemId: item.id, now })}
                          disabled={scrapBlocked}
                          style={actionButtonStyle({ disabled: scrapBlocked })}
                        >
                          Desguazar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={sectionCardStyle("var(--tone-info, #0369a1)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                Jobs en curso
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Cola persistente del Santuario
              </div>
            </div>
            <div style={chipStyle("var(--tone-info, #0369a1)")}>
              {runningJobs.length} corriendo
            </div>
          </div>

          {runningJobs.length === 0 ? (
            <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
              No hay trabajos corriendo.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {runningJobs.map(job => (
                <div key={job.id} style={metricCardStyle()}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{jobTitle(job)}</div>
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                        {jobSummary(job)}
                      </div>
                    </div>
                    <span style={chipStyle("var(--tone-info, #0369a1)")}>
                      {formatRemaining(Number(job.endsAt || 0) - now)}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.62rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" }}>
                    {jobStationLabel(job.station)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={sectionCardStyle("var(--tone-accent, #4338ca)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                Laboratorio
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Infraestructura del Santuario
              </div>
            </div>
            <div style={chipStyle("var(--tone-accent, #4338ca)")}>
              {laboratoryStation.unlocked ? `${laboratoryRunningCount} / ${Math.max(1, Number(laboratoryStation.slots || 1))} jobs` : "Bloqueado"}
            </div>
          </div>

          <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
            Desbloquea estaciones, slots y tiempos.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Estudios
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{laboratoryCompletedCount}</div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Claims
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>{laboratoryClaimableCount}</div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Activo
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {laboratoryStation.unlocked ? "Si" : "No"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
              {laboratoryClaimableCount > 0 ? "Hay investigaciones listas." : "Gestiona la infraestructura del hub."}
            </div>
            <button
              onClick={() => setShowLaboratory(true)}
              style={stationButtonStyle({
                tone: "var(--tone-accent, #4338ca)",
                surface: "var(--tone-accent-soft, #eef2ff)",
              })}
            >
              Abrir Laboratorio
            </button>
          </div>
        </div>

        <div style={sectionCardStyle("var(--tone-danger, #D85A30)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
                Forja Profunda
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Estacion separada para blueprints persistentes
              </div>
            </div>
            <div style={chipStyle("var(--tone-danger, #D85A30)")}>
              {deepForgeStation.unlocked ? `${runningByStation.deepForge || 0} / ${deepForgeSlots} jobs` : "Bloqueada"}
            </div>
          </div>

          <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
            {deepForgeStation.unlocked
              ? "Gestiona blueprints, cargas y progreso largo."
              : "Desbloqueala desde Laboratorio."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Blueprints
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {blueprintCount} plano{blueprintCount !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Cargas
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {Object.values(familyCharges || {}).reduce((total, value) => total + Math.max(0, Number(value || 0)), 0)}
              </div>
            </div>
            <div style={metricCardStyle()}>
              <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                Loadout activo
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "900" }}>
                {activeBlueprints.weapon || activeBlueprints.armor ? "Si" : "No"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
              {blueprintCount > 0 ? "Tus planos alimentan la proxima run." : "Primero rescata una pieza y conviertela en blueprint."}
            </div>
            <button
              onClick={() => (deepForgeStation.unlocked ? setShowDeepForge(true) : setShowLaboratory(true))}
              disabled={deepForgeStation.unlocked ? blueprintCount <= 0 : false}
              style={stationButtonStyle({
                tone: "var(--tone-danger, #D85A30)",
                surface: "var(--tone-danger-soft, #fff1f2)",
                disabled: deepForgeStation.unlocked ? blueprintCount <= 0 : false,
              })}
            >
              {deepForgeStation.unlocked ? "Abrir Forja Profunda" : "Investigar en Laboratorio"}
            </button>
          </div>
        </div>
      </section>

      {showDistillery && (
        <DistilleryOverlay
          state={state}
          dispatch={dispatch}
          isMobile={isMobileViewport}
          onClose={() => setShowDistillery(false)}
        />
      )}
      {showErrands && (
        <EncargosOverlay
          state={state}
          dispatch={dispatch}
          isMobile={isMobileViewport}
          onClose={() => setShowErrands(false)}
        />
      )}
      {showDeepForge && (
        <BlueprintForgeOverlay
          state={state}
          dispatch={dispatch}
          isMobile={isMobileViewport}
          onClose={() => setShowDeepForge(false)}
        />
      )}
      {showSigilAltar && (
        <SigilAltarOverlay
          state={state}
          dispatch={dispatch}
          isMobile={isMobileViewport}
          onClose={() => setShowSigilAltar(false)}
        />
      )}
      {showLibrary && (
        <BibliotecaOverlay
          state={state}
          dispatch={dispatch}
          isMobile={isMobileViewport}
          onClose={() => setShowLibrary(false)}
        />
      )}
      {showLaboratory && (
        <LaboratoryOverlay
          state={state}
          dispatch={dispatch}
          isMobile={isMobileViewport}
          onClose={() => setShowLaboratory(false)}
        />
      )}
    </div>
  );
}
