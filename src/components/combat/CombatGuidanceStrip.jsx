import React from "react";

const cycleButtonStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "999px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-tertiary, #f8fafc)",
  color: "var(--color-text-secondary, #475569)",
  fontWeight: "900",
  cursor: "pointer",
  flexShrink: 0,
};

const goalClaimButtonStyle = {
  border: "none",
  background: "var(--tone-success, #1D9E75)",
  color: "#fff",
  borderRadius: "999px",
  padding: "5px 8px",
  fontSize: "0.56rem",
  fontWeight: "900",
  cursor: "pointer",
};

const progressBarWrapStyle = {
  height: 4,
  background: "var(--color-background-tertiary, #f1f5f9)",
  borderRadius: "999px",
  overflow: "hidden",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
};

export default function CombatGuidanceStrip({
  sessionGoals = [],
  goalIndex = 0,
  setGoalIndex,
  rotatingTip = null,
  dispatch,
}) {
  const rotatingGoal = sessionGoals[goalIndex % Math.max(1, sessionGoals.length)] || null;

  return (
    <>
      {rotatingGoal && (
        <section style={{ background: "var(--color-background-secondary, #fff)", borderRadius: "12px", padding: "6px 8px", border: "1px solid var(--color-border-primary, #e2e8f0)", display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => setGoalIndex(current => (current - 1 + sessionGoals.length) % sessionGoals.length)} style={cycleButtonStyle}>
            {"<"}
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", minWidth: 0 }}>
                <span style={{ fontSize: "0.46rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--color-background-tertiary, #f8fafc)", color: "var(--tone-accent, #534AB7)", border: "1px solid var(--color-border-primary, #e2e8f0)", textTransform: "uppercase", flexShrink: 0 }}>
                  {rotatingGoal.sessionArc}
                </span>
                <span style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {rotatingGoal.name}
                </span>
              </div>
              {rotatingGoal.completed ? (
                <button onClick={() => dispatch({ type: "CLAIM_GOAL", goalId: rotatingGoal.id })} style={goalClaimButtonStyle}>
                  CLAIM
                </button>
              ) : (
                <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", whiteSpace: "nowrap" }}>
                  {rotatingGoal.progress}/{rotatingGoal.targetValue}
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.54rem", color: "var(--color-text-tertiary, #94a3b8)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {rotatingGoal.hint || rotatingGoal.description}
            </div>
            <div style={{ ...progressBarWrapStyle, marginTop: "5px" }}>
              <div style={{ width: `${rotatingGoal.percent}%`, height: "100%", background: rotatingGoal.completed ? "var(--tone-success, #1D9E75)" : "var(--tone-accent, #534AB7)" }} />
            </div>
          </div>
          <button onClick={() => setGoalIndex(current => (current + 1) % sessionGoals.length)} style={cycleButtonStyle}>
            {">"}
          </button>
        </section>
      )}

      {rotatingTip && (
        <section style={{ background: "var(--color-background-secondary, #fff)", borderRadius: "12px", padding: "5px 8px", border: "1px solid var(--color-border-primary, #e2e8f0)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "0.5rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)", flexShrink: 0 }}>
            Consejo
          </div>
          <div style={{ minWidth: 0, flex: 1, fontSize: "0.58rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <strong style={{ color: "var(--color-text-primary, #1e293b)" }}>{rotatingTip.title}:</strong> {rotatingTip.body}
          </div>
        </section>
      )}
    </>
  );
}
