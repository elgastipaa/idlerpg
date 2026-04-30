import React, { Suspense, lazy, useMemo } from "react";
import useViewport from "../hooks/useViewport";
import { isHuntUnlocked, isInventorySubviewUnlocked, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import { getMaxRunSigilSlots } from "../engine/progression/abyssProgression";
import RunSigilCallout from "./RunSigilCallout";
import SubtabDock from "./ui/SubtabDock";

const SUBVIEW_META = {
  combat: { label: "Combate" },
  inventory: { label: "Mochila" },
  codex: { label: "Intel" },
};

const Combat = lazy(() => import("./Combat"));
const Inventory = lazy(() => import("./Inventory"));
const Codex = lazy(() => import("./Codex"));

function getExpeditionSubview(tab = "combat") {
  if (tab === "inventory" || tab === "codex") return tab;
  return "combat";
}

function SubviewLoadingCard({ label = "Vista" }) {
  return (
    <div className="subview-loading-card">
      Cargando {label}...
    </div>
  );
}

export default function ExpeditionView({ state, dispatch }) {
  const { isMobile } = useViewport();
  const reforgeLocked = !!state?.combat?.reforgeSession;
  const huntUnlocked = isHuntUnlocked(state);
  const inventoryUnlocked = isInventorySubviewUnlocked(state);
  const onboardingStep = state?.onboarding?.step || null;
  const spotlightInventorySubview = onboardingStep === ONBOARDING_STEPS.EQUIP_INTRO;
  const spotlightCodexSubview = onboardingStep === ONBOARDING_STEPS.HUNT_INTRO;
  const tutorialSubviewTarget = spotlightInventorySubview
    ? "inventory"
    : spotlightCodexSubview
      ? "codex"
      : null;
  const activeSubview = getExpeditionSubview(state?.currentTab || "combat");
  const availableSubviews = useMemo(
    () => ["combat", ...(inventoryUnlocked ? ["inventory"] : []), ...(huntUnlocked ? ["codex"] : [])],
    [huntUnlocked, inventoryUnlocked]
  );
  const visibleSubviews = useMemo(
    () => availableSubviews,
    [availableSubviews]
  );
  const mobileSubviewCount = visibleSubviews.length;
  const mobileSubtabsScrollable = mobileSubviewCount >= 5;
  const resolvedSubview = availableSubviews.includes(activeSubview) ? activeSubview : "combat";
  const isCombatSubview = resolvedSubview === "combat";
  const expeditionRootClassName = [
    "expedition-root",
    state?.forgeLightCombatTrial ? "expedition-root--forge-light-prueba" : "",
    resolvedSubview === "inventory" ? "expedition-root--inventory" : "",
    resolvedSubview === "codex" ? "expedition-root--codex" : "",
    isMobile && isCombatSubview ? "expedition-root--combat-mobile" : "",
    isMobile && resolvedSubview === "inventory" ? "expedition-root--inventory-mobile" : "",
  ].join(" ").trim();
  const runTier = Math.max(1, Number(state?.combat?.currentTier || 1));
  const runBossKills = Math.max(0, Number(state?.combat?.runStats?.bossKills || 0));
  const runSigilSlotCount = getMaxRunSigilSlots(state?.abyss || {});
  const activeRunSigilIds = state?.combat?.activeRunSigilIds || state?.combat?.activeRunSigilId || "free";
  const showRunSigilCallout = Number(state?.prestige?.level || 0) >= 1 && !state?.combat?.pendingRunSetup;
  const inventoryUpgrades = (state?.player?.inventory || []).filter(item => {
    const compare = item.type === "weapon" ? state?.player?.equipment?.weapon : state?.player?.equipment?.armor;
    return (item?.rating || 0) > (compare?.rating || 0);
  }).length;
  const subviewActionHint = useMemo(() => {
    if (resolvedSubview === "inventory") {
      if (inventoryUpgrades > 0) {
        return `Tienes ${inventoryUpgrades} mejora(s) potencial(es). Equipa y vuelve a empujar tiers.`;
      }
      return "Mochila al día. Puedes volver a combate para seguir escalando.";
    }
    if (resolvedSubview === "codex") {
      return "Intel revisada. Vuelve a combate para capitalizar esta lectura.";
    }
    return null;
  }, [inventoryUpgrades, resolvedSubview]);
  const subtabEntries = visibleSubviews.map(viewId => {
    const tutorialLocked = tutorialSubviewTarget != null && viewId !== tutorialSubviewTarget;
    const spotlight =
      (spotlightInventorySubview && viewId === "inventory") ||
      (spotlightCodexSubview && viewId === "codex");
    return {
      id: viewId,
      label: SUBVIEW_META[viewId].label,
      disabled: (reforgeLocked && resolvedSubview !== viewId) || tutorialLocked,
      spotlight,
      onboardingTarget: spotlight
        ? viewId === "inventory"
          ? "subview-inventory"
          : "subview-codex"
        : undefined,
      badge: viewId === "inventory" && inventoryUpgrades > 0 ? (inventoryUpgrades > 9 ? "9+" : inventoryUpgrades) : null,
      badgeTone: "success",
    };
  });
  const useCombatMobileSideActions = isMobile && isCombatSubview;
  const combatSideActions = useCombatMobileSideActions
    ? subtabEntries
        .filter(entry => entry.id !== "combat")
        .map(entry => ({
          ...entry,
          icon: entry.id === "inventory" ? "inventory" : "library",
          onSelect: () => dispatch({ type: "SET_TAB", tab: entry.id }),
        }))
    : [];
  return (
    <div className={expeditionRootClassName}>
      {!useCombatMobileSideActions && (
        <SubtabDock
          className="expedition-subtab-dock"
          entries={subtabEntries}
          activeId={resolvedSubview}
          onSelect={viewId => dispatch({ type: "SET_TAB", tab: viewId })}
          isMobile={isMobile}
          mobileScrollable={mobileSubtabsScrollable}
          spotlightAnimationName="expeditionSubviewSpotlightPulse"
        />
      )}

      {showRunSigilCallout && (
        <RunSigilCallout
          runSigilIds={activeRunSigilIds}
          slotCount={runSigilSlotCount}
          title="Sigilos de esta salida"
          subtitle="Cambian al preparar una nueva expedicion desde Santuario."
        />
      )}

      {isMobile && !isCombatSubview && (
        <div className="expedition-mobile-hint">
          <div className="expedition-mobile-hint__top">
            <div className="expedition-mobile-hint__chips">
              <span className="expedition-mobile-hint__chip">
                T{runTier}
              </span>
              <span className="expedition-mobile-hint__chip">
                Boss {runBossKills}
              </span>
              {resolvedSubview === "inventory" && inventoryUpgrades > 0 && (
                <span className="expedition-mobile-hint__chip expedition-mobile-hint__chip--success">
                  +{inventoryUpgrades} upgrade(s)
                </span>
              )}
            </div>
            <button
              className="expedition-mobile-hint__back"
              onClick={() => dispatch({ type: "SET_TAB", tab: "combat" })}
            >
              Volver a combate
            </button>
          </div>
          {subviewActionHint && (
            <div className="expedition-mobile-hint__copy">
              {subviewActionHint}
            </div>
          )}
        </div>
      )}

      <div className="expedition-subview-content">
        <Suspense fallback={<SubviewLoadingCard label={SUBVIEW_META[resolvedSubview]?.label || "Vista"} />}>
          {resolvedSubview === "combat" && (
            <Combat
              state={state}
              dispatch={dispatch}
              sideActions={combatSideActions}
              forgeLightTrial={Boolean(state?.forgeLightCombatTrial)}
            />
          )}
          {resolvedSubview === "inventory" && (
            <Inventory
              state={state}
              player={state.player}
              dispatch={dispatch}
            />
          )}
          {resolvedSubview === "codex" && <Codex state={state} dispatch={dispatch} mode="hunt" />}
        </Suspense>
      </div>
    </div>
  );
}
