import { BASE_TIER_COUNT } from "../combat/encounterRouting";

export const ABYSS_UNLOCKS = [
  {
    id: "abyss_i",
    key: "prestigeBranch",
    depth: 1,
    minTier: BASE_TIER_COUNT + 1,
    name: "Abismo I",
    reward: "Capa meta de Abismo",
  },
  {
    id: "abyss_ii",
    key: "craftingAffixes",
    depth: 2,
    minTier: BASE_TIER_COUNT * 2 + 1,
    name: "Abismo II",
    reward: "Acceso a Forja de Abismo",
  },
  {
    id: "abyss_iii",
    key: "legendaryPowers",
    depth: 3,
    minTier: BASE_TIER_COUNT * 3 + 1,
    name: "Abismo III",
    reward: "Acceso a recompensas legendarias del Abismo",
  },
  {
    id: "abyss_iv",
    key: "extraRunSigilSlot",
    depth: 4,
    minTier: BASE_TIER_COUNT * 4 + 1,
    name: "Abismo IV",
    reward: "Segundo slot de sigil de run",
  },
];

const DEFAULT_UNLOCKS = Object.fromEntries(
  ABYSS_UNLOCKS.map(unlock => [unlock.key, false])
);

function sanitizeTier(value, fallback = 1) {
  const numeric = Math.floor(Number(value || fallback));
  if (!Number.isFinite(numeric) || numeric < 1) return fallback;
  return numeric;
}

export function getAbyssDepthForTier(tier = 1) {
  return Math.max(0, Math.floor((sanitizeTier(tier) - 1) / BASE_TIER_COUNT));
}

export function createEmptyAbyssState() {
  return {
    highestTierReached: 1,
    highestDepthReached: 0,
    unlocks: { ...DEFAULT_UNLOCKS },
  };
}

export function normalizeAbyssState(rawState = {}) {
  const highestTierReached = sanitizeTier(rawState.highestTierReached || 1, 1);
  const derivedUnlocks = Object.fromEntries(
    ABYSS_UNLOCKS.map(unlock => [unlock.key, highestTierReached >= unlock.minTier])
  );
  const rawUnlocks = rawState.unlocks || {};
  const unlocks = Object.fromEntries(
    ABYSS_UNLOCKS.map(unlock => [
      unlock.key,
      Boolean(rawUnlocks[unlock.key] || derivedUnlocks[unlock.key]),
    ])
  );

  return {
    highestTierReached,
    highestDepthReached: getAbyssDepthForTier(highestTierReached),
    unlocks,
  };
}

export function syncAbyssState(rawState = {}, highestTierCandidate = 1) {
  const previous = normalizeAbyssState(rawState);
  const nextHighestTier = Math.max(
    previous.highestTierReached,
    sanitizeTier(highestTierCandidate, previous.highestTierReached)
  );
  const next = normalizeAbyssState({
    ...previous,
    highestTierReached: nextHighestTier,
  });
  const newlyUnlocked = ABYSS_UNLOCKS.filter(
    unlock => !previous.unlocks[unlock.key] && next.unlocks[unlock.key]
  );

  return {
    abyss: next,
    newlyUnlocked,
    changed:
      next.highestTierReached !== previous.highestTierReached ||
      newlyUnlocked.length > 0,
  };
}

export function getAbyssUnlockEntries(abyss = {}) {
  const normalized = normalizeAbyssState(abyss);
  return ABYSS_UNLOCKS.map(unlock => ({
    ...unlock,
    unlocked: Boolean(normalized.unlocks[unlock.key]),
  }));
}

export function hasAbyssUnlock(abyss = {}, key = "") {
  return Boolean(normalizeAbyssState(abyss).unlocks?.[key]);
}

export function getMaxRunSigilSlots(abyss = {}) {
  return hasAbyssUnlock(abyss, "extraRunSigilSlot") ? 2 : 1;
}
