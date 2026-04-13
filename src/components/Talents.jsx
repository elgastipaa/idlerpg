import React, { useEffect, useMemo, useRef, useState } from "react";
import { TALENTS } from "../data/talents";
import { getNodesForTree } from "../data/talentNodes";
import {
  CROSS_SPEC_UNLOCK_LEVEL,
  OFF_SPEC_COST_MULTIPLIER,
  getTalentTreesForPlayer,
} from "../engine/talents/treeEngine";
import {
  canUnlockNode,
  getNextTalentForNode,
  getNodeLevel,
  getNodeMaxLevel,
  getNodeTreeSpendRequirement,
  getNodeUpgradeCost,
} from "../engine/talents/talentTreeEngine";

const TYPE_COLORS = {
  aura: "var(--tone-accent, #534AB7)",
  triggered: "var(--tone-warning, #f59e0b)",
  passive: "var(--tone-success, #1D9E75)",
  stacking: "var(--tone-info, #2563eb)",
};

const TREE_COLORS = {
  warrior_general: "var(--tone-neutral-strong, #1e293b)",
  berserker: "var(--tone-danger, #D85A30)",
  juggernaut: "var(--tone-accent, #534AB7)",
  berserker_tree: "var(--tone-danger, #D85A30)",
  juggernaut_tree: "var(--tone-accent, #534AB7)",
};

const TALENT_STAT_LABELS = {
  damage: "dano",
  defense: "defensa",
  critChance: "crit chance",
  attackSpeed: "velocidad de ataque",
  lifesteal: "lifesteal",
  regen: "regen",
  xpBonus: "XP",
  goldBonus: "oro adicional",
  enemyDamageTaken: "dano recibido",
  heal: "curacion",
};

const TALENT_PERCENT_FLAT_STATS = new Set(["critChance", "attackSpeed", "lifesteal"]);

function formatTalentNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return String(value ?? 0);
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function pluralizeTicks(value) {
  return `${value} tick${value === 1 ? "" : "s"}`;
}

function formatTalentBonus(effect = {}, { forcePercent = false, allowMultiplierX = false } = {}) {
  if (effect.flat != null) {
    if (forcePercent || TALENT_PERCENT_FLAT_STATS.has(effect.stat)) {
      return `+${formatTalentNumber(effect.flat * 100)}%`;
    }
    return `+${formatTalentNumber(effect.flat)}`;
  }

  if (effect.multiplier != null) {
    if (allowMultiplierX && effect.multiplier >= 2) {
      return `x${formatTalentNumber(effect.multiplier)}`;
    }
    return `+${formatTalentNumber((effect.multiplier - 1) * 100)}%`;
  }

  return "+0";
}

