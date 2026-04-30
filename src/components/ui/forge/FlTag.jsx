import React from "react";

const VALID_TONES = new Set(["neutral", "success", "danger", "warning", "arcane", "defense", "reward"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeTone(tone) {
  return VALID_TONES.has(tone) ? tone : "neutral";
}

const FlTag = React.forwardRef(function FlTag(
  {
    as: Component = "span",
    tone = "neutral",
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

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(
        "fl-tag",
        `fl-tag--${normalizedTone}`,
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
