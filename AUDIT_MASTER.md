# AUDIT_MASTER

## 1. Resumen Ejecutivo

Este proyecto ya tiene una tesis fuerte y rara: `Santuario -> Expedicion -> Extraccion -> Santuario`. La mejor parte del juego no es el idle puro ni el combate aislado; es el momento en que una corrida se convierte en valor persistente y te obliga a decidir que asegurar, que perseguir y que preparar para la siguiente salida.

El problema principal hoy no es falta de contenido. Es desorden relativo entre lo mejor del juego y lo mas visible. `Extraccion` esta cerca de ser el mejor pico del producto, pero `Santuario` todavia carga demasiada operativa. `Crafting` tiene valor, pero su ownership todavia es difuso. La cuenta ya tiene capas buenas (`Ecos`, `Codex`, `Abismo`, `Blueprints`), pero no estan serializadas como una historia de mastery clara. Y en paralelo, la arquitectura ya muestra tension real: bundle critico grande, rerender global amplio, save de estado completo y monolitos de orquestacion.

La buena noticia es esta: no hace falta agrandar el juego para que mejore mucho. Hace falta compactarlo, ordenarlo y volver mas legible su profundidad real. Si las proximas decisiones se enfocan en `Santuario compacto`, `ownership fuerte del crafting`, `Session Arc + Weekly Ledger`, `loot filter + lectura build-aware`, y `menos fragilidad tecnica`, el proyecto puede pasar de “prometedor con muchas capas” a “idle ARPG de extraccion con identidad muy clara”.

### Top 10 hallazgos criticos

1. `RS-01` El mayor riesgo de producto es que `Santuario` derive en tablero administrativo y se coma la fantasia de extraccion.
2. `UX-03` `Santuario` sigue demasiado denso arriba del fold y hoy es el principal cuello de claridad.
3. `RS-02` `Crafting` corre riesgo de volverse una sopa de operaciones sin ownership fuerte entre run y hub.
4. `EV-05` `Deep Forge` todavia no es el hogar indiscutido del crafting pesado; `reroll` sigue mal ubicado.
5. `MR-03` La cuenta tiene buen progreso real, pero sigue demasiado fragmentado para sostener mejor `1-3 meses`.
6. `EC-07` El problema del loot no es escasez sino ruido; sin filtro y overflow fuerte, el chase se degrada.
7. `PF-01` El chunk principal sigue demasiado grande para la carga inicial real.
8. `PF-03` La superficie de rerender global es demasiado amplia; optimizar solo el tick no alcanza.
9. `EC-04` Hoy no se puede balancear specs con seriedad porque el harness sigue desalineado del juego vivo.
10. `MR-06` El codigo actual esta sorprendentemente limpio de dark patterns; esto hay que protegerlo explicitamente.

---

## 2. MVP Action Matrix Completa

### Estabilidad

| ID | Categoria | Hallazgo | Impacto | Prioridad | Estado | Primer slice |
|----|-----------|----------|---------|-----------|--------|--------------|
| ST-01 | Estabilidad | Persistencia podia guardar estado viejo al ocultar/cerrar la app. | medio | critico | hecho | ya implementado |
| ST-02 | Estabilidad | `localStorage` podia fallar duro sin wrapper seguro. | medio | quick_win | hecho | ya implementado |
| ST-03 | Arquitectura | No existia snapshot rapido de QA con contexto suficiente. | alto | quick_win | hecho | ya implementado |
| ST-04 | Estabilidad | Los errores recientes no quedaban accesibles para testers. | medio | quick_win | hecho | ya implementado |
| ST-05 | Onboarding | Los jobs del Santuario sincronizaban demasiado durante onboarding. | medio | critico | hecho | ya implementado |

### UX

