function formatPercent(value, digits = 1) {
  const numeric = Number(value || 0) * 100;
  const rounded = Math.round(numeric * Math.pow(10, digits)) / Math.pow(10, digits);
  return `${rounded}%`;
}

function formatRange(minValue = 1, maxValue = 1) {
  return `${Math.round((minValue || 1) * 100)}-${Math.round((maxValue || 1) * 100)}%`;
}

function buildEntry(key, label, value, shouldShow = true) {
  if (!shouldShow) return null;
  return { key, label, value };
}

export function getClassBuildStatGroups(classId, stats = {}) {
  const warriorGroups = [
    {
      id: "tempo",
      label: "Ritmo ofensivo",
      description: "Que tan rapido conviertes cada ventana en dano real.",
      entries: [
        buildEntry("attackSpeed", "Velocidad", formatPercent(stats.attackSpeed || 0), (stats.attackSpeed || 0) > 0),
        buildEntry("multiHitChance", "Multi-hit", formatPercent(stats.multiHitChance || 0), (stats.multiHitChance || 0) > 0),
        buildEntry("critDamage", "Dano critico", formatPercent(stats.critDamage || 0), (stats.critDamage || 0) > 0),
      ].filter(Boolean),
    },
    {
      id: "pressure",
      label: "Presion",
      description: "Cuanto castigas al objetivo cuando el intercambio se estira.",
      entries: [
        buildEntry("fractureChance", "Fractura", formatPercent(stats.fractureChance || 0), (stats.fractureChance || 0) > 0),
        buildEntry("bleedChance", "Sangrado", formatPercent(stats.bleedChance || 0), (stats.bleedChance || 0) > 0),
        buildEntry("bleedDamage", "Poder de sangrado", formatPercent(stats.bleedDamage || 0), (stats.bleedDamage || 0) > 0),
      ].filter(Boolean),
    },
    {
      id: "aguante",
      label: "Aguante",
      description: "Lo que te deja sostener la run mientras sigues pegando.",
      entries: [
        buildEntry("lifesteal", "Robo de vida", formatPercent(stats.lifesteal || 0), (stats.lifesteal || 0) > 0),
        buildEntry("blockChance", "Bloqueo", formatPercent(stats.blockChance || 0), (stats.blockChance || 0) > 0),
        buildEntry("thorns", "Espinas", Math.round(stats.thorns || 0).toLocaleString(), (stats.thorns || 0) > 0),
      ].filter(Boolean),
    },
  ];

  const mageGroups = [
    {
      id: "tempo",
      label: "Ritmo",
      description: "La base del ciclo: range roll, multi-hit y empuje heredado.",
      entries: [
        buildEntry("multiHitChance", "Multi-hit", formatPercent(stats.multiHitChance || 0), (stats.multiHitChance || 0) > 0),
        buildEntry("damageRange", "Rango de dano", formatRange(stats.damageRangeMin, stats.damageRangeMax), true),
        buildEntry("flowBonusMult", "Flow base", formatPercent(Math.max(0, (stats.flowBonusMult || 1) - 1)), (stats.flowBonusMult || 1) > 1),
      ].filter(Boolean),
    },
    {
      id: "setup",
      label: "Setup",
      description: "Que tan facil preparas al objetivo para el siguiente pico.",
      entries: [
        buildEntry("markChance", "Marca", formatPercent(stats.markChance || 0), (stats.markChance || 0) > 0),
        buildEntry("markEffectPerStack", "Potencia de marca", formatPercent(stats.markEffectPerStack || 0), (stats.markEffectPerStack || 0) > 0),
        buildEntry("markTransferPct", "Transferencia", formatPercent(stats.markTransferPct || 0), (stats.markTransferPct || 0) > 0),
      ].filter(Boolean),
    },
    {
      id: "control",
      label: "Ejecucion",
      description: "Donde conviertes la preparacion en burst y consistencia.",
      entries: [
        buildEntry("freshTargetDamage", "Apertura", formatPercent(stats.freshTargetDamage || 0), (stats.freshTargetDamage || 0) > 0),
        buildEntry("controlMastery", "Control", formatPercent(stats.controlMastery || 0), (stats.controlMastery || 0) > 0),
        buildEntry("critDamage", "Dano critico", formatPercent(stats.critDamage || 0), (stats.critDamage || 0) > 0),
      ].filter(Boolean),
    },
  ];

  const groups = classId === "mage" ? mageGroups : warriorGroups;
  return groups.filter(group => group.entries.length > 0);
}
