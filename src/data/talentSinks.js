const SINK_LEVELS = 20;

// Sink talents are authored once here and injected into both TALENTS and TALENT_TREES.

function roundTo(value, decimals = 6) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatPct(value) {
  return (value * 100).toFixed(1).replace(/\.0$/, "");
}

function diminishingTotal(level, levels, maxBonus) {
  const t = Math.max(0, Math.min(1, level / levels));
  const k = 3.2;
  const normalized = (1 - Math.exp(-k * t)) / (1 - Math.exp(-k));
  return maxBonus * normalized;
}

function getEffectLabel(effectStat) {
  if (effectStat === "damage") return "dano total";
  if (effectStat === "defense") return "defensa total";
  return effectStat;
}

function buildSinkChain({
  idPrefix,
  classId,
  specId,
  title,
  effectStat,
  maxBonus,
  baseCost,
  costStep,
  baseUnlockLevel,
}) {
  const talents = [];
  for (let level = 1; level <= SINK_LEVELS; level += 1) {
    const id = `${idPrefix}_${level}`;
    const prevId = level > 1 ? `${idPrefix}_${level - 1}` : null;
    const totalBonus = diminishingTotal(level, SINK_LEVELS, maxBonus);
    const unlockLevel = baseUnlockLevel + Math.floor((level - 1) / 3) * 4;
    const cost = Math.max(1, Math.round(baseCost + (level - 1) * costStep));

    talents.push({
      id,
      classId,
      specId,
      name: title,
      description: `${title}: nivel ${level}/${SINK_LEVELS}, +${formatPct(totalBonus)}% ${getEffectLabel(effectStat)}.`,
      type: "aura",
      trigger: { stat: "always" },
      effect: { stat: effectStat, multiplier: roundTo(1 + totalBonus, 6) },
      unlockCondition: { stat: "level", value: unlockLevel },
      cost,
      ...(prevId ? { replaces: prevId } : {}),
    });
  }
  return talents;
}

function buildSinkNodes({
  idPrefix,
  x,
  y,
  prereqs = [],
  prereqMode = "all",
  minTreePointsSpent = 0,
}) {
  const nodes = [];
  for (let level = 1; level <= SINK_LEVELS; level += 1) {
    nodes.push({
      talentId: `${idPrefix}_${level}`,
      x,
      y,
      prereqs: level === 1 ? prereqs : [],
      ...(level === 1 ? { prereqMode, minTreePointsSpent } : {}),
    });
  }
  return nodes;
}

export const TALENT_SINK_TALENTS = [
  ...buildSinkChain({
    idPrefix: "warrior_iron_mastery",
    classId: "warrior",
    specId: null,
    title: "Maestria de Hierro",
    effectStat: "defense",
    maxBonus: 0.42,
    baseCost: 3,
    costStep: 0.8,
    baseUnlockLevel: 55,
  }),
  ...buildSinkChain({
    idPrefix: "berserker_blood_mastery",
    classId: "warrior",
    specId: "berserker",
    title: "Maestria Sanguinaria",
    effectStat: "damage",
    maxBonus: 0.48,
    baseCost: 4,
    costStep: 0.85,
    baseUnlockLevel: 65,
  }),
  ...buildSinkChain({
    idPrefix: "juggernaut_eternal_bastion",
    classId: "warrior",
    specId: "juggernaut",
    title: "Bastion Eterno",
    effectStat: "defense",
    maxBonus: 0.55,
    baseCost: 4,
    costStep: 0.9,
    baseUnlockLevel: 65,
  }),
];

export const TALENT_SINK_NODES = {
  warrior_general: buildSinkNodes({
    idPrefix: "warrior_iron_mastery",
    x: 6,
    y: 0,
    prereqs: ["warrior_war_tax_2", "warrior_campaign_mind_2"],
    prereqMode: "any",
    minTreePointsSpent: 22,
  }),
  berserker: buildSinkNodes({
    idPrefix: "berserker_blood_mastery",
    x: 6,
    y: 0,
    prereqs: ["berserker_riot_heart_2", "berserker_wild_harvest_2"],
    prereqMode: "any",
    minTreePointsSpent: 24,
  }),
  juggernaut: buildSinkNodes({
    idPrefix: "juggernaut_eternal_bastion",
    x: 6,
    y: 0,
    prereqs: ["juggernaut_last_bulwark_2", "juggernaut_titan_skin_2"],
    prereqMode: "any",
    minTreePointsSpent: 24,
  }),
};
