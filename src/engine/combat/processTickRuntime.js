import { spawnEnemy } from "./enemyEngine";
import { createRunContext } from "./encounterRouting";
import { calcStats } from "./statEngine";
import { calculateRewards } from "../progression/rewards";
import { checkAchievements } from "../progression/achievementEngine";
import { processTriggerTalents } from "../talents/talentEngine";
import { applyLevelUp } from "../leveling";
import { addToInventory, calcItemRating } from "../inventory/inventoryEngine";
import { getPlayerBuildTag } from "../../utils/buildIdentity";
import {
  getLegendaryPostAttackEffects,
  getLegendaryStaticBonuses,
} from "../../utils/legendaryPowers";
import { resolveLootRuleWishlist } from "../../utils/lootFilter";
import { summarizeLootEvent } from "../../utils/lootHighlights";
import { createEmptySessionAnalytics } from "../../utils/runTelemetry";
import { recordCodexKill, recordCodexSighting, recordLegendaryPowerDiscovery, syncCodexBonuses } from "../progression/codexEngine";
import { createEmptyPrestigeCycleProgress } from "../progression/prestigeEngine";
import { getRunSigilCodexModifiers } from "../../data/runSigils";
import { buildExtractionPreview } from "../sanctuary/extractionEngine";
import {
  tickEffects,
  applyEffects,
  computeEffectModifiers,
} from "../effects/effectEngine";
import { applyModifierTotals } from "../modifiers/modifierEngine";
import { MOD_TYPES } from "../modifiers/modTypes";

const CRIT_CAP = 0.75;
const RARITY_RANK = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const EXTRACT_RARITY_TIER = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const PERFORMANCE_SMOOTHING = 0.18;
const FLOAT_EVENT_LIMIT = 8;
const HEAL_FLOAT_THRESHOLD = 3;
const SAFE_RUNTIME_GOLD_CAP = 50_000_000;
const SAFE_RUNTIME_ESSENCE_CAP = 10_000_000;
const MULTI_HIT_CAP = 0.45;
const BLEED_STACK_CAP = 4;
const BLEED_DURATION_TICKS = 4;
const FRACTURE_STACK_CAP = 5;
const FRACTURE_DURATION_TICKS = 5;
const VOID_FRACTURE_STACK_CAP = 3;
const VOID_FRACTURE_DURATION_TICKS = 4;
const FRACTURE_DEFENSE_REDUCTION_PER_STACK = 0.1;
const ENEMY_DEFENSE_SCALING = 260;
const EXPEDITION_DEATH_LIMIT = 3;
const EXPEDITION_DEATH_REVIVE_HP_PCT = 0.5;
const EXPEDITION_DEATH_TIER_RETREAT = 5;
let floatEventSequence = 0;

function appendSeenFamilyIds(expedition = {}, enemy = null) {
  const familyId = enemy?.familyTraitId || enemy?.family || null;
  const current = Array.isArray(expedition?.seenFamilyIds) ? expedition.seenFamilyIds : [];
  if (!familyId || current.includes(familyId)) return current;
  return [...current, familyId];
}

function toModifierTotals(mods = {}) {
  return {
    damageMult: mods.damageMult || 1,
    damageFlat: mods.damageFlat || 0,
    defenseMult: mods.defenseMult || 1,
    defenseFlat: mods.defenseFlat || 0,
    attackSpeedFlat: mods.attackSpeedFlat || 0,
    critChance: mods.critBonus || 0,
    regenFlat: mods.regen || 0,
    healFlat: mods.healFlat || 0,
    healPercentMaxHp: mods.healPercentMaxHp || 0,
    enemyDamageTakenMult: mods.enemyDamageTakenMult || 1,
    goldFlat: mods.goldFlat || 0,
    lifestealFlat: mods.lifestealFlat || 0,
    lifestealPercentDamage: mods.lifestealPercentDamage || 0,
  };
}

function splitImmediateEffects(effects = []) {
  return {
    immediate: effects.filter(effect => effect.isImmediate),
    persistent: effects.filter(effect => !effect.isImmediate),
  };
}

function buildLastRunSummary(state, enemy, outcome) {
  const runStats = state.combat.runStats || {};

  return {
    outcome,
    enemyName: enemy?.name || "Unknown",
    kills: runStats.kills || 0,
    damageDealt: runStats.damageDealt || 0,
    maxTier: state.combat.maxTier || state.combat.currentTier || 1,
    durationTicks: state.combat.ticksInCurrentRun || 0,
    gold: runStats.gold || 0,
    xp: runStats.xp || 0,
    essence: runStats.essence || 0,
    items: runStats.items || 0,
    bestDropName: runStats.bestDropName || null,
    bestDropRarity: runStats.bestDropRarity || null,
    bestDropHighlight: runStats.bestDropHighlight || null,
    bestDropPerfectRolls: runStats.bestDropPerfectRolls || 0,
    bestDropScore: runStats.bestDropScore || 0,
  };
}

function updatePerformanceSnapshot(previous = {}, tickSample = {}) {
  const next = {};
  const keys = ["damagePerTick", "goldPerTick", "xpPerTick", "killsPerMinute"];

  for (const key of keys) {
    const currentValue = tickSample[key] || 0;
    const previousValue = previous[key] || 0;
    next[key] =
      previousValue === 0
        ? currentValue
        : previousValue + (currentValue - previousValue) * PERFORMANCE_SMOOTHING;
  }

  return next;
}

function buildTriggerCounters(
  previous = {},
  { didCrit = false, tookDamage = false, enemyKilled = false, hitCount = 1 } = {}
) {
  return {
    kills: (previous.kills || 0) + (enemyKilled ? 1 : 0),
    onHit: (previous.onHit || 0) + hitCount,
    crit: (previous.crit || 0) + (didCrit ? 1 : 0),
    onDamageTaken: (previous.onDamageTaken || 0) + (tookDamage ? 1 : 0),
  };
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

function sanitizeCurrencyValue(value, recoveryCap) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  const floored = Math.floor(numeric);
  if (!Number.isSafeInteger(floored) || floored > recoveryCap * 1000) {
    return recoveryCap;
  }
  return floored;
}

function getAnalyticsBase(analytics = {}) {
  return {
    ...createEmptySessionAnalytics(),
    ...(analytics || {}),
  };
}

function incrementMapValue(map = {}, key, amount = 1) {
  return {
    ...(map || {}),
    [key]: ((map || {})[key] || 0) + amount,
  };
}

function incrementNestedMapValue(map = {}, key, nestedKey, amount = 1) {
  return {
    ...(map || {}),
    [key]: {
      ...((map || {})[key] || {}),
      [nestedKey]: (((map || {})[key] || {})[nestedKey] || 0) + amount,
    },
  };
}

function countEffectsBySourceId(effects = [], sourceId) {
  if (!sourceId) return 0;
  return (effects || []).filter(effect => effect?.sourceId === sourceId).length;
}

function getExtractYield(item) {
  const rarityTier = EXTRACT_RARITY_TIER[item?.rarity] || 1;
  const rarityMult = { common: 1, magic: 1.4, rare: 2, epic: 3, legendary: 5 }[item?.rarity] || 1;
  return Math.max(1, Math.floor((rarityTier + Math.floor((item?.level ?? 0) / 2)) * rarityMult));
}

function buildLootRuleSet(rules = {}, player = {}, enemy = null) {
  const activeBuildTag = getPlayerBuildTag(player);
  return {
    autoSell: new Set(rules.autoSellRarities || []),
    autoExtract: new Set(rules.autoExtractRarities || []),
    protectHuntedDrops: rules.protectHuntedDrops !== false,
    protectUpgradeDrops: rules.protectUpgradeDrops !== false,
    huntPreset: rules.huntPreset || null,
    wishlistAffixes: resolveLootRuleWishlist(rules, { activeBuildTag, enemy }),
  };
}

function hasBossMechanic(enemy, mechanicId) {
  return (enemy?.mechanics || []).some(mechanic => mechanic.id === mechanicId);
}

function getBossMechanic(enemy, mechanicId) {
  return (enemy?.mechanics || []).find(mechanic => mechanic.id === mechanicId) || null;
}

function createCombatFloatEvent(kind, value, options = {}) {
  const rounded = Math.max(0, Math.floor(value || 0));
  if (!rounded) return null;
  floatEventSequence += 1;
  return {
    id: `float-${Date.now()}-${floatEventSequence}`,
    kind,
    value: rounded,
    crit: !!options.crit,
    source: options.source || null,
    at: Date.now(),
  };
}

function appendCombatFloatEvents(previous = [], incoming = []) {
  const payload = [
    ...(previous || []),
    ...(incoming || []).filter(Boolean),
  ];
  return payload.slice(-FLOAT_EVENT_LIMIT);
}

function getEnemyDefenseMultiplier(defense = 0) {
  const effectiveDefense = Math.max(0, Number(defense || 0));
  return 1 / (1 + effectiveDefense / ENEMY_DEFENSE_SCALING);
}

function getFractureReducedDefense(baseDefense = 0, stacks = 0) {
  const clampedStacks = Math.max(0, Number(stacks || 0));
  const reductionMultiplier = Math.max(
    0.45,
    1 - clampedStacks * FRACTURE_DEFENSE_REDUCTION_PER_STACK
  );
  return Math.max(0, Math.floor((baseDefense || 0) * reductionMultiplier));
}

function getBleedTickDamage(runtime = {}) {
  const stacks = Math.max(0, Number(runtime?.bleedStacks || 0));
  const perStack = Math.max(0, Number(runtime?.bleedPerStack || 0));
  const duration = Math.max(0, Number(runtime?.bleedTicksRemaining || 0));
  if (!stacks || !perStack || !duration) return 0;
  return Math.max(1, Math.floor(stacks * perStack));
}

function getVoidFractureTickDamage(runtime = {}) {
  const stacks = Math.max(0, Number(runtime?.voidFractureStacks || 0));
  const perStack = Math.max(0, Number(runtime?.voidFracturePerStack || 0));
  const duration = Math.max(0, Number(runtime?.voidFractureTicksRemaining || 0));
  if (!stacks || !perStack || !duration) return 0;
  return Math.max(1, Math.floor(stacks * perStack));
}

function getPlayerPoisonTickDamage(runtime = {}) {
  const stacks = Math.max(0, Number(runtime?.poisonStacksOnPlayer || 0));
  const perStack = Math.max(0, Number(runtime?.poisonPerStackOnPlayer || 0));
  const duration = Math.max(0, Number(runtime?.poisonTicksRemainingOnPlayer || 0));
  if (!stacks || !perStack || !duration) return 0;
  return Math.max(1, Math.floor(stacks * perStack));
}

function applyMitigatedDamage(value = 0, mitigation = 0) {
  const numeric = Math.max(0, Number(value || 0));
  if (!numeric) return 0;
  const clampedMitigation = Math.min(0.9, Math.max(0, Number(mitigation || 0)));
  return Math.max(0, Math.floor(numeric * (1 - clampedMitigation)));
}

function getHeavyHitGuardPercent({ stats = {}, effectiveDefense = 0, rawHit = 0 }) {
  const baseGuard = Math.max(0, Number(stats?.heavyHitGuard || 0));
  const normalizedRawHit = Math.max(0, Number(rawHit || 0));
  if (!baseGuard || !normalizedRawHit) return 0;

  const defenseContribution = Math.min(
    0.16,
    Math.max(0, Number(effectiveDefense || 0)) / Math.max(140, normalizedRawHit * 4.4)
  );
  const hpContribution = Math.min(
    0.12,
    Math.max(0, Number(stats?.maxHp || 0)) / Math.max(1200, normalizedRawHit * 7.5)
  );

  return Math.min(0.58, baseGuard + defenseContribution + hpContribution);
}

