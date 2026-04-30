import React from "react";

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function getJobProgress(startedAt, endsAt, now = Date.now()) {
  const start = Number(startedAt || 0);
  const end = Number(endsAt || 0);
  const current = Number(now || Date.now());

  if (!Number.isFinite(end) || end <= 0) return 0;
  if (!Number.isFinite(start) || start <= 0 || end <= start) {
    return clamp01(current >= end ? 1 : 0);
  }
  return clamp01((current - start) / (end - start));
}

export default function JobProgressBar({
  startedAt,
  endsAt,
  now = Date.now(),
  tone = "var(--tone-info, #0369a1)",
  track = "var(--color-background-primary, #e2e8f0)",
  height = 7,
  leftLabel = null,
  rightLabel = null,
  showPercent = true,
  compact = false,
}) {
  const progress = getJobProgress(startedAt, endsAt, now);
  const isActive = progress > 0 && progress < 1;
  const width = `${Math.round(progress * 1000) / 10}%`;
  const progressProps = {
    style: {
      "--job-progress-height": `${height}px`,
      "--job-progress-track": track,
      "--job-progress-tone": tone,
      "--job-progress-width": width,
    },
  };

  return (
    <div
      className={["job-progress", compact ? "job-progress--compact" : "", isActive ? "job-progress--active" : ""].filter(Boolean).join(" ")}
      {...progressProps}
    >
      <div className="job-progress__track">
        <div className="job-progress__fill">
          <div className="job-progress__shine" aria-hidden="true" />
        </div>
      </div>
      {(showPercent || leftLabel || rightLabel) && (
        <div className="job-progress__meta">
          <span>{leftLabel || (showPercent ? `${Math.round(progress * 100)}%` : "")}</span>
          <span>{rightLabel || ""}</span>
        </div>
      )}
    </div>
  );
}
