import React, { useEffect, useMemo, useRef, useState } from "react";
import useViewport from "../hooks/useViewport";
import { getPlayerBuildTag } from "../utils/buildIdentity";
import { getCraftUsageSummary } from "../engine/crafting/craftingEngine";
import { getLootHighlights } from "../utils/lootHighlights";
import {
  AVAILABLE_HUNT_STATS,
  getHuntProfiles,
  resolveLootRuleWishlist,
  summarizeLootRuleAutomation,
} from "../utils/lootFilter";
import { getRarityColor } from "../constants/rarity";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
  ITEM_ECONOMY_STATS,
  formatItemNumber as formatNumber,
  formatItemStatValue as formatStatValue,
  formatItemDiffValue as formatDiffValue,
  getItemStats,
  getImplicitEntries,
  formatImplicitSummary,
  getAffixEntries,
  getAffixDots,
  getPrioritizedStatEntries,
  getTopCompareEntries,
  getItemLocation,
  getLegendaryPowerSummary,
} from "../utils/itemPresentation";
import { getCompactRarityLabel, getItemGlyph, getUpgradeBadgeTone } from "../utils/itemVisuals";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";

const BULK_SELL_RARITIES = ["common", "magic", "rare", "epic"];
const AUTO_LOOT_RARITIES = ["common", "magic", "rare", "epic"];
const RARITY_VISIBILITY_OPTIONS = ["common", "magic", "rare", "epic", "legendary"];
const LOOT_ACTION_OPTIONS = [
  { id: "keep", label: "Guardar" },
  { id: "sell", label: "Vender" },
  { id: "extract", label: "Extraer" },
];
const BASIC_LOOT_FILTER_PRESETS = [
  {
    id: "keep_all",
    label: "Guardar todo",
    summary: "No vende ni extrae nada automaticamente.",
    lootRules: { autoSellRarities: [], autoExtractRarities: [] },
  },
  {
    id: "sell_low",
    label: "Vender C/M",
    summary: "Limpia common y magic. Rare+ queda manual.",
    lootRules: { autoSellRarities: ["common", "magic"], autoExtractRarities: [] },
  },
  {
    id: "extract_low",
    label: "Extraer C/M",
    summary: "Convierte common y magic en esencia. Rare+ queda manual.",
    lootRules: { autoSellRarities: [], autoExtractRarities: ["common", "magic"] },
  },
];
function getCardHighlights(highlights = []) {
  const allowed = new Set(["legendary", "epic", "enabler", "perfect", "t1", "wishlist", "hunt", "upgrade", "build"]);
  return highlights.filter(highlight => allowed.has(highlight?.id)).slice(0, 2);
}

function sameWishlist(left = [], right = []) {
  if (left.length !== right.length) return false;
  const leftSet = new Set(left);
  return right.every(stat => leftSet.has(stat));
}

function sameRarityList(left = [], right = []) {
  if (left.length !== right.length) return false;
  const leftSet = new Set(left);
  return right.every(rarity => leftSet.has(rarity));
}

function getLootAction(lootRules = {}, rarity) {
  if ((lootRules.autoExtractRarities || []).includes(rarity)) return "extract";
  if ((lootRules.autoSellRarities || []).includes(rarity)) return "sell";
  return "keep";
}

function buildLootRuleUpdateForRarity(lootRules = {}, rarity, nextAction) {
  const nextSell = new Set((lootRules.autoSellRarities || []).filter(item => item !== rarity));
  const nextExtract = new Set((lootRules.autoExtractRarities || []).filter(item => item !== rarity));

  if (nextAction === "sell") nextSell.add(rarity);
  if (nextAction === "extract") nextExtract.add(rarity);

  return {
    autoSellRarities: [...nextSell],
    autoExtractRarities: [...nextExtract],
  };
}

