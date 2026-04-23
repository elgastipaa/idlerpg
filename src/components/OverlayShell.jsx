import React from "react";

export default function OverlayShell({
  isMobile = false,
  mode = "soft",
  respectHeader = mode === "soft",
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
  const resolvedZIndex = zIndex ?? (isMobile ? (mode === "soft" ? 4800 : 9800) : (mode === "soft" ? 9300 : 9800));

  return (
    <div
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
