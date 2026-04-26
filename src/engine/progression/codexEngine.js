import { BOSSES } from "../../data/bosses";
import { ENEMY_FAMILIES } from "../../data/encounters";
import { LEGENDARY_POWERS } from "../../data/legendaryPowers";
import {
  BASE_TIER_COUNT,
  BOSS_SLOT_COUNT,
  BOSS_SLOT_INTERVAL,
  normalizeRunContext,
  resolveEncounterForTier,
} from "../combat/encounterRouting";
import { refreshStats } from "../combat/statEngine";
import { getLegendaryPowerSources, getTargetedLegendaryDropsForEnemy } from "../../utils/legendaryPowers";
import { hasAbyssUnlock } from "./abyssProgression";

const FAMILY_MASTERY = {
  ooze: {
    milestones: [
      { kills: 50, bonus: { hpPct: 0.01 }, label: "+1% vida" },
      { kills: 250, bonus: { healthRegen: 1 }, label: "+1 regen" },
      { kills: 1000, bonus: { hpPct: 0.02 }, label: "+2% vida" },
    ],
  },
  raider: {
    milestones: [
      { kills: 50, bonus: { damagePct: 0.01 }, label: "+1% dano" },
      { kills: 250, bonus: { goldPct: 0.03 }, label: "+3% oro" },
      { kills: 1000, bonus: { attackSpeed: 0.01 }, label: "+1% velocidad" },
    ],
  },
  beast: {
    milestones: [
      { kills: 50, bonus: { attackSpeed: 0.01 }, label: "+1% velocidad" },
      { kills: 250, bonus: { dodgeChance: 0.005 }, label: "+0.5% esquiva" },
      { kills: 1000, bonus: { damagePct: 0.02 }, label: "+2% dano" },
    ],
  },
  undead: {
    milestones: [
      { kills: 50, bonus: { critDamage: 0.03 }, label: "+3% dano critico" },
      { kills: 250, bonus: { thorns: 4 }, label: "+4 espinas" },
      { kills: 1000, bonus: { hpPct: 0.015 }, label: "+1.5% vida" },
    ],
  },
  knight: {
    milestones: [
      { kills: 50, bonus: { defensePct: 0.015 }, label: "+1.5% defensa" },
      { kills: 250, bonus: { blockChance: 0.005 }, label: "+0.5% bloqueo" },
      { kills: 1000, bonus: { defensePct: 0.03 }, label: "+3% defensa" },
    ],
  },
  orc: {
    milestones: [
      { kills: 50, bonus: { damagePct: 0.015 }, label: "+1.5% dano" },
      { kills: 250, bonus: { hpPct: 0.015 }, label: "+1.5% vida" },
      { kills: 1000, bonus: { flatCrit: 0.005 }, label: "+0.5% critico" },
    ],
  },
  demon: {
    milestones: [
      { kills: 50, bonus: { lifesteal: 0.004 }, label: "+0.4% robo de vida" },
      { kills: 250, bonus: { damagePct: 0.015 }, label: "+1.5% dano" },
      { kills: 1000, bonus: { critDamage: 0.04 }, label: "+4% dano critico" },
    ],
  },
  construct: {
    milestones: [
      { kills: 50, bonus: { defensePct: 0.02 }, label: "+2% defensa" },
      { kills: 250, bonus: { hpPct: 0.015 }, label: "+1.5% vida" },
      { kills: 1000, bonus: { thorns: 6 }, label: "+6 espinas" },
    ],
  },
  cultist: {
    milestones: [
      { kills: 50, bonus: { critDamage: 0.02 }, label: "+2% dano critico" },
      { kills: 250, bonus: { multiHitChance: 0.01 }, label: "+1% multi-hit" },
      { kills: 1000, bonus: { essenceBonus: 0.08 }, label: "+8% esencia" },
    ],
  },
  occult: {
    milestones: [
      { kills: 50, bonus: { critDamage: 0.02 }, label: "+2% dano critico" },
      { kills: 250, bonus: { luck: 2 }, label: "+2 suerte" },
      { kills: 1000, bonus: { lootBonus: 0.015 }, label: "+1.5% botin" },
    ],
  },
  elemental: {
    milestones: [
      { kills: 50, bonus: { damagePct: 0.01 }, label: "+1% dano" },
      { kills: 250, bonus: { critDamage: 0.03 }, label: "+3% dano critico" },
      { kills: 1000, bonus: { flatCrit: 0.005 }, label: "+0.5% critico" },
    ],
  },
  dragon: {
    milestones: [
      { kills: 50, bonus: { hpPct: 0.015 }, label: "+1.5% vida" },
      { kills: 250, bonus: { defensePct: 0.02 }, label: "+2% defensa" },
      { kills: 1000, bonus: { critDamage: 0.04 }, label: "+4% dano critico" },
    ],
  },
};

