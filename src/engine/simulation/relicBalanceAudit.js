import { ITEMS } from "../../data/items";
import { gameReducer } from "../../state/gameReducer";
import { createPostOnboardingSimulationState } from "../stateInitializer";
import {
  buildRelicFromItem,
  calculateRelicAttunementCost,
  calculateRelicAttunementEntropyGain,
  calculateRelicEntropyStabilizePlan,
  ensureValidActiveRelics,
  getRelicContextOptions,
  normalizeRelicRecord,
} from "../sanctuary/relicArmoryEngine";

const CONTEXT_TO_SIGIL = {
  boss: "ascend",
  horde: "dominion",
  farm: "forge",
  speed: "hunt",
  abyss: "ascend",
};
const CONTEXT_SCORE_WEIGHTS = {
  bossMechanicMitigation: 1.05,
  abyssBossMechanicMitigation: 1.05,
  goldPct: 0.85,
  xpPct: 0.85,
  lootBonus: 0.85,
  abyssEssenceMult: 0.85,
  defensePct: 0.9,
  essenceBonus: 0.45,
};
const CONTEXT_RATIO_MIN = 0.95;
const CONTEXT_RATIO_MAX = 2.1;

function toFixed(value = 0, decimals = 3) {
  return Number(Number(value || 0).toFixed(decimals));
}

function formatPercent(value = 0) {
  const numeric = Number(value || 0) * 100;
  const rounded = Math.abs(numeric) >= 10 ? numeric.toFixed(1) : numeric.toFixed(2);
  return `${rounded.replace(/\.0$/, "")}%`;
}

function buildStoredItemFromTemplate(template = {}, { idSuffix = "sim", itemTier = 8 } = {}) {
  return {
    id: `sim_${idSuffix}_${template.id}`,
    itemId: template.id,
    type: template.type,
    rarity: template.rarity || "magic",
    name: template.name,
    baseBonus: { ...(template.bonus || {}) },
    implicitBonus: {},
    affixes: [],
    itemTier: Math.max(1, Math.floor(Number(itemTier || 1))),
    level: 0,
    legendaryPowerId: template.legendaryPowerId || null,
  };
}

function getTemplateItems() {
  const weaponTemplate =
    ITEMS.find(item => item.type === "weapon" && item.rarity === "magic") ||
    ITEMS.find(item => item.type === "weapon");
  const armorTemplate =
    ITEMS.find(item => item.type === "armor" && item.rarity === "magic") ||
    ITEMS.find(item => item.type === "armor");
  if (!weaponTemplate || !armorTemplate) {
    throw new Error("No se pudieron resolver templates base para reliquias.");
  }
  return { weaponTemplate, armorTemplate };
}

function createRelicPair({ contextAttunement = "none", entropy = 0, now = 10_000_000 } = {}) {
  const { weaponTemplate, armorTemplate } = getTemplateItems();
  const weaponRelic = normalizeRelicRecord({
    ...buildRelicFromItem(
      buildStoredItemFromTemplate(weaponTemplate, { idSuffix: "weapon", itemTier: 9 }),
      { now, source: "balance_audit" }
    ),
    contextAttunement,
    entropy,
  });
  const armorRelic = normalizeRelicRecord({
    ...buildRelicFromItem(
      buildStoredItemFromTemplate(armorTemplate, { idSuffix: "armor", itemTier: 9 }),
      { now: now + 1, source: "balance_audit" }
    ),
    contextAttunement,
    entropy,
  });
  if (!weaponRelic || !armorRelic) {
    throw new Error("No se pudieron crear reliquias para auditoria.");
  }
  return {
    weaponRelic,
    armorRelic,
  };
}

