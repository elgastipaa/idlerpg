REWORK DE ÍTEMS — PROPUESTA IMPLEMENTABLE

1. TABLA DE FAMILIAS POR SLOT
WEAPONS
jsexport const WEAPON_FAMILIES = {
  sword: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 8, max: 14 },   // a progTier 1, escala con tier
    extraBases: [                              // solo Epic (2B) y Legendary (3B)
      { stat: "critChance",  weight: 40, range: { min: 0.02, max: 0.05 } },
      { stat: "attackSpeed", weight: 30, range: { min: 0.03, max: 0.06 } },
      { stat: "critDamage",  weight: 30, range: { min: 0.10, max: 0.25 } },
    ],
    implicit: "critChance",
    implicitByRarity: {
      common:    0.02,
      magic:     0.03,
      rare:      0.05,
      epic:      0.07,
      legendary: 0.10,
    },
    affinityCategories: ["offense", "crit"],
  },

  axe: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 10, max: 18 },   // más daño que sword
    extraBases: [
      { stat: "damageOnKill", weight: 50, range: { min: 3, max: 8   } },
      { stat: "critDamage",   weight: 30, range: { min: 0.10, max: 0.20 } },
      { stat: "thorns",       weight: 20, range: { min: 3, max: 7   } },
    ],
    implicit: "damageOnKill",
    implicitByRarity: {
      common:    3,
      magic:     6,
      rare:      10,
      epic:      16,
      legendary: 24,
    },
    affinityCategories: ["offense", "tempo"],
  },

  mace: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 9, max: 15 },
    extraBases: [
      { stat: "thorns",      weight: 50, range: { min: 4, max: 10  } },
      { stat: "defense",     weight: 30, range: { min: 3, max: 7   } },
      { stat: "healthRegen", weight: 20, range: { min: 1, max: 3   } },
    ],
    implicit: "thorns",
    implicitByRarity: {
      common:    3,
      magic:     6,
      rare:      10,
      epic:      16,
      legendary: 24,
    },
    affinityCategories: ["offense", "survivability"],
  },

  dagger: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 5, max: 9 },     // bajo daño base
    extraBases: [
      { stat: "critChance",  weight: 50, range: { min: 0.03, max: 0.07 } },
      { stat: "attackSpeed", weight: 35, range: { min: 0.04, max: 0.08 } },
      { stat: "critDamage",  weight: 15, range: { min: 0.15, max: 0.30 } },
    ],
    implicit: "attackSpeed",
    implicitByRarity: {
      common:    0.03,
      magic:     0.05,
      rare:      0.07,
      epic:      0.10,
      legendary: 0.14,
    },
    affinityCategories: ["crit", "tempo"],
  },

  spear: {
    slot: "weapon",
    primaryBase: "damage",
    primaryBaseRange: { min: 7, max: 13 },
    extraBases: [
      { stat: "critOnLowHp", weight: 45, range: { min: 0.04, max: 0.08 } },
      { stat: "damageOnKill",weight: 35, range: { min: 2, max: 6    } },
      { stat: "attackSpeed", weight: 20, range: { min: 0.02, max: 0.05 } },
    ],
    implicit: "critOnLowHp",
    implicitByRarity: {
      common:    0.03,
      magic:     0.05,
      rare:      0.08,
      epic:      0.12,
      legendary: 0.18,
    },
    affinityCategories: ["offense", "crit"],
  },
};
ARMORS
jsexport const ARMOR_FAMILIES = {
  plate: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 8, max: 14 },
    extraBases: [
      { stat: "healthMax",   weight: 50, range: { min: 20, max: 50  } },
      { stat: "blockChance", weight: 30, range: { min: 0.03, max: 0.07 } },
      { stat: "thorns",      weight: 20, range: { min: 3, max: 8    } },
    ],
    implicit: "healthMax",
    implicitByRarity: {
      common:    15,
      magic:     30,
      rare:      50,
      epic:      80,
      legendary: 120,
    },
    affinityCategories: ["survivability", "defense"],
  },

  mail: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 5, max: 10 },
    extraBases: [
      { stat: "healthRegen", weight: 50, range: { min: 1, max: 4   } },
      { stat: "healthMax",   weight: 30, range: { min: 15, max: 35  } },
      { stat: "essenceBonus",weight: 20, range: { min: 1, max: 3   } },
    ],
    implicit: "healthRegen",
    implicitByRarity: {
      common:    1,
      magic:     2,
      rare:      4,
      epic:      6,
      legendary: 9,
    },
    affinityCategories: ["survivability", "economy"],
  },

  leather: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 3, max: 7 },     // baja defensa
    extraBases: [
      { stat: "dodgeChance", weight: 50, range: { min: 0.03, max: 0.07 } },
      { stat: "attackSpeed", weight: 30, range: { min: 0.02, max: 0.05 } },
      { stat: "luck",        weight: 20, range: { min: 3, max: 8    } },
    ],
    implicit: "dodgeChance",
    implicitByRarity: {
      common:    0.03,
      magic:     0.05,
      rare:      0.08,
      epic:      0.12,
      legendary: 0.18,
    },
    affinityCategories: ["utility", "tempo"],
  },

  robe: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 2, max: 5 },
    extraBases: [
      { stat: "skillPower",        weight: 40, range: { min: 0.05, max: 0.12 } },
      { stat: "cooldownReduction", weight: 35, range: { min: 0.04, max: 0.08 } },
      { stat: "xpBonus",           weight: 25, range: { min: 0.05, max: 0.12 } },
    ],
    implicit: "skillPower",
    implicitByRarity: {
      common:    0.04,
      magic:     0.07,
      rare:      0.11,
      epic:      0.16,
      legendary: 0.22,
    },
    affinityCategories: ["utility", "economy"],
  },

  cloak: {
    slot: "armor",
    primaryBase: "defense",
    primaryBaseRange: { min: 4, max: 8 },
    extraBases: [
      { stat: "luck",       weight: 40, range: { min: 4, max: 10  } },
      { stat: "lootBonus",  weight: 35, range: { min: 0.04, max: 0.08 } },
      { stat: "xpBonus",    weight: 25, range: { min: 0.04, max: 0.10 } },
    ],
    implicit: "lootBonus",
    implicitByRarity: {
      common:    0.03,
      magic:     0.05,
      rare:      0.08,
      epic:      0.12,
      legendary: 0.18,
    },
    affinityCategories: ["economy", "utility"],
  },
};
Cómo se usan las bases extra en Epic y Legendary
js// En materializeItem():
function rollBases(family, rarity) {
  const bases = [{ stat: family.primaryBase, value: rollRange(family.primaryBaseRange) }];

  // Epic: 1 base extra
  if (rarity === "epic" || rarity === "legendary") {
    const extra = weightedPick(family.extraBases, usedStats=[family.primaryBase]);
    bases.push({ stat: extra.stat, value: rollRange(extra.range) });
  }

  // Legendary: 2 bases extra (nunca el mismo stat)
  if (rarity === "legendary") {
    const usedStats = bases.map(b => b.stat);
    const extra2 = weightedPick(family.extraBases, usedStats);
    if (extra2) bases.push({ stat: extra2.stat, value: rollRange(extra2.range) });
  }

  return bases;
}

