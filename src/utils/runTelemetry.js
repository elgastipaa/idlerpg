import { calcStats } from "../engine/combat/statEngine";
import { getCodexLegendaryPowerEntries } from "../engine/progression/codexEngine";
import { getWeeklyLedgerContractsWithProgress } from "../engine/progression/weeklyLedger";
import { formatRunSigilLoadout } from "../data/runSigils";
import { getRelicContextLabel, inferRunRelicContext } from "../engine/sanctuary/relicArmoryEngine";

export function createEmptySessionAnalytics() {
  return {
    ticks: 0,
    kills: 0,
    bossKills: 0,
    blocksDone: 0,
    evadesDone: 0,
    bossKillsWithBleed: 0,
    bossKillsWithFracture: 0,
    bossKillsWithDualStatus: 0,
    bossKillsWithGuardPlay: 0,
    deaths: 0,
    goldEarned: 0,
    goldSpent: 0,
    xpEarned: 0,
    essenceEarned: 0,
    essenceSpent: 0,
    damageDealt: 0,
    damageTaken: 0,
    itemsFound: 0,
    commonItemsFound: 0,
    magicItemsFound: 0,
    rareItemsFound: 0,
    epicItemsFound: 0,
    legendaryItemsFound: 0,
    legendaryPowerUnlocks: 0,
    legendaryPowerDuplicates: 0,
    perfectRollsFound: 0,
    t1AffixesFound: 0,
    itemsSold: 0,
    itemsExtracted: 0,
    autoSoldItems: 0,
    autoExtractedItems: 0,
    upgradesCrafted: 0,
    rerollsCrafted: 0,
    polishesCrafted: 0,
    reforgesCrafted: 0,
    ascendsCrafted: 0,
    powerAscendsCrafted: 0,
    forgeJobsStarted: 0,
    forgeJobsClaimed: 0,
    forgeJobsRushed: 0,
    imbueJobsStarted: 0,
    imbueJobsClaimed: 0,
    imbueJobsRushed: 0,
    talentsUnlocked: 0,
    talentResets: 0,
    playerUpgradesPurchased: 0,
    prestigeCount: 0,
    maxTierReached: 1,
    maxLevelReached: 1,
    tierAdvanceCount: 0,
    autoAdvanceEnabledCount: 0,
    autoAdvanceDisabledCount: 0,
    couldAdvanceMoments: 0,
    readyToPushByTier: {},
    deathsByTier: {},
    timeInTier: {},
    killsByTier: {},
    itemsByTier: {},
    goldByTier: {},
    xpByTier: {},
    essenceByTier: {},
    perfectByTier: {},
    t1ByTier: {},
    rarityByTier: {},
    goldBySource: {
      combat: 0,
      achievements: 0,
      goals: 0,
      selling: 0,
      autoSell: 0,
      weeklyBoss: 0,
    },
    essenceBySource: {
      combat: 0,
      goals: 0,
      extract: 0,
      autoExtract: 0,
      weeklyBoss: 0,
    },
    goldSpentBySource: {
      playerUpgrades: 0,
      rerolls: 0,
      polish: 0,
      reforge: 0,
      upgrades: 0,
      ascends: 0,
      prestige: 0,
    },
    essenceSpentBySource: {
      rerolls: 0,
      polish: 0,
      reforge: 0,
      ascends: 0,
    },
    upgradesSucceeded: 0,
    upgradesFailed: 0,
    equippedUpgrades: 0,
    firstRareTick: null,
    firstEpicTick: null,
    firstLegendaryTick: null,
    firstBossKillTick: null,
    firstPrestigeTick: null,
    bestItemRating: 0,
    bestDropName: null,
    bestDropRarity: null,
    bestDropHighlight: null,
    bestDropPerfectRolls: 0,
    bestDropScore: 0,
    blockedSellEquippedAttempts: 0,
    blockedExtractEquippedAttempts: 0,
    expeditionContractsSelected: 0,
    expeditionContractsRerolled: 0,
    expeditionContractsCompleted: 0,
    weeklyBossTicks: 0,
    weeklyBossDamageDealt: 0,
    weeklyBossDamageTaken: 0,
    weeklyBossEncountersStarted: 0,
    weeklyBossEncountersWon: 0,
    weeklyBossEncountersLost: 0,
    weeklyBossRewardsClaimed: 0,
    weeklyBossDifficultyStarts: {},
    weeklyBossDifficultyWins: {},
    weeklyBossDifficultyLosses: {},
  };
}

export function createEmptyAccountTelemetry() {
  return {
    version: 1,
    firstSeenAt: null,
    lastActiveAt: null,
    lastSessionStartedAt: null,
    currentSessionSeconds: 0,
    totalOnlineSeconds: 0,
    totalOfflineSeconds: 0,
    offlineRecoveryCount: 0,
    longestOfflineSeconds: 0,
    totalSanctuarySeconds: 0,
    totalExpeditionSeconds: 0,
    totalSetupSeconds: 0,
    totalExtractionSeconds: 0,
    sessionCount: 0,
    longestSessionSeconds: 0,
    expeditionCount: 0,
    completedExpeditionCount: 0,
    extractionCount: 0,
    manualExtractionCount: 0,
    prestigeExtractionCount: 0,
    currentExpeditionSeconds: 0,
    longestExpeditionSeconds: 0,
    totalExpeditionLifecycleSeconds: 0,
    distillJobsStarted: 0,
    distillJobsCompleted: 0,
    codexResearchStarted: 0,
    codexResearchCompleted: 0,
    labResearchStarted: 0,
    labResearchCompleted: 0,
    errandJobsStarted: 0,
    errandJobsCompleted: 0,
    sigilJobsStarted: 0,
    sigilJobsCompleted: 0,
    forgeJobsStarted: 0,
    forgeJobsCompleted: 0,
    forgeJobsRushed: 0,
    imbueJobsStarted: 0,
    imbueJobsCompleted: 0,
    imbueJobsRushed: 0,
    expeditionContractSelections: 0,
    expeditionContractRerolls: 0,
    expeditionContractCompletions: 0,
    expeditionContractClaims: 0,
    weeklyLedgerClaims: 0,
    inventoryOverflowEvents: 0,
    inventoryOverflowDisplaced: 0,
    inventoryOverflowLost: 0,
    firstExpeditionContractClaimAtOnlineSeconds: null,
    firstWeeklyClaimAtOnlineSeconds: null,
    weeklyBossEncountersStarted: 0,
    weeklyBossEncountersWon: 0,
    weeklyBossEncountersLost: 0,
    weeklyBossRewardClaims: 0,
    weeklyBossDifficultyStarts: {},
    weeklyBossDifficultyWins: {},
    weeklyBossDifficultyLosses: {},
    blueprintsCreated: 0,
    blueprintsScrapped: 0,
    blueprintsDiscarded: 0,
    blueprintStructureUpgrades: 0,
    blueprintPowerTunes: 0,
    blueprintAscensions: 0,
    saveRepairs: 0,
    saveResets: 0,
    runtimeRecoveryCount: 0,
    runtimeRepairCount: 0,
    runtimeOfflineJobStallCount: 0,
    runtimeLastRecoveryAt: null,
    runtimeLastRecoveryReason: null,
    firstSpecAtOnlineSeconds: null,
    firstBossAtOnlineSeconds: null,
    firstExtractionAtOnlineSeconds: null,
    firstPrestigeAtOnlineSeconds: null,
    firstLaboratoryAtOnlineSeconds: null,
    firstDistilleryAtOnlineSeconds: null,
    firstBlueprintAtOnlineSeconds: null,
    firstDeepForgeAtOnlineSeconds: null,
    firstLibraryAtOnlineSeconds: null,
    firstErrandsAtOnlineSeconds: null,
    firstSigilAltarAtOnlineSeconds: null,
    firstAbyssPortalAtOnlineSeconds: null,
  };
}

