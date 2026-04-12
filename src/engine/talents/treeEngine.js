import { TALENT_TREES } from "../../data/talentTree";
import { TALENTS } from "../../data/talents";

export const CROSS_SPEC_UNLOCK_LEVEL = 80;
export const OFF_SPEC_COST_MULTIPLIER = 3;
const TALENT_BY_ID = new Map(TALENTS.map(talent => [talent.id, talent]));

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function hasCrossSpecAccessByLevel(level = 0) {
  return Number(level || 0) >= CROSS_SPEC_UNLOCK_LEVEL;
}

function getTalentUnlockStage(talentId) {
  const talent = TALENT_BY_ID.get(talentId);
  if (!talent) return 0;
  return Number(talent.unlockCondition?.value || 0);
}

function getBaseTalentId(talentId) {
  let current = TALENT_BY_ID.get(talentId);
  if (!current) return talentId;

  const visited = new Set([current.id]);
  while (current) {
    const replacedId = toArray(current.replaces)[0];
    if (!replacedId || visited.has(replacedId)) return current.id;
    visited.add(replacedId);
    const replacedTalent = TALENT_BY_ID.get(replacedId);
    if (!replacedTalent) return replacedId;
    current = replacedTalent;
  }

  return talentId;
}

function hasUnlockedTalentChain(unlockedTalents = [], talentId) {
  const baseId = getBaseTalentId(talentId);
  return (unlockedTalents || []).some(unlockedId => getBaseTalentId(unlockedId) === baseId);
}

function getValidPrereqIdsForNode(node) {
  const nodeTalentId = node?.talentId;
  const nodeStage = getTalentUnlockStage(nodeTalentId);
  return (node?.prereqs || []).filter(prereqId => {
    if (!nodeTalentId) return true;
    const prereqTalent = TALENT_BY_ID.get(prereqId);
    if (!prereqTalent) return true;
    return getTalentUnlockStage(prereqId) <= nodeStage;
  });
}

export function canUseTalentSpec(state, talent) {
  if (!talent) return false;
  if (talent.classId !== state.player.class) return false;
  if (!talent.specId) return true;
  if (talent.specId === state.player.specialization) return true;
  return hasCrossSpecAccessByLevel(state.player.level || 0);
}

export function getTalentCostForPlayer(state, talentOrId) {
  const talent = typeof talentOrId === "string"
    ? TALENTS.find(item => item.id === talentOrId) || null
    : talentOrId;

  if (!talent) return Number.POSITIVE_INFINITY;
  const baseCost = Number(talent.cost || 0);
  if (!talent.specId || talent.specId === state.player.specialization) return baseCost;
  return Math.max(1, Math.ceil(baseCost * OFF_SPEC_COST_MULTIPLIER));
}

export function getTalentTreesForPlayer({ playerClass, playerSpec, playerLevel = 1 }) {
  const crossSpecUnlocked = hasCrossSpecAccessByLevel(playerLevel);
  return TALENT_TREES
    .filter(tree => {
      if (tree.classId !== playerClass) return false;
      if (tree.specId == null) return true;
      if (tree.specId === playerSpec) return true;
      return crossSpecUnlocked;
    })
    .map(tree => ({
      ...tree,
      isOffSpec: !!tree.specId && tree.specId !== playerSpec,
    }))
    .sort((a, b) => Number(a.isOffSpec) - Number(b.isOffSpec));
}

export function getTalentNode(talentId) {
  for (const tree of TALENT_TREES) {
    const node = tree.nodes.find(candidate => candidate.talentId === talentId);
    if (node) return { ...node, treeId: tree.id, classId: tree.classId, specId: tree.specId };
  }

  return null;
}

export function getTalentById(talentId) {
  return TALENT_BY_ID.get(talentId) || null;
}

export function hasUnlockedTreePrereqs(unlockedTalents = [], node) {
  const validPrereqs = getValidPrereqIdsForNode(node);
  if (!node || validPrereqs.length === 0) return true;
  if (node.prereqMode === "any") {
    return validPrereqs.some(prereqId => hasUnlockedTalentChain(unlockedTalents, prereqId));
  }
  return validPrereqs.every(prereqId => hasUnlockedTalentChain(unlockedTalents, prereqId));
}

export function getProgressValue(state, stat) {
  switch (stat) {
    case "kills":
      return state.stats?.kills || 0;
    case "level":
      return state.player?.level || 0;
    case "gold":
      return state.player?.gold || 0;
    default:
      return 0;
  }
}

export function meetsTalentRequirement(state, talent) {
  const unlockCondition = talent.unlockCondition || {};
  if (!unlockCondition.stat) return true;
  if (unlockCondition.stat === "gold" || unlockCondition.stat === "kills") return true;
  return getProgressValue(state, unlockCondition.stat) >= unlockCondition.value;
}

export function canUnlockTalentNode(state, talentId) {
  const talent = getTalentById(talentId);
  if (!talent) return false;

  if (!canUseTalentSpec(state, talent)) return false;
  if ((state.player.unlockedTalents || []).includes(talent.id)) return false;
  if ((state.player.talentPoints || 0) < getTalentCostForPlayer(state, talent)) return false;
  if (!meetsTalentRequirement(state, talent)) return false;

  const node = getTalentNode(talentId);
  if (!node) return true;

  return hasUnlockedTreePrereqs(state.player.unlockedTalents || [], node);
}
