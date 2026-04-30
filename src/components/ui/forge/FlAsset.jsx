import React, { useMemo, useState } from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import { getAssetFallbackIcon, getForgeAsset } from "../../../utils/assetRegistry";

const VALID_KINDS = new Set([
  "item",
  "icon",
  "system",
  "enemy",
  "background",
  "weeklyBoss",
  "portrait",
  "station",
  "skill",
  "talent",
  "echo",
]);

const VALID_FITS = new Set(["contain", "cover", "fill"]);
const VALID_SIZES = new Set(["sm", "md", "lg", "xl", "full"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function resolveAsset({ asset, kind, assetId, src }) {
  if (asset?.src || asset?.fallbackIcon || asset?.kind) return asset;
  if (src) return { kind, id: assetId || "custom", src, fallbackIcon: getAssetFallbackIcon(kind) };
  if (assetId) return getForgeAsset(kind, assetId);
  return { kind, id: "unknown", src: "", fallbackIcon: getAssetFallbackIcon(kind) };
}

const FlAsset = React.forwardRef(function FlAsset(
  {
    asset = null,
    assetId = "",
    src = "",
    alt = "",
    kind = "icon",
    fallback = null,
    fallbackIcon = "",
    framed = false,
    rarity = "",
    fit = "contain",
    size = "md",
    loading = "lazy",
    className = "",
    imgClassName = "",
    onError,
    ...rest
  },
  ref
) {
  const normalizedKind = normalizeOption(kind, VALID_KINDS, "icon");
  const normalizedFit = normalizeOption(fit, VALID_FITS, "contain");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const resolvedAsset = useMemo(
    () => resolveAsset({ asset, kind: normalizedKind, assetId, src }),
    [asset, assetId, normalizedKind, src]
  );
  const [hasError, setHasError] = useState(false);
  const imageSrc = hasError ? "" : resolvedAsset?.src || "";
  const iconName = fallbackIcon || resolvedAsset?.fallbackIcon || getAssetFallbackIcon(normalizedKind);

  const handleError = event => {
    setHasError(true);
    if (onError) onError(event);
  };

  const fallbackNode = fallback || <ForgeIcon name={iconName} size={32} />;

  return (
    <span
      {...rest}
      ref={ref}
      className={cx(
        "fl-asset",
        `fl-asset--${normalizedKind}`,
        `fl-asset--${normalizedSize}`,
        framed && "fl-asset--framed",
        rarity && `fl-rarity--${rarity}`,
        className
      )}
      data-kind={normalizedKind}
      data-fit={normalizedFit}
      data-rarity={rarity || undefined}
      role={!imageSrc && alt ? "img" : undefined}
      aria-label={!imageSrc && alt ? alt : undefined}
    >
      {imageSrc ? (
        <img
          className={cx("fl-asset__img", imgClassName)}
          src={imageSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          draggable="false"
          onError={handleError}
        />
      ) : (
        <span className="fl-asset__fallback" aria-hidden={alt ? undefined : "true"}>
          {fallbackNode}
        </span>
      )}
    </span>
  );
});

export default FlAsset;
