import { getRunSigil, normalizeRunSigilIds } from "../../data/runSigils";
import { calcItemRating } from "../inventory/inventoryEngine";
import { normalizeStoredItem } from "../../utils/loot";

const RELIC_SLOT_IDS = ["weapon", "armor"];
const RELIC_CONTEXT_IDS = ["none", "boss", "horde", "abyss", "farm", "speed"];
const RELIC_SIGIL_CONTEXT_HINTS = {
  ascend: "boss",
  hunt: "speed",
  forge: "farm",
  dominion: "horde",
};
const RELIC_CONTEXT_RULES = {
  none: {
    id: "none",
    label: "Neutra",
    summary: "Sin sintonia contextual.",
    bonusText: "No aplica bonus contextual.",
    defectText: "No aplica defecto contextual.",
    bonuses: {},
    defects: {},
    fluxWeight: 0.55,
  },
  boss: {
    id: "boss",
    label: "Boss",
    summary: "Empuja dano sostenido y control para encuentros largos.",
    bonusText: "+12% dano y +8% mitigacion de mecanicas de boss.",
    defectText: "-8% velocidad de ataque y -10% oro.",
    bonuses: {
      damagePct: 0.12,
      bossMechanicMitigation: 0.08,
    },
    defects: {
      attackSpeed: -0.08,
      goldPct: -0.1,
    },
    fluxWeight: 1,
  },
  horde: {
    id: "horde",
    label: "Horda",
    summary: "Prioriza ritmo y limpieza de packs con mutadores.",
    bonusText: "+10% velocidad de ataque, +16% dano a afijos y +8% loot.",
    defectText: "-10% dano y -10% oro.",
    bonuses: {
      attackSpeed: 0.1,
      enemyAffixDamagePct: 0.16,
      lootBonus: 0.08,
    },
    defects: {
      damagePct: -0.1,
      goldPct: -0.1,
    },
    fluxWeight: 0.95,
  },
  abyss: {
    id: "abyss",
    label: "Abismo",
    summary: "Sostiene pushes profundos contra escalado del Abismo.",
    bonusText: "+16% dano de abismo, +8% mitigacion boss abisal y +10% esencia abisal.",
    defectText: "-14% oro y -12% XP.",
    bonuses: {
      abyssDamagePct: 0.16,
      abyssBossMechanicMitigation: 0.08,
      abyssEssenceMult: 0.1,
    },
    defects: {
      goldPct: -0.14,
      xpPct: -0.12,
    },
    fluxWeight: 1.15,
  },
  farm: {
    id: "farm",
    label: "Farm",
    summary: "Convierte la run en recoleccion de recursos.",
    bonusText: "+14% oro, +0.35 esencia plana y +22% loot.",
    defectText: "-14% dano y -10% defensa porcentual.",
    bonuses: {
      goldPct: 0.14,
      essenceBonus: 0.35,
      lootBonus: 0.22,
    },
    defects: {
      damagePct: -0.14,
      defensePct: -0.1,
    },
    fluxWeight: 0.9,
  },
  speed: {
    id: "speed",
    label: "Speed",
    summary: "Acelera clears y ritmo general de la expedicion.",
    bonusText: "+12% velocidad de ataque, +10% XP y +5% dano.",
    defectText: "-12% oro y -12% loot.",
    bonuses: {
      attackSpeed: 0.12,
      xpPct: 0.1,
      damagePct: 0.05,
    },
    defects: {
      goldPct: -0.12,
      lootBonus: -0.12,
    },
    fluxWeight: 0.9,
  },
};

function cloneNumericMap(map = {}) {
  const cloned = {};
  for (const [key, rawValue] of Object.entries(map || {})) {
    const value = Number(rawValue || 0);
    if (!Number.isFinite(value) || value === 0) continue;
    cloned[key] = value;
  }
  return cloned;
}

function mergeNumericMap(target = {}, source = {}) {
  const next = target || {};
  for (const [key, rawValue] of Object.entries(source || {})) {
    const value = Number(rawValue || 0);
    if (!Number.isFinite(value) || value === 0) continue;
    next[key] = Number(next[key] || 0) + value;
  }
  return next;
}

function normalizeRelicSlot(slot = "") {
  return slot === "armor" ? "armor" : "weapon";
}

