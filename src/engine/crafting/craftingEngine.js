// Sistema de crafting — reroll, upgrade, ascend, extract, fuse.
// Futuro: recetas, materiales, estaciones de crafteo hookean acá.

import { rerollAffixes, polishAffix, generateReforgeOptions, addAffix, mergeAffixes } from "../affixesEngine";
import { buildBaseBonusForItem, buildItemFromAffixes, computeUpgradeBonus, mergeBonusMaps } from "../../utils/loot";
import { calcItemRating, addToInventory, syncEquipment } from "../inventory/inventoryEngine";
import { ITEM_FAMILIES } from "../../data/itemFamilies";
import { getAscendCosts, getPolishCosts, getReforgeCosts, getRerollCosts } from "../../constants/craftingCosts";

const RARITY_TIERS = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const RARITY_NEXT  = { common: "magic", magic: "rare", rare: "epic", epic: "legendary" };
const FUSE_RARITY_CHANCE = {
  common: 0.12,
  magic: 0.12,
  rare: 0.08,
  epic: 0.03,
  legendary: 0,
};
function getRarityTier(rarity) {
  return RARITY_TIERS[rarity] || 1;
}

function getNextRarity(rarity) {
  return RARITY_NEXT[rarity] || rarity;
}

function getImplicitBonus(item, rarityOverride = item.rarity) {
  const family = ITEM_FAMILIES[item.family];
  return { ...(family?.implicitByRarity?.[rarityOverride] || item.implicitBonus || {}) };
}

function getCraftingState(item) {
  return {
    rerollCount: item?.crafting?.rerollCount || 0,
    polishCount: item?.crafting?.polishCount || 0,
    reforgeCount: item?.crafting?.reforgeCount || 0,
    focusedAffixIndex:
      Number.isInteger(item?.crafting?.focusedAffixIndex) ? Number(item.crafting.focusedAffixIndex) : null,
    focusedAffixStat: item?.crafting?.focusedAffixStat || null,
  };
}

function isTargetedAffixAllowed(item, affixIndex) {
  const focusedAffixIndex = getCraftingState(item).focusedAffixIndex;
  return focusedAffixIndex == null || focusedAffixIndex === affixIndex;
}

function getTargetedAffixBlockLog(item) {
  const craftingState = getCraftingState(item);
  if (craftingState.focusedAffixIndex == null) return null;
  const focusedAffix = item?.affixes?.[craftingState.focusedAffixIndex];
  return `LINEA FIJADA - ${item.name} ya tiene trabajada ${focusedAffix?.stat || craftingState.focusedAffixStat || "otra linea"}.`;
}

function rebuildItem(item, newAffixes, extraProps = {}) {
  const nextRarity = extraProps.rarity || item.rarity;
  const nextLevel = extraProps.level ?? item.level ?? 0;
  const nextBaseBonus = extraProps.baseBonus || item.baseBonus || {};
  const implicitBonus = extraProps.implicitBonus || getImplicitBonus(item, nextRarity);
  const upgradeBonus = extraProps.upgradeBonus || computeUpgradeBonus(nextBaseBonus, item.type, nextLevel);
  const { bonus } = buildItemFromAffixes({
    ...item,
    bonus: mergeBonusMaps(nextBaseBonus, upgradeBonus, implicitBonus),
  }, newAffixes);
  return {
    ...item,
    ...extraProps,
    implicitBonus,
    upgradeBonus,
    crafting: {
      ...getCraftingState(item),
      ...(extraProps.crafting || {}),
    },
    affixes: newAffixes,
    bonus,
    rating: calcItemRating({ ...item, ...extraProps, bonus }),
  };
}

function findPlayerItem(player, itemId) {
  const inventoryIndex = player.inventory.findIndex(i => i.id === itemId);
  if (inventoryIndex !== -1) {
    return { source: "inventory", index: inventoryIndex, item: player.inventory[inventoryIndex] };
  }

  const equipment = player.equipment || {};
  if (equipment.weapon?.id === itemId) {
    return { source: "equipment", slot: "weapon", item: equipment.weapon };
  }

  if (equipment.armor?.id === itemId) {
    return { source: "equipment", slot: "armor", item: equipment.armor };
  }

  return null;
}

function isEquippedItemId(player, itemId) {
  if (!itemId) return false;
  const equipment = player?.equipment || {};
  return equipment.weapon?.id === itemId || equipment.armor?.id === itemId;
}

