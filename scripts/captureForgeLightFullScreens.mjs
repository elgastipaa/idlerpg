import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import path from "node:path";
import {
  CAPTURE_URL,
  DEV_PORT,
  ROOT,
  SCREEN_TARGETS,
  STORAGE_KEY,
  VIEWPORTS,
  buildCaptureSeedSaves,
  dismissOnboardingPopups,
  slug,
  waitForServerReady,
} from "./captureForgeLightScreens.mjs";

const OUT_DIR = path.join(ROOT, "uirefactor", "fullpage");
const REPORT_PATH = path.join(OUT_DIR, "fullpage-capture-report.md");

const SCROLL_ROOT_SELECTORS = [
  ".overlay-shell",
  ".overlay-shell__surface",
  ".overlay-station-body--forge",
  ".fl-station-overlay",
  ".app-shell-content",
  ".app-primary-viewport",
  ".expedition-root",
  "main",
  "[data-scroll-root]",
];

const STATION_TARGETS = [
  {
    id: "station-laboratory",
    captureScreen: "sanctuary",
    stationTitle: "Laboratorio",
    dialogName: /Laboratorio/i,
  },
  {
    id: "station-distillery",
    captureScreen: "sanctuary",
    stationTitle: "Destileria",
    dialogName: /Destileria/i,
  },
  {
    id: "station-library",
    captureScreen: "sanctuary",
    stationTitle: "Biblioteca",
    dialogName: /Biblioteca/i,
  },
  {
    id: "station-errands",
    captureScreen: "sanctuary",
    stationTitle: "Encargos",
    dialogName: /Encargos/i,
  },
  {
    id: "station-sigil-altar",
    captureScreen: "sanctuary",
    stationTitle: "Altar de Sigilos",
    dialogName: /Altar de Sigilos/i,
  },
  {
    id: "station-forge",
    captureScreen: "sanctuary",
    stationTitle: "Forja",
    dialogName: /Forja del Santuario/i,
  },
];

const CAPTURE_TARGETS = [
  ...SCREEN_TARGETS,
  ...STATION_TARGETS,
];

