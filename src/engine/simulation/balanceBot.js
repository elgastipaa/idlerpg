import { gameReducer } from "../../state/gameReducer";
import { ACTIVE_GOALS } from "../../data/activeGoals";
import { CLASSES } from "../../data/classes";
import { PLAYER_UPGRADES } from "../../data/playerUpgrades";
import { TALENTS } from "../../data/talents";
import { PRESTIGE_TREE_NODES } from "../../data/prestige";
import { canPurchasePrestigeNode, calculatePrestigeEchoGain, canPrestige } from "../progression/prestigeEngine";
import { isGoalCompleted } from "../progression/goalEngine";
import { calcStats } from "../combat/statEngine";
import { buildBalanceTelemetryEntries, buildBalanceTelemetryPayload, buildBalanceTelemetryReport, buildFullTelemetryPayload } from "../../utils/runTelemetry";
import { getPlayerBuildTag } from "../../utils/buildIdentity";
import { deriveReplayDecisionHints } from "../../utils/replayLog";
import { buildReforgePreview } from "../crafting/craftingEngine";

const BERSERKER_TALENT_PRIORITY = [
  "warrior_physical_training",
  "warrior_battle_hardened",
  "warrior_precision_strikes",
  "warrior_blood_strikes",
  "warrior_combat_flow",
  "warrior_crushing_weight",
  "berserker_bloodlust_core",
  "berserker_frenzy_core",
  "berserker_savage_power",
  "berserker_last_stand",
  "berserker_blood_debt",
  "berserker_execution",
  "berserker_last_breath",
  "berserker_frenzied_chain",
];

const JUGGERNAUT_TALENT_PRIORITY = [
  "warrior_battle_hardened",
  "warrior_precision_strikes",
  "warrior_physical_training",
  "warrior_iron_conversion",
  "juggernaut_iron_body",
  "juggernaut_unbreakable",
  "juggernaut_recovery",
  "juggernaut_iron_core",
  "juggernaut_fortress_core",
  "juggernaut_spiked_defense",
  "juggernaut_unmoving_mountain",
  "juggernaut_titanic_momentum",
];

const MAGE_OVERCHANNEL_TALENT_PRIORITY = [
  "mage_arcane_power",
  "mage_focus",
  "mage_channeling",
  "mage_arcane_mark",
  "mage_arcane_echo",
  "mage_arcane_flow",
  "mage_overchannel",
];

const MAGE_PERFECT_CAST_TALENT_PRIORITY = [
  "mage_arcane_power",
  "mage_focus",
  "mage_arcane_mark",
  "mage_arcane_flow",
  "mage_channeling",
  "mage_perfect_cast",
  "mage_arcane_echo",
];

const SORCERER_TALENT_PRIORITY = [
  "sorcerer_spell_power",
  "sorcerer_volatility",
  "sorcerer_surge",
  "sorcerer_chain_burst",
  "sorcerer_unstable_power",
  "sorcerer_overload",
  "sorcerer_volatile_casting",
];

const ARCANIST_TALENT_PRIORITY = [
  "arcanist_precision",
  "arcanist_efficiency",
  "arcanist_control",
  "arcanist_mark_transfer",
  "arcanist_temporal_flow",
  "arcanist_spell_memory",
  "arcanist_absolute_control",
];

const COMMON_PRESTIGE_PRIORITY = [
  "forge_tempered_hands",
  "forge_chaos_script",
  "forge_precision_file",
  "forge_surgeon_mark",
  "fortune_gilded_hands",
  "fortune_chronicler",
  "fortune_essence_mill",
  "fortune_lucky_smoke",
  "fortune_scavenger_map",
  "fortune_market_memory",
  "fortune_relic_scent",
  "forge_star_quench",
  "forge_anvil_prophecy",
  "forge_living_furnace",
];

const WARRIOR_PRESTIGE_PRIORITY = [
  "war_blade_doctrine",
  "bulwark_heartwall",
  "war_killer_instinct",
  "bulwark_iron_marrows",
  "war_battleflow",
  "war_execution_litany",
  "bulwark_second_skin",
  "bulwark_shield_law",
  "lineage_warrior_lineage",
  "lineage_martial_memory",
  "war_reaper_stride",
  "war_blood_current",
  "war_time_cleave",
  "bulwark_bramble_crown",
  "bulwark_echo_plating",
  "war_red_apex",
  "bulwark_green_apex",
  "lineage_eternal_avatar",
  "lineage_berserker_apex",
  "lineage_juggernaut_apex",
];

