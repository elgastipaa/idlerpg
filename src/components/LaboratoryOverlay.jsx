import React, { Suspense, lazy } from "react";
import OverlayShell from "./OverlayShell";
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
    <OverlayShell isMobile={isMobile}>
      <div style={{ width: "100%", maxWidth: "1220px", maxHeight: "100%", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "12px 10px 16px" : "14px 14px 16px" }}>
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
      </div>
    </OverlayShell>
  );
}
