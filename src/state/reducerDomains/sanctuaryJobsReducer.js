export function handleSanctuaryJobsAction(state, action, dependencies) {
  const {
    ONBOARDING_STEPS,
    SANCTUARY_STATION_DEFAULTS,
    addBlueprintCharges,
    applyLaboratoryResearch,
    buildBlueprintChargeReward,
    createCodexResearchJob,
    createDeepForgeProjectJob,
    createDistillJob,
    createEmptyFamilyChargeState,
    createEmptyLaboratoryState,
    createEmptySanctuaryState,
    createLaboratoryResearchJob,
    createSanctuaryErrandJob,
    createScrapExtractedItemJob,
    createSigilInfusionJob,
    deepForgeUpgradeProject,
    ensureTutorialCargoBundle,
    ensureValidActiveBlueprints,
    getAccountTelemetry,
    getRunSigil,
    getSanctuaryProgressTier,
    normalizeAbyssState,
    normalizeBlueprintRecord,
    normalizeCodexState,
    normalizeExtractedItemRecord,
    normalizeProjectRecord,
    syncCodexBonuses,
    syncSanctuaryJobs,
    withAchievementProgress,
    createEmptySessionAnalytics,
  } = dependencies;

  switch (action?.type) {
    case "SYNC_SANCTUARY_JOBS": {
      const nextJobs = syncSanctuaryJobs(state.sanctuary?.jobs || [], action.now || Date.now());
      if (nextJobs === (state.sanctuary?.jobs || [])) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          jobs: nextJobs,
        },
      };
    }

    case "START_TUTORIAL_DISTILLERY_JOB": {
      const now = action.now || Date.now();
      const preparedState = ensureTutorialCargoBundle({
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stations: {
            ...createEmptySanctuaryState().stations,
            ...(state.sanctuary?.stations || {}),
            distillery: {
              ...createEmptySanctuaryState().stations.distillery,
              ...((state.sanctuary?.stations || {}).distillery || {}),
              unlocked: true,
              slots: Math.max(
                1,
                Number((state.sanctuary?.stations || {}).distillery?.slots || 1),
                (Array.isArray(state.sanctuary?.jobs)
                  ? state.sanctuary.jobs.filter(job => job?.station === "distillery" && job?.status === "running").length
                  : 0) + 1
              ),
            },
          },
        },
      });
      const sanctuaryForJob = preparedState.sanctuary || createEmptySanctuaryState();
      const cargoInventory = Array.isArray(sanctuaryForJob?.cargoInventory) ? sanctuaryForJob.cargoInventory : [];
      const cargo =
        cargoInventory.find(entry => entry?.id === action.cargoId) ||
        cargoInventory[0] ||
        null;
      if (!cargo?.id) return state;

      const cargoType = cargo?.type || "essence_cache";
      const quantity = Math.max(1, Number(cargo?.quantity || 1));
      const outputAmountByType = {
        essence_cache: quantity * 35,
        codex_trace: quantity * 5,
        sigil_residue: quantity * 3,
        relic_shard: quantity * 4,
      };
      const outputLabelByType = {
        essence_cache: "Esencia refinada",
        codex_trace: "Tinta de Biblioteca",
        sigil_residue: "Flux de Sigilo",
        relic_shard: "Polvo de Reliquia",
      };
      const durationByType = {
        essence_cache: 20 * 60 * 1000,
        codex_trace: 30 * 60 * 1000,
        sigil_residue: 45 * 60 * 1000,
        relic_shard: 60 * 60 * 1000,
      };
      const tutorialJob = {
        id: `job_tutorial_distill_${cargo.id}_${now}`,
        type: "distill_bundle",
        station: "distillery",
        status: "running",
        startedAt: now,
        endsAt: now + (durationByType[cargoType] || durationByType.essence_cache),
        input: {
          cargoId: cargo.id,
          cargoType,
          quantity,
        },
        output: {
          type: cargoType,
          amount: outputAmountByType[cargoType] || outputAmountByType.essence_cache,
          label: outputLabelByType[cargoType] || "Resultado refinado",
        },
      };

      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...sanctuaryForJob,
          cargoInventory: cargoInventory.filter(entry => entry?.id !== cargo.id),
          jobs: [...(sanctuaryForJob?.jobs || []), tutorialJob],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          distillJobsStarted: Math.max(0, Number(state?.accountTelemetry?.distillJobsStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Destileria inicia ${tutorialJob.output?.label || "refinado"} (${tutorialJob.input?.quantity || 0}).`,
          ].slice(-20),
        },
      };
    }

    case "START_DISTILLERY_JOB": {
      const tutorialDistilleryCorridor = [
        ONBOARDING_STEPS.DISTILLERY_READY,
        ONBOARDING_STEPS.RETURN_TO_SANCTUARY,
        ONBOARDING_STEPS.OPEN_DISTILLERY,
        ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
      ].includes(state?.onboarding?.step);
      let sanctuaryForJob = state.sanctuary || createEmptySanctuaryState();
      const now = action.now || Date.now();

      if (tutorialDistilleryCorridor) {
        const preparedState = ensureTutorialCargoBundle({
          ...state,
          sanctuary: {
            ...createEmptySanctuaryState(),
            ...(state.sanctuary || {}),
            stations: {
              ...createEmptySanctuaryState().stations,
              ...(state.sanctuary?.stations || {}),
              distillery: {
                ...createEmptySanctuaryState().stations.distillery,
                ...((state.sanctuary?.stations || {}).distillery || {}),
                unlocked: true,
                slots: Math.max(
                  1,
                  Number((state.sanctuary?.stations || {}).distillery?.slots || 1),
                  (Array.isArray(state.sanctuary?.jobs)
                    ? state.sanctuary.jobs.filter(job => job?.station === "distillery" && job?.status === "running").length
                    : 0) + 1
                ),
              },
            },
          },
        });
        sanctuaryForJob = preparedState.sanctuary || sanctuaryForJob;
      }

      const tutorialCargoId =
        action.cargoId ||
        (Array.isArray(sanctuaryForJob?.cargoInventory)
          ? sanctuaryForJob.cargoInventory[0]?.id
          : null);
      let job = createDistillJob(
        sanctuaryForJob,
        action.type === "START_TUTORIAL_DISTILLERY_JOB" ? tutorialCargoId : action.cargoId,
        now
      );
      if (!job && tutorialDistilleryCorridor) {
        const cargoInventory = Array.isArray(sanctuaryForJob?.cargoInventory) ? sanctuaryForJob.cargoInventory : [];
        const fallbackCargoId = cargoInventory
          .map(entry => entry?.id)
          .find(candidateId => createDistillJob(sanctuaryForJob, candidateId, now));
        if (fallbackCargoId) {
          job = createDistillJob(sanctuaryForJob, fallbackCargoId, now);
        }
      }
      if (!job) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...sanctuaryForJob,
          cargoInventory: (sanctuaryForJob?.cargoInventory || []).filter(entry => entry?.id !== job.input?.cargoId),
          jobs: [...(sanctuaryForJob?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          distillJobsStarted: Math.max(0, Number(state?.accountTelemetry?.distillJobsStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Destileria inicia ${job.output?.label || "refinado"} (${job.input?.quantity || 0}).`,
          ].slice(-20),
        },
      };
    }

    case "START_SANCTUARY_ERRAND": {
      const progressTier = getSanctuaryProgressTier(state);
      const job = createSanctuaryErrandJob(
        state.sanctuary || createEmptySanctuaryState(),
        action.errandId || action.payload?.errandId,
        action.durationId || action.payload?.durationId || "short",
        progressTier,
        action.now || Date.now()
      );
      if (!job) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          errandJobsStarted: Math.max(0, Number(state?.accountTelemetry?.errandJobsStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${job.input?.label || "Encargo"} parte en ${job.input?.durationLabel || "mision"}.`,
          ].slice(-20),
        },
      };
    }

    case "START_CODEX_RESEARCH": {
      const researchType = action.researchType || action.payload?.researchType || "";
      const targetId = action.targetId || action.payload?.targetId || "";
      const job = createCodexResearchJob(
        state.sanctuary || createEmptySanctuaryState(),
        state.codex || {},
        { researchType, targetId },
        action.now || Date.now()
      );
      if (!job) return state;

      const nextCodex = normalizeCodexState(state.codex || {});
      if (researchType === "family") {
        nextCodex.research.familyProgress[targetId] = 0;
      } else if (researchType === "boss") {
        nextCodex.research.bossProgress[targetId] = 0;
      } else if (researchType === "power") {
        nextCodex.research.powerProgress[targetId] = 0;
      }

      const spentInk = Math.max(0, Number(job.input?.inkCost || 0));
      const spentDust = Math.max(0, Number(job.input?.dustCost || 0));
      return {
        ...state,
        codex: nextCodex,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            codexInk: Math.max(0, Number(state.sanctuary?.resources?.codexInk || 0) - spentInk),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          codexResearchStarted: Math.max(0, Number(state?.accountTelemetry?.codexResearchStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Investigacion de Biblioteca iniciada sobre ${job.input?.label || "objetivo"} · ${job.output?.rewardLabel || "siguiente hito"}.`,
          ].slice(-20),
        },
      };
    }

    case "START_LAB_RESEARCH": {
      const researchId = action.researchId || action.payload?.researchId || "";
      const job = createLaboratoryResearchJob(state, researchId, action.now || Date.now());
      if (!job) return state;

      const spentInk = Math.max(0, Number(job.input?.costs?.codexInk || 0));
      const spentDust = Math.max(0, Number(job.input?.costs?.relicDust || 0));
      const spentEssence = Math.max(0, Number(job.input?.costs?.essence || 0));
      return {
        ...state,
        player: {
          ...state.player,
          essence: Math.max(0, Number(state.player?.essence || 0) - spentEssence),
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            codexInk: Math.max(0, Number(state.sanctuary?.resources?.codexInk || 0) - spentInk),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - spentDust),
          },
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          labResearchStarted: Math.max(0, Number(state?.accountTelemetry?.labResearchStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Laboratorio inicia ${job.input?.label || "investigacion"} para ${job.input?.targetLabel || SANCTUARY_STATION_DEFAULTS[job.input?.stationId]?.label || "infraestructura"}.`,
          ].slice(-20),
        },
      };
    }

    case "START_SCRAP_EXTRACTED_ITEM_JOB": {
      const job = createScrapExtractedItemJob(state.sanctuary || createEmptySanctuaryState(), action.extractedItemId || action.itemId, action.now || Date.now());
      if (!job) {
        const tutorialScrapUnlocked = state?.onboarding?.step === ONBOARDING_STEPS.BLUEPRINT_DECISION;
        if (!tutorialScrapUnlocked) return state;
        const extractedItems = Array.isArray(state.sanctuary?.extractedItems) ? state.sanctuary.extractedItems : [];
        const targetItem = normalizeExtractedItemRecord(
          extractedItems.find(item => item?.id === (action.extractedItemId || action.itemId))
        );
        if (!targetItem?.id) return state;
        return {
          ...state,
          sanctuary: {
            ...createEmptySanctuaryState(),
            ...(state.sanctuary || {}),
            extractedItems: extractedItems.filter(item => item?.id !== targetItem.id),
            familyCharges: addBlueprintCharges(
              state.sanctuary?.familyCharges || {},
              buildBlueprintChargeReward(targetItem, { multiplier: 1.25 })
            ),
          },
          combat: {
            ...state.combat,
            log: [
              ...(state.combat?.log || []),
              `SANTUARIO: ${targetItem.name} se desguaza al instante durante el tutorial para mostrar la salida de cargas.`,
            ].slice(-20),
          },
        };
      }
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          extractedItems: (state.sanctuary?.extractedItems || []).filter(item => item?.id !== job.input?.extractedItemId),
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${job.input?.itemName || "Item"} entra en desguace para devolver cargas de afinidad.`,
          ].slice(-20),
        },
      };
    }

    case "CANCEL_SANCTUARY_ERRAND": {
      const jobId = action.jobId || action.payload?.jobId;
      const jobs = Array.isArray(state.sanctuary?.jobs) ? state.sanctuary.jobs : [];
      const targetJob = jobs.find(job => job?.id === jobId && job?.type === "sanctuary_errand" && job?.status === "running");
      if (!targetJob) return state;
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          jobs: jobs.filter(job => job?.id !== targetJob.id),
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "SANTUARIO: El equipo ha sido retirado. El progreso de la mision se pierde.",
          ].slice(-20),
        },
      };
    }

    case "START_SIGIL_INFUSION": {
      const job = createSigilInfusionJob(state.sanctuary || createEmptySanctuaryState(), action.sigilId || "free", action.now || Date.now());
      if (!job) return state;
      const fuelCost = Math.max(0, Number(job.input?.fuelCost || 0));
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            sigilFlux: Math.max(0, Number(state.sanctuary?.resources?.sigilFlux || 0) - fuelCost),
          },
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        accountTelemetry: {
          ...getAccountTelemetry(state),
          sigilJobsStarted: Math.max(0, Number(state?.accountTelemetry?.sigilJobsStarted || 0)) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: ${getRunSigil(job.output?.sigilId || "free").name} entra en infusion.`,
          ].slice(-20),
        },
      };
    }

    case "START_DEEP_FORGE_JOB": {
      const job = createDeepForgeProjectJob(state.sanctuary || createEmptySanctuaryState(), action.projectId, action.now || Date.now());
      if (!job) return state;
      const dustCost = Math.max(0, Number(job.input?.dustCost || 0));
      return {
        ...state,
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: (state.sanctuary?.stash || []).filter(project => project?.id !== job.input?.projectId),
          deepForgeSession:
            state.sanctuary?.deepForgeSession?.projectId === job.input?.projectId
              ? null
              : state.sanctuary?.deepForgeSession || null,
          resources: {
            ...createEmptySanctuaryState().resources,
            ...(state.sanctuary?.resources || {}),
            relicDust: Math.max(0, Number(state.sanctuary?.resources?.relicDust || 0) - dustCost),
          },
          jobs: [...(state.sanctuary?.jobs || []), job],
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `SANTUARIO: Forja Profunda inicia sobre ${job.input?.project?.name || "proyecto"} (+${job.input?.project?.upgradeLevel || 0} -> +${job.output?.nextUpgradeLevel || 1}).`,
          ].slice(-20),
        },
      };
    }

    case "CLAIM_SANCTUARY_JOB": {
      const syncedJobs = syncSanctuaryJobs(
        Array.isArray(state.sanctuary?.jobs) ? state.sanctuary.jobs : [],
        action.now || Date.now()
      );
      const jobs = Array.isArray(syncedJobs) ? syncedJobs : [];
      const job = jobs.find(candidate => candidate?.id === action.jobId && candidate?.status === "claimable");
      if (!job) return state;

      const nextJobs = jobs.filter(candidate => candidate?.id !== job.id);
      let nextPlayer = state.player;
      let nextCodex = state.codex;
      let nextResources = {
        ...createEmptySanctuaryState().resources,
        ...(state.sanctuary?.resources || {}),
      };
      let nextInfusions = {
        ...(state.sanctuary?.sigilInfusions || {}),
      };
      let nextStash = Array.isArray(state.sanctuary?.stash) ? [...state.sanctuary.stash] : [];
      let nextExtractedItems = Array.isArray(state.sanctuary?.extractedItems) ? [...state.sanctuary.extractedItems] : [];
      let nextBlueprints = Array.isArray(state.sanctuary?.blueprints)
        ? state.sanctuary.blueprints.map(blueprint => normalizeBlueprintRecord(blueprint)).filter(Boolean)
        : [];
      let nextLaboratory = {
        ...createEmptyLaboratoryState(),
        ...(state.sanctuary?.laboratory || {}),
      };
      let nextStations = {
        ...createEmptySanctuaryState().stations,
        ...(state.sanctuary?.stations || {}),
      };
      let nextAbyss = normalizeAbyssState(state?.abyss || {});
      let nextFamilyCharges = {
        ...createEmptyFamilyChargeState(),
        ...(state.sanctuary?.familyCharges || {}),
      };
      let logLine = "SANTUARIO: Job reclamado.";

      if (job.type === "distill_bundle") {
        const outputType = job.output?.type;
        const amount = Math.max(0, Number(job.output?.amount || 0));
        if (outputType === "essence_cache") {
          nextPlayer = {
            ...state.player,
            essence: (state.player?.essence || 0) + amount,
          };
          logLine = `SANTUARIO: Destileria reclamada · +${amount} esencia.`;
        } else if (outputType === "codex_trace") {
          nextResources.codexInk = (nextResources.codexInk || 0) + amount;
          logLine = `SANTUARIO: Destileria reclamada · +${amount} tinta de Biblioteca.`;
        } else if (outputType === "sigil_residue") {
          nextResources.sigilFlux = (nextResources.sigilFlux || 0) + amount;
          logLine = `SANTUARIO: Destileria reclamada · +${amount} flux de Sigilo.`;
        } else if (outputType === "relic_shard") {
          nextResources.relicDust = (nextResources.relicDust || 0) + amount;
          logLine = `SANTUARIO: Destileria reclamada · +${amount} polvo de Reliquia.`;
        }
      } else if (job.type === "sanctuary_errand") {
        const rewards = job.output?.rewards || {};
        const addedInk = Math.max(0, Number(rewards.codexInk || 0));
        const addedDust = Math.max(0, Number(rewards.relicDust || 0));
        const addedFlux = Math.max(0, Number(rewards.sigilFlux || 0));
        nextResources.codexInk = (nextResources.codexInk || 0) + addedInk;
        nextResources.relicDust = (nextResources.relicDust || 0) + addedDust;
        nextResources.sigilFlux = (nextResources.sigilFlux || 0) + addedFlux;
        nextFamilyCharges = addBlueprintCharges(nextFamilyCharges, rewards.familyCharges || {});

        const rewardParts = [];
        const chargedFamilies = Object.entries(rewards.familyCharges || {})
          .map(([familyId, amount]) => [familyId, Math.max(0, Number(amount || 0))])
          .filter(([, amount]) => amount > 0);
        if (chargedFamilies.length > 0) {
          rewardParts.push(
            chargedFamilies
              .map(([familyId, amount]) => {
                const familyLabel =
                  chargedFamilies.length === 1 && familyId === job.input?.familyId && job.input?.familyLabel
                    ? job.input.familyLabel
                    : familyId;
                return `${amount} cargas de ${familyLabel}`;
              })
              .join(", ")
          );
        }
        if (addedInk > 0) rewardParts.push(`${addedInk} tinta de Biblioteca`);
        if (addedDust > 0) rewardParts.push(`${addedDust} polvo de Reliquia`);
        if (addedFlux > 0) rewardParts.push(`${addedFlux} flux de Sigilo`);

        logLine = rewardParts.length > 0
          ? `SANTUARIO: ${job.output?.label || "Encargo"} vuelve con ${rewardParts.join(" · ")}.`
          : `SANTUARIO: ${job.output?.label || "Encargo"} vuelve sin recuperacion util.`;
      } else if (job.type === "infuse_sigil") {
        const sigilId = getRunSigil(job.output?.sigilId || "free").id;
        const existing = nextInfusions[sigilId] || {};
        nextInfusions[sigilId] = {
          sigilId,
          label: getRunSigil(sigilId).name,
          charges: Math.max(0, Number(existing?.charges || 0)) + 1,
          playerBonuses: { ...(job.output?.playerBonuses || existing?.playerBonuses || {}) },
          extractionBonuses: { ...(job.output?.extractionBonuses || existing?.extractionBonuses || {}) },
          summary: job.output?.summary || existing?.summary || "",
          updatedAt: action.now || Date.now(),
        };
        logLine = `SANTUARIO: ${getRunSigil(sigilId).name} infusionado y listo para una futura expedicion.`;
      } else if (job.type === "scrap_extracted_item") {
        nextFamilyCharges = addBlueprintCharges(nextFamilyCharges, job.output?.charges || {});
        logLine = `SANTUARIO: Desguace completo · ${job.input?.itemName || "item"} convertido en cargas de afinidad.`;
      } else if (job.type === "codex_research") {
        const researchType = job.input?.researchType;
        const targetId = job.input?.targetId;
        const targetRank = Math.max(0, Number(job.input?.targetRank || 0));
        nextCodex = normalizeCodexState(state.codex || {});

        if (researchType === "family" && targetId) {
          nextCodex.research.familyRanks[targetId] = Math.max(
            Number(nextCodex?.research?.familyRanks?.[targetId] || 0),
            targetRank
          );
        } else if (researchType === "boss" && targetId) {
          nextCodex.research.bossRanks[targetId] = Math.max(
            Number(nextCodex?.research?.bossRanks?.[targetId] || 0),
            targetRank
          );
        } else if (researchType === "power" && targetId) {
          nextCodex.research.powerRanks[targetId] = Math.max(
            Number(nextCodex?.research?.powerRanks?.[targetId] || 0),
            targetRank
          );
        }

        nextPlayer = syncCodexBonuses(nextPlayer, nextCodex);
        logLine = `SANTUARIO: Investigacion completa · ${job.input?.label || "objetivo"} alcanza ${job.output?.rewardLabel || "un nuevo rango"} en la Biblioteca.`;
      } else if (job.type === "laboratory_research") {
        const nextSanctuaryAfterResearch = applyLaboratoryResearch(
          {
            ...createEmptySanctuaryState(),
            ...(state.sanctuary || {}),
            resources: nextResources,
            sigilInfusions: nextInfusions,
            jobs: nextJobs,
            extractedItems: nextExtractedItems,
            blueprints: nextBlueprints,
            familyCharges: nextFamilyCharges,
          },
          job.input?.researchId,
          action.now || Date.now()
        );
        nextResources = {
          ...createEmptySanctuaryState().resources,
          ...(nextSanctuaryAfterResearch.resources || {}),
        };
        nextInfusions = {
          ...createEmptySanctuaryState().sigilInfusions,
          ...(nextSanctuaryAfterResearch.sigilInfusions || {}),
        };
        nextExtractedItems = Array.isArray(nextSanctuaryAfterResearch.extractedItems) ? [...nextSanctuaryAfterResearch.extractedItems] : nextExtractedItems;
        nextBlueprints = Array.isArray(nextSanctuaryAfterResearch.blueprints) ? [...nextSanctuaryAfterResearch.blueprints] : nextBlueprints;
        nextFamilyCharges = {
          ...createEmptyFamilyChargeState(),
          ...(nextSanctuaryAfterResearch.familyCharges || {}),
        };
        nextLaboratory = {
          ...createEmptyLaboratoryState(),
          ...(nextSanctuaryAfterResearch.laboratory || {}),
        };
        nextStations = {
          ...createEmptySanctuaryState().stations,
          ...(nextSanctuaryAfterResearch.stations || {}),
        };
        if (job.input?.researchId === "unlock_abyss_portal") {
          nextAbyss = {
            ...nextAbyss,
            portalUnlocked: true,
            tier25BossCleared: true,
          };
        }
        logLine = `SANTUARIO: Laboratorio completa ${job.input?.label || "investigacion"} y mejora ${job.input?.targetLabel || SANCTUARY_STATION_DEFAULTS[job.input?.stationId]?.label || "el Santuario"}.`;
      } else if (job.type === "forge_project") {
        const sourceProject = job.input?.project || {};
        const nextUpgradeLevel = Math.max(0, Number(job.output?.nextUpgradeLevel || (Number(sourceProject?.upgradeLevel || 0) + 1)));
        const forgedProject = normalizeProjectRecord({
          ...deepForgeUpgradeProject(sourceProject, nextUpgradeLevel),
          forgedAt: action.now || Date.now(),
          forgeHistory: [
            ...(Array.isArray(sourceProject?.forgeHistory) ? sourceProject.forgeHistory : []),
            {
              at: action.now || Date.now(),
              upgradeLevel: nextUpgradeLevel,
              dustCost: Math.max(0, Number(job.input?.dustCost || 0)),
            },
          ],
        });
        nextStash = [...nextStash, forgedProject].sort((left, right) => Number(right?.rating || 0) - Number(left?.rating || 0));
        logLine = `SANTUARIO: Forja Profunda completa · ${forgedProject.name} sube a +${nextUpgradeLevel}.`;
      }

      const nextAccountTelemetry = {
        ...getAccountTelemetry(state),
        distillJobsCompleted:
          Math.max(0, Number(state?.accountTelemetry?.distillJobsCompleted || 0)) + (job.type === "distill_bundle" ? 1 : 0),
        codexResearchCompleted:
          Math.max(0, Number(state?.accountTelemetry?.codexResearchCompleted || 0)) + (job.type === "codex_research" ? 1 : 0),
        labResearchCompleted:
          Math.max(0, Number(state?.accountTelemetry?.labResearchCompleted || 0)) + (job.type === "laboratory_research" ? 1 : 0),
        errandJobsCompleted:
          Math.max(0, Number(state?.accountTelemetry?.errandJobsCompleted || 0)) + (job.type === "sanctuary_errand" ? 1 : 0),
        sigilJobsCompleted:
          Math.max(0, Number(state?.accountTelemetry?.sigilJobsCompleted || 0)) + (job.type === "infuse_sigil" ? 1 : 0),
        blueprintsScrapped:
          Math.max(0, Number(state?.accountTelemetry?.blueprintsScrapped || 0)) + (job.type === "scrap_extracted_item" ? 1 : 0),
      };

      return withAchievementProgress({
        ...state,
        player: nextPlayer,
        codex: nextCodex,
        abyss: nextAbyss,
        accountTelemetry: nextAccountTelemetry,
        stats: {
          ...state.stats,
          upgradesCrafted: (state.stats?.upgradesCrafted || 0) + (job.type === "forge_project" ? 1 : 0),
        },
        sanctuary: {
          ...createEmptySanctuaryState(),
          ...(state.sanctuary || {}),
          stash: nextStash,
          extractedItems: nextExtractedItems,
          blueprints: nextBlueprints,
          familyCharges: nextFamilyCharges,
          laboratory: nextLaboratory,
          stations: nextStations,
          activeBlueprints: ensureValidActiveBlueprints(nextBlueprints, state.sanctuary?.activeBlueprints || {}),
          deepForgeSession: null,
          jobs: nextJobs,
          resources: nextResources,
          sigilInfusions: nextInfusions,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            upgradesCrafted: (state.combat.analytics?.upgradesCrafted || 0) + (job.type === "forge_project" ? 1 : 0),
          },
          log: [
            ...(state.combat?.log || []),
            logLine,
          ].slice(-20),
        },
      });
    }

    default:
      return null;
  }
}