function seedStateWithRelics({
  contextAttunement = "none",
  entropy = 0,
  sigilFlux = 500,
  relicDust = 500,
  abyssUnlocked = false,
} = {}) {
  const now = 20_000_000;
  const { weaponRelic, armorRelic } = createRelicPair({ contextAttunement, entropy, now });
  const relicArmory = [weaponRelic, armorRelic];
  const activeRelics = ensureValidActiveRelics(relicArmory, {
    weapon: weaponRelic.id,
    armor: armorRelic.id,
  });
  const seeded = createPostOnboardingSimulationState({
    classId: "warrior",
    specialization: "berserker",
    level: 16,
    gold: 9_000,
    essence: 3_500,
    currentTier: 12,
  });
  return {
    ...seeded,
    prestige: {
      ...seeded.prestige,
      level: Math.max(3, Number(seeded.prestige?.level || 0)),
      totalEchoesEarned: Math.max(18, Number(seeded.prestige?.totalEchoesEarned || 0)),
      bestHistoricTier: Math.max(12, Number(seeded.prestige?.bestHistoricTier || 0)),
    },
    abyss: {
      ...seeded.abyss,
      portalUnlocked: abyssUnlocked ? true : Boolean(seeded.abyss?.portalUnlocked),
      tier25BossCleared: abyssUnlocked ? true : Boolean(seeded.abyss?.tier25BossCleared),
      highestTierReached: abyssUnlocked
        ? Math.max(26, Number(seeded.abyss?.highestTierReached || 1))
        : Math.max(12, Number(seeded.abyss?.highestTierReached || 1)),
    },
    sanctuary: {
      ...seeded.sanctuary,
      relicArmory,
      activeRelics,
      resources: {
        ...(seeded.sanctuary?.resources || {}),
        sigilFlux: Math.max(0, Math.floor(Number(sigilFlux || 0))),
        relicDust: Math.max(0, Math.floor(Number(relicDust || 0))),
      },
    },
    expedition: {
      ...(seeded.expedition || {}),
      phase: "setup",
    },
    combat: {
      ...seeded.combat,
      pendingRunSetup: true,
      pendingRunSigilId: "free",
      pendingRunSigilIds: ["free"],
      activeRunSigilId: "free",
      activeRunSigilIds: ["free"],
      currentTier: 12,
      maxTier: 12,
    },
    currentTab: "combat",
  };
}

function startRunWithSigil(state, sigilId = "free") {
  let next = gameReducer(state, { type: "SELECT_RUN_SIGIL", sigilId });
  next = gameReducer(next, { type: "START_RUN", now: 30_000_000 });
  return next;
}

function readBonus(state, key) {
  return Number(state?.player?.runSigilBonuses?.[key] || 0);
}

function assertAlmostEqual(actual, expected, tolerance = 0.0001) {
  return Math.abs(Number(actual || 0) - Number(expected || 0)) <= tolerance;
}

function getContextScoreWeight(statKey = "") {
  return Number(CONTEXT_SCORE_WEIGHTS[statKey] || 1);
}

function scoreNumericMap(map = {}) {
  return Object.entries(map || {}).reduce((total, [statKey, rawValue]) => {
    const value = Math.abs(Number(rawValue || 0));
    if (!Number.isFinite(value) || value <= 0) return total;
    return total + value * getContextScoreWeight(statKey);
  }, 0);
}

function buildContextBalanceMatrix() {
  const rows = getRelicContextOptions({ includeNone: false }).map(profile => {
    const bonusScore = scoreNumericMap(profile?.bonuses || {});
    const defectScore = scoreNumericMap(profile?.defects || {});
    const ratio = defectScore > 0 ? bonusScore / defectScore : null;
    return {
      contextId: profile?.id || "none",
      label: profile?.label || profile?.id || "Contexto",
      bonusScore,
      defectScore,
      ratio,
    };
  });
  const ratioRows = rows.filter(row => Number.isFinite(row.ratio));
  const maxRatio = ratioRows.length > 0 ? Math.max(...ratioRows.map(row => Number(row.ratio || 0))) : null;
  const minRatio = ratioRows.length > 0 ? Math.min(...ratioRows.map(row => Number(row.ratio || 0))) : null;
  const bisRiskContexts = ratioRows.filter(row => Number(row.ratio || 0) > CONTEXT_RATIO_MAX);
  const underRewardContexts = ratioRows.filter(row => Number(row.ratio || 0) < CONTEXT_RATIO_MIN);
  return {
    rows,
    maxRatio,
    minRatio,
    bisRiskContexts,
    underRewardContexts,
  };
}