| ID | Categoria | Hallazgo | Impacto | Prioridad | Estado | Primer slice |
|----|-----------|----------|---------|-----------|--------|--------------|
| UX-03 | UX | `Santuario` sigue demasiado denso arriba del fold. | alto | critico | pendiente | header operativo `Listo ahora / En curso / Siguiente salida` |
| UX-02 | Arquitectura | `Forja` es una subview real pero invisible; arquitectura hibrida. | alto | critico | pendiente | decidir una sola verdad para `Forja` |
| UX-04 | UX | Las acciones frecuentes siguen muy altas en mobile. | alto | critico | pendiente | prototipo de `ContextTray` en `Santuario` y `Expedicion` |
| UX-06 | Feedback | Muchas acciones de Santuario desaparecen sin feedback fuerte. | alto | quick_win | pendiente | toasts y micro-pulses para claims/unlocks |
| UX-05 | UX | Overlays no comparten politica comun de safe area/header/nav. | medio | quick_win | pendiente | `OverlayShell` con modos `soft` y `hard-lock` |
| UX-01 | Redundancia | `Mas` repite navegacion y contexto por capas. | medio | quick_win | pendiente | selector unico `Logros / Metricas / Sistema` |
| UX-07 | Consistencia | Hay demasiada fragmentacion de helpers y estilos inline. | medio | quick_win | pendiente | primitives chicas solo en zonas intervenidas |
| UX-08 | UX | La ayuda mobile sigue apoyada en `title=` y patrones de desktop. | medio | quick_win | pendiente | hints accesibles y long-press donde corresponda |

### Sistemas de juego

| ID | Categoria | Hallazgo | Impacto | Prioridad | Estado | Primer slice |
|----|-----------|----------|---------|-----------|--------|--------------|
| SY-02 | Loot UX | El overflow de inventario descarta drops con surface demasiado debil. | alto | critico | pendiente | toast + contador + surface fuerte en el momento del drop |
| SY-05 | Prestige pacing | El primer prestige puede quedar demasiado shallow y generoso. | alto | critico | pendiente | revisar gate y piso temprano de ecos |
| SY-07 | Decision density | `Santuario` se vuelve rapido mantenimiento y no decision. | alto | critico | pendiente | batch claims/restart y menos friccion operativa |
| SY-01 | Crafting contract | El sistema real no es el que muchos jugadores imaginan por fantasia externa. | alto | critico | pendiente | explicitar contrato actual antes de sumar capas |
| SY-03 | Blueprint progression | `Blueprint aging` no existe; falta decision de producto. | medio | critico | pendiente | decidir permanencia total vs vigencia suave |
| SY-08 | Tooling | El batch runner no sirve desde save fresco por onboarding. | medio | quick_win | pendiente | seed post-onboarding para simulacion |
| SY-06 | Loot math | Hace falta telemetria/fuzz sobre distribucion y pools de affixes. | medio | quick_win | pendiente | script de sampling por tier |
| SY-04 | Migracion | La migracion legacy de talentos hace refund total, no preserva build. | medio | quick_win | pendiente | validar usuarios legacy y cubrir comunicacion |

### Evolucion de sistemas y diseno

| ID | Categoria | Hallazgo | Impacto | Prioridad | Estado | Primer slice |
|----|-----------|----------|---------|-----------|--------|--------------|
| EV-05 | Deep Forge | El crafting pesado no tiene ownership fuerte todavia. | alto | critico | pendiente | mover `reroll` a `Deep Forge` |
| EV-08 | Loop | `Santuario` se volvio mas grande que el loop que deberia servir. | alto | critico | pendiente | `loop v2` centrado en `Extraccion` |
| EV-04 | Informacion tactica | La run mezcla evaluacion y accion de craft mas de la cuenta. | alto | critico | pendiente | `Lente de Escrutinio` MVP en `ExtractionOverlay` |
| EV-06 | Session Arc | Los goals existen, pero no se sienten como sesion coherente. | alto | quick_win | pendiente | objetivo principal + 2 secundarios visibles |
| EV-01 | Feedback ladder | Los picos emocionales existen pero estan planos en intensidad. | alto | quick_win | pendiente | escalera comun de ceremonia por severidad |
| EV-07 | Loot filter | La base tecnica existe, pero no se presenta como producto util. | medio-alto | quick_win | pendiente | `minRarityToShow` + highlights simples |
| EV-03 | Family charges | El sistema ya existe pero necesita cap y mejor lectura. | medio-alto | quick_win | pendiente | cap por familia + labels de probabilidad |
| EV-02 | Blueprint vigencia | Si algun dia se usa, deberia ser vigencia suave y no decadencia dura. | medio | duda | pendiente | indicador de vigencia sin tocar stats |

