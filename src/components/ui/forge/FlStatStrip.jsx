import React from "react";
import FlStatRow from "./FlStatRow.jsx";

const VALID_VARIANTS = new Set(["combat", "summary", "cost", "hero", "compact"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlStatStrip = React.forwardRef(function FlStatStrip(
  {
    items = [],
    variant = "summary",
    compact = false,
    columns = null,
    className = "",
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "summary");
  const safeItems = Array.isArray(items) ? items : [];
  const stripProps = columns ? { style: { "--fl-stat-strip-columns": columns } } : {};

  return (
    <div
      {...rest}
      {...stripProps}
      ref={ref}
      className={cx(
        "fl-stat-strip",
        `fl-stat-strip--${normalizedVariant}`,
        compact && "fl-stat-strip--compact",
        className
      )}
    >
      {safeItems.map((item, index) => (
        <FlStatRow
          key={item.id || item.label || index}
          className="fl-stat-strip__cell"
          icon={item.icon}
          label={item.label}
          value={item.value}
          delta={item.delta}
          deltaTone={item.deltaTone}
          hint={item.hint}
          state={item.state}
          compact={compact || item.compact}
        />
      ))}
    </div>
  );
});

export default FlStatStrip;
