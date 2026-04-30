import React from "react";

export const Panel = React.forwardRef(function Panel({ children, style = {}, dense = false, ...rest }, ref) {
  const panelProps = style && Object.keys(style).length > 0 ? { style } : {};
  return (
    <section
      {...rest}
      ref={ref}
      className={["progress-panel", dense ? "progress-panel--dense" : ""].filter(Boolean).join(" ")}
      {...panelProps}
    >
      {children}
    </section>
  );
});

export function CardHeader({
  tag = "",
  title = "",
  badge = "",
  badgeTone = "var(--tone-accent, #4338ca)",
  badgeSurface = "var(--tone-accent-soft, #eef2ff)",
  dense = false,
}) {
  const badgeProps = {
    style: {
      "--progress-chip-tone": badgeTone,
      "--progress-chip-surface": badgeSurface,
    },
  };

  return (
    <div className={["progress-card-header", dense ? "progress-card-header--dense" : ""].filter(Boolean).join(" ")}>
      <div className="progress-card-header-copy">
        {tag ? (
          <div className="progress-card-header-tag">
            {tag}
          </div>
        ) : null}
        <div className="progress-card-header-title">
          {title}
        </div>
      </div>
      {badge ? (
        <span
          className="progress-card-header-badge"
          {...badgeProps}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

export function StatusChip({ label = "", tone = "var(--tone-accent, #4338ca)", surface = "var(--tone-accent-soft, #eef2ff)", dense = false }) {
  const chipProps = {
    style: {
      "--progress-chip-tone": tone,
      "--progress-chip-surface": surface,
    },
  };
  return (
    <span
      className={["progress-status-chip", dense ? "progress-status-chip--dense" : ""].filter(Boolean).join(" ")}
      {...chipProps}
    >
      {label}
    </span>
  );
}

export function ProgressBar({ percent = 0, tone = "var(--tone-warning, #f59e0b)", dense = false }) {
  const width = Math.max(0, Math.min(100, Number(percent || 0)));
  const barProps = { style: { "--progress-bar-width": `${width}%`, "--progress-bar-tone": tone } };
  return (
    <div
      className={["progress-primitive-bar", dense ? "progress-primitive-bar--dense" : ""].filter(Boolean).join(" ")}
      {...barProps}
    >
      <div className="progress-primitive-bar__fill" />
    </div>
  );
}

export function InlineAction({
  children,
  onClick,
  disabled = false,
  tone = "var(--tone-accent, #4338ca)",
  surface = "var(--tone-accent-soft, #eef2ff)",
  dense = false,
  filled = false,
}) {
  const actionProps = {
    style: {
      "--progress-action-tone": tone,
      "--progress-action-surface": surface,
    },
  };

  return (
    <button
      className={[
        "progress-inline-action",
        dense ? "progress-inline-action--dense" : "",
        filled ? "progress-inline-action--filled" : "",
      ].filter(Boolean).join(" ")}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...actionProps}
    >
      {children}
    </button>
  );
}
