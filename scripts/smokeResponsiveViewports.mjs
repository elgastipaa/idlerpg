import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEV_PORT = Number(process.env.SMOKE_PORT || 4173);
const BASE_URL = `http://127.0.0.1:${DEV_PORT}/?fresh=1`;
const REPORT_PATH = path.join(ROOT, "notes", "responsiveViewportSmokeReport.md");

const VIEWPORTS = [
  { name: "360x780", width: 360, height: 780, isMobile: true },
  { name: "390x844", width: 390, height: 844, isMobile: true },
  { name: "768x1024", width: 768, height: 1024, isMobile: false },
  { name: "1280x800", width: 1280, height: 800, isMobile: false },
];

const STATION_ACTIONS = [
  { id: "laboratory", open: /Abrir Laboratorio/i, fallback: /Laboratorio/i },
  { id: "distillery", open: /Abrir Destileria/i, fallback: /Destileria/i },
  { id: "library", open: /Abrir Biblioteca/i, fallback: /Biblioteca/i },
  { id: "errands", open: /Abrir Encargos/i, fallback: /Encargos/i },
  { id: "sigil_altar", open: /Abrir Altar de Sigilos/i, fallback: /Altar de Sigilos/i },
  { id: "forge", open: /Abrir Taller/i, fallback: /Taller/i },
];

function toOutcome(ok, detail = "") {
  return { ok, detail };
}

function summarizeStatus(result) {
  const critical = [
    result.steps.load?.ok,
    result.steps.sanctuary?.ok,
    result.steps.expeditionStart?.ok,
    result.steps.extractionOpen?.ok,
    result.steps.extractionConfirm?.ok,
    result.steps.sanctuaryReturn?.ok,
  ];
  const criticalPass = critical.every(Boolean);
  if (criticalPass && result.steps.stations?.openedCount > 0) return "PASS";
  if (criticalPass) return "PARTIAL";
  return "FAIL";
}

async function waitForServerReady(url, timeoutMs = 90000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) return;
    } catch {
      // keep retrying until timeout
    }
    await delay(500);
  }
  throw new Error(`Servidor no disponible en ${url} tras ${timeoutMs}ms`);
}

async function clickFirstVisible(locator, timeoutMs = 1200) {
  const item = locator.first();
  try {
    await item.waitFor({ state: "visible", timeout: timeoutMs });
    await item.click();
    return true;
  } catch {
    return false;
  }
}

async function dismissOnboardingPopups(page) {
  for (let i = 0; i < 24; i += 1) {
    const clicked = await clickFirstVisible(page.getByRole("button", { name: /Seguir/i }), 450);
    if (!clicked) break;
    await delay(140);
  }
}

async function clickPrimaryTab(page, regex) {
  const target = page.getByRole("button", { name: regex });
  const clicked = await clickFirstVisible(target, 1800);
  if (!clicked) return false;
  await delay(300);
  return true;
}

async function ensureClassSelected(page) {
  const warrior = page.getByRole("button", { name: /Warrior/i });
  const mage = page.getByRole("button", { name: /Mage/i });
  if (await warrior.first().isVisible({ timeout: 500 }).catch(() => false)) {
    await warrior.first().click();
    await delay(450);
    return true;
  }
  if (await mage.first().isVisible({ timeout: 500 }).catch(() => false)) {
    await mage.first().click();
    await delay(450);
    return true;
  }
  return false;
}

async function runSingleViewport(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  const page = await context.newPage();
  const jsErrors = [];

  page.on("pageerror", error => {
    jsErrors.push(`pageerror: ${error?.message || String(error)}`);
  });
  page.on("console", msg => {
    if (msg.type() === "error") {
      jsErrors.push(`console.error: ${msg.text()}`);
    }
  });

  const result = {
    viewport: viewport.name,
    steps: {
      load: toOutcome(false),
      sanctuary: toOutcome(false),
      expeditionStart: toOutcome(false),
      extractionOpen: toOutcome(false),
      extractionConfirm: toOutcome(false),
      sanctuaryReturn: toOutcome(false),
      stations: { opened: [], openedCount: 0 },
    },
    jsErrors,
    status: "FAIL",
  };

  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60000 });
    await dismissOnboardingPopups(page);
    result.steps.load = toOutcome(true, "App cargada");

    const sanctuaryOpened = await clickPrimaryTab(page, /Santuario/i);
    result.steps.sanctuary = sanctuaryOpened
      ? toOutcome(true, "Tab Santuario abierta")
      : toOutcome(false, "No se encontró tab Santuario");

    const startedRun = await clickFirstVisible(
      page.getByRole("button", { name: /Iniciar expedic/i }),
      2200
    );
    if (startedRun) {
      await delay(350);
      await ensureClassSelected(page);
      result.steps.expeditionStart = toOutcome(true, "Se ejecutó iniciar expedición");
    } else {
      result.steps.expeditionStart = toOutcome(false, "No se encontró botón iniciar expedición");
    }

    await clickPrimaryTab(page, /Expedicion/i);
    await dismissOnboardingPopups(page);

    const extractionOpen = await clickFirstVisible(
      page.getByRole("button", { name: /Extraer al Santuario/i }),
      4500
    );
    result.steps.extractionOpen = extractionOpen
      ? toOutcome(true, "Overlay de extracción abierto")
      : toOutcome(false, "No se encontró botón de extracción");

    if (extractionOpen) {
      await delay(300);
      const extractionConfirm =
        (await clickFirstVisible(page.getByRole("button", { name: /Extraer y convertir a ecos/i }), 1800)) ||
        (await clickFirstVisible(page.getByRole("button", { name: /Confirmar extracc/i }), 1800)) ||
        (await clickFirstVisible(page.getByRole("button", { name: /Aceptar emergencia/i }), 1800));
      result.steps.extractionConfirm = extractionConfirm
        ? toOutcome(true, "Extracción confirmada")
        : toOutcome(false, "No se encontró botón confirmar extracción");
      await delay(450);
    }

    const sanctuaryReturn = await clickPrimaryTab(page, /Santuario/i);
    result.steps.sanctuaryReturn = sanctuaryReturn
      ? toOutcome(true, "Regreso a Santuario")
      : toOutcome(false, "No se pudo volver a Santuario");

    if (sanctuaryReturn) {
      for (const station of STATION_ACTIONS) {
        const opened =
          (await clickFirstVisible(page.getByRole("button", { name: station.open }), 1200)) ||
          (await clickFirstVisible(page.getByRole("button", { name: station.fallback }), 900));
        if (!opened) continue;
        await delay(450);
        const closed = await clickFirstVisible(page.getByRole("button", { name: /^Volver$/i }), 1800);
        if (closed) {
          result.steps.stations.opened.push(station.id);
          await delay(220);
        }
      }
    }

    result.steps.stations.openedCount = result.steps.stations.opened.length;
    result.status = summarizeStatus(result);
  } catch (error) {
    result.status = "FAIL";
    result.jsErrors.push(`runtime: ${error?.message || String(error)}`);
  } finally {
    await context.close();
  }

  return result;
}

