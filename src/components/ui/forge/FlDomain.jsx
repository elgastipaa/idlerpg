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

export function FlItemRow({ item, title, subtitle, meta, actions, selected = false, className = "", onClick }) {
  return (
    <FlCard
      as={onClick ? undefined : "div"}
      interactive={Boolean(onClick)}
      selected={selected}
      rarity={item?.rarity}
      onClick={onClick}
      className={cx("fl-item-row", className)}
    >
      <FlItemFrame item={item} size="md" />
      <div className="fl-item-row__copy">
        <div className="fl-item-row__title">{title || item?.name || "Item"}</div>
        {subtitle && <div className="fl-item-row__subtitle">{subtitle}</div>}
        {meta && <div className="fl-item-row__meta">{meta}</div>}
      </div>
      {actions && <div className="fl-item-row__actions">{actions}</div>}
    </FlCard>
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

export function FlStationCard({ stationId, title, detail, status, locked = false, actionLabel = "Abrir", onAction, className = "" }) {
  const asset = getStationAsset(stationId);
  return (
    <FlCard variant="panel" locked={locked} className={cx("fl-station-card", className)}>
      <FlIconFrame size="lg" asset={asset} kind="station" fallbackIcon={asset.fallbackIcon} className="fl-station-card__icon" />
      <div className="fl-station-card__copy">
        <div className="fl-station-card__title">{title}</div>
        {detail && <div className="fl-station-card__detail">{detail}</div>}
      </div>
      <div className="fl-station-card__actions">
        {status && <FlBadge tone={locked ? "danger" : "defense"}>{status}</FlBadge>}
        <FlButton variant="secondary" size="sm" disabled={!onAction || locked} onClick={onAction}>{actionLabel}</FlButton>
      </div>
    </FlCard>
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

export function FlJobCard({ title, detail, progress = 0, ready = false, actionLabel, onAction, className = "" }) {
  return (
    <FlCard variant="panel" state={ready ? "success" : "default"} className={cx("fl-job-card", className)}>
      <FlIconFrame size="md" icon={ready ? "claim" : "time"} fallbackIcon={ready ? "claim" : "time"} className="fl-job-card__icon" />
      <div className="fl-job-card__copy">
        <div className="fl-job-card__title">{title}</div>
        {detail && <div className="fl-job-card__detail">{detail}</div>}
        {!ready && <FlJobProgress value={progress} />}
      </div>
      {actionLabel && <FlButton variant={ready ? "primary" : "secondary"} size="sm" onClick={onAction}>{actionLabel}</FlButton>}
    </FlCard>
  );
}

export function FlClaimPanel({ title, rewards = [], actionLabel = "Reclamar", onAction, className = "" }) {
  return (
    <FlCard variant="premium" state="success" className={cx("fl-claim-panel", className)}>
      <div className="fl-claim-panel__title">{title}</div>
      <div className="fl-claim-panel__rewards">
        {rewards.map(reward => (
          <FlTag key={`${reward.label}-${reward.value}`} tone={reward.tone || "reward"}>
            {reward.label}: {reward.value}
          </FlTag>
        ))}
      </div>
      <FlButton variant="primary" onClick={onAction}>{actionLabel}</FlButton>
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