const BOSS_MASTERY = {
  orc_warlord: {
    milestones: [
      { kills: 1, bonus: { damagePct: 0.02 }, label: "+2% dano" },
      { kills: 5, bonus: { attackSpeed: 0.02 }, label: "+2% velocidad" },
    ],
  },
  void_titan: {
    milestones: [
      { kills: 1, bonus: { multiHitChance: 0.015 }, label: "+1.5% multi-hit" },
      { kills: 5, bonus: { lootBonus: 0.02 }, label: "+2% botin" },
    ],
  },
  blood_matriarch: {
    milestones: [
      { kills: 1, bonus: { lifesteal: 0.006 }, label: "+0.6% robo de vida" },
      { kills: 5, bonus: { flatCrit: 0.01 }, label: "+1% critico" },
    ],
  },
  iron_sentinel: {
    milestones: [
      { kills: 1, bonus: { defensePct: 0.03 }, label: "+3% defensa" },
      { kills: 5, bonus: { blockChance: 0.01 }, label: "+1% bloqueo" },
    ],
  },
  void_sovereign: {
    milestones: [
      { kills: 1, bonus: { damagePct: 0.03 }, label: "+3% dano" },
      { kills: 3, bonus: { critDamage: 0.04 }, label: "+4% dano critico" },
    ],
  },
};

const LEGENDARY_POWER_MASTERY = [
  { rank: 1, discoveries: 1, label: "Descubierto", imprintCostReduction: 0, huntBias: 0 },
  { rank: 2, discoveries: 3, label: "Sintonizado", imprintCostReduction: 0.08, huntBias: 0.12 },
  { rank: 3, discoveries: 6, label: "Dominado", imprintCostReduction: 0.16, huntBias: 0.25 },
  { rank: 4, discoveries: 10, label: "Mitico", imprintCostReduction: 0.24, huntBias: 0.4 },
];

const BONUS_KEYS = [
  "damagePct",
  "defensePct",
  "hpPct",
  "healthRegen",
  "attackSpeed",
  "lifesteal",
  "dodgeChance",
  "blockChance",
  "critDamage",
  "flatCrit",
  "thorns",
  "essenceBonus",
  "lootBonus",
  "luck",
  "multiHitChance",
  "markChance",
  "markEffectPerStack",
  "goldPct",
];

const BOSS_BY_ID = new Map(BOSSES.map(boss => [boss.id, boss]));
const FAMILY_IDS = Object.keys(ENEMY_FAMILIES);
const BOSS_IDS = BOSSES.map(boss => boss.id);
const POWER_IDS = LEGENDARY_POWERS.map(power => power.id);
const LIBRARY_LAYER_DEFINITIONS = {
  power: {
    id: "power",
    researchType: "power",
    label: "Poderes legendarios",
    unlockResearchId: "unlock_library",
    fallbackUnlock: sanctuary => Boolean(sanctuary?.stations?.codexResearch?.unlocked),
  },
  family: {
    id: "family",
    researchType: "family",
    label: "Familias",
    unlockResearchId: "library_slots_1",
    fallbackUnlock: sanctuary => Number(sanctuary?.stations?.codexResearch?.slots || 0) >= 2,
  },
  boss: {
    id: "boss",
    researchType: "boss",
    label: "Bosses",
    unlockResearchId: "library_speed_1",
    fallbackUnlock: sanctuary => Number(sanctuary?.stations?.codexResearch?.timeReductionPct || 0) > 0,
  },
};

function emptyBonuses() {
  return BONUS_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

function sanitizeWholeNumber(value, fallback = 0, max = 1_000_000) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return fallback;
  return Math.min(max, Math.floor(numeric));
}

function clampProgress(value, needed = 0) {
  if (!needed) return 0;
  return Math.max(0, Math.min(needed, sanitizeWholeNumber(value || 0, 0, needed)));
}

function getVisibleLegendaryPowers(abyss = {}) {
  return LEGENDARY_POWERS.filter(power => !power.unlockKey || hasAbyssUnlock(abyss, power.unlockKey));
}

function getFamilyMilestones(familyId) {
  return FAMILY_MASTERY[familyId]?.milestones || [];
}

function getBossMilestones(bossId) {
  return BOSS_MASTERY[bossId]?.milestones || [];
}

function getMaxPowerResearchRank() {
  return LEGENDARY_POWER_MASTERY.at(-1)?.rank || 0;
}

function getNextFamilyMilestone(familyId, researchedRank = 0) {
  return getFamilyMilestones(familyId)[researchedRank] || null;
}

function getNextBossMilestone(bossId, researchedRank = 0) {
  return getBossMilestones(bossId)[researchedRank] || null;
}

function getNextPowerRankEntry(researchedRank = 0) {
  return LEGENDARY_POWER_MASTERY.find(entry => entry.rank === researchedRank + 1) || null;
}

function deriveFamilyRankFromHistoricalKills(familyId, kills = 0) {
  return getFamilyMilestones(familyId).filter(milestone => Number(kills || 0) >= milestone.kills).length;
}