2. POOL DE AFFIXES
Prefixes (weapons)
jsexport const WEAPON_PREFIXES = [
  {
    id: "wp_damage",
    stat: "damage", scaling: "flat",
    tiers: {
      3: { range: [3,  6 ], weight: 55, minTier: 1  },
      2: { range: [7,  14], weight: 25, minTier: 4  },
      1: { range: [18, 30], weight: 8,  minTier: 8  },
    },
    excludeIfBaseHas: [],           // damage puede coexistir como affix
    // (la base da damage siempre, el affix es bonus adicional — está permitido)
  },
  {
    id: "wp_crit_chance",
    stat: "critChance", scaling: "percent",
    tiers: {
      3: { range: [0.01, 0.02], weight: 50, minTier: 1  },
      2: { range: [0.03, 0.06], weight: 22, minTier: 5  },
      1: { range: [0.08, 0.13], weight: 7,  minTier: 10 },
    },
    excludeIfImplicitIs: ["critChance"], // soft: bajar weight a 20% si implicit es critChance
  },
  {
    id: "wp_crit_damage",
    stat: "critDamage", scaling: "percent",
    tiers: {
      3: { range: [0.10, 0.20], weight: 45, minTier: 3  },
      2: { range: [0.25, 0.45], weight: 20, minTier: 7  },
      1: { range: [0.60, 1.00], weight: 6,  minTier: 12 },
    },
    excludeIfImplicitIs: [],
  },
  {
    id: "wp_attack_speed",
    stat: "attackSpeed", scaling: "percent",
    tiers: {
      3: { range: [0.02, 0.04], weight: 45, minTier: 2  },
      2: { range: [0.05, 0.09], weight: 20, minTier: 6  },
      1: { range: [0.12, 0.18], weight: 6,  minTier: 11 },
    },
    excludeIfImplicitIs: ["attackSpeed"],
  },
  {
    id: "wp_lifesteal",
    stat: "lifesteal", scaling: "percent",
    tiers: {
      3: { range: [0.01, 0.02], weight: 40, minTier: 3  },
      2: { range: [0.03, 0.06], weight: 18, minTier: 7  },
      1: { range: [0.08, 0.14], weight: 5,  minTier: 12 },
    },
  },
  {
    id: "wp_thorns",
    stat: "thorns", scaling: "flat",
    tiers: {
      3: { range: [2,  5 ], weight: 40, minTier: 2  },
      2: { range: [6,  12], weight: 18, minTier: 6  },
      1: { range: [14, 24], weight: 5,  minTier: 11 },
    },
    excludeIfImplicitIs: ["thorns"],
  },
];
Suffixes (weapons)
jsexport const WEAPON_SUFFIXES = [
  {
    id: "ws_damage_on_kill",
    stat: "damageOnKill", scaling: "flat",
    tiers: {
      3: { range: [2,  5 ], weight: 50, minTier: 2  },
      2: { range: [6,  12], weight: 22, minTier: 6  },
      1: { range: [14, 24], weight: 7,  minTier: 11 },
    },
    excludeIfImplicitIs: ["damageOnKill"],
  },
  {
    id: "ws_crit_on_low_hp",
    stat: "critOnLowHp", scaling: "percent",
    tiers: {
      3: { range: [0.03, 0.05], weight: 40, minTier: 4  },
      2: { range: [0.07, 0.11], weight: 18, minTier: 8  },
      1: { range: [0.14, 0.22], weight: 5,  minTier: 13 },
    },
    excludeIfImplicitIs: ["critOnLowHp"],
  },
  {
    id: "ws_xp_bonus",
    stat: "xpBonus", scaling: "percent",
    tiers: {
      3: { range: [0.04, 0.07], weight: 45, minTier: 1  },
      2: { range: [0.09, 0.15], weight: 20, minTier: 5  },
      1: { range: [0.20, 0.35], weight: 6,  minTier: 10 },
    },
  },
  {
    id: "ws_gold_bonus",
    stat: "goldBonus", scaling: "flat",
    tiers: {
      3: { range: [3,  7 ], weight: 45, minTier: 1  },
      2: { range: [8,  16], weight: 20, minTier: 5  },
      1: { range: [20, 35], weight: 6,  minTier: 10 },
    },
  },
  {
    id: "ws_skill_power",
    stat: "skillPower", scaling: "percent",
    tiers: {
      3: { range: [0.05, 0.09], weight: 35, minTier: 4  },
      2: { range: [0.12, 0.20], weight: 16, minTier: 8  },
      1: { range: [0.28, 0.45], weight: 5,  minTier: 13 },
    },
  },
];
Prefixes (armors)
jsexport const ARMOR_PREFIXES = [
  {
    id: "ap_defense",
    stat: "defense", scaling: "flat",
    tiers: {
      3: { range: [3,  6 ], weight: 55, minTier: 1  },
      2: { range: [7,  14], weight: 25, minTier: 4  },
      1: { range: [18, 30], weight: 8,  minTier: 9  },
    },
  },
  {
    id: "ap_health_max",
    stat: "healthMax", scaling: "flat",
    tiers: {
      3: { range: [12, 22 ], weight: 55, minTier: 1  },
      2: { range: [28, 55 ], weight: 25, minTier: 5  },
      1: { range: [75, 130], weight: 8,  minTier: 10 },
    },
    excludeIfImplicitIs: ["healthMax"],
  },
  {
    id: "ap_dodge",
    stat: "dodgeChance", scaling: "percent",
    tiers: {
      3: { range: [0.01, 0.03], weight: 45, minTier: 2  },
      2: { range: [0.04, 0.07], weight: 20, minTier: 6  },
      1: { range: [0.09, 0.14], weight: 6,  minTier: 11 },
    },
    excludeIfImplicitIs: ["dodgeChance"],
  },
  {
    id: "ap_block",
    stat: "blockChance", scaling: "percent",
    tiers: {
      3: { range: [0.02, 0.04], weight: 45, minTier: 2  },
      2: { range: [0.05, 0.09], weight: 20, minTier: 6  },
      1: { range: [0.12, 0.20], weight: 6,  minTier: 11 },
    },
  },
  {
    id: "ap_health_regen",
    stat: "healthRegen", scaling: "flat",
    tiers: {
      3: { range: [1, 2 ], weight: 50, minTier: 1  },
      2: { range: [3, 6 ], weight: 22, minTier: 4  },
      1: { range: [8, 14], weight: 7,  minTier: 9  },
    },
    excludeIfImplicitIs: ["healthRegen"],
  },
];
Suffixes (armors)
jsexport const ARMOR_SUFFIXES = [
  {
    id: "as_luck",
    stat: "luck", scaling: "flat",
    tiers: {
      3: { range: [3,  8 ], weight: 45, minTier: 2  },
      2: { range: [9,  18], weight: 20, minTier: 6  },
      1: { range: [22, 38], weight: 6,  minTier: 11 },
    },
  },
  {
    id: "as_essence_bonus",
    stat: "essenceBonus", scaling: "flat",
    tiers: {
      3: { range: [1, 2 ], weight: 45, minTier: 3  },
      2: { range: [3, 5 ], weight: 20, minTier: 7  },
      1: { range: [7, 12], weight: 6,  minTier: 12 },
    },
    excludeIfImplicitIs: ["essenceBonus"],
  },
  {
    id: "as_xp_bonus",
    stat: "xpBonus", scaling: "percent",
    tiers: {
      3: { range: [0.04, 0.07], weight: 45, minTier: 1  },
      2: { range: [0.09, 0.15], weight: 20, minTier: 5  },
      1: { range: [0.20, 0.35], weight: 6,  minTier: 10 },
    },
  },
  {
    id: "as_cooldown_reduction",
    stat: "cooldownReduction", scaling: "percent",
    tiers: {
      3: { range: [0.03, 0.06], weight: 38, minTier: 4  },
      2: { range: [0.08, 0.14], weight: 17, minTier: 8  },
      1: { range: [0.18, 0.28], weight: 5,  minTier: 13 },
    },
  },
  {
    id: "as_loot_bonus",
    stat: "lootBonus", scaling: "percent",
    tiers: {
      3: { range: [0.03, 0.06], weight: 35, minTier: 3  },
      2: { range: [0.07, 0.13], weight: 16, minTier: 7  },
      1: { range: [0.18, 0.30], weight: 5,  minTier: 12 },
    },
    excludeIfImplicitIs: ["lootBonus"],
  },
];