### Balance y economia

| ID | Categoria | Hallazgo | Impacto | Prioridad | Estado | Primer slice |
|----|-----------|----------|---------|-----------|--------|--------------|
| EC-04 | Tooling / balance | No se puede medir specs bien con el harness actual. | alto | critico | pendiente | alinear batch y bot con unlocks live |
| EC-05 | Crafting economy | `polish` domina demasiado y `reforge` queda caro/opaco. | alto | critico | pendiente | retune `rare/epic` antes de sumar mas craft |
| EC-08 | Legibilidad de poder | El jugador no siempre entiende por que algo es mejor para su build. | alto | critico | pendiente | surface build-aware en `Inventory`, `Crafting`, `Character` |
| EC-03 | Meta economy | `Prestige` temprano sigue demasiado generoso. | alto | critico | pendiente | retune de `readiness` y momentum temprano |
| EC-07 | Loot / drops | El reward loop corre riesgo de ruido y clasificacion de basura. | alto | critico | pendiente | terminar filter + overflow + copy de chase |
| EC-01 | Economia | `Gold` aprieta en mid y pierde rol en late. | alto | critico | pendiente | sinks tardios en `Deep Forge` y hub |
| EC-02 | Progresion | La curva de XP pega saltos demasiado bruscos por brackets. | medio-alto | quick_win | pendiente | curva continua o transicion suave |
| EC-06 | Crafting contract | `Forging Potential` no existe; hay que surfear mejor el contrato real. | medio | quick_win | pendiente | copy/UI del contrato actual |

### Retencion y monetizacion

| ID | Categoria | Hallazgo | Impacto | Prioridad | Estado | Primer slice |
|----|-----------|----------|---------|-----------|--------|--------------|
| MR-02 | Retencion diaria | Falta una razon amable y explicita para volver manana. | alto | critico | pendiente | `Weekly Ledger` bancado con catch-up |
| MR-03 | Retencion mediano plazo | La cuenta crece, pero no lo serializa bien. | alto | critico | pendiente | vista unificada `Codex + Abyss + Blueprints + Prestige` |
| MR-04 | Prestige claridad | Falta resumen brutalmente claro de que conservas y que pierdes. | alto | critico | pendiente | resumen pre/post prestige |
| MR-10 | Longevidad | `1 mes` esta razonable; `3-6 meses` todavia es parcial. | alto | critico | pendiente | `Season/Account Ledger` despues del weekly |
| MR-01 | Retencion corta | Las sesiones de `5-20m` existen, pero no siempre quedan enmarcadas. | alto | critico | pendiente | `Session Arc` visible y cierre corto |
| MR-06 | Monetizacion etica | No hay dark patterns; esto debe volverse guardrail explicito. | alto | critico | pendiente | principios de producto escritos |
| MR-05 | Prestige variedad | `Sigils` ya dan variedad real y no hay que aplanarlos. | medio-alto | quick_win | pendiente | mejor surfacing y ceremonia |
| MR-07 | QoL futuro | Hay cap de inventario, pero no hay seam neutral de stash. | medio-alto | media | pendiente | schema de contenedores, sin tienda |
| MR-08 | Identidad futura | No existe aun una capa de apariencias o profile card. | medio | media | pendiente | `AppearanceProfile` minimo, sin tienda |
| MR-09 | Energia / resin | No encaja con este juego; seria dano puro. | alto | critico | pendiente | dejarlo como `no hacer` explicito |

### Performance y arquitectura

