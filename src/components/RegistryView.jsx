import React, { Suspense, lazy, useRef } from "react";
import useViewport from "../hooks/useViewport";
import SubtabDock from "./ui/SubtabDock";

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

function getRegistrySubview(tab = "registry") {
  if (tab === "registry") return "account";
  if (tab === "account" || tab === "achievements" || tab === "stats") return tab;
  if (tab === "system") return "system";
  return "account";
}

function SubviewLoadingCard({ label = "Vista" }) {
  return (
    <div className="subview-loading-card">
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
  const subtabEntries = Object.entries(SUBVIEW_META).map(([viewId, meta]) => ({
    id: viewId,
    label: meta.label,
    disabled: reforgeLocked && activeSubview !== viewId,
    title: meta.description,
  }));

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
    <div className="registry-view">
      <SubtabDock
        entries={subtabEntries}
        activeId={activeSubview}
        onSelect={handleSubviewPress}
        isMobile={isMobile}
        mobileScrollable={mobileSubtabsScrollable}
      />

      <div className="registry-view-content">
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
