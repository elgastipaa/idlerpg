import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const OUT_DIR = "uirefactor/asset-generation/icons";

const ICONS = [
  ["combat", "Combat", "crossed damaged sword and spell spark, red battle glow", "navigation"],
  ["hero", "Hero", "helmeted adventurer bust silhouette with bronze rim light", "navigation"],
  ["inventory", "Inventory", "open leather backpack with item glow", "navigation"],
  ["sanctuary", "Sanctuary", "warm gothic refuge gate with candle light", "navigation"],
  ["talents", "Talents", "branching talent tree sigil with three lit nodes", "navigation"],
  ["echoes", "Echoes", "concentric echo rings around a small void star", "navigation"],
  ["codex", "Codex", "ancient book with blue rune clasp", "navigation"],
  ["achievements", "Achievements", "bronze laurel medal with gold spark", "navigation"],
  ["stats", "Stats", "engraved stat chart rune on dark slate", "navigation"],

  ["gold", "Gold", "stacked gold coins with warm shine", "resource"],
  ["essence", "Essence", "blue-violet liquid essence droplet in glass", "resource"],
  ["xp", "XP", "green-gold rising star shard", "resource"],
  ["level", "Level", "upward bronze chevron with radiant core", "resource"],
  ["luck", "Luck", "lucky four-point star over small amber charm", "resource"],
  ["loot", "Loot", "small treasure chest with rare glow", "resource"],
  ["relic_shard", "Relic Shard", "broken relic fragment with pale blue light", "resource"],
  ["abyss_key", "Abyss Key", "black key with violet void eye handle", "resource"],

  ["damage", "Damage", "heavy red blade impact slash", "offense"],
  ["attack_speed", "Attack Speed", "three quick bronze slash trails", "offense"],
  ["crit_chance", "Critical Chance", "needle point blade hitting a gold spark", "offense"],
  ["crit_damage", "Critical Damage", "shattered crimson gem pierced by a blade", "offense"],
  ["multi_hit", "Multi Hit", "stacked repeated strike arcs", "offense"],
  ["damage_on_kill", "Damage On Kill", "falling skull mark feeding a red blade", "offense"],
  ["fresh_target", "Fresh Target", "new target reticle with first-strike flare", "offense"],
  ["execute", "Execute", "downward execution axe over red crescent", "offense"],

  ["health", "Health", "guarded heart with green life glow", "defense"],
  ["defense", "Defense", "iron chestplate plate with bronze rivets", "defense"],
  ["regen", "Regeneration", "green pulse wrapping a cracked heart", "defense"],
  ["block", "Block", "raised shield catching a spark", "defense"],
  ["dodge", "Dodge", "ghosted sidestep silhouette with teal trail", "defense"],
  ["thorns", "Thorns", "thorned metal crown around a shield", "defense"],
  ["resistance", "Resistance", "stone ward rune resisting blue flame", "defense"],
  ["shield", "Shield", "transparent arcane barrier over armor", "defense"],

  ["rage", "Rage", "crimson flame inside cracked iron mask", "combat-status"],
  ["fortress", "Fortress", "tower shield rooted into dark stone", "combat-status"],
  ["momentum", "Momentum", "spinning bronze wheel with red motion streak", "combat-status"],
  ["combat_flow", "Combat Flow", "continuous red-gold loop around a blade", "combat-status"],
  ["flow", "Flow", "blue arc trail jumping between two targets", "combat-status"],
  ["volatile", "Volatile", "unstable prism flame split between violet and orange", "combat-status"],
  ["perfect_cast", "Perfect Cast", "clean arcane circle with exact central star", "combat-status"],
  ["time_loop", "Time Loop", "clock ring looping around a blue rune", "combat-status"],
  ["absolute_control", "Absolute Control", "locked blue target sigil with dark halo", "combat-status"],
  ["bleed", "Bleed", "blood drop split by a serrated blade", "combat-status"],
  ["poison", "Poison", "green vial smoke curling into a skull mark", "combat-status"],
  ["fracture", "Fracture", "cracked armor plate with red fault line", "combat-status"],
  ["void_fracture", "Void Fracture", "black-violet crack tearing through a pale sigil", "combat-status"],
  ["mark", "Mark", "glowing target brand burned into dark metal", "combat-status"],
  ["memory", "Memory", "blue ghost rune repeated in fading layers", "combat-status"],
  ["ramp", "Arcane Ramp", "ascending arcane steps with growing blue flame", "combat-status"],

  ["forge", "Forge", "anvil and hammer with cyan furnace spark", "sanctuary-action"],
  ["upgrade", "Upgrade", "upward gold arrow fused to a sharpened ingot", "sanctuary-action"],
  ["reroll", "Reroll", "two circling dice made of bronze and blue light", "sanctuary-action"],
  ["polish", "Polish", "bright file polishing a glowing blade edge", "sanctuary-action"],
  ["reforge", "Reforge", "broken blade welded by blue flame", "sanctuary-action"],
  ["ascend", "Ascend", "item shard rising through a gold halo", "sanctuary-action"],
  ["distillery", "Distillery", "glass alembic with violet potion steam", "sanctuary-action"],
  ["laboratory", "Laboratory", "alchemical flask with blue rune bubbles", "sanctuary-action"],
  ["library", "Library", "open tome with gold bookmark and rune glow", "sanctuary-action"],
  ["errands", "Errands", "sealed parchment contract with red wax", "sanctuary-action"],
  ["sigil_altar", "Sigil Altar", "stone altar holding a circular runic sigil", "sanctuary-action"],
  ["workshop", "Workshop", "small gear and chisel over dark workbench", "sanctuary-action"],
  ["relic_armory", "Relic Armory", "relic blade locked in a bronze display", "sanctuary-action"],
  ["locked", "Locked", "heavy black lock with dim blue keyhole", "sanctuary-action"],
  ["claim", "Claim", "open hand receiving a gold-blue reward spark", "sanctuary-action"],
];

