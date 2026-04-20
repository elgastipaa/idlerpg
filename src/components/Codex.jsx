import React, { useEffect, useMemo, useState } from "react";
import { BOSSES } from "../data/bosses";
import { ENEMY_FAMILIES } from "../data/encounters";
import { ITEM_FAMILIES } from "../data/itemFamilies";
import { ITEM_STAT_LABELS } from "../utils/itemPresentation";
import {
  computeCodexBonuses,
  getBestUnlockedTierForPower,
  getCodexBossEntries,
  getCodexFamilyEntries,
  getCodexLegendaryPowerEntries,
  getEarliestTierForFamily,
  getHighestUnlockedTierForFamily,
  getCodexUnlockedMilestones,
} from "../engine/progression/codexEngine";
import { formatRunSigilLoadout, normalizeRunSigilIds, summarizeRunSigilLoadout } from "../data/runSigils";
import { getMaxRunSigilSlots } from "../engine/progression/abyssProgression";
import { getCodexResearchDefinition } from "../engine/sanctuary/jobEngine";

const STAT_DESCRIPTIONS = [
  ["damage", "Dano base de tus golpes normales y de varias habilidades."],
  ["defense", "Reduce el dano recibido antes de block o evade."],
  ["critChance", "Chance de que un golpe sea critico."],
  ["critDamage", "Aumenta el multiplicador del critico."],
  ["healthMax", "Vida maxima."],
  ["healthRegen", "Vida recuperada por tick."],
  ["lifesteal", "Robo de vida basado en el dano que infligis."],
  ["attackSpeed", "Aumenta la chance de sumar un segundo golpe del heroe en el mismo tick."],
  ["multiHitChance", "Chance adicional de encadenar otro golpe extra dentro del mismo tick."],
  ["bleedChance", "Chance de aplicar Sangrado al impactar."],
  ["bleedDamage", "Aumenta el dano por tick del Sangrado."],
  ["fractureChance", "Chance de aplicar Fractura y bajar la defensa efectiva del enemigo."],
  ["dodgeChance", "Chance de esquivar por completo un golpe enemigo."],
  ["blockChance", "Chance de bloquear por completo un golpe enemigo."],
  ["damageOnKill", "Dano extra para el siguiente golpe tras matar."],
  ["critOnLowHp", "Critico adicional cuando estas con poca vida."],
  ["thorns", "Dano reflejado cuando recibis golpes."],
  ["goldBonus", "Oro plano extra por kill o por item."],
  ["xpBonus", "XP porcentual extra."],
  ["essenceBonus", "Esencia plana extra por kill."],
  ["lootBonus", "Aumenta la chance global de drop."],
  ["luck", "Mejora la calidad y frecuencia del botin."],
  ["markChance", "Chance de aplicar Marca al impactar."],
  ["markEffectPerStack", "Cuanto mas dano extra aporta cada stack de Marca."],
];

const SYSTEMS = [
  ["Items base", "Definen la pieza inicial: nombre, rareza, familia y stats base."],
  ["Familias de items", "Cada familia da un implicit fijo segun rareza, como espada=crit o plate=bloqueo."],
  ["Afijos", "Prefijos y sufijos rolados con tiers T3/T2/T1 y valores variables."],
  ["Roll perfecto", "Un afijo que cae en el 10% superior de su rango."],
  ["Arbol de talentos", "Los talentos se desbloquean con Talent Points y siguen prerequisitos de rama."],
  ["Auto-loot", "Permite auto-vender o auto-extraer rarezas elegidas para aliviar inventario."],
  ["Forja", "Upgrade, reroll, pulir, reforge, ascender y extraer para mejorar o reciclar equipo."],
  ["Progreso offline", "Simula hasta 1 hora de ticks cuando no estabas mirando el juego."],
];

const AFFIX_TIERS = [
  ["T1", "El tier mas poderoso y el mas raro."],
  ["T2", "Un tier intermedio, bueno para piezas solidas."],
  ["T3", "El tier mas comun, ideal para bases tempranas o rerolls."],
];

const RARITY_GUIDE = [
  ["Common", "Base simple y limpia. Sirve para equiparte temprano o reciclar."],
  ["Magic", "Empieza a mostrar identidad sin quedar sobrecargado."],
  ["Rare", "Botin serio. Suele abrir decisiones reales de build."],
  ["Epic", "Piezas deseables con mucho potencial de crafting."],
  ["Legendary", "Drops de persecucion, muy raros y con fantasias fuertes."],
];

function formatImplicit(bonus = {}) {
  return Object.entries(bonus)
    .map(([key, value]) => `${key}: ${typeof value === "number" && value < 1 ? `${Math.round(value * 100)}%` : value}`)
    .join(" · ");
}

function formatBonusValue(key, value) {
  const percentKeys = new Set(["damagePct", "defensePct", "hpPct", "goldPct", "xpPct", "attackSpeed", "multiHitChance", "bleedChance", "bleedDamage", "fractureChance", "lifesteal", "dodgeChance", "blockChance", "critDamage", "essenceBonus", "lootBonus", "markChance", "markEffectPerStack", "flatCrit"]);
  if (percentKeys.has(key)) return `+${Math.round(value * 1000) / 10}%`;
  return `+${value}`;
}

function formatHuntFamilies(entry) {
  return (entry?.favoredFamilies || []).map(familyId => ITEM_FAMILIES[familyId]?.name || familyId).join(" · ");
}

function formatHuntStats(entry) {
  return (entry?.favoredStats || []).map(stat => ITEM_STAT_LABELS[stat] || stat).join(" · ");
}

