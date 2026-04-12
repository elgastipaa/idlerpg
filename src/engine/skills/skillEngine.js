import { SKILLS } from "../../data/skills";
import { calcStats } from "../combat/statEngine";

const COOLDOWN_REDUCTION_CAP = 0.75;
const FLOAT_EVENT_LIMIT = 8;
const SKILL_DPS_WINDOW_MS = 20000;
const SKILL_TIMELINE_LIMIT = 240;
let skillFloatEventSequence = 0;

export function getEffectiveSkillCooldown(skill, playerStats = {}) {
  const reduction = Math.min(
    COOLDOWN_REDUCTION_CAP,
    Math.max(0, playerStats.cooldownReduction || 0)
  );
  return Math.max(1, Math.round((skill?.cooldown || 1) * (1 - reduction)));
}

function canUseSkill({ skill, player, cooldowns }) {
  if (!skill) return false;
  if (skill.classId !== player.class) return false;
  if (skill.specId && skill.specId !== player.specialization) return false;
  if ((cooldowns?.[skill.id] || 0) > 0) return false;
  return true;
}

function applySkillEffect({ skill, playerStats, enemyHp, playerHp }) {
  let newEnemyHp = enemyHp;
  let newPlayerHp = playerHp;
  let log = "";
  let damageDone = 0;
  let healDone = 0;
  let didCrit = false;
  const skillPowerMultiplier = 1 + (playerStats.skillPower || 0);

  if (skill.effect?.damageMultiplier) {
    const critChance = playerStats.critChance + (skill.effect.critBonus || 0);
    const isCrit = Math.random() < critChance;
    didCrit = isCrit;

    const dmg = Math.floor(
      playerStats.damage *
        skill.effect.damageMultiplier *
        skillPowerMultiplier *
        (isCrit ? 2 : 1)
    );

    newEnemyHp = Math.max(0, newEnemyHp - dmg);
    damageDone = Math.max(0, dmg);
    log = `${skill.name}: ${dmg} dano${isCrit ? " [CRIT]" : ""}`;
  }

  if (skill.effect?.heal) {
    const heal = Math.floor(skill.effect.heal * skillPowerMultiplier);
    const playerHpAfterHeal = Math.min(playerStats.maxHp, newPlayerHp + heal);
    healDone = Math.max(0, playerHpAfterHeal - newPlayerHp);
    newPlayerHp = playerHpAfterHeal;
    log = `${skill.name}: +${healDone} HP`;
  }

  if (skill.effect?.selfDamagePct) {
    const selfDmg = Math.floor(playerStats.maxHp * skill.effect.selfDamagePct);
    newPlayerHp = Math.max(1, newPlayerHp - selfDmg);
  }

  return { newEnemyHp, newPlayerHp, log, damageDone, healDone, didCrit };
}

function createSkillFloatEvent(kind, value, options = {}) {
  const rounded = Math.max(0, Math.floor(value || 0));
  if (!rounded) return null;
  skillFloatEventSequence += 1;
  return {
    id: `skill-float-${Date.now()}-${skillFloatEventSequence}`,
    kind,
    value: rounded,
    crit: !!options.crit,
    source: "skill",
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

export function useSkill(state, skillId) {
  const skill = SKILLS.find(s => s.id === skillId);
  if (!skill) return state;

  const enemy = state.combat.enemy;
  if (!enemy) return state;

  const cooldowns = state.combat.skillCooldowns || {};
  if (!canUseSkill({ skill, player: state.player, cooldowns })) return state;

  const playerStats = calcStats(state.player);
  const effectiveCooldown = getEffectiveSkillCooldown(skill, playerStats);

  const { newEnemyHp, newPlayerHp, log, damageDone, healDone, didCrit } = applySkillEffect({
    skill,
    playerStats,
    enemyHp: enemy.hp,
    playerHp: state.player.hp,
  });

  return {
    ...state,
    player: {
      ...state.player,
      hp: Math.min(playerStats.maxHp, newPlayerHp),
    },
    combat: {
      ...state.combat,
      enemy: { ...enemy, hp: newEnemyHp },
      floatEvents: appendCombatFloatEvents(state.combat.floatEvents, [
        createSkillFloatEvent("skillDamage", damageDone, { crit: didCrit }),
        createSkillFloatEvent("skillHeal", healDone),
      ]),
      skillDamageTimeline: appendSkillDamageTimeline(
        state.combat.skillDamageTimeline,
        damageDone > 0 ? [{ skillId: skill.id, damage: damageDone, at: Date.now() }] : []
      ),
      skillCooldowns: {
        ...cooldowns,
        [skill.id]: effectiveCooldown,
      },
      log: [...state.combat.log, log].slice(-20),
    },
  };
}

export function processAutoSkills({
  skills,
  player,
  playerStats,
  skillAutocasts,
  cooldowns,
}) {
  let extraDamage = 0;
  let extraHeal = 0;
  const skillDamageEvents = [];
  const effectsToApply = [];
  const logs = [];
  const updatedCooldowns = { ...cooldowns };
  const skillPowerMultiplier = 1 + (playerStats.skillPower || 0);

  const autoSkills = skills.filter(sk =>
    canUseSkill({ skill: sk, player, cooldowns: updatedCooldowns }) &&
    skillAutocasts?.[sk.id] === true
  );

  for (const sk of autoSkills) {
    if (sk.effect?.damageMultiplier) {
      const scaledMultiplier = sk.effect.damageMultiplier * skillPowerMultiplier;
      const dmg = Math.floor(playerStats.damage * Math.max(0, scaledMultiplier - 1));
      extraDamage += dmg;
      if (dmg > 0) {
        skillDamageEvents.push({
          skillId: sk.id,
          damage: dmg,
          at: Date.now(),
        });
      }
      logs.push(`Auto: ${sk.name} - +${dmg} dano`);
    }

    if (sk.effect?.heal) {
      const heal = Math.floor(sk.effect.heal * skillPowerMultiplier);
      if (heal > 0) {
        extraHeal += heal;
        logs.push(`Auto: ${sk.name} - +${heal} HP`);
      }
    }

    if (sk.effect?.applyBuff) {
      effectsToApply.push({
        ...sk.effect.applyBuff,
        source: "skill",
      });
    }

    updatedCooldowns[sk.id] = getEffectiveSkillCooldown(sk, playerStats);
  }

  return { extraDamage, extraHeal, skillDamageEvents, logs, updatedCooldowns, effectsToApply };
}

export function reduceCooldowns(cooldowns = {}) {
  const updated = {};

  for (const key in cooldowns) {
    updated[key] = Math.max(0, cooldowns[key] - 1);
  }

  return updated;
}
