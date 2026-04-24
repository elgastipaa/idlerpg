const PUSH_WISHLIST = ["damage", "critChance", "critDamage", "attackSpeed", "multiHitChance", "bleedChance", "lifesteal", "defense", "healthMax"];
const CRIT_WISHLIST = ["critChance", "critDamage", "attackSpeed", "multiHitChance", "damage", "lifesteal", "bleedChance"];
const TANK_WISHLIST = ["defense", "healthMax", "healthRegen", "blockChance", "thorns", "fractureChance", "damage"];
const CASTER_WISHLIST = ["critDamage", "multiHitChance", "damage", "critChance", "markChance", "markEffectPerStack"];
export const VALID_LOOT_RARITIES = ["common", "magic", "rare", "epic", "legendary"];
const VALID_LOOT_RARITIES_SET = new Set(VALID_LOOT_RARITIES);
const VALID_HUNT_PRESET_IDS = new Set(["build", "enemy", "crit", "tank", "caster"]);

const ENEMY_FAMILY_WISHLISTS = {
  ooze: ["healthMax", "healthRegen", "defense", "thorns", "fractureChance"],
  raider: ["attackSpeed", "multiHitChance", "critChance", "damage", "dodgeChance"],
  beast: ["attackSpeed", "multiHitChance", "lifesteal", "critChance", "bleedChance", "healthMax"],
  undead: ["damageOnKill", "thorns", "healthRegen", "defense"],
  orc: ["damage", "attackSpeed", "multiHitChance", "healthMax", "critChance"],
  knight: ["defense", "blockChance", "healthMax", "damage"],
  cultist: ["critDamage", "multiHitChance", "critChance", "damage", "markChance", "markEffectPerStack"],
  demon: ["lifesteal", "critDamage", "bleedChance", "bleedDamage", "damage", "damageOnKill"],
  construct: ["defense", "blockChance", "fractureChance", "thorns", "healthMax"],
  occult: ["critDamage", "multiHitChance", "critChance", "markChance", "markEffectPerStack"],
  elemental: ["critDamage", "multiHitChance", "critChance", "markChance", "markEffectPerStack"],
  dragon: ["damage", "critChance", "critDamage", "multiHitChance", "healthMax"],
};

export const AVAILABLE_HUNT_STATS = [
  "damage",
  "attackSpeed",
  "critChance",
  "critDamage",
  "multiHitChance",
  "bleedChance",
  "bleedDamage",
  "fractureChance",
  "lifesteal",
  "defense",
  "healthMax",
  "healthRegen",
  "blockChance",
  "dodgeChance",
  "thorns",
  "goldBonus",
  "xpBonus",
  "essenceBonus",
  "lootBonus",
  "luck",
  "markChance",
  "markEffectPerStack",
  "damageOnKill",
];
const AVAILABLE_HUNT_STATS_SET = new Set(AVAILABLE_HUNT_STATS);

function sanitizeRarityList(values = []) {
  if (!Array.isArray(values)) return [];
  return [...new Set(
    values
      .map(entry => String(entry || "").toLowerCase())
      .filter(entry => VALID_LOOT_RARITIES_SET.has(entry))
  )];
}

function sanitizeWishlist(values = []) {
  if (!Array.isArray(values)) return [];
  return [...new Set(
    values
      .map(entry => String(entry || ""))
      .filter(entry => AVAILABLE_HUNT_STATS_SET.has(entry))
  )];
}

export function sanitizeLootRules(lootRules = {}, fallback = {}) {
  const base = {
    autoSellRarities: [],
    autoExtractRarities: [],
    huntPreset: null,
    wishlistAffixes: [],
    protectHuntedDrops: true,
    protectUpgradeDrops: true,
    minVisibleRarity: "common",
    ...(fallback || {}),
    ...(lootRules || {}),
  };

  const autoExtractRarities = sanitizeRarityList(base.autoExtractRarities);
  const autoExtractSet = new Set(autoExtractRarities);
  const autoSellRarities = sanitizeRarityList(base.autoSellRarities)
    .filter(rarity => !autoExtractSet.has(rarity));
  const minVisibleRarity = VALID_LOOT_RARITIES_SET.has(base.minVisibleRarity)
    ? base.minVisibleRarity
    : "common";
  const huntPreset = VALID_HUNT_PRESET_IDS.has(base.huntPreset) ? base.huntPreset : null;
  const wishlistAffixes = sanitizeWishlist(base.wishlistAffixes);

  return {
    autoSellRarities,
    autoExtractRarities,
    huntPreset,
    wishlistAffixes,
    protectHuntedDrops: base.protectHuntedDrops !== false,
    protectUpgradeDrops: base.protectUpgradeDrops !== false,
    minVisibleRarity,
  };
}

