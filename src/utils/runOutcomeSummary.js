function formatCount(count = 0) {
  return Number(count || 0).toLocaleString();
}

function pluralize(count = 0, singular = "", plural = "") {
  const safePlural = plural || `${singular}s`;
  return `${formatCount(count)} ${Number(count || 0) === 1 ? singular : safePlural}`;
}

function getActiveBlueprintCount(state) {
  return Object.values(state?.sanctuary?.activeBlueprints || {}).filter(Boolean).length;
}

function buildCarryoverLine({ selectedCargoCount = 0, hasRetainedItem = false, exitReason = "retire" } = {}) {
  if (selectedCargoCount <= 0 && !hasRetainedItem) {
    return exitReason === "death"
      ? "No aseguraste bundles ni item rescatado en esta salida."
      : "No marcaste bundles ni item rescatado para llevar al Santuario.";
  }
  const parts = [];
  if (selectedCargoCount > 0) {
    parts.push(`${pluralize(selectedCargoCount, "bundle")} van al Santuario`);
  }
  if (hasRetainedItem) {
    parts.push("1 item queda rescatado para decidir luego");
  }
  const sentence = parts.join(" y ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function buildBlueprintLine(activeBlueprintCount = 0, text = "puede materializar gear en la siguiente salida.") {
  if (activeBlueprintCount <= 0) return "";
  if (activeBlueprintCount === 1) {
    return `1 blueprint activo ${text}`;
  }
  return `${pluralize(activeBlueprintCount, "blueprint")} activos ${text.replace("puede", "pueden")}`;
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
  const prestigeReset = prestigeMode === "echoes" || prestigeMode === "emergency";
  const emergency = exitReason === "death" || prestigeMode === "emergency";
  const activeBlueprintCount = getActiveBlueprintCount(state);

  if (prestigeReset) {
    const keeps = [
      "Ecos, nodos comprados y resonancia de cuenta.",
      "Santuario, recursos persistentes, jobs y blueprints.",
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
      activeBlueprintCount > 0
        ? buildBlueprintLine(activeBlueprintCount, "puede materializar gear en la siguiente salida.")
        : "Antes de salir otra vez vuelves a elegir clase, sigilos y setup desde el Santuario.",
    ];

    if (emergency) {
      resets[1] = "Gold, equipo, inventario, upgrades y talentos de run se limpian igual que en un prestige normal.";
      nextRun[0] =
        echoes > 0
          ? `La emergencia convierte menos valor, pero igual vuelves con +${formatCount(echoes)} ecos.`
          : "La emergencia recupera menos valor que una salida controlada.";
    }

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
    emergency
      ? "Conservas 75% del oro, toda la esencia y el progreso base del heroe."
      : "Conservas oro, esencia, clase, spec y progreso base del heroe.",
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
    emergency
      ? "La emergencia recupera menos valor y no asegura item rescatado."
      : "Kills, buffs de combate y counters de esta salida se reinician.",
  ];

  const nextRun = [
    "Sales otra vez desde Santuario con el mismo heroe, no con una hoja nueva.",
    "La proxima salida usa tus talentos y upgrades actuales.",
    activeBlueprintCount > 0
      ? buildBlueprintLine(activeBlueprintCount, "puede materializar gear automaticamente al arrancar.")
      : "Si luego activas blueprints o sigilos, impactan en la proxima salida.",
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
