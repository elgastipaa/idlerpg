import { ITEMS } from "../../data/items";
import { addToInventory } from "../inventory/inventoryEngine";
import { materializeItem } from "../../utils/loot";

export const ONBOARDING_STEPS = {
  CHOOSE_CLASS: "choose_class",
  EXPEDITION_INTRO: "expedition_intro",
  AUTO_ADVANCE: "auto_advance",
  FIRST_DEATH: "first_death",
  CHOOSE_SPEC: "choose_spec",
  HERO_INTRO: "hero_intro",
  SPEND_ATTRIBUTE: "spend_attribute",
  TALENT_INTRO: "talent_intro",
  BUY_TALENT: "buy_talent",
  COMBAT_AFTER_TALENT: "combat_after_talent",
  EQUIP_INTRO: "equip_intro",
  EQUIP_FIRST_ITEM: "equip_first_item",
  FIRST_BOSS: "first_boss",
  HUNT_INTRO: "hunt_intro",
  EXTRACTION_READY: "extraction_ready",
  FIRST_SANCTUARY_RETURN: "first_sanctuary_return",
  RESEARCH_DISTILLERY: "research_distillery",
  DISTILLERY_READY: "distillery_ready",
  FIRST_ECHOES: "first_echoes",
  BUY_FIRST_ECHO_NODE: "buy_first_echo_node",
  BLUEPRINT_INTRO: "blueprint_intro",
  DEEP_FORGE_READY: "deep_forge_ready",
  LIBRARY_READY: "library_ready",
  ERRANDS_READY: "errands_ready",
  SIGIL_ALTAR_READY: "sigil_altar_ready",
  ABYSS_PORTAL_READY: "abyss_portal_ready",
};

const INFO_STEPS = new Set([
  ONBOARDING_STEPS.EXPEDITION_INTRO,
  ONBOARDING_STEPS.FIRST_DEATH,
  ONBOARDING_STEPS.HERO_INTRO,
  ONBOARDING_STEPS.TALENT_INTRO,
  ONBOARDING_STEPS.COMBAT_AFTER_TALENT,
  ONBOARDING_STEPS.EQUIP_INTRO,
  ONBOARDING_STEPS.FIRST_BOSS,
  ONBOARDING_STEPS.HUNT_INTRO,
  ONBOARDING_STEPS.EXTRACTION_READY,
  ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN,
  ONBOARDING_STEPS.DISTILLERY_READY,
  ONBOARDING_STEPS.FIRST_ECHOES,
  ONBOARDING_STEPS.BLUEPRINT_INTRO,
  ONBOARDING_STEPS.DEEP_FORGE_READY,
  ONBOARDING_STEPS.LIBRARY_READY,
  ONBOARDING_STEPS.ERRANDS_READY,
  ONBOARDING_STEPS.SIGIL_ALTAR_READY,
  ONBOARDING_STEPS.ABYSS_PORTAL_READY,
]);

const BASE_ONBOARDING_FLAGS = {
  classChosen: false,
  expeditionIntroSeen: false,
  autoAdvanceUnlocked: false,
  firstDeathSeen: false,
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
  blueprintDecisionUnlocked: false,
  firstEchoesSeen: false,
  firstEchoNodeBought: false,
  deepForgeReadySeen: false,
  libraryReadySeen: false,
  errandsReadySeen: false,
  sigilAltarReadySeen: false,
  abyssPortalReadySeen: false,
};

export function createEmptyOnboardingState() {
  return {
    completed: false,
    step: ONBOARDING_STEPS.CHOOSE_CLASS,
    flags: { ...BASE_ONBOARDING_FLAGS },
    equipKillTarget: null,
  };
}

export function normalizeOnboardingState(onboarding = {}) {
  return {
    ...createEmptyOnboardingState(),
    ...(onboarding || {}),
    completed: Boolean(onboarding?.completed),
    step: onboarding?.completed ? null : onboarding?.step || ONBOARDING_STEPS.CHOOSE_CLASS,
    flags: {
      ...BASE_ONBOARDING_FLAGS,
      ...(onboarding?.flags || {}),
    },
    equipKillTarget:
      onboarding?.equipKillTarget == null
        ? null
        : Math.max(0, Math.floor(Number(onboarding.equipKillTarget || 0))),
  };
}

export function isOnboardingBlocking(state = {}) {
  return Boolean(state?.onboarding?.step && !state?.onboarding?.completed);
}

export function shouldShowHeroPrimaryTab(state = {}) {
  return Boolean(state?.player?.specialization) || state?.currentTab === "character";
}

