import { calcStats } from "../engine/combat/statEngine";

function normalizeScore(value) {
  const numeric = Number(value || 0);
  if (!numeric) return 0;
  return Math.abs(numeric) < 1 ? numeric * 100 : numeric;
}

function scoreByKeys(stats, keys) {
  return keys.reduce((total, key) => total + normalizeScore(stats[key]), 0);
}

function getItemStats(item) {
  return item?.bonus || {};
}

export function getItemBuildTags(item) {
  const stats = getItemStats(item);
  const archetypeScores = [
    {
      label: "Berserker",
      color: "#D85A30",
      score: scoreByKeys(stats, [
        "damage",
        "critChance",
        "critDamage",
        "attackSpeed",
        "multiHitChance",
        "bleedChance",
        "bleedDamage",
        "lifesteal",
        "damageOnKill",
        "critOnLowHp",
      ]),
    },
    {
      label: "Juggernaut",
      color: "#534AB7",
      score: scoreByKeys(stats, [
        "defense",
        "healthMax",
        "healthRegen",
        "blockChance",
        "thorns",
        "fractureChance",
      ]),
    },
    {
      label: "Economia",
      color: "#0f766e",
      score: scoreByKeys(stats, [
        "goldBonus",
        "xpBonus",
        "essenceBonus",
        "lootBonus",
        "luck",
      ]),
    },
    {
      label: "Caster",
      color: "#2563eb",
      score: scoreByKeys(stats, ["critDamage", "multiHitChance", "markChance", "markEffectPerStack"]),
    },
  ];

  const flavorScores = [
    {
      label: "Crit",
      color: "#b45309",
      score: scoreByKeys(stats, ["critChance", "critDamage", "critOnLowHp"]),
    },
    {
      label: "Bleed",
      color: "#be123c",
      score: scoreByKeys(stats, ["bleedChance", "bleedDamage", "multiHitChance"]),
    },
    {
      label: "Block",
      color: "#4338ca",
      score: scoreByKeys(stats, ["blockChance", "defense"]),
    },
    {
      label: "Regen",
      color: "#059669",
      score: scoreByKeys(stats, ["healthRegen", "healthMax", "lifesteal"]),
    },
    {
      label: "Speed",
      color: "#0284c7",
      score: scoreByKeys(stats, ["attackSpeed", "dodgeChance"]),
    },
    {
      label: "Thorns",
      color: "#be123c",
      score: scoreByKeys(stats, ["thorns", "damageOnKill"]),
    },
  ];

  const tags = [];
  const bestArchetype = [...archetypeScores].sort((a, b) => b.score - a.score)[0];
  const bestFlavor = [...flavorScores].sort((a, b) => b.score - a.score)[0];

  if (bestArchetype?.score > 0) tags.push(bestArchetype);
  if (bestFlavor?.score > 0 && bestFlavor.label !== bestArchetype?.label) tags.push(bestFlavor);

  return tags.slice(0, 2);
}

function getUnlockedTalentSet(player) {
  return new Set(player?.unlockedTalents || []);
}

function countTalentsWithPrefix(unlocked, prefix) {
  return [...unlocked].filter(id => id.startsWith(prefix)).length;
}

function hasTalent(unlocked, talentId) {
  return unlocked.has(talentId);
}

function buildCandidate({ id, name, color, description, score, reasons }) {
  return { id, name, color, description, score, reasons: reasons.filter(Boolean) };
}

