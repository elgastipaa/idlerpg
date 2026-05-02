import React, { useEffect } from "react";
import OverlayStationShell from "./ui/OverlayStationShell";
import Crafting from "./Crafting";

export default function SanctuaryForgeOverlay({ state, dispatch, isMobile = false, embedded = false, onClose }) {
  const hasReforgeSession = Boolean(state?.combat?.reforgeSession);

  useEffect(() => {
    if (embedded) return undefined;
    if (typeof document === "undefined") return undefined;
    document.documentElement.classList.add("app-forge-crafting-overlay-active");
    return () => {
      document.documentElement.classList.remove("app-forge-crafting-overlay-active");
    };
  }, [embedded]);

  const content = (
    <div className="fl-station-overlay fl-station-overlay--forge overlay-station-body overlay-station-body--forge overlay-station-body--forge-crafting">
      <Crafting state={state} dispatch={dispatch} onClose={onClose} />
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <OverlayStationShell
      isMobile={isMobile}
      embedded={embedded}
      variant="forge"
      contentLabel="Forja del Santuario"
      headerContent={null}
      accent="var(--tone-danger, #D85A30)"
      maxWidth="1200px"
      shellClassName="overlay-shell--forge-crafting"
      surfaceClassName="overlay-station-shell--forge-crafting"
      bodyClassName="overlay-station-body--forge-crafting"
      headerClassName="overlay-station-header--forge-crafting"
      respectHeader
      zIndex={7600}
      dismissOnBackdrop={!hasReforgeSession}
      onClose={onClose}
    >
      {content}
    </OverlayStationShell>
  );
}
