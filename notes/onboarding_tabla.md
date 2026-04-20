# Onboarding — Tabla Consolidada

Fecha: 2026-04-19 UTC  
Estado: versión consolidada para iterar antes de tocar código

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
| 13 | Extracción disponible | después del tutorial principal de expedición, idealmente cerca de `Tier 9` | `Soft fuerte` | aparece botón `Extraer al Santuario` y se explica qué hace | ninguna | la run puede cerrarse de forma controlada | Mostrar que ahora ya puede retirarse cuando esté listo. |
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
