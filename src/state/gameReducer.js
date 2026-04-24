import { processTick }              from "../engine/combat/processTickRuntime";
import { spawnEnemy }               from "../engine/combat/enemyEngine";
import { createRunContext } from "../engine/combat/encounterRouting";
import { refreshStats }             from "../engine/combat/statEngine";
import { calcStats }                from "../engine/combat/statEngine";
import { addToInventory, syncEquipment } from "../engine/inventory/inventoryEngine";
import { sellItem, sellItems }      from "../engine/inventory/economyEngine";
import { craftReroll, craftPolish, craftReforge, craftReforgePreview, craftUpgrade, craftAscend, craftExtract } from "../engine/crafting/craftingEngine";
import { checkAchievements } from "../engine/progression/achievementEngine";
import {
  getLegendaryPowerImprintReduction,
  getUnlockedLegendaryPowers,
  normalizeCodexState,
  recordCodexSighting,
  syncCodexBonuses,
} from "../engine/progression/codexEngine";
import { createEmptyAccountTelemetry, createEmptySessionAnalytics, sanitizeAccountTelemetry } from "../utils/runTelemetry";
import { recordReplayState } from "../utils/replayLog";
import { buildExtractionPreview, isMaterializedBlueprintItem } from "../engine/sanctuary/extractionEngine";
import {
  createCodexResearchJob,
  createDistillJob,
  createForgeProjectJob,
  createSanctuaryErrandJob,
  createScrapExtractedItemJob,
  createSigilInfusionJob,
  syncSanctuaryJobs,
} from "../engine/sanctuary/jobEngine";
import {
  buildDeepForgeReforgePreview,
  canDeepForgeProject,
  deepForgeAscendProject,
  deepForgeApplyReforge,
  deepForgePolishProject,
  deepForgeRerollProject,
  deepForgeUpgradeProject,
  normalizeProjectRecord,
} from "../engine/sanctuary/projectForgeEngine";
import {
  addBlueprintCharges,
  ascendBlueprint,
  buildBlueprintAscensionPreview,
  buildBlueprintChargeReward,
  buildBlueprintFromExtractedItem,
  buildBlueprintPowerTunePreview,
  buildExtractedItemRecord,
  buildBlueprintStructurePreview,
  canAscendBlueprint,
  canUpgradeBlueprintStructure,
  canTuneBlueprintPower,
  consumeBlueprintMaterialization,
  createEmptyBlueprintLoadout,
  createEmptyFamilyChargeState,
  ensureValidActiveBlueprints,
  investBlueprintAffinity,
  materializeBlueprintLoadout,
  normalizeBlueprintRecord,
  normalizeExtractedItemRecord,
  tuneBlueprintPower,
  upgradeBlueprintStructure,
} from "../engine/sanctuary/blueprintEngine";
import { createEmptyItemStashState, syncItemStashState } from "../engine/sanctuary/itemStashSchema";
import {
  applyLaboratoryResearch,
  createEmptyLaboratoryState,
  createLaboratoryResearchJob,
  isSanctuaryStationUnlocked,
  SANCTUARY_STATION_DEFAULTS,
} from "../engine/sanctuary/laboratoryEngine";

import { ensureWeeklyLedger } from "../engine/progression/weeklyLedger";
import { handleAccountStateAction } from "./reducerDomains/accountStateReducer";
import { handleBlueprintForgeAction } from "./reducerDomains/blueprintForgeReducer";
import { handleClassProgressionAction } from "./reducerDomains/classProgressionReducer";
import { handleExtractionResolutionAction } from "./reducerDomains/extractionResolutionReducer";
import { handleMetaProgressionAction } from "./reducerDomains/metaProgressionReducer";
import { handleProgressionMetaAction } from "./reducerDomains/progressionReducer";
import { handleRunFlowAction } from "./reducerDomains/runFlowReducer";
import { handleSanctuaryJobsAction } from "./reducerDomains/sanctuaryJobsReducer";
import { handleSystemUiAction } from "./reducerDomains/systemUiReducer";
import {
  calculatePrestigeEchoGain,
  canPrestige,
  createEmptyPrestigeCycleProgress,
  canPurchasePrestigeNode,
  syncPrestigeBonuses,
} from "../engine/progression/prestigeEngine";
import { getAbyssTierCap, getMaxRunSigilSlots, normalizeAbyssState, syncAbyssState } from "../engine/progression/abyssProgression";
import { PRESTIGE_TREE_NODES } from "../data/prestige";
import { ABYSS_PREFIXES, ABYSS_SUFFIXES } from "../data/affixes";
import {
  formatRunSigilLoadout,
  getRunSigil,
  getRunSigilPlayerBonuses,
  isRunSigilsUnlocked,
  normalizeRunSigilIds,
  summarizeRunSigilLoadout,
} from "../data/runSigils";

import {
  upgradePlayer,
  unlockTalent,
  upgradeTalentNode,
  resetTalentTree,
  selectClass,
  selectSpecialization
} from "../engine/progression/progressionEngine";
import { getLifetimeXp } from "../engine/leveling";
import {
  advanceOnboarding,
  ensureTutorialCargoBundle,
  getOnboardingFirstEchoNodeId,
  getOnboardingRequiredTab,
  ONBOARDING_STEPS,
  createEmptyOnboardingState,
  getBlockedOnboardingAction,
  getOnboardingBlockedActionMessage,
  isExtractionUnlocked,
  isSanctuaryLockedDuringExpeditionTutorial,
  normalizeOnboardingState,
  trackOnboardingCompletedBeats,
} from "../engine/onboarding/onboardingEngine";
import { createEmptySaveDiagnostics, createFreshState, mergeStateWithDefaults } from "../engine/stateInitializer";

const CRIT_CAP         = 0.75;
const ATTACK_SPEED_CAP = 0.70;

function withAchievementProgress(state) {
  const { newAchievements, bonusGold, unlocked } = checkAchievements(state);
  if ((!unlocked || unlocked.length === 0) && bonusGold <= 0) return state;

  return {
    ...state,
    achievements: newAchievements,
    player: {
      ...state.player,
      gold: (state.player.gold || 0) + bonusGold,
    },
    combat: {
      ...state.combat,
      analytics: {
        ...(state.combat.analytics || createEmptySessionAnalytics()),
        goldEarned: (state.combat.analytics?.goldEarned || 0) + bonusGold,
        goldBySource: {
          ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
          achievements: (state.combat.analytics?.goldBySource?.achievements || 0) + bonusGold,
        },
      },
      log: [
        ...(state.combat?.log || []),
        ...unlocked.map(achievement => `LOGRO: ${achievement.name} +${achievement.reward || 0} oro`),
      ].slice(-20),
    },
  };
}

function appendCraftingLog(combat, entry) {
  if (!entry) return combat;
  return {
    ...combat,
    craftingLog: [...(combat.craftingLog || []), entry].slice(-30),
  };
}

function isEquippedItemId(player, itemId) {
  if (!itemId) return false;
  const equipment = player?.equipment || {};
  return equipment.weapon?.id === itemId || equipment.armor?.id === itemId;
}

function buildBlockedOperationState(state, { analyticsKey, message }) {
  return {
    ...state,
    combat: {
      ...state.combat,
      analytics: {
        ...(state.combat.analytics || createEmptySessionAnalytics()),
        [analyticsKey]: (state.combat.analytics?.[analyticsKey] || 0) + 1,
      },
      log: [
        ...(state.combat?.log || []),
        message,
      ].slice(-20),
    },
  };
}

function hasExpeditionRunEvidence(state = {}) {
  const expedition = state?.expedition || {};
  const combat = state?.combat || {};
  const telemetry = state?.accountTelemetry || {};
  const hasRunIdentity = Boolean(expedition.id && expedition.startedAt);
  return (
    hasRunIdentity ||
    Number(combat.ticksInCurrentRun || 0) > 0 ||
    Number(combat.sessionKills || 0) > 0 ||
    Number(telemetry.currentExpeditionSeconds || 0) > 0
  );
}

