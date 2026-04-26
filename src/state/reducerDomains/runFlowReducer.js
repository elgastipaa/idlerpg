export function handleRunFlowAction(state, action, dependencies) {
  const {
    buildRelicContextRunBonuses,
    buildExtractionPreview,
    calculateRelicAttunementCost,
    calculateRelicAttunementEntropyGain,
    calculateRelicEntropyStabilizePlan,
    consumeBlueprintMaterialization,
    consumeSigilInfusions,
    createEmptySessionAnalytics,
    createEmptyExpeditionState,
    createEmptySanctuaryState,
    createRunContext,
    createWeeklyBossEncounter,
    ensureExpeditionContracts,
    ensureValidActiveBlueprints,
    ensureValidActiveRelics,
    formatRunSigilLoadout,
    getAccountTelemetry,
    getCombinedRunSigilBonuses,
    getEmptyPerformanceSnapshot,
    getEmptyRunStats,
    getRelicContextLabel,
    getRunSigil,
    isExtractionUnlocked,
    isRunSigilsUnlocked,
    materializeBlueprintLoadout,
    materializeRelicLoadout,
    normalizeRelicContextAttunement,
    normalizeRelicRecord,
    normalizeRunSigilIds,
    recordCodexSighting,
    refreshStats,
    resolveRunSigilLoadout,
    rerollExpeditionContracts,
    selectRunSigilLoadout,
    spawnEnemy,
    summarizeRunSigilLoadout,
    syncCodexBonuses,
    syncPrestigeBonuses,
    appendSeenFamilyIds,
    ONBOARDING_STEPS,
  } = dependencies;

  function resolveContractsForSetupFlow(nowAt) {
    const currentBoard = state?.expeditionContracts || {};
    const currentContracts = Array.isArray(currentBoard?.contracts) ? currentBoard.contracts : [];
    if (currentContracts.length > 0) return currentBoard;
    return ensureExpeditionContracts(
      state,
      currentBoard,
      nowAt
    );
  }

  switch (action?.type) {
    case "ENTER_EXPEDITION_SETUP": {
      const nowAt = Number(action.now || Date.now());
      const ensuredContracts = ensureExpeditionContracts(
        state,
        state?.expeditionContracts || {},
        nowAt
      );
      const shouldUseRunSetup = isRunSigilsUnlocked(state);
      const shouldUseUnifiedPreRunOverlay =
        Boolean(state?.onboarding?.completed) || Number(state?.prestige?.level || 0) >= 1;
      const pendingRunSigilIds = shouldUseRunSetup
        ? (Array.isArray(state.combat?.pendingRunSigilIds)
          ? [...state.combat.pendingRunSigilIds]
          : normalizeRunSigilIds(state.combat?.pendingRunSigilId || "free"))
        : normalizeRunSigilIds("free");
      if (shouldUseUnifiedPreRunOverlay && state.player?.class) {
        const resetPlayerClass = refreshStats({
          ...state.player,
          class: null,
          specialization: null,
          baseDamage: 10,
          baseDefense: 2,
          baseCritChance: 0.05,
          baseMaxHp: 100,
        });
        return {
          ...state,
          player: {
            ...resetPlayerClass,
            hp: resetPlayerClass.maxHp,
          },
          expeditionContracts: ensuredContracts,
          expedition: {
            ...(state.expedition || createEmptyExpeditionState()),
            phase: "setup",
          },
          combat: {
            ...state.combat,
            pendingRunSetup: true,
            pendingRunSigilId: pendingRunSigilIds[0] || "free",
            pendingRunSigilIds,
          },
          currentTab: "combat",
        };
      }
      if (!state.player?.class) {
        return {
          ...state,
          expeditionContracts: ensuredContracts,
          expedition: {
            ...(state.expedition || createEmptyExpeditionState()),
            phase: "setup",
          },
          combat: {
            ...state.combat,
            pendingRunSetup: shouldUseUnifiedPreRunOverlay,
            pendingRunSigilId: pendingRunSigilIds[0] || "free",
            pendingRunSigilIds,
          },
          currentTab: shouldUseUnifiedPreRunOverlay ? "combat" : "sanctuary",
        };
      }

      if (state.combat?.pendingRunSetup) {
        return {
          ...state,
          expeditionContracts: ensuredContracts,
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
        expeditionContracts: ensuredContracts,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "setup",
        },
        combat: {
          ...state.combat,
          pendingRunSetup: true,
          pendingRunSigilId: shouldUseRunSetup
            ? state.combat?.pendingRunSigilId || "free"
            : "free",
          pendingRunSigilIds: shouldUseRunSetup
            ? (Array.isArray(state.combat?.pendingRunSigilIds)
              ? [...state.combat.pendingRunSigilIds]
              : normalizeRunSigilIds(state.combat?.pendingRunSigilId || "free"))
            : normalizeRunSigilIds("free"),
        },
        currentTab: "combat",
      };
    }

    case "SELECT_EXPEDITION_CONTRACT": {
      const canManageContracts =
        Boolean(state?.combat?.pendingRunSetup) || state?.expedition?.phase === "setup";
      if (!canManageContracts) return state;
      const nowAt = Number(action.now || Date.now());
      const ensuredContracts = resolveContractsForSetupFlow(nowAt);
      const contractId = action.contractId || null;
      if (!contractId) return state;
      const selectedContract = ensuredContracts.contracts.find(contract => contract?.id === contractId) || null;
      if (!selectedContract || selectedContract?.claimed) return state;
      if (ensuredContracts.activeContractId === contractId) return {
        ...state,
        expeditionContracts: ensuredContracts,
      };
      return {
        ...state,
        expeditionContracts: {
          ...ensuredContracts,
          activeContractId: contractId,
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          expeditionContractSelections: Math.max(0, Number(state?.accountTelemetry?.expeditionContractSelections || 0)) + 1,
          lastActiveAt: nowAt,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat?.analytics || createEmptySessionAnalytics()),
            expeditionContractsSelected: Math.max(0, Number(state?.combat?.analytics?.expeditionContractsSelected || 0)) + 1,
          },
          log: [
            ...(state.combat?.log || []),
            "EXPEDICION: Contrato activo seleccionado para la proxima salida.",
          ].slice(-20),
        },
      };
    }

    case "REROLL_EXPEDITION_CONTRACTS": {
      const canManageContracts =
        Boolean(state?.combat?.pendingRunSetup) || state?.expedition?.phase === "setup";
      if (!canManageContracts) return state;
      const nowAt = Number(action.now || Date.now());
      const ensuredContracts = resolveContractsForSetupFlow(nowAt);
      const rerollResult = rerollExpeditionContracts(state, ensuredContracts, nowAt);
      if (!rerollResult) {
        return {
          ...state,
          expeditionContracts: ensuredContracts,
          combat: {
            ...state.combat,
            log: [
              ...(state.combat?.log || []),
              "EXPEDICION: No hay recursos para rerollear contratos (requiere polvo/flux).",
            ].slice(-20),
          },
        };
      }

      const rerollCost = rerollResult.cost || {};
      return {
        ...state,
        expeditionContracts: rerollResult.board,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - Math.max(0, Number(rerollCost.relicDust || 0))),
            sigilFlux: Math.max(0, Number(state.sanctuary?.resources?.sigilFlux || 0) - Math.max(0, Number(rerollCost.sigilFlux || 0))),
          },
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          expeditionContractRerolls: Math.max(0, Number(state?.accountTelemetry?.expeditionContractRerolls || 0)) + 1,
          lastActiveAt: nowAt,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat?.analytics || createEmptySessionAnalytics()),
            expeditionContractsRerolled: Math.max(0, Number(state?.combat?.analytics?.expeditionContractsRerolled || 0)) + 1,
          },
          log: [
            ...(state.combat?.log || []),
            `EXPEDICION: Tablon de contratos rerolleado (-${Math.max(0, Number(rerollCost.relicDust || 0))} polvo, -${Math.max(0, Number(rerollCost.sigilFlux || 0))} flux).`,
          ].slice(-20),
        },
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
      const ensuredContracts = resolveContractsForSetupFlow(startedAt);
      const selectableContracts = Array.isArray(ensuredContracts.contracts)
        ? ensuredContracts.contracts.filter(contract => !contract?.claimed)
        : [];
      const hasSelectableContract = selectableContracts.length > 0;
      const activeContractId = hasSelectableContract
        ? (ensuredContracts.activeContractId && selectableContracts.some(contract => contract?.id === ensuredContracts.activeContractId)
          ? ensuredContracts.activeContractId
          : selectableContracts[0]?.id || null)
        : null;
      const runSigilIds = isRunSigilsUnlocked(state)
        ? resolveRunSigilLoadout(
          state,
          state.combat?.pendingRunSigilIds || state.combat?.pendingRunSigilId || "free"
        )
        : resolveRunSigilLoadout(state, "free");
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
      const normalizedRelicArmory = Array.isArray(consumedInfusions.sanctuary?.relicArmory)
        ? consumedInfusions.sanctuary.relicArmory.map(relic => normalizeRelicRecord(relic)).filter(Boolean)
        : [];
      const activeRelics = ensureValidActiveRelics(
        normalizedRelicArmory,
        consumedInfusions.sanctuary?.activeRelics || {}
      );
      const materializedRelicLoadout = materializeRelicLoadout(
        normalizedRelicArmory,
        activeRelics,
        { now: startedAt }
      );
      const relicContextRun = buildRelicContextRunBonuses({
        relicArmory: normalizedRelicArmory,
        activeRelics,
        runSigilIds,
        abyss: state.abyss || {},
      });
      const runLoadout = {
        weapon: materializedRelicLoadout.weapon || materializedLoadout.weapon || null,
        armor: materializedRelicLoadout.armor || materializedLoadout.armor || null,
      };
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
                weapon: runLoadout.weapon,
                armor: runLoadout.armor,
              },
              runSigilBonuses: getCombinedRunSigilBonuses(runSigilIds, {
                activeInfusionPlayerBonuses: consumedInfusions.activeInfusionPlayerBonuses,
                activeRelicContextBonuses: relicContextRun.playerBonuses,
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
        expeditionContracts: {
          ...ensuredContracts,
          activeContractId,
        },
        codex: nextCodex,
        sanctuary: {
          ...consumedInfusions.sanctuary,
          relicArmory: normalizedRelicArmory,
          activeRelics,
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
          selectedProjectDecision: "keep",
          extractionPreview: null,
          activeInfusionIds: consumedInfusions.appliedSigilIds,
          activeInfusionPlayerBonuses: consumedInfusions.activeInfusionPlayerBonuses,
          activeExtractionBonuses: consumedInfusions.activeExtractionBonuses,
          activeRelicContext: relicContextRun.runContext,
          activeRelicContextBonuses: relicContextRun.playerBonuses,
          activeRelicContextMatches: relicContextRun.matchedRelics,
          activeRelicContextMismatches: relicContextRun.mismatchedRelics,
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
          weeklyBossEncounter: null,
          log: [
            ...(state.combat.log || []),
            ...(activeContractId
              ? ["CONTRATO: Objetivo de expedicion fijado para esta salida."]
              : []),
            `SIGILOS: ${formatRunSigilLoadout(runSigilIds)}. ${summarizeRunSigilLoadout(runSigilIds)}`,
            ...(consumedInfusions.appliedSigilIds.length > 0
              ? [`INFUSION: ${consumedInfusions.appliedSigilIds.map(sigilId => getRunSigil(sigilId).name).join(" + ")} activada para esta expedicion.`]
              : []),
            ...((relicContextRun.matchedRelics.length > 0 || relicContextRun.mismatchedRelics.length > 0)
              ? [
                  `SINTONIA: Contexto ${relicContextRun.runContextLabel}. ${relicContextRun.matchedRelics.length > 0
                    ? `${relicContextRun.matchedRelics.map(entry => entry.relicName).join(" / ")} en bonus.`
                    : "Sin reliquias alineadas."} ${relicContextRun.mismatchedRelics.length > 0
                    ? `${relicContextRun.mismatchedRelics.map(entry => entry.relicName).join(" / ")} en defecto.`
                    : ""}`.trim(),
                ]
              : []),
            ...((materializedRelicLoadout.weapon || materializedRelicLoadout.armor)
              ? [`RELIQUIAS: ${[
                  materializedRelicLoadout.weapon ? materializedRelicLoadout.weapon.name : null,
                  materializedRelicLoadout.armor ? materializedRelicLoadout.armor.name : null,
                ].filter(Boolean).join(" / ")} equipadas desde el Arsenal.`]
              : []),
            ...((materializedLoadout.weapon || materializedLoadout.armor)
              ? [`BLUEPRINTS: ${[
                  materializedLoadout.weapon ? materializedLoadout.weapon.name : null,
                  materializedLoadout.armor ? materializedLoadout.armor.name : null,
                ].filter(Boolean).join(" / ")} materializados para esta expedicion${materializedRelicLoadout.weapon || materializedRelicLoadout.armor ? " (fallback de slot sin reliquia activa)." : "."}`]
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

    case "START_WEEKLY_BOSS_ENCOUNTER": {
      if (state?.expedition?.phase !== "active") return state;
      if (state?.combat?.pendingRunSetup) return state;
      if (state?.combat?.weeklyBossEncounter?.active) return state;
      const nowAt = Number(action.now || Date.now());
      const start = createWeeklyBossEncounter(
        state,
        state?.weeklyBoss || {},
        action?.difficultyId || "normal",
        nowAt
      );
      if (!start?.ok) {
        return {
          ...state,
          combat: {
            ...state.combat,
            log: [
              ...(state.combat?.log || []),
              `BOSS SEMANAL: ${start?.reason || "No se pudo iniciar el encuentro."}`,
            ].slice(-20),
          },
        };
      }

      const currentAnalytics = state?.combat?.analytics || createEmptySessionAnalytics();
      const currentDifficultyStarts = currentAnalytics?.weeklyBossDifficultyStarts || {};
      const currentTelemetry = getAccountTelemetry(state);
      const currentTelemetryDifficultyStarts = currentTelemetry?.weeklyBossDifficultyStarts || {};
      const snapshot = {
        enemy: state.combat?.enemy
          ? {
              ...state.combat.enemy,
              runtime: state.combat.enemy?.runtime ? { ...state.combat.enemy.runtime } : {},
            }
          : null,
        currentTier: Math.max(1, Number(state.combat?.currentTier || 1)),
        maxTier: Math.max(1, Number(state.combat?.maxTier || 1)),
        autoAdvance: Boolean(state.combat?.autoAdvance),
        ticksInCurrentRun: Math.max(0, Number(state.combat?.ticksInCurrentRun || 0)),
        sessionKills: Math.max(0, Number(state.combat?.sessionKills || 0)),
        effects: Array.isArray(state.combat?.effects)
          ? state.combat.effects.map(effect => ({ ...effect }))
          : [],
        talentBuffs: Array.isArray(state.combat?.talentBuffs)
          ? state.combat.talentBuffs.map(effect => ({ ...effect }))
          : [],
        triggerCounters: {
          kills: Math.max(0, Number(state.combat?.triggerCounters?.kills || 0)),
          onHit: Math.max(0, Number(state.combat?.triggerCounters?.onHit || 0)),
          crit: Math.max(0, Number(state.combat?.triggerCounters?.crit || 0)),
          onDamageTaken: Math.max(0, Number(state.combat?.triggerCounters?.onDamageTaken || 0)),
        },
        pendingOnKillDamage: Math.max(0, Number(state.combat?.pendingOnKillDamage || 0)),
        pendingMageVolatileMult: Math.max(0.2, Number(state.combat?.pendingMageVolatileMult || 1)),
        runStats: {
          ...(state.combat?.runStats || getEmptyRunStats()),
        },
        performanceSnapshot: {
          ...(state.combat?.performanceSnapshot || getEmptyPerformanceSnapshot()),
        },
        latestLootEvent: state.combat?.latestLootEvent || null,
        inventoryOverflowEvent: state.combat?.inventoryOverflowEvent || null,
        inventoryOverflowStats: {
          total: Math.max(0, Number(state.combat?.inventoryOverflowStats?.total || 0)),
          displaced: Math.max(0, Number(state.combat?.inventoryOverflowStats?.displaced || 0)),
          lost: Math.max(0, Number(state.combat?.inventoryOverflowStats?.lost || 0)),
          lastAt: state.combat?.inventoryOverflowStats?.lastAt || null,
        },
        pendingOpenLootFilter: Boolean(state.combat?.pendingOpenLootFilter),
        playerHp: Math.max(1, Number(state.player?.hp || state.player?.maxHp || 1)),
        playerGold: Math.max(0, Number(state.player?.gold || 0)),
        playerEssence: Math.max(0, Number(state.player?.essence || 0)),
      };
      const nextEncounter = {
        ...start.encounter,
        snapshot,
      };

      return {
        ...state,
        currentTab: "combat",
        weeklyBoss: start.weeklyBoss,
        accountTelemetry: {
          ...currentTelemetry,
          weeklyBossEncountersStarted: Math.max(0, Number(currentTelemetry?.weeklyBossEncountersStarted || 0)) + 1,
          weeklyBossDifficultyStarts: {
            ...currentTelemetryDifficultyStarts,
            [start.difficulty.id]: Math.max(0, Number(currentTelemetryDifficultyStarts?.[start.difficulty.id] || 0)) + 1,
          },
          lastActiveAt: nowAt,
        },
        combat: {
          ...state.combat,
          enemy: start.enemy,
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
          weeklyBossEncounter: nextEncounter,
          analytics: {
            ...currentAnalytics,
            weeklyBossEncountersStarted: Math.max(0, Number(currentAnalytics?.weeklyBossEncountersStarted || 0)) + 1,
            weeklyBossDifficultyStarts: {
              ...currentDifficultyStarts,
              [start.difficulty.id]: Math.max(0, Number(currentDifficultyStarts?.[start.difficulty.id] || 0)) + 1,
            },
          },
          log: [
            ...(state.combat?.log || []),
            `BOSS SEMANAL: Inicia ${start.boss?.name || "Boss"} (${start.difficulty?.label || "Normal"}) · ${start.difficulty?.mutation || "sin mutacion"}`
          ].slice(-20),
        },
      };
    }

    case "OPEN_EXTRACTION": {
      const exitReason = "retire";
      if (state.expedition?.phase === "extraction") return state;
      if (!state.player?.class) return state;
      if (!isExtractionUnlocked(state)) return state;
      if (state?.combat?.weeklyBossEncounter?.active) {
        return {
          ...state,
          combat: {
            ...state.combat,
            log: [
              ...(state.combat?.log || []),
              "BOSS SEMANAL: No puedes extraer durante el encuentro semanal.",
            ].slice(-20),
          },
        };
      }

      const extractionPreview = buildExtractionPreview(state, { exitReason });
      const onboardingExtractionTutorial = state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_READY;
      const defaultCargoIds = onboardingExtractionTutorial
        ? []
        : (extractionPreview.cargoOptions || [])
            .slice(0, Math.max(0, Number(extractionPreview.availableSlots?.cargo || 0)))
            .map(option => option.id);
      const defaultProjectItemId = onboardingExtractionTutorial
        ? null
        : extractionPreview.projectOptions?.[0]?.itemId || null;
      const hasRelicSlot = Number(extractionPreview.availableSlots?.relic || extractionPreview.availableSlots?.project || 0) > 0;
      const defaultProjectDecision =
        defaultProjectItemId
          ? hasRelicSlot
            ? "keep"
            : "discard"
          : "keep";

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
          selectedProjectDecision: defaultProjectDecision,
        },
      };
    }

    case "CANCEL_EXTRACTION": {
      if (state.expedition?.phase !== "extraction") return state;
      return {
        ...state,
        currentTab: "combat",
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          phase: "active",
          exitReason: null,
          selectedCargoIds: [],
          selectedProjectItemId: null,
          selectedProjectDecision: "keep",
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
      const requestedItemId = action.itemId || null;
      const hasProjectOption = (state.expedition?.extractionPreview?.projectOptions || []).some(
        option => option?.itemId === requestedItemId
      );
      if (requestedItemId && !hasProjectOption) return state;
      const tutorialProjectId =
        state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM
          ? state.expedition?.extractionPreview?.projectOptions?.[0]?.itemId || null
          : null;
      if (tutorialProjectId && requestedItemId !== tutorialProjectId) return state;
      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          selectedProjectItemId: requestedItemId,
        },
      };
    }

    case "SET_EXTRACTION_PROJECT_DECISION": {
      if (state.expedition?.phase !== "extraction") return state;
      const requestedDecision = action?.decision === "discard" ? "discard" : "keep";
      const hasRelicSlot = Number(state.expedition?.extractionPreview?.availableSlots?.relic || state.expedition?.extractionPreview?.availableSlots?.project || 0) > 0;
      if (requestedDecision === "keep" && !hasRelicSlot) return state;
      const hasProjectOption = Array.isArray(state.expedition?.extractionPreview?.projectOptions)
        && state.expedition.extractionPreview.projectOptions.length > 0;
      const fallbackProjectId = hasProjectOption ? state.expedition.extractionPreview.projectOptions[0]?.itemId || null : null;
      return {
        ...state,
        expedition: {
          ...(state.expedition || createEmptyExpeditionState()),
          selectedProjectDecision: requestedDecision,
          selectedProjectItemId: state.expedition?.selectedProjectItemId || fallbackProjectId || null,
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

    case "SET_ACTIVE_RELIC": {
      const slot = action?.slot === "armor" ? "armor" : "weapon";
      const relicId = action?.relicId || null;
      const relicArmory = Array.isArray(state.sanctuary?.relicArmory)
        ? state.sanctuary.relicArmory.map(relic => normalizeRelicRecord(relic)).filter(Boolean)
        : [];
      if (relicId && !relicArmory.some(relic => relic.id === relicId && relic.slot === slot)) return state;
      const nextActiveRelics = ensureValidActiveRelics(
        relicArmory,
        {
          ...(state.sanctuary?.activeRelics || {}),
          [slot]: relicId,
        }
      );
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          relicArmory,
          activeRelics: nextActiveRelics,
        },
      };
    }

    case "SET_RELIC_ATTUNEMENT": {
      if (state.expedition?.phase === "active") return state;
      const relicId = action?.relicId || null;
      if (!relicId) return state;
      const targetContextAttunement = normalizeRelicContextAttunement(action?.contextAttunement || "none");
      const now = Number(action?.now || Date.now());
      const relicArmory = Array.isArray(state.sanctuary?.relicArmory)
        ? state.sanctuary.relicArmory.map(relic => normalizeRelicRecord(relic)).filter(Boolean)
        : [];
      const relicIndex = relicArmory.findIndex(relic => relic.id === relicId);
      if (relicIndex < 0) return state;
      const currentRelic = relicArmory[relicIndex];
      const currentContextAttunement = normalizeRelicContextAttunement(currentRelic?.contextAttunement);
      if (currentContextAttunement === targetContextAttunement) return state;

      const fluxCost = calculateRelicAttunementCost(currentRelic, targetContextAttunement);
      const entropyGain = calculateRelicAttunementEntropyGain(currentRelic, targetContextAttunement);
      const currentFlux = Math.max(0, Number(state.sanctuary?.resources?.sigilFlux || 0));
      if (currentFlux < fluxCost) {
        return {
          ...state,
          combat: {
            ...state.combat,
            log: [
              ...(state?.combat?.log || []),
              `SANTUARIO: Flux insuficiente para sintonizar ${currentRelic?.name || "reliquia"} (${fluxCost} requerido).`,
            ].slice(-20),
          },
        };
      }

      const nextRelic = normalizeRelicRecord({
        ...currentRelic,
        contextAttunement: targetContextAttunement,
        entropy: Math.min(100, Number(currentRelic?.entropy || 0) + entropyGain),
        updatedAt: now,
      });
      if (!nextRelic) return state;
      const nextRelicArmory = relicArmory.map((relic, index) => (index === relicIndex ? nextRelic : relic));
      const nextActiveRelics = ensureValidActiveRelics(
        nextRelicArmory,
        state.sanctuary?.activeRelics || {}
      );
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          relicArmory: nextRelicArmory,
          activeRelics: nextActiveRelics,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            sigilFlux: Math.max(0, currentFlux - fluxCost),
          },
        },
        combat: {
          ...state.combat,
          log: [
            ...(state?.combat?.log || []),
            `SANTUARIO: ${nextRelic.name || "Reliquia"} sintonizada a ${getRelicContextLabel(targetContextAttunement)} (-${fluxCost} flux, +${entropyGain} entropy).`,
          ].slice(-20),
        },
      };
    }

    case "STABILIZE_RELIC_ENTROPY": {
      if (state.expedition?.phase === "active") return state;
      const relicId = action?.relicId || null;
      if (!relicId) return state;
      const now = Number(action?.now || Date.now());
      const relicArmory = Array.isArray(state.sanctuary?.relicArmory)
        ? state.sanctuary.relicArmory.map(relic => normalizeRelicRecord(relic)).filter(Boolean)
        : [];
      const relicIndex = relicArmory.findIndex(relic => relic.id === relicId);
      if (relicIndex < 0) return state;
      const currentRelic = relicArmory[relicIndex];
      const stabilizePlan = calculateRelicEntropyStabilizePlan(currentRelic);
      if (stabilizePlan.entropyReduced <= 0) return state;

      const currentDust = Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0));
      const currentFlux = Math.max(0, Number(state.sanctuary?.resources?.sigilFlux || 0));
      if (currentDust < stabilizePlan.relicDustCost || currentFlux < stabilizePlan.sigilFluxCost) {
        return {
          ...state,
          combat: {
            ...state.combat,
            log: [
              ...(state?.combat?.log || []),
              `SANTUARIO: Recursos insuficientes para estabilizar ${currentRelic?.name || "reliquia"} (${stabilizePlan.relicDustCost} polvo / ${stabilizePlan.sigilFluxCost} flux).`,
            ].slice(-20),
          },
        };
      }

      const nextRelic = normalizeRelicRecord({
        ...currentRelic,
        entropy: Math.max(0, Number(currentRelic?.entropy || 0) - stabilizePlan.entropyReduced),
        updatedAt: now,
      });
      if (!nextRelic) return state;
      const nextRelicArmory = relicArmory.map((relic, index) => (index === relicIndex ? nextRelic : relic));
      const nextActiveRelics = ensureValidActiveRelics(
        nextRelicArmory,
        state.sanctuary?.activeRelics || {}
      );
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          relicArmory: nextRelicArmory,
          activeRelics: nextActiveRelics,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, currentDust - stabilizePlan.relicDustCost),
            sigilFlux: Math.max(0, currentFlux - stabilizePlan.sigilFluxCost),
          },
        },
        combat: {
          ...state.combat,
          log: [
            ...(state?.combat?.log || []),
            `SANTUARIO: ${nextRelic.name || "Reliquia"} estabilizada (-${stabilizePlan.relicDustCost} polvo, -${stabilizePlan.sigilFluxCost} flux, -${stabilizePlan.entropyReduced} entropy).`,
          ].slice(-20),
        },
      };
    }

    case "DISCARD_RELIC": {
      if (state.expedition?.phase === "active") return state;
      const relicId = action?.relicId || null;
      if (!relicId) return state;
      const relicArmory = Array.isArray(state.sanctuary?.relicArmory)
        ? state.sanctuary.relicArmory.map(relic => normalizeRelicRecord(relic)).filter(Boolean)
        : [];
      const nextRelicArmory = relicArmory.filter(relic => relic.id !== relicId);
      if (nextRelicArmory.length === relicArmory.length) return state;
      const nextActiveRelics = ensureValidActiveRelics(
        nextRelicArmory,
        state.sanctuary?.activeRelics || {}
      );
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          relicArmory: nextRelicArmory,
          activeRelics: nextActiveRelics,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state?.combat?.log || []),
            "SANTUARIO: Una reliquia fue retirada del arsenal.",
          ].slice(-20),
        },
      };
    }

    default:
      return null;
  }
}
