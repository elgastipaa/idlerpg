import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "../node_modules/esbuild/lib/main.js";

export const ROOT = process.cwd();
export const DEV_PORT = Number(process.env.UI_CAPTURE_PORT || 4174);
export const APP_URL = `http://127.0.0.1:${DEV_PORT}/`;
export const CAPTURE_URL = `${APP_URL}?nosave=1`;
const OUT_DIR = path.join(ROOT, "uirefactor", "current");
const REPORT_PATH = path.join(OUT_DIR, "capture-report.md");
export const STORAGE_KEY = "idleRPG";

export const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844, isMobile: true },
  { name: "430x932", width: 430, height: 932, isMobile: true },
  { name: "1280x800", width: 1280, height: 800, isMobile: false },
];

export const SCREEN_TARGETS = [
  { id: "sanctuary" },
  { id: "crafting" },
  { id: "hero-ficha" },
  { id: "hero-atributos" },
  { id: "hero-talentos" },
  { id: "ecos" },
  { id: "combat" },
  { id: "mochila" },
  { id: "mochila-abajo" },
  { id: "intel" },
  { id: "biblioteca" },
  { id: "laboratorio" },
  { id: "destileria" },
  { id: "encargos" },
  { id: "altar-sigilos" },
  { id: "progreso-offline" },
];

const SCREEN_SCROLL_RATIOS = {
  "mochila-abajo": 0.56,
};

export function slug(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function waitForServerReady(url, timeoutMs = 90000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) return;
    } catch {
      // Retry until timeout.
    }
    await delay(500);
  }
  throw new Error(`Servidor no disponible en ${url} tras ${timeoutMs}ms`);
}

async function clickFirstVisible(locator, timeoutMs = 500) {
  const item = locator.first();
  try {
    await item.waitFor({ state: "visible", timeout: timeoutMs });
    await item.click();
    return true;
  } catch {
    return false;
  }
}

export async function dismissOnboardingPopups(page) {
  for (let i = 0; i < 24; i += 1) {
    const clicked = await clickFirstVisible(page.getByRole("button", { name: /Seguir/i }), 250);
    if (!clicked) break;
    await delay(80);
  }
}

const STATION_OVERLAY_TARGETS = {
  biblioteca: {
    stationPattern: /Biblioteca/i,
    readyPattern: /Archivo del Santuario|Biblioteca/i,
  },
  laboratorio: {
    stationPattern: /Laboratorio/i,
    readyPattern: /Laboratorio|Investigacion/i,
  },
  destileria: {
    stationPattern: /Destileria/i,
    readyPattern: /Refinado del Santuario|Destileria/i,
  },
  encargos: {
    stationPattern: /Encargos/i,
    readyPattern: /Misiones auxiliares|Encargos/i,
  },
  "altar-sigilos": {
    stationPattern: /Altar de Sigilos/i,
    readyPattern: /Altar de Sigilos|Sigilos/i,
  },
};

async function openStationOverlay(page, screenId) {
  const target = STATION_OVERLAY_TARGETS[screenId];
  if (!target) return;

  const row = page.locator(".fl-sanctuary-station-row").filter({ hasText: target.stationPattern }).first();
  await row.scrollIntoViewIfNeeded({ timeout: 4000 });
  const button = row.getByRole("button", { name: /Abrir/i }).first();
  await button.click({ timeout: 5000 });
  await page.getByText(target.readyPattern).first().waitFor({ state: "visible", timeout: 5000 }).catch(() => null);
  await delay(700);
}