function markRuntimeRecoveryTelemetry(
  telemetry = {},
  {
    now = Date.now(),
    reason = "runtime_guard",
    repaired = false,
    offlineJobStall = false,
  } = {}
) {
  const baseTelemetry = sanitizeAccountTelemetry(telemetry || createEmptyAccountTelemetry());
  return {
    ...baseTelemetry,
    runtimeRecoveryCount: Math.max(0, Number(baseTelemetry.runtimeRecoveryCount || 0)) + 1,
    runtimeRepairCount: Math.max(0, Number(baseTelemetry.runtimeRepairCount || 0)) + (repaired ? 1 : 0),
    runtimeOfflineJobStallCount:
      Math.max(0, Number(baseTelemetry.runtimeOfflineJobStallCount || 0)) + (offlineJobStall ? 1 : 0),
    runtimeLastRecoveryAt: Number(now || Date.now()) || Date.now(),
    runtimeLastRecoveryReason: reason || "runtime_guard",
    lastActiveAt: Number(now || Date.now()) || Date.now(),
  };
}

function resolveRunSigilLoadout(state, sourceIds = null) {
  const slots = getMaxRunSigilSlots(state?.abyss || {});
  return normalizeRunSigilIds(
    sourceIds ?? state?.combat?.pendingRunSigilIds ?? state?.combat?.pendingRunSigilId ?? "free",
    { slots }
  );
}

function selectRunSigilLoadout(state, sigilId, slotIndex = 0) {
  const slots = getMaxRunSigilSlots(state?.abyss || {});
  const currentIds = resolveRunSigilLoadout(state);
  const nextIds = [...currentIds];
  const nextSlotIndex = Math.max(0, Math.min(slots - 1, Math.floor(Number(slotIndex || 0))));
  const nextSigilId = getRunSigil(sigilId || "free").id;

  nextIds[nextSlotIndex] = nextSigilId;
  if (nextSigilId !== "free") {
    for (let index = 0; index < nextIds.length; index += 1) {
      if (index === nextSlotIndex) continue;
      if (nextIds[index] === nextSigilId) {
        nextIds[index] = "free";
      }
    }
  }

  return normalizeRunSigilIds(nextIds, { slots });
}

function createEmptySanctuaryState() {
  return {
    stash: [],
    extractedItems: [],
    itemStash: createEmptyItemStashState(),
    blueprints: [],
    cargoInventory: [],
    jobs: [],
    deepForgeSession: null,
    resources: {
      codexInk: 0,
      sigilFlux: 0,
      relicDust: 0,
    },
    familyCharges: createEmptyFamilyChargeState(),
    activeBlueprints: createEmptyBlueprintLoadout(),
    sigilInfusions: {},
    laboratory: createEmptyLaboratoryState(),
    stations: Object.fromEntries(
      Object.entries(SANCTUARY_STATION_DEFAULTS).map(([stationId, defaults]) => [
        stationId,
        { ...defaults },
      ])
    ),
    extractionUpgrades: {
      cargoSlots: 2,
      projectSlots: 1,
      extractedItemSlots: 3,
      relicSlots: 0,
      insuredCargoSlots: 0,
    },
  };
}

function createEmptyExpeditionState() {
  return {
    phase: "sanctuary",
    id: null,
    startedAt: null,
    exitReason: null,
    deathCount: 0,
    deathLimit: 3,
    seenFamilyIds: [],
    cargoFound: [],
    projectCandidates: [],
    selectedCargoIds: [],
    selectedProjectItemId: null,
    extractionPreview: null,
    activeInfusionIds: [],
    activeInfusionPlayerBonuses: {},
    activeExtractionBonuses: {},
  };
}

function getAccountTelemetry(state = {}) {
  return sanitizeAccountTelemetry(state?.accountTelemetry || createEmptyAccountTelemetry());
}

function getSaveDiagnostics(state = {}) {
  return {
    ...createEmptySaveDiagnostics(),
    ...(state?.saveDiagnostics || {}),
  };
}

function getCurrentOnlineSeconds(telemetry = {}) {
  return Math.max(0, Number(telemetry.totalOnlineSeconds || 0) + Number(telemetry.currentSessionSeconds || 0));
}

function markFirstTelemetryMoment(telemetry = {}, key) {
  if (!key) return telemetry;
  if (telemetry[key] != null) return telemetry;
  return {
    ...telemetry,
    [key]: getCurrentOnlineSeconds(telemetry),
  };
}

function finalizeExpeditionTelemetry(
  telemetry = {},
  expedition = {},
  { exitReason = "retire", prestige = false, now = Date.now() } = {}
) {
  const nextTelemetry = sanitizeAccountTelemetry(telemetry || createEmptyAccountTelemetry());
  const startedAt = Number(expedition?.startedAt || 0);
  const currentTracked = Math.max(0, Number(nextTelemetry.currentExpeditionSeconds || 0));
  const durationSeconds = startedAt > 0 ? Math.max(currentTracked, Math.floor((now - startedAt) / 1000)) : currentTracked;

  nextTelemetry.completedExpeditionCount = Math.max(0, Number(nextTelemetry.completedExpeditionCount || 0)) + 1;
  nextTelemetry.extractionCount = Math.max(0, Number(nextTelemetry.extractionCount || 0)) + 1;
  if (prestige) {
    nextTelemetry.prestigeExtractionCount = Math.max(0, Number(nextTelemetry.prestigeExtractionCount || 0)) + 1;
  } else if (exitReason !== "death") {
    nextTelemetry.manualExtractionCount = Math.max(0, Number(nextTelemetry.manualExtractionCount || 0)) + 1;
  }
  nextTelemetry.totalExpeditionLifecycleSeconds =
    Math.max(0, Number(nextTelemetry.totalExpeditionLifecycleSeconds || 0)) + durationSeconds;
  nextTelemetry.longestExpeditionSeconds = Math.max(
    Math.max(0, Number(nextTelemetry.longestExpeditionSeconds || 0)),
    durationSeconds
  );
  nextTelemetry.currentExpeditionSeconds = 0;
  if (exitReason === "death") {
    nextTelemetry.emergencyExtractionCount = Math.max(0, Number(nextTelemetry.emergencyExtractionCount || 0)) + 1;
  }
  if (nextTelemetry.firstExtractionAtOnlineSeconds == null) {
    nextTelemetry.firstExtractionAtOnlineSeconds = getCurrentOnlineSeconds(nextTelemetry);
  }

  return nextTelemetry;
}

function trackAccountPhaseTime(telemetry = {}, phase = "sanctuary", seconds = 0, now = Date.now()) {
  const nextTelemetry = sanitizeAccountTelemetry(telemetry || createEmptyAccountTelemetry());
  const safeSeconds = Math.max(0, Math.floor(Number(seconds || 0)));
  if (safeSeconds <= 0) {
    return {
      ...nextTelemetry,
      lastActiveAt: now,
    };
  }

  nextTelemetry.currentSessionSeconds = Math.max(0, Number(nextTelemetry.currentSessionSeconds || 0)) + safeSeconds;
  nextTelemetry.totalOnlineSeconds = Math.max(0, Number(nextTelemetry.totalOnlineSeconds || 0)) + safeSeconds;
  nextTelemetry.longestSessionSeconds = Math.max(
    Math.max(0, Number(nextTelemetry.longestSessionSeconds || 0)),
    nextTelemetry.currentSessionSeconds
  );
  nextTelemetry.lastActiveAt = now;

  if (phase === "active") {
    nextTelemetry.totalExpeditionSeconds = Math.max(0, Number(nextTelemetry.totalExpeditionSeconds || 0)) + safeSeconds;
    nextTelemetry.currentExpeditionSeconds = Math.max(0, Number(nextTelemetry.currentExpeditionSeconds || 0)) + safeSeconds;
  } else if (phase === "setup") {
    nextTelemetry.totalSetupSeconds = Math.max(0, Number(nextTelemetry.totalSetupSeconds || 0)) + safeSeconds;
  } else if (phase === "extraction") {
    nextTelemetry.totalExtractionSeconds = Math.max(0, Number(nextTelemetry.totalExtractionSeconds || 0)) + safeSeconds;
  } else {
    nextTelemetry.totalSanctuarySeconds = Math.max(0, Number(nextTelemetry.totalSanctuarySeconds || 0)) + safeSeconds;
  }

  return nextTelemetry;
}

