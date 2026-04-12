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
  } = item.bonus;
  const r = { common: 1, magic: 1.25, rare: 1.5, epic: 2.5, legendary: 4 }[item.rarity] || 1;
  const score =
    damage +
    defense +
    healthMax * 0.12 +
    healthRegen * 6 +
    critChance * 180 +
    critDamage * 110 +
    lifesteal * 160 +
    attackSpeed * 140 +
    dodgeChance * 150 +
    blockChance * 165 +
    damageOnKill * 4 +
    critOnLowHp * 90 +
    thorns * 2.5 +
    goldBonus * 0.5 +
    xpBonus * 40 +
    essenceBonus * 12 +
    luck * 1.2 +
    cooldownReduction * 130 +
    skillPower * 120 +
    lootBonus * 55;
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
