import React, { Suspense, lazy, useMemo } from "react";
import useViewport from "../hooks/useViewport";
import { isFieldForgeUnlocked, isHuntUnlocked, isInventorySubviewUnlocked, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import { getMaxRunSigilSlots } from "../engine/progression/abyssProgression";
import RunSigilCallout from "./RunSigilCallout";

const SUBVIEW_META = {
  combat: { label: "Combate" },
  inventory: { label: "Mochila" },
  codex: { label: "Intel" },
  crafting: { label: "Forja" },
};

const Combat = lazy(() => import("./Combat"));
const Inventory = lazy(() => import("./Inventory"));
const Codex = lazy(() => import("./Codex"));
const Crafting = lazy(() => import("./Crafting"));

function subnavButtonStyle({ active = false, disabled = false } = {}) {
  return {
    border: "1px solid",
    borderColor: disabled
      ? "var(--color-border-primary, #e2e8f0)"
      : active
        ? "var(--tone-accent, #4338ca)"
        : "var(--color-border-primary, #e2e8f0)",
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : active
        ? "var(--tone-accent-soft, #eef2ff)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : active
        ? "var(--tone-accent, #4338ca)"
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    minWidth: "110px",
    flex: "0 0 auto",
  };
}

function getExpeditionSubview(tab = "combat") {
  if (tab === "inventory" || tab === "crafting" || tab === "codex") return tab;
  return "combat";
}

function SubviewLoadingCard({ label = "Vista" }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        background: "var(--color-background-secondary, #ffffff)",
        borderRadius: "12px",
        padding: "14px 12px",
        fontSize: "0.72rem",
        fontWeight: "900",
        color: "var(--color-text-secondary, #64748b)",
      }}
    >
      Cargando {label}...
    </div>
  );
}

