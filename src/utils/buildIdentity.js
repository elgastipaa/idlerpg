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
      label: "Skill",
      color: "#2563eb",
      score: scoreByKeys(stats, ["cooldownReduction", "skillPower"]),
    },
  ];

  const flavorScores = [
    {
      label: "Crit",
      color: "#b45309",
      score: scoreByKeys(stats, ["critChance", "critDamage", "critOnLowHp"]),
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

function buildCandidate({ id, name, color, description, score, reasons }) {
  return { id, name, color, description, score, reasons: reasons.filter(Boolean) };
}

export function getPlayerBuildTag(player) {
  const stats = calcStats(player);
  const unlocked = getUnlockedTalentSet(player);
  const spec = player?.specialization || null;

  const offenseScore = scoreByKeys(stats, [
    "damage",
    "critChance",
    "critDamage",
    "attackSpeed",
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
  const skillScore = scoreByKeys(stats, ["cooldownReduction", "skillPower"]);
  const critScore = scoreByKeys(stats, ["critChance", "critDamage", "critOnLowHp"]);
  const sustainScore = scoreByKeys(stats, ["healthRegen", "lifesteal", "healthMax"]);
  const thornsScore = scoreByKeys(stats, ["thorns", "blockChance", "defense"]);
  const speedScore = scoreByKeys(stats, ["attackSpeed", "damageOnKill", "dodgeChance"]);

  const berserkerTalents = countTalentsWithPrefix(unlocked, "berserker_");
  const juggernautTalents = countTalentsWithPrefix(unlocked, "juggernaut_");

  const candidates = [];

  if (spec === "berserker") {
    candidates.push(
      buildCandidate({
        id: "berserker_vampirico",
        name: "Berserker Vampirico",
        color: "#D85A30",
        description: "Criticos que curan y una ofensiva que no afloja.",
        score: critScore + sustainScore + berserkerTalents * 18,
        reasons: ["criticos", "lifesteal", berserkerTalents ? "talentos berserker" : null],
      }),
      buildCandidate({
        id: "berserker_frenetico",
        name: "Berserker Frenetico",
        color: "#ea580c",
        description: "Velocidad, kills en cadena y presion constante.",
        score: speedScore + offenseScore + berserkerTalents * 16,
        reasons: ["attack speed", "damage on kill", berserkerTalents ? "frenesi" : null],
      }),
      buildCandidate({
        id: "berserker_verdugo",
        name: "Berserker Verdugo",
        color: "#c2410c",
        description: "Golpes finales brutales y criticos que rematan.",
        score: critScore + normalizeScore(stats.damage) + normalizeScore(stats.critOnLowHp) * 1.5 + berserkerTalents * 14,
        reasons: ["crit damage", "ejecucion", berserkerTalents ? "carniceria" : null],
      })
    );
  }

  if (spec === "juggernaut") {
    candidates.push(
      buildCandidate({
        id: "juggernaut_inmovible",
        name: "Juggernaut Inmovible",
        color: "#534AB7",
        description: "Bloqueo, defensa y vida al servicio de la muralla.",
        score: defenseScore + normalizeScore(stats.blockChance) * 2 + juggernautTalents * 18,
        reasons: ["block", "defensa", juggernautTalents ? "talentos juggernaut" : null],
      }),
      buildCandidate({
        id: "juggernaut_espinado",
        name: "Juggernaut Espinado",
        color: "#7c3aed",
        description: "El enemigo se rompe solo contra tu armadura.",
        score: thornsScore + defenseScore + juggernautTalents * 15,
        reasons: ["thorns", "block chance", juggernautTalents ? "piel de hierro" : null],
      }),
      buildCandidate({
        id: "juggernaut_eterno",
        name: "Juggernaut Eterno",
        color: "#4338ca",
        description: "Regen, aguante y desgaste constante.",
        score: sustainScore + defenseScore + juggernautTalents * 14,
        reasons: ["regen", "vida maxima", juggernautTalents ? "aguante" : null],
      })
    );
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
      description: "Skills frecuentes y una build mas tecnica que frontal.",
      score: skillScore + offenseScore * 0.35,
      reasons: ["cooldown", "skill power"],
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
    return scoreByKeys(stats, ["damage", "critChance", "critDamage", "attackSpeed", "lifesteal", "damageOnKill", "critOnLowHp"]) > 0;
  }
  if (buildTag.id.includes("juggernaut")) {
    return scoreByKeys(stats, ["defense", "healthMax", "healthRegen", "blockChance", "thorns"]) > 0;
  }
  if (buildTag.id.includes("tactico")) {
    return scoreByKeys(stats, ["cooldownReduction", "skillPower"]) > 0;
  }
  if (buildTag.id.includes("acumulador")) {
    return scoreByKeys(stats, ["goldBonus", "xpBonus", "essenceBonus", "lootBonus", "luck"]) > 0;
  }

  return false;
}
