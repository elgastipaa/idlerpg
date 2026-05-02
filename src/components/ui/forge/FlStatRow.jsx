import React from "react";

const VALID_DELTA_TONES = new Set(["positive", "negative", "neutral", "success", "danger", "warning"]);
const VALID_STATES = new Set(["default", "increased", "decreased", "capped", "modified", "locked"]);
const VALID_VARIANTS = new Set(["default", "attribute"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function buildMilestoneNodes(currentLevel = 0, maxLevel = 0, step = 5) {
  const safeMax = Math.max(0, Number(maxLevel) || 0);
  const safeCurrent = Math.max(0, Number(currentLevel) || 0);
  const safeStep = Math.max(1, Number(step) || 1);
  if (safeMax <= 0) return [];

  const marks = [];
  for (let value = safeStep; value <= safeMax; value += safeStep) {
    marks.push(value);
  }
  if (!marks.length || marks[marks.length - 1] !== safeMax) {
    marks.push(safeMax);
  }

  return marks.map(mark => safeCurrent >= mark);
}

const FlStatRow = React.forwardRef(function FlStatRow(
  {
    variant = "default",
    icon = null,
    label,
    value,
    meta = "",
    description = "",
    progress = 0,
    nodes = [],
    currentLevel = null,
    maxLevel = null,
    milestoneStep = 5,
    milestoneFeedback = "pulse",
    trackFrame = "default",
    tone = "gold",
    action = null,
    delta = null,
    deltaTone = "neutral",
    hint = "",
    state = "default",
    compact = false,
    className = "",
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "default");
  const normalizedDeltaTone = normalizeOption(deltaTone, VALID_DELTA_TONES, "neutral");
  const normalizedState = normalizeOption(state, VALID_STATES, "default");
  const hasDelta = delta != null && delta !== "";
  const safeMaxLevel = maxLevel != null ? Math.max(0, Number(maxLevel) || 0) : 0;
  const safeCurrentLevel = currentLevel != null ? Math.max(0, Number(currentLevel) || 0) : 0;
  const levelDrivenProgress = safeMaxLevel > 0 ? (safeCurrentLevel / safeMaxLevel) * 100 : 0;
  const normalizedProgress = Math.max(
    0,
    Math.min(100, currentLevel != null && maxLevel != null ? levelDrivenProgress : (Number(progress) || 0))
  );
  const attributeNodes = Array.isArray(nodes) && nodes.length
    ? nodes
    : buildMilestoneNodes(safeCurrentLevel, safeMaxLevel, milestoneStep);
  const attributeNodeCount = Math.max(1, attributeNodes.length || 0);
  const reachedMilestoneIndex = attributeNodes.lastIndexOf(true);
  const reachedMilestoneCount = attributeNodes.reduce((count, active) => count + (active ? 1 : 0), 0);
  const [milestoneHitIndex, setMilestoneHitIndex] = React.useState(-1);
  const [levelPulse, setLevelPulse] = React.useState(false);
  const milestoneInitializedRef = React.useRef(false);
  const previousMilestoneCountRef = React.useRef(0);
  const previousLevelRef = React.useRef(safeCurrentLevel);
  const pulseTimeoutRef = React.useRef(null);
  const levelPulseTimeoutRef = React.useRef(null);

  React.useEffect(() => () => {
    if (pulseTimeoutRef.current) {
      window.clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = null;
    }
    if (levelPulseTimeoutRef.current) {
      window.clearTimeout(levelPulseTimeoutRef.current);
      levelPulseTimeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (normalizedVariant !== "attribute" || milestoneFeedback === "none") return;

    if (!milestoneInitializedRef.current) {
      milestoneInitializedRef.current = true;
      previousMilestoneCountRef.current = reachedMilestoneCount;
      return;
    }

    if (reachedMilestoneCount > previousMilestoneCountRef.current) {
      setMilestoneHitIndex(reachedMilestoneIndex);
      if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = window.setTimeout(() => {
        setMilestoneHitIndex(-1);
        pulseTimeoutRef.current = null;
      }, 760);
    }

    previousMilestoneCountRef.current = reachedMilestoneCount;
  }, [milestoneFeedback, normalizedVariant, reachedMilestoneCount, reachedMilestoneIndex]);

  React.useEffect(() => {
    if (normalizedVariant !== "attribute") return;
    const previousLevel = previousLevelRef.current;
    if (safeCurrentLevel > previousLevel) {
      setLevelPulse(true);
      if (levelPulseTimeoutRef.current) window.clearTimeout(levelPulseTimeoutRef.current);
      levelPulseTimeoutRef.current = window.setTimeout(() => {
        setLevelPulse(false);
        levelPulseTimeoutRef.current = null;
      }, 420);
    }
    previousLevelRef.current = safeCurrentLevel;
  }, [normalizedVariant, safeCurrentLevel]);

  if (normalizedVariant === "attribute") {
    const isMilestoneHit = milestoneHitIndex >= 0;
    const isLevelPulse = levelPulse && !isMilestoneHit;
    return (
      <div
        {...rest}
        ref={ref}
        className={cx(
          "fl-stat-row",
          "fl-stat-row--attribute",
          isMilestoneHit && "fl-stat-row--milestone-hit",
          isLevelPulse && "fl-stat-row--level-up-pulse",
          `forge-attribute-tone--${tone}`,
          className
        )}
        data-state={normalizedState}
        data-tone={tone}
      >
        {icon ? (
          <div className="forge-attribute-icon" aria-hidden="true">
            {icon}
          </div>
        ) : null}

        <div className="forge-attribute-copy">
          <div className="forge-attribute-topline">
            <span className="forge-attribute-name">{label}</span>
            {meta ? <span className="forge-attribute-level">{meta}</span> : null}
          </div>
          {description ? <div className="forge-attribute-description">{description}</div> : null}
          <div
            className={[
              "forge-attribute-track",
              trackFrame === "none" ? "forge-attribute-track--frameless" : "",
            ].filter(Boolean).join(" ")}
            aria-hidden="true"
          >
            <span className="forge-attribute-track-line" />
            <span
              className="forge-attribute-track-fill"
              data-progress={Math.round(normalizedProgress)}
              style={{ "--forge-attribute-progress": `${normalizedProgress}%` }}
            />
            <span
              className="forge-attribute-track-nodes"
              style={{ "--forge-attribute-node-count": attributeNodeCount }}
            >
              {attributeNodes.map((active, index) => (
                <span
                  key={`node-${index}`}
                  className={[
                    "forge-attribute-node",
                    active ? "forge-attribute-node--active" : "",
                    isMilestoneHit && index === milestoneHitIndex ? "forge-attribute-node--hit" : "",
                  ].filter(Boolean).join(" ")}
                />
              ))}
            </span>
          </div>
        </div>

        {action}
      </div>
    );
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        "fl-stat-row",
        compact && "fl-stat-row--compact",
        !icon && "fl-stat-row--no-icon",
        !hasDelta && "fl-stat-row--no-delta",
        className
      )}
      data-state={normalizedState}
    >
      {icon && <span className="fl-stat-row__icon" aria-hidden="true">{icon}</span>}
      <span className="fl-stat-row__label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <strong className="fl-stat-row__value">{value}</strong>
      {hasDelta && (
        <span className="fl-stat-row__delta" data-tone={normalizedDeltaTone}>
          {delta}
        </span>
      )}
    </div>
  );
});

export default FlStatRow;
