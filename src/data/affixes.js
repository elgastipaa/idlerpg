export const PREFIXES = [
  {
    id: "prefix_damage_1",
    stat: "damage",
    scaling: "flat",
    category: "offense",
    tiers: {
      3: { label: "Afilada", value: { min: 3, max: 6 }, weight: 42 },
      2: { label: "del Guerrero", value: { min: 7, max: 14 }, weight: 20 },
      1: { label: "Devastadora", value: { min: 18, max: 30 }, weight: 8 },
    },
  },
  {
    id: "prefix_damage_2",
    stat: "damage",
    scaling: "flat",
    category: "offense",
    tiers: {
      3: { label: "Sangrienta", value: { min: 4, max: 7 }, weight: 38 },
      2: { label: "Implacable", value: { min: 8, max: 16 }, weight: 18 },
      1: { label: "del Aniquilador", value: { min: 20, max: 34 }, weight: 7 },
    },
  },
  {
    id: "prefix_thorns_1",
    stat: "thorns",
    scaling: "flat",
    category: "offense",
    tiers: {
      3: { label: "Espinosa", value: { min: 2, max: 5 }, weight: 45 },
      2: { label: "de la Venganza", value: { min: 6, max: 13 }, weight: 20 },
      1: { label: "del Martirio", value: { min: 16, max: 28 }, weight: 6 },
    },
  },
  {
    id: "prefix_damage_on_kill",
    stat: "damageOnKill",
    scaling: "flat",
    category: "offense",
    tiers: {
      3: { label: "Cazadora", value: { min: 2, max: 5 }, weight: 45 },
      2: { label: "del Ejecutor", value: { min: 6, max: 12 }, weight: 20 },
      1: { label: "de la Masacre", value: { min: 14, max: 24 }, weight: 6 },
    },
  },
  {
    id: "prefix_crit_chance",
    stat: "critChance",
    scaling: "percent",
    category: "offense",
    tiers: {
      3: { label: "Certera", value: { min: 0.01, max: 0.02 }, weight: 40 },
      2: { label: "del Asesino", value: { min: 0.03, max: 0.06 }, weight: 18 },
      1: { label: "del Verdugo", value: { min: 0.08, max: 0.13 }, weight: 7 },
    },
  },
  {
    id: "prefix_crit_damage",
    stat: "critDamage",
    scaling: "percent",
    category: "offense",
    tiers: {
      3: { label: "Cruel", value: { min: 0.1, max: 0.2 }, weight: 45 },
      2: { label: "Brutal", value: { min: 0.25, max: 0.48 }, weight: 20 },
      1: { label: "del Cataclismo", value: { min: 0.6, max: 1.05 }, weight: 6 },
    },
  },
  {
    id: "prefix_attack_speed",
    stat: "attackSpeed",
    scaling: "percent",
    category: "offense",
    tiers: {
      3: { label: "Agil", value: { min: 0.02, max: 0.04 }, weight: 38 },
      2: { label: "Frenetica", value: { min: 0.05, max: 0.09 }, weight: 17 },
      1: { label: "del Relampago", value: { min: 0.12, max: 0.18 }, weight: 6 },
    },
  },
  {
    id: "prefix_multi_hit",
    stat: "multiHitChance",
    scaling: "percent",
    category: "offense",
    tiers: {
      3: { label: "de Combo", value: { min: 0.02, max: 0.04 }, weight: 40 },
      2: { label: "Encadenada", value: { min: 0.05, max: 0.08 }, weight: 18 },
      1: { label: "de la Tempestad", value: { min: 0.1, max: 0.14 }, weight: 5 },
    },
  },
  {
    id: "prefix_mark_chance",
    stat: "markChance",
    scaling: "percent",
    category: "offense",
    tiers: {
      3: { label: "Marcadora", value: { min: 0.02, max: 0.04 }, weight: 38 },
      2: { label: "de la Runa", value: { min: 0.05, max: 0.08 }, weight: 17 },
      1: { label: "de la Condena", value: { min: 0.1, max: 0.14 }, weight: 5 },
    },
  },
  {
    id: "prefix_bleed_chance",
    stat: "bleedChance",
    scaling: "percent",
    category: "offense",
    tiers: {
      3: { label: "Serrada", value: { min: 0.03, max: 0.06 }, weight: 38 },
      2: { label: "Desgarradora", value: { min: 0.07, max: 0.11 }, weight: 17 },
      1: { label: "de la Hemorragia", value: { min: 0.14, max: 0.2 }, weight: 5 },
    },
  },
  {
    id: "prefix_lifesteal",
    stat: "lifesteal",
    scaling: "percent",
    category: "offense",
    tiers: {
      3: { label: "Vampirica", value: { min: 0.01, max: 0.02 }, weight: 40 },
      2: { label: "del Vampiro", value: { min: 0.03, max: 0.06 }, weight: 18 },
      1: { label: "del Liche", value: { min: 0.08, max: 0.15 }, weight: 5 },
    },
  },
  {
    id: "prefix_crit_on_low_hp",
    stat: "critOnLowHp",
    scaling: "percent",
    category: "offense",
    tiers: {
      3: { label: "Desesperada", value: { min: 0.03, max: 0.05 }, weight: 38 },
      2: { label: "del Agonico", value: { min: 0.07, max: 0.12 }, weight: 17 },
      1: { label: "del Ultimo Aliento", value: { min: 0.15, max: 0.24 }, weight: 5 },
    },
  },
  {
    id: "prefix_defense_1",
    stat: "defense",
    scaling: "flat",
    category: "defense",
    tiers: {
      3: { label: "Reforzada", value: { min: 3, max: 6 }, weight: 55 },
      2: { label: "del Guardian", value: { min: 7, max: 15 }, weight: 25 },
      1: { label: "del Titan", value: { min: 19, max: 32 }, weight: 8 },
    },
  },
  {
    id: "prefix_defense_2",
    stat: "defense",
    scaling: "flat",
    category: "defense",
    tiers: {
      3: { label: "Solida", value: { min: 4, max: 7 }, weight: 50 },
      2: { label: "Inquebrantable", value: { min: 8, max: 16 }, weight: 22 },
      1: { label: "del Coloso", value: { min: 20, max: 34 }, weight: 7 },
    },
  },
  {
    id: "prefix_health_max_1",
    stat: "healthMax",
    scaling: "flat",
    category: "defense",
    tiers: {
      3: { label: "Robusta", value: { min: 12, max: 22 }, weight: 55 },
      2: { label: "Herculea", value: { min: 28, max: 58 }, weight: 25 },
      1: { label: "del Leviatan", value: { min: 78, max: 135 }, weight: 8 },
    },
  },
  {
    id: "prefix_health_max_2",
    stat: "healthMax",
    scaling: "flat",
    category: "defense",
    tiers: {
      3: { label: "Vital", value: { min: 14, max: 24 }, weight: 50 },
      2: { label: "del Gigante", value: { min: 30, max: 62 }, weight: 22 },
      1: { label: "del Semidios", value: { min: 82, max: 140 }, weight: 7 },
    },
  },
  {
    id: "prefix_health_regen",
    stat: "healthRegen",
    scaling: "flat",
    category: "defense",
    tiers: {
      3: { label: "Regeneradora", value: { min: 1, max: 2 }, weight: 50 },
      2: { label: "Vital", value: { min: 3, max: 6 }, weight: 22 },
      1: { label: "del Fenix", value: { min: 8, max: 15 }, weight: 7 },
    },
  },
  {
    id: "prefix_dodge",
    stat: "dodgeChance",
    scaling: "percent",
    category: "defense",
    tiers: {
      3: { label: "Escurridiza", value: { min: 0.01, max: 0.03 }, weight: 45 },
      2: { label: "del Acrobata", value: { min: 0.04, max: 0.07 }, weight: 20 },
      1: { label: "Fantasmal", value: { min: 0.09, max: 0.15 }, weight: 6 },
    },
  },
  {
    id: "prefix_block",
    stat: "blockChance",
    scaling: "percent",
    category: "defense",
    tiers: {
      3: { label: "Protectora", value: { min: 0.02, max: 0.04 }, weight: 45 },
      2: { label: "del Escudo", value: { min: 0.05, max: 0.09 }, weight: 20 },
      1: { label: "del Baluarte", value: { min: 0.12, max: 0.2 }, weight: 6 },
    },
  },
  {
    id: "prefix_skill_power",
    stat: "critDamage",
    scaling: "percent",
    category: "utility",
    tiers: {
      3: { label: "Arcana", value: { min: 0.05, max: 0.09 }, weight: 46 },
      2: { label: "de la Resonancia", value: { min: 0.12, max: 0.22 }, weight: 21 },
      1: { label: "del Cataclismo", value: { min: 0.28, max: 0.5 }, weight: 6 },
    },
  },
  {
    id: "prefix_cooldown_reduction",
    stat: "multiHitChance",
    scaling: "percent",
    category: "utility",
    tiers: {
      3: { label: "Vibrante", value: { min: 0.03, max: 0.06 }, weight: 46 },
      2: { label: "de los Ecos", value: { min: 0.08, max: 0.14 }, weight: 21 },
      1: { label: "del Torbellino", value: { min: 0.18, max: 0.3 }, weight: 6 },
    },
  },
  // Deprecated legacy affix: kept for save compatibility, disabled from new rolls.
  {
    id: "prefix_berserk_duration",
    stat: "berserkDuration",
    scaling: "flat",
    category: "utility",
    tiers: {
      3: { label: "Furiosa", value: { min: 1, max: 1 }, weight: 0 },
      2: { label: "Salvaje", value: { min: 2, max: 2 }, weight: 0 },
      1: { label: "del Berserk", value: { min: 3, max: 4 }, weight: 0 },
    },
  },
];

