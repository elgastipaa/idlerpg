import { ITEMS } from "../../data/items";
import { PLAYER_UPGRADES } from "../../data/playerUpgrades";
import { addToInventory } from "../inventory/inventoryEngine";
import { materializeItem } from "../../utils/loot";

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
  ONBOARDING_STEPS.COMBAT_INTRO,
  ONBOARDING_STEPS.FIRST_DEATH,
  ONBOARDING_STEPS.HERO_INTRO,
  ONBOARDING_STEPS.TALENT_INTRO,
  ONBOARDING_STEPS.COMBAT_AFTER_TALENT,
  ONBOARDING_STEPS.EQUIP_INTRO,
  ONBOARDING_STEPS.FIRST_BOSS,
  ONBOARDING_STEPS.HUNT_INTRO,
  ONBOARDING_STEPS.EXTRACTION_READY,
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
  if (state?.onboarding?.flags?.huntUnlocked) return true;
  return false;
}

export function isExtractionUnlocked(state = {}) {
  if (state?.onboarding?.completed) return true;
  if (state?.onboarding?.step === ONBOARDING_STEPS.EXTRACTION_READY) return true;
  if (state?.onboarding?.flags?.extractionUnlocked) {
    return (
      Boolean(state?.onboarding?.flags?.firstBossSeen) &&
      Math.max(1, Number(state?.combat?.currentTier || 1)) >= 6
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
    case ONBOARDING_STEPS.BLUEPRINT_INTRO:
    case ONBOARDING_STEPS.DEEP_FORGE_READY:
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
    case ONBOARDING_STEPS.FIRST_ECHOES:
    case ONBOARDING_STEPS.BUY_FIRST_ECHO_NODE:
      return "prestige";
    case ONBOARDING_STEPS.COMBAT_INTRO:
    case ONBOARDING_STEPS.AUTO_ADVANCE:
    case ONBOARDING_STEPS.FIRST_DEATH:
    case ONBOARDING_STEPS.COMBAT_AFTER_TALENT:
    case ONBOARDING_STEPS.EQUIP_INTRO:
    case ONBOARDING_STEPS.FIRST_BOSS:
    case ONBOARDING_STEPS.HUNT_INTRO:
    case ONBOARDING_STEPS.EXTRACTION_READY:
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

export function getOnboardingStepMeta(step = null, state = {}) {
  switch (step) {
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
      return {
        title: "Este es tu Santuario",
        body: "Aqui preparas la cuenta y desde aqui inicias cada expedicion. El primer gesto del juego es salir desde esta base: primero inicias la run, luego eliges una clase y de ahi entras al combate.",
        actionLabel: null,
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
        actionLabel: "Entendido",
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
        body: "La Ficha resume la identidad de tu heroe: clase, spec, nivel, vida y lectura general de build. Desde aqui vas a saltar a Atributos y Talentos cuando quieras ajustar la run.",
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
        body: "Los talentos definen la direccion real de la build. Compra el primer nodo resaltado.",
        actionLabel: null,
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
        body: "Ya tienes clase, atributo, talento y especializacion. Vuelve al combate y derrota al boss de Tier 5 para continuar el tutorial.",
        actionLabel: "Seguir",
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
        body: "Un boss no es un monstruo normal: aguanta mas, suele tener mecanicas propias, castiga mas los errores y marca los hitos importantes de una expedicion. Si caes, no pierdes la run, pero tendras que reorganizarte.",
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

function getStrengthTutorialGold(player = {}) {
  const strengthUpgrade = PLAYER_UPGRADES.find(upgrade => upgrade.id === "damage");
  if (!strengthUpgrade) return 300;
  const currentLevel = Math.max(0, Number(player?.upgrades?.damage || 0));
  const nextCost = Math.floor(
    strengthUpgrade.baseCost * Math.pow(strengthUpgrade.costMultiplier, currentLevel)
  );
  return Math.max(300, nextCost + 20);
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

export function getBlockedOnboardingAction(step = null, action = {}) {
  const type = action?.type;
  if (!step) return false;
  if (type === "TOGGLE_THEME" || type === "SET_THEME") return false;
  if (type === "ACK_ONBOARDING_STEP") return false;
  if (type === "RESET_ALL_PROGRESS") return false;
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
      return type !== "UPGRADE_TALENT_NODE" && type !== "UNLOCK_TALENT";
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
  const currentCombatTier = Math.max(1, Number(nextState?.combat?.currentTier || 1));
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
  const canOpenHeroAfterBoss =
    !onboarding.flags.heroIntroSeen &&
    nextState?.player?.class &&
    onboarding.flags.firstBossSeen;
  const claimedJob =
    action.type === "CLAIM_SANCTUARY_JOB"
      ? (Array.isArray(prevState?.sanctuary?.jobs)
          ? prevState.sanctuary.jobs.find(job => job?.id === (action.jobId || action.payload?.jobId))
          : null)
      : null;

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
    return withNextStep(nextState, onboarding, ONBOARDING_STEPS.BUY_TALENT, {
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
        bossHeroQueued: prevEnemyWasBoss,
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
    prevCombatTier >= 5 &&
    currentCombatTier <= 4 &&
    nextDeaths === prevDeaths
  ) {
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

  const requiredTab = getOnboardingRequiredTab(onboarding.step);
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
  if (
    step === ONBOARDING_STEPS.HERO_INTRO ||
    step === ONBOARDING_STEPS.HERO_SKILLS_INTRO ||
    step === ONBOARDING_STEPS.HERO_TALENTS_INTRO ||
    step === ONBOARDING_STEPS.HERO_CHARACTER_INTRO
  ) {
    return "subnav";
  }
  if (
    step === ONBOARDING_STEPS.FIRST_SANCTUARY_RETURN ||
    step === ONBOARDING_STEPS.RESEARCH_DISTILLERY ||
    step === ONBOARDING_STEPS.SPEND_ATTRIBUTE ||
    step === ONBOARDING_STEPS.BUY_TALENT ||
    step === ONBOARDING_STEPS.EXTRACTION_SELECT_CARGO ||
    step === ONBOARDING_STEPS.EXTRACTION_SELECT_ITEM ||
    step === ONBOARDING_STEPS.EXTRACTION_CONFIRM
  ) return "bottom";
  return "top";
}

export function getOnboardingSpotlightSelectors(step = null) {
  switch (step) {
    case ONBOARDING_STEPS.EXPEDITION_INTRO:
      return ['[data-onboarding-target="start-expedition"]'];
    case ONBOARDING_STEPS.CHOOSE_CLASS:
      return ['[data-onboarding-target="choose-class"]'];
    case ONBOARDING_STEPS.OPEN_HERO:
      return ['[data-onboarding-target="primary-hero-tab"]'];
    case ONBOARDING_STEPS.HERO_INTRO:
      return ['[data-onboarding-target="hero-subview-skills"]'];
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
    case ONBOARDING_STEPS.RESEARCH_DISTILLERY:
      return ['[data-onboarding-target="research-distillery"]'];
    case ONBOARDING_STEPS.BUY_TALENT:
      return ['[data-onboarding-target="buy-talent"]'];
    default:
      return [];
  }
}

export function isInfoOnlyOnboardingStep(step = null) {
  return INFO_STEPS.has(step);
}
