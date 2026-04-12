import { TALENT_TREES } from "./talentTree";
import { TALENTS } from "./talents";

// Derived catalog used by the node-based tree UI and upgrade engine.
// Do not hand-author nodes here; edit talents.js / talentTree.js instead.
const SUPPORTED_TREE_IDS = new Set(["warrior_general", "berserker", "juggernaut"]);
const TALENT_BY_ID = new Map(TALENTS.map(talent => [talent.id, talent]));

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function getTalentById(talentId) {
  return TALENT_BY_ID.get(talentId) || null;
}

function getTalentUnlockStage(talentId) {
  const talent = getTalentById(talentId);
  return Number(talent?.unlockCondition?.value || 0);
}

function isValidPrereqStage(nodeTalentId, prereqTalentId) {
  const nodeTalent = getTalentById(nodeTalentId);
  const prereqTalent = getTalentById(prereqTalentId);
  if (!nodeTalent || !prereqTalent) return true;
  return getTalentUnlockStage(prereqTalentId) <= getTalentUnlockStage(nodeTalentId);
}

function isValidPrereqPosition(xByTalentId, nodeX, prereqTalentId) {
  const prereqX = xByTalentId.get(prereqTalentId);
  if (prereqX == null) return true;
  return prereqX <= nodeX;
}

function getBaseTalentId(talentId) {
  let current = getTalentById(talentId);
  if (!current) return talentId;

  const visited = new Set([current.id]);
  while (current) {
    const replacedId = toArray(current.replaces)[0];
    if (!replacedId || visited.has(replacedId)) return current.id;
    visited.add(replacedId);
    const replacedTalent = getTalentById(replacedId);
    if (!replacedTalent) return replacedId;
    current = replacedTalent;
  }

  return talentId;
}

function getTalentLevelDepth(talentId) {
  let current = getTalentById(talentId);
  if (!current) return 1;

  let depth = 1;
  const visited = new Set([current.id]);
  while (current) {
    const replacedId = toArray(current.replaces)[0];
    if (!replacedId || visited.has(replacedId)) break;
    depth += 1;
    visited.add(replacedId);
    current = getTalentById(replacedId);
    if (!current) break;
  }
  return depth;
}

function uniquePush(list, value) {
  if (!value) return;
  if (list.includes(value)) return;
  list.push(value);
}

function getDefaultMinTreePointsSpent(node) {
  const x = Number(node?.x || 0);
  if (x >= 5) return 12;
  if (x >= 4) return 8;
  if (x >= 3) return 5;
  return 0;
}

function buildTalentNodeCatalog() {
  const nodeMap = new Map();

  for (const tree of TALENT_TREES) {
    if (!SUPPORTED_TREE_IDS.has(tree.id)) continue;
    const xByTalentId = new Map((tree.nodes || []).map(node => [node.talentId, Number(node.x || 0)]));

    for (const node of tree.nodes || []) {
      const baseId = getBaseTalentId(node.talentId);
      const talent = getTalentById(node.talentId);
      const baseTalent = getTalentById(baseId);
      if (!talent || !baseTalent) continue;

      const level = getTalentLevelDepth(talent.id);
      const prereqs = (node.prereqs || [])
        .filter(prereqId => isValidPrereqStage(talent.id, prereqId))
        .filter(prereqId => isValidPrereqPosition(xByTalentId, Number(node.x || 0), prereqId))
        .map(getBaseTalentId)
        .filter(Boolean);
      const explicitMinTreePointsSpent = Number(node.minTreePointsSpent || 0);
      const derivedMinTreePointsSpent = getDefaultMinTreePointsSpent(node);
      const minTreePointsSpent = Math.max(explicitMinTreePointsSpent, derivedMinTreePointsSpent);

      if (!nodeMap.has(baseId)) {
        nodeMap.set(baseId, {
          id: baseId,
          classId: baseTalent.classId,
          specId: baseTalent.specId || null,
          treeId: tree.id,
          levels: [],
          prereqs: [],
          prereqMode: node.prereqMode || "all",
          minTreePointsSpent,
          x: node.x || 0,
          y: node.y || 0,
        });
      }

      const entry = nodeMap.get(baseId);
      entry.levels[level - 1] = talent.id;
      entry.x = Math.min(entry.x, node.x || 0);
      entry.y = Math.min(entry.y, node.y || 0);
      if (level === 1 && node.prereqMode) entry.prereqMode = node.prereqMode;
      entry.minTreePointsSpent = Math.max(entry.minTreePointsSpent || 0, minTreePointsSpent);
      if (level === 1) {
        for (const prereq of prereqs) {
          if (prereq !== baseId) uniquePush(entry.prereqs, prereq);
        }
      }
    }
  }

  return [...nodeMap.values()].map(entry => ({
    ...entry,
    levels: entry.levels.filter(Boolean),
    maxLevel: entry.levels.filter(Boolean).length,
  }));
}

function buildEdges(nodes = []) {
  const nodeIds = new Set(nodes.map(node => node.id));
  const edges = [];

  for (const node of nodes) {
    for (const prereq of node.prereqs || []) {
      if (!nodeIds.has(prereq)) continue;
      edges.push({
        from: prereq,
        to: node.id,
        type: node.prereqMode === "any" ? "any" : "all",
      });
    }
  }

  return edges;
}

export const TALENT_NODES = buildTalentNodeCatalog();
export const TALENT_EDGES = buildEdges(TALENT_NODES);

export function getNodesForTree(treeId) {
  return TALENT_NODES.filter(node => node.treeId === treeId);
}
