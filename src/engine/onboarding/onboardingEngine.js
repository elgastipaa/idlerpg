import { ITEMS } from "../../data/items";
import { RUN_SIGILS } from "../../data/runSigils";
import { PRESTIGE_TREE_NODES } from "../../data/prestige";
import { PLAYER_UPGRADES } from "../../data/playerUpgrades";
import { addToInventory } from "../inventory/inventoryEngine";
import { canPurchasePrestigeNode, isPrestigeNodeActiveForPlayer } from "../progression/prestigeEngine";
import { materializeItem } from "../../utils/loot";
import { buildExtractedItemRecord } from "../sanctuary/blueprintEngine";
import { getSigilInfusionRecipe } from "../sanctuary/jobEngine";
import { getTalentCostForPlayer } from "../talents/treeEngine";
import { getAvailableNodes, canUnlockNode } from "../talents/talentTreeEngine";
import { getStaticOnboardingStepCopy, getDynamicOnboardingStepCopy } from "./onboardingCopy";

export const ONBOARDING_STEPS = {
  CHOOSE_CLASS: "choose_class",
  EXPEDITION_INTRO: "expedition_intro",
  COMBAT_INTRO: "combat_intro",
  AUTO_ADVANCE: "auto_advance",
  FIRST_DEATH: "first_death",
  OPEN_HERO: "open_hero",
  CHOOSE_SPEC: "choose_spec",
  HERO_INTRO: "hero_intro",
  HERO_SKILLS_INTRO: "hero_skills_intro",
  SPEND_ATTRIBUTE: "spend_attribute",
  HERO_TALENTS_INTRO: "hero_talents_intro",
  TALENT_INTRO: "talent_intro",
  BUY_TALENT: "buy_talent",
  HERO_CHARACTER_INTRO: "hero_character_intro",
  COMBAT_AFTER_TALENT: "combat_after_talent",
  EQUIP_INTRO: "equip_intro",
  EQUIP_FIRST_ITEM: "equip_first_item",
  FIRST_BOSS: "first_boss",
  HUNT_INTRO: "hunt_intro",
  EXTRACTION_READY: "extraction_ready",
  EXTRACTION_SELECT_CARGO: "extraction_select_cargo",
  EXTRACTION_SELECT_ITEM: "extraction_select_item",
  EXTRACTION_CONFIRM: "extraction_confirm",
  FIRST_SANCTUARY_RETURN: "first_sanctuary_return",
  OPEN_LABORATORY: "open_laboratory",
  RESEARCH_DISTILLERY: "research_distillery",
  DISTILLERY_READY: "distillery_ready",
  RETURN_TO_SANCTUARY: "return_to_sanctuary",
  OPEN_DISTILLERY: "open_distillery",
  FIRST_DISTILLERY_JOB: "first_distillery_job",
  FIRST_ECHOES: "first_echoes",
  BUY_FIRST_ECHO_NODE: "buy_first_echo_node",
  FIRST_PRESTIGE_CLOSE: "first_prestige_close",
  BLUEPRINT_INTRO: "blueprint_intro",
  BLUEPRINT_DECISION: "blueprint_decision",
  FIRST_BLUEPRINT_MATERIALIZATION: "first_blueprint_materialization",
  DEEP_FORGE_READY: "deep_forge_ready",
  FIRST_DEEP_FORGE_USE: "first_deep_forge_use",
  LIBRARY_READY: "library_ready",
  FIRST_LIBRARY_RESEARCH: "first_library_research",
  ERRANDS_READY: "errands_ready",
  FIRST_ERRAND: "first_errand",
  SIGIL_ALTAR_READY: "sigil_altar_ready",
  FIRST_SIGIL_INFUSION: "first_sigil_infusion",
  ABYSS_PORTAL_READY: "abyss_portal_ready",
  TIER25_CAP: "tier25_cap",
  FIRST_ABYSS: "first_abyss",
};
const ONBOARDING_STEP_IDS = Object.freeze(Object.values(ONBOARDING_STEPS));
const ONBOARDING_STEP_ID_SET = new Set(ONBOARDING_STEP_IDS);

const STATIC_INFO_STEPS = new Set([
  ONBOARDING_STEPS.EXPEDITION_INTRO,
  ONBOARDING_STEPS.COMBAT_INTRO,
  ONBOARDING_STEPS.HERO_INTRO,
  ONBOARDING_STEPS.TALENT_INTRO,
  ONBOARDING_STEPS.COMBAT_AFTER_TALENT,
  ONBOARDING_STEPS.FIRST_BOSS,
  ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE,
  ONBOARDING_STEPS.BLUEPRINT_INTRO,
  ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION,
  ONBOARDING_STEPS.TIER25_CAP,
  ONBOARDING_STEPS.FIRST_ABYSS,
]);

const POST_ECHO_INFO_STEPS = new Set([
  ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE,
  ONBOARDING_STEPS.BLUEPRINT_INTRO,
  ONBOARDING_STEPS.BLUEPRINT_DECISION,
  ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION,
  ONBOARDING_STEPS.DEEP_FORGE_READY,
  ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE,
  ONBOARDING_STEPS.LIBRARY_READY,
  ONBOARDING_STEPS.FIRST_LIBRARY_RESEARCH,
  ONBOARDING_STEPS.ERRANDS_READY,
  ONBOARDING_STEPS.FIRST_ERRAND,
  ONBOARDING_STEPS.SIGIL_ALTAR_READY,
  ONBOARDING_STEPS.FIRST_SIGIL_INFUSION,
  ONBOARDING_STEPS.ABYSS_PORTAL_READY,
  ONBOARDING_STEPS.TIER25_CAP,
  ONBOARDING_STEPS.FIRST_ABYSS,
]);

const LAB_RESEARCH_STEP_TARGETS = {
  [ONBOARDING_STEPS.RESEARCH_DISTILLERY]: "unlock_distillery",
  [ONBOARDING_STEPS.DEEP_FORGE_READY]: "unlock_deep_forge",
  [ONBOARDING_STEPS.LIBRARY_READY]: "unlock_library",
  [ONBOARDING_STEPS.ERRANDS_READY]: "unlock_errands",
  [ONBOARDING_STEPS.SIGIL_ALTAR_READY]: "unlock_sigil_altar",
  [ONBOARDING_STEPS.ABYSS_PORTAL_READY]: "unlock_abyss_portal",
};
const ONBOARDING_INFO_TABS = ["registry", "account", "system", "stats", "achievements"];

const ONBOARDING_FIRST_TALENT_BY_CLASS = {
  warrior: "warrior_physical_training",
  mage: "mage_arcane_power",
};

const BASE_ONBOARDING_FLAGS = {
  classChosen: false,
  expeditionIntroSeen: false,
  combatIntroSeen: false,
  autoAdvanceUnlocked: false,
  firstDeathSeen: false,
  heroTabUnlocked: false,
  specChosen: false,
  heroIntroSeen: false,
  firstAttributeSpent: false,
  firstTalentBought: false,
  inventoryUnlocked: false,
  firstItemEquipped: false,
  firstBossSeen: false,
  huntUnlocked: false,
  extractionUnlocked: false,
  firstExtractionCompleted: false,
  firstSanctuaryReturnSeen: false,
  laboratoryUnlocked: false,
  distilleryUnlocked: false,
  distilleryJobStarted: false,
  blueprintDecisionUnlocked: false,
  firstEchoesSeen: false,
  firstEchoTabOpened: false,
  firstEchoNodeBought: false,
  firstPrestigeCloseSeen: false,
  blueprintScrapped: false,
  blueprintConverted: false,
  firstBlueprintMaterializationSeen: false,
  deepForgeReadySeen: false,
  firstDeepForgeUseSeen: false,
  libraryReadySeen: false,
  firstLibraryResearchSeen: false,
  errandsReadySeen: false,
  firstErrandSeen: false,
  sigilAltarReadySeen: false,
  firstSigilInfusionSeen: false,
  abyssPortalReadySeen: false,
  tier25CapSeen: false,
  firstAbyssSeen: false,
};
const COMPLETED_BEAT_FLAG_MAP = {
  expeditionIntroSeen: [ONBOARDING_STEPS.EXPEDITION_INTRO],
  classChosen: [ONBOARDING_STEPS.CHOOSE_CLASS],
  combatIntroSeen: [ONBOARDING_STEPS.COMBAT_INTRO],
  autoAdvanceUnlocked: [ONBOARDING_STEPS.AUTO_ADVANCE],
  heroTabUnlocked: [ONBOARDING_STEPS.OPEN_HERO],
  heroIntroSeen: [ONBOARDING_STEPS.HERO_INTRO],
  firstAttributeSpent: [ONBOARDING_STEPS.HERO_SKILLS_INTRO, ONBOARDING_STEPS.SPEND_ATTRIBUTE],
  firstTalentBought: [ONBOARDING_STEPS.HERO_TALENTS_INTRO, ONBOARDING_STEPS.TALENT_INTRO, ONBOARDING_STEPS.BUY_TALENT],
  specChosen: [ONBOARDING_STEPS.HERO_CHARACTER_INTRO, ONBOARDING_STEPS.CHOOSE_SPEC, ONBOARDING_STEPS.COMBAT_AFTER_TALENT],
  inventoryUnlocked: [ONBOARDING_STEPS.EQUIP_INTRO],
  firstItemEquipped: [ONBOARDING_STEPS.EQUIP_FIRST_ITEM],
  firstBossSeen: [ONBOARDING_STEPS.FIRST_BOSS],
  huntUnlocked: [ONBOARDING_STEPS.HUNT_INTRO],
  extractionUnlocked: [ONBOARDING_STEPS.EXTRACTION_READY],
  firstExtractionCompleted: [
    ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO,
    ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM,
    ONBOARDING_STEPS.EXTRACTION_CONFIRM,
  ],
  firstSanctuaryReturnSeen: [ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN],
  laboratoryUnlocked: [ONBOARDING_STEPS.OPEN_LABORATORY],
  distilleryUnlocked: [
    ONBOARDING_STEPS.RESEARCH_DISTILLERY,
    ONBOARDING_STEPS.DISTILLERY_READY,
    ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
    ONBOARDING_STEPS.OPEN_DISTILLERY,
  ],
  distilleryJobStarted: [ONBOARDING_STEPS.FIRST_DISTILLERY_JOB],
  firstEchoesSeen: [ONBOARDING_STEPS.FIRST_ECHOES],
  firstEchoNodeBought: [ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE],
  firstPrestigeCloseSeen: [ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE],
  blueprintDecisionUnlocked: [ONBOARDING_STEPS.BLUEPRINT_INTRO],
  blueprintScrapped: [ONBOARDING_STEPS.BLUEPRINT_DECISION],
  blueprintConverted: [ONBOARDING_STEPS.BLUEPRINT_DECISION],
  firstBlueprintMaterializationSeen: [ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION],
  deepForgeReadySeen: [ONBOARDING_STEPS.DEEP_FORGE_READY],
  firstDeepForgeUseSeen: [ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE],
  libraryReadySeen: [ONBOARDING_STEPS.LIBRARY_READY],
  firstLibraryResearchSeen: [ONBOARDING_STEPS.FIRST_LIBRARY_RESEARCH],
  errandsReadySeen: [ONBOARDING_STEPS.ERRANDS_READY],
  firstErrandSeen: [ONBOARDING_STEPS.FIRST_ERRAND],
  sigilAltarReadySeen: [ONBOARDING_STEPS.SIGIL_ALTAR_READY],
  firstSigilInfusionSeen: [ONBOARDING_STEPS.FIRST_SIGIL_INFUSION],
  abyssPortalReadySeen: [ONBOARDING_STEPS.ABYSS_PORTAL_READY],
  tier25CapSeen: [ONBOARDING_STEPS.TIER25_CAP],
  firstAbyssSeen: [ONBOARDING_STEPS.FIRST_ABYSS],
};