function buildTalentDescription(talent) {
  if (!talent?.effect || !talent?.trigger) return talent?.description || "";

  const effect = talent.effect || {};
  const trigger = talent.trigger || {};
  const statLabel = TALENT_STAT_LABELS[effect.stat] || effect.stat || "bonus";
  const stackText =
    effect.maxStacks && effect.maxStacks > 1
      ? ` (max ${effect.maxStacks} stacks)`
      : "";
  const durationText =
    effect.duration == null
      ? ""
      : ` por ${pluralizeTicks(effect.duration)}`;

  if (trigger.stat === "always") {
    if (effect.stat === "regen") {
      return `Regeneras ${formatTalentBonus(effect)} HP extra por tick.`;
    }
    if (effect.stat === "goldBonus") {
      return `Ganas ${formatTalentBonus(effect)} oro adicional por kill.`;
    }
    return `Ganas ${formatTalentBonus(effect, { forcePercent: effect.stat === "xpBonus" })} ${statLabel} de forma pasiva.`;
  }

  if (trigger.stat === "kills") {
    if (effect.stat === "damage") {
      return `Cada ${formatTalentNumber(trigger.every || 1)} kills, tu proximo ataque inflige ${formatTalentBonus(effect, { allowMultiplierX: true })} dano.`;
    }
    return `Cada ${formatTalentNumber(trigger.every || 1)} kills, ganas ${formatTalentBonus(effect)} ${statLabel}${durationText}${stackText}.`;
  }

  if (trigger.stat === "crit") {
    if (effect.stat === "heal") {
      return `Al hacer critico, recuperas ${formatTalentBonus(effect)} HP.`;
    }
    if (effect.stat === "enemyDamageTaken") {
      return `Tus criticos hacen que el enemigo reciba ${formatTalentBonus(effect)} dano por ${pluralizeTicks(effect.duration || 1)}.`;
    }
    return `Al hacer critico, ganas ${formatTalentBonus(effect)} ${statLabel}${durationText}${stackText}.`;
  }

  if (trigger.stat === "onDamageTaken") {
    if (effect.stat === "heal") {
      return `Al recibir dano, curas ${formatTalentBonus(effect)} HP.`;
    }
    return `${effect.stackable && effect.maxStacks > 1 ? "Al recibir dano, acumulas" : "Al recibir dano, ganas"} ${formatTalentBonus(effect)} ${statLabel}${effect.stackable && effect.maxStacks > 1 ? " por stack" : ""}${effect.duration == null ? "" : ` durante ${pluralizeTicks(effect.duration)}`}${stackText}.`;
  }

  if (trigger.stat === "onKill") {
    if (effect.stat === "goldBonus") {
      return `Cada kill entrega ${formatTalentBonus(effect)} oro adicional.`;
    }
    if (effect.stackable && effect.maxStacks > 1 && effect.duration == null) {
      return `Cada kill acumula ${formatTalentBonus(effect)} ${statLabel} por stack hasta morir${stackText}.`;
    }
    return `${effect.stackable && effect.maxStacks > 1 ? "Al matar, acumulas" : "Al matar, ganas"} ${formatTalentBonus(effect)} ${statLabel}${effect.stackable && effect.maxStacks > 1 ? " por stack" : ""}${effect.duration == null ? "" : ` durante ${pluralizeTicks(effect.duration)}`}${stackText}.`;
  }

  if (trigger.stat === "onHit") {
    return `${effect.stackable && effect.maxStacks > 1 ? "Cada golpe acumula" : "Cada golpe otorga"} ${formatTalentBonus(effect, { allowMultiplierX: effect.stat === "damage" && (effect.multiplier || 0) >= 2 })} ${statLabel}${effect.stackable && effect.maxStacks > 1 ? " por stack" : ""}${effect.duration == null ? "" : ` durante ${pluralizeTicks(effect.duration)}`}${stackText}.`;
  }

  return talent.description || "";
}

