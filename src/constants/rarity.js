export const RARITY_COLORS = {
  common: "#9ca3af",
  magic: "#1D9E75",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

export const RARITY_ORDER = ["common", "magic", "rare", "epic", "legendary"];

export function getRarityColor(rarity) {
  return RARITY_COLORS[rarity] || RARITY_COLORS.common;
}

export function getAffixTierGlyph(affix) {
  if (affix?.quality === "excellent" || affix?.lootOnlyQuality) {
    return { symbol: "◆", color: "#f59e0b", label: "Excelente" };
  }
  return { symbol: "■", color: "#9ca3af", label: "Normal" };
}