function applyDerivedAccountTelemetry(prevState, nextState) {
  if (nextState === prevState) return nextState;

  let nextTelemetry = getAccountTelemetry(nextState);
  let changed = false;
  const setFirstMoment = key => {
    const updated = markFirstTelemetryMoment(nextTelemetry, key);
    if (updated !== nextTelemetry) {
      nextTelemetry = updated;
      changed = true;
    }
  };

  if (!prevState?.player?.specialization && nextState?.player?.specialization) {
    setFirstMoment("firstSpecAtOnlineSeconds");
  }
  if (Number(prevState?.stats?.bossKills || 0) <= 0 && Number(nextState?.stats?.bossKills || 0) > 0) {
    setFirstMoment("firstBossAtOnlineSeconds");
  }
  if (!prevState?.sanctuary?.stations?.laboratory?.unlocked && nextState?.sanctuary?.stations?.laboratory?.unlocked) {
    setFirstMoment("firstLaboratoryAtOnlineSeconds");
  }
  if (!prevState?.sanctuary?.stations?.distillery?.unlocked && nextState?.sanctuary?.stations?.distillery?.unlocked) {
    setFirstMoment("firstDistilleryAtOnlineSeconds");
  }
  if ((Array.isArray(prevState?.sanctuary?.blueprints) ? prevState.sanctuary.blueprints.length : 0) <= 0 &&
      (Array.isArray(nextState?.sanctuary?.blueprints) ? nextState.sanctuary.blueprints.length : 0) > 0) {
    setFirstMoment("firstBlueprintAtOnlineSeconds");
  }
  if (!prevState?.sanctuary?.stations?.deepForge?.unlocked && nextState?.sanctuary?.stations?.deepForge?.unlocked) {
    setFirstMoment("firstDeepForgeAtOnlineSeconds");
  }
  if (!prevState?.sanctuary?.stations?.codexResearch?.unlocked && nextState?.sanctuary?.stations?.codexResearch?.unlocked) {
    setFirstMoment("firstLibraryAtOnlineSeconds");
  }
  if (!prevState?.sanctuary?.stations?.errands?.unlocked && nextState?.sanctuary?.stations?.errands?.unlocked) {
    setFirstMoment("firstErrandsAtOnlineSeconds");
  }
  if (!prevState?.sanctuary?.stations?.sigilInfusion?.unlocked && nextState?.sanctuary?.stations?.sigilInfusion?.unlocked) {
    setFirstMoment("firstSigilAltarAtOnlineSeconds");
  }
  if (!prevState?.abyss?.portalUnlocked && nextState?.abyss?.portalUnlocked) {
    setFirstMoment("firstAbyssPortalAtOnlineSeconds");
  }

  if (!changed) return nextState;
  return {
    ...nextState,
    accountTelemetry: nextTelemetry,
  };
}

function deriveExpeditionPhase(state) {
  const explicitPhase = state?.expedition?.phase;
  const firstExtractionCompleted =
    Boolean(state?.onboarding?.flags?.firstExtractionCompleted) ||
    Boolean(state?.sanctuary?.stations?.laboratory?.unlocked) ||
    (Array.isArray(state?.sanctuary?.cargoInventory) && state.sanctuary.cargoInventory.length > 0) ||
    Object.keys(state?.sanctuary?.laboratory?.completed || {}).length > 0;
  const hasTrackedActiveExpedition = Boolean(state?.expedition?.id || state?.expedition?.startedAt);
  if (state?.combat?.pendingRunSetup) return "setup";
  if (explicitPhase === "extraction") return "extraction";
  if (explicitPhase === "setup") return "setup";
  if (explicitPhase === "sanctuary") {
    if (state?.player?.class && !firstExtractionCompleted) {
      return "active";
    }
    return "sanctuary";
  }
  if (explicitPhase === "active") {
    if (firstExtractionCompleted && !hasTrackedActiveExpedition) {
      return "sanctuary";
    }
    return "active";
  }
  if (state?.player?.class) return "active";
  return "sanctuary";
}

function appendSeenFamilyIds(expedition = {}, enemy = null) {
  const familyId = enemy?.familyTraitId || enemy?.family || null;
  const current = Array.isArray(expedition?.seenFamilyIds) ? expedition.seenFamilyIds : [];
  if (!familyId || current.includes(familyId)) return current;
  return [...current, familyId];
}

function getEmptyRunStats() {
  return {
    kills: 0,
    bossKills: 0,
    damageDealt: 0,
    gold: 0,
    xp: 0,
    essence: 0,
    items: 0,
    bestDropName: null,
    bestDropRarity: null,
    bestDropHighlight: null,
    bestDropPerfectRolls: 0,
    bestDropScore: 0,
  };
}

function getEmptyPerformanceSnapshot() {
  return {
    damagePerTick: 0,
    goldPerTick: 0,
    xpPerTick: 0,
    killsPerMinute: 0,
  };
}

function mergeNumericBonuses(target = {}, source = {}) {
  const next = { ...(target || {}) };
  for (const [key, rawValue] of Object.entries(source || {})) {
    const value = Number(rawValue || 0);
    if (!Number.isFinite(value) || value === 0) continue;
    next[key] = Number(next[key] || 0) + value;
  }
  return next;
}

function getSanctuaryProgressTier(state) {
  return Math.max(
    1,
    Number(state?.combat?.maxTier || 1),
    Number(state?.combat?.prestigeCycle?.maxTier || 1),
    Number(state?.combat?.analytics?.maxTierReached || 1),
    Number(state?.prestige?.bestHistoricTier || 1)
  );
}

function getCombinedRunSigilBonuses(runSigilIds = "free", expedition = {}) {
  return mergeNumericBonuses(
    getRunSigilPlayerBonuses(runSigilIds),
    expedition?.activeInfusionPlayerBonuses || {}
  );
}

function consumeSigilInfusions(sanctuary = {}, runSigilIds = []) {
  const nextInfusions = { ...(sanctuary?.sigilInfusions || {}) };
  const appliedSigilIds = [];
  let activeInfusionPlayerBonuses = {};
  let activeExtractionBonuses = {};

  for (const sigilId of [...new Set(runSigilIds.map(id => getRunSigil(id).id).filter(Boolean))]) {
    const activeInfusion = nextInfusions[sigilId];
    const charges = Math.max(0, Number(activeInfusion?.charges || 0));
    if (charges <= 0) continue;

    appliedSigilIds.push(sigilId);
    activeInfusionPlayerBonuses = mergeNumericBonuses(
      activeInfusionPlayerBonuses,
      activeInfusion.playerBonuses || {}
    );
    activeExtractionBonuses = mergeNumericBonuses(
      activeExtractionBonuses,
      activeInfusion.extractionBonuses || {}
    );

    if (charges <= 1) {
      delete nextInfusions[sigilId];
    } else {
      nextInfusions[sigilId] = {
        ...activeInfusion,
        charges: charges - 1,
      };
    }
  }

  return {
    sanctuary: {
      ...createEmptySanctuaryState(),
      ...(sanctuary || {}),
      sigilInfusions: nextInfusions,
    },
    appliedSigilIds,
    activeInfusionPlayerBonuses,
    activeExtractionBonuses,
  };
}

function buildRetainedExtractionItem(state, selectedProjectItemId, sourceMeta = {}) {
  if (!selectedProjectItemId) return null;
  const previewOption = (state?.expedition?.extractionPreview?.projectOptions || []).find(
    option => option?.itemId === selectedProjectItemId
  );
  if (previewOption?.source === "tutorial" && previewOption?.previewItem) {
    return buildExtractedItemRecord(previewOption.previewItem, sourceMeta);
  }
  const inventoryItems = Array.isArray(state?.player?.inventory) ? state.player.inventory : [];
  const equipmentItems = [state?.player?.equipment?.weapon, state?.player?.equipment?.armor].filter(Boolean);
  const candidate = [...equipmentItems, ...inventoryItems].find(item => item?.id === selectedProjectItemId);
  if (isMaterializedBlueprintItem(candidate)) return null;
  return candidate ? buildExtractedItemRecord(candidate, sourceMeta) : null;
}

