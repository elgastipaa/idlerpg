import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlIconButton from "./FlIconButton.jsx";

const VALID_VARIANTS = new Set(["confirmation", "destructive", "reward", "error", "form", "offline", "full-screen"]);
const VALID_SIZES = new Set(["sm", "md", "lg", "full"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlModal = React.forwardRef(function FlModal(
  {
    open = false,
    title = "",
    tone = "",
    variant = "confirmation",
    size = "md",
    onClose,
    footer = null,
    closeLabel = "Cerrar",
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "confirmation");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  if (!open) return null;

  return (
    <div className={cx("fl-modal", className)} data-open="true">
      <div className="fl-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <section
        {...rest}
        ref={ref}
        className={cx("fl-modal__panel", `fl-modal__panel--${normalizedVariant}`, `fl-modal__panel--${normalizedSize}`)}
        data-tone={tone || undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title || undefined}
      >
        <header className="fl-modal__header">
          {title && <h2>{title}</h2>}
          {onClose && (
            <FlIconButton
              className="fl-modal__close"
              icon={<ForgeIcon name="close" size={20} />}
              ariaLabel={closeLabel}
              onClick={onClose}
            />
          )}
        </header>
        <div className="fl-modal__body">{children}</div>
        {footer && <footer className="fl-modal__footer">{footer}</footer>}
      </section>
    </div>
  );
});

export default FlModal;
