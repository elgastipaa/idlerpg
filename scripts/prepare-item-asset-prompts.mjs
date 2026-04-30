import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const SOURCE_FILE = "uirefactor/imagenes.md";
const OUTPUT_DIR = "uirefactor/asset-generation";

const PILOT_FILES = new Set([
  "item_worn_sword.png",
  "item_crude_axe.png",
  "item_worn_chestplate.png",
  "item_reinforced_breastplate.png",
  "item_mind_lens.png",
  "item_eclipse_wand.png",
  "item_eternal_titan_plate.png",
  "item_deep_void_iris.png",
]);

const COMMON_PROMPT_SUFFIX = "Single inventory equipment item only, centered three-quarter product-view angle, readable silhouette for mobile UI, premium painterly-realistic game icon style, lively crafted look inspired by ornate forge/crafting UI, crisp edges, controlled glow, bronze-gold rim light, high contrast, 1024x1024 PNG, TRUE ALPHA transparent background, transparent pixels around the item, no rendered background, no floor, no shadow outside the item silhouette, no frame, no UI, no text, no logo, no watermark, no checkerboard pattern rendered as pixels.";

function stripCommonPromptSuffix(prompt) {
  if (!prompt.endsWith(COMMON_PROMPT_SUFFIX)) {
    throw new Error("Item prompt did not end with the expected shared suffix.");
  }

  return prompt.slice(0, -COMMON_PROMPT_SUFFIX.length).trim();
}

function parseEntries(markdown) {
  const lines = markdown.split(/\r?\n/);
  const entries = [];
  let currentHeading = null;
  let pending = null;

  for (let index = 0; index < lines.length; index += 1) {
    const headingMatch = lines[index].match(/^####\s+(.+)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].trim();
      continue;
    }

    const fileMatch = lines[index].match(/^Archivo sugerido:\s*`([^`]+)`/);
    if (fileMatch) {
      pending = {
        heading: currentHeading,
        fileName: fileMatch[1],
        metadata: null,
        prompt: null,
      };
      continue;
    }

    if (!pending) {
      continue;
    }

    const metadataMatch = lines[index].match(/^Metadata:\s+(.+)$/);
    if (metadataMatch) {
      pending.metadata = metadataMatch[1].trim();
      continue;
    }

    if (lines[index].trim() !== "Prompt:") {
      continue;
    }

    let cursor = index + 1;
    while (cursor < lines.length && !lines[cursor].trim().startsWith("```")) {
      cursor += 1;
    }

    if (cursor >= lines.length) {
      continue;
    }

    cursor += 1;
    const promptLines = [];
    while (cursor < lines.length && !lines[cursor].trim().startsWith("```")) {
      promptLines.push(lines[cursor]);
      cursor += 1;
    }

    pending.prompt = promptLines.join("\n").trim();
    if (pending.fileName.startsWith("item_") && pending.prompt) {
      pending.prompt = stripCommonPromptSuffix(pending.prompt);
      entries.push(pending);
    }

    pending = null;
    index = cursor;
  }

  return entries;
}

function renderEntries(title, description, entries) {
  const body = entries.map(entry => {
    const heading = entry.heading || entry.fileName.replace(/^item_/, "").replace(/\.png$/, "");
    const metadata = entry.metadata ? `\nMetadata: ${entry.metadata}\n` : "";

    return `#### ${heading}

Archivo sugerido: \`${entry.fileName}\`
${metadata}
Prompt:

\`\`\`text
${entry.prompt}
\`\`\``;
  }).join("\n\n");

  return `# ${title}

Fuente: \`${SOURCE_FILE}\`

${description}

Las reglas globales no estan duplicadas aca. El runner agrega \`global-item-rules.md\` a cada prompt antes de llamar a la API.

${body}
`;
}

