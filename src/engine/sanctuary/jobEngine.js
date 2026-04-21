import { getRunSigil } from "../../data/runSigils";
import { BOSSES } from "../../data/bosses";
import { ENEMY_FAMILIES } from "../../data/encounters";
import { LEGENDARY_POWERS } from "../../data/legendaryPowers";
import {
  BLUEPRINT_AFFIX_FAMILIES,
  buildBlueprintChargeReward,
  normalizeExtractedItemRecord,
} from "./blueprintEngine";
import {
  getSanctuaryStationDurationMultiplier,
  isSanctuaryStationUnlocked,
} from "./laboratoryEngine";
import {
  getCodexBossResearchState,
  getCodexFamilyResearchState,
  getCodexPowerResearchState,
} from "../progression/codexEngine";

const DISTILL_DURATION_MS = {
  essence_cache: 20 * 60 * 1000,
  codex_trace: 30 * 60 * 1000,
  sigil_residue: 45 * 60 * 1000,
  relic_shard: 60 * 60 * 1000,
};

const DISTILL_OUTPUT_LABEL = {
  essence_cache: "Esencia refinada",
  codex_trace: "Tinta de Biblioteca",
  sigil_residue: "Flux de Sigilo",
  relic_shard: "Polvo de Reliquia",
};

const PROJECT_UPGRADE_RULES = {
  rare: { baseDurationMs: 30 * 60 * 1000, baseDustCost: 1, ratingStepMult: 1.035, affixStepMult: 1.025 },
  epic: { baseDurationMs: 50 * 60 * 1000, baseDustCost: 2, ratingStepMult: 1.04, affixStepMult: 1.028 },
  legendary: { baseDurationMs: 75 * 60 * 1000, baseDustCost: 3, ratingStepMult: 1.045, affixStepMult: 1.03 },
};
const PROJECT_UPGRADE_CAP = 15;
const SCRAP_DURATION_BY_RARITY = {
  rare: 8 * 60 * 1000,
  epic: 16 * 60 * 1000,
  legendary: 30 * 60 * 1000,
};

const SIGIL_INFUSION_RECIPES = {
  free: {
    durationMs: 2 * 60 * 60 * 1000,
    fuelCost: 1,
    playerBonuses: { goldPct: 0.08, xpPct: 0.08 },
    extractionBonuses: { echoesMult: 0.1 },
    summary: "Mejor cierre de expedición y mejor retorno general.",
  },
  ascend: {
    durationMs: 2 * 60 * 60 * 1000,
    fuelCost: 1,
    playerBonuses: { xpPct: 0.18, damagePct: 0.05 },
    extractionBonuses: {},
    summary: "Más empuje temprano y mejor subida.",
  },
  hunt: {
    durationMs: 6 * 60 * 60 * 1000,
    fuelCost: 1,
    playerBonuses: { lootBonus: 0.18, luck: 0.12 },
    extractionBonuses: { codexTraceBonus: 1 },
    summary: "Más loot valioso y más trazas en la extracción.",
  },
  forge: {
    durationMs: 6 * 60 * 60 * 1000,
    fuelCost: 1,
    playerBonuses: { essenceBonus: 0.3, lootBonus: 0.06 },
    extractionBonuses: { essenceCacheBonus: 1 },
    summary: "Más esencia y mejor economía para proyectos.",
  },
  dominion: {
    durationMs: 12 * 60 * 60 * 1000,
    fuelCost: 2,
    playerBonuses: { damagePct: 0.06, luck: 0.08 },
    extractionBonuses: { codexTraceBonus: 2 },
    summary: "Más presión general y más valor horizontal para el Santuario.",
  },
};

const CODEX_FAMILY_RESEARCH_COSTS = {
  1: { ink: 20, dust: 0, durationMs: 10 * 60 * 1000 },
  2: { ink: 60, dust: 0, durationMs: 25 * 60 * 1000 },
  3: { ink: 140, dust: 0, durationMs: 45 * 60 * 1000 },
};

