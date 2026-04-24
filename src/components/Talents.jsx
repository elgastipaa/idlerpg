import React, { useEffect, useMemo, useRef, useState } from "react";
import useViewport from "../hooks/useViewport";
import { TALENTS } from "../data/talents";
import { getNodesForTree } from "../data/talentNodes";
import {
  CROSS_SPEC_UNLOCK_LEVEL,
  OFF_SPEC_COST_MULTIPLIER,
  getProgressValue,
  getTalentTreesForPlayer,
} from "../engine/talents/treeEngine";
import {
  canUnlockNode,
  getNextTalentForNode,
  getNodeLevel,
  getNodeMaxLevel,
  getNodeSegmentSpendRequirement,
  getNodeTreeSpendRequirement,
  getNodeUpgradeCost,
} from "../engine/talents/talentTreeEngine";
import {
  getResolvedOnboardingTutorialTalentNodeId,
  ONBOARDING_STEPS,
} from "../engine/onboarding/onboardingEngine";

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
  mage_general: "var(--tone-info, #2563eb)",
  sorcerer: "var(--tone-warning, #f59e0b)",
  arcanist: "var(--tone-accent, #7c3aed)",
  berserker_tree: "var(--tone-danger, #D85A30)",
  juggernaut_tree: "var(--tone-accent, #534AB7)",
};

const ONBOARDING_TALENT_TREE_BY_NODE = {
  warrior_physical_training: "warrior_general",
  mage_arcane_power: "mage_general",
};

const TALENT_STAT_LABELS = {
  damage: "dano",
  defense: "defensa",
  maxHp: "vida maxima",
  critChance: "chance de critico",
  critDamage: "dano critico",
  attackSpeed: "velocidad de ataque",
  multiHitChance: "multi-hit",
  bleedChance: "chance de sangrado",
  bleedDamage: "poder de sangrado",
  fractureChance: "chance de fractura",
  battleHardened: "aguante marcial",
  heavyImpact: "impacto pesado",
  bloodStrikes: "golpes sangrantes",
  combatFlow: "flujo de combate",
  ironConversion: "conversion de armadura",
  crushingWeight: "golpe inicial demoledor",
  frenziedChain: "cadena frenetica",
  bloodDebt: "rage por leech",
  lastBreath: "ultimo aliento",
  execution: "ejecucion",
  ironCore: "nucleo de hierro",
  fortress: "fortaleza",
  unmovingMountain: "fortaleza inmovil",
  titanicMomentum: "momento titanico",
  lifesteal: "robo de vida",
  regen: "regen",
  blockChance: "bloqueo",
  thorns: "espinas",
  arcaneEcho: "eco arcano",
  arcaneMark: "marca arcana",
  arcaneFlow: "flow arcano",
  overchannel: "overchannel",
  perfectCast: "casteo perfecto",
  freshTargetDamage: "dano al objetivo fresco",
  chainBurst: "burst en cadena",
  unstablePower: "poder inestable",
  overload: "sobrecarga",
  volatileCasting: "cast volatil",
  controlMastery: "dominio de control",
  markTransfer: "transferencia de marca",
  temporalFlow: "flow temporal",
  spellMemory: "memoria de hechizo",
  timeLoop: "bucle temporal",
  absoluteControl: "control absoluto",
  cataclysm: "cataclismo",
  xpBonus: "XP",
  goldBonus: "oro adicional",
  enemyDamageTaken: "dano recibido",
  heal: "curacion",
};

const TALENT_PERCENT_FLAT_STATS = new Set([
  "critChance",
  "attackSpeed",
  "multiHitChance",
  "bleedChance",
  "bleedDamage",
  "fractureChance",
  "lifesteal",
  "blockChance",
]);

const SEGMENT_META = {
  basic: { key: "basic", label: "Tramo 1 · Basicos", order: 1 },
  gameplay: { key: "gameplay", label: "Tramo 2 · Gameplay", order: 2 },
  keystone: { key: "keystone", label: "Tramo 3 · Keystones", order: 3 },
};

const TALENT_VISIBILITY_FILTERS = [
  { id: "comprables", label: "Comprables" },
  { id: "activos", label: "Activos" },
  { id: "todos", label: "Todos" },
];

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

  if (effect.ratio != null) {
    return `+${formatTalentNumber(effect.ratio * 100)}%`;
  }

  if (effect.multiplier != null) {
    if (allowMultiplierX && effect.multiplier >= 2) {
      return `x${formatTalentNumber(effect.multiplier)}`;
    }
    return `+${formatTalentNumber((effect.multiplier - 1) * 100)}%`;
  }

  return "+0";
}

function formatPctValue(value) {
  return `${formatTalentNumber((Number(value || 0)) * 100)}%`;
}

