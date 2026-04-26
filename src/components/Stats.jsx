import React, { useEffect, useMemo, useRef, useState } from "react";
import useViewport from "../hooks/useViewport";
import { calculatePrestigeEchoGain, canPrestige, getPrestigeResonanceSummary } from "../engine/progression/prestigeEngine";
import { getPlayerBuildTag } from "../utils/buildIdentity";
import {
  buildBalanceTelemetryPayload,
  buildBalanceTelemetryReport,
  buildBalanceTelemetrySections,
  buildFullTelemetryPayload,
  buildAccountTelemetryReport,
  buildAccountTelemetrySections,
  buildSessionTelemetryReport,
  buildSessionTelemetrySections,
} from "../utils/runTelemetry";
import { buildReplayDatasetSummary, buildReplayJsonExport, buildReplayLibraryExport, buildReplaySummary, buildReplayTextReport, deriveHumanReplayProfile, parseReplayImportPayload } from "../utils/replayLog";
import { runBalanceBotSimulation } from "../engine/simulation/balanceBot";
import { importGameFromText, isRecoveryMode, saveGame, serializeSaveGame } from "../utils/storage";
import { ONBOARDING_STEPS } from "../engine/onboarding/onboardingEngine";
import HorizontalOptionSelector from "./HorizontalOptionSelector";

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

function formatRuntimeRecoveryReason(reason = null) {
  if (!reason) return "-";
  if (reason === "tick_guard") return "Guardia de tick";
  if (reason === "visibility_restore") return "Restore por visibilidad";
  if (reason === "focus_restore") return "Restore por focus";
  if (reason === "pageshow_restore") return "Restore por pageshow";
  if (reason === "offline_job_stall") return "Stall de offline job";
  if (reason === "runtime_guard") return "Guardia runtime";
  return String(reason);
}

