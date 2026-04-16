// Gestión de inventario — rating, orden, cap.
// Futuro: filtros por set, joyas, slots especiales hookean acá.

const INVENTORY_CAP = 50;

export function calcItemRating(item) {
  if (!item?.bonus) return 0;
  const {
    damage = 0,
    defense = 0,
    healthMax = 0,
    healthRegen = 0,
    critChance = 0,
    critDamage = 0,
    lifesteal = 0,
    attackSpeed = 0,
    multiHitChance = 0,
    bleedChance = 0,
    bleedDamage = 0,
    fractureChance = 0,
    markChance = 0,
    markEffectPerStack = 0,
    dodgeChance = 0,
    blockChance = 0,
    damageOnKill = 0,
    critOnLowHp = 0,
    thorns = 0,
    goldBonus = 0,
    xpBonus = 0,
    essenceBonus = 0,
    luck = 0,
    cooldownReduction = 0,
    skillPower = 0,
    lootBonus = 0,
    voidStrikeChance = 0,
    abyssalCritFractureChance = 0,
    echoHitChance = 0,
    enemyAffixDamagePct = 0,
    enemyAffixLifesteal = 0,
    phaseSkin = 0,
    abyssRegenFlat = 0,
    bossMechanicMitigation = 0,
  } = item.bonus;
  const effectiveMultiHit = multiHitChance + cooldownReduction;
  const effectiveCritDamage = critDamage + skillPower;
  const isWeapon = item.type === "weapon";
  const r = { common: 1, magic: 1.08, rare: 1.2, epic: 1.38, legendary: 1.58 }[item.rarity] || 1;
  const combatScore =
    damage * (isWeapon ? 5.2 : 2.2) +
    defense * (isWeapon ? 2.4 : 6.4) +
    healthMax * (isWeapon ? 0.12 : 0.22) +
    healthRegen * (isWeapon ? 9 : 15) +
    critChance * (isWeapon ? 420 : 240) +
    effectiveCritDamage * (isWeapon ? 210 : 125) +
    lifesteal * (isWeapon ? 340 : 140) +
    attackSpeed * (isWeapon ? 300 : 145) +
    effectiveMultiHit * (isWeapon ? 360 : 160) +
    bleedChance * (isWeapon ? 240 : 95) +
    bleedDamage * (isWeapon ? 280 : 120) +
    fractureChance * (isWeapon ? 210 : 90) +
    markChance * (isWeapon ? 260 : 150) +
    markEffectPerStack * (isWeapon ? 280 : 165) +
    dodgeChance * (isWeapon ? 115 : 215) +
    blockChance * (isWeapon ? 105 : 270) +
    damageOnKill * (isWeapon ? 16 : 7) +
    critOnLowHp * (isWeapon ? 210 : 110) +
    thorns * (isWeapon ? 4 : 7.5) +
    voidStrikeChance * (isWeapon ? 340 : 180) +
    abyssalCritFractureChance * (isWeapon ? 280 : 140) +
    echoHitChance * (isWeapon ? 320 : 160) +
    enemyAffixDamagePct * (isWeapon ? 260 : 120) +
    enemyAffixLifesteal * (isWeapon ? 220 : 140) +
    phaseSkin * (isWeapon ? 80 : 220) +
    abyssRegenFlat * (isWeapon ? 6 : 12) +
    bossMechanicMitigation * (isWeapon ? 120 : 260);
  const economyScore =
    goldBonus * 0.05 +
    xpBonus * 6 +
    essenceBonus * 1.5 +
    luck * 0.25 +
    lootBonus * 8;
  const levelWeight = 1 + Math.max(0, (item.level || 0) * 0.02);
  const legendaryEnablerScore = item.legendaryPowerId ? 180 : 0;
  const score = ((combatScore * 0.92 + economyScore * 0.08) * levelWeight) + legendaryEnablerScore;
  return Math.round(score * r);
}

export function addToInventory(inventory, newItem) {
  const itemWithRating = { ...newItem, rating: calcItemRating(newItem) };
  const updated = [...inventory, itemWithRating]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (updated.length > INVENTORY_CAP) {
    const dropped = updated[updated.length - 1];
    return { inventory: updated.slice(0, INVENTORY_CAP), droppedName: dropped.name };
  }
  return { inventory: updated, droppedName: null };
}

export function syncEquipment(player, updatedItem, refreshStats) {
  const eq   = player.equipment || {};
  const slot = updatedItem.type === "weapon" ? "weapon" : "armor";
  if (eq[slot]?.id !== updatedItem.id) return player;
  return refreshStats({ ...player, equipment: { ...eq, [slot]: updatedItem } });
}
