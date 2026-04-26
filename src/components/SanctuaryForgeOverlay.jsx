import React from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import Crafting from "./Crafting";

function closeButtonStyle() {
  return {
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-secondary, #ffffff)",
    color: "var(--color-text-primary, #1e293b)",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "0.68rem",
    fontWeight: "900",
    cursor: "pointer",
  };
}

export default function SanctuaryForgeOverlay({ state, dispatch, isMobile = false, onClose }) {
  return (
    <OverlayShell
      isMobile={isMobile}
      contentLabel="Forja del Santuario"
      closeOnEscape
      dismissOnBackdrop
      onDismiss={onClose}
    >
      <OverlaySurface
        isMobile={isMobile}
        maxWidth="1200px"
        paddingMobile="10px 8px 12px"
        paddingDesktop="12px 12px 14px"
        gap="10px"
        style={{
          display: "grid",
          gap: "8px",
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      >
        <div
          style={{
            border: "1px solid var(--color-border-primary, #e2e8f0)",
            borderRadius: "12px",
            padding: "10px 12px",
            background: "var(--color-background-secondary, #ffffff)",
            boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Santuario
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", marginTop: "2px" }}>
              Taller de Forja
            </div>
          </div>
          <button onClick={onClose} style={closeButtonStyle()}>
            Cerrar
          </button>
        </div>
        <Crafting state={state} dispatch={dispatch} />
      </OverlaySurface>
    </OverlayShell>
  );
}