export function normalizeRelicContextAttunement(value = "") {
  const normalized = String(value || "none").trim().toLowerCase();
  return RELIC_CONTEXT_RULES[normalized]?.id || "none";
}

function getNormalizedEntropy(value = 0) {
  return Math.max(0, Math.min(100, Math.floor(Number(value || 0))));
}

export function getRelicContextProfile(contextAttunement = "none") {
  const contextId = normalizeRelicContextAttunement(contextAttunement);
  const context = RELIC_CONTEXT_RULES[contextId] || RELIC_CONTEXT_RULES.none;
  return {
    ...context,
    bonuses: cloneNumericMap(context.bonuses || {}),
    defects: cloneNumericMap(context.defects || {}),
  };
}

export function getRelicContextOptions({ includeNone = true } = {}) {
  const sourceIds = includeNone ? RELIC_CONTEXT_IDS : RELIC_CONTEXT_IDS.filter(contextId => contextId !== "none");
  return sourceIds.map(contextId => getRelicContextProfile(contextId));
}

export function getRelicContextLabel(contextAttunement = "none") {
  return getRelicContextProfile(contextAttunement).label || "Neutra";
}

function buildRunItemFromRelicItem(item = {}, relic = {}, slot = "weapon", now = Date.now()) {
  const sourceItem = normalizeStoredItem(item);
  if (!sourceItem) return null;
  const runItem = normalizeStoredItem({
    ...sourceItem,
    id: `relic_run_${now}_${relic.id}_${slot}`,
  });
  if (!runItem) return null;
  return {
    ...runItem,
    rating: calcItemRating(runItem),
    relicId: relic.id,
    relicSourceName: relic.name || runItem.name,
    relicContextAttunement: normalizeRelicContextAttunement(relic.contextAttunement),
  };
}

function normalizeRunSigilIdsForContext(runSigilIds = "free") {
  const source = Array.isArray(runSigilIds) ? runSigilIds : [runSigilIds];
  const slots = Math.max(1, source.length);
  return normalizeRunSigilIds(source, { slots, fillFree: true })
    .map(sigilId => getRunSigil(sigilId).id);
}

export function inferRunRelicContext({ runSigilIds = "free", abyss = {} } = {}) {
  const normalizedSigilIds = normalizeRunSigilIdsForContext(runSigilIds);
  const nonFreeSigils = normalizedSigilIds.filter(sigilId => sigilId !== "free");
  if (nonFreeSigils.length <= 0) return "none";

  const abyssUnlocked =
    Boolean(abyss?.portalUnlocked) ||
    Boolean(abyss?.tier25BossCleared) ||
    Number(abyss?.highestTierReached || 1) >= 26;
  if (abyssUnlocked && nonFreeSigils.includes("ascend")) return "abyss";

  const contextScores = {};
  for (const sigilId of nonFreeSigils) {
    const hintedContext = RELIC_SIGIL_CONTEXT_HINTS[sigilId] || "none";
    if (hintedContext === "none") continue;
    contextScores[hintedContext] = Number(contextScores[hintedContext] || 0) + 1;
  }

  let bestContext = "none";
  let bestScore = 0;
  for (const [contextId, rawScore] of Object.entries(contextScores)) {
    const score = Number(rawScore || 0);
    if (score > bestScore) {
      bestScore = score;
      bestContext = normalizeRelicContextAttunement(contextId);
    }
  }

  return bestContext || "none";
}

export function buildRelicContextRunBonuses({
  relicArmory = [],
  activeRelics = {},
  runSigilIds = "free",
  abyss = {},
} = {}) {
  const normalizedArmory = normalizeRelicArmory(relicArmory);
  const resolvedActiveRelics = ensureValidActiveRelics(normalizedArmory, activeRelics);
  const byId = Object.fromEntries(normalizedArmory.map(relic => [relic.id, relic]));
  const runContext = inferRunRelicContext({ runSigilIds, abyss });
  const playerBonuses = {};
  const matchedRelics = [];
  const mismatchedRelics = [];

  for (const slot of RELIC_SLOT_IDS) {
    const relic = byId[resolvedActiveRelics[slot]] || null;
    if (!relic) continue;
    const contextAttunement = normalizeRelicContextAttunement(relic.contextAttunement);
    if (contextAttunement === "none" || runContext === "none") continue;
    const contextProfile = getRelicContextProfile(contextAttunement);
    const matched = contextAttunement === runContext;
    mergeNumericMap(playerBonuses, matched ? contextProfile.bonuses : contextProfile.defects);
    const row = {
      relicId: relic.id,
      relicName: relic.name || "Reliquia",
      slot,
      contextAttunement,
      contextLabel: contextProfile.label,
      matched,
      effectText: matched ? contextProfile.bonusText : contextProfile.defectText,
    };
    if (matched) {
      matchedRelics.push(row);
    } else {
      mismatchedRelics.push(row);
    }
  }

  return {
    runContext,
    runContextLabel: getRelicContextLabel(runContext),
    playerBonuses,
    matchedRelics,
    mismatchedRelics,
  };
}

