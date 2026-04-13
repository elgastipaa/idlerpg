const PUSH_WISHLIST = ["damage", "critChance", "critDamage", "attackSpeed", "lifesteal", "defense", "healthMax"];
const CRIT_WISHLIST = ["critChance", "critDamage", "attackSpeed", "damage", "lifesteal"];
const TANK_WISHLIST = ["defense", "healthMax", "healthRegen", "blockChance", "thorns", "damage"];
const SKILL_WISHLIST = ["skillPower", "cooldownReduction", "damage", "critChance"];

const ENEMY_FAMILY_WISHLISTS = {
  ooze: ["healthMax", "healthRegen", "defense", "thorns"],
  raider: ["attackSpeed", "critChance", "damage", "dodgeChance"],
  beast: ["attackSpeed", "lifesteal", "critChance", "healthMax"],
  undead: ["damageOnKill", "thorns", "healthRegen", "defense"],
  orc: ["damage", "attackSpeed", "healthMax", "critChance"],
  knight: ["defense", "blockChance", "healthMax", "damage"],
  cultist: ["skillPower", "cooldownReduction", "critChance", "damage"],
  demon: ["lifesteal", "critDamage", "damage", "damageOnKill"],
  construct: ["defense", "blockChance", "thorns", "healthMax"],
  occult: ["skillPower", "cooldownReduction", "lootBonus", "critChance"],
  elemental: ["skillPower", "cooldownReduction", "critDamage", "critChance"],
  dragon: ["damage", "critChance", "critDamage", "healthMax", "skillPower"],
};

export const AVAILABLE_HUNT_STATS = [
  "damage",
  "attackSpeed",
  "critChance",
  "critDamage",
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
  "cooldownReduction",
  "skillPower",
  "damageOnKill",
];

export function getBuildWishlist(activeBuildTag) {
  const buildId = String(activeBuildTag?.id || "").toLowerCase();
  if (buildId.includes("juggernaut") || buildId.includes("baluarte") || buildId.includes("espinado")) return TANK_WISHLIST;
  if (buildId.includes("tactico") || buildId.includes("skill")) return SKILL_WISHLIST;
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
    case "skill":
      return SKILL_WISHLIST;
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
      id: "skill",
      label: "Skill",
      wishlistAffixes: SKILL_WISHLIST,
    },
  ];
}
