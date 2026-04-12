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
  if (affix?.perfectRoll) return { symbol: "★", color: "#f59e0b", label: "Perfect" };
  if (affix?.tier === 1) return { symbol: "◆", color: "#f59e0b", label: "T1" };
  if (affix?.tier === 2) return { symbol: "●", color: "#3b82f6", label: "T2" };
  return { symbol: "■", color: "#9ca3af", label: "T3" };
}
