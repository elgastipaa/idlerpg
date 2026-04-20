// engine/progression/progressionEngine.js

import { refreshStats } from "../combat/statEngine";
import { CLASSES } from "../../data/classes";
import { PLAYER_UPGRADES } from "../../data/playerUpgrades";
import { TALENTS } from "../../data/talents";
import { canUnlockTalentNode, getProgressValue, getTalentCostForPlayer } from "../talents/treeEngine";
import { canUnlockNode, getNextTalentForNode } from "../talents/talentTreeEngine";
import { syncPrestigeBonuses } from "./prestigeEngine";
import {
  deriveTalentLevelsFromUnlockedTalents,
  TALENT_SYSTEM_VERSION,
} from "../migrations/talentsV2Migration";

const CRIT_CAP         = 0.75;
const ATTACK_SPEED_CAP = 0.70;

// ============================================================
// HELPERS
// ============================================================

function applyStat(p, stat, valuePerLevel) {
  switch (stat) {
    case "damage":
      p.damagePct = (p.damagePct || 0) + valuePerLevel;
      break;

    case "maxHp":
      p.hpPct = (p.hpPct || 0) + valuePerLevel;
      break;

    case "critChance":
      p.flatCrit = Math.min(CRIT_CAP, (p.flatCrit || 0) + valuePerLevel);
      break;

    case "goldBonus":
      p.flatGold = (p.flatGold || 0) + valuePerLevel;
      break;

    case "xpBonus":
      p.xpPct = (p.xpPct || 0) + valuePerLevel;
      break;

    case "attackSpeed":
      p.attackSpeed = Math.min(ATTACK_SPEED_CAP, (p.attackSpeed || 0) + valuePerLevel);
      break;
  }
}

function getTalentAuraEffects(talent) {
  return [talent?.effect, ...(talent?.extraEffects || [])].filter(Boolean);
}