export const SUFFIXES = [
  {
    id: "suffix_gold_flat_1",
    stat: "goldBonus",
    scaling: "flat",
    category: "economy",
    tiers: {
      3: { label: "del Comerciante", value: { min: 3, max: 7 }, weight: 34 },
      2: { label: "del Magnate", value: { min: 8, max: 18 }, weight: 15 },
      1: { label: "del Rey Midas", value: { min: 22, max: 38 }, weight: 5 },
    },
  },
  // Legacy economy duplicates kept for save compatibility, disabled from new rolls
  // to reduce item text noise and affix redundancy.
  {
    id: "suffix_gold_flat_2",
    stat: "goldBonus",
    scaling: "flat",
    category: "economy",
    tiers: {
      3: { label: "del Saqueo", value: { min: 2, max: 6 }, weight: 0 },
      2: { label: "del Tesoro", value: { min: 7, max: 16 }, weight: 0 },
      1: { label: "del Imperio", value: { min: 20, max: 35 }, weight: 0 },
    },
  },
  {
    id: "suffix_essence_bonus",
    stat: "essenceBonus",
    scaling: "flat",
    category: "economy",
    tiers: {
      3: { label: "del Destilado", value: { min: 1, max: 2 }, weight: 32 },
      2: { label: "del Alquimista", value: { min: 3, max: 6 }, weight: 15 },
      1: { label: "de la Esencia Pura", value: { min: 7, max: 13 }, weight: 5 },
    },
  },
  {
    id: "suffix_luck_1",
    stat: "luck",
    scaling: "flat",
    category: "economy",
    tiers: {
      3: { label: "de la Fortuna", value: { min: 3, max: 8 }, weight: 32 },
      2: { label: "del Destino", value: { min: 9, max: 20 }, weight: 15 },
      1: { label: "de los Dioses", value: { min: 24, max: 42 }, weight: 5 },
    },
  },
  {
    id: "suffix_luck_2",
    stat: "luck",
    scaling: "flat",
    category: "economy",
    tiers: {
      3: { label: "del Trebol", value: { min: 2, max: 7 }, weight: 0 },
      2: { label: "del Oraculo", value: { min: 8, max: 18 }, weight: 0 },
      1: { label: "del Elegido", value: { min: 22, max: 40 }, weight: 0 },
    },
  },
  {
    id: "suffix_gold_pct",
    stat: "goldBonusPct",
    scaling: "percent",
    category: "economy",
    tiers: {
      3: { label: "del Cobrador", value: { min: 0.03, max: 0.06 }, weight: 0 },
      2: { label: "del Recaudador", value: { min: 0.08, max: 0.15 }, weight: 0 },
      1: { label: "del Plutocrata", value: { min: 0.22, max: 0.4 }, weight: 0 },
    },
  },
  {
    id: "suffix_xp_bonus_1",
    stat: "xpBonus",
    scaling: "percent",
    category: "economy",
    tiers: {
      3: { label: "del Aprendiz", value: { min: 0.04, max: 0.07 }, weight: 34 },
      2: { label: "del Sabio", value: { min: 0.09, max: 0.16 }, weight: 15 },
      1: { label: "de la Ascension", value: { min: 0.22, max: 0.38 }, weight: 5 },
    },
  },
  {
    id: "suffix_xp_bonus_2",
    stat: "xpBonus",
    scaling: "percent",
    category: "economy",
    tiers: {
      3: { label: "del Estudioso", value: { min: 0.03, max: 0.07 }, weight: 0 },
      2: { label: "del Erudito", value: { min: 0.08, max: 0.15 }, weight: 0 },
      1: { label: "del Iluminado", value: { min: 0.2, max: 0.36 }, weight: 0 },
    },
  },
  {
    id: "suffix_loot_bonus",
    stat: "lootBonus",
    scaling: "percent",
    category: "economy",
    tiers: {
      3: { label: "del Saqueador", value: { min: 0.03, max: 0.06 }, weight: 28 },
      2: { label: "del Pillador", value: { min: 0.08, max: 0.15 }, weight: 13 },
      1: { label: "del Devastador", value: { min: 0.2, max: 0.35 }, weight: 4 },
    },
  },
  {
    id: "suffix_health_regen_2",
    stat: "healthRegen",
    scaling: "flat",
    category: "defense",
    tiers: {
      3: { label: "de la Recuperacion", value: { min: 1, max: 2 }, weight: 50 },
      2: { label: "de la Vitalidad", value: { min: 3, max: 6 }, weight: 22 },
      1: { label: "de la Inmortalidad", value: { min: 8, max: 15 }, weight: 7 },
    },
  },
  {
    id: "suffix_block_2",
    stat: "blockChance",
    scaling: "percent",
    category: "defense",
    tiers: {
      3: { label: "de la Guardia", value: { min: 0.02, max: 0.04 }, weight: 42 },
      2: { label: "del Muro", value: { min: 0.05, max: 0.09 }, weight: 19 },
      1: { label: "de la Fortaleza", value: { min: 0.12, max: 0.2 }, weight: 6 },
    },
  },
  {
    id: "suffix_skill_power_2",
    stat: "critDamage",
    scaling: "percent",
    category: "utility",
    tiers: {
      3: { label: "del Aprendiz Arcano", value: { min: 0.04, max: 0.08 }, weight: 44 },
      2: { label: "del Resonante", value: { min: 0.1, max: 0.2 }, weight: 20 },
      1: { label: "del Archimago", value: { min: 0.26, max: 0.48 }, weight: 6 },
    },
  },
  {
    id: "suffix_cooldown_2",
    stat: "multiHitChance",
    scaling: "percent",
    category: "utility",
    tiers: {
      3: { label: "del Agil", value: { min: 0.03, max: 0.05 }, weight: 44 },
      2: { label: "del Eco", value: { min: 0.07, max: 0.13 }, weight: 20 },
      1: { label: "de la Cadena Eterna", value: { min: 0.17, max: 0.28 }, weight: 6 },
    },
  },
  {
    id: "suffix_mark_effect",
    stat: "markEffectPerStack",
    scaling: "percent",
    category: "special",
    tiers: {
      3: { label: "de la Runa Fina", value: { min: 0.015, max: 0.03 }, weight: 38 },
      2: { label: "del Sello", value: { min: 0.04, max: 0.07 }, weight: 17 },
      1: { label: "del Sigilo Absoluto", value: { min: 0.09, max: 0.13 }, weight: 5 },
    },
  },
  {
    id: "suffix_damage_on_kill_2",
    stat: "damageOnKill",
    scaling: "flat",
    category: "special",
    tiers: {
      3: { label: "del Asesino", value: { min: 2, max: 5 }, weight: 42 },
      2: { label: "del Ejecutor", value: { min: 6, max: 13 }, weight: 19 },
      1: { label: "de la Exterminacion", value: { min: 16, max: 28 }, weight: 5 },
    },
  },
  {
    id: "suffix_bleed_damage",
    stat: "bleedDamage",
    scaling: "percent",
    category: "special",
    tiers: {
      3: { label: "de Sangrado", value: { min: 0.02, max: 0.04 }, weight: 38 },
      2: { label: "del Desgarro", value: { min: 0.05, max: 0.08 }, weight: 17 },
      1: { label: "de la Exanguinacion", value: { min: 0.1, max: 0.14 }, weight: 5 },
    },
  },
  {
    id: "suffix_fracture_chance",
    stat: "fractureChance",
    scaling: "percent",
    category: "special",
    tiers: {
      3: { label: "de la Ruptura", value: { min: 0.02, max: 0.05 }, weight: 38 },
      2: { label: "del Quebranto", value: { min: 0.06, max: 0.09 }, weight: 17 },
      1: { label: "del Colapso", value: { min: 0.11, max: 0.16 }, weight: 5 },
    },
  },
  {
    id: "suffix_crit_on_low_hp_2",
    stat: "critOnLowHp",
    scaling: "percent",
    category: "special",
    tiers: {
      3: { label: "del Desesperado", value: { min: 0.03, max: 0.05 }, weight: 38 },
      2: { label: "del Moribundo", value: { min: 0.07, max: 0.12 }, weight: 17 },
      1: { label: "del Ultimo Suspiro", value: { min: 0.15, max: 0.25 }, weight: 5 },
    },
  },
  {
    id: "suffix_thorns_2",
    stat: "thorns",
    scaling: "flat",
    category: "special",
    tiers: {
      3: { label: "de las Espinas", value: { min: 2, max: 5 }, weight: 42 },
      2: { label: "del Suplicio", value: { min: 6, max: 13 }, weight: 19 },
      1: { label: "del Martirio Supremo", value: { min: 16, max: 28 }, weight: 5 },
    },
  },
  // Deprecated legacy affixes: kept for save compatibility, disabled from new rolls.
  {
    id: "suffix_talent_boost",
    stat: "talentBoost",
    scaling: "percent",
    category: "utility",
    tiers: {
      3: { label: "del Iniciado", value: { min: 0.03, max: 0.05 }, weight: 0 },
      2: { label: "del Experto", value: { min: 0.06, max: 0.1 }, weight: 0 },
      1: { label: "del Gran Maestro", value: { min: 0.14, max: 0.22 }, weight: 0 },
    },
  },
  {
    id: "suffix_tier_scaling",
    stat: "tierScaling",
    scaling: "percent",
    category: "utility",
    tiers: {
      3: { label: "del Explorador", value: { min: 0.02, max: 0.04 }, weight: 0 },
      2: { label: "del Veterano", value: { min: 0.05, max: 0.09 }, weight: 0 },
      1: { label: "de la Leyenda", value: { min: 0.12, max: 0.2 }, weight: 0 },
    },
  },
  {
    id: "suffix_prestige_bonus",
    stat: "prestigeBonus",
    scaling: "percent",
    category: "special",
    tiers: {
      3: { label: "del Renacido", value: { min: 0.02, max: 0.04 }, weight: 0 },
      2: { label: "del Ascendido", value: { min: 0.05, max: 0.09 }, weight: 0 },
      1: { label: "del Eterno", value: { min: 0.12, max: 0.2 }, weight: 0 },
    },
  },
];

