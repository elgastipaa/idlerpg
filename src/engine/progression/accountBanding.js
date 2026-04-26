import { getProgressCounterValue } from "./progressCounters";

export const ACCOUNT_BANDS = Object.freeze([
  Object.freeze({
    id: "early",
    label: "Early",
    targetMultiplier: 0.82,
    rewardMultiplier: 0.88,
  }),
  Object.freeze({
    id: "mid",
    label: "Mid",
    targetMultiplier: 1,
    rewardMultiplier: 1,
  }),
  Object.freeze({
    id: "late",
    label: "Late",
    targetMultiplier: 1.18,
    rewardMultiplier: 1.26,
  }),
  Object.freeze({
    id: "apex",
    label: "Apex",
    targetMultiplier: 1.34,
    rewardMultiplier: 1.45,
  }),
]);

const ACCOUNT_BAND_BY_ID = Object.freeze(
  Object.fromEntries(ACCOUNT_BANDS.map(band => [band.id, band]))
);

function toSafeInt(value = 0) {
  return Math.max(0, Math.floor(Number(value || 0)));
}

function clampMultiplier(value = 1, { min = 0.4, max = 3 } = {}) {
  const numeric = Number(value || 1);
  if (!Number.isFinite(numeric)) return 1;
  return Math.max(min, Math.min(max, numeric));
}

function resolveBandIdFromSnapshot(snapshot = {}) {
  const maxTier = toSafeInt(snapshot.maxTier);
  const prestigeLevel = toSafeInt(snapshot.prestigeLevel);
  const bestItemRating = toSafeInt(snapshot.bestItemRating);
  const expeditionClaims = toSafeInt(snapshot.expeditionClaims);

  if (maxTier >= 25 || prestigeLevel >= 8 || bestItemRating >= 430 || expeditionClaims >= 45) {
    return "apex";
  }
  if (maxTier >= 18 || prestigeLevel >= 4 || bestItemRating >= 260 || expeditionClaims >= 20) {
    return "late";
  }
  if (maxTier >= 9 || prestigeLevel >= 1 || bestItemRating >= 130 || expeditionClaims >= 5) {
    return "mid";
  }
  return "early";
}

export function getAccountBandById(bandId = "mid") {
  return ACCOUNT_BAND_BY_ID[bandId] || ACCOUNT_BAND_BY_ID.mid;
}

export function buildAccountBandSnapshot(state = {}) {
  const maxTier = Math.max(
    1,
    toSafeInt(state?.combat?.maxTier || state?.combat?.currentTier || 1)
  );
  const prestigeLevel = toSafeInt(state?.prestige?.level || 0);
  const bestItemRating = toSafeInt(
    getProgressCounterValue(state, "bestItemRating", {
      warnOnDivergence: false,
    })
  );
  const expeditionClaims = toSafeInt(state?.accountTelemetry?.expeditionContractClaims || 0);
  const weeklyClaims = toSafeInt(state?.accountTelemetry?.weeklyLedgerClaims || 0);

  return {
    maxTier,
    prestigeLevel,
    bestItemRating,
    expeditionClaims,
    weeklyClaims,
  };
}

export function resolveAccountBand(state = {}) {
  const snapshot = buildAccountBandSnapshot(state);
  const id = resolveBandIdFromSnapshot(snapshot);
  return {
    ...getAccountBandById(id),
    snapshot,
  };
}

export function scaleBandTarget(baseTarget = 1, band = null) {
  const safeTarget = Math.max(1, Number(baseTarget || 1));
  const multiplier = clampMultiplier(band?.targetMultiplier || 1);
  return Math.max(1, Math.round(safeTarget * multiplier));
}

export function scaleBandReward(baseReward = {}, band = null) {
  const multiplier = clampMultiplier(band?.rewardMultiplier || 1);
  const scaledEntries = Object.entries(baseReward || {}).map(([key, rawValue]) => {
    const value = Math.max(0, Number(rawValue || 0));
    if (value <= 0) return [key, 0];
    const scaled = Math.max(1, Math.round(value * multiplier));
    return [key, scaled];
  });
  return Object.fromEntries(scaledEntries);
}
