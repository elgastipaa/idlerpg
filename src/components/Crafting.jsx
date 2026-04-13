import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PREFIXES, SUFFIXES } from "../data/affixes";
import { getPlayerBuildTag } from "../utils/buildIdentity";
import { getLootHighlights } from "../utils/lootHighlights";
import { getAffixTierGlyph, getRarityColor } from "../constants/rarity";
import { ASCEND_COSTS } from "../constants/craftingCosts";
import { getCraftActionState, getItemForgingPotential } from "../engine/crafting/craftingEngine";
import { getUnlockedLegendaryPowers } from "../engine/progression/codexEngine";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
  formatItemNumber as formatValue,
  formatItemStatValue as formatStatValue,
  formatItemDiffValue as formatDiffValue,
  getItemDisplayName,
  getItemLocation,
  getImplicitEntries,
  formatImplicitSummary,
  getPrioritizedStatEntries,
  formatEconomySummary,
  getTopCompareEntries,
  getCompareSummary,
  getWorkedLabel,
} from "../utils/itemPresentation";

const RARITY_WEIGHT = { common: 0, magic: 1, rare: 2, epic: 3, legendary: 4 };
const ASCEND_RULES = ASCEND_COSTS;
const FORGE_MODE_TOOLTIPS = {
  upgrade: {
    tone: "upgrade",
    text: "Upgrade sube el +N del item. Puede fallar y bajar un nivel, asi que conviene mirar el riesgo antes de insistir.",
  },
  reroll: {
    tone: "reroll",
    text: "Reroll rehace todas las lineas del item. Es para rescatar bases prometedoras, no para cerrar la pieza final.",
  },
  polish: {
    tone: "polish",
    text: "Pulir ajusta solo el valor de una linea. No fija el item a esa linea.",
  },
  reforge: {
    tone: "reforge",
    text: "Reforja cambia una sola linea. El item queda enfocado en esa linea para perseguir la version casi perfecta.",
  },
  ascend: {
    tone: "ascend",
    text: "Ascender eleva la rareza preservando affixes y linea trabajada. Si salta a legendario, puede injertar un poder ya descubierto en Codex.",
  },
  extract: {
    tone: "extract",
    text: "Extraer rompe items para convertirlos en esencia.",
  },
};
const FORGE_MODE_ORDER = ["upgrade", "reroll", "polish", "reforge", "ascend", "extract"];
const FORGE_MODE_META = {
  upgrade: { label: "Upgrade", short: "UP", color: "var(--tone-success, #1D9E75)", cta: "MEJORAR ITEM" },
  reroll: { label: "Reroll", short: "RE", color: "var(--tone-success, #1D9E75)", cta: "REROLLEAR ITEM" },
  polish: { label: "Polish", short: "PO", color: "var(--tone-info, #0ea5e9)", cta: "PULIR AFFIX" },
  reforge: { label: "Reforge", short: "RF", color: "var(--tone-violet, #7c3aed)", cta: "PAGAR REFORJA" },
  ascend: { label: "Ascend", short: "AS", color: "var(--tone-accent, #3b82f6)", cta: "ASCENDER ITEM" },
  extract: { label: "Extract", short: "EX", color: "var(--tone-danger, #ef4444)", cta: "EXTRAER ITEM" },
};

const getItemIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("espada") || n.includes("daga") || n.includes("hacha") || n.includes("maza")) return "WP";
  if (n.includes("arco") || n.includes("ballesta")) return "BW";
  if (n.includes("baston") || n.includes("cetro")) return "ST";
  if (n.includes("escudo")) return "SH";
  if (n.includes("tunica") || n.includes("armadura") || n.includes("cuero") || n.includes("cota")) return "AR";
  return "IT";
};

