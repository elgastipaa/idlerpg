import React, { useMemo } from "react";
import { getWeeklyLedgerContractsWithProgress } from "../engine/progression/weeklyLedger";

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

export default function AccountProgressView({ state, dispatch }) {
  const sanctuary = state?.sanctuary || {};
  const prestige = state?.prestige || {};
  const abyss = state?.abyss || {};
  const appearanceProfile = state?.appearanceProfile || {};
  const blueprints = Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints : [];
  const highestTier = Math.max(1, Number(state?.combat?.maxTier || 1), Number(abyss?.highestTierReached || 1));
  const highestDepth = Math.max(0, Number(abyss?.highestDepthReached || 0));
  const sessionTicks = Number(state?.combat?.analytics?.ticks || 0);
  const sessionMinutes = Math.floor(sessionTicks / 60);
  const weeklyContracts = useMemo(
    () => getWeeklyLedgerContractsWithProgress(state, state?.weeklyLedger || {}),
    [state]
  );
  const claimableWeeklyContracts = weeklyContracts.filter(contract => contract.progress?.completed && !contract.claimed).length;

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
              Vista compacta de progreso largo sin duplicar detalles de Ecos, Biblioteca, Abismo y Blueprints.
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
              {formatCount(blueprints.length)} plano{blueprints.length === 1 ? "" : "s"}
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

      <section style={panelStyle()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
              Weekly Ledger
            </div>
            <div style={{ fontSize: "0.96rem", fontWeight: "900", marginTop: "4px" }}>
              Contratos de la semana
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45, maxWidth: "62ch" }}>
              Tres contratos acumulables, sin streaks ni castigo por faltar. Si vuelves tarde, sigues viendo el ledger vigente y lo completas jugando normal.
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={chipStyle({ tone: "var(--tone-warning, #f59e0b)", surface: "var(--tone-warning-soft, #fff7ed)" })}>
              Semana {state?.weeklyLedger?.weekKey || "-"}
            </span>
            <span style={chipStyle({ tone: claimableWeeklyContracts > 0 ? "var(--tone-success, #10b981)" : "var(--tone-accent, #4338ca)", surface: claimableWeeklyContracts > 0 ? "var(--tone-success-soft, #ecfdf5)" : "var(--tone-accent-soft, #eef2ff)" })}>
              {claimableWeeklyContracts > 0 ? `${formatCount(claimableWeeklyContracts)} para reclamar` : "Sin urgencia"}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          {weeklyContracts.map(contract => (
            <WeeklyContractCard key={contract.id} contract={contract} dispatch={dispatch} />
          ))}
        </div>
      </section>
    </div>
  );
}

function WeeklyContractCard({ contract, dispatch }) {
  const goal = contract.goal;
  const progress = contract.progress || {};
  const reward = contract.reward || {};
  const completed = !!progress.completed;
  const claimed = !!contract.claimed;
  const canClaim = completed && !claimed && typeof dispatch === "function";

  return (
    <div style={panelStyle()}>
      <div style={{ display: "grid", gap: "4px" }}>
        <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--tone-warning, #f59e0b)" }}>
          {contract.laneLabel || "Contrato semanal"}
        </div>
        <div style={{ fontSize: "0.9rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
          {goal?.name || "Contrato"}
        </div>
        <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
          {goal?.hint || goal?.description || "Juega normal y deja que la cuenta avance."}
        </div>
      </div>

      <div style={{ ...metricCardStyle(), gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
          <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
            Progreso semanal
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: "900", color: completed ? "var(--tone-success, #10b981)" : "var(--color-text-primary, #1e293b)" }}>
            {formatCount(progress.current)} / {formatCount(progress.target)}
          </div>
        </div>
        <div style={{ width: "100%", height: "8px", background: "var(--color-background-secondary, #ffffff)", borderRadius: "999px", overflow: "hidden", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
          <div style={{ width: `${Math.max(0, Math.min(100, Number(progress.percent || 0)))}%`, height: "100%", background: completed ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #4338ca, #6366f1)" }} />
        </div>
        <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
          {completed ? "Contrato completo. Puedes reclamarlo cuando quieras." : `Faltan ${formatCount(progress.remaining)} para cerrarlo esta semana.`}
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <span style={chipStyle({ tone: "var(--tone-warning, #f59e0b)", surface: "var(--tone-warning-soft, #fff7ed)" })}>
          +{formatCount(reward.gold || 0)} oro
        </span>
        <span style={chipStyle({ tone: "var(--tone-info, #0369a1)", surface: "var(--tone-info-soft, #f0f9ff)" })}>
          +{formatCount(reward.essence || 0)} esencia
        </span>
        {!!reward.talentPoints && (
          <span style={chipStyle({ tone: "var(--tone-violet, #7c3aed)", surface: "var(--tone-violet-soft, #f3e8ff)" })}>
            +{formatCount(reward.talentPoints)} TP
          </span>
        )}
      </div>

      <button
        onClick={() => canClaim && dispatch({ type: "CLAIM_WEEKLY_LEDGER_CONTRACT", contractId: contract.id })}
        disabled={!canClaim}
        style={{
          border: "1px solid",
          borderColor: claimed ? "var(--color-border-primary, #e2e8f0)" : canClaim ? "var(--tone-success, #10b981)" : "var(--color-border-primary, #e2e8f0)",
          background: claimed ? "var(--color-background-tertiary, #f8fafc)" : canClaim ? "var(--tone-success-soft, #ecfdf5)" : "var(--color-background-secondary, #ffffff)",
          color: claimed ? "var(--color-text-tertiary, #94a3b8)" : canClaim ? "var(--tone-success, #10b981)" : "var(--color-text-tertiary, #94a3b8)",
          borderRadius: "12px",
          padding: "9px 12px",
          fontSize: "0.68rem",
          fontWeight: "900",
          cursor: canClaim ? "pointer" : "not-allowed",
        }}
      >
        {claimed ? "Reclamado" : canClaim ? "Reclamar contrato" : "En progreso"}
      </button>
    </div>
  );
}