3. REGLAS ANTI-SNOWBALL
Caps absolutos en statEngine
jsexport const STAT_CAPS = {
  critChance:          0.75,
  dodgeChance:         0.50,
  blockChance:         0.60,
  attackSpeed:         0.70,
  lifesteal:           0.30,
  cooldownReduction:   0.50,
  lootBonus:           0.80,
  skillPower:          1.00,
  xpBonus:             1.00,
  // sin cap: damage, defense, healthMax, healthRegen, thorns, goldBonus, luck
};

// Aplicar en calcStats:
function applyCaps(stats) {
  for (const [stat, cap] of Object.entries(STAT_CAPS)) {
    if (stats[stat] !== undefined) {
      stats[stat] = Math.min(stats[stat], cap);
    }
  }
  return stats;
}
Límites de % por item (anti-stacking dentro del mismo item)
jsexport const PER_ITEM_PCT_LIMITS = {
  critChance:        0.18,  // máximo de crit% en un solo item (todas las fuentes)
  attackSpeed:       0.22,  // máximo de speed% en un solo item
  dodgeChance:       0.20,
  blockChance:       0.22,
  lifesteal:         0.18,
  cooldownReduction: 0.35,
  skillPower:        0.55,
};

// Aplicar al generar el item — si el total acumulado en el item
// supera el límite, bajar el rolled value del último affix
// hasta que el total quede en el límite.

