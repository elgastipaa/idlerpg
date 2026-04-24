import React, { Suspense, lazy, useRef } from "react";
import useViewport from "../hooks/useViewport";

const SUBVIEW_META = {
  account: {
    label: "Cuenta",
    description: "Vista unificada de Prestige, Biblioteca, Abismo y Blueprints.",
    eyebrow: "Maestria",
    summary: "Lectura corta de la cuenta y del siguiente empuje largo.",
  },
  achievements: {
    label: "Logros",
    description: "Coleccion, hitos y objetivos opcionales de cuenta.",
    eyebrow: "Consulta",
    summary: "Lectura de progreso secundario y metas paralelas.",
  },
  stats: {
    label: "Metricas",
    description: "Lectura de run, telemetria y rendimiento de sesion.",
    eyebrow: "Analisis",
    summary: "Sirve para leer balance, rendimiento y salud del loop.",
  },
  system: {
    label: "Sistema",
    description: "Herramientas de save, replay e inspeccion avanzada.",
    eyebrow: "Herramientas",
    summary: "Capa utilitaria. No forma parte del loop principal de juego.",
  },
};

const AccountProgressView = lazy(() => import("./AccountProgressView"));
const Achievements = lazy(() => import("./Achievements"));
const Stats = lazy(() => import("./Stats"));

function buttonStyle({ active = false, disabled = false } = {}) {
  return {
    border: "1px solid",
    borderColor: disabled
      ? "var(--color-border-primary, #e2e8f0)"
      : active
        ? "var(--tone-accent, #4338ca)"
        : "var(--color-border-primary, #e2e8f0)",
    background: disabled
      ? "var(--color-background-tertiary, #f8fafc)"
      : active
        ? "var(--tone-accent-soft, #eef2ff)"
        : "var(--color-background-secondary, #ffffff)",
    color: disabled
      ? "var(--color-text-tertiary, #94a3b8)"
      : active
        ? "var(--tone-accent, #4338ca)"
        : "var(--color-text-primary, #1e293b)",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "0.72rem",
    fontWeight: "900",
    cursor: disabled ? "not-allowed" : "pointer",
    minWidth: "110px",
  };
}

function getRegistrySubview(tab = "registry") {
  if (tab === "registry") return "account";
  if (tab === "account" || tab === "achievements" || tab === "stats") return tab;
  if (tab === "system") return "system";
  return "account";
}

function SubviewLoadingCard({ label = "Vista" }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border-primary, #e2e8f0)",
        background: "var(--color-background-secondary, #ffffff)",
        borderRadius: "12px",
        padding: "14px 12px",
        fontSize: "0.72rem",
        fontWeight: "900",
        color: "var(--color-text-secondary, #64748b)",
      }}
    >
      Cargando {label}...
    </div>
  );
}

export default function RegistryView({ state, dispatch }) {
  const { isMobile } = useViewport();
  const accountDevGestureRef = useRef({ count: 0, lastClickAt: 0 });
  const activeSubview = getRegistrySubview(state?.currentTab || "registry");
  const reforgeLocked = !!state?.combat?.reforgeSession;
  const DEV_GESTURE_WINDOW_MS = 900;
  const mobileSubviewCount = Object.keys(SUBVIEW_META).length;
  const mobileSubtabsScrollable = mobileSubviewCount >= 5;
  const mobileSubviewDockStyle = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: "calc(var(--app-bottom-nav-offset, 72px) + env(safe-area-inset-bottom))",
    zIndex: 4900,
    background: "var(--color-background-secondary, #ffffff)",
    borderTop: "1px solid var(--color-border-secondary, #e2e8f0)",
    boxShadow: "0 -10px 24px rgba(15,23,42,0.08)",
    padding: "8px 8px 8px",
  };
  const mobileSubviewRowStyle = {
    display: "flex",
    gap: "8px",
    flexWrap: "nowrap",
    width: "100%",
    overflowX: mobileSubtabsScrollable ? "auto" : "hidden",
    overflowY: "hidden",
    scrollbarWidth: mobileSubtabsScrollable ? "none" : "auto",
    WebkitOverflowScrolling: "touch",
  };

  function handleSubviewPress(viewId) {
    if (viewId === "account") {
      const now = Date.now();
      const gesture = accountDevGestureRef.current;
      if (now - Number(gesture.lastClickAt || 0) <= DEV_GESTURE_WINDOW_MS) {
        gesture.count = Number(gesture.count || 0) + 1;
      } else {
        gesture.count = 1;
      }
      gesture.lastClickAt = now;
      if (gesture.count >= 3) {
        gesture.count = 0;
        dispatch({ type: "DEV_UNLOCK_ALL_SANCTUARY_STATIONS" });
      }
    } else {
      accountDevGestureRef.current = { count: 0, lastClickAt: 0 };
    }
    dispatch({ type: "SET_TAB", tab: viewId });
  }

  return (
    <div style={{ display: "grid", gap: "10px", padding: "10px" }}>
      {!isMobile && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Object.entries(SUBVIEW_META).map(([viewId, meta]) => {
            const active = activeSubview === viewId;
            const disabled = reforgeLocked && !active;
            return (
              <button
                key={viewId}
                onClick={() => handleSubviewPress(viewId)}
                disabled={disabled}
                style={buttonStyle({ active, disabled })}
                title={meta.description}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {isMobile && (
        <div style={mobileSubviewDockStyle}>
          <div style={mobileSubviewRowStyle}>
            {Object.entries(SUBVIEW_META).map(([viewId, meta]) => {
              const active = activeSubview === viewId;
              const disabled = reforgeLocked && !active;
              return (
                <button
                  key={`mobile-${viewId}`}
                  onClick={() => handleSubviewPress(viewId)}
                  disabled={disabled}
                  style={{
                    ...buttonStyle({ active, disabled }),
                    minWidth: mobileSubtabsScrollable ? "84px" : 0,
                    flex: mobileSubtabsScrollable ? "0 0 auto" : "1 1 0",
                    padding: "8px 10px",
                    fontSize: "0.68rem",
                    whiteSpace: mobileSubtabsScrollable ? "nowrap" : "normal",
                  }}
                  title={meta.description}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <Suspense fallback={<SubviewLoadingCard label={SUBVIEW_META[activeSubview]?.label || "Vista"} />}>
          {activeSubview === "account" && <AccountProgressView state={state} dispatch={dispatch} />}
          {activeSubview === "achievements" && <Achievements state={state} />}
          {activeSubview === "stats" && <Stats state={state} dispatch={dispatch} mode="stats" />}
          {activeSubview === "system" && <Stats state={state} dispatch={dispatch} mode="lab" />}
        </Suspense>
      </div>
    </div>
  );
}
