# UI/UX Audit Report - IdleRPG

Fecha: 2026-04-20 UTC  
Base analizada: `src/App.jsx`, `Sanctuary.jsx`, `HeroView.jsx`, `ExpeditionView.jsx`, `RegistryView.jsx`, overlays del Santuario y el loop actual `Santuario -> Expedicion -> Extraccion -> Santuario`.

## Resumen ejecutivo

La UI actual no esta rota por falta de features. Esta rota por exceso de dominios al mismo nivel.

Hoy el juego ya tiene un norte de producto bastante claro:

- `Santuario` es la home real.
- `Expedicion` es la pantalla viva de la run.
- `Heroe` concentra build.
- `Ecos` es meta-progresion.
- `Registro` es utilitario y referencia.

El problema es que la arquitectura visual todavia no asume esa verdad con suficiente disciplina. `Santuario` concentra demasiada densidad, `Expedicion` todavia arrastra subpantallas que no son run-critical, `Registro` sigue ocupando un slot demasiado importante para su frecuencia, y los time-gated no tienen una bandeja operacional comun.

La recomendacion optimizada para este repo no es rehacer todo de cero. Es ordenar la jerarquia en dos fases:

1. `Fase 1, bajo riesgo`: mantener la arquitectura top-level actual, pero convertirla mentalmente en `Santuario / Expedicion / Heroe / Ecos / Mas`, sacar ruido de `Expedicion`, y crear una bandeja de timers/claims arriba del fold en `Santuario`.
2. `Fase 2, refactor estructural`: fusionar `Caza + Biblioteca` en un dominio `Codex`, y unificar `Blueprints + Deep Forge + stash de proyectos` en un `Taller` persistente.

La referencia mas util no es un solo juego:

- `Travian` aporta la vista operacional centralizada de timers y colas.
- `Warframe` aporta el modelo de hub + estaciones + time-gates aceptables.
- `Diablo 3`, `Diablo 4` y `Torchlight Infinite` aportan el principio de combate limpio y sistemas densos fuera del loop inmediato.
- `Genshin` aporta la separacion entre navegacion core y menu de utilidades.
- `PoE1`, `PoE2` y `Grim Dawn` recuerdan que profundidad no es lo mismo que poner todo visible a la vez.

## Problemas graves actuales

1. `Santuario` esta sobrecargado.
   Ya funciona como home, agenda, hub de estaciones, panel de claims, panel de recursos y lanzador de overlays. Eso es correcto a nivel de producto, pero todavia no esta priorizado visualmente.

2. `Expedicion` mezcla decision inmediata con tooling secundario.
   `Forja` y `Caza` no deberian competir al mismo nivel que `Combate` y `Mochila`.

3. `Registro` ocupa navegacion primaria sin merecerlo.
   `Logros`, `Metricas` y `Sistema` son visita ocasional o avanzada. En mobile no deberian vivir como equivalente mental de `Heroe` o `Expedicion`.

4. Los time-gated siguen repartidos por estacion.
   El jugador no tiene una respuesta compacta para "que esta listo", "que esta corriendo", "que deberia tocar ahora". `Travian` y `Warframe` resuelven esto mejor con overview central y acceso remoto a operaciones.[^travian-overview][^warframe-companion]

5. El conocimiento esta partido.
   `Caza` vive adentro de `Expedicion`, mientras `Biblioteca` vive como overlay de Santuario. Mentalmente ambas son conocimiento, scouting e investigacion.

6. Falta un criterio fuerte de "arriba del fold".
   En sesion corta, el jugador deberia ver sin scrollear: estado de run, CTA principal, claims, timers listos y una o dos estaciones prioritarias.

7. La UI no diferencia bien sesion corta y sesion larga.
   `Diablo Immortal` y `Genshin` son buenos recordatorios de que una sesion de 3 minutos necesita claridad brutal, no un mapa completo del producto.[^di-codex][^di-gameplay][^genshin-paimon][^genshin-handbook]

## 1. Lecciones concretas de referentes

