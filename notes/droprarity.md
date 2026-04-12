export const DROP_WEIGHTS_BY_RARITY = {

  // Peso base por rareza — suma total no tiene que ser 100
  // Se usa para weighted pick proporcional
  rarityWeights: {
    common:    { base: 55, bossBonus: 0,   tierScaling: 0     },
    magic:     { base: 30, bossBonus: 5,   tierScaling: 0     },
    rare:      { base: 12, bossBonus: 10,  tierScaling: 0.3   }, // +0.3 por tier
    epic:      { base: 2,  bossBonus: 15,  tierScaling: 0.15  },
    legendary: { base: 0.3,bossBonus: 8,   tierScaling: 0.05  },
  },

  // Peso por familia dentro de su slot — para pickear qué familia droppea
  weaponFamilyWeights: {
    sword:      18,
    axe:        16,
    mace:       14,
    dagger:     16,
    spear:      12,
    greatsword: 10,
    staff:      8,
    hammer:     6,
  },

  armorFamilyWeights: {
    plate:       18,
    mail:        16,
    leather:     18,
    robe:        12,
    cloak:       10,
    shield_vest: 14,
    heavy_vest:  12,
  },

  // Modificadores por tier del enemigo
  tierModifiers: {
    // A partir del tier indicado, esa rareza empieza a dropear en ese slot
    minTierByRarity: {
      common:    1,
      magic:     1,
      rare:      3,
      epic:      6,
      legendary: 10,
    },
    // A partir del tier indicado, esa rareza DEJA de dropear (quality floor)
    maxTierByRarity: {
      common:    6,   // en tier 7+ ya no dropean commons
      magic:     10,  // en tier 11+ ya no dropean magic
      rare:      999, // siempre dropea
      epic:      999,
      legendary: 999,
    },
  },
};