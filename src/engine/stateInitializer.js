import { loadGame } from "../utils/storage";
import { ENEMIES } from "../data/enemies";
import { BOSSES } from "../data/bosses";
import { normalizeStoredItem } from "../utils/loot";
import { createEmptySessionAnalytics, sanitizeSessionAnalytics } from "../utils/runTelemetry";
import { createEmptyReplayLibrary, createEmptyReplayLog, normalizeReplayLibrary, normalizeReplayLog } from "../utils/replayLog";
import { calcItemRating } from "./inventory/inventoryEngine";
import { spawnEnemy } from "./combat/enemyEngine";
import { refreshStats } from "./combat/statEngine";
import { normalizeActiveEvents } from "./eventEngine";
import { createEmptyCodexState, normalizeCodexState, recordCodexSighting, syncCodexBonuses } from "./progression/codexEngine";
import { createEmptyPrestigeCycleProgress, normalizePrestigeState, syncPrestigeBonuses } from "./progression/prestigeEngine";
import { getRunSigil, getRunSigilPlayerBonuses } from "../data/runSigils";
import { migrateTalentsToV2, TALENT_SYSTEM_VERSION } from "./migrations/talentsV2Migration";

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
const VALID_TABS = new Set(["character", "combat", "inventory", "skills", "talents", "crafting", "prestige", "achievements", "stats", "codex"]);

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
};

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
    damageLevel: 1,
    skills: { dmg: 0, hp: 0, crit: 0 },
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
    flatCrit: 0,
    flatGold: 0,
    goldPct: 0,
    xpPct: 0,
    attackSpeed: 0,
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

  currentTab: "character",

  combat: {
    enemy: { ...ENEMIES[0], hp: ENEMIES[0].maxHp },
    log: [],
    currentTier: 1,
    maxTier: 1,
    autoAdvance: false,
    ticksInCurrentRun: 0,
    lastRunTier: 0,
    activeEvents: [],
    effects: [],
    skillCooldowns: {},
    sessionKills: 0,
    talentBuffs: [],
    triggerCounters: {
      kills: 0,
      onHit: 0,
      crit: 0,
      onDamageTaken: 0,
    },
    pendingOnKillDamage: 0,
    floatEvents: [],
    skillDamageTimeline: [],
    skillAutocasts: {},
    runStats: {
      kills: 0,
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
    reforgeSession: null,
    pendingRunSetup: false,
    pendingRunSigilId: "free",
    activeRunSigilId: "free",
    craftingLog: [],
    analytics: createEmptySessionAnalytics(),
  },

  stats: {
    kills: 0,
    itemsFound: 0,
    itemsSold: 0,
    itemsExtracted: 0,
    autoSoldItems: 0,
    autoExtractedItems: 0,
    bossKills: 0,
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
    nodes: {},
  },
  codex: createEmptyCodexState(),

  replay: createEmptyReplayLog(),
  replayLibrary: createEmptyReplayLibrary(),
};

export function createFreshState() {
  const next = JSON.parse(JSON.stringify(freshState));
  next.codex = recordCodexSighting(next.codex, next.combat.enemy);
  return next;
}

const saved = loadGame();
const isValidSave =
  saved?.combat?.enemy?.xpReward != null &&
  saved?.player?.baseDamage != null &&
  saved?.player?.essence != null &&
  saved?.stats != null &&
  saved?.prestige != null &&
  saved?.combat?.skillCooldowns != null &&
  saved?.combat?.sessionKills != null &&
  saved?.combat?.skillAutocasts != null &&
  saved?.combat?.activeEvents != null;

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

function normalizeEnemy(enemy, currentTier) {
  const tier = enemy?.tier || currentTier || 1;
  const freshEnemy = spawnEnemy(tier);
  if (!enemy) return freshEnemy;

  const hpRatio = enemy.maxHp > 0 ? Math.max(0, Math.min(1, enemy.hp / enemy.maxHp)) : 1;
  return {
    ...freshEnemy,
    hp: Math.max(1, Math.floor(freshEnemy.maxHp * hpRatio)),
  };
}

