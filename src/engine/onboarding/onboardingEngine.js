import { ITEMS } from "../../data/items";
import { PRESTIGE_TREE_NODES } from "../../data/prestige";
import { PLAYER_UPGRADES } from "../../data/playerUpgrades";
import { addToInventory } from "../inventory/inventoryEngine";
import { canPurchasePrestigeNode } from "../progression/prestigeEngine";
import { materializeItem } from "../../utils/loot";
import { buildExtractedItemRecord } from "../sanctuary/blueprintEngine";

export const ONBOARDING_STEPS = {
  CHOOSE_CLASS: "choose_class",
  EXPEDITION_INTRO: "expedition_intro",
  COMBAT_INTRO: "combat_intro",
  AUTO_ADVANCE: "auto_advance",
  FIRST_DEATH: "first_death",
  OPEN_HERO: "open_hero",
  CHOOSE_SPEC: "choose_spec",
  HERO_INTRO: "hero_intro",
  HERO_SKILLS_INTRO: "hero_skills_intro",
  SPEND_ATTRIBUTE: "spend_attribute",
  HERO_TALENTS_INTRO: "hero_talents_intro",
  TALENT_INTRO: "talent_intro",
  BUY_TALENT: "buy_talent",
  HERO_CHARACTER_INTRO: "hero_character_intro",
  COMBAT_AFTER_TALENT: "combat_after_talent",
  EQUIP_INTRO: "equip_intro",
  EQUIP_FIRST_ITEM: "equip_first_item",
  FIRST_BOSS: "first_boss",
  HUNT_INTRO: "hunt_intro",
  EXTRACTION_READY: "extraction_ready",
  EXTRACTION_SELECT_CARGO: "extraction_select_cargo",
  EXTRACTION_SELECT_ITEM: "extraction_select_item",
  EXTRACTION_CONFIRM: "extraction_confirm",
  FIRST_SANCTUARY_RETURN: "first_sanctuary_return",
  RESEARCH_DISTILLERY: "research_distillery",
  DISTILLERY_READY: "distillery_ready",
  FIRST_DISTILLERY_JOB: "first_distillery_job",
  FIRST_ECHOES: "first_echoes",
  BUY_FIRST_ECHO_NODE: "buy_first_echo_node",
  FIRST_PRESTIGE_CLOSE: "first_prestige_close",
  BLUEPRINT_INTRO: "blueprint_intro",
  BLUEPRINT_DECISION: "blueprint_decision",
  FIRST_BLUEPRINT_MATERIALIZATION: "first_blueprint_materialization",
  DEEP_FORGE_READY: "deep_forge_ready",
  FIRST_DEEP_FORGE_USE: "first_deep_forge_use",
  LIBRARY_READY: "library_ready",
  ERRANDS_READY: "errands_ready",
  SIGIL_ALTAR_READY: "sigil_altar_ready",
  ABYSS_PORTAL_READY: "abyss_portal_ready",
  TIER25_CAP: "tier25_cap",
  FIRST_ABYSS: "first_abyss",
};

const STATIC_INFO_STEPS = new Set([
  ONBOARDING_STEPS.EXPEDITION_INTRO,
  ONBOARDING_STEPS.COMBAT_INTRO,
  ONBOARDING_STEPS.FIRST_DEATH,
  ONBOARDING_STEPS.HERO_INTRO,
  ONBOARDING_STEPS.TALENT_INTRO,
  ONBOARDING_STEPS.COMBAT_AFTER_TALENT,
  ONBOARDING_STEPS.FIRST_BOSS,
  ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE,
  ONBOARDING_STEPS.BLUEPRINT_INTRO,
  ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION,
  ONBOARDING_STEPS.TIER25_CAP,
  ONBOARDING_STEPS.FIRST_ABYSS,
]);

const LAB_RESEARCH_STEP_TARGETS = {
  [ONBOARDING_STEPS.RESEARCH_DISTILLERY]: "unlock_distillery",
  [ONBOARDING_STEPS.DEEP_FORGE_READY]: "unlock_deep_forge",
  [ONBOARDING_STEPS.LIBRARY_READY]: "unlock_library",
  [ONBOARDING_STEPS.ERRANDS_READY]: "unlock_errands",
  [ONBOARDING_STEPS.SIGIL_ALTAR_READY]: "unlock_sigil_altar",
  [ONBOARDING_STEPS.ABYSS_PORTAL_READY]: "unlock_abyss_portal",
};

const BASE_ONBOARDING_FLAGS = {
  classChosen: false,
  expeditionIntroSeen: false,
  combatIntroSeen: false,
  autoAdvanceUnlocked: false,
  firstDeathSeen: false,
  heroTabUnlocked: false,
  specChosen: false,
  heroIntroSeen: false,
  firstAttributeSpent: false,
  firstTalentBought: false,
  inventoryUnlocked: false,
  firstItemEquipped: false,
  firstBossSeen: false,
  huntUnlocked: false,
  extractionUnlocked: false,
  firstExtractionCompleted: false,
  laboratoryUnlocked: false,
  distilleryUnlocked: false,
  distilleryJobStarted: false,
  blueprintDecisionUnlocked: false,
  firstEchoesSeen: false,
  firstEchoTabOpened: false,
  firstEchoNodeBought: false,
  firstPrestigeCloseSeen: false,
  blueprintScrapped: false,
  blueprintConverted: false,
  firstBlueprintMaterializationSeen: false,
  deepForgeReadySeen: false,
  firstDeepForgeUseSeen: false,
  libraryReadySeen: false,
  errandsReadySeen: false,
  sigilAltarReadySeen: false,
  abyssPortalReadySeen: false,
  tier25CapSeen: false,
  firstAbyssSeen: false,
};

export function createEmptyOnboardingState() {
  return {
    completed: false,
    step: ONBOARDING_STEPS.EXPEDITION_INTRO,
    flags: { ...BASE_ONBOARDING_FLAGS },
    equipKillTarget: null,
    bossHeroDelayTicks: 0,
    bossHeroQueued: false,
    extractionReadyDelayTicks: 0,
  };
}

export function normalizeOnboardingState(onboarding = {}) {
  const hasExplicitStep =
    onboarding != null && Object.prototype.hasOwnProperty.call(onboarding, "step");
  const normalizedStep = onboarding?.completed
    ? null
    : hasExplicitStep
      ? (onboarding.step === undefined ? ONBOARDING_STEPS.EXPEDITION_INTRO : onboarding.step)
      : ONBOARDING_STEPS.EXPEDITION_INTRO;

  return {
    ...createEmptyOnboardingState(),
    ...(onboarding || {}),
    completed: Boolean(onboarding?.completed),
    step: normalizedStep,
    flags: {
      ...BASE_ONBOARDING_FLAGS,
      ...(onboarding?.flags || {}),
    },
    equipKillTarget:
      onboarding?.equipKillTarget == null
        ? null
        : Math.max(0, Math.floor(Number(onboarding.equipKillTarget || 0))),
    bossHeroDelayTicks: Math.max(0, Math.floor(Number(onboarding?.bossHeroDelayTicks || 0))),
    bossHeroQueued: Boolean(onboarding?.bossHeroQueued),
    extractionReadyDelayTicks: Math.max(0, Math.floor(Number(onboarding?.extractionReadyDelayTicks || 0))),
  };
}

export function isOnboardingBlocking(state = {}) {
  return Boolean(state?.onboarding?.step && !state?.onboarding?.completed);
}

export function shouldShowHeroPrimaryTab(state = {}) {
  const heroFlags = state?.onboarding?.flags || {};
  return (
    Boolean(state?.player?.specialization) ||
    Boolean(
      heroFlags?.heroTabUnlocked ||
      heroFlags?.heroIntroSeen ||
      heroFlags?.firstAttributeSpent ||
      heroFlags?.firstTalentBought ||
      heroFlags?.specChosen
    ) ||
    state?.currentTab === "character" ||
    state?.currentTab === "skills" ||
    state?.currentTab === "talents"
  );
}

export function canOpenExpedition(state = {}) {
  return Boolean(state?.player?.class);
}

export function isInventorySubviewUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.inventoryUnlocked) return true;
  return [ONBOARDING_STEPS.EQUIP_INTRO, ONBOARDING_STEPS.EQUIP_FIRST_ITEM].includes(state?.onboarding?.step);
}

export function isFieldForgeUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.firstBossSeen) return true;
  return false;
}

export function isAutoAdvanceUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.autoAdvanceUnlocked) return true;
  return state?.onboarding?.step === ONBOARDING_STEPS.AUTO_ADVANCE;
}

export function isHuntUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.step === ONBOARDING_STEPS.HUNT_INTRO) return true;
  if (state?.onboarding?.flags?.huntUnlocked) return true;
  return false;
}

