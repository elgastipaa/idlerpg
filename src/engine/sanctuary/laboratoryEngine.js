export const SANCTUARY_STATION_DEFAULTS = {
  distillery: {
    id: "distillery",
    label: "Destileria",
    unlocked: false,
    slots: 1,
    timeReductionPct: 0,
  },
  codexResearch: {
    id: "codexResearch",
    label: "Biblioteca",
    unlocked: false,
    slots: 1,
    timeReductionPct: 0,
  },
  sigilInfusion: {
    id: "sigilInfusion",
    label: "Altar de Sigilos",
    unlocked: false,
    slots: 1,
    timeReductionPct: 0,
  },
  errands: {
    id: "errands",
    label: "Encargos",
    unlocked: false,
    slots: 2,
    timeReductionPct: 0,
  },
  deepForge: {
    id: "deepForge",
    label: "Forja Profunda",
    unlocked: false,
    slots: 1,
    timeReductionPct: 0,
  },
  laboratory: {
    id: "laboratory",
    label: "Laboratorio",
    unlocked: false,
    slots: 1,
    timeReductionPct: 0,
  },
};

const TIME_REDUCTION_STEP = 0.15;

export const LAB_RESEARCH_DEFINITIONS = [
  {
    id: "unlock_distillery",
    group: "unlock",
    label: "Calibrar Destileria",
    description: "Activa la primera estacion persistente del Santuario para convertir bundles en recursos utiles entre expediciones.",
    stationId: "distillery",
    costs: { codexInk: 0, relicDust: 0, essence: 0 },
    durationMs: 20 * 1000,
    apply: { unlock: true },
  },
  {
    id: "unlock_deep_forge",
    group: "unlock",
    label: "Abrir Forja Profunda",
    description: "Permite trabajar blueprints a largo plazo con estructura, sintonía y ascensión persistente.",
    stationId: "deepForge",
    costs: { codexInk: 24, relicDust: 0, essence: 120 },
    durationMs: 20 * 60 * 1000,
    apply: { unlock: true },
  },
  {
    id: "unlock_library",
    group: "unlock",
    label: "Catalogar Biblioteca",
    description: "Activa la Biblioteca del Santuario para convertir conocimiento crudo en progreso permanente.",
    stationId: "codexResearch",
    costs: { codexInk: 15, relicDust: 0, essence: 60 },
    durationMs: 10 * 60 * 1000,
    apply: { unlock: true },
  },
  {
    id: "unlock_errands",
    group: "unlock",
    label: "Organizar Encargos",
    description: "Formaliza equipos paralelos del Santuario para buscar materiales, tinta y afinidades mientras vos seguís empujando runs.",
    stationId: "errands",
    costs: { codexInk: 18, relicDust: 0, essence: 90 },
    durationMs: 15 * 60 * 1000,
    apply: { unlock: true },
  },
  {
    id: "unlock_sigil_altar",
    group: "unlock",
    label: "Erigir Altar de Sigilos",
    description: "Abre el altar donde las cargas de sigilo se convierten en preparación real para la próxima expedición.",
    stationId: "sigilInfusion",
    costs: { codexInk: 12, relicDust: 0, essence: 70 },
    durationMs: 12 * 60 * 1000,
    apply: { unlock: true },
  },
  {
    id: "unlock_abyss_portal",
    group: "unlock",
    label: "Abrir Portal al Abismo",
    description: "Rompe el techo de Tier 25 y permite avanzar al Abismo real una vez que el Santuario domina su infraestructura clave.",
    stationId: "laboratory",
    targetLabel: "Portal al Abismo",
    costs: { codexInk: 36, relicDust: 4, essence: 180 },
    durationMs: 25 * 60 * 1000,
    apply: { unlockAbyssPortal: true },
  },
  {
    id: "distillery_slots_1",
    group: "capacity",
    label: "Destileria Expandida",
    description: "Agrega un slot extra para procesar más cargo a la vez.",
    stationId: "distillery",
    costs: { codexInk: 14, relicDust: 0, essence: 80 },
    durationMs: 20 * 60 * 1000,
    apply: { addSlots: 1 },
  },
  {
    id: "library_slots_1",
    group: "capacity",
    label: "Mesas de Archivo",
    description: "Agrega un estudio extra para investigaciones de Biblioteca.",
    stationId: "codexResearch",
    costs: { codexInk: 30, relicDust: 0, essence: 100 },
    durationMs: 25 * 60 * 1000,
    apply: { addSlots: 1 },
  },
  {
    id: "altar_slots_1",
    group: "capacity",
    label: "Segundo Brasero",
    description: "Permite preparar más de un sigilo al mismo tiempo.",
    stationId: "sigilInfusion",
    costs: { codexInk: 18, relicDust: 0, essence: 95 },
    durationMs: 22 * 60 * 1000,
    apply: { addSlots: 1 },
  },
  {
    id: "errands_slots_1",
    group: "capacity",
    label: "Cuadrilla Extra",
    description: "Suma un equipo adicional para Encargos del Santuario.",
    stationId: "errands",
    costs: { codexInk: 20, relicDust: 0, essence: 110 },
    durationMs: 25 * 60 * 1000,
    apply: { addSlots: 1 },
  },
  {
    id: "forge_slots_1",
    group: "capacity",
    label: "Banco de Forja Extra",
    description: "Añade capacidad operativa a la Forja Profunda.",
    stationId: "deepForge",
    costs: { codexInk: 26, relicDust: 2, essence: 130 },
    durationMs: 30 * 60 * 1000,
    apply: { addSlots: 1 },
  },
  {
    id: "distillery_speed_1",
    group: "efficiency",
    label: "Serpentines Optimizados",
    description: "Reduce el tiempo de la Destileria.",
    stationId: "distillery",
    costs: { codexInk: 18, relicDust: 0, essence: 90 },
    durationMs: 20 * 60 * 1000,
    apply: { addTimeReductionPct: TIME_REDUCTION_STEP },
  },
  {
    id: "library_speed_1",
    group: "efficiency",
    label: "Indices de Consulta",
    description: "Acelera los estudios de Biblioteca.",
    stationId: "codexResearch",
    costs: { codexInk: 28, relicDust: 0, essence: 110 },
    durationMs: 24 * 60 * 1000,
    apply: { addTimeReductionPct: TIME_REDUCTION_STEP },
  },
  {
    id: "altar_speed_1",
    group: "efficiency",
    label: "Trazado Rúnico",
    description: "Reduce el tiempo del Altar de Sigilos.",
    stationId: "sigilInfusion",
    costs: { codexInk: 22, relicDust: 0, essence: 100 },
    durationMs: 22 * 60 * 1000,
    apply: { addTimeReductionPct: TIME_REDUCTION_STEP },
  },
  {
    id: "errands_speed_1",
    group: "efficiency",
    label: "Logistica del Santuario",
    description: "Los Encargos regresan más rápido.",
    stationId: "errands",
    costs: { codexInk: 24, relicDust: 0, essence: 110 },
    durationMs: 26 * 60 * 1000,
    apply: { addTimeReductionPct: TIME_REDUCTION_STEP },
  },
  {
    id: "forge_speed_1",
    group: "efficiency",
    label: "Taller Afinado",
    description: "Acelera la Forja Profunda.",
    stationId: "deepForge",
    costs: { codexInk: 30, relicDust: 2, essence: 130 },
    durationMs: 30 * 60 * 1000,
    apply: { addTimeReductionPct: TIME_REDUCTION_STEP },
  },
];

