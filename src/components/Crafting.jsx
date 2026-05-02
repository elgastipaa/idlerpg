import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useViewport from "../hooks/useViewport";
import {
  buildCraftedItemPreview,
  getCraftActionState,
} from "../engine/crafting/craftingEngine";
import { getUnlockedLegendaryPowers } from "../engine/progression/codexEngine";
import { hasAbyssUnlock } from "../engine/progression/abyssProgression";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
  formatItemNumber as formatNumber,
  formatItemStatValue as formatStatValue,
  formatItemDiffValue as formatDiffValue,
  getItemLocation,
  getPrioritizedStatEntries,
} from "../utils/itemPresentation";
import { getCompactRarityLabel } from "../utils/itemVisuals";
import { getItemAsset } from "../utils/assetRegistry";
import {
  FlAsset,
  FlButton,
  FlCard,
  FlPanelHeader,
  FlTabs,
} from "./ui/forge";
import FlForgeUpgradeModule from "./crafting/FlForgeUpgradeModule";
import FlForgePolishModule from "./crafting/FlForgePolishModule";
import FlForgeReforgeModule from "./crafting/FlForgeReforgeModule";
import FlForgeAscendModule from "./crafting/FlForgeAscendModule";
import {
  FORGE_MODE_META,
  FORGE_MODE_ORDER,
  formatCraftCostLabel,
  getCraftActionHint,
} from "./crafting/craftingUi";
import ForgeIcon from "./icons/ForgeIcon";

const RARITY_WEIGHT = Object.freeze({ common: 0, magic: 1, rare: 2, epic: 3, legendary: 4 });
const RARITY_ORDER = Object.freeze(["common", "magic", "rare", "epic", "legendary"]);
const SLOT_FILTERS = Object.freeze([
  { id: "all", label: "Todo" },
  { id: "weapon", label: "Armas" },
  { id: "armor", label: "Armaduras" },
]);
const RARITY_FILTERS = Object.freeze([
  { id: "all", label: "Todas" },
  { id: "common", label: "Common" },
  { id: "magic", label: "Magic" },
  { id: "rare", label: "Rare" },
  { id: "epic", label: "Epic" },
  { id: "legendary", label: "Legendary" },
]);

function formatRemainingDuration(ms = 0) {
  const totalSeconds = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

function isSameReforgeOption(left = null, right = null) {
  if (!left || !right) return false;
  return (
    left.id === right.id &&
    left.stat === right.stat &&
    left.quality === right.quality &&
    (left.rolledValue ?? left.value ?? null) === (right.rolledValue ?? right.value ?? null)
  );
}

function isItemEquipped(item = {}, equipment = {}) {
  if (!item?.id) return false;
  return equipment?.weapon?.id === item.id || equipment?.armor?.id === item.id;
}

function computeExtractYield(item = {}) {
  const rarityTier = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 }[item?.rarity] || 1;
  const rarityMult = { common: 1, magic: 1.4, rare: 2, epic: 3, legendary: 5 }[item?.rarity] || 1;
  return Math.max(1, Math.floor((rarityTier + Math.floor((item?.level ?? 0) / 2)) * rarityMult));
}

function getEntropyState(item = {}) {
  const entropy = Math.max(0, Number(item?.crafting?.entropy || 0));
  const entropyCap = Math.max(1, Number(item?.crafting?.entropyCap || 1));
  const stabilized = Boolean(item?.crafting?.stabilized) || entropy >= entropyCap;
  const ratio = entropyCap > 0 ? entropy / entropyCap : 1;
  if (stabilized) {
    return { id: "stabilized", label: "Estabilizado", tone: "danger" };
  }
  if (ratio >= 0.95) {
    return { id: "last", label: "Ultimo intento", tone: "warning" };
  }
  if (ratio >= 0.7) {
    return { id: "tense", label: "Tenso", tone: "warning" };
  }
  return { id: "flex", label: "Flexible", tone: "success" };
}

function buildAllItems(player = {}) {
  const inventory = Array.isArray(player?.inventory) ? player.inventory : [];
  const weapon = player?.equipment?.weapon;
  const armor = player?.equipment?.armor;
  return [
    ...inventory,
    ...(weapon ? [weapon] : []),
    ...(armor ? [armor] : []),
  ].filter(item => item && item.id);
}

function buildSortedItems(items = [], equipment = {}) {
  return [...items].sort((left, right) => {
    const leftLocation = getItemLocation(left, equipment);
    const rightLocation = getItemLocation(right, equipment);

    if (leftLocation && !rightLocation) return -1;
    if (!leftLocation && rightLocation) return 1;
    if (leftLocation && rightLocation && leftLocation !== rightLocation) {
      return leftLocation === "weapon" ? -1 : 1;
    }

    const rarityDiff = (RARITY_WEIGHT[right?.rarity] || 0) - (RARITY_WEIGHT[left?.rarity] || 0);
    if (rarityDiff !== 0) return rarityDiff;

    const ratingDiff = Math.round(Number(right?.rating || 0)) - Math.round(Number(left?.rating || 0));
    if (ratingDiff !== 0) return ratingDiff;

    return Math.round(Number(right?.level || 0)) - Math.round(Number(left?.level || 0));
  });
}

function canSelectItemForMode({
  item,
  mode,
  equipment,
  reforgeSession,
  hasPendingImbueJob,
}) {
  if (!item?.id) return false;
  if (reforgeSession?.itemId && reforgeSession.itemId !== item.id) return false;

  if (mode === "extract") {
    return !isItemEquipped(item, equipment) && !hasPendingImbueJob;
  }

  if (hasPendingImbueJob && mode !== "ascend") return false;

  if ((mode === "polish" || mode === "reforge") && (item?.affixes || []).length <= 0) {
    return false;
  }

  if (mode === "ascend") {
    if (hasPendingImbueJob) return true;
    return item?.rarity === "epic";
  }

  return true;
}

