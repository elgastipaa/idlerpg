import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import ActionToast from "./ActionToast";
import ForgeIcon from "./icons/ForgeIcon";
import { FlButton, FlHeroModule, FlJobRow, FlPanel, FlPanelHeader, FlRelicRow, FlStationCard } from "./ui/forge";
import useRelativeNow from "../hooks/useRelativeNow";
import useViewport from "../hooks/useViewport";
import { getRunSigil } from "../data/runSigils";
import { getSanctuaryStationState } from "../engine/sanctuary/laboratoryEngine";
import {
  calculateRelicEntropyStabilizePlan,
} from "../engine/sanctuary/relicArmoryEngine";
import {
  getEffectiveOnboardingStep,
  ONBOARDING_STEPS,
  isBlueprintDecisionUnlocked,
  isDistilleryUnlocked,
  isLaboratoryUnlocked,
} from "../engine/onboarding/onboardingEngine";

const loadDistilleryOverlay = () => import("./DistilleryOverlay");
const DistilleryOverlay = lazy(loadDistilleryOverlay);
const EncargosOverlay = lazy(() => import("./EncargosOverlay"));
const SanctuaryForgeOverlay = lazy(() => import("./SanctuaryForgeOverlay"));
const SigilAltarOverlay = lazy(() => import("./SigilAltarOverlay"));
const BibliotecaOverlay = lazy(() => import("./BibliotecaOverlay"));
const LaboratoryOverlay = lazy(() => import("./LaboratoryOverlay"));
const SanctuaryClassSelector = lazy(() => import("./SanctuaryClassSelector"));

const STATION_VIEWS = {
  DISTILLERY: "distillery",
  ERRANDS: "errands",
  FORGE: "forge",
  SIGILS: "sigils",
  LIBRARY: "library",
  LABORATORY: "laboratory",
};

// Visual-only Stitch/Sanctuary skin. Flip to false to restore the previous hub skin.
const SANCTUARY_STITCH_VISUAL_TRIAL = false;
// Keeps the visual direction but avoids expensive blur/shimmer/mask effects.
const SANCTUARY_STITCH_PERF_SAFE = true;

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
  if (job.type === "imbue_item") return `Imbuir · ${job.input?.itemName || "Item"}`;
  if (job.type === "codex_research") return `Biblioteca · ${job.input?.label || "Investigacion"}`;
  if (job.type === "laboratory_research") return `Laboratorio · ${job.input?.label || "Infraestructura"}`;
  if (job.type === "forge_project" || job.type === "forge_master_project") return "Forja legado";
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
  if (job.type === "imbue_item") {
    return "Timer de Imbuir activo: cuando termina, reclamas y la pieza pasa a legendaria.";
  }
  if (job.type === "codex_research") {
    return job.output?.summary || "Activa un nuevo hito de la Biblioteca con tinta y tiempo real.";
  }
  if (job.type === "laboratory_research") {
    return job.output?.summary || "Mejora la infraestructura del Santuario con investigación persistente.";
  }
  if (job.type === "forge_project" || job.type === "forge_master_project") {
    return "Trabajo heredado de la forja anterior. Se mantiene por compatibilidad de saves.";
  }
  return "Trabajo persistente del Santuario.";
}

function sortJobsByEnding(left = {}, right = {}) {
  return Number(left?.endsAt || 0) - Number(right?.endsAt || 0);
}

function getJobProgressFraction(job = {}, nowAt = Date.now()) {
  const startedAt = Number(job?.startedAt || 0);
  const endsAt = Number(job?.endsAt || 0);
  if (startedAt <= 0 || endsAt <= startedAt) return 0;
  return Math.max(0, Math.min(1, (Number(nowAt || Date.now()) - startedAt) / (endsAt - startedAt)));
}

const SANCTUARY_JOB_ICONS = {
  distillery: "distillery",
  errands: "mail",
  sigilInfusion: "sigilAltar",
  codexResearch: "library",
  deepForge: "anvil",
  laboratory: "laboratory",
};

function getSanctuaryWorkIcon(row = {}) {
  return SANCTUARY_JOB_ICONS[row.station] || (row.kind === "claimable" ? "claim" : "repeat");
}

