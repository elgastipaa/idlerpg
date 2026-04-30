import React, { useEffect, useMemo, useRef, useState } from "react";
import useViewport from "../hooks/useViewport";
import {
  buildCraftedItemPreview,
  getCraftActionState,
} from "../engine/crafting/craftingEngine";
import { getUnlockedLegendaryPowers } from "../engine/progression/codexEngine";
import { hasAbyssUnlock } from "../engine/progression/abyssProgression";
import { getRarityColor } from "../constants/rarity";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
  formatItemNumber as formatNumber,
  formatItemStatValue as formatStatValue,
  formatItemDiffValue as formatDiffValue,
  getItemLocation,
  getPrioritizedStatEntries,
} from "../utils/itemPresentation";
import { getCompactRarityLabel, getItemGlyph, getUpgradeBadgeTone, ITEM_SLOT_GLYPHS } from "../utils/itemVisuals";
import { getItemAsset } from "../utils/assetRegistry";
import {
  FlAsset,
  FlBadge,
  FlButton,
  FlCard,
  FlProgressBar,
  FlResourceCounter,
  FlStatRow,
  FlTabs,
  FlRequirementHint,
} from "./ui/forge";
import {
  FORGE_MODE_META,
  FORGE_MODE_ORDER,
  formatCraftCostLabel,
  getCraftActionHint,
} from "./crafting/craftingUi";
import ForgeIcon from "./icons/ForgeIcon";

const RARITY_WEIGHT = Object.freeze({ common: 0, magic: 1, rare: 2, epic: 3, legendary: 4 });
const RARITY_ORDER = Object.freeze(["common", "magic", "rare", "epic", "legendary"]);
const USE_GLOBAL_REFORGE_OVERLAY = true;
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