function getMageBuildTag({ stats, unlocked, spec }) {
  const spellScore = scoreByKeys(stats, ["damage", "critChance", "critDamage", "multiHitChance", "markChance", "markEffectPerStack"]);
  const markScore =
    normalizeScore(stats.markChance) * 1.4 +
    normalizeScore(stats.markEffectPerStack) * 1.8 +
    normalizeScore(stats.controlMastery) * 1.6 +
    normalizeScore(stats.markTransferPct) * 1.2;
  const flowScore =
    normalizeScore((stats.flowBonusMult || 1) - 1) * 1.6 +
    normalizeScore((stats.freshTargetDamageMult || 1) - 1) * 1.4 +
    normalizeScore(stats.chainBurst || 0) * 18;
  const consistencyScore = Math.max(0, 1.25 - ((stats.damageRangeMax || 1) - (stats.damageRangeMin || 1))) * 100;
  const volatilityScore =
    Math.max(0, (stats.damageRangeMax || 1) - (stats.damageRangeMin || 1)) * 120 +
    normalizeScore(stats.critDamage) * 0.8 +
    normalizeScore(stats.volatileCasting || 0) * 18;
  const echoScore =
    normalizeScore(stats.multiHitChance) * 1.4 +
    normalizeScore(Math.max(0, (stats.multiHitDamageMult || 1) - 0.35)) * 1.2;
  const loopScore =
    normalizeScore(stats.markTransferPct) * 1.8 +
    normalizeScore(stats.temporalFlowPerStack || 0) * 2.4 +
    normalizeScore(stats.spellMemoryMarkEffectPerStack || 0) * 2.8;

  const candidates = [];

  if (!spec) {
    if (hasTalent(unlocked, "mage_overchannel")) {
      candidates.push(
        buildCandidate({
          id: "mage_overchannel",
          name: "Mage Overchannel",
          color: "#2563eb",
          description: "Ecos agresivos que apilan setup y convierten cada cadena en presion.",
          score: spellScore + echoScore + markScore * 0.55 + 360,
          reasons: ["echo", "multi-hit", "setup"],
        })
      );
    }

    if (hasTalent(unlocked, "mage_perfect_cast")) {
      candidates.push(
        buildCandidate({
          id: "mage_perfect_cast",
          name: "Mage Perfect Cast",
          color: "#4338ca",
          description: "Casteo limpio, dano estable y precision sobre un solo golpe bueno.",
          score: spellScore + consistencyScore + markScore * 0.3 + 360,
          reasons: ["consistencia", "precision", "burst limpio"],
        })
      );
    }

    if (hasTalent(unlocked, "mage_arcane_mark")) {
      candidates.push(
        buildCandidate({
          id: "mage_arcane_mark",
          name: "Mage Arcane Mark",
          color: "#7c3aed",
          description: "Cada enemigo necesita preparacion antes del hit importante.",
          score: spellScore + markScore + 260,
          reasons: ["mark", "setup", "control"],
        })
      );
    }

    if (hasTalent(unlocked, "mage_arcane_flow")) {
      candidates.push(
        buildCandidate({
          id: "mage_arcane_flow",
          name: "Mage Arcane Flow",
          color: "#0f766e",
          description: "La ventaja de un objetivo se arrastra al siguiente sin perder ritmo.",
          score: spellScore + flowScore + 260,
          reasons: ["flow", "chain", "tempo"],
        })
      );
    }
  }

  if (spec === "sorcerer") {
    if (hasTalent(unlocked, "sorcerer_cataclysm")) {
      candidates.push(
        buildCandidate({
          id: "sorcerer_cataclysm",
          name: "Sorcerer Cataclysm",
          color: "#ea580c",
          description: "Cada kill prepara un opener brutal sobre el siguiente objetivo.",
          score: spellScore + flowScore * 1.2 + volatilityScore * 0.8 + 380,
          reasons: ["opener", "chain burst", "volatilidad"],
        })
      );
    }

    if (hasTalent(unlocked, "sorcerer_volatile_casting")) {
      candidates.push(
        buildCandidate({
          id: "sorcerer_volatile_casting",
          name: "Sorcerer Volatile Casting",
          color: "#f97316",
          description: "Un hit alto ceba el siguiente; un hit flojo te castiga el ritmo.",
          score: spellScore + volatilityScore + 380,
          reasons: ["rango de dano", "critico", "highlight"],
        })
      );
    }

    if (hasTalent(unlocked, "sorcerer_overload")) {
      candidates.push(
        buildCandidate({
          id: "sorcerer_overload",
          name: "Sorcerer Overload",
          color: "#fb923c",
          description: "Los criticos y picos altos cargan la Marca mucho mas rapido.",
          score: spellScore + volatilityScore * 0.7 + markScore + 320,
          reasons: ["mark burst", "critico", "setup"],
        })
      );
    }
  }

  if (spec === "arcanist") {
    if (hasTalent(unlocked, "arcanist_absolute_control")) {
      candidates.push(
        buildCandidate({
          id: "arcanist_absolute_control",
          name: "Arcanist Absolute Control",
          color: "#7c3aed",
          description: "Si el objetivo no esta marcado, la build no quiere pegar todavia.",
          score: spellScore + markScore * 1.2 + consistencyScore * 0.8 + 380,
          reasons: ["control", "mark", "bossing"],
        })
      );
    }

    if (hasTalent(unlocked, "arcanist_time_loop")) {
      candidates.push(
        buildCandidate({
          id: "arcanist_time_loop",
          name: "Arcanist Time Loop",
          color: "#4f46e5",
          description: "El setup sobrevive al cambio de objetivo y la run nunca arranca de cero.",
          score: spellScore + loopScore + consistencyScore * 0.6 + 380,
          reasons: ["transfer", "loop", "flow"],
        })
      );
    }

    if (hasTalent(unlocked, "arcanist_temporal_flow") || hasTalent(unlocked, "arcanist_spell_memory")) {
      candidates.push(
        buildCandidate({
          id: "arcanist_temporal_flow",
          name: "Arcanist Temporal Flow",
          color: "#6366f1",
          description: "El dano mejora cuanto mas ordenado sea el intercambio sobre el mismo objetivo.",
          score: spellScore + loopScore * 0.8 + markScore * 0.6 + 320,
          reasons: ["ramp", "memoria", "control"],
        })
      );
    }
  }

  candidates.push(
    buildCandidate({
      id: "mage_echo",
      name: "Mage de Ecos",
      color: "#2563eb",
      description: "Caster de golpes encadenados que explota on-hits y setup corto.",
      score: spellScore + echoScore,
      reasons: ["multi-hit", "echo", "ritmo"],
    }),
    buildCandidate({
      id: "mage_mark",
      name: "Mage de Marcas",
      color: "#7c3aed",
      description: "Build de preparacion, control del objetivo y payoff medido.",
      score: spellScore + markScore,
      reasons: ["mark", "control", "setup"],
    }),
    buildCandidate({
      id: "mage_consistente",
      name: "Mage Consistente",
      color: "#1d4ed8",
      description: "Prefiere rangos estables y dano confiable sobre highlights aleatorios.",
      score: spellScore + consistencyScore,
      reasons: ["consistencia", "precision"],
    }),
    buildCandidate({
      id: "mage_volatil",
      name: "Mage Volatil",
      color: "#f59e0b",
      description: "Busca picos altos, criticos y golpes que definan el combate.",
      score: spellScore + volatilityScore,
      reasons: ["picos", "critico", "burst"],
    })
  );

  return candidates.sort((a, b) => b.score - a.score)[0] || {
    id: "mage",
    name: "Mage",
    color: "#2563eb",
    description: "Todavia no hay una identidad dominante definida.",
    score: 0,
    reasons: [],
  };
}