export function sanitizeAccountTelemetry(rawTelemetry = {}) {
  const base = createEmptyAccountTelemetry();
  const next = {
    ...base,
    ...(rawTelemetry || {}),
  };

  const numericKeys = Object.keys(base).filter(
    key => typeof base[key] === "number"
  );
  for (const key of numericKeys) {
    next[key] = Math.max(0, Number(next[key] || 0));
  }

  next.firstSeenAt = next.firstSeenAt ? Number(next.firstSeenAt) || null : null;
  next.lastActiveAt = next.lastActiveAt ? Number(next.lastActiveAt) || null : null;
  next.lastSessionStartedAt = next.lastSessionStartedAt
    ? Number(next.lastSessionStartedAt) || null
    : null;
  next.runtimeLastRecoveryAt = next.runtimeLastRecoveryAt
    ? Number(next.runtimeLastRecoveryAt) || null
    : null;
  next.runtimeLastRecoveryReason =
    typeof next.runtimeLastRecoveryReason === "string" && next.runtimeLastRecoveryReason.trim()
      ? next.runtimeLastRecoveryReason.trim().slice(0, 96)
      : null;
  next.firstSpecAtOnlineSeconds = next.firstSpecAtOnlineSeconds != null ? Number(next.firstSpecAtOnlineSeconds) || 0 : null;
  next.firstBossAtOnlineSeconds = next.firstBossAtOnlineSeconds != null ? Number(next.firstBossAtOnlineSeconds) || 0 : null;
  next.firstExtractionAtOnlineSeconds = next.firstExtractionAtOnlineSeconds != null ? Number(next.firstExtractionAtOnlineSeconds) || 0 : null;
  next.firstPrestigeAtOnlineSeconds = next.firstPrestigeAtOnlineSeconds != null ? Number(next.firstPrestigeAtOnlineSeconds) || 0 : null;
  next.firstLaboratoryAtOnlineSeconds = next.firstLaboratoryAtOnlineSeconds != null ? Number(next.firstLaboratoryAtOnlineSeconds) || 0 : null;
  next.firstDistilleryAtOnlineSeconds = next.firstDistilleryAtOnlineSeconds != null ? Number(next.firstDistilleryAtOnlineSeconds) || 0 : null;
  next.firstBlueprintAtOnlineSeconds = next.firstBlueprintAtOnlineSeconds != null ? Number(next.firstBlueprintAtOnlineSeconds) || 0 : null;
  next.firstDeepForgeAtOnlineSeconds = next.firstDeepForgeAtOnlineSeconds != null ? Number(next.firstDeepForgeAtOnlineSeconds) || 0 : null;
  next.firstLibraryAtOnlineSeconds = next.firstLibraryAtOnlineSeconds != null ? Number(next.firstLibraryAtOnlineSeconds) || 0 : null;
  next.firstErrandsAtOnlineSeconds = next.firstErrandsAtOnlineSeconds != null ? Number(next.firstErrandsAtOnlineSeconds) || 0 : null;
  next.firstSigilAltarAtOnlineSeconds = next.firstSigilAltarAtOnlineSeconds != null ? Number(next.firstSigilAltarAtOnlineSeconds) || 0 : null;
  next.firstAbyssPortalAtOnlineSeconds = next.firstAbyssPortalAtOnlineSeconds != null ? Number(next.firstAbyssPortalAtOnlineSeconds) || 0 : null;
  next.firstExpeditionContractClaimAtOnlineSeconds =
    next.firstExpeditionContractClaimAtOnlineSeconds != null
      ? Number(next.firstExpeditionContractClaimAtOnlineSeconds) || 0
      : null;
  next.firstWeeklyClaimAtOnlineSeconds =
    next.firstWeeklyClaimAtOnlineSeconds != null
      ? Number(next.firstWeeklyClaimAtOnlineSeconds) || 0
      : null;

  return next;
}

