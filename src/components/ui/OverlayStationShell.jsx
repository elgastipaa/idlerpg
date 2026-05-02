import React from "react";
import OverlayShell, { OverlaySurface } from "../OverlayShell";
import FlButton from "./forge/FlButton.jsx";

const EMPTY_PROPS = Object.freeze({});

function withStyle(style) {
  return style && Object.keys(style).length > 0 ? { style } : EMPTY_PROPS;
}

export default function OverlayStationShell({
  isMobile = false,
  embedded = false,
  variant = "default",
  contentLabel = "Estacion",
  eyebrow,
  title,
  description,
  headerContent = null,
  shellClassName = "",
  surfaceClassName = "",
  bodyClassName = "",
  headerClassName = "",
  respectHeader = true,
  accent = "var(--tone-accent, #4338ca)",
  maxWidth = "1220px",
  zIndex,
  onClose,
  closeLabel = "Volver",
  closeOnEscape = true,
  dismissOnBackdrop = false,
  children,
}) {
  const isForge = variant === "forge";
  const stationStyle = { "--overlay-station-accent": accent };

  return (
    <OverlayShell
      isMobile={isMobile}
      embedded={embedded}
      variant={variant}
      contentLabel={contentLabel}
      className={[isForge ? "overlay-station-shell--forge" : "", shellClassName].filter(Boolean).join(" ")}
      respectHeader={respectHeader}
      zIndex={zIndex}
      closeOnEscape={closeOnEscape}
      dismissOnBackdrop={dismissOnBackdrop}
      onDismiss={onClose}
      >
        <OverlaySurface
          isMobile={isMobile}
          embedded={embedded}
          maxWidth={maxWidth}
          paddingMobile="0"
          paddingDesktop="0"
          gap="0"
          variant={variant}
          className={[isForge ? "overlay-station-surface--forge" : "", surfaceClassName].filter(Boolean).join(" ")}
        >
        <div
          className={[
            "overlay-station-body",
            isForge ? "overlay-station-body--forge" : "",
            bodyClassName,
          ].filter(Boolean).join(" ")}
        >
          <section
            className={[
              "overlay-station-header",
              isForge ? "overlay-station-header--forge" : "",
              headerClassName,
            ].filter(Boolean).join(" ")}
            {...withStyle(stationStyle)}
          >
            <div className="overlay-station-header-copy">
              {eyebrow && (
                <div className="overlay-station-eyebrow">
                  {eyebrow}
                </div>
              )}
              {headerContent ? (
                <div className={["overlay-station-header-content", eyebrow ? "overlay-station-header-content--with-eyebrow" : ""].filter(Boolean).join(" ")}>
                  {headerContent}
                </div>
              ) : (
                <>
                  {title && (
                    <div className={["overlay-station-title", eyebrow ? "overlay-station-title--with-eyebrow" : ""].filter(Boolean).join(" ")}>
                      {title}
                    </div>
                  )}
                  {description && (
                    <div className="overlay-station-description">
                      {description}
                    </div>
                  )}
                </>
              )}
            </div>
            {onClose && (
              isForge ? (
                <FlButton variant="secondary" size="sm" onClick={onClose}>
                  {closeLabel}
                </FlButton>
              ) : (
                <button className="overlay-station-close fl-button" onClick={onClose}>
                  {closeLabel}
                </button>
              )
            )}
          </section>
          {children}
        </div>
      </OverlaySurface>
    </OverlayShell>
  );
}
