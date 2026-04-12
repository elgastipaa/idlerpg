import { TALENTS } from "../../data/talents";

export const TALENT_SYSTEM_VERSION = 2;

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

export function deriveTalentLevelsFromUnlockedTalents(
  unlockedTalents = [],
  existingLevels = {}
) {
  const nextLevels = { ...(existingLevels || {}) };
  const talentById = new Map(TALENTS.map(talent => [talent.id, talent]));

  const getRootAndDepth = (talentId) => {
    let current = talentById.get(talentId) || null;
    if (!current) return { rootId: talentId, depth: 1 };

    let depth = 1;
    const visited = new Set([current.id]);
    while (current) {
      const replacedId = toArray(current.replaces)[0];
      if (!replacedId || visited.has(replacedId)) break;
      visited.add(replacedId);
      depth += 1;
      const replacedTalent = talentById.get(replacedId) || null;
      if (!replacedTalent) return { rootId: replacedId, depth };
      current = replacedTalent;
    }

    return { rootId: current?.id || talentId, depth };
  };

  for (const talentId of unlockedTalents || []) {
    if (!talentId) continue;
    const talent = talentById.get(talentId) || null;
    if (!talent) continue;

    nextLevels[talent.id] = Math.max(1, nextLevels[talent.id] || 0);
    const { rootId, depth } = getRootAndDepth(talent.id);
    nextLevels[rootId] = Math.max(depth, nextLevels[rootId] || 0);
  }

  return nextLevels;
}

export function migrateTalentsToV2(incomingState = {}) {
  const player = incomingState.player || {};
  const currentVersion = Number(player.talentSystemVersion || 1);

  const unlockedTalents = [...new Set(player.unlockedTalents || [])];
  const existingLevels = player.talentLevels || {};

  if (currentVersion >= TALENT_SYSTEM_VERSION) {
    return {
      ...incomingState,
      player: {
        ...player,
        unlockedTalents,
        talentLevels: {
          ...existingLevels,
        },
        talentSystemVersion: TALENT_SYSTEM_VERSION,
      },
    };
  }

  const migratedLevels = deriveTalentLevelsFromUnlockedTalents(
    unlockedTalents,
    existingLevels
  );

  return {
    ...incomingState,
    player: {
      ...player,
      unlockedTalents,
      talentLevels: migratedLevels,
      talentSystemVersion: TALENT_SYSTEM_VERSION,
    },
  };
}
