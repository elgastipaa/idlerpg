import React from "react";
import Character from "./Character";
import Skills from "./Skills";
import Talents from "./Talents";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";

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
  const hasSpec = Boolean(state?.player?.specialization);
  const heroFlags = state?.onboarding?.flags || {};
  const tutorialHeroUnlocked = Boolean(
    heroFlags?.heroTabUnlocked ||
    heroFlags?.heroIntroSeen ||
    heroFlags?.firstAttributeSpent ||
    heroFlags?.firstTalentBought ||
    heroFlags?.specChosen
  );
  const allowTutorialSubviews = hasClass && (hasSpec || tutorialHeroUnlocked);
  const resolvedSubview = hasClass ? (allowTutorialSubviews ? activeSubview : "character") : "character";
  const reforgeLocked = !!state?.combat?.reforgeSession;
  const showSubviewButtons = allowTutorialSubviews;
  const onboardingStep = state?.onboarding?.step || null;

  return (
    <div style={{ display: "grid", gap: "10px", padding: "10px" }}>
      <style>{`
        @keyframes heroSubviewSpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(83,74,183,0.22); }
          70% { box-shadow: 0 0 0 10px rgba(83,74,183,0); }
          100% { box-shadow: 0 0 0 0 rgba(83,74,183,0); }
        }
      `}</style>
      {showSubviewButtons && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Object.entries(SUBVIEW_META).map(([viewId, meta]) => {
            const active = resolvedSubview === viewId;
            const disabled = (reforgeLocked && !active) || (!hasClass && viewId !== "character");
            const spotlight =
              (onboardingStep === ONBOARDING_STEPS.HERO_CHARACTER_INTRO && viewId === "character") ||
              (onboardingStep === ONBOARDING_STEPS.HERO_SKILLS_INTRO && viewId === "skills") ||
              (onboardingStep === ONBOARDING_STEPS.HERO_TALENTS_INTRO && viewId === "talents");
            return (
              <button
                key={viewId}
                onClick={() => dispatch({ type: "SET_TAB", tab: viewId })}
                disabled={disabled}
                data-onboarding-target={
                  spotlight
                    ? viewId === "character"
                      ? "hero-subview-character"
                      : viewId === "skills"
                      ? "hero-subview-skills"
                      : "hero-subview-talents"
                    : undefined
                }
                style={{
                  ...buttonStyle({ active, disabled }),
                  position: spotlight ? "relative" : "static",
                  zIndex: spotlight ? 2 : 1,
                  boxShadow: spotlight
                    ? "0 0 0 2px rgba(83,74,183,0.18), 0 10px 24px rgba(83,74,183,0.14)"
                    : buttonStyle({ active, disabled }).boxShadow,
                  animation: spotlight ? "heroSubviewSpotlightPulse 1600ms ease-in-out infinite" : "none",
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <div>
        {resolvedSubview === "character" && <Character player={state.player} dispatch={dispatch} state={state} />}
        {resolvedSubview === "skills" && <Skills state={state} dispatch={dispatch} />}
        {resolvedSubview === "talents" && <Talents state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}
