import React from "react";

const VALID_VARIANTS = new Set(["primary", "secondary", "ghost", "danger", "danger-ghost", "destructive", "success", "compact", "icon-only"]);
const VALID_SIZES = new Set(["sm", "md", "lg", "full", "full-width"]);
const VALID_STATES = new Set(["default", "pressed", "loading", "success", "error"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function renderSlot(slot, className, ariaHidden = true) {
  if (!slot) return null;
  return (
    <span className={className} aria-hidden={ariaHidden ? "true" : undefined}>
      {slot}
    </span>
  );
}

const FlButton = React.forwardRef(function FlButton(
  {
    variant = "secondary",
    size = "md",
    type = "button",
    icon = null,
    trailingIcon = null,
    badge = null,
    cost = null,
    loading = false,
    disabled = false,
    selected = false,
    state = "default",
    className = "",
    children,
    ariaLabel,
    onClick,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "secondary");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const normalizedState = loading ? "loading" : normalizeOption(state, VALID_STATES, "default");
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(
        "fl-button",
        `fl-button--${normalizedVariant}`,
        `fl-button--${normalizedSize}`,
        selected && "fl-button--selected",
        className
      )}
      data-state={normalizedState}
      data-selected={selected ? "true" : undefined}
      aria-label={ariaLabel}
      aria-busy={loading ? "true" : undefined}
      aria-pressed={selected ? "true" : undefined}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
    >
      {renderSlot(icon, "fl-button__icon")}
      <span className="fl-button__content">
        <span className="fl-button__label">{children}</span>
        {cost != null && cost !== "" && <span className="fl-button__cost">{cost}</span>}
      </span>
      {renderSlot(trailingIcon, "fl-button__icon fl-button__icon--trailing")}
      {badge != null && badge !== "" && <span className="fl-button__badge">{badge}</span>}
      {loading && <span className="fl-button__spinner" aria-hidden="true" />}
      <span className="fl-button__corner fl-button__corner--tl" aria-hidden="true" />
      <span className="fl-button__corner fl-button__corner--tr" aria-hidden="true" />
      <span className="fl-button__corner fl-button__corner--br" aria-hidden="true" />
      <span className="fl-button__corner fl-button__corner--bl" aria-hidden="true" />
    </button>
  );
});

export default FlButton;
