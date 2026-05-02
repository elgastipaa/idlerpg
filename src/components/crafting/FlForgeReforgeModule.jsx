import React from "react";
import FlForgeModeScaffold from "./FlForgeModeScaffold";

export default function FlForgeReforgeModule(props) {
  const hasOptions = Boolean(props?.hasReforgeOptions);
  const panel = {
    material: {
      label: "Linea objetivo",
      value: props?.selectedAffixLabel || "Seleccionar linea",
      delta: hasOptions ? "Opciones listas" : props?.selectedActionHint || "Pendiente",
    },
    probability: {
      label: "Reforja",
      value: hasOptions ? "3 opciones" : "Genera opciones",
      capped: hasOptions || Boolean(props?.selectedActionReq?.can),
      insufficient: !hasOptions && !props?.selectedActionReq?.can,
    },
    cost: props?.actionCostMain || "-",
  };

  return (
    <FlForgeModeScaffold
      {...props}
      moduleKey="reforge"
      panel={panel}
      ctaLabel={props?.ctaLabel || "PAGAR REFORJA"}
      showPrimaryActions
    />
  );
}
