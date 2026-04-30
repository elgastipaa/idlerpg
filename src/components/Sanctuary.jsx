import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import JobProgressBar from "./JobProgressBar";
import ActionToast from "./ActionToast";
import ForgeIcon from "./icons/ForgeIcon";
import { FlButton, FlIconFrame } from "./ui/forge";
import { getStationAsset } from "../utils/assetRegistry";
import useRelativeNow from "../hooks/useRelativeNow";
import useViewport from "../hooks/useViewport";
import { getRarityColor } from "../constants/rarity";
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

// Visual-only Stitch/Sanctuary skin. Flip to false to restore the previous hub skin.
const SANCTUARY_STITCH_VISUAL_TRIAL = false;
// Keeps the visual direction but avoids expensive blur/shimmer/mask effects.
const SANCTUARY_STITCH_PERF_SAFE = true;

function sectionCardStyle(accent = "var(--tone-accent, #4338ca)") {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "var(--dense-card-radius, 12px)",
    padding: "var(--dense-panel-padding, 10px)",
    display: "grid",
    gap: "var(--dense-panel-gap, 8px)",
    boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
    borderTop: `3px solid ${accent}`,
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
    borderRadius: "var(--dense-card-radius, 12px)",
    padding: "var(--dense-button-padding, 7px 10px)",
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
    padding: "3px 7px",
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
    <OverlayShell isMobile={isMobile} contentLabel={`Cargando ${label}`}>
      <OverlaySurface
        isMobile={isMobile}
        maxWidth="420px"
        paddingMobile="18px 16px 20px"
        paddingDesktop="20px 22px"
        gap="0"
        {...{ style: {
          textAlign: "center",
          fontSize: "0.78rem",
          fontWeight: "900",
          color: "var(--color-text-secondary, #64748b)",
          background: "var(--color-background-secondary, #ffffff)",
        } }}
      >
        Cargando {label}...
      </OverlaySurface>
    </OverlayShell>
  );
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

const SANCTUARY_STATION_ICONS = {
  laboratory: "laboratory",
  distillery: "distillery",
  library: "library",
  errands: "mail",
  sigils: "sigilAltar",
  forge: "anvil",
};

const SANCTUARY_JOB_ICONS = {
  distillery: "distillery",
  errands: "mail",
  sigilInfusion: "sigilAltar",
  codexResearch: "library",
  deepForge: "anvil",
  laboratory: "laboratory",
};

function getSanctuaryStationIcon(stationId = "") {
  return SANCTUARY_STATION_ICONS[stationId] || "sanctuary";
}

function getSanctuaryWorkIcon(row = {}) {
  return SANCTUARY_JOB_ICONS[row.station] || (row.kind === "claimable" ? "claim" : "repeat");
}

