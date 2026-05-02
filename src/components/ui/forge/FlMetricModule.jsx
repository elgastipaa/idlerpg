import React from "react";
import FlMetricGrid from "./FlMetricGrid.jsx";
import FlModulePanel from "./FlModulePanel.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlMetricModule({
  title = "",
  subtitle = "",
  copy = "",
  tone = "default",
  primaryAction = null,
  secondaryAction = null,
  actions = null,
  metrics = [],
  columns = 3,
  compactMetrics = false,
  className = "",
  bodyClassName = "",
  metricsClassName = "",
  children,
}) {
  return (
    <FlModulePanel
      title={title}
      subtitle={subtitle}
      copy={copy}
      tone={tone}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      actions={actions}
      className={cx("fl-metric-module", className)}
      bodyClassName={cx("fl-metric-module__body", bodyClassName)}
    >
      <FlMetricGrid
        items={metrics}
        columns={columns}
        compact={compactMetrics}
        className={metricsClassName}
      />
      {children}
    </FlModulePanel>
  );
}
