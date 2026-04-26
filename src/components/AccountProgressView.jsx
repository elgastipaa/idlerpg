import React, { useEffect, useMemo, useRef } from "react";
import { getObjectiveStatusMeta, resolveObjectiveStatus } from "../engine/progression/objectiveStatus";
import { getWeeklyLedgerContractsWithProgress } from "../engine/progression/weeklyLedger";
import useViewport from "../hooks/useViewport";
import { CardHeader, InlineAction, Panel, ProgressBar, StatusChip } from "./ui/ProgressPrimitives";

function panelStyle() {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "10px",
  };
}

function metricCardStyle() {
  return {
    background: "var(--color-background-tertiary, #f8fafc)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "12px",
    padding: "10px 12px",
    display: "grid",
    gap: "4px",
  };
}

function chipStyle({ tone = "var(--tone-accent, #4338ca)", surface = "var(--tone-accent-soft, #eef2ff)" } = {}) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: `1px solid ${tone}`,
    background: surface,
    color: tone,
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "0.62rem",
    fontWeight: "900",
  };
}

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
    <div style={{ display: "grid", gap: "10px" }}>
      <section style={panelStyle()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Cuenta
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
              Resumen de cuenta
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45, maxWidth: "62ch" }}>
              Vista compacta de progreso largo sin duplicar detalles de Ecos, Biblioteca, Abismo y Deep Forge.
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={chipStyle({ tone: "var(--tone-accent, #4338ca)", surface: "var(--tone-accent-soft, #eef2ff)" })}>
              P{formatCount(prestige.level || 0)}
            </span>
            <span style={chipStyle({ tone: "var(--tone-info, #0369a1)", surface: "var(--tone-info-soft, #f0f9ff)" })}>
              Abismo {formatCount(highestDepth)}
            </span>
            <span style={chipStyle({ tone: "var(--tone-violet, #7c3aed)", surface: "var(--tone-violet-soft, #f3e8ff)" })}>
              {formatCount(stashProjects.length)} proyecto{stashProjects.length === 1 ? "" : "s"}
            </span>
            <span style={chipStyle({ tone: "var(--tone-danger, #D85A30)", surface: "var(--tone-danger-soft, #fff1f2)" })}>
              {formatCount(relicArmory.length)} reliquia{relicArmory.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Resonancia
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{formatCount(prestige.totalEchoesEarned || 0)} ecos</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Ecos listos
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{formatCount(prestige.echoes || 0)}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Tier historico
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>T{formatCount(highestTier)}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Tiempo sesion
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{sessionMinutes > 0 ? `${sessionMinutes}m` : "<1m"}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Weekly listos
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{formatCount(claimableWeeklyContracts)}</div>
          </div>
        </div>

        <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
          Perfil: {formatAppearanceLabel(appearanceProfile.title || "wayfarer")} · {formatAppearanceLabel(appearanceProfile.banner || "ember")} · {formatAppearanceLabel(appearanceProfile.palette || "sanctuary")}.
        </div>
      </section>

      <section
        id="weekly-ledger-section"
        ref={weeklySectionRef}
        style={{
          ...panelStyle(),
          ...(isDenseWeeklyMobile ? { padding: "10px", gap: "8px", borderRadius: "12px" } : {}),
          scrollMarginTop: "calc(var(--app-header-offset, 62px) + 14px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: isDenseWeeklyMobile ? "10px" : "12px", alignItems: "start", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: isDenseWeeklyMobile ? "0.6rem" : "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
              Weekly Ledger
            </div>
            <div style={{ fontSize: isDenseWeeklyMobile ? "0.84rem" : "0.9rem", fontWeight: "900", marginTop: "2px" }}>
              Contratos de la semana
            </div>
            <div style={{ fontSize: isDenseWeeklyMobile ? "0.6rem" : "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.35, maxWidth: "58ch" }}>
              Vista compacta: las 3 misiones quedan visibles y se reclaman desde aqui.
            </div>
          </div>
          <div style={{ display: "flex", gap: isDenseWeeklyMobile ? "6px" : "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={chipStyle({ tone: "var(--tone-warning, #f59e0b)", surface: "var(--tone-warning-soft, #fff7ed)" })}>
              Semana {state?.weeklyLedger?.weekKey || "-"}
            </span>
            {weeklyTotalContracts > 0 && (
              <span style={chipStyle({ tone: "var(--tone-accent, #4338ca)", surface: "var(--tone-accent-soft, #eef2ff)" })}>
                {formatCount(completedWeeklyContracts)}/{formatCount(weeklyTotalContracts)} completas
              </span>
            )}
            <span
              style={chipStyle({
                tone: claimableWeeklyContracts > 0 || weeklyAllClaimed ? "var(--tone-success, #10b981)" : "var(--tone-warning, #f59e0b)",
                surface: claimableWeeklyContracts > 0 || weeklyAllClaimed ? "var(--tone-success-soft, #ecfdf5)" : "var(--tone-warning-soft, #fff7ed)",
              })}
            >
              {weeklyAllClaimed
                ? "Todo reclamado"
                : claimableWeeklyContracts > 0
                  ? `${formatCount(claimableWeeklyContracts)} para reclamar`
                  : "En progreso"}
            </span>
            {claimableWeeklyContracts > 1 && !weeklyAllClaimed && (
              <button
                onClick={() => {
                  claimableWeeklyContractEntries.forEach(contract => {
                    dispatch({ type: "CLAIM_WEEKLY_LEDGER_CONTRACT", contractId: contract.id });
                  });
                }}
                style={{
                  border: "1px solid var(--tone-success, #10b981)",
                  background: "var(--tone-success-soft, #ecfdf5)",
                  color: "var(--tone-success, #10b981)",
                  borderRadius: "999px",
                  padding: isDenseWeeklyMobile ? "5px 9px" : "6px 10px",
                  fontSize: isDenseWeeklyMobile ? "0.6rem" : "0.62rem",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                Reclamar todo
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isDenseWeeklyMobile ? "repeat(auto-fit, minmax(176px, 1fr))" : "repeat(auto-fit, minmax(210px, 1fr))", gap: isDenseWeeklyMobile ? "6px" : "8px" }}>
          {weeklyContracts.map(contract => (
            <WeeklyContractCard key={contract.id} contract={contract} dispatch={dispatch} dense={isDenseWeeklyMobile} />
          ))}
        </div>
      </section>
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
  const compactRewardChip = (tone, surface) => ({
    ...chipStyle({ tone, surface }),
    fontSize: dense ? "0.56rem" : "0.58rem",
    padding: dense ? "2px 5px" : "2px 6px",
    gap: dense ? "3px" : "4px",
  });

  return (
    <Panel dense={dense} style={{ borderRadius: "12px", gap: dense ? "6px" : "8px" }}>
      <CardHeader
        tag={contract.laneLabel || "Contrato semanal"}
        title={goal?.name || "Contrato"}
        badge={`${formatCount(progress.current)} / ${formatCount(progress.target)}`}
        badgeTone={statusMeta.tone}
        badgeSurface={statusMeta.surface}
        dense={dense}
      />
      <div style={{ display: "grid", gap: "4px" }}>
        <div
          style={{
            fontSize: dense ? "0.6rem" : "0.62rem",
            color: "var(--color-text-secondary, #64748b)",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {contract?.objectiveDescription || goal?.hint || goal?.description || "Juega normal y deja que la cuenta avance."}
        </div>
      </div>

      <div style={{ background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: dense ? "9px" : "10px", padding: dense ? "6px 7px" : "7px 8px", display: "grid", gap: dense ? "3px" : "4px" }}>
        <ProgressBar percent={progress.percent} tone={statusMeta.progressTone} dense={dense} />
        <div style={{ fontSize: dense ? "0.58rem" : "0.6rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.35 }}>
          {completed ? "Contrato completo. Listo para reclamar." : `Restan ${formatCount(progress.remaining)} esta semana.`}
        </div>
      </div>

      <div style={{ display: "flex", gap: dense ? "4px" : "6px", flexWrap: "wrap" }}>
        <span style={compactRewardChip("var(--tone-warning, #f59e0b)", "var(--tone-warning-soft, #fff7ed)")}>
          +{formatCount(reward.gold || 0)} oro
        </span>
        <span style={compactRewardChip("var(--tone-info, #0369a1)", "var(--tone-info-soft, #f0f9ff)")}>
          +{formatCount(reward.essence || 0)} esencia
        </span>
        {!!reward.talentPoints && (
          <span style={compactRewardChip("var(--tone-violet, #7c3aed)", "var(--tone-violet-soft, #f3e8ff)")}>
            +{formatCount(reward.talentPoints)} TP
          </span>
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
