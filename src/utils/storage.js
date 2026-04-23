export const STORAGE_KEY = "idleRPG";
const EMPTY_PERFORMANCE_SNAPSHOT = {
  damagePerTick: 0,
  goldPerTick: 0,
  xpPerTick: 0,
  killsPerMinute: 0,
};

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch (error) {
    console.error("Storage unavailable", error);
    return null;
  }
}

export function getSaveMode() {
  if (typeof window === "undefined") return { fresh: false, wipe: false, noSave: false, lab: false };
  const params = new URLSearchParams(window.location.search);
  return {
    fresh: params.get("fresh") === "1",
    wipe: params.get("wipe") === "1",
    lab: params.get("lab") === "1",
    noSave:
      params.get("nosave") === "1" ||
      params.get("fresh") === "1" ||
      params.get("wipe") === "1" ||
      params.get("lab") === "1",
  };
}

export function isRecoveryMode() {
  const mode = getSaveMode();
  return mode.fresh || mode.wipe || mode.noSave;
}

export function buildRecoveryExitUrl() {
  if (typeof window === "undefined") return "/";
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("wipe");
  nextUrl.searchParams.delete("fresh");
  nextUrl.searchParams.delete("nosave");
  nextUrl.searchParams.delete("lab");
  return nextUrl.toString();
}

export const saveGame = (data) => {
  const mode = getSaveMode();
  if (mode.noSave) return false;

  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(STORAGE_KEY, serializeSaveGame(data));
    return true;
  } catch (error) {
    console.error("Save write failed", error);
    return false;
  }
};

export function buildPersistedState(data = {}) {
  return {
    ...data,
    combat: {
      ...(data?.combat || {}),
      floatEvents: [],
      latestLootEvent: null,
      offlineSummary: null,
      reforgeSession: null,
      performanceSnapshot: {
        ...EMPTY_PERFORMANCE_SNAPSHOT,
      },
    },
  };
}

export function buildSavePayload(data) {
  return {
    ...buildPersistedState(data),
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
  const storage = getStorage();
  if (!storage) {
    throw new Error("No se pudo acceder al almacenamiento local.");
  }
  try {
    storage.setItem(STORAGE_KEY, serializeSaveGame(parsed));
  } catch (error) {
    console.error("Save import failed", error);
    throw new Error("No se pudo guardar el save importado.");
  }
  return parsed;
}

export const clearGame = () => {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Save clear failed", error);
  }
};

export const loadGame = () => {
  const mode = getSaveMode();
  if (mode.wipe) {
    clearGame();
    return null;
  }
  if (mode.fresh) return null;

  const storage = getStorage();
  if (!storage) return null;

  let saved = null;
  try {
    saved = storage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Save read failed", error);
    return null;
  }
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    clearGame();
    return null;
  }
};