function getCraftingState(item) {
  return {
    rerollCount: item?.crafting?.rerollCount || 0,
    polishCount: item?.crafting?.polishCount || 0,
    reforgeCount: item?.crafting?.reforgeCount || 0,
    ascendCount: item?.crafting?.ascendCount || 0,
    focusedAffixIndex:
      Number.isInteger(item?.crafting?.focusedAffixIndex) ? Number(item.crafting.focusedAffixIndex) : null,
    focusedAffixStat: item?.crafting?.focusedAffixStat || null,
  };
}

function getHighlightStyle(tone) {
  const palette = {
    legendary: { bg: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-danger, #c2410c)", border: "var(--tone-warning, #fdba74)" },
    epic: { bg: "var(--tone-violet-soft, #faf5ff)", color: "var(--tone-violet, #7c3aed)", border: "var(--tone-accent, #c4b5fd)" },
    perfect: { bg: "var(--tone-warning-soft, #fefce8)", color: "#a16207", border: "var(--tone-warning, #fde68a)" },
    t1: { bg: "var(--tone-info-soft, #eff6ff)", color: "var(--tone-info, #1d4ed8)", border: "var(--tone-info, #93c5fd)" },
    upgrade: { bg: "var(--tone-success-soft, #ecfdf5)", color: "var(--tone-success-strong, #047857)", border: "var(--tone-success, #86efac)" },
    build: { bg: "var(--tone-info-soft, #f0f9ff)", color: "var(--tone-info, #0369a1)", border: "var(--tone-info, #7dd3fc)" },
    offense: { bg: "var(--tone-danger-soft, #fff1f2)", color: "var(--tone-danger-strong, #be123c)", border: "var(--tone-danger, #fda4af)" },
    wishlist: { bg: "var(--tone-success-soft, #ecfeff)", color: "var(--tone-success-strong, #0f766e)", border: "var(--tone-success, #99f6e4)" },
    masterwork: { bg: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-danger, #9a3412)", border: "var(--tone-warning, #fdba74)" },
    forged: { bg: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)", border: "var(--tone-accent, #a5b4fc)" },
    crafted: { bg: "var(--tone-neutral-soft, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "var(--color-border-tertiary, #cbd5e1)" },
  };
  return palette[tone] || { bg: "var(--tone-neutral-soft, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "var(--color-border-tertiary, #cbd5e1)" };
}

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

function formatCraftCostLabel(costs = {}) {
  const parts = [];
  if ((costs.gold || 0) > 0) parts.push(`G ${formatValue(costs.gold)}`);
  if ((costs.essence || 0) > 0) parts.push(`E ${formatValue(costs.essence)}`);
  return parts.length > 0 ? parts.join(" · ") : "GRATIS";
}

function getCraftActionHint(req = {}, mode) {
  if (!req) return "";
  if (req.reason === "ok") {
    if (req.requiredPotential > 0) {
      return `Potencial ${Math.round(req.forgingPotential || 0)}% / ${Math.round(req.requiredPotential || 0)}%.`;
    }
    return "";
  }

  switch (req.reason) {
    case "gold":
      return "Falta oro para esta accion.";
    case "essence":
      return "Falta esencia para esta accion.";
    case "missing_affix":
      return mode === "polish" ? "Elegi un affix antes de pulir." : "Elegi una linea antes de reforjar.";
    case "focused_line":
      return "La pieza ya quedo fijada a otra linea.";
    case "potential":
      return `Potencial insuficiente: ${Math.round(req.forgingPotential || 0)}% / ${Math.round(req.requiredPotential || 0)}%.`;
    case "min_level":
      return `Requiere upgrade +${req.minLevel || 0} antes de ascender.`;
    case "max_rarity":
      return "La pieza ya esta en rareza maxima.";
    case "max_level":
      return "La pieza ya llego a +10.";
    default:
      return "";
  }
}

function getCraftActionBadge(req = {}, mode) {
  if (!req) return "N/A";
  if (req.can) return formatCraftCostLabel(req.costs);

  switch (req.reason) {
    case "gold":
      return "FALTA ORO";
    case "essence":
      return "FALTA ESENCIA";
    case "missing_affix":
      return mode === "polish" ? "ELEGI AFFIX" : "ELEGI LINEA";
    case "focused_line":
      return "LINEA FIJADA";
    case "potential":
      return `POT ${Math.round(req.forgingPotential || 0)}/${Math.round(req.requiredPotential || 0)}`;
    case "min_level":
      return `REQ +${req.minLevel || 0}`;
    case "max_rarity":
      return "LEGENDARY";
    case "max_level":
      return "MAX";
    default:
      return "BLOQUEADO";
  }
}

export default function Crafting({ state, dispatch }) {
  const { player } = state;
  const inventory = player.inventory || [];
  const gold = player.gold || 0;
  const essence = player.essence || 0;
  const equipment = player.equipment || {};
  const activeBuildTag = getPlayerBuildTag(player);
  const wishlistAffixes = state?.settings?.lootRules?.wishlistAffixes || [];
  const unlockedLegendaryPowers = useMemo(
    () => getUnlockedLegendaryPowers(state?.codex || {}, { specialization: player?.specialization, className: player?.class }),
    [state?.codex, player?.specialization, player?.class]
  );
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
  const [upgradeTrackFeedback, setUpgradeTrackFeedback] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const sortedInventory = useMemo(() => {
    const allItems = [...inventory, ...(equipment.weapon ? [equipment.weapon] : []), ...(equipment.armor ? [equipment.armor] : [])];
    return [...allItems].sort((a, b) => {
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
  }, [inventory, equipment]);
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    const allItems = [...inventory, ...(equipment.weapon ? [equipment.weapon] : []), ...(equipment.armor ? [equipment.armor] : [])];
    return allItems.find(item => item.id === selectedItemId) || null;
  }, [selectedItemId, inventory, equipment]);

  const affixTemplatesByStat = useMemo(() => Object.fromEntries([...PREFIXES, ...SUFFIXES].map(entry => [entry.stat, entry])), []);

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
  const selectedCompareSummary = selectedItem ? getCompareSummary(selectedItem, selectedCompareItem) : "";
  const selectedCompareEntries = selectedItem ? getTopCompareEntries(selectedItem, selectedCompareItem, isMobile ? 4 : 5) : [];
  const selectedTopStats = selectedItem ? getPrioritizedStatEntries(selectedItem.bonus || {}, isMobile ? 4 : 5) : [];
  const selectedImplicitSummary = selectedItem ? formatImplicitSummary(selectedItem) : "";
  const selectedEconomySummary = selectedItem ? formatEconomySummary(selectedItem.bonus || {}) : "";
  const selectedForgingPotential = selectedItem ? getItemForgingPotential(selectedItem) : 0;
  const selectedWorkedLabel = selectedItem ? getWorkedLabel(selectedItem) : null;
  const selectedActionReq = selectedItem ? (getReqs(selectedItem)[mode] || { costs: {}, can: true, reason: "ok" }) : { costs: {}, can: true, reason: "ok" };
  const selectedActionCostLabel = formatCraftCostLabel(selectedActionReq.costs);
  const selectedActionHint = getCraftActionHint(selectedActionReq, mode);
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
  const selectedCurrentOptionIsKeep =
    mode === "reforge" &&
    !!selectedReforgeOption &&
    !!selectedCurrentAffix &&
    selectedReforgeOption.id === selectedCurrentAffix.id &&
    selectedReforgeOption.stat === selectedCurrentAffix.stat &&
    selectedReforgeOption.tier === selectedCurrentAffix.tier &&
    (selectedReforgeOption.rolledValue ?? selectedReforgeOption.value ?? null) === (selectedCurrentAffix.rolledValue ?? selectedCurrentAffix.value ?? null);
  const stepCopy =
    mode === "extract"
      ? (selectedIds.length > 0 ? `${selectedIds.length} items listos para extraer` : "marca uno o varios items para convertirlos en esencia")
      : isReforgeLocked
        ? "reforja pagada; elegi una opcion o manten la actual antes de salir"
      : selectedItem
        ? "item seleccionado; toca otra card para cambiarlo"
        : "elegi un item para continuar";

  const triggerSuccess = (id) => {
    setLastActionId(id);
    setTimeout(() => setLastActionId(null), 300);
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
        if (!req?.can) return;
        dispatch({
          type: "CRAFT_REFORGE_PREVIEW",
          payload: {
            itemId: selectedItem.id,
            affixIndex: selectedAffixIndex,
            favoredStats: activeBuildTag?.conditions?.prefersStats || [],
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
      triggerSuccess(selectedItem.id);
      setSelectedReforgeOption(null);
      return;
    }

    if (!req?.can) return;

    if (mode === "upgrade") {
      setPendingCraftFeedback({ type: "upgrade", itemId: selectedItem.id, previousLevel: selectedItem.level ?? 0 });
    }

    const actionType = {
      upgrade: "CRAFT_UPGRADE_ITEM",
      reroll: "CRAFT_REROLL_ITEM",
      polish: "CRAFT_POLISH_ITEM",
      ascend: "CRAFT_ASCEND_ITEM",
    }[mode];

    if (mode === "polish" && selectedAffixIndex == null) return;

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
    <div style={{ padding: isMobile ? "10px" : "14px", display: "flex", flexDirection: "column", gap: "12px", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", minHeight: "100%" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "6px", background: "var(--color-background-primary, #f8fafc)" }}>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
          {FORGE_MODE_ORDER.map((m) => (
            <ToolBtn
              key={m}
              active={mode === m}
              label={FORGE_MODE_META[m].label}
              short={FORGE_MODE_META[m].short}
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
      </div>

      {modeTooltip && (
        <div style={getModeTooltipStyle(modeTooltip.tone)}>
          {modeTooltip.text}
        </div>
      )}
      <div style={{ background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "10px", padding: "7px 10px", fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>
        Paso actual: <span style={{ color: modeMeta.color, fontWeight: "900" }}>{modeMeta.label}</span> · {stepCopy}
      </div>

      {isReforgeLocked && (
        <div style={{ background: "var(--tone-violet-soft, #f3e8ff)", border: "1px solid var(--tone-violet, #c4b5fd)", borderRadius: "10px", padding: "7px 10px", fontSize: "0.64rem", color: "var(--tone-violet, #6d28d9)", fontWeight: "900" }}>
          Reforja en curso: el costo ya fue pagado. No podes cambiar de tab ni de herramienta hasta elegir una opcion o mantener la linea actual.
        </div>
      )}

      {selectedItem && isSingleItemMode && (
        <section style={selectionPanelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={sectionEyebrowStyle}>Item Seleccionado</div>
              <h4 style={{ margin: "2px 0 0", fontSize: isMobile ? "0.82rem" : "0.92rem", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.15 }}>{getItemDisplayName(selectedItem)}</h4>
              <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900", marginTop: "4px" }}>
                {selectedCompareSummary}
              </div>
              <div style={{ fontSize: "0.6rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", marginTop: "3px" }}>
                Rerolls {getCraftingState(selectedItem).rerollCount} · Pulidos {getCraftingState(selectedItem).polishCount} · Reforjas {getCraftingState(selectedItem).reforgeCount} · Ascensos {getCraftingState(selectedItem).ascendCount}
              </div>
              {focusedAffix && (
                <div style={{ fontSize: "0.6rem", color: "var(--tone-violet, #6d28d9)", fontWeight: "900", marginTop: "4px" }}>
                  Linea trabajada: {focusedAffixLabel} · slot {focusedAffixIndex + 1}
                </div>
              )}
            </div>
            <button onClick={() => !isReforgeLocked && setSelectedItemId(null)} disabled={isReforgeLocked} style={secondaryActionBtnStyle}>
              Limpiar
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={rarityBadgeStyle(selectedItem.rarity)}>{selectedItem.rarity.toUpperCase()}</span>
            {selectedWorkedLabel && <span style={workedBadgeStyle}>{selectedWorkedLabel}</span>}
            <span style={{ ...miniStatPillStyle, fontWeight: "900", color: "var(--color-text-secondary, #475569)" }}>
              Poder <strong>{formatValue(selectedItem.rating)}</strong>
            </span>
            <span style={{ ...miniStatPillStyle, fontWeight: "900", color: "var(--color-text-secondary, #475569)" }}>
              Potencial <strong>{Math.round(selectedForgingPotential)}%</strong>
            </span>
            {selectedActionReq.requiredPotential > 0 && (
              <span style={{ ...miniStatPillStyle, fontWeight: "900", color: selectedActionReq.can ? "var(--tone-success-strong, #166534)" : "var(--tone-danger, #D85A30)" }}>
                Minimo <strong>{Math.round(selectedActionReq.requiredPotential)}%</strong>
              </span>
            )}
          </div>

          {mode === "upgrade" && (
            <div style={selectionSubpanelStyle}>
              <div style={detailTitle}>Ruta de Upgrade</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {Array.from({ length: 11 }, (_, level) => {
                  const currentLevel = selectedItem.level ?? 0;
                  const isCurrent = level === currentLevel;
                  const isReached = level < currentLevel;
                  const isNext = level === Math.min(10, currentLevel + 1);
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
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginTop: "8px", fontSize: "0.64rem", fontWeight: "900" }}>
                <span style={{ color: "var(--tone-warning, #b45309)" }}>Nivel actual: {selectedItem.level ?? 0}</span>
                <span style={{ color: "var(--color-text-secondary, #475569)" }}>Objetivo visible: +{Math.min(10, (selectedItem.level ?? 0) + 1)}</span>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: isMobile ? "1fr" : (mode === "reroll" || mode === "polish" || mode === "reforge") ? "minmax(0, 0.95fr) minmax(0, 1.05fr)" : "1fr" }}>
            <div style={selectionSubpanelStyle}>
              <div style={detailTitle}>Resumen rapido</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                {(selectedCompareEntries.length > 0 ? selectedCompareEntries : selectedTopStats.map(([key, currentVal]) => ({ key, currentVal, diff: currentVal }))).map(entry => (
                  <span
                    key={`selected-quick-${entry.key}`}
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

              <div style={{ marginBottom: "8px" }}>
                <div style={{ ...detailTitle, marginBottom: "3px" }}>Potencial de forja</div>
                <div style={{ height: "6px", borderRadius: "999px", background: "var(--color-background-tertiary, #e2e8f0)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${selectedForgingPotential}%`,
                      height: "100%",
                      background: selectedForgingPotential >= 65 ? "var(--tone-success, #22c55e)" : selectedForgingPotential >= 35 ? "var(--tone-warning, #f59e0b)" : "var(--tone-danger, #ef4444)",
                    }}
                  />
                </div>
              </div>

              {selectedImplicitSummary && (
                <div style={{ ...detailMutedLineStyle, color: "var(--color-text-info, #4338ca)", fontWeight: "800", marginBottom: "6px" }}>
                  Implicit: {selectedImplicitSummary}
                </div>
              )}

              {selectedEconomySummary && (
                <div style={{ ...detailMutedLineStyle, color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginBottom: "6px" }}>
                  Eco: {selectedEconomySummary}
                </div>
              )}

              {selectedTopStats.length > 0 && (
                <div style={{ display: "grid", gap: "5px" }}>
                  {selectedTopStats.map(([key, value]) => (
                    <div key={`selected-stat-${key}`} style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "0.64rem", color: "var(--color-text-secondary, #475569)", fontWeight: "800" }}>
                      <span>{STAT_LABELS[key] || key}</span>
                      <span style={{ color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>+{formatStatValue(key, value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(mode === "reroll" || mode === "polish" || mode === "reforge") && (
              <div style={selectionSubpanelStyle}>
                <div style={detailTitle}>Lineas del item</div>
                <div style={{ display: "grid", gap: "6px", maxHeight: isMobile ? "220px" : "250px", overflowY: "auto", paddingRight: "2px" }}>
                  {(selectedItem.affixes || []).map((af, idx) => {
                    const isFocusedLine = Number.isInteger(focusedAffixIndex) && focusedAffixIndex === idx;
                    const isLockedByFocus = mode === "reforge" && Number.isInteger(focusedAffixIndex) && focusedAffixIndex !== idx;
                    const isTargetedLine = selectedAffixIndex === idx;

                    return (
                    <div key={idx} style={{ border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "10px", padding: "8px", background: isFocusedLine ? "var(--tone-violet-soft, #f3e8ff)" : af.tier === 1 ? "var(--tone-warning-soft, #fffbeb)" : af.tier === 2 ? "var(--tone-info-soft, #eff6ff)" : "var(--color-background-secondary, #fff)", boxShadow: isFocusedLine ? "0 0 0 1px rgba(124,58,237,0.18)" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                        <div style={{ ...detailLine, color: isFocusedLine ? "var(--tone-violet, #6d28d9)" : af.tier === 1 ? "#b45309" : "var(--tone-accent, #534AB7)", fontWeight: "900", marginBottom: "4px", minWidth: 0 }}>
                        +{formatStatValue(af.stat, af.rolledValue ?? af.value ?? 0)} {STAT_LABELS[af.stat] || af.stat} {af.tier ? `(T${af.tier})` : ""}
                        {af.label ? ` · ${af.label}` : ""}
                        {af.perfectRoll ? " PERFECT" : ""}
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
                                ? (mode === "polish" ? "AFFIX A PULIR" : "LINEA A REFORJAR")
                                : (mode === "polish" ? "PULIR ESTE AFFIX" : "REFORJAR ESTA LINEA")}
                        </button>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            )}
          </div>

          {mode === "polish" && (
            <div style={{ color: "var(--tone-info, #0369a1)", fontSize: "0.65rem", fontWeight: "bold", textAlign: "center" }}>
              Pulir rerollea solo el valor del affix elegido. Mantiene el mismo stat y el mismo tier.
            </div>
          )}
          {mode === "reforge" && (
            <div style={{ color: "var(--tone-violet, #6d28d9)", fontSize: "0.65rem", fontWeight: "bold", textAlign: "center" }}>
              {focusedAffix
                ? `Este item ya quedo fijado a ${focusedAffixLabel}. Solo podes seguir esa linea.`
                : "Flujo: 1) elegir linea 2) pagar reforja 3) elegir resultado. Elegir Actual no cambia ni fija la pieza."}
            </div>
          )}
          {selectedActionHint && (
            <div style={{ color: selectedActionReq.can ? "var(--color-text-secondary, #475569)" : "var(--tone-danger, #D85A30)", fontSize: "0.65rem", fontWeight: "bold", textAlign: "center" }}>
              {selectedActionHint}
            </div>
          )}
          {mode === "ascend" && selectedItem.rarity !== "legendary" && <div style={{ color: "var(--tone-accent, #3b82f6)", fontSize: "0.65rem", fontWeight: "bold", textAlign: "center" }}>Ascenso: {selectedActionCostLabel} · requiere +{selectedActionReq.minLevel || ASCEND_RULES[selectedItem.rarity]?.minLevel || 0}</div>}
          {mode === "ascend" && selectedActionReq?.nextRarity === "legendary" && (
            <div style={{ display: "grid", gap: "8px", padding: "10px", borderRadius: "12px", background: "var(--tone-warning-soft, #fff7ed)", border: "1px solid rgba(251,146,60,0.22)" }}>
              <div style={{ fontSize: "0.6rem", color: "var(--tone-danger, #c2410c)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Poder legendario opcional
              </div>
              <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.35 }}>
                Si ya descubriste enablers en Codex, podes injertar uno al ascender esta pieza a legendaria. Si no elegis ninguno, el item asciende sin poder.
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
                    El item se vuelve legendario, pero queda sin enabler.
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
                    Todavia no descubriste enablers. Cazalos primero desde bosses o familias objetivo.
                  </div>
                )}
              </div>
            </div>
          )}
          {mode === "upgrade" && <div style={{ color: "var(--tone-danger, #D85A30)", fontSize: "0.65rem", fontWeight: "bold", textAlign: "center" }}>Riesgo de fallo: {formatValue((selectedActionReq.failChance || 0) * 100)}% · si falla baja un nivel</div>}

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
                      {index === 0 && <span style={{ fontSize: "0.5rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-warning-soft, #fef3c7)", color: "var(--tone-warning, #92400e)", border: "1px solid var(--tone-warning, #fcd34d)" }}>ACTUAL</span>}
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

          <button disabled={((mode !== "reforge" || selectedItemReforgeOptions.length === 0) && !selectedActionReq.can) || (mode === "polish" && selectedAffixIndex == null) || (mode === "reforge" && selectedAffixIndex == null) || (mode === "reforge" && selectedItemReforgeOptions.length > 0 && !selectedReforgeOption)} onClick={executeCraft} style={mainActionBtnStyle(false)}>
            {mode === "reforge"
              ? `${selectedItemReforgeOptions.length > 0 ? (selectedCurrentOptionIsKeep ? "MANTENER LINEA ACTUAL" : "CONFIRMAR REFORJA") : "PAGAR REFORJA"} (${selectedActionCostLabel})`
              : `${modeMeta.cta} (${selectedActionCostLabel})`}
          </button>
        </section>
      )}

      {mode === "extract" && (
        <section style={selectionPanelStyle}>
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
          const req = getReqs(item)[mode] || { label: "", can: true };
          const isSelectedExtract = selectedIds.includes(item.id);
          const isSelectedDetail = selectedItemId === item.id;
          const isSuccess = lastActionId === item.id;
          const equippedSlot = getItemLocation(item, equipment);
          const isEquipped = !!equippedSlot;
          const compareItem = item.type === "weapon" ? equipment.weapon : equipment.armor;
          const highlights = getLootHighlights({ item, equippedItem: compareItem, activeBuildTag, wishlistAffixes }).slice(0, 2);
          const affixDots = (item.affixes || []).slice(0, 5).map((affix, index) => ({ key: `${affix.id || affix.stat}-${index}`, ...getAffixTierGlyph(affix) }));
          const forgingPotential = getItemForgingPotential(item);
          const compareSummary = getCompareSummary(item, compareItem);
          const compareEntries = getTopCompareEntries(item, compareItem, isMobile ? 2 : 3);
          const topStats = getPrioritizedStatEntries(item.bonus || {}, 2);
          const implicitEntries = getImplicitEntries(item);
          const workedLabel = getWorkedLabel(item);
          const economySummary = formatEconomySummary(item.bonus || {});
          const canAction = mode === "extract" ? !isEquipped : (isReforgeLocked ? reforgeSession?.itemId === item.id : req.can);
          const reqBadge = getCraftActionBadge(req, mode);

          return (
            <div key={item.id} onClick={() => handleAction(item)} style={{ ...cardStyle(isSelectedExtract || isSelectedDetail, isSuccess, canAction), opacity: canAction ? 1 : 0.55, borderLeft: `4px solid ${getRarityColor(item.rarity)}`, border: (isSelectedDetail || isSelectedExtract) ? "2px solid var(--tone-success, #1D9E75)" : "2px solid transparent", boxShadow: (isSelectedDetail || isSelectedExtract) ? "0 0 0 2px rgba(16,185,129,0.14)" : undefined, gap: "8px" }}>
              {isEquipped && <div style={chipStyle(equippedSlot === "weapon" ? "ARMA" : "ARMADURA", "var(--tone-warning, #f59e0b)", false)}>{equippedSlot === "weapon" ? "ARMA" : "ARMADURA"}</div>}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)" }}>{getItemIcon(item.name)}</span>
                    <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.2 }}>{getItemDisplayName(item)}</div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={rarityBadgeStyle(item.rarity)}>{item.rarity.toUpperCase()}</span>
                    {workedLabel && <span style={workedBadgeStyle}>{workedLabel}</span>}
                    {highlights.map(highlight => {
                      const style = getHighlightStyle(highlight.tone);
                      return <span key={highlight.id} style={{ fontSize: "0.44rem", fontWeight: "900", padding: "1px 4px", borderRadius: "999px", background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>{highlight.label}</span>;
                    })}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: "4px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.45rem", fontWeight: "bold", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase" }}>Poder</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{formatValue(item.rating)}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", fontSize: "0.6rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>
                <span>{compareSummary}</span>
                <span>{(item.affixes || []).length} affixes</span>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(compareEntries.length > 0 ? compareEntries : topStats.map(([key, currentVal]) => ({ key, currentVal, diff: currentVal }))).map(entry => (
                  <span
                    key={`quick-${entry.key}`}
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
                  Implicit: {formatImplicitSummary(item)}
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

              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "auto" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", marginBottom: "3px" }}>
                    Potencial {Math.round(forgingPotential)}%
                  </div>
                  <div style={{ height: "4px", borderRadius: "999px", background: "rgba(148,163,184,0.35)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${forgingPotential}%`,
                        height: "100%",
                        background: forgingPotential >= 65 ? "var(--tone-success, #22c55e)" : forgingPotential >= 35 ? "var(--tone-warning, #f59e0b)" : "var(--tone-danger, #ef4444)",
                      }}
                    />
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
  return { fontSize: "0.45rem", fontWeight: "900", padding: "1px 4px", borderRadius: "3px", background: `${color}22`, color, border: `1px solid ${color}44` };
};
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
const selectionPanelStyle = {
  background: "var(--color-background-secondary, #fff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "14px",
  padding: "12px",
  display: "grid",
  gap: "10px",
};
const selectionSubpanelStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "10px",
  background: "var(--color-background-tertiary, #f8fafc)",
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
const detailLine = { fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginBottom: "2px" };
const detailMutedLineStyle = { fontSize: "0.68rem", color: "var(--color-text-tertiary, #94a3b8)" };
const miniStatPillStyle = { fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", background: "var(--color-background-tertiary, #f1f5f9)", padding: "2px 6px", borderRadius: "999px", lineHeight: 1.2 };
const workedBadgeStyle = { background: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)", fontSize: "0.54rem", padding: "2px 6px", borderRadius: "999px", fontWeight: "900", letterSpacing: "0.03em", border: "1px solid var(--tone-accent, #c7d2fe)" };
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
const ToolBtn = ({ active, label, short, onClick, color, isMobile = false, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minWidth: isMobile ? "84px" : "96px",
      padding: "8px 10px",
      border: `1px solid ${active ? color : "var(--color-border-primary, #e2e8f0)"}`,
      borderRadius: "8px",
      background: active ? "var(--color-background-tertiary, #f8fafc)" : "var(--color-background-secondary, #fff)",
      color: disabled ? "var(--color-text-tertiary, #94a3b8)" : active ? color : "var(--color-text-tertiary, #94a3b8)",
      boxShadow: active ? "0 0 0 1px rgba(99,102,241,0.18)" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      flexShrink: 0,
    }}
  >
    <span style={{ fontSize: isMobile ? "0.65rem" : "0.68rem", fontWeight: "900", lineHeight: 1.1 }}>{label}</span>
    <span style={{ fontSize: "0.52rem", fontWeight: "800", opacity: 0.85, marginTop: "2px", letterSpacing: "0.06em" }}>{short}</span>
  </button>
);
const mainActionBtnStyle = (confirming) => ({ width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: confirming ? "var(--tone-danger, #ef4444)" : "#1e293b", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "0.75rem" });
const quickExtractBtn = (color) => ({ background: color, color: "#fff", border: "none", borderRadius: "6px", padding: "8px 2px", fontSize: "0.55rem", fontWeight: "900", cursor: "pointer" });