export default function ExpeditionView({ state, dispatch }) {
  const { isMobile } = useViewport();
  const reforgeLocked = !!state?.combat?.reforgeSession;
  const huntUnlocked = isHuntUnlocked(state);
  const inventoryUnlocked = isInventorySubviewUnlocked(state);
  const fieldForgeUnlocked = isFieldForgeUnlocked(state);
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
    () => ["combat", ...(inventoryUnlocked ? ["inventory"] : []), ...(fieldForgeUnlocked ? ["crafting"] : []), ...(huntUnlocked ? ["codex"] : [])],
    [fieldForgeUnlocked, huntUnlocked, inventoryUnlocked]
  );
  const visibleSubviews = useMemo(
    () => availableSubviews.filter(viewId => viewId !== "crafting"),
    [availableSubviews]
  );
  const mobileSubviewCount = visibleSubviews.length;
  const mobileSubtabsScrollable = mobileSubviewCount >= 5;
  const resolvedSubview = availableSubviews.includes(activeSubview) ? activeSubview : "combat";
  const isCombatSubview = resolvedSubview === "combat";
  const expeditionRootClassName = [
    "expedition-root",
    isMobile && isCombatSubview ? "expedition-root--combat-mobile" : "",
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
  return (
    <div className={expeditionRootClassName}>
      <style>{`
        @keyframes expeditionSubviewSpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.22); }
          70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
          100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
        }
      `}</style>
      {isMobile ? (
        <div className="expedition-mobile-dock">
          <div
            className="expedition-mobile-row"
            style={{
              overflowX: mobileSubtabsScrollable ? "auto" : "hidden",
              scrollbarWidth: mobileSubtabsScrollable ? "none" : "auto",
            }}
          >
            {visibleSubviews.map(viewId => {
              const active = resolvedSubview === viewId;
              const tutorialLocked = tutorialSubviewTarget != null && viewId !== tutorialSubviewTarget;
              const disabled = (reforgeLocked && !active) || tutorialLocked;
              const spotlight =
                (spotlightInventorySubview && viewId === "inventory") ||
                (spotlightCodexSubview && viewId === "codex");
              return (
                <button
                  key={viewId}
                  onClick={() => dispatch({ type: "SET_TAB", tab: viewId })}
                  disabled={disabled}
                  data-onboarding-target={
                    spotlight
                      ? viewId === "inventory"
                        ? "subview-inventory"
                        : "subview-codex"
                      : undefined
                  }
                  style={{
                    ...subnavButtonStyle({ active, disabled }),
                    minWidth: mobileSubtabsScrollable ? "84px" : 0,
                    flex: mobileSubtabsScrollable ? "0 0 auto" : "1 1 0",
                    padding: "8px 10px",
                    fontSize: "0.68rem",
                    whiteSpace: mobileSubtabsScrollable ? "nowrap" : "normal",
                    boxShadow: spotlight
                      ? "0 0 0 2px rgba(83,74,183,0.18), 0 10px 24px rgba(83,74,183,0.14)"
                      : subnavButtonStyle({ active, disabled }).boxShadow,
                    animation: spotlight ? "expeditionSubviewSpotlightPulse 1600ms ease-in-out infinite" : "none",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span>{SUBVIEW_META[viewId].label}</span>
                    {viewId === "inventory" && inventoryUpgrades > 0 && (
                      <span
                        style={{
                          minWidth: "18px",
                          height: "18px",
                          padding: "0 6px",
                          borderRadius: "999px",
                          background: "var(--tone-success, #10b981)",
                          color: "#fff",
                          fontSize: "0.62rem",
                          fontWeight: "900",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {inventoryUpgrades > 9 ? "9+" : inventoryUpgrades}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {visibleSubviews.map(viewId => {
            const active = resolvedSubview === viewId;
            const tutorialLocked = tutorialSubviewTarget != null && viewId !== tutorialSubviewTarget;
            const disabled = (reforgeLocked && !active) || tutorialLocked;
            const spotlight =
              (spotlightInventorySubview && viewId === "inventory") ||
              (spotlightCodexSubview && viewId === "codex");
            return (
              <button
                key={viewId}
                onClick={() => dispatch({ type: "SET_TAB", tab: viewId })}
                disabled={disabled}
                data-onboarding-target={
                  spotlight
                    ? viewId === "inventory"
                      ? "subview-inventory"
                      : "subview-codex"
                    : undefined
                }
                style={{
                  ...subnavButtonStyle({ active, disabled }),
                  minWidth: "110px",
                  padding: "10px 12px",
                  fontSize: "0.72rem",
                  boxShadow: spotlight
                    ? "0 0 0 2px rgba(83,74,183,0.18), 0 10px 24px rgba(83,74,183,0.14)"
                    : subnavButtonStyle({ active, disabled }).boxShadow,
                  animation: spotlight ? "expeditionSubviewSpotlightPulse 1600ms ease-in-out infinite" : "none",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>{SUBVIEW_META[viewId].label}</span>
                  {viewId === "inventory" && inventoryUpgrades > 0 && (
                    <span
                      style={{
                        minWidth: "18px",
                        height: "18px",
                        padding: "0 6px",
                        borderRadius: "999px",
                        background: "var(--tone-success, #10b981)",
                        color: "#fff",
                        fontSize: "0.62rem",
                        fontWeight: "900",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {inventoryUpgrades > 9 ? "9+" : inventoryUpgrades}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
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
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "2px 6px" }}>
                T{runTier}
              </span>
              <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "2px 6px" }}>
                Boss {runBossKills}
              </span>
              {resolvedSubview === "inventory" && inventoryUpgrades > 0 && (
                <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--tone-success, #047857)", border: "1px solid var(--tone-success, #a7f3d0)", background: "var(--tone-success-soft, #ecfdf5)", borderRadius: "999px", padding: "2px 6px" }}>
                  +{inventoryUpgrades} upgrade(s)
                </span>
              )}
            </div>
            <button
              onClick={() => dispatch({ type: "SET_TAB", tab: "combat" })}
              style={{
                border: "1px solid var(--tone-accent, #4338ca)",
                background: "var(--tone-accent-soft, #eef2ff)",
                color: "var(--tone-accent, #4338ca)",
                borderRadius: "10px",
                padding: "6px 10px",
                fontSize: "0.62rem",
                fontWeight: "900",
                cursor: "pointer",
              }}
            >
              Volver a combate
            </button>
          </div>
          {subviewActionHint && (
            <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.35 }}>
              {subviewActionHint}
            </div>
          )}
        </div>
      )}

      <div style={{ width: "100%", minWidth: 0 }}>
        <Suspense fallback={<SubviewLoadingCard label={SUBVIEW_META[resolvedSubview]?.label || "Vista"} />}>
          {resolvedSubview === "combat" && <Combat state={state} dispatch={dispatch} />}
          {resolvedSubview === "inventory" && (
            <Inventory
              state={state}
              player={state.player}
              dispatch={dispatch}
              canOpenCrafting={fieldForgeUnlocked}
              onOpenCrafting={() => dispatch({ type: "SET_TAB", tab: "crafting" })}
            />
          )}
          {resolvedSubview === "crafting" && <Crafting state={state} dispatch={dispatch} />}
          {resolvedSubview === "codex" && <Codex state={state} dispatch={dispatch} mode="hunt" />}
        </Suspense>
      </div>
    </div>
  );
}