| Referente | Patron util | Decision trasladable | Error a no copiar |
|---|---|---|---|
| `Travian` | overview central de actividad, colas y recursos | `Santuario` debe ser overview operacional, no lista larga de cards | monetizar automatizaciones clave en exceso termina oliendo a `pay-to-compete`[^travian-overview][^travian-goldclub][^travian-reddit] |
| `Warframe` | hub fisico + estaciones + time-gates que siguen corriendo offline | estaciones del Santuario si; tabs nuevas no | si el hub no resume estado, el jugador siente que tiene que visitar todo manualmente[^warframe-foundry][^warframe-companion][^warframe-trading] |
| `Diablo 3` | combate limpio, town contextual, artisans fuera del HUD | `Expedicion` debe mostrar poca cosa y fuerte | nunca vender atajos de loot core como hizo el Auction House[^d3-ah][^d3-ros][^d3-loot2] |
| `Diablo 4` | feedback rapido y poda de loot noise segun feedback | menos lectura de basura, mas significado por drop | sobrecargar con sistemas cambiantes y demasiado sorting erosiona claridad[^d4-dec2020][^d4-feb2020][^d4-season-feedback][^d4-keep-up] |
| `Genshin` | mundo limpio + menu sistémico enorme pero separado | `Registro` debe convertirse en `Mas`, no competir con el loop core | el menu crece con los años; si no hay jerarquia, explota[^genshin-paimon][^genshin-handbook][^genshin-resin] |
| `Diablo Immortal` | Codex y checklist que ordenan la sesion | conviene una bandeja de actividades/claims en home | demasiados red dots, claims y chores queman la sesion corta[^di-codex][^di-checklist][^di-overwhelming][^di-claims] |
| `Torchlight Infinite` | builds visibles, combate rapido, UI de loot relativamente contenida | `Expedicion` debe quedarse con combate + mochila + intel | si la build diversity no se siente, la comunidad la castiga igual aunque el juego sea rapido[^torchlight-steam] |
| `PoE1` | build depth extrema en pantallas dedicadas | sistemas densos si, pero separados del home | complejidad sin explicacion in-game espanta a nuevos[^poe-tree][^poe-newplayers][^poe-hostile] |
| `PoE2` | simplificacion selectiva, no simplificacion total | podar friccion, no podar profundidad | lanzar un sistema a medias tambien genera backlash[^poe2-faq][^poe2-mtx][^poe2-review][^poe2-patch] |
| `Grim Dawn` | identidad de build por masteries y facciones | `Heroe` debe sentirse dominio fuerte y coherente | demasiada modalizacion trasladada literal a mobile seria pesada[^grimdawn-masteries][^grimdawn-factions] |
| `WoW` | tracker siempre visible + UI modular y configurable | una banda superior de objetivo/claim/trackeo vale oro | si la informacion vital no se pinnea, el retorno se vuelve confuso[^wow-hud][^wow-questtracker] |
| `OSRS` | progreso horizontal visible y collection log como motivacion | el juego necesita coleccion y progreso visible a largo plazo | monetizacion intrusiva destruye integridad, como aprendio RS3[^osrs-clog][^osrs-bonds][^rs3-th][^rs3-integrity] |
| `Gladiatus` | sesiones cortas y progreso asincrono entendible | el loop de expediciones cortas y retorno funciona | saturar premium sobre cooldowns/slots arruina confianza[^gladiatus-official][^gladiatus-rubies][^gladiatus-reviews] |

## 2. Auditoria de la navegacion actual

### Tabs primarias reales del codebase

| Tab actual | Funcion real | Frecuencia | Tipo | Mantener | Ajuste recomendado |
|---|---|---|---|---|---|
| `sanctuary` | home, claims, recursos, estaciones, stash, CTA principal | cada sesion | accion/hub | si | compactar, priorizar, crear bandeja operacional |
| `combat` rotulada `Expedicion` | run viva | cada sesion | accion | si | dejarla mas limpia y recortar subcapas |
| `character` rotulada `Heroe` | ficha, atributos, talentos | cada run y cada ajuste de build | build | si | mantener como dominio fuerte |
| `prestige` rotulada `Ecos` | meta-progresion | cada reset o cada inversion | meta | si | mostrar menos ruido y mejor onboarding contextual |
| `registry` rotulada `Registro` | logros, metricas, sistema | ocasional | referencia/utilitario | no como primaria conceptual | renombrar a `Mas` y tratarla como utilitaria |

