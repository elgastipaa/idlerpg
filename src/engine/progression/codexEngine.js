import { BOSSES } from "../../data/bosses";
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
      { kills: 250, bonus: { dodgeChance: 0.005 }, label: "+0.5% evasion" },
      { kills: 1000, bonus: { damagePct: 0.02 }, label: "+2% dano" },
    ],
  },
  undead: {
    milestones: [
      { kills: 50, bonus: { critDamage: 0.03 }, label: "+3% crit dmg" },
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
      { kills: 1000, bonus: { flatCrit: 0.005 }, label: "+0.5% crit" },
    ],
  },
  demon: {
    milestones: [
      { kills: 50, bonus: { lifesteal: 0.004 }, label: "+0.4% lifesteal" },
      { kills: 250, bonus: { damagePct: 0.015 }, label: "+1.5% dano" },
      { kills: 1000, bonus: { critDamage: 0.04 }, label: "+4% crit dmg" },
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
      { kills: 50, bonus: { skillPower: 0.02 }, label: "+2% poder skill" },
      { kills: 250, bonus: { cooldownReduction: 0.01 }, label: "+1% CDR" },
      { kills: 1000, bonus: { essenceBonus: 0.08 }, label: "+8% esencia" },
    ],
  },
  occult: {
    milestones: [
      { kills: 50, bonus: { skillPower: 0.02 }, label: "+2% poder skill" },
      { kills: 250, bonus: { luck: 2 }, label: "+2 suerte" },
      { kills: 1000, bonus: { lootBonus: 0.015 }, label: "+1.5% loot" },
    ],
  },
  elemental: {
    milestones: [
      { kills: 50, bonus: { damagePct: 0.01 }, label: "+1% dano" },
      { kills: 250, bonus: { skillPower: 0.03 }, label: "+3% poder skill" },
      { kills: 1000, bonus: { flatCrit: 0.005 }, label: "+0.5% crit" },
    ],
  },
  dragon: {
    milestones: [
      { kills: 50, bonus: { hpPct: 0.015 }, label: "+1.5% vida" },
      { kills: 250, bonus: { defensePct: 0.02 }, label: "+2% defensa" },
      { kills: 1000, bonus: { critDamage: 0.04 }, label: "+4% crit dmg" },
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
      { kills: 1, bonus: { cooldownReduction: 0.015 }, label: "+1.5% CDR" },
      { kills: 5, bonus: { lootBonus: 0.02 }, label: "+2% loot" },
    ],
  },
  blood_matriarch: {
    milestones: [
      { kills: 1, bonus: { lifesteal: 0.006 }, label: "+0.6% lifesteal" },
      { kills: 5, bonus: { flatCrit: 0.01 }, label: "+1% crit" },
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
      { kills: 3, bonus: { skillPower: 0.04 }, label: "+4% poder skill" },
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
  "cooldownReduction",
  "skillPower",
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
    familyKills: {},
    bossKills: {},
    powerDiscoveries: {},
  };
}

export function normalizeCodexState(codex = {}, discoveredPowerIds = []) {
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

export function recordCodexKill(codex = {}, enemy = {}) {
  const next = normalizeCodexState(codex);
  const familyId = enemy?.familyTraitId || enemy?.family || null;
  if (familyId) {
    next.familyKills[familyId] = sanitizeWholeNumber((next.familyKills[familyId] || 0) + 1, 0, 10_000_000);
  }
  if (enemy?.isBoss && enemy?.id) {
    next.bossKills[enemy.id] = sanitizeWholeNumber((next.bossKills[enemy.id] || 0) + 1, 0, 100_000);
  }
  return next;
}

export function recordLegendaryPowerDiscovery(codex = {}, item = null) {
  const powerId = item?.legendaryPowerId || null;
  if (!powerId) return { codex: normalizeCodexState(codex), unlockedPower: null };
  const next = normalizeCodexState(codex);
  const previousDiscoveries = Number(next.powerDiscoveries?.[powerId] || 0);
  next.powerDiscoveries[powerId] = sanitizeWholeNumber(previousDiscoveries + 1, previousDiscoveries, 100_000);
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
  return getCodexLegendaryPowerEntries(codex)
    .filter(entry => entry.unlocked)
    .sort((left, right) => {
      const leftPreferred = preferredArchetypes.includes(left.archetype) || left.archetype === "warrior";
      const rightPreferred = preferredArchetypes.includes(right.archetype) || right.archetype === "warrior";
      if (leftPreferred !== rightPreferred) return leftPreferred ? -1 : 1;
      if ((right.mastery?.rank || 0) !== (left.mastery?.rank || 0)) return (right.mastery?.rank || 0) - (left.mastery?.rank || 0);
      if ((right.discoveries || 0) !== (left.discoveries || 0)) return (right.discoveries || 0) - (left.discoveries || 0);
      return left.name.localeCompare(right.name, "es");
    });
}

export function getCodexFamilyEntries(codex = {}) {
  return Object.entries(ENEMY_FAMILIES).map(([familyId, family]) => {
    const kills = Number(codex?.familyKills?.[familyId] || 0);
    const mastery = FAMILY_MASTERY[familyId] || { milestones: [] };
    const unlockedCount = mastery.milestones.filter(milestone => kills >= milestone.kills).length;
    const nextMilestone = mastery.milestones.find(milestone => kills < milestone.kills) || null;
    return {
      id: familyId,
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
