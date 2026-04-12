REWORK COMPLETO — SISTEMA DE ÍTEMS

1. DIAGNÓSTICO
Qué está bien

La separación conceptual base + implicit + affixes es correcta y es el estándar del género
Tener familias con implicit fijo da identidad sin complejidad excesiva
El crafting con múltiples operaciones (reroll/ascend/fuse) da agencia real al jugador
Forging Potential ya existe conceptualmente — es el control correcto para evitar crafting infinito

Riesgos de balance
Snowball de stats: con base + implicit + 4 affixes (legendary) + upgrades podés llegar a 8-10 stats distintos en un solo item. Si varios apuntan al mismo multiplicador (ej: tres fuentes distintas de daño%), el escalado se vuelve exponencial en lugar de lineal. Un jugador que encuentra un legendary con damage% en base + implicit + dos affixes tiene 4 multiplicadores que se componen entre sí.
Dead stats: stats que aparecen en items pero que el engine no usa completamente (luck, tierScaling, talentBoost) son decoración costosa. El jugador los lee, no entiende su impacto, y el item se siente peor de lo que es.
Breakpoints artificiales: si el affix pool tiene gaps de tier (T3 da 5, T2 da 6, T1 da 18) el jugador siente que los items T2 son basura. Los rangos tienen que solaparse levemente para que cada tier sea válido en su ventana de uso.
Power creep por upgrades: si el upgrade multiplica los affixes existentes en lugar de agregar valor flat, un item level 10 puede ser 2-3x más poderoso que el mismo item level 1. Sin cap global de poder por slot, el crafting trivializa el loot.
Redundancia base vs affixes: si la familia "greatsword" ya da damage como base stat, y además puede tener damage como affix y damage como implicit, el 80% del poder del item está en un solo stat. El jugador no tiene razón para evaluar el item holísticamente.
Métricas a trackear
js// Por sesión de jugador — loguear en state.stats
{
  // Loot
  avgItemRatingAtEquip,          // rating promedio del item al equiparlo
  itemsFoundVsItemsEquipped,     // ratio de loot útil
  tierAtFirstEpicDrop,           // cuándo cae el primer épico
  
  // Crafting
  avgCraftActionsPerItem,        // cuánto craftea el jugador antes de cambiar item
  rerollsBeforeEquip,            // si rerollea mucho = pool de affixes malo
  ascendSuccessRate,             // si nunca asciende = muy caro o no vale la pena
  
  // Balance
  damageContribBySource,         // % daño de base vs equipo vs talentos
  avgPlayerDamageAtTier,         // daño promedio por tier para calibrar curva
  deathRateByTier,               // si nadie muere en tier N, es muy fácil
}

2. NUEVO MODELO
Fórmula de construcción del item final
El orden de aplicación importa. Los multiplicadores se aplican al final, no en el medio:
STAT_FINAL = (BASE_STAT + IMPLICIT_FLAT + AFFIX_FLAT + UPGRADE_FLAT) * MULTIPLIER_TOTAL

MULTIPLIER_TOTAL = (1 + sum(AFFIX_PCT_BONUSES)) * (1 + UPGRADE_PCT_BONUS)
Regla crítica: nunca aplicar un multiplicador sobre otro multiplicador en el mismo item. Los affixes de % se suman entre sí (no se componen) antes de multiplicar.
js// CORRECTO — affixes % se suman, luego multiplican
damage = (baseDmg + implicitFlat + affixFlat) * (1 + affixPct1 + affixPct2)

// INCORRECTO — composición exponencial
damage = baseDmg * (1 + affixPct1) * (1 + affixPct2) // esto escala demasiado rápido
Objetivo de stats por rareza
RAREZA     STATS DISTINTOS    AFFIXES        ROL
─────────────────────────────────────────────────────────
common     2                  1P 0S          base item con identidad mínima
magic      3                  1P 1S          primera mejora real
rare       4                  2P 1S          item funcional completo
epic       5                  2P 2S          item con identidad de build
legendary  6                  2P 2S + bonus  item que define la build
El máximo de 6 stats distintos en legendary (no 10) es el cambio más importante. Para llegar a 6:

1 base stat (fijo por familia)
1 implicit (fijo por familia, escala con rareza)
4 affixes (legendary: 2 prefix + 2 suffix)

No hay base stat adicional por rareza — la rareza afecta los affixes, no la base.
Rol exacto de cada capa
BASE STAT:
  → Define la identidad de la familia (sword = damage, plate = defense)
  → Valor fijo determinado por family + item level al dropear
  → NO se puede cambiar con crafting
  → Escala linealmente con item level: base * (1 + level * 0.08)

IMPLICIT:
  → Un solo stat, específico por familia y rareza
  → Valor fijo (no rolleado), determinado por rareza del item
  → NO se puede cambiar con crafting estándar
  → SÍ se puede cambiar con "Blessing" (nuevo crafting que rerollea el implicit)
  → Ejemplo: greatsword common = +2% crit, epic = +6% crit, legendary = +10% crit

AFFIXES (prefix/suffix):
  → Stats adicionales rolleados al dropear (dentro del tier correspondiente)
  → SÍ se pueden modificar con crafting (reroll, polish, reforge)
  → Cada affix es único en el item — no puede repetirse el mismo stat
  → El tier del affix (T1/T2/T3) determina el rango de valor

UPGRADE (item level):
  → Solo amplifica los AFFIXES existentes, no la base ni el implicit
  → Cada nivel de upgrade: affixes * 1.08 (flat compuesto)
  → Máximo nivel 10: amplificación total máxima = 1.08^10 ≈ x2.16
  → El cap de x2.16 sobre los affixes evita el power creep descontrolado
