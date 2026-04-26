import { getSaveMode, loadGame } from "../utils/storage";
import { ENEMIES } from "../data/enemies";
import { BOSSES } from "../data/bosses";
import { normalizeStoredItem } from "../utils/loot";
import {
  createEmptyAccountTelemetry,
  createEmptySessionAnalytics,
  sanitizeAccountTelemetry,
  sanitizeSessionAnalytics,
} from "../utils/runTelemetry";
import { createEmptyReplayLibrary, createEmptyReplayLog, normalizeReplayLibrary, normalizeReplayLog } from "../utils/replayLog";
import { calcItemRating } from "./inventory/inventoryEngine";
import { spawnEnemy } from "./combat/enemyEngine";
import { createRunContext, normalizeRunContext } from "./combat/encounterRouting";
import {
  buildSanctuaryStationsWithLaboratory,
  createEmptyLaboratoryState,
  normalizeLaboratoryState,
  SANCTUARY_STATION_DEFAULTS,
} from "./sanctuary/laboratoryEngine";
import { refreshStats } from "./combat/statEngine";
import { createEmptyCodexState, normalizeCodexState, recordCodexSighting, syncCodexBonuses } from "./progression/codexEngine";
import { createEmptyAbyssState, getMaxRunSigilSlots, normalizeAbyssState } from "./progression/abyssProgression";
import { createEmptyPrestigeCycleProgress, normalizePrestigeState, syncPrestigeBonuses } from "./progression/prestigeEngine";
import { createEmptyExpeditionContracts, ensureExpeditionContracts } from "./progression/expeditionContracts";
import { createEmptyWeeklyLedger, ensureWeeklyLedger } from "./progression/weeklyLedger";
import { createEmptyWeeklyBossState, ensureWeeklyBossState } from "./progression/weeklyBoss";
import { createEmptyAppearanceProfile, normalizeAppearanceProfile } from "./progression/appearanceProfile";
import { rebuildPlayerProgressionBonuses } from "./progression/progressionEngine";
import { getRunSigil, getRunSigilPlayerBonuses, normalizeRunSigilIds } from "../data/runSigils";
import { migrateTalentsToV2, TALENT_SYSTEM_VERSION } from "./migrations/talentsV2Migration";
import { sanitizeLootRules } from "../utils/lootFilter";
import {
  convertLegacyProjectToBlueprint,
  createEmptyBlueprintLoadout,
  createEmptyFamilyChargeState,
  ensureValidActiveBlueprints,
  normalizeBlueprintRecord,
  normalizeFamilyChargeState,
  normalizeExtractedItemRecord,
} from "./sanctuary/blueprintEngine";
import { normalizeProjectRecord } from "./sanctuary/projectForgeEngine";
import {
  buildRelicFromExtractedItem,
  createEmptyRelicLoadout,
  ensureValidActiveRelics,
  normalizeRelicArmory,
  normalizeRelicContextAttunement,
  normalizeRelicRecord,
} from "./sanctuary/relicArmoryEngine";
import { createEmptyItemStashState, syncItemStashState } from "./sanctuary/itemStashSchema";
import { createEmptyOnboardingState, normalizeOnboardingState } from "./onboarding/onboardingEngine";

const MAX_REWARD_GOLD = Math.max(
  1,
  ...ENEMIES.map(enemy => enemy.goldReward || 0),
  ...BOSSES.map(boss => boss.goldReward || 0)
);
const SAFE_GOLD_RECOVERY_CAP = 5_000_000;
const SAFE_ESSENCE_RECOVERY_CAP = 1_000_000;
const SAFE_LEVEL_RECOVERY_CAP = 2_000;
const SAFE_BASE_DAMAGE_RECOVERY_CAP = 5_000;
const SAFE_BASE_MAX_HP_RECOVERY_CAP = 100_000;
const SAFE_TALENT_POINT_RECOVERY_CAP = 10_000;
const VALID_TABS = new Set(["sanctuary", "character", "combat", "inventory", "skills", "talents", "crafting", "prestige", "account", "achievements", "stats", "registry", "system", "lab", "codex"]);
const EXPEDITION_TABS = new Set(["combat", "inventory", "crafting", "codex"]);

function sanitizeStoredResource(value, { fallback = 0, recoveryCap = Number.MAX_SAFE_INTEGER } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return fallback;
  const floored = Math.floor(numeric);
  if (!Number.isSafeInteger(floored) || floored > recoveryCap) {
    return fallback;
  }
  return floored;
}

function sanitizeStoredLevel(value, fallback = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1) return fallback;
  const floored = Math.floor(numeric);
  if (!Number.isSafeInteger(floored) || floored > SAFE_LEVEL_RECOVERY_CAP) {
    return fallback;
  }
  return floored;
}

function getBaseDamageForLevel(level = 1) {
  return 10 + Math.max(0, Number(level || 1) - 1);
}

function getBaseMaxHpForLevel(level = 1) {
  return 100 + (Math.max(0, Number(level || 1) - 1) * 12);
}

function getLatestReplaySnapshot(replay = {}) {
  const actionSnapshots = [...(replay?.actions || [])].map(entry => ({
    tick: Number(entry?.tick || 0),
    snapshot: entry?.snapshot || null,
  }));
  const milestoneSnapshots = [...(replay?.milestones || [])].map(entry => ({
    tick: Number(entry?.tick || 0),
    snapshot: entry?.snapshot || null,
  }));

  return [...actionSnapshots, ...milestoneSnapshots]
    .filter(entry => {
      const snapshot = entry?.snapshot || {};
      const level = Number(snapshot.level || 0);
      const gold = Number(snapshot.gold || 0);
      const essence = Number(snapshot.essence || 0);
      const talentPoints = Number(snapshot.talentPoints || 0);

      return (
        Number.isFinite(level) &&
        level > 0 &&
        level <= SAFE_LEVEL_RECOVERY_CAP &&
        Number.isFinite(gold) &&
        gold >= 0 &&
        gold <= SAFE_GOLD_RECOVERY_CAP &&
        Number.isFinite(essence) &&
        essence >= 0 &&
        essence <= SAFE_ESSENCE_RECOVERY_CAP &&
        Number.isFinite(talentPoints) &&
        talentPoints >= 0 &&
        talentPoints <= SAFE_TALENT_POINT_RECOVERY_CAP
      );
    })
    .sort((left, right) => left.tick - right.tick)
    .at(-1)?.snapshot || null;
}

const DEFAULT_LOOT_RULES = {
  autoSellRarities: [],
  autoExtractRarities: [],
  huntPreset: null,
  wishlistAffixes: [],
  protectHuntedDrops: true,
  protectUpgradeDrops: true,
  minVisibleRarity: "common",
};

const DEFAULT_RUN_CONTEXT = createRunContext({ firstRun: true });

export function createEmptyInventoryOverflowStats() {
  return {
    total: 0,
    displaced: 0,
    lost: 0,
    lastAt: null,
  };
}

export function createEmptySaveDiagnostics() {
  return {
    legacyNeedsRepair: false,
    legacyPromptShownCount: 0,
    lastRepairAt: null,
  };
}

export function sanitizeSaveDiagnostics(rawDiagnostics = {}) {
  return {
    ...createEmptySaveDiagnostics(),
    ...(rawDiagnostics || {}),
    legacyNeedsRepair: Boolean(rawDiagnostics?.legacyNeedsRepair),
    legacyPromptShownCount: Math.max(0, Math.floor(Number(rawDiagnostics?.legacyPromptShownCount || 0))),
    lastRepairAt: rawDiagnostics?.lastRepairAt ? Number(rawDiagnostics.lastRepairAt) || null : null,
  };
}

