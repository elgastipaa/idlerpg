import React from "react";
import OverlayStationShell from "./ui/OverlayStationShell";
import Crafting from "./Crafting";

function formatResource(value = 0) {
  return Math.floor(Number(value || 0)).toLocaleString();
}

function headerResourceChipStyle() {
  return {
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-tertiary, #f8fafc)",
    color: "var(--color-text-secondary, #475569)",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "0.6rem",
    fontWeight: "900",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  };
}

export default function SanctuaryForgeOverlay({ state, dispatch, isMobile = false, onClose }) {
  const player = state?.player || {};
  const sanctuaryResources = state?.sanctuary?.resources || {};
  const hasReforgeSession = Boolean(state?.combat?.reforgeSession);

  return (
    <OverlayStationShell
      isMobile={isMobile}
      contentLabel="Forja del Santuario"
      eyebrow="Forja"
      headerContent={(
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <span style={headerResourceChipStyle()}>Oro {formatResource(player?.gold)}</span>
          <span style={headerResourceChipStyle()}>Esencia {formatResource(player?.essence)}</span>
          <span style={headerResourceChipStyle()}>Polvo {formatResource(sanctuaryResources?.relicDust)}</span>
          <span style={headerResourceChipStyle()}>Flux {formatResource(sanctuaryResources?.sigilFlux)}</span>
        </div>
      )}
      accent="var(--tone-danger, #D85A30)"
      maxWidth="1200px"
      dismissOnBackdrop={!hasReforgeSession}
      onClose={onClose}
    >
      <Crafting state={state} dispatch={dispatch} />
    </OverlayStationShell>
  );
}
