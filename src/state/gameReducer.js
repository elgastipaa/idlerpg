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
import { buildReplayLibraryEntry, createEmptyReplayLog, normalizeReplayLibrary, recordReplayState } from "../utils/replayLog";
import { buildExtractionPreview } from "../engine/sanctuary/extractionEngine";
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
import {
  applyLaboratoryResearch,
  createEmptyLaboratoryState,
  createLaboratoryResearchJob,
  isSanctuaryStationUnlocked,
  SANCTUARY_STATION_DEFAULTS,
} from "../engine/sanctuary/laboratoryEngine";

import { CLASSES }         from "../data/classes";
import { PLAYER_UPGRADES } from "../data/playerUpgrades";
import { TALENTS }         from "../data/talents";
import { ACTIVE_GOALS } from "../data/activeGoals";
import { isGoalCompleted } from "../engine/progression/goalEngine";
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
  getOnboardingFirstEchoNodeId,
  ONBOARDING_STEPS,
  createEmptyOnboardingState,
  getBlockedOnboardingAction,
  isExtractionUnlocked,
  normalizeOnboardingState,
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
      phase: nextExpeditionPhase || (nextPrestigeLevel >= 1 ? "setup" : "sanctuary"),
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
      reforgeSession: null,
      runContext: nextRunContext,
      pendingRunSetup: nextPrestigeLevel >= 1,
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

