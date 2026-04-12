import { TALENTS } from "../../data/talents";
import { canUnlockTalentNode, canUseTalentSpec, getTalentCostForPlayer } from "./treeEngine";
import { TALENT_NODES } from "../../data/talentNodes";
const TALENT_BY_ID = new Map(TALENTS.map(talent => [talent.id, talent]));

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function getTalentById(talentId) {
  return TALENT_BY_ID.get(talentId) || null;
}

function getBaseTalentForNode(nodeId) {
  let current = getTalentById(nodeId);
  if (!current) return null;

  const visited = new Set([current.id]);
  while (current) {
    const replacedId = toArray(current.replaces)[0];
    if (!replacedId || visited.has(replacedId)) return current;
    visited.add(replacedId);
    const replacedTalent = getTalentById(replacedId);
    if (!replacedTalent) return current;
    current = replacedTalent;
  }
  return null;
}

function getUpgradeTalent(baseTalentId) {
  return TALENTS.find(talent => toArray(talent.replaces).includes(baseTalentId)) || null;
}

function getNodeDefinition(nodeId) {
  const baseId = getBaseTalentForNode(nodeId)?.id || nodeId;
  return TALENT_NODES.find(node => node.id === baseId) || null;
}

function getTalentCost(state, talentId) {
  return getTalentCostForPlayer(state, talentId);
}

export function getNodeMaxLevel(nodeId) {
  const nodeDefinition = getNodeDefinition(nodeId);
  if (nodeDefinition) return nodeDefinition.maxLevel || 0;

  const baseTalent = getBaseTalentForNode(nodeId);
  if (!baseTalent) return 0;
  return getUpgradeTalent(baseTalent.id) ? 2 : 1;
}

export function getNodeLevel(state, nodeId) {
  const baseTalent = getBaseTalentForNode(nodeId);
  if (!baseTalent) return 0;
  const nodeDefinition = getNodeDefinition(baseTalent.id);

  const unlockedTalents = new Set(state.player?.unlockedTalents || []);
  const levels = state.player?.talentLevels || {};
  const storedLevel = Number(levels[baseTalent.id] || 0);

  let unlockedLevel = 0;
  if (nodeDefinition?.levels?.length) {
    nodeDefinition.levels.forEach((talentId, index) => {
      if (talentId && unlockedTalents.has(talentId)) {
        unlockedLevel = Math.max(unlockedLevel, index + 1);
      }
    });
  } else {
    const upgrade = getUpgradeTalent(baseTalent.id);
    if (upgrade && unlockedTalents.has(upgrade.id)) unlockedLevel = 2;
    else if (unlockedTalents.has(baseTalent.id)) unlockedLevel = 1;
  }

  const maxLevel = getNodeMaxLevel(baseTalent.id);
  return Math.min(maxLevel, Math.max(storedLevel, unlockedLevel));
}

export function getNextTalentForNode(state, nodeId) {
  const baseTalent = getBaseTalentForNode(nodeId);
  if (!baseTalent) return null;
  const nodeDefinition = getNodeDefinition(baseTalent.id);

  const level = getNodeLevel(state, baseTalent.id);
  if (nodeDefinition) {
    const nextTalentId = nodeDefinition.levels[level] || null;
    return nextTalentId ? TALENTS.find(talent => talent.id === nextTalentId) || null : null;
  }

  if (level <= 0) return baseTalent;

  const upgrade = getUpgradeTalent(baseTalent.id);
  if (level === 1 && upgrade) return upgrade;
  return null;
}

export function getNodeUpgradeCost(state, nodeId) {
  const nextTalent = getNextTalentForNode(state, nodeId);
  return nextTalent ? getTalentCostForPlayer(state, nextTalent) : null;
}

export function getSpentTalentPointsInTree(state, treeId) {
  if (!treeId) return 0;
  let spent = 0;

  for (const node of TALENT_NODES) {
    if (node.treeId !== treeId) continue;
    const level = getNodeLevel(state, node.id);
    if (level <= 0) continue;
    for (let idx = 0; idx < Math.min(level, node.levels.length); idx += 1) {
      const talentId = node.levels[idx];
      if (!talentId) continue;
      spent += getTalentCost(state, talentId);
    }
  }

  return spent;
}

export function getNodeTreeSpendRequirement(state, nodeId) {
  const nodeDefinition = getNodeDefinition(nodeId);
  if (!nodeDefinition) return { required: 0, spent: 0, remaining: 0, met: true };

  const required = Number(nodeDefinition.minTreePointsSpent || 0);
  const spent = getSpentTalentPointsInTree(state, nodeDefinition.treeId);
  const remaining = Math.max(0, required - spent);
  return {
    required,
    spent,
    remaining,
    met: remaining <= 0,
  };
}

export function canUnlockNode(state, nodeId) {
  const nextTalent = getNextTalentForNode(state, nodeId);
  if (!nextTalent) return false;
  const nodeDefinition = getNodeDefinition(nodeId);
  if (!nodeDefinition) {
    return canUnlockTalentNode(state, nextTalent.id);
  }

  if (!canUseTalentSpec(state, nextTalent)) return false;
  if ((state.player.talentPoints || 0) < getTalentCostForPlayer(state, nextTalent)) return false;

  const prereqs = nodeDefinition.prereqs || [];
  if (prereqs.length > 0) {
    const unlockedCount = prereqs.filter(prereqId => getNodeLevel(state, prereqId) >= 1).length;
    if (nodeDefinition.prereqMode === "any") {
      if (unlockedCount <= 0) return false;
    } else if (unlockedCount < prereqs.length) {
      return false;
    }
  }

  const spendGate = getNodeTreeSpendRequirement(state, nodeDefinition.id);
  if (!spendGate.met) return false;

  return canUnlockTalentNode(
    {
      ...state,
      player: {
        ...state.player,
        unlockedTalents: state.player.unlockedTalents || [],
      },
    },
    nextTalent.id
  );
}

export function getAvailableNodes(state, nodeIds = []) {
  if (nodeIds.length > 0) {
    return nodeIds.filter(nodeId => canUnlockNode(state, nodeId));
  }

  const candidateNodeIds = TALENTS.filter(talent => !talent.replaces).map(talent => talent.id);
  return candidateNodeIds.filter(nodeId => canUnlockNode(state, nodeId));
}
