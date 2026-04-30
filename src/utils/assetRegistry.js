const ASSET_ROOT = "/assets";

const ASSET_FALLBACK_ICONS = {
  item: "loot",
  icon: "stats",
  system: "stats",
  enemy: "combat",
  weeklyBoss: "combat",
  background: "combat",
  portrait: "hero",
  station: "sanctuary",
  skill: "talents",
  talent: "talents",
  echo: "echoes",
};

const STATION_ALIASES = {
  codex_research: "library",
  codexresearch: "library",
  deep_forge: "workshop",
  deepforge: "workshop",
  errand: "errands",
  infusions: "sigil_altar",
  relics: "relic_armory",
  relic_armory: "relic_armory",
  relicarmory: "relic_armory",
  sigil: "sigil_altar",
  sigil_altar: "sigil_altar",
  sigilaltar: "sigil_altar",
  sigil_infusion: "sigil_altar",
  sigilinfusion: "sigil_altar",
  sigils: "sigil_altar",
};

const SYSTEM_ICON_ALIASES = {
  abysskey: "abyss_key",
  codexresearch: "codex",
  crit: "crit_chance",
  critical: "crit_chance",
  deepforge: "forge",
  echo: "echoes",
  echoes: "echoes",
  errand: "errands",
  exp: "xp",
  experience: "xp",
  hp: "health",
  inventory: "inventory",
  library: "library",
  relicarmory: "relic_armory",
  sigilaltar: "sigil_altar",
  xp: "xp",
};

const ENEMY_ALIASES = {
  ancient_dragon: "enemy_ancient_dragon",
  brute_orc: "orc_brute",
  skeleton: "enemy_skeleton",
  wolf: "enemy_wolf",
};

const CLASS_PORTRAIT_ALIASES = {
  warrior_balanced: "warrior",
  warrior_equilibrado: "warrior",
};

function stripKnownPrefix(value, prefix) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function normalizeAssetSlug(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function assetPath(...parts) {
  return [ASSET_ROOT, ...parts].join("/");
}

function asset(kind, id, src, fallbackIcon = ASSET_FALLBACK_ICONS[kind] || "stats", extra = {}) {
  return {
    kind,
    id: id || "unknown",
    src,
    fallbackIcon,
    ...extra,
  };
}

export function getAssetFallbackIcon(kind) {
  return ASSET_FALLBACK_ICONS[kind] || "stats";
}

export function getItemAsset(item = {}) {
  const rawId = item?.itemId || item?.baseItemId || item?.templateId || item?.baseId || item?.id || item;
  const slug = stripKnownPrefix(normalizeAssetSlug(rawId), "item_");
  if (!slug) return asset("item", "unknown", "", "loot");
  return asset("item", slug, assetPath("items", `item_${slug}.png`), item?.type === "armor" ? "armor" : "loot", {
    rarity: item?.rarity || null,
  });
}

export function getSystemIconAsset(iconId = "") {
  const normalized = normalizeAssetSlug(iconId);
  const slug = SYSTEM_ICON_ALIASES[normalized] || stripKnownPrefix(normalized, "icon_");
  if (!slug) return asset("system", "unknown", "", "stats");
  return asset("system", slug, assetPath("icons", "system", `icon_${slug}.png`), slug);
}

export function getEnemyAsset(enemyId = "") {
  const normalized = normalizeAssetSlug(enemyId);
  const slug = ENEMY_ALIASES[normalized] || normalized;
  if (!slug) return asset("enemy", "unknown", "", "combat");
  return asset("enemy", slug, assetPath("combat", "enemies", `${slug}.png`), "combat");
}

export function getCombatBackgroundAsset(backgroundId = "ruinsForgotten") {
  const normalized = normalizeAssetSlug(backgroundId);
  const filename = normalized === "ruins_forgotten" || normalized === "ruinsforgotten"
    ? "ruinas_olvidadas"
    : normalized;
  return asset("background", filename, assetPath("combat", "backgrounds", `${filename}.png`), "combat");
}

export function getWeeklyBossAsset(bossId = "") {
  const slug = stripKnownPrefix(normalizeAssetSlug(bossId), "weekly_boss_");
  if (!slug) return asset("weeklyBoss", "unknown", "", "combat");
  return asset("weeklyBoss", slug, assetPath("combat", "weekly-bosses", `weekly_boss_${slug}.png`), "combat");
}

export function getClassPortraitAsset(classId = "") {
  const normalized = normalizeAssetSlug(classId);
  const slug = CLASS_PORTRAIT_ALIASES[normalized] || stripKnownPrefix(normalized, "portrait_");
  if (!slug) return asset("portrait", "unknown", "", "hero");
  return asset("portrait", slug, assetPath("portraits", "classes", `portrait_${slug}.png`), "hero");
}

export function getStationAsset(stationId = "") {
  const normalized = normalizeAssetSlug(stationId);
  const slug = STATION_ALIASES[normalized] || stripKnownPrefix(normalized, "station_");
  if (!slug) return asset("station", "unknown", "", "sanctuary");
  return asset("station", slug, assetPath("sanctuary", "stations", `station_${slug}.png`), "sanctuary");
}

export function getTalentAsset(talentId = "") {
  const slug = stripKnownPrefix(normalizeAssetSlug(talentId), "skill_");
  if (!slug) return asset("talent", "unknown", "", "talents");
  return asset("talent", slug, assetPath("skills", "talents", `skill_${slug}.png`), "talents");
}

export function getEchoAsset(echoId = "") {
  const slug = stripKnownPrefix(normalizeAssetSlug(echoId), "echo_");
  if (!slug) return asset("echo", "unknown", "", "echoes");
  return asset("echo", slug, assetPath("skills", "echoes", `echo_${slug}.png`), "echoes");
}

export function getForgeAsset(kind, value) {
  switch (kind) {
    case "item":
      return getItemAsset(value);
    case "icon":
    case "system":
      return getSystemIconAsset(value);
    case "enemy":
      return getEnemyAsset(value);
    case "background":
      return getCombatBackgroundAsset(value);
    case "weeklyBoss":
      return getWeeklyBossAsset(value);
    case "portrait":
      return getClassPortraitAsset(value);
    case "station":
      return getStationAsset(value);
    case "skill":
    case "talent":
      return getTalentAsset(value);
    case "echo":
      return getEchoAsset(value);
    default:
      return asset(kind || "asset", normalizeAssetSlug(value), "", getAssetFallbackIcon(kind));
  }
}
