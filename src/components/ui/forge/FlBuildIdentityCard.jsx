import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";

export default function FlBuildIdentityCard({
  icon = "hero",
  title = "",
  description = "",
  meta = "",
  active = false,
  className = "",
}) {
  const classes = [
    "fl-build-identity-card",
    active ? "fl-build-identity-card--active" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      <div className="fl-build-identity-card__icon" aria-hidden="true">
        <ForgeIcon name={icon} size={28} />
      </div>
      <div className="fl-build-identity-card__copy">
        <strong>{title}</strong>
        <span>{description}</span>
        {meta ? <small>{meta}</small> : null}
      </div>
    </article>
  );
}