const MAGE_PRESTIGE_PRIORITY = [
  "sorcery_arcane_fury",
  "dominion_marking_law",
  "sorcery_glass_formula",
  "dominion_fine_inscription",
  "sorcery_echo_discipline",
  "dominion_flow_map",
  "sorcery_opening_sigil",
  "dominion_control_mesh",
  "fortune_essence_mill",
  "fortune_lucky_smoke",
  "forge_surgeon_mark",
  "forge_precision_file",
  "forge_star_quench",
  "fortune_golden_apex",
  "forge_blue_apex",
];

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function reduceState(state, action) {
  return gameReducer(state, {
    ...action,
    meta: {
      ...(action?.meta || {}),
      source: "simulation",
    },
  });
}

function logDecision(logs, tick, message) {
  logs.push(`[${tick}] ${message}`);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getHumanProfile(options = {}) {
  return options.humanProfile || {};
}

function getReplaySource(state, options = {}) {
  return options.replaySource || state.replay;
}

function getPreferredSpec(options = {}) {
  return options.preferredSpec || getHumanProfile(options).preferredSpec || null;
}

function getPreferredClass(options = {}) {
  const explicit = options.preferredClass || getHumanProfile(options).preferredClass || null;
  if (explicit) return explicit;
  const preferredSpec = getPreferredSpec(options);
  if (preferredSpec === "sorcerer" || preferredSpec === "arcanist") return "mage";
  if (preferredSpec === "berserker" || preferredSpec === "juggernaut") return "warrior";
  return "warrior";
}

function getClassDefinition(classId) {
  return CLASSES.find(entry => entry.id === classId) || null;
}

function getUnlockProgressValue(state, unlockCondition = {}) {
  switch (unlockCondition?.stat) {
    case "level":
      return Number(state.player?.level || 1);
    case "kills":
      return Number(state.stats?.kills || 0);
    case "bossKills":
      return Number(state.stats?.bossKills || 0);
    case "prestigeLevel":
      return Number(state.prestige?.level || 0);
    default:
      return 0;
  }
}

function isSpecUnlockedForState(state, classId, specId) {
  const classDef = getClassDefinition(classId);
  const specialization = classDef?.specializations?.find(entry => entry.id === specId) || null;
  if (!specialization) return false;
  if (!specialization.unlockCondition) return true;
  return getUnlockProgressValue(state, specialization.unlockCondition) >= Number(specialization.unlockCondition.value || 0);
}

function ensureClass(state, logs, tick, options = {}) {
  if (!state.player.class) {
    const classId = getPreferredClass(options);
    state = reduceState(state, { type: "SELECT_CLASS", classId });
    logDecision(logs, tick, `Selecciona ${classId === "mage" ? "Mage" : "Warrior"}`);
  }
  return state;
}

function maybeSelectSpec(state, logs, tick, options = {}) {
  if (state.player.specialization) return state;
  const preferredSpec = getPreferredSpec(options);
  const classId = state.player.class || getPreferredClass(options);

  const attemptSelectSpec = (specId, label) => {
    if (!isSpecUnlockedForState(state, classId, specId)) return null;
    const nextState = reduceState(state, { type: "SELECT_SPECIALIZATION", specId });
    if (nextState !== state) {
      logDecision(logs, tick, `Elige ${label}`);
      return nextState;
    }
    return null;
  };

  if (classId === "mage") {
    if (preferredSpec === "sorcerer") {
      const selected = attemptSelectSpec("sorcerer", "Sorcerer");
      if (selected) return selected;
    }
    if (preferredSpec === "arcanist") {
      const selected = attemptSelectSpec("arcanist", "Arcanist");
      if (selected) return selected;
    }
    const sorcerer = attemptSelectSpec("sorcerer", "Sorcerer");
    if (sorcerer) return sorcerer;
    const arcanist = attemptSelectSpec("arcanist", "Arcanist");
    if (arcanist) return arcanist;
    return state;
  }

  if (preferredSpec === "berserker") {
    const selected = attemptSelectSpec("berserker", "Berserker");
    if (selected) return selected;
  }

  if (preferredSpec === "juggernaut") {
    const selected = attemptSelectSpec("juggernaut", "Juggernaut");
    if (selected) return selected;
  }

  const berserker = attemptSelectSpec("berserker", "Berserker");
  if (berserker) return berserker;
  const juggernaut = attemptSelectSpec("juggernaut", "Juggernaut");
  if (juggernaut) return juggernaut;

  return state;
}

function maybeEnterExpeditionSetup(state, logs, tick) {
  if (!state.player?.class) return state;
  if (state.combat?.pendingRunSetup) return state;
  const phase = state.expedition?.phase || "sanctuary";
  if (phase === "active" || phase === "extraction") return state;

  const nextState = reduceState(state, { type: "ENTER_EXPEDITION_SETUP" });
  if (nextState !== state) {
    logDecision(logs, tick, "Abre setup de expedicion");
  }
  return nextState;
}

function claimGoals(state, logs, tick) {
  let nextState = state;
  for (const goal of ACTIVE_GOALS) {
    if ((nextState.goals?.claimed || []).includes(goal.id)) continue;
    if (!isGoalCompleted(nextState, goal)) continue;
    nextState = reduceState(nextState, { type: "CLAIM_GOAL", goalId: goal.id });
    logDecision(logs, tick, `Reclama objetivo: ${goal.name}`);
  }
  return nextState;
}

function getUpgradeHeuristic(state, upgrade) {
  const currentLevel = state.player.upgrades?.[upgrade.id] || 0;
  if (currentLevel >= upgrade.maxLevel) return null;

  const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
  if ((state.player.gold || 0) < cost) return null;

  const stats = calcStats(state.player);
  const weights = {
    damage: stats.damage * 1.2 + 16,
    maxHp: stats.maxHp * 0.12 + 12,
    critChance: 220,
    goldBonus: 18 + (state.combat.currentTier || 1) * 1.5,
    xpBonus: 16 + (state.player.level || 1) * 0.8,
    attackSpeed: 170,
  };
  const gain = (weights[upgrade.id] || 10) * (upgrade.valuePerLevel || 0);

  return {
    upgradeId: upgrade.id,
    score: gain / Math.max(1, cost),
    cost,
  };
}

function buyEfficientUpgrade(state, logs, tick) {
  const candidates = PLAYER_UPGRADES
    .map(upgrade => getUpgradeHeuristic(state, upgrade))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) return state;
  const best = candidates[0];
  const nextState = reduceState(state, { type: "UPGRADE_PLAYER", upgradeId: best.upgradeId });
  if (nextState !== state) {
    logDecision(logs, tick, `Compra upgrade: ${best.upgradeId}`);
  }
  return nextState;
}

