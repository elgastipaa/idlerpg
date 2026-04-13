export const STORAGE_KEY = "idleRPG";

function getSaveMode() {
  if (typeof window === "undefined") return { fresh: false, wipe: false, noSave: false };
  const params = new URLSearchParams(window.location.search);
  return {
    fresh: params.get("fresh") === "1",
    wipe: params.get("wipe") === "1",
    noSave: params.get("nosave") === "1" || params.get("fresh") === "1" || params.get("wipe") === "1",
  };
}

export function isRecoveryMode() {
  const mode = getSaveMode();
  return mode.fresh || mode.wipe || mode.noSave;
}

export const saveGame = (data) => {
  const mode = getSaveMode();
  if (mode.noSave) return;

  localStorage.setItem(STORAGE_KEY, serializeSaveGame(data));
};

export function buildSavePayload(data) {
  return {
    ...data,
    savedAt: Date.now(),
  };
}

export function serializeSaveGame(data, { pretty = false } = {}) {
  return JSON.stringify(buildSavePayload(data), null, pretty ? 2 : 0);
}

export function parseSaveImportText(text) {
  const parsed = JSON.parse(String(text || ""));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Formato de save invalido.");
  }
  return parsed;
}

export function importGameFromText(text) {
  const parsed = parseSaveImportText(text);
  localStorage.setItem(STORAGE_KEY, serializeSaveGame(parsed));
  return parsed;
}

export const clearGame = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const loadGame = () => {
  const mode = getSaveMode();
  if (mode.wipe) {
    clearGame();
    return null;
  }
  if (mode.fresh) return null;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    clearGame();
    return null;
  }
};
