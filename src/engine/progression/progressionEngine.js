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

function applyTalentAura(p, talent) {
  const { stat, multiplier, flat } = talent.effect;

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

    case "goldBonus":
      p.flatGold = (p.flatGold || 0) + (flat || 0);
      break;

    case "xpBonus":
      p.xpPct = (p.xpPct || 0) + (multiplier ? multiplier - 1 : flat || 0);
      break;

    case "regen":
      p.flatRegen = (p.flatRegen || 0) + (flat || 0);
      break;
  }
}

function removeTalentAura(p, talent) {
  const { stat, multiplier, flat } = talent.effect;

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

    case "goldBonus":
      p.flatGold = (p.flatGold || 0) - (flat || 0);
      break;

    case "xpBonus":
      p.xpPct = (p.xpPct || 0) - (multiplier ? multiplier - 1 : flat || 0);
      break;

    case "regen":
      p.flatRegen = (p.flatRegen || 0) - (flat || 0);
      break;
  }
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
    if (replacedTalent.type === "aura") {
      removeTalentAura(p, replacedTalent);
    }
  }

  if (talent.type === "aura") {
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
    if (talent.type === "aura") {
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

export function selectSpecialization(state, specId) {
  const playerClass = CLASSES.find(c => c.id === state.player.class);
  if (!playerClass || state.player.specialization) return state;

  const spec = playerClass.specializations.find(s => s.id === specId);
  if (!spec) return state;

  const { stat, value } = spec.unlockCondition;
  const current = getProgressValue(state, stat);

  if (current < value) return state;

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
