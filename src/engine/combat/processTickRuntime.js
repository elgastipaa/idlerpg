import { applyActiveEvents, processEvents } from "../eventEngine";
import { spawnEnemy } from "./enemyEngine";
import { calcStats } from "./statEngine";
import { calculateRewards } from "../progression/rewards";
import { checkAchievements } from "../progression/achievementEngine";
import { processTriggerTalents } from "../talents/talentEngine";
import { processAutoSkills, reduceCooldowns } from "../skills/skillEngine";
import { applyLevelUp } from "../leveling";
import { SKILLS } from "../../data/skills";
import { ENEMIES } from "../../data/enemies";
import { addToInventory, calcItemRating } from "../inventory/inventoryEngine";
import { getPlayerBuildTag } from "../../utils/buildIdentity";
import {
  getLegendaryPostAttackEffects,
  getLegendaryPreAttackEffects,
  getLegendaryStaticBonuses,
} from "../../utils/legendaryPowers";
import { resolveLootRuleWishlist } from "../../utils/lootFilter";
import { summarizeLootEvent } from "../../utils/lootHighlights";
import { createEmptySessionAnalytics } from "../../utils/runTelemetry";
import { recordCodexKill, recordLegendaryPowerDiscovery, syncCodexBonuses } from "../progression/codexEngine";
import { createEmptyPrestigeCycleProgress } from "../progression/prestigeEngine";
import {
  tickEffects,
  applyEffects,
  computeEffectModifiers,
} from "../effects/effectEngine";
import { applyModifierTotals } from "../modifiers/modifierEngine";

const CRIT_CAP = 0.75;
const RARITY_RANK = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const EXTRACT_RARITY_TIER = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const PERFORMANCE_SMOOTHING = 0.18;
const FLOAT_EVENT_LIMIT = 8;
const HEAL_FLOAT_THRESHOLD = 3;
const SKILL_DPS_WINDOW_MS = 20000;
const SKILL_TIMELINE_LIMIT = 240;
const SAFE_RUNTIME_GOLD_CAP = 50_000_000;
const SAFE_RUNTIME_ESSENCE_CAP = 10_000_000;
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

function appendSkillDamageTimeline(previous = [], incoming = []) {
  const now = Date.now();
  const cutoff = now - SKILL_DPS_WINDOW_MS - 5000;
  const kept = (previous || []).filter(entry => (entry?.at || 0) >= cutoff);
  return [...kept, ...(incoming || []).filter(Boolean)].slice(-SKILL_TIMELINE_LIMIT);
}

