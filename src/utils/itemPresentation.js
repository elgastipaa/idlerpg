import { getAffixTierGlyph } from "../constants/rarity";

export const ITEM_STAT_LABELS = {
  damage: "Dano",
  defense: "Defensa",
  goldBonus: "Oro",
  goldBonusPct: "Oro %",
  critChance: "Critico",
  xpBonus: "XP",
  attackSpeed: "Velocidad",
  lifesteal: "Lifesteal",
  healthMax: "Vida",
  healthRegen: "Regen",
  dodgeChance: "Evasion",
  blockChance: "Bloqueo",
  critDamage: "Crit Dmg",
  critOnLowHp: "Crit vida baja",
  damageOnKill: "Dano por kill",
  thorns: "Espinas",
  essenceBonus: "Esencia",
  lootBonus: "Loot",
  luck: "Suerte",
  cooldownReduction: "CDR",
  skillPower: "Poder skill",
};

export const ITEM_ECONOMY_STATS = new Set([
  "goldBonus",
  "goldBonusPct",
  "xpBonus",
  "essenceBonus",
  "lootBonus",
  "luck",
]);

const ITEM_UTILITY_STATS = new Set([
  "cooldownReduction",
  "skillPower",
]);

const ITEM_CORE_STATS = new Set(
  Object.keys(ITEM_STAT_LABELS).filter(stat => !ITEM_ECONOMY_STATS.has(stat) && !ITEM_UTILITY_STATS.has(stat))
);

const PERCENT_ITEM_STATS = new Set([
  "goldBonusPct",
  "critChance",
  "xpBonus",
  "attackSpeed",
  "lifesteal",
  "dodgeChance",
  "blockChance",
  "critDamage",
  "critOnLowHp",
  "lootBonus",
  "cooldownReduction",
  "skillPower",
]);

export function formatItemNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 100) return Math.round(value).toLocaleString();
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatItemStatValue(stat, value) {
  if (PERCENT_ITEM_STATS.has(stat) || stat?.includes("Chance")) {
    return `${formatItemNumber(value * 100)}%`;
  }
  return formatItemNumber(value);
}

export function formatItemDiffValue(stat, diff) {
  const prefix = diff > 0 ? "+" : "";
  return `${prefix}${formatItemStatValue(stat, diff)}`;
}

export function getUpgradeDisplay(level = 0) {
  const bonusLevel = Math.max(0, level || 0);
  return bonusLevel > 0 ? `+${bonusLevel}` : "";
}

export function getItemLocation(item, equipment = {}) {
  if (equipment.weapon?.id === item?.id) return "weapon";
  if (equipment.armor?.id === item?.id) return "armor";
  return null;
}

export function getItemStats(item) {
  return item?.bonus || {};
}

export function getImplicitEntries(item) {
  return Object.entries(item?.implicitBonus || {}).filter(([, value]) => value > 0);
}

export function formatImplicitSummary(item) {
  return getImplicitEntries(item)
    .map(([stat, value]) => `+${formatItemStatValue(stat, value)} ${ITEM_STAT_LABELS[stat] || stat}`)
    .join(" · ");
}

export function getAffixEntries(item) {
  return item?.affixes || [];
}

export function getAffixDots(item, limit = 5) {
  return (item?.affixes || []).slice(0, limit).map((affix, index) => {
    const glyph = getAffixTierGlyph(affix);
    return {
      key: `${affix.id || affix.stat || "affix"}-${index}`,
      ...glyph,
    };
  });
}

export function getStatWeight(stat, value) {
  const numeric = Number(value || 0);
  if (!numeric) return 0;
  return PERCENT_ITEM_STATS.has(stat) ? Math.abs(numeric) * 100 : Math.abs(numeric);
}

function getStatPriority(stat) {
  if (ITEM_CORE_STATS.has(stat)) return 3;
  if (ITEM_UTILITY_STATS.has(stat)) return 2;
  if (ITEM_ECONOMY_STATS.has(stat)) return 1;
  return 0;
}

export function getPrioritizedStatEntries(map = {}, limit = 3) {
  return Object.entries(map)
    .filter(([, value]) => (value || 0) > 0)
    .sort((a, b) => getStatWeight(b[0], b[1]) - getStatWeight(a[0], a[1]))
    .sort((a, b) => getStatPriority(b[0]) - getStatPriority(a[0]))
    .slice(0, limit);
}

export function getEconomyStatEntries(map = {}, limit = 3) {
  return Object.entries(map)
    .filter(([stat, value]) => ITEM_ECONOMY_STATS.has(stat) && (value || 0) > 0)
    .sort((a, b) => getStatWeight(b[0], b[1]) - getStatWeight(a[0], a[1]))
    .slice(0, limit);
}

export function formatEconomySummary(map = {}, limit = 2) {
  const entries = getEconomyStatEntries(map, limit);
  if (!entries.length) return "";
  return entries
    .map(([stat, value]) => `${ITEM_STAT_LABELS[stat] || stat} +${formatItemStatValue(stat, value)}`)
    .join(" · ");
}

export function getTopCompareEntries(item, compareItem, limit = 3) {
  return Object.keys(ITEM_STAT_LABELS)
    .map(stat => {
      const currentVal = item?.bonus?.[stat] || 0;
      const equippedVal = compareItem?.bonus?.[stat] || 0;
      const diff = currentVal - equippedVal;
      return { key: stat, currentVal, equippedVal, diff };
    })
    .filter(entry => entry.currentVal > 0 || entry.equippedVal > 0)
    .sort((a, b) => {
      const priorityA = a.diff > 0 ? 2 : a.diff < 0 ? 1 : 0;
      const priorityB = b.diff > 0 ? 2 : b.diff < 0 ? 1 : 0;
      if (priorityA !== priorityB) return priorityB - priorityA;
      const statPriorityDiff = getStatPriority(b.key) - getStatPriority(a.key);
      if (statPriorityDiff !== 0) return statPriorityDiff;
      return getStatWeight(b.key, b.diff || b.currentVal) - getStatWeight(a.key, a.diff || a.currentVal);
    })
    .slice(0, limit);
}

export function getCompareSummary(item, compareItem) {
  const diffs = Object.keys(ITEM_STAT_LABELS)
    .map(stat => (item?.bonus?.[stat] || 0) - (compareItem?.bonus?.[stat] || 0))
    .filter(diff => diff !== 0);
  const betterCount = diffs.filter(diff => diff > 0).length;
  const worseCount = diffs.filter(diff => diff < 0).length;

  if (betterCount > 0 && worseCount > 0) {
    return `${betterCount} mejor${betterCount === 1 ? "a" : "as"} · ${worseCount} peor${worseCount === 1 ? "a" : "es"}`;
  }
  if (betterCount > 0) return `${betterCount} mejora${betterCount === 1 ? "" : "s"} vs equipado`;
  if (worseCount > 0) return `${worseCount} peor${worseCount === 1 ? "a" : "es"} vs equipado`;
  return "Sin diferencia clara vs equipado";
}

export function getWorkedLabel(item) {
  if ((item?.level ?? 0) >= 9) return "OBRA";
  if ((item?.level ?? 0) >= 6) return "FORJADO";
  const craftingTouches =
    (item?.crafting?.rerollCount || 0) +
    (item?.crafting?.polishCount || 0) +
    (item?.crafting?.reforgeCount || 0);
  if (craftingTouches > 0) return "TRABAJADO";
  return null;
}
