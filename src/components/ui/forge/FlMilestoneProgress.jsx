import React from "react";

const VALID_TYPES = new Set(["hp", "xp", "progress", "success", "error", "danger", "arcane", "reward", "loading"]);
const VALID_SIZES = new Set(["sm", "md", "lg"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function clampPercent(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

function resolvePercent(value, max, percent) {
  if (percent != null) return clampPercent(percent);
  const numericValue = Number(value || 0);
  const numericMax = Math.max(0, Number(max || 0));
  if (!numericMax) return 0;
  return clampPercent((numericValue / numericMax) * 100);
}

function getMilestoneValue(milestone) {
  if (typeof milestone === "number") return milestone;
  if (milestone && typeof milestone === "object") {
    if (milestone.percent != null) return Number(milestone.percent);
    if (milestone.value != null) return Number(milestone.value);
  }
  return 0;
}

function getMilestoneLabel(milestone, fallbackPercent) {
  if (milestone && typeof milestone === "object" && milestone.label) return milestone.label;
  return `${Math.round(fallbackPercent)}%`;
}

function resolveMilestonePercent(milestone, max, hasExplicitPercent) {
  const rawValue = getMilestoneValue(milestone);
  if (hasExplicitPercent || (milestone && typeof milestone === "object" && milestone.percent != null)) {
    return clampPercent(rawValue);
  }
  const numericMax = Math.max(0, Number(max || 0));
  if (!numericMax) return 0;
  return clampPercent((rawValue / numericMax) * 100);
}

const FlMilestoneProgress = React.forwardRef(function FlMilestoneProgress(
  {
    type = "progress",
    value = 0,
    max = 100,
    percent = null,
    previewValue = null,
    previewPercent = null,
    milestones = [],
    size = "md",
    label = "",
    leadingLabel = "",
    trailingLabel = "",
    showValue = true,
    showMilestoneLabels = true,
    className = "",
    ...rest
  },
  ref
) {
  const normalizedType = normalizeOption(type, VALID_TYPES, "progress");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const resolvedPercent = resolvePercent(value, max, percent);
  const hasPreview = previewPercent != null || previewValue != null;
  const rawPreviewPercent = previewPercent != null
    ? clampPercent(previewPercent)
    : resolvePercent(previewValue, max, null);
  const resolvedPreviewPercent = hasPreview
    ? Math.max(resolvedPercent, rawPreviewPercent)
    : resolvedPercent;
  const hasExplicitPercent = percent != null;
  const displayLabel = label || (showValue ? `${Math.round(resolvedPercent)}%` : "");
  const ariaMax = hasExplicitPercent ? 100 : Number(max || 100);
  const ariaNow = hasExplicitPercent ? Math.round(resolvedPercent) : Number(value || 0);
  const safeMilestones = Array.isArray(milestones) ? milestones : [];
  const normalizedMilestones = safeMilestones.map((milestone, index) => {
    const milestonePercent = resolveMilestonePercent(milestone, max, hasExplicitPercent);
    const reached = resolvedPercent >= milestonePercent;
    const previewReached = resolvedPreviewPercent >= milestonePercent;
    return {
      id: `${milestonePercent}-${index}`,
      percent: milestonePercent,
      label: getMilestoneLabel(milestone, milestonePercent),
      reached,
      previewReached,
    };
  });
  const fillProps = { style: { "--fl-milestone-progress-percent": `${resolvedPercent}%` } };
  const previewProps = { style: { "--fl-milestone-progress-preview-percent": `${resolvedPreviewPercent}%` } };

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        "fl-milestone-progress",
        `fl-milestone-progress--${normalizedType}`,
        `fl-milestone-progress--${normalizedSize}`,
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={ariaMax}
      aria-valuenow={ariaNow}
      aria-label={label || leadingLabel || normalizedType}
      data-type={normalizedType}
      data-percent={Math.round(resolvedPercent)}
    >
      {(leadingLabel || trailingLabel) && (
        <div className="fl-milestone-progress__meta">
          <span>{leadingLabel}</span>
          <strong>{trailingLabel}</strong>
        </div>
      )}
      <div className="fl-milestone-progress__track">
        {hasPreview && <span className="fl-milestone-progress__preview" {...previewProps} />}
        <span className="fl-milestone-progress__fill" {...fillProps} />
        {displayLabel && <span className="fl-milestone-progress__label">{displayLabel}</span>}
        <div className="fl-milestone-progress__milestones" aria-hidden="true">
          {normalizedMilestones.map((milestone) => {
            const milestoneProps = { style: { "--fl-milestone-left": `${milestone.percent}%` } };
            return (
              <span
                key={milestone.id}
                className={cx(
                  "fl-milestone-progress__milestone",
                  milestone.reached ? "is-reached" : milestone.previewReached ? "is-preview" : "is-pending"
                )}
                {...milestoneProps}
                title={milestone.label}
              />
            );
          })}
        </div>
      </div>
      {showMilestoneLabels && normalizedMilestones.length > 0 && (
        <div className="fl-milestone-progress__labels" aria-hidden="true">
          {normalizedMilestones.map((milestone) => {
            const labelProps = { style: { "--fl-milestone-left": `${milestone.percent}%` } };
            return (
              <span key={`${milestone.id}-label`} className="fl-milestone-progress__milestone-label" {...labelProps}>
                {milestone.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default FlMilestoneProgress;
