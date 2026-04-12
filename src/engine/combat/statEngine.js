// Fuente única de verdad para stats del jugador.
// Futuro: joyas, sets, mapas hookean acá agregando modificadores.

const CRIT_CAP = 0.75;
const ATTACK_SPEED_CAP = 0.7;

export function calcStats(player) {
  const eq     = player.equipment || {};
  const weapon = eq.weapon;
  const armor  = eq.armor;
  const prestige = player.prestigeBonuses || {};

  const eqFlatDmg  = (weapon?.bonus?.damage     || 0) + (armor?.bonus?.damage     || 0);
  const eqFlatDef  = (weapon?.bonus?.defense    || 0) + (armor?.bonus?.defense    || 0);
  const eqFlatCrit = (weapon?.bonus?.critChance || 0) + (armor?.bonus?.critChance || 0);
  const eqFlatGold = (weapon?.bonus?.goldBonus  || 0) + (armor?.bonus?.goldBonus  || 0);
  const eqGoldPct  = (weapon?.bonus?.goldBonusPct || 0) + (armor?.bonus?.goldBonusPct || 0);
  const eqXpPct    = (weapon?.bonus?.xpBonus    || 0) + (armor?.bonus?.xpBonus    || 0);
  const eqFlatHp   = (weapon?.bonus?.healthMax  || 0) + (armor?.bonus?.healthMax  || 0);
  const eqRegen    = (weapon?.bonus?.healthRegen || 0) + (armor?.bonus?.healthRegen || 0);
  const eqAttackSpeed = (weapon?.bonus?.attackSpeed || 0) + (armor?.bonus?.attackSpeed || 0);
  const eqLifesteal = (weapon?.bonus?.lifesteal || 0) + (armor?.bonus?.lifesteal || 0);
  const eqDodgeChance = (weapon?.bonus?.dodgeChance || 0) + (armor?.bonus?.dodgeChance || 0);
  const eqBlockChance = (weapon?.bonus?.blockChance || 0) + (armor?.bonus?.blockChance || 0);
  const eqCritDamage = (weapon?.bonus?.critDamage || 0) + (armor?.bonus?.critDamage || 0);
  const eqCritOnLowHp = (weapon?.bonus?.critOnLowHp || 0) + (armor?.bonus?.critOnLowHp || 0);
  const eqDamageOnKill = (weapon?.bonus?.damageOnKill || 0) + (armor?.bonus?.damageOnKill || 0);
  const eqThorns = (weapon?.bonus?.thorns || 0) + (armor?.bonus?.thorns || 0);
  const eqEssenceBonus = (weapon?.bonus?.essenceBonus || 0) + (armor?.bonus?.essenceBonus || 0);
  const eqLootBonus = (weapon?.bonus?.lootBonus || 0) + (armor?.bonus?.lootBonus || 0);
  const eqLuck = (weapon?.bonus?.luck || 0) + (armor?.bonus?.luck || 0);
  const eqCooldownReduction = (weapon?.bonus?.cooldownReduction || 0) + (armor?.bonus?.cooldownReduction || 0);
  const eqSkillPower = (weapon?.bonus?.skillPower || 0) + (armor?.bonus?.skillPower || 0);

  const damage = Math.max(1, Math.floor(
    (player.baseDamage + eqFlatDmg + (player.flatDamage || 0) + (prestige.flatDamage || 0)) *
      (1 + (player.damagePct || 0) + (prestige.damagePct || 0))
  ));
  const defense = Math.max(0, Math.floor(
    (player.baseDefense + eqFlatDef + (player.flatDefense || 0) + (prestige.flatDefense || 0)) *
      (1 + (player.defensePct || 0) + (prestige.defensePct || 0))
  ));
  const maxHp = Math.max(1, Math.floor(
    (player.baseMaxHp + (player.flatHp || 0) + eqFlatHp) *
      (1 + (player.hpPct || 0) + (prestige.hpPct || 0))
  ));
  const critChance = Math.min(CRIT_CAP,
    (player.baseCritChance || 0.05) + (player.flatCrit || 0) + (prestige.flatCrit || 0) + eqFlatCrit
  );

  return {
    damage,
    defense,
    critChance,
    maxHp,
    regen: (player.flatRegen || 0) + (prestige.healthRegen || 0) + eqRegen,
    goldPct:  (player.goldPct  || 0) + (prestige.goldPct || 0) + eqGoldPct,
    flatGold: (player.flatGold || 0) + eqFlatGold,
    xpPct:    (player.xpPct   || 0) + (prestige.xpPct || 0) + eqXpPct,
    attackSpeed: Math.min(ATTACK_SPEED_CAP, (player.attackSpeed || 0) + (prestige.attackSpeed || 0) + eqAttackSpeed),
    lifesteal: (player.lifesteal || 0) + (prestige.lifesteal || 0) + eqLifesteal,
    dodgeChance: (player.dodgeChance || 0) + (prestige.dodgeChance || 0) + eqDodgeChance,
    blockChance: (player.blockChance || 0) + (prestige.blockChance || 0) + eqBlockChance,
    critDamage: (player.critDamage || 0) + (prestige.critDamage || 0) + eqCritDamage,
    critOnLowHp: (player.critOnLowHp || 0) + (prestige.critOnLowHp || 0) + eqCritOnLowHp,
    damageOnKill: (player.damageOnKill || 0) + (prestige.damageOnKill || 0) + eqDamageOnKill,
    thorns: (player.thorns || 0) + (prestige.thorns || 0) + eqThorns,
    essenceBonus: (player.essenceBonus || 0) + (prestige.essenceBonus || 0) + eqEssenceBonus,
    lootBonus: (player.lootBonus || 0) + (prestige.lootBonus || 0) + eqLootBonus,
    luck: (player.luck || 0) + (prestige.luck || 0) + eqLuck,
    cooldownReduction: (player.cooldownReduction || 0) + (prestige.cooldownReduction || 0) + eqCooldownReduction,
    skillPower: (player.skillPower || 0) + (prestige.skillPower || 0) + eqSkillPower,
    sellValueBonus: (player.sellValueBonus || 0) + (prestige.sellValueBonus || 0),
  };
}

export function refreshStats(player) {
  const s = calcStats(player);
  return {
    ...player,
    damage:     s.damage,
    defense:    s.defense,
    critChance: s.critChance,
    maxHp:      s.maxHp,
  };
}
