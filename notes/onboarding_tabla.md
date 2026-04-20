# Onboarding — Tabla Consolidada

Fecha: 2026-04-19 UTC  
Estado: versión consolidada para iterar antes de tocar código

## Nota de implementación actual

El tramo temprano quedó redefinido así:

- `Santuario` vestíbulo
- `Iniciar expedición`
- elegir `clase`
- combate automático
- `Auto-avance`
- `Mochila` y primer equip
- primer boss
- primera muerte contra boss
- espera de `2s`
- abrir `Heroe`
- elegir `spec`
- `Ficha`
- `Atributos`
- `Talentos`
- volver a la run
- matar el boss para continuar

La tabla histórica de abajo sigue siendo útil como roadmap, pero la referencia operativa fina del beat ahora vive en [beats.md](./beats.md).

## Flujo completo propuesto desde `Spec` hasta `Abismo`

### Tramo A — Cerrar el onboarding de la primera run

| Orden | Beat | Trigger | Fuerza | Qué pasa | Resultado |
|---|---|---|---|---|---|
| A1 | `CHOOSE_SPEC` | después del primer talento | `Hard` | elige una subclase dentro de `Heroe` | la build deja de ser genérica |
| A2 | `COMBAT_AFTER_TALENT` | spec elegida | `Info-only` | mensaje corto: volver a la run y matar el boss para seguir | ticks vuelven al combate |
| A3 | Kill del primer boss | derrota al boss de `Tier 5` | `Soft fuerte` | mensaje de hito superado | habilita `Caza` |
| A4 | Intro de `Caza` | primer boss derrotado | `Soft` | spotlight al botón real de `Caza` dentro de `Expedición` | el jugador entiende dónde mirar objetivos de la run |
| A5 | Empuje corto post-boss | `2-4` tiers más o un umbral de kills adicional | `Passive` | no meter sistema nuevo todavía; dejar que respire la run | el jugador siente continuidad |
| A6 | `EXTRACTION_READY` | progreso suficiente después del primer boss, idealmente cerca de `Tier 9` | `Soft fuerte` | aparece el botón real `Extraer al Santuario` con explicación corta | se habilita el cierre controlado de la run |
| A7 | Primera extracción | confirma `Extraer al Santuario` | `Hard` | overlay guiado explicando cierre de run y `cargo` | vuelve al `Santuario` con el loop entendido |

### Tramo B — Primer Santuario real

| Orden | Beat | Trigger | Fuerza | Qué pasa | Resultado |
|---|---|---|---|---|---|
| B1 | `FIRST_SANCTUARY_RETURN` | volver tras la primera extracción | `Hard` | el `Santuario` deja de ser vestíbulo y presenta `Laboratorio` + `Stash temporal` | el jugador entiende que la run se procesa acá |
| B2 | Intro de `Laboratorio` | primer retorno al Santuario | `Hard` | spotlight al botón real del `Laboratorio` | se presenta la idea de desbloquear estaciones |
| B3 | Primer research forzado | primera visita a `Laboratorio` | `Hard` | único research disponible: `Destilería` | guía el orden correcto del hub |
| B4 | `Destilería` desbloqueada | research completado | `Hard` | spotlight a `Destilería` | el hub ya tiene su primera estación funcional |
| B5 | Primer job de `Destilería` | `Destilería` abierta + bundle de la primera extracción | `Hard` | inicia la primera destilación | se enseña recurso persistente y espera corta |

### Tramo C — Primer prestige y loop meta