Cómo evitar que un stat domine
Regla de exclusión por fuente: si la familia ya tiene damage como base stat, los affixes de damage están excluidos del pool para esa familia. La diversidad es forzada por diseño, no por balance.
jsexport const FAMILY_AFFIX_EXCLUSIONS = {
  greatsword: ["damage"],     // ya tiene damage en base → affixes no pueden dar damage
  dagger:     ["critChance"], // ya tiene crit en implicit → affixes no pueden dar critChance
  plate:      ["defense"],    // ya tiene defense en base → affixes no pueden dar defense
  leather:    ["dodgeChance"],
};
Cap global por stat: ningún stat puede superar un cap absoluto independientemente de cuántas fuentes tenga:
jsexport const STAT_CAPS = {
  critChance:      0.75,  // 75% máximo
  dodgeChance:     0.50,  // 50% máximo
  blockChance:     0.60,  // 60% máximo
  attackSpeed:     0.70,  // 70% máximo (reduce tick interval)
  lifesteal:       0.30,  // 30% máximo
  cooldownReduction: 0.50,
};
// damage, defense, healthMax no tienen cap (escalan linealmente)
Familias con identidad
jsexport const ITEM_FAMILIES = {
  // WEAPONS
  greatsword: {
    type: "weapon",
    baseStat: "damage",
    baseRange: { min: 8, max: 14 },   // a item level 1
    implicit: "critDamage",
    implicitByRarity: { common: 0.10, magic: 0.20, rare: 0.30, epic: 0.45, legendary: 0.60 },
    affinityTags: ["damage", "crit"],  // affixes de estas categorías tienen +20% peso
    exclusions: ["damage"],            // nunca en el affix pool de esta familia
    identity: "alto daño, crit damage alto, sin sustain",
  },
  dagger: {
    type: "weapon",
    baseStat: "damage",
    baseRange: { min: 4, max: 8 },    // daño bajo
    implicit: "critChance",
    implicitByRarity: { common: 0.03, magic: 0.05, rare: 0.07, epic: 0.10, legendary: 0.14 },
    affinityTags: ["crit", "tempo"],
    exclusions: ["critChance"],
    identity: "daño moderado, crit chance muy alto, velocidad",
  },
  mace: {
    type: "weapon",
    baseStat: "damage",
    baseRange: { min: 6, max: 11 },
    implicit: "thorns",
    implicitByRarity: { common: 3, magic: 6, rare: 10, epic: 16, legendary: 24 },
    affinityTags: ["damage", "survivability"],
    exclusions: ["thorns"],
    identity: "daño sólido, espinas altas, utilidad defensiva",
  },
  plate: {
    type: "armor",
    baseStat: "defense",
    baseRange: { min: 6, max: 10 },
    implicit: "healthMax",
    implicitByRarity: { common: 15, magic: 30, rare: 50, epic: 80, legendary: 120 },
    affinityTags: ["survivability", "defense"],
    exclusions: ["defense"],
    identity: "defensa máxima, HP alto, sin movilidad",
  },
  leather: {
    type: "armor",
    baseStat: "defense",
    baseRange: { min: 3, max: 6 },
    implicit: "dodgeChance",
    implicitByRarity: { common: 0.03, magic: 0.05, rare: 0.08, epic: 0.12, legendary: 0.18 },
    affinityTags: ["utility", "tempo"],
    exclusions: ["dodgeChance"],
    identity: "defensa baja, esquive alto, velocidad",
  },
  mail: {
    type: "armor",
    baseStat: "defense",
    baseRange: { min: 5, max: 8 },
    implicit: "healthRegen",
    implicitByRarity: { common: 1, magic: 2, rare: 4, epic: 6, legendary: 9 },
    affinityTags: ["survivability", "economy"],
    exclusions: ["healthRegen"],
    identity: "defensa media, regen alta, sustain en combates largos",
  },
};

