import { createPostOnboardingSimulationState } from "../stateInitializer";
import {
  processTickWithStages,
  TICK_STAGE_IDS,
} from "../combat/processTickPipeline";

function toCount(value = 0) {
  return Math.max(0, Number(value || 0));
}

function createCheck(id, label, pass, details) {
  return {
    id,
    label,
    pass: Boolean(pass),
    details: String(details || "").trim(),
  };
}

function createSeedState() {
  const seeded = createPostOnboardingSimulationState({
    classId: "warrior",
    specialization: "berserker",
    level: 14,
    gold: 3_200,
    essence: 1_200,
    currentTier: 9,
  });

  return {
    ...seeded,
    expedition: {
      ...(seeded.expedition || {}),
      phase: "active",
      id: "sim_stage_tick",
      startedAt: 1_900_000_000_000,
    },
    combat: {
      ...seeded.combat,
      pendingRunSetup: false,
      currentTier: Math.max(1, Number(seeded.combat?.currentTier || 9)),
      maxTier: Math.max(1, Number(seeded.combat?.maxTier || 9)),
      autoAdvance: true,
    },
  };
}

function runSingleTickChecks() {
  const checks = [];
  const stageOrder = [];

  const before = createSeedState();
  const after = processTickWithStages(before, {
    onStage: stageId => stageOrder.push(stageId),
  });

  checks.push(
    createCheck(
      "tick-stage-order",
      "Pipeline ejecuta etapas en orden pre/combat/loot/progress/post",
      JSON.stringify(stageOrder) === JSON.stringify(TICK_STAGE_IDS),
      `order=${stageOrder.join(" > ")}`
    )
  );

  checks.push(
    createCheck(
      "tick-state-advances",
      "Combat stage produce nuevo estado",
      after !== before,
      `sameReference=${after === before}`
    )
  );

  const killDelta = toCount(after?.stats?.kills) - toCount(before?.stats?.kills);
  const analyticsKillDelta = toCount(after?.combat?.analytics?.kills) - toCount(before?.combat?.analytics?.kills);
  checks.push(
    createCheck(
      "tick-progress-delta-safe",
      "Delta de progreso por tick no es negativo",
      killDelta >= 0 && analyticsKillDelta >= 0,
      `killsDelta=${killDelta}, analyticsKillsDelta=${analyticsKillDelta}`
    )
  );

  return checks;
}

function runBatchConsistencyChecks({ ticks = 120 } = {}) {
  const checks = [];
  let state = createSeedState();
  const initialStatsKills = toCount(state?.stats?.kills);
  const initialAnalyticsKills = toCount(state?.combat?.analytics?.kills);
  const batchStats = {
    lootNegativeSeen: false,
    observedLootTicks: 0,
  };

  for (let index = 0; index < ticks; index += 1) {
    let stageLoot = null;
    state = processTickWithStages(state, {
      onStage: (stageId, payload) => {
        if (stageId !== "loot") return;
        stageLoot = payload;
      },
    });

    if (stageLoot?.hadLootEvent) {
      batchStats.observedLootTicks += 1;
    }

    const lootDelta = stageLoot?.delta || {};
    const hasNegativeLootDelta = Object.values(lootDelta)
      .some(value => Number(value || 0) < 0);
    if (hasNegativeLootDelta) {
      batchStats.lootNegativeSeen = true;
    }
  }

  const statsKillsDelta = toCount(state?.stats?.kills) - initialStatsKills;
  const analyticsKillsDelta = toCount(state?.combat?.analytics?.kills) - initialAnalyticsKills;

  checks.push(
    createCheck(
      "tick-kill-counters-consistent",
      "Delta de kills stats/analytics queda alineado en batch",
      statsKillsDelta === analyticsKillsDelta,
      `statsKillsDelta=${statsKillsDelta}, analyticsKillsDelta=${analyticsKillsDelta}`
    )
  );

  checks.push(
    createCheck(
      "tick-loot-delta-non-negative",
      "Delta de loot por etapa nunca retrocede",
      !batchStats.lootNegativeSeen,
      `lootTicks=${batchStats.observedLootTicks}`
    )
  );

  return checks;
}

export function runProcessTickStageRegression() {
  const checks = [
    ...runSingleTickChecks(),
    ...runBatchConsistencyChecks(),
  ];
  const failedChecks = checks.filter(check => !check.pass);
  return {
    pass: failedChecks.length === 0,
    checks,
    failedChecks,
  };
}

export function formatProcessTickStageRegressionReport(report = {}) {
  const lines = [
    "IdleRPG ProcessTick Stage Regression",
    "===================================",
    `Resultado: ${report?.pass ? "PASS" : "FAIL"}`,
    "",
    "Checks",
    "------",
  ];

  (report?.checks || []).forEach(check => {
    lines.push(`${check.pass ? "[OK]" : "[FAIL]"} ${check.label}`);
    lines.push(`  ${check.details}`);
  });

  if ((report?.failedChecks || []).length > 0) {
    lines.push("");
    lines.push("Failed Checks");
    lines.push("-------------");
    report.failedChecks.forEach(check => {
      lines.push(`- ${check.id}: ${check.details}`);
    });
  }

  return lines.join("\n");
}