function deriveBossRankFromHistoricalKills(bossId, kills = 0) {
  return getBossMilestones(bossId).filter(milestone => Number(kills || 0) >= milestone.kills).length;
}

function derivePowerRankFromHistoricalDiscoveries(discoveries = 0) {
  if (Number(discoveries || 0) <= 0) return 0;
  const entry =
    [...LEGENDARY_POWER_MASTERY].reverse().find(rankEntry => Number(discoveries || 0) >= rankEntry.discoveries) ||
    LEGENDARY_POWER_MASTERY[0];
  return Number(entry?.rank || 0);
}

function createEmptyResearchState() {
  return {
    familyRanks: Object.fromEntries(FAMILY_IDS.map(familyId => [familyId, 0])),
    bossRanks: Object.fromEntries(BOSS_IDS.map(bossId => [bossId, 0])),
    powerRanks: Object.fromEntries(POWER_IDS.map(powerId => [powerId, 0])),
    familyProgress: Object.fromEntries(FAMILY_IDS.map(familyId => [familyId, 0])),
    bossProgress: Object.fromEntries(BOSS_IDS.map(bossId => [bossId, 0])),
    powerProgress: Object.fromEntries(POWER_IDS.map(powerId => [powerId, 0])),
  };
}

function ensureNormalizedCodex(codex = {}) {
  const research = codex?.research;
  if (
    research &&
    research.familyRanks &&
    research.bossRanks &&
    research.powerRanks &&
    research.familyProgress &&
    research.bossProgress &&
    research.powerProgress
  ) {
    return codex;
  }
  return normalizeCodexState(codex);
}

function addBonus(target, bonus = {}) {
  for (const [key, value] of Object.entries(bonus)) {
    target[key] = (target[key] || 0) + value;
  }
  return target;
}

export function createEmptyCodexState() {
  return {
    familySeen: {},
    bossSeen: {},
    familyKills: {},
    bossKills: {},
    powerDiscoveries: {},
    research: createEmptyResearchState(),
  };
}

export function getLibraryLayerUnlockState(state = {}) {
  const sanctuary = state?.sanctuary || {};
  const completed = sanctuary?.laboratory?.completed || {};
  const layers = {};

  for (const [layerId, definition] of Object.entries(LIBRARY_LAYER_DEFINITIONS)) {
    const unlockedByResearch = Boolean(completed?.[definition.unlockResearchId]);
    const unlockedByFallback = typeof definition.fallbackUnlock === "function"
      ? Boolean(definition.fallbackUnlock(sanctuary))
      : false;
    layers[layerId] = {
      ...definition,
      unlocked: unlockedByResearch || unlockedByFallback,
      unlockResearchId: definition.unlockResearchId,
    };
  }

  return {
    libraryUnlocked: Boolean(layers.power?.unlocked),
    layers,
  };
}

export function isCodexResearchTypeUnlocked(state = {}, researchType = "") {
  const layerState = getLibraryLayerUnlockState(state);
  const targetLayer = Object.values(layerState.layers).find(layer => layer.researchType === researchType);
  return targetLayer ? Boolean(targetLayer.unlocked) : true;
}

