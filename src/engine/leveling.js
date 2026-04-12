import { refreshStats } from "./combat/statEngine";

export const xpRequired = (level) => {
  if (level <= 10) return 140 * level;
  if (level <= 20) return 240 * level;
  if (level <= 35) return 360 * level;
  return 520 * level;
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