function unlockBestTalent(state, logs, tick, options = {}) {
  const classId = state.player.class || getPreferredClass(options);
  const preferredSpec = getPreferredSpec(options);
  let priority = BERSERKER_TALENT_PRIORITY;

  if (classId === "mage") {
    if (state.player.specialization === "arcanist") {
      priority = [...MAGE_PERFECT_CAST_TALENT_PRIORITY, ...ARCANIST_TALENT_PRIORITY];
    } else if (state.player.specialization === "sorcerer") {
      priority = [...MAGE_OVERCHANNEL_TALENT_PRIORITY, ...SORCERER_TALENT_PRIORITY];
    } else if (preferredSpec === "arcanist") {
      priority = MAGE_PERFECT_CAST_TALENT_PRIORITY;
    } else {
      priority = MAGE_OVERCHANNEL_TALENT_PRIORITY;
    }
  } else {
    priority =
      state.player.specialization === "juggernaut"
        ? JUGGERNAUT_TALENT_PRIORITY
        : BERSERKER_TALENT_PRIORITY;
  }

  for (const talentId of priority) {
    const before = state.player.unlockedTalents || [];
    if (before.includes(talentId)) continue;
    const nextState = reduceState(state, { type: "UNLOCK_TALENT", talentId });
    if (nextState !== state) {
      logDecision(logs, tick, `Desbloquea talento: ${TALENTS.find(t => t.id === talentId)?.name || talentId}`);
      return nextState;
    }
  }

  return state;
}