### Subvistas actuales

| Dominio | Subvista | Estado | Recomendacion |
|---|---|---|---|
| `Heroe` | `Ficha` | correcta | mantener |
| `Heroe` | `Atributos` | correcta | mantener |
| `Heroe` | `Talentos` | correcta | mantener |
| `Expedicion` | `Combate` | core | mantener |
| `Expedicion` | `Mochila` | core | mantener |
| `Expedicion` | `Forja` | secundaria | mover a `Mochila` como accion contextual o a `Taller` |
| `Expedicion` | `Caza` | contextual | renombrar mentalmente a `Intel`; a futuro fusionar con `Biblioteca` |
| `Registro` | `Logros` | bien como secundaria | mantener ahi |
| `Registro` | `Metricas` | avanzada | mantener ahi |
| `Registro` | `Sistema` | QA/dev | esconder detras de modo debug o acceso secundario |

### Estaciones y overlays del Santuario

| Superficie | Rol UX correcto | Estado actual |
|---|---|---|
| `ExtractionOverlay` | overlay critico de cierre | correcto |
| `RunSigilOverlay` | configuracion previa a run | correcto |
| `LaboratoryOverlay` | estacion de unlocks | correcto, pero necesita mejor entry point |
| `DistilleryOverlay` | job/time-gate | correcto, falta integracion visual con el resto |
| `EncargosOverlay` | job/time-gate | correcto |
| `SigilAltarOverlay` | job/time-gate | correcto |
| `BibliotecaOverlay` | investigacion / conocimiento | correcto en ejecucion, flojo en modelo mental |
| `BlueprintForgeOverlay` / `DeepForgeOverlay` | item persistente / proyecto | correcto tecnicamente, demasiado repartido conceptualmente |

## 3. Arquitectura recomendada para este repo

## 3.1 Decision central

La optimizacion realista para este codebase es:

- `Santuario`
- `Expedicion`
- `Heroe`
- `Ecos`
- `Mas`

No porque sea el estado final perfecto, sino porque es el mejor corte entre claridad, esfuerzo y compatibilidad con la implementacion actual.

### Que cambia de verdad

1. `Registro` deja de ser un dominio de jugador y pasa a ser `Mas`.
   Inspiracion: `Paimon Menu` de `Genshin`, donde utilidades y sistemas secundarios no compiten con el loop principal.[^genshin-paimon]

2. `Expedicion` se reduce a tres verbos:
   - `Combate`
   - `Mochila`
   - `Intel`

   `Intel` reemplaza el framing de `Caza`.

3. `Forja` sale del primer nivel visible de `Expedicion`.
   Puede vivir:
   - como sheet contextual desde `Mochila`
   - o como capa del `Taller` en Santuario

   Inspiracion: town artisans de `Diablo 3` y limpieza de HUD de `Diablo 4`.[^d3-ros][^d4-feb2020]

4. `Santuario` se vuelve overview de cuenta.
   Menos cards, mas prioridad.

5. `Sistema` deja de estar en una ruta de usuario normal.
   Tiene sentido para testers, no para navegacion primaria.

## 3.2 Fase 2 recomendada si queres refactor fuerte

Cuando convenga reordenar conceptos y no solo labels:

- `Caza + Biblioteca -> Codex`
- `Blueprints + Deep Forge + stash temporal -> Taller`
- `Encargos + Altar de Sigilos -> Operaciones`

Ese estado futuro se parece mas a:

- `Santuario`
- `Expedicion`
- `Heroe`
- `Ecos`
- `Mas`

pero con overlays mas coherentes y menos dispersion conceptual.

## 3.3 Que no recomiendo