function runChecks() {
  const checks = [];

  const neutralRun = startRunWithSigil(seedStateWithRelics({ contextAttunement: "boss" }), "free");
  const neutralContext = neutralRun?.expedition?.activeRelicContext || "none";
  checks.push({
    id: "neutral-context",
    label: "Sigilo free mantiene contexto neutro (sin bonus/defecto de reliquias)",
    pass:
      neutralContext === "none" &&
      assertAlmostEqual(readBonus(neutralRun, "damagePct"), 0) &&
      assertAlmostEqual(readBonus(neutralRun, "attackSpeed"), 0),
    details: `contexto=${neutralContext}, damagePct=${toFixed(readBonus(neutralRun, "damagePct"))}, attackSpeed=${toFixed(readBonus(neutralRun, "attackSpeed"))}`,
  });

  const bossRun = startRunWithSigil(seedStateWithRelics({ contextAttunement: "boss" }), CONTEXT_TO_SIGIL.boss);
  checks.push({
    id: "boss-match",
    label: "Match boss aplica bonus agregado de 2 reliquias",
    pass:
      bossRun?.expedition?.activeRelicContext === "boss" &&
      assertAlmostEqual(readBonus(bossRun, "damagePct"), 0.24) &&
      assertAlmostEqual(readBonus(bossRun, "bossMechanicMitigation"), 0.16),
    details: `contexto=${bossRun?.expedition?.activeRelicContext || "-"}, damagePct=${toFixed(readBonus(bossRun, "damagePct"))}, bossMit=${toFixed(readBonus(bossRun, "bossMechanicMitigation"))}`,
  });

  const farmMismatchRun = startRunWithSigil(seedStateWithRelics({ contextAttunement: "boss" }), CONTEXT_TO_SIGIL.farm);
  checks.push({
    id: "boss-mismatch-farm",
    label: "Mismatch boss->farm aplica defecto agregado",
    pass:
      farmMismatchRun?.expedition?.activeRelicContext === "farm" &&
      assertAlmostEqual(readBonus(farmMismatchRun, "attackSpeed"), -0.16) &&
      assertAlmostEqual(readBonus(farmMismatchRun, "goldPct"), -0.2),
    details: `contexto=${farmMismatchRun?.expedition?.activeRelicContext || "-"}, attackSpeed=${toFixed(readBonus(farmMismatchRun, "attackSpeed"))}, goldPct=${toFixed(readBonus(farmMismatchRun, "goldPct"))}`,
  });

  const abyssRun = startRunWithSigil(
    seedStateWithRelics({ contextAttunement: "abyss", abyssUnlocked: true }),
    CONTEXT_TO_SIGIL.abyss
  );
  checks.push({
    id: "abyss-match",
    label: "Match abyss aplica bonus de abismo",
    pass:
      abyssRun?.expedition?.activeRelicContext === "abyss" &&
      assertAlmostEqual(readBonus(abyssRun, "abyssDamagePct"), 0.32) &&
      assertAlmostEqual(readBonus(abyssRun, "abyssBossMechanicMitigation"), 0.16),
    details: `contexto=${abyssRun?.expedition?.activeRelicContext || "-"}, abyssDamagePct=${toFixed(readBonus(abyssRun, "abyssDamagePct"))}, abyssBossMit=${toFixed(readBonus(abyssRun, "abyssBossMechanicMitigation"))}`,
  });

  const mutableSeed = seedStateWithRelics({
    contextAttunement: "none",
    entropy: 20,
    sigilFlux: 300,
    relicDust: 300,
  });
  const targetRelic = mutableSeed?.sanctuary?.relicArmory?.[0] || null;
  const attuneCost = calculateRelicAttunementCost(targetRelic, "boss");
  const entropyGain = calculateRelicAttunementEntropyGain(targetRelic, "boss");
  const attunedState = gameReducer(mutableSeed, {
    type: "SET_RELIC_ATTUNEMENT",
    relicId: targetRelic?.id,
    contextAttunement: "boss",
    now: 31_000_000,
  });
  const attunedRelic = (attunedState?.sanctuary?.relicArmory || []).find(relic => relic.id === targetRelic?.id);
  checks.push({
    id: "attune-action",
    label: "SET_RELIC_ATTUNEMENT consume flux y sube entropy",
    pass:
      attunedRelic?.contextAttunement === "boss" &&
      assertAlmostEqual(
        Number(attunedState?.sanctuary?.resources?.sigilFlux || 0),
        Number(mutableSeed?.sanctuary?.resources?.sigilFlux || 0) - attuneCost
      ) &&
      assertAlmostEqual(Number(attunedRelic?.entropy || 0), Number(targetRelic?.entropy || 0) + entropyGain),
    details: `fluxCost=${attuneCost}, entropyGain=${entropyGain}, fluxRestante=${Number(attunedState?.sanctuary?.resources?.sigilFlux || 0)}, entropyFinal=${Number(attunedRelic?.entropy || 0)}`,
  });

  const stabilizePlan = calculateRelicEntropyStabilizePlan(attunedRelic);
  const stabilizedState = gameReducer(attunedState, {
    type: "STABILIZE_RELIC_ENTROPY",
    relicId: targetRelic?.id,
    now: 32_000_000,
  });
  const stabilizedRelic = (stabilizedState?.sanctuary?.relicArmory || []).find(relic => relic.id === targetRelic?.id);
  checks.push({
    id: "stabilize-action",
    label: "STABILIZE_RELIC_ENTROPY reduce entropy y consume recursos",
    pass:
      assertAlmostEqual(
        Number(stabilizedRelic?.entropy || 0),
        Math.max(0, Number(attunedRelic?.entropy || 0) - stabilizePlan.entropyReduced)
      ) &&
      assertAlmostEqual(
        Number(stabilizedState?.sanctuary?.resources?.relicDust || 0),
        Number(attunedState?.sanctuary?.resources?.relicDust || 0) - stabilizePlan.relicDustCost
      ) &&
      assertAlmostEqual(
        Number(stabilizedState?.sanctuary?.resources?.sigilFlux || 0),
        Number(attunedState?.sanctuary?.resources?.sigilFlux || 0) - stabilizePlan.sigilFluxCost
      ),
    details: `entropyReducida=${stabilizePlan.entropyReduced}, costoPolvo=${stabilizePlan.relicDustCost}, costoFlux=${stabilizePlan.sigilFluxCost}, entropyFinal=${Number(stabilizedRelic?.entropy || 0)}`,
  });

  const entropySampleRelic = normalizeRelicRecord({
    ...(targetRelic || {}),
    contextAttunement: "none",
  });
  const entropyCurve = [0, 20, 40, 60, 80, 100].map(entropy => {
    const sample = {
      ...(entropySampleRelic || {}),
      entropy,
      contextAttunement: "none",
    };
    return {
      entropy,
      tuneBossCost: calculateRelicAttunementCost(sample, "boss"),
      switchFarmCost: calculateRelicAttunementCost({ ...sample, contextAttunement: "horde" }, "farm"),
      stabilize: calculateRelicEntropyStabilizePlan(sample),
    };
  });

  const monotonicTuneCost = entropyCurve.every((row, index) => index === 0 || row.tuneBossCost >= entropyCurve[index - 1].tuneBossCost);
  const monotonicSwitchCost = entropyCurve.every((row, index) => index === 0 || row.switchFarmCost >= entropyCurve[index - 1].switchFarmCost);
  const monotonicDustCost = entropyCurve.every((row, index) => index === 0 || row.stabilize.relicDustCost >= entropyCurve[index - 1].stabilize.relicDustCost);

  checks.push({
    id: "cost-curve",
    label: "Curvas de costo/estabilizacion crecen con entropy",
    pass: monotonicTuneCost && monotonicSwitchCost && monotonicDustCost,
    details: entropyCurve
      .map(
        row =>
          `E${row.entropy}: tune=${row.tuneBossCost}, switch=${row.switchFarmCost}, stab=${row.stabilize.relicDustCost}/${row.stabilize.sigilFluxCost}`
      )
      .join(" | "),
  });

  const contextMatrix = buildContextBalanceMatrix();
  checks.push({
    id: "context-ratio-lens",
    label: "Ratios bonus/defecto por contexto evitan BIS obvio",
    pass:
      contextMatrix.bisRiskContexts.length <= 0 &&
      contextMatrix.underRewardContexts.length <= 0,
    details: contextMatrix.rows
      .map(
        row =>
          `${row.contextId}: ${toFixed(row.bonusScore, 2)}/${toFixed(row.defectScore, 2)} (x${row.ratio == null ? "-" : toFixed(row.ratio, 2)})`
      )
      .join(" | "),
  });

  return {
    checks,
    entropyCurve,
    contextMatrix,
  };
}