function entry([id, name, motif, category]) {
  return [
    `#### ${id} - ${name}`,
    "",
    `Archivo sugerido: \`icon_${id}.png\``,
    "",
    `Metadata: category \`${category}\``,
    "",
    "Prompt:",
    "",
    "```text",
    [
      "Dark fantasy RPG square system icon for Forge Light.",
      `Icon: ${name}.`,
      `Visual motif: ${motif}.`,
      `Category: ${category}.`,
      "Single centered symbol, transparent background, no text, no letters, no numbers, no UI frame, readable at 24px and 32px, premium painterly game icon, bronze-black Forge Light material style, controlled glow.",
    ].join(" "),
    "```",
    "",
  ].join("\n");
}

function buildGlobalRules() {
  return [
    "# Global system icon rules",
    "",
    "Use these rules for every resource, stat, status, navigation and action icon.",
    "",
    "- Square RPG icon asset, transparent background.",
    "- No text, no letters, no numbers, no watermark.",
    "- No UI frame, badge, border, button, cursor or screenshot crop.",
    "- Single centered symbol with strong silhouette at 24px and 32px.",
    "- Premium painterly dark fantasy icon-sheet style, compatible with `uirefactor/Iconos SVG.png`.",
    "- Use bronze, black iron, gold, cyan, red, green or violet accents as indicated by the individual prompt.",
    "- Keep glow readable but contained; avoid giant bloom and noisy particles.",
    "- Avoid flat vector, emoji, photorealistic object render and cartoon style.",
    "",
  ].join("\n");
}

function buildMarkdown() {
  return [
    "# Forge Light core system icon prompts",
    "",
    "Core raster icon bank for UI/navigation/resources/stats/statuses/Sanctuary actions.",
    "Use `uirefactor/Iconos SVG.png` as optional reference when generating.",
    "",
    ...ICONS.map(entry),
  ].join("\n");
}

async function main() {
  await mkdir(path.resolve(OUT_DIR), { recursive: true });
  await Promise.all([
    writeFile(path.resolve(OUT_DIR, "global-system-icon-rules.md"), buildGlobalRules(), "utf8"),
    writeFile(path.resolve(OUT_DIR, "system-icons-core.md"), buildMarkdown(), "utf8"),
  ]);
  process.stdout.write(`Wrote ${ICONS.length} system icon prompt(s) to ${OUT_DIR}\n`);
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
