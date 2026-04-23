import React, { useEffect, useMemo, useState } from "react";
import Combat from "./Combat";
import Inventory from "./Inventory";
import Codex from "./Codex";
import Crafting from "./Crafting";
import { getActiveGoals } from "../engine/progression/goalEngine";
import { isFieldForgeUnlocked, isHuntUnlocked, isInventorySubviewUnlocked, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";

const SUBVIEW_META = {
  combat: { label: "Combate" },
  inventory: { label: "Mochila" },
  codex: { label: "Intel" },
};

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

export default function ExpeditionView({ state, dispatch }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
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
  const resolvedSubview = availableSubviews.includes(activeSubview) ? activeSubview : "combat";
  const isCombatSubview = resolvedSubview === "combat";
  const sessionGoals = useMemo(() => getActiveGoals(state, 3), [state]);
  const primarySessionGoal = sessionGoals[0] || null;
  const secondarySessionGoals = sessionGoals.slice(1, 3);
  const showSessionFraming = Boolean(
    state?.onboarding?.completed ||
    state?.onboarding?.flags?.firstExtractionCompleted
  );
  const inventoryUpgrades = (state?.player?.inventory || []).filter(item => {
    const compare = item.type === "weapon" ? state?.player?.equipment?.weapon : state?.player?.equipment?.armor;
    return (item?.rating || 0) > (compare?.rating || 0);
  }).length;

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gap: isMobile ? "8px" : "10px",
        padding: isMobile ? (isCombatSubview ? "6px 0 0" : "8px 8px 10px") : "10px",
        width: "100%",
        minWidth: 0,
      }}
    >
      <style>{`
        @keyframes expeditionSubviewSpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.22); }
          70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
          100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
        }
      `}</style>
      {showSessionFraming && primarySessionGoal && (
        <section
          style={{
            background: "var(--color-background-secondary, #ffffff)",
            border: "1px solid var(--color-border-primary, #e2e8f0)",
            borderRadius: "14px",
            padding: isMobile ? "10px" : "12px",
            display: "grid",
            gap: "8px",
            boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
            margin: isMobile ? "0 8px" : 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                Sesion actual
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                <span
                  style={{
                    fontSize: "0.5rem",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--tone-accent, #4338ca)",
                    background: "var(--tone-accent-soft, #eef2ff)",
                    border: "1px solid rgba(99,102,241,0.18)",
                    borderRadius: "999px",
                    padding: "3px 7px",
                  }}
                >
                  {primarySessionGoal.sessionArc}
                </span>
                <span style={{ fontSize: "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                  {primarySessionGoal.name}
                </span>
              </div>
            </div>
            {primarySessionGoal.completed ? (
              <button
                onClick={() => dispatch({ type: "CLAIM_GOAL", goalId: primarySessionGoal.id })}
                style={{
                  border: "none",
                  background: "var(--tone-success, #10b981)",
                  color: "#fff",
                  borderRadius: "999px",
                  padding: "7px 10px",
                  fontSize: "0.62rem",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                Reclamar
              </button>
            ) : (
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: "900",
                  color: "var(--color-text-secondary, #64748b)",
                  whiteSpace: "nowrap",
                }}
              >
                {primarySessionGoal.progress}/{primarySessionGoal.targetValue}
              </span>
            )}
          </div>

          <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.4 }}>
            {primarySessionGoal.hint || primarySessionGoal.description}
          </div>

          <div style={{ height: "6px", borderRadius: "999px", overflow: "hidden", background: "var(--color-background-tertiary, #f1f5f9)", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
            <div
              style={{
                width: `${primarySessionGoal.percent}%`,
                height: "100%",
                background: primarySessionGoal.completed ? "var(--tone-success, #10b981)" : "var(--tone-accent, #4338ca)",
              }}
            />
          </div>

          {secondarySessionGoals.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {secondarySessionGoals.map(goal => (
                <div
                  key={goal.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 8px",
                    borderRadius: "999px",
                    background: "var(--color-background-tertiary, #f8fafc)",
                    border: "1px solid var(--color-border-primary, #e2e8f0)",
                    color: "var(--color-text-secondary, #475569)",
                    fontSize: "0.58rem",
                    fontWeight: "900",
                  }}
                >
                  <span style={{ color: "var(--tone-accent, #4338ca)" }}>{goal.sessionArc}</span>
                  <span>{goal.name}</span>
                  <span style={{ color: "var(--color-text-tertiary, #94a3b8)" }}>
                    {goal.completed ? "Listo" : `${goal.progress}/${goal.targetValue}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: isMobile ? "nowrap" : "wrap",
          overflowX: isMobile ? "auto" : "visible",
          overflowY: "hidden",
          padding: isMobile ? "0 8px 2px" : 0,
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
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
                minWidth: isMobile ? "92px" : "110px",
                padding: isMobile ? "9px 11px" : "10px 12px",
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

      <div style={{ width: "100%", minWidth: 0 }}>
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
      </div>
    </div>
  );
}