export function calculateRelicAttunementCost(relic = {}, targetContextAttunement = "none") {
  const currentContext = normalizeRelicContextAttunement(relic?.contextAttunement);
  const nextContext = normalizeRelicContextAttunement(targetContextAttunement);
  if (currentContext === nextContext) return 0;

  const entropy = getNormalizedEntropy(relic?.entropy || 0);
  const entropyTax = Math.floor(entropy / 7);
  const contextSwitchTax = currentContext !== "none" && nextContext !== "none" ? 8 : 0;
  const targetWeight = Number(getRelicContextProfile(nextContext).fluxWeight || 1);
  let total = Math.round((12 + entropyTax + contextSwitchTax) * targetWeight);

  if (nextContext === "none") {
    total = Math.max(4, Math.floor(total * 0.6));
  }

  return Math.max(1, total);
}

export function calculateRelicAttunementEntropyGain(relic = {}, targetContextAttunement = "none") {
  const currentContext = normalizeRelicContextAttunement(relic?.contextAttunement);
  const nextContext = normalizeRelicContextAttunement(targetContextAttunement);
  if (currentContext === nextContext) return 0;
  if (nextContext === "none") return 4;
  if (currentContext === "none") return 12;
  return 16;
}

export function calculateRelicEntropyStabilizePlan(relic = {}) {
  const entropy = getNormalizedEntropy(relic?.entropy || 0);
  const entropyReduced = Math.min(22, entropy);
  if (entropyReduced <= 0) {
    return {
      entropyReduced: 0,
      relicDustCost: 0,
      sigilFluxCost: 0,
    };
  }

  return {
    entropyReduced,
    relicDustCost: Math.max(9, Math.floor(9 + entropy * 0.56)),
    sigilFluxCost: Math.max(4, Math.floor(4 + entropy * 0.2)),
  };
}

export function createEmptyRelicLoadout() {
  return {
    weapon: null,
    armor: null,
  };
}

export function normalizeRelicRecord(relic = {}) {
  if (!relic?.id) return null;
  const normalizedItem = normalizeStoredItem(relic?.item || null);
  if (!normalizedItem?.id || !normalizedItem?.itemId) return null;
  const slot = normalizeRelicSlot(relic?.slot || normalizedItem?.type);
  return {
    ...relic,
    id: String(relic.id),
    slot,
    name: relic?.name || normalizedItem?.name || "Reliquia",
    rarity: relic?.rarity || normalizedItem?.rarity || "rare",
    itemTier: Math.max(1, Number(relic?.itemTier || normalizedItem?.itemTier || 1)),
    rating: Math.max(1, Math.round(Number(relic?.rating || normalizedItem?.rating || calcItemRating(normalizedItem) || 1))),
    legendaryPowerId: relic?.legendaryPowerId || normalizedItem?.legendaryPowerId || null,
    contextAttunement: normalizeRelicContextAttunement(relic?.contextAttunement),
    temperLevel: Math.max(0, Math.floor(Number(relic?.temperLevel || 0))),
    masteryLevel: Math.max(0, Math.floor(Number(relic?.masteryLevel || 0))),
    entropy: getNormalizedEntropy(relic?.entropy || 0),
    sourceMeta: {
      ...(relic?.sourceMeta || {}),
    },
    createdAt: Number(relic?.createdAt || Date.now()),
    updatedAt: Number(relic?.updatedAt || relic?.createdAt || Date.now()),
    item: {
      ...normalizedItem,
      type: slot,
      rating: calcItemRating(normalizedItem),
    },
  };
}