function createEmptySanctuaryState() {
  return {
    stash: [],
    extractedItems: [],
    itemStash: createEmptyItemStashState(),
    relicArmory: [],
    blueprints: [],
    cargoInventory: [],
    jobs: [],
    deepForgeSession: null,
    pendingOpenForgeOverlay: false,
    resources: {
      codexInk: 0,
      sigilFlux: 0,
      relicDust: 0,
    },
    familyCharges: createEmptyFamilyChargeState(),
    activeBlueprints: createEmptyBlueprintLoadout(),
    activeRelics: createEmptyRelicLoadout(),
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
      relicSlots: 8,
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
    seenFamilyIds: [],
    cargoFound: [],
    projectCandidates: [],
    selectedCargoIds: [],
    selectedProjectItemId: null,
    selectedProjectDecision: "keep",
    extractionPreview: null,
    activeInfusionIds: [],
    activeInfusionPlayerBonuses: {},
    activeExtractionBonuses: {},
    activeRelicContext: "none",
    activeRelicContextBonuses: {},
    activeRelicContextMatches: [],
    activeRelicContextMismatches: [],
  };
}

function normalizeProjectAffixRecord(affix = {}, fallbackId = "legacy_affix_0") {
  const value = Number(affix?.value ?? affix?.rolledValue ?? 0) || 0;
  const tier = Math.max(1, Math.floor(Number(affix?.tier || 1)));
  const minRange = Number(affix?.range?.min ?? value * 0.85) || 0;
  const maxRange = Number(affix?.range?.max ?? value * 1.15) || value;
  return {
    id: affix?.id || fallbackId,
    stat: affix?.stat || "damage",
    tier,
    value,
    rolledValue: Number(affix?.rolledValue ?? affix?.value ?? value) || value,
    range: {
      min: Math.min(minRange, maxRange),
      max: Math.max(minRange, maxRange),
    },
    source: affix?.source || "legacy_migration",
  };
}

function buildProjectFromItemSnapshot(item = {}, { idPrefix = "project_migrated", source = "legacy_migration", now = Date.now() } = {}) {
  if (!item?.id) return null;

  const rawAffixes = Array.isArray(item?.affixes)
    ? item.affixes.map((affix, index) => normalizeProjectAffixRecord(affix, `${item.id}_affix_${index}`)).filter(Boolean)
    : [];
  const fallbackStat = item?.type === "armor" ? "healthMax" : "damage";
  const fallbackTier = Math.max(1, Math.min(3, Math.ceil(Math.max(1, Number(item?.itemTier || 1)) / 8)));
  const fallbackValue = Math.max(1, Math.round(Math.max(1, Number(item?.rating || 1)) * (item?.type === "armor" ? 0.6 : 0.18)));
  const affixes = rawAffixes.length > 0
    ? rawAffixes
    : [normalizeProjectAffixRecord({
      id: `${item.id}_legacy_fallback`,
      stat: fallbackStat,
      tier: fallbackTier,
      value: fallbackValue,
      rolledValue: fallbackValue,
      range: {
        min: Math.max(1, Math.round(fallbackValue * 0.85)),
        max: Math.max(1, Math.round(fallbackValue * 1.15)),
      },
      source: "legacy_fallback",
    })];

  return {
    id: `${idPrefix}_${item.id}`,
    sourceItemId: item.id,
    name: item?.name || "Proyecto legado",
    rarity: item?.rarity || "rare",
    type: item?.type || "weapon",
    baseType: item?.baseType || item?.subtype || item?.type || "weapon",
    rating: Math.max(1, Math.round(Number(item?.rating || 1))),
    baseRating: Math.max(1, Math.round(Number(item?.rating || 1))),
    affixes,
    baseAffixes: affixes.map(affix => ({ ...affix })),
    legendaryPowerId: item?.legendaryPowerId || null,
    projectTier: 0,
    upgradeLevel: 0,
    upgradeCap: 15,
    ascensionTier: 0,
    powerTier: item?.legendaryPowerId ? 1 : 0,
    createdAt: now,
    sourceMeta: { source },
  };
}

function buildProjectFromBlueprintRecord(blueprint = {}, { now = Date.now() } = {}) {
  const normalized = normalizeBlueprintRecord(blueprint);
  if (!normalized?.id) return null;

  const seededAffixes = Array.isArray(normalized?.affixes) && normalized.affixes.length > 0
    ? normalized.affixes
    : Object.entries({
      ...(normalized?.baseBonus || {}),
      ...(normalized?.implicitBonus || {}),
    })
      .filter(([, rawValue]) => Math.abs(Number(rawValue || 0)) > 0)
      .slice(0, 4)
      .map(([stat, rawValue], index) => {
        const value = Number(rawValue || 0);
        return normalizeProjectAffixRecord({
          id: `${normalized.id}_bonus_${index}`,
          stat,
          tier: Math.max(1, Math.min(3, Math.ceil(Math.max(1, Number(normalized?.itemTier || 1)) / 8))),
          value,
          rolledValue: value,
          range: {
            min: value * 0.9,
            max: value * 1.1,
          },
          source: "legacy_blueprint_bonus",
        });
      });

  const projectSeed = buildProjectFromItemSnapshot(
    {
      id: normalized.sourceBaseItemId || normalized.id,
      name: normalized.sourceName || "Proyecto legado",
      rarity: normalized.rarity || "rare",
      type: normalized.slot || "weapon",
      baseType: normalized.family || normalized.slot || "weapon",
      rating: Math.max(1, Number(normalized.baseRating || 1)),
      itemTier: Math.max(1, Number(normalized.itemTier || 1)),
      legendaryPowerId: normalized.legendaryPowerId || null,
      affixes: seededAffixes,
    },
    {
      idPrefix: `project_legacy_blueprint_${normalized.id}`,
      source: "legacy_blueprint",
      now,
    }
  );
  if (!projectSeed) return null;

  return normalizeProjectRecord({
    ...projectSeed,
    projectTier: Math.max(0, Number(normalized?.ascensionTier || 0)),
    upgradeLevel: Math.max(0, Number(normalized?.blueprintLevel || 0)),
    ascensionTier: Math.max(0, Number(normalized?.ascensionTier || 0)),
    powerTier: normalized?.legendaryPowerId
      ? Math.max(1, Number(normalized?.powerTuneLevel || 1))
      : 0,
  });
}

function getProjectStashDedupKey(project = {}) {
  if (project?.sourceItemId) return `source:${project.sourceItemId}`;
  if (project?.id) return `id:${project.id}`;
  return null;
}

function mergeProjectStashes(...groups) {
  const merged = [];
  const seen = new Set();
  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const entry of group) {
      const project = normalizeProjectRecord(entry);
      if (!project) continue;
      const dedupKey = getProjectStashDedupKey(project);
      if (dedupKey && seen.has(dedupKey)) continue;
      if (dedupKey) seen.add(dedupKey);
      merged.push(project);
    }
  }
  return merged;
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

