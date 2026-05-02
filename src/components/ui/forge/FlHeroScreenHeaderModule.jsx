import React from "react";
import FlModulePanel from "./FlModulePanel.jsx";
import FlScreenHeader from "./FlScreenHeader.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlHeroScreenHeaderModule({
  title = "",
  headline = "",
  subtitle = "",
  description = "",
  portrait = null,
  end = null,
  chips = null,
  metrics = null,
  actions = null,
  className = "",
  bodyClassName = "",
  compact = false,
  children = null,
  ...rest
}) {
  return (
    <FlModulePanel
      {...rest}
      title={title}
      actions={actions}
      className={cx("fl-screen-header-module", "fl-hero-screen-header-module", className)}
      bodyClassName={cx("fl-screen-header-module__body", "fl-hero-screen-header-module__body", bodyClassName)}
    >
      <div className="fl-hero-screen-header-module__split">
        <div className="fl-hero-screen-header-module__portrait">
          {portrait}
        </div>
        <div className="fl-hero-screen-header-module__content">
          <FlScreenHeader
            className="fl-hero-screen-header-module__copy"
            compact={compact}
            title={headline}
            subtitle={subtitle}
            description={description}
            end={end}
            chips={chips}
          />
          {metrics ? (
            <div className="fl-screen-header-module__metrics fl-hero-screen-header-module__metrics">
              {metrics}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </FlModulePanel>
  );
}
