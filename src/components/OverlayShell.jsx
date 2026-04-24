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
  className = "",
  style = {},
  children,
}) {
  return (
    <div
      className={`overlay-shell__surface ${className}`.trim()}
      style={{
        width: "100%",
        maxWidth,
        maxHeight: "100%",
        "--overlay-surface-padding-mobile": paddingMobile,
        "--overlay-surface-padding-desktop": paddingDesktop,
        "--overlay-surface-gap": gap,
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
  const bottomInset = mode === "soft"
    ? "calc(var(--app-bottom-nav-offset, 72px) + env(safe-area-inset-bottom))"
    : "0px";
  const resolvedZIndex = zIndex ?? (
    mode === "hard"
      ? OVERLAY_Z_INDEX.hard
      : "var(--overlay-z-soft, 4800)"
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
      className="overlay-shell"
      style={{
        position: "fixed",
        inset: `${topInset} 0 ${bottomInset} 0`,
        background: backdrop,
        zIndex: resolvedZIndex,
      }}
    >
      {children}
    </div>
  );
}
