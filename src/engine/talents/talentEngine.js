// Talentos triggered — se activan al matar enemigos.
// Para agregar un nuevo talento triggered:
//   1. Agregarlo a data/talents.js con type: "triggered"
//   2. Agregar el caso acá con trigger y efecto
// Futuro: joyas y sets pueden hookear acá como modificadores adicionales.

import { TALENTS } from "../../data/talents";
import { effectFromTalent } from "../effects/effectEngine";


export function processTriggerTalents({
  unlockedTalents,
  context,
  triggerStats,
}) {
  const effects = [];
  const logs = [];
  const replacingTalentIds = new Set(
    TALENTS
      .filter(talent => unlockedTalents.includes(talent.id) && talent.replaces)
      .flatMap(talent => (Array.isArray(talent.replaces) ? talent.replaces : [talent.replaces]))
  );

  const activeTalents = TALENTS.filter(t =>
    unlockedTalents.includes(t.id) &&
    !replacingTalentIds.has(t.id) &&
    (t.type === "triggered" || t.type === "stacking")
  );

  for (const talent of activeTalents) {
    if (triggerStats?.length && !triggerStats.includes(talent.trigger?.stat)) continue;
    const triggered = checkTrigger({ talent, context });
    if (!triggered) continue;

    const effect = effectFromTalent(talent);


    if (effect) {
      effects.push(effect);
    }

    logs.push(`✨ ${talent.name} activado`);
  }

  return { effects, logs };
}

export function applyTalentBuffs(buffs) {
  let damageMult = 1;
  let critBoost = 0;
  let defenseMult = 1;
  let regen = 0;

  for (const buff of buffs) {
    if (buff.type === "damageMult") damageMult *= buff.value;
    if (buff.type === "critBoost") critBoost += buff.value;
    if (buff.type === "defenseMult") defenseMult *= buff.value;
    if (buff.type === "regen") regen += buff.value;
  }

  return { damageMult, critBoost, defenseMult, regen };
}

export function tickTalentBuffs(buffs) {
  return buffs
    .map(b => ({
      ...b,
      ticksLeft: b.ticksLeft !== null ? b.ticksLeft - 1 : null,
    }))
    .filter(b => b.ticksLeft === null || b.ticksLeft > 0);
}

function checkTrigger({ talent, context }) {
  const { trigger } = talent;

  if (!trigger) return false;

  switch (trigger.stat) {
    case "kills":
      return context.sessionKills > 0 && context.sessionKills % trigger.every === 0;

    case "onKill":
      return context.enemyKilled === true;

    case "crit":
      return context.didCrit === true;

    case "lowHp":
      return context.playerHpPct <= 0.3;

    case "onHit":
      return true;

    case "onDamageTaken":
      return context.tookDamage === true;

    case "always":
      return true;

    default:
      return false;
  }
}

function buildBuffFromEffect(effect) {
  if (!effect) return null;

  // 🧠 Mapeo compatible con tu sistema actual
  if (effect.stat === "damage") {
    return {
      type: "damageMult",
      value: effect.multiplier || 1,
      ticksLeft: effect.duration ?? 0,
    };
  }

  if (effect.stat === "critChance") {
    return {
      type: "critBoost",
      value: effect.flat || 0,
      ticksLeft: effect.duration ?? 0,
    };
  }

  if (effect.stat === "defense") {
    return {
      type: "defenseMult",
      value: effect.multiplier || 1,
      ticksLeft: effect.duration ?? 0,
    };
  }

  if (effect.stat === "regen") {
    return {
      type: "regen",
      value: effect.flat || 0,
      ticksLeft: effect.duration ?? 0,
    };
  }

  // 🔮 FUTURO
  if (effect.stat === "lifesteal") {
    return {
      type: "lifesteal",
      value: effect.flat || 0,
      ticksLeft: effect.duration ?? 0,
    };
  }

  return null;
}
