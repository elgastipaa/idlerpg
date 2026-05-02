import React from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlScreenHeader({
  eyebrow = "",
  title = "",
  subtitle = "",
  description = "",
  lead = null,
  end = null,
  chips = null,
  className = "",
  compact = false,
}) {
  const hasDualTitle = Boolean(title && subtitle);
  return (
    <header className={cx(
      "fl-screen-header",
      compact && "fl-screen-header--compact",
      hasDualTitle && "fl-screen-header--dual-title",
      className
    )}>
      <div className="fl-screen-header__row">
        <div className="fl-screen-header__main">
          {lead ? <div className="fl-screen-header__lead">{lead}</div> : null}
          <div className="fl-screen-header__copy">
            {eyebrow ? <div className="fl-screen-header__eyebrow">{eyebrow}</div> : null}
            {title ? <div className="fl-screen-header__title">{title}</div> : null}
            {subtitle ? <div className="fl-screen-header__subtitle">{subtitle}</div> : null}
            {description ? <div className="fl-screen-header__description">{description}</div> : null}
          </div>
        </div>
        {end ? <div className="fl-screen-header__end">{end}</div> : null}
      </div>
      {chips ? <div className="fl-screen-header__chips">{chips}</div> : null}
    </header>
  );
}