const CODEX_BOSS_RESEARCH_COSTS = {
  1: { ink: 35, dust: 0, durationMs: 15 * 60 * 1000 },
  2: { ink: 90, dust: 2, durationMs: 35 * 60 * 1000 },
};

const CODEX_POWER_RESEARCH_COSTS = {
  2: { ink: 80, dust: 0, durationMs: 45 * 60 * 1000 },
  3: { ink: 160, dust: 2, durationMs: 90 * 60 * 1000 },
  4: { ink: 300, dust: 5, durationMs: 3 * 60 * 60 * 1000 },
};

const SANCTUARY_ERRAND_DURATIONS = {
  short: {
    id: "short",
    label: "Corto",
    durationMs: 15 * 60 * 1000,
    shortLabel: "15m",
  },
  medium: {
    id: "medium",
    label: "Medio",
    durationMs: 60 * 60 * 1000,
    shortLabel: "1h",
  },
  long: {
    id: "long",
    label: "Largo",
    durationMs: 4 * 60 * 60 * 1000,
    shortLabel: "4h",
  },
};

const SANCTUARY_ERRAND_AFFINITY_REWARDS = {
  short: { min: 2, max: 4 },
  medium: { min: 5, max: 8 },
  long: { min: 10, max: 15 },
};

const SANCTUARY_ERRAND_CODEX_REWARDS = {
  short: { ink: { min: 4, max: 6 }, dust: { min: 0, max: 1 }, dustChance: 0.25 },
  medium: { ink: { min: 9, max: 14 }, dust: { min: 1, max: 2 }, dustChance: 0.45 },
  long: { ink: { min: 18, max: 28 }, dust: { min: 2, max: 3 }, dustChance: 0.65 },
};

const SANCTUARY_ERRAND_MATERIAL_REWARDS = {
  short: { relicDust: { min: 1, max: 2 }, sigilFlux: { min: 1, max: 2 } },
  medium: { relicDust: { min: 3, max: 5 }, sigilFlux: { min: 3, max: 5 } },
  long: { relicDust: { min: 7, max: 10 }, sigilFlux: { min: 6, max: 9 } },
};

const SANCTUARY_ERRAND_BASE_DEFINITIONS = [
  {
    id: "affinity_bleed_dot",
    type: "affinity",
    familyId: "bleed_dot",
    label: "Encargo de Sangre",
    description: "El Santuario rastrea presas y regresa con hallazgos orientados a sangrado y daño prolongado.",
    rewardLabel: "Cargas de Bleed / DoT",
  },
  {
    id: "affinity_crit_burst",
    type: "affinity",
    familyId: "crit_burst",
    label: "Encargo de Precision",
    description: "Un equipo busca focos de daño explosivo y marcas de ejecución.",
    rewardLabel: "Cargas de Crit / Burst",
  },
  {
    id: "affinity_tempo_combo",
    type: "affinity",
    familyId: "tempo_combo",
    label: "Encargo de Asalto",
    description: "El Santuario envía cuadrillas veloces para recuperar técnicas de ritmo y multi-hit.",
    rewardLabel: "Cargas de Tempo / Combo",
  },
  {
    id: "affinity_mark_control",
    type: "affinity",
    familyId: "mark_control",
    label: "Encargo de Control",
    description: "Se buscan herramientas de marca, fractura y control del objetivo.",
    rewardLabel: "Cargas de Mark / Control",
  },
  {
    id: "affinity_guard_vitality",
    type: "affinity",
    familyId: "guard_vitality",
    label: "Encargo Defensivo",
    description: "Las escuadras regresan con materiales de aguante, vida y defensa.",
    rewardLabel: "Cargas de Tank / Defense",
  },
  {
    id: "affinity_fortune_utility",
    type: "affinity",
    familyId: "fortune_utility",
    label: "Encargo de Provision",
    description: "El Santuario recupera recursos logísticos, fortuna y utilidad general.",
    rewardLabel: "Cargas de Utility / Economy",
  },
  {
    id: "codex_research",
    type: "codex",
    label: "Encargo de Archivo",
    description: "Un equipo del Santuario rastrea indicios, tinta y fragmentos útiles para la Biblioteca.",
    rewardLabel: "Tinta de Biblioteca",
  },
  {
    id: "material_salvage",
    type: "materials",
    label: "Encargo de Recuperacion",
    description: "Se recuperan materiales útiles para Taller y Altar de Sigilos.",
    rewardLabel: "Polvo de Reliquia y Flux",
  },
];

