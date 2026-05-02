import React from "react";

export default function FlQuickStatsGroup({ className = "", children }) {
  const classes = ["fl-quick-stats", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
