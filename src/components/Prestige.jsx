import React, { useEffect, useMemo, useRef, useState } from "react";
import { PRESTIGE_BRANCHES, PRESTIGE_TREE_NODES } from "../data/prestige";
import {
  calculatePrestigeEchoGain,
  canPrestige,
  canPurchasePrestigeNode,
  getPrestigePreview,
  getPrestigeNodeLevel,
  getPrestigeBonusRows,
  getPrestigeResonanceSummary,
  isPrestigeBranchUnlocked,
} from "../engine/progression/prestigeEngine";
import { getAbyssUnlockEntries } from "../engine/progression/abyssProgression";
import { getOnboardingFirstEchoNodeId, getOnboardingStepInteractionMode, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import { buildRunOutcomeSummary } from "../utils/runOutcomeSummary";

const PERCENT_KEYS = new Set([
  "damagePct",
  "defensePct",
  "hpPct",
  "regenPctMaxHp",
  "thornsDefenseRatio",
  "goldPct",
  "xpPct",
  "attackSpeed",
  "lifesteal",
  "dodgeChance",
  "blockChance",
  "critDamage",
  "critOnLowHp",
  "essenceBonus",
  "lootBonus",
  "multiHitChance",
  "markChance",
  "markEffectPerStack",
  "flowBonusMult",
  "markTransferPct",
  "freshTargetDamage",
  "controlMastery",
  "sellValueBonus",
  "flatCrit",
  "upgradeCostReduction",
  "rerollCostReduction",
  "polishCostReduction",
  "reforgeCostReduction",
  "ascendCostReduction",
  "ascendImprintCostReduction",
  "discoveredPowerBias",
  "abyssDamagePct",
  "abyssEnemyAffixPenaltyReduction",
  "abyssNormalEnemyPenaltyReduction",
  "abyssLootQuality",
  "abyssEssenceMult",
  "abyssBossMechanicMitigation",
  "abyssMutatorOffensePct",
]);

const BONUS_LABELS = {
  damagePct: "Dano",
  defensePct: "Defensa",
  hpPct: "Vida",
  regenPctMaxHp: "Regen",
  flatDamage: "Dano plano",
  flatDefense: "Defensa plana",
  healthRegen: "Regen",
  flatCrit: "Crit",
  goldPct: "Oro",
  xpPct: "XP",
  attackSpeed: "Velocidad",
  lifesteal: "Robo de vida",
  dodgeChance: "Evasion",
  blockChance: "Bloqueo",
  critDamage: "Dano critico",
  critOnLowHp: "Crit baja vida",
  damageOnKill: "Dano al matar",
  thorns: "Espinas",
  thornsDefenseRatio: "Espinas desde defensa",
  essenceBonus: "Esencia",
  lootBonus: "Botin",
  luck: "Suerte",
  multiHitChance: "Multi-hit",
  flowHits: "Golpes con Flow",
  markChance: "Marca",
  markEffectPerStack: "Potencia de marca",
  flowBonusMult: "Flow",
  markTransferPct: "Transferencia",
  freshTargetDamage: "Apertura",
  chainBurst: "Burst en cadena",
  volatileCasting: "Volatilidad",
  controlMastery: "Control",
  cataclysm: "Cataclismo",
  sellValueBonus: "Venta",
  upgradeCostReduction: "Costo upgrade",
  rerollCostReduction: "Costo reroll",
  polishCostReduction: "Costo polish",
  reforgeCostReduction: "Costo reforge",
  ascendCostReduction: "Costo ascend",
  ascendImprintCostReduction: "Ascender con poder",
  reforgeOptionCount: "Opciones de reforja",
  discoveredPowerBias: "Caza de poderes",
  abyssDamagePct: "Dano Abismo",
  abyssEnemyAffixPenaltyReduction: "Castigo de anomalias",
  abyssNormalEnemyPenaltyReduction: "Presion trash",
  abyssLootQuality: "Calidad de loot Abismo",
  abyssEssenceMult: "Esencia Abismo",
  abyssBossMechanicMitigation: "Mitigacion Abismo",
  abyssMutatorOffensePct: "Ofensiva por anomalia",
};

const PRESTIGE_NODE_FILTERS = [
  { id: "comprables", label: "Comprables" },
  { id: "activos", label: "Activos" },
  { id: "todos", label: "Todos" },
];

function formatNumber(value) {
  if (typeof value !== "number") return value;
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatBonus(key, value) {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : numeric < 0 ? "-" : "";
  const magnitude = Math.abs(numeric);
  if (PERCENT_KEYS.has(key)) return `${sign}${formatNumber(magnitude * 100)}%`;
  return `${sign}${formatNumber(magnitude)}`;
}

function formatMultiplier(value = 1) {
  return `x${Number(value || 1).toFixed(1)}`;
}

function formatSignedNumber(value = 0) {
  const numeric = Number(value || 0);
  if (numeric > 0) return `+${formatNumber(numeric)}`;
  if (numeric < 0) return `-${formatNumber(Math.abs(numeric))}`;
  return formatNumber(0);
}

function summarizeEffectEntries(entries = [], { emptyLabel = "Sin invertir", max = 3 } = {}) {
  const filtered = entries.filter(([, value]) => Math.abs(Number(value || 0)) > 0);
  if (!filtered.length) return emptyLabel;
  return filtered
    .slice(0, max)
    .map(([key, value]) => `${formatBonus(key, value)} ${BONUS_LABELS[key] || key}`)
    .join(" · ");
}

function getNodeTone(node, player) {
  if (node.requiresSpecialization && player.specialization !== node.requiresSpecialization) return "lockedClass";
  if (node.requiresClass && player.class !== node.requiresClass) return "lockedClass";
  if (node.capstone) return "capstone";
  return "normal";
}

export default function Prestige({ state, dispatch }) {
  const { player, prestige } = state;
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [activeBranchId, setActiveBranchId] = useState(PRESTIGE_BRANCHES[0]?.id || null);
  const [nodeVisibilityFilter, setNodeVisibilityFilter] = useState("comprables");
  const [showAbyssMilestones, setShowAbyssMilestones] = useState(false);
  const [canScrollBranchesLeft, setCanScrollBranchesLeft] = useState(false);
  const [canScrollBranchesRight, setCanScrollBranchesRight] = useState(false);
  const branchScrollerRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const node = branchScrollerRef.current;
    if (!node) return;

    const syncBranchScrollState = () => {
      const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      setCanScrollBranchesLeft(node.scrollLeft > 6);
      setCanScrollBranchesRight(node.scrollLeft < maxScrollLeft - 6);
    };

    syncBranchScrollState();
    node.addEventListener("scroll", syncBranchScrollState, { passive: true });
    window.addEventListener("resize", syncBranchScrollState);
    return () => {
      node.removeEventListener("scroll", syncBranchScrollState);
      window.removeEventListener("resize", syncBranchScrollState);
    };
  }, [isMobile, activeBranchId]);

  const prestigeCheck = canPrestige(state);
  const echoesOnNext = calculatePrestigeEchoGain(state);
  const prestigePreview = prestigeCheck.preview || getPrestigePreview(state);
  const bonusRows = getPrestigeBonusRows(prestige, player)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 8);
  const resonanceSummary = useMemo(() => getPrestigeResonanceSummary(prestige), [prestige]);
  const activePrestigeNodes = Object.keys(prestige.nodes || {}).filter(key => (prestige.nodes?.[key] || 0) > 0).length;
  const purchasableNodes = PRESTIGE_TREE_NODES.filter(node => canPurchasePrestigeNode(state, node).ok);
  const recommendedNode = purchasableNodes[0] || null;
  const onboardingStep = state?.onboarding?.step || null;
  const onboardingMode = getOnboardingStepInteractionMode(onboardingStep, state);
  const spotlightFirstEchoes =
    onboardingStep === ONBOARDING_STEPS.FIRST_ECHOES && onboardingMode === "forced";
  const spotlightFirstEchoNode = onboardingStep === ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE;
  const tutorialEchoNodeId = spotlightFirstEchoNode
    ? (getOnboardingFirstEchoNodeId(state) || recommendedNode?.id || null)
    : null;
  const resetBreakdown = (prestigePreview.breakdown || []).filter(entry => Math.abs(Number(entry.echoes || 0)) > 0);
  const highlightedBonuses = bonusRows.slice(0, 6);
  const abyssUnlocks = useMemo(() => getAbyssUnlockEntries(state?.abyss || {}), [state?.abyss]);
  const highestAbyssDepth = Number(state?.abyss?.highestDepthReached || 0);
  const highestAbyssTier = Number(state?.abyss?.highestTierReached || 1);
  const prestigeMomentum = prestigePreview.momentum || {
    historicBestTier: 0,
    currentTier: prestigePreview.progress?.maxTier || 1,
    multiplier: 1,
    label: "Primera medicion",
    baseEchoes: echoesOnNext,
    momentumDeltaEchoes: 0,
  };
  const activeBranch = PRESTIGE_BRANCHES.find(branch => branch.id === (activeBranchId || PRESTIGE_BRANCHES[0]?.id)) || PRESTIGE_BRANCHES[0];
  const activeBranchUnlocked = isPrestigeBranchUnlocked(state, activeBranch);
  const branchSummaries = useMemo(() => Object.fromEntries(
    PRESTIGE_BRANCHES.map(branch => {
      const branchNodes = PRESTIGE_TREE_NODES.filter(node => node.branch === branch.id);
      const activeNodes = branchNodes.filter(node => (prestige.nodes?.[node.id] || 0) > 0).length;
      const investedLevels = branchNodes.reduce((total, node) => total + (prestige.nodes?.[node.id] || 0), 0);
      const purchasableNow = branchNodes.filter(node => canPurchasePrestigeNode(state, node).ok).length;
      return [branch.id, {
        activeNodes,
        investedLevels,
        purchasableNow,
        totalNodes: branchNodes.length,
        unlocked: isPrestigeBranchUnlocked(state, branch),
      }];
    })
  ), [prestige.nodes, state]);
  const activeBranchNodes = useMemo(
    () => PRESTIGE_TREE_NODES.filter(node => node.branch === activeBranch?.id).sort((a, b) => a.tier - b.tier),
    [activeBranch]
  );
  const activeBranchTierGroups = useMemo(() => {
    const groups = activeBranchNodes.reduce((acc, node) => {
      const tierKey = node.tier || 0;
      if (!acc[tierKey]) acc[tierKey] = [];
      acc[tierKey].push(node);
      return acc;
    }, {});
    return Object.entries(groups)
      .map(([tier, nodes]) => ({ tier: Number(tier), nodes }))
      .sort((a, b) => a.tier - b.tier);
  }, [activeBranchNodes]);
  const filteredActiveBranchTierGroups = useMemo(() => {
    const shouldShowNode = node => {
      const level = getPrestigeNodeLevel(prestige, node.id);
      const purchase = canPurchasePrestigeNode(state, node);
      if (tutorialEchoNodeId != null && node.id === tutorialEchoNodeId) return true;
      if (nodeVisibilityFilter === "activos") return level > 0;
      if (nodeVisibilityFilter === "comprables") return level > 0 || purchase.ok;
      return true;
    };

    return activeBranchTierGroups
      .map(group => ({
        ...group,
        nodes: group.nodes.filter(shouldShowNode),
        totalNodes: group.nodes.length,
      }))
      .filter(group => group.nodes.length > 0);
  }, [activeBranchTierGroups, nodeVisibilityFilter, prestige, state, tutorialEchoNodeId]);
  const prestigeOutcomeSummary = useMemo(
    () =>
      buildRunOutcomeSummary(state, {
        prestigeMode: "echoes",
        exitReason: "retire",
        echoes: Number(echoesOnNext || 0),
        source: "prestige",
      }),
    [echoesOnNext, state]
  );

  useEffect(() => {
    if (!tutorialEchoNodeId) return;
    const targetNode = PRESTIGE_TREE_NODES.find(node => node.id === tutorialEchoNodeId);
    if (targetNode?.branch && targetNode.branch !== activeBranchId) {
      setActiveBranchId(targetNode.branch);
    }
  }, [activeBranchId, tutorialEchoNodeId]);

  useEffect(() => {
    if (!spotlightFirstEchoes && !spotlightFirstEchoNode) return undefined;

    let frameId = null;
    const selector = spotlightFirstEchoNode
      ? '[data-onboarding-target="buy-first-echo-node-card"]'
      : '[data-onboarding-target="prestige-summary"]';
    const scrollToTarget = () => {
      const target = document.querySelector(selector);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    frameId = requestAnimationFrame(scrollToTarget);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
    };
  }, [spotlightFirstEchoNode, spotlightFirstEchoes, tutorialEchoNodeId, activeBranchId]);

  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <style>{`
        @keyframes prestigeSpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(199,210,254,0.22); }
          70% { box-shadow: 0 0 0 10px rgba(199,210,254,0); }
          100% { box-shadow: 0 0 0 0 rgba(199,210,254,0); }
        }
      `}</style>
      <section
        data-onboarding-target={spotlightFirstEchoes ? "prestige-summary" : undefined}
        onClick={() => spotlightFirstEchoes && dispatch({ type: "ACK_ONBOARDING_STEP" })}
        style={{
          ...summaryPanelStyle,
          position: spotlightFirstEchoes ? "relative" : "static",
          zIndex: spotlightFirstEchoes ? 2 : 1,
          boxShadow: spotlightFirstEchoes
            ? "0 0 0 2px rgba(199,210,254,0.28), 0 16px 34px rgba(15,23,42,0.28)"
            : "none",
          animation: spotlightFirstEchoes ? "prestigeSpotlightPulse 1600ms ease-in-out infinite" : "none",
          cursor: spotlightFirstEchoes ? "pointer" : "default",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={sectionTitleStyle}>Ecos</div>
            <div style={{ fontSize: "1.18rem", color: "#f8fafc", fontWeight: 900, marginTop: "6px" }}>
              {prestigeCheck.ok ? `+${formatNumber(echoesOnNext)} ecos al extraer` : "Todavia no rinde extraer por ecos"}
            </div>
            <div style={{ ...smallCopyStyle, marginTop: "6px", color: "#cbd5e1" }}>
              {prestigeCheck.ok
                ? `${prestigeMomentum.label} · ${formatMultiplier(prestigeMomentum.multiplier)} de momentum.`
                : "Empuja tier y nivel para volver rentable la proxima extraccion."}
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: isMobile ? "stretch" : "flex-end" }}>
            <div style={summaryBadgeStyle}>{formatNumber(prestige.echoes || 0)} disponibles</div>
            <div style={summaryBadgeStyle}>{formatMultiplier(prestigeMomentum.multiplier)} momentum</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
          {resetBreakdown.length > 0 ? resetBreakdown.map(entry => (
            <span key={entry.id} style={compactChipStyle}>
              {entry.id === "momentum"
                ? `${entry.label} ${entry.value}${Number(entry.echoes || 0) !== 0 ? ` · ${formatSignedNumber(entry.echoes)}` : ""}`
                : `${entry.label} +${formatNumber(entry.echoes)}`}
            </span>
          )) : (
            <span style={{ ...compactChipStyle, color: "#94a3b8" }}>{prestigePreview.minimumRunLabel || "Minimo: Tier 3, Nivel 10 o 50 bajas"}</span>
          )}
        </div>

        <div style={{ ...smallCopyStyle, marginTop: "10px", color: "#94a3b8" }}>
          Reinicias la run, pero conservas ecos, tablero y resonancia de cuenta.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, minmax(0, 1fr))", gap: "8px", marginTop: "12px" }}>
          <div style={resetMetricCardStyle}>
            <div style={resetMetricLabelStyle}>Tier actual</div>
            <div style={resetMetricValueStyle}>{formatNumber(prestigeMomentum.currentTier || prestigePreview.progress?.maxTier || 1)}</div>
          </div>
          <div style={resetMetricCardStyle}>
            <div style={resetMetricLabelStyle}>Momentum</div>
            <div style={resetMetricValueStyle}>{formatMultiplier(prestigeMomentum.multiplier)}</div>
            <div style={resetMetricHintStyle}>{prestigeMomentum.label}</div>
          </div>
          <div style={resetMetricCardStyle}>
            <div style={resetMetricLabelStyle}>Base sin momentum</div>
            <div style={resetMetricValueStyle}>{formatNumber(prestigeMomentum.baseEchoes || 0)}</div>
            {!!prestigeMomentum.momentumDeltaEchoes && (
              <div style={resetMetricHintStyle}>
                {Number(prestigeMomentum.momentumDeltaEchoes || 0) >= 0
                  ? `Bonus ${formatSignedNumber(prestigeMomentum.momentumDeltaEchoes)}`
                  : `Penalidad ${formatSignedNumber(prestigeMomentum.momentumDeltaEchoes)}`}
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={summaryPanelStyle}>
        <div style={{ display: "grid", gap: "4px" }}>
          <div style={sectionTitleStyle}>Reset de prestige</div>
          <div style={{ fontSize: "0.96rem", color: "#f8fafc", fontWeight: 900 }}>
            {prestigeOutcomeSummary.title}
          </div>
          <div style={{ ...smallCopyStyle, color: "#94a3b8" }}>
            Lectura corta de lo que realmente pasa cuando esa extraccion ya convierte a ecos.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
          {prestigeOutcomeSummary.groups.map(group => (
            <OutcomeSummaryCard key={group.id} group={group} />
          ))}
        </div>
      </section>

      <section style={summaryPanelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div>
            <div style={sectionTitleStyle}>Ecos disponibles</div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px" }}>
              Lectura corta del meta actual y de lo que ya impacta en la cuenta.
            </div>
          </div>
          <div style={summaryBadgeStyle}>{activePrestigeNodes} nodos activos</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", gap: "8px", marginTop: "12px" }}>
          <div style={resetMetricCardStyle}>
            <div style={resetMetricLabelStyle}>Disponibles</div>
            <div style={resetMetricValueStyle}>{formatNumber(prestige.echoes || 0)}</div>
          </div>
          <div style={resetMetricCardStyle}>
            <div style={resetMetricLabelStyle}>Gastados</div>
            <div style={resetMetricValueStyle}>{formatNumber(prestige.spentEchoes || 0)}</div>
          </div>
          <div style={resetMetricCardStyle}>
            <div style={resetMetricLabelStyle}>Totales</div>
            <div style={resetMetricValueStyle}>{formatNumber(prestige.totalEchoesEarned || 0)}</div>
          </div>
          <div style={resetMetricCardStyle}>
            <div style={resetMetricLabelStyle}>Resonancia</div>
            <div style={resetMetricValueStyle}>{formatNumber(resonanceSummary.totalEchoesEarned || prestige.totalEchoesEarned || 0)}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
          {highlightedBonuses.length > 0 ? highlightedBonuses.map(([key, value]) => (
            <div key={key} style={bonusChipStyle}>
              <span style={{ color: "#94a3b8", textTransform: "uppercase", fontWeight: 900 }}>{BONUS_LABELS[key] || key}</span>
              <strong style={{ color: "#f8fafc" }}>{formatBonus(key, value)}</strong>
            </div>
          )) : (
            <div style={{ ...bonusChipStyle, color: "#cbd5e1" }}>Todavia no invertiste ecos. El primer prestigio abre el tablero meta.</div>
          )}
        </div>

        {resonanceSummary.nextEchoRows.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
            {resonanceSummary.nextEchoRows.slice(0, 3).map(([key, value]) => (
              <span key={key} style={compactChipStyle}>
                Prox eco: {BONUS_LABELS[key] || key} {formatBonus(key, value)}
              </span>
            ))}
          </div>
        )}
      </section>

      <section style={summaryPanelStyle}>
        <button
          onClick={() => setShowAbyssMilestones(current => !current)}
          style={{ width: "100%", background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div>
              <div style={sectionTitleStyle}>Hitos de Abismo</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px" }}>
                Progreso historico de cuenta. {showAbyssMilestones ? "Detalle expandido." : "Abre solo cuando quieras revisar milestones."}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={summaryBadgeStyle}>
                {highestAbyssDepth > 0 ? `Abismo ${highestAbyssDepth}` : "Mundo base"}
              </div>
              <span style={{ ...compactChipStyle, color: "#e2e8f0" }}>{showAbyssMilestones ? "Ocultar" : "Ver"}</span>
            </div>
          </div>
        </button>

        {showAbyssMilestones && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))", gap: "8px", marginTop: "12px" }}>
              {abyssUnlocks.map(unlock => (
                <div
                  key={unlock.id}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: unlock.unlocked ? "rgba(99,102,241,0.24)" : "rgba(148,163,184,0.18)",
                    background: unlock.unlocked ? "rgba(79,70,229,0.12)" : "rgba(255,255,255,0.04)",
                    padding: "10px",
                    display: "grid",
                    gap: "4px",
                  }}
                >
                  <div style={{ fontSize: "0.62rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: unlock.unlocked ? "#c7d2fe" : "#94a3b8" }}>
                    {unlock.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 900, color: unlock.unlocked ? "#f8fafc" : "#e2e8f0" }}>
                    {unlock.reward}
                  </div>
                  <div style={{ fontSize: "0.64rem", color: unlock.unlocked ? "#cbd5e1" : "#94a3b8" }}>
                    {unlock.unlocked ? "Registrado" : `Llega al Tier ${unlock.minTier}`}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...smallCopyStyle, marginTop: "10px", color: "#94a3b8" }}>
              Pico historico: Tier {formatNumber(highestAbyssTier)}.
            </div>
          </>
        )}
      </section>

      <section style={summaryPanelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div>
            <div style={sectionTitleStyle}>Ramas</div>
            <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: "4px" }}>Mira una rama a la vez. Es mas facil leer progreso, costos y proximo nodo util.</div>
          </div>
          {activeBranch && <div style={summaryBadgeStyle}>{activeBranch.name}</div>}
        </div>
        <div style={{ position: "relative", marginTop: "12px" }}>
          <div
            ref={branchScrollerRef}
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "0 18px 2px 0",
              scrollbarWidth: "none",
              scrollBehavior: "smooth",
            }}
          >
            {PRESTIGE_BRANCHES.map(branch => {
              const active = activeBranch?.id === branch.id;
              const summary = branchSummaries[branch.id] || { activeNodes: 0, investedLevels: 0, purchasableNow: 0, totalNodes: 0 };
              const unlocked = summary.unlocked !== false;
              return (
                <button
                  key={`branch-tab-${branch.id}`}
                  onClick={() => setActiveBranchId(branch.id)}
                  style={{
                    minWidth: isMobile ? "138px" : "158px",
                    border: "1px solid",
                    borderColor: active ? `${branch.color}88` : unlocked ? "rgba(255,255,255,0.12)" : "#334155",
                    background: active ? `${branch.color}22` : "#0f172a",
                    color: active ? branch.color : unlocked ? "#cbd5e1" : "#94a3b8",
                    borderRadius: "12px",
                    padding: "9px 10px",
                    cursor: "pointer",
                    textAlign: "left",
                    flexShrink: 0,
                    opacity: unlocked ? 1 : 0.78,
                  }}
                >
                  <div style={{ fontSize: "0.66rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {branch.name}{!unlocked ? " · LOCK" : ""}
                  </div>
                  <div style={{ fontSize: "0.56rem", color: active ? "#e2e8f0" : "#94a3b8", marginTop: "4px", fontWeight: 800 }}>
                    {summary.activeNodes}/{summary.totalNodes} nodos · {summary.investedLevels} niveles
                  </div>
                  {!unlocked && (
                    <div style={{ fontSize: "0.54rem", color: "#cbd5e1", marginTop: "4px", fontWeight: 900 }}>
                      Requiere Abismo I
                    </div>
                  )}
                  {summary.purchasableNow > 0 && (
                    <div style={{ fontSize: "0.54rem", color: branch.color, marginTop: "4px", fontWeight: 900 }}>
                      {summary.purchasableNow} comprable{summary.purchasableNow === 1 ? "" : "s"}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {canScrollBranchesLeft && <div style={branchFadeStyle("left")} />}
          {canScrollBranchesRight && <div style={branchFadeStyle("right")} />}
          {canScrollBranchesLeft && (
            <div style={branchScrollHintStyle("left")}>
              ←
            </div>
          )}
          {canScrollBranchesRight && (
            <div style={branchScrollHintStyle("right")}>
              →
            </div>
          )}
        </div>
      </section>

      {activeBranch && (
        <section style={{ ...summaryPanelStyle, borderColor: `${activeBranch.color}33` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", flexWrap: "wrap" }}>
            <div>
              <div style={{ ...sectionTitleStyle, color: activeBranch.color }}>{activeBranch.name}</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px", lineHeight: 1.4 }}>{activeBranch.description}</div>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {PRESTIGE_NODE_FILTERS.map(filter => {
                const active = nodeVisibilityFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setNodeVisibilityFilter(filter.id)}
                    style={{
                      border: "1px solid",
                      borderColor: active ? activeBranch.color : "rgba(148,163,184,0.22)",
                      background: active ? `${activeBranch.color}22` : "rgba(255,255,255,0.04)",
                      color: active ? activeBranch.color : "#cbd5e1",
                      borderRadius: "999px",
                      padding: "4px 8px",
                      fontSize: "0.58rem",
                      fontWeight: "900",
                      cursor: "pointer",
                    }}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
              <span style={metaChipStyle}>{branchSummaries[activeBranch.id]?.activeNodes || 0}/{branchSummaries[activeBranch.id]?.totalNodes || activeBranchNodes.length} nodos</span>
              <span style={metaChipStyle}>{branchSummaries[activeBranch.id]?.investedLevels || 0} niveles</span>
              {!activeBranchUnlocked && (
                <span style={{ ...metaChipStyle, borderColor: "#475569", color: "#cbd5e1" }}>
                  Desbloquea Abismo I
                </span>
              )}
              {(branchSummaries[activeBranch.id]?.purchasableNow || 0) > 0 && (
                <span style={{ ...metaChipStyle, borderColor: `${activeBranch.color}55`, color: activeBranch.color }}>
                  {branchSummaries[activeBranch.id]?.purchasableNow || 0} comprables
                </span>
              )}
            </div>

          <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
            {filteredActiveBranchTierGroups.length > 0 ? filteredActiveBranchTierGroups.map(group => (
              <div key={`tier-group-${group.tier}`} style={{ display: "grid", gap: "8px" }}>
                <div style={tierHeaderStyle}>
                  <span>Tier {group.tier}</span>
                  <span>{group.nodes.length}/{group.totalNodes} nodo{group.totalNodes === 1 ? "" : "s"}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                  {group.nodes.map(node => {
                    const level = getPrestigeNodeLevel(prestige, node.id);
                    const purchase = canPurchasePrestigeNode(state, node);
                    const tone = getNodeTone(node, player);
                    const spotlightNode = tutorialEchoNodeId != null && node.id === tutorialEchoNodeId;
                    const tutorialLocked = tutorialEchoNodeId != null && node.id !== tutorialEchoNodeId;
                    const buttonEnabled = purchase.ok && !tutorialLocked;
                    const currentEffects = Object.entries(node.effectsPerLevel || {}).map(([key, value]) => [key, value * level]);
                    const currentSummary = summarizeEffectEntries(currentEffects, {
                      emptyLabel: "Sin invertir todavia",
                      max: 3,
                    });
                    const requirementNames = (node.requires || []).map(id => PRESTIGE_TREE_NODES.find(candidate => candidate.id === id)?.name || id);

                    return (
                      <div
                        key={node.id}
                        data-onboarding-target={spotlightNode ? "buy-first-echo-node-card" : undefined}
                        style={{
                          ...nodeCardCompactStyle({
                            active: level > 0,
                            canBuy: buttonEnabled,
                            color: activeBranch.color,
                            tone,
                          }),
                          position: spotlightNode ? "relative" : "static",
                          zIndex: spotlightNode ? 2 : 1,
                          boxShadow: spotlightNode
                            ? "0 0 0 2px rgba(199,210,254,0.28), 0 16px 34px rgba(15,23,42,0.28)"
                            : nodeCardCompactStyle({
                                active: level > 0,
                                canBuy: buttonEnabled,
                                color: activeBranch.color,
                                tone,
                              }).boxShadow,
                          animation: spotlightNode ? "prestigeSpotlightPulse 1600ms ease-in-out infinite" : "none",
                        }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "0.76rem", color: "#f8fafc", fontWeight: 900 }}>{node.name}</span>
                                {node.capstone && <span style={{ ...metaChipStyle, borderColor: "#f59e0b55", color: "#f59e0b" }}>Capstone</span>}
                                {node.requiresSpecialization && <span style={{ ...metaChipStyle, borderColor: "#a855f755", color: "#c4b5fd" }}>{node.requiresSpecialization}</span>}
                              </div>
                            </div>
                          <span style={levelBadgeStyle(level > 0, activeBranch.color)}>{level}/{node.maxLevel}</span>
                        </div>

                        <div style={{ fontSize: "0.64rem", color: "#cbd5e1", fontWeight: 800, marginTop: "10px", lineHeight: 1.4 }}>
                          Actual: <span style={{ color: "#f8fafc" }}>{currentSummary}</span>
                        </div>
                        {!buttonEnabled && purchase.cost != null && level < node.maxLevel && (
                          <div style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: "4px", lineHeight: 1.35 }}>
                            Costo: {purchase.cost} ecos
                          </div>
                        )}

                        {requirementNames.length > 0 && (
                          <div style={{ fontSize: "0.6rem", color: purchase.reason === "requires" ? "#fca5a5" : "#94a3b8", marginTop: "6px", lineHeight: 1.35 }}>
                            Req: {requirementNames.join(" · ")}
                          </div>
                        )}
                        <div style={{ ...nodeDescriptionStyle, marginTop: "4px", fontSize: "0.62rem", color: "#94a3b8" }}>
                          {node.description}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                          <span style={nodeStatusPillStyle(buttonEnabled, tone, activeBranch.color)}>
                            {level >= node.maxLevel
                              ? "Max"
                              : purchase.reason === "unlock"
                                ? "Falta Abismo I"
                                : purchase.reason === "exclusive"
                                  ? "Excluyente"
                              : purchase.reason === "class"
                                ? "Otra spec"
                                : purchase.reason === "requires"
                                  ? "Requiere nodos"
                                  : purchase.cost != null
                                    ? `${purchase.cost} ecos`
                                    : "Bloqueado"}
                          </span>
                          <button
                            onClick={() => dispatch({ type: "BUY_PRESTIGE_NODE", nodeId: node.id })}
                            disabled={!buttonEnabled}
                            data-onboarding-target={spotlightNode ? "buy-first-echo-node" : undefined}
                            style={nodeBuyButtonStyle(activeBranch.color, buttonEnabled)}
                          >
                            {level >= node.maxLevel
                              ? "Maximo"
                              : buttonEnabled
                                ? `Comprar ${purchase.cost}`
                                : purchase.reason === "unlock"
                                  ? "Bloqueado"
                                  : purchase.reason === "exclusive"
                                    ? "Elegido otro"
                                    : "No disponible"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.45 }}>
                {nodeVisibilityFilter === "activos"
                  ? "Todavia no hay nodos activos en esta rama."
                  : "Ahora mismo esta rama no tiene compras inmediatas. Cambia a `Todos` para revisar tiers futuros."}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

const sectionTitleStyle = {
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontWeight: 900,
};

const subtleStyle = {
  fontSize: "0.72rem",
  color: "#94a3b8",
  fontWeight: 700,
};

const smallCopyStyle = {
  fontSize: "0.7rem",
  color: "#cbd5e1",
  lineHeight: 1.45,
};

const valueStyle = {
  fontSize: "1.15rem",
  color: "#f8fafc",
  fontWeight: 900,
};

const miniRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
};

const actionButtonStyle = {
  width: "100%",
  border: "none",
  borderRadius: "12px",
  padding: "10px 12px",
  fontWeight: 900,
  fontSize: "0.74rem",
  transition: "all 0.2s ease",
};

const summaryPanelStyle = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: "18px",
  padding: "14px",
};

const summaryBadgeStyle = {
  background: "rgba(99,102,241,0.15)",
  color: "#c7d2fe",
  border: "1px solid rgba(99,102,241,0.3)",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "0.66rem",
  fontWeight: 900,
  textTransform: "uppercase",
};

const compactChipStyle = {
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "5px 8px",
  fontSize: "0.58rem",
  fontWeight: 900,
  color: "#cbd5e1",
  background: "rgba(255,255,255,0.05)",
};

const resetMetricCardStyle = {
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(255,255,255,0.04)",
  padding: "10px",
  display: "grid",
  gap: "4px",
};

const resetMetricLabelStyle = {
  fontSize: "0.62rem",
  color: "#94a3b8",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const resetMetricValueStyle = {
  fontSize: "0.98rem",
  color: "#f8fafc",
  fontWeight: 900,
};

const resetMetricHintStyle = {
  fontSize: "0.64rem",
  color: "#cbd5e1",
  fontWeight: 800,
};

const bonusChipStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "7px 10px",
  color: "#e2e8f0",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "0.62rem",
  fontWeight: 800,
};

const levelBadgeStyle = (active, color) => ({
  minWidth: "44px",
  textAlign: "center",
  padding: "5px 8px",
  borderRadius: "999px",
  fontSize: "0.64rem",
  fontWeight: 900,
  background: active ? `${color}22` : "rgba(255,255,255,0.06)",
  color: active ? color : "#94a3b8",
  border: `1px solid ${active ? `${color}55` : "rgba(255,255,255,0.08)"}`,
});

const metaChipStyle = {
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "4px 8px",
  fontSize: "0.6rem",
  fontWeight: 800,
  color: "#cbd5e1",
  textTransform: "uppercase",
};

const nodeDescriptionStyle = {
  fontSize: "0.64rem",
  color: "#94a3b8",
  lineHeight: 1.35,
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const tierHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  fontSize: "0.62rem",
  color: "#94a3b8",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const nodeCardCompactStyle = ({ active, canBuy, color, tone }) => ({
  border: `1px solid ${canBuy ? `${color}55` : tone === "capstone" ? "#f59e0b55" : tone === "lockedClass" ? "#334155" : "rgba(255,255,255,0.08)"}`,
  background: active ? "rgba(255,255,255,0.05)" : canBuy ? `${color}12` : "rgba(255,255,255,0.03)",
  borderRadius: "14px",
  padding: "12px",
  opacity: tone === "lockedClass" ? 0.72 : 1,
  minWidth: 0,
});

const nodeStatusPillStyle = (canBuy, tone, color) => ({
  borderRadius: "999px",
  border: `1px solid ${canBuy ? `${color}55` : tone === "lockedClass" ? "#334155" : "rgba(255,255,255,0.08)"}`,
  background: canBuy ? `${color}22` : "rgba(255,255,255,0.04)",
  color: canBuy ? color : "#94a3b8",
  padding: "4px 8px",
  fontSize: "0.58rem",
  fontWeight: 900,
  whiteSpace: "nowrap",
});

const nodeBuyButtonStyle = (color, enabled) => ({
  border: "none",
  borderRadius: "999px",
  padding: "6px 10px",
  fontWeight: 900,
  fontSize: "0.64rem",
  background: enabled ? color : "#334155",
  color: enabled ? "#fff" : "#94a3b8",
  cursor: enabled ? "pointer" : "not-allowed",
});

const branchFadeStyle = (side = "right") => ({
  position: "absolute",
  top: 0,
  bottom: 2,
  [side]: 0,
  width: "28px",
  pointerEvents: "none",
  background: side === "right"
    ? "linear-gradient(90deg, rgba(17,24,39,0) 0%, rgba(17,24,39,0.92) 100%)"
    : "linear-gradient(270deg, rgba(17,24,39,0) 0%, rgba(17,24,39,0.92) 100%)",
});

const branchScrollHintStyle = (side = "right") => ({
  position: "absolute",
  [side]: "4px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "22px",
  height: "22px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(15,23,42,0.82)",
  color: "#cbd5e1",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.78rem",
  fontWeight: 900,
  pointerEvents: "none",
  boxShadow: "0 6px 18px rgba(2,6,23,0.22)",
});

function OutcomeSummaryCard({ group }) {
  return (
    <div
      style={{
        borderRadius: "12px",
        border: "1px solid rgba(148,163,184,0.18)",
        background: "rgba(255,255,255,0.04)",
        padding: "10px",
        display: "grid",
        gap: "8px",
        alignContent: "start",
      }}
    >
      <div style={{ fontSize: "0.62rem", color: "#cbd5e1", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {group.label}
      </div>
      <ul style={{ margin: 0, paddingLeft: "16px", display: "grid", gap: "6px", color: "#94a3b8", fontSize: "0.68rem", lineHeight: 1.45 }}>
        {group.items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

