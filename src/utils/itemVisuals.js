export const COMPACT_RARITY_LABELS = {
  common: "COM",
  magic: "MAG",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEG",
};

export const ITEM_SLOT_GLYPHS = {
  weapon: "⚔",
  armor: "🛡",
};

export function getCompactRarityLabel(rarity) {
  return COMPACT_RARITY_LABELS[rarity] || String(rarity || "common").toUpperCase();
}

export function getItemGlyph(name = "") {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("espada") || normalized.includes("daga") || normalized.includes("hacha") || normalized.includes("maza")) return "⚔";
  if (normalized.includes("arco") || normalized.includes("ballesta")) return "🏹";
  if (normalized.includes("baston") || normalized.includes("cetro")) return "✦";
  if (normalized.includes("escudo")) return "🛡";
  if (normalized.includes("tunica") || normalized.includes("armadura") || normalized.includes("cuero") || normalized.includes("cota")) return "🛡";
  return "⬢";
}

export function getUpgradeBadgeTone(level = 0) {
  if (level >= 10) {
    return {
      background: "var(--tone-warning-soft, #fff7ed)",
      color: "var(--tone-danger, #9a3412)",
      border: "1px solid var(--tone-warning, #fdba74)",
    };
  }

  if (level >= 7) {
    return {
      background: "var(--tone-violet-soft, #f3e8ff)",
      color: "var(--tone-violet, #6d28d9)",
      border: "1px solid rgba(124,58,237,0.22)",
    };
  }

  return {
    background: "var(--tone-success-soft, #ecfdf5)",
    color: "var(--tone-success-strong, #166534)",
    border: "1px solid rgba(22,163,74,0.18)",
  };
}
