// Operaciones económicas sobre el inventario.
// Futuro: impuestos, gremios, subastas hookean acá.

export function sellItem(player, itemId) {
  const idx = player.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return null;

  const item = player.inventory[idx];
  const sellMultiplier = 1 + (player.sellValueBonus || 0) + (player.prestigeBonuses?.sellValueBonus || 0);
  return {
    ...player,
    gold:      player.gold + Math.floor((item.sellValue || 0) * sellMultiplier),
    inventory: player.inventory.filter((_, i) => i !== idx),
  };
}

export function sellItems(player, itemIds = []) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return null;

  const ids = new Set(itemIds);
  const itemsToSell = (player.inventory || []).filter(item => ids.has(item.id));
  if (itemsToSell.length === 0) return null;

  const sellMultiplier = 1 + (player.sellValueBonus || 0) + (player.prestigeBonuses?.sellValueBonus || 0);
  const goldGained = itemsToSell.reduce((total, item) => total + Math.floor((item.sellValue || 0) * sellMultiplier), 0);

  return {
    ...player,
    gold: (player.gold || 0) + goldGained,
    inventory: (player.inventory || []).filter(item => !ids.has(item.id)),
  };
}