function applyPerItemLimits(bases, implicit, affixes) {
  const totalByPctStat = {};

  // Acumular de bases
  for (const base of bases) {
    if (PER_ITEM_PCT_LIMITS[base.stat]) {
      totalByPctStat[base.stat] = (totalByPctStat[base.stat] || 0) + base.value;
    }
  }

  // Acumular implicit
  for (const [stat, val] of Object.entries(implicit)) {
    if (PER_ITEM_PCT_LIMITS[stat]) {
      totalByPctStat[stat] = (totalByPctStat[stat] || 0) + val;
    }
  }

  // Acumular affixes con clamp
  for (const affix of affixes) {
    if (PER_ITEM_PCT_LIMITS[affix.stat]) {
      const limit     = PER_ITEM_PCT_LIMITS[affix.stat];
      const current   = totalByPctStat[affix.stat] || 0;
      const available = Math.max(0, limit - current);
      affix.rolledValue = Math.min(affix.rolledValue, available);
      totalByPctStat[affix.stat] = current + affix.rolledValue;
    }
  }

  return affixes;
}
Soft bias por familia para affixes
js// En el roll de affixes, si el stat ya está presente via implicit,
// reducir el weight del affix al 20% (no eliminar — es soft bias, no hard lock)

function getAdjustedWeight(affix, implicit, existingStats) {
  let weight = getWeightForTier(affix, currentTier);

  // Penalizar si implicit ya da el mismo stat
  const implicitStat = Object.keys(implicit)[0];
  if (affix.stat === implicitStat) weight = Math.floor(weight * 0.20);

  // Eliminar si el stat ya está en otra fuente del mismo item
  if (existingStats.includes(affix.stat)) return 0;

  return weight;
}

