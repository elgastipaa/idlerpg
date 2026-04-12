import { ACTIVE_GOALS } from "../../data/activeGoals";

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
  return getUnclaimedGoals(state)
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
      };
    })
    .sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      const progressA = a.targetValue > 0 ? a.progress / a.targetValue : 0;
      const progressB = b.targetValue > 0 ? b.progress / b.targetValue : 0;
      return progressB - progressA;
    })
    .slice(0, limit);
}
