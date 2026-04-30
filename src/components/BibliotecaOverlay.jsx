import React, { Suspense, lazy } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";

const Codex = lazy(() => import("./Codex"));

export default function BibliotecaOverlay({ state, dispatch, isMobile = false, onClose }) {
  return (
    <OverlayShell isMobile={isMobile} variant="forge" contentLabel="Biblioteca">
      <OverlaySurface isMobile={isMobile} variant="forge" className="fl-station-overlay fl-station-overlay--library">
        <Suspense fallback={<div className="fl-station-loading">Cargando Biblioteca...</div>}>
          <Codex state={state} dispatch={dispatch} mode="library" onBack={onClose} />
        </Suspense>
      </OverlaySurface>
    </OverlayShell>
  );
}
