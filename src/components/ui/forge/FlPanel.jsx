import React from "react";
import FlSectionHeader from "./FlSectionHeader.jsx";

const VALID_VARIANTS = new Set(["default", "hero", "section", "danger", "success", "arcane", "compact"]);
const VALID_STATES = new Set(["default", "selected", "disabled", "loading", "success", "error"]);
const VALID_SIZES = new Set(["sm", "md", "lg", "full"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlPanel = React.forwardRef(function FlPanel(
  {
    as: Component = "section",
    variant = "default",
    size = "md",
    state = "default",
    title = "",
    subtitle = "",
    eyebrow = "",
    icon = null,
    action = null,
    header = null,
    loading = false,
    selected = false,
    disabled = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "default");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const normalizedState = loading
    ? "loading"
    : disabled
      ? "disabled"
      : selected
        ? "selected"
        : normalizeOption(state, VALID_STATES, "default");
  const hasHeader = header || title || subtitle || eyebrow || icon || action;

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(
        "fl-panel",
        `fl-panel--${normalizedVariant}`,
        `fl-panel--${normalizedSize}`,
        selected && "fl-panel--selected",
        disabled && "fl-panel--disabled",
        className
      )}
      data-state={normalizedState}
      data-selected={selected ? "true" : undefined}
      aria-busy={loading ? "true" : undefined}
      aria-disabled={disabled ? "true" : undefined}
    >
      {hasHeader && (
        <div className="fl-panel__header">
          {header || (
            <FlSectionHeader
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              icon={icon}
              actions={action}
            />
          )}
        </div>
      )}
      <div className="fl-panel__body">{children}</div>
    </Component>
  );
});

export default FlPanel;
