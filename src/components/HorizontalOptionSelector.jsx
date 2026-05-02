import React from "react";

function defaultGetOptionId(option, index) {
  if (option && typeof option === "object" && option.id != null) return option.id;
  return String(index);
}

const EMPTY_STYLE = Object.freeze({});

export default function HorizontalOptionSelector({
  options = [],
  selectedId,
  onSelect,
  className = "",
  variant = "default",
  header = null,
  showArrows = true,
  prevLabel = "←",
  nextLabel = "→",
  getOptionId = defaultGetOptionId,
  getOptionKey = null,
  getArrowButtonStyle = null,
  getOptionButtonStyle = null,
  renderOption = null,
  rootStyle = {},
  headerRowStyle = {},
  headerContentStyle = {},
  arrowsContainerStyle = {},
  scrollWrapStyle = {},
  optionsRowStyle = {},
}) {
  const safeOptions = Array.isArray(options) ? options : [];
  const selectedIndex = safeOptions.findIndex((option, index) => getOptionId(option, index) === selectedId);
  const canMovePrev = selectedIndex > 0;
  const canMoveNext = selectedIndex >= 0 && selectedIndex < safeOptions.length - 1;

  const selectByIndex = index => {
    if (index < 0 || index >= safeOptions.length) return;
    if (typeof onSelect !== "function") return;
    onSelect(safeOptions[index], index);
  };

  const withStyle = style => (
    style && typeof style === "object" && Object.keys(style).length > 0
      ? { style }
      : EMPTY_STYLE
  );

  return (
    <div
      className={[
        "horizontal-option-selector",
        variant ? `horizontal-option-selector--${variant}` : "",
        className,
      ].filter(Boolean).join(" ")}
      {...withStyle(rootStyle)}
    >
      {(header != null || showArrows) && (
        <div
          className={[
            "horizontal-option-selector__header",
            header == null ? "horizontal-option-selector__header--end" : "",
          ].filter(Boolean).join(" ")}
          {...withStyle(headerRowStyle)}
        >
          {header != null ? <div className="horizontal-option-selector__header-content" {...withStyle(headerContentStyle)}>{header}</div> : null}
          {showArrows ? (
            <div
              className="horizontal-option-selector__arrows"
              {...withStyle(arrowsContainerStyle)}
            >
              <button
                type="button"
                onClick={() => selectByIndex(selectedIndex - 1)}
                disabled={!canMovePrev}
                className={[
                  "horizontal-option-selector__arrow",
                  "fl-button",
                  "fl-button--secondary",
                ].join(" ")}
                {...withStyle(typeof getArrowButtonStyle === "function" ? getArrowButtonStyle({ direction: "prev", disabled: !canMovePrev }) : null)}
              >
                {prevLabel}
              </button>
              <button
                type="button"
                onClick={() => selectByIndex(selectedIndex + 1)}
                disabled={!canMoveNext}
                className={[
                  "horizontal-option-selector__arrow",
                  "fl-button",
                  "fl-button--secondary",
                ].join(" ")}
                {...withStyle(typeof getArrowButtonStyle === "function" ? getArrowButtonStyle({ direction: "next", disabled: !canMoveNext }) : null)}
              >
                {nextLabel}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <div
        className="horizontal-option-selector__scroll"
        {...withStyle(scrollWrapStyle)}
      >
        <div
          className="horizontal-option-selector__options"
          {...withStyle(optionsRowStyle)}
        >
          {safeOptions.map((option, index) => {
            const optionId = getOptionId(option, index);
            const selected = optionId === selectedId;
            const optionKey = typeof getOptionKey === "function" ? getOptionKey(option, index) : optionId;
            return (
              <button
                key={optionKey}
                type="button"
                onClick={() => {
                  if (typeof onSelect !== "function") return;
                  onSelect(option, index);
                }}
                className={[
                  "horizontal-option-selector__option",
                  "fl-button",
                  selected ? "horizontal-option-selector__option--selected fl-button--selected" : "fl-button--secondary",
                ].filter(Boolean).join(" ")}
                data-selected={selected ? "true" : undefined}
                data-option-id={optionId}
                {...withStyle(typeof getOptionButtonStyle === "function" ? getOptionButtonStyle({ option, index, selected }) : null)}
              >
                {typeof renderOption === "function" ? renderOption({ option, index, selected }) : String(optionId)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