export default function Sanctuary({ state, dispatch }) {
  const now = useRelativeNow();
  const [actionToast, setActionToast] = useState(null);
  const [activeStationView, setActiveStationView] = useState(null);
  const [pendingRelicExtractId, setPendingRelicExtractId] = useState(null);
  const sanctuaryRootRef = useRef(null);
  const { viewportWidth } = useViewport();
  const isMobileViewport = viewportWidth < 768;
  const isNarrowViewport = viewportWidth < 420;
  const rawOnboardingStep = state?.onboarding?.step || null;
  const onboardingStep = getEffectiveOnboardingStep(rawOnboardingStep, {
    ...state,
    __liveNow: now,
  });

  const hasStationViewOpen = activeStationView !== null;

  function closeStationView() {
    setActiveStationView(null);
  }

  function openStationView(viewId) {
    setActiveStationView(viewId);
  }

  useEffect(() => {
    if (
      activeStationView === STATION_VIEWS.DISTILLERY ||
      [
        ONBOARDING_STEPS.DISTILLERY_READY,
        ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
        ONBOARDING_STEPS.OPEN_DISTILLERY,
        ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
      ].includes(onboardingStep)
    ) {
      loadDistilleryOverlay();
    }
  }, [activeStationView, onboardingStep]);

  useEffect(() => {
    if (!actionToast?.id) return undefined;
    const id = window.setTimeout(() => setActionToast(null), 1700);
    return () => window.clearTimeout(id);
  }, [actionToast?.id]);

  useEffect(() => {
    if (!activeStationView) return;
    const frameId = window.requestAnimationFrame(() => {
      sanctuaryRootRef.current?.scrollIntoView?.({ behavior: "auto", block: "start" });
      window.scrollTo?.({ top: 0, behavior: "auto" });
      document.querySelector("main")?.scrollTo?.({ top: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [activeStationView]);

  useEffect(() => {
    const handler = event => {
      if (event?.detail?.tab === "sanctuary") {
        closeStationView();
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
    let timeoutId = null;
    let attempts = 0;

    const isVisibleTarget = node => {
      if (!(node instanceof HTMLElement)) return false;
      const rect = node.getBoundingClientRect();
      if (!(rect.width > 0 && rect.height > 0)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return false;
      if (Number(style.opacity || 1) <= 0) return false;
      return true;
    };

    const scrollToTarget = () => {
      const target = [...document.querySelectorAll(selector)].find(isVisibleTarget);
      if (!(target instanceof HTMLElement)) {
        attempts += 1;
        if (attempts < 10) {
          timeoutId = window.setTimeout(() => {
            frameId = window.requestAnimationFrame(scrollToTarget);
          }, 90);
        }
        return;
      }

      const topSafe = isMobileViewport ? 124 : 112;
      const bottomSafe = isMobileViewport ? 96 : 28;
      const visibleBottom = Math.max(topSafe + 48, window.innerHeight - bottomSafe);
      const behavior = attempts === 0 ? "auto" : "smooth";

      target.scrollIntoView({
        block: isMobileViewport ? "center" : "start",
        inline: "nearest",
        behavior,
      });

      const rect = target.getBoundingClientRect();
      if (rect.top < topSafe) {
        window.scrollBy({
          top: rect.top - topSafe - 10,
          behavior,
        });
      } else if (rect.bottom > visibleBottom) {
        window.scrollBy({
          top: rect.bottom - visibleBottom + 10,
          behavior,
        });
      }

      attempts += 1;
      if (attempts < 5) {
        timeoutId = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(scrollToTarget);
        }, 90);
      }
    };

    frameId = requestAnimationFrame(scrollToTarget);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [isMobileViewport, onboardingStep, activeStationView]);

  const expeditionPhase = state.expedition?.phase || "sanctuary";
  const hasClass = Boolean(state.player?.class);
  const sanctuary = state.sanctuary || {};
  const extractedItems = Array.isArray(sanctuary?.extractedItems) ? sanctuary.extractedItems : [];
  const stashProjects = Array.isArray(sanctuary?.stash) ? sanctuary.stash : [];
  const relicArmory = Array.isArray(sanctuary?.relicArmory) ? sanctuary.relicArmory : [];
  const extractedStashCount = Number(extractedItems.length || 0);
  const projectCount = Number(stashProjects.length || 0);
  const relicCount = Number(relicArmory.length || 0);
  const cargoInventory = Array.isArray(sanctuary?.cargoInventory) ? sanctuary.cargoInventory : [];
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const resources = sanctuary?.resources || {};
  const activeRelics = sanctuary?.activeRelics || {};
  const sigilInfusions = sanctuary?.sigilInfusions || {};
  const distillerySlots = Number(sanctuary?.stations?.distillery?.slots || 1);
  const errandSlots = Number(sanctuary?.stations?.errands?.slots || 2);
  const infusionSlots = Number(sanctuary?.stations?.sigilInfusion?.slots || 1);
  const librarySlots = Number(sanctuary?.stations?.codexResearch?.slots || 1);
  const relicArmorySlots = Math.max(1, Number(sanctuary?.extractionUpgrades?.relicSlots || 4));
  const sortedRelicArmory = useMemo(
    () => [...relicArmory].sort((left, right) => Number(right?.rating || 0) - Number(left?.rating || 0)),
    [relicArmory]
  );
  const distilleryStation = getSanctuaryStationState(sanctuary, "distillery");
  const libraryStation = getSanctuaryStationState(sanctuary, "codexResearch");
  const errandStation = getSanctuaryStationState(sanctuary, "errands");
  const infusionStation = getSanctuaryStationState(sanctuary, "sigilInfusion");
  const deepForgeStation = getSanctuaryStationState(sanctuary, "deepForge");
  const laboratoryStation = getSanctuaryStationState(sanctuary, "laboratory");
  const laboratoryUnlocked = laboratoryStation.unlocked || isLaboratoryUnlocked(state);
  const distilleryUnlocked = distilleryStation.unlocked || isDistilleryUnlocked(state);
  const blueprintDecisionUnlocked = isBlueprintDecisionUnlocked(state);
  useEffect(() => {
    if (!sanctuary?.pendingOpenForgeOverlay) return;
    openStationView(STATION_VIEWS.FORGE);
    dispatch({ type: "ACK_OPEN_SANCTUARY_FORGE" });
  }, [dispatch, sanctuary?.pendingOpenForgeOverlay]);
  useEffect(() => {
    if (!state?.combat?.reforgeSession) return;
    openStationView(STATION_VIEWS.FORGE);
  }, [state?.combat?.reforgeSession]);
  useEffect(() => {
    if (!pendingRelicExtractId) return undefined;
    if (!relicArmory.some(relic => relic?.id === pendingRelicExtractId)) {
      setPendingRelicExtractId(null);
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setPendingRelicExtractId(current => (current === pendingRelicExtractId ? null : current));
    }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [pendingRelicExtractId, relicArmory]);
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
    openStationView(STATION_VIEWS.DISTILLERY);
  }, [distilleryUnlocked, onboardingStep]);

  useEffect(() => {
    if (onboardingStep !== ONBOARDING_STEPS.FIRST_ECHOES) return;
    closeStationView();
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
        if (attempts < 16) {
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
    openStationView(STATION_VIEWS.LABORATORY);
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
    () => jobs.filter(job => job?.status === "claimable").sort(sortJobsByEnding),
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

  function getRepeatActionForSanctuaryJob(job, nowAt = Date.now()) {
    if (!job) return null;
    if (job.type === "distill_bundle" && job.input?.cargoId) {
      return { type: "START_DISTILLERY_JOB", cargoId: job.input.cargoId, now: nowAt + 1 };
    }
    if (job.type === "sanctuary_errand" && job.input?.errandId) {
      return {
        type: "START_SANCTUARY_ERRAND",
        errandId: job.input.errandId,
        durationId: job.input.durationId || "short",
        now: nowAt + 1,
      };
    }
    if (job.type === "infuse_sigil") {
      return {
        type: "START_SIGIL_INFUSION",
        sigilId: job.input?.sigilId || job.output?.sigilId || "free",
        now: nowAt + 1,
      };
    }
    if (job.type === "codex_research" && job.input?.researchType && job.input?.targetId) {
      return {
        type: "START_CODEX_RESEARCH",
        researchType: job.input.researchType,
        targetId: job.input.targetId,
        now: nowAt + 1,
      };
    }
    return null;
  }

  function canRepeatSanctuaryJob(job) {
    return Boolean(getRepeatActionForSanctuaryJob(job, now));
  }

  function claimSanctuaryJob(job, { repeat = false, nowAt = Date.now() } = {}) {
    if (!job?.id) return false;
    dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: job.id, now: nowAt });
    if (!repeat) return false;
    const repeatAction = getRepeatActionForSanctuaryJob(job, nowAt);
    if (repeatAction) {
      dispatch(repeatAction);
      return true;
    }
    return false;
  }

  function claimAllSanctuaryJobs(jobList = [], { repeat = false } = {}) {
    if (!Array.isArray(jobList) || jobList.length <= 0) return;
    const claimAt = Date.now();
    let restartedCount = 0;
    jobList.forEach((job, index) => {
      const restarted = claimSanctuaryJob(job, { repeat, nowAt: claimAt + (index * 2) });
      if (restarted) restartedCount += 1;
    });
    setActionToast({
      id: Date.now(),
      tone: repeat ? "info" : "success",
      message: repeat
        ? `Reclamaste ${jobList.length} y relanzaste ${restartedCount}.`
        : `Reclamaste ${jobList.length} trabajos del Santuario.`,
    });
  }

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
          openStationView(STATION_VIEWS.DISTILLERY);
          dispatch({ type: "OPEN_DISTILLERY" });
          return;
        }
        openLaboratoryFromSanctuary("header-cta");
        return;
      case ONBOARDING_STEPS.FIRST_DISTILLERY_JOB:
        if (distilleryUnlocked) {
          openStationView(STATION_VIEWS.DISTILLERY);
          return;
        }
        openLaboratoryFromSanctuary("header-cta");
        return;
      case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      case ONBOARDING_STEPS.BLUEPRINT_DECISION:
      case ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION:
      case ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE:
      case ONBOARDING_STEPS.DEEP_FORGE_READY:
        openStationView(STATION_VIEWS.FORGE);
        return;
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
        action: closeStationView,
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

  const sanctuaryRootClassName = [
    "sanctuary-root",
    "sanctuary-root--forge-light",
    SANCTUARY_STITCH_VISUAL_TRIAL ? "sanctuary-root--stitch-trial" : "",
    SANCTUARY_STITCH_VISUAL_TRIAL && SANCTUARY_STITCH_PERF_SAFE ? "sanctuary-root--stitch-perf-safe" : "",
  ].filter(Boolean).join(" ");

  const noClassContent = (
    <div className={`${sanctuaryRootClassName} fl-sanctuary-empty fl-sanctuary-empty-state`}>
      <section className="fl-sanctuary-panel fl-sanctuary-empty-card fl-sanctuary-empty-card--accent">
        <div className="fl-sanctuary-empty-copy">
          <div className="fl-sanctuary-empty-eyebrow fl-sanctuary-empty-eyebrow--accent">
            Santuario
          </div>
          <div className="fl-sanctuary-empty-title">
            {showingSanctuaryIntro
              ? "Inicia tu primera expedicion desde aqui"
              : classSelectionRequested
                ? "Elige una clase para esta expedicion"
                : "La clase se define al iniciar expedicion"}
          </div>
          <div className="fl-sanctuary-empty-body">
            {showingSanctuaryIntro
              ? "El Santuario es tu base. Primero aprendes a salir desde aqui; recien despues eliges una clase y entras al combate."
              : classSelectionRequested
                ? "La salida ya esta en preparacion. Elige Warrior o Mage para darle identidad a esta run antes de seguir."
                : "La clase ya no se elige de antemano. Primero inicia la expedicion y recien ahi decides con que arquetipo sales."}
          </div>
          {(showingSanctuaryIntro || !classSelectionRequested) && (
            <div className="fl-sanctuary-empty-cta">
              <button
                onClick={expeditionCta.action}
                data-onboarding-target={showingSanctuaryIntro ? "start-expedition" : undefined}
                className="fl-sanctuary-empty-cta-button"
              >
                {expeditionCta.label}
              </button>
            </div>
          )}
        </div>
      </section>

      {showingSanctuaryIntro || !classSelectionRequested ? (
        <div className="fl-sanctuary-empty-state">
          <section className="fl-sanctuary-panel fl-sanctuary-empty-card fl-sanctuary-empty-card--info">
            <div className="fl-sanctuary-empty-eyebrow fl-sanctuary-empty-eyebrow--info">
              {showingSanctuaryIntro ? "Primera run" : "Preparar salida"}
            </div>
            <div className="fl-sanctuary-empty-copy fl-sanctuary-empty-copy--lg-gap">
              <div className="fl-sanctuary-empty-subtitle">
                {showingSanctuaryIntro ? "Primero sal desde el Santuario." : "La clase se elige al preparar la expedicion."}
              </div>
              <div className="fl-sanctuary-empty-body">
                {showingSanctuaryIntro
                  ? <>Toca <strong>Iniciar expedicion</strong>. En el siguiente paso elegirás una clase para esa salida y, recien ahi, entrarás al combate para arrancar la run.</>
                  : <>Toca <strong>Iniciar expedicion</strong>. Cuando se abra la preparacion de la salida, ahi recien vas a elegir la clase de esta run.</>}
              </div>
              <div className="fl-sanctuary-empty-note">
                Usa el boton real resaltado arriba, no este panel.
              </div>
            </div>
          </section>
        </div>
      ) : (
        <Suspense
          fallback={(
            <section className="fl-sanctuary-panel fl-sanctuary-empty-card fl-sanctuary-empty-card--info">
              <div className="fl-sanctuary-empty-loading">
                Cargando selector de clase...
              </div>
            </section>
          )}
        >
          <SanctuaryClassSelector
            choosingClass={choosingClass}
            isMobileViewport={isMobileViewport}
            isNarrowViewport={isNarrowViewport}
            onSelectClass={classId => dispatch({ type: "SELECT_CLASS", classId })}
          />
        </Suspense>
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
    const hasAnyProject = projectCount > 0;
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
        action: closeStationView,
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
    if (!hasAnyCargo && extractedStashCount === 0 && !hasAnyProject) {
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
    if (blueprintDecisionUnlocked && extractedStashCount > 0 && !hasAnyProject) {
      return {
        tone: "danger",
        eyebrow: "Decision clave",
        title: "Decide que hacer con tu primera pieza de Forja",
        body: "La pieza rescatada no vuelve equipada. Elige si la guardas para trabajarla o si la desguazas para recuperar recursos.",
        cta: "Abrir Forja",
        action: () => openStationView(STATION_VIEWS.FORGE),
      };
    }
    if (blueprintDecisionUnlocked && Number(state?.prestige?.level || 0) >= 3 && !deepForgeStation.unlocked) {
      return {
        tone: "accent",
        eyebrow: "Proyecto persistente",
        title: "Ya puedes investigar la Forja",
        body: "Desde Prestige 3, el Laboratorio puede abrir la estacion donde se trabajan piezas persistentes del Santuario.",
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
    if (hasAnyProject && !unlockedEchoes) {
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
        action: () => openStationView(STATION_VIEWS.LIBRARY),
      };
    }
    return {
      tone: "success",
      eyebrow: "Santuario activo",
      title: "Ya tienes el loop principal funcionando",
      body: "Ahora el foco es sostener la Forja del Santuario, mantener jobs corriendo y convertir una buena expedicion en mejor cuenta, no solo en mejor run.",
      cta: "Abrir Forja",
      action: () => openStationView(STATION_VIEWS.FORGE),
    };
  }, [
    blueprintDecisionUnlocked,
    projectCount,
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
    extractedStashCount,
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
  const runningJobsByProgress = useMemo(
    () => [...runningJobs].sort((left, right) => {
      const progressDiff = getJobProgressFraction(right, now) - getJobProgressFraction(left, now);
      if (Math.abs(progressDiff) > 0.0001) return progressDiff;
      return sortJobsByEnding(left, right);
    }),
    [runningJobs, now]
  );
  const workRows = useMemo(() => {
    const claimableRows = claimableJobs.map(job => {
      const repeatable = canRepeatSanctuaryJob(job);
      return {
        id: `claim-${job.id}`,
        kind: "claimable",
        station: job.station,
        stationLabel: jobStationLabel(job.station),
        title: jobTitle(job),
        detail: jobSummary(job),
        chip: "Listo para reclamar",
        actionLabel: "Reclamar",
        action: () => claimSanctuaryJob(job, { nowAt: now }),
        secondaryActionLabel: repeatable ? "Reclamar + repetir" : null,
        secondaryAction: repeatable ? () => claimSanctuaryJob(job, { repeat: true, nowAt: now + 1 }) : null,
      };
    });
    const runningRows = runningJobsByProgress.map(job => ({
      id: `running-${job.id}`,
      kind: "running",
      station: job.station,
      stationLabel: jobStationLabel(job.station),
      title: jobTitle(job),
      detail: jobSummary(job),
      chip: formatRemaining(Number(job.endsAt || 0) - now),
      startedAt: Number(job?.startedAt || 0),
      endsAt: Number(job?.endsAt || 0),
    }));
    return [...claimableRows, ...runningRows];
  }, [claimableJobs, now, runningJobsByProgress]);
  const canRepeatClaimableJobs = useMemo(
    () => claimableJobs.some(job => canRepeatSanctuaryJob(job)),
    [claimableJobs]
  );
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
    if (blueprintDecisionUnlocked && deepForgeStation.unlocked && projectCount <= 0 && extractedItems.length <= 0) {
      rows.push({
        id: "forge-no-input",
        title: "Forja",
        detail: "Sin piezas en stash ni rescates listos para trabajar.",
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
    projectCount,
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
      accentTone: "defense",
      status: laboratoryUnlocked ? `${laboratoryRunningCount} activo(s)` : "Bloqueado",
      detail: laboratoryUnlocked
        ? `Experimentos y mejoras persistentes. ${laboratoryClaimableCount} disponible(s).`
        : "Investiga infraestructura para encender nuevas estaciones.",
      tone: "var(--tone-accent, #4338ca)",
      actionLabel: laboratoryUnlocked ? "Abrir" : "Cerrado",
      locked: !laboratoryUnlocked,
      state: !laboratoryUnlocked
        ? "locked"
        : laboratoryClaimableCount > 0
          ? "claimable"
          : laboratoryRunningCount > 0
            ? "job-active"
            : "active",
      action: laboratoryUnlocked ? () => openLaboratoryFromSanctuary("overview-laboratory") : null,
      onboardingTarget:
        onboardingStep === ONBOARDING_STEPS.OPEN_LABORATORY
          ? "open-laboratory"
          : onboardingStep === ONBOARDING_STEPS.DISTILLERY_READY
            ? "open-laboratory"
            : null,
    },
    {
      id: "distillery",
      title: "Destileria",
      accentTone: "gold",
      status: distilleryUnlocked ? `${runningByStation.distillery || 0}/${distillerySlots}` : "Bloqueada",
      detail: distilleryUnlocked
        ? `Convierte cargo recuperado en recursos. ${totalCargoQuantity} bundle(s).`
        : "Requiere investigacion de Laboratorio.",
      tone: "var(--tone-violet, #7c3aed)",
      actionLabel: distilleryUnlocked ? "Abrir" : "Laboratorio",
      locked: !distilleryUnlocked,
      state: !distilleryUnlocked
        ? "locked"
        : (runningByStation.distillery || 0) > 0
          ? "job-active"
          : totalCargoQuantity > 0
            ? "claimable"
            : "active",
      action: () => {
        if (!distilleryUnlocked) {
          openLaboratoryFromSanctuary("overview-distillery");
          return;
        }
        openStationView(STATION_VIEWS.DISTILLERY);
        if (onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY) {
          dispatch({ type: "OPEN_DISTILLERY" });
        }
      },
      onboardingTarget:
        onboardingStep === ONBOARDING_STEPS.OPEN_DISTILLERY
          ? "open-distillery"
          : null,
    },
    {
      id: "library",
      title: "Biblioteca",
      accentTone: "arcane",
      status: libraryStation.unlocked ? `${runningLibraryJobs.length}/${librarySlots}` : "Bloqueada",
      detail: libraryStation.unlocked
        ? `Investiga conocimiento antiguo. ${claimableLibraryJobs.length} disponible(s).`
        : "Requiere Laboratorio avanzado.",
      tone: "var(--tone-accent, #4338ca)",
      actionLabel: libraryStation.unlocked ? "Abrir" : "Laboratorio",
      locked: !libraryStation.unlocked,
      state: !libraryStation.unlocked
        ? "locked"
        : claimableLibraryJobs.length > 0
          ? "claimable"
          : runningLibraryJobs.length > 0
            ? "job-active"
            : "active",
      action: () => (libraryStation.unlocked
        ? openStationView(STATION_VIEWS.LIBRARY)
        : openLaboratoryFromSanctuary("overview-library")),
    },
    {
      id: "errands",
      title: "Encargos",
      accentTone: "defense",
      status: errandStation.unlocked ? `${runningErrandJobs.length}/${errandSlots}` : "Bloqueados",
      detail: errandStation.unlocked
        ? `Envia aliados a recuperar recompensas. ${Math.max(0, errandSlots - runningErrandJobs.length)} equipo(s) libre(s).`
        : "Requiere investigacion de Laboratorio.",
      tone: "var(--tone-info, #0369a1)",
      actionLabel: errandStation.unlocked ? "Abrir" : "Laboratorio",
      locked: !errandStation.unlocked,
      state: !errandStation.unlocked
        ? "locked"
        : claimableErrandJobs.length > 0
          ? "claimable"
          : runningErrandJobs.length > 0
            ? "job-active"
            : "active",
      action: () => (errandStation.unlocked
        ? openStationView(STATION_VIEWS.ERRANDS)
        : openLaboratoryFromSanctuary("overview-errands")),
    },
    {
      id: "sigils",
      title: "Altar de Sigilos",
      accentTone: "success",
      status: infusionStation.unlocked ? `${runningByStation.sigilInfusion || 0}/${infusionSlots}` : "Bloqueado",
      detail: infusionStation.unlocked
        ? `Invoca y mejora sigilos permanentes. ${Object.values(sigilInfusions).reduce((total, entry) => total + Math.max(0, Number(entry?.charges || 0)), 0)} disponible(s).`
        : "Requiere Laboratorio avanzado.",
      tone: "var(--tone-success, #10b981)",
      actionLabel: infusionStation.unlocked ? "Abrir" : "Laboratorio",
      locked: !infusionStation.unlocked,
      state: !infusionStation.unlocked
        ? "locked"
        : (runningByStation.sigilInfusion || 0) > 0
          ? "job-active"
          : totalStoredSigilCharges > 0
            ? "claimable"
            : "active",
      action: () => (infusionStation.unlocked
        ? openStationView(STATION_VIEWS.SIGILS)
        : openLaboratoryFromSanctuary("overview-sigil")),
    },
    ...(blueprintDecisionUnlocked
      ? [{
          id: "forge",
          title: "Forja",
          accentTone: "danger",
          status: "Operativa",
          detail: "Mejora, repara y forja equipo con materiales especiales.",
          tone: "var(--tone-danger, #D85A30)",
          actionLabel: "Abrir",
          locked: false,
          state: "active",
          action: () => openStationView(STATION_VIEWS.FORGE),
        }]
      : []),
  ]), [
    projectCount,
    blueprintDecisionUnlocked,
    claimableErrandJobs.length,
    claimableLibraryJobs.length,
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
    onboardingStep,
    dispatch,
    runningByStation.distillery,
    runningByStation.sigilInfusion,
    runningErrandJobs.length,
    runningLibraryJobs.length,
    sigilInfusions,
    totalStoredSigilCharges,
    totalCargoQuantity,
  ]);
  const visibleStationOverviewRows = stationOverviewRows;
  const stationViewNode = (() => {
    const fallback = (label) => <div className="fl-sanctuary-overlay-loading">Cargando {label}...</div>;
    if (activeStationView === STATION_VIEWS.DISTILLERY) {
      return (
        <Suspense fallback={fallback("Destileria")}>
          <DistilleryOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            embedded
            onClose={closeStationView}
          />
        </Suspense>
      );
    }
    if (activeStationView === STATION_VIEWS.ERRANDS) {
      return (
        <Suspense fallback={fallback("Encargos")}>
          <EncargosOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            embedded
            onClose={closeStationView}
          />
        </Suspense>
      );
    }
    if (activeStationView === STATION_VIEWS.FORGE) {
      return (
        <Suspense fallback={fallback("Forja")}>
          <SanctuaryForgeOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            embedded
            onClose={() => {
              if (state?.combat?.reforgeSession) return;
              closeStationView();
            }}
          />
        </Suspense>
      );
    }
    if (activeStationView === STATION_VIEWS.SIGILS) {
      return (
        <Suspense fallback={fallback("Altar de Sigilos")}>
          <SigilAltarOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            embedded
            onClose={closeStationView}
          />
        </Suspense>
      );
    }
    if (activeStationView === STATION_VIEWS.LIBRARY) {
      return (
        <Suspense fallback={fallback("Biblioteca")}>
          <BibliotecaOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            embedded
            onClose={closeStationView}
          />
        </Suspense>
      );
    }
    if (activeStationView === STATION_VIEWS.LABORATORY) {
      return (
        <Suspense fallback={fallback("Laboratorio")}>
          <LaboratoryOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            embedded
            onClose={closeStationView}
          />
        </Suspense>
      );
    }
    return null;
  })();

  if (!hasClass && (!infrastructureVisible || classSelectionRequested) && !hasStationViewOpen) {
    return noClassContent;
  }

  return (
    <div
      ref={sanctuaryRootRef}
      className={[
      sanctuaryRootClassName,
      "fl-sanctuary-root",
      isMobileViewport ? "fl-sanctuary-root--mobile" : "",
      hasStationViewOpen ? "fl-sanctuary-root--station-open" : "",
      ].filter(Boolean).join(" ")}
    >
      {!hasStationViewOpen && (
        <FlHeroModule
          variant="sanctuary-v2"
          eyebrow="Base persistente"
          title="Santuario"
          end={(
            <FlButton
              className="fl-sanctuary-hero-cta"
              variant="default"
              size="sm"
              onClick={expeditionCta.action}
              icon={<ForgeIcon name="combat" size={14} />}
            >
              Volver a Expedición
            </FlButton>
          )}
        />
      )}

      {!hasStationViewOpen && (
      <FlPanel
        variant="compact"
        className="fl-jobs-module-panel"
        header={(
          <FlPanelHeader
            className="fl-jobs-module-panel__header"
            title="Trabajos"
            primaryAction={claimableJobs.length > 0 ? (
              <FlButton
                onClick={() => claimAllSanctuaryJobs(claimableJobs)}
                variant="default"
                size="xs-compact"
                ariaLabel="Reclamar Todo"
                icon={<ForgeIcon name="claim" size={14} />}
              >
                TODO
              </FlButton>
            ) : null}
            secondaryAction={canRepeatClaimableJobs ? (
              <FlButton
                onClick={() => claimAllSanctuaryJobs(claimableJobs, { repeat: true })}
                variant="secondary"
                size="xs-compact"
                ariaLabel="Reclamar Todo y Repetir"
                icon={<ForgeIcon name="repeat" size={14} />}
              >
                TODO
              </FlButton>
            ) : null}
          />
        )}
      >
        {workRows.length <= 0 ? (
          <div className="fl-jobs-module-panel__empty">
            No hay trabajos activos en este momento.
          </div>
        ) : (
          <div className="fl-jobs-module-panel__body">
            {workRows.map(row => (
              <FlJobRow
                key={row.id}
                className={[
                  "fl-sanctuary-row",
                  "fl-sanctuary-job-row",
                  "fl-jobs-module-row",
                  `fl-sanctuary-row--${row.kind}`,
                ].join(" ")}
                ready={row.kind === "claimable"}
                icon={getSanctuaryWorkIcon(row)}
                title={row.title}
                detail={row.detail}
                statusLabel={row.kind === "claimable" ? "Listo para reclamar" : "En progreso..."}
                progress={row.kind === "running" ? getJobProgressFraction(row, now) : 0}
                chipLabel={row.kind === "running" ? row.chip : row.stationLabel}
                actionLabel={row.kind === "claimable" ? row.actionLabel : ""}
                onAction={row.kind === "claimable" ? row.action : undefined}
                secondaryActionLabel={row.secondaryActionLabel}
                onSecondaryAction={row.secondaryAction}
              />
            ))}
          </div>
        )}
      </FlPanel>
      )}

      {!hasStationViewOpen && infrastructureVisible && (
        <FlPanel
          variant="compact"
          className="fl-stations-module-panel"
          header={(
            <FlPanelHeader
              className="fl-stations-module-panel__header"
              title="Estaciones"
            />
          )}
        >
          <div className="fl-stations-module-panel__body">
            {visibleStationOverviewRows.map(row => (
              <FlStationCard
                key={row.id}
                className={[
                  "fl-sanctuary-station-row",
                  "fl-sanctuary-station-row--module",
                ].filter(Boolean).join(" ")}
                stationId={row.id}
                title={row.title}
                detail={row.detail}
                status={row.status}
                accentTone={row.accentTone}
                locked={row.locked}
                actionLabel={row.actionLabel}
                onAction={row.action || undefined}
                onboardingTarget={row.onboardingTarget}
                state={row.onboardingTarget ? "spotlight" : (row.state || (row.locked ? "locked" : "active"))}
                spotlightText={row.onboardingTarget ? "✦ Estación prioritaria para el siguiente paso" : ""}
              />
            ))}
          </div>
        </FlPanel>
      )}

      {!hasStationViewOpen && infrastructureVisible && (
        <FlPanel
          variant="compact"
          className="fl-relics-module-panel"
          header={(
            <FlPanelHeader
              className="fl-relics-module-panel__header"
              title="Arsenal de Reliquias"
            />
          )}
        >
          <div className="fl-relics-module-panel__meta">
            <span className="fl-sanctuary-chip fl-sanctuary-chip--danger">{relicCount} / {relicArmorySlots}</span>
            <span className={["fl-sanctuary-chip", activeRelics?.weapon ? "fl-sanctuary-chip--success" : ""].filter(Boolean).join(" ")}>
              Arma {activeRelics?.weapon ? "activa" : "vacia"}
            </span>
            <span className={["fl-sanctuary-chip", activeRelics?.armor ? "fl-sanctuary-chip--success" : ""].filter(Boolean).join(" ")}>
              Armadura {activeRelics?.armor ? "activa" : "vacia"}
            </span>
          </div>

          {sortedRelicArmory.length === 0 ? (
            <div className="fl-relics-module-panel__empty">
              Aun no hay reliquias en el arsenal. Al extraer una pieza desde expedicion aparece aqui para activarla o extraerla.
            </div>
          ) : (
            <div className="fl-relics-module-panel__body">
              {sortedRelicArmory.slice(0, relicArmorySlots).map(relic => {
                const slot = relic?.slot === "armor" ? "armor" : "weapon";
                const isActive = activeRelics?.[slot] === relic.id;
                const relicTier = Math.max(1, Number(relic?.itemTier || relic?.item?.itemTier || 1));
                const contextTag = String(relic?.contextAttunement || "none").toLowerCase() !== "none"
                  ? `attune ${String(relic?.contextAttunement || "").toLowerCase()}`
                  : "";
                const detailLine = [
                  slot === "armor" ? "armadura" : "arma",
                  `tier ${relicTier}`,
                  contextTag,
                ].filter(Boolean).join(" · ");
                const stabilizePlan = calculateRelicEntropyStabilizePlan(relic);
                const availableSigilFlux = Math.max(0, Number(resources?.sigilFlux || 0));
                const availableRelicDust = Math.max(0, Number(resources?.relicDust || 0));
                const canStabilize =
                  stabilizePlan.entropyReduced > 0 &&
                  availableRelicDust >= stabilizePlan.relicDustCost &&
                  availableSigilFlux >= stabilizePlan.sigilFluxCost;

                return (
                  <FlRelicRow
                    key={relic.id}
                    relic={relic}
                    slot={slot}
                    rarity={relic?.rarity || "rare"}
                    name={relic?.name || "Reliquia"}
                    detail={detailLine}
                    active={isActive}
                    equipLabel={isActive ? "Activa" : "Activar"}
                    onEquip={!isActive ? () => dispatch({ type: "SET_ACTIVE_RELIC", slot, relicId: relic.id }) : undefined}
                    extractLabel={pendingRelicExtractId === relic.id ? "Confirmar" : "Extraer"}
                    extractVariant={pendingRelicExtractId === relic.id ? "danger" : "danger-ghost"}
                    onExtract={() => {
                      if (pendingRelicExtractId !== relic.id) {
                        setPendingRelicExtractId(relic.id);
                        return;
                      }
                      dispatch({ type: "DISCARD_RELIC", relicId: relic.id });
                      setPendingRelicExtractId(null);
                    }}
                    showStabilize={stabilizePlan.entropyReduced > 0}
                    canStabilize={canStabilize}
                    stabilizeHint={`Reduce ${stabilizePlan.entropyReduced} de entropia por ${stabilizePlan.relicDustCost} polvo y ${stabilizePlan.sigilFluxCost} flux`}
                    onStabilize={canStabilize ? () => dispatch({ type: "STABILIZE_RELIC_ENTROPY", relicId: relic.id }) : undefined}
                  />
                );
              })}
            </div>
          )}

          {sortedRelicArmory.length > relicArmorySlots && (
            <div className="fl-relics-module-panel__note">
              Mostrando {relicArmorySlots} de {sortedRelicArmory.length} reliquias.
            </div>
          )}
        </FlPanel>
      )}


      {hasStationViewOpen && (
        <section className="fl-sanctuary-station-view">
          {stationViewNode}
        </section>
      )}
      <ActionToast toast={actionToast} isMobile={isMobileViewport} />
    </div>
  );
}
