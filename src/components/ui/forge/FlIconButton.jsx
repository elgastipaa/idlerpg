import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";

const VALID_VARIANTS = new Set(["default", "active", "toggle", "destructive", "floating", "toolbar", "ghost"]);
const VALID_SIZES = new Set(["sm", "md", "lg"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlIconButton = React.forwardRef(function FlIconButton(
  {
    variant = "default",
    size = "md",
    type = "button",
    icon = null,
    badge = null,
    loading = false,
    disabled = false,
    selected = false,
    className = "",
    ariaLabel,
    children,
    onClick,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "default");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const isDisabled = disabled || loading;
  const content = children || (typeof icon === "string" ? <ForgeIcon name={icon} size={20} /> : icon);

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(
        "fl-icon-button",
        `fl-icon-button--${normalizedVariant}`,
        `fl-icon-button--${normalizedSize}`,
        selected && "fl-icon-button--selected",
        className
      )}
      data-selected={selected ? "true" : undefined}
      aria-label={ariaLabel}
      aria-busy={loading ? "true" : undefined}
      aria-pressed={selected ? "true" : undefined}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
    >
      <span className="fl-icon-button__icon" aria-hidden="true">
        {content}
      </span>
      {badge != null && badge !== "" && <span className="fl-icon-button__badge">{badge}</span>}
      {loading && <span className="fl-icon-button__spinner" aria-hidden="true" />}
      <span className="fl-icon-button__corner fl-icon-button__corner--tl" aria-hidden="true" />
      <span className="fl-icon-button__corner fl-icon-button__corner--tr" aria-hidden="true" />
      <span className="fl-icon-button__corner fl-icon-button__corner--br" aria-hidden="true" />
      <span className="fl-icon-button__corner fl-icon-button__corner--bl" aria-hidden="true" />
    </button>
  );
});

export default FlIconButton;