function deriveExpeditionPhase({ player = {}, combat = {}, expedition = {}, onboarding = {}, sanctuary = {} } = {}) {
  const explicitPhase = expedition?.phase;
  const firstExtractionCompleted =
    Boolean(onboarding?.flags?.firstExtractionCompleted) ||
    Boolean(sanctuary?.stations?.laboratory?.unlocked) ||
    (Array.isArray(sanctuary?.cargoInventory) && sanctuary.cargoInventory.length > 0) ||
    Object.keys(sanctuary?.laboratory?.completed || {}).length > 0;
  const hasTrackedActiveExpedition = Boolean(expedition?.id || expedition?.startedAt);
  if (combat?.pendingRunSetup) return "setup";
  if (explicitPhase === "extraction") return "extraction";
  if (explicitPhase === "setup") return "setup";
  if (explicitPhase === "sanctuary") {
    if (
      player?.class &&
      (player?.specialization || Number(player?.prestigeLevelHint || 0) <= 0) &&
      !firstExtractionCompleted
    ) {
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
  if (player?.class && (player?.specialization || Number(player?.prestigeLevelHint || 0) <= 0)) return "active";
  return "sanctuary";
}

function getDefaultTabForPhase(phase = "sanctuary") {
  return phase === "active" || phase === "setup" ? "combat" : "sanctuary";
}

function normalizeStoredTab(tab, { phase = "sanctuary", prestigeUnlocked = false } = {}) {
  const fallback = getDefaultTabForPhase(phase);
  const candidate = VALID_TABS.has(tab) ? tab : fallback;
  if (candidate === "lab") return fallback;
  if (!prestigeUnlocked && candidate === "prestige") return fallback;
  if (phase !== "active" && EXPEDITION_TABS.has(candidate)) return fallback;
  return candidate;
}

function appendSeenFamilyIds(expedition = {}, enemy = null) {
  const familyId = enemy?.familyTraitId || enemy?.family || null;
  const current = Array.isArray(expedition?.seenFamilyIds) ? expedition.seenFamilyIds : [];
  if (!familyId || current.includes(familyId)) return current;
  return [...current, familyId];
}

function buildCompletedOnboardingState({
  player = {},
  stats = {},
  combat = {},
  prestige = {},
  sanctuary = {},
  abyss = {},
} = {}) {
  const hasBossProgress =
    Number(combat?.maxTier || 1) >= 5 ||
    Number(combat?.analytics?.bossKills || 0) > 0 ||
    Number(stats?.bossKills || 0) > 0;
  const prestigeNodesBought = Object.values(prestige?.nodes || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const onboardingTemplate = createEmptyOnboardingState();

  return normalizeOnboardingState({
    ...onboardingTemplate,
    completed: true,
    step: null,
    flags: {
      ...onboardingTemplate.flags,
      classChosen: Boolean(player?.class),
      expeditionIntroSeen: true,
      autoAdvanceUnlocked: true,
      firstDeathSeen: Number(stats?.deaths || 0) > 0 || Number(stats?.kills || 0) > 0,
      specChosen: Boolean(player?.specialization),
      heroIntroSeen: true,
      firstAttributeSpent: true,
      firstTalentBought: true,
      inventoryUnlocked: true,
      firstItemEquipped: Boolean(player?.equipment?.weapon || player?.equipment?.armor),
      firstBossSeen: hasBossProgress,
      huntUnlocked: hasBossProgress,
      extractionUnlocked:
        Boolean(sanctuary?.stations?.laboratory?.unlocked) ||
        (Array.isArray(sanctuary?.cargoInventory) ? sanctuary.cargoInventory.length : 0) > 0 ||
        Number(prestige?.level || 0) > 0,
      firstExtractionCompleted:
        Boolean(sanctuary?.stations?.laboratory?.unlocked) ||
        (Array.isArray(sanctuary?.cargoInventory) ? sanctuary.cargoInventory.length : 0) > 0 ||
        (Array.isArray(sanctuary?.jobs) ? sanctuary.jobs.length : 0) > 0 ||
        Number(prestige?.level || 0) > 0,
      firstSanctuaryReturnSeen:
        Boolean(sanctuary?.stations?.distillery?.unlocked) ||
        (Array.isArray(sanctuary?.jobs)
          ? sanctuary.jobs.some(
              job =>
                (job?.station === "laboratory" && job?.input?.researchId === "unlock_distillery") ||
                job?.station === "distillery"
            )
          : false) ||
        Number(prestige?.level || 0) > 0,
      laboratoryUnlocked: Boolean(sanctuary?.stations?.laboratory?.unlocked),
      distilleryUnlocked: Boolean(sanctuary?.stations?.distillery?.unlocked),
      distilleryJobStarted:
        Boolean(sanctuary?.stations?.distillery?.unlocked) ||
        (Array.isArray(sanctuary?.jobs) ? sanctuary.jobs.some(job => job?.station === "distillery") : false),
      blueprintDecisionUnlocked:
        Number(prestige?.level || 0) >= 2 ||
        (Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints.length : 0) > 0 ||
        (Array.isArray(sanctuary?.extractedItems) ? sanctuary.extractedItems.length : 0) > 0,
      firstEchoesSeen:
        Number(prestige?.level || 0) > 0 ||
        Number(prestige?.totalEchoesEarned || 0) > 0,
      firstEchoTabOpened:
        Number(prestige?.level || 0) > 0 ||
        Number(prestige?.totalEchoesEarned || 0) > 0,
      firstEchoNodeBought: prestigeNodesBought > 0,
      firstPrestigeCloseSeen: prestigeNodesBought > 0,
      blueprintScrapped:
        Number(prestige?.level || 0) >= 3 ||
        (Array.isArray(sanctuary?.jobs) ? sanctuary.jobs.some(job => job?.type === "scrap_extracted_item") : false),
      blueprintConverted:
        (Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints.length : 0) > 0,
      firstBlueprintMaterializationSeen:
        (Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints.length : 0) > 0,
      deepForgeReadySeen:
        Number(prestige?.level || 0) >= 3 ||
        Boolean(sanctuary?.stations?.deepForge?.unlocked),
      firstDeepForgeUseSeen:
        Boolean(sanctuary?.stations?.deepForge?.unlocked) &&
        (Array.isArray(sanctuary?.jobs) ? sanctuary.jobs.some(job => job?.station === "deepForge") : false),
      libraryReadySeen:
        Number(prestige?.level || 0) >= 4 ||
        Boolean(sanctuary?.stations?.codexResearch?.unlocked),
      errandsReadySeen:
        Number(prestige?.level || 0) >= 5 ||
        Boolean(sanctuary?.stations?.errands?.unlocked),
      sigilAltarReadySeen:
        Number(prestige?.level || 0) >= 6 ||
        Boolean(sanctuary?.stations?.sigilInfusion?.unlocked),
      abyssPortalReadySeen:
        Boolean(abyss?.portalUnlocked) || Boolean(abyss?.tier25BossCleared),
      tier25CapSeen: Boolean(abyss?.tier25BossCleared),
      firstAbyssSeen: Number(abyss?.highestTierReached || 1) >= 26,
    },
  });
}

const freshState = {
  player: {
    level: 1,
    xp: 0,
    class: null,
    specialization: null,
    talentSystemVersion: TALENT_SYSTEM_VERSION,
    talentPoints: 0,
    talentLevels: {},
    unlockedTalents: [],
    upgrades: {},
    baseDamage: 10,
    baseDefense: 2,
    baseCritChance: 0.05,
    baseMaxHp: 100,
    damagePct: 0,
    flatDamage: 0,
    defensePct: 0,
    flatDefense: 0,
    hpPct: 0,
    flatRegen: 0,
    regenPctMaxHp: 0,
    flatCrit: 0,
    critDamage: 0,
    flatGold: 0,
    goldPct: 0,
    xpPct: 0,
    attackSpeed: 0,
    lifesteal: 0,
    blockChance: 0,
    thorns: 0,
    thornsDefenseRatio: 0,
    multiHitChance: 0,
    bleedChance: 0,
    bleedDamage: 0,
    fractureChance: 0,
    battleHardened: 0,
    heavyImpact: 0,
    bloodStrikes: 0,
    combatFlow: 0,
    ironConversion: 0,
    crushingWeight: 0,
    frenziedChain: 0,
    bloodDebt: 0,
    lastBreath: 0,
    execution: 0,
    ironCore: 0,
    fortress: 0,
    unmovingMountain: 0,
    titanicMomentum: 0,
    arcaneEcho: 0,
    arcaneMark: 0,
    arcaneFlow: 0,
    overchannel: 0,
    perfectCast: 0,
    freshTargetDamage: 0,
    chainBurst: 0,
    unstablePower: 0,
    overload: 0,
    volatileCasting: 0,
    controlMastery: 0,
    markTransfer: 0,
    temporalFlow: 0,
    spellMemory: 0,
    timeLoop: 0,
    absoluteControl: 0,
    cataclysm: 0,
    damage: 10,
    defense: 2,
    critChance: 0.05,
    maxHp: 100,
    hp: 100,
    gold: 0,
    essence: 0,
    prestigeBonuses: {},
    codexBonuses: {},
    runSigilBonuses: {},
    inventory: [],
    equipment: { weapon: null, armor: null },
  },

  settings: {
    theme: "light",
    lootRules: DEFAULT_LOOT_RULES,
  },

  currentTab: "sanctuary",
  appearanceProfile: createEmptyAppearanceProfile(),
  sanctuary: createEmptySanctuaryState(),
  expedition: createEmptyExpeditionState(),
  onboarding: createEmptyOnboardingState(),

  combat: {
    enemy: spawnEnemy(1, DEFAULT_RUN_CONTEXT),
    log: [],
    currentTier: 1,
    maxTier: 1,
    autoAdvance: false,
    ticksInCurrentRun: 0,
    lastRunTier: 0,
    effects: [],
    sessionKills: 0,
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
    prestigeCycle: createEmptyPrestigeCycleProgress(),
    performanceSnapshot: {
      damagePerTick: 0,
      goldPerTick: 0,
      xpPerTick: 0,
      killsPerMinute: 0,
    },
    lastRunSummary: null,
    offlineSummary: null,
    latestLootEvent: null,
    inventoryOverflowEvent: null,
    inventoryOverflowStats: createEmptyInventoryOverflowStats(),
    pendingOpenLootFilter: false,
    reforgeSession: null,
    runContext: DEFAULT_RUN_CONTEXT,
    pendingRunSetup: false,
    pendingRunSigilId: "free",
    pendingRunSigilIds: ["free"],
    activeRunSigilId: "free",
    activeRunSigilIds: ["free"],
    weeklyBossEncounter: null,
    craftingLog: [],
    analytics: createEmptySessionAnalytics(),
  },

  stats: {
    kills: 0,
    blocksDone: 0,
    evadesDone: 0,
    itemsFound: 0,
    itemsSold: 0,
    itemsExtracted: 0,
    autoSoldItems: 0,
    autoExtractedItems: 0,
    bossKills: 0,
    bossKillsWithBleed: 0,
    bossKillsWithFracture: 0,
    bossKillsWithDualStatus: 0,
    bossKillsWithGuardPlay: 0,
    deaths: 0,
    perfectRollsFound: 0,
    t1AffixesFound: 0,
    legendaryItemsFound: 0,
    epicItemsFound: 0,
    rareItemsFound: 0,
    magicItemsFound: 0,
    commonItemsFound: 0,
    upgradesCrafted: 0,
    rerollsCrafted: 0,
    polishesCrafted: 0,
    reforgesCrafted: 0,
    prestigeNodesPurchased: 0,
    ascendsCrafted: 0,
    prestigeCount: 0,
    talentsUnlocked: 0,
    talentResets: 0,
    bestItemRating: 0,
  },

  achievements: [],

  goals: {
    claimed: [],
  },

  prestige: {
    level: 0,
    echoes: 0,
    spentEchoes: 0,
    totalEchoesEarned: 0,
    bestHistoricTier: 0,
    nodes: {},
  },
  abyss: createEmptyAbyssState(),
  codex: createEmptyCodexState(),

  replay: createEmptyReplayLog(),
  replayLibrary: createEmptyReplayLibrary(),
  accountTelemetry: createEmptyAccountTelemetry(),
  saveDiagnostics: createEmptySaveDiagnostics(),
  expeditionContracts: createEmptyExpeditionContracts(),
  weeklyLedger: createEmptyWeeklyLedger(),
  weeklyBoss: createEmptyWeeklyBossState(),
};

export function createFreshState() {
  const next = JSON.parse(JSON.stringify(freshState));
  next.codex = recordCodexSighting(next.codex, next.combat.enemy);
  next.expeditionContracts = ensureExpeditionContracts(next, next.expeditionContracts, Date.now());
  next.weeklyLedger = ensureWeeklyLedger(next, next.weeklyLedger, Date.now());
  next.weeklyBoss = ensureWeeklyBossState(next, next.weeklyBoss, Date.now());
  return next;
}

export function createSimulationSeedState() {
  const next = createFreshState();
  next.onboarding = buildCompletedOnboardingState({
    player: next.player,
    stats: next.stats,
    combat: next.combat,
    prestige: next.prestige,
    sanctuary: next.sanctuary,
    abyss: next.abyss,
  });
  return next;
}

export function createPostOnboardingSimulationState({
  classId = "warrior",
  specialization = null,
  level = 5,
  gold = 900,
  essence = 450,
  currentTier = 5,
} = {}) {
  const next = createSimulationSeedState();
  const safeLevel = Math.max(1, Math.floor(Number(level || 1)));
  const safeTier = Math.max(1, Math.floor(Number(currentTier || 1)));
  const safeGold = Math.max(0, Math.floor(Number(gold || 0)));
  const safeEssence = Math.max(0, Math.floor(Number(essence || 0)));
  const normalizedClass = classId === "mage" ? "mage" : "warrior";

  next.player.class = normalizedClass;
  next.player.specialization = specialization || null;
  next.player.level = safeLevel;
  next.player.baseDamage = getBaseDamageForLevel(safeLevel);
  next.player.baseMaxHp = getBaseMaxHpForLevel(safeLevel);
  next.player.gold = safeGold;
  next.player.essence = safeEssence;
  next.player.hp = next.player.baseMaxHp;
  next.player.maxHp = next.player.baseMaxHp;
  next.player = refreshStats(next.player);
  next.stats = {
    ...next.stats,
    kills: Math.max(next.stats?.kills || 0, 80),
    bossKills: Math.max(next.stats?.bossKills || 0, 2),
  };
  next.expedition = {
    ...next.expedition,
    phase: "setup",
  };
  next.combat = {
    ...next.combat,
    currentTier: safeTier,
    maxTier: safeTier,
    pendingRunSetup: true,
    pendingRunSigilId: "free",
    pendingRunSigilIds: ["free"],
    activeRunSigilId: "free",
    activeRunSigilIds: ["free"],
  };
  next.currentTab = "combat";
  next.onboarding = buildCompletedOnboardingState({
    player: next.player,
    stats: next.stats,
    combat: next.combat,
    prestige: next.prestige,
    sanctuary: next.sanctuary,
    abyss: next.abyss,
  });
  return next;
}

function createLaboratoryDebugState() {
  const next = createFreshState();
  next.player.class = null;
  next.player.specialization = null;
  next.player.hp = next.player.maxHp;
  next.prestige = normalizePrestigeState({
    ...next.prestige,
    level: 1,
    echoes: 1,
    totalEchoesEarned: 1,
  });
  next.sanctuary = {
    ...createEmptySanctuaryState(),
    ...next.sanctuary,
    cargoInventory: [
      {
        id: "tutorial_lab_bundle",
        type: "codexInk",
        quantity: 3,
        label: "Bundle tutorial",
        description: "Carga de prueba para onboarding del Laboratorio.",
        source: "tutorial",
        extractedAt: Date.now(),
      },
    ],
    stations: buildSanctuaryStationsWithLaboratory({
      ...createEmptySanctuaryState().stations,
      ...(next.sanctuary?.stations || {}),
      laboratory: {
        ...createEmptySanctuaryState().stations.laboratory,
        unlocked: true,
      },
    }),
  };
  next.expedition = {
    ...createEmptyExpeditionState(),
    phase: "sanctuary",
  };
  next.combat = {
    ...next.combat,
    pendingRunSetup: false,
  };
  next.currentTab = "sanctuary";
  next.onboarding = normalizeOnboardingState({
    ...createEmptyOnboardingState(),
    step: "open_laboratory",
    flags: {
      ...createEmptyOnboardingState().flags,
      classChosen: true,
      combatIntroSeen: true,
      autoAdvanceUnlocked: true,
      firstDeathSeen: true,
      heroTabUnlocked: true,
      specChosen: true,
      heroIntroSeen: true,
      firstAttributeSpent: true,
      firstTalentBought: true,
      inventoryUnlocked: true,
      firstItemEquipped: true,
      firstBossSeen: true,
      huntUnlocked: true,
      extractionUnlocked: true,
      firstExtractionCompleted: true,
      firstSanctuaryReturnSeen: true,
      laboratoryUnlocked: true,
      distilleryUnlocked: false,
      distilleryJobStarted: false,
    },
  });
  return next;
}

const saved = loadGame();
const saveMode = getSaveMode();
const isValidSave =
  saved?.combat?.enemy?.xpReward != null &&
  saved?.player?.baseDamage != null &&
  saved?.player?.essence != null &&
  saved?.stats != null &&
  saved?.prestige != null &&
  saved?.combat?.sessionKills != null;

function normalizeItemCollection(items = []) {
  return (items || []).map(item => {
    const normalized = normalizeStoredItem(item);
    return {
      ...normalized,
      rating: calcItemRating(normalized),
    };
  });
}

function normalizeEquipmentItem(item) {
  if (!item) return null;
  const normalized = normalizeStoredItem(item);
  return {
    ...normalized,
    rating: calcItemRating(normalized),
  };
}

function normalizeEnemy(enemy, currentTier, runContext) {
  const tier = enemy?.tier || currentTier || 1;
  const freshEnemy = spawnEnemy(tier, runContext);
  if (!enemy) return freshEnemy;

  const hpRatio = enemy.maxHp > 0 ? Math.max(0, Math.min(1, enemy.hp / enemy.maxHp)) : 1;
  return {
    ...freshEnemy,
    hp: Math.max(1, Math.floor(freshEnemy.maxHp * hpRatio)),
  };
}

export function mergeStateWithDefaults(base, incoming) {
  if (!incoming) return base;
  const migratedIncoming = migrateTalentsToV2(incoming);
  const normalizedReplay = normalizeReplayLog(migratedIncoming.replay || base.replay);
  const normalizedReplayLibrary = normalizeReplayLibrary(migratedIncoming.replayLibrary || base.replayLibrary);
  const recoverySnapshot =
    getLatestReplaySnapshot(normalizedReplay) ||
    normalizedReplayLibrary.entries
      .map(entry => getLatestReplaySnapshot(entry.replay))
      .filter(Boolean)
      .sort((left, right) => Number(left?.tick || 0) - Number(right?.tick || 0))
      .at(-1) ||
    null;

  const normalizedPrestige = normalizePrestigeState(migratedIncoming.prestige || {});
  const normalizedInventory = normalizeItemCollection(migratedIncoming.player?.inventory || []);
  const normalizedEquipment = {
    weapon: normalizeEquipmentItem(migratedIncoming.player?.equipment?.weapon),
    armor: normalizeEquipmentItem(migratedIncoming.player?.equipment?.armor),
  };
  const discoveredLegendaryPowerIds = [
    ...normalizedInventory.map(item => item?.legendaryPowerId).filter(Boolean),
    normalizedEquipment.weapon?.legendaryPowerId,
    normalizedEquipment.armor?.legendaryPowerId,
  ].filter(Boolean);
  const normalizedCodex = normalizeCodexState(migratedIncoming.codex || base.codex, discoveredLegendaryPowerIds);
  const rawPlayer = migratedIncoming.player || {};
  const rawCombat = migratedIncoming.combat || {};
  const rawSanctuary = migratedIncoming.sanctuary || {};
  const rawExpedition = migratedIncoming.expedition || {};
  const rawStats = migratedIncoming.stats || {};
  const abyssTierCandidate = Math.max(
    Number(migratedIncoming.abyss?.highestTierReached || 1),
    Number(rawCombat.maxTier || 1),
    Number(rawCombat.currentTier || 1),
    Number(rawCombat.analytics?.maxTierReached || 1),
    Number(rawCombat.prestigeCycle?.maxTier || 1)
  );
  const normalizedAbyss = normalizeAbyssState({
    ...(migratedIncoming.abyss || {}),
    highestTierReached: abyssTierCandidate,
  });
  const maxRunSigilSlots = getMaxRunSigilSlots(normalizedAbyss);
  const hasHistoricPrestigeProgress =
    Number(normalizedPrestige.level || 0) > 0 ||
    Number(migratedIncoming.stats?.prestigeCount || 0) > 0;
  const fallbackHistoricBestTier = hasHistoricPrestigeProgress
    ? Math.max(
      Number(normalizedPrestige.bestHistoricTier || 0),
      Number(rawCombat.analytics?.maxTierReached || 1),
      Number(rawCombat.lastRunSummary?.maxTier || 1)
    )
    : Number(normalizedPrestige.bestHistoricTier || 0);
  const rawLevel = Number(rawPlayer.level ?? base.player.level);
  const rawBaseDamage = Number(rawPlayer.baseDamage ?? base.player.baseDamage);
  const rawBaseMaxHp = Number(rawPlayer.baseMaxHp ?? base.player.baseMaxHp);
  const rawTalentPoints = Number(rawPlayer.talentPoints ?? base.player.talentPoints);
  const rawXp = Number(rawPlayer.xp ?? base.player.xp);
  const prestigeLevel = Number(normalizedPrestige.level || 0);
  const pendingRunSetup = (
    Boolean(rawCombat.pendingRunSetup) ||
    rawExpedition?.phase === "setup"
  );
  const pendingRunSigilIds = normalizeRunSigilIds(
    rawCombat.pendingRunSigilIds || rawCombat.pendingRunSigilId || "free",
    { slots: maxRunSigilSlots }
  );
  const activeRunSigilIds = pendingRunSetup
    ? normalizeRunSigilIds("free", { slots: maxRunSigilSlots })
    : normalizeRunSigilIds(rawCombat.activeRunSigilIds || rawCombat.activeRunSigilId || "free", {
        slots: maxRunSigilSlots,
      });
  const pendingRunSigilId = pendingRunSigilIds[0] || getRunSigil("free").id;
  const activeRunSigilId = activeRunSigilIds[0] || getRunSigil("free").id;
  const fallbackRunContext = rawCombat.runContext
    ? rawCombat.runContext
    : prestigeLevel >= 1
      ? createRunContext()
      : base.combat.runContext;
  const normalizedRunContext = normalizeRunContext(fallbackRunContext);
  const derivedExpeditionPhase = deriveExpeditionPhase({
    player: {
      class: rawPlayer.class ?? base.player.class,
      specialization: rawPlayer.specialization ?? base.player.specialization,
      prestigeLevelHint: prestigeLevel,
    },
    expedition: rawExpedition,
    combat: {
      pendingRunSetup,
    },
    sanctuary: rawSanctuary,
    onboarding: migratedIncoming.onboarding || {},
  });
  const normalizedExtractedItems = Array.isArray(rawSanctuary.extractedItems)
    ? rawSanctuary.extractedItems.map(item => normalizeExtractedItemRecord(item)).filter(Boolean)
    : [];
  const normalizedSavedRelicArmory = Array.isArray(rawSanctuary.relicArmory)
    ? rawSanctuary.relicArmory.map(relic => normalizeRelicRecord(relic)).filter(Boolean)
    : [];
  const migratedRelicArmory =
    normalizedSavedRelicArmory.length > 0
      ? normalizedSavedRelicArmory
      : normalizedExtractedItems
          .map(extractedItem =>
            buildRelicFromExtractedItem(extractedItem, {
              now: Date.now(),
            })
          )
          .filter(Boolean);
  const normalizedRelicArmory = normalizeRelicArmory(migratedRelicArmory);
  const normalizedLegacyBlueprints = Array.isArray(rawSanctuary.blueprints)
    ? rawSanctuary.blueprints.map(blueprint => normalizeBlueprintRecord(blueprint)).filter(Boolean)
    : Array.isArray(rawSanctuary.stash)
      ? rawSanctuary.stash.map(project => convertLegacyProjectToBlueprint(project)).filter(Boolean)
      : [];
  const normalizedSavedStash = Array.isArray(rawSanctuary.stash)
    ? rawSanctuary.stash.map(project => normalizeProjectRecord(project)).filter(Boolean)
    : [];
  const migratedStashFromRelics = normalizedRelicArmory
    .map(relic =>
      normalizeProjectRecord(
        buildProjectFromItemSnapshot(relic, {
          idPrefix: "project_legacy_relic",
          source: "legacy_relic",
          now: Date.now(),
        })
      )
    )
    .filter(Boolean);
  const migratedStashFromBlueprints = normalizedLegacyBlueprints
    .map(blueprint => buildProjectFromBlueprintRecord(blueprint, { now: Date.now() }))
    .filter(Boolean);
  const normalizedStash = mergeProjectStashes(
    normalizedSavedStash,
    migratedStashFromRelics,
    migratedStashFromBlueprints
  ).sort((left, right) => Number(right?.rating || 0) - Number(left?.rating || 0));
  const preLaboratorySanctuary = {
    ...createEmptySanctuaryState(),
    ...rawSanctuary,
    stash: normalizedStash,
    extractedItems: normalizedExtractedItems,
    itemStash: syncItemStashState(rawSanctuary.itemStash || {}, normalizedExtractedItems),
    relicArmory: normalizedRelicArmory,
    blueprints: normalizedLegacyBlueprints,
    cargoInventory: Array.isArray(rawSanctuary.cargoInventory) ? [...rawSanctuary.cargoInventory] : [],
    jobs: Array.isArray(rawSanctuary.jobs)
      ? rawSanctuary.jobs.filter(job => job?.type !== "forge_project")
      : [],
    deepForgeSession: null,
    resources: {
      ...createEmptySanctuaryState().resources,
      ...(rawSanctuary.resources || {}),
    },
    familyCharges: normalizeFamilyChargeState({
      ...createEmptySanctuaryState().familyCharges,
      ...(rawSanctuary.familyCharges || {}),
    }),
    activeBlueprints: ensureValidActiveBlueprints(
      normalizedLegacyBlueprints,
      {
        ...createEmptySanctuaryState().activeBlueprints,
        ...(rawSanctuary.activeBlueprints || {}),
      }
    ),
    activeRelics: ensureValidActiveRelics(
      normalizedRelicArmory,
      {
        ...createEmptySanctuaryState().activeRelics,
        ...(rawSanctuary.activeRelics || {}),
      }
    ),
    sigilInfusions: {
      ...createEmptySanctuaryState().sigilInfusions,
      ...(rawSanctuary.sigilInfusions || {}),
    },
    laboratory: createEmptyLaboratoryState(),
    stations: {
      ...createEmptySanctuaryState().stations,
      ...(rawSanctuary.stations || {}),
      distillery: {
        ...createEmptySanctuaryState().stations.distillery,
        ...((rawSanctuary.stations || {}).distillery || {}),
      },
      errands: {
        ...createEmptySanctuaryState().stations.errands,
        ...((rawSanctuary.stations || {}).errands || {}),
      },
      sigilInfusion: {
        ...createEmptySanctuaryState().stations.sigilInfusion,
        ...((rawSanctuary.stations || {}).sigilInfusion || {}),
      },
      codexResearch: {
        ...createEmptySanctuaryState().stations.codexResearch,
        ...((rawSanctuary.stations || {}).codexResearch || {}),
      },
      deepForge: {
        ...createEmptySanctuaryState().stations.deepForge,
        ...((rawSanctuary.stations || {}).deepForge || {}),
      },
    },
    extractionUpgrades: {
      ...createEmptySanctuaryState().extractionUpgrades,
      ...(rawSanctuary.extractionUpgrades || {}),
      relicSlots: Math.max(
        Number(createEmptySanctuaryState().extractionUpgrades?.relicSlots || 1),
        Math.floor(Number(rawSanctuary?.extractionUpgrades?.relicSlots || 0))
      ),
    },
  };
  const normalizedLaboratory = normalizeLaboratoryState(rawSanctuary.laboratory || {}, preLaboratorySanctuary, {
    prestige: normalizedPrestige,
    combat: rawCombat,
    codex: normalizedCodex,
    abyss: normalizedAbyss,
    onboarding: migratedIncoming.onboarding || {},
  });
  const normalizedSanctuary = {
    ...preLaboratorySanctuary,
    laboratory: normalizedLaboratory,
    stations: buildSanctuaryStationsWithLaboratory(
      preLaboratorySanctuary.stations,
      normalizedLaboratory,
      preLaboratorySanctuary,
      {
        prestige: normalizedPrestige,
        combat: rawCombat,
        codex: normalizedCodex,
        abyss: normalizedAbyss,
        onboarding: migratedIncoming.onboarding || {},
      }
    ),
  };
  const normalizedExpedition = {
    ...createEmptyExpeditionState(),
    ...rawExpedition,
    phase: rawExpedition.phase || derivedExpeditionPhase,
    seenFamilyIds: Array.isArray(rawExpedition.seenFamilyIds)
      ? [...new Set(rawExpedition.seenFamilyIds.filter(Boolean))]
      : [],
    cargoFound: Array.isArray(rawExpedition.cargoFound) ? [...rawExpedition.cargoFound] : [],
    projectCandidates: Array.isArray(rawExpedition.projectCandidates) ? [...rawExpedition.projectCandidates] : [],
    selectedCargoIds: Array.isArray(rawExpedition.selectedCargoIds) ? [...rawExpedition.selectedCargoIds] : [],
    selectedProjectItemId: rawExpedition.selectedProjectItemId || null,
    selectedProjectDecision: rawExpedition.selectedProjectDecision === "discard" ? "discard" : "keep",
    extractionPreview: rawExpedition.extractionPreview || null,
    activeInfusionIds: Array.isArray(rawExpedition.activeInfusionIds) ? [...rawExpedition.activeInfusionIds] : [],
    activeInfusionPlayerBonuses: {
      ...createEmptyExpeditionState().activeInfusionPlayerBonuses,
      ...(rawExpedition.activeInfusionPlayerBonuses || {}),
    },
    activeExtractionBonuses: {
      ...createEmptyExpeditionState().activeExtractionBonuses,
      ...(rawExpedition.activeExtractionBonuses || {}),
    },
    activeRelicContext: normalizeRelicContextAttunement(
      rawExpedition.activeRelicContext || createEmptyExpeditionState().activeRelicContext
    ),
    activeRelicContextBonuses: {
      ...createEmptyExpeditionState().activeRelicContextBonuses,
      ...(rawExpedition.activeRelicContextBonuses || {}),
    },
    activeRelicContextMatches: Array.isArray(rawExpedition.activeRelicContextMatches)
      ? rawExpedition.activeRelicContextMatches.map(entry => ({ ...(entry || {}) }))
      : [],
    activeRelicContextMismatches: Array.isArray(rawExpedition.activeRelicContextMismatches)
      ? rawExpedition.activeRelicContextMismatches.map(entry => ({ ...(entry || {}) }))
      : [],
  };

  const shouldSkipFreshOnboarding =
    Boolean(rawPlayer.class) ||
    Boolean(rawPlayer.specialization) ||
    Number(rawPlayer.level || 1) > 1 ||
    Number(rawStats.kills || 0) > 0 ||
    Number(rawStats.itemsFound || 0) > 0 ||
    Number(migratedIncoming.prestige?.level || 0) > 0 ||
    Number(migratedIncoming.prestige?.totalEchoesEarned || 0) > 0;

  const hasHistoricSanctuaryProgress =
    (Array.isArray(normalizedSanctuary.stash) ? normalizedSanctuary.stash.length : 0) > 0 ||
    (Array.isArray(normalizedSanctuary.cargoInventory) ? normalizedSanctuary.cargoInventory.length : 0) > 0 ||
    (Array.isArray(normalizedSanctuary.extractedItems) ? normalizedSanctuary.extractedItems.length : 0) > 0 ||
    (Array.isArray(normalizedSanctuary.relicArmory) ? normalizedSanctuary.relicArmory.length : 0) > 0 ||
    (Array.isArray(normalizedSanctuary.blueprints) ? normalizedSanctuary.blueprints.length : 0) > 0 ||
    (Array.isArray(normalizedSanctuary.jobs) ? normalizedSanctuary.jobs.length : 0) > 0 ||
    Object.keys(normalizedSanctuary.laboratory?.completed || {}).length > 0 ||
    Object.values(normalizedSanctuary.resources || {}).some(value => Number(value || 0) > 0) ||
    Object.values(normalizedSanctuary.stations || {}).some(station => Boolean(station?.unlocked));

  const hasHistoricAccountProgress =
    Boolean(rawPlayer.specialization) ||
    Number(rawPlayer.level || 1) >= 5 ||
    Number(rawStats.kills || 0) >= 25 ||
    Number(rawCombat.maxTier || 1) >= 10 ||
    Number(normalizedPrestige.level || 0) > 0 ||
    Number(normalizedPrestige.totalEchoesEarned || 0) > 0 ||
    Boolean(normalizedAbyss.portalUnlocked) ||
    Boolean(normalizedAbyss.tier25BossCleared);

  const shouldForceCompleteLegacyOnboarding =
    Boolean(migratedIncoming.onboarding) &&
    !Boolean(migratedIncoming.onboarding?.completed) &&
    (hasHistoricSanctuaryProgress || hasHistoricAccountProgress);

  const hasPersistedSaveDiagnostics = typeof migratedIncoming.saveDiagnostics === "object" && migratedIncoming.saveDiagnostics != null;
  const legacySchemaDetected =
    !hasPersistedSaveDiagnostics &&
    (
      shouldForceCompleteLegacyOnboarding ||
      hasHistoricSanctuaryProgress ||
      hasHistoricAccountProgress ||
      Array.isArray(rawSanctuary.stash) ||
      rawCombat.pendingRunSigilId != null ||
      rawCombat.pendingRunSigilIds != null ||
      rawSanctuary.deepForgeSession != null
    );
  const normalizedSaveDiagnostics = sanitizeSaveDiagnostics(
    legacySchemaDetected
      ? {
          ...(migratedIncoming.saveDiagnostics || {}),
          legacyNeedsRepair: true,
        }
      : (migratedIncoming.saveDiagnostics || base.saveDiagnostics)
  );

  const normalizedOnboarding =
    shouldForceCompleteLegacyOnboarding || (!migratedIncoming.onboarding && shouldSkipFreshOnboarding)
      ? buildCompletedOnboardingState({
          player: rawPlayer,
          stats: rawStats,
          combat: rawCombat,
          prestige: normalizedPrestige,
          sanctuary: normalizedSanctuary,
          abyss: normalizedAbyss,
        })
      : migratedIncoming.onboarding
        ? normalizeOnboardingState(migratedIncoming.onboarding)
        : createEmptyOnboardingState();

  const hasPlayerStatCorruption =
    !Number.isFinite(rawBaseDamage) ||
    rawBaseDamage < 1 ||
    rawBaseDamage > SAFE_BASE_DAMAGE_RECOVERY_CAP ||
    !Number.isFinite(rawBaseMaxHp) ||
    rawBaseMaxHp < 1 ||
    rawBaseMaxHp > SAFE_BASE_MAX_HP_RECOVERY_CAP ||
    !Number.isFinite(rawTalentPoints) ||
    rawTalentPoints < 0 ||
    rawTalentPoints > SAFE_TALENT_POINT_RECOVERY_CAP ||
    !Number.isFinite(rawXp) ||
    rawXp < 0 ||
    !Number.isSafeInteger(Math.floor(rawXp));

  const hasRuntimeCorruption = false;
  const shouldResetRuntimeSession = hasPlayerStatCorruption || hasRuntimeCorruption;

  const sanitizedLevel = sanitizeStoredLevel(rawPlayer.level, base.player.level);
  const recoveredReplayLevel = sanitizeStoredLevel(recoverySnapshot?.level, sanitizedLevel);
  const effectiveLevel =
    hasPlayerStatCorruption && recoveredReplayLevel > sanitizedLevel
      ? recoveredReplayLevel
      : sanitizedLevel;

  let sanitizedGold = sanitizeStoredResource(rawPlayer.gold ?? base.player.gold, {
    fallback: base.player.gold,
    recoveryCap: SAFE_GOLD_RECOVERY_CAP,
  });
  let sanitizedEssence = sanitizeStoredResource(rawPlayer.essence ?? base.player.essence, {
    fallback: base.player.essence,
    recoveryCap: SAFE_ESSENCE_RECOVERY_CAP,
  });
  if (hasPlayerStatCorruption && Number(recoverySnapshot?.gold || 0) > 0 && sanitizedGold === 0) {
    sanitizedGold = sanitizeStoredResource(recoverySnapshot.gold, {
      fallback: sanitizedGold,
      recoveryCap: SAFE_GOLD_RECOVERY_CAP,
    });
  }
  if (hasPlayerStatCorruption && Number(recoverySnapshot?.essence || 0) > 0) {
    sanitizedEssence = sanitizeStoredResource(
      Math.max(sanitizedEssence, Number(recoverySnapshot.essence || 0)),
      {
        fallback: sanitizedEssence,
        recoveryCap: SAFE_ESSENCE_RECOVERY_CAP,
      }
    );
  }
  const sanitizedTalentPoints = sanitizeStoredResource(rawPlayer.talentPoints ?? base.player.talentPoints, {
    fallback: Number(recoverySnapshot?.talentPoints || base.player.talentPoints || 0),
    recoveryCap: SAFE_TALENT_POINT_RECOVERY_CAP,
  });
  const sanitizedBaseDamage = sanitizeStoredResource(rawPlayer.baseDamage ?? base.player.baseDamage, {
    fallback: getBaseDamageForLevel(effectiveLevel),
    recoveryCap: SAFE_BASE_DAMAGE_RECOVERY_CAP,
  });
  const sanitizedBaseMaxHp = sanitizeStoredResource(rawPlayer.baseMaxHp ?? base.player.baseMaxHp, {
    fallback: getBaseMaxHpForLevel(effectiveLevel),
    recoveryCap: SAFE_BASE_MAX_HP_RECOVERY_CAP,
  });
  const sanitizedXp = sanitizeStoredResource(rawPlayer.xp ?? base.player.xp, {
    fallback: 0,
    recoveryCap: 50_000_000,
  });
  const bestVisibleItemRating = Math.max(
    0,
    ...normalizedInventory.map(item => item.rating || 0),
    normalizedEquipment.weapon?.rating || 0,
    normalizedEquipment.armor?.rating || 0
  );
  const normalizedPrestigeCycle = createEmptyPrestigeCycleProgress({
    ...((migratedIncoming.combat || {}).prestigeCycle || {}),
    maxTier:
      (migratedIncoming.combat || {}).prestigeCycle?.maxTier ??
      (migratedIncoming.combat || {}).maxTier ??
      (migratedIncoming.combat || {}).currentTier ??
      1,
    maxLevel:
      (migratedIncoming.combat || {}).prestigeCycle?.maxLevel ??
      effectiveLevel ??
      1,
    bestItemRating:
      (migratedIncoming.combat || {}).prestigeCycle?.bestItemRating ??
      bestVisibleItemRating,
  });

  const mergedState = {
    ...base,
    ...migratedIncoming,
    player: {
      ...base.player,
      ...rawPlayer,
      level: effectiveLevel,
      xp: sanitizedXp,
      talentPoints: sanitizedTalentPoints,
      baseDamage: sanitizedBaseDamage,
      baseMaxHp: sanitizedBaseMaxHp,
      unlockedTalents: [...new Set(rawPlayer.unlockedTalents || [])],
      talentLevels: {
        ...(rawPlayer.talentLevels || {}),
      },
      talentSystemVersion:
        Number(rawPlayer.talentSystemVersion || TALENT_SYSTEM_VERSION),
      gold: sanitizedGold,
      essence: sanitizedEssence,
      runSigilBonuses: pendingRunSetup
        ? {}
        : mergeNumericBonuses(
            mergeNumericBonuses(
              getRunSigilPlayerBonuses(activeRunSigilIds),
              normalizedExpedition.activeInfusionPlayerBonuses || {}
            ),
            normalizedExpedition.activeRelicContextBonuses || {}
          ),
      inventory: normalizedInventory,
      equipment: {
        ...base.player.equipment,
        ...normalizedEquipment,
      },
    },
    settings: {
      ...base.settings,
      ...(migratedIncoming.settings || {}),
      theme: (migratedIncoming.settings || {}).theme || base.settings.theme,
      lootRules: sanitizeLootRules(
        (migratedIncoming.settings || {}).lootRules || {},
        DEFAULT_LOOT_RULES
      ),
    },
    appearanceProfile: normalizeAppearanceProfile(migratedIncoming.appearanceProfile || base.appearanceProfile),
    combat: {
      ...base.combat,
      ...rawCombat,
      enemy: normalizeEnemy(rawCombat.enemy, rawCombat.currentTier, normalizedRunContext),
      log: shouldResetRuntimeSession ? [] : [...(rawCombat.log || [])].slice(-20),
      effects: shouldResetRuntimeSession ? [] : [...(rawCombat.effects || [])].slice(-24),
      sessionKills: shouldResetRuntimeSession ? 0 : Number(rawCombat.sessionKills || 0),
      talentBuffs: shouldResetRuntimeSession ? [] : [...(rawCombat.talentBuffs || [])].slice(-20),
      ticksInCurrentRun: shouldResetRuntimeSession ? 0 : Number(rawCombat.ticksInCurrentRun || 0),
      triggerCounters: {
        ...base.combat.triggerCounters,
        ...(shouldResetRuntimeSession ? {} : (rawCombat.triggerCounters || {})),
      },
      pendingOnKillDamage: shouldResetRuntimeSession ? 0 : Number(rawCombat.pendingOnKillDamage || 0),
      pendingMageVolatileMult:
        shouldResetRuntimeSession ? 1 : Math.max(0.2, Number(rawCombat.pendingMageVolatileMult || 1)),
      runStats: {
        ...base.combat.runStats,
        ...(shouldResetRuntimeSession ? {} : (rawCombat.runStats || {})),
      },
      prestigeCycle: normalizedPrestigeCycle,
      performanceSnapshot: {
        ...base.combat.performanceSnapshot,
        ...(shouldResetRuntimeSession ? {} : (rawCombat.performanceSnapshot || {})),
      },
      floatEvents: shouldResetRuntimeSession ? [] : [...(rawCombat.floatEvents || [])].slice(-8),
      analytics: shouldResetRuntimeSession ? createEmptySessionAnalytics() : sanitizeSessionAnalytics(rawCombat.analytics || {}),
      craftingLog: [...(rawCombat.craftingLog || [])].slice(-30),
      reforgeSession: rawCombat.reforgeSession || null,
      lastRunSummary: shouldResetRuntimeSession ? null : (rawCombat.lastRunSummary || null),
      latestLootEvent: shouldResetRuntimeSession ? null : (rawCombat.latestLootEvent || null),
      inventoryOverflowEvent: shouldResetRuntimeSession ? null : (rawCombat.inventoryOverflowEvent || null),
      inventoryOverflowStats: shouldResetRuntimeSession
        ? createEmptyInventoryOverflowStats()
        : {
            ...createEmptyInventoryOverflowStats(),
            ...(rawCombat.inventoryOverflowStats || {}),
          },
      pendingOpenLootFilter: shouldResetRuntimeSession ? false : Boolean(rawCombat.pendingOpenLootFilter),
      runContext: normalizedRunContext,
      pendingRunSetup,
      pendingRunSigilId,
      pendingRunSigilIds,
      activeRunSigilId,
      activeRunSigilIds,
      weeklyBossEncounter:
        shouldResetRuntimeSession || !rawCombat?.weeklyBossEncounter?.active
          ? null
          : {
              ...rawCombat.weeklyBossEncounter,
              snapshot: rawCombat.weeklyBossEncounter?.snapshot || null,
            },
    },
    goals: {
      ...base.goals,
      ...(migratedIncoming.goals || {}),
      claimed: [...new Set((migratedIncoming.goals || {}).claimed || [])],
    },
    stats: {
      ...base.stats,
      ...(migratedIncoming.stats || {}),
      bestItemRating: Math.max(
        migratedIncoming.stats?.bestItemRating || 0,
        bestVisibleItemRating
      ),
    },
    prestige: {
      ...base.prestige,
      ...normalizedPrestige,
      bestHistoricTier: fallbackHistoricBestTier,
    },
    sanctuary: normalizedSanctuary,
    expedition: {
      ...normalizedExpedition,
      seenFamilyIds: appendSeenFamilyIds(
        normalizedExpedition,
        normalizedExpedition.phase === "active" ? normalizeEnemy(rawCombat.enemy, rawCombat.currentTier, normalizedRunContext) : null
      ),
    },
    onboarding: normalizedOnboarding,
    abyss: normalizedAbyss,
    codex: recordCodexSighting(normalizedCodex, normalizeEnemy(rawCombat.enemy, rawCombat.currentTier, normalizedRunContext)),
    replay: normalizedReplay,
    replayLibrary: normalizedReplayLibrary,
    accountTelemetry: sanitizeAccountTelemetry(migratedIncoming.accountTelemetry || base.accountTelemetry),
    saveDiagnostics: normalizedSaveDiagnostics,
    expeditionContracts: {
      ...createEmptyExpeditionContracts(),
      ...(migratedIncoming.expeditionContracts || {}),
    },
    weeklyBoss: {
      ...createEmptyWeeklyBossState(),
      ...(migratedIncoming.weeklyBoss || {}),
    },
  };

  mergedState.expeditionContracts = ensureExpeditionContracts(
    mergedState,
    migratedIncoming.expeditionContracts || base.expeditionContracts,
    Date.now()
  );

  mergedState.weeklyLedger = ensureWeeklyLedger(
    mergedState,
    migratedIncoming.weeklyLedger || base.weeklyLedger,
    Date.now()
  );

  mergedState.weeklyBoss = ensureWeeklyBossState(
    mergedState,
    migratedIncoming.weeklyBoss || base.weeklyBoss,
    Date.now()
  );

  const detectedCorruption =
    hasPlayerStatCorruption ||
    hasRuntimeCorruption ||
    effectiveLevel !== Number(rawPlayer.level ?? effectiveLevel) ||
    sanitizedGold !== Number(rawPlayer.gold ?? sanitizedGold) ||
    sanitizedEssence !== Number(rawPlayer.essence ?? sanitizedEssence) ||
    (normalizedPrestige.echoes || 0) !== Number((migratedIncoming.prestige || {}).echoes ?? (normalizedPrestige.echoes || 0)) ||
    (normalizedPrestige.spentEchoes || 0) !== Number((migratedIncoming.prestige || {}).spentEchoes ?? (normalizedPrestige.spentEchoes || 0)) ||
    (normalizedPrestigeCycle.maxLevel || 1) !== Number((migratedIncoming.combat || {}).prestigeCycle?.maxLevel ?? normalizedPrestigeCycle.maxLevel) ||
    (normalizedPrestigeCycle.maxTier || 1) !== Number((migratedIncoming.combat || {}).prestigeCycle?.maxTier ?? normalizedPrestigeCycle.maxTier);

  const rebuiltPlayer = rebuildPlayerProgressionBonuses(mergedState.player);
  const refreshedPlayer = syncCodexBonuses(syncPrestigeBonuses(rebuiltPlayer, mergedState.prestige), mergedState.codex);
  const normalizedPlayer = {
    ...refreshedPlayer,
    hp: Math.max(
      1,
      Math.min(
        refreshedPlayer.maxHp || 1,
        sanitizeStoredResource(mergedState.player.hp ?? refreshedPlayer.maxHp, {
          fallback: refreshedPlayer.maxHp || 1,
          recoveryCap: refreshedPlayer.maxHp || 1,
        })
      )
    ),
  };

  return {
    ...mergedState,
    savedAt: detectedCorruption ? Date.now() : migratedIncoming.savedAt,
    currentTab: normalizeStoredTab(
      detectedCorruption ? "combat" : migratedIncoming.currentTab,
      {
        phase: normalizedExpedition.phase,
        prestigeUnlocked:
          Number(normalizedPrestige.level || 0) > 0 ||
          Number(normalizedPrestige.totalEchoesEarned || 0) > 0,
      }
    ),
    player: normalizedPlayer,
    combat: {
      ...mergedState.combat,
      offlineSummary: detectedCorruption ? null : mergedState.combat.offlineSummary,
    },
  };
}

export const initialState = saveMode.lab
  ? createLaboratoryDebugState()
  : isValidSave
    ? mergeStateWithDefaults(createFreshState(), saved)
    : createFreshState();
export { DEFAULT_LOOT_RULES };

