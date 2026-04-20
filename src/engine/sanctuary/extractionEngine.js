import { calculatePrestigeEchoGain, canPrestige } from "../progression/prestigeEngine";
import { isBlueprintDecisionUnlocked } from "../onboarding/onboardingEngine";

const PROJECT_ELIGIBLE_RARITIES = new Set(["rare", "epic", "legendary"]);
const RARITY_RANK = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };

function makeCargoId(type, seed) {
  return `cargo_${type}_${seed}`;
}

function buildCargoLabel(type, quantity = 1) {
  const amount = Math.max(1, Number(quantity || 1));
  if (type === "essence_cache") return `Reserva de Esencia x${amount}`;
  if (type === "codex_trace") return `Traza de Biblioteca x${amount}`;
  if (type === "sigil_residue") return `Residuo de Sigilo x${amount}`;
  if (type === "relic_shard") return `Fragmento de Reliquia x${amount}`;
  return `Cargo x${amount}`;
}

function buildCargoDescription(type) {
  if (type === "essence_cache") return "Botin refinable para alimentar la economia persistente del Santuario.";
  if (type === "codex_trace") return "Conocimiento rescatado de enemigos, bosses y drops valiosos para la Biblioteca.";
  if (type === "sigil_residue") return "Energia residual util para preparar una futura expedicion.";
  if (type === "relic_shard") return "Fragmento raro vinculado a bosses altos y al Abismo.";
  return "Bundle de valor persistente.";
}

function buildCargoOptions(state, exitReason = "retire") {
  const runStats = state?.combat?.runStats || {};
  const highestTier = Math.max(
    Number(state?.combat?.currentTier || 1),
    Number(state?.combat?.maxTier || 1),
    Number(state?.combat?.prestigeCycle?.maxTier || 1)
  );
  const bossKills = Math.max(0, Number(runStats?.bossKills || 0));
  const activeRunSigilIds = Array.isArray(state?.combat?.activeRunSigilIds)
    ? state.combat.activeRunSigilIds
    : [state?.combat?.activeRunSigilId || "free"];
  const nonFreeSigilCount = activeRunSigilIds.filter(id => id && id !== "free").length;
  const hasHighRarityDrop = RARITY_RANK[runStats?.bestDropRarity || "common"] >= RARITY_RANK.epic;

  const options = [];
  const essenceQuantity = Math.max(1, Math.floor(Number(runStats?.essence || 0) / 10) + Math.max(0, Math.floor(highestTier / 5)));
  if (essenceQuantity > 0) {
    options.push({
      id: makeCargoId("essence_cache", "base"),
      type: "essence_cache",
      quantity: essenceQuantity,
      label: buildCargoLabel("essence_cache", essenceQuantity),
      description: buildCargoDescription("essence_cache"),
    });
  }

  if (bossKills > 0 || hasHighRarityDrop) {
    const codexQuantity = Math.max(1, bossKills + (hasHighRarityDrop ? 1 : 0));
    options.push({
      id: makeCargoId("codex_trace", "boss"),
      type: "codex_trace",
      quantity: codexQuantity,
      label: buildCargoLabel("codex_trace", codexQuantity),
      description: buildCargoDescription("codex_trace"),
    });
  }

  if (nonFreeSigilCount > 0 || bossKills > 0) {
    const sigilQuantity = Math.max(1, nonFreeSigilCount + Math.ceil(bossKills / 2));
    options.push({
      id: makeCargoId("sigil_residue", "sigil"),
      type: "sigil_residue",
      quantity: sigilQuantity,
      label: buildCargoLabel("sigil_residue", sigilQuantity),
      description: buildCargoDescription("sigil_residue"),
    });
  }

  if (highestTier > 25 || bossKills >= 3 || runStats?.bestDropRarity === "legendary") {
    const relicQuantity = Math.max(1, Math.ceil(Math.max(0, highestTier - 25) / 25) + (runStats?.bestDropRarity === "legendary" ? 1 : 0));
    options.push({
      id: makeCargoId("relic_shard", "abyss"),
      type: "relic_shard",
      quantity: relicQuantity,
      label: buildCargoLabel("relic_shard", relicQuantity),
      description: buildCargoDescription("relic_shard"),
    });
  }

  if (exitReason === "death") {
    return options.map(option => ({
      ...option,
      recoveredQuantity: Math.max(1, Math.floor(option.quantity * 0.5)),
    }));
  }

  return options.map(option => ({
    ...option,
    recoveredQuantity: option.quantity,
  }));
}