export default function Sanctuary({ state, dispatch }) {
  const now = useRelativeNow();
  const [actionToast, setActionToast] = useState(null);
  const [showDistillery, setShowDistillery] = useState(false);
  const [showErrands, setShowErrands] = useState(false);
  const [showSanctuaryForge, setShowSanctuaryForge] = useState(false);
  const [showSigilAltar, setShowSigilAltar] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLaboratory, setShowLaboratory] = useState(false);
  const [pendingRelicExtractId, setPendingRelicExtractId] = useState(null);
  const { viewportWidth } = useViewport();
  const isMobileViewport = viewportWidth < 768;
  const isNarrowViewport = viewportWidth < 420;
  const rawOnboardingStep = state?.onboarding?.step || null;
  const onboardingStep = getEffectiveOnboardingStep(rawOnboardingStep, {
    ...state,
    __liveNow: now,
  });

  useEffect(() => {
    if (
      showDistillery ||
      [
        ONBOARDING_STEPS.DISTILLERY_READY,
        ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
        ONBOARDING_STEPS.OPEN_DISTILLERY,
        ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
      ].includes(onboardingStep)
    ) {
      loadDistilleryOverlay();
    }
  }, [onboardingStep, showDistillery]);

  function closeAllOverlays() {
    setShowDistillery(false);
    setShowErrands(false);
    setShowSanctuaryForge(false);
    setShowSigilAltar(false);
    setShowLibrary(false);
    setShowLaboratory(false);
  }

  useEffect(() => {
    if (!actionToast?.id) return undefined;
    const id = window.setTimeout(() => setActionToast(null), 1700);
    return () => window.clearTimeout(id);
  }, [actionToast?.id]);

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
  }, [isMobileViewport, onboardingStep, showLaboratory]);

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
  const deepForgeSession = sanctuary?.deepForgeSession || null;
  const distillerySlots = Number(sanctuary?.stations?.distillery?.slots || 1);
  const errandSlots = Number(sanctuary?.stations?.errands?.slots || 2);
  const infusionSlots = Number(sanctuary?.stations?.sigilInfusion?.slots || 1);
  const librarySlots = Number(sanctuary?.stations?.codexResearch?.slots || 1);
  const deepForgeSlots = Number(sanctuary?.stations?.deepForge?.slots || 1);
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
    setShowSanctuaryForge(true);
    dispatch({ type: "ACK_OPEN_SANCTUARY_FORGE" });
  }, [dispatch, sanctuary?.pendingOpenForgeOverlay]);
  useEffect(() => {
    if (!state?.combat?.reforgeSession) return;
    setShowSanctuaryForge(true);
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
    setShowLaboratory(false);
    setShowErrands(false);
    setShowSanctuaryForge(false);
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
      case ONBOARDING_STEPS.DEEP_FORGE_READY:
        setShowSanctuaryForge(true);
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

  const sanctuaryRootClassName = [
    "sanctuary-root",
    "sanctuary-root--forge-light",
    SANCTUARY_STITCH_VISUAL_TRIAL ? "sanctuary-root--stitch-trial" : "",
    SANCTUARY_STITCH_VISUAL_TRIAL && SANCTUARY_STITCH_PERF_SAFE ? "sanctuary-root--stitch-perf-safe" : "",
  ].filter(Boolean).join(" ");

  const noClassContent = (
    <div className={`${sanctuaryRootClassName} fl-sanctuary-empty`} {...{ style: { padding: "12px", display: "grid", gap: "12px" } }}>
      <section className="fl-sanctuary-panel" {...{ style: sectionCardStyle("var(--tone-accent, #4338ca)") }}>
        <div {...{ style: { display: "grid", gap: "6px" } }}>
          <div {...{ style: { fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" } }}>
            Santuario
          </div>
          <div {...{ style: { fontSize: "1rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
            {showingSanctuaryIntro
              ? "Inicia tu primera expedicion desde aqui"
              : classSelectionRequested
                ? "Elige una clase para esta expedicion"
                : "La clase se define al iniciar expedicion"}
          </div>
          <div {...{ style: { fontSize: "0.76rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 } }}>
            {showingSanctuaryIntro
              ? "El Santuario es tu base. Primero aprendes a salir desde aqui; recien despues eliges una clase y entras al combate."
              : classSelectionRequested
                ? "La salida ya esta en preparacion. Elige Warrior o Mage para darle identidad a esta run antes de seguir."
                : "La clase ya no se elige de antemano. Primero inicia la expedicion y recien ahi decides con que arquetipo sales."}
          </div>
          {(showingSanctuaryIntro || !classSelectionRequested) && (
            <div {...{ style: { display: "flex", justifyContent: "flex-end", marginTop: "6px" } }}>
              <button
                onClick={expeditionCta.action}
                data-onboarding-target={showingSanctuaryIntro ? "start-expedition" : undefined}
                {...{ style: {
                  ...actionButtonStyle({ primary: true }),
                  boxShadow: "0 0 0 2px rgba(83,74,183,0.16), 0 12px 28px rgba(83,74,183,0.14)",
                  animation: "sanctuarySpotlightPulse 1600ms ease-in-out infinite",
                } }}
              >
                {expeditionCta.label}
              </button>
            </div>
          )}
        </div>
      </section>

      {showingSanctuaryIntro || !classSelectionRequested ? (
        <div {...{ style: { padding: "12px", display: "grid", gap: "12px" } }}>
          <section className="fl-sanctuary-panel" {...{ style: sectionCardStyle("var(--tone-info, #0369a1)") }}>
            <div {...{ style: { fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" } }}>
              {showingSanctuaryIntro ? "Primera run" : "Preparar salida"}
            </div>
            <div {...{ style: { display: "grid", gap: "8px" } }}>
              <div {...{ style: { fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                {showingSanctuaryIntro ? "Primero sal desde el Santuario." : "La clase se elige al preparar la expedicion."}
              </div>
              <div {...{ style: { fontSize: "0.74rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 } }}>
                {showingSanctuaryIntro
                  ? <>Toca <strong>Iniciar expedicion</strong>. En el siguiente paso elegirás una clase para esa salida y, recien ahi, entrarás al combate para arrancar la run.</>
                  : <>Toca <strong>Iniciar expedicion</strong>. Cuando se abra la preparacion de la salida, ahi recien vas a elegir la clase de esta run.</>}
              </div>
              <div {...{ style: { fontSize: "0.68rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)" } }}>
                Usa el boton real resaltado arriba, no este panel.
              </div>
            </div>
          </section>
        </div>
      ) : (
        <Suspense
          fallback={(
            <section className="fl-sanctuary-panel" {...{ style: sectionCardStyle("var(--tone-info, #0369a1)") }}>
              <div {...{ style: { fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" } }}>
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
        action: () => setShowSanctuaryForge(true),
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
        action: () => setShowLibrary(true),
      };
    }
    return {
      tone: "success",
      eyebrow: "Santuario activo",
      title: "Ya tienes el loop principal funcionando",
      body: "Ahora el foco es sostener la Forja del Santuario, mantener jobs corriendo y convertir una buena expedicion en mejor cuenta, no solo en mejor run.",
      cta: "Abrir Forja",
      action: () => setShowSanctuaryForge(true),
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
      status: laboratoryUnlocked ? `${laboratoryRunningCount} activo(s)` : "Bloqueado",
      detail: laboratoryUnlocked
        ? `Experimentos y mejoras persistentes. ${laboratoryClaimableCount} disponible(s).`
        : "Investiga infraestructura para encender nuevas estaciones.",
      tone: "var(--tone-accent, #4338ca)",
      actionLabel: laboratoryUnlocked ? "Abrir" : "Cerrado",
      locked: !laboratoryUnlocked,
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
      status: distilleryUnlocked ? `${runningByStation.distillery || 0}/${distillerySlots}` : "Bloqueada",
      detail: distilleryUnlocked
        ? `Convierte cargo recuperado en recursos. ${totalCargoQuantity} bundle(s).`
        : "Requiere investigacion de Laboratorio.",
      tone: "var(--tone-violet, #7c3aed)",
      actionLabel: distilleryUnlocked ? "Abrir" : "Laboratorio",
      locked: !distilleryUnlocked,
      action: () => {
        if (!distilleryUnlocked) {
          openLaboratoryFromSanctuary("overview-distillery");
          return;
        }
        setShowDistillery(true);
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
      status: libraryStation.unlocked ? `${runningLibraryJobs.length}/${librarySlots}` : "Bloqueada",
      detail: libraryStation.unlocked
        ? `Investiga conocimiento antiguo. ${claimableLibraryJobs.length} disponible(s).`
        : "Requiere Laboratorio avanzado.",
      tone: "var(--tone-accent, #4338ca)",
      actionLabel: libraryStation.unlocked ? "Abrir" : "Laboratorio",
      locked: !libraryStation.unlocked,
      action: () => (libraryStation.unlocked ? setShowLibrary(true) : openLaboratoryFromSanctuary("overview-library")),
    },
    {
      id: "errands",
      title: "Encargos",
      status: errandStation.unlocked ? `${runningErrandJobs.length}/${errandSlots}` : "Bloqueados",
      detail: errandStation.unlocked
        ? `Envia aliados a recuperar recompensas. ${Math.max(0, errandSlots - runningErrandJobs.length)} equipo(s) libre(s).`
        : "Requiere investigacion de Laboratorio.",
      tone: "var(--tone-info, #0369a1)",
      actionLabel: errandStation.unlocked ? "Abrir" : "Laboratorio",
      locked: !errandStation.unlocked,
      action: () => (errandStation.unlocked ? setShowErrands(true) : openLaboratoryFromSanctuary("overview-errands")),
    },
    {
      id: "sigils",
      title: "Altar de Sigilos",
      status: infusionStation.unlocked ? `${runningByStation.sigilInfusion || 0}/${infusionSlots}` : "Bloqueado",
      detail: infusionStation.unlocked
        ? `Invoca y mejora sigilos permanentes. ${Object.values(sigilInfusions).reduce((total, entry) => total + Math.max(0, Number(entry?.charges || 0)), 0)} disponible(s).`
        : "Requiere Laboratorio avanzado.",
      tone: "var(--tone-success, #10b981)",
      actionLabel: infusionStation.unlocked ? "Abrir" : "Laboratorio",
      locked: !infusionStation.unlocked,
      action: () => (infusionStation.unlocked ? setShowSigilAltar(true) : openLaboratoryFromSanctuary("overview-sigil")),
    },
    ...(blueprintDecisionUnlocked
      ? [{
          id: "forge",
          title: "Forja",
          status: "Operativa",
          detail: "Mejora, repara y forja equipo con materiales especiales.",
          tone: "var(--tone-danger, #D85A30)",
          actionLabel: "Abrir",
          locked: false,
          action: () => setShowSanctuaryForge(true),
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
    totalCargoQuantity,
  ]);
  const visibleStationOverviewRows = stationOverviewRows;
  if (!hasClass && (!infrastructureVisible || classSelectionRequested)) {
    return noClassContent;
  }

  return (
    <div className={sanctuaryRootClassName} {...{ style: { padding: isMobileViewport ? "calc(0.5rem * var(--density-scale, 1))" : "calc(0.65rem * var(--density-scale, 1))", display: "grid", gap: "calc(0.5rem * var(--density-scale, 1))", background: "transparent", color: "var(--fl-text-1, #ead7b5)" } }}>
      <header className="fl-sanctuary-hero">
        <div>
          <div className="fl-sanctuary-kicker">Base persistente</div>
          <h1 className="fl-sanctuary-title">Santuario</h1>
        </div>
        <div className="fl-sanctuary-hero-sigil" aria-hidden="true">
          <ForgeIcon name="sanctuary" size={28} />
        </div>
      </header>

      <div className="fl-sanctuary-expedition-cta">
        <button
          onClick={expeditionCta.action}
          className={[
            "fl-sanctuary-button",
            "fl-sanctuary-button--back",
            expeditionCta.primary ? "fl-sanctuary-button--primary" : "",
          ].filter(Boolean).join(" ")}
          {...{ style: { width: isMobileViewport ? "min(74vw, 250px)" : "auto", minWidth: isMobileViewport ? "0" : "210px" } }}
        >
          <ForgeIcon name="combat" size={17} />
          {expeditionCta.label}
        </button>
      </div>

      <section className="fl-sanctuary-panel fl-sanctuary-panel--jobs">
        <div className="fl-sanctuary-panel__header">
          <div>
            <div className="fl-sanctuary-panel__eyebrow">Trabajos</div>
          </div>
          <div className="fl-sanctuary-header-actions">
            <span className="fl-sanctuary-chip fl-sanctuary-chip--info">
              {claimableJobs.length} listos · {runningJobs.length} corriendo
            </span>
            {claimableJobs.length > 1 && (
              <FlButton
                onClick={() => claimAllSanctuaryJobs(claimableJobs)}
                variant="primary"
                size="sm"
                className="fl-sanctuary-button fl-sanctuary-button--primary"
                icon={<ForgeIcon name="claim" size={16} />}
              >
                Reclamar todo
              </FlButton>
            )}
            {canRepeatClaimableJobs && (
              <FlButton
                onClick={() => claimAllSanctuaryJobs(claimableJobs, { repeat: true })}
                variant="secondary"
                size="sm"
                className="fl-sanctuary-button fl-sanctuary-button--secondary"
                icon={<ForgeIcon name="repeat" size={16} />}
              >
                Todo + repetir
              </FlButton>
            )}
          </div>
        </div>

        {workRows.length <= 0 ? (
          <div className="fl-sanctuary-empty-state">
            No hay trabajos activos en este momento.
          </div>
        ) : (
          <div className="fl-sanctuary-list fl-sanctuary-job-list">
            {workRows.map(row => (
              <div
                key={row.id}
                className={[
                  "fl-sanctuary-row",
                  "fl-sanctuary-job-row",
                  `fl-sanctuary-row--${row.kind}`,
                ].join(" ")}
              >
                <div className="fl-sanctuary-row-icon" aria-hidden="true">
                  <ForgeIcon name={getSanctuaryWorkIcon(row)} size={34} />
                  {row.kind === "claimable" && <span className="fl-sanctuary-ready-dot" />}
                </div>
                <div className="fl-sanctuary-row-body">
                  <div className="fl-sanctuary-row-topline">
                    <div className="fl-sanctuary-row-title-group">
                      <div className="fl-sanctuary-row-title">{row.title}</div>
                      <div className={[
                        "fl-sanctuary-row-state",
                        row.kind === "claimable" ? "fl-sanctuary-row-state--ready" : "fl-sanctuary-row-state--running",
                      ].join(" ")}
                      >
                        {row.kind === "claimable" ? "Listo para reclamar" : "En progreso..."}
                      </div>
                    </div>
                    <span className={[
                      "fl-sanctuary-chip",
                      row.kind === "claimable" ? "fl-sanctuary-chip--success" : "fl-sanctuary-chip--info",
                    ].join(" ")}
                    >
                      {row.kind === "claimable" ? row.stationLabel : row.chip}
                    </span>
                  </div>
                  <div className="fl-sanctuary-row-detail">
                    {row.kind === "claimable" ? row.detail : "Tiempo restante:"}
                  </div>
                  {row.kind === "claimable" ? (
                    <div className="fl-sanctuary-row-actions">
                      <FlButton
                        onClick={row.action}
                        variant="primary"
                        size="sm"
                        className="fl-sanctuary-button fl-sanctuary-button--primary"
                      >
                        <ForgeIcon name="claim" size={16} />
                        {row.actionLabel}
                      </FlButton>
                      {row.secondaryAction && (
                        <button
                          onClick={row.secondaryAction}
                          className="fl-sanctuary-button fl-sanctuary-button--icon"
                          aria-label={row.secondaryActionLabel}
                          title={row.secondaryActionLabel}
                        >
                          <ForgeIcon name="repeat" size={19} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="fl-sanctuary-progress-wrap">
                      <JobProgressBar
                        startedAt={row?.startedAt}
                        endsAt={row?.endsAt}
                        now={now}
                        tone="var(--tone-info, #6ec9ff)"
                        track="rgba(255, 218, 138, 0.12)"
                        leftLabel={row.stationLabel}
                        rightLabel={row.chip}
                        compact
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {infrastructureVisible && (
        <section className="fl-sanctuary-panel fl-sanctuary-panel--stations">
          <div className="fl-sanctuary-panel__header">
            <div>
              <div className="fl-sanctuary-panel__eyebrow">Estaciones</div>
              <div className="fl-sanctuary-panel__subtitle">Accesos operativos del Santuario</div>
            </div>
          </div>

          <div className="fl-sanctuary-list fl-sanctuary-station-list">
            {visibleStationOverviewRows.map(row => (
              <div
                key={row.id}
                data-onboarding-target={row.onboardingTarget || undefined}
                className={[
                  "fl-sanctuary-row",
                  "fl-sanctuary-station-row",
                  row.locked ? "fl-sanctuary-row--locked" : "",
                  row.onboardingTarget ? "fl-sanctuary-row--spotlight" : "",
                ].filter(Boolean).join(" ")}
              >
                <div className="fl-sanctuary-row-icon" aria-hidden="true">
                  <FlIconFrame
                    size="lg"
                    asset={getStationAsset(row.id)}
                    kind="station"
                    fallbackIcon={getSanctuaryStationIcon(row.id)}
                    locked={row.locked}
                    className="fl-sanctuary-station-asset"
                  />
                </div>
                <div className="fl-sanctuary-row-body">
                  <div className="fl-sanctuary-row-title">{row.title}</div>
                  <div className="fl-sanctuary-row-detail">{row.detail}</div>
                </div>
                <div className="fl-sanctuary-row-actions fl-sanctuary-row-actions--station">
                  <span className={[
                    "fl-sanctuary-chip",
                    row.locked ? "fl-sanctuary-chip--danger" : "fl-sanctuary-chip--info",
                  ].join(" ")}
                  >
                    {row.status}
                  </span>
                  <FlButton
                    onClick={row.action || undefined}
                    disabled={!row.action}
                    variant="secondary"
                    size="sm"
                    className="fl-sanctuary-button fl-sanctuary-button--secondary"
                  >
                    {row.actionLabel}
                  </FlButton>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {infrastructureVisible && (
        <section className="fl-sanctuary-panel fl-sanctuary-panel--relics">
          <div className="fl-sanctuary-panel__header">
            <div>
              <div className="fl-sanctuary-panel__eyebrow">Arsenal de Reliquias</div>
              <div className="fl-sanctuary-panel__subtitle">
                Gestion de reliquias persistentes
              </div>
            </div>
            <div className="fl-sanctuary-header-actions">
              <span className="fl-sanctuary-chip fl-sanctuary-chip--danger">
                {relicCount} / {relicArmorySlots}
              </span>
              <span className={[
                "fl-sanctuary-chip",
                activeRelics?.weapon ? "fl-sanctuary-chip--success" : "",
              ].filter(Boolean).join(" ")}
              >
                Arma {activeRelics?.weapon ? "activa" : "vacia"}
              </span>
              <span className={[
                "fl-sanctuary-chip",
                activeRelics?.armor ? "fl-sanctuary-chip--success" : "",
              ].filter(Boolean).join(" ")}
              >
                Armadura {activeRelics?.armor ? "activa" : "vacia"}
              </span>
            </div>
          </div>

          {sortedRelicArmory.length === 0 ? (
            <div className="fl-sanctuary-empty-state">
              Aun no hay reliquias en el arsenal. Al extraer una pieza desde expedicion aparece aqui para activarla o extraerla.
            </div>
          ) : (
            <div className="fl-sanctuary-list fl-sanctuary-relic-list">
              {sortedRelicArmory.slice(0, relicArmorySlots).map(relic => {
                const slot = relic?.slot === "armor" ? "armor" : "weapon";
                const isActive = activeRelics?.[slot] === relic.id;
                const entropy = Math.max(0, Math.floor(Number(relic?.entropy || 0)));
                const stabilizePlan = calculateRelicEntropyStabilizePlan(relic);
                const availableSigilFlux = Math.max(0, Number(resources?.sigilFlux || 0));
                const availableRelicDust = Math.max(0, Number(resources?.relicDust || 0));
                const canStabilize =
                  stabilizePlan.entropyReduced > 0 &&
                  availableRelicDust >= stabilizePlan.relicDustCost &&
                  availableSigilFlux >= stabilizePlan.sigilFluxCost;
                return (
                  <div
                    key={relic.id}
                    className={[
                      "fl-sanctuary-row",
                      "fl-sanctuary-relic-row",
                      isActive ? "fl-sanctuary-row--active" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    <div className="fl-sanctuary-row-icon" aria-hidden="true">
                      <ForgeIcon name={slot === "armor" ? "armor" : "combat"} size={32} />
                    </div>
                    <div className="fl-sanctuary-row-body">
                      <div className="fl-sanctuary-row-title" {...{ style: { color: getRarityColor(relic?.rarity || "rare") } }}>
                        {relic?.name || "Reliquia"}
                      </div>
                      <div className="fl-sanctuary-row-detail">
                        {relic?.rarity || "rare"} · {slot === "armor" ? "armadura" : "arma"} · rating {Math.round(Number(relic?.rating || 0))} · entropy {entropy}
                      </div>
                    </div>
                    <div className="fl-sanctuary-row-actions fl-sanctuary-row-actions--relic">
                      <span className={[
                        "fl-sanctuary-chip",
                        isActive ? "fl-sanctuary-chip--success" : "fl-sanctuary-chip--danger",
                      ].join(" ")}
                      >
                        {isActive ? "Activa" : "Reserva"}
                      </span>
                      <button
                        onClick={() => !isActive && dispatch({ type: "SET_ACTIVE_RELIC", slot, relicId: relic.id })}
                        disabled={isActive}
                        className={[
                          "fl-sanctuary-button",
                          isActive ? "fl-sanctuary-button--secondary" : "fl-sanctuary-button--primary",
                        ].join(" ")}
                      >
                        {isActive ? "Activa" : "Equipar"}
                      </button>
                      <button
                        onClick={() => {
                          if (pendingRelicExtractId !== relic.id) {
                            setPendingRelicExtractId(relic.id);
                            return;
                          }
                          dispatch({ type: "DISCARD_RELIC", relicId: relic.id });
                          setPendingRelicExtractId(null);
                        }}
                        className={[
                          "fl-sanctuary-button",
                          pendingRelicExtractId === relic.id ? "fl-sanctuary-button--primary" : "fl-sanctuary-button--secondary",
                        ].join(" ")}
                      >
                        {pendingRelicExtractId === relic.id ? "Confirmar" : "Extraer"}
                      </button>
                      {stabilizePlan.entropyReduced > 0 && (
                        <button
                          onClick={() => canStabilize && dispatch({ type: "STABILIZE_RELIC_ENTROPY", relicId: relic.id })}
                          disabled={!canStabilize}
                          className={[
                            "fl-sanctuary-button",
                            canStabilize ? "fl-sanctuary-button--primary" : "fl-sanctuary-button--secondary",
                          ].join(" ")}
                          title={`Reduce ${stabilizePlan.entropyReduced} de entropia por ${stabilizePlan.relicDustCost} polvo y ${stabilizePlan.sigilFluxCost} flux`}
                        >
                          Estabilizar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {sortedRelicArmory.length > relicArmorySlots && (
                <div className="fl-sanctuary-list-note">
                  Mostrando {relicArmorySlots} de {sortedRelicArmory.length} reliquias.
                </div>
              )}
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
      {showSanctuaryForge && (
        <Suspense fallback={<OverlayLoadingFallback label="Forja" isMobile={isMobileViewport} />}>
          <SanctuaryForgeOverlay
            state={state}
            dispatch={dispatch}
            isMobile={isMobileViewport}
            onClose={() => {
              if (state?.combat?.reforgeSession) return;
              setShowSanctuaryForge(false);
            }}
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
      <ActionToast toast={actionToast} isMobile={isMobileViewport} />
    </div>
  );
}
