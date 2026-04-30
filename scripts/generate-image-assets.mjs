import path from "node:path";
import { Blob, Buffer } from "node:buffer";
import { appendFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";

const DEFAULT_OPTIONS = {
  input: "uirefactor/asset-generation/items-all.md",
  out: "public/assets/items",
  filter: "^item_",
  globalPrompt: "uirefactor/asset-generation/global-item-rules.md",
  references: [],
  model: "gpt-image-1.5",
  size: "1024x1024",
  quality: "medium",
  background: "transparent",
  outputFormat: "png",
  concurrency: 1,
  limit: null,
  dryRun: false,
  force: false,
  retries: 3,
};

function parseArgs(argv = []) {
  const options = {
    ...DEFAULT_OPTIONS,
    references: [...DEFAULT_OPTIONS.references],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--no-global-prompt") {
      options.globalPrompt = null;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      options.help = true;
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

    if (key === "input") options.input = value;
    if (key === "out") options.out = value;
    if (key === "filter") options.filter = value;
    if (key === "global-prompt") options.globalPrompt = value;
    if (key === "reference") options.references.push(value);
    if (key === "model") options.model = value;
    if (key === "size") options.size = value;
    if (key === "quality") options.quality = value;
    if (key === "background") options.background = value;
    if (key === "output-format") options.outputFormat = value;
    if (key === "concurrency") options.concurrency = Math.max(1, Number(value));
    if (key === "limit") options.limit = Math.max(1, Number(value));
    if (key === "retries") options.retries = Math.max(0, Number(value));
  }

  return options;
}

function printHelp() {
  process.stdout.write(`Generate image assets from Markdown prompts.

Usage:
  npm run assets:generate -- [options]

Required env:
  OPENAI_API_KEY

Common options:
  --dry-run                       Parse prompts and print what would be generated.
  --limit 5                       Generate only the first N matching prompts.
  --force                         Overwrite existing files.
  --concurrency 2                 Run N requests in parallel. Keep low for rate limits.
  --filter '^item_'               Regex applied to suggested file names.
  --input PATH                    Markdown prompt file.
  --out public/assets/items       Output directory.
  --global-prompt PATH            Markdown/text file prepended to every prompt.
  --no-global-prompt              Send only each individual prompt.
  --reference PATH                Reference image. Can be repeated.
  --quality medium                low, medium, high, or auto.
  --model gpt-image-1.5           GPT image model to use.

Examples:
  npm run assets:generate -- --dry-run
  npm run assets:items:pilot -- --reference uirefactor/asset-generation/reference/item_style_reference.png
  npm run assets:items:remaining -- --reference uirefactor/asset-generation/reference/item_style_reference.png --concurrency 2
  npm run assets:generate -- --filter '^enemy_' --out public/assets/combat/enemies --no-global-prompt
`);
}

function parsePromptEntries(markdown) {
  const lines = markdown.split(/\r?\n/);
  const entries = [];
  let pendingFile = null;

  for (let index = 0; index < lines.length; index += 1) {
    const fileMatch = lines[index].match(/^Archivo sugerido:\s*`([^`]+)`/);
    if (fileMatch) {
      pendingFile = {
        fileName: fileMatch[1],
        fileLine: index + 1,
      };
      continue;
    }

    if (!pendingFile || lines[index].trim() !== "Prompt:") {
      continue;
    }

    let cursor = index + 1;
    while (cursor < lines.length && !lines[cursor].trim().startsWith("```")) {
      cursor += 1;
    }

    if (cursor >= lines.length) {
      continue;
    }

    const promptStartLine = cursor + 2;
    cursor += 1;
    const promptLines = [];

    while (cursor < lines.length && !lines[cursor].trim().startsWith("```")) {
      promptLines.push(lines[cursor]);
      cursor += 1;
    }

    const prompt = promptLines.join("\n").trim();
    if (prompt) {
      entries.push({
        fileName: pendingFile.fileName,
        fileLine: pendingFile.fileLine,
        promptLine: promptStartLine,
        prompt,
      });
    }

    pendingFile = null;
    index = cursor;
  }

  return entries;
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

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function readReferenceImages(referencePaths) {
  const references = [];

  for (const referencePath of referencePaths) {
    const resolvedPath = path.resolve(referencePath);
    const buffer = await readFile(resolvedPath);
    references.push({
      fileName: path.basename(referencePath),
      buffer,
      mimeType: mimeTypeFor(referencePath),
    });
  }

  return references;
}

function buildPrompt(entry, options) {
  const parts = [];

  if (options.references.length > 0) {
    parts.push([
      "Use the attached image as visual style reference only.",
      "Match the painterly finish, lighting, contrast, rim light, material richness, and mobile readability.",
      "Do not copy the exact object from the reference image.",
    ].join(" "));
  }

  if (options.globalPromptText) {
    parts.push(options.globalPromptText);
  }

  parts.push(`Individual asset prompt:\n${entry.prompt}`);

  return parts.join("\n\n");
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

async function requestImageGeneration({ entry, options, apiKey }) {
  const body = {
    model: options.model,
    prompt: buildPrompt(entry, options),
    n: 1,
    size: options.size,
    quality: options.quality,
    background: options.background,
    output_format: options.outputFormat,
  };

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

  return response.json();
}

async function requestImageEdit({ entry, options, apiKey }) {
  const formData = new FormData();
  formData.append("model", options.model);
  formData.append("prompt", buildPrompt(entry, options));
  formData.append("n", "1");
  formData.append("size", options.size);
  formData.append("quality", options.quality);
  formData.append("background", options.background);
  formData.append("output_format", options.outputFormat);

  for (const reference of options.referenceImages) {
    const blob = new Blob([reference.buffer], { type: reference.mimeType });
    formData.append("image[]", blob, reference.fileName);
  }

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json();
}

async function requestImage({ entry, options, apiKey }) {
  const payload = options.referenceImages.length > 0
    ? await requestImageEdit({ entry, options, apiKey })
    : await requestImageGeneration({ entry, options, apiKey });
  const imageBase64 = payload?.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("Image response did not include data[0].b64_json.");
  }

  return {
    buffer: Buffer.from(imageBase64, "base64"),
    usage: payload.usage ?? null,
  };
}

