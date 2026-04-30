import React from "react";
import FlIconFrame from "./FlIconFrame.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlEmptyState({
  icon = "locked",
  title = "Sin datos",
  detail = "",
  action = null,
  tone = "neutral",
  className = "",
}) {
  return (
    <div className={cx("fl-empty-state", `fl-empty-state--${tone}`, className)}>
      <FlIconFrame size="lg" icon={icon} fallbackIcon={icon} className="fl-empty-state__icon" />
      <div className="fl-empty-state__copy">
        <div className="fl-empty-state__title">{title}</div>
        {detail && <div className="fl-empty-state__detail">{detail}</div>}
      </div>
      {action && <div className="fl-empty-state__action">{action}</div>}
    </div>
  );
}
