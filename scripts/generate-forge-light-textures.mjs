import path from "node:path";
import { Buffer } from "node:buffer";
import { appendFile, mkdir, rename, stat, writeFile } from "node:fs/promises";

const DEFAULT_OPTIONS = {
  out: "public/assets/forge-light/textures",
  model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
  size: "1024x1024",
  quality: "high",
  force: false,
  dryRun: false,
  only: null,
  retries: 3,
};

const SHARED_PROMPT = [
  "Create a premium dark fantasy RPG UI texture for Forge Light.",
  "The asset must be square, seamless, tileable, and repeatable on all edges.",
  "No text, no icons, no symbols, no frames, no UI widgets, no borders, no hard vignette.",
  "Avoid strong focal points. Avoid obvious repeated motifs. Keep contrast controlled for CSS layering.",
  "Palette discipline: near-black charcoal, deep iron, old gold, muted ash, faint arcane violet or sickly green only when requested.",
  "Material should feel realistic, tactile, premium, aged, and game-ready.",
].join(" ");

const ASSETS = [
  {
    id: "bg-stone",
    fileName: "fl-bg-stone-seamless.webp",
    outputFormat: "webp",
    background: "opaque",
    prompt: [
      SHARED_PROMPT,
      "Material: dark ruined cathedral stone, basalt slabs, soot, subtle worn chisel marks, faint mossy green stains in crevices.",
      "Use very low contrast and broad organic variation so it works behind full screens at 20 to 35 percent opacity.",
      "The result should add depth behind panels without becoming a scene illustration.",
    ].join("\n\n"),
  },
  {
    id: "panel-metal",
    fileName: "fl-panel-metal-seamless.webp",
    outputFormat: "webp",
    background: "opaque",
    prompt: [
      SHARED_PROMPT,
      "Material: blackened iron and dark gunmetal plate, fine hammered grain, subtle scratches, smoky patina, tiny oxidized gold flecks.",
      "Designed for RPG cards and panels at 6 to 14 percent opacity over token colors.",
      "Make it quiet, dense, expensive, and legible under text.",
    ].join("\n\n"),
  },
  {
    id: "panel-noise-alpha",
    fileName: "fl-panel-noise-alpha.png",
    outputFormat: "png",
    background: "transparent",
    prompt: [
      SHARED_PROMPT,
      "Create a transparent alpha overlay only: soot speckles, dust, hairline scratches, tiny worn metal pores.",
      "The visible marks should be charcoal and very subtle, with most of the image transparent.",
      "Designed to sit above UI cards and buttons at 5 to 12 percent opacity.",
    ].join("\n\n"),
  },
  {
    id: "stage-fog-alpha",
    fileName: "fl-stage-fog-alpha.png",
    outputFormat: "png",
    background: "transparent",
    prompt: [
      SHARED_PROMPT,
      "Create a transparent alpha overlay only: low drifting dungeon fog, smoky mist, faint ash motes, subtle arcane violet haze.",
      "The fog must be seamless and tileable, with soft edges and no central glow.",
      "Designed for Combat backgrounds and boss stages at 10 to 25 percent opacity.",
    ].join("\n\n"),
  },
  {
    id: "gold-edge-noise",
    fileName: "fl-gold-edge-noise-seamless.webp",
    outputFormat: "webp",
    background: "opaque",
    prompt: [
      SHARED_PROMPT,
      "Material: antique tarnished gold leaf, worn gilded edge grain, dark recesses, tiny scratches, oxidized brown-black patina.",
      "This is a microtexture for borders, button bevels, panel headers, and gold accent overlays.",
      "Keep it dense and small scale, not decorative wallpaper.",
    ].join("\n\n"),
  },
];

function parseArgs(argv = []) {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    const [key, inlineValue] = arg.startsWith("--") ? arg.slice(2).split("=") : [];
    const value = inlineValue ?? next;

    if (!key || value == null) {
      continue;
    }

    if (inlineValue == null) {
      index += 1;
    }

    if (key === "out") options.out = value;
    if (key === "model") options.model = value;
    if (key === "size") options.size = value;
    if (key === "quality") options.quality = value;
    if (key === "only") options.only = value;
    if (key === "retries") options.retries = Math.max(0, Number(value));
  }

  return options;
}

