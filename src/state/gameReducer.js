import { processTick }              from "../engine/combat/processTickRuntime";
import { spawnEnemy }               from "../engine/combat/enemyEngine";
import { refreshStats }             from "../engine/combat/statEngine";
import { calcStats }                from "../engine/combat/statEngine";
import { processEvents }            from "../engine/eventEngine";
import { addToInventory, syncEquipment } from "../engine/inventory/inventoryEngine";
import { sellItem, sellItems }      from "../engine/inventory/economyEngine";
import { craftReroll, craftPolish, craftReforge, craftReforgePreview, craftUpgrade, craftAscend, craftExtract } from "../engine/crafting/craftingEngine";
import { checkAchievements } from "../engine/progression/achievementEngine";
import { getLegendaryPowerImprintReduction, recordCodexSighting, syncCodexBonuses } from "../engine/progression/codexEngine";
import { createEmptySessionAnalytics } from "../utils/runTelemetry";
import { buildReplayLibraryEntry, createEmptyReplayLog, normalizeReplayLibrary, recordReplayState } from "../utils/replayLog";

import { CLASSES }         from "../data/classes";
import { SKILLS }          from "../data/skills";
import { PLAYER_UPGRADES } from "../data/playerUpgrades";
import { TALENTS }         from "../data/talents";
import { ACTIVE_GOALS } from "../data/activeGoals";
import { useSkill } from "../engine/skills/skillEngine";
import { isGoalCompleted } from "../engine/progression/goalEngine";
import {
  calculatePrestigeEchoGain,
  canPrestige,
  createEmptyPrestigeCycleProgress,
  canPurchasePrestigeNode,
  getNextPrestigeRank,
  syncPrestigeBonuses,
} from "../engine/progression/prestigeEngine";
import { PRESTIGE_TREE_NODES } from "../data/prestige";
import { getRunSigil, getRunSigilPlayerBonuses, isRunSigilsUnlocked } from "../data/runSigils";

import {
  upgradePlayer,
  unlockTalent,
  upgradeTalentNode,
  resetTalentTree,
  selectClass,
  selectSpecialization
} from "../engine/progression/progressionEngine";

const CRIT_CAP         = 0.75;
const ATTACK_SPEED_CAP = 0.70;

function withAchievementProgress(state) {
  const { newAchievements, bonusGold, unlocked } = checkAchievements(state);
  if ((!unlocked || unlocked.length === 0) && bonusGold <= 0) return state;

  return {
    ...state,
    achievements: newAchievements,
    player: {
      ...state.player,
      gold: (state.player.gold || 0) + bonusGold,
    },
    combat: {
      ...state.combat,
      analytics: {
        ...(state.combat.analytics || createEmptySessionAnalytics()),
        goldEarned: (state.combat.analytics?.goldEarned || 0) + bonusGold,
        goldBySource: {
          ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
          achievements: (state.combat.analytics?.goldBySource?.achievements || 0) + bonusGold,
        },
      },
      log: [
        ...(state.combat?.log || []),
        ...unlocked.map(achievement => `LOGRO: ${achievement.name} +${achievement.reward || 0} oro`),
      ].slice(-20),
    },
  };
}

function appendCraftingLog(combat, entry) {
  if (!entry) return combat;
  return {
    ...combat,
    craftingLog: [...(combat.craftingLog || []), entry].slice(-30),
  };
}

function isEquippedItemId(player, itemId) {
  if (!itemId) return false;
  const equipment = player?.equipment || {};
  return equipment.weapon?.id === itemId || equipment.armor?.id === itemId;
}

function buildBlockedOperationState(state, { analyticsKey, message }) {
  return {
    ...state,
    combat: {
      ...state.combat,
      analytics: {
        ...(state.combat.analytics || createEmptySessionAnalytics()),
        [analyticsKey]: (state.combat.analytics?.[analyticsKey] || 0) + 1,
      },
      log: [
        ...(state.combat?.log || []),
        message,
      ].slice(-20),
    },
  };
}

