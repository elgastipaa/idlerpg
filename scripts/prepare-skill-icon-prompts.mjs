import path from "node:path";
import vm from "node:vm";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const OUT_DIR = "uirefactor/asset-generation/skills";

async function evaluateDataModule(filePath, exportNames, deps = {}) {
  const absolutePath = path.resolve(filePath);
  let code = await readFile(absolutePath, "utf8");

  code = code.replace(
    /import\s+\{\s*([^}]+?)\s*\}\s+from\s+["'][^"']+["'];?/g,
    (_match, names) => `const { ${names.trim()} } = globalThis.__deps;`,
  );
  code = code.replace(/\bexport\s+const\s+/g, "const ");
  code += `\nglobalThis.__moduleExports = { ${exportNames.join(", ")} };\n`;

  const context = vm.createContext({
    console,
    globalThis: {
      __deps: deps,
      __moduleExports: {},
    },
  });

  const script = new vm.Script(code, { filename: absolutePath });
  script.runInContext(context);
  return context.globalThis.__moduleExports;
}

function normalizeId(id) {
  return id.replace(/_1$/, "");
}

function collapseTreeTalentId(talentId) {
  return talentId.replace(/_\d+$/, "");
}

function toTitle(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function compactText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/`/g, "'")
    .trim();
}

function paletteForTalent(tree) {
  if (tree.specId === "berserker") return "crimson, black iron, ember orange, bruised leather";
  if (tree.specId === "juggernaut") return "dark iron, stone gray, deep teal, muted green";
  if (tree.specId === "sorcerer") return "violet, hot magenta, prism blue, ember orange";
  if (tree.specId === "arcanist") return "deep blue, cyan runes, silver, controlled violet";
  if (tree.classId === "warrior") return "red, iron, bronze, warm gold";
  if (tree.classId === "mage") return "violet, arcane blue, pale gold, blackened silver";
  return "bronze, blue, violet, dark iron";
}

function paletteForBranch(branchId) {
  const palettes = {
    war: "red, gold, iron, black leather",
    bulwark: "teal, green, dark iron, stone gray",
    fortune: "warm gold, amber, coin brass, ivory glow",
    sorcery: "violet, magenta, prism blue, ember orange",
    dominion: "cyan, deep blue, silver, controlled violet",
    forge: "cyan, bronze, steel, furnace orange",
    abismo: "black violet, slate gray, cold blue, pale void light",
  };
  return palettes[branchId] || "bronze, blue, violet, dark iron";
}

function segmentMood(segment) {
  if (segment === "keystone") return "large central emblem, heavier silhouette, rare-node intensity";
  if (segment === "gameplay") return "dynamic readable symbol, active-combat energy";
  if (segment === "basic") return "clean foundational emblem, simple strong silhouette";
  return "mastery node emblem, infinite progression feeling, compact repeating motif";
}

function pickMotifs(text) {
  const source = text.toLowerCase();
  const motifs = [];

  const rules = [
    [/blood|sang|bleed|leech|rage|fren/i, "blood drop, torn blade edge, crimson slash"],
    [/crit|precision|precis|filo|blade|corte/i, "needle-sharp blade spark, golden edge, focused strike"],
    [/defense|defensa|armor|armadura|iron|hierro|bastion|shield|escudo|block/i, "iron shield plate, anvil mark, defensive rim"],
    [/life|vida|regen|heal|cur/i, "green life pulse, guarded heart, restoring glow"],
    [/speed|velocidad|flow|ritmo|multi|chain|cadena/i, "flowing arc trails, linked rings, quick motion streak"],
    [/fire|flame|burn|ember|fuego|cataclysm|volatil/i, "volatile flame core, cracked prism, ember burst"],
    [/arcane|spell|hechizo|runa|sigil|marca|mark|control|dominio/i, "arcane rune circle, blue-violet glyph, controlled spell lattice"],
    [/void|abismo|abyss|vacio|anom/i, "black void eye, dark halo, cold violet fracture"],
    [/gold|oro|xp|loot|botin|luck|fortuna|essence|esencia/i, "gold coin spark, essence droplet, lucky star glint"],
    [/forge|forja|upgrade|reroll|pulido|reforja|ascend|yunque/i, "small anvil, hammer spark, blue forge flame"],
    [/thorn|spike|espina|represalia/i, "thorned metal crown, spiked shield, retaliating edge"],
  ];

  for (const [pattern, motif] of rules) {
    if (pattern.test(source)) {
      motifs.push(motif);
    }
  }

  return motifs.slice(0, 3).join("; ") || "abstract power sigil tied to the talent fantasy";
}

function writePromptEntry({ id, name, fileName, metadata, prompt }) {
  return [
    `#### ${id} - ${name}`,
    "",
    `Archivo sugerido: \`${fileName}\``,
    "",
    `Metadata: ${metadata}`,
    "",
    "Prompt:",
    "",
    "```text",
    prompt,
    "```",
    "",
  ].join("\n");
}

