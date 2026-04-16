import {
  BOSSES,
  BOSS_SLOT_BASELINES,
  FIRST_RUN_BOSS_LAYOUT,
  RANDOM_BOSS_SLOT_POOLS,
} from "../../data/bosses";
import { ABYSS_MUTATORS } from "../../data/abyssMutators";
import { ABYSS_BOSS_AFFIX_POOLS, ABYSS_BOSS_MECHANIC_POOLS } from "../../data/encounters";
import { ENEMIES, getEnemyAffixesForTier, getEnemyBaselineStatsForTier } from "../../data/enemies";

export const BASE_TIER_COUNT = 25;
export const BOSS_SLOT_INTERVAL = 5;
export const BOSS_SLOT_COUNT = BASE_TIER_COUNT / BOSS_SLOT_INTERVAL;
export const COMMON_TIER_LIST = Array.from({ length: BASE_TIER_COUNT }, (_, index) => index + 1)
  .filter(tier => tier % BOSS_SLOT_INTERVAL !== 0);

const MAX_SEED = 0x7fffffff;
const BOSS_BY_ID = new Map(BOSSES.map(boss => [boss.id, boss]));
const ENEMY_BY_ID = new Map(ENEMIES.map(enemy => [enemy.id, enemy]));
const ENEMY_BY_TIER = new Map(ENEMIES.map(enemy => [enemy.tier, enemy]));
const FIRST_RUN_SEED = 104729;
const RARITY_RANK = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };

function sanitizeTier(tier = 1) {
  const numeric = Math.max(1, Math.floor(Number(tier || 1)));
  return Number.isFinite(numeric) ? numeric : 1;
}

function sanitizeSeed(seed = 1) {
  const numeric = Math.floor(Math.abs(Number(seed || 0)));
  if (!Number.isFinite(numeric) || numeric <= 0) return 1;
  return Math.max(1, numeric % MAX_SEED);
}

function hashString(value = "") {
  let hash = 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(31, hash) + text.charCodeAt(index);
    hash |= 0;
  }
  return sanitizeSeed(Math.abs(hash));
}

