import React from "react";
import FlResourceCounter from "./FlResourceCounter.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlCostDisplay({
  costs = [],
  compact = false,
  enough = true,
  className = "",
}) {
  const normalizedCosts = Array.isArray(costs) ? costs : Object.entries(costs || {}).map(([type, value]) => ({ type, value }));

  return (
    <div className={cx("fl-cost-display", compact && "fl-cost-display--compact", !enough && "fl-cost-display--blocked", className)}>
      {normalizedCosts.length <= 0 ? (
        <span className="fl-cost-display__empty">Sin coste</span>
      ) : normalizedCosts.map(cost => (
        <FlResourceCounter
          key={`${cost.type}-${cost.label || cost.value}`}
          type={cost.type || "material"}
          label={cost.label || cost.type || "Coste"}
          value={cost.value ?? cost.amount ?? 0}
          compact={compact}
          icon={cost.icon}
          tone={cost.tone}
          className="fl-cost-display__resource"
        />
      ))}
    </div>
  );
}
