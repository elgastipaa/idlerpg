import { ITEMS } from "../data/items";
import { LEGENDARY_POWERS } from "../data/legendaryPowers";
import { MOD_TYPES } from "../engine/modifiers/modTypes";
import { hasAbyssUnlock } from "../engine/progression/abyssProgression";

const POWER_BY_ID = new Map(LEGENDARY_POWERS.map(power => [power.id, power]));
const LEGENDARY_POWER_TUNE_STEP = 0.08;

function getEquippedItems(player = {}) {
  return [player?.equipment?.weapon, player?.equipment?.armor].filter(Boolean);
}

function getItemPowerTuneLevel(item = {}) {
  return Math.max(0, Number(item?.powerTuneLevel || 0));
}

function getItemPowerTuneMultiplier(item = {}) {
  return 1 + getItemPowerTuneLevel(item) * LEGENDARY_POWER_TUNE_STEP;
}

function scaleAdditive(value, multiplier) {
  return Math.round(Number(value || 0) * Math.max(1, Number(multiplier || 1)) * 1000) / 1000;
}

function scaleMultiplier(multiplierValue, multiplier) {
  return 1 + (Number(multiplierValue || 1) - 1) * Math.max(1, Number(multiplier || 1));
}

function scaleModifierEntry(modifier = {}, multiplier = 1) {
  if (!modifier?.type) return modifier;
  const isMultiplierType =
    modifier.type === MOD_TYPES.DAMAGE_MULT ||
    modifier.type === MOD_TYPES.ENEMY_DAMAGE_TAKEN_MULT;
  const baseValue = Number(modifier.value || 0);
  return {
    ...modifier,
    value: isMultiplierType
      ? Math.round(scaleMultiplier(baseValue, multiplier) * 1000) / 1000
      : scaleAdditive(baseValue, multiplier),
  };
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

export function isLegendaryContentUnlocked(entry = {}, abyss = {}) {
  const unlockKey = entry?.unlockKey || entry?.power?.unlockKey || null;
  return !unlockKey || hasAbyssUnlock(abyss, unlockKey);
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
    .map(item => ({
      item,
      power: getItemLegendaryPower(item),
      tuneLevel: getItemPowerTuneLevel(item),
      tuneMultiplier: getItemPowerTuneMultiplier(item),
    }))
    .filter(entry => entry.power);
}

export function getLegendaryStaticBonuses({
  player = {},
  enemy = null,
  stats = {},
  currentTier = 1,
  maxTier = 1,
  bossesKilledThisRun = 0,
} = {}) {
  const powers = getEquippedLegendaryPowers(player);
  const hpPct = (player?.hp || 0) / Math.max(1, stats?.maxHp || 1);
  const highestRelevantTier = Math.max(Number(currentTier || 1), Number(maxTier || 1));
  const completedAbyssStrata = Math.max(0, Math.floor(highestRelevantTier / 25) - 1);
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
    bloodPact: false,
    preserveMemoryInAbyss: false,
  };

  for (const { power, tuneMultiplier } of powers) {
    switch (power.id) {
      case "godslayer_boss_rend":
        if (enemy?.isBoss) {
          bonuses.damageMult *= scaleMultiplier(1.18, tuneMultiplier);
          bonuses.critDamage += scaleAdditive(0.25, tuneMultiplier);
        }
        break;
      case "harbinger_last_breath":
        if (hpPct <= 0.5) {
          bonuses.attackSpeed += scaleAdditive(0.18, tuneMultiplier);
          bonuses.lifesteal += scaleAdditive(0.06, tuneMultiplier);
          bonuses.critDamage += scaleAdditive(0.2, tuneMultiplier);
        }
        break;
      case "sentinel_mass_engine":
        bonuses.damageFlat += Math.floor((stats?.defense || 0) * scaleAdditive(0.3, tuneMultiplier));
        break;
      case "citadel_high_guard":
        if (hpPct >= 0.8) {
          bonuses.defenseMult *= scaleMultiplier(1.15, tuneMultiplier);
          bonuses.blockChance += scaleAdditive(0.04, tuneMultiplier);
        }
        break;
      case "warlord_opening_gambit":
        if (((enemy?.hp || 0) / Math.max(1, enemy?.maxHp || 1)) >= 0.8) {
          bonuses.damageMult *= scaleMultiplier(1.2, tuneMultiplier);
          bonuses.attackSpeed += scaleAdditive(0.06, tuneMultiplier);
        }
        break;
      case "citadel_last_oath":
        if (hpPct <= 0.6) {
          bonuses.defenseMult *= scaleMultiplier(1.18, tuneMultiplier);
          bonuses.blockChance += scaleAdditive(0.03, tuneMultiplier);
          bonuses.regen += scaleAdditive(4, tuneMultiplier);
        }
        break;
      case "void_titan_overclock":
        if (enemy?.isBoss || enemy?.family === "elemental" || enemy?.family === "occult") {
          bonuses.critChance += scaleAdditive(0.04, tuneMultiplier);
          bonuses.damageMult *= scaleMultiplier(1.10, tuneMultiplier);
        }
        break;
      case "void_skill_window":
        if ((enemy?.runtime?.fractureStacks || 0) > 0 || (enemy?.runtime?.markStacks || 0) > 0) {
          bonuses.critChance += scaleAdditive(0.04, tuneMultiplier);
          bonuses.damageMult *= scaleMultiplier(1.18, tuneMultiplier);
        }
        break;
      case "eclipse_opening_seal":
        if (!enemy?.runtime?.hasTakenPlayerHit || ((enemy?.hp || 0) / Math.max(1, enemy?.maxHp || 1)) >= 0.85) {
          bonuses.damageMult *= scaleMultiplier(1.22, tuneMultiplier);
          bonuses.critChance += scaleAdditive(0.06, tuneMultiplier);
          bonuses.markChance += scaleAdditive(0.12, tuneMultiplier);
          bonuses.freshTargetDamageMult *= scaleMultiplier(1.12, tuneMultiplier);
        }
        break;
      case "resonant_echo_matrix":
        bonuses.multiHitChance += scaleAdditive(0.08, tuneMultiplier);
        bonuses.multiHitDamageMult += scaleAdditive(0.18, tuneMultiplier);
        break;
      case "chaos_prism":
        bonuses.critDamage += scaleAdditive(0.2, tuneMultiplier);
        bonuses.damageRangeMin -= scaleAdditive(0.08, tuneMultiplier);
        bonuses.damageRangeMax += scaleAdditive(0.18, tuneMultiplier);
        break;
      case "cataclysmic_afterglow":
        if ((enemy?.runtime?.mageFlowHitsRemaining || 0) > 0) {
          bonuses.damageMult *= scaleMultiplier(1.3, tuneMultiplier);
          bonuses.critChance += scaleAdditive(0.08, tuneMultiplier);
        }
        break;
      case "lattice_of_control": {
        const markStacks = Math.max(0, Number(enemy?.runtime?.markStacks || 0));
        if (markStacks > 0) {
          bonuses.damageMult *= scaleMultiplier(1 + markStacks * 0.05, tuneMultiplier);
          bonuses.critChance += scaleAdditive(markStacks * 0.02, tuneMultiplier);
          bonuses.markEffectPerStack += scaleAdditive(0.01, tuneMultiplier);
        } else {
          bonuses.damageMult *= scaleMultiplier(0.88, tuneMultiplier);
        }
        break;
      }
      case "recursive_mnemonic":
        bonuses.markTransferPct += scaleAdditive(0.2, tuneMultiplier);
        bonuses.flowHits += Math.max(1, Math.round(scaleAdditive(1, tuneMultiplier)));
        bonuses.spellMemoryMarkEffectPerStack += scaleAdditive(0.01, tuneMultiplier);
        break;
      case "abyss_blood_pact":
        bonuses.bloodPact = true;
        break;
      case "abyss_resonance":
        if (completedAbyssStrata > 0) {
          bonuses.damageMult *= scaleMultiplier(1 + completedAbyssStrata * 0.07, tuneMultiplier);
          bonuses.defenseMult *= scaleMultiplier(1 + completedAbyssStrata * 0.06, tuneMultiplier);
          bonuses.attackSpeed += scaleAdditive(completedAbyssStrata * 0.015, tuneMultiplier);
          bonuses.critDamage += scaleAdditive(completedAbyssStrata * 0.05, tuneMultiplier);
          bonuses.regen += scaleAdditive(completedAbyssStrata * 2, tuneMultiplier);
        }
        break;
      case "eternal_memory":
        bonuses.preserveMemoryInAbyss = true;
        break;
      case "bottomless_fury":
        bonuses.critChance += scaleAdditive(Math.max(0, Number(bossesKilledThisRun || 0)) * 0.02, tuneMultiplier);
        break;
      default:
        break;
    }
  }

  return bonuses;
}

