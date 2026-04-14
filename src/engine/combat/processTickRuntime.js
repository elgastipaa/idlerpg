import { spawnEnemy } from "./enemyEngine";
import { calcStats } from "./statEngine";
import { calculateRewards } from "../progression/rewards";
import { checkAchievements } from "../progression/achievementEngine";
import { processTriggerTalents } from "../talents/talentEngine";
import { applyLevelUp } from "../leveling";
import { ENEMIES } from "../../data/enemies";
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
const FRACTURE_DEFENSE_REDUCTION_PER_STACK = 0.1;
const ENEMY_DEFENSE_SCALING = 260;
let floatEventSequence = 0;

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
      fractureStacks: 0,
      fractureTicksRemaining: 0,
      flowStacks: 0,
      markStacks: 0,
      markTicksRemaining: 0,
      mageFlowBonusMult: 1,
      mageFlowHitsRemaining: 0,
      mageMemoryStacks: 0,
      mageTemporalFlowStacks: 0,
      ...(enemy.runtime || {}),
      ...(runtimePatch || {}),
    },
  };
}

export function processTick(state) {
  if (state.combat?.pendingRunSetup) return state;
  const enemy = state.combat.enemy;
  if (!enemy) return state;
  const activeRunSigilId = state.combat?.activeRunSigilId || "free";
  const runSigilCodexModifiers = getRunSigilCodexModifiers(activeRunSigilId);
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
  const legendaryBonuses = getLegendaryStaticBonuses({ player: state.player, enemy, stats: s });
  const unlockedTalents = state.player.unlockedTalents || [];
  const effectsToApply = [];
  const preLegendaryEffects = [];
  const preLegendaryLogs = [];

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
    (1 + (s.regen || 0) + (hasClericBlessing ? 5 : 0) + (effectMods.regen || 0) + (legendaryBonuses.regen || 0)) *
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
  const enemyRegenPerTick = Math.max(0, enemyRuntime.regenPerTick || 0);
  const enemyFlatReduction = Math.max(0, enemyRuntime.flatDamageReduction || 0);
  const enemyFlatThorns = Math.max(0, enemyRuntime.flatThorns || 0);
  const enemyThornsRatio = Math.max(0, enemyRuntime.reflectRatio || 0);
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
  const nextEnemyRuntime = {
    ...enemyRuntime,
    bleedTicksRemaining:
      Math.max(0, Number(enemyRuntime.bleedTicksRemaining || 0) - (statusBleedTickDamage > 0 ? 1 : 0)),
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
    mageFlowBonusMult: Math.max(1, Number(enemyRuntime.mageFlowBonusMult || 1)),
    mageFlowHitsRemaining: Math.max(0, Number(enemyRuntime.mageFlowHitsRemaining || 0)),
    mageMemoryStacks: Math.max(0, Number(enemyRuntime.mageMemoryStacks || 0)),
    mageTemporalFlowStacks: Math.max(0, Number(enemyRuntime.mageTemporalFlowStacks || 0)),
    hasTakenPlayerHit: !!enemyRuntime.hasTakenPlayerHit,
  };
  if ((nextEnemyRuntime.bleedTicksRemaining || 0) <= 0) {
    nextEnemyRuntime.bleedStacks = 0;
    nextEnemyRuntime.bleedPerStack = 0;
  }
  if ((nextEnemyRuntime.fractureTicksRemaining || 0) <= 0) {
    nextEnemyRuntime.fractureStacks = 0;
  }
  if ((nextEnemyRuntime.markTicksRemaining || 0) <= 0) {
    nextEnemyRuntime.markStacks = 0;
  }
  if ((nextEnemyRuntime.mageFlowHitsRemaining || 0) <= 0) {
    nextEnemyRuntime.mageFlowBonusMult = 1;
  }

  const bleedTickDamage = statusBleedTickDamage;
  const enemyHpAfterStatuses = Math.max(
    0,
    Math.min(enemy.maxHp, enemy.hp - bleedTickDamage + enemyRegenPerTick)
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
  const pendingOnKillDamage = state.combat.pendingOnKillDamage || 0;
  const totalBleedChance = Math.max(0, Math.min(CRIT_CAP, s.bleedChance || 0));
  const totalBleedDamage = Math.max(0, s.bleedDamage || 0);
  const totalFractureChance = Math.max(0, Math.min(CRIT_CAP, s.fractureChance || 0));
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
      const enemyDefenseMultiplier = getEnemyDefenseMultiplier(fracturedDefense);
      const openingHitMultiplier =
        hitIndex === 0 && openingHitPending
          ? Math.max(1, s.openingHitDamageMult || 1)
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
          absoluteControlMult *
          freshTargetMult *
          mageFlowMult *
          volatileMult *
          rangeRoll *
          Math.max(0.7, Number(s.cataclysmSustainMult || 1)) *
          overchannelChainPenalty *
          (hitIndex > 0
            ? Math.max(0.35, Number(s.multiHitDamageMult || 1) + Number(legendaryBonuses.multiHitDamageMult || 0))
            : 1) *
          hitLowHpMult *
          enemyDefenseMultiplier
      );
      hitDamage = Math.max(0, hitDamage - enemyFlatReduction);
      if (bossShieldActive && hitIndex === 0) hitDamage = 0;
      if (hitIndex === 0 && hitDamage > 0 && openingHitPending) {
        nextEnemyRuntime.openingHitSpent = true;
      }

      playerDmg += hitDamage;
      if (hitCrit) didCrit = true;
      if (bossAbsorbCrit) consumedFirstCritShield = true;
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
  const ignoreDefenseThisTick =
    !!armorShred && currentTick % (armorShred.params?.every || 6) === 0;
  const enemyDamageBase = enemyHpBeforeDamage <= 0
    ? 0
    : evaded
    ? 0
    : Math.max(1, Math.floor(enemy.damage * enemyDamageMult * bossDamageMult) - (ignoreDefenseThisTick ? 0 : effectiveDefense));
  const blocked =
    !evaded &&
    enemyDamageBase > 0 &&
    Math.random() < Math.min(CRIT_CAP, Math.max(0, (s.blockChance || 0) + (legendaryBonuses.blockChance || 0)));
  const enemyDmg = blocked ? 0 : enemyDamageBase * enemyStrikeCount;
  const tookDamage = enemyDmg > 0;
  const regenHp = Math.min(s.maxHp, preImmediate.hp + regenAmount);
  const appliedRegen = Math.max(0, regenHp - preImmediate.hp);
  let newPlayerHp = regenHp - enemyDmg;
  const thornsDamage = tookDamage ? Math.max(0, Math.floor((s.thorns || 0) + (effectMods.thornsFlat || 0))) : 0;
  const reflectedToPlayer =
    playerDmg > 0
      ? Math.floor(playerDmg * enemyThornsRatio) + enemyFlatThorns
      : 0;
  newPlayerHp -= reflectedToPlayer;
  const playerHpBeforePostImmediate = newPlayerHp;
  const directOutgoingDamage = playerDmg + thornsDamage;
  const totalOutgoingDamage = directOutgoingDamage + bleedTickDamage;
  const newEnemyHp = enemyHpBeforeDamage - directOutgoingDamage;
  const enemyKilled = newEnemyHp <= 0;
  const mitigatedHit =
    !evaded &&
    enemyDamageBase > 0 &&
    (blocked || enemyDmg <= Math.max(12, effectiveDefense * 0.22));
  const heavyDamageTaken = tookDamage && enemyDmg >= Math.max(18, s.maxHp * 0.12);
  const evadeText = evaded ? " [EVADE]" : "";
  const blockText = blocked ? " [BLOCK]" : "";
  const thornsText = thornsDamage > 0 ? ` [ESPINAS ${thornsDamage}]` : "";
  const bleedText = bleedTickDamage > 0 ? ` [SANGRADO ${bleedTickDamage}]` : "";
  const reflectText = reflectedToPlayer > 0 ? ` [REFLEJO ${reflectedToPlayer}]` : "";
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
  const nextTriggerCounters = buildTriggerCounters(state.combat.triggerCounters, {
    didCrit,
    tookDamage,
    enemyKilled,
    hitCount,
  });
  const snapshotDamage = state.combat.performanceSnapshot?.damagePerTick || 0;
  const tierPressure = Math.max(10, Math.round(12 + currentCombatTier * 10 + currentCombatTier * currentCombatTier * 1.5));
  const canAdvanceThisTick =
    !state.combat.autoAdvance &&
    currentCombatTier < ENEMIES.length &&
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
      tookDamage,
      enemyKilled,
    },
    triggerStats: ["crit", "onKill", "onDamageTaken"],
  });
  const { immediate: postImmediateEffects, persistent: postPersistentEffects } =
    splitImmediateEffects(postTriggerEffects);
  const { effects: postLegendaryEffects, logs: postLegendaryLogs } = getLegendaryPostAttackEffects({
    player: state.player,
    didCrit,
    enemyKilled,
    tookDamage,
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
        (postTriggerModTotals.lifestealPercentDamage || 0) + (s.lifesteal || 0) + (legendaryBonuses.lifesteal || 0),
    },
    context: {
      didCrit,
      enemyKilled,
      damageDealt: playerDmg,
    },
  });
  newPlayerHp = immediatePostTrigger.hp;
  const postImmediateHeal = Math.max(0, newPlayerHp - playerHpBeforePostImmediate);
  const primaryDamageFloat = createCombatFloatEvent("damage", playerDmg, { crit: didCrit });
  const thornsDamageFloat = createCombatFloatEvent("thornsDamage", thornsDamage, { source: "thorns" });
  const nextFloatEvents = appendCombatFloatEvents(state.combat.floatEvents, [
    primaryDamageFloat,
    bleedTickDamage > 0 ? createCombatFloatEvent("damage", bleedTickDamage, { source: "bleed" }) : null,
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
  if ((s.titanicMomentum || 0) > 0 && !heavyDamageTaken && newPlayerHp / s.maxHp >= 0.85) {
    runtimeEffects.push({
      duration: 4,
      source: "keystone",
      sourceId: "juggernaut_titanic_momentum",
      tags: ["keystone", "momentum"],
      stackable: true,
      maxStacks: 3 + Number(s.titanicMomentum || 0) * 2,
      modifiers: [
        { type: MOD_TYPES.DAMAGE_MULT, value: 1 + Number(s.titanicMomentum || 0) * 0.004 },
        { type: MOD_TYPES.DEFENSE_MULT, value: 1 + Number(s.titanicMomentum || 0) * 0.004 },
      ],
    });
  }
  const persistentEffects =
    (s.titanicMomentum || 0) > 0 && (heavyDamageTaken || newPlayerHp / s.maxHp < 0.72)
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
      damageTaken: (sessionAnalytics.damageTaken || 0) + enemyDmg + reflectedToPlayer,
      maxTierReached: Math.max(sessionAnalytics.maxTierReached || 1, state.combat.maxTier || state.combat.currentTier || 1),
      maxLevelReached: Math.max(sessionAnalytics.maxLevelReached || 1, state.player.level || 1),
    };
    return {
      ...state,
      codex: sightedCodex,
      player: {
        ...state.player,
        hp: s.maxHp,
        gold: sanitizeCurrencyValue(Math.floor((state.player.gold || 0) * 0.75), SAFE_RUNTIME_GOLD_CAP),
      },
      stats: {
        ...state.stats,
        deaths: (state.stats?.deaths || 0) + 1,
      },
      combat: {
        ...state.combat,
        enemy: hydrateSpawnedEnemy(spawnEnemy(1)),
        currentTier: 1,
        effects: [],
        autoAdvance: false,
        ticksInCurrentRun: 0,
        sessionKills: 0,
        triggerCounters: {
          kills: 0,
          onHit: 0,
          crit: 0,
          onDamageTaken: 0,
        },
        pendingOnKillDamage: 0,
        pendingMageVolatileMult: 1,
        floatEvents: [],
        lastRunTier: state.combat.maxTier || state.combat.currentTier || 1,
        runStats: getEmptyRunStats(),
        prestigeCycle,
        performanceSnapshot: getEmptyPerformanceSnapshot(),
        analytics: nextAnalytics,
        lastRunSummary,
        latestLootEvent: null,
        log: [
          ...state.combat.log,
          ...preTriggerLogs,
          ...preLegendaryLogs,
          ...postTriggerLogs,
          ...postLegendaryLogs,
          `Tu heroe cayo frente a ${enemy.name}. La run termino y perdiste un cuarto del oro.`,
        ].slice(-20),
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
      damageTaken: (sessionAnalytics.damageTaken || 0) + enemyDmg + reflectedToPlayer,
      maxTierReached: Math.max(sessionAnalytics.maxTierReached || 1, state.combat.maxTier || state.combat.currentTier || 1),
      maxLevelReached: Math.max(sessionAnalytics.maxLevelReached || 1, state.player.level || 1),
    };
    const combatNotes = [
      bossShieldActive ? " [ESCUDO]" : "",
      consumedFirstCritShield ? " [CRIT ABSORBIDO]" : "",
      enemyRegenPerTick > 0 ? ` [REGEN ${enemyRegenPerTick}]` : "",
      bleedText,
      fractureText,
      appliedBleedStacks > 0 ? ` [APLICA SANGRADO x${appliedBleedStacks}]` : "",
      appliedFractureStacks > 0 ? ` [APLICA FRACTURA x${appliedFractureStacks}]` : "",
      ignoreDefenseThisTick ? " [ARMOR SHRED]" : "",
      enemyStrikeCount > 1 ? " [DOBLE GOLPE]" : "",
      reflectText,
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
      player: { ...state.player, hp: newPlayerHp },
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
          `Impactas por ${playerDmg}${comboText}${critText}${thornsText}${bleedText} - ${enemy.name}: ${Math.max(0, newEnemyHp)} HP | ${enemy.name} responde por ${enemyDmg}${evadeText}${blockText}${combatNotes} - vos: ${Math.max(0, newPlayerHp)} HP`,
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
    eventMods,
    prestige: state.prestige,
    isCrit: didCrit,
    unlockedTalents,
    runSigilId: activeRunSigilId,
  });

  let newPlayer = {
    ...state.player,
    hp: newPlayerHp,
    xp: state.player.xp + xpGained,
    gold: sanitizeCurrencyValue(immediatePostTrigger.gold + goldGained, SAFE_RUNTIME_GOLD_CAP),
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
  const maxPossible = ENEMIES.length;
  const unlockedTier = Math.min(currentTier + 1, maxPossible);
  const nextTier = autoAdvance ? unlockedTier : currentTier;
  const newMaxTier = Math.min(Math.max(maxTier, unlockedTier), maxPossible);

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
    damageTaken: (sessionAnalytics.damageTaken || 0) + enemyDmg + reflectedToPlayer,
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
  const nextEnemy = hydrateSpawnedEnemy(spawnEnemy(nextTier), {
    markStacks: transferredMarkStacks,
    markTicksRemaining: transferredMarkTicks,
    mageFlowBonusMult: nextEnemyFlowBonusMult,
    mageFlowHitsRemaining: nextEnemyFlowHits,
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
        damageDealt: (previousRunStats.damageDealt || 0) + totalOutgoingDamage,
        gold: (previousRunStats.gold || 0) + goldGained,
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
        `${enemy.isBoss ? "Boss abatido" : "Victoria"} contra ${enemy.name}! +${goldGained} oro, +${xpGained} XP, +${essenceGained} esencia${lootText}${droppedText}${autoLootLog}${thornsText}${reflectText}${latestLootEvent?.highlight ? ` [${latestLootEvent.highlight.label.toUpperCase()}]` : ""}`,
        ...(newlyUnlockedLegendaryPower ? [`CODEX: desbloqueaste ${newlyUnlockedLegendaryPower.name}. Ya podes injertarlo al ascender a legendario.`] : []),
        ...achievementLogs,
        ...preTriggerLogs,
        ...preLegendaryLogs,
        ...postTriggerLogs,
        ...postLegendaryLogs,
      ].slice(-20),
    },
  };
}
