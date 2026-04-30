import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlIconButton from "./FlIconButton.jsx";
import FlIconFrame from "./FlIconFrame.jsx";
import FlResourceCounter from "./FlResourceCounter.jsx";

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
    menuAction,
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
  const safeResources = Array.isArray(resources) ? resources : [];

  return (
    <header
      {...rest}
      ref={ref}
      className={cx("fl-header-bar", `fl-header-bar--${normalizedVariant}`, className)}
    >
      <div className="fl-header-bar__hero">
        <FlIconFrame
          className="fl-header-bar__portrait"
          size="lg"
          variant="portrait"
          kind="portrait"
          asset={heroAsset}
          assetId={heroClass}
          fallbackIcon="hero"
        />
        {heroLevel !== "" && <span className="fl-header-bar__level">{heroLevel}</span>}
        <div className="fl-header-bar__copy">
          <strong>{heroName}</strong>
          {(status || activeContext) && (
            <span>
              {status || activeContext}
            </span>
          )}
        </div>
      </div>
      <div className="fl-header-bar__resources">
        {safeResources.map(resource => (
          <FlResourceCounter
            key={resource.id || resource.type || resource.label}
            compact={resource.compact ?? true}
            size={resource.size || "sm"}
            {...resource}
          />
        ))}
      </div>
      <FlIconButton
        className="fl-header-bar__menu"
        icon={<ForgeIcon name="more" size={20} />}
        ariaLabel="Menu"
        onClick={menuAction}
      />
    </header>
  );
});

export default FlHeaderBar;
