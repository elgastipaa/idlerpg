import React from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const VALID_TONES = new Set(["default", "weekly", "danger"]);

export default function FlPanelHeader({
  title = "",
  subtitle = "",
  copy = "",
  tone = "default",
  primaryAction = null,
  secondaryAction = null,
  actions = null,
  className = "",
}) {
  const normalizedTone = VALID_TONES.has(tone) ? tone : "default";
  const hasCopy = Boolean(copy);
  const hasStructuredActions = Boolean(primaryAction || secondaryAction);
  const resolvedActions = hasStructuredActions ? (
    <>
      {primaryAction}
      {secondaryAction}
    </>
  ) : actions;
  return (
    <div
      className={cx(
        "fl-panel-header-block",
        `fl-panel-header-block--tone-${normalizedTone}`,
        hasCopy && "fl-panel-header-block--with-copy",
        className
      )}
    >
      <div className="fl-panel-header-block__main">
        {title ? <div className="fl-panel-header-block__title">{title}</div> : null}
        {subtitle ? <div className="fl-panel-header-block__subtitle">{subtitle}</div> : null}
        {copy ? <div className="fl-panel-header-block__copy">{copy}</div> : null}
      </div>
      {resolvedActions ? <div className="fl-panel-header-block__actions">{resolvedActions}</div> : null}
    </div>
  );
}
