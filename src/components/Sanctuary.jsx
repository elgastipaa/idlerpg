import React, { useEffect, useMemo, useState } from "react";
import DistilleryOverlay from "./DistilleryOverlay";
import EncargosOverlay from "./EncargosOverlay";
import BlueprintForgeOverlay from "./BlueprintForgeOverlay";
import SigilAltarOverlay from "./SigilAltarOverlay";
import BibliotecaOverlay from "./BibliotecaOverlay";
import LaboratoryOverlay from "./LaboratoryOverlay";
import { getRunSigil } from "../data/runSigils";
import { CLASSES } from "../data/classes";
import { getSanctuaryStationState } from "../engine/sanctuary/laboratoryEngine";
import {
  getOnboardingStepInteractionMode,
  getOnboardingTutorialDeepForgeProjectId,
  getOnboardingTutorialExtractedItemId,
  ONBOARDING_STEPS,
  isBlueprintDecisionUnlocked,
  isDistilleryUnlocked,
  isLaboratoryUnlocked,
} from "../engine/onboarding/onboardingEngine";

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
    padding: "8px 12px",
    fontSize: "0.7rem",
    lineHeight: 1.15,
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
    padding: "8px 12px",
    fontSize: "0.7rem",
    lineHeight: 1.15,
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

function nextStepToneStyle(tone = "accent") {
  if (tone === "success") {
    return {
      accent: "var(--tone-success, #10b981)",
      surface: "var(--tone-success-soft, #ecfdf5)",
    };
  }
  if (tone === "warning") {
    return {
      accent: "var(--tone-warning, #f59e0b)",
      surface: "var(--tone-warning-soft, #fff7ed)",
    };
  }
  if (tone === "danger") {
    return {
      accent: "var(--tone-danger, #D85A30)",
      surface: "var(--tone-danger-soft, #fff1f2)",
    };
  }
  return {
    accent: "var(--tone-accent, #4338ca)",
    surface: "var(--tone-accent-soft, #eef2ff)",
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
  if (station === "deepForge") return "Taller";
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

function sortJobsByEnding(left = {}, right = {}) {
  return Number(left?.endsAt || 0) - Number(right?.endsAt || 0);
}

export default function Sanctuary({ state, dispatch }) {
  const [now, setNow] = useState(Date.now());
  const [showDistillery, setShowDistillery] = useState(false);
  const [showErrands, setShowErrands] = useState(false);
  const [showDeepForge, setShowDeepForge] = useState(false);
  const [showSigilAltar, setShowSigilAltar] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLaboratory, setShowLaboratory] = useState(false);
  const [showDetailedInfrastructure, setShowDetailedInfrastructure] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const isMobileViewport = viewportWidth < 768;
  const isNarrowViewport = viewportWidth < 420;

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
    const handler = () => setViewportWidth(window.innerWidth);
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

  useEffect(() => {
    if (
      [
        "research_distillery",
        "deep_forge_ready",
        "library_ready",
        "errands_ready",
        "sigil_altar_ready",
        "abyss_portal_ready",
      ].includes(state?.onboarding?.step) &&
      !showLaboratory
    ) {
      setShowLaboratory(true);
    }
  }, [showLaboratory, state?.onboarding?.step]);

  useEffect(() => {
    const selectorByStep = {
      [ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN]: '[data-onboarding-target="open-laboratory"]',
      [ONBOARDING_STEPS.DISTILLERY_READY]: '[data-onboarding-target="open-distillery"]',
    };
    const selector = selectorByStep[state?.onboarding?.step];
    if (!selector) return undefined;

    let frameId = null;
    const scrollToTarget = () => {
      const target = document.querySelector(selector);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    frameId = requestAnimationFrame(scrollToTarget);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
    };
  }, [state?.onboarding?.step, showLaboratory]);

  const expeditionPhase = state.expedition?.phase || "sanctuary";
  const onboardingStep = state?.onboarding?.step || null;
  const onboardingMode = getOnboardingStepInteractionMode(onboardingStep, state);
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
  const laboratoryUnlocked = laboratoryStation.unlocked || isLaboratoryUnlocked(state);
  const distilleryUnlocked = distilleryStation.unlocked && isDistilleryUnlocked(state);
  const blueprintDecisionUnlocked = isBlueprintDecisionUnlocked(state);
  const tutorialBlueprintItemId = getOnboardingTutorialExtractedItemId(state);
  const tutorialDeepForgeProjectId = getOnboardingTutorialDeepForgeProjectId(state);
  const infrastructureVisible = Boolean(state?.onboarding?.completed || state?.onboarding?.flags?.firstExtractionCompleted);
  const laboratoryCompleted = sanctuary?.laboratory?.completed || {};
  const abyssPortalUnlocked = Boolean(state?.abyss?.portalUnlocked);
  const tier25BossCleared = Boolean(state?.abyss?.tier25BossCleared);
  const showingSanctuaryIntro = !hasClass && onboardingStep === ONBOARDING_STEPS.EXPEDITION_INTRO;
  const choosingClass = !hasClass && onboardingStep === ONBOARDING_STEPS.CHOOSE_CLASS;
  const spotlightBlueprintIntro =
    onboardingStep === ONBOARDING_STEPS.BLUEPRINT_INTRO && onboardingMode === "forced";
  const spotlightDistilleryReady =
    onboardingStep === ONBOARDING_STEPS.DISTILLERY_READY && onboardingMode === "forced";
  const forceDetailedInfrastructure = [
    ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN,
    ONBOARDING_STEPS.DISTILLERY_READY,
    ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
    ONBOARDING_STEPS.BLUEPRINT_INTRO,
    ONBOARDING_STEPS.BLUEPRINT_DECISION,
    ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE,
  ].includes(onboardingStep);

  useEffect(() => {
    if (forceDetailedInfrastructure) {
      setShowDetailedInfrastructure(true);
    }
  }, [forceDetailedInfrastructure]);

  function scrollToClassSelection() {
    const element = document.getElementById("onboarding-class-selector");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openLaboratoryFromSanctuary(source = "generic") {
    if (!laboratoryUnlocked) return;
    if (
      onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN &&
      source !== "laboratory-card"
    ) {
      return;
    }
    setShowLaboratory(true);
    if (onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN) {
      dispatch({ type: "ACK_ONBOARDING_STEP" });
    }
  }

  function acknowledgeTutorialStep(stepId) {
    if (onboardingStep === stepId) {
      dispatch({ type: "ACK_ONBOARDING_STEP" });
    }
  }

  function handleTutorialStationOpen(stepId, action) {
    action();
    acknowledgeTutorialStep(stepId);
  }

  const claimableJobs = useMemo(
    () => jobs.filter(job => job?.status === "claimable"),
    [jobs]
  );
  const runningJobs = useMemo(
    () => jobs.filter(job => job?.status === "running").sort(sortJobsByEnding),
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
    if (showingSanctuaryIntro) {
      return {
        label: "Iniciar expedicion",
        primary: true,
        action: () => dispatch({ type: "ACK_ONBOARDING_STEP" }),
        helper: "Toca este boton para aprender el primer gesto del juego. Luego eliges una clase y ahi si entras al combate.",
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.RESEARCH_DISTILLERY) {
      return {
        label: "Abrir Laboratorio",
        primary: true,
        action: () => openLaboratoryFromSanctuary("header-cta"),
        helper: "La expedicion ya cerro. El siguiente paso del tutorial es investigar la Destileria desde el Laboratorio.",
      };
    }
    if (!hasClass) {
      return {
        label: "Elegir clase",
        primary: true,
        action: scrollToClassSelection,
        helper: "La run todavia no tiene identidad. Baja a las cartas y elige Warrior o Mage para entrar al combate.",
      };
    }
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
    if (expeditionPhase === "setup" || state.combat?.pendingRunSetup) {
      return {
        label: "Preparar expedicion",
        primary: true,
        action: () => dispatch({ type: "ENTER_EXPEDITION_SETUP" }),
        helper: "Termina de configurar sigilos y sali con la proxima expedicion.",
      };
    }
    return {
      label: "Iniciar expedicion",
      primary: true,
      action: () => dispatch({ type: "ENTER_EXPEDITION_SETUP" }),
      helper: "Tu heroe ya esta listo. Abre la preparacion de la siguiente salida y vuelve al frente.",
    };
  }, [dispatch, expeditionPhase, hasClass, laboratoryUnlocked, onboardingStep, showingSanctuaryIntro, state.combat?.pendingRunSetup]);

  const expeditionLabel = hasClass
    ? `${state.player.class}${hasSpec ? ` · ${state.player.specialization}` : ""}`
    : "Sin heroe asignado";

  if (!hasClass) {
    return (
      <div style={{ padding: "12px", display: "grid", gap: "12px" }}>
        <section style={sectionCardStyle("var(--tone-accent, #4338ca)")}>
          <div style={{ display: "grid", gap: "6px" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Santuario
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
              {showingSanctuaryIntro
                ? "Inicia tu primera expedicion desde aqui"
                : "Elige una clase para abrir tu primera expedicion"}
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
              {showingSanctuaryIntro
                ? "El Santuario es tu base. Primero aprendes a salir desde aqui; recien despues eliges una clase y entras al combate."
                : "Ahora ya sabes el flujo general. El siguiente paso es elegir Warrior o Mage para que la primera run tenga una identidad base."}
            </div>
            {showingSanctuaryIntro && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                <button
                  onClick={expeditionCta.action}
                  data-onboarding-target={showingSanctuaryIntro ? "start-expedition" : undefined}
                  style={{
                    ...actionButtonStyle({ primary: true }),
                    boxShadow: "0 0 0 2px rgba(83,74,183,0.16), 0 12px 28px rgba(83,74,183,0.14)",
                    animation: "sanctuarySpotlightPulse 1600ms ease-in-out infinite",
                  }}
                >
                  {expeditionCta.label}
                </button>
              </div>
            )}
          </div>
        </section>

        {showingSanctuaryIntro ? (
          <section style={sectionCardStyle("var(--tone-info, #0369a1)")}>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
              Primera run
            </div>
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                Primero sal desde el Santuario.
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                Toca <strong>Iniciar expedicion</strong>. En el siguiente paso elegirás una clase para esa salida y, recien ahi, entrarás al combate para arrancar la run.
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)" }}>
                Usa el boton real resaltado arriba, no este panel.
              </div>
            </div>
          </section>
        ) : (
          <section
            id="onboarding-class-selector"
            style={{
              ...sectionCardStyle("var(--tone-info, #0369a1)"),
              boxShadow:
                choosingClass
                  ? "0 0 0 2px rgba(3,105,161,0.14), 0 12px 30px rgba(3,105,161,0.16)"
                  : "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
              animation: choosingClass ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite" : "none",
            }}
          >
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
              {choosingClass ? "Paso obligatorio" : "Elegir clase"}
            </div>
            {choosingClass && (
              <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                Elige una clase para esta primera salida. En cuanto la selecciones entraras al combate y la expedicion arrancara.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {CLASSES.map(clase => (
                <button
                  key={clase.id}
                  onClick={() => dispatch({ type: "SELECT_CLASS", classId: clase.id })}
                  data-onboarding-target={choosingClass ? "choose-class" : undefined}
                  style={{
                    border: "1px solid var(--color-border-primary, #e2e8f0)",
                    background: "var(--color-background-secondary, #ffffff)",
                    borderRadius: "14px",
                    padding: "14px",
                    display: "grid",
                    gap: "8px",
                    textAlign: "left",
                    cursor: "pointer",
                    position: "relative",
                    zIndex: choosingClass ? 2 : 1,
                    boxShadow: choosingClass
                      ? "0 0 0 2px rgba(3,105,161,0.18), 0 14px 34px rgba(3,105,161,0.18)"
                      : "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
                    animation: choosingClass ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "1.4rem", lineHeight: 1 }}>{clase.icon || "?"}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.92rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{clase.name}</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {clase.playstyle || "Clase"}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                    {clase.description}
                  </div>
                  <div style={{ fontSize: "0.66rem", color: "var(--tone-accent, #4338ca)", fontWeight: "900" }}>
                    {clase.id === "warrior"
                      ? "Impacto frontal, aguante y curva mas estable."
                      : "Caster mas fragil al inicio, pero con mas precision y control."}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const totalCargoQuantity = useMemo(
    () => cargoInventory.reduce((total, bundle) => total + Math.max(0, Number(bundle?.quantity || 0)), 0),
    [cargoInventory]
  );

  const nextStep = useMemo(() => {
    const unlockedEchoes = Number(state?.prestige?.level || 0) > 0 || Number(state?.prestige?.totalEchoesEarned || 0) > 0;
    const hasAnyCargo = totalCargoQuantity > 0;
    const hasAnyBlueprint = blueprintCount > 0;
    const maxTierReached = Number(state?.combat?.maxTier || 1);
    const hasSeenBoss = maxTierReached >= 5 || Number(state?.combat?.analytics?.bossKills || 0) > 0;
    if (!hasClass) {
      return {
        tone: "accent",
        eyebrow: "Primer paso",
        title: "Elegi un heroe para empezar la primera expedicion",
        body: "La cuenta todavia no tiene una build activa. Defini una clase para abrir el loop real del juego.",
        cta: "Ir a Heroe",
        action: () => dispatch({ type: "SET_TAB", tab: "character" }),
      };
    }
    if (!hasSeenBoss) {
      return {
        tone: "warning",
        eyebrow: "Objetivo temprano",
        title: "Empuja hasta Tier 5 para revelar el primer boss e Intel",
        body: "El primer quiebre del juego llega cuando ves un boss real. Ahi se abre mejor la lectura tactica de la run y empieza a sentirse la seed de la expedicion.",
        cta: expeditionPhase === "active" ? "Volver a Expedicion" : "Iniciar expedicion",
        action: () => (expeditionPhase === "active"
          ? dispatch({ type: "SET_TAB", tab: "combat" })
          : dispatch({ type: "ENTER_EXPEDITION_SETUP" })),
      };
    }
    if (expeditionPhase === "extraction") {
      return {
        tone: "accent",
        eyebrow: "Decision activa",
        title: "Resuelve la extraccion antes de seguir",
        body: "Esta salida define que bundles persisten, si rescatas un item temporal y si la run ya convierte a Ecos.",
        cta: "Abrir extraccion",
        action: () => dispatch({ type: "SET_TAB", tab: "sanctuary" }),
      };
    }
    if (!laboratoryUnlocked && sanctuary?.jobs?.length === 0 && hasAnyCargo) {
      return {
        tone: "accent",
        eyebrow: "Primer retorno",
        title: "La primera extraccion abre el Laboratorio",
        body: "Tu siguiente paso ya no es solo volver a pelear. Activa el Laboratorio y usa su primer research para encender la Destileria.",
        cta: "Abrir Laboratorio",
        action: () => openLaboratoryFromSanctuary("next-step"),
      };
    }
    if (laboratoryUnlocked && !distilleryUnlocked) {
      return {
        tone: "accent",
        eyebrow: "Infraestructura",
        title: "Investiga la Destileria para procesar tu primer cargo",
        body: "Sin esta estacion, los bundles solo se acumulan. La Destileria convierte lo rescatado en tinta, flux, polvo y esencia.",
        cta: "Ir al Laboratorio",
        action: () => openLaboratoryFromSanctuary("next-step"),
      };
    }
    if (!hasAnyCargo && stashCount === 0 && !hasAnyBlueprint) {
      return {
        tone: "warning",
        eyebrow: "Primer loop",
        title: "Haz una extraccion completa para traer valor al Santuario",
        body: "La expedicion ya no termina solo en loot inmediato. Extraer trae bundles persistentes y, si aparece, un item rescatado para decidir despues.",
        cta: expeditionPhase === "active" ? "Volver a Expedicion" : "Iniciar expedicion",
        action: () => (expeditionPhase === "active"
          ? dispatch({ type: "SET_TAB", tab: "combat" })
          : dispatch({ type: "ENTER_EXPEDITION_SETUP" })),
      };
    }
    if (blueprintDecisionUnlocked && stashCount > 0 && !hasAnyBlueprint) {
      return {
        tone: "danger",
        eyebrow: "Decision clave",
        title: "Decide que hacer con tu primera pieza del Taller",
        body: "El item rescatado no vuelve equipado. Elige si se transforma en plano persistente o si lo rompes para ganar cargas de afinidad.",
        cta: "Abrir Taller",
        action: () => setShowDeepForge(true),
      };
    }
    if (blueprintDecisionUnlocked && Number(state?.prestige?.level || 0) >= 3 && !deepForgeStation.unlocked) {
      return {
        tone: "accent",
        eyebrow: "Proyecto persistente",
        title: "Ya puedes investigar el Taller",
        body: "Desde Prestige 3, el Laboratorio puede abrir la estacion donde se trabajan blueprints y progreso persistente a largo plazo.",
        cta: "Ir al Laboratorio",
        action: () => openLaboratoryFromSanctuary("next-step"),
      };
    }
    if (Number(state?.prestige?.level || 0) >= 4 && !libraryStation.unlocked) {
      return {
        tone: "accent",
        eyebrow: "Conocimiento",
        title: "Biblioteca ya puede investigarse",
        body: "Desde Prestige 4, el Laboratorio puede abrir la Biblioteca para transformar tinta y descubrimientos en progreso permanente real.",
        cta: "Ir al Laboratorio",
        action: () => openLaboratoryFromSanctuary("next-step"),
      };
    }
    if (Number(state?.prestige?.level || 0) >= 5 && !errandStation.unlocked) {
      return {
        tone: "accent",
        eyebrow: "Apoyo paralelo",
        title: "Encargos ya pueden organizarse",
        body: "Desde Prestige 5, el Laboratorio habilita equipos paralelos del Santuario para seguir trayendo valor mientras tu heroe corre expediciones.",
        cta: "Ir al Laboratorio",
        action: () => openLaboratoryFromSanctuary("next-step"),
      };
    }
    if (Number(state?.prestige?.level || 0) >= 6 && !infusionStation.unlocked) {
      return {
        tone: "accent",
        eyebrow: "Preparacion",
        title: "Altar de Sigilos ya puede erigirse",
        body: "Desde Prestige 6, el Laboratorio puede activar el Altar y convertir flux en una preparacion mas dirigida para la siguiente run.",
        cta: "Ir al Laboratorio",
        action: () => openLaboratoryFromSanctuary("next-step"),
      };
    }
    if (hasAnyBlueprint && !unlockedEchoes) {
      return {
        tone: "success",
        eyebrow: "Primer prestige",
        title: "Tu siguiente meta es extraer una run que ya convierta a Ecos",
        body: "Con el primer prestige se abre el tablero de Ecos y el juego pasa de ser solo una expedicion a una cuenta persistente completa.",
        cta: expeditionPhase === "active" ? "Volver a Expedicion" : "Iniciar expedicion",
        action: () => (expeditionPhase === "active"
          ? dispatch({ type: "SET_TAB", tab: "combat" })
          : dispatch({ type: "ENTER_EXPEDITION_SETUP" })),
      };
    }
    if (
      tier25BossCleared &&
      !abyssPortalUnlocked &&
      laboratoryCompleted.unlock_library &&
      laboratoryCompleted.unlock_errands &&
      laboratoryCompleted.unlock_sigil_altar
    ) {
      return {
        tone: "danger",
        eyebrow: "Fin del mundo base",
        title: "El Portal al Abismo ya puede investigarse",
        body: "Derrotaste al boss de Tier 25. Sin ese portal, la expedicion no puede avanzar mas alla del mundo base aunque sigas empujando.",
        cta: "Abrir Laboratorio",
        action: () => openLaboratoryFromSanctuary("next-step"),
      };
    }
    if (libraryStation.unlocked && Number(resources?.codexInk || 0) <= 0) {
      return {
        tone: "accent",
        eyebrow: "Biblioteca",
        title: "Necesitas Tinta de Biblioteca para activar hitos permanentes",
        body: "Recupera codex traces, destilalos y luego invierte esa tinta en la Biblioteca para convertir kills y descubrimientos en bonificaciones reales.",
        cta: "Abrir Biblioteca",
        action: () => setShowLibrary(true),
      };
    }
    return {
      tone: "success",
      eyebrow: "Santuario activo",
      title: "Ya tienes el loop principal funcionando",
      body: "Ahora el foco es refinar blueprints, mantener jobs corriendo y convertir una buena expedicion en mejor cuenta, no solo en mejor run.",
      cta: "Abrir Taller",
      action: () => setShowDeepForge(true),
    };
  }, [
    blueprintDecisionUnlocked,
    blueprintCount,
    deepForgeStation.unlocked,
    dispatch,
    distilleryUnlocked,
    errandStation.unlocked,
    expeditionPhase,
    hasClass,
    infusionStation.unlocked,
    laboratoryUnlocked,
    laboratoryCompleted.unlock_errands,
    laboratoryCompleted.unlock_library,
    laboratoryCompleted.unlock_sigil_altar,
    libraryStation.unlocked,
    onboardingStep,
    resources?.codexInk,
    sanctuary?.jobs,
    stashCount,
    abyssPortalUnlocked,
    state?.combat?.analytics?.bossKills,
    state?.combat?.maxTier,
    state?.prestige?.level,
    state?.prestige?.totalEchoesEarned,
    tier25BossCleared,
    totalCargoQuantity,
  ]);
  const nextStepTone = nextStepToneStyle(nextStep.tone);
  const readyNowRows = useMemo(() => {
    const rows = claimableJobs.slice(0, 3).map(job => ({
      id: `claim-${job.id}`,
      title: jobTitle(job),
      detail: jobStationLabel(job.station),
      chip: "Listo",
      actionLabel: "Reclamar",
      action: () => dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now }),
    }));
    if (rows.length > 0) return rows;
    return [{
      id: "next-step",
      title: nextStep.title,
      detail: nextStep.eyebrow,
      chip: "Siguiente",
      actionLabel: nextStep.cta,
      action: nextStep.action,
    }];
  }, [claimableJobs, dispatch, nextStep, now]);
  const runningOverviewRows = useMemo(() => {
    const rows = runningJobs.slice(0, 3).map(job => ({
      id: `running-${job.id}`,
      title: jobTitle(job),
      detail: jobStationLabel(job.station),
      chip: formatRemaining(Number(job.endsAt || 0) - now),
    }));
    if (rows.length > 0) return rows;
    return [{
      id: "idle",
      title: "Sin trabajos corriendo",
      detail: "Lanza una investigacion o un job para dejar valor cocinandose mientras juegas.",
      chip: "Libre",
    }];
  }, [now, runningJobs]);

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
  const stationOverviewRows = useMemo(() => ([
    {
      id: "laboratory",
      title: "Laboratorio",
      status: laboratoryUnlocked ? `${laboratoryRunningCount} activo(s)` : "Bloqueado",
      detail: laboratoryClaimableCount > 0 ? `${laboratoryClaimableCount} claim(s)` : "Infraestructura y unlocks",
      tone: "var(--tone-accent, #4338ca)",
      actionLabel: laboratoryUnlocked ? "Abrir" : "Cerrado",
      action: laboratoryUnlocked ? () => openLaboratoryFromSanctuary("overview-laboratory") : null,
    },
    {
      id: "distillery",
      title: "Destileria",
      status: distilleryUnlocked ? `${runningByStation.distillery || 0}/${distillerySlots}` : "Bloqueada",
      detail: `${totalCargoQuantity} bundle(s)`,
      tone: "var(--tone-violet, #7c3aed)",
      actionLabel: distilleryUnlocked ? "Abrir" : "Laboratorio",
      action: () => (distilleryUnlocked ? setShowDistillery(true) : openLaboratoryFromSanctuary("overview-distillery")),
    },
    {
      id: "library",
      title: "Biblioteca",
      status: libraryStation.unlocked ? `${runningLibraryJobs.length}/${librarySlots}` : "Bloqueada",
      detail: libraryStation.unlocked ? `${claimableLibraryJobs.length} claim(s)` : "Hitos e investigacion",
      tone: "var(--tone-accent, #4338ca)",
      actionLabel: libraryStation.unlocked ? "Abrir" : "Laboratorio",
      action: () => (libraryStation.unlocked ? setShowLibrary(true) : openLaboratoryFromSanctuary("overview-library")),
    },
    {
      id: "errands",
      title: "Encargos",
      status: errandStation.unlocked ? `${runningErrandJobs.length}/${errandSlots}` : "Bloqueados",
      detail: errandStation.unlocked ? `${claimableErrandJobs.length} recompensa(s)` : "Equipos paralelos",
      tone: "var(--tone-info, #0369a1)",
      actionLabel: errandStation.unlocked ? "Abrir" : "Laboratorio",
      action: () => (errandStation.unlocked ? setShowErrands(true) : openLaboratoryFromSanctuary("overview-errands")),
    },
    {
      id: "sigils",
      title: "Altar de Sigilos",
      status: infusionStation.unlocked ? `${runningByStation.sigilInfusion || 0}/${infusionSlots}` : "Bloqueado",
      detail: infusionStation.unlocked
        ? `${Object.values(sigilInfusions).reduce((total, entry) => total + Math.max(0, Number(entry?.charges || 0)), 0)} carga(s)`
        : "Preparacion de run",
      tone: "var(--tone-success, #10b981)",
      actionLabel: infusionStation.unlocked ? "Abrir" : "Laboratorio",
      action: () => (infusionStation.unlocked ? setShowSigilAltar(true) : openLaboratoryFromSanctuary("overview-sigil")),
    },
    ...(blueprintDecisionUnlocked
      ? [{
          id: "deepforge",
          title: "Taller",
          status: deepForgeStation.unlocked ? `${runningByStation.deepForge || 0}/${deepForgeSlots}` : "Bloqueada",
          detail: `${blueprintCount} blueprint(s)`,
          tone: "var(--tone-danger, #D85A30)",
          actionLabel: deepForgeStation.unlocked ? "Abrir" : "Laboratorio",
          action: () => (deepForgeStation.unlocked ? setShowDeepForge(true) : openLaboratoryFromSanctuary("overview-forge")),
        }]
      : []),
  ]), [
    blueprintCount,
    blueprintDecisionUnlocked,
    claimableErrandJobs.length,
    claimableLibraryJobs.length,
    deepForgeSlots,
    deepForgeStation.unlocked,
    distillerySlots,
    distilleryUnlocked,
    errandSlots,
    errandStation.unlocked,
    infusionSlots,
    infusionStation.unlocked,
    laboratoryClaimableCount,
    laboratoryRunningCount,
    laboratoryUnlocked,
    librarySlots,
    libraryStation.unlocked,
    runningByStation.deepForge,
    runningByStation.distillery,
    runningByStation.sigilInfusion,
    runningErrandJobs.length,
    runningLibraryJobs.length,
    sigilInfusions,
    totalCargoQuantity,
  ]);
  const summaryMetrics = useMemo(() => ([
    {
      id: "hero",
      label: "Heroe de guardia",
      value: expeditionLabel,
    },
    {
      id: "workshop",
      label: "Taller",
      value: `${stashCount}/${Number(sanctuary?.extractionUpgrades?.extractedItemSlots || 3)} items`,
    },
    {
      id: "blueprints",
      label: "Blueprints",
      value: `${blueprintCount} activos`,
    },
    {
      id: "cargo",
      label: "Cargo",
      value: `${cargoInventory.length} bundles`,
    },
    {
      id: "claims",
      label: "Claims",
      value: `${claimableJobs.length} listos`,
    },
  ]), [
    blueprintCount,
    cargoInventory.length,
    claimableJobs.length,
    expeditionLabel,
    sanctuary?.extractionUpgrades?.extractedItemSlots,
    stashCount,
  ]);
  const resourceSummaryRows = useMemo(
    () => Object.entries(resources)
      .filter(([, value]) => Math.floor(Number(value || 0)) > 0)
      .sort((left, right) => Number(right[1] || 0) - Number(left[1] || 0)),
    [resources]
  );
  const shouldShowClaimsSection = claimableJobs.length > (isMobileViewport ? 3 : 0);
  const topCardPadding = isMobileViewport ? "12px" : "16px";
  const compactMetricCard = {
    ...metricCardStyle(),
    padding: isMobileViewport ? "8px 10px" : "10px 12px",
    gap: isMobileViewport ? "2px" : "4px",
  };
  const topSummaryGridStyle = {
    display: "grid",
    gridTemplateColumns: isNarrowViewport ? "1fr" : isMobileViewport ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(150px, 1fr))",
    gap: isMobileViewport ? "8px" : "10px",
  };
  const stationOverviewGridStyle = {
    display: "grid",
    gridTemplateColumns: isNarrowViewport ? "1fr" : isMobileViewport ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "8px",
  };
  const bandSectionStyle = {
    display: "grid",
    gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(2, minmax(0, 1fr))",
    gap: "0.9rem",
  };
  const detailedInfrastructureGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
  };
  const mobileFullWidthButtonStyle = isMobileViewport ? { width: "100%", justifyContent: "center" } : null;
  const compactStatsGridStyle = {
    display: "grid",
    gridTemplateColumns: isNarrowViewport ? "1fr" : "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "8px",
  };

  return (
    <div style={{ padding: isMobileViewport ? "0.7rem" : "0.9rem", display: "grid", gap: "0.9rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <style>{`
        @keyframes sanctuarySpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(3,105,161,0.24); }
          70% { box-shadow: 0 0 0 10px rgba(3,105,161,0); }
          100% { box-shadow: 0 0 0 0 rgba(3,105,161,0); }
        }
      `}</style>
      <section style={{ ...sectionCardStyle("var(--tone-accent, #4338ca)"), padding: topCardPadding, gap: isMobileViewport ? "10px" : "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: isMobileViewport ? "stretch" : "center" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Santuario
            </div>
            <div style={{ fontSize: "1.08rem", fontWeight: "900", marginTop: "4px" }}>
              Hub persistente
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.4 }}>
              Reclama, prepara la proxima salida y deja valor cocinandose.
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", width: isMobileViewport ? "100%" : "auto", justifyContent: isMobileViewport ? "space-between" : "flex-end" }}>
            <div style={{ padding: "8px 10px", borderRadius: "999px", border: "1px solid rgba(99,102,241,0.18)", background: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)", fontSize: "0.68rem", fontWeight: "900", whiteSpace: "nowrap" }}>
              {formatPhaseLabel(expeditionPhase)}
            </div>
            <button
              onClick={expeditionCta.action}
              style={{
                ...actionButtonStyle({ primary: expeditionCta.primary }),
                ...(isMobileViewport ? { flex: "1 1 180px" } : null),
                boxShadow: showingSanctuaryIntro
                  ? "0 0 0 2px rgba(83,74,183,0.16), 0 12px 28px rgba(83,74,183,0.14)"
                  : undefined,
                animation: showingSanctuaryIntro ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite" : "none",
              }}
            >
              {expeditionCta.label}
            </button>
          </div>
        </div>

        <div style={topSummaryGridStyle}>
          {summaryMetrics.map(metric => (
            <div key={metric.id} style={compactMetricCard}>
              <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
                {metric.label}
              </div>
              <div style={{ fontSize: isMobileViewport ? "0.82rem" : "0.9rem", fontWeight: "900" }}>{metric.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {resourceSummaryRows.length > 0 ? resourceSummaryRows.map(([key, value]) => (
            <div
              key={key}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: isMobileViewport ? "7px 10px" : "8px 10px",
                borderRadius: "999px",
                background: "var(--color-background-tertiary, #f8fafc)",
                border: "1px solid var(--color-border-primary, #e2e8f0)",
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                {resourceLabel(key)}
              </span>
              <span style={{ fontSize: "0.78rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                {Math.floor(Number(value || 0)).toLocaleString()}
              </span>
            </div>
          )) : (
            <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
              Todavia no hay recursos persistentes acumulados.
            </div>
          )}
        </div>

        <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
          <span style={{ fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{expeditionLabel}.</span>{" "}
            {expeditionCta.helper}
        </div>
      </section>

      <section style={bandSectionStyle}>
        <div style={sectionCardStyle("var(--tone-warning, #f59e0b)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                Listo ahora
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Lo primero que conviene tocar
              </div>
            </div>
            <div style={chipStyle("var(--tone-warning, #f59e0b)")}>
              {claimableJobs.length > 0 ? `${claimableJobs.length} claims` : "Sin claims"}
            </div>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            {readyNowRows.map(row => (
              <div key={row.id} style={compactMetricCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{row.title}</div>
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                      {row.detail}
                    </div>
                  </div>
                  <span style={chipStyle("var(--tone-success, #10b981)")}>{row.chip}</span>
                </div>
                <div style={{ display: "flex", justifyContent: isMobileViewport ? "stretch" : "flex-end" }}>
                  <button onClick={row.action} style={{ ...actionButtonStyle({ primary: true }), ...mobileFullWidthButtonStyle }}>
                    {row.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={sectionCardStyle("var(--tone-info, #0369a1)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                Operacion en curso
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Lo que el Santuario esta cocinando
              </div>
            </div>
            <div style={chipStyle("var(--tone-info, #0369a1)")}>
              {runningJobs.length} activos
            </div>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            {runningOverviewRows.map(row => (
              <div key={row.id} style={compactMetricCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{row.title}</div>
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                      {row.detail}
                    </div>
                  </div>
                  <span style={chipStyle("var(--tone-info, #0369a1)")}>{row.chip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionCardStyle(nextStepTone.accent), borderTop: `3px solid ${nextStepTone.accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, display: "grid", gap: "6px" }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: nextStepTone.accent }}>
              {nextStep.eyebrow}
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "900" }}>{nextStep.title}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.5, maxWidth: "72ch" }}>
              {nextStep.body}
            </div>
          </div>
          <button
            onClick={nextStep.action}
            disabled={onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN}
            style={{
              ...stationButtonStyle({
                tone: nextStepTone.accent,
                surface: nextStepTone.surface,
                disabled: onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN,
              }),
              ...(isMobileViewport ? { width: "100%" } : null),
            }}
          >
            {nextStep.cta}
          </button>
        </div>
      </section>

      {infrastructureVisible && (
        <section style={sectionCardStyle("var(--tone-accent, #4338ca)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                Estaciones
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Accesos operativos del Santuario
              </div>
            </div>
            <button
              onClick={() => setShowDetailedInfrastructure(current => !current)}
              disabled={forceDetailedInfrastructure}
              style={actionButtonStyle({ primary: showDetailedInfrastructure || forceDetailedInfrastructure, disabled: forceDetailedInfrastructure })}
            >
              {showDetailedInfrastructure || forceDetailedInfrastructure ? "Detalle desplegado" : "Ver detalle"}
            </button>
          </div>

          <div style={stationOverviewGridStyle}>
            {stationOverviewRows.map(row => (
              <div key={row.id} style={compactMetricCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>{row.title}</div>
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                      {row.detail}
                    </div>
                  </div>
                  <span style={chipStyle(row.tone)}>{row.status}</span>
                </div>
                <div style={{ display: "flex", justifyContent: isMobileViewport ? "stretch" : "flex-end" }}>
                  <button
                    onClick={row.action || undefined}
                    disabled={!row.action}
                    style={{
                      ...stationButtonStyle({
                        tone: row.tone,
                        surface: "var(--color-background-secondary, #ffffff)",
                        disabled: !row.action,
                      }),
                      ...mobileFullWidthButtonStyle,
                    }}
                  >
                    {row.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {shouldShowClaimsSection && (
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

        <div style={{ display: "grid", gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
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
                <button
                  onClick={() => dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now })}
                  data-onboarding-target={
                    onboardingStep === ONBOARDING_STEPS.DISTILLERY_READY &&
                    job?.input?.researchId === "unlock_distillery"
                      ? "claim-distillery-research"
                      : undefined
                  }
                  style={actionButtonStyle({ primary: true })}
                >
                  Reclamar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {infrastructureVisible && (showDetailedInfrastructure || forceDetailedInfrastructure) && (
      <section style={detailedInfrastructureGridStyle}>
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

          <div style={compactStatsGridStyle}>
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
              onClick={() => (libraryStation.unlocked ? setShowLibrary(true) : openLaboratoryFromSanctuary("library-card"))}
              disabled={onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !libraryStation.unlocked}
              style={{
                ...stationButtonStyle({
                  tone: "var(--tone-accent, #4338ca)",
                  surface: "var(--tone-accent-soft, #eef2ff)",
                  disabled: onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !libraryStation.unlocked,
                }),
                ...mobileFullWidthButtonStyle,
              }}
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
              {distilleryUnlocked ? `${runningByStation.distillery || 0} / ${distillerySlots} ocupados` : "Bloqueada"}
            </div>
          </div>

          <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
            {distilleryUnlocked
              ? "Refina cargo persistente en tiempo real."
              : "Se activa desde el Laboratorio."}
          </div>

          <div style={compactStatsGridStyle}>
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
              onClick={() => handleTutorialStationOpen(
                onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
                  ? ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
                  : ONBOARDING_STEPS.DISTILLERY_READY,
                () => (distilleryUnlocked ? setShowDistillery(true) : openLaboratoryFromSanctuary("distillery-card"))
              )}
              disabled={onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !distilleryUnlocked}
              data-onboarding-target={
                spotlightDistilleryReady || onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
                  ? "open-distillery"
                  : undefined
              }
              style={{
                ...stationButtonStyle({
                  tone: "var(--tone-violet, #7c3aed)",
                  surface: "var(--tone-violet-soft, #f3e8ff)",
                  disabled: onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !distilleryUnlocked,
                }),
                ...mobileFullWidthButtonStyle,
                position:
                  spotlightDistilleryReady || onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
                    ? "relative"
                    : "static",
                zIndex:
                  spotlightDistilleryReady || onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
                    ? 2
                    : 1,
                boxShadow:
                  spotlightDistilleryReady || onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
                    ? "0 0 0 2px rgba(124,58,237,0.18), 0 12px 28px rgba(124,58,237,0.14)"
                    : "none",
                animation:
                  spotlightDistilleryReady || onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
                    ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite"
                    : "none",
              }}
            >
              {distilleryUnlocked ? "Abrir Destileria" : "Investigar en Laboratorio"}
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

          <div style={compactStatsGridStyle}>
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
              onClick={() => (errandStation.unlocked ? setShowErrands(true) : openLaboratoryFromSanctuary("errands-card"))}
              disabled={onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !errandStation.unlocked}
              style={{
                ...stationButtonStyle({
                  tone: "var(--tone-info, #0369a1)",
                  surface: "var(--tone-info-soft, #f0f9ff)",
                  disabled: onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !errandStation.unlocked,
                }),
                ...mobileFullWidthButtonStyle,
              }}
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

          <div style={compactStatsGridStyle}>
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
              onClick={() => (infusionStation.unlocked ? setShowSigilAltar(true) : openLaboratoryFromSanctuary("sigil-card"))}
              disabled={onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !infusionStation.unlocked}
              style={{
                ...stationButtonStyle({
                  tone: "var(--tone-success, #10b981)",
                  surface: "var(--tone-success-soft, #ecfdf5)",
                  disabled: onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !infusionStation.unlocked,
                }),
                ...mobileFullWidthButtonStyle,
              }}
            >
              {infusionStation.unlocked ? "Abrir Altar de Sigilos" : "Investigar en Laboratorio"}
            </button>
          </div>
        </div>
      </section>
      )}

      {infrastructureVisible && (showDetailedInfrastructure || forceDetailedInfrastructure) && (
      <section style={detailedInfrastructureGridStyle}>
        {blueprintDecisionUnlocked && (
        <div
          data-onboarding-target={spotlightBlueprintIntro ? "blueprint-stash" : undefined}
          onClick={() => acknowledgeTutorialStep(ONBOARDING_STEPS.BLUEPRINT_INTRO)}
          style={{
            ...sectionCardStyle("var(--tone-danger, #D85A30)"),
            position: spotlightBlueprintIntro ? "relative" : "static",
            zIndex: spotlightBlueprintIntro ? 2 : 1,
            boxShadow:
              spotlightBlueprintIntro
                ? "0 0 0 2px rgba(216,90,48,0.18), 0 12px 28px rgba(216,90,48,0.14)"
                : "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
            animation:
              spotlightBlueprintIntro
                ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite"
                : "none",
            cursor: spotlightBlueprintIntro ? "pointer" : "default",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
                Taller
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Stash, decisiones y proyectos rescatados
              </div>
            </div>
            <div style={chipStyle("var(--tone-danger, #D85A30)")}>
              {extractedItems.length} / {Number(sanctuary?.extractionUpgrades?.extractedItemSlots || 3)} slots
            </div>
          </div>

          {extractedItems.length === 0 ? (
            <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
              Extrae una pieza y luego decidí si guardarla como blueprint o romperla por cargas del Taller.
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
                      <div style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>Guardala como blueprint o desguazala para cargar el Taller.</div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", width: isMobileViewport ? "100%" : "auto" }}>
                        <button
                          disabled={
                            onboardingStep === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
                            (state?.onboarding?.flags?.blueprintConverted || item.id !== tutorialBlueprintItemId)
                          }
                          onClick={() => dispatch({ type: "CONVERT_EXTRACTED_ITEM_TO_BLUEPRINT", extractedItemId: item.id, now })}
                          data-onboarding-target={
                            onboardingStep === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
                            item.id === tutorialBlueprintItemId &&
                            !state?.onboarding?.flags?.blueprintConverted
                              ? "tutorial-blueprint-action"
                              : undefined
                          }
                          style={{
                            ...actionButtonStyle({
                              primary: !(
                                onboardingStep === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
                                (state?.onboarding?.flags?.blueprintConverted || item.id !== tutorialBlueprintItemId)
                              ),
                              disabled:
                                onboardingStep === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
                                (state?.onboarding?.flags?.blueprintConverted || item.id !== tutorialBlueprintItemId),
                            }),
                            ...(isMobileViewport ? { flex: "1 1 100%" } : null),
                          }}
                        >
                          Guardar como blueprint
                        </button>
                        <button
                          onClick={() => dispatch({ type: "START_SCRAP_EXTRACTED_ITEM_JOB", extractedItemId: item.id, now })}
                          data-onboarding-target={
                            onboardingStep === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
                            item.id === tutorialBlueprintItemId &&
                            !state?.onboarding?.flags?.blueprintScrapped
                              ? "tutorial-blueprint-action"
                              : undefined
                          }
                          disabled={
                            scrapBlocked ||
                            (onboardingStep === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
                              (state?.onboarding?.flags?.blueprintScrapped || item.id !== tutorialBlueprintItemId))
                          }
                          style={{
                            ...actionButtonStyle({
                              disabled:
                                scrapBlocked ||
                                (onboardingStep === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
                                  (state?.onboarding?.flags?.blueprintScrapped || item.id !== tutorialBlueprintItemId)),
                            }),
                            ...(isMobileViewport ? { flex: "1 1 100%" } : null),
                          }}
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
        )}
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
              {laboratoryUnlocked ? `${laboratoryRunningCount} / ${Math.max(1, Number(laboratoryStation.slots || 1))} jobs` : "Bloqueado"}
            </div>
          </div>

          <div style={{ fontSize: "0.69rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
            Desbloquea estaciones, slots y tiempos.
          </div>

          <div style={compactStatsGridStyle}>
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
                {laboratoryUnlocked ? "Si" : "No"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
              {laboratoryClaimableCount > 0 ? "Hay investigaciones listas." : "Gestiona la infraestructura del hub."}
            </div>
            <button
              onClick={() => openLaboratoryFromSanctuary("laboratory-card")}
              disabled={!laboratoryUnlocked}
              data-onboarding-target={onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN ? "open-laboratory" : undefined}
              style={{
                ...stationButtonStyle({
                  tone: "var(--tone-accent, #4338ca)",
                  surface: "var(--tone-accent-soft, #eef2ff)",
                  disabled: !laboratoryUnlocked,
                }),
                ...mobileFullWidthButtonStyle,
                position: onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN ? "relative" : "static",
                zIndex: onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN ? 2 : 1,
                boxShadow:
                  onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN
                    ? "0 0 0 2px rgba(83,74,183,0.18), 0 12px 28px rgba(83,74,183,0.14)"
                    : "none",
                animation:
                  onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN
                    ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite"
                    : "none",
              }}
            >
              {laboratoryUnlocked ? "Abrir Laboratorio" : "Se abre tras la primera extraccion"}
            </button>
          </div>
        </div>

        {blueprintDecisionUnlocked && (
        <div style={sectionCardStyle("var(--tone-danger, #D85A30)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
                Taller
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Blueprints, cargas y acabado persistente
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

          <div style={compactStatsGridStyle}>
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
              onClick={() => (deepForgeStation.unlocked ? setShowDeepForge(true) : openLaboratoryFromSanctuary("forge-card"))}
              disabled={
                !deepForgeStation.unlocked &&
                onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN
              }
              data-onboarding-target={onboardingStep === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE ? "open-deep-forge" : undefined}
              style={{
                ...stationButtonStyle({
                  tone: "var(--tone-danger, #D85A30)",
                  surface: "var(--tone-danger-soft, #fff1f2)",
                  disabled:
                    !deepForgeStation.unlocked &&
                    onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN,
                }),
                ...mobileFullWidthButtonStyle,
              }}
            >
              {deepForgeStation.unlocked ? "Abrir Taller" : "Investigar en Laboratorio"}
            </button>
          </div>
        </div>
        )}
      </section>
      )}

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
