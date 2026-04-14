import { BOSSES } from "../../data/bosses";
import { ENEMIES } from "../../data/enemies";
import { ENEMY_FAMILIES } from "../../data/encounters";
import { LEGENDARY_POWERS } from "../../data/legendaryPowers";
import { refreshStats } from "../combat/statEngine";
import { getLegendaryPowerSources, getTargetedLegendaryDropsForEnemy } from "../../utils/legendaryPowers";

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

export function createEmptyCodexState() {
  return {
    familySeen: {},
    bossSeen: {},
    familyKills: {},
    bossKills: {},
    powerDiscoveries: {},
  };
}

export function normalizeCodexState(codex = {}, discoveredPowerIds = []) {
  const familySeen = Object.fromEntries(
    Object.keys(ENEMY_FAMILIES).map(familyId => [familyId, !!(codex?.familySeen?.[familyId] || Number(codex?.familyKills?.[familyId] || 0) > 0)])
  );
  const bossSeen = Object.fromEntries(
    BOSSES.map(boss => [boss.id, !!(codex?.bossSeen?.[boss.id] || Number(codex?.bossKills?.[boss.id] || 0) > 0)])
  );
  const familyKills = Object.fromEntries(
    Object.keys(ENEMY_FAMILIES).map(familyId => [familyId, sanitizeWholeNumber(codex?.familyKills?.[familyId] || 0, 0, 10_000_000)])
  );
  const bossKills = Object.fromEntries(
    BOSSES.map(boss => [boss.id, sanitizeWholeNumber(codex?.bossKills?.[boss.id] || 0, 0, 100_000)])
  );
  const powerDiscoveries = Object.fromEntries(
    LEGENDARY_POWERS.map(power => [
      power.id,
      sanitizeWholeNumber(codex?.powerDiscoveries?.[power.id] || 0, 0, 100_000),
    ])
  );
  for (const powerId of discoveredPowerIds || []) {
    if (!powerId || !(powerId in powerDiscoveries)) continue;
    powerDiscoveries[powerId] = Math.max(1, powerDiscoveries[powerId] || 0);
  }
  return {
    familySeen,
    bossSeen,
    familyKills,
    bossKills,
    powerDiscoveries,
  };
}

function addBonus(target, bonus = {}) {
  for (const [key, value] of Object.entries(bonus)) {
    target[key] = (target[key] || 0) + value;
  }
  return target;
}

