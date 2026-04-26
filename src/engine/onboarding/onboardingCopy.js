const ONBOARDING_STATIC_COPY = Object.freeze({
  expedition_intro: Object.freeze({
    title: "Este es tu Santuario",
    body: "Aqui preparas la cuenta y desde aqui inicias cada expedicion. El primer gesto del juego es salir desde esta base: primero inicias la run, luego eliges una clase y de ahi entras al combate.",
    actionLabel: "Seguir",
  }),
  choose_class: Object.freeze({
    title: "Ahora elige una clase",
    body: "Tu primera run necesita una identidad base. Elige Warrior o Mage y, apenas lo hagas, entraras al combate para arrancar la expedicion.",
    actionLabel: null,
  }),
  combat_intro: Object.freeze({
    title: "El combate corre solo",
    body: "Tu heroe pelea automaticamente. Tu trabajo es decidir cuando empujar, cuando mejorar equipo y cuando cerrar la expedicion con una extraccion.",
    actionLabel: "Seguir",
  }),
  choose_spec: Object.freeze({
    title: "Elige una especializacion",
    body: "Despues de tus primeros talentos, ya puedes elegir una subclase. Toca una de las opciones resaltadas para definir la direccion de esta build.",
    actionLabel: null,
  }),
  auto_advance: Object.freeze({
    title: "Activa el auto-avance",
    body: "Toca el boton de botas resaltado. Cuando esta activo, tu heroe empuja tiers por su cuenta.",
    actionLabel: null,
  }),
  open_hero: Object.freeze({
    title: "Abre la hoja de Heroe",
    body: "Ya viste que un boss puede frenarte. Abre la tab resaltada de Heroe para empezar a leer tu build y ubicar donde vive cada decision importante de la run.",
    actionLabel: null,
  }),
  hero_intro: Object.freeze({
    title: "Esta es tu Ficha",
    body: "La Ficha resume la identidad de tu heroe: clase, spec, nivel, vida y lectura general de build.",
    actionLabel: "Seguir",
  }),
  hero_skills_intro: Object.freeze({
    title: "Abre Atributos",
    body: "Ahora toca la subtab resaltada de Atributos. Ahi gastas oro para reforzar el perfil base de la run.",
    actionLabel: null,
  }),
  spend_attribute: Object.freeze({
    title: "Compra 1 punto de Fuerza",
    body: "Empieza por Fuerza para que notes un impacto inmediato al volver a la run. Toca el boton resaltado de esa mejora.",
    actionLabel: null,
  }),
  hero_talents_intro: Object.freeze({
    title: "Abre Talentos",
    body: "La tercera subtab es Talentos. Ahi empiezas a construir la direccion real de la build con nodos persistentes de esta expedicion.",
    actionLabel: null,
  }),
  talent_intro: Object.freeze({
    title: "Ahora veamos talentos",
    body: "Los talentos definen la direccion real de la build. Primero ubica el arbol y el nodo base; en el siguiente paso vas a comprar el primero.",
    actionLabel: "Seguir",
  }),
  buy_talent: Object.freeze({
    title: "Compra tu primer talento",
    body: "Compra el primer nodo resaltado. Ese sera tu primer punto real de build para esta run.",
    actionLabel: null,
  }),
  hero_character_intro: Object.freeze({
    title: "Ahora vuelve a Ficha",
    body: "Ya tienes un primer talento. Toca la subtab resaltada de Ficha: ahi vamos a elegir la especializacion de esta build.",
    actionLabel: null,
  }),
  combat_after_talent: Object.freeze({
    title: "Ahora vuelve al boss",
    body: "Ya tienes clase, atributo, talento y especializacion. Sigue y vuelve al combate: el siguiente hito es derrotar al boss de Tier 5.",
    actionLabel: null,
  }),
  equip_intro: Object.freeze({
    title: "Ya puedes equiparte",
    body: "Toca el boton resaltado de Mochila. Ahi vas a preparar tu primer item de esta run.",
    actionLabel: null,
  }),
  equip_first_item: Object.freeze({
    title: "Equipa tu primer item",
    body: "Baja hasta el primer item resaltado y equipalo para usarlo en esta run.",
    actionLabel: null,
  }),
  first_boss: Object.freeze({
    title: "Has encontrado un boss",
    body: "Un boss no es un monstruo normal: aguanta mas, suele tener mecanicas propias, castiga mas los errores y marca los hitos importantes de una expedicion.",
    actionLabel: "Seguir",
  }),
  extraction_ready: Object.freeze({
    title: "Aprendamos Extraccion",
    body: "Ya pasaste el primer boss. Toca el boton resaltado de Extraer al Santuario para cerrar bien la run y llevar valor de vuelta a tu base.",
    actionLabel: null,
  }),
  extraction_select_cargo: Object.freeze({
    title: "Elige que cargo rescatar",
    body: "Toca uno de los bundles resaltados para decidir que recursos vuelven al Santuario. Esa sera la materia prima de tus primeras estaciones.",
    actionLabel: null,
  }),
  extraction_select_item: Object.freeze({
    title: "Elige una reliquia",
    body: "Ahora toca una pieza para guardarla en el Arsenal de Reliquias. Queda disponible para equiparla al iniciar futuras runs.",
    actionLabel: null,
  }),
  extraction_confirm: Object.freeze({
    title: "Confirma la extraccion",
    body: "Ya esta todo listo. Confirma la extraccion para volver al Santuario y desbloquear el Laboratorio.",
    actionLabel: null,
  }),
  first_sanctuary_return: Object.freeze({
    title: "Volviste al Santuario",
    body: "Ahora la run ya deja valor persistente. Primero te muestro rapido la base; despues te llevo al Laboratorio para encender la primera estacion real.",
    actionLabel: null,
  }),
  open_laboratory: Object.freeze({
    title: "Abri el Laboratorio",
    body: "Aca viven los unlocks de infraestructura del Santuario. Toca el boton real resaltado para abrirlo.",
    actionLabel: null,
  }),
  research_distillery: Object.freeze({
    title: "Investiga la Destileria",
    body: "Este es tu primer research de infraestructura. Toca el boton real resaltado de Calibrar Destileria para convertir bundles en recursos persistentes utiles.",
    actionLabel: null,
  }),
  return_to_sanctuary: Object.freeze({
    title: "Volvamos al Santuario",
    body: "Ya reclamaste la investigacion. Cierra el Laboratorio con el boton real resaltado y volvamos al hub para abrir la Destileria desde ahi.",
    actionLabel: null,
  }),
  open_distillery: Object.freeze({
    title: "Abri la Destileria",
    body: "La estacion ya esta disponible. Toca el boton real resaltado para abrirla y ver el cargo que vas a procesar.",
    actionLabel: null,
  }),
  first_distillery_job: Object.freeze({
    title: "Inicia tu primera destilacion",
    body: "Elige el bundle marcado y mandalo a destilar. No hace falta esperar el resultado ahora: con eso ya habras aprendido el loop base de la estacion.",
    actionLabel: null,
  }),
  buy_first_echo_node: Object.freeze({
    title: "Compra tu primer nodo",
    body: "Invierte al menos un Eco en el nodo base resaltado. No hace falta optimizar ahora: lo importante es sentir que la siguiente run ya arranca distinta.",
    actionLabel: null,
  }),
  first_prestige_close: Object.freeze({
    title: "Loop completo",
    body: "Listo: ya cerraste una run, aprendiste Santuario y ya invertiste tus primeros Ecos. Puedes volver al Santuario e iniciar otra expedicion; nos vemos de nuevo en tu segunda extraccion.",
    actionLabel: "Seguir",
  }),
  blueprint_intro: Object.freeze({
    title: "Ahora tambien puedes rescatar items",
    body: "Desde Prestige 2, una extraccion puede traer una pieza temporal. El Stash temporal vive aqui: desde este panel decides si una pieza se vuelve plano o si se desguaza por retorno inmediato.",
    actionLabel: null,
  }),
  blueprint_decision: Object.freeze({
    title: "Dos salidas, dos objetivos",
    body: "Cuando rescatas una pieza temporal tienes dos caminos: blueprint si quieres sesgar futuras materializaciones, o desguace si quieres retorno inmediato en cargas y recursos. No compiten: cumplen funciones distintas.",
    actionLabel: "Seguir",
  }),
  first_blueprint_materialization: Object.freeze({
    title: "Que materializa un blueprint",
    body: "Un blueprint no clona exactamente el item viejo: materializa una pieza nueva sesgada por ese perfil. Sirve para empujar una direccion de build entre runs sin depender de repetir el mismo drop.",
    actionLabel: "Seguir",
  }),
  deep_forge_ready: Object.freeze({
    title: "El Taller ya puede investigarse",
    body: "Desde Prestige 3, el Santuario ya puede abrir la ruta al Taller. Ahi mejoras proyectos persistentes: no buscas un pico inmediato para esta run, sino una base mejor para muchas runs futuras.",
    actionLabel: "Seguir",
  }),
  first_deep_forge_use: Object.freeze({
    title: "Para que sirve el Taller",
    body: "El Taller toma una base prometedora y la convierte en progreso persistente real. Es donde una buena pieza deja de ser solo loot de una run y pasa a formar parte del crecimiento largo de tu cuenta.",
    actionLabel: "Seguir",
  }),
  library_ready: Object.freeze({
    title: "Biblioteca lista para investigar",
    body: "La Biblioteca convierte kills, copias frescas e investigacion en bonus permanentes. Su valor no esta en mirar datos, sino en consolidar progreso historico de la cuenta.",
    actionLabel: "Seguir",
  }),
  first_library_research: Object.freeze({
    title: "Cuando vale la pena investigar",
    body: "La Biblioteca gasta tinta para convertir progreso fresco en bonus permanentes. El criterio sano es simple: investiga cuando ya desbloqueaste un hito real y quieres fijarlo a nivel cuenta.",
    actionLabel: "Seguir",
  }),
  errands_ready: Object.freeze({
    title: "Encargos ya pueden organizarse",
    body: "Los Encargos usan equipos auxiliares del Santuario. Tu heroe principal no se detiene: mientras una run empuja tiers, el hub puede seguir trayendo materiales, tinta o cargas en paralelo.",
    actionLabel: "Seguir",
  }),
  first_errand: Object.freeze({
    title: "Que esperar de Encargos",
    body: "Encargos no reemplaza el farmeo principal: lo complementa. Sirve para orientar retornos del Santuario entre runs y sostener materiales paralelos sin frenar a tu heroe.",
    actionLabel: "Seguir",
  }),
  sigil_altar_ready: Object.freeze({
    title: "Altar de Sigilos listo",
    body: "El Altar no mejora la run actual: prepara la siguiente. Ahi conviertes flux en cargas de sigilo para salir con una intencion mas clara desde el primer tier.",
    actionLabel: "Seguir",
  }),
  first_sigil_infusion: Object.freeze({
    title: "Como pensar una infusion",
    body: "Una infusion es preparacion, no reaccion. Conviene verla como una apuesta previa: eliges el sesgo de la siguiente expedicion antes de salir, no como parche para la run en curso.",
    actionLabel: "Seguir",
  }),
  abyss_portal_ready: Object.freeze({
    title: "Ya puedes abrir el Portal al Abismo",
    body: "Derrotaste al boss de Tier 25 y el Santuario ya domina Biblioteca, Encargos y Altar. El siguiente gran salto de cuenta es investigar el Portal al Abismo.",
    actionLabel: "Seguir",
  }),
  tier25_cap: Object.freeze({
    title: "El mundo base termina en Tier 25",
    body: "No vas a empujar mas arriba desde combate normal. Para romper ese techo debes investigar Portal al Abismo en el Laboratorio cuando el Santuario ya tenga la infraestructura necesaria.",
    actionLabel: "Seguir",
  }),
  first_abyss: Object.freeze({
    title: "Entraste al Abismo",
    body: "Desde aqui cambian la presion y los techos del run. El Portal rompe Tier 25 y el Abismo pasa a ser tu progresion profunda de cuenta. Sigue empujando y vuelve al Santuario cuando quieras capitalizar el avance.",
    actionLabel: "Seguir",
  }),
});

