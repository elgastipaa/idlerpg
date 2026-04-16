import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ABYSS_PREFIXES, ABYSS_SUFFIXES, PREFIXES, SUFFIXES } from "../data/affixes";
import { getPlayerBuildTag } from "../utils/buildIdentity";
import { getAffixTierGlyph, getRarityColor } from "../constants/rarity";
import { ASCEND_COSTS } from "../constants/craftingCosts";
import {
  buildCraftedItemPreview,
  getCraftActionState,
  getCraftUsageSummary,
  getUpgradeCap,
} from "../engine/crafting/craftingEngine";
import { getUnlockedLegendaryPowers } from "../engine/progression/codexEngine";
import { hasAbyssUnlock } from "../engine/progression/abyssProgression";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
  formatItemNumber as formatValue,
  formatItemStatValue as formatStatValue,
  formatItemDiffValue as formatDiffValue,
  getItemLocation,
  getImplicitEntries,
  formatImplicitSummary,
  getPrioritizedStatEntries,
  formatEconomySummary,
  getTopCompareEntries,
} from "../utils/itemPresentation";
import { getCompactRarityLabel, getItemGlyph, getUpgradeBadgeTone, ITEM_SLOT_GLYPHS } from "../utils/itemVisuals";
import {
  FORGE_MODE_META,
  FORGE_MODE_ORDER,
  FORGE_MODE_TOOLTIPS,
  formatCraftCostLabel,
  getCraftActionBadge,
  getCraftActionHint,
} from "./crafting/craftingUi";

const RARITY_WEIGHT = { common: 0, magic: 1, rare: 2, epic: 3, legendary: 4 };
const ASCEND_RULES = ASCEND_COSTS;