| Orden | Beat | Trigger | Fuerza | Qué pasa | Resultado |
|---|---|---|---|---|---|
| C1 | Segunda expedición libre | después del primer job de `Destilería` | `Passive` | dejar jugar con menos interferencia | consolida el loop run -> hub |
| C2 | Primera conversión a `Ecos` | segunda extracción que ya cumpla conversión | `Soft fuerte` | autoabre `Ecos` y explica que esto ya es progreso meta | desbloquea la tab `Ecos` |
| C3 | Primer nodo de `Ecos` | primera vez en `Ecos` | `Hard` | fuerza comprar `1` nodo básico | el jugador siente el primer reset valioso |
| C4 | Cierre del primer prestige | primer nodo comprado | `Info-only` | mensaje corto: ahora tu cuenta ya crece entre runs | queda fijado el modelo `Expedición -> Extracción -> Santuario -> Ecos` |

### Tramo D — Blueprints y persistencia de items

| Orden | Beat | Trigger | Fuerza | Qué pasa | Resultado |
|---|---|---|---|---|---|
| D1 | `Blueprint vs Desguace` | `Prestige 2` y volver al `Santuario` con items rescatables | `Hard` | compara ambas opciones y explica que un blueprint no es gear directo | se abre el procesamiento real de items rescatados |
| D2 | Primer `Blueprint` o primer `Desguace` | resolver la decisión anterior | `Hard` | si hace falta, asegurar `2-3` items en stash para que el tutorial tenga sentido | el jugador entiende qué hace cada camino |
| D3 | Materialización explicada | primera run con blueprint activo | `Soft` | chip o beat corto: el blueprint se materializa como item nuevo sesgado | conecta Santuario con la siguiente run |

### Tramo E — Estaciones del Santuario por `Laboratorio`

| Orden | Beat | Trigger | Fuerza | Qué pasa | Resultado |
|---|---|---|---|---|---|
| E1 | `Forja Profunda` visible bloqueada | desde `Prestige 2` | `Passive` | aparece como bloqueada en `Laboratorio` | anticipa que el blueprint tendrá desarrollo a futuro |
| E2 | Research de `Forja Profunda` | `Prestige 3` | `Soft fuerte` | `Laboratorio` permite investigarla | se desbloquea la estación persistente de planos |
| E3 | Primer uso de `Forja Profunda` | research completado + blueprint existente | `Hard` | primer uso guiado: reforzar estructura o invertir afinidad | el blueprint deja de ser solo una plantilla estática |
| E4 | Research de `Biblioteca` | `Prestige 4` | `Soft` | `Laboratorio` muestra la estación desbloqueable | el jugador aprende que el conocimiento también se investiga |
| E5 | Primer research de `Biblioteca` | tinta disponible + `Biblioteca` abierta | `Soft fuerte` | activa el primer hito de conocimiento | kills y descubrimientos dejan de sentirse “gratis” |
| E6 | Research de `Encargos` | `Prestige 5` | `Soft` | `Laboratorio` la muestra desbloqueable | el Santuario gana una capa pasiva paralela |
| E7 | Primer `Encargo` | estación desbloqueada | `Soft` | iniciar una misión básica de recursos | se enseña retención lateral sin tapar la expedición |
| E8 | Research de `Altar de Sigilos` | `Prestige 6` | `Soft` | `Laboratorio` la muestra desbloqueable | aparece preparación avanzada de runs |
| E9 | Primer uso del `Altar` | estación desbloqueada + recursos mínimos | `Soft fuerte` | preparar una infusión simple para la próxima run | se enseña que algunas mejoras son “para la siguiente expedición” |

### Tramo F — Gate del Abismo

| Orden | Beat | Trigger | Fuerza | Qué pasa | Resultado |
|---|---|---|---|---|---|
| F1 | Techo de `Tier 25` | mata al boss de `Tier 25` | `Soft fuerte` | mensaje fuerte: llegaste al borde del mundo conocido | no puede pasar de `Tier 25` todavía |
| F2 | `Portal al Abismo` en `Laboratorio` | boss de `Tier 25` derrotado + `Biblioteca`, `Encargos` y `Altar` ya desbloqueados | `Hard` para abrir endgame | aparece el research del portal | el acceso al endgame depende del Santuario entero |
| F3 | Research del `Portal` | reclamarlo | `Hard` | se abre el paso a `Tier 26+` | el jugador ya puede entrar al Abismo |
| F4 | Primer `Abismo` | entrar a `Tier 26` | `Soft` | interstitial corto: nuevas reglas, presión y recompensas | onboarding de endgame |