export async function buildCaptureSeedSaves() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "idlerpg-ui-capture-seed-"));
  const outfile = path.join(tempDir, "capture-seed.mjs");

  try {
    await build({
      stdin: {
        sourcefile: "forge-light-capture-seed.js",
        resolveDir: ROOT,
        contents: `
          import { createPostOnboardingSimulationState } from "./src/engine/stateInitializer.js";
          import { ITEMS } from "./src/data/items.js";
          import { ACHIEVEMENTS } from "./src/data/achievements.js";
          import { calcItemRating } from "./src/engine/inventory/inventoryEngine.js";
          import { normalizeCodexState } from "./src/engine/progression/codexEngine.js";
          import { normalizeRunContext } from "./src/engine/combat/encounterRouting.js";
          import { serializeSaveGame } from "./src/utils/storage.js";

          const SCREEN_TO_TAB = {
            sanctuary: "sanctuary",
            crafting: "sanctuary",
            "hero-ficha": "character",
            "hero-atributos": "skills",
            "hero-talentos": "talents",
            ecos: "prestige",
            combat: "combat",
            mochila: "inventory",
            "mochila-abajo": "inventory",
            intel: "codex",
            biblioteca: "sanctuary",
            laboratorio: "sanctuary",
            destileria: "sanctuary",
            encargos: "sanctuary",
            "altar-sigilos": "sanctuary",
            "progreso-offline": "combat",
          };

          const EXPEDITION_TABS = new Set(["combat", "inventory", "codex"]);
          const CAPTURE_STATION_IDS = ["laboratory", "distillery", "codexResearch", "errands", "sigilInfusion", "deepForge"];
          const CAPTURE_SANCTUARY_RESOURCES = {
            codexInk: 202,
            sigilFlux: 18,
            relicDust: 22,
          };
          const CAPTURE_OFFLINE_SUMMARY = {
            simulatedSeconds: 108,
            goldGained: 12840,
            xpGained: 3420,
            essenceGained: 210,
            killsGained: 68,
            itemsGained: 7,
            levelsGained: 1,
            bestDropName: "Hoja Reliquia de Guerra",
            bestDropRarity: "epic",
            bestDropHighlight: { label: "Epico" },
            bestDropPerfectRolls: 1,
          };

          const CAPTURE_FAMILY_NAMES = {
            axe: "Axe",
            dagger: "Dagger",
            focus: "Focus",
            leather: "Leather",
            mace: "Mace",
            plate: "Plate",
            spiked: "Spiked",
            sword: "Sword",
          };

          const CAPTURE_RUN_CONTEXT = normalizeRunContext({
            isFirstRun: true,
            seed: 104729,
            bossSlots: {
              1: "orc_warlord",
              2: "iron_sentinel",
              3: "blood_matriarch",
              4: "soul_weaver",
              5: "void_sovereign",
            },
          });

          function captureAffix(id, stat, value, label, kind = "prefix", quality = "excellent") {
            return {
              id,
              stat,
              bonusKey: stat,
              value,
              rolledValue: value,
              label: "",
              tierLabel: "",
              displayLabel: label,
              kind,
              quality,
            };
          }

          function makeCaptureItem(baseId, config = {}) {
            const baseItem = ITEMS.find(item => item.id === baseId) || ITEMS[0];
            const bonus = { ...(baseItem?.bonus || {}), ...(config.bonus || {}) };
            const item = {
              ...(baseItem || {}),
              id: config.id || \`capture_\${baseId}\`,
              itemId: baseItem?.id || baseId,
              rarity: config.rarity || baseItem?.rarity || "rare",
              name: config.name || baseItem?.name || baseId,
              family: config.family || baseItem?.family || null,
              familyName: config.familyName || CAPTURE_FAMILY_NAMES[config.family || baseItem?.family] || null,
              type: config.type || baseItem?.type || "weapon",
              bonus,
              baseBonus: { ...(baseItem?.bonus || {}) },
              implicitBonus: { ...(config.implicitBonus || {}) },
              implicitUpgradeBonus: {},
              affixes: config.affixes || [],
              itemTier: config.itemTier ?? 7,
              level: config.level ?? 0,
              sellValue: config.sellValue ?? baseItem?.sellValue ?? 100,
              crafting: {
                ...(config.crafting || {}),
                polishCount: config.crafting?.polishCount || 0,
                reforgeCount: config.crafting?.reforgeCount || 0,
                ascendCount: config.crafting?.ascendCount || 0,
              },
            };
            return {
              ...item,
              rating: config.rating ?? calcItemRating(item),
            };
          }

          function installCaptureInventory(state) {
            const weapon = makeCaptureItem("mind_lens", {
              id: "capture_equipped_mind_lens",
              rating: 485,
              level: 12,
              bonus: { damage: 12, markChance: 0.052, markEffectPerStack: 0.041 },
              implicitBonus: { markChance: 0.033, markEffectPerStack: 0.011 },
              crafting: { entropy: 72, entropyCap: 100 },
              affixes: [
                captureAffix("capture_damage_on_kill", "damageOnKill", 22.3, "Cazadora"),
                captureAffix("capture_damage_flat", "damage", 12, "Afilada", "suffix", "normal"),
              ],
            });
            const armor = makeCaptureItem("ironhide_mantle", {
              id: "capture_equipped_ironhide",
              rating: 285,
              bonus: { defense: 21, healthMax: 64, thorns: 25.3, blockChance: 0.03 },
              implicitBonus: { blockChance: 0.03 },
              affixes: [
                captureAffix("capture_thorns", "thorns", 25.3, "Espinosa"),
                captureAffix("capture_health", "healthMax", 20.9, "Robusta", "suffix", "normal"),
              ],
            });
            const inventory = [
              makeCaptureItem("relic_warblade", {
                id: "capture_inventory_warblade",
                rating: 520,
                bonus: { damage: 34, critDamage: 0.28, multiHitChance: 0.08 },
                affixes: [
                  captureAffix("capture_crit", "critDamage", 0.28, "Brutal"),
                  captureAffix("capture_combo", "multiHitChance", 0.08, "Encadenada", "suffix", "normal"),
                ],
              }),
              makeCaptureItem("thornwall_armor", {
                id: "capture_inventory_thornwall",
                rating: 265,
                bonus: { defense: 15, thorns: 18, blockChance: 0.06 },
                affixes: [captureAffix("capture_thornwall", "thorns", 18, "Espinosa")],
              }),
              makeCaptureItem("duskblade", {
                id: "capture_inventory_duskblade",
                rating: 244,
                bonus: { damage: 20, critChance: 0.05, critDamage: 0.3 },
                affixes: [captureAffix("capture_dusk_crit", "critChance", 0.05, "Certera")],
              }),
              makeCaptureItem("bulwark_cuirass", {
                id: "capture_inventory_bulwark",
                rating: 230,
                bonus: { defense: 16, blockChance: 0.07, healthMax: 45 },
                affixes: [captureAffix("capture_bulwark", "blockChance", 0.07, "del Bastion", "suffix", "normal")],
              }),
            ];

            state.player = {
              ...(state.player || {}),
              equipment: {
                ...((state.player || {}).equipment || {}),
                weapon,
                armor,
              },
              inventory,
            };
          }

          function installCaptureCodex(state) {
            state.codex = normalizeCodexState({
              familySeen: {
                orc: true,
                construct: true,
                demon: true,
                elemental: true,
                undead: true,
                knight: true,
              },
              familyKills: {
                orc: 186,
                construct: 124,
                demon: 92,
                elemental: 71,
                undead: 64,
                knight: 58,
              },
              bossSeen: {
                orc_warlord: true,
                iron_sentinel: true,
                blood_matriarch: true,
              },
              bossKills: {
                orc_warlord: 3,
                iron_sentinel: 1,
                blood_matriarch: 1,
              },
              powerDiscoveries: {
                sentinel_mass_engine: 2,
                eternal_thornwall: 1,
              },
            });

            state.expedition = {
              ...(state.expedition || {}),
              seenFamilyIds: ["orc", "construct", "demon", "elemental", "undead", "knight"],
            };
          }

          function tuneForForgeLightCapture(state, screenId) {
            const tab = SCREEN_TO_TAB[screenId] || "combat";
            const captureNow = Date.now();
            state.currentTab = tab;

            state.player = {
              ...(state.player || {}),
              class: "warrior",
              specialization: "juggernaut",
              level: 26,
              gold: 3120000,
              essence: 139348,
              fire: 4620,
              talentPoints: Math.max(22, Number(state.player?.talentPoints || 0)),
              unspentTalentPoints: Math.max(22, Number(state.player?.unspentTalentPoints || 0)),
            };

            state.stats = {
              ...(state.stats || {}),
              kills: Math.max(23706, Number(state.stats?.kills || 0)),
              bossKills: Math.max(2, Number(state.stats?.bossKills || 0)),
              prestigeCount: Math.max(1, Number(state.stats?.prestigeCount || 0)),
            };
            state.achievements = ACHIEVEMENTS.map(achievement => achievement.id);

            state.expedition = {
              ...(state.expedition || {}),
              phase: EXPEDITION_TABS.has(tab) ? "active" : "sanctuary",
              id: EXPEDITION_TABS.has(tab) ? "forge-light-capture-run" : null,
              startedAt: EXPEDITION_TABS.has(tab) ? Date.now() - 120000 : null,
            };

            state.combat = {
              ...(state.combat || {}),
              currentTier: 7,
              maxTier: 10,
              runContext: CAPTURE_RUN_CONTEXT,
              prestigeCycle: {
                ...((state.combat || {}).prestigeCycle || {}),
                kills: 23706,
                bossKills: 21,
                maxTier: 10,
                maxLevel: 26,
                bestItemRating: 618,
              },
              pendingRunSetup: false,
              pendingRunSigilId: "free",
              pendingRunSigilIds: ["free"],
              activeRunSigilId: "free",
              activeRunSigilIds: ["free"],
            };
            state.combat.offlineSummary = screenId === "progreso-offline"
              ? CAPTURE_OFFLINE_SUMMARY
              : null;

            state.prestige = {
              ...(state.prestige || {}),
              level: Math.max(1, Number(state.prestige?.level || 0)),
              echoes: Math.max(538, Number(state.prestige?.echoes || 0)),
              totalEchoesEarned: Math.max(538, Number(state.prestige?.totalEchoesEarned || 0)),
              bestHistoricTier: Math.max(13, Number(state.prestige?.bestHistoricTier || 0)),
              momentum: Math.max(1, Number(state.prestige?.momentum || 0)),
            };

            const stations = { ...((state.sanctuary || {}).stations || {}) };
            CAPTURE_STATION_IDS.forEach(key => {
              stations[key] = {
                ...(stations[key] || {}),
                unlocked: true,
                level: Math.max(1, Number(stations[key]?.level || 0)),
                slots: Math.max(key === "errands" ? 3 : 1, Number(stations[key]?.slots || 0)),
              };
            });
            const captureJobs = [
              {
                id: "capture_job_errand_blood",
                type: "sanctuary_errand",
                station: "errands",
                status: "claimable",
                startedAt: captureNow - 25 * 60 * 1000,
                endsAt: captureNow - 45 * 1000,
                input: {
                  errandId: "affinity_bleed_dot",
                  durationId: "short",
                  label: "Encargo de Sangre",
                },
                output: {
                  label: "Encargo de Sangre",
                  summary: "Recompensa: oro, esencia y fuego recuperados por el equipo.",
                  rewards: { gold: 12430, essence: 320, fire: 15 },
                },
              },
              {
                id: "capture_job_errand_materials",
                type: "sanctuary_errand",
                station: "errands",
                status: "running",
                startedAt: captureNow - 42 * 60 * 1000,
                endsAt: captureNow + 18 * 60 * 1000,
                input: {
                  errandId: "materials_relic_flux",
                  durationId: "medium",
                  label: "Encargo de Materiales",
                },
                output: {
                  label: "Encargo de Materiales",
                  summary: "Recompensa: polvo de reliquia y flux de sigilo.",
                  rewards: { relicDust: 4, sigilFlux: 5 },
                },
              },
              {
                id: "capture_job_errand_precision",
                type: "sanctuary_errand",
                station: "errands",
                status: "running",
                startedAt: captureNow - 16 * 60 * 1000,
                endsAt: captureNow + 43 * 60 * 1000,
                input: {
                  errandId: "affinity_crit_burst",
                  durationId: "medium",
                  label: "Encargo de Precision",
                },
                output: {
                  label: "Encargo de Precision",
                  summary: "Recompensa: cargas de critico y burst.",
                  rewards: { gold: 7600, essence: 180 },
                },
              },
              {
                id: "capture_job_errand_assault",
                type: "sanctuary_errand",
                station: "errands",
                status: "running",
                startedAt: captureNow - 3 * 60 * 60 * 1000,
                endsAt: captureNow + 51 * 60 * 1000,
                input: {
                  errandId: "affinity_tempo_combo",
                  durationId: "long",
                  label: "Encargo de Asalto",
                },
                output: {
                  label: "Encargo de Asalto",
                  summary: "Recompensa: cargas de tempo y combo.",
                  rewards: { gold: 18800, essence: 420 },
                },
              },
              {
                id: "capture_job_distillery_supply",
                type: "distill_bundle",
                station: "distillery",
                status: "claimable",
                startedAt: captureNow - 9 * 60 * 1000,
                endsAt: captureNow - 35 * 1000,
                input: {
                  cargoId: "essence_cache",
                  quantity: 1,
                },
                output: {
                  label: "Encargo de Provision",
                  amount: 320,
                },
              },
            ];

            state.sanctuary = {
              ...(state.sanctuary || {}),
              stations,
              resources: {
                ...((state.sanctuary || {}).resources || {}),
                ...CAPTURE_SANCTUARY_RESOURCES,
              },
              cargoInventory: [
                { id: "capture_cargo_essence_6", type: "essence_cache", label: "Reserva de Esencia", description: "Botin refinable para alimentar la economia persistente del Santuario.", quantity: 6 },
                { id: "capture_cargo_essence_1", type: "essence_cache", label: "Reserva de Esencia", description: "Botin refinable para alimentar la economia persistente del Santuario.", quantity: 1 },
                { id: "capture_cargo_essence_7", type: "essence_cache", label: "Reserva de Esencia", description: "Botin refinable para alimentar la economia persistente del Santuario.", quantity: 7 },
                { id: "capture_cargo_essence_3", type: "essence_cache", label: "Reserva de Esencia", description: "Botin refinable para alimentar la economia persistente del Santuario.", quantity: 3 },
                { id: "capture_cargo_essence_137", type: "essence_cache", label: "Reserva de Esencia", description: "Botin refinable para alimentar la economia persistente del Santuario.", quantity: 137 },
                { id: "capture_cargo_essence_1b", type: "essence_cache", label: "Reserva de Esencia", description: "Botin refinable para alimentar la economia persistente del Santuario.", quantity: 1 },
                { id: "capture_cargo_codex_194", type: "codex_trace", label: "Trazas de Codice", description: "Hallazgos para convertir en tinta de Biblioteca.", quantity: 194 },
              ],
              sigilInfusions: {
                ...((state.sanctuary || {}).sigilInfusions || {}),
              },
              jobs: captureJobs,
              pendingOpenForgeOverlay: screenId === "crafting",
            };

            state.onboarding = {
              ...(state.onboarding || {}),
              completed: true,
              step: "completed",
              active: false,
              infoQueue: [],
              flags: {
                ...((state.onboarding || {}).flags || {}),
                classChosen: true,
                combatIntroSeen: true,
                heroTabUnlocked: true,
                specChosen: true,
                heroIntroSeen: true,
                firstAttributeSpent: true,
                firstTalentBought: true,
                inventoryUnlocked: true,
                firstItemEquipped: true,
                firstBossSeen: true,
                huntUnlocked: true,
                extractionUnlocked: true,
                firstExtractionCompleted: true,
                firstSanctuaryReturnSeen: true,
                laboratoryUnlocked: true,
              },
            };

            installCaptureInventory(state);
            installCaptureCodex(state);

            return state;
          }

          export function buildForgeLightCaptureSaves() {
            const result = {};
            for (const screenId of Object.keys(SCREEN_TO_TAB)) {
            const state = createPostOnboardingSimulationState({
              classId: "warrior",
              specialization: "juggernaut",
              level: 26,
              gold: 3120000,
              essence: 139348,
              currentTier: 7,
            });
              const tuned = tuneForForgeLightCapture(state, screenId);
              const payload = JSON.parse(serializeSaveGame(tuned));
              if (screenId === "progreso-offline") {
                payload.combat = {
                  ...(payload.combat || {}),
                  offlineSummary: tuned.combat?.offlineSummary || CAPTURE_OFFLINE_SUMMARY,
                };
              }
              result[screenId] = JSON.stringify(payload);
            }
            return result;
          }
        `,
      },
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node20",
      sourcemap: false,
      logLevel: "silent",
    });

    const moduleUrl = `${pathToFileURL(outfile).href}?ts=${Date.now()}`;
    const { buildForgeLightCaptureSaves } = await import(moduleUrl);
    return buildForgeLightCaptureSaves();
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function capture(page, screenId, viewportName, records) {
  const filename = `${slug(screenId)}-${viewportName}.png`;
  const filePath = path.join(OUT_DIR, filename);
  await delay(450);
  await dismissOnboardingPopups(page);
  await openStationOverlay(page, screenId);
  if (screenId === "progreso-offline") {
    await delay(1300);
  }
  if (screenId === "mochila-abajo") {
    const lootFilter = page.locator(".fl-inventory-loot-filter").first();
    try {
      await lootFilter.scrollIntoViewIfNeeded({ timeout: 1000 });
      await page.evaluate(() => window.scrollBy(0, -18));
      await delay(250);
    } catch {
      // Fall back to proportional scrolling below.
    }
  }
  if (SCREEN_SCROLL_RATIOS[screenId] != null && screenId !== "mochila-abajo") {
    await page.evaluate(ratio => {
      const candidates = [
        document.scrollingElement,
        document.documentElement,
        document.body,
        ...document.querySelectorAll(".app-shell-content, .app-primary-viewport, .expedition-root, main, [data-scroll-root]")
      ].filter(Boolean);

      for (const element of candidates) {
        const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
        if (maxScroll > 0) {
          element.scrollTop = Math.round(maxScroll * ratio);
        }
      }
    }, SCREEN_SCROLL_RATIOS[screenId]);
    await delay(250);
  }
  await page.screenshot({ path: filePath, fullPage: false, animations: "disabled" });
  records.push({ screenId, viewportName, status: "CAPTURED", file: path.relative(ROOT, filePath), detail: "" });
}

function recordBlocked(records, screenId, viewportName, detail) {
  records.push({ screenId, viewportName, status: "BLOCKED", file: "", detail });
}

async function runViewport(browser, viewport, saveByScreen) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });

  await context.addInitScript(({ storageKey, saves }) => {
    const params = new URLSearchParams(window.location.search);
    const screenId = params.get("captureScreen") || "combat";
    const save = saves[screenId] || saves.combat;
    if (save) {
      window.localStorage.setItem(storageKey, save);
    }
  }, { storageKey: STORAGE_KEY, saves: saveByScreen });

  const page = await context.newPage();
  const records = [];
  const jsErrors = [];

  page.on("pageerror", error => {
    jsErrors.push(`pageerror: ${error?.message || String(error)}`);
  });
  page.on("console", msg => {
    if (msg.type() === "error") {
      jsErrors.push(`console.error: ${msg.text()}`);
    }
  });

  try {
    for (const target of SCREEN_TARGETS) {
      try {
        const url = `${CAPTURE_URL}&captureScreen=${encodeURIComponent(target.id)}`;
        await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
        await capture(page, target.id, viewport.name, records);
      } catch (error) {
        recordBlocked(records, target.id, viewport.name, error?.message || String(error));
      }
    }
  } finally {
    await context.close();
  }

  return { viewport: viewport.name, records, jsErrors };
}

