import React from "react";
import FlForgeModeScaffold from "./FlForgeModeScaffold";

export default function FlForgeAscendModule(props) {
  const panel = {
    material: {
      label: "Ritual",
      value: "Catalizador",
      delta: props?.selectedActionReq?.can ? "Disponible" : props?.selectedActionHint || "Bloqueado",
    },
    probability: {
      label: "Estado",
      value: props?.selectedImbueJobClaimable ? "Reclamar" : props?.selectedImbueJobRunning ? "En curso" : "Listo",
      capped: props?.selectedImbueJobClaimable || Boolean(props?.selectedActionReq?.can),
      insufficient: !props?.selectedImbueJobClaimable && !props?.selectedImbueJobRunning && !props?.selectedActionReq?.can,
    },
    cost: props?.actionCostMain || "-",
  };

  return (
    <FlForgeModeScaffold
      {...props}
      moduleKey="ascend"
      panel={panel}
      ctaLabel={props?.ctaLabel || "IMBUIR ITEM"}
      showPrimaryActions
    />
  );
}