function getModeSummary(mode = "upgrade") {
  if (mode === "upgrade") return "Mejorar sube +1 sin fallo hasta +15.";
  if (mode === "polish") return "Afinar rerollea valor dentro del rango de una linea.";
  if (mode === "reforge") return "Reforjar paga preview y ofrece mantener actual + 2 opciones.";
  if (mode === "ascend") return "Imbuir inicia job en Santuario para pasar Epic a Legendary.";
  return "Extraer convierte piezas en esencia desde Santuario.";
}

function getCraftingItemIconName(item = {}) {
  if (item?.type === "armor") return "armor";
  if (item?.family === "focus") return "mark";
  if (item?.family === "wand") return "essence";
  return "combat";
}

function getRequirementHintType(reason = "") {
  if (reason === "gold" || reason === "essence") return "resource";
  if (reason === "min_level" || reason === "max_level") return "level";
  if (reason === "missing_item" || reason === "missing_affix") return "inventory";
  if (reason === "ok") return "prereq";
  return "locked";
}

function isCraftingLogError(entry = "") {
  return /BLOQUEADO|FALL|FALTA|NO PUED|OCUPADO|CANCELAD|PENDIENTE|ESTABILIZADO|SEGURIDAD|TRABAD/i.test(String(entry || ""));
}