### Resumen corto de unlocks por milestone

| Milestone | Unlock principal |
|---|---|
| Primer boss muerto | `Caza` |
| Primera extracción | `Laboratorio` |
| Primer research | `Destilería` |
| Primer prestige | `Ecos` |
| `Prestige 2` | `Blueprint vs Desguace` |
| `Prestige 3` | `Forja Profunda` |
| `Prestige 4` | `Biblioteca` |
| `Prestige 5` | `Encargos` |
| `Prestige 6` | `Altar de Sigilos` |
| Boss de `Tier 25` + requisitos | `Portal al Abismo` |

## Orden de unlocks resumido

| Momento | Qué aparece |
|---|---|
| Inicio | `Santuario`, `Expedición`, `Registro` |
| Clase elegida + `spec` elegida | `Heroe` completo |
| Primer boss derrotado | `Caza` dentro de `Expedición` |
| Primera extracción | `Stash temporal`, `Laboratorio` |
| Primer research del Laboratorio | `Destilería` |
| Primera conversión a ecos | `Ecos` |
| `Prestige 2` | tutorial `Blueprint vs Desguace` |
| `Prestige 3` | research de `Forja Profunda` en `Laboratorio` |
| `Prestige 4` | research de `Biblioteca` en `Laboratorio` |
| `Prestige 5` | research de `Encargos` en `Laboratorio` |
| `Prestige 6` | research de `Altar de Sigilos` en `Laboratorio` |
| Boss de `Tier 25` derrotado + todo lo anterior | research `Portal al Abismo` |
| Portal investigado + entrar a `Tier 26` | onboarding de `Abismo` |

## Reglas de visibilidad base

- Inicio visible: `Santuario`, `Expedición`, `Registro`
- `Heroe`: oculto o gris hasta elegir `spec`
- `Ecos`: oculto hasta la primera conversión real a ecos
- `Caza`: oculta hasta derrotar el primer boss
- `Santuario`: arranca como vestíbulo, sin estaciones reales
- `Laboratorio`: aparece tras la primera extracción
- `Biblioteca`, `Encargos`, `Altar`, `Forja Profunda`: visibles dentro de `Laboratorio` como bloqueadas antes de sus requisitos

## Tabla de beats

