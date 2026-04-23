import { createSimulationSeedState } from "../stateInitializer";
import { gameReducer } from "../../state/gameReducer";
import { runBalanceBotSimulation } from "./balanceBot";

const PROFILE_OPTIONS = [
  { id: "berserker", label: "Warrior / Berserker", preferredClass: "warrior", preferredSpec: "berserker" },
  { id: "juggernaut", label: "Warrior / Juggernaut", preferredClass: "warrior", preferredSpec: "juggernaut" },
  { id: "sorcerer", label: "Mage / Sorcerer", preferredClass: "mage", preferredSpec: "sorcerer" },
  { id: "arcanist", label: "Mage / Arcanist", preferredClass: "mage", preferredSpec: "arcanist" },
];

function formatNumber(value) {
  if (value == null) return "-";
  if (typeof value !== "number") return String(value);
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 100) return Math.round(value).toLocaleString();
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatDurationFromTicks(ticks = 0) {
  if (ticks == null) return "-";
  const totalSeconds = Math.max(0, Math.floor(ticks));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function getNestedTierValue(map = {}, tier = 1, rarity = "common") {
  return Number(map?.[tier]?.[rarity] || 0);
}

function collectTierIds(results = []) {
  const tiers = new Set();
  results.forEach(result => {
    const analytics = result.finalState?.combat?.analytics || {};
    [
      analytics.timeInTier,
      analytics.killsByTier,
      analytics.itemsByTier,
      analytics.goldByTier,
      analytics.xpByTier,
      analytics.essenceByTier,
      analytics.readyToPushByTier,
      analytics.deathsByTier,
    ].forEach(map => {
      Object.keys(map || {}).forEach(key => tiers.add(Number(key)));
    });
  });

  return [...tiers].filter(Boolean).sort((a, b) => a - b);
}

function buildTierRows(results = []) {
  return collectTierIds(results).map(tier => {
    const rows = results.map(result => {
      const analytics = result.finalState?.combat?.analytics || {};
      const time = Number(analytics.timeInTier?.[tier] || 0);
      const items = Number(analytics.itemsByTier?.[tier] || 0);
      const rarePlus =
        getNestedTierValue(analytics.rarityByTier, tier, "rare") +
        getNestedTierValue(analytics.rarityByTier, tier, "epic") +
        getNestedTierValue(analytics.rarityByTier, tier, "legendary");

      return {
        time,
        kills: Number(analytics.killsByTier?.[tier] || 0),
        items,
        rarePlus,
        gold: Number(analytics.goldByTier?.[tier] || 0),
        xp: Number(analytics.xpByTier?.[tier] || 0),
        essence: Number(analytics.essenceByTier?.[tier] || 0),
        ready: Number(analytics.readyToPushByTier?.[tier] || 0),
        deaths: Number(analytics.deathsByTier?.[tier] || 0),
      };
    });

    const avgTime = average(rows.map(row => row.time));
    const avgItems = average(rows.map(row => row.items));
    const avgRarePlus = average(rows.map(row => row.rarePlus));

    return {
      tier,
      avgTime,
      avgKills: average(rows.map(row => row.kills)),
      avgItems,
      rarePlusRate: avgItems > 0 ? avgRarePlus / avgItems : 0,
      avgGold: average(rows.map(row => row.gold)),
      avgXp: average(rows.map(row => row.xp)),
      avgEssence: average(rows.map(row => row.essence)),
      avgReadyTicks: average(rows.map(row => row.ready)),
      avgDeaths: average(rows.map(row => row.deaths)),
    };
  });
}

function buildProfileSummary(profile, results = []) {
  const summaries = results.map(result => result.summary || {});
  const analyticsRows = results.map(result => result.finalState?.combat?.analytics || {});

  return {
    profileId: profile.id,
    profileLabel: profile.label,
    runs: results.length,
    avgFinalLevel: average(summaries.map(summary => summary.level || 0)),
    avgMaxTier: average(summaries.map(summary => summary.tier || 0)),
    avgGold: average(summaries.map(summary => summary.gold || 0)),
    avgEssence: average(summaries.map(summary => summary.essence || 0)),
    avgPrestigeLevel: average(summaries.map(summary => summary.prestigeLevel || 0)),
    avgEchoes: average(summaries.map(summary => summary.echoes || 0)),
    avgDeaths: average(analyticsRows.map(analytics => analytics.deaths || 0)),
    avgItems: average(analyticsRows.map(analytics => analytics.itemsFound || 0)),
    avgRarePlusRate: average(
      analyticsRows.map(analytics => {
        const items = Number(analytics.itemsFound || 0);
        const rarePlus = Number(analytics.rareItemsFound || 0) + Number(analytics.epicItemsFound || 0) + Number(analytics.legendaryItemsFound || 0);
        return items > 0 ? rarePlus / items : 0;
      })
    ),
    avgFirstBossTick: average(analyticsRows.map(analytics => analytics.firstBossKillTick || 0)),
    avgFirstRareTick: average(analyticsRows.map(analytics => analytics.firstRareTick || 0)),
    avgFirstEpicTick: average(analyticsRows.map(analytics => analytics.firstEpicTick || 0)),
    avgFirstLegendaryTick: average(analyticsRows.map(analytics => analytics.firstLegendaryTick || 0)),
    avgFirstPrestigeTick: average(analyticsRows.map(analytics => analytics.firstPrestigeTick || 0)),
    tierRows: buildTierRows(results),
    runSummaries: results.map((result, index) => ({
      run: index + 1,
      level: result.summary?.level || 0,
      tier: result.summary?.tier || 0,
      deaths: result.finalState?.combat?.analytics?.deaths || 0,
      gold: result.summary?.gold || 0,
      essence: result.summary?.essence || 0,
      bestDrop: result.summary?.bestDrop || "-",
      stagnation: result.summary?.stagnationReason || "-",
    })),
  };
}

function buildSimulationProfileSeed(profile) {
  const selectedClassState = gameReducer(createSimulationSeedState(), {
    type: "SELECT_CLASS",
    classId: profile.preferredClass,
    meta: { source: "simulation" },
  });

  return {
    ...selectedClassState,
    currentTab: "combat",
    expedition: {
      ...(selectedClassState.expedition || {}),
      phase: "setup",
    },
    combat: {
      ...selectedClassState.combat,
      pendingRunSetup: true,
      pendingRunSigilId: "free",
      pendingRunSigilIds: ["free"],
      activeRunSigilId: "free",
      activeRunSigilIds: ["free"],
    },
  };
}

export function runBalanceBatch(options = {}) {
  const runs = Math.max(1, Math.min(Number(options.runs || 5), 50));
  const ticks = Math.max(300, Math.min(Number(options.ticks || 3600), 21600));
  const onlyProfile = options.profile || null;
  const profiles = PROFILE_OPTIONS.filter(profile => !onlyProfile || profile.id === onlyProfile);

  const profileReports = profiles.map(profile => {
    const results = [];
    for (let run = 0; run < runs; run += 1) {
      const baseState = buildSimulationProfileSeed(profile);
      results.push(
        runBalanceBotSimulation(baseState, {
          ticks,
          preferredClass: profile.preferredClass,
          preferredSpec: profile.preferredSpec,
        })
      );
    }

    return buildProfileSummary(profile, results);
  });

  return {
    runs,
    ticks,
    profiles: profileReports,
  };
}

export function formatBalanceBatchReport(report) {
  const lines = [
    "IdleRPG Balance Batch",
    "====================",
    `Runs per profile: ${report.runs}`,
    `Ticks per run: ${report.ticks}`,
  ];

  report.profiles.forEach(profile => {
    lines.push("");
    lines.push(profile.profileLabel);
    lines.push("-".repeat(profile.profileLabel.length));
    lines.push(`Avg Final Level: ${formatNumber(profile.avgFinalLevel)}`);
    lines.push(`Avg Max Tier: ${formatNumber(profile.avgMaxTier)}`);
    lines.push(`Avg Deaths: ${formatNumber(profile.avgDeaths)}`);
    lines.push(`Avg Gold End: ${formatNumber(profile.avgGold)}`);
    lines.push(`Avg Essence End: ${formatNumber(profile.avgEssence)}`);
    lines.push(`Avg Prestige Level: ${formatNumber(profile.avgPrestigeLevel)}`);
    lines.push(`Avg Echoes End: ${formatNumber(profile.avgEchoes)}`);
    lines.push(`Avg Items Found: ${formatNumber(profile.avgItems)}`);
    lines.push(`Avg Rare+ Rate: ${formatNumber(profile.avgRarePlusRate * 100)}%`);
    lines.push(`Avg First Boss: ${profile.avgFirstBossTick > 0 ? formatDurationFromTicks(profile.avgFirstBossTick) : "-"}`);
    lines.push(`Avg First Rare: ${profile.avgFirstRareTick > 0 ? formatDurationFromTicks(profile.avgFirstRareTick) : "-"}`);
    lines.push(`Avg First Epic: ${profile.avgFirstEpicTick > 0 ? formatDurationFromTicks(profile.avgFirstEpicTick) : "-"}`);
    lines.push(`Avg First Legendary: ${profile.avgFirstLegendaryTick > 0 ? formatDurationFromTicks(profile.avgFirstLegendaryTick) : "-"}`);
    lines.push(`Avg First Prestige: ${profile.avgFirstPrestigeTick > 0 ? formatDurationFromTicks(profile.avgFirstPrestigeTick) : "-"}`);
    lines.push("");
    lines.push("Tier Table");
    lines.push("Tier | Time | Kills | Items | Rare+ | Gold | XP | Essence | Ready | Deaths");
    lines.push("---- | ---- | ----- | ----- | ----- | ---- | -- | ------- | ----- | ------");
    profile.tierRows.forEach(row => {
      lines.push(
        [
          row.tier,
          formatDurationFromTicks(row.avgTime),
          formatNumber(row.avgKills),
          formatNumber(row.avgItems),
          `${formatNumber(row.rarePlusRate * 100)}%`,
          formatNumber(row.avgGold),
          formatNumber(row.avgXp),
          formatNumber(row.avgEssence),
          formatNumber(row.avgReadyTicks),
          formatNumber(row.avgDeaths),
        ].join(" | ")
      );
    });
    lines.push("");
    lines.push("Run Samples");
    profile.runSummaries.forEach(summary => {
      lines.push(
        `#${summary.run} L${formatNumber(summary.level)} T${formatNumber(summary.tier)} · deaths ${formatNumber(summary.deaths)} · gold ${formatNumber(summary.gold)} · essence ${formatNumber(summary.essence)} · drop ${summary.bestDrop} · ${summary.stagnation}`
      );
    });
  });

  return lines.join("\n");
}