function buildBalanceLens(checkResults = {}) {
  const matchBossState = startRunWithSigil(seedStateWithRelics({ contextAttunement: "boss" }), CONTEXT_TO_SIGIL.boss);
  const mismatchBossState = startRunWithSigil(seedStateWithRelics({ contextAttunement: "boss" }), CONTEXT_TO_SIGIL.horde);
  const matchPowerScore =
    Math.max(0, readBonus(matchBossState, "damagePct")) +
    Math.max(0, readBonus(matchBossState, "bossMechanicMitigation"));
  const mismatchPenaltyScore =
    Math.abs(Math.min(0, readBonus(mismatchBossState, "attackSpeed"))) +
    Math.abs(Math.min(0, readBonus(mismatchBossState, "goldPct")));
  const ratio = mismatchPenaltyScore > 0 ? matchPowerScore / mismatchPenaltyScore : null;

  const suggested = [];
  if (ratio != null && ratio < 1.02) {
    suggested.push("Subir bonus de match o bajar defectos de mismatch para que la sintonia se sienta recompensa.");
  }
  if (ratio != null && ratio > 1.35) {
    suggested.push("Bajar bonus de match o subir defectos para evitar dominancia excesiva de contexto perfecto.");
  }
  if ((checkResults?.contextMatrix?.bisRiskContexts || []).length > 0) {
    suggested.push(`Revisar contexto(s) con ratio alto: ${checkResults.contextMatrix.bisRiskContexts.map(row => row.label).join(", ")}.`);
  }
  if ((checkResults?.contextMatrix?.underRewardContexts || []).length > 0) {
    suggested.push(`Revisar contexto(s) sobrecastigado(s): ${checkResults.contextMatrix.underRewardContexts.map(row => row.label).join(", ")}.`);
  }
  if ((checkResults?.entropyCurve || []).at(-1)?.tuneBossCost > 32) {
    suggested.push("Reducir escalado de costo por entropy (top-end demasiado caro).");
  }
  if ((checkResults?.entropyCurve || []).at(-1)?.switchFarmCost > 36) {
    suggested.push("Reducir costo de retune entre contextos en entropy alto.");
  }
  if (suggested.length <= 0) {
    suggested.push("Balance base aceptable para primera iteracion.");
  }

  return {
    matchPowerScore,
    mismatchPenaltyScore,
    ratio,
    suggested,
  };
}

