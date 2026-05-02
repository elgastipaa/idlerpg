import React from "react";
import FlModulePanel from "./FlModulePanel.jsx";
import FlScreenHeader from "./FlScreenHeader.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlScreenHeaderModule({
  title = "",
  tone = "default",
  headline = "",
  subtitle = "",
  description = "",
  lead = null,
  end = null,
  chips = null,
  metrics = null,
  actions = null,
  className = "",
  bodyClassName = "",
  compact = false,
  children = null,
}) {
  return (
    <FlModulePanel
      title={title}
      tone={tone}
      actions={actions}
      className={cx("fl-screen-header-module", className)}
      bodyClassName={cx("fl-screen-header-module__body", bodyClassName)}
    >
      <FlScreenHeader
        className="fl-screen-header-module__copy"
        compact={compact}
        title={headline}
        subtitle={subtitle}
        description={description}
        lead={lead}
        end={end}
        chips={chips}
      />
      {metrics ? (
        <div className="fl-screen-header-module__metrics">
          {metrics}
        </div>
      ) : null}
      {children}
    </FlModulePanel>
  );
}
