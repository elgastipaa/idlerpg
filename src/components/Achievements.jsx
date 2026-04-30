import React, { useEffect, useMemo, useState } from "react";
import useViewport from "../hooks/useViewport";
import { ACHIEVEMENTS } from "../data/achievements";
import { getAchievementProgress } from "../engine/progression/achievementEngine";

const CATEGORY_COLORS = {
  combat: "#ef4444",
  progress: "#2563eb",
  loot: "#7c3aed",
  affix: "#d97706",
  craft: "#0f766e",
  economy: "#1d9e75",
  build: "#534ab7",
  run: "#64748b",
  meta: "#db2777",
};

function formatValue(value) {
  return Math.floor(value || 0).toLocaleString();
}

export default function Achievements({ state }) {
  const unlockedIds = state.achievements || [];
  const { isMobile } = useViewport();
  const [filterMode, setFilterMode] = useState("all");
  const previewStep = isMobile ? 8 : 12;
  const [visibleCount, setVisibleCount] = useState(previewStep);

  const enriched = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      const current = getAchievementProgress(state, achievement);
      const unlocked = unlockedIds.includes(achievement.id);
      const target = achievement.condition.value;
      const percent = Math.min(100, Math.floor((current / Math.max(1, target)) * 100));
      return { ...achievement, current, unlocked, target, percent };
    });
  }, [state, unlockedIds]);

  const filtered = enriched
    .filter(item => filterMode === "all" || !item.unlocked)
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? 1 : -1;
      if (!a.unlocked && !b.unlocked && a.percent !== b.percent) return b.percent - a.percent;
      return b.reward - a.reward;
    });
  const visibleAchievements = filtered.slice(0, visibleCount);
  const canShowMore = filtered.length > visibleCount;
  const canShowLess = filtered.length > previewStep && visibleCount > previewStep;

  useEffect(() => {
    setVisibleCount(previewStep);
  }, [previewStep, filterMode]);

  useEffect(() => {
    setVisibleCount(current => Math.min(Math.max(previewStep, current), filtered.length || previewStep));
  }, [filtered.length, previewStep]);

  const unlockedCount = unlockedIds.length;
  const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);
  const totalReward = unlockedIds.reduce((sum, id) => {
    const achievement = ACHIEVEMENTS.find(item => item.id === id);
    return sum + (achievement?.reward || 0);
  }, 0);
  const rootClassName = [
    "achievements-root",
    isMobile ? "achievements-root--mobile" : "",
  ].filter(Boolean).join(" ");
  const metricsProps = {
    style: {
      "--achievements-metrics-columns": isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
    },
  };
  const listProps = {
    style: {
      "--achievements-list-columns": isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
    },
  };
  const globalProgressProps = { style: { "--achievements-progress": `${progressPercent}%` } };

  return (
    <div className={rootClassName}>
      <section className="achievements-panel fl2-surface">
        <div className="achievements-metrics" {...metricsProps}>
          <TopMetric label="Completados" value={`${unlockedCount}/${ACHIEVEMENTS.length}`} color="#1D9E75" />
          <TopMetric label="Progreso" value={`${progressPercent}%`} color="#534AB7" />
          <TopMetric label="Oro ganado" value={formatValue(totalReward)} color="#f59e0b" />
          <TopMetric label="Visibles" value={formatValue(filtered.length)} color="#64748b" />
        </div>

        <div className="achievements-progress">
          <div className="achievements-progress__fill" {...globalProgressProps} />
        </div>
      </section>

      <section className="achievements-filters">
        <button
          onClick={() => setFilterMode("all")}
          className={["achievements-filter fl2-button", filterMode === "all" ? "fl2-button--selected" : ""].filter(Boolean).join(" ")}
          data-selected={filterMode === "all" ? "true" : undefined}
        >
          TODOS
        </button>
        <button
          onClick={() => setFilterMode("pending")}
          className={["achievements-filter fl2-button", filterMode === "pending" ? "fl2-button--selected" : ""].filter(Boolean).join(" ")}
          data-selected={filterMode === "pending" ? "true" : undefined}
        >
          NO COMPLETADOS
        </button>
      </section>

      <div className="achievements-list" {...listProps}>
        {visibleAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
      {(canShowMore || canShowLess) && (
        <div className="achievements-actions">
          {canShowMore && (
            <button
              onClick={() => setVisibleCount(current => Math.min(filtered.length, current + previewStep))}
              className="achievements-action fl2-button"
            >
              Ver mas ({filtered.length - visibleCount})
            </button>
          )}
          {canShowLess && (
            <button
              onClick={() => setVisibleCount(previewStep)}
              className="achievements-action fl2-button fl2-button--ghost"
            >
              Ver menos
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TopMetric({ label, value, color }) {
  const metricProps = { style: { "--achievements-metric-tone": color } };
  return (
    <div className="achievements-metric" {...metricProps}>
      <div className="achievements-metric__label">{label}</div>
      <div className="achievements-metric__value">{value}</div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  const categoryColor = CATEGORY_COLORS[achievement.category] || "#64748b";
  const cardProps = {
    style: {
      "--achievement-category-tone": categoryColor,
      "--achievement-progress": `${achievement.percent}%`,
      "--achievement-progress-fill": achievement.unlocked
        ? "linear-gradient(90deg, #1D9E75, #34d399)"
        : `linear-gradient(90deg, ${categoryColor}, ${categoryColor}aa)`,
    },
  };

  return (
    <div
      className={[
        "achievement-card",
        achievement.unlocked ? "achievement-card--unlocked" : "achievement-card--locked",
        "fl-card",
      ].filter(Boolean).join(" ")}
      {...cardProps}
    >
      <div className="achievement-card__head">
        <div className="achievement-card__title-row">
          <div className="achievement-card__icon">{achievement.icon}</div>
          <div>
            <div className="achievement-card__name">{achievement.name}</div>
            <div className="achievement-card__description">{achievement.description}</div>
          </div>
        </div>
        <div className="achievement-card__category fl2-badge">
          {achievement.category}
        </div>
      </div>

      <div>
        <div className="achievement-card__progress-meta">
          <span>Progreso</span>
          <span className={achievement.unlocked ? "achievement-card__progress-value--done" : ""}>
            {formatValue(Math.min(achievement.current, achievement.target))}/{formatValue(achievement.target)}
          </span>
        </div>
        <div className="achievements-progress">
          <div className="achievement-card__progress-fill" />
        </div>
      </div>

      <div className="achievement-card__reward">
        <span>+{formatValue(achievement.reward)} oro</span>
        <span className={achievement.unlocked ? "achievement-card__state--done" : ""}>
          {achievement.unlocked ? "COMPLETADO" : `${achievement.percent}%`}
        </span>
      </div>
    </div>
  );
}
