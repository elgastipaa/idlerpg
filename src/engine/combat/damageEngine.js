export function computePlayerDamage({
  baseDamage,
  skillDamage = 0,
  effectMods = {},
  eventMods = {},
  critChance = 0,
  critMult = 2,
  context = {},
}) {
  // -----------------------
  // 1. BASE
  // -----------------------
  let dmg = baseDamage + skillDamage;

  // -----------------------
  // 2. FLAT
  // -----------------------
  dmg += (effectMods.damageFlat || 0);

  // -----------------------
  // 3. MULTIPLIERS (SEPARADOS)
  // -----------------------
  const multBase =
    (effectMods.damageMult || 1) *
    (eventMods.damageMult || 1);

  const multVsBoss = context.isBoss
    ? (effectMods.bossDamageMult || 1)
    : 1;

  const multExecute =
    context.enemyHpPct < 0.3
      ? (effectMods.executeMult || 1)
      : 1;

  dmg *= multBase * multVsBoss * multExecute;

  // -----------------------
  // 4. CRIT AVANZADO
  // -----------------------
  const finalCritChance =
    critChance + (effectMods.critChanceBonus || 0);

  const isCrit = Math.random() < finalCritChance;

  const finalCritMult =
    critMult + (effectMods.critMultBonus || 0);

  if (isCrit) {
    dmg *= finalCritMult;
  }

  // -----------------------
  // 5. FINAL MODS
  // -----------------------
  dmg *= (effectMods.finalDamageMult || 1);

  return {
    damage: Math.floor(dmg),
    isCrit,
  };
}