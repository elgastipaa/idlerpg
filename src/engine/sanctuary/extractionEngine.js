import { ITEMS } from "../../data/items";
import { materializeItem } from "../../utils/loot";
import { calcItemRating } from "../inventory/inventoryEngine";
import { calculatePrestigeEchoGain, canPrestige } from "../progression/prestigeEngine";

const PROJECT_ELIGIBLE_RARITIES = new Set(["rare", "epic", "legendary"]);
const RARITY_RANK = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const TUTORIAL_EXTRACTION_PROJECT_ID = "tutorial_extraction_project";
const EXTRACTION_INTEL_LENS_USES = 2;
const EXTRACTION_DISCARD_BASE_REWARDS = {
  rare: { essence: 10, relicDust: 1, sigilFlux: 1 },
  epic: { essence: 16, relicDust: 2, sigilFlux: 2 },
  legendary: { essence: 24, relicDust: 4, sigilFlux: 3 },
};

export function isMaterializedBlueprintItem(item = {}) {
  if (!item) return false;
  if (item.blueprintId) return true;
  return typeof item.id === "string" && item.id.startsWith("bp_item_");
}

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

function shouldForceTutorialProject(state = {}) {
  return (
    !state?.onboarding?.completed &&
    !state?.onboarding?.flags?.firstExtractionCompleted
  );
}

function formatAffixIntelLine(affix = {}) {
  if (!affix?.stat) return null;
  const isExcellent = affix?.quality === "excellent" || affix?.lootOnlyQuality || Number(affix?.tier || 0) === 1;
  return `${affix.stat}${isExcellent ? " · Excelente" : ""}${affix?.source === "abyss" ? " · Abismo" : ""}`;
}

function buildProjectIntelLines(item = {}) {
  const affixes = Array.isArray(item?.affixes) ? item.affixes : [];
  const prioritized = [...affixes]
    .sort((left, right) => {
      const rightExcellent = right?.quality === "excellent" || right?.lootOnlyQuality || Number(right?.tier || 0) === 1;
      const leftExcellent = left?.quality === "excellent" || left?.lootOnlyQuality || Number(left?.tier || 0) === 1;
      if (rightExcellent !== leftExcellent) return rightExcellent ? 1 : -1;
      const valueDelta =
        Math.abs(Number(right?.rolledValue ?? right?.value ?? 0)) -
        Math.abs(Number(left?.rolledValue ?? left?.value ?? 0));
      return valueDelta;
    })
    .slice(0, 2)
    .map(formatAffixIntelLine)
    .filter(Boolean);
  if (prioritized.length > 0) return prioritized;
  return ["base estable"];
}

export function calculateExtractionDiscardRewards(item = {}) {
  const rarity = String(item?.rarity || "rare").toLowerCase();
  const base = EXTRACTION_DISCARD_BASE_REWARDS[rarity] || EXTRACTION_DISCARD_BASE_REWARDS.rare;
  const itemTier = Math.max(1, Math.floor(Number(item?.itemTier || item?.level || 1)));
  const hasLegendaryPower = Boolean(item?.legendaryPowerId);
  return {
    essence: Math.max(0, Math.floor(Number(base.essence || 0)) + Math.floor(itemTier / 5)),
    relicDust: Math.max(0, Math.floor(Number(base.relicDust || 0))),
    sigilFlux: Math.max(0, Math.floor(Number(base.sigilFlux || 0))),
    codexInk: hasLegendaryPower ? 2 : 0,
  };
}

function buildTutorialProjectOption(state = {}) {
  const preferredType = state?.player?.equipment?.weapon ? "armor" : "weapon";
  const baseItem =
    ITEMS.find(item => item.type === preferredType && item.rarity === "rare") ||
    ITEMS.find(item => item.type === preferredType) ||
    ITEMS.find(item => item.rarity === "rare") ||
    ITEMS.find(item => item.type === "weapon") ||
    null;
  if (!baseItem) return null;

  const tutorialItem = materializeItem({
    baseItem,
    rarity: "rare",
    tier: Math.max(5, Number(state?.combat?.maxTier || state?.combat?.currentTier || 1)),
    existingId: TUTORIAL_EXTRACTION_PROJECT_ID,
  });
  if (!tutorialItem) return null;

  const rating = calcItemRating(tutorialItem);
  const intelLines = buildProjectIntelLines(tutorialItem);
  const discardRewards = calculateExtractionDiscardRewards(tutorialItem);
  return {
    itemId: TUTORIAL_EXTRACTION_PROJECT_ID,
    name: tutorialItem.name,
    rarity: tutorialItem.rarity,
    type: tutorialItem.type,
    rating,
    affixCount: Array.isArray(tutorialItem.affixes) ? tutorialItem.affixes.length : 0,
    legendaryPowerId: tutorialItem.legendaryPowerId || null,
    source: "tutorial",
    intelLines,
    intelRevealedCount: intelLines.length,
    discardRewards,
    previewItem: {
      ...tutorialItem,
      rating,
    },
  };
}

function buildCargoOptions(state) {
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
    if (isMaterializedBlueprintItem(item)) return false;
    seen.add(item.id);
    return PROJECT_ELIGIBLE_RARITIES.has(item.rarity);
  });
}