function buildSingleTalentEffectSummary(effect = {}) {
  const stat = effect.stat;
  const value = Number(effect.flat ?? 0);

  switch (stat) {
    case "damage":
      if (effect.multiplier != null) return `${formatTalentBonus(effect)} dano`;
      return `${formatTalentBonus(effect)} dano`;
    case "defense":
      if (effect.multiplier != null) return `${formatTalentBonus(effect)} defensa`;
      return `${formatTalentBonus(effect)} defensa`;
    case "maxHp":
      return `${formatTalentBonus(effect)} vida maxima`;
    case "critChance":
      return `${formatTalentBonus(effect, { forcePercent: true })} crit`;
    case "critDamage":
      return `${formatTalentBonus(effect, { forcePercent: true })} dano critico`;
    case "attackSpeed":
      return `${formatTalentBonus(effect, { forcePercent: true })} velocidad`;
    case "lifesteal":
      return `${formatTalentBonus(effect, { forcePercent: true })} robo de vida`;
    case "multiHitChance":
      return `${formatTalentBonus(effect, { forcePercent: true })} multi-hit`;
    case "bleedChance":
      return `${formatTalentBonus(effect, { forcePercent: true })} sangrado`;
    case "bleedDamage":
      return `${formatTalentBonus(effect, { forcePercent: true })} poder de sangrado`;
    case "fractureChance":
      return `${formatTalentBonus(effect, { forcePercent: true })} fractura`;
    case "regen":
      return `${formatTalentBonus(effect)} vida maxima como regen`;
    case "thorns":
      return `${formatTalentBonus(effect)} defensa como espinas`;
    case "battleHardened":
      return `+${formatTalentNumber(value * 1.2)}% defensa · +${formatTalentNumber(value)}% vida`;
    case "heavyImpact":
      return `Primer golpe +${formatTalentNumber(value * 4)}% · multi-hit -${formatTalentNumber(value * 5)}%`;
    case "bloodStrikes":
      return `+${formatTalentNumber(value * 2.5)}% sangrado · +${formatTalentNumber(value * 3)}% poder`;
    case "combatFlow":
      return `+${formatPctValue(0.005 + value * 0.003)} por stack · max ${2 + value}`;
    case "ironConversion":
      return `Armadura -> dano ${formatTalentNumber(8 + value * 6)}% · dano critico -${formatTalentNumber(Math.min(15, value * 5))}%`;
    case "crushingWeight":
      return `Sin multi-hit · primer golpe +${formatTalentNumber(35 + value * 20)}% · parte escudos de boss`;
    case "frenziedChain":
      return `+${formatTalentNumber(4 + value * 4)}% multi-hit · +${formatTalentNumber(4 + value * 5)}% fractura · con Crushing Weight abre armadura`;
    case "bloodDebt":
      return `Leech -> Rage: +${formatTalentNumber(value)}% dano/stack · +${formatTalentNumber(0.3 + value * 0.3)}% vel/stack`;
    case "lastBreath":
      return `<=35% vida: +${formatTalentNumber(15 + value * 12)}% dano · -${formatTalentNumber(Math.min(45, value * 12))}% defensa`;
    case "execution":
      return `<${formatTalentNumber(15 + value * 2)}% vida enemiga: +${formatTalentNumber(value * 8)}% dano`;
    case "ironCore":
      return `Armadura -> dano ${formatTalentNumber(2 + value * 2)}%`;
    case "fortress":
      return `Bloquear/mitigar: proximo golpe +${formatTalentNumber(value * 0.6)}% por stack · max ${2 + value}`;
    case "unmovingMountain":
      return `+${formatTalentNumber(value * 18)}% defensa · -${formatTalentNumber(value * 6)}% dano · -${formatTalentNumber(value)}% vel`;
    case "titanicMomentum":
      return `HP alto: +${formatTalentNumber((0.007 + value * 0.001) * 100)}% dano · +${formatTalentNumber((0.4 + value * 0.2))}% vel por stack · max ${4 + value * 2}`;
    case "arcaneEcho":
      return `Ecos +${formatTalentNumber(57.5 + value * 7.5)}% dano · aprovechan on-hit`;
    case "arcaneMark":
      return `Marca ${formatTalentNumber(10 + value * 4.5)}% · +${formatTalentNumber(2.4 + value * 1.2)}% por stack · max ${Math.min(5, 2 + Math.ceil(value / 2))}`;
    case "arcaneFlow":
      return `Kill -> siguiente enemigo +${formatTalentNumber((0.1 + value * 0.045) * 100)}%`;
    case "overchannel":
      return `Ecos +${formatTalentNumber((0.45 + value * 0.06) * 100)}% · -${formatTalentNumber((0.04 + value * 0.02) * 100)}% por eco`;
    case "perfectCast":
      return `Sin multi-hit · rango ${formatTalentNumber((0.98 + value * 0.012) * 100)}-${formatTalentNumber((1.05 + value * 0.018) * 100)}%`;
    case "freshTargetDamage":
      return `+${formatTalentNumber(value * 100)}% al objetivo fresco`;
    case "chainBurst":
      return `Tras kill: siguiente objetivo +${formatTalentNumber((0.13 + value * 0.09) * 100)}%`;
    case "unstablePower":
      return `Rango ${formatTalentNumber((Math.max(0.55, 0.9 - value * 0.04)) * 100)}-${formatTalentNumber((1.1 + value * 0.07) * 100)}%`;
    case "overload":
      return `Hits altos/criticos: +${1 + Math.floor(value / 2)} marca${1 + Math.floor(value / 2) === 1 ? "" : "s"}`;
    case "volatileCasting":
      return `Hit bueno: sig. +${formatTalentNumber((0.1 + value * 0.08) * 100)}% · malo: ${formatTalentNumber((Math.max(0.72, 1 - value * 0.04)) * 100)}%`;
    case "controlMastery":
      return `Marca +${formatTalentNumber((value * 0.35) * 100)}%/stack · duracion +${Math.floor(value * 4)} ticks`;
    case "markTransfer":
      return `Transfiere ${formatTalentNumber((0.2 + value * 0.1) * 100)}% de Marca`;
    case "temporalFlow":
      return `+${formatTalentNumber((0.015 + value * 0.01) * 100)}% por hit · max ${2 + value}`;
    case "spellMemory":
      return `Marca +${formatTalentNumber((0.01 + value * 0.006) * 100)}% por memoria · max ${2 + value}`;
    case "timeLoop":
      return `Flow dura ${1 + value} hits · transferencia extra`;
    case "absoluteControl":
      return `Marcado +${formatTalentNumber(value * 8)}% · sin marcar -${formatTalentNumber(value * 5)}%`;
    case "cataclysm":
      return `Tras kill: opener +${formatTalentNumber(value * 12)}% · sostenido ${formatTalentNumber((Math.max(0.7, 1 - value * 0.08)) * 100)}%`;
    default:
      return "";
  }
}