function buildPostExtractionExpeditionReset(state, { exitReason = "retire", goldMultiplier = 1 } = {}) {
  const nextRunContext =
    state.combat?.runContext ||
    (Number(state.prestige?.level || 0) >= 1 ? createRunContext() : createRunContext({ firstRun: true }));
  const maxHp = Math.max(1, Number(state.player?.maxHp || 1));
  return {
    ...state,
    currentTab: "sanctuary",
    player: refreshStats({
      ...state.player,
      hp: maxHp,
      gold: Math.max(0, Math.floor((state.player?.gold || 0) * goldMultiplier)),
      inventory: [],
      equipment: { weapon: null, armor: null },
    }),
    expedition: {
      ...createEmptyExpeditionState(),
      phase: "sanctuary",
    },
    combat: {
      ...state.combat,
      enemy: spawnEnemy(1, nextRunContext),
      runContext: nextRunContext,
      currentTier: 1,
      maxTier: 1,
      autoAdvance: false,
      ticksInCurrentRun: 0,
      sessionKills: 0,
      effects: [],
      lastRunTier: state.combat?.maxTier || state.combat?.currentTier || 1,
      talentBuffs: [],
      triggerCounters: {
        kills: 0,
        onHit: 0,
        crit: 0,
        onDamageTaken: 0,
      },
      pendingOnKillDamage: 0,
      pendingMageVolatileMult: 1,
      floatEvents: [],
      runStats: getEmptyRunStats(),
      performanceSnapshot: getEmptyPerformanceSnapshot(),
      latestLootEvent: null,
      inventoryOverflowEvent: null,
      inventoryOverflowStats: { total: 0, displaced: 0, lost: 0, lastAt: null },
      pendingOpenLootFilter: false,
      lastRunSummary: null,
      offlineSummary: null,
      reforgeSession: null,
    },
  };
}

function buildPrestigeResetState(state, { echoesGained, nextPrestigeLevel, nextPrestigeState, resetRunSigilIds, nextRunContext, preserveSanctuary = true, nextExpeditionPhase = null, logLine = null } = {}) {
  const resetClass = true;
  const basePlayer = {
    level: 1, xp: 0,
    baseDamage:     10,
    baseDefense:    2,
    baseCritChance: 0.05,
    baseMaxHp:      100,
    damagePct: 0, flatDamage: 0,
    defensePct: 0, flatDefense: 0,
    hpPct: 0, flatRegen: 0, flatCrit: 0, critDamage: 0,
    flatGold: 0, goldPct: 0, xpPct: 0,
    attackSpeed: 0, lifesteal: 0, blockChance: 0, thorns: 0,
    multiHitChance: 0, bleedChance: 0, bleedDamage: 0, fractureChance: 0,
    battleHardened: 0, heavyImpact: 0, bloodStrikes: 0, combatFlow: 0,
    ironConversion: 0, crushingWeight: 0, frenziedChain: 0, bloodDebt: 0,
    lastBreath: 0, execution: 0, ironCore: 0, fortress: 0,
    unmovingMountain: 0, titanicMomentum: 0,
    arcaneEcho: 0, arcaneMark: 0, arcaneFlow: 0, overchannel: 0,
    perfectCast: 0, freshTargetDamage: 0, chainBurst: 0, unstablePower: 0,
    overload: 0, volatileCasting: 0, controlMastery: 0, markTransfer: 0,
    temporalFlow: 0, spellMemory: 0, timeLoop: 0, absoluteControl: 0,
    cataclysm: 0,
    gold: 0,
    essence: state.player.essence || 0,
    prestigeBonuses: {},
    codexBonuses: state.player.codexBonuses || {},
    runSigilBonuses: {},
    inventory: [],
    equipment: { weapon: null, armor: null },
    upgrades: {},
    unlockedTalents: [],
    talentLevels: {},
    talentSystemVersion: state.player.talentSystemVersion,
    talentPoints: 0,
    class: resetClass ? null : state.player.class,
    specialization: resetClass ? null : state.player.specialization,
  };

  const freshPlayer = syncPrestigeBonuses(basePlayer, nextPrestigeState);
  freshPlayer.hp = freshPlayer.maxHp;

  return withAchievementProgress({
    ...state,
    currentTab: "sanctuary",
    player: freshPlayer,
    stats: {
      ...state.stats,
      prestigeCount: (state.stats?.prestigeCount || 0) + 1,
    },
    prestige: nextPrestigeState,
    sanctuary: preserveSanctuary
      ? {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
        }
      : createEmptySanctuaryState(),
    expedition: {
      ...createEmptyExpeditionState(),
      phase: nextExpeditionPhase || "sanctuary",
    },
    combat: {
      enemy: spawnEnemy(1, nextRunContext),
      log: [logLine].filter(Boolean),
      currentTier: 1,
      maxTier: 1,
      autoAdvance: false,
      ticksInCurrentRun: 0,
      sessionKills: 0,
      effects: [],
      lastRunTier: state.combat.maxTier,
      talentBuffs: [],
      triggerCounters: {
        kills: 0,
        onHit: 0,
        crit: 0,
        onDamageTaken: 0,
      },
      pendingOnKillDamage: 0,
      pendingMageVolatileMult: 1,
      floatEvents: [],
      runStats: getEmptyRunStats(),
      performanceSnapshot: getEmptyPerformanceSnapshot(),
      latestLootEvent: null,
      inventoryOverflowEvent: null,
      inventoryOverflowStats: { total: 0, displaced: 0, lost: 0, lastAt: null },
      pendingOpenLootFilter: false,
      reforgeSession: null,
      runContext: nextRunContext,
      pendingRunSetup: false,
      pendingRunSigilId: resetRunSigilIds[0] || "free",
      pendingRunSigilIds: resetRunSigilIds,
      activeRunSigilId: resetRunSigilIds[0] || "free",
      activeRunSigilIds: resetRunSigilIds,
      lastRunSummary: null,
      offlineSummary: null,
      prestigeCycle: createEmptyPrestigeCycleProgress(),
      analytics: {
        ...(state.combat.analytics || createEmptySessionAnalytics()),
        prestigeCount: (state.combat.analytics?.prestigeCount || 0) + 1,
        goldSpentBySource: {
          ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
          prestige: state.combat.analytics?.goldSpentBySource?.prestige || 0,
        },
        maxLevelReached: Math.max(state.combat.analytics?.maxLevelReached || 1, state.player.level || 1),
        maxTierReached: Math.max(state.combat.analytics?.maxTierReached || 1, state.combat.maxTier || 1),
        firstPrestigeTick:
          state.combat.analytics?.firstPrestigeTick == null
            ? (state.combat.analytics?.ticks || 0)
            : state.combat.analytics?.firstPrestigeTick,
      },
    },
  });
}

