function scaledValue(base, growth, tier) {
  return Math.max(1, Math.floor(base * Math.pow(growth, tier - 1)));
}

function getAffixesForTier(tier) {
  if (tier < 6) return [];
  if (tier < 10) return ["armored", "bulky", "regenerating", "spiky"];
  if (tier < 15) return ["armored", "bulky", "regenerating", "spiky", "enraged", "crit_immune", "tanky"];
  if (tier < 20) return ["armored", "bulky", "regenerating", "spiky", "enraged", "crit_immune", "tanky", "reflective", "vampiric"];
  return ["armored", "bulky", "regenerating", "spiky", "enraged", "crit_immune", "tanky", "reflective", "vampiric", "lethal", "thorns_master"];
}

const ENEMY_BLUEPRINTS = [
  { id: "slime", name: "Slime", family: "ooze" },
  { id: "goblin", name: "Goblin", family: "raider" },
  { id: "wolf", name: "Wolf", family: "beast" },
  { id: "skeleton", name: "Skeleton", family: "undead" },
  { id: "orc_brute", name: "Orc Brute", family: "orc" },
  { id: "dark_knight", name: "Dark Knight", family: "knight" },
  { id: "cult_adept", name: "Cult Adept", family: "cultist" },
  { id: "blood_hound", name: "Blood Hound", family: "beast" },
  { id: "infernal_raider", name: "Infernal Raider", family: "demon" },
  { id: "bone_reaver", name: "Bone Reaver", family: "undead" },
  { id: "steel_guardian", name: "Steel Guardian", family: "construct" },
  { id: "void_scout", name: "Void Scout", family: "occult" },
  { id: "flame_lord", name: "Flame Lord", family: "elemental" },
  { id: "abyss_harvester", name: "Abyss Harvester", family: "demon" },
  { id: "grave_executor", name: "Grave Executor", family: "undead" },
  { id: "warlord_champion", name: "Warlord Champion", family: "orc" },
  { id: "rift_stalker", name: "Rift Stalker", family: "raider" },
  { id: "catacomb_horror", name: "Catacomb Horror", family: "undead" },
  { id: "storm_elemental", name: "Storm Elemental", family: "elemental" },
  { id: "forge_colossus", name: "Forge Colossus", family: "construct" },
  { id: "ancient_dragon", name: "Ancient Dragon", family: "dragon" },
  { id: "void_devourer", name: "Void Devourer", family: "occult" },
  { id: "dread_reaper", name: "Dread Reaper", family: "undead" },
  { id: "abyss_tyrant", name: "Abyss Tyrant", family: "demon" },
  { id: "eternal_warden", name: "Eternal Warden", family: "construct" },
];

export const ENEMIES = ENEMY_BLUEPRINTS.map((blueprint, index) => {
  const tier = index + 1;
  const maxHp = scaledValue(52, 1.34, tier);
  const damage = scaledValue(5, 1.275, tier);
  const defense = Math.max(0, Math.floor(tier * 1.95));
  const xpReward = scaledValue(12, 1.315, tier);
  const goldReward = scaledValue(4, 1.295, tier);

  return {
    id: blueprint.id,
    name: blueprint.name,
    family: blueprint.family,
    possibleAffixes: getAffixesForTier(tier),
    tier,
    hp: maxHp,
    maxHp,
    damage,
    defense,
    xpReward,
    goldReward,
    isBoss: false,
  };
});