| Beat | Nombre | Trigger | Fuerza | Qué mostramos | Unlock / Resultado | Objetivo mental | Notas consolidadas |
|---|---|---|---|---|---|---|---|
| 0 | Primer login | primera vez que entra | `Hard` | `Santuario` vestíbulo con CTA `Elegir clase` | ninguna | el juego vive en `Santuario`, pero todavía está vacío | Explicar en una línea de qué trata el juego. `Heroe` sigue oculto o gris. |
| 1 | Elegir clase | toca `Elegir clase` | `Hard` | selector `Warrior / Mage` | habilita la primera expedición real | primera decisión con identidad | Mostrar una descripción conceptual y temática de cada clase. |
| 2 | Primera entrada a Expedición | clase elegida | `Soft` | copy breve sobre combate automático, XP, niveles y equipo | ninguna | primero se entiende la run | Todavía sin `Caza`. |
| 3 | Auto-avance | mata `3` enemigos | `Soft` | spotlight al botón `Auto-avance` | ninguna | la run puede progresar sola | Trigger más temprano para acelerar comprensión. |
| 4 | Primera muerte | primera muerte de la run | `Soft` | frenar ticks y explicar vidas + retroceso | ninguna | morir castiga, pero no borra la run | Tutorial corto y claro. |
| 5 | Elegir spec | llega a `nivel 5` | `Hard` | selector de las `2` specs | se habilita `Heroe` completo | ahora la build ya no es genérica | Frenar ticks y bloquear cambio de tab hasta resolverlo. |
| 6 | Presentación de Heroe | spec elegida | `Soft` | guía tab por tab: `Ficha`, `Atributos`, `Talentos` | `Heroe` aparece de verdad | `Heroe` es la casa de la build | Se usa como puente hacia atributo y talento. |
| 7 | Primer atributo | entra a `Atributos` por primera vez | `Hard` | forzar gasto de `1` punto | ninguna | gastar cambia el personaje | Atributo libre. Si no alcanza el oro, darle lo suficiente. No dejar cambiar de tab hasta hacerlo. |
| 8 | Primer talento | termina el primer atributo | `Hard` | forzar compra de `1` nodo básico de tramo 1 | ninguna | cada nivel moldea la build | Puede ser cualquiera de los `3` nodos básicos de la clase base. |
| 9 | Primer equip | vuelve a `Combate`, mata `2` enemigos más y ya tiene drop garantizado | `Hard` | aparece `Mochila` y se fuerza equipar `1` item | `Mochila` se vuelve visible | el botín sirve ahora | La `Mochila` no aparece antes de este beat. |
| 10 | Primer boss | aparece el boss de `Tier 5` | `Soft fuerte` | frenar ticks y explicar qué es un boss | ninguna | ahora hay un hito real dentro de la run | Mejor drop, más peligro, identidad temática. |
| 11 | `Caza` | derrota al primer boss | `Soft fuerte` | spotlight de `Caza` | `Caza` se habilita dentro de `Expedición` | la expedición también tiene objetivos | `Caza` se enseña recién después del kill, no antes. |
| 12 | Forja de campo | primer item razonable para tocar `Forja` | `Passive` | copy breve: `Reroll` arregla la run actual | ninguna | la forja de campo es táctica, no persistente | No va por `Laboratorio`. No se fuerza. |
| 13 | Extracción disponible | después del tutorial principal de expedición, nunca antes de derrotar el primer boss y no visible por debajo de `Tier 6` durante onboarding | `Soft fuerte` | aparece botón `Extraer al Santuario` y se explica qué hace | ninguna | la run puede cerrarse de forma controlada | Durante onboarding, si el jugador abre extracción manualmente debe poder cancelar y volver a la run. |
| 14 | Primera extracción | confirma la primera extracción | `Hard` | `ExtractionOverlay` con 2-3 spotlights | vuelve al `Santuario` correctamente | la run termina en `Extracción` | En la primera, el item puede elegirse automático y se fuerza al menos `1` bundle para enseñar el sistema. |
| 15 | Primer retorno al Santuario | vuelve tras la primera extracción | `Hard` | explicar `Santuario`, `Stash temporal` y `Laboratorio` | se expanden `Stash temporal` y `Laboratorio` | el Santuario es la segunda mitad del juego | Aclarar que los items rescatados se procesarán más adelante. |
| 16 | Primer research de Laboratorio | entra al `Laboratorio` por primera vez | `Hard` | research spotlighteado de `Destilería` | `Destilería` se desbloquea tras `15s` | el tiempo real se presenta de forma controlada | Forzar espera de `15s`, reclamar y volver al hub. |
| 17 | Primera Destilería | `Destilería` desbloqueada + bundle forzado de la primera extracción | `Hard` | iniciar primera destilación | primer job real del Santuario | el Santuario procesa valor entre expediciones | Esta sí se fuerza. |
| 18 | Primera conversión a ecos | segunda extracción que ya cumple conversión | `Soft fuerte` | autoapertura de `Ecos` y explicación corta | tab `Ecos` | el primer prestige es un quiebre real | `Ecos` entra recién acá, no en la primera extracción. |
| 19 | `Blueprint vs Desguace` | alcanzar `Prestige 2` y volver al `Santuario` con items en `Stash temporal` | `Hard` | tutorial comparando ambas opciones | se habilita el procesamiento real de items rescatados | no guardo el item final; guardo dirección o materia prima | Explicar que un `Blueprint` se materializa en futuras runs. Idealmente llegar con `2-3` items en stash. |
| 20 | `Forja Profunda` bloqueada visible | desde `Prestige 2` | `Passive` | card bloqueada en `Laboratorio` | ninguna | hay una estación persistente más avanzada por venir | Mostrar requisito: `Prestige 3`. |
| 21 | Research de `Forja Profunda` | `Prestige 3` | `Soft fuerte` | `Laboratorio` permite investigarla | estación `Forja Profunda` usable | ahora sí puede desarrollar planos | Si no tiene items/plano para entenderlo, generar `2` items tutoriales. |
| 22 | Research de `Biblioteca` | `Prestige 4` | `Soft` | `Laboratorio` la muestra desbloqueable | `Biblioteca` usable | el conocimiento se activa, no se regala | Hasta entonces aparece gris. |
| 23 | Primer research de `Biblioteca` | `Biblioteca` desbloqueada + tinta disponible | `Soft` | CTA `Investigar` sobre primer hito | primer bonus permanente de conocimiento | progreso histórico != progreso activado | No hace falta forzarlo en el momento del unlock. |
| 24 | Research de `Encargos` | `Prestige 5` | `Soft` | `Laboratorio` la muestra desbloqueable | `Encargos` usable | aparece una capa pasiva paralela | Se deja más tarde para no saturar el early. |
| 25 | Research de `Altar de Sigilos` | `Prestige 6` | `Soft` | `Laboratorio` la muestra desbloqueable | `Altar de Sigilos` usable | la preparación de la run llega cuando el jugador ya entiende el loop | También visible gris antes de tiempo. |
| 26 | Boss de `Tier 25` | derrota al boss de `Tier 25` | `Soft fuerte` | mensaje especial: se detectó el borde del Abismo | research `Portal al Abismo` aparece en `Laboratorio` | el endgame es una capa aparte | No puede pasar de `Tier 25` todavía. |
| 27 | `Portal al Abismo` | boss de `Tier 25` derrotado + `Forja Profunda`, `Biblioteca`, `Encargos` y `Altar` ya desbloqueados | `Hard` para entrar al endgame | research de `Portal al Abismo` | se habilita el paso a `Tier 26+` | el Abismo es una conquista del Santuario, no solo de la run | El portal gatea el acceso real al endgame. |
| 28 | Primer Abismo | entra a `Tier 26` con el portal ya abierto | `Soft` | interstitial corto de `Abismo` | onboarding de endgame | el juego cambia de ritmo y de objetivos | Explicar presión, rewards y nueva capa de progresión. |