function equipBestItems(state, logs, tick, humanProfile = {}) {
  let nextState = state;
  const inventory = [...(state.player.inventory || [])];
  const byType = {
    weapon: inventory.filter(item => item.type === "weapon").sort((a, b) => (b.rating || 0) - (a.rating || 0))[0],
    armor: inventory.filter(item => item.type === "armor").sort((a, b) => (b.rating || 0) - (a.rating || 0))[0],
  };

  for (const slot of ["weapon", "armor"]) {
    const candidate = byType[slot];
    const equipped = nextState.player.equipment?.[slot];
    if (!candidate) continue;
    const hpBias = clamp(Number(humanProfile.avgPushHpRatio || 0.7), 0.45, 0.9);
    const equipThreshold = hpBias >= 0.72 ? 4 : 8;
    if ((candidate.rating || 0) > ((equipped?.rating || 0) + equipThreshold)) {
      nextState = reduceState(nextState, { type: "EQUIP_ITEM", item: candidate });
      logDecision(logs, tick, `Equipa ${candidate.name}`);
    }
  }

  return nextState;
}

function cleanupInventory(state, logs, tick) {
  let nextState = state;
  const inventory = [...(nextState.player.inventory || [])];
  if (inventory.length < 42) return nextState;

  const equippedIds = new Set([
    nextState.player.equipment?.weapon?.id,
    nextState.player.equipment?.armor?.id,
  ]);

  const sorted = inventory
    .filter(item => !equippedIds.has(item.id))
    .sort((a, b) => (a.rating || 0) - (b.rating || 0));

  for (const item of sorted) {
    if ((nextState.player.inventory || []).length <= 34) break;
    if (item.rarity === "common" || item.rarity === "magic") {
      nextState = reduceState(nextState, { type: "CRAFT_EXTRACT_ITEM", payload: { itemId: item.id } });
      if (nextState !== state) {
        logDecision(logs, tick, `Extrae ${item.name}`);
        state = nextState;
      }
    }
  }

  return nextState;
}

function getAffixRollRatio(affix) {
  const min = affix?.range?.min;
  const max = affix?.range?.max;
  const value = affix?.rolledValue ?? affix?.value ?? 0;
  if (min == null || max == null || max <= min) return 1;
  return (value - min) / (max - min);
}