function escapeMarkdown(value = "") {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

async function detectScrollRoot(page) {
  return page.evaluate(selectors => {
    document.querySelectorAll("[data-ui-fullpage-root]").forEach(node => {
      node.removeAttribute("data-ui-fullpage-root");
    });

    const isElementVisible = element => {
      if (!element || element.nodeType !== 1) return false;
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || 1) === 0) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const explicitCandidates = selectors
      .flatMap(selector => Array.from(document.querySelectorAll(selector)).map(element => ({ element, selector })))
      .filter(({ element }) => isElementVisible(element));

    const scrollableCandidates = Array.from(document.querySelectorAll("body *"))
      .filter(isElementVisible)
      .filter(element => element.scrollHeight > element.clientHeight + 8)
      .map(element => {
        const className = typeof element.className === "string" && element.className.trim()
          ? `.${element.className.trim().split(/\s+/).slice(0, 3).join(".")}`
          : "";
        return {
          element,
          selector: element.id ? `#${element.id}` : `${element.tagName.toLowerCase()}${className}`,
        };
      });

    const documentElement = document.scrollingElement || document.documentElement;
    const candidates = [
      ...explicitCandidates,
      ...scrollableCandidates,
      { element: documentElement, selector: "document.scrollingElement" },
      { element: document.body, selector: "body" },
    ].filter(({ element }) => element);

    const uniqueCandidates = [];
    const seen = new Set();
    for (const candidate of candidates) {
      if (seen.has(candidate.element)) continue;
      seen.add(candidate.element);
      uniqueCandidates.push(candidate);
    }

    const scored = uniqueCandidates.map((candidate, index) => {
      const { element, selector } = candidate;
      const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      const scrollHeight = Math.ceil(element.scrollHeight || 0);
      const clientHeight = Math.ceil(element.clientHeight || window.innerHeight || 0);
      const overflow = Math.max(0, scrollHeight - clientHeight);
      const explicitBonus = selectors.some(item => selector === item || selector.startsWith(item.replace(/\[.*$/, ""))) ? 100000 : 0;
      const area = Math.max(0, Math.round((rect.width || window.innerWidth) * (rect.height || clientHeight)));
      return {
        element,
        selector,
        index,
        scrollHeight,
        clientHeight,
        overflow,
        area,
        score: explicitBonus + overflow * 100 + scrollHeight + Math.min(area, 100000),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const selected = scored[0] || {
      element: documentElement,
      selector: "document.scrollingElement",
      scrollHeight: documentElement.scrollHeight,
      clientHeight: documentElement.clientHeight,
      overflow: Math.max(0, documentElement.scrollHeight - documentElement.clientHeight),
    };

    selected.element.setAttribute?.("data-ui-fullpage-root", "true");
    selected.element.scrollTop = 0;
    window.scrollTo(0, 0);

    return {
      selector: selected.selector,
      scrollHeight: Math.ceil(selected.element.scrollHeight || selected.scrollHeight || window.innerHeight),
      clientHeight: Math.ceil(selected.element.clientHeight || selected.clientHeight || window.innerHeight),
      overflow: Math.max(0, Math.ceil((selected.element.scrollHeight || 0) - (selected.element.clientHeight || 0))),
      candidateCount: scored.length,
    };
  }, SCROLL_ROOT_SELECTORS);
}

async function installFullpageCaptureStyle(page, captureHeight) {
  return page.addStyleTag({
    content: `
      html,
      body,
      #root {
        min-height: ${captureHeight}px !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }

      [data-ui-fullpage-root="true"] {
        min-height: ${captureHeight}px !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        overscroll-behavior: auto !important;
      }

      .app-shell-content,
      .app-primary-viewport,
      .overlay-shell,
      .overlay-shell__surface,
      .overlay-station-body--forge,
      .fl-station-overlay,
      .expedition-root,
      main,
      [data-scroll-root] {
        max-height: none !important;
      }
    `,
  });
}

async function getExpandedMetrics(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-ui-fullpage-root='true']") || document.scrollingElement || document.documentElement;
    const body = document.body;
    const doc = document.documentElement;
    return {
      rootScrollHeight: Math.ceil(root?.scrollHeight || 0),
      rootClientHeight: Math.ceil(root?.clientHeight || 0),
      bodyScrollHeight: Math.ceil(body?.scrollHeight || 0),
      documentScrollHeight: Math.ceil(doc?.scrollHeight || 0),
      viewportHeight: Math.ceil(window.innerHeight || 0),
    };
  });
}

async function openStationTarget(page, target) {
  if (!target?.stationTitle) return;

  const row = page
    .locator(".fl-sanctuary-station-row")
    .filter({ hasText: target.stationTitle })
    .first();

  await row.waitFor({ state: "visible", timeout: 5000 });
  await row.scrollIntoViewIfNeeded({ timeout: 5000 });
  await delay(150);

  const actionButton = row.getByRole("button").last();
  await actionButton.click();
  await page.getByRole("dialog", { name: target.dialogName }).waitFor({ state: "visible", timeout: 10000 });
  await delay(500);
}

async function captureFull(page, screenId, viewport, records) {
  const filename = `${slug(screenId)}-full-${viewport.name}.png`;
  const filePath = path.join(OUT_DIR, filename);
  const originalSize = { width: viewport.width, height: viewport.height };
  const maxHeight = viewport.height * 3;
  let styleHandle = null;

  try {
    await page.setViewportSize(originalSize);
    await delay(450);
    await dismissOnboardingPopups(page);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.querySelectorAll(".overlay-shell, .overlay-shell__surface, .overlay-station-body--forge, .fl-station-overlay, .app-shell-content, .app-primary-viewport, .expedition-root, main, [data-scroll-root]").forEach(element => {
        element.scrollTop = 0;
      });
    });
    await delay(150);

    const detected = await detectScrollRoot(page);
    const contentHeight = Math.max(viewport.height, detected.scrollHeight || viewport.height);
    const captureHeight = Math.max(1, Math.min(contentHeight, maxHeight));
    const truncated = contentHeight > maxHeight;

    await page.setViewportSize({ width: viewport.width, height: captureHeight });
    styleHandle = await installFullpageCaptureStyle(page, captureHeight);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const root = document.querySelector("[data-ui-fullpage-root='true']");
      if (root) root.scrollTop = 0;
    });
    await delay(350);

    const expanded = await getExpandedMetrics(page);
    await page.screenshot({
      path: filePath,
      fullPage: false,
      animations: "disabled",
      caret: "hide",
    });

    records.push({
      screenId,
      viewportName: viewport.name,
      status: "CAPTURED",
      file: path.relative(ROOT, filePath),
      scrollRoot: detected.selector,
      scrollHeight: detected.scrollHeight,
      clientHeight: detected.clientHeight,
      captureHeight,
      maxHeight,
      method: "element-expanded",
      truncated,
      detail: `expanded root=${expanded.rootScrollHeight}, document=${expanded.documentScrollHeight}`,
    });
  } catch (error) {
    records.push({
      screenId,
      viewportName: viewport.name,
      status: "BLOCKED",
      file: "",
      scrollRoot: "-",
      scrollHeight: "-",
      clientHeight: "-",
      captureHeight: "-",
      maxHeight,
      method: "failed",
      truncated: false,
      detail: error?.message || String(error),
    });
  } finally {
    try {
      await styleHandle?.evaluate(node => node.remove());
    } catch {
      // The page may already have navigated or closed.
    }
    await page.setViewportSize(originalSize).catch(() => null);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    for (const target of CAPTURE_TARGETS) {
      const captureScreen = target.captureScreen || target.id;
      const url = `${CAPTURE_URL}&captureScreen=${encodeURIComponent(captureScreen)}`;
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
        await openStationTarget(page, target);
        await captureFull(page, target.id, viewport, records);
      } catch (error) {
        records.push({
          screenId: target.id,
          viewportName: viewport.name,
          status: "BLOCKED",
          file: "",
          scrollRoot: "-",
          scrollHeight: "-",
          clientHeight: "-",
          captureHeight: "-",
          maxHeight: viewport.height * 3,
          method: "failed",
          truncated: false,
          detail: error?.message || String(error),
        });
      }
    }
  } finally {
    await context.close();
  }

  return { viewport: viewport.name, records, jsErrors };
}