function getModeTooltipStyle(tone) {
  const palette = {
    upgrade: { bg: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-danger, #9a3412)", border: "var(--tone-warning, #fdba74)" },
    reroll: { bg: "var(--tone-info-soft, #eff6ff)", color: "var(--tone-info, #1d4ed8)", border: "var(--tone-info, #bfdbfe)" },
    polish: { bg: "var(--tone-info-soft, #ecfeff)", color: "var(--tone-info, #0c4a6e)", border: "var(--tone-info, #a5f3fc)" },
    reforge: { bg: "var(--tone-violet-soft, #f3e8ff)", color: "var(--tone-violet, #6d28d9)", border: "var(--tone-violet, #ddd6fe)" },
    ascend: { bg: "var(--tone-accent-soft, #eff6ff)", color: "var(--tone-accent, #1e40af)", border: "var(--tone-accent, #93c5fd)" },
    extract: { bg: "var(--tone-danger-soft, #fef2f2)", color: "var(--tone-danger-strong, #b91c1c)", border: "var(--tone-danger, #fecaca)" },
  };
  const chosen = palette[tone] || { bg: "var(--tone-neutral-soft, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "var(--color-border-tertiary, #cbd5e1)" };
  return {
    color: chosen.color,
    fontSize: "0.65rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "2px",
    background: chosen.bg,
    border: `1px solid ${chosen.border}`,
    borderRadius: "10px",
    padding: "7px 10px",
  };
}

export default function Crafting({ state, dispatch }) {
  const { player } = state;
  const inventory = Array.isArray(player.inventory) ? player.inventory : [];
  const equipment = player.equipment || {};
  const activeBuildTag = useMemo(() => {
    try {
      return getPlayerBuildTag(player);
    } catch (error) {
      console.error("Crafting build tag fallback", error);
      return null;
    }
  }, [player]);
  const unlockedLegendaryPowers = useMemo(() => {
    try {
      return getUnlockedLegendaryPowers(state?.codex || {}, { specialization: player?.specialization, className: player?.class, abyss: state?.abyss || {} });
    } catch (error) {
      console.error("Crafting legendary powers fallback", error);
      return [];
    }
  }, [state?.codex, state?.abyss, player?.specialization, player?.class]);
  const unlockedLegendaryPowerMap = useMemo(
    () => Object.fromEntries(unlockedLegendaryPowers.map(power => [power.id, power])),
    [unlockedLegendaryPowers]
  );
  const reforgeSession = state?.combat?.reforgeSession || null;
  const isReforgeLocked = !!reforgeSession;

  const [mode, setMode] = useState("upgrade");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedAffixIndex, setSelectedAffixIndex] = useState(null);
  const [selectedReforgeOption, setSelectedReforgeOption] = useState(null);
  const [selectedAscendPowerId, setSelectedAscendPowerId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [lastActionId, setLastActionId] = useState(null);
  const [pendingCraftFeedback, setPendingCraftFeedback] = useState(null);
  const [selectedActionFeedback, setSelectedActionFeedback] = useState(null);
  const [upgradeTrackFeedback, setUpgradeTrackFeedback] = useState(null);
  const [showSelectedDetails, setShowSelectedDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [canScrollAffixesLeft, setCanScrollAffixesLeft] = useState(false);
  const [canScrollAffixesRight, setCanScrollAffixesRight] = useState(false);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(252);
  const [selectionScrollNonce, setSelectionScrollNonce] = useState(0);
  const stickyHeaderRef = useRef(null);
  const selectionPanelRef = useRef(null);
  const selectedAffixCardRefs = useRef({});
  const affixCarouselRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const node = stickyHeaderRef.current;
    if (!node) return;

    const updateHeight = () => {
      const rect = node.getBoundingClientRect();
      const nextHeight = Math.ceil(rect.bottom || rect.height || 0) + (isMobile ? 16 : 18);
      setStickyHeaderHeight(nextHeight);
    };

    updateHeight();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateHeight());
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isMobile, mode, selectedItemId, selectedAffixIndex, isReforgeLocked]);

  const allCraftItems = useMemo(
    () =>
      [...inventory, ...(equipment.weapon ? [equipment.weapon] : []), ...(equipment.armor ? [equipment.armor] : [])]
        .filter(item => item && typeof item === "object" && item.id != null),
    [inventory, equipment]
  );
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return allCraftItems.find(item => item.id === selectedItemId) || null;
  }, [selectedItemId, allCraftItems]);

  const sortedInventory = useMemo(() => {
    return [...allCraftItems].sort((a, b) => {
      const aLocation = getItemLocation(a, equipment);
      const bLocation = getItemLocation(b, equipment);

      if (aLocation && !bLocation) return -1;
      if (!aLocation && bLocation) return 1;
      if (aLocation && bLocation && aLocation !== bLocation) return aLocation === "weapon" ? -1 : 1;

      const rarityDiff = (RARITY_WEIGHT[b.rarity] || 0) - (RARITY_WEIGHT[a.rarity] || 0);
      if (rarityDiff !== 0) return rarityDiff;
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.level || 0) - (a.level || 0);
    });
  }, [allCraftItems, equipment]);

  useEffect(() => {
    const node = affixCarouselRef.current;
    if (!node || !selectedItem || !["polish", "reforge"].includes(mode)) {
      setCanScrollAffixesLeft(false);
      setCanScrollAffixesRight(false);
      return;
    }

    const syncAffixScrollState = () => {
      const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      setCanScrollAffixesLeft(node.scrollLeft > 6);
      setCanScrollAffixesRight(node.scrollLeft < maxScrollLeft - 6);
    };

    syncAffixScrollState();
    node.addEventListener("scroll", syncAffixScrollState, { passive: true });
    window.addEventListener("resize", syncAffixScrollState);
    return () => {
      node.removeEventListener("scroll", syncAffixScrollState);
      window.removeEventListener("resize", syncAffixScrollState);
    };
  }, [isMobile, mode, selectedItem]);

  const affixTemplatesByStat = useMemo(() => Object.fromEntries([...PREFIXES, ...SUFFIXES, ...ABYSS_PREFIXES, ...ABYSS_SUFFIXES].map(entry => [entry.stat, entry])), []);
  const hasAbyssCraftingAffixes = hasAbyssUnlock(state?.abyss || {}, "craftingAffixes");
  const canUseAbyssCraftingOnSelection = hasAbyssCraftingAffixes && ["epic", "legendary"].includes(selectedItem?.rarity);

  const selectedItemReforgeOptions = useMemo(() => {
    if (!selectedItem || mode !== "reforge" || selectedAffixIndex == null) return [];
    if (
      reforgeSession &&
      reforgeSession.itemId === selectedItem.id &&
      reforgeSession.affixIndex === selectedAffixIndex
    ) {
      return reforgeSession.options || [];
    }
    return [];
  }, [selectedItem, mode, selectedAffixIndex, reforgeSession]);

  useEffect(() => {
    setSelectedReforgeOption(null);
  }, [selectedItemId, selectedAffixIndex, mode]);

  useEffect(() => {
    setSelectedAscendPowerId(null);
  }, [selectedItemId, mode]);

  useEffect(() => {
    if (!upgradeTrackFeedback) return undefined;
    const timeout = window.setTimeout(() => setUpgradeTrackFeedback(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [upgradeTrackFeedback]);

  useEffect(() => {
    if (!pendingCraftFeedback || !selectedItem || selectedItem.id !== pendingCraftFeedback.itemId) return;

    const currentLevel = selectedItem.level ?? 0;
    if (currentLevel === pendingCraftFeedback.previousLevel) return;
    const delta = currentLevel - pendingCraftFeedback.previousLevel;
    pulseSelectedAction(delta > 0 ? "success" : "danger", delta > 0 ? "Upgrade aplicado" : "Upgrade fallo");
    setUpgradeTrackFeedback({
      itemId: selectedItem.id,
      resultLevel: currentLevel,
      tone: delta > 0 ? "success" : "danger",
    });
    setPendingCraftFeedback(null);
  }, [pendingCraftFeedback, selectedItem]);

  useEffect(() => {
    if (!reforgeSession) return;
    setMode("reforge");
    setSelectedItemId(reforgeSession.itemId);
    setSelectedAffixIndex(reforgeSession.affixIndex);
  }, [reforgeSession]);

  useEffect(() => {
    if (!selectedItem || !["polish", "reforge"].includes(mode)) return;
    if (selectedAffixIndex != null && selectedItem.affixes?.[selectedAffixIndex]) return;

    const focusedIndex =
      mode === "reforge" && Number.isInteger(selectedItem?.crafting?.focusedAffixIndex)
        ? Number(selectedItem.crafting.focusedAffixIndex)
        : null;
    if (focusedIndex != null && selectedItem.affixes?.[focusedIndex]) {
      setSelectedAffixIndex(focusedIndex);
      return;
    }
    if ((selectedItem.affixes || []).length > 0) {
      setSelectedAffixIndex(0);
    }
  }, [selectedItem, mode, selectedAffixIndex]);

  useEffect(() => {
    setShowSelectedDetails(false);
  }, [selectedItemId, mode]);

  useEffect(() => {
    if (!selectedItem || !["polish", "reforge"].includes(mode) || selectedAffixIndex == null) return;
    const targetCard = selectedAffixCardRefs.current?.[selectedAffixIndex];
    if (!targetCard) return;
    const frame = window.requestAnimationFrame(() => {
      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedAffixIndex, selectedItem, mode]);

  const getReqs = useCallback((item) => {
    if (!item) return {};
    return {
      upgrade: getCraftActionState({ item, player, mode: "upgrade", affixIndex: selectedAffixIndex }),
      reroll: getCraftActionState({ item, player, mode: "reroll", affixIndex: selectedAffixIndex }),
      polish: getCraftActionState({ item, player, mode: "polish", affixIndex: selectedAffixIndex }),
      reforge: getCraftActionState({ item, player, mode: "reforge", affixIndex: selectedAffixIndex }),
      ascend: getCraftActionState({
        item,
        player,
        mode: "ascend",
        affixIndex: selectedAffixIndex,
        legendaryPowerId: selectedAscendPowerId,
        legendaryPowerImprintReduction: unlockedLegendaryPowerMap?.[selectedAscendPowerId]?.mastery?.imprintCostReduction || 0,
      }),
    };
  }, [player, selectedAffixIndex, selectedAscendPowerId, unlockedLegendaryPowerMap]);

  const totalEssenceGain = useMemo(() => {
    return inventory.filter(item => selectedIds.includes(item.id)).reduce((acc, item) => {
      const rarityTier = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 }[item.rarity] || 1;
      const extractMult = { common: 1, magic: 1.4, rare: 2, epic: 3, legendary: 5 }[item.rarity] || 1;
      const gain = Math.max(1, Math.floor((rarityTier + Math.floor((item.level ?? 0) / 2)) * extractMult));
      return acc + gain;
    }, 0);
  }, [selectedIds, inventory]);
  const modeTooltip = FORGE_MODE_TOOLTIPS[mode] || null;
  const modeMeta = FORGE_MODE_META[mode] || FORGE_MODE_META.upgrade;
  const isSingleItemMode = mode === "upgrade" || mode === "reroll" || mode === "polish" || mode === "reforge" || mode === "ascend";
  const selectedCompareItem = selectedItem ? (selectedItem.type === "weapon" ? equipment.weapon : equipment.armor) : null;
  const selectedRelevantStats = selectedItem ? getPrioritizedStatEntries(selectedItem.bonus || {}, Number.MAX_SAFE_INTEGER) : [];
  const selectedImplicitSummary = selectedItem ? formatImplicitSummary(selectedItem) : "";
  const selectedEconomySummary = selectedItem ? formatEconomySummary(selectedItem.bonus || {}) : "";
  const selectedCraftUsage = selectedItem ? getCraftUsageSummary(selectedItem, selectedAffixIndex) : null;
  const selectedActionReq = selectedItem ? (getReqs(selectedItem)[mode] || { costs: {}, can: true, reason: "ok" }) : { costs: {}, can: true, reason: "ok" };
  const selectedActionCostLabel = formatCraftCostLabel(selectedActionReq.costs);
  const selectedActionHint = getCraftActionHint(selectedActionReq, mode);
  const selectedRerollAffixSummary = useMemo(
    () =>
      mode === "reroll" && selectedItem
        ? (selectedItem.affixes || []).map((affix, index) => ({
            id: `${affix.id || affix.stat}-${index}`,
            stat: affix.stat,
            tier: affix.tier || 0,
            perfectRoll: !!affix.perfectRoll,
          }))
        : [],
    [mode, selectedItem]
  );
  const selectedAscendPowers = useMemo(() => {
    if (!selectedItem || mode !== "ascend" || selectedActionReq?.nextRarity !== "legendary") return [];
    return unlockedLegendaryPowers;
  }, [selectedItem, mode, selectedActionReq?.nextRarity, unlockedLegendaryPowers]);
  const selectedAscendPower = unlockedLegendaryPowerMap?.[selectedAscendPowerId] || null;
  const focusedAffixIndex = selectedItem?.crafting?.focusedAffixIndex;
  const focusedAffix = selectedItem && Number.isInteger(focusedAffixIndex) ? selectedItem.affixes?.[focusedAffixIndex] : null;
  const focusedAffixLabel = focusedAffix ? (STAT_LABELS[focusedAffix.stat] || focusedAffix.stat) : null;
  const selectedCurrentAffix = selectedItem && selectedAffixIndex != null ? selectedItem.affixes?.[selectedAffixIndex] : null;
  const selectedUpgradeTrackFeedback = selectedItem && upgradeTrackFeedback?.itemId === selectedItem.id ? upgradeTrackFeedback : null;
  const selectedUpgradePreview = useMemo(() => {
    if (!selectedItem || mode !== "upgrade") return null;
    const currentLevel = Math.max(0, Number(selectedItem.level || 0));
    const maxLevel = getUpgradeCap(selectedItem);
    if (currentLevel >= maxLevel) return null;

    return buildCraftedItemPreview(selectedItem, { level: currentLevel + 1 });
  }, [mode, selectedItem]);
  const selectedUpgradeAffectedStats = useMemo(() => {
    if (!selectedItem || !selectedUpgradePreview) return [];
    const changedKeys = Array.from(
      new Set([
        ...Object.keys(selectedItem.bonus || {}),
        ...Object.keys(selectedUpgradePreview.bonus || {}),
      ])
    );
    return changedKeys
      .map(key => {
        const currentVal = selectedItem?.bonus?.[key] || 0;
        const nextVal = selectedUpgradePreview?.bonus?.[key] || 0;
        const delta = nextVal - currentVal;
        const equippedVal = selectedCompareItem?.bonus?.[key] || 0;
        return { key, currentVal, nextVal, delta, equippedVal, diffVsEquipped: nextVal - equippedVal };
      })
      .filter(entry => Math.abs(entry.delta) > 0.0001)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 6);
  }, [selectedCompareItem, selectedItem, selectedUpgradePreview]);
  const selectedCurrentOptionIsKeep =
    mode === "reforge" &&
    !!selectedReforgeOption &&
    !!selectedCurrentAffix &&
    selectedReforgeOption.id === selectedCurrentAffix.id &&
    selectedReforgeOption.stat === selectedCurrentAffix.stat &&
    selectedReforgeOption.tier === selectedCurrentAffix.tier &&
    (selectedReforgeOption.rolledValue ?? selectedReforgeOption.value ?? null) === (selectedCurrentAffix.rolledValue ?? selectedCurrentAffix.value ?? null);
  const selectedActionDisabled =
    !selectedItem ||
    (((mode !== "reforge" || selectedItemReforgeOptions.length === 0) && !selectedActionReq.can)) ||
    (mode === "polish" && selectedAffixIndex == null) ||
    (mode === "reforge" && selectedAffixIndex == null) ||
    (mode === "reforge" && selectedItemReforgeOptions.length > 0 && !selectedReforgeOption);
  const selectedActionBlockedReason =
    !selectedItem
      ? "Selecciona un item"
      : mode === "polish" && selectedAffixIndex == null
        ? "Elegi una linea"
        : mode === "reforge" && selectedAffixIndex == null
          ? "Elegi una linea"
          : mode === "reforge" && selectedItemReforgeOptions.length > 0 && !selectedReforgeOption
            ? "Elegi una opcion"
            : (selectedActionHint || "No disponible");
  const selectedActionLabel =
    mode === "reforge"
      ? (selectedItemReforgeOptions.length > 0
          ? (selectedCurrentOptionIsKeep ? "MANTENER LINEA ACTUAL" : "CONFIRMAR REFORJA")
          : "PAGAR REFORJA")
      : modeMeta.cta;
  const selectedActionMetaLabel =
    mode === "reforge" && selectedItemReforgeOptions.length > 0
      ? "Costo ya pagado"
      : selectedActionCostLabel;
  const showSelectedActionButtonCost = !!selectedActionMetaLabel && selectedActionMetaLabel !== "Costo ya pagado";
  const selectedActionStickySummary = useMemo(() => {
    if (!selectedItem || !isSingleItemMode) return "";
    if (mode === "upgrade") {
      return `Riesgo de fallo: ${formatValue((selectedActionReq.failChance || 0) * 100)}% · si falla baja un nivel.`;
    }
    if (mode === "reroll") {
      return "Reroll rehace todos los afijos del item.";
    }
    if (mode === "polish") {
      return selectedCurrentAffix
        ? `Pulir trabaja ${STAT_LABELS[selectedCurrentAffix.stat] || selectedCurrentAffix.stat}. Solo cambia el valor, no el atributo ni el tier.`
        : "Elegi una linea para pulir.";
    }
    if (mode === "reforge") {
      if (selectedItemReforgeOptions.length > 0) {
        return selectedCurrentOptionIsKeep
          ? "Mantener actual cierra la reforja sin fijar la pieza."
          : "Elegi una opcion para cerrar la reforja.";
      }
      return focusedAffix
        ? `La pieza ya quedo fijada a ${focusedAffixLabel}.`
        : canUseAbyssCraftingOnSelection
          ? "Pagas la reforja, ves opciones y despues decidis si cambias. Esta pieza puede abrir affixes de Abismo."
          : "Pagas la reforja, ves opciones y despues decidis si cambias.";
    }
    if (mode === "ascend") {
      if (selectedActionReq?.nextRarity === "legendary") {
        return selectedAscendPower
          ? `Ascend va a injertar ${selectedAscendPower.name}.`
          : "Ascend puede injertar un poder legendario ya descubierto.";
      }
      return `Ascenso: ${selectedActionCostLabel} · requiere +${selectedActionReq.minLevel || ASCEND_RULES[selectedItem.rarity]?.minLevel || 0}.`;
    }
    return selectedActionHint || "";
  }, [
    focusedAffix,
    focusedAffixLabel,
    isSingleItemMode,
    mode,
    selectedActionCostLabel,
    selectedActionHint,
    selectedActionReq,
    selectedAscendPower,
    selectedCurrentAffix,
    selectedCurrentOptionIsKeep,
    selectedItem,
    selectedItemReforgeOptions.length,
  ]);
  useEffect(() => {
    if (!selectedItemId || !isSingleItemMode || !selectionPanelRef.current) return;
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const scrollSelectionIntoView = () => {
      if (cancelled || !selectionPanelRef.current) return;
      selectionPanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    firstFrame = window.requestAnimationFrame(() => {
      scrollSelectionIntoView();
      secondFrame = window.requestAnimationFrame(scrollSelectionIntoView);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [selectedItemId, mode, isSingleItemMode, stickyHeaderHeight, selectionScrollNonce]);

  useEffect(() => {
    if (!selectedActionFeedback) return undefined;
    const timeout = window.setTimeout(() => setSelectedActionFeedback(null), 720);
    return () => window.clearTimeout(timeout);
  }, [selectedActionFeedback]);

  const triggerSuccess = (id) => {
    setLastActionId(id);
    setTimeout(() => setLastActionId(null), 300);
  };

  const pulseSelectedAction = (tone, message) => {
    setSelectedActionFeedback({ tone, message, nonce: Date.now() });
  };

  const handleAction = (item) => {
    if (isReforgeLocked && reforgeSession?.itemId !== item.id) return;
    const equippedSlot = getItemLocation(item, equipment);
    if (mode === "extract") {
      if (equippedSlot) return;
      setIsConfirming(false);
      setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]);
      return;
    }

    setSelectedItemId(item.id);
    setSelectionScrollNonce(current => current + 1);
    setSelectedAffixIndex(
      mode === "reforge" && Number.isInteger(item?.crafting?.focusedAffixIndex)
        ? Number(item.crafting.focusedAffixIndex)
        : null
    );
    setSelectedReforgeOption(null);
  };

  const executeCraft = () => {
    if (!selectedItem) return;
    const req = getReqs(selectedItem)[mode];

    if (mode === "reforge") {
      if (selectedAffixIndex == null) return;
      const hasPreparedOptions = selectedItemReforgeOptions.length > 0;

      if (!hasPreparedOptions) {
        if (!req?.can) return false;
        dispatch({
          type: "CRAFT_REFORGE_PREVIEW",
          payload: {
            itemId: selectedItem.id,
            affixIndex: selectedAffixIndex,
            favoredStats: activeBuildTag?.conditions?.prefersStats || [],
            allowAbyssAffixes: hasAbyssCraftingAffixes && ["epic", "legendary"].includes(selectedItem?.rarity),
          },
        });
        setSelectedReforgeOption(null);
        pulseSelectedAction("success", "Reforja preparada");
        return true;
      }

      if (!selectedReforgeOption) return false;
      dispatch({
        type: "CRAFT_REFORGE_ITEM",
        payload: {
          itemId: selectedItem.id,
          affixIndex: selectedAffixIndex,
          replacementAffix: selectedReforgeOption,
        },
      });
      triggerSuccess(selectedItem.id);
      setSelectedReforgeOption(null);
      pulseSelectedAction("success", "Reforja aplicada");
      return true;
    }

    if (!req?.can) return false;

    if (mode === "upgrade") {
      setPendingCraftFeedback({ type: "upgrade", itemId: selectedItem.id, previousLevel: selectedItem.level ?? 0 });
    }

    const actionType = {
      upgrade: "CRAFT_UPGRADE_ITEM",
      reroll: "CRAFT_REROLL_ITEM",
      polish: "CRAFT_POLISH_ITEM",
      ascend: "CRAFT_ASCEND_ITEM",
    }[mode];

    if (mode === "polish" && selectedAffixIndex == null) return false;

    dispatch({
      type: actionType,
      payload: {
        itemId: selectedItem.id,
        affixIndex: selectedAffixIndex,
        replacementAffix: selectedReforgeOption,
        legendaryPowerId: mode === "ascend" ? (selectedAscendPower?.id || null) : null,
      },
    });
    triggerSuccess(selectedItem.id);
    if (mode !== "upgrade") {
      pulseSelectedAction("success", "Accion aplicada");
    }
    return true;
  };

  const handleSelectedActionClick = () => {
    if (selectedActionDisabled) return;
    executeCraft();
  };

  const massExtract = (rarityLimit = null) => {
    const inventoryIds = new Set((inventory || []).map(item => item.id));
    let idsToExtract = selectedIds.length > 0 ? [...selectedIds] : [];
    if (selectedIds.length === 0 && rarityLimit) {
      const limits = ["common", "magic", "rare", "epic", "legendary"];
      const limitIndex = limits.indexOf(rarityLimit);
      idsToExtract = inventory.filter(i => limits.indexOf(i.rarity) <= limitIndex).map(i => i.id);
    }
    idsToExtract = [...new Set(idsToExtract)].filter(id => inventoryIds.has(id));

    if (idsToExtract.length === 0) return;
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    idsToExtract.forEach(id => dispatch({ type: "CRAFT_EXTRACT_ITEM", payload: { itemId: id } }));
    setSelectedIds([]);
    setIsConfirming(false);
  };
  return (
    <div style={{ padding: isMobile ? "0 10px 10px" : "0 14px 14px", display: "flex", flexDirection: "column", gap: "12px", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", minHeight: "100%" }}>
      <div ref={stickyHeaderRef} style={{ position: "sticky", top: "var(--app-header-offset, 96px)", zIndex: 80, display: "flex", flexDirection: "column", gap: "8px", paddingTop: "8px", paddingBottom: "6px", background: "var(--color-background-primary, #f8fafc)", boxShadow: "0 10px 18px -16px rgba(15,23,42,0.45)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "6px", width: "100%", minWidth: 0 }}>
          {FORGE_MODE_ORDER.map((m) => (
            <ToolBtn
              key={m}
              active={mode === m}
              label={FORGE_MODE_META[m].label}
              isMobile={isMobile}
              disabled={isReforgeLocked && m !== "reforge"}
              onClick={() => {
                if (isReforgeLocked && m !== "reforge") return;
                setMode(m);
                setSelectedIds([]);
                setIsConfirming(false);
                setSelectedItemId(null);
                setSelectedAffixIndex(null);
                setSelectedReforgeOption(null);
              }}
              color={FORGE_MODE_META[m].color}
            />
          ))}
        </div>
        {modeTooltip && (
          <div style={getModeTooltipStyle(modeTooltip.tone)}>
            {modeTooltip.text}
          </div>
        )}
        {isReforgeLocked && (
          <div style={{ ...stickyInfoBarStyle, background: "var(--tone-violet-soft, #f3e8ff)", border: "1px solid var(--tone-violet, #c4b5fd)", color: "var(--tone-violet, #6d28d9)" }}>
            Reforja en curso: el costo ya fue pagado. No podes cambiar de tab ni de herramienta hasta elegir una opcion o mantener la linea actual.
          </div>
        )}
        {selectedItem && isSingleItemMode && (
          <section style={stickyActionShellStyle(isMobile)}>
            <div style={{ minWidth: 0, display: "grid", gap: "4px" }}>
              {selectedActionStickySummary && (
                <div style={{ fontSize: "0.62rem", color: selectedActionFeedback?.tone === "danger" ? "var(--tone-danger, #D85A30)" : selectedActionFeedback?.tone === "success" ? "var(--tone-success-strong, #166534)" : selectedActionDisabled ? "var(--tone-danger, #D85A30)" : "var(--color-text-secondary, #64748b)", fontWeight: "800", lineHeight: 1.35 }}>
                  {selectedActionFeedback?.message || selectedActionStickySummary}
                </div>
              )}
            </div>
            <button
              disabled={selectedActionDisabled}
              onClick={handleSelectedActionClick}
              style={mainActionBtnStyle(false, {
                compact: true,
                disabled: selectedActionDisabled,
                fullWidth: isMobile,
                tone: selectedActionDisabled ? "disabled" : (selectedActionFeedback?.tone || "ready"),
              })}
            >
              <span style={{ display: "grid", gap: "2px", justifyItems: "center", lineHeight: 1.1 }}>
                <span>{selectedActionLabel}</span>
                {showSelectedActionButtonCost && (
                  <span style={{ fontSize: "0.56rem", fontWeight: "800", opacity: 0.9 }}>
                    {selectedActionDisabled ? selectedActionBlockedReason : selectedActionMetaLabel}
                  </span>
                )}
              </span>
            </button>
          </section>
        )}
      </div>

      {selectedItem && isSingleItemMode && (
        <section ref={selectionPanelRef} style={selectionPanelStyle(isMobile, stickyHeaderHeight)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={sectionEyebrowStyle}>Item Seleccionado</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", minWidth: 0, flexWrap: "wrap" }}>
                <span style={rarityBadgeStyle(selectedItem.rarity)}>{getCompactRarityLabel(selectedItem.rarity)}</span>
                <h4 style={{ margin: 0, fontSize: isMobile ? "0.82rem" : "0.92rem", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.15 }}>{selectedItem.name}</h4>
                {(selectedItem.level || 0) > 0 && <span style={upgradeBadgeStyle(selectedItem.level)}>{`+${selectedItem.level}`}</span>}
              </div>
              {focusedAffix && (
                <div style={{ fontSize: "0.6rem", color: "var(--tone-violet, #6d28d9)", fontWeight: "900", marginTop: "4px" }}>
                  Linea trabajada: {focusedAffixLabel} · slot {focusedAffixIndex + 1}
                </div>
              )}
            </div>
            <button onClick={() => !isReforgeLocked && setSelectedItemId(null)} disabled={isReforgeLocked} style={secondaryActionBtnStyle}>
              Atras
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setShowSelectedDetails(current => !current)} style={secondaryActionBtnStyle}>
              {showSelectedDetails ? "Ocultar detalle" : "Ver detalle"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {selectedActionReq.maxUses != null && (
              <span style={{ ...miniStatPillStyle, fontWeight: "900", color: selectedActionReq.can ? "var(--tone-success-strong, #166534)" : "var(--tone-danger, #D85A30)" }}>
                Limite <strong>{selectedActionReq.usedUses || 0}/{selectedActionReq.maxUses}</strong>
              </span>
            )}
          </div>

          {(showSelectedDetails || mode === "polish" || mode === "reforge") && (
            <div
              style={{
                display: "grid",
                gap: "10px",
                minWidth: 0,
                maxWidth: "100%",
                alignItems: "start",
                gridTemplateColumns: isMobile ? "1fr" : (showSelectedDetails && (mode === "polish" || mode === "reforge")) ? "minmax(0, 0.95fr) minmax(0, 1.05fr)" : "1fr",
              }}
            >
            {showSelectedDetails && <div style={selectionSubpanelStyle}>
              {selectedCraftUsage && (
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ ...detailTitle, marginBottom: "3px" }}>Limites de forja</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span style={miniStatPillStyle}>Reroll <strong>{selectedCraftUsage.reroll.used}/{selectedCraftUsage.reroll.max}</strong></span>
                    <span style={miniStatPillStyle}>Reforge <strong>{selectedCraftUsage.reforge.used}/{selectedCraftUsage.reforge.max}</strong></span>
                    {selectedAffixIndex != null && (
                      <span style={miniStatPillStyle}>Pulido linea <strong>{selectedCraftUsage.polish.used}/{selectedCraftUsage.polish.max}</strong></span>
                    )}
                  </div>
                </div>
              )}

              {selectedImplicitSummary && (
                <div style={{ ...detailMutedLineStyle, color: "var(--color-text-info, #4338ca)", fontWeight: "800", marginBottom: "6px" }}>
                  Implicito: {selectedImplicitSummary}
                </div>
              )}

              {selectedEconomySummary && (
                <div style={{ ...detailMutedLineStyle, color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginBottom: "6px" }}>
                  Eco: {selectedEconomySummary}
                </div>
              )}

              {selectedRelevantStats.length > 0 && (
                <div style={{ display: "grid", gap: "5px" }}>
                  {selectedRelevantStats.map(([key, value]) => {
                    const compareValue = selectedCompareItem?.bonus?.[key] || 0;
                    const diff = value - compareValue;
                    return (
                    <div key={`selected-stat-${key}`} style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "0.64rem", color: "var(--color-text-secondary, #475569)", fontWeight: "800" }}>
                      <span>{STAT_LABELS[key] || key}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <span style={{ color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>+{formatStatValue(key, value)}</span>
                        <span style={diffBadgeStyle(diff)}>{diff !== 0 ? formatDiffValue(key, diff) : "0"}</span>
                      </span>
                    </div>
                  );
                  })}
                </div>
              )}

            </div>}

            {(mode === "polish" || mode === "reforge") && (
              <div style={selectionSubpanelStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                  <div style={{ ...detailTitle, marginBottom: 0 }}>Lineas del item</div>
                  <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>
                    Desliza horizontalmente
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                <div ref={affixCarouselRef} style={affixCarouselStyle}>
                  {(selectedItem.affixes || []).map((af, idx) => {
                    const isFocusedLine = Number.isInteger(focusedAffixIndex) && focusedAffixIndex === idx;
                    const isLockedByFocus = mode === "reforge" && Number.isInteger(focusedAffixIndex) && focusedAffixIndex !== idx;
                    const isTargetedLine = selectedAffixIndex === idx;

                    return (
                    <div
                      key={idx}
                      ref={node => {
                        if (!node) {
                          delete selectedAffixCardRefs.current[idx];
                          return;
                        }
                        selectedAffixCardRefs.current[idx] = node;
                      }}
                      style={{
                        ...affixCarouselCardStyle(isMobile),
                        border: "1px solid var(--color-border-primary, #e2e8f0)",
                        background: isFocusedLine ? "var(--tone-violet-soft, #f3e8ff)" : af.tier === 1 ? "var(--tone-warning-soft, #fffbeb)" : af.tier === 2 ? "var(--tone-info-soft, #eff6ff)" : "var(--color-background-secondary, #fff)",
                        boxShadow: isFocusedLine ? "0 0 0 1px rgba(124,58,237,0.18)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                        <div style={{ ...detailLine, color: isFocusedLine ? "var(--tone-violet, #6d28d9)" : af.tier === 1 ? "#b45309" : "var(--tone-accent, #534AB7)", fontWeight: "900", marginBottom: "4px", minWidth: 0 }}>
                        +{formatStatValue(af.stat, af.rolledValue ?? af.value ?? 0)} {STAT_LABELS[af.stat] || af.stat} {af.tier ? `(T${af.tier})` : ""}
                        {af.label ? ` · ${af.label}` : ""}
                        {af.perfectRoll ? " PERFECT" : ""}
                        {af.source === "abyss" ? " · ABISMO" : ""}
                        </div>
                        {isFocusedLine && (
                          <span style={{ fontSize: "0.48rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-violet, #7c3aed)", color: "#fff", flexShrink: 0 }}>
                            TRABAJADA
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "var(--color-text-secondary, #64748b)", marginBottom: "4px" }}>
                        Rango actual: {formatStatValue(af.stat, af.range?.min ?? 0)} - {formatStatValue(af.stat, af.range?.max ?? 0)}
                      </div>
                      {affixTemplatesByStat[af.stat] && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {[3, 2, 1].map(tier => {
                            const tierData = affixTemplatesByStat[af.stat]?.tiers?.[tier];
                            if (!tierData) return null;
                            const isCurrentTier = tier === af.tier;
                            return (
                              <span key={tier} style={{ fontSize: "0.58rem", color: isCurrentTier ? "var(--color-text-primary, #0f172a)" : "var(--color-text-tertiary, #94a3b8)", fontWeight: isCurrentTier ? "900" : "700" }}>
                                T{tier}: {formatStatValue(af.stat, tierData.value.min)}-{formatStatValue(af.stat, tierData.value.max)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {(mode === "polish" || mode === "reforge") && (
                        <button
                          disabled={isLockedByFocus}
                          onClick={() => !isLockedByFocus && setSelectedAffixIndex(idx)}
                          style={{
                            marginTop: "8px",
                            width: "100%",
                            border: "1px solid",
                            borderColor: isFocusedLine
                              ? "var(--tone-violet, #7c3aed)"
                              : isTargetedLine
                                ? (mode === "polish" ? "var(--tone-info, #0ea5e9)" : "var(--tone-violet, #7c3aed)")
                                : "var(--color-border-secondary, #cbd5e1)",
                            background: isFocusedLine
                              ? "var(--tone-violet-soft, #f3e8ff)"
                              : isTargetedLine
                                ? (mode === "polish" ? "var(--tone-info-soft, #e0f2fe)" : "var(--tone-violet-soft, #f3e8ff)")
                                : "var(--color-background-secondary, #fff)",
                            color: isFocusedLine
                              ? "var(--tone-violet, #6d28d9)"
                              : isTargetedLine
                                ? (mode === "polish" ? "var(--tone-info, #0369a1)" : "var(--tone-violet, #6d28d9)")
                                : "var(--color-text-secondary, #475569)",
                            borderRadius: "8px",
                            padding: "7px 8px",
                            fontSize: "0.62rem",
                            fontWeight: "900",
                            cursor: isLockedByFocus ? "not-allowed" : "pointer",
                            opacity: isLockedByFocus ? 0.55 : 1,
                          }}
                        >
                          {isFocusedLine
                            ? "LINEA TRABAJADA"
                            : isLockedByFocus
                              ? "LINEA FIJADA"
                              : isTargetedLine
                                ? (mode === "polish" ? "LINEA A PULIR" : "LINEA A REFORJAR")
                                : (mode === "polish" ? "PULIR ESTA LINEA" : "REFORJAR ESTA LINEA")}
                        </button>
                      )}
                    </div>
                  )})}
                </div>
                {canScrollAffixesLeft && <div style={carouselFadeStyle("left")} />}
                {canScrollAffixesRight && <div style={carouselFadeStyle("right")} />}
                {canScrollAffixesLeft && <div style={carouselHintStyle("left")}>←</div>}
                {canScrollAffixesRight && <div style={carouselHintStyle("right")}>→</div>}
                </div>
              </div>
            )}
            </div>
          )}

          {mode === "upgrade" && (
            <div style={selectionSubpanelStyle}>
              <div style={detailTitle}>Ruta de Upgrade</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {Array.from({ length: (selectedActionReq?.maxLevel || 10) + 1 }, (_, level) => {
                  const currentLevel = selectedItem.level ?? 0;
                  const isCurrent = level === currentLevel;
                  const isReached = level < currentLevel;
                  const isNext = level === Math.min(selectedActionReq?.maxLevel || 10, currentLevel + 1);
                  const flashTone = selectedUpgradeTrackFeedback?.resultLevel === level ? selectedUpgradeTrackFeedback.tone : null;
                  return (
                    <span
                      key={`upgrade-step-${level}`}
                      style={upgradeStepStyle({ isCurrent, isReached, isNext, flashTone })}
                    >
                      +{level}
                    </span>
                  );
                })}
              </div>
              {selectedUpgradePreview && (
                <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
                  <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900", textTransform: "uppercase" }}>
                    Impacto del proximo +1
                  </div>
                  <div style={{ display: "grid", gap: "5px" }}>
                    {selectedUpgradeAffectedStats.map(({ key, currentVal, nextVal, delta, diffVsEquipped }) => (
                      <div key={`upgrade-preview-${key}`} style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "0.64rem", color: "var(--color-text-secondary, #475569)", fontWeight: "800" }}>
                        <span>{STAT_LABELS[key] || key}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                          <span style={{ color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>
                            {formatStatValue(key, currentVal)} → {formatStatValue(key, nextVal)}
                          </span>
                          <span style={diffBadgeStyle(delta)}>{formatDiffValue(key, delta)}</span>
                          <span style={diffBadgeStyle(diffVsEquipped)}>
                            {diffVsEquipped !== 0 ? formatDiffValue(key, diffVsEquipped) : "0"} vs eq
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "reroll" && selectedRerollAffixSummary.length > 0 && (
            <div style={selectionSubpanelStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", marginBottom: "5px", flexWrap: "wrap" }}>
                <div style={{ ...detailTitle, marginBottom: 0 }}>
                  Afijos actuales
                </div>
              </div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {selectedRerollAffixSummary.map(affix => (
                  <span
                    key={affix.id}
                    style={{
                      ...miniStatPillStyle,
                      color: affix.tier === 1 ? "var(--tone-warning, #b45309)" : "var(--color-text-secondary, #475569)",
                      background: affix.tier === 1 ? "var(--tone-warning-soft, #fffbeb)" : "var(--color-background-tertiary, #f1f5f9)",
                    }}
                  >
                    {STAT_LABELS[affix.stat] || affix.stat} <strong>T{affix.tier || "?"}</strong>{affix.perfectRoll ? " PERFECT" : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mode === "ascend" && selectedActionReq?.nextRarity === "legendary" && (
            <div style={{ display: "grid", gap: "8px", padding: "10px", borderRadius: "12px", background: "var(--tone-warning-soft, #fff7ed)", border: "1px solid rgba(251,146,60,0.22)" }}>
              <div style={{ fontSize: "0.6rem", color: "var(--tone-danger, #c2410c)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Poder legendario opcional
              </div>
              <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.35 }}>
                Si ya descubriste poderes en Codex, podes injertar uno al ascender esta pieza a legendaria. Si no elegis ninguno, el item asciende sin poder.
              </div>
              <div style={{ display: "grid", gap: "6px" }}>
                <button
                  onClick={() => setSelectedAscendPowerId(null)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "1px solid",
                    borderColor: !selectedAscendPower ? "var(--tone-warning, #fb923c)" : "var(--color-border-primary, #fed7aa)",
                    background: !selectedAscendPower ? "var(--tone-warning-soft, #fff7ed)" : "var(--color-background-secondary, #fff)",
                    color: !selectedAscendPower ? "var(--tone-danger, #9a3412)" : "var(--color-text-primary, #1e293b)",
                    borderRadius: "10px",
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "0.68rem", fontWeight: "900" }}>Sin poder injertado</div>
                  <div style={{ fontSize: "0.58rem", marginTop: "3px", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>
                    El item se vuelve legendario, pero queda sin poder.
                  </div>
                </button>
                {selectedAscendPowers.length > 0 ? selectedAscendPowers.map(power => (
                  <button
                    key={power.id}
                    onClick={() => setSelectedAscendPowerId(power.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "1px solid",
                      borderColor: selectedAscendPower?.id === power.id ? "var(--tone-warning, #fb923c)" : "var(--color-border-primary, #fed7aa)",
                      background: selectedAscendPower?.id === power.id ? "var(--tone-warning-soft, #fff7ed)" : "var(--color-background-secondary, #fff)",
                      color: "var(--color-text-primary, #1e293b)",
                      borderRadius: "10px",
                      padding: "8px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: "900" }}>{power.name}</div>
                      <span style={{ fontSize: "0.5rem", fontWeight: "900", textTransform: "uppercase", color: "var(--tone-danger, #c2410c)" }}>
                        {power.archetype}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.58rem", marginTop: "3px", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.35 }}>
                      {power.shortLabel} · desc. {power.discoveries} · {power.mastery?.label || "Descubierto"}
                    </div>
                    {!!power.mastery?.imprintCostReduction && (
                      <div style={{ fontSize: "0.56rem", marginTop: "3px", color: "var(--tone-accent, #4338ca)", fontWeight: "800" }}>
                        Injerto: -{Math.round((power.mastery.imprintCostReduction || 0) * 100)}% esencia
                      </div>
                    )}
                    {!!power.mastery?.huntBias && (
                      <div style={{ fontSize: "0.56rem", marginTop: "2px", color: "var(--tone-success-strong, #047857)", fontWeight: "800" }}>
                        Caza: +{Math.round((power.mastery.huntBias || 0) * 100)}% sesgo en su objetivo
                      </div>
                    )}
                  </button>
                )) : (
                  <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", textAlign: "center" }}>
                    Todavia no descubriste poderes. Cazalos primero desde bosses o familias objetivo.
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "reforge" && selectedAffixIndex != null && (
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900", textTransform: "uppercase" }}>
                {selectedItemReforgeOptions.length > 0 ? "Opciones de reforja" : "Aun no hay opciones (paga primero)"}
              </div>
              <div style={{ display: "grid", gap: "6px" }}>
                {selectedItemReforgeOptions.map((option, index) => (
                  <button key={`${option.id}-${index}`} onClick={() => setSelectedReforgeOption(option)} style={{ width: "100%", textAlign: "left", border: "1px solid", borderColor: selectedReforgeOption?.id === option.id && selectedReforgeOption?.stat === option.stat ? "var(--tone-violet, #7c3aed)" : "var(--color-border-primary, #ddd6fe)", background: selectedReforgeOption?.id === option.id && selectedReforgeOption?.stat === option.stat ? "var(--tone-violet-soft, #f3e8ff)" : "var(--color-background-secondary, #fff)", color: "var(--color-text-primary, #1e293b)", borderRadius: "10px", padding: "8px 10px", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: "900" }}>{STAT_LABELS[option.stat] || option.stat} (T{option.tier})</div>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {option.source === "abyss" && <span style={{ fontSize: "0.5rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "rgba(8,145,178,0.14)", color: "#0f766e", border: "1px solid rgba(13,148,136,0.24)" }}>ABISMO</span>}
                        {index === 0 && <span style={{ fontSize: "0.5rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-warning-soft, #fef3c7)", color: "var(--tone-warning, #92400e)", border: "1px solid var(--tone-warning, #fcd34d)" }}>ACTUAL</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "var(--tone-violet, #6d28d9)", marginTop: "3px" }}>+{formatStatValue(option.stat, option.rolledValue ?? option.value ?? 0)} · {option.kind === "prefix" ? "Prefijo" : "Sufijo"}</div>
                    {index === 0 && (
                      <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", fontWeight: "800" }}>
                        Sin cambios. Cierra la reforja pero no fija ninguna linea.
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {mode === "extract" && (
        <section style={selectionPanelStyle(isMobile, stickyHeaderHeight)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px" }}>
            <div>
              <div style={sectionEyebrowStyle}>Extraccion</div>
              <div style={{ fontSize: "0.8rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                {selectedIds.length > 0 ? `${selectedIds.length} items seleccionados` : "Extraccion rapida"}
              </div>
              <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "4px" }}>
                {selectedIds.length > 0 ? `Ganancia estimada: +E ${formatValue(totalEssenceGain)}` : "Tambien podes marcar items manualmente desde la lista."}
              </div>
            </div>
            {selectedIds.length > 0 && (
              <button onClick={() => { setSelectedIds([]); setIsConfirming(false); }} style={secondaryActionBtnStyle}>
                Limpiar
              </button>
            )}
          </div>

          {selectedIds.length > 0 ? (
            <button onClick={() => massExtract()} style={mainActionBtnStyle(isConfirming)}>
              {isConfirming ? `CONFIRMAR (+E ${formatValue(totalEssenceGain)})` : `ROMPER SELECCIONADOS (${selectedIds.length}) +E ${formatValue(totalEssenceGain)}`}
            </button>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", textAlign: "center" }}>AUTO-EXTRACCION POR RAREZA</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "5px" }}>
                <button onClick={() => massExtract("common")} style={quickExtractBtn("var(--color-text-tertiary, #9ca3af)")}>SOLO COMMON</button>
                <button onClick={() => massExtract("magic")} style={quickExtractBtn("var(--tone-success, #1D9E75)")}>HASTA MAGIC</button>
                <button onClick={() => massExtract("rare")} style={quickExtractBtn("var(--tone-accent, #3b82f6)")}>HASTA RARE</button>
              </div>
            </div>
          )}

          {isConfirming && <div style={{ color: "var(--tone-danger, #ef4444)", fontSize: "0.65rem", textAlign: "center", fontWeight: "bold" }}>Toca de nuevo para confirmar</div>}
        </section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px" }}>
        {sortedInventory.map(item => {
          const normalizedItem = {
            ...item,
            bonus: item?.bonus && typeof item.bonus === "object" ? item.bonus : {},
            affixes: Array.isArray(item?.affixes) ? item.affixes : [],
            crafting: item?.crafting && typeof item.crafting === "object" ? item.crafting : {},
          };

          const req = getReqs(normalizedItem)[mode] || { label: "", can: true };
          const isSelectedExtract = selectedIds.includes(normalizedItem.id);
          const isSelectedDetail = selectedItemId === normalizedItem.id;
          const isSuccess = lastActionId === normalizedItem.id;
          const equippedSlot = getItemLocation(normalizedItem, equipment);
          const isEquipped = !!equippedSlot;
          const compareItem = normalizedItem.type === "weapon" ? equipment.weapon : equipment.armor;

          let affixDots = [];
          let craftUsage = null;
          let compareEntries = [];
          let topStats = [];
          let implicitEntries = [];
          let economySummary = "";

          try {
            affixDots = normalizedItem.affixes.slice(0, 5).map((affix, index) => ({ key: `${affix.id || affix.stat}-${index}`, ...getAffixTierGlyph(affix) }));
            craftUsage = getCraftUsageSummary(normalizedItem);
            compareEntries = getTopCompareEntries(normalizedItem, compareItem, isMobile ? 2 : 3);
            topStats = getPrioritizedStatEntries(normalizedItem.bonus || {}, 2);
            implicitEntries = getImplicitEntries(normalizedItem);
            economySummary = formatEconomySummary(normalizedItem.bonus || {});
          } catch (error) {
            console.error("Crafting item render fallback", normalizedItem?.id, error);
          }

          const hasAffixes = normalizedItem.affixes.length > 0;
          const canSelectForMode = (() => {
            if (mode === "extract") return !isEquipped;
            if (isReforgeLocked) return reforgeSession?.itemId === normalizedItem.id;
            if (mode === "polish" || mode === "reforge") return hasAffixes;
            if (mode === "ascend") return !!ASCEND_RULES[normalizedItem.rarity];
            return req.can;
          })();
          const canAction = canSelectForMode;
          const reqBadge = getCraftActionBadge(req, mode);

          return (
            <div key={normalizedItem.id} onClick={() => handleAction(normalizedItem)} style={{ ...cardStyle(isSelectedExtract || isSelectedDetail, isSuccess, canAction), opacity: canAction ? 1 : 0.55, borderLeft: `4px solid ${getRarityColor(normalizedItem.rarity)}`, border: (isSelectedDetail || isSelectedExtract) ? "2px solid var(--tone-success, #1D9E75)" : "2px solid transparent", boxShadow: (isSelectedDetail || isSelectedExtract) ? "0 0 0 2px rgba(16,185,129,0.14)" : undefined, gap: "8px" }}>
              {isEquipped && <div title={equippedSlot === "weapon" ? "Arma equipada" : "Armadura equipada"} style={chipStyle(ITEM_SLOT_GLYPHS[equippedSlot] || "•", "var(--tone-warning, #f59e0b)", false)}>{ITEM_SLOT_GLYPHS[equippedSlot] || "•"}</div>}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={rarityBadgeStyle(normalizedItem.rarity)}>{getCompactRarityLabel(normalizedItem.rarity)}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)" }}>{getItemGlyph(normalizedItem.name)}</span>
                    <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.2 }}>{normalizedItem.name}</div>
                      {(normalizedItem.level || 0) > 0 && <span style={upgradeBadgeStyle(normalizedItem.level)}>{`+${normalizedItem.level}`}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: "4px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.45rem", fontWeight: "bold", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase" }}>Poder</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{formatValue(normalizedItem.rating)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(compareEntries.length > 0 ? compareEntries : topStats.map(([key, currentVal]) => ({ key, currentVal, diff: currentVal }))).map(entry => (
                  <span
                    key={`${normalizedItem.id}-quick-${entry.key}`}
                    style={{
                      ...miniStatPillStyle,
                      color: entry.diff > 0 ? "var(--tone-success-strong, #166534)" : entry.diff < 0 ? "var(--tone-danger, #D85A30)" : "var(--color-text-secondary, #64748b)",
                      background: entry.diff > 0 ? "var(--tone-success-soft, #ecfdf5)" : entry.diff < 0 ? "var(--tone-danger-soft, #fff1f2)" : "var(--color-background-tertiary, #f1f5f9)",
                    }}
                  >
                    {STAT_LABELS[entry.key] || entry.key} <strong>{entry.diff !== 0 ? formatDiffValue(entry.key, entry.diff) : `+${formatStatValue(entry.key, entry.currentVal)}`}</strong>
                  </span>
                ))}
              </div>

              {economySummary && (mode === "extract" || isSelectedDetail) && (
                <div style={{ fontSize: "0.6rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>
                  Eco: {economySummary}
                </div>
              )}

              {implicitEntries.length > 0 && (
                <div style={{ fontSize: "0.62rem", color: "var(--color-text-info, #4338ca)", fontWeight: "800" }}>
                  Implicito: {formatImplicitSummary(normalizedItem)}
                </div>
              )}

              {affixDots.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Affix</span>
                  {affixDots.map(dot => (
                    <span key={dot.key} title={dot.label} style={{ fontSize: "0.62rem", color: dot.color, fontWeight: "900" }}>{dot.symbol}</span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "auto" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {craftUsage && (
                      <>
                        <span style={{ ...miniStatPillStyle, fontSize: "0.54rem" }}>
                          RR <strong>{craftUsage.reroll.used}/{craftUsage.reroll.max}</strong>
                        </span>
                        <span style={{ ...miniStatPillStyle, fontSize: "0.54rem" }}>
                          RF <strong>{craftUsage.reforge.used}/{craftUsage.reforge.max}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {mode !== "extract" && <div style={costBadgeStyle(canAction, isSelectedExtract || isSelectedDetail)}>{reqBadge}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <section style={{ background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "14px", padding: "10px" }}>
        <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900", textTransform: "uppercase", marginBottom: "8px" }}>Log de Crafting</div>
        <div style={{ display: "grid", gap: "6px", maxHeight: isMobile ? "180px" : "220px", overflowY: "auto" }}>
          {(state.combat?.craftingLog || []).length > 0 ? (
            (state.combat.craftingLog || []).slice(-20).reverse().map((entry, index) => <div key={`${entry}-${index}`} style={{ background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "10px", padding: "8px 10px", fontSize: "0.66rem", color: "var(--color-text-primary, #334155)", fontWeight: "700" }}>{entry}</div>)
          ) : (
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary, #94a3b8)" }}>Todavia no hay acciones de crafting en esta sesion.</div>
          )}
        </div>
      </section>
    </div>
  );
}

const rarityBadgeStyle = (rarity) => {
  const color = getRarityColor(rarity);
  return { fontSize: "0.54rem", fontWeight: "900", padding: "3px 7px", borderRadius: "999px", background: `${color}22`, color, border: `1px solid ${color}44`, lineHeight: 1.1, whiteSpace: "nowrap", flexShrink: 0 };
};
const diffBadgeStyle = diff => ({
  fontSize: "0.58rem",
  color: diff > 0 ? "var(--tone-success, #1D9E75)" : diff < 0 ? "var(--tone-danger, #D85A30)" : "var(--color-text-tertiary, #94a3b8)",
  background: diff > 0 ? "var(--tone-success-soft, #ecfdf5)" : diff < 0 ? "var(--tone-danger-soft, #fff1f2)" : "var(--color-background-tertiary, #f1f5f9)",
  padding: "2px 5px",
  borderRadius: "6px",
  fontWeight: "900",
  lineHeight: 1.1,
});
const chipStyle = (label, color, left) => ({ position: "absolute", top: "6px", [left ? "left" : "right"]: "6px", fontSize: "0.48rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: color, color: "#fff", letterSpacing: "0.04em" });
const cardStyle = (isSelected, isSuccess, canAction) => ({
  background: "var(--color-background-secondary, #fff)",
  padding: "10px",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
  minHeight: "108px",
  position: "relative",
  transition: "all 0.2s ease",
  transform: isSuccess ? "scale(1.02)" : "none",
  cursor: canAction ? "pointer" : "not-allowed",
});
const costBadgeStyle = (can, isSelected) => ({
  fontSize: "0.55rem",
  padding: "2px 5px",
  borderRadius: "4px",
  background: isSelected ? "var(--tone-success-soft, #ecfdf5)" : (can ? "var(--tone-success-soft, #f0fdf4)" : "var(--tone-danger-soft, #fef2f2)"),
  color: isSelected ? "var(--tone-success-strong, #166534)" : (can ? "var(--tone-success, #16a34a)" : "var(--tone-danger, #ef4444)"),
  fontWeight: "bold",
});
const selectionPanelStyle = (isMobile = false, stickyHeaderHeight = null) => ({
  background: "var(--color-background-secondary, #fff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "14px",
  padding: "12px",
  display: "grid",
  gap: "10px",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
  scrollMarginTop: `${stickyHeaderHeight ?? (isMobile ? 276 : 252)}px`,
});
const stickyInfoBarStyle = {
  background: "var(--color-background-secondary, #fff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "10px",
  padding: "7px 10px",
  fontSize: "0.64rem",
  color: "var(--color-text-secondary, #64748b)",
  fontWeight: "800",
};
const stickyActionShellStyle = (isMobile = false) => ({
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) auto",
  gap: "10px",
  alignItems: "center",
  background: "var(--color-background-secondary, #fff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: isMobile ? "10px" : "10px 12px",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
});
const affixCarouselStyle = {
  display: "flex",
  alignItems: "stretch",
  gap: "8px",
  overflowX: "auto",
  overflowY: "hidden",
  padding: "2px 2px 4px",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",
  scrollbarWidth: "thin",
  scrollSnapType: "x proximity",
  overscrollBehaviorX: "contain",
};
const affixCarouselCardStyle = (isMobile = false) => ({
  flex: isMobile ? "0 0 min(82vw, 320px)" : "0 0 260px",
  minWidth: isMobile ? "min(82vw, 320px)" : "260px",
  maxWidth: isMobile ? "min(82vw, 320px)" : "260px",
  borderRadius: "10px",
  padding: "8px",
  scrollSnapAlign: "start",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
});
const carouselFadeStyle = (side = "right") => ({
  position: "absolute",
  top: 0,
  bottom: 4,
  [side]: 0,
  width: "28px",
  pointerEvents: "none",
  background: side === "right"
    ? "linear-gradient(90deg, rgba(255,255,255,0) 0%, var(--color-background-tertiary, #f8fafc) 100%)"
    : "linear-gradient(270deg, rgba(255,255,255,0) 0%, var(--color-background-tertiary, #f8fafc) 100%)",
});
const carouselHintStyle = (side = "right") => ({
  position: "absolute",
  [side]: "4px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "22px",
  height: "22px",
  borderRadius: "999px",
  border: "1px solid var(--color-border-primary, #cbd5e1)",
  background: "var(--color-background-secondary, #fff)",
  color: "var(--color-text-secondary, #475569)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.78rem",
  fontWeight: "900",
  pointerEvents: "none",
  boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
});
const selectionSubpanelStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "10px",
  background: "var(--color-background-tertiary, #f8fafc)",
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
};
const sectionEyebrowStyle = {
  fontSize: "0.56rem",
  color: "var(--color-text-tertiary, #94a3b8)",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
const secondaryActionBtnStyle = {
  border: "1px solid var(--color-border-primary, #cbd5e1)",
  background: "var(--color-background-secondary, #fff)",
  color: "var(--color-text-secondary, #475569)",
  borderRadius: "8px",
  padding: "7px 10px",
  fontSize: "0.64rem",
  fontWeight: "900",
  cursor: "pointer",
  flexShrink: 0,
};
const detailTitle = { fontSize: "0.55rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", marginBottom: "4px" };
const detailLine = { fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginBottom: "2px", lineHeight: 1.35, wordBreak: "break-word" };
const detailMutedLineStyle = { fontSize: "0.68rem", color: "var(--color-text-tertiary, #94a3b8)" };
const miniStatPillStyle = { fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", background: "var(--color-background-tertiary, #f1f5f9)", padding: "2px 6px", borderRadius: "999px", lineHeight: 1.2 };
const upgradeBadgeStyle = (level = 0) => {
  const tone = getUpgradeBadgeTone(level);
  return {
    fontSize: "0.6rem",
    fontWeight: "900",
    padding: "3px 7px",
    borderRadius: "999px",
    background: tone.background,
    color: tone.color,
    border: tone.border,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
};
const upgradeStepStyle = ({ isCurrent, isReached, isNext, flashTone = null }) => ({
  minWidth: "34px",
  textAlign: "center",
  padding: "5px 6px",
  borderRadius: "999px",
  fontSize: "0.6rem",
  fontWeight: "900",
  border: `1px solid ${
    flashTone === "success"
      ? "var(--tone-success, #22c55e)"
      : flashTone === "danger"
        ? "var(--tone-danger, #ef4444)"
        : isCurrent
          ? "var(--tone-warning, #f59e0b)"
          : "var(--color-border-primary, #cbd5e1)"
  }`,
  background: flashTone === "success"
    ? "var(--tone-success-soft, #ecfdf5)"
    : flashTone === "danger"
      ? "var(--tone-danger-soft, #fff1f2)"
      : isCurrent
        ? "var(--tone-warning-soft, #fffbeb)"
        : isReached
          ? "var(--tone-success-soft, #ecfdf5)"
          : "var(--color-background-secondary, #fff)",
  color: flashTone === "success"
    ? "var(--tone-success-strong, #166534)"
    : flashTone === "danger"
      ? "var(--tone-danger-strong, #991b1b)"
      : isCurrent
        ? "var(--tone-warning, #b45309)"
        : isReached
          ? "var(--tone-success-strong, #166534)"
          : "var(--color-text-secondary, #475569)",
  boxShadow: flashTone === "success"
    ? "0 0 0 2px rgba(34,197,94,0.18), 0 0 16px rgba(34,197,94,0.28)"
    : flashTone === "danger"
      ? "0 0 0 2px rgba(239,68,68,0.16), 0 0 16px rgba(190,24,93,0.22)"
      : isCurrent
        ? "0 0 0 2px rgba(245,158,11,0.15)"
        : "none",
  transform: flashTone ? "scale(1.06)" : "none",
  transition: "all 0.22s ease",
});
const ToolBtn = ({ active, label, onClick, color, isMobile = false, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minWidth: 0,
      padding: isMobile ? "7px 4px" : "8px 8px",
      border: `1px solid ${active ? color : "var(--color-border-primary, #e2e8f0)"}`,
      borderRadius: "8px",
      background: active ? "var(--color-background-tertiary, #f8fafc)" : "var(--color-background-secondary, #fff)",
      color: disabled ? "var(--color-text-tertiary, #94a3b8)" : active ? color : "var(--color-text-tertiary, #94a3b8)",
      boxShadow: active ? "0 0 0 1px rgba(99,102,241,0.18)" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      boxSizing: "border-box",
    }}
  >
    <span style={{ fontSize: isMobile ? "0.56rem" : "0.64rem", fontWeight: "900", lineHeight: 1.05, textAlign: "center", wordBreak: "break-word" }}>{label}</span>
  </button>
);
const mainActionBtnStyle = (confirming, options = {}) => {
  const tone = options.tone || (options.disabled ? "disabled" : "ready");
  const palette = {
    ready: {
      background: "linear-gradient(180deg, #243244 0%, #1e293b 100%)",
      color: "#fff",
      border: "1px solid rgba(30,41,59,0.18)",
      boxShadow: "0 8px 18px rgba(15,23,42,0.16)",
      transform: "translateY(0)",
    },
    disabled: {
      background: "linear-gradient(180deg, #475569 0%, #334155 100%)",
      color: "rgba(255,255,255,0.8)",
      border: "1px solid rgba(148,163,184,0.34)",
      boxShadow: "0 6px 14px rgba(15,23,42,0.12)",
      transform: "translateY(0)",
    },
    success: {
      background: "linear-gradient(180deg, #243244 0%, #1e293b 100%)",
      color: "#fff",
      border: "1px solid rgba(21,128,61,0.42)",
      boxShadow: "0 0 0 2px rgba(34,197,94,0.18), 0 8px 18px rgba(15,23,42,0.16)",
      transform: "translateY(0)",
    },
    danger: {
      background: "linear-gradient(180deg, #243244 0%, #1e293b 100%)",
      color: "#fff",
      border: "1px solid rgba(220,38,38,0.42)",
      boxShadow: "0 0 0 2px rgba(239,68,68,0.16), 0 8px 18px rgba(15,23,42,0.16)",
      transform: "translateY(0)",
    },
  };
  const chosen = palette[tone] || palette.ready;
  return {
    width: options.compact ? (options.fullWidth ? "100%" : "auto") : "100%",
    minWidth: options.compact && !options.fullWidth ? "220px" : undefined,
    padding: options.compact ? "11px 14px" : "14px",
    borderRadius: "10px",
    border: chosen.border,
    background: confirming ? "var(--tone-danger, #ef4444)" : chosen.background,
    color: chosen.color,
    fontWeight: "bold",
    cursor: options.disabled ? "not-allowed" : "pointer",
    fontSize: options.compact ? "0.7rem" : "0.75rem",
    opacity: options.disabled ? 0.82 : 1,
    boxShadow: chosen.boxShadow,
    transform: chosen.transform,
    transition: "all 0.18s ease",
  };
};
const quickExtractBtn = (color) => ({ background: color, color: "#fff", border: "none", borderRadius: "6px", padding: "8px 2px", fontSize: "0.55rem", fontWeight: "900", cursor: "pointer" });
