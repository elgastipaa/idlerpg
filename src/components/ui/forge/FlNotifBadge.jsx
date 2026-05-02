import React from "react";

const VALID_TONES = new Set(["neutral", "success", "danger", "warning", "arcane", "defense", "reward"]);
const VALID_SIZES = new Set(["xs", "sm", "md"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function formatBadgeValue(value) {
  if (value == null || value === "") return "";
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 99) return "99+";
  return String(value);
}

const FlNotifBadge = React.forwardRef(function FlNotifBadge(
  {
    as: Component = "span",
    tone = "danger",
    size = "sm",
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedTone = normalizeOption(tone, VALID_TONES, "danger");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "sm");
  const content = formatBadgeValue(children);
  if (!content) return null;

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx("fl-notif-badge", `fl-notif-badge--${normalizedSize}`, className)}
      data-tone={normalizedTone}
    >
      {content}
    </Component>
  );
});

export default FlNotifBadge;