function cloneJobs(jobs = []) {
  return Array.isArray(jobs) ? jobs.map(job => ({ ...job })) : [];
}

function getRunningJobsByStation(jobs = []) {
  const running = {};
  for (const job of jobs) {
    if (job?.status !== "running") continue;
    running[job.station] = (running[job.station] || 0) + 1;
  }
  return running;
}

export function getCodexResearchDefinition(codex = {}, { researchType = "", targetId = "" } = {}) {
  if (researchType === "family") {
    const research = getCodexFamilyResearchState(codex, targetId);
    const family = ENEMY_FAMILIES[targetId];
    const targetRank = research.researchedRank + 1;
    const milestone = research.nextMilestone;
    const cost = CODEX_FAMILY_RESEARCH_COSTS[targetRank] || null;
    return {
      research,
      label: family?.name || targetId,
      targetRank,
      milestone,
      cost,
      rewardLabel: milestone?.label || "",
      summary: family
        ? `Investiga a ${family.name} y activa ${milestone?.label || "el siguiente hito"} de la Biblioteca.`
        : "Investiga una familia para activar su proximo hito.",
    };
  }

  if (researchType === "boss") {
    const research = getCodexBossResearchState(codex, targetId);
    const boss = BOSSES.find(entry => entry.id === targetId);
    const targetRank = research.researchedRank + 1;
    const milestone = research.nextMilestone;
    const cost = CODEX_BOSS_RESEARCH_COSTS[targetRank] || null;
    return {
      research,
      label: boss?.name || targetId,
      targetRank,
      milestone,
      cost,
      rewardLabel: milestone?.label || "",
      summary: boss
        ? `Analiza a ${boss.name} y consolida ${milestone?.label || "el siguiente hito"} de la Biblioteca.`
        : "Investiga un boss para activar su proximo hito.",
    };
  }

  if (researchType === "power") {
    const research = getCodexPowerResearchState(codex, targetId);
    const power = LEGENDARY_POWERS.find(entry => entry.id === targetId);
    const nextRank = research.nextRank;
    const targetRank = Number(nextRank?.rank || 0);
    const cost = CODEX_POWER_RESEARCH_COSTS[targetRank] || null;
    return {
      research,
      label: power?.name || targetId,
      targetRank,
      milestone: nextRank,
      cost,
      rewardLabel: nextRank?.label || "",
      summary: power
        ? `Profundiza ${power.name} para alcanzar ${nextRank?.label || "el siguiente rango"} en tu Biblioteca.`
        : "Investiga un poder legendario para subir su maestria.",
    };
  }

  return null;
}

export function getSigilInfusionRecipe(sigilId = "free") {
  return SIGIL_INFUSION_RECIPES[getRunSigil(sigilId).id] || SIGIL_INFUSION_RECIPES.free;
}

function getErrandRewardMultiplier(progressTier = 1) {
  const normalizedTier = Math.max(1, Number(progressTier || 1));
  if (normalizedTier <= 10) return 1;
  if (normalizedTier <= 20) return 1.3;
  if (normalizedTier <= 30) return 1.65;
  return 1.95;
}

function scaleRange(range = {}, multiplier = 1) {
  return {
    min: Math.max(1, Math.floor(Number(range?.min || 0) * multiplier)),
    max: Math.max(1, Math.floor(Number(range?.max || 0) * multiplier)),
  };
}

