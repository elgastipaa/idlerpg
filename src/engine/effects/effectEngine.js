import { getModifierTotals } from "../modifiers/modifierEngine";
import { MOD_TYPES } from "../modifiers/modTypes";

// engine/effects/effectEngine.js

// ============================================================
// 🧠 EFFECT ENGINE
// Sistema unificado de efectos (buffs / debuffs / scaling)
// ============================================================


// ============================================================
// APPLY NEW EFFECTS
// ============================================================

export function applyEffects(currentEffects = [], newEffects = []) {
  const normalized = newEffects.map(e => ({
    duration: e.duration ?? null,
    source: e.source || "unknown",
    sourceId: e.sourceId || null,
    tags: e.tags || [],
    stackable: e.stackable ?? true,
    maxStacks: e.maxStacks ?? null,
    modifiers: e.modifiers || [],
    ...e,
  }));

  const nextEffects = [...currentEffects];

  for (const effect of normalized) {
    if (effect.maxStacks && effect.sourceId) {
      const matchingIndexes = nextEffects
        .map((candidate, index) => ({ candidate, index }))
        .filter(({ candidate }) => candidate.sourceId === effect.sourceId);

      if (matchingIndexes.length >= effect.maxStacks) {
        nextEffects.splice(matchingIndexes[0].index, 1);
      }
    }

    nextEffects.push(effect);
  }

  return nextEffects;
}


// ============================================================
// TICK EFFECTS (reduce duración)
// ============================================================

export function tickEffects(effects = []) {
  return effects
    .map(e => ({
      ...e,
      duration: e.duration !== null ? e.duration - 1 : null,
    }))
    .filter(e => e.duration === null || e.duration > 0);
}


// ============================================================
// 🧮 COMPUTE FINAL MODIFIERS
// ============================================================

export function computeEffectModifiers(effects = [], context = {}) {
  const totals = getModifierTotals(effects);
  return {
    damageMult: totals.damageMult,
    damageFlat: totals.damageFlat,
    defenseMult: totals.defenseMult,
    defenseFlat: totals.defenseFlat,
    attackSpeedFlat: totals.attackSpeedFlat,
    critBonus: totals.critChance,
    regen: totals.regenFlat,
    healFlat: totals.healFlat,
    healPercentMaxHp: totals.healPercentMaxHp,
    enemyDamageTakenMult: totals.enemyDamageTakenMult,
    goldFlat: totals.goldFlat,
    lifestealFlat: totals.lifestealFlat,
    lifestealPercentDamage: totals.lifestealPercentDamage,
  };
}


// ============================================================
// 🎯 BUILD EFFECT FROM TALENT
// ============================================================

export function effectFromTalent(talent) {
  const e = talent.effect;
  if (!e) return null;

  const modifiers = [];

  switch (e.stat) {
    case "damage":
      if (e.multiplier !== undefined) modifiers.push({ type: MOD_TYPES.DAMAGE_MULT, value: e.multiplier });
      if (e.flat !== undefined) modifiers.push({ type: MOD_TYPES.DAMAGE_FLAT, value: e.flat });
      break;
    case "defense":
      if (e.multiplier !== undefined) modifiers.push({ type: MOD_TYPES.DEFENSE_MULT, value: e.multiplier });
      if (e.flat !== undefined) modifiers.push({ type: MOD_TYPES.DEFENSE_FLAT, value: e.flat });
      break;
    case "attackSpeed":
      modifiers.push({ type: MOD_TYPES.ATTACK_SPEED_FLAT, value: e.flat || 0 });
      break;
    case "critChance":
      modifiers.push({ type: MOD_TYPES.CRIT_CHANCE, value: e.flat || e.multiplier || 0 });
      break;
    case "regen":
      modifiers.push({ type: MOD_TYPES.REGEN_FLAT, value: e.flat || 0 });
      break;
    case "heal":
      if (e.flat !== undefined) modifiers.push({ type: MOD_TYPES.HEAL_FLAT, value: e.flat });
      if (e.multiplier !== undefined) modifiers.push({ type: MOD_TYPES.HEAL_PERCENT_MAX_HP, value: e.multiplier });
      if (e.ratio !== undefined) modifiers.push({ type: MOD_TYPES.HEAL_PERCENT_MAX_HP, value: e.ratio });
      break;
    case "enemyDamageTaken":
      if (e.multiplier !== undefined) modifiers.push({ type: MOD_TYPES.ENEMY_DAMAGE_TAKEN_MULT, value: e.multiplier });
      break;
    case "goldBonus":
      if (e.flat !== undefined) modifiers.push({ type: MOD_TYPES.GOLD_FLAT, value: e.flat });
      break;
    case "lifesteal":
      if (e.flat !== undefined) modifiers.push({ type: MOD_TYPES.LIFESTEAL_FLAT, value: e.flat });
      if (e.multiplier !== undefined) modifiers.push({ type: MOD_TYPES.LIFESTEAL_PERCENT_DAMAGE, value: e.multiplier });
      break;
  }

  return {
    stat: e.stat,
    type: e.multiplier !== undefined ? "mult" : "flat",
    value: e.multiplier || e.flat || 0,
    flat: e.flat,
    multiplier: e.multiplier,
    duration: e.duration ?? null,
    source: "talent",
    sourceId: talent.id,
    tags: talent.tags || [],
    modifiers,
    stackable: e.stackable,
    maxStacks: e.maxStacks,
    isImmediate: ["heal", "goldBonus", "lifesteal"].includes(e.stat),
  };
}


// ============================================================
// 🎯 BUILD EFFECT FROM SKILL
// ============================================================

export function effectFromSkill(skill) {
  const e = skill.effect;
  if (!e) return null;

  if (e.applyBuff) {
    return {
      ...e.applyBuff,
      source: "skill",
    };
  }

  return null;
}


// ============================================================
// 🧠 CLEANUP / DEBUG
// ============================================================

export function groupEffectsBySource(effects = []) {
  return effects.reduce((acc, e) => {
    if (!acc[e.source]) acc[e.source] = [];
    acc[e.source].push(e);
    return acc;
  }, {});
}
