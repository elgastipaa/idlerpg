import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlAsset from "./FlAsset.jsx";
import { getAssetFallbackIcon } from "../../../utils/assetRegistry";

const VALID_VARIANTS = new Set(["normal", "active", "upgraded", "epic", "legendary", "locked", "portrait"]);
const VALID_SIZES = new Set(["xs", "sm", "md", "lg", "xl"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlIconFrame = React.forwardRef(function FlIconFrame(
  {
    as: Component = "span",
    variant = "normal",
    size = "md",
    rarity = "",
    selected = false,
    locked = false,
    disabled = false,
    asset = null,
    assetId = "",
    src = "",
    kind = "icon",
    icon = null,
    fallbackIcon = "",
    className = "",
    children,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "normal");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const effectiveVariant = selected && normalizedVariant === "normal" ? "active" : normalizedVariant;
  const hasAsset = Boolean(asset || assetId || src);
  const iconName = fallbackIcon || (typeof icon === "string" ? icon : "") || getAssetFallbackIcon(kind);

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx(
        "fl-icon-frame",
        `fl-icon-frame--${effectiveVariant}`,
        `fl-icon-frame--${normalizedSize}`,
        selected && "fl-icon-frame--selected",
        locked && "fl-icon-frame--locked",
        disabled && "fl-icon-frame--disabled",
        rarity && `fl-rarity--${rarity}`,
        className
      )}
      data-variant={effectiveVariant}
      data-rarity={rarity || undefined}
      data-selected={selected ? "true" : undefined}
      aria-disabled={disabled || locked ? "true" : undefined}
    >
      {hasAsset ? (
        <FlAsset
          asset={asset}
          assetId={assetId}
          src={src}
          kind={kind}
          rarity={rarity}
          size="full"
          fallbackIcon={iconName}
          className="fl-icon-frame__asset"
        />
      ) : children ? (
        children
      ) : typeof icon === "string" || fallbackIcon ? (
        <ForgeIcon name={iconName} size={28} />
      ) : null}
    </Component>
  );
});

export default FlIconFrame;
