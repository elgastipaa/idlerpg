import { buildCompactSnapshot, normalizeReplayLog } from "./replayLog";

const MAX_DEBUG_FIELD_LENGTH = 640;

function trimText(value = "", maxLength = MAX_DEBUG_FIELD_LENGTH) {
  const text = String(value || "");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1))}…`;
}

export function formatDebugValue(value, { maxLength = 280 } = {}) {
  if (value == null) return String(value);
  if (value instanceof Error) {
    return trimText(`${value.name}: ${value.message}`, maxLength);
  }
  if (typeof value === "string") return trimText(value, maxLength);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;

  const seen = new WeakSet();
  try {
    const serialized = JSON.stringify(value, (key, current) => {
      if (current instanceof Error) {
        return {
          name: current.name,
          message: current.message,
          stack: trimText(current.stack || "", 1400),
        };
      }
      if (typeof current === "bigint") return current.toString();
      if (typeof current === "function") return `[Function ${current.name || "anonymous"}]`;
      if (current && typeof current === "object") {
        if (seen.has(current)) return "[Circular]";
        seen.add(current);
      }
      return current;
    });
    return trimText(serialized, maxLength);
  } catch {
    return trimText(Object.prototype.toString.call(value), maxLength);
  }
}

export function createDebugErrorEntry(kind = "console.error", payload = {}) {
  return {
    kind,
    capturedAt: new Date().toISOString(),
    message: trimText(payload.message || "", 420),
    stack: payload.stack ? trimText(payload.stack, 2200) : null,
    file: payload.file || null,
    line: payload.line != null ? Number(payload.line) || 0 : null,
    column: payload.column != null ? Number(payload.column) || 0 : null,
    detail: payload.detail ? trimText(payload.detail, 900) : null,
  };
}

export async function copyTextToClipboard(text = "") {
  if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(String(text || ""));
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard no disponible en este entorno.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = String(text || "");
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error("No se pudo copiar al portapapeles.");
  }
}

export function buildTesterSnapshot(state = {}, { version = "0.0.0", recentErrors = [], recentActions = [] } = {}) {
  const replay = normalizeReplayLog(state?.replay || {});

  return {
    type: "idle_rpg_tester_snapshot",
    version,
    capturedAt: new Date().toISOString(),
    currentTab: state?.currentTab || "sanctuary",
    expeditionPhase: state?.expedition?.phase || "sanctuary",
    onboardingStep: state?.onboarding?.step || null,
    level: Number(state?.player?.level || 1),
    tier: Number(state?.combat?.currentTier || 1),
    maxTier: Number(state?.combat?.maxTier || state?.combat?.analytics?.maxTierReached || 1),
    compactSnapshot: buildCompactSnapshot(state),
    inventoryFull: {
      inventory: state?.player?.inventory || [],
      equipment: state?.player?.equipment || {},
      extractedItems: state?.sanctuary?.extractedItems || [],
      cargoInventory: state?.sanctuary?.cargoInventory || [],
      blueprints: state?.sanctuary?.blueprints || [],
    },
    recentReducerActions: [...(recentActions || [])].slice(-20),
    recentReplayActions: replay.actions.slice(-20),
    recentMilestones: replay.milestones.slice(-20),
    recentErrorLogs: [...(recentErrors || [])].slice(-20),
    fullState: state,
  };
}