function hasEnemyAffixPressure(enemy = null) {
  return Math.max(0, Number(enemy?.monsterAffixes?.length || 0)) > 0;
}

function getAbyssMutatorSeverity(enemy = null) {
  const mutator = enemy?.abyssMutator;
  if (!mutator) return 0;

  const countStatEntries = modifiers =>
    Object.values(modifiers?.stats || {}).reduce((count, value) => (
      Number(value || 1) !== 1 ? count + 1 : count
    ), 0);

  const commonStats = countStatEntries(mutator.commonModifiers);
  const bossStats = countStatEntries(mutator.bossModifiers);
  const affixCount =
    Math.max(0, Number(mutator?.commonModifiers?.affixIds?.length || 0)) +
    Math.max(0, Number(mutator?.bossModifiers?.affixIds?.length || 0));
  const mechanicCount = Math.max(0, Number(mutator?.bossModifiers?.mechanicIds?.length || 0));

  return Math.max(
    0.75,
    commonStats * 0.18 + bossStats * 0.14 + affixCount * 0.28 + mechanicCount * 0.36
  );
}

function rollDamageRangeMultiplier(stats = {}) {
  const min = Math.max(0.25, Number(stats.damageRangeMin || 1));
  const max = Math.max(min, Number(stats.damageRangeMax || 1));
  if (Math.abs(max - min) < 0.0001) return min;
  return min + Math.random() * (max - min);
}

function hydrateSpawnedEnemy(enemy, runtimePatch = {}) {
  if (!enemy) return enemy;
  return {
    ...enemy,
    runtime: {
      openingHitSpent: false,
      hasTakenPlayerHit: false,
      bleedStacks: 0,
      bleedPerStack: 0,
      bleedTicksRemaining: 0,
      poisonStacksOnPlayer: 0,
      poisonPerStackOnPlayer: 0,
      poisonTicksRemainingOnPlayer: 0,
      fractureStacks: 0,
      fractureTicksRemaining: 0,
      voidFractureStacks: 0,
      voidFracturePerStack: 0,
      voidFractureTicksRemaining: 0,
      flowStacks: 0,
      markStacks: 0,
      markTicksRemaining: 0,
      mageFlowBonusMult: 1,
      mageFlowHitsRemaining: 0,
      mageMemoryStacks: 0,
      mageTemporalFlowStacks: 0,
      phaseResetUsed: false,
      phaseSkinUsed: false,
      bloodPactUsed: false,
      ...(enemy.runtime || {}),
      ...(runtimePatch || {}),
    },
  };
}

