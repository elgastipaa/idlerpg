export function handleBlueprintForgeAction(state, action, dependencies) {
  const {
    addBlueprintCharges,
    ascendBlueprint,
    buildBlueprintAscensionPreview,
    buildBlueprintChargeReward,
    buildBlueprintFromExtractedItem,
    buildBlueprintPowerTunePreview,
    buildBlueprintStructurePreview,
    buildDeepForgeReforgePreview,
    canAscendBlueprint,
    canDeepForgeProject,
    canTuneBlueprintPower,
    canUpgradeBlueprintStructure,
    createEmptyFamilyChargeState,
    createEmptySanctuaryState,
    createEmptySessionAnalytics,
    deepForgeApplyReforge,
    deepForgeAscendProject,
    deepForgePolishProject,
    ensureValidActiveBlueprints,
    getAccountTelemetry,
    getLegendaryPowerImprintReduction,
    getUnlockedLegendaryPowers,
    isSanctuaryStationUnlocked,
    investBlueprintAffinity,
    normalizeBlueprintRecord,
    normalizeExtractedItemRecord,
    normalizeProjectRecord,
    refreshStats,
    tuneBlueprintPower,
    upgradeBlueprintStructure,
    withAchievementProgress,
  } = dependencies;

  switch (action?.type) {
    case "CONVERT_EXTRACTED_ITEM_TO_BLUEPRINT": {
      const extractedItemId = action.extractedItemId || action.itemId || action.payload?.extractedItemId || action.payload?.itemId;
      const extractedItems = Array.isArray(state.sanctuary?.extractedItems) ? state.sanctuary.extractedItems : [];
      const targetItem = normalizeExtractedItemRecord(extractedItems.find(item => item?.id === extractedItemId));
      if (!targetItem?.id) return state;

      const blueprint = buildBlueprintFromExtractedItem(targetItem, { now: action.now || Date.now() });
      if (!blueprint) return state;

      const nextBlueprints = [
        ...(state.sanctuary?.blueprints || []).map(existingBlueprint => normalizeBlueprintRecord(existingBlueprint)).filter(Boolean),
        normalizeBlueprintRecord(blueprint),
      ];
      const chargeReward = buildBlueprintChargeReward(targetItem, { multiplier: 1 });
      const nextActiveBlueprints = ensureValidActiveBlueprints(nextBlueprints, {
        ...(state.sanctuary?.activeBlueprints || {}),
        [blueprint.slot || targetItem.type || "weapon"]:
          (state.sanctuary?.activeBlueprints || {})[blueprint.slot || targetItem.type || "weapon"] || blueprint.id,
      });

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          extractedItems: extractedItems.filter(item => item?.id !== targetItem.id),
          blueprints: nextBlueprints,
          activeBlueprints: nextActiveBlueprints,
          familyCharges: addBlueprintCharges(state.sanctuary?.familyCharges || {}, chargeReward),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintsCreated: Math.max(0, Number(state?.accountTelemetry?.blueprintsCreated || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${targetItem.name} se convierte en blueprint. Conserva direccion, no el item exacto.`,
          ].slice(-20),
        },
      };
    }

    case "SET_ACTIVE_BLUEPRINT": {
      const blueprintId = action.blueprintId || action.payload?.blueprintId || null;
      const slot = action.slot || action.payload?.slot || null;
      if (!slot || !["weapon", "armor"].includes(slot)) return state;
      const blueprints = (state.sanctuary?.blueprints || []).map(blueprint => normalizeBlueprintRecord(blueprint)).filter(Boolean);
      if (blueprintId && !blueprints.some(blueprint => blueprint.id === blueprintId && blueprint.slot === slot)) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          activeBlueprints: ensureValidActiveBlueprints(blueprints, {
            ...(state.sanctuary?.activeBlueprints || {}),
            [slot]: blueprintId || null,
          }),
        },
      };
    }

    case "INVEST_BLUEPRINT_AFFINITY": {
      if (!isSanctuaryStationUnlocked(state.sanctuary, "deepForge")) return state;
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const familyId = action.familyId || action.payload?.familyId;
      const charges = Math.max(1, Number(action.charges || action.payload?.charges || 1));
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const blueprintIndex = blueprints.findIndex(blueprint => blueprint?.id === blueprintId);
      if (blueprintIndex < 0 || !familyId) return state;
      const currentCharges = Math.max(0, Number(state.sanctuary?.familyCharges?.[familyId] || 0));
      if (currentCharges < charges) return state;

      const nextBlueprint = investBlueprintAffinity(blueprints[blueprintIndex], familyId, charges);
      if (!nextBlueprint) return state;
      blueprints[blueprintIndex] = normalizeBlueprintRecord(nextBlueprint);

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          familyCharges: {
            ...createEmptyFamilyChargeState(),
            ...(state.sanctuary?.familyCharges || {}),
            [familyId]: Math.max(0, currentCharges - charges),
          },
          activeBlueprints: ensureValidActiveBlueprints(blueprints, state.sanctuary?.activeBlueprints || {}),
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${nextBlueprint.sourceName || nextBlueprint.id} gana afinidad en ${familyId}.`,
          ].slice(-20),
        },
      };
    }

    case "UPGRADE_BLUEPRINT_STRUCTURE": {
      if (!isSanctuaryStationUnlocked(state.sanctuary, "deepForge")) return state;
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const blueprintIndex = blueprints.findIndex(blueprint => blueprint?.id === blueprintId);
      if (blueprintIndex < 0) return state;

      const currentBlueprint = normalizeBlueprintRecord(blueprints[blueprintIndex]);
      const check = canUpgradeBlueprintStructure(currentBlueprint, state.sanctuary?.resources || {});
      if (!check.ok) return state;

      const preview = buildBlueprintStructurePreview(currentBlueprint);
      const nextBlueprint = upgradeBlueprintStructure(currentBlueprint, { now: action.now || Date.now() });
      if (!nextBlueprint) return state;

      blueprints[blueprintIndex] = normalizeBlueprintRecord(nextBlueprint);
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          activeBlueprints: ensureValidActiveBlueprints(blueprints, state.sanctuary?.activeBlueprints || {}),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintStructureUpgrades: Math.max(0, Number(state?.accountTelemetry?.blueprintStructureUpgrades || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${nextBlueprint.sourceName || nextBlueprint.id} refuerza su estructura (${preview?.currentLevel || 0} -> ${nextBlueprint.blueprintLevel || 0}) · rating ${preview?.currentEffectiveRating || 0} -> ${preview?.nextEffectiveRating || preview?.currentEffectiveRating || 0}.`,
          ].slice(-20),
        },
      };
    }

    case "TUNE_BLUEPRINT_POWER": {
      if (!isSanctuaryStationUnlocked(state.sanctuary, "deepForge")) return state;
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const blueprintIndex = blueprints.findIndex(blueprint => blueprint?.id === blueprintId);
      if (blueprintIndex < 0) return state;

      const currentBlueprint = normalizeBlueprintRecord(blueprints[blueprintIndex]);
      const check = canTuneBlueprintPower(currentBlueprint, state.sanctuary?.resources || {});
      if (!check.ok) return state;

      const preview = buildBlueprintPowerTunePreview(currentBlueprint);
      const nextBlueprint = tuneBlueprintPower(currentBlueprint, { now: action.now || Date.now() });
      if (!nextBlueprint) return state;

      blueprints[blueprintIndex] = normalizeBlueprintRecord(nextBlueprint);
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          activeBlueprints: ensureValidActiveBlueprints(blueprints, state.sanctuary?.activeBlueprints || {}),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintPowerTunes: Math.max(0, Number(state?.accountTelemetry?.blueprintPowerTunes || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${nextBlueprint.sourceName || nextBlueprint.id} sintoniza su poder legendario (${preview?.currentLevel || 0} -> ${nextBlueprint.powerTuneLevel || 0}).`,
          ].slice(-20),
        },
      };
    }

    case "ASCEND_BLUEPRINT": {
      if (!isSanctuaryStationUnlocked(state.sanctuary, "deepForge")) return state;
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const blueprintIndex = blueprints.findIndex(blueprint => blueprint?.id === blueprintId);
      if (blueprintIndex < 0) return state;

      const currentBlueprint = normalizeBlueprintRecord(blueprints[blueprintIndex]);
      const check = canAscendBlueprint(currentBlueprint, {
        resources: state.sanctuary?.resources || {},
        essence: state.player?.essence || 0,
      });
      if (!check.ok) return state;

      const preview = buildBlueprintAscensionPreview(currentBlueprint);
      const nextBlueprint = ascendBlueprint(currentBlueprint, { now: action.now || Date.now() });
      if (!nextBlueprint) return state;

      blueprints[blueprintIndex] = normalizeBlueprintRecord(nextBlueprint);
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));
      const spentEssence = Math.max(0, Number(check.costs?.essence || 0));

      return {
        ...state,
        player: refreshStats({
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        }),
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          activeBlueprints: ensureValidActiveBlueprints(blueprints, state.sanctuary?.activeBlueprints || {}),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintAscensions: Math.max(0, Number(state?.accountTelemetry?.blueprintAscensions || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${nextBlueprint.sourceName || nextBlueprint.id} asciende (${preview?.currentAscensionTier || 0} -> ${nextBlueprint.ascensionTier || 0}), reinicia estructura y empuja su materializacion a Tier ${preview?.nextEffectiveTier || preview?.currentEffectiveTier || nextBlueprint.itemTier}.`,
          ].slice(-20),
        },
      };
    }

    case "DISCARD_BLUEPRINT": {
      const blueprintId = action.blueprintId || action.payload?.blueprintId;
      const blueprints = Array.isArray(state.sanctuary?.blueprints) ? [...state.sanctuary.blueprints] : [];
      const targetBlueprint = normalizeBlueprintRecord(blueprints.find(blueprint => blueprint?.id === blueprintId));
      if (!targetBlueprint?.id) return state;

      const nextBlueprints = blueprints
        .filter(blueprint => blueprint?.id !== targetBlueprint.id)
        .map(blueprint => normalizeBlueprintRecord(blueprint))
        .filter(Boolean);

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          blueprints: nextBlueprints,
          activeBlueprints: ensureValidActiveBlueprints(nextBlueprints, state.sanctuary?.activeBlueprints || {}),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          blueprintsDiscarded: Math.max(0, Number(state?.accountTelemetry?.blueprintsDiscarded || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Descartas ${targetBlueprint.sourceName || targetBlueprint.id}. El plano deja de ocupar espacio permanente.`,
          ].slice(-20),
        },
      };
    }

    case "DEEP_FORGE_ASCEND_PROJECT": {
      const projectId = action.projectId || action.payload?.projectId;
      const selectedPowerId = action.selectedPowerId ?? action.payload?.selectedPowerId ?? null;
      const stash = Array.isArray(state.sanctuary?.stash) ? state.sanctuary.stash : [];
      const projectIndex = stash.findIndex(project => project?.id === projectId);
      if (projectIndex < 0) return state;

      const project = normalizeProjectRecord(stash[projectIndex]);
      const unlockedPowerIds = getUnlockedLegendaryPowers(state.codex || {}, {
        specialization: state.player?.specialization,
        className: state.player?.class,
        abyss: state.abyss || {},
      }).map(power => power.id);
      const imprintReduction = getLegendaryPowerImprintReduction(state.codex || {}, selectedPowerId);
      const check = canDeepForgeProject(
        project,
        {
          playerEssence: state.player?.essence || 0,
          relicDust: state.sanctuary?.resources?.relicDust || 0,
        },
        "ascend",
        null,
        {
          selectedPowerId,
          unlockedPowerIds,
          imprintReduction,
        }
      );
      if (!check.ok) return state;

      const nextProject = deepForgeAscendProject(project, { selectedPowerId });
      if (!nextProject) return state;

      const nextStash = [...stash];
      nextStash[projectIndex] = normalizeProjectRecord(nextProject);
      const spentEssence = Math.max(0, Number(check.costs?.essence || 0));
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));
      const selectedPowerLabel =
        selectedPowerId && selectedPowerId !== project?.legendaryPowerId
          ? " con poder injertado"
          : "";

      return withAchievementProgress({
        ...state,
        player: {
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        },
        stats: {
          ...state.stats,
          ascendsCrafted: (state.stats?.ascendsCrafted || 0) + 1,
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: nextStash,
          deepForgeSession:
            state.sanctuary?.deepForgeSession?.projectId === projectId
              ? null
              : state.sanctuary?.deepForgeSession || null,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            ascendsCrafted: (state.combat.analytics?.ascendsCrafted || 0) + 1,
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + spentEssence,
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              ascends: (state.combat.analytics?.essenceSpentBySource?.ascends || 0) + spentEssence,
            },
          },
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${project.name} asciende a rango ${Math.max(0, Number(project?.ascensionTier || 0)) + 1}, vuelve a +0${selectedPowerLabel}.`,
          ].slice(-20),
        },
      });
    }

    case "DEEP_FORGE_POLISH_PROJECT": {
      const projectId = action.projectId || action.payload?.projectId;
      const affixIndex = Number(action.affixIndex ?? action.payload?.affixIndex);
      const stash = Array.isArray(state.sanctuary?.stash) ? state.sanctuary.stash : [];
      const projectIndex = stash.findIndex(project => project?.id === projectId);
      if (projectIndex < 0) return state;

      const project = normalizeProjectRecord(stash[projectIndex]);
      const check = canDeepForgeProject(
        project,
        {
          playerEssence: state.player?.essence || 0,
          relicDust: state.sanctuary?.resources?.relicDust || 0,
        },
        "polish",
        affixIndex
      );
      if (!check.ok) return state;

      const nextProject = deepForgePolishProject(project, affixIndex);
      if (!nextProject) return state;

      const nextStash = [...stash];
      nextStash[projectIndex] = normalizeProjectRecord(nextProject);
      const spentEssence = Math.max(0, Number(check.costs?.essence || 0));
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));

      return withAchievementProgress({
        ...state,
        player: {
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        },
        stats: {
          ...state.stats,
          polishesCrafted: (state.stats?.polishesCrafted || 0) + 1,
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: nextStash,
          deepForgeSession:
            state.sanctuary?.deepForgeSession?.projectId === projectId &&
            state.sanctuary?.deepForgeSession?.affixIndex === affixIndex
              ? null
              : state.sanctuary?.deepForgeSession || null,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            polishesCrafted: (state.combat.analytics?.polishesCrafted || 0) + 1,
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + spentEssence,
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              polish: (state.combat.analytics?.essenceSpentBySource?.polish || 0) + spentEssence,
            },
          },
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Pulido profundo sobre ${project.name} · ${project.affixes?.[affixIndex]?.stat || "linea"} ajustada.`,
          ].slice(-20),
        },
      });
    }

    case "START_DEEP_FORGE_REFORGE_PREVIEW": {
      const projectId = action.projectId || action.payload?.projectId;
      const affixIndex = Number(action.affixIndex ?? action.payload?.affixIndex);
      const stash = Array.isArray(state.sanctuary?.stash) ? state.sanctuary.stash : [];
      const project = normalizeProjectRecord(stash.find(candidate => candidate?.id === projectId));
      if (!project?.id) return state;

      const existingSession = state.sanctuary?.deepForgeSession || null;
      if (
        existingSession &&
        (existingSession.projectId !== projectId || Number(existingSession.affixIndex) !== affixIndex)
      ) {
        return state;
      }
      if (
        existingSession &&
        existingSession.projectId === projectId &&
        Number(existingSession.affixIndex) === affixIndex
      ) {
        return state;
      }

      const check = canDeepForgeProject(
        project,
        {
          playerEssence: state.player?.essence || 0,
          relicDust: state.sanctuary?.resources?.relicDust || 0,
        },
        "reforge",
        affixIndex
      );
      if (!check.ok) return state;

      const options = buildDeepForgeReforgePreview(project, affixIndex, {
        allowAbyssAffixes: ["epic", "legendary"].includes(project?.rarity),
      });
      if (!Array.isArray(options) || options.length === 0) return state;

      const spentEssence = Math.max(0, Number(check.costs?.essence || 0));
      const spentDust = Math.max(0, Number(check.costs?.relicDust || 0));

      return {
        ...state,
        player: {
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          deepForgeSession: {
            mode: "reforge",
            projectId,
            affixIndex,
            currentAffix: project.affixes?.[affixIndex] || null,
            options,
            costs: {
              essence: spentEssence,
              relicDust: spentDust,
            },
            startedAt: action.now || Date.now(),
          },
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + spentEssence,
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              reforge: (state.combat.analytics?.essenceSpentBySource?.reforge || 0) + spentEssence,
            },
          },
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Reforge profunda preparada sobre ${project.name}.`,
          ].slice(-20),
        },
      };
    }

    case "APPLY_DEEP_FORGE_REFORGE": {
      const activeSession = state.sanctuary?.deepForgeSession || null;
      if (!activeSession?.projectId || !Number.isInteger(Number(activeSession?.affixIndex))) return state;

      const stash = Array.isArray(state.sanctuary?.stash) ? state.sanctuary.stash : [];
      const projectIndex = stash.findIndex(project => project?.id === activeSession.projectId);
      if (projectIndex < 0) return state;

      const requestedReplacement = action.replacementAffix || action.payload?.replacementAffix;
      const replacement = (activeSession.options || []).find(option =>
        option?.id === requestedReplacement?.id &&
        option?.stat === requestedReplacement?.stat &&
        option?.tier === requestedReplacement?.tier &&
        (option?.rolledValue ?? option?.value ?? null) === (requestedReplacement?.rolledValue ?? requestedReplacement?.value ?? null)
      );
      if (!replacement) return state;

      const project = normalizeProjectRecord(stash[projectIndex]);
      const nextProject = deepForgeApplyReforge(project, activeSession.affixIndex, replacement);
      if (!nextProject) return state;

      const nextStash = [...stash];
      nextStash[projectIndex] = normalizeProjectRecord(nextProject);

      return withAchievementProgress({
        ...state,
        stats: {
          ...state.stats,
          reforgesCrafted: (state.stats?.reforgesCrafted || 0) + 1,
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: nextStash,
          deepForgeSession: null,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            reforgesCrafted: (state.combat.analytics?.reforgesCrafted || 0) + 1,
          },
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Reforge profunda aplicada sobre ${project.name}.`,
          ].slice(-20),
        },
      });
    }

    case "CANCEL_DEEP_FORGE_SESSION": {
      if (!state.sanctuary?.deepForgeSession) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          deepForgeSession: null,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "SANTUARIO: Reforge profunda cerrada; la linea actual se mantiene.",
          ].slice(-20),
        },
      };
    }

    default:
      return null;
  }
}