function buildTalentPrompt({ talent, tree, segment }) {
  const text = compactText(`${talent.name} ${talent.description} ${talent.id}`);
  const motifs = pickMotifs(text);
  return [
    "Dark fantasy RPG square skill icon for Forge Light.",
    `Talent: ${compactText(talent.name)}.`,
    `Concept: ${compactText(talent.description)}`,
    `Visual motif: ${motifs}.`,
    `Tree identity: ${compactText(tree.name)} (${tree.specId || tree.classId}).`,
    `Node tier feel: ${segmentMood(segment)}.`,
    `Palette: ${paletteForTalent(tree)}.`,
    "Single centered symbolic icon, transparent background, no text, no letters, no numbers, no UI frame, readable at 32px, premium painterly game icon.",
  ].join(" ");
}

function buildEchoPrompt({ node, branch }) {
  const text = compactText(`${node.name} ${node.description} ${node.id} ${branch.name}`);
  const motifs = pickMotifs(text);
  const capstoneText = node.capstone ? "capstone apex node, more ornate and powerful" : `tier ${node.tier} echo node`;
  return [
    "Dark fantasy RPG square Echo tree icon for Forge Light.",
    `Echo node: ${compactText(node.name)}.`,
    `Concept: ${compactText(node.description)}`,
    `Branch: ${compactText(branch.name)} (${compactText(branch.description)}).`,
    `Visual motif: ${motifs}.`,
    `Progression feel: ${capstoneText}.`,
    `Palette: ${paletteForBranch(node.branch)}.`,
    "Single centered symbolic icon, transparent background, no text, no letters, no numbers, no UI frame, readable at 32px, premium painterly game icon.",
  ].join(" ");
}

function buildGlobalRules() {
  return [
    "# Global skill and echo icon rules",
    "",
    "Use these rules for every class talent, skill and Echo icon.",
    "",
    "- Square RPG icon asset, transparent background.",
    "- No text, no letters, no numbers, no watermark.",
    "- No UI frame, border, badge, button, tooltip, cursor or screenshot crop.",
    "- Single centered readable symbol with strong silhouette at 32px.",
    "- Premium dark fantasy painterly style, matching Forge Light's bronze/black UI and rich icon-sheet finish.",
    "- High contrast core shape, controlled glow, restrained particles.",
    "- Keep the icon contained inside the square with generous breathing room.",
    "- Use branch/class palette from the individual prompt but keep material language consistent: metal, rune light, glass, flame, cloth, bone, stone.",
    "- Avoid photorealism, anime, flat vector, emoji, childish style and pure monochrome.",
    "",
  ].join("\n");
}

