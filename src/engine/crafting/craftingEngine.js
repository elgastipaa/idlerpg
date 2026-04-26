// Sistema de crafting — reroll, upgrade, ascend y extract.
// Futuro: recetas, materiales, estaciones de crafteo hookean acá.

import { polishAffix, generateReforgeOptions, ensureAffixCountForRarity } from "../affixesEngine";
import {
  buildBaseBonusForItem,
  buildItemFromAffixes,
  computeImplicitUpgradeBonus,
  computeUpgradeBonus,
  mergeBonusMaps,
  scaleBonusMapByTier,
  scaleAffixesForItemLevel,
} from "../../utils/loot";
import { calcItemRating, syncEquipment } from "../inventory/inventoryEngine";
import { ITEM_FAMILIES } from "../../data/itemFamilies";
import { getAscendCosts, getPolishCosts, getReforgeCosts, getUpgradeCosts } from "../../constants/craftingCosts";
import { applyEntropySpend, canSpendEntropy, getEntropyCostForMode, normalizeItemCraftingState } from "./entropyEngine";
import { getLegendaryPowerById } from "../../utils/legendaryPowers";

const RARITY_TIERS = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const RARITY_NEXT  = { common: "magic", magic: "rare", rare: "epic", epic: "legendary" };
export const UPGRADE_FAIL_CHANCE = { 0: 0 };
export const CRAFT_ACTION_LIMITS = {
  common: { reroll: 0, reforge: null, polishPerLine: null },
  magic: { reroll: 0, reforge: null, polishPerLine: null },
  rare: { reroll: 0, reforge: null, polishPerLine: null },
  epic: { reroll: 0, reforge: null, polishPerLine: null },
  legendary: { reroll: 0, reforge: null, polishPerLine: null },
};

export const UPGRADE_CAP_BY_RARITY = {
  common: 15,
  magic: 15,
  rare: 15,
  epic: 15,
  legendary: 15,
};

function getRarityTier(rarity) {
  return RARITY_TIERS[rarity] || 1;
}

function getNextRarity(rarity) {
  return RARITY_NEXT[rarity] || rarity;
}

function getImplicitBonus(item, rarityOverride = item.rarity) {
  const family = ITEM_FAMILIES[item.family];
  return scaleBonusMapByTier(
    family?.implicitByRarity?.[rarityOverride] || item.implicitBonus || {},
    item?.itemTier || item?.level || 1
  );
}

export function getCraftActionLimits(item) {
  return CRAFT_ACTION_LIMITS[item?.rarity] || CRAFT_ACTION_LIMITS.common;
}

export function getUpgradeCap(item) {
  return UPGRADE_CAP_BY_RARITY[item?.rarity] || UPGRADE_CAP_BY_RARITY.common;
}

export function getCraftingState(item) {
  const normalized = normalizeItemCraftingState({
    item,
    crafting: item?.crafting || {},
    rarity: item?.rarity,
    itemTier: item?.itemTier,
    level: item?.level,
    affixes: item?.affixes || [],
    isNewItem: false,
  });
  const rawPolishCounts = normalized?.polishCountsByIndex;
  const lineCraftCounts = normalized?.lineCraftCounts && typeof normalized.lineCraftCounts === "object"
    ? Object.fromEntries(
      Object.entries(normalized.lineCraftCounts)
        .filter(([key]) => Number.isInteger(Number(key)))
        .map(([key, value]) => [
          String(key),
          {
            polish: Math.max(0, Number(value?.polish || 0)),
            reforge: Math.max(0, Number(value?.reforge || 0)),
          },
        ])
    )
    : {};
  const polishCountsByIndex = rawPolishCounts && typeof rawPolishCounts === "object"
    ? Object.fromEntries(
        Object.entries(rawPolishCounts)
          .filter(([key]) => Number.isInteger(Number(key)))
          .map(([key, value]) => [String(key), Math.max(0, Number(value || 0))])
      )
    : {};
  return {
    rerollCount: normalized?.rerollCount || 0,
    polishCount: normalized?.polishCount || 0,
    reforgeCount: normalized?.reforgeCount || 0,
    ascendCount: normalized?.ascendCount || 0,
    entropy: Math.max(0, Number(normalized?.entropy || 0)),
    entropyCap: Math.max(1, Number(normalized?.entropyCap || 1)),
    stabilized: Boolean(normalized?.stabilized),
    craftingRulesVersion: Math.max(0, Number(normalized?.craftingRulesVersion || 0)),
    lineCraftCounts,
    polishCountsByIndex,
    focusedAffixIndex:
      Number.isInteger(normalized?.focusedAffixIndex) ? Number(normalized.focusedAffixIndex) : null,
    focusedAffixStat: normalized?.focusedAffixStat || null,
    history: Array.isArray(normalized?.history) ? normalized.history.slice(-5) : [],
    lastCraftAt: normalized?.lastCraftAt || null,
  };
}

