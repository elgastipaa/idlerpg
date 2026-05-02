import React from "react";
import FlPanel from "./FlPanel.jsx";
import FlPanelHeader from "./FlPanelHeader.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlModulePanel({
  title = "",
  subtitle = "",
  copy = "",
  tone = "default",
  primaryAction = null,
  secondaryAction = null,
  actions = null,
  className = "",
  bodyClassName = "",
  children,
}) {
  return (
    <FlPanel
      variant="compact"
      className={cx("fl-module-panel", className)}
      header={(
        <FlPanelHeader
          className="fl-module-panel__header"
          title={title}
          subtitle={subtitle}
          copy={copy}
          tone={tone}
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
          actions={actions}
        />
      )}
    >
      <div className={cx("fl-module-panel__body", bodyClassName)}>
        {children}
      </div>
    </FlPanel>
  );
}
