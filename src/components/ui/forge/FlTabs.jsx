import React from "react";
import FlBadge from "./FlBadge.jsx";

const VALID_VARIANTS = new Set(["primary", "secondary", "compact", "segmented", "icon"]);
const VALID_SIZES = new Set(["sm", "md", "lg"]);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeOption(value, validOptions, fallback) {
  return validOptions.has(value) ? value : fallback;
}

function getItemId(item, index) {
  if (item && typeof item === "object" && item.id != null) return String(item.id);
  return String(index);
}

function getEnabledIndex(items, startIndex, direction) {
  if (!items.length) return -1;
  for (let step = 1; step <= items.length; step += 1) {
    const index = (startIndex + (step * direction) + items.length) % items.length;
    if (!items[index]?.disabled && !items[index]?.loading) return index;
  }
  return -1;
}

const FlTabs = React.forwardRef(function FlTabs(
  {
    items = [],
    activeId,
    onChange,
    variant = "primary",
    size = "md",
    ariaLabel = "Tabs",
    scrollable = true,
    fullWidth = false,
    disabled = false,
    className = "",
    tabClassName = "",
    renderLabel,
    ...rest
  },
  ref
) {
  const normalizedVariant = normalizeOption(variant, VALID_VARIANTS, "primary");
  const normalizedSize = normalizeOption(size, VALID_SIZES, "md");
  const safeItems = Array.isArray(items) ? items : [];
  const buttonRefs = React.useRef(new Map());
  const selectedIndex = safeItems.findIndex((item, index) => getItemId(item, index) === String(activeId));
  const fallbackIndex = safeItems.findIndex(item => !item?.disabled && !item?.loading);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : fallbackIndex;

  const selectItem = (item, index) => {
    if (disabled || item?.disabled || item?.loading) return;
    if (typeof onChange === "function") onChange(getItemId(item, index), item, index);
  };

  const focusIndex = index => {
    if (index < 0) return;
    const id = getItemId(safeItems[index], index);
    buttonRefs.current.get(id)?.focus();
  };

  const handleKeyDown = event => {
    const focusedId = event.target?.dataset?.tabId || event.currentTarget.dataset.activeId;
    const focusedIndex = safeItems.findIndex((item, index) => getItemId(item, index) === focusedId);
    const baseIndex = focusedIndex >= 0 ? focusedIndex : currentIndex;
    let nextIndex = -1;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = getEnabledIndex(safeItems, baseIndex, 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = getEnabledIndex(safeItems, baseIndex, -1);
    } else if (event.key === "Home") {
      nextIndex = safeItems.findIndex(item => !item?.disabled && !item?.loading);
    } else if (event.key === "End") {
      for (let index = safeItems.length - 1; index >= 0; index -= 1) {
        if (!safeItems[index]?.disabled && !safeItems[index]?.loading) {
          nextIndex = index;
          break;
        }
      }
    }

    if (nextIndex >= 0) {
      event.preventDefault();
      focusIndex(nextIndex);
    }
  };

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        "fl-tabs",
        `fl-tabs--${normalizedVariant}`,
        `fl-tabs--${normalizedSize}`,
        scrollable && "fl-tabs--scrollable",
        fullWidth && "fl-tabs--full",
        disabled && "fl-tabs--disabled",
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
      aria-disabled={disabled ? "true" : undefined}
      data-active-id={currentIndex >= 0 ? getItemId(safeItems[currentIndex], currentIndex) : undefined}
      onKeyDown={handleKeyDown}
    >
      {safeItems.map((item, index) => {
        const itemId = getItemId(item, index);
        const selected = index === currentIndex;
        const itemDisabled = disabled || Boolean(item.disabled) || Boolean(item.loading);
        const badgeValue = item.badge ?? item.count ?? null;

        return (
          <button
            key={item.key || itemId}
            ref={node => {
              if (node) buttonRefs.current.set(itemId, node);
              else buttonRefs.current.delete(itemId);
            }}
            type="button"
            className={cx(
              "fl-tabs__tab",
              selected && "fl-tabs__tab--selected",
              itemDisabled && "fl-tabs__tab--disabled",
              itemClassName(item),
              tabClassName
            )}
            role="tab"
            aria-selected={selected ? "true" : "false"}
            aria-controls={item.panelId || item.controls}
            aria-disabled={itemDisabled ? "true" : undefined}
            tabIndex={selected && !itemDisabled ? 0 : -1}
            disabled={itemDisabled}
            data-tab-id={itemId}
            data-state={item.loading ? "loading" : item.state || "default"}
            data-selected={selected ? "true" : undefined}
            data-onboarding-target={item.onboardingTarget}
            onClick={() => selectItem(item, index)}
          >
            {item.icon && <span className="fl-tabs__icon" aria-hidden="true">{item.icon}</span>}
            <span className="fl-tabs__label">
              {typeof renderLabel === "function" ? renderLabel({ item, index, selected }) : item.label ?? itemId}
            </span>
            {badgeValue != null && badgeValue !== "" && (
              <FlBadge className="fl-tabs__badge" variant="count" tone={item.badgeTone || item.tone || "neutral"} size="sm">
                {badgeValue}
              </FlBadge>
            )}
            {item.loading && <span className="fl-tabs__spinner" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
});

function itemClassName(item) {
  if (!item || typeof item !== "object") return "";
  return item.className || "";
}

export default FlTabs;
