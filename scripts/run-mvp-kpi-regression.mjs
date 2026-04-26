import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { build } from "../node_modules/esbuild/lib/main.js";

async function main() {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "idlerpg-mvp-kpi-regression-"));
  const outfile = path.join(tempDir, "mvp-kpi-regression-runner.mjs");

  try {
    await build({
      entryPoints: [path.join(repoRoot, "src/engine/simulation/mvpKpiRegression.js")],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node20",
      sourcemap: false,
      logLevel: "silent",
    });

    if (typeof globalThis.localStorage === "undefined") {
      globalThis.localStorage = {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      };
    }

    const { runMvpKpiRegression, formatMvpKpiRegressionReport } =
      await import(`${pathToFileURL(outfile).href}?ts=${Date.now()}`);

    const result = runMvpKpiRegression();
    process.stdout.write(`${formatMvpKpiRegressionReport(result)}\n`);
    if (!result.pass) {
      process.exitCode = 1;
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error("MVP KPI regression failed.");
  console.error(error);
  process.exitCode = 1;
});
