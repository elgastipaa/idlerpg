import React from "react";
import Character from "./Character";
import Skills from "./Skills";
import Talents from "./Talents";

const SUBVIEW_META = {
  character: { label: "Ficha" },
  skills: { label: "Atributos" },
  talents: { label: "Talentos" },
};

function buttonStyle({ active = false, disabled = false } = {}) {
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

function getHeroSubview(tab = "character") {
  if (tab === "skills" || tab === "talents") return tab;
  return "character";
}

export default function HeroView({ state, dispatch }) {
  const activeSubview = getHeroSubview(state?.currentTab || "character");
  const hasClass = Boolean(state?.player?.class);
  const resolvedSubview = hasClass ? activeSubview : "character";
  const reforgeLocked = !!state?.combat?.reforgeSession;

  return (
    <div style={{ display: "grid", gap: "10px", padding: "10px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {Object.entries(SUBVIEW_META).map(([viewId, meta]) => {
          const active = resolvedSubview === viewId;
          const disabled = (reforgeLocked && !active) || (!hasClass && viewId !== "character");
          return (
            <button
              key={viewId}
              onClick={() => dispatch({ type: "SET_TAB", tab: viewId })}
              disabled={disabled}
              style={buttonStyle({ active, disabled })}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <div>
        {resolvedSubview === "character" && <Character player={state.player} dispatch={dispatch} state={state} />}
        {resolvedSubview === "skills" && <Skills state={state} dispatch={dispatch} />}
        {resolvedSubview === "talents" && <Talents state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}
