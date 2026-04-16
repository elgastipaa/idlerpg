const SINK_LEVELS = 20;

// Sink talents are authored once here and injected into both TALENTS and TALENT_TREES.

function roundTo(value, decimals = 6) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatPct(value) {
  return (value * 100).toFixed(1).replace(/\.0$/, "");
}

function formatNumber(value, decimals = 2) {
  const rounded = roundTo(value, decimals);
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "");
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
  if (effectStat === "volatileCasting") return "cast volatil";
  if (effectStat === "chainBurst") return "burst en cadena";
  if (effectStat === "controlMastery") return "dominio de control";
  if (effectStat === "spellMemory") return "memoria de hechizo";
  return effectStat;
}

function buildSinkEffect(effectDef, totalBonus) {
  const kind = effectDef.kind || "multiplier";
  if (kind === "flat") {
    return { stat: effectDef.stat, flat: roundTo(totalBonus, 6) };
  }
  if (kind === "ratio") {
    return { stat: effectDef.stat, ratio: roundTo(totalBonus, 6) };
  }
  return { stat: effectDef.stat, multiplier: roundTo(1 + totalBonus, 6) };
}

function formatSinkBonus(effectDef, totalBonus) {
  const label = effectDef.label || getEffectLabel(effectDef.stat);
  if (effectDef.kind === "multiplier" || effectDef.kind === "ratio" || effectDef.displayAsPercent) {
    return `+${formatPct(totalBonus)}% ${label}`;
  }
  return `+${formatNumber(totalBonus, effectDef.decimals ?? 2)} ${label}`;
}

