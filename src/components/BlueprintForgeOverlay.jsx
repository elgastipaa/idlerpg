import React, { useEffect, useMemo, useState } from "react";
import { getRarityColor } from "../constants/rarity";
import { ITEM_STAT_LABELS } from "../utils/itemPresentation";
import {
  BLUEPRINT_AFFIX_FAMILIES,
  buildBlueprintAscensionPreview,
  buildBlueprintMaterializationPreview,
  buildBlueprintPowerTunePreview,
  buildBlueprintStructurePreview,
  canAscendBlueprint,
  getBlueprintAscensionCap,
  getBlueprintEffectiveBaseRating,
  getBlueprintEffectiveItemTier,
  getBlueprintLevelCap,
  getBlueprintPowerTuneCap,
} from "../engine/sanctuary/blueprintEngine";

function panelStyle() {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "10px",
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
        ? "var(--tone-danger-soft, #fff1f2)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : primary
        ? "var(--tone-danger, #D85A30)"
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.02)",
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

function affinityBarStyle() {
  return {
    height: "10px",
    borderRadius: "999px",
    background: "var(--color-background-tertiary, #e2e8f0)",
    overflow: "hidden",
  };
}

function formatStatList(stats = []) {
  return (stats || [])
    .map(stat => ITEM_STAT_LABELS?.[stat] || stat)
    .join(" · ");
}

function getWeightLabel(weight = 0) {
  const value = Number(weight || 0);
  if (value >= 4.5) return "muy alta";
  if (value >= 3.2) return "alta";
  if (value >= 2.1) return "media";
  return "baja";
}