export function runRelicBalanceAudit() {
  const checkResults = runChecks();
  const lens = buildBalanceLens(checkResults);
  const failedChecks = checkResults.checks.filter(check => !check.pass);
  return {
    pass: failedChecks.length === 0,
    failedChecks,
    checks: checkResults.checks,
    entropyCurve: checkResults.entropyCurve,
    contextMatrix: checkResults.contextMatrix,
    balanceLens: lens,
  };
}

export function formatRelicBalanceAuditReport(report = {}) {
  const lines = [
    "IdleRPG Relic Balance Audit",
    "===========================",
    `Resultado: ${report.pass ? "PASS" : "FAIL"}`,
    "",
    "Checks",
    "------",
  ];

  (report.checks || []).forEach(check => {
    lines.push(`${check.pass ? "[OK]" : "[FAIL]"} ${check.label}`);
    lines.push(`  ${check.details}`);
  });

  lines.push("");
  lines.push("Entropy Curve");
  lines.push("-------------");
  lines.push("entropy | attune none->boss | switch horde->farm | stabilize (dust/flux/reduce)");
  (report.entropyCurve || []).forEach(row => {
    lines.push(
      `${row.entropy} | ${row.tuneBossCost} | ${row.switchFarmCost} | ${row.stabilize.relicDustCost}/${row.stabilize.sigilFluxCost}/${row.stabilize.entropyReduced}`
    );
  });

  lines.push("");
  lines.push("Context Ratio Matrix");
  lines.push("--------------------");
  lines.push(`target ratio range: ${toFixed(CONTEXT_RATIO_MIN, 2)} - ${toFixed(CONTEXT_RATIO_MAX, 2)}`);
  (report.contextMatrix?.rows || []).forEach(row => {
    lines.push(
      `${row.label}: bonus=${toFixed(row.bonusScore, 3)} · defecto=${toFixed(row.defectScore, 3)} · ratio=${row.ratio == null ? "-" : toFixed(row.ratio, 2)}`
    );
  });
  lines.push(
    `max ratio: ${report.contextMatrix?.maxRatio == null ? "-" : toFixed(report.contextMatrix.maxRatio, 2)}`
  );
  lines.push(
    `min ratio: ${report.contextMatrix?.minRatio == null ? "-" : toFixed(report.contextMatrix.minRatio, 2)}`
  );

  lines.push("");
  lines.push("Balance Lens");
  lines.push("------------");
  lines.push(`match score: ${toFixed(report.balanceLens?.matchPowerScore || 0)} (${formatPercent(report.balanceLens?.matchPowerScore || 0)})`);
  lines.push(`mismatch penalty score: ${toFixed(report.balanceLens?.mismatchPenaltyScore || 0)} (${formatPercent(report.balanceLens?.mismatchPenaltyScore || 0)})`);
  lines.push(`ratio match/penalty: ${report.balanceLens?.ratio == null ? "-" : toFixed(report.balanceLens.ratio, 2)}`);
  lines.push("sugerencias:");
  (report.balanceLens?.suggested || []).forEach(suggestion => {
    lines.push(`- ${suggestion}`);
  });

  if (!report.pass && (report.failedChecks || []).length > 0) {
    lines.push("");
    lines.push("Failed Checks");
    lines.push("-------------");
    report.failedChecks.forEach(check => {
      lines.push(`- ${check.id}: ${check.details}`);
    });
  }

  return lines.join("\n");
}
