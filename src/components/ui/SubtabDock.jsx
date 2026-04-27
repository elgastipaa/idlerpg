import React from "react";

function subtabButtonStyle({ active = false, disabled = false, isMobile = false, tone = "var(--tone-accent, #4338ca)" } = {}) {
  return {
    border: "1px solid",
    borderColor: disabled
      ? "var(--color-border-primary, #e2e8f0)"
      : active
        ? tone
        : "var(--color-border-primary, #e2e8f0)",
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : active
        ? "var(--tone-accent-soft, #eef2ff)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : active
        ? tone
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: isMobile ? "8px 10px" : "10px 12px",
    fontSize: isMobile ? "0.68rem" : "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    minWidth: isMobile ? 0 : "110px",
    flex: "0 0 auto",
  };
}

function badgeStyle(tone = "success") {
  const background = tone === "danger"
    ? "var(--tone-danger, #ef4444)"
    : tone === "warning"
      ? "var(--tone-warning, #f59e0b)"
      : "var(--tone-success, #10b981)";
  return {
    minWidth: "18px",
    height: "18px",
    padding: "0 6px",
    borderRadius: "999px",
    background,
    color: "#fff",
    fontSize: "0.62rem",
    fontWeight: "900",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

const mobileDockStyle = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: "calc(var(--app-bottom-nav-offset, 72px) + env(safe-area-inset-bottom))",
  zIndex: 4900,
  background: "var(--color-background-secondary, #ffffff)",
  borderTop: "1px solid var(--color-border-secondary, #e2e8f0)",
  boxShadow: "0 -10px 24px rgba(15,23,42,0.08)",
  padding: "8px",
};

const desktopWrapStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

export default function SubtabDock({
  entries = [],
  activeId,
  onSelect,
  isMobile = false,
  mobileScrollable,
  spotlightAnimationName,
  style = {},
  rowStyle: customRowStyle = {},
}) {
  const scrollable = mobileScrollable ?? entries.length >= 5;
  const rowStyle = {
    display: "flex",
    gap: "8px",
    flexWrap: "nowrap",
    width: "100%",
    overflowX: scrollable ? "auto" : "hidden",
    overflowY: "hidden",
    scrollbarWidth: scrollable ? "none" : "auto",
    WebkitOverflowScrolling: "touch",
    ...customRowStyle,
  };
  const containerStyle = isMobile ? { ...mobileDockStyle, ...style } : { ...desktopWrapStyle, ...style };

  return (
    <div style={containerStyle}>
      <div style={isMobile ? rowStyle : { ...desktopWrapStyle, ...customRowStyle }}>
        {entries.map(entry => {
          const active = activeId === entry.id;
          const disabled = Boolean(entry.disabled);
          const spotlight = Boolean(entry.spotlight);
          return (
            <button
              key={entry.id}
              onClick={() => {
                if (disabled) return;
                onSelect?.(entry.id, entry);
              }}
              disabled={disabled}
              data-onboarding-target={entry.onboardingTarget}
              style={{
                ...subtabButtonStyle({ active, disabled, isMobile, tone: entry.tone }),
                minWidth: isMobile ? (scrollable ? "84px" : 0) : "110px",
                flex: isMobile ? (scrollable ? "0 0 auto" : "1 1 0") : "0 0 auto",
                whiteSpace: isMobile && scrollable ? "nowrap" : "normal",
                position: spotlight ? "relative" : "static",
                zIndex: spotlight ? 2 : 1,
                boxShadow: spotlight
                  ? "0 0 0 2px rgba(83,74,183,0.18), 0 10px 24px rgba(83,74,183,0.14)"
                  : "none",
                animation: spotlight && spotlightAnimationName
                  ? `${spotlightAnimationName} 1600ms ease-in-out infinite`
                  : "none",
                ...(entry.style || {}),
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>{entry.label}</span>
                {entry.badge != null && (
                  <span style={badgeStyle(entry.badgeTone)}>
                    {entry.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
