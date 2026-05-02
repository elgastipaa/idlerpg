import React from "react";
import { CLASSES } from "../data/classes";
import { FlCard } from "./ui/forge";

export default function SanctuaryClassSelector({
  choosingClass = false,
  isMobileViewport = false,
  isNarrowViewport = false,
  onSelectClass,
}) {
  return (
    <section
      id="onboarding-class-selector"
      className={[
        "sanctuary-class-selector",
        choosingClass ? "sanctuary-class-selector--choosing" : "",
        isMobileViewport ? "sanctuary-class-selector--mobile" : "",
        isNarrowViewport ? "sanctuary-class-selector--narrow" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="sanctuary-class-selector__eyebrow">
        {choosingClass ? "Paso obligatorio" : "Elegir clase"}
      </div>
      {choosingClass && (
        <div className="sanctuary-class-selector__copy">
          Elige una clase para esta primera salida. En cuanto la selecciones entraras al combate y la expedicion arrancara.
        </div>
      )}
      <div className="sanctuary-class-selector__grid">
        {CLASSES.map(clase => (
          <FlCard
            className="sanctuary-class-selector__option"
            key={clase.id}
            onClick={() => onSelectClass?.(clase.id)}
            interactive
            variant="premium"
            data-onboarding-target={choosingClass ? "choose-class" : undefined}
          >
            <div className="sanctuary-class-selector__option-head">
              <div className="sanctuary-class-selector__icon">{clase.icon || "?"}</div>
              <div className="sanctuary-class-selector__option-title-wrap">
                <div className="sanctuary-class-selector__option-title">{clase.name}</div>
                <div className="sanctuary-class-selector__option-meta">
                  {clase.playstyle || "Clase"}
                </div>
              </div>
            </div>
            <div className="sanctuary-class-selector__option-desc">
              {clase.description}
            </div>
            <div className="sanctuary-class-selector__option-note">
              {clase.id === "warrior"
                ? "Impacto frontal, aguante y curva mas estable."
                : "Caster mas fragil al inicio, pero con mas precision y control."}
            </div>
          </FlCard>
        ))}
      </div>
    </section>
  );
}