function resolveDomainAction(state, action) {
  const accountState = handleAccountStateAction(state, action, {
    createFreshState,
    deriveExpeditionPhase,
    getAccountTelemetry,
    getSaveDiagnostics,
    mergeStateWithDefaults,
    trackAccountPhaseTime,
  });
  if (accountState) return accountState;

  const progressionMetaState = handleProgressionMetaAction(state, action, { withAchievementProgress });
  if (progressionMetaState) return progressionMetaState;

  const extractionResolutionState = handleExtractionResolutionAction(state, action, {
    buildExtractionPreview,
    buildPostExtractionExpeditionReset,
    buildPrestigeResetState,
    buildRetainedExtractionItem,
    calculatePrestigeEchoGain,
    canPrestige,
    createEmptySanctuaryState,
    createRunContext,
    ensureValidActiveBlueprints,
    finalizeExpeditionTelemetry,
    getAccountTelemetry,
    getCurrentOnlineSeconds,
    getMaxRunSigilSlots,
    normalizeBlueprintRecord,
    normalizeExtractedItemRecord,
    normalizeRunSigilIds,
    withAchievementProgress,
  });
  if (extractionResolutionState) return extractionResolutionState;

  const runFlowState = handleRunFlowAction(state, action, {
    appendSeenFamilyIds,
    buildExtractionPreview,
    consumeBlueprintMaterialization,
    consumeSigilInfusions,
    createEmptyExpeditionState,
    createEmptySanctuaryState,
    createRunContext,
    ensureValidActiveBlueprints,
    formatRunSigilLoadout,
    getAccountTelemetry,
    getCombinedRunSigilBonuses,
    getEmptyPerformanceSnapshot,
    getEmptyRunStats,
    getRunSigil,
    isExtractionUnlocked,
    isRunSigilsUnlocked,
    materializeBlueprintLoadout,
    ONBOARDING_STEPS,
    recordCodexSighting,
    refreshStats,
    resolveRunSigilLoadout,
    selectRunSigilLoadout,
    spawnEnemy,
    summarizeRunSigilLoadout,
    syncCodexBonuses,
    syncPrestigeBonuses,
  });
  if (runFlowState) return runFlowState;

  const sanctuaryJobsState = handleSanctuaryJobsAction(state, action, {
    ONBOARDING_STEPS,
    SANCTUARY_STATION_DEFAULTS,
    addBlueprintCharges,
    applyLaboratoryResearch,
    buildBlueprintChargeReward,
    createCodexResearchJob,
    createDeepForgeProjectJob: createForgeProjectJob,
    createDistillJob,
    createEmptyFamilyChargeState,
    createEmptyLaboratoryState,
    createEmptySanctuaryState,
    createLaboratoryResearchJob,
    createSanctuaryErrandJob,
    createScrapExtractedItemJob,
    createSigilInfusionJob,
    createEmptySessionAnalytics,
    deepForgeUpgradeProject,
    ensureTutorialCargoBundle,
    ensureValidActiveBlueprints,
    getAccountTelemetry,
    getRunSigil,
    getSanctuaryProgressTier,
    normalizeAbyssState,
    normalizeBlueprintRecord,
    normalizeCodexState,
    normalizeExtractedItemRecord,
    normalizeProjectRecord,
    syncCodexBonuses,
    syncSanctuaryJobs,
    withAchievementProgress,
  });
  if (sanctuaryJobsState) return sanctuaryJobsState;

  const blueprintForgeState = handleBlueprintForgeAction(state, action, {
    addBlueprintCharges,
    ascendBlueprint,
    buildBlueprintAscensionPreview,
    buildBlueprintChargeReward,
    buildBlueprintFromExtractedItem,
    buildBlueprintPowerTunePreview,
    buildBlueprintStructurePreview,
    buildDeepForgeReforgePreview,
    canAscendBlueprint,
    canDeepForgeProject,
    canTuneBlueprintPower,
    canUpgradeBlueprintStructure,
    createEmptyFamilyChargeState,
    createEmptySanctuaryState,
    createEmptySessionAnalytics,
    deepForgeApplyReforge,
    deepForgeAscendProject,
    deepForgePolishProject,
    deepForgeRerollProject,
    ensureValidActiveBlueprints,
    getAccountTelemetry,
    getLegendaryPowerImprintReduction,
    getUnlockedLegendaryPowers,
    isSanctuaryStationUnlocked,
    investBlueprintAffinity,
    normalizeBlueprintRecord,
    normalizeExtractedItemRecord,
    normalizeProjectRecord,
    refreshStats,
    tuneBlueprintPower,
    upgradeBlueprintStructure,
    withAchievementProgress,
  });
  if (blueprintForgeState) return blueprintForgeState;

  const classProgressionState = handleClassProgressionAction(state, action, {
    ONBOARDING_STEPS,
    createEmptyExpeditionState,
    createEmptyOnboardingState,
    isRunSigilsUnlocked,
    normalizeOnboardingState,
    selectClass,
    selectSpecialization,
  });
  if (classProgressionState) return classProgressionState;

  const metaProgressionState = handleMetaProgressionAction(state, action, {
    ONBOARDING_STEPS,
    PRESTIGE_TREE_NODES,
    buildPrestigeResetState,
    calculatePrestigeEchoGain,
    canPrestige,
    canPurchasePrestigeNode,
    createEmptySessionAnalytics,
    createRunContext,
    getMaxRunSigilSlots,
    getOnboardingFirstEchoNodeId,
    normalizeRunSigilIds,
    resetTalentTree,
    syncPrestigeBonuses,
    unlockTalent,
    upgradePlayer,
    upgradeTalentNode,
    withAchievementProgress,
  });
  if (metaProgressionState) return metaProgressionState;

  const systemUiState = handleSystemUiAction(state, action);
  if (systemUiState) return systemUiState;

  return null;
}

