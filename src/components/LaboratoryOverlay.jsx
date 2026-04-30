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
    <OverlayShell isMobile={isMobile} variant="forge" contentLabel="Laboratorio">
      <OverlaySurface isMobile={isMobile} variant="forge" className="fl-station-overlay fl-station-overlay--laboratory">
        <Suspense fallback={<div className="fl-station-loading">Cargando Laboratorio...</div>}>
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
