import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlAsset from "./FlAsset.jsx";

const VALID_TYPES = new Set(["gold", "essence", "fire", "echo", "material", "points", "xp", "health", "talent"]);
const VALID_SIZES = new Set(["sm", "md", "lg"]);

const DEFAULT_ICON_BY_TYPE = {
  gold: "gold",
  essence: "essence",
  fire: "fire",
  echo: "echoes",
  material: "loot",
  points: "talents",
  xp: "xp",
  health: "health",
  talent: "talents",
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlResourceCounter = React.forwardRef(function FlResourceCounter(
  {
    type = "gold",
    icon = null,
    asset = null,
    assetId = "",
    label = "",
    value = "",
    cap = null,
    delta = null,
    compact = false,
    size = "md",
    loading = false,
    insufficient = false,
    capped = false,
    onAdd,
    className = "",
    ...rest
  },
  ref
) {
  const normalizedType = normalizeOption(type, VALID_TYPES, "gold");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const iconName = typeof icon === "string" ? icon : DEFAULT_ICON_BY_TYPE[normalizedType];

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        "fl-resource-counter",
        `fl-resource-counter--${normalizedType}`,
        `fl-resource-counter--${normalizedSize}`,
        compact && "fl-resource-counter--compact",
        loading && "fl-resource-counter--loading",
        insufficient && "fl-resource-counter--insufficient",
        capped && "fl-resource-counter--capped",
        className
      )}
      data-resource={normalizedType}
      aria-busy={loading ? "true" : undefined}
    >
      <span className="fl-resource-counter__icon" aria-hidden="true">
        {icon && typeof icon !== "string" ? (
          icon
        ) : asset || assetId ? (
          <FlAsset kind="system" asset={asset} assetId={assetId || iconName} size="sm" fallbackIcon={iconName} alt="" />
        ) : (
          <ForgeIcon name={iconName} size={18} />
        )}
      </span>
      <div className="fl-resource-counter__copy">
        {label && !compact && <span className="fl-resource-counter__label">{label}</span>}
        <strong className="fl-resource-counter__value">
          {value}{cap != null && cap !== "" ? <span> / {cap}</span> : null}
        </strong>
        {delta != null && delta !== "" && <span className="fl-resource-counter__delta">{delta}</span>}
      </div>
      {onAdd && (
        <button type="button" className="fl-resource-counter__add" onClick={onAdd} aria-label={`Agregar ${label || normalizedType}`}>
          +
        </button>
      )}
    </div>
  );
});

export default FlResourceCounter;
