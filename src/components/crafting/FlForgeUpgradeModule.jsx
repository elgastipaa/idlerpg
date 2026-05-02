import React from "react";
import ForgeIcon from "../icons/ForgeIcon";
import {
  FlAsset,
  FlBadge,
  FlButton,
  FlCard,
  FlEntropyTrack,
  FlMilestoneProgress,
  FlRequirementHint,
  FlResourceCounter,
  FlStatRow,
} from "../ui/forge";
import { getCompactRarityLabel } from "../../utils/itemVisuals";

function clampUpgradeLevel(value) {
  return Math.min(15, Math.max(0, Number(value || 0)));
}

export default function FlForgeUpgradeModule({
  selectedItem = null,
  hasAnyItems = false,
  onOpenItemDrawer,
  craftingOutcome = null,
  resultTone = "neutral",
  resultState = "default",
  resultStateLabel = "Vista previa",
  selectedItemAsset = null,
  craftingItemIconName = "forge",
  currentUpgradeLevel = 0,
  nextUpgradeLevel = 0,
  currentRatingValue = 0,
  nextRatingValue = 0,
  selectedEntropy = 0,
  selectedEntropyCap = 1,
  selectedActionEntropyCost = 0,
  selectedEntropyRatio = 0,
  selectedEntropyNextRatio = 0,
  selectedActionReq = { can: false, reason: "missing_req" },
  selectedActionHint = "",
  craftingHeroRows = [],
  formatNumber = value => String(value ?? 0),
  formatStatValue = (_key, value) => String(value ?? 0),
  formatDiffValue = (_key, value) => String(value ?? 0),
  statLabels = {},
  selectedActionDisabled = true,
  onExecutePrimaryAction,
  selectedActionCostLabel = "",
  requirementHintType = "prereq",
  craftingLog = [],
}) {
  const boundedCurrentLevel = clampUpgradeLevel(currentUpgradeLevel);
  const boundedNextLevel = clampUpgradeLevel(nextUpgradeLevel);

  if (!selectedItem) {
    return (
      <div className="fl-crafting-stage fl-crafting-stage--empty fl-forge-upgrade-module">
        <FlCard
          as="button"
          className="fl-crafting-item-card fl-crafting-item-card--empty fl-forge-upgrade-module__empty-card"
          variant="premium"
          disabled={!hasAnyItems}
          onClick={onOpenItemDrawer}
          aria-label="Seleccionar item para mejorar"
        >
          <div className="fl-crafting-item-empty-plus" aria-hidden="true">+</div>
          <div className="fl-crafting-item-name">Selecciona un item</div>
          <div className="fl-crafting-empty">Abre la mochila de forja para elegir una pieza.</div>
        </FlCard>
      </div>
    );
  }

  return (
    <div className="fl-forge-upgrade-module">
      <div className="fl-crafting-stage">
        <FlCard
          as="button"
          className="fl-crafting-item-card"
          variant="premium"
          rarity={selectedItem?.rarity}
          data-outcome={craftingOutcome?.tone || undefined}
          onClick={onOpenItemDrawer}
          aria-label="Seleccionar otro item para mejorar"
        >
          <FlBadge className="fl-crafting-item-rarity" variant="rarity" rarity={selectedItem?.rarity} size="sm">
            {getCompactRarityLabel(selectedItem?.rarity)}
          </FlBadge>
          <FlBadge className="fl-crafting-item-level" variant="rect" tone="defense" size="sm">
            +{currentUpgradeLevel}
          </FlBadge>
          <div className="fl-crafting-item-art">
            <FlAsset
              className="fl-crafting-item-asset"
              asset={selectedItemAsset}
              kind="item"
              rarity={selectedItem?.rarity}
              size="xl"
              alt={selectedItem?.name || "Item"}
              fallbackIcon={craftingItemIconName}
            />
          </div>
          <div className="fl-crafting-item-name">{selectedItem?.name}</div>
        </FlCard>

        <FlCard as="aside" className="fl-crafting-material-panel" variant="compact">
          <div className="fl-crafting-material-section">
            <FlResourceCounter
              className="fl-crafting-material-counter"
              type="material"
              icon="forge"
              label="Material principal"
              value="Piedra de Forja"
              delta={selectedActionReq.can ? "Disponible" : selectedActionHint || "Bloqueado"}
            />
          </div>
          <div className="fl-crafting-material-section">
            <FlResourceCounter
              className="fl-crafting-probability"
              type={selectedActionReq.can ? "points" : "material"}
              icon="armor"
              label="Probabilidad de exito"
              value="100%"
              capped={selectedActionReq.can}
              insufficient={!selectedActionReq.can}
            />
          </div>
        </FlCard>

        <article className="fl-crafting-neutral-section fl-crafting-result-card" data-state={resultState}>
          <div
            key={craftingOutcome?.id ? `state-${craftingOutcome.id}` : "state-neutral"}
            className={["fl-crafting-result-state", `is-${resultTone}`].filter(Boolean).join(" ")}
          >
            {resultStateLabel}
          </div>
          <div className="fl-crafting-result-level">
            <span>+{currentUpgradeLevel}</span>
            <b>»</b>
            <strong>+{nextUpgradeLevel}</strong>
          </div>
          <div className="fl-crafting-result-power-label">Poder</div>
          <div className="fl-crafting-result-power">
            <span>{formatNumber(currentRatingValue)}</span>
            <b>»</b>
            <strong>{formatNumber(nextRatingValue)}</strong>
          </div>
        </article>
      </div>

      <div className="fl-divider fl-crafting-divider" aria-hidden="true" />

      <section className="fl-crafting-neutral-section fl-crafting-entropy-panel" aria-label="Entropia de mejora">
        <FlEntropyTrack
          current={selectedEntropy}
          cap={selectedEntropyCap}
          delta={selectedActionEntropyCost}
          next={selectedEntropy + selectedActionEntropyCost}
          compact
        />
      </section>

      <div className="fl-divider fl-crafting-divider" aria-hidden="true" />

      <section className="fl-crafting-neutral-section fl-crafting-upgrade-milestones" aria-label="Hitos de mejora">
        <FlMilestoneProgress
          className="fl-crafting-upgrade-milestone-progress"
          type="progress"
          value={boundedCurrentLevel}
          previewValue={boundedNextLevel}
          max={15}
          label={`+${boundedCurrentLevel}`}
          milestones={[
            { value: 0, label: "+0" },
            { value: 5, label: "+5" },
            { value: 10, label: "+10" },
            { value: 15, label: "+15" },
          ]}
          showMilestoneLabels
          aria-label="Barra de progreso con hitos de mejora"
        />
      </section>

      <div className="fl-crafting-stats-compare">
        <FlCard className="fl-crafting-stat-panel" variant="compact">
          <h3>Estadisticas actuales</h3>
          {craftingHeroRows.map(entry => (
            <FlStatRow
              key={`current-${entry.key}`}
              compact
              label={statLabels[entry.key] || entry.key}
              value={formatStatValue(entry.key, entry.currentValue)}
            />
          ))}
        </FlCard>
        <div className="fl-crafting-stat-arrow">»</div>
        <FlCard className="fl-crafting-stat-panel fl-crafting-stat-panel--new" variant="compact" state="success">
          <h3>Estadisticas nuevas</h3>
          {craftingHeroRows.map(entry => (
            <FlStatRow
              key={`next-${entry.key}`}
              compact
              label={statLabels[entry.key] || entry.key}
              value={formatStatValue(entry.key, entry.nextValue)}
              delta={entry.delta > 0 ? formatDiffValue(entry.key, entry.delta) : null}
              deltaTone={entry.delta > 0 ? "success" : "neutral"}
              state={entry.delta > 0 ? "increased" : "default"}
            />
          ))}
        </FlCard>
      </div>

      <div className="fl-crafting-action-row fl-action-row">
        <FlButton
          className="fl-crafting-primary-action"
          variant="cta"
          size="full"
          emphasis="strong"
          disabled={selectedActionDisabled}
          onClick={onExecutePrimaryAction}
          cost={selectedActionCostLabel}
        >
          ⚔ MEJORAR
        </FlButton>
      </div>

      {selectedActionDisabled && selectedActionHint && (
        <FlRequirementHint
          className="fl-crafting-requirement"
          type={requirementHintType}
          label={selectedActionHint}
          detail={selectedActionCostLabel}
          compact
        />
      )}

      {craftingLog.length > 0 && (
        <FlCard className="fl-crafting-feedback" variant="compact" state="success">
          <ForgeIcon name="claim" size={28} />
          <div>
            <strong>Ultima accion registrada</strong>
            <span>{craftingLog[craftingLog.length - 1]}</span>
          </div>
        </FlCard>
      )}
    </div>
  );
}