function isKnownOnboardingStep(step = null) {
  return typeof step === "string" && ONBOARDING_STEP_ID_SET.has(step);
}

function createCompletedBeatsRecord(input = null) {
  const completedBeats = {};
  if (!input) return completedBeats;

  if (Array.isArray(input)) {
    input.forEach(step => {
      if (isKnownOnboardingStep(step)) completedBeats[step] = true;
    });
    return completedBeats;
  }

  if (typeof input === "object") {
    Object.entries(input).forEach(([step, value]) => {
      if (value && isKnownOnboardingStep(step)) completedBeats[step] = true;
    });
  }
  return completedBeats;
}

function mergeCompletedBeats(...records) {
  return records.reduce(
    (merged, record) => ({ ...merged, ...createCompletedBeatsRecord(record) }),
    {}
  );
}

function markOnboardingStepCompleted(completedBeats = {}, step = null) {
  if (!isKnownOnboardingStep(step)) return createCompletedBeatsRecord(completedBeats);
  return {
    ...createCompletedBeatsRecord(completedBeats),
    [step]: true,
  };
}

function markAllOnboardingStepsCompleted(completedBeats = {}) {
  return ONBOARDING_STEP_IDS.reduce(
    (record, stepId) => ({ ...record, [stepId]: true }),
    createCompletedBeatsRecord(completedBeats)
  );
}

function buildCompletedBeatsFromFlags(flags = {}) {
  const completedFromFlags = {};
  Object.entries(COMPLETED_BEAT_FLAG_MAP).forEach(([flag, steps]) => {
    if (!flags?.[flag]) return;
    steps.forEach(stepId => {
      if (isKnownOnboardingStep(stepId)) completedFromFlags[stepId] = true;
    });
  });
  return completedFromFlags;
}

export function createEmptyOnboardingState() {
  return {
    completed: false,
    step: ONBOARDING_STEPS.EXPEDITION_INTRO,
    flags: { ...BASE_ONBOARDING_FLAGS },
    completedBeats: {},
    equipKillTarget: null,
    bossHeroDelayTicks: 0,
    bossHeroQueued: false,
    extractionReadyDelayTicks: 0,
  };
}

export function normalizeOnboardingState(onboarding = {}) {
  const hasExplicitStep =
    onboarding != null && Object.prototype.hasOwnProperty.call(onboarding, "step");
  const normalizedStep = onboarding?.completed
    ? null
    : hasExplicitStep
      ? (onboarding.step === undefined ? ONBOARDING_STEPS.EXPEDITION_INTRO : onboarding.step)
      : ONBOARDING_STEPS.EXPEDITION_INTRO;

  const normalizedFlags = {
    ...BASE_ONBOARDING_FLAGS,
    ...(onboarding?.flags || {}),
  };
  normalizedFlags.firstSanctuaryReturnSeen = Boolean(
    normalizedFlags.firstSanctuaryReturnSeen ||
    normalizedFlags.distilleryUnlocked ||
    normalizedFlags.distilleryJobStarted ||
    normalizedFlags.firstEchoesSeen
  );
  let normalizedCompletedBeats = mergeCompletedBeats(
    onboarding?.completedBeats,
    buildCompletedBeatsFromFlags(normalizedFlags)
  );
  if (onboarding?.completed) {
    normalizedCompletedBeats = markAllOnboardingStepsCompleted(normalizedCompletedBeats);
  }

  return {
    ...createEmptyOnboardingState(),
    ...(onboarding || {}),
    completed: Boolean(onboarding?.completed),
    step: normalizedStep,
    flags: {
      ...normalizedFlags,
    },
    completedBeats: normalizedCompletedBeats,
    equipKillTarget:
      onboarding?.equipKillTarget == null
        ? null
        : Math.max(0, Math.floor(Number(onboarding.equipKillTarget || 0))),
    bossHeroDelayTicks: Math.max(0, Math.floor(Number(onboarding?.bossHeroDelayTicks || 0))),
    bossHeroQueued: Boolean(onboarding?.bossHeroQueued),
    extractionReadyDelayTicks: Math.max(0, Math.floor(Number(onboarding?.extractionReadyDelayTicks || 0))),
  };
}

export function trackOnboardingCompletedBeats(previousOnboarding = {}, nextOnboarding = {}) {
  const previous = normalizeOnboardingState(previousOnboarding);
  const next = normalizeOnboardingState(nextOnboarding);
  let completedBeats = mergeCompletedBeats(previous.completedBeats, next.completedBeats);
  if (previous.step && (next.step !== previous.step || next.completed)) {
    completedBeats = markOnboardingStepCompleted(completedBeats, previous.step);
  }
  if (next.completed) {
    completedBeats = markAllOnboardingStepsCompleted(completedBeats);
  }
  return {
    ...next,
    completedBeats,
  };
}

export function isOnboardingBlocking(state = {}) {
  return Boolean(state?.onboarding?.step && !state?.onboarding?.completed);
}

export function shouldShowHeroPrimaryTab(state = {}) {
  const heroFlags = state?.onboarding?.flags || {};
  return (
    Boolean(state?.player?.specialization) ||
    Boolean(
      heroFlags?.heroTabUnlocked ||
      heroFlags?.heroIntroSeen ||
      heroFlags?.firstAttributeSpent ||
      heroFlags?.firstTalentBought ||
      heroFlags?.specChosen
    ) ||
    state?.currentTab === "character" ||
    state?.currentTab === "skills" ||
    state?.currentTab === "talents"
  );
}

export function canOpenExpedition(state = {}) {
  return Boolean(state?.player?.class);
}

export function isSanctuaryLockedDuringExpeditionTutorial(state = {}) {
  if (state?.onboarding?.completed) return false;
  if (!state?.player?.class) return false;
  return !Boolean(state?.onboarding?.flags?.firstExtractionCompleted);
}

export function shouldShowOnboardingSpotlightDuringInfoStep(step = null, state = {}) {
  if (step !== ONBOARDING_STEPS.DISTILLERY_READY) return false;
  const distilleryResearchPhase = getDistilleryResearchOnboardingPhase(state);
  return distilleryResearchPhase === "running" || distilleryResearchPhase === "claimable";
}

function getDistilleryResearchOnboardingPhase(state = {}) {
  const laboratoryJobs = Array.isArray(state?.sanctuary?.jobs) ? state.sanctuary.jobs : [];
  const now = Number(state?.__liveNow || Date.now());
  const job = laboratoryJobs.find(candidate =>
    candidate?.station === "laboratory" &&
    candidate?.input?.researchId === "unlock_distillery" &&
    (candidate?.status === "running" || candidate?.status === "claimable")
  );
  if (!job) return "none";
  if (job?.status === "claimable") return "claimable";
  return Number(job?.endsAt || 0) <= now ? "claimable" : "running";
}

export function getEffectiveOnboardingStep(step = null, state = {}) {
  if (step === ONBOARDING_STEPS.FIRST_DEATH) {
    return null;
  }
  const distilleryUnlocked = Boolean(
    state?.onboarding?.flags?.distilleryUnlocked ||
    state?.sanctuary?.stations?.distillery?.unlocked
  );
  if (
    !distilleryUnlocked &&
    [
      ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
      ONBOARDING_STEPS.OPEN_DISTILLERY,
      ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
    ].includes(step) &&
    ["running", "claimable"].includes(getDistilleryResearchOnboardingPhase(state))
  ) {
    return ONBOARDING_STEPS.DISTILLERY_READY;
  }
  return step;
}

export function shouldSyncSanctuaryJobsDuringOnboarding(state = {}) {
  const onboarding = state?.onboarding || {};
  if (onboarding?.completed) return true;
  if (!onboarding?.step) return true;

  const effectiveStep = getEffectiveOnboardingStep(onboarding.step, state);
  return [
    ONBOARDING_STEPS.DISTILLERY_READY,
    ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
    ONBOARDING_STEPS.OPEN_DISTILLERY,
    ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
  ].includes(effectiveStep);
}

export function isInventorySubviewUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.inventoryUnlocked) return true;
  return [ONBOARDING_STEPS.EQUIP_INTRO, ONBOARDING_STEPS.EQUIP_FIRST_ITEM].includes(state?.onboarding?.step);
}

export function isFieldForgeUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.firstBossSeen) return true;
  return false;
}

export function isAutoAdvanceUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.autoAdvanceUnlocked) return true;
  return state?.onboarding?.step === ONBOARDING_STEPS.AUTO_ADVANCE;
}

export function isHuntUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.step === ONBOARDING_STEPS.HUNT_INTRO) return true;
  if (state?.onboarding?.flags?.huntUnlocked) return true;
  return false;
}

export function isExtractionUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_READY) return true;
  if (state?.onboarding?.flags?.extractionUnlocked) {
    return (
      Boolean(state?.onboarding?.flags?.firstBossSeen) &&
      Math.max(
        1,
        Number(state?.combat?.maxTier || 1),
        Number(state?.combat?.currentTier || 1)
      ) >= 6
    );
  }
  return false;
}

export function isLaboratoryUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.laboratoryUnlocked) return true;
  return false;
}

export function isDistilleryUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.distilleryUnlocked) return true;
  return false;
}

export function getOnboardingTutorialBundleId(state = {}) {
  const cargoInventory = Array.isArray(state?.sanctuary?.cargoInventory) ? state.sanctuary.cargoInventory : [];
  return cargoInventory[0]?.id || "tutorial_distillery_bundle";
}

export function getOnboardingTutorialExtractedItemId(state = {}) {
  const extractedItems = Array.isArray(state?.sanctuary?.extractedItems) ? state.sanctuary.extractedItems : [];
  return extractedItems[0]?.id || null;
}

export function getOnboardingTutorialDeepForgeProjectId(state = {}) {
  const stash = Array.isArray(state?.sanctuary?.stash) ? state.sanctuary.stash : [];
  return stash[0]?.id || null;
}

