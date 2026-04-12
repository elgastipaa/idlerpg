export const PREFIXES = [

  // ── OFFENSE — FLAT ────────────────────────────────────────

  { id: "prefix_damage_1", stat: "damage", scaling: "flat", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Afilada",          range: [3,  6 ], weight: 55, minProgTier: 1  },
      2: { label: "del Guerrero",     range: [7,  14], weight: 25, minProgTier: 4  },
      1: { label: "Devastadora",      range: [18, 30], weight: 8,  minProgTier: 8  },
    }},

  { id: "prefix_damage_2", stat: "damage", scaling: "flat", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Sangrienta",       range: [4,  7 ], weight: 50, minProgTier: 2  },
      2: { label: "Implacable",       range: [8,  16], weight: 22, minProgTier: 5  },
      1: { label: "del Aniquilador",  range: [20, 34], weight: 7,  minProgTier: 9  },
    }},

  { id: "prefix_thorns_1", stat: "thorns", scaling: "flat", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Espinosa",         range: [2,  5 ], weight: 45, minProgTier: 2  },
      2: { label: "de la Venganza",   range: [6,  13], weight: 20, minProgTier: 6  },
      1: { label: "del Martirio",     range: [16, 28], weight: 6,  minProgTier: 11 },
    }},

  { id: "prefix_damage_on_kill", stat: "damageOnKill", scaling: "flat", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Cazadora",         range: [2,  5 ], weight: 45, minProgTier: 2  },
      2: { label: "del Ejecutor",     range: [6,  12], weight: 20, minProgTier: 6  },
      1: { label: "de la Masacre",    range: [14, 24], weight: 6,  minProgTier: 11 },
    }},

  // ── OFFENSE — PERCENT ─────────────────────────────────────

  { id: "prefix_crit_chance", stat: "critChance", scaling: "percent", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Certera",          range: [0.01, 0.02], weight: 50, minProgTier: 1  },
      2: { label: "del Asesino",      range: [0.03, 0.06], weight: 22, minProgTier: 5  },
      1: { label: "del Verdugo",      range: [0.08, 0.13], weight: 7,  minProgTier: 10 },
    }},

  { id: "prefix_crit_damage", stat: "critDamage", scaling: "percent", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Cruel",            range: [0.10, 0.20], weight: 45, minProgTier: 3  },
      2: { label: "Brutal",           range: [0.25, 0.48], weight: 20, minProgTier: 7  },
      1: { label: "del Cataclismo",   range: [0.60, 1.05], weight: 6,  minProgTier: 12 },
    }},

  { id: "prefix_attack_speed", stat: "attackSpeed", scaling: "percent", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Ágil",             range: [0.02, 0.04], weight: 45, minProgTier: 2  },
      2: { label: "Frenética",        range: [0.05, 0.09], weight: 20, minProgTier: 6  },
      1: { label: "del Relámpago",    range: [0.12, 0.18], weight: 6,  minProgTier: 11 },
    }},

  { id: "prefix_lifesteal", stat: "lifesteal", scaling: "percent", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Vampírica",        range: [0.01, 0.02], weight: 40, minProgTier: 3  },
      2: { label: "del Vampiro",      range: [0.03, 0.06], weight: 18, minProgTier: 7  },
      1: { label: "del Liche",        range: [0.08, 0.15], weight: 5,  minProgTier: 12 },
    }},

  { id: "prefix_crit_on_low_hp", stat: "critOnLowHp", scaling: "percent", category: "offense", slot: "prefix",
    tiers: {
      3: { label: "Desesperada",      range: [0.03, 0.05], weight: 38, minProgTier: 4  },
      2: { label: "del Agónico",      range: [0.07, 0.12], weight: 17, minProgTier: 8  },
      1: { label: "del Último Aliento",range:[0.15, 0.24], weight: 5,  minProgTier: 13 },
    }},

  // ── DEFENSE — FLAT ────────────────────────────────────────

  { id: "prefix_defense_1", stat: "defense", scaling: "flat", category: "defense", slot: "prefix",
    tiers: {
      3: { label: "Reforzada",        range: [3,  6 ], weight: 55, minProgTier: 1  },
      2: { label: "del Guardián",     range: [7,  15], weight: 25, minProgTier: 4  },
      1: { label: "del Titán",        range: [19, 32], weight: 8,  minProgTier: 9  },
    }},

  { id: "prefix_defense_2", stat: "defense", scaling: "flat", category: "defense", slot: "prefix",
    tiers: {
      3: { label: "Sólida",           range: [4,  7 ], weight: 50, minProgTier: 2  },
      2: { label: "Inquebrantable",   range: [8,  16], weight: 22, minProgTier: 5  },
      1: { label: "del Coloso",       range: [20, 34], weight: 7,  minProgTier: 10 },
    }},

  { id: "prefix_health_max_1", stat: "healthMax", scaling: "flat", category: "defense", slot: "prefix",
    tiers: {
      3: { label: "Robusta",          range: [12, 22 ], weight: 55, minProgTier: 1  },
      2: { label: "Hercúlea",         range: [28, 58 ], weight: 25, minProgTier: 5  },
      1: { label: "del Leviatán",     range: [78, 135], weight: 8,  minProgTier: 10 },
    }},

  { id: "prefix_health_max_2", stat: "healthMax", scaling: "flat", category: "defense", slot: "prefix",
    tiers: {
      3: { label: "Vital",            range: [14, 24 ], weight: 50, minProgTier: 2  },
      2: { label: "del Gigante",      range: [30, 62 ], weight: 22, minProgTier: 6  },
      1: { label: "del Semidiós",     range: [82, 140], weight: 7,  minProgTier: 11 },
    }},

  { id: "prefix_health_regen", stat: "healthRegen", scaling: "flat", category: "defense", slot: "prefix",
    tiers: {
      3: { label: "Regeneradora",     range: [1, 2 ], weight: 50, minProgTier: 1  },
      2: { label: "Vital",            range: [3, 6 ], weight: 22, minProgTier: 4  },
      1: { label: "del Fénix",        range: [8, 15], weight: 7,  minProgTier: 9  },
    }},

  // ── DEFENSE — PERCENT ─────────────────────────────────────

  { id: "prefix_dodge", stat: "dodgeChance", scaling: "percent", category: "defense", slot: "prefix",
    tiers: {
      3: { label: "Escurridiza",      range: [0.01, 0.03], weight: 45, minProgTier: 2  },
      2: { label: "del Acróbata",     range: [0.04, 0.07], weight: 20, minProgTier: 6  },
      1: { label: "Fantasmal",        range: [0.09, 0.15], weight: 6,  minProgTier: 11 },
    }},

  { id: "prefix_block", stat: "blockChance", scaling: "percent", category: "defense", slot: "prefix",
    tiers: {
      3: { label: "Protectora",       range: [0.02, 0.04], weight: 45, minProgTier: 2  },
      2: { label: "del Escudo",       range: [0.05, 0.09], weight: 20, minProgTier: 6  },
      1: { label: "del Baluarte",     range: [0.12, 0.20], weight: 6,  minProgTier: 11 },
    }},

  // ── UTILITY ───────────────────────────────────────────────

  { id: "prefix_skill_power", stat: "skillPower", scaling: "percent", category: "utility", slot: "prefix",
    tiers: {
      3: { label: "Arcana",           range: [0.05, 0.09], weight: 38, minProgTier: 4  },
      2: { label: "del Hechicero",    range: [0.12, 0.22], weight: 17, minProgTier: 8  },
      1: { label: "del Gran Maestro", range: [0.28, 0.50], weight: 5,  minProgTier: 13 },
    }},

  { id: "prefix_cooldown_reduction", stat: "cooldownReduction", scaling: "percent", category: "utility", slot: "prefix",
    tiers: {
      3: { label: "Veloz",            range: [0.03, 0.06], weight: 38, minProgTier: 4  },
      2: { label: "del Maestro",      range: [0.08, 0.14], weight: 17, minProgTier: 8  },
      1: { label: "del Cronista",     range: [0.18, 0.30], weight: 5,  minProgTier: 13 },
    }},
];

