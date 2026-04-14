import { ITEMS } from "../data/items";
import { LEGENDARY_POWERS } from "../data/legendaryPowers";
import { MOD_TYPES } from "../engine/modifiers/modTypes";

const POWER_BY_ID = new Map(LEGENDARY_POWERS.map(power => [power.id, power]));

function getEquippedItems(player = {}) {
  return [player?.equipment?.weapon, player?.equipment?.armor].filter(Boolean);
}

export function getLegendaryPowerById(powerId) {
  return POWER_BY_ID.get(powerId) || null;
}

export function getItemLegendaryPower(item) {
  return getLegendaryPowerById(item?.legendaryPowerId);
}

export function getItemsForLegendaryPower(powerId) {
  if (!powerId) return [];
  return ITEMS.filter(item => item?.legendaryPowerId === powerId);
}

export function getLegendaryPowerSources(powerId) {
  const items = getItemsForLegendaryPower(powerId);
  const bossIds = [...new Set(items.flatMap(item => item?.huntSources?.bosses || []))];
  const familyIds = [...new Set(items.flatMap(item => item?.huntSources?.families || []))];
  return {
    items,
    bossIds,
    familyIds,
  };
}

export function getEquippedLegendaryPowers(player = {}) {
  return getEquippedItems(player)
    .map(item => ({ item, power: getItemLegendaryPower(item) }))
    .filter(entry => entry.power);
}

export function getLegendaryStaticBonuses({ player = {}, enemy = null, stats = {} } = {}) {
  const powers = getEquippedLegendaryPowers(player);
  const hpPct = (player?.hp || 0) / Math.max(1, stats?.maxHp || 1);
  const bonuses = {
    damageFlat: 0,
    damageMult: 1,
    defenseMult: 1,
    attackSpeed: 0,
    critChance: 0,
    critDamage: 0,
    lifesteal: 0,
    blockChance: 0,
    regen: 0,
    multiHitChance: 0,
    multiHitDamageMult: 0,
    markChance: 0,
    markEffectPerStack: 0,
    damageRangeMin: 0,
    damageRangeMax: 0,
    markTransferPct: 0,
    flowHits: 0,
    spellMemoryMarkEffectPerStack: 0,
    freshTargetDamageMult: 1,
  };

  for (const { power } of powers) {
    switch (power.id) {
      case "godslayer_boss_rend":
        if (enemy?.isBoss) {
          bonuses.damageMult *= 1.18;
          bonuses.critDamage += 0.25;
        }
        break;
      case "harbinger_last_breath":
        if (hpPct <= 0.5) {
          bonuses.attackSpeed += 0.18;
          bonuses.lifesteal += 0.06;
          bonuses.critDamage += 0.2;
        }
        break;
      case "sentinel_mass_engine":
        bonuses.damageFlat += Math.floor((stats?.defense || 0) * 0.3);
        break;
      case "citadel_high_guard":
        if (hpPct >= 0.8) {
          bonuses.defenseMult *= 1.15;
          bonuses.blockChance += 0.04;
        }
        break;
      case "warlord_opening_gambit":
        if (((enemy?.hp || 0) / Math.max(1, enemy?.maxHp || 1)) >= 0.8) {
          bonuses.damageMult *= 1.2;
          bonuses.attackSpeed += 0.06;
        }
        break;
      case "citadel_last_oath":
        if (hpPct <= 0.6) {
          bonuses.defenseMult *= 1.18;
          bonuses.blockChance += 0.03;
          bonuses.regen += 4;
        }
        break;
      case "void_titan_overclock":
        if (enemy?.isBoss || enemy?.family === "elemental" || enemy?.family === "occult") {
          bonuses.critChance += 0.04;
          bonuses.damageMult *= 1.10;
        }
        break;
      case "void_skill_window":
        if ((enemy?.runtime?.fractureStacks || 0) > 0 || (enemy?.runtime?.markStacks || 0) > 0) {
          bonuses.critChance += 0.04;
          bonuses.damageMult *= 1.18;
        }
        break;
      case "eclipse_opening_seal":
        if (!enemy?.runtime?.hasTakenPlayerHit || ((enemy?.hp || 0) / Math.max(1, enemy?.maxHp || 1)) >= 0.85) {
          bonuses.damageMult *= 1.22;
          bonuses.critChance += 0.06;
          bonuses.markChance += 0.12;
          bonuses.freshTargetDamageMult *= 1.12;
        }
        break;
      case "resonant_echo_matrix":
        bonuses.multiHitChance += 0.08;
        bonuses.multiHitDamageMult += 0.18;
        break;
      case "chaos_prism":
        bonuses.critDamage += 0.2;
        bonuses.damageRangeMin -= 0.08;
        bonuses.damageRangeMax += 0.18;
        break;
      case "cataclysmic_afterglow":
        if ((enemy?.runtime?.mageFlowHitsRemaining || 0) > 0) {
          bonuses.damageMult *= 1.3;
          bonuses.critChance += 0.08;
        }
        break;
      case "lattice_of_control": {
        const markStacks = Math.max(0, Number(enemy?.runtime?.markStacks || 0));
        if (markStacks > 0) {
          bonuses.damageMult *= 1 + markStacks * 0.05;
          bonuses.critChance += markStacks * 0.02;
          bonuses.markEffectPerStack += 0.01;
        } else {
          bonuses.damageMult *= 0.88;
        }
        break;
      }
      case "recursive_mnemonic":
        bonuses.markTransferPct += 0.2;
        bonuses.flowHits += 1;
        bonuses.spellMemoryMarkEffectPerStack += 0.01;
        break;
      default:
        break;
    }
  }

  return bonuses;
}

