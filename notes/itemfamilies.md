export const ITEM_FAMILIES = {

  // ══════════════════════════════════════════
  // WEAPONS
  // ══════════════════════════════════════════

  sword: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 8, max: 14 },
    extraBases: [
      { stat: "critChance",  weight: 40, range: { min: 0.02, max: 0.05 } },
      { stat: "attackSpeed", weight: 30, range: { min: 0.03, max: 0.06 } },
      { stat: "critDamage",  weight: 30, range: { min: 0.10, max: 0.25 } },
    ],
    implicitByRarity: {
      common:    { stat: "critChance",  value: 0.02 },
      magic:     { stat: "critChance",  value: 0.03 },
      rare:      { stat: "critChance",  value: 0.05 },
      epic:      { stat: "critChance",  value: 0.07 },
      legendary: { stat: "critChance",  value: 0.10 },
    },
    affinityCategories: ["offense", "crit"],
    preferredStats:    ["critChance", "critDamage", "attackSpeed"],
    discouragedStats:  ["healthRegen", "blockChance", "essenceBonus"],
  },

  axe: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 11, max: 19 },
    extraBases: [
      { stat: "damageOnKill", weight: 50, range: { min: 3,    max: 8    } },
      { stat: "critDamage",   weight: 30, range: { min: 0.10, max: 0.22 } },
      { stat: "thorns",       weight: 20, range: { min: 3,    max: 8    } },
    ],
    implicitByRarity: {
      common:    { stat: "damageOnKill", value: 3  },
      magic:     { stat: "damageOnKill", value: 6  },
      rare:      { stat: "damageOnKill", value: 10 },
      epic:      { stat: "damageOnKill", value: 16 },
      legendary: { stat: "damageOnKill", value: 24 },
    },
    affinityCategories: ["offense", "tempo"],
    preferredStats:    ["damage", "damageOnKill", "critDamage"],
    discouragedStats:  ["dodgeChance", "blockChance", "cooldownReduction"],
  },

  mace: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 9, max: 16 },
    extraBases: [
      { stat: "thorns",      weight: 50, range: { min: 4, max: 10 } },
      { stat: "defense",     weight: 30, range: { min: 3, max: 7  } },
      { stat: "healthRegen", weight: 20, range: { min: 1, max: 3  } },
    ],
    implicitByRarity: {
      common:    { stat: "thorns", value: 3  },
      magic:     { stat: "thorns", value: 6  },
      rare:      { stat: "thorns", value: 10 },
      epic:      { stat: "thorns", value: 16 },
      legendary: { stat: "thorns", value: 24 },
    },
    affinityCategories: ["offense", "survivability"],
    preferredStats:    ["damage", "thorns", "defense"],
    discouragedStats:  ["critChance", "attackSpeed", "lootBonus"],
  },

  dagger: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 5, max: 9 },
    extraBases: [
      { stat: "critChance",  weight: 50, range: { min: 0.03, max: 0.07 } },
      { stat: "attackSpeed", weight: 35, range: { min: 0.04, max: 0.09 } },
      { stat: "critDamage",  weight: 15, range: { min: 0.15, max: 0.30 } },
    ],
    implicitByRarity: {
      common:    { stat: "attackSpeed", value: 0.03 },
      magic:     { stat: "attackSpeed", value: 0.05 },
      rare:      { stat: "attackSpeed", value: 0.07 },
      epic:      { stat: "attackSpeed", value: 0.10 },
      legendary: { stat: "attackSpeed", value: 0.14 },
    },
    affinityCategories: ["crit", "tempo"],
    preferredStats:    ["critChance", "critDamage", "attackSpeed"],
    discouragedStats:  ["defense", "blockChance", "healthMax"],
  },

  spear: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 7, max: 13 },
    extraBases: [
      { stat: "critOnLowHp",  weight: 45, range: { min: 0.04, max: 0.09 } },
      { stat: "damageOnKill", weight: 35, range: { min: 2,    max: 6    } },
      { stat: "attackSpeed",  weight: 20, range: { min: 0.02, max: 0.05 } },
    ],
    implicitByRarity: {
      common:    { stat: "critOnLowHp", value: 0.03 },
      magic:     { stat: "critOnLowHp", value: 0.05 },
      rare:      { stat: "critOnLowHp", value: 0.08 },
      epic:      { stat: "critOnLowHp", value: 0.12 },
      legendary: { stat: "critOnLowHp", value: 0.18 },
    },
    affinityCategories: ["offense", "crit"],
    preferredStats:    ["damage", "critOnLowHp", "damageOnKill"],
    discouragedStats:  ["blockChance", "healthRegen", "essenceBonus"],
  },

  greatsword: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 14, max: 24 },
    extraBases: [
      { stat: "critDamage",  weight: 45, range: { min: 0.20, max: 0.45 } },
      { stat: "lifesteal",   weight: 35, range: { min: 0.02, max: 0.05 } },
      { stat: "attackSpeed", weight: 20, range: { min: 0.02, max: 0.04 } },
    ],
    implicitByRarity: {
      common:    { stat: "critDamage", value: 0.10 },
      magic:     { stat: "critDamage", value: 0.20 },
      rare:      { stat: "critDamage", value: 0.30 },
      epic:      { stat: "critDamage", value: 0.45 },
      legendary: { stat: "critDamage", value: 0.65 },
    },
    affinityCategories: ["offense", "crit"],
    preferredStats:    ["damage", "critDamage", "lifesteal"],
    discouragedStats:  ["dodgeChance", "blockChance", "lootBonus"],
  },

  staff: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 6, max: 11 },
    extraBases: [
      { stat: "skillPower",        weight: 50, range: { min: 0.08, max: 0.18 } },
      { stat: "cooldownReduction", weight: 30, range: { min: 0.05, max: 0.10 } },
      { stat: "critChance",        weight: 20, range: { min: 0.02, max: 0.05 } },
    ],
    implicitByRarity: {
      common:    { stat: "skillPower", value: 0.05 },
      magic:     { stat: "skillPower", value: 0.08 },
      rare:      { stat: "skillPower", value: 0.12 },
      epic:      { stat: "skillPower", value: 0.18 },
      legendary: { stat: "skillPower", value: 0.26 },
    },
    affinityCategories: ["utility", "tempo"],
    preferredStats:    ["skillPower", "cooldownReduction", "damage"],
    discouragedStats:  ["thorns", "blockChance", "healthMax"],
  },

  hammer: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 12, max: 20 },
    extraBases: [
      { stat: "defense",     weight: 40, range: { min: 4,    max: 9    } },
      { stat: "thorns",      weight: 35, range: { min: 5,    max: 12   } },
      { stat: "healthMax",   weight: 25, range: { min: 15,   max: 35   } },
    ],
    implicitByRarity: {
      common:    { stat: "thorns", value: 4  },
      magic:     { stat: "thorns", value: 8  },
      rare:      { stat: "thorns", value: 13 },
      epic:      { stat: "thorns", value: 20 },
      legendary: { stat: "thorns", value: 30 },
    },
    affinityCategories: ["offense", "survivability"],
    preferredStats:    ["damage", "thorns", "defense"],
    discouragedStats:  ["critChance", "attackSpeed", "lootBonus"],
  },

  // ══════════════════════════════════════════
  // ARMORS
  // ══════════════════════════════════════════

  plate: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 8, max: 14 },
    extraBases: [
      { stat: "healthMax",   weight: 50, range: { min: 20, max: 50 } },
      { stat: "blockChance", weight: 30, range: { min: 0.03, max: 0.07 } },
      { stat: "thorns",      weight: 20, range: { min: 3, max: 8  } },
    ],
    implicitByRarity: {
      common:    { stat: "healthMax", value: 15  },
      magic:     { stat: "healthMax", value: 30  },
      rare:      { stat: "healthMax", value: 50  },
      epic:      { stat: "healthMax", value: 80  },
      legendary: { stat: "healthMax", value: 120 },
    },
    affinityCategories: ["survivability", "defense"],
    preferredStats:    ["defense", "healthMax", "blockChance"],
    discouragedStats:  ["critChance", "attackSpeed", "lootBonus"],
  },

  mail: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 5, max: 10 },
    extraBases: [
      { stat: "healthRegen",  weight: 50, range: { min: 1, max: 4  } },
      { stat: "healthMax",    weight: 30, range: { min: 15, max: 35 } },
      { stat: "essenceBonus", weight: 20, range: { min: 1, max: 3  } },
    ],
    implicitByRarity: {
      common:    { stat: "healthRegen", value: 1 },
      magic:     { stat: "healthRegen", value: 2 },
      rare:      { stat: "healthRegen", value: 4 },
      epic:      { stat: "healthRegen", value: 6 },
      legendary: { stat: "healthRegen", value: 9 },
    },
    affinityCategories: ["survivability", "economy"],
    preferredStats:    ["defense", "healthRegen", "healthMax"],
    discouragedStats:  ["critChance", "attackSpeed", "skillPower"],
  },

  leather: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 3, max: 7 },
    extraBases: [
      { stat: "dodgeChance", weight: 50, range: { min: 0.03, max: 0.07 } },
      { stat: "attackSpeed", weight: 30, range: { min: 0.02, max: 0.05 } },
      { stat: "luck",        weight: 20, range: { min: 3, max: 8  } },
    ],
    implicitByRarity: {
      common:    { stat: "dodgeChance", value: 0.03 },
      magic:     { stat: "dodgeChance", value: 0.05 },
      rare:      { stat: "dodgeChance", value: 0.08 },
      epic:      { stat: "dodgeChance", value: 0.12 },
      legendary: { stat: "dodgeChance", value: 0.18 },
    },
    affinityCategories: ["utility", "tempo"],
    preferredStats:    ["dodgeChance", "attackSpeed", "luck"],
    discouragedStats:  ["blockChance", "thorns", "healthMax"],
  },

  robe: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 2, max: 5 },
    extraBases: [
      { stat: "skillPower",        weight: 40, range: { min: 0.06, max: 0.14 } },
      { stat: "cooldownReduction", weight: 35, range: { min: 0.04, max: 0.09 } },
      { stat: "xpBonus",           weight: 25, range: { min: 0.05, max: 0.12 } },
    ],
    implicitByRarity: {
      common:    { stat: "skillPower", value: 0.04 },
      magic:     { stat: "skillPower", value: 0.07 },
      rare:      { stat: "skillPower", value: 0.11 },
      epic:      { stat: "skillPower", value: 0.16 },
      legendary: { stat: "skillPower", value: 0.23 },
    },
    affinityCategories: ["utility", "economy"],
    preferredStats:    ["skillPower", "cooldownReduction", "xpBonus"],
    discouragedStats:  ["thorns", "blockChance", "critChance"],
  },

  cloak: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 4, max: 8 },
    extraBases: [
      { stat: "luck",      weight: 40, range: { min: 4, max: 10 } },
      { stat: "lootBonus", weight: 35, range: { min: 0.04, max: 0.09 } },
      { stat: "xpBonus",   weight: 25, range: { min: 0.04, max: 0.10 } },
    ],
    implicitByRarity: {
      common:    { stat: "lootBonus", value: 0.03 },
      magic:     { stat: "lootBonus", value: 0.05 },
      rare:      { stat: "lootBonus", value: 0.08 },
      epic:      { stat: "lootBonus", value: 0.12 },
      legendary: { stat: "lootBonus", value: 0.18 },
    },
    affinityCategories: ["economy", "utility"],
    preferredStats:    ["luck", "lootBonus", "xpBonus"],
    discouragedStats:  ["thorns", "blockChance", "critChance"],
  },

  shield_vest: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 6, max: 12 },
    extraBases: [
      { stat: "blockChance", weight: 55, range: { min: 0.04, max: 0.09 } },
      { stat: "healthMax",   weight: 30, range: { min: 18, max: 40 } },
      { stat: "thorns",      weight: 15, range: { min: 4, max: 9  } },
    ],
    implicitByRarity: {
      common:    { stat: "blockChance", value: 0.04 },
      magic:     { stat: "blockChance", value: 0.06 },
      rare:      { stat: "blockChance", value: 0.09 },
      epic:      { stat: "blockChance", value: 0.13 },
      legendary: { stat: "blockChance", value: 0.18 },
    },
    affinityCategories: ["survivability", "defense"],
    preferredStats:    ["blockChance", "defense", "healthMax"],
    discouragedStats:  ["critChance", "attackSpeed", "lootBonus"],
  },

  heavy_vest: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 10, max: 18 },
    extraBases: [
      { stat: "healthMax",   weight: 45, range: { min: 25, max: 60 } },
      { stat: "healthRegen", weight: 35, range: { min: 2, max: 5  } },
      { stat: "thorns",      weight: 20, range: { min: 4, max: 10 } },
    ],
    implicitByRarity: {
      common:    { stat: "defense", value: 3  },
      magic:     { stat: "defense", value: 6  },
      rare:      { stat: "defense", value: 10 },
      epic:      { stat: "defense", value: 16 },
      legendary: { stat: "defense", value: 24 },
    },
    affinityCategories: ["survivability", "defense"],
    preferredStats:    ["defense", "healthMax", "healthRegen"],
    discouragedStats:  ["attackSpeed", "lootBonus", "skillPower"],
  },
};