4. CURVA DE COSTOS DE CRAFTING
Fórmulas
jsconst RARITY_TIER = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };

export const CRAFTING_COST_FORMULAS = {

  upgrade: {
    gold:    (itemLvl, rarityTier) => Math.floor(80 * itemLvl * Math.pow(1.3, rarityTier - 1)),
    essence: () => 0,
    failChance: (itemLvl) => Math.min(0.45, 0.04 * itemLvl),
    // Nivel 1: 4%, Nivel 5: 20%, Nivel 10: 40%
  },

  reroll: {
    gold:    (rarityTier, useCount) =>
      Math.floor(60 * Math.pow(1.5, rarityTier - 1) * Math.pow(1.08, useCount)),
    essence: (rarityTier) => 4 * rarityTier,
    // useCount = veces que ya se hizo reroll en este item
    // Evita spam de reroll ilimitado sin penalizar los primeros usos
  },

  polish: {
    gold:    (affixTier) => [100, 60, 30][affixTier - 1], // T1=100, T2=60, T3=30
    essence: (affixTier) => [8,   4,  2 ][affixTier - 1],
    // Polish de T1 es más caro — es el más valioso de afinar
  },

  reforge: {
    gold:    (affixTier, rarityTier) =>
      Math.floor(150 * (4 - affixTier) * Math.pow(1.4, rarityTier - 1)),
    essence: (affixTier) => 8 * (4 - affixTier),
    // Cambiar un T1 cuesta menos gold que cambiar un T3
    // (T3 es barato de cambiar porque nadie lo quiere, T1 es caro)
    // NOTA: esto parece invertido pero es intencional
    //       reforjar un T1 = barato porque el jugador YA tiene valor
    //       reforjar un T3 = caro porque el jugador quiere mejorar
  },

  ascend: {
    gold:    (rarityTier) => Math.floor(400 * Math.pow(2.2, rarityTier - 1)),
    essence: (rarityTier) => 25 * rarityTier,
    // common→magic=400g/25es, epic→legendary≈4800g/100es
  },
};
Tabla de costos ejemplo (upgrade, por nivel y rareza)
UPGRADE — Gold cost por nivel de item:

Nivel  Common  Magic   Rare    Epic    Legendary
  1      80     104     135     176     229
  2     160     208     270     352     458
  3     240     312     405     528     687
  4     320     416     540     704     916
  5     400     520     675     880    1145
  6     480     624     810    1056    1374
  7     560     728     945    1232    1603
  8     640     832    1080    1408    1832
  9     720     936    1215    1584    2061
 10     800    1040    1350    1760    2290

Acumulado (1→10):
       4400    5720    7425    9680   12598

Fail chance por nivel: 4%/8%/12%/16%/20%/24%/28%/32%/36%/40%
Tabla de costos reroll (gold + essence, por rareza y uso)
REROLL — Gold cost (useCount acumulado en ese item):

         Common  Magic  Rare  Epic  Legend
