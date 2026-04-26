export const OBJECTIVE_STATUS = Object.freeze({
  IN_PROGRESS: "in_progress",
  CLAIMABLE: "claimable",
  CLAIMED: "claimed",
});

export function resolveObjectiveStatus({ completed = false, claimed = false } = {}) {
  if (claimed) return OBJECTIVE_STATUS.CLAIMED;
  if (completed) return OBJECTIVE_STATUS.CLAIMABLE;
  return OBJECTIVE_STATUS.IN_PROGRESS;
}

export function getObjectiveStatusMeta(status = OBJECTIVE_STATUS.IN_PROGRESS, {
  inProgressLabel = "En progreso",
  claimableLabel = "Listo para reclamar",
  claimedLabel = "Reclamado",
} = {}) {
  if (status === OBJECTIVE_STATUS.CLAIMED) {
    return {
      status,
      label: claimedLabel,
      tone: "var(--tone-success, #10b981)",
      surface: "var(--tone-success-soft, #ecfdf5)",
      progressTone: "var(--tone-success, #10b981)",
    };
  }

  if (status === OBJECTIVE_STATUS.CLAIMABLE) {
    return {
      status,
      label: claimableLabel,
      tone: "var(--tone-success, #10b981)",
      surface: "var(--tone-success-soft, #ecfdf5)",
      progressTone: "var(--tone-success, #10b981)",
    };
  }

  return {
    status: OBJECTIVE_STATUS.IN_PROGRESS,
    label: inProgressLabel,
    tone: "var(--tone-warning, #f59e0b)",
    surface: "var(--tone-warning-soft, #fff7ed)",
    progressTone: "var(--tone-warning, #f59e0b)",
  };
}