export function isExtractionUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_READY) return true;
  if (state?.onboarding?.flags?.extractionUnlocked) {
    return (
      Boolean(state?.onboarding?.flags?.firstBossSeen) &&
      Math.max(
        1,
        Number(state?.combat?.maxTier || 1),
        Number(state?.combat?.currentTier || 1)
      ) >= 6
    );
  }
  return false;
}

export function isLaboratoryUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.laboratoryUnlocked) return true;
  return false;
}

export function isDistilleryUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.distilleryUnlocked) return true;
  return false;
}

export function getOnboardingTutorialBundleId(state = {}) {
  const cargoInventory = Array.isArray(state?.sanctuary?.cargoInventory) ? state.sanctuary.cargoInventory : [];
  return cargoInventory[0]?.id || "tutorial_distillery_bundle";
}

export function getOnboardingTutorialExtractedItemId(state = {}) {
  const extractedItems = Array.isArray(state?.sanctuary?.extractedItems) ? state.sanctuary.extractedItems : [];
  return extractedItems[0]?.id || null;
}

export function getOnboardingTutorialDeepForgeProjectId(state = {}) {
  const stash = Array.isArray(state?.sanctuary?.stash) ? state.sanctuary.stash : [];
  return stash[0]?.id || null;
}

export function isBlueprintDecisionUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.blueprintDecisionUnlocked) return true;
  return Number(state?.prestige?.level || 0) >= 2;
}

export function getOnboardingRequiredTab(step = null) {
  switch (step) {
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
    case ONBOARDING_STEPS.CHOOSE_CLASS:
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
    case ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO:
    case ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM:
    case ONBOARDING_STEPS.EXTRACTION_CONFIRM:
    case ONBOARDING_STEPS.RESEARCH_DISTILLERY:
    case ONBOARDING_STEPS.DISTILLERY_READY:
    case ONBOARDING_STEPS.FIRST_DISTILLERY_JOB:
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
    case ONBOARDING_STEPS.BLUEPRINT_DECISION:
    case ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION:
    case ONBOARDING_STEPS.DEEP_FORGE_READY:
    case ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE:
    case ONBOARDING_STEPS.LIBRARY_READY:
    case ONBOARDING_STEPS.ERRANDS_READY:
    case ONBOARDING_STEPS.SIGIL_ALTAR_READY:
    case ONBOARDING_STEPS.ABYSS_PORTAL_READY:
      return "sanctuary";
    case ONBOARDING_STEPS.CHOOSE_SPEC:
    case ONBOARDING_STEPS.HERO_INTRO:
    case ONBOARDING_STEPS.HERO_SKILLS_INTRO:
    case ONBOARDING_STEPS.HERO_TALENTS_INTRO:
    case ONBOARDING_STEPS.HERO_CHARACTER_INTRO:
      return "character";
    case ONBOARDING_STEPS.SPEND_ATTRIBUTE:
      return "skills";
    case ONBOARDING_STEPS.TALENT_INTRO:
    case ONBOARDING_STEPS.BUY_TALENT:
      return "talents";
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return "inventory";
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
    case ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE:
      return "prestige";
    case ONBOARDING_STEPS.COMBAT_INTRO:
    case ONBOARDING_STEPS.AUTO_ADVANCE:
    case ONBOARDING_STEPS.FIRST_DEATH:
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
    case ONBOARDING_STEPS.EQUIP_INTRO:
    case ONBOARDING_STEPS.FIRST_BOSS:
    case ONBOARDING_STEPS.HUNT_INTRO:
    case ONBOARDING_STEPS.EXTRACTION_READY:
    case ONBOARDING_STEPS.TIER25_CAP:
    case ONBOARDING_STEPS.FIRST_ABYSS:
      return "combat";
    default:
      return null;
  }
}

export function isOnboardingTabAllowed(step = null, tab = "sanctuary") {
  if (!step) return true;
  if (["registry", "system", "stats", "achievements"].includes(tab)) return true;
  const requiredTab = getOnboardingRequiredTab(step);
  if (!requiredTab) return true;
  if (requiredTab === tab) return true;
  if (requiredTab === "character" && ["character", "skills", "talents"].includes(tab)) return true;
  if (requiredTab === "combat" && ["combat", "inventory", "crafting", "codex"].includes(tab)) return true;
  return false;
}

export function getOnboardingResearchTargetId(step = null) {
  return LAB_RESEARCH_STEP_TARGETS[step] || null;
}

export function getOnboardingFirstEchoNodeId(state = {}) {
  const purchasableNode = PRESTIGE_TREE_NODES.find(node => canPurchasePrestigeNode(state, node).ok);
  return purchasableNode?.id || null;
}

export function getOnboardingStepInteractionMode(step = null, state = {}) {
  if (!step) return "forced";

  if (step === ONBOARDING_STEPS.DISTILLERY_READY) {
    const laboratoryJobs = Array.isArray(state?.sanctuary?.jobs) ? state.sanctuary.jobs : [];
    const runningDistilleryResearch = laboratoryJobs.some(
      job =>
        job?.station === "laboratory" &&
        job?.input?.researchId === "unlock_distillery" &&
        job?.status === "running"
    );
    return runningDistilleryResearch ? "info" : "forced";
  }

  if (step === ONBOARDING_STEPS.FIRST_ECHOES) {
    return state?.currentTab === "prestige" ? "info" : "forced";
  }

  if (
    [
      ONBOARDING_STEPS.DEEP_FORGE_READY,
      ONBOARDING_STEPS.LIBRARY_READY,
      ONBOARDING_STEPS.ERRANDS_READY,
      ONBOARDING_STEPS.SIGIL_ALTAR_READY,
      ONBOARDING_STEPS.ABYSS_PORTAL_READY,
    ].includes(step)
  ) {
    return "info";
  }

  return STATIC_INFO_STEPS.has(step) ? "info" : "forced";
}