function updatePlayerItem(player, locatedItem, updatedItem, refreshStats) {
  if (!locatedItem) return player;

  if (locatedItem.source === "inventory") {
    const newInventory = [...player.inventory];
    newInventory[locatedItem.index] = updatedItem;
    return syncEquipment({ ...player, inventory: newInventory }, updatedItem, refreshStats);
  }

  const equipment = {
    ...(player.equipment || {}),
    [locatedItem.slot]: updatedItem,
  };

  return refreshStats({ ...player, equipment });
}

function removePlayerItem(player, locatedItem) {
  if (!locatedItem) return player;

  if (locatedItem.source === "inventory") {
    return {
      ...player,
      inventory: player.inventory.filter(item => item.id !== locatedItem.item.id),
    };
  }

  return {
    ...player,
    equipment: {
      ...(player.equipment || {}),
      [locatedItem.slot]: null,
    },
  };
}

// ============================================================
// REROLL
// ============================================================
export function craftReroll({ player, itemId, currentTier, refreshStats }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item        = locatedItem.item;
  const craftingState = getCraftingState(item);
  const { gold: goldCost, essence: essenceCost } = getRerollCosts(item, player);

  if (player.gold < goldCost || (player.essence || 0) < essenceCost) return null;

  const rerollTier = Math.max(currentTier || 1, item.itemTier || 1);
  const newAffixes   = rerollAffixes(item, rerollTier);
  const updatedItem  = rebuildItem(item, newAffixes, {
    crafting: {
      ...craftingState,
      rerollCount: craftingState.rerollCount + 1,
      focusedAffixIndex: null,
      focusedAffixStat: null,
    },
  });
  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = {
    ...player,
    ...newPlayer,
    gold:      player.gold    - goldCost,
    essence:   player.essence - essenceCost,
  };

  return { newPlayer, log: `REROLL TOTAL - ${item.name} vuelve a tirar tiers y valores de sus affixes.` };
}

// ============================================================
// POLISH
// ============================================================
export function craftPolish({ player, itemId, affixIndex, refreshStats }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  if (!Array.isArray(item.affixes) || item.affixes.length === 0) return null;
  if (affixIndex == null || affixIndex < 0 || affixIndex >= item.affixes.length) return null;

  const craftingState = getCraftingState(item);
  const targetAffix = item.affixes[affixIndex];
  const { gold: goldCost, essence: essenceCost } = getPolishCosts(item, player, targetAffix);

  if (player.gold < goldCost || (player.essence || 0) < essenceCost) return null;

  const polishedAffixes = polishAffix(item, affixIndex);
  const updatedItem = rebuildItem(item, polishedAffixes, {
    crafting: {
      ...craftingState,
      polishCount: craftingState.polishCount + 1,
    },
  });

  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = {
    ...player,
    ...newPlayer,
    gold: player.gold - goldCost,
    essence: player.essence - essenceCost,
  };

  const updatedAffix = updatedItem.affixes?.[affixIndex];
  return {
    newPlayer,
    log: `PULIDO - ${item.name} reajusta ${updatedAffix?.stat || "affix"} en T${updatedAffix?.tier || "?"}.`,
  };
}

// ============================================================
// REFORGE
// ============================================================
export function craftReforge({ player, itemId, affixIndex, replacementAffix, refreshStats, skipCost = false }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  if (!Array.isArray(item.affixes) || item.affixes.length === 0) return null;
  if (affixIndex == null || affixIndex < 0 || affixIndex >= item.affixes.length) return null;
  if (!isTargetedAffixAllowed(item, affixIndex)) {
    return {
      newPlayer: player,
      blocked: true,
      log: getTargetedAffixBlockLog(item),
    };
  }
  if (!replacementAffix?.id || !replacementAffix?.stat) return null;

  const targetAffix = item.affixes[affixIndex];
  if (!targetAffix) return null;

  const craftingState = getCraftingState(item);
  const { gold: goldCost, essence: essenceCost } = getReforgeCosts(item, player, targetAffix);

  if (!skipCost && (player.gold < goldCost || (player.essence || 0) < essenceCost)) return null;

  const reforgedAffixes = (item.affixes || []).map((affix, index) => (index === affixIndex ? replacementAffix : affix));
  const updatedItem = rebuildItem(item, reforgedAffixes, {
    crafting: {
      ...craftingState,
      reforgeCount: craftingState.reforgeCount + 1,
      focusedAffixIndex: affixIndex,
      focusedAffixStat: replacementAffix?.stat || targetAffix?.stat || craftingState.focusedAffixStat || null,
    },
  });

  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = skipCost
    ? { ...player, ...newPlayer }
    : {
        ...player,
        ...newPlayer,
        gold: player.gold - goldCost,
        essence: player.essence - essenceCost,
      };

  return {
    newPlayer,
    log: `REFORJA - ${item.name} cambia ${targetAffix.stat} por ${replacementAffix.stat} [linea trabajada].`,
  };
}