3. REWORK DE AFFIXES
Pool de affixes restructurado
jsexport const AFFIX_POOL = [

  // ── OFFENSE ──────────────────────────────────────────────
  {
    id: "prefix_damage_flat",
    stat: "damage",
    scaling: "flat",
    category: "offense",
    slot: "prefix",
    availableFor: ["weapon"],          // solo en armas
    excludedFamilies: ["greatsword"],  // greatsword ya tiene damage en base
    tiers: {
      3: { label: "Afilada",       range: [3,  6 ], weight: 55, minProgTier: 1  },
      2: { label: "del Guerrero",  range: [7,  14], weight: 25, minProgTier: 4  },
      1: { label: "Devastadora",   range: [18, 30], weight: 8,  minProgTier: 8  },
    },
  },
  {
    id: "prefix_crit_chance",
    stat: "critChance",
    scaling: "percent",
    category: "offense",
    slot: "prefix",
    availableFor: ["weapon", "armor"],
    excludedFamilies: ["dagger"],      // dagger ya tiene crit en implicit
    tiers: {
      3: { label: "Certera",       range: [0.01, 0.02], weight: 55, minProgTier: 1  },
      2: { label: "del Asesino",   range: [0.03, 0.06], weight: 25, minProgTier: 5  },
      1: { label: "del Verdugo",   range: [0.08, 0.13], weight: 8,  minProgTier: 10 },
    },
  },
  {
    id: "prefix_crit_damage",
    stat: "critDamage",
    scaling: "percent",
    category: "offense",
    slot: "prefix",
    availableFor: ["weapon"],
    excludedFamilies: ["greatsword"],  // greatsword ya tiene critDamage en implicit
    tiers: {
      3: { label: "Cruel",         range: [0.10, 0.20], weight: 50, minProgTier: 3  },
      2: { label: "Brutal",        range: [0.25, 0.45], weight: 22, minProgTier: 7  },
      1: { label: "del Aniquilador", range: [0.60, 1.00], weight: 7, minProgTier: 12 },
    },
  },
  {
    id: "prefix_attack_speed",
    stat: "attackSpeed",
    scaling: "percent",
    category: "offense",
    slot: "prefix",
    availableFor: ["weapon"],
    tiers: {
      3: { label: "Ágil",          range: [0.02, 0.04], weight: 50, minProgTier: 2  },
      2: { label: "Frenética",     range: [0.05, 0.09], weight: 22, minProgTier: 6  },
      1: { label: "del Relámpago", range: [0.12, 0.18], weight: 7,  minProgTier: 11 },
    },
  },
  {
    id: "prefix_lifesteal",
    stat: "lifesteal",
    scaling: "percent",
    category: "offense",
    slot: "prefix",
    availableFor: ["weapon"],
    tiers: {
      3: { label: "Vampírica",     range: [0.01, 0.02], weight: 45, minProgTier: 3  },
      2: { label: "del Vampiro",   range: [0.03, 0.06], weight: 20, minProgTier: 7  },
      1: { label: "del Liche",     range: [0.08, 0.14], weight: 6,  minProgTier: 12 },
    },
  },
  {
    id: "prefix_thorns",
    stat: "thorns",
    scaling: "flat",
    category: "offense",
    slot: "prefix",
    availableFor: ["weapon", "armor"],
    excludedFamilies: ["mace"],
    tiers: {
      3: { label: "Espinosa",      range: [2,  5 ], weight: 45, minProgTier: 2  },
      2: { label: "de la Venganza",range: [6,  12], weight: 20, minProgTier: 6  },
      1: { label: "del Martirio",  range: [15, 25], weight: 6,  minProgTier: 11 },
    },
  },

  // ── DEFENSE ──────────────────────────────────────────────
  {
    id: "prefix_defense_flat",
    stat: "defense",
    scaling: "flat",
    category: "defense",
    slot: "prefix",
    availableFor: ["armor"],
    excludedFamilies: ["plate"],
    tiers: {
      3: { label: "Reforzada",     range: [3,  6 ], weight: 55, minProgTier: 1  },
      2: { label: "del Guardián",  range: [7,  14], weight: 25, minProgTier: 4  },
      1: { label: "del Titán",     range: [18, 28], weight: 8,  minProgTier: 9  },
    },
  },
  {
    id: "prefix_health_max",
    stat: "healthMax",
    scaling: "flat",
    category: "defense",
    slot: "prefix",
    availableFor: ["armor"],
    excludedFamilies: ["plate"],       // plate ya tiene healthMax en implicit
    tiers: {
      3: { label: "Robusta",       range: [12, 22 ], weight: 55, minProgTier: 1  },
      2: { label: "Hercúlea",      range: [28, 55 ], weight: 25, minProgTier: 5  },
      1: { label: "del Leviatán",  range: [75, 130], weight: 8,  minProgTier: 10 },
    },
  },
  {
    id: "prefix_dodge",
    stat: "dodgeChance",
    scaling: "percent",
    category: "defense",
    slot: "prefix",
    availableFor: ["armor"],
    excludedFamilies: ["leather"],
    tiers: {
      3: { label: "Escurridiza",   range: [0.01, 0.02], weight: 45, minProgTier: 2  },
      2: { label: "del Acróbata",  range: [0.03, 0.06], weight: 20, minProgTier: 6  },
      1: { label: "Fantasmal",     range: [0.08, 0.14], weight: 6,  minProgTier: 11 },
    },
  },
  {
    id: "prefix_block_chance",
    stat: "blockChance",
    scaling: "percent",
    category: "defense",
    slot: "prefix",
    availableFor: ["armor"],
    tiers: {
      3: { label: "de la Guardia", range: [0.02, 0.04], weight: 45, minProgTier: 2  },
      2: { label: "del Escudo",    range: [0.05, 0.09], weight: 20, minProgTier: 6  },
      1: { label: "del Baluarte",  range: [0.12, 0.20], weight: 6,  minProgTier: 11 },
    },
  },

  // ── SUFFIX ───────────────────────────────────────────────
  {
    id: "suffix_health_regen",
    stat: "healthRegen",
    scaling: "flat",
    category: "defense",
    slot: "suffix",
    availableFor: ["weapon", "armor"],
    excludedFamilies: ["mail"],
    tiers: {
      3: { label: "de la Recuperación", range: [1, 2 ], weight: 55, minProgTier: 1  },
      2: { label: "de la Vitalidad",    range: [3, 6 ], weight: 25, minProgTier: 4  },
      1: { label: "del Fénix",          range: [8, 14], weight: 8,  minProgTier: 9  },
    },
  },
  {
    id: "suffix_xp_bonus",
    stat: "xpBonus",
    scaling: "percent",
    category: "economy",
    slot: "suffix",
    availableFor: ["weapon", "armor"],
    tiers: {
      3: { label: "del Aprendiz",  range: [0.04, 0.07], weight: 50, minProgTier: 1  },
      2: { label: "del Sabio",     range: [0.09, 0.15], weight: 22, minProgTier: 5  },
      1: { label: "de la Ascensión", range: [0.20, 0.35], weight: 7, minProgTier: 10 },
    },
  },
  {
    id: "suffix_gold_bonus",
    stat: "goldBonus",
    scaling: "flat",
    category: "economy",
    slot: "suffix",
    availableFor: ["weapon", "armor"],
    tiers: {
      3: { label: "del Comerciante", range: [3,  7 ], weight: 50, minProgTier: 1  },
      2: { label: "del Magnate",     range: [8,  16], weight: 22, minProgTier: 5  },
      1: { label: "del Rey Midas",   range: [20, 35], weight: 7,  minProgTier: 10 },
    },
  },
  {
    id: "suffix_essence_bonus",
    stat: "essenceBonus",
    scaling: "flat",
    category: "economy",
    slot: "suffix",
    availableFor: ["weapon", "armor"],
    tiers: {
      3: { label: "del Destilado",   range: [1, 2 ], weight: 45, minProgTier: 3  },
      2: { label: "del Alquimista",  range: [3, 5 ], weight: 20, minProgTier: 7  },
      1: { label: "de la Esencia Pura", range: [7, 12], weight: 6, minProgTier: 12 },
    },
  },
  {
    id: "suffix_luck",
    stat: "luck",
    scaling: "flat",
    category: "utility",
    slot: "suffix",
    availableFor: ["weapon", "armor"],
    tiers: {
      3: { label: "de la Fortuna",  range: [3,  7 ], weight: 45, minProgTier: 2  },
      2: { label: "del Destino",    range: [8,  16], weight: 20, minProgTier: 6  },
      1: { label: "de los Dioses",  range: [20, 35], weight: 6,  minProgTier: 11 },
    },
  },
  {
    id: "suffix_skill_power",
    stat: "skillPower",
    scaling: "percent",
    category: "utility",
    slot: "suffix",
    availableFor: ["weapon", "armor"],
    tiers: {
      3: { label: "del Iniciado",    range: [0.05, 0.09], weight: 40, minProgTier: 4  },
      2: { label: "del Experto",     range: [0.12, 0.20], weight: 18, minProgTier: 8  },
      1: { label: "del Gran Maestro",range: [0.28, 0.45], weight: 5,  minProgTier: 13 },
    },
  },
  {
    id: "suffix_cooldown_reduction",
    stat: "cooldownReduction",
    scaling: "percent",
    category: "utility",
    slot: "suffix",
    availableFor: ["weapon", "armor"],
    tiers: {
      3: { label: "del Veloz",       range: [0.03, 0.06], weight: 40, minProgTier: 4  },
      2: { label: "del Maestro",     range: [0.08, 0.14], weight: 18, minProgTier: 8  },
      1: { label: "del Cronista",    range: [0.18, 0.28], weight: 5,  minProgTier: 13 },
    },
  },
  {
    id: "suffix_damage_on_kill",
    stat: "damageOnKill",
    scaling: "flat",
    category: "offense",
    slot: "suffix",
    availableFor: ["weapon"],
    tiers: {
      3: { label: "del Cazador",     range: [2,  5 ], weight: 45, minProgTier: 3  },
      2: { label: "del Ejecutor",    range: [6,  12], weight: 20, minProgTier: 7  },
      1: { label: "de la Masacre",   range: [15, 25], weight: 6,  minProgTier: 12 },
    },
  },
  {
    id: "suffix_crit_on_low_hp",
    stat: "critOnLowHp",
    scaling: "percent",
    category: "offense",
    slot: "suffix",
    availableFor: ["weapon"],
    tiers: {
      3: { label: "del Desesperado", range: [0.04, 0.06], weight: 40, minProgTier: 5  },
      2: { label: "del Agónico",     range: [0.08, 0.12], weight: 18, minProgTier: 9  },
      1: { label: "del Último Aliento", range: [0.16, 0.25], weight: 5, minProgTier: 14 },
    },
  },
];
Reglas de exclusión y sinergia
js// Regla 1 — No duplicar stats en el mismo item
// Al rollEar affixes, filtrar los que ya están presentes

