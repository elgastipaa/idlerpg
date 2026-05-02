import React from "react";
import FlForgeModeScaffold from "./FlForgeModeScaffold";

export default function FlForgePolishModule(props) {
  const panel = {
    material: {
      label: "Linea objetivo",
      value: props?.selectedAffixLabel || "Seleccionar linea",
      delta: props?.selectedActionReq?.can ? "Fijada" : props?.selectedActionHint || "Pendiente",
    },
    probability: {
      label: "Afinado",
      value: "Reroll de valor",
      capped: Boolean(props?.selectedActionReq?.can),
      insufficient: !props?.selectedActionReq?.can,
    },
    cost: props?.actionCostMain || "-",
  };

  return (
    <FlForgeModeScaffold
      {...props}
      moduleKey="polish"
      panel={panel}
      ctaLabel={props?.ctaLabel || "AFINAR LINEA"}
      showPrimaryActions
    />
  );
}
