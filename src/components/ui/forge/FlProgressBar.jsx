import React from "react";

const VALID_TYPES = new Set(["hp", "xp", "progress", "success", "error", "danger", "arcane", "reward", "loading"]);
const VALID_SIZES = new Set(["xs", "sm", "md", "lg"]);

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

function normalizeMilestone(milestone) {
  if (typeof milestone === "number") return { value: milestone, label: "" };
  return {
    value: Number(milestone?.value ?? milestone?.percent ?? 0),
    label: milestone?.label || "",
  };
}

const FlProgressBar = React.forwardRef(function FlProgressBar(
  {
    type = "progress",
    value = 0,
    max = 100,
    percent = null,
    label = "",
    leadingLabel = "",
    trailingLabel = "",
    milestones = [],
    segmented = false,
    size = "md",
    showValue = true,
    className = "",
    ...rest
  },
  ref
) {
  const normalizedType = normalizeOption(type, VALID_TYPES, "progress");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const resolvedPercent = resolvePercent(value, max, percent);
  const displayLabel = label || (showValue ? `${Math.round(resolvedPercent)}%` : "");
  const hasExplicitPercent = percent != null;
  const ariaMax = hasExplicitPercent ? 100 : Number(max || 100);
  const ariaNow = hasExplicitPercent ? Math.round(resolvedPercent) : Number(value || 0);
  const fillProps = { style: { "--fl-progress-percent": `${resolvedPercent}%` } };

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        "fl-progress",
        `fl-progress--${normalizedType}`,
        `fl-progress--${normalizedSize}`,
        segmented && "fl-progress--segmented",
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
        <div className="fl-progress__meta">
          <span>{leadingLabel}</span>
          <strong>{trailingLabel}</strong>
        </div>
      )}
      <div className="fl-progress__track">
        <span className="fl-progress__fill" {...fillProps} />
        {displayLabel && <span className="fl-progress__label">{displayLabel}</span>}
        {milestones.map((milestone, index) => {
          const normalized = normalizeMilestone(milestone);
          const milestonePercent = clampPercent(normalized.value);
          const milestoneProps = { style: { "--fl-progress-milestone-left": `${milestonePercent}%` } };
          return (
            <span
              key={`${milestonePercent}-${normalized.label || index}`}
              className="fl-progress__milestone"
              {...milestoneProps}
              title={normalized.label || `${milestonePercent}%`}
            />
          );
        })}
      </div>
    </div>
  );
});

export default FlProgressBar;