function formatRemaining(ms = 0) {
  const remainingMs = Math.max(0, Number(ms || 0));
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

const BONUS_LABELS = {
  damagePct: "Dano",
  defensePct: "Defensa",
  hpPct: "Vida",
  healthRegen: "Regen",
  attackSpeed: "Velocidad",
  multiHitChance: "Multi-hit",
  bleedChance: "Sangrado",
  bleedDamage: "Poder de sangrado",
  fractureChance: "Fractura",
  lifesteal: "Robo de vida",
  dodgeChance: "Evasion",
  blockChance: "Bloqueo",
  critDamage: "Dano critico",
  flatCrit: "Crit",
  thorns: "Espinas",
  essenceBonus: "Esencia",
  lootBonus: "Botin",
  luck: "Suerte",
  markChance: "Marca",
  markEffectPerStack: "Potencia de marca",
  goldPct: "Oro",
};

const BOSS_NAME_BY_ID = Object.fromEntries(BOSSES.map(boss => [boss.id, boss.name]));
export default function Codex({ state, dispatch, mode = "hunt" }) {
  const [activeTab, setActiveTab] = useState("mastery");
  const [now, setNow] = useState(Date.now());
  const isLibraryMode = mode === "library";
  const isHuntMode = !isLibraryMode;
  const codex = state?.codex || {};
  const currentTier = Number(state?.combat?.currentTier || 1);
  const sanctuary = state?.sanctuary || {};
  const sanctuaryJobs = Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : [];
  const codexInk = Math.max(0, Number(sanctuary?.resources?.codexInk || 0));
  const relicDust = Math.max(0, Number(sanctuary?.resources?.relicDust || 0));
  const maxUnlockedTier = Number(state?.combat?.maxTier || 1);
  const runContext = state?.combat?.runContext || null;
  const expeditionPhase = state?.expedition?.phase || "sanctuary";
  const expeditionSeenFamilyIds = Array.isArray(state?.expedition?.seenFamilyIds) ? state.expedition.seenFamilyIds : [];
  const playerClass = state?.player?.class || null;
  const playerSpec = state?.player?.specialization || null;
  const runSigilSlotCount = getMaxRunSigilSlots(state?.abyss || {});
  const activeRunSigilIds = normalizeRunSigilIds(
    state?.combat?.activeRunSigilIds || state?.combat?.activeRunSigilId || "free",
    { slots: runSigilSlotCount }
  );
  const activeRunSigilLoadout = formatRunSigilLoadout(activeRunSigilIds);
  const activeRunSigilSummary = summarizeRunSigilLoadout(activeRunSigilIds);
  const hasActiveRunSigilBias = activeRunSigilIds.some(sigilId => sigilId !== "free");
  const familyEntries = useMemo(() => getCodexFamilyEntries(codex), [codex]);
  const bossEntries = useMemo(
    () => getCodexBossEntries(codex, { maxTier: maxUnlockedTier, runContext, abyss: state?.abyss || {} }),
    [codex, maxUnlockedTier, runContext, state?.abyss]
  );
  const powerEntries = useMemo(() => getCodexLegendaryPowerEntries(codex, { abyss: state?.abyss || {} }), [codex, state?.abyss]);
  const codexBonuses = useMemo(() => computeCodexBonuses(codex), [codex]);
  const unlockedMilestones = useMemo(() => getCodexUnlockedMilestones(codex, { abyss: state?.abyss || {} }), [codex, state?.abyss]);
  const visibleBonuses = Object.entries(codexBonuses)
    .filter(([, value]) => Math.abs(value || 0) > 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 8);
  const runningResearchJobs = useMemo(
    () =>
      sanctuaryJobs
        .filter(job => job?.type === "codex_research" && job?.status === "running")
        .sort((left, right) => Number(left?.endsAt || 0) - Number(right?.endsAt || 0)),
    [sanctuaryJobs]
  );
  const claimableResearchJobs = useMemo(
    () => sanctuaryJobs.filter(job => job?.type === "codex_research" && job?.status === "claimable"),
    [sanctuaryJobs]
  );
  const hasRunningResearch = runningResearchJobs.length > 0;
  const familyResearchDefinitions = useMemo(
    () => Object.fromEntries(familyEntries.map(entry => [entry.id, getCodexResearchDefinition(codex, { researchType: "family", targetId: entry.id })])),
    [codex, familyEntries]
  );
  const bossResearchDefinitions = useMemo(
    () => Object.fromEntries(bossEntries.map(entry => [entry.id, getCodexResearchDefinition(codex, { researchType: "boss", targetId: entry.id })])),
    [codex, bossEntries]
  );
  const powerResearchDefinitions = useMemo(
    () => Object.fromEntries(powerEntries.map(entry => [entry.id, getCodexResearchDefinition(codex, { researchType: "power", targetId: entry.id })])),
    [codex, powerEntries]
  );
  const libraryNextStep = useMemo(() => {
    if (claimableResearchJobs.length > 0) {
      return "Tienes investigaciones listas para reclamar. Activarlas convierte progreso fresco en bonos permanentes.";
    }
    if (runningResearchJobs.length > 0) {
      return "La Biblioteca ya esta trabajando. Sigue cazando kills y copias mientras esperas para preparar el siguiente rango.";
    }
    if (codexInk <= 0) {
      return "No tienes tinta todavia. Recupera `codex_trace`, destilalo en Santuario y vuelve para activar hitos.";
    }
    return "Las kills historicas no activan bonos solas. Primero llena progreso fresco del objetivo y luego gasta tinta para investigarlo.";
  }, [claimableResearchJobs.length, runningResearchJobs.length, codexInk]);
  const undiscoveredPowerTargets = useMemo(() => {
    const bossEntriesById = Object.fromEntries(bossEntries.map(entry => [entry.id, entry]));
    const familyEntriesById = Object.fromEntries(familyEntries.map(entry => [entry.id, entry]));
    const targets = new Map();

    const registerTarget = (key, payload, powerId) => {
      const existing = targets.get(key);
      if (existing) {
        existing.powerIds.add(powerId);
        return;
      }
      targets.set(key, {
        ...payload,
        powerIds: new Set([powerId]),
      });
    };

    for (const power of powerEntries) {
      if (power.unlocked) continue;

      for (const bossId of power.sources?.bossIds || []) {
        const bossEntry = bossEntriesById[bossId];
        if (!bossEntry?.seen || !bossEntry?.inCurrentRoute || !bossEntry?.earliestCurrentRunTier) continue;
        registerTarget(
          `boss:${bossId}`,
          {
            id: `boss:${bossId}`,
            type: "boss",
            name: bossEntry.name,
            subtitle: `Boss · Slot ${bossEntry.currentRunSlot}`,
            tier: bossEntry.earliestCurrentRunTier,
          },
          power.id
        );
      }

      for (const familyId of power.sources?.familyIds || []) {
        const familyEntry = familyEntriesById[familyId];
        if (!familyEntry?.seen) continue;
        const currentRunTier = getEarliestTierForFamily(familyId, runContext);
        if (!currentRunTier) continue;
        registerTarget(
          `family:${familyId}`,
          {
            id: `family:${familyId}`,
            type: "family",
            name: familyEntry.name,
            subtitle: "Familia",
            tier: currentRunTier,
          },
          power.id
        );
      }
    }

    return [...targets.values()]
      .map(entry => ({
        ...entry,
        undiscoveredCount: entry.powerIds.size,
      }))
      .sort((left, right) => left.tier - right.tier || left.name.localeCompare(right.name, "es"));
  }, [bossEntries, familyEntries, powerEntries, runContext]);
  const availablePowerTargets = useMemo(
    () => undiscoveredPowerTargets.filter(entry => entry.tier <= maxUnlockedTier).slice(0, 6),
    [undiscoveredPowerTargets, maxUnlockedTier]
  );
  const orderedFamilyEntries = useMemo(
    () =>
      [...familyEntries].sort((left, right) => {
        if (left.seen !== right.seen) return left.seen ? -1 : 1;
        return (right.kills || 0) - (left.kills || 0) || left.name.localeCompare(right.name, "es");
      }),
    [familyEntries]
  );
  const orderedBossEntries = useMemo(
    () =>
      [...bossEntries].sort((left, right) => {
        if (left.seen !== right.seen) return left.seen ? -1 : 1;
        if (left.inCurrentRoute !== right.inCurrentRoute) return left.inCurrentRoute ? -1 : 1;
        return (left.earliestCurrentRunTier || left.baseTier || Number.MAX_SAFE_INTEGER)
          - (right.earliestCurrentRunTier || right.baseTier || Number.MAX_SAFE_INTEGER)
          || (right.kills || 0) - (left.kills || 0);
      }),
    [bossEntries]
  );
  const orderedPowerEntries = useMemo(
    () =>
      [...powerEntries].sort((left, right) => {
        if (left.unlocked !== right.unlocked) return left.unlocked ? -1 : 1;
        return (right.discoveries || 0) - (left.discoveries || 0) || left.name.localeCompare(right.name, "es");
      }),
    [powerEntries]
  );
  const routeBosses = useMemo(
    () => orderedBossEntries.filter(entry => entry.inCurrentRoute && entry.seen),
    [orderedBossEntries]
  );
  const accessibleBosses = useMemo(
    () => routeBosses.filter(entry => entry.bestUnlockedTier != null),
    [routeBosses]
  );
  const hiddenPowersCount = powerEntries.filter(entry => !entry.unlocked).length;
  const activePowersCount = powerEntries.filter(entry => entry.unlocked).length;
  const goToTier = (tier) => {
    if (!dispatch || !tier || tier > maxUnlockedTier) return;
    dispatch({ type: "SET_TIER", tier });
    dispatch({ type: "SET_TAB", tab: "combat" });
  };
  const startResearch = (researchType, targetId) => {
    if (!dispatch) return;
    dispatch({ type: "START_CODEX_RESEARCH", researchType, targetId });
  };
  const claimResearch = (jobId) => {
    if (!dispatch || !jobId) return;
    dispatch({ type: "CLAIM_SANCTUARY_JOB", jobId });
  };

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section style={panelStyle}>
        <div style={titleStyle}>{isLibraryMode ? "Biblioteca" : "Caza"}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
          {isLibraryMode
            ? "La Biblioteca del Santuario concentra archivo, maestrias e investigacion: las kills y copias quedan registradas historicamente, pero los bonos permanentes se activan con tinta y progreso fresco."
            : "Panel tactico de hunt: solo muestra objetivos, bosses y powers utiles para esta expedicion, sin meter burocracia de investigacion."}
        </div>
        {hasActiveRunSigilBias && (
          <div style={{ marginTop: "10px", padding: "8px 10px", borderRadius: "10px", background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.4, fontWeight: "800" }}>
            <strong style={{ color: "var(--tone-accent, #4338ca)" }}>{activeRunSigilLoadout}</strong> activo · {activeRunSigilSummary}
          </div>
        )}
        {isLibraryMode && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
            <button onClick={() => setActiveTab("mastery")} style={tabBtnStyle(activeTab === "mastery")}>Archivo</button>
            <button onClick={() => setActiveTab("glossary")} style={tabBtnStyle(activeTab === "glossary")}>Glosario</button>
          </div>
        )}
      </section>

      {isHuntMode ? (
        <>
          <section style={huntHeroPanelStyle}>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: "6px" }}>
                  <div style={huntEyebrowStyle}>Radar tactico</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                    {expeditionPhase === "active" ? `Tier ${currentTier} / ${maxUnlockedTier}` : "Fuera de expedicion"}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45, maxWidth: "58ch" }}>
                    {expeditionPhase === "active"
                      ? "Pantalla de consulta rapida: objetivos ya revelados, bosses presentes en la seed actual y fuentes historicas que ya conoces."
                      : "Caza queda lista antes de salir: te muestra solo informacion tactica y ya revelada, sin recomendar por vos."}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span style={huntHeroChipStyle("var(--tone-accent, #4338ca)", "var(--tone-accent-soft, #eef2ff)")}>
                    {playerSpec ? `${playerSpec}` : playerClass ? `${playerClass}` : "Sin build"}
                  </span>
                  <span style={huntHeroChipStyle("var(--tone-info, #0369a1)", "var(--tone-info-soft, #f0f9ff)")}>
                    {routeBosses.length} bosses en ruta
                  </span>
                  <span style={huntHeroChipStyle("var(--tone-warning, #f59e0b)", "var(--tone-warning-soft, #fff7ed)")}>
                    {hiddenPowersCount} powers ocultos
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                <div style={huntMetricCardStyle}>
                  <div style={huntMetricLabelStyle}>Targets revelados</div>
                  <div style={huntMetricValueStyle}>{availablePowerTargets.length}</div>
                  <div style={huntMetricHintStyle}>ya accesibles hoy</div>
                </div>
                <div style={huntMetricCardStyle}>
                  <div style={huntMetricLabelStyle}>Bosses accesibles</div>
                  <div style={huntMetricValueStyle}>{accessibleBosses.length}</div>
                  <div style={huntMetricHintStyle}>dentro de tu frontera</div>
                </div>
                <div style={huntMetricCardStyle}>
                  <div style={huntMetricLabelStyle}>Powers activos</div>
                  <div style={huntMetricValueStyle}>{activePowersCount}</div>
                  <div style={huntMetricHintStyle}>ya vistos historicamente</div>
                </div>
                <div style={huntMetricCardStyle}>
                  <div style={huntMetricLabelStyle}>Expedicion</div>
                  <div style={huntMetricValueStyle}>
                    {expeditionPhase === "active" ? "Activa" : expeditionPhase === "setup" ? "Setup" : "Santuario"}
                  </div>
                  <div style={huntMetricHintStyle}>
                    {expeditionPhase === "active" ? `empujando Tier ${currentTier}` : "sin combate corriendo"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Objetivos revelados</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
              <div style={cardStyle}>
                <div style={huntPanelTitleStyle}>Powers ocultos accesibles ahora</div>
                {availablePowerTargets.length > 0 ? availablePowerTargets.map(entry => (
                  <div key={`power-now-${entry.id}`} style={huntRowStyle}>
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>{entry.name}</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>
                        {entry.subtitle} · Tier {entry.tier} · {entry.undiscoveredCount} power{entry.undiscoveredCount === 1 ? "" : "s"}
                      </div>
                    </div>
                    <button onClick={() => goToTier(entry.tier)} style={miniHuntButtonStyle}>
                      Ir
                    </button>
                  </div>
                )) : (
                  <div style={huntEmptyStyle}>No tenes objetivos ya revelados con powers ocultos dentro de tu frontera actual.</div>
                )}
              </div>

              <div style={cardStyle}>
                <div style={huntPanelTitleStyle}>Bosses de esta seed</div>
                {routeBosses.length > 0 ? routeBosses.map(entry => (
                  <div key={`route-boss-${entry.id}`} style={huntRowStyle}>
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>{entry.name}</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>
                        Slot {entry.currentRunSlot} · {entry.bestUnlockedTier != null ? `Tier ${entry.bestUnlockedTier}` : `desbloquea en Tier ${entry.earliestCurrentRunTier}`}
                      </div>
                    </div>
                    {entry.bestUnlockedTier != null ? (
                      <button onClick={() => goToTier(entry.bestUnlockedTier)} style={miniHuntButtonStyle}>
                        Ir
                      </button>
                    ) : (
                      <span style={huntMetaStyle}>Aun no</span>
                    )}
                  </div>
                )) : (
                  <div style={huntEmptyStyle}>Todavia no revelaste bosses suficientes de la ruta actual.</div>
                )}
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Poderes legendarios</div>
            <div style={gridStyle}>
              {orderedPowerEntries.filter(entry => entry.unlocked).length > 0 ? orderedPowerEntries
                .filter(entry => entry.unlocked)
                .map(entry => (
                  <div key={entry.id} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                      <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{entry.name}</div>
                      <span style={{
                        fontSize: "0.5rem",
                        fontWeight: "900",
                        textTransform: "uppercase",
                        borderRadius: "999px",
                        padding: "2px 6px",
                        border: "1px solid var(--tone-warning, #fb923c)",
                        background: "var(--tone-warning-soft, #fff7ed)",
                        color: "var(--tone-danger, #c2410c)",
                      }}>
                        Descubierto
                      </span>
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", marginTop: "2px", textTransform: "uppercase", fontWeight: "900" }}>
                      {entry.archetype}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.35 }}>
                      {entry.description}
                    </div>
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "8px", fontWeight: "800" }}>
                      Descubrimientos: {entry.discoveries}
                    </div>
                    {entry.sources?.bossIds?.length > 0 && (
                      <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
                        <strong>Boss:</strong> {entry.sources.bossIds.map(bossId => BOSS_NAME_BY_ID[bossId] || bossId).join(" · ")}
                      </div>
                    )}
                    {entry.sources?.familyIds?.length > 0 && (
                      <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px" }}>
                        <strong>Familias:</strong> {entry.sources.familyIds.map(familyId => ENEMY_FAMILIES[familyId]?.name || familyId).join(" · ")}
                      </div>
                    )}
                    {dispatch && (() => {
                      const sourceTier = getBestUnlockedTierForPower(entry, maxUnlockedTier, runContext);
                      if (!sourceTier) return null;
                      return (
                        <button onClick={() => goToTier(sourceTier)} style={huntButtonStyle}>
                          Ir al tier {sourceTier}
                        </button>
                      );
                    })()}
                  </div>
                )) : (
                <div style={cardStyle}>Todavia no descubriste powers legendarios.</div>
              )}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Familias reveladas</div>
            <div style={cardStyle}>
              <div style={huntPanelTitleStyle}>Familias visibles en esta run</div>
              {orderedFamilyEntries.filter(entry => entry.seen && expeditionSeenFamilyIds.includes(entry.id)).length > 0 ? orderedFamilyEntries
                .filter(entry => entry.seen && expeditionSeenFamilyIds.includes(entry.id))
                .map(entry => {
                  const familyTier = getHighestUnlockedTierForFamily(entry.id, maxUnlockedTier, runContext);
                  return (
                    <div key={`family-run-${entry.id}`} style={huntIntelRowStyle}>
                      <div style={{ display: "grid", gap: "4px" }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>{entry.name}</div>
                        <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)" }}>
                          {entry.traitName} · {familyTier != null ? `hasta Tier ${familyTier}` : "presente en la seed actual"}
                        </div>
                      </div>
                      {familyTier != null ? (
                        <button onClick={() => goToTier(familyTier)} style={miniHuntButtonStyle}>
                          Ir
                        </button>
                      ) : (
                        <span style={huntMetaStyle}>Vista</span>
                      )}
                    </div>
                  );
                }) : (
                <div style={huntEmptyStyle}>Todavia no viste familias reveladas dentro de esta expedicion.</div>
              )}
            </div>
          </section>
        </>
      ) : activeTab === "mastery" ? (
        <>
          <section style={panelStyle}>
            <div style={sectionStyle}>Siguiente paso</div>
            <div style={{ ...cardStyle, background: "var(--tone-accent-soft, #eef2ff)", border: "1px solid rgba(99,102,241,0.18)" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)" }}>Biblioteca del Santuario</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.45 }}>
                {libraryNextStep}
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Resumen</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Familias</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{familyEntries.reduce((total, entry) => total + (entry.kills || 0), 0)}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>bajas acumuladas</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Bosses</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{bossEntries.reduce((total, entry) => total + (entry.kills || 0), 0)}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>bosses abatidos</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Hitos</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{unlockedMilestones}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>investigados + poderes</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Poderes</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{powerEntries.filter(entry => entry.unlocked).length}/{powerEntries.length}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>poderes descubiertos</div>
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Investigacion</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Tinta</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{codexInk}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>lista para Biblioteca</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Fragmentos</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{relicDust}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>soporte para estudios caros</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>En curso</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{runningResearchJobs.length}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>investigaciones activas</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Listas</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{claimableResearchJobs.length}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>para reclamar</div>
              </div>
            </div>
            {claimableResearchJobs.length > 0 && (
              <div style={{ display: "grid", gap: "8px", marginTop: "10px" }}>
                {claimableResearchJobs.map(job => (
                  <div key={job.id} style={{ ...cardStyle, background: "var(--tone-success-soft, #ecfdf5)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>{job.input?.label || "Investigacion"}</div>
                        <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px" }}>
                          {job.output?.rewardLabel || "Hito listo"} · lista para activar
                        </div>
                      </div>
                      <button onClick={() => claimResearch(job.id)} style={researchButtonStyle()}>
                        Reclamar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {runningResearchJobs.length > 0 && (
              <div style={{ display: "grid", gap: "8px", marginTop: claimableResearchJobs.length > 0 ? "8px" : "10px" }}>
                {runningResearchJobs.map(job => (
                  <div key={job.id} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: "900" }}>{job.input?.label || "Investigacion"}</div>
                        <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px" }}>
                          {job.output?.rewardLabel || "Hito"} · termina en {formatRemaining(Number(job.endsAt || 0) - now)}
                        </div>
                      </div>
                      <span style={{ ...miniBadgeStyle, color: "var(--tone-accent, #4338ca)", borderColor: "rgba(99,102,241,0.22)" }}>
                        En curso
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {claimableResearchJobs.length === 0 && runningResearchJobs.length === 0 && (
              <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "10px", lineHeight: 1.45 }}>
                La Biblioteca concentra el archivo historico. La activacion de hitos y maestrias avanzadas se hace aca, con tinta y progreso fresco capado por objetivo.
              </div>
            )}
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Poderes Legendarios</div>
            <div style={gridStyle}>
              {orderedPowerEntries.map(entry => (
                <div key={entry.id} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{entry.unlocked ? entry.name : "???"}</div>
                    <span style={{
                      fontSize: "0.5rem",
                      fontWeight: "900",
                      textTransform: "uppercase",
                      borderRadius: "999px",
                      padding: "2px 6px",
                      border: "1px solid",
                      borderColor: entry.unlocked ? "var(--tone-warning, #fb923c)" : "var(--color-border-primary, #cbd5e1)",
                      background: entry.unlocked ? "var(--tone-warning-soft, #fff7ed)" : "var(--color-background-secondary, #fff)",
                      color: entry.unlocked ? "var(--tone-danger, #c2410c)" : "var(--color-text-secondary, #64748b)",
                    }}>
                      {entry.unlocked ? "Descubierto" : "Oculto"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", marginTop: "2px", textTransform: "uppercase", fontWeight: "900" }}>
                    {entry.unlocked ? entry.archetype : "oculto"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.35 }}>
                    {entry.unlocked ? entry.description : "Derrota a su objetivo de caza al menos una vez para registrar este poder en tu Biblioteca."}
                  </div>
                  {entry.unlocked && (
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "8px", fontWeight: "800" }}>
                      Descubrimientos: {entry.discoveries} · Investigado: {entry.mastery?.label || "Descubierto"}
                    </div>
                  )}
                  {entry.unlocked && entry.mastery?.rank > 1 && (
                    <div style={{ fontSize: "0.58rem", color: "var(--tone-accent, #4338ca)", marginTop: "4px", fontWeight: "800", lineHeight: 1.35 }}>
                      Injerto -{Math.round((entry.mastery.imprintCostReduction || 0) * 100)}% · Caza +{Math.round((entry.mastery.huntBias || 0) * 100)}%
                    </div>
                  )}
                  {entry.unlocked && entry.mastery?.nextRank && (
                    <div style={{ fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", marginTop: "3px", fontWeight: "800", lineHeight: 1.35 }}>
                      Proximo: {entry.mastery.nextRank.label} · {entry.mastery.researchProgress || 0}/{entry.mastery.researchNeeded || entry.mastery.nextRank.discoveries || 0} copias frescas
                    </div>
                  )}
                  {entry.unlocked && entry.mastery?.nextRank && powerResearchDefinitions[entry.id]?.cost && (
                    <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", fontWeight: "800", lineHeight: 1.35 }}>
                      Costo: {powerResearchDefinitions[entry.id].cost.ink} tinta{powerResearchDefinitions[entry.id].cost.dust ? ` · ${powerResearchDefinitions[entry.id].cost.dust} polvo` : ""} · {formatRemaining(powerResearchDefinitions[entry.id].cost.durationMs)}
                    </div>
                  )}
                  {entry.unlocked && entry.mastery?.nextRank && (
                    <div style={{ ...progressBarWrapStyle, marginTop: "6px" }}>
                      <div style={{ ...progressBarFillStyle, width: `${Math.min(100, (((entry.mastery?.researchProgress || 0) / Math.max(1, entry.mastery?.researchNeeded || 1)) * 100))}%` }} />
                    </div>
                  )}
                  {entry.unlocked && entry.sources?.bossIds?.length > 0 && (
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
                      <strong>Boss:</strong> {entry.sources.bossIds.map(bossId => BOSS_NAME_BY_ID[bossId] || bossId).join(" · ")}
                    </div>
                  )}
                  {entry.unlocked && entry.sources?.familyIds?.length > 0 && (
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px" }}>
                      <strong>Familias:</strong> {entry.sources.familyIds.map(familyId => ENEMY_FAMILIES[familyId]?.name || familyId).join(" · ")}
                    </div>
                  )}
                  {entry.unlocked && dispatch && (() => {
                    const sourceTier = getBestUnlockedTierForPower(entry, maxUnlockedTier, runContext);
                    if (!sourceTier) return null;
                    return (
                      <button onClick={() => goToTier(sourceTier)} style={huntButtonStyle}>
                        Ir al tier {sourceTier}
                      </button>
                    );
                  })()}
                  {entry.unlocked && entry.mastery?.canResearchNext && (
                    <button
                      onClick={() => startResearch("power", entry.id)}
                      disabled={hasRunningResearch}
                      style={{
                        ...researchButtonStyle(),
                        marginTop: "8px",
                        opacity: hasRunningResearch ? 0.55 : 1,
                        cursor: hasRunningResearch ? "not-allowed" : "pointer",
                      }}
                    >
                      {hasRunningResearch ? "Investigacion ocupada" : `Investigar ${entry.mastery?.nextRank?.label || "siguiente rango"}`}
                    </button>
                  )}
                  <div style={{ fontSize: "0.58rem", color: entry.unlocked ? "var(--tone-accent, #4338ca)" : "var(--color-text-tertiary, #94a3b8)", marginTop: "8px", fontWeight: "900" }}>
                    {entry.unlocked ? "Disponible para ascender a legendario" : "Todavia no disponible para ascender"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Bonos activos</div>
            <div style={gridStyle}>
              {visibleBonuses.length > 0 ? visibleBonuses.map(([key, value]) => (
                <div key={key} style={cardStyle}>
                  <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{BONUS_LABELS[key] || key}</div>
                  <div style={{ fontSize: "0.86rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)", marginTop: "4px" }}>{formatBonusValue(key, value)}</div>
                </div>
              )) : (
                <div style={cardStyle}>Todavia no activaste hitos de Biblioteca.</div>
              )}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Familias</div>
            <div style={gridStyle}>
              {orderedFamilyEntries.map(entry => (
                <div key={entry.id} style={cardStyle}>
                  {entry.seen ? (
                    <>
                      <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{entry.name}</div>
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>{entry.traitName}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.35 }}>{entry.description}</div>
                      <div style={{ fontSize: "0.76rem", fontWeight: "900", marginTop: "8px" }}>{entry.kills} bajas</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", fontWeight: "800" }}>
                        Investigado: {entry.researchedRank || 0}/{entry.maxResearchRank || entry.milestones?.length || 0}
                        {entry.nextMilestone ? ` · fresco ${entry.researchProgress || 0}/${entry.researchNeeded || entry.nextMilestone.kills}` : " · maestria completa"}
                      </div>
                      <div style={{ ...progressBarWrapStyle, marginTop: "6px" }}>
                        <div style={{ ...progressBarFillStyle, width: `${Math.min(100, (((entry.researchProgress || 0) / Math.max(1, entry.researchNeeded || 1)) * 100))}%` }} />
                      </div>
                      {dispatch && (() => {
                        const familyTier = getHighestUnlockedTierForFamily(entry.id, maxUnlockedTier, runContext);
                        if (!familyTier) return null;
                        return (
                          <button onClick={() => goToTier(familyTier)} style={{ ...huntButtonStyle, marginTop: "8px" }}>
                            Ir al tier {familyTier}
                          </button>
                        );
                      })()}
                      {entry.researchReady && (
                        <button
                          onClick={() => startResearch("family", entry.id)}
                          disabled={hasRunningResearch}
                          style={{
                            ...researchButtonStyle(),
                            marginTop: "8px",
                            opacity: hasRunningResearch ? 0.55 : 1,
                            cursor: hasRunningResearch ? "not-allowed" : "pointer",
                          }}
                        >
                          {hasRunningResearch ? "Investigacion ocupada" : `Investigar ${entry.nextMilestone?.label || "siguiente hito"}`}
                        </button>
                      )}
                      {entry.nextMilestone && familyResearchDefinitions[entry.id]?.cost && (
                        <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", marginTop: "5px", fontWeight: "800", lineHeight: 1.35 }}>
                          Costo: {familyResearchDefinitions[entry.id].cost.ink} tinta{familyResearchDefinitions[entry.id].cost.dust ? ` · ${familyResearchDefinitions[entry.id].cost.dust} polvo` : ""} · {formatRemaining(familyResearchDefinitions[entry.id].cost.durationMs)}
                        </div>
                      )}
                      <div style={{ display: "grid", gap: "5px", marginTop: "8px" }}>
                        {entry.milestones.map((milestone, index) => {
                          const unlocked = (entry.researchedRank || 0) > index;
                          return (
                            <div key={`${entry.id}-milestone-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", fontSize: "0.64rem" }}>
                              <span style={{ color: unlocked ? "var(--tone-success-strong, #047857)" : "var(--color-text-secondary, #64748b)", fontWeight: "900" }}>{milestone.kills} bajas</span>
                              <span style={{ color: unlocked ? "var(--tone-success-strong, #047857)" : "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>{milestone.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>???</div>
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>Familia no descubierta</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.35 }}>
                        Encontra y derrota enemigos de esta familia en alguna run para revelar su ficha en la Biblioteca.
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Bosses</div>
            <div style={gridStyle}>
              {orderedBossEntries.map(entry => (
                <div key={entry.id} style={cardStyle}>
                  {entry.seen ? (
                    <>
                      <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{entry.name}</div>
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>
                        {entry.inCurrentRoute
                          ? entry.bestUnlockedTier != null
                            ? `Ruta actual · Slot ${entry.currentRunSlot} · Tier ${entry.bestUnlockedTier}`
                            : `Ruta actual · Slot ${entry.currentRunSlot} · desbloquea en Tier ${entry.earliestCurrentRunTier}`
                          : "Fuera de la seed actual"} · {entry.family}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.35 }}>{entry.intro}</div>
                      {(entry.huntLabel || entry.huntDescription || entry.favoredFamilies?.length || entry.favoredStats?.length) && (
                        <div style={{ marginTop: "8px", padding: "8px", borderRadius: "10px", background: "var(--tone-accent-soft, #eef2ff)", border: "1px solid rgba(99,102,241,0.16)" }}>
                          {entry.huntLabel && (
                            <div style={{ fontSize: "0.62rem", fontWeight: "900", color: "var(--tone-accent, #4338ca)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              {entry.huntLabel}
                            </div>
                          )}
                          {entry.huntDescription && (
                            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", marginTop: "4px", lineHeight: 1.35 }}>
                              {entry.huntDescription}
                            </div>
                          )}
                          {entry.favoredFamilies?.length > 0 && (
                            <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px" }}>
                              <strong>Familias:</strong> {formatHuntFamilies(entry)}
                            </div>
                          )}
                          {entry.favoredStats?.length > 0 && (
                            <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px" }}>
                              <strong>Atributos:</strong> {formatHuntStats(entry)}
                            </div>
                          )}
                          {entry.legendaryDrops?.length > 0 && (
                            <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px" }}>
                              <strong>Poderes:</strong> {entry.legendaryDrops.map(drop => drop.name).join(" · ")}
                            </div>
                          )}
                        </div>
                      )}
                      {dispatch && (
                        <button
                          onClick={() => goToTier(entry.bestUnlockedTier)}
                          disabled={!entry.inCurrentRoute || entry.bestUnlockedTier == null}
                          style={{
                            ...huntButtonStyle,
                            marginTop: "8px",
                            opacity: !entry.inCurrentRoute || entry.bestUnlockedTier == null ? 0.5 : 1,
                            cursor: !entry.inCurrentRoute || entry.bestUnlockedTier == null ? "not-allowed" : "pointer",
                          }}
                        >
                          {!entry.inCurrentRoute
                            ? "No aparece en esta run"
                          : entry.bestUnlockedTier == null
                              ? `Llega a Tier ${entry.earliestCurrentRunTier}`
                              : `Ir al tier ${entry.bestUnlockedTier}`}
                        </button>
                      )}
                      <div style={{ fontSize: "0.76rem", fontWeight: "900", marginTop: "8px" }}>{entry.kills} bajas</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", fontWeight: "800" }}>
                        Investigado: {entry.researchedRank || 0}/{entry.maxResearchRank || entry.milestones?.length || 0}
                        {entry.nextMilestone ? ` · fresco ${entry.researchProgress || 0}/${entry.researchNeeded || entry.nextMilestone.kills}` : " · maestria completa"}
                      </div>
                      {entry.nextMilestone && (
                        <div style={{ ...progressBarWrapStyle, marginTop: "6px" }}>
                          <div style={{ ...progressBarFillStyle, width: `${Math.min(100, (((entry.researchProgress || 0) / Math.max(1, entry.researchNeeded || 1)) * 100))}%` }} />
                        </div>
                      )}
                      {entry.researchReady && (
                        <button
                          onClick={() => startResearch("boss", entry.id)}
                          disabled={hasRunningResearch}
                          style={{
                            ...researchButtonStyle(),
                            marginTop: "8px",
                            opacity: hasRunningResearch ? 0.55 : 1,
                            cursor: hasRunningResearch ? "not-allowed" : "pointer",
                          }}
                        >
                          {hasRunningResearch ? "Investigacion ocupada" : `Investigar ${entry.nextMilestone?.label || "siguiente hito"}`}
                        </button>
                      )}
                      {entry.nextMilestone && bossResearchDefinitions[entry.id]?.cost && (
                        <div style={{ fontSize: "0.58rem", color: "var(--color-text-secondary, #64748b)", marginTop: "5px", fontWeight: "800", lineHeight: 1.35 }}>
                          Costo: {bossResearchDefinitions[entry.id].cost.ink} tinta{bossResearchDefinitions[entry.id].cost.dust ? ` · ${bossResearchDefinitions[entry.id].cost.dust} polvo` : ""} · {formatRemaining(bossResearchDefinitions[entry.id].cost.durationMs)}
                        </div>
                      )}
                      <div style={{ display: "grid", gap: "5px", marginTop: "8px" }}>
                        {entry.milestones.map((milestone, index) => {
                          const unlocked = (entry.researchedRank || 0) > index;
                          return (
                            <div key={`${entry.id}-milestone-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", fontSize: "0.64rem" }}>
                              <span style={{ color: unlocked ? "var(--tone-success-strong, #047857)" : "var(--color-text-secondary, #64748b)", fontWeight: "900" }}>{milestone.kills} bajas</span>
                              <span style={{ color: unlocked ? "var(--tone-success-strong, #047857)" : "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>{milestone.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>???</div>
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>Boss no descubierto</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.35 }}>
                        Alcanzalo al menos una vez en alguna run para revelar su pagina de caza y sus posibles drops.
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <section style={panelStyle}>
            <div style={sectionStyle}>Sistemas</div>
            <div style={gridStyle}>
              {SYSTEMS.map(([name, description]) => (
                <div key={name} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Rarezas y Tiers</div>
            <div style={gridStyle}>
              {RARITY_GUIDE.map(([name, description]) => (
                <div key={name} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
                </div>
              ))}
              {AFFIX_TIERS.map(([name, description]) => (
                <div key={name} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Atributos</div>
            <div style={gridStyle}>
              {STAT_DESCRIPTIONS.map(([name, description]) => (
                <div key={name} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Familias</div>
            <div style={gridStyle}>
              {Object.entries(ITEM_FAMILIES).map(([id, family]) => (
                <div key={id} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{family.name}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-tertiary, #94a3b8)", textTransform: "uppercase", marginTop: "2px" }}>{id}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #475569)", marginTop: "6px", lineHeight: 1.35 }}>
                    {Object.entries(family.implicitByRarity || {}).map(([rarity, implicit]) => (
                      <div key={rarity}><strong>{rarity}:</strong> {formatImplicit(implicit)}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const panelStyle = {
  background: "var(--color-background-secondary, #fff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "16px",
  padding: "14px",
  boxShadow: "0 2px 10px var(--color-shadow, rgba(0,0,0,0.03))",
};

const titleStyle = {
  fontSize: "1rem",
  fontWeight: "900",
  color: "var(--color-text-primary, #1e293b)",
};

const sectionStyle = {
  fontSize: "0.68rem",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: "900",
  marginBottom: "10px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "10px",
};

const cardStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "10px",
};

const huntHeroPanelStyle = {
  ...panelStyle,
  background:
    "linear-gradient(135deg, var(--tone-accent-soft, #eef2ff) 0%, var(--color-background-secondary, #ffffff) 58%, var(--tone-info-soft, #f0f9ff) 100%)",
};

const huntEyebrowStyle = {
  fontSize: "0.62rem",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--tone-accent, #4338ca)",
};

const huntHeroChipStyle = (tone, surface) => ({
  border: `1px solid ${tone}`,
  background: surface,
  color: tone,
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "0.6rem",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

const huntMetricCardStyle = {
  background: "var(--color-surface-overlay, rgba(255,255,255,0.92))",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "14px",
  padding: "12px",
  display: "grid",
  gap: "4px",
  boxShadow: "0 10px 24px var(--color-shadow, rgba(15,23,42,0.08))",
};

const huntMetricLabelStyle = {
  fontSize: "0.62rem",
  color: "var(--color-text-tertiary, #94a3b8)",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const huntMetricValueStyle = {
  fontSize: "1.1rem",
  fontWeight: "900",
  color: "var(--color-text-primary, #1e293b)",
};

const huntMetricHintStyle = {
  fontSize: "0.66rem",
  color: "var(--color-text-secondary, #64748b)",
};

const huntFocusStackStyle = {
  display: "grid",
  gap: "10px",
};

const huntFocusCardStyle = {
  background: "var(--color-surface-overlay, rgba(255,255,255,0.9))",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "14px",
  padding: "12px",
  display: "grid",
  gap: "8px",
  boxShadow: "0 10px 24px var(--color-shadow, rgba(15,23,42,0.08))",
};

const huntPriorityCardStyle = {
  ...cardStyle,
  padding: "12px",
  display: "grid",
  gap: "8px",
};

const huntFocusTitleStyle = {
  fontSize: "0.92rem",
  fontWeight: "900",
  color: "var(--color-text-primary, #1e293b)",
};

const huntFocusMetaStyle = {
  fontSize: "0.64rem",
  color: "var(--tone-accent, #4338ca)",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const huntFocusBodyStyle = {
  fontSize: "0.7rem",
  color: "var(--color-text-secondary, #475569)",
  lineHeight: 1.4,
};

const huntPrimaryButtonStyle = {
  border: "1px solid var(--tone-accent, #4338ca)",
  background: "var(--tone-accent-soft, #eef2ff)",
  color: "var(--tone-accent, #4338ca)",
  borderRadius: "10px",
  padding: "8px 11px",
  fontSize: "0.64rem",
  fontWeight: "900",
  cursor: "pointer",
  width: "fit-content",
};

const huntTagStyle = (tone, surface) => ({
  border: `1px solid ${tone}`,
  background: surface,
  color: tone,
  borderRadius: "999px",
  padding: "3px 8px",
  fontSize: "0.56rem",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
});

const huntSignalRowStyle = {
  display: "grid",
  gridTemplateColumns: "92px 1fr",
  gap: "10px",
  alignItems: "start",
};

const huntSignalLabelStyle = {
  fontSize: "0.58rem",
  fontWeight: "900",
  color: "var(--color-text-tertiary, #94a3b8)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const huntSignalValueStyle = {
  fontSize: "0.68rem",
  color: "var(--color-text-secondary, #475569)",
  lineHeight: 1.4,
  fontWeight: "800",
};

const tabBtnStyle = (active) => ({
  border: "1px solid",
  borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #e2e8f0)",
  background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #fff)",
  color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #64748b)",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "0.64rem",
  fontWeight: "900",
  cursor: "pointer",
});

const huntButtonStyle = {
  marginTop: "10px",
  border: "1px solid var(--tone-accent, #4338ca)",
  background: "var(--tone-accent-soft, #eef2ff)",
  color: "var(--tone-accent, #4338ca)",
  borderRadius: "10px",
  padding: "7px 10px",
  fontSize: "0.64rem",
  fontWeight: "900",
  cursor: "pointer",
};

const miniHuntButtonStyle = {
  border: "1px solid var(--tone-accent, #4338ca)",
  background: "var(--tone-accent-soft, #eef2ff)",
  color: "var(--tone-accent, #4338ca)",
  borderRadius: "999px",
  padding: "5px 9px",
  fontSize: "0.6rem",
  fontWeight: "900",
  cursor: "pointer",
};

const researchButtonStyle = () => ({
  border: "1px solid var(--tone-accent, #4338ca)",
  background: "var(--tone-accent-soft, #eef2ff)",
  color: "var(--tone-accent, #4338ca)",
  borderRadius: "10px",
  padding: "7px 10px",
  fontSize: "0.62rem",
  fontWeight: "900",
  cursor: "pointer",
});

const miniBadgeStyle = {
  border: "1px solid var(--color-border-primary, #cbd5e1)",
  background: "var(--color-background-secondary, #fff)",
  borderRadius: "999px",
  padding: "4px 8px",
  fontSize: "0.58rem",
  fontWeight: "900",
};

const huntPanelTitleStyle = {
  fontSize: "0.68rem",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--color-text-secondary, #64748b)",
  marginBottom: "8px",
};

const huntRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  padding: "8px 0",
  borderTop: "1px solid var(--color-border-primary, #e2e8f0)",
};

const huntMetaStyle = {
  fontSize: "0.66rem",
  color: "var(--color-text-secondary, #64748b)",
  padding: "7px 8px",
  borderRadius: "10px",
  background: "var(--color-background-secondary, #fff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
};

const huntEmptyStyle = {
  fontSize: "0.68rem",
  color: "var(--color-text-secondary, #64748b)",
  lineHeight: 1.45,
};

const huntIntelRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "start",
  gap: "10px",
  padding: "10px 0",
  borderTop: "1px solid var(--color-border-primary, #e2e8f0)",
};

const progressBarWrapStyle = {
  height: "6px",
  borderRadius: "999px",
  background: "var(--color-background-primary, #e2e8f0)",
  overflow: "hidden",
};

const progressBarFillStyle = {
  height: "100%",
  background: "var(--tone-accent, #4338ca)",
};