export function summarizeLootRuleAutomation(lootRules = {}) {
  const rules = sanitizeLootRules(lootRules);
  const sections = [];

  if (rules.autoSellRarities.length > 0) {
    sections.push(`Vende ${rules.autoSellRarities.map(rarity => rarity.toUpperCase()).join("/")}`);
  }
  if (rules.autoExtractRarities.length > 0) {
    sections.push(`Extrae ${rules.autoExtractRarities.map(rarity => rarity.toUpperCase()).join("/")}`);
  }
  if (sections.length === 0) {
    sections.push("Sin automatizacion por rareza");
  }

  return sections.join(" · ");
}

export function getBuildWishlist(activeBuildTag) {
  const buildId = String(activeBuildTag?.id || "").toLowerCase();
  if (buildId.includes("iron_conversion")) return ["defense", "healthMax", "blockChance", "damage", "fractureChance"];
  if (buildId.includes("crushing_weight")) return ["damage", "critChance", "critDamage", "healthMax", "attackSpeed"];
  if (buildId.includes("blood_strikes")) return ["bleedChance", "bleedDamage", "damage", "multiHitChance", "attackSpeed", "lifesteal"];
  if (buildId.includes("combat_flow")) return ["damage", "attackSpeed", "multiHitChance", "healthMax", "lifesteal", "critChance"];
  if (buildId.includes("blood_debt")) return ["lifesteal", "attackSpeed", "multiHitChance", "damage", "bleedChance"];
  if (buildId.includes("frenzied_chain")) return ["multiHitChance", "fractureChance", "bleedChance", "bleedDamage", "attackSpeed", "damage"];
  if (buildId.includes("last_breath")) return ["damage", "critChance", "critDamage", "lifesteal", "healthMax", "bleedChance"];
  if (buildId.includes("unmoving_mountain")) return ["defense", "healthMax", "blockChance", "fractureChance", "damage"];
  if (buildId.includes("spiked_bastion")) return ["thorns", "defense", "blockChance", "fractureChance", "healthMax"];
  if (buildId.includes("titanic_momentum")) return ["defense", "healthRegen", "blockChance", "damage", "healthMax"];
  if (buildId.includes("juggernaut") || buildId.includes("baluarte") || buildId.includes("espinado")) return TANK_WISHLIST;
  if (buildId.includes("sangrante")) return ["bleedChance", "bleedDamage", "multiHitChance", "damage", "critChance", "lifesteal"];
  if (buildId.includes("tactico") || buildId.includes("caster")) return CASTER_WISHLIST;
  return PUSH_WISHLIST;
}

export function getEnemyWishlist(enemy) {
  if (!enemy) return [];
  if (Array.isArray(enemy?.favoredStats) && enemy.favoredStats.length > 0) {
    return [...enemy.favoredStats];
  }
  return [...(ENEMY_FAMILY_WISHLISTS[enemy?.family] || [])];
}

export function resolveHuntPresetWishlist(presetId, { activeBuildTag = null, enemy = null } = {}) {
  switch (presetId) {
    case "build":
      return getBuildWishlist(activeBuildTag);
    case "enemy":
      return getEnemyWishlist(enemy);
    case "crit":
      return CRIT_WISHLIST;
    case "tank":
      return TANK_WISHLIST;
    case "caster":
      return CASTER_WISHLIST;
    default:
      return [];
  }
}

export function resolveLootRuleWishlist(lootRules = {}, { activeBuildTag = null, enemy = null } = {}) {
  const sanitizedRules = sanitizeLootRules(lootRules);
  const presetId = sanitizedRules.huntPreset || null;
  const presetWishlist = resolveHuntPresetWishlist(presetId, { activeBuildTag, enemy });
  if (presetWishlist.length > 0) return presetWishlist;
  return [...sanitizedRules.wishlistAffixes];
}

export function getHuntProfiles({ activeBuildTag = null, enemy = null } = {}) {
  return [
    {
      id: "build",
      label: "Build",
      wishlistAffixes: getBuildWishlist(activeBuildTag),
    },
    {
      id: "enemy",
      label: "Enemigo",
      wishlistAffixes: getEnemyWishlist(enemy),
    },
    {
      id: "crit",
      label: "Crit",
      wishlistAffixes: CRIT_WISHLIST,
    },
    {
      id: "tank",
      label: "Tanque",
      wishlistAffixes: TANK_WISHLIST,
    },
    {
      id: "caster",
      label: "Caster",
      wishlistAffixes: CASTER_WISHLIST,
    },
  ];
}
