export const CLASSES = [
  {
    id: "warrior",
    name: "Warrior",
    description: "Especialista frontal: impacto, aguante y progreso sostenido.",
    icon: "\u2694",
    baseStats: {
      damage: 14,
      defense: 4,
      critChance: 0.03,
      maxHp: 120,
    },
    playstyle: "frontal",
    tags: ["melee", "physical"],
    scaling: {
      primary: "damage",
      secondary: "defense",
    },
    specializations: [
      {
        id: "berserker",
        name: "Berserker",
        description: "Critico, leech y cadenas salvajes al borde del colapso.",
        bonuses: {
          damage: 10,
          defense: -3,
          critChance: 0.06,
        },
        unlockCondition: { stat: "kills", value: 200 },
        tags: ["glass_cannon", "rage_scaling"],
        mechanics: {
          scaling: "missingHp",
        },
      },
      {
        id: "juggernaut",
        name: "Juggernaut",
        description: "Muralla viviente que convierte aguante en castigo.",
        bonuses: {
          maxHp: 40,
          defense: 6,
          damage: -3,
        },
        unlockCondition: { stat: "level", value: 18 },
        tags: ["tank", "defense_to_damage"],
        mechanics: {
          scaling: "defense_to_damage",
        },
      },
    ],
    progression: {
      talentTrees: ["warrior_general", "berserker", "juggernaut"],
    },
  },
  {
    id: "mage",
    name: "Mage",
    description: "Caster single-target que gana por setup, flow y precision.",
    icon: "\ud83d\udd2e",
    baseStats: {
      damage: 11,
      defense: 1,
      critChance: 0.06,
      maxHp: 85,
    },
    playstyle: "caster",
    tags: ["ranged", "arcane"],
    scaling: {
      primary: "damage",
      secondary: "critChance",
    },
    specializations: [
      {
        id: "sorcerer",
        name: "Sorcerer",
        description: "Burst volatil, opener fuerte y cadenas de bajas.",
        bonuses: {
          damage: 8,
          critChance: 0.03,
        },
        unlockCondition: { stat: "level", value: 18 },
        tags: ["burst", "volatile"],
        mechanics: {
          scaling: "burst_chain",
        },
      },
      {
        id: "arcanist",
        name: "Arcanist",
        description: "Control del objetivo, transferencias limpias y bossing consistente.",
        bonuses: {
          damage: 4,
          maxHp: 18,
          critChance: 0.02,
        },
        unlockCondition: { stat: "kills", value: 200 },
        tags: ["control", "ramp"],
        mechanics: {
          scaling: "mark_flow",
        },
      },
    ],
    progression: {
      talentTrees: ["mage_general", "sorcerer", "arcanist"],
    },
  },
];