// Regla 2 — Affinity boost
// Si la familia tiene affinityTags, los affixes de esa categoría
// tienen su weight multiplicado por 1.5

// Regla 3 — Exclusión por familia
// Los affixes en excludedFamilies de la familia del item no pueden aparecer

// Regla 4 — Prefix y suffix no comparten stat
// Si prefix ya rolleó "critChance", suffix no puede rollEar "critChance"

function getEligibleAffixes(family, slot, existingStats, progTier, rarity) {
  return AFFIX_POOL.filter(affix => {
    if (affix.slot !== slot) return false;
    if (!affix.availableFor.includes(family.type)) return false;
    if (affix.excludedFamilies?.includes(family.id)) return false;
    if (existingStats.includes(affix.stat)) return false; // no duplicar
    
    // Al menos un tier disponible para el progTier actual
    const hasValidTier = Object.values(affix.tiers).some(
      tier => progTier >= tier.minProgTier
    );
    return hasValidTier;
  });
}
Sistema anti-frustración
js// BAD LUCK PROTECTION — Pity system por rareza de affix
// Si el jugador no ha visto un affix T1 en los últimos N drops relevantes,
// la chance de T1 aumenta progresivamente

function getAffixTierWeights(baseWeights, pityT1Counter) {
  const PITY_THRESHOLD = 30; // sin T1 en 30 drops de rare+
  const PITY_MAX_BOOST = 3;  // máximo 3x el weight base de T1
  
  const pityMultiplier = pityT1Counter >= PITY_THRESHOLD
    ? Math.min(PITY_MAX_BOOST, 1 + (pityT1Counter - PITY_THRESHOLD) * 0.1)
    : 1;
  
  return {
    3: baseWeights[3],
    2: baseWeights[2],
    1: Math.floor(baseWeights[1] * pityMultiplier),
  };
}