async function loadGameData() {
  const sinks = await evaluateDataModule(
    "src/data/talentSinks.js",
    ["TALENT_SINK_TALENTS", "TALENT_SINK_NODES"],
  );
  const treeData = await evaluateDataModule(
    "src/data/talentTree.js",
    ["TALENT_TREES"],
    { TALENT_SINK_NODES: sinks.TALENT_SINK_NODES },
  );
  const talentData = await evaluateDataModule(
    "src/data/talents.js",
    ["TALENTS"],
    { TALENT_SINK_TALENTS: sinks.TALENT_SINK_TALENTS },
  );
  const prestigeData = await evaluateDataModule(
    "src/data/prestige.js",
    ["PRESTIGE_BRANCHES", "PRESTIGE_TREE_NODES"],
  );

  return {
    ...treeData,
    ...talentData,
    ...prestigeData,
  };
}

function buildClassTalentMarkdown({ TALENT_TREES, TALENTS }) {
  const talentsById = new Map(TALENTS.map(talent => [talent.id, talent]));
  const seen = new Set();
  const entries = [];

  for (const tree of TALENT_TREES) {
    for (const node of tree.nodes) {
      const collapsedId = collapseTreeTalentId(node.talentId);
      if (seen.has(`${tree.id}:${collapsedId}`)) {
        continue;
      }

      const sourceTalent = talentsById.get(node.talentId)
        || talentsById.get(`${collapsedId}_1`)
        || talentsById.get(collapsedId);
      if (!sourceTalent) {
        continue;
      }

      seen.add(`${tree.id}:${collapsedId}`);
      const id = normalizeId(collapsedId);
      entries.push(writePromptEntry({
        id,
        name: compactText(sourceTalent.name || toTitle(id)),
        fileName: `skill_${id}.png`,
        metadata: `class \`${tree.classId}\` / spec \`${tree.specId || "base"}\` / tree \`${tree.id}\` / segment \`${node.segment || "sink"}\``,
        prompt: buildTalentPrompt({
          talent: { ...sourceTalent, id },
          tree,
          segment: node.segment || "sink",
        }),
      }));
    }
  }

  return [
    "# Forge Light class talent skill icon prompts",
    "",
    "Generated from `src/data/talentTree.js`, `src/data/talents.js` and `src/data/talentSinks.js`.",
    "One icon is generated per conceptual visible talent. Repeating sink levels collapse into a single mastery icon.",
    "",
    ...entries,
  ].join("\n");
}

function buildEchoMarkdown({ PRESTIGE_BRANCHES, PRESTIGE_TREE_NODES }) {
  const branchesById = new Map(PRESTIGE_BRANCHES.map(branch => [branch.id, branch]));
  const entries = PRESTIGE_TREE_NODES.map(node => {
    const branch = branchesById.get(node.branch) || {
      id: node.branch,
      name: toTitle(node.branch),
      description: "",
    };

    return writePromptEntry({
      id: node.id,
      name: compactText(node.name || toTitle(node.id)),
      fileName: `echo_${node.id}.png`,
      metadata: `branch \`${node.branch}\` / tier \`${node.tier}\` / maxLevel \`${node.maxLevel}\`${node.capstone ? " / capstone" : ""}`,
      prompt: buildEchoPrompt({ node, branch }),
    });
  });

  return [
    "# Forge Light Echo tree icon prompts",
    "",
    "Generated from `src/data/prestige.js`.",
    "",
    ...entries,
  ].join("\n");
}

async function main() {
  const data = await loadGameData();
  await mkdir(path.resolve(OUT_DIR), { recursive: true });

  const outputs = [
    ["global-skill-icon-rules.md", buildGlobalRules()],
    ["class-talents.md", buildClassTalentMarkdown(data)],
    ["echo-tree.md", buildEchoMarkdown(data)],
  ];

  await Promise.all(
    outputs.map(([fileName, contents]) => writeFile(path.resolve(OUT_DIR, fileName), contents, "utf8")),
  );

  process.stdout.write(`Wrote ${outputs.length} file(s) to ${OUT_DIR}\n`);
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
