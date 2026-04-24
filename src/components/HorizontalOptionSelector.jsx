import React from "react";

function defaultGetOptionId(option, index) {
  if (option && typeof option === "object" && option.id != null) return option.id;
  return String(index);
}

function defaultArrowButtonStyle(disabled) {
  return {
    minWidth: "34px",
    padding: "4px 0",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-secondary, #ffffff)",
    color: "var(--color-text-primary, #1e293b)",
    borderRadius: "10px",
    fontSize: "0.72rem",
    fontWeight: "900",
    lineHeight: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
  };
}

function defaultOptionButtonStyle(selected) {
  return {
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: selected ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #ffffff)",
    color: selected ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #64748b)",
    borderRadius: "10px",
    padding: "6px 10px",
    fontSize: "0.66rem",
    fontWeight: "900",
    textAlign: "left",
    cursor: "pointer",
    flexShrink: 0,
  };
}

export default function HorizontalOptionSelector({
  options = [],
  selectedId,
  onSelect,
  header = null,
  showArrows = true,
  prevLabel = "←",
  nextLabel = "→",
  getOptionId = defaultGetOptionId,
  getOptionKey = null,
  getArrowButtonStyle = ({ disabled }) => defaultArrowButtonStyle(disabled),
  getOptionButtonStyle = ({ selected }) => defaultOptionButtonStyle(selected),
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

  return (
    <div style={{ display: "grid", gap: "8px", ...rootStyle }}>
      {(header != null || showArrows) && (
        <div
          style={{
            display: "flex",
            justifyContent: header != null ? "space-between" : "flex-end",
            gap: "10px",
            alignItems: "start",
            flexWrap: "wrap",
            ...headerRowStyle,
          }}
        >
          {header != null ? <div style={headerContentStyle}>{header}</div> : null}
          {showArrows ? (
            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                ...arrowsContainerStyle,
              }}
            >
              <button
                type="button"
                onClick={() => selectByIndex(selectedIndex - 1)}
                disabled={!canMovePrev}
                style={getArrowButtonStyle({ direction: "prev", disabled: !canMovePrev })}
              >
                {prevLabel}
              </button>
              <button
                type="button"
                onClick={() => selectByIndex(selectedIndex + 1)}
                disabled={!canMoveNext}
                style={getArrowButtonStyle({ direction: "next", disabled: !canMoveNext })}
              >
                {nextLabel}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <div
        style={{
          overflowX: "auto",
          paddingBottom: "2px",
          scrollbarWidth: "none",
          scrollBehavior: "smooth",
          ...scrollWrapStyle,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: "6px",
            minWidth: "max-content",
            ...optionsRowStyle,
          }}
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
                style={getOptionButtonStyle({ option, index, selected })}
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
