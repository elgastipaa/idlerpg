const COUNTER_ALIAS_KEYS = Object.freeze({
  itemsExtracted: Object.freeze(["autoExtractedItems"]),
});

const PROGRESS_DIVERGENCE_WARN_COOLDOWN_MS = 60_000;
const warnedDivergenceByKey = new Map();
const isDevEnvironment = (() => {
  try {
    return typeof import.meta !== "undefined" && Boolean(import.meta?.env?.DEV);
  } catch {
    return false;
  }
})();

function toSafeCounter(value) {
  return Math.max(0, Number(value || 0));
}

function readStatsCounter(state, key) {
  return toSafeCounter(state?.stats?.[key]);
}

function readAnalyticsCounter(state, key) {
  return toSafeCounter(state?.combat?.analytics?.[key]);
}

function maybeWarnCounterDivergence(counterKey, snapshot, debugLabel = "") {
  if (!isDevEnvironment) return;
  if (!snapshot || snapshot.divergence <= 0) return;
  const warningKey = `${counterKey}:${debugLabel || "default"}`;
  const now = Date.now();
  const previous = warnedDivergenceByKey.get(warningKey) || 0;
  if (now - previous < PROGRESS_DIVERGENCE_WARN_COOLDOWN_MS) return;
  warnedDivergenceByKey.set(warningKey, now);
  console.warn(
    `[progress] Counter divergence on "${counterKey}" (${debugLabel || "goal"}): stats=${snapshot.statsValue} analytics=${snapshot.analyticsValue} resolved=${snapshot.value}`
  );
}

export function getProgressCounterSnapshot(state, counterKey, options = {}) {
  const key = String(counterKey || "");
  if (!key) {
    return {
      key: "",
      value: 0,
      statsValue: 0,
      analyticsValue: 0,
      divergence: 0,
      source: "stats",
    };
  }

  const aliasKeys = Array.isArray(options.aliasKeys)
    ? options.aliasKeys.filter(Boolean)
    : COUNTER_ALIAS_KEYS[key] || [];

  let statsValue = readStatsCounter(state, key);
  let analyticsValue = readAnalyticsCounter(state, key);

  for (const aliasKey of aliasKeys) {
    statsValue = Math.max(statsValue, readStatsCounter(state, aliasKey));
    analyticsValue = Math.max(analyticsValue, readAnalyticsCounter(state, aliasKey));
  }

  const value = Math.max(statsValue, analyticsValue);
  const divergence = Math.abs(statsValue - analyticsValue);
  const source = statsValue >= analyticsValue ? "stats" : "analytics_fallback";
  const snapshot = {
    key,
    value,
    statsValue,
    analyticsValue,
    divergence,
    source,
  };

  if (options.warnOnDivergence !== false) {
    maybeWarnCounterDivergence(key, snapshot, options.debugLabel || "");
  }

  return snapshot;
}

export function getProgressCounterValue(state, counterKey, options = {}) {
  return getProgressCounterSnapshot(state, counterKey, options).value;
}

export function getProgressCounterDivergences(state, counterKeys = [], options = {}) {
  if (!Array.isArray(counterKeys) || counterKeys.length <= 0) return [];
  return counterKeys
    .map(counterKey => getProgressCounterSnapshot(state, counterKey, {
      ...options,
      warnOnDivergence: false,
    }))
    .filter(snapshot => snapshot.divergence > 0);
}