export function normalizeRelicArmory(relicArmory = []) {
  const seen = new Set();
  return (Array.isArray(relicArmory) ? relicArmory : [])
    .map(relic => normalizeRelicRecord(relic))
    .filter(Boolean)
    .filter(relic => {
      if (seen.has(relic.id)) return false;
      seen.add(relic.id);
      return true;
    });
}

export function ensureValidActiveRelics(relicArmory = [], activeRelics = {}) {
  const normalizedArmory = normalizeRelicArmory(relicArmory);
  const bySlot = {
    weapon: normalizedArmory
      .filter(relic => relic.slot === "weapon")
      .sort((left, right) => Number(right?.rating || 0) - Number(left?.rating || 0)),
    armor: normalizedArmory
      .filter(relic => relic.slot === "armor")
      .sort((left, right) => Number(right?.rating || 0) - Number(left?.rating || 0)),
  };
  const next = {
    ...createEmptyRelicLoadout(),
    ...(activeRelics || {}),
  };

  for (const slot of RELIC_SLOT_IDS) {
    const activeId = next[slot];
    if (activeId && bySlot[slot].some(relic => relic.id === activeId)) continue;
    next[slot] = bySlot[slot][0]?.id || null;
  }

  return next;
}

export function buildRelicFromItem(item = {}, { now = Date.now(), source = "extraction", sourceMeta = {} } = {}) {
  if (!item?.id) return null;
  const normalizedItem = normalizeStoredItem(item);
  if (!normalizedItem?.id || !normalizedItem?.itemId) return null;
  const slot = normalizeRelicSlot(normalizedItem.type);
  return normalizeRelicRecord({
    id: `relic_${now}_${normalizedItem.id}`,
    slot,
    name: normalizedItem.name,
    rarity: normalizedItem.rarity,
    itemTier: normalizedItem.itemTier || 1,
    rating: calcItemRating(normalizedItem),
    legendaryPowerId: normalizedItem.legendaryPowerId || null,
    contextAttunement: "none",
    temperLevel: 0,
    masteryLevel: 0,
    entropy: 0,
    sourceMeta: {
      source,
      sourceItemId: normalizedItem.id,
      ...(sourceMeta || {}),
    },
    createdAt: now,
    updatedAt: now,
    item: {
      ...normalizedItem,
      id: `relic_base_${now}_${normalizedItem.id}`,
      type: slot,
      rating: calcItemRating(normalizedItem),
    },
  });
}

export function buildRelicFromExtractedItem(extractedItem = {}, { now = Date.now() } = {}) {
  if (!extractedItem?.id) return null;
  const sourceItemId = extractedItem?.sourceBaseItemId || extractedItem?.sourceItemId || null;
  if (!sourceItemId) return null;
  const candidate = normalizeStoredItem({
    id: `legacy_extracted_${extractedItem.id}`,
    itemId: sourceItemId,
    type: extractedItem?.type || "weapon",
    rarity: extractedItem?.rarity || "rare",
    name: extractedItem?.name || "Reliquia rescatada",
    baseBonus: { ...(extractedItem?.baseBonus || {}) },
    implicitBonus: { ...(extractedItem?.implicitBonus || {}) },
    affixes: Array.isArray(extractedItem?.affixes) ? extractedItem.affixes.map(affix => ({ ...affix })) : [],
    itemTier: Math.max(1, Number(extractedItem?.itemTier || 1)),
    level: 0,
    legendaryPowerId: extractedItem?.legendaryPowerId || null,
  });
  if (!candidate?.id) return null;
  return buildRelicFromItem(candidate, {
    now,
    source: "legacy_extracted_item",
    sourceMeta: { extractedItemId: extractedItem.id },
  });
}

export function materializeRelicLoadout(relicArmory = [], activeRelics = {}, { now = Date.now() } = {}) {
  const normalizedArmory = normalizeRelicArmory(relicArmory);
  const resolvedActiveRelics = ensureValidActiveRelics(normalizedArmory, activeRelics);
  const byId = Object.fromEntries(normalizedArmory.map(relic => [relic.id, relic]));
  const weaponRelic = byId[resolvedActiveRelics.weapon] || null;
  const armorRelic = byId[resolvedActiveRelics.armor] || null;
  return {
    weapon: weaponRelic ? buildRunItemFromRelicItem(weaponRelic.item, weaponRelic, "weapon", now) : null,
    armor: armorRelic ? buildRunItemFromRelicItem(armorRelic.item, armorRelic, "armor", now + 1) : null,
  };
}
