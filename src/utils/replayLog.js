import { canPrestige } from "../engine/progression/prestigeEngine";

const REPLAY_VERSION = 1;
const MAX_ACTION_ENTRIES = 240;
const MAX_MILESTONE_ENTRIES = 180;
const MAX_REPLAY_LIBRARY_ENTRIES = 24;

function roundNumber(value, decimals = 2) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  const factor = 10 ** decimals;
  return Math.round(numeric * factor) / factor;
}

function formatNumber(value) {
  if (value == null) return "-";
  if (typeof value !== "number") return String(value);
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 100) return Math.round(value).toLocaleString();
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatPct(value) {
  return `${formatNumber(roundNumber(value * 100, 1))}%`;
}

function safeRatio(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function getGearRating(player = {}) {
  return (player?.equipment?.weapon?.rating || 0) + (player?.equipment?.armor?.rating || 0);
}

function summarizeItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    rarity: item.rarity,
    type: item.type,
    rating: Math.round(item.rating || 0),
    level: Number(item.level || 0),
  };
}

function summarizeLootRules(lootRules = {}) {
  return {
    autoSell: [...(lootRules.autoSellRarities || [])],
    autoExtract: [...(lootRules.autoExtractRarities || [])],
    huntPreset: lootRules.huntPreset || null,
    protectHuntedDrops: lootRules.protectHuntedDrops !== false,
    protectUpgradeDrops: lootRules.protectUpgradeDrops !== false,
    wishlist: [...(lootRules.wishlistAffixes || [])].slice(0, 8),
  };
}

function summarizeAction(action = {}) {
  const summary = {
    type: action.type,
    source: action?.meta?.source || "unknown",
  };

  if (action.tab) summary.tab = action.tab;
  if (action.skillId) summary.skillId = action.skillId;
  if (action.goalId) summary.goalId = action.goalId;
  if (action.nodeId) summary.nodeId = action.nodeId;
  if (action.upgradeId) summary.upgradeId = action.upgradeId;
  if (action.classId) summary.classId = action.classId;
  if (action.specId) summary.specId = action.specId;
  if (action.sigilId) summary.sigilId = action.sigilId;
  if (action.theme) summary.theme = action.theme;
  if (action.tier != null) summary.tier = Number(action.tier);
  if (action.source && !summary.source) summary.source = action.source;

  if (action.item) summary.item = summarizeItem(action.item);
  if (action.payload?.itemId) summary.itemId = action.payload.itemId;
  if (action.payload?.itemAId) summary.itemAId = action.payload.itemAId;
  if (action.payload?.itemBId) summary.itemBId = action.payload.itemBId;
  if (action.payload?.affixIndex != null) summary.affixIndex = Number(action.payload.affixIndex);
  if (action.payload?.replacementAffix) {
    summary.replacementAffix = {
      stat: action.payload.replacementAffix.stat,
      tier: action.payload.replacementAffix.tier,
      label: action.payload.replacementAffix.label || action.payload.replacementAffix.tierLabel || null,
    };
  }
  if (Array.isArray(action.itemIds)) {
    summary.itemIds = action.itemIds.slice(0, 12);
    summary.itemCount = action.itemIds.length;
  }
  if (action.lootRules) summary.lootRules = summarizeLootRules(action.lootRules);
  if (action.count != null) summary.count = Number(action.count);

  return summary;
}

export function createEmptyReplayLog() {
  return {
    version: REPLAY_VERSION,
    nextId: 1,
    actions: [],
    milestones: [],
  };
}

export function createEmptyReplayLibrary() {
  return {
    entries: [],
  };
}

export function normalizeReplayLog(replay = {}) {
  return {
    version: REPLAY_VERSION,
    nextId: Math.max(1, Number(replay?.nextId || 1)),
    actions: [...(replay?.actions || [])].slice(-MAX_ACTION_ENTRIES),
    milestones: [...(replay?.milestones || [])].slice(-MAX_MILESTONE_ENTRIES),
  };
}

