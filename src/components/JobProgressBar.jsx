import React, { useEffect } from "react";

const JOB_PROGRESS_STYLE_ID = "job-progress-bar-animations-v1";

function ensureJobProgressStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(JOB_PROGRESS_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = JOB_PROGRESS_STYLE_ID;
  style.textContent = `
    @keyframes jobProgressPulse {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.09); }
    }
    @keyframes jobProgressShimmer {
      0% { transform: translateX(-145%) skewX(-18deg); opacity: 0; }
      20% { opacity: 0.7; }
      65% { opacity: 0.7; }
      100% { transform: translateX(260%) skewX(-18deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

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
  useEffect(() => {
    ensureJobProgressStyles();
  }, []);

  const progress = getJobProgress(startedAt, endsAt, now);
  const isActive = progress > 0 && progress < 1;
  const width = `${Math.round(progress * 1000) / 10}%`;

  return (
    <div style={{ display: "grid", gap: compact ? "3px" : "4px" }}>
      <div
        style={{
          width: "100%",
          height,
          borderRadius: "999px",
          background: track,
          border: "1px solid var(--color-border-primary, #e2e8f0)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width,
            height: "100%",
            borderRadius: "999px",
            background: `linear-gradient(90deg, ${tone} 0%, ${tone} 58%, rgba(255,255,255,0.86) 100%)`,
            boxShadow: "0 0 0 1px rgba(2,6,23,0.08), 0 0 12px rgba(2,6,23,0.08)",
            transition: "width 900ms linear",
            position: "relative",
            overflow: "hidden",
            animation: isActive ? "jobProgressPulse 3600ms ease-in-out infinite" : "none",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-1px",
              bottom: "-1px",
              left: "-52%",
              width: "46%",
              borderRadius: "999px",
              pointerEvents: "none",
              background:
                "linear-gradient(102deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 52%, rgba(255,255,255,0) 100%)",
              opacity: isActive ? 1 : 0,
              animation: isActive ? "jobProgressShimmer 2800ms ease-in-out infinite" : "none",
            }}
          />
        </div>
      </div>
      {(showPercent || leftLabel || rightLabel) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            fontSize: compact ? "0.6rem" : "0.62rem",
            lineHeight: 1.2,
            color: "var(--color-text-secondary, #64748b)",
            fontWeight: "900",
          }}
        >
          <span>{leftLabel || (showPercent ? `${Math.round(progress * 100)}%` : "")}</span>
          <span>{rightLabel || ""}</span>
        </div>
      )}
    </div>
  );
}
