import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";
import { getItemAsset, getStationAsset, getTalentAsset } from "../../../utils/assetRegistry";
import FlAsset from "./FlAsset.jsx";
import FlBadge from "./FlBadge.jsx";
import FlButton from "./FlButton.jsx";
import FlCard from "./FlCard.jsx";
import FlIconFrame from "./FlIconFrame.jsx";
import FlProgressBar from "./FlProgressBar.jsx";
import FlStatRow from "./FlStatRow.jsx";
import FlTag from "./FlTag.jsx";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function FlRarityBadge({ rarity = "common", children, className = "" }) {
  return (
    <FlBadge variant="rarity" rarity={rarity} className={cx("fl-rarity-badge", className)}>
      {children || rarity}
    </FlBadge>
  );
}

export function FlAffixList({ affixes = [], className = "" }) {
  return (
    <div className={cx("fl-affix-list", className)}>
      {affixes.map((affix, index) => (
        <FlStatRow
          key={`${affix?.stat || "affix"}-${index}`}
          label={affix?.label || affix?.stat || "Linea"}
          value={affix?.valueLabel || affix?.rolledValue || affix?.value || ""}
          delta={affix?.delta}
          deltaTone={affix?.deltaTone}
          icon={affix?.icon ? <ForgeIcon name={affix.icon} size={15} /> : null}
          compact
        />
      ))}
    </div>
  );
}

export function FlItemFrame({ item, size = "lg", selected = false, className = "" }) {
  const asset = getItemAsset(item);
  return (
    <FlIconFrame
      size={size}
      selected={selected}
      rarity={item?.rarity}
      asset={asset}
      kind="item"
      fallbackIcon={asset.fallbackIcon}
      className={cx("fl-item-frame", className)}
    />
  );
}

