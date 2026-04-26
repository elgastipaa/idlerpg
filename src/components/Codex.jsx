import React, { useMemo, useState } from "react";
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
  getLibraryLayerUnlockState,
  getCodexUnlockedMilestones,
} from "../engine/progression/codexEngine";
import { formatRunSigilLoadout, normalizeRunSigilIds, summarizeRunSigilLoadout } from "../data/runSigils";
import { getMaxRunSigilSlots } from "../engine/progression/abyssProgression";
import { getCodexResearchDefinition } from "../engine/sanctuary/jobEngine";
import HorizontalOptionSelector from "./HorizontalOptionSelector";

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
  ["Afijos", "Prefijos y sufijos con valor variable y calidad Normal/Excelente."],
  ["Calidad Excelente", "Solo cae por loot y marca lineas premium de una pieza."],
  ["Arbol de talentos", "Los talentos se desbloquean con Talent Points y siguen prerequisitos de rama."],
  ["Auto-loot", "Permite auto-vender rarezas elegidas para aliviar inventario durante la run."],
  ["Forja", "Mejorar, afinar, reforjar e imbuir para cerrar piezas sin romper el valor del loot."],
  ["Progreso offline", "Simula hasta 1 hora de ticks cuando no estabas mirando el juego."],
];

const AFFIX_QUALITY = [
  ["Normal", "Linea base del sistema, crafteable via Afinar/Reforjar."],
  ["Excelente", "Linea premium orientada a drops de alto valor."],
];

const RARITY_GUIDE = [
  ["Common", "Base simple y limpia. Sirve para equiparte temprano o reciclar."],
  ["Magic", "Empieza a mostrar identidad sin quedar sobrecargado."],
  ["Rare", "Botin serio. Suele abrir decisiones reales de build."],
  ["Epic", "Piezas deseables con mucho potencial de crafting."],
  ["Legendary", "Drops de persecucion, muy raros y con fantasias fuertes."],
];

const LIST_PAGE_SIZES = {
  huntPowers: 12,
  huntFamilies: 10,
  libraryPowers: 12,
  libraryFamilies: 10,
  libraryBosses: 8,
  glossaryStats: 12,
  glossaryFamilies: 10,
};

const LIBRARY_MASTERY_GROUPS = [
  {
    id: "libraryPowers",
    label: "Poderes legendarios",
    subtitle: "Descubiertos, ocultos y progreso de investigacion.",
    accent: "var(--tone-warning, #fb923c)",
  },
  {
    id: "libraryFamilies",
    label: "Familias",
    subtitle: "Kills, hitos y avance de investigacion por familia.",
    accent: "var(--tone-success, #10b981)",
  },
  {
    id: "libraryBosses",
    label: "Bosses",
    subtitle: "Registro de caza, ruta y milestones de cada boss.",
    accent: "var(--tone-accent, #4338ca)",
  },
];

const LIBRARY_LAYER_BY_GROUP_ID = {
  libraryPowers: "power",
  libraryFamilies: "family",
  libraryBosses: "boss",
};

const LIBRARY_UNLOCK_LABEL_BY_RESEARCH = {
  unlock_library: "Catalogar Biblioteca",
  library_slots_1: "Mesas de Archivo",
  library_speed_1: "Indices de Consulta",
};

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

function getPaginatedSlice(entries = [], page = 0, pageSize = 10) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const totalPages = Math.max(1, Math.ceil(safeEntries.length / Math.max(1, pageSize)));
  const safePage = Math.max(0, Math.min(Number(page || 0), totalPages - 1));
  const start = safePage * pageSize;
  return {
    entries: safeEntries.slice(start, start + pageSize),
    page: safePage,
    totalPages,
  };
}

