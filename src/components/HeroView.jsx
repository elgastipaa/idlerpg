import React, { Suspense, lazy } from "react";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import useViewport from "../hooks/useViewport";
import SubtabDock from "./ui/SubtabDock";

const SUBVIEW_META = {
  character: { label: "Ficha" },
  skills: { label: "Atributos" },
  talents: { label: "Talentos" },
};

const Character = lazy(() => import("./Character"));
const Skills = lazy(() => import("./Skills"));
const Talents = lazy(() => import("./Talents"));

function getHeroSubview(tab = "character") {
  if (tab === "skills" || tab === "talents") return tab;
  return "character";
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

export default function HeroView({ state, dispatch }) {
  const { isMobile } = useViewport();
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
  const mobileSubviewCount = Object.keys(SUBVIEW_META).length;
  const mobileSubtabsScrollable = mobileSubviewCount >= 5;
  const onboardingStep = state?.onboarding?.step || null;
  const talentPoints = Math.max(0, Number(state?.player?.talentPoints || 0));
  const subtabEntries = Object.entries(SUBVIEW_META).map(([viewId, meta]) => {
    const spotlight =
      (onboardingStep === ONBOARDING_STEPS.HERO_CHARACTER_INTRO && viewId === "character") ||
      (onboardingStep === ONBOARDING_STEPS.HERO_SKILLS_INTRO && viewId === "skills") ||
      (onboardingStep === ONBOARDING_STEPS.HERO_TALENTS_INTRO && viewId === "talents");
    return {
      id: viewId,
      label: meta.label,
      disabled: (reforgeLocked && resolvedSubview !== viewId) || (!hasClass && viewId !== "character"),
      spotlight,
      onboardingTarget: spotlight
        ? viewId === "character"
          ? "hero-subview-character"
          : viewId === "skills"
            ? "hero-subview-skills"
            : "hero-subview-talents"
        : undefined,
      badge: viewId === "talents" && talentPoints > 0 ? (talentPoints > 9 ? "9+" : talentPoints) : null,
      badgeTone: "danger",
    };
  });

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
        <SubtabDock
          entries={subtabEntries}
          activeId={resolvedSubview}
          onSelect={viewId => dispatch({ type: "SET_TAB", tab: viewId })}
          isMobile={isMobile}
          mobileScrollable={mobileSubtabsScrollable}
          spotlightAnimationName="heroSubviewSpotlightPulse"
        />
      )}

      <div>
        <Suspense fallback={<SubviewLoadingCard label={SUBVIEW_META[resolvedSubview]?.label || "Vista"} />}>
          {resolvedSubview === "character" && <Character player={state.player} dispatch={dispatch} state={state} />}
          {resolvedSubview === "skills" && <Skills state={state} dispatch={dispatch} />}
          {resolvedSubview === "talents" && <Talents state={state} dispatch={dispatch} />}
        </Suspense>
      </div>
    </div>
  );
}
