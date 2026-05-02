import React, { useEffect, useMemo, useRef, useState } from "react";
import useViewport from "../hooks/useViewport";

import { TALENTS } from "../data/talents";
import { ITEM_FAMILIES } from "../data/itemFamilies";
import { getCombatBackgroundVisual, getCombatEnemyVisual } from "../data/combatVisuals";
import { xpRequired } from "../engine/leveling";
import {
  getActiveExpeditionContractWithProgress,
  getExpeditionContractsWithProgress,
} from "../engine/progression/expeditionContracts";
import { getObjectiveStatusMeta, resolveObjectiveStatus } from "../engine/progression/objectiveStatus";
import { getWeeklyBossOverview } from "../engine/progression/weeklyBoss";
import { getWeeklyLedgerContractsWithProgress } from "../engine/progression/weeklyLedger";
import { getRarityColor, getAffixTierGlyph } from "../constants/rarity";
import { calcStats } from "../engine/combat/statEngine";
import { computeEffectModifiers } from "../engine/effects/effectEngine";
import { ITEM_STAT_LABELS as STAT_LABELS } from "../utils/itemPresentation";
import { getLegendaryStaticBonuses, getTargetedLegendaryDropsForEnemy } from "../utils/legendaryPowers";
import { summarizeLootRuleAutomation } from "../utils/lootFilter";
import { getOnboardingStepInteractionMode, isAutoAdvanceUnlocked, isExtractionUnlocked, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import { getMaxRunSigilSlots } from "../engine/progression/abyssProgression";
import RunSigilCallout from "./RunSigilCallout";
import { FlBadge, FlButton, FlPanel, FlPanelHeader, FlProgressBar, FlSideAction, FlSwitch, FlTag } from "./ui/forge";
import ForgeIcon from "./icons/ForgeIcon";

const COLORS = {
  success: "var(--tone-success, #1D9E75)",
  danger: "var(--tone-danger, #D85A30)",
  boss: "var(--tone-accent, #534AB7)",
  warning: "var(--tone-warning, #f59e0b)",
  common: "var(--color-text-tertiary, #94a3b8)",
  dark: "var(--color-text-primary, #1e293b)",
};
const RARITY_RANK = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const ENEMY_FINISH_ZONE_PCT = 20;
const CRIT_STREAK_TIMEOUT_MS = 2600;
const BOSS_PHASE_THRESHOLDS = [75, 50, 25];
const LEVEL_UP_TOAST_VISIBLE_MS = 3200;
const ACCOUNT_SCROLL_TARGET_STORAGE_KEY = "idlerpg.accountScrollTarget";
const ACCOUNT_SCROLL_TARGET_WEEKLY = "weekly";
const FORGE_TIER_NODE_COUNT = 5;
// Visual-only experiment from stitch/ references. Flip to false to restore the previous Combat skin.
const COMBAT_STITCH_VISUAL_TRIAL = false;
// Keeps the Stitch visual direction but disables expensive paint/compositing effects.
const COMBAT_STITCH_PERF_SAFE = true;
const CLASS_ICONS = {
  warrior: "WR",
  rogue: "RG",
  mage: "MG",
  ranger: "RN",
  cleric: "CL",
  assassin: "AS",
};

const TALENT_ICONS = {
  warrior: "WR",
  rogue: "RG",
  mage: "MG",
  ranger: "RN",
  cleric: "CL",
  assassin: "AS",
};

const STATUS_METADATA = {
  rage: {
    label: "Furia",
    description: "Cargas temporales que suben dano y velocidad cuando el leech sostiene el intercambio.",
  },
  fortress: {
    label: "Fortaleza",
    description: "Tu siguiente golpe viene cargado despues de bloquear o absorber una parte importante del castigo.",
  },
  momentum: {
    label: "Momentum",
    description: "Mientras mantienes el tempo, acumulas dano y defensa.",
  },
  combatFlow: {
    label: "Flujo",
    description: "Golpear seguido al mismo objetivo apila dano mientras no se corte la cadena.",
  },
  flow: {
    label: "Flow",
    description: "El siguiente objetivo arranca con ventaja heredada del anterior.",
  },
  volatile: {
    label: "Volatilidad",
    description: "El proximo golpe esta sesgado: puede salir mucho mejor o peor que lo normal.",
  },
  perfectCast: {
    label: "Perfect Cast",
    description: "El Mage renuncia al multi-hit para pegar dentro de un rango mucho mas limpio y predecible.",
  },
  timeLoop: {
    label: "Time Loop",
    description: "Parte del setup sobrevive al cambio de objetivo y el siguiente enemigo no arranca desde cero.",
  },
  absoluteControl: {
    label: "Control Absoluto",
    description: "El objetivo marcado recibe mucho mas dano; el no marcado paga una penalidad clara.",
  },
  bleed: {
    label: "Sangrado",
    description: "Dano por tick. Mas stacks y mas potencia vuelven mucho mas caro dejarlo correr.",
  },
  poison: {
    label: "Veneno",
    description: "Dano por tick sobre el jugador. Escala si la pelea se alarga demasiado.",
  },
  fracture: {
    label: "Fractura",
    description: "Reduce la defensa efectiva del objetivo y mejora los golpes que siguen.",
  },
  voidFracture: {
    label: "Fisura del Vacio",
    description: "DoT abisal aplicado por criticos; castiga bosses que sobreviven varios ticks.",
  },
  mark: {
    label: "Marca",
    description: "El objetivo queda preparado para que el Mage saque mucho mas valor del siguiente hit.",
  },
  memory: {
    label: "Memoria",
    description: "La preparacion del objetivo se refina y cada stack de Marca rinde mejor.",
  },
  ramp: {
    label: "Rampa Arcana",
    description: "El dano del Mage sube cuanto mas ordenado sea el intercambio sobre el mismo objetivo.",
  },
};

function getTriggerProgress(talent, triggerCounters = {}) {
  const every = talent.trigger?.every;
  const stat = talent.trigger?.stat;

  if (!every || every <= 1 || !stat) return null;

  const supported = {
    kills: triggerCounters.kills || 0,
    onHit: triggerCounters.onHit || 0,
    crit: triggerCounters.crit || 0,
    onDamageTaken: triggerCounters.onDamageTaken || 0,
  };

  if (supported[stat] == null) return null;

  const rawProgress = supported[stat] % every;
  return {
    current: rawProgress,
    target: every,
    percent: (rawProgress / every) * 100,
    label:
      stat === "kills"
        ? "bajas"
        : stat === "onHit"
          ? "golpes"
          : stat === "crit"
            ? "criticos"
            : "golpes recibidos",
  };
}

function buildActiveTalentEffects(effects = []) {
  const grouped = new Map();

  for (const effect of effects) {
    if (effect.source !== "talent" || !effect.sourceId) continue;

    const existing = grouped.get(effect.sourceId);
    if (!existing) {
      grouped.set(effect.sourceId, {
        sourceId: effect.sourceId,
        stacks: 1,
        maxDuration: effect.duration,
      });
      continue;
    }

    existing.stacks += 1;
    existing.maxDuration = Math.max(existing.maxDuration || 0, effect.duration || 0);
  }

  return grouped;
}

function formatGoalReward(reward = {}) {
  const chunks = [];
  if (reward.gold) chunks.push(`+${reward.gold} oro`);
  if (reward.essence) chunks.push(`+${reward.essence} esencia`);
  if (reward.talentPoints) chunks.push(`+${reward.talentPoints} TP`);
  return chunks.join(" · ");
}

function formatExpeditionContractReward(reward = {}) {
  const chunks = [];
  if (reward.essence) chunks.push(`+${reward.essence} esencia`);
  if (reward.codexInk) chunks.push(`+${reward.codexInk} tinta`);
  if (reward.sigilFlux) chunks.push(`+${reward.sigilFlux} flux`);
  if (reward.relicDust) chunks.push(`+${reward.relicDust} polvo`);
  return chunks.join(" · ");
}

function formatPercent(value = 0, digits = 0) {
  const numeric = Number(value || 0) * 100;
  const rounded = Math.round(numeric * Math.pow(10, digits)) / Math.pow(10, digits);
  return `${rounded}%`;
}

function formatSignedPercent(value = 0, digits = 0) {
  const numeric = Number(value || 0);
  if (Math.abs(numeric) < 0.0001) return "0%";
  const prefix = numeric > 0 ? "+" : "-";
  return `${prefix}${formatPercent(Math.abs(numeric), digits)}`;
}

function formatMultiplierBonus(multiplier = 1, digits = 0) {
  return formatSignedPercent(Number(multiplier || 1) - 1, digits);
}

function resolveFlToneFromObjectiveStatus(status) {
  if (status === "claimable" || status === "claimed") return "success";
  return "warning";
}

function resolveFlProgressTypeFromObjectiveStatus(status) {
  if (status === "claimable" || status === "claimed") return "success";
  return "reward";
}

function formatTickCount(ticks = 0) {
  const value = Math.max(0, Number(ticks || 0));
  return `${value} tick${value === 1 ? "" : "s"}`;
}

function formatRemainingMs(ms = 0) {
  const safeMs = Math.max(0, Number(ms || 0));
  const totalSeconds = Math.ceil(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}

function applyMitigationPreview(value = 0, mitigation = 0) {
  const numeric = Math.max(0, Number(value || 0));
  if (!numeric) return 0;
  const clamped = Math.min(0.9, Math.max(0, Number(mitigation || 0)));
  return Math.max(0, Math.floor(numeric * (1 - clamped)));
}

function formatAbyssBossUpgradeSummary(profile = null) {
  if (!profile) return "";
  const affixText = `+${Math.max(0, Number(profile.affixCount || 0))} afijos`;
  const mechanicText = `+${Math.max(0, Number(profile.mechanicCount || 0))} mecanicas`;
  const intensityBonus = Math.max(0, Number(profile.mechanicIntensity || 1) - 1);
  const intensityText = intensityBonus > 0.001 ? ` · intensidad +${Math.round(intensityBonus * 100)}%` : "";
  return `${affixText} · ${mechanicText}${intensityText}`;
}

function getIntelSourceMeta(id, depthIds = new Set(), mutatorIds = new Set()) {
  if (depthIds.has(id)) {
    return { label: "Abismo", tone: "warning" };
  }
  if (mutatorIds.has(id)) {
    return { label: "Anomalia", tone: "arcane" };
  }
  return { label: "Base", tone: "neutral" };
}

function getStackedMultiplier(perStackMultiplier = 1, stacks = 0) {
  return Math.pow(Math.max(1, Number(perStackMultiplier || 1)), Math.max(0, Number(stacks || 0)));
}

export default function Combat({ state, dispatch, sideActions = [], forgeLightTrial = false }) {
  const { player, combat } = state;
  const expedition = state.expedition || {};
  const runSigilSlotCount = getMaxRunSigilSlots(state?.abyss || {});
  const activeRunSigilIds =
    state?.combat?.activeRunSigilIds || state?.combat?.activeRunSigilId || "free";
  const showRunSigilCallout =
    Number(state?.prestige?.level || 0) >= 1 && !state?.combat?.pendingRunSetup;
  const {
    enemy,
    currentTier,
    maxTier,
    autoAdvance,
    effects = [],
    triggerCounters = {},
  } = combat;
  const { isMobile } = useViewport();
  const [showActivated, setShowActivated] = useState({});
  const [selectedWeeklyContractId, setSelectedWeeklyContractId] = useState(null);
  const [logExpanded, setLogExpanded] = useState(false);
  const [collapsedPanels, setCollapsedPanels] = useState({
    enemyIntel: true,
    talents: true,
    log: true,
  });
  const [levelUpFlash, setLevelUpFlash] = useState(null);
  const [critStreak, setCritStreak] = useState({
    count: 0,
    lastCritAt: 0,
    pulseAt: 0,
  });
  const [bossPhasePingQueue, setBossPhasePingQueue] = useState([]);
  const [enemyHpTrailPct, setEnemyHpTrailPct] = useState(100);
  const [playerHpTrailPct, setPlayerHpTrailPct] = useState(100);
  const [enemyHitPulseKey, setEnemyHitPulseKey] = useState(0);
  const [playerHitPulseKey, setPlayerHitPulseKey] = useState(0);
  const logRef = useRef(null);
  const prevLevelRef = useRef(player.level || 1);
  const lastProcessedFloatIdRef = useRef(null);
  const bossPhaseSeenRef = useRef({ enemyKey: null, seen: {} });
  const enemyHpTrailEncounterRef = useRef(null);
  const previousEnemyHpRef = useRef({ encounterKey: null, pct: null });
  const previousPlayerHpPctRef = useRef(null);

  const enemyEncounterKey = useMemo(
    () => `${enemy?.id || enemy?.name || "enemy"}:${Math.max(1, Number(enemy?.maxHp || 1))}:${currentTier}:${enemy?.isBoss ? "boss" : "mob"}`,
    [currentTier, enemy?.id, enemy?.isBoss, enemy?.maxHp, enemy?.name]
  );
  const enemyHpPctForTrail = enemy
    ? Math.max(0, Math.min(100, (Number(enemy.hp || 0) / Math.max(1, Number(enemy.maxHp || 1))) * 100))
    : 0;
  const playerHpPctForTrail = Math.max(
    0,
    Math.min(100, (Number(player.hp || 0) / Math.max(1, Number(player.maxHp || 1))) * 100)
  );

  const replacedTalentIds = new Set(
    TALENTS
      .filter(talent => (player.unlockedTalents || []).includes(talent.id) && talent.replaces)
      .flatMap(talent => (Array.isArray(talent.replaces) ? talent.replaces : [talent.replaces]))
  );

  const myTalents = TALENTS.filter(
    talent =>
      talent.classId === player.class &&
      (
        talent.displayType === "triggered" ||
        talent.displayType === "stacking" ||
        talent.type === "triggered" ||
        talent.type === "stacking"
      ) &&
      (player.unlockedTalents || []).includes(talent.id) &&
      !replacedTalentIds.has(talent.id)
  );

  const activeTalentEffects = useMemo(() => buildActiveTalentEffects(effects), [effects]);
  const expeditionContracts = state?.expeditionContracts || {};
  const expeditionContractEntries = useMemo(
    () => getExpeditionContractsWithProgress(state, expeditionContracts),
    [state, expeditionContracts]
  );
  const activeExpeditionContract = useMemo(
    () => getActiveExpeditionContractWithProgress(state, expeditionContracts),
    [state, expeditionContracts]
  );
  const featuredExpeditionContract =
    activeExpeditionContract ||
    expeditionContractEntries.find(contract => !contract?.claimed) ||
    expeditionContractEntries[0] ||
    null;
  const canClaimExpeditionContract = Boolean(
    featuredExpeditionContract?.progress?.completed && !featuredExpeditionContract?.claimed
  );
  const expeditionStatusMeta = useMemo(() => {
    if (!featuredExpeditionContract) {
      return getObjectiveStatusMeta("in_progress", {
        inProgressLabel: "Sin contrato activo",
      });
    }
    const status = resolveObjectiveStatus({
      completed: featuredExpeditionContract?.progress?.completed,
      claimed: featuredExpeditionContract?.claimed,
    });
    return getObjectiveStatusMeta(status, {
      inProgressLabel: "En progreso",
      claimableLabel: "Listo para reclamar",
      claimedLabel: "Reclamado",
    });
  }, [featuredExpeditionContract]);
  const weeklyContracts = useMemo(
    () => getWeeklyLedgerContractsWithProgress(state, state?.weeklyLedger || {}),
    [state]
  );
  const claimableWeeklyContracts = useMemo(
    () => weeklyContracts.filter(contract => contract?.progress?.completed && !contract?.claimed),
    [weeklyContracts]
  );
  const weeklyTotalContracts = weeklyContracts.length;
  const claimedWeeklyContracts = useMemo(
    () => weeklyContracts.filter(contract => contract?.claimed).length,
    [weeklyContracts]
  );
  const weeklyAllClaimed = weeklyTotalContracts > 0 && claimedWeeklyContracts >= weeklyTotalContracts;
  const visibleWeeklyContracts = useMemo(
    () => weeklyContracts.filter(contract => !contract?.claimed),
    [weeklyContracts]
  );
  const orderedWeeklyContracts = useMemo(() => {
    if (!Array.isArray(visibleWeeklyContracts) || visibleWeeklyContracts.length === 0) return [];
    const rank = contract => {
      if (contract?.progress?.completed && !contract?.claimed) return 0;
      if (!contract?.claimed) return 1;
      return 2;
    };
    return [...visibleWeeklyContracts].sort((left, right) => {
      const rankDiff = rank(left) - rank(right);
      if (rankDiff !== 0) return rankDiff;
      return Number(right?.progress?.percent || 0) - Number(left?.progress?.percent || 0);
    });
  }, [visibleWeeklyContracts]);
  const featuredWeeklyContract = useMemo(() => {
    if (orderedWeeklyContracts.length <= 0) return null;
    if (!selectedWeeklyContractId) return orderedWeeklyContracts[0];
    return orderedWeeklyContracts.find(contract => contract?.id === selectedWeeklyContractId) || orderedWeeklyContracts[0];
  }, [orderedWeeklyContracts, selectedWeeklyContractId]);
  const weeklyStatusMeta = useMemo(() => {
    if (weeklyAllClaimed) {
      return getObjectiveStatusMeta("claimed", {
        inProgressLabel: "En progreso",
        claimableLabel: "Listo para reclamar",
        claimedLabel: "Todo reclamado",
      });
    }
    if (!featuredWeeklyContract) {
      return getObjectiveStatusMeta("in_progress", {
        inProgressLabel: "Sin contrato activo",
      });
    }
    const status = resolveObjectiveStatus({
      completed: featuredWeeklyContract?.progress?.completed,
      claimed: featuredWeeklyContract?.claimed,
    });
    return getObjectiveStatusMeta(status, {
      inProgressLabel: "En progreso",
      claimableLabel: "Listo para reclamar",
      claimedLabel: "Reclamado",
    });
  }, [featuredWeeklyContract, weeklyAllClaimed]);
  const featuredWeeklyIndex = useMemo(() => {
    if (!featuredWeeklyContract || orderedWeeklyContracts.length <= 0) return 0;
    const index = orderedWeeklyContracts.findIndex(contract => contract?.id === featuredWeeklyContract?.id);
    return index >= 0 ? index : 0;
  }, [featuredWeeklyContract, orderedWeeklyContracts]);
  const showWeeklyLedgerCard = Boolean(state?.weeklyLedger);
  const showWeeklySelectorArrows = orderedWeeklyContracts.length > 1;
  const isSessionDenseMobile = isMobile;
  const weeklyBossOverview = useMemo(
    () => getWeeklyBossOverview(state, state?.weeklyBoss || {}),
    [state]
  );
  const weeklyBossDifficulties = Array.isArray(weeklyBossOverview?.difficulties)
    ? weeklyBossOverview.difficulties
    : [];
  const weeklyBossCycleRemainingLabel = formatRemainingMs(weeklyBossOverview?.cycleRemainingMs || 0);
  const showWeeklyBossCard = Boolean(weeklyBossOverview?.boss);
  const activeWeeklyBossEncounter =
    state?.combat?.weeklyBossEncounter && state.combat.weeklyBossEncounter.active
      ? state.combat.weeklyBossEncounter
      : null;
  const showSessionFraming = Boolean(
    state?.onboarding?.completed ||
    state?.onboarding?.flags?.firstExtractionCompleted
  );
  const latestLootEvent = combat.latestLootEvent || null;
  const overflowEvent = combat.inventoryOverflowEvent || null;
  const overflowStats = combat.inventoryOverflowStats || { total: 0, displaced: 0, lost: 0 };
  const lootRuleSummary = useMemo(
    () => summarizeLootRuleAutomation(state?.settings?.lootRules || {}),
    [state?.settings?.lootRules]
  );
  const [visibleLootEvent, setVisibleLootEvent] = useState(latestLootEvent);
  const [lootClosing, setLootClosing] = useState(false);
  const [dismissedOverflowEventId, setDismissedOverflowEventId] = useState(null);
  const visibleOverflowEvent = overflowEvent?.id && overflowEvent.id !== dismissedOverflowEventId
    ? overflowEvent
    : null;
  const [visibleLevelUpToast, setVisibleLevelUpToast] = useState(null);
  const [levelUpToastClosing, setLevelUpToastClosing] = useState(false);
  const isDarkMode = state.settings?.theme === "dark";
  const baseStats = useMemo(() => calcStats(player), [player]);
  const legendaryBonuses = useMemo(
    () => getLegendaryStaticBonuses({
      player,
      enemy,
      stats: baseStats,
      currentTier: combat.currentTier || enemy?.tier || 1,
      maxTier: combat.maxTier || combat.currentTier || enemy?.tier || 1,
      bossesKilledThisRun: combat.runStats?.bossKills || combat.analytics?.bossKills || 0,
    }),
    [player, enemy, baseStats, combat.currentTier, combat.maxTier, combat.runStats?.bossKills, combat.analytics?.bossKills]
  );
  const combatEffectMods = useMemo(() => computeEffectModifiers(effects || []), [effects]);
  const effectiveDamageInCombat = Math.max(
    1,
    Math.floor((baseStats.damage + (combatEffectMods.damageFlat || 0)) * (combatEffectMods.damageMult || 1) * (combatEffectMods.enemyDamageTakenMult || 1))
  );
  const effectiveDefenseInCombat = Math.max(
    0,
    Math.floor((baseStats.defense + (combatEffectMods.defenseFlat || 0)) * (combatEffectMods.defenseMult || 1))
  );
  const effectiveCritChanceInCombat = Math.min(0.75, (baseStats.critChance || 0) + (combatEffectMods.critBonus || 0));
  const effectiveAttackSpeedInCombat = Math.min(0.7, (baseStats.attackSpeed || 0) + (combatEffectMods.attackSpeedFlat || 0));
  const runCargoCount = Array.isArray(expedition.cargoFound) ? expedition.cargoFound.length : 0;
  const runBossKills = Math.max(0, Number(combat?.runStats?.bossKills || 0));
  const autoAdvanceUnlocked = isAutoAdvanceUnlocked(state);
  const extractionUnlocked = isExtractionUnlocked(state);
  const onboardingStep = state?.onboarding?.step || null;
  const onboardingMode = getOnboardingStepInteractionMode(onboardingStep, state);
  const spotlightAutoAdvance = onboardingStep === ONBOARDING_STEPS.AUTO_ADVANCE;
  const spotlightExtraction = onboardingStep === ONBOARDING_STEPS.EXTRACTION_READY;
  const spotlightCombatEncounter = onboardingMode === "forced" && [
    ONBOARDING_STEPS.COMBAT_INTRO,
    ONBOARDING_STEPS.COMBAT_AFTER_TALENT,
    ONBOARDING_STEPS.FIRST_BOSS,
  ].includes(onboardingStep);
  const extractionDecision = useMemo(() => {
    if (!extractionUnlocked) return null;
    const hasSecuredValue = runCargoCount > 0 || runBossKills > 0;
    if (hasSecuredValue) {
      return {
        label: "Valor para asegurar",
        detail: `${runCargoCount} bundle(s) · ${runBossKills} boss(es)`,
        toneClass: "success",
      };
    }
    return {
      label: "Push disponible",
      detail: "Aun no acumulaste valor persistente fuerte.",
      toneClass: "accent",
    };
  }, [extractionUnlocked, runBossKills, runCargoCount]);

  useEffect(() => {
    const activated = {};

    myTalents.forEach(talent => {
      const progress = getTriggerProgress(talent, triggerCounters);
      if (!progress || !talent.trigger?.every) return;
      if (progress.current !== 0) return;

      const totalCount =
        talent.trigger.stat === "kills"
          ? triggerCounters.kills || 0
          : talent.trigger.stat === "onHit"
            ? triggerCounters.onHit || 0
            : talent.trigger.stat === "crit"
              ? triggerCounters.crit || 0
              : triggerCounters.onDamageTaken || 0;

      if (totalCount > 0) {
        activated[talent.id] = true;
      }
    });

    if (Object.keys(activated).length > 0) {
      setShowActivated(activated);
      const timer = setTimeout(() => setShowActivated({}), 1000);
      return () => clearTimeout(timer);
    }
  }, [myTalents, triggerCounters]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [combat.log]);

  useEffect(() => {
    const events = Array.isArray(combat.floatEvents) ? combat.floatEvents : [];
    if (events.length === 0) {
      lastProcessedFloatIdRef.current = null;
      return;
    }

    let startIndex = 0;
    if (lastProcessedFloatIdRef.current) {
      const previousIndex = events.findIndex(event => event?.id === lastProcessedFloatIdRef.current);
      startIndex = previousIndex >= 0 ? previousIndex + 1 : 0;
    }
    const incoming = events.slice(startIndex);
    if (incoming.length === 0) return;

    setCritStreak(current => {
      let nextCount = Number(current?.count || 0);
      let nextLastCritAt = Number(current?.lastCritAt || 0);
      let nextPulseAt = Number(current?.pulseAt || 0);

      incoming.forEach(event => {
        const isPrimaryHit = event?.kind === "damage" && (event?.source == null || event?.source === "player");
        if (!isPrimaryHit) return;

        if (event?.crit) {
          nextCount = Math.min(99, Math.max(0, nextCount) + 1);
          nextLastCritAt = Number(event?.at || Date.now());
          nextPulseAt = Date.now();
        } else {
          nextCount = 0;
        }
      });

      if (
        nextCount === Number(current?.count || 0) &&
        nextLastCritAt === Number(current?.lastCritAt || 0) &&
        nextPulseAt === Number(current?.pulseAt || 0)
      ) {
        return current;
      }
      return {
        count: nextCount,
        lastCritAt: nextLastCritAt,
        pulseAt: nextPulseAt,
      };
    });

    lastProcessedFloatIdRef.current = incoming[incoming.length - 1]?.id || lastProcessedFloatIdRef.current;
  }, [combat.floatEvents]);

  useEffect(() => {
    if (critStreak.count <= 0) return undefined;
    const elapsed = Date.now() - Number(critStreak.lastCritAt || 0);
    const remaining = CRIT_STREAK_TIMEOUT_MS - elapsed;
    if (remaining <= 0) {
      setCritStreak(current => (current.count > 0 ? { ...current, count: 0 } : current));
      return undefined;
    }

    const timer = setTimeout(() => {
      setCritStreak(current => (
        current.count > 0 && Date.now() - Number(current.lastCritAt || 0) >= CRIT_STREAK_TIMEOUT_MS
          ? { ...current, count: 0 }
          : current
      ));
    }, remaining + 20);
    return () => clearTimeout(timer);
  }, [critStreak.count, critStreak.lastCritAt]);

  useEffect(() => {
    if (!enemy?.isBoss) {
      bossPhaseSeenRef.current = { enemyKey: null, seen: {} };
      setBossPhasePingQueue([]);
      return;
    }

    if (bossPhaseSeenRef.current.enemyKey !== enemyEncounterKey) {
      bossPhaseSeenRef.current = { enemyKey: enemyEncounterKey, seen: {} };
      setBossPhasePingQueue([]);
    }

    const hpPct =
      (Math.max(0, Number(enemy?.hp || 0)) / Math.max(1, Number(enemy?.maxHp || 1))) * 100;
    const crossed = BOSS_PHASE_THRESHOLDS.filter(
      threshold => hpPct <= threshold && !bossPhaseSeenRef.current.seen[threshold]
    );
    if (crossed.length <= 0) return;

    crossed.forEach(threshold => {
      bossPhaseSeenRef.current.seen[threshold] = true;
    });

    const stamp = Date.now();
    setBossPhasePingQueue(current => [
      ...current,
      ...crossed.map((threshold, index) => ({
        id: `${enemyEncounterKey}-${threshold}-${stamp}-${index}`,
        enemyKey: enemyEncounterKey,
        threshold,
        at: stamp + index,
      })),
    ]);
  }, [enemy?.hp, enemy?.isBoss, enemy?.maxHp, enemyEncounterKey]);

  useEffect(() => {
    if (!bossPhasePingQueue.length) return undefined;
    const timer = setTimeout(() => {
      setBossPhasePingQueue(current => current.slice(1));
    }, 1250);
    return () => clearTimeout(timer);
  }, [bossPhasePingQueue[0]?.id, bossPhasePingQueue.length]);

  useEffect(() => {
    if (!enemy) return undefined;
    const isNewEncounter = enemyHpTrailEncounterRef.current !== enemyEncounterKey;
    enemyHpTrailEncounterRef.current = enemyEncounterKey;

    if (isNewEncounter || enemyHpPctForTrail >= enemyHpTrailPct) {
      setEnemyHpTrailPct(enemyHpPctForTrail);
      return undefined;
    }

    const timer = setTimeout(() => {
      setEnemyHpTrailPct(enemyHpPctForTrail);
    }, 360);
    return () => clearTimeout(timer);
  }, [enemy, enemyEncounterKey, enemyHpPctForTrail, enemyHpTrailPct]);

  useEffect(() => {
    if (!enemy) {
      previousEnemyHpRef.current = { encounterKey: null, pct: null };
      return;
    }

    const previous = previousEnemyHpRef.current;
    if (previous.encounterKey !== enemyEncounterKey) {
      previousEnemyHpRef.current = { encounterKey: enemyEncounterKey, pct: enemyHpPctForTrail };
      return;
    }

    if (previous.pct != null && enemyHpPctForTrail < previous.pct - 0.35) {
      setEnemyHitPulseKey(Date.now());
    }
    previousEnemyHpRef.current = { encounterKey: enemyEncounterKey, pct: enemyHpPctForTrail };
  }, [enemy, enemyEncounterKey, enemyHpPctForTrail]);

  useEffect(() => {
    if (playerHpPctForTrail >= playerHpTrailPct) {
      setPlayerHpTrailPct(playerHpPctForTrail);
      return undefined;
    }

    const timer = setTimeout(() => {
      setPlayerHpTrailPct(playerHpPctForTrail);
    }, 360);
    return () => clearTimeout(timer);
  }, [playerHpPctForTrail, playerHpTrailPct]);

  useEffect(() => {
    const previous = previousPlayerHpPctRef.current;
    if (previous != null && playerHpPctForTrail < previous - 0.35) {
      setPlayerHitPulseKey(Date.now());
    }
    previousPlayerHpPctRef.current = playerHpPctForTrail;
  }, [playerHpPctForTrail]);

  useEffect(() => {
    if (!latestLootEvent) return undefined;
    const shouldShowWithoutHighlight = ["protected_hunt", "protected_upgrade"].includes(
      latestLootEvent?.decisionReason
    );
    if (!latestLootEvent.highlight && !shouldShowWithoutHighlight) return undefined;
    setLootClosing(false);
    setVisibleLootEvent(latestLootEvent);
    return undefined;
  }, [latestLootEvent]);

  useEffect(() => {
    if (!overflowEvent?.id) return undefined;
    if (overflowEvent.id === dismissedOverflowEventId) return undefined;
    setDismissedOverflowEventId(null);
    return undefined;
  }, [dismissedOverflowEventId, overflowEvent]);

  useEffect(() => {
    if (!visibleLootEvent) return undefined;
    const timer = setTimeout(() => setLootClosing(true), 3000);
    return () => clearTimeout(timer);
  }, [visibleLootEvent]);

  useEffect(() => {
    if (!lootClosing) return undefined;
    const timer = setTimeout(() => {
      setVisibleLootEvent(null);
      setLootClosing(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [lootClosing]);

  useEffect(() => {
    const previous = prevLevelRef.current || 1;
    const current = player.level || 1;
    if (current > previous) {
      const eventAt = Date.now();
      setLevelUpFlash({ from: previous, to: current, at: eventAt });
      setLevelUpToastClosing(false);
      setVisibleLevelUpToast({ from: previous, to: current, at: eventAt });
      const timer = setTimeout(() => setLevelUpFlash(null), 2000);
      prevLevelRef.current = current;
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = current;
    return undefined;
  }, [player.level]);

  useEffect(() => {
    if (!visibleLevelUpToast) return undefined;
    const timer = setTimeout(() => setLevelUpToastClosing(true), LEVEL_UP_TOAST_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [visibleLevelUpToast?.at]);

  useEffect(() => {
    if (!levelUpToastClosing) return undefined;
    const timer = setTimeout(() => {
      setVisibleLevelUpToast(null);
      setLevelUpToastClosing(false);
    }, 240);
    return () => clearTimeout(timer);
  }, [levelUpToastClosing]);

  useEffect(() => {
    if (orderedWeeklyContracts.length <= 0) {
      if (selectedWeeklyContractId != null) setSelectedWeeklyContractId(null);
      return;
    }

    const selectedContract = orderedWeeklyContracts.find(
      contract => contract?.id === selectedWeeklyContractId
    );
    if (selectedContract) return;

    const preferred = orderedWeeklyContracts[0];
    if (preferred?.id && preferred.id !== selectedWeeklyContractId) {
      setSelectedWeeklyContractId(preferred.id);
    }
  }, [orderedWeeklyContracts, selectedWeeklyContractId]);

  useEffect(() => {
    if (!spotlightAutoAdvance) return undefined;

    let frameId = null;
    let timeoutId = null;
    let attempts = 0;

    const scrollAutoAdvanceIntoView = () => {
      const target = document.querySelector('[data-onboarding-target="auto-advance"]');
      if (!(target instanceof HTMLElement)) return;

      const topSafe = isMobile ? 132 : 148;
      const bottomSafe = isMobile ? 96 : 28;
      const visibleBottom = Math.max(topSafe + 56, window.innerHeight - bottomSafe);
      const behavior = attempts === 0 ? "auto" : "smooth";

      target.scrollIntoView({
        block: isMobile ? "center" : "start",
        inline: "nearest",
        behavior,
      });

      const rect = target.getBoundingClientRect();
      if (rect.top < topSafe) {
        window.scrollBy({
          top: rect.top - topSafe - 12,
          behavior,
        });
      } else if (rect.bottom > visibleBottom) {
        window.scrollBy({
          top: rect.bottom - visibleBottom + 12,
          behavior,
        });
      }

      attempts += 1;
      if (attempts < 6) {
        timeoutId = window.setTimeout(() => {
          frameId = requestAnimationFrame(scrollAutoAdvanceIntoView);
        }, 90);
      }
    };

    frameId = requestAnimationFrame(scrollAutoAdvanceIntoView);
    return () => {
      if (frameId != null) cancelAnimationFrame(frameId);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [isMobile, spotlightAutoAdvance]);

  const enemyIdentityLabel = [enemy?.familyName, enemy?.familyTraitName].filter(Boolean).join(" · ");
  const abyssMutator = enemy?.abyssMutator || null;
  const abyssBossProfile = enemy?.abyssBossProfile || null;
  const bossDepthSummary = enemy?.isBoss ? formatAbyssBossUpgradeSummary(abyssBossProfile) : "";
  const depthAffixIds = new Set(enemy?.depthAffixIds || []);
  const depthMechanicIds = new Set(enemy?.depthMechanicIds || []);
  const mutatorAffixIds = new Set(enemy?.mutatorAffixIds || []);
  const mutatorMechanicIds = new Set(enemy?.mutatorMechanicIds || []);
  const bossMechanicMitigation = enemy?.isBoss
    ? Math.min(
      0.75,
      Math.max(0, Number(baseStats.bossMechanicMitigation || 0)) +
        (Number(enemy?.abyssDepth || 0) > 0 ? Math.max(0, Number(baseStats.abyssBossMechanicMitigation || 0)) : 0)
    )
    : 0;
  const enemyIntelChips = [
    ...(enemy?.monsterAffixes || []).slice(0, 2).map(affix => ({ id: `monster-${affix.id || affix.name}`, label: affix.name })),
    ...(enemy?.mechanics || []).slice(0, 2).map(mechanic => ({ id: `mech-${mechanic.id || mechanic.name}`, label: mechanic.name })),
  ].filter(Boolean);
  const enemyHudIntelTags = useMemo(() => {
    const tags = [];

    if (abyssMutator?.name) {
      tags.push({
        id: `mutator-${abyssMutator.id || abyssMutator.name}`,
        label: abyssMutator.name,
        tone: "arcane",
      });
    }

    if (enemy?.isBoss && bossDepthSummary) {
      tags.push({
        id: `boss-depth-${enemy?.id || enemy?.name || "boss"}`,
        label: bossDepthSummary,
        tone: "warning",
      });
    }

    (enemy?.monsterAffixes || []).forEach(affix => {
      if (!affix?.name) return;
      const sourceMeta = getIntelSourceMeta(affix.id, depthAffixIds, mutatorAffixIds);
      const affixTone = sourceMeta.tone === "neutral" ? "defense" : sourceMeta.tone;
      tags.push({
        id: `affix-${affix.id || affix.name}`,
        label: affix.name,
        tone: affixTone,
      });
    });

    (enemy?.mechanics || []).forEach(mechanic => {
      if (!mechanic?.name) return;
      const sourceMeta = getIntelSourceMeta(mechanic.id, depthMechanicIds, mutatorMechanicIds);
      const mechanicTone = sourceMeta.tone === "neutral" ? "danger" : sourceMeta.tone;
      tags.push({
        id: `mech-${mechanic.id || mechanic.name}`,
        label: mechanic.name,
        tone: mechanicTone,
      });
    });

    const seen = new Set();
    return tags.filter(tag => {
      const key = `${tag.tone}:${tag.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [
    abyssMutator,
    bossDepthSummary,
    depthAffixIds,
    depthMechanicIds,
    enemy,
    mutatorAffixIds,
    mutatorMechanicIds,
  ]);
  const enemyLegendaryDrops = useMemo(() => getTargetedLegendaryDropsForEnemy(enemy, { abyss: state?.abyss || {} }), [enemy, state?.abyss]);
  const missingEnemyPowers = useMemo(() => {
    const discoveries = state?.codex?.powerDiscoveries || {};
    return enemyLegendaryDrops.filter(drop => !(discoveries?.[drop?.power?.id] > 0));
  }, [enemyLegendaryDrops, state?.codex?.powerDiscoveries]);
  const knownEnemyPowers = useMemo(() => {
    const discoveries = state?.codex?.powerDiscoveries || {};
    return enemyLegendaryDrops.filter(drop => discoveries?.[drop?.power?.id] > 0);
  }, [enemyLegendaryDrops, state?.codex?.powerDiscoveries]);
  const activeTalentCount = activeTalentEffects.size;
  const effectStacksBySource = useMemo(() => {
    const counts = new Map();
    (effects || []).forEach(effect => {
      if (!effect?.sourceId) return;
      counts.set(effect.sourceId, (counts.get(effect.sourceId) || 0) + 1);
    });
    return counts;
  }, [effects]);
  const playerStatusPills = useMemo(() => {
    const statuses = [];
    const rageStacks = effectStacksBySource.get("berserker_blood_debt") || 0;
    const fortressStacks = effectStacksBySource.get("juggernaut_fortress_guard") || 0;
    const momentumStacks = effectStacksBySource.get("juggernaut_titanic_momentum") || 0;
    const combatFlowStacks = Math.min(
      Math.max(0, Number(baseStats.combatFlowMaxStacks || 0)),
      Math.max(0, Number(enemy?.runtime?.flowStacks || 0))
    );
    const flowHits = Number(enemy?.runtime?.mageFlowHitsRemaining || 0);
    const flowBonusMult = Math.max(1, Number(enemy?.runtime?.mageFlowBonusMult || 1));
    const volatileMult = Math.max(0.2, Number(combat?.pendingMageVolatileMult || 1));
    const rageDamageMult = getStackedMultiplier(1 + Number(baseStats.bloodDebt || 0) * 0.01, rageStacks);
    const rageAttackSpeed = rageStacks * (0.003 + Number(baseStats.bloodDebt || 0) * 0.003);
    const fortressDamageMult = getStackedMultiplier(1 + Number(baseStats.fortress || 0) * 0.006, fortressStacks);
    const momentumDamageMult = getStackedMultiplier(1 + Number(baseStats.titanicMomentumDamagePerStack || 0), momentumStacks);
    const momentumDefenseMult = getStackedMultiplier(1 + Number(baseStats.titanicMomentumDefensePerStack || 0), momentumStacks);
    const momentumAttackSpeed = momentumStacks * Math.max(0, Number(baseStats.titanicMomentumAttackSpeedPerStack || 0));
    const combatFlowMult =
      combatFlowStacks > 0
        ? 1 + combatFlowStacks * Math.max(0, Number(baseStats.combatFlowPerStack || 0))
        : 1;
    const poisonStacks = Math.max(0, Number(enemy?.runtime?.poisonStacksOnPlayer || 0));
    const poisonPerStack = Math.max(0, Number(enemy?.runtime?.poisonPerStackOnPlayer || 0));
    const poisonTicks = Math.max(0, Number(enemy?.runtime?.poisonTicksRemainingOnPlayer || 0));
    const poisonTickDamage = poisonStacks > 0 && poisonTicks > 0
      ? applyMitigationPreview(
        Math.max(1, Math.floor(poisonStacks * poisonPerStack)),
        (enemy?.mechanics || []).some(mechanic => mechanic.id === "poison_stacks") ? bossMechanicMitigation : 0
      )
      : 0;

    if (rageStacks > 0) statuses.push({
      id: "rage",
      label: STATUS_METADATA.rage.label,
      value: `x${rageStacks}`,
      tone: "danger",
      detail: `${formatMultiplierBonus(rageDamageMult)} dano · ${formatSignedPercent(rageAttackSpeed, 1)} vel`,
      description: STATUS_METADATA.rage.description,
    });
    if (fortressStacks > 0) statuses.push({
      id: "fortress",
      label: STATUS_METADATA.fortress.label,
      value: `x${fortressStacks}`,
      tone: "boss",
      detail: `${formatMultiplierBonus(fortressDamageMult)} dano listo`,
      description: STATUS_METADATA.fortress.description,
    });
    if (combatFlowStacks > 0) statuses.push({
      id: "combat-flow",
      label: STATUS_METADATA.combatFlow.label,
      value: `x${combatFlowStacks}`,
      tone: "info",
      detail: `${formatMultiplierBonus(combatFlowMult, 1)} dano`,
      description: STATUS_METADATA.combatFlow.description,
    });
    if (momentumStacks > 0) statuses.push({
      id: "momentum",
      label: STATUS_METADATA.momentum.label,
      value: `x${momentumStacks}`,
      tone: "success",
      detail: `${formatMultiplierBonus(momentumDamageMult)} dano · ${formatMultiplierBonus(momentumDefenseMult)} defensa · ${formatSignedPercent(momentumAttackSpeed, 1)} vel`,
      description: STATUS_METADATA.momentum.description,
    });
    if (flowHits > 0) statuses.push({
      id: "flow",
      label: STATUS_METADATA.flow.label,
      value: `${flowHits} golpe${flowHits === 1 ? "" : "s"}`,
      tone: "info",
      detail: `${formatMultiplierBonus(flowBonusMult)} dano`,
      description: STATUS_METADATA.flow.description,
    });
    if (player.class === "mage" && Math.abs(volatileMult - 1) > 0.01) {
      statuses.push({
        id: "volatile",
        label: STATUS_METADATA.volatile.label,
        value: `x${volatileMult.toFixed(2)}`,
        tone: volatileMult >= 1 ? "warning" : "common",
        detail: volatileMult >= 1 ? "alto roll preparado" : "riesgo de bajo roll",
        description: STATUS_METADATA.volatile.description,
      });
    }
    if (player.class === "mage" && Math.max(0, Number(baseStats.perfectCast || 0)) > 0) {
      statuses.push({
        id: "perfect-cast",
        label: STATUS_METADATA.perfectCast.label,
        value: `${Math.round((Number(baseStats.damageRangeMin || 1)) * 100)}-${Math.round((Number(baseStats.damageRangeMax || 1)) * 100)}%`,
        tone: "info",
        detail: "sin multi-hit · dano mas limpio",
        description: STATUS_METADATA.perfectCast.description,
      });
    }
    if (player.class === "mage" && Math.max(0, Number(baseStats.markTransferPct || 0)) > 0) {
      statuses.push({
        id: "time-loop",
        label: STATUS_METADATA.timeLoop.label,
        value: formatPercent(baseStats.markTransferPct || 0),
        tone: "boss",
        detail: `${Math.max(0, Number(baseStats.flowHits || 0))} flow heredado`,
        description: STATUS_METADATA.timeLoop.description,
      });
    }
    if (player.class === "mage" && Math.max(1, Number(baseStats.absoluteControlMarkedMult || 1)) > 1.001) {
      statuses.push({
        id: "absolute-control",
        label: STATUS_METADATA.absoluteControl.label,
        value: `+${Math.round((Number(baseStats.absoluteControlMarkedMult || 1) - 1) * 100)}%`,
        tone: "warning",
        detail: `sin marca -${Math.round((1 - Number(baseStats.absoluteControlUnmarkedMult || 1)) * 100)}%`,
        description: STATUS_METADATA.absoluteControl.description,
      });
    }
    if (poisonStacks > 0) {
      statuses.push({
        id: "poison",
        label: STATUS_METADATA.poison.label,
        value: `x${poisonStacks}`,
        tone: "danger",
        detail: `${poisonTickDamage.toLocaleString()}/tick · ${formatTickCount(poisonTicks)}`,
        description: STATUS_METADATA.poison.description,
      });
    }
    return statuses;
  }, [
    baseStats.bloodDebt,
    baseStats.bossMechanicMitigation,
    baseStats.combatFlowMaxStacks,
    baseStats.combatFlowPerStack,
    baseStats.abyssBossMechanicMitigation,
    baseStats.fortress,
    baseStats.flowHits,
    baseStats.absoluteControlMarkedMult,
    baseStats.absoluteControlUnmarkedMult,
    baseStats.titanicMomentum,
    baseStats.titanicMomentumDamagePerStack,
    baseStats.titanicMomentumAttackSpeedPerStack,
    baseStats.titanicMomentumDefensePerStack,
    baseStats.perfectCast,
    baseStats.markTransferPct,
    combat?.pendingMageVolatileMult,
    effectStacksBySource,
    enemy?.runtime?.flowStacks,
    enemy?.runtime?.mageFlowBonusMult,
    enemy?.runtime?.mageFlowHitsRemaining,
    enemy?.runtime?.poisonPerStackOnPlayer,
    enemy?.runtime?.poisonStacksOnPlayer,
    enemy?.runtime?.poisonTicksRemainingOnPlayer,
    enemy?.abyssDepth,
    enemy?.mechanics,
    player.class,
    bossMechanicMitigation,
  ]);
  const enemyStatusPills = useMemo(() => {
    const runtime = enemy?.runtime || {};
    const statuses = [];
    const bleedTickDamage =
      (runtime.bleedStacks || 0) > 0 && (runtime.bleedPerStack || 0) > 0 && (runtime.bleedTicksRemaining || 0) > 0
        ? Math.max(1, Math.floor(Number(runtime.bleedStacks || 0) * Number(runtime.bleedPerStack || 0)))
        : 0;
    const voidFractureTickDamage =
      (runtime.voidFractureStacks || 0) > 0 && (runtime.voidFracturePerStack || 0) > 0 && (runtime.voidFractureTicksRemaining || 0) > 0
        ? Math.max(1, Math.floor(Number(runtime.voidFractureStacks || 0) * Number(runtime.voidFracturePerStack || 0)))
        : 0;
    const fractureReduction = Math.min(0.55, Number(runtime.fractureStacks || 0) * 0.1);
    const memoryBonusPerStack =
      Math.max(0, Number(baseStats.spellMemoryMarkEffectPerStack || 0)) +
      Math.max(0, Number(legendaryBonuses.spellMemoryMarkEffectPerStack || 0));
    const markEffectPerStack =
      Math.max(0, Number(baseStats.markEffectPerStack || 0)) +
      Math.max(0, Number(runtime.mageMemoryStacks || 0)) * memoryBonusPerStack +
      Math.max(0, Number(legendaryBonuses.markEffectPerStack || 0));
    const markedTargetMult =
      (runtime.markStacks || 0) > 0
        ? 1 + Math.max(0, Number(runtime.markStacks || 0)) * markEffectPerStack
        : 1;
    const rampStacks = Math.min(
      Math.max(0, Number(baseStats.temporalFlowMaxStacks || 0)),
      Math.max(0, Number(runtime.mageTemporalFlowStacks || 0))
    );
    const rampMult = 1 + rampStacks * Math.max(0, Number(baseStats.temporalFlowPerStack || 0));

    if ((runtime.bleedStacks || 0) > 0) statuses.push({
      id: "bleed",
      label: STATUS_METADATA.bleed.label,
      value: `x${runtime.bleedStacks}`,
      tone: "danger",
      detail: `${bleedTickDamage.toLocaleString()}/tick · ${formatTickCount(runtime.bleedTicksRemaining)}`,
      description: STATUS_METADATA.bleed.description,
    });
    if ((runtime.fractureStacks || 0) > 0) statuses.push({
      id: "fracture",
      label: STATUS_METADATA.fracture.label,
      value: `x${runtime.fractureStacks}`,
      tone: "warning",
      detail: `${formatSignedPercent(-fractureReduction)} defensa · ${formatTickCount(runtime.fractureTicksRemaining)}`,
      description: STATUS_METADATA.fracture.description,
    });
    if ((runtime.voidFractureStacks || 0) > 0) statuses.push({
      id: "void-fracture",
      label: STATUS_METADATA.voidFracture.label,
      value: `x${runtime.voidFractureStacks}`,
      tone: "boss",
      detail: `${voidFractureTickDamage.toLocaleString()}/tick · ${formatTickCount(runtime.voidFractureTicksRemaining)}`,
      description: STATUS_METADATA.voidFracture.description,
    });
    if ((runtime.markStacks || 0) > 0) statuses.push({
      id: "mark",
      label: STATUS_METADATA.mark.label,
      value: `x${runtime.markStacks}`,
      tone: "boss",
      detail: `${formatMultiplierBonus(markedTargetMult)} dano · ${formatTickCount(runtime.markTicksRemaining)}`,
      description: STATUS_METADATA.mark.description,
    });
    if ((runtime.mageMemoryStacks || 0) > 0) statuses.push({
      id: "memory",
      label: STATUS_METADATA.memory.label,
      value: `x${runtime.mageMemoryStacks}`,
      tone: "info",
      detail: `${formatSignedPercent(memoryBonusPerStack, 1)} por stack de Marca`,
      description: STATUS_METADATA.memory.description,
    });
    if ((runtime.mageTemporalFlowStacks || 0) > 0) statuses.push({
      id: "ramp",
      label: STATUS_METADATA.ramp.label,
      value: `x${runtime.mageTemporalFlowStacks}`,
      tone: "success",
      detail: `${formatMultiplierBonus(rampMult)} dano sostenido`,
      description: STATUS_METADATA.ramp.description,
    });
    return statuses;
  }, [
    baseStats.markEffectPerStack,
    baseStats.spellMemoryMarkEffectPerStack,
    baseStats.temporalFlowMaxStacks,
    baseStats.temporalFlowPerStack,
    enemy,
    legendaryBonuses.markEffectPerStack,
    legendaryBonuses.spellMemoryMarkEffectPerStack,
  ]);

  if (!enemy) return null;

  const enemyHpPct = enemyHpPctForTrail;
  const weeklySegmentCount = Math.max(1, Number(activeWeeklyBossEncounter?.segmentCount || enemy?.weeklyBoss?.segmentCount || 1));
  const weeklySegmentMaxHp = Math.max(1, Number(activeWeeklyBossEncounter?.segmentMaxHp || enemy?.weeklyBoss?.segmentMaxHp || enemy.maxHp || 1));
  const showWeeklySegmentBars = weeklySegmentCount > 1 && Boolean(activeWeeklyBossEncounter);
  const weeklySegments = showWeeklySegmentBars
    ? Array.from({ length: weeklySegmentCount }, (_, index) => {
        const segmentIndex = weeklySegmentCount - index;
        const segmentFloor = (segmentIndex - 1) * weeklySegmentMaxHp;
        const segmentHp = Math.max(0, Math.min(weeklySegmentMaxHp, Number(enemy.hp || 0) - segmentFloor));
        const pct = Math.max(0, Math.min(100, (segmentHp / weeklySegmentMaxHp) * 100));
        const cleared = Number(enemy.hp || 0) <= segmentFloor;
        return {
          id: `${segmentIndex}`,
          label: `Barra ${segmentIndex}`,
          pct,
          cleared,
        };
      })
    : [];
  const weeklyBarsRemaining = showWeeklySegmentBars
    ? Math.max(0, Math.min(weeklySegmentCount, Math.ceil(Math.max(0, Number(enemy.hp || 0)) / weeklySegmentMaxHp)))
    : 0;
  const playerHpPct = playerHpPctForTrail;
  const inEnemyFinishZone = enemyHpPct <= ENEMY_FINISH_ZONE_PCT;
  const critStreakAgeMs = Date.now() - Number(critStreak.lastCritAt || 0);
  const critStreakFade = Math.max(0, Math.min(1, 1 - (critStreakAgeMs / CRIT_STREAK_TIMEOUT_MS)));
  const showCritStreak = critStreak.count >= 2 && critStreakFade > 0;
  const activeBossPhasePing =
    bossPhasePingQueue[0]?.enemyKey === enemyEncounterKey ? bossPhasePingQueue[0] : null;
  const levelUpToastBottom = visibleLootEvent
    ? (isMobile
      ? "calc(var(--app-bottom-nav-offset, 0px) + env(safe-area-inset-bottom, 0px) + 92px)"
      : 108)
    : (isMobile
      ? "calc(var(--app-bottom-nav-offset, 0px) + env(safe-area-inset-bottom, 0px) + 16px)"
      : 24);

  const xpNeeded = xpRequired(player.level);
  const xpPct = Math.min(100, (player.xp / xpNeeded) * 100);
  const combatBackgroundVisual = getCombatBackgroundVisual();
  const combatEnemyVisual = getCombatEnemyVisual(enemy);
  const forgeLightTrialEnabled = Boolean(forgeLightTrial);
  const forgeCombatEnabled = forgeLightTrialEnabled || Boolean(combatBackgroundVisual?.src);
  const tierInForgeSegment =
    ((Math.max(1, Number(currentTier || 1)) - 1) % FORGE_TIER_NODE_COUNT) + 1;
  const tierProgressPct = FORGE_TIER_NODE_COUNT > 1
    ? ((tierInForgeSegment - 1) / (FORGE_TIER_NODE_COUNT - 1)) * 100
    : 100;
  const tierTrackNodes = Array.from({ length: FORGE_TIER_NODE_COUNT }, (_, index) => {
    const thresholdPct = FORGE_TIER_NODE_COUNT <= 1
      ? 100
      : (index / (FORGE_TIER_NODE_COUNT - 1)) * 100;
    const isBossNode = index === FORGE_TIER_NODE_COUNT - 1;
    const nodePosition = index + 1;
    return {
      id: `tier-node-${index}`,
      boss: isBossNode,
      active: tierProgressPct >= thresholdPct || (isBossNode && enemy.isBoss),
      current: nodePosition === tierInForgeSegment,
    };
  });

  const getHpColor = pct => {
    if (pct > 60) return COLORS.success;
    if (pct > 30) return COLORS.warning;
    return COLORS.danger;
  };

  const getLogEntryTone = entry => {
    const text = entry.toLowerCase();
    if (text.includes("logro:")) return "achievement";
    if (text.includes("objetivo:")) return "objective";
    if (text.includes("boss abatido")) return "boss";
    if (text.includes("victoria")) return "victory";
    if (text.includes("cayo frente")) return "down";
    if (text.includes("critico")) return "critical";
    if (text.includes("derrotado") || text.includes("obtienes")) return "gain";
    if (text.includes("mueres") || text.includes("recibes")) return "danger";
    if (text.includes("nivel")) return "level";
    return "default";
  };
  const floatingCombatEvents = (combat.floatEvents || []).slice(-10);
  const combatDamageFloatEvents = floatingCombatEvents.filter(event => event.kind !== "xp");
  const combatXpFloatEvents = floatingCombatEvents.filter(event => event.kind === "xp");
  const isPanelCollapsed = panel => !!collapsedPanels[panel];
  const togglePanel = panel => {
    setCollapsedPanels(current => ({
      ...current,
      [panel]: !current[panel],
    }));
  };
  const cycleWeeklyContract = delta => {
    if (orderedWeeklyContracts.length <= 1) return;
    const currentIndex = Math.max(
      0,
      orderedWeeklyContracts.findIndex(contract => contract?.id === featuredWeeklyContract?.id)
    );
    const nextIndex =
      (currentIndex + delta + orderedWeeklyContracts.length) % orderedWeeklyContracts.length;
    const nextContract = orderedWeeklyContracts[nextIndex];
    if (nextContract?.id) setSelectedWeeklyContractId(nextContract.id);
  };

  const combatRootClassName = [
    "combat-root",
    "combat-root--ui-v4",
    forgeCombatEnabled ? "combat-root--forge-assets" : "",
    forgeLightTrialEnabled ? "combat-root--forge-light-prueba" : "",
    COMBAT_STITCH_VISUAL_TRIAL ? "combat-root--stitch-trial" : "",
    COMBAT_STITCH_VISUAL_TRIAL && COMBAT_STITCH_PERF_SAFE ? "combat-root--stitch-perf-safe" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={combatRootClassName}
      {...{ style: {
        "--combat-bg-image": combatBackgroundVisual?.src ? `url("${combatBackgroundVisual.src}")` : "none",
      } }}
    >
      {visibleOverflowEvent && (
        <section
          className="combat-overflow-banner"
          data-mobile={isMobile ? "true" : undefined}
        >
          <div className="combat-overflow-banner__top">
            <div className="combat-overflow-banner__copy">
              <div className="combat-overflow-banner__eyebrow">
                Mochila llena
              </div>
              <div className="combat-overflow-banner__title">
                {visibleOverflowEvent.incomingItemKept
                  ? `${visibleOverflowEvent.incomingItemName} entró y desplazó ${visibleOverflowEvent.droppedItemName}.`
                  : `${visibleOverflowEvent.incomingItemName} no entró y se perdió.`}
              </div>
            </div>
            <div className="combat-overflow-banner__actions">
              <FlButton
                onClick={() => {
                  dispatch({ type: "REQUEST_LOOT_FILTER_OPEN" });
                  dispatch({ type: "SET_TAB", tab: "inventory" });
                }}
                className="combat-overflow-banner__action combat-overflow-banner__action--primary"
                variant="default"
                size="sm"
              >
                Abrir filtro
              </FlButton>
              <FlButton
                onClick={() => setDismissedOverflowEventId(visibleOverflowEvent.id)}
                className="combat-overflow-banner__action combat-overflow-banner__action--secondary"
                variant="secondary"
                size="sm"
              >
                Ocultar
              </FlButton>
            </div>
          </div>
          <div className="combat-overflow-banner__chips">
            <span className="combat-overflow-chip combat-overflow-chip--warning">
              {Math.max(0, Number(overflowStats.total || 0))} overflow
            </span>
            <span className="combat-overflow-chip combat-overflow-chip--neutral">
              {Math.max(0, Number(overflowStats.lost || 0))} perdidos
            </span>
            <span className="combat-overflow-chip combat-overflow-chip--warning">
              Entra {String(visibleOverflowEvent.incomingItemRarity || "common").toUpperCase()} · P {Math.floor(Number(visibleOverflowEvent.incomingItemRating || 0))}
            </span>
            <span className="combat-overflow-chip combat-overflow-chip--neutral">
              Sale {String(visibleOverflowEvent.droppedItemRarity || "common").toUpperCase()} · P {Math.floor(Number(visibleOverflowEvent.droppedItemRating || 0))}
            </span>
          </div>
          <div className="combat-overflow-banner__hint">
            Ajustalo en Mochila con filtro de loot si se repite seguido.
          </div>
          <div className="combat-overflow-banner__meta">
            Regla activa: {lootRuleSummary}.
          </div>
        </section>
      )}
      {showRunSigilCallout && (
        <RunSigilCallout
          runSigilIds={activeRunSigilIds}
          slotCount={runSigilSlotCount}
          title="Sesgo activo de run"
          subtitle="Si quieres otro perfil, cambialo al iniciar la proxima expedicion."
          showDeltas
        />
      )}
      <section
        className={[
          "combat-main-panel",
          enemy.isBoss ? "combat-main-panel--boss" : "combat-main-panel--default",
        ].join(" ")}
      >
        {forgeCombatEnabled ? (
          <CombatForgeTierTrack
            currentTier={currentTier}
            maxTier={maxTier}
            zoneLabel={combatBackgroundVisual?.label || "Ruinas Olvidadas"}
            progressPct={tierProgressPct}
            nodes={tierTrackNodes}
            canGoPrevious={currentTier > 1}
            canGoNext={currentTier < maxTier}
            onPrevious={() => dispatch({ type: "SET_TIER", tier: currentTier - 1 })}
            onNext={() => dispatch({ type: "SET_TIER", tier: currentTier + 1 })}
            showAuto={!isMobile && autoAdvanceUnlocked}
            autoAdvance={autoAdvance}
            spotlightAutoAdvance={spotlightAutoAdvance}
            onToggleAuto={() => dispatch({ type: "TOGGLE_AUTO_ADVANCE" })}
            title={[
              `Tier ${currentTier} / ${maxTier}`,
              abyssMutator ? `Anomalia: ${abyssMutator.name}` : "",
              bossDepthSummary ? `Eco Abisal: ${bossDepthSummary}` : "",
              enemy.familyTraitName ? `Rasgo: ${enemy.familyTraitName}` : "",
              (enemy.monsterAffixes || []).length ? `Afijos: ${(enemy.monsterAffixes || []).map(affix => affix.name).join(", ")}` : "",
              (enemy.mechanics || []).length ? `Boss: ${(enemy.mechanics || []).map(mechanic => mechanic.name).join(", ")}` : "",
            ].filter(Boolean).join("\n")}
          />
        ) : (
          <div
            className="combat-tier-grid"
          >
            <button
              onClick={() => dispatch({ type: "SET_TIER", tier: currentTier - 1 })}
              disabled={currentTier <= 1}
              {...{ style: navBtnStyle(currentTier > 1) }}
            >
              {"<"}
            </button>
            <div {...{ style: { display: "flex", justifyContent: "center", minWidth: 0 } }}>
              <div
                className="combat-tier-chip"
              >
                <div {...{ style: { fontSize: 9, color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" } }}>
                  Tier Actual
                </div>
                <button
                  title={[
                    `Tier ${currentTier} / ${maxTier}`,
                    abyssMutator ? `Anomalia: ${abyssMutator.name}` : "",
                    bossDepthSummary ? `Eco Abisal: ${bossDepthSummary}` : "",
                    enemy.familyTraitName ? `Rasgo: ${enemy.familyTraitName}` : "",
                    (enemy.monsterAffixes || []).length ? `Afijos: ${(enemy.monsterAffixes || []).map(affix => affix.name).join(", ")}` : "",
                    (enemy.mechanics || []).length ? `Boss: ${(enemy.mechanics || []).map(mechanic => mechanic.name).join(", ")}` : "",
                  ].filter(Boolean).join("\n")}
                  {...{ style: {
                    margin: 0,
                    fontSize: "clamp(12px, 1.3vw, 13px)",
                    color: COLORS.common,
                    fontWeight: "900",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "help",
                    display: "block",
                    lineHeight: 1,
                    width: "100%",
                    fontVariantNumeric: "tabular-nums",
                    fontFeatureSettings: "\"tnum\"",
                  } }}
                >
                  {currentTier} / {maxTier}
                </button>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: "SET_TIER", tier: currentTier + 1 })}
              disabled={currentTier >= maxTier}
              {...{ style: navBtnStyle(currentTier < maxTier) }}
            >
              {">"}
            </button>
            {!isMobile && autoAdvanceUnlocked && (
              <FlSwitch
                checked={autoAdvance}
                onChange={() => dispatch({ type: "TOGGLE_AUTO_ADVANCE" })}
                label="Auto"
                size="sm"
                variant="rect"
                className={[
                  "combat-auto-switch",
                  "combat-auto-switch--desktop",
                  spotlightAutoAdvance ? "is-spotlighted" : "",
                ].filter(Boolean).join(" ")}
                data-onboarding-target={spotlightAutoAdvance ? "auto-advance" : undefined}
                ariaLabel={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
              />
            )}
          </div>
        )}

        {!forgeCombatEnabled && (
          <>
            <div className="combat-forge-action-strip">
              {isMobile && autoAdvanceUnlocked && (
                <FlSwitch
                  checked={autoAdvance}
                  onChange={() => dispatch({ type: "TOGGLE_AUTO_ADVANCE" })}
                  label="Auto"
                  size="sm"
                  variant="rect"
                  className={[
                    "combat-auto-switch",
                    spotlightAutoAdvance ? "is-spotlighted" : "",
                  ].filter(Boolean).join(" ")}
                  data-onboarding-target={spotlightAutoAdvance ? "auto-advance" : undefined}
                  ariaLabel={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
                />
              )}
              {extractionUnlocked && (
                <FlButton
                  onClick={() => dispatch({ type: "OPEN_EXTRACTION", exitReason: "retire" })}
                  variant="default"
                  size="xs"
                  className={[
                    "combat-extract-button",
                    spotlightExtraction ? "is-spotlighted" : "",
                  ].filter(Boolean).join(" ")}
                  data-onboarding-target={spotlightExtraction ? "open-extraction" : undefined}
                >
                  Extraer al Santuario
                </FlButton>
              )}
            </div>
            {extractionUnlocked && extractionDecision && (
              <div className="combat-forge-extraction-decision">
                <div className="combat-forge-extraction-pill">
                  <span
                    className={[
                      "combat-forge-extraction-pill__label",
                      extractionDecision.toneClass ? `combat-forge-extraction-pill__label--${extractionDecision.toneClass}` : "",
                    ].filter(Boolean).join(" ")}
                  >
                    {extractionDecision.label}
                  </span>
                  <span className="combat-forge-extraction-pill__detail">{extractionDecision.detail}</span>
                </div>
              </div>
            )}
          </>
        )}

        <div
          className={[
            "combat-enemy-stage",
            combatEnemyVisual ? "combat-enemy-stage--has-asset" : "combat-enemy-stage--fallback",
            enemyHitPulseKey ? "combat-enemy-stage--recent-hit" : "",
          ].join(" ")}
          data-onboarding-target={forgeCombatEnabled && spotlightCombatEncounter ? "combat-encounter" : undefined}
          onClick={() => forgeCombatEnabled && spotlightCombatEncounter && dispatch({ type: "ACK_ONBOARDING_STEP" })}
        >
          {sideActions.length > 0 && (
            <CombatForgeSideActions actions={sideActions} />
          )}

          {forgeCombatEnabled && (extractionUnlocked || (isMobile && autoAdvanceUnlocked)) && (
            <div className="combat-forge-stage-controls">
              {extractionUnlocked && (
                <FlButton
                  className={[
                    "combat-forge-stage-extract-button",
                    spotlightExtraction ? "is-spotlighted" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => dispatch({ type: "OPEN_EXTRACTION", exitReason: "retire" })}
                  data-onboarding-target={spotlightExtraction ? "open-extraction" : undefined}
                  variant="default"
                  size="xs"
                >
                  Extraer
                </FlButton>
              )}
              {isMobile && autoAdvanceUnlocked && (
                <FlSwitch
                  checked={autoAdvance}
                  onChange={() => dispatch({ type: "TOGGLE_AUTO_ADVANCE" })}
                  label="Auto"
                  size="sm"
                  variant="rect"
                  className={[
                    "combat-forge-stage-switch",
                    autoAdvance ? "is-active" : "",
                    spotlightAutoAdvance ? "is-spotlighted" : "",
                  ].filter(Boolean).join(" ")}
                  data-onboarding-target={spotlightAutoAdvance ? "auto-advance" : undefined}
                  ariaLabel={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
                />
              )}
            </div>
          )}

          <div className="combat-forge-enemy-hud">
            <button
              className="combat-forge-enemy-name"
              title={[
                abyssMutator ? `Anomalia: ${abyssMutator.name}${abyssMutator.bossClause && enemy.isBoss ? ` · ${abyssMutator.bossClause}` : ""}` : "",
                bossDepthSummary ? `Eco Abisal: ${bossDepthSummary}` : "",
                enemy.familyName ? `${enemy.familyName}: ${enemy.familyTraitName || "Sin rasgo visible"}` : enemy.familyTraitName || "Sin rasgo visible",
                ...(enemy.monsterAffixes || []).map(affix => `${affix.name}: ${affix.description}`),
                ...(enemy.mechanics || []).map(mechanic => `${mechanic.name}: ${mechanic.description}`),
              ].filter(Boolean).join("\n")}
            >
              {enemy.isBoss ? "BOSS " : ""}
              {enemy.name}
            </button>
            {enemyHudIntelTags.length > 0 && (
              <div className="combat-forge-enemy-intel-tags">
                {enemyHudIntelTags.map(tag => (
                  <FlTag key={tag.id} size="xs" tone={tag.tone}>
                    {tag.label}
                  </FlTag>
                ))}
              </div>
            )}
            <CombatForgeHpBar
              variant="enemy"
              iconName="skull"
              pct={enemyHpPct}
              trailPct={enemyHpTrailPct}
              currentLabel={`${Math.ceil(enemy.hp).toLocaleString()} / ${Math.ceil(enemy.maxHp).toLocaleString()}`}
              percentLabel={`${Math.floor(enemyHpPct)}%`}
              flashKey={enemyHitPulseKey}
              finishZonePct={ENEMY_FINISH_ZONE_PCT}
              inFinishZone={inEnemyFinishZone}
              extraLabel={showWeeklySegmentBars ? `${weeklyBarsRemaining}/${weeklySegmentCount} barras` : ""}
            />
            <CombatStatusIconTray statuses={enemyStatusPills} emptyLabel="Sin estados enemigos" />
          </div>

          {combatDamageFloatEvents.length > 0 && (
            <div className="combat-forge-float-layer" aria-hidden="true">
              {combatDamageFloatEvents.map((event, index) => (
                <CombatFloatingText key={event.id || `${event.kind}-${index}`} event={event} index={index} />
              ))}
            </div>
          )}

          <div className="combat-enemy-stage__visual">
            {combatEnemyVisual ? (
              <img
                className="combat-enemy-stage__image"
                src={combatEnemyVisual.src}
                alt=""
                aria-hidden="true"
                {...{ style: {
                  "--combat-enemy-scale": combatEnemyVisual.scale || 1,
                  "--combat-enemy-stage-scale": combatEnemyVisual.stageScale || 1.16,
                  "--combat-enemy-y": `${combatEnemyVisual.y || 0}%`,
                } }}
                draggable="false"
              />
            ) : (
              <div className="combat-enemy-stage__fallback" aria-hidden="true">
                {(enemy.name || "?").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div
            key={`player-hud-${playerHitPulseKey}`}
            className={[
              "combat-forge-player-hud",
              playerHpPct <= 30 ? "combat-forge-player-hud--danger" : "",
              playerHitPulseKey ? "combat-forge-player-hud--hit" : "",
            ].filter(Boolean).join(" ")}
          >
            <div className="combat-forge-player-portrait" aria-hidden="true">
              <ForgeIcon name="hero" size={31} />
              <span>{player.level}</span>
            </div>
            <div className="combat-forge-player-bars">
              <CombatForgeHpBar
                variant="hero"
                iconName={null}
                pct={playerHpPct}
                trailPct={playerHpTrailPct}
                currentLabel={`${Math.ceil(player.hp).toLocaleString()} / ${Math.ceil(player.maxHp).toLocaleString()}`}
                percentLabel={`${Math.floor(playerHpPct)}%`}
                flashKey={playerHitPulseKey}
                compact
              />
              <CombatForgeResourceBar
                label="XP"
                valueLabel={`${Math.floor(player.xp).toLocaleString()} / ${xpNeeded.toLocaleString()}`}
                percentLabel={`${Math.floor(xpPct)}%`}
                pct={xpPct}
              />
              <CombatStatusIconTray statuses={playerStatusPills} emptyLabel="Sin estados del heroe" compact reserveSpace />
            </div>
          </div>

          {!forgeCombatEnabled && (
            <div className="combat-enemy-stage__label">
              {combatEnemyVisual?.source === "family" ? `Asset temporal - ${combatEnemyVisual.sourceFamily}` : combatEnemyVisual?.label || "Sin asset"}
            </div>
          )}
        </div>

        {!forgeCombatEnabled && (
        <div
          data-onboarding-target={spotlightCombatEncounter ? "combat-encounter" : undefined}
          onClick={() => spotlightCombatEncounter && dispatch({ type: "ACK_ONBOARDING_STEP" })}
          className={[
            "combat-encounter-intel",
            spotlightCombatEncounter ? "is-spotlighted" : "",
          ].filter(Boolean).join(" ")}
        >
          <button
            title={[
              abyssMutator ? `Anomalia: ${abyssMutator.name}${abyssMutator.bossClause && enemy.isBoss ? ` · ${abyssMutator.bossClause}` : ""}` : "",
              bossDepthSummary ? `Eco Abisal: ${bossDepthSummary}` : "",
              enemy.familyName ? `${enemy.familyName}: ${enemy.familyTraitName || "Sin rasgo visible"}` : enemy.familyTraitName || "Sin rasgo visible",
              ...(enemy.monsterAffixes || []).map(affix => `${affix.name}: ${affix.description}`),
              ...(enemy.mechanics || []).map(mechanic => `${mechanic.name}: ${mechanic.description}`),
            ].filter(Boolean).join("\n")}
            className="combat-encounter-intel__enemy-name"
          >
            {enemy.isBoss ? "BOSS " : ""}
            {enemy.name.toUpperCase()}
          </button>
          {enemyLegendaryDrops.length > 0 && (
            <div className="combat-encounter-intel__legendary-summary">
              {missingEnemyPowers.length > 0 ? (
                <FlBadge variant="pill" tone="arcane" size="xs">
                  Power faltante: {missingEnemyPowers.map(drop => drop.power?.name || drop.name).slice(0, 2).join(" / ")}
                </FlBadge>
              ) : knownEnemyPowers.length > 0 ? (
                <FlBadge variant="pill" tone="success" size="xs">
                  Power conocido: {knownEnemyPowers.map(drop => drop.power?.name || drop.name).slice(0, 2).join(" / ")}
                </FlBadge>
              ) : null}
            </div>
          )}
          {(enemyIntelChips.length > 0 || abyssMutator || bossDepthSummary || enemyIdentityLabel) && (
            <FlPanel
              variant="compact"
              className="combat-encounter-intel__panel"
              header={(
                <FlPanelHeader
                  title="INTEL ENEMIGO"
                  subtitle={enemy.isBoss ? "Analisis de boss" : "Analisis del objetivo"}
                  copy="Seccion tactica de afijos, mecanicas y mutaciones activas para esta run."
                  primaryAction={(
                    <FlButton
                      variant="secondary"
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        togglePanel("enemyIntel");
                      }}
                      className="combat-encounter-intel__toggle"
                    >
                      {isPanelCollapsed("enemyIntel") ? "VER INTEL" : "OCULTAR INTEL"}
                    </FlButton>
                  )}
                />
              )}
            >
              <div className="combat-encounter-intel__meta">
                {enemyIdentityLabel && (
                  <FlBadge variant="pill" tone="neutral" size="xs">
                    {enemyIdentityLabel}
                  </FlBadge>
                )}
                {abyssMutator && (
                  <FlBadge variant="pill" tone="arcane" size="xs">
                    {`Abismo ${enemy.abyssDepth} · ${abyssMutator.name}`}
                  </FlBadge>
                )}
                {bossDepthSummary && (
                  <FlBadge variant="pill" tone="warning" size="xs">
                    {bossDepthSummary}
                  </FlBadge>
                )}
                {(enemyIntelChips || []).map(chip => (
                  <FlTag key={chip.id} size="xs" tone="defense">
                    {chip.label}
                  </FlTag>
                ))}
              </div>

              {!isPanelCollapsed("enemyIntel") && (
                <div className="combat-encounter-intel__sections">
                  {abyssMutator && (
                    <div className="combat-encounter-intel__section">
                      <div className="combat-encounter-intel__section-title">Anomalia del Ciclo</div>
                      <div className="combat-encounter-intel__entry">
                        <div className="combat-encounter-intel__entry-label">{abyssMutator.name}</div>
                        <div className="combat-encounter-intel__entry-description">{abyssMutator.description}</div>
                        {enemy.isBoss && abyssMutator.bossClause && (
                          <div className="combat-encounter-intel__entry-description combat-encounter-intel__entry-description--accent">
                            {abyssMutator.bossClause}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {bossDepthSummary && (
                    <div className="combat-encounter-intel__section">
                      <div className="combat-encounter-intel__section-title">Eco Abisal</div>
                      <div className="combat-encounter-intel__entry">
                        <div className="combat-encounter-intel__entry-label">{bossDepthSummary}</div>
                        <div className="combat-encounter-intel__entry-description">
                          Mejoras seeded del boss para esta run. Se mantienen fijas hasta el proximo prestige.
                        </div>
                      </div>
                    </div>
                  )}
                  {(enemy.monsterAffixes || []).length > 0 && (
                    <div className="combat-encounter-intel__section">
                      <div className="combat-encounter-intel__section-title">Afijos</div>
                      <div className="combat-encounter-intel__list">
                        {(enemy.monsterAffixes || []).map(affix => {
                          const sourceMeta = getIntelSourceMeta(affix.id, depthAffixIds, mutatorAffixIds);
                          return (
                            <div key={`affix-${affix.id || affix.name}`} className="combat-encounter-intel__entry">
                              <div className="combat-encounter-intel__entry-head">
                                <div className="combat-encounter-intel__entry-label">{affix.name}</div>
                                <FlBadge variant="pill" tone={sourceMeta.tone} size="xs">
                                  {sourceMeta.label}
                                </FlBadge>
                              </div>
                              {affix.description && (
                                <div className="combat-encounter-intel__entry-description">{affix.description}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {(enemy.mechanics || []).length > 0 && (
                    <div className="combat-encounter-intel__section">
                      <div className="combat-encounter-intel__section-title">Mecanicas</div>
                      <div className="combat-encounter-intel__list">
                        {(enemy.mechanics || []).map(mechanic => {
                          const sourceMeta = getIntelSourceMeta(mechanic.id, depthMechanicIds, mutatorMechanicIds);
                          return (
                            <div key={`mech-${mechanic.id || mechanic.name}`} className="combat-encounter-intel__entry">
                              <div className="combat-encounter-intel__entry-head">
                                <div className="combat-encounter-intel__entry-label">{mechanic.name}</div>
                                <FlBadge variant="pill" tone={sourceMeta.tone} size="xs">
                                  {sourceMeta.label}
                                </FlBadge>
                              </div>
                              {mechanic.description && (
                                <div className="combat-encounter-intel__entry-description">{mechanic.description}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </FlPanel>
          )}
        </div>
        )}
      </section>

      {visibleLootEvent && (
        <div
          {...{ style: {
            position: "fixed",
            bottom: isMobile ? 78 : 22,
            left: "50%",
            transform: "translateX(-50%)",
            width: isMobile ? "calc(100% - 22px)" : "min(560px, calc(100% - 52px))",
            zIndex: 6200,
            pointerEvents: "auto",
          } }}
        >
          <section
            onClick={() => setLootClosing(true)}
            title="Tap para cerrar"
            {...{ style: {
              background:
                visibleLootEvent.rarity === "legendary"
                  ? (isDarkMode
                    ? "linear-gradient(145deg, rgba(180,83,9,0.22) 0%, rgba(194,65,12,0.14) 100%)"
                    : "linear-gradient(145deg, var(--tone-warning-soft, #fff7ed) 0%, #ffedd5 100%)")
                  : visibleLootEvent.rarity === "epic"
                    ? (isDarkMode
                      ? "linear-gradient(145deg, rgba(109,40,217,0.22) 0%, rgba(67,56,202,0.15) 100%)"
                      : "linear-gradient(145deg, var(--tone-violet-soft, #faf5ff) 0%, #ede9fe 100%)")
                    : (isDarkMode
                      ? "linear-gradient(145deg, var(--color-background-secondary, #111a2e) 0%, var(--color-background-tertiary, #162237) 100%)"
                      : "linear-gradient(145deg, var(--tone-neutral-soft, #f8fafc) 0%, var(--tone-accent-soft, #eef2ff) 100%)"),
              border: `2px solid ${getRarityColor(visibleLootEvent.rarity)}`,
              borderRadius: "14px",
              padding: "9px 12px",
              boxShadow:
                visibleLootEvent.rarity === "legendary"
                  ? "0 0 0 2px rgba(245,158,11,0.16), 0 18px 40px rgba(245,158,11,0.26)"
                  : visibleLootEvent.rarity === "epic"
                    ? "0 0 0 2px rgba(124,58,237,0.12), 0 16px 36px rgba(109,40,217,0.2)"
                    : "0 12px 30px var(--color-shadow, rgba(15, 23, 42, 0.14))",
              animation: lootClosing
                ? "lootOverlayExit 220ms ease-in forwards"
                : `${(RARITY_RANK[visibleLootEvent.rarity] || 1) >= 4 ? "lootOverlayPulse 900ms ease-in-out infinite alternate, " : ""}lootOverlayEnter 180ms ease-out`,
              cursor: "pointer",
            } }}
          >
            <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" } }}>
              <div>
                <div {...{ style: { fontSize: "0.52rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary, #64748b)", marginBottom: "2px" } }}>
                  Drop Destacado
                </div>
                <div {...{ style: { fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.15 } }}>
                  {visibleLootEvent.name}
                </div>
              </div>
              <div {...{ style: { fontSize: "0.56rem", color: getRarityColor(visibleLootEvent.rarity), fontWeight: "900", textTransform: "uppercase" } }}>
                {visibleLootEvent.rarity}
              </div>
            </div>
            <div {...{ style: { display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "6px" } }}>
              {(visibleLootEvent.announcedHighlights || []).slice(0, 4).map(highlight => (
                <span key={highlight.id} {...{ style: eventBadgeStyle(highlight.tone, isDarkMode) }}>
                  {highlight.label}
                </span>
              ))}
              {visibleLootEvent.decisionLabel && (
                <span {...{ style: eventBadgeStyle(getLootDecisionBadgeTone(visibleLootEvent.decisionReason), isDarkMode) }}>
                  {visibleLootEvent.decisionLabel}
                </span>
              )}
              {visibleLootEvent.ratingMargin >= 8 && (
                <span {...{ style: eventBadgeStyle("upgrade", isDarkMode) }}>
                  +{Math.round(visibleLootEvent.ratingMargin)} poder
                </span>
              )}
            </div>
            {!!visibleLootEvent.affixSummaries?.length && (
              <div {...{ style: { display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" } }}>
                {visibleLootEvent.affixSummaries.map((affix, index) => {
                  const glyph = getAffixTierGlyph(affix);
                  return (
                    <span key={`${affix.stat}-${index}`} {...{ style: { fontSize: "0.56rem", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "2px 6px", background: "var(--color-background-secondary, #fff)", color: "var(--color-text-secondary, #475569)", fontWeight: "900" } }}>
                      <span {...{ style: { color: glyph.color, marginRight: "4px" } }}>{glyph.symbol}</span>
                      {STAT_LABELS[affix.stat] || affix.stat}
                    </span>
                  );
                })}
              </div>
            )}
            {visibleLootEvent.hasActiveHuntObjectives && visibleLootEvent.wishlistMatches?.length > 0 && (
              <div {...{ style: { marginTop: "6px", fontSize: "0.56rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)" } }}>
                Coincide con tu caza · {visibleLootEvent.wishlistMatches.slice(0, 3).map(stat => STAT_LABELS[stat] || stat).join(", ")}
              </div>
            )}
            {visibleLootEvent.decisionDetail && (
              <div {...{ style: { marginTop: "5px", fontSize: "0.56rem", fontWeight: "800", color: "var(--color-text-secondary, #64748b)" } }}>
                {visibleLootEvent.decisionDetail}
              </div>
            )}
          </section>
        </div>
      )}

      {visibleLevelUpToast && (
        <div
          {...{ style: {
            position: "fixed",
            bottom: levelUpToastBottom,
            left: "50%",
            transform: "translateX(-50%)",
            width: isMobile ? "calc(100% - 34px)" : "min(420px, calc(100% - 56px))",
            zIndex: 4990,
            pointerEvents: "none",
          } }}
        >
          <section
            {...{ style: {
              background: isDarkMode
                ? "linear-gradient(145deg, #1f2c46 0%, #25365b 100%)"
                : "linear-gradient(145deg, #eef2ff 0%, #dbe4ff 100%)",
              border: isDarkMode ? "2px solid rgba(129,140,248,0.42)" : "2px solid rgba(99,102,241,0.38)",
              borderRadius: "14px",
              padding: isMobile ? "9px 12px" : "10px 14px",
              boxShadow: isDarkMode ? "0 10px 24px rgba(15,23,42,0.34)" : "0 12px 28px rgba(79,70,229,0.16)",
              animation: levelUpToastClosing
                ? "levelUpToastExit 240ms ease-in forwards"
                : "levelUpToastEnter 320ms cubic-bezier(0.2,0.9,0.3,1) forwards, levelUpToastPulse 1900ms ease-in-out 360ms infinite",
            } }}
          >
            <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" } }}>
              <div>
                <div {...{ style: { fontSize: "0.52rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)", marginBottom: "2px" } }}>
                  Progreso
                </div>
                <div {...{ style: { fontSize: isMobile ? "0.84rem" : "0.9rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.1 } }}>
                  ¡Subiste de nivel!
                </div>
              </div>
              <div
                {...{ style: {
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "999px",
                  padding: "3px 8px",
                  border: isDarkMode ? "1px solid rgba(129,140,248,0.48)" : "1px solid rgba(99,102,241,0.28)",
                  background: isDarkMode ? "var(--color-background-tertiary, #162237)" : "var(--color-background-secondary, #ffffff)",
                  color: isDarkMode ? "var(--tone-accent-soft, #c7d2fe)" : "var(--tone-accent, #4338ca)",
                  fontSize: "0.62rem",
                  fontWeight: "900",
                } }}
              >
                Nivel {visibleLevelUpToast.to}
              </div>
            </div>
            <div {...{ style: { marginTop: "6px", fontSize: "0.62rem", fontWeight: "800", color: "var(--color-text-secondary, #475569)" } }}>
              {visibleLevelUpToast.from} → {visibleLevelUpToast.to}
            </div>
          </section>
        </div>
      )}

      {!forgeCombatEnabled && (
      <section
        {...{ style: {
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          background: "var(--color-background-secondary, #fff)",
          padding: "10px",
          borderRadius: "16px",
          border: "1px solid var(--color-border-primary, #e2e8f0)",
          position: "relative",
          overflow: "visible",
        } }}
        className="combat-vital-panel"
      >
        <div>
          <div {...{ style: hpLabelStyle }}>
            <span {...{ style: { display: "inline-flex", gap: "6px", alignItems: "center", flexWrap: "wrap" } }}>
              <span>ENEMIGO</span>
              {inEnemyFinishZone && (
                <span
                  {...{ style: {
                    fontSize: "0.56rem",
                    fontWeight: "900",
                    borderRadius: "999px",
                    padding: "2px 7px",
                    background: "var(--tone-warning-soft, #fff7ed)",
                    color: "var(--tone-warning-strong, #c2410c)",
                    border: "1px solid rgba(245,158,11,0.26)",
                    animation: "combatFinishZonePulse 1900ms ease-in-out infinite",
                  } }}
                >
                  Zona de cierre
                </span>
              )}
              {showCritStreak && (
                <span
                  key={`crit-streak-${critStreak.pulseAt}`}
                  {...{ style: {
                    fontSize: "0.56rem",
                    fontWeight: "900",
                    borderRadius: "999px",
                    padding: "2px 7px",
                    background: "var(--tone-warning-soft, #fff7ed)",
                    color: "var(--tone-warning-strong, #c2410c)",
                    border: "1px solid rgba(245,158,11,0.26)",
                    boxShadow: "0 0 10px rgba(245,158,11,0.2)",
                    opacity: 0.45 + (0.55 * critStreakFade),
                    animation: "combatCritStreakPop 420ms ease-out",
                  } }}
                >
                  Racha critica x{critStreak.count}
                </span>
              )}
            </span>
            <span {...{ style: { display: "inline-flex", alignItems: "center", gap: "6px" } }}>
              {activeBossPhasePing && (
                <span
                  key={`boss-phase-${activeBossPhasePing.threshold}-${activeBossPhasePing.at}`}
                  {...{ style: {
                    fontSize: "0.56rem",
                    fontWeight: "900",
                    borderRadius: "999px",
                    padding: "2px 7px",
                    background: "var(--tone-violet-soft, #f3e8ff)",
                    color: "var(--tone-violet, #6d28d9)",
                    border: "1px solid rgba(124,58,237,0.22)",
                    animation: "combatBossThresholdPop 1250ms ease-out forwards",
                  } }}
                >
                  {activeBossPhasePing.threshold}%
                </span>
              )}
              <span>
                {Math.ceil(enemy.hp).toLocaleString()} HP
                {showWeeklySegmentBars ? ` · ${weeklyBarsRemaining}/${weeklySegmentCount} barras` : ""}
              </span>
            </span>
          </div>
          <div className="combat-hp-bar combat-hp-bar--enemy" {...{ style: { ...barContainerStyle, position: "relative" } }}>
            <div
              {...{ style: {
                position: "absolute",
                left: `${ENEMY_FINISH_ZONE_PCT}%`,
                top: 0,
                bottom: 0,
                width: "1px",
                background: "rgba(245,158,11,0.4)",
                zIndex: 1,
                pointerEvents: "none",
              } }}
            />
            <div
              {...{ style: {
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${ENEMY_FINISH_ZONE_PCT}%`,
                background: "linear-gradient(90deg, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0.06) 100%)",
                opacity: inEnemyFinishZone ? 0.74 : 0.22,
                transition: "opacity 220ms ease-out",
                pointerEvents: "none",
              } }}
            />
            <div
              className="combat-hp-fill combat-hp-fill--enemy"
              {...{ style: {
                width: `${enemyHpPct}%`,
                height: "100%",
                background: "var(--tone-danger, #ef4444)",
                transition: "width 0.2s ease-out",
                boxShadow: inEnemyFinishZone ? "0 0 8px rgba(239,68,68,0.2)" : "none",
                animation: inEnemyFinishZone ? "combatFinishZonePulse 1900ms ease-in-out infinite" : "none",
                position: "relative",
                zIndex: 2,
              } }}
            />
          </div>
          {showWeeklySegmentBars && (
            <div {...{ style: { display: "grid", gap: "4px", marginTop: "6px" } }}>
              {weeklySegments.map(segment => (
                <div key={segment.id} {...{ style: { display: "grid", gap: "2px" } }}>
                  <div {...{ style: { display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "0.52rem", fontWeight: "900", color: segment.cleared ? "var(--color-text-tertiary, #94a3b8)" : "var(--tone-danger, #ef4444)" } }}>
                    <span>{segment.label}</span>
                    <span>{Math.round(segment.pct)}%</span>
                  </div>
                  <div {...{ style: { width: "100%", height: "4px", borderRadius: "999px", overflow: "hidden", background: "var(--color-background-tertiary, #f1f5f9)", border: "1px solid var(--color-border-primary, #e2e8f0)" } }}>
                    <div
                      {...{ style: {
                        width: `${segment.pct}%`,
                        height: "100%",
                        background: segment.cleared ? "var(--color-text-tertiary, #94a3b8)" : "var(--tone-danger, #ef4444)",
                        transition: "width 0.2s ease-out",
                      } }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <InlineStatusTray statuses={enemyStatusPills} emptyLabel="Sin estados" isMobile={isMobile} />
        </div>
        <div>
          <div {...{ style: hpLabelStyle }}>
            <span>HEROE</span>
            <span>
              {Math.ceil(player.hp).toLocaleString()} / {player.maxHp}
            </span>
          </div>
          <div className="combat-hp-bar combat-hp-bar--hero" {...{ style: barContainerStyle }}>
            <div
              className="combat-hp-fill combat-hp-fill--hero"
              {...{ style: {
                width: `${playerHpPct}%`,
                height: "100%",
                background: getHpColor(playerHpPct),
                transition: "all 0.3s ease",
              } }}
            />
          </div>
          <InlineStatusTray statuses={playerStatusPills} emptyLabel="Sin estados" isMobile={isMobile} />
        </div>
        {combatDamageFloatEvents.length > 0 && (
          <div {...{ style: { position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 8 } }}>
            {combatDamageFloatEvents.map((event, index) => (
              <div key={event.id || `${event.kind}-${index}`} {...{ style: getCombatFloatStyle(event, index) }}>
                {event.kind === "heal"
                  ? `+${Math.floor(event.value || 0).toLocaleString()} HP`
                  : `-${Math.floor(event.value || 0).toLocaleString()}`}
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {!forgeCombatEnabled && (
      <section
        {...{ style: {
          background: "var(--color-background-secondary, #fff)",
          padding: "8px 10px",
          borderRadius: "14px",
          border: "1px solid var(--color-border-primary, #e2e8f0)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        } }}
        className="combat-player-panel"
      >
        <div {...{ style: { textAlign: "center", borderRight: "1px solid var(--color-border-secondary, #f1f5f9)", paddingRight: "12px" } }}>
          <div {...{ style: { fontSize: "1.4rem" } }}>{CLASS_ICONS[player.class] || "CL"}</div>
          <div {...{ style: { fontSize: 9, fontWeight: "900", color: COLORS.common, textTransform: "uppercase" } }}>
            {player.class || "Sin Clase"}
          </div>
        </div>

        <div {...{ style: { flex: 1 } }}>
          <div {...{ style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 } }}>
            <span {...{ style: { fontSize: 14, fontWeight: "900", color: COLORS.dark } }}>Nivel {player.level}</span>
            <span {...{ style: { fontSize: 10, fontWeight: "bold", color: COLORS.boss } }}>{Math.floor(xpPct)}%</span>
          </div>
          <div {...{ style: { position: "relative" } }}>
            <div
              className="combat-hp-bar combat-hp-bar--xp"
              {...{ style: {
                ...barContainerStyle,
                height: 8,
                boxShadow: levelUpFlash ? "0 0 0 2px rgba(99,102,241,0.28), 0 0 18px rgba(99,102,241,0.34)" : "none",
              } }}
            >
              <div className="combat-hp-fill combat-hp-fill--xp" {...{ style: { width: `${xpPct}%`, height: "100%", background: "var(--tone-accent, #534AB7)", transition: "width 0.5s ease-out" } }} />
            </div>
            {levelUpFlash && (
              <span
                key={`ding-ring-${levelUpFlash.at}`}
                aria-hidden="true"
                {...{ style: {
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "14px",
                  height: "14px",
                  borderRadius: "999px",
                  border: isDarkMode ? "2px solid rgba(167,139,250,0.72)" : "2px solid rgba(99,102,241,0.58)",
                  pointerEvents: "none",
                  transform: "translate(-50%, -50%)",
                  animation: "levelUpDingRing 860ms ease-out 1",
                } }}
              />
            )}
            {combatXpFloatEvents.length > 0 && (
              <div {...{ style: { position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 9 } }}>
                {combatXpFloatEvents.map((event, index) => (
                  <div key={event.id || `xp-${index}`} {...{ style: getCombatFloatStyle(event, index) }}>
                    +{Math.floor(event.value || 0).toLocaleString()} XP
                  </div>
                ))}
              </div>
            )}
            {levelUpFlash && (
              <div
                {...{ style: {
                  position: "absolute",
                  left: "50%",
                  top: -6,
                  fontSize: "0.74rem",
                  fontWeight: "900",
                  color: isDarkMode ? "var(--tone-accent, #c7d2fe)" : "var(--tone-accent, #4f46e5)",
                  background: isDarkMode ? "rgba(28,43,77,0.94)" : "rgba(237,233,254,0.88)",
                  border: isDarkMode ? "1px solid rgba(129,140,248,0.34)" : "1px solid rgba(99,102,241,0.28)",
                  borderRadius: "999px",
                  padding: "2px 8px",
                  pointerEvents: "none",
                  animation: "levelUpFloat 2000ms ease-out forwards",
                  textShadow: isDarkMode ? "0 1px 10px rgba(129,140,248,0.34)" : "0 1px 8px rgba(99,102,241,0.24)",
                } }}
              >
                +1 NIVEL
              </div>
            )}
          </div>
          <div {...{ style: { fontSize: 9, color: COLORS.common, marginTop: 4, fontWeight: "bold", textAlign: "right" } }}>
            XP: {Math.floor(player.xp).toLocaleString()} / {xpNeeded.toLocaleString()}
          </div>
        </div>
      </section>
      )}

      <FlPanel variant="compact" className="combat-stat-module fl-stat-module">
        <div className="combat-stat-module__row">
          <StatCard
            label="Dano"
            value={effectiveDamageInCombat}
            hint={effectiveDamageInCombat !== baseStats.damage ? `Base ${baseStats.damage}` : null}
          />
          <StatCard
            label="Defensa"
            value={effectiveDefenseInCombat}
            hint={effectiveDefenseInCombat !== baseStats.defense ? `Base ${baseStats.defense}` : null}
          />
          <StatCard
            label="Critico"
            value={`${Math.round(effectiveCritChanceInCombat * 100)}%`}
            hint={effectiveCritChanceInCombat !== baseStats.critChance ? `Base ${Math.round(baseStats.critChance * 100)}%` : null}
          />
          <StatCard
            label="Velocidad"
            value={`${Math.round(effectiveAttackSpeedInCombat * 100)}%`}
            hint={effectiveAttackSpeedInCombat !== baseStats.attackSpeed ? `Base ${Math.round(baseStats.attackSpeed * 100)}%` : null}
          />
        </div>
      </FlPanel>

      {showSessionFraming && (
        <FlPanel
          variant="compact"
          className={`combat-session-panel${isSessionDenseMobile ? " combat-session-panel--dense" : ""}`}
          header={(
            <FlPanelHeader
              title="Contrato activo"
              subtitle={featuredExpeditionContract?.title || featuredExpeditionContract?.goal?.name || "Selecciona un contrato"}
            />
          )}
        >

          <div className="fl-panel-meta-row">
            <FlBadge
              variant="pill"
              tone="arcane"
              size={isSessionDenseMobile ? "xs" : "sm"}
            >
              {featuredExpeditionContract?.laneLabel || "Sin contrato"}
            </FlBadge>
            <FlBadge
              variant="pill"
              tone={resolveFlToneFromObjectiveStatus(expeditionStatusMeta.status)}
              size={isSessionDenseMobile ? "xs" : "sm"}
            >
              {expeditionStatusMeta.label}
            </FlBadge>
          </div>

          <div
            className={`combat-session-copy${isSessionDenseMobile ? " combat-session-copy--dense" : ""}`}
          >
            {featuredExpeditionContract
              ? (featuredExpeditionContract.objectiveDescription || featuredExpeditionContract.goal?.hint || featuredExpeditionContract.goal?.description || "Cumple el objetivo antes de extraer para cobrar recursos de Santuario.")
              : "El tablon rota cada 8 horas. Elige uno de los contratos visibles antes de salir."}
          </div>

          {featuredExpeditionContract && (
            <FlProgressBar
              size={isSessionDenseMobile ? "xs" : "sm"}
              type={resolveFlProgressTypeFromObjectiveStatus(expeditionStatusMeta.status)}
              percent={featuredExpeditionContract.progress?.percent || 0}
              showValue={false}
            />
          )}

          <div className="combat-session-footer fl-panel-footer-row">
            <span className={`combat-session-footer__meta${isSessionDenseMobile ? " combat-session-footer__meta--dense" : ""}`}>
              {featuredExpeditionContract
                ? `${Number(featuredExpeditionContract.progress?.current || 0)}/${Number(featuredExpeditionContract.progress?.target || 1)} · ${formatExpeditionContractReward(featuredExpeditionContract.reward || {}) || "Sin recompensa definida."}`
                : "Sin contrato seleccionado."}
            </span>
            <div className="combat-session-footer__actions">
              {canClaimExpeditionContract ? (
                <FlButton
                  onClick={() => dispatch({ type: "CLAIM_EXPEDITION_CONTRACT", contractId: featuredExpeditionContract.id })}
                  variant="success"
                  size={isSessionDenseMobile ? "xs" : "sm"}
                >
                  Reclamar contrato
                </FlButton>
              ) : (
                <FlBadge
                  variant="pill"
                  tone={resolveFlToneFromObjectiveStatus(expeditionStatusMeta.status)}
                  size={isSessionDenseMobile ? "xs" : "sm"}
                >
                  {expeditionStatusMeta.label}
                </FlBadge>
              )}
            </div>
          </div>
        </FlPanel>
      )}

      {showWeeklyLedgerCard && (
        <FlPanel
          variant="compact"
          tone="defense"
          className={`combat-session-panel combat-session-panel--weekly${isSessionDenseMobile ? " combat-session-panel--dense" : ""}`}
          header={(
            <FlPanelHeader
              tone="weekly"
              title="Weekly ledger"
              subtitle={featuredWeeklyContract?.goal?.name || (weeklyAllClaimed ? "Todos los contratos reclamados" : "Sin contrato activo")}
              className={isSessionDenseMobile ? "fl-panel-header-block--dense" : ""}
              actions={showWeeklySelectorArrows ? (
                <div className="combat-weekly-arrows-top">
                  <FlButton
                    onClick={() => cycleWeeklyContract(-1)}
                    variant="secondary"
                    size="xs"
                    className="combat-weekly-arrow combat-weekly-arrow--inline"
                    aria-label="Weekly anterior"
                    title="Weekly anterior"
                  >
                    {"‹"}
                  </FlButton>
                  <FlButton
                    onClick={() => cycleWeeklyContract(1)}
                    variant="secondary"
                    size="xs"
                    className="combat-weekly-arrow combat-weekly-arrow--inline"
                    aria-label="Weekly siguiente"
                    title="Weekly siguiente"
                  >
                    {"›"}
                  </FlButton>
                </div>
              ) : null}
            />
          )}
        >
          <div className="fl-panel-meta-row">
            <FlBadge
              variant="pill"
              tone="arcane"
              size="xs"
            >
              {featuredWeeklyContract?.laneLabel || (weeklyAllClaimed ? "Ledger semanal" : "Contrato semanal")}
            </FlBadge>
            <FlBadge
              variant="pill"
              tone={resolveFlToneFromObjectiveStatus(weeklyStatusMeta.status)}
              size={isSessionDenseMobile ? "xs" : "sm"}
              className="combat-weekly-status"
            >
              {claimableWeeklyContracts.length > 0
                ? `${claimableWeeklyContracts.length} para reclamar`
                : weeklyAllClaimed
                  ? "Weekly completada"
                : `Semana ${state?.weeklyLedger?.weekKey || "-"}`}
            </FlBadge>
          </div>

          <div className={`combat-weekly-index${isSessionDenseMobile ? " combat-weekly-index--dense" : ""}`}>
            {orderedWeeklyContracts.length > 0
              ? `${featuredWeeklyIndex + 1} / ${orderedWeeklyContracts.length}`
              : weeklyAllClaimed
                ? `${claimedWeeklyContracts}/${weeklyTotalContracts} reclamados`
                : "0 / 0"}
          </div>

          <div className={`combat-session-copy${isSessionDenseMobile ? " combat-session-copy--dense" : ""}`}>
            {featuredWeeklyContract
              ? (featuredWeeklyContract.objectiveDescription || featuredWeeklyContract.goal?.hint || featuredWeeklyContract.goal?.description || "Avanza jugando normal; el contrato acumula progreso semanal.")
              : weeklyAllClaimed
                ? "Ledger semanal cerrado: ya reclamaste todos los contratos de esta semana. El proximo set llega en el siguiente reset semanal."
              : "No hay contratos disponibles en este momento. Se refrescan automaticamente por semana."}
          </div>

          {(featuredWeeklyContract || weeklyAllClaimed) && (
            <FlProgressBar
              size={isSessionDenseMobile ? "xs" : "sm"}
              type={resolveFlProgressTypeFromObjectiveStatus(weeklyStatusMeta.status)}
              percent={
                weeklyAllClaimed
                  ? 100
                  : Math.max(0, Math.min(100, Number(featuredWeeklyContract?.progress?.percent || 0)))
              }
              showValue={false}
            />
          )}

          <div className="combat-session-footer fl-panel-footer-row">
            <span className={`combat-session-footer__meta${isSessionDenseMobile ? " combat-session-footer__meta--dense" : ""}`}>
              {featuredWeeklyContract
                ? `${Number(featuredWeeklyContract.progress?.current || 0)}/${Number(featuredWeeklyContract.progress?.target || 1)} · ${formatGoalReward(featuredWeeklyContract.reward || {})}`
                : weeklyAllClaimed
                  ? `${claimedWeeklyContracts}/${weeklyTotalContracts} reclamados · Weekly cerrada`
                : "Sin progreso semanal para mostrar."}
            </span>
            <div className="combat-session-footer__actions">
              <FlButton
                onClick={() => {
                  if (typeof window !== "undefined") {
                    try {
                      window.sessionStorage.setItem(
                        ACCOUNT_SCROLL_TARGET_STORAGE_KEY,
                        ACCOUNT_SCROLL_TARGET_WEEKLY
                      );
                    } catch {
                      // noop: fallback to plain tab change if storage is not available
                    }
                  }
                  dispatch({ type: "SET_TAB", tab: "account" });
                }}
                variant="secondary"
                size={isSessionDenseMobile ? "xs" : "sm"}
              >
                Ver weekly
              </FlButton>
              {featuredWeeklyContract?.progress?.completed && !featuredWeeklyContract?.claimed ? (
                <FlButton
                  onClick={() => dispatch({ type: "CLAIM_WEEKLY_LEDGER_CONTRACT", contractId: featuredWeeklyContract.id })}
                  variant="success"
                  size={isSessionDenseMobile ? "xs" : "sm"}
                >
                  Reclamar weekly
                </FlButton>
              ) : (
                <FlBadge
                  variant="pill"
                  tone={resolveFlToneFromObjectiveStatus(weeklyStatusMeta.status)}
                  size={isSessionDenseMobile ? "xs" : "sm"}
                >
                  {featuredWeeklyContract
                    ? weeklyStatusMeta.label
                    : (weeklyAllClaimed ? "Todo reclamado" : "Sin datos")}
                </FlBadge>
              )}
            </div>
          </div>
        </FlPanel>
      )}

      {showWeeklyBossCard && (
        <FlPanel
          variant="compact"
          tone="danger"
          className={`combat-session-panel combat-session-panel--danger${isSessionDenseMobile ? " combat-session-panel--dense" : ""}`}
          header={(
            <FlPanelHeader
              tone="danger"
              title="Boss semanal"
              subtitle={weeklyBossOverview?.boss?.name || "Sin jefe"}
            />
          )}
        >

          <div className="fl-panel-meta-row fl-panel-meta-row--danger">
            <FlBadge variant="pill" tone="danger" size="xs">
              Ciclo 22h · {weeklyBossOverview?.cycleKey || weeklyBossOverview?.weekKey || "-"}
            </FlBadge>
            <FlBadge variant="pill" tone="defense" size={isSessionDenseMobile ? "xs" : "sm"}>
              {Math.max(0, Number(weeklyBossOverview?.attemptsRemaining || 0))} intento(s) · reset {weeklyBossCycleRemainingLabel}
            </FlBadge>
          </div>

          <div className={`combat-session-copy combat-session-copy--full${isSessionDenseMobile ? " combat-session-copy--dense" : ""}`}>
            {activeWeeklyBossEncounter
              ? `${activeWeeklyBossEncounter.bossName || weeklyBossOverview?.boss?.name || "Boss"} en combate (${activeWeeklyBossEncounter.difficultyLabel || "dificultad"}).`
              : (weeklyBossOverview?.boss?.intro || "Evento cíclico (22h) con mutaciones por dificultad.")}
          </div>

          <div className="combat-weekly-difficulty-grid">
            {weeklyBossDifficulties.map(difficulty => (
              <FlButton
                key={difficulty.id}
                onClick={() => {
                  dispatch({ type: "START_WEEKLY_BOSS_ENCOUNTER", difficultyId: difficulty.id, now: Date.now() });
                  if (typeof window !== "undefined") {
                    window.requestAnimationFrame(() => {
                      const shell = document.querySelector(".app-shell-content");
                      if (shell && typeof shell.scrollTo === "function") {
                        shell.scrollTo({ top: 0, behavior: "smooth" });
                      }
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    });
                  }
                }}
                disabled={!difficulty.canAttempt || difficulty.completed || Boolean(activeWeeklyBossEncounter)}
                variant={
                  activeWeeklyBossEncounter?.difficultyId === difficulty.id
                    ? "danger"
                    : difficulty.completed
                      ? "success"
                      : "secondary"
                }
                size={isSessionDenseMobile ? "xs" : "sm"}
                className="combat-weekly-difficulty-button"
                selected={activeWeeklyBossEncounter?.difficultyId === difficulty.id}
                cost={
                  activeWeeklyBossEncounter?.difficultyId === difficulty.id
                    ? `En curso · ${Math.max(1, Number(activeWeeklyBossEncounter?.segmentCount || 1))} barras`
                    : difficulty.completed
                      ? "Completado"
                      : `${Math.round(Number(difficulty.projectedWinChance || 0) * 100)}% aprox · ${formatGoalReward(difficulty.reward || {})}`
                }
              >
                {difficulty.label}
              </FlButton>
            ))}
          </div>

          {activeWeeklyBossEncounter && (
            <FlTag tone="danger">
              Encuentro activo: {activeWeeklyBossEncounter.bossName || "Boss semanal"} · {activeWeeklyBossEncounter.difficultyLabel || "dificultad"} · {Math.max(1, Number(activeWeeklyBossEncounter.segmentCount || 1))} barras de HP.
            </FlTag>
          )}

          <div className="combat-weekly-boss-mutations">
            {weeklyBossDifficulties
              .map(difficulty => `${difficulty.label}: ${difficulty.mutation}`)
              .join(" · ")}
          </div>
        </FlPanel>
      )}

      {player.class && myTalents.length > 0 && (
        <section className="combat-talents-panel">
          <button onClick={() => togglePanel("talents")} className="combat-collapsible-header">
            <span className="combat-collapsible-header__title">TALENTOS</span>
            <span className="combat-collapsible-header__state">{isPanelCollapsed("talents") ? `${activeTalentCount} ACTIVOS · ${myTalents.length}` : "OCULTAR"}</span>
          </button>
          {!isPanelCollapsed("talents") && (
            <div className="combat-talents-panel__list">
              {myTalents.map(talent => {
                const activeState = activeTalentEffects.get(talent.id);
                const progress = getTriggerProgress(talent, triggerCounters);
                const isJustTriggered = showActivated[talent.id];
                const icon = TALENT_ICONS[talent.classId] || "TL";

                return (
                  <div key={talent.id} className="combat-talents-panel__item">
                    <div className="combat-talents-panel__item-head">
                      <span className="combat-talents-panel__name">
                        {icon} {talent.name}{" "}
                        <span className="combat-talents-panel__desc">{talent.description}</span>
                      </span>
                      {activeState ? (
                        <div className="combat-talents-panel__active-pill">
                          <span>ACTIVO</span>
                          {activeState.stacks > 1 && <span>x{activeState.stacks}</span>}
                          {activeState.maxDuration != null && <span>{activeState.maxDuration}s</span>}
                        </div>
                      ) : null}
                    </div>

                    {progress && (
                      <div className="combat-talents-panel__progress-row">
                        <div className="combat-talents-panel__progress-track">
                          <div
                            className="combat-talents-panel__progress-fill"
                            {...{ style: {
                              width: `${isJustTriggered ? 100 : progress.percent}%`,
                              background: isJustTriggered ? COLORS.success : "var(--tone-accent, #534AB7)",
                            } }}
                          />
                        </div>
                        <span className="combat-talents-panel__progress-label" {...{ style: { color: isJustTriggered ? COLORS.success : COLORS.common } }}>
                          {isJustTriggered ? "ACTIVADO" : `${progress.current} / ${progress.target} ${progress.label}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <FlPanel
        variant="compact"
        className={`combat-log-panel${isSessionDenseMobile ? " combat-session-panel--dense" : ""}`}
      >
        <button onClick={() => togglePanel("log")} className="combat-collapsible-header">
          <span className="combat-collapsible-header__title">REGISTRO DE COMBATE</span>
          <span className="combat-collapsible-header__state">{isPanelCollapsed("log") ? "VER" : "OCULTAR"}</span>
        </button>
        {!isPanelCollapsed("log") && (
          <>
            <div className="combat-log-toolbar">
              <span className="combat-log-toolbar__eyebrow">
                Ultimos eventos
              </span>
              <div className="combat-log-toolbar__actions">
                <FlButton
                  onClick={() => setLogExpanded(current => !current)}
                  variant="secondary"
                  size={isMobile ? "xs" : "sm"}
                  className="combat-log-action"
                >
                  {logExpanded ? "VER MENOS" : "VER MAS"}
                </FlButton>
                <FlButton
                  onClick={() => logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" })}
                  variant="secondary"
                  size={isMobile ? "xs" : "sm"}
                  className="combat-log-action"
                >
                  RECIENTE
                </FlButton>
              </div>
            </div>
            <div
              ref={logRef}
              className="combat-log-list"
              {...{ style: {
                "--combat-log-max-height": `${logExpanded ? (isMobile ? 210 : 260) : (isMobile ? 94 : 112)}px`,
              } }}
            >
              {(logExpanded ? combat.log.slice(-30) : combat.log.slice(-3)).map((line, index) => (
                <p
                  key={index}
                  className={`combat-log-line combat-log-line--${getLogEntryTone(line)}`}
                >
                  <span className="combat-log-line__prompt">{">"}</span>
                  {line}
                </p>
              ))}
            </div>
          </>
        )}
      </FlPanel>

      <button
        className="combat-reset-progress"
        onClick={() => {
          if (confirm("Borrar todo?")) {
            dispatch({ type: "RESET_ALL_PROGRESS" });
          }
        }}
      >
        REINICIAR PROGRESO
      </button>
    </div>
  );
}

const hpLabelStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 10,
  marginBottom: 4,
  fontWeight: "900",
};

const barContainerStyle = {
  height: 10,
  background: "var(--color-background-tertiary, #f1f5f9)",
  borderRadius: "5px",
  overflow: "hidden",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
};

function getCombatFloatStyle(event = {}, index = 0) {
  const isHeal = event.kind === "heal";
  const isThornsDamage = event.kind === "thornsDamage";
  const isXp = event.kind === "xp";
  const laneKey = `${event.id || ""}:${event.kind || ""}:${event.source || ""}:${event.value || 0}`;
  let laneHash = 0;
  for (let i = 0; i < laneKey.length; i += 1) {
    laneHash = (laneHash + laneKey.charCodeAt(i)) % 997;
  }
  const laneIndex = laneKey ? laneHash % 3 : index % 3;
  const laneOffset = (laneIndex - 1) * 12;
  const left = isXp
    ? `calc(52% + ${laneOffset}px)`
    : isHeal
    ? `calc(68% + ${laneOffset}px)`
    : isThornsDamage
      ? `calc(58% + ${laneOffset}px)`
      : `calc(50% + ${laneOffset}px)`;
  const zIndex = isXp ? 10 : isHeal ? 9 : isThornsDamage ? 11 : 12;

  return {
    position: "absolute",
    left,
    top: isXp ? "-12px" : isHeal ? "58%" : isThornsDamage ? "31%" : "24%",
    transform: "translate(-50%, 0)",
    fontSize: isXp ? "0.84rem" : event.crit ? "1.08rem" : "0.94rem",
    fontWeight: "900",
    color: isXp ? "var(--tone-accent, #4f46e5)" : isHeal ? "var(--tone-success, #16a34a)" : event.crit ? "var(--tone-warning, #f59e0b)" : isThornsDamage ? "var(--tone-danger-strong, #dc2626)" : "var(--tone-danger, #ef4444)",
    textShadow: event.crit
      ? "0 0 12px rgba(245,158,11,0.45)"
      : isXp
        ? "0 0 10px rgba(99,102,241,0.28)"
      : isHeal
        ? "0 0 10px rgba(34,197,94,0.3)"
        : isThornsDamage
          ? "0 0 10px rgba(220,38,38,0.36)"
          : "0 0 10px rgba(239,68,68,0.36)",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    letterSpacing: "0.01em",
    zIndex,
    animation: isXp
      ? "combatFloatXp 960ms ease-out forwards"
      : isHeal
      ? "combatFloatHeal 1020ms ease-out forwards"
      : event.crit
        ? "combatFloatCrit 1080ms ease-out forwards"
        : "combatFloatDamage 980ms ease-out forwards",
  };
}

function CombatForgeTierTrack({
  currentTier,
  maxTier,
  zoneLabel,
  progressPct,
  nodes = [],
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  showAuto,
  autoAdvance,
  spotlightAutoAdvance,
  onToggleAuto,
  title,
}) {
  const clampedProgressPct = Math.max(0, Math.min(100, Number(progressPct || 0)));
  return (
    <section className="combat-forge-tier" title={title}>
      <FlButton
        className="combat-forge-tier__nav"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        variant="secondary"
        size="xs"
        aria-label="Tier anterior"
      >
        {"<"}
      </FlButton>
      <div className="combat-forge-tier__center">
        <div className="combat-forge-tier__title">TIER {currentTier}</div>
        <div className="combat-forge-tier__zone">{zoneLabel}</div>
        <div
          className="combat-forge-tier__track"
          {...{ style: {
            "--combat-tier-progress": `${clampedProgressPct}%`,
            "--combat-tier-progress-ratio": clampedProgressPct / 100,
          } }}
          aria-label={`Tier ${currentTier} de ${maxTier}`}
        >
          <span className="combat-forge-tier__rail" aria-hidden="true" />
          <span className="combat-forge-tier__fill" aria-hidden="true" />
          {nodes.map(node => (
            <span
              key={node.id}
              className={[
                "combat-forge-tier__node",
                node.active ? "is-active" : "",
                node.current ? "is-current" : "",
                node.boss ? "is-boss" : "",
              ].filter(Boolean).join(" ")}
              aria-hidden="true"
            >
              {node.boss ? <ForgeIcon name="skull" size={11} /> : <span />}
            </span>
          ))}
        </div>
      </div>
      <FlButton
        className="combat-forge-tier__nav"
        onClick={onNext}
        disabled={!canGoNext}
        variant="secondary"
        size="xs"
        aria-label="Tier siguiente"
      >
        {">"}
      </FlButton>
      {showAuto && (
        <FlSwitch
          checked={autoAdvance}
          onChange={onToggleAuto}
          label="Auto"
          size="sm"
          variant="rect"
          className={[
            "combat-forge-tier__switch",
            spotlightAutoAdvance ? "is-spotlighted" : "",
          ].filter(Boolean).join(" ")}
          data-onboarding-target={spotlightAutoAdvance ? "auto-advance" : undefined}
          ariaLabel={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
        />
      )}
    </section>
  );
}

function CombatForgeHpBar({
  variant = "enemy",
  iconName = null,
  pct = 0,
  trailPct = 0,
  currentLabel,
  percentLabel,
  flashKey = 0,
  finishZonePct = null,
  inFinishZone = false,
  extraLabel = "",
  compact = false,
}) {
  const clampedPct = Math.max(0, Math.min(100, Number(pct || 0)));
  const clampedTrail = Math.max(clampedPct, Math.min(100, Number(trailPct || clampedPct)));
  return (
    <div
      className={[
        "combat-forge-hpbar",
        `combat-forge-hpbar--${variant}`,
        compact ? "combat-forge-hpbar--compact" : "",
        inFinishZone ? "is-finish-zone" : "",
      ].filter(Boolean).join(" ")}
      title={extraLabel ? `${currentLabel} - ${percentLabel} - ${extraLabel}` : `${currentLabel} - ${percentLabel}`}
      {...{ style: {
        "--combat-hp-pct": `${clampedPct}%`,
        "--combat-hp-trail-pct": `${clampedTrail}%`,
        "--combat-finish-zone-pct": `${Math.max(0, Math.min(100, Number(finishZonePct || 0)))}%`,
      } }}
    >
      {iconName && (
        <div className="combat-forge-hpbar__icon" aria-hidden="true">
          <ForgeIcon name={iconName} size={compact ? 18 : 24} />
        </div>
      )}
      <div className="combat-forge-hpbar__body">
        <div className="combat-forge-hpbar__track">
          {finishZonePct != null && <span className="combat-forge-hpbar__finish-zone" aria-hidden="true" />}
          <span className="combat-forge-hpbar__trail" aria-hidden="true" />
          <span key={flashKey} className="combat-forge-hpbar__fill" aria-hidden="true" />
          <span className="combat-forge-hpbar__label combat-forge-hpbar__label--center">{currentLabel}</span>
          <span className="combat-forge-hpbar__label combat-forge-hpbar__label--right">
            {percentLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function CombatForgeResourceBar({ label, valueLabel, percentLabel, pct = 0 }) {
  const clampedPct = Math.max(0, Math.min(100, Number(pct || 0)));
  return (
    <div
      className="combat-forge-resourcebar"
      title={`${label}: ${valueLabel} - ${percentLabel}`}
      {...{ style: { "--combat-resource-pct": `${clampedPct}%` } }}
    >
      <div className="combat-forge-resourcebar__track">
        <span className="combat-forge-resourcebar__fill" aria-hidden="true" />
        <span className="combat-forge-resourcebar__label combat-forge-resourcebar__label--left">{label}</span>
        <span className="combat-forge-resourcebar__label combat-forge-resourcebar__label--center">{valueLabel}</span>
        <span className="combat-forge-resourcebar__label combat-forge-resourcebar__label--right">{percentLabel}</span>
      </div>
    </div>
  );
}

function CombatForgeSideActions({ actions = [] }) {
  const visibleActions = actions.filter(Boolean);
  if (visibleActions.length <= 0) return null;

  return (
    <div className="combat-forge-side-actions" aria-label="Accesos de expedicion">
      {visibleActions.map(action => {
        const disabled = Boolean(action.disabled);
        return (
          <FlSideAction
            key={action.id}
            className={[
              "combat-forge-side-action",
              disabled ? "is-disabled" : "",
              action.spotlight ? "is-spotlighted" : "",
            ].filter(Boolean).join(" ")}
            size="xs"
            variant={action.spotlight ? "primary" : "default"}
            icon={action.icon || "more"}
            label={action.label}
            badge={action.badge}
            onClick={() => {
              if (disabled) return;
              action.onSelect?.(action.id, action);
            }}
            disabled={disabled}
            title={action.label}
            aria-label={action.label}
            data-onboarding-target={action.onboardingTarget}
          />
        );
      })}
    </div>
  );
}

function CombatFloatingText({ event = {}, index = 0 }) {
  const isHeal = event.kind === "heal";
  const isCrit = Boolean(event.crit);
  const sourceLabel = getCombatFloatSourceLabel(event);
  const valueLabel = isHeal
    ? `+${Math.floor(event.value || 0).toLocaleString()} HP`
    : `-${Math.floor(event.value || 0).toLocaleString()}`;

  return (
    <div
      className={[
        "combat-floating-text",
        isHeal ? "combat-floating-text--heal" : "",
        isCrit ? "combat-floating-text--crit" : "",
        event.source ? `combat-floating-text--${event.source}` : "",
      ].filter(Boolean).join(" ")}
      {...{ style: getCombatFloatStyle(event, index) }}
    >
      {isCrit && <span className="combat-floating-text__label">CRITICO!</span>}
      <span className="combat-floating-text__value">{valueLabel}</span>
      {sourceLabel && <span className="combat-floating-text__source">{sourceLabel}</span>}
    </div>
  );
}

const COMBAT_STATUS_ICON_MAP = {
  "absolute-control": "mark",
  bleed: "bleed",
  "combat-flow": "repeat",
  flow: "repeat",
  fortress: "armor",
  fracture: "fracture",
  mark: "mark",
  memory: "essence",
  momentum: "upgrade",
  "perfect-cast": "essence",
  poison: "poison",
  rage: "fire",
  ramp: "upgrade",
  "time-loop": "repeat",
  volatile: "essence",
  "void-fracture": "fracture",
};

function CombatStatusIconTray({ statuses = [], compact = false, reserveSpace = false }) {
  if (!Array.isArray(statuses) || statuses.length <= 0) {
    if (!reserveSpace) return null;
    return (
      <div
        className={[
          "combat-forge-status-icons",
          compact ? "combat-forge-status-icons--compact" : "",
          "is-empty",
        ].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
        <span className="combat-forge-status-icon" />
      </div>
    );
  }
  return (
    <div
      className={[
        "combat-forge-status-icons",
        compact ? "combat-forge-status-icons--compact" : "",
      ].filter(Boolean).join(" ")}
    >
      {statuses.slice(0, compact ? 4 : 6).map(status => {
        const iconName = COMBAT_STATUS_ICON_MAP[status.id] || getIconNameForStatusTone(status.tone);
        return (
          <span
            key={status.id}
            className={[
              "combat-forge-status-icon",
              `combat-forge-status-icon--${status.tone || "common"}`,
            ].join(" ")}
            title={status.description ? `${status.label}: ${status.description}${status.detail ? `\n${status.detail}` : ""}` : status.label}
          >
            <ForgeIcon name={iconName} size={compact ? 16 : 19} />
            {status.value && <span>{formatStatusIconValue(status.value)}</span>}
          </span>
        );
      })}
    </div>
  );
}

function getIconNameForStatusTone(tone = "common") {
  switch (tone) {
    case "danger":
      return "fire";
    case "success":
      return "upgrade";
    case "warning":
      return "fracture";
    case "boss":
      return "essence";
    case "info":
      return "mark";
    default:
      return "hero";
  }
}

function getCombatFloatSourceLabel(event = {}) {
  if (event.kind === "thornsDamage") return "ESPINAS";
  switch (event.source) {
    case "bleed":
      return "SANGRADO";
    case "void":
      return "VACIO";
    case "regen":
      return "REGEN";
    case "lifesteal":
      return "DRENAJE";
    default:
      return "";
  }
}

function formatStatusIconValue(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  const stackMatch = text.match(/^x(\d+)/i);
  if (stackMatch) return stackMatch[1];
  const numberMatch = text.match(/^(\d+)/);
  if (numberMatch) return numberMatch[1];
  return text.length > 4 ? text.slice(0, 4) : text;
}

function eventBadgeStyle(tone, isDarkMode = false) {
  const palette = isDarkMode
    ? {
        legendary: { bg: "rgba(194,65,12,0.2)", color: "var(--tone-warning, #fdba74)", border: "rgba(251,146,60,0.45)" },
        epic: { bg: "rgba(124,58,237,0.2)", color: "var(--tone-violet, #c4b5fd)", border: "rgba(167,139,250,0.45)" },
        perfect: { bg: "rgba(161,98,7,0.2)", color: "var(--tone-warning, #fde68a)", border: "rgba(250,204,21,0.4)" },
        t1: { bg: "rgba(37,99,235,0.2)", color: "var(--tone-info, #93c5fd)", border: "rgba(96,165,250,0.45)" },
        upgrade: { bg: "rgba(4,120,87,0.22)", color: "var(--tone-success, #6ee7b7)", border: "rgba(16,185,129,0.42)" },
        build: { bg: "rgba(3,105,161,0.22)", color: "var(--tone-info, #7dd3fc)", border: "rgba(56,189,248,0.4)" },
        offense: { bg: "rgba(190,24,93,0.2)", color: "var(--tone-danger, #fda4af)", border: "rgba(244,114,182,0.42)" },
        wishlist: { bg: "rgba(13,148,136,0.22)", color: "var(--tone-success, #5eead4)", border: "rgba(45,212,191,0.42)" },
        hunt: { bg: "rgba(13,148,136,0.22)", color: "var(--tone-success, #5eead4)", border: "rgba(45,212,191,0.42)" },
      }
    : {
        legendary: { bg: "var(--tone-warning-soft, #fff8f1)", color: "var(--tone-danger, #9a3412)", border: "var(--tone-warning, #fed7aa)" },
        epic: { bg: "var(--tone-violet-soft, #faf6ff)", color: "var(--tone-violet, #6d28d9)", border: "var(--tone-violet, #ddd6fe)" },
        perfect: { bg: "var(--tone-warning-soft, #fffceb)", color: "#92400e", border: "var(--tone-warning, #fde68a)" },
        t1: { bg: "var(--tone-info-soft, #f5f9ff)", color: "var(--tone-info, #1e40af)", border: "var(--tone-info, #bfdbfe)" },
        upgrade: { bg: "var(--tone-success-soft, #f0fdf7)", color: "var(--tone-success-strong, #065f46)", border: "var(--tone-success, #bbf7d0)" },
        build: { bg: "var(--tone-info-soft, #f0f9ff)", color: "var(--tone-info, #075985)", border: "var(--tone-info, #bae6fd)" },
        offense: { bg: "var(--tone-danger-soft, #fff5f7)", color: "var(--tone-danger-strong, #9f1239)", border: "var(--tone-danger, #fecdd3)" },
        wishlist: { bg: "var(--tone-success-soft, #f0fdfa)", color: "var(--tone-success-strong, #115e59)", border: "var(--tone-success, #99f6e4)" },
        hunt: { bg: "var(--tone-success-soft, #f0fdfa)", color: "var(--tone-success-strong, #115e59)", border: "var(--tone-success, #99f6e4)" },
      };
  const selected = palette[tone] || (isDarkMode
    ? { bg: "rgba(148,163,184,0.16)", color: "var(--color-text-tertiary, #cbd5e1)", border: "rgba(148,163,184,0.35)" }
    : { bg: "var(--tone-neutral-soft, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "var(--color-border-tertiary, #cbd5e1)" });
  return {
    fontSize: "0.58rem",
    fontWeight: "900",
    color: selected.color,
    background: selected.bg,
    border: `1px solid ${selected.border}`,
    padding: "3px 7px",
    borderRadius: "999px",
  };
}

function getLootDecisionBadgeTone(decisionReason = "") {
  switch (decisionReason) {
    case "protected_hunt":
      return "hunt";
    case "protected_upgrade":
      return "upgrade";
    case "auto_extract":
      return "t1";
    case "auto_sell":
      return "offense";
    default:
      return "build";
  }
}

function StatCard({ label, value, hint = null }) {
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <article className="combat-stat-card">
      <span className="combat-stat-card__label">{label}</span>
      <span className="combat-stat-card__value">
        {displayValue}
      </span>
      {hint && <span className="combat-stat-card__hint">{hint}</span>}
    </article>
  );
}

function InlineStatusTray({ statuses = [], emptyLabel = "Sin estados", isMobile = false }) {
  return (
    <div className="combat-status-tray" data-mobile={isMobile ? "true" : undefined}>
      {statuses.length > 0 ? (
        <div className="combat-status-tray__list">
          {statuses.map(status => (
            <StatusPill
              key={status.id}
              label={status.label}
              value={status.value}
              tone={status.tone}
              detail={status.detail}
              description={status.description}
            />
          ))}
        </div>
      ) : (
        <div className="combat-status-tray__empty">{emptyLabel}</div>
      )}
    </div>
  );
}

function StatusPill({ label, value, tone = "common", detail = "", description = "" }) {
  const normalizedTone = tone || "common";
  const pulseEnabled = normalizedTone !== "common";
  const animationOffsetMs = Array.from(String(label || ""))
    .reduce((sum, character) => sum + character.charCodeAt(0), 0) % 9 * 140;
  return (
    <span
      className="combat-status-pill"
      data-tone={normalizedTone}
      title={description ? `${label}: ${description}${detail ? `\n${detail}` : ""}` : label}
      data-pulse={pulseEnabled ? "true" : undefined}
      {...{
        style: pulseEnabled
          ? { "--combat-pill-delay": `${animationOffsetMs}ms` }
          : undefined,
      }}
    >
      <span>{label}</span>
      <span className="combat-status-pill__value">{value}</span>
      {detail && <span className="combat-status-pill__detail">{detail}</span>}
    </span>
  );
}

function navBtnStyle(active) {
  return {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: active ? "var(--color-background-secondary, #fff)" : "var(--color-background-tertiary, #f8fafc)",
    color: active ? COLORS.dark : "var(--color-text-tertiary, #cbd5e1)",
    cursor: active ? "pointer" : "not-allowed",
    fontWeight: "bold",
  };
}










