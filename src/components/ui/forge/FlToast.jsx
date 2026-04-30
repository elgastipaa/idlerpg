import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlButton from "./FlButton.jsx";
import FlIconFrame from "./FlIconFrame.jsx";

const VALID_TONES = new Set(["info", "success", "warning", "error", "reward", "undo"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlToast = React.forwardRef(function FlToast(
  {
    tone = "info",
    icon = null,
    title = "",
    message = "",
    actionLabel = "",
    onAction,
    onClose,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedTone = normalizeOption(tone, VALID_TONES, "info");
  const iconName = typeof icon === "string" ? icon : normalizedTone === "success" ? "claim" : normalizedTone === "error" ? "locked" : "stats";

  return (
    <div
      {...rest}
      ref={ref}
      className={cx("fl-toast", `fl-toast--${normalizedTone}`, className)}
      role={normalizedTone === "error" ? "alert" : "status"}
      data-tone={normalizedTone}
    >
      <FlIconFrame className="fl-toast__icon" size="sm" variant={normalizedTone === "reward" ? "legendary" : "active"} icon={iconName}>
        {React.isValidElement(icon) ? icon : <ForgeIcon name={iconName} size={18} />}
      </FlIconFrame>
      <div className="fl-toast__copy">
        {title && <strong>{title}</strong>}
        {(message || children) && <span>{message || children}</span>}
      </div>
      {actionLabel && onAction && (
        <FlButton className="fl-toast__action" variant="ghost" size="sm" onClick={onAction}>
          {actionLabel}
        </FlButton>
      )}
      {onClose && (
        <button type="button" className="fl-toast__close" aria-label="Cerrar" onClick={onClose}>
          x
        </button>
      )}
    </div>
  );
});

export default FlToast;
