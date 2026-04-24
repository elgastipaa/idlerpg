import React from "react";

function getToastPalette(tone = "success") {
  if (tone === "warning") {
    return {
      border: "rgba(245,158,11,0.35)",
      background: "#fff7ed",
      text: "var(--tone-warning, #f59e0b)",
    };
  }
  if (tone === "info") {
    return {
      border: "rgba(3,105,161,0.28)",
      background: "#f0f9ff",
      text: "var(--tone-info, #0369a1)",
    };
  }
  return {
    border: "rgba(16,185,129,0.3)",
    background: "#ecfdf5",
    text: "var(--tone-success, #10b981)",
  };
}

export default function ActionToast({ toast = null, isMobile = false }) {
  if (!toast?.message) return null;
  const palette = getToastPalette(toast.tone);
  return (
    <>
      <style>{`
        @keyframes actionToastPulseInfo {
          0% { box-shadow: 0 10px 24px rgba(15,23,42,0.1); transform: translateY(2px); }
          60% { box-shadow: 0 14px 28px rgba(3,105,161,0.18); transform: translateY(0); }
          100% { box-shadow: 0 10px 24px rgba(15,23,42,0.12); transform: translateY(0); }
        }
        @keyframes actionToastPulseWarning {
          0% { box-shadow: 0 10px 24px rgba(15,23,42,0.1); transform: translateY(2px); }
          60% { box-shadow: 0 14px 30px rgba(245,158,11,0.22); transform: translateY(0); }
          100% { box-shadow: 0 10px 24px rgba(15,23,42,0.12); transform: translateY(0); }
        }
        @keyframes actionToastPulseSuccess {
          0% { box-shadow: 0 10px 24px rgba(15,23,42,0.1); transform: translateY(2px); }
          60% { box-shadow: 0 14px 30px rgba(16,185,129,0.2); transform: translateY(0); }
          100% { box-shadow: 0 10px 24px rgba(15,23,42,0.12); transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: isMobile ? 84 : 20,
          transform: "translateX(-50%)",
          width: isMobile ? "calc(100% - 28px)" : "min(520px, calc(100% - 56px))",
          pointerEvents: "none",
          zIndex: 7600,
        }}
      >
        <div
          style={{
            border: `1px solid ${palette.border}`,
            background: palette.background,
            color: "var(--color-text-primary, #1e293b)",
            borderRadius: "12px",
            padding: "9px 12px",
            boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
            display: "grid",
            gap: "4px",
            animation:
              toast.tone === "warning"
                ? "actionToastPulseWarning 850ms ease-out"
                : toast.tone === "info"
                  ? "actionToastPulseInfo 820ms ease-out"
                  : "actionToastPulseSuccess 820ms ease-out",
          }}
        >
          <div
            style={{
              fontSize: "0.52rem",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: palette.text,
            }}
          >
            Accion aplicada
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: "900", lineHeight: 1.3 }}>
            {toast.message}
          </div>
        </div>
      </div>
    </>
  );
}
