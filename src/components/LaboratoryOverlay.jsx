import React, { Suspense, lazy } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import {
  getEffectiveOnboardingStep,
  ONBOARDING_STEPS,
} from "../engine/onboarding/onboardingEngine";

const Laboratory = lazy(() => import("./Laboratory"));

export default function LaboratoryOverlay({ state, dispatch, isMobile = false, onClose }) {
  const onboardingStep = state?.onboarding?.step || null;
  const effectiveStep = getEffectiveOnboardingStep(onboardingStep, state);
  const closeBlocked =
    onboardingStep === ONBOARDING_STEPS.RESEARCH_DISTILLERY ||
    effectiveStep === ONBOARDING_STEPS.RESEARCH_DISTILLERY;
  return (
    <OverlayShell isMobile={isMobile} contentLabel="Laboratorio">
      <OverlaySurface isMobile={isMobile}>
        <Suspense fallback={<div style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: "800", color: "var(--color-text-secondary, #64748b)" }}>Cargando Laboratorio...</div>}>
          <Laboratory
            state={state}
            dispatch={dispatch}
            onBack={() => {
              if (closeBlocked) return;
              onClose?.();
              if (
                onboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY ||
                effectiveStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY
              ) {
                dispatch({ type: "CLOSE_LABORATORY" });
              }
            }}
            backDisabled={closeBlocked}
            backTarget={
              onboardingStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY ||
              effectiveStep === ONBOARDING_STEPS.RETURN_TO_SANCTUARY
                ? "close-laboratory"
                : undefined
            }
          />
        </Suspense>
      </OverlaySurface>
    </OverlayShell>
  );
}
