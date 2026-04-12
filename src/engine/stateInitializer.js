import { loadGame } from "../utils/storage";
import { ENEMIES } from "../data/enemies";
import { normalizeStoredItem } from "../utils/loot";
import { createEmptySessionAnalytics, sanitizeSessionAnalytics } from "../utils/runTelemetry";
import { createEmptyReplayLibrary, createEmptyReplayLog, normalizeReplayLibrary, normalizeReplayLog } from "../utils/replayLog";
import { calcItemRating } from "./inventory/inventoryEngine";
import { spawnEnemy } from "./combat/enemyEngine";
import { normalizePrestigeState, syncPrestigeBonuses } from "./progression/prestigeEngine";
import { migrateTalentsToV2, TALENT_SYSTEM_VERSION } from "./migrations/talentsV2Migration";

const DEFAULT_LOOT_RULES = {
  autoSellRarities: [],
  autoExtractRarities: [],
  wishlistAffixes: [],
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
    fusesCrafted: 0,
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

  replay: createEmptyReplayLog(),
  replayLibrary: createEmptyReplayLibrary(),
};

export function createFreshState() {
  return JSON.parse(JSON.stringify(freshState));
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

  const normalizedPrestige = normalizePrestigeState(migratedIncoming.prestige || {});

  const normalizedInventory = normalizeItemCollection(migratedIncoming.player?.inventory || []);
  const normalizedEquipment = {
    weapon: normalizeEquipmentItem(migratedIncoming.player?.equipment?.weapon),
    armor: normalizeEquipmentItem(migratedIncoming.player?.equipment?.armor),
  };

  const mergedState = {
    ...base,
    ...migratedIncoming,
    player: {
      ...base.player,
      ...(migratedIncoming.player || {}),
      unlockedTalents: [...new Set((migratedIncoming.player || {}).unlockedTalents || [])],
      talentLevels: {
        ...(migratedIncoming.player || {}).talentLevels,
      },
      talentSystemVersion:
        Number((migratedIncoming.player || {}).talentSystemVersion || TALENT_SYSTEM_VERSION),
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
      ...(migratedIncoming.combat || {}),
      enemy: normalizeEnemy((migratedIncoming.combat || {}).enemy, (migratedIncoming.combat || {}).currentTier),
      triggerCounters: {
        ...base.combat.triggerCounters,
        ...((migratedIncoming.combat || {}).triggerCounters || {}),
      },
      runStats: {
        ...base.combat.runStats,
        ...((migratedIncoming.combat || {}).runStats || {}),
      },
      performanceSnapshot: {
        ...base.combat.performanceSnapshot,
        ...((migratedIncoming.combat || {}).performanceSnapshot || {}),
      },
      floatEvents: [...((migratedIncoming.combat || {}).floatEvents || [])].slice(-8),
      skillDamageTimeline: [...((migratedIncoming.combat || {}).skillDamageTimeline || [])].slice(-240),
      analytics: sanitizeSessionAnalytics((migratedIncoming.combat || {}).analytics || {}),
      craftingLog: [...((migratedIncoming.combat || {}).craftingLog || [])].slice(-30),
      reforgeSession: (migratedIncoming.combat || {}).reforgeSession || null,
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
        ...normalizedInventory.map(item => item.rating || 0),
        normalizedEquipment.weapon?.rating || 0,
        normalizedEquipment.armor?.rating || 0
      ),
    },
    prestige: {
      ...base.prestige,
      ...normalizedPrestige,
    },
    replay: normalizeReplayLog(migratedIncoming.replay || base.replay),
    replayLibrary: normalizeReplayLibrary(migratedIncoming.replayLibrary || base.replayLibrary),
  };

  return {
    ...mergedState,
    player: syncPrestigeBonuses(mergedState.player, mergedState.prestige),
  };
}

export const initialState = isValidSave ? mergeStateWithDefaults(createFreshState(), saved) : createFreshState();
export { DEFAULT_LOOT_RULES };

