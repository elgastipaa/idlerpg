import { getActiveExpeditionContractWithProgress } from "../../engine/progression/expeditionContracts";

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
    ensureValidActiveRelics,
    finalizeExpeditionTelemetry,
    getAccountTelemetry,
    getCurrentOnlineSeconds,
    getMaxRunSigilSlots,
    normalizeBlueprintRecord,
    normalizeExtractedItemRecord,
    normalizeProjectRecord,
    normalizeRelicRecord,
    normalizeRunSigilIds,
    withAchievementProgress,
  } = dependencies;

  if (action?.type !== "CONFIRM_EXTRACTION") return null;
  if (state.expedition?.phase !== "extraction") return state;

  const extractionAt = Number(action.now || Date.now());
  const exitReason = "retire";
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
  const selectedProjectItemId = state.expedition?.selectedProjectItemId || null;
  const selectedProjectDecision = state.expedition?.selectedProjectDecision === "discard" ? "discard" : "keep";
  const selectedProjectOption = (preview?.projectOptions || []).find(option => option?.itemId === selectedProjectItemId) || null;
  const existingRelicArmory = Array.isArray(state.sanctuary?.relicArmory)
    ? state.sanctuary.relicArmory.map(relic => normalizeRelicRecord(relic)).filter(Boolean)
    : [];
  const relicSlotCap = Math.max(1, Number(state?.sanctuary?.extractionUpgrades?.relicSlots || 8));
  const availableRelicSlotsNow = Math.max(0, relicSlotCap - existingRelicArmory.length);
  const keepRequested = selectedProjectDecision !== "discard" && Boolean(selectedProjectItemId);
  const shouldStoreRelic = keepRequested && availableRelicSlotsNow > 0;
  const autoDiscardBecauseFull = keepRequested && !shouldStoreRelic && Boolean(selectedProjectOption?.itemId);
  const rawDiscardRewards =
    selectedProjectOption && (selectedProjectDecision === "discard" || autoDiscardBecauseFull)
      ? selectedProjectOption.discardRewards || {}
      : {};
  const discardRewards = {
    essence: Math.max(0, Math.floor(Number(rawDiscardRewards?.essence || 0))),
    codexInk: Math.max(0, Math.floor(Number(rawDiscardRewards?.codexInk || 0))),
    sigilFlux: Math.max(0, Math.floor(Number(rawDiscardRewards?.sigilFlux || 0))),
    relicDust: Math.max(0, Math.floor(Number(rawDiscardRewards?.relicDust || 0))),
  };
  const discardRewardParts = [];
  if (discardRewards.essence > 0) discardRewardParts.push(`+${discardRewards.essence} esencia`);
  if (discardRewards.codexInk > 0) discardRewardParts.push(`+${discardRewards.codexInk} tinta`);
  if (discardRewards.sigilFlux > 0) discardRewardParts.push(`+${discardRewards.sigilFlux} flux`);
  if (discardRewards.relicDust > 0) discardRewardParts.push(`+${discardRewards.relicDust} polvo`);
  const discardRewardsLabel = discardRewardParts.join(", ");
  const activeExpeditionContract = getActiveExpeditionContractWithProgress(
    state,
    state?.expeditionContracts || {}
  );
  const contractReadyToClaim = Boolean(
    activeExpeditionContract?.progress?.completed && !activeExpeditionContract?.claimed
  );
  const nextExpeditionContracts = {
    ...(state?.expeditionContracts || {}),
    contracts: Array.isArray(state?.expeditionContracts?.contracts)
      ? state.expeditionContracts.contracts.map(contract =>
          contract?.id === activeExpeditionContract?.id && contractReadyToClaim
            ? { ...contract, readyToClaim: true }
            : contract
        )
      : [],
  };
  const retainedRelic = shouldStoreRelic
    ? normalizeRelicRecord(
        buildRetainedExtractionItem(
          state,
          selectedProjectItemId,
          {
            exitReason,
            maxTier: preview.summary?.maxTier || 1,
            bossesKilled: preview.summary?.bossesKilled || 0,
          }
        )
      )
    : null;
  const nextRelicArmory = retainedRelic
    ? [...existingRelicArmory, retainedRelic]
    : existingRelicArmory;
  const existingStash = Array.isArray(state.sanctuary?.stash)
    ? state.sanctuary.stash.map(project => normalizeProjectRecord(project)).filter(Boolean)
    : [];
  const nextStash = existingStash;
  const nextActiveRelics = ensureValidActiveRelics(
    nextRelicArmory,
    {
      ...(state.sanctuary?.activeRelics || {}),
      ...(retainedRelic && !state?.sanctuary?.activeRelics?.[retainedRelic.slot]
        ? { [retainedRelic.slot]: retainedRelic.id }
        : {}),
    }
  );
  const nextPlayer = {
    ...(state.player || {}),
    essence: Math.max(
      0,
      Number(state.player?.essence || 0) + discardRewards.essence
    ),
  };
  const nextSanctuary = {
    ...createEmptySanctuaryState(),
    ...(state.sanctuary || {}),
    stash: nextStash,
    cargoInventory: [...(state.sanctuary?.cargoInventory || []), ...selectedCargo],
    extractedItems: [...(state.sanctuary?.extractedItems || []).map(item => normalizeExtractedItemRecord(item)).filter(Boolean)],
    relicArmory: nextRelicArmory,
    activeRelics: nextActiveRelics,
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
    resources: {
      ...createEmptySanctuaryState().resources,
      ...(state.sanctuary?.resources || {}),
      sigilFlux: Math.max(
        0,
        Number(state.sanctuary?.resources?.sigilFlux || 0) + discardRewards.sigilFlux
      ),
      relicDust: Math.max(
        0,
        Number(state.sanctuary?.resources?.relicDust || 0) + discardRewards.relicDust
      ),
      codexInk: Math.max(
        0,
        Number(state.sanctuary?.resources?.codexInk || 0) + discardRewards.codexInk
      ),
    },
  };
  const discardLogSuffix = discardRewardsLabel
    ? `${autoDiscardBecauseFull ? " (arsenal lleno, autodesguace)" : ""} · ${discardRewardsLabel}`
    : "";
  const contractLogSuffix = contractReadyToClaim
    ? ` y contrato listo para reclamar (${activeExpeditionContract?.title || activeExpeditionContract?.goal?.name || "objetivo"})`
    : "";

  if (preview?.prestige?.mode === "echoes") {
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
        : {
            ...finalizedTelemetry,
          };
    return buildPrestigeResetState(
      {
        ...state,
        player: nextPlayer,
        sanctuary: nextSanctuary,
        expeditionContracts: nextExpeditionContracts,
        accountTelemetry: nextAccountTelemetry,
      },
      {
        echoesGained,
        nextPrestigeLevel,
        nextPrestigeState,
        resetRunSigilIds,
        nextRunContext,
        logLine: `Extraccion completada. +${echoesGained} ecos y vuelta al Santuario con ${selectedCargo.length} bundle(s)${retainedRelic ? " y 1 reliquia al arsenal" : ""}${discardLogSuffix ? ` y desguace${discardLogSuffix}` : ""}${contractLogSuffix}.`,
      }
    );
  }

  const postResetState = buildPostExtractionExpeditionReset(
    {
      ...state,
      player: nextPlayer,
    },
    {
    exitReason,
    goldMultiplier: 1,
    }
  );
  const nextAccountTelemetry = finalizeExpeditionTelemetry(getAccountTelemetry(state), state.expedition, {
    exitReason,
    prestige: false,
    now: extractionAt,
  });
  const nextTrackedTelemetry = {
    ...nextAccountTelemetry,
  };
  return withAchievementProgress({
    ...postResetState,
    sanctuary: nextSanctuary,
    expeditionContracts: nextExpeditionContracts,
    accountTelemetry: nextTrackedTelemetry,
    combat: {
      ...postResetState.combat,
      log: [
        `Extraccion manual. ${selectedCargo.length} bundle(s) al Santuario${retainedRelic ? " y 1 reliquia al arsenal" : ""}${discardLogSuffix ? ` y desguace${discardLogSuffix}` : ""}${contractLogSuffix}.`,
      ],
    },
  });
}
