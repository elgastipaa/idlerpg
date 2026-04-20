import React, { useEffect, useMemo, useRef, useState } from "react";

import { TALENTS } from "../data/talents";
import { ITEM_FAMILIES } from "../data/itemFamilies";
import { xpRequired } from "../engine/leveling";
import { getActiveGoals } from "../engine/progression/goalEngine";
import { getRarityColor, getAffixTierGlyph } from "../constants/rarity";
import { calcStats } from "../engine/combat/statEngine";
import { computeEffectModifiers } from "../engine/effects/effectEngine";
import { ITEM_STAT_LABELS as STAT_LABELS } from "../utils/itemPresentation";
import { getLegendaryStaticBonuses, getTargetedLegendaryDropsForEnemy } from "../utils/legendaryPowers";
import { isAutoAdvanceUnlocked, isExtractionUnlocked, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import CombatGuidanceStrip from "./combat/CombatGuidanceStrip";

const COLORS = {
  success: "var(--tone-success, #1D9E75)",
  danger: "var(--tone-danger, #D85A30)",
  boss: "var(--tone-accent, #534AB7)",
  warning: "var(--tone-warning, #f59e0b)",
  common: "var(--color-text-tertiary, #94a3b8)",
  dark: "var(--color-text-primary, #1e293b)",
};
const RARITY_RANK = { common: 1, magic: 2, rare: 3, epic: 4, legendary: 5 };
const FLOAT_EVENT_TTL_MS = 1200;
const COMBAT_ANIMATION_STYLES = `
@keyframes lootOverlayEnter {
  0% { opacity: 0; transform: translateY(26px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes lootOverlayPulse {
  0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.2), 0 16px 30px rgba(15,23,42,0.12); }
  100% { box-shadow: 0 0 0 10px rgba(245,158,11,0), 0 22px 42px rgba(245,158,11,0.3); }
}
@keyframes lootOverlayExit {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(26px) scale(0.98); }
}
@keyframes levelUpFloat {
  0% { opacity: 0; transform: translate(-50%, 12px) scale(0.86); }
  15% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -30px) scale(1.04); }
}
@keyframes combatFloatDamage {
  0% { opacity: 0; transform: translate(-50%, 8px) scale(0.92); }
  18% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -34px) scale(1.04); }
}
@keyframes combatFloatCrit {
  0% { opacity: 0; transform: translate(-50%, 10px) scale(0.84); }
  12% { opacity: 1; transform: translate(-50%, -2px) scale(1.14); }
  100% { opacity: 0; transform: translate(-50%, -42px) scale(1.05); }
}
@keyframes combatFloatHeal {
  0% { opacity: 0; transform: translate(-50%, 8px) scale(0.92); }
  18% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -30px) scale(1); }
}
@keyframes combatFloatXp {
  0% { opacity: 0; transform: translate(-50%, 6px) scale(0.94); }
  18% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -26px) scale(1.02); }
}
@keyframes combatSpotlightPulse {
  0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.26); }
  70% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
  100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
}
`;

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

function formatTickCount(ticks = 0) {
  const value = Math.max(0, Number(ticks || 0));
  return `${value} tick${value === 1 ? "" : "s"}`;
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
    return { label: "Abismo", colors: { bg: "var(--tone-warning-soft, #fff7ed)", fg: "var(--tone-warning-strong, #c2410c)", border: "rgba(245,158,11,0.22)" } };
  }
  if (mutatorIds.has(id)) {
    return { label: "Anomalia", colors: { bg: "var(--tone-accent-soft, #eef2ff)", fg: "var(--tone-accent, #4338ca)", border: "rgba(99,102,241,0.18)" } };
  }
  return { label: "Base", colors: { bg: "var(--color-background-secondary, #fff)", fg: "var(--color-text-secondary, #475569)", border: "var(--color-border-primary, #e2e8f0)" } };
}

function getStackedMultiplier(perStackMultiplier = 1, stacks = 0) {
  return Math.pow(Math.max(1, Number(perStackMultiplier || 1)), Math.max(0, Number(stacks || 0)));
}