export function computeCodexBonuses(codex = {}) {
  const bonuses = emptyBonuses();

  for (const [familyId, config] of Object.entries(FAMILY_MASTERY)) {
    const kills = Number(codex?.familyKills?.[familyId] || 0);
    for (const milestone of config.milestones || []) {
      if (kills >= milestone.kills) addBonus(bonuses, milestone.bonus);
    }
  }

  for (const [bossId, config] of Object.entries(BOSS_MASTERY)) {
    const kills = Number(codex?.bossKills?.[bossId] || 0);
    for (const milestone of config.milestones || []) {
      if (kills >= milestone.kills) addBonus(bonuses, milestone.bonus);
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
    next.familyKills[familyId] = sanitizeWholeNumber(
      (next.familyKills[familyId] || 0) + Math.max(1, Math.floor(familyGain || 1)),
      0,
      10_000_000
    );
  }
  if (enemy?.isBoss && enemy?.id) {
    next.bossKills[enemy.id] = sanitizeWholeNumber(
      (next.bossKills[enemy.id] || 0) + Math.max(1, Math.floor(bossGain || 1)),
      0,
      100_000
    );
  }
  return next;
}

export function recordLegendaryPowerDiscovery(codex = {}, item = null, gain = 1) {
  const powerId = item?.legendaryPowerId || null;
  if (!powerId) return { codex: normalizeCodexState(codex), unlockedPower: null };
  const next = normalizeCodexState(codex);
  const previousDiscoveries = Number(next.powerDiscoveries?.[powerId] || 0);
  next.powerDiscoveries[powerId] = sanitizeWholeNumber(
    previousDiscoveries + Math.max(1, Math.floor(gain || 1)),
    previousDiscoveries,
    100_000
  );
  return {
    codex: next,
    unlockedPower: previousDiscoveries <= 0 ? LEGENDARY_POWERS.find(power => power.id === powerId) || null : null,
  };
}

export function getCodexLegendaryPowerEntries(codex = {}) {
  return LEGENDARY_POWERS.map(power => {
    const discoveries = Number(codex?.powerDiscoveries?.[power.id] || 0);
    const sources = getLegendaryPowerSources(power.id);
    const mastery = getLegendaryPowerMastery(power.id, codex);
    return {
      ...power,
      discoveries,
      unlocked: discoveries > 0,
      sources,
      mastery,
    };
  });
}

export function getLegendaryPowerMastery(powerId, codex = {}) {
  const discoveries = Number(codex?.powerDiscoveries?.[powerId] || 0);
  if (discoveries <= 0) {
    return {
      rank: 0,
      discoveries: 0,
      label: "Oculto",
      imprintCostReduction: 0,
      huntBias: 0,
      nextRank: LEGENDARY_POWER_MASTERY[0] || null,
    };
  }
  const rank = [...LEGENDARY_POWER_MASTERY]
    .reverse()
    .find(entry => discoveries >= entry.discoveries) || LEGENDARY_POWER_MASTERY[0];
  const nextRank = LEGENDARY_POWER_MASTERY.find(entry => entry.discoveries > discoveries) || null;
  return {
    ...rank,
    discoveries,
    nextRank,
  };
}

export function getLegendaryPowerMasteryMap(codex = {}) {
  return Object.fromEntries(
    LEGENDARY_POWERS.map(power => [power.id, getLegendaryPowerMastery(power.id, codex)])
  );
}

export function getLegendaryPowerImprintReduction(codex = {}, powerId = null) {
  if (!powerId) return 0;
  return getLegendaryPowerMastery(powerId, codex).imprintCostReduction || 0;
}

export function getLegendaryPowerHuntBias(codex = {}, powerId = null) {
  if (!powerId) return 0;
  return getLegendaryPowerMastery(powerId, codex).huntBias || 0;
}

export function getUnlockedLegendaryPowers(codex = {}, { specialization = null, className = null } = {}) {
  const preferredArchetypes = [specialization, className].filter(Boolean);
  const defaultArchetype = className || "warrior";
  return getCodexLegendaryPowerEntries(codex)
    .filter(entry => entry.unlocked)
    .sort((left, right) => {
      const leftPreferred = preferredArchetypes.includes(left.archetype) || left.archetype === defaultArchetype;
      const rightPreferred = preferredArchetypes.includes(right.archetype) || right.archetype === defaultArchetype;
      if (leftPreferred !== rightPreferred) return leftPreferred ? -1 : 1;
      if ((right.mastery?.rank || 0) !== (left.mastery?.rank || 0)) return (right.mastery?.rank || 0) - (left.mastery?.rank || 0);
      if ((right.discoveries || 0) !== (left.discoveries || 0)) return (right.discoveries || 0) - (left.discoveries || 0);
      return left.name.localeCompare(right.name, "es");
    });
}

export function getHighestUnlockedTierForFamily(familyId, maxTier = 1) {
  return [...ENEMIES]
    .filter(enemy => enemy.family === familyId && enemy.tier <= maxTier)
    .sort((left, right) => right.tier - left.tier)[0]?.tier || null;
}

export function getBestUnlockedTierForPower(entry = {}, maxTier = 1) {
  const bossTier = (entry.sources?.bossIds || [])
    .map(bossId => BOSSES.find(boss => boss.id === bossId)?.tier || null)
    .filter(tier => tier != null && tier <= maxTier)
    .sort((left, right) => right - left)[0] || null;
  if (bossTier) return bossTier;

  return (entry.sources?.familyIds || [])
    .map(familyId => getHighestUnlockedTierForFamily(familyId, maxTier))
    .filter(Boolean)
    .sort((left, right) => right - left)[0] || null;
}

function matchesPreferredArchetype(entry = {}, specialization = null, className = null) {
  if (!entry?.archetype) return false;
  const fallbackArchetype = className || "warrior";
  return entry.archetype === specialization || entry.archetype === className || entry.archetype === fallbackArchetype;
}

export function getCodexFamilyEntries(codex = {}) {
  return Object.entries(ENEMY_FAMILIES).map(([familyId, family]) => {
    const kills = Number(codex?.familyKills?.[familyId] || 0);
    const mastery = FAMILY_MASTERY[familyId] || { milestones: [] };
    const unlockedCount = mastery.milestones.filter(milestone => kills >= milestone.kills).length;
    const nextMilestone = mastery.milestones.find(milestone => kills < milestone.kills) || null;
    return {
      id: familyId,
      seen: !!codex?.familySeen?.[familyId],
      name: family.name,
      traitName: family.traitName,
      description: family.description,
      kills,
      milestones: mastery.milestones,
      unlockedCount,
      nextMilestone,
    };
  });
}

export function getCodexBossEntries(codex = {}) {
  return BOSSES.map(boss => {
    const kills = Number(codex?.bossKills?.[boss.id] || 0);
    const mastery = BOSS_MASTERY[boss.id] || { milestones: [] };
    const unlockedCount = mastery.milestones.filter(milestone => kills >= milestone.kills).length;
    const nextMilestone = mastery.milestones.find(milestone => kills < milestone.kills) || null;
    return {
      id: boss.id,
      seen: !!codex?.bossSeen?.[boss.id],
      name: boss.name,
      family: boss.family,
      tier: boss.tier,
      intro: boss.intro,
      huntLabel: boss.huntLabel || null,
      huntDescription: boss.huntDescription || null,
      favoredFamilies: [...(boss.favoredFamilies || [])],
      favoredStats: [...(boss.favoredStats || [])],
      legendaryDrops: getTargetedLegendaryDropsForEnemy(boss),
      milestones: mastery.milestones,
      kills,
      unlockedCount,
      nextMilestone,
    };
  });
}

export function getCodexUnlockedMilestones(codex = {}) {
  const masteryMilestones = [...getCodexFamilyEntries(codex), ...getCodexBossEntries(codex)]
    .reduce((total, entry) => total + (entry.unlockedCount || 0), 0);
  const unlockedPowers = getCodexLegendaryPowerEntries(codex)
    .reduce((total, entry) => total + Math.max(0, entry.mastery?.rank || 0), 0);
  return masteryMilestones + unlockedPowers;
}

export function getCodexHuntOverview(codex = {}, { maxTier = 1, specialization = null, className = null } = {}) {
  const powerEntries = getCodexLegendaryPowerEntries(codex);
  const bossEntries = getCodexBossEntries(codex);
  const familyEntries = getCodexFamilyEntries(codex);
  const discoveries = codex?.powerDiscoveries || {};

  const discoverNow = powerEntries
    .filter(entry => !entry.unlocked)
    .map(entry => ({
      ...entry,
      sourceTier: getBestUnlockedTierForPower(entry, maxTier),
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
      sourceTier: getBestUnlockedTierForPower(entry, maxTier),
      preferredArchetype: matchesPreferredArchetype(entry, specialization, className),
      remainingCopies: Math.max(0, Number(entry.mastery?.nextRank?.discoveries || 0) - Number(entry.discoveries || 0)),
    }))
    .filter(entry => entry.sourceTier != null)
    .sort((left, right) => {
      if (left.preferredArchetype !== right.preferredArchetype) return left.preferredArchetype ? -1 : 1;
      return left.remainingCopies - right.remainingCopies || left.sourceTier - right.sourceTier || left.name.localeCompare(right.name, "es");
    });

  const hotBosses = bossEntries
    .filter(entry => entry.seen && entry.tier <= maxTier && (entry.legendaryDrops?.length || 0) > 0)
    .map(entry => {
      const missingCount = (entry.legendaryDrops || []).filter(drop => !(discoveries?.[drop?.power?.id] > 0)).length;
      const masteryCount = (entry.legendaryDrops || []).filter(drop => {
        const powerId = drop?.power?.id;
        return powerId && discoveries?.[powerId] > 0 && getLegendaryPowerMastery(powerId, codex).nextRank;
      }).length;
      const preferredCount = (entry.legendaryDrops || []).filter(drop => matchesPreferredArchetype(drop.power, specialization, className)).length;
      return {
        ...entry,
        missingCount,
        masteryCount,
        preferredCount,
        score: missingCount * 10 + masteryCount * 5 + preferredCount * 3 + entry.tier * 0.25,
      };
    })
    .filter(entry => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.tier - right.tier)
    .slice(0, 4);

  const hotFamilies = familyEntries
    .filter(entry => entry.seen)
    .map(entry => {
      const sourceTier = getHighestUnlockedTierForFamily(entry.id, maxTier);
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
