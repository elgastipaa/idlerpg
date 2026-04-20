import React, { Suspense, lazy } from "react";

const Laboratory = lazy(() => import("./Laboratory"));

function closeButtonStyle() {
  return {
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-secondary, #ffffff)",
    color: "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: "pointer",
  };
}

export default function LaboratoryOverlay({ state, dispatch, isMobile = false, onClose }) {
  const closeBlocked = state?.onboarding?.step === "research_distillery";
  return (
    <div style={{ position: "fixed", inset: isMobile ? "0 0 calc(72px + env(safe-area-inset-bottom)) 0" : 0, background: "rgba(2,6,23,0.72)", zIndex: isMobile ? 4800 : 9300, display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center", padding: isMobile ? "0" : "24px" }}>
      <div style={{ width: "100%", maxWidth: "1220px", maxHeight: "100%", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "12px 10px 16px" : "14px 14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => !closeBlocked && onClose?.()} disabled={closeBlocked} style={{ ...closeButtonStyle(), opacity: closeBlocked ? 0.6 : 1, cursor: closeBlocked ? "not-allowed" : "pointer" }}>
            Volver al Santuario
          </button>
        </div>
        <Suspense fallback={<div style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: "800", color: "var(--color-text-secondary, #64748b)" }}>Cargando Laboratorio...</div>}>
          <Laboratory state={state} dispatch={dispatch} />
        </Suspense>
      </div>
    </div>
  );
}
