import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function getItemId(item, index) {
  if (item && typeof item === "object" && item.id != null) return String(item.id);
  return String(index);
}

function findNextEnabledIndex(items, startIndex, direction, wrap = false) {
  if (!Array.isArray(items) || items.length <= 0) return -1;
  const stepCount = wrap ? items.length : items.length - 1;
  let index = startIndex;

  for (let step = 0; step < stepCount; step += 1) {
    index += direction;
    if (wrap) {
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
    }
    if (index < 0 || index >= items.length) return -1;
    if (!items[index]?.disabled) return index;
  }
  return -1;
}

export default function FlNavSelector({
  items = [],
  activeId = null,
  onChange,
  className = "",
  ariaLabel = "Selector de navegacion",
  prevAriaLabel = "Anterior",
  nextAriaLabel = "Siguiente",
  emptyLabel = "Sin secciones",
  positionTemplate = ({ index, total }) => `${index} de ${total} secciones`,
  wrap = false,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const activeIndex = safeItems.findIndex((item, index) => getItemId(item, index) === String(activeId));
  const fallbackIndex = safeItems.findIndex(item => !item?.disabled);
  const currentIndex = activeIndex >= 0 ? activeIndex : fallbackIndex;
  const currentItem = currentIndex >= 0 ? safeItems[currentIndex] : null;
  const total = safeItems.length;
  const prevIndex = currentIndex >= 0 ? findNextEnabledIndex(safeItems, currentIndex, -1, wrap) : -1;
  const nextIndex = currentIndex >= 0 ? findNextEnabledIndex(safeItems, currentIndex, 1, wrap) : -1;
  const subtitle = currentItem?.subtitle || (currentIndex >= 0 ? positionTemplate({ index: currentIndex + 1, total }) : "");

  const selectIndex = index => {
    if (index < 0 || index >= safeItems.length) return;
    const item = safeItems[index];
    if (!item || item.disabled || typeof onChange !== "function") return;
    onChange(getItemId(item, index), item, index);
  };

  return (
    <nav className={cx("fl-nav-selector", className)} aria-label={ariaLabel}>
      <div className="fl-nav-selector__step-wrap">
        <button
          type="button"
          className="fl-nav-selector__step fl-nav-selector__step--prev"
          aria-label={prevAriaLabel}
          onClick={() => selectIndex(prevIndex)}
          disabled={prevIndex < 0}
        >
          <ForgeIcon name="chevron-left" size={14} />
        </button>
      </div>

      <div className="fl-nav-selector__center">
        <div className="fl-nav-selector__title">
          {currentItem?.label || emptyLabel}
        </div>
        {subtitle ? (
          <div className="fl-nav-selector__subtitle">{subtitle}</div>
        ) : null}
      </div>

      <div className="fl-nav-selector__step-wrap">
        <button
          type="button"
          className="fl-nav-selector__step fl-nav-selector__step--next"
          aria-label={nextAriaLabel}
          onClick={() => selectIndex(nextIndex)}
          disabled={nextIndex < 0}
        >
          <ForgeIcon name="chevron-right" size={14} />
        </button>
      </div>
    </nav>
  );
}
