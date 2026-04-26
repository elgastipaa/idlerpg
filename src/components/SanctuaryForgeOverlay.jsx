import React from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import Crafting from "./Crafting";

function closeButtonStyle() {
  return {
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-secondary, #ffffff)",
    color: "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: "8px 12px",
    fontSize: "0.68rem",
    fontWeight: "900",
    cursor: "pointer",
  };
}

const forgeHeaderStyle = {
  background: "var(--color-background-secondary, #ffffff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderTop: "3px solid var(--tone-danger, #D85A30)",
  borderRadius: "16px",
  padding: "14px 16px",
  boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const forgeBodyStyle = {
  padding: "1rem",
  display: "grid",
  gap: "1rem",
  alignItems: "start",
  alignContent: "start",
  background: "var(--color-background-primary, #f8fafc)",
  color: "var(--color-text-primary, #1e293b)",
};

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
        paddingMobile="0"
        paddingDesktop="0"
        gap="0"
      >
        <div style={forgeBodyStyle}>
          <section style={forgeHeaderStyle}>
            <div>
              <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
                Forja
              </div>
              <div style={{ fontSize: "1.02rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", marginTop: "4px" }}>
                Items persistentes del Santuario
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35, maxWidth: "56ch" }}>
                Mejora, afina, reconfigura y extrae piezas fuera de la expedicion.
              </div>
            </div>
            <button onClick={onClose} style={closeButtonStyle()}>
              Volver
            </button>
          </section>
          <Crafting state={state} dispatch={dispatch} />
        </div>
      </OverlaySurface>
    </OverlayShell>
  );
}