function randomIntInclusive(min = 0, max = 0) {
  const normalizedMin = Math.floor(Number(min || 0));
  const normalizedMax = Math.floor(Number(max || 0));
  if (normalizedMax <= normalizedMin) return normalizedMin;
  return normalizedMin + Math.floor(Math.random() * (normalizedMax - normalizedMin + 1));
}

function findErrandDefinition(errandId = "") {
  return SANCTUARY_ERRAND_BASE_DEFINITIONS.find(entry => entry.id === errandId) || null;
}

function formatRangeLabel(range = {}, suffix = "") {
  return `${range.min}-${range.max}${suffix ? ` ${suffix}` : ""}`.trim();
}

function buildErrandPreview(definition = {}, durationId = "short", multiplier = 1) {
  const duration = SANCTUARY_ERRAND_DURATIONS[durationId] || SANCTUARY_ERRAND_DURATIONS.short;
  if (definition.type === "affinity") {
    const range = scaleRange(SANCTUARY_ERRAND_AFFINITY_REWARDS[duration.id], multiplier);
    return {
      duration,
      rewardsLabel: formatRangeLabel(range, "cargas"),
      summary: `${formatRangeLabel(range, "cargas")} para ${definition.rewardLabel}.`,
      expected: {
        familyCharges: {
          [definition.familyId]: range,
        },
      },
    };
  }
  if (definition.type === "codex") {
    const inkRange = scaleRange(SANCTUARY_ERRAND_CODEX_REWARDS[duration.id].ink, multiplier);
    const dustRange = scaleRange(SANCTUARY_ERRAND_CODEX_REWARDS[duration.id].dust, multiplier);
    return {
      duration,
      rewardsLabel: `${formatRangeLabel(inkRange, "tinta")} · bonus de fragmentos`,
      summary: `${formatRangeLabel(inkRange, "tinta de Biblioteca")} y chance de ${formatRangeLabel(dustRange, "fragmentos")} de reliquia.`,
      expected: {
        codexInk: inkRange,
        relicDustBonus: dustRange,
      },
    };
  }
  const relicRange = scaleRange(SANCTUARY_ERRAND_MATERIAL_REWARDS[duration.id].relicDust, multiplier);
  const fluxRange = scaleRange(SANCTUARY_ERRAND_MATERIAL_REWARDS[duration.id].sigilFlux, multiplier);
  return {
    duration,
    rewardsLabel: `${formatRangeLabel(relicRange, "polvo")} · ${formatRangeLabel(fluxRange, "flux")}`,
    summary: `${formatRangeLabel(relicRange, "polvo de Reliquia")} y ${formatRangeLabel(fluxRange, "flux de Sigilo")}.`,
    expected: {
      relicDust: relicRange,
      sigilFlux: fluxRange,
    },
  };
}

function rollErrandRewards(definition = {}, durationId = "short", multiplier = 1) {
  const preview = buildErrandPreview(definition, durationId, multiplier);
  if (definition.type === "affinity") {
    const familyId = definition.familyId;
    const familyRange = preview.expected.familyCharges?.[familyId] || { min: 1, max: 1 };
    return {
      familyCharges: {
        [familyId]: randomIntInclusive(familyRange.min, familyRange.max),
      },
    };
  }
  if (definition.type === "codex") {
    const inkRange = preview.expected.codexInk || { min: 1, max: 1 };
    const dustRange = preview.expected.relicDustBonus || { min: 0, max: 0 };
    const dustChance = SANCTUARY_ERRAND_CODEX_REWARDS[durationId]?.dustChance || 0;
    return {
      codexInk: randomIntInclusive(inkRange.min, inkRange.max),
      relicDust: Math.random() <= dustChance ? randomIntInclusive(dustRange.min, dustRange.max) : 0,
    };
  }
  const relicRange = preview.expected.relicDust || { min: 1, max: 1 };
  const fluxRange = preview.expected.sigilFlux || { min: 1, max: 1 };
  return {
    relicDust: randomIntInclusive(relicRange.min, relicRange.max),
    sigilFlux: randomIntInclusive(fluxRange.min, fluxRange.max),
  };
}