const LAB_RESEARCH_BY_ID = Object.fromEntries(LAB_RESEARCH_DEFINITIONS.map(entry => [entry.id, entry]));

export function createEmptyLaboratoryState() {
  return {
    completed: {},
  };
}

function getProgressTier(state = {}) {
  return Math.max(
    Number(state?.combat?.maxTier || 1),
    Number(state?.combat?.currentTier || 1),
    Number(state?.prestige?.bestHistoricTier || 1),
    Number(state?.abyss?.highestTierReached || 1)
  );
}

function getTotalFamilyCharges(sanctuary = {}) {
  return Object.values(sanctuary?.familyCharges || {}).reduce((total, value) => total + Math.max(0, Number(value || 0)), 0);
}

function hasCodexProgress(state = {}) {
  const research = state?.codex?.research || {};
  return (
    Object.values(research.familyRanks || {}).some(value => Number(value || 0) > 0) ||
    Object.values(research.bossRanks || {}).some(value => Number(value || 0) > 0) ||
    Object.values(research.powerRanks || {}).some(value => Number(value || 0) > 1)
  );
}

function inferStationUnlocked(stationId, sanctuary = {}, context = {}) {
  const jobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const hasJob = jobs.some(job => job?.station === stationId);
  const resources = sanctuary?.resources || {};
  const legacyOnboardingCompleted = Boolean(context?.onboarding?.completed);
  if (stationId === "distillery") {
    if (legacyOnboardingCompleted) return true;
    return (
      hasJob ||
      (Array.isArray(sanctuary?.cargoInventory) ? sanctuary.cargoInventory.length : 0) > 0 ||
      Number(resources.codexInk || 0) > 0 ||
      Number(resources.sigilFlux || 0) > 0 ||
      Number(resources.relicDust || 0) > 0
    );
  }
  if (stationId === "codexResearch") {
    return hasJob || Number(resources.codexInk || 0) > 0 || hasCodexProgress(context);
  }
  if (stationId === "sigilInfusion") {
    return hasJob || Number(resources.sigilFlux || 0) > 0 || Object.keys(sanctuary?.sigilInfusions || {}).length > 0;
  }
  if (stationId === "errands") {
    return hasJob || Number(context?.prestige?.level || 0) > 0;
  }
  if (stationId === "deepForge") {
    return (
      hasJob ||
      Number(resources.relicDust || 0) > 0 ||
      (Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints.length : 0) > 0 ||
      getTotalFamilyCharges(sanctuary) > 0
    );
  }
  if (stationId === "laboratory") {
    if (legacyOnboardingCompleted) return true;
    return (
      hasJob ||
      Object.keys(sanctuary?.laboratory?.completed || {}).length > 0 ||
      Object.values(sanctuary?.stations || {}).some(
        station => station?.id !== "laboratory" && Boolean(station?.unlocked)
      )
    );
  }
  return false;
}

