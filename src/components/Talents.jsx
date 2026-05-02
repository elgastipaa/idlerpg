import React, { useEffect, useMemo, useRef, useState } from "react";
import useViewport from "../hooks/useViewport";
import ForgeIcon from "./icons/ForgeIcon";
import { FlButton, FlIconFrame, FlTalentNode, FlTalentPointCounter } from "./ui/forge";
import { getTalentAsset } from "../utils/assetRegistry";
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

const FORGE_TALENT_SEGMENT_ORDER = ["basic", "gameplay", "keystone"];

const DEFENSIVE_TALENT_STATS = new Set([
  "defense",
  "maxHp",
  "blockChance",
  "thorns",
  "battleHardened",
  "ironCore",
  "fortress",
  "unmovingMountain",
]);

const SURVIVAL_TALENT_STATS = new Set([
  "heal",
  "regen",
  "lifesteal",
  "goldBonus",
  "xpBonus",
]);

const DOT_TALENT_STATS = new Set([
  "bleedChance",
  "bleedDamage",
  "fractureChance",
  "enemyDamageTaken",
]);

const TALENTS_STITCH_TRIAL_STORAGE_KEY = "idlerpg:trial:talents-stitch";

function isTalentsStitchTrialEnabled() {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("talents_stitch_trial") === "1") return true;
    return window.localStorage?.getItem(TALENTS_STITCH_TRIAL_STORAGE_KEY) === "1";
  } catch (_error) {
    return false;
  }
}

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

function getTalentEffectStats(talent) {
  return [talent?.effect, ...(talent?.extraEffects || [])]
    .filter(Boolean)
    .map(effect => effect.stat)
    .filter(Boolean);
}

function getTalentIconName(node, nodeState) {
  const talent = nodeState?.activeTalent || node?.talent || null;
  const stats = getTalentEffectStats(talent);
  const tags = new Set(talent?.tags || []);
  const displayType = getTalentDisplayType(talent);

  if (tags.has("keystone")) return "talents";
  if (stats.some(stat => DOT_TALENT_STATS.has(stat))) return stats.includes("fractureChance") ? "fracture" : "bleed";
  if (stats.some(stat => SURVIVAL_TALENT_STATS.has(stat))) {
    if (stats.includes("goldBonus")) return "gold";
    if (stats.includes("xpBonus")) return "xp";
    return "sanctuary";
  }
  if (stats.some(stat => DEFENSIVE_TALENT_STATS.has(stat))) return "armor";
  if (stats.some(stat => stat === "critChance" || stat === "critDamage")) return "mark";
  if (stats.some(stat => stat === "attackSpeed" || stat === "multiHitChance")) return "upgrade";
  if (stats.some(stat => stat === "arcaneEcho" || stat === "arcaneMark" || stat === "arcaneFlow")) return "essence";
  if (displayType === "stacking") return "upgrade";
  if (displayType === "triggered") return "fire";
  return "combat";
}

function getTreeIconName(tree, playerClass) {
  if (tree?.id?.includes("berserker")) return "skull";
  if (tree?.id?.includes("juggernaut")) return "armor";
  if (tree?.id?.includes("mage") || tree?.id?.includes("sorcerer") || tree?.id?.includes("arcanist")) return "essence";
  if (playerClass === "mage") return "essence";
  return "combat";
}

function getForgeTalentSegments(nodeEntries = []) {
  const grouped = new Map();
  for (const entry of nodeEntries) {
    const segment = SEGMENT_META[entry?.node?.segment] || SEGMENT_META.basic;
    if (!grouped.has(segment.key)) grouped.set(segment.key, []);
    grouped.get(segment.key).push(entry);
  }

  return FORGE_TALENT_SEGMENT_ORDER
    .map(segmentKey => {
      const segment = SEGMENT_META[segmentKey] || SEGMENT_META.basic;
      const entries = grouped.get(segmentKey) || [];
      return {
        segmentKey,
        label: segment.label.replace(" · ", " - "),
        entries: [...entries].sort((a, b) => (a.node.x || 0) - (b.node.x || 0) || (a.node.y || 0) - (b.node.y || 0)),
        activeCount: entries.filter(entry => entry.nodeState.currentLevel > 0).length,
        totalCount: entries.length,
        levelCount: entries.reduce((total, entry) => total + entry.nodeState.currentLevel, 0),
        maxLevelCount: entries.reduce((total, entry) => total + entry.nodeState.maxLevel, 0),
        actionableCount: entries.filter(entry => entry.nodeState.canUnlockNext).length,
      };
    })
    .filter(segment => segment.entries.length > 0);
}