function getPolishCountForIndex(item, affixIndex) {
  if (!Number.isInteger(affixIndex)) return 0;
  const craftingState = getCraftingState(item);
  return Math.max(0, Number(craftingState.polishCountsByIndex?.[String(affixIndex)] || 0));
}

function getLineCraftCountForMode(item, affixIndex, mode = "polish") {
  if (!Number.isInteger(affixIndex)) return 0;
  const craftingState = getCraftingState(item);
  if (mode === "polish") {
    return Math.max(0, Number(craftingState.lineCraftCounts?.[String(affixIndex)]?.polish || 0));
  }
  if (mode === "reforge") {
    return Math.max(0, Number(craftingState.lineCraftCounts?.[String(affixIndex)]?.reforge || 0));
  }
  return 0;
}

function getCraftLimitUsage(item, mode, affixIndex = null) {
  const craftingState = getCraftingState(item);
  const craftLimits = getCraftActionLimits(item);

  if (mode === "reroll") {
    return { used: craftingState.rerollCount, max: 0 };
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
  return true;
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
  score += affix?.quality === "excellent" ? 5 : 1;
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

  switch (mode) {
    case "upgrade":
      return (item.level || 0) < 6
        ? "Subila a +6 antes de gastar recursos finos; el power base sigue siendo la mejor compra."
        : "Ya esta entrando en tramo caro. Upgrade solo si esta pieza realmente sostiene la run.";
    case "reroll":
      return "Reroll total ya no forma parte de la forja actual.";
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
        : "Imbuir solo aplica sobre piezas epic que ya valga la pena cerrar.";
    default:
      return null;
  }
}

export function getForgeIdentity(item, { player = null, preferredStats = [], wishlistStats = [] } = {}) {
  if (!item) return null;

  const favoredStatsSet = buildStatPreferenceSet(preferredStats, wishlistStats);
  const affixes = item.affixes || [];
  const alignedAffixes = affixes.filter(affix => favoredStatsSet.has(affix.stat));
  const excellentCount = affixes.filter(affix => affix?.quality === "excellent").length;
  const usageSummary = getCraftUsageSummary(item);
  const compareItem = item.type === "weapon" ? player?.equipment?.weapon : player?.equipment?.armor;
  const powerDelta = (item.rating || 0) - (compareItem?.rating || 0);
  const ascendState = getCraftActionState({ item, player, mode: "ascend" });
  const nearAscend = item.rarity === "epic" && (item.level || 0) >= Math.max(0, (ascendState.minLevel || 0) - 1);
  const craftingState = getCraftingState(item);
  const polishLimit = getCraftActionLimits(item).polishPerLine;
  const hasOpenPolishLine = polishLimit == null
    ? (item.affixes || []).length > 0
    : (item.affixes || []).some((_, index) => getPolishCountForIndex(item, index) < polishLimit);

  const reasons = [];
  if (alignedAffixes.length > 0) reasons.push(`${alignedAffixes.length} linea${alignedAffixes.length === 1 ? "" : "s"} de build`);
  if (excellentCount > 0) reasons.push(`${excellentCount} excelente${excellentCount === 1 ? "" : "s"}`);
  if (powerDelta > 0) reasons.push("mejora clara");
  if (Number.isInteger(craftingState.focusedAffixIndex)) reasons.push("linea fijada");

  if (
    item.rarity === "legendary" ||
    (item.rarity === "epic" && (alignedAffixes.length >= 2 || excellentCount > 0 || nearAscend))
  ) {
    return {
      key: "chase",
      label: "CHASE",
      tone: "masterwork",
      summary: "Base de chase: merece recursos finos o Ascend para cerrar una pieza seria.",
      reasons: reasons.length > 0 ? reasons : ["epic con potencial real"],
    };
  }

  if ((usageSummary.reforge.remaining >= 1 || hasOpenPolishLine) && (powerDelta > 0 || alignedAffixes.length > 0 || getRarityTier(item.rarity) >= 3 || (item.level || 0) < 6)) {
    return {
      key: "tempo",
      label: "TEMPO",
      tone: "forged",
      summary: "Base de tempo: sirve para empujar esta run sin casarte todavia con la pieza.",
      reasons: reasons.length > 0 ? reasons : ["potencial alto para esta run"],
    };
  }

  if ((usageSummary.reforge.remaining <= 0 && !hasOpenPolishLine) || (alignedAffixes.length === 0 && powerDelta <= 0 && getRarityTier(item.rarity) <= 2)) {
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
  const craftingState = getCraftingState(item);
  const entropyMode = mode === "polish" ? "polish" : mode === "reforge" ? "reforge" : mode === "upgrade" ? "upgrade" : mode === "ascend" ? "imbue" : "";
  const entropyGate = entropyMode ? canSpendEntropy(craftingState, entropyMode) : { ok: true, reason: "ok", entropyCost: 0 };

  if (mode === "upgrade") {
    const currentLevel = item.level ?? 0;
    const maxLevel = getUpgradeCap(item);
    const displayMaxLevel = Math.max(maxLevel, currentLevel);
    const costs = getUpgradeCosts(item, player);
    const canAfford = (player?.gold || 0) >= costs.gold;
    const can = currentLevel < maxLevel && canAfford && entropyGate.ok;
    return {
      mode,
      costs: { ...costs, entropy: entropyGate.entropyCost || getEntropyCostForMode("upgrade") },
      can,
      reason: currentLevel >= maxLevel ? "max_level" : !entropyGate.ok ? entropyGate.reason : can ? "ok" : "gold",
      failChance: 0,
      usedUses: 0,
      maxUses: null,
      focusedAffixIndex,
      maxLevel: displayMaxLevel,
      entropy: craftingState.entropy,
      entropyCap: craftingState.entropyCap,
      entropyAfter: entropyGate.entropyAfter ?? craftingState.entropy,
      willStabilize: Boolean(entropyGate.willStabilize),
    };
  }

  if (mode === "reroll") {
    return {
      mode,
      costs: { gold: 0, essence: 0, entropy: 0 },
      can: false,
      reason: "deprecated",
      usedUses: craftGate.used,
      maxUses: craftGate.max,
      focusedAffixIndex,
      entropy: craftingState.entropy,
      entropyCap: craftingState.entropyCap,
    };
  }

  if (mode === "polish") {
    const lineCount = getLineCraftCountForMode(item, affixIndex, "polish");
    const costs = getPolishCosts(item, player, affix, { lineCount });
    const canAfford = (player?.gold || 0) >= costs.gold && (player?.essence || 0) >= costs.essence;
    return {
      mode,
      costs: { ...costs, entropy: entropyGate.entropyCost || getEntropyCostForMode("polish") },
      can: affixIndex != null && craftGate.ok && canAfford && entropyGate.ok,
      reason: affixIndex == null ? "missing_affix" : !craftGate.ok ? "limit" : !entropyGate.ok ? entropyGate.reason : canAfford ? "ok" : "essence",
      usedUses: craftGate.used,
      maxUses: craftGate.max,
      focusedAffixIndex,
      entropy: craftingState.entropy,
      entropyCap: craftingState.entropyCap,
      entropyAfter: entropyGate.entropyAfter ?? craftingState.entropy,
      willStabilize: Boolean(entropyGate.willStabilize),
    };
  }

  if (mode === "reforge") {
    const lineCount = getLineCraftCountForMode(item, affixIndex, "reforge");
    const costs = getReforgeCosts(item, player, affix, { lineCount });
    const canAfford = (player?.gold || 0) >= costs.gold && (player?.essence || 0) >= costs.essence;
    return {
      mode,
      costs: { ...costs, entropy: entropyGate.entropyCost || getEntropyCostForMode("reforge") },
      can: affixIndex != null && craftGate.ok && canAfford && entropyGate.ok,
      reason:
        affixIndex == null
          ? "missing_affix"
          : !craftGate.ok
              ? "limit"
              : !entropyGate.ok
                ? entropyGate.reason
                : canAfford
                ? "ok"
                : "essence",
      usedUses: craftGate.used,
      maxUses: craftGate.max,
      focusedAffixIndex,
      entropy: craftingState.entropy,
      entropyCap: craftingState.entropyCap,
      entropyAfter: entropyGate.entropyAfter ?? craftingState.entropy,
      willStabilize: Boolean(entropyGate.willStabilize),
    };
  }

  if (mode === "ascend") {
    const nextRarity = getNextRarity(item.rarity);
    const isEpicItem = item.rarity === "epic";
    const costs = getAscendCosts(item, player, {
      imprintPower: nextRarity === "legendary" && !!legendaryPowerId,
      imprintReduction: legendaryPowerImprintReduction,
    }) || { gold: 0, essence: 0, minLevel: 0 };
    const canAfford = (player?.gold || 0) >= costs.gold && (player?.essence || 0) >= costs.essence;
    const meetsLevel = (item.level ?? 0) >= (costs.minLevel || 0);
    const isMaxRarity = item.rarity === "legendary";
    return {
      mode,
      costs: { ...costs, entropy: entropyGate.entropyCost || getEntropyCostForMode("imbue") },
      can: !isMaxRarity && isEpicItem && meetsLevel && canAfford && entropyGate.ok,
      reason:
        isMaxRarity
          ? "max_rarity"
          : !isEpicItem
            ? "epic_only"
          : !meetsLevel
            ? "min_level"
            : !entropyGate.ok
              ? entropyGate.reason
              : canAfford
              ? "ok"
              : "essence",
      usedUses: 0,
      maxUses: null,
      focusedAffixIndex,
      minLevel: costs.minLevel || 0,
      nextRarity,
      entropy: craftingState.entropy,
      entropyCap: craftingState.entropyCap,
      entropyAfter: entropyGate.entropyAfter ?? craftingState.entropy,
      willStabilize: Boolean(entropyGate.willStabilize),
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
  return {
    newPlayer: player,
    blocked: true,
    log: "REROLL TOTAL DESACTIVADO - usa Afinar o Reforjar en la Forja del Santuario.",
  };
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
  const entropySpend = canSpendEntropy(craftingState, "polish");
  if (!entropySpend.ok) {
    return {
      newPlayer: player,
      blocked: true,
      log: `ESTABILIZADO - ${item.name} ya no puede afinarse.`,
    };
  }
  const targetAffix = item.affixes[affixIndex];
  const linePolishCount = getLineCraftCountForMode(item, affixIndex, "polish");
  const { gold: goldCost, essence: essenceCost } = getPolishCosts(item, player, targetAffix, {
    lineCount: linePolishCount,
  });

  if (player.gold < goldCost || (player.essence || 0) < essenceCost) return null;

  const polishedAffixes = polishAffix(item, affixIndex);
  const { nextCrafting } = applyEntropySpend(craftingState, "polish");
  const updatedItem = rebuildItem(item, polishedAffixes, {
    crafting: {
      ...nextCrafting,
      polishCount: craftingState.polishCount + 1,
      polishCountsByIndex: {
        ...(craftingState.polishCountsByIndex || {}),
        [String(affixIndex)]: getPolishCountForIndex(item, affixIndex) + 1,
      },
      lineCraftCounts: {
        ...(craftingState.lineCraftCounts || {}),
        [String(affixIndex)]: {
          polish: linePolishCount + 1,
          reforge: getLineCraftCountForMode(item, affixIndex, "reforge"),
        },
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
    log: `AFINADO - ${item.name} reajusta ${updatedAffix?.stat || "affix"}${updatedItem?.crafting?.stabilized ? " y queda estabilizado." : "."}`,
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
  if (!replacementAffix?.id || !replacementAffix?.stat) return null;

  const targetAffix = item.affixes[affixIndex];
  if (!targetAffix) return null;
  const keepsCurrentAffix =
    replacementAffix?.id === targetAffix.id &&
    replacementAffix?.stat === targetAffix.stat &&
    replacementAffix?.quality === targetAffix?.quality &&
    (replacementAffix?.rolledValue ?? replacementAffix?.value ?? null) === (targetAffix?.rolledValue ?? targetAffix?.value ?? null);

  if (keepsCurrentAffix) {
    return {
      newPlayer: player,
      noChange: true,
      log: `REFORJA - ${item.name} mantiene ${targetAffix.stat}.`,
    };
  }

  const craftingState = getCraftingState(item);
  const entropySpend = skipCost ? { ok: true } : canSpendEntropy(craftingState, "reforge");
  if (!skipCost && !entropySpend.ok) {
    return {
      newPlayer: player,
      blocked: true,
      log: `ESTABILIZADO - ${item.name} ya no puede reforjarse.`,
    };
  }
  const lineReforgeCount = getLineCraftCountForMode(item, affixIndex, "reforge");
  const { gold: goldCost, essence: essenceCost } = getReforgeCosts(item, player, targetAffix, {
    lineCount: lineReforgeCount,
  });

  if (!skipCost && (player.gold < goldCost || (player.essence || 0) < essenceCost)) return null;

  const reforgedAffixes = (item.affixes || []).map((affix, index) => (index === affixIndex ? replacementAffix : affix));
  const { nextCrafting } = skipCost
    ? { nextCrafting: { ...craftingState } }
    : applyEntropySpend(craftingState, "reforge");
  const updatedItem = rebuildItem(item, reforgedAffixes, {
    crafting: {
      ...nextCrafting,
      reforgeCount: skipCost ? craftingState.reforgeCount : craftingState.reforgeCount + 1,
      lineCraftCounts: skipCost
        ? { ...(craftingState.lineCraftCounts || {}) }
        : {
            ...(craftingState.lineCraftCounts || {}),
            [String(affixIndex)]: {
              polish: getLineCraftCountForMode(item, affixIndex, "polish"),
              reforge: lineReforgeCount + 1,
            },
          },
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
    log: `REFORJA - ${item.name} cambia ${targetAffix.stat} por ${replacementAffix.stat}${updatedItem?.crafting?.stabilized ? " y queda estabilizado." : "."}`,
  };
}

export function craftReforgePreview({ player, itemId, affixIndex, favoredStats = [], extraAffixPool = [], refreshStats = nextPlayer => nextPlayer }) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  const limitBlock = getCraftLimitBlock(item, "reforge");
  if (limitBlock) return { ...limitBlock, newPlayer: player };
  if (!Array.isArray(item.affixes) || item.affixes.length === 0) return null;
  if (affixIndex == null || affixIndex < 0 || affixIndex >= item.affixes.length) return null;

  const targetAffix = item.affixes[affixIndex];
  if (!targetAffix?.id) return null;

  const craftingState = getCraftingState(item);
  const entropySpend = canSpendEntropy(craftingState, "reforge");
  if (!entropySpend.ok) {
    return {
      newPlayer: player,
      blocked: true,
      log: `ESTABILIZADO - ${item.name} ya no puede reforjarse.`,
    };
  }
  const lineReforgeCount = getLineCraftCountForMode(item, affixIndex, "reforge");
  const { gold: goldCost, essence: essenceCost } = getReforgeCosts(item, player, targetAffix, {
    lineCount: lineReforgeCount,
  });

  if (player.gold < goldCost || (player.essence || 0) < essenceCost) return null;

  const totalOptionCount = 3;
  const optionCount = 2;
  const allowedExtraAffixPool = ["epic", "legendary"].includes(item?.rarity) ? extraAffixPool : [];
  const generated = generateReforgeOptions(item, affixIndex, optionCount, favoredStats, allowedExtraAffixPool)
    .map(affix => ({
      ...(scaleAffixesForItemLevel([affix], item.rarity, item.level || 0)[0] || affix),
      quality: "normal",
      qualityLabel: "Normal",
      lootOnlyQuality: false,
    }));
  if (!generated.length) return null;

  const { nextCrafting } = applyEntropySpend(craftingState, "reforge");
  const previewItem = rebuildItem(item, item.affixes || [], {
    crafting: {
      ...nextCrafting,
      reforgeCount: craftingState.reforgeCount + 1,
      lineCraftCounts: {
        ...(craftingState.lineCraftCounts || {}),
        [String(affixIndex)]: {
          polish: getLineCraftCountForMode(item, affixIndex, "polish"),
          reforge: lineReforgeCount + 1,
        },
      },
    },
  });
  let newPlayer = updatePlayerItem(player, locatedItem, previewItem, refreshStats);
  newPlayer = {
    ...player,
    ...newPlayer,
    gold: player.gold - goldCost,
    essence: (player.essence || 0) - essenceCost,
  };

  return {
    newPlayer,
    options: [previewItem?.affixes?.[affixIndex] || targetAffix, ...generated],
    log: `REFORJA PREPARADA - ${item.name}: elige 1 de ${Math.min(totalOptionCount, 1 + generated.length)} opciones para ${targetAffix.stat}.`,
  };
}

export function buildReforgePreview(item, affixIndex, optionCount = 2, favoredStats = [], extraAffixPool = []) {
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

  const craftingState = getCraftingState(item);
  const entropySpend = canSpendEntropy(craftingState, "upgrade");
  if (!entropySpend.ok) {
    return {
      newPlayer: player,
      blocked: true,
      log: `ESTABILIZADO - ${item.name} ya no puede mejorarse.`,
    };
  }
  const goldCost = getUpgradeCosts(item, player).gold;
  if (player.gold < goldCost) return null;

  const newLevel      = currentLevel + 1;
  const newAffixes    = item.affixes || [];
  const { nextCrafting } = applyEntropySpend(craftingState, "upgrade");
  const updatedItem  = rebuildItem(item, newAffixes, {
    level: newLevel,
    crafting: {
      ...nextCrafting,
    },
  });
  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = { ...player, ...newPlayer, gold: player.gold - goldCost };

  const log = `UPGRADE - ${item.name} sube a +${newLevel}${updatedItem?.crafting?.stabilized ? " y queda estabilizado." : "."}`;

  return { newPlayer, log };
}

// ============================================================
// ASCEND
// ============================================================
export function craftAscend({
  player,
  itemId,
  currentTier,
  refreshStats,
  legendaryPowerId = null,
  unlockedLegendaryPowerIds = [],
  legendaryPowerImprintReduction = 0,
  skipCost = false,
  requireEpicOnly = true,
}) {
  const locatedItem = findPlayerItem(player, itemId);
  if (!locatedItem) return null;

  const item = locatedItem.item;
  if (requireEpicOnly && item.rarity !== "epic") {
    return {
      newPlayer: player,
      blocked: true,
      log: "IMBUIR BLOQUEADO - solo las piezas epic pueden convertirse en legendarias.",
    };
  }
  if (item.rarity === "legendary") return null;
  const craftingState = getCraftingState(item);
  const entropySpend = canSpendEntropy(craftingState, "imbue");
  if (!entropySpend.ok) {
    return {
      newPlayer: player,
      blocked: true,
      log: `ESTABILIZADO - ${item.name} ya no puede imbuirse.`,
    };
  }

  const newRarity    = getNextRarity(item.rarity);
  const selectedLegendaryPower =
    newRarity === "legendary" && unlockedLegendaryPowerIds.includes(legendaryPowerId)
      ? getLegendaryPowerById(legendaryPowerId)
      : null;
  if (newRarity === "legendary" && legendaryPowerId && !selectedLegendaryPower) {
    return {
      newPlayer: player,
      blocked: true,
      log: "ASCEND BLOQUEADO - el poder legendario elegido no esta desbloqueado en Biblioteca.",
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
  if (!skipCost && (player.gold < goldCost || (player.essence || 0) < essenceCost)) return null;
  const craftingTier = Math.max(currentTier || 1, item.itemTier || 1);
  const { nextCrafting } = applyEntropySpend(craftingState, "imbue");
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
      ...nextCrafting,
      ascendCount: craftingState.ascendCount + 1,
    },
  });
  let newPlayer = updatePlayerItem(player, locatedItem, updatedItem, refreshStats);
  newPlayer = skipCost
    ? {
        ...player,
        ...newPlayer,
      }
    : {
        ...player,
        ...newPlayer,
        gold: player.gold - goldCost,
        essence: player.essence - essenceCost,
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