function countExcellentAffixes(item = {}) {
  return (item?.affixes || []).reduce(
    (count, affix) => count + ((affix?.quality === "excellent" || affix?.lootOnlyQuality) ? 1 : 0),
    0
  );
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

function getForgeModeIconName(modeId = "upgrade") {
  if (modeId === "upgrade") return "forge";
  if (modeId === "extract") return "extract";
  if (modeId === "ascend") return "essence";
  if (modeId === "polish") return "polish";
  if (modeId === "reforge") return "reforge";
  return "repeat";
}

function getForgeModeAssetId(modeId = "upgrade") {
  if (modeId === "upgrade") return "forge_ember_hammer";
  if (modeId === "polish") return "forge_temper_tongs";
  if (modeId === "reforge") return "forge_anvil_spark";
  if (modeId === "ascend") return "forge_furnace_core";
  if (modeId === "extract") return "forge_blueprint_stamp";
  return "forge";
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

function toneChipStyle(tone = "muted") {
  if (tone === "success") {
    return {
      border: "1px solid var(--tone-success, #86efac)",
      background: "var(--tone-success-soft, #ecfdf5)",
      color: "var(--tone-success-strong, #166534)",
    };
  }
  if (tone === "warning") {
    return {
      border: "1px solid var(--tone-warning, #fdba74)",
      background: "var(--tone-warning-soft, #fff7ed)",
      color: "var(--tone-danger, #9a3412)",
    };
  }
  if (tone === "danger") {
    return {
      border: "1px solid var(--tone-danger, #fca5a5)",
      background: "var(--tone-danger-soft, #fff1f2)",
      color: "var(--tone-danger-strong, #b91c1c)",
    };
  }
  return {
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-tertiary, #f8fafc)",
    color: "var(--color-text-secondary, #475569)",
  };
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
  const lastCraftingLogLengthRef = useRef(null);
  const craftingOutcomeTimerRef = useRef(null);
  const craftingOutcomeIdRef = useRef(0);

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
      icon: (
        <FlAsset
          className="fl-crafting-tab-asset"
          kind="system"
          assetId={getForgeModeAssetId(modeId)}
          fallbackIcon={getForgeModeIconName(modeId)}
          size="sm"
          alt=""
        />
      ),
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

    lastCraftingLogLengthRef.current = currentLength;
  }, [craftingLog]);

  const activeModeMeta = FORGE_MODE_META[mode] || FORGE_MODE_META.upgrade;
  const currentUpgradeLevel = Math.max(0, Number(selectedItem?.level || 0));
  const nextUpgradeLevel = selectedUpgradePreview
    ? Math.max(currentUpgradeLevel, Number(selectedUpgradePreview?.level ?? currentUpgradeLevel + 1))
    : currentUpgradeLevel;
  const currentRatingValue = Math.round(Number(selectedItem?.rating || 0));
  const nextRatingValue = selectedUpgradePreview
    ? Math.round(Number(selectedUpgradePreview?.rating || currentRatingValue))
    : currentRatingValue + selectedUpgradeRatingDelta;
  const upgradeTrackPercent = Math.max(0, Math.min(100, (Math.min(15, nextUpgradeLevel) / 15) * 100));
  const craftingHeroRowLimit = isMobile ? 3 : 4;
  const craftingHeroRows = visibleUpgradeRows.length > 0 ? visibleUpgradeRows.slice(0, craftingHeroRowLimit) : selectedBaseEntries.slice(0, craftingHeroRowLimit).map(([key, value]) => ({
    key,
    currentValue: value,
    nextValue: value,
    delta: 0,
  }));
  const selectedRarityColor = getRarityColor(selectedItem?.rarity || "rare");
  const actionCostMain = mode === "upgrade"
    ? `G ${formatNumber(selectedActionGoldCost)} · Ent ${selectedActionEntropyCost}`
    : selectedActionCostLabel;
  const resultTone = craftingOutcome?.tone || "neutral";
  const resultState = resultTone === "success" ? "success" : resultTone === "error" ? "error" : "default";
  const resultStateLabel = craftingOutcome?.label || (mode === "upgrade" ? "Vista previa" : activeModeMeta.cta || activeModeMeta.label);
  const itemOutcomeLabel = craftingOutcome?.deltaLabel || (resultTone === "success" ? "+1" : resultTone === "error" ? "Fallo" : "");
  const craftingItemIconName = getCraftingItemIconName(selectedItem || {});
  const selectedItemAsset = selectedItem ? getItemAsset(selectedItem) : null;
  const requirementHintType = getRequirementHintType(selectedActionReq?.reason);
  const showReadyActionFeedback = Boolean(selectedItem && !selectedActionDisabled && craftingLog.length <= 0);
  const readyActionFeedbackTitle = mode === "upgrade" ? "Mejora lista" : `${activeModeMeta.label} listo`;
  const readyActionFeedbackDetail = mode === "upgrade"
    ? "La mejora se aplicara inmediatamente al item."
    : selectedActionHint || getModeSummary(mode);

  return (
    <div className="crafting-root crafting-root--forge-light" {...{ style: rootStyle(isMobile) }}>
      {showTopToolbar && (
        <section {...{ style: topToolbarStyle }}>
          {!isMobile && (
            <FlTabs
              className="fl-crafting-toolbar-tabs"
              items={forgeModeTabItems}
              activeId={mode}
              onChange={selectForgeMode}
              variant="secondary"
              size="sm"
              fullWidth
              scrollable={false}
              ariaLabel="Herramientas bloqueadas de forja"
            />
          )}

          {isReforgeLocked && (
            <div {...{ style: lockNoticeStyle }}>
              Reforja abierta: termina esta decision antes de cambiar de herramienta.
            </div>
          )}
        </section>
      )}

      <section className="fl-crafting-showcase" aria-label="Mesa de forja Forge Light">
        <div className="fl-crafting-head">
          <div className="fl-crafting-title-row">
            <FlButton className="fl-crafting-back" variant="ghost" size="sm" onClick={onClose} disabled={!onClose} ariaLabel="Volver">
              ‹‹
            </FlButton>
            <div className="fl-crafting-title-stack">
              <div className="fl-crafting-title-line">
                <div className="fl-crafting-title">Forja</div>
                <span className="fl-crafting-info" aria-label="Informacion de forja" role="img">i</span>
              </div>
              <div className="fl-crafting-subtitle">{getModeSummary(mode)}</div>
            </div>
          </div>
        </div>

        <FlTabs
          className="fl-crafting-mode-tabs"
          items={forgeModeTabItems}
          activeId={mode}
          onChange={selectForgeMode}
          variant="primary"
          size="sm"
          fullWidth
          scrollable={false}
          ariaLabel="Herramientas de forja"
        />

        {selectedItem ? (
          <>
            <div className="fl-crafting-stage">
              <FlCard
                as="button"
                className="fl-crafting-item-card"
                variant="premium"
                rarity={selectedItem?.rarity}
                {...{ style: { "--item-rarity": selectedRarityColor } }}
                data-outcome={craftingOutcome?.tone || undefined}
                onClick={() => setItemDrawerOpen(true)}
                aria-label="Seleccionar otro item para forjar"
              >
                <FlBadge className="fl-crafting-item-rarity" variant="rarity" rarity={selectedItem?.rarity} size="sm">
                  {getCompactRarityLabel(selectedItem?.rarity)}
                </FlBadge>
                <div className="fl-crafting-item-star" aria-hidden="true">★</div>
                {itemOutcomeLabel && (
                  <div
                    key={craftingOutcome?.id || itemOutcomeLabel}
                    className={["fl-crafting-item-pop", `is-${resultTone}`].filter(Boolean).join(" ")}
                    aria-hidden="true"
                  >
                    {itemOutcomeLabel}
                  </div>
                )}
                <div className="fl-crafting-item-art">
                  <FlAsset
                    className="fl-crafting-item-asset"
                    asset={selectedItemAsset}
                    kind="item"
                    rarity={selectedItem?.rarity}
                    size="xl"
                    alt={selectedItem?.name || "Item"}
                    fallbackIcon={craftingItemIconName}
                  />
                  <span>+{currentUpgradeLevel}</span>
                </div>
                <div className="fl-crafting-item-name">{selectedItem?.name}</div>
                <div className="fl-crafting-item-power">
                  <ForgeIcon name={craftingItemIconName} size={16} />
                  <strong>{formatNumber(currentRatingValue)}</strong>
                </div>
              </FlCard>

              <FlCard as="article" className="fl-crafting-result-card" variant="premium" state={resultState}>
                <div
                  key={craftingOutcome?.id ? `state-${craftingOutcome.id}` : "state-neutral"}
                  className={["fl-crafting-result-state", `is-${resultTone}`].filter(Boolean).join(" ")}
                >
                  {resultStateLabel}
                </div>
                <div className="fl-crafting-result-level">
                  <span>+{currentUpgradeLevel}</span>
                  <b>»</b>
                  <strong>+{nextUpgradeLevel}</strong>
                </div>
                <div className="fl-crafting-result-power-label">Poder</div>
                <div className="fl-crafting-result-power">
                  <span>{formatNumber(currentRatingValue)}</span>
                  <b>»</b>
                  <strong>{formatNumber(nextRatingValue)}</strong>
                </div>
                <div className="fl-crafting-preview-entropy">
                  <div className="fl-crafting-preview-entropy-row">
                    <span>Entropia</span>
                    <strong>{selectedEntropy}/{selectedEntropyCap}</strong>
                    {selectedActionEntropyCost > 0 && <em>+{selectedActionEntropyCost}</em>}
                  </div>
                  <div
                    className="fl-crafting-preview-entropy-track"
                    {...{ style: {
                      "--entropy-current": `${selectedEntropyRatio * 100}%`,
                      "--entropy-next": `${selectedEntropyNextRatio * 100}%`,
                    } }}
                    aria-label={`Entropia ${selectedEntropy} de ${selectedEntropyCap}`}
                  >
                    <span className="fl-crafting-preview-entropy-next" aria-hidden="true" />
                    <span className="fl-crafting-preview-entropy-current" aria-hidden="true" />
                  </div>
                </div>
              </FlCard>

              <FlCard as="aside" className="fl-crafting-material-panel" variant="compact">
                <div className="fl-crafting-material-section">
                  <FlResourceCounter
                    className="fl-crafting-material-counter"
                    type="material"
                    icon="forge"
                    label="Material principal"
                    value={mode === "upgrade" ? "Piedra de Forja" : activeModeMeta.label}
                    delta={selectedActionReq.can ? "Disponible" : selectedActionHint || "Bloqueado"}
                  />
                </div>
                <div className="fl-crafting-material-section">
                  <FlResourceCounter
                    className="fl-crafting-probability"
                    type={selectedActionReq.can ? "points" : "material"}
                    icon="armor"
                    label="Probabilidad de exito"
                    value={mode === "upgrade" ? "100%" : selectedActionReq.can ? "Lista" : "Bloq."}
                    capped={selectedActionReq.can}
                    insufficient={!selectedActionReq.can}
                  />
                </div>
                <div className="fl-crafting-material-section">
                  <FlResourceCounter
                    className="fl-crafting-cost"
                    type="gold"
                    icon="gold"
                    label="Costo"
                    value={actionCostMain}
                    insufficient={!selectedActionReq.can && selectedActionReq?.reason !== "ok"}
                  />
                </div>
              </FlCard>
            </div>

            <div className="fl-crafting-upgrade-track fl-crafting-upgrade-track--primitive">
              <span className="fl-crafting-track-current" {...{ style: { "--track-current": `${upgradeTrackPercent}%` } }}>
                +{nextUpgradeLevel}
              </span>
              <div className="fl-crafting-track-labels" aria-hidden="true">
                {[0, 5, 10, 15].map(mark => (
                  <span key={mark}>+{mark}</span>
                ))}
              </div>
              <FlProgressBar
                className="fl-crafting-upgrade-progress"
                type="progress"
                value={Math.min(15, Math.max(0, nextUpgradeLevel))}
                max={15}
                milestones={[0, 33.333, 66.666, 100]}
                segmented
                showValue={false}
                aria-label="Progreso de mejora"
              />
            </div>

            <div className="fl-crafting-stats-compare">
              <FlCard className="fl-crafting-stat-panel" variant="compact">
                <h3>Estadisticas actuales</h3>
                {craftingHeroRows.map(entry => (
                  <FlStatRow
                    key={`current-${entry.key}`}
                    compact
                    label={STAT_LABELS[entry.key] || entry.key}
                    value={formatStatValue(entry.key, entry.currentValue)}
                  />
                ))}
              </FlCard>
              <div className="fl-crafting-stat-arrow">»</div>
              <FlCard className="fl-crafting-stat-panel fl-crafting-stat-panel--new" variant="compact" state="success">
                <h3>Estadisticas nuevas</h3>
                {craftingHeroRows.map(entry => (
                  <FlStatRow
                    key={`next-${entry.key}`}
                    compact
                    label={STAT_LABELS[entry.key] || entry.key}
                    value={formatStatValue(entry.key, entry.nextValue)}
                    delta={entry.delta > 0 ? formatDiffValue(entry.key, entry.delta) : null}
                    deltaTone={entry.delta > 0 ? "success" : "neutral"}
                    state={entry.delta > 0 ? "increased" : "default"}
                  />
                ))}
              </FlCard>
            </div>

            <div className="fl-crafting-action-row">
              <FlButton className="fl-crafting-secondary-action" variant="secondary" icon={<ForgeIcon name="forge" size={20} />} disabled>
                Mejora maxima
              </FlButton>
              <FlButton
                className="fl-crafting-primary-action"
                variant="primary"
                size="full"
                disabled={selectedActionDisabled}
                onClick={executePrimaryAction}
                cost={selectedActionCostLabel}
              >
                {mode === "upgrade" ? "MEJORAR" : activeModeMeta.cta || activeModeMeta.label}
              </FlButton>
            </div>

            {selectedActionDisabled && selectedActionHint && (
              <FlRequirementHint
                className="fl-crafting-requirement"
                type={requirementHintType}
                label={selectedActionHint}
                detail={selectedActionCostLabel}
                compact
              />
            )}

            {showReadyActionFeedback && (
              <FlCard className="fl-crafting-feedback fl-crafting-feedback--ready" variant="compact">
                <ForgeIcon name={getForgeModeIconName(mode)} size={28} />
                <div>
                  <strong>{readyActionFeedbackTitle}</strong>
                  <span>{readyActionFeedbackDetail}</span>
                </div>
              </FlCard>
            )}

            {craftingLog.length > 0 && (
              <FlCard className="fl-crafting-feedback" variant="compact" state="success">
                <ForgeIcon name="claim" size={28} />
                <div>
                  <strong>Ultima accion registrada</strong>
                  <span>{craftingLog[craftingLog.length - 1]}</span>
                </div>
              </FlCard>
            )}
          </>
        ) : (
          <div className="fl-crafting-stage fl-crafting-stage--empty">
            <FlCard
              as="button"
              className="fl-crafting-item-card fl-crafting-item-card--empty"
              variant="premium"
              disabled={!hasAnyItems}
              onClick={() => setItemDrawerOpen(true)}
              aria-label="Seleccionar item para forjar"
            >
              <div className="fl-crafting-item-empty-plus" aria-hidden="true">+</div>
              <div className="fl-crafting-item-name">Selecciona un item</div>
              <div className="fl-crafting-empty">Abre la mochila de forja para elegir una pieza.</div>
            </FlCard>
          </div>
        )}
      </section>

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
              <div className="fl-crafting-item-drawer-list">
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

      <div className="fl-crafting-legacy-selectors" {...{ style: mainGridStyle() }}>
        <section className="fl-crafting-inventory-panel" {...{ style: inventoryPanelStyle(isMobile) }}>
          <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
            <div {...{ style: { fontSize: "0.78rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
              Items ({filteredItems.length})
            </div>
            <div {...{ style: { display: "flex", gap: "6px", flexWrap: "wrap" } }}>
              <select value={slotFilter} onChange={event => setSlotFilter(event.target.value)} {...{ style: filterSelectStyle }}>
                {SLOT_FILTERS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              <select value={rarityFilter} onChange={event => setRarityFilter(event.target.value)} {...{ style: filterSelectStyle }}>
                {RARITY_FILTERS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {!hasAnyItems && (
            <div {...{ style: emptyStateStyle }}>No hay items para forjar con esos filtros.</div>
          )}

          {hasAnyItems && (
            <div {...{ style: itemListStyle }}>
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
                const compareItem = item.type === "weapon" ? equipment.weapon : equipment.armor;
                const ratingDelta = Math.round(Number(item?.rating || 0) - Number(compareItem?.rating || 0));
                const entropy = Math.max(0, Number(item?.crafting?.entropy || 0));
                const entropyCap = Math.max(1, Number(item?.crafting?.entropyCap || 1));
                const entropyState = getEntropyState(item);
                const excellentCount = countExcellentAffixes(item);
                const slotGlyph = ITEM_SLOT_GLYPHS[item?.type] || "•";

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!selectable) return;
                      setSelectedItemId(item.id);
                      setConfirmExtract(false);
                      if (mode === "extract") {
                        toggleExtractSelection(item.id);
                        return;
                      }
                      setSelectedExtractIds(current => current.filter(id => id !== item.id));
                    }}
                    disabled={!selectable}
                    {...{ style: itemCardStyle({ selected, selectable, rarity: item?.rarity }) }}
                  >
                    <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" } }}>
                      <div {...{ style: { minWidth: 0 } }}>
                        <div {...{ style: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" } }}>
                          <span {...{ style: rarityBadgeStyle(item?.rarity) }}>{getCompactRarityLabel(item?.rarity)}</span>
                          <span {...{ style: { fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)" } }}>{getItemGlyph(item?.name)}</span>
                          <span {...{ style: { fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.25 } }}>
                            {item?.name}
                          </span>
                          {(item?.level || 0) > 0 && (
                            <span {...{ style: upgradeBadgeStyle(item.level) }}>+{item.level}</span>
                          )}
                        </div>
                        <div {...{ style: { marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" } }}>
                          <span {...{ style: neutralPillStyle }}>{slotGlyph} {item?.type === "weapon" ? "Arma" : "Armadura"}</span>
                          <span {...{ style: neutralPillStyle }}>Ent {entropy}/{entropyCap}</span>
                          <span {...{ style: { ...neutralPillStyle, ...toneChipStyle(entropyState.tone) } }}>{entropyState.label}</span>
                          {excellentCount > 0 && (
                            <span {...{ style: { ...neutralPillStyle, borderColor: "var(--tone-warning, #fcd34d)", background: "var(--tone-warning-soft, #fefce8)", color: "#a16207" } }}>
                              ▲ Excelente {excellentCount}
                            </span>
                          )}
                          {hasPendingImbueJob && (
                            <span {...{ style: { ...neutralPillStyle, borderColor: "var(--tone-accent, #a5b4fc)", background: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)" } }}>
                              Imbuir pendiente
                            </span>
                          )}
                          {equipped && (
                            <span {...{ style: { ...neutralPillStyle, borderColor: "var(--tone-warning, #fdba74)", background: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-danger, #9a3412)" } }}>
                              Equipado
                            </span>
                          )}
                        </div>
                      </div>
                      <div {...{ style: { textAlign: "right", flexShrink: 0 } }}>
                        <div {...{ style: { fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" } }}>
                          Rating
                        </div>
                        <div {...{ style: { fontSize: "0.88rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                          {formatNumber(item?.rating || 0)}
                        </div>
                        <div {...{ style: {
                          fontSize: "0.62rem",
                          fontWeight: "900",
                          color:
                            ratingDelta > 0
                              ? "var(--tone-success-strong, #166534)"
                              : ratingDelta < 0
                                ? "var(--tone-danger, #D85A30)"
                                : "var(--color-text-secondary, #64748b)",
                        } }}>
                          {ratingDelta > 0 ? `+${ratingDelta}` : `${ratingDelta}`}
                        </div>
                      </div>
                    </div>

                    {mode === "extract" && (
                      <div {...{ style: { marginTop: "8px", display: "flex", justifyContent: "flex-end" } }}>
                        <span {...{ style: { ...neutralPillStyle, ...(selectedExtractIds.includes(item.id)
                          ? { borderColor: "var(--tone-danger, #fda4af)", background: "var(--tone-danger-soft, #fff1f2)", color: "var(--tone-danger-strong, #b91c1c)" }
                          : null) } }}>
                          {selectedExtractIds.includes(item.id) ? "Seleccionado" : "No seleccionado"}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="fl-crafting-legacy-workbench" {...{ style: workbenchPanelStyle(isMobile) }}>
          {!selectedItem && (
            <div {...{ style: emptyStateStyle }}>Selecciona un item para abrir la mesa de trabajo.</div>
          )}

          {selectedItem && (
            <div {...{ style: { display: "grid", gap: "10px" } }}>
              <div {...{ style: workbenchHeaderStyle }}>
                <div {...{ style: eyebrowStyle }}>Mesa de trabajo</div>

                <div {...{ style: workbenchTitleRowStyle }}>
                  <div {...{ style: workbenchTitleMainStyle }}>
                    <span {...{ style: rarityBadgeStyle(selectedItem?.rarity) }}>{getCompactRarityLabel(selectedItem?.rarity)}</span>
                    <span {...{ style: { fontSize: "0.78rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)" } }}>{getItemGlyph(selectedItem?.name)}</span>
                    <span {...{ style: { fontSize: "0.86rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.25 } }}>
                      {selectedItem?.name}
                    </span>
                    {(selectedItem?.level || 0) > 0 && <span {...{ style: upgradeBadgeStyle(selectedItem.level) }}>+{selectedItem.level}</span>}
                  </div>
                  <div {...{ style: headerRatingBlockStyle }}>
                    Rating {formatNumber(selectedItem?.rating || 0)}
                  </div>
                </div>

                <div {...{ style: entropyRowStyle }}>
                  <div {...{ style: entropyMeterStyle }}>
                    <div {...{ style: entropyMeterHeaderStyle }}>
                      <span>Entropia</span>
                      <span>{selectedEntropy}/{selectedEntropyCap}</span>
                    </div>
                    <div {...{ style: entropyTrackStyle }}>
                      <div {...{ style: entropyFillStyle({ ratio: selectedEntropyRatio, tone: selectedEntropyState?.tone }) }} />
                    </div>
                  </div>
                  {selectedEntropyState && (
                    <span {...{ style: { ...neutralPillStyle, ...toneChipStyle(selectedEntropyState.tone) } }}>
                      {selectedEntropyState.label}
                    </span>
                  )}
                </div>

                {mode !== "upgrade" && (
                  <div {...{ style: itemSummaryTextBlockStyle }}>
                    <div {...{ style: itemSummaryLineStyle }}>
                      <span {...{ style: itemSummaryLineLabelStyle }}>Base:</span>
                      <span {...{ style: itemSummaryLineValueStyle }}>{selectedBaseSummaryText}</span>
                    </div>
                    <div {...{ style: itemSummaryLineStyle }}>
                      <span {...{ style: itemSummaryLineLabelStyle }}>Impl:</span>
                      <span {...{ style: itemSummaryImplicitValueStyle }}>{selectedImplicitSummaryText}</span>
                    </div>
                  </div>
                )}

              </div>

              {mode === "extract" ? (
                <div {...{ style: polishInlineLayoutStyle(isMobile) }}>
                  <div {...{ style: polishLinesColumnStyle }}>
                    <div {...{ style: { display: "flex", gap: "6px", flexWrap: "wrap" } }}>
                      <button onClick={() => selectExtractByRarityLimit("common")} {...{ style: secondaryButtonStyle }}>Seleccionar common</button>
                      <button onClick={() => selectExtractByRarityLimit("magic")} {...{ style: secondaryButtonStyle }}>Hasta magic</button>
                      <button onClick={() => selectExtractByRarityLimit("rare")} {...{ style: secondaryButtonStyle }}>Hasta rare</button>
                      <button onClick={clearExtractSelection} {...{ style: secondaryButtonStyle }}>Limpiar</button>
                    </div>

                    <div {...{ style: { display: "flex", gap: "6px", flexWrap: "wrap" } }}>
                      <span {...{ style: neutralPillStyle }}>Items {selectedExtractIds.length}</span>
                      <span {...{ style: neutralPillStyle }}>Esencia estimada +{formatNumber(selectedExtractEssence)}</span>
                    </div>
                  </div>

                  <div {...{ style: polishActionColumnStyle }}>
                    <button
                      onClick={extractSelected}
                      disabled={selectedExtractIds.length <= 0}
                      {...{ style: {
                        ...mainActionButtonStyle({ disabled: selectedExtractIds.length <= 0, danger: true, compact: false }),
                        width: "100%",
                        minHeight: isMobile ? "58px" : "64px",
                        whiteSpace: "normal",
                        alignSelf: "stretch",
                        display: "grid",
                        gap: "2px",
                        alignContent: "center",
                        justifyItems: "center",
                        padding: isMobile ? "7px 8px" : "8px 10px",
                      } }}
                    >
                      <span {...{ style: upgradeActionButtonLabelStyle }}>
                        {selectedExtractIds.length <= 0
                          ? "Extraer"
                          : confirmExtract
                            ? "Confirmar extraccion"
                            : "Extraer"}
                      </span>
                      <span {...{ style: upgradeActionButtonCostStyle }}>
                        {selectedExtractIds.length} items · +{formatNumber(selectedExtractEssence)} esencia
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <React.Fragment>
                  {mode === "polish" && (
                    <div {...{ style: polishInlineLayoutStyle(isMobile) }}>
                      <div {...{ style: polishLinesColumnStyle }}>
                        {(selectedItem?.affixes || []).length <= 0 ? (
                          <div {...{ style: subtleTextStyle }}>Esta pieza no tiene lineas para trabajar.</div>
                        ) : (
                          <div {...{ style: { display: "grid", gap: "6px" } }}>
                            {(selectedItem?.affixes || []).map((affix, index) => {
                              const selected = index === selectedAffixIndex;
                              const isExcellent = affix?.quality === "excellent" || affix?.lootOnlyQuality;
                              return (
                                <button
                                  key={`${selectedItem.id}-affix-${index}`}
                                  onClick={() => setSelectedAffixIndex(index)}
                                  {...{ style: affixRowButtonStyle({ selected, mode, isExcellent }) }}
                                >
                                  <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
                                    <span {...{ style: { fontSize: "0.68rem", fontWeight: "900" } }}>
                                      {STAT_LABELS[affix?.stat] || affix?.stat}
                                    </span>
                                    <span {...{ style: { fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                                      +{formatStatValue(affix?.stat, affix?.rolledValue ?? affix?.value ?? 0)}
                                    </span>
                                  </div>
                                  <div {...{ style: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" } }}>
                                    <span {...{ style: neutralPillStyle }}>
                                      Rango {formatStatValue(affix?.stat, affix?.range?.min ?? 0)} - {formatStatValue(affix?.stat, affix?.range?.max ?? 0)}
                                    </span>
                                    {isExcellent && (
                                      <span {...{ style: { ...neutralPillStyle, borderColor: "var(--tone-warning, #fcd34d)", background: "var(--tone-warning-soft, #fefce8)", color: "#a16207" } }}>
                                        Excelente
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div {...{ style: polishActionColumnStyle }}>
                        <button
                          disabled={selectedActionDisabled}
                          onClick={executePrimaryAction}
                          {...{ style: {
                            ...mainActionButtonStyle({ disabled: selectedActionDisabled, compact: false }),
                            width: "100%",
                            minHeight: isMobile ? "58px" : "64px",
                            whiteSpace: "normal",
                            alignSelf: "stretch",
                            display: "grid",
                            gap: "2px",
                            alignContent: "center",
                            justifyItems: "center",
                            padding: isMobile ? "7px 8px" : "8px 10px",
                          } }}
                        >
                          <span {...{ style: upgradeActionButtonLabelStyle }}>Afinar</span>
                          <span {...{ style: upgradeActionButtonCostStyle }}>{selectedActionCostLabel}</span>
                        </button>
                        {selectedActionReq?.maxUses != null && (
                          <div {...{ style: polishActionMetaStyle }}>
                            Limite {selectedActionReq.usedUses || 0}/{selectedActionReq.maxUses}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {mode === "reforge" && (
                    <div {...{ style: polishInlineLayoutStyle(isMobile) }}>
                      <div {...{ style: polishLinesColumnStyle }}>
                        {(selectedItem?.affixes || []).length <= 0 ? (
                          <div {...{ style: subtleTextStyle }}>Esta pieza no tiene lineas para trabajar.</div>
                        ) : (
                          <div {...{ style: { display: "grid", gap: "6px" } }}>
                            {(selectedItem?.affixes || []).map((affix, index) => {
                              const selected = index === selectedAffixIndex;
                              const isExcellent = affix?.quality === "excellent" || affix?.lootOnlyQuality;
                              return (
                                <button
                                  key={`${selectedItem.id}-affix-${index}`}
                                  onClick={() => setSelectedAffixIndex(index)}
                                  {...{ style: affixRowButtonStyle({ selected, mode, isExcellent }) }}
                                >
                                  <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
                                    <span {...{ style: { fontSize: "0.68rem", fontWeight: "900" } }}>
                                      {STAT_LABELS[affix?.stat] || affix?.stat}
                                    </span>
                                    <span {...{ style: { fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                                      +{formatStatValue(affix?.stat, affix?.rolledValue ?? affix?.value ?? 0)}
                                    </span>
                                  </div>
                                  <div {...{ style: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" } }}>
                                    <span {...{ style: neutralPillStyle }}>
                                      Rango {formatStatValue(affix?.stat, affix?.range?.min ?? 0)} - {formatStatValue(affix?.stat, affix?.range?.max ?? 0)}
                                    </span>
                                    {isExcellent && (
                                      <span {...{ style: { ...neutralPillStyle, borderColor: "var(--tone-warning, #fcd34d)", background: "var(--tone-warning-soft, #fefce8)", color: "#a16207" } }}>
                                        Excelente
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {selectedItemReforgeOptions.length > 0 && (
                          <div {...{ style: subtleTextStyle }}>
                            Preview abierta: elige opcion en el overlay para confirmar la reforja.
                          </div>
                        )}
                      </div>

                      <div {...{ style: polishActionColumnStyle }}>
                        <button
                          disabled={selectedActionDisabled}
                          onClick={executePrimaryAction}
                          {...{ style: {
                            ...mainActionButtonStyle({ disabled: selectedActionDisabled, compact: false }),
                            width: "100%",
                            minHeight: isMobile ? "58px" : "64px",
                            whiteSpace: "normal",
                            alignSelf: "stretch",
                            display: "grid",
                            gap: "2px",
                            alignContent: "center",
                            justifyItems: "center",
                            padding: isMobile ? "7px 8px" : "8px 10px",
                          } }}
                        >
                          <span {...{ style: upgradeActionButtonLabelStyle }}>
                            {hasOpenReforgeOptions ? "Confirmar reforja" : "Reforjar"}
                          </span>
                          <span {...{ style: upgradeActionButtonCostStyle }}>{selectedActionCostLabel}</span>
                        </button>
                        {selectedActionHint && (
                          <div {...{ style: polishActionMetaStyle }}>{selectedActionHint}</div>
                        )}
                        {selectedActionReq?.maxUses != null && (
                          <div {...{ style: polishActionMetaStyle }}>
                            Limite {selectedActionReq.usedUses || 0}/{selectedActionReq.maxUses}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {mode === "ascend" && (
                    <div {...{ style: polishInlineLayoutStyle(isMobile) }}>
                      <div {...{ style: polishLinesColumnStyle }}>
                        {selectedActionReq?.nextRarity === "legendary" && (
                          <div {...{ style: { display: "grid", gap: "6px" } }}>
                            <button
                              onClick={() => setSelectedAscendPowerId(null)}
                              {...{ style: powerOptionStyle({ selected: !selectedAscendPowerId }) }}
                            >
                              Sin poder injertado
                            </button>

                            {selectedAscendPowers.length > 0 ? selectedAscendPowers.map(power => (
                              <button
                                key={power.id}
                                onClick={() => setSelectedAscendPowerId(power.id)}
                                {...{ style: powerOptionStyle({ selected: selectedAscendPowerId === power.id }) }}
                              >
                                <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
                                  <span {...{ style: { fontSize: "0.68rem", fontWeight: "900" } }}>{power.name}</span>
                                  <span {...{ style: neutralPillStyle }}>{power.archetype}</span>
                                </div>
                                <div {...{ style: { ...subtleTextStyle, marginTop: "4px" } }}>{power.shortLabel}</div>
                              </button>
                            )) : (
                              <div {...{ style: subtleTextStyle }}>No hay poderes desbloqueados todavia.</div>
                            )}
                          </div>
                        )}

                        {selectedItemImbueJob && (
                          <div {...{ style: { border: "1px solid rgba(79,70,229,0.24)", background: "var(--tone-accent-soft, #eef2ff)", borderRadius: "10px", padding: "10px", display: "grid", gap: "8px" } }}>
                            <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
                              <span {...{ style: { fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", color: "var(--tone-accent, #4338ca)" } }}>
                                Job de imbuir
                              </span>
                              <span {...{ style: neutralPillStyle }}>
                                {selectedImbueJobClaimable ? "Listo" : `Restante ${formatRemainingDuration(selectedItemImbueRemainingMs)}`}
                              </span>
                            </div>

                            {selectedImbueJobRunning && (
                              <button
                                onClick={() => dispatch({ type: "RUSH_SANCTUARY_JOB", jobId: selectedItemImbueJob.id, now: Date.now() })}
                                disabled={!selectedItemImbueCanRush}
                                {...{ style: mainActionButtonStyle({ disabled: !selectedItemImbueCanRush, warning: true }) }}
                              >
                                {selectedItemImbueCanRush
                                  ? `RUSH ${selectedItemImbueRushCost.relicDust} polvo · ${selectedItemImbueRushCost.sigilFlux} flux`
                                  : `RUSH BLOQUEADO · ${selectedItemImbueRushCost.relicDust} polvo / ${selectedItemImbueRushCost.sigilFlux} flux`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div {...{ style: polishActionColumnStyle }}>
                        <button
                          disabled={selectedActionDisabled}
                          onClick={executePrimaryAction}
                          {...{ style: {
                            ...mainActionButtonStyle({ disabled: selectedActionDisabled, compact: false }),
                            width: "100%",
                            minHeight: isMobile ? "58px" : "64px",
                            whiteSpace: "normal",
                            alignSelf: "stretch",
                            display: "grid",
                            gap: "2px",
                            alignContent: "center",
                            justifyItems: "center",
                            padding: isMobile ? "7px 8px" : "8px 10px",
                          } }}
                        >
                          <span {...{ style: upgradeActionButtonLabelStyle }}>Imbuir</span>
                          <span {...{ style: upgradeActionButtonCostStyle }}>{selectedActionCostLabel}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "upgrade" && (
                    <section {...{ style: primaryActionPanelStyle }}>
                      <div {...{ style: upgradeTwoColumnLayoutStyle(isMobile) }}>
                        <div {...{ style: upgradeLeftColumnStyle }}>
                          <div {...{ style: upgradeStatListStyle }}>
                            {visibleUpgradeRows.length > 0 ? visibleUpgradeRows.map(entry => (
                              <div key={`upgrade-row-${entry.key}`} {...{ style: upgradeStatRowStyle }}>
                                <span {...{ style: upgradeStatLabelStyle }}>
                                  {STAT_LABELS[entry.key] || entry.key} {formatStatValue(entry.key, entry.currentValue)}
                                </span>
                                <span {...{ style: upgradeDeltaBadgeStyle(entry.delta) }}>
                                  {formatDiffValue(entry.key, entry.delta)}
                                </span>
                              </div>
                            )) : (
                              <span {...{ style: subtleTextStyle }}>Sin cambios visibles.</span>
                            )}
                            {hiddenUpgradeRowCount > 0 && (
                              <span {...{ style: upgradeMoreStatsHintStyle }}>+{hiddenUpgradeRowCount} stats mas</span>
                            )}
                          </div>
                        </div>

                        <div {...{ style: upgradeRightColumnStyle }}>
                          <span {...{ style: { ...upgradeDeltaBadgeStyle(selectedUpgradeRatingDelta), justifySelf: "end" } }}>
                            Rating {selectedUpgradeRatingDelta > 0 ? `+${selectedUpgradeRatingDelta}` : `${selectedUpgradeRatingDelta}`}
                          </span>
                          <button
                            disabled={selectedActionDisabled}
                            onClick={executePrimaryAction}
                            {...{ style: {
                              ...mainActionButtonStyle({ disabled: selectedActionDisabled, compact: false }),
                              width: "100%",
                              minHeight: isMobile ? "58px" : "64px",
                              whiteSpace: "normal",
                              alignSelf: "stretch",
                              display: "grid",
                              gap: "2px",
                              alignContent: "center",
                              justifyItems: "center",
                              padding: isMobile ? "7px 8px" : "8px 10px",
                            } }}
                          >
                            <span {...{ style: upgradeActionButtonLabelStyle }}>Mejorar</span>
                            <span {...{ style: upgradeActionButtonCostStyle }}>
                              <span {...{ style: upgradeActionButtonGoldStyle }}>G {formatNumber(selectedActionGoldCost)}</span>
                              <span {...{ style: upgradeActionButtonEntropyStyle }}> · Ent {selectedActionEntropyCost}</span>
                            </span>
                          </button>
                        </div>
                      </div>

                      {selectedActionReq?.maxUses != null && (
                        <div {...{ style: subtleTextStyle }}>
                          Limite {selectedActionReq.usedUses || 0}/{selectedActionReq.maxUses}
                        </div>
                      )}
                    </section>
                  )}

                </React.Fragment>
              )}
            </div>
          )}
        </section>
      </div>

      <details className="fl-crafting-legacy-log" {...{ style: logDetailsStyle }}>
        <summary {...{ style: logSummaryStyle }}>Actividad de forja ({craftingLog.length})</summary>
        <div {...{ style: { display: "grid", gap: "6px", maxHeight: isMobile ? "180px" : "220px", overflowY: "auto", marginTop: "8px" } }}>
          {craftingLog.length > 0 ? craftingLog.slice(-20).reverse().map((entry, index) => (
            <div key={`${entry}-${index}`} {...{ style: logRowStyle }}>{entry}</div>
          )) : (
            <div {...{ style: subtleTextStyle }}>Todavia no hay acciones registradas.</div>
          )}
        </div>
      </details>

      {!USE_GLOBAL_REFORGE_OVERLAY && hasOpenReforgeOptions && activeReforgeAffixIndex != null && (
        <div {...{ style: reforgeOverlayWrapStyle }} role="dialog" aria-modal="true">
          <div {...{ style: reforgeOverlayCardStyle(isMobile) }}>
            <div {...{ style: reforgeOverlayHeaderStyle }}>
              <div {...{ style: { minWidth: 0 } }}>
                <div {...{ style: eyebrowStyle }}>Reforja activa</div>
                <div {...{ style: { fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.25 } }}>
                  Elige una opcion para cerrar la decision
                </div>
              </div>
              <button onClick={cancelReforgePreview} {...{ style: secondaryButtonStyle }}>
                Cancelar
              </button>
            </div>

            <div {...{ style: subtleTextStyle }}>
              Click afuera no cierra este overlay. Debes confirmar o cancelar.
            </div>

            <div {...{ style: reforgeOverlayOptionsStyle }}>
              {selectedItemReforgeOptions.map((option, index) => {
                const selected = isSameReforgeOption(option, selectedReforgeOption);
                const previewBaseItem = activeReforgeItem || selectedItem || null;
                const nextAffixes = (previewBaseItem?.affixes || []).map((affix, affixIndex) => (
                  affixIndex === activeReforgeAffixIndex ? option : affix
                ));
                const preview = previewBaseItem ? buildCraftedItemPreview(previewBaseItem, { affixes: nextAffixes }) : null;
                const ratingDelta = previewBaseItem
                  ? Math.round(Number(preview?.rating || 0) - Number(previewBaseItem?.rating || 0))
                  : 0;

                return (
                  <button
                    key={`${option?.id || option?.stat}-${index}`}
                    onClick={() => setSelectedReforgeOption(option)}
                    {...{ style: reforgeOptionCardStyle({ selected }) }}
                  >
                    <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
                      <span {...{ style: { fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" } }}>
                        {index === 0 ? "Mantener actual" : (STAT_LABELS[option?.stat] || option?.stat)}
                      </span>
                      <span {...{ style: neutralPillStyle }}>{index === 0 ? "Actual" : "Opcion"}</span>
                    </div>
                    <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" } }}>
                      <span {...{ style: { fontSize: "0.66rem", color: "var(--color-text-secondary, #475569)", fontWeight: "800" } }}>
                        +{formatStatValue(option?.stat, option?.rolledValue ?? option?.value ?? 0)}
                      </span>
                      <span {...{ style: {
                        ...neutralPillStyle,
                        color: ratingDelta > 0
                          ? "var(--tone-success-strong, #166534)"
                          : ratingDelta < 0
                            ? "var(--tone-danger, #D85A30)"
                            : "var(--color-text-secondary, #64748b)",
                      } }}>
                        Rating {ratingDelta > 0 ? `+${ratingDelta}` : `${ratingDelta}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div {...{ style: reforgeOverlayFooterStyle(isMobile) }}>
              <button onClick={cancelReforgePreview} {...{ style: secondaryButtonStyle }}>
                Volver
              </button>
              <button
                disabled={!activeReforgeItemId || activeReforgeAffixIndex == null || !selectedReforgeOption}
                onClick={confirmActiveReforgeSession}
                {...{ style: {
                  ...mainActionButtonStyle({
                    disabled: !activeReforgeItemId || activeReforgeAffixIndex == null || !selectedReforgeOption,
                    compact: false,
                  }),
                  minHeight: isMobile ? "58px" : "64px",
                  whiteSpace: "normal",
                  display: "grid",
                  gap: "2px",
                  alignContent: "center",
                  justifyItems: "center",
                  padding: isMobile ? "7px 10px" : "8px 12px",
                } }}
              >
                <span {...{ style: upgradeActionButtonLabelStyle }}>Aplicar opcion</span>
                <span {...{ style: upgradeActionButtonCostStyle }}>Costo ya pagado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {!USE_GLOBAL_REFORGE_OVERLAY && hasStalledReforgeSession && (
        <div {...{ style: reforgeOverlayWrapStyle }} role="dialog" aria-modal="true">
          <div {...{ style: reforgeOverlayCardStyle(isMobile) }}>
            <div {...{ style: reforgeOverlayHeaderStyle }}>
              <div {...{ style: { minWidth: 0 } }}>
                <div {...{ style: eyebrowStyle }}>Reforja activa</div>
                <div {...{ style: { fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.25 } }}>
                  Sesion trabada
                </div>
              </div>
            </div>
            <div {...{ style: subtleTextStyle }}>
              Hay una reforja pendiente sin opciones visibles. Cancela para destrabar y volver a intentar.
            </div>
            <div {...{ style: reforgeOverlayFooterStyle(isMobile) }}>
              <button onClick={cancelReforgePreview} {...{ style: secondaryButtonStyle }}>
                Cancelar reforja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const rootStyle = isMobile => ({
  padding: isMobile ? "0 6px calc(68px + env(safe-area-inset-bottom))" : "0 10px 10px",
  display: "grid",
  gap: "8px",
  color: "var(--color-text-primary, #1e293b)",
});

const topToolbarStyle = {
  border: "1px solid var(--fl2-surface-border, var(--color-border-primary, #e2e8f0))",
  borderRadius: "10px",
  background: "var(--fl2-surface-bg, var(--color-background-secondary, #ffffff))",
  padding: "8px",
  display: "grid",
  gap: "7px",
};

const lockNoticeStyle = {
  border: "1px solid var(--tone-violet, #ddd6fe)",
  borderRadius: "8px",
  padding: "6px 8px",
  background: "var(--tone-violet-soft, #f3e8ff)",
  color: "var(--tone-violet, #6d28d9)",
  fontSize: "0.62rem",
  fontWeight: "900",
};

const panelStyle = {
  border: "1px solid var(--fl2-surface-border, var(--color-border-primary, #e2e8f0))",
  borderRadius: "10px",
  background: "var(--fl2-surface-bg, var(--color-background-secondary, #ffffff))",
  padding: "9px",
  display: "grid",
  gap: "8px",
  alignContent: "start",
};

const mainGridStyle = () => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "8px",
  alignItems: "start",
});

const workbenchPanelStyle = isMobile => ({
  ...panelStyle,
  order: 1,
  maxHeight: isMobile ? "42dvh" : "46dvh",
  overflowY: "auto",
});

const inventoryPanelStyle = isMobile => ({
  ...panelStyle,
  order: 2,
  display: "flex",
  flexDirection: "column",
  minHeight: isMobile ? "28dvh" : "250px",
  maxHeight: isMobile ? "30dvh" : "34dvh",
  overflow: "hidden",
});

const actionPanelStyle = {
  border: "1px solid var(--fl2-surface-border, var(--color-border-primary, #e2e8f0))",
  borderRadius: "10px",
  background: "var(--fl2-surface-bg-soft, var(--color-background-tertiary, #f8fafc))",
  padding: "8px 9px",
  display: "grid",
  gap: "6px",
};

const primaryActionPanelStyle = {
  ...actionPanelStyle,
  padding: "8px 9px",
  gap: "6px",
};

const upgradeTwoColumnLayoutStyle = isMobile => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: isMobile ? "6px" : "8px",
  alignItems: "start",
  minWidth: 0,
});

const upgradeLeftColumnStyle = {
  minWidth: 0,
  display: "grid",
  gap: "3px",
};

const upgradeRightColumnStyle = {
  display: "grid",
  gap: "6px",
  alignContent: "start",
  justifyItems: "end",
  minWidth: 0,
};

const polishInlineLayoutStyle = isMobile => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: isMobile ? "6px" : "8px",
  alignItems: "start",
  minWidth: 0,
});

const polishLinesColumnStyle = {
  minWidth: 0,
  display: "grid",
  gap: "6px",
};

const polishActionColumnStyle = {
  display: "grid",
  gap: "6px",
  alignContent: "start",
  justifyItems: "stretch",
  minWidth: 0,
};

const polishActionMetaStyle = {
  fontSize: "0.56rem",
  color: "var(--color-text-tertiary, #94a3b8)",
  fontWeight: "800",
  textAlign: "right",
  lineHeight: 1.2,
};

const upgradeActionButtonLabelStyle = {
  fontSize: "0.64rem",
  fontWeight: "900",
  lineHeight: 1.1,
  letterSpacing: "0.01em",
};

const upgradeActionButtonCostStyle = {
  fontSize: "0.53rem",
  lineHeight: 1.1,
  fontWeight: "900",
  whiteSpace: "nowrap",
};

const upgradeActionButtonGoldStyle = {
  color: "#fcd34d",
};

const upgradeActionButtonEntropyStyle = {
  color: "#c4b5fd",
};

const upgradeStatListStyle = {
  display: "grid",
  gap: "4px",
  minWidth: 0,
};

const upgradeStatRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  minWidth: 0,
};

const upgradeStatLabelStyle = {
  fontSize: "0.6rem",
  color: "var(--color-text-secondary, #475569)",
  fontWeight: "800",
  lineHeight: 1.2,
  minWidth: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const upgradeDeltaBadgeStyle = diff => ({
  fontSize: "0.56rem",
  fontWeight: "900",
  whiteSpace: "nowrap",
  borderRadius: "999px",
  padding: "2px 7px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  color: diff > 0
    ? "var(--tone-success-strong, #166534)"
    : diff < 0
      ? "var(--tone-danger, #D85A30)"
      : "var(--color-text-secondary, #64748b)",
  background: diff > 0
    ? "var(--tone-success-soft, #ecfdf5)"
    : diff < 0
      ? "var(--tone-danger-soft, #fff1f2)"
      : "var(--color-background-tertiary, #f1f5f9)",
  lineHeight: 1.1,
  flexShrink: 0,
});

const upgradeMoreStatsHintStyle = {
  fontSize: "0.56rem",
  color: "var(--color-text-tertiary, #94a3b8)",
  fontWeight: "800",
  lineHeight: 1.2,
};

const filterSelectStyle = {
  border: "1px solid var(--color-border-primary, #cbd5e1)",
  borderRadius: "8px",
  padding: "6px 8px",
  fontSize: "0.62rem",
  fontWeight: "800",
  background: "var(--color-background-secondary, #fff)",
  color: "var(--color-text-primary, #1e293b)",
};

const itemCardStyle = ({ selected, selectable, rarity }) => ({
  borderTop: `1px solid ${selected ? "var(--tone-accent, #6366f1)" : "var(--color-border-primary, #e2e8f0)"}`,
  borderRight: `1px solid ${selected ? "var(--tone-accent, #6366f1)" : "var(--color-border-primary, #e2e8f0)"}`,
  borderBottom: `1px solid ${selected ? "var(--tone-accent, #6366f1)" : "var(--color-border-primary, #e2e8f0)"}`,
  borderLeft: `3px solid ${getRarityColor(rarity)}`,
  borderRadius: "8px",
  padding: "8px",
  background: selected ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #fff)",
  display: "grid",
  gap: "3px",
  cursor: selectable ? "pointer" : "not-allowed",
  opacity: selectable ? 1 : 0.5,
  textAlign: "left",
});

const itemListStyle = {
  display: "grid",
  gap: "6px",
  minHeight: 0,
  flex: 1,
  overflowY: "auto",
  paddingRight: "2px",
};

const workbenchHeaderStyle = {
  display: "grid",
  gap: "4px",
  borderBottom: "1px solid var(--color-border-primary, #e2e8f0)",
  paddingBottom: "6px",
};

const workbenchTitleRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "6px",
  alignItems: "center",
  minWidth: 0,
};

const workbenchTitleMainStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap",
  minWidth: 0,
};

const headerRatingBlockStyle = {
  fontSize: "0.62rem",
  fontWeight: "900",
  color: "var(--color-text-primary, #334155)",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const entropyRowStyle = {
  marginTop: "1px",
  display: "flex",
  gap: "5px",
  flexWrap: "nowrap",
  alignItems: "center",
  minWidth: 0,
};

const itemSummaryTextBlockStyle = {
  marginTop: "5px",
  display: "grid",
  gap: "2px",
};

const itemSummaryLineStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: "4px",
  minWidth: 0,
};

const itemSummaryLineLabelStyle = {
  fontSize: "0.56rem",
  fontWeight: "900",
  color: "var(--color-text-tertiary, #94a3b8)",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const itemSummaryLineValueStyle = {
  fontSize: "0.59rem",
  color: "var(--color-text-secondary, #475569)",
  lineHeight: 1.2,
  minWidth: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const itemSummaryImplicitValueStyle = {
  ...itemSummaryLineValueStyle,
  color: "var(--tone-info-strong, #075985)",
};

const entropyMeterStyle = {
  minWidth: "118px",
  flex: "1 1 160px",
  maxWidth: "220px",
  display: "grid",
  gap: "3px",
};

const entropyMeterHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "6px",
  fontSize: "0.53rem",
  fontWeight: "900",
  color: "var(--color-text-secondary, #475569)",
  lineHeight: 1.1,
};

const entropyTrackStyle = {
  height: "6px",
  borderRadius: "999px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-tertiary, #f1f5f9)",
  overflow: "hidden",
};

const entropyFillStyle = ({ ratio = 0 } = {}) => {
  const width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
  return {
    width,
    minWidth: ratio > 0 ? "2px" : "0px",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)",
    transition: "width 180ms ease-out",
  };
};

const neutralPillStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-tertiary, #f8fafc)",
  color: "var(--color-text-secondary, #475569)",
  borderRadius: "999px",
  padding: "2px 7px",
  fontSize: "0.56rem",
  fontWeight: "900",
  lineHeight: 1.2,
};

const eyebrowStyle = {
  fontSize: "0.56rem",
  color: "var(--color-text-tertiary, #94a3b8)",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const subtleTextStyle = {
  fontSize: "0.64rem",
  color: "var(--color-text-secondary, #64748b)",
  lineHeight: 1.4,
};

const emptyStateStyle = {
  border: "1px dashed var(--color-border-primary, #cbd5e1)",
  borderRadius: "10px",
  padding: "12px",
  textAlign: "center",
  fontSize: "0.66rem",
  color: "var(--color-text-secondary, #64748b)",
  background: "var(--color-background-tertiary, #f8fafc)",
};

const secondaryButtonStyle = {
  border: "1px solid var(--color-border-primary, #cbd5e1)",
  background: "var(--color-background-secondary, #fff)",
  color: "var(--color-text-secondary, #475569)",
  borderRadius: "8px",
  padding: "6px 9px",
  fontSize: "0.62rem",
  fontWeight: "900",
  cursor: "pointer",
};

const mainActionButtonStyle = ({ disabled = false, danger = false, warning = false, compact = false } = {}) => ({
  border: "1px solid",
  borderColor: disabled
    ? "rgba(148,163,184,0.4)"
    : danger
      ? "rgba(190,24,93,0.42)"
      : warning
        ? "rgba(180,83,9,0.4)"
        : "rgba(30,41,59,0.2)",
  background: disabled
    ? "linear-gradient(180deg, #475569 0%, #334155 100%)"
    : danger
      ? "linear-gradient(180deg, #991b1b 0%, #7f1d1d 100%)"
      : warning
        ? "linear-gradient(180deg, #92400e 0%, #78350f 100%)"
        : "linear-gradient(180deg, #243244 0%, #1e293b 100%)",
  color: "#ffffff",
  borderRadius: compact ? "8px" : "10px",
  padding: compact ? "7px 10px" : "10px 12px",
  fontSize: compact ? "0.62rem" : "0.68rem",
  fontWeight: "900",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.8 : 1,
  boxShadow: "0 8px 18px rgba(15,23,42,0.16)",
});

const affixRowButtonStyle = ({ selected, mode, isExcellent }) => ({
  border: "1px solid",
  borderColor: selected
    ? mode === "polish"
      ? "var(--tone-info, #0ea5e9)"
      : "var(--tone-violet, #7c3aed)"
    : "var(--color-border-primary, #e2e8f0)",
  background: isExcellent
    ? "var(--tone-warning-soft, #fffbeb)"
    : selected
      ? mode === "polish"
        ? "var(--tone-info-soft, #ecfeff)"
        : "var(--tone-violet-soft, #f3e8ff)"
      : "var(--color-background-secondary, #fff)",
  color: "var(--color-text-primary, #1e293b)",
  borderRadius: "9px",
  padding: "8px 9px",
  cursor: "pointer",
  textAlign: "left",
});

const reforgeOptionCardStyle = ({ selected }) => ({
  border: `1px solid ${selected ? "var(--tone-violet, #7c3aed)" : "var(--color-border-primary, #e2e8f0)"}`,
  background: selected ? "var(--tone-violet-soft, #f3e8ff)" : "var(--color-background-secondary, #fff)",
  borderRadius: "9px",
  padding: "8px 9px",
  cursor: "pointer",
  textAlign: "left",
  display: "grid",
  gap: "2px",
});

const reforgeOverlayWrapStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 7600,
  background: "rgba(15,23,42,0.62)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px",
};

const reforgeOverlayCardStyle = isMobile => ({
  width: isMobile ? "min(680px, 100%)" : "min(760px, 100%)",
  maxHeight: isMobile ? "88dvh" : "82vh",
  overflowY: "auto",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "14px",
  background: "var(--color-background-secondary, #ffffff)",
  boxShadow: "0 24px 50px rgba(15,23,42,0.32)",
  padding: isMobile ? "12px" : "14px",
  display: "grid",
  gap: "10px",
});

const reforgeOverlayHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
};

const reforgeOverlayOptionsStyle = {
  display: "grid",
  gap: "8px",
};

const reforgeOverlayFooterStyle = isMobile => ({
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "auto minmax(200px, 1fr)",
  gap: "8px",
  alignItems: "center",
});

const powerOptionStyle = ({ selected }) => ({
  border: `1px solid ${selected ? "var(--tone-warning, #fb923c)" : "var(--color-border-primary, #e2e8f0)"}`,
  background: selected ? "var(--tone-warning-soft, #fff7ed)" : "var(--color-background-secondary, #fff)",
  color: "var(--color-text-primary, #1e293b)",
  borderRadius: "9px",
  padding: "8px 9px",
  cursor: "pointer",
  textAlign: "left",
});

const logRowStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-tertiary, #f8fafc)",
  borderRadius: "8px",
  padding: "7px 9px",
  fontSize: "0.64rem",
  color: "var(--color-text-primary, #334155)",
  fontWeight: "700",
};

const logDetailsStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "10px",
  background: "var(--color-background-secondary, #ffffff)",
  padding: "8px 9px",
};

const logSummaryStyle = {
  cursor: "pointer",
  fontSize: "0.66rem",
  fontWeight: "900",
  color: "var(--color-text-secondary, #475569)",
};

const rarityBadgeStyle = rarity => {
  const color = getRarityColor(rarity);
  return {
    fontSize: "0.54rem",
    fontWeight: "900",
    padding: "3px 7px",
    borderRadius: "999px",
    background: `${color}22`,
    color,
    border: `1px solid ${color}44`,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
};

const upgradeBadgeStyle = level => {
  const tone = getUpgradeBadgeTone(level);
  return {
    fontSize: "0.58rem",
    fontWeight: "900",
    padding: "2px 6px",
    borderRadius: "999px",
    background: tone.background,
    color: tone.color,
    border: tone.border,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
};