function getLibraryUnlockLabel(unlockResearchId = "") {
  return LIBRARY_UNLOCK_LABEL_BY_RESEARCH[unlockResearchId] || unlockResearchId || "investigacion";
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
export default function Codex({ state, dispatch, mode = "hunt", onBack }) {
  const isLibraryMode = mode === "library";
  const isHuntMode = !isLibraryMode;
  const [activeTab, setActiveTab] = useState("mastery");
  const [activeMasteryGroup, setActiveMasteryGroup] = useState("libraryPowers");
  const [collapsedSections, setCollapsedSections] = useState(() => ({
    huntPowers: true,
    huntFamilies: true,
    libraryPowers: !isLibraryMode,
    libraryFamilies: !isLibraryMode,
    libraryBosses: !isLibraryMode,
    glossarySystems: true,
    glossaryRarity: true,
    glossaryStats: true,
    glossaryFamilies: true,
  }));
  const [expandedGroups, setExpandedGroups] = useState({
    libraryPowers: false,
    libraryFamilies: false,
    libraryBosses: false,
    glossaryStats: false,
    glossaryFamilies: false,
  });
  const [listPages, setListPages] = useState({
    huntPowers: 0,
    huntFamilies: 0,
    libraryPowers: 0,
    libraryFamilies: 0,
    libraryBosses: 0,
    glossaryStats: 0,
    glossaryFamilies: 0,
  });
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
  const libraryLayerState = useMemo(() => getLibraryLayerUnlockState(state), [state]);
  const isLibraryGroupUnlocked = groupId => {
    const layerId = LIBRARY_LAYER_BY_GROUP_ID[groupId] || "power";
    return Boolean(libraryLayerState?.layers?.[layerId]?.unlocked);
  };
  const toggleSection = sectionId => {
    setCollapsedSections(current => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };
  const toggleExpandedGroup = groupId => {
    setExpandedGroups(current => ({
      ...current,
      [groupId]: !current[groupId],
    }));
    setListPages(current => ({
      ...current,
      [groupId]: 0,
    }));
  };
  const setListPage = (listId, nextPage) => {
    setListPages(current => ({
      ...current,
      [listId]: Math.max(0, Number(nextPage || 0)),
    }));
  };
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
  const discoveredFamiliesCount = familyEntries.filter(entry => entry.seen).length;
  const discoveredBossesCount = bossEntries.filter(entry => entry.seen).length;
  const huntPowerEntries = useMemo(
    () => orderedPowerEntries.filter(entry => entry.unlocked),
    [orderedPowerEntries]
  );
  const huntFamilyEntries = useMemo(
    () => orderedFamilyEntries.filter(entry => entry.seen && expeditionSeenFamilyIds.includes(entry.id)),
    [orderedFamilyEntries, expeditionSeenFamilyIds]
  );
  const glossaryFamilyEntries = useMemo(
    () => Object.entries(ITEM_FAMILIES),
    []
  );
  const huntPowersPaging = useMemo(
    () => getPaginatedSlice(huntPowerEntries, listPages.huntPowers, LIST_PAGE_SIZES.huntPowers),
    [huntPowerEntries, listPages.huntPowers]
  );
  const huntFamiliesPaging = useMemo(
    () => getPaginatedSlice(huntFamilyEntries, listPages.huntFamilies, LIST_PAGE_SIZES.huntFamilies),
    [huntFamilyEntries, listPages.huntFamilies]
  );
  const libraryPowersPaging = useMemo(
    () => getPaginatedSlice(orderedPowerEntries, listPages.libraryPowers, LIST_PAGE_SIZES.libraryPowers),
    [orderedPowerEntries, listPages.libraryPowers]
  );
  const libraryFamiliesPaging = useMemo(
    () => getPaginatedSlice(orderedFamilyEntries, listPages.libraryFamilies, LIST_PAGE_SIZES.libraryFamilies),
    [orderedFamilyEntries, listPages.libraryFamilies]
  );
  const libraryBossesPaging = useMemo(
    () => getPaginatedSlice(orderedBossEntries, listPages.libraryBosses, LIST_PAGE_SIZES.libraryBosses),
    [orderedBossEntries, listPages.libraryBosses]
  );
  const glossaryStatsPaging = useMemo(
    () => getPaginatedSlice(STAT_DESCRIPTIONS, listPages.glossaryStats, LIST_PAGE_SIZES.glossaryStats),
    [listPages.glossaryStats]
  );
  const glossaryFamiliesPaging = useMemo(
    () => getPaginatedSlice(glossaryFamilyEntries, listPages.glossaryFamilies, LIST_PAGE_SIZES.glossaryFamilies),
    [glossaryFamilyEntries, listPages.glossaryFamilies]
  );
  const visibleLibraryPowerEntries = expandedGroups.libraryPowers ? libraryPowersPaging.entries : orderedPowerEntries.slice(0, 8);
  const visibleLibraryFamilyEntries = expandedGroups.libraryFamilies ? libraryFamiliesPaging.entries : orderedFamilyEntries.slice(0, 8);
  const visibleLibraryBossEntries = expandedGroups.libraryBosses ? libraryBossesPaging.entries : orderedBossEntries.slice(0, 6);
  const visibleGlossaryStats = expandedGroups.glossaryStats ? glossaryStatsPaging.entries : STAT_DESCRIPTIONS.slice(0, 10);
  const visibleGlossaryFamilies = expandedGroups.glossaryFamilies ? glossaryFamiliesPaging.entries : glossaryFamilyEntries.slice(0, 8);
  const selectedMasteryGroupId = LIBRARY_MASTERY_GROUPS.some(group => group.id === activeMasteryGroup)
    ? activeMasteryGroup
    : LIBRARY_MASTERY_GROUPS[0].id;
  const selectedMasteryGroupIndex = LIBRARY_MASTERY_GROUPS.findIndex(group => group.id === selectedMasteryGroupId);
  const selectedMasteryGroupMeta =
    LIBRARY_MASTERY_GROUPS[selectedMasteryGroupIndex] || LIBRARY_MASTERY_GROUPS[0];
  const selectedMasteryLayerId = LIBRARY_LAYER_BY_GROUP_ID[selectedMasteryGroupId] || "power";
  const selectedMasteryLayerState = libraryLayerState?.layers?.[selectedMasteryLayerId] || null;
  const masteryGroupSummary = {
    libraryPowers: isLibraryGroupUnlocked("libraryPowers")
      ? `${orderedPowerEntries.length} registro${orderedPowerEntries.length === 1 ? "" : "s"}`
      : "Bloqueado",
    libraryFamilies: isLibraryGroupUnlocked("libraryFamilies")
      ? `${orderedFamilyEntries.length} familia${orderedFamilyEntries.length === 1 ? "" : "s"}`
      : "Bloqueado",
    libraryBosses: isLibraryGroupUnlocked("libraryBosses")
      ? `${orderedBossEntries.length} boss${orderedBossEntries.length === 1 ? "" : "es"}`
      : "Bloqueado",
  };
  const goToTier = (tier) => {
    if (!dispatch || !tier || tier > maxUnlockedTier) return;
    dispatch({ type: "SET_TIER", tier });
    dispatch({ type: "SET_TAB", tab: "combat" });
  };
  const startResearch = (researchType, targetId) => {
    if (!dispatch) return;
    const layerId =
      researchType === "family"
        ? "family"
        : researchType === "boss"
          ? "boss"
          : "power";
    if (!libraryLayerState?.layers?.[layerId]?.unlocked) return;
    dispatch({ type: "START_CODEX_RESEARCH", researchType, targetId });
  };
  return (
    <div style={{ padding: "calc(0.85rem * var(--density-scale, 1))", display: "flex", flexDirection: "column", gap: "calc(0.8rem * var(--density-scale, 1))", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section style={isLibraryMode ? libraryHeroPanelStyle : panelStyle}>
        {isLibraryMode ? (
          <>
            <div style={{ display: "grid", gap: "12px", alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                  Biblioteca
                </div>
                <div style={{ fontSize: "1.02rem", fontWeight: "900", marginTop: "4px" }}>
                  Archivo del Santuario
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35, maxWidth: "56ch" }}>
                  Convierte kills y descubrimientos en progreso permanente con tinta y estudios de Biblioteca.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={libraryTopChipStyle("var(--tone-accent, #4338ca)")}>
                {activePowersCount}/{powerEntries.length} poderes
              </span>
              <span style={libraryTopChipStyle("var(--tone-success, #10b981)")}>
                {discoveredFamiliesCount} familias
              </span>
              <span style={libraryTopChipStyle("var(--tone-info, #0369a1)")}>
                {discoveredBossesCount} bosses
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
              <div style={libraryTopMetricCardStyle}>
                <div style={libraryTopMetricLabelStyle}>Tinta</div>
                <div style={libraryTopMetricValueStyle}>{Math.floor(codexInk).toLocaleString()}</div>
              </div>
              <div style={libraryTopMetricCardStyle}>
                <div style={libraryTopMetricLabelStyle}>Polvo</div>
                <div style={libraryTopMetricValueStyle}>{Math.floor(relicDust).toLocaleString()}</div>
              </div>
              <div style={libraryTopMetricCardStyle}>
                <div style={libraryTopMetricLabelStyle}>En curso</div>
                <div style={libraryTopMetricValueStyle}>{runningResearchJobs.length}</div>
              </div>
              <div style={libraryTopMetricCardStyle}>
                <div style={libraryTopMetricLabelStyle}>Listas</div>
                <div style={libraryTopMetricValueStyle}>{claimableResearchJobs.length}</div>
              </div>
              <div style={libraryTopMetricCardStyle}>
                <div style={libraryTopMetricLabelStyle}>Hitos</div>
                <div style={libraryTopMetricValueStyle}>{Math.floor(unlockedMilestones).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button onClick={() => setActiveTab("mastery")} style={tabBtnStyle(activeTab === "mastery")}>Archivo</button>
              <button onClick={() => setActiveTab("glossary")} style={tabBtnStyle(activeTab === "glossary")}>Glosario</button>
            </div>

            {onBack && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={onBack} style={overlayBackButtonStyle}>
                  Volver
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={titleStyle}>Intel</div>
            <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
              Radar tactico de esta run: objetivos, bosses y powers utiles sin mezclar investigacion permanente.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px", marginTop: "10px" }}>
              <div
                style={{
                  background: "var(--color-background-tertiary, #f8fafc)",
                  border: "1px solid var(--color-border-primary, #e2e8f0)",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  display: "grid",
                  gap: "4px",
                }}
              >
                <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                  Biblioteca
                </div>
                <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>
                  Progreso persistente del Santuario
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
                  Tinta, hitos, investigaciones y bonus permanentes.
                </div>
              </div>
              <div
                style={{
                  background: "var(--tone-info-soft, #f0f9ff)",
                  border: "1px solid var(--tone-info, #0369a1)",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  display: "grid",
                  gap: "4px",
                }}
              >
                <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", color: "var(--tone-info, #0369a1)" }}>
                  Intel
                </div>
                <div style={{ fontSize: "0.78rem", fontWeight: "900" }}>
                  Lectura tactica para esta expedicion
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4 }}>
                  Bosses en ruta, familias vistas y targets ya accesibles hoy.
                </div>
              </div>
            </div>
            {hasActiveRunSigilBias && (
              <div style={{ marginTop: "10px", padding: "8px 10px", borderRadius: "10px", background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.4, fontWeight: "800" }}>
                <strong style={{ color: "var(--tone-accent, #4338ca)" }}>{activeRunSigilLoadout}</strong> activo · {activeRunSigilSummary}
              </div>
            )}
          </>
        )}
      </section>

      {isHuntMode ? (
        <>
          <section style={huntHeroPanelStyle}>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: "6px" }}>
                  <div style={huntEyebrowStyle}>Radar tactico</div>
                  <div style={{ fontSize: "1.06rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                    {expeditionPhase === "active" ? `Tier ${currentTier} / ${maxUnlockedTier}` : "Fuera de expedicion"}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.4, maxWidth: "52ch" }}>
                    {expeditionPhase === "active"
                      ? "Responde tres cosas rapido: que power puedes ir a buscar, que boss tienes en ruta y que familia ya viste."
                      : "Deja lista la lectura tactica antes de salir, sin recomendar por vos."}
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "var(--tone-info, #0369a1)", fontWeight: "900", lineHeight: 1.35 }}>
                    Biblioteca guarda progreso permanente. Intel solo lee esta run.
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
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
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45, marginBottom: "10px" }}>
              Solo objetivos tacticos ya disponibles para tu frontera actual. La capa de progreso permanente no aparece aca.
            </div>
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
            <button onClick={() => toggleSection("huntPowers")} style={compactToggleButtonStyle}>
              <span style={sectionStyle}>Poderes legendarios</span>
              <span style={collapseLabelStyle}>{collapsedSections.huntPowers ? "+" : "-"}</span>
            </button>
            {!collapsedSections.huntPowers && (
              <div style={gridStyle}>
                {huntPowerEntries.length > 0 ? huntPowersPaging.entries
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
                {huntPowersPaging.totalPages > 1 && (
                  <PaginationControls
                    page={huntPowersPaging.page}
                    totalPages={huntPowersPaging.totalPages}
                    onPrevious={() => setListPage("huntPowers", huntPowersPaging.page - 1)}
                    onNext={() => setListPage("huntPowers", huntPowersPaging.page + 1)}
                  />
                )}
              </div>
            )}
          </section>

          <section style={panelStyle}>
            <button onClick={() => toggleSection("huntFamilies")} style={compactToggleButtonStyle}>
              <span style={sectionStyle}>Familias reveladas</span>
              <span style={collapseLabelStyle}>{collapsedSections.huntFamilies ? "+" : "-"}</span>
            </button>
            {!collapsedSections.huntFamilies && (
              <div style={cardStyle}>
                <div style={huntPanelTitleStyle}>Familias visibles en esta run</div>
                {huntFamilyEntries.length > 0 ? huntFamiliesPaging.entries
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
                {huntFamiliesPaging.totalPages > 1 && (
                  <PaginationControls
                    page={huntFamiliesPaging.page}
                    totalPages={huntFamiliesPaging.totalPages}
                    onPrevious={() => setListPage("huntFamilies", huntFamiliesPaging.page - 1)}
                    onNext={() => setListPage("huntFamilies", huntFamiliesPaging.page + 1)}
                  />
                )}
              </div>
            )}
          </section>
        </>
      ) : activeTab === "mastery" ? (
        <>
          <section style={librarySecondaryPanelStyle}>
            <div style={librarySectionHeadingWrapStyle}>
              <div style={librarySectionTitleStyle}>Bonos activos</div>
              <div style={librarySectionSubtitleStyle}>Efectos permanentes ya aplicados a tu cuenta.</div>
            </div>
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

          <section style={librarySecondaryPanelStyle}>
            <HorizontalOptionSelector
              header={(
                <div style={librarySectionHeadingWrapStyle}>
                  <div style={librarySectionTitleStyle}>{selectedMasteryGroupMeta.label}</div>
                  <div style={librarySectionSubtitleStyle}>{selectedMasteryGroupMeta.subtitle}</div>
                </div>
              )}
              options={LIBRARY_MASTERY_GROUPS}
              selectedId={selectedMasteryGroupId}
              onSelect={group => setActiveMasteryGroup(group.id)}
              getOptionId={group => group.id}
              getOptionKey={group => `library-group-${group.id}`}
              getArrowButtonStyle={({ disabled }) => ({
                ...showMoreButtonStyle,
                minWidth: "34px",
                padding: "4px 0",
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              })}
              getOptionButtonStyle={({ option: group, selected }) => ({
                ...showMoreButtonStyle,
                borderColor: selected ? group.accent : "var(--color-border-primary, #cbd5e1)",
                background: selected ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #fff)",
                color: selected ? group.accent : "var(--color-text-secondary, #64748b)",
                textAlign: "left",
                display: "grid",
                gap: "2px",
                minWidth: "132px",
                justifyItems: "start",
                padding: "6px 10px",
                flexShrink: 0,
              })}
              renderOption={({ option: group }) => (
                <>
                  <span style={{ fontSize: "0.64rem", fontWeight: "900" }}>{group.label}</span>
                  <span style={{ fontSize: "0.56rem", fontWeight: "800", color: "inherit" }}>
                    {masteryGroupSummary[group.id]}
                  </span>
                </>
              )}
            />
          </section>

          {!isLibraryGroupUnlocked(selectedMasteryGroupId) && (
            <section style={librarySecondaryPanelStyle}>
              <div style={librarySectionHeadingWrapStyle}>
                <span style={librarySectionTitleStyle}>{selectedMasteryGroupMeta.label}</span>
                <span style={librarySectionSubtitleStyle}>Esta capa aun no esta habilitada en tu Biblioteca.</span>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.72rem", fontWeight: "900", color: "var(--tone-warning, #f59e0b)" }}>
                  Desbloqueo pendiente
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.4 }}>
                  Completa <strong>{getLibraryUnlockLabel(selectedMasteryLayerState?.unlockResearchId)}</strong> en el Laboratorio para activar esta capa.
                </div>
              </div>
            </section>
          )}

          {selectedMasteryGroupId === "libraryPowers" && isLibraryGroupUnlocked("libraryPowers") && (
          <section style={librarySecondaryPanelStyle}>
            <div style={librarySectionHeadingWrapStyle}>
              <span style={librarySectionTitleStyle}>Poderes legendarios</span>
              <span style={librarySectionSubtitleStyle}>Descubiertos, ocultos y progreso de investigacion.</span>
            </div>
              <div style={gridStyle}>
                {visibleLibraryPowerEntries.map(entry => (
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
              {expandedGroups.libraryPowers && libraryPowersPaging.totalPages > 1 && (
                <PaginationControls
                  page={libraryPowersPaging.page}
                  totalPages={libraryPowersPaging.totalPages}
                  onPrevious={() => setListPage("libraryPowers", libraryPowersPaging.page - 1)}
                  onNext={() => setListPage("libraryPowers", libraryPowersPaging.page + 1)}
                />
              )}
              {orderedPowerEntries.length > 8 && (
                <button onClick={() => toggleExpandedGroup("libraryPowers")} style={showMoreButtonStyle}>
                  {expandedGroups.libraryPowers ? "-" : `+${orderedPowerEntries.length}`}
                </button>
              )}
          </section>
          )}

          {selectedMasteryGroupId === "libraryFamilies" && isLibraryGroupUnlocked("libraryFamilies") && (
          <section style={librarySecondaryPanelStyle}>
            <div style={librarySectionHeadingWrapStyle}>
              <span style={librarySectionTitleStyle}>Familias</span>
              <span style={librarySectionSubtitleStyle}>Kills, hitos y avance de investigacion por familia.</span>
            </div>
              <div style={gridStyle}>
                {visibleLibraryFamilyEntries.map(entry => (
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
              {expandedGroups.libraryFamilies && libraryFamiliesPaging.totalPages > 1 && (
                <PaginationControls
                  page={libraryFamiliesPaging.page}
                  totalPages={libraryFamiliesPaging.totalPages}
                  onPrevious={() => setListPage("libraryFamilies", libraryFamiliesPaging.page - 1)}
                  onNext={() => setListPage("libraryFamilies", libraryFamiliesPaging.page + 1)}
                />
              )}
              {orderedFamilyEntries.length > 8 && (
                <button onClick={() => toggleExpandedGroup("libraryFamilies")} style={showMoreButtonStyle}>
                  {expandedGroups.libraryFamilies ? "-" : `+${orderedFamilyEntries.length}`}
                </button>
              )}
          </section>
          )}

          {selectedMasteryGroupId === "libraryBosses" && isLibraryGroupUnlocked("libraryBosses") && (
          <section style={librarySecondaryPanelStyle}>
            <div style={librarySectionHeadingWrapStyle}>
              <span style={librarySectionTitleStyle}>Bosses</span>
              <span style={librarySectionSubtitleStyle}>Registro de caza, ruta y milestones de cada boss.</span>
            </div>
            <div style={gridStyle}>
              {visibleLibraryBossEntries.map(entry => (
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
            {expandedGroups.libraryBosses && libraryBossesPaging.totalPages > 1 && (
              <PaginationControls
                page={libraryBossesPaging.page}
                totalPages={libraryBossesPaging.totalPages}
                onPrevious={() => setListPage("libraryBosses", libraryBossesPaging.page - 1)}
                onNext={() => setListPage("libraryBosses", libraryBossesPaging.page + 1)}
              />
            )}
            {orderedBossEntries.length > 6 && (
              <button onClick={() => toggleExpandedGroup("libraryBosses")} style={showMoreButtonStyle}>
                {expandedGroups.libraryBosses ? "-" : `+${orderedBossEntries.length}`}
              </button>
            )}
          </section>
          )}
        </>
      ) : (
        <>
          <section style={librarySecondaryPanelStyle}>
            <button onClick={() => toggleSection("glossarySystems")} style={compactToggleButtonStyle}>
              <span style={librarySectionHeadingWrapStyle}>
                <span style={librarySectionTitleStyle}>Sistemas</span>
                <span style={librarySectionSubtitleStyle}>Conceptos base del loop para consulta rapida.</span>
              </span>
              <span style={collapseLabelStyle}>{collapsedSections.glossarySystems ? "+" : "-"}</span>
            </button>
            {!collapsedSections.glossarySystems && (
            <>
            <div style={gridStyle}>
              {SYSTEMS.map(([name, description]) => (
                <div key={name} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
                </div>
              ))}
            </div>
            </>
            )}
          </section>

          <section style={librarySecondaryPanelStyle}>
            <button onClick={() => toggleSection("glossaryRarity")} style={compactToggleButtonStyle}>
              <span style={librarySectionHeadingWrapStyle}>
                <span style={librarySectionTitleStyle}>Rarezas y calidad</span>
                <span style={librarySectionSubtitleStyle}>Como escala potencia y lectura de una pieza.</span>
              </span>
              <span style={collapseLabelStyle}>{collapsedSections.glossaryRarity ? "+" : "-"}</span>
            </button>
            {!collapsedSections.glossaryRarity && (
            <>
            <div style={gridStyle}>
              {RARITY_GUIDE.map(([name, description]) => (
                <div key={name} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
                </div>
              ))}
              {AFFIX_QUALITY.map(([name, description]) => (
                <div key={name} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
                </div>
              ))}
            </div>
            </>
            )}
          </section>

          <section style={librarySecondaryPanelStyle}>
            <button onClick={() => toggleSection("glossaryStats")} style={compactToggleButtonStyle}>
              <span style={librarySectionHeadingWrapStyle}>
                <span style={librarySectionTitleStyle}>Atributos</span>
                <span style={librarySectionSubtitleStyle}>Referencia corta de cada stat y su impacto.</span>
              </span>
              <span style={collapseLabelStyle}>{collapsedSections.glossaryStats ? "+" : "-"}</span>
            </button>
            {!collapsedSections.glossaryStats && (
            <>
            <div style={gridStyle}>
              {visibleGlossaryStats.map(([name, description]) => (
                <div key={name} style={cardStyle}>
                  <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.35 }}>{description}</div>
                </div>
              ))}
              {expandedGroups.glossaryStats && glossaryStatsPaging.totalPages > 1 && (
                <PaginationControls
                  page={glossaryStatsPaging.page}
                  totalPages={glossaryStatsPaging.totalPages}
                  onPrevious={() => setListPage("glossaryStats", glossaryStatsPaging.page - 1)}
                  onNext={() => setListPage("glossaryStats", glossaryStatsPaging.page + 1)}
                />
              )}
              {STAT_DESCRIPTIONS.length > 10 && (
                <button onClick={() => toggleExpandedGroup("glossaryStats")} style={showMoreButtonStyle}>
                  {expandedGroups.glossaryStats ? "-" : `+${STAT_DESCRIPTIONS.length}`}
                </button>
              )}
            </div>
            </>
            )}
          </section>

          <section style={librarySecondaryPanelStyle}>
            <button onClick={() => toggleSection("glossaryFamilies")} style={compactToggleButtonStyle}>
              <span style={librarySectionHeadingWrapStyle}>
                <span style={librarySectionTitleStyle}>Familias</span>
                <span style={librarySectionSubtitleStyle}>Implicitos por familia para comparar rapido.</span>
              </span>
              <span style={collapseLabelStyle}>{collapsedSections.glossaryFamilies ? "+" : "-"}</span>
            </button>
            {!collapsedSections.glossaryFamilies && (
            <>
            <div style={gridStyle}>
              {visibleGlossaryFamilies.map(([id, family]) => (
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
              {expandedGroups.glossaryFamilies && glossaryFamiliesPaging.totalPages > 1 && (
                <PaginationControls
                  page={glossaryFamiliesPaging.page}
                  totalPages={glossaryFamiliesPaging.totalPages}
                  onPrevious={() => setListPage("glossaryFamilies", glossaryFamiliesPaging.page - 1)}
                  onNext={() => setListPage("glossaryFamilies", glossaryFamiliesPaging.page + 1)}
                />
              )}
              {Object.keys(ITEM_FAMILIES).length > 8 && (
                <button onClick={() => toggleExpandedGroup("glossaryFamilies")} style={showMoreButtonStyle}>
                  {expandedGroups.glossaryFamilies ? "-" : `+${Object.keys(ITEM_FAMILIES).length}`}
                </button>
              )}
            </div>
            </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function PaginationControls({ page = 0, totalPages = 1, onPrevious, onNext }) {
  if (totalPages <= 1) return null;
  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1;
  return (
    <div style={paginationBarStyle}>
      <button
        onClick={onPrevious}
        disabled={isFirst}
        style={{
          ...paginationButtonStyle,
          opacity: isFirst ? 0.45 : 1,
          cursor: isFirst ? "not-allowed" : "pointer",
        }}
      >
        -
      </button>
      <span style={paginationLabelStyle}>
        {page + 1}/{totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={isLast}
        style={{
          ...paginationButtonStyle,
          opacity: isLast ? 0.45 : 1,
          cursor: isLast ? "not-allowed" : "pointer",
        }}
      >
        +
      </button>
    </div>
  );
}

const panelStyle = {
  background: "var(--color-background-secondary, #fff)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "var(--dense-card-radius, 12px)",
  padding: "var(--dense-panel-padding, 10px)",
  boxShadow: "0 2px 10px var(--color-shadow, rgba(0,0,0,0.03))",
};

const libraryHeroPanelStyle = {
  ...panelStyle,
  borderTop: "3px solid var(--tone-accent, #4338ca)",
  padding: "calc(var(--dense-panel-padding, 10px) + 2px)",
  display: "grid",
  gap: "var(--dense-panel-gap, 8px)",
  boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
};

const librarySecondaryPanelStyle = {
  ...panelStyle,
  borderTop: "3px solid var(--tone-accent, #4338ca)",
  padding: "calc(var(--dense-panel-padding, 10px) + 2px)",
  display: "grid",
  gap: "var(--dense-panel-gap, 8px)",
  boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
};

const librarySectionHeadingWrapStyle = {
  display: "grid",
  gap: "3px",
};

const librarySectionTitleStyle = {
  fontSize: "0.66rem",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--tone-accent, #4338ca)",
};

const librarySectionSubtitleStyle = {
  fontSize: "0.68rem",
  color: "var(--color-text-secondary, #64748b)",
  lineHeight: 1.35,
};

const overlayBackButtonStyle = {
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-secondary, #ffffff)",
  color: "var(--color-text-primary, #1e293b)",
  borderRadius: "12px",
  padding: "7px 11px",
  fontSize: "0.68rem",
  fontWeight: "900",
  cursor: "pointer",
  flex: "0 0 auto",
};

const libraryTopChipStyle = color => ({
  display: "inline-flex",
  alignItems: "center",
  minHeight: "24px",
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-tertiary, #f8fafc)",
  color,
  borderRadius: "999px",
  padding: "4px 8px",
  fontSize: "0.62rem",
  fontWeight: "900",
  lineHeight: 1,
});

const libraryTopMetricCardStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "8px 10px",
  display: "grid",
  gap: "2px",
};

const libraryTopMetricLabelStyle = {
  fontSize: "0.56rem",
  fontWeight: "900",
  textTransform: "uppercase",
  color: "var(--color-text-tertiary, #94a3b8)",
};

const libraryTopMetricValueStyle = {
  fontSize: "0.88rem",
  fontWeight: "900",
  color: "var(--color-text-primary, #1e293b)",
};

const compactToggleButtonStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "8px",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
};

const collapseLabelStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "34px",
  padding: "4px 0",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-secondary, #ffffff)",
  borderRadius: "10px",
  fontSize: "0.72rem",
  color: "var(--color-text-primary, #1e293b)",
  fontWeight: "900",
  lineHeight: 1,
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

const showMoreButtonStyle = {
  alignSelf: "flex-end",
  minWidth: "34px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-secondary, #ffffff)",
  color: "var(--color-text-primary, #1e293b)",
  borderRadius: "10px",
  padding: "4px 10px",
  fontSize: "0.72rem",
  fontWeight: "900",
  lineHeight: 1,
  cursor: "pointer",
};

const paginationBarStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  justifySelf: "end",
};

const paginationButtonStyle = {
  minWidth: "32px",
  height: "28px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  background: "var(--color-background-secondary, #ffffff)",
  color: "var(--color-text-primary, #1e293b)",
  borderRadius: "8px",
  fontSize: "0.74rem",
  fontWeight: "900",
  lineHeight: 1,
};

const paginationLabelStyle = {
  fontSize: "0.62rem",
  fontWeight: "900",
  color: "var(--color-text-secondary, #64748b)",
  minWidth: "48px",
  textAlign: "center",
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
