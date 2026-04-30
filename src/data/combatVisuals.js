const COMBAT_ASSET_BASE = "/assets/combat";
const COMBAT_ENEMY_ASSET_BASE = `${COMBAT_ASSET_BASE}/enemies`;

function enemyAsset(filename) {
  return `${COMBAT_ENEMY_ASSET_BASE}/${filename}`;
}

export const COMBAT_BACKGROUNDS = {
  ruinsForgotten: {
    id: "ruinsForgotten",
    src: `${COMBAT_ASSET_BASE}/backgrounds/ruinas_olvidadas.png`,
    label: "Ruinas Olvidadas",
  },
};

export const COMBAT_ENEMY_VISUALS = {
  slime: {
    id: "slime",
    src: enemyAsset("slime.png"),
    label: "Slime",
    family: "ooze",
    scale: 0.9,
    stageScale: 1.28,
    y: -12,
  },
  goblin: {
    id: "goblin",
    src: enemyAsset("goblin.png"),
    label: "Goblin",
    family: "raider",
    scale: 0.9,
    stageScale: 1.2,
    y: -5,
  },
  orc_brute: {
    id: "orc_brute",
    src: enemyAsset("orc_brute.png"),
    label: "Orc Brute",
    family: "orc",
    scale: 1.0,
    stageScale: 1.16,
    y: -2,
  },
  dark_knight: {
    id: "dark_knight",
    src: enemyAsset("dark_knight.png"),
    label: "Dark Knight",
    family: "knight",
    scale: 1,
    stageScale: 1.16,
    y: -2,
  },
  cult_adept: {
    id: "cult_adept",
    src: enemyAsset("cult_adept.png"),
    label: "Cult Adept",
    family: "cultist",
    scale: 0.96,
    stageScale: 1.16,
    y: -2,
  },
  blood_hound: {
    id: "blood_hound",
    src: enemyAsset("blood_hound.png"),
    label: "Blood Hound",
    family: "beast",
    scale: 0.92,
    stageScale: 1.22,
    y: -8,
  },
  infernal_raider: {
    id: "infernal_raider",
    src: enemyAsset("infernal_raider.png"),
    label: "Infernal Raider",
    family: "demon",
    scale: 1.0,
    stageScale: 1.16,
    y: -2,
  },
  bone_reaver: {
    id: "bone_reaver",
    src: enemyAsset("bone_reaver.png"),
    label: "Bone Reaver",
    family: "undead",
    scale: 0.98,
    stageScale: 1.18,
    y: -3,
  },
  steel_guardian: {
    id: "steel_guardian",
    src: enemyAsset("steel_guardian.png"),
    label: "Steel Guardian",
    family: "construct",
    scale: 1.0,
    stageScale: 1.14,
    y: -2,
  },
  flame_lord: {
    id: "flame_lord",
    src: enemyAsset("flame_lord.png"),
    label: "Flame Lord",
    family: "elemental",
    scale: 1.0,
    stageScale: 1.15,
    y: -2,
  },
  abyss_harvester: {
    id: "abyss_harvester",
    src: enemyAsset("abyss_harvester.png"),
    label: "Abyss Harvester",
    family: "demon",
    scale: 1.0,
    stageScale: 1.15,
    y: -2,
  },
  grave_executor: {
    id: "grave_executor",
    src: enemyAsset("grave_executor.png"),
    label: "Grave Executor",
    family: "undead",
    scale: 1.0,
    stageScale: 1.14,
    y: -2,
  },
  warlord_champion: {
    id: "warlord_champion",
    src: enemyAsset("warlord_champion.png"),
    label: "Warlord Champion",
    family: "orc",
    scale: 1.0,
    stageScale: 1.14,
    y: -2,
  },
  rift_stalker: {
    id: "rift_stalker",
    src: enemyAsset("rift_stalker.png"),
    label: "Rift Stalker",
    family: "raider",
    scale: 0.96,
    stageScale: 1.18,
    y: -3,
  },
  catacomb_horror: {
    id: "catacomb_horror",
    src: enemyAsset("catacomb_horror.png"),
    label: "Catacomb Horror",
    family: "undead",
    scale: 1.0,
    stageScale: 1.15,
    y: -2,
  },
  storm_elemental: {
    id: "storm_elemental",
    src: enemyAsset("storm_elemental.png"),
    label: "Storm Elemental",
    family: "elemental",
    scale: 1.0,
    stageScale: 1.16,
    y: -2,
  },
  forge_colossus: {
    id: "forge_colossus",
    src: enemyAsset("forge_colossus.png"),
    label: "Forge Colossus",
    family: "construct",
    scale: 1.05,
    stageScale: 1.14,
    y: -2,
  },
  void_scout: {
    id: "void_scout",
    src: enemyAsset("void_scout.png"),
    label: "Void Scout",
    family: "occult",
    scale: 0.98,
    stageScale: 1.16,
    y: -2,
  },
  void_devourer: {
    id: "void_devourer",
    src: enemyAsset("void_devourer.png"),
    label: "Void Devourer",
    family: "occult",
    scale: 1.0,
    stageScale: 1.14,
    y: -2,
  },
  dread_reaper: {
    id: "dread_reaper",
    src: enemyAsset("dread_reaper.png"),
    label: "Dread Reaper",
    family: "undead",
    scale: 1.0,
    stageScale: 1.15,
    y: -2,
  },
  abyss_tyrant: {
    id: "abyss_tyrant",
    src: enemyAsset("abyss_tyrant.png"),
    label: "Abyss Tyrant",
    family: "demon",
    scale: 1.0,
    stageScale: 1.13,
    y: -2,
  },
  eternal_warden: {
    id: "eternal_warden",
    src: enemyAsset("eternal_warden.png"),
    label: "Eternal Warden",
    family: "construct",
    scale: 1.0,
    stageScale: 1.14,
    y: -2,
  },
};

const FAMILY_FALLBACKS = {
  ooze: "slime",
  raider: "rift_stalker",
  beast: "blood_hound",
  undead: "dread_reaper",
  orc: "warlord_champion",
  knight: "dark_knight",
  cultist: "cult_adept",
  demon: "abyss_tyrant",
  construct: "eternal_warden",
  occult: "void_devourer",
  elemental: "storm_elemental",
};

export function getCombatBackgroundVisual() {
  return COMBAT_BACKGROUNDS.ruinsForgotten;
}

export function getCombatEnemyVisual(enemy = null) {
  const direct = COMBAT_ENEMY_VISUALS[enemy?.id];
  if (direct) return { ...direct, source: "direct" };

  const fallbackId = FAMILY_FALLBACKS[enemy?.family];
  const fallback = fallbackId ? COMBAT_ENEMY_VISUALS[fallbackId] : null;
  if (fallback) return { ...fallback, source: "family", sourceFamily: enemy?.family };

  return null;
}