function applyTalentAura(p, talent) {
  for (const effect of getTalentAuraEffects(talent)) {
    const { stat, multiplier, flat, ratio } = effect;

    switch (stat) {
      case "damage":
        p.damagePct = (p.damagePct || 0) + (multiplier ? multiplier - 1 : flat || 0);
        break;

      case "defense":
        p.flatDefense = (p.flatDefense || 0) + (flat || 0);
        p.defensePct = (p.defensePct || 0) + (multiplier ? multiplier - 1 : 0);
        break;

      case "maxHp":
        p.hpPct = (p.hpPct || 0) + (multiplier ? multiplier - 1 : 0);
        break;

      case "critChance":
        p.flatCrit = Math.min(CRIT_CAP, (p.flatCrit || 0) + (flat || 0));
        break;

      case "critDamage":
        p.critDamage = (p.critDamage || 0) + (flat || 0);
        break;

      case "goldBonus":
        p.flatGold = (p.flatGold || 0) + (flat || 0);
        break;

      case "xpBonus":
        p.xpPct = (p.xpPct || 0) + (multiplier ? multiplier - 1 : flat || 0);
        break;

      case "regen":
        p.flatRegen = (p.flatRegen || 0) + (flat || 0);
        p.regenPctMaxHp = (p.regenPctMaxHp || 0) + (ratio || 0);
        break;

      case "lifesteal":
        p.lifesteal = (p.lifesteal || 0) + (flat || 0);
        break;

      case "multiHitChance":
        p.multiHitChance = (p.multiHitChance || 0) + (flat || 0);
        break;

      case "bleedChance":
        p.bleedChance = (p.bleedChance || 0) + (flat || 0);
        break;

      case "bleedDamage":
        p.bleedDamage = (p.bleedDamage || 0) + (flat || 0);
        break;

      case "fractureChance":
        p.fractureChance = (p.fractureChance || 0) + (flat || 0);
        break;

      case "blockChance":
        p.blockChance = (p.blockChance || 0) + (flat || 0);
        break;

      case "thorns":
        p.thorns = (p.thorns || 0) + (flat || 0);
        p.thornsDefenseRatio = (p.thornsDefenseRatio || 0) + (ratio || 0);
        break;

      case "ironConversion":
        p.ironConversion = (p.ironConversion || 0) + (flat || 0);
        break;

      case "battleHardened":
        p.battleHardened = (p.battleHardened || 0) + (flat || 0);
        break;

      case "heavyImpact":
        p.heavyImpact = (p.heavyImpact || 0) + (flat || 0);
        break;

      case "bloodStrikes":
        p.bloodStrikes = (p.bloodStrikes || 0) + (flat || 0);
        break;

      case "combatFlow":
        p.combatFlow = (p.combatFlow || 0) + (flat || 0);
        break;

      case "crushingWeight":
        p.crushingWeight = (p.crushingWeight || 0) + (flat || 0);
        break;

      case "frenziedChain":
        p.frenziedChain = (p.frenziedChain || 0) + (flat || 0);
        break;

      case "bloodDebt":
        p.bloodDebt = (p.bloodDebt || 0) + (flat || 0);
        break;

      case "lastBreath":
        p.lastBreath = (p.lastBreath || 0) + (flat || 0);
        break;

      case "execution":
        p.execution = (p.execution || 0) + (flat || 0);
        break;

      case "ironCore":
        p.ironCore = (p.ironCore || 0) + (flat || 0);
        break;

      case "fortress":
        p.fortress = (p.fortress || 0) + (flat || 0);
        break;

      case "unmovingMountain":
        p.unmovingMountain = (p.unmovingMountain || 0) + (flat || 0);
        break;

      case "titanicMomentum":
        p.titanicMomentum = (p.titanicMomentum || 0) + (flat || 0);
        break;

      case "arcaneEcho":
        p.arcaneEcho = (p.arcaneEcho || 0) + (flat || 0);
        break;

      case "arcaneMark":
        p.arcaneMark = (p.arcaneMark || 0) + (flat || 0);
        break;

      case "arcaneFlow":
        p.arcaneFlow = (p.arcaneFlow || 0) + (flat || 0);
        break;

      case "overchannel":
        p.overchannel = (p.overchannel || 0) + (flat || 0);
        break;

      case "perfectCast":
        p.perfectCast = (p.perfectCast || 0) + (flat || 0);
        break;

      case "freshTargetDamage":
        p.freshTargetDamage = (p.freshTargetDamage || 0) + (flat || 0);
        break;

      case "chainBurst":
        p.chainBurst = (p.chainBurst || 0) + (flat || 0);
        break;

      case "unstablePower":
        p.unstablePower = (p.unstablePower || 0) + (flat || 0);
        break;

      case "overload":
        p.overload = (p.overload || 0) + (flat || 0);
        break;

      case "volatileCasting":
        p.volatileCasting = (p.volatileCasting || 0) + (flat || 0);
        break;

      case "controlMastery":
        p.controlMastery = (p.controlMastery || 0) + (flat || 0);
        break;

      case "markTransfer":
        p.markTransfer = (p.markTransfer || 0) + (flat || 0);
        break;

      case "temporalFlow":
        p.temporalFlow = (p.temporalFlow || 0) + (flat || 0);
        break;

      case "spellMemory":
        p.spellMemory = (p.spellMemory || 0) + (flat || 0);
        break;

      case "timeLoop":
        p.timeLoop = (p.timeLoop || 0) + (flat || 0);
        break;

      case "absoluteControl":
        p.absoluteControl = (p.absoluteControl || 0) + (flat || 0);
        break;

      case "cataclysm":
        p.cataclysm = (p.cataclysm || 0) + (flat || 0);
        break;
    }
  }
}

