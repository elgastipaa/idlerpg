import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import FlBadge from "./FlBadge.jsx";
import FlIconFrame from "./FlIconFrame.jsx";

const VALID_VARIANTS = new Set(["fixed", "static", "compact", "icon-label"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function getItemId(item, index) {
  return String(item?.id ?? index);
}

const FlBottomNav = React.forwardRef(function FlBottomNav(
  {
    items = [],
    activeId,
    onChange,
    variant = "static",
    fixed = false,
    safeArea = true,
    ariaLabel = "Navegacion principal",
    className = "",
    ...rest
  },
  ref
) {
  const normalizedVariant = fixed ? "fixed" : normalizeOption(variant, VALID_VARIANTS, "static");
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <nav
      {...rest}
      ref={ref}
      className={cx(
        "fl-bottom-nav",
        `fl-bottom-nav--${normalizedVariant}`,
        safeArea && "fl-bottom-nav--safe-area",
        className
      )}
      aria-label={ariaLabel}
    >
      {safeItems.map((item, index) => {
        const itemId = getItemId(item, index);
        const selected = String(activeId) === itemId || item.active;
        const disabled = Boolean(item.disabled || item.locked);
        const iconNode = React.isValidElement(item.icon)
          ? item.icon
          : item.icon
            ? <ForgeIcon name={item.icon} size={24} />
            : null;

        return (
          <button
            key={item.key || itemId}
            type="button"
            className={cx(
              "fl-bottom-nav__item",
              selected && "fl-bottom-nav__item--active",
              disabled && "fl-bottom-nav__item--disabled"
            )}
            aria-current={selected ? "page" : undefined}
            disabled={disabled}
            onClick={disabled ? undefined : () => onChange?.(itemId, item, index)}
          >
            <FlIconFrame
              className="fl-bottom-nav__icon"
              size="md"
              selected={selected}
              locked={item.locked}
              icon={React.isValidElement(item.icon) ? null : item.icon}
              fallbackIcon={item.icon || "more"}
            >
              {iconNode}
            </FlIconFrame>
            <span className="fl-bottom-nav__label">{item.label || itemId}</span>
            {item.badge != null && item.badge !== "" && (
              <FlBadge className="fl-bottom-nav__badge" variant="count" tone={item.badgeTone || "danger"} size="sm">
                {item.badge}
              </FlBadge>
            )}
          </button>
        );
      })}
    </nav>
  );
});

export default FlBottomNav;