export function normalizeCodexState(codex = {}, discoveredPowerIds = []) {
  const familySeen = Object.fromEntries(
    FAMILY_IDS.map(familyId => [familyId, !!(codex?.familySeen?.[familyId] || Number(codex?.familyKills?.[familyId] || 0) > 0)])
  );
  const bossSeen = Object.fromEntries(
    BOSSES.map(boss => [boss.id, !!(codex?.bossSeen?.[boss.id] || Number(codex?.bossKills?.[boss.id] || 0) > 0)])
  );
  const familyKills = Object.fromEntries(
    FAMILY_IDS.map(familyId => [familyId, sanitizeWholeNumber(codex?.familyKills?.[familyId] || 0, 0, 10_000_000)])
  );
  const bossKills = Object.fromEntries(
    BOSS_IDS.map(bossId => [bossId, sanitizeWholeNumber(codex?.bossKills?.[bossId] || 0, 0, 100_000)])
  );
  const powerDiscoveries = Object.fromEntries(
    POWER_IDS.map(powerId => [powerId, sanitizeWholeNumber(codex?.powerDiscoveries?.[powerId] || 0, 0, 100_000)])
  );

  for (const powerId of discoveredPowerIds || []) {
    if (!powerId || !(powerId in powerDiscoveries)) continue;
    powerDiscoveries[powerId] = Math.max(1, powerDiscoveries[powerId] || 0);
  }

  const research = createEmptyResearchState();
  const rawResearch = codex?.research || {};
  const hasStoredResearch =
    rawResearch &&
    (
      rawResearch.familyRanks ||
      rawResearch.bossRanks ||
      rawResearch.powerRanks ||
      rawResearch.familyProgress ||
      rawResearch.bossProgress ||
      rawResearch.powerProgress
    );

  if (hasStoredResearch) {
    for (const familyId of FAMILY_IDS) {
      const maxRank = getFamilyMilestones(familyId).length;
      const researchedRank = sanitizeWholeNumber(rawResearch?.familyRanks?.[familyId] || 0, 0, maxRank);
      const needed = getNextFamilyMilestone(familyId, researchedRank)?.kills || 0;
      research.familyRanks[familyId] = researchedRank;
      research.familyProgress[familyId] = clampProgress(rawResearch?.familyProgress?.[familyId] || 0, needed);
    }

    for (const bossId of BOSS_IDS) {
      const maxRank = getBossMilestones(bossId).length;
      const researchedRank = sanitizeWholeNumber(rawResearch?.bossRanks?.[bossId] || 0, 0, maxRank);
      const needed = getNextBossMilestone(bossId, researchedRank)?.kills || 0;
      research.bossRanks[bossId] = researchedRank;
      research.bossProgress[bossId] = clampProgress(rawResearch?.bossProgress?.[bossId] || 0, needed);
    }

    for (const powerId of POWER_IDS) {
      const discoveries = Number(powerDiscoveries[powerId] || 0);
      if (discoveries <= 0) {
        research.powerRanks[powerId] = 0;
        research.powerProgress[powerId] = 0;
        continue;
      }

      const maxRank = getMaxPowerResearchRank();
      const storedRank = sanitizeWholeNumber(rawResearch?.powerRanks?.[powerId] || 0, 0, maxRank);
      const researchedRank = Math.max(1, storedRank);
      const needed = getNextPowerRankEntry(researchedRank)?.discoveries || 0;
      research.powerRanks[powerId] = researchedRank;
      research.powerProgress[powerId] = clampProgress(rawResearch?.powerProgress?.[powerId] || 0, needed);
    }
  } else {
    for (const familyId of FAMILY_IDS) {
      research.familyRanks[familyId] = deriveFamilyRankFromHistoricalKills(familyId, familyKills[familyId]);
      research.familyProgress[familyId] = 0;
    }

    for (const bossId of BOSS_IDS) {
      research.bossRanks[bossId] = deriveBossRankFromHistoricalKills(bossId, bossKills[bossId]);
      research.bossProgress[bossId] = 0;
    }

    for (const powerId of POWER_IDS) {
      research.powerRanks[powerId] = derivePowerRankFromHistoricalDiscoveries(powerDiscoveries[powerId]);
      research.powerProgress[powerId] = 0;
    }
  }

  return {
    familySeen,
    bossSeen,
    familyKills,
    bossKills,
    powerDiscoveries,
    research,
  };
}

export function getCodexFamilyResearchState(codex = {}, familyId) {
  const normalized = ensureNormalizedCodex(codex);
  const milestones = getFamilyMilestones(familyId);
  const researchedRank = sanitizeWholeNumber(normalized?.research?.familyRanks?.[familyId] || 0, 0, milestones.length);
  const nextMilestone = getNextFamilyMilestone(familyId, researchedRank);
  const researchNeeded = nextMilestone?.kills || 0;
  const researchProgress = clampProgress(normalized?.research?.familyProgress?.[familyId] || 0, researchNeeded);

  return {
    familyId,
    researchedRank,
    maxResearchRank: milestones.length,
    researchProgress,
    researchNeeded,
    researchReady: !!nextMilestone && researchProgress >= researchNeeded,
    nextMilestone,
  };
}

export function getCodexBossResearchState(codex = {}, bossId) {
  const normalized = ensureNormalizedCodex(codex);
  const milestones = getBossMilestones(bossId);
  const researchedRank = sanitizeWholeNumber(normalized?.research?.bossRanks?.[bossId] || 0, 0, milestones.length);
  const nextMilestone = getNextBossMilestone(bossId, researchedRank);
  const researchNeeded = nextMilestone?.kills || 0;
  const researchProgress = clampProgress(normalized?.research?.bossProgress?.[bossId] || 0, researchNeeded);

  return {
    bossId,
    researchedRank,
    maxResearchRank: milestones.length,
    researchProgress,
    researchNeeded,
    researchReady: !!nextMilestone && researchProgress >= researchNeeded,
    nextMilestone,
  };
}

export function getCodexPowerResearchState(codex = {}, powerId) {
  const normalized = ensureNormalizedCodex(codex);
  const discoveries = Number(normalized?.powerDiscoveries?.[powerId] || 0);
  const maxResearchRank = getMaxPowerResearchRank();
  const researchedRank =
    discoveries > 0
      ? Math.max(1, sanitizeWholeNumber(normalized?.research?.powerRanks?.[powerId] || 0, 0, maxResearchRank))
      : 0;
  const nextRank = researchedRank > 0 ? getNextPowerRankEntry(researchedRank) : null;
  const researchNeeded = nextRank?.discoveries || 0;
  const researchProgress =
    researchedRank > 0
      ? clampProgress(normalized?.research?.powerProgress?.[powerId] || 0, researchNeeded)
      : 0;

  return {
    powerId,
    discoveries,
    researchedRank,
    maxResearchRank,
    researchProgress,
    researchNeeded,
    researchReady: !!nextRank && researchProgress >= researchNeeded,
    nextRank,
  };
}

