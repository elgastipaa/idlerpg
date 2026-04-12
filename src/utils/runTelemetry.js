import { calcStats } from "../engine/combat/statEngine";

export function createEmptySessionAnalytics() {
  return {
    ticks: 0,
    kills: 0,
    bossKills: 0,
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
    fusesCrafted: 0,
    talentsUnlocked: 0,
    talentResets: 0,
    playerUpgradesPurchased: 0,
    prestigeCount: 0,
    manualSkillsUsed: 0,
    autoSkillCasts: 0,
    autoSkillBonusDamage: 0,
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
    },
    essenceBySource: {
      combat: 0,
      goals: 0,
      extract: 0,
      autoExtract: 0,
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
  };
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
  const stats = state?.stats || {};
  const prestige = state?.prestige || {};
  const weapon = player?.equipment?.weapon || null;
  const armor = player?.equipment?.armor || null;
  const gearRating = (weapon?.rating || 0) + (armor?.rating || 0);
  const gearAffixes = (weapon?.affixes?.length || 0) + (armor?.affixes?.length || 0);
  const equippedSlots = Number(!!weapon) + Number(!!armor);
  const ticks = analytics.ticks || 0;
  const currentStats = calcStats(player);

  const rarePlus = (analytics.rareItemsFound || 0) + (analytics.epicItemsFound || 0) + (analytics.legendaryItemsFound || 0);
  const epicPlus = (analytics.epicItemsFound || 0) + (analytics.legendaryItemsFound || 0);
  const autoProcessedItems = (analytics.autoSoldItems || 0) + (analytics.autoExtractedItems || 0);
  const maxTier = analytics.maxTierReached || combat.maxTier || 1;
  const currentTier = combat.currentTier || 1;
  const currentLevel = player.level || 1;
  const maxLevel = analytics.maxLevelReached || player.level || 1;
  const levelGapFromPeak = Math.max(0, maxLevel - currentLevel);
  const tierGapFromPeak = Math.max(0, maxTier - currentTier);

  const sections = [
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
        { label: "Perfect Affixes", value: formatValue(analytics.perfectRollsFound) },
        { label: "Perfect Affixes / Item", value: asPercent(analytics.perfectRollsFound || 0, analytics.itemsFound || 0) },
        { label: "T1 Affixes", value: formatValue(analytics.t1AffixesFound) },
        { label: "T1 Affix Rate", value: asPercent(analytics.t1AffixesFound || 0, Math.max(1, analytics.itemsFound || 0)) },
        { label: "Tier 1 Rare Found", value: formatValue(getNestedTierValue(analytics.rarityByTier, 1, "rare")) },
        { label: "Highest Tier Rare Found", value: formatValue(getNestedTierValue(analytics.rarityByTier, maxTier, "rare")) },
        { label: "First Rare At", value: analytics.firstRareTick != null ? formatDurationFromTicks(analytics.firstRareTick) : "-" },
        { label: "First Epic At", value: analytics.firstEpicTick != null ? formatDurationFromTicks(analytics.firstEpicTick) : "-" },
        { label: "First Legendary At", value: analytics.firstLegendaryTick != null ? formatDurationFromTicks(analytics.firstLegendaryTick) : "-" },
        { label: "Best Drop", value: analytics.bestDropName || "-" },
        { label: "Best Drop Rarity", value: analytics.bestDropRarity || "-" },
        { label: "Best Drop Highlight", value: analytics.bestDropHighlight || "-" },
        { label: "Best Drop Perfects", value: formatValue(analytics.bestDropPerfectRolls) },
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
        { label: "Craft Rerolls", value: formatValue(analytics.rerollsCrafted) },
        { label: "Craft Polishes", value: formatValue(analytics.polishesCrafted || 0) },
        { label: "Craft Reforges", value: formatValue(analytics.reforgesCrafted || 0) },
        { label: "Craft Ascends", value: formatValue(analytics.ascendsCrafted) },
        { label: "Craft Fuses", value: formatValue(analytics.fusesCrafted) },
        { label: "Equip Improvements", value: formatValue(analytics.equippedUpgrades || 0) },
        { label: "Gold Spent Upgrades", value: formatValue(analytics.goldSpentBySource?.upgrades || 0) },
        { label: "Gold Spent Player Upg", value: formatValue(analytics.goldSpentBySource?.playerUpgrades || 0) },
        { label: "Gold Spent Rerolls", value: formatValue(analytics.goldSpentBySource?.rerolls || 0) },
        { label: "Gold Spent Polish", value: formatValue(analytics.goldSpentBySource?.polish || 0) },
        { label: "Gold Spent Reforge", value: formatValue(analytics.goldSpentBySource?.reforge || 0) },
        { label: "Gold Spent Ascends", value: formatValue(analytics.goldSpentBySource?.ascends || 0) },
        { label: "Essence Spent Rerolls", value: formatValue(analytics.essenceSpentBySource?.rerolls || 0) },
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
        { label: "Manual Skills Used", value: formatValue(analytics.manualSkillsUsed) },
        { label: "Auto Skill Casts", value: formatValue(analytics.autoSkillCasts) },
        { label: "Auto Skill Bonus Damage", value: formatValue(analytics.autoSkillBonusDamage) },
        { label: "Best Item Rating", value: formatValue(Math.max(analytics.bestItemRating || 0, stats.bestItemRating || 0)) },
        { label: "Inventory Size", value: formatValue((player.inventory || []).length) },
        { label: "Gear Rating", value: formatValue(gearRating) },
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
