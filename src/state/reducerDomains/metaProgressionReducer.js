export function handleMetaProgressionAction(state, action, dependencies) {
  const {
    ONBOARDING_STEPS,
    PRESTIGE_TREE_NODES,
    buildPrestigeResetState,
    calculatePrestigeEchoGain,
    canPrestige,
    canPurchasePrestigeNode,
    createEmptySessionAnalytics,
    createRunContext,
    getMaxRunSigilSlots,
    getOnboardingFirstEchoNodeId,
    normalizeRunSigilIds,
    resetTalentTree,
    syncPrestigeBonuses,
    unlockTalent,
    upgradePlayer,
    upgradeTalentNode,
    withAchievementProgress,
  } = dependencies;

  switch (action?.type) {
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

    case "BUY_PRESTIGE_NODE": {
      if (state?.onboarding?.step === ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE) {
        const tutorialNodeId = getOnboardingFirstEchoNodeId(state);
        if (tutorialNodeId && action.nodeId !== tutorialNodeId) return state;
      }

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

    case "PRESTIGE": {
      const prestigeCheck = canPrestige(state);
      if (!prestigeCheck.ok) return state;

      const echoesGained = calculatePrestigeEchoGain(state);
      const nextPrestigeLevel = (state.prestige?.level || 0) + 1;
      const nextRunContext = createRunContext();
      const resetRunSigilIds = normalizeRunSigilIds("free", {
        slots: getMaxRunSigilSlots(state?.abyss || {}),
      });
      const nextPrestigeState = {
        ...state.prestige,
        level: nextPrestigeLevel,
        echoes: (state.prestige?.echoes || 0) + echoesGained,
        spentEchoes: state.prestige?.spentEchoes || 0,
        totalEchoesEarned: (state.prestige?.totalEchoesEarned || 0) + echoesGained,
        bestHistoricTier: Math.max(
          Number(state.prestige?.bestHistoricTier || 0),
          Number(prestigeCheck.preview?.progress?.maxTier || state.combat?.maxTier || 1)
        ),
        nodes: { ...(state.prestige?.nodes || {}) },
      };

      return buildPrestigeResetState(state, {
        echoesGained,
        nextPrestigeLevel,
        nextPrestigeState,
        resetRunSigilIds,
        nextRunContext,
        logLine: `Prestige ${nextPrestigeLevel}. +${echoesGained} ecos${prestigeCheck.preview?.momentum?.multiplier ? ` · Momentum x${Number(prestigeCheck.preview.momentum.multiplier).toFixed(1)}` : ""}. Resonancia total: ${(state.prestige?.totalEchoesEarned || 0) + echoesGained} ecos. Reinicias la corrida y volves a elegir clase para la proxima run.`,
      });
    }

    default:
      return null;
  }
}