export default function BlueprintForgeOverlay({ state, dispatch, isMobile = false, onClose }) {
  const sanctuary = state.sanctuary || {};
  const blueprints = Array.isArray(sanctuary?.blueprints) ? sanctuary.blueprints : [];
  const activeBlueprints = sanctuary?.activeBlueprints || {};
  const familyCharges = sanctuary?.familyCharges || {};
  const resources = sanctuary?.resources || {};
  const relicDustAvailable = Math.max(0, Number(resources?.relicDust || 0));
  const essenceAvailable = Math.max(0, Number(state?.player?.essence || 0));
  const [selectedBlueprintId, setSelectedBlueprintId] = useState(() => blueprints[0]?.id || null);

  useEffect(() => {
    if (!blueprints.some(blueprint => blueprint?.id === selectedBlueprintId)) {
      setSelectedBlueprintId(blueprints[0]?.id || null);
    }
  }, [blueprints, selectedBlueprintId]);

  const selectedBlueprint = useMemo(
    () => blueprints.find(blueprint => blueprint?.id === selectedBlueprintId) || null,
    [blueprints, selectedBlueprintId]
  );
  const structurePreview = useMemo(
    () => (selectedBlueprint ? buildBlueprintStructurePreview(selectedBlueprint) : null),
    [selectedBlueprint]
  );
  const powerTunePreview = useMemo(
    () => (selectedBlueprint ? buildBlueprintPowerTunePreview(selectedBlueprint) : null),
    [selectedBlueprint]
  );
  const ascensionPreview = useMemo(
    () => (selectedBlueprint ? buildBlueprintAscensionPreview(selectedBlueprint) : null),
    [selectedBlueprint]
  );
  const materializationPreview = useMemo(
    () => (selectedBlueprint ? buildBlueprintMaterializationPreview(selectedBlueprint) : null),
    [selectedBlueprint]
  );
  const canAscend = useMemo(
    () => (selectedBlueprint ? canAscendBlueprint(selectedBlueprint, { resources, essence: essenceAvailable }) : { ok: false }),
    [selectedBlueprint, resources, essenceAvailable]
  );

  return (
    <div style={{ position: "fixed", inset: isMobile ? "0 0 calc(72px + env(safe-area-inset-bottom)) 0" : 0, background: "rgba(2,6,23,0.72)", zIndex: isMobile ? 4800 : 9300, display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center", padding: isMobile ? "0" : "24px" }}>
      <div style={{ width: "100%", maxWidth: "1120px", maxHeight: "100%", overflow: "auto", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)", borderRadius: isMobile ? "16px 16px 0 0" : "18px", border: "1px solid var(--color-border-primary, #e2e8f0)", boxShadow: "0 24px 60px rgba(2,6,23,0.35)", display: "grid", gap: "12px", padding: isMobile ? "16px 14px 18px" : "20px 22px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.66rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
              Taller
            </div>
            <div style={{ fontSize: isMobile ? "1.08rem" : "1.18rem", fontWeight: "900", marginTop: "4px" }}>
              Blueprints, afinidad y loadout persistente
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45, maxWidth: "70ch" }}>
              Aqui se ordena todo lo rescatado para largo plazo. Un blueprint no guarda el item exacto: guarda su base, su implicit, su rareza y una direccion de roll para futuras materializaciones.
            </div>
          </div>
          <div style={{ display: "grid", gap: "8px", justifyItems: isMobile ? "stretch" : "end" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={chipLabelStyle("var(--tone-danger, #D85A30)")}>
                {blueprints.length} blueprint{blueprints.length !== 1 ? "s" : ""}
              </span>
              <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>
                {Object.values(familyCharges || {}).reduce((total, value) => total + Math.max(0, Number(value || 0)), 0)} cargas
              </span>
              <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                {Math.floor(relicDustAvailable)} polvo
              </span>
              <span style={chipLabelStyle("var(--tone-success, #10b981)")}>
                {Math.floor(essenceAvailable)} esencia
              </span>
            </div>
            <button onClick={onClose} style={actionButtonStyle()}>
              Volver al Santuario
            </button>
          </div>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.95fr 1.05fr", gap: "12px" }}>
          <div style={panelStyle()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
                  Blueprints
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: "900", marginTop: "2px" }}>
                  Planos persistentes listos para runs futuras
                </div>
              </div>
              <span style={chipLabelStyle("var(--tone-violet, #7c3aed)")}>
                arma: {activeBlueprints.weapon ? "si" : "no"} · armadura: {activeBlueprints.armor ? "si" : "no"}
              </span>
            </div>

            {blueprints.length === 0 ? (
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                Todavia no hay blueprints. Rescata un item desde extraccion y conviertelo en plano para empezar a construir un loadout persistente.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {blueprints
                  .slice()
                  .sort((left, right) => getBlueprintEffectiveBaseRating(right) - getBlueprintEffectiveBaseRating(left))
                  .map(blueprint => {
                    const active = blueprint.id === selectedBlueprintId;
                    const isActiveSlot = activeBlueprints?.[blueprint.slot] === blueprint.id;
                    const effectiveRating = getBlueprintEffectiveBaseRating(blueprint);
                    return (
                      <button key={blueprint.id} onClick={() => setSelectedBlueprintId(blueprint.id)} style={chipStyle({ active, tone: "var(--tone-violet, #7c3aed)" })}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                          <div>
                            <div style={{ fontSize: "0.8rem", fontWeight: "900", color: getRarityColor(blueprint.rarity) }}>{blueprint.sourceName}</div>
                            <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                              {blueprint.slot} · {blueprint.rarity} · rating {effectiveRating}
                            </div>
                          </div>
                          <span style={chipLabelStyle(isActiveSlot ? "var(--tone-success, #10b981)" : "var(--color-text-secondary, #475569)")}>
                            {isActiveSlot ? "Activo" : "Reserva"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div style={panelStyle()}>
            {!selectedBlueprint ? (
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                Selecciona un blueprint para ver su direccion de materializacion y gastar cargas en sus familias.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-danger, #D85A30)" }}>
                      Blueprint activo
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "2px", color: getRarityColor(selectedBlueprint.rarity) }}>
                      {selectedBlueprint.sourceName}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #64748b)", marginTop: "6px", lineHeight: 1.45 }}>
                      {selectedBlueprint.slot} · familia {selectedBlueprint.familyName || selectedBlueprint.family || "base"} · tier {selectedBlueprint.itemTier}
                      {selectedBlueprint.legendaryPowerId ? " · conserva poder legendario" : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => dispatch({ type: "SET_ACTIVE_BLUEPRINT", slot: selectedBlueprint.slot, blueprintId: selectedBlueprint.id })}
                      style={actionButtonStyle({
                        primary: activeBlueprints?.[selectedBlueprint.slot] !== selectedBlueprint.id,
                      })}
                    >
                      {activeBlueprints?.[selectedBlueprint.slot] === selectedBlueprint.id ? "Activo en run" : `Activar en ${selectedBlueprint.slot}`}
                    </button>
                    <button
                      onClick={() => dispatch({ type: "DISCARD_BLUEPRINT", blueprintId: selectedBlueprint.id })}
                      style={actionButtonStyle({ primary: true })}
                    >
                      Descartar plano
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0,1fr))", gap: "8px" }}>
                  <div style={panelStyle()}>
                    <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                      Identidad base
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.5 }}>
                      Este blueprint materializa siempre una pieza del mismo slot y familia, con la rareza del item rescatado y su base estructural.
                    </div>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>Base rating: {Math.round(Number(selectedBlueprint?.baseRating || 0))}</span>
                      <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>Tier efectivo: {getBlueprintEffectiveItemTier(selectedBlueprint)}</span>
                      <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>Materializaciones: {Math.max(0, Number(selectedBlueprint?.materializationCount || 0))}</span>
                    </div>
                  </div>

                  <div style={panelStyle()}>
                    <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-warning, #f59e0b)" }}>
                      Estructura
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.5 }}>
                      El polvo de reliquia refuerza el plano entre runs. Mejora base e implicito de cada materializacion, pero con cap para que drops mas profundos sigan importando.
                    </div>
                    <div style={{ display: "grid", gap: "6px" }}>
                      <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                        Nivel {structurePreview?.currentLevel || 0} / {getBlueprintLevelCap()}
                      </span>
                      <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                        Rating estructural {structurePreview?.currentEffectiveRating || Math.round(Number(selectedBlueprint?.baseRating || 0))}
                        {structurePreview && !structurePreview.atCap ? ` -> ${structurePreview.nextEffectiveRating}` : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                        {structurePreview?.atCap
                          ? "Cap estructural actual alcanzado."
                          : `${structurePreview?.costs?.relicDust || 0} polvo · base x${Number(structurePreview?.nextMultipliers?.base || 1).toFixed(2)} · implicit x${Number(structurePreview?.nextMultipliers?.implicit || 1).toFixed(2)}`}
                      </div>
                      <button
                        onClick={() => dispatch({ type: "UPGRADE_BLUEPRINT_STRUCTURE", blueprintId: selectedBlueprint.id, now: Date.now() })}
                        disabled={!!structurePreview?.atCap || relicDustAvailable < Number(structurePreview?.costs?.relicDust || 0)}
                        style={actionButtonStyle({
                          primary: !structurePreview?.atCap && relicDustAvailable >= Number(structurePreview?.costs?.relicDust || 0),
                          disabled: !!structurePreview?.atCap || relicDustAvailable < Number(structurePreview?.costs?.relicDust || 0),
                        })}
                        >
                        Reforzar estructura
                      </button>
                    </div>

                    <div style={{ marginTop: "4px", paddingTop: "8px", borderTop: "1px solid var(--color-border-primary, #e2e8f0)", display: "grid", gap: "6px" }}>
                      <span style={chipLabelStyle("var(--tone-warning, #f59e0b)")}>
                        Ascension {ascensionPreview?.currentAscensionTier || 0} / {getBlueprintAscensionCap()}
                      </span>
                      <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                        {ascensionPreview?.atCap
                          ? "El blueprint ya alcanzo su cap actual."
                          : `Requiere nivel ${getBlueprintLevelCap()} · ${ascensionPreview?.costs?.relicDust || 0} polvo · ${ascensionPreview?.costs?.essence || 0} esencia`}
                      </div>
                      <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                        {ascensionPreview?.atCap
                          ? "No puede seguir empujando tier por esta via."
                          : `Al ascender reinicia la estructura a 0 y empuja la siguiente materializacion de Tier ${ascensionPreview?.currentEffectiveTier || getBlueprintEffectiveItemTier(selectedBlueprint)} a ${ascensionPreview?.nextEffectiveTier || getBlueprintEffectiveItemTier(selectedBlueprint)}.`}
                      </div>
                      <button
                        onClick={() => dispatch({ type: "ASCEND_BLUEPRINT", blueprintId: selectedBlueprint.id, now: Date.now() })}
                        disabled={!canAscend.ok}
                        style={actionButtonStyle({
                          primary: canAscend.ok,
                          disabled: !canAscend.ok,
                        })}
                      >
                        Ascender blueprint
                      </button>
                    </div>
                  </div>

                  <div style={panelStyle()}>
                    <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-success, #10b981)" }}>
                      Direccion de roll
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.5 }}>
                      La run no recibe el item exacto. Recibe una nueva interpretacion. Las afinidades sesgan el pool de affixes que se rolleara al iniciar la expedicion.
                    </div>
                    {selectedBlueprint.legendaryPowerId ? (
                      <div style={{ display: "grid", gap: "6px" }}>
                        <span style={chipLabelStyle("var(--tone-success, #10b981)")}>
                          Sintonia {powerTunePreview?.currentLevel || 0} / {getBlueprintPowerTuneCap()}
                        </span>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                            {powerTunePreview?.atCap
                              ? "El poder ya esta en su cap actual."
                              : `${powerTunePreview?.costs?.relicDust || 0} polvo · la sintonia potencia el efecto numerico del poder`}
                          </div>
                          <button
                            onClick={() => dispatch({ type: "TUNE_BLUEPRINT_POWER", blueprintId: selectedBlueprint.id, now: Date.now() })}
                            disabled={!!powerTunePreview?.atCap || relicDustAvailable < Number(powerTunePreview?.costs?.relicDust || 0)}
                            style={actionButtonStyle({
                              primary: !powerTunePreview?.atCap && relicDustAvailable >= Number(powerTunePreview?.costs?.relicDust || 0),
                              disabled: !!powerTunePreview?.atCap || relicDustAvailable < Number(powerTunePreview?.costs?.relicDust || 0),
                            })}
                          >
                            Sintonizar poder
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span style={chipLabelStyle("var(--color-text-secondary, #64748b)")}>
                        Sin poder legendario
                      </span>
                    )}
                  </div>
                </div>

                <div style={panelStyle()}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
                        Preview de materializacion
                      </div>
                      <div style={{ fontSize: "0.92rem", fontWeight: "900", marginTop: "2px" }}>
                        Forecast generico de la proxima materializacion
                      </div>
                    </div>
                    <span style={chipLabelStyle("var(--tone-info, #0369a1)")}>
                      rating {materializationPreview?.effectiveRating || getBlueprintEffectiveBaseRating(selectedBlueprint)}
                    </span>
                  </div>

                  {materializationPreview ? (
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div style={{ display: "grid", gap: "4px" }}>
                        <div style={{ fontSize: "0.86rem", fontWeight: "900", color: getRarityColor(materializationPreview.rarity) }}>
                          {materializationPreview.familyName || (materializationPreview.slot === "weapon" ? "Arma" : "Armadura")} · {materializationPreview.rarity}
                        </div>
                        <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                          {materializationPreview.slot} · tier efectivo {materializationPreview.effectiveTier} · {materializationPreview.affixCount} afijo{materializationPreview.affixCount === 1 ? "" : "s"}
                          {materializationPreview.hasLegendaryPower ? ` · sintonia ${materializationPreview.powerTuneLevel || 0}/${getBlueprintPowerTuneCap()}` : ""}
                        </div>
                      </div>

                      <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                        <strong>Base fija del plano:</strong>{" "}
                        {formatStatList(materializationPreview.baseStats || []) || "sin identidad base especial"}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                        <strong>Implicito que arrastra:</strong>{" "}
                        {formatStatList(materializationPreview.implicitStats || []) || "sin implicito visible"}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                        <strong>Estructura del plano:</strong> base {materializationPreview.structureBands?.base || "leve"} · implicito {materializationPreview.structureBands?.implicit || "leve"}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                        <strong>Tendencia de tiers:</strong> {materializationPreview.tierBias?.label || "Rango medio"}.
                        {" "}{materializationPreview.tierBias?.detail || ""}
                      </div>

                      {materializationPreview.topFamilies?.length > 0 ? (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {materializationPreview.topFamilies.map(entry => (
                            <span key={`top-family-${entry.familyId}`} style={chipLabelStyle(entry.meta?.color || "var(--tone-info, #0369a1)")}>
                              {entry.meta?.label || entry.familyId} · sesgo {entry.score}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
                          <strong>Sesgo de familias:</strong> sin afinidades fuertes todavia.
                        </div>
                      )}

                      {materializationPreview.likelyStats?.length > 0 && (
                        <div style={{ display: "grid", gap: "6px" }}>
                          <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #475569)" }}>
                            Lineas que pueden aparecer con mas facilidad
                          </div>
                          <div style={{ display: "grid", gap: "4px" }}>
                            {materializationPreview.likelyStats.map(entry => (
                              <div key={`likely-stat-${entry.stat}`} style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.4 }}>
                                <strong>{ITEM_STAT_LABELS?.[entry.stat] || entry.stat}</strong> · chance {getWeightLabel(entry.weight)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                      No se pudo generar una preview de materializacion para este blueprint.
                    </div>
                  )}
                </div>

                <div style={panelStyle()}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-violet, #7c3aed)" }}>
                        Afinidades
                      </div>
                      <div style={{ fontSize: "0.92rem", fontWeight: "900", marginTop: "2px" }}>
                        Gasta cargas para sesgar la primera materializacion
                      </div>
                    </div>
                    <span style={chipLabelStyle("var(--tone-violet, #7c3aed)")}>
                      primaria: {selectedBlueprint.primaryFamily || "ninguna"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: "8px" }}>
                    {Object.values(BLUEPRINT_AFFIX_FAMILIES).map(family => {
                      const affinity = Math.max(0, Number(selectedBlueprint?.affinity?.[family.id] || 0));
                      const chargeCount = Math.max(0, Number(familyCharges?.[family.id] || 0));
                      const isPrimary = selectedBlueprint.primaryFamily === family.id;
                      const isSecondary = selectedBlueprint.secondaryFamily === family.id;
                      return (
                        <div key={family.id} style={{ ...panelStyle(), gap: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start", flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: "0.8rem", fontWeight: "900", color: family.color }}>{family.label}</div>
                              <div style={{ fontSize: "0.66rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                                {family.stats.join(", ")}
                              </div>
                            </div>
                            <div style={{ display: "grid", gap: "4px", justifyItems: "end" }}>
                              <span style={chipLabelStyle(family.color)}>
                                afinidad {affinity}
                              </span>
                              <span style={chipLabelStyle(isPrimary ? "var(--tone-danger, #D85A30)" : isSecondary ? "var(--tone-info, #0369a1)" : "var(--color-text-secondary, #475569)")}>
                                {isPrimary ? "Principal" : isSecondary ? "Secundaria" : "Secundaria libre"}
                              </span>
                            </div>
                          </div>

                          <div style={affinityBarStyle()}>
                            <div style={{ width: `${Math.min(100, (affinity / 70) * 100)}%`, height: "100%", background: family.color }} />
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ fontSize: "0.66rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
                              {chargeCount} cargas disponibles
                            </div>
                            <button
                              onClick={() => dispatch({ type: "INVEST_BLUEPRINT_AFFINITY", blueprintId: selectedBlueprint.id, familyId: family.id, charges: 1 })}
                              disabled={chargeCount <= 0}
                              style={actionButtonStyle({ primary: chargeCount > 0, disabled: chargeCount <= 0 })}
                            >
                              Invertir 1 carga
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section style={panelStyle()}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
                Banco de Cargas
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: "900", marginTop: "2px" }}>
                Recursos listos para invertir en afinidad
              </div>
            </div>
            <span style={chipLabelStyle("var(--tone-accent, #4338ca)")}>
              {Object.values(familyCharges || {}).reduce((total, value) => total + Math.max(0, Number(value || 0)), 0)} totales
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0,1fr))", gap: "8px" }}>
            {Object.values(BLUEPRINT_AFFIX_FAMILIES).map(family => (
              <div key={family.id} style={panelStyle()}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: "0.76rem", fontWeight: "900", color: family.color }}>{family.label}</div>
                    <div style={{ fontSize: "0.64rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
                      {family.stats.join(", ")}
                    </div>
                  </div>
                  <span style={chipLabelStyle(family.color)}>
                    {Math.max(0, Number(familyCharges?.[family.id] || 0))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
