import React, { useMemo } from "react";
import {
  buildRunSigilLoadoutProfile,
  formatRunSigilLoadout,
  getRunSigil,
  normalizeRunSigilIds,
  summarizeRunSigilLoadout,
} from "../data/runSigils";

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
    <section className="run-sigil-callout" data-dark={dark ? "true" : undefined}>
      <div className="run-sigil-callout__head">
        <div className="run-sigil-callout__copy">
          <div className="run-sigil-callout__eyebrow">
            {title}
          </div>
          <div className="run-sigil-callout__title">
            {loadoutLabel}
          </div>
          <div className="run-sigil-callout__summary">
            {loadoutSummary}
          </div>
          {subtitle ? (
            <div className="run-sigil-callout__subtitle">
              {subtitle}
            </div>
          ) : null}
        </div>

        <div className="run-sigil-callout__slots">
          {normalizedRunSigilIds.map((sigilId, index) => {
            const sigil = getRunSigil(sigilId);
            return (
              <span
                key={`run-sigil-slot-${index + 1}-${sigil.id}`}
                className="run-sigil-callout__slot"
              >
                S{index + 1} {sigil.shortName || sigil.name}
              </span>
            );
          })}
        </div>
      </div>

      {showDeltas && (
        <div className="run-sigil-callout__deltas">
          <div className="run-sigil-callout__delta run-sigil-callout__delta--positive">
            Premia: {rewardSummary}
          </div>
          <div className="run-sigil-callout__delta run-sigil-callout__delta--negative">
            Cede: {tradeoffSummary}
          </div>
        </div>
      )}
    </section>
  );
}
