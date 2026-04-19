import React, { useMemo } from "react";
import Combat from "./Combat";
import Inventory from "./Inventory";
import Crafting from "./Crafting";
import Codex from "./Codex";

const SUBVIEW_META = {
  combat: { label: "Combate" },
  inventory: { label: "Mochila" },
  crafting: { label: "Forja" },
  codex: { label: "Caza" },
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
  };
}

function getExpeditionSubview(tab = "combat") {
  if (tab === "inventory" || tab === "crafting" || tab === "codex") return tab;
  return "combat";
}

function isHuntUnlocked(state) {
  const currentTier = Number(state?.combat?.currentTier || 1);
  const maxTier = Number(state?.combat?.maxTier || 1);
  const seenFamilies = Array.isArray(state?.expedition?.seenFamilyIds) ? state.expedition.seenFamilyIds.length : 0;
  return currentTier >= 5 || maxTier >= 5 || seenFamilies > 0;
}

export default function ExpeditionView({ state, dispatch }) {
  const reforgeLocked = !!state?.combat?.reforgeSession;
  const huntUnlocked = isHuntUnlocked(state);
  const activeSubview = getExpeditionSubview(state?.currentTab || "combat");
  const availableSubviews = useMemo(
    () => ["combat", "inventory", "crafting", ...(huntUnlocked ? ["codex"] : [])],
    [huntUnlocked]
  );
  const resolvedSubview = availableSubviews.includes(activeSubview) ? activeSubview : "combat";

  return (
    <div style={{ display: "grid", gap: "10px", padding: "10px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {availableSubviews.map(viewId => {
          const active = resolvedSubview === viewId;
          const disabled = reforgeLocked && !active;
          return (
            <button
              key={viewId}
              onClick={() => dispatch({ type: "SET_TAB", tab: viewId })}
              disabled={disabled}
              style={subnavButtonStyle({ active, disabled })}
            >
              {SUBVIEW_META[viewId].label}
            </button>
          );
        })}
      </div>

      <div>
        {resolvedSubview === "combat" && <Combat state={state} dispatch={dispatch} />}
        {resolvedSubview === "inventory" && <Inventory state={state} player={state.player} dispatch={dispatch} />}
        {resolvedSubview === "crafting" && <Crafting state={state} dispatch={dispatch} />}
        {resolvedSubview === "codex" && <Codex state={state} dispatch={dispatch} mode="hunt" />}
      </div>
    </div>
  );
}