## Hard force propuestos

| Forzamos | Sí / No |
|---|---|
| Elegir clase antes de la primera run | Sí |
| Elegir la primera spec en `nivel 5` | Sí |
| Gastar el primer atributo | Sí |
| Comprar el primer talento | Sí |
| Equipar el primer item | Sí |
| Resolver la primera extracción | Sí |
| Hacer el primer research del `Laboratorio` (`Destilería`) | Sí |
| Iniciar la primera `Destilería` | Sí |
| Resolver `Blueprint vs Desguace` en `Prestige 2` | Sí |
| Abrir `Caza` | No |
| Usar `Forja` de campo | No |
| Resetear talentos | No |
| Aprender `loot filter` temprano | No |
| Hacer el primer research de `Biblioteca` al instante del unlock | No |

## Dudas todavía abiertas

1. ¿`Heroe` al inicio queda oculto del todo o gris con hint `Disponible al elegir una subclase`?
2. ¿La primera extracción tutorial autoelige siempre el item, o sólo si el jugador tarda demasiado?
3. ¿Queremos capear el `Stash temporal` en `3` items antes de `Prestige 2` para asegurar que el tutorial llegue limpio?
4. ¿El research de `Portal al Abismo` debe requerir solo unlocks previos o también costos fuertes en recursos?
