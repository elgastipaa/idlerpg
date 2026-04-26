import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { build } from "../node_modules/esbuild/lib/main.js";

async function main() {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "idlerpg-process-tick-stage-regression-"));
  const outfile = path.join(tempDir, "process-tick-stage-regression-runner.mjs");

  try {
    await build({
      entryPoints: [path.join(repoRoot, "src/engine/simulation/processTickStageRegression.js")],
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

    const { runProcessTickStageRegression, formatProcessTickStageRegressionReport } =
      await import(`${pathToFileURL(outfile).href}?ts=${Date.now()}`);

    const report = runProcessTickStageRegression();
    process.stdout.write(`${formatProcessTickStageRegressionReport(report)}\n`);
    if (!report.pass) {
      process.exitCode = 1;
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error("ProcessTick stage regression failed.");
  console.error(error);
  process.exitCode = 1;
});
