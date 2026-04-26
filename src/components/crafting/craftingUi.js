import { ITEM_STAT_LABELS as STAT_LABELS } from "../../utils/itemPresentation";

export const FORGE_MODE_TOOLTIPS = {
  upgrade: {
    tone: "upgrade",
    text: "Mejorar sube +1 el item hasta +15. No falla ni degrada.",
  },
  polish: {
    tone: "polish",
    text: "Afinar ajusta solo el valor de una linea. No cambia su stat ni su calidad.",
  },
  reforge: {
    tone: "reforge",
    text: "Reforjar reemplaza una linea: mantener actual + 2 opciones nuevas.",
  },
  ascend: {
    tone: "ascend",
    text: "Imbuir convierte Epic en Legendary y puede injertar un poder desbloqueado.",
  },
  extract: {
    tone: "extract",
    text: "Extraccion de Santuario: convierte piezas no equipadas en esencia para seguir forjando.",
  },
};

export const FORGE_MODE_ORDER = ["upgrade", "polish", "reforge", "ascend", "extract"];
export const RUN_MODE_ORDER = ["extract"];

export const FORGE_MODE_META = {
  upgrade: { label: "Mejorar", short: "UP", color: "var(--tone-warning, #f59e0b)", cta: "MEJORAR ITEM" },
  polish: { label: "Afinar", short: "AF", color: "var(--tone-info, #0ea5e9)", cta: "AFINAR LINEA" },
  reforge: { label: "Reforjar", short: "RF", color: "var(--tone-violet, #7c3aed)", cta: "PAGAR REFORJA" },
  ascend: { label: "Imbuir", short: "IM", color: "var(--tone-accent, #3b82f6)", cta: "IMBUIR ITEM" },
  extract: { label: "Extraer", short: "EX", color: "var(--tone-danger, #ef4444)", cta: "EXTRAER ITEM" },
};

export function getHighlightStyle(tone) {
  const palette = {
    legendary: { bg: "var(--tone-warning-soft, #fff7ed)", color: "var(--tone-danger, #c2410c)", border: "var(--tone-warning, #fdba74)" },
    epic: { bg: "var(--tone-violet-soft, #faf5ff)", color: "var(--tone-violet, #7c3aed)", border: "var(--tone-accent, #c4b5fd)" },
    excellent: { bg: "var(--tone-warning-soft, #fefce8)", color: "#a16207", border: "var(--tone-warning, #fde68a)" },
    perfect: { bg: "var(--tone-warning-soft, #fefce8)", color: "#a16207", border: "var(--tone-warning, #fde68a)" },
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
  if ((costs.entropy || 0) > 0) parts.push(`Ent ${costs.entropy.toLocaleString()}`);
  return parts.length > 0 ? parts.join(" · ") : "GRATIS";
}

export function getCraftActionHint(req = {}, mode) {
  if (!req) return "";
  if (req.reason === "ok") {
    if (req.maxUses != null) {
      return `Usos ${Math.round(req.usedUses || 0)} / ${Math.round(req.maxUses || 0)}.`;
    }
    return "";
  }

  switch (req.reason) {
    case "gold":
      return "Falta oro para esta accion.";
    case "essence":
      return "Falta esencia para esta accion.";
    case "missing_affix":
      return mode === "polish" ? "Elegi una linea antes de afinar." : "Elegi una linea antes de reforjar.";
    case "focused_line":
      return "La pieza ya quedo fijada a otra linea.";
    case "limit":
      return `Limite alcanzado: ${Math.round(req.usedUses || 0)} / ${Math.round(req.maxUses || 0)} usos.`;
    case "stabilized":
      return "La pieza ya esta estabilizada.";
    case "deprecated":
      return "Esta accion fue retirada.";
    case "min_level":
      return `Requiere upgrade +${req.minLevel || 0} antes de imbuir.`;
    case "epic_only":
      return "Imbuir solo aplica sobre piezas Epic.";
    case "max_rarity":
      return "La pieza ya esta en rareza maxima.";
    case "max_level":
      return `La pieza ya llego a +${req.maxLevel || 15}.`;
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
    case "limit":
      return `${Math.round(req.usedUses || 0)}/${Math.round(req.maxUses || 0)}`;
    case "stabilized":
      return "ESTABLE";
    case "deprecated":
      return "RETIRADO";
    case "min_level":
      return `REQ +${req.minLevel || 0}`;
    case "epic_only":
      return "SOLO EPIC";
    case "max_rarity":
      return "LEGENDARY";
    case "max_level":
      return `+${req.maxLevel || 15}`;
    default:
      return "BLOQUEADO";
  }
}

export function formatRecommendationAffix(affix) {
  if (!affix) return "";
  return `${STAT_LABELS[affix.stat] || affix.stat}${affix?.quality === "excellent" ? " · Excelente" : ""}`;
}
