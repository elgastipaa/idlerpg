import React from "react";
import FlBadge from "./FlBadge.jsx";
import FlButton from "./FlButton.jsx";
import FlCard from "./FlCard.jsx";
import FlIconFrame from "./FlIconFrame.jsx";
import FlTag from "./FlTag.jsx";
import { getItemAsset } from "../../../utils/assetRegistry";

const VALID_VARIANTS = new Set(["equipped", "loot", "compact", "featured", "comparison"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

const FlItemCard = React.forwardRef(function FlItemCard(
  {
    item = {},
    variant = "loot",
    selected = false,
    actions = null,
    onClick,
    className = "",
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "loot");
  const asset = getItemAsset(item);
  const rarity = item?.rarity || "common";
  const title = item?.name || item?.title || "Item";
  const power = item?.power || item?.rating || item?.itemPower || "";
  const affixes = Array.isArray(item?.affixes) ? item.affixes.slice(0, normalizedVariant === "compact" ? 2 : 3) : [];

  return (
    <FlCard
      {...rest}
      ref={ref}
      variant={normalizedVariant === "featured" || normalizedVariant === "equipped" ? "premium" : "default"}
      rarity={rarity}
      selected={selected}
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={cx("fl-item-card", `fl-item-card--${normalizedVariant}`, className)}
    >
      <FlIconFrame
        className="fl-item-card__icon"
        size={normalizedVariant === "compact" ? "md" : "xl"}
        rarity={rarity}
        asset={asset}
        kind="item"
        fallbackIcon={asset.fallbackIcon}
      />
      <div className="fl-item-card__copy">
        <FlBadge className="fl-item-card__rarity" variant="rarity" rarity={rarity}>
          {rarity}
        </FlBadge>
        <strong className="fl-item-card__title">{title}</strong>
        {power !== "" && <span className="fl-item-card__power">P {power}</span>}
        {affixes.length > 0 && (
          <div className="fl-item-card__affixes">
            {affixes.map((affix, index) => (
              <FlTag key={`${affix?.stat || affix?.label || "affix"}-${index}`} tone={affix?.tone || "success"}>
                {affix?.label || affix?.stat || affix?.value || "Afijo"}
              </FlTag>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="fl-item-card__actions">{actions}</div>}
      {!actions && normalizedVariant === "comparison" && (
        <div className="fl-item-card__actions">
          <FlButton size="sm" variant="secondary">Comparar</FlButton>
        </div>
      )}
    </FlCard>
  );
});

export default FlItemCard;
