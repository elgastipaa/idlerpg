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
  variant = "default",
  maxWidth = "1220px",
  paddingMobile = "12px 10px 16px",
  paddingDesktop = "14px 14px 16px",
  gap = "12px",
  className = "",
  style = {},
  children,
}) {
  const surfaceProps = {
    style: {
      "--overlay-surface-max-width": maxWidth,
      "--overlay-surface-padding-mobile": paddingMobile,
      "--overlay-surface-padding-desktop": paddingDesktop,
      "--overlay-surface-gap": gap,
      ...style,
    },
  };

  return (
    <div
      className={[
        "overlay-shell__surface",
        variant !== "default" ? `overlay-shell__surface--${variant}` : "",
        className,
      ].filter(Boolean).join(" ")}
      data-overlay-surface-variant={variant}
      {...surfaceProps}
    >
      {children}
    </div>
  );
}

export default function OverlayShell({
  isMobile = false,
  mode = "soft",
  variant = "default",
  className = "",
  respectHeader = mode === "soft",
  blockBackgroundScroll = true,
  dismissOnBackdrop = false,
  closeOnEscape = false,
  onDismiss,
  contentLabel = "Overlay",
  zIndex,
  backdrop = null,
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
  const shellProps = {
    style: {
      "--overlay-shell-top-inset": topInset,
      "--overlay-shell-bottom-inset": bottomInset,
      "--overlay-shell-backdrop": backdrop || "rgba(2, 6, 23, 0.72)",
      "--overlay-shell-z-index": resolvedZIndex,
    },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={contentLabel}
      data-overlay-shell-mode={mode}
      data-overlay-shell-variant={variant}
      onClick={handleBackdropClick}
      className={[
        "overlay-shell",
        variant !== "default" ? `overlay-shell--${variant}` : "",
        className,
      ].filter(Boolean).join(" ")}
      {...shellProps}
    >
      {children}
    </div>
  );
}