function removeTalentAura(p, talent) {
  for (const effect of getTalentAuraEffects(talent)) {
    const { stat, multiplier, flat, ratio } = effect;

    switch (stat) {
      case "damage":
        p.damagePct = (p.damagePct || 0) - (multiplier ? multiplier - 1 : flat || 0);
        break;

      case "defense":
        p.flatDefense = (p.flatDefense || 0) - (flat || 0);
        p.defensePct = (p.defensePct || 0) - (multiplier ? multiplier - 1 : 0);
        break;

      case "maxHp":
        p.hpPct = (p.hpPct || 0) - (multiplier ? multiplier - 1 : 0);
        break;

      case "critChance":
        p.flatCrit = Math.min(CRIT_CAP, (p.flatCrit || 0) - (flat || 0));
        break;

      case "critDamage":
        p.critDamage = (p.critDamage || 0) - (flat || 0);
        break;

      case "goldBonus":
        p.flatGold = (p.flatGold || 0) - (flat || 0);
        break;

      case "xpBonus":
        p.xpPct = (p.xpPct || 0) - (multiplier ? multiplier - 1 : flat || 0);
        break;

      case "regen":
        p.flatRegen = (p.flatRegen || 0) - (flat || 0);
        p.regenPctMaxHp = (p.regenPctMaxHp || 0) - (ratio || 0);
        break;

      case "lifesteal":
        p.lifesteal = (p.lifesteal || 0) - (flat || 0);
        break;

      case "multiHitChance":
        p.multiHitChance = (p.multiHitChance || 0) - (flat || 0);
        break;

      case "bleedChance":
        p.bleedChance = (p.bleedChance || 0) - (flat || 0);
        break;

      case "bleedDamage":
        p.bleedDamage = (p.bleedDamage || 0) - (flat || 0);
        break;

      case "fractureChance":
        p.fractureChance = (p.fractureChance || 0) - (flat || 0);
        break;

      case "blockChance":
        p.blockChance = (p.blockChance || 0) - (flat || 0);
        break;

      case "thorns":
        p.thorns = (p.thorns || 0) - (flat || 0);
        p.thornsDefenseRatio = (p.thornsDefenseRatio || 0) - (ratio || 0);
        break;

      case "ironConversion":
        p.ironConversion = (p.ironConversion || 0) - (flat || 0);
        break;

      case "battleHardened":
        p.battleHardened = (p.battleHardened || 0) - (flat || 0);
        break;

      case "heavyImpact":
        p.heavyImpact = (p.heavyImpact || 0) - (flat || 0);
        break;

      case "bloodStrikes":
        p.bloodStrikes = (p.bloodStrikes || 0) - (flat || 0);
        break;

      case "combatFlow":
        p.combatFlow = (p.combatFlow || 0) - (flat || 0);
        break;

      case "crushingWeight":
        p.crushingWeight = (p.crushingWeight || 0) - (flat || 0);
        break;

      case "frenziedChain":
        p.frenziedChain = (p.frenziedChain || 0) - (flat || 0);
        break;

      case "bloodDebt":
        p.bloodDebt = (p.bloodDebt || 0) - (flat || 0);
        break;

      case "lastBreath":
        p.lastBreath = (p.lastBreath || 0) - (flat || 0);
        break;

      case "execution":
        p.execution = (p.execution || 0) - (flat || 0);
        break;

      case "ironCore":
        p.ironCore = (p.ironCore || 0) - (flat || 0);
        break;

      case "fortress":
        p.fortress = (p.fortress || 0) - (flat || 0);
        break;

      case "unmovingMountain":
        p.unmovingMountain = (p.unmovingMountain || 0) - (flat || 0);
        break;

      case "titanicMomentum":
        p.titanicMomentum = (p.titanicMomentum || 0) - (flat || 0);
        break;

      case "arcaneEcho":
        p.arcaneEcho = (p.arcaneEcho || 0) - (flat || 0);
        break;

      case "arcaneMark":
        p.arcaneMark = (p.arcaneMark || 0) - (flat || 0);
        break;

      case "arcaneFlow":
        p.arcaneFlow = (p.arcaneFlow || 0) - (flat || 0);
        break;

      case "overchannel":
        p.overchannel = (p.overchannel || 0) - (flat || 0);
        break;

      case "perfectCast":
        p.perfectCast = (p.perfectCast || 0) - (flat || 0);
        break;

      case "freshTargetDamage":
        p.freshTargetDamage = (p.freshTargetDamage || 0) - (flat || 0);
        break;

      case "chainBurst":
        p.chainBurst = (p.chainBurst || 0) - (flat || 0);
        break;

      case "unstablePower":
        p.unstablePower = (p.unstablePower || 0) - (flat || 0);
        break;

      case "overload":
        p.overload = (p.overload || 0) - (flat || 0);
        break;

      case "volatileCasting":
        p.volatileCasting = (p.volatileCasting || 0) - (flat || 0);
        break;

      case "controlMastery":
        p.controlMastery = (p.controlMastery || 0) - (flat || 0);
        break;

      case "markTransfer":
        p.markTransfer = (p.markTransfer || 0) - (flat || 0);
        break;

      case "temporalFlow":
        p.temporalFlow = (p.temporalFlow || 0) - (flat || 0);
        break;

      case "spellMemory":
        p.spellMemory = (p.spellMemory || 0) - (flat || 0);
        break;

      case "timeLoop":
        p.timeLoop = (p.timeLoop || 0) - (flat || 0);
        break;

      case "absoluteControl":
        p.absoluteControl = (p.absoluteControl || 0) - (flat || 0);
        break;

      case "cataclysm":
        p.cataclysm = (p.cataclysm || 0) - (flat || 0);
        break;
    }
  }
}