export function getLegendaryPostAttackEffects({
  player = {},
  enemy = null,
  didCrit = false,
  enemyKilled = false,
  tookDamage = false,
  blocked = false,
} = {}) {
  const powers = getEquippedLegendaryPowers(player);
  const effects = [];
  const logs = [];

  for (const { power, tuneMultiplier } of powers) {
    switch (power.id) {
      case "warlord_warpath":
        if (enemyKilled) {
          effects.push({
            source: "item",
            sourceId: "legendary:warlord_warpath",
            duration: 5,
            maxStacks: 5,
            modifiers: [
              scaleModifierEntry({ type: MOD_TYPES.DAMAGE_MULT, value: 1.05 }, tuneMultiplier),
              scaleModifierEntry({ type: MOD_TYPES.ATTACK_SPEED_FLAT, value: 0.03 }, tuneMultiplier),
            ].filter(Boolean),
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
              scaleModifierEntry({ type: MOD_TYPES.ENEMY_DAMAGE_TAKEN_MULT, value: 1.18 }, tuneMultiplier),
            ].filter(Boolean),
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
              scaleModifierEntry({ type: MOD_TYPES.THORNS_FLAT, value: 12 }, tuneMultiplier),
              scaleModifierEntry({ type: MOD_TYPES.REGEN_FLAT, value: 3 }, tuneMultiplier),
            ].filter(Boolean),
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
              scaleModifierEntry({ type: MOD_TYPES.ATTACK_SPEED_FLAT, value: 0.04 }, tuneMultiplier),
              scaleModifierEntry({ type: MOD_TYPES.LIFESTEAL_PERCENT_DAMAGE, value: 0.03 }, tuneMultiplier),
            ].filter(Boolean),
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
              scaleModifierEntry({ type: MOD_TYPES.DAMAGE_MULT, value: 1.10 }, tuneMultiplier),
              scaleModifierEntry({ type: MOD_TYPES.THORNS_FLAT, value: 10 }, tuneMultiplier),
            ].filter(Boolean),
          });
          logs.push("Contragolpe del Ancla endurece tu respuesta.");
        }
        break;
      case "abyss_void_eye":
        if (didCrit && enemy?.isBoss) {
          effects.push({
            source: "item",
            sourceId: "legendary:abyss_void_eye",
            duration: 3,
            maxStacks: 1,
            modifiers: [
              scaleModifierEntry({ type: MOD_TYPES.ENEMY_DAMAGE_TAKEN_MULT, value: 1.16 }, tuneMultiplier),
            ].filter(Boolean),
          });
          logs.push("Ojo del Vacio deja al boss expuesto.");
        }
        break;
      default:
        break;
    }
  }

  return { effects, logs };
}

export function getTargetedLegendaryDropsForEnemy(enemy = null, { abyss = {} } = {}) {
  if (!enemy) return [];
  return ITEMS.filter(item => {
    if (!item?.legendaryPowerId) return false;
    if (!isLegendaryContentUnlocked(item, abyss)) return false;
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
