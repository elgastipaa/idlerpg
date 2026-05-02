import React from "react";

const VALID_TONES = new Set(["neutral", "success", "danger", "warning", "arcane", "defense", "reward"]);
const VALID_SIZES = new Set(["sm", "md", "xs"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeTone(tone) {
  return VALID_TONES.has(tone) ? tone : "neutral";
}

function normalizeSize(size) {
  return VALID_SIZES.has(size) ? size : "md";
}

const FlTag = React.forwardRef(function FlTag(
  {
    as: Component = "span",
    tone = "neutral",
    size = "md",
    selected = false,
    removable = false,
    className = "",
    children,
    onRemove,
    ...rest
  },
  ref
) {
  const normalizedTone = normalizeTone(tone);
  const normalizedSize = normalizeSize(size);

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(
        "fl-tag",
        `fl-tag--${normalizedTone}`,
        `fl-tag--${normalizedSize}`,
        selected && "fl-tag--selected",
        removable && "fl-tag--removable",
        className
      )}
      data-selected={selected ? "true" : undefined}
    >
      <span className="fl-tag__label">{children}</span>
      {removable && (
        <button type="button" className="fl-tag__remove" aria-label="Quitar" onClick={onRemove}>
          x
        </button>
      )}
    </Component>
  );
});

export default FlTag;
