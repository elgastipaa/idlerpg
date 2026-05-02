import React from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlPaginationDots({
  count = 0,
  activeIndex = 0,
  onChange,
  className = "",
  ariaLabel = "Paginacion por puntos",
  disabled = false,
}) {
  const safeCount = Math.max(0, Number(count || 0));
  if (safeCount <= 1) return null;

  const safeIndex = Math.max(0, Math.min(Number(activeIndex || 0), safeCount - 1));

  return (
    <div className={cx("fl-pagination-dots", className)} role="tablist" aria-label={ariaLabel}>
      {Array.from({ length: safeCount }).map((_, index) => {
        const selected = index === safeIndex;
        const isDisabled = disabled || (typeof onChange !== "function");
        return (
          <button
            key={`dot-${index}`}
            type="button"
            role="tab"
            aria-selected={selected ? "true" : "false"}
            aria-label={`Ir a pagina ${index + 1}`}
            disabled={isDisabled}
            className={cx(
              "fl-pagination-dots__dot",
              selected && "fl-pagination-dots__dot--active"
            )}
            onClick={() => {
              if (isDisabled || selected) return;
              onChange(index);
            }}
          />
        );
      })}
    </div>
  );
}