export default function Combat({ state, dispatch }) {
  const { player, combat } = state;
  const expedition = state.expedition || {};
  const {
    enemy,
    currentTier,
    maxTier,
    autoAdvance,
    effects = [],
    triggerCounters = {},
  } = combat;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showActivated, setShowActivated] = useState({});
  const [goalIndex, setGoalIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [logExpanded, setLogExpanded] = useState(false);
  const [collapsedPanels, setCollapsedPanels] = useState({
    enemyIntel: true,
    talents: true,
    log: true,
  });
  const [levelUpFlash, setLevelUpFlash] = useState(null);
  const [combatFxNow, setCombatFxNow] = useState(Date.now());
  const logRef = useRef(null);
  const prevLevelRef = useRef(player.level || 1);

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
  const activeGoals = useMemo(() => getActiveGoals(state, 3), [state]);
  const sessionGoals = activeGoals.slice(0, 3);
  const latestLootEvent = combat.latestLootEvent || null;
  const [visibleLootEvent, setVisibleLootEvent] = useState(latestLootEvent);
  const [lootClosing, setLootClosing] = useState(false);
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
  const expeditionDeathLimit = Math.max(1, Number(expedition.deathLimit || 3));
  const expeditionDeathCount = Math.max(0, Number(expedition.deathCount || 0));
  const remainingSafeDeaths = Math.max(0, expeditionDeathLimit - expeditionDeathCount);
  const autoAdvanceUnlocked = isAutoAdvanceUnlocked(state);
  const extractionUnlocked = isExtractionUnlocked(state);
  const onboardingStep = state?.onboarding?.step || null;
  const spotlightAutoAdvance = onboardingStep === ONBOARDING_STEPS.AUTO_ADVANCE;
  const spotlightLives = onboardingStep === ONBOARDING_STEPS.FIRST_DEATH;
  const spotlightExtraction = onboardingStep === ONBOARDING_STEPS.EXTRACTION_READY;
  const lockFirstBossRetreat = enemy.isBoss && !state?.onboarding?.flags?.firstDeathSeen;
  const combatTips = useMemo(() => ([
    {
      title: "Arma primero",
      body: "Si queres pushear, casi siempre conviene mejorar o cambiar el arma antes que la armadura.",
    },
    {
      title: "No guardes TP",
      body: "Los puntos de talento sin gastar suelen rendir mas que esperar el nodo perfecto.",
    },
    {
      title: "Reforge con criterio",
      body: "La reforja sirve para perseguir una linea clave. El reroll total es para resetear una pieza floja.",
    },
    {
      title: "Extraccion corta tambien vale",
      body: "Si la run se estanca, una extraccion temprana para asegurar ecos y cargo puede rendir mas que forzar otra hora.",
    },
    {
      title: "Auto-avance no siempre",
      body: "Si moris seguido, apagalo un rato y estabiliza equipo, talentos o crafting antes de volver a subir.",
    },
    {
      title: "Economia util",
      body: "Si un drop no mejora ni sirve para tu plan, vendelo o extraelo rapido y segui rotando.",
    },
  ]), []);

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
    if (!latestLootEvent) return undefined;
    if (!latestLootEvent.highlight) return undefined;
    setLootClosing(false);
    setVisibleLootEvent(latestLootEvent);
    return undefined;
  }, [latestLootEvent]);

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
      setLevelUpFlash({ from: previous, to: current, at: Date.now() });
      const timer = setTimeout(() => setLevelUpFlash(null), 2000);
      prevLevelRef.current = current;
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = current;
    return undefined;
  }, [player.level]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (sessionGoals.length <= 1) return undefined;
    const timer = setInterval(() => {
      setGoalIndex(current => (current + 1) % sessionGoals.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sessionGoals.length]);

  useEffect(() => {
    if (combatTips.length <= 1) return undefined;
    const timer = setInterval(() => {
      setTipIndex(current => (current + 1) % combatTips.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [combatTips]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCombatFxNow(Date.now());
    }, 120);
    return () => clearInterval(timer);
  }, []);

  if (!enemy) return null;

  const enemyHpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const playerHpPct = Math.max(0, (player.hp / player.maxHp) * 100);

  const xpNeeded = xpRequired(player.level);
  const xpPct = Math.min(100, (player.xp / xpNeeded) * 100);

  const getHpColor = pct => {
    if (pct > 60) return COLORS.success;
    if (pct > 30) return COLORS.warning;
    return COLORS.danger;
  };

  const getLogEntryStyle = entry => {
    const text = entry.toLowerCase();
    if (text.includes("logro:")) return { color: "var(--tone-warning, #fde68a)", fontWeight: "900" };
    if (text.includes("objetivo:")) return { color: "var(--tone-info, #93c5fd)", fontWeight: "900" };
    if (text.includes("boss abatido")) return { color: "var(--tone-violet, #c4b5fd)", fontWeight: "900" };
    if (text.includes("victoria")) return { color: COLORS.success, fontWeight: "900" };
    if (text.includes("cayo frente")) return { color: "var(--tone-danger, #fca5a5)", fontWeight: "900" };
    if (text.includes("critico")) return { color: COLORS.warning, fontWeight: "900" };
    if (text.includes("derrotado") || text.includes("obtienes")) return { color: COLORS.success, fontWeight: "bold" };
    if (text.includes("mueres") || text.includes("recibes")) return { color: "var(--tone-danger, #ef4444)" };
    if (text.includes("nivel")) return { color: "var(--tone-violet, #a855f7)", fontWeight: "bold" };
    return { color: "var(--color-text-tertiary, #94a3b8)" };
  };
  const rotatingTip = combatTips[tipIndex % Math.max(1, combatTips.length)] || null;
  const floatingCombatEvents = (combat.floatEvents || [])
    .filter(event => combatFxNow - (event?.at || combatFxNow) < FLOAT_EVENT_TTL_MS)
    .slice(-10);
  const combatDamageFloatEvents = floatingCombatEvents.filter(event => event.kind !== "xp");
  const combatXpFloatEvents = floatingCombatEvents.filter(event => event.kind === "xp");
  const isPanelCollapsed = panel => !!collapsedPanels[panel];
  const togglePanel = panel => {
    setCollapsedPanels(current => ({
      ...current,
      [panel]: !current[panel],
    }));
  };
  const enemyIdentityLabel = [enemy.familyName, enemy.familyTraitName].filter(Boolean).join(" · ");
  const abyssMutator = enemy.abyssMutator || null;
  const abyssBossProfile = enemy.abyssBossProfile || null;
  const bossDepthSummary = enemy.isBoss ? formatAbyssBossUpgradeSummary(abyssBossProfile) : "";
  const depthAffixIds = new Set(enemy.depthAffixIds || []);
  const depthMechanicIds = new Set(enemy.depthMechanicIds || []);
  const mutatorAffixIds = new Set(enemy.mutatorAffixIds || []);
  const mutatorMechanicIds = new Set(enemy.mutatorMechanicIds || []);
  const bossMechanicMitigation = enemy.isBoss
    ? Math.min(
      0.75,
      Math.max(0, Number(baseStats.bossMechanicMitigation || 0)) +
        (Number(enemy?.abyssDepth || 0) > 0 ? Math.max(0, Number(baseStats.abyssBossMechanicMitigation || 0)) : 0)
    )
    : 0;
  const enemyIntelChips = [
    ...(enemy.monsterAffixes || []).slice(0, 2).map(affix => ({ id: `monster-${affix.id || affix.name}`, label: affix.name })),
    ...(enemy.mechanics || []).slice(0, 2).map(mechanic => ({ id: `mech-${mechanic.id || mechanic.name}`, label: mechanic.name })),
  ].filter(Boolean);
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

  return (
    <div
      style={{
        padding: isMobile ? "0.45rem 0.5rem 0.8rem" : "1rem",
        maxWidth: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "0.72rem" : "0.95rem",
        background: "var(--color-background-primary, #f8fafc)",
        color: "var(--color-text-primary, #1e293b)",
        width: "100%",
        minWidth: 0,
        overflowX: "hidden",
      }}
    >
      <style>{COMBAT_ANIMATION_STYLES}</style>
      <section
        style={{
          display: "grid",
          gap: isMobile ? "8px" : "10px",
          background: "var(--color-background-secondary, #fff)",
          padding: isMobile ? "8px" : "10px",
          borderRadius: "16px",
          border: `2px solid ${enemy.isBoss ? COLORS.warning : "var(--color-border-primary, #e2e8f0)"}`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "30px minmax(0, 1fr) 30px" : "34px minmax(0, 1fr) 34px 34px",
            gap: isMobile ? "6px" : "8px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => dispatch({ type: "SET_TIER", tier: currentTier - 1 })}
            disabled={currentTier <= 1 || lockFirstBossRetreat}
            style={navBtnStyle(currentTier > 1 && !lockFirstBossRetreat)}
            title={lockFirstBossRetreat ? "No puedes retroceder antes de ver tu primera muerte del tutorial" : undefined}
          >
            {"<"}
          </button>
          <div style={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
            <div
              style={{
                minWidth: isMobile ? 0 : "156px",
                maxWidth: "100%",
                borderRadius: "12px",
                padding: isMobile ? "6px 8px" : "8px 12px",
                border: "1px solid var(--color-border-primary, #e2e8f0)",
                background: "var(--color-background-tertiary, #f8fafc)",
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: 9, color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
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
                style={{
                  margin: 0,
                  fontSize: isMobile ? 12 : 13,
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
                }}
              >
                {currentTier} / {maxTier}
              </button>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: "SET_TIER", tier: currentTier + 1 })}
            disabled={currentTier >= maxTier}
            style={navBtnStyle(currentTier < maxTier)}
          >
            {">"}
          </button>
          {!isMobile && autoAdvanceUnlocked && (
            <button
              onClick={() => dispatch({ type: "TOGGLE_AUTO_ADVANCE" })}
              title={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
              aria-label={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
              data-onboarding-target={spotlightAutoAdvance ? "auto-advance" : undefined}
              style={{
                ...autoAdvanceBtnStyle(autoAdvance),
                boxShadow: spotlightAutoAdvance
                  ? "0 0 0 3px rgba(99,102,241,0.22), 0 0 24px rgba(99,102,241,0.24), 0 14px 30px rgba(99,102,241,0.22)"
                  : autoAdvanceBtnStyle(autoAdvance).boxShadow,
                animation: spotlightAutoAdvance ? "combatSpotlightPulse 1600ms ease-in-out infinite" : "none",
                transform: spotlightAutoAdvance ? "scale(1.05)" : "none",
              }}
            >
              🥾
            </button>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {isMobile && autoAdvanceUnlocked && (
            <button
              onClick={() => dispatch({ type: "TOGGLE_AUTO_ADVANCE" })}
              title={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
              aria-label={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
              data-onboarding-target={spotlightAutoAdvance ? "auto-advance" : undefined}
              style={{
                ...autoAdvanceBtnStyle(autoAdvance),
                boxShadow: spotlightAutoAdvance
                  ? "0 0 0 3px rgba(99,102,241,0.22), 0 0 24px rgba(99,102,241,0.24), 0 14px 30px rgba(99,102,241,0.22)"
                  : autoAdvanceBtnStyle(autoAdvance).boxShadow,
                animation: spotlightAutoAdvance ? "combatSpotlightPulse 1600ms ease-in-out infinite" : "none",
                transform: spotlightAutoAdvance ? "scale(1.05)" : "none",
              }}
            >
              🥾
            </button>
          )}
          {extractionUnlocked && (
            <button
              onClick={() => dispatch({ type: "OPEN_EXTRACTION", exitReason: "retire" })}
              data-onboarding-target={spotlightExtraction ? "open-extraction" : undefined}
              style={{
                border: "1px solid var(--tone-accent, #534AB7)",
                background: "var(--tone-accent-soft, #eef2ff)",
                color: "var(--tone-accent, #534AB7)",
                borderRadius: "999px",
                padding: "6px 11px",
                fontSize: "0.62rem",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                position: spotlightExtraction ? "relative" : "static",
                zIndex: spotlightExtraction ? 2 : 1,
                animation: spotlightExtraction ? "combatSpotlightPulse 1600ms ease-in-out infinite" : "none",
              }}
            >
              Extraer al Santuario
            </button>
          )}
        </div>

        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
          <button
            title={[
              abyssMutator ? `Anomalia: ${abyssMutator.name}${abyssMutator.bossClause && enemy.isBoss ? ` · ${abyssMutator.bossClause}` : ""}` : "",
              bossDepthSummary ? `Eco Abisal: ${bossDepthSummary}` : "",
              enemy.familyName ? `${enemy.familyName}: ${enemy.familyTraitName || "Sin rasgo visible"}` : enemy.familyTraitName || "Sin rasgo visible",
              ...(enemy.monsterAffixes || []).map(affix => `${affix.name}: ${affix.description}`),
              ...(enemy.mechanics || []).map(mechanic => `${mechanic.name}: ${mechanic.description}`),
            ].filter(Boolean).join("\n")}
            style={{ margin: 0, fontWeight: "900", color: COLORS.dark, background: "none", border: "none", padding: 0, cursor: "help", display: "block", maxWidth: "100%" }}
          >
            {enemy.isBoss ? "BOSS " : ""}
            {enemy.name.toUpperCase()}
          </button>
          {enemyLegendaryDrops.length > 0 && (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center", marginTop: "6px" }}>
              {missingEnemyPowers.length > 0 ? (
                <span style={{ fontSize: "0.5rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-violet-soft, #f3e8ff)", color: "var(--tone-violet, #6d28d9)", border: "1px solid rgba(124,58,237,0.18)" }}>
                  Power faltante: {missingEnemyPowers.map(drop => drop.power?.name || drop.name).slice(0, 2).join(" / ")}
                </span>
              ) : knownEnemyPowers.length > 0 ? (
                <span style={{ fontSize: "0.5rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-success-soft, #ecfdf5)", color: "var(--tone-success-strong, #047857)", border: "1px solid rgba(34,197,94,0.18)" }}>
                  Power conocido: {knownEnemyPowers.map(drop => drop.power?.name || drop.name).slice(0, 2).join(" / ")}
                </span>
              ) : null}
            </div>
          )}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: "6px" }}>
            {enemyIdentityLabel && (
              <span style={{ fontSize: "0.52rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--color-background-tertiary, #f1f5f9)", color: "var(--color-text-secondary, #475569)", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
                {enemyIdentityLabel}
              </span>
            )}
            {abyssMutator && (
              <span style={{ fontSize: "0.52rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)", border: "1px solid rgba(99,102,241,0.18)" }}>
                {`Abismo ${enemy.abyssDepth} · ${abyssMutator.name}`}
              </span>
            )}
            {bossDepthSummary && (
              <span style={{ fontSize: "0.52rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-warning-strong, #c2410c)", border: "1px solid rgba(245,158,11,0.22)" }}>
                {bossDepthSummary}
              </span>
            )}
            {(enemyIntelChips.length > 0 || abyssMutator || bossDepthSummary) && (
              <button
                onClick={() => togglePanel("enemyIntel")}
                style={{
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  background: "var(--color-background-secondary, #fff)",
                  color: "var(--color-text-secondary, #475569)",
                  borderRadius: "999px",
                  padding: "3px 8px",
                  fontSize: "0.52rem",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                {isPanelCollapsed("enemyIntel") ? "VER INTEL" : "OCULTAR INTEL"}
              </button>
            )}
          </div>
          {!isPanelCollapsed("enemyIntel") && (
            <div style={{ display: "grid", gap: "8px", marginTop: "8px", width: "100%" }}>
              {abyssMutator && (
                <div style={combatIntelPanelStyle}>
                  <div style={combatIntelTitleStyle}>Anomalia del Ciclo</div>
                  <div style={combatIntelEntryStyle}>
                    <div style={combatIntelLabelStyle}>{abyssMutator.name}</div>
                    <div style={combatIntelDescriptionStyle}>{abyssMutator.description}</div>
                    {enemy.isBoss && abyssMutator.bossClause && (
                      <div style={{ ...combatIntelDescriptionStyle, color: "var(--tone-accent, #4338ca)", fontWeight: "800" }}>
                        {abyssMutator.bossClause}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {bossDepthSummary && (
                <div style={combatIntelPanelStyle}>
                  <div style={combatIntelTitleStyle}>Eco Abisal</div>
                  <div style={combatIntelEntryStyle}>
                    <div style={combatIntelLabelStyle}>{bossDepthSummary}</div>
                    <div style={combatIntelDescriptionStyle}>
                      Mejoras seeded del boss para esta run. Se mantienen fijas hasta el proximo prestige.
                    </div>
                  </div>
                </div>
              )}
              {(enemy.monsterAffixes || []).length > 0 && (
                <div style={combatIntelPanelStyle}>
                  <div style={combatIntelTitleStyle}>Afijos</div>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {(enemy.monsterAffixes || []).map(affix => {
                      const sourceMeta = getIntelSourceMeta(affix.id, depthAffixIds, mutatorAffixIds);
                      return (
                      <div key={`affix-${affix.id || affix.name}`} style={combatIntelEntryStyle}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          <div style={combatIntelLabelStyle}>{affix.name}</div>
                          <span style={{ fontSize: "0.5rem", fontWeight: "900", borderRadius: "999px", padding: "2px 6px", background: sourceMeta.colors.bg, color: sourceMeta.colors.fg, border: `1px solid ${sourceMeta.colors.border}` }}>
                            {sourceMeta.label}
                          </span>
                        </div>
                        {affix.description && (
                          <div style={combatIntelDescriptionStyle}>{affix.description}</div>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              )}
              {(enemy.mechanics || []).length > 0 && (
                <div style={combatIntelPanelStyle}>
                  <div style={combatIntelTitleStyle}>Mecanicas</div>
                  <div style={{ display: "grid", gap: "6px" }}>
                    {(enemy.mechanics || []).map(mechanic => {
                      const sourceMeta = getIntelSourceMeta(mechanic.id, depthMechanicIds, mutatorMechanicIds);
                      return (
                      <div key={`mech-${mechanic.id || mechanic.name}`} style={combatIntelEntryStyle}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          <div style={combatIntelLabelStyle}>{mechanic.name}</div>
                          <span style={{ fontSize: "0.5rem", fontWeight: "900", borderRadius: "999px", padding: "2px 6px", background: sourceMeta.colors.bg, color: sourceMeta.colors.fg, border: `1px solid ${sourceMeta.colors.border}` }}>
                            {sourceMeta.label}
                          </span>
                        </div>
                        {mechanic.description && (
                          <div style={combatIntelDescriptionStyle}>{mechanic.description}</div>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {visibleLootEvent && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? 78 : 22,
            left: "50%",
            transform: "translateX(-50%)",
            width: isMobile ? "calc(100% - 22px)" : "min(560px, calc(100% - 52px))",
            zIndex: 6200,
            pointerEvents: "auto",
          }}
        >
          <section
            onClick={() => setLootClosing(true)}
            title="Tap para cerrar"
            style={{
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
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.52rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary, #64748b)", marginBottom: "2px" }}>
                  Drop Destacado
                </div>
                <div style={{ fontSize: isMobile ? "0.82rem" : "0.88rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", lineHeight: 1.15 }}>
                  {visibleLootEvent.name}
                </div>
              </div>
              <div style={{ fontSize: "0.56rem", color: getRarityColor(visibleLootEvent.rarity), fontWeight: "900", textTransform: "uppercase" }}>
                {visibleLootEvent.rarity}
              </div>
            </div>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "6px" }}>
              {(visibleLootEvent.announcedHighlights || []).slice(0, 4).map(highlight => (
                <span key={highlight.id} style={eventBadgeStyle(highlight.tone, isDarkMode)}>
                  {highlight.label}
                </span>
              ))}
              {visibleLootEvent.ratingMargin >= 8 && (
                <span style={eventBadgeStyle("upgrade", isDarkMode)}>
                  +{Math.round(visibleLootEvent.ratingMargin)} poder
                </span>
              )}
            </div>
            {!!visibleLootEvent.affixSummaries?.length && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                {visibleLootEvent.affixSummaries.map((affix, index) => {
                  const glyph = getAffixTierGlyph(affix);
                  return (
                    <span key={`${affix.stat}-${index}`} style={{ fontSize: "0.56rem", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "999px", padding: "2px 6px", background: "var(--color-background-secondary, #fff)", color: "var(--color-text-secondary, #475569)", fontWeight: "900" }}>
                      <span style={{ color: glyph.color, marginRight: "4px" }}>{glyph.symbol}</span>
                      {STAT_LABELS[affix.stat] || affix.stat}
                    </span>
                  );
                })}
              </div>
            )}
            {visibleLootEvent.hasActiveHuntObjectives && visibleLootEvent.wishlistMatches?.length > 0 && (
              <div style={{ marginTop: "6px", fontSize: "0.56rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)" }}>
                Coincide con tu caza · {visibleLootEvent.wishlistMatches.slice(0, 3).map(stat => STAT_LABELS[stat] || stat).join(", ")}
              </div>
            )}
          </section>
        </div>
      )}

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          background: "var(--color-background-secondary, #fff)",
          padding: "10px",
          borderRadius: "16px",
          border: "1px solid var(--color-border-primary, #e2e8f0)",
          position: "relative",
          overflow: "visible",
        }}
      >
        <div>
          <div style={hpLabelStyle}>
            <span>ENEMIGO</span>
            <span>{Math.ceil(enemy.hp).toLocaleString()} HP</span>
          </div>
          <div style={barContainerStyle}>
            <div style={{ width: `${enemyHpPct}%`, height: "100%", background: "var(--tone-danger, #ef4444)", transition: "width 0.2s ease-out" }} />
          </div>
          <InlineStatusTray statuses={enemyStatusPills} emptyLabel="Sin estados" isMobile={isMobile} />
        </div>
        <div>
          <div style={hpLabelStyle}>
            <span>HEROE</span>
            <span>
              {Math.ceil(player.hp).toLocaleString()} / {player.maxHp}
            </span>
          </div>
          <div style={barContainerStyle}>
            <div
              style={{
                width: `${playerHpPct}%`,
                height: "100%",
                background: getHpColor(playerHpPct),
                transition: "all 0.3s ease",
              }}
            />
          </div>
          <InlineStatusTray statuses={playerStatusPills} emptyLabel="Sin estados" isMobile={isMobile} />
          <div
            data-onboarding-target={spotlightLives ? "expedition-lives" : undefined}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "6px",
              borderRadius: "12px",
              padding: spotlightLives ? "6px 8px" : 0,
              background: spotlightLives ? "var(--tone-warning-soft, #fff7ed)" : "transparent",
              boxShadow: spotlightLives ? "0 0 0 2px rgba(245,158,11,0.16), 0 10px 24px rgba(245,158,11,0.12)" : "none",
              animation: spotlightLives ? "combatSpotlightPulse 1600ms ease-in-out infinite" : "none",
            }}
          >
            <span style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Vidas de expedicion
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: "900",
                borderRadius: "999px",
                padding: "2px 8px",
                background:
                  remainingSafeDeaths <= 0
                    ? "var(--tone-danger-soft, #fff1f2)"
                    : remainingSafeDeaths === 1
                      ? "var(--tone-warning-soft, #fff7ed)"
                      : "var(--tone-success-soft, #ecfdf5)",
                color:
                  remainingSafeDeaths <= 0
                    ? "var(--tone-danger, #D85A30)"
                    : remainingSafeDeaths === 1
                      ? "var(--tone-warning, #f59e0b)"
                      : "var(--tone-success-strong, #047857)",
                border: "1px solid var(--color-border-primary, #e2e8f0)",
              }}
            >
              {remainingSafeDeaths}/{expeditionDeathLimit} seguras
            </span>
          </div>
        </div>
        {combatDamageFloatEvents.length > 0 && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 8 }}>
            {combatDamageFloatEvents.map((event, index) => (
              <div key={event.id || `${event.kind}-${index}`} style={getCombatFloatStyle(event, index)}>
                {event.kind === "heal"
                  ? `+${Math.floor(event.value || 0).toLocaleString()} HP`
                  : `-${Math.floor(event.value || 0).toLocaleString()}`}
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          background: "var(--color-background-secondary, #fff)",
          padding: "8px 10px",
          borderRadius: "14px",
          border: "1px solid var(--color-border-primary, #e2e8f0)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ textAlign: "center", borderRight: "1px solid var(--color-border-secondary, #f1f5f9)", paddingRight: "12px" }}>
          <div style={{ fontSize: "1.4rem" }}>{CLASS_ICONS[player.class] || "CL"}</div>
          <div style={{ fontSize: 9, fontWeight: "900", color: COLORS.common, textTransform: "uppercase" }}>
            {player.class || "Sin Clase"}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: "900", color: COLORS.dark }}>Nivel {player.level}</span>
            <span style={{ fontSize: 10, fontWeight: "bold", color: COLORS.boss }}>{Math.floor(xpPct)}%</span>
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                ...barContainerStyle,
                height: 8,
                boxShadow: levelUpFlash ? "0 0 0 2px rgba(99,102,241,0.28), 0 0 18px rgba(99,102,241,0.34)" : "none",
              }}
            >
              <div style={{ width: `${xpPct}%`, height: "100%", background: "var(--tone-accent, #534AB7)", transition: "width 0.5s ease-out" }} />
            </div>
            {combatXpFloatEvents.length > 0 && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 9 }}>
                {combatXpFloatEvents.map((event, index) => (
                  <div key={event.id || `xp-${index}`} style={getCombatFloatStyle(event, index)}>
                    +{Math.floor(event.value || 0).toLocaleString()} XP
                  </div>
                ))}
              </div>
            )}
            {levelUpFlash && (
              <div
                style={{
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
                }}
              >
                +1 NIVEL
              </div>
            )}
          </div>
          <div style={{ fontSize: 9, color: COLORS.common, marginTop: 4, fontWeight: "bold", textAlign: "right" }}>
            XP: {Math.floor(player.xp).toLocaleString()} / {xpNeeded.toLocaleString()}
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", gap: 8, minWidth: 0 }}>
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
      </section>

      <CombatGuidanceStrip
        sessionGoals={sessionGoals}
        goalIndex={goalIndex}
        setGoalIndex={setGoalIndex}
        rotatingTip={rotatingTip}
        dispatch={dispatch}
      />

      {player.class && myTalents.length > 0 && (
        <section style={{ background: "var(--color-background-secondary, #fff)", borderRadius: "16px", padding: "10px", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
          <button onClick={() => togglePanel("talents")} style={sectionHeaderButtonStyle}>
            <span style={{ fontSize: 9, color: COLORS.common, fontWeight: "900", letterSpacing: "1px" }}>TALENTOS</span>
            <span style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900" }}>{isPanelCollapsed("talents") ? `${activeTalentCount} ACTIVOS · ${myTalents.length}` : "OCULTAR"}</span>
          </button>
          {!isPanelCollapsed("talents") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "8px" }}>
              {myTalents.map(talent => {
                const activeState = activeTalentEffects.get(talent.id);
                const progress = getTriggerProgress(talent, triggerCounters);
                const isJustTriggered = showActivated[talent.id];
                const icon = TALENT_ICONS[talent.classId] || "TL";

                return (
                  <div key={talent.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: "900", color: COLORS.dark, lineHeight: 1.35 }}>
                        {icon} {talent.name}{" "}
                        <span style={{ fontWeight: "normal", color: COLORS.common, fontSize: 10 }}>{talent.description}</span>
                      </span>
                      {activeState ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexShrink: 0,
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: `${COLORS.boss}15`,
                            color: COLORS.boss,
                            fontSize: 9,
                            fontWeight: "900",
                          }}
                        >
                          <span>ACTIVO</span>
                          {activeState.stacks > 1 && <span>x{activeState.stacks}</span>}
                          {activeState.maxDuration != null && <span>{activeState.maxDuration}s</span>}
                        </div>
                      ) : null}
                    </div>

                    {progress && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ ...barContainerStyle, flex: 1, height: 6 }}>
                          <div
                            style={{
                              width: `${isJustTriggered ? 100 : progress.percent}%`,
                              height: "100%",
                              background: isJustTriggered ? COLORS.success : "var(--tone-accent, #534AB7)",
                              transition: "all 0.3s ease",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: "900",
                            minWidth: 88,
                            textAlign: "right",
                            color: isJustTriggered ? COLORS.success : COLORS.common,
                          }}
                        >
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

      <section
        style={{
          position: "relative",
          background: "var(--color-background-secondary, #fff)",
          borderRadius: "16px",
          padding: "10px",
          border: "1px solid var(--color-border-primary, #e2e8f0)",
        }}
      >
        <button onClick={() => togglePanel("log")} style={sectionHeaderButtonStyle}>
          <span style={logTitleStyle}>REGISTRO DE COMBATE</span>
          <span style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900" }}>{isPanelCollapsed("log") ? "VER" : "OCULTAR"}</span>
        </button>
        {!isPanelCollapsed("log") && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, marginTop: "6px", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>
                Ultimos eventos
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setLogExpanded(current => !current)} style={scrollTopBtnStyle}>
                  {logExpanded ? "VER MENOS" : "VER MAS"}
                </button>
                <button
                  onClick={() => logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" })}
                  style={scrollTopBtnStyle}
                >
                  RECIENTE
                </button>
              </div>
            </div>
            <div
              ref={logRef}
              style={{
                background: "var(--color-background-primary, #0f172a)",
                borderRadius: "12px",
                padding: "10px",
                maxHeight: logExpanded ? (isMobile ? 210 : 260) : (isMobile ? 94 : 112),
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                border: "1px solid var(--color-border-primary, #22314d)",
              }}
            >
              {(logExpanded ? combat.log.slice(-30) : combat.log.slice(-3)).map((line, index) => (
                <p
                  key={index}
                  style={{
                    fontSize: 11,
                    margin: 0,
                    ...getLogEntryStyle(line),
                    fontFamily: "monospace",
                    padding: "2px 0",
                    borderBottom: "1px solid var(--color-border-secondary, #1e293b33)",
                  }}
                >
                  <span style={{ opacity: 0.2, marginRight: 6 }}>{">"}</span>
                  {line}
                </p>
              ))}
            </div>
          </>
        )}
      </section>

      <button
        onClick={() => {
          if (confirm("Borrar todo?")) {
            dispatch({ type: "RESET_ALL_PROGRESS" });
          }
        }}
        style={{
          background: "none",
          border: "none",
          color: COLORS.danger,
          fontSize: 9,
          cursor: "pointer",
          opacity: 0.4,
          alignSelf: "center",
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

const logTitleStyle = {
  fontSize: 9,
  color: COLORS.common,
  fontWeight: "900",
  letterSpacing: "1px",
};

const sectionHeaderButtonStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
};

const scrollTopBtnStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  color: COLORS.boss,
  fontSize: 9,
  fontWeight: "900",
  cursor: "pointer",
  borderRadius: "999px",
  padding: "4px 8px",
};

const combatIntelPanelStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "8px 10px",
  textAlign: "left",
};

const combatIntelTitleStyle = {
  fontSize: "0.54rem",
  color: "var(--color-text-tertiary, #94a3b8)",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "6px",
};

const combatIntelEntryStyle = {
  display: "grid",
  gap: "2px",
};

const combatIntelLabelStyle = {
  fontSize: "0.64rem",
  color: "var(--color-text-primary, #1e293b)",
  fontWeight: "900",
};

const combatIntelDescriptionStyle = {
  fontSize: "0.6rem",
  color: "var(--color-text-secondary, #475569)",
  lineHeight: 1.35,
  fontWeight: "800",
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
      }
    : {
        legendary: { bg: "var(--tone-warning-soft, #fff8f1)", color: "var(--tone-danger, #9a3412)", border: "var(--tone-warning, #fed7aa)" },
        epic: { bg: "var(--tone-violet-soft, #faf6ff)", color: "var(--tone-violet, #6d28d9)", border: "var(--tone-violet, #ddd6fe)" },
        perfect: { bg: "var(--tone-warning-soft, #fffceb)", color: "#92400e", border: "var(--tone-warning, #fde68a)" },
        t1: { bg: "var(--tone-info-soft, #f5f9ff)", color: "var(--tone-info, #1e40af)", border: "var(--tone-info, #bfdbfe)" },
        upgrade: { bg: "var(--tone-success-soft, #f0fdf7)", color: "var(--tone-success-strong, #065f46)", border: "var(--tone-success, #bbf7d0)" },
        build: { bg: "var(--tone-info-soft, #f0f9ff)", color: "var(--tone-info, #075985)", border: "var(--tone-info, #bae6fd)" },
        offense: { bg: "var(--tone-danger-soft, #fff5f7)", color: "var(--tone-danger-strong, #9f1239)", border: "var(--tone-danger, #fecdd3)" },
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

function StatCard({ label, value, hint = null }) {
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div style={{ background: "var(--color-background-secondary, #fff)", borderRadius: "12px", padding: "7px 4px", border: "1px solid var(--color-border-primary, #e2e8f0)", textAlign: "center" }}>
      <p style={{ fontSize: 8, color: COLORS.common, margin: "0 0 2px", fontWeight: "900" }}>{label}</p>
      <p style={{ fontSize: "0.9rem", fontWeight: "900", margin: 0, color: COLORS.dark }}>
        {displayValue}
      </p>
      {hint && <p style={{ fontSize: 8, color: "var(--color-text-secondary, #64748b)", margin: "2px 0 0", fontWeight: "800" }}>{hint}</p>}
    </div>
  );
}

function InlineStatusTray({ statuses = [], emptyLabel = "Sin estados", isMobile = false }) {
  return (
    <div
      style={{
        marginTop: "6px",
        background: "var(--color-background-tertiary, #f8fafc)",
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        borderRadius: "10px",
        padding: "5px",
        minHeight: isMobile ? 31 : 33,
        overflowX: "auto",
        overflowY: "hidden",
        boxSizing: "border-box",
      }}
    >
      {statuses.length > 0 ? (
        <div style={{ display: "flex", gap: "5px", alignItems: "stretch", minWidth: "max-content" }}>
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
        <div style={{ fontSize: "0.6rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "800" }}>{emptyLabel}</div>
      )}
    </div>
  );
}

function StatusPill({ label, value, tone = "common", detail = "", description = "" }) {
  const toneMap = {
    success: {
      color: "var(--tone-success-strong, #047857)",
      background: "var(--tone-success-soft, #ecfdf5)",
      border: "rgba(16,185,129,0.18)",
    },
    danger: {
      color: "var(--tone-danger, #b91c1c)",
      background: "var(--tone-danger-soft, #fff1f2)",
      border: "rgba(244,63,94,0.18)",
    },
    warning: {
      color: "var(--tone-warning, #b45309)",
      background: "var(--tone-warning-soft, #fff7ed)",
      border: "rgba(245,158,11,0.18)",
    },
    boss: {
      color: "var(--tone-accent, #4338ca)",
      background: "var(--tone-accent-soft, #eef2ff)",
      border: "rgba(99,102,241,0.18)",
    },
    info: {
      color: "var(--tone-info, #0369a1)",
      background: "var(--tone-info-soft, #f0f9ff)",
      border: "rgba(56,189,248,0.18)",
    },
    common: {
      color: "var(--color-text-secondary, #475569)",
      background: "var(--color-background-tertiary, #f8fafc)",
      border: "var(--color-border-primary, #e2e8f0)",
    },
  };
  const palette = toneMap[tone] || toneMap.common;
  return (
    <span
      title={description ? `${label}: ${description}${detail ? `\n${detail}` : ""}` : label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        flex: "0 0 auto",
        minWidth: "fit-content",
        boxSizing: "border-box",
        gap: "6px",
        fontSize: "0.58rem",
        fontWeight: "900",
        color: palette.color,
        background: palette.background,
        border: `1px solid ${palette.border}`,
        borderRadius: "999px",
        padding: "4px 8px",
        cursor: description ? "help" : "default",
        whiteSpace: "nowrap",
      }}
    >
      <span>{label}</span>
      <span style={{ opacity: 0.9 }}>{value}</span>
      {detail && <span style={{ fontSize: "0.54rem", fontWeight: "800", opacity: 0.86 }}>{detail}</span>}
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

function autoAdvanceBtnStyle(active) {
  return {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: `2px solid ${active ? "var(--tone-success, #1D9E75)" : "var(--color-border-primary, #e2e8f0)"}`,
    background: active ? "var(--tone-success-soft, #ecfdf5)" : "var(--color-background-secondary, #fff)",
    color: active ? "var(--tone-success-strong, #047857)" : "var(--color-text-secondary, #64748b)",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "0.95rem",
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: active ? "0 0 0 2px rgba(29,158,117,0.14)" : "none",
  };
}










