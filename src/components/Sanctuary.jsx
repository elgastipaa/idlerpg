import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import OverlayShell from "./OverlayShell";
import { getRunSigil } from "../data/runSigils";
import { CLASSES } from "../data/classes";
import { getSanctuaryStationState } from "../engine/sanctuary/laboratoryEngine";
import {
  getEffectiveOnboardingStep,
  getOnboardingStepInteractionMode,
  getOnboardingTutorialDeepForgeProjectId,
  getOnboardingTutorialExtractedItemId,
  ONBOARDING_STEPS,
  isBlueprintDecisionUnlocked,
  isDistilleryUnlocked,
  isLaboratoryUnlocked,
} from "../engine/onboarding/onboardingEngine";

const DistilleryOverlay = lazy(() => import("./DistilleryOverlay"));
const EncargosOverlay = lazy(() => import("./EncargosOverlay"));
const BlueprintForgeOverlay = lazy(() => import("./BlueprintForgeOverlay"));
const SigilAltarOverlay = lazy(() => import("./SigilAltarOverlay"));
const BibliotecaOverlay = lazy(() => import("./BibliotecaOverlay"));
const LaboratoryOverlay = lazy(() => import("./LaboratoryOverlay"));

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

function OverlayLoadingFallback({ label, isMobile = false }) {
  return (
    <OverlayShell isMobile={isMobile}>
      <div style={{ width: "100%", maxWidth: "420px", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", background: "var(--color-background-secondary, #ffffff)", color: "var(--color-text-secondary, #64748b)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", padding: isMobile ? "18px 16px 20px" : "20px 22px", textAlign: "center", fontSize: "0.78rem", fontWeight: "900" }}>
        Cargando {label}...
      </div>
    </OverlayShell>
  );
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
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const isMobileViewport = viewportWidth < 768;
  const isNarrowViewport = viewportWidth < 420;
  const rawOnboardingStep = state?.onboarding?.step || null;
  const onboardingStep = getEffectiveOnboardingStep(rawOnboardingStep, {
    ...state,
    __liveNow: now,
  });

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
        if (rawOnboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY) {
          dispatch({ type: "CLOSE_LABORATORY" });
        }
      }
    };
    window.addEventListener("primary-tab-reselected", handler);
    return () => window.removeEventListener("primary-tab-reselected", handler);
  }, [dispatch, rawOnboardingStep]);

  useEffect(() => {
    const selectorByStep = {
      [ONBOARDING_STEPS.OPEN_LABORATORY]: '[data-onboarding-target="open-laboratory"]',
      [ONBOARDING_STEPS.OPEN_DISTILLERY]: '[data-onboarding-target="open-distillery"]',
      [ONBOARDING_STEPS.DISTILLERY_READY]: '[data-onboarding-target="open-laboratory"]',
    };
    const selector = selectorByStep[onboardingStep];
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
  }, [onboardingStep, showLaboratory]);

  const expeditionPhase = state.expedition?.phase || "sanctuary";
  const onboardingMode = getOnboardingStepInteractionMode(onboardingStep, {
    ...state,
    __liveNow: now,
  });
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
  const distilleryUnlocked = distilleryStation.unlocked || isDistilleryUnlocked(state);
  const blueprintDecisionUnlocked = isBlueprintDecisionUnlocked(state);
  const tutorialBlueprintItemId = getOnboardingTutorialExtractedItemId(state);
  const tutorialDeepForgeProjectId = getOnboardingTutorialDeepForgeProjectId(state);
  const infrastructureVisible = Boolean(
    state?.onboarding?.completed ||
    state?.onboarding?.flags?.firstExtractionCompleted ||
    onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN ||
    onboardingStep === ONBOARDING_STEPS.RESEARCH_DISTILLERY
  );
  const laboratoryCompleted = sanctuary?.laboratory?.completed || {};
  const abyssPortalUnlocked = Boolean(state?.abyss?.portalUnlocked);
  const tier25BossCleared = Boolean(state?.abyss?.tier25BossCleared);
  const showingSanctuaryIntro = !hasClass && onboardingStep === ONBOARDING_STEPS.EXPEDITION_INTRO;
  const choosingClass = !hasClass && onboardingStep === ONBOARDING_STEPS.CHOOSE_CLASS;
  const classSelectionRequested = !hasClass && (choosingClass || expeditionPhase === "setup");
  const spotlightBlueprintIntro =
    onboardingStep === ONBOARDING_STEPS.BLUEPRINT_INTRO && onboardingMode === "forced";
  const sanctuaryOnboardingLocked = [
    ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN,
    ONBOARDING_STEPS.OPEN_LABORATORY,
    ONBOARDING_STEPS.RESEARCH_DISTILLERY,
    ONBOARDING_STEPS.DISTILLERY_READY,
    ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
    ONBOARDING_STEPS.OPEN_DISTILLERY,
    ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
    ONBOARDING_STEPS.BLUEPRINT_INTRO,
    ONBOARDING_STEPS.BLUEPRINT_DECISION,
    ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION,
    ONBOARDING_STEPS.DEEP_FORGE_READY,
    ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE,
    ONBOARDING_STEPS.LIBRARY_READY,
    ONBOARDING_STEPS.ERRANDS_READY,
    ONBOARDING_STEPS.SIGIL_ALTAR_READY,
    ONBOARDING_STEPS.ABYSS_PORTAL_READY,
  ].includes(onboardingStep);
  useEffect(() => {
    if (onboardingStep !== ONBOARDING_STEPS.FIRST_DISTILLERY_JOB || !distilleryUnlocked) return;
    setShowLaboratory(false);
    setShowErrands(false);
    setShowDeepForge(false);
    setShowSigilAltar(false);
    setShowLibrary(false);
    setShowDistillery(true);
  }, [distilleryUnlocked, onboardingStep]);

  useEffect(() => {
    if (onboardingStep !== ONBOARDING_STEPS.FIRST_ECHOES) return;
    setShowDistillery(false);
    setShowLaboratory(false);
  }, [onboardingStep]);

  function scrollToClassSelection() {
    const element = document.getElementById("onboarding-class-selector");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  useEffect(() => {
    if (!classSelectionRequested) return undefined;

    let frameId = null;
    let timeoutId = null;
    let attempts = 0;

    const revealClassSelector = () => {
      const element = document.getElementById("onboarding-class-selector");
      if (!element) {
        attempts += 1;
        if (attempts < 8) {
          timeoutId = window.setTimeout(() => {
            frameId = window.requestAnimationFrame(revealClassSelector);
          }, 60);
        }
        return;
      }
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    frameId = window.requestAnimationFrame(revealClassSelector);
    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [classSelectionRequested]);

  function openLaboratoryFromSanctuary(source = "generic") {
    if (!laboratoryUnlocked) return;
    if (
      onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN &&
      source !== "laboratory-card"
    ) {
      return;
    }
    setShowLaboratory(true);
    if (onboardingStep === ONBOARDING_STEPS.OPEN_LABORATORY) {
      dispatch({ type: "OPEN_LABORATORY" });
    } else if (onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN) {
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
    if (onboardingStep !== stepId) return;
    if (stepId === ONBOARDING_STEPS.OPEN_DISTILLERY) {
      dispatch({ type: "OPEN_DISTILLERY" });
      return;
    }
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
  const hasRunningDistilleryResearch = jobs.some(
    job =>
      job?.station === "laboratory" &&
      job?.input?.researchId === "unlock_distillery" &&
      job?.status === "running" &&
      Number(job?.endsAt || 0) > now
  );
  const hasClaimableDistilleryResearch = jobs.some(
    job =>
      job?.station === "laboratory" &&
      job?.input?.researchId === "unlock_distillery" &&
      (
        job?.status === "claimable" ||
        (job?.status === "running" && Number(job?.endsAt || 0) <= now)
      )
  );

  function scrollToTarget(selector) {
    window.requestAnimationFrame(() => {
      const target = document.querySelector(selector);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function guideSanctuaryOnboardingStep(stepId = onboardingStep) {
    switch (stepId) {
      case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
        dispatch({ type: "ACK_ONBOARDING_STEP" });
        return;
      case ONBOARDING_STEPS.OPEN_LABORATORY:
        scrollToTarget('[data-onboarding-target="open-laboratory"]');
        return;
      case ONBOARDING_STEPS.RESEARCH_DISTILLERY:
        openLaboratoryFromSanctuary("header-cta");
        return;
      case ONBOARDING_STEPS.DISTILLERY_READY:
        if (hasClaimableDistilleryResearch || hasRunningDistilleryResearch || !distilleryUnlocked) {
          openLaboratoryFromSanctuary("header-cta");
          return;
        }
        dispatch({ type: "ACK_ONBOARDING_STEP" });
        return;
      case ONBOARDING_STEPS.OPEN_DISTILLERY:
        if (distilleryUnlocked) {
          setShowDistillery(true);
          dispatch({ type: "OPEN_DISTILLERY" });
          return;
        }
        openLaboratoryFromSanctuary("header-cta");
        return;
      case ONBOARDING_STEPS.FIRST_DISTILLERY_JOB:
        if (distilleryUnlocked) {
          setShowDistillery(true);
          return;
        }
        openLaboratoryFromSanctuary("header-cta");
        return;
      case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      case ONBOARDING_STEPS.BLUEPRINT_DECISION:
      case ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION:
      case ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE:
        if (deepForgeStation.unlocked) {
          setShowDeepForge(true);
          return;
        }
        openLaboratoryFromSanctuary("header-cta");
        return;
      case ONBOARDING_STEPS.DEEP_FORGE_READY:
      case ONBOARDING_STEPS.LIBRARY_READY:
      case ONBOARDING_STEPS.ERRANDS_READY:
      case ONBOARDING_STEPS.SIGIL_ALTAR_READY:
      case ONBOARDING_STEPS.ABYSS_PORTAL_READY:
        openLaboratoryFromSanctuary("header-cta");
        return;
      default:
        return;
    }
  }

  const expeditionCta = useMemo(() => {
    if (showingSanctuaryIntro) {
      return {
        label: "Iniciar expedicion",
        primary: true,
        action: () => dispatch({ type: "ACK_ONBOARDING_STEP" }),
        helper: "Toca este boton para aprender el primer gesto del juego. Luego eliges una clase y ahi si entras al combate.",
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN) {
      return {
        label: "Seguir",
        primary: true,
        action: () => dispatch({ type: "ACK_ONBOARDING_STEP" }),
        helper: "Primero ves rapido que el Santuario ahora existe como capa persistente. En el siguiente paso te hago abrir el Laboratorio real.",
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.OPEN_LABORATORY) {
      return {
        label: "Abrir Laboratorio",
        primary: true,
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.OPEN_LABORATORY),
        helper: "El Laboratorio es la puerta de entrada a la infraestructura. Toca el boton real resaltado y entrá.",
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.RESEARCH_DISTILLERY) {
      return {
        label: "Abrir Laboratorio",
        primary: true,
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.RESEARCH_DISTILLERY),
        helper: "La expedicion ya cerro. El siguiente paso del tutorial es investigar la Destileria desde el Laboratorio.",
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.DISTILLERY_READY) {
      return {
        label: hasClaimableDistilleryResearch || hasRunningDistilleryResearch || !distilleryUnlocked
          ? "Abrir Laboratorio"
          : "Seguir",
        primary: true,
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.DISTILLERY_READY),
        helper: hasClaimableDistilleryResearch || hasRunningDistilleryResearch || !distilleryUnlocked
          ? "La expedicion sigue bloqueada por el tutorial hasta terminar de abrir la Destileria desde el Laboratorio."
          : "La investigacion ya esta cerrada. Sigue y en el proximo beat te hago abrir la Destileria real.",
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY) {
      return {
        label: "Volver al Santuario",
        primary: true,
        action: () => setShowLaboratory(false),
        helper: "Cierra el Laboratorio desde su boton real. El siguiente paso ya ocurre en el hub del Santuario.",
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY) {
      return {
        label: "Abrir Destileria",
        primary: true,
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.OPEN_DISTILLERY),
        helper: "La estacion ya esta lista. Toca el boton real resaltado para abrirla.",
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) {
      return {
        label: "Abrir Destileria",
        primary: true,
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.FIRST_DISTILLERY_JOB),
        helper: "Todavia no toca otra expedicion. Primero manda a destilar un bundle real para cerrar el loop basico del Santuario.",
      };
    }
    if (sanctuaryOnboardingLocked) {
      return {
        label: "Seguir tutorial",
        primary: true,
        action: () => guideSanctuaryOnboardingStep(onboardingStep),
        helper: "Hay un paso obligatorio del Santuario activo. Mientras no lo cierres, el juego no va a dejar iniciar una nueva expedicion.",
      };
    }
    if (!hasClass) {
      if (!classSelectionRequested) {
        return {
          label: "Iniciar expedicion",
          primary: true,
          action: () => dispatch({ type: "ENTER_EXPEDITION_SETUP" }),
          helper: "Primero abre la salida. Cuando empieces a preparar la expedicion, ahi recien eliges la clase de esta run.",
        };
      }
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
  }, [
    deepForgeStation.unlocked,
    dispatch,
    distilleryUnlocked,
    expeditionPhase,
    hasClass,
    hasClaimableDistilleryResearch,
    hasRunningDistilleryResearch,
    laboratoryUnlocked,
    onboardingStep,
    sanctuaryOnboardingLocked,
    showingSanctuaryIntro,
    state.combat?.pendingRunSetup,
    classSelectionRequested,
  ]);

  const expeditionLabel = hasClass
    ? `${state.player.class}${hasSpec ? ` · ${state.player.specialization}` : ""}`
    : "Sin heroe asignado";

  const noClassContent = (
    <div style={{ padding: "12px", display: "grid", gap: "12px" }}>
      <section style={sectionCardStyle("var(--tone-accent, #4338ca)")}>
        <div style={{ display: "grid", gap: "6px" }}>
          <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
            Santuario
          </div>
          <div style={{ fontSize: "1rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
            {showingSanctuaryIntro
              ? "Inicia tu primera expedicion desde aqui"
              : classSelectionRequested
                ? "Elige una clase para esta expedicion"
                : "La clase se define al iniciar expedicion"}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
            {showingSanctuaryIntro
              ? "El Santuario es tu base. Primero aprendes a salir desde aqui; recien despues eliges una clase y entras al combate."
              : classSelectionRequested
                ? "La salida ya esta en preparacion. Elige Warrior o Mage para darle identidad a esta run antes de seguir."
                : "La clase ya no se elige de antemano. Primero inicia la expedicion y recien ahi decides con que arquetipo sales."}
          </div>
          {(showingSanctuaryIntro || !classSelectionRequested) && (
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

      {showingSanctuaryIntro || !classSelectionRequested ? (
        <div style={{ padding: "12px", display: "grid", gap: "12px" }}>
          <section style={sectionCardStyle("var(--tone-info, #0369a1)")}>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
              {showingSanctuaryIntro ? "Primera run" : "Preparar salida"}
            </div>
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                {showingSanctuaryIntro ? "Primero sal desde el Santuario." : "La clase se elige al preparar la expedicion."}
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                {showingSanctuaryIntro
                  ? <>Toca <strong>Iniciar expedicion</strong>. En el siguiente paso elegirás una clase para esa salida y, recien ahi, entrarás al combate para arrancar la run.</>
                  : <>Toca <strong>Iniciar expedicion</strong>. Cuando se abra la preparacion de la salida, ahi recien vas a elegir la clase de esta run.</>}
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)" }}>
                Usa el boton real resaltado arriba, no este panel.
              </div>
            </div>
          </section>
        </div>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: choosingClass
                ? "repeat(2, minmax(0, 1fr))"
                : isMobileViewport
                  ? "1fr"
                  : "repeat(2, minmax(0, 1fr))",
              gap: isNarrowViewport ? "8px" : "10px",
            }}
          >
            {CLASSES.map(clase => (
              <button
                key={clase.id}
                onClick={() => dispatch({ type: "SELECT_CLASS", classId: clase.id })}
                data-onboarding-target={choosingClass ? "choose-class" : undefined}
                style={{
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  background: "var(--color-background-secondary, #ffffff)",
                  borderRadius: "14px",
                  padding: choosingClass && isNarrowViewport ? "10px" : "14px",
                  display: "grid",
                  gap: choosingClass && isNarrowViewport ? "6px" : "8px",
                  textAlign: "left",
                  cursor: "pointer",
                  position: "relative",
                  zIndex: choosingClass ? 2 : 1,
                  boxShadow: choosingClass
                    ? "0 0 0 2px rgba(3,105,161,0.22), 0 0 0 8px rgba(3,105,161,0.08), 0 16px 36px rgba(3,105,161,0.22)"
                    : "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
                  animation: choosingClass ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite" : "none",
                  transform: choosingClass ? "translateY(-1px)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ fontSize: choosingClass && isNarrowViewport ? "1.1rem" : "1.4rem", lineHeight: 1 }}>{clase.icon || "?"}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: choosingClass && isNarrowViewport ? "0.8rem" : "0.92rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{clase.name}</div>
                    <div style={{ fontSize: choosingClass && isNarrowViewport ? "0.56rem" : "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {clase.playstyle || "Clase"}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: choosingClass && isNarrowViewport ? "0.64rem" : "0.72rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.4 }}>
                  {clase.description}
                </div>
                <div style={{ fontSize: choosingClass && isNarrowViewport ? "0.6rem" : "0.66rem", color: "var(--tone-accent, #4338ca)", fontWeight: "900" }}>
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
    if (onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN) {
      return {
        tone: "accent",
        eyebrow: "Primer retorno",
        title: "Abre el Laboratorio para encender el Santuario",
        body: "La primera extraccion no termina el loop: lo abre. Usa el boton real del Laboratorio y recien despues volveras a poder preparar otra expedicion.",
        cta: "Ir al Laboratorio",
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN),
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.RESEARCH_DISTILLERY) {
      return {
        tone: "accent",
        eyebrow: "Infraestructura",
        title: "Investiga la Destileria desde el Laboratorio",
        body: "Ese research convierte la primera extraccion en progreso persistente real. Hasta que no lo hagas, el tutorial no te va a soltar de este paso.",
        cta: "Abrir Laboratorio",
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.RESEARCH_DISTILLERY),
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.DISTILLERY_READY) {
      return {
        tone: "accent",
        eyebrow: "Estacion nueva",
        title: hasClaimableDistilleryResearch || hasRunningDistilleryResearch || !distilleryUnlocked
          ? "Termina de habilitar la Destileria"
          : "Abre la Destileria",
        body: hasClaimableDistilleryResearch || hasRunningDistilleryResearch || !distilleryUnlocked
          ? "La expedicion sigue frenada hasta cerrar este unlock. Entra al Laboratorio, reclama si hace falta y termina de abrir la estacion."
          : "La estacion ya esta viva. Abrela y prepara la primera destilacion antes de volver a salir.",
        cta: hasClaimableDistilleryResearch || hasRunningDistilleryResearch || !distilleryUnlocked
          ? "Abrir Laboratorio"
          : "Seguir",
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.DISTILLERY_READY),
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY) {
      return {
        tone: "accent",
        eyebrow: "Cierre de overlay",
        title: "Vuelve al Santuario",
        body: "Ya reclamaste la investigacion. Cierra el Laboratorio desde su boton real y despues abrimos la Destileria desde el hub.",
        cta: "Cerrar Laboratorio",
        action: () => setShowLaboratory(false),
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY) {
      return {
        tone: "accent",
        eyebrow: "Estacion nueva",
        title: "Abre la Destileria",
        body: "La estacion ya existe. Abrela para ver el primer bundle tutorial y cerrar este tramo del Santuario.",
        cta: "Abrir Destileria",
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.OPEN_DISTILLERY),
      };
    }
    if (onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) {
      return {
        tone: "accent",
        eyebrow: "Primer job",
        title: "Lanza tu primera destilacion",
        body: "El tutorial te mantiene en el Santuario hasta que pongas a trabajar un bundle real. Haz ese click y despues ya vuelves al frente.",
        cta: "Abrir Destileria",
        action: () => guideSanctuaryOnboardingStep(ONBOARDING_STEPS.FIRST_DISTILLERY_JOB),
      };
    }
    if (sanctuaryOnboardingLocked) {
      return {
        tone: "accent",
        eyebrow: "Paso guiado",
        title: "Completa el paso actual del Santuario",
        body: "Hay un beat obligatorio del hub en curso. Mientras siga activo, el juego no va a dejar iniciar otra expedicion aunque el boton aparezca en otros contextos.",
        cta: "Seguir tutorial",
        action: () => guideSanctuaryOnboardingStep(onboardingStep),
      };
    }
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
    hasClaimableDistilleryResearch,
    hasRunningDistilleryResearch,
    sanctuaryOnboardingLocked,
  ]);
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
  const blockedResourceRows = useMemo(() => {
    const rows = [];
    if (distilleryUnlocked && totalCargoQuantity <= 0) {
      rows.push({
        id: "distillery-empty",
        title: "Destileria",
        detail: "Sin bundles para procesar.",
        chip: "Sin cargo",
      });
    }
    if (libraryStation.unlocked && Math.max(0, Number(resources?.codexInk || 0)) <= 0) {
      rows.push({
        id: "library-no-ink",
        title: "Biblioteca",
        detail: "No hay tinta para activar otro hito.",
        chip: "Sin tinta",
      });
    }
    if (infusionStation.unlocked && Math.max(0, Number(resources?.sigilFlux || 0)) <= 0) {
      rows.push({
        id: "sigil-no-flux",
        title: "Altar de Sigilos",
        detail: "Falta flux para otra infusion.",
        chip: "Sin flux",
      });
    }
    if (blueprintDecisionUnlocked && deepForgeStation.unlocked && blueprintCount <= 0 && extractedItems.length <= 0) {
      rows.push({
        id: "forge-no-input",
        title: "Taller",
        detail: "Sin blueprints ni piezas rescatadas para trabajar.",
        chip: "Sin base",
      });
    }
    if (rows.length > 0) return rows.slice(0, 3);
    return [{
      id: "no-blockers",
      title: "Sin bloqueos fuertes",
      detail: "El cuello de botella visible ahora no es un recurso del Santuario.",
      chip: "OK",
    }];
  }, [
    blueprintCount,
    blueprintDecisionUnlocked,
    deepForgeStation.unlocked,
    distilleryUnlocked,
    extractedItems.length,
    infusionStation.unlocked,
    libraryStation.unlocked,
    resources?.codexInk,
    resources?.sigilFlux,
    totalCargoQuantity,
  ]);
  const primaryBlockedRow = blockedResourceRows[0]?.id === "no-blockers"
    ? null
    : blockedResourceRows[0] || null;

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
      detail: `${laboratoryClaimableCount} disponible(s).`,
      tone: "var(--tone-accent, #4338ca)",
      actionLabel: laboratoryUnlocked ? "Abrir" : "Cerrado",
      action: laboratoryUnlocked ? () => openLaboratoryFromSanctuary("overview-laboratory") : null,
    },
    {
      id: "distillery",
      title: "Destileria",
      status: distilleryUnlocked ? `${runningByStation.distillery || 0}/${distillerySlots}` : "Bloqueada",
      detail: `${totalCargoQuantity} bundle(s).`,
      tone: "var(--tone-violet, #7c3aed)",
      actionLabel: distilleryUnlocked ? "Abrir" : "Laboratorio",
      action: () => (distilleryUnlocked ? setShowDistillery(true) : openLaboratoryFromSanctuary("overview-distillery")),
    },
    {
      id: "library",
      title: "Biblioteca",
      status: libraryStation.unlocked ? `${runningLibraryJobs.length}/${librarySlots}` : "Bloqueada",
      detail: `${claimableLibraryJobs.length} disponible(s).`,
      tone: "var(--tone-accent, #4338ca)",
      actionLabel: libraryStation.unlocked ? "Abrir" : "Laboratorio",
      action: () => (libraryStation.unlocked ? setShowLibrary(true) : openLaboratoryFromSanctuary("overview-library")),
    },
    {
      id: "errands",
      title: "Encargos",
      status: errandStation.unlocked ? `${runningErrandJobs.length}/${errandSlots}` : "Bloqueados",
      detail: `${Math.max(0, errandSlots - runningErrandJobs.length)} equipo(s) libre(s).`,
      tone: "var(--tone-info, #0369a1)",
      actionLabel: errandStation.unlocked ? "Abrir" : "Laboratorio",
      action: () => (errandStation.unlocked ? setShowErrands(true) : openLaboratoryFromSanctuary("overview-errands")),
    },
    {
      id: "sigils",
      title: "Altar de Sigilos",
      status: infusionStation.unlocked ? `${runningByStation.sigilInfusion || 0}/${infusionSlots}` : "Bloqueado",
      detail: `${Object.values(sigilInfusions).reduce((total, entry) => total + Math.max(0, Number(entry?.charges || 0)), 0)} disponible(s).`,
      tone: "var(--tone-success, #10b981)",
      actionLabel: infusionStation.unlocked ? "Abrir" : "Laboratorio",
      action: () => (infusionStation.unlocked ? setShowSigilAltar(true) : openLaboratoryFromSanctuary("overview-sigil")),
    },
    ...(blueprintDecisionUnlocked
      ? [{
          id: "deepforge",
          title: "Taller",
          status: deepForgeStation.unlocked ? `${runningByStation.deepForge || 0}/${deepForgeSlots}` : "Bloqueada",
          detail: `${blueprintCount} plano(s).`,
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
  const resourceSummaryRows = useMemo(
    () => Object.entries(resources)
      .filter(([, value]) => Math.floor(Number(value || 0)) > 0)
      .sort((left, right) => Number(right[1] || 0) - Number(left[1] || 0)),
    [resources]
  );
  const topCardPadding = isMobileViewport ? "12px" : "16px";
  const compactMetricCard = {
    ...metricCardStyle(),
    padding: isMobileViewport ? "8px 10px" : "10px 12px",
    gap: isMobileViewport ? "2px" : "4px",
  };
  const stationOverviewGridStyle = {
    display: "grid",
    gridTemplateColumns: isNarrowViewport ? "1fr" : isMobileViewport ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "8px",
  };
  const bandSectionStyle = {
    display: "grid",
    gridTemplateColumns: isMobileViewport ? "1fr" : "repeat(3, minmax(0, 1fr))",
    gap: "0.9rem",
  };
  const mobileFullWidthButtonStyle = isMobileViewport ? { width: "100%", justifyContent: "center" } : null;

  if (!hasClass && (!infrastructureVisible || classSelectionRequested)) {
    return noClassContent;
  }

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
              Santuario operativo
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.4 }}>
              Recursos persistentes listos para sostener la siguiente salida.
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", width: isMobileViewport ? "100%" : "auto", justifyContent: isMobileViewport ? "flex-end" : "flex-end" }}>
            {!sanctuaryOnboardingLocked && (
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
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {resourceSummaryRows.length > 0 ? resourceSummaryRows.slice(0, 3).map(([key, value]) => (
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
              Todavia no acumulaste recursos persistentes.
            </div>
          )}
        </div>
      </section>

      <section style={bandSectionStyle}>
        <div style={sectionCardStyle("var(--tone-warning, #f59e0b)")}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                Listo ahora
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: "900", marginTop: "4px" }}>Claims y acciones inmediatas</div>
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
                Corriendo
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: "900", marginTop: "4px" }}>Trabajos activos</div>
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

      {infrastructureVisible && (
        <section style={sectionCardStyle("var(--tone-accent, #4338ca)")}>
          <div>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                Estaciones
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
                Accesos operativos del Santuario
              </div>
            </div>
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

      {false && (
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
              onClick={() => {
                const openAction = () => (distilleryUnlocked ? setShowDistillery(true) : openLaboratoryFromSanctuary("distillery-card"));
                if (onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY) {
                  handleTutorialStationOpen(ONBOARDING_STEPS.OPEN_DISTILLERY, openAction);
                  return;
                }
                if (onboardingStep === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) {
                  handleTutorialStationOpen(ONBOARDING_STEPS.FIRST_DISTILLERY_JOB, openAction);
                  return;
                }
                openAction();
              }}
              disabled={onboardingStep === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN && !distilleryUnlocked}
              data-onboarding-target={
                onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY
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
                  onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY
                    ? "relative"
                    : "static",
                zIndex:
                  onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY
                    ? 2
                    : 1,
                boxShadow:
                  onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY
                    ? "0 0 0 2px rgba(124,58,237,0.18), 0 12px 28px rgba(124,58,237,0.14)"
                    : "none",
                animation:
                  onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY
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

      {false && (
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
              data-onboarding-target={
                onboardingStep === ONBOARDING_STEPS.OPEN_LABORATORY
                  ? "open-laboratory"
                  : undefined
              }
              style={{
                ...stationButtonStyle({
                  tone: "var(--tone-accent, #4338ca)",
                  surface: "var(--tone-accent-soft, #eef2ff)",
                  disabled: !laboratoryUnlocked,
                }),
                ...mobileFullWidthButtonStyle,
                position:
                  onboardingStep === ONBOARDING_STEPS.OPEN_LABORATORY
                    ? "relative"
                    : "static",
                zIndex:
                  onboardingStep === ONBOARDING_STEPS.OPEN_LABORATORY
                    ? 2
                    : 1,
                boxShadow:
                  onboardingStep === ONBOARDING_STEPS.OPEN_LABORATORY
                    ? "0 0 0 2px rgba(83,74,183,0.18), 0 12px 28px rgba(83,74,183,0.14)"
                    : "none",
                animation:
                  onboardingStep === ONBOARDING_STEPS.OPEN_LABORATORY
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
        <Suspense fallback={<OverlayLoadingFallback label="Destileria" isMobile={isMobileViewport} />}>
          <DistilleryOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            onClose={() => setShowDistillery(false)}
          />
        </Suspense>
      )}
      {showErrands && (
        <Suspense fallback={<OverlayLoadingFallback label="Encargos" isMobile={isMobileViewport} />}>
          <EncargosOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            onClose={() => setShowErrands(false)}
          />
        </Suspense>
      )}
      {showDeepForge && (
        <Suspense fallback={<OverlayLoadingFallback label="Taller" isMobile={isMobileViewport} />}>
          <BlueprintForgeOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            onClose={() => setShowDeepForge(false)}
          />
        </Suspense>
      )}
      {showSigilAltar && (
        <Suspense fallback={<OverlayLoadingFallback label="Altar de Sigilos" isMobile={isMobileViewport} />}>
          <SigilAltarOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            onClose={() => setShowSigilAltar(false)}
          />
        </Suspense>
      )}
      {showLibrary && (
        <Suspense fallback={<OverlayLoadingFallback label="Biblioteca" isMobile={isMobileViewport} />}>
          <BibliotecaOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            onClose={() => setShowLibrary(false)}
          />
        </Suspense>
      )}
      {showLaboratory && (
        <Suspense fallback={<OverlayLoadingFallback label="Laboratorio" isMobile={isMobileViewport} />}>
          <LaboratoryOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            onClose={() => setShowLaboratory(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
