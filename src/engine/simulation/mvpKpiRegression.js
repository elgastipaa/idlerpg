import { gameReducer } from "../../state/gameReducer";
import { createPostOnboardingSimulationState } from "../stateInitializer";
import {
  buildAccountTelemetrySections,
  buildMvpKpiReport,
  buildMvpKpiRows,
} from "../../utils/runTelemetry";

function toInt(value = 0) {
  return Math.max(0, Math.floor(Number(value || 0)));
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
    level: 16,
    gold: 8_000,
    essence: 3_100,
    currentTier: 14,
  });
  return {
    ...seeded,
    stats: {
      ...(seeded.stats || {}),
      itemsFound: 320,
      itemsExtracted: 110,
      autoExtractedItems: 74,
    },
    accountTelemetry: {
      ...(seeded.accountTelemetry || {}),
      totalOnlineSeconds: 8_400,
      currentSessionSeconds: 600,
      expeditionCount: 15,
      completedExpeditionCount: 11,
      expeditionContractClaims: 9,
      expeditionContractCompletions: 9,
      weeklyLedgerClaims: 3,
      expeditionContractRerolls: 10,
      firstExpeditionContractClaimAtOnlineSeconds: 1_800,
      firstWeeklyClaimAtOnlineSeconds: 3_600,
      inventoryOverflowEvents: 21,
      inventoryOverflowDisplaced: 16,
      inventoryOverflowLost: 5,
      weeklyBossEncountersStarted: 12,
      weeklyBossEncountersWon: 5,
      weeklyBossEncountersLost: 4,
      weeklyBossDifficultyStarts: { normal: 5, veterano: 4, elite: 3 },
      weeklyBossDifficultyWins: { normal: 3, veterano: 2 },
      weeklyBossDifficultyLosses: { normal: 1, veterano: 2, elite: 1 },
    },
  };
}

function buildClaimedWeeklyState(state) {
  const weeklyContracts = state?.weeklyLedger?.contracts || [];
  if (weeklyContracts.length <= 0) return state;
  const firstContract = weeklyContracts[0];
  const goalId = firstContract?.goalId || null;
  if (!goalId) return state;

  const withProgress = {
    ...state,
    stats: {
      ...(state.stats || {}),
      kills: toInt(state?.stats?.kills || 0) + toInt(firstContract?.gainTarget || 1) + 1,
    },
    combat: {
      ...(state.combat || {}),
      analytics: {
        ...((state.combat || {}).analytics || {}),
        kills: toInt(state?.combat?.analytics?.kills || 0) + toInt(firstContract?.gainTarget || 1) + 1,
      },
    },
  };
  return gameReducer(withProgress, {
    type: "CLAIM_WEEKLY_LEDGER_CONTRACT",
    contractId: firstContract.id,
    now: Date.now(),
  });
}

export function runMvpKpiRegression() {
  const checks = [];

  const seeded = createSeedState();
  const progressed = buildClaimedWeeklyState(seeded);
  const rows = buildMvpKpiRows(progressed);
  const report = buildMvpKpiReport(progressed);
  const accountSections = buildAccountTelemetrySections(progressed);
  const kpiSection = accountSections.find(section => section?.id === "account_mvp_kpi");
  const rowsWithStatus = rows.filter(row => String(row?.value || "").includes("·"));

  checks.push(
    createCheck(
      "kpi-rows-present",
      "MVP KPI board expone filas esperadas",
      rows.length >= 8,
      `rows=${rows.length}`
    )
  );
  checks.push(
    createCheck(
      "kpi-status-suffix",
      "Cada KPI incluye sufijo de estado",
      rowsWithStatus.length >= rows.length - 1,
      `rowsWithStatus=${rowsWithStatus.length}/${rows.length}`
    )
  );
  checks.push(
    createCheck(
      "kpi-section-in-account-telemetry",
      "Account telemetry incluye seccion MVP KPI Board",
      Boolean(kpiSection) && (kpiSection?.rows || []).length === rows.length,
      `sectionRows=${(kpiSection?.rows || []).length}`
    )
  );
  checks.push(
    createCheck(
      "kpi-report-render",
      "buildMvpKpiReport devuelve salida legible",
      typeof report === "string" && report.includes("MVP KPI Board"),
      `reportLength=${report.length}`
    )
  );

  const failedChecks = checks.filter(check => !check.pass);
  return {
    pass: failedChecks.length === 0,
    checks,
    failedChecks,
    report,
  };
}

export function formatMvpKpiRegressionReport(result = {}) {
  const lines = [
    "IdleRPG MVP KPI Regression",
    "==========================",
    `Resultado: ${result?.pass ? "PASS" : "FAIL"}`,
    "",
    "Checks",
    "------",
  ];

  (result?.checks || []).forEach(check => {
    lines.push(`${check.pass ? "[OK]" : "[FAIL]"} ${check.label}`);
    lines.push(`  ${check.details}`);
  });

  lines.push("");
  lines.push("KPI Snapshot");
  lines.push("------------");
  lines.push(result?.report || "(sin reporte)");

  if ((result?.failedChecks || []).length > 0) {
    lines.push("");
    lines.push("Failed Checks");
    lines.push("-------------");
    result.failedChecks.forEach(check => {
      lines.push(`- ${check.id}: ${check.details}`);
    });
  }

  return lines.join("\n");
}
