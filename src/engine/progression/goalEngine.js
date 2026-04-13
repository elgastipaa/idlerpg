import { ACTIVE_GOALS } from "../../data/activeGoals";

const CATEGORY_PRIORITY = {
  prestige: 5,
  combat: 4,
  craft: 3,
  loot: 2,
  build: 1,
};

const ARC_LABELS = {
  prestige: "Prestige",
  combat: "Push",
  craft: "Forja",
  loot: "Loot",
  build: "Build",
};

function getPlayerProgressValue(state, key) {
  const player = state.player || {};
  const combat = state.combat || {};

  if (key === "specializationSelected") return player.specialization ? 1 : 0;
  if (key === "maxTier") return combat.maxTier || combat.currentTier || 1;
  return 0;
}

export function getGoalProgress(state, goal) {
  const target = goal?.target || {};

  if (target.kind === "stat") {
    return Math.max(0, state.stats?.[target.key] || 0);
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