// SMART WEIGHTING — en Reroll, si el jugador tiene wishlist de affixes,
// los affixes de la wishlist tienen +30% weight
// (wishlist es una feature de UX — el jugador marca qué stats quiere)

// GUARANTEED UPGRADE en Ascend — al ascender rareza,
// el affix nuevo que se agrega siempre es T2 o T1 (nunca T3)
// Esto hace que Ascend siempre valga la pena

4. REWORK DE CRAFTING
Definición exacta de cada operación
UPGRADE — Subir el nivel del item (1→10)
  Qué hace:   amplifica todos los affixes actuales por factor fijo
  Factor:     affix_value * (1 + level * 0.08) — acumulativo
  Riesgo:     chance de fallo que baja un nivel (5% * level)
  Irreversible: SÍ (si falla, el nivel baja)
  Modifica:   affixes únicamente (base y implicit no cambian)
  Cuándo usarlo: cuando tenés el item final y querés extraer el máximo poder

REROLL — Cambiar todos los affixes por nuevos
  Qué hace:   rerollea todos los affixes manteniendo rareza y slots
  Riesgo:     ninguno (el resultado puede ser peor, pero no hay fallo sistémico)
  Irreversible: SÍ (los affixes anteriores se pierden)
  Costo:      escala con rareza del item (no con nivel)
  Cuándo usarlo: cuando los affixes son malos pero la base/implicit son buenos

POLISH — Mejorar el rolled value de UN affix dentro de su tier
  Qué hace:   rerollea el valor numérico de un affix elegido
              sin cambiar el stat ni el tier
  Riesgo:     puede dar peor valor dentro del mismo rango
  Irreversible: SÍ
  Costo:      bajo (es una operación de fine-tuning)
  Cuándo usarlo: cuando tenés un T1 con valor bajo y querés acercarlo al máximo

REFORGE — Cambiar UN affix elegido por otro (3 opciones)
  Qué hace:   el jugador elige qué affix cambiar
              aparecen 2 nuevas opciones + mantener el actual
  Riesgo:     las 2 opciones pueden ser peores
  Irreversible: SÍ (elegís una opción y no volvés)
  Costo:      escala con el tier del affix que estás cambiando
  Cuándo usarlo: cuando un affix no sirve para tu build y querés apuntar a otro

ASCEND — Subir rareza del item (common→magic→rare→epic→legendary)
  Qué hace:   sube la rareza, agrega un affix nuevo (T2 o T1 garantizado)
              NO cambia affixes existentes
  Riesgo:     ninguno en el resultado, pero costo alto
  Irreversible: SÍ
  Garantía:   el affix nuevo siempre es T2+ (nunca T3)
  Cuándo usarlo: cuando tenés un item con buenos affixes pero baja rareza

FUSE — Combinar dos items del mismo tipo base
  Qué hace:   toma los mejores affixes de ambos items
              nivel del resultado = max(nivel A, nivel B)
              20% chance de subir rareza
  Riesgo:     perdés ambos items, el resultado puede no tener sinergia
  Irreversible: SÍ (destructivo)
  Cuándo usarlo: cuando tenés dos items mediocres del mismo tipo
                 con affixes complementarios

CORRUPT — Riesgo extremo, recompensa extrema (nuevo)
  Qué hace:   aplica un efecto imposible de obtener de otra forma
              o destruye el item completamente
  Resultados posibles (igual probabilidad):
    - Agrega affix especial "corrupted" (imposible de otra forma)
    - Sube rareza saltando un nivel
    - No hace nada (outcome neutro)
    - Destruye el item
  Riesgo:     25% de destrucción total
  Irreversible: SÍ
  Cuándo usarlo: solo en items que ya no podés mejorar por otros medios
Costos escalables
jsexport const CRAFTING_COSTS = {
  upgrade: {
    gold: (itemLevel, rarityTier) => 100 * itemLevel * rarityTier,
    // Ejemplos: common lv1=100g, epic lv5=2000g, legendary lv9=4500g
    essence: 0,
    failChance: (itemLevel) => 0.05 * itemLevel, // 5% por nivel
  },
  
  reroll: {
    gold: (rarityTier) => 80 * Math.pow(1.6, rarityTier - 1),
    // common=80g, magic=128g, rare=205g, epic=328g, legendary=524g
    essence: (rarityTier) => 5 * rarityTier,
    // common=5, magic=10, rare=15, epic=20, legendary=25
  },
  
  polish: {
    gold: (affixTier) => 50 * (4 - affixTier), // T3=150g, T2=100g, T1=50g
    // T1 es más barato de polish — es un fine-tuning de alto valor
    essence: 2,
  },
  
  reforge: {
    gold: (affixTier) => 200 * (4 - affixTier), // T1 cuesta más de cambiar
    essence: (affixTier) => 10 * (4 - affixTier),
  },
  
  ascend: {
    gold: (rarityTier) => 500 * Math.pow(2, rarityTier - 1),
    // common→magic=500g, magic→rare=1000g, rare→epic=2000g, epic→legendary=4000g
    essence: (rarityTier) => 30 * rarityTier,
  },
  
  fuse: {
    gold: (rarityTier) => 300 * rarityTier,
    essence: (rarityTier) => 15 * rarityTier,
  },
  
  corrupt: {
    gold: 0,
    essence: (rarityTier) => 50 * rarityTier, // costo solo en esencia
    // essence = el recurso "más valioso" — hace que corrupt sea una decisión seria
  },
};
Curvas de costo visualizadas
UPGRADE (gold) por rareza, nivel 1→10:
  Common:    100 → 1000g (total acumulado ~4500g)
  Rare:      300 → 3000g (total ~13500g)
  Legendary: 500 → 5000g (total ~22500g)

