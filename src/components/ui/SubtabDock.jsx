import React from "react";

const EMPTY_PROPS = Object.freeze({});

function withStyle(style) {
  return style && typeof style === "object" && Object.keys(style).length > 0 ? { style } : EMPTY_PROPS;
}

export default function SubtabDock({
  entries = [],
  activeId,
  onSelect,
  isMobile = false,
  mobileScrollable,
  spotlightAnimationName,
  className = "",
  style = {},
  rowStyle: customRowStyle = {},
}) {
  const scrollable = mobileScrollable ?? entries.length >= 5;
  const dockClassName = [
    "subtab-dock",
    isMobile ? "subtab-dock--mobile" : "subtab-dock--desktop",
    scrollable ? "subtab-dock--scrollable" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={dockClassName} {...withStyle(style)}>
      <div className="subtab-dock-row" {...withStyle(customRowStyle)}>
        {entries.map(entry => {
          const active = activeId === entry.id;
          const disabled = Boolean(entry.disabled);
          const spotlight = Boolean(entry.spotlight);
          return (
            <button
              className={[
                "subtab-dock-button",
                active ? "subtab-dock-button--active" : "",
                disabled ? "subtab-dock-button--disabled" : "",
                spotlight ? "subtab-dock-button--spotlight" : "",
              ].filter(Boolean).join(" ")}
              key={entry.id}
              onClick={() => {
                if (disabled) return;
                onSelect?.(entry.id, entry);
              }}
              disabled={disabled}
              data-onboarding-target={entry.onboardingTarget}
              data-tone={entry.badgeTone || entry.tone || undefined}
              data-spotlight-animation={spotlight && spotlightAnimationName ? spotlightAnimationName : undefined}
              {...withStyle(entry.style)}
            >
              <span className="subtab-dock-button-content">
                <span>{entry.label}</span>
                {entry.badge != null && (
                  <span className="subtab-dock-badge" data-tone={entry.badgeTone || "success"}>
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