export function canOpenExpedition(state = {}) {
  return Boolean(state?.player?.class);
}

export function isInventorySubviewUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.inventoryUnlocked) return true;
  return [ONBOARDING_STEPS.EQUIP_INTRO, ONBOARDING_STEPS.EQUIP_FIRST_ITEM].includes(state?.onboarding?.step);
}

export function isAutoAdvanceUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.autoAdvanceUnlocked) return true;
  return state?.onboarding?.step === ONBOARDING_STEPS.AUTO_ADVANCE;
}

export function isHuntUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.huntUnlocked) return true;
  return false;
}

export function isExtractionUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.extractionUnlocked) return true;
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

export function isBlueprintDecisionUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.flags?.blueprintDecisionUnlocked) return true;
  return Number(state?.prestige?.level || 0) >= 2;
}

export function getOnboardingStepMeta(step = null, state = {}) {
  switch (step) {
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
      return {
        title: "Tu heroe pelea solo",
        body: "Mira el combate. Ganas experiencia, subes niveles y mas adelante conseguiras equipo.",
        actionLabel: "Entendido",
      };
    case ONBOARDING_STEPS.CHOOSE_SPEC:
      return {
        title: "Elige una especializacion",
        body: "Toca una subclase para definir la direccion de esta build.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.AUTO_ADVANCE:
      return {
        title: "Activa el auto-avance",
        body: "Toca el boton de botas. Cuando esta activo, tu heroe empuja tiers por su cuenta.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_DEATH:
      return {
        title: "Morir no borra la expedicion",
        body: "Has perdido una vida de expedicion. Retrocedes, el auto-avance se corta y vuelves a intentarlo.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.HERO_INTRO:
      return {
        title: "Esta es tu ficha",
        body: "Aqui lees el estado de tu build. Ahora vamos a gastar tu primer atributo.",
        actionLabel: "Ir a atributos",
      };
    case ONBOARDING_STEPS.SPEND_ATTRIBUTE:
      return {
        title: "Compra un atributo",
        body: "Gasta 1 mejora. Puedes elegir la que quieras.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.TALENT_INTRO:
      return {
        title: "Ahora veamos talentos",
        body: "Los talentos definen la build. Abre el arbol y compra el primero.",
        actionLabel: "Ir a talentos",
      };
    case ONBOARDING_STEPS.BUY_TALENT:
      return {
        title: "Compra tu primer talento",
        body: "Elige uno de los nodos basicos del primer tramo.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
      return {
        title: "Vuelve a la expedicion",
        body: "Mata un par de enemigos mas. Luego aprenderas a equiparte.",
        actionLabel: "Volver a combate",
      };
    case ONBOARDING_STEPS.EQUIP_INTRO:
      return {
        title: "Ya puedes equiparte",
        body: "Abre la mochila y prepara tu primer item.",
        actionLabel: "Abrir mochila",
      };
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return {
        title: "Equipa tu primer item",
        body: "Toca EQUIPAR sobre un objeto para usarlo en esta run.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.FIRST_BOSS:
      return {
        title: "Has encontrado un boss",
        body: "Los bosses pegan mas fuerte, tienen mejor botin y marcan los hitos importantes de una expedicion.",
        actionLabel: "Pelear",
      };
    case ONBOARDING_STEPS.HUNT_INTRO:
      return {
        title: "Caza ya esta disponible",
        body: "Dentro de Expedicion ahora puedes abrir Caza para ver solo informacion tactica y objetivos ya revelados.",
        actionLabel: "Entendido",
      };
    case ONBOARDING_STEPS.EXTRACTION_READY:
      return {
        title: "Ahora puedes retirarte",
        body: "Se habilito Extraer al Santuario. Usa esa salida cuando quieras cerrar bien la run y volver con valor persistente.",
        actionLabel: "Entendido",
      };
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
      return {
        title: "El Santuario ya puede crecer",
        body: "La primera extraccion abre el Laboratorio. Desde ahi vas a investigar la Destileria para empezar a procesar cargo real entre expediciones.",
        actionLabel: "Abrir Laboratorio",
      };
    case ONBOARDING_STEPS.RESEARCH_DISTILLERY:
      return {
        title: "Investiga la Destileria",
        body: "Este es tu primer research de infraestructura. Inicia Calibrar Destileria para convertir bundles en recursos persistentes utiles.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.DISTILLERY_READY:
      return {
        title: "La Destileria ya esta lista",
        body: "Cuando refines cargo, el Santuario empezara a devolver tinta, flux, polvo y esencia. Desde aca el loop deja de ser solo una run.",
        actionLabel: "Seguir",
      };
    case ONBOARDING_STEPS.FIRST_ECHOES:
      return {
        title: "Ecos ya esta activo",
        body: "Acabas de hacer tu primer prestige real. Ahora tienes resonancia permanente y un arbol meta que vive entre expediciones.",
        actionLabel: "Ver Ecos",
      };
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
      return {
        title: "Compra tu primer nodo",
        body: "Invierte al menos un Eco. No hace falta optimizar ahora: lo importante es sentir que la siguiente run ya arranca distinta.",
        actionLabel: null,
      };
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      return {
        title: "Ahora tambien puedes rescatar items",
        body: "Desde Prestige 2, una extraccion puede traer una pieza temporal. Luego eliges si convertirla en blueprint o desguazarla para conseguir mas cargas. Un blueprint no guarda el item exacto: materializa una version nueva y sesgada al empezar futuras runs.",
        actionLabel: "Entendido",
      };
    case ONBOARDING_STEPS.DEEP_FORGE_READY:
      return {
        title: "Forja Profunda ya puede investigarse",
        body: "Desde Prestige 3, el Laboratorio habilita la Forja Profunda. Ahi trabajas blueprints persistentes y dejas de depender solo de la run actual.",
        actionLabel: "Entendido",
      };
    case ONBOARDING_STEPS.LIBRARY_READY:
      return {
        title: "Biblioteca lista para investigar",
        body: "Desde Prestige 4, el Laboratorio puede catalogar la Biblioteca. Ahi conviertes tinta y conocimiento en hitos permanentes reales.",
        actionLabel: "Entendido",
      };
    case ONBOARDING_STEPS.ERRANDS_READY:
      return {
        title: "Encargos ya pueden organizarse",
        body: "Desde Prestige 5, el Laboratorio habilita equipos paralelos del Santuario para buscar materiales, tinta y cargas mientras sigues empujando runs.",
        actionLabel: "Entendido",
      };
    case ONBOARDING_STEPS.SIGIL_ALTAR_READY:
      return {
        title: "Altar de Sigilos listo",
        body: "Desde Prestige 6, el Laboratorio puede erigir el Altar de Sigilos. Ahi la preparacion de la proxima expedicion gana otra capa de decision.",
        actionLabel: "Entendido",
      };
    case ONBOARDING_STEPS.ABYSS_PORTAL_READY:
      return {
        title: "Ya puedes abrir el Portal al Abismo",
        body: "Derrotaste al boss de Tier 25 y el Santuario ya domina Biblioteca, Encargos y Altar. Investiga el portal en el Laboratorio para romper el techo del mundo base.",
        actionLabel: "Entendido",
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

function withNextStep(nextState, onboarding, step, extra = {}) {
  return {
    ...nextState,
    currentTab: extra.currentTab ?? nextState.currentTab,
    player: extra.player ?? nextState.player,
    onboarding: {
      ...onboarding,
      ...extra.onboarding,
      step,
    },
  };
}

export function getBlockedOnboardingAction(step = null, action = {}) {
  const type = action?.type;
  if (!step) return false;
  if (type === "TOGGLE_THEME" || type === "SET_THEME") return false;
  if (type === "ACK_ONBOARDING_STEP") return false;

  switch (step) {
    case ONBOARDING_STEPS.CHOOSE_CLASS:
      return type !== "SELECT_CLASS";
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
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
      return type !== "UPGRADE_PLAYER";
    case ONBOARDING_STEPS.TALENT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.BUY_TALENT:
      return type !== "UPGRADE_TALENT_NODE" && type !== "UNLOCK_TALENT";
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.EQUIP_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.EQUIP_FIRST_ITEM:
      return type !== "EQUIP_ITEM";
    case ONBOARDING_STEPS.FIRST_BOSS:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.HUNT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.EXTRACTION_READY:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.RESEARCH_DISTILLERY: {
      const researchId = action?.researchId || action?.payload?.researchId || "";
      return !(type === "START_LAB_RESEARCH" && researchId === "unlock_distillery");
    }
    case ONBOARDING_STEPS.DISTILLERY_READY:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.FIRST_ECHOES:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
      return type !== "BUY_PRESTIGE_NODE";
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
      return type !== "ACK_ONBOARDING_STEP";
    case ONBOARDING_STEPS.DEEP_FORGE_READY:
    case ONBOARDING_STEPS.LIBRARY_READY:
    case ONBOARDING_STEPS.ERRANDS_READY:
    case ONBOARDING_STEPS.SIGIL_ALTAR_READY:
    case ONBOARDING_STEPS.ABYSS_PORTAL_READY:
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

  if (action.type === "ACK_ONBOARDING_STEP") {
    if (onboarding.step === ONBOARDING_STEPS.EXPEDITION_INTRO) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          expeditionIntroSeen: true,
        },
      };
    } else if (onboarding.step === ONBOARDING_STEPS.FIRST_DEATH) {
      onboarding = {
        ...onboarding,
        step: null,
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
        ONBOARDING_STEPS.SPEND_ATTRIBUTE,
        {
          currentTab: "skills",
          player: {
            ...nextState.player,
            gold: Math.max(Number(nextState?.player?.gold || 0), 300),
          },
        }
      );
    } else if (onboarding.step === ONBOARDING_STEPS.TALENT_INTRO) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.BUY_TALENT, { currentTab: "talents" });
    } else if (onboarding.step === ONBOARDING_STEPS.COMBAT_AFTER_TALENT) {
      const nextKills = Number(nextState?.combat?.sessionKills || 0);
      onboarding = {
        ...onboarding,
        step: null,
        equipKillTarget: Math.max(nextKills + 2, Number(onboarding.equipKillTarget || 0)),
      };
      nextState = {
        ...nextState,
        currentTab: "combat",
      };
    } else if (onboarding.step === ONBOARDING_STEPS.EQUIP_INTRO) {
      return withNextStep(nextState, onboarding, ONBOARDING_STEPS.EQUIP_FIRST_ITEM, {
        currentTab: "inventory",
        onboarding: {
          flags: {
            ...onboarding.flags,
            inventoryUnlocked: true,
          },
        },
      });
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
    } else if (onboarding.step === ONBOARDING_STEPS.BLUEPRINT_INTRO) {
      onboarding = {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          blueprintDecisionUnlocked: true,
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
    }
  }

  const prevUpgradeLevels = countUpgradeLevels(prevState?.player);
  const nextUpgradeLevels = countUpgradeLevels(nextState?.player);
  const prevTalents = countUnlockedTalents(prevState?.player);
  const nextTalents = countUnlockedTalents(nextState?.player);
  const hasInventoryItem = (nextState?.player?.inventory || []).length > 0;
  const nextKills = Number(nextState?.combat?.sessionKills || 0);
  const prevDeaths = Number(prevState?.stats?.deaths || 0);
  const nextDeaths = Number(nextState?.stats?.deaths || 0);
  const prevBossKills = Number(prevState?.combat?.runStats?.bossKills || prevState?.combat?.analytics?.bossKills || 0);
  const nextBossKills = Number(nextState?.combat?.runStats?.bossKills || nextState?.combat?.analytics?.bossKills || 0);
  const currentEnemyIsBoss = Boolean(nextState?.combat?.enemy?.isBoss);
  const currentTier = Math.max(
    Number(nextState?.combat?.currentTier || 1),
    Number(nextState?.combat?.maxTier || 1)
  );
  const prevPrestigeLevel = Number(prevState?.prestige?.level || 0);
  const nextPrestigeLevel = Number(nextState?.prestige?.level || 0);
  const prevPrestigeNodes = Object.values(prevState?.prestige?.nodes || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const nextPrestigeNodes = Object.values(nextState?.prestige?.nodes || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const nextLaboratoryCompleted = nextState?.sanctuary?.laboratory?.completed || {};
  const nextAbyssPortalUnlocked = Boolean(nextState?.abyss?.portalUnlocked);
  const nextTier25BossCleared = Boolean(nextState?.abyss?.tier25BossCleared);
  const claimedJob =
    action.type === "CLAIM_SANCTUARY_JOB"
      ? (Array.isArray(prevState?.sanctuary?.jobs)
          ? prevState.sanctuary.jobs.find(job => job?.id === (action.jobId || action.payload?.jobId))
          : null)
      : null;

  if (!onboarding.flags.classChosen && nextState?.player?.class) {
    onboarding = {
      ...onboarding,
      step: ONBOARDING_STEPS.EXPEDITION_INTRO,
      flags: {
        ...onboarding.flags,
        classChosen: true,
      },
    };
    return {
      ...nextState,
      onboarding,
      currentTab: "combat",
    };
  }

  if (!onboarding.flags.autoAdvanceUnlocked && nextKills >= 3 && !onboarding.step) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.AUTO_ADVANCE, { currentTab: "combat" });
  }

  if (onboarding.step === ONBOARDING_STEPS.AUTO_ADVANCE && action.type === "TOGGLE_AUTO_ADVANCE") {
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          autoAdvanceUnlocked: true,
        },
      },
    };
  }

  if (!onboarding.flags.firstDeathSeen && nextDeaths > prevDeaths) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_DEATH, { currentTab: "combat" });
  }

  if (
    !onboarding.flags.specChosen &&
    nextState?.player?.class &&
    !nextState?.player?.specialization &&
    Number(nextState?.player?.level || 1) >= 5
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.CHOOSE_SPEC, { currentTab: "character" });
  }

  if (!onboarding.flags.specChosen && nextState?.player?.specialization) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          specChosen: true,
        },
      },
      ONBOARDING_STEPS.HERO_INTRO,
      {
        currentTab: "character",
        player: {
          ...nextState.player,
          gold: Math.max(Number(nextState?.player?.gold || 0), 300),
        },
      }
    );
  }

  if (onboarding.step === ONBOARDING_STEPS.SPEND_ATTRIBUTE && nextUpgradeLevels > prevUpgradeLevels) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstAttributeSpent: true,
        },
      },
      ONBOARDING_STEPS.TALENT_INTRO
    );
  }

  if (onboarding.step === ONBOARDING_STEPS.BUY_TALENT && nextTalents > prevTalents) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          firstTalentBought: true,
        },
      },
      ONBOARDING_STEPS.COMBAT_AFTER_TALENT
    );
  }

  if (
    onboarding.equipKillTarget != null &&
    !onboarding.flags.firstItemEquipped &&
    !onboarding.step &&
    nextKills >= onboarding.equipKillTarget
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
          "TUTORIAL: ya controlas la base de la expedicion. Ahora empezaras a ver bosses, Caza y el cierre correcto de una run.",
        ].slice(-20),
      },
    };
  }

  if (!onboarding.flags.firstBossSeen && !onboarding.step && onboarding.flags.firstItemEquipped && currentEnemyIsBoss) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_BOSS, { currentTab: "combat" });
  }

  if (!onboarding.flags.huntUnlocked && !onboarding.step && nextBossKills > prevBossKills) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.HUNT_INTRO, { currentTab: "combat" });
  }

  if (
    onboarding.flags.huntUnlocked &&
    !onboarding.flags.extractionUnlocked &&
    !onboarding.step &&
    currentTier >= 9
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.EXTRACTION_READY, { currentTab: "combat" });
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
    return {
      ...nextState,
      onboarding: {
        ...onboarding,
        step: null,
      },
    };
  }

  if (
    claimedJob?.type === "laboratory_research" &&
    claimedJob?.input?.researchId === "unlock_distillery" &&
    !onboarding.flags.distilleryUnlocked
  ) {
    return withNextStep(
      nextState,
      {
        ...onboarding,
        flags: {
          ...onboarding.flags,
          distilleryUnlocked: true,
        },
      },
      ONBOARDING_STEPS.DISTILLERY_READY,
      { currentTab: "sanctuary" }
    );
  }

  if (
    !onboarding.flags.firstEchoesSeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 1 &&
    nextPrestigeLevel > prevPrestigeLevel
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.FIRST_ECHOES, {
      currentTab: "prestige",
    });
  }

  if (onboarding.step === ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE && nextPrestigeNodes > prevPrestigeNodes) {
    return {
      ...nextState,
      currentTab: "sanctuary",
      onboarding: {
        ...onboarding,
        step: null,
        flags: {
          ...onboarding.flags,
          firstEchoNodeBought: true,
        },
      },
    };
  }

  if (
    !onboarding.flags.blueprintDecisionUnlocked &&
    !onboarding.step &&
    nextPrestigeLevel >= 2
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.BLUEPRINT_INTRO, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.deepForgeReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 3
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.DEEP_FORGE_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.libraryReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 4
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.LIBRARY_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.errandsReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 5
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.ERRANDS_READY, {
      currentTab: "sanctuary",
    });
  }

  if (
    !onboarding.flags.sigilAltarReadySeen &&
    !onboarding.step &&
    nextPrestigeLevel >= 6
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
    nextLaboratoryCompleted.unlock_sigil_altar
  ) {
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.ABYSS_PORTAL_READY, {
      currentTab: "sanctuary",
    });
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
  if (step === ONBOARDING_STEPS.SPEND_ATTRIBUTE || step === ONBOARDING_STEPS.BUY_TALENT) return "bottom";
  return "top";
}

export function isInfoOnlyOnboardingStep(step = null) {
  return INFO_STEPS.has(step);
}
