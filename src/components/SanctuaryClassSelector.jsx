import React from "react";
import { CLASSES } from "../data/classes";

function sectionCardStyle(accent = "var(--tone-accent, #4338ca)") {
  return {
    background: "var(--color-background-secondary, #ffffff)",
    border: "1px solid var(--color-border-primary, #e2e8f0)",
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "12px",
    boxShadow: "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
    borderTop: `3px solid ${accent}`,
  };
}

export default function SanctuaryClassSelector({
  choosingClass = false,
  isMobileViewport = false,
  isNarrowViewport = false,
  onSelectClass,
}) {
  return (
    <section
      id="onboarding-class-selector"
      style={{
        ...sectionCardStyle("var(--tone-info, #0369a1)"),
        boxShadow:
          choosingClass
            ? "0 0 0 2px rgba(3,105,161,0.14), 0 12px 30px rgba(3,105,161,0.16)"
            : "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
        animation: choosingClass ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite" : "none",
      }}
    >
      <div style={{ fontSize: "0.62rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--tone-info, #0369a1)" }}>
        {choosingClass ? "Paso obligatorio" : "Elegir clase"}
      </div>
      {choosingClass && (
        <div style={{ fontSize: "0.74rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.45 }}>
          Elige una clase para esta primera salida. En cuanto la selecciones entraras al combate y la expedicion arrancara.
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: choosingClass
            ? "repeat(2, minmax(0, 1fr))"
            : isMobileViewport
              ? "1fr"
              : "repeat(2, minmax(0, 1fr))",
          gap: isNarrowViewport ? "8px" : "10px",
        }}
      >
        {CLASSES.map(clase => (
          <button
            key={clase.id}
            onClick={() => onSelectClass?.(clase.id)}
            data-onboarding-target={choosingClass ? "choose-class" : undefined}
            style={{
              border: "1px solid var(--color-border-primary, #e2e8f0)",
              background: "var(--color-background-secondary, #ffffff)",
              borderRadius: "14px",
              padding: choosingClass && isNarrowViewport ? "10px" : "14px",
              display: "grid",
              gap: choosingClass && isNarrowViewport ? "6px" : "8px",
              textAlign: "left",
              cursor: "pointer",
              position: "relative",
              zIndex: choosingClass ? 2 : 1,
              boxShadow: choosingClass
                ? "0 0 0 2px rgba(3,105,161,0.22), 0 0 0 8px rgba(3,105,161,0.08), 0 16px 36px rgba(3,105,161,0.22)"
                : "0 8px 24px var(--color-shadow, rgba(15,23,42,0.08))",
              animation: choosingClass ? "sanctuarySpotlightPulse 1600ms ease-in-out infinite" : "none",
              transform: choosingClass ? "translateY(-1px)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: choosingClass && isNarrowViewport ? "1.1rem" : "1.4rem", lineHeight: 1 }}>{clase.icon || "?"}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: choosingClass && isNarrowViewport ? "0.8rem" : "0.92rem", fontWeight: "900", color: "var(--color-text-primary, #1e293b)" }}>{clase.name}</div>
                <div style={{ fontSize: choosingClass && isNarrowViewport ? "0.56rem" : "0.62rem", color: "var(--color-text-tertiary, #94a3b8)", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {clase.playstyle || "Clase"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: choosingClass && isNarrowViewport ? "0.64rem" : "0.72rem", color: "var(--color-text-secondary, #475569)", lineHeight: 1.4 }}>
              {clase.description}
            </div>
            <div style={{ fontSize: choosingClass && isNarrowViewport ? "0.6rem" : "0.66rem", color: "var(--tone-accent, #4338ca)", fontWeight: "900" }}>
              {clase.id === "warrior"
                ? "Impacto frontal, aguante y curva mas estable."
                : "Caster mas fragil al inicio, pero con mas precision y control."}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
