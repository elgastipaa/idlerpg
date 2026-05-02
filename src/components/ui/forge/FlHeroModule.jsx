import React from "react";
import FlPanel from "./FlPanel.jsx";
import FlScreenHeader from "./FlScreenHeader.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const VALID_VARIANTS = new Set(["default", "sanctuary", "sanctuary-v2"]);

export default function FlHeroModule({
  variant = "default",
  eyebrow = "",
  title = "",
  subtitle = "",
  description = "",
  chips = null,
  end = null,
  className = "",
}) {
  const normalizedVariant = VALID_VARIANTS.has(variant) ? variant : "default";
  const variantClassName = normalizedVariant === "sanctuary-v2"
    ? "fl-hero-module--sanctuary fl-hero-module--sanctuary-v2"
    : `fl-hero-module--${normalizedVariant}`;
  return (
    <FlPanel
      variant="compact"
      className={cx("fl-hero-module", variantClassName, className)}
      header={(
        <FlScreenHeader
          className="fl-hero-module__header"
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          description={description}
          chips={chips}
          end={end}
        />
      )}
    >
      {null}
    </FlPanel>
  );
}