export function isBlueprintDecisionUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.blueprintDecisionUnlocked) return true;
  return Number(state?.prestige?.level || 0) >= 2;
}

function hasAvailableErrandSlot(state = {}) {
  const jobs = Array.isArray(state?.sanctuary?.jobs) ? state.sanctuary.jobs : [];
  const runningErrands = jobs.filter(job => job?.station === "errands" && job?.status === "running").length;
  const errandSlots = Math.max(1, Number(state?.sanctuary?.stations?.errands?.slots || 2));
  return runningErrands < errandSlots;
}

function hasAvailableSigilInfusion(state = {}) {
  const jobs = Array.isArray(state?.sanctuary?.jobs) ? state.sanctuary.jobs : [];
  const runningInfusions = jobs.filter(job => job?.station === "sigilInfusion" && job?.status === "running").length;
  const infusionSlots = Math.max(1, Number(state?.sanctuary?.stations?.sigilInfusion?.slots || 1));
  if (runningInfusions >= infusionSlots) return false;
  const sigilFlux = Math.max(0, Number(state?.sanctuary?.resources?.sigilFlux || 0));
  return RUN_SIGILS.some(sigil => sigilFlux >= Math.max(1, Number(getSigilInfusionRecipe(sigil.id)?.fuelCost || 0)));
}

export function getOnboardingRequiredTab(step = null) {
  switch (step) {
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
    case ONBOARDING_STEPS.CHOOSE_CLASS:
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
    case ONBOARDING_STEPS.OPEN_LABORATORY:
    case ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO:
    case ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM:
    case ONBOARDING_STEPS.EXTRACTION_CONFIRM:
    case ONBOARDING_STEPS.RESEARCH_DISTILLERY:
    case ONBOARDING_STEPS.DISTILLERY_READY:
    case ONBOARDING_STEPS.RETURN_TO_SANCTUARY:
    case ONBOARDING_STEPS.OPEN_DISTILLERY:
    case ONBOARDING_STEPS.FIRST_DISTILLERY_JOB:
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
    case ONBOARDING_STEPS.BLUEPRINT_DECISION:
    case ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION:
    case ONBOARDING_STEPS.DEEP_FORGE_READY:
    case ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE:
    case ONBOARDING_STEPS.LIBRARY_READY:
    case ONBOARDING_STEPS.FIRST_LIBRARY_RESEARCH:
    case ONBOARDING_STEPS.ERRANDS_READY:
    case ONBOARDING_STEPS.FIRST_ERRAND:
    case ONBOARDING_STEPS.SIGIL_ALTAR_READY:
    case ONBOARDING_STEPS.FIRST_SIGIL_INFUSION:
    case ONBOARDING_STEPS.ABYSS_PORTAL_READY:
      return "sanctuary";
    case ONBOARDING_STEPS.CHOOSE_SPEC:
    case ONBOARDING_STEPS.HERO_INTRO:
    case ONBOARDING_STEPS.HERO_SKILLS_INTRO:
    case ONBOARDING_STEPS.HERO_TALENTS_INTRO:
    case ONBOARDING_STEPS.HERO_CHARACTER_INTRO:
      return "character";
    case ONBOARDING_STEPS.SPEND_ATTRIBUTE:
      return "skills";
    case ONBOARDING_STEPS.TALENT_INTRO:
    case ONBOARDING_STEPS.BUY_TALENT:
      return "talents";
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return "inventory";
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
    case ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE:
      return "prestige";
    case ONBOARDING_STEPS.COMBAT_INTRO:
    case ONBOARDING_STEPS.AUTO_ADVANCE:
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
    case ONBOARDING_STEPS.EQUIP_INTRO:
    case ONBOARDING_STEPS.FIRST_BOSS:
    case ONBOARDING_STEPS.HUNT_INTRO:
    case ONBOARDING_STEPS.EXTRACTION_READY:
    case ONBOARDING_STEPS.TIER25_CAP:
    case ONBOARDING_STEPS.FIRST_ABYSS:
      return "combat";
    default:
      return null;
  }
}

export function isOnboardingTabAllowed(step = null, tab = "sanctuary") {
  if (!step) return true;
  if (ONBOARDING_INFO_TABS.includes(tab)) return true;
  const requiredTab = getOnboardingRequiredTab(step);
  if (!requiredTab) return true;
  if (requiredTab === tab) return true;
  if (requiredTab === "character" && ["character", "skills", "talents"].includes(tab)) return true;
  if (requiredTab === "combat" && ["combat", "inventory", "crafting", "codex"].includes(tab)) return true;
  return false;
}

function formatOnboardingTabLabel(tab = null) {
  switch (tab) {
    case "sanctuary":
      return "Santuario";
    case "combat":
      return "Expedicion";
    case "character":
      return "Heroe";
    case "skills":
      return "Atributos";
    case "talents":
      return "Talentos";
    case "inventory":
      return "Mochila";
    case "prestige":
      return "Ecos";
    case "codex":
      return "Intel";
    case "crafting":
      return "Forja";
    case "registry":
      return "Mas";
    default:
      return "la seccion requerida";
  }
}

export function getOnboardingTabBlockMeta(step = null, tab = "sanctuary", state = {}) {
  const effectiveStep = getEffectiveOnboardingStep(step, state);
  if (!effectiveStep) {
    return {
      blocked: false,
      reasonCode: null,
      message: null,
      requiredTab: null,
      step: null,
    };
  }

  const normalizedTab = tab || "sanctuary";
  const requiredTab = getOnboardingRequiredTab(effectiveStep);
  const interactionMode = getOnboardingStepInteractionMode(effectiveStep, state);

  const blockedResponse = (reasonCode, message) => ({
    blocked: true,
    reasonCode,
    message,
    requiredTab,
    step: effectiveStep,
  });

  if (interactionMode === "forced" && ONBOARDING_INFO_TABS.includes(normalizedTab)) {
    const requiredLabel = formatOnboardingTabLabel(requiredTab);
    return blockedResponse(
      "forced_step_no_info_tabs",
      `Completa este paso primero en ${requiredLabel}.`
    );
  }

  if (
    effectiveStep === ONBOARDING_STEPS.OPEN_HERO &&
    !["character", "skills", "talents"].includes(normalizedTab)
  ) {
    return blockedResponse(
      "hero_open_required",
      "Primero abre Heroe para continuar el tutorial."
    );
  }

  if (effectiveStep === ONBOARDING_STEPS.HERO_SKILLS_INTRO && normalizedTab !== "skills") {
    return blockedResponse(
      "hero_skills_required",
      "Completa este paso en Atributos."
    );
  }

  if (effectiveStep === ONBOARDING_STEPS.HERO_TALENTS_INTRO && normalizedTab !== "talents") {
    return blockedResponse(
      "hero_talents_required",
      "Completa este paso en Talentos."
    );
  }

  if (effectiveStep === ONBOARDING_STEPS.HERO_CHARACTER_INTRO && normalizedTab !== "character") {
    return blockedResponse(
      "hero_character_required",
      "Completa este paso en Heroe."
    );
  }

  if (!isOnboardingTabAllowed(effectiveStep, normalizedTab)) {
    const requiredLabel = formatOnboardingTabLabel(requiredTab);
    return blockedResponse(
      "required_tab",
      `Completa este paso primero en ${requiredLabel}.`
    );
  }

  return {
    blocked: false,
    reasonCode: null,
    message: null,
    requiredTab,
    step: effectiveStep,
  };
}

export function getOnboardingResearchTargetId(step = null) {
  return LAB_RESEARCH_STEP_TARGETS[step] || null;
}

export function getOnboardingFirstEchoNodeId(state = {}) {
  const purchasableNodes = PRESTIGE_TREE_NODES.filter(node => canPurchasePrestigeNode(state, node).ok);
  const activeBuildNode = purchasableNodes.find(node => isPrestigeNodeActiveForPlayer(node, state?.player || {}));
  return (activeBuildNode || purchasableNodes[0] || null)?.id || null;
}

export function getOnboardingTutorialTalentNodeId(state = {}) {
  const classId = state?.player?.class || null;
  return ONBOARDING_FIRST_TALENT_BY_CLASS[classId] || null;
}

export function getResolvedOnboardingTutorialTalentNodeId(state = {}) {
  const tutorialTalentNodeId = getOnboardingTutorialTalentNodeId(state);
  if (tutorialTalentNodeId && canUnlockNode(state, tutorialTalentNodeId)) {
    return tutorialTalentNodeId;
  }
  return getAvailableNodes(state)[0] || tutorialTalentNodeId || null;
}

function ensureTutorialTalentPoints(nextState) {
  const tutorialTalentNodeId = getResolvedOnboardingTutorialTalentNodeId(nextState);
  if (!tutorialTalentNodeId) return nextState;
  const requiredTalentPoints = Math.max(
    1,
    Number(getTalentCostForPlayer(nextState, tutorialTalentNodeId) || 1)
  );
  if (Number(nextState?.player?.talentPoints || 0) >= requiredTalentPoints) return nextState;
  return {
    ...nextState,
    player: {
      ...nextState.player,
      talentPoints: requiredTalentPoints,
    },
  };
}

export function getOnboardingStepInteractionMode(step = null, state = {}) {
  if (!step) return "forced";

  if (step === ONBOARDING_STEPS.HUNT_INTRO) {
    return state?.currentTab === "codex" ? "info" : "forced";
  }

  if (step === ONBOARDING_STEPS.DISTILLERY_READY) {
    return "forced";
  }

  if (step === ONBOARDING_STEPS.FIRST_ECHOES) {
    return state?.currentTab === "prestige" ? "info" : "forced";
  }

  if (step === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN) {
    return "info";
  }

  if (step === ONBOARDING_STEPS.OPEN_LABORATORY) {
    return "forced";
  }

  if (POST_ECHO_INFO_STEPS.has(step)) {
    return "info";
  }

  return STATIC_INFO_STEPS.has(step) ? "info" : "forced";
}

export function shouldShowOnboardingGlossaryHint(step = null) {
  return POST_ECHO_INFO_STEPS.has(step);
}

export function isPostEchoOnboardingStep(step = null) {
  return POST_ECHO_INFO_STEPS.has(step);
}

export function getOnboardingStepMeta(step = null, state = {}) {
  if (!step) return null;

  if (step === ONBOARDING_STEPS.HUNT_INTRO) {
    const variant = state?.currentTab === "codex" ? "codex" : "default";
    return getDynamicOnboardingStepCopy(step, variant);
  }

  if (step === ONBOARDING_STEPS.DISTILLERY_READY) {
    const phase = getDistilleryResearchOnboardingPhase(state);
    const variant = phase === "running" || phase === "claimable" ? phase : "default";
    return getDynamicOnboardingStepCopy(step, variant);
  }

  if (step === ONBOARDING_STEPS.FIRST_ECHOES) {
    const variant = state?.currentTab === "prestige" ? "prestige" : "default";
    return getDynamicOnboardingStepCopy(step, variant);
  }

  return getStaticOnboardingStepCopy(step);
}