export function getSanctuaryErrandCatalog(progressTier = 1) {
  const multiplier = getErrandRewardMultiplier(progressTier);
  return SANCTUARY_ERRAND_BASE_DEFINITIONS.map(definition => ({
    ...definition,
    familyMeta: definition.familyId ? BLUEPRINT_AFFIX_FAMILIES[definition.familyId] || null : null,
    durationOptions: Object.values(SANCTUARY_ERRAND_DURATIONS).map(duration => {
      const preview = buildErrandPreview(definition, duration.id, multiplier);
      return {
        id: duration.id,
        label: duration.label,
        shortLabel: duration.shortLabel,
        durationMs: duration.durationMs,
        rewardsLabel: preview.rewardsLabel,
        summary: preview.summary,
      };
    }),
  }));
}

export function createSanctuaryErrandJob(sanctuary = {}, errandId, durationId = "short", progressTier = 1, now = Date.now()) {
  if (!isSanctuaryStationUnlocked(sanctuary, "errands")) return null;
  const jobs = Array.isArray(sanctuary.jobs) ? sanctuary.jobs : [];
  const runningByStation = getRunningJobsByStation(jobs);
  const slots = Math.max(1, Number(sanctuary?.stations?.errands?.slots || 2));
  if ((runningByStation.errands || 0) >= slots) return null;

  const definition = findErrandDefinition(errandId);
  const duration = SANCTUARY_ERRAND_DURATIONS[durationId] || SANCTUARY_ERRAND_DURATIONS.short;
  if (!definition) return null;

  const multiplier = getErrandRewardMultiplier(progressTier);
  const preview = buildErrandPreview(definition, duration.id, multiplier);
  const rewards = rollErrandRewards(definition, duration.id, multiplier);
  const familyMeta = definition.familyId ? BLUEPRINT_AFFIX_FAMILIES[definition.familyId] || null : null;

  return {
    id: `job_errand_${definition.id}_${duration.id}_${now}`,
    type: "sanctuary_errand",
    station: "errands",
    status: "running",
    startedAt: now,
    endsAt: now + Math.round(duration.durationMs * getSanctuaryStationDurationMultiplier(sanctuary, "errands")),
    input: {
      errandId: definition.id,
      errandType: definition.type,
      durationId: duration.id,
      durationLabel: duration.shortLabel,
      progressTier: Math.max(1, Number(progressTier || 1)),
      familyId: definition.familyId || null,
      familyLabel: familyMeta?.label || null,
      label: definition.label,
    },
    output: {
      label: definition.label,
      rewardLabel: definition.rewardLabel,
      summary: preview.summary,
      rewards,
    },
  };
}

export function syncSanctuaryJobs(jobs = [], now = Date.now()) {
  const nextJobs = cloneJobs(jobs);
  let changed = false;
  for (const job of nextJobs) {
    if (job?.status !== "running") continue;
    if (Number(job.endsAt || 0) <= now) {
      job.status = "claimable";
      changed = true;
    }
  }
  return changed ? nextJobs : jobs;
}

export function createDistillJob(sanctuary = {}, cargoId, now = Date.now()) {
  if (!isSanctuaryStationUnlocked(sanctuary, "distillery")) return null;
  const jobs = Array.isArray(sanctuary.jobs) ? sanctuary.jobs : [];
  const cargoInventory = Array.isArray(sanctuary.cargoInventory) ? sanctuary.cargoInventory : [];
  const runningByStation = getRunningJobsByStation(jobs);
  const distillerySlots = Math.max(1, Number(sanctuary?.stations?.distillery?.slots || 1));
  if ((runningByStation.distillery || 0) >= distillerySlots) return null;

  const cargo = cargoInventory.find(entry => entry?.id === cargoId);
  if (!cargo?.type || !DISTILL_DURATION_MS[cargo.type]) return null;

  const quantity = Math.max(1, Number(cargo.quantity || 1));
  const outputAmount =
    cargo.type === "essence_cache"
      ? quantity * 35
      : cargo.type === "codex_trace"
        ? quantity * 5
        : cargo.type === "sigil_residue"
          ? quantity * 3
          : quantity * 4;

  return {
    id: `job_distill_${cargo.id}_${now}`,
    type: "distill_bundle",
    station: "distillery",
    status: "running",
    startedAt: now,
    endsAt: now + Math.round(DISTILL_DURATION_MS[cargo.type] * getSanctuaryStationDurationMultiplier(sanctuary, "distillery")),
    input: {
      cargoId: cargo.id,
      cargoType: cargo.type,
      quantity,
    },
    output: {
      type: cargo.type,
      amount: outputAmount,
      label: DISTILL_OUTPUT_LABEL[cargo.type] || "Resultado refinado",
    },
  };
}