| ID | Categoria | Hallazgo | Impacto | Prioridad | Estado | Primer slice |
|----|-----------|----------|---------|-----------|--------|--------------|
| PF-01 | Carga inicial | El chunk principal sigue demasiado grande. | alto | critico | pendiente | lazy de overlays de `Santuario` y shell mas fino |
| PF-03 | Rerenders | `App` recibe demasiado `state` y rerenderiza demasiado. | alto | critico | pendiente | `AppShell` estable + slices por tab |
| PF-04 | Runtime | `Combat` se rerenderiza cada `120ms` por FX temporales. | alto | critico | pendiente | sacar ese reloj del componente pesado |
| PF-10 | Escalabilidad | `gameReducer`, `onboardingEngine` y hubs ya son monolitos. | alto | critico | pendiente | modularizar por dominio antes de crecer |
| PF-05 | Persistencia | El save sigue serializando el estado completo cada ~`1.8s`. | medio-alto | alto | pendiente | separar `persistedState` de runtime |
| PF-02 | Carga inicial | Tabs lazy siguen cargando subviews enteras aunque no se usen. | medio-alto | alto | pendiente | lazy interno en `Expedition`, `Heroe`, `Mas` |
| PF-11 | Escalabilidad | `Codex` y `Stats` no tienen plan claro para crecer listas. | medio | medio | pendiente | `collapse + pagination + section gating` |
| PF-08 | Runtime | Hay listeners de `resize` y relojes duplicados por toda la app. | medio | medio | pendiente | `ViewportContext` y reloj comun |
| PF-06 | Tick | Falta definir politica formal ante lag visible con pestaña abierta. | medio | medio | pendiente | decidir slowdown vs catch-up acotado |
| PF-09 | Arquitectura | Los catalogos data-driven si estan razonablemente sanos. | medio-alto | quick_win | pendiente | proteger ese patron |
| PF-12 | Carga inicial | No hay cuello real de assets; el problema es JS propio. | medio | quick_win | pendiente | no perder tiempo optimizando assets inexistentes |
| PF-07 | Tooling | `Stats/System` es una vista costosa cuando esta abierta. | medio | alto | pendiente | gating por seccion abierta y export on-demand |

### Riesgos estructurales

| ID | Categoria | Hallazgo | Impacto | Prioridad | Estado | Primer slice |
|----|-----------|----------|---------|-----------|--------|--------------|
| RS-01 | Riesgo de loop | El juego puede derivar en `hub administrativo`. | critico | critico | pendiente | compactar `Santuario` y batch de operativa |
| RS-02 | Riesgo de crafting | El crafting puede volverse una sopa de operaciones. | critico | critico | pendiente | ownership claro entre run y `Deep Forge` |
| RS-03 | Riesgo de progresion | La cuenta puede sentirse fragmentada y no acumulativa. | critico | critico | pendiente | `Weekly Ledger` + vista de cuenta |
| RS-04 | Riesgo de recompensa | El reward loop puede degradarse a ruido y clasificacion. | critico | critico | pendiente | loot filter + overflow + lectura de poder |
| RS-05 | Riesgo tecnico | La arquitectura puede no soportar la siguiente ola de crecimiento. | critico | critico | pendiente | bundle mas chico + menos rerender + modularizacion |

---

## 3. Roadmap de Implementacion en 3 Horizontes

### Esta semana

- `SY-02` Surface fuerte para overflow de inventario.
- `UX-03` Compactacion de `Santuario` arriba del fold.
- `UX-06` Feedback compartido para claims y acciones silenciosas.
- `EV-06` `Session Arc` visible usando los goals actuales.
- `EV-07` Loot filter basico sobre `lootRules`.
- `SY-08` Seed post-onboarding para balance batch y QA automatizado.
- `PF-01` / `PF-03` / `PF-04` primer pase: chunk critico, rerender global y timer de `Combat`.

### Este mes

- `EV-05` mover `reroll` a `Deep Forge`.
- `UX-02` resolver arquitectura definitiva de `Forja`.
- `MR-02` `Weekly Ledger` bancado con catch-up.
- `MR-03` vista unificada de progreso de cuenta.
- `MR-04` resumen claro de `Prestige`.
- `MR-05` surfacing fuerte de `Sigils`.
- `EC-05` retune de `polish / reforge / ascend`.
- `EC-08` lectura build-aware de items y crafts.
- `UX-05` `OverlayShell` comun.
- `PF-05` separar `persistedState` de runtime.

### Proximo trimestre