function baseGameReducer(state, action) {
  if (getBlockedOnboardingAction(state?.onboarding?.step, action)) {
    return state;
  }

  switch (action.type) {

    case "RESET_ALL_PROGRESS":
      return createFreshState();

    case "START_ACCOUNT_SESSION": {
      const now = Number(action.now || Date.now());
      const telemetry = getAccountTelemetry(state);
      return {
        ...state,
        accountTelemetry: {
          ...telemetry,
          firstSeenAt: telemetry.firstSeenAt || now,
          lastActiveAt: now,
          lastSessionStartedAt: now,
          currentSessionSeconds: 0,
          sessionCount: Math.max(0, Number(telemetry.sessionCount || 0)) + 1,
          saveResets: Math.max(0, Number(telemetry.saveResets || 0)) + (action.reset ? 1 : 0),
        },
      };
    }

    case "TRACK_ACCOUNT_TIME": {
      const seconds = Math.max(0, Math.floor(Number(action.seconds || 0)));
      if (seconds <= 0) return state;
      const phase = action.phase || state.expedition?.phase || deriveExpeditionPhase(state);
      return {
        ...state,
        accountTelemetry: trackAccountPhaseTime(
          getAccountTelemetry(state),
          phase,
          seconds,
          Number(action.now || Date.now())
        ),
      };
    }

    case "TRACK_OFFLINE_TIME": {
      const seconds = Math.max(0, Math.floor(Number(action.seconds || 0)));
      if (seconds <= 0) return state;
      const telemetry = getAccountTelemetry(state);
      return {
        ...state,
        accountTelemetry: {
          ...telemetry,
          totalOfflineSeconds: Math.max(0, Number(telemetry.totalOfflineSeconds || 0)) + seconds,
          offlineRecoveryCount: Math.max(0, Number(telemetry.offlineRecoveryCount || 0)) + 1,
          longestOfflineSeconds: Math.max(Math.max(0, Number(telemetry.longestOfflineSeconds || 0)), seconds),
          lastActiveAt: Number(action.now || Date.now()),
        },
      };
    }

    case "REPAIR_SAVE_STATE": {
      const repairedState = mergeStateWithDefaults(createFreshState(), state);
      const telemetry = {
        ...getAccountTelemetry(repairedState),
        saveRepairs: Math.max(0, Number(repairedState?.accountTelemetry?.saveRepairs || 0)) + 1,
        lastActiveAt: Number(action.now || Date.now()),
      };
      return {
        ...repairedState,
        accountTelemetry: telemetry,
        saveDiagnostics: {
          ...getSaveDiagnostics(repairedState),
          legacyNeedsRepair: false,
          lastRepairAt: Number(action.now || Date.now()),
        },
        combat: {
          ...repairedState.combat,
          log: [
            ...(repairedState.combat?.log || []),
            "SAVE: estado reparado y remigrado con la version actual.",
          ].slice(-20),
        },
      };
    }

    case "DISMISS_LEGACY_SAVE_PROMPT": {
      const diagnostics = getSaveDiagnostics(state);
      if (!diagnostics.legacyNeedsRepair) return state;
      return {
        ...state,
        saveDiagnostics: {
          ...diagnostics,
          legacyPromptShownCount: Math.min(3, Math.max(0, Number(diagnostics.legacyPromptShownCount || 0)) + 1),
        },
      };
    }

    case "SET_TAB":
      if (state.combat?.reforgeSession && action.tab !== state.currentTab) {
        return state;
      }
      return {
        ...state,
        currentTab: action.tab === "lab"
          ? ((state.expedition?.phase || "sanctuary") === "active" ? "combat" : "sanctuary")
          : action.tab,
      };

    case "ENTER_EXPEDITION_SETUP": {
      if (!state.player?.class) {
        return {
          ...state,
          currentTab: "character",
        };
      }

      if (state.combat?.pendingRunSetup) {
        return {
          ...state,
          expedition: {
            ...(state.expedition || createEmptyExpeditionState()),
            phase: "setup",
          },
          currentTab: "combat",
        };
      }

      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "setup",
        },
        currentTab: "combat",
      };
    }

    case "RESET_SESSION_ANALYTICS":
      return {
        ...state,
        combat: {
          ...state.combat,
          analytics: createEmptySessionAnalytics(),
          log: [
            ...(state.combat?.log || []),
            "Telemetria de sesion reiniciada.",
          ].slice(-20),
        },
      };

    case "RESET_REPLAY_LOG":
      return {
        ...state,
        replay: createEmptyReplayLog(),
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "Replay de sesion reiniciado.",
          ].slice(-20),
        },
      };

    case "SAVE_CURRENT_REPLAY_TO_LIBRARY": {
      const currentReplay = state.replay || createEmptyReplayLog();
      const hasReplayData = (currentReplay.actions || []).length > 0 || (currentReplay.milestones || []).length > 0;
      if (!hasReplayData) return state;

      const nextLibrary = normalizeReplayLibrary({
        entries: [
          ...(state.replayLibrary?.entries || []),
          buildReplayLibraryEntry({ replay: currentReplay }, { label: action.label }),
        ],
      });

      return {
        ...state,
        replayLibrary: nextLibrary,
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `Replay guardado en biblioteca${action.label ? `: ${action.label}` : "."}`,
          ].slice(-20),
        },
      };
    }

    case "IMPORT_REPLAY_LIBRARY": {
      const entries = Array.isArray(action.entries) ? action.entries : [];
      if (entries.length === 0) return state;
      const nextLibrary = normalizeReplayLibrary({
        entries: [
          ...(state.replayLibrary?.entries || []),
          ...entries,
        ],
      });

      return {
        ...state,
        replayLibrary: nextLibrary,
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `${entries.length} replay(s) importados a la biblioteca.`,
          ].slice(-20),
        },
      };
    }

    case "TOGGLE_REPLAY_LIBRARY_ENTRY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({
          entries: (state.replayLibrary?.entries || []).map(entry =>
            entry.id === action.replayId ? { ...entry, isActive: !entry.isActive } : entry
          ),
        }),
      };

    case "DELETE_REPLAY_LIBRARY_ENTRY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({
          entries: (state.replayLibrary?.entries || []).filter(entry => entry.id !== action.replayId),
        }),
      };

    case "CLEAR_REPLAY_LIBRARY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({ entries: [] }),
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "Biblioteca de replays vaciada.",
          ].slice(-20),
        },
      };

    case "UPDATE_LOOT_RULES":
      return {
        ...state,
        settings: {
          ...state.settings,
          lootRules: {
            ...(state.settings?.lootRules || {}),
            ...(action.lootRules || {}),
          },
        },
      };

    case "TOGGLE_THEME":
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: state.settings?.theme === "dark" ? "light" : "dark",
        },
      };

    case "ACK_ONBOARDING_STEP":
      return {
        ...state,
        onboarding: normalizeOnboardingState(state.onboarding || createEmptyOnboardingState()),
      };

    case "SET_THEME":
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.theme === "dark" ? "dark" : "light",
        },
      };

    case "SELECT_RUN_SIGIL": {
      if (!state.combat?.pendingRunSetup || !isRunSigilsUnlocked(state)) return state;
      const nextRunSigilIds = selectRunSigilLoadout(state, action.sigilId || "free", action.slotIndex || 0);
      return {
        ...state,
        combat: {
          ...state.combat,
          pendingRunSigilId: nextRunSigilIds[0] || "free",
          pendingRunSigilIds: nextRunSigilIds,
        },
      };
    }

    case "START_RUN": {
      if (!state.combat?.pendingRunSetup) return state;
      if (!state.player?.class) return state;
      const startedAt = Number(action.now || Date.now());
      const runSigilIds = resolveRunSigilLoadout(
        state,
        state.combat?.pendingRunSigilIds || state.combat?.pendingRunSigilId || "free"
      );
      const consumedInfusions = consumeSigilInfusions(state.sanctuary || createEmptySanctuaryState(), runSigilIds);
      const activeBlueprints = ensureValidActiveBlueprints(
        consumedInfusions.sanctuary?.blueprints || [],
        consumedInfusions.sanctuary?.activeBlueprints || {}
      );
      const materializedLoadout = materializeBlueprintLoadout(
        consumedInfusions.sanctuary?.blueprints || [],
        activeBlueprints,
        { now: startedAt }
      );
      const nextBlueprints = consumeBlueprintMaterialization(
        consumedInfusions.sanctuary?.blueprints || [],
        activeBlueprints,
        { now: startedAt }
      );
      const nextRunContext = state.combat?.runContext || createRunContext();
      const nextEnemy = spawnEnemy(state.combat?.currentTier || 1, nextRunContext);
      const nextCodex = recordCodexSighting(state.codex || {}, nextEnemy);
      const nextPlayer = refreshStats(
        syncCodexBonuses(
          syncPrestigeBonuses(
            {
              ...state.player,
              inventory: [],
              equipment: {
                weapon: materializedLoadout.weapon || null,
                armor: materializedLoadout.armor || null,
              },
              runSigilBonuses: getCombinedRunSigilBonuses(runSigilIds, {
                activeInfusionPlayerBonuses: consumedInfusions.activeInfusionPlayerBonuses,
              }),
            },
            state.prestige
          ),
          nextCodex
        )
      );

      return {
        ...state,
        currentTab: "combat",
        codex: nextCodex,
        sanctuary: {
          ...consumedInfusions.sanctuary,
          blueprints: nextBlueprints,
          activeBlueprints,
        },
        player: {
          ...nextPlayer,
          hp: nextPlayer.maxHp,
        },
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "active",
          id: `expedition_${startedAt}`,
          startedAt,
          exitReason: null,
          seenFamilyIds: appendSeenFamilyIds(createEmptyExpeditionState(), nextEnemy),
          cargoFound: [],
          projectCandidates: [],
          selectedCargoIds: [],
          selectedProjectItemId: null,
          extractionPreview: null,
          activeInfusionIds: consumedInfusions.appliedSigilIds,
          activeInfusionPlayerBonuses: consumedInfusions.activeInfusionPlayerBonuses,
          activeExtractionBonuses: consumedInfusions.activeExtractionBonuses,
        },
        combat: {
          ...state.combat,
          pendingRunSetup: false,
          activeRunSigilId: runSigilIds[0] || "free",
          activeRunSigilIds: runSigilIds,
          runContext: nextRunContext,
          enemy: nextEnemy,
          log: [
            ...(state.combat.log || []),
            `SIGILOS: ${formatRunSigilLoadout(runSigilIds)}. ${summarizeRunSigilLoadout(runSigilIds)}`,
            ...(consumedInfusions.appliedSigilIds.length > 0
              ? [`INFUSION: ${consumedInfusions.appliedSigilIds.map(sigilId => getRunSigil(sigilId).name).join(" + ")} activada para esta expedicion.`]
              : []),
            ...((materializedLoadout.weapon || materializedLoadout.armor)
              ? [`BLUEPRINTS: ${[
                  materializedLoadout.weapon ? materializedLoadout.weapon.name : null,
                  materializedLoadout.armor ? materializedLoadout.armor.name : null,
                ].filter(Boolean).join(" / ")} materializados para esta expedicion.`]
              : []),
          ].slice(-20),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          expeditionCount: Math.max(0, Number(state?.accountTelemetry?.expeditionCount || 0)) + 1,
          currentExpeditionSeconds: 0,
          lastActiveAt: startedAt,
        },
      };
    }

    case "OPEN_EXTRACTION": {
      const exitReason = action.exitReason === "death" ? "death" : "retire";
      if (state.expedition?.phase === "extraction") return state;
      if (!state.player?.class) return state;
      if (exitReason !== "death" && !isExtractionUnlocked(state)) return state;

      const extractionPreview = buildExtractionPreview(state, { exitReason });
      const onboardingExtractionTutorial = state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_READY;
      const defaultCargoIds = onboardingExtractionTutorial
        ? []
        : (extractionPreview.cargoOptions || [])
            .slice(0, Math.max(0, Number(extractionPreview.availableSlots?.cargo || 0)))
            .map(option => option.id);
      const defaultProjectItemId = onboardingExtractionTutorial
        ? null
        : Number(extractionPreview.availableSlots?.project || 0) > 0
          ? extractionPreview.projectOptions?.[0]?.itemId || null
          : null;

      return {
        ...state,
        currentTab: "sanctuary",
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "extraction",
          exitReason,
          extractionPreview,
          selectedCargoIds: defaultCargoIds,
          selectedProjectItemId: defaultProjectItemId,
        },
      };
    }

    case "CANCEL_EXTRACTION": {
      if (state.expedition?.phase !== "extraction") return state;
      if (state.expedition?.exitReason === "death") return state;
      return {
        ...state,
        currentTab: "combat",
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "active",
          exitReason: null,
          selectedCargoIds: [],
          selectedProjectItemId: null,
          extractionPreview: null,
        },
      };
    }

    case "SELECT_EXTRACTION_CARGO": {
      if (state.expedition?.phase !== "extraction") return state;
      const cargoId = action.cargoId;
      if (!cargoId) return state;
      const tutorialCargoId =
        state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO
          ? state.expedition?.extractionPreview?.cargoOptions?.[0]?.id || null
          : null;
      if (tutorialCargoId && cargoId !== tutorialCargoId) return state;
      const selected = new Set(state.expedition?.selectedCargoIds || []);
      if (selected.has(cargoId)) {
        selected.delete(cargoId);
      } else {
        const limit = Math.max(0, Number(state.expedition?.extractionPreview?.availableSlots?.cargo || 0));
        if (selected.size >= limit) return state;
        selected.add(cargoId);
      }
      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          selectedCargoIds: Array.from(selected),
        },
      };
    }

    case "SELECT_EXTRACTION_PROJECT": {
      if (state.expedition?.phase !== "extraction") return state;
      if (Number(state.expedition?.extractionPreview?.availableSlots?.project || 0) <= 0) return state;
      const tutorialProjectId =
        state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM
          ? state.expedition?.extractionPreview?.projectOptions?.[0]?.itemId || null
          : null;
      if (tutorialProjectId && action.itemId !== tutorialProjectId) return state;
      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          selectedProjectItemId: action.itemId || null,
        },
      };
    }

    case "CONFIRM_EXTRACTION": {
      if (state.expedition?.phase !== "extraction") return state;
      const extractionAt = Number(action.now || Date.now());

      const exitReason = state.expedition?.exitReason === "death" ? "death" : "retire";
      const preview = state.expedition?.extractionPreview || buildExtractionPreview(state, {
        exitReason,
      });
      const selectedCargoIds = new Set(state.expedition?.selectedCargoIds || []);
      const selectedCargo = (preview.cargoOptions || [])
        .filter(option => selectedCargoIds.has(option.id))
        .map(option => ({
          id: `${option.id}_${extractionAt}`,
          type: option.type,
          quantity: Math.max(1, Number(option.recoveredQuantity || option.quantity || 1)),
          label: option.label,
          description: option.description,
          source: exitReason,
          extractedAt: extractionAt,
        }));
      const retainedItem = buildRetainedExtractionItem(
        state,
        state.expedition?.selectedProjectItemId,
        {
          exitReason,
          maxTier: preview.summary?.maxTier || 1,
          bossesKilled: preview.summary?.bossesKilled || 0,
        }
      );
      const nextSanctuary = {
        ...createEmptySanctuaryState(),
        ...(state.sanctuary || {}),
        cargoInventory: [...(state.sanctuary?.cargoInventory || []), ...selectedCargo],
        extractedItems: retainedItem
          ? [...(state.sanctuary?.extractedItems || []), normalizeExtractedItemRecord(retainedItem)]
          : [...(state.sanctuary?.extractedItems || [])],
        blueprints: (state.sanctuary?.blueprints || []).map(blueprint => normalizeBlueprintRecord(blueprint)).filter(Boolean),
        activeBlueprints: ensureValidActiveBlueprints(
          state.sanctuary?.blueprints || [],
          state.sanctuary?.activeBlueprints || {}
        ),
        stations: {
          ...createEmptySanctuaryState().stations,
          ...(state.sanctuary?.stations || {}),
          laboratory: {
            ...createEmptySanctuaryState().stations.laboratory,
            ...((state.sanctuary?.stations || {}).laboratory || {}),
            unlocked: true,
          },
        },
        deepForgeSession: null,
      };

      if (preview?.prestige?.mode === "echoes" || preview?.prestige?.mode === "emergency") {
        const prestigeCheck = canPrestige(state);
        if (!prestigeCheck.ok) return state;
        const echoesGained = preview?.prestige?.echoes || calculatePrestigeEchoGain(state);
        const finalizedTelemetry = finalizeExpeditionTelemetry(getAccountTelemetry(state), state.expedition, {
          exitReason,
          prestige: true,
          now: extractionAt,
        });
        const nextPrestigeLevel = (state.prestige?.level || 0) + 1;
        const nextRunContext = createRunContext();
        const resetRunSigilIds = normalizeRunSigilIds("free", {
          slots: getMaxRunSigilSlots(state?.abyss || {}),
        });
        const nextPrestigeState = {
          ...state.prestige,
          level: nextPrestigeLevel,
          echoes: (state.prestige?.echoes || 0) + echoesGained,
          spentEchoes: state.prestige?.spentEchoes || 0,
          totalEchoesEarned: (state.prestige?.totalEchoesEarned || 0) + echoesGained,
          bestHistoricTier: Math.max(
            Number(state.prestige?.bestHistoricTier || 0),
            Number(prestigeCheck.preview?.progress?.maxTier || state.combat?.maxTier || 1)
          ),
          nodes: { ...(state.prestige?.nodes || {}) },
        };
        const nextAccountTelemetry =
          finalizedTelemetry.firstPrestigeAtOnlineSeconds == null
            ? {
                ...finalizedTelemetry,
                firstPrestigeAtOnlineSeconds: getCurrentOnlineSeconds(finalizedTelemetry),
              }
            : finalizedTelemetry;
        return buildPrestigeResetState(
          {
            ...state,
            sanctuary: nextSanctuary,
            accountTelemetry: nextAccountTelemetry,
          },
          {
            echoesGained,
            nextPrestigeLevel,
            nextPrestigeState,
            resetRunSigilIds,
            nextRunContext,
            logLine:
              preview?.prestige?.mode === "emergency"
                ? `Extraccion de emergencia. +${echoesGained} ecos y vuelta al Santuario con ${selectedCargo.length} bundle(s) recuperados.`
                : `Extraccion completada. +${echoesGained} ecos y vuelta al Santuario con ${selectedCargo.length} bundle(s)${retainedItem ? " y 1 item rescatado." : "."}`,
          }
        );
      }

      const postResetState = buildPostExtractionExpeditionReset(state, {
        exitReason,
        goldMultiplier: exitReason === "death" ? 0.75 : 1,
      });
      const nextAccountTelemetry = finalizeExpeditionTelemetry(getAccountTelemetry(state), state.expedition, {
        exitReason,
        prestige: false,
        now: extractionAt,
      });
      return withAchievementProgress({
        ...postResetState,
        sanctuary: nextSanctuary,
        accountTelemetry: nextAccountTelemetry,
        combat: {
          ...postResetState.combat,
          log: [
            `Extraccion ${exitReason === "death" ? "de emergencia" : "manual"}. ${selectedCargo.length} bundle(s) al Santuario${retainedItem ? " y 1 item rescatado." : "."}`,
          ],
        },
      });
    }

    case "SYNC_SANCTUARY_JOBS": {
      const nextJobs = syncSanctuaryJobs(state.sanctuary?.jobs || [], action.now || Date.now());
      if (nextJobs === (state.sanctuary?.jobs || [])) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          jobs: nextJobs,
        },
      };
    }

    case "START_DISTILLERY_JOB": {
      const job = createDistillJob(state.sanctuary || createEmptySanctuaryState(), action.cargoId, action.now || Date.now());
      if (!job) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          cargoInventory: (state.sanctuary?.cargoInventory || []).filter(entry => entry?.id !== job.input?.cargoId),
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          distillJobsStarted: Math.max(0, Number(state?.accountTelemetry?.distillJobsStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Destileria inicia ${job.output?.label || "refinado"} (${job.input?.quantity || 0}).`,
          ].slice(-20),
        },
      };
    }

    case "START_SANCTUARY_ERRAND": {
      const progressTier = getSanctuaryProgressTier(state);
      const job = createSanctuaryErrandJob(
        state.sanctuary || createEmptySanctuaryState(),
        action.errandId || action.payload?.errandId,
        action.durationId || action.payload?.durationId || "short",
        progressTier,
        action.now || Date.now()
      );
      if (!job) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          errandJobsStarted: Math.max(0, Number(state?.accountTelemetry?.errandJobsStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${job.input?.label || "Encargo"} parte en ${job.input?.durationLabel || "misión"}.`,
          ].slice(-20),
        },
      };
    }

    case "START_CODEX_RESEARCH": {
      const researchType = action.researchType || action.payload?.researchType || "";
      const targetId = action.targetId || action.payload?.targetId || "";
      const job = createCodexResearchJob(
        state.sanctuary || createEmptySanctuaryState(),
        state.codex || {},
        { researchType, targetId },
        action.now || Date.now()
      );
      if (!job) return state;

      const nextCodex = normalizeCodexState(state.codex || {});
      if (researchType === "family") {
        nextCodex.research.familyProgress[targetId] = 0;
      } else if (researchType === "boss") {
        nextCodex.research.bossProgress[targetId] = 0;
      } else if (researchType === "power") {
        nextCodex.research.powerProgress[targetId] = 0;
      }

      const spentInk = Math.max(0, Number(job.input?.inkCost || 0));
      const spentDust = Math.max(0, Number(job.input?.dustCost || 0));
      return {
        ...state,
        codex: nextCodex,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            codexInk: Math.max(0, Number(state.sanctuary?.resources?.codexInk || 0) - spentInk),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          codexResearchStarted: Math.max(0, Number(state?.accountTelemetry?.codexResearchStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Investigacion de Biblioteca iniciada sobre ${job.input?.label || "objetivo"} · ${job.output?.rewardLabel || "siguiente hito"}.`,
          ].slice(-20),
        },
      };
    }

    case "START_LAB_RESEARCH": {
      const researchId = action.researchId || action.payload?.researchId || "";
      const job = createLaboratoryResearchJob(state, researchId, action.now || Date.now());
      if (!job) return state;

      const spentInk = Math.max(0, Number(job.input?.costs?.codexInk || 0));
      const spentDust = Math.max(0, Number(job.input?.costs?.relicDust || 0));
      const spentEssence = Math.max(0, Number(job.input?.costs?.essence || 0));
      return {
        ...state,
        player: {
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            codexInk: Math.max(0, Number(state.sanctuary?.resources?.codexInk || 0) - spentInk),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          labResearchStarted: Math.max(0, Number(state?.accountTelemetry?.labResearchStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Laboratorio inicia ${job.input?.label || "investigacion"} para ${job.input?.targetLabel || SANCTUARY_STATION_DEFAULTS[job.input?.stationId]?.label || "infraestructura"}.`,
          ].slice(-20),
        },
      };
    }

    case "CONVERT_EXTRACTED_ITEM_TO_BLUEPRINT": {
      const extractedItemId = action.extractedItemId || action.itemId || action.payload?.extractedItemId || action.payload?.itemId;
      const extractedItems = Array.isArray(state.sanctuary?.extractedItems) ? state.sanctuary.extractedItems : [];
      const targetItem = normalizeExtractedItemRecord(extractedItems.find(item => item?.id === extractedItemId));
      if (!targetItem?.id) return state;

      const blueprint = buildBlueprintFromExtractedItem(targetItem, { now: action.now || Date.now() });
      if (!blueprint) return state;

      const nextBlueprints = [
        ...(state.sanctuary?.blueprints || []).map(existingBlueprint => normalizeBlueprintRecord(existingBlueprint)).filter(Boolean),
        normalizeBlueprintRecord(blueprint),
      ];
      const chargeReward = buildBlueprintChargeReward(targetItem, { multiplier: 1 });
      const nextActiveBlueprints = ensureValidActiveBlueprints(nextBlueprints, {
        ...(state.sanctuary?.activeBlueprints || {}),
        [blueprint.slot || targetItem.type || "weapon"]:
          (state.sanctuary?.activeBlueprints || {})[blueprint.slot || targetItem.type || "weapon"] || blueprint.id,
      });

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          extractedItems: extractedItems.filter(item => item?.id !== targetItem.id),
          blueprints: nextBlueprints,
          activeBlueprints: nextActiveBlueprints,
          familyCharges: addBlueprintCharges(state.sanctuary?.familyCharges || {}, chargeReward),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintsCreated: Math.max(0, Number(state?.accountTelemetry?.blueprintsCreated || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${targetItem.name} se convierte en blueprint. Conserva direccion, no el item exacto.`,
          ].slice(-20),
        },
      };
    }

    case "START_SCRAP_EXTRACTED_ITEM_JOB": {
      const job = createScrapExtractedItemJob(state.sanctuary || createEmptySanctuaryState(), action.extractedItemId || action.itemId, action.now || Date.now());
      if (!job) {
        const tutorialScrapUnlocked = state?.onboarding?.step === ONBOARDING_STEPS.BLUEPRINT_DECISION;
        if (!tutorialScrapUnlocked) return state;
        const extractedItems = Array.isArray(state.sanctuary?.extractedItems) ? state.sanctuary.extractedItems : [];
        const targetItem = normalizeExtractedItemRecord(
          extractedItems.find(item => item?.id === (action.extractedItemId || action.itemId))
        );
        if (!targetItem?.id) return state;
        return {
          ...state,
          sanctuary: {
            ...createEmptySanctuaryState(),
            ...(state.sanctuary || {}),
            extractedItems: extractedItems.filter(item => item?.id !== targetItem.id),
            familyCharges: addBlueprintCharges(
              state.sanctuary?.familyCharges || {},
              buildBlueprintChargeReward(targetItem, { multiplier: 1.25 })
            ),
          },
          combat: {
            ...state.combat,
            log: [
              ...(state.combat?.log || []),
              `SANTUARIO: ${targetItem.name} se desguaza al instante durante el tutorial para mostrar la salida de cargas.`,
            ].slice(-20),
          },
        };
      }
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          extractedItems: (state.sanctuary?.extractedItems || []).filter(item => item?.id !== job.input?.extractedItemId),
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${job.input?.itemName || "Item"} entra en desguace para devolver cargas de afinidad.`,
          ].slice(-20),
        },
      };
    }

    case "CANCEL_SANCTUARY_ERRAND": {
      const jobId = action.jobId || action.payload?.jobId;
      const jobs = Array.isArray(state.sanctuary?.jobs) ? state.sanctuary.jobs : [];
      const targetJob = jobs.find(job => job?.id === jobId && job?.type === "sanctuary_errand" && job?.status === "running");
      if (!targetJob) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          jobs: jobs.filter(job => job?.id !== targetJob.id),
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "SANTUARIO: El equipo ha sido retirado. El progreso de la misión se pierde.",
          ].slice(-20),
        },
      };
    }

    case "SET_ACTIVE_BLUEPRINT": {
      const blueprintId = action.blueprintId || action.payload?.blueprintId || null;
      const slot = action.slot || action.payload?.slot || null;
      if (!slot || !["weapon", "armor"].includes(slot)) return state;
      const blueprints = (state.sanctuary?.blueprints || []).map(blueprint => normalizeBlueprintRecord(blueprint)).filter(Boolean);
      if (blueprintId && !blueprints.some(blueprint => blueprint.id === blueprintId && blueprint.slot === slot)) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          activeBlueprints: ensureValidActiveBlueprints(blueprints, {
            ...(state.sanctuary?.activeBlueprints || {}),
            [slot]: blueprintId || null,
          }),
        },
      };
    }

    case "INVEST_BLUEPRINT_AFFINITY": {
      if (!isSanctuaryStationUnlocked(state.sanctuary, "deepForge")) return state;
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const familyId = action.familyId || action.payload?.familyId;
      const charges = Math.max(1, Number(action.charges || action.payload?.charges || 1));
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const blueprintIndex = blueprints.findIndex(blueprint => blueprint?.id === blueprintId);
      if (blueprintIndex < 0 || !familyId) return state;
      const currentCharges = Math.max(0, Number(state.sanctuary?.familyCharges?.[familyId] || 0));
      if (currentCharges < charges) return state;

      const nextBlueprint = investBlueprintAffinity(blueprints[blueprintIndex], familyId, charges);
      if (!nextBlueprint) return state;
      blueprints[blueprintIndex] = normalizeBlueprintRecord(nextBlueprint);

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          familyCharges: {
            ...createEmptyFamilyChargeState(),
            ...(state.sanctuary?.familyCharges || {}),
            [familyId]: Math.max(0, currentCharges - charges),
          },
          activeBlueprints: ensureValidActiveBlueprints(blueprints, state.sanctuary?.activeBlueprints || {}),
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${nextBlueprint.sourceName || nextBlueprint.id} gana afinidad en ${familyId}.`,
          ].slice(-20),
        },
      };
    }

    case "UPGRADE_BLUEPRINT_STRUCTURE": {
      if (!isSanctuaryStationUnlocked(state.sanctuary, "deepForge")) return state;
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const blueprintIndex = blueprints.findIndex(blueprint => blueprint?.id === blueprintId);
      if (blueprintIndex < 0) return state;

      const currentBlueprint = normalizeBlueprintRecord(blueprints[blueprintIndex]);
      const check = canUpgradeBlueprintStructure(currentBlueprint, state.sanctuary?.resources || {});
      if (!check.ok) return state;

      const preview = buildBlueprintStructurePreview(currentBlueprint);
      const nextBlueprint = upgradeBlueprintStructure(currentBlueprint, { now: action.now || Date.now() });
      if (!nextBlueprint) return state;

      blueprints[blueprintIndex] = normalizeBlueprintRecord(nextBlueprint);
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          activeBlueprints: ensureValidActiveBlueprints(blueprints, state.sanctuary?.activeBlueprints || {}),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintStructureUpgrades: Math.max(0, Number(state?.accountTelemetry?.blueprintStructureUpgrades || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${nextBlueprint.sourceName || nextBlueprint.id} refuerza su estructura (${preview?.currentLevel || 0} -> ${nextBlueprint.blueprintLevel || 0}) · rating ${preview?.currentEffectiveRating || 0} -> ${preview?.nextEffectiveRating || preview?.currentEffectiveRating || 0}.`,
          ].slice(-20),
        },
      };
    }

    case "TUNE_BLUEPRINT_POWER": {
      if (!isSanctuaryStationUnlocked(state.sanctuary, "deepForge")) return state;
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const blueprintIndex = blueprints.findIndex(blueprint => blueprint?.id === blueprintId);
      if (blueprintIndex < 0) return state;

      const currentBlueprint = normalizeBlueprintRecord(blueprints[blueprintIndex]);
      const check = canTuneBlueprintPower(currentBlueprint, state.sanctuary?.resources || {});
      if (!check.ok) return state;

      const preview = buildBlueprintPowerTunePreview(currentBlueprint);
      const nextBlueprint = tuneBlueprintPower(currentBlueprint, { now: action.now || Date.now() });
      if (!nextBlueprint) return state;

      blueprints[blueprintIndex] = normalizeBlueprintRecord(nextBlueprint);
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          activeBlueprints: ensureValidActiveBlueprints(blueprints, state.sanctuary?.activeBlueprints || {}),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintPowerTunes: Math.max(0, Number(state?.accountTelemetry?.blueprintPowerTunes || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${nextBlueprint.sourceName || nextBlueprint.id} sintoniza su poder legendario (${preview?.currentLevel || 0} -> ${nextBlueprint.powerTuneLevel || 0}).`,
          ].slice(-20),
        },
      };
    }

    case "ASCEND_BLUEPRINT": {
      if (!isSanctuaryStationUnlocked(state.sanctuary, "deepForge")) return state;
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const blueprintIndex = blueprints.findIndex(blueprint => blueprint?.id === blueprintId);
      if (blueprintIndex < 0) return state;

      const currentBlueprint = normalizeBlueprintRecord(blueprints[blueprintIndex]);
      const check = canAscendBlueprint(currentBlueprint, {
        resources: state.sanctuary?.resources || {},
        essence: state.player?.essence || 0,
      });
      if (!check.ok) return state;

      const preview = buildBlueprintAscensionPreview(currentBlueprint);
      const nextBlueprint = ascendBlueprint(currentBlueprint, { now: action.now || Date.now() });
      if (!nextBlueprint) return state;

      blueprints[blueprintIndex] = normalizeBlueprintRecord(nextBlueprint);
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));
      const spentEssence = Math.max(0, Number(check.costs?.essence || 0));

      return {
        ...state,
        player: refreshStats({
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        }),
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          activeBlueprints: ensureValidActiveBlueprints(blueprints, state.sanctuary?.activeBlueprints || {}),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintAscensions: Math.max(0, Number(state?.accountTelemetry?.blueprintAscensions || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${nextBlueprint.sourceName || nextBlueprint.id} asciende (${preview?.currentAscensionTier || 0} -> ${nextBlueprint.ascensionTier || 0}), reinicia estructura y empuja su materializacion a Tier ${preview?.nextEffectiveTier || preview?.currentEffectiveTier || nextBlueprint.itemTier}.`,
          ].slice(-20),
        },
      };
    }

    case "DISCARD_BLUEPRINT": {
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const targetBlueprint = normalizeBlueprintRecord(blueprints.find(blueprint => blueprint?.id === blueprintId));
      if (!targetBlueprint?.id) return state;

      const nextBlueprints = blueprints
        .filter(blueprint => blueprint?.id !== targetBlueprint.id)
        .map(blueprint => normalizeBlueprintRecord(blueprint))
        .filter(Boolean);

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints: nextBlueprints,
          activeBlueprints: ensureValidActiveBlueprints(nextBlueprints, state.sanctuary?.activeBlueprints || {}),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintsDiscarded: Math.max(0, Number(state?.accountTelemetry?.blueprintsDiscarded || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Descartas ${targetBlueprint.sourceName || targetBlueprint.id}. El plano deja de ocupar espacio permanente.`,
          ].slice(-20),
        },
      };
    }

    case "START_SIGIL_INFUSION": {
      const job = createSigilInfusionJob(state.sanctuary || createEmptySanctuaryState(), action.sigilId || "free", action.now || Date.now());
      if (!job) return state;
      const fuelCost = Math.max(0, Number(job.input?.fuelCost || 0));
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            sigilFlux: Math.max(0, Number(state.sanctuary?.resources?.sigilFlux || 0) - fuelCost),
          },
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          sigilJobsStarted: Math.max(0, Number(state?.accountTelemetry?.sigilJobsStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${getRunSigil(job.output?.sigilId || "free").name} entra en infusion.`,
          ].slice(-20),
        },
      };
    }

    case "START_DEEP_FORGE_JOB": {
      const job = createForgeProjectJob(state.sanctuary || createEmptySanctuaryState(), action.projectId, action.now || Date.now());
      if (!job) return state;
      const dustCost = Math.max(0, Number(job.input?.dustCost || 0));
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: (state.sanctuary?.stash || []).filter(project => project?.id !== job.input?.projectId),
          deepForgeSession:
            state.sanctuary?.deepForgeSession?.projectId === job.input?.projectId
              ? null
              : state.sanctuary?.deepForgeSession || null,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - dustCost),
          },
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Forja Profunda inicia sobre ${job.input?.project?.name || "proyecto"} (+${job.input?.project?.upgradeLevel || 0} -> +${job.output?.nextUpgradeLevel || 1}).`,
          ].slice(-20),
        },
      };
    }

    case "DEEP_FORGE_ASCEND_PROJECT": {
      const projectId = action.projectId || action.payload?.projectId;
      const selectedPowerId = action.selectedPowerId ?? action.payload?.selectedPowerId ?? null;
      const stash = Array.isArray(state.sanctuary?.stash) ? state.sanctuary.stash : [];
      const projectIndex = stash.findIndex(project => project?.id === projectId);
      if (projectIndex < 0) return state;

      const project = normalizeProjectRecord(stash[projectIndex]);
      const unlockedPowerIds = getUnlockedLegendaryPowers(state.codex || {}, {
        specialization: state.player?.specialization,
        className: state.player?.class,
        abyss: state.abyss || {},
      }).map(power => power.id);
      const imprintReduction = getLegendaryPowerImprintReduction(state.codex || {}, selectedPowerId);
      const check = canDeepForgeProject(
        project,
        {
          playerEssence: state.player?.essence || 0,
          relicDust: state.sanctuary?.resources?.relicDust || 0,
        },
        "ascend",
        null,
        {
          selectedPowerId,
          unlockedPowerIds,
          imprintReduction,
        }
      );
      if (!check.ok) return state;

      const nextProject = deepForgeAscendProject(project, { selectedPowerId });
      if (!nextProject) return state;

      const nextStash = [...stash];
      nextStash[projectIndex] = normalizeProjectRecord(nextProject);
      const spentEssence = Math.max(0, Number(check.costs?.essence || 0));
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));
      const selectedPowerLabel =
        selectedPowerId && selectedPowerId !== project?.legendaryPowerId
          ? " con poder injertado"
          : "";

      return withAchievementProgress({
        ...state,
        player: {
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        },
        stats: {
          ...state.stats,
          ascendsCrafted: (state.stats?.ascendsCrafted || 0) + 1,
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: nextStash,
          deepForgeSession:
            state.sanctuary?.deepForgeSession?.projectId === projectId
              ? null
              : state.sanctuary?.deepForgeSession || null,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            ascendsCrafted: (state.combat.analytics?.ascendsCrafted || 0) + 1,
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + spentEssence,
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              ascends: (state.combat.analytics?.essenceSpentBySource?.ascends || 0) + spentEssence,
            },
          },
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${project.name} asciende a rango ${Math.max(0, Number(project?.ascensionTier || 0)) + 1}, vuelve a +0${selectedPowerLabel}.`,
          ].slice(-20),
        },
      });
    }

    case "DEEP_FORGE_POLISH_PROJECT": {
      const projectId = action.projectId || action.payload?.projectId;
      const affixIndex = Number(action.affixIndex ?? action.payload?.affixIndex);
      const stash = Array.isArray(state.sanctuary?.stash) ? state.sanctuary.stash : [];
      const projectIndex = stash.findIndex(project => project?.id === projectId);
      if (projectIndex < 0) return state;

      const project = normalizeProjectRecord(stash[projectIndex]);
      const check = canDeepForgeProject(
        project,
        {
          playerEssence: state.player?.essence || 0,
          relicDust: state.sanctuary?.resources?.relicDust || 0,
        },
        "polish",
        affixIndex
      );
      if (!check.ok) return state;

      const nextProject = deepForgePolishProject(project, affixIndex);
      if (!nextProject) return state;

      const nextStash = [...stash];
      nextStash[projectIndex] = normalizeProjectRecord(nextProject);
      const spentEssence = Math.max(0, Number(check.costs?.essence || 0));
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));

      return withAchievementProgress({
        ...state,
        player: {
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        },
        stats: {
          ...state.stats,
          polishesCrafted: (state.stats?.polishesCrafted || 0) + 1,
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: nextStash,
          deepForgeSession:
            state.sanctuary?.deepForgeSession?.projectId === projectId &&
            state.sanctuary?.deepForgeSession?.affixIndex === affixIndex
              ? null
              : state.sanctuary?.deepForgeSession || null,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            polishesCrafted: (state.combat.analytics?.polishesCrafted || 0) + 1,
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + spentEssence,
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              polish: (state.combat.analytics?.essenceSpentBySource?.polish || 0) + spentEssence,
            },
          },
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Pulido profundo sobre ${project.name} · ${project.affixes?.[affixIndex]?.stat || "linea"} ajustada.`,
          ].slice(-20),
        },
      });
    }

    case "START_DEEP_FORGE_REFORGE_PREVIEW": {
      const projectId = action.projectId || action.payload?.projectId;
      const affixIndex = Number(action.affixIndex ?? action.payload?.affixIndex);
      const stash = Array.isArray(state.sanctuary?.stash) ? state.sanctuary.stash : [];
      const project = normalizeProjectRecord(stash.find(candidate => candidate?.id === projectId));
      if (!project?.id) return state;

      const existingSession = state.sanctuary?.deepForgeSession || null;
      if (
        existingSession &&
        (existingSession.projectId !== projectId || Number(existingSession.affixIndex) !== affixIndex)
      ) {
        return state;
      }
      if (
        existingSession &&
        existingSession.projectId === projectId &&
        Number(existingSession.affixIndex) === affixIndex
      ) {
        return state;
      }

      const check = canDeepForgeProject(
        project,
        {
          playerEssence: state.player?.essence || 0,
          relicDust: state.sanctuary?.resources?.relicDust || 0,
        },
        "reforge",
        affixIndex
      );
      if (!check.ok) return state;

      const options = buildDeepForgeReforgePreview(project, affixIndex, {
        allowAbyssAffixes: ["epic", "legendary"].includes(project?.rarity),
      });
      if (!Array.isArray(options) || options.length === 0) return state;

      const spentEssence = Math.max(0, Number(check.costs?.essence || 0));
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));

      return {
        ...state,
        player: {
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          deepForgeSession: {
            mode: "reforge",
            projectId,
            affixIndex,
            currentAffix: project.affixes?.[affixIndex] || null,
            options,
            costs: {
              essence: spentEssence,
              relicDust: spentDust,
            },
            startedAt: action.now || Date.now(),
          },
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + spentEssence,
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              reforge: (state.combat.analytics?.essenceSpentBySource?.reforge || 0) + spentEssence,
            },
          },
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Reforge profunda preparada sobre ${project.name}.`,
          ].slice(-20),
        },
      };
    }

    case "APPLY_DEEP_FORGE_REFORGE": {
      const activeSession = state.sanctuary?.deepForgeSession || null;
      if (!activeSession?.projectId || !Number.isInteger(Number(activeSession?.affixIndex))) return state;

      const stash = Array.isArray(state.sanctuary?.stash) ? state.sanctuary.stash : [];
      const projectIndex = stash.findIndex(project => project?.id === activeSession.projectId);
      if (projectIndex < 0) return state;

      const requestedReplacement = action.replacementAffix || action.payload?.replacementAffix;
      const replacement = (activeSession.options || []).find(option =>
        option?.id === requestedReplacement?.id &&
        option?.stat === requestedReplacement?.stat &&
        option?.tier === requestedReplacement?.tier &&
        (option?.rolledValue ?? option?.value ?? null) === (requestedReplacement?.rolledValue ?? requestedReplacement?.value ?? null)
      );
      if (!replacement) return state;

      const project = normalizeProjectRecord(stash[projectIndex]);
      const nextProject = deepForgeApplyReforge(project, activeSession.affixIndex, replacement);
      if (!nextProject) return state;

      const nextStash = [...stash];
      nextStash[projectIndex] = normalizeProjectRecord(nextProject);

      return withAchievementProgress({
        ...state,
        stats: {
          ...state.stats,
          reforgesCrafted: (state.stats?.reforgesCrafted || 0) + 1,
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: nextStash,
          deepForgeSession: null,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            reforgesCrafted: (state.combat.analytics?.reforgesCrafted || 0) + 1,
          },
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Reforge profunda aplicada sobre ${project.name}.`,
          ].slice(-20),
        },
      });
    }

    case "CANCEL_DEEP_FORGE_SESSION": {
      if (!state.sanctuary?.deepForgeSession) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          deepForgeSession: null,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "SANTUARIO: Reforge profunda cerrada; la linea actual se mantiene.",
          ].slice(-20),
        },
      };
    }

    case "CLAIM_SANCTUARY_JOB": {
      const jobs = Array.isArray(state.sanctuary?.jobs) ? state.sanctuary.jobs : [];
      const job = jobs.find(candidate => candidate?.id === action.jobId && candidate?.status === "claimable");
      if (!job) return state;

      const nextJobs = jobs.filter(candidate => candidate?.id !== job.id);
      let nextPlayer = state.player;
      let nextCodex = state.codex;
      let nextResources = {
        ...createEmptySanctuaryState().resources,
        ...(state.sanctuary?.resources || {}),
      };
      let nextInfusions = {
        ...(state.sanctuary?.sigilInfusions || {}),
      };
      let nextStash = Array.isArray(state.sanctuary?.stash) ? [...state.sanctuary.stash] : [];
      let nextExtractedItems = Array.isArray(state.sanctuary?.extractedItems) ? [...state.sanctuary.extractedItems] : [];
      let nextBlueprints = Array.isArray(state.sanctuary?.blueprints)
        ? state.sanctuary.blueprints.map(blueprint => normalizeBlueprintRecord(blueprint)).filter(Boolean)
        : [];
      let nextLaboratory = {
        ...createEmptyLaboratoryState(),
        ...(state.sanctuary?.laboratory || {}),
      };
      let nextStations = {
        ...createEmptySanctuaryState().stations,
        ...(state.sanctuary?.stations || {}),
      };
      let nextAbyss = normalizeAbyssState(state?.abyss || {});
      let nextFamilyCharges = {
        ...createEmptyFamilyChargeState(),
        ...(state.sanctuary?.familyCharges || {}),
      };
      let logLine = "SANTUARIO: Job reclamado.";

      if (job.type === "distill_bundle") {
        const outputType = job.output?.type;
        const amount = Math.max(0, Number(job.output?.amount || 0));
        if (outputType === "essence_cache") {
          nextPlayer = {
            ...state.player,
            essence: (state.player?.essence || 0) + amount,
          };
          logLine = `SANTUARIO: Destileria reclamada · +${amount} esencia.`;
        } else if (outputType === "codex_trace") {
          nextResources.codexInk = (nextResources.codexInk || 0) + amount;
          logLine = `SANTUARIO: Destileria reclamada · +${amount} tinta de Biblioteca.`;
        } else if (outputType === "sigil_residue") {
          nextResources.sigilFlux = (nextResources.sigilFlux || 0) + amount;
          logLine = `SANTUARIO: Destileria reclamada · +${amount} flux de Sigilo.`;
        } else if (outputType === "relic_shard") {
          nextResources.relicDust = (nextResources.relicDust || 0) + amount;
          logLine = `SANTUARIO: Destileria reclamada · +${amount} polvo de Reliquia.`;
        }
      } else if (job.type === "sanctuary_errand") {
        const rewards = job.output?.rewards || {};
        const addedInk = Math.max(0, Number(rewards.codexInk || 0));
        const addedDust = Math.max(0, Number(rewards.relicDust || 0));
        const addedFlux = Math.max(0, Number(rewards.sigilFlux || 0));
        nextResources.codexInk = (nextResources.codexInk || 0) + addedInk;
        nextResources.relicDust = (nextResources.relicDust || 0) + addedDust;
        nextResources.sigilFlux = (nextResources.sigilFlux || 0) + addedFlux;
        nextFamilyCharges = addBlueprintCharges(nextFamilyCharges, rewards.familyCharges || {});

        const rewardParts = [];
        const chargedFamilies = Object.entries(rewards.familyCharges || {})
          .map(([familyId, amount]) => [familyId, Math.max(0, Number(amount || 0))])
          .filter(([, amount]) => amount > 0);
        if (chargedFamilies.length > 0) {
          rewardParts.push(
            chargedFamilies
              .map(([familyId, amount]) => {
                const familyLabel =
                  chargedFamilies.length === 1 && familyId === job.input?.familyId && job.input?.familyLabel
                    ? job.input.familyLabel
                    : familyId;
                return `${amount} cargas de ${familyLabel}`;
              })
              .join(", ")
          );
        }
        if (addedInk > 0) rewardParts.push(`${addedInk} tinta de Biblioteca`);
        if (addedDust > 0) rewardParts.push(`${addedDust} polvo de Reliquia`);
        if (addedFlux > 0) rewardParts.push(`${addedFlux} flux de Sigilo`);

        logLine = rewardParts.length > 0
          ? `SANTUARIO: ${job.output?.label || "Encargo"} vuelve con ${rewardParts.join(" · ")}.`
          : `SANTUARIO: ${job.output?.label || "Encargo"} vuelve sin recuperacion util.`;
      } else if (job.type === "infuse_sigil") {
        const sigilId = getRunSigil(job.output?.sigilId || "free").id;
        const existing = nextInfusions[sigilId] || {};
        nextInfusions[sigilId] = {
          sigilId,
          label: getRunSigil(sigilId).name,
          charges: Math.max(0, Number(existing?.charges || 0)) + 1,
          playerBonuses: { ...(job.output?.playerBonuses || existing?.playerBonuses || {}) },
          extractionBonuses: { ...(job.output?.extractionBonuses || existing?.extractionBonuses || {}) },
          summary: job.output?.summary || existing?.summary || "",
          updatedAt: action.now || Date.now(),
        };
        logLine = `SANTUARIO: ${getRunSigil(sigilId).name} infusionado y listo para una futura expedicion.`;
      } else if (job.type === "scrap_extracted_item") {
        nextFamilyCharges = addBlueprintCharges(nextFamilyCharges, job.output?.charges || {});
        logLine = `SANTUARIO: Desguace completo · ${job.input?.itemName || "item"} convertido en cargas de afinidad.`;
      } else if (job.type === "codex_research") {
        const researchType = job.input?.researchType;
        const targetId = job.input?.targetId;
        const targetRank = Math.max(0, Number(job.input?.targetRank || 0));
        nextCodex = normalizeCodexState(state.codex || {});

        if (researchType === "family" && targetId) {
          nextCodex.research.familyRanks[targetId] = Math.max(
            Number(nextCodex?.research?.familyRanks?.[targetId] || 0),
            targetRank
          );
        } else if (researchType === "boss" && targetId) {
          nextCodex.research.bossRanks[targetId] = Math.max(
            Number(nextCodex?.research?.bossRanks?.[targetId] || 0),
            targetRank
          );
        } else if (researchType === "power" && targetId) {
          nextCodex.research.powerRanks[targetId] = Math.max(
            Number(nextCodex?.research?.powerRanks?.[targetId] || 0),
            targetRank
          );
        }

        nextPlayer = syncCodexBonuses(nextPlayer, nextCodex);
        logLine = `SANTUARIO: Investigacion completa · ${job.input?.label || "objetivo"} alcanza ${job.output?.rewardLabel || "un nuevo rango"} en la Biblioteca.`;
      } else if (job.type === "laboratory_research") {
        const nextSanctuaryAfterResearch = applyLaboratoryResearch(
          {
            ...createEmptySanctuaryState(),
            ...(state.sanctuary || {}),
            resources: nextResources,
            sigilInfusions: nextInfusions,
            jobs: nextJobs,
            extractedItems: nextExtractedItems,
            blueprints: nextBlueprints,
            familyCharges: nextFamilyCharges,
          },
          job.input?.researchId,
          action.now || Date.now()
        );
        nextResources = {
          ...createEmptySanctuaryState().resources,
          ...(nextSanctuaryAfterResearch.resources || {}),
        };
        nextInfusions = {
          ...createEmptySanctuaryState().sigilInfusions,
          ...(nextSanctuaryAfterResearch.sigilInfusions || {}),
        };
        nextExtractedItems = Array.isArray(nextSanctuaryAfterResearch.extractedItems) ? [...nextSanctuaryAfterResearch.extractedItems] : nextExtractedItems;
        nextBlueprints = Array.isArray(nextSanctuaryAfterResearch.blueprints) ? [...nextSanctuaryAfterResearch.blueprints] : nextBlueprints;
        nextFamilyCharges = {
          ...createEmptyFamilyChargeState(),
          ...(nextSanctuaryAfterResearch.familyCharges || {}),
        };
        nextLaboratory = {
          ...createEmptyLaboratoryState(),
          ...(nextSanctuaryAfterResearch.laboratory || {}),
        };
        nextStations = {
          ...createEmptySanctuaryState().stations,
          ...(nextSanctuaryAfterResearch.stations || {}),
        };
        if (job.input?.researchId === "unlock_abyss_portal") {
          nextAbyss = {
            ...nextAbyss,
            portalUnlocked: true,
            tier25BossCleared: true,
          };
        }
        logLine = `SANTUARIO: Laboratorio completa ${job.input?.label || "investigacion"} y mejora ${job.input?.targetLabel || SANCTUARY_STATION_DEFAULTS[job.input?.stationId]?.label || "el Santuario"}.`;
      } else if (job.type === "forge_project") {
        const sourceProject = job.input?.project || {};
        const nextUpgradeLevel = Math.max(0, Number(job.output?.nextUpgradeLevel || (Number(sourceProject?.upgradeLevel || 0) + 1)));
        const forgedProject = normalizeProjectRecord({
          ...deepForgeUpgradeProject(sourceProject, nextUpgradeLevel),
          forgedAt: action.now || Date.now(),
          forgeHistory: [
            ...(Array.isArray(sourceProject?.forgeHistory) ? sourceProject.forgeHistory : []),
            {
              at: action.now || Date.now(),
              upgradeLevel: nextUpgradeLevel,
              dustCost: Math.max(0, Number(job.input?.dustCost || 0)),
            },
          ],
        });
        nextStash = [...nextStash, forgedProject].sort((left, right) => Number(right?.rating || 0) - Number(left?.rating || 0));
        logLine = `SANTUARIO: Forja Profunda completa · ${forgedProject.name} sube a +${nextUpgradeLevel}.`;
      }

      const nextAccountTelemetry = {
        ...getAccountTelemetry(state),
        distillJobsCompleted:
          Math.max(0, Number(state?.accountTelemetry?.distillJobsCompleted || 0)) + (job.type === "distill_bundle" ? 1 : 0),
        codexResearchCompleted:
          Math.max(0, Number(state?.accountTelemetry?.codexResearchCompleted || 0)) + (job.type === "codex_research" ? 1 : 0),
        labResearchCompleted:
          Math.max(0, Number(state?.accountTelemetry?.labResearchCompleted || 0)) + (job.type === "laboratory_research" ? 1 : 0),
        errandJobsCompleted:
          Math.max(0, Number(state?.accountTelemetry?.errandJobsCompleted || 0)) + (job.type === "sanctuary_errand" ? 1 : 0),
        sigilJobsCompleted:
          Math.max(0, Number(state?.accountTelemetry?.sigilJobsCompleted || 0)) + (job.type === "infuse_sigil" ? 1 : 0),
        blueprintsScrapped:
          Math.max(0, Number(state?.accountTelemetry?.blueprintsScrapped || 0)) + (job.type === "scrap_extracted_item" ? 1 : 0),
      };

      return withAchievementProgress({
        ...state,
        player: nextPlayer,
        codex: nextCodex,
        abyss: nextAbyss,
        accountTelemetry: nextAccountTelemetry,
        stats: {
          ...state.stats,
          upgradesCrafted: (state.stats?.upgradesCrafted || 0) + (job.type === "forge_project" ? 1 : 0),
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: nextStash,
          extractedItems: nextExtractedItems,
          blueprints: nextBlueprints,
          familyCharges: nextFamilyCharges,
          laboratory: nextLaboratory,
          stations: nextStations,
          activeBlueprints: ensureValidActiveBlueprints(nextBlueprints, state.sanctuary?.activeBlueprints || {}),
          deepForgeSession: null,
          jobs: nextJobs,
          resources: nextResources,
          sigilInfusions: nextInfusions,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            upgradesCrafted: (state.combat.analytics?.upgradesCrafted || 0) + (job.type === "forge_project" ? 1 : 0),
          },
          log: [
            ...(state.combat?.log || []),
            logLine,
          ].slice(-20),
        },
      });
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

    case "CLAIM_GOAL": {
      const goal = ACTIVE_GOALS.find(candidate => candidate.id === action.goalId);
      if (!goal) return state;
      if ((state.goals?.claimed || []).includes(goal.id)) return state;
      if (!isGoalCompleted(state, goal)) return state;

      const reward = goal.reward || {};
      return withAchievementProgress({
        ...state,
        player: {
          ...state.player,
          gold: (state.player.gold || 0) + (reward.gold || 0),
          essence: (state.player.essence || 0) + (reward.essence || 0),
          talentPoints: (state.player.talentPoints || 0) + (reward.talentPoints || 0),
        },
        goals: {
          ...state.goals,
          claimed: [...(state.goals?.claimed || []), goal.id],
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            goldEarned: (state.combat.analytics?.goldEarned || 0) + (reward.gold || 0),
            essenceEarned: (state.combat.analytics?.essenceEarned || 0) + (reward.essence || 0),
            goldBySource: {
              ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
              goals: (state.combat.analytics?.goldBySource?.goals || 0) + (reward.gold || 0),
            },
            essenceBySource: {
              ...(state.combat.analytics?.essenceBySource || createEmptySessionAnalytics().essenceBySource),
              goals: (state.combat.analytics?.essenceBySource?.goals || 0) + (reward.essence || 0),
            },
          },
          log: [
            ...(state.combat.log || []),
            `OBJETIVO: ${goal.name} reclamado (+${reward.gold || 0} oro, +${reward.essence || 0} esencia${reward.talentPoints ? `, +${reward.talentPoints} TP` : ""})`,
          ].slice(-20),
        },
      });
    }

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
    case "UPGRADE_PLAYER": {
      const nextState = upgradePlayer(state, action.upgradeId);
      if (nextState === state) return state;
      return {
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            playerUpgradesPurchased: (nextState.combat.analytics?.playerUpgradesPurchased || 0) + 1,
            goldSpent: (nextState.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (nextState.player.gold || 0)),
            goldSpentBySource: {
              ...(nextState.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              playerUpgrades:
                (nextState.combat.analytics?.goldSpentBySource?.playerUpgrades || 0) +
                Math.max(0, (state.player.gold || 0) - (nextState.player.gold || 0)),
            },
          },
        },
      };
    }

    case "UNLOCK_TALENT": {
      const nextState = unlockTalent(state, action.talentId);
      if (nextState === state) return state;
      return withAchievementProgress({
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            talentsUnlocked: (nextState.combat.analytics?.talentsUnlocked || 0) + 1,
          },
        },
      });
    }

    case "UPGRADE_TALENT_NODE": {
      const nextState = upgradeTalentNode(state, action.nodeId);
      if (nextState === state) return state;
      return withAchievementProgress({
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            talentsUnlocked: (nextState.combat.analytics?.talentsUnlocked || 0) + 1,
            talentNodeUpgrades: (nextState.combat.analytics?.talentNodeUpgrades || 0) + 1,
          },
        },
      });
    }

    case "RESET_TALENT_TREE": {
      const nextState = resetTalentTree(state);
      if (nextState === state) return state;
      return withAchievementProgress({
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            talentResets: (nextState.combat.analytics?.talentResets || 0) + 1,
          },
        },
      });
    }

    case "SELECT_CLASS":
      {
        const nextState = selectClass(state, action.classId);
        if (nextState === state) return state;
        const onboarding = normalizeOnboardingState(state.onboarding || createEmptyOnboardingState());
        return {
          ...nextState,
          currentTab: "combat",
          expedition: {
            ...(nextState.expedition || createEmptyExpeditionState()),
            phase: "active",
          },
          onboarding: {
            ...onboarding,
            step: ONBOARDING_STEPS.COMBAT_INTRO,
            flags: {
              ...onboarding.flags,
              classChosen: true,
            },
          },
        };
      }

    case "SELECT_SPECIALIZATION":
      return selectSpecialization(state, action.specId, {
        ignoreRequirement: state?.onboarding?.step === ONBOARDING_STEPS.CHOOSE_SPEC,
      });

    // --------------------------------------------------------
    case "BUY_PRESTIGE_NODE": {
      if (state?.onboarding?.step === ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE) {
        const tutorialNodeId = getOnboardingFirstEchoNodeId(state);
        if (tutorialNodeId && action.nodeId !== tutorialNodeId) return state;
      }

      const node = PRESTIGE_TREE_NODES.find(candidate => candidate.id === action.nodeId);
      if (!node) return state;

      const purchase = canPurchasePrestigeNode(state, node);
      if (!purchase.ok) return state;

      const currentLevel = state.prestige?.nodes?.[node.id] || 0;
      const nextPrestige = {
        ...state.prestige,
        echoes: (state.prestige?.echoes || 0) - purchase.cost,
        spentEchoes: (state.prestige?.spentEchoes || 0) + purchase.cost,
        totalEchoesEarned: state.prestige?.totalEchoesEarned || 0,
        nodes: {
          ...(state.prestige?.nodes || {}),
          [node.id]: currentLevel + 1,
        },
      };

      return withAchievementProgress({
        ...state,
        prestige: nextPrestige,
        player: syncPrestigeBonuses(state.player, nextPrestige),
        stats: {
          ...state.stats,
          prestigeNodesPurchased: (state.stats?.prestigeNodesPurchased || 0) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat.log || []),
            `RELIQUIA: ${node.name} sube a ${currentLevel + 1}/${node.maxLevel}.`,
          ].slice(-20),
        },
      });
    }

    // --------------------------------------------------------
    case "PRESTIGE": {
      const prestigeCheck = canPrestige(state);
      if (!prestigeCheck.ok) return state;

      const echoesGained = calculatePrestigeEchoGain(state);
      const nextPrestigeLevel = (state.prestige?.level || 0) + 1;
      const nextRunContext = createRunContext();
      const resetRunSigilIds = normalizeRunSigilIds("free", {
        slots: getMaxRunSigilSlots(state?.abyss || {}),
      });
      const nextPrestigeState = {
        ...state.prestige,
        level: nextPrestigeLevel,
        echoes: (state.prestige?.echoes || 0) + echoesGained,
        spentEchoes: state.prestige?.spentEchoes || 0,
        totalEchoesEarned: (state.prestige?.totalEchoesEarned || 0) + echoesGained,
        bestHistoricTier: Math.max(
          Number(state.prestige?.bestHistoricTier || 0),
          Number(prestigeCheck.preview?.progress?.maxTier || state.combat?.maxTier || 1)
        ),
        nodes: { ...(state.prestige?.nodes || {}) },
      };

      return buildPrestigeResetState(state, {
        echoesGained,
        nextPrestigeLevel,
        nextPrestigeState,
        resetRunSigilIds,
        nextRunContext,
        logLine: `Prestige ${nextPrestigeLevel}. +${echoesGained} ecos${prestigeCheck.preview?.momentum?.multiplier ? ` · Momentum x${Number(prestigeCheck.preview.momentum.multiplier).toFixed(1)}` : ""}. Resonancia total: ${(state.prestige?.totalEchoesEarned || 0) + echoesGained} ecos. Reinicias la corrida y volves a elegir clase para la proxima run.`,
      });
    }

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
    currentTab = nextPhase === "active" ? "combat" : "sanctuary";
  }
  if (nextPhase !== "active" && (currentTab === "combat" || currentTab === "inventory" || currentTab === "crafting" || currentTab === "codex")) {
    currentTab = "sanctuary";
  }
  if (
    prevPhase !== "active" &&
    nextPhase === "active" &&
    (currentTab === "character" || currentTab === "skills" || currentTab === "talents" || currentTab === "registry" || currentTab === "achievements" || currentTab === "stats" || currentTab === "system" || currentTab === "sanctuary")
  ) {
    currentTab = "combat";
  }

  return {
    ...nextState,
    currentTab,
    sanctuary: {
      ...createEmptySanctuaryState(),
      ...(nextState?.sanctuary || {}),
    },
    expedition,
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
  const telemetryState = applyDerivedAccountTelemetry(state, onboardingState);
  return recordReplayState(state, telemetryState, action);
}