function buildProjectOptions(state) {
  return getCandidateItems(state?.player)
    .sort((left, right) => {
      const rarityDelta = (RARITY_RANK[right?.rarity || "common"] || 0) - (RARITY_RANK[left?.rarity || "common"] || 0);
      if (rarityDelta !== 0) return rarityDelta;
      return Number(right?.rating || 0) - Number(left?.rating || 0);
    })
    .slice(0, 6)
    .map(item => {
      const intelLines = buildProjectIntelLines(item);
      const discardRewards = calculateExtractionDiscardRewards(item);
      return {
        itemId: item.id,
        name: item.name,
        rarity: item.rarity,
        type: item.type,
        rating: item.rating || 0,
        itemTier: Math.max(1, Math.floor(Number(item?.itemTier || item?.level || 1))),
        affixCount: Array.isArray(item.affixes) ? item.affixes.length : 0,
        legendaryPowerId: item.legendaryPowerId || null,
        source: state?.player?.equipment?.weapon?.id === item.id || state?.player?.equipment?.armor?.id === item.id ? "equipment" : "inventory",
        intelLines,
        intelRevealedCount: 0,
        discardRewards,
      };
    });
}

export function buildProjectSnapshot(item, meta = {}) {
  if (!item?.id) return null;
  const affixes = Array.isArray(item.affixes)
    ? item.affixes.map(affix => ({
        id: affix.id,
        stat: affix.stat,
        quality: affix?.quality || (Number(affix?.tier || 0) === 1 ? "excellent" : "normal"),
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

export function buildExtractionPreview(state, { exitReason: _exitReason = "retire" } = {}) {
  const normalizedExitReason = "retire";
  const lastRun = state?.combat?.lastRunSummary || {};
  const currentRunStats = state?.combat?.runStats || {};
  const prestigeCheck = canPrestige(state);
  const prestigePreview = prestigeCheck?.preview || null;
  const prestigeBreakdown = Array.isArray(prestigePreview?.breakdown) ? prestigePreview.breakdown : [];
  const firstFloorDelta = Math.max(
    0,
    Number(prestigeBreakdown.find(step => step?.id === "first_floor")?.echoes || 0)
  );
  const extractionBonuses = state?.expedition?.activeExtractionBonuses || {};
  const preExtractionEchoes = prestigeCheck.ok ? calculatePrestigeEchoGain(state) : 0;
  const extractionEchoMultiplier = Math.max(0, Number(extractionBonuses?.echoesMult || 0));
  const boostedEchoes = Math.max(
    0,
    Math.floor(preExtractionEchoes * (1 + extractionEchoMultiplier))
  );
  const extractionBonusEchoes = Math.max(0, boostedEchoes - preExtractionEchoes);
  const minimumEchoes = firstFloorDelta > 0 ? boostedEchoes : 0;
  const cargoOptions = applyExtractionBonuses(
    buildCargoOptions(state),
    extractionBonuses
  );
  const tutorialProjectRequired = shouldForceTutorialProject(state);
  const baseProjectOptions = buildProjectOptions(state);
  const tutorialProjectOption =
    tutorialProjectRequired && baseProjectOptions.length === 0
      ? buildTutorialProjectOption(state)
      : null;
  const relicOptions = tutorialProjectOption ? [tutorialProjectOption] : baseProjectOptions;
  const relicArmoryCount = Math.max(0, Number(state?.sanctuary?.relicArmory?.length || 0));
  const relicArmorySlots = Math.max(1, Number(state?.sanctuary?.extractionUpgrades?.relicSlots || 8));
  const availableRelicArmorySlots = Math.max(0, relicArmorySlots - relicArmoryCount);
  const availableSlots = {
    cargo: Math.max(0, Number(state?.sanctuary?.extractionUpgrades?.cargoSlots || 2)),
    project: Math.max(0, Math.min(1, availableRelicArmorySlots)),
    relic: Math.max(0, Math.min(1, availableRelicArmorySlots)),
    relicArmory: Math.max(0, availableRelicArmorySlots),
    insuredCargo: Math.max(0, Number(state?.sanctuary?.extractionUpgrades?.insuredCargoSlots || 0)),
  };
  const projectIntelLensUses =
    tutorialProjectRequired || Number(availableSlots.relic || availableSlots.project || 0) <= 0 || relicOptions.length <= 0
      ? 0
      : EXTRACTION_INTEL_LENS_USES;

  return {
    exitReason: normalizedExitReason,
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
    projectOptions: relicOptions,
    relicOptions,
    projectIntelLensUses,
    availableSlots,
    recoveryRules: {
      cargoRecoveryMultiplier: 1,
      projectRecovery: "full",
      relicRecovery: "full",
    },
    prestige: {
      eligible: prestigeCheck.ok,
      mode: prestigeCheck.ok ? "echoes" : "none",
      echoes: prestigeCheck.ok ? boostedEchoes : 0,
      baseEchoes: boostedEchoes,
      preExtractionEchoes,
      extractionEchoMultiplier,
      extractionBonusEchoes,
      minimumEchoes,
      momentum: prestigePreview?.momentum || null,
      breakdown: prestigeBreakdown,
    },
    activeInfusions: Array.isArray(state?.expedition?.activeInfusionIds)
      ? [...state.expedition.activeInfusionIds]
      : [],
  };
}