function countUpgradeLevels(player = {}) {
  return Object.values(player?.upgrades || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function countUnlockedTalents(player = {}) {
  return Array.isArray(player?.unlockedTalents) ? player.unlockedTalents.length : 0;
}

function createTutorialEquipment(state = {}) {
  const slot = state?.player?.equipment?.weapon ? "armor" : "weapon";
  const currentTier = Math.max(1, Number(state?.combat?.currentTier || 1));
  const baseItem =
    ITEMS.find(item => item.rarity === "common" && item.type === slot) ||
    ITEMS.find(item => item.type === slot) ||
    null;
  if (!baseItem) return null;
  return materializeItem({
    baseItem,
    rarity: baseItem.rarity || "common",
    tier: currentTier,
  });
}

function injectTutorialEquipment(nextState) {
  if ((nextState?.player?.inventory || []).length > 0) return nextState;
  const tutorialItem = createTutorialEquipment(nextState);
  if (!tutorialItem) return nextState;
  const result = addToInventory(nextState.player?.inventory || [], tutorialItem);
  return {
    ...nextState,
    player: {
      ...nextState.player,
      inventory: result.inventory,
    },
    combat: {
      ...nextState.combat,
      log: [
        ...(nextState?.combat?.log || []),
        "TUTORIAL: el Santuario recupera una pieza basica para que aprendas a equiparte.",
      ].slice(-20),
    },
  };
}

function getStrengthTutorialGold(player = {}) {
  const strengthUpgrade = PLAYER_UPGRADES.find(upgrade => upgrade.id === "damage");
  if (!strengthUpgrade) return 300;
  const currentLevel = Math.max(0, Number(player?.upgrades?.damage || 0));
  const nextCost = Math.floor(
    strengthUpgrade.baseCost * Math.pow(strengthUpgrade.costMultiplier, currentLevel)
  );
  return Math.max(300, nextCost + 20);
}

function createTutorialCargoBundle() {
  return {
    id: "tutorial_distillery_bundle",
    type: "essence_cache",
    label: "Lote de prueba",
    description: "Bundle generico del tutorial para aprender la primera destilacion.",
    quantity: 1,
  };
}

export function ensureTutorialCargoBundle(nextState) {
  const cargoInventory = Array.isArray(nextState?.sanctuary?.cargoInventory) ? nextState.sanctuary.cargoInventory : [];
  if (cargoInventory.length > 0) return nextState;
  return {
    ...nextState,
    sanctuary: {
      ...nextState.sanctuary,
      cargoInventory: [createTutorialCargoBundle()],
    },
  };
}

function createTutorialExtractedItem(nextState, slot = "weapon") {
  const currentTier = Math.max(6, Number(nextState?.combat?.maxTier || nextState?.combat?.currentTier || 6));
  const baseItem =
    ITEMS.find(item => item.type === slot && item.rarity === "rare") ||
    ITEMS.find(item => item.type === slot) ||
    null;
  if (!baseItem) return null;
  const materialized = materializeItem({
    baseItem,
    rarity: baseItem.rarity || "rare",
    tier: currentTier,
  });
  return buildExtractedItemRecord(materialized, { source: "tutorial" });
}

function ensureTutorialBlueprintItems(nextState) {
  const extractedItems = Array.isArray(nextState?.sanctuary?.extractedItems) ? nextState.sanctuary.extractedItems : [];
  if (extractedItems.length >= 2) return nextState;
  const nextExtractedItems = [...extractedItems];
  const needed = 2 - nextExtractedItems.length;
  for (let index = 0; index < needed; index += 1) {
    const slot = nextExtractedItems.some(item => item?.type === "weapon") ? "armor" : "weapon";
    const tutorialItem = createTutorialExtractedItem(nextState, slot);
    if (tutorialItem) nextExtractedItems.push(tutorialItem);
  }
  return {
    ...nextState,
    sanctuary: {
      ...nextState.sanctuary,
      extractedItems: nextExtractedItems,
    },
  };
}

function ensureTutorialDeepForgeProject(nextState) {
  const stash = Array.isArray(nextState?.sanctuary?.stash) ? nextState.sanctuary.stash : [];
  if (stash.length > 0) return nextState;
  const baseItem =
    ITEMS.find(item => item.type === "weapon" && item.rarity === "rare") ||
    ITEMS.find(item => item.type === "weapon") ||
    null;
  if (!baseItem) return nextState;
  const tutorialItem = materializeItem({
    baseItem,
    rarity: baseItem.rarity || "rare",
    tier: Math.max(10, Number(nextState?.combat?.maxTier || nextState?.combat?.currentTier || 10)),
  });
  const tutorialProject = {
    id: `project_tutorial_${tutorialItem.id}`,
    sourceItemId: tutorialItem.id,
    name: tutorialItem.name,
    rarity: tutorialItem.rarity,
    type: tutorialItem.type,
    baseType: tutorialItem.baseType || tutorialItem.subtype || tutorialItem.type,
    rating: tutorialItem.rating || 0,
    baseRating: tutorialItem.rating || 0,
    affixes: Array.isArray(tutorialItem.affixes) ? tutorialItem.affixes.map(affix => ({ ...affix })) : [],
    baseAffixes: Array.isArray(tutorialItem.affixes) ? tutorialItem.affixes.map(affix => ({ ...affix })) : [],
    legendaryPowerId: tutorialItem.legendaryPowerId || null,
    projectTier: 0,
    upgradeLevel: 0,
    upgradeCap: 15,
    ascensionTier: 0,
    powerTier: tutorialItem.legendaryPowerId ? 1 : 0,
    createdAt: Date.now(),
    sourceMeta: { source: "tutorial" },
  };
  if (!tutorialProject) return nextState;
  return {
    ...nextState,
    sanctuary: {
      ...nextState.sanctuary,
      stash: [tutorialProject],
    },
  };
}

function withNextStep(nextState, onboarding, step, extra = {}) {
  return {
    ...nextState,
    currentTab: extra.currentTab ?? nextState.currentTab,
    player: extra.player ?? nextState.player,
    onboarding: {
      ...onboarding,
      ...extra.onboarding,
      step,
      bossHeroDelayTicks:
        extra.onboarding?.bossHeroDelayTicks == null
          ? onboarding?.bossHeroDelayTicks || 0
          : extra.onboarding.bossHeroDelayTicks,
    },
  };
}

export function getBlockedOnboardingAction(step = null, action = {}, state = {}) {
  const type = action?.type;
  const effectiveStep = getEffectiveOnboardingStep(step, state);
  const interactionMode = getOnboardingStepInteractionMode(effectiveStep, state);
  if (!step) return false;
  const distilleryCorridorStep = [
    ONBOARDING_STEPS.DISTILLERY_READY,
    ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
    ONBOARDING_STEPS.OPEN_DISTILLERY,
    ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
  ].includes(effectiveStep);
  if (
    distilleryCorridorStep &&
    ["CLAIM_SANCTUARY_JOB", "CLOSE_LABORATORY", "OPEN_DISTILLERY", "START_DISTILLERY_JOB", "START_TUTORIAL_DISTILLERY_JOB"].includes(type)
  ) {
    return false;
  }
  const requiredTab = getOnboardingRequiredTab(effectiveStep);
  if (type === "TOGGLE_THEME" || type === "SET_THEME") return false;
  if (type === "ACK_ONBOARDING_STEP") return false;
  if (type === "RESET_ALL_PROGRESS") return false;
  if (type === "SYNC_SANCTUARY_JOBS") {
    return !shouldSyncSanctuaryJobsDuringOnboarding(state);
  }
  if (
    requiredTab === "sanctuary" &&
    ["ENTER_EXPEDITION_SETUP", "SELECT_RUN_SIGIL", "START_RUN"].includes(type)
  ) {
    return true;
  }
  if (type === "SET_TAB") {
    return getOnboardingTabBlockMeta(step, action?.tab || "sanctuary", state).blocked;
  }

  switch (effectiveStep) {
    case ONBOARDING_STEPS.CHOOSE_CLASS:
      return type !== "SELECT_CLASS";
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.COMBAT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.AUTO_ADVANCE:
      return type !== "TOGGLE_AUTO_ADVANCE";
    case ONBOARDING_STEPS.CHOOSE_SPEC:
      return type !== "SELECT_SPECIALIZATION";
    case ONBOARDING_STEPS.HERO_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.SPEND_ATTRIBUTE:
      return !(type === "UPGRADE_PLAYER" && action?.upgradeId === "damage");
    case ONBOARDING_STEPS.TALENT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.BUY_TALENT:
      return type !== "UPGRADE_TALENT_NODE" && type !== "UNLOCK_TALENT";
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.EQUIP_INTRO:
      return !(type === "SET_TAB" && action?.tab === "inventory");
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return type !== "EQUIP_ITEM";
    case ONBOARDING_STEPS.FIRST_BOSS:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.HUNT_INTRO:
      return !(type === "SET_TAB" && action?.tab === "codex") && type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.EXTRACTION_READY:
      return type !== "OPEN_EXTRACTION";
    case ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO:
      return type !== "SELECT_EXTRACTION_CARGO";
    case ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM:
      return type !== "SELECT_EXTRACTION_PROJECT";
    case ONBOARDING_STEPS.EXTRACTION_CONFIRM:
      return type !== "CONFIRM_EXTRACTION";
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.OPEN_LABORATORY:
      return type !== "OPEN_LABORATORY";
    case ONBOARDING_STEPS.RESEARCH_DISTILLERY: {
      const researchId = action?.researchId || action?.payload?.researchId || "";
      return !(type === "START_LAB_RESEARCH" && researchId === "unlock_distillery");
    }
    case ONBOARDING_STEPS.DISTILLERY_READY:
      return type !== "CLAIM_SANCTUARY_JOB";
    case ONBOARDING_STEPS.RETURN_TO_SANCTUARY:
      return type !== "CLOSE_LABORATORY" && type !== "CLAIM_SANCTUARY_JOB";
    case ONBOARDING_STEPS.OPEN_DISTILLERY:
      return type !== "OPEN_DISTILLERY" && type !== "CLAIM_SANCTUARY_JOB" && type !== "START_DISTILLERY_JOB" && type !== "START_TUTORIAL_DISTILLERY_JOB";
    case ONBOARDING_STEPS.FIRST_DISTILLERY_JOB:
      return type !== "START_DISTILLERY_JOB" && type !== "START_TUTORIAL_DISTILLERY_JOB";
    case ONBOARDING_STEPS.FIRST_ECHOES:
      if (interactionMode === "info") {
        return type !== "ACK_ONBOARDING_STEP";
      }
      return !(type === "SET_TAB" && action?.tab === "prestige");
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
      return type !== "BUY_PRESTIGE_NODE";
    case ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.BLUEPRINT_DECISION:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.DEEP_FORGE_READY:
    case ONBOARDING_STEPS.LIBRARY_READY:
    case ONBOARDING_STEPS.FIRST_LIBRARY_RESEARCH:
    case ONBOARDING_STEPS.ERRANDS_READY:
    case ONBOARDING_STEPS.FIRST_ERRAND:
    case ONBOARDING_STEPS.SIGIL_ALTAR_READY:
    case ONBOARDING_STEPS.FIRST_SIGIL_INFUSION:
    case ONBOARDING_STEPS.ABYSS_PORTAL_READY: {
      return type !== "ACK_ONBOARDING_STEP";
    }
    case ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.TIER25_CAP:
    case ONBOARDING_STEPS.FIRST_ABYSS:
      return type !== "ACK_ONBOARDING_STEP";
    default:
      return false;
  }
}

export function getOnboardingBlockedActionMessage(step = null, action = {}, state = {}) {
  if (!step) return null;
  const effectiveStep = getEffectiveOnboardingStep(step, state);
  if (!effectiveStep) return null;

  if (action?.type === "SET_TAB") {
    const tabBlock = getOnboardingTabBlockMeta(step, action?.tab || "sanctuary", state);
    return tabBlock.blocked ? tabBlock.message : null;
  }

  if (!getBlockedOnboardingAction(step, action, state)) return null;

  const requiredTab = getOnboardingRequiredTab(effectiveStep);
  if (requiredTab) {
    return `Completa este paso primero en ${formatOnboardingTabLabel(requiredTab)}.`;
  }
  return "Completa este paso del tutorial para continuar.";
}

export function advanceOnboarding(prevState, nextState, action = {}) {
  const previous = normalizeOnboardingState(prevState?.onboarding);
  let onboarding = normalizeOnboardingState(nextState?.onboarding || previous);
  if (onboarding.completed) {
    return {
      ...nextState,
      onboarding,
    };
  }

  if ([ONBOARDING_STEPS.TALENT_INTRO, ONBOARDING_STEPS.BUY_TALENT].includes(onboarding.step)) {
    nextState = ensureTutorialTalentPoints(nextState);
  }

  const prevUpgradeLevels = countUpgradeLevels(prevState?.player);
  const nextUpgradeLevels = countUpgradeLevels(nextState?.player);
  const prevTalents = countUnlockedTalents(prevState?.player);
  const nextTalents = countUnlockedTalents(nextState?.player);
  const hasInventoryItem = (nextState?.player?.inventory || []).length > 0;
  const nextKills = Number(nextState?.combat?.sessionKills || 0);
  const prevCombatTier = Math.max(1, Number(prevState?.combat?.currentTier || 1));
  const prevDeaths = Number(prevState?.stats?.deaths || 0);
  const nextDeaths = Number(nextState?.stats?.deaths || 0);
  const prevBossKills = Number(prevState?.combat?.runStats?.bossKills || prevState?.combat?.analytics?.bossKills || 0);
  const nextBossKills = Number(nextState?.combat?.runStats?.bossKills || nextState?.combat?.analytics?.bossKills || 0);
  const prevEnemyWasBoss = Boolean(prevState?.combat?.enemy?.isBoss);
  const currentEnemyIsBoss = Boolean(nextState?.combat?.enemy?.isBoss);
  const hasEquippedItem = Boolean(
    nextState?.player?.equipment?.weapon ||
    nextState?.player?.equipment?.armor ||
    prevState?.player?.equipment?.weapon ||
    prevState?.player?.equipment?.armor
  );
  const bossEncounteredNow = currentEnemyIsBoss || prevEnemyWasBoss || nextBossKills > prevBossKills;
  const currentCombatTier = Math.max(1, Number(nextState?.combat?.currentTier || 1));
  const maxCombatTier = Math.max(
    currentCombatTier,
    Number(nextState?.combat?.maxTier || 1),
    Number(prevState?.combat?.maxTier || 1),
    Number(prevState?.combat?.currentTier || 1)
  );
  const bossTierReached = maxCombatTier >= 5;
  const currentTier = Math.max(
    currentCombatTier,
    Number(nextState?.combat?.maxTier || 1)
  );
  const prevPrestigeLevel = Number(prevState?.prestige?.level || 0);
  const nextPrestigeLevel = Number(nextState?.prestige?.level || 0);
  const prevPrestigeNodes = Object.values(prevState?.prestige?.nodes || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const nextPrestigeNodes = Object.values(nextState?.prestige?.nodes || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const nextLaboratoryCompleted = nextState?.sanctuary?.laboratory?.completed || {};
  const nextAbyssPortalUnlocked = Boolean(nextState?.abyss?.portalUnlocked);
  const nextTier25BossCleared = Boolean(nextState?.abyss?.tier25BossCleared);
  const nextExpeditionPhase = nextState?.expedition?.phase || "sanctuary";
  const expeditionInRunFlow = nextExpeditionPhase === "active" || nextExpeditionPhase === "setup";
  const currentStepRequiredTab = getOnboardingRequiredTab(onboarding.step);
  const runCompatibleOnboardingTabs = new Set(["combat", "character", "skills", "talents", "inventory", "crafting", "codex"]);
  const firstItemReady = onboarding.flags.firstItemEquipped || hasEquippedItem;
  const bossPhaseUnlocked =
    onboarding.flags.firstBossSeen ||
    onboarding.bossHeroQueued ||
    prevBossKills > 0 ||
    nextBossKills > 0 ||
    bossEncounteredNow ||
    bossTierReached;
  const canOpenHeroAfterBoss =
    !onboarding.flags.heroIntroSeen &&
    nextState?.player?.class &&
    bossPhaseUnlocked;
  const alreadyInsideHeroFlow = ["character", "skills", "talents"].includes(nextState?.currentTab || "sanctuary");
  const claimedJob =
    action.type === "CLAIM_SANCTUARY_JOB"
      ? (Array.isArray(prevState?.sanctuary?.jobs)
          ? prevState.sanctuary.jobs.find(job => job?.id === (action.jobId || action.payload?.jobId))
          : null)
      : null;
  const sanctuaryJobs = Array.isArray(nextState?.sanctuary?.jobs) ? nextState.sanctuary.jobs : [];
  const distilleryResearchJob = sanctuaryJobs.find(
    job =>
      job?.station === "laboratory" &&
      job?.input?.researchId === "unlock_distillery" &&
      (job?.status === "running" || job?.status === "claimable")
  );
  const existingDistilleryJob = sanctuaryJobs.find(
    job => job?.station === "distillery" && (job?.status === "running" || job?.status === "claimable")
  );

  if (
    distilleryResearchJob &&
    !onboarding.flags.distilleryUnlocked &&
    !expeditionInRunFlow &&
    onboarding.step !== ONBOARDING_STEPS.DISTILLERY_READY
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.DISTILLERY_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    existingDistilleryJob &&
    !onboarding.flags.distilleryJobStarted &&
    !expeditionInRunFlow &&
    [ONBOARDING_STEPS.OPEN_DISTILLERY, ONBOARDING_STEPS.FIRST_DISTILLERY_JOB, null].includes(onboarding.step)
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryJobStarted: true,
        },
      },
      ONBOARDING_STEPS.FIRST_ECHOES,
      { currentTab: "sanctuary" }
    );
  }

  if (
    expeditionInRunFlow &&
    currentStepRequiredTab &&
    !runCompatibleOnboardingTabs.has(currentStepRequiredTab)
  ) {
    onboarding = {
      ...onboarding,
      step: null,
    };
  }

  if (!onboarding.flags.firstItemEquipped && hasEquippedItem) {
    onboarding = {
      ...onboarding,
      flags: {
        ...onboarding.flags,
        firstItemEquipped: true,
        inventoryUnlocked: true,
      },
    };
  }

  if (action.type === "ACK_ONBOARDING_STEP") {
    if (onboarding.step === ONBOARDING_STEPS.EXPEDITION_INTRO) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          flags: {
            ...onboarding.flags,
            expeditionIntroSeen: true,
          },
        },
        ONBOARDING_STEPS.CHOOSE_CLASS,
        { currentTab: "sanctuary" }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.COMBAT_INTRO) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          combatIntroSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.HERO_INTRO) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          flags: {
            ...onboarding.flags,
            heroIntroSeen: true,
          },
        },
        ONBOARDING_STEPS.HERO_SKILLS_INTRO,
        {
          currentTab: "character",
        }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.TALENT_INTRO) {
      return withNextStep(ensureTutorialTalentPoints(nextState), onboarding, ONBOARDING_STEPS.BUY_TALENT, {
        currentTab: "talents",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.COMBAT_AFTER_TALENT) {
      onboarding = {
        ...onboarding,
        step: null,
      };
      nextState = {
        ...nextState,
        currentTab: "combat",
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_BOSS) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstBossSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.HUNT_INTRO) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          huntUnlocked: true,
        },
      };
      nextState = {
        ...nextState,
        currentTab: "combat",
      };
    } else if (onboarding.step === ONBOARDING_STEPS.EXTRACTION_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          extractionUnlocked: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN) {
      return withNextStep(nextState, {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstSanctuaryReturnSeen: true,
        },
      }, ONBOARDING_STEPS.OPEN_LABORATORY, {
        currentTab: "sanctuary",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.OPEN_LABORATORY) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.RESEARCH_DISTILLERY, {
        currentTab: "sanctuary",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.DISTILLERY_READY) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.RETURN_TO_SANCTUARY, {
        currentTab: "sanctuary",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.RETURN_TO_SANCTUARY) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.OPEN_DISTILLERY, {
        currentTab: "sanctuary",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.OPEN_DISTILLERY) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_DISTILLERY_JOB, {
        currentTab: "sanctuary",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_ECHOES) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          flags: {
            ...onboarding.flags,
            firstEchoesSeen: true,
          },
        },
        ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE,
        { currentTab: "prestige" }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstPrestigeCloseSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.BLUEPRINT_INTRO) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          flags: {
            ...onboarding.flags,
            blueprintDecisionUnlocked: true,
          },
        },
        ONBOARDING_STEPS.BLUEPRINT_DECISION,
        { currentTab: "sanctuary" }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.BLUEPRINT_DECISION) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION, {
        currentTab: "sanctuary",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstBlueprintMaterializationSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.DEEP_FORGE_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          deepForgeReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstDeepForgeUseSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.LIBRARY_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          libraryReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_LIBRARY_RESEARCH) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstLibraryResearchSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.ERRANDS_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          errandsReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_ERRAND) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstErrandSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.SIGIL_ALTAR_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          sigilAltarReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_SIGIL_INFUSION) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstSigilInfusionSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.ABYSS_PORTAL_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          abyssPortalReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.TIER25_CAP) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          tier25CapSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_ABYSS) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstAbyssSeen: true,
        },
      };
    }
  }

  if (
    onboarding.step === ONBOARDING_STEPS.EQUIP_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "inventory"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.EQUIP_FIRST_ITEM, {
      currentTab: "inventory",
      onboarding: {
        flags: {
          ...onboarding.flags,
          inventoryUnlocked: true,
        },
      },
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.HERO_SKILLS_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "skills"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.SPEND_ATTRIBUTE, {
      currentTab: "skills",
      player: {
        ...nextState.player,
        gold: Math.max(Number(nextState?.player?.gold || 0), getStrengthTutorialGold(nextState?.player)),
      },
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.HERO_TALENTS_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "talents"
  ) {
    return withNextStep(ensureTutorialTalentPoints(nextState), onboarding, ONBOARDING_STEPS.TALENT_INTRO, {
      currentTab: "talents",
    });
  }

  if (!onboarding.flags.classChosen && nextState?.player?.class) {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          classChosen: true,
        },
      },
      currentTab: "combat",
    };
  }

  if (!onboarding.flags.autoAdvanceUnlocked && (nextKills >= 3 || currentCombatTier >= 2) && !onboarding.step) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.AUTO_ADVANCE, { currentTab: "combat" });
  }

  if (onboarding.step === ONBOARDING_STEPS.AUTO_ADVANCE && action.type === "TOGGLE_AUTO_ADVANCE") {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        bossHeroQueued: false,
        flags: {
          ...onboarding.flags,
          autoAdvanceUnlocked: true,
        },
      },
    };
  }

  if (!onboarding.flags.firstDeathSeen && nextDeaths > prevDeaths) {
    onboarding = {
      ...onboarding,
      flags: {
        ...onboarding.flags,
        firstDeathSeen: true,
      },
      bossHeroQueued: bossPhaseUnlocked || prevEnemyWasBoss,
      bossHeroDelayTicks: Math.max(2, Number(onboarding?.bossHeroDelayTicks || 0)),
    };
  }

  if (canOpenHeroAfterBoss && prevEnemyWasBoss && nextDeaths > prevDeaths && !onboarding.step) {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        bossHeroDelayTicks: 2,
        bossHeroQueued: false,
        flags: {
          ...onboarding.flags,
        },
      },
    };
  }

  if (canOpenHeroAfterBoss && !onboarding.step && onboarding.bossHeroDelayTicks > 0) {
    const tickAdvance =
      action.type === "BULK_TICK"
        ? Math.max(1, Math.floor(Number(action.count || 0)))
        : action.type === "TICK"
          ? 1
          : 0;
    if (tickAdvance > 0) {
      const remainingTicks = Math.max(0, onboarding.bossHeroDelayTicks - tickAdvance);
      if (remainingTicks <= 0) {
        return withNextStep(
          nextState,
          {
            ...onboarding,
            bossHeroDelayTicks: 0,
            flags: {
              ...onboarding.flags,
              heroTabUnlocked: true,
            },
          },
          ONBOARDING_STEPS.OPEN_HERO,
          { currentTab: "combat" }
        );
      }
      return {
        ...nextState,
        onboarding: {
          ...onboarding,
          step: null,
          bossHeroDelayTicks: remainingTicks,
          flags: {
            ...onboarding.flags,
          },
        },
      };
    }
  }

  if (
    onboarding.step === ONBOARDING_STEPS.OPEN_HERO &&
    action.type === "SET_TAB" &&
    ["character", "skills", "talents"].includes(action.tab)
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.HERO_INTRO, {
      currentTab: "character",
    });
  }

  if (
    canOpenHeroAfterBoss &&
    !onboarding.step &&
    onboarding.bossHeroDelayTicks <= 0 &&
    !onboarding.flags.heroTabUnlocked &&
    nextExpeditionPhase === "active"
  ) {
    if (alreadyInsideHeroFlow) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          bossHeroDelayTicks: 0,
          flags: {
            ...onboarding.flags,
            heroTabUnlocked: true,
          },
        },
        ONBOARDING_STEPS.HERO_INTRO,
        { currentTab: "character" }
      );
    }
    return withNextStep(
      nextState,
      {
        ...onboarding,
        bossHeroDelayTicks: 0,
        flags: {
          ...onboarding.flags,
          heroTabUnlocked: true,
        },
      },
      ONBOARDING_STEPS.OPEN_HERO,
      { currentTab: "combat" }
    );
  }

  if (
    canOpenHeroAfterBoss &&
    !onboarding.step &&
    onboarding.bossHeroDelayTicks <= 0 &&
    prevCombatTier >= 5 &&
    currentCombatTier <= 4 &&
    nextDeaths === prevDeaths
  ) {
    if (alreadyInsideHeroFlow) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          bossHeroDelayTicks: 0,
          flags: {
            ...onboarding.flags,
            heroTabUnlocked: true,
          },
        },
        ONBOARDING_STEPS.HERO_INTRO,
        { currentTab: "character" }
      );
    }
    return withNextStep(
      nextState,
      {
        ...onboarding,
        bossHeroDelayTicks: 0,
        flags: {
          ...onboarding.flags,
          heroTabUnlocked: true,
        },
      },
      ONBOARDING_STEPS.OPEN_HERO,
      { currentTab: "combat" }
    );
  }

  if (!onboarding.flags.specChosen && nextState?.player?.specialization) {
    const shouldReturnToCombat = onboarding.flags.firstTalentBought || onboarding.step === ONBOARDING_STEPS.CHOOSE_SPEC;
    return withNextStep(
      nextState,
      {
        ...onboarding,
        bossHeroDelayTicks: 0,
        bossHeroQueued: false,
        flags: {
          ...onboarding.flags,
          specChosen: true,
        },
      },
      shouldReturnToCombat ? ONBOARDING_STEPS.COMBAT_AFTER_TALENT : ONBOARDING_STEPS.HERO_INTRO,
      {
        currentTab: shouldReturnToCombat ? "combat" : "character",
        player: {
          ...nextState.player,
          gold: Math.max(Number(nextState?.player?.gold || 0), 300),
        },
      }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.SPEND_ATTRIBUTE &&
    action.type === "UPGRADE_PLAYER" &&
    action.upgradeId === "damage" &&
    nextState !== prevState
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstAttributeSpent: true,
        },
      },
      ONBOARDING_STEPS.HERO_TALENTS_INTRO
    );
  }

  if (onboarding.step === ONBOARDING_STEPS.BUY_TALENT && nextTalents > prevTalents) {
    const nextStep =
      !onboarding.flags.specChosen &&
      nextState?.player?.class &&
      !nextState?.player?.specialization
        ? ONBOARDING_STEPS.HERO_CHARACTER_INTRO
        : ONBOARDING_STEPS.COMBAT_AFTER_TALENT;
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstTalentBought: true,
        },
      },
      nextStep,
      {
        currentTab: nextState?.currentTab,
      }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.HERO_CHARACTER_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "character"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.CHOOSE_SPEC, {
      currentTab: "character",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.EXTRACTION_READY &&
    action.type === "OPEN_EXTRACTION"
  ) {
    const preview = nextState?.expedition?.extractionPreview || {};
    const hasProjectOptions = Array.isArray(preview?.projectOptions) && preview.projectOptions.length > 0;
    const hasCargoOptions = Array.isArray(preview?.cargoOptions) && preview.cargoOptions.length > 0;
    return withNextStep(
      nextState,
      {
        ...onboarding,
        extractionReadyDelayTicks: 0,
        flags: {
          ...onboarding.flags,
          extractionUnlocked: true,
        },
      },
      hasCargoOptions
        ? ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO
        : hasProjectOptions
          ? ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM
          : ONBOARDING_STEPS.EXTRACTION_CONFIRM,
      { currentTab: "sanctuary" }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO &&
    action.type === "SELECT_EXTRACTION_CARGO"
  ) {
    const selectedCargoCount = Array.isArray(nextState?.expedition?.selectedCargoIds)
      ? nextState.expedition.selectedCargoIds.length
      : 0;
    if (selectedCargoCount > 0) {
      const hasProjectOptions = Array.isArray(nextState?.expedition?.extractionPreview?.projectOptions)
        && nextState.expedition.extractionPreview.projectOptions.length > 0
        && Number(nextState?.expedition?.extractionPreview?.availableSlots?.project || 0) > 0;
      return withNextStep(
        nextState,
        onboarding,
        hasProjectOptions ? ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM : ONBOARDING_STEPS.EXTRACTION_CONFIRM,
        { currentTab: "sanctuary" }
      );
    }
  }

  if (
    onboarding.step === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM &&
    action.type === "SELECT_EXTRACTION_PROJECT"
  ) {
    if (nextState?.expedition?.selectedProjectItemId) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.EXTRACTION_CONFIRM, {
        currentTab: "sanctuary",
      });
    }
  }

  if (
    onboarding.flags.autoAdvanceUnlocked &&
    !onboarding.flags.firstItemEquipped &&
    !onboarding.flags.inventoryUnlocked &&
    !onboarding.step &&
    currentTier >= 3
  ) {
    const ensuredState = hasInventoryItem ? nextState : injectTutorialEquipment(nextState);
    return withNextStep(ensuredState, onboarding, ONBOARDING_STEPS.EQUIP_INTRO, {
      currentTab: "combat",
    });
  }

  if (onboarding.step === ONBOARDING_STEPS.EQUIP_FIRST_ITEM && action.type === "EQUIP_ITEM") {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstItemEquipped: true,
          inventoryUnlocked: true,
        },
      },
      currentTab: "combat",
      combat: {
        ...nextState.combat,
        log: [
          ...(nextState?.combat?.log || []),
          "TUTORIAL: ya controlas la base de la expedicion. Ahora empezaras a ver bosses, Intel y el cierre correcto de una run.",
        ].slice(-20),
      },
    };
  }

  if (
    !onboarding.flags.firstBossSeen &&
    !onboarding.step &&
    firstItemReady &&
    nextExpeditionPhase === "active" &&
    (bossEncounteredNow || bossTierReached || nextBossKills > 0)
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_BOSS, { currentTab: "combat" });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.HUNT_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "codex"
  ) {
    return withNextStep(nextState, {
      ...onboarding,
      flags: {
        ...onboarding.flags,
        huntUnlocked: true,
      },
    }, ONBOARDING_STEPS.HUNT_INTRO, {
      currentTab: "codex",
    });
  }

  if (
    onboarding.flags.firstBossSeen &&
    !onboarding.flags.huntUnlocked &&
    !onboarding.step &&
    nextBossKills > 0
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.HUNT_INTRO, { currentTab: "combat" });
  }

  if (
    onboarding.flags.huntUnlocked &&
    !onboarding.flags.extractionUnlocked &&
    !onboarding.step &&
    currentTier >= 6 &&
    onboarding.extractionReadyDelayTicks <= 0
  ) {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        extractionReadyDelayTicks: 2,
        flags: {
          ...onboarding.flags,
        },
      },
    };
  }

  if (
    onboarding.flags.huntUnlocked &&
    !onboarding.flags.extractionUnlocked &&
    !onboarding.step &&
    onboarding.extractionReadyDelayTicks > 0
  ) {
    const tickAdvance =
      action.type === "BULK_TICK"
        ? Math.max(1, Math.floor(Number(action.count || 0)))
        : action.type === "TICK"
          ? 1
          : 0;
    if (tickAdvance > 0) {
      const remainingTicks = Math.max(0, onboarding.extractionReadyDelayTicks - tickAdvance);
      if (remainingTicks <= 0) {
        return withNextStep(
          nextState,
          {
            ...onboarding,
            extractionReadyDelayTicks: 0,
          },
          ONBOARDING_STEPS.EXTRACTION_READY,
          { currentTab: "combat" }
        );
      }
      return {
        ...nextState,
        onboarding: {
          ...onboarding,
          step: null,
          extractionReadyDelayTicks: remainingTicks,
          flags: {
            ...onboarding.flags,
          },
        },
      };
    }
  }

  if (action.type === "CONFIRM_EXTRACTION" && !onboarding.flags.firstExtractionCompleted) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstExtractionCompleted: true,
          laboratoryUnlocked: true,
        },
      },
      ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN,
      { currentTab: "sanctuary" }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.OPEN_LABORATORY &&
    action.type === "OPEN_LABORATORY"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.RESEARCH_DISTILLERY, {
      currentTab: "sanctuary",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.RETURN_TO_SANCTUARY &&
    action.type === "CLOSE_LABORATORY"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.OPEN_DISTILLERY, {
      currentTab: "sanctuary",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.OPEN_DISTILLERY &&
    action.type === "OPEN_DISTILLERY"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_DISTILLERY_JOB, {
      currentTab: "sanctuary",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.OPEN_DISTILLERY &&
    (action.type === "START_DISTILLERY_JOB" || action.type === "START_TUTORIAL_DISTILLERY_JOB")
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryJobStarted: true,
        },
      },
      ONBOARDING_STEPS.FIRST_ECHOES,
      { currentTab: "sanctuary" }
    );
  }

  if (
    (action.type === "START_DISTILLERY_JOB" || action.type === "START_TUTORIAL_DISTILLERY_JOB") &&
    !expeditionInRunFlow &&
    !onboarding.flags.firstEchoesSeen &&
    getEffectiveOnboardingStep(onboarding.step, nextState) === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryJobStarted: true,
        },
      },
      ONBOARDING_STEPS.FIRST_ECHOES,
      { currentTab: "sanctuary" }
    );
  }

  if (
    (action.type === "START_DISTILLERY_JOB" || action.type === "START_TUTORIAL_DISTILLERY_JOB") &&
    !onboarding.flags.distilleryJobStarted &&
    !expeditionInRunFlow
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryJobStarted: true,
        },
      },
      ONBOARDING_STEPS.FIRST_ECHOES,
      { currentTab: "sanctuary" }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.RESEARCH_DISTILLERY &&
    action.type === "START_LAB_RESEARCH" &&
    (action.researchId || action.payload?.researchId) === "unlock_distillery"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.DISTILLERY_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    [
      ONBOARDING_STEPS.DEEP_FORGE_READY,
      ONBOARDING_STEPS.LIBRARY_READY,
      ONBOARDING_STEPS.ERRANDS_READY,
      ONBOARDING_STEPS.SIGIL_ALTAR_READY,
      ONBOARDING_STEPS.ABYSS_PORTAL_READY,
    ].includes(onboarding.step) &&
    action.type === "START_LAB_RESEARCH" &&
    (action.researchId || action.payload?.researchId) === getOnboardingResearchTargetId(onboarding.step)
  ) {
    const readyFlags = {
      [ONBOARDING_STEPS.DEEP_FORGE_READY]: "deepForgeReadySeen",
      [ONBOARDING_STEPS.LIBRARY_READY]: "libraryReadySeen",
      [ONBOARDING_STEPS.ERRANDS_READY]: "errandsReadySeen",
      [ONBOARDING_STEPS.SIGIL_ALTAR_READY]: "sigilAltarReadySeen",
      [ONBOARDING_STEPS.ABYSS_PORTAL_READY]: "abyssPortalReadySeen",
    };
    const readyFlag = readyFlags[onboarding.step];
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          ...(readyFlag ? { [readyFlag]: true } : {}),
        },
      },
    };
  }

  if (
    claimedJob?.type === "laboratory_research" &&
    claimedJob?.input?.researchId === "unlock_distillery" &&
    !onboarding.flags.distilleryUnlocked
  ) {
    const nextStepAfterClaim =
      action?.source === "laboratory"
        ? ONBOARDING_STEPS.RETURN_TO_SANCTUARY
        : ONBOARDING_STEPS.OPEN_DISTILLERY;
    return withNextStep(
      ensureTutorialCargoBundle(nextState),
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryUnlocked: true,
        },
      },
      nextStepAfterClaim,
      { currentTab: "sanctuary" }
    );
  }

  if (
    onboarding.flags.firstExtractionCompleted &&
    !onboarding.flags.firstSanctuaryReturnSeen &&
    !onboarding.step &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN, {
      currentTab: "sanctuary",
    });
  }

  if (
    onboarding.flags.firstExtractionCompleted &&
    onboarding.flags.firstSanctuaryReturnSeen &&
    !onboarding.flags.distilleryJobStarted &&
    !onboarding.step &&
    !expeditionInRunFlow
  ) {
    if (onboarding.flags.distilleryUnlocked || nextState?.sanctuary?.stations?.distillery?.unlocked) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_DISTILLERY_JOB, {
        currentTab: "sanctuary",
      });
    }
    if (distilleryResearchJob || nextLaboratoryCompleted?.unlock_distillery) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.DISTILLERY_READY, {
        currentTab: "sanctuary",
      });
    }
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.RESEARCH_DISTILLERY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.firstEchoesSeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 1 &&
    onboarding.flags.distilleryJobStarted &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_ECHOES, {
      currentTab: "sanctuary",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.FIRST_ECHOES &&
    action.type === "SET_TAB" &&
    action.tab === "prestige"
  ) {
    return {
      ...nextState,
      currentTab: "prestige",
      onboarding: {
        ...onboarding,
        step: ONBOARDING_STEPS.FIRST_ECHOES,
        flags: {
          ...onboarding.flags,
          firstEchoTabOpened: true,
        },
      },
    };
  }

  if (
    onboarding.step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB &&
    (action.type === "START_DISTILLERY_JOB" || action.type === "START_TUTORIAL_DISTILLERY_JOB")
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryJobStarted: true,
        },
      },
      ONBOARDING_STEPS.FIRST_ECHOES,
      { currentTab: "sanctuary" }
    );
  }

  if (onboarding.step === ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE && nextPrestigeNodes > prevPrestigeNodes) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstEchoNodeBought: true,
        },
      },
      ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE,
      { currentTab: "prestige" }
    );
  }

  if (
    !onboarding.flags.blueprintDecisionUnlocked &&
    !onboarding.step &&
    onboarding.flags.firstEchoNodeBought &&
    nextPrestigeLevel >= 2 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.BLUEPRINT_INTRO, {
      currentTab: "sanctuary",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
    (
      action.type === "SET_EXTRACTION_PROJECT_DECISION" ||
      action.type === "CONFIRM_EXTRACTION"
    )
  ) {
    const extractionDecision =
      action.type === "SET_EXTRACTION_PROJECT_DECISION"
        ? (action?.decision === "discard" ? "discard" : "keep")
        : (state?.expedition?.selectedProjectDecision === "discard" ? "discard" : "keep");
    const nextFlags = {
      ...onboarding.flags,
      blueprintConverted: onboarding.flags.blueprintConverted || extractionDecision !== "discard",
      blueprintScrapped: onboarding.flags.blueprintScrapped || extractionDecision === "discard",
    };
    if (nextFlags.blueprintConverted && nextFlags.blueprintScrapped) {
      return withNextStep(nextState, { ...onboarding, flags: nextFlags }, ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION, {
        currentTab: "sanctuary",
      });
    }
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: ONBOARDING_STEPS.BLUEPRINT_DECISION,
        flags: nextFlags,
      },
    };
  }

  if (
    onboarding.step === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
    action.type === "START_SCRAP_EXTRACTED_ITEM_JOB"
  ) {
    const nextFlags = {
      ...onboarding.flags,
      blueprintScrapped: true,
    };
    if (nextFlags.blueprintConverted) {
      return withNextStep(nextState, { ...onboarding, flags: nextFlags }, ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION, {
        currentTab: "sanctuary",
      });
    }
    return {
      ...ensureTutorialBlueprintItems(nextState),
      onboarding: {
        ...onboarding,
        step: ONBOARDING_STEPS.BLUEPRINT_DECISION,
        flags: nextFlags,
      },
    };
  }

  if (
    onboarding.step === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
    action.type === "CONVERT_EXTRACTED_ITEM_TO_BLUEPRINT"
  ) {
    const nextFlags = {
      ...onboarding.flags,
      blueprintConverted: true,
    };
    if (nextFlags.blueprintScrapped) {
      return withNextStep(nextState, { ...onboarding, flags: nextFlags }, ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION, {
        currentTab: "sanctuary",
      });
    }
    return {
      ...ensureTutorialBlueprintItems(nextState),
      onboarding: {
        ...onboarding,
        step: ONBOARDING_STEPS.BLUEPRINT_DECISION,
        flags: nextFlags,
      },
    };
  }

  if (
    !onboarding.flags.deepForgeReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 3 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.DEEP_FORGE_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.firstDeepForgeUseSeen &&
    !onboarding.step &&
    Boolean(nextState?.sanctuary?.stations?.deepForge?.unlocked) &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.libraryReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 4 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.LIBRARY_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.errandsReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 5 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.ERRANDS_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.sigilAltarReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 6 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.SIGIL_ALTAR_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.firstLibraryResearchSeen &&
    !onboarding.step &&
    Boolean(nextState?.sanctuary?.stations?.codexResearch?.unlocked) &&
    Math.max(0, Number(nextState?.sanctuary?.resources?.codexInk || 0)) > 0 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_LIBRARY_RESEARCH, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.firstErrandSeen &&
    !onboarding.step &&
    Boolean(nextState?.sanctuary?.stations?.errands?.unlocked) &&
    hasAvailableErrandSlot(nextState) &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_ERRAND, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.firstSigilInfusionSeen &&
    !onboarding.step &&
    Boolean(nextState?.sanctuary?.stations?.sigilInfusion?.unlocked) &&
    hasAvailableSigilInfusion(nextState) &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_SIGIL_INFUSION, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.abyssPortalReadySeen &&
    !onboarding.step &&
    nextTier25BossCleared &&
    !nextAbyssPortalUnlocked &&
    nextLaboratoryCompleted.unlock_library &&
    nextLaboratoryCompleted.unlock_errands &&
    nextLaboratoryCompleted.unlock_sigil_altar &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.ABYSS_PORTAL_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.tier25CapSeen &&
    !onboarding.step &&
    nextTier25BossCleared &&
    !nextAbyssPortalUnlocked
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.TIER25_CAP, {
      currentTab: "combat",
    });
  }

  if (
    !onboarding.flags.firstAbyssSeen &&
    !onboarding.step &&
    nextAbyssPortalUnlocked &&
    Math.max(
      Number(nextState?.combat?.currentTier || 1),
      Number(nextState?.combat?.maxTier || 1),
      Number(nextState?.abyss?.highestTierReached || 1)
    ) >= 26
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_ABYSS, {
      currentTab: "combat",
    });
  }

  const requiredTab = getOnboardingRequiredTab(onboarding.step);
  if (expeditionInRunFlow && requiredTab && requiredTab !== "combat") {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: onboarding.step,
        flags: {
          ...onboarding.flags,
        },
      },
    };
  }
  if (
    requiredTab &&
    nextState?.currentTab !== requiredTab &&
    !isOnboardingTabAllowed(onboarding.step, nextState?.currentTab || "sanctuary")
  ) {
    return {
      ...nextState,
      currentTab: requiredTab,
      onboarding: {
        ...onboarding,
        step: onboarding.step,
        flags: {
          ...onboarding.flags,
        },
      },
    };
  }

  return {
    ...nextState,
    onboarding: {
      ...onboarding,
      step: onboarding.step,
      flags: {
        ...onboarding.flags,
      },
    },
  };
}

