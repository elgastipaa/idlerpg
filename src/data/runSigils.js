export const RUN_SIGILS = [
  {
    id: "free",
    name: "Run libre",
    shortName: "Libre",
    summary: "Sin bonus ni penalidad. Sirve para medir una corrida base.",
    focus: "Sin sesgo",
    whenToPick: "Cuando queres medir una run base o cuando todavia no tenes un objetivo claro.",
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
    strengths: ["Sin penalidad", "Sirve para medir la base del juego"],
    tradeoffs: ["No sesga la corrida"],
  },
  {
    id: "ascend",
    name: "Sigilo de Ascenso",
    shortName: "Ascenso",
    summary: "Empuja nivel, tiers y valor de prestigio. Rinde peor para esencia y poderes.",
    focus: "Empuje y prestigio",
    whenToPick: "Cuando la corrida es para romper techo de tier, matar bosses mas altos y cobrar mejor prestigio.",
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
    tradeoffs: ["-18% esencia", "-25% caza de poderes"],
  },
  {
    id: "hunt",
    name: "Sigilo de Caza",
    shortName: "Caza",
    summary: "Mejora solo la persecucion de poderes legendarios. No acelera el botin general.",
    focus: "Poderes legendarios",
    whenToPick: "Cuando ya sabes exactamente que poder queres descubrir o duplicar para maestria.",
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
    strengths: ["+135% sesgo a poderes en su fuente", "Duplicados x2 para maestria"],
    tradeoffs: ["-18% XP", "-18% ecos por tier y nivel", "-18% esencia"],
  },
  {
    id: "forge",
    name: "Sigilo de Forja",
    shortName: "Forja",
    summary: "Corrida de tempo: mas esencia, mejores bases y funciones de forja mas baratas.",
    focus: "Forja de run",
    whenToPick: "Cuando queres cerrar una pieza fuerte para esta run y usarla para empujar mas lejos ahora.",
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
    tradeoffs: ["-16% XP", "-16% ecos por tier y nivel", "-28% caza de poderes"],
  },
  {
    id: "dominion",
    name: "Sigilo de Dominio",
    shortName: "Dominio",
    summary: "Empuja la maestria horizontal de la Biblioteca sin adelantar spoilers ni descubrimientos.",
    focus: "Biblioteca y maestria",
    whenToPick: "Cuando priorizas bonos permanentes chicos de Biblioteca sobre poder bruto inmediato.",
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
    strengths: ["Progreso x2 de familias y bosses", "Duplicados x2 para maestria"],
    tradeoffs: ["-14% XP", "-14% ecos por tier y nivel", "-16% esencia"],
  },
];

const RUN_SIGIL_BY_ID = Object.fromEntries(RUN_SIGILS.map(sigil => [sigil.id, sigil]));

function cloneObject(value = {}) {
  return { ...(value || {}) };
}

function mergeNumericEntries(target = {}, source = {}, { multiplicativeKeys = new Set() } = {}) {
  for (const [key, rawValue] of Object.entries(source || {})) {
    const value = Number(rawValue || 0);
    if (!Number.isFinite(value)) continue;
    if (multiplicativeKeys.has(key)) {
      target[key] = (target[key] || 1) * value;
    } else {
      target[key] = (target[key] || 0) + value;
    }
  }
  return target;
}

export function getRunSigil(runSigilId = "free") {
  return RUN_SIGIL_BY_ID[runSigilId] || RUN_SIGIL_BY_ID.free;
}

export function normalizeRunSigilIds(runSigilIds = "free", { slots = 1, fillFree = true } = {}) {
  const source = Array.isArray(runSigilIds) ? runSigilIds : [runSigilIds];
  const normalized = [];

  for (const rawId of source) {
    const sigilId = getRunSigil(rawId).id;
    if (sigilId !== "free" && normalized.includes(sigilId)) continue;
    normalized.push(sigilId);
    if (normalized.length >= slots) break;
  }

  if (!normalized.length) normalized.push("free");
  if (fillFree) {
    while (normalized.length < slots) normalized.push("free");
  }

  return normalized.slice(0, slots);
}

