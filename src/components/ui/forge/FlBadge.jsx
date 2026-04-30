import React from "react";

const VALID_TONES = new Set(["neutral", "success", "danger", "warning", "arcane", "defense", "reward"]);
const VALID_SIZES = new Set(["xs", "sm", "md"]);
const VALID_VARIANTS = new Set(["status", "pill", "count", "rarity", "tier", "lock", "notification", "comparison", "comparison-delta"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlBadge = React.forwardRef(function FlBadge(
  {
    as: Component = "span",
    tone = "neutral",
    size = "sm",
    variant = "status",
    rarity = "",
    icon = null,
    selected = false,
    disabled = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedTone = normalizeOption(tone, VALID_TONES, "neutral");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "sm");
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "status");

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(
        "fl-badge",
        `fl-badge--${normalizedVariant}`,
        `fl-badge--${normalizedSize}`,
        selected && "fl-badge--selected",
        disabled && "fl-badge--disabled",
        rarity && `fl-rarity--${rarity}`,
        className
      )}
      data-tone={normalizedTone}
      data-rarity={rarity || undefined}
      data-selected={selected ? "true" : undefined}
      aria-disabled={disabled ? "true" : undefined}
    >
      {icon && <span className="fl-badge__icon" aria-hidden="true">{icon}</span>}
      <span className="fl-badge__label">{children}</span>
    </Component>
  );
});

export default FlBadge;