function getPreferredAffixIndex(item, preferredStats = []) {
  if (Number.isInteger(item?.crafting?.focusedAffixIndex)) {
    return Number(item.crafting.focusedAffixIndex);
  }

  const priorities = preferredStats.length > 0
    ? preferredStats
    : item.type === "weapon"
      ? ["damage", "attackSpeed", "critChance", "critDamage", "lifesteal"]
      : ["defense", "healthMax", "healthRegen", "blockChance", "dodgeChance", "thorns"];

  let bestIndex = null;
  let bestScore = -Infinity;

  (item.affixes || []).forEach((affix, index) => {
    const statIndex = priorities.indexOf(affix.stat);
    const priorityScore = statIndex === -1 ? 0 : (priorities.length - statIndex) * 100;
    const qualityScore = affix?.quality === "excellent" || affix?.lootOnlyQuality ? 250 : 80;
    const rollScore = Math.round((1 - getAffixRollRatio(affix)) * 100);
    const score = priorityScore + qualityScore + rollScore;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function getPreferredStats(state, itemType, humanProfile = {}) {
  const buildTag = getPlayerBuildTag(state.player);
  const buildPrefs = buildTag?.reasons || [];
  const spec = state.player.specialization;
  const classId = state.player.class;

  const weaponDefaults =
    classId === "mage"
      ? spec === "arcanist"
        ? ["damage", "markChance", "markEffectPerStack", "critChance", "multiHitChance", "healthMax"]
        : ["damage", "critChance", "critDamage", "multiHitChance", "markChance", "attackSpeed"]
      : spec === "juggernaut"
        ? ["damage", "attackSpeed", "defense", "blockChance", "healthMax"]
        : ["damage", "attackSpeed", "critChance", "critDamage", "lifesteal"];

  const armorDefaults =
    classId === "mage"
      ? spec === "arcanist"
        ? ["healthMax", "markChance", "markEffectPerStack", "healthRegen", "defense", "damage"]
        : ["healthMax", "damage", "critChance", "markChance", "dodgeChance", "healthRegen"]
      : spec === "berserker"
        ? ["healthMax", "lifesteal", "attackSpeed", "critChance", "damage"]
        : ["defense", "healthMax", "healthRegen", "blockChance", "thorns"];

  const base = itemType === "weapon" ? weaponDefaults : armorDefaults;
  const resolved = buildPrefs
    .flatMap(reason => {
      const normalized = reason.toLowerCase();
      if (normalized.includes("crit")) return ["critChance", "critDamage"];
      if (normalized.includes("lifesteal")) return ["lifesteal"];
      if (normalized.includes("attack speed")) return ["attackSpeed"];
      if (normalized.includes("ritmo") || normalized.includes("tempo")) return ["attackSpeed", "multiHitChance", "damage"];
      if (normalized.includes("damage on kill")) return ["damageOnKill"];
      if (normalized.includes("defensa")) return ["defense"];
      if (normalized.includes("bloqueo") || normalized.includes("block")) return ["blockChance"];
      if (normalized.includes("vida")) return ["healthMax", "healthRegen"];
      if (normalized.includes("thorns")) return ["thorns"];
      if (normalized.includes("fractura")) return ["fractureChance", "damage", "defense"];
      if (normalized.includes("mark") || normalized.includes("marca")) return ["markChance", "markEffectPerStack"];
      if (normalized.includes("control")) return ["markChance", "markEffectPerStack", "healthMax"];
      if (normalized.includes("setup")) return ["markChance", "markEffectPerStack", "damage"];
      if (normalized.includes("flow")) return ["markChance", "markEffectPerStack", "damage", "attackSpeed"];
      if (normalized.includes("loop") || normalized.includes("transfer")) return ["markChance", "markEffectPerStack", "healthMax"];
      if (normalized.includes("echo") || normalized.includes("multi-hit")) return ["multiHitChance", "attackSpeed", "damage"];
      if (normalized.includes("precision") || normalized.includes("consistencia")) return ["damage", "critChance", "markChance"];
      if (normalized.includes("burst") || normalized.includes("picos") || normalized.includes("volatil") || normalized.includes("highlight")) {
        return ["damage", "critChance", "critDamage", "multiHitChance"];
      }
      if (normalized.includes("bossing") || normalized.includes("apertura")) return ["damage", "markChance", "critChance", "healthMax"];
      if (normalized.includes("cooldown")) return ["multiHitChance", "critDamage"];
      if (normalized.includes("oro") || normalized.includes("esencia") || normalized.includes("luck")) return ["goldBonus", "essenceBonus", "lootBonus", "luck"];
      if (normalized.includes("aguante")) return ["healthMax", "healthRegen", "defense"];
      return [];
    })
    .filter(Boolean);

  return [...new Set([...(humanProfile.wishlistStats || []), ...resolved, ...base])];
}

function getWorstAffixIndex(item, preferredStats) {
  if (Number.isInteger(item?.crafting?.focusedAffixIndex)) {
    return Number(item.crafting.focusedAffixIndex);
  }

  let worstIndex = null;
  let worstScore = Infinity;

  (item.affixes || []).forEach((affix, index) => {
    const preferredIndex = preferredStats.indexOf(affix.stat);
    const wantedScore = preferredIndex === -1 ? 0 : (preferredStats.length - preferredIndex) * 120;
    const qualityScore = affix?.quality === "excellent" || affix?.lootOnlyQuality ? 260 : 90;
    const rollScore = Math.round(getAffixRollRatio(affix) * 100);
    const score = wantedScore + qualityScore + rollScore;
    if (score < worstScore) {
      worstScore = score;
      worstIndex = index;
    }
  });

  return worstIndex;
}

function maybeCraft(state, logs, tick, options = {}) {
  const humanProfile = getHumanProfile(options);
  const replayHints = deriveReplayDecisionHints(getReplaySource(state, options), state);
  let nextState = state;
  const equippedItems = [nextState.player.equipment?.weapon, nextState.player.equipment?.armor].filter(Boolean);

  for (const item of equippedItems) {
    if (!item) continue;
    const preferredStats = getPreferredStats(nextState, item.type, humanProfile);
    const craftMode = replayHints.preferredCraftMode || humanProfile.preferredCraftMode || null;

    if ((item.level || 1) < 4) {
      const upgraded = reduceState(nextState, { type: "CRAFT_UPGRADE_ITEM", payload: { itemId: item.id } });
      if (upgraded !== nextState) {
        logDecision(logs, tick, `Mejora ${item.name}`);
        return upgraded;
      }
    }

    if (item.rarity === "epic" && (item.level || 1) >= 8 && (item.rating || 0) >= 260) {
      const ascended = reduceState(nextState, { type: "CRAFT_ASCEND_ITEM", payload: { itemId: item.id } });
      if (ascended !== nextState) {
        logDecision(logs, tick, `Asciende ${item.name} a legendario`);
        return ascended;
      }
    }

    const polishCount = item.crafting?.polishCount || 0;

    const worstAffixIndex = getWorstAffixIndex(item, preferredStats);
    const worstAffix = worstAffixIndex == null ? null : item.affixes?.[worstAffixIndex];
    const hasWishlistGap =
      preferredStats.length > 0 &&
      (item.affixes || []).every(affix => !preferredStats.includes(affix.stat));

    const polishIndex = getPreferredAffixIndex(item, preferredStats);
    const targetAffix = polishIndex == null ? null : item.affixes?.[polishIndex];
    if (
      targetAffix &&
      (targetAffix?.quality === "excellent" || targetAffix?.lootOnlyQuality) &&
      getAffixRollRatio(targetAffix) < 0.78 &&
      polishCount < (craftMode === "polish" ? 4 : 3)
    ) {
      const polished = reduceState(nextState, {
        type: "CRAFT_POLISH_ITEM",
        payload: { itemId: item.id, affixIndex: polishIndex },
      });
      if (polished !== nextState) {
        logDecision(logs, tick, `Pulido sobre ${item.name} (${targetAffix.stat})`);
        return polished;
      }
    }

    if (
      preferredStats.length > 0 &&
      worstAffix &&
      (item.crafting?.reforgeCount || 0) < (craftMode === "reforge" ? 3 : 2) &&
      item.rarity !== "common" &&
      (item.rating || 0) >= 105 &&
      (!preferredStats.includes(worstAffix.stat) || hasWishlistGap)
    ) {
      const totalOptionCount = 3 + Math.max(0, Math.floor(nextState.player?.prestigeBonuses?.reforgeOptionCount || 0));
      const options = buildReforgePreview(
        item,
        worstAffixIndex,
        Math.max(1, totalOptionCount - 1),
        preferredStats
      );
      const chosen = options.find(option => preferredStats.includes(option.stat)) || options[0];
      if (chosen) {
        const reforged = reduceState(nextState, {
          type: "CRAFT_REFORGE_ITEM",
          payload: { itemId: item.id, affixIndex: worstAffixIndex, replacementAffix: chosen },
        });
        if (reforged !== nextState) {
          logDecision(logs, tick, `Reforja ${item.name} (${worstAffix.stat} -> ${chosen.stat})`);
          return reforged;
        }
      }
    }
  }

  return nextState;
}

function maybeAdjustTier(state, logs, tick, options = {}) {
  const humanProfile = getHumanProfile(options);
  const replayHints = deriveReplayDecisionHints(getReplaySource(state, options), state);
  const snapshot = state.combat.performanceSnapshot || {};
  const hpRatio = (state.player.hp || 0) / Math.max(1, state.player.maxHp || 1);
  const tier = state.combat.currentTier || 1;
  const maxTier = state.combat.maxTier || 1;
  const pressure = Math.max(10, Math.round(12 + tier * 10 + tier * tier * 1.5));
  const pressureRatio = (snapshot.damagePerTick || 0) / Math.max(1, pressure);
  const oneShotting = (snapshot.damagePerTick || 0) >= ((state.combat.enemy?.maxHp || 0) * 0.92);
  const pushSimilarityBias = Number(replayHints.push.weight || 0) - Number(replayHints.drop.weight || 0);
  const dropSimilarityBias = Number(replayHints.drop.weight || 0) - Number(replayHints.push.weight || 0);
  const autoSimilarityBias = Number(replayHints.autoOn.weight || 0) - Number(replayHints.autoOff.weight || 0);
  const pushHpTarget = clamp(Number(humanProfile.avgPushHpRatio || 0.7) - (pushSimilarityBias > 0.08 ? 0.05 : 0), 0.48, 0.88);
  const dropHpTarget = clamp(Number(humanProfile.avgDropHpRatio || 0.32) + (dropSimilarityBias > 0.08 ? 0.04 : 0), 0.18, 0.6);
  const autoAdvanceBias = Number(humanProfile.autoAdvanceBias || 0);
  const contextualPush =
    replayHints.push.count >= 2 &&
    replayHints.pushConfidence >= 0.58 &&
    hpRatio > Math.max(0.42, pushHpTarget - 0.08) &&
    pressureRatio > 0.9;
  const contextualDrop =
    replayHints.drop.count >= 2 &&
    replayHints.dropConfidence >= 0.58 &&
    (hpRatio < Math.min(0.7, dropHpTarget + 0.05) || pressureRatio < 0.82);
  const safeToPush = (hpRatio > pushHpTarget && (pressureRatio > 1.02 || oneShotting)) || contextualPush;
  const unsafeToPush = hpRatio < Math.max(0.2, dropHpTarget) || pressureRatio < 0.72 || contextualDrop;

  if (!state.combat.autoAdvance && tier >= maxTier && safeToPush && maxTier < 10 && (autoAdvanceBias + autoSimilarityBias * 4) >= -1) {
    const pushing = reduceState(state, { type: "TOGGLE_AUTO_ADVANCE" });
    if (pushing !== state) {
      logDecision(logs, tick, `Activa auto-avance para empujar desde Tier ${tier} (similitud humana)`);
      return pushing;
    }
  }

  if (state.combat.autoAdvance && unsafeToPush && (replayHints.autoDisableConfidence >= 0.45 || pressureRatio < 0.6 || hpRatio < 0.18)) {
    const safer = reduceState(state, { type: "TOGGLE_AUTO_ADVANCE" });
    if (safer !== state) {
      logDecision(logs, tick, `Desactiva auto-avance por presion en Tier ${tier} (similitud humana)`);
      return safer;
    }
  }

  if (tier < maxTier && (hpRatio < Math.max(0.16, dropHpTarget - 0.04) || pressureRatio < 0.65 || contextualDrop)) {
    const next = reduceState(state, { type: "SET_TIER", tier: Math.max(1, tier - 1) });
    if (next !== state) {
      logDecision(logs, tick, `Retrocede a Tier ${Math.max(1, tier - 1)}${contextualDrop ? " por replay similar" : ""}`);
      return next;
    }
  }

  if (tier < maxTier && safeToPush) {
    const next = reduceState(state, { type: "SET_TIER", tier: tier + 1 });
    if (next !== state) {
      logDecision(logs, tick, `Empuja a Tier ${tier + 1}${contextualPush ? " por replay similar" : ""}`);
      return next;
    }
  }

  return state;
}

function buyPrestigeNodes(state, logs, tick) {
  let nextState = state;
  const preferred = [
    ...(state.player.class === "mage" ? MAGE_PRESTIGE_PRIORITY : WARRIOR_PRESTIGE_PRIORITY),
    ...COMMON_PRESTIGE_PRIORITY,
  ];

  if (state.player.specialization === "berserker") {
    preferred.unshift("lineage_berserker_fever", "lineage_berserker_mania", "lineage_berserker_apex");
  }
  if (state.player.specialization === "juggernaut") {
    preferred.unshift("lineage_juggernaut_core", "lineage_juggernaut_throne", "lineage_juggernaut_apex");
  }
  if (state.player.specialization === "sorcerer") {
    preferred.unshift("sorcery_volatile_prism", "sorcery_cataclysm_rhythm", "sorcery_star_channel", "sorcery_apex");
  }
  if (state.player.specialization === "arcanist") {
    preferred.unshift("dominion_loop_trace", "dominion_temporal_frame", "dominion_blue_script", "dominion_apex");
  }

  for (const nodeId of preferred) {
    const node = PRESTIGE_TREE_NODES.find(candidate => candidate.id === nodeId);
    if (!node) continue;
    const purchase = canPurchasePrestigeNode(nextState, node);
    if (!purchase.ok) continue;
    const updated = reduceState(nextState, { type: "BUY_PRESTIGE_NODE", nodeId });
    if (updated !== nextState) {
      nextState = updated;
      logDecision(logs, tick, `Compra reliquia: ${node.name}`);
    }
  }

  return nextState;
}

function maybePrestige(state, logs, tick, ticksRemaining, options = {}) {
  const humanProfile = getHumanProfile(options);
  const prestigeCheck = canPrestige(state);
  const echoes = calculatePrestigeEchoGain(state);
  if (!prestigeCheck.ok) return state;
  if (ticksRemaining < 60) return state;
  const prestigeFloor =
    (humanProfile.avgPushHpRatio || 0) >= 0.76
      ? 5
      : (humanProfile.avgPushHpRatio || 0) > 0
        ? 4
        : 3;
  const shouldForceFirstQuickPrestige = (state.prestige?.level || 0) <= 0 && echoes >= 2;
  if (!shouldForceFirstQuickPrestige && echoes < prestigeFloor) return state;

  const nextState = reduceState(state, { type: "PRESTIGE", resetClass: false });
  if (nextState !== state) {
    logDecision(logs, tick, `Hace prestige (+${echoes} ecos)`);
  }
  return nextState;
}

function maybeStartRun(state, logs, tick, options = {}) {
  if (!state.combat?.pendingRunSetup) return state;

  const unlockedPowers = Object.values(state.codex?.powerDiscoveries || {}).filter(value => Number(value || 0) > 0).length;
  let sigilId = "free";
  if (unlockedPowers <= 1) {
    sigilId = "hunt";
  } else if ((state.player?.essence || 0) >= 1200) {
    sigilId = "forge";
  } else if ((state.prestige?.level || 0) >= 3 && unlockedPowers >= 4) {
    sigilId = "dominion";
  } else {
    sigilId = "ascend";
  }

  let nextState = reduceState(state, { type: "SELECT_RUN_SIGIL", sigilId });
  nextState = reduceState(nextState, { type: "START_RUN" });
  if (nextState !== state) {
    logDecision(logs, tick, `Inicia run con sigilo: ${sigilId}`);
  }
  return nextState;
}

function runDecisionCycle(state, logs, tick, ticksRemaining, options = {}) {
  const humanProfile = getHumanProfile(options);
  let nextState = state;
  nextState = ensureClass(nextState, logs, tick, options);
  nextState = maybeSelectSpec(nextState, logs, tick, options);
  nextState = maybeEnterExpeditionSetup(nextState, logs, tick);
  nextState = maybeStartRun(nextState, logs, tick, options);
  nextState = claimGoals(nextState, logs, tick);
  nextState = equipBestItems(nextState, logs, tick, humanProfile);
  nextState = maybeCraft(nextState, logs, tick, options);
  nextState = buyEfficientUpgrade(nextState, logs, tick);
  nextState = unlockBestTalent(nextState, logs, tick, options);
  nextState = cleanupInventory(nextState, logs, tick);
  nextState = maybeAdjustTier(nextState, logs, tick, options);
  nextState = buyPrestigeNodes(nextState, logs, tick);
  nextState = maybePrestige(nextState, logs, tick, ticksRemaining, options);
  return nextState;
}

function buildBotSummary(state, logs, ticks, options = {}) {
  const entries = buildBalanceTelemetryEntries(state);
  const compactPayload = buildBalanceTelemetryPayload(state);
  const fullPayload = buildFullTelemetryPayload(state);
  const analytics = state.combat?.analytics || {};
  const stagnationReason =
    (analytics.maxTierReached || 1) <= 1
      ? "No logro romper early game"
      : (analytics.couldAdvanceMoments || 0) > (analytics.tierAdvanceCount || 0)
        ? "Tuvo ventanas de push desaprovechadas"
        : "Progreso aceptable";
  return {
    ticksSimulated: ticks,
    finalState: state,
    telemetryEntries: entries,
    telemetryText: buildBalanceTelemetryReport(state),
    telemetryPayload: compactPayload,
    telemetryPayloadCompact: compactPayload,
    telemetryPayloadFull: fullPayload,
    decisions: logs,
    summary: {
      level: state.player.level || 1,
      tier: state.combat.maxTier || state.combat.currentTier || 1,
      specialization: state.player.specialization || "-",
      gold: state.player.gold || 0,
      essence: state.player.essence || 0,
      prestigeLevel: state.prestige?.level || 0,
      echoes: state.prestige?.echoes || 0,
      bestDrop: state.combat?.analytics?.bestDropName || "-",
      stagnationReason,
      humanProfile: options?.humanProfile || null,
    },
  };
}

export function runBalanceBotSimulation(inputState, options = {}) {
  const ticks = Math.max(60, Math.min(options.ticks || 1800, 7200));
  let state = cloneState(inputState);
  const logs = [];

  state = ensureClass(state, logs, 0, options);

  for (let tick = 1; tick <= ticks; tick += 1) {
    if (tick === 1 || tick % 10 === 0) {
      state = runDecisionCycle(state, logs, tick, ticks - tick, options);
    }
    state = reduceState(state, { type: "TICK" });
  }

  state = claimGoals(state, logs, ticks);
  state = equipBestItems(state, logs, ticks, getHumanProfile(options));
  state = buyPrestigeNodes(state, logs, ticks);

  return buildBotSummary(state, logs, ticks, options);
}
