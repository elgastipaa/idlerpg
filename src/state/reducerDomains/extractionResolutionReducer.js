export function handleExtractionResolutionAction(state, action, dependencies) {
  const {
    buildExtractionPreview,
    buildPostExtractionExpeditionReset,
    buildPrestigeResetState,
    buildRetainedExtractionItem,
    calculatePrestigeEchoGain,
    canPrestige,
    createEmptySanctuaryState,
    createRunContext,
    ensureValidActiveBlueprints,
    finalizeExpeditionTelemetry,
    getAccountTelemetry,
    getCurrentOnlineSeconds,
    getMaxRunSigilSlots,
    normalizeBlueprintRecord,
    normalizeExtractedItemRecord,
    normalizeRunSigilIds,
    withAchievementProgress,
  } = dependencies;

  if (action?.type !== "CONFIRM_EXTRACTION") return null;
  if (state.expedition?.phase !== "extraction") return state;

  const extractionAt = Number(action.now || Date.now());
  const exitReason = state.expedition?.exitReason === "death" ? "death" : "retire";
  const preview = state.expedition?.extractionPreview || buildExtractionPreview(state, {
    exitReason,
  });
  const selectedCargoIds = new Set(state.expedition?.selectedCargoIds || []);
  const selectedCargo = (preview.cargoOptions || [])
    .filter(option => selectedCargoIds.has(option.id))
    .map(option => ({
      id: `${option.id}_${extractionAt}`,
      type: option.type,
      quantity: Math.max(1, Number(option.recoveredQuantity || option.quantity || 1)),
      label: option.label,
      description: option.description,
      source: exitReason,
      extractedAt: extractionAt,
    }));
  const retainedItem = buildRetainedExtractionItem(
    state,
    state.expedition?.selectedProjectItemId,
    {
      exitReason,
      maxTier: preview.summary?.maxTier || 1,
      bossesKilled: preview.summary?.bossesKilled || 0,
    }
  );
  const nextSanctuary = {
    ...createEmptySanctuaryState(),
    ...(state.sanctuary || {}),
    cargoInventory: [...(state.sanctuary?.cargoInventory || []), ...selectedCargo],
    extractedItems: retainedItem
      ? [...(state.sanctuary?.extractedItems || []), normalizeExtractedItemRecord(retainedItem)]
      : [...(state.sanctuary?.extractedItems || [])],
    blueprints: (state.sanctuary?.blueprints || []).map(blueprint => normalizeBlueprintRecord(blueprint)).filter(Boolean),
    activeBlueprints: ensureValidActiveBlueprints(
      state.sanctuary?.blueprints || [],
      state.sanctuary?.activeBlueprints || {}
    ),
    stations: {
      ...createEmptySanctuaryState().stations,
      ...(state.sanctuary?.stations || {}),
      laboratory: {
        ...createEmptySanctuaryState().stations.laboratory,
        ...((state.sanctuary?.stations || {}).laboratory || {}),
        unlocked: true,
      },
    },
    deepForgeSession: null,
  };

  if (preview?.prestige?.mode === "echoes" || preview?.prestige?.mode === "emergency") {
    const prestigeCheck = canPrestige(state);
    if (!prestigeCheck.ok) return state;
    const echoesGained = preview?.prestige?.echoes || calculatePrestigeEchoGain(state);
    const finalizedTelemetry = finalizeExpeditionTelemetry(getAccountTelemetry(state), state.expedition, {
      exitReason,
      prestige: true,
      now: extractionAt,
    });
    const nextPrestigeLevel = (state.prestige?.level || 0) + 1;
    const nextRunContext = createRunContext();
    const resetRunSigilIds = normalizeRunSigilIds("free", {
      slots: getMaxRunSigilSlots(state?.abyss || {}),
    });
    const nextPrestigeState = {
      ...state.prestige,
      level: nextPrestigeLevel,
      echoes: (state.prestige?.echoes || 0) + echoesGained,
      spentEchoes: state.prestige?.spentEchoes || 0,
      totalEchoesEarned: (state.prestige?.totalEchoesEarned || 0) + echoesGained,
      bestHistoricTier: Math.max(
        Number(state.prestige?.bestHistoricTier || 0),
        Number(prestigeCheck.preview?.progress?.maxTier || state.combat?.maxTier || 1)
      ),
      nodes: { ...(state.prestige?.nodes || {}) },
    };
    const nextAccountTelemetry =
      finalizedTelemetry.firstPrestigeAtOnlineSeconds == null
        ? {
            ...finalizedTelemetry,
            firstPrestigeAtOnlineSeconds: getCurrentOnlineSeconds(finalizedTelemetry),
          }
        : finalizedTelemetry;
    return buildPrestigeResetState(
      {
        ...state,
        sanctuary: nextSanctuary,
        accountTelemetry: nextAccountTelemetry,
      },
      {
        echoesGained,
        nextPrestigeLevel,
        nextPrestigeState,
        resetRunSigilIds,
        nextRunContext,
        logLine:
          preview?.prestige?.mode === "emergency"
            ? `Extraccion de emergencia. +${echoesGained} ecos y vuelta al Santuario con ${selectedCargo.length} bundle(s) recuperados.`
            : `Extraccion completada. +${echoesGained} ecos y vuelta al Santuario con ${selectedCargo.length} bundle(s)${retainedItem ? " y 1 item rescatado." : "."}`,
      }
    );
  }

  const postResetState = buildPostExtractionExpeditionReset(state, {
    exitReason,
    goldMultiplier: exitReason === "death" ? 0.75 : 1,
  });
  const nextAccountTelemetry = finalizeExpeditionTelemetry(getAccountTelemetry(state), state.expedition, {
    exitReason,
    prestige: false,
    now: extractionAt,
  });
  return withAchievementProgress({
    ...postResetState,
    sanctuary: nextSanctuary,
    accountTelemetry: nextAccountTelemetry,
    combat: {
      ...postResetState.combat,
      log: [
        `Extraccion ${exitReason === "death" ? "de emergencia" : "manual"}. ${selectedCargo.length} bundle(s) al Santuario${retainedItem ? " y 1 item rescatado." : "."}`,
      ],
    },
  });
}