function createReplayLibraryEntryId() {
  return `replay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function resolveReplayLabel(payload = {}, replay = {}) {
  if (payload.label) return String(payload.label).slice(0, 72);
  if (payload.name) return String(payload.name).slice(0, 72);
  const profile = payload.profile || {};
  const summary = payload.summary || {};
  const spec = profile.preferredSpec || summary.preferredSpec || "Sesion";
  const actionCount = (replay.actions || []).length;
  return `${spec} · ${actionCount} acciones`;
}

export function buildReplayLibraryEntry(payload = {}, options = {}) {
  const rawReplay = payload?.replay || payload;
  const replay = normalizeReplayLog(rawReplay);
  return {
    id: payload.id || options.id || createReplayLibraryEntryId(),
    label: resolveReplayLabel({ ...payload, label: options.label || payload.label }, replay),
    importedAt: Number(payload.importedAt || Date.now()),
    exportedAt: payload.exportedAt || null,
    isActive: payload.isActive !== false,
    replay,
  };
}

export function normalizeReplayLibrary(library = {}) {
  return {
    entries: [...(library.entries || [])]
      .map(entry => buildReplayLibraryEntry(entry))
      .slice(-MAX_REPLAY_LIBRARY_ENTRIES),
  };
}

function toReplayList(source = {}) {
  if (!source) return [];
  if (Array.isArray(source)) {
    return source.flatMap(entry => toReplayList(entry));
  }
  if (source.entries && Array.isArray(source.entries)) {
    return source.entries.flatMap(entry => {
      if (entry?.isActive === false) return [];
      return toReplayList(entry.replay || entry);
    });
  }
  return [normalizeReplayLog(source?.replay || source)];
}

function getReplayActions(source = {}) {
  return toReplayList(source).flatMap(replay => replay.actions || []);
}

function getReplayMilestones(source = {}) {
  return toReplayList(source).flatMap(replay => replay.milestones || []);
}

export function parseReplayImportPayload(payload = {}, options = {}) {
  const sources =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload.entries)
        ? payload.entries
        : Array.isArray(payload.replays)
          ? payload.replays
          : [payload];

  return sources
    .map((entry, index) => buildReplayLibraryEntry(entry, {
      label: sources.length === 1 ? options.label : (entry?.label || `${options.label || "Replay"} ${index + 1}`),
    }))
    .filter(entry => (entry.replay.actions || []).length > 0 || (entry.replay.milestones || []).length > 0);
}

export function buildReplayLibraryExport(entries = [], options = {}) {
  return {
    version: REPLAY_VERSION,
    exportedAt: new Date().toISOString(),
    label: options.label || "Replay Bundle",
    entries: entries.map(entry => ({
      id: entry.id,
      label: entry.label,
      importedAt: entry.importedAt,
      exportedAt: entry.exportedAt,
      isActive: entry.isActive !== false,
      replay: normalizeReplayLog(entry.replay || entry),
      profile: deriveHumanReplayProfile(entry.replay || entry),
    })),
  };
}

export function buildCompactSnapshot(state = {}) {
  const player = state.player || {};
  const combat = state.combat || {};
  const analytics = combat.analytics || {};
  const enemy = combat.enemy || {};
  const snapshot = {
    tick: Number(analytics.ticks || 0),
    tab: state.currentTab || "combat",
    level: Number(player.level || 1),
    tier: Number(combat.currentTier || 1),
    maxTier: Number(combat.maxTier || analytics.maxTierReached || 1),
    hpRatio: roundNumber(safeRatio(player.hp || 0, Math.max(1, player.maxHp || 1)), 3),
    gold: Math.round(player.gold || 0),
    essence: Math.round(player.essence || 0),
    talentPoints: Number(player.talentPoints || 0),
    echoes: Number(state.prestige?.echoes || 0),
    damage: Math.round(player.damage || 0),
    defense: Math.round(player.defense || 0),
    critChance: roundNumber(player.critChance || 0, 4),
    gearRating: Math.round(getGearRating(player)),
    inventorySize: Number((player.inventory || []).length),
    autoAdvance: !!combat.autoAdvance,
    enemyTier: Number(enemy.tier || combat.currentTier || 1),
    enemyBoss: !!enemy.isBoss,
    enemyHpRatio: roundNumber(safeRatio(enemy.hp || 0, Math.max(1, enemy.maxHp || 1)), 3),
    dpt: roundNumber(combat.performanceSnapshot?.damagePerTick || 0, 2),
    kpm: roundNumber(combat.performanceSnapshot?.killsPerMinute || 0, 2),
  };
  return snapshot;
}

function toSnapshot(source = {}) {
  if (source?.player || source?.combat) return buildCompactSnapshot(source);
  return source || {};
}

function getSnapshotDistance(left = {}, right = {}) {
  const normalize = (value, scale = 1) => Math.abs(Number(value || 0)) / Math.max(1e-6, scale);
  let distance = 0;

  distance += normalize((left.level || 0) - (right.level || 0), 4) * 1.25;
  distance += normalize((left.tier || 0) - (right.tier || 0), 1) * 4.5;
  distance += normalize((left.maxTier || 0) - (right.maxTier || 0), 2) * 1.4;
  distance += normalize((left.hpRatio || 0) - (right.hpRatio || 0), 0.05) * 3.4;
  distance += normalize((left.enemyHpRatio || 0) - (right.enemyHpRatio || 0), 0.08) * 1.5;
  distance += normalize((left.gearRating || 0) - (right.gearRating || 0), 120) * 1.2;
  distance += normalize((left.damage || 0) - (right.damage || 0), 120) * 0.9;
  distance += normalize((left.defense || 0) - (right.defense || 0), 25) * 0.8;
  distance += normalize((left.dpt || 0) - (right.dpt || 0), 20) * 1.15;
  distance += normalize((left.kpm || 0) - (right.kpm || 0), 4) * 0.6;

  if (!!left.autoAdvance !== !!right.autoAdvance) distance += 3;
  if (!!left.enemyBoss !== !!right.enemyBoss) distance += 3;

  return roundNumber(distance, 3);
}

function buildWeightedDecision(matches = []) {
  const weight = matches.reduce((sum, entry) => sum + Number(entry.similarity || 0), 0);
  return {
    count: matches.length,
    weight: roundNumber(weight, 4),
    avgSimilarity: roundNumber(matches.length ? weight / matches.length : 0, 4),
    avgDistance: roundNumber(matches.length ? matches.reduce((sum, entry) => sum + Number(entry.distance || 0), 0) / matches.length : 0, 3),
  };
}

function buildOutcome(prevState = {}, nextState = {}) {
  const prevSnapshot = buildCompactSnapshot(prevState);
  const nextSnapshot = buildCompactSnapshot(nextState);
  const prevAnalytics = prevState.combat?.analytics || {};
  const nextAnalytics = nextState.combat?.analytics || {};
  return {
    levelDelta: nextSnapshot.level - prevSnapshot.level,
    tierDelta: nextSnapshot.tier - prevSnapshot.tier,
    goldDelta: nextSnapshot.gold - prevSnapshot.gold,
    essenceDelta: nextSnapshot.essence - prevSnapshot.essence,
    talentPointDelta: nextSnapshot.talentPoints - prevSnapshot.talentPoints,
    gearDelta: nextSnapshot.gearRating - prevSnapshot.gearRating,
    inventoryDelta: nextSnapshot.inventorySize - prevSnapshot.inventorySize,
    killsDelta: Number(nextAnalytics.kills || 0) - Number(prevAnalytics.kills || 0),
    deathsDelta: Number(nextAnalytics.deaths || 0) - Number(prevAnalytics.deaths || 0),
    bossKillsDelta: Number(nextAnalytics.bossKills || 0) - Number(prevAnalytics.bossKills || 0),
    equippedChanged:
      prevState.player?.equipment?.weapon?.id !== nextState.player?.equipment?.weapon?.id ||
      prevState.player?.equipment?.armor?.id !== nextState.player?.equipment?.armor?.id,
  };
}

export function findSimilarReplayActions(replay = {}, current = {}, options = {}) {
  const targetSnapshot = toSnapshot(current);
  const actions = getReplayActions(replay || createEmptyReplayLog());
  const actionTypes = options.actionTypes ? new Set(options.actionTypes) : null;
  const sourceFilter = options.source === undefined ? "ui" : options.source;
  const predicate = typeof options.predicate === "function" ? options.predicate : null;
  const limit = Math.max(1, Number(options.limit || 6));

  return actions
    .filter(entry => entry?.before)
    .filter(entry => !actionTypes || actionTypes.has(entry.summary?.type))
    .filter(entry => sourceFilter == null || entry.summary?.source === sourceFilter)
    .filter(entry => !predicate || predicate(entry))
    .map(entry => {
      const distance = getSnapshotDistance(entry.before, targetSnapshot);
      return {
        ...entry,
        distance,
        similarity: roundNumber(1 / (1 + distance), 4),
      };
    })
    .sort((left, right) => left.distance - right.distance || right.similarity - left.similarity || right.tick - left.tick)
    .slice(0, limit);
}

export function deriveReplayDecisionHints(replay = {}, current = {}) {
  const craftActionTypes = [
    "CRAFT_UPGRADE_ITEM",
    "CRAFT_REROLL_ITEM",
    "CRAFT_POLISH_ITEM",
    "CRAFT_REFORGE_ITEM",
    "CRAFT_ASCEND_ITEM",
    "CRAFT_EXTRACT_ITEM",
  ];
  const pushMatches = findSimilarReplayActions(replay, current, {
    actionTypes: ["SET_TIER"],
    predicate: entry => Number(entry.outcome?.tierDelta || 0) > 0,
    limit: 6,
  });
  const dropMatches = findSimilarReplayActions(replay, current, {
    actionTypes: ["SET_TIER"],
    predicate: entry => Number(entry.outcome?.tierDelta || 0) < 0,
    limit: 6,
  });
  const autoOnMatches = findSimilarReplayActions(replay, current, {
    actionTypes: ["TOGGLE_AUTO_ADVANCE"],
    predicate: entry => !!entry.after?.autoAdvance,
    limit: 6,
  });
  const autoOffMatches = findSimilarReplayActions(replay, current, {
    actionTypes: ["TOGGLE_AUTO_ADVANCE"],
    predicate: entry => !entry.after?.autoAdvance,
    limit: 6,
  });
  const craftMatches = findSimilarReplayActions(replay, current, {
    actionTypes: craftActionTypes,
    limit: 8,
  });

  const craftModeWeights = craftMatches.reduce((acc, entry) => {
    const type = entry.summary?.type || "";
    const mode = type.replace("CRAFT_", "").replace("_ITEM", "").replace("_ITEMS", "").replace("_PREVIEW", "").toLowerCase();
    if (!mode) return acc;
    acc[mode] = roundNumber(Number(acc[mode] || 0) + Number(entry.similarity || 0), 4);
    return acc;
  }, {});

  const sortedCraftModes = Object.entries(craftModeWeights).sort((left, right) => right[1] - left[1]);
  const push = buildWeightedDecision(pushMatches);
  const drop = buildWeightedDecision(dropMatches);
  const autoOn = buildWeightedDecision(autoOnMatches);
  const autoOff = buildWeightedDecision(autoOffMatches);
  const pushVsDrop = push.weight + drop.weight;
  const autoVsManual = autoOn.weight + autoOff.weight;

  return {
    push,
    drop,
    autoOn,
    autoOff,
    pushConfidence: roundNumber(pushVsDrop > 0 ? push.weight / pushVsDrop : 0, 4),
    dropConfidence: roundNumber(pushVsDrop > 0 ? drop.weight / pushVsDrop : 0, 4),
    autoEnableConfidence: roundNumber(autoVsManual > 0 ? autoOn.weight / autoVsManual : 0, 4),
    autoDisableConfidence: roundNumber(autoVsManual > 0 ? autoOff.weight / autoVsManual : 0, 4),
    craftModeWeights,
    preferredCraftMode: sortedCraftModes[0]?.[0] || null,
    pushMatches,
    dropMatches,
    autoOnMatches,
    autoOffMatches,
    craftMatches,
  };
}

const RECORDED_ACTION_TYPES = new Set([
  "SET_TAB",
  "UPDATE_LOOT_RULES",
  "TOGGLE_THEME",
  "SET_THEME",
  "CLAIM_GOAL",
  "TOGGLE_AUTO_ADVANCE",
  "TOGGLE_SKILL_AUTOCAST",
  "SET_TIER",
  "EQUIP_ITEM",
  "USE_SKILL",
  "SELL_ITEM",
  "SELL_ITEMS",
  "UPGRADE_PLAYER",
  "UNLOCK_TALENT",
  "UPGRADE_TALENT_NODE",
  "RESET_TALENT_TREE",
  "SELECT_CLASS",
  "SELECT_SPECIALIZATION",
  "SELECT_RUN_SIGIL",
  "START_RUN",
  "BUY_PRESTIGE_NODE",
  "PRESTIGE",
  "CRAFT_REROLL_ITEM",
  "CRAFT_POLISH_ITEM",
  "CRAFT_REFORGE_PREVIEW",
  "CRAFT_REFORGE_ITEM",
  "CRAFT_UPGRADE_ITEM",
  "CRAFT_ASCEND_ITEM",
  "CRAFT_EXTRACT_ITEM",
  "RESET_SESSION_ANALYTICS",
]);

function shouldRecordAction(action = {}, prevState = {}, nextState = {}) {
  if (action?.meta?.replay === false) return false;
  if (!RECORDED_ACTION_TYPES.has(action.type)) return false;
  if (action.type === "SET_TAB" && prevState.currentTab === nextState.currentTab) return false;
  return true;
}

function makeMilestone({ replay, nextState, kind, label, meta = {} }) {
  return {
    id: replay.nextId,
    tick: Number(nextState.combat?.analytics?.ticks || 0),
    kind,
    label,
    meta,
    snapshot: buildCompactSnapshot(nextState),
  };
}

function collectMilestones(prevState = {}, nextState = {}, action = {}, replay) {
  const milestones = [];
  const prevPlayer = prevState.player || {};
  const nextPlayer = nextState.player || {};
  const prevCombat = prevState.combat || {};
  const nextCombat = nextState.combat || {};
  const prevAnalytics = prevCombat.analytics || {};
  const nextAnalytics = nextCombat.analytics || {};

  if ((nextPlayer.level || 0) > (prevPlayer.level || 0)) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "level_up",
      label: `Sube a nivel ${nextPlayer.level}`,
      meta: { from: prevPlayer.level || 0, to: nextPlayer.level || 0 },
    }));
  }

  if ((nextCombat.currentTier || 0) > (prevCombat.currentTier || 0)) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "tier_up",
      label: `Empuja a Tier ${nextCombat.currentTier}`,
      meta: { from: prevCombat.currentTier || 0, to: nextCombat.currentTier || 0, source: action.type },
    }));
  }

  if ((nextCombat.currentTier || 0) < (prevCombat.currentTier || 0)) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "tier_down",
      label: `Baja a Tier ${nextCombat.currentTier}`,
      meta: { from: prevCombat.currentTier || 0, to: nextCombat.currentTier || 0, source: action.type },
    }));
  }

  if ((nextAnalytics.deaths || 0) > (prevAnalytics.deaths || 0)) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "death",
      label: `Muere en Tier ${prevCombat.currentTier || nextCombat.currentTier || 1}`,
      meta: { tier: prevCombat.currentTier || nextCombat.currentTier || 1 },
    }));
  }

  if ((nextAnalytics.bossKills || 0) > (prevAnalytics.bossKills || 0)) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "boss_kill",
      label: `Mata boss en Tier ${prevCombat.currentTier || nextCombat.currentTier || 1}`,
      meta: { tier: prevCombat.currentTier || nextCombat.currentTier || 1 },
    }));
  }

  const prevPrestigeReady = isReplayPrestigeReady(prevState);
  const nextPrestigeReady = isReplayPrestigeReady(nextState);
  if (!prevPrestigeReady && nextPrestigeReady) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "prestige_ready",
      label: "Ascension disponible",
      meta: { level: nextPlayer.level || 1, gold: nextPlayer.gold || 0 },
    }));
  }

  if ((nextAnalytics.firstRareTick != null && prevAnalytics.firstRareTick == null)) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "first_rare",
      label: "Encuentra el primer rare",
    }));
  }

  if ((nextAnalytics.firstEpicTick != null && prevAnalytics.firstEpicTick == null)) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "first_epic",
      label: "Encuentra el primer epic",
    }));
  }

  if ((nextAnalytics.firstLegendaryTick != null && prevAnalytics.firstLegendaryTick == null)) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "first_legendary",
      label: "Encuentra el primer legendary",
    }));
  }

  if ((nextPlayer.specialization || null) !== (prevPlayer.specialization || null) && nextPlayer.specialization) {
    milestones.push(makeMilestone({
      replay,
      nextState,
      kind: "spec_selected",
      label: `Elige ${nextPlayer.specialization}`,
      meta: { spec: nextPlayer.specialization },
    }));
  }

  return milestones;
}

function isReplayPrestigeReady(state = {}) {
  return canPrestige(state).ok;
}

function compactMilestones(existing = [], additions = []) {
  return [...existing, ...additions].slice(-MAX_MILESTONE_ENTRIES);
}

function compactActions(existing = [], additions = []) {
  return [...existing, ...additions].slice(-MAX_ACTION_ENTRIES);
}

export function recordReplayState(prevState = {}, nextState = {}, action = {}) {
  const replay = normalizeReplayLog(nextState.replay || prevState.replay || createEmptyReplayLog());
  const additions = [];

  if (shouldRecordAction(action, prevState, nextState)) {
    additions.push({
      id: replay.nextId,
      tick: Number(nextState.combat?.analytics?.ticks || 0),
      summary: summarizeAction(action),
      before: buildCompactSnapshot(prevState),
      after: buildCompactSnapshot(nextState),
      outcome: buildOutcome(prevState, nextState),
    });
  }

  const milestoneEntries = collectMilestones(prevState, nextState, action, {
    ...replay,
    nextId: replay.nextId + additions.length,
  });

  return {
    ...nextState,
    replay: {
      ...replay,
      nextId: replay.nextId + additions.length + milestoneEntries.length,
      actions: compactActions(replay.actions, additions),
      milestones: compactMilestones(replay.milestones, milestoneEntries),
    },
  };
}

function safeAverage(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

export function deriveHumanReplayProfile(replay = {}) {
  const actions = getReplayActions(replay);
  const relevant = actions.filter(entry => entry?.summary?.source === "ui");
  const pushes = relevant.filter(entry => entry.summary?.type === "SET_TIER" && (entry.outcome?.tierDelta || 0) > 0);
  const drops = relevant.filter(entry => entry.summary?.type === "SET_TIER" && (entry.outcome?.tierDelta || 0) < 0);
  const autoOn = relevant.filter(entry => entry.summary?.type === "TOGGLE_AUTO_ADVANCE" && entry.after?.autoAdvance).length;
  const autoOff = relevant.filter(entry => entry.summary?.type === "TOGGLE_AUTO_ADVANCE" && !entry.after?.autoAdvance).length;
  const craftCounts = {
    upgrade: relevant.filter(entry => entry.summary?.type === "CRAFT_UPGRADE_ITEM").length,
    reroll: relevant.filter(entry => entry.summary?.type === "CRAFT_REROLL_ITEM").length,
    polish: relevant.filter(entry => entry.summary?.type === "CRAFT_POLISH_ITEM").length,
    reforge: relevant.filter(entry => entry.summary?.type === "CRAFT_REFORGE_ITEM").length,
    ascend: relevant.filter(entry => entry.summary?.type === "CRAFT_ASCEND_ITEM").length,
    extract: relevant.filter(entry => entry.summary?.type === "CRAFT_EXTRACT_ITEM").length,
  };
  const preferredSpec =
    [...relevant].reverse().find(entry => entry.summary?.type === "SELECT_SPECIALIZATION")?.summary?.specId || null;

  const wishlistEntry =
    [...relevant].reverse().find(entry => entry.summary?.type === "UPDATE_LOOT_RULES")?.summary?.lootRules?.wishlist || [];

  return {
    actionCount: relevant.length,
    preferredSpec,
    avgPushHpRatio: roundNumber(safeAverage(pushes.map(entry => entry.before?.hpRatio || 0)), 3),
    avgDropHpRatio: roundNumber(safeAverage(drops.map(entry => entry.before?.hpRatio || 0)), 3),
    autoAdvanceBias: autoOn - autoOff,
    preferredCraftMode:
      Object.entries(craftCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    craftCounts,
    wishlistStats: wishlistEntry,
  };
}

export function buildReplaySummary(state = {}) {
  const replay = normalizeReplayLog(state.replay || createEmptyReplayLog());
  const profile = deriveHumanReplayProfile(replay);
  return {
    actionCount: replay.actions.length,
    milestoneCount: replay.milestones.length,
    uiActionCount: replay.actions.filter(entry => entry?.summary?.source === "ui").length,
    lastActionTick: replay.actions[replay.actions.length - 1]?.tick || 0,
    preferredSpec: profile.preferredSpec || state.player?.specialization || "-",
    avgPushHpRatio: profile.avgPushHpRatio || 0,
    avgDropHpRatio: profile.avgDropHpRatio || 0,
    autoAdvanceBias: profile.autoAdvanceBias || 0,
    preferredCraftMode: profile.preferredCraftMode || "-",
    wishlistStats: profile.wishlistStats || [],
  };
}

export function buildReplayTextReport(state = {}) {
  const replay = normalizeReplayLog(state.replay || createEmptyReplayLog());
  const summary = buildReplaySummary(state);
  const profile = deriveHumanReplayProfile(replay);
  const lines = [
    "IdleRPG Replay Log",
    "==================",
    `Recorded Actions: ${summary.actionCount}`,
    `Recorded Milestones: ${summary.milestoneCount}`,
    `UI Actions: ${summary.uiActionCount}`,
    `Preferred Spec: ${summary.preferredSpec}`,
    `Avg Push HP%: ${formatPct(summary.avgPushHpRatio)}`,
    `Avg Drop HP%: ${formatPct(summary.avgDropHpRatio)}`,
    `Auto Advance Bias: ${formatNumber(summary.autoAdvanceBias)}`,
    `Preferred Craft: ${summary.preferredCraftMode}`,
    `Wishlist Stats: ${(summary.wishlistStats || []).join(", ") || "-"}`,
    "",
    "Recent Actions",
    "--------------",
  ];

  replay.actions.slice(-20).forEach(entry => {
    lines.push(
      `[${entry.tick}] ${entry.summary?.source || "?"} · ${entry.summary?.type || "-"} · lvl ${entry.before?.level}->${entry.after?.level} · tier ${entry.before?.tier}->${entry.after?.tier} · gold ${formatNumber(entry.outcome?.goldDelta || 0)} · essence ${formatNumber(entry.outcome?.essenceDelta || 0)}`
    );
  });

  lines.push("");
  lines.push("Recent Milestones");
  lines.push("-----------------");
  replay.milestones.slice(-20).forEach(entry => {
    lines.push(`[${entry.tick}] ${entry.kind} · ${entry.label}`);
  });

  lines.push("");
  lines.push("Human Profile");
  lines.push("-------------");
  Object.entries(profile.craftCounts || {}).forEach(([key, value]) => {
    lines.push(`${key}: ${formatNumber(value)}`);
  });

  return lines.join("\n");
}

export function buildReplayJsonExport(state = {}) {
  const replay = normalizeReplayLog(state.replay || createEmptyReplayLog());
  return {
    version: REPLAY_VERSION,
    exportedAt: new Date().toISOString(),
    summary: buildReplaySummary(state),
    profile: deriveHumanReplayProfile(replay),
    actions: replay.actions,
    milestones: replay.milestones,
  };
}

export function buildReplayDatasetSummary(source = {}) {
  const actions = getReplayActions(source);
  const milestones = getReplayMilestones(source);
  const profile = deriveHumanReplayProfile(source);
  return {
    replayCount: toReplayList(source).length,
    actionCount: actions.length,
    milestoneCount: milestones.length,
    uiActionCount: actions.filter(entry => entry?.summary?.source === "ui").length,
    preferredSpec: profile.preferredSpec || "-",
    preferredCraftMode: profile.preferredCraftMode || "-",
    avgPushHpRatio: profile.avgPushHpRatio || 0,
    avgDropHpRatio: profile.avgDropHpRatio || 0,
    autoAdvanceBias: profile.autoAdvanceBias || 0,
  };
}
