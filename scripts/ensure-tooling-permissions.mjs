import { chmodSync, existsSync } from "node:fs";
import { join } from "node:path";

const EXECUTABLE_MODE = 0o755;
const projectRoot = process.cwd();

const platformBins = [
  "node_modules/@esbuild/linux-x64/bin/esbuild",
  "node_modules/@esbuild/linux-arm64/bin/esbuild",
  "node_modules/@esbuild/linux-ia32/bin/esbuild",
  "node_modules/@esbuild/linux-loong64/bin/esbuild",
  "node_modules/@esbuild/linux-mips64el/bin/esbuild",
  "node_modules/@esbuild/linux-ppc64/bin/esbuild",
  "node_modules/@esbuild/linux-riscv64/bin/esbuild",
  "node_modules/@esbuild/linux-s390x/bin/esbuild",
];

let fixedCount = 0;

for (const relPath of platformBins) {
  const absPath = join(projectRoot, relPath);
  if (!existsSync(absPath)) continue;

  try {
    chmodSync(absPath, EXECUTABLE_MODE);
    fixedCount += 1;
  } catch (error) {
    console.warn(`[permissions] could not chmod ${relPath}: ${error.message}`);
  }
}

if (fixedCount > 0) {
  console.log(`[permissions] ensured executable bit on ${fixedCount} tooling binary(ies).`);
}
