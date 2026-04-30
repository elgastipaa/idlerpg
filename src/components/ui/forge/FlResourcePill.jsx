import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";

const VALID_TYPES = new Set(["gold", "essence", "xp", "material", "echo", "cost", "reward", "health", "neutral"]);
const VALID_SIZES = new Set(["sm", "md"]);

const DEFAULT_ICON_BY_TYPE = {
  gold: "gold",
  essence: "essence",
  xp: "xp",
  material: "loot",
  echo: "echoes",
  cost: "gold",
  reward: "claim",
  health: "health",
  neutral: "stats",
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlResourcePill = React.forwardRef(function FlResourcePill(
  {
    as: Component = "span",
    type = "neutral",
    size = "md",
    icon = null,
    label = "",
    value = "",
    tone = "",
    insufficient = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedType = normalizeOption(type, VALID_TYPES, "neutral");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const iconName = typeof icon === "string" ? icon : DEFAULT_ICON_BY_TYPE[normalizedType];

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(
        "fl-resource-pill",
        `fl-resource-pill--${normalizedType}`,
        `fl-resource-pill--${normalizedSize}`,
        insufficient && "fl-resource-pill--insufficient",
        className
      )}
      data-resource={normalizedType}
      data-tone={tone || undefined}
      data-insufficient={insufficient ? "true" : undefined}
    >
      {(icon || iconName) && (
        <span className="fl-resource-pill__icon" aria-hidden="true">
          {React.isValidElement(icon) ? icon : <ForgeIcon name={iconName} size={15} />}
        </span>
      )}
      {children || (
        <>
          {label && <span className="fl-resource-pill__label">{label}</span>}
          {value != null && value !== "" && <strong className="fl-resource-pill__value">{value}</strong>}
        </>
      )}
    </Component>
  );
});

export default FlResourcePill;
