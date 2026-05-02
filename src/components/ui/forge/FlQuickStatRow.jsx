import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";

export default function FlQuickStatRow({
  icon = "hero",
  label = "",
  value = "",
  className = "",
}) {
  const classes = ["fl-quick-stat-row", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <span className="fl-quick-stat-row__icon" aria-hidden="true">
        <ForgeIcon name={icon} size={18} />
      </span>
      <span className="fl-quick-stat-row__label">{label}</span>
      <strong className="fl-quick-stat-row__value">{value}</strong>
    </div>
  );
}