const ONBOARDING_DYNAMIC_COPY = Object.freeze({
  hunt_intro: Object.freeze({
    codex: Object.freeze({
      title: "Esto es Intel",
      body: "Aqui lees familias vistas, pistas y contexto tactico sin ensuciar el combate. Cuando cierres este paso volveras al frente y la run seguira corriendo.",
      actionLabel: null,
    }),
    default: Object.freeze({
      title: "Intel ya esta disponible",
      body: "Dentro de Expedicion ahora puedes abrir Intel para ver solo informacion tactica y objetivos ya revelados. Toca la subtab real resaltada.",
      actionLabel: null,
    }),
  }),
  distillery_ready: Object.freeze({
    running: Object.freeze({
      title: "La investigacion ya esta corriendo",
      body: "El Laboratorio ya esta calibrando la Destileria. Espera a que termine y luego reclama el trabajo real desde la misma UI.",
      actionLabel: null,
    }),
    claimable: Object.freeze({
      title: "Reclama la Destileria",
      body: "La investigacion ya termino. Reclama ese trabajo del Laboratorio para abrir la primera estacion persistente del Santuario.",
      actionLabel: null,
    }),
    default: Object.freeze({
      title: "La Destileria ya esta lista",
      body: "Cuando refines cargo, el Santuario empezara a devolver tinta, flux, polvo y esencia. Toca el control real resaltado para abrir la estacion.",
      actionLabel: null,
    }),
  }),
  first_echoes: Object.freeze({
    prestige: Object.freeze({
      title: "Ecos ya esta activo",
      body: "Acabas de hacer tu primer prestige real. Aqui ves cuantos Ecos tienes disponibles y por que la siguiente run ya arranca distinta. Sigue y en el proximo beat haras tu primera inversion.",
      actionLabel: null,
    }),
    default: Object.freeze({
      title: "Ahora aprende Ecos",
      body: "Ya viste una estacion persistente. El siguiente sistema meta vive en Ecos: toca la tab primaria real resaltada para abrirla.",
      actionLabel: null,
    }),
  }),
});

export function getStaticOnboardingStepCopy(step = null) {
  return ONBOARDING_STATIC_COPY[step] || null;
}

export function getDynamicOnboardingStepCopy(step = null, variant = "default") {
  const copyVariants = ONBOARDING_DYNAMIC_COPY[step];
  if (!copyVariants) return null;
  return copyVariants[variant] || copyVariants.default || null;
}