export function getPlayerBuildTag(player) {
  const stats = calcStats(player);
  const unlocked = getUnlockedTalentSet(player);
  const spec = player?.specialization || null;

  if (player?.class === "mage") {
    return getMageBuildTag({ stats, unlocked, spec });
  }

  const offenseScore = scoreByKeys(stats, [
    "damage",
    "critChance",
    "critDamage",
    "attackSpeed",
    "multiHitChance",
    "bleedChance",
    "bleedDamage",
    "lifesteal",
    "damageOnKill",
    "critOnLowHp",
  ]);
  const defenseScore = scoreByKeys(stats, [
    "defense",
    "healthMax",
    "healthRegen",
    "blockChance",
    "thorns",
    "dodgeChance",
  ]);
  const economyScore = scoreByKeys(stats, [
    "goldBonus",
    "xpBonus",
    "essenceBonus",
    "lootBonus",
    "luck",
  ]);
  const skillScore = scoreByKeys(stats, ["critDamage", "multiHitChance", "markChance", "markEffectPerStack"]);
  const critScore = scoreByKeys(stats, ["critChance", "critDamage", "critOnLowHp"]);
  const bleedScore = scoreByKeys(stats, ["bleedChance", "bleedDamage", "multiHitChance"]);
  const sustainScore = scoreByKeys(stats, ["healthRegen", "lifesteal", "healthMax"]);
  const thornsScore = scoreByKeys(stats, ["thorns", "blockChance", "defense", "fractureChance"]);
  const speedScore = scoreByKeys(stats, ["attackSpeed", "multiHitChance", "damageOnKill", "dodgeChance"]);

  const berserkerTalents = countTalentsWithPrefix(unlocked, "berserker_");
  const juggernautTalents = countTalentsWithPrefix(unlocked, "juggernaut_");

  const candidates = [];

  if (!spec) {
    if (hasTalent(unlocked, "warrior_iron_conversion") || hasTalent(unlocked, "warrior_precision_drill")) {
      candidates.push(
        buildCandidate({
          id: "warrior_iron_conversion",
          name: "Warrior Iron Conversion",
          color: "#475569",
          description: "Armadura convertida en golpe pesado y estable.",
          score: defenseScore + normalizeScore(stats.damage) * 0.8 + 320,
          reasons: ["armadura", "dano estable", "conversion"],
        })
      );
    }

    if (hasTalent(unlocked, "warrior_crushing_weight") || hasTalent(unlocked, "warrior_veteran_instinct")) {
      candidates.push(
        buildCandidate({
          id: "warrior_crushing_weight",
          name: "Warrior Crushing Weight",
          color: "#7c2d12",
          description: "Sin cadenas, pero con un primer golpe devastador.",
          score: normalizeScore(stats.damage) * 1.2 + critScore * 0.6 + 320,
          reasons: ["golpe inicial", "peso", "critico"],
        })
      );
    }

    if (hasTalent(unlocked, "warrior_blood_strikes")) {
      candidates.push(
        buildCandidate({
          id: "warrior_blood_strikes",
          name: "Warrior Blood Strikes",
          color: "#be123c",
          description: "Golpes que convierten cada herida en dano sostenido.",
          score: bleedScore + normalizeScore(stats.damage) * 0.5 + 280,
          reasons: ["sangrado", "presion", "multi-hit"],
        })
      );
    }

    if (hasTalent(unlocked, "warrior_combat_flow")) {
      candidates.push(
        buildCandidate({
          id: "warrior_combat_flow",
          name: "Warrior Combat Flow",
          color: "#0f766e",
          description: "Cuanto mas dura el intercambio, mejor se mueve la build.",
          score: normalizeScore(stats.damage) + speedScore * 0.6 + sustainScore * 0.45 + 260,
          reasons: ["ritmo", "cadena", "bossing"],
        })
      );
    }
  }

  if (spec === "berserker") {
    if (hasTalent(unlocked, "berserker_blood_debt") || hasTalent(unlocked, "berserker_butcher_stride")) {
      candidates.push(
        buildCandidate({
          id: "berserker_blood_debt",
          name: "Berserker Blood Debt",
          color: "#b91c1c",
          description: "El leech alimenta Rage y cada intercambio acelera la run.",
          score: sustainScore + speedScore + berserkerTalents * 18 + 360,
          reasons: ["leech", "rage", "ritmo"],
        })
      );
    }

    if (hasTalent(unlocked, "berserker_frenzied_chain") || hasTalent(unlocked, "berserker_carnage")) {
      candidates.push(
        buildCandidate({
          id: "berserker_frenzied_chain",
          name: "Berserker Frenzied Chain",
          color: "#ea580c",
          description: "Cadenas de golpes que fracturan y desarman al objetivo.",
          score: speedScore + bleedScore + normalizeScore(stats.fractureChance) * 1.5 + berserkerTalents * 18 + 360,
          reasons: ["multi-hit", "fractura", "cadena"],
        })
      );
    }

    if (hasTalent(unlocked, "berserker_last_breath") || hasTalent(unlocked, "berserker_last_laugh")) {
      candidates.push(
        buildCandidate({
          id: "berserker_last_breath",
          name: "Berserker Last Breath",
          color: "#c2410c",
          description: "Cuanto mas cerca del borde, mas salvaje pega.",
          score: critScore + normalizeScore(stats.damage) + sustainScore * 0.5 + berserkerTalents * 18 + 360,
          reasons: ["low life", "dano", "aguante"],
        })
      );
    }
  }

  if (spec === "juggernaut") {
    if (hasTalent(unlocked, "juggernaut_unmoving_mountain") || hasTalent(unlocked, "juggernaut_siege_wall")) {
      candidates.push(
        buildCandidate({
          id: "juggernaut_unmoving_mountain",
          name: "Juggernaut Unmoving Mountain",
          color: "#534AB7",
          description: "La muralla definitiva: avanza lento, pero no cede.",
          score: defenseScore * 1.35 + juggernautTalents * 18 + 360,
          reasons: ["defensa", "muro", "peso"],
        })
      );
    }

    if (hasTalent(unlocked, "juggernaut_spiked_defense") || hasTalent(unlocked, "juggernaut_titan_skin")) {
      candidates.push(
        buildCandidate({
          id: "juggernaut_spiked_bastion",
          name: "Juggernaut Spiked Bastion",
          color: "#7c3aed",
          description: "Todo golpe recibido vuelve convertido en castigo.",
          score: thornsScore + defenseScore + juggernautTalents * 16 + 360,
          reasons: ["espinas", "defensa", "represalia"],
        })
      );
    }

    if (hasTalent(unlocked, "juggernaut_titanic_momentum") || hasTalent(unlocked, "juggernaut_last_bulwark")) {
      candidates.push(
        buildCandidate({
          id: "juggernaut_titanic_momentum",
          name: "Juggernaut Titanic Momentum",
          color: "#4338ca",
          description: "Cada segundo en combate empuja tu poder un poco mas arriba.",
          score: sustainScore + defenseScore + normalizeScore(stats.damage) * 0.6 + juggernautTalents * 16 + 360,
          reasons: ["ramp-up", "aguante", "tempo"],
        })
      );
    }
  }

  candidates.push(
    buildCandidate({
      id: "warrior_critico",
      name: "Warrior Critico",
      color: "#b45309",
      description: "Golpes pesados con una clara obsesion por el critico.",
      score: critScore + normalizeScore(stats.damage),
      reasons: ["crit chance", "crit damage"],
    }),
    buildCandidate({
      id: "warrior_sangrante",
      name: "Warrior Sangrante",
      color: "#be123c",
      description: "Golpes que abren heridas y convierten el tiempo en dano.",
      score: bleedScore + normalizeScore(stats.damage) * 0.45,
      reasons: ["bleed", "multi-hit"],
    }),
    buildCandidate({
      id: "warrior_baluarte",
      name: "Warrior Baluarte",
      color: "#1d4ed8",
      description: "Un frente estable que aguanta y responde.",
      score: defenseScore + normalizeScore(stats.blockChance),
      reasons: ["defensa", "vida", "bloqueo"],
    }),
    buildCandidate({
      id: "warrior_tactico",
      name: "Warrior Tactico",
      color: "#2563eb",
      description: "Golpes encadenados, precision y una build mas tecnica que frontal.",
      score: skillScore + offenseScore * 0.35,
      reasons: ["multi-hit", "precision"],
    }),
    buildCandidate({
      id: "warrior_acumulador",
      name: "Warrior Acumulador",
      color: "#0f766e",
      description: "Una run orientada a recursos, drops y progreso.",
      score: economyScore + normalizeScore(stats.damage) * 0.2,
      reasons: ["oro", "esencia", "luck"],
    }),
    buildCandidate({
      id: "warrior_equilibrado",
      name: "Warrior Equilibrado",
      color: "#475569",
      description: "Ataque y defensa repartidos sin una obsesion dominante.",
      score: offenseScore * 0.8 + defenseScore * 0.8,
      reasons: ["balance", "solidez"],
    })
  );

  const top = candidates.sort((a, b) => b.score - a.score)[0];
  return top || {
    id: "warrior",
    name: "Warrior",
    color: "#475569",
    description: "Todavia no hay una identidad dominante definida.",
    score: 0,
    reasons: [],
  };
}

