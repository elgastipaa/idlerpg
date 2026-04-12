import { MOD_TYPES } from "./modTypes";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getModifierTotals(effects = []) {
  const totals = {
    damageMult: 1,
    damageFlat: 0,
    defenseMult: 1,
    defenseFlat: 0,
    attackSpeedFlat: 0,
    critChance: 0,
    regenFlat: 0,
    healFlat: 0,
    healPercentMaxHp: 0,
    enemyDamageTakenMult: 1,
    goldFlat: 0,
    lifestealFlat: 0,
    lifestealPercentDamage: 0,
  };

  for (const effect of effects) {
    const modifiers = effect.modifiers || [];

    for (const modifier of modifiers) {
      switch (modifier.type) {
        case MOD_TYPES.DAMAGE_MULT:
          totals.damageMult *= modifier.value;
          break;
        case MOD_TYPES.DAMAGE_FLAT:
          totals.damageFlat += modifier.value;
          break;
        case MOD_TYPES.DEFENSE_MULT:
          totals.defenseMult *= modifier.value;
          break;
        case MOD_TYPES.DEFENSE_FLAT:
          totals.defenseFlat += modifier.value;
          break;
        case MOD_TYPES.ATTACK_SPEED_FLAT:
          totals.attackSpeedFlat += modifier.value;
          break;
        case MOD_TYPES.CRIT_CHANCE:
          totals.critChance += modifier.value;
          break;
        case MOD_TYPES.REGEN_FLAT:
          totals.regenFlat += modifier.value;
          break;
        case MOD_TYPES.HEAL_FLAT:
          totals.healFlat += modifier.value;
          break;
        case MOD_TYPES.HEAL_PERCENT_MAX_HP:
          totals.healPercentMaxHp += modifier.value;
          break;
        case MOD_TYPES.ENEMY_DAMAGE_TAKEN_MULT:
          totals.enemyDamageTakenMult *= modifier.value;
          break;
        case MOD_TYPES.GOLD_FLAT:
          totals.goldFlat += modifier.value;
          break;
        case MOD_TYPES.LIFESTEAL_FLAT:
          totals.lifestealFlat += modifier.value;
          break;
        case MOD_TYPES.LIFESTEAL_PERCENT_DAMAGE:
          totals.lifestealPercentDamage += modifier.value;
          break;
      }
    }
  }

  return totals;
}

export function applyModifierTotals({
  playerHp,
  playerMaxHp,
  playerGold = 0,
  totals,
  context = {},
}) {
  let hp = playerHp;
  let gold = playerGold;

  if (totals.healFlat) {
    hp += totals.healFlat;
  }

  if (totals.healPercentMaxHp) {
    hp += Math.floor(playerMaxHp * totals.healPercentMaxHp);
  }

  if (totals.lifestealFlat && (context.didCrit || context.enemyKilled || context.damageDealt > 0)) {
    hp += totals.lifestealFlat;
  }

  if (totals.lifestealPercentDamage && context.damageDealt > 0) {
    hp += Math.floor(context.damageDealt * totals.lifestealPercentDamage);
  }

  if (totals.goldFlat) {
    gold += totals.goldFlat;
  }

  return {
    hp: clamp(hp, 0, playerMaxHp),
    gold,
  };
}
