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
  getCodexUnlockedMilestones,
} from "../engine/progression/codexEngine";
import { formatRunSigilLoadout, normalizeRunSigilIds, summarizeRunSigilLoadout } from "../data/runSigils";
import { getMaxRunSigilSlots } from "../engine/progression/abyssProgression";

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
export default function Codex({ state, dispatch }) {
  const [activeTab, setActiveTab] = useState("mastery");
  const codex = state?.codex || {};
  const maxUnlockedTier = Number(state?.combat?.maxTier || 1);
  const runContext = state?.combat?.runContext || null;
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
  const goToTier = (tier) => {
    if (!dispatch || !tier || tier > maxUnlockedTier) return;
    dispatch({ type: "SET_TIER", tier });
    dispatch({ type: "SET_TAB", tab: "combat" });
  };

  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section style={panelStyle}>
        <div style={titleStyle}>Codex</div>
        <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
          Compendio de maestria: matar familias y bosses desbloquea bonos permanentes chicos. Descubrir un poder legendario lo guarda para futuras ascensiones.
        </div>
        {hasActiveRunSigilBias && (
          <div style={{ marginTop: "10px", padding: "8px 10px", borderRadius: "10px", background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)", fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.4, fontWeight: "800" }}>
            <strong style={{ color: "var(--tone-accent, #4338ca)" }}>{activeRunSigilLoadout}</strong> activo · {activeRunSigilSummary}
          </div>
        )}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
          <button onClick={() => setActiveTab("mastery")} style={tabBtnStyle(activeTab === "mastery")}>Maestria</button>
          <button onClick={() => setActiveTab("glossary")} style={tabBtnStyle(activeTab === "glossary")}>Glosario</button>
        </div>
      </section>

      {activeTab === "mastery" ? (
        <>
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
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>maestrias + poderes</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "0.66rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase" }}>Poderes</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>{powerEntries.filter(entry => entry.unlocked).length}/{powerEntries.length}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>poderes descubiertos</div>
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={sectionStyle}>Caza</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
              <div style={cardStyle}>
                <div style={huntPanelTitleStyle}>Objetivos revelados con powers ahora</div>
                {availablePowerTargets.length > 0 ? availablePowerTargets.map(entry => (
                  <div key={`power-now-${entry.id}`} style={huntRowStyle}>
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: "900" }}>{entry.name}</div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", marginTop: "2px" }}>
                        {entry.subtitle} · Tier {entry.tier} · {entry.undiscoveredCount} power{entry.undiscoveredCount === 1 ? "" : "s"} por descubrir
                      </div>
                    </div>
                    <button onClick={() => goToTier(entry.tier)} style={miniHuntButtonStyle}>
                      Ir
                    </button>
                  </div>
                )) : (
                  <div style={huntEmptyStyle}>Todavia no hay objetivos ya revelados con powers ocultos dentro de tus tiers actuales.</div>
                )}
              </div>
            </div>
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
                    {entry.unlocked ? entry.description : "Derrota a su objetivo de caza al menos una vez para guardar este poder en tu Codex."}
                  </div>
                  {entry.unlocked && (
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "8px", fontWeight: "800" }}>
                      Descubrimientos: {entry.discoveries} · {entry.mastery?.label || "Descubierto"}
                    </div>
                  )}
                  {entry.unlocked && entry.mastery?.rank > 1 && (
                    <div style={{ fontSize: "0.58rem", color: "var(--tone-accent, #4338ca)", marginTop: "4px", fontWeight: "800", lineHeight: 1.35 }}>
                      Injerto -{Math.round((entry.mastery.imprintCostReduction || 0) * 100)}% · Caza +{Math.round((entry.mastery.huntBias || 0) * 100)}%
                    </div>
                  )}
                  {entry.unlocked && entry.mastery?.nextRank && (
                    <div style={{ fontSize: "0.58rem", color: "var(--color-text-tertiary, #94a3b8)", marginTop: "3px", fontWeight: "800", lineHeight: 1.35 }}>
                      Proximo: {entry.mastery.nextRank.label} a las {entry.mastery.nextRank.discoveries} copias
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
                <div style={cardStyle}>Todavia no desbloqueaste hitos del Codex.</div>
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
                      <div style={{ ...progressBarWrapStyle, marginTop: "6px" }}>
                        <div style={{ ...progressBarFillStyle, width: `${Math.min(100, ((entry.kills || 0) / Math.max(1, entry.nextMilestone?.kills || entry.kills || 1)) * 100)}%` }} />
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
                      <div style={{ display: "grid", gap: "5px", marginTop: "8px" }}>
                        {entry.milestones.map((milestone, index) => {
                          const unlocked = entry.kills >= milestone.kills;
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
                        Encontra y derrota enemigos de esta familia en alguna run para revelar su pagina del Codex.
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
                      <div style={{ display: "grid", gap: "5px", marginTop: "8px" }}>
                        {entry.milestones.map((milestone, index) => {
                          const unlocked = entry.kills >= milestone.kills;
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