export function getOnboardingStepMeta(step = null, state = {}) {
  switch (step) {
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
      return {
        title: "Este es tu Santuario",
        body: "Aqui preparas la cuenta y desde aqui inicias cada expedicion. El primer gesto del juego es salir desde esta base: primero inicias la run, luego eliges una clase y de ahi entras al combate.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.CHOOSE_CLASS:
      return {
        title: "Ahora elige una clase",
        body: "Tu primera run necesita una identidad base. Elige Warrior o Mage y, apenas lo hagas, entraras al combate para arrancar la expedicion.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.COMBAT_INTRO:
      return {
        title: "El combate corre solo",
        body: "Tu heroe pelea automaticamente. Tu trabajo es decidir cuando empujar, cuando mejorar equipo y cuando cerrar la expedicion con una extraccion.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.CHOOSE_SPEC:
      return {
        title: "Elige una especializacion",
        body: "Despues de tus primeros talentos, ya puedes elegir una subclase. Toca una de las opciones resaltadas para definir la direccion de esta build.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.AUTO_ADVANCE:
      return {
        title: "Activa el auto-avance",
        body: "Toca el boton de botas resaltado. Cuando esta activo, tu heroe empuja tiers por su cuenta.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_DEATH:
      return {
        title: "El tutorial protege esta run",
        body: "Aqui no puedes perder definitivamente la expedicion. Si caes, retrocedes, el auto-avance se corta y vuelves a pelear sin consumir vidas reales.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.OPEN_HERO:
      return {
        title: "Abre la hoja de Heroe",
        body: "Ya viste que un boss puede frenarte. Abre la tab resaltada de Heroe para empezar a leer tu build y ubicar donde vive cada decision importante de la run.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.HERO_INTRO:
      return {
        title: "Esta es tu Ficha",
        body: "La Ficha resume la identidad de tu heroe: clase, spec, nivel, vida y lectura general de build.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.HERO_SKILLS_INTRO:
      return {
        title: "Abre Atributos",
        body: "Ahora toca la subtab resaltada de Atributos. Ahi gastas oro para reforzar el perfil base de la run.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.SPEND_ATTRIBUTE:
      return {
        title: "Compra 1 punto de Fuerza",
        body: "Empieza por Fuerza para que notes un impacto inmediato al volver a la run. Toca el boton resaltado de esa mejora.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.HERO_TALENTS_INTRO:
      return {
        title: "Abre Talentos",
        body: "La tercera subtab es Talentos. Ahi empiezas a construir la direccion real de la build con nodos persistentes de esta expedicion.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.TALENT_INTRO:
      return {
        title: "Ahora veamos talentos",
        body: "Los talentos definen la direccion real de la build. Primero ubica el arbol y el nodo base; en el siguiente paso vas a comprar el primero.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.BUY_TALENT:
      return {
        title: "Compra tu primer talento",
        body: "Compra el primer nodo resaltado. Ese sera tu primer punto real de build para esta run.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.HERO_CHARACTER_INTRO:
      return {
        title: "Ahora vuelve a Ficha",
        body: "Ya tienes un primer talento. Toca la subtab resaltada de Ficha: ahi vamos a elegir la especializacion de esta build.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
      return {
        title: "Ahora vuelve al boss",
        body: "Ya tienes clase, atributo, talento y especializacion. Sigue y vuelve al combate: el siguiente hito es derrotar al boss de Tier 5.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.EQUIP_INTRO:
      return {
        title: "Ya puedes equiparte",
        body: "Toca el boton resaltado de Mochila. Ahi vas a preparar tu primer item de esta run.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return {
        title: "Equipa tu primer item",
        body: "Baja hasta el primer item resaltado y equipalo para usarlo en esta run.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_BOSS:
      return {
        title: "Has encontrado un boss",
        body: "Un boss no es un monstruo normal: aguanta mas, suele tener mecanicas propias, castiga mas los errores y marca los hitos importantes de una expedicion.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.HUNT_INTRO:
      return {
        title: "Intel ya esta disponible",
        body: "Dentro de Expedicion ahora puedes abrir Intel para ver solo informacion tactica y objetivos ya revelados. Toca la subtab real resaltada.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.EXTRACTION_READY:
      return {
        title: "Aprendamos Extraccion",
        body: "Ya pasaste el primer boss. Toca el boton resaltado de Extraer al Santuario para cerrar bien la run y llevar valor de vuelta a tu base.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO:
      return {
        title: "Elige que cargo rescatar",
        body: "Toca uno de los bundles resaltados para decidir que recursos vuelven al Santuario. Esa sera la materia prima de tus primeras estaciones.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM:
      return {
        title: "Elige un item rescatado",
        body: "Ahora toca una pieza para guardarla temporalmente. Mas adelante decidiremos si se vuelve blueprint o si se desguaza.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.EXTRACTION_CONFIRM:
      return {
        title: "Confirma la extraccion",
        body: "Ya esta todo listo. Confirma la extraccion para volver al Santuario y desbloquear el Laboratorio.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
      return {
        title: "El Santuario ya puede crecer",
        body: "La primera extraccion abre el Laboratorio. Toca el boton real resaltado para abrirlo: desde ahi vas a investigar la Destileria y empezar a procesar cargo real entre expediciones.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.RESEARCH_DISTILLERY:
      return {
        title: "Investiga la Destileria",
        body: "Este es tu primer research de infraestructura. Toca el boton real resaltado de Calibrar Destileria para convertir bundles en recursos persistentes utiles.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.DISTILLERY_READY:
      if (Array.isArray(state?.sanctuary?.jobs) && state.sanctuary.jobs.some(job => job?.station === "laboratory" && job?.input?.researchId === "unlock_distillery" && job?.status === "running")) {
        return {
          title: "La investigacion ya esta corriendo",
          body: "El Laboratorio ya esta calibrando la Destileria. Espera a que termine y luego reclama el trabajo real desde la misma UI.",
          actionLabel: null,
        };
      }
      if (Array.isArray(state?.sanctuary?.jobs) && state.sanctuary.jobs.some(job => job?.station === "laboratory" && job?.input?.researchId === "unlock_distillery" && job?.status === "claimable")) {
        return {
          title: "Reclama la Destileria",
          body: "La investigacion ya termino. Reclama ese trabajo del Laboratorio para abrir la primera estacion persistente del Santuario.",
          actionLabel: null,
        };
      }
      return {
        title: "La Destileria ya esta lista",
        body: "Cuando refines cargo, el Santuario empezara a devolver tinta, flux, polvo y esencia. Toca el control real resaltado para abrir la estacion.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_DISTILLERY_JOB:
      return {
        title: "Inicia tu primera destilacion",
        body: "Abre la Destileria, elige el bundle marcado y mandalo a destilar. No hace falta esperar el resultado ahora: con eso ya habras aprendido el loop base de la estacion.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_ECHOES:
      if (state?.currentTab !== "prestige") {
        return {
          title: "Ahora aprende Ecos",
          body: "Ya viste una estacion persistente. El siguiente sistema meta vive en Ecos: toca la tab primaria real resaltada para abrirla.",
          actionLabel: null,
        };
      }
      return {
        title: "Ecos ya esta activo",
        body: "Acabas de hacer tu primer prestige real. Aqui ves cuantos Ecos tienes disponibles y por que la siguiente run ya arranca distinta. Sigue y en el proximo beat haras tu primera inversion.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
      return {
        title: "Compra tu primer nodo",
        body: "Invierte al menos un Eco en el nodo base resaltado. No hace falta optimizar ahora: lo importante es sentir que la siguiente run ya arranca distinta.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE:
      return {
        title: "Loop completo",
        body: "Listo: ya cerraste una run, aprendiste Santuario y ya invertiste tus primeros Ecos. Puedes volver al Santuario e iniciar otra expedicion; nos vemos de nuevo en tu segunda extraccion.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      return {
        title: "Ahora tambien puedes rescatar items",
        body: "Desde Prestige 2, una extraccion puede traer una pieza temporal. El Stash temporal vive aqui: desde este panel decides si una pieza se vuelve plano o si se desguaza por retorno inmediato.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.BLUEPRINT_DECISION:
      return {
        title: "Haz ambas decisiones una vez",
        body:
          state?.onboarding?.flags?.blueprintScrapped && !state?.onboarding?.flags?.blueprintConverted
            ? "Ya viste el desguace. Ahora convierte otra pieza en blueprint para aprender el camino persistente."
            : !state?.onboarding?.flags?.blueprintScrapped && state?.onboarding?.flags?.blueprintConverted
              ? "Ya hiciste un blueprint. Ahora desguaza otra pieza para ver el retorno inmediato."
              : "Primero haz un desguace y una conversion a blueprint. Asi queda claro para que sirve cada salida del Stash temporal.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION:
      return {
        title: "El plano ya quedo listo",
        body: "Ese blueprint ya entra a tu progreso persistente. Mas adelante podras activarlo para materializar una pieza nueva al inicio de una expedicion.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.DEEP_FORGE_READY:
      return {
        title: "El Taller ya puede investigarse",
        body: "Desde Prestige 3, el Laboratorio ya puede abrir la ruta hacia el Taller. Este beat es solo informativo: en el siguiente momento relevante lo vas a usar de verdad.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE:
      return {
        title: "Usa el Taller",
        body: "Abre la estacion y sube el proyecto marcado. Esta es la primera vez que conviertes una base prometedora en progreso persistente real del Santuario.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.LIBRARY_READY:
      return {
        title: "Biblioteca lista para investigar",
        body: "Desde Prestige 4, el Laboratorio ya puede catalogar la Biblioteca. Este beat solo te avisa que la ruta ya existe dentro del Santuario.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.ERRANDS_READY:
      return {
        title: "Encargos ya pueden organizarse",
        body: "Desde Prestige 5, el Laboratorio ya puede organizar Encargos. A partir de aqui el Santuario gana otra capa de trabajo paralelo entre expediciones.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.SIGIL_ALTAR_READY:
      return {
        title: "Altar de Sigilos listo",
        body: "Desde Prestige 6, el Laboratorio ya puede erigir el Altar de Sigilos. El punto importante es que el Santuario ya puede preparar carreras con mas intencion.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.ABYSS_PORTAL_READY:
      return {
        title: "Ya puedes abrir el Portal al Abismo",
        body: "Derrotaste al boss de Tier 25 y el Santuario ya domina Biblioteca, Encargos y Altar. El siguiente gran salto de cuenta es investigar el Portal al Abismo.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.TIER25_CAP:
      return {
        title: "El mundo base termina en Tier 25",
        body: "No vas a empujar mas arriba desde combate normal. Para romper ese techo debes investigar Portal al Abismo en el Laboratorio cuando el Santuario ya tenga la infraestructura necesaria.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.FIRST_ABYSS:
      return {
        title: "Entraste al Abismo",
        body: "Desde aqui cambian la presion y los techos del run. El Portal rompe Tier 25 y el Abismo pasa a ser tu progresion profunda de cuenta. Sigue empujando y vuelve al Santuario cuando quieras capitalizar el avance.",
        actionLabel: "Seguir",
      };
    default:
      return null;
  }
}

function countUpgradeLevels(player = {}) {
  return Object.values(player?.upgrades || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

function countUnlockedTalents(player = {}) {
  return Array.isArray(player?.unlockedTalents) ? player.unlockedTalents.length : 0;
}

function createTutorialEquipment(state = {}) {
  const slot = state?.player?.equipment?.weapon ? "armor" : "weapon";
  const currentTier = Math.max(1, Number(state?.combat?.currentTier || 1));
  const baseItem =
    ITEMS.find(item => item.rarity === "common" && item.type === slot) ||
    ITEMS.find(item => item.type === slot) ||
    null;
  if (!baseItem) return null;
  return materializeItem({
    baseItem,
    rarity: baseItem.rarity || "common",
    tier: currentTier,
  });
}

function injectTutorialEquipment(nextState) {
  if ((nextState?.player?.inventory || []).length > 0) return nextState;
  const tutorialItem = createTutorialEquipment(nextState);
  if (!tutorialItem) return nextState;
  const result = addToInventory(nextState.player?.inventory || [], tutorialItem);
  return {
    ...nextState,
    player: {
      ...nextState.player,
      inventory: result.inventory,
    },
    combat: {
      ...nextState.combat,
      log: [
        ...(nextState?.combat?.log || []),
        "TUTORIAL: el Santuario recupera una pieza basica para que aprendas a equiparte.",
      ].slice(-20),
    },
  };
}

function getStrengthTutorialGold(player = {}) {
  const strengthUpgrade = PLAYER_UPGRADES.find(upgrade => upgrade.id === "damage");
  if (!strengthUpgrade) return 300;
  const currentLevel = Math.max(0, Number(player?.upgrades?.damage || 0));
  const nextCost = Math.floor(
    strengthUpgrade.baseCost * Math.pow(strengthUpgrade.costMultiplier, currentLevel)
  );
  return Math.max(300, nextCost + 20);
}

function createTutorialCargoBundle() {
  return {
    id: "tutorial_distillery_bundle",
    type: "essence_cache",
    label: "Lote de prueba",
    description: "Bundle generico del tutorial para aprender la primera destilacion.",
    quantity: 1,
  };
}

function ensureTutorialCargoBundle(nextState) {
  const cargoInventory = Array.isArray(nextState?.sanctuary?.cargoInventory) ? nextState.sanctuary.cargoInventory : [];
  if (cargoInventory.length > 0) return nextState;
  return {
    ...nextState,
    sanctuary: {
      ...nextState.sanctuary,
      cargoInventory: [createTutorialCargoBundle()],
    },
  };
}

function createTutorialExtractedItem(nextState, slot = "weapon") {
  const currentTier = Math.max(6, Number(nextState?.combat?.maxTier || nextState?.combat?.currentTier || 6));
  const baseItem =
    ITEMS.find(item => item.type === slot && item.rarity === "rare") ||
    ITEMS.find(item => item.type === slot) ||
    null;
  if (!baseItem) return null;
  const materialized = materializeItem({
    baseItem,
    rarity: baseItem.rarity || "rare",
    tier: currentTier,
  });
  return buildExtractedItemRecord(materialized, { source: "tutorial" });
}

function ensureTutorialBlueprintItems(nextState) {
  const extractedItems = Array.isArray(nextState?.sanctuary?.extractedItems) ? nextState.sanctuary.extractedItems : [];
  if (extractedItems.length >= 2) return nextState;
  const nextExtractedItems = [...extractedItems];
  const needed = 2 - nextExtractedItems.length;
  for (let index = 0; index < needed; index += 1) {
    const slot = nextExtractedItems.some(item => item?.type === "weapon") ? "armor" : "weapon";
    const tutorialItem = createTutorialExtractedItem(nextState, slot);
    if (tutorialItem) nextExtractedItems.push(tutorialItem);
  }
  return {
    ...nextState,
    sanctuary: {
      ...nextState.sanctuary,
      extractedItems: nextExtractedItems,
    },
  };
}

function ensureTutorialDeepForgeProject(nextState) {
  const stash = Array.isArray(nextState?.sanctuary?.stash) ? nextState.sanctuary.stash : [];
  if (stash.length > 0) return nextState;
  const baseItem =
    ITEMS.find(item => item.type === "weapon" && item.rarity === "rare") ||
    ITEMS.find(item => item.type === "weapon") ||
    null;
  if (!baseItem) return nextState;
  const tutorialItem = materializeItem({
    baseItem,
    rarity: baseItem.rarity || "rare",
    tier: Math.max(10, Number(nextState?.combat?.maxTier || nextState?.combat?.currentTier || 10)),
  });
  const tutorialProject = {
    id: `project_tutorial_${tutorialItem.id}`,
    sourceItemId: tutorialItem.id,
    name: tutorialItem.name,
    rarity: tutorialItem.rarity,
    type: tutorialItem.type,
    baseType: tutorialItem.baseType || tutorialItem.subtype || tutorialItem.type,
    rating: tutorialItem.rating || 0,
    baseRating: tutorialItem.rating || 0,
    affixes: Array.isArray(tutorialItem.affixes) ? tutorialItem.affixes.map(affix => ({ ...affix })) : [],
    baseAffixes: Array.isArray(tutorialItem.affixes) ? tutorialItem.affixes.map(affix => ({ ...affix })) : [],
    legendaryPowerId: tutorialItem.legendaryPowerId || null,
    projectTier: 0,
    upgradeLevel: 0,
    upgradeCap: 15,
    ascensionTier: 0,
    powerTier: tutorialItem.legendaryPowerId ? 1 : 0,
    createdAt: Date.now(),
    sourceMeta: { source: "tutorial" },
  };
  if (!tutorialProject) return nextState;
  return {
    ...nextState,
    sanctuary: {
      ...nextState.sanctuary,
      stash: [tutorialProject],
    },
  };
}

function withNextStep(nextState, onboarding, step, extra = {}) {
  return {
    ...nextState,
    currentTab: extra.currentTab ?? nextState.currentTab,
    player: extra.player ?? nextState.player,
    onboarding: {
      ...onboarding,
      ...extra.onboarding,
      step,
      bossHeroDelayTicks:
        extra.onboarding?.bossHeroDelayTicks == null
          ? onboarding?.bossHeroDelayTicks || 0
          : extra.onboarding.bossHeroDelayTicks,
    },
  };
}

export function getBlockedOnboardingAction(step = null, action = {}, state = {}) {
  const type = action?.type;
  const interactionMode = getOnboardingStepInteractionMode(step, state);
  if (!step) return false;
  const requiredTab = getOnboardingRequiredTab(step);
  if (type === "TOGGLE_THEME" || type === "SET_THEME") return false;
  if (type === "ACK_ONBOARDING_STEP") return false;
  if (type === "RESET_ALL_PROGRESS") return false;
  if (
    requiredTab === "sanctuary" &&
    ["ENTER_EXPEDITION_SETUP", "SELECT_RUN_SIGIL", "START_RUN"].includes(type)
  ) {
    return true;
  }
  if (type === "SET_TAB") {
    if (["registry", "system", "stats", "achievements"].includes(action?.tab)) {
      return false;
    }
    if (step === ONBOARDING_STEPS.OPEN_HERO) {
      return !["character", "skills", "talents"].includes(action?.tab);
    }
    if (step === ONBOARDING_STEPS.HERO_SKILLS_INTRO) {
      return action?.tab !== "skills";
    }
    if (step === ONBOARDING_STEPS.HERO_TALENTS_INTRO) {
      return action?.tab !== "talents";
    }
    if (step === ONBOARDING_STEPS.HERO_CHARACTER_INTRO) {
      return action?.tab !== "character";
    }
  }
  if (type === "SET_TAB") {
    return !isOnboardingTabAllowed(step, action?.tab || "sanctuary");
  }

  switch (step) {
    case ONBOARDING_STEPS.CHOOSE_CLASS:
      return type !== "SELECT_CLASS";
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.COMBAT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.AUTO_ADVANCE:
      return type !== "TOGGLE_AUTO_ADVANCE";
    case ONBOARDING_STEPS.FIRST_DEATH:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.CHOOSE_SPEC:
      return type !== "SELECT_SPECIALIZATION";
    case ONBOARDING_STEPS.HERO_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.SPEND_ATTRIBUTE:
      return !(type === "UPGRADE_PLAYER" && action?.upgradeId === "damage");
    case ONBOARDING_STEPS.TALENT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.BUY_TALENT:
      return type !== "UPGRADE_TALENT_NODE" && type !== "UNLOCK_TALENT";
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.EQUIP_INTRO:
      return !(type === "SET_TAB" && action?.tab === "inventory");
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return type !== "EQUIP_ITEM";
    case ONBOARDING_STEPS.FIRST_BOSS:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.HUNT_INTRO:
      return !(type === "SET_TAB" && action?.tab === "codex") && type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.EXTRACTION_READY:
      return type !== "OPEN_EXTRACTION";
    case ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO:
      return type !== "SELECT_EXTRACTION_CARGO";
    case ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM:
      return type !== "SELECT_EXTRACTION_PROJECT";
    case ONBOARDING_STEPS.EXTRACTION_CONFIRM:
      return type !== "CONFIRM_EXTRACTION";
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.RESEARCH_DISTILLERY: {
      const researchId = action?.researchId || action?.payload?.researchId || "";
      return !(type === "START_LAB_RESEARCH" && researchId === "unlock_distillery");
    }
    case ONBOARDING_STEPS.DISTILLERY_READY:
      if (interactionMode === "info") return type !== "ACK_ONBOARDING_STEP";
      return !(type === "CLAIM_SANCTUARY_JOB" || type === "ACK_ONBOARDING_STEP");
    case ONBOARDING_STEPS.FIRST_DISTILLERY_JOB:
      return type !== "START_DISTILLERY_JOB";
    case ONBOARDING_STEPS.FIRST_ECHOES:
      if (interactionMode === "info") {
        return type !== "ACK_ONBOARDING_STEP";
      }
      return !(type === "SET_TAB" && action?.tab === "prestige");
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
      return type !== "BUY_PRESTIGE_NODE";
    case ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.BLUEPRINT_DECISION:
      return type !== "CONVERT_EXTRACTED_ITEM_TO_BLUEPRINT" && type !== "START_SCRAP_EXTRACTED_ITEM_JOB";
    case ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.DEEP_FORGE_READY:
    case ONBOARDING_STEPS.LIBRARY_READY:
    case ONBOARDING_STEPS.ERRANDS_READY:
    case ONBOARDING_STEPS.SIGIL_ALTAR_READY:
    case ONBOARDING_STEPS.ABYSS_PORTAL_READY: {
      return type !== "ACK_ONBOARDING_STEP";
    }
    case ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE:
      return type !== "START_DEEP_FORGE_JOB";
    case ONBOARDING_STEPS.TIER25_CAP:
    case ONBOARDING_STEPS.FIRST_ABYSS:
      return type !== "ACK_ONBOARDING_STEP";
    default:
      return false;
  }
}

export function advanceOnboarding(prevState, nextState, action = {}) {
  const previous = normalizeOnboardingState(prevState?.onboarding);
  let onboarding = normalizeOnboardingState(nextState?.onboarding || previous);
  if (onboarding.completed) {
    return {
      ...nextState,
      onboarding,
    };
  }

  const prevUpgradeLevels = countUpgradeLevels(prevState?.player);
  const nextUpgradeLevels = countUpgradeLevels(nextState?.player);
  const prevTalents = countUnlockedTalents(prevState?.player);
  const nextTalents = countUnlockedTalents(nextState?.player);
  const hasInventoryItem = (nextState?.player?.inventory || []).length > 0;
  const nextKills = Number(nextState?.combat?.sessionKills || 0);
  const prevCombatTier = Math.max(1, Number(prevState?.combat?.currentTier || 1));
  const prevDeaths = Number(prevState?.stats?.deaths || 0);
  const nextDeaths = Number(nextState?.stats?.deaths || 0);
  const prevBossKills = Number(prevState?.combat?.runStats?.bossKills || prevState?.combat?.analytics?.bossKills || 0);
  const nextBossKills = Number(nextState?.combat?.runStats?.bossKills || nextState?.combat?.analytics?.bossKills || 0);
  const prevEnemyWasBoss = Boolean(prevState?.combat?.enemy?.isBoss);
  const currentEnemyIsBoss = Boolean(nextState?.combat?.enemy?.isBoss);
  const hasEquippedItem = Boolean(
    nextState?.player?.equipment?.weapon ||
    nextState?.player?.equipment?.armor ||
    prevState?.player?.equipment?.weapon ||
    prevState?.player?.equipment?.armor
  );
  const bossEncounteredNow = currentEnemyIsBoss || prevEnemyWasBoss || nextBossKills > prevBossKills;
  const currentCombatTier = Math.max(1, Number(nextState?.combat?.currentTier || 1));
  const maxCombatTier = Math.max(
    currentCombatTier,
    Number(nextState?.combat?.maxTier || 1),
    Number(prevState?.combat?.maxTier || 1),
    Number(prevState?.combat?.currentTier || 1)
  );
  const bossTierReached = maxCombatTier >= 5;
  const currentTier = Math.max(
    currentCombatTier,
    Number(nextState?.combat?.maxTier || 1)
  );
  const prevPrestigeLevel = Number(prevState?.prestige?.level || 0);
  const nextPrestigeLevel = Number(nextState?.prestige?.level || 0);
  const prevPrestigeNodes = Object.values(prevState?.prestige?.nodes || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const nextPrestigeNodes = Object.values(nextState?.prestige?.nodes || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const nextLaboratoryCompleted = nextState?.sanctuary?.laboratory?.completed || {};
  const nextAbyssPortalUnlocked = Boolean(nextState?.abyss?.portalUnlocked);
  const nextTier25BossCleared = Boolean(nextState?.abyss?.tier25BossCleared);
  const nextExpeditionPhase = nextState?.expedition?.phase || "sanctuary";
  const expeditionInRunFlow = nextExpeditionPhase === "active" || nextExpeditionPhase === "setup";
  const currentStepRequiredTab = getOnboardingRequiredTab(onboarding.step);
  const runCompatibleOnboardingTabs = new Set(["combat", "character", "skills", "talents", "inventory", "crafting", "codex"]);
  const firstItemReady = onboarding.flags.firstItemEquipped || hasEquippedItem;
  const bossPhaseUnlocked =
    onboarding.flags.firstBossSeen ||
    onboarding.bossHeroQueued ||
    prevBossKills > 0 ||
    nextBossKills > 0 ||
    bossEncounteredNow ||
    bossTierReached;
  const canOpenHeroAfterBoss =
    !onboarding.flags.heroIntroSeen &&
    nextState?.player?.class &&
    bossPhaseUnlocked;
  const alreadyInsideHeroFlow = ["character", "skills", "talents"].includes(nextState?.currentTab || "sanctuary");
  const claimedJob =
    action.type === "CLAIM_SANCTUARY_JOB"
      ? (Array.isArray(prevState?.sanctuary?.jobs)
          ? prevState.sanctuary.jobs.find(job => job?.id === (action.jobId || action.payload?.jobId))
          : null)
      : null;

  if (
    expeditionInRunFlow &&
    currentStepRequiredTab &&
    !runCompatibleOnboardingTabs.has(currentStepRequiredTab)
  ) {
    onboarding = {
      ...onboarding,
      step: null,
    };
  }

  if (!onboarding.flags.firstItemEquipped && hasEquippedItem) {
    onboarding = {
      ...onboarding,
      flags: {
        ...onboarding.flags,
        firstItemEquipped: true,
        inventoryUnlocked: true,
      },
    };
  }

  if (action.type === "ACK_ONBOARDING_STEP") {
    if (onboarding.step === ONBOARDING_STEPS.EXPEDITION_INTRO) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          flags: {
            ...onboarding.flags,
            expeditionIntroSeen: true,
          },
        },
        ONBOARDING_STEPS.CHOOSE_CLASS,
        { currentTab: "sanctuary" }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.COMBAT_INTRO) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          combatIntroSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_DEATH) {
      if (onboarding.bossHeroQueued && canOpenHeroAfterBoss) {
        return {
          ...nextState,
          onboarding: {
            ...onboarding,
            step: null,
            bossHeroDelayTicks: 2,
            bossHeroQueued: false,
            flags: {
              ...onboarding.flags,
              firstDeathSeen: true,
            },
          },
          currentTab: "combat",
        };
      }
      onboarding = {
        ...onboarding,
        step: null,
        bossHeroQueued: false,
        flags: {
          ...onboarding.flags,
          firstDeathSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.HERO_INTRO) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          flags: {
            ...onboarding.flags,
            heroIntroSeen: true,
          },
        },
        ONBOARDING_STEPS.HERO_SKILLS_INTRO,
        {
          currentTab: "character",
        }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.TALENT_INTRO) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.BUY_TALENT, {
        currentTab: "talents",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.COMBAT_AFTER_TALENT) {
      onboarding = {
        ...onboarding,
        step: null,
      };
      nextState = {
        ...nextState,
        currentTab: "combat",
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_BOSS) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstBossSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.HUNT_INTRO) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          huntUnlocked: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.EXTRACTION_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          extractionUnlocked: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.RESEARCH_DISTILLERY, {
        currentTab: "sanctuary",
      });
    } else if (onboarding.step === ONBOARDING_STEPS.DISTILLERY_READY) {
      onboarding = {
        ...onboarding,
        step: null,
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_ECHOES) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          flags: {
            ...onboarding.flags,
            firstEchoesSeen: true,
          },
        },
        ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE,
        { currentTab: "prestige" }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstPrestigeCloseSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.BLUEPRINT_INTRO) {
      return withNextStep(
        ensureTutorialBlueprintItems(nextState),
        {
          ...onboarding,
          flags: {
            ...onboarding.flags,
            blueprintDecisionUnlocked: true,
          },
        },
        ONBOARDING_STEPS.BLUEPRINT_DECISION,
        { currentTab: "sanctuary" }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstBlueprintMaterializationSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.DEEP_FORGE_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          deepForgeReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.LIBRARY_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          libraryReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.ERRANDS_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          errandsReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.SIGIL_ALTAR_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          sigilAltarReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.ABYSS_PORTAL_READY) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          abyssPortalReadySeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.TIER25_CAP) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          tier25CapSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_ABYSS) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstAbyssSeen: true,
        },
      };
    }
  }

  if (
    onboarding.step === ONBOARDING_STEPS.EQUIP_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "inventory"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.EQUIP_FIRST_ITEM, {
      currentTab: "inventory",
      onboarding: {
        flags: {
          ...onboarding.flags,
          inventoryUnlocked: true,
        },
      },
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.HERO_SKILLS_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "skills"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.SPEND_ATTRIBUTE, {
      currentTab: "skills",
      player: {
        ...nextState.player,
        gold: Math.max(Number(nextState?.player?.gold || 0), getStrengthTutorialGold(nextState?.player)),
      },
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.HERO_TALENTS_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "talents"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.TALENT_INTRO, {
      currentTab: "talents",
    });
  }

  if (!onboarding.flags.classChosen && nextState?.player?.class) {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          classChosen: true,
        },
      },
      currentTab: "combat",
    };
  }

  if (!onboarding.flags.autoAdvanceUnlocked && (nextKills >= 3 || currentCombatTier >= 2) && !onboarding.step) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.AUTO_ADVANCE, { currentTab: "combat" });
  }

  if (onboarding.step === ONBOARDING_STEPS.AUTO_ADVANCE && action.type === "TOGGLE_AUTO_ADVANCE") {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        bossHeroQueued: false,
        flags: {
          ...onboarding.flags,
          autoAdvanceUnlocked: true,
        },
      },
    };
  }

  if (!onboarding.flags.firstDeathSeen && nextDeaths > prevDeaths) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        bossHeroQueued: bossPhaseUnlocked || prevEnemyWasBoss,
      },
      ONBOARDING_STEPS.FIRST_DEATH,
      { currentTab: "combat" }
    );
  }

  if (canOpenHeroAfterBoss && prevEnemyWasBoss && nextDeaths > prevDeaths && !onboarding.step) {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        bossHeroDelayTicks: 2,
        bossHeroQueued: false,
        flags: {
          ...onboarding.flags,
        },
      },
    };
  }

  if (canOpenHeroAfterBoss && !onboarding.step && onboarding.bossHeroDelayTicks > 0) {
    const tickAdvance =
      action.type === "BULK_TICK"
        ? Math.max(1, Math.floor(Number(action.count || 0)))
        : action.type === "TICK"
          ? 1
          : 0;
    if (tickAdvance > 0) {
      const remainingTicks = Math.max(0, onboarding.bossHeroDelayTicks - tickAdvance);
      if (remainingTicks <= 0) {
        return withNextStep(
          nextState,
          {
            ...onboarding,
            bossHeroDelayTicks: 0,
            flags: {
              ...onboarding.flags,
              heroTabUnlocked: true,
            },
          },
          ONBOARDING_STEPS.OPEN_HERO,
          { currentTab: "combat" }
        );
      }
      return {
        ...nextState,
        onboarding: {
          ...onboarding,
          step: null,
          bossHeroDelayTicks: remainingTicks,
          flags: {
            ...onboarding.flags,
          },
        },
      };
    }
  }

  if (
    onboarding.step === ONBOARDING_STEPS.OPEN_HERO &&
    action.type === "SET_TAB" &&
    ["character", "skills", "talents"].includes(action.tab)
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.HERO_INTRO, {
      currentTab: "character",
    });
  }

  if (
    canOpenHeroAfterBoss &&
    !onboarding.step &&
    onboarding.bossHeroDelayTicks <= 0 &&
    onboarding.flags.firstDeathSeen &&
    !onboarding.flags.heroTabUnlocked &&
    nextExpeditionPhase === "active"
  ) {
    if (alreadyInsideHeroFlow) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          bossHeroDelayTicks: 0,
          flags: {
            ...onboarding.flags,
            heroTabUnlocked: true,
          },
        },
        ONBOARDING_STEPS.HERO_INTRO,
        { currentTab: "character" }
      );
    }
    return withNextStep(
      nextState,
      {
        ...onboarding,
        bossHeroDelayTicks: 0,
        flags: {
          ...onboarding.flags,
          heroTabUnlocked: true,
        },
      },
      ONBOARDING_STEPS.OPEN_HERO,
      { currentTab: "combat" }
    );
  }

  if (
    canOpenHeroAfterBoss &&
    !onboarding.step &&
    onboarding.bossHeroDelayTicks <= 0 &&
    prevCombatTier >= 5 &&
    currentCombatTier <= 4 &&
    nextDeaths === prevDeaths
  ) {
    if (alreadyInsideHeroFlow) {
      return withNextStep(
        nextState,
        {
          ...onboarding,
          bossHeroDelayTicks: 0,
          flags: {
            ...onboarding.flags,
            heroTabUnlocked: true,
          },
        },
        ONBOARDING_STEPS.HERO_INTRO,
        { currentTab: "character" }
      );
    }
    return withNextStep(
      nextState,
      {
        ...onboarding,
        bossHeroDelayTicks: 0,
        flags: {
          ...onboarding.flags,
          heroTabUnlocked: true,
        },
      },
      ONBOARDING_STEPS.OPEN_HERO,
      { currentTab: "combat" }
    );
  }

  if (!onboarding.flags.specChosen && nextState?.player?.specialization) {
    const shouldReturnToCombat = onboarding.flags.firstTalentBought || onboarding.step === ONBOARDING_STEPS.CHOOSE_SPEC;
    return withNextStep(
      nextState,
      {
        ...onboarding,
        bossHeroDelayTicks: 0,
        bossHeroQueued: false,
        flags: {
          ...onboarding.flags,
          specChosen: true,
        },
      },
      shouldReturnToCombat ? ONBOARDING_STEPS.COMBAT_AFTER_TALENT : ONBOARDING_STEPS.HERO_INTRO,
      {
        currentTab: shouldReturnToCombat ? "combat" : "character",
        player: {
          ...nextState.player,
          gold: Math.max(Number(nextState?.player?.gold || 0), 300),
        },
      }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.SPEND_ATTRIBUTE &&
    action.type === "UPGRADE_PLAYER" &&
    action.upgradeId === "damage" &&
    nextState !== prevState
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstAttributeSpent: true,
        },
      },
      ONBOARDING_STEPS.HERO_TALENTS_INTRO
    );
  }

  if (onboarding.step === ONBOARDING_STEPS.BUY_TALENT && nextTalents > prevTalents) {
    const nextStep =
      !onboarding.flags.specChosen &&
      nextState?.player?.class &&
      !nextState?.player?.specialization
        ? ONBOARDING_STEPS.HERO_CHARACTER_INTRO
        : ONBOARDING_STEPS.COMBAT_AFTER_TALENT;
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstTalentBought: true,
        },
      },
      nextStep,
      {
        currentTab: nextState?.currentTab,
      }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.HERO_CHARACTER_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "character"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.CHOOSE_SPEC, {
      currentTab: "character",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.EXTRACTION_READY &&
    action.type === "OPEN_EXTRACTION"
  ) {
    const preview = nextState?.expedition?.extractionPreview || {};
    const hasProjectOptions = Array.isArray(preview?.projectOptions) && preview.projectOptions.length > 0;
    const hasCargoOptions = Array.isArray(preview?.cargoOptions) && preview.cargoOptions.length > 0;
    return withNextStep(
      nextState,
      {
        ...onboarding,
        extractionReadyDelayTicks: 0,
        flags: {
          ...onboarding.flags,
          extractionUnlocked: true,
        },
      },
      hasCargoOptions
        ? ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO
        : hasProjectOptions
          ? ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM
          : ONBOARDING_STEPS.EXTRACTION_CONFIRM,
      { currentTab: "sanctuary" }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO &&
    action.type === "SELECT_EXTRACTION_CARGO"
  ) {
    const selectedCargoCount = Array.isArray(nextState?.expedition?.selectedCargoIds)
      ? nextState.expedition.selectedCargoIds.length
      : 0;
    if (selectedCargoCount > 0) {
      const hasProjectOptions = Array.isArray(nextState?.expedition?.extractionPreview?.projectOptions)
        && nextState.expedition.extractionPreview.projectOptions.length > 0
        && Number(nextState?.expedition?.extractionPreview?.availableSlots?.project || 0) > 0;
      return withNextStep(
        nextState,
        onboarding,
        hasProjectOptions ? ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM : ONBOARDING_STEPS.EXTRACTION_CONFIRM,
        { currentTab: "sanctuary" }
      );
    }
  }

  if (
    onboarding.step === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM &&
    action.type === "SELECT_EXTRACTION_PROJECT"
  ) {
    if (nextState?.expedition?.selectedProjectItemId) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.EXTRACTION_CONFIRM, {
        currentTab: "sanctuary",
      });
    }
  }

  if (
    onboarding.flags.autoAdvanceUnlocked &&
    !onboarding.flags.firstItemEquipped &&
    !onboarding.flags.inventoryUnlocked &&
    !onboarding.step &&
    currentTier >= 3
  ) {
    const ensuredState = hasInventoryItem ? nextState : injectTutorialEquipment(nextState);
    return withNextStep(ensuredState, onboarding, ONBOARDING_STEPS.EQUIP_INTRO, {
      currentTab: "combat",
    });
  }

  if (onboarding.step === ONBOARDING_STEPS.EQUIP_FIRST_ITEM && action.type === "EQUIP_ITEM") {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstItemEquipped: true,
          inventoryUnlocked: true,
        },
      },
      currentTab: "combat",
      combat: {
        ...nextState.combat,
        log: [
          ...(nextState?.combat?.log || []),
          "TUTORIAL: ya controlas la base de la expedicion. Ahora empezaras a ver bosses, Intel y el cierre correcto de una run.",
        ].slice(-20),
      },
    };
  }

  if (
    !onboarding.flags.firstBossSeen &&
    !onboarding.step &&
    firstItemReady &&
    nextExpeditionPhase === "active" &&
    (bossEncounteredNow || bossTierReached || nextBossKills > 0)
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_BOSS, { currentTab: "combat" });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.HUNT_INTRO &&
    action.type === "SET_TAB" &&
    action.tab === "codex"
  ) {
    return {
      ...nextState,
      currentTab: "codex",
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          huntUnlocked: true,
        },
      },
    };
  }

  if (
    onboarding.flags.firstBossSeen &&
    !onboarding.flags.huntUnlocked &&
    !onboarding.step &&
    nextBossKills > 0
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.HUNT_INTRO, { currentTab: "combat" });
  }

  if (
    onboarding.flags.huntUnlocked &&
    !onboarding.flags.extractionUnlocked &&
    !onboarding.step &&
    currentTier >= 6 &&
    onboarding.extractionReadyDelayTicks <= 0
  ) {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        extractionReadyDelayTicks: 2,
        flags: {
          ...onboarding.flags,
        },
      },
    };
  }

  if (
    onboarding.flags.huntUnlocked &&
    !onboarding.flags.extractionUnlocked &&
    !onboarding.step &&
    onboarding.extractionReadyDelayTicks > 0
  ) {
    const tickAdvance =
      action.type === "BULK_TICK"
        ? Math.max(1, Math.floor(Number(action.count || 0)))
        : action.type === "TICK"
          ? 1
          : 0;
    if (tickAdvance > 0) {
      const remainingTicks = Math.max(0, onboarding.extractionReadyDelayTicks - tickAdvance);
      if (remainingTicks <= 0) {
        return withNextStep(
          nextState,
          {
            ...onboarding,
            extractionReadyDelayTicks: 0,
          },
          ONBOARDING_STEPS.EXTRACTION_READY,
          { currentTab: "combat" }
        );
      }
      return {
        ...nextState,
        onboarding: {
          ...onboarding,
          step: null,
          extractionReadyDelayTicks: remainingTicks,
          flags: {
            ...onboarding.flags,
          },
        },
      };
    }
  }

  if (action.type === "CONFIRM_EXTRACTION" && !onboarding.flags.firstExtractionCompleted) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstExtractionCompleted: true,
          laboratoryUnlocked: true,
        },
      },
      ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN,
      { currentTab: "sanctuary" }
    );
  }

  if (
    onboarding.step === ONBOARDING_STEPS.RESEARCH_DISTILLERY &&
    action.type === "START_LAB_RESEARCH" &&
    (action.researchId || action.payload?.researchId) === "unlock_distillery"
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.DISTILLERY_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    [
      ONBOARDING_STEPS.DEEP_FORGE_READY,
      ONBOARDING_STEPS.LIBRARY_READY,
      ONBOARDING_STEPS.ERRANDS_READY,
      ONBOARDING_STEPS.SIGIL_ALTAR_READY,
      ONBOARDING_STEPS.ABYSS_PORTAL_READY,
    ].includes(onboarding.step) &&
    action.type === "START_LAB_RESEARCH" &&
    (action.researchId || action.payload?.researchId) === getOnboardingResearchTargetId(onboarding.step)
  ) {
    const readyFlags = {
      [ONBOARDING_STEPS.DEEP_FORGE_READY]: "deepForgeReadySeen",
      [ONBOARDING_STEPS.LIBRARY_READY]: "libraryReadySeen",
      [ONBOARDING_STEPS.ERRANDS_READY]: "errandsReadySeen",
      [ONBOARDING_STEPS.SIGIL_ALTAR_READY]: "sigilAltarReadySeen",
      [ONBOARDING_STEPS.ABYSS_PORTAL_READY]: "abyssPortalReadySeen",
    };
    const readyFlag = readyFlags[onboarding.step];
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          ...(readyFlag ? { [readyFlag]: true } : {}),
        },
      },
    };
  }

  if (
    claimedJob?.type === "laboratory_research" &&
    claimedJob?.input?.researchId === "unlock_distillery" &&
    !onboarding.flags.distilleryUnlocked
  ) {
    return withNextStep(
      ensureTutorialCargoBundle(nextState),
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryUnlocked: true,
        },
      },
      ONBOARDING_STEPS.FIRST_DISTILLERY_JOB,
      { currentTab: "sanctuary" }
    );
  }

  if (
    !onboarding.flags.firstEchoesSeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 1 &&
    onboarding.flags.distilleryJobStarted &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_ECHOES, {
      currentTab: "sanctuary",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.FIRST_ECHOES &&
    action.type === "SET_TAB" &&
    action.tab === "prestige"
  ) {
    return {
      ...nextState,
      currentTab: "prestige",
      onboarding: {
        ...onboarding,
        step: ONBOARDING_STEPS.FIRST_ECHOES,
        flags: {
          ...onboarding.flags,
          firstEchoTabOpened: true,
        },
      },
    };
  }

  if (
    onboarding.step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB &&
    action.type === "START_DISTILLERY_JOB"
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryJobStarted: true,
        },
      },
      ONBOARDING_STEPS.FIRST_ECHOES,
      { currentTab: "sanctuary" }
    );
  }

  if (onboarding.step === ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE && nextPrestigeNodes > prevPrestigeNodes) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstEchoNodeBought: true,
        },
      },
      ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE,
      { currentTab: "prestige" }
    );
  }

  if (
    !onboarding.flags.blueprintDecisionUnlocked &&
    !onboarding.step &&
    onboarding.flags.firstEchoNodeBought &&
    nextPrestigeLevel >= 2 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.BLUEPRINT_INTRO, {
      currentTab: "sanctuary",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
    action.type === "START_SCRAP_EXTRACTED_ITEM_JOB"
  ) {
    const nextFlags = {
      ...onboarding.flags,
      blueprintScrapped: true,
    };
    if (nextFlags.blueprintConverted) {
      return withNextStep(nextState, { ...onboarding, flags: nextFlags }, ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION, {
        currentTab: "sanctuary",
      });
    }
    return {
      ...ensureTutorialBlueprintItems(nextState),
      onboarding: {
        ...onboarding,
        step: ONBOARDING_STEPS.BLUEPRINT_DECISION,
        flags: nextFlags,
      },
    };
  }

  if (
    onboarding.step === ONBOARDING_STEPS.BLUEPRINT_DECISION &&
    action.type === "CONVERT_EXTRACTED_ITEM_TO_BLUEPRINT"
  ) {
    const nextFlags = {
      ...onboarding.flags,
      blueprintConverted: true,
    };
    if (nextFlags.blueprintScrapped) {
      return withNextStep(nextState, { ...onboarding, flags: nextFlags }, ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION, {
        currentTab: "sanctuary",
      });
    }
    return {
      ...ensureTutorialBlueprintItems(nextState),
      onboarding: {
        ...onboarding,
        step: ONBOARDING_STEPS.BLUEPRINT_DECISION,
        flags: nextFlags,
      },
    };
  }

  if (
    !onboarding.flags.deepForgeReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 3 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.DEEP_FORGE_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.firstDeepForgeUseSeen &&
    !onboarding.step &&
    Boolean(nextState?.sanctuary?.stations?.deepForge?.unlocked) &&
    !expeditionInRunFlow
  ) {
    return withNextStep(ensureTutorialDeepForgeProject(nextState), onboarding, ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.libraryReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 4 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.LIBRARY_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.errandsReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 5 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.ERRANDS_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.sigilAltarReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 6 &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.SIGIL_ALTAR_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.abyssPortalReadySeen &&
    !onboarding.step &&
    nextTier25BossCleared &&
    !nextAbyssPortalUnlocked &&
    nextLaboratoryCompleted.unlock_library &&
    nextLaboratoryCompleted.unlock_errands &&
    nextLaboratoryCompleted.unlock_sigil_altar &&
    !expeditionInRunFlow
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.ABYSS_PORTAL_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.tier25CapSeen &&
    !onboarding.step &&
    nextTier25BossCleared &&
    !nextAbyssPortalUnlocked
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.TIER25_CAP, {
      currentTab: "combat",
    });
  }

  if (
    onboarding.step === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE &&
    action.type === "START_DEEP_FORGE_JOB"
  ) {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstDeepForgeUseSeen: true,
        },
      },
    };
  }

  if (
    !onboarding.flags.firstAbyssSeen &&
    !onboarding.step &&
    nextAbyssPortalUnlocked &&
    Math.max(
      Number(nextState?.combat?.currentTier || 1),
      Number(nextState?.combat?.maxTier || 1),
      Number(nextState?.abyss?.highestTierReached || 1)
    ) >= 26
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_ABYSS, {
      currentTab: "combat",
    });
  }

  const requiredTab = getOnboardingRequiredTab(onboarding.step);
  if (expeditionInRunFlow && requiredTab && requiredTab !== "combat") {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: onboarding.step,
        flags: {
          ...onboarding.flags,
        },
      },
    };
  }
  if (
    requiredTab &&
    nextState?.currentTab !== requiredTab &&
    !isOnboardingTabAllowed(onboarding.step, nextState?.currentTab || "sanctuary")
  ) {
    return {
      ...nextState,
      currentTab: requiredTab,
      onboarding: {
        ...onboarding,
        step: onboarding.step,
        flags: {
          ...onboarding.flags,
        },
      },
    };
  }

  return {
    ...nextState,
    onboarding: {
      ...onboarding,
      step: onboarding.step,
      flags: {
        ...onboarding.flags,
      },
    },
  };
}

