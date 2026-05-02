import React from "react";

const VALID_SIZES = new Set(["sm", "md"]);
const VALID_VARIANTS = new Set(["pill", "rect"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeSize(value) {
  return VALID_SIZES.has(value) ? value : "md";
}

function normalizeVariant(value) {
  return VALID_VARIANTS.has(value) ? value : "pill";
}

const FlSwitch = React.forwardRef(function FlSwitch(
  {
    checked = false,
    disabled = false,
    onChange,
    label = "",
    size = "md",
    variant = "pill",
    className = "",
    ariaLabel = "",
    ...rest
  },
  ref
) {
  const normalizedSize = normalizeSize(size);
  const normalizedVariant = normalizeVariant(variant);
  const isDisabled = Boolean(disabled);
  const handleClick = () => {
    if (isDisabled) return;
    onChange?.(!checked);
  };

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked ? "true" : "false"}
      aria-label={ariaLabel || label || "Toggle"}
      disabled={isDisabled}
      className={cx(
        "fl-switch",
        `fl-switch--${normalizedSize}`,
        `fl-switch--${normalizedVariant}`,
        checked && "is-on",
        isDisabled && "is-disabled",
        className
      )}
      onClick={handleClick}
    >
      <span className="fl-switch__track" aria-hidden="true">
        <span className="fl-switch__knob" />
      </span>
      {label ? <span className="fl-switch__label">{label}</span> : null}
    </button>
  );
});

export default FlSwitch;
