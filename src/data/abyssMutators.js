export const ABYSS_MUTATORS = [
  {
    id: "crimson_assault",
    name: "Asalto Carmesi",
    description: "Todo el ciclo presiona mas con dano y tempo.",
    bossClause: "El boss gana Doble Impacto y una capa Letal.",
    commonModifiers: {
      stats: { hpMult: 1.08, damageMult: 1.16, defenseMult: 1.04 },
    },
    bossModifiers: {
      stats: { hpMult: 1.06, damageMult: 1.12 },
      affixIds: ["lethal"],
      mechanicIds: ["double_strike"],
    },
  },
  {
    id: "obsidian_bastion",
    name: "Bastion Obsidiano",
    description: "El ciclo entero aguanta mas y castiga pushes flojos.",
    bossClause: "El boss gana Escudo de Pulso y blindaje adicional.",
    commonModifiers: {
      stats: { hpMult: 1.14, defenseMult: 1.16 },
    },
    bossModifiers: {
      stats: { hpMult: 1.08, defenseMult: 1.1 },
      affixIds: ["armored"],
      mechanicIds: ["shield_every_n"],
    },
  },
  {
    id: "sanguine_rite",
    name: "Rito Sanguineo",
    description: "Los enemigos del ciclo sostienen mejor los intercambios.",
    bossClause: "El boss regenera fuerte y entra en Furia Final.",
    commonModifiers: {
      stats: { hpMult: 1.1, damageMult: 1.06 },
    },
    bossModifiers: {
      stats: { hpMult: 1.08 },
      runtime: { regenPerTick: 14 },
      affixIds: ["regenerating"],
      mechanicIds: ["enrage_low_hp"],
    },
  },
  {
    id: "fractured_front",
    name: "Frente Quebrado",
    description: "El ciclo premia menos errores defensivos y paga un poco mejor.",
    bossClause: "El boss gana Hendedura y una capa Letal.",
    commonModifiers: {
      stats: { damageMult: 1.12, defenseMult: 1.05, xpMult: 1.1, goldMult: 1.12, essenceMult: 1.15 },
    },
    bossModifiers: {
      stats: { damageMult: 1.08 },
      affixIds: ["lethal"],
      mechanicIds: ["armor_shred"],
    },
  },
  {
    id: "eclipsed_hoard",
    name: "Tesoro Eclipsado",
    description: "El ciclo sale un poco mas caro, pero paga mejor en recursos.",
    bossClause: "El boss gana Piel Impenetrable y una presencia mas pesada.",
    commonModifiers: {
      stats: { hpMult: 1.1, damageMult: 1.08, xpMult: 1.08, goldMult: 1.08, essenceMult: 1.1 },
    },
    bossModifiers: {
      stats: { hpMult: 1.08 },
      rarityBonus: { epic: 0.006, legendary: 0.0012 },
      affixIds: ["bulky"],
      mechanicIds: ["absorb_first_crit"],
    },
  },
];