export function getSanctuaryStationState(sanctuary = {}, stationId = "") {
  return {
    ...(SANCTUARY_STATION_DEFAULTS[stationId] || { unlocked: false, slots: 1, timeReductionPct: 0 }),
    ...((sanctuary?.stations || {})[stationId] || {}),
  };
}

export function isSanctuaryStationUnlocked(sanctuary = {}, stationId = "") {
  return !!getSanctuaryStationState(sanctuary, stationId)?.unlocked;
}

export function getSanctuaryStationDurationMultiplier(sanctuary = {}, stationId = "") {
  const reduction = Math.max(0, Math.min(0.5, Number(getSanctuaryStationState(sanctuary, stationId)?.timeReductionPct || 0)));
  return Math.max(0.5, 1 - reduction);
}

export function getLaboratoryResearchDefinition(researchId = "") {
  return LAB_RESEARCH_BY_ID[researchId] || null;
}

function evaluateResearchPrerequisite(state = {}, definition = {}) {
  const sanctuary = state?.sanctuary || {};
  const progressTier = getProgressTier(state);
  const blueprintCount = Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints.length : 0;
  const totalCharges = getTotalFamilyCharges(sanctuary);
  const completed = sanctuary?.laboratory?.completed || {};

  switch (definition.id) {
    case "unlock_distillery":
      return {
        ok: Boolean(state?.onboarding?.completed || state?.onboarding?.flags?.laboratoryUnlocked),
        label: "Requiere la primera extraccion",
      };
    case "unlock_deep_forge":
      return {
        ok: Number(state?.prestige?.level || 0) >= 3,
        label: "Requiere Prestige 3",
      };
    case "unlock_library":
      return {
        ok: Number(state?.prestige?.level || 0) >= 4,
        label: "Requiere Prestige 4",
      };
    case "unlock_errands":
      return {
        ok: Number(state?.prestige?.level || 0) >= 5,
        label: "Requiere Prestige 5",
      };
    case "unlock_sigil_altar":
      return {
        ok: Number(state?.prestige?.level || 0) >= 6,
        label: "Requiere Prestige 6",
      };
    case "unlock_abyss_portal": {
      const hasTier25Boss = Boolean(state?.abyss?.tier25BossCleared);
      const hasInfrastructure =
        Boolean(completed.unlock_library) &&
        Boolean(completed.unlock_errands) &&
        Boolean(completed.unlock_sigil_altar);
      return {
        ok: hasTier25Boss && hasInfrastructure,
        label: !hasTier25Boss
          ? "Requiere derrotar al boss de Tier 25"
          : !hasInfrastructure
            ? "Requiere Biblioteca, Encargos y Altar de Sigilos"
            : "Listo para abrir el Abismo",
      };
    }
    default:
      return {
        ok: isSanctuaryStationUnlocked(sanctuary, definition.stationId),
        label: `Requiere ${SANCTUARY_STATION_DEFAULTS[definition.stationId]?.label || "la estacion"} activa`,
      };
  }
}