export function FlItemRow({
  item,
  title,
  subtitle,
  meta,
  variant = "inventory",
  name = "",
  rarityLabel = "",
  statusLabel = "",
  typeLabel = "",
  statLines = [],
  affixChips = [],
  implicitLabel = "",
  powerValue = "",
  selected = false,
  disabled = false,
  locked = false,
  state = "",
  className = "",
  onClick,
  actions,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel = "EQUIPAR",
  secondaryActionLabel = "VENDER",
  primaryActionVariant = "default",
  secondaryActionVariant = "",
  actionsDisabled = false,
  primaryActionOnboardingTarget = "",
}) {
  const asset = getItemAsset(item);
  const rarity = item?.rarity || "common";
  const hasActions = Boolean(actions || onPrimaryAction || onSecondaryAction);
  const itemName = name || title || item?.name || "Item";
  const effectiveRarityLabel = rarityLabel || rarity;
  const effectiveTypeLabel = typeLabel || meta || subtitle || "";
  const effectiveVariant = variant === "equipped" ? "equipped" : "inventory";
  const rowState = state || "";
  const stateClass = rowState ? `fl-item-row--${rowState}` : "";
  const variantClass = `fl-item-row--variant-${effectiveVariant}`;
  const hasStatLines = Array.isArray(statLines) && statLines.length > 0;
  const frameClass = `fl-item-row__frame--${rarity}`;
  const showPowerInRightCol = hasActions && powerValue;
  const resolvedSecondaryVariant = secondaryActionVariant || (state === "sell-pending" ? "danger" : "danger");

  return (
    <article
      className={cx(
        "fl-item-row",
        variantClass,
        stateClass,
        selected && "is-selected",
        disabled && "is-disabled",
        locked && "is-locked",
        className
      )}
      data-rarity={rarity}
      data-state={rowState || undefined}
    >
      <button
        type="button"
        className="fl-item-row__summary"
        onClick={onClick}
        disabled={!onClick || disabled || locked}
        aria-label={`Ver ${itemName}`}
      >
        <span className={cx("fl-item-row__frame", frameClass)} aria-hidden="true">
          <FlAsset
            className="fl-item-row__asset"
            asset={asset}
            kind="item"
            rarity={rarity}
            size="full"
            fit="contain"
            alt=""
            fallbackIcon={asset?.fallbackIcon}
          />
        </span>
        <span className="fl-item-row__info">
          <span className="fl-item-row__head">
            <span className="fl-item-row__topline">
              <FlBadge variant="rect" size="xs" rarity={rarity} className="fl-item-row__rarity">
                {effectiveRarityLabel}
              </FlBadge>
              {statusLabel && <span className="fl-item-row__status">{statusLabel}</span>}
            </span>
            <span className="fl-item-row__name">{itemName}</span>
            {powerValue && !showPowerInRightCol && (
              <span className="fl-item-row__power">
                <span>P</span> {powerValue}
              </span>
            )}
          </span>
          {effectiveTypeLabel && <span className="fl-item-row__type">{effectiveTypeLabel}</span>}
          {hasStatLines && (
            <span className="fl-item-row__stats-block">
              {statLines.map((line, index) => (
                <span key={line.id || `${line.label || "stat"}-${index}`} className="fl-item-row__stat-line">
                  <span className="fl-item-row__stat-label">{line.label}</span>
                  <span className="fl-item-row__stat-value">{line.value}</span>
                  {line.deltaLabel ? (
                    <span
                      className={cx("fl-item-row__delta", line.deltaTone ? `fl-item-row__delta--${line.deltaTone}` : "")}
                    >
                      {line.deltaLabel}
                    </span>
                  ) : null}
                </span>
              ))}
            </span>
          )}
          {!hasStatLines && affixChips.length > 0 && (
            <span className="fl-item-row__affixes">
              {affixChips.map(chip => (
                <span key={chip.id || chip.label} className={cx("fl-item-row__affix-chip", chip.tone && `fl-item-row__affix-chip--${chip.tone}`)}>
                  {chip.label}
                </span>
              ))}
            </span>
          )}
          {implicitLabel && <span className="fl-item-row__implicit">{implicitLabel}</span>}
        </span>
      </button>
      {hasActions && (
        <div className="fl-item-row__actions">
          {showPowerInRightCol && (
            <div className="fl-item-row__power-block">
              <span className="fl-item-row__power-label">Poder</span>
              <span className="fl-item-row__power-number">{powerValue}</span>
            </div>
          )}
          {actions || (
            <div className="fl-item-row__action-group">
              {onPrimaryAction && (
                <FlButton
                  variant={primaryActionVariant}
                  size="sm"
                  onClick={onPrimaryAction}
                  disabled={actionsDisabled}
                  data-onboarding-target={primaryActionOnboardingTarget || undefined}
                >
                  {primaryActionLabel}
                </FlButton>
              )}
              {onSecondaryAction && (
                <FlButton
                  variant={resolvedSecondaryVariant}
                  size="sm"
                  onClick={onSecondaryAction}
                  disabled={actionsDisabled}
                >
                  {secondaryActionLabel}
                </FlButton>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function FlItemTile({ item, title, selected = false, className = "", onClick }) {
  return (
    <FlCard interactive={Boolean(onClick)} selected={selected} rarity={item?.rarity} onClick={onClick} className={cx("fl-item-tile", className)}>
      <FlItemFrame item={item} size="lg" selected={selected} />
      <div className="fl-item-tile__title">{title || item?.name || "Item"}</div>
      <FlRarityBadge rarity={item?.rarity || "common"} />
    </FlCard>
  );
}

export function FlItemDetailBlock({ item, affixes = [], actions, className = "" }) {
  return (
    <FlCard variant="panel" rarity={item?.rarity} className={cx("fl-item-detail-block", className)}>
      <FlItemFrame item={item} size="xl" />
      <div className="fl-item-detail-block__copy">
        <div className="fl-item-detail-block__title">{item?.name || "Item"}</div>
        <FlRarityBadge rarity={item?.rarity || "common"} />
        <FlAffixList affixes={affixes} />
      </div>
      {actions && <div className="fl-item-detail-block__actions">{actions}</div>}
    </FlCard>
  );
}

export function FlInventoryDenseRow({
  item,
  title,
  meta = "",
  chips = [],
  implicit = "",
  power = "",
  selected = false,
  equipped = false,
  sellPending = false,
  upgradeAvailable = false,
  primaryActionLabel = "Equipar",
  secondaryActionLabel = "Vender",
  onPrimaryAction,
  onSecondaryAction,
  actionsDisabled = false,
  primaryActionOnboardingTarget = "",
  onOpen,
  className = "",
}) {
  const SummaryElement = onOpen ? "button" : "div";
  return (
    <FlCard
      variant="compact"
      rarity={item?.rarity}
      selected={selected}
      className={cx(
        "fl-inventory-dense-row",
        equipped && "fl-inventory-dense-row--equipped",
        sellPending && "fl-inventory-dense-row--sell-pending",
        upgradeAvailable && "fl-inventory-dense-row--upgrade",
        className
      )}
    >
      <SummaryElement
        type={onOpen ? "button" : undefined}
        className={cx("fl-inventory-dense-row__summary", onOpen && "fl-inventory-dense-row__summary--button")}
        onClick={onOpen}
      >
        <FlItemFrame item={item} size="md" className="fl-inventory-dense-row__frame" />
        <div className="fl-inventory-dense-row__copy">
          <div className="fl-inventory-dense-row__header">
            <FlRarityBadge rarity={item?.rarity || "common"} />
            <span className="fl-inventory-dense-row__title">{title || item?.name || "Item"}</span>
          </div>
          {meta && <div className="fl-inventory-dense-row__meta">{meta}</div>}
          {chips.length > 0 && (
            <div className="fl-inventory-dense-row__chips">
              {chips.map(chip => (
                <FlTag key={chip.id || chip.label} tone={chip.tone || "defense"}>
                  {chip.label}
                </FlTag>
              ))}
            </div>
          )}
          {implicit && <div className="fl-inventory-dense-row__implicit">{implicit}</div>}
        </div>
        <div className="fl-inventory-dense-row__power">
          <span>P</span>
          <strong>{power}</strong>
        </div>
      </SummaryElement>
      {(onPrimaryAction || onSecondaryAction) && (
        <div className="fl-inventory-dense-row__actions">
          {onPrimaryAction && (
            <FlButton
              variant="default"
              size="sm"
              onClick={onPrimaryAction}
              disabled={actionsDisabled}
              data-onboarding-target={primaryActionOnboardingTarget || undefined}
            >
              {primaryActionLabel}
            </FlButton>
          )}
          {onSecondaryAction && (
            <FlButton variant={sellPending ? "danger" : "danger-ghost"} size="sm" onClick={onSecondaryAction} disabled={actionsDisabled}>
              {secondaryActionLabel}
            </FlButton>
          )}
        </div>
      )}
    </FlCard>
  );
}

export function FlTalentRequirementBadge({ children, blocked = false, className = "" }) {
  return (
    <FlBadge tone={blocked ? "danger" : "success"} variant="lock" className={cx("fl-talent-requirement-badge", className)}>
      {children}
    </FlBadge>
  );
}

export function FlTalentPointCounter({ value = 0, invested = 0, className = "" }) {
  return (
    <div className={cx("fl-talent-point-counter", className)}>
      <span>{value}</span>
      <strong>TP</strong>
      <em>{invested} invertidos</em>
    </div>
  );
}

export function FlTalentNode({
  talentId,
  icon,
  state = "locked",
  selected = false,
  level = 0,
  maxLevel = 1,
  keystone = false,
  spotlight = false,
  className = "",
  onClick,
  ...rest
}) {
  const asset = getTalentAsset(talentId);
  return (
    <button
      {...rest}
      type="button"
      className={cx(
        "fl-talent-node",
        `fl-talent-node--${state}`,
        selected && "fl-talent-node--selected",
        keystone && "fl-talent-node--keystone",
        spotlight && "fl-talent-node--spotlight",
        className
      )}
      aria-pressed={selected}
      onClick={onClick}
    >
      <FlIconFrame size="lg" selected={selected} asset={asset} kind="talent" fallbackIcon={icon || asset.fallbackIcon} className="fl-talent-node__frame" />
      <span className="fl-talent-node__level">{level}/{maxLevel}</span>
      {state === "ready" && <span className="fl-talent-node__ready" aria-hidden="true" />}
    </button>
  );
}

export function FlTalentDetailPanel({ title, description, meta, requirement, action, icon = "talents", className = "" }) {
  return (
    <FlCard variant="panel" className={cx("fl-talent-detail-panel", className)}>
      <FlIconFrame size="lg" icon={icon} fallbackIcon={icon} className="fl-talent-detail-panel__icon" />
      <div className="fl-talent-detail-panel__copy">
        <div className="fl-talent-detail-panel__title">{title}</div>
        {meta && <div className="fl-talent-detail-panel__meta">{meta}</div>}
        {description && <p>{description}</p>}
        {requirement && <div className="fl-talent-detail-panel__requirement">{requirement}</div>}
      </div>
      {action && <div className="fl-talent-detail-panel__action">{action}</div>}
    </FlCard>
  );
}

export function FlStationCard({
  stationId,
  title,
  detail,
  status,
  accentTone = "gold",
  state = "",
  locked = false,
  actionLabel = "Abrir",
  actionVariant = "",
  spotlightText = "",
  onAction,
  onboardingTarget = "",
  className = "",
}) {
  const asset = getStationAsset(stationId);
  const resolvedState = state || (locked ? "locked" : "active");
  const resolvedActionVariant = actionVariant || (locked ? "secondary" : (resolvedState === "claimable" ? "success" : "primary"));
  const resolvedAccent = accentTone || "gold";
  const effectiveStatus = status || "";
  const dotState = resolvedState === "claimable"
    ? "claim"
    : resolvedState === "job-active"
      ? "job"
      : resolvedState === "locked"
        ? "locked"
        : "available";

  return (
    <article
      className={cx(
        "fl-station-card",
        resolvedState && `fl-station-card--${resolvedState}`,
        resolvedAccent && `fl-station-card--accent-${resolvedAccent}`,
        className
      )}
      data-onboarding-target={onboardingTarget || undefined}
      data-station-id={stationId}
      data-state={resolvedState || undefined}
      aria-disabled={locked ? "true" : undefined}
    >
      <div className="fl-station-card__inner">
        <div className="fl-station-card__icon-wrap">
          <FlAsset
            asset={asset}
            kind="station"
            size="full"
            fit="contain"
            className="fl-station-card__icon"
            fallbackIcon={asset.fallbackIcon}
            alt=""
          />
          <span
            className={cx("fl-station-card__status-dot", `fl-station-card__status-dot--${dotState}`)}
            aria-hidden="true"
          />
          {effectiveStatus && <span className="fl-station-card__count">{effectiveStatus}</span>}
        </div>
        <div className="fl-station-card__copy">
          <div className="fl-station-card__title">{title}</div>
          {detail && <div className="fl-station-card__detail">{detail}</div>}
        </div>
        <div className="fl-station-card__actions">
          <FlButton variant={resolvedActionVariant} size="sm" disabled={!onAction} onClick={onAction}>{actionLabel}</FlButton>
        </div>
      </div>
      {spotlightText && (
        <div className="fl-station-card__spotlight-banner">{spotlightText}</div>
      )}
    </article>
  );
}

export function FlRelicRow({
  relic,
  slot = "weapon",
  rarity = "rare",
  name = "",
  detail = "",
  active = false,
  equipLabel = "",
  onEquip,
  extractLabel = "Extraer",
  onExtract,
  extractVariant = "danger-ghost",
  showStabilize = false,
  canStabilize = false,
  stabilizeLabel = "Estabilizar",
  stabilizeHint = "",
  onStabilize,
  className = "",
}) {
  const slotLabel = slot === "armor" ? "ARMADURA" : "ARMA";
  const sourceItem = relic?.item || relic;
  const asset = getItemAsset(sourceItem);
  const resolvedName = name || relic?.name || "Reliquia";
  const resolvedRarity = rarity || relic?.rarity || "rare";
  const relicRating = Math.max(0, Math.round(Number(relic?.rating || sourceItem?.rating || 0)));
  const relicEntropy = Math.max(0, Math.floor(Number(relic?.entropy || 0)));
  const relicTier = Math.max(1, Number(relic?.itemTier || sourceItem?.itemTier || 1));
  const summaryLine = detail || [slotLabel.toLowerCase(), `tier ${relicTier}`].filter(Boolean).join(" · ");
  const resolvedEquipLabel = equipLabel || (active ? "Activa" : "Activar");
  const entropyTone = relicEntropy >= 65 ? "neg" : relicEntropy >= 35 ? "new" : "pos";

  return (
    <article
      className={cx("fl-relic-row", active && "fl-relic-row--active", className)}
      data-rarity={resolvedRarity}
      data-slot={slot}
      data-state={active ? "active" : "reserve"}
    >
      <div className="fl-relic-row__inner">
        <div className="fl-relic-row__summary">
          <span className={cx("fl-item-row__frame", "fl-relic-row__frame", `fl-item-row__frame--${resolvedRarity}`)} aria-hidden="true">
            <FlAsset
              className={cx("fl-item-row__asset", "fl-relic-row__asset")}
              asset={asset}
              kind="item"
              rarity={resolvedRarity}
              size="full"
              fit="contain"
              alt=""
              fallbackIcon={asset?.fallbackIcon || (slot === "armor" ? "armor" : "combat")}
            />
          </span>

          <span className={cx("fl-item-row__info", "fl-relic-row__info")}>
            <span className={cx("fl-item-row__head", "fl-relic-row__head")}>
              <span className={cx("fl-item-row__topline", "fl-relic-row__topline")}>
                <FlBadge variant="rect" size="xs" rarity={resolvedRarity} className="fl-item-row__rarity">
                  {resolvedRarity}
                </FlBadge>
                <FlTag tone="defense" size="xs" className="fl-relic-row__slot-tag">{slotLabel}</FlTag>
                <FlTag tone={active ? "success" : "danger"} size="xs" className="fl-relic-row__state-tag">
                  {active ? "Activa" : "Reserva"}
                </FlTag>
              </span>
              <span className="fl-item-row__name">{resolvedName}</span>
            </span>

            {summaryLine && <span className="fl-item-row__type">{summaryLine}</span>}

            <span className="fl-item-row__stats-block fl-relic-row__stats-block">
              <span className="fl-item-row__stat-line">
                <span className="fl-item-row__stat-label">Poder</span>
                <span className="fl-item-row__stat-value">{relicRating}</span>
              </span>
              <span className="fl-item-row__stat-line">
                <span className="fl-item-row__stat-label">Entropia</span>
                <span className="fl-item-row__stat-value">{relicEntropy}</span>
                <span className={cx("fl-item-row__delta", `fl-item-row__delta--${entropyTone}`)}>
                  {relicEntropy >= 65 ? "ALTA" : relicEntropy >= 35 ? "MEDIA" : "ESTABLE"}
                </span>
              </span>
            </span>
          </span>
        </div>

        <div className="fl-relic-row__actions">
          <FlButton size="sm" variant={active ? "secondary" : "default"} onClick={onEquip} disabled={active || !onEquip}>
            {resolvedEquipLabel}
          </FlButton>
          <FlButton size="sm" variant={extractVariant} onClick={onExtract} disabled={!onExtract}>
            {extractLabel}
          </FlButton>
          {showStabilize && (
            <FlButton
              size="sm"
              variant={canStabilize ? "default" : "secondary"}
              onClick={onStabilize}
              disabled={!canStabilize || !onStabilize}
              title={stabilizeHint || undefined}
            >
              {stabilizeLabel}
            </FlButton>
          )}
        </div>
      </div>
    </article>
  );
}

export function FlJobProgress({ value = 0, label, className = "" }) {
  return (
    <div className={cx("fl-job-progress", className)}>
      {label && <div className="fl-job-progress__label">{label}</div>}
      <FlProgressBar value={value} max={1} type="progress" />
    </div>
  );
}

export function FlJobCard({
  title,
  detail,
  progress = 0,
  ready = false,
  statusLabel = "",
  footerLabel = "",
  chipLabel = "",
  actionLabel,
  onAction,
  secondaryActionLabel = "",
  onSecondaryAction,
  icon = "",
  className = "",
}) {
  const iconName = icon || (ready ? "claim" : "time");
  return (
    <FlCard
      variant="panel"
      tone={ready ? "success" : "defense"}
      state={ready ? "success" : "default"}
      className={cx("fl-job-card", ready && "fl-job-card--ready", className)}
    >
      <div className="fl-card__body fl-job-card__inner">
        <div className="fl-job-card__icon-wrap">
          <ForgeIcon name={iconName} size={22} />
        </div>
        <div className="fl-job-card__copy">
          <div className="fl-job-card__title">{title}</div>
          {statusLabel && (
            <div className={cx("fl-job-card__status", ready ? "fl-job-card__status--ready" : "fl-job-card__status--running")}>
              {statusLabel}
            </div>
          )}
          {detail && <div className="fl-job-card__detail">{detail}</div>}
          {!ready && (
            <div className="fl-job-card__progress">
              <FlProgressBar value={progress} max={1} type="xp" size="sm" />
            </div>
          )}
        </div>
      </div>
      {ready ? (
        <div className="fl-card__footer fl-job-card__action-row">
          {actionLabel && <FlButton variant="success" size="sm" onClick={onAction}>{actionLabel}</FlButton>}
          {onSecondaryAction && (
            <FlButton variant="secondary" size="sm" onClick={onSecondaryAction} ariaLabel={secondaryActionLabel || "Repetir"}>
              <ForgeIcon name="repeat" size={16} />
            </FlButton>
          )}
        </div>
      ) : (
        (footerLabel || chipLabel) && (
          <div className="fl-card__footer fl-job-card__footer">
            <span>{footerLabel}</span>
            <strong>{chipLabel}</strong>
          </div>
        )
      )}
    </FlCard>
  );
}

export function FlJobRow({
  title,
  detail,
  progress = 0,
  ready = false,
  statusLabel = "",
  footerLabel = "",
  chipLabel = "",
  actionLabel,
  onAction,
  secondaryActionLabel = "",
  onSecondaryAction,
  icon = "",
  className = "",
}) {
  const iconName = icon || (ready ? "claim" : "time");
  const runningEta = !ready && chipLabel ? chipLabel : "";
  return (
    <article className={cx("fl-job-row", ready && "fl-job-row--ready", className)}>
      <div className="fl-job-card__inner">
        <div className="fl-job-card__icon-wrap">
          <ForgeIcon name={iconName} size={22} />
        </div>
        <div className="fl-job-card__copy">
          <div className="fl-job-row__title-line">
            <div className="fl-job-card__title">{title}</div>
            {runningEta && <div className="fl-job-row__eta">{runningEta}</div>}
          </div>
          {statusLabel && (
            <div className={cx("fl-job-card__status", ready ? "fl-job-card__status--ready" : "fl-job-card__status--running")}>
              {statusLabel}
            </div>
          )}
          {detail && <div className="fl-job-card__detail">{detail}</div>}
          {!ready && (
            <div className="fl-job-card__progress">
              <FlProgressBar value={progress} max={1} type="xp" size="sm" />
            </div>
          )}
        </div>
      </div>
      {ready ? (
        <div className="fl-job-card__action-row">
          {actionLabel && <FlButton variant="success" size="sm" onClick={onAction}>{actionLabel}</FlButton>}
          {onSecondaryAction && (
            <FlButton variant="secondary" size="sm" onClick={onSecondaryAction} ariaLabel={secondaryActionLabel || "Repetir"}>
              <ForgeIcon name="repeat" size={16} />
            </FlButton>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function FlClaimPanel({ title, rewards = [], actionLabel = "Reclamar", onAction, className = "" }) {
  return (
    <FlCard variant="premium" tone="success" state="success" className={cx("fl-claim-panel", className)}>
      <div className="fl-card__header">
        <div className="fl-claim-panel__title">{title}</div>
      </div>
      <div className="fl-card__body">
        <div className="fl-claim-panel__rewards">
          {rewards.map(reward => (
            <FlTag key={`${reward.label}-${reward.value}`} tone={reward.tone || "reward"}>
              {reward.label}: {reward.value}
            </FlTag>
          ))}
        </div>
      </div>
      <div className="fl-card__footer">
        <FlButton variant="primary" onClick={onAction}>{actionLabel}</FlButton>
      </div>
    </FlCard>
  );
}

export function FlUpgradeTrack({ value = 0, max = 15, milestones = [0, 5, 10, 15], className = "" }) {
  return (
    <div className={cx("fl-upgrade-track", className)}>
      <FlProgressBar value={value} max={max} milestones={milestones} type="progress" />
      <div className="fl-upgrade-track__labels">
        {milestones.map(milestone => <span key={milestone}>+{milestone}</span>)}
      </div>
    </div>
  );
}

export function FlMaterialRequirementList({ requirements = [], className = "" }) {
  return (
    <div className={cx("fl-material-requirement-list", className)}>
      {requirements.map(req => (
        <FlTag key={req.id || req.label} tone={req.enough === false ? "danger" : "reward"}>
          {req.label}: {req.value}
        </FlTag>
      ))}
    </div>
  );
}

export function FlCraftingCostPanel({ children, className = "" }) {
  return <FlCard variant="panel" className={cx("fl-crafting-cost-panel", className)}>{children}</FlCard>;
}

export function FlCraftingResultPreview({ title, detail, state = "default", className = "" }) {
  return (
    <FlCard variant="premium" state={state} className={cx("fl-crafting-result-preview", className)}>
      <div className="fl-crafting-result-preview__title">{title}</div>
      {detail && <div className="fl-crafting-result-preview__detail">{detail}</div>}
    </FlCard>
  );
}

export function FlCraftingModeTabs(props) {
  return props.children || null;
}

export function FlTierProgressTrack({ value = 0, max = 1, className = "" }) {
  return <FlProgressBar value={value} max={max} milestones={[0.25, 0.5, 0.75, 1]} className={cx("fl-tier-progress-track", className)} />;
}

export function FlBossCard({ boss, className = "" }) {
  return (
    <FlCard variant="premium" className={cx("fl-boss-card", className)}>
      <FlIconFrame size="lg" icon="combat" fallbackIcon="combat" />
      <div className="fl-boss-card__title">{boss?.name || "Boss"}</div>
    </FlCard>
  );
}

export function FlWeeklyBossCard({
  title = "Boss semanal",
  cycleLabel = "",
  attemptsLabel = "",
  bossName = "",
  description = "",
  phases = [],
  onHistory,
  onChallenge,
  className = "",
}) {
  return (
    <FlCard variant="panel" tone="danger" state="error" className={cx("fl-weekly-boss-card", className)}>
      <div className="fl-card__header fl-weekly-boss-card__header">
        <span className="fl-weekly-boss-card__title">{title}</span>
        {cycleLabel && <FlTag tone="danger">{cycleLabel}</FlTag>}
        {attemptsLabel && <span className="fl-weekly-boss-card__attempts">{attemptsLabel}</span>}
      </div>
      <div className="fl-card__body fl-weekly-boss-card__body">
        <div className="fl-weekly-boss-card__boss">
          <FlIconFrame size="lg" icon="combat" fallbackIcon="combat" className="fl-weekly-boss-card__frame" />
          <div>
            <div className="fl-weekly-boss-card__boss-name">{bossName || "Sin jefe"}</div>
            {description && <p className="fl-weekly-boss-card__boss-description">{description}</p>}
          </div>
        </div>
        {phases.length > 0 && (
          <div className="fl-weekly-boss-card__phases">
            {phases.map(phase => (
              <FlProgressBar
                key={phase.id || phase.label}
                type={phase.type || "hp"}
                percent={phase.percent ?? 0}
                size="sm"
                label={phase.label || ""}
                className={cx("fl-weekly-boss-card__phase", phase.inactive && "fl-weekly-boss-card__phase--inactive")}
              />
            ))}
          </div>
        )}
      </div>
      <div className="fl-card__footer fl-weekly-boss-card__footer">
        <FlButton variant="ghost" size="sm" onClick={onHistory}>
          Ver historial
        </FlButton>
        <FlButton variant="primary" size="sm" onClick={onChallenge}>
          Desafiar
        </FlButton>
      </div>
    </FlCard>
  );
}

export function FlCombatantPanel({ children, className = "" }) {
  return <FlCard variant="panel" className={cx("fl-combatant-panel", className)}>{children}</FlCard>;
}

export function FlStatusEffectIcon({ icon = "volatile", label, className = "" }) {
  return (
    <span className={cx("fl-status-effect-icon", className)} title={label}>
      <ForgeIcon name={icon} size={16} />
    </span>
  );
}

export function FlRewardTrack({ rewards = [], className = "" }) {
  return (
    <div className={cx("fl-reward-track", className)}>
      {rewards.map(reward => (
        <FlAsset key={reward.id || reward.label} asset={reward.asset} kind={reward.kind || "icon"} fallbackIcon={reward.icon || "claim"} />
      ))}
    </div>
  );
}
