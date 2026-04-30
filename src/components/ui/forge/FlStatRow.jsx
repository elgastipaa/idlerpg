import React from "react";

const VALID_DELTA_TONES = new Set(["positive", "negative", "neutral", "success", "danger", "warning"]);
const VALID_STATES = new Set(["default", "increased", "decreased", "capped", "modified", "locked"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlStatRow = React.forwardRef(function FlStatRow(
  {
    icon = null,
    label,
    value,
    delta = null,
    deltaTone = "neutral",
    hint = "",
    state = "default",
    compact = false,
    className = "",
    ...rest
  },
  ref
) {
  const normalizedDeltaTone = normalizeOption(deltaTone, VALID_DELTA_TONES, "neutral");
  const normalizedState = normalizeOption(state, VALID_STATES, "default");
  const hasDelta = delta != null && delta !== "";

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        "fl-stat-row",
        compact && "fl-stat-row--compact",
        !icon && "fl-stat-row--no-icon",
        !hasDelta && "fl-stat-row--no-delta",
        className
      )}
      data-state={normalizedState}
    >
      {icon && <span className="fl-stat-row__icon" aria-hidden="true">{icon}</span>}
      <span className="fl-stat-row__label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <strong className="fl-stat-row__value">{value}</strong>
      {hasDelta && (
        <span className="fl-stat-row__delta" data-tone={normalizedDeltaTone}>
          {delta}
        </span>
      )}
    </div>
  );
});

export default FlStatRow;
