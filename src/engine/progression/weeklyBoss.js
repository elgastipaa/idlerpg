import { BOSS_MECHANICS } from "../../data/encounters";
import { BOSSES } from "../../data/bosses";

const WEEKLY_BOSS_ATTEMPT_LIMIT = 3;
const WEEKLY_BOSS_RESET_MS = 22 * 60 * 60 * 1000;

const WEEKLY_BOSS_DIFFICULTIES = [
  {
    id: "normal",
    label: "Normal",
    requiredPower: 34,
    reward: { gold: 300, essence: 20, codexInk: 18, relicDust: 1, sigilFlux: 1 },
    mutation: "Sin mutacion extra.",
    segmentCount: 2,
    hpMultiplier: 2.3,
    damageMultiplier: 0.62,
    defenseMultiplier: 1.08,
    mechanicIntensity: 1.02,
  },
  {
    id: "veterano",
    label: "Veterano",
    requiredPower: 48,
    reward: { gold: 560, essence: 36, codexInk: 26, relicDust: 2, sigilFlux: 2 },
    mutation: "Mutacion: el boss entra en furia y sube su dano en la segunda mitad.",
    segmentCount: 3,
    hpMultiplier: 2.7,
    damageMultiplier: 0.7,
    defenseMultiplier: 1.16,
    mechanicIntensity: 1.16,
  },
  {
    id: "elite",
    label: "Elite",
    requiredPower: 62,
    reward: { gold: 900, essence: 56, codexInk: 36, relicDust: 3, sigilFlux: 3 },
    mutation: "Mutacion: añade escudo runico y castiga golpes criticos consecutivos.",
    segmentCount: 3,
    hpMultiplier: 3.3,
    damageMultiplier: 0.82,
    defenseMultiplier: 1.3,
    mechanicIntensity: 1.3,
  },
];

const WEEKLY_BOSS_CANDIDATE_IDS = BOSSES.filter(boss => Number(boss?.tier || 0) >= 10).map(boss => boss.id);
const BOSS_BY_ID = Object.fromEntries(BOSSES.map(boss => [boss.id, boss]));

