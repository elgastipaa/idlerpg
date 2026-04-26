import React, { useEffect, useMemo, useState } from "react";
import useViewport from "../hooks/useViewport";
import {
  buildCraftedItemPreview,
  getCraftActionState,
  getCraftUsageSummary,
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
  getTopCompareEntries,
  formatImplicitSummary,
} from "../utils/itemPresentation";
import { getCompactRarityLabel, getItemGlyph, getUpgradeBadgeTone, ITEM_SLOT_GLYPHS } from "../utils/itemVisuals";
import {
  FORGE_MODE_META,
  FORGE_MODE_ORDER,
  formatCraftCostLabel,
  getCraftActionBadge,
  getCraftActionHint,
} from "./crafting/craftingUi";

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

export default function Crafting({ state, dispatch }) {
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
  const [selectedAffixIndex, setSelectedAffixIndex] = useState(null);
  const [selectedReforgeOption, setSelectedReforgeOption] = useState(null);
  const [selectedAscendPowerId, setSelectedAscendPowerId] = useState(null);
  const [selectedExtractIds, setSelectedExtractIds] = useState([]);
  const [confirmExtract, setConfirmExtract] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [slotFilter, setSlotFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");

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
    setMode("reforge");
    setSelectedItemId(reforgeSession.itemId);
    if (Number.isInteger(Number(reforgeSession.affixIndex))) {
      setSelectedAffixIndex(Number(reforgeSession.affixIndex));
    }
  }, [reforgeSession]);

  useEffect(() => {
    if (mode !== "extract") {
      setConfirmExtract(false);
      return;
    }
    setSelectedReforgeOption(null);
    setSelectedAscendPowerId(null);
  }, [mode]);

  useEffect(() => {
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
  }, [filteredItems, selectedItemId, mode, equipment, reforgeSession, pendingImbueByItemId]);

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

  const selectedItemReforgeOptions = useMemo(() => {
    if (!selectedItem || mode !== "reforge" || selectedAffixIndex == null) return [];
    if (
      reforgeSession &&
      reforgeSession.itemId === selectedItem.id &&
      Number(reforgeSession.affixIndex) === Number(selectedAffixIndex)
    ) {
      return Array.isArray(reforgeSession.options) ? reforgeSession.options : [];
    }
    return [];
  }, [selectedItem, mode, selectedAffixIndex, reforgeSession]);

  useEffect(() => {
    if (!selectedReforgeOption || selectedItemReforgeOptions.length <= 0) return;
    const isValid = selectedItemReforgeOptions.some(option => isSameReforgeOption(option, selectedReforgeOption));
    if (!isValid) setSelectedReforgeOption(null);
  }, [selectedReforgeOption, selectedItemReforgeOptions]);

  const selectedCurrentAffix =
    selectedItem && selectedAffixIndex != null
      ? selectedItem.affixes?.[selectedAffixIndex] || null
      : null;

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

  const selectedCompareItem = selectedItem
    ? (selectedItem.type === "weapon" ? equipment.weapon : equipment.armor)
    : null;

  const selectedItemUsage = selectedItem ? getCraftUsageSummary(selectedItem, selectedAffixIndex) : null;
  const selectedCompareEntries = useMemo(() => {
    if (!selectedItem) return [];
    return getTopCompareEntries(selectedItem, selectedCompareItem, 6)
      .filter(entry => Math.abs(Number(entry?.diff || 0)) > 0.0001)
      .slice(0, 4);
  }, [selectedCompareItem, selectedItem]);

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

  const selectedImbueCountdownFinished =
    selectedItemImbueJob?.status === "running" && selectedItemImbueRemainingMs <= 0;
  const selectedImbueJobRunning =
    mode === "ascend" && selectedItemImbueJob?.status === "running" && !selectedImbueCountdownFinished;
  const selectedImbueJobClaimable =
    mode === "ascend" && (selectedItemImbueJob?.status === "claimable" || selectedImbueCountdownFinished);

  const selectedCurrentOptionIsKeep =
    mode === "reforge" &&
    selectedCurrentAffix &&
    selectedReforgeOption &&
    isSameReforgeOption(selectedCurrentAffix, selectedReforgeOption);

  const selectedActionDisabled = (() => {
    if (!selectedItem) return true;
    if (mode === "extract") return true;
    if (selectedImbueJobRunning) return true;
    if (mode === "polish" && selectedAffixIndex == null) return true;
    if (mode === "reforge" && selectedAffixIndex == null) return true;
    if (mode === "reforge" && selectedItemReforgeOptions.length > 0 && !selectedReforgeOption) return true;
    if (mode === "ascend" && selectedImbueJobClaimable) return false;
    return !selectedActionReq.can;
  })();

  const selectedActionLabel = (() => {
    if (mode === "ascend") {
      if (selectedImbueJobClaimable) return "RECLAMAR IMBUIR";
      if (selectedImbueJobRunning) return "IMBUIR EN CURSO";
      return "INICIAR IMBUIR";
    }
    if (mode === "reforge") {
      if (selectedItemReforgeOptions.length > 0) {
        return selectedCurrentOptionIsKeep ? "MANTENER LINEA" : "CONFIRMAR REFORJA";
      }
      return "PAGAR REFORJA";
    }
    return FORGE_MODE_META[mode]?.cta || "APLICAR";
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

  const selectedExtractEssence = useMemo(() => {
    if (selectedExtractIds.length <= 0) return 0;
    const byId = Object.fromEntries(allItems.map(item => [item.id, item]));
    return selectedExtractIds.reduce((total, itemId) => total + computeExtractYield(byId[itemId] || {}), 0);
  }, [allItems, selectedExtractIds]);

  const selectedAffixAdvancedData = useMemo(() => {
    if (!selectedItem || selectedAffixIndex == null) return null;
    const lineCraft = selectedItem?.crafting?.lineCraftCounts?.[String(selectedAffixIndex)] || { polish: 0, reforge: 0 };
    const affix = selectedItem?.affixes?.[selectedAffixIndex] || null;
    if (!affix) return null;
    return {
      affix,
      lineCraft,
      quality: affix?.quality || (affix?.lootOnlyQuality ? "excellent" : "normal"),
      source: affix?.source || "base",
      legacyTier: Number.isInteger(Number(affix?.legacyTier)) ? Number(affix.legacyTier) : null,
    };
  }, [selectedAffixIndex, selectedItem]);

  const selectedAscendPowers = useMemo(() => {
    if (!selectedItem || mode !== "ascend" || selectedActionReq?.nextRarity !== "legendary") return [];
    return unlockedLegendaryPowers;
  }, [mode, selectedActionReq?.nextRarity, selectedItem, unlockedLegendaryPowers]);

  const selectedAscendPower = selectedAscendPowerId ? unlockedLegendaryPowerMap[selectedAscendPowerId] || null : null;

  const hasAnyItems = filteredItems.length > 0;
  const canOpenAbyssAffixes = hasAbyssCraftingAffixes && ["epic", "legendary"].includes(selectedItem?.rarity);
  const selectedEntropyState = selectedItem ? getEntropyState(selectedItem) : null;
  const selectedEntropy = Math.max(0, Number(selectedItem?.crafting?.entropy || 0));
  const selectedEntropyCap = Math.max(1, Number(selectedItem?.crafting?.entropyCap || 1));

  const executePrimaryAction = () => {
    if (!selectedItem) return;

    if (mode === "upgrade") {
      if (!selectedActionReq.can) return;
      dispatch({ type: "CRAFT_UPGRADE_ITEM", payload: { itemId: selectedItem.id } });
      return;
    }

    if (mode === "polish") {
      if (!selectedActionReq.can || selectedAffixIndex == null) return;
      dispatch({ type: "CRAFT_POLISH_ITEM", payload: { itemId: selectedItem.id, affixIndex: selectedAffixIndex } });
      return;
    }

    if (mode === "reforge") {
      if (selectedAffixIndex == null) return;

      if (selectedItemReforgeOptions.length <= 0) {
        if (!selectedActionReq.can) return;
        dispatch({
          type: "CRAFT_REFORGE_PREVIEW",
          payload: {
            itemId: selectedItem.id,
            affixIndex: selectedAffixIndex,
            favoredStats: [],
            allowAbyssAffixes: canOpenAbyssAffixes,
          },
        });
        setSelectedReforgeOption(null);
        return;
      }

      if (!selectedReforgeOption) return;
      dispatch({
        type: "CRAFT_REFORGE_ITEM",
        payload: {
          itemId: selectedItem.id,
          affixIndex: selectedAffixIndex,
          replacementAffix: selectedReforgeOption,
        },
      });
      setSelectedReforgeOption(null);
      return;
    }

    if (mode === "ascend") {
      if (selectedImbueJobClaimable && selectedItemImbueJob?.id) {
        dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId: selectedItemImbueJob.id, now: Date.now() });
        return;
      }
      if (selectedImbueJobRunning) return;
      if (!selectedActionReq.can) return;
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

  const isReforgeLocked = Boolean(reforgeSession?.itemId);
  const canSwitchMode = nextMode => !isReforgeLocked || nextMode === "reforge";

  const craftingLog = Array.isArray(state?.combat?.craftingLog) ? state.combat.craftingLog : [];

  return (
    <div style={rootStyle(isMobile)}>
      <section style={topToolbarStyle}>
        <div style={resourceStripStyle}>
          <span style={resourceChipStyle}>Oro {formatNumber(player?.gold || 0)}</span>
          <span style={resourceChipStyle}>Esencia {formatNumber(player?.essence || 0)}</span>
          <span style={resourceChipStyle}>Polvo {formatNumber(sanctuaryResources?.relicDust || 0)}</span>
          <span style={resourceChipStyle}>Flux {formatNumber(sanctuaryResources?.sigilFlux || 0)}</span>
        </div>

        {!isMobile && (
          <div style={toolStripStyle}>
            {FORGE_MODE_ORDER.map(modeId => {
              const active = modeId === mode;
              const disabled = !canSwitchMode(modeId);
              return (
                <button
                  key={modeId}
                  onClick={() => {
                    if (disabled) return;
                    setMode(modeId);
                    setSelectedReforgeOption(null);
                  }}
                  disabled={disabled}
                  style={modeButtonStyle({
                    active,
                    disabled,
                    tone: FORGE_MODE_META[modeId]?.color,
                    isMobile,
                  })}
                >
                  {FORGE_MODE_META[modeId]?.label || modeId}
                </button>
              );
            })}
          </div>
        )}

        {isReforgeLocked && (
          <div style={lockNoticeStyle}>
            Reforja abierta: termina esta decision antes de cambiar de herramienta.
          </div>
        )}
      </section>

      <div style={mainGridStyle(isMobile)}>
        <section style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
              Items ({filteredItems.length})
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <select value={slotFilter} onChange={event => setSlotFilter(event.target.value)} style={filterSelectStyle}>
                {SLOT_FILTERS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              <select value={rarityFilter} onChange={event => setRarityFilter(event.target.value)} style={filterSelectStyle}>
                {RARITY_FILTERS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {!hasAnyItems && (
            <div style={emptyStateStyle}>No hay items para forjar con esos filtros.</div>
          )}

          {hasAnyItems && (
            <div style={itemListStyle(isMobile)}>
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
                    style={itemCardStyle({ selected, selectable, rarity: item?.rarity })}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={rarityBadgeStyle(item?.rarity)}>{getCompactRarityLabel(item?.rarity)}</span>
                          <span style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)" }}>{getItemGlyph(item?.name)}</span>
                          <span style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.25 }}>
                            {item?.name}
                          </span>
                          {(item?.level || 0) > 0 && (
                            <span style={upgradeBadgeStyle(item.level)}>+{item.level}</span>
                          )}
                        </div>
                        <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={neutralPillStyle}>{slotGlyph} {item?.type === "weapon" ? "Arma" : "Armadura"}</span>
                          <span style={neutralPillStyle}>Ent {entropy}/{entropyCap}</span>
                          <span style={{ ...neutralPillStyle, ...toneChipStyle(entropyState.tone) }}>{entropyState.label}</span>
                          {excellentCount > 0 && (
                            <span style={{ ...neutralPillStyle, borderColor: "var(--tone-warning, #fcd34d)", background: "var(--tone-warning-soft, #fefce8)", color: "#a16207" }}>
                              ▲ Excelente {excellentCount}
                            </span>
                          )}
                          {hasPendingImbueJob && (
                            <span style={{ ...neutralPillStyle, borderColor: "var(--tone-accent, #a5b4fc)", background: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)" }}>
                              Imbuir pendiente
                            </span>
                          )}
                          {equipped && (
                            <span style={{ ...neutralPillStyle, borderColor: "var(--tone-warning, #fdba74)", background: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-danger, #9a3412)" }}>
                              Equipado
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                          Rating
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                          {formatNumber(item?.rating || 0)}
                        </div>
                        <div style={{
                          fontSize: "0.62rem",
                          fontWeight: "900",
                          color:
                            ratingDelta > 0
                              ? "var(--tone-success-strong, #166534)"
                              : ratingDelta < 0
                                ? "var(--tone-danger, #D85A30)"
                                : "var(--color-text-secondary, #64748b)",
                        }}>
                          {ratingDelta > 0 ? `+${ratingDelta}` : `${ratingDelta}`}
                        </div>
                      </div>
                    </div>

                    {mode === "extract" && (
                      <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                        <span style={{ ...neutralPillStyle, ...(selectedExtractIds.includes(item.id)
                          ? { borderColor: "var(--tone-danger, #fda4af)", background: "var(--tone-danger-soft, #fff1f2)", color: "var(--tone-danger-strong, #b91c1c)" }
                          : null) }}>
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

        <section style={panelStyle}>
          {!selectedItem && (
            <div style={emptyStateStyle}>Selecciona un item para abrir la mesa de trabajo.</div>
          )}

          {selectedItem && (
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={workbenchHeaderStyle}>
                <div style={{ minWidth: 0 }}>
                  <div style={eyebrowStyle}>Mesa de trabajo</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                    <span style={rarityBadgeStyle(selectedItem?.rarity)}>{getCompactRarityLabel(selectedItem?.rarity)}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)" }}>{getItemGlyph(selectedItem?.name)}</span>
                    <span style={{ fontSize: "0.86rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.25 }}>
                      {selectedItem?.name}
                    </span>
                    {(selectedItem?.level || 0) > 0 && <span style={upgradeBadgeStyle(selectedItem.level)}>+{selectedItem.level}</span>}
                  </div>
                  <div style={{ ...subtleTextStyle, marginTop: "4px" }}>
                    Rating {formatNumber(selectedItem?.rating || 0)}
                    {selectedCompareItem && (
                      <span>
                        {" "}· vs equipado {Math.round(Number(selectedItem?.rating || 0) - Number(selectedCompareItem?.rating || 0))}
                      </span>
                    )}
                  </div>
                  {selectedCompareItem && selectedCompareEntries.length > 0 && (
                    <div style={compareListStyle}>
                      {selectedCompareEntries.map(entry => (
                        <div key={`compare-${entry.key}`} style={compareRowStyle}>
                          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {STAT_LABELS[entry.key] || entry.key}
                          </span>
                          <span style={diffBadgeStyle(entry.diff)}>{formatDiffValue(entry.key, entry.diff)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={selectedMetaRowStyle}>
                    <span style={neutralPillStyle}>Ent {selectedEntropy}/{selectedEntropyCap}</span>
                    {selectedEntropyState && (
                      <span style={{ ...neutralPillStyle, ...toneChipStyle(selectedEntropyState.tone) }}>
                        {selectedEntropyState.label}
                      </span>
                    )}
                    <span style={neutralPillStyle}>{selectedActionCostLabel}</span>
                  </div>
                </div>
                <button onClick={() => setShowAdvanced(current => !current)} style={secondaryButtonStyle}>
                  {showAdvanced ? "Ocultar avanzado" : "Avanzado"}
                </button>
              </div>

              {mode === "extract" ? (
                <section style={actionPanelStyle}>
                  <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                    Extraccion desde Santuario
                  </div>
                  <div style={subtleTextStyle}>
                    Convierte piezas no equipadas en esencia.
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button onClick={() => selectExtractByRarityLimit("common")} style={secondaryButtonStyle}>Seleccionar common</button>
                    <button onClick={() => selectExtractByRarityLimit("magic")} style={secondaryButtonStyle}>Hasta magic</button>
                    <button onClick={() => selectExtractByRarityLimit("rare")} style={secondaryButtonStyle}>Hasta rare</button>
                    <button onClick={clearExtractSelection} style={secondaryButtonStyle}>Limpiar</button>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span style={neutralPillStyle}>Items {selectedExtractIds.length}</span>
                    <span style={neutralPillStyle}>Esencia estimada +{formatNumber(selectedExtractEssence)}</span>
                  </div>

                  <button
                    onClick={extractSelected}
                    disabled={selectedExtractIds.length <= 0}
                    style={mainActionButtonStyle({ disabled: selectedExtractIds.length <= 0, danger: true })}
                  >
                    {selectedExtractIds.length <= 0
                      ? "SELECCIONA ITEMS"
                      : confirmExtract
                        ? `CONFIRMAR EXTRACCION (${selectedExtractIds.length})`
                        : `EXTRAER SELECCIONADOS (${selectedExtractIds.length})`}
                  </button>
                </section>
              ) : (
                <React.Fragment>
                  {(mode === "polish" || mode === "reforge") && (
                    <section style={actionPanelStyle}>
                      <div style={{ fontSize: "0.68rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                        Lineas del item
                      </div>
                      {(selectedItem?.affixes || []).length <= 0 ? (
                        <div style={subtleTextStyle}>Esta pieza no tiene lineas para trabajar.</div>
                      ) : (
                        <div style={{ display: "grid", gap: "6px" }}>
                          {(selectedItem?.affixes || []).map((affix, index) => {
                            const selected = index === selectedAffixIndex;
                            const isExcellent = affix?.quality === "excellent" || affix?.lootOnlyQuality;
                            return (
                              <button
                                key={`${selectedItem.id}-affix-${index}`}
                                onClick={() => setSelectedAffixIndex(index)}
                                style={affixRowButtonStyle({ selected, mode, isExcellent })}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "0.68rem", fontWeight: "900" }}>
                                    {STAT_LABELS[affix?.stat] || affix?.stat}
                                  </span>
                                  <span style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                                    +{formatStatValue(affix?.stat, affix?.rolledValue ?? affix?.value ?? 0)}
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" }}>
                                  <span style={neutralPillStyle}>
                                    Rango {formatStatValue(affix?.stat, affix?.range?.min ?? 0)} - {formatStatValue(affix?.stat, affix?.range?.max ?? 0)}
                                  </span>
                                  {isExcellent && (
                                    <span style={{ ...neutralPillStyle, borderColor: "var(--tone-warning, #fcd34d)", background: "var(--tone-warning-soft, #fefce8)", color: "#a16207" }}>
                                      Excelente
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}

                  {mode === "upgrade" && (
                    <section style={actionPanelStyle}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                        Preview de +1
                      </div>
                      {selectedUpgradeDeltas.length <= 0 ? (
                        <div style={subtleTextStyle}>Sin cambios visibles para el siguiente nivel.</div>
                      ) : (
                        <div style={{ display: "grid", gap: "5px" }}>
                          {selectedUpgradeDeltas.map(entry => (
                            <div key={`upgrade-delta-${entry.key}`} style={deltaRowStyle}>
                              <span>{STAT_LABELS[entry.key] || entry.key}</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <span style={{ fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                                  {formatStatValue(entry.key, entry.currentValue)} {"->"} {formatStatValue(entry.key, entry.nextValue)}
                                </span>
                                <span style={diffBadgeStyle(entry.delta)}>{formatDiffValue(entry.key, entry.delta)}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {mode === "polish" && selectedCurrentAffix && (
                    <section style={actionPanelStyle}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                        Afinar linea seleccionada
                      </div>
                      <div style={subtleTextStyle}>
                        Ajusta solo el valor de {STAT_LABELS[selectedCurrentAffix?.stat] || selectedCurrentAffix?.stat}. No cambia el atributo ni la calidad.
                      </div>
                    </section>
                  )}

                  {mode === "reforge" && (
                    <section style={actionPanelStyle}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                        Reforja
                      </div>
                      <div style={subtleTextStyle}>
                        Pool general: mantienes la linea actual o eliges una opcion nueva.
                      </div>

                      {selectedItemReforgeOptions.length > 0 && selectedAffixIndex != null && (
                        <div style={{ display: "grid", gap: "6px" }}>
                          {selectedItemReforgeOptions.map((option, index) => {
                            const selected = isSameReforgeOption(option, selectedReforgeOption);
                            const nextAffixes = (selectedItem?.affixes || []).map((affix, affixIndex) => (
                              affixIndex === selectedAffixIndex ? option : affix
                            ));
                            const preview = buildCraftedItemPreview(selectedItem, { affixes: nextAffixes });
                            const ratingDelta = Math.round(Number(preview?.rating || 0) - Number(selectedItem?.rating || 0));

                            return (
                              <button
                                key={`${option?.id || option?.stat}-${index}`}
                                onClick={() => setSelectedReforgeOption(option)}
                                style={reforgeOptionCardStyle({ selected })}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                                    {index === 0 ? "Mantener actual" : (STAT_LABELS[option?.stat] || option?.stat)}
                                  </span>
                                  <span style={neutralPillStyle}>{index === 0 ? "Actual" : "Opcion"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" }}>
                                  <span style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #475569)", fontWeight: "800" }}>
                                    +{formatStatValue(option?.stat, option?.rolledValue ?? option?.value ?? 0)}
                                  </span>
                                  <span style={{
                                    ...neutralPillStyle,
                                    color: ratingDelta > 0
                                      ? "var(--tone-success-strong, #166534)"
                                      : ratingDelta < 0
                                        ? "var(--tone-danger, #D85A30)"
                                        : "var(--color-text-secondary, #64748b)",
                                  }}>
                                    Rating {ratingDelta > 0 ? `+${ratingDelta}` : `${ratingDelta}`}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}

                  {mode === "ascend" && (
                    <section style={actionPanelStyle}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                        Imbuir
                      </div>

                      {selectedActionReq?.nextRarity === "legendary" && (
                        <div style={{ display: "grid", gap: "6px" }}>
                          <button
                            onClick={() => setSelectedAscendPowerId(null)}
                            style={powerOptionStyle({ selected: !selectedAscendPowerId })}
                          >
                            Sin poder injertado
                          </button>

                          {selectedAscendPowers.length > 0 ? selectedAscendPowers.map(power => (
                            <button
                              key={power.id}
                              onClick={() => setSelectedAscendPowerId(power.id)}
                              style={powerOptionStyle({ selected: selectedAscendPowerId === power.id })}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "0.68rem", fontWeight: "900" }}>{power.name}</span>
                                <span style={neutralPillStyle}>{power.archetype}</span>
                              </div>
                              <div style={{ ...subtleTextStyle, marginTop: "4px" }}>{power.shortLabel}</div>
                            </button>
                          )) : (
                            <div style={subtleTextStyle}>No hay poderes desbloqueados todavia.</div>
                          )}
                        </div>
                      )}

                      {selectedItemImbueJob && (
                        <div style={{ border: "1px solid rgba(79,70,229,0.24)", background: "var(--tone-accent-soft, #eef2ff)", borderRadius: "10px", padding: "10px", display: "grid", gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", color: "var(--tone-accent, #4338ca)" }}>
                              Job de imbuir
                            </span>
                            <span style={neutralPillStyle}>
                              {selectedImbueJobClaimable ? "Listo" : `Restante ${formatRemainingDuration(selectedItemImbueRemainingMs)}`}
                            </span>
                          </div>

                          {selectedImbueJobRunning && (
                            <button
                              onClick={() => dispatch({ type: "RUSH_SANCTUARY_JOB", jobId: selectedItemImbueJob.id, now: Date.now() })}
                              disabled={!selectedItemImbueCanRush}
                              style={mainActionButtonStyle({ disabled: !selectedItemImbueCanRush, warning: true })}
                            >
                              {selectedItemImbueCanRush
                                ? `RUSH ${selectedItemImbueRushCost.relicDust} polvo · ${selectedItemImbueRushCost.sigilFlux} flux`
                                : `RUSH BLOQUEADO · ${selectedItemImbueRushCost.relicDust} polvo / ${selectedItemImbueRushCost.sigilFlux} flux`}
                            </button>
                          )}
                        </div>
                      )}
                    </section>
                  )}

                  <section style={actionPanelStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                        {FORGE_MODE_META[mode]?.label || "Accion"}
                      </div>
                    </div>
                    <div style={subtleTextStyle}>{selectedActionHint}</div>

                    <button
                      disabled={selectedActionDisabled}
                      onClick={executePrimaryAction}
                      style={mainActionButtonStyle({ disabled: selectedActionDisabled })}
                    >
                      {selectedActionLabel}
                    </button>

                    {selectedActionReq?.maxUses != null && (
                      <div style={subtleTextStyle}>
                        Limite {selectedActionReq.usedUses || 0}/{selectedActionReq.maxUses}
                      </div>
                    )}
                  </section>

                  {showAdvanced && (
                    <section style={actionPanelStyle}>
                      <div style={{ fontSize: "0.68rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                        Modo avanzado
                      </div>

                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={neutralPillStyle}>Entropy {Math.max(0, Number(selectedItem?.crafting?.entropy || 0))}/{Math.max(1, Number(selectedItem?.crafting?.entropyCap || 1))}</span>
                        <span style={neutralPillStyle}>Estado {getEntropyState(selectedItem).label}</span>
                        <span style={neutralPillStyle}>Reforge {selectedItemUsage?.reforge?.used || 0}/{selectedItemUsage?.reforge?.max == null ? "∞" : selectedItemUsage?.reforge?.max}</span>
                        <span style={neutralPillStyle}>Polish linea {selectedItemUsage?.polish?.used || 0}/{selectedItemUsage?.polish?.max == null ? "∞" : selectedItemUsage?.polish?.max}</span>
                        <span style={neutralPillStyle}>{getCraftActionBadge(selectedActionReq, mode)}</span>
                      </div>

                      {selectedAffixAdvancedData && (
                        <div style={{ display: "grid", gap: "4px", marginTop: "2px" }}>
                          <div style={advancedRowStyle}>Calidad: <strong>{selectedAffixAdvancedData.quality}</strong></div>
                          <div style={advancedRowStyle}>Source: <strong>{selectedAffixAdvancedData.source}</strong></div>
                          <div style={advancedRowStyle}>Rango: <strong>{formatStatValue(selectedAffixAdvancedData.affix?.stat, selectedAffixAdvancedData.affix?.range?.min ?? 0)} - {formatStatValue(selectedAffixAdvancedData.affix?.stat, selectedAffixAdvancedData.affix?.range?.max ?? 0)}</strong></div>
                          <div style={advancedRowStyle}>Line craft counts: <strong>Polish {selectedAffixAdvancedData.lineCraft.polish || 0} · Reforge {selectedAffixAdvancedData.lineCraft.reforge || 0}</strong></div>
                          {selectedAffixAdvancedData.legacyTier != null && (
                            <div style={advancedRowStyle}>Legacy tier: <strong>T{selectedAffixAdvancedData.legacyTier}</strong></div>
                          )}
                        </div>
                      )}

                      {selectedItem?.bonus && (
                        <div style={{ display: "grid", gap: "4px", marginTop: "2px" }}>
                          {getPrioritizedStatEntries(selectedItem.bonus || {}, 4).map(([key, value]) => (
                            <div key={`adv-stat-${key}`} style={advancedRowStyle}>
                              {STAT_LABELS[key] || key}: <strong>{formatStatValue(key, value)}</strong>
                            </div>
                          ))}
                          {formatImplicitSummary(selectedItem) && (
                            <div style={advancedRowStyle}>Implicito: <strong>{formatImplicitSummary(selectedItem)}</strong></div>
                          )}
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

      <details style={logDetailsStyle}>
        <summary style={logSummaryStyle}>Actividad de forja ({craftingLog.length})</summary>
        <div style={{ display: "grid", gap: "6px", maxHeight: isMobile ? "180px" : "220px", overflowY: "auto", marginTop: "8px" }}>
          {craftingLog.length > 0 ? craftingLog.slice(-20).reverse().map((entry, index) => (
            <div key={`${entry}-${index}`} style={logRowStyle}>{entry}</div>
          )) : (
            <div style={subtleTextStyle}>Todavia no hay acciones registradas.</div>
          )}
        </div>
      </details>

      {isMobile && (
        <div style={mobileForgeDockStyle}>
          <div style={mobileForgeRowStyle}>
            {FORGE_MODE_ORDER.map(modeId => {
              const active = modeId === mode;
              const disabled = !canSwitchMode(modeId);
              return (
                <button
                  key={modeId}
                  onClick={() => {
                    if (disabled) return;
                    setMode(modeId);
                    setSelectedReforgeOption(null);
                  }}
                  disabled={disabled}
                  style={{
                    ...modeButtonStyle({
                      active,
                      disabled,
                      tone: FORGE_MODE_META[modeId]?.color,
                      isMobile: true,
                    }),
                    minWidth: "84px",
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {FORGE_MODE_META[modeId]?.label || modeId}
                </button>
              );
            })}
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
  background: "var(--color-background-primary, #f8fafc)",
  color: "var(--color-text-primary, #1e293b)",
});

const topToolbarStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "10px",
  background: "var(--color-background-secondary, #ffffff)",
  padding: "8px",
  display: "grid",
  gap: "7px",
};

const resourceStripStyle = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const toolStripStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "5px",
};

const mobileForgeDockStyle = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: "calc(var(--app-bottom-nav-offset, 72px) + env(safe-area-inset-bottom))",
  zIndex: 4900,
  background: "var(--color-background-secondary, #ffffff)",
  borderTop: "1px solid var(--color-border-secondary, #e2e8f0)",
  boxShadow: "0 -10px 24px rgba(15,23,42,0.08)",
  padding: "8px",
};

const mobileForgeRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "nowrap",
  width: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  scrollbarWidth: "none",
  WebkitOverflowScrolling: "touch",
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
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "10px",
  background: "var(--color-background-secondary, #ffffff)",
  padding: "9px",
  display: "grid",
  gap: "8px",
  alignContent: "start",
};

const mainGridStyle = isMobile => ({
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 0.9fr) minmax(380px, 1.15fr)",
  gap: "8px",
  alignItems: "start",
});

const actionPanelStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "10px",
  background: "var(--color-background-tertiary, #f8fafc)",
  padding: "10px",
  display: "grid",
  gap: "8px",
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
  border: `1px solid ${selected ? "var(--tone-accent, #6366f1)" : "var(--color-border-primary, #e2e8f0)"}`,
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

const itemListStyle = isMobile => ({
  display: "grid",
  gap: "6px",
  maxHeight: isMobile ? "none" : "62vh",
  overflowY: isMobile ? "visible" : "auto",
  paddingRight: isMobile ? 0 : "2px",
});

const workbenchHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  alignItems: "center",
  flexWrap: "wrap",
  borderBottom: "1px solid var(--color-border-primary, #e2e8f0)",
  paddingBottom: "8px",
};

const selectedMetaRowStyle = {
  marginTop: "6px",
  display: "flex",
  gap: "5px",
  flexWrap: "wrap",
  alignItems: "center",
};

const modeButtonStyle = ({ active, disabled, tone, isMobile }) => ({
  border: `1px solid ${active ? tone : "var(--color-border-primary, #e2e8f0)"}`,
  background: disabled
    ? "var(--color-background-tertiary, #f8fafc)"
    : active
      ? "var(--tone-accent-soft, #eef2ff)"
      : "var(--color-background-secondary, #ffffff)",
  color: disabled
    ? "var(--color-text-tertiary, #94a3b8)"
    : active
      ? (tone || "var(--tone-accent, #4338ca)")
      : "var(--color-text-primary, #1e293b)",
  borderRadius: "7px",
  padding: isMobile ? "7px 4px" : "7px 8px",
  fontSize: isMobile ? "0.6rem" : "0.66rem",
  fontWeight: "900",
  cursor: disabled ? "not-allowed" : "pointer",
  lineHeight: 1.1,
});

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

const resourceChipStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-tertiary, #f8fafc)",
  color: "var(--color-text-secondary, #475569)",
  borderRadius: "999px",
  padding: "4px 8px",
  fontSize: "0.58rem",
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

const mainActionButtonStyle = ({ disabled = false, danger = false, warning = false } = {}) => ({
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
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "0.68rem",
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

const powerOptionStyle = ({ selected }) => ({
  border: `1px solid ${selected ? "var(--tone-warning, #fb923c)" : "var(--color-border-primary, #e2e8f0)"}`,
  background: selected ? "var(--tone-warning-soft, #fff7ed)" : "var(--color-background-secondary, #fff)",
  color: "var(--color-text-primary, #1e293b)",
  borderRadius: "9px",
  padding: "8px 9px",
  cursor: "pointer",
  textAlign: "left",
});

const advancedRowStyle = {
  fontSize: "0.64rem",
  color: "var(--color-text-secondary, #475569)",
  lineHeight: 1.35,
};

const deltaRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  alignItems: "center",
  fontSize: "0.64rem",
  color: "var(--color-text-secondary, #475569)",
  fontWeight: "800",
};

const diffBadgeStyle = diff => ({
  fontSize: "0.58rem",
  color: diff > 0 ? "var(--tone-success-strong, #166534)" : diff < 0 ? "var(--tone-danger, #D85A30)" : "var(--color-text-tertiary, #94a3b8)",
  background: diff > 0 ? "var(--tone-success-soft, #ecfdf5)" : diff < 0 ? "var(--tone-danger-soft, #fff1f2)" : "var(--color-background-tertiary, #f1f5f9)",
  padding: "2px 5px",
  borderRadius: "6px",
  fontWeight: "900",
  lineHeight: 1.1,
});

const compareListStyle = {
  marginTop: "5px",
  display: "grid",
  gap: "3px",
  maxWidth: "320px",
};

const compareRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  alignItems: "center",
  fontSize: "0.6rem",
  color: "var(--color-text-secondary, #475569)",
  fontWeight: "800",
};

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
