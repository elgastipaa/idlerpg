import { refreshStats } from "./combat/statEngine";

export const xpRequired = (level) => {
  if (level <= 10) return 160 * level;
  if (level <= 20) return 320 * level;
  if (level <= 35) return 520 * level;
  if (level <= 60) return 760 * level;
  if (level <= 90) return 1040 * level;
  return 1380 * level;
};

function grantsTalentPointOnLevel(level) {
  if (level <= 12) return true;
  if (level <= 30) return level % 2 === 0;
  if (level <= 75) return level % 3 === 0;
  return level % 4 === 0;
}

export const applyLevelUp = (player) => {
  let p = { ...player };
  while (p.xp >= xpRequired(p.level)) {
    p.xp -= xpRequired(p.level);
    p.level++;
    if (grantsTalentPointOnLevel(p.level)) {
      p.talentPoints = (p.talentPoints || 0) + 1;
    }
    p.baseMaxHp = (p.baseMaxHp || 100) + 12;
    p.baseDamage = (p.baseDamage || 10) + 1;
  }
  p = refreshStats(p);
  p.hp = p.maxHp;
  return p;
};
