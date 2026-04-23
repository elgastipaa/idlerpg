import React, { useMemo } from "react";
import { ACTIVE_GOALS } from "../data/activeGoals";
import {
  getCodexBossEntries,
  getCodexFamilyEntries,
  getCodexLegendaryPowerEntries,
  getCodexUnlockedMilestones,
} from "../engine/progression/codexEngine";
import { ABYSS_PORTAL_TIER, getAbyssUnlockEntries } from "../engine/progression/abyssProgression";
import { getGoalProgress } from "../engine/progression/goalEngine";
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

function findNextGoal(state, category = "") {
  return ACTIVE_GOALS
    .filter(goal => goal.category === category)
    .map(goal => {
      const progress = getGoalProgress(state, goal);
      const target = Number(goal?.target?.value || 1);
      return {
        ...goal,
        progress,
        target,
        remaining: Math.max(0, target - progress),
        completed: progress >= target,
      };
    })
    .find(goal => !goal.completed) || null;
}

function buildBlueprintStep(sanctuary = {}) {
  const extractedItems = Array.isArray(sanctuary?.extractedItems) ? sanctuary.extractedItems : [];
  const blueprints = Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints : [];
  const activeBlueprintCount = Object.values(sanctuary?.activeBlueprints || {}).filter(Boolean).length;

  if (extractedItems.length > 0) {
    return `Tienes ${formatCount(extractedItems.length)} pieza(s) rescatada(s) esperando decision en Santuario.`;
  }
  if (blueprints.length <= 0) {
    return "Todavia no tienes blueprints. Rescata una pieza y conviertela para empezar a sesgar futuras runs.";
  }
  if (activeBlueprintCount <= 0) {
    return "Ya tienes planos, pero ninguno activo. Marca arma o armadura para que materialicen en la siguiente salida.";
  }
  return `${formatCount(activeBlueprintCount)} blueprint(s) activo(s) ya alimentan la proxima run.`;
}

function buildCodexStep({ readyResearchCount = 0, unlockedPowers = 0, hiddenPowers = 0, codexInk = 0 } = {}) {
  if (readyResearchCount > 0) {
    return `${formatCount(readyResearchCount)} investigacion(es) de Biblioteca lista(s) para reclamar.`;
  }
  if (codexInk <= 0) {
    return "La Biblioteca ya existe, pero falta tinta. Destila `codex_trace` para convertir kills en bonos permanentes.";
  }
  if (hiddenPowers > 0) {
    return `${formatCount(hiddenPowers)} poderes siguen ocultos. Intel y Caza todavia tienen valor real para la cuenta.`;
  }
  if (unlockedPowers > 0) {
    return "Tu Codex ya esta creciendo; ahora el foco es subir maestrias y no solo descubrir.";
  }
  return "La cuenta todavia no serializo bien la Biblioteca. Empieza por ver familias, bosses y primeras investigaciones.";
}

function buildAbyssStep({ nextUnlock = null, highestTier = 1 } = {}) {
  if (!nextUnlock) {
    return "Todos los hitos de Abismo actuales ya estan abiertos en esta version.";
  }
  return `El siguiente salto fuerte esta en Tier ${nextUnlock.minTier}: ${nextUnlock.name} · ${nextUnlock.reward}. Hoy tu pico es T${formatCount(highestTier)}.`;
}

function buildPrestigeStep({ nextGoal = null, totalEchoesEarned = 0, nodeCount = 0 } = {}) {
  if (nextGoal) {
    return `${nextGoal.name}: ${formatCount(nextGoal.progress)} / ${formatCount(nextGoal.target)}. ${nextGoal.hint}`;
  }
  if (nodeCount <= 0 && totalEchoesEarned > 0) {
    return "Ya ganaste ecos. El siguiente salto obvio es convertirlos en nodos permanentes del tablero.";
  }
  return "Prestige ya esta corriendo. El foco ahora es hacer que cada reset cambie mejor la siguiente intencion de run.";
}

