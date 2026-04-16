import { BOSS_MECHANICS, ENEMY_FAMILIES, MONSTER_AFFIXES } from "../../data/encounters";
import { resolveEncounterForTier } from "./encounterRouting";

function mergeRuntime(base = {}, extra = {}) {
  const merged = { ...base };
  const multiplicativeKeys = new Set(["hpMult", "defenseMult", "damageMult"]);

  for (const [key, value] of Object.entries(extra)) {
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

function rollMonsterAffixes(baseEnemy) {
  const affixTier = Number(baseEnemy.cycleTier || baseEnemy.tier || 1);
  if (baseEnemy.isBoss || !baseEnemy.possibleAffixes?.length || affixTier < 4) return [];

  const chance = Math.min(0.6, 0.08 + Math.max(0, affixTier - 4) * 0.06);
  if (Math.random() > chance) return [];

  const pool = baseEnemy.possibleAffixes
    .map(id => MONSTER_AFFIXES[id])
    .filter(Boolean);

  if (!pool.length) return [];
  return [pool[Math.floor(Math.random() * pool.length)]];
}

export function spawnEnemy(tier, runContext = null) {
  const data = resolveEncounterForTier(tier, runContext);
  const family = ENEMY_FAMILIES[data.family] || null;
  const rolledAffixes = rollMonsterAffixes(data);
  const mutatorAffixes = [...new Set(data.mutatorAffixIds || [])]
    .map(id => MONSTER_AFFIXES[id])
    .filter(Boolean);
  const depthAffixes = [...new Set(data.depthAffixIds || [])]
    .map(id => MONSTER_AFFIXES[id])
    .filter(Boolean);
  const monsterAffixes = [...rolledAffixes, ...mutatorAffixes, ...depthAffixes];
  const mechanicIds = [...new Set([...(data.mechanics || []), ...(data.mutatorMechanicIds || []), ...(data.depthMechanicIds || [])])];
  const mechanics = mechanicIds
    .map(id => scaleBossMechanic(BOSS_MECHANICS[id], data.mechanicIntensity || 1))
    .filter(Boolean);

  let runtime = {};
  if (family?.runtime) runtime = mergeRuntime(runtime, family.runtime);
  if (data.abyssRuntime) runtime = mergeRuntime(runtime, data.abyssRuntime);
  for (const affix of monsterAffixes) {
    runtime = mergeRuntime(runtime, affix.runtime || {});
  }
  for (const mechanic of mechanics) {
    runtime = mergeRuntime(runtime, mechanic.runtime || {});
  }

  const hydrated = applyRuntimeStats(
    {
      ...data,
      familyName: family?.name || null,
      familyTraitName: family?.traitName || null,
      familyTraitDescription: family?.description || null,
      familyTraitId: family?.id || null,
      abyssMutator: data.abyssMutator || null,
      monsterAffixes,
      mechanics,
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
        ...runtime,
      },
    },
    runtime
  );

  return hydrated;
}