- `PF-10` modularizar `gameReducer` y `onboarding` por dominio.
- `RS-05` reducir fragilidad estructural antes de la proxima expansion grande.
- `MR-10` evaluar `Season Ledger` largo solo despues del weekly.
- `MR-07` preparar schema neutral de `stash / inventoryContainers`.
- `MR-08` preparar `AppearanceProfile / ProfileCard`.
- `SY-03` decidir definitivamente `Blueprint permanence vs vigencia`.
- `PF-11` paginacion/section gating para `Codex` y `Stats`.
- `EC-01` darle rol tardio a `gold`.

---

## 4. Prompts para Otros Colaboradores

### Prompt 1: Compactacion de Santuario

```md
Contexto:
Estamos trabajando sobre `/home/gmendoza/coding/idlerpg`.
El loop central del juego es `Santuario -> Expedicion -> Extraccion -> Santuario`.
Hoy `src/components/Sanctuary.jsx` es el principal cuello de claridad: demasiadas cards arriba del fold, demasiada operativa visible al mismo tiempo, y demasiado scroll para acciones frecuentes.

Objetivo:
Hacer un pass de UI/UX sobre `Santuario` para que arriba del fold vivan solo:
- `Listo ahora`
- `En curso`
- `Siguiente salida`

Requisitos:
- No romper onboarding ni spotlight targets existentes.
- No cambiar logica de jobs o rewards.
- Mantener las estaciones, pero como segunda capa mas compacta y opt-in.
- Mobile y desktop deben comportarse consistente.
- Priorizar menos texto, menos scroll, mejor jerarquia visual.

Archivos base:
- `src/components/Sanctuary.jsx`
- `src/App.jsx`
- overlays del Santuario si hiciera falta ajustar shell visual

Entrega esperada:
- propuesta implementada en codigo
- breve resumen de decisiones visuales
- riesgos o tradeoffs detectados
```

### Prompt 2: OverlayShell + Politica de Overlays

```md
Contexto:
La app mezcla overlays con comportamientos distintos respecto de header, bottom nav y safe area mobile.
Necesitamos unificar la politica para overlays blandos vs hard-lock.

Objetivo:
Crear un `OverlayShell` reutilizable y migrar primero las overlays del Santuario para que compartan estructura, safe areas y comportamiento de cierre.

Requisitos:
- Dos modos: `soft` y `hard-lock`
- `soft` respeta header/nav y se siente parte de la app
- `hard-lock` cubre todo a proposito para `Extraccion` o pasos de tutorial forzado
- No romper mobile
- No cambiar logica de negocio interna de cada overlay

Archivos base:
- `src/App.jsx`
- `src/components/OnboardingOverlay.jsx`
- `src/components/ExtractionOverlay.jsx`
- overlays del Santuario

Entrega esperada:
- componente shell reutilizable
- migracion inicial de overlays prioritarias
- nota corta de que overlays deberian quedar `soft` y cuales `hard-lock`
```

### Prompt 3: Registro / Mas mas compacto

```md
Contexto:
`src/components/RegistryView.jsx` sigue redundante: cards de subviews, luego metricas, luego botones, luego explicacion.
Necesitamos que `Mas` sea utilitario, no protagonista.

Objetivo:
Dejar `Mas` con un solo selector limpio `Logros / Metricas / Sistema` y una franja de contexto unica arriba.

Requisitos:
- No tocar logica de `Achievements` ni `Stats`
- No romper deep links via `SET_TAB`
- Mantener tono sobrio y liviano
- Reducir texto explicativo redundante

Archivos base:
- `src/components/RegistryView.jsx`
- `src/components/Achievements.jsx`
- `src/components/Stats.jsx`

Entrega esperada:
- UI mas compacta y consistente
- resumen corto de lo removido o fusionado
```

### Prompt 4: Session Arc visible en Expedicion

