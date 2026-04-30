import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "uirefactor", "current", "kit-demo");
const BASE_URL = process.env.FL_KIT_DEMO_URL || "http://127.0.0.1:5174/#forge-light-kit-demo";

const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844, isMobile: true },
  { name: "430x932", width: 430, height: 932, isMobile: true },
  { name: "1280x800", width: 1280, height: 800, isMobile: false },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = ["# Forge Light Kit Demo Capture", "", `URL: ${BASE_URL}`, ""];

  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        deviceScaleFactor: 1,
      });
      await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
      await page.locator(".fl-kit-demo").waitFor({ state: "visible", timeout: 10000 });
      await page.addStyleTag({
        content: `
          * {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
          }
        `,
      });
      const output = path.join(OUT_DIR, `forge-light-kit-demo-${viewport.name}.png`);
      const target = await page.locator(".flc-shell").count()
        ? page.locator(".flc-shell")
        : await page.locator(".fl-button-board").count()
          ? page.locator(".fl-button-board")
          : page.locator(".fl-kit-demo");
      await target.screenshot({ path: output });
      const metrics = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
        scrollHeight: document.documentElement.scrollHeight,
        kitScrollHeight: document.querySelector(".fl-kit-demo")?.scrollHeight || 0,
        kitOffsetHeight: document.querySelector(".fl-kit-demo")?.offsetHeight || 0,
        kitClientHeight: document.querySelector(".fl-kit-demo")?.clientHeight || 0,
        kitOverflow: document.querySelector(".fl-kit-demo") ? window.getComputedStyle(document.querySelector(".fl-kit-demo")).overflow : "",
        onboardingVisible: Boolean(document.querySelector("[data-onboarding-target], .onboarding-overlay")),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      }));
      report.push(`- ${viewport.name}: ${path.relative(ROOT, output)}; scrollHeight=${metrics.scrollHeight}; kit=${metrics.kitOffsetHeight}/${metrics.kitScrollHeight}/${metrics.kitClientHeight} overflow=${metrics.kitOverflow}; overflowX=${metrics.horizontalOverflow}; onboarding=${metrics.onboardingVisible}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(path.join(OUT_DIR, "capture-report.md"), `${report.join("\n")}\n`, "utf8");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
