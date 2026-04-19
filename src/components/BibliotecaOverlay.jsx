import React, { Suspense, lazy } from "react";

const Codex = lazy(() => import("./Codex"));

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

export default function BibliotecaOverlay({ state, dispatch, isMobile = false, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.72)", zIndex: 9300, display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center", padding: isMobile ? "0" : "24px" }}>
      <div style={{ width: "100%", maxWidth: "1220px", maxHeight: "100vh", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "12px 10px 16px" : "14px 14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={closeButtonStyle()}>
            Volver al Santuario
          </button>
        </div>
        <Suspense fallback={<div style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: "800", color: "var(--color-text-secondary, #64748b)" }}>Cargando Biblioteca...</div>}>
          <Codex state={state} dispatch={dispatch} mode="library" />
        </Suspense>
      </div>
    </div>
  );
}