```md
Contexto:
Los goals actuales ya existen en `src/data/activeGoals.js` y `src/engine/progression/goalEngine.js`, pero hoy se muestran mas como tip rotatorio que como direccion de sesion.

Objetivo:
Rediseñar la surface de `Session Arc` en `Expedicion` para mostrar:
- 1 objetivo principal
- 2 secundarios
- progreso visible
- claim claro cuando corresponda

Requisitos:
- No inventar nuevos goals todavia
- Reutilizar el sistema actual
- Debe servir tanto para sesiones de 5m como de 20m
- Mantener lectura limpia en mobile

Archivos base:
- `src/components/combat/CombatGuidanceStrip.jsx`
- `src/components/Combat.jsx`
- `src/engine/progression/goalEngine.js`
- `src/data/activeGoals.js`

Entrega esperada:
- nueva UI de `Session Arc`
- justificacion breve de jerarquia y micro-copy
```

---

## 5. Las 5 Cosas que No Tocaria

1. `Extraccion` como pico central de decision. Es de lo mejor encaminado del juego y no conviene diluirla con burocracia ni simplificarla de mas.
2. `Run Sigils` como variedad real de prestigio. Ya hacen distinto el segundo prestige y tienen futuro con el segundo slot de `Abismo IV`.
3. El enfoque `data-driven` de catalogos (`goals`, `sigils`, `abyss unlocks`, `item families`, partes de jobs). Es una base buena y hay que protegerla.
4. El endurecimiento tecnico de `Tarea 1` sobre save, cierre/ocultado y snapshot de QA. Eso ya agrega mucho valor practico.
5. La idea de `Blueprints` como progreso persistente valioso. Puede necesitar vigencia o surfacing mejor, pero no conviene destruir esa fantasia por reflejo.

---

## 6. Decisiones que Requieren al Dueno del Proyecto

### 1. Contrato largo de `Blueprints`

- Opcion A: permanentes por diseno.
- Opcion B: vigencia suave no destructiva.
- Opcion C: aging real con obsolescencia.
- Recomendacion: `B`. Mantener permanencia emocional y agregar, si hiciera falta, un indicador suave antes que degradacion real.

### 2. Ownership final de `Crafting`

- Opcion A: seguir repartido entre run y hub.
- Opcion B: run tactica / `Deep Forge` pesado.
- Opcion C: casi todo en hub.
- Recomendacion: `B`. La run necesita tension tactica; el hub necesita ownership claro del craft pesado.

### 3. Arquitectura visible de `Forja`

- Opcion A: subtab visible.
- Opcion B: CTA contextual desde `Mochila`.
- Opcion C: overlay/drawer contextual.
- Recomendacion: `C` o `B`, pero una sola verdad. No mantendria subview oculta y CTA contextual a la vez.

### 4. Pacing del primer `Prestige`

- Opcion A: mantenerlo muy generoso.
- Opcion B: endurecerlo un poco.
- Opcion C: endurecerlo bastante.
- Recomendacion: `B`. Mantener accesibilidad, pero exigir algo mas de profundidad real.

### 5. Capa de retorno `diario/semanal`

- Opcion A: dailies/streaks.
- Opcion B: weekly bancado con catch-up.
- Opcion C: nada nuevo.
- Recomendacion: `B`. Es el minimo sistema correcto para este juego.

### 6. Politica de tick ante lag visible

- Opcion A: slowdown aceptado.
- Opcion B: catch-up agresivo.
- Opcion C: catch-up acotado solo para stalls relevantes.
- Recomendacion: `C`. Mas consistente que el slowdown puro y menos riesgoso que un catch-up total.

### 7. Momento para `stash schema`

- Opcion A: ya.
- Opcion B: despues de limpiar loop y UX base.
- Opcion C: mucho mas tarde.
- Recomendacion: `B`. Conviene preparar el seam, pero no antes del cleanup principal.

### 8. Momento para `AppearanceProfile`

- Opcion A: ya.
- Opcion B: despues de serializar mejor la cuenta.
- Opcion C: no hace falta.
- Recomendacion: `B`. Primero cuenta visible; despues identidad visual persistente.

### 9. Season layer

- Opcion A: `Season Ledger` largo en cuanto exista `Weekly Ledger`.
- Opcion B: esperar a que el weekly funcione bien.
- Opcion C: no hacer temporada.
- Recomendacion: `B`. No meter capa larga antes de demostrar que la cuenta ya se lee mejor.