export function createSigilInfusionJob(sanctuary = {}, sigilId = "free", now = Date.now()) {
  if (!isSanctuaryStationUnlocked(sanctuary, "sigilInfusion")) return null;
  const normalizedSigil = getRunSigil(sigilId).id;
  const recipe = getSigilInfusionRecipe(normalizedSigil);
  const jobs = Array.isArray(sanctuary.jobs) ? sanctuary.jobs : [];
  const runningByStation = getRunningJobsByStation(jobs);
  const slots = Math.max(1, Number(sanctuary?.stations?.sigilInfusion?.slots || 1));
  if ((runningByStation.sigilInfusion || 0) >= slots) return null;

  const sigilFlux = Math.max(0, Number(sanctuary?.resources?.sigilFlux || 0));
  if (sigilFlux < recipe.fuelCost) return null;

  return {
    id: `job_infusion_${normalizedSigil}_${now}`,
    type: "infuse_sigil",
    station: "sigilInfusion",
    status: "running",
    startedAt: now,
    endsAt: now + Math.round(recipe.durationMs * getSanctuaryStationDurationMultiplier(sanctuary, "sigilInfusion")),
    input: {
      sigilId: normalizedSigil,
      fuelCost: recipe.fuelCost,
    },
    output: {
      sigilId: normalizedSigil,
      playerBonuses: { ...(recipe.playerBonuses || {}) },
      extractionBonuses: { ...(recipe.extractionBonuses || {}) },
      summary: recipe.summary,
    },
  };
}

export function createCodexResearchJob(sanctuary = {}, codex = {}, { researchType = "", targetId = "" } = {}, now = Date.now()) {
  if (!isSanctuaryStationUnlocked(sanctuary, "codexResearch")) return null;
  const jobs = Array.isArray(sanctuary.jobs) ? sanctuary.jobs : [];
  const runningByStation = getRunningJobsByStation(jobs);
  const slots = Math.max(1, Number(sanctuary?.stations?.codexResearch?.slots || 1));
  if ((runningByStation.codexResearch || 0) >= slots) return null;

  const definition = getCodexResearchDefinition(codex, { researchType, targetId });
  if (!definition?.cost || !definition?.research?.researchReady || !definition?.targetRank) return null;

  const resources = sanctuary?.resources || {};
  const inkCost = Math.max(0, Number(definition.cost?.ink || 0));
  const dustCost = Math.max(0, Number(definition.cost?.dust || 0));
  if (Number(resources?.codexInk || 0) < inkCost) return null;
  if (Number(resources?.relicDust || 0) < dustCost) return null;

  return {
    id: `job_codex_${researchType}_${targetId}_${definition.targetRank}_${now}`,
    type: "codex_research",
    station: "codexResearch",
    status: "running",
    startedAt: now,
    endsAt: now + Math.round(Math.max(1, Number(definition.cost?.durationMs || 0)) * getSanctuaryStationDurationMultiplier(sanctuary, "codexResearch")),
    input: {
      researchType,
      targetId,
      targetRank: definition.targetRank,
      inkCost,
      dustCost,
      label: definition.label,
      progressSpent: definition.research.researchNeeded,
    },
    output: {
      label: definition.label,
      rewardLabel: definition.rewardLabel,
      summary: definition.summary,
    },
  };
}