function formatDurationSeconds(totalSeconds = 0) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds || 0)));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${remainingSeconds}s`;
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

const QA_ONBOARDING_BEATS = [
  { id: ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE, label: "Cierre primer prestige", description: "Popup que fija el loop run -> Santuario -> Ecos." },
  { id: ONBOARDING_STEPS.BLUEPRINT_INTRO, label: "Intro blueprints", description: "Presentacion informativa del stash temporal y persistencia de items." },
  { id: ONBOARDING_STEPS.BLUEPRINT_DECISION, label: "Decision blueprint", description: "Explica blueprint vs desguace sin forzar clicks reales." },
  { id: ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE, label: "Primer Taller", description: "Primer beat informativo de Taller." },
  { id: ONBOARDING_STEPS.FIRST_LIBRARY_RESEARCH, label: "Primera Biblioteca", description: "Primer beat informativo de Biblioteca." },
  { id: ONBOARDING_STEPS.FIRST_ERRAND, label: "Primer Encargo", description: "Primer beat informativo de Encargos." },
  { id: ONBOARDING_STEPS.FIRST_SIGIL_INFUSION, label: "Primera infusion", description: "Primer beat informativo del Altar de Sigilos." },
  { id: ONBOARDING_STEPS.TIER25_CAP, label: "Cierre Tier 25", description: "Explica el cap del mundo base." },
  { id: ONBOARDING_STEPS.FIRST_ABYSS, label: "Primer Abismo", description: "Popup de entrada al endgame." },
];

const EMPTY_TELEMETRY_VIEW = { sections: [], text: "", payloadText: "" };
const EMPTY_REPLAY_SUMMARY = {
  actionCount: 0,
  uiActionCount: 0,
  milestoneCount: 0,
  avgPushHpRatio: 0,
  avgDropHpRatio: 0,
  preferredCraftMode: "-",
  preferredSpec: "-",
  autoAdvanceBias: 0,
  wishlistStats: [],
};
const EMPTY_REPLAY_PROFILE = {
  preferredSpec: "-",
  avgPushHpRatio: 0,
  avgDropHpRatio: 0,
  preferredCraftMode: "-",
  craftCounts: {},
};
const EMPTY_REPLAY_DATASET_SUMMARY = {
  replayCount: 0,
  uiActionCount: 0,
  preferredSpec: "-",
  preferredCraftMode: "-",
  avgPushHpRatio: 0,
  avgDropHpRatio: 0,
};
const EMPTY_REPLAY_VIEW = {
  summary: EMPTY_REPLAY_SUMMARY,
  profile: EMPTY_REPLAY_PROFILE,
  text: "",
  jsonText: "",
  combinedSummary: EMPTY_REPLAY_DATASET_SUMMARY,
  bundleText: "",
};
const PREVIEW_ROW_LIMIT = 12;
const LAB_FOCUS_OPTIONS = [
  { id: "diagnostics", label: "Diagnostico" },
  { id: "save", label: "Save" },
  { id: "replay", label: "Replay" },
  { id: "bot", label: "IA" },
];
const TELEMETRY_VIEW_OPTIONS = [
  { id: "compact", label: "Compacta" },
  { id: "full", label: "Completa" },
];
const PAYLOAD_VIEW_OPTIONS = [
  { id: "compact", label: "Payload Compacto" },
  { id: "full", label: "Payload Completo" },
];

function buildDiagnosticsRows(state = {}) {
  const stations = state?.sanctuary?.stations || {};
  const telemetry = state?.accountTelemetry || {};
  const unlockedStations = Object.entries(stations)
    .filter(([, station]) => Boolean(station?.unlocked))
    .map(([stationId, station]) => station?.label || stationId);
  return [
    { label: "Tab actual", value: state?.currentTab || "-" },
    { label: "Fase expedicion", value: state?.expedition?.phase || "-" },
    { label: "Onboarding", value: state?.onboarding?.completed ? "Completo" : (state?.onboarding?.step || "sin paso") },
    { label: "Clase / Spec", value: `${state?.player?.class || "-"} / ${state?.player?.specialization || "-"}` },
    { label: "Tier actual / max", value: `T${formatNumber(state?.combat?.currentTier || 1)} / T${formatNumber(state?.combat?.maxTier || 1)}` },
    { label: "Prestige / Ecos", value: `${formatNumber(state?.prestige?.level || 0)} / ${formatNumber(state?.prestige?.echoes || 0)}` },
    { label: "Portal al Abismo", value: state?.abyss?.portalUnlocked ? "Abierto" : (state?.abyss?.tier25BossCleared ? "Listo para research" : "Cerrado") },
    { label: "Estaciones activas", value: unlockedStations.join(", ") || "-" },
    { label: "Jobs corriendo", value: formatNumber((state?.sanctuary?.jobs || []).filter(job => job?.status === "running").length) },
    { label: "Runtime recoveries", value: formatNumber(Number(telemetry?.runtimeRecoveryCount || 0)) },
    { label: "Repairs expedicion", value: formatNumber(Number(telemetry?.runtimeRepairCount || 0)) },
    { label: "Offline stalls", value: formatNumber(Number(telemetry?.runtimeOfflineJobStallCount || 0)) },
    {
      label: "Ultima recovery",
      value: telemetry?.runtimeLastRecoveryAt
        ? `${formatShortDateTime(telemetry.runtimeLastRecoveryAt)} · ${formatRuntimeRecoveryReason(telemetry.runtimeLastRecoveryReason)}`
        : "-",
    },
    { label: "Save age", value: state?.savedAt ? formatDurationSeconds((Date.now() - Number(state.savedAt || 0)) / 1000) : "-" },
  ];
}

function buildDiagnosticsText(rows = []) {
  return [
    "Diagnostico de Save",
    "===================",
    ...rows.map(row => `${row.label}: ${row.value}`),
  ].join("\n");
}

function buildCombinedReplayDataset(hasCurrentReplayData, replay, activeReplayLibraryEntries) {
  const source = [
    ...(hasCurrentReplayData ? [replay] : []),
    ...activeReplayLibraryEntries.map(entry => entry.replay),
  ];
  const summary = buildReplayDatasetSummary(source);
  const bundleText = JSON.stringify(
    buildReplayLibraryExport(
      [
        ...(hasCurrentReplayData
          ? [{
              id: "current-session",
              label: "Sesion actual",
              importedAt: Date.now(),
              exportedAt: null,
              isActive: true,
              replay,
            }]
          : []),
        ...activeReplayLibraryEntries,
      ],
      { label: "Replay Dataset Activo" }
    ),
    null,
    2
  );
  return { source, summary, bundleText };
}

export default function Stats({ state, dispatch, mode = "stats" }) {
  const { player, combat, prestige } = state;
  const isDarkMode = state.settings?.theme === "dark";
  const { isMobile } = useViewport();
  const [openSections, setOpenSections] = useState({
    diagnostics: false,
    qa: false,
    accountTelemetry: false,
    save: false,
    bot: false,
    replay: false,
    telemetry: false,
  });
  const [labFocus, setLabFocus] = useState("diagnostics");
  const [copied, setCopied] = useState(false);
  const [saveCopied, setSaveCopied] = useState(false);
  const [saveImportText, setSaveImportText] = useState("");
  const [saveImportStatus, setSaveImportStatus] = useState("");
  const [analyticsReportMode, setAnalyticsReportMode] = useState("compact");
  const [analyticsPayloadMode, setAnalyticsPayloadMode] = useState("compact");
  const [diagnosticsCopied, setDiagnosticsCopied] = useState(false);
  const [accountTelemetryCopied, setAccountTelemetryCopied] = useState(false);
  const [telemetryPayloadCopied, setTelemetryPayloadCopied] = useState(false);
  const [accountTelemetryPayloadCopied, setAccountTelemetryPayloadCopied] = useState(false);
  const [replayCopied, setReplayCopied] = useState(false);
  const [replayJsonCopied, setReplayJsonCopied] = useState(false);
  const [replayBundleCopied, setReplayBundleCopied] = useState(false);
  const [replayLibraryLabel, setReplayLibraryLabel] = useState("");
  const [replayImportText, setReplayImportText] = useState("");
  const [replayImportStatus, setReplayImportStatus] = useState("");
  const [botCopied, setBotCopied] = useState(false);
  const [botRunning, setBotRunning] = useState(false);
  const [botResult, setBotResult] = useState(null);
  const [telemetryExpandedSections, setTelemetryExpandedSections] = useState({});
  const [accountTelemetryExpandedSections, setAccountTelemetryExpandedSections] = useState({});
  const [replayLibraryVisibleCount, setReplayLibraryVisibleCount] = useState(PREVIEW_ROW_LIMIT);
  const [botDecisionsVisibleCount, setBotDecisionsVisibleCount] = useState(PREVIEW_ROW_LIMIT);
  const saveFileInputRef = useRef(null);
  const replayFileInputRef = useRef(null);
  const isLab = mode === "lab";
  const isStatsMode = !isLab;

  const prestigeStatus = canPrestige(state);
  const projectedPoints = calculatePrestigeEchoGain(state);
  const prestigeResonance = useMemo(() => getPrestigeResonanceSummary(prestige), [prestige]);
  const currentRun = combat.runStats || {};
  const snapshot = combat.performanceSnapshot || {};
  const analytics = combat.analytics || {};
  const replayLibraryEntries = useMemo(() => state.replayLibrary?.entries || [], [state.replayLibrary]);
  const activeReplayLibraryEntries = useMemo(() => replayLibraryEntries.filter(entry => entry.isActive !== false), [replayLibraryEntries]);
  const recoveryMode = useMemo(() => isRecoveryMode(), []);
  const hasCurrentReplayData = (state.replay?.actions || []).length > 0 || (state.replay?.milestones || []).length > 0;
  const diagnosticsSectionActive = isLab && labFocus === "diagnostics" && openSections.diagnostics;
  const accountTelemetrySectionActive = isLab && labFocus === "diagnostics" && openSections.accountTelemetry;
  const replaySectionActive = isLab && labFocus === "replay" && openSections.replay;
  const telemetrySectionActive = isStatsMode && openSections.telemetry;
  const selectedTelemetryPayloadText = useMemo(
    () => JSON.stringify(
      analyticsPayloadMode === "full"
        ? buildFullTelemetryPayload(state)
        : buildBalanceTelemetryPayload(state),
      null,
      2
    ),
    [analyticsPayloadMode, state]
  );
  const telemetryView = useMemo(() => {
    if (!telemetrySectionActive) return EMPTY_TELEMETRY_VIEW;
    if (analyticsReportMode === "compact") {
      return {
        sections: buildBalanceTelemetrySections(state),
        text: buildBalanceTelemetryReport(state),
        payloadText: selectedTelemetryPayloadText,
      };
    }
    return {
      sections: buildSessionTelemetrySections(state),
      text: buildSessionTelemetryReport(state),
      payloadText: selectedTelemetryPayloadText,
    };
  }, [analyticsReportMode, selectedTelemetryPayloadText, telemetrySectionActive, state]);
  const accountTelemetryView = useMemo(() => {
    if (!accountTelemetrySectionActive) return EMPTY_TELEMETRY_VIEW;
    if (analyticsReportMode === "compact") {
      return {
        sections: buildBalanceTelemetrySections(state),
        text: buildBalanceTelemetryReport(state),
        payloadText: selectedTelemetryPayloadText,
      };
    }
    return {
      sections: buildAccountTelemetrySections(state),
      text: buildAccountTelemetryReport(state),
      payloadText: selectedTelemetryPayloadText,
    };
  }, [accountTelemetrySectionActive, analyticsReportMode, selectedTelemetryPayloadText, state]);
  const replayView = useMemo(() => {
    if (!replaySectionActive) return EMPTY_REPLAY_VIEW;
    const combinedDataset = buildCombinedReplayDataset(hasCurrentReplayData, state.replay, activeReplayLibraryEntries);
    return {
      summary: buildReplaySummary(state),
      profile: deriveHumanReplayProfile(state.replay || {}),
      text: buildReplayTextReport(state),
      jsonText: JSON.stringify(buildReplayJsonExport(state), null, 2),
      combinedSummary: combinedDataset.summary,
      bundleText: combinedDataset.bundleText,
    };
  }, [activeReplayLibraryEntries, hasCurrentReplayData, replaySectionActive, state]);
  const replayLibraryProfiles = useMemo(() => {
    if (!replaySectionActive) return {};
    const profilesById = {};
    replayLibraryEntries.forEach(entry => {
      profilesById[entry.id] = deriveHumanReplayProfile(entry.replay);
    });
    return profilesById;
  }, [replayLibraryEntries, replaySectionActive]);
  const replaySummary = replayView.summary;
  const replayProfile = replayView.profile;
  const replayText = replayView.text;
  const replayJsonText = replayView.jsonText;
  const combinedReplaySummary = replayView.combinedSummary;
  const replayBundleText = replayView.bundleText;
  const replayLibraryVisibleEntries = useMemo(
    () => replayLibraryEntries.slice(0, replayLibraryVisibleCount),
    [replayLibraryEntries, replayLibraryVisibleCount]
  );
  const canShowMoreReplayLibrary = replayLibraryEntries.length > replayLibraryVisibleCount;
  const canShowLessReplayLibrary = replayLibraryVisibleCount > PREVIEW_ROW_LIMIT;
  const botDecisionRows = useMemo(() => {
    if (!botResult?.decisions?.length) return [];
    const maxCount = Math.min(40, botResult.decisions.length);
    return botResult.decisions.slice(-maxCount);
  }, [botResult]);
  const visibleBotDecisionRows = useMemo(
    () => botDecisionRows.slice(-Math.min(botDecisionsVisibleCount, botDecisionRows.length)),
    [botDecisionRows, botDecisionsVisibleCount]
  );
  const canShowMoreBotDecisions = botDecisionRows.length > botDecisionsVisibleCount;
  const canShowLessBotDecisions = botDecisionsVisibleCount > PREVIEW_ROW_LIMIT;
  const buildTag = getPlayerBuildTag(player);
  const diagnosticsRows = useMemo(() => {
    if (!diagnosticsSectionActive) return [];
    return buildDiagnosticsRows(state);
  }, [diagnosticsSectionActive, state]);
  const diagnosticsText = useMemo(() => {
    if (!diagnosticsSectionActive) return "";
    return buildDiagnosticsText(diagnosticsRows);
  }, [diagnosticsRows, diagnosticsSectionActive]);

  const damagePerTick = snapshot.damagePerTick || 0;
  const goldPerTick = snapshot.goldPerTick || 0;
  const xpPerTick = snapshot.xpPerTick || 0;
  const killsPerMinute = snapshot.killsPerMinute || 0;
  const estimatedTierPressure = currentTierPressure(combat.currentTier || 1);
  const pressureRatio = damagePerTick / Math.max(1, estimatedTierPressure);
  const survivabilityRatio = (player.hp || 0) / Math.max(1, player.maxHp || 1);
  const goldPerMinute = goldPerTick * 60;
  const xpPerMinute = xpPerTick * 60;

  useEffect(() => {
    if (!isMobile) {
      setOpenSections({
        diagnostics: isLab,
        qa: isLab,
        accountTelemetry: isLab,
        save: isLab,
        bot: isLab,
        replay: isLab,
        telemetry: isStatsMode,
      });
      return;
    }
    setOpenSections({
      diagnostics: isLab,
      qa: false,
      accountTelemetry: false,
      save: false,
      bot: false,
      replay: false,
      telemetry: isStatsMode,
    });
  }, [isLab, isMobile, isStatsMode]);

  useEffect(() => {
    if (!openSections.replay) {
      setReplayLibraryVisibleCount(PREVIEW_ROW_LIMIT);
    }
  }, [openSections.replay]);

  useEffect(() => {
    if (!openSections.telemetry) {
      setTelemetryExpandedSections({});
    }
  }, [openSections.telemetry]);

  useEffect(() => {
    if (!openSections.accountTelemetry) {
      setAccountTelemetryExpandedSections({});
    }
  }, [openSections.accountTelemetry]);

  useEffect(() => {
    setTelemetryExpandedSections({});
    setAccountTelemetryExpandedSections({});
    setCopied(false);
    setAccountTelemetryCopied(false);
    setTelemetryPayloadCopied(false);
    setAccountTelemetryPayloadCopied(false);
  }, [analyticsReportMode]);

  useEffect(() => {
    setTelemetryPayloadCopied(false);
    setAccountTelemetryPayloadCopied(false);
  }, [analyticsPayloadMode]);

  useEffect(() => {
    setBotDecisionsVisibleCount(PREVIEW_ROW_LIMIT);
  }, [botResult]);

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
      const telemetryText = telemetryView.text || (
        analyticsReportMode === "compact"
          ? buildBalanceTelemetryReport(state)
          : buildSessionTelemetryReport(state)
      );
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
    const saved = saveGame(state);
    setSaveImportStatus(saved ? "Save escrito en localStorage." : "No se pudo escribir el save en localStorage.");
  };

  const handleCopySave = async () => {
    try {
      const saveJsonText = serializeSaveGame(state, { pretty: true });
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(saveJsonText);
      }
      setSaveCopied(true);
      window.setTimeout(() => setSaveCopied(false), 1800);
    } catch {
      setSaveCopied(false);
    }
  };

  const handleCopyDiagnostics = async () => {
    try {
      const nextDiagnosticsText = diagnosticsText || buildDiagnosticsText(buildDiagnosticsRows(state));
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(nextDiagnosticsText);
      }
      setDiagnosticsCopied(true);
      window.setTimeout(() => setDiagnosticsCopied(false), 1800);
    } catch {
      setDiagnosticsCopied(false);
    }
  };

  const handleCopyAccountTelemetry = async () => {
    try {
      const accountTelemetryText = accountTelemetryView.text || (
        analyticsReportMode === "compact"
          ? buildBalanceTelemetryReport(state)
          : buildAccountTelemetryReport(state)
      );
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(accountTelemetryText);
      }
      setAccountTelemetryCopied(true);
      window.setTimeout(() => setAccountTelemetryCopied(false), 1800);
    } catch {
      setAccountTelemetryCopied(false);
    }
  };

  const handleCopyTelemetryPayload = async () => {
    try {
      const payloadText = telemetryView.payloadText || selectedTelemetryPayloadText;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(payloadText);
      }
      setTelemetryPayloadCopied(true);
      window.setTimeout(() => setTelemetryPayloadCopied(false), 1800);
    } catch {
      setTelemetryPayloadCopied(false);
    }
  };

  const handleCopyAccountTelemetryPayload = async () => {
    try {
      const payloadText = accountTelemetryView.payloadText || selectedTelemetryPayloadText;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(payloadText);
      }
      setAccountTelemetryPayloadCopied(true);
      window.setTimeout(() => setAccountTelemetryPayloadCopied(false), 1800);
    } catch {
      setAccountTelemetryPayloadCopied(false);
    }
  };

  const handleCopyReplay = async () => {
    try {
      const nextReplayText = replayText || buildReplayTextReport(state);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(nextReplayText);
      }
      setReplayCopied(true);
      window.setTimeout(() => setReplayCopied(false), 1800);
    } catch {
      setReplayCopied(false);
    }
  };

  const handleCopyReplayJson = async () => {
    try {
      const nextReplayJsonText = replayJsonText || JSON.stringify(buildReplayJsonExport(state), null, 2);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(nextReplayJsonText);
      }
      setReplayJsonCopied(true);
      window.setTimeout(() => setReplayJsonCopied(false), 1800);
    } catch {
      setReplayJsonCopied(false);
    }
  };

  const handleCopyReplayBundle = async () => {
    try {
      const nextReplayBundleText = replayBundleText || buildCombinedReplayDataset(hasCurrentReplayData, state.replay, activeReplayLibraryEntries).bundleText;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(nextReplayBundleText);
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
    const nextReplaySummary = replaySummary.actionCount > 0 ? replaySummary : buildReplaySummary(state);
    const nextReplayJsonText = replayJsonText || JSON.stringify(buildReplayJsonExport(state), null, 2);
    const actionCount = Number(nextReplaySummary.actionCount || 0);
    const spec = nextReplaySummary.preferredSpec || player.specialization || "session";
    const craft = nextReplaySummary.preferredCraftMode || "mixed";
    const filename = `${slugifyName(`replay-${spec}-${craft}-${actionCount}a`)}.json`;
    handleDownloadText(nextReplayJsonText, filename);
  };

  const handleDownloadReplayBundle = () => {
    const nextCombinedReplay = combinedReplaySummary.replayCount > 0
      ? { summary: combinedReplaySummary, bundleText: replayBundleText }
      : buildCombinedReplayDataset(hasCurrentReplayData, state.replay, activeReplayLibraryEntries);
    const spec = nextCombinedReplay.summary.preferredSpec || player.specialization || "dataset";
    const filename = `${slugifyName(`replay-bundle-${spec}-${nextCombinedReplay.summary.replayCount}r`)}.json`;
    handleDownloadText(nextCombinedReplay.bundleText, filename);
  };

  const handleDownloadSave = () => {
    const saveJsonText = serializeSaveGame(state, { pretty: true });
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
    dispatch({ type: "RESET_ALL_PROGRESS", meta: { replay: false } });
    setSaveImportStatus("Progreso reiniciado. Empezaste una cuenta nueva.");
  };

  const handleRepairSave = () => {
    if (recoveryMode) {
      setSaveImportStatus("La reparacion no aplica dentro de recovery. Sali del modo recovery primero.");
      return;
    }
    dispatch({ type: "REPAIR_SAVE_STATE", now: Date.now(), meta: { replay: false } });
    setSaveImportStatus("Save remigrado con la version actual. Revisa Diagnostico y Santuario.");
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
    const combinedDataset = buildCombinedReplayDataset(hasCurrentReplayData, state.replay, activeReplayLibraryEntries);
    const combinedReplayProfile = deriveHumanReplayProfile(combinedDataset.source);
    const result = runBalanceBotSimulation(state, {
      ticks: 1800,
      humanProfile: combinedReplayProfile,
      replaySource: combinedDataset.source,
    });
    setBotResult({
      ...result,
      replayDatasetSummary: combinedDataset.summary,
    });
    setBotRunning(false);
  };

  const botReportText = useMemo(() => {
    if (!botResult) return "";
    const datasetSummary = botResult.replayDatasetSummary || EMPTY_REPLAY_DATASET_SUMMARY;
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
      `Dataset humano: ${datasetSummary.replayCount} replay(s) · ${datasetSummary.uiActionCount} acciones UI · spec ${datasetSummary.preferredSpec} · push HP ${formatPct(datasetSummary.avgPushHpRatio)} · craft ${datasetSummary.preferredCraftMode}`,
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
  const toggleTelemetryRows = sectionId => {
    setTelemetryExpandedSections(current => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };
  const toggleAccountTelemetryRows = sectionId => {
    setAccountTelemetryExpandedSections(current => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };
  const labSectionVisible = key => {
    if (labFocus === "diagnostics") {
      return key === "diagnostics" || key === "qa" || key === "accountTelemetry";
    }
    return labFocus === key;
  };

  return (
    <div style={{ padding: 0, display: "flex", flexDirection: "column", gap: "12px", background: isDarkMode ? "linear-gradient(180deg, var(--color-background-primary, #0b1220) 0%, var(--color-background-secondary, #111a2e) 100%)" : "linear-gradient(180deg, var(--color-background-primary, #f8fafc) 0%, var(--color-background-tertiary, #eef6f4) 100%)", color: "var(--color-text-primary, #1e293b)" }}>
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
            <HorizontalOptionSelector
              rootStyle={{ marginTop: "10px" }}
              options={LAB_FOCUS_OPTIONS}
              selectedId={labFocus}
              onSelect={option => setLabFocus(option.id)}
              getOptionId={option => option.id}
              getArrowButtonStyle={({ disabled }) => ({
                ...focusChipButtonStyle(false),
                minWidth: "34px",
                padding: "4px 0",
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              })}
              getOptionButtonStyle={({ selected }) => ({
                ...focusChipButtonStyle(selected),
                textAlign: "center",
                padding: "6px 9px",
                flexShrink: 0,
              })}
              renderOption={({ option }) => (
                <span style={{ fontSize: "0.66rem", fontWeight: "900" }}>{option.label}</span>
              )}
            />
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

      {isLab && labSectionVisible("diagnostics") && <section style={lightPanelStyle}>
        <button onClick={() => toggleSection("diagnostics")} style={accordionHeaderButtonStyle}>
          <div>
            <div style={sectionTitleStyle}>Diagnostico</div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "3px" }}>
              Estado actual del save, onboarding, fases y unlocks clave para detectar cuentas rotas o mal migradas.
            </div>
          </div>
          <span style={accordionLabelStyle}>{openSections.diagnostics ? "Ocultar" : "Ver"}</span>
        </button>

        {openSections.diagnostics && (
          <>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px", marginBottom: "10px" }}>
              <button onClick={handleCopyDiagnostics} style={actionBtnStyle("#0f766e", "#ffffff")}>
                {diagnosticsCopied ? "Diagnostico copiado" : "Copiar diagnostico"}
              </button>
              <button onClick={handleRepairSave} style={actionBtnStyle("#ffffff", "#b45309", "1px solid #fcd34d")}>
                Reparar save
              </button>
              <button onClick={handleResetSave} style={actionBtnStyle("#ffffff", "#b91c1c", "1px solid #fecaca")}>
                Reiniciar progreso
              </button>
            </div>

            <div style={tableStyle}>
              {diagnosticsRows.map(row => (
                <DataRow key={`diag-${row.label}`} label={row.label} value={row.value} />
              ))}
            </div>
          </>
        )}
      </section>}

      {isLab && labSectionVisible("qa") && <section style={lightPanelStyle}>
        <button onClick={() => toggleSection("qa")} style={accordionHeaderButtonStyle}>
          <div>
            <div style={sectionTitleStyle}>QA onboarding tardio</div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "3px" }}>
              Fuerza popups informativos post-Ecos para revisar copy, tabs y cierre sin depender de una run larga.
            </div>
          </div>
          <span style={accordionLabelStyle}>{openSections.qa ? "Ocultar" : "Ver"}</span>
        </button>

        {openSections.qa && (
          <>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px", marginBottom: "10px" }}>
              <button onClick={() => dispatch({ type: "SET_QA_ONBOARDING_STEP", step: null })} style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}>
                Limpiar beat QA
              </button>
              <div style={{ ...pillStyle("rgba(99,102,241,0.10)", "#4338ca", "rgba(99,102,241,0.22)") }}>
                Paso actual: {state?.onboarding?.step || "sin beat"}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {QA_ONBOARDING_BEATS.map(entry => (
                <div key={entry.id} style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                  <div style={{ display: "grid", gap: "5px" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: "900", color: "#1e293b" }}>{entry.label}</div>
                    <div style={{ fontSize: "0.66rem", color: "#64748b", lineHeight: 1.4 }}>{entry.description}</div>
                    <div style={{ fontSize: "0.58rem", color: "#94a3b8", fontWeight: "900" }}>{entry.id}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                    <button
                      onClick={() => dispatch({ type: "SET_QA_ONBOARDING_STEP", step: entry.id })}
                      style={actionBtnStyle("#1d4ed8", "#ffffff")}
                    >
                      Forzar beat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>}

      {isLab && labSectionVisible("accountTelemetry") && <section style={lightPanelStyle}>
        <button onClick={() => toggleSection("accountTelemetry")} style={accordionHeaderButtonStyle}>
          <div>
            <div style={sectionTitleStyle}>Telemetria de Cuenta</div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "3px" }}>
              Online/offline, uso por fase, tiempos a hitos y adopcion real de sistemas del Santuario para balance futuro.
            </div>
          </div>
          <span style={accordionLabelStyle}>{openSections.accountTelemetry ? "Ocultar" : "Ver"}</span>
        </button>

        {openSections.accountTelemetry && (
          <>
            <div style={{ display: "grid", gap: "8px", marginTop: "10px", marginBottom: "10px" }}>
              <HorizontalOptionSelector
                rootStyle={{}}
                options={TELEMETRY_VIEW_OPTIONS}
                selectedId={analyticsReportMode}
                onSelect={option => setAnalyticsReportMode(option.id)}
                getOptionId={option => option.id}
                getArrowButtonStyle={({ disabled }) => ({
                  ...focusChipButtonStyle(false),
                  minWidth: "30px",
                  padding: "3px 0",
                  opacity: disabled ? 0.45 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                })}
                getOptionButtonStyle={({ selected }) => ({
                  ...focusChipButtonStyle(selected),
                  textAlign: "center",
                  padding: "5px 8px",
                  flexShrink: 0,
                })}
                renderOption={({ option }) => (
                  <span style={{ fontSize: "0.62rem", fontWeight: "900" }}>{option.label}</span>
                )}
              />
              <HorizontalOptionSelector
                rootStyle={{}}
                options={PAYLOAD_VIEW_OPTIONS}
                selectedId={analyticsPayloadMode}
                onSelect={option => setAnalyticsPayloadMode(option.id)}
                getOptionId={option => option.id}
                getArrowButtonStyle={({ disabled }) => ({
                  ...focusChipButtonStyle(false),
                  minWidth: "30px",
                  padding: "3px 0",
                  opacity: disabled ? 0.45 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                })}
                getOptionButtonStyle={({ selected }) => ({
                  ...focusChipButtonStyle(selected),
                  textAlign: "center",
                  padding: "5px 8px",
                  flexShrink: 0,
                })}
                renderOption={({ option }) => (
                  <span style={{ fontSize: "0.62rem", fontWeight: "900" }}>{option.label}</span>
                )}
              />

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={handleCopyAccountTelemetry} style={actionBtnStyle("#0f766e", "#ffffff")}>
                  {accountTelemetryCopied ? "Telemetria copiada" : (analyticsReportMode === "compact" ? "Copiar telemetria compacta" : "Copiar reporte de cuenta")}
                </button>
                <button onClick={handleCopyAccountTelemetryPayload} style={actionBtnStyle("#ffffff", "#7c3aed", "1px solid #ddd6fe")}>
                  {accountTelemetryPayloadCopied
                    ? `${analyticsPayloadMode === "full" ? "Payload completo" : "Payload compacto"} copiado`
                    : `Copiar payload IA ${analyticsPayloadMode === "full" ? "completo" : "compacto"} (JSON)`}
                </button>
              </div>
              <div style={{ fontSize: "0.66rem", color: "#64748b", lineHeight: 1.4 }}>
                {analyticsReportMode === "compact"
                  ? "Compacta: combina sesion + cuenta + alertas KPI para balance rapido."
                  : "Completa: mantiene el desglose completo para debugging fino."}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {accountTelemetryView.sections.map(section => (
                <div key={section.id} style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                  <div style={sectionTitleStyle}>{section.title}</div>
                  {(accountTelemetryExpandedSections[section.id] ? (section.rows || []) : (section.rows || []).slice(0, PREVIEW_ROW_LIMIT)).map(entry => (
                    <DataRow key={`${section.id}-${entry.label}`} label={entry.label} value={entry.value} />
                  ))}
                  {(section.rows || []).length > PREVIEW_ROW_LIMIT && (
                    <button
                      onClick={() => toggleAccountTelemetryRows(section.id)}
                      style={{ ...actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe"), marginTop: "8px" }}
                    >
                      {accountTelemetryExpandedSections[section.id] ? "Ver menos" : `Ver ${(section.rows || []).length - PREVIEW_ROW_LIMIT} mas`}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>}

      {isLab && labSectionVisible("save") && <section style={lightPanelStyle}>
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
              <button onClick={handleRepairSave} style={actionBtnStyle("#ffffff", "#b45309", "1px solid #fcd34d")}>Reparar save</button>
              <button onClick={handleResetSave} style={actionBtnStyle("#ffffff", "#b91c1c", "1px solid #fecaca")}>Reiniciar progreso</button>
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

      {isLab && labSectionVisible("replay") && <section style={lightPanelStyle}>
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
                  {replayLibraryVisibleEntries.length > 0 ? replayLibraryVisibleEntries.map(entry => {
                    const entryProfile = replayLibraryProfiles[entry.id] || EMPTY_REPLAY_PROFILE;
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
                  {(canShowMoreReplayLibrary || canShowLessReplayLibrary) && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                      {canShowMoreReplayLibrary && (
                        <button
                          onClick={() => setReplayLibraryVisibleCount(current => current + PREVIEW_ROW_LIMIT)}
                          style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}
                        >
                          Ver mas ({replayLibraryEntries.length - replayLibraryVisibleCount})
                        </button>
                      )}
                      {canShowLessReplayLibrary && (
                        <button
                          onClick={() => setReplayLibraryVisibleCount(PREVIEW_ROW_LIMIT)}
                          style={actionBtnStyle("#ffffff", "#64748b", "1px solid #cbd5e1")}
                        >
                          Ver menos
                        </button>
                      )}
                    </div>
                  )}
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

      {isLab && labSectionVisible("bot") && <section style={lightPanelStyle}>
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
                      {visibleBotDecisionRows.length > 0 ? visibleBotDecisionRows.map((entry, index) => (
                        <div key={`${entry}-${index}`} style={{ fontSize: "0.72rem", color: "#334155", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 10px" }}>{entry}</div>
                      )) : <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #64748b)" }}>La IA no tuvo que tomar decisiones visibles.</div>}
                    </div>
                    {(canShowMoreBotDecisions || canShowLessBotDecisions) && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                        {canShowMoreBotDecisions && (
                          <button
                            onClick={() => setBotDecisionsVisibleCount(current => current + PREVIEW_ROW_LIMIT)}
                            style={actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe")}
                          >
                            Ver mas ({botDecisionRows.length - botDecisionsVisibleCount})
                          </button>
                        )}
                        {canShowLessBotDecisions && (
                          <button
                            onClick={() => setBotDecisionsVisibleCount(PREVIEW_ROW_LIMIT)}
                            style={actionBtnStyle("#ffffff", "#64748b", "1px solid #cbd5e1")}
                          >
                            Ver menos
                          </button>
                        )}
                      </div>
                    )}
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
            <div style={{ display: "grid", gap: "8px", marginTop: "10px", marginBottom: "10px" }}>
              <HorizontalOptionSelector
                rootStyle={{}}
                options={TELEMETRY_VIEW_OPTIONS}
                selectedId={analyticsReportMode}
                onSelect={option => setAnalyticsReportMode(option.id)}
                getOptionId={option => option.id}
                getArrowButtonStyle={({ disabled }) => ({
                  ...focusChipButtonStyle(false),
                  minWidth: "30px",
                  padding: "3px 0",
                  opacity: disabled ? 0.45 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                })}
                getOptionButtonStyle={({ selected }) => ({
                  ...focusChipButtonStyle(selected),
                  textAlign: "center",
                  padding: "5px 8px",
                  flexShrink: 0,
                })}
                renderOption={({ option }) => (
                  <span style={{ fontSize: "0.62rem", fontWeight: "900" }}>{option.label}</span>
                )}
              />
              <HorizontalOptionSelector
                rootStyle={{}}
                options={PAYLOAD_VIEW_OPTIONS}
                selectedId={analyticsPayloadMode}
                onSelect={option => setAnalyticsPayloadMode(option.id)}
                getOptionId={option => option.id}
                getArrowButtonStyle={({ disabled }) => ({
                  ...focusChipButtonStyle(false),
                  minWidth: "30px",
                  padding: "3px 0",
                  opacity: disabled ? 0.45 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                })}
                getOptionButtonStyle={({ selected }) => ({
                  ...focusChipButtonStyle(selected),
                  textAlign: "center",
                  padding: "5px 8px",
                  flexShrink: 0,
                })}
                renderOption={({ option }) => (
                  <span style={{ fontSize: "0.62rem", fontWeight: "900" }}>{option.label}</span>
                )}
              />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={handleCopy} style={actionBtnStyle("#0f766e", "#ffffff")}>{copied ? "Copiado" : (analyticsReportMode === "compact" ? "Copiar telemetria compacta" : "Copiar reporte completo")}</button>
                <button onClick={handleCopyTelemetryPayload} style={actionBtnStyle("#ffffff", "#7c3aed", "1px solid #ddd6fe")}>
                  {telemetryPayloadCopied
                    ? `${analyticsPayloadMode === "full" ? "Payload completo" : "Payload compacto"} copiado`
                    : `Copiar payload IA ${analyticsPayloadMode === "full" ? "completo" : "compacto"} (JSON)`}
                </button>
                <button onClick={() => dispatch({ type: "RESET_SESSION_ANALYTICS" })} style={actionBtnStyle("#ffffff", "#b91c1c", "1px solid #fecaca")}>Resetear sesion</button>
              </div>
              <div style={{ fontSize: "0.66rem", color: "#64748b", lineHeight: 1.4 }}>
                {analyticsReportMode === "compact"
                  ? "Compacta: foco en ritmo, friccion y alertas para balance."
                  : "Completa: desglose entero de metricas de corrida."}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {telemetryView.sections.map(section => (
                <div key={section.id} style={{ ...tableStyle, paddingTop: "10px", paddingBottom: "10px" }}>
                  <div style={sectionTitleStyle}>{section.title}</div>
                  {(telemetryExpandedSections[section.id] ? (section.rows || []) : (section.rows || []).slice(0, PREVIEW_ROW_LIMIT)).map(entry => (
                    <DataRow key={`${section.id}-${entry.label}`} label={entry.label} value={entry.value} />
                  ))}
                  {(section.rows || []).length > PREVIEW_ROW_LIMIT && (
                    <button
                      onClick={() => toggleTelemetryRows(section.id)}
                      style={{ ...actionBtnStyle("#ffffff", "#1d4ed8", "1px solid #bfdbfe"), marginTop: "8px" }}
                    >
                      {telemetryExpandedSections[section.id] ? "Ver menos" : `Ver ${(section.rows || []).length - PREVIEW_ROW_LIMIT} mas`}
                    </button>
                  )}
                </div>
              ))}
            </div>

          </>
        )}
      </section>}
    </div>
  );
}

function DataRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: "1px solid #eef2f7" }}>
      <span style={{ fontSize: "0.67rem", color: "var(--color-text-secondary, #64748b)", fontWeight: "800" }}>{label}</span>
      <span style={{ fontSize: "0.73rem", color: accent || "var(--color-text-primary, #1e293b)", fontWeight: "900", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function MetricPill({ label, value }) {
  return (
    <div
      style={{
        background: "var(--color-background-tertiary, #f8fafc)",
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        borderRadius: "12px",
        padding: "8px 10px",
        display: "grid",
        gap: "3px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "0.56rem",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-tertiary, #94a3b8)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.84rem",
          fontWeight: "900",
          color: "var(--color-text-primary, #1e293b)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const lightPanelStyle = {
  background: "var(--color-surface-overlay, rgba(255,255,255,0.92))",
  padding: "0.9rem",
  borderRadius: "16px",
  border: "1px solid var(--color-border-secondary, #dbe7e3)",
  boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.05))",
  backdropFilter: "blur(8px)",
};

const tableStyle = {
  background: "var(--color-background-tertiary, #f8fafc)",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  borderRadius: "10px",
  padding: "0 10px",
};

const sectionTitleStyle = {
  fontSize: "0.64rem",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "1.4px",
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
  fontSize: "0.6rem",
  color: "#64748b",
  fontWeight: "900",
  textTransform: "uppercase",
};

const pillStyle = (background, color, border) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "0.62rem",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  background,
  color,
  border,
});

const focusChipButtonStyle = active => ({
  border: "1px solid",
  borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #cbd5e1)",
  background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #ffffff)",
  color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-secondary, #475569)",
  borderRadius: "999px",
  padding: "6px 9px",
  fontSize: "0.62rem",
  fontWeight: "900",
  cursor: "pointer",
});

const actionBtnStyle = (background, color, border = "none") => ({
  padding: "7px 10px",
  borderRadius: "9px",
  border,
  background,
  color,
  fontWeight: "900",
  fontSize: "0.72rem",
  cursor: "pointer",
  boxShadow: background !== "#ffffff" ? "0 8px 20px rgba(15,118,110,0.18)" : "none",
});