### 10. Economia tardia de `gold`

- Opcion A: dejarla como esta.
- Opcion B: sinks tardios en `Deep Forge` y hub.
- Opcion C: otra currency universal.
- Recomendacion: `B`. No agregaria otra moneda universal para tapar este problema.

---

## 7. Top 5 Oportunidades de Diseno

1. `Santuario compacto` como consola operativa. Es la mejora de mayor retorno UX sin agrandar el juego.
2. `Session Arc + Weekly Ledger`. Reutiliza sistemas existentes y mejora mucho la lectura de sesion y cuenta.
3. `Deep Forge` como hogar del craft pesado. Ordena producto, economia y fantasia en un solo movimiento.
4. `Loot filter + lectura build-aware`. Reduce ruido y hace que el chase vuelva a sentirse intencional.
5. `Prestige` y `Sigils` mas ceremoniales. Hay mucho valor ya presente que hoy esta subexpuesto.

---

## 8. Top 5 Riesgos Estructurales

1. `RS-01` El juego derive en `hub administrativo` y pierda su fantasia de extraccion.
2. `RS-02` El crafting se vuelva una sopa de operaciones sin ownership claro.
3. `RS-03` La progresion larga se sienta fragmentada y no como una cuenta que crece.
4. `RS-04` El reward loop se degrade a ruido, overflow y clasificacion de basura.
5. `RS-05` La arquitectura no soporte la siguiente ola de crecimiento sin bajar calidad y velocidad.

---

## 9. Vision del Juego a 1 Ano

Dentro de `1 ano`, este juego deberia sentirse como un `extraction-lite idle ARPG` con combate automatico, decisiones de riesgo/recompensa reales y una cuenta persistente mucho mas legible que hoy.

No deberia sentirse como:
- un simulador de timers
- un idle que farmea solo
- una mezcla de sistemas copiados sin ownership

Deberia sentirse como:
- `preparo una salida`
- `empujo una expedicion`
- `decido que rescato y cuando cierro`
- `vuelvo al Santuario con valor real`
- `hago crecer una cuenta que se siente cada vez mas mia`

### Como se deberia ver

- `Santuario` como consola operativa compacta.
- `Expedicion` mas tensa, mas clara y mas orientada a decision.
- `Extraccion` intacta como ritual fuerte de cierre.
- `Mas` utilitario y casi invisible.
- `Ecos` y `Codex` mas ceremoniales y menos spreadsheet.

### Que sistemas deberia tener

- `Santuario compacto`
- `Deep Forge` fuerte
- `Loot filter` simple pero real
- `Session Arc`
- `Weekly Ledger`
- `Vista unificada de progreso de cuenta`
- `Collection / Mastery shelf`
- `Prestige` claro
- `Sigils` mas legibles

### Que sistemas no deberian ser el norte

- `energy/resin`
- `dailies` compulsivos
- `premium rush`
- `offer engine`
- mas currencies sin decision nueva
- mas crafting solo para inflar complejidad

### Que retencion deberia lograr

- `5m`: una micro-sesion valida y satisfactoria.
- `20m`: una sesion completa de empuje, loot, tension y cierre.
- `1 dia`: retorno amable sin castigo de login.
- `1 semana`: metas visibles de cuenta y sesion.
- `1-3 meses`: progreso transversal, mastery y chase claros.
- `6 meses+`: solo si la cuenta ya se serializa bien y no depende de ansiedad artificial.

### Identidad diferencial

La mejor version de este proyecto no gana por cantidad de sistemas.
Gana por esta mezcla:

- combate automatico que aun exige lectura
- `Extraccion` como centro de decision
- `Santuario` persistente que procesa valor sin tragarse la fantasia
- `Prestige` que cambia la intencion de la siguiente run
- UX mas limpia y menos gritona que muchos idle/F2P

En una frase:

`un ARPG idle de extraccion, con cuenta persistente fuerte, donde las mejores decisiones no son spamear clicks sino saber empujar, saber cerrar y saber convertir lo rescatado en progreso real`