function getDefaultSelectedTalentEntry(nodeEntries = []) {
  return (
    nodeEntries.find(entry => entry.nodeState.canUnlockNext) ||
    nodeEntries.find(entry => entry.nodeState.currentLevel > 0) ||
    nodeEntries[0] ||
    null
  );
}

function getForgeSegmentSummary(segment) {
  if (!segment) return "";
  return `${segment.levelCount}/${segment.maxLevelCount || 0} niveles · ${segment.actionableCount} comprable${segment.actionableCount === 1 ? "" : "s"}`;
}

function getForgeSegmentShortLabel(label = "") {
  return label.replace(/^Tramo\s+/i, "T").replace("Basicos", "Basico");
}

function getNodeStateLabel(nodeState) {
  if (nodeState.isMaxed) return "Max";
  if (nodeState.canUnlockNext) return "Comprable";
  if (nodeState.currentLevel > 0) return "Activo";
  return "Bloqueado";
}

function getNodeStateTone(nodeState) {
  if (nodeState.isMaxed) return "maxed";
  if (nodeState.canUnlockNext) return "ready";
  if (nodeState.currentLevel > 0) return "active";
  return "locked";
}

function ForgeTalentNodeButton({
  entry,
  isSelected,
  justUnlocked,
  spotlight,
  onSelect,
}) {
  const { node, nodeState } = entry;
  const tone = getNodeStateTone(nodeState);
  const className = [
    "forge-talent-node",
    `forge-talent-node--${tone}`,
    isSelected ? "forge-talent-node--selected" : "",
    justUnlocked ? "forge-talent-node--just-unlocked" : "",
    spotlight ? "forge-talent-node--spotlight" : "",
    (nodeState.activeTalent?.tags || []).includes("keystone") ? "forge-talent-node--keystone" : "",
  ].filter(Boolean).join(" ");

  return (
    <FlTalentNode
      className={className}
      talentId={node.talent.id}
      icon={getTalentIconName(node, nodeState)}
      state={tone}
      selected={isSelected}
      level={nodeState.currentLevel}
      maxLevel={nodeState.maxLevel}
      keystone={(nodeState.activeTalent?.tags || []).includes("keystone")}
      spotlight={spotlight}
      onClick={onSelect}
      data-onboarding-node-id={node.talent.id}
      data-onboarding-target={spotlight ? "buy-talent-card" : undefined}
      title={`${getNodeTitle(node)} - ${getNodeStateLabel(nodeState)}`}
    />
  );
}

