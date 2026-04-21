import React from "react";
import Achievements from "./Achievements";
import Stats from "./Stats";

const SUBVIEW_META = {
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

function panelStyle() {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "10px",
  };
}

function metricCardStyle() {
  return {
    background: "var(--color-background-tertiary, #f8fafc)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "12px",
    padding: "10px 12px",
    display: "grid",
    gap: "4px",
  };
}

function chipStyle({
  tone = "var(--tone-accent, #4338ca)",
  surface = "var(--tone-accent-soft, #eef2ff)",
} = {}) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: `1px solid ${tone}`,
    background: surface,
    color: tone,
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "0.62rem",
    fontWeight: "900",
  };
}

function getRegistrySubview(tab = "registry") {
  if (tab === "registry") return "achievements";
  if (tab === "achievements" || tab === "stats") return tab;
  if (tab === "system") return "system";
  return "achievements";
}

export default function RegistryView({ state, dispatch }) {
  const activeSubview = getRegistrySubview(state?.currentTab || "registry");
  const reforgeLocked = !!state?.combat?.reforgeSession;
  const sessionTicks = Number(state?.combat?.analytics?.ticks || 0);
  const sessionMinutes = Math.floor(sessionTicks / 60);
  const replayEntries = Array.isArray(state?.replayLibrary?.entries) ? state.replayLibrary.entries.filter(entry => entry?.isActive !== false).length : 0;
  const currentTier = Math.max(1, Number(state?.combat?.currentTier || 1));
  const telemetryKills = Math.max(0, Number(state?.combat?.analytics?.kills || 0));

  return (
    <div style={{ display: "grid", gap: "10px", padding: "10px" }}>
      <section style={panelStyle()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-accent, #4338ca)" }}>
              Mas
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "900", marginTop: "4px" }}>
              Utilidades y registro
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary, #64748b)", marginTop: "4px", lineHeight: 1.45 }}>
              Esta pestaña queda fuera del loop principal. Agrupa consulta, telemetria y herramientas sin competir con Santuario o Expedicion.
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
              <span style={chipStyle({ tone: "var(--tone-success, #10b981)", surface: "var(--tone-success-soft, #ecfdf5)" })}>
                Consulta
              </span>
              <span style={chipStyle({ tone: "var(--tone-info, #0369a1)", surface: "var(--tone-info-soft, #f0f9ff)" })}>
                Telemetria
              </span>
              <span style={chipStyle({ tone: "var(--tone-violet, #7c3aed)", surface: "var(--tone-violet-soft, #f3e8ff)" })}>
                Herramientas
              </span>
            </div>
          </div>
          {activeSubview === "system" && (
            <div style={{ fontSize: "0.64rem", color: "var(--tone-violet, #7c3aed)", fontWeight: "900", maxWidth: "30ch", textAlign: "right", lineHeight: 1.45 }}>
              Esta vista mezcla replay, save, bot y tooling. Se mantiene separada para no ensuciar la lectura principal del juego.
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
          {Object.entries(SUBVIEW_META).map(([viewId, meta]) => {
            const active = activeSubview === viewId;
            const disabled = reforgeLocked && !active;
            return (
              <button
                key={`summary-${viewId}`}
                onClick={() => dispatch({ type: "SET_TAB", tab: viewId })}
                disabled={disabled}
                style={{
                  ...panelStyle(),
                  textAlign: "left",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.6 : 1,
                  borderColor: active ? "var(--tone-accent, #4338ca)" : "var(--color-border-primary, #e2e8f0)",
                  background: active ? "var(--tone-accent-soft, #eef2ff)" : "var(--color-background-secondary, #ffffff)",
                }}
                title={meta.description}
              >
                <div style={{ display: "grid", gap: "4px" }}>
                  <div style={{ fontSize: "0.58rem", fontWeight: "900", textTransform: "uppercase", color: active ? "var(--tone-accent, #4338ca)" : "var(--color-text-tertiary, #94a3b8)" }}>
                    {meta.eyebrow}
                  </div>
                  <div style={{ fontSize: "0.86rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>
                    {meta.label}
                  </div>
                  <div style={{ fontSize: "0.67rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
                    {meta.summary}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px" }}>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Vista activa
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{SUBVIEW_META[activeSubview].label}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Tier sesion
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>T{currentTier}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Kills sesion
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{telemetryKills.toLocaleString()}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Tiempo
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{sessionMinutes > 0 ? `${sessionMinutes}m` : "<1m"}</div>
          </div>
          <div style={metricCardStyle()}>
            <div style={{ fontSize: "0.56rem", fontWeight: "900", textTransform: "uppercase", color: "var(--color-text-tertiary, #94a3b8)" }}>
              Replays
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900" }}>{replayEntries}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Object.entries(SUBVIEW_META).map(([viewId, meta]) => {
            const active = activeSubview === viewId;
            const disabled = reforgeLocked && !active;
            return (
              <button
                key={viewId}
                onClick={() => dispatch({ type: "SET_TAB", tab: viewId })}
                disabled={disabled}
                style={buttonStyle({ active, disabled })}
                title={meta.description}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        {activeSubview !== "system" && (
          <div style={{ ...panelStyle(), gap: "6px", padding: "10px 12px", background: "var(--color-background-tertiary, #f8fafc)" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: "900", color: "var(--color-text-secondary, #64748b)" }}>
              `Sistema` queda separado a proposito
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-text-secondary, #64748b)", lineHeight: 1.45 }}>
              Save tools, replay y debugging viven aca, pero no deberian contaminar la lectura principal de progreso del jugador.
            </div>
          </div>
        )}
      </section>

      <div>
        {activeSubview === "achievements" && <Achievements state={state} />}
        {activeSubview === "stats" && <Stats state={state} dispatch={dispatch} mode="stats" />}
        {activeSubview === "system" && <Stats state={state} dispatch={dispatch} mode="lab" />}
      </div>
    </div>
  );
}
