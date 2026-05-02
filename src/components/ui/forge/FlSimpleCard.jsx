import React from "react";
import FlCard from "./FlCard.jsx";

const VALID_TONES = new Set(["default", "danger", "success", "arcane", "defense", "weekly"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeTone(value) {
  return VALID_TONES.has(value) ? value : "default";
}

export default function FlSimpleCard({
  as = "article",
  title = "",
  subtitle = "",
  icon = null,
  tone = "default",
  items = [],
  className = "",
  children,
  ...rest
}) {
  const normalizedTone = normalizeTone(tone);
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <FlCard
      {...rest}
      as={as}
      variant="compact"
      tone={normalizedTone === "weekly" ? "weekly" : normalizedTone}
      className={cx("fl-simple-card", `fl-simple-card--tone-${normalizedTone}`, className)}
    >
      {(title || subtitle) && (
        <header className="fl-simple-card__head">
          {title ? (
            <div className="fl-simple-card__title">
              {icon ? <span className="fl-simple-card__title-icon" aria-hidden="true">{icon}</span> : null}
              <span>{title}</span>
            </div>
          ) : null}
          {subtitle ? <div className="fl-simple-card__subtitle">{subtitle}</div> : null}
        </header>
      )}

      {safeItems.length > 0 && (
        <ul className="fl-simple-card__list">
          {safeItems.map((item, index) => (
            <li key={`item-${index}`}>{item}</li>
          ))}
        </ul>
      )}

      {children ? <div className="fl-simple-card__body">{children}</div> : null}
    </FlCard>
  );
}