export default function Crafting({ state, dispatch, onClose }) {
  const { isMobile } = useViewport();
  const player = state?.player || { inventory: [], equipment: {} };
  const equipment = player?.equipment || {};
  const sanctuaryResources = state?.sanctuary?.resources || {};
  const reforgeSession = state?.combat?.reforgeSession || null;
  const sanctuaryJobs = Array.isArray(state?.sanctuary?.jobs) ? state.sanctuary.jobs : [];
  const hasAbyssCraftingAffixes = hasAbyssUnlock(state?.abyss || {}, "craftingAffixes");

  const unlockedLegendaryPowers = useMemo(() => {
    try {
      return getUnlockedLegendaryPowers(state?.codex || {}, {
        specialization: player?.specialization,
        className: player?.class,
        abyss: state?.abyss || {},
      });
    } catch (error) {
      console.error("Crafting legendary powers fallback", error);
      return [];
    }
  }, [player?.class, player?.specialization, state?.abyss, state?.codex]);

  const unlockedLegendaryPowerMap = useMemo(
    () => Object.fromEntries(unlockedLegendaryPowers.map(power => [power.id, power])),
    [unlockedLegendaryPowers]
  );

  const [mode, setMode] = useState("upgrade");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [selectedAffixIndex, setSelectedAffixIndex] = useState(null);
  const [selectedReforgeOption, setSelectedReforgeOption] = useState(null);
  const [selectedAscendPowerId, setSelectedAscendPowerId] = useState(null);
  const [selectedExtractIds, setSelectedExtractIds] = useState([]);
  const [confirmExtract, setConfirmExtract] = useState(false);
  const [slotFilter, setSlotFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [craftingOutcome, setCraftingOutcome] = useState(null);
  const [craftingFloatFx, setCraftingFloatFx] = useState(null);
  const lastCraftingLogLengthRef = useRef(null);
  const craftingOutcomeTimerRef = useRef(null);
  const craftingFloatTimerRef = useRef(null);
  const craftingOutcomeIdRef = useRef(0);
  const craftingFloatIdRef = useRef(0);

  const allItems = useMemo(() => buildSortedItems(buildAllItems(player), equipment), [player, equipment]);

  const pendingImbueByItemId = useMemo(() => {
    const map = {};
    for (const job of sanctuaryJobs) {
      if (job?.type !== "imbue_item") continue;
      if (!["running", "claimable"].includes(job?.status)) continue;
      if (!job?.input?.itemId) continue;
      map[job.input.itemId] = job;
    }
    return map;
  }, [sanctuaryJobs]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (slotFilter !== "all" && item?.type !== slotFilter) return false;
      if (rarityFilter !== "all" && item?.rarity !== rarityFilter) return false;
      return true;
    });
  }, [allItems, slotFilter, rarityFilter]);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return allItems.find(item => item.id === selectedItemId) || null;
  }, [allItems, selectedItemId]);

  useEffect(() => {
    if (!FORGE_MODE_ORDER.includes(mode)) {
      setMode(FORGE_MODE_ORDER[0]);
    }
  }, [mode]);

  useEffect(() => {
    if (!reforgeSession?.itemId) return;
    if (mode !== "reforge") setMode("reforge");
    if (selectedItemId !== reforgeSession.itemId) setSelectedItemId(reforgeSession.itemId);
    if (Number.isInteger(Number(reforgeSession.affixIndex))) {
      const sessionAffixIndex = Number(reforgeSession.affixIndex);
      if (selectedAffixIndex !== sessionAffixIndex) setSelectedAffixIndex(sessionAffixIndex);
    }
  }, [mode, reforgeSession, selectedAffixIndex, selectedItemId]);

  useEffect(() => {
    if (mode !== "extract") {
      setConfirmExtract(false);
      return;
    }
    setSelectedReforgeOption(null);
    setSelectedAscendPowerId(null);
  }, [mode]);

  useEffect(() => {
    if (reforgeSession?.itemId) {
      if (selectedItemId !== reforgeSession.itemId) setSelectedItemId(reforgeSession.itemId);
      if (Number.isInteger(Number(reforgeSession.affixIndex))) {
        const sessionAffixIndex = Number(reforgeSession.affixIndex);
        if (selectedAffixIndex !== sessionAffixIndex) setSelectedAffixIndex(sessionAffixIndex);
      }
      return;
    }
    if (filteredItems.length <= 0) {
      if (selectedItemId != null) setSelectedItemId(null);
      return;
    }

    const stillVisible = filteredItems.some(item => item.id === selectedItemId);
    if (stillVisible) return;

    const fallback =
      filteredItems.find(item => canSelectItemForMode({
        item,
        mode,
        equipment,
        reforgeSession,
        hasPendingImbueJob: Boolean(pendingImbueByItemId[item.id]),
      })) || filteredItems[0];

    if (fallback?.id && fallback.id !== selectedItemId) {
      setSelectedItemId(fallback.id);
      setSelectedAffixIndex(null);
      setSelectedReforgeOption(null);
    }
  }, [filteredItems, selectedItemId, selectedAffixIndex, mode, equipment, reforgeSession, pendingImbueByItemId]);

  useEffect(() => {
    if (!selectedItem || !["polish", "reforge"].includes(mode)) {
      setSelectedAffixIndex(null);
      return;
    }

    const affixes = Array.isArray(selectedItem.affixes) ? selectedItem.affixes : [];
    if (affixes.length <= 0) {
      setSelectedAffixIndex(null);
      return;
    }

    if (selectedAffixIndex != null && affixes[selectedAffixIndex]) return;
    setSelectedAffixIndex(0);
  }, [selectedItem, mode, selectedAffixIndex]);

  const selectedItemImbueJob = selectedItem ? pendingImbueByItemId[selectedItem.id] || null : null;
  const selectedItemImbueRemainingMs = Math.max(0, Number(selectedItemImbueJob?.endsAt || 0) - Date.now());
  const selectedItemImbueRushCost = {
    relicDust: Math.max(0, Number(selectedItemImbueJob?.output?.rushCost?.relicDust || 0)),
    sigilFlux: Math.max(0, Number(selectedItemImbueJob?.output?.rushCost?.sigilFlux || 0)),
  };
  const selectedItemImbueCanRush =
    selectedItemImbueJob?.status === "running" &&
    Number(sanctuaryResources?.relicDust || 0) >= selectedItemImbueRushCost.relicDust &&
    Number(sanctuaryResources?.sigilFlux || 0) >= selectedItemImbueRushCost.sigilFlux;

  const activeReforgeItemId = reforgeSession?.itemId || null;
  const activeReforgeAffixIndex = Number.isInteger(Number(reforgeSession?.affixIndex))
    ? Number(reforgeSession.affixIndex)
    : selectedAffixIndex;
  const activeReforgeItem = useMemo(
    () => (activeReforgeItemId ? allItems.find(item => item.id === activeReforgeItemId) || null : null),
    [allItems, activeReforgeItemId]
  );

  const selectedItemReforgeOptions = useMemo(() => {
    if (!reforgeSession) return [];
    return Array.isArray(reforgeSession.options) ? reforgeSession.options : [];
  }, [reforgeSession]);
  const hasOpenReforgeOptions =
    Boolean(reforgeSession?.itemId) &&
    activeReforgeAffixIndex != null &&
    selectedItemReforgeOptions.length > 0;
  const hasStalledReforgeSession =
    Boolean(reforgeSession?.itemId) &&
    !hasOpenReforgeOptions;

  useEffect(() => {
    if (!selectedReforgeOption || selectedItemReforgeOptions.length <= 0) return;
    const isValid = selectedItemReforgeOptions.some(option => isSameReforgeOption(option, selectedReforgeOption));
    if (!isValid) setSelectedReforgeOption(null);
  }, [selectedReforgeOption, selectedItemReforgeOptions]);

  useEffect(() => {
    if (!hasOpenReforgeOptions || selectedReforgeOption) return;
    setSelectedReforgeOption(selectedItemReforgeOptions[0] || null);
  }, [hasOpenReforgeOptions, selectedReforgeOption, selectedItemReforgeOptions]);

  const selectedActionReq = useMemo(() => {
    if (!selectedItem) return { mode, costs: {}, can: false, reason: "missing_item" };
    return getCraftActionState({
      item: selectedItem,
      player,
      mode,
      affixIndex: selectedAffixIndex,
      legendaryPowerId: selectedAscendPowerId,
      legendaryPowerImprintReduction:
        unlockedLegendaryPowerMap?.[selectedAscendPowerId]?.mastery?.imprintCostReduction || 0,
    }) || { mode, costs: {}, can: false, reason: "missing_req" };
  }, [mode, player, selectedAffixIndex, selectedAscendPowerId, selectedItem, unlockedLegendaryPowerMap]);

  const selectedBaseEntries = useMemo(() => {
    if (!selectedItem?.baseBonus) return [];
    return getPrioritizedStatEntries(selectedItem.baseBonus || {}, 4)
      .filter(([, value]) => Math.abs(Number(value || 0)) > 0.0001);
  }, [selectedItem]);
  const selectedImplicitEntries = useMemo(() => {
    if (!selectedItem) return [];
    const implicitBonus = selectedItem?.implicitBonus || {};
    const implicitUpgradeBonus = selectedItem?.implicitUpgradeBonus || {};
    const keys = Array.from(new Set([
      ...Object.keys(implicitBonus),
      ...Object.keys(implicitUpgradeBonus),
    ]));
    return keys
      .map(key => [key, Number(implicitBonus?.[key] || 0) + Number(implicitUpgradeBonus?.[key] || 0)])
      .filter(([, value]) => Math.abs(Number(value || 0)) > 0.0001)
      .sort((left, right) => Math.abs(Number(right?.[1] || 0)) - Math.abs(Number(left?.[1] || 0)))
      .slice(0, 4);
  }, [selectedItem]);
  const selectedBaseSummaryText = useMemo(() => {
    if (selectedBaseEntries.length <= 0) return "Sin stats base.";
    return selectedBaseEntries
      .map(([key, value]) => `${STAT_LABELS[key] || key} ${formatStatValue(key, value)}`)
      .join(" · ");
  }, [selectedBaseEntries]);
  const selectedImplicitSummaryText = useMemo(() => {
    if (selectedImplicitEntries.length <= 0) return "Sin implicitos activos.";
    return selectedImplicitEntries
      .map(([key, value]) => `${STAT_LABELS[key] || key} ${formatStatValue(key, value)}`)
      .join(" · ");
  }, [selectedImplicitEntries]);

  const selectedUpgradePreview = useMemo(() => {
    if (!selectedItem || mode !== "upgrade") return null;
    const currentLevel = Math.max(0, Number(selectedItem?.level || 0));
    const maxLevel = Math.max(currentLevel, Number(selectedActionReq?.maxLevel || 15));
    if (currentLevel >= maxLevel) return null;
    return buildCraftedItemPreview(selectedItem, { level: currentLevel + 1 });
  }, [selectedActionReq?.maxLevel, mode, selectedItem]);

  const selectedUpgradeDeltas = useMemo(() => {
    if (!selectedItem || !selectedUpgradePreview) return [];
    const keys = Array.from(new Set([
      ...Object.keys(selectedItem?.bonus || {}),
      ...Object.keys(selectedUpgradePreview?.bonus || {}),
    ]));

    return keys
      .map(key => {
        const currentValue = Number(selectedItem?.bonus?.[key] || 0);
        const nextValue = Number(selectedUpgradePreview?.bonus?.[key] || 0);
        const delta = nextValue - currentValue;
        return { key, currentValue, nextValue, delta };
      })
      .filter(entry => Math.abs(entry.delta) > 0.0001)
      .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
      .slice(0, 6);
  }, [selectedItem, selectedUpgradePreview]);

  const selectedUpgradeRatingDelta = useMemo(() => {
    if (!selectedItem || !selectedUpgradePreview) return 0;
    return Math.round(Number(selectedUpgradePreview?.rating || 0) - Number(selectedItem?.rating || 0));
  }, [selectedItem, selectedUpgradePreview]);
  const visibleUpgradeRowLimit = isMobile ? 3 : 5;
  const visibleUpgradeRows = selectedUpgradeDeltas.slice(0, visibleUpgradeRowLimit);
  const hiddenUpgradeRowCount = Math.max(0, selectedUpgradeDeltas.length - visibleUpgradeRows.length);

  const selectedImbueCountdownFinished =
    selectedItemImbueJob?.status === "running" && selectedItemImbueRemainingMs <= 0;
  const selectedImbueJobRunning =
    mode === "ascend" && selectedItemImbueJob?.status === "running" && !selectedImbueCountdownFinished;
  const selectedImbueJobClaimable =
    mode === "ascend" && (selectedItemImbueJob?.status === "claimable" || selectedImbueCountdownFinished);

  const selectedActionDisabled = (() => {
    if (mode === "reforge" && selectedItemReforgeOptions.length > 0) {
      if (activeReforgeAffixIndex == null) return true;
      // Reforge confirm uses the already-paid session; don't gate by a fresh cost check.
      return !selectedReforgeOption;
    }
    if (!selectedItem) return true;
    if (mode === "extract") return true;
    if (selectedImbueJobRunning) return true;
    if (mode === "polish" && selectedAffixIndex == null) return true;
    if (mode === "reforge" && activeReforgeAffixIndex == null) return true;
    if (mode === "ascend" && selectedImbueJobClaimable) return false;
    return !selectedActionReq.can;
  })();

  const selectedActionHint = (() => {
    if (!selectedItem) return "Selecciona un item";
    if (selectedImbueJobRunning) return `Termina en ${formatRemainingDuration(selectedItemImbueRemainingMs)}`;
    if (mode === "reforge" && selectedItemReforgeOptions.length > 0 && !selectedReforgeOption) return "Elige una opcion";
    return getCraftActionHint(selectedActionReq, mode) || getModeSummary(mode);
  })();

  const selectedActionCostLabel = (() => {
    if (mode === "ascend" && selectedImbueJobClaimable) return "Listo para reclamar";
    if (mode === "ascend" && selectedImbueJobRunning) return `Fin: ${formatRemainingDuration(selectedItemImbueRemainingMs)}`;
    if (mode === "reforge" && selectedItemReforgeOptions.length > 0) return "Costo ya pagado";
    return formatCraftCostLabel(selectedActionReq?.costs || {});
  })();
  const selectedActionGoldCost = Math.max(0, Number(selectedActionReq?.costs?.gold || 0));
  const selectedActionEntropyCost = Math.max(0, Number(selectedActionReq?.costs?.entropy || 0));

  const selectedExtractEssence = useMemo(() => {
    if (selectedExtractIds.length <= 0) return 0;
    const byId = Object.fromEntries(allItems.map(item => [item.id, item]));
    return selectedExtractIds.reduce((total, itemId) => total + computeExtractYield(byId[itemId] || {}), 0);
  }, [allItems, selectedExtractIds]);

  const selectedAscendPowers = useMemo(() => {
    if (!selectedItem || mode !== "ascend" || selectedActionReq?.nextRarity !== "legendary") return [];
    return unlockedLegendaryPowers;
  }, [mode, selectedActionReq?.nextRarity, selectedItem, unlockedLegendaryPowers]);

  const selectedAscendPower = selectedAscendPowerId ? unlockedLegendaryPowerMap[selectedAscendPowerId] || null : null;

  const isReforgeLocked = Boolean(reforgeSession?.itemId);
  const canSwitchMode = nextMode => !isReforgeLocked || nextMode === "reforge";
  const hasAnyItems = filteredItems.length > 0;
  const canOpenAbyssAffixes = hasAbyssCraftingAffixes && ["epic", "legendary"].includes(selectedItem?.rarity);
  const selectedEntropyState = selectedItem ? getEntropyState(selectedItem) : null;
  const selectedEntropy = Math.max(0, Number(selectedItem?.crafting?.entropy || 0));
  const selectedEntropyCap = Math.max(1, Number(selectedItem?.crafting?.entropyCap || 1));
  const selectedEntropyRatio = Math.max(0, Math.min(1, selectedEntropyCap > 0 ? selectedEntropy / selectedEntropyCap : 0));
  const selectedEntropyNext = Math.max(0, Math.min(selectedEntropyCap, selectedEntropy + selectedActionEntropyCost));
  const selectedEntropyNextRatio = Math.max(0, Math.min(1, selectedEntropyCap > 0 ? selectedEntropyNext / selectedEntropyCap : 0));
  const showTopToolbar = isReforgeLocked;
  const forgeModeTabItems = useMemo(
    () => FORGE_MODE_ORDER.map(modeId => ({
      id: modeId,
      label: FORGE_MODE_META[modeId]?.label || modeId,
      disabled: !canSwitchMode(modeId),
    })),
    [isReforgeLocked]
  );
  const selectForgeMode = nextMode => {
    if (!canSwitchMode(nextMode)) return;
    setMode(nextMode);
    setSelectedReforgeOption(null);
  };

  const triggerCraftingOutcome = ({ tone = "success", label = "", detail = "", deltaLabel = "" } = {}) => {
    craftingOutcomeIdRef.current += 1;
    setCraftingOutcome({
      id: craftingOutcomeIdRef.current,
      tone,
      label: label || (tone === "error" ? "MEJORA FALLIDA" : "MEJORA EXITOSA"),
      detail,
      deltaLabel,
    });

    if (craftingOutcomeTimerRef.current) clearTimeout(craftingOutcomeTimerRef.current);
    craftingOutcomeTimerRef.current = window.setTimeout(() => {
      setCraftingOutcome(null);
      craftingOutcomeTimerRef.current = null;
    }, 2200);
  };

  const triggerCraftingFloat = ({ text = "+1", tone = "success" } = {}) => {
    craftingFloatIdRef.current += 1;
    const slot = 1 + Math.floor(Math.random() * 6);
    setCraftingFloatFx({
      id: craftingFloatIdRef.current,
      text,
      tone,
      slot,
    });
    if (craftingFloatTimerRef.current) clearTimeout(craftingFloatTimerRef.current);
    craftingFloatTimerRef.current = window.setTimeout(() => {
      setCraftingFloatFx(null);
      craftingFloatTimerRef.current = null;
    }, 980);
  };

  const executePrimaryAction = () => {
    if (!selectedItem && !activeReforgeItemId) return;

    if (mode === "upgrade") {
      if (!selectedActionReq.can) return;
      triggerCraftingOutcome({
        tone: "success",
        label: "MEJORA EXITOSA",
        detail: `${selectedItem?.name || "Item"} subio a +${currentUpgradeLevel + 1}`,
        deltaLabel: "+1",
      });
      dispatch({ type: "CRAFT_UPGRADE_ITEM", payload: { itemId: selectedItem.id } });
      return;
    }

    if (mode === "polish") {
      if (!selectedActionReq.can || selectedAffixIndex == null) return;
      triggerCraftingOutcome({
        tone: "success",
        label: "MEJORA EXITOSA",
        detail: "Linea afinada",
        deltaLabel: "OK",
      });
      dispatch({ type: "CRAFT_POLISH_ITEM", payload: { itemId: selectedItem.id, affixIndex: selectedAffixIndex } });
      return;
    }

    if (mode === "reforge") {
      const targetItemId = activeReforgeItemId || selectedItem.id;
      const targetAffixIndex = activeReforgeAffixIndex;
      if (!targetItemId || targetAffixIndex == null) return;

      if (selectedItemReforgeOptions.length <= 0) {
        if (!selectedActionReq.can) return;
        triggerCraftingOutcome({
          tone: "success",
          label: "VISTA PREVIA LISTA",
          detail: "Opciones de reforja generadas",
          deltaLabel: "OK",
        });
        dispatch({
          type: "CRAFT_REFORGE_PREVIEW",
          payload: {
            itemId: targetItemId,
            affixIndex: targetAffixIndex,
            favoredStats: [],
            allowAbyssAffixes: canOpenAbyssAffixes,
          },
        });
        setSelectedReforgeOption(null);
        return;
      }

      if (!selectedReforgeOption) return;
      triggerCraftingOutcome({
        tone: "success",
        label: "MEJORA EXITOSA",
        detail: "Opcion aplicada",
        deltaLabel: "OK",
      });
      dispatch({
        type: "CRAFT_REFORGE_ITEM",
        payload: {
          itemId: targetItemId,
          affixIndex: targetAffixIndex,
          replacementAffix: selectedReforgeOption,
        },
      });
      setSelectedReforgeOption(null);
      return;
    }

    if (mode === "ascend") {
      if (selectedImbueJobClaimable && selectedItemImbueJob?.id) {
        triggerCraftingOutcome({
          tone: "success",
          label: "MEJORA EXITOSA",
          detail: "Imbuir reclamado",
          deltaLabel: "OK",
        });
        dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: selectedItemImbueJob.id, now: Date.now() });
        return;
      }
      if (selectedImbueJobRunning) return;
      if (!selectedActionReq.can) return;
      triggerCraftingOutcome({
        tone: "success",
        label: "MEJORA EXITOSA",
        detail: "Imbuir iniciado",
        deltaLabel: "OK",
      });
      dispatch({
        type: "CRAFT_ASCEND_ITEM",
        payload: {
          itemId: selectedItem.id,
          legendaryPowerId: selectedAscendPower?.id || null,
        },
      });
    }
  };

  const toggleExtractSelection = itemId => {
    setConfirmExtract(false);
    setSelectedExtractIds(current => (
      current.includes(itemId)
        ? current.filter(id => id !== itemId)
        : [...current, itemId]
    ));
  };

  const extractSelected = () => {
    if (selectedExtractIds.length <= 0) return;
    if (!confirmExtract) {
      setConfirmExtract(true);
      return;
    }
    selectedExtractIds.forEach(itemId => {
      dispatch({ type: "CRAFT_EXTRACT_ITEM", payload: { itemId } });
    });
    setSelectedExtractIds([]);
    setConfirmExtract(false);
  };

  const selectExtractByRarityLimit = rarityLimit => {
    const limitIndex = RARITY_ORDER.indexOf(rarityLimit);
    if (limitIndex < 0) return;
    const ids = filteredItems
      .filter(item => {
        const rarityIndex = RARITY_ORDER.indexOf(item?.rarity || "common");
        return (
          rarityIndex >= 0 &&
          rarityIndex <= limitIndex &&
          !isItemEquipped(item, equipment) &&
          !pendingImbueByItemId[item.id]
        );
      })
      .map(item => item.id);
    setConfirmExtract(false);
    setSelectedExtractIds(ids);
  };

  const clearExtractSelection = () => {
    setSelectedExtractIds([]);
    setConfirmExtract(false);
  };

  const selectCraftingItem = item => {
    if (!item?.id) return;
    const hasPendingImbueJob = Boolean(pendingImbueByItemId[item.id]);
    const selectable = canSelectItemForMode({
      item,
      mode,
      equipment,
      reforgeSession,
      hasPendingImbueJob,
    });
    if (!selectable) return;

    setSelectedItemId(item.id);
    setSelectedAffixIndex(null);
    setSelectedReforgeOption(null);
    setConfirmExtract(false);
    if (mode === "extract") {
      toggleExtractSelection(item.id);
    } else {
      setSelectedExtractIds(current => current.filter(id => id !== item.id));
    }
    setItemDrawerOpen(false);
  };

  const cancelReforgePreview = () => {
    if (!reforgeSession?.itemId) return;
    dispatch({ type: "CRAFT_CANCEL_REFORGE_SESSION" });
    setSelectedReforgeOption(null);
  };

  const confirmActiveReforgeSession = () => {
    if (!activeReforgeItemId || activeReforgeAffixIndex == null || !selectedReforgeOption) return;
    dispatch({
      type: "CRAFT_REFORGE_ITEM",
      payload: {
        itemId: activeReforgeItemId,
        affixIndex: activeReforgeAffixIndex,
        replacementAffix: selectedReforgeOption,
      },
    });
    setSelectedReforgeOption(null);
  };

  const craftingLog = Array.isArray(state?.combat?.craftingLog) ? state.combat.craftingLog : [];

  useEffect(() => {
    return () => {
      if (craftingOutcomeTimerRef.current) clearTimeout(craftingOutcomeTimerRef.current);
      if (craftingFloatTimerRef.current) clearTimeout(craftingFloatTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const currentLength = craftingLog.length;
    if (lastCraftingLogLengthRef.current == null) {
      lastCraftingLogLengthRef.current = currentLength;
      return;
    }
    if (currentLength <= lastCraftingLogLengthRef.current) {
      lastCraftingLogLengthRef.current = currentLength;
      return;
    }

    const latestEntry = craftingLog[currentLength - 1] || "";
    const isError = isCraftingLogError(latestEntry);
    triggerCraftingOutcome({
      tone: isError ? "error" : "success",
      label: isError ? "MEJORA FALLIDA" : "MEJORA EXITOSA",
      detail: latestEntry,
      deltaLabel: isError ? "Fallo" : "+1",
    });
    if (!isError && mode === "upgrade") {
      triggerCraftingFloat({ text: "+1", tone: "success" });
    }

    lastCraftingLogLengthRef.current = currentLength;
  }, [craftingLog, mode]);

  const activeModeMeta = FORGE_MODE_META[mode] || FORGE_MODE_META.upgrade;
  const currentUpgradeLevel = Math.max(0, Number(selectedItem?.level || 0));
  const nextUpgradeLevel = selectedUpgradePreview
    ? Math.max(currentUpgradeLevel, Number(selectedUpgradePreview?.level ?? currentUpgradeLevel + 1))
    : currentUpgradeLevel;
  const currentRatingValue = Math.round(Number(selectedItem?.rating || 0));
  const nextRatingValue = selectedUpgradePreview
    ? Math.round(Number(selectedUpgradePreview?.rating || currentRatingValue))
    : currentRatingValue + selectedUpgradeRatingDelta;
  const craftingHeroRowLimit = isMobile ? 3 : 4;
  const craftingHeroRows = visibleUpgradeRows.length > 0 ? visibleUpgradeRows.slice(0, craftingHeroRowLimit) : selectedBaseEntries.slice(0, craftingHeroRowLimit).map(([key, value]) => ({
    key,
    currentValue: value,
    nextValue: value,
    delta: 0,
  }));
  const actionCostMain = mode === "upgrade"
    ? `G ${formatNumber(selectedActionGoldCost)} · Ent ${selectedActionEntropyCost}`
    : selectedActionCostLabel;
  const resultTone = craftingOutcome?.tone || "neutral";
  const resultState = resultTone === "success" ? "success" : resultTone === "error" ? "error" : "default";
  const resultStateLabel = craftingOutcome?.label || (mode === "upgrade" ? "Vista previa" : activeModeMeta.cta || activeModeMeta.label);
  const craftingItemIconName = getCraftingItemIconName(selectedItem || {});
  const selectedItemAsset = selectedItem ? getItemAsset(selectedItem) : null;
  const selectedAffixLabel = selectedAffixIndex != null && selectedItem?.affixes?.[selectedAffixIndex]
    ? (STAT_LABELS[selectedItem.affixes[selectedAffixIndex]?.stat] || selectedItem.affixes[selectedAffixIndex]?.stat || `Linea ${selectedAffixIndex + 1}`)
    : "";
  const requirementHintType = getRequirementHintType(selectedActionReq?.reason);

  const NonUpgradeModule = mode === "reforge"
    ? FlForgeReforgeModule
    : mode === "ascend"
      ? FlForgeAscendModule
      : FlForgePolishModule;
  const canRenderFloatingModeTabs = isMobile && typeof document !== "undefined";
  const mobileSubtabsPortalHost = canRenderFloatingModeTabs
    ? (document.querySelector(".app-shell-root--forge-light-v2") || document.body)
    : null;
  const forgeModeTabs = (
    <FlTabs
      className={[
        "fl-crafting-mode-tabs",
        "fl-subtabs-segmented",
        canRenderFloatingModeTabs ? "fl-subtabs-segmented--mobile-floating" : "fl-subtabs-segmented--mobile-sticky",
      ].join(" ")}
      items={forgeModeTabItems}
      activeId={mode}
      onChange={selectForgeMode}
      variant="segmented"
      size="sm"
      fullWidth
      scrollable={false}
      ariaLabel="Herramientas de forja"
    />
  );

  return (
    <div className={`crafting-root crafting-root--forge-light fl-screen-stack fl-crafting--neutral-sections-v1${isMobile ? " is-mobile fl-crafting--mobile-compact-v1" : ""}`}>
      {showTopToolbar && (
        <section className="fl-crafting-top-toolbar">
          {!isMobile && (
            <FlTabs
              className="fl-crafting-toolbar-tabs fl-subtabs-segmented"
              items={forgeModeTabItems}
              activeId={mode}
              onChange={selectForgeMode}
              variant="segmented"
              size="sm"
              fullWidth
              scrollable={false}
              ariaLabel="Herramientas bloqueadas de forja"
            />
          )}

          {isReforgeLocked && (
            <div className="fl-crafting-lock-notice">
              Reforja abierta: termina esta decision antes de cambiar de herramienta.
            </div>
          )}
        </section>
      )}

      <section className="fl-crafting-showcase fl-section-stack" aria-label="Mesa de forja Forge Light">
        <div className="fl-crafting-head">
          <FlPanelHeader
            title="Forja"
            copy={getModeSummary(mode)}
            secondaryAction={(
              <FlButton
                className="fl-crafting-close"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={!onClose}
                ariaLabel="Volver"
              >
                Volver
              </FlButton>
            )}
          />
        </div>

        {craftingFloatFx && (
          <div className="fl-crafting-fx-layer" aria-hidden="true">
            <div
              key={craftingFloatFx.id}
              className={`fl-crafting-fx-plus fl-crafting-fx-plus--${craftingFloatFx.tone} fl-crafting-fx-plus--slot-${craftingFloatFx.slot}`}
            >
              {craftingFloatFx.text}
            </div>
          </div>
        )}

        {!canRenderFloatingModeTabs && forgeModeTabs}

        {mode === "upgrade" ? (
          <FlForgeUpgradeModule
            selectedItem={selectedItem}
            hasAnyItems={hasAnyItems}
            onOpenItemDrawer={() => setItemDrawerOpen(true)}
            craftingOutcome={craftingOutcome}
            resultTone={resultTone}
            resultState={resultState}
            resultStateLabel={resultStateLabel}
            selectedItemAsset={selectedItemAsset}
            craftingItemIconName={craftingItemIconName}
            currentUpgradeLevel={currentUpgradeLevel}
            nextUpgradeLevel={nextUpgradeLevel}
            currentRatingValue={currentRatingValue}
            nextRatingValue={nextRatingValue}
            selectedEntropy={selectedEntropy}
            selectedEntropyCap={selectedEntropyCap}
            selectedActionEntropyCost={selectedActionEntropyCost}
            selectedEntropyRatio={selectedEntropyRatio}
            selectedEntropyNextRatio={selectedEntropyNextRatio}
            selectedActionReq={selectedActionReq}
            selectedActionHint={selectedActionHint}
            craftingHeroRows={craftingHeroRows}
            formatNumber={formatNumber}
            formatStatValue={formatStatValue}
            formatDiffValue={formatDiffValue}
            statLabels={STAT_LABELS}
            selectedActionDisabled={selectedActionDisabled}
            onExecutePrimaryAction={executePrimaryAction}
            selectedActionCostLabel={selectedActionCostLabel}
            requirementHintType={requirementHintType}
            craftingLog={craftingLog}
          />
        ) : (
          <NonUpgradeModule
            mode={mode}
            modeLabel={activeModeMeta.label}
            ctaLabel={activeModeMeta.cta || activeModeMeta.label}
            selectedItem={selectedItem}
            hasAnyItems={hasAnyItems}
            onOpenItemDrawer={() => setItemDrawerOpen(true)}
            craftingOutcome={craftingOutcome}
            resultTone={resultTone}
            resultState={resultState}
            resultStateLabel={resultStateLabel}
            selectedItemAsset={selectedItemAsset}
            craftingItemIconName={craftingItemIconName}
            currentUpgradeLevel={currentUpgradeLevel}
            nextUpgradeLevel={nextUpgradeLevel}
            currentRatingValue={currentRatingValue}
            nextRatingValue={nextRatingValue}
            selectedEntropy={selectedEntropy}
            selectedEntropyCap={selectedEntropyCap}
            selectedActionEntropyCost={selectedActionEntropyCost}
            selectedEntropyRatio={selectedEntropyRatio}
            selectedEntropyNextRatio={selectedEntropyNextRatio}
            selectedActionReq={selectedActionReq}
            selectedActionHint={selectedActionHint}
            selectedAffixLabel={selectedAffixLabel}
            hasReforgeOptions={selectedItemReforgeOptions.length > 0}
            selectedImbueJobRunning={selectedImbueJobRunning}
            selectedImbueJobClaimable={selectedImbueJobClaimable}
            selectedExtractEssence={selectedExtractEssence}
            selectedExtractCount={selectedExtractIds.length}
            actionCostMain={actionCostMain}
            craftingHeroRows={craftingHeroRows}
            formatNumber={formatNumber}
            formatStatValue={formatStatValue}
            formatDiffValue={formatDiffValue}
            statLabels={STAT_LABELS}
            selectedActionDisabled={selectedActionDisabled}
            onExecutePrimaryAction={executePrimaryAction}
            selectedActionCostLabel={selectedActionCostLabel}
            requirementHintType={requirementHintType}
            craftingLog={craftingLog}
          />
        )}
      </section>

      {canRenderFloatingModeTabs && mobileSubtabsPortalHost && createPortal(
        <div className="fl-crafting-mobile-subtabs-layer">
          {forgeModeTabs}
        </div>,
        mobileSubtabsPortalHost
      )}

      {itemDrawerOpen && (
        <div className="fl-crafting-item-drawer-backdrop" role="presentation" onClick={() => setItemDrawerOpen(false)}>
          <FlCard
            as="aside"
            className="fl-crafting-item-drawer"
            variant="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Seleccionar item de forja"
            onClick={event => event.stopPropagation()}
          >
            <div className="fl-crafting-item-drawer-head">
              <div>
                <div className="fl-crafting-drawer-kicker">Mochila de forja</div>
                <h3>Seleccionar item</h3>
              </div>
              <FlButton className="fl-crafting-drawer-close" variant="ghost" size="sm" onClick={() => setItemDrawerOpen(false)} ariaLabel="Cerrar selector">
                ×
              </FlButton>
            </div>

            <div className="fl-crafting-item-drawer-filters">
              <select value={slotFilter} onChange={event => setSlotFilter(event.target.value)} aria-label="Filtrar por slot">
                {SLOT_FILTERS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              <select value={rarityFilter} onChange={event => setRarityFilter(event.target.value)} aria-label="Filtrar por rareza">
                {RARITY_FILTERS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            {!hasAnyItems && (
              <div className="fl-crafting-drawer-empty">No hay items para forjar con esos filtros.</div>
            )}

            {hasAnyItems && (
              <div className="fl-crafting-item-drawer-list fl-dense-list">
                {filteredItems.map(item => {
                  const equipped = isItemEquipped(item, equipment);
                  const hasPendingImbueJob = Boolean(pendingImbueByItemId[item.id]);
                  const selectable = canSelectItemForMode({
                    item,
                    mode,
                    equipment,
                    reforgeSession,
                    hasPendingImbueJob,
                  });
                  const selected = mode === "extract"
                    ? selectedExtractIds.includes(item.id)
                    : selectedItem?.id === item.id;
                  const entropy = Math.max(0, Number(item?.crafting?.entropy || 0));
                  const entropyCap = Math.max(1, Number(item?.crafting?.entropyCap || 1));
                  const entropyState = getEntropyState(item);
                  const itemAsset = getItemAsset(item);
                  const itemIconName = getCraftingItemIconName(item);

                  return (
                    <button
                      key={item.id}
                      className="fl-crafting-drawer-item"
                      data-selected={selected ? "true" : undefined}
                      data-selectable={selectable ? "true" : "false"}
                      onClick={() => selectCraftingItem(item)}
                      disabled={!selectable}
                    >
                      <FlAsset
                        className="fl-crafting-drawer-item-asset"
                        asset={itemAsset}
                        kind="item"
                        rarity={item?.rarity}
                        size="md"
                        alt=""
                        fallbackIcon={itemIconName}
                      />
                      <span className="fl-crafting-drawer-item-copy">
                        <span className="fl-crafting-drawer-item-title">
                          <b>{getCompactRarityLabel(item?.rarity)}</b>
                          <strong>{item?.name}</strong>
                          {(item?.level || 0) > 0 && <em>+{item.level}</em>}
                        </span>
                        <span className="fl-crafting-drawer-item-meta">
                          {item?.type === "weapon" ? "Arma" : "Armadura"} · Ent {entropy}/{entropyCap} · {entropyState.label}
                          {equipped ? " · Equipado" : ""}
                          {hasPendingImbueJob ? " · Imbuir pendiente" : ""}
                        </span>
                      </span>
                      <span className="fl-crafting-drawer-item-rating">{formatNumber(item?.rating || 0)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </FlCard>
        </div>
      )}
    </div>
  );
}