export const ABYSS_PREFIXES = [
  {
    id: "abyss_prefix_void_strike",
    stat: "voidStrikeChance",
    scaling: "percent",
    source: "abyss",
    category: "abyss_void_strike",
    tiers: {
      3: { label: "Vacio Cortante", value: { min: 0.06, max: 0.1 }, weight: 18 },
      2: { label: "de la Incision Abisal", value: { min: 0.12, max: 0.18 }, weight: 9 },
      1: { label: "de la Hendidura Total", value: { min: 0.2, max: 0.28 }, weight: 3 },
    },
  },
  {
    id: "abyss_prefix_abyssal_crit",
    stat: "abyssalCritFractureChance",
    scaling: "percent",
    source: "abyss",
    category: "abyss_crit_fracture",
    tiers: {
      3: { label: "Abisal", value: { min: 0.08, max: 0.12 }, weight: 18 },
      2: { label: "de la Fisura Negra", value: { min: 0.14, max: 0.2 }, weight: 9 },
      1: { label: "de la Ruptura del Vacio", value: { min: 0.24, max: 0.32 }, weight: 3 },
    },
  },
  {
    id: "abyss_prefix_echo_hit",
    stat: "echoHitChance",
    scaling: "percent",
    source: "abyss",
    category: "abyss_echo_hit",
    tiers: {
      3: { label: "Ecofractal", value: { min: 0.08, max: 0.12 }, weight: 18 },
      2: { label: "de la Reverberacion", value: { min: 0.14, max: 0.18 }, weight: 9 },
      1: { label: "del Eco Infinito", value: { min: 0.22, max: 0.28 }, weight: 3 },
    },
  },
  {
    id: "abyss_prefix_corruption_amp",
    stat: "enemyAffixDamagePct",
    scaling: "percent",
    source: "abyss",
    category: "abyss_corruption_amp",
    tiers: {
      3: { label: "Corruptora", value: { min: 0.05, max: 0.08 }, weight: 18 },
      2: { label: "del Castigo Corrupto", value: { min: 0.1, max: 0.15 }, weight: 9 },
      1: { label: "de la Amplificacion Abisal", value: { min: 0.18, max: 0.24 }, weight: 3 },
    },
  },
];

