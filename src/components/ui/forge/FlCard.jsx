import React from "react";

const VALID_VARIANTS = new Set(["default", "compact", "panel", "premium"]);
const VALID_STATES = new Set(["default", "pressed", "selected", "disabled", "locked", "loading", "success", "error"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlCard = React.forwardRef(function FlCard(
  {
    as,
    variant = "default",
    state = "default",
    selected = false,
    interactive = false,
    disabled = false,
    locked = false,
    loading = false,
    rarity = "",
    className = "",
    children,
    onClick,
    onKeyDown,
    tabIndex,
    type = "button",
    role,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "default");
  const computedState = loading
    ? "loading"
    : disabled
      ? "disabled"
      : locked
        ? "locked"
        : selected
          ? "selected"
          : normalizeOption(state, VALID_STATES, "default");
  const Component = as || (onClick ? "button" : "div");
  const isButton = Component === "button";
  const isInteractive = interactive || Boolean(onClick);

  const handleKeyDown = event => {
    if (!isInteractive || isButton || disabled || locked || loading) {
      if (onKeyDown) onKeyDown(event);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (onClick) onClick(event);
    }

    if (onKeyDown) onKeyDown(event);
  };

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(
        "fl-card",
        `fl-card--${normalizedVariant}`,
        isInteractive && "fl-card--interactive",
        selected && "fl-card--selected",
        rarity && `fl-rarity--${rarity}`,
        className
      )}
      data-state={computedState}
      data-selected={selected ? "true" : undefined}
      data-rarity={rarity || undefined}
      type={isButton ? type : undefined}
      disabled={isButton ? disabled || locked || loading : undefined}
      aria-disabled={!isButton && (disabled || locked || loading) ? "true" : undefined}
      aria-busy={loading ? "true" : undefined}
      role={role || (!isButton && isInteractive ? "button" : undefined)}
      tabIndex={!isButton && isInteractive && !disabled && !locked && !loading ? (tabIndex ?? 0) : tabIndex}
      onClick={disabled || locked || loading ? undefined : onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </Component>
  );
});

export default FlCard;
