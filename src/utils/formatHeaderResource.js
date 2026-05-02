export function formatHeaderResource(value) {
  if (typeof value !== "number") return value;
  const floored = Math.floor(value);
  const absValue = Math.abs(floored);
  if (absValue < 1000) return floored.toLocaleString();

  const units = [
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "k" },
  ];

  let unitIndex = units.findIndex(entry => absValue >= entry.threshold);
  if (unitIndex === -1) unitIndex = units.length - 1;

  let unit = units[unitIndex];
  let compactValue = Math.floor((absValue / unit.threshold) * 10) / 10;
  if (compactValue >= 999.9 && unitIndex > 0) {
    unit = units[unitIndex - 1];
    compactValue = 1.0;
  }

  const signedValue = floored < 0 ? -compactValue : compactValue;
  return `${signedValue.toFixed(1)}${unit.suffix}`;
}

