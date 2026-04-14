import { ITEM_STAT_LABELS as STAT_LABELS } from "../../utils/itemPresentation";

export const FORGE_MODE_TOOLTIPS = {
  upgrade: {
    tone: "upgrade",
    text: "Upgrade sube el +N del item. Puede fallar y bajar un nivel, asi que conviene mirar el riesgo antes de insistir.",
  },
  reroll: {
    tone: "reroll",
    text: "Reroll rehace todas las lineas del item. Sirve para rescatar bases prometedoras, no para cerrar una pieza final.",
  },
  polish: {
    tone: "polish",
    text: "Pulir ajusta solo el valor de una linea. No fija la pieza a esa linea.",
  },
  reforge: {
    tone: "reforge",
    text: "Reforge cambia una sola linea. La pieza queda enfocada en esa linea para perseguir una version casi perfecta.",
  },
  ascend: {
    tone: "ascend",
    text: "Ascender eleva la rareza sin perder sus lineas ni la linea trabajada. Si salta a legendario, puede injertar un poder ya descubierto en Codex.",
  },
  extract: {
    tone: "extract",
    text: "Extraer rompe items para convertirlos en esencia.",
  },
};

export const FORGE_MODE_ORDER = ["upgrade", "reroll", "polish", "reforge", "ascend", "extract"];

export const FORGE_MODE_META = {
  upgrade: { label: "Upgrade", short: "UP", color: "var(--tone-success, #1D9E75)", cta: "APLICAR UPGRADE" },
  reroll: { label: "Reroll", short: "RE", color: "var(--tone-success, #1D9E75)", cta: "APLICAR REROLL" },
  polish: { label: "Pulir", short: "PO", color: "var(--tone-info, #0ea5e9)", cta: "PULIR LINEA" },
  reforge: { label: "Reforge", short: "RF", color: "var(--tone-violet, #7c3aed)", cta: "PAGAR REFORJA" },
  ascend: { label: "Ascender", short: "AS", color: "var(--tone-accent, #3b82f6)", cta: "ASCENDER ITEM" },
  extract: { label: "Extraer", short: "EX", color: "var(--tone-danger, #ef4444)", cta: "EXTRAER ITEM" },
};

export function getItemIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("espada") || n.includes("daga") || n.includes("hacha") || n.includes("maza")) return "WP";
  if (n.includes("arco") || n.includes("ballesta")) return "BW";
  if (n.includes("baston") || n.includes("cetro")) return "ST";
  if (n.includes("escudo")) return "SH";
  if (n.includes("tunica") || n.includes("armadura") || n.includes("cuero") || n.includes("cota")) return "AR";
  return "IT";
}

export function getHighlightStyle(tone) {
  const palette = {
    legendary: { bg: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-danger, #c2410c)", border: "var(--tone-warning, #fdba74)" },
    epic: { bg: "var(--tone-violet-soft, #faf5ff)", color: "var(--tone-violet, #7c3aed)", border: "var(--tone-accent, #c4b5fd)" },
    perfect: { bg: "var(--tone-warning-soft, #fefce8)", color: "#a16207", border: "var(--tone-warning, #fde68a)" },
    t1: { bg: "var(--tone-info-soft, #eff6ff)", color: "var(--tone-info, #1d4ed8)", border: "var(--tone-info, #93c5fd)" },
    upgrade: { bg: "var(--tone-success-soft, #ecfdf5)", color: "var(--tone-success-strong, #047857)", border: "var(--tone-success, #86efac)" },
    build: { bg: "var(--tone-info-soft, #f0f9ff)", color: "var(--tone-info, #0369a1)", border: "var(--tone-info, #7dd3fc)" },
    offense: { bg: "var(--tone-danger-soft, #fff1f2)", color: "var(--tone-danger-strong, #be123c)", border: "var(--tone-danger, #fda4af)" },
    wishlist: { bg: "var(--tone-success-soft, #ecfeff)", color: "var(--tone-success-strong, #0f766e)", border: "var(--tone-success, #99f6e4)" },
    masterwork: { bg: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-danger, #9a3412)", border: "var(--tone-warning, #fdba74)" },
    forged: { bg: "var(--tone-accent-soft, #eef2ff)", color: "var(--tone-accent, #4338ca)", border: "var(--tone-accent, #a5b4fc)" },
    crafted: { bg: "var(--tone-neutral-soft, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "var(--color-border-tertiary, #cbd5e1)" },
  };
  return palette[tone] || { bg: "var(--tone-neutral-soft, #f8fafc)", color: "var(--color-text-secondary, #475569)", border: "var(--color-border-tertiary, #cbd5e1)" };
}

export function formatCraftCostLabel(costs = {}) {
  const parts = [];
  if ((costs.gold || 0) > 0) parts.push(`G ${costs.gold.toLocaleString()}`);
  if ((costs.essence || 0) > 0) parts.push(`E ${costs.essence.toLocaleString()}`);
  return parts.length > 0 ? parts.join(" · ") : "GRATIS";
}

export function getCraftActionHint(req = {}, mode) {
  if (!req) return "";
  if (req.reason === "ok") {
    if (req.requiredPotential > 0) {
      return `Potencial ${Math.round(req.forgingPotential || 0)}% / ${Math.round(req.requiredPotential || 0)}%.`;
    }
    return "";
  }

  switch (req.reason) {
    case "gold":
      return "Falta oro para esta accion.";
    case "essence":
      return "Falta esencia para esta accion.";
    case "missing_affix":
      return mode === "polish" ? "Elegi una linea antes de pulir." : "Elegi una linea antes de reforjar.";
    case "focused_line":
      return "La pieza ya quedo fijada a otra linea.";
    case "potential":
      return `Potencial insuficiente: ${Math.round(req.forgingPotential || 0)}% / ${Math.round(req.requiredPotential || 0)}%.`;
    case "min_level":
      return `Requiere upgrade +${req.minLevel || 0} antes de ascender.`;
    case "max_rarity":
      return "La pieza ya esta en rareza maxima.";
    case "max_level":
      return "La pieza ya llego a +10.";
    default:
      return "";
  }
}

export function getCraftActionBadge(req = {}, mode) {
  if (!req) return "N/A";
  if (req.can) return formatCraftCostLabel(req.costs);

  switch (req.reason) {
    case "gold":
      return "FALTA ORO";
    case "essence":
      return "FALTA ESENCIA";
    case "missing_affix":
      return "ELEGI LINEA";
    case "focused_line":
      return "LINEA FIJADA";
    case "potential":
      return `POT ${Math.round(req.forgingPotential || 0)}/${Math.round(req.requiredPotential || 0)}`;
    case "min_level":
      return `REQ +${req.minLevel || 0}`;
    case "max_rarity":
      return "LEGENDARY";
    case "max_level":
      return "MAX";
    default:
      return "BLOQUEADO";
  }
}

export function formatRecommendationAffix(affix) {
  if (!affix) return "";
  return `${STAT_LABELS[affix.stat] || affix.stat} (T${affix.tier || "?"})`;
}