export function craftReforgePreview({ player, itemId, affixIndex, favoredStats = [] }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  if (!Array.isArray(item.affixes) || item.affixes.length === 0) return null;
  if (affixIndex == null || affixIndex < 0 || affixIndex >= item.affixes.length) return null;
  if (!isTargetedAffixAllowed(item, affixIndex)) {
    return {
      newPlayer: player,
      blocked: true,
      log: getTargetedAffixBlockLog(item),
    };
  }

  const targetAffix = item.affixes[affixIndex];
  if (!targetAffix?.id) return null;

  const { gold: goldCost, essence: essenceCost } = getReforgeCosts(item, player, targetAffix);

  if (player.gold < goldCost || (player.essence || 0) < essenceCost) return null;

  const optionCount = 2 + Math.max(0, Math.floor(player?.prestigeBonuses?.reforgeOptionCount || 0));
  const generated = generateReforgeOptions(item, affixIndex, optionCount, favoredStats);
  if (!generated.length) return null;

  return {
    newPlayer: {
      ...player,
      gold: player.gold - goldCost,
      essence: (player.essence || 0) - essenceCost,
    },
    options: [targetAffix, ...generated],
    log: `REFORJA PREPARADA - ${item.name}: elige 1 de ${1 + generated.length} opciones para ${targetAffix.stat}.`,
  };
}

export function buildReforgePreview(item, affixIndex, optionCount = 2, favoredStats = []) {
  return generateReforgeOptions(item, affixIndex, optionCount, favoredStats);
}

// ============================================================
// UPGRADE
// ============================================================
export function craftUpgrade({ player, itemId, refreshStats }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item         = locatedItem.item;
  const currentLevel = item.level ?? 0;
  if (currentLevel >= 10) return null;

  const rarityTier = getRarityTier(item.rarity);
  const reduction = Math.max(0, Math.min(0.65, player?.prestigeBonuses?.upgradeCostReduction || 0));
  const upgradeStep = currentLevel + 1;
  const goldCost   = Math.floor(180 * upgradeStep * upgradeStep * rarityTier * (1 - reduction));
  if (player.gold < goldCost) return null;

  const failChanceByLevel = { 0: 0, 1: 0, 2: 0.02, 3: 0.06, 4: 0.12, 5: 0.18, 6: 0.24, 7: 0.31, 8: 0.38, 9: 0.45, 10: 0.52 };
  const failed        = Math.random() < (failChanceByLevel[currentLevel] ?? 0.46);
  const newLevel      = failed ? Math.max(0, currentLevel - 1) : currentLevel + 1;
  const newAffixes    = item.affixes || [];

  const updatedItem  = rebuildItem(item, newAffixes, { level: newLevel });
  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = { ...player, ...newPlayer, gold: player.gold - goldCost };

  const log = failed
    ? `⚠ Upgrade fallido — ${item.name} bajó a nivel ${newLevel}`
    : `⬆ ${item.name} subió a nivel ${newLevel}`;

  return { newPlayer, log };
}

// ============================================================
// ASCEND
// ============================================================
export function craftAscend({ player, itemId, currentTier, refreshStats }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  if (item.rarity === "legendary") return null;

  const ascendCost  = getAscendCosts(item, player);
  if (!ascendCost) return null;
  if ((item.level ?? 0) < ascendCost.minLevel) return null;
  const goldCost    = ascendCost.gold;
  const essenceCost = ascendCost.essence;
  if (player.gold < goldCost || (player.essence || 0) < essenceCost) return null;

  const newRarity    = getNextRarity(item.rarity);
  const craftingTier = Math.max(currentTier || 1, item.itemTier || 1);
  const nextBaseBonus = buildBaseBonusForItem({
    baseItem: { ...item, bonus: item.baseBonus || {} },
    rarity: newRarity,
    tier: craftingTier,
    existingBaseBonus: item.baseBonus || {},
    ensureMinBaseLines: true,
  });
  const newAffixes   = addAffix({
    ...item,
    rarity: newRarity,
    baseBonus: nextBaseBonus,
    affixes: item.affixes || [],
    itemTier: craftingTier,
  }, craftingTier);
  const updatedItem  = rebuildItem(item, newAffixes, {
    rarity: newRarity,
    baseBonus: nextBaseBonus,
    implicitBonus: getImplicitBonus(item, newRarity),
  });
  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = {
    ...player,
    ...newPlayer,
    gold:      player.gold    - goldCost,
    essence:   player.essence - essenceCost,
  };

  return { newPlayer, log: `🌟 ${item.name} ascendió a ${newRarity}` };
}