function hashString(input = "") {
  let hash = 2166136261;
  const source = String(input || "");
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function normalizeReward(reward = {}) {
  return {
    gold: Math.max(0, Math.floor(Number(reward?.gold || 0))),
    essence: Math.max(0, Math.floor(Number(reward?.essence || 0))),
    codexInk: Math.max(0, Math.floor(Number(reward?.codexInk || 0))),
    relicDust: Math.max(0, Math.floor(Number(reward?.relicDust || 0))),
    sigilFlux: Math.max(0, Math.floor(Number(reward?.sigilFlux || 0))),
  };
}

function sanitizeCompletions(completions = {}) {
  return Object.fromEntries(
    WEEKLY_BOSS_DIFFICULTIES.map(definition => [definition.id, Boolean(completions?.[definition.id])])
  );
}

function getWeeklyBossCycleStart(now = Date.now()) {
  const safeNow = Number(now || Date.now()) || Date.now();
  return Math.floor(safeNow / WEEKLY_BOSS_RESET_MS) * WEEKLY_BOSS_RESET_MS;
}

function formatWeeklyBossCycleKey(cycleStartAt = Date.now()) {
  const date = new Date(Number(cycleStartAt || Date.now()));
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  return `${year}-${month}-${day}-${hour}`;
}

function pickBossId(state, weekKey = "") {
  const candidates = WEEKLY_BOSS_CANDIDATE_IDS.length > 0
    ? WEEKLY_BOSS_CANDIDATE_IDS
    : BOSSES.map(boss => boss.id);
  const seed =
    Number(state?.accountTelemetry?.firstSeenAt || 0) +
    Number(state?.accountTelemetry?.sessionCount || 0) +
    Number(state?.prestige?.totalEchoesEarned || 0);
  const index = hashString(`${weekKey}:${seed}`) % candidates.length;
  return candidates[index] || BOSSES[0]?.id || null;
}

function evaluatePowerRating(state = {}) {
  const player = state?.player || {};
  const combat = state?.combat || {};
  const sanctuary = state?.sanctuary || {};

  const maxTier = Math.max(1, Number(combat?.maxTier || combat?.currentTier || 1));
  const level = Math.max(1, Number(player?.level || 1));
  const damage = Math.max(1, Number(player?.damage || player?.baseDamage || 1));
  const defense = Math.max(0, Number(player?.defense || 0));
  const hp = Math.max(1, Number(player?.maxHp || player?.baseMaxHp || 1));
  const prestigeLevel = Math.max(0, Number(state?.prestige?.level || 0));
  const relicCount = Array.isArray(sanctuary?.relicArmory) ? sanctuary.relicArmory.length : 0;

  return (
    maxTier * 1.4 +
    level * 0.8 +
    Math.sqrt(damage) * 0.9 +
    Math.sqrt(defense + 1) * 0.7 +
    Math.sqrt(hp) * 0.35 +
    prestigeLevel * 1.6 +
    relicCount * 0.6
  );
}

function getDifficultyDefinition(difficultyId = "") {
  return WEEKLY_BOSS_DIFFICULTIES.find(definition => definition.id === difficultyId) || null;
}

function getChallengeThreshold(difficulty, boss = {}) {
  return Number(difficulty?.requiredPower || 0) + Math.max(0, Number(boss?.tier || 0)) * 0.95;
}

function calculateWinChance(powerRating = 0, threshold = 0) {
  const margin = Number(powerRating || 0) - Number(threshold || 0);
  const chance = 0.18 + margin * 0.028;
  return Math.max(0.08, Math.min(0.96, chance));
}

function mergeRuntime(base = {}, extra = {}) {
  const merged = { ...base };
  const multiplicativeKeys = new Set(["hpMult", "defenseMult", "damageMult"]);

  for (const [key, value] of Object.entries(extra || {})) {
    if (typeof value === "number") {
      if (multiplicativeKeys.has(key)) {
        merged[key] = (merged[key] || 1) * value;
      } else {
        merged[key] = (merged[key] || 0) + value;
      }
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

function applyRuntimeStats(enemy, runtime = {}) {
  const hpMult = runtime.hpMult || 1;
  const defenseMult = runtime.defenseMult || 1;
  const damageMult = runtime.damageMult || 1;

  const maxHp = Math.max(1, Math.floor(enemy.maxHp * hpMult));
  return {
    ...enemy,
    hp: maxHp,
    maxHp,
    damage: Math.max(1, Math.floor(enemy.damage * damageMult)),
    defense: Math.max(0, Math.floor(enemy.defense * defenseMult)),
  };
}

function scaleMechanicRuntime(runtime = {}, intensity = 1) {
  const scaled = {};
  for (const [key, value] of Object.entries(runtime || {})) {
    if (typeof value === "number") {
      scaled[key] = ["reflectRatio"].includes(key)
        ? value * (1 + (intensity - 1) * 0.75)
        : value * intensity;
    } else {
      scaled[key] = value;
    }
  }
  return scaled;
}

function scaleBossMechanic(mechanic, intensity = 1) {
  if (!mechanic) return null;
  if (intensity <= 1.001) {
    return {
      ...mechanic,
      params: { ...(mechanic.params || {}) },
      runtime: { ...(mechanic.runtime || {}) },
    };
  }

  const scaled = {
    ...mechanic,
    params: { ...(mechanic.params || {}) },
    runtime: scaleMechanicRuntime(mechanic.runtime || {}, intensity),
  };

  switch (mechanic.id) {
    case "enrage_low_hp":
      scaled.params.threshold = Math.min(0.48, Number(mechanic.params?.threshold || 0.3) + (intensity - 1) * 0.16);
      scaled.params.damageMult = 1 + (Number(mechanic.params?.damageMult || 1.5) - 1) * (1 + (intensity - 1) * 1.2);
      break;
    case "shield_every_n":
      scaled.params.every = Math.max(3, Math.round(Number(mechanic.params?.every || 10) - (intensity - 1) * 4));
      break;
    case "armor_shred":
      scaled.params.every = Math.max(3, Math.round(Number(mechanic.params?.every || 6) - (intensity - 1) * 3));
      break;
    case "crit_immunity":
      scaled.params.threshold = Math.max(0.22, Number(mechanic.params?.threshold || 0.6) - (intensity - 1) * 0.18);
      break;
    case "double_strike":
      scaled.params.every = Math.max(3, Math.round(Number(mechanic.params?.every || 5) - (intensity - 1) * 2));
      break;
    case "lifesteal_reflect":
      scaled.params.healPct = Number(mechanic.params?.healPct || 0.16) * (1 + (intensity - 1) * 0.8);
      break;
    case "poison_stacks":
      scaled.params.chance = Math.min(0.8, Number(mechanic.params?.chance || 0.42) + (intensity - 1) * 0.18);
      scaled.params.basePctMaxHp = Number(mechanic.params?.basePctMaxHp || 0.012) * (1 + (intensity - 1) * 0.85);
      scaled.params.rampPctPerTick = Number(mechanic.params?.rampPctPerTick || 0.0007) * (1 + (intensity - 1) * 0.8);
      scaled.params.maxStacks = Math.min(7, Math.round(Number(mechanic.params?.maxStacks || 4) + (intensity - 1) * 2));
      break;
    case "phase_reset":
      scaled.params.triggerThreshold = Math.min(0.42, Number(mechanic.params?.triggerThreshold || 0.3) + (intensity - 1) * 0.08);
      scaled.params.resetToPct = Math.min(0.78, Number(mechanic.params?.resetToPct || 0.6) + (intensity - 1) * 0.1);
      break;
    case "mark_reversal":
      scaled.params.damagePerMarkPct = Number(mechanic.params?.damagePerMarkPct || 0.06) * (1 + (intensity - 1) * 0.9);
      break;
    case "spell_mirror":
      scaled.params.reflectPct = Number(mechanic.params?.reflectPct || 0.18) * (1 + (intensity - 1) * 0.8);
      break;
    default:
      break;
  }

  return scaled;
}

function createWeeklyBossRuntime(runtimePatch = {}) {
  return {
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
    ...(runtimePatch || {}),
  };
}

function buildWeeklyBossEncounterEnemy(
  boss,
  difficulty,
  {
    encounterId,
    cycleKey,
    startedAt,
    currentTier = 1,
  } = {}
) {
  const segmentCount = Math.max(1, Math.floor(Number(difficulty?.segmentCount || 1)));
  const segmentMaxHp = Math.max(
    120,
    Math.floor(Math.max(1, Number(boss?.maxHp || boss?.hp || 120)) * Math.max(1, Number(difficulty?.hpMultiplier || 1)))
  );
  const totalHp = Math.max(segmentMaxHp, segmentMaxHp * segmentCount);
  const scaledDamage = Math.max(
    1,
    Math.floor(Math.max(1, Number(boss?.damage || 1)) * Math.max(0.15, Number(difficulty?.damageMultiplier || 1)))
  );
  const scaledDefense = Math.max(
    0,
    Math.floor(Math.max(0, Number(boss?.defense || 0)) * Math.max(0.5, Number(difficulty?.defenseMultiplier || 1)))
  );

  const mechanicIntensity = Math.max(1, Number(difficulty?.mechanicIntensity || 1));
  const mechanics = (boss?.mechanics || [])
    .map(mechanicId => scaleBossMechanic(BOSS_MECHANICS[mechanicId], mechanicIntensity))
    .filter(Boolean);

  let runtime = {};
  for (const mechanic of mechanics) {
    runtime = mergeRuntime(runtime, mechanic?.runtime || {});
  }

  const encounterMeta = {
    active: true,
    encounterId,
    cycleKey,
    weekKey: cycleKey,
    bossId: boss?.id || null,
    bossName: boss?.name || "Boss semanal",
    difficultyId: difficulty?.id || "normal",
    difficultyLabel: difficulty?.label || "Normal",
    segmentCount,
    segmentMaxHp,
    totalHp,
    startedAt: Number(startedAt || Date.now()) || Date.now(),
  };

  const baseEnemy = {
    id: `weekly_${boss?.id || "boss"}_${difficulty?.id || "normal"}_${cycleKey || "cycle"}`,
    name: `${boss?.name || "Boss semanal"} · ${difficulty?.label || "Normal"}`,
    family: boss?.family || "weekly",
    familyName: "Boss semanal",
    familyTraitId: `weekly_${boss?.id || "boss"}`,
    familyTraitName: "Contrato de semana",
    familyTraitDescription: "Encuentro semanal prolongado.",
    tier: Math.max(1, Math.floor(Number(currentTier || boss?.tier || 1))),
    hp: totalHp,
    maxHp: totalHp,
    damage: scaledDamage,
    defense: scaledDefense,
    xpReward: 0,
    goldReward: 0,
    essenceReward: 0,
    guaranteedRarityFloor: null,
    dropRarityBonus: {},
    isBoss: true,
    intro: boss?.intro || "Evento semanal con mecanica fija.",
    mechanics,
    monsterAffixes: [],
    runtime: createWeeklyBossRuntime(runtime),
    weeklyBoss: encounterMeta,
  };

  return applyRuntimeStats(baseEnemy, runtime);
}

export function createEmptyWeeklyBossState() {
  return {
    version: 3,
    weekKey: null,
    cycleKey: null,
    cycleStartedAt: null,
    cycleEndsAt: null,
    bossId: null,
    attemptsUsed: 0,
    maxAttempts: WEEKLY_BOSS_ATTEMPT_LIMIT,
    completions: sanitizeCompletions({}),
    lastAttemptAt: null,
    history: [],
  };
}

export function buildWeeklyBossState(state, now = Date.now(), previousState = null) {
  const cycleStartedAt = getWeeklyBossCycleStart(now);
  const cycleEndsAt = cycleStartedAt + WEEKLY_BOSS_RESET_MS;
  const cycleKey = formatWeeklyBossCycleKey(cycleStartedAt);
  const bossId = pickBossId(state, cycleKey);
  return {
    ...createEmptyWeeklyBossState(),
    weekKey: cycleKey,
    cycleKey,
    cycleStartedAt,
    cycleEndsAt,
    bossId,
    maxAttempts: WEEKLY_BOSS_ATTEMPT_LIMIT,
    attemptsUsed: 0,
    completions: sanitizeCompletions({}),
    history: Array.isArray(previousState?.history)
      ? previousState.history.slice(-12).map(entry => ({ ...entry }))
      : [],
  };
}

export function ensureWeeklyBossState(state, weeklyBoss = {}, now = Date.now()) {
  const nowAt = Number(now || Date.now()) || Date.now();
  const cycleStartedAt = getWeeklyBossCycleStart(nowAt);
  const cycleKey = formatWeeklyBossCycleKey(cycleStartedAt);
  const cycleEndsAt = cycleStartedAt + WEEKLY_BOSS_RESET_MS;
  const hasActiveEncounter = Boolean(state?.combat?.weeklyBossEncounter?.active);
  const normalizedCycleKey = weeklyBoss?.cycleKey || weeklyBoss?.weekKey || null;
  const safeState = {
    ...createEmptyWeeklyBossState(),
    ...(weeklyBoss || {}),
    weekKey: normalizedCycleKey,
    cycleKey: normalizedCycleKey,
    cycleStartedAt: Number(weeklyBoss?.cycleStartedAt || 0) > 0
      ? Number(weeklyBoss?.cycleStartedAt)
      : null,
    cycleEndsAt: Number(weeklyBoss?.cycleEndsAt || 0) > 0
      ? Number(weeklyBoss?.cycleEndsAt)
      : null,
    maxAttempts: WEEKLY_BOSS_ATTEMPT_LIMIT,
    attemptsUsed: Math.max(0, Math.floor(Number(weeklyBoss?.attemptsUsed || 0))),
    completions: sanitizeCompletions(weeklyBoss?.completions || {}),
    history: Array.isArray(weeklyBoss?.history)
      ? weeklyBoss.history.slice(-12).map(entry => ({ ...entry }))
      : [],
  };

  const isSameCycle = safeState.cycleKey === cycleKey || safeState.weekKey === cycleKey;
  if ((isSameCycle || hasActiveEncounter) && safeState.bossId) {
    return {
      ...safeState,
      weekKey: safeState.cycleKey || safeState.weekKey || cycleKey,
      cycleKey: safeState.cycleKey || safeState.weekKey || cycleKey,
      cycleStartedAt: Number(safeState?.cycleStartedAt || 0) > 0
        ? Number(safeState.cycleStartedAt)
        : cycleStartedAt,
      cycleEndsAt: Number(safeState?.cycleEndsAt || 0) > 0
        ? Number(safeState.cycleEndsAt)
        : cycleEndsAt,
      attemptsUsed: Math.min(WEEKLY_BOSS_ATTEMPT_LIMIT, safeState.attemptsUsed),
    };
  }

  return buildWeeklyBossState(state, nowAt, safeState);
}

export function getWeeklyBossDifficulties() {
  return WEEKLY_BOSS_DIFFICULTIES.map(definition => ({
    ...definition,
    reward: normalizeReward(definition.reward || {}),
  }));
}

export function getWeeklyBossOverview(state, weeklyBoss = {}) {
  const nowAt = Date.now();
  const bossState = ensureWeeklyBossState(state, weeklyBoss, nowAt);
  const boss = BOSS_BY_ID[bossState.bossId] || null;
  const attemptsRemaining = Math.max(0, WEEKLY_BOSS_ATTEMPT_LIMIT - Math.max(0, Number(bossState.attemptsUsed || 0)));
  const cycleEndsAt = Number(bossState?.cycleEndsAt || 0) > 0
    ? Number(bossState.cycleEndsAt)
    : null;
  const cycleRemainingMs = cycleEndsAt ? Math.max(0, cycleEndsAt - nowAt) : 0;
  const powerRating = evaluatePowerRating(state);
  const activeEncounter =
    state?.combat?.weeklyBossEncounter && state.combat.weeklyBossEncounter.active
      ? state.combat.weeklyBossEncounter
      : null;
  const canStartEncounter =
    attemptsRemaining > 0 &&
    !activeEncounter &&
    state?.expedition?.phase === "active" &&
    !state?.combat?.pendingRunSetup;
  const difficulties = getWeeklyBossDifficulties().map(definition => {
    const threshold = getChallengeThreshold(definition, boss);
    const completed = Boolean(bossState?.completions?.[definition.id]);
    return {
      ...definition,
      threshold,
      completed,
      canAttempt: canStartEncounter && !completed,
      projectedWinChance: calculateWinChance(powerRating, threshold),
    };
  });

  return {
    ...bossState,
    weekKey: bossState?.cycleKey || bossState?.weekKey || null,
    cycleKey: bossState?.cycleKey || bossState?.weekKey || null,
    cycleEndsAt,
    cycleRemainingMs,
    boss,
    attemptsRemaining,
    powerRating,
    activeEncounter,
    canStartEncounter,
    difficulties,
  };
}

export function createWeeklyBossEncounter(state, weeklyBoss = {}, difficultyId = "normal", now = Date.now()) {
  const nowAt = Number(now || Date.now()) || Date.now();
  const bossState = ensureWeeklyBossState(state, weeklyBoss, nowAt);
  const boss = BOSS_BY_ID[bossState.bossId] || null;
  if (!boss?.id) {
    return { ok: false, reason: "No hay boss semanal disponible." };
  }

  if (state?.combat?.weeklyBossEncounter?.active) {
    return { ok: false, reason: "Ya hay un boss semanal en combate." };
  }

  const difficulty = getDifficultyDefinition(difficultyId);
  if (!difficulty) {
    return { ok: false, reason: "Dificultad invalida." };
  }

  if (Number(bossState.attemptsUsed || 0) >= WEEKLY_BOSS_ATTEMPT_LIMIT) {
    return { ok: false, reason: "Sin intentos disponibles en este ciclo (22h)." };
  }

  if (bossState?.completions?.[difficulty.id]) {
    return { ok: false, reason: `${difficulty.label} ya fue completada esta semana.` };
  }

  const powerRating = evaluatePowerRating(state);
  const threshold = getChallengeThreshold(difficulty, boss);
  const projectedWinChance = calculateWinChance(powerRating, threshold);
  const cycleKey = bossState?.cycleKey || bossState?.weekKey || "cycle";
  const encounterId = `wbe_${cycleKey}_${difficulty.id}_${Number(bossState.attemptsUsed || 0) + 1}_${nowAt}`;
  const enemy = buildWeeklyBossEncounterEnemy(boss, difficulty, {
    encounterId,
    cycleKey,
    startedAt: nowAt,
    currentTier: state?.combat?.currentTier || boss?.tier || 1,
  });
  const attemptsUsed = Math.min(WEEKLY_BOSS_ATTEMPT_LIMIT, Number(bossState.attemptsUsed || 0) + 1);
  const nextState = {
    ...bossState,
    attemptsUsed,
    lastAttemptAt: nowAt,
  };

  const encounter = {
    id: encounterId,
    active: true,
    weekKey: cycleKey,
    cycleKey,
    bossId: boss.id,
    bossName: boss.name,
    difficultyId: difficulty.id,
    difficultyLabel: difficulty.label,
    mutation: difficulty.mutation,
    reward: normalizeReward(difficulty.reward || {}),
    segmentCount: Math.max(1, Number(enemy?.weeklyBoss?.segmentCount || difficulty.segmentCount || 1)),
    segmentMaxHp: Math.max(1, Number(enemy?.weeklyBoss?.segmentMaxHp || enemy.maxHp || 1)),
    totalHp: Math.max(1, Number(enemy?.weeklyBoss?.totalHp || enemy.maxHp || 1)),
    startedAt: nowAt,
    powerRating: Math.round(powerRating * 10) / 10,
    threshold: Math.round(threshold * 10) / 10,
    projectedWinChance,
  };

  return {
    ok: true,
    boss,
    difficulty,
    enemy,
    encounter,
    weeklyBoss: nextState,
  };
}

export function settleWeeklyBossEncounter(
  state,
  weeklyBoss = {},
  encounter = {},
  {
    success = false,
    now = Date.now(),
  } = {}
) {
  const nowAt = Number(now || Date.now()) || Date.now();
  const bossState = ensureWeeklyBossState(state, weeklyBoss, nowAt);
  const difficulty = getDifficultyDefinition(encounter?.difficultyId || "normal");
  const boss = BOSS_BY_ID[encounter?.bossId || bossState.bossId] || null;

  if (!difficulty) {
    return { ok: false, reason: "Dificultad invalida para resolver encounter semanal." };
  }
  if (!boss?.id) {
    return { ok: false, reason: "No se encontro el boss semanal para resolver el encounter." };
  }

  const reward = success
    ? normalizeReward(encounter?.reward || difficulty.reward || {})
    : normalizeReward({});
  const nextCompletions = {
    ...sanitizeCompletions(bossState.completions || {}),
    [difficulty.id]: success ? true : Boolean(bossState?.completions?.[difficulty.id]),
  };
  const historyEntry = {
    at: nowAt,
    weekKey: bossState?.cycleKey || bossState?.weekKey,
    cycleKey: bossState?.cycleKey || bossState?.weekKey,
    encounterId: encounter?.id || null,
    bossId: boss.id,
    bossName: boss.name,
    difficultyId: difficulty.id,
    difficultyLabel: difficulty.label,
    success: Boolean(success),
    attemptsUsed: Math.max(0, Number(bossState.attemptsUsed || 0)),
    reward,
    durationSeconds: Math.max(0, Math.floor((nowAt - Number(encounter?.startedAt || nowAt)) / 1000)),
  };

  const nextState = {
    ...bossState,
    completions: nextCompletions,
    lastAttemptAt: nowAt,
    history: [
      ...(Array.isArray(bossState.history) ? bossState.history : []),
      historyEntry,
    ].slice(-12),
  };

  return {
    ok: true,
    success: Boolean(success),
    reward,
    boss,
    difficulty,
    weeklyBoss: nextState,
    historyEntry,
  };
}