function upsertCargoBonus(options = [], type, bonusQuantity = 0) {
  const amount = Math.max(0, Math.floor(Number(bonusQuantity || 0)));
  if (amount <= 0) return options;

  const existingIndex = options.findIndex(option => option.type === type);
  if (existingIndex === -1) {
    return [
      ...options,
      {
        id: makeCargoId(type, "infusion"),
        type,
        quantity: amount,
        recoveredQuantity: amount,
        label: buildCargoLabel(type, amount),
        description: `${buildCargoDescription(type)} Bonus de infusion activo en esta expedicion.`,
      },
    ];
  }

  return options.map((option, index) =>
    index === existingIndex
      ? {
          ...option,
          quantity: Math.max(1, Number(option.quantity || 0)) + amount,
          recoveredQuantity: Math.max(1, Number(option.recoveredQuantity || option.quantity || 0)) + amount,
          label: buildCargoLabel(type, Math.max(1, Number(option.quantity || 0)) + amount),
        }
      : option
  );
}

function applyExtractionBonuses(cargoOptions = [], extractionBonuses = {}) {
  let nextOptions = [...cargoOptions];
  if (Number(extractionBonuses?.codexTraceBonus || 0) > 0) {
    nextOptions = upsertCargoBonus(nextOptions, "codex_trace", extractionBonuses.codexTraceBonus);
  }
  if (Number(extractionBonuses?.essenceCacheBonus || 0) > 0) {
    nextOptions = upsertCargoBonus(nextOptions, "essence_cache", extractionBonuses.essenceCacheBonus);
  }
  return nextOptions;
}

function getCandidateItems(player = {}) {
  const equipmentItems = [player?.equipment?.weapon, player?.equipment?.armor].filter(Boolean);
  const inventoryItems = Array.isArray(player?.inventory) ? player.inventory.filter(Boolean) : [];
  const seen = new Set();
  return [...equipmentItems, ...inventoryItems].filter(item => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return PROJECT_ELIGIBLE_RARITIES.has(item.rarity);
  });
}

function buildProjectOptions(state, exitReason = "retire") {
  const stashCount = Number(state?.sanctuary?.extractedItems?.length || 0);
  const availableProjectSlots = Math.max(
    0,
    Number(state?.sanctuary?.extractionUpgrades?.extractedItemSlots || 3) - stashCount
  );
  if (availableProjectSlots <= 0 || exitReason === "death") return [];

  return getCandidateItems(state?.player)
    .sort((left, right) => {
      const rarityDelta = (RARITY_RANK[right?.rarity || "common"] || 0) - (RARITY_RANK[left?.rarity || "common"] || 0);
      if (rarityDelta !== 0) return rarityDelta;
      return Number(right?.rating || 0) - Number(left?.rating || 0);
    })
    .slice(0, 6)
    .map(item => ({
      itemId: item.id,
      name: item.name,
      rarity: item.rarity,
      type: item.type,
      rating: item.rating || 0,
      affixCount: Array.isArray(item.affixes) ? item.affixes.length : 0,
      legendaryPowerId: item.legendaryPowerId || null,
      source: state?.player?.equipment?.weapon?.id === item.id || state?.player?.equipment?.armor?.id === item.id ? "equipment" : "inventory",
    }));
}

