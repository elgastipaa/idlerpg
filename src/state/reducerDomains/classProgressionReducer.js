export function handleClassProgressionAction(state, action, dependencies) {
  const {
    ONBOARDING_STEPS,
    createEmptyExpeditionState,
    createEmptyOnboardingState,
    isRunSigilsUnlocked,
    normalizeOnboardingState,
    selectClass,
    selectSpecialization,
  } = dependencies;

  switch (action?.type) {
    case "SELECT_CLASS": {
      const nextState = selectClass(state, action.classId);
      if (nextState === state) return state;
      const onboarding = normalizeOnboardingState(state.onboarding || createEmptyOnboardingState());
      const shouldStartInCombat =
        Number(state?.prestige?.level || 0) <= 0 &&
        onboarding.step === ONBOARDING_STEPS.CHOOSE_CLASS;
      const shouldOpenSetup =
        !shouldStartInCombat && Number(state?.prestige?.level || 0) >= 1;
      return {
        ...nextState,
        currentTab: shouldStartInCombat || shouldOpenSetup ? "combat" : "sanctuary",
        expedition: {
          ...(nextState.expedition || createEmptyExpeditionState()),
          phase: shouldStartInCombat ? "active" : shouldOpenSetup ? "setup" : "sanctuary",
        },
        combat: {
          ...nextState.combat,
          pendingRunSetup: shouldOpenSetup,
        },
        onboarding: {
          ...onboarding,
          step: onboarding.flags.combatIntroSeen ? null : ONBOARDING_STEPS.COMBAT_INTRO,
          flags: {
            ...onboarding.flags,
            classChosen: true,
          },
        },
      };
    }

    case "SELECT_SPECIALIZATION": {
      const nextState = selectSpecialization(state, action.specId, {
        ignoreRequirement: state?.onboarding?.step === ONBOARDING_STEPS.CHOOSE_SPEC,
      });
      if (nextState === state) return state;
      const shouldResumeSetup =
        Boolean(state?.onboarding?.completed) &&
        (state?.expedition?.phase === "setup" || state?.combat?.pendingRunSetup);
      if (!shouldResumeSetup) return nextState;
      return {
        ...nextState,
        currentTab: "combat",
        expedition: {
          ...(nextState.expedition || createEmptyExpeditionState()),
          phase: "setup",
        },
        combat: {
          ...nextState.combat,
          pendingRunSetup: true,
          pendingRunSigilId: isRunSigilsUnlocked(nextState)
            ? (nextState.combat?.pendingRunSigilId || "free")
            : "free",
          pendingRunSigilIds: isRunSigilsUnlocked(nextState)
            ? (Array.isArray(nextState.combat?.pendingRunSigilIds)
              ? [...nextState.combat.pendingRunSigilIds]
              : [nextState.combat?.pendingRunSigilId || "free"])
            : ["free"],
        },
      };
    }

    default:
      return null;
  }
}