export function getOnboardingOverlayAnchor(step = null) {
  if (step === ONBOARDING_STEPS.EQUIP_INTRO) return "subnav";
  if (step === ONBOARDING_STEPS.HERO_INTRO) return "bottom";
  if (step === ONBOARDING_STEPS.BUY_TALENT) return "top";
  if (
    step === ONBOARDING_STEPS.HERO_SKILLS_INTRO ||
    step === ONBOARDING_STEPS.HERO_TALENTS_INTRO ||
    step === ONBOARDING_STEPS.HERO_CHARACTER_INTRO
  ) {
    return "subnav";
  }
  if (step === ONBOARDING_STEPS.HUNT_INTRO) return "subnav";
  if (
    step === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN ||
    step === ONBOARDING_STEPS.RESEARCH_DISTILLERY ||
    step === ONBOARDING_STEPS.DISTILLERY_READY ||
    step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB ||
    step === ONBOARDING_STEPS.SPEND_ATTRIBUTE ||
    step === ONBOARDING_STEPS.BUY_TALENT ||
    step === ONBOARDING_STEPS.FIRST_ECHOES ||
    step === ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE ||
    step === ONBOARDING_STEPS.FIRST_PRESTIGE_CLOSE ||
    step === ONBOARDING_STEPS.BLUEPRINT_INTRO ||
    step === ONBOARDING_STEPS.BLUEPRINT_DECISION ||
    step === ONBOARDING_STEPS.FIRST_BLUEPRINT_MATERIALIZATION ||
    step === ONBOARDING_STEPS.DEEP_FORGE_READY ||
    step === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE ||
    step === ONBOARDING_STEPS.LIBRARY_READY ||
    step === ONBOARDING_STEPS.ERRANDS_READY ||
    step === ONBOARDING_STEPS.SIGIL_ALTAR_READY ||
    step === ONBOARDING_STEPS.ABYSS_PORTAL_READY ||
    step === ONBOARDING_STEPS.TIER25_CAP ||
    step === ONBOARDING_STEPS.FIRST_ABYSS ||
    step === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO ||
    step === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM ||
    step === ONBOARDING_STEPS.EXTRACTION_CONFIRM
  ) return "bottom";
  return "top";
}

