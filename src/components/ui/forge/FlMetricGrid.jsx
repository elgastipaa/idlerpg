import React from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeColumns(columns = 3) {
  const parsed = Number(columns);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(1, Math.min(6, Math.round(parsed)));
}

export default function FlMetricGrid({
  items = [],
  columns = 3,
  mobileColumns = 0,
  compact = false,
  className = "",
  emptyCopy = "",
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const normalizedColumns = normalizeColumns(columns);
  const normalizedMobileColumns = mobileColumns ? normalizeColumns(mobileColumns) : 0;
  const classes = cx(
    "fl-metric-grid",
    `fl-metric-grid--cols-${normalizedColumns}`,
    normalizedMobileColumns > 0 && `fl-metric-grid--mobile-cols-${normalizedMobileColumns}`,
    compact && "fl-metric-grid--compact",
    className
  );

  if (safeItems.length === 0) {
    if (!emptyCopy) return null;
    return <div className={cx("fl-metric-grid__empty", className)}>{emptyCopy}</div>;
  }

  return (
    <div className={classes}>
      {safeItems.map((item, index) => {
        const id = item?.id || item?.label || `metric-${index}`;
        const tone = item?.tone || "default";
        return (
          <div
            key={id}
            className={cx(
              "fl-metric-grid__card",
              tone !== "default" && `fl-metric-grid__card--${tone}`,
              item?.className || ""
            )}
          >
            <div className="fl-metric-grid__label">{item?.label || ""}</div>
            <div className="fl-metric-grid__value">{item?.value ?? "-"}</div>
            {item?.hint ? <div className="fl-metric-grid__hint">{item.hint}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
