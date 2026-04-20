import React from "react";
import { getOnboardingOverlayAnchor, getOnboardingStepMeta, isInfoOnlyOnboardingStep } from "../engine/onboarding/onboardingEngine";

export default function OnboardingOverlay({ state, dispatch, isMobile = false }) {
  const step = state?.onboarding?.step || null;
  const meta = getOnboardingStepMeta(step, state);
  if (!step || !meta) return null;

  const anchor = getOnboardingOverlayAnchor(step);
  const infoOnly = isInfoOnlyOnboardingStep(step);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2,6,23,0.46)",
        zIndex: 6500,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "fixed",
          left: isMobile ? "12px" : "20px",
          right: isMobile ? "12px" : "20px",
          top: anchor === "top" ? (isMobile ? "78px" : "88px") : "auto",
          bottom: anchor === "bottom" ? (isMobile ? "86px" : "24px") : "auto",
          maxWidth: "560px",
          margin: anchor === "top" ? "0 auto" : undefined,
          background: "var(--color-background-secondary, #ffffff)",
          color: "var(--color-text-primary, #1e293b)",
          border: "1px solid var(--color-border-primary, #e2e8f0)",
          borderRadius: "16px",
          boxShadow: "0 18px 40px rgba(2,6,23,0.28)",
          padding: "14px 16px",
          display: "grid",
          gap: "10px",
          pointerEvents: "auto",
        }}
      >
        <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
          Tutorial
        </div>
        <div style={{ fontSize: "0.96rem", fontWeight: "900" }}>{meta.title}</div>
        <div style={{ fontSize: "0.78rem", lineHeight: 1.45, color: "var(--color-text-secondary, #475569)" }}>
          {meta.body}
        </div>
        {infoOnly && meta.actionLabel && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => dispatch({ type: "ACK_ONBOARDING_STEP" })}
              style={{
                border: "1px solid var(--tone-accent, #4338ca)",
                background: "var(--tone-accent-soft, #eef2ff)",
                color: "var(--tone-accent, #4338ca)",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "0.72rem",
                fontWeight: "900",
                cursor: "pointer",
              }}
            >
              {meta.actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