- No recomiendo bajar de golpe a `4` tabs si eso obliga a fusionar `Heroe + Ecos`.
  En este juego esa fusion rompe claridad mas de la que ahorra.

- No recomiendo subir estaciones a tabs primarias.
  `Laboratorio`, `Destileria`, `Encargos`, `Altar` y `Biblioteca` funcionan mejor como estaciones.

- No recomiendo copiar la densidad de `PoE1`.
  La profundidad deberia estar en sistemas, no en ruido visual simultaneo.[^poe-tree][^poe-newplayers]

## 4. Jerarquia de informacion por sesion

## 4.1 Sesion corta, 2 a 5 minutos

El jugador entra y deberia resolver cuatro preguntas sin explorar:

1. `Tengo una run activa o no?`
2. `Hay algo listo para reclamar?`
3. `Cual es el mejor siguiente click?`
4. `Hay un cuello de botella claro?`

### Que tiene que verse arriba del fold en `Santuario`

- estado de run
- CTA principal
- claims listos
- timers corriendo mas relevantes
- una sugerencia de `siguiente mejor paso`

Si esto no entra arriba del fold, el home esta mal priorizado.

## 4.2 Sesion larga, 20 a 40 minutos

La sesion larga deberia habilitar:

- preparar sigilos
- revisar stash temporal
- abrir `Taller`
- lanzar investigaciones y jobs
- entrar a expedicion
- consultar `Intel`
- cerrar con extraccion

La home no tiene que mostrar todos esos detalles inline. Solo tiene que ser la pista de despegue correcta.

## 5. Wireframe propuesto

```text
┌─────────────────────────────────────┐
│ SANTUARIO                           │
│ Heroe: Warrior · Juggernaut         │
│ Estado: Sin expedicion activa       │
│ [ Iniciar expedicion ]              │
├─────────────────────────────────────┤
│ LISTO AHORA                         │
│ Destileria lista                 [>]│
│ 1 encargo listo                  [>]│
│ Biblioteca: 1 estudio finalizado [>]│
├─────────────────────────────────────┤
│ SIGUIENTE MEJOR PASO                │
│ "Activa una investigacion nueva"    │
│ [ Abrir Laboratorio ]               │
├─────────────────────────────────────┤
│ OPERACION EN CURSO                  │
│ Destileria      08:12               │
│ Altar de Sigilos 15:40              │
│ Encargos        01/03               │
├─────────────────────────────────────┤
│ ESTACIONES                          │
│ [Laboratorio] [Destileria]          │
│ [Biblioteca]  [Encargos]            │
│ [Taller]      [Altar]               │
├─────────────────────────────────────┤
│ RECURSOS                            │
│ Esencia  Flux  Tinta  Polvo         │
└─────────────────────────────────────┘

Bottom nav:
[Santuario] [Expedicion] [Heroe] [Ecos] [Mas]
```

Inspiracion:

- `Travian` para overview y timers.[^travian-overview]
- `Warframe` para hub con estaciones.[^warframe-foundry]
- `Diablo Immortal` para mezcla de CTA + ciudad + vendors/estaciones.[^di-gameplay]

## 6. Layout por pantalla

## 6.1 Santuario

### Lo que muestra

- estado global
- CTA principal
- claims
- timers
- estaciones
- stash/proyectos resumidos

### Orden visual

- arriba: estado + CTA
- medio: claims + siguiente mejor paso
- abajo: estaciones + recursos

### Regla UX

`Santuario` no debe ser un dashboard neutro. Debe ser una home opinada.

## 6.2 Expedicion

### Subvistas recomendadas

- `Combate`
- `Mochila`
- `Intel`

### Lo que se ve sin tocar nada

- tier actual
- enemigo actual
- progreso de run
- riesgo de muerte/extraccion
- CTA relevantes

### Lo que se ve en un tap

- comparacion de item
- detalle de loot
- intel de boss/familia

### Lo que sale de aca

- `Forja` como superficie principal

Inspiracion:

