import { refreshStats } from "./combat/statEngine";

export const xpRequired = (level) => {
  if (level <= 10) return 160 * level;
  if (level <= 20) return 320 * level;
  if (level <= 35) return 520 * level;
  if (level <= 60) return 760 * level;
  if (level <= 90) return 1040 * level;
  return 1380 * level;
};

export const getLifetimeXp = (level = 1, currentXp = 0) => {
  const safeLevel = Math.max(1, Math.floor(Number(level || 1)));
  let total = Math.max(0, Math.floor(Number(currentXp || 0)));
  for (let current = 1; current < safeLevel; current += 1) {
    total += xpRequired(current);
  }
  return total;
};

export const getLevelTalentPointEntitlement = (level = 1) => {
  const safeLevel = Math.max(1, Math.floor(Number(level || 1)));
  return safeLevel - 1;
};

export const applyLevelUp = (player) => {
  let p = { ...player };
  while (p.xp >= xpRequired(p.level)) {
    p.xp -= xpRequired(p.level);
    p.level++;
    p.talentPoints = (p.talentPoints || 0) + 1;
    p.baseMaxHp = (p.baseMaxHp || 100) + 12;
    p.baseDamage = (p.baseDamage || 10) + 1;
  }
  p = refreshStats(p);
  p.hp = p.maxHp;
  return p;
};