export function sanitizeSessionAnalytics(rawAnalytics = {}) {
  const base = createEmptySessionAnalytics();
  const analytics = {
    ...base,
    ...(rawAnalytics || {}),
    goldBySource: {
      ...base.goldBySource,
      ...((rawAnalytics || {}).goldBySource || {}),
    },
    essenceBySource: {
      ...base.essenceBySource,
      ...((rawAnalytics || {}).essenceBySource || {}),
    },
    goldSpentBySource: {
      ...base.goldSpentBySource,
      ...((rawAnalytics || {}).goldSpentBySource || {}),
    },
    essenceSpentBySource: {
      ...base.essenceSpentBySource,
      ...((rawAnalytics || {}).essenceSpentBySource || {}),
    },
  };

  const itemsFound = Math.max(0, Number(analytics.itemsFound || 0));
  const itemsSold = Math.max(0, Number(analytics.itemsSold || 0));
  const itemsExtracted = Math.max(0, Number(analytics.itemsExtracted || 0));
  const autoSoldItems = Math.min(itemsFound, itemsSold, Math.max(0, Number(analytics.autoSoldItems || 0)));
  const autoExtractedItems = Math.min(itemsFound, itemsExtracted, Math.max(0, Number(analytics.autoExtractedItems || 0)));

  return {
    ...analytics,
    itemsFound,
    itemsSold,
    itemsExtracted,
    autoSoldItems,
    autoExtractedItems,
    bestDropScore: Math.max(0, Number(analytics.bestDropScore || 0)),
  };
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function getTierMapValue(map = {}, tier = 1) {
  return map?.[tier] || 0;
}

function getNestedTierValue(map = {}, tier = 1, key = "common") {
  return map?.[tier]?.[key] || 0;
}

function formatValue(value) {
  if (value == null) return "-";
  if (typeof value !== "number") return String(value);
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 100) return Math.round(value).toLocaleString();
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatDurationFromTicks(ticks = 0) {
  const totalSeconds = Math.max(0, Math.floor(ticks));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatShortDurationFromTicks(ticks = 0) {
  const seconds = Math.max(0, Number(ticks || 0));
  if (seconds < 60) return `${formatValue(seconds)}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${formatValue(minutes)}m`;
  return `${formatValue(minutes / 60)}h`;
}

function perMinute(value, ticks) {
  if (!ticks) return 0;
  return (value / ticks) * 60;
}

function perHour(value, ticks) {
  if (!ticks) return 0;
  return (value / ticks) * 3600;
}

function ratio(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function asPercent(numerator, denominator) {
  return `${formatValue(ratio(numerator, denominator) * 100)}%`;
}

function asPerThousand(numerator, denominator) {
  return formatValue(ratio(numerator, denominator) * 1000);
}

function sumValues(map = {}) {
  return Object.values(map || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function averageTicksPerKill(kills = 0, ticks = 0) {
  if (!kills) return 0;
  return ticks / kills;
}

function getPeakTierLabel(map = {}) {
  const entries = Object.entries(map || {}).filter(([, value]) => Number(value || 0) > 0);
  if (entries.length === 0) return "-";
  const [tier, value] = entries.sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0];
  return `Tier ${tier} (${formatValue(value)})`;
}

function flattenSectionsToEntries(sections = []) {
  return sections.flatMap(section =>
    (section.rows || []).map(row => ({
      section: section.title,
      label: row.label,
      value: row.value,
    }))
  );
}

export function buildSessionTelemetrySections(state) {
  const analytics = sanitizeSessionAnalytics(state?.combat?.analytics || createEmptySessionAnalytics());
  const player = state?.player || {};
  const combat = state?.combat || {};
  const sanctuary = state?.sanctuary || {};
  const expedition = state?.expedition || {};
  const stats = state?.stats || {};
  const prestige = state?.prestige || {};
  const weapon = player?.equipment?.weapon || null;
  const armor = player?.equipment?.armor || null;
  const gearRating = (weapon?.rating || 0) + (armor?.rating || 0);
  const gearAffixes = (weapon?.affixes?.length || 0) + (armor?.affixes?.length || 0);
  const equippedSlots = Number(!!weapon) + Number(!!armor);
  const ticks = analytics.ticks || 0;
  const currentStats = calcStats(player);
  const codexPowerEntries = getCodexLegendaryPowerEntries(state?.codex || {});
  const unlockedPowerCount = codexPowerEntries.filter(entry => entry.unlocked).length;
  const tunedPowerCount = codexPowerEntries.filter(entry => (entry.mastery?.rank || 0) >= 2).length;
  const dominatedPowerCount = codexPowerEntries.filter(entry => (entry.mastery?.rank || 0) >= 3).length;
  const mythicPowerCount = codexPowerEntries.filter(entry => (entry.mastery?.rank || 0) >= 4).length;
  const topPowerEntry = [...codexPowerEntries]
    .filter(entry => entry.unlocked)
    .sort((left, right) => {
      if ((right.mastery?.rank || 0) !== (left.mastery?.rank || 0)) return (right.mastery?.rank || 0) - (left.mastery?.rank || 0);
      if ((right.discoveries || 0) !== (left.discoveries || 0)) return (right.discoveries || 0) - (left.discoveries || 0);
      return left.name.localeCompare(right.name, "es");
    })[0] || null;

  const rarePlus = (analytics.rareItemsFound || 0) + (analytics.epicItemsFound || 0) + (analytics.legendaryItemsFound || 0);
  const epicPlus = (analytics.epicItemsFound || 0) + (analytics.legendaryItemsFound || 0);
  const autoProcessedItems = (analytics.autoSoldItems || 0) + (analytics.autoExtractedItems || 0);
  const maxTier = analytics.maxTierReached || combat.maxTier || 1;
  const currentTier = combat.currentTier || 1;
  const currentTierKillTime = averageTicksPerKill(getTierMapValue(analytics.killsByTier, currentTier), getTierMapValue(analytics.timeInTier, currentTier));
  const highestTierKillTime = averageTicksPerKill(getTierMapValue(analytics.killsByTier, maxTier), getTierMapValue(analytics.timeInTier, maxTier));
  const currentLevel = player.level || 1;
  const maxLevel = analytics.maxLevelReached || player.level || 1;
  const levelGapFromPeak = Math.max(0, maxLevel - currentLevel);
  const tierGapFromPeak = Math.max(0, maxTier - currentTier);
  const activeRunSigilIds = Array.isArray(combat?.activeRunSigilIds) && combat.activeRunSigilIds.length > 0
    ? combat.activeRunSigilIds
    : combat?.activeRunSigilId || "free";
  const pendingRunSigilIds = Array.isArray(combat?.pendingRunSigilIds) && combat.pendingRunSigilIds.length > 0
    ? combat.pendingRunSigilIds
    : combat?.pendingRunSigilId || "free";
  const activeSigilLabel = formatRunSigilLoadout(activeRunSigilIds);
  const pendingSigilLabel = formatRunSigilLoadout(pendingRunSigilIds);
  const activeRelicContextId = expedition?.activeRelicContext || "none";
  const activeRelicContextLabel = getRelicContextLabel(activeRelicContextId);
  const projectedRelicContextId = inferRunRelicContext({
    runSigilIds: pendingRunSigilIds,
    abyss: state?.abyss || {},
  });
  const projectedRelicContextLabel = getRelicContextLabel(projectedRelicContextId);
  const relicArmory = Array.isArray(sanctuary?.relicArmory) ? sanctuary.relicArmory : [];
  const activeRelics = sanctuary?.activeRelics || {};

  function formatActiveRelicLine(slot = "weapon") {
    const relicId = activeRelics?.[slot] || null;
    if (!relicId) return "Sin asignar";
    const relic = relicArmory.find(entry => entry?.id === relicId) || null;
    if (!relic) return "Sin asignar";
    const attunementLabel = getRelicContextLabel(relic?.contextAttunement || "none");
    const entropy = Math.max(0, Math.floor(Number(relic?.entropy || 0)));
    return `${relic?.name || "Reliquia"} · ${attunementLabel} · entropy ${formatValue(entropy)}`;
  }

  const sections = [
    {
      id: "playthrough_handoff",
      title: "Playthrough Handoff",
      rows: [
        { label: "Sigilos activos", value: activeSigilLabel },
        { label: "Sigilos pendientes", value: pendingSigilLabel },
        { label: "Contexto reliquias activo", value: activeRelicContextLabel },
        { label: "Contexto reliquias proyectado", value: projectedRelicContextLabel },
        { label: "Sintonia reliquia (arma)", value: formatActiveRelicLine("weapon") },
        { label: "Sintonia reliquia (armadura)", value: formatActiveRelicLine("armor") },
        { label: "Max Tier", value: formatValue(maxTier) },
        { label: "Muertes", value: formatValue(analytics.deaths || 0) },
        { label: "Oro actual", value: formatValue(player.gold || 0) },
        { label: "Esencia actual", value: formatValue(player.essence || 0) },
        { label: "Sensacion subjetiva (manual)", value: "[Completar: fuerte / ok / debil + comentario breve]" },
      ],
    },
    {
      id: "session",
      title: "Session Core",
      rows: [
        { label: "Scope", value: "Desde ultimo reset de telemetria" },
        { label: "Session Duration", value: formatDurationFromTicks(ticks) },
        { label: "Session Ticks", value: formatValue(ticks) },
        { label: "Class / Spec", value: `${player.class || "-"} / ${player.specialization || "-"}` },
        { label: "Kills", value: formatValue(analytics.kills) },
        { label: "Boss Kills", value: formatValue(analytics.bossKills) },
        { label: "Deaths", value: formatValue(analytics.deaths) },
        { label: "Kills / Min", value: formatValue(perMinute(analytics.kills, ticks)) },
        { label: "Deaths / Hour", value: formatValue(perHour(analytics.deaths, ticks)) },
        { label: "K / D", value: formatValue(ratio(analytics.kills, Math.max(1, analytics.deaths || 0))) },
        { label: "Deaths / 1k Kills", value: asPerThousand(analytics.deaths || 0, analytics.kills || 0) },
      ],
    },
    {
      id: "progression",
      title: "Progression",
      rows: [
        { label: "Current Level", value: formatValue(currentLevel) },
        { label: "Highest Level", value: formatValue(maxLevel) },
        { label: "Level Gap vs Peak", value: formatValue(levelGapFromPeak) },
        { label: "Current Tier", value: formatValue(currentTier) },
        { label: "Highest Tier", value: formatValue(maxTier) },
        { label: "Tier Gap vs Peak", value: formatValue(tierGapFromPeak) },
        { label: "Tier Advances", value: formatValue(analytics.tierAdvanceCount || 0) },
        { label: "Ready To Push Ticks", value: formatValue(analytics.couldAdvanceMoments || 0) },
        { label: "Advance / Ready Tick", value: asPercent(analytics.tierAdvanceCount || 0, analytics.couldAdvanceMoments || 0) },
        { label: "Most Ready Tier", value: getPeakTierLabel(analytics.readyToPushByTier) },
        { label: "Most Lethal Tier", value: getPeakTierLabel(analytics.deathsByTier) },
        { label: "Auto Advance On", value: formatValue(analytics.autoAdvanceEnabledCount || 0) },
        { label: "Auto Advance Off", value: formatValue(analytics.autoAdvanceDisabledCount || 0) },
        { label: "Time In Tier 1", value: formatDurationFromTicks(getTierMapValue(analytics.timeInTier, 1)) },
        { label: "Time In Tier 2+", value: formatDurationFromTicks(Math.max(0, ticks - getTierMapValue(analytics.timeInTier, 1))) },
        { label: "Time In Highest Tier", value: formatDurationFromTicks(getTierMapValue(analytics.timeInTier, maxTier)) },
        { label: "Kills In Highest Tier", value: formatValue(getTierMapValue(analytics.killsByTier, maxTier)) },
        { label: "Avg Kill Time Current Tier", value: currentTierKillTime > 0 ? formatShortDurationFromTicks(currentTierKillTime) : "-" },
        { label: "Avg Kill Time Highest Tier", value: highestTierKillTime > 0 ? formatShortDurationFromTicks(highestTierKillTime) : "-" },
        { label: "First Boss Kill At", value: analytics.firstBossKillTick != null ? formatDurationFromTicks(analytics.firstBossKillTick) : "-" },
        { label: "First Prestige At", value: analytics.firstPrestigeTick != null ? formatDurationFromTicks(analytics.firstPrestigeTick) : "-" },
      ],
    },
    {
      id: "economy",
      title: "Economy",
      rows: [
        { label: "Gold Earned", value: formatValue(analytics.goldEarned) },
        { label: "Gold Spent", value: formatValue(analytics.goldSpent) },
        { label: "Gold Net", value: formatValue((analytics.goldEarned || 0) - (analytics.goldSpent || 0)) },
        { label: "Gold / Min", value: formatValue(perMinute(analytics.goldEarned, ticks)) },
        { label: "Gold Spend Rate", value: asPercent(analytics.goldSpent || 0, analytics.goldEarned || 0) },
        { label: "Gold By Combat", value: formatValue(analytics.goldBySource?.combat || 0) },
        { label: "Gold By Selling", value: formatValue(analytics.goldBySource?.selling || 0) },
        { label: "Gold By Auto Sell", value: formatValue(analytics.goldBySource?.autoSell || 0) },
        { label: "Gold By Goals", value: formatValue(analytics.goldBySource?.goals || 0) },
        { label: "Gold By Achievements", value: formatValue(analytics.goldBySource?.achievements || 0) },
        { label: "Essence Earned", value: formatValue(analytics.essenceEarned) },
        { label: "Essence Spent", value: formatValue(analytics.essenceSpent) },
        { label: "Essence Net", value: formatValue((analytics.essenceEarned || 0) - (analytics.essenceSpent || 0)) },
        { label: "Essence / Min", value: formatValue(perMinute(analytics.essenceEarned, ticks)) },
        { label: "Essence Spend Rate", value: asPercent(analytics.essenceSpent || 0, analytics.essenceEarned || 0) },
        { label: "Essence By Combat", value: formatValue(analytics.essenceBySource?.combat || 0) },
        { label: "Essence By Extract", value: formatValue(analytics.essenceBySource?.extract || 0) },
        { label: "Essence By Auto Extract", value: formatValue(analytics.essenceBySource?.autoExtract || 0) },
        { label: "Essence By Goals", value: formatValue(analytics.essenceBySource?.goals || 0) },
      ],
    },
    {
      id: "loot",
      title: "Loot & Quality",
      rows: [
        { label: "Items Found", value: formatValue(analytics.itemsFound) },
        { label: "Items / Min", value: formatValue(perMinute(analytics.itemsFound, ticks)) },
        { label: "Common Found", value: formatValue(analytics.commonItemsFound) },
        { label: "Magic Found", value: formatValue(analytics.magicItemsFound) },
        { label: "Rare Found", value: formatValue(analytics.rareItemsFound) },
        { label: "Epic Found", value: formatValue(analytics.epicItemsFound) },
        { label: "Legendary Found", value: formatValue(analytics.legendaryItemsFound) },
        { label: "Rare+ Rate", value: asPercent(rarePlus, analytics.itemsFound || 0) },
        { label: "Epic+ Rate", value: asPercent(epicPlus, analytics.itemsFound || 0) },
        { label: "Legendary / 1k Items", value: asPerThousand(analytics.legendaryItemsFound || 0, analytics.itemsFound || 0) },
        { label: "Excellent Affixes", value: formatValue(analytics.t1AffixesFound) },
        { label: "Excellent Affix Rate", value: asPercent(analytics.t1AffixesFound || 0, Math.max(1, analytics.itemsFound || 0)) },
        { label: "Tier 1 Rare Found", value: formatValue(getNestedTierValue(analytics.rarityByTier, 1, "rare")) },
        { label: "Highest Tier Rare Found", value: formatValue(getNestedTierValue(analytics.rarityByTier, maxTier, "rare")) },
        { label: "First Rare At", value: analytics.firstRareTick != null ? formatDurationFromTicks(analytics.firstRareTick) : "-" },
        { label: "First Epic At", value: analytics.firstEpicTick != null ? formatDurationFromTicks(analytics.firstEpicTick) : "-" },
        { label: "First Legendary At", value: analytics.firstLegendaryTick != null ? formatDurationFromTicks(analytics.firstLegendaryTick) : "-" },
        { label: "Best Drop", value: analytics.bestDropName || "-" },
        { label: "Best Drop Rarity", value: analytics.bestDropRarity || "-" },
        { label: "Best Drop Highlight", value: analytics.bestDropHighlight || "-" },
        { label: "Best Drop Excelentes", value: formatValue(analytics.bestDropPerfectRolls) },
      ],
    },
    {
      id: "powers",
      title: "Legendary Powers & Mastery",
      rows: [
        { label: "Legendary Powers Unlocked", value: formatValue(analytics.legendaryPowerUnlocks || 0) },
        { label: "Legendary Power Duplicates", value: formatValue(analytics.legendaryPowerDuplicates || 0) },
        { label: "Power Unlock Rate", value: asPercent(analytics.legendaryPowerUnlocks || 0, analytics.legendaryItemsFound || 0) },
        { label: "Power Duplicate Rate", value: asPercent(analytics.legendaryPowerDuplicates || 0, analytics.legendaryItemsFound || 0) },
        { label: "Ascends With Power", value: formatValue(analytics.powerAscendsCrafted || 0) },
        { label: "Unlocked Powers (current)", value: formatValue(unlockedPowerCount) },
        { label: "Tuned Powers (rank 2+)", value: formatValue(tunedPowerCount) },
        { label: "Dominated Powers (rank 3+)", value: formatValue(dominatedPowerCount) },
        { label: "Mythic Powers (rank 4)", value: formatValue(mythicPowerCount) },
        {
          label: "Highest Mastery Power",
          value: topPowerEntry
            ? `${topPowerEntry.name} (${topPowerEntry.mastery?.label || "Descubierto"} · ${formatValue(topPowerEntry.discoveries || 0)} hallazgos)`
            : "-",
        },
      ],
    },
    {
      id: "crafting",
      title: "Crafting & Automation",
      rows: [
        { label: "Sold Count", value: formatValue(analytics.itemsSold) },
        { label: "Extract Count", value: formatValue(analytics.itemsExtracted) },
        { label: "Auto Sell Count", value: formatValue(analytics.autoSoldItems) },
        { label: "Auto Extract Count", value: formatValue(analytics.autoExtractedItems) },
        { label: "Auto Processed % of Drops", value: asPercent(autoProcessedItems, analytics.itemsFound || 0) },
        { label: "Craft Upgrades", value: formatValue(analytics.upgradesCrafted) },
        { label: "Upgrade Success", value: formatValue(analytics.upgradesSucceeded || 0) },
        { label: "Upgrade Failed", value: formatValue(analytics.upgradesFailed || 0) },
        { label: "Upgrade Success Rate", value: asPercent(analytics.upgradesSucceeded || 0, analytics.upgradesCrafted || 0) },
        { label: "Craft Polishes", value: formatValue(analytics.polishesCrafted || 0) },
        { label: "Craft Reforges", value: formatValue(analytics.reforgesCrafted || 0) },
        { label: "Craft Ascends", value: formatValue(analytics.ascendsCrafted) },
        { label: "Ascends con Power", value: formatValue(analytics.powerAscendsCrafted || 0) },
        { label: "Forge Jobs Started", value: formatValue(analytics.forgeJobsStarted || 0) },
        { label: "Forge Jobs Claimed", value: formatValue(analytics.forgeJobsClaimed || 0) },
        { label: "Forge Jobs Rushed", value: formatValue(analytics.forgeJobsRushed || 0) },
        { label: "Imbue Jobs Started", value: formatValue(analytics.imbueJobsStarted || 0) },
        { label: "Imbue Jobs Claimed", value: formatValue(analytics.imbueJobsClaimed || 0) },
        { label: "Imbue Jobs Rushed", value: formatValue(analytics.imbueJobsRushed || 0) },
        { label: "Equip Improvements", value: formatValue(analytics.equippedUpgrades || 0) },
        { label: "Gold Spent Upgrades", value: formatValue(analytics.goldSpentBySource?.upgrades || 0) },
        { label: "Gold Spent Player Upg", value: formatValue(analytics.goldSpentBySource?.playerUpgrades || 0) },
        { label: "Gold Spent Polish", value: formatValue(analytics.goldSpentBySource?.polish || 0) },
        { label: "Gold Spent Reforge", value: formatValue(analytics.goldSpentBySource?.reforge || 0) },
        { label: "Gold Spent Ascends", value: formatValue(analytics.goldSpentBySource?.ascends || 0) },
        { label: "Essence Spent Polish", value: formatValue(analytics.essenceSpentBySource?.polish || 0) },
        { label: "Essence Spent Reforge", value: formatValue(analytics.essenceSpentBySource?.reforge || 0) },
        { label: "Essence Spent Ascends", value: formatValue(analytics.essenceSpentBySource?.ascends || 0) },
        { label: "Blocked Sell Equipped", value: formatValue(analytics.blockedSellEquippedAttempts || 0) },
        { label: "Blocked Extract Equipped", value: formatValue(analytics.blockedExtractEquippedAttempts || 0) },
      ],
    },
    {
      id: "snapshot",
      title: "Current Snapshot",
      rows: [
        { label: "Current Gold", value: formatValue(player.gold || 0) },
        { label: "Current Essence", value: formatValue(player.essence || 0) },
        { label: "Current Talent Points", value: formatValue(player.talentPoints || 0) },
        { label: "Talents Unlocked (current)", value: formatValue((player.unlockedTalents || []).length) },
        { label: "Talents Bought (session)", value: formatValue(analytics.talentsUnlocked || 0) },
        { label: "Talent Resets", value: formatValue(analytics.talentResets || 0) },
        { label: "Player Upgrades", value: formatValue(analytics.playerUpgradesPurchased || 0) },
        { label: "Prestiges", value: formatValue(analytics.prestigeCount) },
        { label: "Best Item Power", value: formatValue(Math.max(analytics.bestItemRating || 0, stats.bestItemRating || 0)) },
        { label: "Inventory Size", value: formatValue((player.inventory || []).length) },
        { label: "Gear Power", value: formatValue(gearRating) },
        { label: "Equipped Slots", value: `${equippedSlots}/2` },
        { label: "Equipped Affixes", value: formatValue(gearAffixes) },
        { label: "Weapon", value: weapon?.name || "-" },
        { label: "Armor", value: armor?.name || "-" },
        { label: "Weapon Implicit Sum", value: formatValue(sumValues(weapon?.implicitBonus)) },
        { label: "Armor Implicit Sum", value: formatValue(sumValues(armor?.implicitBonus)) },
        { label: "Current HP", value: `${formatValue(player.hp || 0)} / ${formatValue(player.maxHp || 0)}` },
        { label: "Current Damage", value: formatValue(currentStats.damage || 0) },
        { label: "Current Defense", value: formatValue(currentStats.defense || 0) },
        { label: "Current Crit Chance", value: `${formatValue((currentStats.critChance || 0) * 100)}%` },
        { label: "Prestige Echoes", value: formatValue(prestige.echoes || 0) },
      ],
    },
  ];

  return sections;
}

const KPI_STATUS = Object.freeze({
  ok: "OK",
  watch: "WATCH",
  risk: "RISK",
  pending: "PENDIENTE",
});

function getOnlineSecondsFromTelemetry(telemetry = {}) {
  return Math.max(
    0,
    Number(telemetry?.totalOnlineSeconds || 0) + Number(telemetry?.currentSessionSeconds || 0)
  );
}

function evaluateLowerBetter(value, { ok = 1, watch = 2 } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "pending";
  if (numeric <= ok) return "ok";
  if (numeric <= watch) return "watch";
  return "risk";
}

function evaluateHigherBetter(value, { ok = 0.8, watch = 0.5 } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "pending";
  if (numeric >= ok) return "ok";
  if (numeric >= watch) return "watch";
  return "risk";
}

function evaluateRange(value, { min = 0, max = 1, watchPadding = 0.2 } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "pending";
  if (numeric >= min && numeric <= max) return "ok";
  if (numeric >= Math.max(0, min - watchPadding) && numeric <= max + watchPadding) return "watch";
  return "risk";
}

function formatKpiStatus(status = "pending") {
  return KPI_STATUS[status] || KPI_STATUS.pending;
}

function withStatusSuffix(value, status = "pending") {
  return `${value} · ${formatKpiStatus(status)}`;
}

function stripKpiStatusSuffix(value = "") {
  return String(value || "").replace(/\s*·\s*(OK|WATCH|RISK|PENDIENTE)\s*$/u, "").trim();
}

function inferKpiStatus(value = "") {
  const match = String(value || "").match(/·\s*(OK|WATCH|RISK|PENDIENTE)\s*$/u);
  if (!match) return "pending";
  const token = String(match[1] || "").toUpperCase();
  if (token === "OK") return "ok";
  if (token === "WATCH") return "watch";
  if (token === "RISK") return "risk";
  return "pending";
}

function normalizeKpiRow(row = {}) {
  return {
    id: row?.id || "",
    label: row?.label || "-",
    value: row?.value || "-",
    status: row?.status || inferKpiStatus(row?.value),
    valueWithoutStatus: stripKpiStatusSuffix(row?.value || "-"),
  };
}

export function buildMvpKpiRows(state = {}) {
  const telemetry = sanitizeAccountTelemetry(state?.accountTelemetry || createEmptyAccountTelemetry());
  const stats = state?.stats || {};
  const onlineSeconds = getOnlineSecondsFromTelemetry(telemetry);

  const firstContractClaimSeconds = telemetry?.firstExpeditionContractClaimAtOnlineSeconds;
  const firstWeeklyClaimSeconds = telemetry?.firstWeeklyClaimAtOnlineSeconds;
  const avgSecondsPerContractClaim =
    Number(telemetry?.expeditionContractClaims || 0) > 0
      ? onlineSeconds / Math.max(1, Number(telemetry.expeditionContractClaims || 0))
      : 0;

  const weeklyContracts = getWeeklyLedgerContractsWithProgress(state, state?.weeklyLedger || {});
  const weeklyCompletedNow = weeklyContracts.filter(contract => contract?.progress?.completed).length;
  const weeklyClaimedNow = weeklyContracts.filter(contract => contract?.claimed).length;
  const weeklyClaimRateNow = ratio(weeklyClaimedNow, Math.max(1, weeklyCompletedNow));

  const itemsFound = Math.max(0, Number(stats?.itemsFound || 0));
  const overflowEvents = Math.max(0, Number(telemetry?.inventoryOverflowEvents || 0));
  const overflowRatePer100 = ratio(overflowEvents, Math.max(1, itemsFound)) * 100;
  const overflowLossShare = ratio(
    Math.max(0, Number(telemetry?.inventoryOverflowLost || 0)),
    Math.max(1, overflowEvents)
  );

  const totalExtracted = Math.max(0, Number(stats?.itemsExtracted || 0));
  const autoExtracted = Math.max(0, Number(stats?.autoExtractedItems || 0));
  const manualExtracted = Math.max(0, totalExtracted - autoExtracted);
  const autoExtractShare = ratio(autoExtracted, Math.max(1, totalExtracted));

  const weeklyStarts = Math.max(0, Number(telemetry?.weeklyBossEncountersStarted || 0));
  const weeklyWins = Math.max(0, Number(telemetry?.weeklyBossEncountersWon || 0));
  const weeklyLosses = Math.max(0, Number(telemetry?.weeklyBossEncountersLost || 0));
  const weeklyResolved = weeklyWins + weeklyLosses;
  const weeklyAbandon = Math.max(0, weeklyStarts - weeklyResolved);
  const weeklyWinRate = ratio(weeklyWins, Math.max(1, weeklyStarts));
  const weeklyAbandonRate = ratio(weeklyAbandon, Math.max(1, weeklyStarts));

  const expeditionStarts = Math.max(0, Number(telemetry?.expeditionCount || 0));
  const expeditionClosed = Math.max(0, Number(telemetry?.completedExpeditionCount || 0));
  const expeditionAbandon = Math.max(0, expeditionStarts - expeditionClosed);
  const expeditionAbandonRate = ratio(expeditionAbandon, Math.max(1, expeditionStarts));

  const rerollsPerExpedition = ratio(
    Math.max(0, Number(telemetry?.expeditionContractRerolls || 0)),
    Math.max(1, expeditionStarts)
  );

  const firstContractClaimStatus = evaluateLowerBetter(firstContractClaimSeconds, {
    ok: 45 * 60,
    watch: 120 * 60,
  });
  const firstWeeklyClaimStatus = evaluateLowerBetter(firstWeeklyClaimSeconds, {
    ok: 2 * 3600,
    watch: 6 * 3600,
  });
  const avgContractStatus = evaluateLowerBetter(avgSecondsPerContractClaim, {
    ok: 35 * 60,
    watch: 90 * 60,
  });
  const weeklyClaimStatus = weeklyCompletedNow > 0
    ? evaluateHigherBetter(weeklyClaimRateNow, { ok: 0.8, watch: 0.55 })
    : "pending";
  const overflowStatus = evaluateLowerBetter(overflowRatePer100, { ok: 6, watch: 12 });
  const overflowLossStatus = evaluateLowerBetter(overflowLossShare, { ok: 0.35, watch: 0.6 });
  const autoExtractStatus = evaluateRange(autoExtractShare, { min: 0.35, max: 0.85, watchPadding: 0.2 });
  const weeklyWinStatus = evaluateHigherBetter(weeklyWinRate, { ok: 0.45, watch: 0.25 });
  const weeklyAbandonStatus = evaluateLowerBetter(weeklyAbandonRate, { ok: 0.15, watch: 0.35 });
  const expeditionAbandonStatus = evaluateLowerBetter(expeditionAbandonRate, { ok: 0.25, watch: 0.45 });
  const rerollStatus = evaluateLowerBetter(rerollsPerExpedition, { ok: 0.9, watch: 1.6 });

  return [
    {
      id: "kpi_first_contract_claim",
      label: "Tiempo a 1er claim contrato",
      status: firstContractClaimStatus,
      value: withStatusSuffix(
        firstContractClaimSeconds != null ? formatDurationFromTicks(firstContractClaimSeconds) : "Pendiente",
        firstContractClaimStatus
      ),
    },
    {
      id: "kpi_avg_contract_claim",
      label: "Tiempo promedio por claim contrato",
      status: avgContractStatus,
      value: withStatusSuffix(
        Number(telemetry?.expeditionContractClaims || 0) > 0
          ? formatDurationFromTicks(avgSecondsPerContractClaim)
          : "Sin claims",
        avgContractStatus
      ),
    },
    {
      id: "kpi_first_weekly_claim",
      label: "Tiempo a 1er claim weekly",
      status: firstWeeklyClaimStatus,
      value: withStatusSuffix(
        firstWeeklyClaimSeconds != null ? formatDurationFromTicks(firstWeeklyClaimSeconds) : "Pendiente",
        firstWeeklyClaimStatus
      ),
    },
    {
      id: "kpi_weekly_claim_rate",
      label: "Claim rate weekly (actual)",
      status: weeklyClaimStatus,
      value: withStatusSuffix(
        weeklyCompletedNow > 0
          ? `${formatValue(weeklyClaimedNow)}/${formatValue(weeklyCompletedNow)} (${formatValue(weeklyClaimRateNow * 100)}%)`
          : "Sin weekly completadas",
        weeklyClaimStatus
      ),
    },
    {
      id: "kpi_inventory_overflow",
      label: "Overflow mochila / 100 drops",
      status: overflowStatus,
      value: withStatusSuffix(
        itemsFound > 0
          ? `${formatValue(overflowRatePer100)} (eventos: ${formatValue(overflowEvents)})`
          : "Sin drops",
        overflowStatus
      ),
    },
    {
      id: "kpi_inventory_overflow_loss",
      label: "Overflow perdido (share)",
      status: overflowLossStatus,
      value: withStatusSuffix(
        overflowEvents > 0
          ? `${formatValue(overflowLossShare * 100)}%`
          : "Sin overflow",
        overflowLossStatus
      ),
    },
    {
      id: "kpi_extract_manual_vs_auto",
      label: "Extraccion manual vs auto",
      status: autoExtractStatus,
      value: withStatusSuffix(
        totalExtracted > 0
          ? `manual ${formatValue(manualExtracted)} / auto ${formatValue(autoExtracted)} (${formatValue(autoExtractShare * 100)}% auto)`
          : "Sin extracciones",
        autoExtractStatus
      ),
    },
    {
      id: "kpi_weekly_boss_winrate",
      label: "Winrate weekly boss",
      status: weeklyWinStatus,
      value: withStatusSuffix(
        weeklyStarts > 0
          ? `${formatValue(weeklyWins)}/${formatValue(weeklyStarts)} (${formatValue(weeklyWinRate * 100)}%)`
          : "Sin intentos",
        weeklyWinStatus
      ),
    },
    {
      id: "kpi_weekly_boss_abandon",
      label: "Abandono weekly boss",
      status: weeklyAbandonStatus,
      value: withStatusSuffix(
        weeklyStarts > 0
          ? `${formatValue(weeklyAbandon)}/${formatValue(weeklyStarts)} (${formatValue(weeklyAbandonRate * 100)}%)`
          : "Sin intentos",
        weeklyAbandonStatus
      ),
    },
    {
      id: "kpi_expedition_abandon",
      label: "Abandono de run",
      status: expeditionAbandonStatus,
      value: withStatusSuffix(
        expeditionStarts > 0
          ? `${formatValue(expeditionAbandon)}/${formatValue(expeditionStarts)} (${formatValue(expeditionAbandonRate * 100)}%)`
          : "Sin expediciones",
        expeditionAbandonStatus
      ),
    },
    {
      id: "kpi_rerolls_per_expedition",
      label: "Rerolls por expedicion",
      status: rerollStatus,
      value: withStatusSuffix(
        expeditionStarts > 0 ? formatValue(rerollsPerExpedition) : "Sin expediciones",
        rerollStatus
      ),
    },
  ];
}

export function buildMvpKpiReport(state = {}) {
  const lines = [
    "IdleRPG MVP KPI Board",
    "====================",
  ];
  buildMvpKpiRows(state).forEach(row => {
    lines.push(`${row.label}: ${row.value}`);
  });
  return lines.join("\n");
}

function getWeeklyClaimSnapshot(state = {}) {
  const weeklyContracts = getWeeklyLedgerContractsWithProgress(state, state?.weeklyLedger || {});
  const completed = weeklyContracts.filter(contract => contract?.progress?.completed).length;
  const claimed = weeklyContracts.filter(contract => contract?.claimed).length;
  return {
    completed,
    claimed,
    rate: ratio(claimed, Math.max(1, completed)),
  };
}

function buildBalanceRiskRows(kpiRows = []) {
  const rows = kpiRows
    .filter(row => row.status === "risk" || row.status === "watch")
    .slice(0, 6)
    .map(row => ({
      label: row.label,
      value: `${row.valueWithoutStatus || "-"} · ${formatKpiStatus(row.status)}`,
    }));
  if (rows.length > 0) return rows;
  return [
    { label: "Estado global KPI", value: "Sin alertas activas · OK" },
    { label: "Siguiente paso", value: "Correr una sesion larga (20-30m) para validar estabilidad" },
  ];
}

export function buildBalanceTelemetrySections(state = {}) {
  const analytics = sanitizeSessionAnalytics(state?.combat?.analytics || createEmptySessionAnalytics());
  const telemetry = sanitizeAccountTelemetry(state?.accountTelemetry || createEmptyAccountTelemetry());
  const ticks = Math.max(0, Number(analytics.ticks || 0));
  const maxTier = analytics.maxTierReached || state?.combat?.maxTier || 1;
  const avgSession = telemetry.sessionCount > 0 ? telemetry.totalOnlineSeconds / telemetry.sessionCount : 0;
  const onlineSeconds = getOnlineSecondsFromTelemetry(telemetry);
  const autoProcessedItems = Math.max(0, Number(analytics.autoSoldItems || 0)) + Math.max(0, Number(analytics.autoExtractedItems || 0));
  const weeklySnapshot = getWeeklyClaimSnapshot(state);
  const kpiRows = buildMvpKpiRows(state).map(normalizeKpiRow);

  return [
    {
      id: "balance_session_core",
      title: "Balance Core · Sesion",
      rows: [
        { label: "Duracion sesion", value: formatDurationFromTicks(ticks) },
        { label: "Kills / Min", value: formatValue(perMinute(analytics.kills || 0, ticks)) },
        { label: "Deaths / Hour", value: formatValue(perHour(analytics.deaths || 0, ticks)) },
        { label: "Tier max alcanzado", value: formatValue(maxTier) },
        { label: "Advance / Ready Tick", value: asPercent(analytics.tierAdvanceCount || 0, analytics.couldAdvanceMoments || 0) },
        { label: "Gold / Min", value: formatValue(perMinute(analytics.goldEarned || 0, ticks)) },
        { label: "Essence / Min", value: formatValue(perMinute(analytics.essenceEarned || 0, ticks)) },
        { label: "Items / Min", value: formatValue(perMinute(analytics.itemsFound || 0, ticks)) },
        { label: "Auto-procesado drops", value: asPercent(autoProcessedItems, analytics.itemsFound || 0) },
        { label: "Equip improvements", value: formatValue(analytics.equippedUpgrades || 0) },
      ],
    },
    {
      id: "balance_account_core",
      title: "Balance Core · Cuenta",
      rows: [
        { label: "Sesiones", value: formatValue(telemetry.sessionCount || 0) },
        { label: "Online total", value: formatDurationFromTicks(onlineSeconds) },
        { label: "Sesion promedio", value: formatDurationFromTicks(avgSession) },
        { label: "Expediciones cerradas/iniciadas", value: `${formatValue(telemetry.completedExpeditionCount || 0)}/${formatValue(telemetry.expeditionCount || 0)}` },
        { label: "Contratos cobrados", value: formatValue(telemetry.expeditionContractClaims || 0) },
        { label: "Weeklies cobradas", value: formatValue(telemetry.weeklyLedgerClaims || 0) },
        {
          label: "Claim weekly (estado actual)",
          value: weeklySnapshot.completed > 0
            ? `${formatValue(weeklySnapshot.claimed)}/${formatValue(weeklySnapshot.completed)} (${formatValue(weeklySnapshot.rate * 100)}%)`
            : "Sin weeklies completadas",
        },
        { label: "Overflow mochila", value: formatValue(telemetry.inventoryOverflowEvents || 0) },
        { label: "Runtime recoveries", value: formatValue(telemetry.runtimeRecoveryCount || 0) },
      ],
    },
    {
      id: "balance_alerts",
      title: "Alertas KPI",
      rows: buildBalanceRiskRows(kpiRows),
    },
  ];
}

export function buildBalanceTelemetryEntries(state = {}) {
  return flattenSectionsToEntries(buildBalanceTelemetrySections(state));
}

export function buildBalanceTelemetryReport(state = {}) {
  const sections = buildBalanceTelemetrySections(state);
  const lines = [
    "IdleRPG Balance Telemetry",
    "========================",
    "Vista compacta para balance inteligente y entrenamiento de IA.",
  ];

  sections.forEach(section => {
    lines.push("");
    lines.push(section.title);
    lines.push("-".repeat(section.title.length));
    (section.rows || []).forEach(row => {
      lines.push(`${row.label}: ${row.value}`);
    });
  });

  return lines.join("\n");
}

export function buildBalanceTelemetryPayload(state = {}) {
  const player = state?.player || {};
  const combat = state?.combat || {};
  const telemetry = sanitizeAccountTelemetry(state?.accountTelemetry || createEmptyAccountTelemetry());
  const kpis = buildMvpKpiRows(state).map(normalizeKpiRow);

  return {
    version: 1,
    payloadKind: "compact",
    generatedAt: new Date().toISOString(),
    player: {
      class: player.class || "-",
      specialization: player.specialization || "-",
      level: Number(player.level || 1),
      currentTier: Number(combat.currentTier || 1),
      maxTier: Number(combat.maxTier || combat.analytics?.maxTierReached || 1),
    },
    account: {
      sessionCount: Number(telemetry.sessionCount || 0),
      totalOnlineSeconds: Number(getOnlineSecondsFromTelemetry(telemetry)),
      expeditionCount: Number(telemetry.expeditionCount || 0),
      expeditionContractClaims: Number(telemetry.expeditionContractClaims || 0),
      weeklyLedgerClaims: Number(telemetry.weeklyLedgerClaims || 0),
      forgeJobsStarted: Number(telemetry.forgeJobsStarted || 0),
      forgeJobsCompleted: Number(telemetry.forgeJobsCompleted || 0),
      forgeJobsRushed: Number(telemetry.forgeJobsRushed || 0),
      imbueJobsStarted: Number(telemetry.imbueJobsStarted || 0),
      imbueJobsCompleted: Number(telemetry.imbueJobsCompleted || 0),
      imbueJobsRushed: Number(telemetry.imbueJobsRushed || 0),
      inventoryOverflowEvents: Number(telemetry.inventoryOverflowEvents || 0),
    },
    kpis: kpis.map(row => ({
      id: row.id,
      label: row.label,
      status: row.status,
      value: row.valueWithoutStatus,
      valueWithStatus: row.value,
    })),
    sections: buildBalanceTelemetrySections(state),
  };
}

export function buildFullTelemetryPayload(state = {}) {
  const player = state?.player || {};
  const combat = state?.combat || {};
  const telemetry = sanitizeAccountTelemetry(state?.accountTelemetry || createEmptyAccountTelemetry());
  const sessionSections = buildSessionTelemetrySections(state);
  const accountSections = buildAccountTelemetrySections(state);
  const compactSections = buildBalanceTelemetrySections(state);
  const kpis = buildMvpKpiRows(state).map(normalizeKpiRow);

  return {
    version: 1,
    payloadKind: "full",
    generatedAt: new Date().toISOString(),
    player: {
      class: player.class || "-",
      specialization: player.specialization || "-",
      level: Number(player.level || 1),
      currentTier: Number(combat.currentTier || 1),
      maxTier: Number(combat.maxTier || combat.analytics?.maxTierReached || 1),
      gold: Number(player.gold || 0),
      essence: Number(player.essence || 0),
    },
    account: {
      sessionCount: Number(telemetry.sessionCount || 0),
      totalOnlineSeconds: Number(getOnlineSecondsFromTelemetry(telemetry)),
      totalOfflineSeconds: Number(telemetry.totalOfflineSeconds || 0),
      expeditionCount: Number(telemetry.expeditionCount || 0),
      completedExpeditionCount: Number(telemetry.completedExpeditionCount || 0),
      extractionCount: Number(telemetry.extractionCount || 0),
      expeditionContractClaims: Number(telemetry.expeditionContractClaims || 0),
      weeklyLedgerClaims: Number(telemetry.weeklyLedgerClaims || 0),
      forgeJobsStarted: Number(telemetry.forgeJobsStarted || 0),
      forgeJobsCompleted: Number(telemetry.forgeJobsCompleted || 0),
      forgeJobsRushed: Number(telemetry.forgeJobsRushed || 0),
      imbueJobsStarted: Number(telemetry.imbueJobsStarted || 0),
      imbueJobsCompleted: Number(telemetry.imbueJobsCompleted || 0),
      imbueJobsRushed: Number(telemetry.imbueJobsRushed || 0),
      inventoryOverflowEvents: Number(telemetry.inventoryOverflowEvents || 0),
      runtimeRecoveryCount: Number(telemetry.runtimeRecoveryCount || 0),
    },
    kpis: kpis.map(row => ({
      id: row.id,
      label: row.label,
      status: row.status,
      value: row.valueWithoutStatus,
      valueWithStatus: row.value,
    })),
    compact: {
      sections: compactSections,
      entries: flattenSectionsToEntries(compactSections),
      report: buildBalanceTelemetryReport(state),
    },
    session: {
      sections: sessionSections,
      entries: flattenSectionsToEntries(sessionSections),
      report: buildSessionTelemetryReport(state),
    },
    accountTelemetry: {
      sections: accountSections,
      entries: flattenSectionsToEntries(accountSections),
      report: buildAccountTelemetryReport(state),
    },
  };
}

export function buildAccountTelemetrySections(state) {
  const telemetry = sanitizeAccountTelemetry(state?.accountTelemetry || createEmptyAccountTelemetry());
  const avgSession = telemetry.sessionCount > 0 ? telemetry.totalOnlineSeconds / telemetry.sessionCount : 0;
  const avgExpedition =
    telemetry.completedExpeditionCount > 0
      ? telemetry.totalExpeditionLifecycleSeconds / telemetry.completedExpeditionCount
      : 0;
  const avgOffline = telemetry.offlineRecoveryCount > 0 ? telemetry.totalOfflineSeconds / telemetry.offlineRecoveryCount : 0;

  return [
    {
      id: "account_mvp_kpi",
      title: "MVP KPI Board",
      rows: buildMvpKpiRows(state).map(row => ({
        label: row.label,
        value: row.value,
      })),
    },
    {
      id: "account_time",
      title: "Cuenta y Tiempo",
      rows: [
        { label: "Primer uso", value: formatDateTime(telemetry.firstSeenAt) },
        { label: "Ultima actividad", value: formatDateTime(telemetry.lastActiveAt) },
        { label: "Sesiones", value: formatValue(telemetry.sessionCount) },
        { label: "Online total", value: formatDurationFromTicks(telemetry.totalOnlineSeconds) },
        { label: "Offline total", value: formatDurationFromTicks(telemetry.totalOfflineSeconds) },
        { label: "Offline promedio", value: formatDurationFromTicks(avgOffline) },
        { label: "Offline mas largo", value: formatDurationFromTicks(telemetry.longestOfflineSeconds) },
        { label: "Recuperaciones offline", value: formatValue(telemetry.offlineRecoveryCount) },
        { label: "Sesion actual", value: formatDurationFromTicks(telemetry.currentSessionSeconds) },
        { label: "Sesion promedio", value: formatDurationFromTicks(avgSession) },
        { label: "Sesion mas larga", value: formatDurationFromTicks(telemetry.longestSessionSeconds) },
      ],
    },
    {
      id: "account_phase",
      title: "Uso por Fase",
      rows: [
        { label: "Santuario", value: formatDurationFromTicks(telemetry.totalSanctuarySeconds) },
        { label: "Preparacion", value: formatDurationFromTicks(telemetry.totalSetupSeconds) },
        { label: "Expedicion activa", value: formatDurationFromTicks(telemetry.totalExpeditionSeconds) },
        { label: "Extraccion", value: formatDurationFromTicks(telemetry.totalExtractionSeconds) },
        { label: "Expediciones iniciadas", value: formatValue(telemetry.expeditionCount) },
        { label: "Expediciones cerradas", value: formatValue(telemetry.completedExpeditionCount) },
        { label: "Extracciones manuales", value: formatValue(telemetry.manualExtractionCount) },
        { label: "Extracciones con ecos", value: formatValue(telemetry.prestigeExtractionCount) },
        { label: "Duracion promedio expedicion", value: formatDurationFromTicks(avgExpedition) },
        { label: "Duracion maxima expedicion", value: formatDurationFromTicks(telemetry.longestExpeditionSeconds) },
      ],
    },
    {
      id: "account_milestones",
      title: "Hitos de Cuenta",
      rows: [
        { label: "Primera spec a", value: telemetry.firstSpecAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstSpecAtOnlineSeconds) : "-" },
        { label: "Extracciones", value: formatValue(telemetry.extractionCount) },
        { label: "Primer boss visto a", value: telemetry.firstBossAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstBossAtOnlineSeconds) : "-" },
        { label: "Primera extraccion a", value: telemetry.firstExtractionAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstExtractionAtOnlineSeconds) : "-" },
        { label: "Primer claim contrato a", value: telemetry.firstExpeditionContractClaimAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstExpeditionContractClaimAtOnlineSeconds) : "-" },
        { label: "Primer claim weekly a", value: telemetry.firstWeeklyClaimAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstWeeklyClaimAtOnlineSeconds) : "-" },
        { label: "Primer prestige a", value: telemetry.firstPrestigeAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstPrestigeAtOnlineSeconds) : "-" },
      ],
    },
    {
      id: "account_unlocks",
      title: "Unlocks del Santuario",
      rows: [
        { label: "Laboratorio a", value: telemetry.firstLaboratoryAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstLaboratoryAtOnlineSeconds) : "-" },
        { label: "Destileria a", value: telemetry.firstDistilleryAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstDistilleryAtOnlineSeconds) : "-" },
        { label: "Primer proyecto a", value: telemetry.firstBlueprintAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstBlueprintAtOnlineSeconds) : "-" },
        { label: "Forja Profunda a", value: telemetry.firstDeepForgeAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstDeepForgeAtOnlineSeconds) : "-" },
        { label: "Biblioteca a", value: telemetry.firstLibraryAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstLibraryAtOnlineSeconds) : "-" },
        { label: "Encargos a", value: telemetry.firstErrandsAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstErrandsAtOnlineSeconds) : "-" },
        { label: "Altar de Sigilos a", value: telemetry.firstSigilAltarAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstSigilAltarAtOnlineSeconds) : "-" },
        { label: "Portal al Abismo a", value: telemetry.firstAbyssPortalAtOnlineSeconds != null ? formatDurationFromTicks(telemetry.firstAbyssPortalAtOnlineSeconds) : "-" },
      ],
    },
    {
      id: "account_systems",
      title: "Uso de Sistemas",
      rows: [
        { label: "Destilerias iniciadas", value: formatValue(telemetry.distillJobsStarted) },
        { label: "Destilerias reclamadas", value: formatValue(telemetry.distillJobsCompleted) },
        { label: "Research Biblioteca iniciados", value: formatValue(telemetry.codexResearchStarted) },
        { label: "Research Biblioteca reclamados", value: formatValue(telemetry.codexResearchCompleted) },
        { label: "Research Laboratorio iniciados", value: formatValue(telemetry.labResearchStarted) },
        { label: "Research Laboratorio reclamados", value: formatValue(telemetry.labResearchCompleted) },
        { label: "Encargos iniciados", value: formatValue(telemetry.errandJobsStarted) },
        { label: "Encargos reclamados", value: formatValue(telemetry.errandJobsCompleted) },
        { label: "Infusiones de sigilo", value: formatValue(telemetry.sigilJobsStarted) },
        { label: "Infusiones reclamadas", value: formatValue(telemetry.sigilJobsCompleted) },
        { label: "Jobs de Taller iniciados", value: formatValue(telemetry.forgeJobsStarted) },
        { label: "Jobs de Taller reclamados", value: formatValue(telemetry.forgeJobsCompleted) },
        { label: "Jobs de Taller rusheados", value: formatValue(telemetry.forgeJobsRushed) },
        { label: "Imbuir iniciados", value: formatValue(telemetry.imbueJobsStarted) },
        { label: "Imbuir reclamados", value: formatValue(telemetry.imbueJobsCompleted) },
        { label: "Imbuir rusheados", value: formatValue(telemetry.imbueJobsRushed) },
        { label: "Contratos seleccionados", value: formatValue(telemetry.expeditionContractSelections) },
        { label: "Contratos rerolleados", value: formatValue(telemetry.expeditionContractRerolls) },
        { label: "Contratos completados", value: formatValue(telemetry.expeditionContractCompletions) },
        { label: "Contratos cobrados", value: formatValue(telemetry.expeditionContractClaims) },
        { label: "Weekly cobradas", value: formatValue(telemetry.weeklyLedgerClaims) },
        { label: "Overflow mochila", value: formatValue(telemetry.inventoryOverflowEvents) },
        { label: "Weekly boss iniciados", value: formatValue(telemetry.weeklyBossEncountersStarted) },
        { label: "Weekly boss ganados", value: formatValue(telemetry.weeklyBossEncountersWon) },
        { label: "Weekly boss perdidos", value: formatValue(telemetry.weeklyBossEncountersLost) },
        { label: "Weekly boss cobrados", value: formatValue(telemetry.weeklyBossRewardClaims) },
      ],
    },
    {
      id: "account_blueprints",
      title: "Proyectos y Save",
      rows: [
        { label: "Proyectos creados", value: formatValue(telemetry.blueprintsCreated) },
        { label: "Items rescatados desguazados", value: formatValue(telemetry.blueprintsScrapped) },
        { label: "Proyectos descartados", value: formatValue(telemetry.blueprintsDiscarded) },
        { label: "Estructuras reforzadas", value: formatValue(telemetry.blueprintStructureUpgrades) },
        { label: "Poderes sintonizados", value: formatValue(telemetry.blueprintPowerTunes) },
        { label: "Ascensiones", value: formatValue(telemetry.blueprintAscensions) },
        { label: "Reparaciones de save", value: formatValue(telemetry.saveRepairs) },
        { label: "Resets de cuenta", value: formatValue(telemetry.saveResets) },
        { label: "Runtime recoveries", value: formatValue(telemetry.runtimeRecoveryCount) },
        { label: "Runtime repairs", value: formatValue(telemetry.runtimeRepairCount) },
        { label: "Offline stalls recuperados", value: formatValue(telemetry.runtimeOfflineJobStallCount) },
        { label: "Ultima runtime recovery", value: telemetry.runtimeLastRecoveryAt ? formatDateTime(telemetry.runtimeLastRecoveryAt) : "-" },
        { label: "Ultimo motivo runtime", value: telemetry.runtimeLastRecoveryReason || "-" },
      ],
    },
  ];
}

export function buildAccountTelemetryEntries(state) {
  return flattenSectionsToEntries(buildAccountTelemetrySections(state));
}

export function buildAccountTelemetryReport(state) {
  return buildAccountTelemetrySections(state)
    .map(section => [
      section.title,
      "-".repeat(section.title.length),
      ...(section.rows || []).map(row => `${row.label}: ${row.value}`),
    ].join("\n"))
    .join("\n\n");
}

export function buildSessionTelemetryEntries(state) {
  return flattenSectionsToEntries(buildSessionTelemetrySections(state));
}

export function buildSessionTelemetryReport(state) {
  const sections = buildSessionTelemetrySections(state);
  const lines = [
    "IdleRPG Session Telemetry",
    "========================",
  ];

  sections.forEach(section => {
    lines.push("");
    lines.push(section.title);
    lines.push("-".repeat(section.title.length));
    (section.rows || []).forEach(row => {
      lines.push(`${row.label}: ${row.value}`);
    });
  });

  return lines.join("\n");
}
