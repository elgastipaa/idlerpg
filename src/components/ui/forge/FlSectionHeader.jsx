import React from "react";
import FlIconFrame from "./FlIconFrame.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlSectionHeader({
  eyebrow,
  title,
  subtitle,
  icon = null,
  actions = null,
  className = "",
}) {
  return (
    <header className={cx("fl-section-header", className)}>
      {icon && <FlIconFrame size="sm" icon={icon} fallbackIcon={icon} className="fl-section-header__icon" />}
      <div className="fl-section-header__copy">
        {eyebrow && <div className="fl-section-header__eyebrow">{eyebrow}</div>}
        {title && <div className="fl-section-header__title">{title}</div>}
        {subtitle && <div className="fl-section-header__subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="fl-section-header__actions">{actions}</div>}
    </header>
  );
}