function buildMarkdownReport(results) {
  const generatedAt = new Date().toISOString();
  const lines = [
    "# Responsive Viewport Smoke Report",
    "",
    `- Fecha: ${generatedAt}`,
    `- URL testeada: \`${BASE_URL}\``,
    "- Modo: `?fresh=1` (sin persistencia de save)",
    "",
    "## Matriz",
    "",
    "| Viewport | Load | Santuario | Iniciar Exp | Extraer | Confirmar | Volver Santuario | Estaciones abiertas | JS errors | Estado |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const result of results) {
    lines.push(
      `| ${result.viewport} | ${result.steps.load.ok ? "PASS" : "FAIL"} | ${result.steps.sanctuary.ok ? "PASS" : "FAIL"} | ${result.steps.expeditionStart.ok ? "PASS" : "FAIL"} | ${result.steps.extractionOpen.ok ? "PASS" : "FAIL"} | ${result.steps.extractionConfirm.ok ? "PASS" : "FAIL"} | ${result.steps.sanctuaryReturn.ok ? "PASS" : "FAIL"} | ${result.steps.stations.openedCount} (${result.steps.stations.opened.join(", ") || "-"}) | ${result.jsErrors.length} | **${result.status}** |`
    );
  }

  lines.push("", "## Detalle por viewport", "");

  for (const result of results) {
    lines.push(`### ${result.viewport}`, "");
    lines.push(`- Estado: **${result.status}**`);
    lines.push(`- Load: ${result.steps.load.ok ? "PASS" : "FAIL"} · ${result.steps.load.detail}`);
    lines.push(`- Santuario: ${result.steps.sanctuary.ok ? "PASS" : "FAIL"} · ${result.steps.sanctuary.detail}`);
    lines.push(`- Iniciar expedición: ${result.steps.expeditionStart.ok ? "PASS" : "FAIL"} · ${result.steps.expeditionStart.detail}`);
    lines.push(`- Abrir extracción: ${result.steps.extractionOpen.ok ? "PASS" : "FAIL"} · ${result.steps.extractionOpen.detail}`);
    lines.push(`- Confirmar extracción: ${result.steps.extractionConfirm.ok ? "PASS" : "FAIL"} · ${result.steps.extractionConfirm.detail}`);
    lines.push(`- Volver a Santuario: ${result.steps.sanctuaryReturn.ok ? "PASS" : "FAIL"} · ${result.steps.sanctuaryReturn.detail}`);
    lines.push(`- Estaciones abiertas: ${result.steps.stations.openedCount > 0 ? result.steps.stations.opened.join(", ") : "ninguna"}`);
    if (result.jsErrors.length > 0) {
      lines.push("- Errores JS detectados:");
      result.jsErrors.slice(0, 10).forEach(error => {
        lines.push(`  - ${error}`);
      });
    } else {
      lines.push("- Errores JS detectados: ninguno");
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
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
    await waitForServerReady(BASE_URL, 90000);
    const browser = await chromium.launch({ headless: true });
    try {
      const results = [];
      for (const viewport of VIEWPORTS) {
        const result = await runSingleViewport(browser, viewport);
        results.push(result);
      }

      const markdown = buildMarkdownReport(results);
      await fs.writeFile(REPORT_PATH, markdown, "utf8");
      console.log(`Reporte generado en: ${REPORT_PATH}`);
      console.log(markdown);
    } finally {
      await browser.close();
    }
  } finally {
    devServer.kill("SIGTERM");
    await delay(300);
    if (!devServer.killed) {
      devServer.kill("SIGKILL");
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