function buildReport(results) {
  const lines = [
    "# Forge Light Fullpage Capture Report",
    "",
    `- Fecha: ${new Date().toISOString()}`,
    `- URL: \`${CAPTURE_URL}\``,
    "- Modo: save semilla post-onboarding + `?nosave=1`",
    "- Cap de altura: `viewportHeight * 3`",
    "",
    "## Capturas",
    "",
    "| Viewport | Pantalla | Estado | Archivo | Scroll root | scrollHeight | clientHeight | captureHeight | maxHeight | Metodo | Truncada | Detalle |",
    "| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |",
  ];

  for (const result of results) {
    for (const record of result.records) {
      lines.push([
        record.viewportName,
        record.screenId,
        record.status,
        record.file ? `\`${record.file}\`` : "-",
        escapeMarkdown(record.scrollRoot || "-"),
        record.scrollHeight,
        record.clientHeight,
        record.captureHeight,
        record.maxHeight,
        record.method,
        record.truncated ? "si" : "no",
        escapeMarkdown(record.detail || "-"),
      ].join(" | ").replace(/^/, "| ").replace(/$/, " |"));
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

async function stopDevServerGroup(devServer) {
  if (!devServer || devServer.exitCode != null || devServer.signalCode != null) return;

  const killProcess = signal => {
    try {
      if (devServer.pid) {
        process.kill(-devServer.pid, signal);
        return;
      }
    } catch {
      // Fall back to killing the direct child below.
    }
    try {
      devServer.kill(signal);
    } catch {
      // Ignore shutdown races.
    }
  };

  killProcess("SIGTERM");
  const exited = await Promise.race([
    once(devServer, "exit").then(() => true).catch(() => true),
    delay(2000).then(() => false),
  ]);

  if (!exited && devServer.exitCode == null && devServer.signalCode == null) {
    killProcess("SIGKILL");
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
    { cwd: ROOT, detached: true, stdio: ["ignore", "pipe", "pipe"] }
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
    await stopDevServerGroup(devServer);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
