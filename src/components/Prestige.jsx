import React, { useEffect, useMemo, useState } from "react";
import { PRESTIGE_BRANCHES, PRESTIGE_TREE_NODES } from "../data/prestige";
import {
  calculatePrestigeEchoGain,
  canPrestige,
  canPurchasePrestigeNode,
  getPrestigePreview,
  getPrestigeNodeLevel,
  getPrestigeNodeCost,
  getPrestigeRank,
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
  "cooldownReduction",
  "skillPower",
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
  lifesteal: "Lifesteal",
  dodgeChance: "Evasion",
  blockChance: "Bloqueo",
  critDamage: "Crit Dmg",
  critOnLowHp: "Crit vida baja",
  damageOnKill: "Dano por kill",
  thorns: "Espinas",
  essenceBonus: "Esencia",
  lootBonus: "Loot",
  luck: "Suerte",
  cooldownReduction: "CDR",
  skillPower: "Poder skill",
  sellValueBonus: "Venta",
  upgradeCostReduction: "Costo upgrade",
  rerollCostReduction: "Costo reroll",
  polishCostReduction: "Costo polish",
  reforgeCostReduction: "Costo reforge",
  ascendCostReduction: "Costo ascend",
  ascendImprintCostReduction: "Ascend con poder",
  reforgeOptionCount: "Opciones Reforge",
  discoveredPowerBias: "Caza de powers",
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

function getNodeTone(node, player) {
  if (node.requiresSpecialization && player.specialization !== node.requiresSpecialization) return "lockedClass";
  if (node.requiresClass && player.class !== node.requiresClass) return "lockedClass";
  if (node.capstone) return "capstone";
  return "normal";
}

export default function Prestige({ state, dispatch }) {
  const { player, prestige, combat } = state;
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [activeBranchId, setActiveBranchId] = useState(PRESTIGE_BRANCHES[0]?.id || null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const currentRank = getPrestigeRank(prestige.level);
  const prestigeCheck = canPrestige(state);
  const nextRank = prestigeCheck.nextRank;
  const echoesOnNext = calculatePrestigeEchoGain(state);
  const prestigePreview = prestigeCheck.preview || getPrestigePreview(state);
  const analytics = combat.analytics || {};
  const cycle = combat.prestigeCycle || prestigePreview.progress || {};
  const bonusRows = getPrestigeBonusRows(prestige, player)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 8);
  const activePrestigeNodes = Object.keys(prestige.nodes || {}).filter(key => (prestige.nodes?.[key] || 0) > 0).length;
  const purchasableNodes = PRESTIGE_TREE_NODES.filter(node => canPurchasePrestigeNode(state, node).ok);
  const recommendedNode = purchasableNodes[0] || null;
  const nextNodeTarget = useMemo(() => {
    return PRESTIGE_TREE_NODES
      .filter(node => getNodeTone(node, player) !== "lockedClass")
      .map(node => ({
        node,
        level: getPrestigeNodeLevel(prestige, node.id),
        cost: getPrestigeNodeCost(prestige, node),
      }))
      .filter(entry => entry.cost != null && entry.level < (entry.node.maxLevel || 1))
      .sort((a, b) => (a.cost || Number.MAX_SAFE_INTEGER) - (b.cost || Number.MAX_SAFE_INTEGER))[0] || null;
  }, [player, prestige]);
  const runMomentumTiles = [
    { label: "Tier ciclo", value: formatNumber(cycle.maxTier || combat.maxTier || 1) },
    { label: "Nivel ciclo", value: formatNumber(cycle.maxLevel || player.level || 1) },
    { label: "Kills ciclo", value: formatNumber(cycle.kills || 0) },
    { label: "Mejor item", value: formatNumber(cycle.bestItemRating || 0) },
    { label: "Muertes", value: formatNumber(analytics.deaths || 0) },
    { label: "Ventanas push", value: formatNumber(analytics.couldAdvanceMoments || 0) },
    { label: "Ascensos", value: formatNumber(prestige.level || 0) },
  ];
  const visibleBranches = isMobile
    ? PRESTIGE_BRANCHES.filter(branch => branch.id === (activeBranchId || PRESTIGE_BRANCHES[0]?.id))
    : PRESTIGE_BRANCHES;
  const branchSummaries = useMemo(() => Object.fromEntries(
    PRESTIGE_BRANCHES.map(branch => {
      const branchNodes = PRESTIGE_TREE_NODES.filter(node => node.branch === branch.id);
      const activeNodes = branchNodes.filter(node => (prestige.nodes?.[node.id] || 0) > 0).length;
      const investedLevels = branchNodes.reduce((total, node) => total + (prestige.nodes?.[node.id] || 0), 0);
      const purchasableNow = branchNodes.filter(node => canPurchasePrestigeNode(state, node).ok).length;
      return [branch.id, { activeNodes, investedLevels, purchasableNow, totalNodes: branchNodes.length }];
    })
  ), [prestige.nodes, state]);

  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
        <Panel title="Prestigio" accent="#f59e0b">
          <div style={valueStyle}>{currentRank?.name || "Sin ascender"}</div>
          <div style={subtleStyle}>Prestige {prestige.level}</div>
          <div style={{ ...smallCopyStyle, marginTop: "8px" }}>{currentRank?.description || "Todavia no dejaste un eco persistente en el mundo."}</div>
          <div style={{ ...miniRowStyle, marginTop: "10px" }}>
            <span style={smallCopyStyle}>Nodos activos</span>
            <strong style={{ color: "#e2e8f0" }}>{formatNumber(activePrestigeNodes)}</strong>
          </div>
          {nextRank && (
            <div style={{ ...smallCopyStyle, marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              Proximo hito: Prestige {nextRank.level} · {nextRank.name}
              {nextRank.focus ? ` · ${nextRank.focus}` : ""}
            </div>
          )}
        </Panel>

        <Panel title="Ecos" accent="#4338ca">
          <div style={valueStyle}>{formatNumber(prestige.echoes || 0)}</div>
          <div style={subtleStyle}>Disponibles ahora</div>
          <div style={{ ...miniRowStyle, marginTop: "10px" }}>
            <span style={smallCopyStyle}>Gastados</span>
            <strong style={{ color: "#e2e8f0" }}>{formatNumber(prestige.spentEchoes || 0)}</strong>
          </div>
          <div style={miniRowStyle}>
            <span style={smallCopyStyle}>Totales</span>
            <strong style={{ color: "#e2e8f0" }}>{formatNumber(prestige.totalEchoesEarned || 0)}</strong>
          </div>
        </Panel>

        <Panel title="Ascension" accent="#b91c1c">
          <div style={valueStyle}>{prestigeCheck.ok ? `+${formatNumber(echoesOnNext)} ecos` : "Aun sin eco"}</div>
          <div style={subtleStyle}>{prestigeCheck.ok ? "Prestigio rapido disponible" : "Segui empujando la corrida"}</div>
          <div style={{ ...smallCopyStyle, marginTop: "8px" }}>
            El prestigio ya no pide oro ni nivel fijos. Cobra ecos por Tier maximo, Nivel maximo y mejor loot del ciclo actual.
          </div>
          <div style={{ ...smallCopyStyle, marginTop: "8px", color: "#94a3b8" }}>
            {prestigePreview.breakdown
              .filter(entry => (entry.echoes || 0) > 0)
              .map(entry => `${entry.label} +${formatNumber(entry.echoes)}`)
              .join(" · ") || "Necesitas una corrida minima: Tier 3, Nivel 10 o 50 kills."}
          </div>
          {(recommendedNode || nextNodeTarget) && (
            <div style={{ ...smallCopyStyle, marginTop: "8px", color: "#cbd5e1" }}>
              {recommendedNode
                ? `Compra visible ya: ${recommendedNode.name} · ${canPurchasePrestigeNode(state, recommendedNode).cost} ecos.`
                : `Primer objetivo claro: ${nextNodeTarget.node.name} · ${nextNodeTarget.cost} ecos.`}
            </div>
          )}
          <button
            onClick={() => dispatch({ type: "PRESTIGE" })}
            disabled={!prestigeCheck.ok}
            style={{
              ...actionButtonStyle,
              marginTop: "12px",
              background: prestigeCheck.ok ? "#f59e0b" : "#334155",
              color: prestigeCheck.ok ? "#111827" : "#94a3b8",
              cursor: prestigeCheck.ok ? "pointer" : "not-allowed",
            }}
          >
            {prestigeCheck.ok ? "Prestigiar ahora" : "Todavia no rinde resetear"}
          </button>
          <div style={{ ...smallCopyStyle, marginTop: "8px", color: "#94a3b8" }}>
            Conservas clase, spec, ecos y reliquias. Reinicias oro, equipo, talentos y la corrida actual.
          </div>
        </Panel>
      </section>

      <section style={summaryPanelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div>
            <div style={sectionTitleStyle}>Huella del Arbol</div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px" }}>Estos son los bonuses persistentes mas pesados que tu arbol esta aportando a la build actual.</div>
          </div>
          <div style={summaryBadgeStyle}>{activePrestigeNodes} nodos activos</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginTop: "12px" }}>
          {bonusRows.length > 0 ? bonusRows.map(([key, value]) => (
            <div key={key} style={bonusTileStyle}>
              <div style={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 900 }}>{BONUS_LABELS[key] || key}</div>
              <div style={{ fontSize: "1rem", color: "#f8fafc", fontWeight: 900, marginTop: "4px" }}>{formatBonus(key, value)}</div>
            </div>
          )) : (
            <div style={{ ...bonusTileStyle, gridColumn: "1 / -1" }}>Todavia no invertiste ecos. La primera ascension ya vale la pena apenas por abrir este tablero.</div>
          )}
        </div>
      </section>

      {isMobile && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "6px" }}>
          {PRESTIGE_BRANCHES.map(branch => {
            const active = (activeBranchId || PRESTIGE_BRANCHES[0]?.id) === branch.id;
            return (
              <button
                key={`branch-tab-${branch.id}`}
                onClick={() => setActiveBranchId(branch.id)}
                style={{
                  border: "1px solid",
                  borderColor: active ? `${branch.color}88` : "rgba(255,255,255,0.12)",
                  background: active ? `${branch.color}22` : "#0f172a",
                  color: active ? branch.color : "#94a3b8",
                  borderRadius: "10px",
                  padding: "8px 6px",
                  fontSize: "0.6rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {branch.name}
              </button>
            );
          })}
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
        {visibleBranches.map(branch => {
          const nodes = PRESTIGE_TREE_NODES.filter(node => node.branch === branch.id).sort((a, b) => a.tier - b.tier);
          const summary = branchSummaries[branch.id] || { activeNodes: 0, investedLevels: 0, purchasableNow: 0, totalNodes: nodes.length };
          return (
            <div key={branch.id} style={{ background: "#0f172a", border: `1px solid ${branch.color}55`, borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ ...sectionTitleStyle, color: branch.color }}>{branch.name}</div>
                <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "4px" }}>{branch.description}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                  <span style={metaChipStyle}>{summary.activeNodes}/{summary.totalNodes} nodos</span>
                  <span style={metaChipStyle}>{summary.investedLevels} niveles</span>
                  {summary.purchasableNow > 0 && <span style={{ ...metaChipStyle, borderColor: `${branch.color}55`, color: branch.color }}>{summary.purchasableNow} comprables</span>}
                </div>
              </div>

              {nodes.map(node => {
                const level = getPrestigeNodeLevel(prestige, node.id);
                const purchase = canPurchasePrestigeNode(state, node);
                const cost = purchase.cost;
                const tone = getNodeTone(node, player);
                return (
                  <div key={node.id} style={nodeCardStyle(tone, branch.color, level > 0)}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#f8fafc", fontWeight: 900 }}>{node.name}</div>
                        <div style={{ fontSize: "0.66rem", color: "#94a3b8", marginTop: "3px" }}>{node.description}</div>
                      </div>
                      <span style={levelBadgeStyle(level > 0, branch.color)}>{level}/{node.maxLevel}</span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      <span style={metaChipStyle}>Tier {node.tier}</span>
                      {node.capstone && <span style={{ ...metaChipStyle, borderColor: "#f59e0b55", color: "#f59e0b" }}>Capstone</span>}
                      {node.requiresSpecialization && <span style={{ ...metaChipStyle, borderColor: "#a855f755", color: "#c4b5fd" }}>{node.requiresSpecialization}</span>}
                    </div>

                    {node.requires?.length > 0 && (
                      <div style={{ fontSize: "0.62rem", color: "#94a3b8", marginTop: "8px" }}>
                        Requiere: {node.requires.map(id => PRESTIGE_TREE_NODES.find(candidate => candidate.id === id)?.name || id).join(" · ")}
                      </div>
                    )}

                    <button
                      onClick={() => dispatch({ type: "BUY_PRESTIGE_NODE", nodeId: node.id })}
                      disabled={!purchase.ok}
                      style={{
                        ...actionButtonStyle,
                        marginTop: "10px",
                        background: purchase.ok ? branch.color : "#1e293b",
                        color: purchase.ok ? "#fff" : "#64748b",
                        cursor: purchase.ok ? "pointer" : "not-allowed",
                      }}
                    >
                      {level >= node.maxLevel ? "Maxeado" : cost == null ? "Bloqueado" : purchase.reason === "class" ? "Requiere tu build actual" : `Invertir ${cost} ecos`}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      <section style={summaryPanelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div>
            <div style={sectionTitleStyle}>Impulso de Corrida</div>
            <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "4px" }}>Solo señales utiles para decidir si conviene seguir empujando o ascender ahora.</div>
          </div>
          <div style={summaryBadgeStyle}>+{formatNumber(echoesOnNext)} ecos si ascendieras</div>
        </div>
        {recommendedNode && (
          <div style={{ ...smallCopyStyle, marginTop: "10px", color: "#cbd5e1" }}>
            Recomendado ahora: <strong style={{ color: "#f8fafc" }}>{recommendedNode.name}</strong> · primer nodo comprable del tablero activo.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "12px" }}>
          {runMomentumTiles.map(tile => <RunTile key={tile.label} label={tile.label} value={tile.value} />)}
        </div>
      </section>
    </div>
  );
}

function Panel({ title, accent, children }) {
  return (
    <div style={{ background: "#0f172a", border: `1px solid ${accent}55`, borderRadius: "18px", padding: "14px" }}>
      <div style={{ ...sectionTitleStyle, color: accent }}>{title}</div>
      <div style={{ marginTop: "10px" }}>{children}</div>
    </div>
  );
}

function RunTile({ label, value }) {
  return (
    <div style={bonusTileStyle}>
      <div style={{ fontSize: "0.63rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 900 }}>{label}</div>
      <div style={{ fontSize: "1rem", color: "#f8fafc", fontWeight: 900, marginTop: "4px" }}>{value}</div>
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

const bonusTileStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "10px 12px",
  color: "#e2e8f0",
};

const nodeCardStyle = (tone, color, active) => ({
  background: active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
  border: `1px solid ${tone === "capstone" ? "#f59e0b55" : tone === "lockedClass" ? "#334155" : `${color}40`}`,
  borderRadius: "14px",
  padding: "10px",
  opacity: tone === "lockedClass" ? 0.72 : 1,
});

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