export function processTick(state) {
  const enemy = state.combat.enemy;
  if (!enemy) return state;
  const lootRuleSet = buildLootRuleSet(state.settings?.lootRules, state.player, enemy);
  const enemyRuntime = enemy.runtime || {};
  const sessionAnalytics = getAnalyticsBase(state.combat.analytics);
  const prestigeCycle = createEmptyPrestigeCycleProgress(state.combat.prestigeCycle || {});
  const currentCombatTier = state.combat.currentTier || enemy.tier || 1;

  const { mods: eventMods, remaining: remainingEvents } = applyActiveEvents(state);
  const s = calcStats(state.player);
  const legendaryBonuses = getLegendaryStaticBonuses({ player: state.player, enemy, stats: s });
  const unlockedTalents = state.player.unlockedTalents || [];
  const baseCooldowns = reduceCooldowns(state.combat.skillCooldowns || {});

  const {
    extraDamage: skillExtraDamage,
    extraHeal: skillExtraHeal = 0,
    skillDamageEvents = [],
    logs: skillCastLogs,
    updatedCooldowns,
    effectsToApply,
  } = processAutoSkills({
    skills: SKILLS,
    player: state.player,
    playerStats: s,
    skillAutocasts: state.combat.skillAutocasts || {},
    cooldowns: baseCooldowns,
  });
  const { effects: preLegendaryEffects, logs: preLegendaryLogs } = getLegendaryPreAttackEffects({
    player: state.player,
    skillCastCount: skillCastLogs?.length || 0,
  });

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

  const totalAttackSpeed = Math.max(
    0,
    Math.min(0.95, (s.attackSpeed || 0) + (effectMods.attackSpeedFlat || 0) + (legendaryBonuses.attackSpeed || 0))
  );
  const hitCount = 1 + (Math.random() < totalAttackSpeed ? 1 : 0);
  const pendingOnKillDamage = state.combat.pendingOnKillDamage || 0;
  let playerDmg = 0;
  let didCrit = false;
  let consumedFirstCritShield = false;
  let firstHitDamage = 0;

  for (let hitIndex = 0; hitIndex < hitCount; hitIndex += 1) {
    const enemyHpAfterHits = Math.max(0, enemy.hp - playerDmg);
    const hitEnemyHpPct = enemyHpAfterHits / enemy.maxHp;
    let hitLowHpMult = 1;

    if (hitEnemyHpPct < 0.3) {
      if (unlockedTalents.includes("shadowblade_execution")) hitLowHpMult *= 1.5;
      if (unlockedTalents.includes("executioner_finish")) hitLowHpMult *= 1.6;
    }

    const rawCrit = !enemyCritImmune && Math.random() < effectiveCritChance;
    const bossAbsorbCrit =
      rawCrit &&
      hasBossMechanic(enemy, "absorb_first_crit") &&
      !enemyRuntime.absorbFirstCritUsed &&
      !consumedFirstCritShield;
    const hitCrit = rawCrit && !bossAbsorbCrit;
    const critMultiplier = hitCrit ? 2 + (s.critDamage || 0) + (legendaryBonuses.critDamage || 0) : 1;
    let hitDamage = Math.floor(
      (s.damage +
        (legendaryBonuses.damageFlat || 0) +
        (hitIndex === 0 ? skillExtraDamage : 0) +
        (effectMods.damageFlat || 0) +
        (hitIndex === 0 ? pendingOnKillDamage : 0)) *
        critMultiplier *
        (eventMods.damageMult || 1) *
        (effectMods.damageMult || 1) *
        (legendaryBonuses.damageMult || 1) *
        (effectMods.enemyDamageTakenMult || 1) *
        hitLowHpMult
    );
    hitDamage = Math.max(0, hitDamage - enemyFlatReduction);
    if (bossShieldActive && hitIndex === 0) hitDamage = 0;
    if (hitIndex === 0) firstHitDamage = hitDamage;

    playerDmg += hitDamage;
    if (hitCrit) didCrit = true;
    if (bossAbsorbCrit) consumedFirstCritShield = true;

    if (playerDmg >= enemy.hp) break;
  }

  const comboText = hitCount > 1 ? ` x${hitCount} golpes` : "";
  const critText = didCrit ? " [CRIT]" : "";
  const skillDamageTotal = skillExtraDamage > 0 ? firstHitDamage : 0;
  const enemyHpBeforeDamage = Math.min(enemy.maxHp, enemy.hp + enemyRegenPerTick);
  const armorShred = getBossMechanic(enemy, "armor_shred");
  const ignoreDefenseThisTick =
    !!armorShred && currentTick % (armorShred.params?.every || 6) === 0;
  const enemyDamageBase = evaded
    ? 0
    : Math.max(1, Math.floor(enemy.damage * enemyDamageMult * bossDamageMult) - (ignoreDefenseThisTick ? 0 : effectiveDefense));
  const blocked =
    !evaded &&
    enemyDamageBase > 0 &&
    Math.random() < Math.min(CRIT_CAP, Math.max(0, (s.blockChance || 0) + (legendaryBonuses.blockChance || 0)));
  const enemyDmg = blocked ? 0 : enemyDamageBase * enemyStrikeCount;
  const tookDamage = enemyDmg > 0;
  const hpAfterSkillHeal = Math.min(s.maxHp, preImmediate.hp + Math.max(0, skillExtraHeal));
  const appliedSkillHeal = Math.max(0, hpAfterSkillHeal - preImmediate.hp);
  const regenHp = Math.min(s.maxHp, hpAfterSkillHeal + regenAmount);
  const appliedRegen = Math.max(0, regenHp - hpAfterSkillHeal);
  let newPlayerHp = regenHp - enemyDmg;
  const thornsDamage = tookDamage ? Math.max(0, Math.floor((s.thorns || 0) + (effectMods.thornsFlat || 0))) : 0;
  const reflectedToPlayer =
    playerDmg > 0
      ? Math.floor(playerDmg * enemyThornsRatio) + enemyFlatThorns
      : 0;
  newPlayerHp -= reflectedToPlayer;
  const playerHpBeforePostImmediate = newPlayerHp;
  const totalOutgoingDamage = playerDmg + thornsDamage;
  const newEnemyHp = enemyHpBeforeDamage - totalOutgoingDamage;
  const enemyKilled = newEnemyHp <= 0;
  const evadeText = evaded ? " [EVADE]" : "";
  const blockText = blocked ? " [BLOCK]" : "";
  const thornsText = thornsDamage > 0 ? ` [ESPINAS ${thornsDamage}]` : "";
  const reflectText = reflectedToPlayer > 0 ? ` [REFLEJO ${reflectedToPlayer}]` : "";
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
  const skillDamageFloat =
    skillDamageTotal > 0 && skillDamageTotal !== playerDmg
      ? createCombatFloatEvent("skillDamage", skillDamageTotal, { source: "skill" })
      : null;
  const thornsDamageFloat = createCombatFloatEvent("thornsDamage", thornsDamage, { source: "thorns" });
  const nextFloatEvents = appendCombatFloatEvents(state.combat.floatEvents, [
    primaryDamageFloat,
    skillDamageFloat,
    thornsDamageFloat,
    appliedSkillHeal >= HEAL_FLOAT_THRESHOLD
      ? createCombatFloatEvent("skillHeal", appliedSkillHeal, { source: "skill" })
      : null,
    appliedRegen >= HEAL_FLOAT_THRESHOLD
      ? createCombatFloatEvent("heal", appliedRegen, { source: "regen" })
      : null,
    postImmediateHeal >= HEAL_FLOAT_THRESHOLD
      ? createCombatFloatEvent("heal", postImmediateHeal, { source: "lifesteal" })
      : null,
  ]);
  const nextSkillDamageTimeline = appendSkillDamageTimeline(
    state.combat.skillDamageTimeline,
    skillDamageEvents
  );
  const nextEffects = applyEffects(activeEffects, [...(postPersistentEffects || []), ...(postLegendaryEffects || [])]);

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
      autoSkillCasts: (sessionAnalytics.autoSkillCasts || 0) + ((effectsToApply?.length || 0) > 0 || skillExtraDamage > 0 || skillExtraHeal > 0 ? (skillCastLogs?.length || 0) : 0),
      autoSkillBonusDamage: (sessionAnalytics.autoSkillBonusDamage || 0) + Math.max(0, skillExtraDamage || 0),
      maxTierReached: Math.max(sessionAnalytics.maxTierReached || 1, state.combat.maxTier || state.combat.currentTier || 1),
      maxLevelReached: Math.max(sessionAnalytics.maxLevelReached || 1, state.player.level || 1),
    };
    return {
      ...state,
      player: {
        ...state.player,
        hp: s.maxHp,
        gold: sanitizeCurrencyValue(Math.floor((state.player.gold || 0) * 0.5), SAFE_RUNTIME_GOLD_CAP),
      },
      stats: {
        ...state.stats,
        deaths: (state.stats?.deaths || 0) + 1,
      },
      combat: {
        ...state.combat,
        enemy: spawnEnemy(1),
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
        floatEvents: [],
        skillDamageTimeline: [],
        lastRunTier: state.combat.maxTier || state.combat.currentTier || 1,
        skillCooldowns: updatedCooldowns,
        activeEvents: [],
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
          `Tu heroe cayo frente a ${enemy.name}. La run termino y perdiste la mitad del oro.`,
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
      autoSkillCasts: (sessionAnalytics.autoSkillCasts || 0) + ((effectsToApply?.length || 0) > 0 || skillExtraDamage > 0 || skillExtraHeal > 0 ? (skillCastLogs?.length || 0) : 0),
      autoSkillBonusDamage: (sessionAnalytics.autoSkillBonusDamage || 0) + Math.max(0, skillExtraDamage || 0),
    };
    const combatNotes = [
      bossShieldActive ? " [ESCUDO]" : "",
      consumedFirstCritShield ? " [CRIT ABSORBIDO]" : "",
      enemyRegenPerTick > 0 ? ` [REGEN ${enemyRegenPerTick}]` : "",
      ignoreDefenseThisTick ? " [ARMOR SHRED]" : "",
      enemyStrikeCount > 1 ? " [DOBLE GOLPE]" : "",
      reflectText,
    ].join("");

    return {
      ...state,
      player: { ...state.player, hp: newPlayerHp },
      combat: {
        ...state.combat,
        skillCooldowns: updatedCooldowns,
        effects: nextEffects,
        activeEvents: remainingEvents,
        triggerCounters: nextTriggerCounters,
        pendingOnKillDamage: 0,
        floatEvents: nextFloatEvents,
        skillDamageTimeline: nextSkillDamageTimeline,
        enemy: {
          ...enemy,
          hp: newEnemyHp,
          runtime: {
            ...enemyRuntime,
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
          ...skillCastLogs,
          ...postTriggerLogs,
          ...postLegendaryLogs,
          `Impactas por ${playerDmg}${comboText}${critText}${thornsText} - ${enemy.name}: ${Math.max(0, newEnemyHp)} HP | ${enemy.name} responde por ${enemyDmg}${evadeText}${blockText}${combatNotes} - vos: ${Math.max(0, newPlayerHp)} HP`,
        ].slice(-20),
      },
    };
  }

  const newSessionKills = (state.combat.sessionKills || 0) + 1;
  const { goldGained, xpGained, essenceGained, loot } = calculateRewards({
    enemy,
    playerStats: s,
    player: state.player,
    codex: state.codex,
    eventMods,
    prestige: state.prestige,
    isCrit: didCrit,
    unlockedTalents,
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

  if (loot) {
    const previousPowerDiscoveries = Number(state.codex?.powerDiscoveries?.[loot.legendaryPowerId] || 0);
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
    autoSkillCasts: (sessionAnalytics.autoSkillCasts || 0) + ((effectsToApply?.length || 0) > 0 || skillExtraDamage > 0 || skillExtraHeal > 0 ? (skillCastLogs?.length || 0) : 0),
    autoSkillBonusDamage: (sessionAnalytics.autoSkillBonusDamage || 0) + Math.max(0, skillExtraDamage || 0),
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

  let { newPlayer: playerAfterEvents, newActiveEvents, logs: eventLogs } = processEvents(
    "onKill",
    {
      ...state,
      player: newPlayer,
      combat: { ...state.combat, activeEvents: remainingEvents },
    }
  );
  newPlayer = playerAfterEvents;

  if (newPlayer.level > levelBefore) {
    const { newPlayer: p2, newActiveEvents: ev2, logs: lvlLogs } = processEvents(
      "onLevelUp",
      {
        ...state,
        player: newPlayer,
        combat: { ...state.combat, activeEvents: newActiveEvents },
      }
    );
    newPlayer = p2;
    newActiveEvents = ev2;
    eventLogs = [...eventLogs, ...lvlLogs];
  }

  if (enemy.isBoss) {
    const { newPlayer: p3, newActiveEvents: ev3, logs: bossLogs } = processEvents(
      "onBoss",
      {
        ...state,
        player: newPlayer,
        combat: { ...state.combat, activeEvents: newActiveEvents },
      }
    );
    newPlayer = p3;
    newActiveEvents = ev3;
    eventLogs = [...eventLogs, ...bossLogs];
  }

  const nextPrestigeCycle = createEmptyPrestigeCycleProgress({
    ...prestigeCycle,
    kills: (prestigeCycle.kills || 0) + 1,
    bossKills: (prestigeCycle.bossKills || 0) + (enemy.isBoss ? 1 : 0),
    maxTier: Math.max(prestigeCycle.maxTier || 1, newMaxTier),
    maxLevel: Math.max(prestigeCycle.maxLevel || 1, newPlayer.level || state.player.level || 1),
    bestItemRating: Math.max(prestigeCycle.bestItemRating || 0, loot?.rating || 0),
  });
  const codexAfterKill = recordCodexKill(state.codex || {}, enemy);
  const { codex: nextCodex, unlockedPower: unlockedPowerFromDrop } = recordLegendaryPowerDiscovery(codexAfterKill, loot);
  newlyUnlockedLegendaryPower = unlockedPowerFromDrop || newlyUnlockedLegendaryPower;
  newPlayer = syncCodexBonuses(newPlayer, nextCodex);

  return {
    ...state,
    player: newPlayer,
    codex: nextCodex,
    stats: newStats,
    achievements: newAchievements,
    combat: {
      ...state.combat,
      skillCooldowns: updatedCooldowns,
      activeEvents: newActiveEvents,
      effects: nextEffects,
      sessionKills: newSessionKills,
      triggerCounters: nextTriggerCounters,
      pendingOnKillDamage: s.damageOnKill || 0,
      floatEvents: nextFloatEvents,
      skillDamageTimeline: nextSkillDamageTimeline,
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
      enemy: spawnEnemy(nextTier),
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
        ...skillCastLogs,
        ...eventLogs,
      ].slice(-20),
    },
  };
}
