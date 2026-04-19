import React, { useEffect, useMemo, useRef, useState } from "react";
import { calculatePrestigeEchoGain, canPrestige, getPrestigeResonanceSummary } from "../engine/progression/prestigeEngine";
import { getPlayerBuildTag } from "../utils/buildIdentity";
import { buildSessionTelemetryEntries, buildSessionTelemetryReport, buildSessionTelemetrySections } from "../utils/runTelemetry";
import { buildReplayDatasetSummary, buildReplayJsonExport, buildReplayLibraryExport, buildReplaySummary, buildReplayTextReport, deriveHumanReplayProfile, parseReplayImportPayload } from "../utils/replayLog";
import { runBalanceBotSimulation } from "../engine/simulation/balanceBot";
import { clearGame, importGameFromText, isRecoveryMode, saveGame, serializeSaveGame } from "../utils/storage";

function formatNumber(value) {
  if (typeof value !== "number") return value;
  if (Number.isInteger(value)) return value.toLocaleString();
  if (Math.abs(value) >= 100) return Math.round(value).toLocaleString();
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatPct(value) {
  return `${formatNumber((Number(value || 0)) * 100)}%`;
}

function formatShortDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function slugifyName(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "replay";
}

function rarityColor(rarity) {
  const colors = {
    common: "#cbd5e1",
    magic: "#1D9E75",
    rare: "#3b82f6",
    epic: "#a855f7",
    legendary: "#f59e0b",
  };

  return colors[rarity] || "#fff";
}

function formatRunDuration(ticks = 0) {
  const seconds = Math.max(1, Math.floor(ticks));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${remainingSeconds}s`;
}

function currentTierPressure(tier = 1) {
  return Math.max(10, Math.round(12 + tier * 10 + tier * tier * 1.5));
}

export default function Stats({ state, dispatch, mode = "stats" }) {
  const { player, combat, prestige } = state;
  const isDarkMode = state.settings?.theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openSections, setOpenSections] = useState({
    save: false,
    bot: false,
    replay: false,
    telemetry: false,
    lastRun: false,
  });
  const [copied, setCopied] = useState(false);
  const [saveCopied, setSaveCopied] = useState(false);
  const [saveImportText, setSaveImportText] = useState("");
  const [saveImportStatus, setSaveImportStatus] = useState("");
  const [replayCopied, setReplayCopied] = useState(false);
  const [replayJsonCopied, setReplayJsonCopied] = useState(false);
  const [replayBundleCopied, setReplayBundleCopied] = useState(false);
  const [replayLibraryLabel, setReplayLibraryLabel] = useState("");
  const [replayImportText, setReplayImportText] = useState("");
  const [replayImportStatus, setReplayImportStatus] = useState("");
  const [botCopied, setBotCopied] = useState(false);
  const [botRunning, setBotRunning] = useState(false);
  const [botResult, setBotResult] = useState(null);
  const saveFileInputRef = useRef(null);
  const replayFileInputRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const prestigeStatus = canPrestige(state);
  const projectedPoints = calculatePrestigeEchoGain(state);
  const prestigeResonance = useMemo(() => getPrestigeResonanceSummary(prestige), [prestige]);
  const currentRun = combat.runStats || {};
  const snapshot = combat.performanceSnapshot || {};
  const analytics = combat.analytics || {};
  const telemetryEntries = useMemo(() => buildSessionTelemetryEntries(state), [state]);
  const telemetrySections = useMemo(() => buildSessionTelemetrySections(state), [state]);
  const telemetryText = useMemo(() => buildSessionTelemetryReport(state), [state]);
  const replaySummary = useMemo(() => buildReplaySummary(state), [state]);
  const replayProfile = useMemo(() => deriveHumanReplayProfile(state.replay || {}), [state.replay]);
  const replayText = useMemo(() => buildReplayTextReport(state), [state]);
  const replayJsonText = useMemo(() => JSON.stringify(buildReplayJsonExport(state), null, 2), [state]);
  const replayLibraryEntries = useMemo(() => state.replayLibrary?.entries || [], [state.replayLibrary]);
  const activeReplayLibraryEntries = useMemo(() => replayLibraryEntries.filter(entry => entry.isActive !== false), [replayLibraryEntries]);
  const saveJsonText = useMemo(() => serializeSaveGame(state, { pretty: true }), [state]);
  const recoveryMode = useMemo(() => isRecoveryMode(), []);
  const hasCurrentReplayData = (state.replay?.actions || []).length > 0 || (state.replay?.milestones || []).length > 0;
  const combinedReplaySource = useMemo(() => [
    ...(hasCurrentReplayData ? [state.replay] : []),
    ...activeReplayLibraryEntries.map(entry => entry.replay),
  ], [hasCurrentReplayData, state.replay, activeReplayLibraryEntries]);
  const combinedReplayProfile = useMemo(() => deriveHumanReplayProfile(combinedReplaySource), [combinedReplaySource]);
  const combinedReplaySummary = useMemo(() => buildReplayDatasetSummary(combinedReplaySource), [combinedReplaySource]);
  const replayBundleText = useMemo(() => JSON.stringify(
    buildReplayLibraryExport(
      [
        ...(hasCurrentReplayData
          ? [{
              id: "current-session",
              label: "Sesion actual",
              importedAt: Date.now(),
              exportedAt: null,
              isActive: true,
              replay: state.replay,
            }]
          : []),
        ...activeReplayLibraryEntries,
      ],
      { label: "Replay Dataset Activo" }
    ),
    null,
    2
  ), [hasCurrentReplayData, state.replay, activeReplayLibraryEntries]);
  const buildTag = getPlayerBuildTag(player);
  const isLab = mode === "lab";
  const isStatsMode = !isLab;

  const damagePerTick = snapshot.damagePerTick || 0;
  const goldPerTick = snapshot.goldPerTick || 0;
  const xpPerTick = snapshot.xpPerTick || 0;
  const killsPerMinute = snapshot.killsPerMinute || 0;
  const estimatedTierPressure = currentTierPressure(combat.currentTier || 1);
  const pressureRatio = damagePerTick / Math.max(1, estimatedTierPressure);
  const survivabilityRatio = (player.hp || 0) / Math.max(1, player.maxHp || 1);
  const goldPerMinute = goldPerTick * 60;
  const xpPerMinute = xpPerTick * 60;
  const lastRunSummary = combat.lastRunSummary;
  const weapon = player.equipment.weapon;
  const armor = player.equipment.armor;

  useEffect(() => {
    if (!isMobile) {
      setOpenSections({
        save: isLab,
        bot: isLab,
        replay: isLab,
        telemetry: isStatsMode,
        lastRun: isStatsMode,
      });
      return;
    }
    setOpenSections({
      save: false,
      bot: false,
      replay: false,
      telemetry: isStatsMode,
      lastRun: false,
    });
  }, [isLab, isMobile, isStatsMode]);

  const buildStatus =
    survivabilityRatio < 0.35
      ? { label: "En riesgo", color: "#D85A30", description: "La build esta sobreviviendo muy justo en este tier." }
      : pressureRatio > 1.7
        ? { label: "Sobrado", color: "#1D9E75", description: "Tu dano actual deberia limpiar este tier con bastante margen." }
        : pressureRatio > 0.9
          ? { label: "Parejo", color: "#534AB7", description: "La build esta compitiendo bien y todavia puede empujar." }
          : { label: "Ajustado", color: "#f59e0b", description: "Te conviene reforzar dano o defensa antes de seguir escalando." };

  const runRows = [
    { label: "Estado", value: buildStatus.label, accent: buildStatus.color },
    { label: "Build", value: buildTag?.name || "Sin tag", accent: "#0f766e" },
    { label: "Tier Actual", value: formatNumber(combat.currentTier || 1) },
    { label: "Presion Tier", value: formatNumber(estimatedTierPressure) },
    { label: "Ritmo", value: `${formatNumber(pressureRatio)}x`, accent: "#f59e0b" },
    { label: "Duracion Run", value: combat.ticksInCurrentRun > 0 ? formatRunDuration(combat.ticksInCurrentRun) : "Sin run activa" },
    { label: "Bajas Run", value: formatNumber(currentRun.kills || 0) },
    { label: "Dano / Tick", value: formatNumber(damagePerTick) },
    { label: "Oro / Tick", value: formatNumber(goldPerTick) },
    { label: "XP / Tick", value: formatNumber(xpPerTick) },
    { label: "Bajas / Min", value: formatNumber(killsPerMinute) },
    { label: "Oro / Min", value: formatNumber(goldPerMinute) },
    { label: "XP / Min", value: formatNumber(xpPerMinute) },
    { label: "Esencia Run", value: formatNumber(currentRun.essence || 0) },
    { label: "Items Run", value: formatNumber(currentRun.items || 0) },
  ];

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(telemetryText);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleSaveNow = () => {
    if (recoveryMode) {
      setSaveImportStatus("Estas en modo recovery. Sali de ?fresh=1/?wipe=1 para guardar.");
      return;
    }
    saveGame(state);
    setSaveImportStatus("Save escrito en localStorage.");
  };

  const handleCopySave = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(saveJsonText);
      }
      setSaveCopied(true);
      window.setTimeout(() => setSaveCopied(false), 1800);
    } catch {
      setSaveCopied(false);
    }
  };

  const handleCopyReplay = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(replayText);
      }
      setReplayCopied(true);
      window.setTimeout(() => setReplayCopied(false), 1800);
    } catch {
      setReplayCopied(false);
    }
  };

  const handleCopyReplayJson = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(replayJsonText);
      }
      setReplayJsonCopied(true);
      window.setTimeout(() => setReplayJsonCopied(false), 1800);
    } catch {
      setReplayJsonCopied(false);
    }
  };

  const handleCopyReplayBundle = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(replayBundleText);
      }
      setReplayBundleCopied(true);
      window.setTimeout(() => setReplayBundleCopied(false), 1800);
    } catch {
      setReplayBundleCopied(false);
    }
  };

  const handleDownloadText = (text, filename) => {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleDownloadReplayJson = () => {
    const spec = replaySummary.preferredSpec || player.specialization || "session";
    const craft = replaySummary.preferredCraftMode || "mixed";
    const filename = `${slugifyName(`replay-${spec}-${craft}-${replaySummary.actionCount}a`)}.json`;
    handleDownloadText(replayJsonText, filename);
  };

  const handleDownloadReplayBundle = () => {
    const spec = combinedReplaySummary.preferredSpec || player.specialization || "dataset";
    const filename = `${slugifyName(`replay-bundle-${spec}-${combinedReplaySummary.replayCount}r`)}.json`;
    handleDownloadText(replayBundleText, filename);
  };

  const handleDownloadSave = () => {
    const className = player.class || "save";
    const spec = player.specialization || "base";
    const filename = `${slugifyName(`save-${className}-${spec}-lvl${player.level || 1}`)}.json`;
    handleDownloadText(saveJsonText, filename);
  };

  const handleImportSave = () => {
    try {
      importGameFromText(saveImportText);
      setSaveImportStatus("Save importado. Recargando...");
      window.setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname;
      }, 120);
    } catch {
      setSaveImportStatus("Save JSON invalido.");
    }
  };

  const handleImportSaveFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setSaveImportText(text);
      importGameFromText(text);
      setSaveImportStatus(`Save importado desde ${file.name}. Recargando...`);
      window.setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname;
      }, 120);
    } catch {
      setSaveImportStatus("Archivo de save invalido.");
    } finally {
      event.target.value = "";
    }
  };

  const handleResetSave = () => {
    if (recoveryMode) {
      setSaveImportStatus("Resetear desde recovery no cambia la partida activa. Sali del modo recovery primero.");
      return;
    }
    if (!window.confirm("Esto borra tu save local actual. Continuar?")) return;
    clearGame();
    window.location.href = window.location.origin + window.location.pathname;
  };

  const handleSaveReplayToLibrary = () => {
    dispatch({
      type: "SAVE_CURRENT_REPLAY_TO_LIBRARY",
      label: replayLibraryLabel.trim() || undefined,
      meta: { replay: false },
    });
    setReplayLibraryLabel("");
  };

  const handleImportReplay = () => {
    try {
      const parsed = JSON.parse(replayImportText);
      const entries = parseReplayImportPayload(parsed, {
        label: replayLibraryLabel.trim() || "Replay importado",
      });
      if (!entries.length) {
        setReplayImportStatus("No encontre acciones validas en ese JSON.");
        return;
      }
      dispatch({ type: "IMPORT_REPLAY_LIBRARY", entries, meta: { replay: false } });
      setReplayImportStatus(`${entries.length} replay(s) importados.`);
      setReplayImportText("");
      setReplayLibraryLabel("");
    } catch {
      setReplayImportStatus("JSON invalido.");
    }
  };

  const handleImportReplayFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setReplayImportText(text);
      const parsed = JSON.parse(text);
      const entries = parseReplayImportPayload(parsed, {
        label: replayLibraryLabel.trim() || file.name.replace(/\.json$/i, ""),
      });
      if (!entries.length) {
        setReplayImportStatus("No encontre acciones validas en ese archivo.");
      } else {
        dispatch({ type: "IMPORT_REPLAY_LIBRARY", entries, meta: { replay: false } });
        setReplayImportStatus(`${entries.length} replay(s) importados desde archivo.`);
        setReplayLibraryLabel("");
      }
    } catch {
      setReplayImportStatus("Archivo JSON invalido.");
    } finally {
      event.target.value = "";
    }
  };

  const handleRunBot = async () => {
    setBotRunning(true);
    setBotCopied(false);
    await new Promise(resolve => window.setTimeout(resolve, 20));
    const result = runBalanceBotSimulation(state, {
      ticks: 1800,
      humanProfile: combinedReplayProfile,
      replaySource: combinedReplaySource,
    });
    setBotResult(result);
    setBotRunning(false);
  };

  const botReportText = useMemo(() => {
    if (!botResult) return "";
    return [
      "IdleRPG Balance Bot",
      "===================",
      `Ticks simulados: ${botResult.ticksSimulated}`,
      `Nivel final: ${botResult.summary.level}`,
      `Tier maximo: ${botResult.summary.tier}`,
      `Especializacion: ${botResult.summary.specialization}`,
      `Oro final: ${botResult.summary.gold}`,
      `Esencia final: ${botResult.summary.essence}`,
      `Prestige final: ${botResult.summary.prestigeLevel}`,
      `Ecos disponibles: ${botResult.summary.echoes}`,
      `Mejor drop: ${botResult.summary.bestDrop}`,
      `Diagnostico: ${botResult.summary.stagnationReason}`,
      `Dataset humano: ${combinedReplaySummary.replayCount} replay(s) · ${combinedReplaySummary.uiActionCount} acciones UI · spec ${combinedReplaySummary.preferredSpec} · push HP ${formatPct(combinedReplaySummary.avgPushHpRatio)} · craft ${combinedReplaySummary.preferredCraftMode}`,
      "",
      botResult.telemetryText,
      "",
      "Decisiones IA",
      "------------",
      ...botResult.decisions,
    ].join("\n");
  }, [botResult]);

  const handleCopyBot = async () => {
    if (!botReportText) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(botReportText);
      }
      setBotCopied(true);
      window.setTimeout(() => setBotCopied(false), 1800);
    } catch {
      setBotCopied(false);
    }
  };
  const toggleSection = key => {
    setOpenSections(current => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div style={{ padding: isMobile ? "0.9rem" : "1.2rem", display: "flex", flexDirection: "column", gap: "12px", background: isDarkMode ? "linear-gradient(180deg, var(--color-background-primary, #0b1220) 0%, var(--color-background-secondary, #111a2e) 100%)" : "linear-gradient(180deg, var(--color-background-primary, #f8fafc) 0%, var(--color-background-tertiary, #eef6f4) 100%)", color: "var(--color-text-primary, #1e293b)" }}>
      {isLab && (
        <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
          <div style={lightPanelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", flexWrap: "wrap" }}>
              <div>
                <div style={sectionTitleStyle}>Laboratorio</div>
                <div style={{ fontSize: "0.84rem", color: "#102a43", fontWeight: "900", marginTop: "3px" }}>
                  Save, replay y tester
                </div>
                <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px", lineHeight: 1.4 }}>
                  Herramientas de backup, dataset y simulacion separadas de las metricas de juego.
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <div style={pillStyle("rgba(15,118,110,0.12)", "#0f766e", "rgba(15,118,110,0.22)")}>
                  Replays {formatNumber(activeReplayLibraryEntries.length + (hasCurrentReplayData ? 1 : 0))}
                </div>
                <div style={pillStyle("rgba(99,102,241,0.10)", "#4338ca", "rgba(99,102,241,0.22)")}>
                  Recovery {recoveryMode ? "ON" : "OFF"}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {isStatsMode && (
      <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
        {Number(prestige.level || 0) >= 1 && (
          <div style={lightPanelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", flexWrap: "wrap" }}>
              <div>
                <div style={sectionTitleStyle}>Ecos</div>
                <div style={{ fontSize: "0.8rem", color: "#102a43", fontWeight: "900", marginTop: "3px" }}>
                  P{formatNumber(prestige.level || 0)} · Resonancia {formatNumber(prestigeResonance.totalEchoesEarned || 0)} ecos
                </div>
                <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px", lineHeight: 1.4 }}>
                  {prestigeStatus.ok
                    ? `Listo para resetear: +${formatNumber(projectedPoints)} ecos.`
                    : "Segui empujando la corrida; el detalle completo vive en Ecos."}
                </div>
              </div>
              <div style={{ ...pillStyle(prestigeStatus.ok ? "rgba(245,158,11,0.12)" : "rgba(148,163,184,0.12)", prestigeStatus.ok ? "#f59e0b" : "#64748b", prestigeStatus.ok ? "rgba(245,158,11,0.28)" : "rgba(148,163,184,0.24)") }}>
                {prestigeStatus.ok ? `+${formatNumber(projectedPoints)} ecos` : `${formatNumber(projectedPoints)} ecos potenciales`}
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
              <div style={pillStyle("rgba(15,118,110,0.12)", "#0f766e", "rgba(15,118,110,0.22)")}>
                Ecos {formatNumber(prestige.echoes || 0)}
              </div>
              <div style={pillStyle("rgba(148,163,184,0.12)", "#475569", "rgba(148,163,184,0.24)")}>
                Tier max {formatNumber(analytics.maxTierReached || combat.maxTier || 1)}
              </div>
              <div style={pillStyle("rgba(148,163,184,0.12)", "#475569", "rgba(148,163,184,0.24)")}>
                Nivel max {formatNumber(analytics.maxLevelReached || player.level)}
              </div>
              <div style={pillStyle("rgba(99,102,241,0.10)", "#4338ca", "rgba(99,102,241,0.22)")}>
                Total ganado {formatNumber(prestige.totalEchoesEarned || 0)} ecos
              </div>
            </div>
          </div>
        )}

        <div style={lightPanelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
            <div>
              <div style={sectionTitleStyle}>Corrida Actual</div>
              <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "3px" }}>Lectura rapida de la run activa para sentir ritmo y riesgo.</div>
            </div>
            <div style={{ ...pillStyle(`${buildStatus.color}15`, buildStatus.color, `${buildStatus.color}55`) }}>{buildStatus.label}</div>
          </div>

          <div style={tableStyle}>
            {runRows.map(row => (
              <DataRow key={row.label} label={row.label} value={row.value} accent={row.accent} />
            ))}
          </div>
        </div>
      </section>
      )}

      {isLab && <section style={lightPanelStyle}>
        <button onClick={() => toggleSection("save")} style={accordionHeaderButtonStyle}>
          <div>
            <div style={sectionTitleStyle}>Save</div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "3px" }}>
              Exporta, importa, resetea o fuerza un guardado sin salir del juego.
            </div>
          </div>
          <span style={accordionLabelStyle}>{openSections.save ? "Ocultar" : "Ver"}</span>
        </button>

        {openSections.save && (
          <>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px", marginBottom: "10px" }}>
              <button onClick={handleSaveNow} style={actionBtnStyle("#0f766e", "#ffffff")}>Guardar ahora</button>
              <button onClick={handleCopySave} style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}>{saveCopied ? "Save copiado" : "Copiar JSON save"}</button>
              <button onClick={handleDownloadSave} style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}>Descargar save</button>
              <button onClick={handleResetSave} style={actionBtnStyle("#ffffff", "#b91c1c", "1px solid #fecaca")}>Resetear save</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.95fr 1.05fr", gap: "10px" }}>
              <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                <div style={sectionTitleStyle}>Estado</div>
                <DataRow label="Modo recovery" value={recoveryMode ? "Si" : "No"} />
                <DataRow label="Clase / Spec" value={`${player.class || "-"} / ${player.specialization || "-"}`} />
                <DataRow label="Nivel" value={formatNumber(player.level || 1)} />
                <DataRow label="Tier" value={formatNumber(combat.currentTier || 1)} />
                <DataRow label="Prestigio" value={formatNumber(prestige.level || 0)} />
                <DataRow label="Poderes descubiertos" value={formatNumber((state.codex?.powerDiscoveries ? Object.values(state.codex.powerDiscoveries).filter(value => Number(value || 0) > 0).length : 0))} />
                <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "10px", lineHeight: 1.45 }}>
                  La importacion reescribe el save local y recarga la pagina. Si estas en `?fresh=1` o `?wipe=1`, primero sali de ese modo.
                </div>
              </div>

              <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                <div style={sectionTitleStyle}>Importar JSON</div>
                <input ref={saveFileInputRef} type="file" accept=".json,application/json" onChange={handleImportSaveFile} style={{ display: "none" }} />
                <textarea
                  value={saveImportText}
                  onChange={event => setSaveImportText(event.target.value)}
                  placeholder="Pega aca un save exportado"
                  style={{ width: "100%", minHeight: isMobile ? "160px" : "220px", marginTop: "8px", borderRadius: "14px", border: "1px solid var(--color-border-secondary, #dbe7e3)", padding: "12px", fontFamily: "Consolas, monospace", fontSize: "0.72rem", color: "var(--color-text-primary, #1e293b)", background: "var(--color-background-secondary, #fff)", resize: "vertical" }}
                />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                  <button onClick={handleImportSave} style={actionBtnStyle("#1d4ed8", "#ffffff")}>Importar save</button>
                  <button onClick={() => saveFileInputRef.current?.click()} style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}>Subir archivo .json</button>
                </div>
                {saveImportStatus && <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "8px" }}>{saveImportStatus}</div>}
              </div>
            </div>
          </>
        )}
      </section>}

      {isLab && <section style={lightPanelStyle}>
        <button onClick={() => toggleSection("replay")} style={accordionHeaderButtonStyle}>
          <div>
            <div style={sectionTitleStyle}>Replay de Sesion</div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "3px" }}>
              Log estructurado de decisiones humanas y milestones del runtime para entrenar testers mas parecidos al jugador real.
            </div>
          </div>
          <span style={accordionLabelStyle}>{openSections.replay ? "Ocultar" : "Ver"}</span>
        </button>

        {openSections.replay && (
          <>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px", marginBottom: "10px" }}>
              <button onClick={handleCopyReplay} style={actionBtnStyle("#0f766e", "#ffffff")}>{replayCopied ? "Copiado" : "Copiar texto replay"}</button>
              <button onClick={handleCopyReplayJson} style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}>{replayJsonCopied ? "JSON copiado" : "Copiar JSON replay"}</button>
              <button onClick={handleDownloadReplayJson} style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}>Descargar replay</button>
              <button onClick={handleCopyReplayBundle} style={actionBtnStyle("#ffffff", "#7c3aed", "1px solid #ddd6fe")}>{replayBundleCopied ? "Bundle copiado" : "Copiar bundle activo"}</button>
              <button onClick={handleDownloadReplayBundle} style={actionBtnStyle("#ffffff", "#7c3aed", "1px solid #ddd6fe")}>Descargar bundle</button>
              <button onClick={handleSaveReplayToLibrary} style={actionBtnStyle("#ffffff", "#0f766e", "1px solid #a7f3d0")}>Guardar en biblioteca</button>
              <button onClick={() => dispatch({ type: "RESET_REPLAY_LOG" })} style={actionBtnStyle("#ffffff", "#b91c1c", "1px solid #fecaca")}>Resetear replay</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                <div style={sectionTitleStyle}>Biblioteca</div>
                <input
                  value={replayLibraryLabel}
                  onChange={event => setReplayLibraryLabel(event.target.value)}
                  placeholder="Ej: berserker-push-agresivo-t8"
                  style={{ width: "100%", marginTop: "8px", borderRadius: "10px", border: "1px solid var(--color-border-secondary, #dbe7e3)", padding: "10px 12px", fontSize: "0.72rem", color: "var(--color-text-primary, #1e293b)", background: "var(--color-background-secondary, #fff)" }}
                />
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px", maxHeight: isMobile ? "240px" : "300px", overflowY: "auto" }}>
                  {replayLibraryEntries.length > 0 ? replayLibraryEntries.map(entry => {
                    const entryProfile = deriveHumanReplayProfile(entry.replay);
                    return (
                      <div key={entry.id} style={{ background: "var(--color-background-secondary, #ffffff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "10px", padding: "9px 10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "start" }}>
                          <div>
                            <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "#1e293b" }}>{entry.label}</div>
                            <div style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "4px" }}>
                              {(entry.replay?.actions || []).length} acciones · {(entry.replay?.milestones || []).length} hitos · {entryProfile.preferredSpec || "sin spec"}
                            </div>
                            <div style={{ fontSize: "0.58rem", color: "#94a3b8", marginTop: "3px", lineHeight: 1.35 }}>
                              Guardado: {formatShortDateTime(entry.importedAt)} · Push {formatPct(entryProfile.avgPushHpRatio || 0)} · Drop {formatPct(entryProfile.avgDropHpRatio || 0)} · Craft {entryProfile.preferredCraftMode || "-"}
                            </div>
                          </div>
                          <div style={{ ...pillStyle(entry.isActive !== false ? "rgba(15,118,110,0.12)" : "rgba(148,163,184,0.12)", entry.isActive !== false ? "#0f766e" : "#64748b", "transparent") }}>
                            {entry.isActive !== false ? "Activo" : "Off"}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                          <button onClick={() => dispatch({ type: "TOGGLE_REPLAY_LIBRARY_ENTRY", replayId: entry.id, meta: { replay: false } })} style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}>
                            {entry.isActive !== false ? "Desactivar" : "Activar"}
                          </button>
                          <button onClick={() => dispatch({ type: "DELETE_REPLAY_LIBRARY_ENTRY", replayId: entry.id, meta: { replay: false } })} style={actionBtnStyle("#ffffff", "#b91c1c", "1px solid #fecaca")}>
                            Borrar
                          </button>
                        </div>
                      </div>
                    );
                  }) : <div style={{ fontSize: "0.74rem", color: "#64748b" }}>Todavia no guardaste ni importaste replays en la biblioteca.</div>}
                </div>
                {replayLibraryEntries.length > 0 && (
                  <button onClick={() => dispatch({ type: "CLEAR_REPLAY_LIBRARY", meta: { replay: false } })} style={{ ...actionBtnStyle("#ffffff", "#b91c1c", "1px solid #fecaca"), marginTop: "10px" }}>
                    Vaciar biblioteca
                  </button>
                )}
              </div>

              <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                <div style={sectionTitleStyle}>Importar JSON</div>
                <input ref={replayFileInputRef} type="file" accept=".json,application/json" onChange={handleImportReplayFile} style={{ display: "none" }} />
                <textarea
                  value={replayImportText}
                  onChange={event => setReplayImportText(event.target.value)}
                  placeholder="Pega aca un replay JSON o un bundle exportado"
                  style={{ width: "100%", minHeight: isMobile ? "160px" : "210px", marginTop: "8px", borderRadius: "14px", border: "1px solid var(--color-border-secondary, #dbe7e3)", padding: "12px", fontFamily: "Consolas, monospace", fontSize: "0.72rem", color: "var(--color-text-primary, #1e293b)", background: "var(--color-background-secondary, #fff)", resize: "vertical" }}
                />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                  <button onClick={handleImportReplay} style={actionBtnStyle("#1d4ed8", "#ffffff")}>Importar a biblioteca</button>
                  <button onClick={() => replayFileInputRef.current?.click()} style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}>Subir archivo .json</button>
                </div>
                {replayImportStatus && <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "8px" }}>{replayImportStatus}</div>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))", gap: "8px", marginBottom: "10px" }}>
              <MetricPill label="Acciones" value={replaySummary.actionCount} />
              <MetricPill label="UI" value={replaySummary.uiActionCount} />
              <MetricPill label="Hitos" value={replaySummary.milestoneCount} />
              <MetricPill label="Push HP%" value={formatPct(replaySummary.avgPushHpRatio)} />
              <MetricPill label="Drop HP%" value={formatPct(replaySummary.avgDropHpRatio)} />
              <MetricPill label="Craft" value={replaySummary.preferredCraftMode} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: "10px" }}>
              <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                <div style={sectionTitleStyle}>Perfil Humano Derivado</div>
                <DataRow label="Spec preferida" value={replaySummary.preferredSpec} />
                <DataRow label="Bias auto-avance" value={formatNumber(replaySummary.autoAdvanceBias)} />
                <DataRow label="Wishlist" value={(replaySummary.wishlistStats || []).join(", ") || "-"} />
                <DataRow label="Upgrade" value={formatNumber(replayProfile.craftCounts?.upgrade || 0)} />
                <DataRow label="Reroll" value={formatNumber(replayProfile.craftCounts?.reroll || 0)} />
                <DataRow label="Pulir" value={formatNumber(replayProfile.craftCounts?.polish || 0)} />
                <DataRow label="Reforge" value={formatNumber(replayProfile.craftCounts?.reforge || 0)} />
                <DataRow label="Ascender" value={formatNumber(replayProfile.craftCounts?.ascend || 0)} />
                <DataRow label="Extraer" value={formatNumber(replayProfile.craftCounts?.extract || 0)} />
              </div>

              <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                <div style={sectionTitleStyle}>Dataset Activo del Tester</div>
                <DataRow label="Replays activos" value={formatNumber(combinedReplaySummary.replayCount)} />
                <DataRow label="Acciones UI" value={formatNumber(combinedReplaySummary.uiActionCount)} />
                <DataRow label="Spec dominante" value={combinedReplaySummary.preferredSpec} />
                <DataRow label="Craft dominante" value={combinedReplaySummary.preferredCraftMode} />
                <DataRow label="Push HP" value={formatPct(combinedReplaySummary.avgPushHpRatio)} />
                <DataRow label="Drop HP" value={formatPct(combinedReplaySummary.avgDropHpRatio)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: "10px", marginTop: "10px" }}>
              <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                <div style={sectionTitleStyle}>Ultimas Acciones</div>
                <div style={{ marginTop: "8px", maxHeight: isMobile ? "220px" : "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(state.replay?.actions || []).length > 0 ? (state.replay?.actions || []).slice(-20).reverse().map(entry => (
                    <div key={`replay-action-${entry.id}`} style={{ fontSize: "0.7rem", color: "#334155", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 10px" }}>
                      <strong style={{ color: "#0f172a" }}>[{entry.tick}] {entry.summary?.type}</strong> · {entry.summary?.source}
                      <div style={{ marginTop: "4px", color: "#64748b" }}>
                        lvl {entry.before?.level}→{entry.after?.level} · tier {entry.before?.tier}→{entry.after?.tier} · oro {formatNumber(entry.outcome?.goldDelta || 0)} · esencia {formatNumber(entry.outcome?.essenceDelta || 0)}
                      </div>
                    </div>
                  )) : <div style={{ fontSize: "0.74rem", color: "#64748b" }}>Todavia no hay decisiones registradas en esta sesion.</div>}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                <div style={sectionTitleStyle}>Ultimos Hitos</div>
                <div style={{ marginTop: "8px", maxHeight: isMobile ? "220px" : "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(state.replay?.milestones || []).length > 0 ? (state.replay?.milestones || []).slice(-20).reverse().map(entry => (
                    <div key={`replay-milestone-${entry.id}`} style={{ fontSize: "0.72rem", color: "#334155", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 10px" }}>
                      <strong style={{ color: "#0f172a" }}>[{entry.tick}] {entry.kind}</strong>
                      <div style={{ marginTop: "4px", color: "#64748b" }}>{entry.label}</div>
                    </div>
                  )) : <div style={{ fontSize: "0.74rem", color: "#64748b" }}>Todavia no hay hitos automaticos registrados.</div>}
                </div>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <div>
                  <div style={sectionTitleStyle}>Export Texto Replay</div>
                  <textarea
                    readOnly
                    value={replayText}
                    style={{ width: "100%", minHeight: isMobile ? "220px" : "240px", marginTop: "8px", borderRadius: "14px", border: "1px solid var(--color-border-secondary, #dbe7e3)", padding: "12px", fontFamily: "Consolas, monospace", fontSize: "0.73rem", color: "var(--color-text-primary, #1e293b)", background: "var(--color-background-tertiary, #f8fafc)", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </section>}

      {isLab && <section style={lightPanelStyle}>
        <button onClick={() => toggleSection("bot")} style={accordionHeaderButtonStyle}>
          <div>
            <div style={sectionTitleStyle}>IA de Balance</div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "3px" }}>
              Juega sola durante 30 minutos simulados, sin tocar tu save real, y devuelve un reporte de balance con decisiones tomadas.
            </div>
          </div>
          <span style={accordionLabelStyle}>{openSections.bot ? "Ocultar" : "Ver"}</span>
        </button>

        {openSections.bot && (
          <>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px", marginBottom: "10px" }}>
              <button onClick={handleRunBot} disabled={botRunning} style={actionBtnStyle(botRunning ? "#94a3b8" : "#1d4ed8", "#ffffff")}>{botRunning ? "Corriendo IA..." : "IA · Simular 30m"}</button>
              {botResult && <button onClick={handleCopyBot} style={actionBtnStyle("#ffffff", "#0f766e", "1px solid #a7f3d0")}>{botCopied ? "Copiado" : "Copiar reporte IA"}</button>}
            </div>

            {botResult ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))", gap: "8px", marginBottom: "10px" }}>
                  <MetricPill label="Nivel" value={botResult.summary.level} />
                  <MetricPill label="Tier" value={botResult.summary.tier} />
                  <MetricPill label="Spec" value={botResult.summary.specialization} />
                  <MetricPill label="Oro" value={formatNumber(botResult.summary.gold)} />
                  <MetricPill label="Esencia" value={formatNumber(botResult.summary.essence)} />
                  <MetricPill label="Prestige" value={botResult.summary.prestigeLevel} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: "10px" }}>
                  <div style={tableStyle}>
                    <div style={{ ...sectionTitleStyle, marginTop: "10px" }}>Resumen IA</div>
                    {botResult.telemetryEntries.slice(0, 36).map((entry, index) => (
                      <DataRow key={`bot-${entry.section || "sec"}-${entry.label}-${index}`} label={entry.label} value={entry.value} />
                    ))}
                  </div>

                  <div style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                    <div style={sectionTitleStyle}>Decisiones IA</div>
                    <div style={{ marginTop: "8px", maxHeight: isMobile ? "220px" : "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {botResult.decisions.length > 0 ? botResult.decisions.slice(-40).map((entry, index) => (
                        <div key={`${entry}-${index}`} style={{ fontSize: "0.72rem", color: "#334155", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 10px" }}>{entry}</div>
                      )) : <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)" }}>La IA no tuvo que tomar decisiones visibles.</div>}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <div style={sectionTitleStyle}>Export Texto IA</div>
                  <textarea
                    readOnly
                    value={botReportText}
                    style={{ width: "100%", minHeight: isMobile ? "220px" : "260px", marginTop: "8px", borderRadius: "14px", border: "1px solid var(--color-border-secondary, #dbe7e3)", padding: "12px", fontFamily: "Consolas, monospace", fontSize: "0.73rem", color: "var(--color-text-primary, #1e293b)", background: "var(--color-background-tertiary, #f8fafc)", resize: "vertical" }}
                  />
                </div>
              </>
            ) : (
              <div style={{ fontSize: "0.76rem", color: "var(--color-text-secondary, #64748b)", background: "var(--color-background-tertiary, #f8fafc)", border: "1px dashed var(--color-border-tertiary, #cbd5e1)", borderRadius: "14px", padding: "14px" }}>
                Todavia no corriste una simulacion IA en esta sesion. Cuando la lances, vas a ver un resumen, las decisiones tomadas y un reporte para copiar.
              </div>
            )}
          </>
        )}
      </section>}

      {isStatsMode && <section style={lightPanelStyle}>
        <button onClick={() => toggleSection("telemetry")} style={accordionHeaderButtonStyle}>
          <div>
            <div style={sectionTitleStyle}>Telemetria de Sesion</div>
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px" }}>
              Corre entre muertes, cambios de tier y prestige. Reiniciala manualmente cuando quieras medir una pasada nueva.
            </div>
          </div>
          <span style={accordionLabelStyle}>{openSections.telemetry ? "Ocultar" : "Ver"}</span>
        </button>

        {openSections.telemetry && (
          <>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px", marginBottom: "10px" }}>
              <button onClick={handleCopy} style={actionBtnStyle("#0f766e", "#ffffff")}>{copied ? "Copiado" : "Copiar reporte"}</button>
              <button onClick={() => dispatch({ type: "RESET_SESSION_ANALYTICS" })} style={actionBtnStyle("#ffffff", "#b91c1c", "1px solid #fecaca")}>Resetear sesion</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {telemetrySections.map(section => (
                <div key={section.id} style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                  <div style={sectionTitleStyle}>{section.title}</div>
                  {(section.rows || []).map(entry => (
                    <DataRow key={`${section.id}-${entry.label}`} label={entry.label} value={entry.value} />
                  ))}
                </div>
              ))}
            </div>

          </>
        )}
      </section>}

      {isStatsMode && lastRunSummary && (
        <section style={lastRunBoxStyle(lastRunSummary.outcome)}>
          <button onClick={() => toggleSection("lastRun")} style={{ ...accordionHeaderButtonStyle, color: "#fff" }}>
            <div>
              <div style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase" }}>Ultima Vida</div>
              <div style={{ fontSize: "1rem", color: "#f8fafc", fontWeight: "900", marginTop: "3px" }}>Caida contra {lastRunSummary.enemyName}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
              <div style={{ ...pillStyle("rgba(127,29,29,0.85)", "#fff", "rgba(248,113,113,0.35)") }}>{lastRunSummary.kills} bajas</div>
              <span style={{ ...accordionLabelStyle, color: "#cbd5e1" }}>{openSections.lastRun ? "Ocultar" : "Ver"}</span>
            </div>
          </button>

          {openSections.lastRun && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px", marginTop: "10px" }}>
                <RunMetric label="Tier Max" value={lastRunSummary.maxTier} />
                <RunMetric label="Duracion" value={formatRunDuration(lastRunSummary.durationTicks)} />
                <RunMetric label="Oro" value={formatNumber(lastRunSummary.gold)} />
                <RunMetric label="XP" value={formatNumber(lastRunSummary.xp)} />
                <RunMetric label="Items" value={formatNumber(lastRunSummary.items)} />
              </div>

              <div style={{ marginTop: "10px", fontSize: "0.78rem", color: "#e2e8f0" }}>
                Mejor drop: <strong style={{ color: "#fff" }}>{lastRunSummary.bestDropName || "Sin drop destacado"}</strong>
                {lastRunSummary.bestDropRarity && (
                  <span style={{ color: rarityColor(lastRunSummary.bestDropRarity), fontWeight: "900", marginLeft: "6px", textTransform: "uppercase" }}>{lastRunSummary.bestDropRarity}</span>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function DataRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #eef2f7" }}>
      <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>{label}</span>
      <span style={{ fontSize: "0.76rem", color: accent || "var(--color-text-primary, #1e293b)", fontWeight: "900", textAlign: "right" }}>{value}</span>
    </div>
  );
}

const lightPanelStyle = {
  background: "var(--color-surface-overlay, rgba(255,255,255,0.92))",
  padding: "1rem",
  borderRadius: "18px",
  border: "1px solid var(--color-border-secondary, #dbe7e3)",
  boxShadow: "0 10px 30px var(--color-shadow, rgba(15,23,42,0.05))",
  backdropFilter: "blur(8px)",
};

const tableStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "12px",
  padding: "0 12px",
};

const sectionTitleStyle = {
  fontSize: "0.68rem",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "2px",
  fontWeight: "900",
};

const accordionHeaderButtonStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
  textAlign: "left",
  cursor: "pointer",
};

const accordionLabelStyle = {
  fontSize: "0.64rem",
  color: "#64748b",
  fontWeight: "900",
  textTransform: "uppercase",
};

const pillStyle = (background, color, border) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "0.66rem",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  background,
  color,
  border,
});

const actionBtnStyle = (background, color, border = "none") => ({
  padding: "9px 12px",
  borderRadius: "10px",
  border,
  background,
  color,
  fontWeight: "900",
  fontSize: "0.76rem",
  cursor: "pointer",
  boxShadow: background !== "#ffffff" ? "0 8px 20px rgba(15,118,110,0.18)" : "none",
});

const lastRunBoxStyle = outcome => ({
  background: outcome === "death" ? "linear-gradient(145deg, #1f2937 0%, #111827 100%)" : "linear-gradient(145deg, #0f3b2e 0%, #0b1f1a 100%)",
  padding: "1rem",
  borderRadius: "18px",
  border: `1px solid ${outcome === "death" ? "#7f1d1d" : "#166534"}`,
  boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
});
