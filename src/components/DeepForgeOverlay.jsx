import React, { useEffect, useMemo, useState } from "react";
import OverlayShell, { OverlaySurface } from "./OverlayShell";
import { getRarityColor } from "../constants/rarity";
import { getProjectUpgradeRule } from "../engine/sanctuary/jobEngine";
import { getOnboardingTutorialDeepForgeProjectId, ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import {
  getLegendaryPowerImprintReduction,
  getUnlockedLegendaryPowers,
} from "../engine/progression/codexEngine";
import {
  canDeepForgeProject,
  getDeepForgeCosts,
} from "../engine/sanctuary/projectForgeEngine";
import {
  ITEM_STAT_LABELS as STAT_LABELS,
  formatItemStatValue as formatStatValue,
} from "../utils/itemPresentation";

function panelStyle() {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "10px",
    alignSelf: "start",
  };
}

function chipStyle({ active = false, tone = "var(--tone-accent, #4338ca)" } = {}) {
  return {
    border: "1px solid",
    borderColor: active ? tone : "var(--color-border-primary, #e2e8f0)",
    background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #ffffff)",
    color: active ? tone : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: "10px 12px",
    cursor: "pointer",
    textAlign: "left",
  };
}

function actionButtonStyle({ primary = false, disabled = false } = {}) {
  return {
    border: "1px solid",
    borderColor: disabled
      ? "var(--color-border-primary, #e2e8f0)"
      : primary
        ? "var(--tone-danger, #D85A30)"
        : "var(--color-border-primary, #e2e8f0)",
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : primary
        ? "var(--tone-danger, #D85A30)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : primary
        ? "#ffffff"
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function metricCardStyle() {
  return {
    background: "var(--color-background-tertiary, #f8fafc)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "12px",
    padding: "10px 12px",
    display: "grid",
    gap: "4px",
  };
}

function chipLabelStyle(color = "var(--tone-accent, #4338ca)") {
  return {
    padding: "4px 8px",
    borderRadius: "999px",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    background: "var(--color-background-tertiary, #f8fafc)",
    color,
    fontSize: "0.62rem",
    fontWeight: "900",
  };
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

function formatAffixLabel(affix = {}) {
  if (!affix?.stat) return "Linea";
  return `${STAT_LABELS[affix.stat] || affix.stat} · ${formatStatValue(affix.stat, affix.rolledValue ?? affix.value ?? 0)}${affix?.tier ? ` · T${affix.tier}` : ""}`;
}

function resourceLine(project, resources, mode, affixIndex) {
  const costs = getDeepForgeCosts(project, mode, affixIndex);
  const enough = canDeepForgeProject(
    project,
    {
      playerEssence: resources?.essence || 0,
      relicDust: resources?.relicDust || 0,
    },
    mode,
    affixIndex
  );
  return {
    costs,
    enough: enough.ok,
  };
}

export default function DeepForgeOverlay({ state, dispatch, isMobile = false, onClose }) {
  const sanctuary = state.sanctuary || {};
  const onboardingStep = state?.onboarding?.step || null;
  const tutorialProjectId = getOnboardingTutorialDeepForgeProjectId(state);
  const stashProjects = Array.isArray(sanctuary?.stash) ? sanctuary.stash : [];
  const resources = {
    essence: Number(state.player?.essence || 0),
    relicDust: Number(sanctuary?.resources?.relicDust || 0),
  };
  const deepForgeSlots = Math.max(1, Number(sanctuary?.stations?.deepForge?.slots || 1));
  const deepForgeJobs = (Array.isArray(sanctuary?.jobs) ? sanctuary.jobs : []).filter(
    job => job?.station === "deepForge" && job?.status === "running"
  );
  const deepForgeSession = sanctuary?.deepForgeSession || null;

  const [selectedProjectId, setSelectedProjectId] = useState(
    () => tutorialProjectId || deepForgeSession?.projectId || stashProjects[0]?.id || null
  );
  const [selectedAffixIndex, setSelectedAffixIndex] = useState(
    () => Number.isInteger(Number(deepForgeSession?.affixIndex))
      ? Number(deepForgeSession.affixIndex)
      : 0
  );
  const [selectedAscendPowerId, setSelectedAscendPowerId] = useState(null);

  useEffect(() => {
    if (!stashProjects.some(project => project?.id === selectedProjectId)) {
      setSelectedProjectId(tutorialProjectId || deepForgeSession?.projectId || stashProjects[0]?.id || null);
    }
  }, [deepForgeSession?.projectId, selectedProjectId, stashProjects, tutorialProjectId]);

  const selectedProject = useMemo(
    () => stashProjects.find(project => project?.id === selectedProjectId) || null,
    [selectedProjectId, stashProjects]
  );
  const unlockedLegendaryPowers = useMemo(() => {
    try {
      return getUnlockedLegendaryPowers(state?.codex || {}, {
        specialization: state.player?.specialization,
        className: state.player?.class,
        abyss: state?.abyss || {},
      });
    } catch (error) {
      console.error("Deep forge legendary powers fallback", error);
      return [];
    }
  }, [state?.abyss, state?.codex, state?.player?.class, state?.player?.specialization]);

  useEffect(() => {
    if (!selectedProject) return;
    const affixCount = Array.isArray(selectedProject?.affixes) ? selectedProject.affixes.length : 0;
    if (affixCount <= 0) {
      setSelectedAffixIndex(null);
      return;
    }
    if (!Number.isInteger(selectedAffixIndex) || selectedAffixIndex >= affixCount) {
      setSelectedAffixIndex(0);
    }
  }, [selectedAffixIndex, selectedProject]);

  useEffect(() => {
    if (!selectedProject || selectedProject?.rarity !== "legendary") {
      setSelectedAscendPowerId(null);
      return;
    }
    setSelectedAscendPowerId(selectedProject?.legendaryPowerId || null);
  }, [selectedProject?.id, selectedProject?.legendaryPowerId, selectedProject?.rarity]);

  const selectedAffix = selectedProject && selectedAffixIndex != null
    ? selectedProject.affixes?.[selectedAffixIndex] || null
    : null;
  const forgeRule = selectedProject ? getProjectUpgradeRule(selectedProject) : null;
  const upgradeLevel = Math.max(0, Number(selectedProject?.upgradeLevel || 0));
  const upgradeCap = Math.max(1, Number(selectedProject?.upgradeCap || 15));
  const nextDustCost = Math.max(1, Number(forgeRule?.baseDustCost || 1)) + Math.floor((upgradeLevel + 1) / 5);
  const nextDuration = Math.max(0, Number(forgeRule?.baseDurationMs || 0)) + Math.max(0, upgradeLevel) * 8 * 60 * 1000;
  const upgradeBlocked =
    !selectedProject ||
    upgradeLevel >= upgradeCap ||
    deepForgeJobs.length >= deepForgeSlots ||
    resources.relicDust < nextDustCost ||
    (onboardingStep === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE && selectedProject?.id !== tutorialProjectId);
  const polishState = selectedProject && selectedAffixIndex != null
    ? resourceLine(selectedProject, resources, "polish", selectedAffixIndex)
    : { costs: { essence: 0, relicDust: 0 }, enough: false };
  const rerollState = selectedProject
    ? resourceLine(selectedProject, resources, "reroll", null)
    : { costs: { essence: 0, relicDust: 0 }, enough: false };
  const reforgeState = selectedProject && selectedAffixIndex != null
    ? resourceLine(selectedProject, resources, "reforge", selectedAffixIndex)
    : { costs: { essence: 0, relicDust: 0 }, enough: false };
  const selectedAscendPower = unlockedLegendaryPowers.find(power => power.id === selectedAscendPowerId) || null;
  const ascendImprintReduction = getLegendaryPowerImprintReduction(state?.codex || {}, selectedAscendPowerId);
  const ascendState = selectedProject
    ? canDeepForgeProject(
        selectedProject,
        resources,
        "ascend",
        null,
        {
          selectedPowerId: selectedProject?.rarity === "legendary" ? selectedAscendPowerId : null,
          unlockedPowerIds: unlockedLegendaryPowers.map(power => power.id),
          imprintReduction: ascendImprintReduction,
        }
      )
    : { ok: false, costs: { essence: 0, relicDust: 0 }, reason: "missing_project" };
  const sessionMatchesSelection =
    deepForgeSession &&
    deepForgeSession.projectId === selectedProject?.id &&
    Number(deepForgeSession.affixIndex) === selectedAffixIndex;

  return (
    <OverlayShell isMobile={isMobile} contentLabel="Taller profundo">
      <OverlaySurface
        isMobile={isMobile}
        maxWidth="1160px"
        paddingMobile="18px 16px 20px"
        paddingDesktop="20px 22px 22px"
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
              Taller
            </div>
            <div style={{ fontSize: isMobile ? "1.08rem" : "1.18rem", fontWeight: "900", marginTop: "4px" }}>
              Acabado persistente de proyectos
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45, maxWidth: "68ch" }}>
              La expedicion resuelve la run. El cierre fino del proyecto vive aca: upgrade persistente, pulido profundo, reforge y ascenso.
            </div>
          </div>
          <div style={{ display: "grid", gap: "8px", justifyItems: isMobile ? "stretch" : "end" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={chipLabelStyle("var(--tone-danger, #D85A30)")}>
                {deepForgeJobs.length} / {deepForgeSlots} jobs
              </span>
              <span style={chipLabelStyle("var(--tone-violet, #7c3aed)")}>
                {Math.floor(resources.relicDust).toLocaleString()} polvo
              </span>
              <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>
                {Math.floor(resources.essence).toLocaleString()} esencia
              </span>
            </div>
            <button onClick={onClose} style={actionButtonStyle()}>
              Volver al Santuario
            </button>
          </div>
        </div>

        {deepForgeSession && !sessionMatchesSelection && (
          <section style={{ ...panelStyle(), borderColor: "rgba(124,58,237,0.22)", background: "var(--tone-violet-soft, #f3e8ff)" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--tone-violet, #6d28d9)" }}>
              Hay una reforge profunda pendiente en otro proyecto.
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
              Termina o cancela esa sesion antes de pagar otra preview. La forja profunda mantiene una sola decision abierta a la vez.
            </div>
          </section>
        )}

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr", gap: "12px" }}>
          <div style={panelStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
                  Stash
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                  Proyectos listos para trabajar
                </div>
              </div>
              <span style={chipLabelStyle("var(--tone-violet, #7c3aed)")}>
                {stashProjects.length} guardados
              </span>
            </div>

            {stashProjects.length === 0 ? (
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                Todavia no hay proyectos en stash. Extrae una pieza importante desde una expedicion para que la forja profunda tenga algo que desarrollar.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {stashProjects
                  .slice()
                  .sort((left, right) => Number(right?.rating || 0) - Number(left?.rating || 0))
                  .map(project => {
                    const active = project.id === selectedProjectId;
                    return (
                      <button key={project.id} onClick={() => setSelectedProjectId(project.id)} style={chipStyle({ active, tone: "var(--tone-violet, #7c3aed)" })}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                          <div>
                            <div style={{ fontSize: "0.8rem", fontWeight: "900", color: getRarityColor(project.rarity) }}>{project.name}</div>
                            <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                              {project.rarity} · rating {Math.round(Number(project?.rating || 0))} · +{Math.max(0, Number(project?.upgradeLevel || 0))} · Asc {Math.max(0, Number(project?.ascensionTier || 0))}
                            </div>
                          </div>
                          <span style={chipLabelStyle(active ? "var(--tone-violet, #7c3aed)" : "var(--color-text-secondary, #475569)")}>
                            {Array.isArray(project?.affixes) ? project.affixes.length : 0} affix
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div style={panelStyle()}>
            {!selectedProject ? (
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                Selecciona un proyecto del stash para abrir sus opciones persistentes.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
                      Proyecto activo
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "2px", color: getRarityColor(selectedProject.rarity) }}>
                      {selectedProject.name}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span style={chipLabelStyle("var(--tone-danger, #D85A30)")}>+{upgradeLevel} / +{upgradeCap}</span>
                    <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>rating {Math.round(Number(selectedProject?.rating || 0))}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0,1fr))" : "repeat(4, minmax(0,1fr))", gap: "8px" }}>
                  <div style={metricCardStyle()}>
                    <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                      Rareza
                    </div>
                    <div style={{ fontSize: "0.88rem", fontWeight: "900", color: getRarityColor(selectedProject.rarity) }}>
                      {selectedProject.rarity}
                    </div>
                  </div>
                  <div style={metricCardStyle()}>
                    <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                      Tipo
                    </div>
                    <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>
                      {selectedProject.type}
                    </div>
                  </div>
                  <div style={metricCardStyle()}>
                    <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                      Ascension
                    </div>
                    <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>
                      {Math.max(0, Number(selectedProject?.ascensionTier || 0))}
                    </div>
                  </div>
                  <div style={metricCardStyle()}>
                    <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
                      Poder
                    </div>
                    <div style={{ fontSize: "0.88rem", fontWeight: "900" }}>
                      {selectedProject?.legendaryPowerId ? `T${Math.max(0, Number(selectedProject?.powerTier || 0))}` : "Sin poder"}
                    </div>
                  </div>
                </div>

                <section style={panelStyle()}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
                        Upgrade persistente
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "900", marginTop: "2px" }}>
                        El +N ya no vive dentro de una sola expedicion
                      </div>
                    </div>
                    <span style={chipLabelStyle("var(--tone-danger, #D85A30)")}>
                      {upgradeLevel >= upgradeCap ? "Cap actual" : `${nextDustCost} polvo · ${formatRemaining(nextDuration)}`}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                    Si el proyecto llega al cap, la siguiente capa natural es `Ascension`, no más tuning de run. Esta forja construye valor persistente.
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                      {upgradeBlocked
                        ? deepForgeJobs.length >= deepForgeSlots
                          ? "No hay slot libre en la estacion."
                          : upgradeLevel >= upgradeCap
                            ? "El proyecto ya alcanzo su cap actual."
                            : "Te falta polvo de reliquia."
                        : `Siguiente paso: +${upgradeLevel + 1}`}
                    </div>
                    <button
                      onClick={() => dispatch({ type: "START_DEEP_FORGE_JOB", projectId: selectedProject.id, now: Date.now() })}
                      disabled={upgradeBlocked}
                      data-onboarding-target={onboardingStep === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE ? "tutorial-deep-forge-project" : undefined}
                      style={actionButtonStyle({ primary: !upgradeBlocked, disabled: upgradeBlocked })}
                    >
                      Subir proyecto
                    </button>
                  </div>
                </section>

                <section style={panelStyle()}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                        Ascension
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "900", marginTop: "2px" }}>
                        Resetea `+N` y eleva el proyecto a una nueva generacion
                      </div>
                    </div>
                    <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                      {ascendState?.costs?.essence || 0} esencia · {ascendState?.costs?.relicDust || 0} polvo
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                    Ascender ya no cambia rareza. Reinicia el proyecto a `+0`, sube `Ascension Tier` y vuelve a abrir una vuelta completa de progreso persistente.
                  </div>

                  {selectedProject?.rarity === "legendary" && (
                    <div style={{ display: "grid", gap: "8px", padding: "10px", borderRadius: "12px", background: "var(--tone-warning-soft, #fff7ed)", border: "1px solid rgba(245,158,11,0.22)" }}>
                      <div style={{ fontSize: "0.64rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #9a3412)" }}>
                        Injerto de poder legendario
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                        En legendarios puedes mantener el poder actual o reemplazarlo por uno ya descubierto en Biblioteca. El injerto usa la reduccion de costo de maestria si ya la tienes.
                      </div>
                      <div style={{ display: "grid", gap: "8px" }}>
                        <button
                          onClick={() => setSelectedAscendPowerId(selectedProject?.legendaryPowerId || null)}
                          style={chipStyle({ active: selectedAscendPowerId === (selectedProject?.legendaryPowerId || null), tone: "var(--tone-warning, #f59e0b)" })}
                        >
                          <div style={{ fontSize: "0.74rem", fontWeight: "900" }}>
                            {selectedProject?.legendaryPowerId ? "Mantener poder actual" : "Ascender sin injertar poder nuevo"}
                          </div>
                        </button>
                        {unlockedLegendaryPowers
                          .filter(power => power.id !== selectedProject?.legendaryPowerId)
                          .map(power => (
                          <button
                            key={power.id}
                            onClick={() => setSelectedAscendPowerId(power.id)}
                            style={chipStyle({ active: selectedAscendPowerId === power.id, tone: "var(--tone-warning, #f59e0b)" })}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                              <div>
                                <div style={{ fontSize: "0.74rem", fontWeight: "900" }}>{power.name}</div>
                                <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                                  {power.shortLabel} · {power.mastery?.label || "Descubierto"}
                                </div>
                              </div>
                              {!!power.mastery?.imprintCostReduction && (
                                <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                                  -{Math.round((power.mastery.imprintCostReduction || 0) * 100)}%
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "0.66rem", fontWeight: "900", color: ascendState.ok ? "var(--color-text-secondary, #64748b)" : "var(--tone-danger, #D85A30)" }}>
                      {ascendState.ok
                        ? `Ascendera a rango ${Math.max(0, Number(selectedProject?.ascensionTier || 0)) + 1} y volvera a +0${selectedAscendPower ? ` con ${selectedAscendPower.name}.` : "."}`
                        : upgradeLevel < upgradeCap
                          ? `Necesita llegar a +${upgradeCap} antes de ascender.`
                          : "Te faltan recursos para cerrar la ascension."}
                    </div>
                    <button
                      onClick={() => dispatch({ type: "DEEP_FORGE_ASCEND_PROJECT", projectId: selectedProject.id, selectedPowerId: selectedProject?.rarity === "legendary" ? selectedAscendPowerId : null })}
                      disabled={!ascendState.ok}
                      style={actionButtonStyle({ primary: ascendState.ok, disabled: !ascendState.ok })}
                    >
                      Ascender proyecto
                    </button>
                  </div>
                </section>

                <section style={panelStyle()}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                        Acabado persistente
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: "900", marginTop: "2px" }}>
                        Pulir y reforjar ya no viven en la expedicion
                      </div>
                    </div>
                    {selectedAffix && (
                      <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                        {formatAffixLabel(selectedAffix)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: "8px" }}>
                    {(selectedProject.affixes || []).map((affix, index) => (
                      <button
                        key={`${selectedProject.id}_${index}`}
                        onClick={() => setSelectedAffixIndex(index)}
                        style={chipStyle({ active: selectedAffixIndex === index, tone: "var(--tone-info, #0369a1)" })}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                          <div style={{ fontSize: "0.74rem", fontWeight: "900" }}>{STAT_LABELS[affix.stat] || affix.stat}</div>
                          <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                            {formatStatValue(affix.stat, affix.rolledValue ?? affix.value ?? 0)} · T{affix.tier || "?"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedAffix && (
                    <div style={{ display: "grid", gap: "8px", padding: "10px", borderRadius: "12px", background: "var(--color-background-tertiary, #f8fafc)", border: "1px solid var(--color-border-primary, #e2e8f0)" }}>
                      <div style={{ display: "grid", gap: "6px", paddingBottom: "8px", borderBottom: "1px dashed var(--color-border-primary, #e2e8f0)" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          <button
                            onClick={() => dispatch({ type: "DEEP_FORGE_REROLL_PROJECT", projectId: selectedProject.id })}
                            disabled={!rerollState.enough || (!!deepForgeSession && !sessionMatchesSelection)}
                            style={actionButtonStyle({ disabled: !rerollState.enough || (!!deepForgeSession && !sessionMatchesSelection) })}
                          >
                            Reroll profundo
                          </button>
                          <span style={{ fontSize: "0.64rem", fontWeight: "900", color: rerollState.enough ? "var(--color-text-secondary, #64748b)" : "var(--tone-danger, #D85A30)" }}>
                            {rerollState.costs.essence} esencia · {rerollState.costs.relicDust} polvo
                          </span>
                        </div>
                        <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                          Rehace todas las lineas base del proyecto y limpia el foco anterior. Es la version persistente del antiguo reroll de run.
                        </div>
                      </div>
                      <div style={{ fontSize: "0.7rem", fontWeight: "900" }}>
                        Linea objetivo: {formatAffixLabel(selectedAffix)}
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          onClick={() => dispatch({ type: "DEEP_FORGE_POLISH_PROJECT", projectId: selectedProject.id, affixIndex: selectedAffixIndex })}
                          disabled={!polishState.enough}
                          style={actionButtonStyle({ disabled: !polishState.enough })}
                        >
                          Pulir profundo
                        </button>
                        <span style={{ fontSize: "0.64rem", fontWeight: "900", color: polishState.enough ? "var(--color-text-secondary, #64748b)" : "var(--tone-danger, #D85A30)" }}>
                          {polishState.costs.essence} esencia · {polishState.costs.relicDust} polvo
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          onClick={() => dispatch({ type: "START_DEEP_FORGE_REFORGE_PREVIEW", projectId: selectedProject.id, affixIndex: selectedAffixIndex, now: Date.now() })}
                          disabled={!reforgeState.enough || (!!deepForgeSession && !sessionMatchesSelection)}
                          style={actionButtonStyle({ disabled: !reforgeState.enough || (!!deepForgeSession && !sessionMatchesSelection) })}
                        >
                          Reforge profunda
                        </button>
                        <span style={{ fontSize: "0.64rem", fontWeight: "900", color: reforgeState.enough ? "var(--color-text-secondary, #64748b)" : "var(--tone-danger, #D85A30)" }}>
                          {reforgeState.costs.essence} esencia · {reforgeState.costs.relicDust} polvo
                        </span>
                      </div>
                      <div style={{ fontSize: "0.62rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                        Pagas la preview una vez y luego eliges entre {selectedProject?.rarity === "epic" || selectedProject?.rarity === "legendary" ? 3 : 2} linea(s) nueva(s) o mantienes la actual.
                      </div>
                    </div>
                  )}

                  {sessionMatchesSelection && (
                    <div style={{ display: "grid", gap: "8px", padding: "10px", borderRadius: "12px", background: "var(--tone-violet-soft, #f3e8ff)", border: "1px solid rgba(124,58,237,0.22)" }}>
                      <div style={{ fontSize: "0.64rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #6d28d9)" }}>
                        Reforge profunda abierta
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                        Ya pagaste la preview. Ahora elegi una de las {(deepForgeSession.options || []).length} linea(s) nueva(s) o manten la actual para cerrar la sesion.
                      </div>
                      <div style={{ display: "grid", gap: "8px" }}>
                        <button onClick={() => dispatch({ type: "CANCEL_DEEP_FORGE_SESSION" })} style={chipStyle({ tone: "var(--tone-violet, #6d28d9)" })}>
                          <div style={{ fontSize: "0.74rem", fontWeight: "900" }}>Mantener linea actual</div>
                          <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
                            {formatAffixLabel(deepForgeSession.currentAffix)}
                          </div>
                        </button>
                        {(deepForgeSession.options || []).map((option, index) => (
                          <button
                            key={`${option.id}_${option.stat}_${option.tier}_${index}`}
                            onClick={() => dispatch({ type: "APPLY_DEEP_FORGE_REFORGE", replacementAffix: option })}
                            style={chipStyle({ tone: "var(--tone-violet, #6d28d9)" })}
                          >
                            <div style={{ fontSize: "0.74rem", fontWeight: "900" }}>{formatAffixLabel(option)}</div>
                            <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px" }}>
                              {option?.source === "abyss" ? "Linea de Abismo habilitada por la forja profunda." : "Nueva linea persistente para este proyecto."}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </section>
      </OverlaySurface>
    </OverlayShell>
  );
}
