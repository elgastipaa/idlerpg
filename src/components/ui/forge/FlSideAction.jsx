import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlBadge from "./FlBadge.jsx";

const VALID_VARIANTS = new Set(["default", "primary", "toggle", "danger", "compact"]);
const VALID_SIZES = new Set(["xs", "sm", "md", "lg"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function resolveButtonVariant(variant, active) {
  if (variant === "danger") return "danger";
  if (variant === "primary") return "primary";
  if (variant === "toggle") return active ? "selected" : "secondary";
  if (variant === "compact") return "default";
  return "default";
}

function resolveButtonSize(size) {
  if (size === "lg") return "sm";
  if (size === "md") return "sm";
  if (size === "sm") return "xs";
  if (size === "xs") return "xs";
  return "xs";
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
  const buttonVariant = resolveButtonVariant(normalizedVariant, active);
  const buttonSize = resolveButtonSize(normalizedSize);
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
        "fl-button",
        `fl-button--${buttonVariant}`,
        `fl-button--${buttonSize}`,
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