function buildReport(results) {
  const lines = [
    "# Forge Light Capture Report",
    "",
    `- Fecha: ${new Date().toISOString()}`,
    `- URL: \`${CAPTURE_URL}\``,
    "- Modo: save semilla post-onboarding + `?nosave=1`",
    "",
    "## Capturas",
    "",
    "| Viewport | Pantalla | Estado | Archivo | Detalle |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const result of results) {
    for (const record of result.records) {
      lines.push(`| ${record.viewportName} | ${record.screenId} | ${record.status} | ${record.file ? `\`${record.file}\`` : "-" } | ${record.detail || "-"} |`);
    }
  }

  lines.push("", "## Errores JS", "");
  for (const result of results) {
    lines.push(`### ${result.viewport}`, "");
    if (result.jsErrors.length === 0) {
      lines.push("- Ninguno");
    } else {
      for (const error of result.jsErrors.slice(0, 20)) {
        lines.push(`- ${error}`);
      }
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export async function stopDevServer(devServer) {
  if (!devServer || devServer.exitCode != null || devServer.signalCode != null) return;
  devServer.kill("SIGTERM");
  const exited = await Promise.race([
    once(devServer, "exit").then(() => true).catch(() => true),
    delay(2000).then(() => false),
  ]);
  if (!exited && devServer.exitCode == null && devServer.signalCode == null) {
    devServer.kill("SIGKILL");
    await Promise.race([
      once(devServer, "exit").catch(() => null),
      delay(1000),
    ]);
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const saveByScreen = await buildCaptureSeedSaves();

  const devServer = spawn(
    "npm",
    ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(DEV_PORT)],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }
  );

  let serverLogs = "";
  const appendLog = chunk => {
    serverLogs += chunk.toString();
    if (serverLogs.length > 12000) {
      serverLogs = serverLogs.slice(-12000);
    }
  };
  devServer.stdout.on("data", appendLog);
  devServer.stderr.on("data", appendLog);

  try {
    await waitForServerReady(CAPTURE_URL, 90000);
    const browser = await chromium.launch({ headless: true });
    try {
      const results = [];
      for (const viewport of VIEWPORTS) {
        results.push(await runViewport(browser, viewport, saveByScreen));
      }
      const report = buildReport(results);
      await fs.writeFile(REPORT_PATH, report, "utf8");
      console.log(`Reporte generado en: ${REPORT_PATH}`);
      console.log(report);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error(serverLogs);
    throw error;
  } finally {
    await stopDevServer(devServer);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
