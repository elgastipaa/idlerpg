import React, { useEffect } from "react";
import OverlayStationShell from "./ui/OverlayStationShell";
import Crafting from "./Crafting";

export default function SanctuaryForgeOverlay({ state, dispatch, isMobile = false, onClose }) {
  const hasReforgeSession = Boolean(state?.combat?.reforgeSession);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.documentElement.classList.add("app-forge-crafting-overlay-active");
    return () => {
      document.documentElement.classList.remove("app-forge-crafting-overlay-active");
    };
  }, []);

  return (
    <OverlayStationShell
      isMobile={isMobile}
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
      <Crafting state={state} dispatch={dispatch} onClose={onClose} />
    </OverlayStationShell>
  );
}