// ============================================================
// EXTRACT
// ============================================================
export function craftExtract({ player, itemId }) {
  if (isEquippedItemId(player, itemId)) return null;
  const idx = player.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return null;

  const item          = player.inventory[idx];
  const rarityTier = getRarityTier(item.rarity);
  const rarityMult = { common: 1, magic: 1.4, rare: 2, epic: 3, legendary: 5 }[item.rarity] || 1;
  const essenceGained = Math.max(1, Math.floor((rarityTier + Math.floor((item.level ?? 0) / 2)) * rarityMult));

  const newPlayer = {
    ...player,
    essence:   (player.essence || 0) + essenceGained,
    inventory: player.inventory.filter((_, i) => i !== idx),
  };

  return { newPlayer, log: `🔥 ${item.name} extraído — +${essenceGained} esencia` };
}

// ============================================================
// FUSE
// ============================================================
export function craftFuse({ player, itemAId, itemBId, refreshStats }) {
  const locatedA = findPlayerItem(player, itemAId);
  const locatedB = findPlayerItem(player, itemBId);
  if (!locatedA || !locatedB || itemAId === itemBId) return null;

  const itemA = locatedA.item;
  const itemB = locatedB.item;
  if (itemA.itemId !== itemB.itemId) return null;

  const newLevel  = Math.max(itemA.level ?? 0, itemB.level ?? 0);
  const rarityUpgradeChance = FUSE_RARITY_CHANCE[itemA.rarity] || 0;
  const fuseBonus = Math.max(0, player?.prestigeBonuses?.fuseRarityBonus || 0);
  const newRarity = Math.random() < Math.min(0.95, rarityUpgradeChance + fuseBonus) ? getNextRarity(itemA.rarity) : itemA.rarity;
  const merged    = mergeAffixes(itemA.affixes || [], itemB.affixes || []);
  const fusedTier = Math.max(itemA.itemTier || 1, itemB.itemTier || 1);
  const nextBaseBonus = buildBaseBonusForItem({
    baseItem: { ...itemA, bonus: itemA.baseBonus || {} },
    rarity: newRarity,
    tier: fusedTier,
    existingBaseBonus: itemA.baseBonus || {},
    ensureMinBaseLines: true,
  });
  const implicitBonus = getImplicitBonus(itemA, newRarity);
  const upgradeBonus = computeUpgradeBonus(nextBaseBonus, itemA.type, newLevel);
  const { bonus } = buildItemFromAffixes({
    ...itemA,
    bonus: {
      ...nextBaseBonus,
      ...upgradeBonus,
      ...implicitBonus,
    },
  }, merged);

  const fusedItem = {
    ...itemA,
    id:        `${itemA.itemId}_fused_${Date.now()}`,
    level:     newLevel,
    rarity:    newRarity,
    upgradeBonus,
    implicitBonus,
    crafting: {
      rerollCount: 0,
      polishCount: 0,
      reforgeCount: 0,
      focusedAffixIndex: null,
      focusedAffixStat: null,
    },
    affixes:   merged,
    bonus,
    baseBonus: { ...nextBaseBonus },
    rating:    calcItemRating({ ...itemA, rarity: newRarity, bonus }),
    name:      newRarity !== itemA.rarity
      ? `${itemA.name} [Ascendido]`
      : `${itemA.name} [Fusionado]`,
  };

  const removedA = removePlayerItem(player, locatedA);
  const removedB = removePlayerItem(removedA, locatedB);
  const result = addToInventory(removedB.inventory || [], fusedItem);

  const newPlayer = refreshStats({
    ...removedB,
    inventory: result.inventory,
  });
  const log       = `⚡ Fusión — ${fusedItem.name}${newRarity !== itemA.rarity ? " ¡subió de rareza!" : ""}`;

  return { newPlayer, log };
}
