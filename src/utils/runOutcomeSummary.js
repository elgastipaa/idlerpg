function formatCount(count = 0) {
  return Number(count || 0).toLocaleString();
}

function pluralize(count = 0, singular = "", plural = "") {
  const safePlural = plural || `${singular}s`;
  return `${formatCount(count)} ${Number(count || 0) === 1 ? singular : safePlural}`;
}

function getProjectCount(state) {
  return Array.isArray(state?.sanctuary?.stash) ? state.sanctuary.stash.length : 0;
}

function getActiveRelicCount(state) {
  return Object.values(state?.sanctuary?.activeRelics || {}).filter(Boolean).length;
}

function buildCarryoverLine({ selectedCargoCount = 0, hasRetainedItem = false } = {}) {
  if (selectedCargoCount <= 0 && !hasRetainedItem) {
    return "No marcaste bundles ni reliquia para llevar al Santuario.";
  }
  const parts = [];
  if (selectedCargoCount > 0) {
    parts.push(`${pluralize(selectedCargoCount, "bundle")} van al Santuario`);
  }
  if (hasRetainedItem) {
    parts.push("1 reliquia entra al arsenal");
  }
  const sentence = parts.join(" y ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function buildRelicLine(
  activeRelicCount = 0,
  {
    singular = "entra equipada en la siguiente salida.",
    plural = "entran equipadas en la siguiente salida.",
  } = {}
) {
  if (activeRelicCount <= 0) return "";
  if (activeRelicCount === 1) {
    return `1 reliquia activa ${singular}`;
  }
  return `${pluralize(activeRelicCount, "reliquia")} activas ${plural}`;
}

function buildProjectLine(projectCount = 0, text = "queda listo para forja profunda en el Taller.") {
  if (projectCount <= 0) return "";
  if (projectCount === 1) {
    return `1 proyecto en stash ${text}`;
  }
  return `${pluralize(projectCount, "proyecto")} en stash ${text.replace("queda", "quedan")}`;
}

export function buildRunOutcomeSummary(
  state,
  {
    prestigeMode = "none",
    exitReason = "retire",
    selectedCargoCount = 0,
    hasRetainedItem = false,
    echoes = 0,
    source = "extraction",
  } = {}
) {
  const prestigeReset = prestigeMode === "echoes";
  const projectCount = getProjectCount(state);
  const activeRelicCount = getActiveRelicCount(state);

  if (prestigeReset) {
    const keeps = [
      "Ecos, nodos comprados y resonancia de cuenta.",
      "Santuario, recursos persistentes, jobs, arsenal y Deep Forge.",
    ];
    if (selectedCargoCount > 0 || hasRetainedItem || source === "extraction") {
      keeps.push(
        buildCarryoverLine({
          selectedCargoCount,
          hasRetainedItem,
          exitReason,
        })
      );
    } else {
      keeps.push("La cuenta se queda intacta; solo cortas esta run.");
    }

    const resets = [
      "Nivel, tier, kills y momentum vuelven a 0.",
      "Gold, equipo, inventario, upgrades y talentos de run se limpian.",
      "Clase y especializacion se eligen de nuevo antes de la proxima salida.",
    ];

    const nextRun = [
      echoes > 0
        ? `Vuelves al Santuario con +${formatCount(echoes)} ecos listos para gastar.`
        : "Cuando esta salida ya rinda ecos, vuelves al Santuario con esa moneda lista para reinvertir.",
      "La proxima expedicion arranca en Nivel 1 / Tier 1.",
      activeRelicCount > 0
        ? buildRelicLine(activeRelicCount, {
            singular: "entra equipada al arrancar la siguiente salida.",
            plural: "entran equipadas al arrancar la siguiente salida.",
          })
        : projectCount > 0
        ? buildProjectLine(projectCount, "queda listo para seguir forjando en Deep Forge.")
        : "Antes de salir otra vez vuelves a elegir clase, sigilos y setup desde el Santuario.",
    ];

    return {
      title: source === "prestige" ? "Cuando extraigas por ecos" : "Si confirmas esta salida",
      groups: [
        { id: "keeps", label: "Conservas", items: keeps },
        { id: "resets", label: "Se reinicia", items: resets },
        { id: "next", label: "Proxima run", items: nextRun },
      ],
    };
  }

  const keeps = [
    "Conservas oro, esencia, clase, spec y progreso base del heroe.",
    "Talentos, upgrades y tablero meta siguen igual.",
    buildCarryoverLine({
      selectedCargoCount,
      hasRetainedItem,
      exitReason,
    }),
  ];

  const resets = [
    "La run actual termina y el tier vuelve a 1.",
    "Inventario, equipo equipado y efectos temporales se vacian.",
    "Kills, buffs de combate y counters de esta salida se reinician.",
  ];

  const nextRun = [
    "Sales otra vez desde Santuario con el mismo heroe, no con una hoja nueva.",
    "La proxima salida usa tus talentos y upgrades actuales.",
    activeRelicCount > 0
      ? buildRelicLine(activeRelicCount, {
          singular: "entra automaticamente al arrancar.",
          plural: "entran automaticamente al arrancar.",
        })
      : projectCount > 0
      ? buildProjectLine(projectCount, "queda listo para forja profunda antes de la proxima salida.")
      : "Si luego activas reliquias, proyectos o sigilos, impactan en la proxima salida.",
  ];

  return {
    title: "Si confirmas esta salida",
    groups: [
      { id: "keeps", label: "Conservas", items: keeps },
      { id: "resets", label: "Se reinicia", items: resets },
      { id: "next", label: "Proxima run", items: nextRun },
    ],
  };
}
