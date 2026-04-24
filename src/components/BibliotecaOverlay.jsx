import React, { Suspense, lazy } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";

const Codex = lazy(() => import("./Codex"));

export default function BibliotecaOverlay({ state, dispatch, isMobile = false, onClose }) {
  return (
    <OverlayShell isMobile={isMobile} contentLabel="Biblioteca">
      <OverlaySurface isMobile={isMobile}>
        <Suspense fallback={<div style={{ padding: "1rem", fontSize: "0.8rem", fontWeight: "800", color: "var(--color-text-secondary, #64748b)" }}>Cargando Biblioteca...</div>}>
          <Codex state={state} dispatch={dispatch} mode="library" onBack={onClose} />
        </Suspense>
      </OverlaySurface>
    </OverlayShell>
  );
}