export function getOnboardingOverlayAnchor(step = null, state = {}) {
  if (step === ONBOARDING_STEPS.EQUIP_INTRO) return "subnav";
  if (step === ONBOARDING_STEPS.HERO_INTRO) return "bottom";
  if (step === ONBOARDING_STEPS.BUY_TALENT) return "top";
  if (step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) return "top";
  if (
    step === ONBOARDING_STEPS.HERO_SKILLS_INTRO ||
    step === ONBOARDING_STEPS.HERO_TALENTS_INTRO ||
    step === ONBOARDING_STEPS.HERO_CHARACTER_INTRO
  ) {
    return "subnav";
  }
  if (step === ONBOARDING_STEPS.HUNT_INTRO) return "subnav";
  if (
    step === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN ||
    step === ONBOARDING_STEPS.OPEN_LABORATORY ||
    step === ONBOARDING_STEPS.RESEARCH_DISTILLERY ||
    step === ONBOARDING_STEPS.DISTILLERY_READY ||
    step === ONBOARDING_STEPS.RETURN_TO_SANCTUARY ||
    step === ONBOARDING_STEPS.OPEN_DISTILLERY ||
    step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB ||
    step === ONBOARDING_STEPS.SPEND_ATTRIBUTE ||
    step === ONBOARDING_STEPS.BUY_TALENT ||
    step === ONBOARDING_STEPS.FIRST_ECHOES ||
    step === ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE ||
    step === ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE ||
    step === ONBOARDING_STEPS.BLUEPRINT_INTRO ||
    step === ONBOARDING_STEPS.BLUEPRINT_DECISION ||
    step === ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION ||
    step === ONBOARDING_STEPS.DEEP_FORGE_READY ||
    step === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE ||
    step === ONBOARDING_STEPS.LIBRARY_READY ||
    step === ONBOARDING_STEPS.FIRST_LIBRARY_RESEARCH ||
    step === ONBOARDING_STEPS.ERRANDS_READY ||
    step === ONBOARDING_STEPS.FIRST_ERRAND ||
    step === ONBOARDING_STEPS.SIGIL_ALTAR_READY ||
    step === ONBOARDING_STEPS.FIRST_SIGIL_INFUSION ||
    step === ONBOARDING_STEPS.ABYSS_PORTAL_READY ||
    step === ONBOARDING_STEPS.TIER25_CAP ||
    step === ONBOARDING_STEPS.FIRST_ABYSS ||
    step === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO ||
    step === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM ||
    step === ONBOARDING_STEPS.EXTRACTION_CONFIRM
  ) return "bottom";
  return "top";
}