function getDisplayedNodes(tree) {
  return getNodesForTree(tree.id)
    .map(node => {
      const levelTalents = (node.levels || [])
        .map(levelTalentId => TALENTS.find(item => item.id === levelTalentId) || null)
        .filter(Boolean);
      const talent = levelTalents[0] || null;
      if (!talent) return null;

      const upgrade = levelTalents[1] || null;

      return {
        ...node,
        talent,
        upgrade,
        levelTalents,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.x - b.x || a.y - b.y);
}

function getNodeState({ state, node }) {
  const currentLevel = getNodeLevel(state, node.talent.id);
  const maxLevel = getNodeMaxLevel(node.talent.id);
  const isBaseUnlocked = currentLevel >= 1;
  const isMaxed = currentLevel >= maxLevel;
  const levelTalents = node.levelTalents || [node.talent];
  const activeTalent =
    (currentLevel > 0 && levelTalents[currentLevel - 1])
      ? levelTalents[currentLevel - 1]
      : node.talent;
  const nextTalent = getNextTalentForNode(state, node.talent.id);
  const nextCost = getNodeUpgradeCost(state, node.talent.id);
  const canUnlockNext = canUnlockNode(state, node.talent.id);
  const prereqIds = node.prereqs || [];
  const mode = node.prereqMode === "any" ? "any" : "all";
  const metCount = prereqIds.filter(prereqId => getNodeLevel(state, prereqId) >= 1).length;
  const requiredCount = mode === "any" && prereqIds.length > 0 ? 1 : prereqIds.length;
  const prereqsMet = metCount >= requiredCount;
  const treeSpendGate = getNodeTreeSpendRequirement(state, node.talent.id);
  const allRequirementsMet = prereqsMet && treeSpendGate.met;

  return {
    currentLevel,
    maxLevel,
    isBaseUnlocked,
    isMaxed,
    activeTalent,
    nextTalent,
    nextCost,
    canUnlockNext,
    prereqsMet,
    allRequirementsMet,
    prereqInfo: {
      mode,
      metCount,
      totalCount: prereqIds.length,
      requiredCount,
    },
    treeSpendGate,
    tierLabel: currentLevel <= 0 ? "Bloqueado" : `Nivel ${currentLevel}/${maxLevel}`,
  };
}

function getTreeProgress(state, nodes) {
  return nodes.filter(node => getNodeLevel(state, node.talent.id) >= 1).length;
}

function getBaseTalentId(talentId) {
  const talent = TALENTS.find(item => item.id === talentId);
  if (!talent) return talentId;
  if (!talent.replaces) return talent.id;
  return Array.isArray(talent.replaces) ? talent.replaces[0] : talent.replaces;
}

function getNodeTitle(node) {
  return (node?.talent?.name || "").replace(" II", "");
}

function getGroupedColumns(nodes = []) {
  const getStageForNode = node => {
    const column = Number(node?.x || 0);
    return Math.min(6, column + 1);
  };

  const grouped = new Map();
  for (const node of nodes) {
    const key = getStageForNode(node);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(node);
  }

  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([stage, stageNodes]) => ({
      stage,
      nodes: [...stageNodes].sort((a, b) => (a.x || 0) - (b.x || 0) || (a.y || 0) - (b.y || 0)),
    }));
}

function buildNodeRequirementText(node, nodes, nodeState) {
  const parts = [];
  const prereqNames = (node.prereqs || [])
    .map(prereqId => nodes.find(candidate => candidate.id === getBaseTalentId(prereqId)))
    .filter(Boolean)
    .map(getNodeTitle);

  if (prereqNames.length > 0) {
    parts.push(`Requiere desbloquear: ${prereqNames.join(node.prereqMode === "any" ? " o " : " + ")}`);
  }

  if (!nodeState.treeSpendGate.met && nodeState.treeSpendGate.required > 0) {
    parts.push(`Gasta ${nodeState.treeSpendGate.remaining} TP mas en el arbol`);
  }

  return parts.join(" · ");
}

function getNodeActionLabel(nodeState, compact = false) {
  if (nodeState.isMaxed || !nodeState.nextTalent) return "MAX";
  if (!nodeState.isBaseUnlocked) return compact ? `+${nodeState.nextCost || 0}` : `DESB. +${nodeState.nextCost || 0} TP`;
  if (nodeState.maxLevel > 2 && !compact) return `NIV ${Math.min(nodeState.maxLevel, nodeState.currentLevel + 1)} · +${nodeState.nextCost || 0} TP`;
  return `+${nodeState.nextCost || 0}${compact ? "" : " TP"}`;
}

function TalentNodeCard({ node, nodeState, isMobile, justUnlocked, dispatch, prereqText = "" }) {
  const typeColor = TYPE_COLORS[nodeState.activeTalent.type] || "var(--color-text-secondary, #64748b)";
  const isUnlocked = nodeState.currentLevel > 0;
  const canUpgrade = nodeState.canUnlockNext && !!nodeState.nextTalent;
  const isTier2Unlocked = nodeState.currentLevel >= 2;

  return (
    <div
      style={{
        background: "var(--color-background-secondary, #fff)",
        border: `1px solid ${justUnlocked ? "var(--tone-success, #22c55e)" : isUnlocked ? "var(--tone-success, #1D9E75)" : nodeState.allRequirementsMet ? "var(--color-border-primary, #e2e8f0)" : "var(--tone-danger, #fecaca)"}`,
        borderRadius: "14px",
        padding: isMobile ? "9px" : "10px",
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        minWidth: 0,
        boxShadow: justUnlocked ? "0 0 0 2px rgba(34,197,94,0.45), 0 0 22px rgba(34,197,94,0.35), 0 12px 24px rgba(29,158,117,0.24)" : "none",
        transform: justUnlocked ? "scale(1.01)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? "0.74rem" : "0.84rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.15 }}>
            {node.talent.name.replace(" II", "")}
          </div>
          <div style={{ fontSize: isMobile ? "0.58rem" : "0.63rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "3px" }}>{nodeState.tierLabel}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {canUpgrade && <div style={miniPillStyle("var(--tone-success-strong, #166534)", "var(--tone-success-soft, #ecfdf5)")}>Disponible</div>}
          <div style={badgeStyle(typeColor)}>{nodeState.activeTalent.type.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ fontSize: isMobile ? "0.68rem" : "0.74rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.35 }}>
        {buildTalentDescription(nodeState.activeTalent || node.talent)}
      </div>

      {nodeState.maxLevel > 2 ? (
        <div style={{ ...upgradeHintStyle, borderColor: nodeState.isMaxed ? "var(--tone-success, #86efac)" : "var(--color-border-primary, #e2e8f0)", background: nodeState.isMaxed ? "var(--tone-success-soft, rgba(34,197,94,0.08))" : "var(--color-background-tertiary, #f8fafc)" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: "900", color: nodeState.isMaxed ? "var(--tone-success-strong, #15803d)" : "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", marginBottom: "4px" }}>
            Escalado {nodeState.currentLevel}/{nodeState.maxLevel}
          </div>
          <div style={{ fontSize: isMobile ? "0.66rem" : "0.72rem", color: nodeState.isMaxed ? "var(--tone-success-strong, #166534)" : "var(--color-text-secondary, #475569)", lineHeight: 1.3 }}>
            {nodeState.isMaxed ? "Nodo maxeado." : buildTalentDescription(nodeState.nextTalent) || "Subi de nivel para mejorar este nodo."}
          </div>
        </div>
      ) : node.upgrade ? (
        <div style={{ ...upgradeHintStyle, borderColor: isTier2Unlocked ? "var(--tone-success, #86efac)" : "var(--color-border-primary, #e2e8f0)", background: isTier2Unlocked ? "var(--tone-success-soft, rgba(34,197,94,0.08))" : "var(--color-background-tertiary, #f8fafc)" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: "900", color: isTier2Unlocked ? "var(--tone-success-strong, #15803d)" : "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", marginBottom: "4px" }}>
            {isTier2Unlocked ? "Nivel II Activo" : "Nivel II"}
          </div>
          <div style={{ fontSize: isMobile ? "0.66rem" : "0.72rem", color: isTier2Unlocked ? "var(--tone-success-strong, #166534)" : "var(--color-text-secondary, #475569)", lineHeight: 1.3 }}>{buildTalentDescription(node.upgrade)}</div>
        </div>
      ) : null}

      {prereqText && (
        <div style={{ fontSize: "0.6rem", fontWeight: "800", color: nodeState.allRequirementsMet ? "var(--color-text-tertiary, #94a3b8)" : "var(--tone-danger, #D85A30)" }}>
          {prereqText}
        </div>
      )}

      <button
        onClick={() => dispatch({ type: "UPGRADE_TALENT_NODE", nodeId: node.talent.id })}
        disabled={!canUpgrade}
        style={treeButtonStyle(nodeState.isMaxed, canUpgrade)}
      >
        {getNodeActionLabel(nodeState)}
      </button>
    </div>
  );
}

function MobileTalentNodeRow({ node, nodeState, justUnlocked, dispatch, prereqText }) {
  const typeColor = TYPE_COLORS[nodeState.activeTalent.type] || "var(--color-text-secondary, #64748b)";
  const isUnlocked = nodeState.currentLevel > 0;
  const canUpgrade = nodeState.canUnlockNext && !!nodeState.nextTalent;
  const compactButtonLabel = getNodeActionLabel(nodeState, true);

  return (
    <article
      style={{
        background: "var(--color-background-secondary, #fff)",
        border: `1px solid ${justUnlocked ? "var(--tone-success, #22c55e)" : isUnlocked ? "var(--tone-success, #1D9E75)" : nodeState.allRequirementsMet ? "var(--color-border-primary, #e2e8f0)" : "var(--tone-danger, #fecaca)"}`,
        borderRadius: "11px",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        minWidth: 0,
        boxShadow: justUnlocked ? "0 0 0 2px rgba(34,197,94,0.42), 0 0 18px rgba(34,197,94,0.25)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "7px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "0.69rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.15 }}>
            {getNodeTitle(node)}
          </div>
          <div style={{ fontSize: "0.55rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", marginTop: "2px" }}>{nodeState.tierLabel}</div>
        </div>
        <button
          onClick={() => dispatch({ type: "UPGRADE_TALENT_NODE", nodeId: node.talent.id })}
          disabled={!canUpgrade}
          style={treeButtonStyle(nodeState.isMaxed, canUpgrade, true)}
        >
          {compactButtonLabel}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
        <div style={badgeStyle(typeColor)}>{nodeState.activeTalent.type.toUpperCase()}</div>
        {canUpgrade && (
          <div style={miniPillStyle("var(--tone-success-strong, #166534)", "var(--tone-success-soft, #ecfdf5)")}>
            Disponible
          </div>
        )}
        {nodeState.maxLevel > 2 ? (
          <div style={miniPillStyle("var(--tone-accent, #4338ca)", "var(--tone-accent-soft, #eef2ff)")}>
            LV {nodeState.currentLevel}/{nodeState.maxLevel}
          </div>
        ) : node.upgrade ? (
          <div style={miniPillStyle(nodeState.currentLevel >= 2 ? "var(--tone-success-strong, #166534)" : "var(--color-text-secondary, #64748b)", nodeState.currentLevel >= 2 ? "var(--tone-success-soft, #dcfce7)" : "var(--color-background-tertiary, #e2e8f0)")}>
            {nodeState.currentLevel >= 2 ? "T2 ON" : "T2"}
          </div>
        ) : null}
      </div>

      <div
        style={{
          fontSize: "0.62rem",
          color: "var(--color-text-secondary, #475569)",
          lineHeight: 1.28,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {buildTalentDescription(nodeState.activeTalent || node.talent)}
      </div>

      {prereqText && (
        <div style={{ fontSize: "0.55rem", color: nodeState.allRequirementsMet ? "var(--color-text-tertiary, #94a3b8)" : "var(--tone-danger, #D85A30)", fontWeight: "800" }}>
          {prereqText}
        </div>
      )}
    </article>
  );
}

export default function Talents({ state, dispatch }) {
  const { player } = state;
  const {
    class: playerClass,
    specialization: playerSpec,
    unlockedTalents = [],
    talentLevels = {},
    talentPoints = 0,
  } = player;
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [recentUnlocks, setRecentUnlocks] = useState({});
  const trackedUnlocksRef = useRef(unlockedTalents || []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const previous = new Set(trackedUnlocksRef.current || []);
    const nextUnlocks = {};
    (unlockedTalents || []).forEach(id => {
      if (!previous.has(id)) nextUnlocks[id] = true;
    });
    trackedUnlocksRef.current = unlockedTalents || [];
    if (Object.keys(nextUnlocks).length === 0) return undefined;
    setRecentUnlocks(current => ({ ...current, ...nextUnlocks }));
    const timer = setTimeout(() => setRecentUnlocks({}), 950);
    return () => clearTimeout(timer);
  }, [unlockedTalents]);

  const playerLevel = player.level || 1;
  const treesByProgression = getTalentTreesForPlayer({ playerClass, playerSpec, playerLevel });

  useEffect(() => {
    if (!treesByProgression.length) return;
    if (!selectedTreeId || !treesByProgression.some(tree => tree.id === selectedTreeId)) {
      setSelectedTreeId(treesByProgression[0].id);
    }
  }, [treesByProgression, selectedTreeId]);

  const treeData = useMemo(() => {
    return treesByProgression.map(tree => {
      const nodes = getDisplayedNodes(tree);
      const progress = getTreeProgress(state, nodes);
      return { tree, nodes, progress };
    });
  }, [treesByProgression, state]);
  const offSpecTreeCount = treeData.filter(item => item.tree.isOffSpec).length;

  if (!playerClass) {
    return (
      <div style={emptyContainerStyle}>
        <h2 style={{ color: "var(--color-text-tertiary, #9ca3af)", fontWeight: "900" }}>CLASE REQUERIDA</h2>
        <p style={{ color: "var(--color-text-tertiary, #9ca3af)", fontSize: "0.9rem" }}>Elegi una clase para ver tus talentos disponibles.</p>
      </div>
    );
  }

  const selectedTree = treeData.find(item => item.tree.id === selectedTreeId) || treeData[0];
  const visibleTrees = selectedTree ? [selectedTree] : [];
  const selectedTreeBuyableNodes = useMemo(
    () => (selectedTree?.nodes || []).filter(node => canUnlockNode(state, node.talent.id)),
    [selectedTree, state]
  );
  const totalBuyableNodes = useMemo(
    () => treeData.reduce((total, item) => total + item.nodes.filter(node => canUnlockNode(state, node.talent.id)).length, 0),
    [treeData, state]
  );
  const treeHeaderStickyTop = treeData.length > 1
    ? (isMobile ? 154 : 142)
    : (isMobile ? 92 : 80);

  return (
    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "15px", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", minHeight: "100%" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 28, display: "flex", flexDirection: "column", gap: "10px", background: "var(--color-background-primary, #f8fafc)", paddingBottom: "4px" }}>
        <header style={headerStyle}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase" }}>Arbol de Talentos</div>
            <div style={{ fontSize: "1rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{playerClass.toUpperCase()} {playerSpec && `- ${playerSpec.toUpperCase()}`}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: "900", color: "var(--tone-success, #1D9E75)" }}>{talentPoints} TP</div>
            <div style={{ fontSize: "0.65rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>{Object.values(talentLevels || {}).filter(value => Number(value) > 0).length || unlockedTalents.length} nodos comprados</div>
            <div style={{ fontSize: "0.58rem", color: totalBuyableNodes > 0 ? "var(--tone-accent, #4338ca)" : "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", marginTop: "4px" }}>
              {totalBuyableNodes > 0 ? `${totalBuyableNodes} nodos comprables ahora` : "Sin compras disponibles ahora"}
            </div>
            <div style={{ fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", marginTop: "4px", lineHeight: 1.25 }}>
              {playerLevel >= CROSS_SPEC_UNLOCK_LEVEL
                ? offSpecTreeCount > 0
                  ? `Arbol secundario activo · costo x${OFF_SPEC_COST_MULTIPLIER} TP`
                  : "Arbol secundario activo"
                : `Arbol secundario al nivel ${CROSS_SPEC_UNLOCK_LEVEL}`}
            </div>
            {unlockedTalents.length > 0 && (
              <button
                onClick={() => dispatch({ type: "RESET_TALENT_TREE" })}
                style={{ marginTop: "8px", border: "1px solid var(--tone-danger, #fecaca)", background: "var(--tone-danger-soft, #fff1f2)", color: "var(--tone-danger-strong, #be123c)", borderRadius: "10px", padding: "7px 10px", fontSize: "0.64rem", fontWeight: "900", cursor: "pointer" }}
              >
                Resetear Arbol
              </button>
            )}
          </div>
        </header>

        {treeData.length > 1 && (
          <section style={tabsWrapStyle}>
            {treeData.map(({ tree, progress, nodes }) => {
              const active = tree.id === selectedTreeId;
              return (
                <button
                  key={tree.id}
                  onClick={() => setSelectedTreeId(tree.id)}
                  style={{
                    ...tabStyle,
                    background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #fff)",
                    color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #475569)",
                    borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #e2e8f0)",
                  }}
                >
                  <span style={{ fontWeight: "900" }}>{tree.name}</span>
                  {tree.isOffSpec && (
                    <span style={{ fontSize: "0.54rem", fontWeight: "900", color: "var(--tone-warning, #b45309)" }}>
                      Secundario x{OFF_SPEC_COST_MULTIPLIER}
                    </span>
                  )}
                  <span style={{ opacity: 0.75 }}>{progress}/{nodes.length}</span>
                </button>
              );
            })}
          </section>
        )}
      </div>

      {visibleTrees.map(({ tree, nodes, progress }) => (
        <section key={tree.id} style={treeSectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "10px", marginBottom: "12px", flexWrap: "wrap", position: "sticky", top: treeHeaderStickyTop, zIndex: 16, background: "var(--color-background-secondary, #fff)", paddingBottom: "8px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: TREE_COLORS[tree.id] || "var(--tone-neutral-strong, #1e293b)" }}>{tree.name}</div>
                {tree.isOffSpec && (
                  <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--tone-warning, #9a3412)", background: "var(--tone-warning-soft, #fff7ed)", border: "1px solid var(--tone-warning, #fdba74)", borderRadius: "999px", padding: "2px 7px" }}>
                    SECUNDARIO x{OFF_SPEC_COST_MULTIPLIER}
                  </span>
                )}
                {selectedTreeBuyableNodes.length > 0 && (
                  <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--tone-success-strong, #166534)", background: "var(--tone-success-soft, #ecfdf5)", border: "1px solid var(--tone-success, #86efac)", borderRadius: "999px", padding: "2px 7px" }}>
                    {selectedTreeBuyableNodes.length} disponibles
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>{tree.description}</div>
              {selectedTreeBuyableNodes[0] && (
                <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", marginTop: "5px" }}>
                  Recomendado ahora: {getNodeTitle(selectedTreeBuyableNodes[0])}
                </div>
              )}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>{progress}/{nodes.length}</div>
          </div>

          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {getGroupedColumns(nodes).map(({ stage, nodes: columnNodes }) => (
                <div key={`stage-${stage}`} style={mobileStageStyle}>
                  <div style={mobileStageHeaderStyle}>
                    <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {stage === 6 ? "Tramo 6 · Maestria" : `Tramo ${stage}`}
                    </span>
                    <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" }}>
                      {columnNodes.length} nodo{columnNodes.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {columnNodes.map(node => {
                      const nodeState = getNodeState({ state, node });
                      const justUnlocked = recentUnlocks[node.talent.id] || (node.upgrade && recentUnlocks[node.upgrade.id]);
                      const prereqText = buildNodeRequirementText(node, nodes, nodeState);

                      return (
                        <MobileTalentNodeRow
                          key={node.talent.id}
                          node={node}
                          nodeState={nodeState}
                          justUnlocked={!!justUnlocked}
                          dispatch={dispatch}
                          prereqText={prereqText}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: "auto", paddingBottom: "6px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "stretch", minWidth: "max-content" }}>
                {getGroupedColumns(nodes).map(({ stage, nodes: columnNodes }) => (
                  <div key={`desktop-stage-${stage}`} style={desktopStageStyle}>
                    <div style={desktopStageHeaderStyle}>
                      <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {stage === 6 ? "Tramo 6 · Maestria" : `Tramo ${stage}`}
                      </span>
                      <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" }}>
                        {columnNodes.length} nodo{columnNodes.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                      {columnNodes.map(node => {
                        const nodeState = getNodeState({ state, node });
                        const justUnlocked = recentUnlocks[node.talent.id] || (node.upgrade && recentUnlocks[node.upgrade.id]);
                        const prereqText = buildNodeRequirementText(node, nodes, nodeState);
                        return (
                          <TalentNodeCard
                            key={node.talent.id}
                            node={node}
                            nodeState={nodeState}
                            isMobile={false}
                            justUnlocked={!!justUnlocked}
                            dispatch={dispatch}
                            prereqText={prereqText}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

const emptyContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "40px",
  textAlign: "center",
  gap: "10px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "var(--color-background-secondary, #fff)",
  padding: "12px 16px",
  borderRadius: "15px",
  boxShadow: "0 2px 4px var(--color-shadow, rgba(0,0,0,0.05))",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
};

const treeSectionStyle = {
  background: "var(--color-background-secondary, #ffffff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "18px",
  padding: "14px",
  boxShadow: "0 2px 6px var(--color-shadow, rgba(0,0,0,0.04))",
};

const tabsWrapStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
  gap: "8px",
};

const tabStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  gap: "3px",
  fontSize: "0.7rem",
  cursor: "pointer",
};

const upgradeHintStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "10px",
};

const mobileStageStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "14px",
  padding: "9px",
};

const mobileStageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
  paddingBottom: "6px",
  borderBottom: "1px solid var(--color-border-primary, #e2e8f0)",
};

const desktopStageStyle = {
  width: "292px",
  minWidth: "292px",
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "14px",
  padding: "9px",
};

const desktopStageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
  paddingBottom: "6px",
  borderBottom: "1px solid var(--color-border-secondary, #dbe2ea)",
};

const badgeStyle = color => ({
  fontSize: "0.55rem",
  fontWeight: "900",
  padding: "2px 6px",
  borderRadius: "6px",
  background: `${color}15`,
  color,
  border: `1px solid ${color}44`,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

const miniPillStyle = (color, bg) => ({
  fontSize: "0.52rem",
  fontWeight: "900",
  padding: "2px 6px",
  borderRadius: "999px",
  border: `1px solid ${color}44`,
  color,
  background: bg,
});

const treeButtonStyle = (isMaxed, canUnlock, compact = false) => ({
  border: `1px solid ${isMaxed ? "var(--tone-success, #1D9E75)" : canUnlock ? "var(--tone-accent, #534AB7)" : "var(--color-border-primary, #e2e8f0)"}`,
  borderRadius: "10px",
  padding: compact ? "8px 10px" : "10px 12px",
  fontSize: compact ? "0.66rem" : "0.72rem",
  fontWeight: "900",
  background: isMaxed ? "var(--tone-success-soft, #ecfdf5)" : canUnlock ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-tertiary, #f1f5f9)",
  color: isMaxed ? "var(--tone-success-strong, #166534)" : canUnlock ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #64748b)",
  cursor: isMaxed ? "default" : canUnlock ? "pointer" : "not-allowed",
  whiteSpace: "nowrap",
  letterSpacing: "0.02em",
});