export function processTick(state) {
  if (state.combat?.pendingRunSetup) return state;
  const enemy = state.combat.enemy;
  if (!enemy) return state;
  const activeRunSigilIds = state.combat?.activeRunSigilIds || state.combat?.activeRunSigilId || "free";
  const runSigilCodexModifiers = getRunSigilCodexModifiers(activeRunSigilIds);
  const sightedCodex = recordCodexSighting(state.codex || {}, enemy);
  const lootRuleSet = buildLootRuleSet(state.settings?.lootRules, state.player, enemy);
  const enemyRuntime = enemy.runtime || {};
  const sessionAnalytics = getAnalyticsBase(state.combat.analytics);
  const prestigeCycle = createEmptyPrestigeCycleProgress(state.combat.prestigeCycle || {});
  const currentCombatTier = state.combat.currentTier || enemy.tier || 1;

  const eventMods = {
    damageMult: 1,
    goldMult: 1,
    xpMult: 1,
    essenceMult: 1,
    lootBonus: 0,
    rarityBonus: 0,
    regenMult: 1,
  };
  const s = calcStats(state.player);
  const initialMageVolatileMult = Math.max(0.2, Number(state.combat.pendingMageVolatileMult || 1));
  const legendaryBonuses = getLegendaryStaticBonuses({
    player: state.player,
    enemy,
    stats: s,
    currentTier: currentCombatTier,
    maxTier: state.combat.maxTier || currentCombatTier,
    bossesKilledThisRun: state.combat.runStats?.bossKills || 0,
  });
  const unlockedTalents = state.player.unlockedTalents || [];
  const effectsToApply = [];
  const preLegendaryEffects = [];
  const preLegendaryLogs = [];
  const isAbyssEnemy = Number(enemy?.abyssDepth || 0) > 0;
  const hasEnemyAffixes = hasEnemyAffixPressure(enemy);
  const abyssMutatorSeverity = getAbyssMutatorSeverity(enemy);
  const abyssPenaltyReduction = isAbyssEnemy
    ? Math.min(
        0.75,
        Math.max(0, Number(s.abyssEnemyAffixPenaltyReduction || 0)) +
          (!enemy.isBoss ? Math.max(0, Number(s.abyssNormalEnemyPenaltyReduction || 0)) : 0)
      )
    : 0;
  const abyssRegenBonus = isAbyssEnemy
    ? Math.floor(
        Math.max(0, Number(s.abyssRegenFlat || 0)) *
          Math.max(1, Number(enemy?.abyssDepth || 1)) *
          Math.max(1, Number(enemy?.cycleTier || currentCombatTier || 1) / 25)
      )
    : 0;
  const bossMechanicMitigation = enemy.isBoss
    ? Math.min(
        0.75,
        Math.max(0, Number(s.bossMechanicMitigation || 0)) +
          (isAbyssEnemy ? Math.max(0, Number(s.abyssBossMechanicMitigation || 0)) : 0)
      )
    : 0;

  const { effects: preTriggerEffects, logs: preTriggerLogs } = processTriggerTalents({
    unlockedTalents,
    context: {
      sessionKills: state.combat.sessionKills || 0,
      didCrit: false,
      playerHpPct: state.player.hp / s.maxHp,
      tookDamage: false,
      enemyKilled: false,
    },
    triggerStats: ["kills", "lowHp", "onHit", "always"],
  });
  const { immediate: preImmediateEffects, persistent: prePersistentEffects } =
    splitImmediateEffects(preTriggerEffects);

  const tickedEffects = tickEffects(state.combat.effects || []);
  const activeEffects = applyEffects(tickedEffects, [
    ...(effectsToApply || []),
    ...(preLegendaryEffects || []),
    ...(prePersistentEffects || []),
  ]);
  const effectMods = computeEffectModifiers(activeEffects);
  const preImmediate = applyModifierTotals({
    playerHp: state.player.hp,
    playerMaxHp: s.maxHp,
    playerGold: state.player.gold,
    totals: toModifierTotals(computeEffectModifiers(preImmediateEffects)),
    context: {
      didCrit: false,
      enemyKilled: false,
      damageDealt: 0,
    },
  });

  const playerLowHp = state.player.hp / s.maxHp <= 0.3;
  const hasClericBlessing = unlockedTalents.includes("cleric_blessing");
  const regenAmount = Math.floor(
    (1 +
      (s.regen || 0) +
      Math.floor(s.maxHp * ((s.regenPctMaxHp || 0) + (effectMods.regenPctMaxHp || 0))) +
      (hasClericBlessing ? 5 : 0) +
      (effectMods.regen || 0) +
      (legendaryBonuses.regen || 0) +
      abyssRegenBonus) *
      (eventMods.regenMult || 1)
  );

  const totalDodgeChance = Math.min(
    CRIT_CAP,
    (unlockedTalents.includes("phantom_escape") ? 0.15 : 0) + (s.dodgeChance || 0)
  );
  const evaded = Math.random() < totalDodgeChance;
  const effectiveCritChance = Math.min(
    CRIT_CAP,
    Math.max(
      0,
      s.critChance +
        (effectMods.critBonus || 0) +
        (legendaryBonuses.critChance || 0) +
        (playerLowHp ? s.critOnLowHp || 0 : 0)
    )
  );
  const effectiveDefense = Math.max(
    0,
    Math.floor((s.defense + (effectMods.defenseFlat || 0)) * (effectMods.defenseMult || 1) * (legendaryBonuses.defenseMult || 1))
  );
  const currentTick = (state.combat.ticksInCurrentRun || 0) + 1;
  const enemyRegenPerTick = Math.max(
    0,
    Math.floor(
      ((enemyRuntime.regenPerTick || 0) + enemy.maxHp * Math.max(0, Number(enemyRuntime.regenPctMaxHp || 0))) *
        (1 - abyssPenaltyReduction)
    )
  );
  const enemyFlatReduction = Math.max(
    0,
    Math.floor((enemyRuntime.flatDamageReduction || 0) * (1 - abyssPenaltyReduction))
  );
  const enemyFlatThorns = Math.max(
    0,
    Math.floor((enemyRuntime.flatThorns || 0) * (1 - abyssPenaltyReduction))
  );
  const enemyThornsRatio = Math.max(
    0,
    (enemyRuntime.reflectRatio || 0) * (1 - abyssPenaltyReduction)
  );
  const enemyCritImmune =
    !!enemyRuntime.critImmune ||
    (hasBossMechanic(enemy, "crit_immunity") &&
      enemy.hp / enemy.maxHp > (getBossMechanic(enemy, "crit_immunity")?.params?.threshold || 0.6));
  const enemyDamageMult =
    enemy.hp / enemy.maxHp <= (enemyRuntime.enrageThreshold || 0)
      ? enemyRuntime.enrageDamageMult || 1
      : 1;
  const bossEnrage = getBossMechanic(enemy, "enrage_low_hp");
  const bossDamageMult =
    bossEnrage && enemy.hp / enemy.maxHp <= (bossEnrage.params?.threshold || 0.35)
      ? bossEnrage.params?.damageMult || 1.45
      : 1;
  const bossShield = getBossMechanic(enemy, "shield_every_n");
  const bossShieldActive =
    !!bossShield &&
    currentTick > 1 &&
    currentTick % (bossShield.params?.every || 8) === 0;
  const bossDoubleStrike = getBossMechanic(enemy, "double_strike");
  const enemyStrikeCount =
    bossDoubleStrike &&
    currentTick % (bossDoubleStrike.params?.every || 4) === 0
      ? 2
      : 1;

  const statusBleedTickDamage = getBleedTickDamage(enemyRuntime);
  const statusVoidFractureTickDamage = getVoidFractureTickDamage(enemyRuntime);
  const statusPlayerPoisonTickDamage = getPlayerPoisonTickDamage(enemyRuntime);
  const nextEnemyRuntime = {
    ...enemyRuntime,
    bleedTicksRemaining:
      Math.max(0, Number(enemyRuntime.bleedTicksRemaining || 0) - (statusBleedTickDamage > 0 ? 1 : 0)),
    poisonTicksRemainingOnPlayer:
      Math.max(
        0,
        Number(enemyRuntime.poisonTicksRemainingOnPlayer || 0) -
          (statusPlayerPoisonTickDamage > 0 ? 1 : 0)
      ),
    fractureTicksRemaining:
      Math.max(
        0,
        Number(enemyRuntime.fractureTicksRemaining || 0) -
          ((enemyRuntime.fractureStacks || 0) > 0 ? 1 : 0)
      ),
    markTicksRemaining:
      Math.max(
        0,
        Number(enemyRuntime.markTicksRemaining || 0) -
          ((enemyRuntime.markStacks || 0) > 0 ? 1 : 0)
      ),
    voidFractureTicksRemaining:
      Math.max(
        0,
        Number(enemyRuntime.voidFractureTicksRemaining || 0) -
          ((enemyRuntime.voidFractureStacks || 0) > 0 ? 1 : 0)
      ),
    mageFlowBonusMult: Math.max(1, Number(enemyRuntime.mageFlowBonusMult || 1)),
    mageFlowHitsRemaining: Math.max(0, Number(enemyRuntime.mageFlowHitsRemaining || 0)),
    mageMemoryStacks: Math.max(0, Number(enemyRuntime.mageMemoryStacks || 0)),
    mageTemporalFlowStacks: Math.max(0, Number(enemyRuntime.mageTemporalFlowStacks || 0)),
    hasTakenPlayerHit: !!enemyRuntime.hasTakenPlayerHit,
    phaseResetUsed: !!enemyRuntime.phaseResetUsed,
    phaseSkinUsed: !!enemyRuntime.phaseSkinUsed,
    bloodPactUsed: !!enemyRuntime.bloodPactUsed,
  };
  if ((nextEnemyRuntime.bleedTicksRemaining || 0) <= 0) {
    nextEnemyRuntime.bleedStacks = 0;
    nextEnemyRuntime.bleedPerStack = 0;
  }
  if ((nextEnemyRuntime.poisonTicksRemainingOnPlayer || 0) <= 0) {
    nextEnemyRuntime.poisonStacksOnPlayer = 0;
    nextEnemyRuntime.poisonPerStackOnPlayer = 0;
  }
  if ((nextEnemyRuntime.fractureTicksRemaining || 0) <= 0) {
    nextEnemyRuntime.fractureStacks = 0;
  }
  if ((nextEnemyRuntime.markTicksRemaining || 0) <= 0) {
    nextEnemyRuntime.markStacks = 0;
  }
  if ((nextEnemyRuntime.voidFractureTicksRemaining || 0) <= 0) {
    nextEnemyRuntime.voidFractureStacks = 0;
    nextEnemyRuntime.voidFracturePerStack = 0;
  }
  if ((nextEnemyRuntime.mageFlowHitsRemaining || 0) <= 0) {
    nextEnemyRuntime.mageFlowBonusMult = 1;
  }

  const bleedTickDamage = statusBleedTickDamage;
  const voidFractureTickDamage = statusVoidFractureTickDamage;
  const playerPoisonTickDamage =
    hasBossMechanic(enemy, "poison_stacks")
      ? applyMitigatedDamage(statusPlayerPoisonTickDamage, bossMechanicMitigation)
      : statusPlayerPoisonTickDamage;
  const enemyHpAfterStatuses = Math.max(
    0,
    Math.min(enemy.maxHp, enemy.hp - bleedTickDamage - voidFractureTickDamage + enemyRegenPerTick)
  );
  const totalAttackSpeed = Math.max(
    0,
    Math.min(0.95, (s.attackSpeed || 0) + (effectMods.attackSpeedFlat || 0) + (legendaryBonuses.attackSpeed || 0))
  );
  const totalMultiHitChance = Math.max(
    0,
    Math.min(MULTI_HIT_CAP, (s.multiHitChance || 0) + (legendaryBonuses.multiHitChance || 0))
  );
  let hitCount = enemyHpAfterStatuses > 0 ? 1 : 0;
  if (!s.disableComboHits) {
    if (hitCount > 0 && Math.random() < totalAttackSpeed) hitCount += 1;
    if (hitCount > 0 && Math.random() < totalMultiHitChance) hitCount += 1;
  }
  const baseHitCount = hitCount;
  const totalEchoHitChance = Math.max(0, Math.min(0.55, Number(s.echoHitChance || 0)));
  const echoHitTriggered = hitCount > 0 && Math.random() < totalEchoHitChance;
  if (echoHitTriggered) hitCount += 1;
  const pendingOnKillDamage = state.combat.pendingOnKillDamage || 0;
  const totalBleedChance = Math.max(0, Math.min(CRIT_CAP, s.bleedChance || 0));
  const totalBleedDamage = Math.max(0, s.bleedDamage || 0);
  const totalFractureChance = Math.max(0, Math.min(CRIT_CAP, s.fractureChance || 0));
  const totalVoidStrikeChance = Math.max(0, Math.min(0.45, Number(s.voidStrikeChance || 0)));
  const totalAbyssalCritFractureChance = Math.max(
    0,
    Math.min(CRIT_CAP, Number(s.abyssalCritFractureChance || 0))
  );
  const totalMarkChance = Math.max(
    0,
    Math.min(CRIT_CAP, (s.markChance || 0) + (legendaryBonuses.markChance || 0))
  );
  let playerDmg = 0;
  let didCrit = false;
  let consumedFirstCritShield = false;
  let appliedBleedStacks = 0;
  let appliedFractureStacks = 0;
  let appliedMarkStacks = 0;
  let appliedVoidFractureStacks = 0;
  let voidStrikeHits = 0;
  let pendingMageVolatileMult = initialMageVolatileMult;
  const openingHitPending = !enemyRuntime.openingHitSpent && (s.openingHitDamageMult || 1) > 1;
  const executeThreshold = Math.max(0.15, Number(s.executeThreshold || 0));

  if (enemyHpAfterStatuses > 0) {
    for (let hitIndex = 0; hitIndex < hitCount; hitIndex += 1) {
      const enemyHpAfterHits = Math.max(0, enemyHpAfterStatuses - playerDmg);
      const hitEnemyHpPct = enemyHpAfterHits / enemy.maxHp;
      let hitLowHpMult = 1;
      const flowStacksBeforeHit = Math.max(0, Number(nextEnemyRuntime.flowStacks || 0));
      const combatFlowMult =
        (s.combatFlow || 0) > 0
          ? 1 + Math.min(Number(s.combatFlowMaxStacks || 0), flowStacksBeforeHit) * Number(s.combatFlowPerStack || 0)
          : 1;
      const mageTemporalStacks = Math.max(0, Number(nextEnemyRuntime.mageTemporalFlowStacks || 0));
      const temporalFlowMult =
        (s.temporalFlowPerStack || 0) > 0
          ? 1 + Math.min(Number(s.temporalFlowMaxStacks || 0), mageTemporalStacks) * Number(s.temporalFlowPerStack || 0)
          : 1;
      const markStacksBeforeHit = Math.max(0, Number(nextEnemyRuntime.markStacks || 0));
      const mageMemoryStacks = Math.max(0, Number(nextEnemyRuntime.mageMemoryStacks || 0));
      const markEffectPerStack =
        Math.max(0, Number(s.markEffectPerStack || 0)) +
        mageMemoryStacks *
          (Math.max(0, Number(s.spellMemoryMarkEffectPerStack || 0)) +
            Math.max(0, Number(legendaryBonuses.spellMemoryMarkEffectPerStack || 0))) +
        Math.max(0, Number(legendaryBonuses.markEffectPerStack || 0));
      const markedTargetMult = markStacksBeforeHit > 0 ? 1 + markStacksBeforeHit * markEffectPerStack : 1;
      const absoluteControlMult =
        markStacksBeforeHit > 0
          ? Math.max(1, Number(s.absoluteControlMarkedMult || 1))
          : Math.max(0.5, Number(s.absoluteControlUnmarkedMult || 1));
      const freshTargetMult =
        !nextEnemyRuntime.hasTakenPlayerHit
          ? Math.max(1, Number(s.freshTargetDamageMult || 1)) *
            Math.max(1, Number(legendaryBonuses.freshTargetDamageMult || 1))
          : 1;
      const mageFlowMult =
        (nextEnemyRuntime.mageFlowHitsRemaining || 0) > 0
          ? Math.max(1, Number(nextEnemyRuntime.mageFlowBonusMult || 1))
          : 1;
      const volatileMult = Math.max(0.2, Number(pendingMageVolatileMult || 1));
      const rangeRoll = s.isMage
        ? rollDamageRangeMultiplier({
            damageRangeMin: (s.damageRangeMin || 1) + (legendaryBonuses.damageRangeMin || 0),
            damageRangeMax: (s.damageRangeMax || 1) + (legendaryBonuses.damageRangeMax || 0),
          })
        : 1;
      const overchannelChainPenalty =
        hitIndex > 0 && (s.overchannelPenaltyPerExtraHit || 0) > 0
          ? Math.max(0.45, 1 - Number(s.overchannelPenaltyPerExtraHit || 0) * hitIndex)
          : 1;
      const echoHitMult = hitIndex >= baseHitCount ? 0.4 : 1;
      const corruptionAmpMult = hasEnemyAffixes ? 1 + Math.max(0, Number(s.enemyAffixDamagePct || 0)) : 1;
      const abyssDamageMult = isAbyssEnemy ? 1 + Math.max(0, Number(s.abyssDamagePct || 0)) : 1;
      const abyssMutatorOffenseMult =
        isAbyssEnemy && abyssMutatorSeverity > 0
          ? 1 + Math.max(0, Number(s.abyssMutatorOffensePct || 0)) * abyssMutatorSeverity
          : 1;
      const abyssPenaltyCounterMult =
        isAbyssEnemy && abyssPenaltyReduction > 0
          ? 1 + abyssPenaltyReduction * (enemy.isBoss ? 0.18 : 0.14)
          : 1;

      if (hitEnemyHpPct < 0.3) {
        if (unlockedTalents.includes("shadowblade_execution")) hitLowHpMult *= 1.5;
        if (unlockedTalents.includes("executioner_finish")) hitLowHpMult *= 1.6;
      }
      if (hitEnemyHpPct <= executeThreshold) {
        hitLowHpMult *= Math.max(1, Number(s.executeDamageMult || 1));
      }

      const rawCrit = !enemyCritImmune && Math.random() < effectiveCritChance;
      const bossAbsorbCrit =
        rawCrit &&
        hasBossMechanic(enemy, "absorb_first_crit") &&
        !enemyRuntime.absorbFirstCritUsed &&
        !consumedFirstCritShield;
      const hitCrit = rawCrit && !bossAbsorbCrit;
      const critMultiplier = hitCrit ? 2 + (s.critDamage || 0) + (legendaryBonuses.critDamage || 0) : 1;
      const fracturedDefense = getFractureReducedDefense(enemy.defense || 0, nextEnemyRuntime.fractureStacks || 0);
      const didVoidStrike = Math.random() < totalVoidStrikeChance;
      const enemyDefenseMultiplier = didVoidStrike ? 1 : getEnemyDefenseMultiplier(fracturedDefense);
      const openingHitMultiplier =
        hitIndex === 0 && openingHitPending
          ? Math.max(1, s.openingHitDamageMult || 1)
          : 1;
      const crushingFracturedMult =
        (nextEnemyRuntime.fractureStacks || 0) > 0
          ? Math.max(1, Number(s.crushingFracturedDamageMult || 1))
          : 1;
      let hitDamage = Math.floor(
        (s.damage +
          (legendaryBonuses.damageFlat || 0) +
          (effectMods.damageFlat || 0) +
          (hitIndex === 0 ? pendingOnKillDamage : 0)) *
          critMultiplier *
          (eventMods.damageMult || 1) *
          (effectMods.damageMult || 1) *
          (legendaryBonuses.damageMult || 1) *
          (effectMods.enemyDamageTakenMult || 1) *
          openingHitMultiplier *
          combatFlowMult *
          temporalFlowMult *
          markedTargetMult *
          crushingFracturedMult *
          absoluteControlMult *
          freshTargetMult *
          mageFlowMult *
          volatileMult *
          rangeRoll *
          Math.max(0.7, Number(s.cataclysmSustainMult || 1)) *
          overchannelChainPenalty *
          echoHitMult *
          corruptionAmpMult *
          abyssDamageMult *
          abyssMutatorOffenseMult *
          abyssPenaltyCounterMult *
          (hitIndex > 0
            ? Math.max(0.35, Number(s.multiHitDamageMult || 1) + Number(legendaryBonuses.multiHitDamageMult || 0))
            : 1) *
          hitLowHpMult *
          enemyDefenseMultiplier
      );
      hitDamage = Math.max(0, hitDamage - enemyFlatReduction);
      if (bossShieldActive && hitIndex === 0) {
        hitDamage =
          openingHitPending && Math.max(0, Number(s.crushingShieldBypassPct || 0)) > 0
            ? Math.max(1, Math.floor(hitDamage * Math.min(0.9, Number(s.crushingShieldBypassPct || 0))))
            : 0;
      }
      if (hitIndex === 0 && hitDamage > 0 && openingHitPending) {
        nextEnemyRuntime.openingHitSpent = true;
      }

      playerDmg += hitDamage;
      if (hitCrit) didCrit = true;
      if (bossAbsorbCrit) consumedFirstCritShield = true;
      if (didVoidStrike && hitDamage > 0) voidStrikeHits += 1;
      if (hitDamage > 0) {
        nextEnemyRuntime.hasTakenPlayerHit = true;
      }

      if (hitDamage > 0 && Math.random() < totalFractureChance) {
        nextEnemyRuntime.fractureStacks = Math.min(
          FRACTURE_STACK_CAP,
          Number(nextEnemyRuntime.fractureStacks || 0) + 1
        );
        nextEnemyRuntime.fractureTicksRemaining = FRACTURE_DURATION_TICKS;
        appliedFractureStacks += 1;
      }
      if (hitDamage > 0 && hitIndex === 0 && openingHitPending && Number(s.crushingOpeningFractureStacks || 0) > 0) {
        const extraStacks = Math.max(0, Number(s.crushingOpeningFractureStacks || 0));
        nextEnemyRuntime.fractureStacks = Math.min(
          FRACTURE_STACK_CAP,
          Number(nextEnemyRuntime.fractureStacks || 0) + extraStacks
        );
        nextEnemyRuntime.fractureTicksRemaining = FRACTURE_DURATION_TICKS;
        appliedFractureStacks += extraStacks;
      }

      if (hitDamage > 0 && Math.random() < totalBleedChance) {
        const bleedPerStack = Math.max(
          1,
          Math.floor(hitDamage * (0.02 + totalBleedDamage * 0.35))
        );
        nextEnemyRuntime.bleedStacks = Math.min(
          BLEED_STACK_CAP,
          Number(nextEnemyRuntime.bleedStacks || 0) + 1
        );
        nextEnemyRuntime.bleedPerStack = Math.max(
          Number(nextEnemyRuntime.bleedPerStack || 0),
          bleedPerStack
        );
        nextEnemyRuntime.bleedTicksRemaining = BLEED_DURATION_TICKS;
        appliedBleedStacks += 1;
      }

      if (hitDamage > 0 && hitCrit && Math.random() < totalAbyssalCritFractureChance) {
        const voidFracturePerStack = Math.max(
          1,
          Math.floor(hitDamage * (0.035 + Math.max(0, Number(enemy?.abyssDepth || 0)) * 0.008))
        );
        nextEnemyRuntime.voidFractureStacks = Math.min(
          VOID_FRACTURE_STACK_CAP,
          Number(nextEnemyRuntime.voidFractureStacks || 0) + 1
        );
        nextEnemyRuntime.voidFracturePerStack = Math.max(
          Number(nextEnemyRuntime.voidFracturePerStack || 0),
          voidFracturePerStack
        );
        nextEnemyRuntime.voidFractureTicksRemaining = VOID_FRACTURE_DURATION_TICKS;
        appliedVoidFractureStacks += 1;
      }

      if (hitDamage > 0 && totalMarkChance > 0 && Math.random() < totalMarkChance) {
        const highRollOrCrit =
          hitCrit ||
          rangeRoll >= Math.max(1.02, (Number(s.damageRangeMin || 1) + Number(s.damageRangeMax || 1)) / 2);
        const markGain = 1 + (highRollOrCrit ? Math.max(0, Number(s.overloadExtraMarks || 0)) : 0);
        nextEnemyRuntime.markStacks = Math.min(
          Math.max(1, Number(s.markMaxStacks || 1)),
          Number(nextEnemyRuntime.markStacks || 0) + markGain
        );
        nextEnemyRuntime.markTicksRemaining = Math.max(1, Number(s.markDuration || 1));
        appliedMarkStacks += markGain;
      }

      if (hitDamage > 0 && (s.combatFlow || 0) > 0) {
        nextEnemyRuntime.flowStacks = Math.min(
          Number(s.combatFlowMaxStacks || 6),
          Number(nextEnemyRuntime.flowStacks || 0) + 1
        );
      }

      if (hitDamage > 0 && (s.spellMemoryMarkEffectPerStack || 0) > 0) {
        nextEnemyRuntime.mageMemoryStacks = Math.min(
          Number(s.spellMemoryMaxStacks || 0),
          Number(nextEnemyRuntime.mageMemoryStacks || 0) + 1
        );
      }

      if (hitDamage > 0 && (s.temporalFlowPerStack || 0) > 0) {
        nextEnemyRuntime.mageTemporalFlowStacks = Math.min(
          Number(s.temporalFlowMaxStacks || 0),
          Number(nextEnemyRuntime.mageTemporalFlowStacks || 0) + 1
        );
      }

      if (hitDamage > 0 && (nextEnemyRuntime.mageFlowHitsRemaining || 0) > 0) {
        nextEnemyRuntime.mageFlowHitsRemaining = Math.max(
          0,
          Number(nextEnemyRuntime.mageFlowHitsRemaining || 0) - 1
        );
        if ((nextEnemyRuntime.mageFlowHitsRemaining || 0) <= 0) {
          nextEnemyRuntime.mageFlowBonusMult = 1;
        }
      }

      if ((s.volatileCasting || 0) > 0) {
        const highRollOrCrit =
          hitDamage > 0 &&
          (hitCrit ||
            rangeRoll >= Math.max(1.02, (Number(s.damageRangeMin || 1) + Number(s.damageRangeMax || 1)) / 2));
        pendingMageVolatileMult = highRollOrCrit
          ? Math.max(1, Number(s.volatileCritNextHitMult || 1))
          : Math.max(0.2, Number(s.volatileFailNextHitMult || 1));
      }

      if (playerDmg >= enemyHpAfterStatuses) break;
    }
  }

  const comboText = hitCount > 1 ? ` x${hitCount} golpes` : "";
  const critText = didCrit ? " [CRIT]" : "";
  const enemyHpBeforeDamage = enemyHpAfterStatuses;
  const armorShred = getBossMechanic(enemy, "armor_shred");
  const lifestealReflect = getBossMechanic(enemy, "lifesteal_reflect");
  const poisonMechanic = getBossMechanic(enemy, "poison_stacks");
  const phaseResetMechanic = getBossMechanic(enemy, "phase_reset");
  const markReversalMechanic = getBossMechanic(enemy, "mark_reversal");
  const spellMirrorMechanic = getBossMechanic(enemy, "spell_mirror");
  const ignoreDefenseThisTick =
    !!armorShred && currentTick % (armorShred.params?.every || 6) === 0;
  const abyssBossDamageMitigation = enemy.isBoss && isAbyssEnemy
    ? Math.min(0.7, Math.max(0, Number(s.abyssBossMechanicMitigation || 0)))
    : 0;
  const enemyRawHit = enemyHpBeforeDamage <= 0
    ? 0
    : evaded
    ? 0
    : Math.max(1, Math.floor(enemy.damage * enemyDamageMult * bossDamageMult));
  const defensePreventedPerHit = ignoreDefenseThisTick ? 0 : Math.min(enemyRawHit, effectiveDefense);
  const postDefenseEnemyHit = Math.max(0, enemyRawHit - defensePreventedPerHit);
  const heavyHitThreshold = Math.max(
    18,
    Math.floor(
      s.maxHp *
        Math.max(
          0.055,
          0.105 - Math.min(0.025, Number(s.fortress || 0) * 0.004)
        )
    )
  );
  const heavyHitGuardPct = getHeavyHitGuardPercent({
    stats: s,
    effectiveDefense,
    rawHit: enemyRawHit,
  });
  const heavyHitPortionPerHit = Math.max(0, postDefenseEnemyHit - heavyHitThreshold);
  const heavyHitPreventedPerHit = Math.floor(heavyHitPortionPerHit * heavyHitGuardPct);
  let enemyDamageBase = Math.max(0, postDefenseEnemyHit - heavyHitPreventedPerHit);
  if (!enemy.isBoss && isAbyssEnemy && abyssPenaltyReduction > 0) {
    enemyDamageBase = Math.max(0, Math.floor(enemyDamageBase * (1 - abyssPenaltyReduction * 0.28)));
  }
  if (enemy.isBoss && abyssBossDamageMitigation > 0) {
    enemyDamageBase = Math.max(0, Math.floor(enemyDamageBase * (1 - abyssBossDamageMitigation)));
  }
  if (ignoreDefenseThisTick && bossMechanicMitigation > 0) {
    enemyDamageBase = Math.max(0, Math.floor(enemyDamageBase * (1 - bossMechanicMitigation)));
  }
  const blocked =
    !evaded &&
    enemyDamageBase > 0 &&
    Math.random() < Math.min(CRIT_CAP, Math.max(0, (s.blockChance || 0) + (legendaryBonuses.blockChance || 0)));
  const rawEnemyDmgTotal = enemyRawHit * enemyStrikeCount;
  const preBlockEnemyDmg = enemyDamageBase * enemyStrikeCount;
  let enemyDmg = blocked ? 0 : preBlockEnemyDmg;
  let reversedMarkStacks = 0;
  let markReversalDamage = 0;
  if (
    markReversalMechanic &&
    !evaded &&
    (nextEnemyRuntime.markStacks || 0) > 0
  ) {
    reversedMarkStacks = Math.max(0, Number(nextEnemyRuntime.markStacks || 0));
    markReversalDamage = Math.max(
      1,
      Math.floor(
        enemy.damage *
          reversedMarkStacks *
          Math.max(0, Number(markReversalMechanic.params?.damagePerMarkPct || 0.06))
      )
    );
    markReversalDamage = applyMitigatedDamage(markReversalDamage, bossMechanicMitigation);
    nextEnemyRuntime.markStacks = 0;
    nextEnemyRuntime.markTicksRemaining = 0;
    enemyDmg += markReversalDamage;
  }
  if (!blocked && enemyStrikeCount > 1 && bossMechanicMitigation > 0) {
    enemyDmg = Math.max(0, Math.floor(enemyDmg * (1 - bossMechanicMitigation)));
  }
  const totalPreventedDamage = Math.max(0, rawEnemyDmgTotal - enemyDmg);
  const preventedDamageRatio =
    rawEnemyDmgTotal > 0
      ? Math.max(0, totalPreventedDamage / rawEnemyDmgTotal)
      : 0;
  const tookDamage = enemyDmg > 0;
  const regenHp = Math.min(s.maxHp, preImmediate.hp + regenAmount);
  const appliedRegen = Math.max(0, regenHp - preImmediate.hp);
  const hpAfterPoison = Math.max(0, regenHp - playerPoisonTickDamage);
  let newPlayerHp = hpAfterPoison - enemyDmg;
  let appliedPoisonStacksToPlayer = 0;
  if (poisonMechanic && tookDamage) {
    const poisonChance = Math.min(0.85, Math.max(0, Number(poisonMechanic.params?.chance || 0.42)));
    for (let strikeIndex = 0; strikeIndex < enemyStrikeCount; strikeIndex += 1) {
      if (Math.random() < poisonChance) {
        appliedPoisonStacksToPlayer += 1;
      }
    }
    if (appliedPoisonStacksToPlayer > 0) {
      const poisonPerStack = Math.max(
        1,
        Math.floor(
          s.maxHp *
            Math.min(
              0.035,
              Math.max(0, Number(poisonMechanic.params?.basePctMaxHp || 0.012)) +
                currentTick * Math.max(0, Number(poisonMechanic.params?.rampPctPerTick || 0.0007))
            )
        )
      );
      nextEnemyRuntime.poisonStacksOnPlayer = Math.min(
        Math.max(1, Number(poisonMechanic.params?.maxStacks || 4)),
        Number(nextEnemyRuntime.poisonStacksOnPlayer || 0) + appliedPoisonStacksToPlayer
      );
      nextEnemyRuntime.poisonPerStackOnPlayer = Math.max(
        Number(nextEnemyRuntime.poisonPerStackOnPlayer || 0),
        poisonPerStack
      );
      nextEnemyRuntime.poisonTicksRemainingOnPlayer = Math.max(
        1,
        Number(poisonMechanic.params?.duration || 4)
      );
    }
  }
  const guardRetaliationDamage = Math.max(
    0,
    Math.floor(totalPreventedDamage * Math.max(0, Number(s.guardRetaliationRatio || 0)))
  );
  const thornsDamage = (tookDamage || blocked || totalPreventedDamage > 0)
    ? Math.max(
        0,
        Math.floor(
          (s.thorns || 0) +
            Math.floor(s.defense * ((s.thornsDefenseRatio || 0) + (effectMods.thornsDefenseRatio || 0))) +
            (effectMods.thornsFlat || 0) +
            guardRetaliationDamage
        )
      )
    : 0;
  const thornsAura = getBossMechanic(enemy, "thorns_aura");
  const thornsAuraFlat = Math.max(
    0,
    Math.floor((thornsAura?.runtime?.flatThorns || 0) * (1 - abyssPenaltyReduction))
  );
  const thornsAuraRatio = Math.max(
    0,
    Number(thornsAura?.runtime?.reflectRatio || 0) * (1 - abyssPenaltyReduction)
  );
  const nonMechanicThornsFlat = Math.max(0, enemyFlatThorns - thornsAuraFlat);
  const nonMechanicThornsRatio = Math.max(0, enemyThornsRatio - thornsAuraRatio);
  const reflectedToPlayer =
    playerDmg > 0
      ? (
        Math.floor(playerDmg * nonMechanicThornsRatio) +
        nonMechanicThornsFlat +
        applyMitigatedDamage(
          Math.floor(playerDmg * thornsAuraRatio) + thornsAuraFlat,
          bossMechanicMitigation
        )
      )
      : 0;
  const spellMirrorDamage =
    spellMirrorMechanic && s.isMage && playerDmg > 0
      ? applyMitigatedDamage(
        Math.max(1, Math.floor(playerDmg * Math.max(0, Number(spellMirrorMechanic.params?.reflectPct || 0.18)))),
        bossMechanicMitigation
      )
      : 0;
  newPlayerHp -= reflectedToPlayer + spellMirrorDamage;
  const tookAnyDamage = tookDamage || playerPoisonTickDamage > 0 || reflectedToPlayer > 0 || spellMirrorDamage > 0;
  const playerHpBeforePostImmediate = newPlayerHp;
  const directOutgoingDamage = playerDmg + thornsDamage;
  const totalOutgoingDamage = directOutgoingDamage + bleedTickDamage + voidFractureTickDamage;
  let newEnemyHp = enemyHpBeforeDamage - directOutgoingDamage;
  let phaseResetTriggered = false;
  if (
    phaseResetMechanic &&
    !nextEnemyRuntime.phaseResetUsed &&
    newEnemyHp / Math.max(1, enemy.maxHp) <= Math.max(0.05, Number(phaseResetMechanic.params?.triggerThreshold || 0.3))
  ) {
    phaseResetTriggered = true;
    nextEnemyRuntime.phaseResetUsed = true;
    newEnemyHp = Math.max(newEnemyHp, Math.floor(enemy.maxHp * Math.max(0.3, Number(phaseResetMechanic.params?.resetToPct || 0.6))));
    nextEnemyRuntime.bleedStacks = 0;
    nextEnemyRuntime.bleedPerStack = 0;
    nextEnemyRuntime.bleedTicksRemaining = 0;
    nextEnemyRuntime.fractureStacks = 0;
    nextEnemyRuntime.fractureTicksRemaining = 0;
    nextEnemyRuntime.voidFractureStacks = 0;
    nextEnemyRuntime.voidFracturePerStack = 0;
    nextEnemyRuntime.voidFractureTicksRemaining = 0;
    nextEnemyRuntime.markStacks = 0;
    nextEnemyRuntime.markTicksRemaining = 0;
    nextEnemyRuntime.flowStacks = 0;
    nextEnemyRuntime.mageFlowBonusMult = 1;
    nextEnemyRuntime.mageFlowHitsRemaining = 0;
    nextEnemyRuntime.mageMemoryStacks = 0;
    nextEnemyRuntime.mageTemporalFlowStacks = 0;
    nextEnemyRuntime.hasTakenPlayerHit = false;
    nextEnemyRuntime.openingHitSpent = false;
  }
  const lifestealReflectHeal =
    lifestealReflect && playerDmg > 0
      ? Math.max(1, Math.floor(playerDmg * Math.max(0, Number(lifestealReflect.params?.healPct || 0.16))))
      : 0;
  if (lifestealReflectHeal > 0) {
    newEnemyHp = Math.min(enemy.maxHp, newEnemyHp + lifestealReflectHeal);
  }
  const enemyKilled = newEnemyHp <= 0;
  const fortressPreventRatioThreshold = Math.max(
    0.18,
    0.34 - Number(s.fortress || 0) * 0.018 - Number(s.unmovingMountain || 0) * 0.02
  );
  const mitigatedHit =
    !evaded &&
    rawEnemyDmgTotal > 0 &&
    (
      blocked ||
      preventedDamageRatio >= fortressPreventRatioThreshold ||
      totalPreventedDamage >= Math.max(14, effectiveDefense * 0.18)
    );
  const heavyDamageTaken = tookDamage && enemyDmg >= Math.max(18, s.maxHp * 0.12);
  const evadeText = evaded ? " [EVADE]" : "";
  const blockText = blocked ? " [BLOCK]" : "";
  const thornsText = thornsDamage > 0 ? ` [ESPINAS ${thornsDamage}]` : "";
  const bleedText = bleedTickDamage > 0 ? ` [SANGRADO ${bleedTickDamage}]` : "";
  const voidFractureText = voidFractureTickDamage > 0 ? ` [FISURA ${voidFractureTickDamage}]` : "";
  const reflectText = reflectedToPlayer > 0 ? ` [REFLEJO ${reflectedToPlayer}]` : "";
  const poisonText = playerPoisonTickDamage > 0 ? ` [VENENO ${playerPoisonTickDamage}]` : "";
  const spellMirrorText = spellMirrorDamage > 0 ? ` [ESPEJO ${spellMirrorDamage}]` : "";
  const lifestealReflectText = lifestealReflectHeal > 0 ? ` [DRENA ${lifestealReflectHeal}]` : "";
  const phaseResetText = phaseResetTriggered ? " [RESET DE FASE]" : "";
  const fractureText =
    (nextEnemyRuntime.fractureStacks || 0) > 0
      ? ` [FRACTURA ${nextEnemyRuntime.fractureStacks}]`
      : "";
  const markText =
    (nextEnemyRuntime.markStacks || 0) > 0
      ? ` [MARCA ${nextEnemyRuntime.markStacks}]`
      : "";
  const mageFlowText =
    (nextEnemyRuntime.mageFlowHitsRemaining || 0) > 0
      ? ` [FLOW ${nextEnemyRuntime.mageFlowHitsRemaining}]`
      : "";
  const mageMemoryText =
    (nextEnemyRuntime.mageMemoryStacks || 0) > 0
      ? ` [MEMORIA ${nextEnemyRuntime.mageMemoryStacks}]`
      : "";
  const mageRampText =
    (nextEnemyRuntime.mageTemporalFlowStacks || 0) > 0
      ? ` [RAMPA ${nextEnemyRuntime.mageTemporalFlowStacks}]`
      : "";
  let survivalLog = null;
  let survivalLabel = "";
  let bloodPactGoldLoss = 0;
  const nextTriggerCounters = buildTriggerCounters(state.combat.triggerCounters, {
    didCrit,
    tookDamage: tookAnyDamage,
    enemyKilled,
    hitCount,
  });
  const snapshotDamage = state.combat.performanceSnapshot?.damagePerTick || 0;
  const tierPressure = Math.max(10, Math.round(12 + currentCombatTier * 10 + currentCombatTier * currentCombatTier * 1.5));
  const canAdvanceThisTick =
    !state.combat.autoAdvance &&
    currentCombatTier >= (state.combat.maxTier || 1) &&
    newPlayerHp / Math.max(1, s.maxHp) > 0.68 &&
    snapshotDamage > tierPressure;

  const { effects: postTriggerEffects, logs: postTriggerLogs } = processTriggerTalents({
    unlockedTalents,
    context: {
      sessionKills: enemyKilled
        ? (state.combat.sessionKills || 0) + 1
        : state.combat.sessionKills || 0,
      didCrit,
      playerHpPct: Math.max(0, newPlayerHp) / s.maxHp,
      tookDamage: tookAnyDamage,
      enemyKilled,
    },
    triggerStats: ["crit", "onKill", "onDamageTaken"],
  });
  const { immediate: postImmediateEffects, persistent: postPersistentEffects } =
    splitImmediateEffects(postTriggerEffects);
  const { effects: postLegendaryEffects, logs: postLegendaryLogs } = getLegendaryPostAttackEffects({
    player: state.player,
    enemy,
    didCrit,
    enemyKilled,
    tookDamage: tookAnyDamage,
    blocked,
  });

  const postTriggerModTotals = toModifierTotals(computeEffectModifiers(postImmediateEffects));
  const immediatePostTrigger = applyModifierTotals({
    playerHp: newPlayerHp,
    playerMaxHp: s.maxHp,
    playerGold: preImmediate.gold,
    totals: {
      ...postTriggerModTotals,
      lifestealPercentDamage:
        (postTriggerModTotals.lifestealPercentDamage || 0) +
        (s.lifesteal || 0) +
        (legendaryBonuses.lifesteal || 0) +
        (hasEnemyAffixes ? Math.max(0, Number(s.enemyAffixLifesteal || 0)) : 0),
    },
    context: {
      didCrit,
      enemyKilled,
      damageDealt: playerDmg,
    },
  });
  const hpAfterPostImmediate = immediatePostTrigger.hp;
  newPlayerHp = hpAfterPostImmediate;
  let playerGoldAfterCombat = immediatePostTrigger.gold;
  const postImmediateHeal = Math.max(0, hpAfterPostImmediate - playerHpBeforePostImmediate);
  if (newPlayerHp <= 0 && !nextEnemyRuntime.phaseSkinUsed && Math.max(0, Number(s.phaseSkin || 0)) > 0) {
    nextEnemyRuntime.phaseSkinUsed = true;
    newPlayerHp = 1;
    survivalLabel = " [PHASE]";
    survivalLog = "Phase Skin absorbe el golpe fatal.";
  } else if (newPlayerHp <= 0 && legendaryBonuses.bloodPact && !nextEnemyRuntime.bloodPactUsed) {
    nextEnemyRuntime.bloodPactUsed = true;
    const runGoldLoss = Math.max(0, Math.floor((state.combat.runStats?.gold || 0) * 0.3));
    const appliedGoldLoss = Math.min(playerGoldAfterCombat, runGoldLoss);
    bloodPactGoldLoss = appliedGoldLoss;
    playerGoldAfterCombat = sanitizeCurrencyValue(playerGoldAfterCombat - appliedGoldLoss, SAFE_RUNTIME_GOLD_CAP);
    newPlayerHp = 1;
    survivalLabel = " [PACTO]";
    survivalLog = `Pacto de Sangre evita la muerte y consume ${appliedGoldLoss} oro de la run.`;
  }
  const primaryDamageFloat = createCombatFloatEvent("damage", playerDmg, { crit: didCrit });
  const thornsDamageFloat = createCombatFloatEvent("thornsDamage", thornsDamage, { source: "thorns" });
  const nextFloatEvents = appendCombatFloatEvents(state.combat.floatEvents, [
    primaryDamageFloat,
    bleedTickDamage > 0 ? createCombatFloatEvent("damage", bleedTickDamage, { source: "bleed" }) : null,
    voidFractureTickDamage > 0 ? createCombatFloatEvent("damage", voidFractureTickDamage, { source: "void" }) : null,
    thornsDamageFloat,
    appliedRegen >= HEAL_FLOAT_THRESHOLD
      ? createCombatFloatEvent("heal", appliedRegen, { source: "regen" })
      : null,
    postImmediateHeal >= HEAL_FLOAT_THRESHOLD
      ? createCombatFloatEvent("heal", postImmediateHeal, { source: "lifesteal" })
      : null,
  ]);
  const runtimeEffects = [];
  if ((s.bloodDebt || 0) > 0 && postImmediateHeal >= HEAL_FLOAT_THRESHOLD) {
    runtimeEffects.push({
      duration: 4,
      source: "keystone",
      sourceId: "berserker_blood_debt",
      tags: ["keystone", "rage"],
      stackable: true,
      maxStacks: 2 + Math.max(1, Number(s.bloodDebt || 0)),
      modifiers: [
        { type: MOD_TYPES.DAMAGE_MULT, value: 1 + Number(s.bloodDebt || 0) * 0.01 },
        { type: MOD_TYPES.ATTACK_SPEED_FLAT, value: 0.003 + Number(s.bloodDebt || 0) * 0.003 },
      ],
    });
  }
  if ((s.fortress || 0) > 0 && mitigatedHit) {
    runtimeEffects.push({
      duration: 3,
      source: "talent",
      sourceId: "juggernaut_fortress_guard",
      tags: ["fortress"],
      stackable: true,
      maxStacks: 1 + Math.max(1, Number(s.fortress || 0)),
      modifiers: [{ type: MOD_TYPES.DAMAGE_MULT, value: 1 + Number(s.fortress || 0) * 0.006 }],
    });
  }
  if ((s.titanicMomentum || 0) > 0 && !heavyDamageTaken && newPlayerHp / s.maxHp >= 0.72) {
    runtimeEffects.push({
      duration: 5,
      source: "keystone",
      sourceId: "juggernaut_titanic_momentum",
      tags: ["keystone", "momentum"],
      stackable: true,
      maxStacks: 4 + Number(s.titanicMomentum || 0) * 2,
      modifiers: [
        { type: MOD_TYPES.DAMAGE_MULT, value: 1 + Number(s.titanicMomentumDamagePerStack || 0) },
        { type: MOD_TYPES.DEFENSE_MULT, value: 1 + Number(s.titanicMomentumDefensePerStack || 0) },
        { type: MOD_TYPES.ATTACK_SPEED_FLAT, value: Number(s.titanicMomentumAttackSpeedPerStack || 0) },
      ],
    });
  }
  const persistentEffects =
    (s.titanicMomentum || 0) > 0 && (heavyDamageTaken || newPlayerHp / s.maxHp < 0.58)
      ? activeEffects.filter(effect => effect?.sourceId !== "juggernaut_titanic_momentum")
      : activeEffects;
  const nextEffects = applyEffects(persistentEffects, [
    ...(postPersistentEffects || []),
    ...(postLegendaryEffects || []),
    ...runtimeEffects,
  ]);
  const momentumStacks = countEffectsBySourceId(nextEffects, "juggernaut_titanic_momentum");
  const flowStacks = Math.max(0, Number(nextEnemyRuntime.flowStacks || 0));

  if (newPlayerHp <= 0) {
    const expeditionDeathCount = Math.max(0, Number(state.expedition?.deathCount || 0));
    const expeditionDeathLimit = Math.max(1, Number(state.expedition?.deathLimit || EXPEDITION_DEATH_LIMIT));
    const nextExpeditionDeathCount = expeditionDeathCount + 1;
    const shouldEmergencyExtract = nextExpeditionDeathCount > expeditionDeathLimit;
    const lastRunSummary = buildLastRunSummary(state, enemy, "death");
    const nextAnalytics = {
      ...sessionAnalytics,
      ticks: (sessionAnalytics.ticks || 0) + 1,
      deaths: (sessionAnalytics.deaths || 0) + 1,
      couldAdvanceMoments: (sessionAnalytics.couldAdvanceMoments || 0) + (canAdvanceThisTick ? 1 : 0),
      readyToPushByTier: incrementMapValue(sessionAnalytics.readyToPushByTier, currentCombatTier, canAdvanceThisTick ? 1 : 0),
      deathsByTier: incrementMapValue(sessionAnalytics.deathsByTier, currentCombatTier, 1),
      timeInTier: incrementMapValue(sessionAnalytics.timeInTier, currentCombatTier, 1),
      damageDealt: (sessionAnalytics.damageDealt || 0) + totalOutgoingDamage,
      damageTaken: (sessionAnalytics.damageTaken || 0) + enemyDmg + reflectedToPlayer + spellMirrorDamage + playerPoisonTickDamage,
      maxTierReached: Math.max(sessionAnalytics.maxTierReached || 1, state.combat.maxTier || state.combat.currentTier || 1),
      maxLevelReached: Math.max(sessionAnalytics.maxLevelReached || 1, state.player.level || 1),
    };
    const previewState = {
      ...state,
      currentTab: "sanctuary",
      codex: sightedCodex,
      player: {
        ...state.player,
        hp: 0,
      },
      stats: {
        ...state.stats,
        deaths: (state.stats?.deaths || 0) + 1,
      },
      combat: {
        ...state.combat,
        analytics: nextAnalytics,
        lastRunSummary,
      },
    };

    if (!shouldEmergencyExtract) {
      let retreatTier = Math.max(1, Number(currentCombatTier || 1) - EXPEDITION_DEATH_TIER_RETREAT);
      if (retreatTier > 1 && retreatTier % 5 === 0) {
        retreatTier = Math.max(1, retreatTier - 1);
      }
      const retreatEnemy = spawnEnemy(retreatTier, state.combat?.runContext || createRunContext());
      const revivedHp = Math.max(1, Math.floor(s.maxHp * EXPEDITION_DEATH_REVIVE_HP_PCT));
      const remainingSafeDeaths = Math.max(0, expeditionDeathLimit - nextExpeditionDeathCount);

      return {
        ...previewState,
        codex: sightedCodex,
        currentTab: "combat",
        player: {
          ...previewState.player,
          hp: revivedHp,
        },
        combat: {
          ...state.combat,
          analytics: nextAnalytics,
          lastRunSummary,
          enemy: retreatEnemy,
          currentTier: retreatTier,
          autoAdvance: false,
          ticksInCurrentRun: 0,
          sessionKills: 0,
          effects: [],
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
          latestLootEvent: null,
          log: [
            ...state.combat.log,
            ...preTriggerLogs,
            ...preLegendaryLogs,
            ...postTriggerLogs,
            ...postLegendaryLogs,
            `Tu heroe cayo frente a ${enemy.name}, pero la expedicion sigue. Auto-avance apagado, retrocedes a T${retreatTier} y vuelves con ${revivedHp} HP. Quedan ${remainingSafeDeaths} margen(es) antes de una extraccion de emergencia.`,
          ].slice(-20),
        },
        expedition: {
          ...(state.expedition || {}),
          phase: "active",
          exitReason: null,
          deathCount: nextExpeditionDeathCount,
          deathLimit: expeditionDeathLimit,
          seenFamilyIds: appendSeenFamilyIds(state.expedition || {}, retreatEnemy),
          selectedCargoIds: [],
          selectedProjectItemId: null,
          extractionPreview: null,
        },
      };
    }

    const extractionPreview = buildExtractionPreview(previewState, { exitReason: "death" });
    const defaultCargoIds = (extractionPreview.cargoOptions || [])
      .slice(0, Math.max(0, Number(extractionPreview.availableSlots?.cargo || 0)))
      .map(option => option.id);
    return {
      ...previewState,
      codex: sightedCodex,
      combat: {
        ...state.combat,
        analytics: nextAnalytics,
        lastRunSummary,
        log: [
          ...state.combat.log,
          ...preTriggerLogs,
          ...preLegendaryLogs,
          ...postTriggerLogs,
          ...postLegendaryLogs,
          `Tu heroe cayo frente a ${enemy.name} por cuarta vez en esta expedicion. Se abre la extraccion de emergencia; al confirmar se arriesga un cuarto del oro.`,
        ].slice(-20),
      },
      expedition: {
        ...(state.expedition || {}),
        phase: "extraction",
        exitReason: "death",
        deathCount: nextExpeditionDeathCount,
        deathLimit: expeditionDeathLimit,
        extractionPreview,
        selectedCargoIds: defaultCargoIds,
        selectedProjectItemId: null,
      },
    };
  }

  if (newEnemyHp > 0) {
    const previousRunStats = state.combat.runStats || getEmptyRunStats();
    const nextAnalytics = {
      ...sessionAnalytics,
      ticks: (sessionAnalytics.ticks || 0) + 1,
      couldAdvanceMoments: (sessionAnalytics.couldAdvanceMoments || 0) + (canAdvanceThisTick ? 1 : 0),
      readyToPushByTier: incrementMapValue(sessionAnalytics.readyToPushByTier, currentCombatTier, canAdvanceThisTick ? 1 : 0),
      timeInTier: incrementMapValue(sessionAnalytics.timeInTier, currentCombatTier, 1),
      damageDealt: (sessionAnalytics.damageDealt || 0) + totalOutgoingDamage,
      damageTaken: (sessionAnalytics.damageTaken || 0) + enemyDmg + reflectedToPlayer + spellMirrorDamage + playerPoisonTickDamage,
      maxTierReached: Math.max(sessionAnalytics.maxTierReached || 1, state.combat.maxTier || state.combat.currentTier || 1),
      maxLevelReached: Math.max(sessionAnalytics.maxLevelReached || 1, state.player.level || 1),
    };
    const combatNotes = [
      bossShieldActive ? " [ESCUDO]" : "",
      consumedFirstCritShield ? " [CRIT ABSORBIDO]" : "",
      enemyRegenPerTick > 0 ? ` [REGEN ${enemyRegenPerTick}]` : "",
      lifestealReflectText,
      phaseResetText,
      bleedText,
      voidFractureText,
      fractureText,
      appliedBleedStacks > 0 ? ` [APLICA SANGRADO x${appliedBleedStacks}]` : "",
      appliedFractureStacks > 0 ? ` [APLICA FRACTURA x${appliedFractureStacks}]` : "",
      appliedVoidFractureStacks > 0 ? ` [APLICA FISURA x${appliedVoidFractureStacks}]` : "",
      voidStrikeHits > 0 ? ` [VOID STRIKE x${voidStrikeHits}]` : "",
      ignoreDefenseThisTick ? " [ARMOR SHRED]" : "",
      enemyStrikeCount > 1 ? " [DOBLE GOLPE]" : "",
      appliedPoisonStacksToPlayer > 0 ? ` [VENENO x${appliedPoisonStacksToPlayer}]` : "",
      reversedMarkStacks > 0 ? ` [REVERSION x${reversedMarkStacks}]` : "",
      markReversalDamage > 0 ? ` [REVERSAL ${markReversalDamage}]` : "",
      reflectText,
      spellMirrorText,
      poisonText,
      flowStacks > 0 ? ` [FLUJO ${flowStacks}]` : "",
      momentumStacks > 0 ? ` [MOMENTO ${momentumStacks}]` : "",
      markText,
      mageFlowText,
      mageMemoryText,
      mageRampText,
      appliedMarkStacks > 0 ? ` [APLICA MARCA x${appliedMarkStacks}]` : "",
    ].join("");

    return {
      ...state,
      codex: sightedCodex,
      player: { ...state.player, hp: newPlayerHp, gold: playerGoldAfterCombat },
      combat: {
        ...state.combat,
        effects: nextEffects,
        triggerCounters: nextTriggerCounters,
        pendingOnKillDamage: 0,
        pendingMageVolatileMult,
        floatEvents: nextFloatEvents,
        enemy: {
          ...enemy,
          hp: newEnemyHp,
          runtime: {
            ...nextEnemyRuntime,
            absorbFirstCritUsed: enemyRuntime.absorbFirstCritUsed || consumedFirstCritShield,
          },
        },
        ticksInCurrentRun: (state.combat.ticksInCurrentRun || 0) + 1,
        latestLootEvent: null,
        runStats: {
          ...previousRunStats,
          gold: Math.max(0, (previousRunStats.gold || 0) - bloodPactGoldLoss),
          damageDealt: (previousRunStats.damageDealt || 0) + totalOutgoingDamage,
        },
        performanceSnapshot: updatePerformanceSnapshot(
          state.combat.performanceSnapshot,
          {
            damagePerTick: totalOutgoingDamage,
            goldPerTick: 0,
            xpPerTick: 0,
            killsPerMinute: 0,
          }
        ),
        analytics: nextAnalytics,
        log: [
          ...state.combat.log,
          ...preTriggerLogs,
          ...preLegendaryLogs,
          ...postTriggerLogs,
          ...postLegendaryLogs,
          ...(phaseResetTriggered ? [`${enemy.name} reinicia la fase y vuelve a entrar a la pelea.`] : []),
          ...(survivalLog ? [survivalLog] : []),
          `Impactas por ${playerDmg}${comboText}${critText}${thornsText}${bleedText}${voidFractureText} - ${enemy.name}: ${Math.max(0, newEnemyHp)} HP | ${enemy.name} responde por ${enemyDmg}${evadeText}${blockText}${combatNotes} - vos: ${Math.max(0, newPlayerHp)} HP${survivalLabel}`,
        ].slice(-20),
      },
    };
  }

  const newSessionKills = (state.combat.sessionKills || 0) + 1;
  const { goldGained, xpGained, essenceGained, loot } = calculateRewards({
    enemy,
    playerStats: s,
    player: state.player,
    codex: sightedCodex,
    abyss: state.abyss,
    eventMods,
    prestige: state.prestige,
    isCrit: didCrit,
    unlockedTalents,
    runSigilId: activeRunSigilIds,
  });

  let newPlayer = {
    ...state.player,
    hp: newPlayerHp,
    xp: state.player.xp + xpGained,
    gold: sanitizeCurrencyValue(playerGoldAfterCombat + goldGained, SAFE_RUNTIME_GOLD_CAP),
    essence: sanitizeCurrencyValue((state.player.essence || 0) + essenceGained, SAFE_RUNTIME_ESSENCE_CAP),
  };

  if (!newPlayer.inventory) newPlayer.inventory = [];
  const activeBuildTag = getPlayerBuildTag(newPlayer);

  let lootText = "";
  let droppedText = "";
  let autoLootLog = "";
  const previousRunStats = state.combat.runStats || getEmptyRunStats();
  let bestDropName = previousRunStats.bestDropName || null;
  let bestDropRarity = previousRunStats.bestDropRarity || null;
  let bestDropHighlight = previousRunStats.bestDropHighlight || null;
  let bestDropPerfectRolls = previousRunStats.bestDropPerfectRolls || 0;
  let bestDropScore = previousRunStats.bestDropScore || 0;
  let lootStatsPatch = {};
  let latestLootEvent = null;
  let newlyUnlockedLegendaryPower = null;
  let legendaryPowerUnlocks = 0;
  let legendaryPowerDuplicates = 0;
  let autoSellGold = 0;
  let autoExtractEssence = 0;
  const nextKillFloatEvents = appendCombatFloatEvents(nextFloatEvents, [
    xpGained > 0 ? createCombatFloatEvent("xp", xpGained, { source: "xp" }) : null,
  ]);

  if (loot) {
    const previousPowerDiscoveries = Number(sightedCodex?.powerDiscoveries?.[loot.legendaryPowerId] || 0);
    const equippedItem = loot.type === "weapon" ? state.player.equipment?.weapon : state.player.equipment?.armor;
    latestLootEvent = summarizeLootEvent({
      item: loot,
      equippedItem,
      activeBuildTag,
      wishlistAffixes: lootRuleSet.wishlistAffixes,
      huntContext: enemy,
    });
    newlyUnlockedLegendaryPower =
      loot?.legendaryPowerId && !(state.codex?.powerDiscoveries?.[loot.legendaryPowerId] > 0)
        ? latestLootEvent?.legendaryPower || null
        : null;
    legendaryPowerUnlocks = loot?.legendaryPowerId && previousPowerDiscoveries <= 0 ? 1 : 0;
    legendaryPowerDuplicates = loot?.legendaryPowerId && previousPowerDiscoveries > 0 ? 1 : 0;
    const isProtectedDrop =
      (lootRuleSet.protectHuntedDrops && (
        (latestLootEvent?.wishlistMatches?.length || 0) > 0 ||
        !!latestLootEvent?.huntMatches?.isMatch
      )) ||
      (lootRuleSet.protectUpgradeDrops && (latestLootEvent?.ratingMargin || 0) > 0);
    const shouldAutoExtract = !isProtectedDrop && lootRuleSet.autoExtract.has(loot.rarity);
    const shouldAutoSell = !isProtectedDrop && !shouldAutoExtract && lootRuleSet.autoSell.has(loot.rarity);

    if (shouldAutoExtract) {
      const essenceFromLoot = getExtractYield(loot);
      newPlayer.essence = sanitizeCurrencyValue((newPlayer.essence || 0) + essenceFromLoot, SAFE_RUNTIME_ESSENCE_CAP);
      autoExtractEssence = essenceFromLoot;
      autoLootLog = ` [AUTO-EXTRACT ${loot.rarity}: +${essenceFromLoot} esencia]`;
      lootStatsPatch = {
        itemsExtracted: 1,
        autoExtractedItems: 1,
      };
    } else if (shouldAutoSell) {
      const sellValue = loot.sellValue || 0;
      newPlayer.gold = sanitizeCurrencyValue((newPlayer.gold || 0) + sellValue, SAFE_RUNTIME_GOLD_CAP);
      autoSellGold = sellValue;
      autoLootLog = ` [AUTO-SELL ${loot.rarity}: +${sellValue} oro]`;
      lootStatsPatch = {
        itemsSold: 1,
        autoSoldItems: 1,
      };
    } else {
      const result = addToInventory(newPlayer.inventory, loot, calcItemRating);
      newPlayer.inventory = result.inventory;
      lootText = ` - Encontraste: ${loot.name}`;
      if (result.droppedName) droppedText = ` (descartado: ${result.droppedName})`;
    }

    const candidateDropScore = Number(latestLootEvent?.score || 0);
    const isBetterBestDrop =
      candidateDropScore > bestDropScore ||
      (candidateDropScore === bestDropScore &&
        (RARITY_RANK[loot.rarity] || 0) >= (RARITY_RANK[bestDropRarity] || 0));

    if (isBetterBestDrop) {
      bestDropName = loot.name;
      bestDropRarity = loot.rarity;
      bestDropHighlight = latestLootEvent?.topHighlight || latestLootEvent?.highlight || null;
      bestDropPerfectRolls = latestLootEvent?.perfectRollCount || 0;
      bestDropScore = candidateDropScore;
    }
  }

  const levelBefore = state.player.level;
  newPlayer = applyLevelUp(newPlayer);

  const currentTier = currentCombatTier;
  const maxTier = Math.max(state.combat.maxTier || 1, currentTier);
  const autoAdvance = state.combat.autoAdvance || false;
  const unlockedTier = currentTier + 1;
  const nextTier = autoAdvance ? unlockedTier : currentTier;
  const newMaxTier = Math.max(maxTier, unlockedTier);

  const newStats = {
    ...state.stats,
    kills: (state.stats?.kills || 0) + 1,
    bossKills: (state.stats?.bossKills || 0) + (enemy.isBoss ? 1 : 0),
    itemsFound: (state.stats?.itemsFound || 0) + (loot ? 1 : 0),
    commonItemsFound: (state.stats?.commonItemsFound || 0) + (loot?.rarity === "common" ? 1 : 0),
    magicItemsFound: (state.stats?.magicItemsFound || 0) + (loot?.rarity === "magic" ? 1 : 0),
    rareItemsFound: (state.stats?.rareItemsFound || 0) + (loot?.rarity === "rare" ? 1 : 0),
    epicItemsFound: (state.stats?.epicItemsFound || 0) + (loot?.rarity === "epic" ? 1 : 0),
    legendaryItemsFound: (state.stats?.legendaryItemsFound || 0) + (loot?.rarity === "legendary" ? 1 : 0),
    perfectRollsFound:
      (state.stats?.perfectRollsFound || 0) +
      ((loot?.affixes || []).filter(affix => affix.perfectRoll).length || 0),
    t1AffixesFound:
      (state.stats?.t1AffixesFound || 0) +
      ((loot?.affixes || []).filter(affix => affix.tier === 1).length || 0),
    bestItemRating: Math.max(state.stats?.bestItemRating || 0, loot?.rating || calcItemRating(loot)),
    itemsSold: (state.stats?.itemsSold || 0) + (lootStatsPatch.itemsSold || 0),
    itemsExtracted: (state.stats?.itemsExtracted || 0) + (lootStatsPatch.itemsExtracted || 0),
    autoSoldItems: (state.stats?.autoSoldItems || 0) + (lootStatsPatch.autoSoldItems || 0),
    autoExtractedItems: (state.stats?.autoExtractedItems || 0) + (lootStatsPatch.autoExtractedItems || 0),
  };

  const nextAnalytics = {
    ...sessionAnalytics,
    ticks: (sessionAnalytics.ticks || 0) + 1,
    kills: (sessionAnalytics.kills || 0) + 1,
    bossKills: (sessionAnalytics.bossKills || 0) + (enemy.isBoss ? 1 : 0),
    couldAdvanceMoments: (sessionAnalytics.couldAdvanceMoments || 0) + (canAdvanceThisTick ? 1 : 0),
    readyToPushByTier: incrementMapValue(sessionAnalytics.readyToPushByTier, currentTier, canAdvanceThisTick ? 1 : 0),
    timeInTier: incrementMapValue(sessionAnalytics.timeInTier, currentTier, 1),
    killsByTier: incrementMapValue(sessionAnalytics.killsByTier, currentTier, 1),
    itemsByTier: incrementMapValue(sessionAnalytics.itemsByTier, currentTier, loot ? 1 : 0),
    goldByTier: incrementMapValue(sessionAnalytics.goldByTier, currentTier, goldGained + autoSellGold),
    xpByTier: incrementMapValue(sessionAnalytics.xpByTier, currentTier, xpGained),
    essenceByTier: incrementMapValue(sessionAnalytics.essenceByTier, currentTier, essenceGained + autoExtractEssence),
    xpEarned: (sessionAnalytics.xpEarned || 0) + xpGained,
    essenceEarned: (sessionAnalytics.essenceEarned || 0) + essenceGained + autoExtractEssence,
    goldEarned: (sessionAnalytics.goldEarned || 0) + goldGained + autoSellGold,
    goldBySource: {
      ...(sessionAnalytics.goldBySource || {}),
      combat: (sessionAnalytics.goldBySource?.combat || 0) + goldGained,
      autoSell: (sessionAnalytics.goldBySource?.autoSell || 0) + autoSellGold,
    },
    essenceBySource: {
      ...(sessionAnalytics.essenceBySource || {}),
      combat: (sessionAnalytics.essenceBySource?.combat || 0) + essenceGained,
      autoExtract: (sessionAnalytics.essenceBySource?.autoExtract || 0) + autoExtractEssence,
    },
    damageDealt: (sessionAnalytics.damageDealt || 0) + totalOutgoingDamage,
    damageTaken: (sessionAnalytics.damageTaken || 0) + enemyDmg + reflectedToPlayer + spellMirrorDamage + playerPoisonTickDamage,
    itemsFound: (sessionAnalytics.itemsFound || 0) + (loot ? 1 : 0),
    commonItemsFound: (sessionAnalytics.commonItemsFound || 0) + (loot?.rarity === "common" ? 1 : 0),
    magicItemsFound: (sessionAnalytics.magicItemsFound || 0) + (loot?.rarity === "magic" ? 1 : 0),
    rareItemsFound: (sessionAnalytics.rareItemsFound || 0) + (loot?.rarity === "rare" ? 1 : 0),
    epicItemsFound: (sessionAnalytics.epicItemsFound || 0) + (loot?.rarity === "epic" ? 1 : 0),
    legendaryItemsFound: (sessionAnalytics.legendaryItemsFound || 0) + (loot?.rarity === "legendary" ? 1 : 0),
    legendaryPowerUnlocks: (sessionAnalytics.legendaryPowerUnlocks || 0) + legendaryPowerUnlocks,
    legendaryPowerDuplicates: (sessionAnalytics.legendaryPowerDuplicates || 0) + legendaryPowerDuplicates,
    perfectRollsFound: (sessionAnalytics.perfectRollsFound || 0) + (((loot?.affixes || []).filter(affix => affix.perfectRoll).length) || 0),
    t1AffixesFound: (sessionAnalytics.t1AffixesFound || 0) + (((loot?.affixes || []).filter(affix => affix.tier === 1).length) || 0),
    perfectByTier: incrementMapValue(
      sessionAnalytics.perfectByTier,
      currentTier,
      ((loot?.affixes || []).filter(affix => affix.perfectRoll).length) || 0
    ),
    t1ByTier: incrementMapValue(
      sessionAnalytics.t1ByTier,
      currentTier,
      ((loot?.affixes || []).filter(affix => affix.tier === 1).length) || 0
    ),
    rarityByTier: loot
      ? incrementNestedMapValue(sessionAnalytics.rarityByTier, currentTier, loot.rarity, 1)
      : sessionAnalytics.rarityByTier,
    itemsSold: (sessionAnalytics.itemsSold || 0) + (lootStatsPatch.itemsSold ? 1 : 0),
    itemsExtracted: (sessionAnalytics.itemsExtracted || 0) + (lootStatsPatch.itemsExtracted ? 1 : 0),
    autoSoldItems: (sessionAnalytics.autoSoldItems || 0) + (lootStatsPatch.autoSoldItems || 0),
    autoExtractedItems: (sessionAnalytics.autoExtractedItems || 0) + (lootStatsPatch.autoExtractedItems || 0),
    maxTierReached: Math.max(sessionAnalytics.maxTierReached || 1, newMaxTier),
    maxLevelReached: Math.max(sessionAnalytics.maxLevelReached || 1, newPlayer.level || state.player.level || 1),
    firstRareTick:
      sessionAnalytics.firstRareTick == null && loot?.rarity === "rare"
        ? (sessionAnalytics.ticks || 0) + 1
        : sessionAnalytics.firstRareTick,
    firstEpicTick:
      sessionAnalytics.firstEpicTick == null && loot?.rarity === "epic"
        ? (sessionAnalytics.ticks || 0) + 1
        : sessionAnalytics.firstEpicTick,
    firstLegendaryTick:
      sessionAnalytics.firstLegendaryTick == null && loot?.rarity === "legendary"
        ? (sessionAnalytics.ticks || 0) + 1
        : sessionAnalytics.firstLegendaryTick,
    firstBossKillTick:
      sessionAnalytics.firstBossKillTick == null && enemy.isBoss
        ? (sessionAnalytics.ticks || 0) + 1
        : sessionAnalytics.firstBossKillTick,
    bestItemRating: Math.max(sessionAnalytics.bestItemRating || 0, loot?.rating || 0),
    bestDropName,
    bestDropRarity,
    bestDropHighlight: bestDropHighlight?.label || null,
    bestDropPerfectRolls,
    bestDropScore,
  };

  const { newAchievements, bonusGold, unlocked } = checkAchievements({
    ...state,
    player: newPlayer,
    stats: newStats,
    combat: { ...state.combat, maxTier: newMaxTier },
  });
  if (bonusGold > 0) newPlayer.gold += bonusGold;
  newPlayer.gold = sanitizeCurrencyValue(newPlayer.gold, SAFE_RUNTIME_GOLD_CAP);
  newPlayer.essence = sanitizeCurrencyValue(newPlayer.essence, SAFE_RUNTIME_ESSENCE_CAP);
  const achievementLogs = (unlocked || []).map(
    achievement => `LOGRO: ${achievement.name} +${achievement.reward || 0} oro`
  );

  const nextPrestigeCycle = createEmptyPrestigeCycleProgress({
    ...prestigeCycle,
    kills: (prestigeCycle.kills || 0) + 1,
    bossKills: (prestigeCycle.bossKills || 0) + (enemy.isBoss ? 1 : 0),
    maxTier: Math.max(prestigeCycle.maxTier || 1, newMaxTier),
    maxLevel: Math.max(prestigeCycle.maxLevel || 1, newPlayer.level || state.player.level || 1),
    bestItemRating: Math.max(prestigeCycle.bestItemRating || 0, loot?.rating || 0),
  });
  const codexAfterKill = recordCodexKill(sightedCodex, enemy, {
    familyGain: runSigilCodexModifiers.familyKillMult || 1,
    bossGain: runSigilCodexModifiers.bossKillMult || 1,
  });
  const legendaryDiscoveryGain =
    loot?.legendaryPowerId && Number(codexAfterKill?.powerDiscoveries?.[loot.legendaryPowerId] || 0) > 0
      ? runSigilCodexModifiers.duplicatePowerGainMult || 1
      : 1;
  const { codex: nextCodex, unlockedPower: unlockedPowerFromDrop } =
    recordLegendaryPowerDiscovery(codexAfterKill, loot, legendaryDiscoveryGain);
  newlyUnlockedLegendaryPower = unlockedPowerFromDrop || newlyUnlockedLegendaryPower;
  newPlayer = syncCodexBonuses(newPlayer, nextCodex);
  const transferredMarkStacks =
    (nextEnemyRuntime.markStacks || 0) > 0
      ? Math.max(
          0,
          Math.floor(
            Number(nextEnemyRuntime.markStacks || 0) *
              Math.max(0, Number(s.markTransferPct || 0) + Number(legendaryBonuses.markTransferPct || 0))
          )
        )
      : 0;
  const transferredMarkTicks =
    transferredMarkStacks > 0
      ? Math.max(1, Math.ceil(Math.max(1, Number(s.markDuration || 0)) * 0.75))
      : 0;
  const nextEnemyFlowHits = Math.max(0, Number(s.flowHits || 0) + Number(legendaryBonuses.flowHits || 0));
  const nextEnemyFlowBonusMult =
    nextEnemyFlowHits > 0 ? Math.max(1, Number(s.flowBonusMult || 1)) : 1;
  const preservedMageMemoryStacks =
    legendaryBonuses.preserveMemoryInAbyss && Number(enemy?.abyssDepth || 0) > 0
      ? Math.max(0, Number(nextEnemyRuntime.mageMemoryStacks || 0))
      : 0;
  const nextEnemy = hydrateSpawnedEnemy(spawnEnemy(nextTier, state.combat?.runContext), {
    markStacks: transferredMarkStacks,
    markTicksRemaining: transferredMarkTicks,
    mageFlowBonusMult: nextEnemyFlowBonusMult,
    mageFlowHitsRemaining: nextEnemyFlowHits,
    mageMemoryStacks: preservedMageMemoryStacks,
    hasTakenPlayerHit: false,
  });

  return {
    ...state,
    player: newPlayer,
    codex: nextCodex,
    stats: newStats,
    achievements: newAchievements,
    combat: {
      ...state.combat,
      effects: nextEffects,
      sessionKills: newSessionKills,
      triggerCounters: nextTriggerCounters,
      pendingOnKillDamage: s.damageOnKill || 0,
      pendingMageVolatileMult,
      floatEvents: nextKillFloatEvents,
      runStats: {
        kills: (previousRunStats.kills || 0) + 1,
        bossKills: (previousRunStats.bossKills || 0) + (enemy.isBoss ? 1 : 0),
        damageDealt: (previousRunStats.damageDealt || 0) + totalOutgoingDamage,
        gold: Math.max(0, (previousRunStats.gold || 0) - bloodPactGoldLoss) + goldGained,
        xp: (previousRunStats.xp || 0) + xpGained,
        essence: (previousRunStats.essence || 0) + essenceGained,
        items: (previousRunStats.items || 0) + (loot ? 1 : 0),
        bestDropName,
        bestDropRarity,
        bestDropHighlight,
        bestDropPerfectRolls,
        bestDropScore,
      },
      prestigeCycle: nextPrestigeCycle,
      performanceSnapshot: updatePerformanceSnapshot(
        state.combat.performanceSnapshot,
        {
          damagePerTick: totalOutgoingDamage,
          goldPerTick: goldGained,
          xpPerTick: xpGained,
          killsPerMinute: 60,
        }
      ),
      analytics: nextAnalytics,
      enemy: nextEnemy,
      currentTier: nextTier,
      maxTier: newMaxTier,
      autoAdvance,
      latestLootEvent,
      log: [
        ...state.combat.log,
        ...(survivalLog ? [survivalLog] : []),
        `${enemy.isBoss ? "Boss abatido" : "Victoria"} contra ${enemy.name}! +${goldGained} oro, +${xpGained} XP, +${essenceGained} esencia${lootText}${droppedText}${autoLootLog}${thornsText}${reflectText}${latestLootEvent?.highlight ? ` [${latestLootEvent.highlight.label.toUpperCase()}]` : ""}`,
        ...(newlyUnlockedLegendaryPower ? [`CODEX: desbloqueaste ${newlyUnlockedLegendaryPower.name}. Ya podes injertarlo al ascender a legendario.`] : []),
        ...achievementLogs,
        ...preTriggerLogs,
        ...preLegendaryLogs,
        ...postTriggerLogs,
        ...postLegendaryLogs,
      ].slice(-20),
    },
    expedition: {
      ...(state.expedition || {}),
      seenFamilyIds: appendSeenFamilyIds(state.expedition || {}, nextEnemy),
    },
  };
}
