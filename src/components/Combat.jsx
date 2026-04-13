import React, { useEffect, useMemo, useRef, useState } from "react";

import { SKILLS } from "../data/skills";
import { TALENTS } from "../data/talents";
import { ITEM_FAMILIES } from "../data/itemFamilies";
import { xpRequired } from "../engine/leveling";
import { getActiveGoals } from "../engine/progression/goalEngine";
import { getRarityColor, getAffixTierGlyph } from "../constants/rarity";
import { calcStats } from "../engine/combat/statEngine";
import { computeEffectModifiers } from "../engine/effects/effectEngine";
import { ITEM_STAT_LABELS as STAT_LABELS } from "../utils/itemPresentation";
import { getTargetedLegendaryDropsForEnemy } from "../utils/legendaryPowers";

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
const SKILL_DPS_WINDOW_MS = 20000;
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

function getSkillDesc(skill) {
  if (skill.effect?.damageMultiplier) return `x${skill.effect.damageMultiplier} dano`;
  if (skill.effect?.heal) return `+${skill.effect.heal} HP`;
  if (skill.effect?.critBonus) return `+${(skill.effect.critBonus * 100).toFixed(0)}% crit`;
  return "";
}

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
        ? "kills"
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

function formatDpsValue(value) {
  if (!value || value <= 0) return "0.0";
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function formatBossTheme(enemy) {
  const parts = [];
  if (enemy?.favoredFamilies?.length) {
    parts.push(`Favorece familias: ${enemy.favoredFamilies.join(", ")}`);
  }
  if (enemy?.favoredStats?.length) {
    parts.push(`Favorece stats: ${enemy.favoredStats.join(", ")}`);
  }
  if (enemy?.guaranteedRarityFloor) {
    parts.push(`Piso de rareza: ${enemy.guaranteedRarityFloor}`);
  }
  return parts;
}

function formatHuntFamilies(enemy) {
  return (enemy?.favoredFamilies || [])
    .map(familyId => ITEM_FAMILIES[familyId]?.name || familyId)
    .slice(0, 3);
}

function formatHuntStats(enemy) {
  return (enemy?.favoredStats || [])
    .map(stat => STAT_LABELS[stat] || stat)
    .slice(0, 3);
}

export default function Combat({ state, dispatch }) {
  const { player, combat } = state;
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
    skills: true,
    talents: true,
    log: true,
  });
  const [levelUpFlash, setLevelUpFlash] = useState(null);
  const [combatFxNow, setCombatFxNow] = useState(Date.now());
  const logRef = useRef(null);
  const prevLevelRef = useRef(player.level || 1);

  const mySkills = SKILLS.filter(
    skill => skill.classId === player.class && (!skill.specId || skill.specId === player.specialization)
  );

  const replacedTalentIds = new Set(
    TALENTS
      .filter(talent => (player.unlockedTalents || []).includes(talent.id) && talent.replaces)
      .flatMap(talent => (Array.isArray(talent.replaces) ? talent.replaces : [talent.replaces]))
  );

  const myTalents = TALENTS.filter(
    talent =>
      talent.classId === player.class &&
      (talent.type === "triggered" || talent.type === "stacking") &&
      (player.unlockedTalents || []).includes(talent.id) &&
      !replacedTalentIds.has(talent.id)
  );

  const activeTalentEffects = useMemo(() => buildActiveTalentEffects(effects), [effects]);
  const activeGoals = useMemo(() => getActiveGoals(state, 3), [state]);
  const sessionGoals = activeGoals.slice(0, 3);
  const skillDpsById = useMemo(() => {
    const now = Date.now();
    const cutoff = now - SKILL_DPS_WINDOW_MS;
    const totals = new Map();
    (combat.skillDamageTimeline || []).forEach(entry => {
      if (!entry?.skillId || (entry.at || 0) < cutoff) return;
      totals.set(entry.skillId, (totals.get(entry.skillId) || 0) + Math.max(0, entry.damage || 0));
    });
    return totals;
  }, [combat.skillDamageTimeline]);
  const latestLootEvent = combat.latestLootEvent || null;
  const [visibleLootEvent, setVisibleLootEvent] = useState(latestLootEvent);
  const [lootClosing, setLootClosing] = useState(false);
  const isDarkMode = state.settings?.theme === "dark";
  const baseStats = useMemo(() => calcStats(player), [player]);
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
      title: "Prestige corto tambien vale",
      body: "Si la run se estanca, un prestige rapido por pocos ecos puede rendir mas que forzar otra hora.",
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
    if (!isMobile) {
      setCollapsedPanels({
        skills: false,
        talents: false,
        log: false,
      });
      return;
    }
    setCollapsedPanels({
      skills: true,
      talents: true,
      log: true,
    });
  }, [isMobile]);

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
  const isPanelCollapsed = panel => isMobile && !!collapsedPanels[panel];
  const togglePanel = panel => {
    setCollapsedPanels(current => ({
      ...current,
      [panel]: !current[panel],
    }));
  };
  const enemyIntelChips = [
    enemy.familyName && { id: "family", label: enemy.familyName },
    enemy.familyTraitName && { id: "trait", label: enemy.familyTraitName },
    ...(enemy.monsterAffixes || []).slice(0, 2).map(affix => ({ id: `monster-${affix.id || affix.name}`, label: affix.name })),
    ...(enemy.mechanics || []).slice(0, 2).map(mechanic => ({ id: `mech-${mechanic.id || mechanic.name}`, label: mechanic.name })),
  ].filter(Boolean);
  const bossThemeText = formatBossTheme(enemy).join(" · ");
  const huntFamilies = formatHuntFamilies(enemy);
  const huntStats = formatHuntStats(enemy);
  const enemyLegendaryDrops = useMemo(() => getTargetedLegendaryDropsForEnemy(enemy), [enemy]);
  const missingEnemyPowers = useMemo(() => {
    const discoveries = state?.codex?.powerDiscoveries || {};
    return enemyLegendaryDrops.filter(drop => !(discoveries?.[drop?.power?.id] > 0));
  }, [enemyLegendaryDrops, state?.codex?.powerDiscoveries]);
  const knownEnemyPowers = useMemo(() => {
    const discoveries = state?.codex?.powerDiscoveries || {};
    return enemyLegendaryDrops.filter(drop => discoveries?.[drop?.power?.id] > 0);
  }, [enemyLegendaryDrops, state?.codex?.powerDiscoveries]);

  return (
    <div
      style={{
        padding: isMobile ? "0.7rem" : "1rem",
        maxWidth: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.95rem",
        background: "var(--color-background-primary, #f8fafc)",
        color: "var(--color-text-primary, #1e293b)",
      }}
    >
      <style>{COMBAT_ANIMATION_STYLES}</style>
      <section
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--color-background-secondary, #fff)",
          padding: "10px",
          borderRadius: "16px",
          border: `2px solid ${enemy.isBoss ? COLORS.warning : "var(--color-border-primary, #e2e8f0)"}`,
        }}
      >
        <button
          onClick={() => dispatch({ type: "SET_TIER", tier: currentTier - 1 })}
          disabled={currentTier <= 1}
          style={navBtnStyle(currentTier > 1)}
        >
          {"<"}
        </button>
        <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 9, color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
            Tier Actual
          </div>
          <button
            title={[
              `Tier ${currentTier} / ${maxTier}`,
              enemy.familyTraitName ? `Rasgo: ${enemy.familyTraitName}` : "",
              (enemy.monsterAffixes || []).length ? `Affixes: ${(enemy.monsterAffixes || []).map(affix => affix.name).join(", ")}` : "",
              (enemy.mechanics || []).length ? `Boss: ${(enemy.mechanics || []).map(mechanic => mechanic.name).join(", ")}` : "",
              ...formatBossTheme(enemy),
            ].filter(Boolean).join("\n")}
            style={{ margin: 0, fontSize: 11, color: COLORS.common, fontWeight: "900", background: "none", border: "none", padding: 0, cursor: "help", display: "block", lineHeight: 1 }}
          >
            {currentTier} / {maxTier}
          </button>
          <button
            title={[
              enemy.familyName ? `${enemy.familyName}: ${enemy.familyTraitName || "Sin rasgo visible"}` : enemy.familyTraitName || "Sin rasgo visible",
              ...(enemy.monsterAffixes || []).map(affix => `${affix.name}: ${affix.description}`),
              ...(enemy.mechanics || []).map(mechanic => `${mechanic.name}: ${mechanic.description}`),
              ...formatBossTheme(enemy),
            ].filter(Boolean).join("\n")}
            style={{ margin: "6px 0 0", fontWeight: "900", color: COLORS.dark, background: "none", border: "none", padding: 0, cursor: "help", display: "block" }}
          >
            {enemy.isBoss ? "BOSS " : ""}
            {enemy.name.toUpperCase()}
          </button>
          {enemyIntelChips.length > 0 && (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center", marginTop: "5px" }}>
              {enemyIntelChips.map(chip => (
                <span key={chip.id} style={{ fontSize: "0.52rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: enemy.isBoss ? "var(--tone-violet-soft, #f3e8ff)" : "var(--color-background-tertiary, #f1f5f9)", color: enemy.isBoss ? "var(--tone-violet, #6d28d9)" : "var(--color-text-secondary, #475569)", border: `1px solid ${enemy.isBoss ? "rgba(124,58,237,0.18)" : "var(--color-border-primary, #e2e8f0)"}` }}>
                  {chip.label}
                </span>
              ))}
            </div>
          )}
          {bossThemeText && (
            <p style={{ margin: "5px 0 0", fontSize: 10, color: enemy.isBoss ? COLORS.boss : "var(--color-text-secondary, #475569)", fontWeight: "800", textAlign: "center" }}>
              {bossThemeText}
            </p>
          )}
          {(huntFamilies.length > 0 || huntStats.length > 0 || enemy?.guaranteedRarityFloor) && (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center", marginTop: "6px" }}>
              {huntFamilies.length > 0 && (
                <span style={{ fontSize: "0.5rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-warning, #f59e0b)", border: "1px solid rgba(245,158,11,0.18)" }}>
                  Caza: {huntFamilies.join(" / ")}
                </span>
              )}
              {huntStats.length > 0 && (
                <span style={{ fontSize: "0.5rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)", border: "1px solid rgba(99,102,241,0.18)" }}>
                  Busca: {huntStats.join(" / ")}
                </span>
              )}
              {enemy?.guaranteedRarityFloor && (
                <span style={{ fontSize: "0.5rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--color-background-tertiary, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
                  Piso {enemy.guaranteedRarityFloor}
                </span>
              )}
            </div>
          )}
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
        </div>
        <button
          onClick={() => dispatch({ type: "SET_TIER", tier: currentTier + 1 })}
          disabled={currentTier >= maxTier}
          style={navBtnStyle(currentTier < maxTier)}
        >
          {">"}
        </button>
        <button
          onClick={() => dispatch({ type: "TOGGLE_AUTO_ADVANCE" })}
          title={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
          aria-label={autoAdvance ? "Auto-avance activado" : "Auto-avance desactivado"}
          style={autoAdvanceBtnStyle(autoAdvance)}
        >
          🥾
        </button>
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
            {visibleLootEvent.huntMatches?.isMatch && (
              <div style={{ marginTop: "6px", fontSize: "0.56rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)" }}>
                {visibleLootEvent.huntMatches.familyMatch ? "Coincide con la familia objetivo" : "Coincide con stats objetivo"}
                {visibleLootEvent.huntMatches.matchingStats?.length > 0 ? ` · ${visibleLootEvent.huntMatches.matchingStats.slice(0, 3).map(stat => STAT_LABELS[stat] || stat).join(", ")}` : ""}
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
        </div>
        {floatingCombatEvents.length > 0 && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 8 }}>
            {floatingCombatEvents.map((event, index) => (
              <div key={event.id || `${event.kind}-${index}`} style={getCombatFloatStyle(event, index)}>
                {event.kind === "heal" || event.kind === "skillHeal"
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

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
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

      {sessionGoals.length > 0 && (() => {
        const rotatingGoal = sessionGoals[goalIndex % Math.max(1, sessionGoals.length)] || null;
        if (!rotatingGoal) return null;
        return (
          <section style={{ background: "var(--color-background-secondary, #fff)", borderRadius: "12px", padding: "6px 8px", border: "1px solid var(--color-border-primary, #e2e8f0)", display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => setGoalIndex(current => (current - 1 + sessionGoals.length) % sessionGoals.length)} style={cycleButtonStyle}>
              {"<"}
            </button>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", minWidth: 0 }}>
                  <span style={{ fontSize: "0.46rem", fontWeight: "900", padding: "2px 6px", borderRadius: "999px", background: "var(--color-background-tertiary, #f8fafc)", color: "var(--tone-accent, #534AB7)", border: "1px solid var(--color-border-primary, #e2e8f0)", textTransform: "uppercase", flexShrink: 0 }}>
                    {rotatingGoal.sessionArc}
                  </span>
                  <span style={{ fontSize: "0.64rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {rotatingGoal.name}
                  </span>
                </div>
                {rotatingGoal.completed ? (
                  <button onClick={() => dispatch({ type: "CLAIM_GOAL", goalId: rotatingGoal.id })} style={{ ...goalClaimButtonStyle, padding: "5px 8px", fontSize: "0.56rem" }}>CLAIM</button>
                ) : (
                  <span style={{ fontSize: "0.56rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", whiteSpace: "nowrap" }}>
                    {rotatingGoal.progress}/{rotatingGoal.targetValue}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.54rem", color: "var(--color-text-tertiary, #94a3b8)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {rotatingGoal.hint || rotatingGoal.description}
              </div>
              <div style={{ ...barContainerStyle, height: 4, marginTop: "5px" }}>
                <div style={{ width: `${rotatingGoal.percent}%`, height: "100%", background: rotatingGoal.completed ? COLORS.success : COLORS.boss }} />
              </div>
            </div>
            <button onClick={() => setGoalIndex(current => (current + 1) % sessionGoals.length)} style={cycleButtonStyle}>
              {">"}
            </button>
          </section>
        );
      })()}

      {rotatingTip && (
        <section style={{ background: "var(--color-background-secondary, #fff)", borderRadius: "12px", padding: "5px 8px", border: "1px solid var(--color-border-primary, #e2e8f0)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "0.5rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)", flexShrink: 0 }}>
            Consejo
          </div>
          <div style={{ minWidth: 0, flex: 1, fontSize: "0.58rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <strong style={{ color: "var(--color-text-primary, #1e293b)" }}>{rotatingTip.title}:</strong> {rotatingTip.body}
          </div>
        </section>
      )}

      {player.class && mySkills.length > 0 && (
        <section style={{ background: "var(--color-background-secondary, #fff)", borderRadius: "16px", padding: "10px", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
          <button onClick={() => togglePanel("skills")} style={sectionHeaderButtonStyle}>
            <span style={{ fontSize: 9, color: COLORS.common, fontWeight: "900", letterSpacing: "1px" }}>SKILLS</span>
            <span style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900" }}>{isPanelCollapsed("skills") ? `VER (${mySkills.length})` : "OCULTAR"}</span>
          </button>
          {!isPanelCollapsed("skills") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "8px" }}>
              {mySkills.map(skill => {
                const cooldown = combat.skillCooldowns?.[skill.id] || 0;
                const isAuto = combat.skillAutocasts?.[skill.id] || false;
                const isReady = cooldown === 0;
                const skillDps = (skillDpsById.get(skill.id) || 0) / 20;

                return (
                  <div
                    key={skill.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      background: isAuto ? `${COLORS.success}12` : "var(--color-background-tertiary, #f8fafc)",
                      border: `1px solid ${isAuto ? `${COLORS.success}66` : "var(--color-border-primary, #e2e8f0)"}`,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 12, fontWeight: "900", color: COLORS.dark }}>{skill.name}</span>
                      <p style={{ fontSize: 10, color: COLORS.common, margin: "2px 0 0" }}>{getSkillDesc(skill)}</p>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px", flexWrap: "wrap" }}>
                        {!isReady && <span style={{ fontSize: 10, color: COLORS.warning }}>CD {cooldown}s</span>}
                        {isReady && isAuto && <span style={{ fontSize: 10, color: COLORS.success }}>LISTO</span>}
                        <span style={{ fontSize: 10, color: "var(--color-text-info, #4338ca)", fontWeight: "900" }}>DPS20s {formatDpsValue(skillDps)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch({ type: "TOGGLE_SKILL_AUTOCAST", skillId: skill.id })}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "none",
                        background: isAuto ? COLORS.success : "var(--color-background-tertiary, #e2e8f0)",
                        color: isAuto ? "#fff" : "var(--color-text-secondary, #64748b)",
                        fontSize: 10,
                        fontWeight: "900",
                        cursor: "pointer",
                      }}
                    >
                      {isAuto ? "AUTO ON" : "AUTO OFF"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {player.class && myTalents.length > 0 && (
        <section style={{ background: "var(--color-background-secondary, #fff)", borderRadius: "16px", padding: "10px", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
          <button onClick={() => togglePanel("talents")} style={sectionHeaderButtonStyle}>
            <span style={{ fontSize: 9, color: COLORS.common, fontWeight: "900", letterSpacing: "1px" }}>TALENTOS</span>
            <span style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "900" }}>{isPanelCollapsed("talents") ? `VER (${myTalents.length})` : "OCULTAR"}</span>
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
            localStorage.clear();
            window.location.reload();
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

const goalClaimButtonStyle = {
  border: "none",
  background: "var(--tone-success, #1D9E75)",
  color: "#fff",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "0.58rem",
  fontWeight: "900",
  cursor: "pointer",
};

const cycleButtonStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "999px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-tertiary, #f8fafc)",
  color: "var(--color-text-secondary, #475569)",
  fontWeight: "900",
  cursor: "pointer",
  flexShrink: 0,
};

function getCombatFloatStyle(event = {}, index = 0) {
  const isHeal = event.kind === "heal" || event.kind === "skillHeal";
  const isSkillDamage = event.kind === "skillDamage";
  const isThornsDamage = event.kind === "thornsDamage";
  const laneKey = `${event.id || ""}:${event.kind || ""}:${event.source || ""}:${event.value || 0}`;
  let laneHash = 0;
  for (let i = 0; i < laneKey.length; i += 1) {
    laneHash = (laneHash + laneKey.charCodeAt(i)) % 997;
  }
  const laneIndex = laneKey ? laneHash % 3 : index % 3;
  const laneOffset = (laneIndex - 1) * 12;
  const left = isHeal
    ? `calc(68% + ${laneOffset}px)`
    : isSkillDamage
      ? `calc(42% + ${laneOffset}px)`
      : isThornsDamage
        ? `calc(58% + ${laneOffset}px)`
      : `calc(50% + ${laneOffset}px)`;
  const zIndex = isHeal ? 9 : isSkillDamage ? 10 : isThornsDamage ? 11 : 12;

  return {
    position: "absolute",
    left,
    top: isHeal ? "58%" : isSkillDamage ? "26%" : isThornsDamage ? "31%" : "24%",
    transform: "translate(-50%, 0)",
    fontSize: event.crit ? "1.08rem" : "0.94rem",
    fontWeight: "900",
    color: isHeal ? "var(--tone-success, #16a34a)" : event.crit ? "var(--tone-warning, #f59e0b)" : isSkillDamage ? "var(--tone-violet, #d946ef)" : isThornsDamage ? "var(--tone-danger-strong, #dc2626)" : "var(--tone-danger, #ef4444)",
    textShadow: event.crit
      ? "0 0 12px rgba(245,158,11,0.45)"
      : isHeal
        ? "0 0 10px rgba(34,197,94,0.3)"
        : isSkillDamage
          ? "0 0 12px rgba(217,70,239,0.4)"
          : isThornsDamage
            ? "0 0 10px rgba(220,38,38,0.36)"
          : "0 0 10px rgba(239,68,68,0.36)",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    letterSpacing: "0.01em",
    zIndex,
    animation: isHeal
      ? "combatFloatHeal 1020ms ease-out forwards"
      : event.crit
        ? "combatFloatCrit 1080ms ease-out forwards"
        : isSkillDamage
          ? "combatFloatCrit 980ms ease-out forwards"
          : isThornsDamage
            ? "combatFloatDamage 980ms ease-out forwards"
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










