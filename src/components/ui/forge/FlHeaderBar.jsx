import React from "react";
import FlAsset from "./FlAsset.jsx";
import ForgeIcon from "../../icons/ForgeIcon";

const VALID_VARIANTS = new Set(["default", "combat", "station", "compact"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlHeaderBar = React.forwardRef(function FlHeaderBar(
  {
    hero = {},
    resources = [],
    status = "",
    activeContext = "",
    onHeroClick,
    menuAction,
    menuAriaLabel = "Menu",
    badge = "",
    variant = "default",
    compact = false,
    className = "",
    ...rest
  },
  ref
) {
  const normalizedVariant = compact ? "compact" : normalizeOption(variant, VALID_VARIANTS, "default");
  const heroLevel = hero.level ?? "";
  const heroName = hero.name || hero.className || hero.class || "Heroe";
  const heroAsset = hero.asset || null;
  const heroClass = hero.class || hero.assetId || "warrior";
  const heroClassLabel = status || hero.classLabel || hero.className || "Libre";
  const safeResources = Array.isArray(resources) ? resources : [];
  const menuOnClick = typeof menuAction === "function" ? menuAction : menuAction?.onClick;
  const menuLabel = menuAction?.ariaLabel || menuAriaLabel;
  const menuIcon = menuAction?.icon || "more";

  return (
    <header
      {...rest}
      ref={ref}
      className={cx("fl-header-bar", `fl-header-bar--${normalizedVariant}`, className)}
    >
      <button
        type="button"
        className="fl-header-bar__hero"
        onClick={onHeroClick}
      >
        <span className="fl-header-bar__portrait" aria-hidden="true">
          <FlAsset
            className="fl-header-bar__portrait-asset"
            kind="portrait"
            asset={heroAsset}
            assetId={heroClass}
            size="sm"
            fallbackIcon="hero"
            alt=""
          />
          {heroLevel !== "" && <span className="fl-header-bar__level">{heroLevel}</span>}
        </span>
        <span className="fl-header-bar__copy">
          <strong className="fl-header-bar__name">{heroName}</strong>
          <span className="fl-header-bar__class">{heroClassLabel}</span>
          {activeContext && <span className="fl-header-bar__meta">{activeContext}</span>}
        </span>
        {badge && <span className="fl-header-bar__badge">{badge}</span>}
      </button>
      <div className="fl-header-bar__resources">
        {safeResources.map(resource => {
          const resourceKey = resource.id || resource.type || resource.label;
          const ResourceElement = resource.onClick ? "button" : "span";
          const resourceIcon = resource.icon || resource.type;
          const resourceValue = resource.value ?? resource.amount ?? resource.count ?? "";
          return (
            <ResourceElement
              key={resourceKey}
              type={resource.onClick ? "button" : undefined}
              className={cx(
                "fl-header-bar__resource",
                resource.tone && `fl-header-bar__resource--${resource.tone}`,
                resource.onClick && "fl-header-bar__resource--action"
              )}
              aria-label={resource.ariaLabel || resource.label}
              onClick={resource.onClick}
            >
              {resource.glyph ? (
                <span className="fl-header-bar__resource-glyph" aria-hidden="true">{resource.glyph}</span>
              ) : resourceIcon ? (
                <span className="fl-header-bar__resource-icon" aria-hidden="true">
                  <FlAsset kind="system" assetId={resourceIcon} size="sm" fallbackIcon={resourceIcon} alt="" />
                </span>
              ) : null}
              {resource.label && <span className="fl-header-bar__resource-label">{resource.label}</span>}
              <strong className="fl-header-bar__resource-value">{resourceValue}</strong>
              {resource.showPlus && <span className="fl-header-bar__resource-plus" aria-hidden="true">+</span>}
            </ResourceElement>
          );
        })}
      </div>
      <button
        type="button"
        className="fl-header-bar__menu"
        aria-label={menuLabel}
        onClick={menuOnClick}
      >
        {menuIcon === "grid" ? (
          <span className="fl-header-bar__grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        ) : (
          <ForgeIcon name={menuIcon} size={20} />
        )}
      </button>
    </header>
  );
});

export default FlHeaderBar;