function isAlwaysPassiveTalent(talent) {
  return !!talent && (talent.type === "aura" || (talent.type === "passive" && talent.trigger?.stat === "always"));
}

function resetCoreProgressionBonuses(player) {
  return {
    ...player,
    damagePct: 0,
    flatDamage: 0,
    defensePct: 0,
    flatDefense: 0,
    hpPct: 0,
    flatRegen: 0,
    regenPctMaxHp: 0,
    flatCrit: 0,
    critDamage: 0,
    flatGold: 0,
    goldPct: 0,
    xpPct: 0,
    attackSpeed: 0,
    lifesteal: 0,
    blockChance: 0,
    thorns: 0,
    thornsDefenseRatio: 0,
    multiHitChance: 0,
    bleedChance: 0,
    bleedDamage: 0,
    fractureChance: 0,
    battleHardened: 0,
    heavyImpact: 0,
    bloodStrikes: 0,
    combatFlow: 0,
    ironConversion: 0,
    crushingWeight: 0,
    frenziedChain: 0,
    bloodDebt: 0,
    lastBreath: 0,
    execution: 0,
    ironCore: 0,
    fortress: 0,
    unmovingMountain: 0,
    titanicMomentum: 0,
    arcaneEcho: 0,
    arcaneMark: 0,
    arcaneFlow: 0,
    overchannel: 0,
    perfectCast: 0,
    freshTargetDamage: 0,
    chainBurst: 0,
    unstablePower: 0,
    overload: 0,
    volatileCasting: 0,
    controlMastery: 0,
    markTransfer: 0,
    temporalFlow: 0,
    spellMemory: 0,
    timeLoop: 0,
    absoluteControl: 0,
    cataclysm: 0,
  };
}

export function rebuildPlayerProgressionBonuses(player = {}) {
  let nextPlayer = resetCoreProgressionBonuses(player);

  const upgrades = nextPlayer.upgrades || {};
  for (const upgrade of PLAYER_UPGRADES) {
    const level = Math.max(0, Number(upgrades[upgrade.id] || 0));
    for (let idx = 0; idx < level; idx += 1) {
      applyStat(nextPlayer, upgrade.stat, upgrade.valuePerLevel);
    }
  }

  const unlockedTalents = nextPlayer.unlockedTalents || [];
  const replacingTalentIds = new Set(
    TALENTS
      .filter(talent => unlockedTalents.includes(talent.id) && talent.replaces)
      .flatMap(talent => (Array.isArray(talent.replaces) ? talent.replaces : [talent.replaces]))
  );

  TALENTS
    .filter(talent =>
      unlockedTalents.includes(talent.id) &&
      !replacingTalentIds.has(talent.id) &&
      isAlwaysPassiveTalent(talent)
    )
    .forEach(talent => {
      applyTalentAura(nextPlayer, talent);
    });

  return nextPlayer;
}

// ============================================================
// UPGRADE PLAYER
// ============================================================

export function upgradePlayer(state, upgradeId) {
  const upgrade = PLAYER_UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return state;

  const currentLevel = state.player.upgrades?.[upgrade.id] || 0;
  if (currentLevel >= upgrade.maxLevel) return state;

  const cost = Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel)
  );

  if (state.player.gold < cost) return state;

  let p = {
    ...state.player,
    gold: state.player.gold - cost,
    upgrades: {
      ...(state.player.upgrades || {}),
      [upgrade.id]: currentLevel + 1,
    },
  };

  applyStat(p, upgrade.stat, upgrade.valuePerLevel);

  return {
    ...state,
    player: refreshStats(p),
  };
}

// ============================================================
// UNLOCK TALENT
// ============================================================