export function buildProjectSnapshot(item, meta = {}) {
  if (!item?.id) return null;
  const affixes = Array.isArray(item.affixes)
    ? item.affixes.map(affix => ({
        id: affix.id,
        stat: affix.stat,
        tier: affix.tier,
        value: affix.value,
        rolledValue: affix.rolledValue ?? affix.value,
        range: affix.range ? { ...affix.range } : null,
        source: affix.source || null,
      }))
    : [];
  return {
    id: `project_${Date.now()}_${item.id}`,
    sourceItemId: item.id,
    name: item.name,
    rarity: item.rarity,
    type: item.type,
    baseType: item.baseType || item.subtype || item.type,
    rating: item.rating || 0,
    baseRating: item.rating || 0,
    affixes,
    baseAffixes: affixes.map(affix => ({ ...affix })),
    legendaryPowerId: item.legendaryPowerId || null,
    projectTier: 0,
    upgradeLevel: 0,
    upgradeCap: 15,
    ascensionTier: 0,
    powerTier: item.legendaryPowerId ? 1 : 0,
    createdAt: Date.now(),
    sourceMeta: meta,
  };
}

export function buildExtractionPreview(state, { exitReason = "retire" } = {}) {
  const lastRun = state?.combat?.lastRunSummary || {};
  const currentRunStats = state?.combat?.runStats || {};
  const prestigeCheck = canPrestige(state);
  const extractionBonuses = state?.expedition?.activeExtractionBonuses || {};
  const baseEchoes = prestigeCheck.ok ? calculatePrestigeEchoGain(state) : 0;
  const boostedEchoes = Math.max(
    0,
    Math.floor(baseEchoes * (1 + Math.max(0, Number(extractionBonuses?.echoesMult || 0))))
  );
  const emergencyEchoes = Math.max(0, Math.floor(boostedEchoes * 0.75));
  const cargoOptions = applyExtractionBonuses(
    buildCargoOptions(state, exitReason),
    extractionBonuses
  );
  const projectOptions = buildProjectOptions(state, exitReason);
  const blueprintDecisionUnlocked = isBlueprintDecisionUnlocked(state);
  const availableSlots = {
    cargo: Math.max(0, Number(state?.sanctuary?.extractionUpgrades?.cargoSlots || 2)),
    project: exitReason === "death" || !blueprintDecisionUnlocked
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            Number(state?.sanctuary?.extractionUpgrades?.extractedItemSlots || 3) - Number(state?.sanctuary?.extractedItems?.length || 0)
          )
        ),
    relic: Math.max(0, Number(state?.sanctuary?.extractionUpgrades?.relicSlots || 0)),
    insuredCargo: Math.max(0, Number(state?.sanctuary?.extractionUpgrades?.insuredCargoSlots || 0)),
  };

  return {
    exitReason,
    summary: {
      tier: Math.max(Number(state?.combat?.currentTier || 1), Number(state?.combat?.maxTier || 1)),
      maxTier: Math.max(Number(state?.combat?.maxTier || 1), Number(state?.combat?.prestigeCycle?.maxTier || 1)),
      bossesKilled: Number(currentRunStats?.bossKills || 0),
      kills: Number(currentRunStats?.kills || 0),
      durationTicks: Number(state?.combat?.ticksInCurrentRun || lastRun?.durationTicks || 0),
      bestDropName: currentRunStats?.bestDropName || lastRun?.bestDropName || null,
      bestDropRarity: currentRunStats?.bestDropRarity || lastRun?.bestDropRarity || null,
    },
    cargoOptions,
    projectOptions,
    availableSlots,
    recoveryRules: {
      cargoRecoveryMultiplier: exitReason === "death" ? 0.5 : 1,
      projectRecovery: exitReason === "death" ? "none" : "full",
    },
    prestige: {
      eligible: prestigeCheck.ok,
      mode:
        exitReason === "death" && prestigeCheck.ok
          ? "emergency"
          : prestigeCheck.ok
            ? "echoes"
            : "none",
      echoes:
        exitReason === "death" && prestigeCheck.ok
            ? emergencyEchoes
            : prestigeCheck.ok
              ? boostedEchoes
              : 0,
      baseEchoes: boostedEchoes,
      emergencyEchoes,
    },
    activeInfusions: Array.isArray(state?.expedition?.activeInfusionIds)
      ? [...state.expedition.activeInfusionIds]
      : [],
  };
}