export function createScrapExtractedItemJob(sanctuary = {}, extractedItemId, now = Date.now()) {
  if (!isSanctuaryStationUnlocked(sanctuary, "deepForge")) return null;
  const jobs = Array.isArray(sanctuary.jobs) ? sanctuary.jobs : [];
  const extractedItems = Array.isArray(sanctuary.extractedItems) ? sanctuary.extractedItems : [];
  const runningByStation = getRunningJobsByStation(jobs);
  const slots = Math.max(1, Number(sanctuary?.stations?.deepForge?.slots || 1));
  if ((runningByStation.deepForge || 0) >= slots) return null;

  const extractedItem = normalizeExtractedItemRecord(extractedItems.find(entry => entry?.id === extractedItemId));
  if (!extractedItem?.id) return null;

  return {
    id: `job_scrap_item_${extractedItem.id}_${now}`,
    type: "scrap_extracted_item",
    station: "deepForge",
    status: "running",
    startedAt: now,
    endsAt: now + Math.round((SCRAP_DURATION_BY_RARITY[extractedItem.rarity] || SCRAP_DURATION_BY_RARITY.rare) * getSanctuaryStationDurationMultiplier(sanctuary, "deepForge")),
    input: {
      extractedItemId: extractedItem.id,
      itemName: extractedItem.name,
      rarity: extractedItem.rarity,
    },
    output: {
      charges: buildBlueprintChargeReward(extractedItem, { multiplier: 1.25 }),
      summary: "Desguaza el item rescatado y devuelve mas cargas de afinidad que la conversion directa a blueprint.",
    },
  };
}

export function getProjectUpgradeRule(project = {}) {
  return PROJECT_UPGRADE_RULES[project?.rarity] || PROJECT_UPGRADE_RULES.rare;
}

export function createForgeProjectJob(sanctuary = {}, projectId, now = Date.now()) {
  if (!isSanctuaryStationUnlocked(sanctuary, "deepForge")) return null;
  const jobs = Array.isArray(sanctuary.jobs) ? sanctuary.jobs : [];
  const stash = Array.isArray(sanctuary.stash) ? sanctuary.stash : [];
  const runningByStation = getRunningJobsByStation(jobs);
  const slots = Math.max(1, Number(sanctuary?.stations?.deepForge?.slots || 1));
  if ((runningByStation.deepForge || 0) >= slots) return null;

  const project = stash.find(entry => entry?.id === projectId);
  if (!project?.id) return null;
  const currentUpgradeLevel = Math.max(0, Number(project?.upgradeLevel || 0));
  const upgradeCap = Math.max(1, Number(project?.upgradeCap || PROJECT_UPGRADE_CAP));
  if (currentUpgradeLevel >= upgradeCap) return null;

  const rule = getProjectUpgradeRule(project);
  const relicDust = Math.max(0, Number(sanctuary?.resources?.relicDust || 0));
  const nextUpgradeLevel = currentUpgradeLevel + 1;
  const dustCost = rule.baseDustCost + Math.floor(nextUpgradeLevel / 5);
  const durationMs = Math.round((rule.baseDurationMs + Math.max(0, nextUpgradeLevel - 1) * 8 * 60 * 1000) * getSanctuaryStationDurationMultiplier(sanctuary, "deepForge"));
  if (relicDust < dustCost) return null;

  return {
    id: `job_forge_project_${project.id}_${now}`,
    type: "forge_project",
    station: "deepForge",
    status: "running",
    startedAt: now,
    endsAt: now + durationMs,
    input: {
      projectId: project.id,
      dustCost,
      project,
    },
    output: {
      projectId: project.id,
      ratingMult: rule.ratingStepMult,
      affixMult: rule.affixStepMult,
      nextUpgradeLevel,
      summary: "Sube el +N persistente del proyecto. Esta mejora ya no vive dentro de una sola expedicion.",
    },
  };
}
