import React from "react";

export function Panel({ children, style = {}, dense = false }) {
  return (
    <section
      style={{
        background: "var(--color-background-secondary, #ffffff)",
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        borderRadius: dense ? "12px" : "14px",
        padding: dense ? "10px" : "12px",
        display: "grid",
        gap: dense ? "8px" : "10px",
        boxShadow: "0 8px 24px var(--color-shadow, rgba(15, 23, 42, 0.08))",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  tag = "",
  title = "",
  badge = "",
  badgeTone = "var(--tone-accent, #4338ca)",
  badgeSurface = "var(--tone-accent-soft, #eef2ff)",
  dense = false,
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: dense ? "8px" : "10px", alignItems: "start", flexWrap: "wrap" }}>
      <div style={{ minWidth: 0, display: "grid", gap: dense ? "2px" : "3px" }}>
        {tag ? (
          <div style={{ fontSize: dense ? "0.54rem" : "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-tertiary, #94a3b8)" }}>
            {tag}
          </div>
        ) : null}
        <div style={{ fontSize: dense ? "0.76rem" : "0.82rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
          {title}
        </div>
      </div>
      {badge ? (
        <span
          style={{
            fontSize: dense ? "0.56rem" : "0.6rem",
            fontWeight: "900",
            color: badgeTone,
            border: `1px solid ${badgeTone}`,
            background: badgeSurface,
            borderRadius: "999px",
            padding: dense ? "3px 6px" : "4px 7px",
            whiteSpace: "nowrap",
          }}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

export function StatusChip({ label = "", tone = "var(--tone-accent, #4338ca)", surface = "var(--tone-accent-soft, #eef2ff)", dense = false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: `1px solid ${tone}`,
        background: surface,
        color: tone,
        borderRadius: "999px",
        padding: dense ? "3px 6px" : "4px 8px",
        fontSize: dense ? "0.56rem" : "0.6rem",
        fontWeight: "900",
      }}
    >
      {label}
    </span>
  );
}

export function ProgressBar({ percent = 0, tone = "var(--tone-warning, #f59e0b)", dense = false }) {
  const width = Math.max(0, Math.min(100, Number(percent || 0)));
  return (
    <div style={{ width: "100%", height: dense ? "5px" : "6px", borderRadius: "999px", overflow: "hidden", background: "var(--color-background-tertiary, #f1f5f9)", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
      <div style={{ width: `${width}%`, height: "100%", background: tone }} />
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
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        border: `1px solid ${tone}`,
        background: filled ? tone : surface,
        color: filled ? "#fff" : tone,
        borderRadius: "999px",
        padding: dense ? "6px 9px" : "7px 10px",
        fontSize: dense ? "0.58rem" : "0.62rem",
        fontWeight: "900",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {children}
    </button>
  );
}