export function normalizeLaboratoryState(rawLaboratory = {}, sanctuary = {}, context = {}) {
  const completed = {
    ...createEmptyLaboratoryState().completed,
    ...(rawLaboratory?.completed || {}),
  };

  for (const definition of LAB_RESEARCH_DEFINITIONS) {
    const station = getSanctuaryStationState(sanctuary, definition.stationId);
    if (definition.apply?.unlock && (station.unlocked || inferStationUnlocked(definition.stationId, sanctuary, context))) {
      completed[definition.id] = true;
    }
    if (definition.apply?.addSlots && Number(station.slots || 0) > Number(SANCTUARY_STATION_DEFAULTS[definition.stationId]?.slots || 0)) {
      completed[definition.id] = true;
    }
    if (definition.apply?.addTimeReductionPct && Number(station.timeReductionPct || 0) > 0) {
      completed[definition.id] = true;
    }
  }

  return {
    ...createEmptyLaboratoryState(),
    ...rawLaboratory,
    completed,
  };
}

export function buildSanctuaryStationsWithLaboratory(baseStations = {}, laboratory = {}, sanctuary = {}, context = {}) {
  const completed = laboratory?.completed || {};
  const nextStations = {};

  for (const [stationId, defaults] of Object.entries(SANCTUARY_STATION_DEFAULTS)) {
    nextStations[stationId] = {
      ...defaults,
      ...(baseStations?.[stationId] || {}),
    };

    if (stationId !== "distillery" && stationId !== "laboratory") {
      nextStations[stationId].unlocked =
        Boolean(nextStations[stationId].unlocked) || inferStationUnlocked(stationId, sanctuary, context);
    } else if (context?.onboarding?.completed) {
      nextStations[stationId].unlocked = true;
    }
  }

  for (const stationId of Object.keys(nextStations)) {
    const station = nextStations[stationId];
    const defaults = SANCTUARY_STATION_DEFAULTS[stationId] || { slots: 1, timeReductionPct: 0 };
    const completedResearches = LAB_RESEARCH_DEFINITIONS.filter(
      definition => definition.stationId === stationId && completed[definition.id]
    );
    const unlockApplied = completedResearches.some(definition => definition.apply?.unlock);
    const totalSlotBonus = completedResearches.reduce((total, definition) => total + Math.max(0, Number(definition.apply?.addSlots || 0)), 0);
    const totalTimeReduction = completedResearches.reduce((total, definition) => total + Math.max(0, Number(definition.apply?.addTimeReductionPct || 0)), 0);

    if (unlockApplied) station.unlocked = true;
    station.slots = Math.max(Number(station.slots || 0), Number(defaults.slots || 1) + totalSlotBonus);
    station.timeReductionPct = Math.max(Number(station.timeReductionPct || 0), totalTimeReduction);
  }

  return nextStations;
}

