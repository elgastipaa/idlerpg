import path from "node:path";
import { Buffer } from "node:buffer";
import { appendFile, mkdir, rename, stat, writeFile } from "node:fs/promises";

const DEFAULT_OPTIONS = {
  out: "public/assets/backgrounds/screens",
  model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
  size: "1536x1024",
  quality: "high",
  outputFormat: "webp",
  outputCompression: 90,
  force: false,
  dryRun: false,
  only: null,
  limit: null,
  retries: 3,
};

const SHARED_PROMPT = [
  "Create a premium dark fantasy RPG screen background for a mobile-first idle RPG UI.",
  "This is environmental background art that will sit behind translucent UI cards, panels, bars, and buttons.",
  "No text, no letters, no numbers, no logos, no UI widgets, no frames, no borders, no icons, no characters posing in the foreground.",
  "Composition rules: leave the center and lower-middle areas visually calm for readable cards; keep strong detail near edges and corners.",
  "Lighting: cinematic but controlled, with subtle old-gold rim light, deep charcoal shadows, and occasional muted green, blue, violet, or ember accents only when requested.",
  "Style: painterly realistic dark fantasy, ancient materials, premium game art, rich atmospheric depth, not cartoon, not anime, not photoreal stock.",
  "Avoid high-frequency clutter under expected text zones. Avoid big bright focal points behind central panels.",
  "The image must work under a dark overlay at roughly 35 to 65 percent opacity and still add texture behind cards.",
].join(" ");

