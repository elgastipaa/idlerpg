const PUSH_WISHLIST = ["damage", "critChance", "critDamage", "attackSpeed", "multiHitChance", "bleedChance", "lifesteal", "defense", "healthMax"];
const CRIT_WISHLIST = ["critChance", "critDamage", "attackSpeed", "multiHitChance", "damage", "lifesteal", "bleedChance"];
const TANK_WISHLIST = ["defense", "healthMax", "healthRegen", "blockChance", "thorns", "fractureChance", "damage"];
const CASTER_WISHLIST = ["critDamage", "multiHitChance", "damage", "critChance", "markChance", "markEffectPerStack"];

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
  const presetId = lootRules?.huntPreset || null;
  const presetWishlist = resolveHuntPresetWishlist(presetId, { activeBuildTag, enemy });
  if (presetWishlist.length > 0) return presetWishlist;
  return [...(lootRules?.wishlistAffixes || [])];
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
