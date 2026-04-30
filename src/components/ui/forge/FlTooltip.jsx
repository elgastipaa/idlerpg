import React from "react";

const VALID_VARIANTS = new Set(["simple", "rich", "stat-breakdown", "locked-reason", "cost-breakdown"]);
const VALID_PLACEMENTS = new Set(["top", "right", "bottom", "left"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlTooltip = React.forwardRef(function FlTooltip(
  {
    title = "",
    content = "",
    variant = "simple",
    placement = "top",
    open = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "simple");
  const normalizedPlacement = normalizeOption(placement, VALID_PLACEMENTS, "top");

  return (
    <span
      {...rest}
      ref={ref}
      className={cx("fl-tooltip", `fl-tooltip--${normalizedVariant}`, className)}
      data-open={open ? "true" : undefined}
      data-placement={normalizedPlacement}
    >
      <span className="fl-tooltip__trigger">{children}</span>
      <span className="fl-tooltip__bubble" role="tooltip">
        {title && <strong className="fl-tooltip__title">{title}</strong>}
        {content && <span className="fl-tooltip__content">{content}</span>}
      </span>
    </span>
  );
});

export default FlTooltip;