function ForgeTalentTreeGrid({
  segments,
  selectedNodeId,
  recentUnlocks,
  spotlightTalentPurchase,
  resolvedTutorialTalentNodeId,
  onSelect,
}) {
  return (
    <div className="forge-talent-grid" role="list" aria-label="Arbol visual de talentos por tramos">
      {segments.map(segment => {
        const slotCount = Math.max(3, segment.entries.length);
        const columnClassName = [
          "forge-talent-node-column",
          slotCount >= 4 ? "forge-talent-node-column--grid" : "forge-talent-node-column--triad",
        ].join(" ");
        return (
          <section key={segment.segmentKey} className="forge-talent-segment" role="listitem">
            <div className="forge-talent-segment-header">
              <span>{getForgeSegmentShortLabel(segment.label)}</span>
              <strong>{segment.activeCount}/{segment.totalCount}</strong>
            </div>
            <div className="forge-talent-segment-subtitle">{getForgeSegmentSummary(segment)}</div>
            <div className={columnClassName}>
              {Array.from({ length: slotCount }).map((_, index) => {
                const entry = segment.entries[index] || null;
                if (!entry) {
                  return (
                    <div key={`empty-${segment.segmentKey}-${index}`} className="forge-talent-node-cell forge-talent-node-cell--empty">
                      <span />
                    </div>
                  );
                }

                const nodeId = entry.node.talent.id;
                const spotlight = spotlightTalentPurchase && nodeId === resolvedTutorialTalentNodeId;
                return (
                  <div key={nodeId} className="forge-talent-node-cell">
                    <ForgeTalentNodeButton
                      entry={entry}
                      isSelected={nodeId === selectedNodeId}
                      justUnlocked={!!recentUnlocks[nodeId]}
                      spotlight={spotlight}
                      onSelect={() => onSelect(nodeId)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ForgeTalentDetailPanel({
  entry,
  state,
  nodes,
  dispatch,
  spotlight,
}) {
  if (!entry) return null;

  const { node, nodeState } = entry;
  const displayType = getTalentDisplayType(nodeState.activeTalent);
  const prereqText = buildNodeRequirementText(state, node, nodes, nodeState);
  const currentSummary = buildTalentEffectSummary(nodeState.activeTalent || node.talent);
  const nextSummary = nodeState.nextTalent ? buildTalentEffectSummary(nodeState.nextTalent) : "";
  const canUpgrade = nodeState.canUnlockNext && !!nodeState.nextTalent;
  const requirementLabel = getForgeRequirementLabel(state, nodeState, prereqText);
  const typeLabel = displayType === "passive" ? "Pasiva" : displayType === "triggered" ? "Reactiva" : displayType;
  const actionLabel = nodeState.isMaxed ? "MAX" : canUpgrade ? "COMPRAR" : "BLOQUEADO";

  return (
    <article className="forge-talent-detail-panel">
      <FlIconFrame
        size="lg"
        asset={getTalentAsset(node.talent.id)}
        kind="talent"
        fallbackIcon={getTalentIconName(node, nodeState)}
        selected={canUpgrade}
        className="forge-talent-detail-icon"
        aria-hidden="true"
      />
      <div className="forge-talent-detail-copy">
        <div className="forge-talent-detail-title">{getNodeTitle(node)}</div>
        <div className="forge-talent-detail-meta">
          <span className={`forge-talent-detail-pill forge-talent-detail-pill--${getNodeStateTone(nodeState)}`}>
            {typeLabel}
          </span>
          <span className="forge-talent-detail-pill">Nivel {nodeState.currentLevel}/{nodeState.maxLevel}</span>
        </div>
        <p>{buildTalentDescription(nodeState.activeTalent || node.talent)}</p>
        <div className="forge-talent-detail-lines">
          <span>Base: {currentSummary}</span>
          {!nodeState.isMaxed && nodeState.nextTalent && <span>Proximo nivel: {nextSummary}</span>}
          {prereqText && <span className="forge-talent-detail-req">{prereqText}</span>}
        </div>
      </div>
      <div className="forge-talent-detail-action">
        <span>Requisitos</span>
        <strong
          className={[
            "forge-talent-detail-requirement-value",
            !canUpgrade && !nodeState.isMaxed ? "forge-talent-detail-requirement-value--blocked" : "",
          ].filter(Boolean).join(" ")}
          title={requirementLabel}
        >
          {requirementLabel}
        </strong>
        <FlButton
          type="button"
          variant={canUpgrade ? "secondary" : "ghost"}
          size="sm"
          className={[
            "forge-talent-buy-button",
            canUpgrade ? "forge-talent-buy-button--ready" : "forge-talent-buy-button--disabled",
          ].filter(Boolean).join(" ")}
          onClick={() => dispatch({ type: "UPGRADE_TALENT_NODE", nodeId: node.talent.id })}
          disabled={!canUpgrade}
          data-onboarding-target={spotlight ? "buy-talent" : undefined}
        >
          {actionLabel}
        </FlButton>
      </div>
    </article>
  );
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

function getForgeRequirementLabel(state, nodeState, prereqText = "") {
  if (nodeState.isMaxed) return "Completo";
  if (!nodeState.nextTalent) return "Sin mejoras";
  if (prereqText) return prereqText.replace(/\s*\n\s*/g, " · ");

  const nextCost = Math.max(0, Number(nodeState.nextCost || 0));
  const availableTalentPoints = Math.max(0, Number(state?.player?.talentPoints || 0));
  if (availableTalentPoints < nextCost) {
    return `Faltan ${nextCost - availableTalentPoints} TP`;
  }

  return `${nextCost} TP`;
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
  stitchTrialEnabled = false,
}) {
  const displayType = getTalentDisplayType(nodeState.activeTalent);
  const isUnlocked = nodeState.currentLevel > 0;
  const canUpgrade = nodeState.canUnlockNext && !!nodeState.nextTalent;
  const isKeystone = (nodeState.activeTalent?.tags || []).includes("keystone");
  const currentSummary = buildTalentEffectSummary(nodeState.activeTalent || node.talent);
  const nextSummary = nodeState.nextTalent ? buildTalentEffectSummary(nodeState.nextTalent) : "";
  const compactButtonLabel = getNodeActionLabel(nodeState, true);
  const nodeCardClassName = [
    "talents-node-card",
    compact ? "talents-node-card--compact" : "talents-node-card--full",
    isUnlocked ? "talents-node-card--unlocked" : "talents-node-card--locked",
    canUpgrade ? "talents-node-card--ready" : "",
    nodeState.allRequirementsMet ? "talents-node-card--requirements-met" : "talents-node-card--requirements-blocked",
    justUnlocked ? "talents-node-card--just-unlocked" : "",
    spotlight ? "talents-node-card--spotlight" : "",
    isKeystone ? "talents-node-card--keystone" : "",
  ].filter(Boolean).join(" ");
  const nodeCtaClassName = [
    "forge-talent-buy-button",
    canUpgrade ? "forge-talent-buy-button--ready" : "forge-talent-buy-button--disabled",
    spotlight ? "forge-talent-buy-button--spotlight" : "",
  ].filter(Boolean).join(" ");
  const nodeTypeClassName = [
    "talents-node-type",
    `talents-node-type--${displayType}`,
  ].join(" ");
  const compactNodeHeaderClassName = [
    "talents-node-header",
    "talents-node-header--compact",
  ].join(" ");
  const fullNodeHeaderClassName = [
    "talents-node-header",
    "talents-node-header--full",
  ].join(" ");
  const nodeRequirementsClassName = [
    "talents-node-requirements",
    nodeState.allRequirementsMet ? "talents-node-requirements--ok" : "talents-node-requirements--blocked",
  ].join(" ");
  const upgradeHintClassName = [
    "talents-node-upgrade-hint",
    nodeState.isMaxed ? "talents-node-upgrade-hint--maxed" : "",
  ].filter(Boolean).join(" ");
  const nodeStyleProps = {
    style: {
      "--talents-node-z-index": spotlight ? 2 : 1,
    },
  };
  const spotlightProps = spotlight
    ? { "data-talents-spotlight": stitchTrialEnabled ? "stitch" : "default" }
    : {};
  const justUnlockedProps = justUnlocked
    ? { "data-talents-unlocked-effect": stitchTrialEnabled ? "stitch" : "default" }
    : {};

  if (compact) {
    return (
      <article
        className={nodeCardClassName}
        data-onboarding-node-id={node.talent.id}
        data-onboarding-target={spotlight ? "buy-talent-card" : undefined}
        {...nodeStyleProps}
        {...spotlightProps}
        {...justUnlockedProps}
      >
        <div className={compactNodeHeaderClassName}>
          <div className="talents-node-header-copy">
            <div className="talents-node-title talents-node-title--compact">
              {getNodeTitle(node)}
            </div>
            <div className="talents-node-tier talents-node-tier--compact">{nodeState.tierLabel}</div>
          </div>
          <FlButton
            className={nodeCtaClassName}
            onClick={() => dispatch({ type: "UPGRADE_TALENT_NODE", nodeId: node.talent.id })}
            disabled={!canUpgrade}
            data-onboarding-target={spotlight ? "buy-talent" : undefined}
            variant={nodeState.isMaxed ? "success" : canUpgrade ? "default" : "secondary"}
            size="xs"
          >
            {compactButtonLabel}
          </FlButton>
        </div>

        <div className="talents-node-chips">
          {isKeystone && (
            <div className="talents-node-pill talents-node-pill--danger">
              Keystone
            </div>
          )}
          <div className={nodeTypeClassName}>{displayType.toUpperCase()}</div>
          {canUpgrade && (
            <div className="talents-node-pill talents-node-pill--success">
              Disponible
            </div>
          )}
          <div className="talents-node-pill talents-node-pill--arcane">
            LV {nodeState.currentLevel}/{nodeState.maxLevel}
          </div>
        </div>

        <div className="talents-node-description talents-node-description--compact">
          {buildTalentDescription(nodeState.activeTalent || node.talent)}
        </div>

        <div className="talents-node-summary talents-node-summary--current">
          {nodeState.currentLevel > 0 ? `Actual: ${currentSummary}` : `Base: ${currentSummary}`}
        </div>
        {!nodeState.isMaxed && nodeState.nextTalent && (
          <div className="talents-node-summary talents-node-summary--next">
            {`Proximo: ${nextSummary}`}
          </div>
        )}

        {prereqText && (
          <div className={nodeRequirementsClassName}>
            {prereqText}
          </div>
        )}
      </article>
    );
  }

  return (
    <div
      className={nodeCardClassName}
      data-onboarding-node-id={node.talent.id}
      data-onboarding-target={spotlight ? "buy-talent-card" : undefined}
      {...nodeStyleProps}
      {...spotlightProps}
      {...justUnlockedProps}
    >
      <div className={fullNodeHeaderClassName}>
        <div className="talents-node-header-copy">
          <div className={["talents-node-title", isMobile ? "talents-node-title--mobile" : ""].filter(Boolean).join(" ")}>
            {getNodeTitle(node)}
          </div>
          <div className={["talents-node-tier", isMobile ? "talents-node-tier--mobile" : ""].filter(Boolean).join(" ")}>{nodeState.tierLabel}</div>
        </div>
        <div className="talents-node-chips talents-node-chips--end">
          {canUpgrade && <div className="talents-node-pill talents-node-pill--success">Disponible</div>}
          {isKeystone && <div className="talents-node-pill talents-node-pill--danger">Keystone</div>}
          <div className={nodeTypeClassName}>{displayType.toUpperCase()}</div>
        </div>
      </div>

      <div className={["talents-node-description", isMobile ? "talents-node-description--mobile" : ""].filter(Boolean).join(" ")}>
        {buildTalentDescription(nodeState.activeTalent || node.talent)}
      </div>

      <div className={upgradeHintClassName}>
        <div className="talents-node-upgrade-eyebrow">
          {nodeState.currentLevel > 0 ? `Actual ${nodeState.currentLevel}/${nodeState.maxLevel}` : "Base"}
        </div>
        <div className={["talents-node-upgrade-value", isMobile ? "talents-node-upgrade-value--mobile" : ""].filter(Boolean).join(" ")}>
          {currentSummary}
        </div>
        {!nodeState.isMaxed && nodeState.nextTalent && (
          <div className="talents-node-upgrade-next">
            <div className="talents-node-upgrade-next-eyebrow">
              Proximo nivel
            </div>
            <div className={["talents-node-upgrade-next-value", isMobile ? "talents-node-upgrade-next-value--mobile" : ""].filter(Boolean).join(" ")}>
              {nextSummary}
            </div>
          </div>
        )}
      </div>

      {prereqText && (
        <div className={nodeRequirementsClassName}>
          {prereqText}
        </div>
      )}

      <FlButton
        className={nodeCtaClassName}
        onClick={() => dispatch({ type: "UPGRADE_TALENT_NODE", nodeId: node.talent.id })}
        disabled={!canUpgrade}
        data-onboarding-target={spotlight ? "buy-talent" : undefined}
        variant={nodeState.isMaxed ? "success" : canUpgrade ? "default" : "secondary"}
        size="sm"
      >
        {getNodeActionLabel(nodeState)}
      </FlButton>
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
  const [selectedTalentNodeId, setSelectedTalentNodeId] = useState(null);
  const [recentUnlocks, setRecentUnlocks] = useState({});
  const [canScrollTreesLeft, setCanScrollTreesLeft] = useState(false);
  const [canScrollTreesRight, setCanScrollTreesRight] = useState(false);
  const onboardingStep = state?.onboarding?.step || null;
  const spotlightTalentPurchase = onboardingStep === ONBOARDING_STEPS.BUY_TALENT;
  const stitchTrialEnabled = useMemo(() => isTalentsStitchTrialEnabled(), []);
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
  const forgeTalentSegments = useMemo(
    () => getForgeTalentSegments(selectedTreeNodeEntries),
    [selectedTreeNodeEntries]
  );
  const selectedTreeBuyableNodes = useMemo(
    () => selectedTreeNodeEntries.filter(entry => entry.nodeState.canUnlockNext).map(entry => entry.node),
    [selectedTreeNodeEntries]
  );
  const selectedTalentEntry = useMemo(() => {
    return (
      selectedTreeNodeEntries.find(entry => entry.node.talent.id === selectedTalentNodeId) ||
      getDefaultSelectedTalentEntry(selectedTreeNodeEntries)
    );
  }, [selectedTalentNodeId, selectedTreeNodeEntries]);
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
  useEffect(() => {
    if (selectedTreeNodeEntries.length === 0) {
      if (selectedTalentNodeId != null) setSelectedTalentNodeId(null);
      return;
    }

    const tutorialEntry = spotlightTalentPurchase && resolvedTutorialTalentNodeId
      ? selectedTreeNodeEntries.find(entry => entry.node.talent.id === resolvedTutorialTalentNodeId)
      : null;
    const selectedStillExists = selectedTreeNodeEntries.some(entry => entry.node.talent.id === selectedTalentNodeId);
    const nextEntry = tutorialEntry || (selectedStillExists ? null : getDefaultSelectedTalentEntry(selectedTreeNodeEntries));

    if (nextEntry && nextEntry.node.talent.id !== selectedTalentNodeId) {
      setSelectedTalentNodeId(nextEntry.node.talent.id);
    }
  }, [resolvedTutorialTalentNodeId, selectedTalentNodeId, selectedTreeNodeEntries, spotlightTalentPurchase]);
  const totalPurchasedTalentNodes = Object.values(talentLevels || {}).filter(value => Number(value) > 0).length || unlockedTalents.length;
  const treeHeaderStickyTop = "var(--app-header-offset, 96px)";
  const talentsRootClassName = [
    "talents-root",
    "talents-root--forge-light",
  ].filter(Boolean).join(" ");

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
      <div className="talents-empty-state">
        <h2 className="talents-empty-state__title">CLASE REQUERIDA</h2>
        <p className="talents-empty-state__copy">Elegi una clase para ver tus talentos disponibles.</p>
      </div>
    );
  }

  return (
    <div className={[talentsRootClassName, "talents-root-shell"].join(" ")}>
      <div className="talents-header-stack">
        <header className="talents-header">
          <div className="talents-header-main">
            <span className="talents-header-emblem" aria-hidden="true">
              <ForgeIcon name={getTreeIconName(selectedTree?.tree, playerClass)} size={32} />
            </span>
            <div>
              <div className="talents-header-eyebrow">Talentos</div>
              <div className="talents-header-title">{toTitleCaseLabel(playerClass)} {playerSpec && `- ${toTitleCaseLabel(playerSpec)}`}</div>
            </div>
          </div>
          <FlTalentPointCounter
            value={talentPoints}
            invested={totalPurchasedTalentNodes}
            className="talents-header-stats"
          />
        </header>

        {treeData.length > 1 && (
          <section className="talents-tabs-section">
            <div className="talents-tree-tabs" ref={treeTabsScrollerRef}>
              {treeData.map(({ tree, progress, nodes }) => {
                const active = tree.id === selectedTreeId;
                return (
                  <FlButton
                    className="talents-tree-switch"
                    key={tree.id}
                    onClick={() => setSelectedTreeId(tree.id)}
                    selected={active}
                    variant={active ? "default" : "secondary"}
                    size="sm"
                  >
                    <span className="talents-tree-switch__content">
                      <span className="talents-tree-switch__name">{tree.name}</span>
                      {tree.isOffSpec && (
                        <span className="talents-tree-switch__meta talents-tree-switch__meta--warning">
                          Secundario x{OFF_SPEC_COST_MULTIPLIER}
                        </span>
                      )}
                      <span className="talents-tree-switch__meta">{progress}/{nodes.length}</span>
                    </span>
                  </FlButton>
                );
              })}
            </div>
            {canScrollTreesLeft && <div className="talents-tree-tabs-fade talents-tree-tabs-fade--left" />}
            {canScrollTreesRight && <div className="talents-tree-tabs-fade talents-tree-tabs-fade--right" />}
            {canScrollTreesLeft && <div className="talents-tree-tabs-hint talents-tree-tabs-hint--left">←</div>}
            {canScrollTreesRight && <div className="talents-tree-tabs-hint talents-tree-tabs-hint--right">→</div>}
          </section>
        )}
      </div>

      {visibleTrees.map(({ tree, nodes, progress }) => (
        <section key={tree.id} className="talents-tree-section">
          <div
            className="talents-tree-toolbar-wrap"
            data-onboarding-top-guard={spotlightTalentPurchase ? "true" : undefined}
            style={{ "--talents-toolbar-sticky-top": treeHeaderStickyTop }}
          >
            <div
              className="talents-tree-toolbar"
              style={{ "--talents-tree-accent": TREE_COLORS[tree.id] || "var(--fl-text-primary)" }}
            >
              <div>
                <div className="talents-tree-toolbar-row">
                  <div className="talents-tree-toolbar-title">{tree.name}</div>
                  {tree.isOffSpec && (
                    <span className="talents-tree-toolbar-chip talents-tree-toolbar-chip--warning">
                      SECUNDARIO x{OFF_SPEC_COST_MULTIPLIER}
                    </span>
                  )}
                  {selectedTreeBuyableNodes.length > 0 && (
                    <span className="talents-tree-toolbar-chip talents-tree-toolbar-chip--success">
                      {selectedTreeBuyableNodes.length} disponibles
                    </span>
                  )}
                </div>
                <div className="talents-tree-description">
                  {tree.description}
                </div>
              </div>
              <div className="talents-tree-toolbar-side">
                <div className="talents-tree-actions">
                  <div className="talents-tree-progress-summary">{progress}/{nodes.length}</div>
                  {progress > 0 && (
                    <FlButton
                      className="talents-reset-btn talents-reset-btn--tree"
                      onClick={() => dispatch({ type: "RESET_TALENT_TREE", treeId: tree.id })}
                      variant="destructive"
                      size="sm"
                    >
                      Reiniciar
                    </FlButton>
                  )}
                </div>
              </div>
            </div>
          </div>
 
          <div className="talents-tree-body">
          <div className={["forge-talents-panel", isMobile ? "forge-talents-panel--mobile" : "forge-talents-panel--desktop"].join(" ")}>
              <ForgeTalentTreeGrid
                segments={forgeTalentSegments}
                selectedNodeId={selectedTalentEntry?.node?.talent?.id || null}
                recentUnlocks={recentUnlocks}
                spotlightTalentPurchase={spotlightTalentPurchase}
                resolvedTutorialTalentNodeId={resolvedTutorialTalentNodeId}
                onSelect={setSelectedTalentNodeId}
              />
              <ForgeTalentDetailPanel
                entry={selectedTalentEntry}
                state={state}
                nodes={nodes}
                dispatch={dispatch}
                spotlight={
                  spotlightTalentPurchase &&
                  selectedTalentEntry?.node?.talent?.id === resolvedTutorialTalentNodeId
                }
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