function baseGameReducer(state, action) {
  switch (action.type) {

    case "SET_TAB":
      if (state.combat?.reforgeSession && action.tab !== state.currentTab) {
        return state;
      }
      return { ...state, currentTab: action.tab };

    case "RESET_SESSION_ANALYTICS":
      return {
        ...state,
        combat: {
          ...state.combat,
          analytics: createEmptySessionAnalytics(),
          log: [
            ...(state.combat?.log || []),
            "Telemetria de sesion reiniciada.",
          ].slice(-20),
        },
      };

    case "RESET_REPLAY_LOG":
      return {
        ...state,
        replay: createEmptyReplayLog(),
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "Replay de sesion reiniciado.",
          ].slice(-20),
        },
      };

    case "SAVE_CURRENT_REPLAY_TO_LIBRARY": {
      const currentReplay = state.replay || createEmptyReplayLog();
      const hasReplayData = (currentReplay.actions || []).length > 0 || (currentReplay.milestones || []).length > 0;
      if (!hasReplayData) return state;

      const nextLibrary = normalizeReplayLibrary({
        entries: [
          ...(state.replayLibrary?.entries || []),
          buildReplayLibraryEntry({ replay: currentReplay }, { label: action.label }),
        ],
      });

      return {
        ...state,
        replayLibrary: nextLibrary,
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `Replay guardado en biblioteca${action.label ? `: ${action.label}` : "."}`,
          ].slice(-20),
        },
      };
    }

    case "IMPORT_REPLAY_LIBRARY": {
      const entries = Array.isArray(action.entries) ? action.entries : [];
      if (entries.length === 0) return state;
      const nextLibrary = normalizeReplayLibrary({
        entries: [
          ...(state.replayLibrary?.entries || []),
          ...entries,
        ],
      });

      return {
        ...state,
        replayLibrary: nextLibrary,
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            `${entries.length} replay(s) importados a la biblioteca.`,
          ].slice(-20),
        },
      };
    }

    case "TOGGLE_REPLAY_LIBRARY_ENTRY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({
          entries: (state.replayLibrary?.entries || []).map(entry =>
            entry.id === action.replayId ? { ...entry, isActive: !entry.isActive } : entry
          ),
        }),
      };

    case "DELETE_REPLAY_LIBRARY_ENTRY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({
          entries: (state.replayLibrary?.entries || []).filter(entry => entry.id !== action.replayId),
        }),
      };

    case "CLEAR_REPLAY_LIBRARY":
      return {
        ...state,
        replayLibrary: normalizeReplayLibrary({ entries: [] }),
        combat: {
          ...state.combat,
          log: [
            ...(state.combat?.log || []),
            "Biblioteca de replays vaciada.",
          ].slice(-20),
        },
      };

    case "UPDATE_LOOT_RULES":
      return {
        ...state,
        settings: {
          ...state.settings,
          lootRules: {
            ...(state.settings?.lootRules || {}),
            ...(action.lootRules || {}),
          },
        },
      };

    case "TOGGLE_THEME":
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: state.settings?.theme === "dark" ? "light" : "dark",
        },
      };

    case "SET_THEME":
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.theme === "dark" ? "dark" : "light",
        },
      };

    case "SELECT_RUN_SIGIL": {
      if (!state.combat?.pendingRunSetup || !isRunSigilsUnlocked(state)) return state;
      const runSigil = getRunSigil(action.sigilId || "free");
      return {
        ...state,
        combat: {
          ...state.combat,
          pendingRunSigilId: runSigil.id,
        },
      };
    }

    case "START_RUN": {
      if (!state.combat?.pendingRunSetup) return state;
      const runSigil = getRunSigil(state.combat?.pendingRunSigilId || "free");
      const nextEnemy = spawnEnemy(state.combat?.currentTier || 1);
      const nextCodex = recordCodexSighting(state.codex || {}, nextEnemy);
      const nextPlayer = syncCodexBonuses(
        syncPrestigeBonuses(
          {
            ...state.player,
            runSigilBonuses: getRunSigilPlayerBonuses(runSigil.id),
          },
          state.prestige
        ),
        nextCodex
      );

      return {
        ...state,
        codex: nextCodex,
        player: {
          ...nextPlayer,
          hp: nextPlayer.maxHp,
        },
        combat: {
          ...state.combat,
          pendingRunSetup: false,
          activeRunSigilId: runSigil.id,
          enemy: nextEnemy,
          log: [
            ...(state.combat.log || []),
            `SIGILO: ${runSigil.name}. ${runSigil.summary}`,
          ].slice(-20),
        },
      };
    }

    case "TICK":
      return processTick(state);

    case "BULK_TICK": {
      const count = Math.max(0, Math.min(action.count || 0, 3600));
      let nextState = state;
      const before = state;
      let bestLootEvent = null;

      for (let i = 0; i < count; i++) {
        nextState = processTick(nextState);
        const candidateLoot = nextState.combat?.latestLootEvent;
        if (!candidateLoot) continue;

        const currentScore = Number(candidateLoot.score || 0);
        const bestScore = Number(bestLootEvent?.score || 0);
        if (
          !bestLootEvent ||
          currentScore > bestScore ||
          (currentScore === bestScore && (candidateLoot.rating || 0) > (bestLootEvent.rating || 0))
        ) {
          bestLootEvent = candidateLoot;
        }
      }

      if (count > 0 && action.source === "offline") {
        const bestDropSource =
          bestLootEvent
            ? {
                bestDropName: bestLootEvent.name,
                bestDropRarity: bestLootEvent.rarity,
                bestDropHighlight: bestLootEvent.highlight,
                bestDropPerfectRolls: bestLootEvent.perfectRollCount,
              }
            : nextState.combat.runStats?.bestDropName
              ? nextState.combat.runStats
            : nextState.combat.lastRunSummary;
        const offlineSummary = {
          simulatedSeconds: count,
          goldGained: Math.max(0, Math.floor((nextState.player.gold || 0) - (before.player.gold || 0))),
          xpGained: Math.max(0, Math.floor((nextState.player.xp || 0) - (before.player.xp || 0))),
          essenceGained: Math.max(0, Math.floor((nextState.player.essence || 0) - (before.player.essence || 0))),
          killsGained: Math.max(0, (nextState.stats?.kills || 0) - (before.stats?.kills || 0)),
          itemsGained: Math.max(0, (nextState.stats?.itemsFound || 0) - (before.stats?.itemsFound || 0)),
          levelsGained: Math.max(0, (nextState.player.level || 0) - (before.player.level || 0)),
          bestDropName: bestDropSource?.bestDropName || null,
          bestDropRarity: bestDropSource?.bestDropRarity || null,
          bestDropHighlight: bestDropSource?.bestDropHighlight || null,
          bestDropPerfectRolls: bestDropSource?.bestDropPerfectRolls || 0,
        };

        return {
          ...nextState,
          combat: {
            ...nextState.combat,
            offlineSummary,
            floatEvents: [],
            log: [
              ...nextState.combat.log,
              `Progreso offline resuelto: ${count}s simulados.`,
            ].slice(-20),
          },
        };
      }

      return nextState;
    }

    case "DISMISS_OFFLINE_SUMMARY":
      return {
        ...state,
        combat: {
          ...state.combat,
          offlineSummary: null,
        },
      };

    case "SET_OFFLINE_SUMMARY":
      return {
        ...state,
        combat: {
          ...state.combat,
          offlineSummary: action.summary || null,
          floatEvents: [],
          log: [
            ...(state.combat.log || []),
            `Progreso offline resuelto: ${Math.max(0, Math.floor(action.summary?.simulatedSeconds || 0))}s simulados.`,
          ].slice(-20),
        },
      };

    case "CLAIM_GOAL": {
      const goal = ACTIVE_GOALS.find(candidate => candidate.id === action.goalId);
      if (!goal) return state;
      if ((state.goals?.claimed || []).includes(goal.id)) return state;
      if (!isGoalCompleted(state, goal)) return state;

      const reward = goal.reward || {};
      return withAchievementProgress({
        ...state,
        player: {
          ...state.player,
          gold: (state.player.gold || 0) + (reward.gold || 0),
          essence: (state.player.essence || 0) + (reward.essence || 0),
          talentPoints: (state.player.talentPoints || 0) + (reward.talentPoints || 0),
        },
        goals: {
          ...state.goals,
          claimed: [...(state.goals?.claimed || []), goal.id],
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            goldEarned: (state.combat.analytics?.goldEarned || 0) + (reward.gold || 0),
            essenceEarned: (state.combat.analytics?.essenceEarned || 0) + (reward.essence || 0),
            goldBySource: {
              ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
              goals: (state.combat.analytics?.goldBySource?.goals || 0) + (reward.gold || 0),
            },
            essenceBySource: {
              ...(state.combat.analytics?.essenceBySource || createEmptySessionAnalytics().essenceBySource),
              goals: (state.combat.analytics?.essenceBySource?.goals || 0) + (reward.essence || 0),
            },
          },
          log: [
            ...(state.combat.log || []),
            `OBJETIVO: ${goal.name} reclamado (+${reward.gold || 0} oro, +${reward.essence || 0} esencia${reward.talentPoints ? `, +${reward.talentPoints} TP` : ""})`,
          ].slice(-20),
        },
      });
    }

    case "TOGGLE_AUTO_ADVANCE":
      return {
        ...state,
        combat: {
          ...state.combat,
          autoAdvance: !state.combat.autoAdvance,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            autoAdvanceEnabledCount:
              (state.combat.analytics?.autoAdvanceEnabledCount || 0) + (state.combat.autoAdvance ? 0 : 1),
            autoAdvanceDisabledCount:
              (state.combat.analytics?.autoAdvanceDisabledCount || 0) + (state.combat.autoAdvance ? 1 : 0),
          },
        },
      };

    case "TOGGLE_SKILL_AUTOCAST": {
      const { skillId } = action;
      const current = state.combat.skillAutocasts?.[skillId] || false;
      return {
        ...state,
        combat: {
          ...state.combat,
          skillAutocasts: { ...state.combat.skillAutocasts, [skillId]: !current },
        },
      };
    }

    // --------------------------------------------------------
    case "SET_TIER": {
      const tier     = Math.max(1, Math.min(action.tier, state.combat.maxTier));
      const prevTier = state.combat.currentTier || 1;

      let newState = {
        ...state,
        combat: {
          ...state.combat,
          currentTier:       tier,
          autoAdvance:       false,
          enemy:             spawnEnemy(tier),
          ticksInCurrentRun: 0,
          sessionKills:      0,
          effects:           [],
          triggerCounters: {
            kills: 0,
            onHit: 0,
            crit: 0,
            onDamageTaken: 0,
          },
          pendingOnKillDamage: 0,
          floatEvents: [],
          skillDamageTimeline: [],
          runStats: {
            kills: 0,
            damageDealt: 0,
            gold: 0,
            xp: 0,
            essence: 0,
            items: 0,
            bestDropName: null,
            bestDropRarity: null,
            bestDropHighlight: null,
            bestDropPerfectRolls: 0,
            bestDropScore: 0,
          },
          performanceSnapshot: {
            damagePerTick: 0,
            goldPerTick: 0,
            xpPerTick: 0,
            killsPerMinute: 0,
          },
          latestLootEvent: null,
          reforgeSession: null,
          analytics: state.combat.analytics || createEmptySessionAnalytics(),
          log:               [],
        },
      };

      const nextAnalytics = {
        ...(newState.combat.analytics || createEmptySessionAnalytics()),
        tierAdvanceCount: (newState.combat.analytics?.tierAdvanceCount || 0) + (tier > prevTier ? 1 : 0),
        autoAdvanceDisabledCount:
          (newState.combat.analytics?.autoAdvanceDisabledCount || 0) + (state.combat.autoAdvance ? 1 : 0),
      };
      newState = {
        ...newState,
        combat: {
          ...newState.combat,
          analytics: nextAnalytics,
        },
      };

      if (tier > prevTier) {
        const { newPlayer, newActiveEvents, logs } = processEvents("onTierUp", {
          ...newState,
          combat: { ...newState.combat, activeEvents: state.combat.activeEvents || [] },
        });
        newState = {
          ...newState,
          player: newPlayer,
          combat: { ...newState.combat, activeEvents: newActiveEvents, log: logs },
        };
      }

      const sightedCodex = recordCodexSighting(newState.codex || state.codex || {}, newState.combat.enemy);
      if (sightedCodex !== (newState.codex || state.codex)) {
        newState = {
          ...newState,
          codex: sightedCodex,
          player: syncCodexBonuses(newState.player, sightedCodex),
        };
      }

      return newState;
    }

    // --------------------------------------------------------
    case "EQUIP_ITEM": {
      const item    = action.item;
      const slot    = item.type === "weapon" ? "weapon" : "armor";
      const oldItem = state.player.equipment[slot];

      let inventory = [...state.player.inventory];
      if (oldItem) {
        const result = addToInventory(inventory, oldItem);
        inventory = result.inventory;
      }

      const idx = inventory.findIndex(i => i.id === item.id);
      inventory = inventory.filter((_, i) => i !== idx);

      return {
        ...state,
        player: refreshStats({
          ...state.player,
          inventory,
          equipment: { ...state.player.equipment, [slot]: item },
        }),
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            equippedUpgrades:
              (state.combat.analytics?.equippedUpgrades || 0) +
              ((item?.rating || 0) > (oldItem?.rating || 0) ? 1 : 0),
            bestItemRating: Math.max(state.combat.analytics?.bestItemRating || 0, item?.rating || 0),
          },
        },
      };
    }

    // --------------------------------------------------------
    case "USE_SKILL": {
      const nextState = useSkill(state, action.skillId);
      if (nextState === state) return state;
      return {
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            manualSkillsUsed: (nextState.combat.analytics?.manualSkillsUsed || 0) + 1,
          },
        },
      };
    }

    // --------------------------------------------------------
    case "SELL_ITEM": {
      const itemId = action.item?.id;
      if (isEquippedItemId(state.player, itemId)) {
        return buildBlockedOperationState(state, {
          analyticsKey: "blockedSellEquippedAttempts",
          message: "Seguridad: intento de vender item equipado bloqueado.",
        });
      }
      const soldItem = state.player.inventory.find(item => item.id === action.item.id);
      const newPlayer = sellItem(state.player, action.item.id);
      if (!newPlayer) return state;
      return withAchievementProgress({
        ...state,
        player: newPlayer,
        stats: {
          ...state.stats,
          itemsSold: (state.stats?.itemsSold || 0) + 1,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            itemsSold: ((state.combat.analytics?.itemsSold || 0) + 1),
            goldEarned: (state.combat.analytics?.goldEarned || 0) + Math.max(0, (newPlayer.gold || 0) - (state.player.gold || 0)),
            goldBySource: {
              ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
              selling: (state.combat.analytics?.goldBySource?.selling || 0) + Math.max(0, (newPlayer.gold || 0) - (state.player.gold || 0)),
            },
            bestItemRating: Math.max(state.combat.analytics?.bestItemRating || 0, soldItem?.rating || 0),
          },
        },
      });
    }

    case "SELL_ITEMS": {
      const requestedIds = Array.isArray(action.itemIds) ? [...new Set(action.itemIds)] : [];
      if (requestedIds.length === 0) return state;

      const blockedCount = requestedIds.filter(itemId => isEquippedItemId(state.player, itemId)).length;
      const inventoryIdSet = new Set((state.player.inventory || []).map(item => item.id));
      const safeIds = requestedIds.filter(itemId => inventoryIdSet.has(itemId) && !isEquippedItemId(state.player, itemId));

      if (safeIds.length === 0 && blockedCount > 0) {
        return {
          ...buildBlockedOperationState(state, {
            analyticsKey: "blockedSellEquippedAttempts",
            message: "Seguridad: intento de venta masiva sobre equipados bloqueado.",
          }),
          combat: {
            ...state.combat,
            analytics: {
              ...(state.combat.analytics || createEmptySessionAnalytics()),
              blockedSellEquippedAttempts:
                (state.combat.analytics?.blockedSellEquippedAttempts || 0) + blockedCount,
            },
            log: [
              ...(state.combat?.log || []),
              `Seguridad: ${blockedCount} items equipados ignorados en venta masiva.`,
            ].slice(-20),
          },
        };
      }

      const newPlayer = sellItems(state.player, safeIds);
      if (!newPlayer) return state;
      const soldItems = (state.player.inventory || []).filter(item => safeIds.includes(item.id));
      const soldCount = soldItems.length;
      return withAchievementProgress({
        ...state,
        player: newPlayer,
        stats: {
          ...state.stats,
          itemsSold: (state.stats?.itemsSold || 0) + soldCount,
        },
        combat: {
          ...state.combat,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            itemsSold: (state.combat.analytics?.itemsSold || 0) + soldCount,
            blockedSellEquippedAttempts:
              (state.combat.analytics?.blockedSellEquippedAttempts || 0) + blockedCount,
            goldEarned: (state.combat.analytics?.goldEarned || 0) + Math.max(0, (newPlayer.gold || 0) - (state.player.gold || 0)),
            goldBySource: {
              ...(state.combat.analytics?.goldBySource || createEmptySessionAnalytics().goldBySource),
              selling: (state.combat.analytics?.goldBySource?.selling || 0) + Math.max(0, (newPlayer.gold || 0) - (state.player.gold || 0)),
            },
            bestItemRating: Math.max(
              state.combat.analytics?.bestItemRating || 0,
              ...soldItems.map(item => item.rating || 0)
            ),
          },
        },
      });
    }

    // --------------------------------------------------------
    case "UPGRADE_PLAYER": {
      const nextState = upgradePlayer(state, action.upgradeId);
      if (nextState === state) return state;
      return {
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            playerUpgradesPurchased: (nextState.combat.analytics?.playerUpgradesPurchased || 0) + 1,
            goldSpent: (nextState.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (nextState.player.gold || 0)),
            goldSpentBySource: {
              ...(nextState.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              playerUpgrades:
                (nextState.combat.analytics?.goldSpentBySource?.playerUpgrades || 0) +
                Math.max(0, (state.player.gold || 0) - (nextState.player.gold || 0)),
            },
          },
        },
      };
    }

    case "UPGRADE_SKILL":
      return upgradePlayer(state, action.skill);

    case "UNLOCK_TALENT": {
      const nextState = unlockTalent(state, action.talentId);
      if (nextState === state) return state;
      return withAchievementProgress({
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            talentsUnlocked: (nextState.combat.analytics?.talentsUnlocked || 0) + 1,
          },
        },
      });
    }

    case "UPGRADE_TALENT_NODE": {
      const nextState = upgradeTalentNode(state, action.nodeId);
      if (nextState === state) return state;
      return withAchievementProgress({
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            talentsUnlocked: (nextState.combat.analytics?.talentsUnlocked || 0) + 1,
            talentNodeUpgrades: (nextState.combat.analytics?.talentNodeUpgrades || 0) + 1,
          },
        },
      });
    }

    case "RESET_TALENT_TREE": {
      const nextState = resetTalentTree(state);
      if (nextState === state) return state;
      return withAchievementProgress({
        ...nextState,
        combat: {
          ...nextState.combat,
          analytics: {
            ...(nextState.combat.analytics || createEmptySessionAnalytics()),
            talentResets: (nextState.combat.analytics?.talentResets || 0) + 1,
          },
        },
      });
    }

    case "SELECT_CLASS":
      return selectClass(state, action.classId);

    case "SELECT_SPECIALIZATION":
      return selectSpecialization(state, action.specId);

    // --------------------------------------------------------
    case "BUY_PRESTIGE_NODE": {
      const node = PRESTIGE_TREE_NODES.find(candidate => candidate.id === action.nodeId);
      if (!node) return state;

      const purchase = canPurchasePrestigeNode(state, node);
      if (!purchase.ok) return state;

      const currentLevel = state.prestige?.nodes?.[node.id] || 0;
      const nextPrestige = {
        ...state.prestige,
        echoes: (state.prestige?.echoes || 0) - purchase.cost,
        spentEchoes: (state.prestige?.spentEchoes || 0) + purchase.cost,
        totalEchoesEarned: state.prestige?.totalEchoesEarned || 0,
        nodes: {
          ...(state.prestige?.nodes || {}),
          [node.id]: currentLevel + 1,
        },
      };

      return withAchievementProgress({
        ...state,
        prestige: nextPrestige,
        player: syncPrestigeBonuses(state.player, nextPrestige),
        stats: {
          ...state.stats,
          prestigeNodesPurchased: (state.stats?.prestigeNodesPurchased || 0) + 1,
        },
        combat: {
          ...state.combat,
          log: [
            ...(state.combat.log || []),
            `RELIQUIA: ${node.name} sube a ${currentLevel + 1}/${node.maxLevel}.`,
          ].slice(-20),
        },
      });
    }

    // --------------------------------------------------------
    case "PRESTIGE": {
      const prestigeCheck = canPrestige(state);
      if (!prestigeCheck.ok) return state;

      const resetClass  = action.resetClass === true;
      const echoesGained = calculatePrestigeEchoGain(state);
      const nextPrestigeLevel = (state.prestige?.level || 0) + 1;
      const nextRank = getNextPrestigeRank(state.prestige?.level || 0);
      const milestoneReached = nextRank?.level === nextPrestigeLevel ? nextRank : null;
      const basePlayer  = {
        level: 1, xp: 0,
        baseDamage:     10,
        baseDefense:    2,
        baseCritChance: 0.05,
        baseMaxHp:      100,
        damagePct: 0, flatDamage: 0,
        defensePct: 0, flatDefense: 0,
        hpPct: 0, flatRegen: 0, flatCrit: 0,
        flatGold: 0, goldPct: 0, xpPct: 0,
        attackSpeed: 0, damageLevel: 1,
        gold:    0,
        essence: state.player.essence || 0,
        prestigeBonuses: {},
        codexBonuses: state.player.codexBonuses || {},
        runSigilBonuses: {},
        inventory:       [],
        equipment:       { weapon: null, armor: null },
        skills:          { dmg: 0, hp: 0, crit: 0 },
        upgrades:        {},
        unlockedTalents: [],
        talentLevels:    {},
        talentSystemVersion: state.player.talentSystemVersion,
        talentPoints:    0,
        class:          resetClass ? null : state.player.class,
        specialization: resetClass ? null : state.player.specialization,
      };

      const nextPrestigeState = {
        ...state.prestige,
        level: nextPrestigeLevel,
        echoes: (state.prestige?.echoes || 0) + echoesGained,
        spentEchoes: state.prestige?.spentEchoes || 0,
        totalEchoesEarned: (state.prestige?.totalEchoesEarned || 0) + echoesGained,
        nodes: { ...(state.prestige?.nodes || {}) },
      };

      const freshPlayer = syncPrestigeBonuses(basePlayer, nextPrestigeState);
      freshPlayer.hp    = freshPlayer.maxHp;

      return withAchievementProgress({
        ...state,
        player: freshPlayer,
        stats: {
          ...state.stats,
          prestigeCount: (state.stats?.prestigeCount || 0) + 1,
        },
        prestige: nextPrestigeState,
        combat: {
          enemy:             spawnEnemy(1),
          log:               [
            milestoneReached
              ? `Prestige ${nextPrestigeLevel}: ${milestoneReached.name}. +${echoesGained} ecos. ${milestoneReached.description}`
              : `Prestige ${nextPrestigeLevel}. +${echoesGained} ecos. Reinicias la corrida, pero conservas clase, spec y tablero de ecos.`
          ],
          currentTier:       1,
          maxTier:           1,
          autoAdvance:       false,
          ticksInCurrentRun: 0,
          sessionKills:      0,
          effects:           [],
          lastRunTier:       state.combat.maxTier,
          skillCooldowns:    {},
          skillAutocasts:    state.combat.skillAutocasts || {},
          activeEvents:      [],
          talentBuffs:       [],
          triggerCounters: {
            kills: 0,
            onHit: 0,
            crit: 0,
            onDamageTaken: 0,
          },
          pendingOnKillDamage: 0,
          floatEvents: [],
          skillDamageTimeline: [],
          runStats: {
            kills: 0,
            damageDealt: 0,
            gold: 0,
            xp: 0,
            essence: 0,
            items: 0,
            bestDropName: null,
            bestDropRarity: null,
            bestDropHighlight: null,
            bestDropPerfectRolls: 0,
            bestDropScore: 0,
          },
          performanceSnapshot: {
            damagePerTick: 0,
            goldPerTick: 0,
            xpPerTick: 0,
            killsPerMinute: 0,
          },
          latestLootEvent: null,
          reforgeSession: null,
          pendingRunSetup: nextPrestigeLevel >= 1,
          pendingRunSigilId: "free",
          activeRunSigilId: "free",
          lastRunSummary:    null,
          offlineSummary:    null,
          prestigeCycle: createEmptyPrestigeCycleProgress(),
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            prestigeCount: (state.combat.analytics?.prestigeCount || 0) + 1,
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              prestige: state.combat.analytics?.goldSpentBySource?.prestige || 0,
            },
            maxLevelReached: Math.max(state.combat.analytics?.maxLevelReached || 1, state.player.level || 1),
            maxTierReached: Math.max(state.combat.analytics?.maxTierReached || 1, state.combat.maxTier || 1),
            firstPrestigeTick:
              state.combat.analytics?.firstPrestigeTick == null
                ? (state.combat.analytics?.ticks || 0)
                : state.combat.analytics?.firstPrestigeTick,
          },
        },
      });
    }

    // --------------------------------------------------------
    case "CRAFT_REROLL_ITEM": {
      const result = craftReroll({
        player:       state.player,
        itemId:       action.payload.itemId,
        currentTier:  state.combat.currentTier || 1,
        refreshStats,
      });
      if (!result) return state;
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
        ...state,
        player: result.newPlayer,
        stats: {
          ...state.stats,
          rerollsCrafted: (state.stats?.rerollsCrafted || 0) + 1,
        },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            rerollsCrafted: (state.combat.analytics?.rerollsCrafted || 0) + 1,
            goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              rerolls: (state.combat.analytics?.goldSpentBySource?.rerolls || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            },
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              rerolls: (state.combat.analytics?.essenceSpentBySource?.rerolls || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            },
          },
          log: [...(state.combat.log || []), result.log].slice(-20),
        },
      });
    }

    case "CRAFT_POLISH_ITEM": {
      const result = craftPolish({
        player: state.player,
        itemId: action.payload.itemId,
        affixIndex: action.payload.affixIndex,
        refreshStats,
      });
      if (!result) return state;
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      if (result.noChange) {
        return {
          ...state,
          player: result.newPlayer,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            reforgeSession: null,
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
        ...state,
        player: result.newPlayer,
        stats: {
          ...state.stats,
          polishesCrafted: (state.stats?.polishesCrafted || 0) + 1,
        },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            polishesCrafted: (state.combat.analytics?.polishesCrafted || 0) + 1,
            goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              polish: (state.combat.analytics?.goldSpentBySource?.polish || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            },
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              polish: (state.combat.analytics?.essenceSpentBySource?.polish || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            },
          },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    case "CRAFT_REFORGE_PREVIEW": {
      const result = craftReforgePreview({
        player: state.player,
        itemId: action.payload.itemId,
        affixIndex: action.payload.affixIndex,
        favoredStats: action.payload.favoredStats || [],
      });
      if (!result) return state;
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            reforgeSession: null,
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
        ...state,
        player: result.newPlayer,
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          reforgeSession: {
            itemId: action.payload.itemId,
            affixIndex: action.payload.affixIndex,
            options: result.options || [],
          },
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              reforge: (state.combat.analytics?.goldSpentBySource?.reforge || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            },
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              reforge: (state.combat.analytics?.essenceSpentBySource?.reforge || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            },
          },
          log: [...(state.combat.log || []), result.log].slice(-20),
        },
      });
    }

    case "CRAFT_REFORGE_ITEM": {
      const activeSession = state.combat?.reforgeSession;
      if (
        !activeSession ||
        activeSession.itemId !== action.payload.itemId ||
        activeSession.affixIndex !== action.payload.affixIndex
      ) {
        return state;
      }
      const validOption = (activeSession.options || []).some(option =>
        option?.id === action.payload.replacementAffix?.id &&
        option?.stat === action.payload.replacementAffix?.stat &&
        option?.tier === action.payload.replacementAffix?.tier
      );
      if (!validOption) return state;

      const result = craftReforge({
        player: state.player,
        itemId: action.payload.itemId,
        affixIndex: action.payload.affixIndex,
        replacementAffix: action.payload.replacementAffix,
        refreshStats,
        skipCost: true,
      });
      if (!result) return state;
      if (result.noChange) {
        return {
          ...state,
          player: result.newPlayer,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            reforgeSession: null,
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            reforgeSession: null,
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
        ...state,
        player: result.newPlayer,
        stats: {
          ...state.stats,
          reforgesCrafted: (state.stats?.reforgesCrafted || 0) + 1,
        },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          reforgeSession: null,
          analytics: {
            ...(state.combat.analytics || createEmptySessionAnalytics()),
            reforgesCrafted: (state.combat.analytics?.reforgesCrafted || 0) + 1,
            goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            goldSpentBySource: {
              ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
              reforge: (state.combat.analytics?.goldSpentBySource?.reforge || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
            },
            essenceSpentBySource: {
              ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
              reforge: (state.combat.analytics?.essenceSpentBySource?.reforge || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
            },
          },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    case "CRAFT_UPGRADE_ITEM": {
      const result = craftUpgrade({
        player:      state.player,
        itemId:      action.payload.itemId,
        refreshStats,
      });
      if (!result) return state;
      return withAchievementProgress({
          ...state,
          player: result.newPlayer,
          stats: {
            ...state.stats,
            upgradesCrafted: (state.stats?.upgradesCrafted || 0) + 1,
          },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
              ...(state.combat.analytics || createEmptySessionAnalytics()),
              upgradesCrafted: (state.combat.analytics?.upgradesCrafted || 0) + 1,
              goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
              goldSpentBySource: {
                ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
                upgrades: (state.combat.analytics?.goldSpentBySource?.upgrades || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
              },
              upgradesSucceeded: (state.combat.analytics?.upgradesSucceeded || 0) + (String(result.log || "").toLowerCase().includes("fall") ? 0 : 1),
              upgradesFailed: (state.combat.analytics?.upgradesFailed || 0) + (String(result.log || "").toLowerCase().includes("fall") ? 1 : 0),
              bestItemRating: Math.max(state.combat.analytics?.bestItemRating || 0, result.newPlayer?.equipment?.weapon?.rating || 0, result.newPlayer?.equipment?.armor?.rating || 0),
            },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    case "CRAFT_ASCEND_ITEM": {
      const selectedLegendaryPowerId = action.payload.legendaryPowerId || null;
      const result = craftAscend({
        player:      state.player,
        itemId:      action.payload.itemId,
        currentTier: state.combat.currentTier || 1,
        refreshStats,
        legendaryPowerId: selectedLegendaryPowerId,
        unlockedLegendaryPowerIds: Object.entries(state.codex?.powerDiscoveries || {})
          .filter(([, discoveries]) => Number(discoveries || 0) > 0)
          .map(([powerId]) => powerId),
        legendaryPowerImprintReduction: getLegendaryPowerImprintReduction(state.codex || {}, selectedLegendaryPowerId),
      });
      if (!result) return state;
      if (result.blocked) {
        return {
          ...state,
          combat: {
            ...appendCraftingLog(state.combat, result.log),
            log: [...(state.combat.log || []), result.log].slice(-20),
          },
        };
      }
      return withAchievementProgress({
          ...state,
          player: result.newPlayer,
          stats: {
            ...state.stats,
            ascendsCrafted: (state.stats?.ascendsCrafted || 0) + 1,
          },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
              ...(state.combat.analytics || createEmptySessionAnalytics()),
              ascendsCrafted: (state.combat.analytics?.ascendsCrafted || 0) + 1,
              powerAscendsCrafted:
                (state.combat.analytics?.powerAscendsCrafted || 0) +
                (selectedLegendaryPowerId ? 1 : 0),
              goldSpent: (state.combat.analytics?.goldSpent || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
              essenceSpent: (state.combat.analytics?.essenceSpent || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
              goldSpentBySource: {
                ...(state.combat.analytics?.goldSpentBySource || createEmptySessionAnalytics().goldSpentBySource),
                ascends: (state.combat.analytics?.goldSpentBySource?.ascends || 0) + Math.max(0, (state.player.gold || 0) - (result.newPlayer.gold || 0)),
              },
              essenceSpentBySource: {
                ...(state.combat.analytics?.essenceSpentBySource || createEmptySessionAnalytics().essenceSpentBySource),
                ascends: (state.combat.analytics?.essenceSpentBySource?.ascends || 0) + Math.max(0, (state.player.essence || 0) - (result.newPlayer.essence || 0)),
              },
              bestItemRating: Math.max(state.combat.analytics?.bestItemRating || 0, result.newPlayer?.equipment?.weapon?.rating || 0, result.newPlayer?.equipment?.armor?.rating || 0),
            },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    case "CRAFT_EXTRACT_ITEM": {
      const itemId = action.payload?.itemId;
      if (isEquippedItemId(state.player, itemId)) {
        return buildBlockedOperationState(state, {
          analyticsKey: "blockedExtractEquippedAttempts",
          message: "Seguridad: intento de extraer item equipado bloqueado.",
        });
      }
      const result = craftExtract({
        player: state.player,
        itemId,
      });
      if (!result) return state;
      return withAchievementProgress({
          ...state,
          player: result.newPlayer,
          stats: {
            ...state.stats,
            itemsExtracted: (state.stats?.itemsExtracted || 0) + 1,
          },
        combat: {
          ...appendCraftingLog(state.combat, result.log),
          analytics: {
              ...(state.combat.analytics || createEmptySessionAnalytics()),
              itemsExtracted: (state.combat.analytics?.itemsExtracted || 0) + 1,
              essenceEarned: (state.combat.analytics?.essenceEarned || 0) + Math.max(0, (result.newPlayer?.essence || 0) - (state.player.essence || 0)),
              essenceBySource: {
                ...(state.combat.analytics?.essenceBySource || createEmptySessionAnalytics().essenceBySource),
                extract: (state.combat.analytics?.essenceBySource?.extract || 0) + Math.max(0, (result.newPlayer?.essence || 0) - (state.player.essence || 0)),
              },
            },
          log: [...state.combat.log, result.log].slice(-20),
        },
      });
    }

    // --------------------------------------------------------
    default:
      return state;
  }
}

export function gameReducer(state, action) {
  const nextState = baseGameReducer(state, action);
  if (nextState === state) return state;
  return recordReplayState(state, nextState, action);
}