export function getRunSigils(runSigilIds = "free", { slots = 1 } = {}) {
  return normalizeRunSigilIds(runSigilIds, { slots })
    .map(sigilId => getRunSigil(sigilId));
}

export function getRunSigilRewardModifiers(runSigilIds = "free") {
  const sigils = getRunSigils(runSigilIds, { slots: Array.isArray(runSigilIds) ? runSigilIds.length || 1 : 1 });
  const merged = {
    xpMult: 1,
    essenceMult: 1,
    powerHuntMultiplier: 1,
    rarityBonus: {},
  };

  for (const sigil of sigils) {
    const rewardModifiers = sigil.rewardModifiers || {};
    merged.xpMult *= Number(rewardModifiers.xpMult || 1);
    merged.essenceMult *= Number(rewardModifiers.essenceMult || 1);
    merged.powerHuntMultiplier *= Number(rewardModifiers.powerHuntMultiplier || 1);
    mergeNumericEntries(merged.rarityBonus, rewardModifiers.rarityBonus || {});
  }

  return merged;
}

export function getRunSigilPrestigeModifiers(runSigilIds = "free") {
  const sigils = getRunSigils(runSigilIds, { slots: Array.isArray(runSigilIds) ? runSigilIds.length || 1 : 1 });
  const merged = {
    tierEchoMult: 1,
    levelEchoMult: 1,
  };

  for (const sigil of sigils) {
    const prestigeModifiers = sigil.prestigeModifiers || {};
    merged.tierEchoMult *= Number(prestigeModifiers.tierEchoMult || 1);
    merged.levelEchoMult *= Number(prestigeModifiers.levelEchoMult || 1);
  }

  return merged;
}

export function getRunSigilCodexModifiers(runSigilIds = "free") {
  const sigils = getRunSigils(runSigilIds, { slots: Array.isArray(runSigilIds) ? runSigilIds.length || 1 : 1 });
  const merged = {
    familyKillMult: 1,
    bossKillMult: 1,
    duplicatePowerGainMult: 1,
  };

  for (const sigil of sigils) {
    const codexModifiers = sigil.codexModifiers || {};
    merged.familyKillMult *= Number(codexModifiers.familyKillMult || 1);
    merged.bossKillMult *= Number(codexModifiers.bossKillMult || 1);
    merged.duplicatePowerGainMult *= Number(codexModifiers.duplicatePowerGainMult || 1);
  }

  return merged;
}

export function getRunSigilPlayerBonuses(runSigilIds = "free") {
  const sigils = getRunSigils(runSigilIds, { slots: Array.isArray(runSigilIds) ? runSigilIds.length || 1 : 1 });
  const merged = {};
  for (const sigil of sigils) {
    mergeNumericEntries(merged, sigil.playerBonuses || {});
  }
  return cloneObject(merged);
}

function formatPercentDelta(multiplier = 1) {
  const delta = Math.round((Number(multiplier || 1) - 1) * 100);
  if (delta > 0) return `+${delta}%`;
  if (delta < 0) return `${delta}%`;
  return "base";
}

function hasForgeBias(playerBonuses = {}) {
  return Object.keys(playerBonuses || {}).some(key => key.toLowerCase().includes("costreduction"));
}

