// Sistema de crafting — reroll, upgrade, ascend y extract.
// Futuro: recetas, materiales, estaciones de crafteo hookean acá.

import { rerollAffixes, polishAffix, generateReforgeOptions, ensureAffixCountForRarity } from "../affixesEngine";
import {
  buildBaseBonusForItem,
  buildItemFromAffixes,
  computeImplicitUpgradeBonus,
  computeUpgradeBonus,
  mergeBonusMaps,
  scaleAffixesForItemLevel,
} from "../../utils/loot";
import { calcItemRating, syncEquipment } from "../inventory/inventoryEngine";
import { ITEM_FAMILIES } from "../../data/itemFamilies";
import { getAscendCosts, getPolishCosts, getReforgeCosts, getRerollCosts, getUpgradeCosts } from "../../constants/craftingCosts";
import { getLegendaryPowerById } from "../../utils/legendaryPowers";

const RARITY_TIERS = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const RARITY_NEXT  = { common: "magic", magic: "rare", rare: "epic", epic: "legendary" };
export const UPGRADE_FAIL_CHANCE = { 0: 0, 1: 0, 2: 0.03, 3: 0.08, 4: 0.15, 5: 0.22, 6: 0.3, 7: 0.39, 8: 0.48, 9: 0.57, 10: 0.66 };
export const CRAFT_ACTION_LIMITS = {
  common: { reroll: 2, reforge: 1, polishPerLine: 3 },
  magic: { reroll: 3, reforge: 2, polishPerLine: 4 },
  rare: { reroll: 10, reforge: 8, polishPerLine: 12 },
  epic: { reroll: 5, reforge: 4, polishPerLine: 6 },
  legendary: { reroll: 3, reforge: 3, polishPerLine: 5 },
};
export const UPGRADE_CAP_BY_RARITY = {
  common: 5,
  magic: 7,
  rare: 10,
  epic: 10,
  legendary: 10,
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

export function getCraftActionLimits(item) {
  return CRAFT_ACTION_LIMITS[item?.rarity] || CRAFT_ACTION_LIMITS.common;
}

export function getUpgradeCap(item) {
  return UPGRADE_CAP_BY_RARITY[item?.rarity] || UPGRADE_CAP_BY_RARITY.common;
}

export function getCraftingState(item) {
  const rawPolishCounts = item?.crafting?.polishCountsByIndex;
  const polishCountsByIndex = rawPolishCounts && typeof rawPolishCounts === "object"
    ? Object.fromEntries(
        Object.entries(rawPolishCounts)
          .filter(([key]) => Number.isInteger(Number(key)))
          .map(([key, value]) => [String(key), Math.max(0, Number(value || 0))])
      )
    : {};
  return {
    rerollCount: item?.crafting?.rerollCount || 0,
    polishCount: item?.crafting?.polishCount || 0,
    reforgeCount: item?.crafting?.reforgeCount || 0,
    ascendCount: item?.crafting?.ascendCount || 0,
    polishCountsByIndex,
    focusedAffixIndex:
      Number.isInteger(item?.crafting?.focusedAffixIndex) ? Number(item.crafting.focusedAffixIndex) : null,
    focusedAffixStat: item?.crafting?.focusedAffixStat || null,
  };
}

function getPolishCountForIndex(item, affixIndex) {
  if (!Number.isInteger(affixIndex)) return 0;
  const craftingState = getCraftingState(item);
  return Math.max(0, Number(craftingState.polishCountsByIndex?.[String(affixIndex)] || 0));
}

function getCraftLimitUsage(item, mode, affixIndex = null) {
  const craftingState = getCraftingState(item);
  const craftLimits = getCraftActionLimits(item);

  if (mode === "reroll") {
    return { used: craftingState.rerollCount, max: craftLimits.reroll };
  }

  if (mode === "reforge") {
    return { used: craftingState.reforgeCount, max: craftLimits.reforge };
  }

  if (mode === "polish") {
    return { used: getPolishCountForIndex(item, affixIndex), max: craftLimits.polishPerLine };
  }

  return { used: 0, max: null };
}

function getCraftLimitGate(item, mode, affixIndex = null) {
  const usage = getCraftLimitUsage(item, mode, affixIndex);
  if (usage.max == null) return { ...usage, remaining: null, ok: true };
  return {
    ...usage,
    remaining: Math.max(0, usage.max - usage.used),
    ok: usage.used < usage.max,
  };
}

function getCraftLimitBlock(item, mode, affixIndex = null) {
  const gate = getCraftLimitGate(item, mode, affixIndex);
  if (gate.ok) return null;
  const modeLabel =
    mode === "reroll"
      ? "rerolls"
      : mode === "reforge"
        ? "reforjas"
        : mode === "polish"
          ? "pulidos"
          : mode;
  return {
    newPlayer: null,
    blocked: true,
    log: `LIMITE ALCANZADO - ${item.name} ya gasto ${gate.used}/${gate.max} ${modeLabel}.`,
  };
}

export function getCraftUsageSummary(item, affixIndex = null) {
  const reroll = getCraftLimitGate(item, "reroll");
  const reforge = getCraftLimitGate(item, "reforge");
  const polish = getCraftLimitGate(item, "polish", affixIndex);
  return { reroll, reforge, polish };
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

function buildStatPreferenceSet(preferredStats = [], wishlistStats = []) {
  return new Set([...(preferredStats || []), ...(wishlistStats || [])].filter(Boolean));
}

function getAffixAlignmentScore(affix, favoredStatsSet) {
  if (!affix) return -999;
  let score = 0;
  if (favoredStatsSet.has(affix.stat)) score += 8;
  score += (affix.tier || 0) * 3;
  if (affix.perfectRoll) score += 2;
  score += Number(affix.rolledValue || affix.value || 0) * 0.015;
  return score;
}

export function pickSuggestedAffixIndex(item, { mode, preferredStats = [], wishlistStats = [] } = {}) {
  if (!Array.isArray(item?.affixes) || item.affixes.length === 0) return null;
  const craftingState = getCraftingState(item);
  if (Number.isInteger(craftingState.focusedAffixIndex)) {
    return craftingState.focusedAffixIndex;
  }

  const favoredStatsSet = buildStatPreferenceSet(preferredStats, wishlistStats);
  const scored = item.affixes.map((affix, index) => ({
    affix,
    index,
    score: getAffixAlignmentScore(affix, favoredStatsSet),
    matchesBuild: favoredStatsSet.has(affix.stat),
  }));

  if (mode === "polish") {
    return [...scored].sort((left, right) => right.score - left.score || right.index - left.index)[0]?.index ?? null;
  }

  if (mode === "reforge") {
    const worstOffBuild = [...scored]
      .sort((left, right) => {
        if (left.matchesBuild !== right.matchesBuild) return left.matchesBuild ? 1 : -1;
        return left.score - right.score || left.index - right.index;
      })[0];
    return worstOffBuild?.index ?? null;
  }

  return null;
}

export function getCraftRecommendation(item, { mode, preferredStats = [], wishlistStats = [] } = {}) {
  if (!item) return null;
  const craftingState = getCraftingState(item);
  const suggestedAffixIndex = pickSuggestedAffixIndex(item, { mode, preferredStats, wishlistStats });
  const suggestedAffix = Number.isInteger(suggestedAffixIndex) ? item.affixes?.[suggestedAffixIndex] : null;
  const matchingAffixes = (item.affixes || []).filter(affix => buildStatPreferenceSet(preferredStats, wishlistStats).has(affix.stat)).length;

  switch (mode) {
    case "upgrade":
      if (item.rarity === "rare" && (item.level || 0) >= 6) {
        return "Desde +7 el rare tambien escala affixes. Si la base ya cerro, este es su tramo de proyecto real.";
      }
      return (item.level || 0) < 6
        ? "Subila a +6 antes de gastar recursos finos; el power base sigue siendo la mejor compra."
        : "Ya esta entrando en tramo caro. Upgrade solo si esta pieza realmente sostiene la run.";
    case "reroll":
      return matchingAffixes >= 2
        ? `Esta base ya tiene ${matchingAffixes} linea${matchingAffixes === 1 ? "" : "s"} alineada${matchingAffixes === 1 ? "" : "s"} con tu build. No conviene reroll total salvo que busques resetearla.`
        : "Tiene poca sinergia con la build actual. El reroll total es razonable si la base vale la pena.";
    case "polish":
      return suggestedAffix
        ? "Pulir tiene sentido aca: ya hay una linea buena y solo falta cerrar el valor."
        : "Pulir vale mas cuando ya encontraste una linea que realmente queres conservar.";
    case "reforge":
      if (Number.isInteger(craftingState.focusedAffixIndex) && suggestedAffix) {
        return "La pieza ya quedo fijada. Segui esa linea o dejala como esta.";
      }
      return suggestedAffix
        ? "La reforja tiene sentido si queres reemplazar la linea mas floja sin resetear toda la pieza."
        : "Reforja una linea floja para perseguir la stat que te falta; no la uses como reroll encubierto.";
    case "ascend":
      return item.rarity === "epic"
        ? "Ascend tiene sentido si esta pieza ya empuja la run y queres convertirla en base legendaria."
        : "Ascend vale mas sobre piezas ya buenas. Si esta base no te convence, no la conviertas por inercia.";
    default:
      return null;
  }
}

export function getForgeIdentity(item, { player = null, preferredStats = [], wishlistStats = [] } = {}) {
  if (!item) return null;

  const favoredStatsSet = buildStatPreferenceSet(preferredStats, wishlistStats);
  const affixes = item.affixes || [];
  const alignedAffixes = affixes.filter(affix => favoredStatsSet.has(affix.stat));
  const t1Count = affixes.filter(affix => (affix.tier || 0) === 1).length;
  const perfectCount = affixes.filter(affix => affix.perfectRoll).length;
  const usageSummary = getCraftUsageSummary(item);
  const compareItem = item.type === "weapon" ? player?.equipment?.weapon : player?.equipment?.armor;
  const powerDelta = (item.rating || 0) - (compareItem?.rating || 0);
  const ascendState = getCraftActionState({ item, player, mode: "ascend" });
  const nearAscend = item.rarity === "epic" && (item.level || 0) >= Math.max(0, (ascendState.minLevel || 0) - 1);
  const craftingState = getCraftingState(item);
  const polishLimit = getCraftActionLimits(item).polishPerLine;
  const hasOpenPolishLine = (item.affixes || []).some((_, index) => getPolishCountForIndex(item, index) < polishLimit);

  const reasons = [];
  if (alignedAffixes.length > 0) reasons.push(`${alignedAffixes.length} linea${alignedAffixes.length === 1 ? "" : "s"} de build`);
  if (t1Count > 0) reasons.push(`${t1Count} T1`);
  if (perfectCount > 0) reasons.push(`${perfectCount} perfect`);
  if (powerDelta > 0) reasons.push("mejora clara");
  if (Number.isInteger(craftingState.focusedAffixIndex)) reasons.push("linea fijada");

  if (
    item.rarity === "legendary" ||
    (item.rarity === "epic" && (alignedAffixes.length >= 2 || t1Count > 0 || perfectCount > 0 || nearAscend))
  ) {
    return {
      key: "chase",
      label: "CHASE",
      tone: "masterwork",
      summary: "Base de chase: merece recursos finos o Ascend para cerrar una pieza seria.",
      reasons: reasons.length > 0 ? reasons : ["epic con potencial real"],
    };
  }

  if ((usageSummary.reroll.remaining >= 2 || usageSummary.reforge.remaining >= 1 || hasOpenPolishLine) && (powerDelta > 0 || alignedAffixes.length > 0 || getRarityTier(item.rarity) >= 3 || (item.level || 0) < 6)) {
    return {
      key: "tempo",
      label: "TEMPO",
      tone: "forged",
      summary: "Base de tempo: sirve para empujar esta run sin casarte todavia con la pieza.",
      reasons: reasons.length > 0 ? reasons : ["potencial alto para esta run"],
    };
  }

  if ((usageSummary.reroll.remaining <= 0 && usageSummary.reforge.remaining <= 0 && !hasOpenPolishLine) || (alignedAffixes.length === 0 && powerDelta <= 0 && getRarityTier(item.rarity) <= 2)) {
    return {
      key: "skip",
      label: "NO GASTAR",
      tone: "crafted",
      summary: "No vale recursos finos. Vendela, extraela o guardala solo si te falta base.",
      reasons: reasons.length > 0 ? reasons : ["poca sinergia y poco techo"],
    };
  }

  return {
    key: "solid",
    label: "SOLIDA",
    tone: "build",
    summary: "Base correcta, pero no prioritaria. Vale mirar si aparece algo mejor antes de hundir recursos.",
    reasons: reasons.length > 0 ? reasons : ["usable, pero no diferencial"],
  };
}

export function getCraftActionState({ item, player, mode, affixIndex = null, legendaryPowerId = null, legendaryPowerImprintReduction = 0 } = {}) {
  if (!item) {
    return {
      mode,
      costs: { gold: 0, essence: 0 },
      can: false,
      reason: "missing_item",
      usedUses: 0,
      maxUses: null,
      focusedAffixIndex: null,
    };
  }

  const affix = affixIndex == null ? null : item?.affixes?.[affixIndex] || null;
  const focusedAffixIndex = getCraftingState(item).focusedAffixIndex;
  const craftGate = getCraftLimitGate(item, mode, affixIndex);

  if (mode === "upgrade") {
    const currentLevel = item.level ?? 0;
    const maxLevel = getUpgradeCap(item);
    const displayMaxLevel = Math.max(maxLevel, currentLevel);
    const costs = getUpgradeCosts(item, player);
    const can = currentLevel < maxLevel && (player?.gold || 0) >= costs.gold;
    return {
      mode,
      costs,
      can,
      reason: currentLevel >= maxLevel ? "max_level" : can ? "ok" : "gold",
      failChance: UPGRADE_FAIL_CHANCE[currentLevel] ?? 0.46,
      usedUses: 0,
      maxUses: null,
      focusedAffixIndex,
      maxLevel: displayMaxLevel,
    };
  }

  if (mode === "reroll") {
    const costs = getRerollCosts(item, player);
    const canAfford = (player?.gold || 0) >= costs.gold && (player?.essence || 0) >= costs.essence;
    return {
      mode,
      costs,
      can: craftGate.ok && canAfford,
      reason: !craftGate.ok ? "limit" : canAfford ? "ok" : "essence",
      usedUses: craftGate.used,
      maxUses: craftGate.max,
      focusedAffixIndex,
    };
  }

  if (mode === "polish") {
    const costs = getPolishCosts(item, player, affix);
    const canAfford = (player?.gold || 0) >= costs.gold && (player?.essence || 0) >= costs.essence;
    return {
      mode,
      costs,
      can: affixIndex != null && craftGate.ok && canAfford,
      reason: affixIndex == null ? "missing_affix" : !craftGate.ok ? "limit" : canAfford ? "ok" : "essence",
      usedUses: craftGate.used,
      maxUses: craftGate.max,
      focusedAffixIndex,
    };
  }

  if (mode === "reforge") {
    const costs = getReforgeCosts(item, player, affix);
    const lineLocked = Number.isInteger(focusedAffixIndex) && affixIndex != null && focusedAffixIndex !== affixIndex;
    const canAfford = (player?.gold || 0) >= costs.gold && (player?.essence || 0) >= costs.essence;
    return {
      mode,
      costs,
      can: affixIndex != null && !lineLocked && craftGate.ok && canAfford,
      reason:
        affixIndex == null
          ? "missing_affix"
          : lineLocked
            ? "focused_line"
            : !craftGate.ok
              ? "limit"
              : canAfford
                ? "ok"
                : "essence",
      usedUses: craftGate.used,
      maxUses: craftGate.max,
      focusedAffixIndex,
    };
  }

  if (mode === "ascend") {
    const nextRarity = getNextRarity(item.rarity);
    const costs = getAscendCosts(item, player, {
      imprintPower: nextRarity === "legendary" && !!legendaryPowerId,
      imprintReduction: legendaryPowerImprintReduction,
    }) || { gold: 0, essence: 0, minLevel: 0 };
    const canAfford = (player?.gold || 0) >= costs.gold && (player?.essence || 0) >= costs.essence;
    const meetsLevel = (item.level ?? 0) >= (costs.minLevel || 0);
    const isMaxRarity = item.rarity === "legendary";
    return {
      mode,
      costs,
      can: !isMaxRarity && meetsLevel && canAfford,
      reason:
        isMaxRarity
          ? "max_rarity"
          : !meetsLevel
            ? "min_level"
            : canAfford
              ? "ok"
              : "essence",
      usedUses: 0,
      maxUses: null,
      focusedAffixIndex,
      minLevel: costs.minLevel || 0,
      nextRarity,
    };
  }

  return {
    mode,
    costs: { gold: 0, essence: 0 },
    can: false,
    reason: "unsupported_mode",
    usedUses: 0,
    maxUses: null,
    focusedAffixIndex,
  };
}

function rebuildItem(item, newAffixes, extraProps = {}) {
  const nextRarity = extraProps.rarity || item.rarity;
  const nextLevel = extraProps.level ?? item.level ?? 0;
  const nextBaseBonus = extraProps.baseBonus || item.baseBonus || {};
  const implicitBonus = extraProps.implicitBonus || getImplicitBonus(item, nextRarity);
  const upgradeBonus = extraProps.upgradeBonus || computeUpgradeBonus(nextBaseBonus, item.type, nextLevel);
  const implicitUpgradeBonus =
    extraProps.implicitUpgradeBonus || computeImplicitUpgradeBonus(implicitBonus, item.type, nextLevel);
  const scaledAffixes = scaleAffixesForItemLevel(newAffixes || [], nextRarity, nextLevel);
  const { bonus } = buildItemFromAffixes({
    ...item,
    bonus: mergeBonusMaps(nextBaseBonus, upgradeBonus, implicitBonus, implicitUpgradeBonus),
  }, scaledAffixes);
  return {
    ...item,
    ...extraProps,
    implicitBonus,
    upgradeBonus,
    implicitUpgradeBonus,
    crafting: {
      ...getCraftingState(item),
      ...(extraProps.crafting || {}),
    },
    affixes: scaledAffixes,
    bonus,
    rating: calcItemRating({ ...item, ...extraProps, bonus }),
  };
}

export function buildCraftedItemPreview(item, extraProps = {}) {
  if (!item) return null;
  return rebuildItem(item, extraProps.affixes || item.affixes || [], extraProps);
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
  const limitBlock = getCraftLimitBlock(item, "reroll");
  if (limitBlock) return limitBlock;
  const craftingState = getCraftingState(item);
  const { gold: goldCost, essence: essenceCost } = getRerollCosts(item, player);

  if (player.gold < goldCost || (player.essence || 0) < essenceCost) return null;

  const rerollTier = Math.max(currentTier || 1, item.itemTier || 1);
  const newAffixes   = rerollAffixes(item, rerollTier);
  const updatedItem  = rebuildItem(item, newAffixes, {
    crafting: {
      ...craftingState,
      rerollCount: craftingState.rerollCount + 1,
      polishCount: 0,
      polishCountsByIndex: {},
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

  return { newPlayer, log: `REROLL TOTAL - ${item.name} rehace por completo sus affixes.` };
}

// ============================================================
// POLISH
// ============================================================
export function craftPolish({ player, itemId, affixIndex, refreshStats }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  const limitBlock = getCraftLimitBlock(item, "polish", affixIndex);
  if (limitBlock) return limitBlock;
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
      polishCountsByIndex: {
        ...(craftingState.polishCountsByIndex || {}),
        [String(affixIndex)]: getPolishCountForIndex(item, affixIndex) + 1,
      },
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
  const limitBlock = getCraftLimitBlock(item, "reforge");
  if (limitBlock) return { ...limitBlock, newPlayer: player };
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
  const keepsCurrentAffix =
    replacementAffix?.id === targetAffix.id &&
    replacementAffix?.stat === targetAffix.stat &&
    replacementAffix?.tier === targetAffix.tier &&
    (replacementAffix?.rolledValue ?? replacementAffix?.value ?? null) === (targetAffix?.rolledValue ?? targetAffix?.value ?? null);

  if (keepsCurrentAffix) {
    return {
      newPlayer: player,
      noChange: true,
      log: `REFORJA - ${item.name} mantiene ${targetAffix.stat}. No se fija ninguna linea.`,
    };
  }

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

export function craftReforgePreview({ player, itemId, affixIndex, favoredStats = [], extraAffixPool = [] }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  const limitBlock = getCraftLimitBlock(item, "reforge");
  if (limitBlock) return { ...limitBlock, newPlayer: player };
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

  const optionCount = 3 + Math.max(0, Math.floor(player?.prestigeBonuses?.reforgeOptionCount || 0));
  const allowedExtraAffixPool = ["epic", "legendary"].includes(item?.rarity) ? extraAffixPool : [];
  const generated = generateReforgeOptions(item, affixIndex, optionCount, favoredStats, allowedExtraAffixPool)
    .map(affix => scaleAffixesForItemLevel([affix], item.rarity, item.level || 0)[0] || affix);
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

export function buildReforgePreview(item, affixIndex, optionCount = 3, favoredStats = [], extraAffixPool = []) {
  const allowedExtraAffixPool = ["epic", "legendary"].includes(item?.rarity) ? extraAffixPool : [];
  return generateReforgeOptions(item, affixIndex, optionCount, favoredStats, allowedExtraAffixPool)
    .map(affix => scaleAffixesForItemLevel([affix], item?.rarity, item?.level || 0)[0] || affix);
}

// ============================================================
// UPGRADE
// ============================================================
export function craftUpgrade({ player, itemId, refreshStats }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item         = locatedItem.item;
  const currentLevel = item.level ?? 0;
  const maxLevel = getUpgradeCap(item);
  if (currentLevel >= maxLevel) return null;

  const goldCost = getUpgradeCosts(item, player).gold;
  if (player.gold < goldCost) return null;

  const failed        = Math.random() < (UPGRADE_FAIL_CHANCE[currentLevel] ?? 0.46);
  const newLevel      = failed ? Math.max(0, currentLevel - 1) : currentLevel + 1;
  const newAffixes    = item.affixes || [];

  const updatedItem  = rebuildItem(item, newAffixes, { level: newLevel });
  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = { ...player, ...newPlayer, gold: player.gold - goldCost };

  const log = failed
    ? `⚠ Upgrade fallido — ${item.name} bajó a nivel ${newLevel}`
    : `⬆ Upgrade exitoso — ${item.name} subió a nivel ${newLevel}`;

  return { newPlayer, log };
}

// ============================================================
// ASCEND
// ============================================================
export function craftAscend({ player, itemId, currentTier, refreshStats, legendaryPowerId = null, unlockedLegendaryPowerIds = [], legendaryPowerImprintReduction = 0 }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  if (item.rarity === "legendary") return null;

  const newRarity    = getNextRarity(item.rarity);
  const selectedLegendaryPower =
    newRarity === "legendary" && unlockedLegendaryPowerIds.includes(legendaryPowerId)
      ? getLegendaryPowerById(legendaryPowerId)
      : null;
  if (newRarity === "legendary" && legendaryPowerId && !selectedLegendaryPower) {
    return {
      newPlayer: player,
      blocked: true,
      log: "ASCEND BLOQUEADO - el poder legendario elegido no esta desbloqueado en el Codex.",
    };
  }
  const ascendCost  = getAscendCosts(item, player, {
    imprintPower: !!selectedLegendaryPower,
    imprintReduction: legendaryPowerImprintReduction,
  });
  if (!ascendCost) return null;
  if ((item.level ?? 0) < ascendCost.minLevel) return null;
  const goldCost    = ascendCost.gold;
  const essenceCost = ascendCost.essence;
  if (player.gold < goldCost || (player.essence || 0) < essenceCost) return null;
  const craftingTier = Math.max(currentTier || 1, item.itemTier || 1);
  const craftingState = getCraftingState(item);
  const nextBaseBonus = buildBaseBonusForItem({
    baseItem: { ...item, bonus: item.baseBonus || {} },
    rarity: newRarity,
    tier: craftingTier,
    existingBaseBonus: item.baseBonus || {},
    ensureMinBaseLines: true,
  });
  const preservedAffixes = ensureAffixCountForRarity({
    affixes: item?.affixes || [],
    rarity: newRarity,
    itemTier: craftingTier,
    baseBonus: nextBaseBonus,
    implicitBonus: getImplicitBonus(item, newRarity),
  });
  const updatedItem  = rebuildItem(item, preservedAffixes, {
    rarity: newRarity,
    itemTier: craftingTier,
    legendaryPowerId: newRarity === "legendary" ? (selectedLegendaryPower?.id || null) : null,
    baseBonus: nextBaseBonus,
    implicitBonus: getImplicitBonus(item, newRarity),
    crafting: {
      ...craftingState,
      ascendCount: craftingState.ascendCount + 1,
    },
  });
  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = {
    ...player,
    ...newPlayer,
    gold:      player.gold    - goldCost,
    essence:   player.essence - essenceCost,
  };

  return {
    newPlayer,
    log: `🌟 ASCENDIDO - ${item.name} ahora es ${newRarity}.${selectedLegendaryPower ? ` Injerta ${selectedLegendaryPower.name}.` : " Conserva affixes y mejora base + implicit."}`,
  };
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