export function itemMatchesBuildTag(item, buildTag) {
  if (!item || !buildTag) return false;
  const stats = item?.bonus || {};

  if (buildTag.id.includes("berserker")) {
    return scoreByKeys(stats, ["damage", "critChance", "critDamage", "attackSpeed", "multiHitChance", "bleedChance", "bleedDamage", "lifesteal", "damageOnKill", "critOnLowHp"]) > 0;
  }
  if (buildTag.id.includes("mage")) {
    return scoreByKeys(stats, ["damage", "critChance", "critDamage", "multiHitChance", "markChance", "markEffectPerStack"]) > 0;
  }
  if (buildTag.id.includes("sorcerer")) {
    return scoreByKeys(stats, ["damage", "critChance", "critDamage", "multiHitChance", "markChance", "markEffectPerStack"]) > 0;
  }
  if (buildTag.id.includes("arcanist")) {
    return scoreByKeys(stats, ["damage", "critChance", "critDamage", "multiHitChance", "markChance", "markEffectPerStack"]) > 0;
  }
  if (buildTag.id.includes("juggernaut")) {
    return scoreByKeys(stats, ["defense", "healthMax", "healthRegen", "blockChance", "thorns", "fractureChance"]) > 0;
  }
  if (buildTag.id.includes("iron_conversion")) {
    return scoreByKeys(stats, ["defense", "healthMax", "blockChance", "damage", "fractureChance"]) > 0;
  }
  if (buildTag.id.includes("crushing_weight")) {
    return scoreByKeys(stats, ["damage", "critChance", "critDamage", "healthMax", "attackSpeed"]) > 0;
  }
  if (buildTag.id.includes("blood_strikes")) {
    return scoreByKeys(stats, ["bleedChance", "bleedDamage", "multiHitChance", "damage", "lifesteal"]) > 0;
  }
  if (buildTag.id.includes("combat_flow")) {
    return scoreByKeys(stats, ["damage", "attackSpeed", "multiHitChance", "healthMax", "lifesteal"]) > 0;
  }
  if (buildTag.id.includes("critico")) {
    return scoreByKeys(stats, ["damage", "critChance", "critDamage", "attackSpeed", "multiHitChance"]) > 0;
  }
  if (buildTag.id.includes("sangrante")) {
    return scoreByKeys(stats, ["bleedChance", "bleedDamage", "multiHitChance", "damage"]) > 0;
  }
  if (buildTag.id.includes("baluarte")) {
    return scoreByKeys(stats, ["defense", "healthMax", "healthRegen", "blockChance", "thorns"]) > 0;
  }
  if (buildTag.id.includes("tactico")) {
    return scoreByKeys(stats, ["critDamage", "multiHitChance", "markChance", "markEffectPerStack"]) > 0;
  }
  if (buildTag.id.includes("acumulador")) {
    return scoreByKeys(stats, ["goldBonus", "xpBonus", "essenceBonus", "lootBonus", "luck"]) > 0;
  }
  if (buildTag.id.includes("equilibrado")) {
    return scoreByKeys(stats, ["damage", "defense", "healthMax", "critChance", "blockChance"]) > 0;
  }

  return false;
}