function mergeStateWithDefaults(base, incoming) {
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
  const rawLevel = Number(rawPlayer.level ?? base.player.level);
  const rawBaseDamage = Number(rawPlayer.baseDamage ?? base.player.baseDamage);
  const rawBaseMaxHp = Number(rawPlayer.baseMaxHp ?? base.player.baseMaxHp);
  const rawTalentPoints = Number(rawPlayer.talentPoints ?? base.player.talentPoints);
  const rawXp = Number(rawPlayer.xp ?? base.player.xp);
  const rawActiveEvents = rawCombat.activeEvents || [];
  const normalizedActiveEvents = normalizeActiveEvents(rawActiveEvents);
  const pendingRunSetup = Boolean(rawCombat.pendingRunSetup) && Number(normalizedPrestige.level || 0) >= 1;
  const pendingRunSigilId = getRunSigil(rawCombat.pendingRunSigilId || "free").id;
  const activeRunSigilId = pendingRunSetup ? "free" : getRunSigil(rawCombat.activeRunSigilId || "free").id;

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

  const hasRuntimeCorruption = rawActiveEvents.length !== normalizedActiveEvents.length;
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
      runSigilBonuses: pendingRunSetup ? {} : getRunSigilPlayerBonuses(activeRunSigilId),
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
      lootRules: {
        ...DEFAULT_LOOT_RULES,
        ...((migratedIncoming.settings || {}).lootRules || {}),
      },
    },
    combat: {
      ...base.combat,
      ...rawCombat,
      enemy: normalizeEnemy(rawCombat.enemy, rawCombat.currentTier),
      log: shouldResetRuntimeSession ? [] : [...(rawCombat.log || [])].slice(-20),
      activeEvents: shouldResetRuntimeSession ? [] : normalizedActiveEvents,
      effects: shouldResetRuntimeSession ? [] : [...(rawCombat.effects || [])].slice(-24),
      skillCooldowns: shouldResetRuntimeSession ? {} : (rawCombat.skillCooldowns || {}),
      sessionKills: shouldResetRuntimeSession ? 0 : Number(rawCombat.sessionKills || 0),
      talentBuffs: shouldResetRuntimeSession ? [] : [...(rawCombat.talentBuffs || [])].slice(-20),
      ticksInCurrentRun: shouldResetRuntimeSession ? 0 : Number(rawCombat.ticksInCurrentRun || 0),
      triggerCounters: {
        ...base.combat.triggerCounters,
        ...(shouldResetRuntimeSession ? {} : (rawCombat.triggerCounters || {})),
      },
      pendingOnKillDamage: shouldResetRuntimeSession ? 0 : Number(rawCombat.pendingOnKillDamage || 0),
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
      skillDamageTimeline: shouldResetRuntimeSession ? [] : [...(rawCombat.skillDamageTimeline || [])].slice(-240),
      analytics: shouldResetRuntimeSession ? createEmptySessionAnalytics() : sanitizeSessionAnalytics(rawCombat.analytics || {}),
      craftingLog: [...(rawCombat.craftingLog || [])].slice(-30),
      reforgeSession: rawCombat.reforgeSession || null,
      lastRunSummary: shouldResetRuntimeSession ? null : (rawCombat.lastRunSummary || null),
      latestLootEvent: shouldResetRuntimeSession ? null : (rawCombat.latestLootEvent || null),
      pendingRunSetup,
      pendingRunSigilId,
      activeRunSigilId,
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
    },
    codex: recordCodexSighting(normalizedCodex, normalizeEnemy(rawCombat.enemy, rawCombat.currentTier)),
    replay: normalizedReplay,
    replayLibrary: normalizedReplayLibrary,
  };

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

  const refreshedPlayer = syncCodexBonuses(syncPrestigeBonuses(mergedState.player, mergedState.prestige), mergedState.codex);
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
    currentTab:
      detectedCorruption
        ? "combat"
        : VALID_TABS.has(migratedIncoming.currentTab)
          ? migratedIncoming.currentTab
          : base.currentTab,
    player: normalizedPlayer,
    combat: {
      ...mergedState.combat,
      offlineSummary: detectedCorruption ? null : mergedState.combat.offlineSummary,
    },
  };
}

export const initialState = isValidSave ? mergeStateWithDefaults(createFreshState(), saved) : createFreshState();
export { DEFAULT_LOOT_RULES };

