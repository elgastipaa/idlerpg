export function handleRunFlowAction(state, action, dependencies) {
  const {
    buildExtractionPreview,
    consumeBlueprintMaterialization,
    consumeSigilInfusions,
    createEmptyExpeditionState,
    createEmptySanctuaryState,
    createRunContext,
    ensureValidActiveBlueprints,
    formatRunSigilLoadout,
    getAccountTelemetry,
    getCombinedRunSigilBonuses,
    getEmptyPerformanceSnapshot,
    getEmptyRunStats,
    getRunSigil,
    isExtractionUnlocked,
    isRunSigilsUnlocked,
    materializeBlueprintLoadout,
    normalizeRunSigilIds,
    recordCodexSighting,
    refreshStats,
    resolveRunSigilLoadout,
    selectRunSigilLoadout,
    spawnEnemy,
    summarizeRunSigilLoadout,
    syncCodexBonuses,
    syncPrestigeBonuses,
    appendSeenFamilyIds,
    ONBOARDING_STEPS,
  } = dependencies;

  switch (action?.type) {
    case "ENTER_EXPEDITION_SETUP": {
      if (!state.player?.class) {
        return {
          ...state,
          expedition: {
            ...(state.expedition || createEmptyExpeditionState()),
            phase: "setup",
          },
          currentTab: "sanctuary",
        };
      }

      const shouldUseRunSetup = isRunSigilsUnlocked(state);
      if (state.combat?.pendingRunSetup) {
        return {
          ...state,
          expedition: {
            ...(state.expedition || createEmptyExpeditionState()),
            phase: "setup",
          },
          combat: {
            ...state.combat,
            pendingRunSetup: true,
          },
          currentTab: "combat",
        };
      }

      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "setup",
        },
        combat: {
          ...state.combat,
          pendingRunSetup: shouldUseRunSetup,
        },
        currentTab: "combat",
      };
    }

    case "SELECT_RUN_SIGIL": {
      if (!state.combat?.pendingRunSetup || !isRunSigilsUnlocked(state)) return state;
      const nextRunSigilIds = selectRunSigilLoadout(state, action.sigilId || "free", action.slotIndex || 0);
      return {
        ...state,
        combat: {
          ...state.combat,
          pendingRunSigilId: nextRunSigilIds[0] || "free",
          pendingRunSigilIds: nextRunSigilIds,
        },
      };
    }

    case "START_RUN": {
      if (!state.combat?.pendingRunSetup) return state;
      if (!state.player?.class) return state;
      const startedAt = Number(action.now || Date.now());
      const runSigilIds = resolveRunSigilLoadout(
        state,
        state.combat?.pendingRunSigilIds || state.combat?.pendingRunSigilId || "free"
      );
      const consumedInfusions = consumeSigilInfusions(state.sanctuary || createEmptySanctuaryState(), runSigilIds);
      const activeBlueprints = ensureValidActiveBlueprints(
        consumedInfusions.sanctuary?.blueprints || [],
        consumedInfusions.sanctuary?.activeBlueprints || {}
      );
      const materializedLoadout = materializeBlueprintLoadout(
        consumedInfusions.sanctuary?.blueprints || [],
        activeBlueprints,
        { now: startedAt }
      );
      const nextBlueprints = consumeBlueprintMaterialization(
        consumedInfusions.sanctuary?.blueprints || [],
        activeBlueprints,
        { now: startedAt }
      );
      const nextRunContext = state.combat?.runContext || createRunContext();
      const nextEnemy = spawnEnemy(state.combat?.currentTier || 1, nextRunContext);
      const nextCodex = recordCodexSighting(state.codex || {}, nextEnemy);
      const nextPlayer = refreshStats(
        syncCodexBonuses(
          syncPrestigeBonuses(
            {
              ...state.player,
              inventory: [],
              equipment: {
                weapon: materializedLoadout.weapon || null,
                armor: materializedLoadout.armor || null,
              },
              runSigilBonuses: getCombinedRunSigilBonuses(runSigilIds, {
                activeInfusionPlayerBonuses: consumedInfusions.activeInfusionPlayerBonuses,
              }),
            },
            state.prestige
          ),
          nextCodex
        )
      );

      return {
        ...state,
        currentTab: "combat",
        codex: nextCodex,
        sanctuary: {
          ...consumedInfusions.sanctuary,
          blueprints: nextBlueprints,
          activeBlueprints,
        },
        player: {
          ...nextPlayer,
          hp: nextPlayer.maxHp,
        },
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "active",
          id: `expedition_${startedAt}`,
          startedAt,
          exitReason: null,
          seenFamilyIds: appendSeenFamilyIds(createEmptyExpeditionState(), nextEnemy),
          cargoFound: [],
          projectCandidates: [],
          selectedCargoIds: [],
          selectedProjectItemId: null,
          extractionPreview: null,
          activeInfusionIds: consumedInfusions.appliedSigilIds,
          activeInfusionPlayerBonuses: consumedInfusions.activeInfusionPlayerBonuses,
          activeExtractionBonuses: consumedInfusions.activeExtractionBonuses,
        },
        combat: {
          ...state.combat,
          pendingRunSetup: false,
          activeRunSigilId: runSigilIds[0] || "free",
          activeRunSigilIds: runSigilIds,
          runContext: nextRunContext,
          enemy: nextEnemy,
          currentTier: 1,
          maxTier: 1,
          autoAdvance: false,
          ticksInCurrentRun: 0,
          sessionKills: 0,
          effects: [],
          talentBuffs: [],
          triggerCounters: {
            kills: 0,
            onHit: 0,
            crit: 0,
            onDamageTaken: 0,
          },
          pendingOnKillDamage: 0,
          pendingMageVolatileMult: 1,
          floatEvents: [],
          runStats: getEmptyRunStats(),
          performanceSnapshot: getEmptyPerformanceSnapshot(),
          latestLootEvent: null,
          inventoryOverflowEvent: null,
          inventoryOverflowStats: { total: 0, displaced: 0, lost: 0, lastAt: null },
          pendingOpenLootFilter: false,
          lastRunSummary: null,
          offlineSummary: null,
          reforgeSession: null,
          log: [
            ...(state.combat.log || []),
            `SIGILOS: ${formatRunSigilLoadout(runSigilIds)}. ${summarizeRunSigilLoadout(runSigilIds)}`,
            ...(consumedInfusions.appliedSigilIds.length > 0
              ? [`INFUSION: ${consumedInfusions.appliedSigilIds.map(sigilId => getRunSigil(sigilId).name).join(" + ")} activada para esta expedicion.`]
              : []),
            ...((materializedLoadout.weapon || materializedLoadout.armor)
              ? [`BLUEPRINTS: ${[
                  materializedLoadout.weapon ? materializedLoadout.weapon.name : null,
                  materializedLoadout.armor ? materializedLoadout.armor.name : null,
                ].filter(Boolean).join(" / ")} materializados para esta expedicion.`]
              : []),
          ].slice(-20),
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          expeditionCount: Math.max(0, Number(state?.accountTelemetry?.expeditionCount || 0)) + 1,
          currentExpeditionSeconds: 0,
          lastActiveAt: startedAt,
        },
      };
    }

    case "OPEN_EXTRACTION": {
      const exitReason = action.exitReason === "death" ? "death" : "retire";
      if (state.expedition?.phase === "extraction") return state;
      if (!state.player?.class) return state;
      if (exitReason !== "death" && !isExtractionUnlocked(state)) return state;

      const extractionPreview = buildExtractionPreview(state, { exitReason });
      const onboardingExtractionTutorial = state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_READY;
      const defaultCargoIds = onboardingExtractionTutorial
        ? []
        : (extractionPreview.cargoOptions || [])
            .slice(0, Math.max(0, Number(extractionPreview.availableSlots?.cargo || 0)))
            .map(option => option.id);
      const defaultProjectItemId = onboardingExtractionTutorial
        ? null
        : Number(extractionPreview.availableSlots?.project || 0) > 0
          ? extractionPreview.projectOptions?.[0]?.itemId || null
          : null;

      return {
        ...state,
        currentTab: "sanctuary",
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "extraction",
          exitReason,
          extractionPreview,
          selectedCargoIds: defaultCargoIds,
          selectedProjectItemId: defaultProjectItemId,
        },
      };
    }

    case "CANCEL_EXTRACTION": {
      if (state.expedition?.phase !== "extraction") return state;
      if (state.expedition?.exitReason === "death") return state;
      return {
        ...state,
        currentTab: "combat",
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "active",
          exitReason: null,
          selectedCargoIds: [],
          selectedProjectItemId: null,
          extractionPreview: null,
        },
      };
    }

    case "SELECT_EXTRACTION_CARGO": {
      if (state.expedition?.phase !== "extraction") return state;
      const cargoId = action.cargoId;
      if (!cargoId) return state;
      const tutorialCargoId =
        state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO
          ? state.expedition?.extractionPreview?.cargoOptions?.[0]?.id || null
          : null;
      if (tutorialCargoId && cargoId !== tutorialCargoId) return state;
      const selected = new Set(state.expedition?.selectedCargoIds || []);
      if (selected.has(cargoId)) {
        selected.delete(cargoId);
      } else {
        const limit = Math.max(0, Number(state.expedition?.extractionPreview?.availableSlots?.cargo || 0));
        if (selected.size >= limit) return state;
        selected.add(cargoId);
      }
      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          selectedCargoIds: Array.from(selected),
        },
      };
    }

    case "SELECT_EXTRACTION_PROJECT": {
      if (state.expedition?.phase !== "extraction") return state;
      if (Number(state.expedition?.extractionPreview?.availableSlots?.project || 0) <= 0) return state;
      const tutorialProjectId =
        state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM
          ? state.expedition?.extractionPreview?.projectOptions?.[0]?.itemId || null
          : null;
      if (tutorialProjectId && action.itemId !== tutorialProjectId) return state;
      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          selectedProjectItemId: action.itemId || null,
        },
      };
    }

    case "REVEAL_EXTRACTION_PROJECT_INTEL": {
      if (state.expedition?.phase !== "extraction") return state;
      const extractionPreview = state.expedition?.extractionPreview || null;
      if (!extractionPreview) return state;
      const lensUses = Math.max(0, Number(extractionPreview.projectIntelLensUses || 0));
      if (lensUses <= 0) return state;

      const targetProjectId = action.itemId || state.expedition?.selectedProjectItemId || null;
      if (!targetProjectId) return state;

      let consumedUse = false;
      const nextProjectOptions = (extractionPreview.projectOptions || []).map(option => {
        if (option?.itemId !== targetProjectId) return option;
        const intelLines = Array.isArray(option?.intelLines) ? option.intelLines : [];
        const revealedCount = Math.max(0, Number(option?.intelRevealedCount || 0));
        if (intelLines.length <= revealedCount) return option;
        consumedUse = true;
        return {
          ...option,
          intelRevealedCount: revealedCount + 1,
        };
      });
      if (!consumedUse) return state;

      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          extractionPreview: {
            ...extractionPreview,
            projectOptions: nextProjectOptions,
            projectIntelLensUses: lensUses - 1,
          },
        },
      };
    }

    default:
      return null;
  }
}
