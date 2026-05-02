import React from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function FlEntropyTrack({
  current = 0,
  cap = 1,
  delta = 0,
  next = null,
  label = "Entropia",
  className = "",
  compact = false,
}) {
  const safeCap = Math.max(1, Number(cap || 1));
  const safeCurrent = clamp(Number(current || 0), 0, safeCap);
  const resolvedNext = next == null ? safeCurrent + Math.max(0, Number(delta || 0)) : Number(next || safeCurrent);
  const safeNext = clamp(resolvedNext, 0, safeCap);
  const currentPercent = clamp((safeCurrent / safeCap) * 100, 0, 100);
  const nextPercent = clamp((safeNext / safeCap) * 100, 0, 100);
  const hasDelta = Number(delta || 0) > 0;

  return (
    <div className={cx("fl-entropy-track", compact && "fl-entropy-track--compact", className)}>
      <div className="fl-entropy-track__meta">
        <span>{label}</span>
        <strong>{safeCurrent}/{safeCap}</strong>
        {hasDelta && <em>+{Number(delta || 0)}</em>}
      </div>
      <div
        className="fl-entropy-track__bar"
        style={{
          "--fl-entropy-current": `${currentPercent}%`,
          "--fl-entropy-next": `${nextPercent}%`,
        }}
        aria-label={`${label} ${safeCurrent} de ${safeCap}`}
      >
        <span className="fl-entropy-track__next" aria-hidden="true" />
        <span className="fl-entropy-track__current" aria-hidden="true" />
      </div>
    </div>
  );
}
