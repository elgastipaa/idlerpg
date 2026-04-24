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

  return (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--color-background-primary, #f8fafc)", color: "var(--color-text-primary, #1e293b)" }}>
      <section style={panelStyle}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
          <TopMetric label="Completados" value={`${unlockedCount}/${ACHIEVEMENTS.length}`} color="#1D9E75" />
          <TopMetric label="Progreso" value={`${progressPercent}%`} color="#534AB7" />
          <TopMetric label="Oro ganado" value={formatValue(totalReward)} color="#f59e0b" />
          <TopMetric label="Visibles" value={formatValue(filtered.length)} color="#64748b" />
        </div>

        <div style={progressBarBg}>
          <div style={{ ...progressBarFill, width: `${progressPercent}%` }} />
        </div>
      </section>

      <section style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <button
          onClick={() => setFilterMode("all")}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "999px",
            padding: "7px 10px",
            fontSize: "0.68rem",
            fontWeight: "900",
            cursor: "pointer",
            background: filterMode === "all" ? "#1e293b" : "var(--color-background-secondary, #fff)",
            color: filterMode === "all" ? "#fff" : "#475569",
          }}
        >
          TODOS
        </button>
        <button
          onClick={() => setFilterMode("pending")}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "999px",
            padding: "7px 10px",
            fontSize: "0.68rem",
            fontWeight: "900",
            cursor: "pointer",
            background: filterMode === "pending" ? "#1e293b" : "var(--color-background-secondary, #fff)",
            color: filterMode === "pending" ? "#fff" : "#475569",
          }}
        >
          NO COMPLETADOS
        </button>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
        {visibleAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
      {(canShowMore || canShowLess) && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {canShowMore && (
            <button
              onClick={() => setVisibleCount(current => Math.min(filtered.length, current + previewStep))}
              style={previewButtonStyle("#fff", "#1d4ed8", "1px solid #bfdbfe")}
            >
              Ver mas ({filtered.length - visibleCount})
            </button>
          )}
          {canShowLess && (
            <button
              onClick={() => setVisibleCount(previewStep)}
              style={previewButtonStyle("#fff", "#64748b", "1px solid #cbd5e1")}
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
  return (
    <div style={{ background: "var(--color-background-secondary, #fff)", border: "1px solid var(--color-border-primary, #e2e8f0)", borderRadius: "12px", padding: "10px 12px" }}>
      <div style={{ fontSize: "0.58rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "900", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: "900", color }}>{value}</div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  const categoryColor = CATEGORY_COLORS[achievement.category] || "#64748b";

  return (
    <div style={{
      background: achievement.unlocked ? "var(--color-background-secondary, #ffffff)" : "var(--color-background-tertiary, #f8fafc)",
      border: `1px solid ${achievement.unlocked ? `${categoryColor}55` : "var(--color-border-primary, #e2e8f0)"}`,
      borderRadius: "14px",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      boxShadow: achievement.unlocked ? "0 8px 20px rgba(15,23,42,0.05)" : "none",
      opacity: achievement.unlocked ? 1 : 0.88,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "start" }}>
          <div style={{ fontSize: "1.25rem", lineHeight: 1 }}>{achievement.icon}</div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{achievement.name}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary, #64748b)", marginTop: "3px", lineHeight: 1.3 }}>{achievement.description}</div>
          </div>
        </div>
        <div style={{ fontSize: "0.55rem", fontWeight: "900", color: categoryColor, background: `${categoryColor}15`, border: `1px solid ${categoryColor}33`, borderRadius: "999px", padding: "3px 6px", textTransform: "uppercase" }}>
          {achievement.category}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
          <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: "900", textTransform: "uppercase" }}>Progreso</span>
          <span style={{ fontSize: "0.7rem", color: achievement.unlocked ? "#1d9e75" : "#475569", fontWeight: "900" }}>
            {formatValue(Math.min(achievement.current, achievement.target))}/{formatValue(achievement.target)}
          </span>
        </div>
        <div style={progressBarBg}>
          <div style={{ ...progressBarFill, width: `${achievement.percent}%`, background: achievement.unlocked ? "linear-gradient(90deg, #1D9E75, #34d399)" : `linear-gradient(90deg, ${categoryColor}, ${categoryColor}aa)` }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eef2f7", paddingTop: "8px" }}>
        <span style={{ fontSize: "0.68rem", fontWeight: "900", color: "#f59e0b" }}>+{formatValue(achievement.reward)} oro</span>
        <span style={{ fontSize: "0.62rem", fontWeight: "900", color: achievement.unlocked ? "#1D9E75" : "#94a3b8" }}>
          {achievement.unlocked ? "COMPLETADO" : `${achievement.percent}%`}
        </span>
      </div>
    </div>
  );
}

const panelStyle = {
  background: "var(--color-background-secondary, #ffffff)",
  padding: "1rem",
  borderRadius: "16px",
  border: "1px solid var(--color-border-primary, #e2e8f0)",
  boxShadow: "0 2px 10px var(--color-shadow, rgba(0,0,0,0.03))",
};

const progressBarBg = {
  width: "100%",
  height: "10px",
  background: "var(--color-background-tertiary, #f1f5f9)",
  borderRadius: "999px",
  overflow: "hidden",
};

const progressBarFill = {
  height: "100%",
  background: "linear-gradient(90deg, #1D9E75, #34d399)",
  transition: "width 0.4s ease",
};

const previewButtonStyle = (background, color, border) => ({
  border: border || "none",
  background,
  color,
  borderRadius: "999px",
  padding: "7px 10px",
  fontSize: "0.64rem",
  fontWeight: "900",
  cursor: "pointer",
});
