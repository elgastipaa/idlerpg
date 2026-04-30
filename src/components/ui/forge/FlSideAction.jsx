import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlBadge from "./FlBadge.jsx";

const VALID_VARIANTS = new Set(["default", "primary", "toggle", "danger", "compact"]);
const VALID_SIZES = new Set(["sm", "md", "lg"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlSideAction = React.forwardRef(function FlSideAction(
  {
    icon = null,
    label,
    badge = null,
    active = false,
    variant = "default",
    size = "md",
    disabled = false,
    loading = false,
    className = "",
    onClick,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "default");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const iconNode = React.isValidElement(icon)
    ? icon
    : icon
      ? <ForgeIcon name={icon} size={22} />
      : null;

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={cx(
        "fl-side-action",
        `fl-side-action--${normalizedVariant}`,
        `fl-side-action--${normalizedSize}`,
        active && "fl-side-action--active",
        loading && "fl-side-action--loading",
        className
      )}
      data-active={active ? "true" : undefined}
      aria-pressed={variant === "toggle" ? active : undefined}
      aria-busy={loading ? "true" : undefined}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
    >
      {iconNode && <span className="fl-side-action__icon" aria-hidden="true">{iconNode}</span>}
      <span className="fl-side-action__label">{label}</span>
      {badge != null && badge !== "" && (
        <FlBadge className="fl-side-action__badge" variant="count" tone="danger" size="sm">
          {badge}
        </FlBadge>
      )}
      {loading && <span className="fl-side-action__spinner" aria-hidden="true" />}
    </button>
  );
});

export default FlSideAction;
