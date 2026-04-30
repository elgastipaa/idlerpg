import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlButton from "./FlButton.jsx";

const VALID_TYPES = new Set(["resource", "locked", "level", "inventory", "prereq"]);
const VALID_TONES = new Set(["neutral", "warning", "danger", "success", "arcane", "reward"]);

const DEFAULT_ICON_BY_TYPE = {
  resource: "gold",
  locked: "locked",
  level: "xp",
  inventory: "inventory",
  prereq: "more",
};

const DEFAULT_TONE_BY_TYPE = {
  resource: "warning",
  locked: "danger",
  level: "arcane",
  inventory: "reward",
  prereq: "neutral",
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function renderIcon(icon, type) {
  if (icon === false) return null;
  if (React.isValidElement(icon)) return icon;
  const iconName = typeof icon === "string" ? icon : DEFAULT_ICON_BY_TYPE[type];
  return <ForgeIcon name={iconName} size={18} />;
}

const FlRequirementHint = React.forwardRef(function FlRequirementHint(
  {
    type = "prereq",
    tone = null,
    title = "",
    label = "",
    detail = "",
    actionLabel = "",
    onAction,
    icon = null,
    compact = false,
    disabled = false,
    loading = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedType = normalizeOption(type, VALID_TYPES, "prereq");
  const normalizedTone = normalizeOption(tone || DEFAULT_TONE_BY_TYPE[normalizedType], VALID_TONES, "neutral");
  const resolvedTitle = title || label;
  const hasAction = Boolean(actionLabel && typeof onAction === "function");

  return (
    <aside
      {...rest}
      ref={ref}
      className={cx(
        "fl-requirement-hint",
        compact && "fl-requirement-hint--compact",
        disabled && "fl-requirement-hint--disabled",
        loading && "fl-requirement-hint--loading",
        className
      )}
      data-type={normalizedType}
      data-tone={normalizedTone}
      aria-busy={loading ? "true" : undefined}
    >
      <span className="fl-requirement-hint__icon" aria-hidden="true">
        {renderIcon(icon, normalizedType)}
      </span>
      <span className="fl-requirement-hint__copy">
        {resolvedTitle && <strong className="fl-requirement-hint__title">{resolvedTitle}</strong>}
        {detail && <span className="fl-requirement-hint__detail">{detail}</span>}
        {children && <span className="fl-requirement-hint__detail">{children}</span>}
      </span>
      {hasAction && (
        <FlButton
          className="fl-requirement-hint__action"
          variant="ghost"
          size="sm"
          disabled={disabled}
          loading={loading}
          onClick={onAction}
        >
          {actionLabel}
        </FlButton>
      )}
    </aside>
  );
});

export default FlRequirementHint;