REROLL (gold + essence):
  Common:     80g + 5es
  Legendary: 524g + 25es

ASCEND (gold + essence):
  Common→Magic:      500g + 30es
  Epic→Legendary:  4000g + 120es
Cómo evitar loops abusivos
ABUSO POTENCIAL 1: rerollear infinitamente hasta tener T1 en todo
SOLUCIÓN: Forging Potential — cada item tiene FP (50-150 según rareza)
          cada crafting consume FP (upgrade=5, reroll=15, reforge=10)
          cuando FP llega a 0 el item queda SELLADO (no más crafting)
          FP no se ve afectado por Ascend (para incentivar ascender antes de craftear)

ABUSO POTENCIAL 2: fusionar items de bajo costo para generar épicos baratos
SOLUCIÓN: Fuse requiere que ambos items sean de la misma rareza
          el resultado tiene la rareza de los inputs (no sube automáticamente)
          el 20% de subida de rareza es bonus, no garantía
          el costo de Fuse escala con la rareza actual

ABUSO POTENCIAL 3: upgradear hasta nivel 10 antes de Ascend
SOLUCIÓN: Ascend resetea el nivel del item a 1 (pero mantiene los affixes)
          Esto crea la decisión real: ¿upgradeo ahora o asciendo primero?
          La respuesta óptima es: ascender primero, luego upgradear

5. BALANCE FRAMEWORK
Curvas de poder objetivo
js// Daño esperado del jugador por tier (sin tener en cuenta talentos)
// Estos valores determinan los base ranges de items y el escalado de enemies

export const POWER_CURVE = {
  //  tier: { playerDamage, enemyHp, killsPerMin, timeToKill }
  1:  { playerDamage: 15,  enemyHp: 50,   killsPerMin: 18, timeToKill: 3  },
  3:  { playerDamage: 35,  enemyHp: 130,  killsPerMin: 15, timeToKill: 4  },
  5:  { playerDamage: 80,  enemyHp: 350,  killsPerMin: 12, timeToKill: 5  },
  7:  { playerDamage: 180, enemyHp: 900,  killsPerMin: 10, timeToKill: 6  },
  10: { playerDamage: 450, enemyHp: 2500, killsPerMin: 8,  timeToKill: 7  },
  13: { playerDamage: 1100,enemyHp: 7000, killsPerMin: 6,  timeToKill: 9  },
  15: { playerDamage: 2500,enemyHp: 18000,killsPerMin: 5,  timeToKill: 10 },
};

// La curva de enemy HP escala más rápido que el playerDamage
// Eso garantiza que cada tier tome más ticks y el jugador sienta más tensión
Time-to-upgrade esperado por rareza
COMMON:    10-30 kills para encontrar un upgrade real (muy frecuente)
MAGIC:     30-80 kills (frecuente)
RARE:      80-200 kills (notable — sucede en una sesión)
EPIC:      200-600 kills (evento de sesión)
LEGENDARY: 800-2000 kills (evento memorable)

Regla de oro: si el jugador lleva 2x el tiempo esperado sin upgrade,
el pity system incrementa las chances hasta compensar.
Probabilidad de encontrar "upgrades reales"
Un upgrade real = item que mejora el rating del equipado en >10%

Tier 1-3:  60% de drops son upgrades reales (early game generoso)
Tier 4-6:  35% de drops son upgrades reales
Tier 7-9:  15% de drops son upgrades reales
Tier 10+:  5-8% de drops son upgrades reales (depende más del crafting)

La transición a crafting como fuente principal de mejora 
debe ocurrir entre tier 7 y 9.
Controles anti-inflación de loot
1. INVENTORY CAP = 30 items (reducido de 50)
   Fuerza decisiones más frecuentes de sell/extract/craft

2. DROP RATE decae levemente al farmear el mismo tier >100 ticks:
   dropChance *= Math.max(0.7, 1 - ticksSameTier * 0.003)
   Esto incentiva subir de tier en lugar de farmer estático

3. QUALITY FLOOR por tier:
   En tier 5+ los items common no dropean
   En tier 8+ los items magic no dropean
   En tier 11+ los items rare no dropean
   Esto limita el volumen total de loot procesable

4. SELL VALUE como válvula de presión:
   Si el inventario tiene >25 items, sell value de items bajos se reduce 20%
   → Incentiva extract sobre venta en loot heavy sessions

