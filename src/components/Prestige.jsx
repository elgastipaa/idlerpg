import React, { useEffect, useMemo, useRef, useState } from "react";
import { PRESTIGE_BRANCHES, PRESTIGE_TREE_NODES } from "../data/prestige";
import {
  calculatePrestigeEchoGain,
  canPrestige,
  canPurchasePrestigeNode,
  getPrestigePreview,
  getPrestigeNodeLevel,
  getPrestigeBonusRows,
} from "../engine/progression/prestigeEngine";

const PERCENT_KEYS = new Set([
  "damagePct",
  "defensePct",
  "hpPct",
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
]);

const BONUS_LABELS = {
  damagePct: "Dano",
  defensePct: "Defensa",
  hpPct: "Vida",
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
};

function formatNumber(value) {
  if (typeof value !== "number") return value;
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatBonus(key, value) {
  if (PERCENT_KEYS.has(key)) return `+${formatNumber(value * 100)}%`;
  return `+${formatNumber(value)}`;
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
  const activePrestigeNodes = Object.keys(prestige.nodes || {}).filter(key => (prestige.nodes?.[key] || 0) > 0).length;
  const purchasableNodes = PRESTIGE_TREE_NODES.filter(node => canPurchasePrestigeNode(state, node).ok);
  const recommendedNode = purchasableNodes[0] || null;
  const resetBreakdown = (prestigePreview.breakdown || []).filter(entry => (entry.echoes || 0) > 0);
  const highlightedBonuses = bonusRows.slice(0, 6);
  const activeBranch = PRESTIGE_BRANCHES.find(branch => branch.id === (activeBranchId || PRESTIGE_BRANCHES[0]?.id)) || PRESTIGE_BRANCHES[0];
  const branchSummaries = useMemo(() => Object.fromEntries(
    PRESTIGE_BRANCHES.map(branch => {
      const branchNodes = PRESTIGE_TREE_NODES.filter(node => node.branch === branch.id);
      const activeNodes = branchNodes.filter(node => (prestige.nodes?.[node.id] || 0) > 0).length;
      const investedLevels = branchNodes.reduce((total, node) => total + (prestige.nodes?.[node.id] || 0), 0);
      const purchasableNow = branchNodes.filter(node => canPurchasePrestigeNode(state, node).ok).length;
      return [branch.id, { activeNodes, investedLevels, purchasableNow, totalNodes: branchNodes.length }];
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

  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section style={summaryPanelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={sectionTitleStyle}>Reset</div>
            <div style={{ fontSize: "1.18rem", color: "#f8fafc", fontWeight: 900, marginTop: "6px" }}>
              {prestigeCheck.ok ? `+${formatNumber(echoesOnNext)} ecos` : "Todavia no rinde resetear"}
            </div>
            <div style={{ ...smallCopyStyle, marginTop: "6px", color: "#cbd5e1" }}>
              {prestigeCheck.ok ? "La corrida ya devuelve valor real." : "Segui empujando tier, nivel o un mejor item antes de resetear."}
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: "PRESTIGE" })}
            disabled={!prestigeCheck.ok}
            style={{
              ...actionButtonStyle,
              width: isMobile ? "100%" : "auto",
              minWidth: isMobile ? undefined : "220px",
              background: prestigeCheck.ok ? "#f59e0b" : "#334155",
              color: prestigeCheck.ok ? "#111827" : "#94a3b8",
              cursor: prestigeCheck.ok ? "pointer" : "not-allowed",
            }}
          >
            {prestigeCheck.ok ? "Prestigiar ahora" : "Segui la corrida"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
          {resetBreakdown.length > 0 ? resetBreakdown.map(entry => (
            <span key={entry.id} style={compactChipStyle}>
              {entry.label} +{formatNumber(entry.echoes)}
            </span>
          )) : (
            <span style={{ ...compactChipStyle, color: "#94a3b8" }}>Minimo: Tier 3, Nivel 10 o 50 bajas</span>
          )}
          {recommendedNode && (
            <span style={{ ...compactChipStyle, borderColor: "rgba(99,102,241,0.25)", color: "#c7d2fe" }}>
              Compra util: {recommendedNode.name}
            </span>
          )}
        </div>

        <div style={{ ...smallCopyStyle, marginTop: "10px", color: "#94a3b8" }}>
          Conservas ecos y tablero. Reinicias oro, equipo, talentos y la corrida, y vuelves a elegir clase, spec y sigilo.
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px minmax(0, 1fr)", gap: "10px" }}>
        <div style={summaryPanelStyle}>
          <div style={sectionTitleStyle}>Ecos</div>
          <div style={{ fontSize: "1.08rem", color: "#f8fafc", fontWeight: 900, marginTop: "6px" }}>{formatNumber(prestige.echoes || 0)}</div>
          <div style={subtleStyle}>Disponibles ahora</div>
          <div style={{ ...miniRowStyle, marginTop: "10px" }}>
            <span style={smallCopyStyle}>Gastados</span>
            <strong style={{ color: "#e2e8f0" }}>{formatNumber(prestige.spentEchoes || 0)}</strong>
          </div>
          <div style={miniRowStyle}>
            <span style={smallCopyStyle}>Totales</span>
            <strong style={{ color: "#e2e8f0" }}>{formatNumber(prestige.totalEchoesEarned || 0)}</strong>
          </div>
        </div>

        <div style={summaryPanelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div>
              <div style={sectionTitleStyle}>Bonos Activos</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px" }}>Lectura corta de lo que hoy ya esta pegando en la cuenta.</div>
            </div>
            <div style={summaryBadgeStyle}>{activePrestigeNodes} nodos activos</div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
            {highlightedBonuses.length > 0 ? highlightedBonuses.map(([key, value]) => (
              <div key={key} style={bonusChipStyle}>
                <span style={{ color: "#94a3b8", textTransform: "uppercase", fontWeight: 900 }}>{BONUS_LABELS[key] || key}</span>
                <strong style={{ color: "#f8fafc" }}>{formatBonus(key, value)}</strong>
              </div>
            )) : (
              <div style={{ ...bonusChipStyle, color: "#cbd5e1" }}>Todavia no invertiste ecos. El primer prestigio ya vale la pena por abrir este tablero.</div>
            )}
          </div>
        </div>
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
              return (
                <button
                  key={`branch-tab-${branch.id}`}
                  onClick={() => setActiveBranchId(branch.id)}
                  style={{
                    minWidth: isMobile ? "138px" : "158px",
                    border: "1px solid",
                    borderColor: active ? `${branch.color}88` : "rgba(255,255,255,0.12)",
                    background: active ? `${branch.color}22` : "#0f172a",
                    color: active ? branch.color : "#cbd5e1",
                    borderRadius: "12px",
                    padding: "9px 10px",
                    cursor: "pointer",
                    textAlign: "left",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: "0.66rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>{branch.name}</div>
                  <div style={{ fontSize: "0.56rem", color: active ? "#e2e8f0" : "#94a3b8", marginTop: "4px", fontWeight: 800 }}>
                    {summary.activeNodes}/{summary.totalNodes} nodos · {summary.investedLevels} niveles
                  </div>
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
          <div>
            <div style={{ ...sectionTitleStyle, color: activeBranch.color }}>{activeBranch.name}</div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px", lineHeight: 1.4 }}>{activeBranch.description}</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
              <span style={metaChipStyle}>{branchSummaries[activeBranch.id]?.activeNodes || 0}/{branchSummaries[activeBranch.id]?.totalNodes || activeBranchNodes.length} nodos</span>
              <span style={metaChipStyle}>{branchSummaries[activeBranch.id]?.investedLevels || 0} niveles</span>
              {(branchSummaries[activeBranch.id]?.purchasableNow || 0) > 0 && (
                <span style={{ ...metaChipStyle, borderColor: `${activeBranch.color}55`, color: activeBranch.color }}>
                  {branchSummaries[activeBranch.id]?.purchasableNow || 0} comprables
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
            {activeBranchTierGroups.map(group => (
              <div key={`tier-group-${group.tier}`} style={{ display: "grid", gap: "8px" }}>
                <div style={tierHeaderStyle}>
                  <span>Tier {group.tier}</span>
                  <span>{group.nodes.length} nodo{group.nodes.length === 1 ? "" : "s"}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                  {group.nodes.map(node => {
                    const level = getPrestigeNodeLevel(prestige, node.id);
                    const purchase = canPurchasePrestigeNode(state, node);
                    const tone = getNodeTone(node, player);
                    const currentEffects = Object.entries(node.effectsPerLevel || {}).map(([key, value]) => [key, value * level]);
                    const currentSummary = summarizeEffectEntries(currentEffects, {
                      emptyLabel: "Sin invertir todavia",
                      max: 3,
                    });
                    const requirementNames = (node.requires || []).map(id => PRESTIGE_TREE_NODES.find(candidate => candidate.id === id)?.name || id);

                    return (
                      <div
                        key={node.id}
                        style={nodeCardCompactStyle({
                          active: level > 0,
                          canBuy: purchase.ok,
                          color: activeBranch.color,
                          tone,
                        })}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.76rem", color: "#f8fafc", fontWeight: 900 }}>{node.name}</span>
                              {node.capstone && <span style={{ ...metaChipStyle, borderColor: "#f59e0b55", color: "#f59e0b" }}>Capstone</span>}
                              {node.requiresSpecialization && <span style={{ ...metaChipStyle, borderColor: "#a855f755", color: "#c4b5fd" }}>{node.requiresSpecialization}</span>}
                            </div>
                            <div style={{ ...nodeDescriptionStyle, marginTop: "4px" }}>{node.description}</div>
                          </div>
                          <span style={levelBadgeStyle(level > 0, activeBranch.color)}>{level}/{node.maxLevel}</span>
                        </div>

                        <div style={{ fontSize: "0.64rem", color: "#cbd5e1", fontWeight: 800, marginTop: "10px", lineHeight: 1.4 }}>
                          Actual: <span style={{ color: "#f8fafc" }}>{currentSummary}</span>
                        </div>

                        {requirementNames.length > 0 && (
                          <div style={{ fontSize: "0.6rem", color: purchase.reason === "requires" ? "#fca5a5" : "#94a3b8", marginTop: "6px", lineHeight: 1.35 }}>
                            Req: {requirementNames.join(" · ")}
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                          <span style={nodeStatusPillStyle(purchase.ok, tone, activeBranch.color)}>
                            {level >= node.maxLevel
                              ? "Max"
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
                            disabled={!purchase.ok}
                            style={nodeBuyButtonStyle(activeBranch.color, purchase.ok)}
                          >
                            {level >= node.maxLevel
                              ? "Maximo"
                              : purchase.ok
                                ? `Comprar ${purchase.cost}`
                                : "No disponible"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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

