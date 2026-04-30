import React from "react";
import FlProgressBar from "./FlProgressBar.jsx";

const VALID_VARIANTS = new Set(["enemy", "player", "boss", "compact"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlHealthBar = React.forwardRef(function FlHealthBar(
  {
    variant = "player",
    value = 0,
    max = 100,
    label = "",
    percent = null,
    icon = null,
    critical = false,
    size = "md",
    className = "",
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "player");
  const numericValue = Number(value || 0);
  const numericMax = Number(max || 0);
  const resolvedLabel = label || `${Math.max(0, Math.round(numericValue))} / ${Math.max(0, Math.round(numericMax))}`;

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        "fl-health-bar",
        `fl-health-bar--${normalizedVariant}`,
        critical && "fl-health-bar--critical",
        className
      )}
      data-critical={critical ? "true" : undefined}
    >
      {icon && <span className="fl-health-bar__icon" aria-hidden="true">{icon}</span>}
      <FlProgressBar
        className="fl-health-bar__progress"
        type={normalizedVariant === "player" ? "success" : "hp"}
        value={value}
        max={max}
        percent={percent}
        label={resolvedLabel}
        size={size}
      />
    </div>
  );
});

export default FlHealthBar;
