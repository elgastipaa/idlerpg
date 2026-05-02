import React, { Suspense, lazy } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";

const Codex = lazy(() => import("./Codex"));

export default function BibliotecaOverlay({ state, dispatch, isMobile = false, embedded = false, onClose }) {
  const content = (
    <div className="fl-station-overlay fl-station-overlay--library overlay-station-body overlay-station-body--forge">
      <Suspense fallback={<div className="fl-station-loading">Cargando Biblioteca...</div>}>
        <Codex state={state} dispatch={dispatch} mode="library" onBack={onClose} />
      </Suspense>
    </div>
  );

  if (embedded) return content;

  return (
    <OverlayShell isMobile={isMobile} embedded={embedded} variant="forge" contentLabel="Biblioteca">
      <OverlaySurface
        isMobile={isMobile}
        embedded={embedded}
        variant="forge"
        className="fl-station-overlay fl-station-overlay--library"
      >
        {content}
      </OverlaySurface>
    </OverlayShell>
  );
}