export function getLaboratoryCatalog(state = {}) {
  const sanctuary = state?.sanctuary || {};
  const completed = sanctuary?.laboratory?.completed || {};
  const resources = sanctuary?.resources || {};
  const essence = Math.max(0, Number(state?.player?.essence || 0));
  const runningJobIds = new Set(
    (Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [])
      .filter(job => job?.station === "laboratory" && job?.status === "running")
      .map(job => job.input?.researchId)
      .filter(Boolean)
  );

  return LAB_RESEARCH_DEFINITIONS.map(definition => {
    const station = getSanctuaryStationState(sanctuary, definition.stationId);
    const prerequisite = evaluateResearchPrerequisite(state, definition);
    const cost = definition.costs || {};
    const missingCosts = [
      Number(resources.codexInk || 0) < Number(cost.codexInk || 0) ? "tinta" : null,
      Number(resources.relicDust || 0) < Number(cost.relicDust || 0) ? "polvo" : null,
      essence < Number(cost.essence || 0) ? "esencia" : null,
    ].filter(Boolean);

    return {
      ...definition,
      completed: !!completed[definition.id],
      running: runningJobIds.has(definition.id),
      available: prerequisite.ok,
      prerequisiteLabel: prerequisite.label,
      missingCosts,
      canStart:
        !completed[definition.id] &&
        !runningJobIds.has(definition.id) &&
        prerequisite.ok &&
        missingCosts.length === 0,
      station,
    };
  });
}

export function createLaboratoryResearchJob(state = {}, researchId = "", now = Date.now()) {
  const sanctuary = state?.sanctuary || {};
  const station = getSanctuaryStationState(sanctuary, "laboratory");
  const running = (Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : []).filter(job => job?.station === "laboratory" && job?.status === "running");
  if (!station.unlocked || running.length >= Math.max(1, Number(station.slots || 1))) return null;

  const entry = getLaboratoryCatalog(state).find(candidate => candidate.id === researchId);
  if (!entry || !entry.canStart) return null;

  return {
    id: `job_lab_${researchId}_${now}`,
    type: "laboratory_research",
    station: "laboratory",
    status: "running",
    startedAt: now,
    endsAt: now + Math.round(Number(entry.durationMs || 0) * getSanctuaryStationDurationMultiplier(sanctuary, "laboratory")),
    input: {
      researchId,
      label: entry.label,
      stationId: entry.stationId,
      targetLabel:
        entry.targetLabel ||
        SANCTUARY_STATION_DEFAULTS[entry.stationId]?.label ||
        entry.stationId,
      costs: { ...(entry.costs || {}) },
    },
    output: {
      label: entry.label,
      stationId: entry.stationId,
      targetLabel:
        entry.targetLabel ||
        SANCTUARY_STATION_DEFAULTS[entry.stationId]?.label ||
        entry.stationId,
      summary: entry.description,
    },
  };
}

export function applyLaboratoryResearch(sanctuary = {}, researchId = "", now = Date.now()) {
  const definition = getLaboratoryResearchDefinition(researchId);
  if (!definition) return sanctuary;

  const completed = {
    ...(sanctuary?.laboratory?.completed || {}),
    [researchId]: true,
  };
  const laboratory = {
    ...createEmptyLaboratoryState(),
    ...(sanctuary?.laboratory || {}),
    completed,
  };

  const nextStations = buildSanctuaryStationsWithLaboratory(
    sanctuary?.stations || {},
    laboratory,
    sanctuary,
    {}
  );

  return {
    ...(sanctuary || {}),
    laboratory,
    stations: nextStations,
    updatedAt: now,
  };
}
