import React, { useEffect } from "react";

export const OVERLAY_Z_INDEX = {
  softMobile: 4800,
  softDesktop: 9300,
  hard: 9800,
};

let bodyLockCount = 0;
let previousBodyOverflow = "";
let previousBodyOverscrollBehavior = "";

function lockBodyScroll() {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (!body) return;
  if (bodyLockCount === 0) {
    previousBodyOverflow = body.style.overflow;
    previousBodyOverscrollBehavior = body.style.overscrollBehavior;
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "contain";
  }
  bodyLockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (!body) return;
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) {
    body.style.overflow = previousBodyOverflow;
    body.style.overscrollBehavior = previousBodyOverscrollBehavior;
  }
}

export function OverlaySurface({
  isMobile = false,
  maxWidth = "1220px",
  paddingMobile = "12px 10px 16px",
  paddingDesktop = "14px 14px 16px",
  gap = "12px",
  style = {},
  children,
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        maxHeight: "100%",
        overflow: "auto",
        background: "var(--color-background-primary, #f8fafc)",
        color: "var(--color-text-primary, #1e293b)",
        borderRadius: isMobile ? "16px 16px 0 0" : "18px",
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        boxShadow: "0 24px 60px rgba(2,6,23,0.35)",
        display: "grid",
        gap,
        alignItems: "start",
        alignContent: "start",
        padding: isMobile ? paddingMobile : paddingDesktop,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function OverlayShell({
  isMobile = false,
  mode = "soft",
  respectHeader = mode === "soft",
  blockBackgroundScroll = true,
  dismissOnBackdrop = false,
  closeOnEscape = false,
  onDismiss,
  contentLabel = "Overlay",
  zIndex,
  backdrop = "rgba(2,6,23,0.72)",
  children,
}) {
  const topInset = mode === "soft" && respectHeader
    ? "var(--app-header-offset, 68px)"
    : "0px";
  const bottomInset = isMobile && mode === "soft"
    ? "calc(var(--app-bottom-nav-offset, 72px) + env(safe-area-inset-bottom))"
    : "0px";
  const resolvedZIndex = zIndex ?? (
    mode === "hard"
      ? OVERLAY_Z_INDEX.hard
      : (isMobile ? OVERLAY_Z_INDEX.softMobile : OVERLAY_Z_INDEX.softDesktop)
  );

  useEffect(() => {
    if (!blockBackgroundScroll) return undefined;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [blockBackgroundScroll]);

  useEffect(() => {
    if (!closeOnEscape || typeof onDismiss !== "function") return undefined;
    const handleKeyDown = event => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEscape, onDismiss]);

  const handleBackdropClick = event => {
    if (!dismissOnBackdrop || typeof onDismiss !== "function") return;
    if (event.target !== event.currentTarget) return;
    onDismiss();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={contentLabel}
      data-overlay-shell-mode={mode}
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: `${topInset} 0 ${bottomInset} 0`,
        background: backdrop,
        zIndex: resolvedZIndex,
        display: "flex",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "center",
        padding: isMobile ? "0" : "24px",
      }}
    >
      {children}
    </div>
  );
}
