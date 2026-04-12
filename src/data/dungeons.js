// Design stub: documented dungeon direction, not wired into the current runtime yet.
export const DUNGEONS = [
  {
    id: "forgotten_woods",
    name: "Bosque Olvidado",
    description: "Un bosque antiguo donde la luz apenas logra entrar.",
    minTier: 1,
    enemyTiers: [1, 2],
    bossId: "orc_warlord",
    lootBonus: 0.10,
    goldMultiplier: 1.2,
    xpMultiplier: 1.15,
    unlockCondition: {
      stat: "kills",
      value: 20,
    },
  },
  {
    id: "dark_forest",
    name: "Bosque Oscuro",
    description: "Un bosque maldito donde los árboles susurran maldiciones.",
    minTier: 3,
    enemyTiers: [2, 3, 4],
    bossId: "orc_warlord",
    lootBonus: 0.15,
    goldMultiplier: 1.5,
    xpMultiplier: 1.3,
    unlockCondition: {
      stat: "kills",
      value: 50,
    },
  },
  {
    id: "cursed_catacombs",
    name: "Catacumbas Malditas",
    description: "Restos de una civilización olvidada plagada de horrores.",
    minTier: 5,
    enemyTiers: [4, 5, 6],
    bossId: "orc_warlord",
    lootBonus: 0.20,
    goldMultiplier: 1.7,
    xpMultiplier: 1.45,
    unlockCondition: {
      stat: "kills",
      value: 120,
    },
  },
  {
    id: "void_rift",
    name: "Grieta del Vacío",
    description: "Una ruptura en la realidad de donde emergen entidades oscuras.",
    minTier: 7,
    enemyTiers: [6, 7, 8],
    bossId: "void_titan",
    lootBonus: 0.30,
    goldMultiplier: 2.0,
    xpMultiplier: 1.7,
    unlockCondition: {
      stat: "kills",
      value: 250,
    },
  },
  {
    id: "eternal_abyss",
    name: "Abismo Eterno",
    description: "Un plano donde el tiempo no existe y la muerte es inevitable.",
    minTier: 10,
    enemyTiers: [8, 9, 10],
    bossId: "void_titan",
    lootBonus: 0.40,
    goldMultiplier: 2.5,
    xpMultiplier: 2.0,
    unlockCondition: {
      stat: "kills",
      value: 500,
    },
  },

  // 🔮 FUTURO
  // Preparado para:
  // - modifiers tipo roguelike
  // - eventos dentro del dungeon
  // - rutas o decisiones
  // - dificultad escalable
  /*
  {
    modifiers: [
      { type: "enemyDamage", value: 1.2 },
      { type: "noHealing", enabled: true }
    ],
    rooms: 5,
    branchingPaths: true,
    eliteChance: 0.15
  }
  */
];