function mulberry32(seed) {
  let value = sanitizeSeed(seed);
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getOrderedBosses() {
  return [...BOSSES].sort((left, right) => (left.tier || 0) - (right.tier || 0));
}

function shuffleList(list = [], rng) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function getBandIndexForCycleTier(tierInCycle = 1) {
  return Math.max(0, Math.min(BOSS_SLOT_COUNT - 1, Math.floor((Number(tierInCycle || 1) - 1) / BOSS_SLOT_INTERVAL)));
}

function getCommonTiersForBand(bandIndex = 0) {
  const startTier = bandIndex * BOSS_SLOT_INTERVAL + 1;
  return Array.from({ length: BOSS_SLOT_INTERVAL - 1 }, (_, index) => startTier + index);
}

export function getDefaultBossSlotLayout() {
  return { ...FIRST_RUN_BOSS_LAYOUT };
}

export function getDefaultCommonTierLayout() {
  return Object.fromEntries(
    COMMON_TIER_LIST.map(tier => [tier, ENEMY_BY_TIER.get(tier)?.id || null])
  );
}

export function createRunSeed() {
  const randomPart = Math.floor(Math.random() * MAX_SEED);
  return sanitizeSeed(Date.now() ^ randomPart);
}

export function getCycleIndexForTier(tier = 1) {
  return Math.floor((sanitizeTier(tier) - 1) / BASE_TIER_COUNT);
}

export function getTierInCycle(tier = 1) {
  return ((sanitizeTier(tier) - 1) % BASE_TIER_COUNT) + 1;
}

export function getBossSlotForTier(tier = 1) {
  const tierInCycle = getTierInCycle(tier);
  if (tierInCycle % BOSS_SLOT_INTERVAL !== 0) return null;
  return Math.max(1, Math.floor(tierInCycle / BOSS_SLOT_INTERVAL));
}

function getScaledCommonTierBaseline(sourceTier = 1, cycleTier = 1) {
  const absoluteBaseline = getEnemyBaselineStatsForTier(sourceTier);
  return {
    ...absoluteBaseline,
    possibleAffixes: [...getEnemyAffixesForTier(cycleTier)],
  };
}

function getBossSlotBaseline(slot = 1) {
  return BOSS_SLOT_BASELINES[Math.max(1, Math.min(BOSS_SLOT_COUNT, Number(slot || 1)))] || BOSS_SLOT_BASELINES[1];
}

function buildBossRuntimeFromSlot(boss = {}, slot = 1) {
  const baseline = getBossSlotBaseline(slot);
  const profile = boss.slotProfile || {};
  const hpMult = profile.hpMult || 1;
  const damageMult = profile.damageMult || 1;
  const defenseMult = profile.defenseMult || 1;
  const xpMult = profile.xpMult || 1;
  const goldMult = profile.goldMult || 1;
  const essenceFlat = Number(profile.essenceFlat || 0);

  const maxHp = Math.max(1, Math.floor(baseline.hp * hpMult));
  return {
    hp: maxHp,
    maxHp,
    damage: Math.max(1, Math.floor(baseline.damage * damageMult)),
    defense: Math.max(0, Math.floor(baseline.defense * defenseMult)),
    xpReward: Math.max(1, Math.floor(baseline.xpReward * xpMult)),
    goldReward: Math.max(1, Math.floor(baseline.goldReward * goldMult)),
    essenceReward: Math.max(1, Math.floor(baseline.essenceReward + essenceFlat)),
    guaranteedRarityFloor: baseline.guaranteedRarityFloor,
    dropRarityBonus: { ...(baseline.dropRarityBonus || {}) },
  };
}

function mergeRarityBonus(...entries) {
  const merged = {};
  for (const entry of entries) {
    for (const [key, value] of Object.entries(entry || {})) {
      merged[key] = (merged[key] || 0) + Number(value || 0);
    }
  }
  return merged;
}

function mergeRuntimeConfig(...entries) {
  const merged = {};
  const multiplicativeKeys = new Set(["hpMult", "damageMult", "defenseMult"]);

  for (const entry of entries) {
    for (const [key, value] of Object.entries(entry || {})) {
      if (typeof value !== "number") {
        merged[key] = value;
        continue;
      }
      if (multiplicativeKeys.has(key)) {
        merged[key] = (merged[key] || 1) * value;
      } else {
        merged[key] = (merged[key] || 0) + value;
      }
    }
  }

  return merged;
}

function pickSeededUniqueIds(pool = [], count = 0, seed = 1, excludedIds = []) {
  if (count <= 0) return [];
  const excluded = new Set(excludedIds || []);
  const uniquePool = [...new Set(pool || [])].filter(id => !excluded.has(id));
  if (!uniquePool.length) return [];
  return shuffleList(uniquePool, mulberry32(seed)).slice(0, count);
}

function getAbyssBossUpgradeProfile(cycleIndex = 0) {
  if (cycleIndex <= 0) {
    return { affixCount: 0, mechanicCount: 0, mechanicIntensity: 1 };
  }
  if (cycleIndex === 1) {
    return { affixCount: 1, mechanicCount: 1, mechanicIntensity: 1 };
  }
  if (cycleIndex === 2) {
    return { affixCount: 2, mechanicCount: 2, mechanicIntensity: 1 };
  }
  if (cycleIndex === 3) {
    return { affixCount: 2, mechanicCount: 2, mechanicIntensity: 1.18 };
  }
  return {
    affixCount: 2,
    mechanicCount: 3,
    mechanicIntensity: 1.32 + Math.max(0, cycleIndex - 4) * 0.08,
  };
}

function getBossAbyssAffixPool(boss = {}) {
  return (
    ABYSS_BOSS_AFFIX_POOLS[boss?.seedArchetype] ||
    ABYSS_BOSS_AFFIX_POOLS.final ||
    []
  );
}

function getBossAbyssMechanicPool(boss = {}) {
  return (
    ABYSS_BOSS_MECHANIC_POOLS[boss?.seedArchetype] ||
    ABYSS_BOSS_MECHANIC_POOLS.final ||
    []
  );
}

function getBossAbyssUpgradeModifiers({
  boss = {},
  cycleIndex = 0,
  slot = 1,
  sourceTier = 1,
  runContext = null,
  existingAffixIds = [],
  existingMechanicIds = [],
} = {}) {
  const profile = getAbyssBossUpgradeProfile(cycleIndex);
  if (profile.affixCount <= 0 && profile.mechanicCount <= 0 && profile.mechanicIntensity <= 1) {
    return null;
  }

  const normalizedContext = runContext ? normalizeRunContext(runContext) : null;
  const baseSeed = normalizedContext?.seed || FIRST_RUN_SEED;
  const slotSeed = sanitizeSeed(
    baseSeed ^
      Math.imul(cycleIndex + 1, 0x6c8e9cf5) ^
      Math.imul(slot + 1, 0x51ed270b) ^
      hashString(boss?.id || sourceTier)
  );
  const affixIds = pickSeededUniqueIds(
    getBossAbyssAffixPool(boss),
    profile.affixCount,
    sanitizeSeed(slotSeed ^ 0x1f123bb5),
    existingAffixIds
  );
  const mechanicIds = pickSeededUniqueIds(
    getBossAbyssMechanicPool(boss),
    profile.mechanicCount,
    sanitizeSeed(slotSeed ^ 0x7f4a7c15),
    [...(boss?.mechanics || []), ...(existingMechanicIds || [])]
  );

  return {
    depthAffixIds: affixIds,
    depthMechanicIds: mechanicIds,
    mechanicIntensity: profile.mechanicIntensity,
    abyssBossProfile: profile,
  };
}

function getStrongerRarityFloor(left = null, right = null) {
  if (!left) return right || null;
  if (!right) return left || null;
  return (RARITY_RANK[right] || 0) > (RARITY_RANK[left] || 0) ? right : left;
}

function applyEncounterModifiers(base = {}, modifiers = {}) {
  const stats = modifiers.stats || {};
  const hpMult = Number(stats.hpMult || 1);
  const damageMult = Number(stats.damageMult || 1);
  const defenseMult = Number(stats.defenseMult || 1);
  const xpMult = Number(stats.xpMult || 1);
  const goldMult = Number(stats.goldMult || 1);
  const essenceMult = Number(stats.essenceMult || 1);

  const maxHp = Math.max(1, Math.floor((base.maxHp || base.hp || 1) * hpMult));

  return {
    ...base,
    hp: maxHp,
    maxHp,
    damage: Math.max(1, Math.floor((base.damage || 1) * damageMult)),
    defense: Math.max(0, Math.floor((base.defense || 0) * defenseMult)),
    xpReward: Math.max(1, Math.floor((base.xpReward || 1) * xpMult)),
    goldReward: Math.max(1, Math.floor((base.goldReward || 1) * goldMult)),
    essenceReward: Math.max(1, Math.floor((base.essenceReward || 1) * essenceMult)),
    guaranteedRarityFloor: getStrongerRarityFloor(base.guaranteedRarityFloor || null, modifiers.guaranteedRarityFloor || null),
    dropRarityBonus: mergeRarityBonus(base.dropRarityBonus || {}, modifiers.rarityBonus || {}),
    abyssRuntime: mergeRuntimeConfig(base.abyssRuntime || {}, modifiers.runtime || {}),
    mutatorAffixIds: [...new Set([...(base.mutatorAffixIds || []), ...(modifiers.affixIds || [])])],
    mutatorMechanicIds: [...new Set([...(base.mutatorMechanicIds || []), ...(modifiers.mechanicIds || [])])],
    depthAffixIds: [...new Set([...(base.depthAffixIds || []), ...(modifiers.depthAffixIds || [])])],
    depthMechanicIds: [...new Set([...(base.depthMechanicIds || []), ...(modifiers.depthMechanicIds || [])])],
    mechanicIntensity: Math.max(1, Number(base.mechanicIntensity || 1), Number(modifiers.mechanicIntensity || 1)),
    abyssBossProfile: modifiers.abyssBossProfile || base.abyssBossProfile || null,
  };
}

function applyEncounterScalingOnly(base = {}, modifiers = {}) {
  if (!modifiers?.stats) return base;
  return applyEncounterModifiers(base, { stats: modifiers.stats });
}

function getBossDepthScale(sourceTier = 1, cycleTier = 1) {
  const normalizedSourceTier = sanitizeTier(sourceTier);
  const normalizedCycleTier = sanitizeTier(cycleTier);
  if (normalizedSourceTier <= BASE_TIER_COUNT) return null;

  const absoluteBaseline = getEnemyBaselineStatsForTier(normalizedSourceTier);
  const cycleBaseline = getEnemyBaselineStatsForTier(normalizedCycleTier);
  const safeRatio = (numerator = 1, denominator = 1) => Math.max(1, Number(numerator || 1) / Math.max(1, Number(denominator || 1)));

  return {
    stats: {
      hpMult: safeRatio(absoluteBaseline.maxHp, cycleBaseline.maxHp),
      damageMult: safeRatio(absoluteBaseline.damage, cycleBaseline.damage),
      defenseMult: safeRatio(absoluteBaseline.defense, cycleBaseline.defense),
      xpMult: safeRatio(absoluteBaseline.xpReward, cycleBaseline.xpReward),
      goldMult: safeRatio(absoluteBaseline.goldReward, cycleBaseline.goldReward),
      essenceMult: safeRatio(absoluteBaseline.essenceReward, cycleBaseline.essenceReward),
    },
  };
}

export function getAbyssMutatorForCycle(cycleIndex = 0, runContext = null) {
  if (cycleIndex <= 0) return null;
  const normalizedContext = runContext ? normalizeRunContext(runContext) : null;
  const seed = normalizedContext?.seed || FIRST_RUN_SEED;
  const rng = mulberry32(sanitizeSeed(seed ^ Math.imul(cycleIndex, 0x45d9f3b)));
  const pool = ABYSS_MUTATORS;
  if (!pool.length) return null;
  const selected = pool[Math.floor(rng() * pool.length)] || pool[0];
  return selected ? { ...selected, cycleIndex } : null;
}

function pickBossFromPool({ pool = [], usedBossIds = new Set(), rng, fallbackId = null }) {
  const available = pool.filter(bossId => BOSS_BY_ID.has(bossId) && !usedBossIds.has(bossId));
  const source = available.length > 0 ? available : pool.filter(bossId => BOSS_BY_ID.has(bossId));
  if (!source.length) return fallbackId;
  return source[Math.floor(rng() * source.length)] || fallbackId;
}

function buildCommonRuntimeFromTier(sourceTier = 1, cycleTier = 1) {
  const baseline = getScaledCommonTierBaseline(sourceTier, cycleTier);
  return {
    hp: baseline.hp,
    maxHp: baseline.maxHp,
    damage: baseline.damage,
    defense: baseline.defense,
    xpReward: baseline.xpReward,
    goldReward: baseline.goldReward,
    essenceReward: baseline.essenceReward,
    possibleAffixes: [...(baseline.possibleAffixes || [])],
  };
}

export function buildBossSlotLayout(seed = 1, { firstRun = false } = {}) {
  if (firstRun) {
    return { ...FIRST_RUN_BOSS_LAYOUT };
  }

  const rng = mulberry32(seed);
  const defaultLayout = getDefaultBossSlotLayout();
  const layout = {};
  const usedBossIds = new Set();

  for (let slot = 1; slot <= BOSS_SLOT_COUNT; slot += 1) {
    const bossId = pickBossFromPool({
      pool: RANDOM_BOSS_SLOT_POOLS[slot] || [],
      usedBossIds,
      rng,
      fallbackId: defaultLayout[slot] || null,
    });
    layout[slot] = bossId;
    if (bossId) usedBossIds.add(bossId);
  }

  return layout;
}

export function buildCommonTierLayout(seed = 1, { firstRun = false } = {}) {
  if (firstRun) {
    return getDefaultCommonTierLayout();
  }

  const rng = mulberry32(sanitizeSeed(seed + 0x51f15e));
  const defaultLayout = getDefaultCommonTierLayout();
  const layout = {};

  for (let bandIndex = 0; bandIndex < BOSS_SLOT_COUNT; bandIndex += 1) {
    const tiers = getCommonTiersForBand(bandIndex);
    const candidateIds = shuffleList(
      ENEMIES
        .filter(enemy => getBandIndexForCycleTier(enemy.tier) === bandIndex)
        .map(enemy => enemy.id)
        .filter(enemyId => ENEMY_BY_ID.has(enemyId)),
      rng
    );

    tiers.forEach((tier, index) => {
      layout[tier] = candidateIds[index] || defaultLayout[tier] || null;
    });
  }

  return layout;
}

export function normalizeRunContext(rawContext = {}) {
  const isFirstRun = Boolean(rawContext.isFirstRun);
  const seed = sanitizeSeed(rawContext.seed || (isFirstRun ? FIRST_RUN_SEED : createRunSeed()));
  const defaultLayout = isFirstRun
    ? getDefaultBossSlotLayout()
    : buildBossSlotLayout(seed, { firstRun: false });
  const defaultCommonLayout = isFirstRun
    ? getDefaultCommonTierLayout()
    : buildCommonTierLayout(seed, { firstRun: false });
  const rawSlots = rawContext.bossSlots || {};
  const rawCommonSlots = rawContext.commonSlots || {};
  const bossSlots = {};
  const commonSlots = {};

  for (let slot = 1; slot <= BOSS_SLOT_COUNT; slot += 1) {
    const bossId = rawSlots[slot] || rawSlots[String(slot)] || defaultLayout[slot] || null;
    bossSlots[slot] = BOSS_BY_ID.has(bossId) ? bossId : defaultLayout[slot] || null;
  }

  for (const tier of COMMON_TIER_LIST) {
    const enemyId = rawCommonSlots[tier] || rawCommonSlots[String(tier)] || defaultCommonLayout[tier] || null;
    commonSlots[tier] = ENEMY_BY_ID.has(enemyId) ? enemyId : defaultCommonLayout[tier] || null;
  }

  return {
    seed,
    isFirstRun,
    baseTierCount: BASE_TIER_COUNT,
    bossSlotInterval: BOSS_SLOT_INTERVAL,
    bossSlots,
    commonSlots,
  };
}

export function createRunContext(seedOrOptions = createRunSeed()) {
  const options =
    typeof seedOrOptions === "object" && seedOrOptions !== null
      ? seedOrOptions
      : { seed: seedOrOptions };
  const isFirstRun = Boolean(options.firstRun);
  const normalizedSeed = sanitizeSeed(options.seed || (isFirstRun ? FIRST_RUN_SEED : createRunSeed()));
  return normalizeRunContext({
    isFirstRun,
    seed: normalizedSeed,
    bossSlots: options.bossSlots || buildBossSlotLayout(normalizedSeed, { firstRun: isFirstRun }),
    commonSlots: options.commonSlots || buildCommonTierLayout(normalizedSeed, { firstRun: isFirstRun }),
  });
}

export function getBossIdForTier(tier = 1, runContext = null) {
  const slot = getBossSlotForTier(tier);
  if (!slot) return null;
  const normalizedContext = runContext ? normalizeRunContext(runContext) : null;
  return normalizedContext?.bossSlots?.[slot] || getDefaultBossSlotLayout()[slot] || null;
}

export function getCommonEnemyIdForTier(tier = 1, runContext = null) {
  const cycleTier = getTierInCycle(tier);
  if (getBossSlotForTier(tier)) return null;
  const normalizedContext = runContext ? normalizeRunContext(runContext) : null;
  return normalizedContext?.commonSlots?.[cycleTier] || getDefaultCommonTierLayout()[cycleTier] || null;
}

export function resolveEncounterForTier(tier = 1, runContext = null) {
  const sourceTier = sanitizeTier(tier);
  const cycleIndex = getCycleIndexForTier(sourceTier);
  const cycleTier = getTierInCycle(sourceTier);
  const bossSlot = getBossSlotForTier(sourceTier);
  const bossId = getBossIdForTier(sourceTier, runContext);
  const abyssMutator = getAbyssMutatorForCycle(cycleIndex, runContext);

  if (bossId) {
    const boss = BOSS_BY_ID.get(bossId) || getOrderedBosses()[Math.max(0, (bossSlot || 1) - 1)] || BOSSES[0];
    const abyssBossModifiers = getBossAbyssUpgradeModifiers({
      boss,
      cycleIndex,
      slot: bossSlot || 1,
      sourceTier,
      runContext,
      existingAffixIds: abyssMutator?.bossModifiers?.affixIds || [],
      existingMechanicIds: abyssMutator?.bossModifiers?.mechanicIds || [],
    });
    let runtimeStats = buildBossRuntimeFromSlot(boss, bossSlot || 1);
    runtimeStats = applyEncounterModifiers(runtimeStats, getBossDepthScale(sourceTier, cycleTier) || {});
    runtimeStats = applyEncounterModifiers(runtimeStats, abyssMutator?.commonModifiers || {});
    runtimeStats = applyEncounterModifiers(runtimeStats, abyssMutator?.bossModifiers || {});
    runtimeStats = applyEncounterModifiers(runtimeStats, abyssBossModifiers || {});
    return {
      ...boss,
      ...runtimeStats,
      tier: sourceTier,
      sourceTier,
      cycleTier,
      cycleIndex,
      abyssDepth: cycleIndex,
      bossSlot,
      abyssMutator,
    };
  }

  const enemyId = getCommonEnemyIdForTier(sourceTier, runContext);
  const enemy = ENEMY_BY_ID.get(enemyId) || ENEMY_BY_TIER.get(cycleTier) || ENEMIES[ENEMIES.length - 1];
  let runtimeStats = buildCommonRuntimeFromTier(sourceTier, cycleTier);
  runtimeStats = applyEncounterScalingOnly(runtimeStats, abyssMutator?.commonModifiers || {});
  return {
    ...enemy,
    ...runtimeStats,
    tier: sourceTier,
    sourceTier,
    cycleTier,
    cycleIndex,
    abyssDepth: cycleIndex,
    bossSlot: null,
    abyssMutator,
  };
}