export const ABYSS_SUFFIXES = [
  {
    id: "abyss_suffix_void_leech",
    stat: "enemyAffixLifesteal",
    scaling: "percent",
    source: "abyss",
    category: "abyss_void_leech",
    tiers: {
      3: { label: "del Drenaje Negro", value: { min: 0.02, max: 0.04 }, weight: 18 },
      2: { label: "del Hambre Abisal", value: { min: 0.05, max: 0.08 }, weight: 9 },
      1: { label: "del Banquete del Vacio", value: { min: 0.1, max: 0.14 }, weight: 3 },
    },
  },
  {
    id: "abyss_suffix_phase_skin",
    stat: "phaseSkin",
    scaling: "flat",
    source: "abyss",
    category: "abyss_phase_skin",
    tiers: {
      3: { label: "de la Piel Fase", value: { min: 1, max: 1 }, weight: 12 },
      2: { label: "del Velo Fase", value: { min: 1, max: 1 }, weight: 6 },
      1: { label: "de la Segunda Fase", value: { min: 1, max: 1 }, weight: 2 },
    },
  },
  {
    id: "abyss_suffix_regen",
    stat: "abyssRegenFlat",
    scaling: "flat",
    source: "abyss",
    category: "abyss_regen",
    tiers: {
      3: { label: "de la Marea Negra", value: { min: 2, max: 4 }, weight: 18 },
      2: { label: "de la Savia Abisal", value: { min: 5, max: 8 }, weight: 9 },
      1: { label: "del Pulso Sin Fondo", value: { min: 10, max: 16 }, weight: 3 },
    },
  },
  {
    id: "abyss_suffix_fracture_ward",
    stat: "bossMechanicMitigation",
    scaling: "percent",
    source: "abyss",
    category: "abyss_fracture_ward",
    tiers: {
      3: { label: "del Resguardo Roto", value: { min: 0.04, max: 0.07 }, weight: 18 },
      2: { label: "del Muro Abisal", value: { min: 0.08, max: 0.12 }, weight: 9 },
      1: { label: "de la Guardia del Fin", value: { min: 0.14, max: 0.2 }, weight: 3 },
    },
  },
];