1er uso    60     90    135   203    304
2do uso    65     97    146   219    329
3er uso    70    105    157   237    355
5to uso    81    122    183   274    411
10mo uso  119    179    269   403    605
20mo uso  258    387    581   871   1307

Essence (fijo por rareza): 4 / 8 / 12 / 16 / 20

5. MÉTRICAS PARA VALIDAR BALANCE EN PRODUCCIÓN
js// Trackear en state.stats — sin backend, solo localStorage

export const BALANCE_METRICS = {

  // LOOT QUALITY
  avgRatingAtEquip:        0,  // rating promedio del item al momento de equiparlo
  upgradeRateByRarity: {       // % de drops de esa rareza que terminan equipados
    common: 0, magic: 0, rare: 0, epic: 0, legendary: 0,
  },
  tierAtFirstEpic:         0,  // en qué tier cayó el primer épico

  // CRAFTING USAGE
  craftActionsByType: {        // total de cada operación
    upgrade: 0, reroll: 0, polish: 0, reforge: 0, ascend: 0, fuse: 0,
  },
  avgRerollsPerItem:       0,  // si es > 8, el pool de affixes es malo
  avgUpgradesPerItem:      0,  // si es < 3, upgrade no se siente útil

  // POWER PROGRESSION
  avgPlayerDamageByTier:   {},  // { "5": 180, "10": 450 } — validar curva
  avgDefenseByTier:        {},
  deathRateByTier:         {},  // si es 0 en todo tier, el juego es muy fácil

  // STAT DISTRIBUTION
  mostCommonAffixOnEquipped: {}, // qué affixes terminan equipados más frecuentemente
  // Si "damage flat" aparece en 90%+ de items equipados = pool muy sesgado

  // ANTI-INFLATION
  inventoryFullEvents:     0,  // veces que el inventario llegó a cap
  avgGoldAtTier:           {},  // si escala muy rápido = sinks insuficientes
};
Alertas de balance a monitorear:
avgRerollsPerItem > 8   → pool de affixes muy chico o muy sesgado
upgradeRateByRarity.rare < 0.15 → los raros no se sienten útiles
deathRateByTier[N] == 0 para N < maxTier → juego muy fácil en ese tramo
avgPlayerDamageByTier[T] > POWER_CURVE[T].playerDamage * 1.4 → power creep
mostCommonAffixOnEquipped[X] > 0.6 → un stat domina todo, revisar pool

6. RIESGOS Y MITIGACIONES
RIESGO 1 — Bases extra de Epic/Legendary stacking con affixes del mismo stat
  Ejemplo: dagger legendary con critChance en extraBase + affix critChance
  MITIGACIÓN: la regla anti-duplicado se aplica ANTES de rollEar affixes
              existingStats incluye tanto primaryBase como extraBases

RIESGO 2 — Soft bias insuficiente — el jugador siempre encuentra critChance
           en daggers aunque tenga implicit de critChance
  MITIGACIÓN: weight reducido al 20% si implicit coincide con el stat
              Monitorear con mostCommonAffixOnEquipped

RIESGO 3 — Reforge demasiado barato para T3 → spam para llegar a T1 indirectamente
  MITIGACIÓN: useCount en reforge también acumula (misma fórmula que reroll)
              Agregar cooldown de reforge por item (no en tiempo, en costos)

RIESGO 4 — Caps per-item cortando valores en Legendary de forma notable
           El jugador siente que el cap "roba" el valor del affix
  MITIGACIÓN: mostrar en la UI cuando un valor fue limitado por cap
              "Limitado: 0.18 (cap de item)" en lugar de mostrar el valor cortado sin aviso

RIESGO 5 — Implicit demasiado fuerte en Legendary vs affix pool
           Si implicit legendary de sword da 0.10 critChance y el mejor affix T1
           da 0.13, el implicit compite directamente con el mejor affix
  MITIGACIÓN: los implicits dan stats que NO compiten directamente con los mejores
              affixes — implicit es "identidad base", affix es "optimización"
              Revisar que implicit Legendary no supere el valor T2 del mismo stat

RIESGO 6 — Costos de crafting desbalanceados por cambio de rarityTier
           Un Ascend epic→legendary cuesta 4800g pero el jugador puede tener
           millones de gold en late game
  MITIGACIÓN: los costos de Ascend en late game deberían requerir también
              Crafting Mastery level mínimo (feature futura)
              Por ahora: monitorear avgGoldAtTier y ajustar