export function getOnboardingSpotlightSelectors(step = null, state = {}) {
  if (isPostEchoOnboardingStep(step)) return [];

  if (step === ONBOARDING_STEPS.DISTILLERY_READY) {
    const distilleryResearchPhase = getDistilleryResearchOnboardingPhase(state);
    if (distilleryResearchPhase === "claimable") {
      return [
        '[data-onboarding-target="claim-distillery-research"]',
        '[data-onboarding-target="claim-distillery-research-card"]',
        '[data-onboarding-target="open-laboratory"]',
      ];
    }
    if (distilleryResearchPhase === "running") {
      return [
        '[data-onboarding-target="running-distillery-research"]',
        '[data-onboarding-target="open-laboratory"]',
      ];
    }
    return [
      '[data-onboarding-target="open-distillery"]',
      '[data-onboarding-target="open-laboratory"]',
    ];
  }

  if (getOnboardingStepInteractionMode(step, state) === "info") {
    return [];
  }

  if (step === ONBOARDING_STEPS.OPEN_DISTILLERY) {
    return ['[data-onboarding-target="open-distillery"]'];
  }
  if (step === ONBOARDING_STEPS.RETURN_TO_SANCTUARY) {
    return [
      '[data-onboarding-target="primary-sanctuary-tab"]',
      '[data-onboarding-target="close-laboratory"]',
    ];
  }
  if (step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) {
    return [
      '[data-onboarding-target="tutorial-distillery-bundle"]',
      '[data-onboarding-target="tutorial-distillery-start"]',
    ];
  }
  if (step === ONBOARDING_STEPS.FIRST_ECHOES) {
    return state?.currentTab === "prestige"
      ? ['[data-onboarding-target="prestige-summary"]']
      : ['[data-onboarding-target="primary-prestige-tab"]'];
  }
  if (step === ONBOARDING_STEPS.BLUEPRINT_DECISION) {
    return ['[data-onboarding-target="blueprint-stash"]', '[data-onboarding-target="tutorial-blueprint-action"]'];
  }
  if (step === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE) {
    return ['[data-onboarding-target="open-deep-forge"]', '[data-onboarding-target="tutorial-deep-forge-project"]'];
  }
  const researchId = getOnboardingResearchTargetId(step);
  if (researchId) {
    if (step === ONBOARDING_STEPS.RESEARCH_DISTILLERY) {
      return [
        `[data-onboarding-target="research-card-${researchId}"]`,
        `[data-onboarding-target="research-${researchId}"]`,
      ];
    }
    return [
      `[data-onboarding-target="research-card-${researchId}"]`,
      `[data-onboarding-target="research-${researchId}"]`,
    ];
  }

  switch (step) {
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
      return ['[data-onboarding-target="start-expedition"]'];
    case ONBOARDING_STEPS.CHOOSE_CLASS:
      return ['[data-onboarding-target="choose-class"]'];
    case ONBOARDING_STEPS.COMBAT_INTRO:
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
    case ONBOARDING_STEPS.FIRST_BOSS:
      return ['[data-onboarding-target="combat-encounter"]'];
    case ONBOARDING_STEPS.OPEN_HERO:
      return ['[data-onboarding-target="primary-hero-tab"]'];
    case ONBOARDING_STEPS.HERO_INTRO:
      return ['[data-onboarding-target="hero-overview"]'];
    case ONBOARDING_STEPS.AUTO_ADVANCE:
      return ['[data-onboarding-target="auto-advance"]'];
    case ONBOARDING_STEPS.EXTRACTION_READY:
      return ['[data-onboarding-target="open-extraction"]'];
    case ONBOARDING_STEPS.HERO_SKILLS_INTRO:
      return ['[data-onboarding-target="hero-subview-skills"]'];
    case ONBOARDING_STEPS.HERO_TALENTS_INTRO:
      return ['[data-onboarding-target="hero-subview-talents"]'];
    case ONBOARDING_STEPS.HERO_CHARACTER_INTRO:
      return ['[data-onboarding-target="hero-subview-character"]'];
    case ONBOARDING_STEPS.EQUIP_INTRO:
      return ['[data-onboarding-target="subview-inventory"]'];
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return [
        '[data-onboarding-target="tutorial-first-item"]',
        '[data-onboarding-target="equip-item"]',
      ];
    case ONBOARDING_STEPS.SPEND_ATTRIBUTE:
      return [
        '[data-onboarding-target="upgrade-attribute-card"]',
        '[data-onboarding-target="upgrade-attribute"]',
      ];
    case ONBOARDING_STEPS.CHOOSE_SPEC:
      return [
        '[data-onboarding-target="choose-spec-card"]',
        '[data-onboarding-target="choose-spec"]',
      ];
    case ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO:
      return ['[data-onboarding-target="tutorial-extraction-cargo"]'];
    case ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM:
      return ['[data-onboarding-target="tutorial-extraction-item"]'];
    case ONBOARDING_STEPS.EXTRACTION_CONFIRM:
      return ['[data-onboarding-target="tutorial-extraction-confirm"]'];
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
      return [];
    case ONBOARDING_STEPS.OPEN_LABORATORY:
      return ['[data-onboarding-target="open-laboratory"]'];
    case ONBOARDING_STEPS.HUNT_INTRO:
      return ['[data-onboarding-target="subview-codex"]'];
    case ONBOARDING_STEPS.FIRST_ECHOES:
      return ['[data-onboarding-target="prestige-summary"]'];
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
      return [
        '[data-onboarding-target="buy-first-echo-node-card"]',
        '[data-onboarding-target="buy-first-echo-node"]',
      ];
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      return ['[data-onboarding-target="blueprint-stash"]'];
    case ONBOARDING_STEPS.TIER25_CAP:
      return ['[data-onboarding-target="combat-encounter"]'];
    case ONBOARDING_STEPS.TALENT_INTRO:
    case ONBOARDING_STEPS.BUY_TALENT:
      if (step === ONBOARDING_STEPS.BUY_TALENT) {
        const tutorialTalentNodeId = getResolvedOnboardingTutorialTalentNodeId(state);
        if (tutorialTalentNodeId) {
          return [
            `[data-onboarding-node-id="${tutorialTalentNodeId}"]`,
            '[data-onboarding-target="buy-talent-card"]',
            '[data-onboarding-target="buy-talent"]',
          ];
        }
      }
      return [
        '[data-onboarding-target="buy-talent-card"]',
        '[data-onboarding-target="buy-talent"]',
      ];
    default:
      return [];
  }
}

export function isInfoOnlyOnboardingStep(step = null, state = {}) {
  return getOnboardingStepInteractionMode(step, state) === "info";
}