export function getOnboardingSpotlightSelectors(step = null, state = {}) {
  if (getOnboardingStepInteractionMode(step, state) === "info") {
    return [];
  }

  if (step === ONBOARDING_STEPS.DISTILLERY_READY) {
    const hasClaim = Array.isArray(state?.sanctuary?.jobs)
      && state.sanctuary.jobs.some(job => job?.station === "laboratory" && job?.input?.researchId === "unlock_distillery" && job?.status === "claimable");
    return [
      hasClaim ? '[data-onboarding-target="claim-distillery-research"]' : '[data-onboarding-target="open-distillery"]',
    ];
  }
  if (step === ONBOARDING_STEPS.FIRST_DISTILLERY_JOB) {
    return [
      '[data-onboarding-target="open-distillery"]',
      '[data-onboarding-target="tutorial-distillery-bundle"]',
    ];
  }
  if (step === ONBOARDING_STEPS.FIRST_ECHOES) {
    return state?.currentTab === "prestige"
      ? ['[data-onboarding-target="prestige-summary"]']
      : ['[data-onboarding-target="primary-prestige-tab"]'];
  }
  if (step === ONBOARDING_STEPS.BLUEPRINT_DECISION) {
    return ['[data-onboarding-target="blueprint-stash"]', '[data-onboarding-target="tutorial-blueprint-action"]'];
  }
  if (step === ONBOARDING_STEPS.FIRST_DEEP_FORGE_USE) {
    return ['[data-onboarding-target="open-deep-forge"]', '[data-onboarding-target="tutorial-deep-forge-project"]'];
  }
  const researchId = getOnboardingResearchTargetId(step);
  if (researchId) {
    return [
      `[data-onboarding-target="research-card-${researchId}"]`,
      `[data-onboarding-target="research-${researchId}"]`,
    ];
  }

  switch (step) {
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
      return ['[data-onboarding-target="start-expedition"]'];
    case ONBOARDING_STEPS.CHOOSE_CLASS:
      return ['[data-onboarding-target="choose-class"]'];
    case ONBOARDING_STEPS.COMBAT_INTRO:
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
    case ONBOARDING_STEPS.FIRST_BOSS:
      return ['[data-onboarding-target="combat-encounter"]'];
    case ONBOARDING_STEPS.OPEN_HERO:
      return ['[data-onboarding-target="primary-hero-tab"]'];
    case ONBOARDING_STEPS.HERO_INTRO:
      return ['[data-onboarding-target="hero-overview"]'];
    case ONBOARDING_STEPS.AUTO_ADVANCE:
      return ['[data-onboarding-target="auto-advance"]'];
    case ONBOARDING_STEPS.FIRST_DEATH:
      return ['[data-onboarding-target="expedition-lives"]'];
    case ONBOARDING_STEPS.EXTRACTION_READY:
      return ['[data-onboarding-target="open-extraction"]'];
    case ONBOARDING_STEPS.HERO_SKILLS_INTRO:
      return ['[data-onboarding-target="hero-subview-skills"]'];
    case ONBOARDING_STEPS.HERO_TALENTS_INTRO:
      return ['[data-onboarding-target="hero-subview-talents"]'];
    case ONBOARDING_STEPS.HERO_CHARACTER_INTRO:
      return ['[data-onboarding-target="hero-subview-character"]'];
    case ONBOARDING_STEPS.EQUIP_INTRO:
      return ['[data-onboarding-target="subview-inventory"]'];
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return [
        '[data-onboarding-target="tutorial-first-item"]',
        '[data-onboarding-target="equip-item"]',
      ];
    case ONBOARDING_STEPS.SPEND_ATTRIBUTE:
      return [
        '[data-onboarding-target="upgrade-attribute-card"]',
        '[data-onboarding-target="upgrade-attribute"]',
      ];
    case ONBOARDING_STEPS.CHOOSE_SPEC:
      return [
        '[data-onboarding-target="choose-spec-card"]',
        '[data-onboarding-target="choose-spec"]',
      ];
    case ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO:
      return ['[data-onboarding-target="tutorial-extraction-cargo"]'];
    case ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM:
      return ['[data-onboarding-target="tutorial-extraction-item"]'];
    case ONBOARDING_STEPS.EXTRACTION_CONFIRM:
      return ['[data-onboarding-target="tutorial-extraction-confirm"]'];
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
      return ['[data-onboarding-target="open-laboratory"]'];
    case ONBOARDING_STEPS.DISTILLERY_READY:
      return ['[data-onboarding-target="open-distillery"]'];
    case ONBOARDING_STEPS.HUNT_INTRO:
      return ['[data-onboarding-target="subview-codex"]'];
    case ONBOARDING_STEPS.FIRST_ECHOES:
      return ['[data-onboarding-target="prestige-summary"]'];
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
      return [
        '[data-onboarding-target="buy-first-echo-node-card"]',
        '[data-onboarding-target="buy-first-echo-node"]',
      ];
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      return ['[data-onboarding-target="blueprint-stash"]'];
    case ONBOARDING_STEPS.TIER25_CAP:
      return ['[data-onboarding-target="combat-encounter"]'];
    case ONBOARDING_STEPS.TALENT_INTRO:
    case ONBOARDING_STEPS.BUY_TALENT:
      return [
        '[data-onboarding-target="buy-talent-card"]',
        '[data-onboarding-target="buy-talent"]',
      ];
    default:
      return [];
  }
}

export function isInfoOnlyOnboardingStep(step = null, state = {}) {
  return getOnboardingStepInteractionMode(step, state) === "info";
}