function buildSinkChain({
  idPrefix,
  classId,
  specId,
  title,
  effects,
  baseCost,
  costStep,
  baseUnlockLevel,
  descriptionFormatter,
}) {
  const talents = [];
  for (let level = 1; level <= SINK_LEVELS; level += 1) {
    const id = `${idPrefix}_${level}`;
    const prevId = level > 1 ? `${idPrefix}_${level - 1}` : null;
    const resolvedEffects = (effects || []).map(effectDef => ({
      ...effectDef,
      totalBonus: diminishingTotal(level, SINK_LEVELS, effectDef.maxBonus),
    }));
    const unlockLevel = baseUnlockLevel + Math.floor((level - 1) / 3) * 4;
    const cost = Math.max(1, Math.round(baseCost + (level - 1) * costStep));

    talents.push({
      id,
      classId,
      specId,
      name: title,
      description:
        typeof descriptionFormatter === "function"
          ? descriptionFormatter({ level, levels: SINK_LEVELS, effects: resolvedEffects })
          : `${title}: nivel ${level}/${SINK_LEVELS}, ${resolvedEffects.map(effectDef => formatSinkBonus(effectDef, effectDef.totalBonus)).join(" · ")}.`,
      type: "aura",
      trigger: { stat: "always" },
      effect: buildSinkEffect(resolvedEffects[0], resolvedEffects[0].totalBonus),
      ...(resolvedEffects.length > 1
        ? {
            extraEffects: resolvedEffects
              .slice(1)
              .map(effectDef => buildSinkEffect(effectDef, effectDef.totalBonus)),
          }
        : {}),
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
  segment = "keystone",
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
      segment,
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
    effects: [
      { stat: "defense", kind: "multiplier", maxBonus: 0.42, label: "defensa total" },
    ],
    baseCost: 3,
    costStep: 0.8,
    baseUnlockLevel: 50,
  }),
  ...buildSinkChain({
    idPrefix: "berserker_blood_mastery",
    classId: "warrior",
    specId: "berserker",
    title: "Maestria Sanguinaria",
    effects: [
      { stat: "damage", kind: "multiplier", maxBonus: 0.48, label: "dano total" },
    ],
    baseCost: 4,
    costStep: 0.85,
    baseUnlockLevel: 58,
  }),
  ...buildSinkChain({
    idPrefix: "juggernaut_eternal_bastion",
    classId: "warrior",
    specId: "juggernaut",
    title: "Bastion Eterno",
    effects: [
      { stat: "defense", kind: "multiplier", maxBonus: 0.55, label: "defensa total" },
    ],
    baseCost: 4,
    costStep: 0.9,
    baseUnlockLevel: 58,
  }),
  ...buildSinkChain({
    idPrefix: "mage_arcane_mastery",
    classId: "mage",
    specId: null,
    title: "Maestria Arcana",
    effects: [
      { stat: "damage", kind: "multiplier", maxBonus: 0.22, label: "poder arcano total" },
    ],
    descriptionFormatter: ({ level, levels, effects }) =>
      `Maestria Arcana: nivel ${level}/${levels}, +${formatPct(effects[0].totalBonus)}% poder arcano total.`,
    baseCost: 3,
    costStep: 0.8,
    baseUnlockLevel: 50,
  }),
  ...buildSinkChain({
    idPrefix: "sorcerer_volatile_mastery",
    classId: "mage",
    specId: "sorcerer",
    title: "Maestria Volatil",
    effects: [
      { stat: "volatileCasting", kind: "flat", maxBonus: 2.2, label: "cast volatil", decimals: 2 },
      { stat: "chainBurst", kind: "flat", maxBonus: 2.0, label: "burst en cadena", decimals: 2 },
    ],
    baseCost: 4,
    costStep: 0.85,
    baseUnlockLevel: 58,
  }),
  ...buildSinkChain({
    idPrefix: "arcanist_mark_mastery",
    classId: "mage",
    specId: "arcanist",
    title: "Maestria de Marca",
    effects: [
      { stat: "controlMastery", kind: "flat", maxBonus: 0.5, label: "dominio de control", decimals: 2 },
      { stat: "spellMemory", kind: "flat", maxBonus: 1.2, label: "memoria de hechizo", decimals: 2 },
    ],
    baseCost: 4,
    costStep: 0.9,
    baseUnlockLevel: 58,
  }),
];

export const TALENT_SINK_NODES = {
  warrior_general: buildSinkNodes({
    idPrefix: "warrior_iron_mastery",
    x: 4,
    y: 0,
    prereqs: ["warrior_iron_conversion", "warrior_crushing_weight"],
    prereqMode: "any",
    minTreePointsSpent: 8,
  }),
  berserker: buildSinkNodes({
    idPrefix: "berserker_blood_mastery",
    x: 4,
    y: 0,
    prereqs: ["berserker_blood_debt", "berserker_last_breath", "berserker_frenzied_chain"],
    prereqMode: "any",
    minTreePointsSpent: 10,
  }),
  juggernaut: buildSinkNodes({
    idPrefix: "juggernaut_eternal_bastion",
    x: 4,
    y: 0,
    prereqs: ["juggernaut_spiked_defense", "juggernaut_unmoving_mountain", "juggernaut_titanic_momentum"],
    prereqMode: "any",
    minTreePointsSpent: 10,
  }),
  mage_general: buildSinkNodes({
    idPrefix: "mage_arcane_mastery",
    x: 4,
    y: 0,
    prereqs: ["mage_overchannel", "mage_perfect_cast"],
    prereqMode: "any",
    minTreePointsSpent: 8,
  }),
  sorcerer: buildSinkNodes({
    idPrefix: "sorcerer_volatile_mastery",
    x: 4,
    y: 0,
    prereqs: ["sorcerer_chain_burst", "sorcerer_cataclysm", "sorcerer_volatile_casting"],
    prereqMode: "any",
    minTreePointsSpent: 10,
  }),
  arcanist: buildSinkNodes({
    idPrefix: "arcanist_mark_mastery",
    x: 4,
    y: 0,
    prereqs: ["arcanist_spell_memory", "arcanist_time_loop", "arcanist_absolute_control"],
    prereqMode: "any",
    minTreePointsSpent: 10,
  }),
};