export function getLegendaryPostAttackEffects({
  player = {},
  didCrit = false,
  enemyKilled = false,
  tookDamage = false,
  blocked = false,
} = {}) {
  const powers = getEquippedLegendaryPowers(player);
  const effects = [];
  const logs = [];

  for (const { power } of powers) {
    switch (power.id) {
      case "warlord_warpath":
        if (enemyKilled) {
          effects.push({
            source: "item",
            sourceId: "legendary:warlord_warpath",
            duration: 5,
            maxStacks: 5,
            modifiers: [
              { type: MOD_TYPES.DAMAGE_MULT, value: 1.05 },
              { type: MOD_TYPES.ATTACK_SPEED_FLAT, value: 0.03 },
            ],
          });
          logs.push("Camino del Warlord suma una carga de Furia.");
        }
        break;
      case "matriarch_open_wounds":
        if (didCrit) {
          effects.push({
            source: "item",
            sourceId: "legendary:matriarch_open_wounds",
            duration: 3,
            maxStacks: 1,
            modifiers: [
              { type: MOD_TYPES.ENEMY_DAMAGE_TAKEN_MULT, value: 1.18 },
            ],
          });
          logs.push("Heridas Abiertas deja al enemigo vulnerable.");
        }
        break;
      case "eternal_thornwall":
        if (tookDamage || blocked) {
          effects.push({
            source: "item",
            sourceId: "legendary:eternal_thornwall",
            duration: 5,
            maxStacks: 4,
            modifiers: [
              { type: MOD_TYPES.THORNS_FLAT, value: 12 },
              { type: MOD_TYPES.REGEN_FLAT, value: 3 },
            ],
          });
          logs.push("Muralla de Espinas refuerza tu frente.");
        }
        break;
      case "matriarch_crimson_feast":
        if (enemyKilled && didCrit) {
          effects.push({
            source: "item",
            sourceId: "legendary:matriarch_crimson_feast",
            duration: 4,
            maxStacks: 4,
            modifiers: [
              { type: MOD_TYPES.ATTACK_SPEED_FLAT, value: 0.04 },
              { type: MOD_TYPES.LIFESTEAL_PERCENT_DAMAGE, value: 0.03 },
            ],
          });
          logs.push("Banquete Carmesi extiende un festin de sangre.");
        }
        break;
      case "sentinel_anchor_counter":
        if (blocked) {
          effects.push({
            source: "item",
            sourceId: "legendary:sentinel_anchor_counter",
            duration: 4,
            maxStacks: 3,
            modifiers: [
              { type: MOD_TYPES.DAMAGE_MULT, value: 1.10 },
              { type: MOD_TYPES.THORNS_FLAT, value: 10 },
            ],
          });
          logs.push("Contragolpe del Ancla endurece tu respuesta.");
        }
        break;
      default:
        break;
    }
  }

  return { effects, logs };
}

export function getTargetedLegendaryDropsForEnemy(enemy = null) {
  if (!enemy) return [];
  return ITEMS.filter(item => {
    if (!item?.legendaryPowerId) return false;
    const bosses = item?.huntSources?.bosses || [];
    const families = item?.huntSources?.families || [];
    return bosses.includes(enemy.id) || families.includes(enemy.family);
  }).map(item => ({
    id: item.id,
    name: item.name,
    family: item.family,
    power: getItemLegendaryPower(item),
  }));
}
