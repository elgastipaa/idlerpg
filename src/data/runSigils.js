export const RUN_SIGILS = [
  {
    id: "free",
    name: "Run Libre",
    shortName: "Libre",
    summary: "Sin bonus ni penalidad. Buena baseline para comparar una corrida normal.",
    focus: "Generalista",
    rewardModifiers: {
      xpMult: 1,
      essenceMult: 1,
      powerHuntMultiplier: 1,
      rarityBonus: {},
    },
    prestigeModifiers: {
      tierEchoMult: 1,
      levelEchoMult: 1,
    },
    codexModifiers: {
      familyKillMult: 1,
      bossKillMult: 1,
      duplicatePowerGainMult: 1,
    },
    playerBonuses: {},
    strengths: ["Sin tradeoff", "Sirve para medir balance base"],
    tradeoffs: ["No sesga la run"],
  },
  {
    id: "ascend",
    name: "Sigilo de Ascenso",
    shortName: "Ascenso",
    summary: "Empuja nivel, tiers y valor de prestigio. Peor para esencia y powers.",
    focus: "Push / prestige",
    rewardModifiers: {
      xpMult: 1.24,
      essenceMult: 0.82,
      powerHuntMultiplier: 0.75,
      rarityBonus: {},
    },
    prestigeModifiers: {
      tierEchoMult: 1.22,
      levelEchoMult: 1.22,
    },
    codexModifiers: {
      familyKillMult: 1,
      bossKillMult: 1,
      duplicatePowerGainMult: 1,
    },
    playerBonuses: {},
    strengths: ["+24% XP", "+22% ecos por tier y nivel"],
    tradeoffs: ["-18% esencia", "-25% caza de powers"],
  },
  {
    id: "hunt",
    name: "Sigilo de Caza",
    shortName: "Caza",
    summary: "Mejora solo la persecucion de powers legendarios. No acelera loot general.",
    focus: "Powers legendarios",
    rewardModifiers: {
      xpMult: 0.82,
      essenceMult: 0.82,
      powerHuntMultiplier: 2.35,
      rarityBonus: {},
    },
    prestigeModifiers: {
      tierEchoMult: 0.82,
      levelEchoMult: 0.82,
    },
    codexModifiers: {
      familyKillMult: 1,
      bossKillMult: 1,
      duplicatePowerGainMult: 2,
    },
    playerBonuses: {},
    strengths: ["+135% sesgo a powers en su fuente", "Duplicados x2 para mastery"],
    tradeoffs: ["-18% XP", "-18% ecos por tier y nivel", "-18% esencia"],
  },
  {
    id: "forge",
    name: "Sigilo de Forja",
    shortName: "Forja",
    summary: "Corrida de tempo: mas esencia, mejores bases y funciones de crafting mas baratas.",
    focus: "Craft / tempo de run",
    rewardModifiers: {
      xpMult: 0.84,
      essenceMult: 1.42,
      powerHuntMultiplier: 0.72,
      rarityBonus: {
        rare: 0.006,
        epic: 0.0015,
      },
    },
    prestigeModifiers: {
      tierEchoMult: 0.84,
      levelEchoMult: 0.84,
    },
    codexModifiers: {
      familyKillMult: 1,
      bossKillMult: 1,
      duplicatePowerGainMult: 1,
    },
    playerBonuses: {
      upgradeCostReduction: 0.1,
      rerollCostReduction: 0.18,
      polishCostReduction: 0.18,
      reforgeCostReduction: 0.18,
      ascendCostReduction: 0.16,
      ascendImprintCostReduction: 0.12,
    },
    strengths: ["+42% esencia", "Rare/Epic mas frecuentes", "Costos de forja mas bajos"],
    tradeoffs: ["-16% XP", "-16% ecos por tier y nivel", "-28% caza de powers"],
  },
  {
    id: "dominion",
    name: "Sigilo de Dominio",
    shortName: "Dominio",
    summary: "Empuja mastery horizontal del Codex sin adelantar spoilers ni descubrimientos.",
    focus: "Codex / mastery",
    rewardModifiers: {
      xpMult: 0.86,
      essenceMult: 0.84,
      powerHuntMultiplier: 0.9,
      rarityBonus: {},
    },
    prestigeModifiers: {
      tierEchoMult: 0.86,
      levelEchoMult: 0.86,
    },
    codexModifiers: {
      familyKillMult: 2,
      bossKillMult: 2,
      duplicatePowerGainMult: 2,
    },
    playerBonuses: {},
    strengths: ["Progreso x2 de familias y bosses", "Duplicados x2 para mastery"],
    tradeoffs: ["-14% XP", "-14% ecos por tier y nivel", "-16% esencia"],
  },
];

const RUN_SIGIL_BY_ID = Object.fromEntries(RUN_SIGILS.map(sigil => [sigil.id, sigil]));

function cloneObject(value = {}) {
  return { ...(value || {}) };
}

export function getRunSigil(runSigilId = "free") {
  return RUN_SIGIL_BY_ID[runSigilId] || RUN_SIGIL_BY_ID.free;
}

export function getRunSigilRewardModifiers(runSigilId = "free") {
  return cloneObject(getRunSigil(runSigilId).rewardModifiers);
}

export function getRunSigilPrestigeModifiers(runSigilId = "free") {
  return cloneObject(getRunSigil(runSigilId).prestigeModifiers);
}

export function getRunSigilCodexModifiers(runSigilId = "free") {
  return cloneObject(getRunSigil(runSigilId).codexModifiers);
}

export function getRunSigilPlayerBonuses(runSigilId = "free") {
  return cloneObject(getRunSigil(runSigilId).playerBonuses);
}

export function isRunSigilsUnlocked(state = {}) {
  return Number(state?.prestige?.level || 0) >= 1;
}
