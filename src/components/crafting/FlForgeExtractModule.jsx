import React from "react";
import FlForgeModeScaffold from "./FlForgeModeScaffold";

export default function FlForgeExtractModule(props) {
  const count = Math.max(0, Number(props?.selectedExtractCount || 0));
  const essence = Math.max(0, Number(props?.selectedExtractEssence || 0));
  const panel = {
    material: {
      label: "Extraccion",
      value: props?.modeLabel || "Extraer",
      delta: count > 0 ? `${count} item(s)` : "Selecciona items",
    },
    probability: {
      label: "Retorno",
      value: count > 0 ? `+${essence} esencia` : "Sin seleccion",
      capped: count > 0,
      insufficient: count <= 0,
    },
    cost: count > 0 ? `${count} items` : "Sin costo",
  };

  return (
    <FlForgeModeScaffold
      {...props}
      moduleKey="extract"
      panel={panel}
      ctaLabel={props?.ctaLabel || "EXTRAER ITEM"}
      showPrimaryActions={false}
    />
  );
}
