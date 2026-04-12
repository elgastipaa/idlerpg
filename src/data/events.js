export const EVENTS = [
  // =========================
  // 🟢 POSITIVOS - onKill
  // =========================
  {
    id: "wandering_merchant",
    name: "Mercader Errante",
    description: "Un mercader aparece ofreciendo sus mercancías.",
    trigger: "onKill",
    chance: 0.05,
    minTier: 1,
    type: "positive",
    effect: {
      type: "goldBonus",
      value: 50,
      duration: null,
      message: "¡El mercader te regala 50 de oro!",
    },
    flavourText: "— ¡Tengo lo que buscás, viajero!",
  },
  {
    id: "healing_fountain",
    name: "Fuente Curativa",
    description: "Descubrís una fuente que emana energía vital.",
    trigger: "onKill",
    chance: 0.04,
    minTier: 1,
    type: "positive",
    effect: {
      type: "heal",
      value: 0.25, // 25% de vida
      duration: null,
      message: "Recuperás un 25% de tu vida.",
    },
    flavourText: "El agua brilla con una luz reconfortante.",
  },
  {
    id: "ancient_knowledge",
    name: "Conocimiento Antiguo",
    description: "Un susurro arcano fortalece tu mente.",
    trigger: "onKill",
    chance: 0.03,
    minTier: 2,
    type: "positive",
    effect: {
      type: "xpBonus",
      value: 0.20,
      duration: 5,
      message: "Ganas +20% de experiencia por 5 combates.",
    },
    flavourText: "El pasado te susurra secretos olvidados.",
  },

  // =========================
  // 🔴 NEGATIVOS - onKill
  // =========================
  {
    id: "cursed_wound",
    name: "Herida Maldita",
    description: "El enemigo deja una marca oscura en vos.",
    trigger: "onKill",
    chance: 0.03,
    minTier: 2,
    type: "negative",
    effect: {
      type: "curse_damage",
      value: 0.20,
      duration: 5,
      message: "Tu daño se reduce un 20% por 5 combates.",
    },
    flavourText: "La herida no sangra… pero quema.",
  },
  {
    id: "thief_shadow",
    name: "Sombra Ladrona",
    description: "Algo invisible roba parte de tu botín.",
    trigger: "onKill",
    chance: 0.02,
    minTier: 3,
    type: "negative",
    effect: {
      type: "curse_gold",
      value: 0.30,
      duration: 4,
      message: "Obtienes 30% menos oro por 4 combates.",
    },
    flavourText: "Sentís que alguien te observa… demasiado cerca.",
  },

  // =========================
  // 🟡 NEUTRO
  // =========================
  {
    id: "strange_shrine",
    name: "Santuario Extraño",
    description: "Un altar antiguo reacciona a tu presencia.",
    trigger: "onKill",
    chance: 0.03,
    minTier: 2,
    type: "neutral",
    effect: {
      type: "essenceBonus",
      value: 0,
      duration: null,
      message: "El santuario vibra... pero no pasa nada.",
    },
    flavourText: "Tal vez hiciste algo… o tal vez no.",
  },

  // =========================
  // 🟣 ON LEVEL UP
  // =========================
  {
    id: "level_blessing",
    name: "Bendición del Crecimiento",
    description: "Tu progreso es recompensado por fuerzas superiores.",
    trigger: "onLevelUp",
    chance: 1,
    minTier: 1,
    type: "positive",
    effect: {
      type: "blessing",
      value: 0.15,
      duration: 10,
      message: "Ganas +15% de todo por 10 combates.",
    },
    flavourText: "Ascender tiene sus recompensas.",
  },

  // =========================
  // 🟠 ON BOSS (casi garantizados)
  // =========================
  {
    id: "boss_treasure",
    name: "Tesoro del Jefe",
    description: "El enemigo cae y deja un botín excepcional.",
    trigger: "onBoss",
    chance: 0.9,
    minTier: 1,
    type: "positive",
    effect: {
      type: "lootDrop",
      value: 0.50,
      duration: 1,
      message: "Aumenta enormemente el loot del siguiente drop.",
    },
    flavourText: "Un premio digno de la batalla.",
  },
  {
    id: "boss_essence_burst",
    name: "Explosión de Esencia",
    description: "La energía del jefe se libera al morir.",
    trigger: "onBoss",
    chance: 0.8,
    minTier: 2,
    type: "positive",
    effect: {
      type: "essenceBonus",
      value: 100,
      duration: null,
      message: "Obtienes 100 de esencia.",
    },
    flavourText: "La esencia fluye sin control.",
  },

  // =========================
  // 🔥 HIGH TIER (>=6)
  // =========================
  {
    id: "reality_tear",
    name: "Grieta de la Realidad",
    description: "Una fisura dimensional altera el flujo del loot.",
    trigger: "onKill",
    chance: 0.03,
    minTier: 6,
    type: "positive",
    effect: {
      type: "rarityBonus",
      value: 0.25,
      duration: 5,
      message: "Mayor probabilidad de items raros por 5 combates.",
    },
    flavourText: "El mundo no debería comportarse así.",
  },
  {
    id: "void_decay",
    name: "Decaimiento del Vacío",
    description: "El vacío consume parte de tu poder.",
    trigger: "onKill",
    chance: 0.025,
    minTier: 6,
    type: "negative",
    effect: {
      type: "curse_damage",
      value: 0.30,
      duration: 6,
      message: "Pierdes 30% de daño por 6 combates.",
    },
    flavourText: "El vacío siempre cobra su precio.",
  },

  // =========================
  // 💎 EXTRA (profundidad sistema)
  // =========================
  {
    id: "essence_windfall",
    name: "Lluvia de Esencia",
    description: "Fragmentos de esencia caen del cielo.",
    trigger: "onKill",
    chance: 0.04,
    minTier: 3,
    type: "positive",
    effect: {
      type: "essenceBonus",
      value: 50,
      duration: null,
      message: "Obtienes 50 de esencia.",
    },
    flavourText: "El aire mismo se solidifica en poder.",
  },
  {
    id: "gold_rush",
    name: "Fiebre del Oro",
    description: "Todo parece valer más de lo normal.",
    trigger: "onKill",
    chance: 0.035,
    minTier: 2,
    type: "positive",
    effect: {
      type: "goldBonus",
      value: 0.50,
      duration: 5,
      message: "Ganas +50% de oro por 5 combates.",
    },
    flavourText: "Cada enemigo brilla como un tesoro.",
  },
];