export function computeCodexBonuses(codex = {}) {
  const bonuses = emptyBonuses();
  const normalized = ensureNormalizedCodex(codex);

  for (const familyId of FAMILY_IDS) {
    const researchedRank = getCodexFamilyResearchState(normalized, familyId).researchedRank;
    for (const milestone of getFamilyMilestones(familyId).slice(0, researchedRank)) {
      addBonus(bonuses, milestone.bonus);
    }
  }

  for (const bossId of BOSS_IDS) {
    const researchedRank = getCodexBossResearchState(normalized, bossId).researchedRank;
    for (const milestone of getBossMilestones(bossId).slice(0, researchedRank)) {
      addBonus(bonuses, milestone.bonus);
    }
  }

  return bonuses;
}

export function syncCodexBonuses(player, codex) {
  const codexBonuses = computeCodexBonuses(codex);
  const refreshed = refreshStats({
    ...player,
    codexBonuses,
  });
  return {
    ...refreshed,
    hp: Math.min(refreshed.maxHp, refreshed.hp ?? refreshed.maxHp),
  };
}

export function recordCodexSighting(codex = {}, enemy = {}) {
  const familyId = enemy?.familyTraitId || enemy?.family || null;
  const bossId = enemy?.isBoss ? enemy?.id || null : null;
  const familySeen = !!codex?.familySeen?.[familyId];
  const bossSeen = !bossId || !!codex?.bossSeen?.[bossId];

  if ((familyId ? familySeen : true) && bossSeen) return codex;

  const next = normalizeCodexState(codex);
  if (familyId) next.familySeen[familyId] = true;
  if (bossId) next.bossSeen[bossId] = true;
  return next;
}

export function recordCodexKill(codex = {}, enemy = {}, { familyGain = 1, bossGain = 1 } = {}) {
  const next = normalizeCodexState(recordCodexSighting(codex, enemy));
  const familyId = enemy?.familyTraitId || enemy?.family || null;

  if (familyId) {
    const appliedGain = Math.max(1, Math.floor(familyGain || 1));
    next.familyKills[familyId] = sanitizeWholeNumber((next.familyKills[familyId] || 0) + appliedGain, 0, 10_000_000);
    const familyResearch = getCodexFamilyResearchState(next, familyId);
    if (familyResearch.nextMilestone) {
      next.research.familyProgress[familyId] = clampProgress(
        Number(next.research?.familyProgress?.[familyId] || 0) + appliedGain,
        familyResearch.researchNeeded
      );
    }
  }

  if (enemy?.isBoss && enemy?.id) {
    const appliedGain = Math.max(1, Math.floor(bossGain || 1));
    next.bossKills[enemy.id] = sanitizeWholeNumber((next.bossKills[enemy.id] || 0) + appliedGain, 0, 100_000);
    const bossResearch = getCodexBossResearchState(next, enemy.id);
    if (bossResearch.nextMilestone) {
      next.research.bossProgress[enemy.id] = clampProgress(
        Number(next.research?.bossProgress?.[enemy.id] || 0) + appliedGain,
        bossResearch.researchNeeded
      );
    }
  }

  return next;
}

export function recordLegendaryPowerDiscovery(codex = {}, item = null, gain = 1) {
  const powerId = item?.legendaryPowerId || null;
  if (!powerId) return { codex: normalizeCodexState(codex), unlockedPower: null };

  const next = normalizeCodexState(codex);
  const previousDiscoveries = Number(next.powerDiscoveries?.[powerId] || 0);
  const appliedGain = Math.max(1, Math.floor(gain || 1));
  next.powerDiscoveries[powerId] = sanitizeWholeNumber(previousDiscoveries + appliedGain, previousDiscoveries, 100_000);

  const isFirstDiscovery = previousDiscoveries <= 0;
  if (isFirstDiscovery) {
    next.research.powerRanks[powerId] = Math.max(1, Number(next.research?.powerRanks?.[powerId] || 0));
    next.research.powerProgress[powerId] = 0;
  }

  const progressGain = isFirstDiscovery ? Math.max(0, appliedGain - 1) : appliedGain;
  const powerResearch = getCodexPowerResearchState(next, powerId);
  if (powerResearch.nextRank && progressGain > 0) {
    next.research.powerProgress[powerId] = clampProgress(
      Number(next.research?.powerProgress?.[powerId] || 0) + progressGain,
      powerResearch.researchNeeded
    );
  }

  return {
    codex: next,
    unlockedPower: isFirstDiscovery ? LEGENDARY_POWERS.find(power => power.id === powerId) || null : null,
  };
}