- `Diablo 3` y `Diablo 4`: el combate no compite con media enciclopedia.[^d3-ros][^d4-feb2020]
- `Torchlight Infinite`: ritmo rapido con capas profundas fuera del frame principal.[^torchlight-steam]

## 6.3 Heroe

### Subvistas correctas

- `Ficha`
- `Atributos`
- `Talentos`

### Regla

Toda decision que haga sentir `esta build es mia` deberia vivir aca o linkearse desde aca.

Inspiracion:

- `Grim Dawn` masteries.[^grimdawn-masteries]
- `PoE` passive tree como dominio profundo, no como home clutter.[^poe-tree]

## 6.4 Ecos

### Rol

Es una tab de decision account-wide, no de visita constante cada 30 segundos.

### Recomendacion

- menos ruido numerico
- resumen claro de momentum actual
- entry point visible a late systems como Abismo cuando corresponda

Inspiracion:

- `PoE` para metaprogression decidida
- `OSRS` para progreso horizontal visible
- `Diablo 4` para no esconder que esta capas cambian el ritmo de juego[^poe-tree][^osrs-clog][^d4-season-feedback]

## 6.5 Mas

### Contenido

- `Logros`
- `Metricas`
- `Configuracion`
- `Sistema`

### Tratamiento

- hoja full-screen o pantalla utilitaria
- no bottom tab emocional

Inspiracion:

- `Genshin` y su menu sistémico aparte del loop core.[^genshin-paimon]

## 7. Time-gated systems

## Problema actual

Cada estacion sabe lo suyo, pero el home no sabe contarlo.

## Solucion recomendada

### 1. Bandeja operacional

Una seccion comun en `Santuario` con tres grupos:

- `Listo`
- `Corriendo`
- `Bloqueado por recurso`

### 2. Badges de estacion

Cada estacion necesita a lo sumo:

- badge de `listo`
- contador de colas
- timer compacto

No necesita barras grandes ni cards gigantes.

### 3. CTA de prioridad

Si algo esta listo, el home debe proponerlo arriba.  
Si nada esta listo, debe mostrar el cuello de botella.

### 4. Notificacion sana

Evitar:

- modales automaticos
- popups que secuestran foco
- lluvia de claims con red dots en cada esquina

Inspiracion:

- `Travian` overview para leer estado de un vistazo.[^travian-overview]
- `Warframe` foundry y companion para que el timer se sienta progreso, no castigo.[^warframe-foundry][^warframe-companion]
- `Genshin` resin/condensed resin para compactar friccion de rutina.[^genshin-condensed][^genshin-resin-changes]

## 8. Cambios explicitos

## Tabs que deberian fusionarse

- `Caza + Biblioteca -> Codex` en fase 2
- `Blueprints + Deep Forge + stash temporal -> Taller`

## Tabs que deberian convertirse en overlays o capas contextuales

- `Forja` dentro de `Expedicion`
- `Laboratorio`
- `Destileria`
- `Encargos`
- `Altar de Sigilos`
- `Biblioteca`

## Informacion que deberia moverse

- `Sistema` fuera de la navegacion normal
- `Metricas` fuera del foco primario
- parte del detalle de estaciones fuera de `Santuario`, dejando solo resumen y acceso

## Lo que deberia simplificarse o eliminarse

- cards de igual peso visual en `Santuario`
- lectura repetida de timers por card
- framing de `Registro` como si fuese dominio central
- primer nivel de `Forja` dentro de `Expedicion`

## 9. Roadmap recomendado por impacto / esfuerzo

## Alto impacto / bajo esfuerzo

1. Renombrar `Registro` a `Mas`.
2. Mover `Sistema` detras de modo debug o acceso secundario.
3. Crear una `Bandeja operacional` en `Santuario`.
4. Reordenar `Santuario` para mostrar `CTA + listo ahora + siguiente mejor paso` arriba del fold.
5. Renombrar `Caza` a `Intel` en `Expedicion`.

## Alto impacto / esfuerzo medio