PLAN DE IMPLEMENTACIÓN — 3 FASES
FASE 1 — Data y Schema (Semana 1, sin romper saves)
Archivos a modificar:
src/data/itemFamilies.js
  → Agregar extraBases[] con pesos por familia
  → Verificar que implicitByRarity esté completo para todas las rarezas

src/data/affixes.js
  → Agregar campo excludeIfImplicitIs a todos los affixes relevantes
  → Agregar campo minTier a todos los tiers de affixes
  → Unificar PREFIXES y SUFFIXES en un solo AFFIX_POOL con slot: "prefix"|"suffix"

src/engine/combat/statEngine.js
  → Agregar STAT_CAPS y applyCaps() al final de calcStats()
  → No cambia el cálculo base — solo agrega el clamp al final

src/utils/loot.js
  → En materializeItem(), llamar rollBases() para Epic y Legendary
  → Los items Common/Magic/Rare no cambian
  → Los items generados nuevos tienen el nuevo formato
  → Los items viejos no se tocan (compatibilidad hacia atrás)
Criterio de done: los nuevos drops de Epic/Legendary tienen bases extra correctas. Los caps de stats se aplican. No se rompen saves existentes.

FASE 2 — Anti-duplicados y Pool Ajustado (Semana 2)
Archivos a modificar:
src/engine/affixesEngine.js
  → rollAffixes(): agregar existingStats que incluya bases + implicit + affixes ya rolleados
  → getAdjustedWeight(): implementar soft bias por implicit
  → Agregar applyPerItemLimits() al final del roll de affixes

src/data/affixes.js
  → Ajustar weights de affixes para que la distribución sea más uniforme
  → Agregar affixes que falten para cubrir todos los stats del statEngine

src/engine/crafting/craftingEngine.js
  → Actualizar fórmulas de costos a las nuevas (reroll con useCount, upgrade nuevo)
  → Agregar tracking de useCount por item en el item schema
  → Guardar useCount en el item: item.craftingHistory = { rerollCount: 0, ... }
Criterio de done: ningún item generado tiene el mismo stat en dos fuentes. Los costos de crafting siguen las nuevas fórmulas. El pool de affixes cubre todos los slots y familias.

FASE 3 — Validación y Tuning (Semana 3)
Archivos a modificar:
src/state/gameReducer.js (o achievementEngine.js)
  → Agregar tracking de BALANCE_METRICS en state.stats
  → Incrementar métricas en los puntos correctos:
    - avgRatingAtEquip: al ejecutar EQUIP_ITEM
    - craftActionsByType: al ejecutar cada CRAFT_*
    - avgPlayerDamageByTier: en processTick cuando hay kill

src/components/Stats.jsx (via Germina)
  → Mostrar métricas clave al jugador de forma legible
  → Sirve para debug visual sin necesitar console

src/data/items.js
  → Revisar items base existentes y alinearlos con el nuevo schema
  → Los items con bonus que ahora serían implicit o bases extra: limpiar el bonus
     y mover esos valores a baseStats/implicit para consistencia
Criterio de done: las métricas se acumulan correctamente. El jugador puede ver breakdown de poder en Stats. Se puede hacer un primer pase de balance basado en datos reales.

CHECKLIST DE VALIDACIÓN
FASE 1:
□ Epic drops tienen exactamente 2 bases distintas
□ Legendary drops tienen exactamente 3 bases distintas
□ Common/Magic/Rare tienen exactamente 1 base
□ Los caps de critChance, dodge, block, speed se aplican en calcStats
□ Los saves viejos cargan sin error

FASE 2:
□ Ningún item tiene el mismo stat en base + affix
□ Ningún item tiene el mismo stat en implicit + affix (salvo weight 20%)
□ El total de % en un item no supera PER_ITEM_PCT_LIMITS
□ Un Legendary sword no puede tener critChance en base + implicit + 2 affixes
□ El reroll N+1 cuesta más que el reroll N para el mismo item

FASE 3:
□ avgRerollsPerItem está entre 3 y 8 después de 100 items crafteados
□ El tier en que cae el primer épico coincide con tier 5-8
□ mostCommonAffixOnEquipped no tiene ningún stat con >50% de presencia
□ La curva avgPlayerDamageByTier está dentro del ±30% del POWER_CURVE target