function baseGameReducer(state, action) {
  const resolvedDomainState = resolveDomainAction(state, action);
  if (resolvedDomainState) return resolvedDomainState;

  if (getBlockedOnboardingAction(state?.onboarding?.step, action, state)) {
    if (action?.meta?.source === "ui") {
      const blockedMessage = getOnboardingBlockedActionMessage(
        state?.onboarding?.step,
        action,
        state
      );
      if (blockedMessage) {
        const currentLog = state?.combat?.log || [];
        const lastEntry = currentLog[currentLog.length - 1] || "";
        const logEntry = `Seguridad: ${blockedMessage}`;
        if (lastEntry !== logEntry) {
          return {
            ...state,
            combat: {
              ...state.combat,
              log: [...currentLog, logEntry].slice(-20),
            },
          };
        }
      }
    }
    return state;
  }

  switch (action.type) {

    case "SET_TAB":
      if (state.combat?.reforgeSession && action.tab !== state.currentTab) {
        return state;
      }
      if (!state.player?.class && state.expedition?.phase === "setup" && action.tab !== "sanctuary") {
        return {
          ...state,
          currentTab: "sanctuary",
          combat: {
            ...state.combat,
            pendingOpenLootFilter: false,
          },
        };
      }
      if (action.tab === "sanctuary" && isSanctuaryLockedDuringExpeditionTutorial(state)) {
        return {
          ...state,
          currentTab: "combat",
          combat: {
            ...state.combat,
            pendingOpenLootFilter: false,
          },
        };
      }
      {
        const nextTab = action.tab === "lab"
          ? (["active", "setup"].includes(state.expedition?.phase || "sanctuary") ? "combat" : "sanctuary")
          : action.tab;
      return {
        ...state,
        currentTab: nextTab,
        combat: {
          ...state.combat,
          pendingOpenLootFilter: nextTab === "inventory" ? Boolean(state.combat?.pendingOpenLootFilter) : false,
        },
      };
      }

    case "REPAIR_EXPEDITION_STATE": {
      const expedition = state?.expedition || createEmptyExpeditionState();
      const combat = state?.combat || {};
      const phase = expedition?.phase || "sanctuary";
      const hasRunEvidence = hasExpeditionRunEvidence(state);
      const reason = action?.reason || "runtime_guard";
      const repairedAt = Number(action?.now || Date.now());
      const telemetryOnly = Boolean(action?.telemetryOnly);
      const offlineJobStall = reason === "offline_job_stall";

      if (!state?.player?.class) return state;
      if (phase === "extraction") return state;

      const needsPhaseRepair =
        phase !== "active" &&
        phase !== "setup" &&
        !combat?.pendingRunSetup &&
        hasRunEvidence;
      const needsEnemyRepair =
        phase === "active" &&
        !combat?.enemy;
      const needsSetupRepair =
        phase === "active" &&
        Boolean(combat?.pendingRunSetup);
      const needsIdentityRepair =
        phase === "active" &&
        hasRunEvidence &&
        (!expedition?.id || !expedition?.startedAt);
      const repaired = needsPhaseRepair || needsEnemyRepair || needsSetupRepair || needsIdentityRepair;

      if (!repaired && !telemetryOnly) {
        return state;
      }

      const repairedStartedAt =
        Number(expedition?.startedAt || 0) > 0
          ? Number(expedition.startedAt)
          : repairedAt;
      const repairedId =
        expedition?.id ||
        `expedition_recovered_${repairedStartedAt}`;
      const repairedEnemy =
        combat?.enemy ||
        spawnEnemy(
          Math.max(1, Number(combat?.currentTier || 1)),
          combat?.runContext || createRunContext()
        );
      const recoveryReason = reason;
      const recoveryLog = `RECOVERY: expedicion restaurada (${recoveryReason}).`;
      const combatLog = Array.isArray(combat?.log) ? combat.log : [];
      const lastLogEntry = combatLog[combatLog.length - 1] || "";
      const nextTelemetry = markRuntimeRecoveryTelemetry(getAccountTelemetry(state), {
        now: repairedAt,
        reason: recoveryReason,
        repaired,
        offlineJobStall,
      });

      if (!repaired && telemetryOnly) {
        return {
          ...state,
          accountTelemetry: nextTelemetry,
        };
      }

      return {
        ...state,
        expedition: {
          ...expedition,
          phase: needsPhaseRepair ? "active" : phase,
          id: needsPhaseRepair || needsIdentityRepair ? repairedId : expedition.id,
          startedAt: needsPhaseRepair || needsIdentityRepair ? repairedStartedAt : expedition.startedAt,
          exitReason: needsPhaseRepair ? null : expedition.exitReason,
        },
        combat: {
          ...combat,
          pendingRunSetup: needsSetupRepair || needsPhaseRepair ? false : Boolean(combat?.pendingRunSetup),
          enemy: needsEnemyRepair || needsPhaseRepair ? repairedEnemy : combat.enemy,
          log: lastLogEntry === recoveryLog ? combatLog : [...combatLog, recoveryLog].slice(-20),
        },
        accountTelemetry: nextTelemetry,
      };
    }

    case "SET_QA_ONBOARDING_STEP": {
      const onboarding = normalizeOnboardingState(state.onboarding || createEmptyOnboardingState());
      const step = action.step || null;
      const requiredTab = action.tab || getOnboardingRequiredTab(step) || state.currentTab;
      return {
        ...state,
        currentTab: requiredTab,
        onboarding: {
          ...onboarding,
          completed: false,
          step,
        },
      };
    }

    case "TICK":
      return processTick(state);

    case "BULK_TICK": {
      const count = Math.max(0, Math.min(action.count || 0, 3600));
      let nextState = state;
      const before = state;
      let bestLootEvent = null;

      for (let i = 0; i < count; i++) {
        nextState = processTick(nextState);
        const candidateLoot = nextState.combat?.latestLootEvent;
        if (!candidateLoot) continue;

        const currentScore = Number(candidateLoot.score || 0);
        const bestScore = Number(bestLootEvent?.score || 0);
        if (
          !bestLootEvent ||
          currentScore > bestScore ||
          (currentScore === bestScore && (candidateLoot.rating || 0) > (bestLootEvent.rating || 0))
        ) {
          bestLootEvent = candidateLoot;
        }
      }

      if (count > 0 && action.source === "offline") {
        const bestDropSource =
          bestLootEvent
            ? {
                bestDropName: bestLootEvent.name,
                bestDropRarity: bestLootEvent.rarity,
                bestDropHighlight: bestLootEvent.highlight,
                bestDropPerfectRolls: bestLootEvent.perfectRollCount,
              }
            : nextState.combat.runStats?.bestDropName
              ? nextState.combat.runStats
            : nextState.combat.lastRunSummary;
        const offlineSummary = {
          simulatedSeconds: count,
          goldGained: Math.max(0, Math.floor((nextState.player.gold || 0) - (before.player.gold || 0))),
          xpGained: Math.max(
            0,
            Math.floor(
              getLifetimeXp(nextState.player.level || 1, nextState.player.xp || 0) -
              getLifetimeXp(before.player.level || 1, before.player.xp || 0)
            )
          ),
          essenceGained: Math.max(0, Math.floor((nextState.player.essence || 0) - (before.player.essence || 0))),
          killsGained: Math.max(0, (nextState.stats?.kills || 0) - (before.stats?.kills || 0)),
          itemsGained: Math.max(0, (nextState.stats?.itemsFound || 0) - (before.stats?.itemsFound || 0)),
          levelsGained: Math.max(0, (nextState.player.level || 0) - (before.player.level || 0)),
          bestDropName: bestDropSource?.bestDropName || null,
          bestDropRarity: bestDropSource?.bestDropRarity || null,
          bestDropHighlight: bestDropSource?.bestDropHighlight || null,
          bestDropPerfectRolls: bestDropSource?.bestDropPerfectRolls || 0,
        };

        return {
          ...nextState,
          combat: {
            ...nextState.combat,
            offlineSummary,
            floatEvents: [],
            log: [
              ...nextState.combat.log,
              `Progreso offline resuelto: ${count}s simulados.`,
            ].slice(-20),
          },
        };
      }

      return nextState;
    }

    case "DISMISS_OFFLINE_SUMMARY":
      return {
        ...state,
        combat: {
          ...state.combat,
          offlineSummary: null,
        },
      };

    case "SET_OFFLINE_SUMMARY":
      return {
        ...state,
        combat: {
          ...state.combat,
          offlineSummary: action.summary || null,
          floatEvents: [],
          log: [
            ...(state.combat.log || []),
            `Progreso offline resuelto: ${Math.max(0, Math.floor(action.summary?.simulatedSeconds || 0))}s simulados.`,
          ].slice(-20),
        },
      };

    case "TOGGLE_AUTO_ADVANCE":
      return {
        ...state,
        combat: {
          ...state.combat,
          autoAdvance: !state.combat.autoAdvance,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            autoAdvanceEnabledCount:
              (state.combat.analytics?.autoAdvanceEnabledCount || 0) + (state.combat.autoAdvance ? 0 : 1),
            autoAdvanceDisabledCount:
              (state.combat.analytics?.autoAdvanceDisabledCount || 0) + (state.combat.autoAdvance ? 1 : 0),
          },
        },
      };

    // --------------------------------------------------------
    case "SET_TIER": {
      const firstBossRetreatLocked =
        Boolean(state?.combat?.enemy?.isBoss) && !Boolean(state?.onboarding?.flags?.firstDeathSeen);
      const requestedTier = Number(action.tier || 1);
      const currentTierValue = Number(state?.combat?.currentTier || 1);
      if (firstBossRetreatLocked && requestedTier < currentTierValue) {
        return state;
      }
      const tierCap  = getAbyssTierCap(state?.abyss || {});
      const tier     = Math.max(1, Math.min(requestedTier, state.combat.maxTier, tierCap));
      const prevTier = state.combat.currentTier || 1;
      const runContext = state.combat?.runContext || createRunContext();
      const nextEnemy = spawnEnemy(tier, runContext);

      let newState = {
        ...state,
        combat: {
          ...state.combat,
          currentTier:       tier,
          autoAdvance:       false,
          enemy:             nextEnemy,
          runContext,
          ticksInCurrentRun: 0,
          sessionKills:      0,
          effects:           [],
          triggerCounters: {
            kills: 0,
            onHit: 0,
            crit: 0,
            onDamageTaken: 0,
          },
          pendingOnKillDamage: 0,
          floatEvents: [],
          runStats: {
            kills: 0,
            bossKills: 0,
            damageDealt: 0,
            gold: 0,
            xp: 0,
            essence: 0,
            items: 0,
            bestDropName: null,
            bestDropRarity: null,
            bestDropHighlight: null,
            bestDropPerfectRolls: 0,
            bestDropScore: 0,
          },
          performanceSnapshot: {
            damagePerTick: 0,
            goldPerTick: 0,
            xpPerTick: 0,
            killsPerMinute: 0,
          },
          latestLootEvent: null,
          inventoryOverflowEvent: null,
          inventoryOverflowStats: { total: 0, displaced: 0, lost: 0, lastAt: null },
          pendingOpenLootFilter: false,
          reforgeSession: null,
          analytics: state.combat.analytics || createEmptySessionAnalytics(),
          log:               [],
        },
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          seenFamilyIds: appendSeenFamilyIds(state.expedition || createEmptyExpeditionState(), nextEnemy),
        },
      };

      const nextAnalytics = {
        ...(newState.combat.analytics || createEmptySessionAnalytics()),
        tierAdvanceCount: (newState.combat.analytics?.tierAdvanceCount || 0) + (tier > prevTier ? 1 : 0),
        autoAdvanceDisabledCount:
          (newState.combat.analytics?.autoAdvanceDisabledCount || 0) + (state.combat.autoAdvance ? 1 : 0),
      };
      newState = {
        ...newState,
        combat: {
          ...newState.combat,
          analytics: nextAnalytics,
        },
      };

      const sightedCodex = recordCodexSighting(newState.codex || state.codex || {}, newState.combat.enemy);
      if (sightedCodex !== (newState.codex || state.codex)) {
        newState = {
          ...newState,
          codex: sightedCodex,
          player: syncCodexBonuses(newState.player, sightedCodex),
        };
      }

      return newState;
    }

    // --------------------------------------------------------
    case "EQUIP_ITEM": {
      const item    = action.item;
      const slot    = item.type === "weapon" ? "weapon" : "armor";
      const oldItem = state.player.equipment[slot];

      let inventory = [...state.player.inventory];
      if (oldItem) {
        const result = addToInventory(inventory, oldItem);
        inventory = result.inventory;
      }

      const idx = inventory.findIndex(i => i.id === item.id);
      inventory = inventory.filter((_, i) => i !== idx);

      return {
        ...state,
        player: refreshStats({
          ...state.player,
          inventory,
          equipment: { ...state.player.equipment, [slot]: item },
        }),
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            equippedUpgrades:
              (state.combat.analytics?.equippedUpgrades || 0) +
              ((item?.rating || 0) > (oldItem?.rating || 0) ? 1 : 0),
            bestItemRating: Math.max(state.combat.analytics?.bestItemRating || 0, item?.rating || 0),
          },
        },
      };
    }

    case "SELL_ITEM": {
      const itemId = action.item?.id;
      if (isEquippedItemId(state.player, itemId)) {
        return buildBlockedOperationState(state, {
          analyticsKey: "blockedSellEquippedAttempts",
          message: "Seguridad: intento de vender item equipado bloqueado.",
        });
      }
      const soldItem = state.player.inventory.find(item => item.id === action.item.id);
      const newPlayer = sellItem(state.player, action.item.id);
      if (!newPlayer) return state;
      return withAchievementProgress({
        ...state,
        player: newPlayer,
        stats: {
          ...state.stats,
          itemsSold: (state.stats?.itemsSold || 0) + 1,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            itemsSold: ((state.combat.analytics?.itemsSold || 0) + 1),
            goldEarned: (state.combat.analytics?.goldEarned || 0) + Math.max(0, (newPlayer.gold || 0) - (state.player.gold || 0)),
            goldBySource: {
              ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
              selling: (state.combat.analytics?.goldBySource?.selling || 0) + Math.max(0, (newPlayer.gold || 0) - (state.player.gold || 0)),
            },
            bestItemRating: Math.max(state.combat.analytics?.bestItemRating || 0, soldItem?.rating || 0),
          },
        },
      });
    }

    case "SELL_ITEMS": {
      const requestedIds = Array.isArray(action.itemIds) ? [...new Set(action.itemIds)] : [];
      if (requestedIds.length === 0) return state;

      const blockedCount = requestedIds.filter(itemId => isEquippedItemId(state.player, itemId)).length;
      const inventoryIdSet = new Set((state.player.inventory || []).map(item => item.id));
      const safeIds = requestedIds.filter(itemId => inventoryIdSet.has(itemId) && !isEquippedItemId(state.player, itemId));

      if (safeIds.length === 0 && blockedCount > 0) {
        return {
          ...buildBlockedOperationState(state, {
            analyticsKey: "blockedSellEquippedAttempts",
            message: "Seguridad: intento de venta masiva sobre equipados bloqueado.",
          }),
          combat: {
            ...state.combat,
            analytics: {
              ...(state.combat.analytics || createEmptySessionAnalytics()),
              blockedSellEquippedAttempts:
                (state.combat.analytics?.blockedSellEquippedAttempts || 0) + blockedCount,
            },
            log: [
              ...(state.combat?.log || []),
              `Seguridad: ${blockedCount} items equipados ignorados en venta masiva.`,
            ].slice(-20),
          },
        };
      }

      const newPlayer = sellItems(state.player, safeIds);
      if (!newPlayer) return state;
      const soldItems = (state.player.inventory || []).filter(item => safeIds.includes(item.id));
      const soldCount = soldItems.length;
      return withAchievementProgress({
        ...state,
        player: newPlayer,
        stats: {
          ...state.stats,
          itemsSold: (state.stats?.itemsSold || 0) + soldCount,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            itemsSold: (state.combat.analytics?.itemsSold || 0) + soldCount,
            blockedSellEquippedAttempts:
              (state.combat.analytics?.blockedSellEquippedAttempts || 0) + blockedCount,
            goldEarned: (state.combat.analytics?.goldEarned || 0) + Math.max(0, (newPlayer.gold || 0) - (state.player.gold || 0)),
            goldBySource: {
              ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
              selling: (state.combat.analytics?.goldBySource?.selling || 0) + Math.max(0, (newPlayer.gold || 0) - (state.player.gold || 0)),
            },
            bestItemRating: Math.max(
              state.combat.analytics?.bestItemRating || 0,
              ...soldItems.map(item => item.rating || 0)
            ),
          },
        },
      });
    }

    // --------------------------------------------------------
    // --------------------------------------------------------
    case "CRAFT_REROLL_ITEM": {
      const result = craftReroll({
        player:       state.player,
        itemId:       action.payload.itemId,
        currentTier:  state.combat.currentTier || 1,
        refreshStats,
      });
      if (!result) return state;
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
        ...state,
        player: result.newPlayer,
        stats: {
          ...state.stats,
          rerollsCrafted: (state.stats?.rerollsCrafted || 0) + 1,
        },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            rerollsCrafted: (state.combat.analytics?.rerollsCrafted || 0) + 1,
            goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              rerolls: (state.combat.analytics?.goldSpentBySource?.rerolls || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            },
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              rerolls: (state.combat.analytics?.essenceSpentBySource?.rerolls || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            },
          },
          log: [...(state.combat.log || []), result.log].slice(-20),
        },
      });
    }

    case "CRAFT_POLISH_ITEM": {
      const result = craftPolish({
        player: state.player,
        itemId: action.payload.itemId,
        affixIndex: action.payload.affixIndex,
        refreshStats,
      });
      if (!result) return state;
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      if (result.noChange) {
        return {
          ...state,
          player: result.newPlayer,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            reforgeSession: null,
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
        ...state,
        player: result.newPlayer,
        stats: {
          ...state.stats,
          polishesCrafted: (state.stats?.polishesCrafted || 0) + 1,
        },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            polishesCrafted: (state.combat.analytics?.polishesCrafted || 0) + 1,
            goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              polish: (state.combat.analytics?.goldSpentBySource?.polish || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            },
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              polish: (state.combat.analytics?.essenceSpentBySource?.polish || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            },
          },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    case "CRAFT_REFORGE_PREVIEW": {
      const result = craftReforgePreview({
        player: state.player,
        itemId: action.payload.itemId,
        affixIndex: action.payload.affixIndex,
        favoredStats: action.payload.favoredStats || [],
        extraAffixPool: action.payload.allowAbyssAffixes ? [...ABYSS_PREFIXES, ...ABYSS_SUFFIXES] : [],
      });
      if (!result) return state;
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            reforgeSession: null,
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
        ...state,
        player: result.newPlayer,
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          reforgeSession: {
            itemId: action.payload.itemId,
            affixIndex: action.payload.affixIndex,
            options: result.options || [],
          },
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              reforge: (state.combat.analytics?.goldSpentBySource?.reforge || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            },
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              reforge: (state.combat.analytics?.essenceSpentBySource?.reforge || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            },
          },
          log: [...(state.combat.log || []), result.log].slice(-20),
        },
      });
    }

    case "CRAFT_REFORGE_ITEM": {
      const activeSession = state.combat?.reforgeSession;
      if (
        !activeSession ||
        activeSession.itemId !== action.payload.itemId ||
        activeSession.affixIndex !== action.payload.affixIndex
      ) {
        return state;
      }
      const validOption = (activeSession.options || []).some(option =>
        option?.id === action.payload.replacementAffix?.id &&
        option?.stat === action.payload.replacementAffix?.stat &&
        option?.tier === action.payload.replacementAffix?.tier
      );
      if (!validOption) return state;

      const result = craftReforge({
        player: state.player,
        itemId: action.payload.itemId,
        affixIndex: action.payload.affixIndex,
        replacementAffix: action.payload.replacementAffix,
        refreshStats,
        skipCost: true,
      });
      if (!result) return state;
      if (result.noChange) {
        return {
          ...state,
          player: result.newPlayer,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            reforgeSession: null,
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            reforgeSession: null,
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
        ...state,
        player: result.newPlayer,
        stats: {
          ...state.stats,
          reforgesCrafted: (state.stats?.reforgesCrafted || 0) + 1,
        },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          reforgeSession: null,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            reforgesCrafted: (state.combat.analytics?.reforgesCrafted || 0) + 1,
            goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              reforge: (state.combat.analytics?.goldSpentBySource?.reforge || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            },
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              reforge: (state.combat.analytics?.essenceSpentBySource?.reforge || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            },
          },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    case "CRAFT_UPGRADE_ITEM": {
      const result = craftUpgrade({
        player:      state.player,
        itemId:      action.payload.itemId,
        refreshStats,
      });
      if (!result) return state;
      return withAchievementProgress({
          ...state,
          player: result.newPlayer,
          stats: {
            ...state.stats,
            upgradesCrafted: (state.stats?.upgradesCrafted || 0) + 1,
          },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
              ...(state.combat.analytics || createEmptySessionAnalytics()),
              upgradesCrafted: (state.combat.analytics?.upgradesCrafted || 0) + 1,
              goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
              goldSpentBySource: {
                ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
                upgrades: (state.combat.analytics?.goldSpentBySource?.upgrades || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
              },
              upgradesSucceeded: (state.combat.analytics?.upgradesSucceeded || 0) + (String(result.log || "").toLowerCase().includes("fall") ? 0 : 1),
              upgradesFailed: (state.combat.analytics?.upgradesFailed || 0) + (String(result.log || "").toLowerCase().includes("fall") ? 1 : 0),
              bestItemRating: Math.max(state.combat.analytics?.bestItemRating || 0, result.newPlayer?.equipment?.weapon?.rating || 0, result.newPlayer?.equipment?.armor?.rating || 0),
            },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    case "CRAFT_ASCEND_ITEM": {
      const selectedLegendaryPowerId = action.payload.legendaryPowerId || null;
      const result = craftAscend({
        player:      state.player,
        itemId:      action.payload.itemId,
        currentTier: state.combat.currentTier || 1,
        refreshStats,
        legendaryPowerId: selectedLegendaryPowerId,
        unlockedLegendaryPowerIds: Object.entries(state.codex?.powerDiscoveries || {})
          .filter(([, discoveries]) => Number(discoveries || 0) > 0)
          .map(([powerId]) => powerId),
        legendaryPowerImprintReduction: getLegendaryPowerImprintReduction(state.codex || {}, selectedLegendaryPowerId),
      });
      if (!result) return state;
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
          ...state,
          player: result.newPlayer,
          stats: {
            ...state.stats,
            ascendsCrafted: (state.stats?.ascendsCrafted || 0) + 1,
          },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
              ...(state.combat.analytics || createEmptySessionAnalytics()),
              ascendsCrafted: (state.combat.analytics?.ascendsCrafted || 0) + 1,
              powerAscendsCrafted:
                (state.combat.analytics?.powerAscendsCrafted || 0) +
                (selectedLegendaryPowerId ? 1 : 0),
              goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
              essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
              goldSpentBySource: {
                ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
                ascends: (state.combat.analytics?.goldSpentBySource?.ascends || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
              },
              essenceSpentBySource: {
                ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
                ascends: (state.combat.analytics?.essenceSpentBySource?.ascends || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
              },
              bestItemRating: Math.max(state.combat.analytics?.bestItemRating || 0, result.newPlayer?.equipment?.weapon?.rating || 0, result.newPlayer?.equipment?.armor?.rating || 0),
            },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    case "CRAFT_EXTRACT_ITEM": {
      const itemId = action.payload?.itemId;
      if (isEquippedItemId(state.player, itemId)) {
        return buildBlockedOperationState(state, {
          analyticsKey: "blockedExtractEquippedAttempts",
          message: "Seguridad: intento de extraer item equipado bloqueado.",
        });
      }
      const result = craftExtract({
        player: state.player,
        itemId,
      });
      if (!result) return state;
      return withAchievementProgress({
          ...state,
          player: result.newPlayer,
          stats: {
            ...state.stats,
            itemsExtracted: (state.stats?.itemsExtracted || 0) + 1,
          },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
              ...(state.combat.analytics || createEmptySessionAnalytics()),
              itemsExtracted: (state.combat.analytics?.itemsExtracted || 0) + 1,
              essenceEarned: (state.combat.analytics?.essenceEarned || 0) + Math.max(0, (result.newPlayer?.essence || 0) - (state.player.essence || 0)),
              essenceBySource: {
                ...(state.combat.analytics?.essenceBySource || createEmptySessionAnalytics().essenceBySource),
                extract: (state.combat.analytics?.essenceBySource?.extract || 0) + Math.max(0, (result.newPlayer?.essence || 0) - (state.player.essence || 0)),
              },
            },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    // --------------------------------------------------------
    default:
      return state;
  }
}

function withAbyssProgression(prevState, nextState) {
  const highestTierCandidate = Math.max(
    Number(prevState?.abyss?.highestTierReached || 1),
    Number(nextState?.combat?.currentTier || 1),
    Number(nextState?.combat?.maxTier || 1),
    Number(nextState?.combat?.prestigeCycle?.maxTier || 1),
    Number(nextState?.combat?.analytics?.maxTierReached || 1)
  );
  const { abyss, newlyUnlocked, changed } = syncAbyssState(
    nextState?.abyss || prevState?.abyss || {},
    highestTierCandidate
  );
  if (!changed) return nextState;

  const slots = getMaxRunSigilSlots(abyss);
  const pendingRunSigilIds = normalizeRunSigilIds(
    nextState?.combat?.pendingRunSigilIds || nextState?.combat?.pendingRunSigilId || "free",
    { slots }
  );
  const activeRunSigilIds = normalizeRunSigilIds(
    nextState?.combat?.activeRunSigilIds || nextState?.combat?.activeRunSigilId || "free",
    { slots }
  );
  const unlockLogs = newlyUnlocked.map(
    unlock => `HITO DE ABISMO: ${unlock.name}. ${unlock.reward}.`
  );

  return {
    ...nextState,
    abyss,
    player: {
      ...nextState.player,
      runSigilBonuses: nextState?.combat?.pendingRunSetup
        ? {}
        : getCombinedRunSigilBonuses(activeRunSigilIds, nextState?.expedition || {}),
    },
    combat: {
      ...nextState.combat,
      pendingRunSigilId: pendingRunSigilIds[0] || "free",
      pendingRunSigilIds,
      activeRunSigilId: activeRunSigilIds[0] || "free",
      activeRunSigilIds,
      log: [...(nextState?.combat?.log || []), ...unlockLogs].slice(-20),
    },
  };
}

function withExpeditionState(prevState, nextState) {
  const nextPhase = deriveExpeditionPhase(nextState);
  const prevPhase = prevState?.expedition?.phase || deriveExpeditionPhase(prevState);
  const expedition = {
    ...createEmptyExpeditionState(),
    ...(nextState?.expedition || {}),
    phase: nextPhase,
  };

  let currentTab = nextState?.currentTab || "sanctuary";
  if (currentTab === "lab") {
    currentTab = nextPhase === "active" || nextPhase === "setup" ? "combat" : "sanctuary";
  }
  if (nextPhase === "sanctuary" && (currentTab === "combat" || currentTab === "inventory" || currentTab === "crafting" || currentTab === "codex")) {
    currentTab = "sanctuary";
  }
  if (
    prevPhase !== "active" &&
    nextPhase === "active" &&
    (currentTab === "character" || currentTab === "skills" || currentTab === "talents" || currentTab === "registry" || currentTab === "account" || currentTab === "achievements" || currentTab === "stats" || currentTab === "system" || currentTab === "sanctuary")
  ) {
    currentTab = "combat";
  }

  const shouldRepairRunSetup =
    nextPhase === "setup" &&
    Boolean(nextState?.player?.class) &&
    Number(nextState?.prestige?.level || 0) >= 1;

  return {
    ...nextState,
    currentTab,
    sanctuary: {
      ...createEmptySanctuaryState(),
      ...(nextState?.sanctuary || {}),
    },
    expedition,
    combat: {
      ...nextState.combat,
      pendingRunSetup: Boolean(nextState?.combat?.pendingRunSetup) || shouldRepairRunSetup,
    },
  };
}

export function gameReducer(state, action) {
  const baseNextState = withAbyssProgression(state, baseGameReducer(state, action));
  if (baseNextState === state) return state;

  const onboardingState = advanceOnboarding(
    state,
    withExpeditionState(state, baseNextState),
    action
  );
  const trackedOnboardingState = {
    ...onboardingState,
    onboarding: trackOnboardingCompletedBeats(
      state?.onboarding || {},
      onboardingState?.onboarding || {}
    ),
  };
  const telemetryState = applyDerivedAccountTelemetry(state, trackedOnboardingState);
  const stashSyncedState = {
    ...telemetryState,
    sanctuary: {
      ...createEmptySanctuaryState(),
      ...(telemetryState?.sanctuary || {}),
      itemStash: syncItemStashState(
        telemetryState?.sanctuary?.itemStash || {},
        telemetryState?.sanctuary?.extractedItems || []
      ),
    },
  };
  const weeklyLedgerState = {
    ...stashSyncedState,
    weeklyLedger: ensureWeeklyLedger(
      stashSyncedState,
      stashSyncedState?.weeklyLedger || {},
      action?.now || Date.now()
    ),
  };
  return recordReplayState(state, weeklyLedgerState, action);
}


