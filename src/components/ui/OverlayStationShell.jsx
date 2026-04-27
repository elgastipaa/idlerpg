import React from "react";
import OverlayShell, { OverlaySurface } from "../OverlayShell";

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

function headerStyle(accent = "var(--tone-accent, #4338ca)") {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderTop: `3px solid ${accent}`,
    borderRadius: "16px",
    padding: "14px 16px",
    boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  };
}

const bodyStyle = {
  padding: "1rem",
  display: "grid",
  gap: "1rem",
  alignItems: "start",
  alignContent: "start",
  background: "var(--color-background-primary, #f8fafc)",
  color: "var(--color-text-primary, #1e293b)",
};

export default function OverlayStationShell({
  isMobile = false,
  contentLabel = "Estacion",
  eyebrow,
  title,
  description,
  headerContent = null,
  accent = "var(--tone-accent, #4338ca)",
  maxWidth = "1220px",
  onClose,
  closeLabel = "Volver",
  closeOnEscape = true,
  dismissOnBackdrop = false,
  children,
}) {
  return (
    <OverlayShell
      isMobile={isMobile}
      contentLabel={contentLabel}
      closeOnEscape={closeOnEscape}
      dismissOnBackdrop={dismissOnBackdrop}
      onDismiss={onClose}
    >
      <OverlaySurface
        isMobile={isMobile}
        maxWidth={maxWidth}
        paddingMobile="0"
        paddingDesktop="0"
        gap="0"
      >
        <div style={bodyStyle}>
          <section style={headerStyle(accent)}>
            <div>
              {eyebrow && (
                <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: accent }}>
                  {eyebrow}
                </div>
              )}
              {headerContent ? (
                <div style={{ marginTop: eyebrow ? "6px" : 0 }}>
                  {headerContent}
                </div>
              ) : (
                <>
                  {title && (
                    <div style={{ fontSize: "1.02rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", marginTop: eyebrow ? "4px" : 0 }}>
                      {title}
                    </div>
                  )}
                  {description && (
                    <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35, maxWidth: "56ch" }}>
                      {description}
                    </div>
                  )}
                </>
              )}
            </div>
            {onClose && (
              <button onClick={onClose} style={closeButtonStyle()}>
                {closeLabel}
              </button>
            )}
          </section>
          {children}
        </div>
      </OverlaySurface>
    </OverlayShell>
  );
}