export default function Inventory({ state, player, dispatch, canOpenCrafting = false, onOpenCrafting = null }) {
  const [pendingBulkSell, setPendingBulkSell] = useState(null);
  const [pendingSellId, setPendingSellId] = useState(null);
  const [detailItemId, setDetailItemId] = useState(null);
  const [showLootFilterModal, setShowLootFilterModal] = useState(false);
  const [showOnlyUpgrades, setShowOnlyUpgrades] = useState(false);
  const { isMobile } = useViewport();
  const previewStep = isMobile ? 10 : 16;
  const [inventoryVisibleCount, setInventoryVisibleCount] = useState(previewStep);
  const [dismissedOverflowEventId, setDismissedOverflowEventId] = useState(null);
  const isDarkMode = state?.settings?.theme === "dark";

  useEffect(() => {
    if (!pendingBulkSell) return undefined;
    const timer = setTimeout(() => setPendingBulkSell(null), 2200);
    return () => clearTimeout(timer);
  }, [pendingBulkSell]);

  useEffect(() => {
    if (!pendingSellId) return undefined;
    const timer = setTimeout(() => setPendingSellId(null), 2200);
    return () => clearTimeout(timer);
  }, [pendingSellId]);

  const inventory = player.inventory || [];
  const equipment = player.equipment || { weapon: null, armor: null };
  const onboardingStep = state?.onboarding?.step || null;
  const equipTutorialActive = onboardingStep === ONBOARDING_STEPS.EQUIP_FIRST_ITEM;
  const lockInventorySideActions = equipTutorialActive;
  const activeBuildTag = getPlayerBuildTag(player);
  const lootRules = state?.settings?.lootRules || {
    autoSellRarities: [],
    autoExtractRarities: [],
    minVisibleRarity: "common",
    huntPreset: null,
    protectHuntedDrops: true,
    protectUpgradeDrops: true,
    wishlistAffixes: [],
  };
  const currentEnemy = state?.combat?.enemy || null;
  const wishlistAffixes = useMemo(
    () => resolveLootRuleWishlist(lootRules, { activeBuildTag, enemy: currentEnemy }),
    [lootRules, activeBuildTag, currentEnemy]
  );
  const huntProfiles = useMemo(
    () => getHuntProfiles({ activeBuildTag, enemy: currentEnemy }),
    [activeBuildTag, currentEnemy]
  );
  const hasActiveHunt = wishlistAffixes.length > 0;
  const autoLootSummary = useMemo(
    () => summarizeLootRuleAutomation(lootRules),
    [lootRules]
  );
  const protectionSummary = [
    lootRules.protectHuntedDrops !== false && "Protege caza",
    lootRules.protectUpgradeDrops !== false && "Protege upgrades",
  ].filter(Boolean);
  const overflowEvent = state?.combat?.inventoryOverflowEvent || null;
  const overflowStats = state?.combat?.inventoryOverflowStats || { total: 0, displaced: 0, lost: 0 };
  const pendingOpenLootFilter = Boolean(state?.combat?.pendingOpenLootFilter);
  const activeBasicPreset = useMemo(
    () => BASIC_LOOT_FILTER_PRESETS.find(preset => (
      sameRarityList(lootRules.autoSellRarities || [], preset.lootRules.autoSellRarities || []) &&
      sameRarityList(lootRules.autoExtractRarities || [], preset.lootRules.autoExtractRarities || [])
    )) || null,
    [lootRules]
  );
  const visibleOverflowEvent = overflowEvent?.id && overflowEvent.id !== dismissedOverflowEventId
    ? overflowEvent
    : null;

  const sortedItems = useMemo(() => {
    const filteredItems = inventory.filter(item => {
      if (showOnlyUpgrades) {
        const compareItem = item.type === "weapon" ? equipment.weapon : equipment.armor;
        return (item.rating || 0) > (compareItem?.rating || 0);
      }
      return true;
    });

    return [...filteredItems].sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.level || 0) - (a.level || 0);
    });
  }, [inventory, showOnlyUpgrades, equipment]);
  const visibleSortedItems = sortedItems.slice(0, inventoryVisibleCount);
  const canShowMoreInventory = sortedItems.length > inventoryVisibleCount;
  const canShowLessInventory = sortedItems.length > previewStep && inventoryVisibleCount > previewStep;

  useEffect(() => {
    if (!equipTutorialActive) return undefined;
    setDetailItemId(null);
    return undefined;
  }, [equipTutorialActive]);

  useEffect(() => {
    if (!overflowEvent?.id) return;
    if (overflowEvent.id === dismissedOverflowEventId) return;
    setDismissedOverflowEventId(null);
  }, [dismissedOverflowEventId, overflowEvent]);

  useEffect(() => {
    if (!pendingOpenLootFilter) return;
    setShowLootFilterModal(true);
    dispatch({ type: "ACK_LOOT_FILTER_OPEN" });
  }, [dispatch, pendingOpenLootFilter]);

  useEffect(() => {
    setInventoryVisibleCount(previewStep);
  }, [previewStep, showOnlyUpgrades]);

  useEffect(() => {
    setInventoryVisibleCount(current => {
      if (sortedItems.length <= 0) return 0;
      return Math.min(Math.max(previewStep, current), sortedItems.length);
    });
  }, [sortedItems.length, previewStep]);

  useEffect(() => {
    if (!equipTutorialActive || sortedItems.length === 0) return undefined;

    let frameId = null;
    let timeoutId = null;
    let attempts = 0;

    const scrollTutorialItemIntoView = () => {
      const target = document.querySelector('[data-onboarding-target="tutorial-first-item"]');
      if (!(target instanceof HTMLElement)) {
        attempts += 1;
        if (attempts < 8) {
          timeoutId = window.setTimeout(() => {
            frameId = window.requestAnimationFrame(scrollTutorialItemIntoView);
          }, 90);
        }
        return;
      }

      const behavior = attempts === 0 ? "auto" : "smooth";
      const topSafe = isMobile ? 120 : 112;
      const bottomSafe = isMobile ? 92 : 28;
      const visibleBottom = Math.max(topSafe + 48, window.innerHeight - bottomSafe);

      target.scrollIntoView({
        behavior,
        block: "center",
        inline: "nearest",
      });

      const rect = target.getBoundingClientRect();
      if (rect.top < topSafe) {
        window.scrollBy({
          top: rect.top - topSafe - 10,
          behavior,
        });
      } else if (rect.bottom > visibleBottom) {
        window.scrollBy({
          top: rect.bottom - visibleBottom + 10,
          behavior,
        });
      }

      attempts += 1;
      if (attempts < 3) {
        timeoutId = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(scrollTutorialItemIntoView);
        }, 120);
      }
    };

    frameId = window.requestAnimationFrame(scrollTutorialItemIntoView);
    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [equipTutorialActive, isMobile, sortedItems]);

  const detailItem = [...inventory, ...(equipment.weapon ? [equipment.weapon] : []), ...(equipment.armor ? [equipment.armor] : [])]
    .find(item => item.id === detailItemId) || null;
  const detailItemLocation = detailItem ? getItemLocation(detailItem, equipment) : null;

  const bulkSellGroups = BULK_SELL_RARITIES.map(rarity => {
    const items = sortedItems.filter(item => item.rarity === rarity);
    return {
      rarity,
      items,
      gold: items.reduce((total, item) => total + (item.sellValue || 0), 0),
    };
  });

  const upgradeCount = inventory.filter(item => {
    const compareItem = item.type === "weapon" ? equipment.weapon : equipment.armor;
    return (item.rating || 0) > (compareItem?.rating || 0);
  }).length;

  return (
    <div style={{ padding: isMobile ? "0.9rem" : "1.25rem", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "0.9rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <style>{`
        @keyframes inventorySpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.24); }
          70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
          100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
        }
      `}</style>
      <header style={{ borderBottom: "1px solid var(--color-border-primary, #e2e8f0)", paddingBottom: "0.8rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.7rem", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>Mochila ({inventory.length}/50)</div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "2px" }}>
              {upgradeCount > 0 ? `${upgradeCount} upgrades potenciales · ordenado por poder` : "Ordenado por poder · toca un item para verlo completo"}
            </div>
          </div>
          {canOpenCrafting && typeof onOpenCrafting === "function" && (
            <button
              onClick={onOpenCrafting}
              disabled={lockInventorySideActions}
              style={{
                border: "1px solid var(--tone-accent, #4338ca)",
                background: "var(--tone-accent-soft, #eef2ff)",
                color: "var(--tone-accent, #4338ca)",
                borderRadius: "999px",
                padding: "8px 12px",
                fontSize: "0.68rem",
                fontWeight: "900",
                cursor: lockInventorySideActions ? "not-allowed" : "pointer",
                opacity: lockInventorySideActions ? 0.55 : 1,
                whiteSpace: "nowrap",
              }}
            >
              Abrir Forja
            </button>
          )}
        </div>
      </header>

      {visibleOverflowEvent && (
        <section
          style={{
            background: isDarkMode ? "rgba(245,158,11,0.12)" : "#fff7ed",
            border: "1px solid rgba(245,158,11,0.24)",
            borderRadius: "14px",
            padding: "12px",
            display: "grid",
            gap: "8px",
            boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                Mochila llena
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", marginTop: "4px" }}>
                {visibleOverflowEvent.incomingItemKept
                  ? `${visibleOverflowEvent.incomingItemName} entro y desplazó ${visibleOverflowEvent.droppedItemName}.`
                  : `${visibleOverflowEvent.incomingItemName} no entró y se perdió.`}
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={summaryPillStyle("warning", isDarkMode)}>
                {Math.max(0, Number(overflowStats.total || 0))} overflow
              </span>
              <span style={summaryPillStyle("muted", isDarkMode)}>
                {Math.max(0, Number(overflowStats.lost || 0))} perdidos
              </span>
              <span style={summaryPillStyle("warning", isDarkMode)}>
                Entra {getCompactRarityLabel(visibleOverflowEvent.incomingItemRarity)} · P {formatNumber(visibleOverflowEvent.incomingItemRating || 0)}
              </span>
              <span style={summaryPillStyle("muted", isDarkMode)}>
                Sale {getCompactRarityLabel(visibleOverflowEvent.droppedItemRarity)} · P {formatNumber(visibleOverflowEvent.droppedItemRating || 0)}
              </span>
            </div>
          </div>
          <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
            Si esto se repite, usa un preset rapido del filtro para vender o extraer rarezas bajas antes de llegar al cap.
          </div>
          <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", lineHeight: 1.35 }}>
            Regla activa: {autoLootSummary}.
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: isMobile ? "stretch" : "flex-end" }}>
            <button
              onClick={() => setShowLootFilterModal(true)}
              style={{
                ...lootActionButtonStyle(true, "extract", isDarkMode),
                padding: "8px 12px",
                minWidth: isMobile ? "100%" : "auto",
              }}
            >
              Abrir filtro
            </button>
            <button
              onClick={() => setDismissedOverflowEventId(visibleOverflowEvent.id)}
              style={{
                border: "1px solid var(--color-border-primary, #e2e8f0)",
                background: "var(--color-background-secondary, #fff)",
                color: "var(--color-text-secondary, #64748b)",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.66rem",
                fontWeight: "900",
                cursor: "pointer",
                minWidth: isMobile ? "100%" : "auto",
              }}
            >
              Cerrar
            </button>
          </div>
        </section>
      )}

      <section>
        <div style={{ ...sectionTitleStyle, marginBottom: "0.7rem" }}>Equipado</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
          <EquippedCard title="Arma" item={equipment.weapon} activeBuildTag={activeBuildTag} wishlistAffixes={wishlistAffixes} isDarkMode={isDarkMode} onOpen={() => equipment.weapon && setDetailItemId(equipment.weapon.id)} />
          <EquippedCard title="Armadura" item={equipment.armor} activeBuildTag={activeBuildTag} wishlistAffixes={wishlistAffixes} isDarkMode={isDarkMode} onOpen={() => equipment.armor && setDetailItemId(equipment.armor.id)} />
        </div>
      </section>

      <section>
        <div style={{ marginBottom: "0.8rem", background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "10px", display: "grid", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", flexWrap: "wrap" }}>
            <div>
              <div style={{ ...sectionTitleStyle, marginBottom: "2px" }}>Loot Filter</div>
              <div style={{ fontSize: "0.6rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", lineHeight: 1.3 }}>
                Accion rapida por rareza. El engranaje abre presets, caza y protecciones.
              </div>
            </div>
            <button
              onClick={() => setShowLootFilterModal(true)}
              disabled={lockInventorySideActions}
              style={gearButtonStyle(isDarkMode)}
            >
              <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>⚙</span>
              Ajustes
            </button>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={summaryPillStyle(hasActiveHunt ? "warning" : "muted", isDarkMode)}>
              {hasActiveHunt ? "Caza activa" : "Sin caza activa"}
            </span>
            <span style={summaryPillStyle(activeBasicPreset ? "accent" : "muted", isDarkMode)}>
              {activeBasicPreset ? activeBasicPreset.label : "Modo custom"}
            </span>
            {protectionSummary.length > 0 ? protectionSummary.map(label => (
              <span key={label} style={summaryPillStyle("success", isDarkMode)}>{label}</span>
            )) : <span style={summaryPillStyle("muted", isDarkMode)}>Sin protecciones</span>}
            <span style={summaryPillStyle("accent", isDarkMode)}>
              Ver desde {getCompactRarityLabel(lootRules.minVisibleRarity || "common")}
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {BASIC_LOOT_FILTER_PRESETS.map(preset => {
              const active = activeBasicPreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => dispatch({
                    type: "UPDATE_LOOT_RULES",
                    lootRules: preset.lootRules,
                  })}
                  disabled={lockInventorySideActions}
                  style={modalOptionPillStyle(active, isDarkMode)}
                  title={preset.summary}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: "0.6rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", lineHeight: 1.35 }}>
            {activeBasicPreset?.summary || "Ya estas usando una combinacion custom por rareza."}
          </div>
          <div style={{ fontSize: "0.6rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", lineHeight: 1.35 }}>
            {autoLootSummary}.
          </div>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
            {AUTO_LOOT_RARITIES.map(rarity => (
              <QuickLootRuleRow
                key={`loot-quick-${rarity}`}
                rarity={rarity}
                action={getLootAction(lootRules, rarity)}
                isDarkMode={isDarkMode}
                onChange={nextAction => dispatch({
                  type: "UPDATE_LOOT_RULES",
                  lootRules: buildLootRuleUpdateForRarity(lootRules, rarity, nextAction),
                })}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ ...sectionTitleStyle, marginBottom: 0 }}>Inventario</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowOnlyUpgrades(current => !current)}
              disabled={lockInventorySideActions}
              style={{
                border: "1px solid",
                borderColor: showOnlyUpgrades ? (isDarkMode ? "rgba(16,185,129,0.45)" : "#86efac") : "var(--color-border-primary, #e2e8f0)",
                background: showOnlyUpgrades ? (isDarkMode ? "rgba(4,120,87,0.18)" : "#ecfdf5") : "var(--color-background-secondary, #fff)",
                color: showOnlyUpgrades ? (isDarkMode ? "#6ee7b7" : "#166534") : "var(--color-text-secondary, #64748b)",
                borderRadius: "999px",
                padding: "5px 10px",
                fontSize: "0.62rem",
                fontWeight: "900",
                cursor: "pointer",
              }}
            >
              MEJOR
            </button>
            <span style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>{sortedItems.length} visibles</span>
          </div>
        </div>

        <div style={{ display: "grid", gap: "6px", marginBottom: "0.8rem" }}>
          <span style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #475569)", fontWeight: "900" }}>Vender por rareza (doble tap)</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px", minWidth: 0 }}>
          {bulkSellGroups.map(group => (
            <button
              key={group.rarity}
              onClick={() => {
                if (pendingBulkSell !== group.rarity) {
                  setPendingBulkSell(group.rarity);
                  return;
                }
                dispatch({ type: "SELL_ITEMS", itemIds: group.items.map(item => item.id) });
                setPendingBulkSell(null);
              }}
              disabled={lockInventorySideActions || group.items.length === 0}
              style={{
                ...bulkSellButtonStyle(group, pendingBulkSell === group.rarity, isDarkMode),
                cursor: lockInventorySideActions || group.items.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              <span style={{ display: "flex", justifyContent: "center" }}>
                <span style={rarityBadgeStyle(group.rarity)}>{getCompactRarityLabel(group.rarity)}</span>
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: "900", textAlign: "center", color: pendingBulkSell === group.rarity ? "inherit" : "var(--color-text-primary, #1e293b)" }}>
                {group.items.length > 0 ? group.items.length : "-"}
              </span>
              <span style={{ fontSize: "0.56rem", fontWeight: "800", textAlign: "center", color: pendingBulkSell === group.rarity ? "inherit" : "var(--color-text-secondary, #64748b)", whiteSpace: "nowrap" }}>
                {group.items.length > 0 ? `${formatNumber(group.gold)}g` : "-"}
              </span>
            </button>
          ))}
          </div>
        </div>

        {inventory.length === 0 ? (
          <div style={emptyStateStyle}>No tenes objetos en la mochila</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
              {visibleSortedItems.map(item => {
                const isTutorialItem = equipTutorialActive && sortedItems[0]?.id === item.id;
                return (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    tutorialTarget={isTutorialItem}
                    equippedCompare={item.type === "weapon" ? equipment.weapon : equipment.armor}
                    activeBuildTag={activeBuildTag}
                    wishlistAffixes={wishlistAffixes}
                    isDarkMode={isDarkMode}
                    isMobile={isMobile}
                    pendingSell={pendingSellId === item.id}
                    onOpen={() => setDetailItemId(item.id)}
                    onEquip={() => dispatch({ type: "EQUIP_ITEM", item })}
                    onSell={() => {
                      if (pendingSellId !== item.id) {
                        setPendingSellId(item.id);
                        return;
                      }
                      dispatch({ type: "SELL_ITEM", item });
                      setPendingSellId(null);
                    }}
                    lockInteractions={lockInventorySideActions}
                    spotlightEquip={isTutorialItem}
                  />
                );
              })}
            </div>
            {(canShowMoreInventory || canShowLessInventory) && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                {canShowMoreInventory && (
                  <button
                    onClick={() => setInventoryVisibleCount(current => Math.min(sortedItems.length, current + previewStep))}
                    style={quickActionButtonStyle("#fff", "#1d4ed8", "1px solid #bfdbfe")}
                  >
                    Ver mas ({sortedItems.length - inventoryVisibleCount})
                  </button>
                )}
                {canShowLessInventory && (
                  <button
                    onClick={() => setInventoryVisibleCount(previewStep)}
                    style={quickActionButtonStyle("#fff", "#64748b", "1px solid #cbd5e1")}
                  >
                    Ver menos
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {showLootFilterModal && (
        <LootFilterModal
          lootRules={lootRules}
          wishlistAffixes={wishlistAffixes}
          huntProfiles={huntProfiles}
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          onClose={() => setShowLootFilterModal(false)}
          onSelectPreset={profile => dispatch({
            type: "UPDATE_LOOT_RULES",
            lootRules: {
              huntPreset: profile.id,
              wishlistAffixes: profile.wishlistAffixes,
            },
          })}
          onClearWishlist={() => dispatch({ type: "UPDATE_LOOT_RULES", lootRules: { huntPreset: null, wishlistAffixes: [] } })}
          onToggleWishlistStat={stat => {
            const active = wishlistAffixes.includes(stat);
            const next = active ? wishlistAffixes.filter(item => item !== stat) : [...wishlistAffixes, stat];
            dispatch({ type: "UPDATE_LOOT_RULES", lootRules: { huntPreset: null, wishlistAffixes: next } });
          }}
          onToggleProtectHunted={() => dispatch({ type: "UPDATE_LOOT_RULES", lootRules: { protectHuntedDrops: !(lootRules.protectHuntedDrops !== false) } })}
          onToggleProtectUpgrade={() => dispatch({ type: "UPDATE_LOOT_RULES", lootRules: { protectUpgradeDrops: !(lootRules.protectUpgradeDrops !== false) } })}
          onSetMinVisibleRarity={rarity => dispatch({ type: "UPDATE_LOOT_RULES", lootRules: { minVisibleRarity: rarity } })}
        />
      )}

      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          equippedCompare={detailItem.type === "weapon" ? equipment.weapon : equipment.armor}
          wishlistAffixes={wishlistAffixes}
          isDarkMode={isDarkMode}
          onClose={() => setDetailItemId(null)}
          onEquip={() => dispatch({ type: "EQUIP_ITEM", item: detailItem })}
          onSell={() => dispatch({ type: "SELL_ITEM", item: detailItem })}
          canSell={!detailItemLocation}
          spotlightEquip={equipTutorialActive}
        />
      )}
    </div>
  );
}

function QuickLootRuleRow({ rarity, action, onChange, isDarkMode = false }) {
  return (
    <div style={{ border: "1px solid var(--color-border-primary, #e2e8f0)", borderTop: `3px solid ${getRarityColor(rarity)}`, borderRadius: "12px", padding: "8px", background: "var(--color-background-tertiary, #f8fafc)", display: "grid", gap: "8px", minWidth: "92px", flex: "0 0 92px" }}>
      <div style={{ minWidth: 0, textAlign: "center", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={rarityBadgeStyle(rarity)}>{getCompactRarityLabel(rarity)}</span>
        </div>
      </div>
      <div style={{ display: "grid", gap: "4px" }}>
        {LOOT_ACTION_OPTIONS.map(option => {
          const active = action === option.id;
          return (
            <button
              key={`${rarity}-${option.id}`}
              onClick={() => onChange(option.id)}
              style={lootActionButtonStyle(active, option.id, isDarkMode)}
              title={option.label}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LootFilterModal({
  lootRules,
  wishlistAffixes,
  huntProfiles,
  isDarkMode = false,
  isMobile = false,
  onClose,
  onSelectPreset,
  onClearWishlist,
  onToggleWishlistStat,
  onToggleProtectHunted,
  onToggleProtectUpgrade,
  onSetMinVisibleRarity,
}) {
  const dragStateRef = useRef({ active: false, startY: 0, pointerId: null });
  const sheetOffsetRef = useRef(0);
  const [sheetOffsetY, setSheetOffsetY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const dragCloseThreshold = 120;
  const backdropAlpha = isMobile
    ? Math.max(0.18, 0.55 - Math.min(sheetOffsetY, 260) / 700)
    : 0.55;

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const beginSheetDrag = event => {
    if (!isMobile) return;
    dragStateRef.current = {
      active: true,
      startY: event.clientY,
      pointerId: event.pointerId,
    };
    setIsDraggingSheet(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const updateSheetDrag = event => {
    if (!isMobile || !dragStateRef.current.active) return;
    const delta = Math.max(0, event.clientY - dragStateRef.current.startY);
    sheetOffsetRef.current = delta;
    setSheetOffsetY(delta);
    if (delta > 0) setIsDraggingSheet(true);
  };

  const endSheetDrag = event => {
    if (!isMobile || !dragStateRef.current.active) return;
    event.currentTarget.releasePointerCapture?.(dragStateRef.current.pointerId);
    const shouldClose = sheetOffsetRef.current >= dragCloseThreshold;
    dragStateRef.current = { active: false, startY: 0, pointerId: null };
    sheetOffsetRef.current = 0;
    setIsDraggingSheet(false);
    setSheetOffsetY(0);
    if (shouldClose) onClose();
  };

  return (
    <div style={{ ...modalWrapStyle, background: `rgba(15,23,42,${backdropAlpha})`, justifyContent: isMobile ? "flex-end" : "center", padding: isMobile ? "0" : "18px" }} onClick={onClose}>
      <div
        style={{
          ...lootFilterModalCardStyle(isMobile),
          transform: isMobile ? `translateY(${sheetOffsetY}px)` : "none",
          transition: isMobile && !isDraggingSheet ? "transform 180ms ease, box-shadow 180ms ease" : undefined,
        }}
        onClick={event => event.stopPropagation()}
      >
        {isMobile && (
          <div
            style={sheetDragHandleWrapStyle}
            onPointerDown={beginSheetDrag}
            onPointerMove={updateSheetDrag}
            onPointerUp={endSheetDrag}
            onPointerCancel={endSheetDrag}
          >
            <div style={sheetDragHandleStyle} />
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: "0.95rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>Ajustes de Loot</div>
            <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.4 }}>
              Presets, stats custom y protecciones. El selector rapido por rareza queda en la mochila.
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "var(--color-background-tertiary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", width: "32px", height: "32px", borderRadius: "999px", cursor: "pointer", fontWeight: "900" }}>×</button>
        </div>

        <div style={{ display: "grid", gap: "10px", maxHeight: isMobile ? "70vh" : "58vh", overflowY: "auto", paddingRight: isMobile ? 0 : "2px" }}>
          <section style={detailBlockStyle}>
            <div style={detailTitleStyle}>Preset de Caza</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {huntProfiles.map(profile => {
                const active = lootRules.huntPreset === profile.id || sameWishlist(profile.wishlistAffixes, wishlistAffixes);
                return (
                  <button
                    key={profile.id}
                    onClick={() => onSelectPreset(profile)}
                    style={modalOptionPillStyle(active, isDarkMode)}
                  >
                    {profile.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "8px", lineHeight: 1.4 }}>
              El preset activo define la caza por build o enemigo. Si tocas stats manuales abajo, pasas a modo custom.
            </div>
          </section>

          <section style={detailBlockStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              <div style={{ ...detailTitleStyle, marginBottom: 0 }}>Stats Cazados</div>
              {wishlistAffixes.length > 0 && (
                <button
                  onClick={onClearWishlist}
                  style={{ border: "none", background: "none", color: "var(--color-text-info, #2563eb)", fontSize: "0.62rem", fontWeight: "900", cursor: "pointer", padding: 0 }}
                >
                  Limpiar
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
              {wishlistAffixes.length > 0 ? wishlistAffixes.map(stat => (
                <button
                  key={`active-wish-${stat}`}
                  onClick={() => onToggleWishlistStat(stat)}
                  title="Quitar de la caza"
                  style={activeWishlistPillStyle(isDarkMode)}
                >
                  {STAT_LABELS[stat] || stat}
                </button>
              )) : (
                <span style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>
                  Sin caza activa
                </span>
              )}
            </div>

            <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginBottom: "8px", lineHeight: 1.4 }}>
              Toca un stat para agregarlo o quitarlo del filtro avanzado.
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {AVAILABLE_HUNT_STATS.map(stat => {
                const active = wishlistAffixes.includes(stat);
                return (
                  <button
                    key={`wish-${stat}`}
                    onClick={() => onToggleWishlistStat(stat)}
                    style={modalOptionPillStyle(active, isDarkMode)}
                  >
                    {STAT_LABELS[stat] || stat}
                  </button>
                );
              })}
            </div>
          </section>

          <section style={detailBlockStyle}>
            <div style={detailTitleStyle}>Protecciones</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button onClick={onToggleProtectHunted} style={togglePillStyle(lootRules.protectHuntedDrops !== false, isDarkMode)}>
                Proteger caza
              </button>
              <button onClick={onToggleProtectUpgrade} style={togglePillStyle(lootRules.protectUpgradeDrops !== false, isDarkMode)}>
                Proteger upgrades
              </button>
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "8px", lineHeight: 1.4 }}>
              Si una rareza entra en vender o extraer, los drops cazados y las mejoras claras pueden salvarse automaticamente.
            </div>
          </section>

          <section style={detailBlockStyle}>
            <div style={detailTitleStyle}>Visibilidad en combate</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {RARITY_VISIBILITY_OPTIONS.map(rarity => (
                <button
                  key={`visibility-${rarity}`}
                  onClick={() => onSetMinVisibleRarity(rarity)}
                  style={modalOptionPillStyle((lootRules.minVisibleRarity || "common") === rarity, isDarkMode)}
                >
                  Desde {getCompactRarityLabel(rarity)}
                </button>
              ))}
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "8px", lineHeight: 1.4 }}>
              Reduce ruido en el log de combate ocultando nombres de drops menores. Los drops importantes siguen visibles.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EquippedCard({ title, item, activeBuildTag, wishlistAffixes, isDarkMode = false, onOpen }) {
  if (!item) {
    return <div style={{ ...compactCardStyle, border: "1px dashed var(--color-border-secondary, #cbd5e1)", background: "var(--color-background-tertiary, #f8fafc)", color: "var(--color-text-tertiary, #94a3b8)", justifyContent: "center", minHeight: "76px" }}><span style={{ fontSize: "0.72rem", fontWeight: "900", letterSpacing: "0.05em", textTransform: "uppercase" }}>{title} vacio</span></div>;
  }

  const stats = getItemStats(item);
  const hasPerfect = (item.affixes || []).some(affix => affix.perfectRoll);
  const affixDots = getAffixDots(item);
  const implicitEntries = getImplicitEntries(item);
  const topStats = getPrioritizedStatEntries(stats, 2);
  const highlights = getCardHighlights(getLootHighlights({ item, equippedItem: item, activeBuildTag, wishlistAffixes })).slice(0, 2);
  const legendaryPower = getLegendaryPowerSummary(item);

  return (
    <div
      onClick={onOpen}
      style={{ ...compactCardStyle, borderLeft: `4px solid ${getRarityColor(item.rarity)}`, cursor: "pointer", gap: "8px" }}
      title="Ver detalle"
    >
      {hasPerfect && (
        <div style={{ position: "absolute", top: "6px", right: "8px", fontSize: "0.8rem", color: "var(--tone-warning, #f59e0b)", textShadow: "0 1px 8px rgba(245,158,11,0.4)" }}>★</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "0.72rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", marginBottom: "2px" }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={rarityBadgeStyle(item.rarity)}>{getCompactRarityLabel(item.rarity)}</span>
            <span style={itemGlyphStyle}>{getItemGlyph(item.name)}</span>
            <div style={{ fontWeight: "900", color: "var(--color-text-primary, #1e293b)", fontSize: "0.78rem", lineHeight: 1.2 }}>{item.name}</div>
            {(item.level || 0) > 0 && <span style={upgradeBadgeStyle(item.level)}>{`+${item.level}`}</span>}
            {legendaryPower && <span style={powerBadgeStyle(isDarkMode)}>{legendaryPower.shortLabel}</span>}
          </div>
          <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "2px" }}>
            {item.familyName || "Sin familia"}
          </div>
        </div>
        <span style={{ color: "var(--tone-warning, #f59e0b)", fontSize: "0.78rem", fontWeight: "900", whiteSpace: "nowrap" }}>P {formatNumber(item.rating || 0)}</span>
      </div>

      {highlights.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {highlights.map(highlight => <span key={highlight.id} style={highlightBadgeStyle(highlight.tone, isDarkMode)}>{highlight.label}</span>)}
        </div>
      )}

      {affixDots.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.52rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", marginRight: "2px" }}>
            Afijos
          </span>
          {affixDots.map(dot => (
            <span key={dot.key} title={dot.label} style={{ fontSize: "0.62rem", fontWeight: "900", color: dot.color }}>
              {dot.symbol}
            </span>
          ))}
        </div>
      )}

      {topStats.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {topStats.map(([key, value]) => (
            <div key={key} style={miniStatPillStyle}>
              {STAT_LABELS[key]} <strong style={{ color: "var(--color-text-primary, #1e293b)" }}>+{formatStatValue(key, value)}</strong>
            </div>
          ))}
        </div>
      )}
      {implicitEntries.length > 0 && <div style={{ fontSize: "0.62rem", color: "var(--color-text-info, #4338ca)", fontWeight: "800" }}>Implicito: {formatImplicitSummary(item)}</div>}
      <div style={{ fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", textTransform: "uppercase" }}>Toca para ver detalle</div>
    </div>
  );
}

function InventoryRow({ item, tutorialTarget = false, equippedCompare, activeBuildTag, wishlistAffixes, isDarkMode = false, isMobile = false, pendingSell, onOpen, onEquip, onSell, lockInteractions = false, spotlightEquip = false }) {
  const color = getRarityColor(item.rarity);
  const compareItem = equippedCompare || { bonus: {}, rating: 0 };
  const isBetter = (item.rating || 0) > (compareItem.rating || 0);
  const hasPerfect = (item.affixes || []).some(affix => affix.perfectRoll);
  const affixDots = getAffixDots(item);
  const implicitEntries = getImplicitEntries(item);
  const highlights = getCardHighlights(getLootHighlights({ item, equippedItem: equippedCompare, activeBuildTag, wishlistAffixes })).slice(0, 1);
  const compareEntries = getTopCompareEntries(item, compareItem, isMobile ? 2 : 3);
  const topStats = getPrioritizedStatEntries(item.bonus || {}, 2);
  const legendaryPower = getLegendaryPowerSummary(item);
  return (
    <div
      data-onboarding-target={tutorialTarget ? "tutorial-first-item" : undefined}
      style={{
        ...compactCardStyle,
        borderLeft: `4px solid ${color}`,
        gap: "8px",
        boxShadow: tutorialTarget
          ? "0 0 0 2px rgba(83,74,183,0.16), 0 10px 24px rgba(83,74,183,0.16)"
          : compactCardStyle.boxShadow,
        animation: tutorialTarget ? "inventorySpotlightPulse 1600ms ease-in-out infinite" : "none",
      }}
    >
      {hasPerfect && (
        <div style={{ position: "absolute", top: "6px", right: "8px", fontSize: "0.8rem", color: "var(--tone-warning, #f59e0b)", textShadow: "0 1px 8px rgba(245,158,11,0.4)" }}>★</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px" }}>
        <button onClick={lockInteractions ? undefined : onOpen} disabled={lockInteractions} style={{ flex: 1, minWidth: 0, textAlign: "left", border: "none", background: "none", padding: 0, cursor: lockInteractions ? "default" : "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={rarityBadgeStyle(item.rarity)}>{getCompactRarityLabel(item.rarity)}</span>
            <span style={itemGlyphStyle}>{getItemGlyph(item.name)}</span>
            <span style={{ fontWeight: "900", fontSize: "0.82rem", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.2 }}>{item.name}</span>
            {(item.level || 0) > 0 && <span style={upgradeBadgeStyle(item.level)}>{`+${item.level}`}</span>}
            {isBetter && <span style={betterBadgeStyle(isDarkMode)}>MEJOR</span>}
            {legendaryPower && <span style={powerBadgeStyle(isDarkMode)}>{legendaryPower.shortLabel}</span>}
          </div>
          <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "2px" }}>
            {item.familyName || "Sin familia"}
          </div>
        </button>
        <div style={{ color: "var(--tone-warning, #f59e0b)", fontWeight: "900", fontSize: "0.86rem", whiteSpace: "nowrap" }}>P {formatNumber(item.rating || 0)}</div>
      </div>

      {highlights.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {highlights.map(highlight => <span key={highlight.id} style={highlightBadgeStyle(highlight.tone, isDarkMode)}>{highlight.label}</span>)}
        </div>
      )}

      {affixDots.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.52rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", marginRight: "2px" }}>
            Afijos
          </span>
          {affixDots.map(dot => (
            <span key={dot.key} title={dot.label} style={{ fontSize: "0.62rem", fontWeight: "900", color: dot.color }}>
              {dot.symbol}
            </span>
          ))}
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--color-border-primary, #eef2f7)", paddingTop: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {(compareEntries.length > 0 ? compareEntries : topStats.map(([key, currentVal]) => ({ key, currentVal, diff: currentVal }))).map(entry => (
            <span
              key={`quick-${entry.key}`}
              style={{
                ...miniStatPillStyle,
                color: entry.diff > 0 ? "var(--tone-success-strong, #166534)" : entry.diff < 0 ? "var(--tone-danger, #D85A30)" : "var(--color-text-secondary, #64748b)",
                background: entry.diff > 0 ? "var(--tone-success-soft, #ecfdf5)" : entry.diff < 0 ? "var(--tone-danger-soft, #fff1f2)" : "var(--color-background-tertiary, #f1f5f9)",
              }}
            >
              {STAT_LABELS[entry.key]} <strong>{entry.diff !== 0 ? formatDiffValue(entry.key, entry.diff) : `+${formatStatValue(entry.key, entry.currentVal)}`}</strong>
            </span>
          ))}
        </div>
      </div>

      {implicitEntries.length > 0 && <div style={{ fontSize: "0.62rem", color: "var(--color-text-info, #4338ca)", fontWeight: "800" }}>Implicito: {formatImplicitSummary(item)}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button
          onClick={onEquip}
          data-onboarding-target={spotlightEquip ? "equip-item" : undefined}
          style={{
            ...btnBase,
            background: "var(--tone-accent-soft, #ede9fe)",
            color: "var(--tone-accent, #534AB7)",
            padding: "8px 10px",
            boxShadow: spotlightEquip ? "0 0 0 2px rgba(83,74,183,0.16), 0 8px 20px rgba(83,74,183,0.18)" : "none",
            animation: spotlightEquip ? "inventorySpotlightPulse 1600ms ease-in-out infinite" : "none",
          }}
        >
          EQUIPAR
        </button>
        <button onClick={lockInteractions ? undefined : onSell} disabled={lockInteractions} style={{ ...btnBase, background: pendingSell ? "#7f1d1d" : "var(--color-background-secondary, #ffffff)", color: pendingSell ? "#fff" : "#D85A30", border: `1px solid ${pendingSell ? "#ef4444" : "#D85A30"}`, opacity: lockInteractions ? 0.45 : 1, cursor: lockInteractions ? "not-allowed" : "pointer" }}>
          {pendingSell ? `CONFIRMAR ${formatNumber(item.sellValue || 0)}g` : `VENDER ${formatNumber(item.sellValue || 0)}g`}
        </button>
      </div>
    </div>
  );
}

function ItemDetailModal({ item, equippedCompare, wishlistAffixes = [], isDarkMode = false, onClose, onEquip, onSell, canSell = true, spotlightEquip = false }) {
  const [showAllAffixes, setShowAllAffixes] = useState(false);
  const compareItem = equippedCompare || { bonus: {}, rating: 0 };
  const stats = getItemStats(item);
  const affixes = getAffixEntries(item);
  const legendaryPower = getLegendaryPowerSummary(item);
  const visibleAffixes = showAllAffixes ? affixes : affixes.slice(0, 4);
  const forgeUsage = getCraftUsageSummary(item);

  return (
    <div style={modalWrapStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={event => event.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={rarityBadgeStyle(item.rarity)}>{getCompactRarityLabel(item.rarity)}</span>
              <span style={{ ...itemGlyphStyle, fontSize: "0.94rem" }}>{getItemGlyph(item.name)}</span>
              <div style={{ fontSize: "1rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900", marginTop: "2px" }}>{item.name}</div>
              {(item.level || 0) > 0 && <span style={upgradeBadgeStyle(item.level)}>{`+${item.level}`}</span>}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>{item.familyName || "Sin familia"} · Poder {formatNumber(item.rating || 0)} · Comparado con equipado: {formatNumber((item.rating || 0) - (equippedCompare?.rating || 0))}</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "var(--color-background-tertiary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", width: "32px", height: "32px", borderRadius: "999px", cursor: "pointer", fontWeight: "900" }}>×</button>
        </div>

        {legendaryPower && (
          <section style={{ ...detailBlockStyle, background: isDarkMode ? "rgba(124,58,237,0.14)" : "#faf5ff", borderColor: isDarkMode ? "rgba(196,181,253,0.28)" : "#ddd6fe" }}>
            <div style={{ ...detailTitleStyle, color: isDarkMode ? "#c4b5fd" : "#6d28d9" }}>Poder Legendario</div>
            <div style={{ fontSize: "0.78rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>{legendaryPower.name}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.4 }}>{legendaryPower.description}</div>
          </section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", maxHeight: "48vh", overflowY: "auto" }}>
          <section style={detailBlockStyle}>
            <div style={{ ...detailTitleStyle, marginBottom: "8px" }}>Tabla Completa</div>
            {(() => {
              const statKeys = Object.keys(STAT_LABELS).filter(key => (stats[key] || 0) > 0 || (compareItem.bonus?.[key] || 0) > 0);
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "7px" }}>
                  {[0, 1].map(columnIndex => (
                    <div key={columnIndex} style={{ border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "8px", padding: "6px", background: "var(--color-background-tertiary, #f8fafc)", display: "grid", gap: "6px", alignContent: "start" }}>
                      {statKeys.filter((_, index) => index % 2 === columnIndex).map(key => {
                        const currentVal = stats[key] || 0;
                        const equippedVal = compareItem.bonus?.[key] || 0;
                        const diff = currentVal - equippedVal;
                        return (
                          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", minWidth: 0 }}>
                            <span style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #475569)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{STAT_LABELS[key]}</span>
                            <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                              <span style={{ color: "var(--color-text-primary, #1e293b)", fontWeight: "900", fontSize: "0.66rem" }}>{formatStatValue(key, currentVal)}</span>
                              <span style={diffBadgeStyle(diff)}>{formatDiffValue(key, diff)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>

          {affixes.length > 0 && (
            <section style={detailBlockStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ ...detailTitleStyle, marginBottom: 0 }}>Afijos</div>
                {affixes.length > 4 && (
                  <button
                    onClick={() => setShowAllAffixes(current => !current)}
                    style={{ border: "1px solid var(--color-border-primary, #e2e8f0)", background: "var(--color-background-secondary, #fff)", color: "var(--color-text-secondary, #475569)", borderRadius: "999px", padding: "4px 8px", fontSize: "0.58rem", fontWeight: "900", cursor: "pointer" }}
                  >
                    {showAllAffixes ? "Ver menos" : `Ver ${affixes.length - 4} mas`}
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                {visibleAffixes.map((affix, index) => (
                  <div
                    key={`${affix.id}-${index}`}
                    style={{
                      border: affix.perfectRoll ? (isDarkMode ? "1px solid rgba(245,158,11,0.52)" : "1px solid #f59e0b") : "1px solid var(--color-border-primary, #e2e8f0)",
                      borderRadius: "10px",
                      padding: "8px",
                      background: affix.perfectRoll ? (isDarkMode ? "rgba(217,119,6,0.18)" : "#fffbeb") : affix.tier === 1 ? (isDarkMode ? "rgba(148,163,184,0.12)" : "#f8fafc") : "var(--color-background-secondary, #ffffff)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.74rem", color: "var(--color-text-primary, #1e293b)", fontWeight: "900" }}>{STAT_LABELS[affix.stat] || affix.stat}</div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.58rem", fontWeight: "900", color: affix.tier === 1 ? (isDarkMode ? "#fcd34d" : "#b45309") : "var(--color-text-secondary, #475569)", background: affix.tier === 1 ? (isDarkMode ? "rgba(217,119,6,0.24)" : "#fef3c7") : "var(--color-background-tertiary, #f1f5f9)", padding: "2px 6px", borderRadius: "999px" }}>T{affix.tier}</span>
                        {affix.perfectRoll && <span style={{ fontSize: "0.58rem", fontWeight: "900", color: isDarkMode ? "#fde68a" : "#a16207", background: isDarkMode ? "rgba(161,98,7,0.28)" : "#fefce8", padding: "2px 6px", borderRadius: "999px" }}>PERFECT</span>}
                        {wishlistAffixes.includes(affix.stat) && <span style={{ fontSize: "0.58rem", fontWeight: "900", color: isDarkMode ? "#5eead4" : "#0f766e", background: isDarkMode ? "rgba(13,148,136,0.24)" : "#ccfbf1", padding: "2px 6px", borderRadius: "999px" }}>WISHLIST</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: affix.perfectRoll ? "#b45309" : "var(--color-text-primary, #0f172a)", fontWeight: "900", marginTop: "4px" }}>+{formatStatValue(affix.stat, affix.rolledValue ?? affix.value ?? 0)}</div>
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>Rango del tier: {formatStatValue(affix.stat, affix.range?.min ?? 0)} - {formatStatValue(affix.stat, affix.range?.max ?? 0)}</div>
                    <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", marginTop: "3px" }}>{affix.kind === "prefix" ? "Prefijo" : "Sufijo"} · {affix.label || affix.tierLabel || `T${affix.tier}`}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={detailBlockStyle}>
            <div style={detailTitleStyle}>Limites de la Forja</div>
            <div style={detailRowStyle}><span>Rerolls</span><span style={{ fontWeight: "900" }}>{forgeUsage.reroll.used}/{forgeUsage.reroll.max}</span></div>
            <div style={detailRowStyle}><span>Reforjas</span><span style={{ fontWeight: "900" }}>{forgeUsage.reforge.used}/{forgeUsage.reforge.max}</span></div>
            <div style={detailRowStyle}><span>Pulido por linea</span><span style={{ fontWeight: "900" }}>{forgeUsage.polish.used}/{forgeUsage.polish.max}</span></div>
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "8px", lineHeight: 1.4 }}>
              El pulido consume el limite de la linea que estes mirando. Reroll y reforja comparten sus propios topes por item.
            </div>
          </section>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button
            onClick={onEquip}
            data-onboarding-target={spotlightEquip ? "equip-item" : undefined}
            style={{
              ...btnBase,
              background: "var(--tone-accent-soft, #ede9fe)",
              color: "var(--tone-accent, #534AB7)",
              padding: "10px",
              boxShadow: spotlightEquip ? "0 0 0 2px rgba(83,74,183,0.16), 0 8px 20px rgba(83,74,183,0.18)" : "none",
              animation: spotlightEquip ? "inventorySpotlightPulse 1600ms ease-in-out infinite" : "none",
            }}
          >
            EQUIPAR
          </button>
          <button
            onClick={onSell}
            disabled={!canSell}
            style={{ ...btnBase, background: canSell ? "var(--color-background-secondary, #fff)" : "var(--color-background-tertiary, #f8fafc)", color: canSell ? "#D85A30" : "var(--color-text-tertiary, #94a3b8)", border: `1px solid ${canSell ? "#D85A30" : "var(--color-border-primary, #e2e8f0)"}`, cursor: canSell ? "pointer" : "not-allowed" }}
          >
            {canSell ? `VENDER ${formatNumber(item.sellValue || 0)}g` : "ITEM EQUIPADO"}
          </button>
        </div>
      </div>
    </div>
  );
}

const compactCardStyle = { background: "var(--color-background-secondary, #ffffff)", borderRadius: "12px", padding: "10px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 1px 2px var(--color-shadow, rgba(0,0,0,0.05))", display: "flex", flexDirection: "column", gap: "8px", minWidth: 0, position: "relative" };
const miniStatPillStyle = { fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", background: "var(--color-background-tertiary, #f1f5f9)", padding: "2px 6px", borderRadius: "999px", lineHeight: 1.2 };
const itemGlyphStyle = { fontSize: "0.78rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)", flexShrink: 0 };
const rarityBadgeStyle = rarity => {
  const color = getRarityColor(rarity);
  return { fontSize: "0.54rem", fontWeight: "900", padding: "3px 7px", borderRadius: "999px", background: `${color}22`, color, border: `1px solid ${color}44`, lineHeight: 1.1, whiteSpace: "nowrap", flexShrink: 0 };
};
const upgradeBadgeStyle = level => {
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
const betterBadgeStyle = isDarkMode => ({ background: isDarkMode ? "rgba(22,163,74,0.22)" : "var(--tone-success-soft, #ecfdf5)", color: isDarkMode ? "var(--tone-success, #86efac)" : "var(--tone-success-strong, #166534)", fontSize: "0.54rem", padding: "2px 6px", borderRadius: "999px", fontWeight: "900", letterSpacing: "0.03em", border: `1px solid ${isDarkMode ? "rgba(34,197,94,0.44)" : "var(--tone-success, #bbf7d0)"}` });
const powerBadgeStyle = isDarkMode => ({ background: isDarkMode ? "rgba(124,58,237,0.22)" : "#faf5ff", color: isDarkMode ? "#ddd6fe" : "#6d28d9", fontSize: "0.54rem", padding: "2px 6px", borderRadius: "999px", fontWeight: "900", letterSpacing: "0.03em", border: `1px solid ${isDarkMode ? "rgba(196,181,253,0.35)" : "#ddd6fe"}` });
const gearButtonStyle = isDarkMode => ({
  border: "1px solid var(--color-border-secondary, #cbd5e1)",
  background: isDarkMode ? "rgba(30,41,59,0.55)" : "var(--color-background-secondary, #fff)",
  color: "var(--color-text-secondary, #475569)",
  borderRadius: "999px",
  padding: "6px 11px",
  fontSize: "0.62rem",
  fontWeight: "900",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
});
const summaryPillStyle = (tone, isDarkMode = false) => {
  const palette = {
    accent: isDarkMode
      ? { background: "rgba(30,64,175,0.18)", color: "#bfdbfe", border: "rgba(96,165,250,0.3)" }
      : { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    warning: isDarkMode
      ? { background: "rgba(154,52,18,0.28)", color: "#fdba74", border: "rgba(251,146,60,0.4)" }
      : { background: "#fff7ed", color: "#c2410c", border: "#fdba74" },
    success: isDarkMode
      ? { background: "rgba(13,148,136,0.18)", color: "#5eead4", border: "rgba(45,212,191,0.32)" }
      : { background: "#f0fdfa", color: "#0f766e", border: "#99f6e4" },
    muted: isDarkMode
      ? { background: "rgba(51,65,85,0.42)", color: "#cbd5e1", border: "rgba(148,163,184,0.3)" }
      : { background: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
  };
  const selected = palette[tone] || palette.muted;
  return {
    fontSize: "0.58rem",
    fontWeight: "900",
    padding: "4px 8px",
    borderRadius: "999px",
    background: selected.background,
    color: selected.color,
    border: `1px solid ${selected.border}`,
  };
};
const lootActionButtonStyle = (active, action, isDarkMode = false) => {
  const palette = {
    keep: isDarkMode
      ? { activeBg: "rgba(71,85,105,0.42)", activeColor: "#e2e8f0", activeBorder: "rgba(148,163,184,0.4)" }
      : { activeBg: "#f8fafc", activeColor: "#334155", activeBorder: "#cbd5e1" },
    sell: isDarkMode
      ? { activeBg: "rgba(154,52,18,0.28)", activeColor: "#fdba74", activeBorder: "rgba(251,146,60,0.4)" }
      : { activeBg: "#fff7ed", activeColor: "#c2410c", activeBorder: "#fdba74" },
    extract: isDarkMode
      ? { activeBg: "rgba(91,33,182,0.28)", activeColor: "#ddd6fe", activeBorder: "rgba(196,181,253,0.38)" }
      : { activeBg: "#faf5ff", activeColor: "#7c3aed", activeBorder: "#ddd6fe" },
  };
  const chosen = palette[action] || palette.keep;
  return {
    border: "1px solid",
    borderColor: active ? chosen.activeBorder : "var(--color-border-primary, #e2e8f0)",
    background: active ? chosen.activeBg : "var(--color-background-secondary, #fff)",
    color: active ? chosen.activeColor : "var(--color-text-secondary, #475569)",
    borderRadius: "8px",
    padding: "5px 0",
    fontSize: "0.56rem",
    fontWeight: "900",
    cursor: "pointer",
    width: "100%",
    textAlign: "center",
    lineHeight: 1,
  };
};
const bulkSellButtonStyle = (group, pending, isDarkMode = false) => ({
  border: "1px solid",
  borderColor: pending ? "#ef4444" : group.items.length > 0 ? (isDarkMode ? "rgba(148,163,184,0.35)" : "#e2e8f0") : "var(--color-border-primary, #e2e8f0)",
  background: pending ? (isDarkMode ? "rgba(153,27,27,0.18)" : "#fef2f2") : group.items.length > 0 ? "var(--color-background-secondary, #fff)" : "var(--color-background-tertiary, #f8fafc)",
  color: pending ? (isDarkMode ? "#fecaca" : "#b91c1c") : group.items.length > 0 ? "var(--color-text-secondary, #475569)" : "var(--color-text-tertiary, #94a3b8)",
  borderRadius: "10px",
  padding: "7px 7px",
  fontSize: "0.58rem",
  fontWeight: "900",
  display: "grid",
  gap: "4px",
  alignItems: "center",
  minWidth: 0,
  textAlign: "left",
  boxShadow: pending ? "0 0 0 1px rgba(239,68,68,0.1)" : "none",
});
const modalOptionPillStyle = (active, isDarkMode = false) => ({
  border: "1px solid",
  borderColor: active ? (isDarkMode ? "rgba(45,212,191,0.45)" : "#99f6e4") : "var(--color-border-primary, #e2e8f0)",
  background: active ? (isDarkMode ? "rgba(13,148,136,0.16)" : "#f0fdfa") : "var(--color-background-secondary, #fff)",
  color: active ? (isDarkMode ? "#5eead4" : "#115e59") : "var(--color-text-secondary, #475569)",
  borderRadius: "999px",
  padding: "6px 9px",
  fontSize: "0.62rem",
  fontWeight: "900",
  cursor: "pointer",
});
const activeWishlistPillStyle = isDarkMode => ({
  border: "1px solid rgba(45,212,191,0.35)",
  background: isDarkMode ? "rgba(13,148,136,0.16)" : "#f0fdfa",
  color: isDarkMode ? "#5eead4" : "#115e59",
  borderRadius: "999px",
  padding: "4px 8px",
  fontSize: "0.6rem",
  fontWeight: "900",
  cursor: "pointer",
});
const togglePillStyle = (active, isDarkMode = false) => ({
  border: "1px solid",
  borderColor: active ? (isDarkMode ? "rgba(45,212,191,0.45)" : "#99f6e4") : "var(--color-border-primary, #e2e8f0)",
  background: active ? (isDarkMode ? "rgba(13,148,136,0.16)" : "#f0fdfa") : "var(--color-background-secondary, #fff)",
  color: active ? (isDarkMode ? "#5eead4" : "#115e59") : "var(--color-text-secondary, #475569)",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "0.62rem",
  fontWeight: "900",
  cursor: "pointer",
});
const highlightBadgeStyle = (tone, isDarkMode = false) => {
  const palette = isDarkMode
    ? { legendary: { bg: "rgba(194,65,12,0.2)", color: "var(--tone-warning, #fdba74)", border: "rgba(251,146,60,0.45)" }, epic: { bg: "rgba(124,58,237,0.2)", color: "var(--tone-violet, #c4b5fd)", border: "rgba(167,139,250,0.45)" }, perfect: { bg: "rgba(161,98,7,0.2)", color: "var(--tone-warning, #fde68a)", border: "rgba(250,204,21,0.4)" }, t1: { bg: "rgba(37,99,235,0.2)", color: "var(--tone-info, #93c5fd)", border: "rgba(96,165,250,0.45)" }, upgrade: { bg: "rgba(4,120,87,0.22)", color: "var(--tone-success, #6ee7b7)", border: "rgba(16,185,129,0.42)" }, build: { bg: "rgba(3,105,161,0.22)", color: "var(--tone-info, #7dd3fc)", border: "rgba(56,189,248,0.4)" }, offense: { bg: "rgba(190,24,93,0.2)", color: "var(--tone-danger, #fda4af)", border: "rgba(244,114,182,0.42)" }, wishlist: { bg: "rgba(13,148,136,0.22)", color: "var(--tone-success, #5eead4)", border: "rgba(45,212,191,0.42)" }, enabler: { bg: "rgba(91,33,182,0.28)", color: "#ddd6fe", border: "rgba(196,181,253,0.42)" }, masterwork: { bg: "rgba(154,52,18,0.24)", color: "var(--tone-warning, #fdba74)", border: "rgba(251,146,60,0.42)" }, ascended: { bg: "rgba(250,204,21,0.18)", color: "#fde68a", border: "rgba(250,204,21,0.42)" }, forged: { bg: "rgba(67,56,202,0.24)", color: "var(--tone-accent, #c7d2fe)", border: "rgba(129,140,248,0.4)" }, crafted: { bg: "rgba(71,85,105,0.24)", color: "var(--color-text-tertiary, #cbd5e1)", border: "rgba(148,163,184,0.35)" } }
    : { legendary: { bg: "var(--tone-warning-soft, #fff8f1)", color: "var(--tone-danger, #9a3412)", border: "var(--tone-warning, #fed7aa)" }, epic: { bg: "var(--tone-violet-soft, #faf6ff)", color: "var(--tone-violet, #6d28d9)", border: "var(--tone-violet, #ddd6fe)" }, perfect: { bg: "var(--tone-warning-soft, #fffceb)", color: "#92400e", border: "var(--tone-warning, #fde68a)" }, t1: { bg: "var(--tone-info-soft, #f5f9ff)", color: "var(--tone-info, #1e40af)", border: "var(--tone-info, #bfdbfe)" }, upgrade: { bg: "var(--tone-success-soft, #f0fdf7)", color: "var(--tone-success-strong, #065f46)", border: "var(--tone-success, #bbf7d0)" }, build: { bg: "var(--tone-info-soft, #f0f9ff)", color: "var(--tone-info, #075985)", border: "var(--tone-info, #bae6fd)" }, offense: { bg: "var(--tone-danger-soft, #fff5f7)", color: "var(--tone-danger-strong, #9f1239)", border: "var(--tone-danger, #fecdd3)" }, wishlist: { bg: "var(--tone-success-soft, #f0fdfa)", color: "var(--tone-success-strong, #115e59)", border: "var(--tone-success, #99f6e4)" }, enabler: { bg: "#faf5ff", color: "#6d28d9", border: "#ddd6fe" }, masterwork: { bg: "var(--tone-warning-soft, #fff8f1)", color: "var(--tone-danger, #9a3412)", border: "var(--tone-warning, #fed7aa)" }, ascended: { bg: "#fffbeb", color: "#a16207", border: "#fcd34d" }, forged: { bg: "var(--tone-accent-soft, #f3f4ff)", color: "var(--tone-accent, #4338ca)", border: "var(--tone-accent, #c7d2fe)" }, crafted: { bg: "var(--tone-neutral-soft, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "var(--color-border-tertiary, #cbd5e1)" } };
  const chosen = palette[tone] || (isDarkMode ? { bg: "rgba(148,163,184,0.16)", color: "var(--color-text-tertiary, #cbd5e1)", border: "rgba(148,163,184,0.35)" } : { bg: "var(--tone-neutral-soft, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "var(--color-border-tertiary, #cbd5e1)" });
  return { fontSize: "0.56rem", fontWeight: "900", color: chosen.color, background: chosen.bg, border: `1px solid ${chosen.border}`, padding: "3px 7px", borderRadius: "999px" };
};
const btnBase = { border: "none", borderRadius: "10px", padding: "10px", fontSize: "0.68rem", cursor: "pointer", fontWeight: "900", textAlign: "center" };
const quickActionButtonStyle = (background, color, border) => ({
  border: border || "1px solid var(--color-border-primary, #e2e8f0)",
  background,
  color,
  borderRadius: "999px",
  padding: "7px 10px",
  fontSize: "0.64rem",
  fontWeight: "900",
  cursor: "pointer",
});
const sectionTitleStyle = { fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginBottom: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "800" };
const emptyStateStyle = { textAlign: "center", padding: "2rem 1rem", color: "var(--color-text-tertiary, #94a3b8)", border: "2px dashed var(--color-border-primary, #e2e8f0)", borderRadius: "12px", fontSize: "0.82rem", background: "var(--color-background-tertiary, #f8fafc)" };
const modalWrapStyle = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "18px", zIndex: 7000 };
const modalCardStyle = { width: "min(760px, 100%)", maxHeight: "85vh", background: "var(--color-background-secondary, #fff)", borderRadius: "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 20px 50px rgba(15,23,42,0.25)", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" };
const lootFilterModalCardStyle = isMobile => ({
  width: isMobile ? "100%" : "min(720px, 100%)",
  maxHeight: isMobile ? "88vh" : "82vh",
  background: "var(--color-background-secondary, #fff)",
  borderRadius: isMobile ? "18px 18px 0 0" : "18px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});
const sheetDragHandleWrapStyle = {
  display: "flex",
  justifyContent: "center",
  paddingTop: "2px",
  paddingBottom: "2px",
  cursor: "grab",
  touchAction: "none",
};
const sheetDragHandleStyle = {
  width: "42px",
  height: "5px",
  borderRadius: "999px",
  background: "rgba(148,163,184,0.65)",
};
const detailBlockStyle = { background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "10px" };
const detailTitleStyle = { fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", fontWeight: "900", letterSpacing: "0.06em", marginBottom: "8px" };
const detailRowStyle = { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", padding: "3px 0" };
const diffBadgeStyle = diff => ({ fontSize: "0.62rem", color: diff > 0 ? "var(--tone-success, #1D9E75)" : diff < 0 ? "var(--tone-danger, #D85A30)" : "var(--color-text-tertiary, #94a3b8)", background: diff > 0 ? "var(--tone-success-soft, #ecfdf5)" : diff < 0 ? "var(--tone-danger-soft, #fff1f2)" : "var(--color-background-tertiary, #f1f5f9)", padding: "2px 5px", borderRadius: "6px", fontWeight: "900" });


