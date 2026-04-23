import React, { Suspense, lazy } from "react";
import OverlayShell from "./OverlayShell";

const Codex = lazy(() => import("./Codex"));

export default function BibliotecaOverlay({ state, dispatch, isMobile = false, onClose }) {
  return (
    <OverlayShell isMobile={isMobile}>
      <div style={{ width: "100%", maxWidth: "1220px", maxHeight: "100%", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "12px 10px 16px" : "14px 14px 16px" }}>
        <Suspense fallback={<div style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: "800", color: "var(--color-text-secondary, #64748b)" }}>Cargando Biblioteca...</div>}>
          <Codex state={state} dispatch={dispatch} mode="library" onBack={onClose} />
        </Suspense>
      </div>
    </OverlayShell>
  );
}
