import React, { useMemo } from "react";
import {
  buildRunSigilLoadoutProfile,
  formatRunSigilLoadout,
  getRunSigil,
  normalizeRunSigilIds,
  summarizeRunSigilLoadout,
} from "../data/runSigils";

function getPalette(dark = false) {
  if (dark) {
    return {
      border: "rgba(199,210,254,0.3)",
      background: "rgba(79,70,229,0.14)",
      title: "#c7d2fe",
      text: "#f8fafc",
      muted: "#cbd5e1",
      slotBorder: "rgba(199,210,254,0.3)",
      slotBackground: "rgba(30,41,59,0.4)",
      slotText: "#e2e8f0",
      positiveBg: "rgba(16,185,129,0.18)",
      positiveBorder: "rgba(16,185,129,0.35)",
      positiveText: "#a7f3d0",
      negativeBg: "rgba(244,63,94,0.16)",
      negativeBorder: "rgba(244,63,94,0.34)",
      negativeText: "#fecdd3",
    };
  }
  return {
    border: "rgba(99,102,241,0.22)",
    background: "var(--tone-accent-soft, #eef2ff)",
    title: "var(--tone-accent, #4338ca)",
    text: "var(--color-text-primary, #1e293b)",
    muted: "var(--color-text-secondary, #64748b)",
    slotBorder: "rgba(99,102,241,0.2)",
    slotBackground: "var(--color-background-secondary, #ffffff)",
    slotText: "var(--color-text-primary, #1e293b)",
    positiveBg: "var(--tone-success-soft, #ecfdf5)",
    positiveBorder: "rgba(16,185,129,0.28)",
    positiveText: "var(--tone-success-strong, #047857)",
    negativeBg: "var(--tone-danger-soft, #fff1f2)",
    negativeBorder: "rgba(244,63,94,0.22)",
    negativeText: "var(--tone-danger, #b91c1c)",
  };
}

function summarizeProfileRows(items = [], fallback = "") {
  const labels = (items || [])
    .slice(0, 2)
    .map(entry => entry?.label)
    .filter(Boolean);
  if (labels.length <= 0) return fallback;
  return labels.join(" · ");
}

export default function RunSigilCallout({
  runSigilIds = "free",
  slotCount = 1,
  title = "Sigilos activos",
  subtitle = "",
  dark = false,
  showDeltas = false,
}) {
  const safeSlots = Math.max(1, Number(slotCount || 1));
  const palette = getPalette(dark);

  const normalizedRunSigilIds = useMemo(
    () => normalizeRunSigilIds(runSigilIds, { slots: safeSlots }),
    [runSigilIds, safeSlots]
  );
  const loadoutLabel = useMemo(
    () => formatRunSigilLoadout(normalizedRunSigilIds),
    [normalizedRunSigilIds]
  );
  const loadoutSummary = useMemo(
    () => summarizeRunSigilLoadout(normalizedRunSigilIds),
    [normalizedRunSigilIds]
  );
  const loadoutProfile = useMemo(
    () => buildRunSigilLoadoutProfile(normalizedRunSigilIds),
    [normalizedRunSigilIds]
  );

  const rewardSummary = summarizeProfileRows(
    loadoutProfile?.boosts || [],
    "Sin premio directo."
  );
  const tradeoffSummary = summarizeProfileRows(
    loadoutProfile?.tradeoffs || [],
    "Sin coste visible."
  );

  return (
    <section
      style={{
        border: `1px solid ${palette.border}`,
        background: palette.background,
        borderRadius: "12px",
        padding: "9px 10px",
        display: "grid",
        gap: "7px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.56rem",
              fontWeight: "900",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: palette.title,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: "900",
              color: palette.text,
              marginTop: "3px",
              lineHeight: 1.25,
            }}
          >
            {loadoutLabel}
          </div>
          <div
            style={{
              fontSize: "0.63rem",
              color: palette.muted,
              marginTop: "3px",
              lineHeight: 1.35,
            }}
          >
            {loadoutSummary}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: "0.6rem",
                color: palette.muted,
                marginTop: "4px",
                lineHeight: 1.35,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            gap: "5px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {normalizedRunSigilIds.map((sigilId, index) => {
            const sigil = getRunSigil(sigilId);
            return (
              <span
                key={`run-sigil-slot-${index + 1}-${sigil.id}`}
                style={{
                  border: `1px solid ${palette.slotBorder}`,
                  background: palette.slotBackground,
                  color: palette.slotText,
                  borderRadius: "999px",
                  padding: "2px 7px",
                  fontSize: "0.56rem",
                  fontWeight: "900",
                  whiteSpace: "nowrap",
                }}
              >
                S{index + 1} {sigil.shortName || sigil.name}
              </span>
            );
          })}
        </div>
      </div>

      {showDeltas && (
        <div style={{ display: "grid", gap: "5px" }}>
          <div
            style={{
              fontSize: "0.58rem",
              fontWeight: "800",
              color: palette.positiveText,
              border: `1px solid ${palette.positiveBorder}`,
              background: palette.positiveBg,
              borderRadius: "8px",
              padding: "4px 7px",
              lineHeight: 1.3,
            }}
          >
            Premia: {rewardSummary}
          </div>
          <div
            style={{
              fontSize: "0.58rem",
              fontWeight: "800",
              color: palette.negativeText,
              border: `1px solid ${palette.negativeBorder}`,
              background: palette.negativeBg,
              borderRadius: "8px",
              padding: "4px 7px",
              lineHeight: 1.3,
            }}
          >
            Cede: {tradeoffSummary}
          </div>
        </div>
      )}
    </section>
  );
}