async function requestImageWithRetry(params) {
  let lastError = null;

  for (let attempt = 0; attempt <= params.options.retries; attempt += 1) {
    try {
      return await requestImage(params);
    } catch (error) {
      lastError = error;
      if (attempt >= params.options.retries || !shouldRetry(error)) {
        throw error;
      }

      const delay = retryDelayMs(error, attempt);
      process.stdout.write(`Retrying ${params.entry.fileName} after ${Math.round(delay / 1000)}s: ${error.message}\n`);
      await wait(delay);
    }
  }

  throw lastError;
}

async function writeJsonl(filePath, record) {
  await appendFile(filePath, `${JSON.stringify(record)}\n`);
}

async function runQueue(entries, options, apiKey) {
  const outputDir = path.resolve(options.out);
  const logPath = path.join(outputDir, ".generation-log.jsonl");
  let cursor = 0;
  let completed = 0;
  let failed = 0;
  let skipped = 0;

  async function worker(workerId) {
    while (cursor < entries.length) {
      const entry = entries[cursor];
      cursor += 1;

      const safeFileName = path.basename(entry.fileName);
      const targetPath = path.join(outputDir, safeFileName);
      const tempPath = `${targetPath}.tmp-${process.pid}-${workerId}`;

      if (!options.force && await exists(targetPath)) {
        skipped += 1;
        process.stdout.write(`[skip] ${safeFileName}\n`);
        continue;
      }

      try {
        process.stdout.write(`[start] ${safeFileName}\n`);
        const startedAt = new Date().toISOString();
        const result = await requestImageWithRetry({ entry, options, apiKey });
        await writeFile(tempPath, result.buffer);
        await rename(tempPath, targetPath);
        completed += 1;
        process.stdout.write(`[done] ${safeFileName}\n`);

        await writeJsonl(logPath, {
          fileName: safeFileName,
          mode: options.referenceImages.length > 0 ? "edit_with_reference" : "generate",
          model: options.model,
          size: options.size,
          quality: options.quality,
          background: options.background,
          outputFormat: options.outputFormat,
          input: path.relative(process.cwd(), path.resolve(options.input)),
          globalPrompt: options.globalPrompt ? path.relative(process.cwd(), path.resolve(options.globalPrompt)) : null,
          references: options.references.map(reference => path.relative(process.cwd(), path.resolve(reference))),
          promptLine: entry.promptLine,
          startedAt,
          completedAt: new Date().toISOString(),
          usage: result.usage,
        });
      } catch (error) {
        failed += 1;
        process.stderr.write(`[fail] ${safeFileName}: ${error.message}\n`);
        await writeJsonl(logPath, {
          fileName: safeFileName,
          input: path.relative(process.cwd(), path.resolve(options.input)),
          promptLine: entry.promptLine,
          failedAt: new Date().toISOString(),
          error: error.message,
          status: error.status ?? null,
        });
      }
    }
  }

  await Promise.all(
    Array.from({ length: options.concurrency }, (_, index) => worker(index + 1)),
  );

  return { completed, failed, skipped };
}

async function loadGlobalPrompt(options) {
  if (!options.globalPrompt) {
    return null;
  }

  return readFile(path.resolve(options.globalPrompt), "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const inputPath = path.resolve(options.input);
  const outputDir = path.resolve(options.out);
  const markdown = await readFile(inputPath, "utf8");
  const filter = new RegExp(options.filter);
  options.globalPromptText = await loadGlobalPrompt(options);
  options.referenceImages = await readReferenceImages(options.references);
  let entries = parsePromptEntries(markdown)
    .filter(entry => filter.test(entry.fileName));

  if (options.limit) {
    entries = entries.slice(0, options.limit);
  }

  process.stdout.write(`Matched ${entries.length} prompt(s) from ${path.relative(process.cwd(), inputPath)}.\n`);
  if (options.globalPrompt) {
    process.stdout.write(`Using global prompt: ${path.relative(process.cwd(), path.resolve(options.globalPrompt))}\n`);
  }
  if (options.referenceImages.length > 0) {
    process.stdout.write(`Using ${options.referenceImages.length} reference image(s).\n`);
  }
  if (entries.length === 0) {
    return;
  }

  if (options.dryRun) {
    for (const entry of entries) {
      process.stdout.write(`- ${entry.fileName} (prompt line ${entry.promptLine})\n`);
    }
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  await mkdir(outputDir, { recursive: true });
  const summary = await runQueue(entries, options, apiKey);
  process.stdout.write(
    `Finished. Generated ${summary.completed}, skipped ${summary.skipped}, failed ${summary.failed}.\n`,
  );

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