function printHelp() {
  process.stdout.write(`Generate Forge Light material textures with the OpenAI Images API.

Required env:
  OPENAI_API_KEY

Usage:
  npm run assets:textures:forge-light
  npm run assets:textures:forge-light -- --dry-run
  npm run assets:textures:forge-light -- --force
  npm run assets:textures:forge-light -- --only panel-metal

Options:
  --dry-run                 Print planned files without calling the API.
  --force                   Overwrite existing files.
  --only ID                 Generate one asset: ${ASSETS.map(asset => asset.id).join(", ")}.
  --out PATH                Output directory. Default: ${DEFAULT_OPTIONS.out}
  --model MODEL             Default: ${DEFAULT_OPTIONS.model}
  --size SIZE               Default: ${DEFAULT_OPTIONS.size}
  --quality QUALITY         low, medium, high, or auto. Default: ${DEFAULT_OPTIONS.quality}
  --retries N               Retry 408/429/5xx responses. Default: ${DEFAULT_OPTIONS.retries}
`);
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function retryDelayMs(error, attempt) {
  const retryAfter = Number(error?.retryAfter);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }

  return Math.min(30000, 1500 * 2 ** attempt);
}

function shouldRetry(error) {
  return error?.status === 408 || error?.status === 429 || (error?.status >= 500 && error?.status <= 599);
}

async function parseErrorResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = await response.text();
  }

  const error = new Error(
    payload?.error?.message || payload?.message || `Image request failed with HTTP ${response.status}`,
  );
  error.status = response.status;
  error.retryAfter = response.headers.get("retry-after");
  return error;
}

async function requestTexture({ asset, options, apiKey }) {
  const body = {
    model: options.model,
    prompt: asset.prompt,
    n: 1,
    size: options.size,
    quality: options.quality,
    background: asset.background,
    output_format: asset.outputFormat,
  };

  if (asset.outputFormat === "webp") {
    body.output_compression = 92;
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const payload = await response.json();
  const imageBase64 = payload?.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("Image response did not include data[0].b64_json.");
  }

  return {
    buffer: Buffer.from(imageBase64, "base64"),
    usage: payload.usage ?? null,
  };
}

async function requestTextureWithRetry(params) {
  let lastError = null;

  for (let attempt = 0; attempt <= params.options.retries; attempt += 1) {
    try {
      return await requestTexture(params);
    } catch (error) {
      lastError = error;
      if (attempt >= params.options.retries || !shouldRetry(error)) {
        throw error;
      }

      const delay = retryDelayMs(error, attempt);
      process.stdout.write(`Retrying ${params.asset.fileName} after ${Math.round(delay / 1000)}s: ${error.message}\n`);
      await wait(delay);
    }
  }

  throw lastError;
}

async function writeLog(filePath, record) {
  await appendFile(filePath, `${JSON.stringify(record)}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const outputDir = path.resolve(options.out);
  const logPath = path.join(outputDir, ".forge-light-textures-log.jsonl");
  const assets = options.only
    ? ASSETS.filter(asset => asset.id === options.only)
    : ASSETS;

  if (assets.length === 0) {
    throw new Error(`Unknown --only value "${options.only}". Use one of: ${ASSETS.map(asset => asset.id).join(", ")}`);
  }

  process.stdout.write(`Output: ${path.relative(process.cwd(), outputDir)}\n`);
  process.stdout.write(`Model: ${options.model}; size: ${options.size}; quality: ${options.quality}\n`);

  if (options.dryRun) {
    for (const asset of assets) {
      process.stdout.write(`- ${asset.id}: ${asset.fileName} (${asset.outputFormat}, ${asset.background})\n`);
    }
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  await mkdir(outputDir, { recursive: true });

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (const asset of assets) {
    const targetPath = path.join(outputDir, asset.fileName);
    const tempPath = `${targetPath}.tmp-${process.pid}`;

    if (!options.force && await exists(targetPath)) {
      skipped += 1;
      process.stdout.write(`[skip] ${asset.fileName}\n`);
      continue;
    }

    try {
      process.stdout.write(`[start] ${asset.fileName}\n`);
      const startedAt = new Date().toISOString();
      const result = await requestTextureWithRetry({ asset, options, apiKey });
      await writeFile(tempPath, result.buffer);
      await rename(tempPath, targetPath);
      completed += 1;
      process.stdout.write(`[done] ${asset.fileName}\n`);

      await writeLog(logPath, {
        id: asset.id,
        fileName: asset.fileName,
        model: options.model,
        size: options.size,
        quality: options.quality,
        background: asset.background,
        outputFormat: asset.outputFormat,
        startedAt,
        completedAt: new Date().toISOString(),
        usage: result.usage,
      });
    } catch (error) {
      failed += 1;
      process.stderr.write(`[fail] ${asset.fileName}: ${error.message}\n`);
      await writeLog(logPath, {
        id: asset.id,
        fileName: asset.fileName,
        failedAt: new Date().toISOString(),
        error: error.message,
        status: error.status ?? null,
      });
    }
  }

  process.stdout.write(`Finished. Generated ${completed}, skipped ${skipped}, failed ${failed}.\n`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
