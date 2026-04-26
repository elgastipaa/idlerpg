import { ACTIVE_GOALS } from "../../data/activeGoals";
import { getProgressCounterValue } from "./progressCounters";

const CATEGORY_PRIORITY = {
  prestige: 5,
  combat: 4,
  craft: 3,
  loot: 2,
  build: 1,
};

const ARC_LABELS = {
  prestige: "Prestigio",
  combat: "Push",
  craft: "Forja",
  loot: "Botin",
  build: "Build",
};

function getPlayerProgressValue(state, key) {
  const player = state.player || {};
  const combat = state.combat || {};

  if (key === "specializationSelected") return player.specialization ? 1 : 0;
  if (key === "maxTier") return combat.maxTier || combat.currentTier || 1;
  return 0;
}

function toWholeTarget(value = 1) {
  return Math.max(1, Math.floor(Number(value || 1)));
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function buildGoalDeltaObjective(goal = null, gainTarget = 1) {
  const target = toWholeTarget(gainTarget);
  const kind = goal?.target?.kind || "";
  const key = goal?.target?.key || "";

  if (kind === "combat" && key === "maxTier") {
    return `Avanza ${target} ${pluralize(target, "tier")} desde tu marca actual.`;
  }

  if (kind === "player" && key === "specializationSelected") {
    return target === 1
      ? "Elige una especializacion."
      : `Elige especializacion ${target} veces.`;
  }

  if (kind !== "stat") {
    return goal?.description || `Completa ${target} de progreso en ${goal?.name || "el objetivo"}.`;
  }

  const OBJECTIVE_BY_STAT_KEY = {
    kills: `Consigue ${target} ${pluralize(target, "baja", "bajas")} totales.`,
    blocksDone: `Bloquea ${target} ${pluralize(target, "ataque", "ataques")}.`,
    evadesDone: `Esquiva ${target} ${pluralize(target, "ataque", "ataques")}.`,
    bossKills: `Derrota ${target} ${pluralize(target, "boss", "bosses")}.`,
    bossKillsWithBleed: `Derrota ${target} ${pluralize(target, "boss", "bosses")} con sangrado activo.`,
    bossKillsWithFracture: `Derrota ${target} ${pluralize(target, "boss", "bosses")} con fractura activa.`,
    bossKillsWithDualStatus: `Derrota ${target} ${pluralize(target, "boss", "bosses")} con al menos 2 estados tacticos activos.`,
    bossKillsWithGuardPlay: `Derrota ${target} ${pluralize(target, "boss", "bosses")} habiendo bloqueado o esquivado durante la pelea.`,
    rareItemsFound: `Encuentra ${target} ${pluralize(target, "rare", "rares")}.`,
    epicItemsFound: `Encuentra ${target} ${pluralize(target, "epic", "epics")}.`,
    legendaryItemsFound: `Encuentra ${target} ${pluralize(target, "legendario", "legendarios")}.`,
    t1AffixesFound: `Encuentra ${target} ${pluralize(target, "affix T1", "affixes T1")}.`,
    perfectRollsFound: `Encuentra ${target} ${pluralize(target, "perfect roll", "perfect rolls")}.`,
    bestItemRating: `Aumenta en ${target} el rating maximo de tu mejor item.`,
    upgradesCrafted: `Realiza ${target} ${pluralize(target, "upgrade", "upgrades")}.`,
    itemsExtracted: `Extrae ${target} ${pluralize(target, "item", "items")}.`,
    itemsSold: `Vende ${target} ${pluralize(target, "item", "items")}.`,
    rerollsCrafted: `Haz ${target} ${pluralize(target, "reroll", "rerolls")} totales.`,
    polishesCrafted: `Pulir ${target} ${pluralize(target, "affix", "affixes")}.`,
    reforgesCrafted: `Reforja ${target} ${pluralize(target, "affix", "affixes")}.`,
    ascendsCrafted: `Asciende ${target} ${pluralize(target, "item", "items")}.`,
    talentsUnlocked: `Desbloquea ${target} ${pluralize(target, "talento", "talentos")}.`,
    prestigeCount: `Realiza ${target} ${pluralize(target, "prestige", "prestiges")}.`,
    prestigeNodesPurchased: `Compra ${target} ${pluralize(target, "nodo", "nodos")} de prestige.`,
  };

  return (
    OBJECTIVE_BY_STAT_KEY[key] ||
    goal?.description ||
    `Completa ${target} de progreso en ${goal?.name || "el objetivo"}.`
  );
}

export function getGoalProgress(state, goal) {
  const target = goal?.target || {};

  if (target.kind === "stat") {
    return getProgressCounterValue(state, target.key, {
      debugLabel: goal?.id || target?.key || "goal_progress",
    });
  }

  if (target.kind === "combat" || target.kind === "player") {
    return Math.max(0, getPlayerProgressValue(state, target.key));
  }

  return 0;
}

export function isGoalCompleted(state, goal) {
  return getGoalProgress(state, goal) >= (goal?.target?.value || 0);
}

export function getUnclaimedGoals(state) {
  const claimed = new Set(state.goals?.claimed || []);
  return ACTIVE_GOALS.filter(goal => !claimed.has(goal.id));
}

export function getActiveGoals(state, limit = 3) {
  const enriched = getUnclaimedGoals(state)
    .map(goal => {
      const progress = getGoalProgress(state, goal);
      const target = goal.target.value || 1;
      const completed = progress >= target;
      const remaining = Math.max(0, target - progress);

      return {
        ...goal,
        progress,
        targetValue: target,
        completed,
        remaining,
        percent: Math.max(0, Math.min(100, (progress / target) * 100)),
        sessionArc: ARC_LABELS[goal.category] || "Sesion",
        categoryPriority: CATEGORY_PRIORITY[goal.category] || 0,
      };
    })
    .sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      if ((b.categoryPriority || 0) !== (a.categoryPriority || 0)) return (b.categoryPriority || 0) - (a.categoryPriority || 0);
      const progressA = a.targetValue > 0 ? a.progress / a.targetValue : 0;
      const progressB = b.targetValue > 0 ? b.progress / b.targetValue : 0;
      return progressB - progressA;
    });

  const grouped = new Map();
  for (const goal of enriched) {
    if (!grouped.has(goal.category)) grouped.set(goal.category, []);
    grouped.get(goal.category).push(goal);
  }

  const selected = [];
  const usedIds = new Set();
  for (const category of Object.keys(CATEGORY_PRIORITY).sort((a, b) => CATEGORY_PRIORITY[b] - CATEGORY_PRIORITY[a])) {
    if (selected.length >= limit) break;
    const bucket = grouped.get(category) || [];
    if (!bucket.length) continue;
    selected.push(bucket[0]);
    usedIds.add(bucket[0].id);
  }

  if (selected.length < limit) {
    for (const goal of enriched) {
      if (selected.length >= limit) break;
      if (usedIds.has(goal.id)) continue;
      selected.push(goal);
      usedIds.add(goal.id);
    }
  }

  return selected.slice(0, limit);
}
