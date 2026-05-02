import React, { useEffect, useMemo, useRef } from "react";
import { getObjectiveStatusMeta, resolveObjectiveStatus } from "../engine/progression/objectiveStatus";
import { getWeeklyLedgerContractsWithProgress } from "../engine/progression/weeklyLedger";
import useViewport from "../hooks/useViewport";
import { FlBadge, FlButton, FlPanel, FlProgressBar, FlScreenHeader } from "./ui/forge";

function formatCount(value = 0) {
  return Math.max(0, Number(value || 0)).toLocaleString();
}

function formatAppearanceLabel(value = "") {
  return String(value || "")
    .split("_")
    .join(" ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

const ACCOUNT_SCROLL_TARGET_STORAGE_KEY = "idlerpg.accountScrollTarget";
const ACCOUNT_SCROLL_TARGET_WEEKLY = "weekly";

export default function AccountProgressView({ state, dispatch }) {
  const { isMobile } = useViewport();
  const isDenseWeeklyMobile = isMobile;
  const sanctuary = state?.sanctuary || {};
  const prestige = state?.prestige || {};
  const abyss = state?.abyss || {};
  const appearanceProfile = state?.appearanceProfile || {};
  const stashProjects = Array.isArray(sanctuary?.stash) ? sanctuary.stash : [];
  const relicArmory = Array.isArray(sanctuary?.relicArmory) ? sanctuary.relicArmory : [];
  const highestTier = Math.max(1, Number(state?.combat?.maxTier || 1), Number(abyss?.highestTierReached || 1));
  const highestDepth = Math.max(0, Number(abyss?.highestDepthReached || 0));
  const sessionTicks = Number(state?.combat?.analytics?.ticks || 0);
  const sessionMinutes = Math.floor(sessionTicks / 60);
  const weeklyContracts = useMemo(
    () => getWeeklyLedgerContractsWithProgress(state, state?.weeklyLedger || {}),
    [state]
  );
  const claimableWeeklyContractEntries = weeklyContracts.filter(
    contract => contract.progress?.completed && !contract.claimed
  );
  const claimableWeeklyContracts = claimableWeeklyContractEntries.length;
  const weeklyTotalContracts = weeklyContracts.length;
  const completedWeeklyContracts = weeklyContracts.filter(contract => contract.progress?.completed).length;
  const claimedWeeklyContracts = weeklyContracts.filter(contract => contract.claimed).length;
  const weeklyAllClaimed = weeklyTotalContracts > 0 && claimedWeeklyContracts >= weeklyTotalContracts;
  const weeklySectionRef = useRef(null);
  const weeklyPanelProps = {
    style: {
      "--account-weekly-scroll-margin": "calc(var(--app-header-offset, 62px) + 14px)",
    },
  };
  const weeklyGridProps = {
    style: {
      "--account-weekly-grid-columns": isDenseWeeklyMobile
        ? "repeat(auto-fit, minmax(176px, 1fr))"
        : "repeat(auto-fit, minmax(210px, 1fr))",
      "--account-weekly-grid-gap": isDenseWeeklyMobile ? "6px" : "8px",
    },
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let pendingTarget = null;
    try {
      pendingTarget = window.sessionStorage.getItem(ACCOUNT_SCROLL_TARGET_STORAGE_KEY);
      if (pendingTarget != null) {
        window.sessionStorage.removeItem(ACCOUNT_SCROLL_TARGET_STORAGE_KEY);
      }
    } catch {
      pendingTarget = null;
    }
    if (pendingTarget !== ACCOUNT_SCROLL_TARGET_WEEKLY) return undefined;

    let rafId = null;
    let timeoutId = null;
    let attempts = 0;

    const scrollToWeeklySection = () => {
      const target =
        weeklySectionRef.current ||
        document.getElementById("weekly-ledger-section");
      if (!(target instanceof HTMLElement)) {
        if (attempts < 8) {
          attempts += 1;
          rafId = window.requestAnimationFrame(scrollToWeeklySection);
        }
        return;
      }

      target.scrollIntoView({
        behavior: attempts === 0 ? "auto" : "smooth",
        block: "start",
      });

      if (attempts < 3) {
        attempts += 1;
        timeoutId = window.setTimeout(() => {
          rafId = window.requestAnimationFrame(scrollToWeeklySection);
        }, 80);
      }
    };

    rafId = window.requestAnimationFrame(scrollToWeeklySection);
    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="account-progress-view">
      <Panel>
        <FlScreenHeader
          className="account-progress-header"
          eyebrow="Cuenta"
          title="Resumen de cuenta"
          subtitle="Vista compacta de progreso largo sin duplicar detalles de Ecos, Biblioteca, Abismo y Deep Forge."
          chips={(
            <div className="account-progress-chip-row">
              <StatusChip label={`P${formatCount(prestige.level || 0)}`} tone="var(--tone-accent, #4338ca)" surface="var(--tone-accent-soft, #eef2ff)" />
              <StatusChip label={`Abismo ${formatCount(highestDepth)}`} tone="var(--tone-info, #0369a1)" surface="var(--tone-info-soft, #f0f9ff)" />
              <StatusChip label={`${formatCount(stashProjects.length)} proyecto${stashProjects.length === 1 ? "" : "s"}`} tone="var(--tone-violet, #7c3aed)" surface="var(--tone-violet-soft, #f3e8ff)" />
              <StatusChip label={`${formatCount(relicArmory.length)} reliquia${relicArmory.length === 1 ? "" : "s"}`} tone="var(--tone-danger, #D85A30)" surface="var(--tone-danger-soft, #fff1f2)" />
            </div>
          )}
        />

        <div className="account-progress-metrics">
          <AccountMetric label="Resonancia" value={`${formatCount(prestige.totalEchoesEarned || 0)} ecos`} />
          <AccountMetric label="Ecos listos" value={formatCount(prestige.echoes || 0)} />
          <AccountMetric label="Tier historico" value={`T${formatCount(highestTier)}`} />
          <AccountMetric label="Tiempo sesion" value={sessionMinutes > 0 ? `${sessionMinutes}m` : "<1m"} />
          <AccountMetric label="Weekly listos" value={formatCount(claimableWeeklyContracts)} />
        </div>

        <div className="account-progress-profile">
          Perfil: {formatAppearanceLabel(appearanceProfile.title || "wayfarer")} · {formatAppearanceLabel(appearanceProfile.banner || "ember")} · {formatAppearanceLabel(appearanceProfile.palette || "sanctuary")}.
        </div>
      </Panel>

      <Panel
        id="weekly-ledger-section"
        ref={weeklySectionRef}
        dense={isDenseWeeklyMobile}
        {...weeklyPanelProps}
      >
        <FlScreenHeader
          className={["account-progress-header", isDenseWeeklyMobile ? "account-progress-header--dense" : ""].filter(Boolean).join(" ")}
          compact={isDenseWeeklyMobile}
          eyebrow="Weekly Ledger"
          title="Contratos de la semana"
          subtitle="Vista compacta: las 3 misiones quedan visibles y se reclaman desde aqui."
          chips={(
            <div className="account-progress-chip-row">
              <StatusChip label={`Semana ${state?.weeklyLedger?.weekKey || "-"}`} tone="var(--tone-warning, #f59e0b)" surface="var(--tone-warning-soft, #fff7ed)" dense={isDenseWeeklyMobile} />
              {weeklyTotalContracts > 0 && (
                <StatusChip label={`${formatCount(completedWeeklyContracts)}/${formatCount(weeklyTotalContracts)} completas`} tone="var(--tone-accent, #4338ca)" surface="var(--tone-accent-soft, #eef2ff)" dense={isDenseWeeklyMobile} />
              )}
              <StatusChip
                tone={claimableWeeklyContracts > 0 || weeklyAllClaimed ? "var(--tone-success, #10b981)" : "var(--tone-warning, #f59e0b)"}
                surface={claimableWeeklyContracts > 0 || weeklyAllClaimed ? "var(--tone-success-soft, #ecfdf5)" : "var(--tone-warning-soft, #fff7ed)"}
                dense={isDenseWeeklyMobile}
                label={weeklyAllClaimed
                  ? "Todo reclamado"
                  : claimableWeeklyContracts > 0
                    ? `${formatCount(claimableWeeklyContracts)} para reclamar`
                    : "En progreso"}
              />
              {claimableWeeklyContracts > 1 && !weeklyAllClaimed && (
                <InlineAction
                  onClick={() => {
                    claimableWeeklyContractEntries.forEach(contract => {
                      dispatch({ type: "CLAIM_WEEKLY_LEDGER_CONTRACT", contractId: contract.id });
                    });
                  }}
                  tone="var(--tone-success, #10b981)"
                  surface="var(--tone-success-soft, #ecfdf5)"
                  dense={isDenseWeeklyMobile}
                >
                  Reclamar todo
                </InlineAction>
              )}
            </div>
          )}
        />

        <div className="account-weekly-grid" {...weeklyGridProps}>
          {weeklyContracts.map(contract => (
            <WeeklyContractCard key={contract.id} contract={contract} dispatch={dispatch} dense={isDenseWeeklyMobile} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

const Panel = React.forwardRef(function AccountPanel({ children, style = {}, dense = false, ...rest }, ref) {
  const panelProps = style && Object.keys(style).length > 0 ? { style } : {};
  return (
    <FlPanel
      {...rest}
      {...panelProps}
      ref={ref}
      variant="compact"
      className={["progress-panel", dense ? "progress-panel--dense" : ""].filter(Boolean).join(" ")}
    >
      {children}
    </FlPanel>
  );
});

function toneFromCssVar(raw = "") {
  const value = String(raw || "").toLowerCase();
  if (value.includes("success")) return "success";
  if (value.includes("danger")) return "danger";
  if (value.includes("warning")) return "warning";
  if (value.includes("violet") || value.includes("accent")) return "arcane";
  if (value.includes("info")) return "defense";
  return "neutral";
}

function progressTypeFromCssVar(raw = "") {
  const tone = toneFromCssVar(raw);
  if (tone === "danger") return "danger";
  if (tone === "success") return "success";
  if (tone === "arcane") return "arcane";
  return "progress";
}

function CardHeader({
  tag = "",
  title = "",
  badge = "",
  badgeTone = "var(--tone-accent, #4338ca)",
  dense = false,
}) {
  return (
    <div className={["progress-card-header", dense ? "progress-card-header--dense" : ""].filter(Boolean).join(" ")}>
      <div className="progress-card-header-copy">
        {tag ? (
          <div className="progress-card-header-tag">
            {tag}
          </div>
        ) : null}
        <div className="progress-card-header-title">
          {title}
        </div>
      </div>
      {badge ? (
        <FlBadge
          variant="rect"
          size={dense ? "xs" : "sm"}
          tone={toneFromCssVar(badgeTone)}
          className="progress-card-header-badge"
        >
          {badge}
        </FlBadge>
      ) : null}
    </div>
  );
}

function StatusChip({ label = "", tone = "var(--tone-accent, #4338ca)", dense = false }) {
  return (
    <FlBadge
      variant="rect"
      tone={toneFromCssVar(tone)}
      size={dense ? "xs" : "sm"}
      className={["progress-status-chip", dense ? "progress-status-chip--dense" : ""].filter(Boolean).join(" ")}
    >
      {label}
    </FlBadge>
  );
}

function ProgressBar({ percent = 0, tone = "var(--tone-warning, #f59e0b)", dense = false }) {
  return (
    <FlProgressBar
      className={["progress-primitive-bar", dense ? "progress-primitive-bar--dense" : ""].filter(Boolean).join(" ")}
      type={progressTypeFromCssVar(tone)}
      percent={percent}
      size={dense ? "xs" : "sm"}
      showValue={false}
    />
  );
}

function InlineAction({
  children,
  onClick,
  disabled = false,
  tone = "var(--tone-accent, #4338ca)",
  dense = false,
}) {
  const mappedTone = toneFromCssVar(tone);
  const variant = mappedTone === "success" ? "success" : mappedTone === "danger" ? "danger" : "default";
  return (
    <FlButton
      className={["progress-inline-action", dense ? "progress-inline-action--dense" : ""].filter(Boolean).join(" ")}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      variant={variant}
      size={dense ? "sm" : "md"}
    >
      {children}
    </FlButton>
  );
}

function AccountMetric({ label, value }) {
  return (
    <div className="account-progress-metric">
      <div className="account-progress-metric__label">{label}</div>
      <div className="account-progress-metric__value">{value}</div>
    </div>
  );
}

function WeeklyContractCard({ contract, dispatch, dense = false }) {
  const goal = contract.goal;
  const progress = contract.progress || {};
  const reward = contract.reward || {};
  const completed = !!progress.completed;
  const claimed = !!contract.claimed;
  const canClaim = completed && !claimed && typeof dispatch === "function";
  const statusMeta = getObjectiveStatusMeta(
    resolveObjectiveStatus({ completed, claimed }),
    {
      inProgressLabel: "En progreso",
      claimableLabel: "Listo para reclamar",
      claimedLabel: "Reclamado",
    }
  );
  return (
    <Panel dense={dense}>
      <CardHeader
        tag={contract.laneLabel || "Contrato semanal"}
        title={goal?.name || "Contrato"}
        badge={`${formatCount(progress.current)} / ${formatCount(progress.target)}`}
        badgeTone={statusMeta.tone}
        badgeSurface={statusMeta.surface}
        dense={dense}
      />
      <div className="account-weekly-copy">
        <div className={["account-weekly-description", dense ? "account-weekly-description--dense" : ""].filter(Boolean).join(" ")}>
          {contract?.objectiveDescription || goal?.hint || goal?.description || "Juega normal y deja que la cuenta avance."}
        </div>
      </div>

      <div className={["account-weekly-progress", dense ? "account-weekly-progress--dense" : ""].filter(Boolean).join(" ")}>
        <ProgressBar percent={progress.percent} tone={statusMeta.progressTone} dense={dense} />
        <div className={["account-weekly-progress-note", dense ? "account-weekly-progress-note--dense" : ""].filter(Boolean).join(" ")}>
          {completed ? "Contrato completo. Listo para reclamar." : `Restan ${formatCount(progress.remaining)} esta semana.`}
        </div>
      </div>

      <div className={["account-weekly-rewards", dense ? "account-weekly-rewards--dense" : ""].filter(Boolean).join(" ")}>
        <StatusChip label={`+${formatCount(reward.gold || 0)} oro`} tone="var(--tone-warning, #f59e0b)" surface="var(--tone-warning-soft, #fff7ed)" dense={dense} />
        <StatusChip label={`+${formatCount(reward.essence || 0)} esencia`} tone="var(--tone-info, #0369a1)" surface="var(--tone-info-soft, #f0f9ff)" dense={dense} />
        {!!reward.talentPoints && (
          <StatusChip label={`+${formatCount(reward.talentPoints)} TP`} tone="var(--tone-violet, #7c3aed)" surface="var(--tone-violet-soft, #f3e8ff)" dense={dense} />
        )}
        <StatusChip label={statusMeta.label} tone={statusMeta.tone} surface={statusMeta.surface} dense={dense} />
      </div>

      <InlineAction
        onClick={() => canClaim && dispatch({ type: "CLAIM_WEEKLY_LEDGER_CONTRACT", contractId: contract.id })}
        disabled={!canClaim}
        tone={canClaim ? "var(--tone-success, #10b981)" : "var(--color-border-primary, #e2e8f0)"}
        surface={canClaim ? "var(--tone-success-soft, #ecfdf5)" : "var(--color-background-secondary, #ffffff)"}
        dense={dense}
      >
        {canClaim ? "Reclamar" : statusMeta.label}
      </InlineAction>
    </Panel>
  );
}
