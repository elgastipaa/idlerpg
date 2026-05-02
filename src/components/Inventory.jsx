import React, { useEffect, useMemo, useRef, useState } from "react";
import useViewport from "../hooks/useViewport";
import ForgeIcon from "./icons/ForgeIcon";
import { FlBadge, FlButton, FlEmptyState, FlHeroModule, FlItemRow, FlPanel, FlPanelHeader, FlTag } from "./ui/forge";
import { getPlayerBuildTag } from "../utils/buildIdentity";
import {
  AVAILABLE_HUNT_STATS,
  getHuntProfiles,
  resolveLootRuleWishlist,
  sanitizeLootRules,
  summarizeLootRuleAutomation,
} from "../utils/lootFilter";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
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
import { getCompactRarityLabel, getItemGlyph } from "../utils/itemVisuals";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";

const BULK_SELL_RARITIES = ["common", "magic", "rare", "epic"];
const AUTO_LOOT_RARITIES = ["common", "magic", "rare", "epic"];
const RARITY_VISIBILITY_OPTIONS = ["common", "magic", "rare", "epic", "legendary"];
const LOOT_ACTION_OPTIONS = [
  { id: "keep", label: "Guardar" },
  { id: "sell", label: "Vender" },
];
const BASIC_LOOT_FILTER_PRESETS = [
  {
    id: "keep_all",
    label: "Guardar todo",
    summary: "No vende nada automaticamente.",
    lootRules: { autoSellRarities: [], autoExtractRarities: [] },
  },
  {
    id: "sell_low",
    label: "Vender C/M",
    summary: "Limpia common y magic. Rare+ queda manual.",
    lootRules: { autoSellRarities: ["common", "magic"], autoExtractRarities: [] },
  },
];
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
  if ((lootRules.autoSellRarities || []).includes(rarity)) return "sell";
  return "keep";
}

function buildLootRuleUpdateForRarity(lootRules = {}, rarity, nextAction) {
  const nextSell = new Set((lootRules.autoSellRarities || []).filter(item => item !== rarity));

  if (nextAction === "sell") nextSell.add(rarity);

  return {
    autoSellRarities: [...nextSell],
    autoExtractRarities: [],
  };
}