export function unlockTalent(state, talentId) {
  const talent = TALENTS.find(t => t.id === talentId);
  if (!talent) return state;

  if ((state.player.unlockedTalents || []).includes(talent.id)) return state;
  if (!canUnlockTalentNode(state, talentId)) return state;

  const talentCost = getTalentCostForPlayer(state, talent);
  if (!Number.isFinite(talentCost)) return state;

  let p = {
    ...state.player,
    talentPoints: (state.player.talentPoints || 0) - talentCost,
    unlockedTalents: [
      ...(state.player.unlockedTalents || []),
      talent.id,
    ],
  };

  const replacedTalentIds = Array.isArray(talent.replaces)
    ? talent.replaces
    : talent.replaces
      ? [talent.replaces]
      : [];

  for (const replacedTalentId of replacedTalentIds) {
    const replacedTalent = TALENTS.find(item => item.id === replacedTalentId);
    if (!replacedTalent) continue;
    if (!(state.player.unlockedTalents || []).includes(replacedTalentId)) continue;
    if (isAlwaysPassiveTalent(replacedTalent)) {
      removeTalentAura(p, replacedTalent);
    }
  }

  if (isAlwaysPassiveTalent(talent)) {
    applyTalentAura(p, talent);
  }

  p.unlockedTalents = [...new Set(p.unlockedTalents || [])];
  p.talentLevels = deriveTalentLevelsFromUnlockedTalents(
    p.unlockedTalents,
    p.talentLevels || state.player.talentLevels || {}
  );
  p.talentSystemVersion = TALENT_SYSTEM_VERSION;

  return {
    ...state,
    player: refreshStats(p),
    stats: {
      ...state.stats,
      talentsUnlocked: (state.stats?.talentsUnlocked || 0) + 1,
    },
  };
}

export function resetTalentTree(state) {
  const unlockedTalents = state.player.unlockedTalents || [];
  if (unlockedTalents.length === 0) return state;

  let refundedPoints = 0;
  let p = { ...state.player };

  for (const talentId of unlockedTalents) {
    const talent = TALENTS.find(item => item.id === talentId);
    if (!talent) continue;
    const talentCost = getTalentCostForPlayer(state, talent);
    if (!Number.isFinite(talentCost)) continue;
    refundedPoints += talentCost;
    if (isAlwaysPassiveTalent(talent)) {
      removeTalentAura(p, talent);
    }
  }

  p.unlockedTalents = [];
  p.talentLevels = {};
  p.talentSystemVersion = TALENT_SYSTEM_VERSION;
  p.talentPoints = (p.talentPoints || 0) + refundedPoints;

  return {
    ...state,
    player: refreshStats(p),
    stats: {
      ...state.stats,
      talentResets: (state.stats?.talentResets || 0) + 1,
    },
  };
}

export function upgradeTalentNode(state, nodeId) {
  const nextTalent = getNextTalentForNode(state, nodeId);
  if (!nextTalent) return state;
  if (!canUnlockNode(state, nodeId)) return state;
  return unlockTalent(state, nextTalent.id);
}

// ============================================================
// SELECT CLASS
// ============================================================

export function selectClass(state, classId) {
  const chosen = CLASSES.find(c => c.id === classId);
  if (!chosen || state.player.class) return state;

  let p = {
    ...state.player,
    class: chosen.id,
    specialization: null,
    baseDamage:     (state.player.baseDamage     || 10)   + chosen.baseStats.damage,
    baseDefense:    (state.player.baseDefense    || 2)    + chosen.baseStats.defense,
    baseCritChance: (state.player.baseCritChance || 0.05) + chosen.baseStats.critChance,
    baseMaxHp:      (state.player.baseMaxHp      || 100)  + chosen.baseStats.maxHp,
  };

  p = syncPrestigeBonuses(p, state.prestige);
  p.hp = p.maxHp;

  return {
    ...state,
    player: p,
  };
}

// ============================================================
// SELECT SPECIALIZATION
// ============================================================

export function selectSpecialization(state, specId, options = {}) {
  const playerClass = CLASSES.find(c => c.id === state.player.class);
  if (!playerClass || state.player.specialization) return state;

  const spec = playerClass.specializations.find(s => s.id === specId);
  if (!spec) return state;

  const { stat, value } = spec.unlockCondition;
  const current = getProgressValue(state, stat);

  if (current < value && !options.ignoreRequirement) return state;

  let p = {
    ...state.player,
    specialization: spec.id,
  };

  if (spec.bonuses.damage)
    p.baseDamage = (p.baseDamage || 10) + spec.bonuses.damage;

  if (spec.bonuses.defense)
    p.baseDefense = (p.baseDefense || 2) + spec.bonuses.defense;

  if (spec.bonuses.critChance)
    p.baseCritChance = (p.baseCritChance || 0.05) + spec.bonuses.critChance;

  if (spec.bonuses.maxHp)
    p.baseMaxHp = (p.baseMaxHp || 100) + spec.bonuses.maxHp;

  return {
    ...state,
    player: syncPrestigeBonuses(p, state.prestige),
  };
}