export function getLegendaryPowerMastery(powerId, codex = {}) {
  const normalized = ensureNormalizedCodex(codex);
  const discoveries = Number(normalized?.powerDiscoveries?.[powerId] || 0);

  if (discoveries <= 0) {
    return {
      rank: 0,
      researchedRank: 0,
      discoveries: 0,
      label: "Oculto",
      imprintCostReduction: 0,
      huntBias: 0,
      researchProgress: 0,
      researchNeeded: 0,
      canResearchNext: false,
      nextRank: LEGENDARY_POWER_MASTERY[0] || null,
    };
  }

  const powerResearch = getCodexPowerResearchState(normalized, powerId);
  const currentRank =
    LEGENDARY_POWER_MASTERY.find(entry => entry.rank === powerResearch.researchedRank) ||
    LEGENDARY_POWER_MASTERY[0];

  return {
    ...currentRank,
    rank: powerResearch.researchedRank,
    researchedRank: powerResearch.researchedRank,
    discoveries,
    researchProgress: powerResearch.researchProgress,
    researchNeeded: powerResearch.researchNeeded,
    canResearchNext: powerResearch.researchReady,
    nextRank: powerResearch.nextRank,
  };
}

export function getCodexLegendaryPowerEntries(codex = {}, { abyss = {} } = {}) {
  const normalized = ensureNormalizedCodex(codex);
  return getVisibleLegendaryPowers(abyss).map(power => {
    const discoveries = Number(normalized?.powerDiscoveries?.[power.id] || 0);
    const sources = getLegendaryPowerSources(power.id);
    const mastery = getLegendaryPowerMastery(power.id, normalized);
    return {
      ...power,
      discoveries,
      unlocked: discoveries > 0,
      sources,
      mastery,
    };
  });
}

export function getLegendaryPowerMasteryMap(codex = {}) {
  return Object.fromEntries(POWER_IDS.map(powerId => [powerId, getLegendaryPowerMastery(powerId, codex)]));
}

export function getLegendaryPowerImprintReduction(codex = {}, powerId = null) {
  if (!powerId) return 0;
  return getLegendaryPowerMastery(powerId, codex).imprintCostReduction || 0;
}

export function getLegendaryPowerHuntBias(codex = {}, powerId = null) {
  if (!powerId) return 0;
  return getLegendaryPowerMastery(powerId, codex).huntBias || 0;
}

export function getUnlockedLegendaryPowers(codex = {}, { specialization = null, className = null, abyss = {} } = {}) {
  const preferredArchetypes = [specialization, className].filter(Boolean);
  const defaultArchetype = className || "warrior";
  return getCodexLegendaryPowerEntries(codex, { abyss })
    .filter(entry => entry.unlocked)
    .sort((left, right) => {
      const leftPreferred =
        left.archetype === "general" ||
        preferredArchetypes.includes(left.archetype) ||
        left.archetype === defaultArchetype;
      const rightPreferred =
        right.archetype === "general" ||
        preferredArchetypes.includes(right.archetype) ||
        right.archetype === defaultArchetype;
      if (leftPreferred !== rightPreferred) return leftPreferred ? -1 : 1;
      if ((right.mastery?.rank || 0) !== (left.mastery?.rank || 0)) return (right.mastery?.rank || 0) - (left.mastery?.rank || 0);
      if ((right.discoveries || 0) !== (left.discoveries || 0)) return (right.discoveries || 0) - (left.discoveries || 0);
      return left.name.localeCompare(right.name, "es");
    });
}

export function getHighestUnlockedTierForFamily(familyId, maxTier = 1, runContext = null) {
  const normalizedMaxTier = Math.max(1, Math.floor(Number(maxTier || 1)));
  for (let tier = normalizedMaxTier; tier >= 1; tier -= 1) {
    if (resolveEncounterForTier(tier, runContext)?.family === familyId) {
      return tier;
    }
  }
  return null;
}

export function getEarliestTierForFamily(familyId, runContext = null) {
  for (let tier = 1; tier <= BASE_TIER_COUNT; tier += 1) {
    if (resolveEncounterForTier(tier, runContext)?.family === familyId) {
      return tier;
    }
  }
  return null;
}

function getHighestUnlockedTierForRunSlot(slot = 1, maxTier = 1) {
  const normalizedTier = Math.max(1, Math.floor(Number(maxTier || 1)));
  const normalizedSlot = Math.max(1, Math.min(BOSS_SLOT_COUNT, Math.floor(Number(slot || 1))));
  const firstTier = normalizedSlot * BOSS_SLOT_INTERVAL;
  if (normalizedTier < firstTier) return null;
  const unlockedCycles = Math.floor((normalizedTier - firstTier) / BASE_TIER_COUNT);
  return firstTier + unlockedCycles * BASE_TIER_COUNT;
}