6. ENTREGA IMPLEMENTABLE
Schema de datos
js// ITEM BASE (generado al dropear)
const itemSchema = {
  id: "string_unica",
  itemId: "familia_rarity_index",        // para identificar el tipo base
  family: "greatsword",                   // familia
  type: "weapon",                         // weapon | armor
  rarity: "epic",
  level: 1,                               // item level (1-10)
  forgingPotential: 120,                  // FP disponible (epic = 120 base)
  sealed: false,                          // true cuando FP = 0

  // Stats calculadas
  baseStats: { damage: 22 },              // base stat de la familia, rolleado al drop
  implicit: { critDamage: 0.45 },         // implicit de familia por rareza
  affixes: [                              // array de affixes rolleados
    {
      affixId: "prefix_crit_chance",
      stat: "critChance",
      slot: "prefix",
      tier: 2,
      rolledValue: 0.048,
      isPerfectRoll: false,               // true si rolledValue == max del tier
      tierLabel: "del Asesino",
    },
    {
      affixId: "prefix_attack_speed",
      stat: "attackSpeed",
      slot: "prefix",
      tier: 1,
      rolledValue: 0.155,
      isPerfectRoll: false,
      tierLabel: "del Relámpago",
    },
    {
      affixId: "suffix_damage_on_kill",
      stat: "damageOnKill",
      slot: "suffix",
      tier: 2,
      rolledValue: 9,
      isPerfectRoll: false,
      tierLabel: "del Ejecutor",
    },
    {
      affixId: "suffix_xp_bonus",
      stat: "xpBonus",
      slot: "suffix",
      tier: 3,
      rolledValue: 0.055,
      isPerfectRoll: false,
      tierLabel: "del Aprendiz",
    },
  ],

  // Bonus computado (resultado de todas las capas)
  bonus: {
    damage: 22,
    critDamage: 0.45,
    critChance: 0.048,
    attackSpeed: 0.155,
    damageOnKill: 9,
    xpBonus: 0.055,
  },

  // Metadata
  rating: 0,                              // calculado al generar/craftear
  sellValue: 0,                           // calculado al generar/craftear
  droppedAt: { tier: 7, isBoss: false },
  isCorrupted: false,
};