const ASSETS = [
  {
    id: "combat_ruins",
    fileName: "screen_combat_ruins.webp",
    cssVar: "--screen-bg-combat",
    prompt: [
      SHARED_PROMPT,
      "Screen: Combat.",
      "Scene: forgotten ruined arena inside a collapsed gothic dungeon, cracked stone floor, broken pillars, distant archways, faint green abyssal glow in the depths, old gold light grazing the edges.",
      "Mood: dangerous, tense, readable behind enemy HUD and combat cards.",
    ].join("\n\n"),
  },
  {
    id: "sanctuary_forge",
    fileName: "screen_sanctuary_forge.webp",
    cssVar: "--screen-bg-sanctuary",
    prompt: [
      SHARED_PROMPT,
      "Screen: Sanctuary.",
      "Scene: warm forge sanctuary hall with dark stone walls, anvil silhouettes, sealed workstations, hanging chains, ember light, faint holy-gold dust, calm safe-home atmosphere.",
      "Mood: operational, cozy, mystical, stable, readable behind station cards.",
    ].join("\n\n"),
  },
  {
    id: "inventory_armory",
    fileName: "screen_inventory_armory.webp",
    cssVar: "--screen-bg-inventory",
    prompt: [
      SHARED_PROMPT,
      "Screen: Inventory.",
      "Scene: shadowy armory and loot table, weapon racks at the sides, old leather cases, dark iron shelves, scattered gold glints, folded cloth and chest silhouettes.",
      "Mood: organized, item-focused, quiet, with subtle material texture behind item cards.",
    ].join("\n\n"),
  },
  {
    id: "crafting_workshop",
    fileName: "screen_crafting_workshop.webp",
    cssVar: "--screen-bg-crafting",
    prompt: [
      SHARED_PROMPT,
      "Screen: Crafting.",
      "Scene: arcane blacksmith workshop, forge mouth glowing low orange, etched runes on stone, tools and tongs at the edges, smoky metal haze, faint sparks far from center.",
      "Mood: precise, tactile, ritual crafting, warm but not overexposed.",
    ].join("\n\n"),
  },
  {
    id: "talents_sigil",
    fileName: "screen_talents_sigil.webp",
    cssVar: "--screen-bg-talents",
    prompt: [
      SHARED_PROMPT,
      "Screen: Talents.",
      "Scene: ancient stone floor engraved with a branching sigil constellation, dim violet-blue arcane lines, broken monoliths at edges, deep void shadows.",
      "Mood: abstract progression, mystical, readable behind node trees and detail panels.",
    ].join("\n\n"),
  },
  {
    id: "character_hall",
    fileName: "screen_character_hall.webp",
    cssVar: "--screen-bg-character",
    prompt: [
      SHARED_PROMPT,
      "Screen: Character.",
      "Scene: hero preparation hall, dark ceremonial pedestal, banners faded into shadow, armor stands at the sides, narrow gold light from high windows.",
      "Mood: personal progression, heroic but restrained, clear center for character cards.",
    ].join("\n\n"),
  },
  {
    id: "stats_archive",
    fileName: "screen_stats_archive.webp",
    cssVar: "--screen-bg-stats",
    prompt: [
      SHARED_PROMPT,
      "Screen: Stats.",
      "Scene: ancient archive and measurement chamber, stone tablets, abacus-like relics, dim candles, shelves fading into darkness, faint blue-gold analytic glow.",
      "Mood: analytical, quiet, readable behind dense stat panels.",
    ].join("\n\n"),
  },
  {
    id: "prestige_altar",
    fileName: "screen_prestige_altar.webp",
    cssVar: "--screen-bg-prestige",
    prompt: [
      SHARED_PROMPT,
      "Screen: Prestige or account progression.",
      "Scene: cosmic ritual altar in ruined stone, distant stars visible through a broken ceiling, old gold circular glyphs, muted violet abyss light at the edges.",
      "Mood: ceremonial reset, powerful, elegant, not busy under central panels.",
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
    if (key === "output-format") options.outputFormat = value;
    if (key === "output-compression") options.outputCompression = Math.max(0, Math.min(100, Number(value)));
    if (key === "only") options.only = value;
    if (key === "limit") options.limit = Math.max(1, Number(value));
    if (key === "retries") options.retries = Math.max(0, Number(value));
  }

  return options;
}

function printHelp() {
  process.stdout.write(`Generate fantasy screen backgrounds with the OpenAI Images API.

Required env:
  OPENAI_API_KEY

Usage:
  npm run assets:backgrounds:screens
  npm run assets:backgrounds:screens -- --dry-run
  npm run assets:backgrounds:screens -- --only combat_ruins --force

Options:
  --dry-run                 Print planned files without calling the API.
  --force                   Overwrite existing files.
  --only ID                 Generate one asset: ${ASSETS.map(asset => asset.id).join(", ")}.
  --limit N                 Generate only the first N planned assets.
  --out PATH                Output directory. Default: ${DEFAULT_OPTIONS.out}
  --model MODEL             Default: ${DEFAULT_OPTIONS.model}
  --size SIZE               Default: ${DEFAULT_OPTIONS.size}
  --quality QUALITY         low, medium, high, or auto. Default: ${DEFAULT_OPTIONS.quality}
  --output-format FORMAT    png, webp, or jpeg. Default: ${DEFAULT_OPTIONS.outputFormat}
  --output-compression N    0-100 for webp/jpeg. Default: ${DEFAULT_OPTIONS.outputCompression}
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

async function requestBackground({ asset, options, apiKey }) {
  const body = {
    model: options.model,
    prompt: asset.prompt,
    n: 1,
    size: options.size,
    quality: options.quality,
    background: "opaque",
    output_format: options.outputFormat,
  };

  if (options.outputFormat === "webp" || options.outputFormat === "jpeg") {
    body.output_compression = options.outputCompression;
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

async function requestBackgroundWithRetry(params) {
  let lastError = null;

  for (let attempt = 0; attempt <= params.options.retries; attempt += 1) {
    try {
      return await requestBackground(params);
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

async function writeJsonl(filePath, record) {
  await appendFile(filePath, `${JSON.stringify(record)}\n`);
}

async function writeManifest(outputDir, assets) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    assets: assets.map(asset => ({
      id: asset.id,
      fileName: asset.fileName,
      path: `/assets/backgrounds/screens/${asset.fileName}`,
      cssVar: asset.cssVar,
    })),
  };

  await writeFile(
    path.join(outputDir, "screen-backgrounds-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const outputDir = path.resolve(options.out);
  const logPath = path.join(outputDir, ".screen-backgrounds-log.jsonl");
  let assets = options.only
    ? ASSETS.filter(asset => asset.id === options.only)
    : ASSETS;

  if (assets.length === 0) {
    throw new Error(`Unknown --only value "${options.only}". Use one of: ${ASSETS.map(asset => asset.id).join(", ")}`);
  }

  if (options.limit) {
    assets = assets.slice(0, options.limit);
  }

  process.stdout.write(`Output: ${path.relative(process.cwd(), outputDir)}\n`);
  process.stdout.write(`Model: ${options.model}; size: ${options.size}; quality: ${options.quality}; format: ${options.outputFormat}\n`);

  if (options.dryRun) {
    for (const asset of assets) {
      process.stdout.write(`- ${asset.id}: ${asset.fileName} (${asset.cssVar})\n`);
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
      const result = await requestBackgroundWithRetry({ asset, options, apiKey });
      await writeFile(tempPath, result.buffer);
      await rename(tempPath, targetPath);
      completed += 1;
      process.stdout.write(`[done] ${asset.fileName}\n`);

      await writeJsonl(logPath, {
        id: asset.id,
        fileName: asset.fileName,
        cssVar: asset.cssVar,
        model: options.model,
        size: options.size,
        quality: options.quality,
        outputFormat: options.outputFormat,
        outputCompression: options.outputCompression,
        startedAt,
        completedAt: new Date().toISOString(),
        usage: result.usage,
      });
    } catch (error) {
      failed += 1;
      process.stderr.write(`[fail] ${asset.fileName}: ${error.message}\n`);
      await writeJsonl(logPath, {
        id: asset.id,
        fileName: asset.fileName,
        failedAt: new Date().toISOString(),
        error: error.message,
        status: error.status ?? null,
      });
    }
  }

  await writeManifest(outputDir, ASSETS);

  process.stdout.write(`Finished. Generated ${completed}, skipped ${skipped}, failed ${failed}.\n`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