function getCurrentRunBossInfoMap(runContext = null, maxTier = 1) {
  if (!runContext) return new Map();

  const normalizedRunContext = normalizeRunContext(runContext);
  const infoByBossId = new Map();

  for (let slot = 1; slot <= BOSS_SLOT_COUNT; slot += 1) {
    const bossId = normalizedRunContext?.bossSlots?.[slot];
    if (!bossId || !BOSS_BY_ID.has(bossId)) continue;

    const earliestCurrentRunTier = slot * BOSS_SLOT_INTERVAL;
    const bestUnlockedTier = getHighestUnlockedTierForRunSlot(slot, maxTier);
    const previous = infoByBossId.get(bossId);

    infoByBossId.set(bossId, {
      inCurrentRoute: true,
      currentRunSlot: previous?.currentRunSlot != null ? Math.min(previous.currentRunSlot, slot) : slot,
      earliestCurrentRunTier:
        previous?.earliestCurrentRunTier != null
          ? Math.min(previous.earliestCurrentRunTier, earliestCurrentRunTier)
          : earliestCurrentRunTier,
      bestUnlockedTier: Math.max(previous?.bestUnlockedTier || 0, bestUnlockedTier || 0) || null,
    });
  }

  return infoByBossId;
}

function getCurrentRunBossInfo(bossId, { maxTier = 1, runContext = null, infoByBossId = null } = {}) {
  const currentRunInfo = (infoByBossId || getCurrentRunBossInfoMap(runContext, maxTier)).get(bossId);
  if (currentRunInfo) return currentRunInfo;

  return {
    inCurrentRoute: false,
    currentRunSlot: null,
    earliestCurrentRunTier: null,
    bestUnlockedTier: null,
  };
}

export function getHighestUnlockedTierForBoss(bossId, maxTier = 1, runContext = null) {
  const currentRunTier = getCurrentRunBossInfo(bossId, { maxTier, runContext }).bestUnlockedTier;
  if (currentRunTier != null) return currentRunTier;
  if (runContext) return null;
  const staticTier = BOSS_BY_ID.get(bossId)?.tier || null;
  return staticTier != null && staticTier <= maxTier ? staticTier : null;
}

export function getBestUnlockedTierForPower(entry = {}, maxTier = 1, runContext = null) {
  const bossTier =
    (entry.sources?.bossIds || [])
      .map(bossId => getHighestUnlockedTierForBoss(bossId, maxTier, runContext))
      .filter(tier => tier != null)
      .sort((left, right) => right - left)[0] || null;
  if (bossTier) return bossTier;

  return (
    (entry.sources?.familyIds || [])
      .map(familyId => getHighestUnlockedTierForFamily(familyId, maxTier, runContext))
      .filter(Boolean)
      .sort((left, right) => right - left)[0] || null
  );
}

function matchesPreferredArchetype(entry = {}, specialization = null, className = null) {
  if (!entry?.archetype) return false;
  if (entry.archetype === "general") return true;
  const fallbackArchetype = className || "warrior";
  return entry.archetype === specialization || entry.archetype === className || entry.archetype === fallbackArchetype;
}

export function getCodexFamilyEntries(codex = {}) {
  const normalized = ensureNormalizedCodex(codex);
  return Object.entries(ENEMY_FAMILIES).map(([familyId, family]) => {
    const kills = Number(normalized?.familyKills?.[familyId] || 0);
    const mastery = FAMILY_MASTERY[familyId] || { milestones: [] };
    const research = getCodexFamilyResearchState(normalized, familyId);

    return {
      id: familyId,
      seen: !!normalized?.familySeen?.[familyId],
      name: family.name,
      traitName: family.traitName,
      description: family.description,
      kills,
      milestones: mastery.milestones,
      unlockedCount: research.researchedRank,
      researchedRank: research.researchedRank,
      researchProgress: research.researchProgress,
      researchNeeded: research.researchNeeded,
      researchReady: research.researchReady,
      maxResearchRank: research.maxResearchRank,
      nextMilestone: research.nextMilestone,
    };
  });
}

export function getCodexBossEntries(codex = {}, { maxTier = 1, runContext = null, abyss = {} } = {}) {
  const normalized = ensureNormalizedCodex(codex);
  const normalizedMaxTier = Number(maxTier || 1);
  const currentRunInfoById = getCurrentRunBossInfoMap(runContext, normalizedMaxTier);

  return BOSSES.map(boss => {
    const kills = Number(normalized?.bossKills?.[boss.id] || 0);
    const mastery = BOSS_MASTERY[boss.id] || { milestones: [] };
    const research = getCodexBossResearchState(normalized, boss.id);
    const currentRunInfo = getCurrentRunBossInfo(boss.id, {
      maxTier: normalizedMaxTier,
      runContext,
      infoByBossId: currentRunInfoById,
    });

    return {
      id: boss.id,
      seen: !!normalized?.bossSeen?.[boss.id],
      name: boss.name,
      family: boss.family,
      tier: boss.tier,
      baseTier: boss.tier,
      intro: boss.intro,
      huntLabel: boss.huntLabel || null,
      huntDescription: boss.huntDescription || null,
      favoredFamilies: [...(boss.favoredFamilies || [])],
      favoredStats: [...(boss.favoredStats || [])],
      legendaryDrops: getTargetedLegendaryDropsForEnemy(boss, { abyss }),
      milestones: mastery.milestones,
      kills,
      unlockedCount: research.researchedRank,
      researchedRank: research.researchedRank,
      researchProgress: research.researchProgress,
      researchNeeded: research.researchNeeded,
      researchReady: research.researchReady,
      maxResearchRank: research.maxResearchRank,
      nextMilestone: research.nextMilestone,
      ...currentRunInfo,
    };
  });
}