6. Sacar `Forja` del primer nivel de `Expedicion`.
7. Compactar visualmente estaciones del Santuario a accesos + estado.
8. Rediseñar `Ecos` para que se lea como decision account-wide y no como wall of nodes.

## Alto impacto / esfuerzo alto

9. Fusionar `Caza + Biblioteca`.
10. Unificar `Blueprints + Deep Forge + stash temporal`.
11. Crear una arquitectura fuerte de `Operaciones` para jobs persistentes.

## Conclusiones finales

La mejor optimizacion de UI/UX para este proyecto hoy no es "tener menos features visibles". Es tener menos dominios compitiendo por prioridad.

La decision mas rentable es muy concreta:

- `Santuario` como home operacional
- `Expedicion` mas limpia
- `Heroe` como dominio de build
- `Ecos` como meta
- `Mas` como utilitario

Si haces solo eso, el juego ya se siente bastante mas coherente en mobile.  
Si despues sumas `Codex`, `Taller` y `Operaciones` como dominios mejor definidos, entonces la UI deja de sentirse "muchos sistemas sueltos" y empieza a sentirse como producto.

## Fuentes

[^travian-overview]: Travian, `Central Village Overview` - https://support.travian.com/en/support/solutions/articles/7000062844-central-village-overview
[^travian-goldclub]: Travian, `Gold Club` - https://support.travian.com/id/support/solutions/articles/7000060368-klub-emas
[^travian-reddit]: Reddit, critica comunitaria sobre monetizacion/competitividad en Travian - https://www.reddit.com/r/travian/comments/1qqe04p/i_dislike_the_ad_system_such_an_incentive_to_not/
[^warframe-companion]: Warframe Companion wiki - https://wiki.warframe.com/w/Warframe_Companion
[^warframe-foundry]: Warframe Foundry wiki - https://wiki.warframe.com/w/Foundry
[^warframe-trading]: Warframe trading FAQ - https://support.warframe.com/hc/en-us/articles/200092259-Trading-FAQ-Safe-Trading-Tips
[^d3-ah]: Wired, `Why Diablo's Auction House Went Straight to Hell` - https://www.wired.com/2013/09/diablo-auction-house
[^d3-ros]: PCGamesN, `Diablo III: Reaper of Souls review` - https://www.pcgamesn.com/diablo/diablo-iii-reaper-souls-review
[^d3-loot2]: Digital Trends, `Getting started with Diablo III: Reaper of Souls and the Loot 2.0 changes` - https://www.digitaltrends.com/gaming/diablo-iii-reaper-souls-guide-loot-2-0-changes/
[^d4-dec2020]: Diablo IV quarterly update, December 2020 - https://news.blizzard.com/en-us/diablo4/23583664
[^d4-feb2020]: Diablo IV quarterly update, February 2020 - https://news.blizzard.com/en-gb/article/23308274/diablo-iv-quarterly-updatefebruary-2020
[^d4-season-feedback]: Diablo IV Campfire Chat summary - https://news.blizzard.com/en-us/diablo4/23985148/catch-up-on-the-season-of-the-malignant-campfire-chat
[^d4-keep-up]: GamesRadar, `Diablo 4 game director admits it's really hard for players to keep up` - https://www.gamesradar.com/games/diablo/diablo-4-game-director-admits-its-really-hard-for-players-to-keep-up-with-the-ever-changing-arpg-especially-if-you-arent-at-the-cutting-edge-of-everything-all-the-time/
[^genshin-paimon]: Genshin Impact Wiki, `Paimon Menu` - https://genshin-impact.fandom.com/wiki/Paimon_Menu
[^genshin-handbook]: Genshin Impact Wiki, `Adventurer Handbook` - https://genshin-impact.fandom.com/wiki/Adventurer_Handbook
[^genshin-resin]: Genshin Impact Wiki, `Tutorial/Original Resin` - https://genshin-impact.fandom.com/wiki/Tutorial/Original_Resin
[^genshin-condensed]: Genshin Impact Wiki, `Condensed Resin` - https://genshin-impact.fandom.com/wiki/Condensed_Resin
[^genshin-resin-changes]: Genshin Impact Wiki, `Original Resin/Change History` - https://genshin-impact.fandom.com/wiki/Original_Resin/Change_History
[^di-gameplay]: Diablo Immortal Gameplay Overview - https://news.blizzard.com/en-us/diablo-immortal/23557147/diablo-immortal-gameplay-overview-everything-you-need-to-know
[^di-codex]: Diablo Wiki, `Codex (Diablo Immortal)` - https://diablo.fandom.com/wiki/Codex_%28Diablo_Immortal%29
[^di-checklist]: Reddit, `Daily/weekly checklist?` - https://www.reddit.com/r/DiabloImmortal/comments/1hb5la6
[^di-overwhelming]: Reddit, `Overwhelming amount of things` - https://www.reddit.com/r/DiabloImmortal/comments/1knhw9t
[^di-claims]: Reddit/Diablo feedback sobre exceso de claims y friccion - https://www.reddit.com/r/Diablo/comments/v3r66p
[^torchlight-steam]: Torchlight Infinite on Steam - https://store.steampowered.com/app/1974050/Torchlight_Infinite
[^poe-tree]: Path of Exile passive skill tree - https://www.pathofexile.com/passive-skill-tree
[^poe-newplayers]: Reddit, `Is PoE that difficult for a casual player?` - https://www.reddit.com/r/pathofexile/comments/1h21y2h
[^poe-hostile]: Reddit, `Why is PoE so hostile towards new players?` - https://www.reddit.com/r/pathofexile/comments/ypmkbf
[^poe2-faq]: Path of Exile 2 Early Access FAQ - https://www.pathofexile.com/forum/view-thread/3587981
[^poe2-mtx]: Path of Exile forum, microtransactions shared between PoE1 y PoE2 - https://www.pathofexile.com/forum/view-thread/3670063
[^poe2-review]: Polygon, `Path of Exile 2 patch makes difficulty less frustrating` - https://www.polygon.com/news/498491/path-exile-2-early-access-patch-notes-difficulty
[^poe2-patch]: PC Gamer, feedback-driven PoE2 change on shapeshifting/dodge roll - https://www.pcgamer.com/games/rpg/path-of-exile-2-devs-had-so-much-negativity-around-druids-not-being-able-to-dodge-roll-in-animal-forms-that-they-spent-the-last-month-making-it-happen-man-it-was-tough-to-get-that-to-work-right/
[^grimdawn-masteries]: Grim Dawn masteries - https://grimdawn.fandom.com/wiki/Masteries
[^grimdawn-factions]: Grim Dawn factions guide - https://www.grimdawn.com/guide/character/factions/
[^wow-hud]: WoW Dragonflight HUD and UI revamp - https://news.blizzard.com/en-us/article/23841481/world-of-warcraft-dragonflight-hud-and-ui-revamp
[^wow-questtracker]: Blizzard support, quest tracker behavior - https://us.support.blizzard.com/en/article/000026704
[^osrs-clog]: OSRS collection log - https://oldschool.runescape.wiki/w/Collection_log
[^osrs-bonds]: Old School RuneScape Bonds - https://www.runescape.com/oldschool/bonds
[^rs3-th]: RuneScape Wiki, `Treasure Hunter` - https://runescape.wiki/w/Treasure_Hunter
[^rs3-integrity]: GamesRadar, remocion de Treasure Hunter en 2026 - https://www.gamesradar.com/games/mmo/over-120-000-microtransaction-haters-have-successfully-campaigned-to-remove-the-controversial-feature-from-mmo-by-2026-jagex-declares-the-start-of-a-new-era/
[^gladiatus-official]: Gladiatus official page - https://gameforge.com/en-GB/games/gladiatus.html
[^gladiatus-rubies]: Gladiatus fansite, premium rubies and cooldown uses - https://gladiatus.gamerz-bg.com/game-guide/premium/rubies
[^gladiatus-reviews]: Gladiatus user reviews - https://www.metacritic.com/game/gladiatus/user-reviews/