export default function Inventory({ state, player, dispatch }) {
  const [pendingBulkSell, setPendingBulkSell] = useState(null);
  const [pendingSellId, setPendingSellId] = useState(null);
  const [detailItemId, setDetailItemId] = useState(null);
  const [showLootFilterModal, setShowLootFilterModal] = useState(false);
  const [showOnlyUpgrades, setShowOnlyUpgrades] = useState(false);
  const { isMobile } = useViewport();
  const previewStep = isMobile ? 10 : 16;
  const [inventoryVisibleCount, setInventoryVisibleCount] = useState(previewStep);
  const [dismissedOverflowEventId, setDismissedOverflowEventId] = useState(null);

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
  const lootRules = sanitizeLootRules(state?.settings?.lootRules || {
    autoSellRarities: [],
    autoExtractRarities: [],
    minVisibleRarity: "common",
    huntPreset: null,
    protectHuntedDrops: true,
    protectUpgradeDrops: true,
    wishlistAffixes: [],
  });
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
    <div className="inventory-root inventory-root--forge-light">
      <FlHeroModule
        variant="sanctuary-v2"
        className="fl-inventory-hero"
        eyebrow="Arsenal personal"
        title={`Mochila (${inventory.length}/50)`}
        subtitle={upgradeCount > 0 ? `${upgradeCount} upgrades potenciales · ordenado por poder` : "Ordenado por poder · toca un item para verlo completo"}
        end={(
          <FlButton
            className="fl-inventory-hero-cta"
            variant="default"
            size="sm"
            onClick={() => dispatch({ type: "SET_TAB", tab: "combat" })}
            icon={<ForgeIcon name="combat" size={14} />}
          >
            Volver al combate
          </FlButton>
        )}
      />

      {visibleOverflowEvent && (
        <section className="fl-inline-note fl-inventory-overflow-note">
          <div className="fl-inventory-overflow-header">
            <div>
              <div className="fl-inventory-overflow-eyebrow">
                Mochila llena
              </div>
              <div className="fl-inventory-overflow-title">
                {visibleOverflowEvent.incomingItemKept
                  ? `${visibleOverflowEvent.incomingItemName} entro y desplazó ${visibleOverflowEvent.droppedItemName}.`
                  : `${visibleOverflowEvent.incomingItemName} no entró y se perdió.`}
              </div>
            </div>
            <div className="fl-inventory-overflow-tags">
              <FlTag tone="warning" size="xs">
                {Math.max(0, Number(overflowStats.total || 0))} overflow
              </FlTag>
              <FlTag size="xs">
                {Math.max(0, Number(overflowStats.lost || 0))} perdidos
              </FlTag>
              <FlTag tone="warning" size="xs">
                Entra {getCompactRarityLabel(visibleOverflowEvent.incomingItemRarity)} · P {formatNumber(visibleOverflowEvent.incomingItemRating || 0)}
              </FlTag>
              <FlTag size="xs">
                Sale {getCompactRarityLabel(visibleOverflowEvent.droppedItemRarity)} · P {formatNumber(visibleOverflowEvent.droppedItemRating || 0)}
              </FlTag>
            </div>
          </div>
          <div className="fl-inventory-overflow-copy">
            Si esto se repite, usa un preset rapido del filtro para vender rarezas bajas antes de llegar al cap.
          </div>
          <div className="fl-inventory-overflow-summary">
            Regla activa: {autoLootSummary}.
          </div>
          <div className="overlay-responsive-buttons">
            <FlButton
              variant="default"
              size="sm"
              onClick={() => setShowLootFilterModal(true)}
            >
              Abrir filtro
            </FlButton>
            <FlButton
              variant="secondary"
              size="sm"
              onClick={() => setDismissedOverflowEventId(visibleOverflowEvent.id)}
            >
              Cerrar
            </FlButton>
          </div>
        </section>
      )}

      <FlPanel
        variant="compact"
        className="fl-inventory-equipped-panel"
        header={<FlPanelHeader title="Equipado" />}
      >
        <div className="fl-inventory-equipped-list overlay-cols-1-2">
          <EquippedCard title="Arma" item={equipment.weapon} onOpen={() => equipment.weapon && setDetailItemId(equipment.weapon.id)} />
          <EquippedCard title="Armadura" item={equipment.armor} onOpen={() => equipment.armor && setDetailItemId(equipment.armor.id)} />
        </div>
      </FlPanel>

      <section>
        <FlPanel
          variant="compact"
          className="fl-inventory-loot-filter-panel"
          header={(
            <FlPanelHeader
              title="Filtro de Loot"
              copy="Accion rapida por rareza. El engranaje abre presets, caza y protecciones."
              actions={(
                <FlButton
                  variant="secondary"
                  size="xs"
                  className="fl-inventory-gear-button"
                  onClick={() => setShowLootFilterModal(true)}
                  disabled={lockInventorySideActions}
                >
                  <ForgeIcon name="forge" size={16} />
                  Ajustes
                </FlButton>
              )}
            />
          )}
        >
          <div className="fl-inventory-filter-pills">
            <FlTag tone={hasActiveHunt ? "warning" : "neutral"} size="xs">
              {hasActiveHunt ? "Caza activa" : "Sin caza activa"}
            </FlTag>
            <FlTag tone={activeBasicPreset ? "arcane" : "neutral"} size="xs">
              {activeBasicPreset ? activeBasicPreset.label : "Modo custom"}
            </FlTag>
            {protectionSummary.length > 0 ? protectionSummary.map(label => (
              <FlTag key={label} tone="success" size="xs">{label}</FlTag>
            )) : <FlTag size="xs">Sin protecciones</FlTag>}
            <FlTag tone="arcane" size="xs">
              Ver desde {getCompactRarityLabel(lootRules.minVisibleRarity || "common")}
            </FlTag>
          </div>
          <div className="fl-inventory-filter-presets">
            {BASIC_LOOT_FILTER_PRESETS.map(preset => {
              const active = activeBasicPreset?.id === preset.id;
              return (
                <FlButton
                  variant={active ? "default" : "secondary"}
                  size="xs"
                  className="fl-inventory-preset-button"
                  key={preset.id}
                  onClick={() => dispatch({
                    type: "UPDATE_LOOT_RULES",
                    lootRules: preset.lootRules,
                  })}
                  disabled={lockInventorySideActions}
                  selected={active}
                  title={preset.summary}
                >
                  {preset.label}
                </FlButton>
              );
            })}
          </div>
          <div className="fl-inventory-filter-summary fl-inventory-filter-summary--muted">
            {activeBasicPreset?.summary || "Ya estas usando una combinacion custom por rareza."}
          </div>
          <div className="fl-inventory-filter-summary">
            {autoLootSummary}.
          </div>
          <div className="fl-inventory-filter-rarity-row">
            {AUTO_LOOT_RARITIES.map(rarity => (
              <QuickLootRuleRow
                key={`loot-quick-${rarity}`}
                rarity={rarity}
                action={getLootAction(lootRules, rarity)}
                onChange={nextAction => dispatch({
                  type: "UPDATE_LOOT_RULES",
                  lootRules: buildLootRuleUpdateForRarity(lootRules, rarity, nextAction),
                })}
              />
            ))}
          </div>
        </FlPanel>

        <div className="fl-inventory-list-head">
          <div className="fl-inventory-list-title-row">
            <span className="fl-inventory-section-mark" aria-hidden="true"><ForgeIcon name="shop" size={22} /></span>
            <div className="fl-inventory-section-title">Inventario</div>
          </div>
          <div className="fl-inventory-list-head-actions">
            <FlButton
              variant={showOnlyUpgrades ? "success" : "secondary"}
              size="xs"
              className="fl-inventory-filter-toggle"
              onClick={() => setShowOnlyUpgrades(current => !current)}
              disabled={lockInventorySideActions}
            >
              MEJOR
            </FlButton>
            <span className="fl-inventory-visible-count">{sortedItems.length} visibles</span>
          </div>
        </div>

        <div className="fl-inventory-bulk-panel">
          <span className="fl-inventory-bulk-caption">Vender por rareza (doble tap)</span>
          <div className="fl-inventory-bulk-grid">
          {bulkSellGroups.map(group => (
            <FlPanel
              as="button"
              type="button"
              variant="compact"
              className={[
                "fl-inventory-bulk-panel-card",
                pendingBulkSell === group.rarity ? "is-pending" : "",
                group.items.length === 0 ? "is-empty" : "",
              ].filter(Boolean).join(" ")}
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
              data-rarity={group.rarity}
              header={(
                <div className="fl-inventory-rarity-head">
                  <span className="fl-inventory-rarity-diamond" aria-hidden="true"><ForgeIcon name="essence" size={17} /></span>
                  <FlBadge variant="rect" size="xs" rarity={group.rarity} className="fl-item-row__rarity">
                    {getCompactRarityLabel(group.rarity)}
                  </FlBadge>
                </div>
              )}
            >
              <span className="fl-inventory-bulk-value">
                {group.items.length > 0 ? group.items.length : "-"}
              </span>
              <span className="fl-inventory-bulk-gold">
                {group.items.length > 0 ? `${formatNumber(group.gold)}g` : "-"}
              </span>
            </FlPanel>
          ))}
          </div>
        </div>

        {inventory.length === 0 ? (
          <FlEmptyState
            className="fl-inventory-empty-state"
            icon="inventory"
            title="Sin items"
            detail="El inventario esta vacio. Los drops aparecen aca durante la expedicion."
          />
        ) : (
          <>
            <div className="overlay-cols-1-2 fl-inventory-item-grid">
              {visibleSortedItems.map(item => {
                const isTutorialItem = equipTutorialActive && sortedItems[0]?.id === item.id;
                return (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    tutorialTarget={isTutorialItem}
                    equippedCompare={item.type === "weapon" ? equipment.weapon : equipment.armor}
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
              <div className="fl-inventory-pagination-row">
                {canShowMoreInventory && (
                  <FlButton
                    variant="secondary"
                    size="xs"
                    onClick={() => setInventoryVisibleCount(current => Math.min(sortedItems.length, current + previewStep))}
                  >
                    Ver mas ({sortedItems.length - inventoryVisibleCount})
                  </FlButton>
                )}
                {canShowLessInventory && (
                  <FlButton
                    variant="secondary"
                    size="xs"
                    onClick={() => setInventoryVisibleCount(previewStep)}
                  >
                    Ver menos
                  </FlButton>
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

function QuickLootRuleRow({ rarity, action, onChange }) {
  return (
    <FlPanel
      variant="compact"
      className="fl-inventory-loot-rule-panel"
      data-rarity={rarity}
      header={(
        <div className="fl-inventory-loot-rule-head">
          <div className="fl-inventory-rarity-head">
            <span className="fl-inventory-rarity-diamond" aria-hidden="true"><ForgeIcon name="essence" size={19} /></span>
            <FlBadge variant="rect" size="xs" rarity={rarity} className="fl-item-row__rarity">
              {getCompactRarityLabel(rarity)}
            </FlBadge>
          </div>
        </div>
      )}
    >
      <div className="fl-inventory-loot-rule-actions">
        {LOOT_ACTION_OPTIONS.map(option => {
          const active = action === option.id;
          return (
            <button
              className={[
                "fl-inventory-rule-action",
                `fl-inventory-rule-action--${option.id}`,
                active ? "is-active" : "",
              ].filter(Boolean).join(" ")}
              key={`${rarity}-${option.id}`}
              onClick={() => onChange(option.id)}
              title={option.label}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </FlPanel>
  );
}

function LootFilterModal({
  lootRules,
  wishlistAffixes,
  huntProfiles,
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
    <div
      className={`fl-inventory-loot-modal-backdrop${isMobile ? " is-mobile" : ""}`}
      style={{ "--inventory-loot-backdrop-alpha": backdropAlpha }}
      onClick={onClose}
    >
      <div
        className={`fl-inline-modal fl-inventory-loot-modal-card${isMobile ? " is-mobile" : ""}${isDraggingSheet ? " is-dragging" : ""}`}
        style={{ "--inventory-loot-sheet-offset": `${sheetOffsetY}px` }}
        onClick={event => event.stopPropagation()}
      >
        {isMobile && (
          <div
            className="fl-inventory-loot-modal-drag-handle-wrap"
            onPointerDown={beginSheetDrag}
            onPointerMove={updateSheetDrag}
            onPointerUp={endSheetDrag}
            onPointerCancel={endSheetDrag}
          >
            <div className="fl-inventory-loot-modal-drag-handle" />
          </div>
        )}
        <div className="fl-inventory-loot-modal-header">
          <div>
            <div className="fl-inventory-loot-modal-title">Ajustes de Loot</div>
            <div className="fl-inventory-loot-modal-copy">
              Presets, stats custom y protecciones. El selector rapido por rareza queda en la mochila.
            </div>
          </div>
          <button className="fl-inventory-loot-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="fl-inventory-loot-modal-body">
          <section className="fl-inventory-loot-modal-section">
            <div className="fl-inventory-loot-modal-section-title">Preset de Caza</div>
            <div className="fl-inventory-loot-modal-chip-row">
              {huntProfiles.map(profile => {
                const active = lootRules.huntPreset === profile.id || sameWishlist(profile.wishlistAffixes, wishlistAffixes);
                return (
                  <button
                    className={`fl-inventory-modal-pill${active ? " is-active" : ""}`}
                    key={profile.id}
                    onClick={() => onSelectPreset(profile)}
                  >
                    {profile.label}
                  </button>
                );
              })}
            </div>
            <div className="fl-inventory-loot-modal-help">
              El preset activo define la caza por build o enemigo. Si tocas stats manuales abajo, pasas a modo custom.
            </div>
          </section>

          <section className="fl-inventory-loot-modal-section">
            <div className="fl-inventory-loot-modal-section-head">
              <div className="fl-inventory-loot-modal-section-title">Stats Cazados</div>
              {wishlistAffixes.length > 0 && (
                <button
                  className="fl-inventory-loot-modal-clear"
                  onClick={onClearWishlist}
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="fl-inventory-loot-modal-chip-row fl-inventory-loot-modal-chip-row--selected">
              {wishlistAffixes.length > 0 ? wishlistAffixes.map(stat => (
                <button
                  className="fl-inventory-modal-pill fl-inventory-modal-pill--success"
                  key={`active-wish-${stat}`}
                  onClick={() => onToggleWishlistStat(stat)}
                  title="Quitar de la caza"
                >
                  {STAT_LABELS[stat] || stat}
                </button>
              )) : (
                <span className="fl-inventory-loot-modal-empty">
                  Sin caza activa
                </span>
              )}
            </div>

            <div className="fl-inventory-loot-modal-help fl-inventory-loot-modal-help--mb">
              Toca un stat para agregarlo o quitarlo del filtro avanzado.
            </div>
            <div className="fl-inventory-loot-modal-chip-row">
              {AVAILABLE_HUNT_STATS.map(stat => {
                const active = wishlistAffixes.includes(stat);
                return (
                  <button
                    className={`fl-inventory-modal-pill${active ? " is-active" : ""}`}
                    key={`wish-${stat}`}
                    onClick={() => onToggleWishlistStat(stat)}
                  >
                    {STAT_LABELS[stat] || stat}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="fl-inventory-loot-modal-section">
            <div className="fl-inventory-loot-modal-section-title">Protecciones</div>
            <div className="fl-inventory-loot-modal-chip-row">
              <button
                className={`fl-inventory-modal-pill${lootRules.protectHuntedDrops !== false ? " is-active" : ""}`}
                onClick={onToggleProtectHunted}
              >
                Proteger caza
              </button>
              <button
                className={`fl-inventory-modal-pill${lootRules.protectUpgradeDrops !== false ? " is-active" : ""}`}
                onClick={onToggleProtectUpgrade}
              >
                Proteger upgrades
              </button>
            </div>
            <div className="fl-inventory-loot-modal-help">
              Si una rareza entra en vender, los drops cazados y las mejoras claras pueden salvarse automaticamente.
            </div>
          </section>

          <section className="fl-inventory-loot-modal-section">
            <div className="fl-inventory-loot-modal-section-title">Visibilidad en combate</div>
            <div className="fl-inventory-loot-modal-chip-row">
              {RARITY_VISIBILITY_OPTIONS.map(rarity => (
                <button
                  className={`fl-inventory-modal-pill${(lootRules.minVisibleRarity || "common") === rarity ? " is-active" : ""}`}
                  key={`visibility-${rarity}`}
                  onClick={() => onSetMinVisibleRarity(rarity)}
                >
                  Desde {getCompactRarityLabel(rarity)}
                </button>
              ))}
            </div>
            <div className="fl-inventory-loot-modal-help">
              Reduce ruido en el log de combate ocultando nombres de drops menores. Los drops importantes siguen visibles.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EquippedCard({ title, item, onOpen }) {
  if (!item) {
    return (
      <div className="fl-inventory-equipped-card fl-inventory-equipped-card--empty fl-inventory-equipped-empty-shell">
        <span className="fl-inventory-equipped-empty-label">{title} vacio</span>
      </div>
    );
  }

  const stats = getItemStats(item);
  const affixDots = getAffixDots(item);
  const implicitEntries = getImplicitEntries(item);
  const topStats = getPrioritizedStatEntries(stats, 2);
  const statLines = topStats.map(([key, value]) => ({
    id: `eq-${key}`,
    label: STAT_LABELS[key] || key,
    value: `+${formatStatValue(key, value)}`,
  }));
  const slotLabel = item.type === "weapon" ? "Sword" : item.type === "armor" ? "Armor" : title;
  const typeLabel = `${slotLabel} · AFIJOS ${affixDots.length > 0 ? affixDots.map(dot => dot.symbol).join("") : "—"}`;
  const implicit = implicitEntries.length > 0 ? `Implícito: ${formatImplicitSummary(item)}` : "";

  return (
    <div className="fl-inventory-equipped-row-shell">
      <FlItemRow
        variant="equipped"
        item={item}
        state="equipped"
        className="fl-inventory-equipped-row"
        name={item.name}
        rarityLabel={getCompactRarityLabel(item.rarity)}
        statusLabel="EQUIPADO"
        typeLabel={typeLabel}
        statLines={statLines}
        implicitLabel={implicit}
        powerValue={formatNumber(item.rating || 0)}
        onClick={onOpen}
        onPrimaryAction={onOpen}
        primaryActionLabel="DETALLE"
        primaryActionVariant="default"
      />
    </div>
  );
}

function InventoryRow({ item, tutorialTarget = false, equippedCompare, isMobile = false, pendingSell, onOpen, onEquip, onSell, lockInteractions = false, spotlightEquip = false }) {
  const compareItem = equippedCompare || { bonus: {}, rating: 0 };
  const isBetter = (item.rating || 0) > (compareItem.rating || 0);
  const affixDots = getAffixDots(item);
  const implicitEntries = getImplicitEntries(item);
  const compareEntries = getTopCompareEntries(item, compareItem, isMobile ? 2 : 2);
  const fallbackStats = getPrioritizedStatEntries(item.bonus || {}, 2);
  const statLines = (compareEntries.length > 0 ? compareEntries : fallbackStats.map(([key, currentVal]) => ({
    key,
    currentVal,
    equippedVal: 0,
    diff: currentVal,
  }))).map(entry => {
    const isNewStat = Number(entry.equippedVal || 0) <= 0 && Number(entry.currentVal || 0) > 0;
    const deltaTone = isNewStat ? "new" : entry.diff > 0 ? "pos" : entry.diff < 0 ? "neg" : "neu";
    const deltaLabel = isNewStat ? "Nuevo" : entry.diff !== 0 ? formatDiffValue(entry.key, entry.diff) : "—";
    return {
      id: `cmp-${entry.key}`,
      label: STAT_LABELS[entry.key] || entry.key,
      value: `+${formatStatValue(entry.key, entry.currentVal)}`,
      deltaLabel,
      deltaTone,
    };
  });
  const slotLabel = item.type === "weapon" ? "Sword" : item.type === "armor" ? "Armor" : "Item";
  const typeLabel = `${slotLabel} · AFIJOS ${affixDots.length > 0 ? affixDots.map(dot => dot.symbol).join("") : "—"}`;
  const implicit = implicitEntries.length > 0 ? `Implicito: ${formatImplicitSummary(item)}` : "";
  const rowState = pendingSell ? "sell-pending" : isBetter ? "upgrade" : "";
  const secondaryActionLabel = pendingSell
    ? (isMobile ? "CONFIRMAR" : `CONFIRMAR ${formatNumber(item.sellValue || 0)}g`)
    : (isMobile ? "VENDER" : `VENDER ${formatNumber(item.sellValue || 0)}g`);

  return (
    <div className="fl-inventory-item-row-shell" data-onboarding-target={tutorialTarget ? "tutorial-first-item" : undefined}>
      <FlItemRow
        variant="inventory"
        item={item}
        selected={Boolean(tutorialTarget)}
        locked={lockInteractions}
        state={rowState}
        name={item.name}
        rarityLabel={getCompactRarityLabel(item.rarity)}
        statusLabel={isBetter ? "MEJOR" : ""}
        typeLabel={typeLabel}
        statLines={statLines}
        implicitLabel={implicit}
        powerValue={formatNumber(item.rating || 0)}
        onClick={lockInteractions ? undefined : onOpen}
        onPrimaryAction={onEquip}
        onSecondaryAction={onSell}
        actionsDisabled={lockInteractions}
        primaryActionOnboardingTarget={spotlightEquip ? "equip-item" : ""}
        primaryActionLabel="EQUIPAR"
        primaryActionVariant="default"
        secondaryActionLabel={secondaryActionLabel}
        secondaryActionVariant="danger"
        className={spotlightEquip ? "fl-item-row--spotlight" : ""}
      />
    </div>
  );
}

function ItemDetailModal({ item, equippedCompare, wishlistAffixes = [], onClose, onEquip, onSell, canSell = true, spotlightEquip = false }) {
  const [showAllAffixes, setShowAllAffixes] = useState(false);
  const compareItem = equippedCompare || { bonus: {}, rating: 0 };
  const stats = getItemStats(item);
  const affixes = getAffixEntries(item);
  const legendaryPower = getLegendaryPowerSummary(item);
  const visibleAffixes = showAllAffixes ? affixes : affixes.slice(0, 4);
  const powerCurrent = Number(item?.rating || 0);
  const powerDelta = powerCurrent - Number(compareItem?.rating || 0);
  const powerDeltaLabel = powerDelta > 0 ? `+${formatNumber(powerDelta)}` : formatNumber(powerDelta);
  const modalFrameRarity = item?.rarity || "common";
  const slotLabel = item.type === "weapon" ? "Sword" : item.type === "armor" ? "Armor" : "Item";

  return (
    <div className="fl-inventory-item-modal-backdrop" onClick={onClose}>
      <div className="fl-item-detail-modal" onClick={event => event.stopPropagation()}>
        <div className="idm-header">
          <div className={`idm-frame ${modalFrameRarity}`}>{getItemGlyph(item.name)}</div>
          <div className="idm-identity">
            <div className="idm-top-row">
              <FlBadge variant="rect" size="xs" rarity={item.rarity} className="fl-item-row__rarity">
                {getCompactRarityLabel(item.rarity)}
              </FlBadge>
              {(item.level || 0) > 0 && <span className="idm-level-chip">{`+${item.level}`}</span>}
              {item?.equipped && <span className="idm-equip-chip">⛊ Equipado</span>}
            </div>
            <div className="idm-name">{item.name}</div>
            <div className="idm-sub">{slotLabel} · AFIJOS {(getAffixDots(item) || []).map(dot => dot.symbol).join("") || "—"}</div>
            <div className="idm-power">
              <span className="idm-power-l">Poder</span>
              <span className="idm-power-n">{formatNumber(powerCurrent)}</span>
              <span className={`idm-power-delta ${powerDelta > 0 ? "pos" : powerDelta < 0 ? "neg" : "neu"}`}>{powerDeltaLabel}</span>
            </div>
          </div>
          <button className="idm-close" onClick={onClose}>✕</button>
        </div>

        <div className="idm-body">
          {legendaryPower && (
            <section className="idm-legendary idm-body-panel">
              <div className="idm-section-title">Poder Legendario</div>
              <div className="idm-legendary-name">{legendaryPower.name}</div>
              <div className="idm-legendary-description">{legendaryPower.description}</div>
            </section>
          )}
          <div className="idm-body-grid">
          <section className="idm-body-panel">
            <div className="idm-section-title">Tabla Completa</div>
            {(() => {
              const statKeys = Object.keys(STAT_LABELS).filter(key => (stats[key] || 0) > 0 || (compareItem.bonus?.[key] || 0) > 0);
              return (
                <div className="idm-stat-grid">
                  {[0, 1].map(columnIndex => (
                    <div key={columnIndex} className="idm-stat-col">
                      {statKeys.filter((_, index) => index % 2 === columnIndex).map(key => {
                        const currentVal = stats[key] || 0;
                        const equippedVal = compareItem.bonus?.[key] || 0;
                        const diff = currentVal - equippedVal;
                        return (
                          <div key={key} className="idm-stat-row">
                            <span className="idm-stat-label">{STAT_LABELS[key]}</span>
                            <div className="idm-stat-values">
                              <span className="idm-stat-value">{formatStatValue(key, currentVal)}</span>
                              <span className={`idm-delta ${diff > 0 ? "pos" : diff < 0 ? "neg" : "neu"}`}>{formatDiffValue(key, diff)}</span>
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
            <section className="idm-body-panel">
              <div className="idm-affix-head">
                <div className="idm-section-title">Afijos</div>
                {affixes.length > 4 && (
                  <button
                    className="idm-affix-toggle"
                    onClick={() => setShowAllAffixes(current => !current)}
                  >
                    {showAllAffixes ? "Ver menos" : `Ver ${affixes.length - 4} mas`}
                  </button>
                )}
              </div>
              <div className="idm-affix-list">
                {visibleAffixes.map((affix, index) => (
                  <div
                    key={`${affix.id}-${index}`}
                    className={`idm-affix ${affix?.quality === "excellent" ? "idm-affix--excellent" : ""}`}
                  >
                    <div className="idm-affix-top">
                      <div className="idm-affix-name">{STAT_LABELS[affix.stat] || affix.stat}</div>
                      <div className="idm-affix-tags">
                        {affix?.quality === "excellent" && <span className="idm-affix-tag idm-affix-tag--excellent">EXCELENTE</span>}
                        {wishlistAffixes.includes(affix.stat) && <span className="idm-affix-tag idm-affix-tag--wishlist">WISHLIST</span>}
                      </div>
                    </div>
                    <div className={`idm-affix-val ${affix?.quality === "excellent" ? "pos" : ""}`}>+{formatStatValue(affix.stat, affix.rolledValue ?? affix.value ?? 0)}</div>
                    <div className="idm-affix-meta">Rango: {formatStatValue(affix.stat, affix.range?.min ?? 0)} - {formatStatValue(affix.stat, affix.range?.max ?? 0)}</div>
                    <div className="idm-affix-meta">{affix.kind === "prefix" ? "Prefijo" : "Sufijo"} · {affix.qualityLabel || (affix?.quality === "excellent" ? "Excelente" : "Normal")}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
          </div>

        </div>

        <div className="idm-footer">
          <FlButton
            variant="default"
            size="md"
            onClick={onEquip}
            data-onboarding-target={spotlightEquip ? "equip-item" : undefined}
            className={spotlightEquip ? "fl-item-detail-spotlight-action" : ""}
          >
            EQUIPAR
          </FlButton>
          <FlButton
            variant="danger"
            size="md"
            onClick={onSell}
            disabled={!canSell}
          >
            {canSell ? `VENDER ${formatNumber(item.sellValue || 0)}g` : "ITEM EQUIPADO"}
          </FlButton>
        </div>
      </div>
    </div>
  );
}