// RARITY CONFIG
const rarityConfig = {
  common:    { prefixes: 1, suffixes: 0, fp: 50,  sellBase: 5   },
  magic:     { prefixes: 1, suffixes: 1, fp: 70,  sellBase: 25  },
  rare:      { prefixes: 2, suffixes: 1, fp: 90,  sellBase: 80  },
  epic:      { prefixes: 2, suffixes: 2, fp: 120, sellBase: 250 },
  legendary: { prefixes: 2, suffixes: 2, fp: 150, sellBase: 800 },
};
Pseudocódigo — generación de item
jsfunction generateItem({ family, rarity, progTier, isBoss }) {
  const familyDef  = ITEM_FAMILIES[family];
  const rarityCfg  = rarityConfig[rarity];
  const rarityTier = RARITY_TIER_MAP[rarity]; // common=1 ... legendary=5

  // 1. Base stat (rolleado dentro del rango de la familia)
  const baseValue = rollRange(
    familyDef.baseRange.min * (1 + (progTier - 1) * 0.12),
    familyDef.baseRange.max * (1 + (progTier - 1) * 0.12)
  );
  const baseStats = { [familyDef.baseStat]: Math.floor(baseValue) };

  // 2. Implicit (fijo por familia y rareza)
  const implicit = { [familyDef.implicit]: familyDef.implicitByRarity[rarity] };

  // 3. Affixes
  const existingStats = [familyDef.baseStat, familyDef.implicit];
  const affixes = [];

  for (let i = 0; i < rarityCfg.prefixes; i++) {
    const affix = rollAffix("prefix", family, existingStats, progTier, rarity);
    if (affix) {
      affixes.push(affix);
      existingStats.push(affix.stat);
    }
  }

  for (let i = 0; i < rarityCfg.suffixes; i++) {
    const affix = rollAffix("suffix", family, existingStats, progTier, rarity);
    if (affix) {
      affixes.push(affix);
      existingStats.push(affix.stat);
    }
  }

  // 4. Compute bonus
  const bonus = computeItemBonus(baseStats, implicit, affixes, 1);

  // 5. Metadata
  const item = {
    id: `${family}_${rarity}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    itemId: `${family}_${rarity}`,
    family, type: familyDef.type, rarity,
    level: 1,
    forgingPotential: rarityCfg.fp,
    sealed: false,
    baseStats, implicit, affixes, bonus,
    rating: computeRating({ baseStats, implicit, affixes, rarity }),
    sellValue: computeSellValue(rarity, affixes),
    droppedAt: { tier: progTier, isBoss },
    isCorrupted: false,
  };

  return item;
}

function rollAffix(slot, family, existingStats, progTier, rarity) {
  const familyDef = ITEM_FAMILIES[family];
  const eligible  = getEligibleAffixes(familyDef, slot, existingStats, progTier, rarity);
  if (!eligible.length) return null;

  // Aplicar affinity boost
  const weighted = eligible.map(affix => {
    const isAffinity = familyDef.affinityTags.includes(affix.category);
    const availableTiers = getAvailableTiers(affix, progTier);
    const totalWeight = availableTiers.reduce((sum, tier) => {
      return sum + affix.tiers[tier].weight * (isAffinity ? 1.5 : 1);
    }, 0);
    return { affix, totalWeight };
  });

  const pickedAffix = weightedRandom(weighted);
  const tier        = pickTier(pickedAffix, progTier);
  const tierDef     = pickedAffix.tiers[tier];
  const rolledValue = rollRange(tierDef.range[0], tierDef.range[1]);
  const isPerfect   = rolledValue >= tierDef.range[1] * 0.98;

  return {
    affixId: pickedAffix.id,
    stat:    pickedAffix.stat,
    slot,
    tier,
    rolledValue: Math.round(rolledValue * 1000) / 1000,
    isPerfectRoll: isPerfect,
    tierLabel: tierDef.label,
  };
}

function computeItemBonus(baseStats, implicit, affixes, itemLevel) {
  const bonus = { ...baseStats, ...implicit };
  const upgradeMult = Math.pow(1.08, itemLevel - 1);

  for (const affix of affixes) {
    const scaledValue = Math.round(affix.rolledValue * upgradeMult * 1000) / 1000;
    bonus[affix.stat] = (bonus[affix.stat] || 0) + scaledValue;
  }

  return bonus;
}
Pseudocódigo — comparativa de stats
jsfunction compareItems(itemA, itemB, equippedWeapon, equippedArmor) {
  // Determinar qué slot compiten
  if (itemA.type !== itemB.type) return null; // no comparables

  const currentEquipped = itemA.type === "weapon" ? equippedWeapon : equippedArmor;

  function buildStatMap(item) {
    const stats = {};
    // Base
    Object.entries(item.baseStats).forEach(([k, v]) => stats[k] = (stats[k] || 0) + v);
    // Implicit
    Object.entries(item.implicit).forEach(([k, v]) => stats[k] = (stats[k] || 0) + v);
    // Affixes (ya con upgrade mult computado en bonus)
    Object.entries(item.bonus).forEach(([k, v]) => stats[k] = v); // bonus ya es el total
    return stats;
  }

  const statsA    = buildStatMap(itemA);
  const statsB    = buildStatMap(itemB || currentEquipped || {});
  const allStats  = new Set([...Object.keys(statsA), ...Object.keys(statsB)]);

  const comparison = {};
  for (const stat of allStats) {
    const valA = statsA[stat] || 0;
    const valB = statsB[stat] || 0;
    comparison[stat] = {
      current:  valB,
      new:      valA,
      delta:    valA - valB,
      isUpgrade: valA > valB,
      isPct:    PERCENT_STATS.includes(stat),
    };
  }

  // Rating delta
  comparison._ratingDelta = itemA.rating - (itemB || currentEquipped)?.rating || 0;
  comparison._isOverallUpgrade = comparison._ratingDelta > 0;

  return comparison;
}
Plan de migración
js// Los items existentes tienen estructura:
// { id, itemId, name, bonus: {}, baseBonus: {}, affixes: [], level, rarity }

// Estrategia: migración lazy (cuando el item se toca, se migra)

function migrateItemV2(oldItem) {
  if (oldItem.schemaVersion >= 2) return oldItem;

  // Inferir family desde itemId
  const family = inferFamilyFromItemId(oldItem.itemId) || "greatsword";
  const familyDef = ITEM_FAMILIES[family];

  // Reconstruir baseStats desde baseBonus
  const baseStats = { [familyDef.baseStat]: oldItem.baseBonus?.[familyDef.baseStat] || 5 };

  // Inferir implicit desde bonus que no está en affixes
  const affixStats = (oldItem.affixes || []).map(a => a.stat);
  const implicitStat = familyDef.implicit;
  const implicitValue = oldItem.bonus?.[implicitStat] 
    && !affixStats.includes(implicitStat)
    ? oldItem.bonus[implicitStat]
    : familyDef.implicitByRarity[oldItem.rarity];

  // Migrar affixes — añadir campos faltantes con defaults seguros
  const migratedAffixes = (oldItem.affixes || []).map(affix => ({
    ...affix,
    tier:          affix.tier || inferTierFromValue(affix),
    isPerfectRoll: affix.rolledValue >= (getAffixMaxValue(affix.affixId, affix.tier) * 0.98),
    tierLabel:     affix.tierLabel || affix.label || "Desconocido",
  }));

  // FP inicial basado en rareza (items viejos = FP completo, no se penaliza)
  const fp = rarityConfig[oldItem.rarity]?.fp || 50;

  return {
    ...oldItem,
    schemaVersion: 2,
    family,
    type:             familyDef.type,
    baseStats,
    implicit:         { [implicitStat]: implicitValue },
    affixes:          migratedAffixes,
    forgingPotential: fp,
    sealed:           false,
    isCorrupted:      false,
    droppedAt:        oldItem.droppedAt || { tier: 1, isBoss: false },
    // bonus se mantiene igual — se recalcula en el próximo craft o equip
  };
}

MVP BALANCEADA (1-2 semanas)
Qué implementar:

Exclusiones de affix por familia (una tarde — es filtrar el pool al rollEar)
FP (Forging Potential) en todos los items nuevos — agregar campo al schema
Migración lazy de items viejos al interactuar con ellos
Corrupt como nueva operación de crafting (datos + caso en craftingEngine)
Quality floor por tier (common no dropea en tier 5+)
Cap de stats (critChance 75%, dodge 50%, etc.) en calcStats

Qué dejar para v2:

Reforge (la operación de 3 opciones) — requiere UI nueva
Polish — requiere UI nueva
Pity system completo — requiere trackear pityT1Counter en state
Wishlist de affixes con smart weighting — requiere feature de UX
Drop rate decay por farmeo estático — requiere ticksSameTier en state


V2 AMBICIOSA
Qué agrega:

Reforge con UI de 3 opciones (la mejor decisión de crafting del juego)
Polish para fine-tuning de valores
Pity system completo con contador en state.stats
Wishlist de affixes
Ascend que resetea level (crea la decisión ascend vs upgrade)
Item families adicionales con identidades únicas
Boss loot themes conectados a favoredStats (ya diseñados en BOSS_LOOT_THEMES)
Corrupt con outcomes múltiples
Inventory cap reducido a 30 con auto-extract configurable por rareza mínima