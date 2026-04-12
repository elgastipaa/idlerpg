export const CLASSES = [
  {
    id: "warrior",
    name: "Warrior",
    description: "Especialista en combate cuerpo a cuerpo. Alta defensa y daño sostenido.",
    icon: "⚔️",

    baseStats: {
      damage: 14,
      defense: 4,
      critChance: 0.03,
      maxHp: 120,
    },

    playstyle: "tank",

    // 🧠 NUEVO → metadata para engines futuros
    tags: ["melee", "physical"],
    scaling: {
      primary: "damage",
      secondary: "defense",
    },

    // 🔮 FUTURO: sin romper nada
    resource: {
      type: "rage",
      max: 100,
      decayPerTick: 2,
      gain: {
        onHit: 5,
        onKill: 10,
        onDamageTaken: 3,
      },
    },

    specializations: [
      {
        id: "berserker",
        name: "Berserker",
        description: "Abandonás toda defensa para desatar una furia imparable.",

        bonuses: {
          damage: 10,
          defense: -3,
          critChance: 0.06,
        },

        unlockCondition: { stat: "kills", value: 200 },

        // 🧠 identidad clara
        tags: ["glass_cannon", "rage_scaling"],

        mechanics: {
          scaling: "missingHp", // más daño cuanto menos HP
        },
      },

      {
        id: "juggernaut",
        name: "Juggernaut",
        description: "Una muralla viviente que avanza sin detenerse.",

        bonuses: {
          maxHp: 40,
          defense: 6,
          damage: -3,
        },

        unlockCondition: { stat: "level", value: 18 },

        tags: ["tank", "scaling_defense"],

        mechanics: {
          scaling: "defense_to_damage", // convierte defense en daño
        },
      },
    ],

    // 🔮 FUTURO (no rompe nada)
    progression: {
      talentTrees: ["warrior_general", "berserker", "juggernaut"],
    },
  },

  // ⚠️ resto intacto
  // (no lo repito para no ensuciar, lo dejás igual)
];