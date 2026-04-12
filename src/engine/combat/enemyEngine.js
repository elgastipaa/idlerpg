import { ENEMIES } from "../../data/enemies";
import { BOSSES } from "../../data/bosses";
import { BOSS_MECHANICS, ENEMY_FAMILIES, MONSTER_AFFIXES } from "../../data/encounters";

function mergeRuntime(base = {}, extra = {}) {
  const merged = { ...base };
  const multiplicativeKeys = new Set(["hpMult", "defenseMult", "damageMult"]);

  for (const [key, value] of Object.entries(extra)) {
    if (typeof value === "number") {
      if (multiplicativeKeys.has(key)) {
        merged[key] = (merged[key] || 1) * value;
      } else {
        merged[key] = (merged[key] || 0) + value;
      }
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

function applyRuntimeStats(enemy, runtime = {}) {
  const hpMult = runtime.hpMult || 1;
  const defenseMult = runtime.defenseMult || 1;
  const damageMult = runtime.damageMult || 1;

  const maxHp = Math.max(1, Math.floor(enemy.maxHp * hpMult));
  return {
    ...enemy,
    hp: maxHp,
    maxHp,
    damage: Math.max(1, Math.floor(enemy.damage * damageMult)),
    defense: Math.max(0, Math.floor(enemy.defense * defenseMult)),
  };
}

function rollMonsterAffixes(baseEnemy) {
  if (baseEnemy.isBoss || !baseEnemy.possibleAffixes?.length || baseEnemy.tier < 6) return [];

  const chance = Math.min(0.55, 0.12 + Math.max(0, baseEnemy.tier - 6) * 0.08);
  if (Math.random() > chance) return [];

  const pool = baseEnemy.possibleAffixes
    .map(id => MONSTER_AFFIXES[id])
    .filter(Boolean);

  if (!pool.length) return [];
  return [pool[Math.floor(Math.random() * pool.length)]];
}

export function spawnEnemy(tier) {
  const boss = BOSSES.find(candidate => candidate.tier === tier);
  const data = boss || ENEMIES.find(candidate => candidate.tier === tier) || ENEMIES[ENEMIES.length - 1];
  const family = ENEMY_FAMILIES[data.family] || null;
  const monsterAffixes = rollMonsterAffixes(data);
  const mechanics = (data.mechanics || []).map(id => BOSS_MECHANICS[id]).filter(Boolean);

  let runtime = {};
  if (family?.runtime) runtime = mergeRuntime(runtime, family.runtime);
  for (const affix of monsterAffixes) {
    runtime = mergeRuntime(runtime, affix.runtime || {});
  }

  const hydrated = applyRuntimeStats(
    {
      ...data,
      familyName: family?.name || null,
      familyTraitName: family?.traitName || null,
      familyTraitDescription: family?.description || null,
      familyTraitId: family?.id || null,
      monsterAffixes,
      mechanics,
      runtime,
    },
    runtime
  );

  return hydrated;
}
