import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { build } from "../node_modules/esbuild/lib/main.js";

function parseArgs(argv = []) {
  const options = {
    runs: 5,
    ticks: 3600,
    profile: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--runs" && next) {
      options.runs = Number(next);
      index += 1;
      continue;
    }
    if (arg.startsWith("--runs=")) {
      options.runs = Number(arg.split("=")[1]);
      continue;
    }
    if (arg === "--ticks" && next) {
      options.ticks = Number(next);
      index += 1;
      continue;
    }
    if (arg.startsWith("--ticks=")) {
      options.ticks = Number(arg.split("=")[1]);
      continue;
    }
    if (arg === "--profile" && next) {
      options.profile = next;
      index += 1;
      continue;
    }
    if (arg.startsWith("--profile=")) {
      options.profile = arg.split("=")[1];
      continue;
    }
  }

  return options;
}

async function main() {
  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "idlerpg-batch-"));
  const outfile = path.join(tempDir, "balance-batch-runner.mjs");

  try {
    await build({
      entryPoints: [path.join(repoRoot, "src/engine/simulation/balanceBatchRunner.js")],
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

    const { runBalanceBatch, formatBalanceBatchReport } = await import(`${pathToFileURL(outfile).href}?ts=${Date.now()}`);
    const options = parseArgs(process.argv.slice(2));
    const report = runBalanceBatch(options);
    process.stdout.write(`${formatBalanceBatchReport(report)}\n`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error("Balance batch failed.");
  console.error(error);
  process.exitCode = 1;
});