function buildTalentEffectSummary(talent) {
  if (!talent?.effect) return "";
  const effects = [talent.effect, ...(talent.extraEffects || [])].filter(Boolean);
  const parts = effects.map(effect => buildSingleTalentEffectSummary(effect)).filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  return buildTalentDescription(talent);
}

function buildTalentDescription(talent) {
  if (!talent?.effect || !talent?.trigger) return talent?.description || "";
  if (talent?.description) return talent.description;

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
    if ([
      "battleHardened",
      "heavyImpact",
      "bloodStrikes",
      "combatFlow",
      "lastBreath",
      "execution",
      "ironCore",
      "fortress",
      "titanicMomentum",
    ].includes(effect.stat)) {
      return talent.description || "";
    }
    if (effect.stat === "ironConversion") {
      return "Parte de tu armadura se convierte en dano.";
    }
    if (effect.stat === "crushingWeight") {
      return "No podes hacer multi-hit, pero el primer golpe contra cada enemigo pega mucho mas fuerte.";
    }
    if (effect.stat === "frenziedChain") {
      return "Ganas multi-hit extra y tus cadenas aplican Fractura con mucha mas frecuencia.";
    }
    if (effect.stat === "bloodDebt") {
      return "Cada vez que tu leech te cura, acumulas Rage temporal.";
    }
    if (effect.stat === "lifesteal") {
      return `Ganas ${formatTalentBonus(effect, { forcePercent: true })} robo de vida.`;
    }
    if (effect.stat === "critDamage") {
      return `Ganas ${formatTalentBonus(effect, { forcePercent: true })} dano critico.`;
    }
    if (effect.stat === "unmovingMountain") {
      return "Ganas mucha defensa, pero sacrificas parte de tu velocidad y dano base.";
    }
    if (effect.stat === "regen") {
      return `Regeneras ${formatTalentBonus(effect)} de tu vida maxima por tick.`;
    }
    if (effect.stat === "thorns") {
      return `Reflejas dano equivalente a ${formatTalentBonus(effect)} de tu defensa.`;
    }
    if (effect.stat === "goldBonus") {
      return `Ganas ${formatTalentBonus(effect)} oro adicional por kill.`;
    }
    return `Ganas ${formatTalentBonus(effect, { forcePercent: effect.stat === "xpBonus" })} ${statLabel} de forma pasiva.`;
  }

  if (trigger.stat === "kills") {
    if (effect.stat === "damage") {
      return `Cada ${formatTalentNumber(trigger.every || 1)} bajas, tu proximo ataque inflige ${formatTalentBonus(effect, { allowMultiplierX: true })} dano.`;
    }
    return `Cada ${formatTalentNumber(trigger.every || 1)} bajas, ganas ${formatTalentBonus(effect)} ${statLabel}${durationText}${stackText}.`;
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
    if (effect.stat === "regen") {
      return `${effect.stackable && effect.maxStacks > 1 ? "Al recibir dano, acumulas" : "Al recibir dano, ganas"} ${formatTalentBonus(effect)} de tu vida maxima como regen${effect.stackable && effect.maxStacks > 1 ? " por stack" : ""}${effect.duration == null ? "" : ` durante ${pluralizeTicks(effect.duration)}`}${stackText}.`;
    }
    return `${effect.stackable && effect.maxStacks > 1 ? "Al recibir dano, acumulas" : "Al recibir dano, ganas"} ${formatTalentBonus(effect)} ${statLabel}${effect.stackable && effect.maxStacks > 1 ? " por stack" : ""}${effect.duration == null ? "" : ` durante ${pluralizeTicks(effect.duration)}`}${stackText}.`;
  }

  if (trigger.stat === "lowHp") {
    return `Mientras estes por debajo de 30% vida, ganas ${formatTalentBonus(effect, { allowMultiplierX: effect.stat === "damage" && (effect.multiplier || 0) >= 2 })} ${statLabel}${durationText}${stackText}.`;
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

function getTalentDisplayType(talent) {
  if (!talent) return "passive";
  if (talent.displayType) return talent.displayType;
  if (talent.type === "stacking") return "stacking";
  if (talent.type === "triggered") return "triggered";
  if (talent.trigger?.stat && talent.trigger.stat !== "always") return "triggered";
  return "passive";
}

function getDisplayedNodes(tree) {
  return getNodesForTree(tree.id)
    .map(node => {
      const levelTalents = (node.levels || [])
        .map(levelTalentId => TALENTS.find(item => item.id === levelTalentId) || null)
        .filter(Boolean);
      const talent = levelTalents[0] || null;
      if (!talent) return null;

      return {
        ...node,
        talent,
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
  const segmentSpendGate = getNodeSegmentSpendRequirement(state, node.talent.id);
  const nextUnlockCondition = nextTalent?.unlockCondition || null;
  const nextUnlockConditionMet = !nextUnlockCondition?.stat
    ? true
    : getProgressValue(state, nextUnlockCondition.stat) >= Number(nextUnlockCondition.value || 0);
  const allRequirementsMet = prereqsMet && treeSpendGate.met && segmentSpendGate.met && nextUnlockConditionMet;

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
    nextUnlockConditionMet,
    allRequirementsMet,
    prereqInfo: {
      mode,
      metCount,
      totalCount: prereqIds.length,
      requiredCount,
    },
    treeSpendGate,
    segmentSpendGate,
    tierLabel: currentLevel <= 0 ? "Bloqueado" : `Nivel ${currentLevel}/${maxLevel}`,
  };
}

function getTreeProgress(state, nodes) {
  return nodes.filter(node => getNodeLevel(state, node.talent.id) >= 1).length;
}

function getBaseTalentId(talentId) {
  let current = TALENTS.find(item => item.id === talentId) || null;
  if (!current) return talentId;

  const visited = new Set([current.id]);
  while (current?.replaces) {
    const replacedId = Array.isArray(current.replaces) ? current.replaces[0] : current.replaces;
    if (!replacedId || visited.has(replacedId)) break;
    visited.add(replacedId);
    const replacedTalent = TALENTS.find(item => item.id === replacedId) || null;
    if (!replacedTalent) return replacedId;
    current = replacedTalent;
  }

  return current?.id || talentId;
}

function getNodeTitle(node) {
  return (node?.talent?.name || "").replace(/\s+(II|III|IV)$/, "");
}

function toTitleCaseLabel(value = "") {
  return String(value || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getGroupedColumns(nodes = []) {
  const grouped = new Map();
  for (const node of nodes) {
    const segment = SEGMENT_META[node?.segment] || SEGMENT_META.basic;
    if (!grouped.has(segment.key)) grouped.set(segment.key, []);
    grouped.get(segment.key).push(node);
  }

  return [...grouped.entries()]
    .sort((a, b) => (SEGMENT_META[a[0]]?.order || 99) - (SEGMENT_META[b[0]]?.order || 99))
    .map(([segmentKey, stageNodes]) => ({
      segmentKey,
      label: (SEGMENT_META[segmentKey] || SEGMENT_META.basic).label,
      nodes: [...stageNodes].sort((a, b) => (a.x || 0) - (b.x || 0) || (a.y || 0) - (b.y || 0)),
    }));
}

function buildNodeRequirementText(state, node, nodes, nodeState) {
  const skillParts = [];
  const gateParts = [];
  const prereqNames = (node.prereqs || [])
    .map(prereqId => nodes.find(candidate => candidate.id === getBaseTalentId(prereqId)))
    .filter(Boolean)
    .map(getNodeTitle);

  if (prereqNames.length > 0) {
    skillParts.push(`Requiere desbloquear: ${prereqNames.join(node.prereqMode === "any" ? " o " : " + ")}`);
  }

  const unlockCondition = nodeState?.nextTalent?.unlockCondition || null;
  if (unlockCondition?.stat) {
    const currentValue = getProgressValue(state, unlockCondition.stat);
    if (currentValue < unlockCondition.value) {
      const statLabel =
        unlockCondition.stat === "level"
          ? "Requiere nivel"
          : unlockCondition.stat === "kills"
            ? "Requiere bajas"
          : unlockCondition.stat === "gold"
              ? "Requiere oro"
              : unlockCondition.stat;
      gateParts.push(`${statLabel} ${unlockCondition.value}`);
    }
  }

  if (!nodeState.treeSpendGate.met && nodeState.treeSpendGate.required > 0) {
    gateParts.push(`Gasta ${nodeState.treeSpendGate.remaining} TP mas en el arbol`);
  }

  if (!nodeState.segmentSpendGate.met && nodeState.segmentSpendGate.required > 0) {
    gateParts.push(`Gasta ${nodeState.segmentSpendGate.remaining} TP mas en el tramo base`);
  }

  const exclusiveGroup = node?.talent?.exclusiveGroup || null;
  if (exclusiveGroup) {
    const currentNodeBaseId = getBaseTalentId(node.talent.id);
    const conflicting = TALENTS.find(
      talent =>
        (state?.player?.unlockedTalents || []).includes(talent.id) &&
        getBaseTalentId(talent.id) !== currentNodeBaseId &&
        talent.exclusiveGroup === exclusiveGroup
    );
    if (conflicting) {
      skillParts.push(`Ya elegiste: ${conflicting.name}`);
    }
  }

  return [skillParts.join(" · "), gateParts.join(" · ")].filter(Boolean).join("\n");
}

function getNodeActionLabel(nodeState, compact = false) {
  if (nodeState.isMaxed || !nodeState.nextTalent) return "MAX";
  if (!nodeState.isBaseUnlocked) return compact ? `+${nodeState.nextCost || 0}` : `DESB. +${nodeState.nextCost || 0} TP`;
  if (nodeState.maxLevel > 2 && !compact) return `NIV ${Math.min(nodeState.maxLevel, nodeState.currentLevel + 1)} · +${nodeState.nextCost || 0} TP`;
  return `+${nodeState.nextCost || 0}${compact ? "" : " TP"}`;
}

function TalentNodeCard({
  node,
  nodeState,
  isMobile,
  justUnlocked,
  dispatch,
  prereqText = "",
  spotlight = false,
  compact = false,
}) {
  const displayType = getTalentDisplayType(nodeState.activeTalent);
  const typeColor = TYPE_COLORS[displayType] || "var(--color-text-secondary, #64748b)";
  const isUnlocked = nodeState.currentLevel > 0;
  const canUpgrade = nodeState.canUnlockNext && !!nodeState.nextTalent;
  const isKeystone = (nodeState.activeTalent?.tags || []).includes("keystone");
  const currentSummary = buildTalentEffectSummary(nodeState.activeTalent || node.talent);
  const nextSummary = nodeState.nextTalent ? buildTalentEffectSummary(nodeState.nextTalent) : "";
  const compactButtonLabel = getNodeActionLabel(nodeState, true);

  if (compact) {
    return (
      <article
        data-onboarding-node-id={node.talent.id}
        data-onboarding-target={spotlight ? "buy-talent-card" : undefined}
        style={{
          background: "var(--color-background-secondary, #fff)",
          border: `1px solid ${justUnlocked ? "var(--tone-success, #22c55e)" : isUnlocked ? "var(--tone-success, #1D9E75)" : nodeState.allRequirementsMet ? "var(--color-border-primary, #e2e8f0)" : "var(--tone-danger, #fecaca)"}`,
          borderRadius: "11px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          minWidth: 0,
          position: spotlight ? "relative" : "static",
          zIndex: spotlight ? 2 : 1,
          boxShadow: spotlight
            ? "0 0 0 2px rgba(99,102,241,0.18), 0 12px 28px rgba(99,102,241,0.18)"
            : justUnlocked
              ? "0 0 0 2px rgba(34,197,94,0.42), 0 0 18px rgba(34,197,94,0.25)"
              : "none",
          animation: spotlight ? "talentSpotlightPulse 1600ms ease-in-out infinite" : "none",
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
            data-onboarding-target={spotlight ? "buy-talent" : undefined}
            style={{
              ...treeButtonStyle(nodeState.isMaxed, canUpgrade, true),
              boxShadow: spotlight ? "0 0 0 2px rgba(99,102,241,0.16), 0 8px 20px rgba(99,102,241,0.18)" : "none",
              animation: spotlight ? "talentSpotlightPulse 1600ms ease-in-out infinite" : "none",
            }}
          >
            {compactButtonLabel}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
          {isKeystone && (
            <div style={miniPillStyle("var(--tone-danger-strong, #9f1239)", "var(--tone-danger-soft, #fff1f2)")}>
              Keystone
            </div>
          )}
          <div style={badgeStyle(typeColor)}>{displayType.toUpperCase()}</div>
          {canUpgrade && (
            <div style={miniPillStyle("var(--tone-success-strong, #166534)", "var(--tone-success-soft, #ecfdf5)")}>
              Disponible
            </div>
          )}
          <div style={miniPillStyle("var(--tone-accent, #4338ca)", "var(--tone-accent-soft, #eef2ff)")}>
            LV {nodeState.currentLevel}/{nodeState.maxLevel}
          </div>
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

        <div style={{ fontSize: "0.56rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", lineHeight: 1.25 }}>
          {nodeState.currentLevel > 0 ? `Actual: ${currentSummary}` : `Base: ${currentSummary}`}
        </div>
        {!nodeState.isMaxed && nodeState.nextTalent && (
          <div style={{ fontSize: "0.56rem", color: "var(--tone-accent, #4338ca)", fontWeight: "800", lineHeight: 1.25 }}>
            {`Proximo: ${nextSummary}`}
          </div>
        )}

        {prereqText && (
          <div
            style={{
              fontSize: "0.55rem",
              color: nodeState.allRequirementsMet ? "var(--color-text-tertiary, #94a3b8)" : "var(--tone-danger, #D85A30)",
              fontWeight: "800",
              lineHeight: 1.25,
              whiteSpace: "pre-line",
            }}
          >
            {prereqText}
          </div>
        )}
      </article>
    );
  }

  return (
    <div
      data-onboarding-node-id={node.talent.id}
      data-onboarding-target={spotlight ? "buy-talent-card" : undefined}
      style={{
        background: "var(--color-background-secondary, #fff)",
        border: `1px solid ${justUnlocked ? "var(--tone-success, #22c55e)" : isUnlocked ? "var(--tone-success, #1D9E75)" : nodeState.allRequirementsMet ? "var(--color-border-primary, #e2e8f0)" : "var(--tone-danger, #fecaca)"}`,
        borderRadius: "14px",
        padding: isMobile ? "9px" : "10px",
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        minWidth: 0,
        position: spotlight ? "relative" : "static",
        zIndex: spotlight ? 2 : 1,
        boxShadow: spotlight
          ? "0 0 0 2px rgba(99,102,241,0.18), 0 12px 28px rgba(99,102,241,0.18)"
          : justUnlocked
            ? "0 0 0 2px rgba(34,197,94,0.45), 0 0 22px rgba(34,197,94,0.35), 0 12px 24px rgba(29,158,117,0.24)"
            : "none",
        animation: spotlight ? "talentSpotlightPulse 1600ms ease-in-out infinite" : "none",
        transform: spotlight || justUnlocked ? "scale(1.01)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? "0.74rem" : "0.84rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.15 }}>
            {getNodeTitle(node)}
          </div>
          <div style={{ fontSize: isMobile ? "0.58rem" : "0.63rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800", marginTop: "3px" }}>{nodeState.tierLabel}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {canUpgrade && <div style={miniPillStyle("var(--tone-success-strong, #166534)", "var(--tone-success-soft, #ecfdf5)")}>Disponible</div>}
          {isKeystone && <div style={miniPillStyle("var(--tone-danger-strong, #9f1239)", "var(--tone-danger-soft, #fff1f2)")}>Keystone</div>}
          <div style={badgeStyle(typeColor)}>{displayType.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ fontSize: isMobile ? "0.68rem" : "0.74rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.35 }}>
        {buildTalentDescription(nodeState.activeTalent || node.talent)}
      </div>

      <div style={{ ...upgradeHintStyle, borderColor: nodeState.isMaxed ? "var(--tone-success, #86efac)" : "var(--color-border-primary, #e2e8f0)", background: nodeState.isMaxed ? "var(--tone-success-soft, rgba(34,197,94,0.08))" : "var(--color-background-tertiary, #f8fafc)" }}>
        <div style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", marginBottom: "4px" }}>
          {nodeState.currentLevel > 0 ? `Actual ${nodeState.currentLevel}/${nodeState.maxLevel}` : "Base"}
        </div>
        <div style={{ fontSize: isMobile ? "0.66rem" : "0.72rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.3 }}>
          {currentSummary}
        </div>
        {!nodeState.isMaxed && nodeState.nextTalent && (
          <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed var(--color-border-primary, #e2e8f0)" }}>
            <div style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)", textTransform: "uppercase", marginBottom: "4px" }}>
              Proximo nivel
            </div>
            <div style={{ fontSize: isMobile ? "0.66rem" : "0.72rem", color: "var(--tone-accent, #4338ca)", lineHeight: 1.3 }}>
              {nextSummary}
            </div>
          </div>
        )}
      </div>

      {prereqText && (
        <div
          style={{
            fontSize: "0.6rem",
            fontWeight: "800",
            color: nodeState.allRequirementsMet ? "var(--color-text-tertiary, #94a3b8)" : "var(--tone-danger, #D85A30)",
            lineHeight: 1.25,
            whiteSpace: "pre-line",
          }}
        >
          {prereqText}
        </div>
      )}

      <button
        onClick={() => dispatch({ type: "UPGRADE_TALENT_NODE", nodeId: node.talent.id })}
        disabled={!canUpgrade}
        data-onboarding-target={spotlight ? "buy-talent" : undefined}
        style={{
          ...treeButtonStyle(nodeState.isMaxed, canUpgrade),
          boxShadow: spotlight ? "0 0 0 2px rgba(99,102,241,0.16), 0 8px 20px rgba(99,102,241,0.18)" : "none",
          animation: spotlight ? "talentSpotlightPulse 1600ms ease-in-out infinite" : "none",
        }}
      >
        {getNodeActionLabel(nodeState)}
      </button>
    </div>
  );
}

function MobileTalentNodeRow(props) {
  return (
    <TalentNodeCard
      {...props}
      isMobile
      compact
    />
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
  const { isMobile } = useViewport();
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [visibilityFilter, setVisibilityFilter] = useState("comprables");
  const [recentUnlocks, setRecentUnlocks] = useState({});
  const [canScrollTreesLeft, setCanScrollTreesLeft] = useState(false);
  const [canScrollTreesRight, setCanScrollTreesRight] = useState(false);
  const onboardingStep = state?.onboarding?.step || null;
  const spotlightTalentPurchase = onboardingStep === ONBOARDING_STEPS.BUY_TALENT;
  const trackedUnlocksRef = useRef(unlockedTalents || []);
  const treeTabsScrollerRef = useRef(null);

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
  const tutorialTalentNodeId = spotlightTalentPurchase
    ? getResolvedOnboardingTutorialTalentNodeId(state)
    : null;
  const selectedTree = treeData.find(item => item.tree.id === selectedTreeId) || treeData[0] || null;
  const visibleTrees = selectedTree ? [selectedTree] : [];
  const selectedTreeNodeEntries = useMemo(
    () => (selectedTree?.nodes || []).map(node => ({ node, nodeState: getNodeState({ state, node }) })),
    [selectedTree, state]
  );
  const selectedTreeBuyableNodes = useMemo(
    () => selectedTreeNodeEntries.filter(entry => entry.nodeState.canUnlockNext).map(entry => entry.node),
    [selectedTreeNodeEntries]
  );
  const tutorialTalentTreeId = useMemo(() => {
    if (!spotlightTalentPurchase || !tutorialTalentNodeId) return null;
    const tutorialTree = treeData.find(item =>
      item.nodes.some(node => node.talent.id === tutorialTalentNodeId)
    );
    return tutorialTree?.tree?.id || ONBOARDING_TALENT_TREE_BY_NODE[tutorialTalentNodeId] || null;
  }, [spotlightTalentPurchase, treeData, tutorialTalentNodeId]);
  const resolvedTutorialTalentNodeId = useMemo(() => {
    if (!spotlightTalentPurchase) return null;
    if (tutorialTalentNodeId) {
      return tutorialTalentNodeId;
    }
    return selectedTreeBuyableNodes[0]?.talent?.id || null;
  }, [selectedTreeBuyableNodes, spotlightTalentPurchase, tutorialTalentNodeId]);
  const totalBuyableNodes = useMemo(
    () => treeData.reduce((total, item) => total + item.nodes.filter(node => canUnlockNode(state, node.talent.id)).length, 0),
    [treeData, state]
  );
  const visibleTreeGroups = useMemo(() => {
    if (!selectedTree) return [];
    const shouldShowNode = entry => {
      if (spotlightTalentPurchase && entry.node.talent.id === resolvedTutorialTalentNodeId) {
        return true;
      }
      if (visibilityFilter === "activos") {
        return entry.nodeState.currentLevel > 0;
      }
      if (visibilityFilter === "comprables") {
        return entry.nodeState.currentLevel > 0 || entry.nodeState.canUnlockNext;
      }
      return true;
    };

    const visibleEntriesById = new Map(
      selectedTreeNodeEntries
        .filter(shouldShowNode)
        .map(entry => [entry.node.talent.id, entry])
    );

    return getGroupedColumns(selectedTree.nodes)
      .map(group => {
        const nodeEntries = group.nodes
          .map(node => visibleEntriesById.get(node.talent.id))
          .filter(Boolean);
        const actionableCount = group.nodes.filter(node => canUnlockNode(state, node.talent.id)).length;
        const activeCount = group.nodes.filter(node => getNodeLevel(state, node.talent.id) > 0).length;
        return {
          ...group,
          nodeEntries,
          totalNodes: group.nodes.length,
          actionableCount,
          activeCount,
        };
      })
      .filter(group => group.nodeEntries.length > 0);
  }, [selectedTree, selectedTreeNodeEntries, spotlightTalentPurchase, resolvedTutorialTalentNodeId, state, visibilityFilter]);
  const hasVisibleNodes = visibleTreeGroups.length > 0;
  const treeHeaderStickyTop = "var(--app-header-offset, 96px)";

  useEffect(() => {
    const node = treeTabsScrollerRef.current;
    if (!node || treeData.length <= 1) {
      setCanScrollTreesLeft(false);
      setCanScrollTreesRight(false);
      return undefined;
    }

    const syncTreeScrollState = () => {
      const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      setCanScrollTreesLeft(node.scrollLeft > 6);
      setCanScrollTreesRight(node.scrollLeft < maxScrollLeft - 6);
    };

    syncTreeScrollState();
    node.addEventListener("scroll", syncTreeScrollState, { passive: true });
    window.addEventListener("resize", syncTreeScrollState);
    return () => {
      node.removeEventListener("scroll", syncTreeScrollState);
      window.removeEventListener("resize", syncTreeScrollState);
    };
  }, [treeData.length, isMobile]);

  useEffect(() => {
    if (!spotlightTalentPurchase || !tutorialTalentTreeId) return;
    if (selectedTreeId !== tutorialTalentTreeId) {
      setSelectedTreeId(tutorialTalentTreeId);
    }
  }, [selectedTreeId, spotlightTalentPurchase, tutorialTalentTreeId]);

  useEffect(() => {
    if (!spotlightTalentPurchase || !resolvedTutorialTalentNodeId) return undefined;
    if (tutorialTalentTreeId && selectedTreeId !== tutorialTalentTreeId) return undefined;

    let frameId = null;
    let timeoutId = null;
    let attempts = 0;

    const scrollTutorialNodeIntoView = () => {
      const node = document.querySelector(`[data-onboarding-node-id="${resolvedTutorialTalentNodeId}"]`);
      if (!(node instanceof HTMLElement)) {
        attempts += 1;
        if (attempts < 8) {
          timeoutId = window.setTimeout(() => {
            frameId = window.requestAnimationFrame(scrollTutorialNodeIntoView);
          }, 90);
        }
        return;
      }

      const behavior = attempts === 0 ? "auto" : "smooth";
      const topSafe = isMobile ? 118 : 112;
      const bottomSafe = isMobile ? 90 : 28;
      const visibleBottom = Math.max(topSafe + 48, window.innerHeight - bottomSafe);

      node.scrollIntoView({
        behavior,
        block: "center",
        inline: isMobile ? "nearest" : "center",
      });

      const rect = node.getBoundingClientRect();
      if (rect.top < topSafe) {
        window.scrollBy({
          top: rect.top - topSafe - 10,
          behavior,
        });
      } else if (rect.bottom > visibleBottom) {
        window.scrollBy({
          top: rect.bottom - visibleBottom + 10,
          behavior,
        });
      }

      attempts += 1;
      if (attempts < 3) {
        timeoutId = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(scrollTutorialNodeIntoView);
        }, 120);
      }
    };

    frameId = window.requestAnimationFrame(scrollTutorialNodeIntoView);
    return () => {
      if (frameId != null) window.cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [isMobile, resolvedTutorialTalentNodeId, selectedTreeId, spotlightTalentPurchase, tutorialTalentTreeId]);

  if (!playerClass) {
    return (
      <div style={emptyContainerStyle}>
        <h2 style={{ color: "var(--color-text-tertiary, #9ca3af)", fontWeight: "900" }}>CLASE REQUERIDA</h2>
        <p style={{ color: "var(--color-text-tertiary, #9ca3af)", fontSize: "0.9rem" }}>Elegi una clase para ver tus talentos disponibles.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", minHeight: "100%" }}>
      <style>{`
        @keyframes talentSpotlightPulse {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.24); }
          70% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "4px" }}>
        <header style={headerStyle}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase" }}>Arbol de Talentos</div>
            <div style={{ fontSize: "1rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{toTitleCaseLabel(playerClass)} {playerSpec && `- ${toTitleCaseLabel(playerSpec)}`}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: "900", color: "var(--tone-success, #1D9E75)" }}>{talentPoints} TP</div>
            <div style={{ fontSize: "0.65rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>{Object.values(talentLevels || {}).filter(value => Number(value) > 0).length || unlockedTalents.length} nodos comprados</div>
            <div style={{ fontSize: "0.58rem", color: totalBuyableNodes > 0 ? "var(--tone-accent, #4338ca)" : "var(--color-text-tertiary, #94a3b8)", fontWeight: "800", marginTop: "4px" }}>
              {totalBuyableNodes > 0 ? `${totalBuyableNodes} nodos comprables ahora` : "Sin compras disponibles ahora"}
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
          <section style={{ position: "relative" }}>
            <div ref={treeTabsScrollerRef} style={tabsWrapStyle}>
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
            </div>
            {canScrollTreesLeft && <div style={treeTabsFadeStyle("left")} />}
            {canScrollTreesRight && <div style={treeTabsFadeStyle("right")} />}
            {canScrollTreesLeft && <div style={treeTabsHintStyle("left")}>←</div>}
            {canScrollTreesRight && <div style={treeTabsHintStyle("right")}>→</div>}
          </section>
        )}
      </div>

      {visibleTrees.map(({ tree, nodes, progress }) => (
        <section key={tree.id} style={treeSectionWrapStyle}>
          <div
            data-onboarding-top-guard={spotlightTalentPurchase ? "true" : undefined}
            style={{
              marginInline: "-14px",
              position: "sticky",
              top: treeHeaderStickyTop,
              zIndex: 48,
              marginBottom: 0,
              paddingTop: "6px",
              background: "var(--color-background-primary, #f8fafc)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: "10px",
                flexWrap: "wrap",
                background: "var(--color-background-secondary, #fff)",
                padding: "6px 14px 8px",
                boxShadow: "0 12px 18px -18px rgba(15,23,42,0.5)",
                border: "1px solid var(--color-border-primary, #e2e8f0)",
                borderBottom: "1px solid var(--color-border-primary, #e2e8f0)",
                borderRadius: "18px 18px 0 0",
              }}
            >
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
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px", lineHeight: 1.35 }}>
                  {visibilityFilter === "todos"
                    ? tree.description
                    : visibilityFilter === "activos"
                      ? "Solo muestra nodos ya comprados en esta rama."
                      : "Solo muestra nodos activos o que ya puedes comprar ahora."}
                </div>
              </div>
              <div style={{ display: "grid", gap: "6px", justifyItems: "end" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>{progress}/{nodes.length}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {TALENT_VISIBILITY_FILTERS.map(filter => {
                    const active = visibilityFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setVisibilityFilter(filter.id)}
                        style={{
                          border: "1px solid",
                          borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #e2e8f0)",
                          background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #fff)",
                          color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #64748b)",
                          borderRadius: "999px",
                          padding: "3px 8px",
                          fontSize: "0.56rem",
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
            </div>
          </div>

          <div style={treeBodyStyle}>
          {!hasVisibleNodes ? (
            <div style={{ padding: "10px 2px", fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
              {visibilityFilter === "activos"
                ? "Todavia no hay nodos activos en esta rama. Cambia a `Comprables` o `Todos` para explorarla."
                : "Ahora mismo esta rama no tiene compras directas. Usa `Todos` si quieres ver tiers futuros."}
            </div>
          ) : isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {visibleTreeGroups.map(({ segmentKey, label, nodeEntries, totalNodes, actionableCount, activeCount }) => (
                <div key={`stage-${segmentKey}`} style={mobileStageStyle}>
                  <div style={mobileStageHeaderStyle}>
                    <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {label}
                    </span>
                    <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" }}>
                      {nodeEntries.length}/{totalNodes} nodo{totalNodes === 1 ? "" : "s"} · {activeCount} activo{activeCount === 1 ? "" : "s"} · {actionableCount} comprable{actionableCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {nodeEntries.map(({ node, nodeState }) => {
                      const justUnlocked = !!recentUnlocks[node.talent.id];
                      const prereqText = buildNodeRequirementText(state, node, nodes, nodeState);

                      return (
                        <MobileTalentNodeRow
                          key={node.talent.id}
                          node={node}
                          nodeState={nodeState}
                          justUnlocked={!!justUnlocked}
                          dispatch={dispatch}
                          prereqText={prereqText}
                          spotlight={
                            spotlightTalentPurchase &&
                            resolvedTutorialTalentNodeId != null &&
                            node.talent.id === resolvedTutorialTalentNodeId
                          }
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
                {visibleTreeGroups.map(({ segmentKey, label, nodeEntries, totalNodes, actionableCount, activeCount }) => (
                  <div key={`desktop-stage-${segmentKey}`} style={desktopStageStyle}>
                    <div style={desktopStageHeaderStyle}>
                      <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: "0.58rem", fontWeight: "900", color: "var(--color-text-tertiary, #94a3b8)" }}>
                        {nodeEntries.length}/{totalNodes} · {activeCount} activo{activeCount === 1 ? "" : "s"} · {actionableCount} comprable{actionableCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                      {nodeEntries.map(({ node, nodeState }) => {
                        const justUnlocked = !!recentUnlocks[node.talent.id];
                        const prereqText = buildNodeRequirementText(state, node, nodes, nodeState);
                        return (
                          <TalentNodeCard
                            key={node.talent.id}
                            node={node}
                            nodeState={nodeState}
                            isMobile={false}
                            justUnlocked={!!justUnlocked}
                            dispatch={dispatch}
                            prereqText={prereqText}
                            spotlight={
                              spotlightTalentPurchase &&
                              resolvedTutorialTalentNodeId != null &&
                              node.talent.id === resolvedTutorialTalentNodeId
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
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

const treeSectionWrapStyle = {
  position: "relative",
};

const treeBodyStyle = {
  background: "var(--color-background-secondary, #ffffff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderTop: "none",
  borderRadius: "0 0 18px 18px",
  marginInline: "-14px",
  padding: "12px 14px 14px",
  boxShadow: "0 2px 6px var(--color-shadow, rgba(0,0,0,0.04))",
};

const tabsWrapStyle = {
  display: "flex",
  gap: "8px",
  overflowX: "auto",
  padding: "0 18px 2px 0",
  scrollbarWidth: "none",
  scrollBehavior: "smooth",
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
  flexShrink: 0,
  minWidth: "148px",
};

const treeTabsFadeStyle = (side = "right") => ({
  position: "absolute",
  top: 0,
  bottom: 2,
  [side]: 0,
  width: "26px",
  pointerEvents: "none",
  background: side === "right"
    ? "linear-gradient(90deg, rgba(248,250,252,0), var(--color-background-primary, #f8fafc))"
    : "linear-gradient(270deg, rgba(248,250,252,0), var(--color-background-primary, #f8fafc))",
});

const treeTabsHintStyle = (side = "right") => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  [side]: "2px",
  width: "18px",
  height: "18px",
  borderRadius: "999px",
  background: "var(--color-background-primary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  color: "var(--color-text-tertiary, #94a3b8)",
  fontSize: "0.6rem",
  fontWeight: "900",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
});

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


