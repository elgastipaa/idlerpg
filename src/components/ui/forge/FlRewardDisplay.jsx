import React from "react";
import FlBadge from "./FlBadge.jsx";
import FlIconFrame from "./FlIconFrame.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlRewardDisplay({
  icon = "claim",
  asset = null,
  title,
  value,
  detail,
  tone = "reward",
  className = "",
}) {
  return (
    <div className={cx("fl-reward-display", `fl-reward-display--${tone}`, className)}>
      <FlIconFrame size="md" variant={tone === "success" ? "upgraded" : "active"} asset={asset} kind="icon" fallbackIcon={icon} />
      <div className="fl-reward-display__copy">
        <div className="fl-reward-display__title">{title}</div>
        {detail && <div className="fl-reward-display__detail">{detail}</div>}
      </div>
      {value != null && value !== "" && <FlBadge tone={tone}>{value}</FlBadge>}
    </div>
  );
}