const globalRules = `# Global item image rules

Use these rules for every Forge Light item asset request.

Generate a single inventory equipment item only. The item must be centered in a three-quarter product-view angle with a strong readable silhouette for mobile UI. Keep the style premium dark fantasy, painterly-realistic, lively crafted look inspired by ornate forge/crafting UI, high contrast, crisp edges, controlled glow, bronze-gold rim light, and material detail compatible with Forge Light.

Export as a 1024x1024 PNG with real alpha transparency. The background must be actually transparent pixels around the item. Do not draw a checkerboard, white, gray, black, paper, canvas, room, floor, glow plate, square card, inventory slot, frame, border, or shadow outside the item silhouette. If a preview UI shows a checkerboard, that is acceptable only as a transparency preview, but the checkerboard must not be rendered into the image itself.

Avoid UI, text, letters, numbers, logo, watermark, environment scene, table, floor, huge cast shadow, cropped item, multiple items, hand holding item, character wearing item, blurry rendering, low contrast, cartoon, chibi, anime, and flat vector style.
`;

const readme = `# Item Asset Generation

Carpeta operativa para generar los 75 assets de items de Forge Light.

## Archivos

- \`global-item-rules.md\`: reglas comunes que el script agrega a cada prompt.
- \`items-pilot-8.md\`: tanda piloto representativa para validar estilo y referencia.
- \`items-remaining-67.md\`: el resto de los items despues del piloto.
- \`items-all.md\`: los 75 prompts en un solo archivo.
- \`reference/\`: pega aca tu imagen de referencia, idealmente como \`item_style_reference.png\`.

## Comandos

\`\`\`bash
export OPENAI_API_KEY="tu_api_key"

npm run assets:items:pilot -- --dry-run
npm run assets:items:pilot -- --reference uirefactor/asset-generation/reference/item_style_reference.png
npm run assets:items:remaining -- --reference uirefactor/asset-generation/reference/item_style_reference.png
\`\`\`

Por defecto los PNG se guardan en \`public/assets/items/\`. Si un archivo ya existe, el script lo saltea. Para regenerarlo, agrega \`--force\`.

## Flujo recomendado

Primero corre el piloto de 8 items con \`quality medium\`. Si el estilo funciona, corre los 67 restantes. Usa \`--quality high\` solo para rehacer assets clave.
`;

const referenceReadme = `# Reference Image

Put your approved style reference image in this folder.

Recommended file name:

\`\`\`text
item_style_reference.png
\`\`\`

Then pass it to the generator with:

\`\`\`bash
npm run assets:items:pilot -- --reference uirefactor/asset-generation/reference/item_style_reference.png
\`\`\`
`;

async function main() {
  const sourcePath = path.resolve(SOURCE_FILE);
  const outputDir = path.resolve(OUTPUT_DIR);
  const markdown = await readFile(sourcePath, "utf8");
  const entries = parseEntries(markdown);

  if (entries.length !== 75) {
    throw new Error(`Expected 75 item prompts, found ${entries.length}.`);
  }

  const pilot = entries.filter(entry => PILOT_FILES.has(entry.fileName));
  const remaining = entries.filter(entry => !PILOT_FILES.has(entry.fileName));

  if (pilot.length !== 8 || remaining.length !== 67) {
    throw new Error(`Expected split 8/67, got ${pilot.length}/${remaining.length}.`);
  }

  await mkdir(path.join(outputDir, "reference"), { recursive: true });
  await writeFile(path.join(outputDir, "global-item-rules.md"), globalRules);
  await writeFile(path.join(outputDir, "README.md"), readme);
  await writeFile(path.join(outputDir, "reference", "README.md"), referenceReadme);
  await writeFile(
    path.join(outputDir, "items-pilot-8.md"),
    renderEntries("Forge Light item prompts - pilot 8", "Tanda piloto para validar consistencia con la imagen de referencia antes de generar todo el set.", pilot),
  );
  await writeFile(
    path.join(outputDir, "items-remaining-67.md"),
    renderEntries("Forge Light item prompts - remaining 67", "Resto de los items despues de aprobar la tanda piloto.", remaining),
  );
  await writeFile(
    path.join(outputDir, "items-all.md"),
    renderEntries("Forge Light item prompts - all 75", "Set completo de prompts individuales de items.", entries),
  );

  process.stdout.write(`Wrote ${pilot.length} pilot prompts and ${remaining.length} remaining prompts to ${OUTPUT_DIR}.\n`);
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