function formatAppearanceLabel(value = "") {
  return String(value || "")
    .split("_")
    .join(" ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function buildAppearanceStep(profile = {}) {
  return `Banner ${formatAppearanceLabel(profile.banner)} · paleta ${formatAppearanceLabel(profile.palette)} · titulo ${formatAppearanceLabel(profile.title)}. La capa ya existe aunque todavia no sea una feature social.`;
}

function ProgressCard({ eyebrow, title, summary, metrics = [], detail = "", chips = [] }) {
  return (
    <div style={panelStyle()}>
      <div style={{ display: "grid", gap: "4px" }}>
        <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--tone-accent, #4338ca)" }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: "0.92rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
          {summary}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
        {metrics.map(metric => (
          <div key={metric.label} style={metricCardStyle()}>
            <div style={{ fontSize: "0.54rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              {metric.label}
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>
      {chips.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {chips.map(chip => (
            <span key={chip.label} style={chipStyle(chip.style || {})}>
              {chip.label}
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
        {detail}
      </div>
    </div>
  );
}

export default function AccountProgressView({ state, dispatch }) {
  const sanctuary = state?.sanctuary || {};
  const codex = state?.codex || {};
  const prestige = state?.prestige || {};
  const abyss = state?.abyss || {};
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];

  const familyEntries = useMemo(() => getCodexFamilyEntries(codex), [codex]);
  const bossEntries = useMemo(() => getCodexBossEntries(codex, { maxTier: state?.combat?.maxTier || 1, abyss }), [codex, state?.combat?.maxTier, abyss]);
  const powerEntries = useMemo(() => getCodexLegendaryPowerEntries(codex, { abyss }), [codex, abyss]);
  const unlockedCodexMilestones = useMemo(() => getCodexUnlockedMilestones(codex, { abyss }), [codex, abyss]);
  const abyssUnlocks = useMemo(() => getAbyssUnlockEntries(abyss), [abyss]);

  const familySeenCount = familyEntries.filter(entry => entry.seen).length;
  const fullyResearchedFamilies = familyEntries.filter(entry => entry.maxResearchRank > 0 && entry.researchedRank >= entry.maxResearchRank).length;
  const bossSeenCount = bossEntries.filter(entry => entry.seen).length;
  const fullyResearchedBosses = bossEntries.filter(entry => entry.maxResearchRank > 0 && entry.researchedRank >= entry.maxResearchRank).length;
  const unlockedPowers = powerEntries.filter(entry => entry.unlocked).length;
  const masteredPowers = powerEntries.filter(entry => Number(entry?.mastery?.rank || 0) >= 4).length;
  const hiddenPowers = Math.max(0, powerEntries.length - unlockedPowers);
  const readyResearchCount = jobs.filter(job => job?.type === "codex_research" && job?.status === "claimable").length;
  const nextAbyssUnlock = abyssUnlocks.find(entry => !entry.unlocked) || null;
  const unlockedAbyssCount = abyssUnlocks.filter(entry => entry.unlocked).length;
  const blueprints = Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints : [];
  const extractedItems = Array.isArray(sanctuary?.extractedItems) ? sanctuary.extractedItems : [];
  const activeBlueprintCount = Object.values(sanctuary?.activeBlueprints || {}).filter(Boolean).length;
  const prestigeNodeCount = Object.values(prestige?.nodes || {}).filter(level => Number(level || 0) > 0).length;
  const nextPrestigeGoal = findNextGoal(state, "prestige");
  const nextTierGoal = findNextGoal(state, "combat");
  const codexInk = Math.max(0, Number(sanctuary?.resources?.codexInk || 0));
  const highestTier = Math.max(1, Number(state?.combat?.maxTier || 1), Number(abyss?.highestTierReached || 1));
  const highestDepth = Math.max(0, Number(abyss?.highestDepthReached || 0));
  const appearanceProfile = state?.appearanceProfile || {};
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
              Estanteria de maestria
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45, maxWidth: "68ch" }}>
              Aqui la cuenta deja de verse como sistemas separados. Junta `Prestige`, `Biblioteca`, `Abismo` y `Blueprints` en una sola lectura.
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
              {formatCount(blueprints.length)} blueprint{blueprints.length === 1 ? "" : "s"}
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
              Tier historico
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>T{formatCount(highestTier)}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Biblioteca
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{formatCount(unlockedCodexMilestones.length)} hitos</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Abismo
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{formatCount(unlockedAbyssCount)} / {formatCount(abyssUnlocks.length)}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Stash largo
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{formatCount(extractedItems.length)} stash · {formatCount(activeBlueprintCount)} activo(s)</div>
          </div>
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

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
        <ProgressCard
          eyebrow="Perfil"
          title={`${formatAppearanceLabel(appearanceProfile.title || "wayfarer")} · ${formatAppearanceLabel(appearanceProfile.banner || "ember")}`}
          summary="Seam minimo de identidad de cuenta. No cambia poder ni abre tienda; solo deja lista la capa futura."
          metrics={[
            { label: "Banner", value: formatAppearanceLabel(appearanceProfile.banner || "ember") },
            { label: "Paleta", value: formatAppearanceLabel(appearanceProfile.palette || "sanctuary") },
            { label: "Badge", value: appearanceProfile.badge ? formatAppearanceLabel(appearanceProfile.badge) : "Ninguno" },
          ]}
          chips={[
            { label: "Preparado para Profile Card", style: { tone: "var(--tone-danger, #D85A30)", surface: "var(--tone-danger-soft, #fff7ed)" } },
          ]}
          detail={buildAppearanceStep(appearanceProfile)}
        />

        <ProgressCard
          eyebrow="Prestige"
          title={`P${formatCount(prestige.level || 0)} · ${formatCount(prestigeNodeCount)} nodo(s) activos`}
          summary="El tablero meta, la resonancia y el ritmo de reset ya forman parte de la cuenta."
          metrics={[
            { label: "Disponibles", value: formatCount(prestige.echoes || 0) },
            { label: "Totales", value: formatCount(prestige.totalEchoesEarned || 0) },
            { label: "Gastados", value: formatCount(prestige.spentEchoes || 0) },
          ]}
          chips={[
            {
              label: nextPrestigeGoal ? `${nextPrestigeGoal.name}: ${formatCount(nextPrestigeGoal.progress)} / ${formatCount(nextPrestigeGoal.target)}` : "Prestige goals completos",
              style: { tone: "var(--tone-accent, #4338ca)", surface: "var(--tone-accent-soft, #eef2ff)" },
            },
          ]}
          detail={buildPrestigeStep({
            nextGoal: nextPrestigeGoal,
            totalEchoesEarned: prestige.totalEchoesEarned || 0,
            nodeCount: prestigeNodeCount,
          })}
        />

        <ProgressCard
          eyebrow="Biblioteca"
          title={`${formatCount(familySeenCount)} familias · ${formatCount(bossSeenCount)} bosses · ${formatCount(unlockedPowers)} powers`}
          summary="La cuenta ya guarda familias, bosses, poderes y research; aqui se ve como una sola linea de maestria."
          metrics={[
            { label: "Familias full", value: `${formatCount(fullyResearchedFamilies)} / ${formatCount(familyEntries.length)}` },
            { label: "Bosses full", value: `${formatCount(fullyResearchedBosses)} / ${formatCount(bossEntries.length)}` },
            { label: "Powers miticos", value: `${formatCount(masteredPowers)} / ${formatCount(powerEntries.length)}` },
          ]}
          chips={[
            { label: `${formatCount(unlockedCodexMilestones.length)} hitos activos`, style: { tone: "var(--tone-info, #0369a1)", surface: "var(--tone-info-soft, #f0f9ff)" } },
            { label: `${formatCount(codexInk)} tinta`, style: { tone: "var(--tone-warning, #f59e0b)", surface: "var(--tone-warning-soft, #fff7ed)" } },
          ]}
          detail={buildCodexStep({
            readyResearchCount,
            unlockedPowers,
            hiddenPowers,
            codexInk,
          })}
        />

        <ProgressCard
          eyebrow="Abismo"
          title={`Profundidad ${formatCount(highestDepth)} · Pico T${formatCount(highestTier)}`}
          summary="El Abismo ya ordena la progresion larga con unlocks claros de cuenta."
          metrics={[
            { label: "Portal", value: highestTier > ABYSS_PORTAL_TIER ? "Abierto" : "Cerrado" },
            { label: "Unlocks", value: `${formatCount(unlockedAbyssCount)} / ${formatCount(abyssUnlocks.length)}` },
            { label: "Siguiente", value: nextAbyssUnlock ? nextAbyssUnlock.name : "Todo abierto" },
          ]}
          chips={abyssUnlocks.filter(entry => entry.unlocked).slice(-2).map(entry => ({
            label: entry.name,
            style: { tone: "var(--tone-violet, #7c3aed)", surface: "var(--tone-violet-soft, #f3e8ff)" },
          }))}
          detail={buildAbyssStep({
            nextUnlock: nextAbyssUnlock,
            highestTier,
          })}
        />

        <ProgressCard
          eyebrow="Blueprints"
          title={`${formatCount(blueprints.length)} plano(s) · ${formatCount(activeBlueprintCount)} activo(s)`}
          summary="El Santuario ya conserva direccion entre runs; aqui se ve si esa capa realmente esta viva."
          metrics={[
            { label: "Stash", value: formatCount(extractedItems.length) },
            { label: "Weapon", value: sanctuary?.activeBlueprints?.weapon ? "Activo" : "Libre" },
            { label: "Armor", value: sanctuary?.activeBlueprints?.armor ? "Activo" : "Libre" },
          ]}
          chips={[
            { label: nextTierGoal ? `${nextTierGoal.name}: ${formatCount(nextTierGoal.progress)} / ${formatCount(nextTierGoal.target)}` : "Push goals completos", style: { tone: "var(--tone-success, #10b981)", surface: "var(--tone-success-soft, #ecfdf5)" } },
          ]}
          detail={buildBlueprintStep(sanctuary)}
        />
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