export function getCodexUnlockedMilestones(codex = {}, { abyss = {} } = {}) {
  const masteryMilestones = [...getCodexFamilyEntries(codex), ...getCodexBossEntries(codex)]
    .reduce((total, entry) => total + (entry.unlockedCount || 0), 0);
  const unlockedPowers = getCodexLegendaryPowerEntries(codex, { abyss })
    .reduce((total, entry) => total + Math.max(0, entry.mastery?.rank || 0), 0);
  return masteryMilestones + unlockedPowers;
}

export function getCodexHuntOverview(
  codex = {},
  { maxTier = 1, specialization = null, className = null, runContext = null, abyss = {} } = {}
) {
  const powerEntries = getCodexLegendaryPowerEntries(codex, { abyss });
  const bossEntries = getCodexBossEntries(codex, { maxTier, runContext, abyss });
  const familyEntries = getCodexFamilyEntries(codex);
  const discoveries = codex?.powerDiscoveries || {};

  const discoverNow = powerEntries
    .filter(entry => !entry.unlocked)
    .map(entry => ({
      ...entry,
      sourceTier: getBestUnlockedTierForPower(entry, maxTier, runContext),
      preferredArchetype: matchesPreferredArchetype(entry, specialization, className),
    }))
    .filter(entry => entry.sourceTier != null)
    .sort((left, right) => {
      if (left.preferredArchetype !== right.preferredArchetype) return left.preferredArchetype ? -1 : 1;
      return left.sourceTier - right.sourceTier || left.name.localeCompare(right.name, "es");
    });

  const masteryNow = powerEntries
    .filter(entry => entry.unlocked && entry.mastery?.nextRank)
    .map(entry => ({
      ...entry,
      sourceTier: getBestUnlockedTierForPower(entry, maxTier, runContext),
      preferredArchetype: matchesPreferredArchetype(entry, specialization, className),
      remainingCopies: Math.max(0, Number(entry.mastery?.researchNeeded || 0) - Number(entry.mastery?.researchProgress || 0)),
    }))
    .filter(entry => entry.sourceTier != null)
    .sort((left, right) => {
      if (left.preferredArchetype !== right.preferredArchetype) return left.preferredArchetype ? -1 : 1;
      return left.remainingCopies - right.remainingCopies || left.sourceTier - right.sourceTier || left.name.localeCompare(right.name, "es");
    });

  const hotBosses = bossEntries
    .filter(entry => entry.seen && entry.inCurrentRoute && entry.bestUnlockedTier != null && (entry.legendaryDrops?.length || 0) > 0)
    .map(entry => {
      const missingCount = (entry.legendaryDrops || []).filter(drop => !(discoveries?.[drop?.power?.id] > 0)).length;
      const masteryCount = (entry.legendaryDrops || []).filter(drop => {
        const powerId = drop?.power?.id;
        return powerId && discoveries?.[powerId] > 0 && getLegendaryPowerMastery(powerId, codex).nextRank;
      }).length;
      const preferredCount = (entry.legendaryDrops || []).filter(drop => matchesPreferredArchetype(drop.power, specialization, className)).length;
      return {
        ...entry,
        sourceTier: entry.bestUnlockedTier,
        missingCount,
        masteryCount,
        preferredCount,
        score: missingCount * 10 + masteryCount * 5 + preferredCount * 3 + entry.bestUnlockedTier * 0.25,
      };
    })
    .filter(entry => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.sourceTier - right.sourceTier)
    .slice(0, 4);

  const hotFamilies = familyEntries
    .filter(entry => entry.seen)
    .map(entry => {
      const sourceTier = getHighestUnlockedTierForFamily(entry.id, maxTier, runContext);
      const relatedPowers = powerEntries.filter(power => (power.sources?.familyIds || []).includes(entry.id));
      const missingCount = relatedPowers.filter(power => !power.unlocked).length;
      const masteryCount = relatedPowers.filter(power => power.unlocked && power.mastery?.nextRank).length;
      const preferredCount = relatedPowers.filter(power => matchesPreferredArchetype(power, specialization, className)).length;
      return {
        ...entry,
        sourceTier,
        missingCount,
        masteryCount,
        preferredCount,
        score: (sourceTier ? 1 : 0) * (missingCount * 8 + masteryCount * 4 + preferredCount * 2),
      };
    })
    .filter(entry => entry.sourceTier != null && entry.score > 0)
    .sort((left, right) => right.score - left.score || left.sourceTier - right.sourceTier || left.name.localeCompare(right.name, "es"))
    .slice(0, 4);

  return {
    discoverNow,
    masteryNow,
    hotBosses,
    hotFamilies,
  };
}