function buildRewardProfile({ rewardModifiers = {}, prestigeModifiers = {}, codexModifiers = {}, playerBonuses = {} } = {}) {
  const boosts = [];
  const tradeoffs = [];

  if (Number(prestigeModifiers.tierEchoMult || 1) !== 1 || Number(prestigeModifiers.levelEchoMult || 1) !== 1) {
    const averageEchoMult =
      (Number(prestigeModifiers.tierEchoMult || 1) + Number(prestigeModifiers.levelEchoMult || 1)) / 2;
    const row = { label: `Ecos ${formatPercentDelta(averageEchoMult)}`, positive: averageEchoMult > 1 };
    (row.positive ? boosts : tradeoffs).push(row);
  }
  if (Number(rewardModifiers.xpMult || 1) !== 1) {
    const row = { label: `XP ${formatPercentDelta(rewardModifiers.xpMult)}`, positive: Number(rewardModifiers.xpMult || 1) > 1 };
    (row.positive ? boosts : tradeoffs).push(row);
  }
  if (Number(rewardModifiers.essenceMult || 1) !== 1) {
    const row = { label: `Esencia ${formatPercentDelta(rewardModifiers.essenceMult)}`, positive: Number(rewardModifiers.essenceMult || 1) > 1 };
    (row.positive ? boosts : tradeoffs).push(row);
  }
  if (Number(rewardModifiers.powerHuntMultiplier || 1) !== 1) {
    const row = { label: `Poderes ${formatPercentDelta(rewardModifiers.powerHuntMultiplier)}`, positive: Number(rewardModifiers.powerHuntMultiplier || 1) > 1 };
    (row.positive ? boosts : tradeoffs).push(row);
  }

  const rareBonus = Number(rewardModifiers?.rarityBonus?.rare || 0);
  const epicBonus = Number(rewardModifiers?.rarityBonus?.epic || 0);
  if (rareBonus > 0 || epicBonus > 0) {
    boosts.push({
      label: `Loot rare/epic +${Math.round((rareBonus + epicBonus) * 1000) / 10}%`,
      positive: true,
    });
  }

  if (Number(codexModifiers.familyKillMult || 1) > 1 || Number(codexModifiers.bossKillMult || 1) > 1) {
    boosts.push({
      label: `Biblioteca x${Number(codexModifiers.familyKillMult || 1).toFixed(1)}`,
      positive: true,
    });
  }
  if (Number(codexModifiers.duplicatePowerGainMult || 1) > 1) {
    boosts.push({
      label: `Duplicados x${Number(codexModifiers.duplicatePowerGainMult || 1).toFixed(1)}`,
      positive: true,
    });
  }

  if (hasForgeBias(playerBonuses)) {
    boosts.push({
      label: "Forja mas barata",
      positive: true,
    });
  }

  return {
    boosts: boosts.slice(0, 4),
    tradeoffs: tradeoffs.slice(0, 4),
  };
}

export function buildRunSigilChoiceProfile(sigilId = "free") {
  const sigil = getRunSigil(sigilId);
  return buildRewardProfile({
    rewardModifiers: sigil.rewardModifiers || {},
    prestigeModifiers: sigil.prestigeModifiers || {},
    codexModifiers: sigil.codexModifiers || {},
    playerBonuses: sigil.playerBonuses || {},
  });
}

export function buildRunSigilLoadoutProfile(runSigilIds = "free") {
  return buildRewardProfile({
    rewardModifiers: getRunSigilRewardModifiers(runSigilIds),
    prestigeModifiers: getRunSigilPrestigeModifiers(runSigilIds),
    codexModifiers: getRunSigilCodexModifiers(runSigilIds),
    playerBonuses: getRunSigilPlayerBonuses(runSigilIds),
  });
}

export function formatRunSigilLoadout(runSigilIds = "free", { short = false } = {}) {
  const sigils = getRunSigils(runSigilIds, { slots: Array.isArray(runSigilIds) ? runSigilIds.length || 1 : 1 });
  const nonFree = sigils.filter(sigil => sigil.id !== "free");
  const source = nonFree.length > 0 ? nonFree : [getRunSigil("free")];
  return source.map(sigil => (short ? (sigil.shortName || sigil.name) : sigil.name)).join(" + ");
}

export function summarizeRunSigilLoadout(runSigilIds = "free") {
  const sigils = getRunSigils(runSigilIds, { slots: Array.isArray(runSigilIds) ? runSigilIds.length || 1 : 1 });
  const nonFree = sigils.filter(sigil => sigil.id !== "free");
  const source = nonFree.length > 0 ? nonFree : [getRunSigil("free")];
  return source.map(sigil => sigil.summary).join(" | ");
}

export function isRunSigilsUnlocked(state = {}) {
  return Number(state?.prestige?.level || 0) >= 1;
}