export const SUFFIXES = [

  // ── ECONOMY — FLAT ────────────────────────────────────────

  { id: "suffix_gold_flat_1", stat: "goldBonus", scaling: "flat", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "del Comerciante",  range: [3,  7 ], weight: 50, minProgTier: 1  },
      2: { label: "del Magnate",      range: [8,  18], weight: 22, minProgTier: 5  },
      1: { label: "del Rey Midas",    range: [22, 38], weight: 7,  minProgTier: 10 },
    }},

  { id: "suffix_gold_flat_2", stat: "goldBonus", scaling: "flat", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "del Saqueo",       range: [2,  6 ], weight: 48, minProgTier: 1  },
      2: { label: "del Tesoro",       range: [7,  16], weight: 21, minProgTier: 5  },
      1: { label: "del Imperio",      range: [20, 35], weight: 6,  minProgTier: 10 },
    }},

  { id: "suffix_essence_bonus", stat: "essenceBonus", scaling: "flat", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "del Destilado",    range: [1, 2 ], weight: 45, minProgTier: 3  },
      2: { label: "del Alquimista",   range: [3, 6 ], weight: 20, minProgTier: 7  },
      1: { label: "de la Esencia Pura",range:[7, 13], weight: 6,  minProgTier: 12 },
    }},

  { id: "suffix_luck_1", stat: "luck", scaling: "flat", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "de la Fortuna",    range: [3,  8 ], weight: 45, minProgTier: 2  },
      2: { label: "del Destino",      range: [9,  20], weight: 20, minProgTier: 6  },
      1: { label: "de los Dioses",    range: [24, 42], weight: 6,  minProgTier: 11 },
    }},

  { id: "suffix_luck_2", stat: "luck", scaling: "flat", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "del Trébol",       range: [2,  7 ], weight: 42, minProgTier: 2  },
      2: { label: "del Oráculo",      range: [8,  18], weight: 19, minProgTier: 6  },
      1: { label: "del Elegido",      range: [22, 40], weight: 5,  minProgTier: 11 },
    }},

  // ── ECONOMY — PERCENT ─────────────────────────────────────

  { id: "suffix_gold_pct", stat: "goldBonusPct", scaling: "percent", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "del Cobrador",     range: [0.03, 0.06], weight: 45, minProgTier: 2  },
      2: { label: "del Recaudador",   range: [0.08, 0.15], weight: 20, minProgTier: 6  },
      1: { label: "del Plutócrata",   range: [0.22, 0.40], weight: 6,  minProgTier: 11 },
    }},

  { id: "suffix_xp_bonus_1", stat: "xpBonus", scaling: "percent", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "del Aprendiz",     range: [0.04, 0.07], weight: 48, minProgTier: 1  },
      2: { label: "del Sabio",        range: [0.09, 0.16], weight: 21, minProgTier: 5  },
      1: { label: "de la Ascensión",  range: [0.22, 0.38], weight: 6,  minProgTier: 10 },
    }},

  { id: "suffix_xp_bonus_2", stat: "xpBonus", scaling: "percent", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "del Estudioso",    range: [0.03, 0.07], weight: 46, minProgTier: 1  },
      2: { label: "del Erudito",      range: [0.08, 0.15], weight: 20, minProgTier: 5  },
      1: { label: "del Iluminado",    range: [0.20, 0.36], weight: 6,  minProgTier: 10 },
    }},

  { id: "suffix_loot_bonus", stat: "lootBonus", scaling: "percent", category: "economy", slot: "suffix",
    tiers: {
      3: { label: "del Saqueador",    range: [0.03, 0.06], weight: 38, minProgTier: 3  },
      2: { label: "del Pillador",     range: [0.08, 0.15], weight: 17, minProgTier: 7  },
      1: { label: "del Devastador",   range: [0.20, 0.35], weight: 5,  minProgTier: 12 },
    }},

  // ── DEFENSE (SUFFIX) ──────────────────────────────────────

  { id: "suffix_health_regen_2", stat: "healthRegen", scaling: "flat", category: "defense", slot: "suffix",
    tiers: {
      3: { label: "de la Recuperación", range: [1, 2 ], weight: 50, minProgTier: 1  },
      2: { label: "de la Vitalidad",    range: [3, 6 ], weight: 22, minProgTier: 4  },
      1: { label: "de la Inmortalidad", range: [8, 15], weight: 7,  minProgTier: 9  },
    }},

  { id: "suffix_block_2", stat: "blockChance", scaling: "percent", category: "defense", slot: "suffix",
    tiers: {
      3: { label: "de la Guardia",    range: [0.02, 0.04], weight: 42, minProgTier: 2  },
      2: { label: "del Muro",         range: [0.05, 0.09], weight: 19, minProgTier: 6  },
      1: { label: "de la Fortaleza",  range: [0.12, 0.20], weight: 6,  minProgTier: 11 },
    }},

  // ── UTILITY (SUFFIX) ──────────────────────────────────────

  { id: "suffix_skill_power_2", stat: "skillPower", scaling: "percent", category: "utility", slot: "suffix",
    tiers: {
      3: { label: "del Aprendiz Arcano", range: [0.04, 0.08], weight: 38, minProgTier: 4  },
      2: { label: "del Invocador",       range: [0.10, 0.20], weight: 17, minProgTier: 8  },
      1: { label: "del Archimago",       range: [0.26, 0.48], weight: 5,  minProgTier: 13 },
    }},

  { id: "suffix_cooldown_2", stat: "cooldownReduction", scaling: "percent", category: "utility", slot: "suffix",
    tiers: {
      3: { label: "del Ágil",         range: [0.03, 0.05], weight: 36, minProgTier: 4  },
      2: { label: "del Experto",      range: [0.07, 0.13], weight: 16, minProgTier: 8  },
      1: { label: "del Eterno",       range: [0.17, 0.28], weight: 5,  minProgTier: 13 },
    }},

  // ── SPECIAL (SUFFIX) ──────────────────────────────────────

  { id: "suffix_damage_on_kill_2", stat: "damageOnKill", scaling: "flat", category: "special", slot: "suffix",
    tiers: {
      3: { label: "del Asesino",      range: [2,  5 ], weight: 42, minProgTier: 3  },
      2: { label: "del Ejecutor",     range: [6,  13], weight: 19, minProgTier: 7  },
      1: { label: "de la Exterminación", range: [16, 28], weight: 5, minProgTier: 12 },
    }},

  { id: "suffix_crit_on_low_hp_2", stat: "critOnLowHp", scaling: "percent", category: "special", slot: "suffix",
    tiers: {
      3: { label: "del Desesperado",  range: [0.03, 0.05], weight: 38, minProgTier: 5  },
      2: { label: "del Moribundo",    range: [0.07, 0.12], weight: 17, minProgTier: 9  },
      1: { label: "del Último Suspiro", range: [0.15, 0.25], weight: 5, minProgTier: 14 },
    }},

  { id: "suffix_thorns_2", stat: "thorns", scaling: "flat", category: "special", slot: "suffix",
    tiers: {
      3: { label: "de las Espinas",   range: [2,  5 ], weight: 42, minProgTier: 2  },
      2: { label: "del Suplicio",     range: [6,  13], weight: 19, minProgTier: 6  },
      1: { label: "del Martirio Supremo", range: [16, 28], weight: 5, minProgTier: 11 },
    }},

  // ── FUTURE VARIANTS ───────────────────────────────────────

  { id: "suffix_bleed_on_crit", stat: "bleedOnCrit", scaling: "flat", category: "special", slot: "suffix",
    // FUTURO_NO_ENGINE: requiere sistema de DoT en processTick y statEngine
    futureTags: ["bleed", "dot"],
    tiers: {
      3: { label: "Sangrante",        range: [3,  6 ], weight: 35, minProgTier: 5  },
      2: { label: "de la Herida",     range: [8,  16], weight: 16, minProgTier: 9  },
      1: { label: "de la Hemorragia", range: [20, 35], weight: 5,  minProgTier: 14 },
    }},

  { id: "suffix_burn_on_hit", stat: "burnOnHit", scaling: "flat", category: "special", slot: "suffix",
    // FUTURO_NO_ENGINE: requiere sistema de DoT con tipo "fire" en processTick
    futureTags: ["burn", "dot", "fire"],
    tiers: {
      3: { label: "Ardiente",         range: [2,  5 ], weight: 35, minProgTier: 5  },
      2: { label: "del Fuego",        range: [6,  14], weight: 16, minProgTier: 9  },
      1: { label: "del Infierno",     range: [18, 32], weight: 5,  minProgTier: 14 },
    }},

  { id: "prefix_barrier_on_hit", stat: "barrierOnHit", scaling: "flat", category: "defense", slot: "prefix",
    // FUTURO_NO_ENGINE: requiere sistema de escudo temporal en processTick (distinto de blockChance)
    futureTags: ["barrier", "shield", "temporal"],
    tiers: {
      3: { label: "Barrosa",          range: [5,  12], weight: 35, minProgTier: 6  },
      2: { label: "del Escudo Arcano",range: [15, 30], weight: 16, minProgTier: 10 },
      1: { label: "de la Barrera",    range: [38, 65], weight: 5,  minProgTier: 15 },
    }},

  { id: "suffix_chain_hit", stat: "chainHitChance", scaling: "percent", category: "special", slot: "suffix",
    // FUTURO_NO_ENGINE: requiere lógica de multi-hit en processTick
    futureTags: ["chain", "multihit", "arc"],
    tiers: {
      3: { label: "de la Cadena",     range: [0.05, 0.09], weight: 30, minProgTier: 7  },
      2: { label: "del Arco",         range: [0.12, 0.20], weight: 14, minProgTier: 11 },
      1: { label: "del Rayo",         range: [0.28, 0.40], weight: 4,  minProgTier: 15 },
    }},

  { id: "prefix_on_kill_proc", stat: "onKillHealPct", scaling: "percent", category: "special", slot: "prefix",
    // FUTURO_NO_ENGINE: requiere proc de heal en processTick al matar enemigo
    futureTags: ["onKill", "proc", "heal"],
    tiers: {
      3: { label: "del Drenaje",      range: [0.02, 0.04], weight: 32, minProgTier: 6  },
      2: { label: "del Vampirismo",   range: [0.05, 0.10], weight: 15, minProgTier: 10 },
      1: { label: "del Alma Robada",  range: [0.14, 0.22], weight: 4,  minProgTier: 15 },
    }},
];