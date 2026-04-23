# Auditoria Entregables

Este archivo consolida los entregables ya emitidos en la auditoria maestra y los deja en un formato util para implementacion futura.

## Convenciones

- `Estado`: `hecho`, `pendiente`, `en_progreso`, `descartado`
- `Prioridad`: `critico`, `quick_win`, `nice_to_have`
- `Proceder`: `si`, `no`, `duda`
- `Slice sugerido`: siguiente unidad chica de implementacion razonable

---

## Fase 0 - Modelado del Juego

### Core loop real

El loop real emergente del juego hoy es:

`Santuario -> Expedicion -> Extraccion -> Santuario`

Con un matiz importante: `Extraccion` no solo cierra la run, tambien es la compuerta de conversion a `Prestige / Ecos` cuando la salida ya rinde valor meta.

Secuencia real observada:

1. Preparas o reanudas expedicion.
2. El tick de combate sigue corriendo aunque no estes mirando `Combat`.
3. Empujas tiers, obtienes drops y ajustas equipo/build.
4. Decides si retirarte o seguir empujando.
5. Confirmas extraccion y eso devuelve `cargo`, a veces una pieza persistible, y eventualmente activa conversion a `Ecos`.
6. Vuelves a `Santuario` para procesar valor persistente, correr jobs y preparar la siguiente salida.

### Sub-loops principales

- `Combate automatico -> drop -> evaluacion de upgrade -> push de tier`
- `Gear loop`: equipar, vender, extraer, abrir `Forja` desde `Mochila`
- `Extraccion`: elegir cargo, eventualmente rescatar pieza, decidir si asegurar retorno o seguir
- `Santuario persistente`: `Destileria`, `Biblioteca`, `Encargos`, `Altar`, `Taller`, `Laboratorio`
- `Meta loop`: `Prestige -> Ecos -> resonancia + arbol -> nueva run`

### Recursos y flujos

| Recurso | Entra por | Sale por | Riesgo actual |
|--------|-----------|----------|---------------|
| Gold | combate, venta | atributos, crafting | saturacion si el gasto no escala |
| XP | combate | sube nivel | no tiene friccion propia |
| Essence | combate | crafting, progreso largo | stock sin uso si crafting no tracciona |
| Items | loot | equip, venta, craft, extraccion | exceso de gestion si la UI no resume |
| Cargo | extraccion | destileria / procesamiento | acumulacion si no se destila |
| codexInk | destileria / errands | biblioteca | stock muerto si biblioteca no se visita |
| sigilFlux | destileria | altar de sigilos | stock muerto si altar queda escondido |
| relicDust | destileria / loops persistentes | progresion persistente | poco legible si no se explica uso |
| Echoes | prestige / extraccion | arbol meta | decision importante, pero sensible a pacing |
| Blueprints / charges | taller / rescate | proyectos y progreso largo | complejidad conceptual alta |

### Decisiones reales del jugador

#### Significativas

- Cuando extraer
- Cuando seguir empujando
- Que pieza equipar o craftear
- Donde gastar oro
- Que nodo de talento comprar
- Que nodo de Ecos comprar
- Que job del Santuario arrancar
- Que sigilo preparar
- `Blueprint` vs `scrap`

#### Ilusorias

- Upgrades demasiado obvios
- Reclamar claims cuando no hay costo de oportunidad real
- Navegar a una vista solo para confirmar un estado ya evidente

#### Rutinarias sin valor

- Reclamar jobs
- Relanzar timers
- Abrir vistas para verificar disponibilidad operativa

### Momentos de dopamina

- Drop raro / legendary
- Level up
- Kill de boss
- Primer unlock de subtab o estacion
- Extraccion confirmada
- Primer prestige
- Compra de nodo de Ecos
- Craft que mejora una pieza real

### Momentos de friccion

- Densidad de sistemas despues del early game
- Mucha lectura operativa en `Santuario`
- Combate automatico que puede degradarse en pasividad
- Navegacion extra para claims o chequeos de estado

### Dead zones

- Tramos donde la run ya no pide decision pero tampoco cierra con tension
- Esperas entre timers de Santuario sin decision relevante
- Mid game donde se destraban mas sistemas persistentes antes de devolver valor legible

### Riesgos de abandono

- Early: combate demasiado automatico antes de que `Extraccion` y `Santuario` demuestren valor
- Mid: saturacion de capas persistentes y sensacion de mantenimiento
- Late: loop degradado a tramite de cuenta, sin tension elegida

### Mapa preliminar de tensiones

- `Seguir empujando tier` vs `asegurar retorno`
- Riesgo de muerte vs valor de seguir
- Conversion de run a valor persistente
- Tension entre progreso inmediato y preparacion de la siguiente run

### Conclusiones de Fase 0

- La tesis central si existe y el codigo la soporta.
- El valor mas fuerte del proyecto hoy no esta en el DPS loop aislado sino en como la run se convierte en progreso fuera de la run.
- El mayor riesgo sistmico es que la capa persistente crezca mas rapido que la calidad de las decisiones.

### Top 3 prioridades de Fase 0

1. Blindar integridad tecnica entre `tick`, `tabs`, `extraccion` y `onboarding`.
2. Auditar si `Extraccion` mantiene costo de oportunidad real.
3. Auditar si `Santuario` agrega profundidad o solo mantenimiento.

---

## Tarea 1 - Integridad Tecnica y Estabilidad

### System Impact Note

Esta pasada toco `useGame`, `storage` y una capa de debug en `App`. Mejora persistencia al ocultar/cerrar la app, evita crashes por `localStorage` inaccesible y da tooling real para testers. El trade-off es menor: una proyeccion extra del reducer en eventos de persistencia critica y un wrapper global de `console.error` para capturar errores recientes.

### Findings

| ID | Categoria | Ubicacion | Problema | Causa raiz | Solucion | Impacto retencion | Complejidad | Riesgo | Prioridad | Proceder | Estado | Slice sugerido |
|----|-----------|-----------|----------|------------|----------|-------------------|-------------|--------|-----------|----------|--------|----------------|
| ST-01 | Estabilidad | `src/hooks/useGame.js` | Al ocultar/cerrar la app se podia guardar el estado previo y perder los ultimos segundos de sesion. | `dispatch` asincrono seguido de `saveGame(...)`, mas el guard de `document.hidden`. | Proyectar el siguiente estado con `gameReducer(...)` antes de persistir y habilitar flush explicito en `hidden/pagehide/beforeunload`. | medio | media | bajo | critico | si | hecho | ya implementado |
| ST-02 | Estabilidad | `src/utils/storage.js` | `save/load/import/clear` podian fallar duro si `localStorage` estaba bloqueado o inaccesible. | Acceso directo sin `try/catch`. | Wrapper seguro de storage, retornos booleanos y mensajes de fallo consistentes. | medio | baja | bajo | quick_win | si | hecho | ya implementado |
| ST-03 | Arquitectura | `src/hooks/useGame.js`, `src/utils/testerSnapshot.js`, `src/App.jsx` | No existia snapshot rapido de QA con contexto suficiente para reproducir bugs reales. | Telemetria fragmentada entre `replay`, `stats` y consola. | Triple-click oculto en header que copia JSON con estado total, acciones recientes, errores recientes y metadata. | alto | media | bajo | quick_win | si | hecho | ya implementado |
| ST-04 | Estabilidad | `src/App.jsx` | Los errores recientes no quedaban accesibles para testers en el momento del fallo. | Solo se logueaban en consola o en boundaries aislados. | Captura efimera de `window.error`, `unhandledrejection` y `console.error`, integrada al snapshot. | medio | baja | bajo | quick_win | si | hecho | ya implementado |
| ST-05 | Onboarding | `src/hooks/useGame.js`, `src/engine/onboarding/onboardingEngine.js` | Los jobs del Santuario seguian sincronizando durante onboarding aunque el tutorial bloquea casi todo lo demas. | `SYNC_SANCTUARY_JOBS` estaba permitido de forma demasiado amplia. | Gate por allowlist de pasos que necesitan sync real del Santuario. | medio | media | medio | critico | si | hecho | ya implementado |

### Estado de implementacion de Tarea 1

- `ST-01`: implementado
- `ST-02`: implementado
- `ST-03`: implementado
- `ST-04`: implementado
- `ST-05`: implementado

### Verificacion hecha

- `npm run build` OK tras los cambios de Tarea 1

### Resumen de hallazgos

La base tecnica esta mejor de lo que parecia. El tick de combate ya es global y no depende de que `Combat` este montado. El `stateInitializer` ya sanea bastante saves incompletos o corruptos. Lo mas flojo era el borde entre `dispatch`, persistencia y cierre/ocultado de la app. Eso ya quedo endurecido.

### Top 3 prioridades post-Tarea 1

1. Hacer playthrough corto de estres con cambio de tabs, ocultado y reapertura.
2. Usar el snapshot oculto para cualquier bug de onboarding tardio.
3. Entrar al modulo UX con la capa tecnica ya estabilizada.

### Riesgos de implementacion residuales

- Congelar mal `SYNC_SANCTUARY_JOBS` podria romper el corredor de tutorial de `Destileria`.
- El wrapper de `console.error` puede duplicar algunos eventos; aceptable para QA.
- La proyeccion previa al save agrega una ejecucion extra del reducer en bordes criticos.

---

## Tarea 2 - UX Audit Integral

### System Impact Note

Estas mejoras tocan `src/App.jsx`, `src/components/Sanctuary.jsx`, `src/components/ExpeditionView.jsx`, `src/components/Inventory.jsx`, `src/components/RegistryView.jsx` y la familia de overlays. Mejoran claridad, uso mobile y velocidad de lectura, pero el trade-off es real: si se compacta sin criterio se puede matar onboarding util, romper deep-links internos o esconder decisiones importantes detras de demasiada compresion.

### Findings

| ID | Categoria | Ubicacion | Problema | Causa raiz | Solucion | Impacto retencion | Complejidad | Riesgo | Referente | Prioridad | Proceder | Estado | Slice sugerido |
|----|-----------|-----------|----------|------------|----------|-------------------|-------------|--------|-----------|-----------|----------|--------|----------------|
| UX-01 | Redundancia | `src/components/RegistryView.jsx` | `Mas` repite la misma navegacion como cards, luego metricas, luego botones, luego texto aclaratorio. | Wayfinding agregado por capas sin poda. | Dejar un solo selector semantico `Logros / Metricas / Sistema` y una sola franja de contexto arriba. | medio | bajo | bajo | Genshin / Melvor | quick_win | si | pendiente | compactar `RegistryView` en un unico selector y suprimir duplicados |
| UX-02 | Arquitectura | `src/components/ExpeditionView.jsx`, `src/components/Inventory.jsx` | `Forja` es una subview real pero invisible en la subnav; solo aparece como CTA contextual desde Mochila. | La feature se demoto visualmente, pero no se simplifico la arquitectura. | Elegir una sola verdad: o subtab visible cuando desbloquea, o drawer/modal contextual desde item detail. No ambas. | alto | medio | medio | Warframe / Diablo 4 | critico | si | pendiente | decidir arquitectura de `Forja` antes de tocar UI puntual |
| UX-03 | UX | `src/components/Sanctuary.jsx` | `Santuario` sigue demasiado denso arriba del fold: resumen, recursos, helper, next step, `Listo`, `Corriendo`, `Bloqueado`, overview de estaciones y luego detalle. | Cada necesidad operativa se resolvio con otra card. | Reducir a un header operativo con `Listo ahora`, `En curso` y `Siguiente salida`; estaciones y detalle como segundo nivel opt-in. | alto | medio | bajo | Warframe / Diablo Immortal | critico | si | pendiente | compactacion de `Santuario` en 1 pasada enfocada en above-the-fold |
| UX-04 | UX | `src/App.jsx`, `src/components/ExpeditionView.jsx`, `src/components/Sanctuary.jsx` | Las acciones frecuentes siguen altas en pantalla: claims, abrir estacion, cambiar subview de expedicion, siguiente paso. | El layout es `card-first` y no `thumb-first`. | Crear `ContextTray` mobile por tab, encima de la bottom nav, para acciones repetidas de sesion. | alto | medio | medio | Genshin / Diablo Immortal | critico | si | pendiente | prototipo de `ContextTray` solo para `Santuario` y `Expedicion` |
| UX-05 | UX | `src/App.jsx`, overlays, `src/components/OnboardingOverlay.jsx` | Header y bottom nav no estan siempre accesibles: algunas overlays respetan safe area mobile y otras tapan toda la app. | Cada overlay definio su propia politica. | Unificar en `OverlayShell` con 2 modos: `soft` respeta header/nav, `hard-lock` los tapa a proposito. | medio | medio | bajo | Warframe / Genshin | quick_win | si | pendiente | crear shell comun y migrar primero overlays de Santuario |
| UX-06 | Feedback | `src/components/Crafting.jsx`, `src/state/gameReducer.js` | `Crafting` si da feedback inmediato; muchos claims y acciones de Santuario solo desaparecen de la lista y escriben en `log`. | No hay bus de feedback compartido; el reducer quedo como salida universal. | Toasts no modales + micro-pulses inline para claim, unlock y error; dejar el `log` como capa secundaria. | alto | medio | bajo | Last Epoch / Melvor | quick_win | si | pendiente | feedback compartido para `CLAIM_SANCTUARY_JOB` |
| UX-07 | Consistencia | `src/App.jsx` y multiples componentes | Hay tokens de tema, pero tambien mucha fragmentacion: muchisimo inline style, helpers repetidos y focus inconsistente. | No existe una capa atomica compartida. | Extraer 5-6 primitives: `SurfaceCard`, `MetricTile`, `PrimaryAction`, `StatusChip`, `SegmentedNav`, `OverlayShell`. | medio | medio | medio | N/A | quick_win | si | pendiente | extraer primitives solo en zonas ya retocadas, no refactor global |
| UX-08 | UX | `src/components/Inventory.jsx`, `src/components/RegistryView.jsx` | No hay patron real de long-press para ayuda; hay `title=` y taps completos sobre cards/botones. En mobile eso es fragil. | Semantica de desktop llevada a mobile. | Long-press para hints, tap corto para accion, confirmacion solo en acciones irreversibles. | medio | bajo | bajo | Warframe / Diablo 4 | quick_win | si | pendiente | reemplazar `title=` de superficies mobile por hint accesible |

### Thumb zone propuesto

#### Santuario

- Bandeja inferior con: `Reclamar`, `Estacion prioritaria`, `Laboratorio`, `Expedicion`

#### Expedicion

- Subnav local pegada abajo con: `Combate`, `Mochila`, `Intel`, `Extraer` cuando aplique

#### Heroe

- Sin tray permanente
- CTA inferior solo cuando haya `TP` o mejora gastable real

#### Ecos

- CTA inferior contextual `Comprar nodo` cuando hay nodo seleccionado
- Filtros de rama arriba

#### Mas

- Sin tray
- Solo selector compacto arriba

### Gap emocional detectado

| Pantalla | Deberia sentirse como | Hoy se siente como | Gap |
|----------|------------------------|--------------------|-----|
| Santuario | alivio y control | tablero administrativo | alto |
| Expedicion | tension legible | correcto, pero con navegacion secundaria lejana | medio |
| Extraccion | alivio con riesgo | una de las pantallas mejor encaminadas | bajo |
| Ecos | mastery ceremonial | mas spreadsheet que rito | medio |
| Mas | invisible/utilitario | autoexplicado en exceso | medio |

### Friccion clasificada

#### Friccion util

- Elegir extraccion
- Decidir `blueprint vs scrap`
- Preparar reforge

#### Friccion neutra

- Cambiar subviews del heroe
- Expandir secciones del Codex

#### Friccion danina

- Claims escaneados en varios lugares
- `Forja` escondida pero enrutable
- Acciones frecuentes muy arriba en mobile
- Ayuda basada en `title=`

### Sistema atomico sugerido

- `SurfaceCard`
- `MetricTile`
- `StatusChip`
- `PrimaryAction`
- `SegmentedNav`
- `OverlayShell`

### Resumen de hallazgos

La UX no esta rota; esta sobre-acumulada. El mayor problema no es falta de features, sino exceso de capas para decir cosas parecidas. `Santuario` sigue siendo el principal cuello de botella de claridad, `Mas` todavia tiene redundancia literal y `Forja` quedo en una arquitectura hibrida que hoy funciona pero es conceptualmente opaca.

### Top 3 prioridades de implementacion

1. Compactar `Santuario` alrededor de una sola banda operativa.
2. Resolver la arquitectura de `Forja` para que deje de ser una subview oculta.
3. Mover acciones frecuentes al tercio inferior en mobile y unificar politica de overlays.

### Riesgos de implementacion

- Compactar demasiado pronto puede esconder señales utiles del onboarding tardio.
- Unificar overlays sin separar `soft` de `hard-lock` puede degradar `Extraccion` o `Tutorial`.
- Extraer primitives de UI a lo grande seria overengineering; conviene empezar por `Santuario`, `Mas` y overlays.

### Referentes usados en Tarea 2

- `Genshin Impact review - Android Central`
- `Diablo Immortal review - Tom's Guide`
- `Torchlight: Infinite review - Pocket Gamer`
- `Torchlight Infinite UI complaints - Reddit`
- `Warframe Foundry UI problems and suggestions - Forums`
- `Diablo 4 inventory problem - PC Gamer`
- `Melvor Idle offline progression - Official wiki`
- `Last Epoch crafting guide - Icy Veins`

Nota: parte de las comparaciones son inferencias de patron de uso y no citas textuales.

---

## Tarea 3 - Auditoria de Sistemas de Juego

### System Impact Note

Esta pasada no toca codigo productivo, pero si redefine que conviene tratar como bug, como deuda de producto y como decision de diseno pendiente. Toca `combat tick`, `loot`, `crafting`, `talentos`, `prestige`, `blueprints`, `extraccion` y el tooling interno de simulacion. El mayor riesgo al implementar desde aca es mezclar tres clases de problemas distintas: errores reales, contratos del sistema no explicitados y features que en realidad todavia no existen.

### Findings

| ID | Categoria | Ubicacion | Problema | Causa raiz | Solucion | Impacto retencion | Complejidad | Riesgo | Referente | Prioridad | Proceder | Estado | Slice sugerido |
|----|-----------|-----------|----------|------------|----------|-------------------|-------------|--------|-----------|-----------|----------|--------|----------------|
| SY-01 | Crafting contract | `src/engine/crafting/craftingEngine.js`, `src/state/gameReducer.js`, `src/components/Crafting.jsx` | No existe `Forging Potential` y tampoco existen operaciones `fuse` o `corrupt`; el sistema real hoy es `upgrade / reroll / polish / reforge / ascend / extract` con limites por accion. | La fantasia mental del sistema crecio mas rapido que la implementacion real. | O explicitar este contrato actual en UI/copy, o disenar despues una capa de durabilidad de item solo para piezas de chase. | alto | media | medio | Last Epoch / PoE | critico | si | pendiente | documentar contrato actual de `Crafting` y decidir si `FP-like` entra o no en roadmap |
| SY-02 | Loot UX | `src/engine/inventory/inventoryEngine.js`, `src/engine/combat/processTickRuntime.js` | El cap de inventario descarta items por overflow y el aviso queda casi solo en el `combat log`. | `addToInventory(...)` trunca la cola y la unica superficie fuerte es texto embebido en log de combate. | Toast visible de overflow + contador de descartes + opcion futura de auto-regla o overflow tray. | alto | baja | bajo | Diablo 4 / Path of Exile | critico | si | pendiente | surface de overflow al momento del drop, no solo en log |
| SY-03 | Blueprint progression | `src/engine/sanctuary/blueprintEngine.js` | `Blueprint Aging` no esta implementado. Los blueprints no envejecen contra el tier actual del jugador; viven con su propio `effectiveItemTier`. | El sistema de blueprint se diseno como progresion persistente, pero nunca recibio una regla de obsolescencia. | Decidir explicitamente si los blueprints son permanentes por diseno o si deben envejecer por tier/hito. | medio | media | medio | Warframe / Last Epoch | critico | si | pendiente | decision de producto: permanencia total vs formula de obsolescencia |
| SY-04 | Talents migration | `src/engine/migrations/talentsV2Migration.js` | La migracion `talentSystemVersion < 6` no preserva build: limpia talentos y devuelve puntos. | Se eligio una migracion segura por refund, no una migracion fiel. | Si todavia existen saves legacy, agregar mensaje/telemetria o una migracion de preservacion. | medio | media | medio | N/A | quick_win | si | pendiente | validar si quedan usuarios legacy y, si si, cubrir comunicacion o migracion mejor |
| SY-05 | Prestige pacing | `src/engine/progression/prestigeEngine.js`, `src/state/gameReducer.js`, `src/engine/sanctuary/extractionEngine.js` | El gate de `Prestige` es bastante laxo (`Tier OR boss OR level`) y el primer piso de `2 ecos` favorece loops cortos si el jugador optimiza demasiado temprano. | Se priorizo accesibilidad y primer spike meta, con poco peso de profundidad real de la run. | Revisar si queres mantener ese pacing o empujar mas peso a `maxTier / bosses / extraccion profunda`. | alto | media | medio | N/A | critico | si | pendiente | corrida de tuning sobre `readiness` y primer `echo floor` |
| SY-06 | Loot math | `src/utils/loot.js`, `src/engine/affixesEngine.js`, `src/engine/progression/rewards.js` | El loot esta bien cableado, pero la curva de rareza es aditiva y puede comprimir distribucion alta; ademas el sistema de affixes evita crashes, aunque puede dejar items con menos lineas si el pool se agota por restricciones. | Probabilidades acumulativas simples + reglas anti-duplicado bastante estrictas. | Antes de rebalancear, sumar telemetria/fuzz tests de distribucion y casos de pool agotado. | medio | media | bajo | Last Epoch / Path of Exile | quick_win | si | pendiente | script de sampling para `rarity roll` y `affix fill rate` por tier |
| SY-07 | Decision density | `src/engine/sanctuary/jobEngine.js`, `src/components/Sanctuary.jsx`, `src/engine/sanctuary/extractionEngine.js` | `Extraccion` concentra las mejores decisiones; muchos jobs del `Santuario` derivan en mantenimiento operativo y poco costo de oportunidad. | Varias estaciones usan timers y claims, pero no todas devuelven una eleccion fuerte. | Quitar friccion falsa con batch claim/restart y reservar tension para `extraccion`, `crafting` y elecciones persistentes reales. | alto | media | bajo | Warframe / Melvor Idle | critico | si | pendiente | compactar operaciones de bajo riesgo y reforzar solo las decisiones de alto valor |
| SY-08 | Tooling / stress test | `scripts/run-balance-batch.mjs`, `src/engine/simulation/balanceBatchRunner.js` | El harness de simulacion desde `createFreshState()` no rompe early game: queda clavado en `L1 / T1` porque el onboarding bloquea progreso significativo. | El batch corre sobre estado fresco y no seedea un perfil post-tutorial. | Crear una seed de simulacion post-onboarding para balance batch y QA automatizado real. | medio | baja | bajo | N/A | quick_win | si | pendiente | `createPostOnboardingSimulationState()` o fixture equivalente |

### Cobertura por sistema

#### 3.1 Combat tick

- El tick corre de forma global y no depende de que `Combat` este montado.
- Si el jugador esta en `Inventario` o `Crafting`, la corrida sigue viva igual mientras la expedicion este activa.
- No encontre una ruta obvia de doble tick en el mismo frame: hay un solo intervalo live y el offline job bloquea el tick normal mientras se resuelve.
- El offline usa la misma familia de reducer (`BULK_TICK`) y por eso mantiene paridad de reglas con el online.
- Aclaracion importante: esa paridad no significa determinismo semilla-a-semilla, porque el runtime sigue usando `Math.random()`.

#### 3.2 Loot

- `Luck` afecta tanto `dropChance` como `rollRarity`.
- Los drops de `gold / xp / essence` no compiten con el drop de item; viven en pipelines separados.
- El sesgo de boss hunt si existe, pero no como tabla `BOSS_LOOT_THEMES`: vive en `favoredFamilies`, `favoredStats` y `huntSources`.
- El sistema anti-duplicado de affixes esta bien defendido y no vi crash por pool vacio.
- El problema real no es un bug de drop, sino la perdida poco visible por inventario lleno.

#### 3.3 Crafting

- Todas las operaciones hoy existentes si tienen su caso en reducer: `reroll`, `polish`, `reforge`, `upgrade`, `ascend`, `extract`.
- `fuse` y `corrupt` no estan rotas: simplemente no existen en el sistema actual.
- `rebuildItem(...)` recalcula correctamente bonus, implicits, upgrade bonus y rating despues de cada operacion.
- `Reforge` es un sistema de dos pasos con costo pagado en el preview; no es bug, pero si es una decision fuerte que requiere comunicacion clara.
- No hay problema de inventario lleno al craftear porque casi todas las operaciones mutan la pieza en sitio.

#### 3.4 Talent tree

- Los prerequisitos de nodo, gasto por arbol y gasto por segmento estan correctamente defendidos.
- No encontre nodos fantasma: los `stat` declarados por talentos si son leidos por runtime.
- No encontre nodos infinitos reales en el arbol actual; hoy todo es finito o acotado por `levels / maxLevel`.
- El reset del arbol devuelve puntos en linea con `getTalentCostForPlayer(...)`.
- El punto delicado no es el runtime del arbol, sino la migracion legacy que resetea build.

#### 3.5 Prestige

- `canPrestige(...)`, `calculatePrestigeEchoGain(...)` y el reset de prestige estan alineados; no vi una ruta obvia para entrar con estado invalido.
- La extraccion vuelve a chequear `canPrestige(state)` al confirmar, asi que no depende ciegamente de un preview viejo.
- Los `run sigils` si se aplican al iniciar la run mediante `START_RUN`.
- Los bonos del arbol de reliquias si se resincronizan al comprar nodo y tambien despues del reset de prestige.
- La discusion aca no es de integridad sino de pacing: hoy el sistema es generoso para que el primer spike meta llegue rapido.

#### 3.6 Blueprints y materiales

- La materializacion de blueprint parece determinista: usa seed estable via `buildBlueprintSeedPayload(...)`.
- Las `family charges` si sesgan la materializacion mediante `buildBlueprintStatWeights(...)`.
- Los jobs persistentes de Santuario/Foundry no dependen del componente montado; usan `startedAt / endsAt` y sync por tiempo.
- No encontre evidencia de stats imposibles o fuera de rango; la materializacion reaprovecha el pipeline normal de affixes.
- Lo que no encontre, directamente, es `Blueprint Aging`.

### Decision density del gameplay

| Sistema | Frecuencia | Calidad de decision | Consecuencia legible | Riesgo de tramite |
|---------|------------|---------------------|----------------------|-------------------|
| Combate / push de tier | alta | baja-media | media | alta cuando la build ya estabilizo |
| Loot | alta | baja-media | media | alta sin filtro operativo ni feedback de overflow |
| Crafting | media-baja | alta sobre bases buenas | alta | media |
| Extraccion | baja | muy alta | alta | baja |
| Santuario jobs | media | baja | media-baja | alta |
| Prestige / Ecos | baja | alta al principio, media despues | alta | media |

Lectura sintetica:

- La mejor decision del juego hoy sigue siendo `extraer ahora vs seguir`.
- El mejor sub-loop secundario es `invertir recursos en una base que ya vale la pena`.
- El tramo que mas rapido se vuelve tramite es `Santuario` cuando las estaciones ya estan destrabadas y solo quedan claims/timers.

### Sistema de riesgo y costo de oportunidad

#### Donde si hay riesgo real

- Dentro de la expedicion: morir reduce recuperacion de cargo y anula recuperacion de proyecto.
- Al seguir avanzando: arriesgas una salida segura por mas tier, mejor drop, mas ecos y mejor proyecto.
- Al gastar recursos finos: `ascend`, `reforge`, `polish` y afinidad de blueprints si generan costo de oportunidad real.

#### Donde el riesgo es bajo o casi administrativo

- Reclamar jobs del Santuario.
- Reiniciar timers obvios.
- Consumir stock persistente cuando ya no hay otra compra competitiva cerca.

#### Irreversibilidades importantes

- Confirmar `Extraccion`
- Gastar `Echoes`
- Afinar afinidad de `Blueprints`
- Algunas decisiones de `Ascend` e injerto de poder legendario

#### Mecanismos que agregarian tension sin romper claridad

- Si algun dia queres mas tension en `Crafting`, que venga por una durabilidad o presupuesto de item al estilo `Last Epoch`, no por mas clicks o modales.
- Si queres mas tension en `Loot`, no la pongas en leer basura: `PoE` y `Diablo 4` son justamente el ejemplo de por que esa direccion degrada la experiencia.
- En `Santuario`, la mejor mejora no es mas riesgo sino menos mantenimiento: batch operations y menos claims repetitivos.

### Stress test de sistemas

#### Jugador optimo / min-maxer

- Va a detectar rapido que `Extraccion` y `Prestige` cargan gran parte del valor real.
- Tiene incentivos a hacer un primer `Prestige` temprano por el piso de `2 ecos`.
- Va a ignorar muchas operaciones de Santuario si no mueven la siguiente run de forma clara.

#### Jugador casual

- El safety net de muerte y los beats informativos ayudan a que no pierda todo.
- Aun asi, despues del early game puede entrar en sobrecarga por densidad de sistemas persistentes.
- Probablemente use poco `Crafting` fino y juegue mas alrededor de `equipar -> extraer -> volver`.

#### Jugador exploitador

- No encontre un exploit economico fuerte obvio en `loot`, `crafting`, `prestige` o `blueprints`.
- La optimizacion mas peligrosa hoy no parece ser un bug, sino el pacing: loops cortos de prestige si el tuning final lo permite.
- `Reforge` no regala valor gratis porque el costo se paga al abrir opciones.

#### Jugador que ignora tutoriales

- El juego se puede seguir jugando, pero puede no entender bien el valor de `Biblioteca`, `Sigilos`, `Encargos` o `Blueprints`.
- Como varios de esos sistemas todavia son opcionales durante bastante tiempo, el riesgo no es soft-lock sino infrauso.

#### Jugador de rafagas cortas

- Es el perfil mejor servido por `offline progress` y jobs temporizados.
- El riesgo para este perfil no es perder progreso sino gastar demasiada sesion en operativa: reclamar, chequear, relanzar.

### Intento de stress test automatizado

Probe el batch interno con:

- `npm run balance:batch -- --runs=2 --ticks=3600`

Resultado:

- Todas las corridas quedaron en `L1 / T1 / 0 kills`.
- Lo tomo como finding de tooling, no de balance bruto: hoy el harness necesita una seed post-onboarding para ser representativo.

### Resumen de hallazgos

La integridad base de los sistemas esta bastante mejor de lo que parecia. El tick, el loot base, los prerequisitos de talentos, el reset de prestige, la aplicacion de sigilos y la materializacion de blueprints estan razonablemente bien defendidos. Los problemas fuertes de esta tarea no son tanto bugs duros como desalineaciones de contrato y de valor:

- el jugador puede perder drops por overflow con muy poca friccion visible,
- `Crafting` no es el sistema que uno podria asumir por nombre o fantasia externa,
- `Prestige` puede terminar siendo demasiado shallow si el tuning final se queda asi,
- `Santuario` sigue siendo la capa que mas rapido se vuelve mantenimiento.

### Top 3 prioridades de implementacion

1. `SY-02` Surface fuerte para overflow de inventario.
2. `SY-08` Seed post-onboarding para simulacion y QA automatizado.
3. `SY-01` y `SY-03`: decidir el contrato largo de `Crafting` y `Blueprints` antes de sumar mas features alrededor.

### Riesgos de implementacion

- Agregar tension al lugar incorrecto puede empeorar el juego: no conviene copiar la friccion de lectura de loot de `PoE` o el cansancio de inventario de `Diablo 4`.
- Si agregas una capa tipo `Forging Potential`, tiene que ser para piezas de chase o tramo medio/alto; meterla en todo el gearing temprano pisaria la claridad actual.
- Si agregas `Blueprint Aging` sin una fantasia clara, podes destruir la sensacion de progreso persistente que hoy si existe.

### Referentes usados en Tarea 3

- `Last Epoch Crafting Guide - Icy Veins`
- `Diablo 4 finally fixed its loot problem, but now it has an inventory problem - PC Gamer`
- `Offline Progression - Melvor Idle Wiki`
- `Foundry Claim/Rush UI Problems and Suggestions - Warframe Forums`
- `foundry timers, from new players perspectives - Warframe Forums`
- `I was lead to believe this game was playable without a loot filter - Reddit / Path of Exile`

Nota: use estos referentes para contrastar tension de crafting, fatiga de loot y timers/claims persistentes. Varias comparaciones siguen siendo inferencias de patron, no citas textuales.

---

## Tarea 4 - Evolucion de Sistemas y Diseno

### System Impact Note

Esta tarea ya no discute solo bugs o claridad superficial. Discute que sistemas conviene mover, consolidar o directamente no sumar. Toca `src/components/Combat.jsx`, `src/components/Crafting.jsx`, `src/components/DeepForgeOverlay.jsx`, `src/components/BlueprintForgeOverlay.jsx`, `src/components/ExtractionOverlay.jsx`, `src/components/combat/CombatGuidanceStrip.jsx`, `src/engine/sanctuary/blueprintEngine.js`, `src/engine/sanctuary/projectForgeEngine.js`, `src/utils/lootFilter.js` y la forma en que el loop `Santuario -> Expedicion -> Extraccion -> Santuario` reparte tension. El riesgo principal aca no es tecnico sino de producto: agregar sistemas por potencial y no por valor para el loop central.

### Findings

| ID | Categoria | Ubicacion | Problema | Causa raiz | Solucion | Impacto retencion | Complejidad | Riesgo | Referente | Prioridad | Proceder | Estado | Slice sugerido |
|----|-----------|-----------|----------|------------|----------|-------------------|-------------|--------|-----------|-----------|----------|--------|----------------|
| EV-01 | Juice / feedback | `src/components/Combat.jsx`, overlays globales | La escalera emocional existe pero es plana: level up, rare drop, boss kill y prestige hoy se sienten demasiado parecidos en intensidad. | Ya hay `float events`, `levelUpFlash` y `loot overlay`, pero no existe una politica comun de ceremonia por severidad del evento. | Construir una `event ladder`: silencio para comun, acento breve para rare, ceremonia para legendary/boss/prestige, reutilizando la capa de overlays ya existente. | alto | media | bajo | WoW / Vampire Survivors / Diablo III | quick_win | si | pendiente | extender `Combat` con una cola comun de eventos para `level up`, `legendary`, `boss first kill` y `prestige` antes de sumar audio o haptics |
| EV-02 | Blueprint progression | `src/engine/sanctuary/blueprintEngine.js`, `src/components/BlueprintForgeOverlay.jsx` | No existe concepto de vigencia entre el tier real del jugador y el tier efectivo del blueprint; hoy el sistema es permanente o nada. | Los blueprints se modelaron como progreso persistente y nunca recibieron una capa suave de obsolescencia. | Si algun dia se adopta, hacerlo como `vigencia` no destructiva con formula suave y UI clara; no recomiendo activar decadencia real ahora. | medio | media | alto | RuneScape / Diablo III Paragon | nice_to_have | duda | pendiente | agregar primero un indicador de `vigencia` sin tocar stats, para validar si el juego realmente necesita aging |
| EV-03 | Family charges / affinity | `src/engine/sanctuary/blueprintEngine.js`, `src/state/gameReducer.js`, `src/components/BlueprintForgeOverlay.jsx` | El sistema de cargas ya existe, pero no tiene cap y su efecto es menos legible de lo que deberia. | La logica de afinidad quedo en motor y preview, pero le falta surfacing y guardrails economicos. | Mantener el sistema actual, agregar cap por familia, mostrar top familias en UI y hacer mas visible como cambian las probabilidades de materializacion. | medio-alto | baja-media | bajo | Grim Dawn Devotion / Monster Infrequents | quick_win | si | pendiente | cap de cargas + labels `muy alta/alta/media/baja` en la preview de materializacion |
| EV-04 | Informacion tactica en run | `src/components/Crafting.jsx`, modelo de item de expedicion, `src/components/ExtractionOverlay.jsx` | La expedicion hoy mezcla evaluacion y accion: el jugador rerollear dentro de la run elimina parte de la tension de decidir que vale la pena rescatar. | El `reroll` vive dentro del loop de expedicion y no existe una capa de informacion escasa para items prometedores. | Mover `reroll` fuera de la run y reemplazarlo por `Lente de Escrutinio`: usos limitados por run para revelar affixes velados antes de decidir rescate. | alto | alta | medio | Path of Exile / Last Epoch | critico | si | pendiente | MVP solo en `ExtractionOverlay`: items rescatables con 1-2 lineas veladas + 2 usos de lente por run |
| EV-05 | Deep Forge / hub | `src/components/DeepForgeOverlay.jsx`, `src/engine/sanctuary/projectForgeEngine.js`, `src/components/Crafting.jsx` | La Forja Profunda ya existe, pero todavia no es el hogar indiscutido del crafting pesado; `reroll` sigue viviendo en expedicion. | El crafting quedo repartido entre `Expedicion` y `Santuario` sin un contrato fuerte de ownership. | Convertir `Deep Forge` en el centro de operaciones pesadas: `reroll`, `reforge`, `ascend` y futuros procesos largos; la expedicion queda para `equip / upgrade / extract`. | alto | alta | medio | Warframe Foundry / Kanai's Cube | critico | si | pendiente | mover primero `reroll` a `DeepForgeOverlay` y reducir `Crafting.jsx` de expedicion al minimo tactico |
| EV-06 | Contratos / objetivos de sesion | `src/data/activeGoals.js`, `src/engine/progression/goalEngine.js`, `src/components/combat/CombatGuidanceStrip.jsx` | Los objetivos existen, pero hoy rotan como tips; no se sienten como una `session arc` clara de 10-20 minutos. | El sistema fue pensado como milestones flat, no como direccion de sesion. | Reemplazar el carrusel por `objetivo principal + 2 secundarios` visibles a la vez y agregar contratos semanales con banking, no presion diaria. | alto | media | bajo | Warframe Nightwave / OSRS | quick_win | si | pendiente | reformatear los goals actuales en una tira fija de 3 slots antes de inventar contenido nuevo |
| EV-07 | Loot filter | `src/utils/lootFilter.js`, `state.settings.lootRules`, vistas de loot | La base tecnica ya existe, pero al jugador no se le presenta como un loot filter util; falta threshold visual por rareza. | `lootRules` nacio como reglas internas de auto-accion y wishlist, no como producto de UX. | Agregar `rareza minima visible`, reutilizar `wishlistAffixes` como highlight simple y guardar todo en el save actual. | medio-alto | baja | bajo | Last Epoch / Path of Exile | quick_win | si | pendiente | sumar `minRarityToShowInCombat` y un panel simple de toggles usando el save actual |
| EV-08 | Core loop / simplificacion | `src/components/Sanctuary.jsx`, `src/components/Combat.jsx`, `src/components/ExtractionOverlay.jsx`, `src/components/Crafting.jsx` | La parte mas fuerte del loop es `Extraccion`, pero el regreso al `Santuario` sigue siendo demasiado administrativo; el codigo del hub va mas adelantado que su UX. | Se acumularon estaciones y acciones operativas sin consolidar la preparacion y la resolucion alrededor del loop principal. | Redisenar alrededor del loop, no de features aisladas: `Santuario` mas compacto, `Expedicion` con mas tension informativa, `Extraccion` intacta como pico de decision. | alto | media | bajo | Warframe / Grim Dawn / Vampire Survivors | critico | si | pendiente | ejecutar `loop v2`: `Santuario compacto + Session Arc + Lente MVP + Extraccion intacta` |

### 4.1 Juice y feedback visual

#### Estado actual en codigo

- Ya existe una base funcional en `src/components/Combat.jsx`:
- `levelUpFlash`
- `visibleLootEvent`
- `floatEvents`
- overlay de loot con pulso por rareza
- No encontre en codigo:
- audio por rareza
- haptics
- ceremonia de boss kill
- transicion de prestige
- screenshot automatico

Lectura: el juego no necesita una arquitectura nueva; necesita una escalera comun de intensidad.

#### Propuesta de escalera emocional

1. `Level up`
- Referente: el `ding` de WoW funciona porque es instantaneo, reconocible y no corta la accion; la celebracion dura poco pero deja marca. Esta comparacion es parcialmente inferencia mia apoyada en la centralidad cultural del `ding`, no en una guia oficial de UX.
- Propuesta: barrido corto sobre la XP bar, texto `+1 NIVEL`, pulso sobre cualquier recurso nuevo gastable (`TP`, `skill unlock`, `eco`) y cierre automatico en menos de 2 segundos.
- Regla: nunca bloquear el combate.

2. `Loot raro / epic / legendary`
- Referente: `Vampire Survivors` convierte nivel y cofre en evento continuo; `Diablo III` reserva beam fuerte para drops premium.
- Propuesta:
- `common`: silencio total
- `magic/rare`: borde breve + mini toast
- `epic`: overlay actual mas fuerte + color dedicado
- `legendary`: beam vertical, card sticky 4-5s, compare contra equipado si corresponde
- Regla: no hacer que todo brille; la ceremonia tiene que ser escasa.

3. `Craft exitoso / perfect roll`
- Referente: `Last Epoch` usa `Forging Potential` para cargar tension en cada craft, no para llenar la pantalla de modales.
- Propuesta:
- animar la linea nueva o mejorada en la misma card
- destacar la stat tocada y la diferencia vs equipado
- reservar el sello fuerte solo para `T1` o `perfect`

4. `Boss kill`
- Referente: la comparacion con `Diablo 4` aca es inferencial: el genero funciona mejor cuando el cierre de un boss separa el ultimo hit del resto del spam visual. `Grim Dawn` refuerza el momento con orbes/chests y chase drops especiales.
- Propuesta:
- `hit-stop` muy corto solo en el golpe final
- caida del boss con vignette o freeze parcial
- primer kill del boss: mini popup de Codex
- nunca usar slow-mo largo; 200-300ms alcanza

5. `Prestige / Ascension`
- Referente: `Warframe` sabe hacer transiciones de capitulo con framing diegetico; `Diablo` funciona mejor cuando el reset se siente como inicio de era y no solo como wipe de numeros.
- Propuesta:
- transicion de 5-7s
- `Echoes` flotando en HUD
- entrada automatica en `Legacy Journal`
- etiqueta visible `Capitulo X`

#### Lo que no recomiendo

- No recomiendo screenshot automatico ahora.
- No recomiendo audio/haptics antes de definir bien la jerarquia visual.
- No recomiendo una cinemática por cada drop alto; reservar ceremonia larga para `prestige`.

### 4.2 Blueprint aging y obsolescencia

#### Estado actual en codigo

- `Blueprint aging` no existe hoy en `src/engine/sanctuary/blueprintEngine.js`.
- Lo que si existe:
- `itemTier`
- `blueprintLevel`
- `powerTuneLevel`
- `ascensionTier`
- `materializationCount`
- conclusion: hoy el blueprint es permanente y su poder no mira el tier actual de juego.

#### Recomendacion de producto

No recomiendo activar degradacion real ahora.

Motivo:

- rompe una de las mejores fantasias persistentes del juego
- agrega mantenimiento a una capa que ya es compleja
- puede convertir `Santuario` en otro sitio donde el jugador descubre que algo se vencio

#### Si en el futuro se adopta, formula propuesta

- `tierGap = max(0, currentMaxTier - blueprintEffectiveTier)`
- `overGap = max(0, tierGap - 3)`
- `vigencia = clamp(1 - 0.06 * log2(overGap + 1), 0.80, 1.00)`

Interpretacion:

- hasta `gap 3`: sin castigo
- `gap 4-6`: caida leve
- `gap 7-10`: claramente rezagado, pero usable
- piso en `80%`: nunca se vuelve basura instantanea

#### Como deberia mostrarse

- chip visible en el blueprint activo:
- `Fresco`
- `Estable`
- `Rezagado`
- `Antiguo`
- linea explicita:
- `Vigencia 88% para tu tier actual`
- sugerencia de re-scan:
- primera sugerencia en `gap >= 6`
- sugerencia fuerte en `gap >= 9`

#### Slice recomendado si el owner quiere explorarlo

- fase 1: solo indicador visual y mensaje
- fase 2: preview de materializacion ajustada por `vigencia`
- fase 3: recien ahi evaluar si conviene aplicar el modificador en vivo

### 4.3 Sistema de afinidades - family charges

#### Estado actual en codigo

- `familyCharges` ya viven en `state.sanctuary.familyCharges`
- se ganan desde conversion a blueprint, scrap y rewards de jobs
- se gastan en `INVEST_BLUEPRINT_AFFINITY`
- `BlueprintForgeOverlay` ya muestra total de cargas
- `buildBlueprintMaterializationPreview(...)` ya tiene pesos y familias

Lectura: el sistema no esta ausente. Esta sub-presentado.

#### Refinamiento recomendado

1. `Mantener el estado actual`
- no crear otra currency
- no duplicar entre `charges temporales` y `charges permanentes`

2. `Agregar cap`
- cap sugerido: `40` por familia
- cuando una familia llega al cap, el juego debe avisarlo
- el objetivo del cap no es castigar; es evitar stock infinito sin decision

3. `Hacer visible el efecto`
- en el header del Taller: top 3 familias acumuladas
- en cada blueprint: `cargas disponibles` de sus familias relevantes
- en la preview de materializacion:
- `muy alta`
- `alta`
- `media`
- `baja`

4. `Reducir micro-clicks`
- agregar `invertir x1 / x5 / todo posible`
- o preset rapido `sesgar a primaria`

#### Lo que no recomiendo

- no recomiendo decay temporal de cargas
- no recomiendo auto-consumo oculto de cargas al materializar
- no recomiendo crear una segunda capa de afinidad efimera por run

### 4.4 Lente de Escrutinio - informacion tactica en run

#### Estado actual en codigo

- `reroll` vive hoy en la experiencia de expedicion via `src/components/Crafting.jsx`
- no encontre un modelo de `affix oculto` o `item velado`
- conclusion: este sistema no existe hoy y si se hace requiere extender el modelo de item o al menos el de item rescatable

#### Objetivo de diseno

Cambiar la tension de `accion repetitiva` a `informacion escasa`.

En vez de rerollear dentro de la run, el jugador decide:

- que revelar
- que dejar sin revelar
- que pieza vale la pena rescatar igual

#### Propuesta de sistema

##### Regla base

- los items `rare+` candidatos a rescate pueden venir con `1-2` lineas veladas
- el valor existe bajo el capot desde el drop; solo esta oculto en UI
- la `Lente` revela esas lineas

##### Recursos

- `2` usos base por run
- recarga completa al iniciar run
- upgrades futuros posibles via `Codex`, `Sigil` o `Prestige`

##### Donde vive en state

- `state.expedition.scrutinyLens = { charges, maxCharges, scannedItemIds }`
- cada item candidato:
- `inspection = { hiddenAffixIndices, revealed: false }`

##### UI

- boton contextual `Usar Lente`
- scan line sobre la card
- las lineas aparecen una a una
- si se acaban los usos, el resto queda en decision ciega

#### MVP recomendado

No empezaria con todos los items de inventario.

Empezaria solo con:

- `projectOptions` dentro de `ExtractionOverlay`

Por que:

- pega justo en la decision de rescate
- evita reescribir toda la UX de inventario
- valida rapido si la tension es divertida o solo molesta

#### Lo que no recomiendo

- no recomiendo volver `unidentified` todo el loot temprano
- no recomiendo mezclar Lente con otra currency nueva
- no recomiendo que la Lente bloquee equipar o vender items comunes

### 4.5 Forja Profunda - Santuario como hub

#### Estado actual en codigo

- `DeepForgeOverlay` ya existe
- `projectForgeEngine` ya soporta:
- `polish`
- `reforge`
- `ascend`
- progreso persistente por proyecto
- `jobEngine` ya soporta timers para `forge_project` y scrap de item rescatado
- el problema no es falta de sistema; es falta de ownership claro

#### Redefinicion recomendada

##### La expedicion conserva

- `equip`
- `upgrade`
- `extract / sell`

##### La Forja Profunda absorbe

- `reroll total`
- `reforge`
- `ascend`
- `imprint / tuning`
- cualquier operacion futura de varias runs

#### Timers recomendados

No todo necesita timer.

- `reroll` y `reforge`: instantaneos
- `ascend`, `fuse`, proyectos largos: con timer
- razon: los procesos iterativos no deben esperar; los compromisos largos si pueden madurar en background

#### Materiales

No agregaria nuevas monedas todavia.

Usaria lo ya existente:

- `essence`
- `relicDust`
- materiales del Santuario cuando ya existan en el mismo corredor

#### Relacion con el loop

- `Santuario`: preparas y cierras
- `Expedicion`: peleas y eliges
- `Extraccion`: conviertes riesgo en valor
- `Santuario`: haces el craft pesado sin romper la tension de la run

#### Lo que no recomiendo

- no recomiendo introducir `corrupt` o `fuse` antes de mover `reroll`
- no recomiendo que la Forja Profunda sea otra pantalla densa sin ownership claro

### 4.6 Sistema de contratos y objetivos de sesion

#### Estado actual en codigo

- `ACTIVE_GOALS` ya existe con categorias `combat / loot / craft / build / prestige`
- `goalEngine` ya elige hasta `3` goals activos
- `CombatGuidanceStrip` hoy rota esos objetivos uno por vez

Lectura: el backend base ya esta. Falta la forma correcta de surfacearlo.

#### Session Arc propuesta

##### Siempre visible en `Combat`

- `Principal`
- `Secundario A`
- `Secundario B`

##### Roles

- `Principal`: empuje, prestige o milestone de sesion
- `Secundario A`: build o craft
- `Secundario B`: loot o progreso transversal

##### Regla de tiempo

- el principal debe ser razonablemente completables en `10-20 min`
- si no hay uno asi, el sistema debe generar uno mas corto

#### Contratos semanales con banking

- `7` contratos disponibles por semana
- se pueden completar todos el mismo dia
- sin castigo por no entrar diario
- rewards moderados, no mandatorios

Esto toma la mejor parte de `Nightwave`:

- catch-up
- menos grind semanal

Y evita `Dailyscape`.

#### Slice recomendado

- fase 1: reemplazar el carrusel por 3 cards fijas usando los goals actuales
- fase 2: agregar metadata `arcRole` y `cadence`
- fase 3: contratos semanales banked

### 4.7 Loot filter configurable

#### Estado actual en codigo

- `settings.lootRules` ya existe en el save
- hoy ya soporta:
- `autoSellRarities`
- `autoExtractRarities`
- `huntPreset`
- `wishlistAffixes`
- `protectHuntedDrops`
- `protectUpgradeDrops`

Conclusion: no hay que inventar subsystem nuevo. Hay que terminarlo como producto.

#### Implementacion recomendada

##### Campos nuevos

- `minRarityToShowInCombat`
- `minRarityToToast`
- `highlightWishlistAffixes` reutilizando `wishlistAffixes`

##### UI

- panel simple en `Mochila` o `Mas > Sistema`
- toggles y segmented buttons
- presets:
- `Build`
- `Enemigo`
- `Custom`

##### Comportamiento

- late game: poder silenciar `commons`
- `wishlist` conserva borde especial
- `legendary` nunca se silencia

#### Lo que no recomiendo

- no recomiendo sintaxis de texto plano estilo PoE
- no recomiendo 20 reglas encadenadas
- no recomiendo separar `loot filter` y `wishlist system`; hoy deben vivir juntos

### 4.8 Auditoria y re-diseno del core loop

#### Respuestas explicitas

##### Parte mas fuerte hoy

- `Extraccion`

Es donde mejor se juntan:

- tension
- costo de oportunidad
- conversion a valor persistente

##### Parte mas debil hoy

- `Regreso al Santuario`

No porque este vacio, sino porque se siente administrativo demasiado rapido.

##### Parte mejor resuelta en codigo que en UX

- `Blueprints / Deep Forge / goals / loot rules`

El codigo ya tiene bases bastante serias para estas capas, pero la experiencia visible las muestra mas opacas o densas de lo que son.

##### Parte que necesita rediseño sistemico y no solo polish

- la frontera `Expedicion craft` vs `Santuario craft`

Mientras `reroll` siga dentro de la run y `Santuario` siga cargando demasiada operativa, el loop no termina de ordenar bien su tension.

#### Loop v2 recomendado

1. `Santuario`
- header operativo corto
- eliges `Session Arc`
- reclamas o dejas jobs
- preparas sigilo y revisas Taller si hace falta

2. `Expedicion`
- combate automatico
- objetivo principal visible
- loot claro
- Lente para pocas decisiones importantes

3. `Extraccion`
- mantienes el pico actual de decision
- ahora con mas tension si algun candidato sigue velado

4. `Santuario`
- Deep Forge como sitio natural del craft pesado
- menos mantenimiento
- mas resolucion de cuenta

### 4.9 Simplificacion agresiva

#### Sistemas que si conviene mantener

- `Deep Forge` como hub pesado
- `Family charges` como sesgo persistente
- `Session Arc` sobre goals existentes
- `Loot filter` simple sobre `lootRules`

#### Sistemas que conviene mover

- `reroll` sale de `Expedicion`
- el peso del craft pesado pasa a `Santuario`
- los goals dejan de rotar como tip y pasan a verse como direccion de sesion

#### Sistemas que no agregaria todavia

- `Blueprint aging` real
- `corrupt`
- `fuse`
- screenshot automatico
- otra currency solo para inspeccion
- filtros de loot con sintaxis compleja

#### Test rapido para cualquier feature nueva

Si una idea nueva:

- no fortalece `Santuario -> Expedicion -> Extraccion -> Santuario`
- agrega clicks pero no decisiones
- agrega lectura pero no tension
- o crea upkeep en vez de profundidad

entonces no deberia entrar.

### Resumen de hallazgos

`Tarea 4` confirma una direccion bastante clara: el juego no necesita muchos sistemas nuevos; necesita reasignar mejor la tension entre los que ya tiene. El mayor acierto estructural sigue siendo `Extraccion`. El mayor problema estructural sigue siendo que `Santuario` todavia devuelve demasiado mantenimiento y que `Expedicion` sigue cargando crafting que le quita foco.

Las decisiones mas prometedoras de esta tarea no son "hacer el juego mas grande". Son:

- mover `reroll` al `Santuario`
- usar `Lente` como informacion escasa en vez de craft spammable en run
- convertir goals en `Session Arc`
- terminar `lootRules` como loot filter simple
- reforzar la jerarquia emocional de eventos ya existentes

### Top 3 prioridades de implementacion

1. `EV-05` mover `reroll` a `Deep Forge` y ordenar ownership del crafting.
2. `EV-06` transformar goals actuales en `Session Arc` visible.
3. `EV-07` terminar el loot filter basico sobre `lootRules` ya existentes.

### Riesgos de implementacion

- Si `Lente` se aplica a todo el loot demasiado temprano, puede volver tedioso el midgame.
- Si `Deep Forge` absorbe demasiado sin compactar UI, `Santuario` se vuelve aun mas pesado.
- Si `Blueprint aging` se activa antes de validar necesidad real, puede destruir la fantasia persistente mas interesante del juego.
- Si el juice visual se vuelve uniforme, todo el juego grita y nada importa.

### Referentes usados en Tarea 4

- [WARFRAME - Foundry and Crafting FAQ](https://support.warframe.com/hc/en-us/articles/38385820873741-Foundry-and-Crafting-FAQ)
- [WARFRAME - Nightwave Intermission](https://www.warframe.com/news/nightwave-intermission)
- [WARFRAME - Update 25.3.0 Nightwave Series 2 Changes](https://www.warframe.com/en/patch-notes/switch/25-3-0)
- [Grim Dawn - Devotion Guide](https://www.grimdawn.com/guide/character/devotion/)
- [Grim Dawn - The Hunt for Loot](https://www.grimdawn.com/guide/items/the-hunt-for-loot/)
- [RuneScape Wiki - Equipment degradation](https://runescape.wiki/w/Equipment_degradation)
- [Path of Exile - About Item Filters](https://www.pathofexile.com/item-filter/about)
- [Last Epoch Crafting Guide - Icy Veins](https://www.icy-veins.com/last-epoch/crafting-guide)
- [Vampire Survivors Review - Nintendo Life](https://www.nintendolife.com/reviews/switch-eshop/vampire-survivors)
- [Diablo III - Ancient and Primal Guide](https://news.blizzard.com/en-us/article/22989464/legendary-an-ancient-primal-guide)
- [Diablo 4 inventory problem - PC Gamer](https://www.pcgamer.com/diablo-4-has-finally-fixed-its-loot-problem-but-now-it-needs-to-fix-its-loot-problem/)
- [OSRS Wiki - Achievement Diary](https://oldschool.runescape.wiki/w/Achievement_Diary)
- [WoWWiki - Ding](https://wowwiki-archive.fandom.com/wiki/Ding)

Nota: varias comparaciones de Tarea 4 son inferencias de patron de uso y no citas literales, en especial `WoW ding`, `Diablo 4 boss finish`, `D3 season start` y la lectura de `OSRS` como objetivo de mediano plazo sin presion diaria.

---

## Tarea 5 - Balance y Economia

### System Impact Note

Esta tarea cruza `src/engine/leveling.js`, `src/data/playerUpgrades.js`, `src/constants/craftingCosts.js`, `src/engine/crafting/craftingEngine.js`, `src/utils/loot.js`, `src/engine/affixesEngine.js`, `src/data/enemies.js`, `src/data/bosses.js`, `src/engine/progression/prestigeEngine.js`, `src/data/classes.js`, `src/engine/combat/statEngine.js`, `src/engine/simulation/balanceBatchRunner.js` y `src/engine/simulation/balanceBot.js`. El riesgo de tocar esta capa no es solo numerico: cualquier retune fuerte puede mover onboarding, pacing de prestige, valor percibido del loot y lectura de progreso. Aca hay que separar bien tres cosas: economia real, tuning real y tooling de balance. Hoy esas tres capas no estan igual de maduras.

### Findings

| ID | Categoria | Ubicacion | Problema | Causa raiz | Solucion | Impacto retencion | Complejidad | Riesgo | Referente | Prioridad | Proceder | Estado | Slice sugerido |
|----|-----------|-----------|----------|------------|----------|-------------------|-------------|--------|-----------|-----------|----------|--------|----------------|
| EC-01 | Economia | `src/data/playerUpgrades.js`, `src/constants/craftingCosts.js`, `src/state/gameReducer.js` | `Gold` tiene pocos sinks estructurales: el max total de `playerUpgrades` ronda `13.49M`, y casi todo el crafting pesado usa `essence`, no `gold`. Eso crea dos fases toxicas distintas: muro de `gold` en mid y riesgo de inflacion cuando las mejoras permanentes ya estan cerradas. | Se concentro `gold` en `player upgrades` y `upgrade`, mientras `reroll / polish / reforge / ascend / Deep Forge` quedaron casi enteramente fuera de esa moneda. | Agregar sinks tardios o hibridos de `gold + essence` en el tramo avanzado, sin contaminar el early. La opcion mas limpia es cargar `gold` en `Deep Forge` y algunos procesos del `Santuario`, no en mas clicks de combate. | alto | media | medio | Diablo IV / OSRS | critico | si | pendiente | primer pase: definir 2-3 sinks tardios de `gold` y validar que no perjudiquen onboarding ni tramo medio |
| EC-02 | Progresion | `src/engine/leveling.js` | La curva de XP no es logaritmica ni suave; es lineal por brackets y pega saltos bruscos en `11 / 21 / 36 / 61 / 91`. El paso `10 -> 11` sube de `1600` a `3520` XP requeridos, mas del doble de golpe. | Se eligio una formula piecewise simple con multiplicadores fijos por tramo. | Mantener early rapido, pero suavizar transiciones con formula continua o con blending entre brackets. | medio-alto | baja | bajo | N/A | quick_win | si | pendiente | reemplazar los saltos duros por una curva continua sin tocar la fantasia de early rapido |
| EC-03 | Meta economy | `src/engine/progression/prestigeEngine.js`, `src/state/gameReducer.js`, `src/engine/sanctuary/extractionEngine.js` | El pacing de `Prestige` sigue siendo generoso: primer gate `Tier 5 OR 1 boss OR Nivel 12`, piso de `2 ecos`, y `momentum` fuerte. Eso puede favorecer extracciones relativamente superficiales demasiado pronto. | Se privilegio el primer spike meta y la accesibilidad del reset. | Retocar `readiness`, piso del primer prestige y peso relativo de `maxTier / bossKills / profundidad`, no para castigar, sino para que el reset premie mejor la run realmente buena. | alto | media | medio | Diablo IV | critico | si | pendiente | tuning pass corto sobre `FIRST_PRESTIGE_MIN_ECHOES`, `minimumRunLabel` y multiplicador de momentum temprano |
| EC-04 | Tooling / balance | `src/engine/simulation/balanceBatchRunner.js`, `src/engine/simulation/balanceBot.js`, `src/data/classes.js`, `src/engine/progression/progressionEngine.js` | Hoy no se puede afirmar honestamente que una spec domine o no. El batch parte de `createFreshState()`, se queda en `L1 / T1 / 0 loot`, y ademas el `balanceBot` no sigue las mismas reglas de unlock que el juego real: la partida real destraba specs a `nivel 5`, pero el bot espera `nivel 18` o `200 kills` segun la rama. | El harness nacio antes del onboarding actual y el bot hardcodeo heuristicas de spec que ya no reflejan el producto vivo. | Arreglar primero la herramienta: seed post-onboarding + paridad de unlocks reales + report por spec con mismas reglas del juego. Recién despues balancear clases. | alto | baja-media | bajo | N/A | critico | si | pendiente | extender `SY-08`: seed post-onboarding y alinear `balanceBot` con `selectSpecialization(...)` real |
| EC-05 | Crafting economy | `src/constants/craftingCosts.js`, `src/engine/crafting/craftingEngine.js`, `src/components/Crafting.jsx`, `src/components/DeepForgeOverlay.jsx` | La ladder de costos favorece demasiado algunas acciones y castiga otras. Ejemplo: en `rare`, `polish` T3 cuesta `288 essence`, `reroll` `440`, `reforge` T3 `972`, y `reforge` T1 `1701`. En la practica, `polish` es la compra obvia muchas veces y `reforge` queda como martillo caro. | Multiplicadores de rareza y tier muy abiertos, especialmente en `reforge`, sumados a escalado por uso. | Acercar `polish` y `reforge` en rare/epic, o hacer que `reforge` devuelva mucho mas valor cuando cuesta tan caro. Si el ownership pesado va a `Deep Forge`, el costo alto tiene que venir con una recompensa informativa real. | alto | media | medio | Last Epoch / Diablo IV | critico | si | pendiente | retune de costos `rare/epic` + mas valor por `reforge` antes de sumar mas capas de crafting |
| EC-06 | Crafting contract | `src/engine/crafting/craftingEngine.js`, `src/constants/craftingCosts.js` | El prompt pregunta por `Forging Potential`, pero hoy ese sistema no existe. La agencia real esta en `CRAFT_ACTION_LIMITS` por rareza, costos escalados y focos de linea. Si no se explicita, el jugador puede leer el craft como arbitrario. | La fantasia mental del sistema crecio mas rapido que el contrato implementado. | O se documenta y surfea mucho mejor el contrato actual, o mas adelante se introduce una version FP-like solo para piezas de chase. No recomiendo meter un FP global ahora. | medio | baja | medio | Last Epoch | quick_win | si | pendiente | primero explicitar el contrato actual en UI/copy y despues decidir si hace falta una capa FP-like |
| EC-07 | Loot / drops | `src/utils/loot.js`, `src/engine/affixesEngine.js`, `src/engine/inventory/inventoryEngine.js`, `src/engine/combat/processTickRuntime.js` | El problema del loot no parece ser escasez sino exceso de ruido. Hay `drop cap` de `55%`, `inventory cap` de `50`, T1 muy raros al inicio pero bastante frecuentes en `itemTier 17+`, y un surface de overflow todavia flojo. Eso puede hacer que la emocion se desplace de `drop chase` a `clasificar basura`. | Se mejoro la generacion y el highlighting tecnico, pero no se termino el loot filter ni la jerarquia de surfacing. | Terminar el `loot filter`, fortalecer overflow y redefinir el chase visible: ya no es solo `T1`, sino `base correcta + linea correcta + roll correcto`. | alto | media | bajo | Path of Exile / Diablo IV | critico | si | pendiente | terminar `EV-07` + `SY-02` y ajustar copy para que `T1` tardio no se venda como si siguiera siendo ultra-raro |
| EC-08 | Legibilidad de poder | `src/engine/inventory/inventoryEngine.js`, `src/components/Inventory.jsx`, `src/components/Character.jsx`, `src/engine/combat/statEngine.js` | Parte del balance esta escondido detras de una lectura de poder debil. `calcItemRating(...)` usa pesos globales, mientras el rendimiento real depende de sinergias condicionales profundas (`mark`, `flow`, `defense_to_damage`, `volatile`, etc.). El jugador puede equipar o descartar algo correcto por razones equivocadas. | La UI muestra `rating` y algunos chips, pero no explica suficientemente el por que de una mejora en la build activa. | Agregar lectura build-aware: `por que este item es bueno para tu build`, `que stat empuja`, `que craft mejoro`, `que pierdes si cambias`. Balance que no se puede leer tambien falla como UX. | alto | media | bajo | Diablo IV / Last Epoch | critico | si | pendiente | delta build-aware en `Inventory`, `Crafting` y `Character` antes de tocar numeros a ciegas |

### 5.1 Curvas de progresion

#### Gold

- `Gold` escala bastante en rewards base: un enemigo normal pasa de `6` oro en `Tier 1` a `898` en `Tier 25`; un boss slot `Tier 25` da `7800`.
- El problema no es que falte una generacion base razonable. El problema es que los sinks estan desbalanceados por fase.
- En tramo medio, el muro existe:
- un `rare +5` cuesta `6480`, pero `rare +6` salta a `13230` por el multiplicador extra de high-upgrade.
- en `Tier 20`, eso equivale a unas `39` kills normales base o `5` bosses base antes de bonus.
- En tramo largo, el riesgo es el contrario:
- `playerUpgrades` completos cuestan en total aprox. `13.49M`.
- despues, el crafting pesado casi no drena `gold`; drena `essence`.
- Conclusión: `gold` hoy corre riesgo de sentirse opresivo en mid y superfluo en late.

#### Essence

- La generacion base de `essence` es mas contenida: `1` por normal en tiers bajos, `5` por normal en `Tier 25`, bosses entre `3` y `8`.
- Los sinks son duros y si generan decision real:
- `rare reroll`: `440`
- `rare polish` T3: `288`
- `rare reforge` T3: `972`
- `rare ascend`: `2560`
- No veo inflacion estructural de `essence` en el codigo actual. Si algo falla, va a fallar por muro de poder o por ladder mal espaciada, no por exceso.

#### Echoes / prestige currency

- `Echoes` si tienen mejor salud de largo plazo que `gold`.
- Hay doble sink:
- gasto directo en arbol de `Prestige`
- `Resonancia` por `totalEchoesEarned`
- El arbol tiene mucho recorrido y `Resonancia` decae por brackets, lo cual ayuda a longevidad.
- El problema esta mas en el arranque que en el endgame:
- primer prestige con piso de `2 ecos`
- primeros ecos dan bonos bastante gruesos
- gate minimo muy accesible
- Conclusión: la economia meta no se queda sin sinks rapido, pero el spike temprano puede comprimir demasiado la curva de maestria.

#### Materiales del Santuario

- `codexInk`, `sigilFlux` y `relicDust` estan bastante mejor modelados que `gold`.
- Sus entradas vienen de jobs, destileria y rewards de estaciones.
- Sus sinks viven en estaciones concretas (`Biblioteca`, `Altar`, `Deep Forge`, `Blueprints`), no desperdigados por todo el juego.
- No veo inflacion obvia aca. De hecho, esta es la parte de la economia que mejor preparada queda para crecer sin explotar complejidad.

#### XP

- La curva early si es rapida, pero no es suave.
- Saltos mas notorios:
- `10 -> 11`: `1600` a `3520`
- `20 -> 21`: `6400` a `10920`
- `35 -> 36`: `18200` a `27360`
- `60 -> 61`: `45600` a `63440`
- `90 -> 91`: `93600` a `125580`
- Esto no mata la progresion, pero puede sentirse como pared invisible si no coincide con un unlock o un cambio de fase.

### 5.2 Balance de clases y specs

#### Lo que si puedo afirmar

- Hay `2` clases y `4` specs reales.
- El unlock live de todas las specs es `nivel 5`; eso esta en `src/data/classes.js` y se respeta en `selectSpecialization(...)`.
- `Warrior` arranca mas seguro (`damage 14 / defense 4 / hp 120`) y `Mage` mas fragil pero con mejor base critica (`damage 11 / defense 1 / crit 0.06 / hp 85`).
- El presupuesto de poder real no vive solo en `classes.js`; vive sobre todo en `statEngine`, donde hay muchas sinergias condicionales por spec.

#### Lo que no puedo afirmar honestamente todavia

- No puedo decir hoy que `Berserker`, `Juggernaut`, `Sorcerer` o `Arcanist` esten realmente equilibrados en todos los tiers.
- El motivo no es falta de ganas de auditar; es tooling insuficiente:
- el batch no rompe early
- el bot no usa los mismos unlocks que el juego real
- Por eso, cualquier veredicto duro tipo `esta spec esta rota` seria poco serio en esta fase.

#### Lectura provisional

- No encontre una spec mecanicamente muerta por un talento roto o una rama sin efecto.
- Si hay un riesgo claro:
- specs con sinergias mas transparentes y front-loaded probablemente van a parecer mejores aunque no lo sean
- specs con poder mas condicional pueden quedar subelegidas por lectura, no por presupuesto real

### 5.3 Balance de crafting

#### Respuesta explicita sobre Forging Potential

- `Forging Potential` no existe hoy en este juego.
- La agencia real esta dada por:
- limites por accion y rareza (`CRAFT_ACTION_LIMITS`)
- escalado de costo por uso
- gating por nivel para `ascend`
- foco de linea y recomendacion contextual

#### Lo que esta sano

- Hay un intento real de que no todo craft sirva para todo.
- `upgrade` todavia tiene un rol fuerte de early-mid.
- `ascend` si parece reservado para bases ya buenas.

#### Lo que esta desbalanceado

- `polish` tiende a quedar demasiado atractivo contra `reroll` y sobre todo contra `reforge`, especialmente en `rare`.
- `reforge` paga mucho por ser especifico, pero no siempre devuelve suficiente agencia extra.
- `rare` pega un salto fuerte de costo en `+6`, que puede sentirse bien si ya decidiste invertir, pero tambien puede cortar demasiadas piezas “casi buenas”.
- `epic` y `legendary` escalan tan fuerte que el craft se vuelve facilmente psicologico: guardas el recurso mas de lo que lo usas.

#### Conclusiones

- No hay loop abusivo tipo `fuse` o `corrupt` porque esos sistemas ni existen.
- Si hay dominancia relativa de operaciones:
- `polish` muchas veces es la compra obvia
- `reforge` muchas veces es la compra que pospones
- Si `Deep Forge` va a concentrar el crafting pesado, esto conviene corregir ahi y no sobrecargar mas la run.

### 5.4 Balance de loot y drops

#### Frecuencia y presion de inventario

- `dropChance` base es `0.08`, bosses suman `0.30`, `luck` y `lootBonus` empujan mas, y el techo es `0.55`.
- Con un `inventory cap` de `50`, la preocupacion del prompt es valida: si una cuenta entra en farm estable y no filtra bien, llenar mochila en menos de `10` minutos es perfectamente plausible.
- El problema ya no es “caen pocas cosas”. El problema es “caen demasiadas cosas de señal insuficiente”.

#### Escasez de T1

- Early:
- `itemTier <= 4`: peso T1 `0.05`
- `<= 8`: `0.20`
- `<= 12`: `0.45`
- Mid-high:
- `<= 16`: `0.75`
- `17+`: `1.00`, por encima de `T2 0.95` y `T3 0.7`
- Eso significa que `T1` si es chase temprano, pero deja de ser ultra-raro en late.
- Si la UI sigue presentando `T1` como si fuera el pico absoluto siempre, la emocion se aplana sola.

#### Boss drops

- Esta es una de las partes mas sanas del juego actual.
- Los bosses si justifican su tiempo:
- multiplicador fuerte de `gold/xp/essence`
- piso garantizado de rareza
- bonus especificos de drop
- boss bias por familia/stats
- Mi lectura aca es clara: no nerfear bosses por reflejo. El problema no esta en el valor del boss; esta en que el ruido del resto puede enterrarlo.

#### Items inutiles

- No veo un conjunto grande de items literalmente inutiles en todo contexto.
- Lo que si veo son items que se sienten inutiles porque:
- el rating no siempre explica bien la build
- el overflow llega antes de que puedas evaluarlos
- el chase visible no esta suficientemente jerarquizado

### 5.5 Longevidad economica

#### Lo que esta bien

- `Echoes` tienen mejor forma de largo plazo que parecia.
- Los materiales del `Santuario` estan bien encapsulados por estacion.
- La economia todavia puede crecer con 1-2 materiales mas sin explotar complejidad, siempre que nazcan anclados a una estacion concreta.

#### Lo que esta flojo

- `Gold` no tiene buen endgame economy role.
- `Prestige` temprano es demasiado generoso para lo que todavia exige.
- `Loot` tarda en volverse filtro, y mientras tanto se vuelve fatiga.

#### Lo que no haria

- No agregaria otra currency universal solo para “arreglar balance”.
- No meteria degradacion de equipo como sink general.
- No abarataría `essence` en bloque sin antes corregir la ladder `polish / reforge / ascend`.

#### Direccion recomendada

- `gold`: nuevo trabajo en late como sink hibrido de procesos pesados
- `essence`: seguir siendo moneda de decision
- `echoes`: menos generosos en entrada, igual de relevantes en largo plazo
- materiales del `Santuario`: seguir como economias locales por estacion

### 5.6 Lectura de poder por parte del jugador

#### Problema de fondo

- Parte del “balance” hoy falla porque el jugador no siempre puede leer por que mejoro.
- El sistema ya muestra:
- `rating`
- compare contra equipado
- `build tag`
- algunos chips de identidad
- Pero no alcanza cuando el poder real depende de sinergias condicionales.

#### Donde se nota mas

- `Inventory`: el `rating` ordena y ayuda, pero no siempre explica bien piezas de `Mage`, de economia o de conversion defensiva.
- `Crafting`: sabes cuanto cuesta la operacion, pero no siempre que intentas comprar realmente.
- `Character`: resume bien, pero no conecta lo suficiente entre stat final, equipo y spec.

#### Consecuencia

- El jugador puede atribuir mal una mejora.
- Puede pensar que una spec rinde menos cuando en realidad la leyo peor.
- Puede descartar items correctos para su build porque la señal principal es demasiado generica.

#### Direccion correcta

- Todo item importante deberia responder rapido:
- `que empuja de tu build`
- `que pierdes si lo cambias`
- `por que este craft fue bueno`
- `por que esta spec esta rindiendo asi`
- Esto no es “solo UX”. Esto es balance practicable.

### Resumen de hallazgos

`Tarea 5` no muestra una economia rota de punta a punta. Muestra algo mas interesante: economias distintas con problemas distintos.

- `Gold` tiene un problema de rol: presiona demasiado en tramo medio y demasiado poco en tramo largo.
- `Essence` si conserva tension, pero la ladder de crafting esta espaciada de forma discutible.
- `Echoes` tienen una buena base de longevidad, pero entran demasiado generosos demasiado pronto.
- El loot matematicamente no se ve pobre; se ve sobre-ruidoso.
- Y el mayor bloqueo para balance serio de classes/specs hoy no es el codigo de combate, sino el tooling de simulacion.

La conclusion fuerte es esta: antes de “buffear o nerfear specs”, conviene arreglar tres cosas mas basicas:

- la herramienta que mide balance
- la ladder de costos de crafting
- la lectura de poder para el jugador

### Top 3 prioridades de implementacion

1. `EC-04`: arreglar el harness de balance real (`seed post-onboarding + bot con unlocks live`) antes de tocar specs.
2. `EC-05` + `SY-05`: retocar `crafting ladder` y `prestige pacing`, que hoy son los dos tuning levers con mas impacto real.
3. `EC-08`: mejorar lectura build-aware de items y crafts para que el balance sea visible y no solo interno.

### Riesgos de implementacion

- Si usas `gold` como sink tarde de forma indiscriminada, podes arruinar el tramo medio.
- Si aflojas demasiado `essence`, el crafting pierde tension y todo se vuelve spam.
- Si endureces `Prestige` sin una mejor lectura de progreso, el reset puede empezar a sentirse castigo.
- Si arreglas solo numeros pero no surfacing, el juego puede quedar mejor balanceado internamente y peor entendido externamente.

### Referentes usados en Tarea 5

- [Diablo IV - Loot Reborn](https://news.blizzard.com/en-us/article/24077223/galvanize-your-legend-in-season-4-loot-reborn)
- [Path of Exile - About Item Filters](https://www.pathofexile.com/item-filter/about)
- [Last Epoch Crafting Guide - Icy Veins](https://www.icy-veins.com/last-epoch/crafting-guide)
- [OSRS Wiki - Repair costs / degradation](https://oldschool.runescape.wiki/w/Repair_costs)

Nota: en esta tarea use `Diablo IV` sobre todo para contrastar simplificacion de item lectura, menor volumen de drops y craft con limites visibles; `PoE` para surfacing y jerarquia de loot; `Last Epoch` para el modelo `FP-like` como referencia de agencia; y `OSRS` solo como recordatorio de que un sink tipo degradacion existe, pero no conviene copiarlo ciegamente aca. Varias comparaciones siguen siendo inferencias de patron, no citas textuales.

---

## Tarea 6 - Monetizacion y Retencion

### System Impact Note

Esta tarea cruza `src/engine/stateInitializer.js`, `src/engine/sanctuary/jobEngine.js`, `src/data/activeGoals.js`, `src/engine/progression/goalEngine.js`, `src/components/combat/CombatGuidanceStrip.jsx`, `src/data/runSigils.js`, `src/engine/progression/abyssProgression.js`, `src/engine/progression/codexEngine.js`, `src/engine/inventory/inventoryEngine.js`, `src/state/gameReducer.js` y `src/utils/storage.js`. El riesgo conceptual aca es alto aunque no se toque codigo: si se diseña retencion con reflejos de F2P toxico, se puede romper el mejor atributo actual del proyecto, que es tener un loop completo sin presion monetaria. La consigna correcta es la del prompt: preparar compatibilidad estructural futura, no meter presion de tienda ni sistemas de energia por adelantado.

### Findings

| ID | Categoria | Ubicacion | Problema | Causa raiz | Solucion | Impacto retencion | Complejidad | Riesgo | Referente | Prioridad | Proceder | Estado | Slice sugerido |
|----|-----------|-----------|----------|------------|----------|-------------------|-------------|--------|-----------|-----------|----------|--------|----------------|
| MR-01 | Retencion corta | `src/engine/sanctuary/jobEngine.js`, `src/engine/progression/goalEngine.js`, `src/components/combat/CombatGuidanceStrip.jsx`, `src/components/ExtractionOverlay.jsx` | El juego si cubre sesiones de `5-20m`, pero no siempre las comunica como una unidad emocional cerrada. | Los loops existen, pero estan repartidos entre combate, goals, extraccion y estaciones; falta framing comun. | Convertir los goals ya existentes en una `Session Arc` visible con arco corto (`5m`) y arco completo (`20m`) en vez de solo una tarjeta rotatoria. | alto | media | bajo | Diablo IV / Warframe | critico | si | pendiente | extender `EV-06` para que no sea solo guidance, sino objetivo de sesion y cierre corto |
| MR-02 | Retencion diaria | `src/engine/sanctuary/jobEngine.js`, busqueda global en `src` | Hay buen retorno intradia, pero no existe una razon explicita y amable para volver manana. | Hay timers de `15m -> 12h`, pero no hay `daily`, `weekly`, `streak`, `login` ni `calendar` en la base actual. | Sistema minimo: `Contratos semanales bancados` con catch-up, construido sobre `ACTIVE_GOALS`, no dailies descartables. | alto | media | bajo | Warframe Nightwave / Diablo IV Season Journey | critico | si | pendiente | tablero semanal de 3 contratos acumulables con progreso visible y recuperacion de lo no hecho |
| MR-03 | Retencion de mediano plazo | `src/data/activeGoals.js`, `src/engine/progression/goalEngine.js`, `src/engine/progression/codexEngine.js`, `src/engine/progression/abyssProgression.js`, `src/engine/sanctuary/blueprintEngine.js` | Hay metas de cuenta reales, pero estan demasiado distribuidas para sostener claramente `1-3 meses`. | `Codex`, `Abismo`, `Blueprints`, `Ecos` y goals viven en capas distintas sin una vista de cuenta unificada. | Crear una `Estanteria de Maestria` o `Ledger de Cuenta` que junte `Codex + Abyss + Blueprints + Prestige milestones`. | alto | media | bajo | Diablo IV / RuneScape | critico | si | pendiente | primer slice solo de surfacing, sin rewards nuevas |
| MR-04 | Prestige / claridad | `src/engine/progression/prestigeEngine.js`, `src/state/gameReducer.js`, `src/components/ExtractionOverlay.jsx`, `src/components/Prestige.jsx` | `Prestige` hoy se siente mas recompensa que castigo, lo cual es correcto, pero no siempre queda clarisimo que conservas y que pierdes. | La persistencia real existe, pero la comunicacion esta fragmentada entre `Extraction`, `Prestige` y `Santuario`. | Resumen previo y posterior al prestige: `que vuelve`, `que se consume`, `que se destraba`, `que cambia en la proxima run`. | alto | baja-media | bajo | Diablo IV / roguelite best practices | critico | si | pendiente | modal/resumen de prestige con delta corto y foco en proxima corrida |
| MR-05 | Prestige / variedad | `src/data/runSigils.js`, `src/engine/progression/abyssProgression.js` | Los `Sigils` si hacen que el segundo y tercer prestige sean distintos. Esto esta sano y no hay que aplanarlo. | Los sesgos de `Ascend / Hunt / Forge / Dominion` afectan XP, ecos, esencia, caza de poderes y economia de forja; `Abismo IV` incluso abre segundo slot. | Proteger esta identidad y mejorar solo su lectura. No reemplazarlo por bonus genericos de +X%. | medio-alto | baja | bajo | N/A | quick_win | si | pendiente | surfacing mas fuerte de `cuando elegir cada sigilo` y de `que cambia esta run` |
| MR-06 | Monetizacion etica | busqueda global en `src`, `src/state/gameReducer.js`, `src/components/*` | El loop central es completo sin pago y no encontre `dark patterns` activos. | No hay tienda, `offers`, `urgency`, `energy`, `rush premium`, `gacha` ni presion de compra en el codigo actual. | Mantener esto como principio explicito de producto antes de preparar cualquier seam monetizable. | alto | baja | bajo | Jagex 2025 / Diablo Immortal como anti-ejemplo | critico | si | pendiente | dejar guardrails escritos antes de tocar `stash`, `cosmetics` o `season systems` |
| MR-07 | QoL monetizable futuro | `src/engine/inventory/inventoryEngine.js`, `src/engine/stateInitializer.js`, `src/utils/storage.js` | Hay un `inventory cap` real (`50`), pero todavia no existe una arquitectura neutral de `stash tabs` o contenedores de cuenta. | El inventario actual es una sola lista ordenada y el save sigue siendo local JSON, no una capa de cuenta con contenedores. | Preparar `inventoryContainers` o `stash` por tabs sin vender nada todavia. Primero como estructura y UX de cuenta. | medio-alto | media | medio | Path of Exile stash tabs | media | si | pendiente | schema de contenedores + 1 tab gratuito base, sin tienda ni pricing |
| MR-08 | Cosmetics / identidad | `src/App.jsx`, `src/state/gameReducer.js`, ausencia de sistema dedicado en `src` | No hay hoy una capa clara de `apariencias`, `banner`, `perfil`, `wardrobe` o `transmog` donde algun dia quepan cosmeticos legitimos. | La identidad visible del jugador hoy depende casi solo de build, loot y tema claro/oscuro. | Preparar una capa minima de `AppearanceProfile` o `ProfileCard` antes que cualquier idea de cosmeticos. | medio | media | bajo | Warframe / battle-pass cosmetics | media | si | pendiente | perfil de cuenta muy chico con banner/paleta/titulos, sin tienda |
| MR-09 | Energia / resin | `src/engine/sanctuary/jobEngine.js`, loop real del juego | Un sistema tipo `resin` no encaja bien con este juego y hoy seria dano puro. | La cadencia natural ya la ponen el riesgo de extraccion, el cap de progreso de run y los timers del Santuario. Meter energia sumaria castigo artificial. | No preparar refill etico ni daily cap. Si hace falta pacing futuro, usar contratos, mastery o caps suaves de recompensas, no energia. | alto | baja | bajo | Genshin como contraste | critico | no | pendiente | explicitarlo como `no hacer` en backlog de producto |
| MR-10 | Longevidad / store-compatibility | `src/data/activeGoals.js`, `src/engine/progression/codexEngine.js`, `src/engine/progression/abyssProgression.js`, `src/utils/storage.js` | El juego ya tiene base para `1 mes`; para `3-6 meses` todavia le faltan capas de cuenta y una shell de temporada no intrusiva. | Hay mastery y account progression, pero no una capa que serialice eso en hitos visibles de mediano plazo. | Preparar `Season Ledger` no intrusivo y `Collection Shelf`, ambos construidos sobre progreso existente, no sobre tareas descartables. | alto | media | bajo | Diablo IV Season Journey / Warframe Nightwave | critico | si | pendiente | primero version gratis, sin premium tiers, con catch-up y progreso por jugar normal |

### 6.1 Auditoria de retencion por escala temporal

#### 5 minutos

- `Parcialmente cubierto`, pero no bien enmarcado.
- Hoy una micro-sesion satisfactoria existe si haces alguna de estas cosas:
- cobrar un claim del `Santuario`
- lanzar un job corto
- empujar `1-2` tiers y validar si hay upgrade
- cerrar una extraccion corta si ya venias encaminado
- El problema no es la ausencia de acciones; es la ausencia de framing. El juego no siempre te dice `esto fue una sesion valida`.
- Direccion minima:
- `Session Arc` corta visible
- `Siguiente mejor micro-accion`
- un cierre textual corto tipo `sesion cerrada: subiste X, destrabaste Y, dejas Z cocinando`

#### 20 minutos

- `Si cubierto`.
- El loop real de `20m` ya existe y es bueno:
- empujar expedicion
- evaluar loot y craft
- decidir extraccion
- volver a Santuario y procesar algo
- Este es probablemente el mejor tramo natural del juego hoy.
- Lo que falta no es sistema nuevo sino mejor surfacing de principio a fin.

#### 1 dia

- `Cobertura debil`.
- Los timers actuales sirven muy bien para `vuelve hoy mas tarde`:
- `Destileria`: `20m / 30m / 45m / 60m`
- `Encargos`: `15m / 1h / 4h`
- `Sigilos`: `2h / 6h / 12h`
- `Biblioteca`: hasta `3h`
- Eso no es lo mismo que `vuelve manana`.
- Hoy no hay una razon diaria clara que no sea simplemente `seguir progresando`.
- Sistema minimo recomendado:
- `Contratos semanales bancados` que puedas avanzar cualquier dia y recuperar si faltaste
- no `dailies`
- no `login reward`
- no `streak`

#### 1 semana

- `Cobertura parcial`.
- La semana hoy existe solo para jugadores ya enganchados en:
- `Prestige`
- `Codex`
- `Abismo`
- `Blueprints`
- Falta una capa visible de mediano plazo que lo verbalice.
- Sistema minimo recomendado:
- `Weekly Ledger` con `3` contratos persistentes
- catch-up de lo no hecho
- progreso por jugar el loop normal
- recompensas de cuenta, no power skip

#### 1 mes

- `Si cubierto`, aunque no para todo tipo de jugador.
- Hay suficientes capas reales para sostener un mes de juego si el jugador disfruta optimizar:
- arbol de `Ecos`
- `Resonancia`
- mastery del `Codex`
- unlocks de `Abismo`
- familias y `Blueprints`
- Lo que falta es surfacing de cuenta, no necesariamente mas sistemas.

### 6.2 Loops de prestige y reset

#### `Prestige`: recompensa o castigo

- Hoy se siente mas `recompensa` que `castigo`, y eso esta bien.
- Motivos:
- ganas `Ecos`
- empujas `Resonancia`
- conservas progreso persistente fuera de la run
- la siguiente corrida puede nacer sesgada por `Sigils`
- Riesgo actual:
- como ya se vio en `Tarea 5`, el prestige temprano puede ser demasiado generoso y comprimir el loop
- pero eso es un problema de pacing, no de fantasia

#### Que conserva y que pierde el jugador

- La respuesta sistemica esta bastante sana.
- El problema es de lectura:
- `ExtractionOverlay` explica parte
- `Prestige` explica parte
- `Santuario` materializa parte
- Falta una sola pantalla o resumen que diga con brutal claridad:
- `esto vuelve contigo`
- `esto se consume`
- `esto queda en cuenta`
- `esta sera la diferencia de tu proxima salida`

#### Los `Sigils` hacen distinto el segundo prestige

- `Si`, claramente.
- `Ascend` empuja nivel/tier/ecos.
- `Hunt` sesga la caza de poderes y mastery.
- `Forge` mejora economia y forja de run.
- `Dominion` empuja valor horizontal del Santuario.
- Ademas `Abismo IV` abre un segundo slot de sigil, lo que da una capa futura real y no cosmetica.
- Conclusión:
- no falta sistema aca
- falta `surfacing`, ayuda contextual y mejor momento ceremonial

#### Razones para hacer prestige mas alla de "suben los numeros"

- `Si existen`.
- Cambias:
- el sesgo de la proxima corrida
- el foco de tu caza
- la economia de forja
- el acceso a ramas meta y profundidad del Abismo
- Otra vez: el problema no es falta de razones, sino que no siempre estan empaquetadas como una decision grande y recordable.

### 6.3 Preparacion para monetizacion

#### `Stash tabs premium` estilo `PoE`

- `Parcialmente preparado`.
- A favor:
- hay `inventory cap` real
- el juego ya siente friccion legitima de espacio y clasificacion
- En contra:
- no existe todavia una arquitectura neutral de `stash tabs`
- el save sigue siendo local
- no hay contenedores de cuenta ni ownership mas rico
- Conclusión:
- si algun dia quieres `stash/QoL`, primero hace falta el seam tecnico
- no la tienda

#### `Cosmeticos` sin poder

- `No preparado` todavia.
- Falta una capa de identidad visual persistente donde un cosmetico tenga sentido.
- Antes que tienda, hace falta:
- `profile card`
- `banner / titulo / paleta`
- eventualmente `appearance slots`

#### `Energia / resin`

- `No recomendado`.
- El juego ya tiene pacing legitimo por:
- riesgo de run
- decision de extraccion
- timers del Santuario
- caps de progreso natural
- Agregar energia seria introducir presion artificial donde hoy no hace falta.

#### Loop completo sin pago

- `Si`.
- Esta es una de las mejores noticias de toda la auditoria.
- El juego se sostiene por si mismo sin venderte la solucion a un problema creado por el propio diseño.

#### `Dark patterns` actuales

- `No encontre` en el codigo vivo:
- no hay ofertas con urgencia falsa
- no hay `rush premium`
- no hay cuenta regresiva artificial de compra
- no hay `pay to progress`
- no hay `gacha`
- no hay compulsiones diarias de login
- Esto hay que protegerlo como decision de producto, no solo celebrarlo.

### 6.4 Longevity check

#### Por que alguien jugaria esto `1 mes`

- Porque ya existe un stack de progreso de cuenta razonable:
- `Prestige tree`
- `Resonancia`
- `Codex mastery`
- `Abyss unlocks`
- `Blueprint progression`
- Para el jugador correcto, eso ya alcanza.

#### Por que alguien jugaria esto `3 meses`

- `Respuesta parcial`.
- Hoy depende demasiado de que el jugador se autoimponga objetivos.
- Para sostener `3 meses` con mas seguridad falta:
- una capa visible de `mastery/collection`
- una cadencia semanal amable
- session arcs mas legibles
- mejor surfacing de metas acumulativas

#### Por que alguien jugaria esto `6 meses`

- `Hoy no hay una respuesta totalmente convincente`.
- No porque el juego sea corto, sino porque todavia no serializa bien el progreso largo en rituales de cuenta.
- Capas que faltan para responder mejor:
- `Collection shelf`
- `Season ledger` no intrusivo
- metas semanales bancadas
- mejor identidad persistente de cuenta
- quizas mas adelante algo de `social proof` no agresivo

### 6.5 Diseno para monetizacion futura, no monetizacion temprana

#### Lo que si conviene preparar

- `inventoryContainers` o `stash schema` neutral, sin pricing ni store
- `AppearanceProfile` minimo para identidad de cuenta
- `Season Ledger` gratis y no intrusivo, usando progreso real ya existente
- `Collection / Mastery shelf` que haga visible por que sigues jugando
- guardrails escritos de producto: `no pay-to-progress`, `no fake urgency`, `no resin`

#### Lo que no conviene preparar ahora

- `storefront`
- `offer engine`
- `premium rush`
- `energy/refill`
- `battle pass premium`
- cualquier sistema que premie mas la presencia diaria que la calidad de la sesion

#### Lectura sintetica

- `Design for compatibility` significa:
- que el juego pueda, si algun dia quieres, soportar `QoL`, `stash`, `cosmetics` y una capa tipo temporada
- sin que hoy dependa de eso
- y sin que la estructura futura obligue a reescribir medio save
- `No` significa empezar a monetizar ya ni introducir presion disfrazada de preparacion tecnica.

### Resumen de hallazgos

`Tarea 6` deja una conclusion bastante limpia:

- el juego ya cubre bien sesiones de `20m`
- cubre aceptablemente micro-sesiones, aunque no las nombra bien
- no cubre bien `vuelve manana` ni `vuelve esta semana` de forma visible
- `Prestige` esta bastante bien orientado como fantasia de recompensa
- los `Sigils` ya son una de las mejores herramientas de variedad sistémica del proyecto
- y, muy importante, el codigo actual esta sorprendentemente limpio de `dark patterns`

La lectura fuerte es esta:

- `Retencion`: falta mas surfacing y una cadencia semanal amable, no dailies compulsivos
- `Monetizacion futura`: falta preparar seams de `stash`, `appearance` y `season ledger`, pero no falta presionar al jugador
- `Longevidad`: hay buena respuesta para `1 mes`, respuesta parcial para `3 meses`, y respuesta todavia incompleta para `6 meses`

### Top 3 prioridades de implementacion

1. `MR-02` + `MR-10`: crear un `Weekly/Season Ledger` gratis, bancado y con catch-up, construido sobre `ACTIVE_GOALS`.
2. `MR-03`: surfacing de progreso de cuenta en una sola vista (`Codex + Abyss + Blueprints + Prestige milestones`).
3. `MR-04` + `MR-05`: volver `Prestige` y `Sigils` mas legibles y ceremoniales sin cambiar su contrato base.

### Riesgos de implementacion

- Si copias `dailies` o `streaks`, puedes empeorar un juego que hoy todavia se siente bastante honesto.
- Si preparas `stash` o `appearance` empezando por la tienda, vas a contaminar la lectura del loop antes de resolver el valor real.
- Si haces `Season Ledger` demasiado parecido a un `battle pass`, puedes meter ruido visual y ansiedad donde hoy necesitas claridad.
- Si intentas responder `6 meses` solo con mas contenido, sin mejorar account surfacing, el progreso largo seguira sintiendose difuso.

### Referentes usados en Tarea 6

- [WARFRAME - Nightwave: Intermission](https://www.warframe.com/news/nightwave-intermission)
- [WARFRAME Support - Foundry and Crafting FAQ](https://support.warframe.com/hc/en-us/articles/38385820873741-Foundry-and-Crafting-FAQ)
- [Path of Exile - Stash Tabs](https://www.pathofexile.com/shop/category/stash-tabs)
- [Path of Exile - About Item Filters](https://www.pathofexile.com/item-filter/about)
- [Diablo IV - Season 4: Loot Reborn](https://news.blizzard.com/en-us/article/24077223/galvanize-your-legend-in-season-4-loot-reborn)
- [Jagex - Community Vote on RuneScape Microtransactions](https://www.jagex.com/news/jagex-launches-major-community-vote-to-decide-the-future-of-runescape-s-microtransactions)
- [RuneScape Support - Loyalty points](https://support.runescape.com/hc/en-gb/articles/206853589-Loyalty-points)
- [RuneScape Support - RuneMetrics](https://support.runescape.com/hc/en-gb/articles/207719205-RuneMetrics)
- [GameSpot - Diablo Immortal Is Exactly What Fans Feared It Would Be](https://www.gamespot.com/articles/diablo-immortal-is-exactly-what-fans-feared-it-would-be/1100-6504870/)

Nota: para esta tarea use `Warframe` y `Diablo IV` como referentes de cadencia semanal/capitulo con progreso por jugar el loop normal; `PoE` para compatibilidad de `stash` y filtros; `Jagex/RuneScape` como señal de industria moviendose contra monetizacion que erosiona integridad del progreso; y `Diablo Immortal` como anti-ejemplo de monetizacion que vende avance en una capa clave de poder. Varias comparaciones de UX siguen siendo inferencias mias a partir de estos sistemas y no citas textuales.

---

## Tarea 7 - Performance y Arquitectura

### System Impact Note

Esta tarea cruza `src/App.jsx`, `src/hooks/useGame.js`, `src/utils/storage.js`, `src/state/gameReducer.js`, `src/engine/combat/processTickRuntime.js`, `src/components/Combat.jsx`, `src/components/Sanctuary.jsx`, `src/components/ExpeditionView.jsx`, `src/components/HeroView.jsx`, `src/components/RegistryView.jsx`, `src/components/Stats.jsx`, `src/components/Codex.jsx` y `src/engine/onboarding/onboardingEngine.js`. A diferencia de otras auditorias, aca el riesgo no es solo tecnico: una optimizacion mal enfocada puede volver el juego mas rapido pero mas confuso. Hay que separar tres capas distintas: `bundle/loading`, `rerenders/runtime` y `arquitectura para escalar`. Hoy el codigo tiene fortalezas reales en contenido data-driven, pero tambien varios hotspots de performance y algunos monolitos que van a bloquear crecimiento.

### Findings

| ID | Categoria | Ubicacion | Problema | Causa raiz | Solucion | Impacto jugador | Complejidad | Riesgo | Referente | Prioridad | Proceder | Estado | Slice sugerido |
|----|-----------|-----------|----------|------------|----------|-----------------|-------------|--------|-----------|-----------|----------|--------|----------------|
| PF-01 | Carga inicial | `src/App.jsx`, `src/components/Sanctuary.jsx`, build local `dist/assets/index-Berpf3jG.js` | El chunk principal sigue siendo demasiado grande: `951.51 kB` minificado / `243.98 kB` gzip. | `Sanctuary`, `ExtractionOverlay`, `OnboardingOverlay` y buena parte del shell critico entran eager en `App`, y `Sanctuary` a su vez importa overlays pesados sin lazy. | Empujar `Sanctuary` y overlays del hub a limites de carga mas finos. El objetivo no es mas code-splitting por deporte, sino achicar el critical path real. | alto | media | medio | Vite build local | critico | si | pendiente | lazy de overlays del Santuario y separar shell critico del hub pesado |
| PF-02 | Carga inicial | `src/components/ExpeditionView.jsx`, `src/components/HeroView.jsx`, `src/components/RegistryView.jsx`, build local | Los tabs ya son lazy, pero sus chunks siguen cargando subviews enteras aunque no esten activas. `ExpeditionView` pesa `145.95 kB`, `RegistryView` `70.59 kB`, `HeroView` `63.79 kB`. | Cada tab importa subpantallas pesadas eager (`Combat/Inventory/Codex/Crafting`, `Character/Skills/Talents`, `Achievements/Stats`). | Lazy interno por subview o al menos en las vistas mas pesadas. | medio-alto | media | bajo | Vite build local | alto | si | pendiente | dividir `ExpeditionView` y `RegistryView` por subview pesada primero |
| PF-03 | Rerenders | `src/App.jsx`, `src/components/ExpeditionView.jsx`, `src/components/HeroView.jsx`, `src/components/RegistryView.jsx` | La superficie de rerender principal es demasiado grande: `App` recibe el estado entero y vuelve a renderizar header, nav y tab activa en cada tick/cambio. | El arbol se alimenta con `state` completo sin boundaries mas finos ni selectors. | Introducir boundaries mas estrictos por tab, memoizar shell estable y pasar slices mas chicos. | alto | media-alta | medio | N/A | critico | si | pendiente | `AppShell` estable + render de tab por slice, no por `state` entero |
| PF-04 | Runtime | `src/components/Combat.jsx` | `Combat` se fuerza a rerenderizar cada `120ms` solo para refrescar FX temporales (`setCombatFxNow(Date.now())`). | El estado visual efimero de efectos vive como state React en un componente ya pesado. | Mover ese reloj a CSS/RAF local o derivar expiracion sin rerender completo del panel. | alto | baja-media | bajo | N/A | critico | si | pendiente | sacar el intervalo de `120ms` del componente principal de combate |
| PF-05 | Persistencia | `src/hooks/useGame.js`, `src/utils/storage.js` | El save sigue serializando el estado completo a `localStorage` cada ~`1.8s` en produccion cuando hay actividad. | `saveGame(serializeSaveGame(data))` trabaja sobre el arbol entero y no hay exclusion de campos ni compresion. | Separar `persistedState` de `runtimeState`, excluir caches/telemetria efimera y revisar cadencia. | medio-alto | media | medio | N/A | alto | si | pendiente | primer pase: whitelist de persistencia + save cadence mas consciente del phase |
| PF-06 | Tick | `src/hooks/useGame.js`, `src/constants.js`, `src/state/gameReducer.js` | El tick activo usa `setInterval` de `1000ms` sin reconciliacion de atraso visible. Si la pestaña esta visible pero la CPU se atrasa, la simulacion simplemente se enlentece. | No existe un modelo de delta ni catch-up para lag visible; solo hay recuperacion offline por `hidden/pagehide`. | Decidir politica explicitamente: slowdown aceptado o catch-up acotado para active-tab stalls. | medio | media | medio | N/A | medio | si | pendiente | definir contrato del tick antes de optimizar micro-costos |
| PF-07 | Runtime / tooling | `src/components/Stats.jsx` | `Stats/System` es una vista muy costosa cuando esta abierta: construye telemetria, replay reports, `serializeSaveGame`, `JSON.stringify(...)` y datasets completos ante cada cambio de `state`. | Casi todos los `useMemo` dependen del `state` entero, asi que invalidan en cada tick. | Partir `Stats` en paneles lazy o calcular heavy reports solo al expandir secciones o al pedir export. | medio | media | bajo | N/A | alto | si | pendiente | gating por seccion abierta y export on-demand |
| PF-08 | Runtime / listeners | `src/components/*`, `src/App.jsx` | Hay muchos listeners duplicados de `resize` y varios relojes de `1s` repartidos por vistas grandes y overlays (`Sanctuary`, `Codex`, `Laboratory`, `Distillery`, `Encargos`, `SigilAltar`). | Cada componente resolvio su propio `isMobile` / `now` local. | Crear `ViewportContext` y una estrategia comun de `relativeTime` para overlays. | medio | baja-media | bajo | N/A | medio | si | pendiente | unificar `isMobile` y relojes de countdown |
| PF-09 | Arquitectura | `src/data/classes.js`, `src/data/runSigils.js`, `src/data/activeGoals.js`, `src/engine/progression/abyssProgression.js`, `src/engine/sanctuary/jobEngine.js` | La parte de contenido esta bastante lista para escalar: clases/specs, goals, sigils, abyss unlocks, familias y contratos ya son mayormente data-driven. | Se modelaron varios sistemas como catalogos y no como condiciones hardcodeadas dispersas. | Proteger este enfoque y no re-hardcodear nuevas capas en componentes grandes. | medio-alto | baja | bajo | N/A | quick_win | si | pendiente | usar estos catalogos como patron base para futuras expansiones |
| PF-10 | Escalabilidad | `src/state/gameReducer.js`, `src/engine/onboarding/onboardingEngine.js`, `src/components/Sanctuary.jsx`, `src/components/Combat.jsx`, `src/components/Crafting.jsx` | Las capas de orquestacion se estan volviendo monolitos: `gameReducer` `3678` lineas, `onboardingEngine` `2748`, `Sanctuary` `2289`, `Combat` `1948`, `Crafting` `1509`. | El crecimiento se fue absorbiendo en archivos centrales en vez de partirse por dominio o por action families. | Modularizar por dominios antes de seguir sumando tipos de crafting, tutorial beats o subflujos de hub. | alto | alta | medio | N/A | critico | si | pendiente | extraer `gameReducer` por namespaces y partir `onboarding` por step families |
| PF-11 | Escalabilidad | `src/components/Codex.jsx`, `src/components/Stats.jsx`, `src/components/Achievements.jsx`, `src/components/Inventory.jsx` | No hay virtualizacion ni paginacion real en vistas que van a crecer. Hoy no rompe todo, pero si el contenido aumenta, `Codex/Stats` van a sufrir antes que `Inventory`. | Las listas actuales se renderizan completas y varias incluyen bloques ricos con mapas internos. | Plan minimo de `collapse + pagination + section gating`; no hace falta virtualizar todo hoy. | medio | media | bajo | N/A | medio | si | pendiente | empezar por `Codex` y `Stats`, no por `Inventory` de `50` items |
| PF-12 | Carga inicial | busqueda global en `src`, build local | No encontre cuellos de botella por assets, fuentes o media pesada. El problema principal de carga es codigo JS propio, no recursos estaticos. | El proyecto casi no importa imagenes/fuentes; el peso viene del codigo de app. | Enfocar optimizacion en chunking y render path, no en una caceria de assets inexistentes. | medio | baja | bajo | build local | quick_win | si | pendiente | evitar perder tiempo optimizando lo que no es el cuello real |

### 7.1 Re-renders innecesarios

#### Superficie principal

- `App` vuelve a renderizar con cada cambio de `state` y recalcula cosas operativas incluso cuando no cambian de forma material:
- `inventoryUpgrades`
- `resourceSummary`
- `visiblePrimaryTabs`
- render completo de la tab activa
- Esto significa que el costo del tick no vive solo en `processTick`; tambien vive en el arbol React que consume ese estado global.

#### Casos concretos

- `Combat` tiene un intervalo cada `120ms` que actualiza `combatFxNow`, lo cual fuerza rerender del componente completo.
- `Stats` depende del `state` entero para serializar save, telemetria y replay texts.
- Muchas pantallas resuelven `isMobile` localmente con su propio listener de `resize`.
- Varias overlays y vistas grandes hacen `setNow(Date.now())` cada `1s`.

#### Lectura

- No veo una plaga de `useMemo/useCallback` faltantes en todos lados. De hecho hay bastante memo puntual.
- El problema de fondo no es “faltan hooks de memo”.
- El problema es `gran superficie de invalidacion`.

### 7.2 El tick de combate

#### Lo que esta bien

- El tick vive globalmente en `useGame`, no depende de que `Combat` este montado.
- Hay tratamiento de `hidden/pagehide/beforeunload`.
- El progreso offline se chunkifica en lotes de `120` ticks con `setTimeout(step, 0)`, lo cual evita congelar completamente la UI de golpe.

#### Lo que no esta resuelto del todo

- El tick activo usa `setInterval(..., TICK_MS)` con `TICK_MS = 1000`.
- Si la pestaña esta visible y el main thread se atrasa, no hay reconciliacion de atraso.
- En ese caso el juego “corre mas lento” en vez de “ponerse al dia”.
- Eso puede ser decision valida, pero hoy no esta explicitado como contrato de simulacion.

#### Riesgo

- Si luego quieres subir la complejidad del tick o meter mas presentacion reactiva, el margen de seguridad baja rapido.
- `processTickRuntime.js` ya tiene `1894` lineas; no es un tick trivial.

### 7.3 Persistencia y save

#### Lo que esta sano

- El acceso a `localStorage` ya esta hardenizado.
- Hay flush en `visibilitychange`, `pagehide`, `beforeunload` y cleanup.
- `projectDispatch` permite persistir algunos bordes criticos sin depender de la cola normal.

#### Lo que pesa

- Se sigue serializando el arbol entero del estado.
- No hay `persisted whitelist`.
- No hay compresion.
- No hay separacion clara entre:
- estado de producto que debe persistir
- caches o reportes derivados
- telemetria efimera
- tooling/debug

#### Lectura

- Hoy probablemente sigue siendo viable en volumen, pero es una deuda real.
- No hace falta esperar a que el save “explote” para separarlo mejor.

### 7.4 Carga inicial

#### Lo que si existe

- Hay `lazy` para tabs primarias y algunos overlays (`Codex/Laboratory` wrappers).
- No hay assets pesados, tipografias custom ni media importada que bloqueen el primer render.

#### Lo que sigue mal

- El build local sigue avisando chunk demasiado grande.
- El peso principal viene del JS de aplicacion.
- `Sanctuary` sigue en el path critico y trae mucho mas de lo que el primer paint necesita.
- Dentro de tabs lazy, varias subviews siguen entrando juntas.

#### Conclusión

- El problema de carga no es “frontend media-heavy”.
- Es `codigo de app` demasiado grande en los limites equivocados.

### 7.5 Escalabilidad arquitectonica

#### Donde esta lista

- `Clases / specs`: razonablemente data-driven
- `Sigils`: data-driven
- `Goals`: data-driven
- `Abyss unlocks`: data-driven
- `Item families`: data-driven
- `Errands / jobs base`: bastante data-driven

#### Donde va a colapsar primero

- `Onboarding`: agregar beats nuevos sigue exigiendo tocar engine, guards de tabs, componentes y a veces copias en varios lugares.
- `Reducer`: nuevos tipos de crafting, contracts o subflows siguen cayendo en un `switch` enorme.
- `Tabs / subflows`: `App` + tab routing + onboarding allowlists + spotlight targets forman un acoplamiento alto.
- `Santuario`: ya concentra demasiado ownership visual y tutorial.

#### Lectura

- El juego esta mejor preparado para agregar `contenido` que para agregar `orquestacion`.
- Eso es una muy buena noticia a medias:
- escalar catalogos sera relativamente barato
- escalar reglas de navegacion, tutorial y runtime no

### 7.6 Deuda tecnica prioritaria

#### Ya impacta al jugador

- `PF-01` bundle critico grande
- `PF-03` rerender global amplio
- `PF-04` timer de `120ms` en `Combat`
- `PF-05` persistencia de estado entero

#### Todavia no pega fuerte, pero va a bloquear evolucion

- `PF-02` subviews lazy insuficientes
- `PF-10` monolitos de reducer/onboarding/componentes
- `PF-11` falta de plan para listas crecientes

#### Tolerable por ahora

- `PF-08` listeners/time sources duplicados
- `PF-12` no requiere trabajo porque no hay bottleneck de assets
- parte de `PF-06`, siempre que aceptes explicitamente el contrato actual del tick

### Resumen de hallazgos

`Tarea 7` deja una foto bastante clara:

- el juego no tiene un problema principal de assets, sino de `bundle + render surface`
- el lazy loading existe, pero todavia demasiado arriba y no siempre en los limites correctos
- el tick central no esta obviamente roto, pero comparte presupuesto con una UI que se invalida mas de la cuenta
- la persistencia esta endurecida contra fallos, pero sigue siendo demasiado “estado completo -> JSON completo”
- y la arquitectura esta mejor preparada para sumar `contenido data-driven` que para seguir sumando `orquestacion y flujo`

La conclusion fuerte es esta:

- si mañana quisieras optimizar solo `processTick`, te quedarias corto
- si mañana quisieras solo “meter React.memo en todo”, tambien te quedarias corto
- lo que mas retorno promete es `achicar el critical path`, `reducir la superficie de rerender`, y `modularizar los monolitos que ya sostienen demasiado`

### Top 3 prioridades de implementacion

1. `PF-01` + `PF-02`: bajar el peso real de carga con split de `Sanctuary`/overlays y subviews pesadas internas.
2. `PF-03` + `PF-04`: reducir rerenders globales y sacar el reloj de `120ms` de `Combat`.
3. `PF-05` + `PF-10`: separar `persistedState` de runtime y empezar a modularizar reducer/onboarding antes de seguir creciendo sistemas.

### Riesgos de implementacion

- Si haces code-splitting sin criterio, puedes introducir flashes y peores transiciones de UX sin resolver el cuello real.
- Si haces memoizacion quirurgica sin cambiar boundaries, vas a ganar poco y complicar mucho el codigo.
- Si partes `gameReducer` y `onboarding` demasiado temprano sin ownership claro por dominio, puedes mover el caos en vez de reducirlo.
- Si optimizas listas antes de tocar bundle/rerenders globales, estaras atacando un cuello secundario.

### Medicion usada en Tarea 7

- `npm run build` local:
- `dist/assets/index-Berpf3jG.js` `951.51 kB` minificado / `243.98 kB` gzip
- `ExpeditionView` `145.95 kB`
- `RegistryView` `70.59 kB`
- `HeroView` `63.79 kB`
- `Codex` `45.18 kB`
- `Prestige` `23.13 kB`
- `Laboratory` `16.92 kB`
- No se detectaron imports de assets/media pesados en `src`.

---

## Tarea 8 - Top 5 Riesgos Estructurales

### System Impact Note

Esta seccion no descubre sistemas nuevos: consolida el peligro real que aparece cuando cruzas `UX`, `sistemas`, `economia`, `retencion` y `arquitectura` al mismo tiempo. La idea no es listar “cosas feas”, sino identificar que fallas podrian deformar la identidad del juego si no se corrigen a mediano plazo. Cada riesgo de aca reutiliza hallazgos ya detectados (`UX-*`, `SY-*`, `EV-*`, `EC-*`, `MR-*`, `PF-*`) y esta redactado para que luego entre limpio al `AUDIT_MASTER.md`.

### Registro de Riesgos

| ID | Riesgo estructural | Hallazgos fuente | Como se manifestaria | Por que es peligroso | Primera maniobra correcta | Prioridad |
|----|--------------------|------------------|----------------------|----------------------|---------------------------|-----------|
| RS-01 | El juego se convierta en `tablero administrativo` en vez de `extraction loop` | `UX-03`, `SY-07`, `EV-08`, `MR-01` | Sesiones donde el jugador entra a reclamar, relanzar y verificar estados mas de lo que decide empujar/extractar. | Desplaza el centro emocional desde `riesgo/recompensa` hacia `mantenimiento de cuenta`. Mata la fantasia mas diferencial del proyecto. | Compactar `Santuario`, fusionar operacion repetitiva y proteger `Extraccion` como pico real de decision. | critico |
| RS-02 | El crafting se vuelva una `sopa de operaciones` sin ownership claro | `UX-02`, `SY-01`, `EV-04`, `EV-05`, `EC-05`, `EC-06` | Mas capas de craft agregadas sobre un contrato ya difuso: `reroll` en run, forja pesada en hub, costos discutibles, falta de fantasia legible. | Cuando el jugador no entiende donde se decide una pieza, todo el sistema pasa de profundo a arbitrario. | Fijar ownership fuerte: run tactica, `Deep Forge` pesado, y explicitar contrato actual antes de sumar mas acciones. | critico |
| RS-03 | La progresion larga no se sienta como `cuenta que crece`, sino como sistemas paralelos sueltos | `MR-02`, `MR-03`, `MR-04`, `MR-10`, `EV-06` | El jugador percibe `Codex`, `Abismo`, `Blueprints`, `Ecos` y goals como cosas separadas, no como una linea de mastery coherente. | Debilita retorno a `1-3 meses`; el jugador sigue por voluntad propia, no porque la cuenta le devuelva un relato claro. | `Weekly Ledger` amable + vista unificada de progreso de cuenta antes de pensar en temporada larga. | critico |
| RS-04 | El loop de recompensa se degrade a `ruido + clasificacion de basura` | `SY-02`, `EC-01`, `EC-03`, `EC-07`, `EC-08` | Mas drops, mas overflow, mas gold raro por fase, prestige temprano generoso y lectura de poder insuficiente. | Si el chase pierde nitidez, el jugador deja de sentir picos y empieza a gestionar residuos. | Fortalecer `loot filter`, overflow, pacing de prestige y lectura build-aware antes de aumentar volumen o complejidad. | critico |
| RS-05 | La arquitectura no soporte la siguiente ola de crecimiento sin bajar calidad y velocidad | `PF-01`, `PF-03`, `PF-05`, `PF-10`, parte de `PF-11` | Cada feature nueva agranda bundle, rerender global, reducer/onboarding monoliticos y costo mental del cambio. | No solo frena desarrollo: tambien aumenta el riesgo de regresiones, bugs de tutorial y performance mediocre en mobile. | Achicar critical path, cortar monolitos por dominio y separar `persistedState` de runtime antes de seguir sumando sistemas. | critico |

### 1. Riesgo de Hub Administrativo

#### Lectura

- Este es el riesgo mas peligroso para la identidad del juego.
- El proyecto tiene una tesis fuerte: `Santuario -> Expedicion -> Extraccion -> Santuario`.
- Si `Santuario` sigue acumulando friccion operativa y capas de mantenimiento, el loop se invierte:
- entras para administrar
- sales a farmear porque hay que alimentar la administracion
- vuelves a administrar otra vez

#### Senales tempranas

- mas scroll que decision
- mas `claim/restart/open/check` que elecciones de costo de oportunidad
- jugadores que describen la sesion como “limpiar pendientes”

#### Que no hacer

- no agregar mas estaciones por reflejo
- no meter otra card operativa para resolver cada necesidad

#### Primera maniobra correcta

- compactar `Santuario`
- batch de operaciones de bajo riesgo
- dejar el detalle largo como opt-in
- reforzar solo las decisiones persistentes de alto valor

### 2. Riesgo de Crafting sin Contrato Claro

#### Lectura

- El crafting hoy tiene potencia, pero su frontera es borrosa.
- La run ya tiene demasiado valor decisional para encima cargar tambien con toda la cirugia pesada de pieza.
- Si se agregan mas capas sin fijar ownership, vas a terminar con un sistema mas grande y menos comprensible.

#### Senales tempranas

- preguntas frecuentes del tipo “cuando conviene hacer esto aca o en el Santuario?”
- operaciones obvias dominantes (`polish`) y otras postergadas (`reforge`)
- jugador sintiendo arbitrariedad mas que mastery

#### Primera maniobra correcta

- `Deep Forge` como hogar real del craft pesado
- run para tactica, equip, upgrade rapido y evaluacion
- copy/UI que explique el contrato actual sin fantasia prestada de otros juegos

### 3. Riesgo de Progresion Larga Fragmentada

#### Lectura

- Hay muchas capas buenas de progreso.
- El problema no es falta de sistemas; es falta de serializacion narrativa.
- Si el jugador no puede responder facil “que esta creciendo en mi cuenta”, la retencion larga queda delegada a jugadores muy motivados.

#### Senales tempranas

- sesiones largas pero sin razon clara para volver manana
- jugadores que disfrutan una capa y olvidan las otras
- sensacion de “mucho sistema, poco hilo conductor”

#### Primera maniobra correcta

- `Weekly Ledger` sin ansiedad
- vista de cuenta unica
- resumen claro de `Prestige`
- no `dailies`, no `streaks`, no `login chores`

### 4. Riesgo de Recompensa Ruidosa

#### Lectura

- Este riesgo no es solo de loot.
- Es la combinacion de:
- demasiada senal debil
- poco filtro
- overflow pobre
- economia con roles desbalanceados por fase
- pacing de prestige tempranamente generoso

#### Resultado si se deja crecer

- el jugador deja de perseguir “la pieza correcta”
- pasa a clasificar volumen
- el premio deja de sentirse escaso y empieza a sentirse pesado

#### Primera maniobra correcta

- terminar `loot filter`
- fortalecer surface de overflow
- bajar ruido sin bajar dopamina
- hacer que el poder sea mas legible para que el chase se entienda

### 5. Riesgo de Estrangulamiento Arquitectonico

#### Lectura

- El juego todavia puede crecer, pero cada capa nueva cuesta demasiado en los puntos de orquestacion.
- El contenido data-driven esta razonablemente sano.
- Lo que no escala bien es el armazon que conecta todo:
- `App`
- `gameReducer`
- `onboardingEngine`
- componentes-hub monoliticos

#### Senales tempranas

- cada cambio toca demasiados archivos centrales
- tutorial y tabs se rompen juntos
- optimizar UX implica tambien tocar performance y viceversa
- miedo a cambiar cosas legitimas por riesgo de regresion

#### Primera maniobra correcta

- bajar bundle critico
- reducir rerender global
- separar estado persistente de runtime
- modularizar por dominio antes de sumar mas sistemas grandes

### Resumen de hallazgos

Los `5` riesgos mas serios no apuntan todos al mismo lugar.

- `RS-01` protege la identidad del loop
- `RS-02` protege la profundidad real del crafting
- `RS-03` protege la retencion de mediano-largo plazo
- `RS-04` protege la calidad del reward loop
- `RS-05` protege la capacidad del proyecto para seguir mejorando sin degradarse

La conclusion fuerte es esta:

- si no corriges `RS-01`, el juego puede volverse mantenimiento
- si no corriges `RS-02`, el juego puede volverse confuso
- si no corriges `RS-03`, el juego puede volverse corto aunque tenga muchos sistemas
- si no corriges `RS-04`, el juego puede volverse ruidoso
- si no corriges `RS-05`, el juego puede volverse lento de evolucionar y fragil

### Top 3 prioridades de mitigacion

1. Mitigar `RS-01` y `RS-02`: `Santuario` compacto + ownership fuerte del crafting.
2. Mitigar `RS-03` y `RS-04`: `Weekly Ledger`, progreso de cuenta visible, loot filter y lectura build-aware.
3. Mitigar `RS-05`: critical path mas chico, menos rerender global y modularizacion de orquestacion.

---

## Tarea 9 - Vision del Juego a 1 Ano

### System Impact Note

Esta vision no es un roadmap de features sueltas. Es una imagen objetivo para evaluar si las decisiones de producto de los proximos meses fortalecen o deforman el loop central. Todo lo que aparece aca sale de las tareas anteriores: no imagina un juego mas grande por reflejo, sino un juego mas claro, mas profundo y mejor serializado. Si en algun momento una idea nueva no encaja con esta vision, eso deberia ser una señal de alerta y no una excusa para seguir agregando capas.

### Vision sintetica

Dentro de `1 ano`, este juego deberia sentirse como un `extraction-lite idle ARPG` con combate automatico, decisiones de riesgo/recompensa reales, y una capa persistente de cuenta mucho mas legible que hoy.

La fantasia no deberia ser:
- “manejo una planilla de timers”
- ni “veo un idle que farmea solo”
- ni “copio a PoE/Warframe por partes”

La fantasia deberia ser:
- `preparo una salida`
- `empujo una expedicion`
- `decido que rescato y cuando cierro`
- `vuelvo al Santuario con valor real`
- `hago crecer una cuenta que se siente cada vez mas mia`

### 1. Como se deberia ver el juego

#### `Santuario`

- El `Santuario` deberia verse como una consola operativa compacta, no como una pared de cards.
- Arriba del fold deberian vivir solo `3` cosas:
- `Listo ahora`
- `En curso`
- `Siguiente salida`
- Las estaciones existirian, pero como una segunda capa:
- mas limpias
- mas resumidas
- mas orientadas a decidir que abrir, no a leer bloques largos

#### `Expedicion`

- `Expedicion` deberia verse mas tensa y mas clara.
- El combate seguiria siendo automatico, pero no pasivo.
- El jugador deberia leer con mas facilidad:
- si esta estable o no
- si conviene empujar o cerrar
- si aparecio una pieza prometedora
- si la corrida tiene objetivo de `push`, `hunt`, `forge` o `prestige`

#### `Extraccion`

- `Extraccion` deberia seguir siendo una de las mejores pantallas del juego.
- No deberia diluirse con tutoriales largos ni con mas clicks de burocracia.
- Deberia volverse aun mas ritual:
- `que bundles persisten`
- `que item rescatas`
- `que dejas ir`
- `si te vas ya o por codicia sigues un poco mas`

### 2. Que sistemas deberia tener

#### Sistemas que si deberian existir

- `Santuario compacto`
- `Deep Forge` como hogar del crafting pesado
- `Loot filter` simple pero real
- `Session Arc` visible
- `Weekly Ledger` bancado con catch-up
- `Vista unificada de progreso de cuenta`
- `Codex + Abyss + Blueprints + Ecos` mucho mejor serializados
- `Prestige` con resumen claro de perdida/conservacion/next run
- `Sigils` mejor surfacing y mas ceremonia
- `Collection / Mastery shelf`

#### Sistemas que podrian existir si primero madura la base

- `Season Ledger` largo, no intrusivo
- `Stash schema` neutral
- `AppearanceProfile`
- una capa ligera de `social proof` no agresivo

#### Sistemas que no deberian ser el norte

- `energy/resin`
- `dailies` compulsivos
- `premium rush`
- `offer engine`
- mas currencies sin nueva decision real
- crafting agregado solo para “tener mas crafting”

### 3. Que tono de UX deberia tener

#### Tono general

- Mas sobrio en lo operativo.
- Mas enfatico en los picos.
- Mas corto en el copy.
- Mas claro en la causalidad.

#### Traduccion practica

- cosas comunes: rapidas, silenciosas, limpias
- cosas importantes: ceremoniales, reconocibles, memorables
- menos explicacion redundante
- menos scroll obligatorio
- menos superficies que compiten entre si

#### Mobile

- thumb-first de verdad
- acciones frecuentes abajo
- overlays coherentes
- menos tap hunting
- menos dependencia en `title=` o detalles escondidos

### 4. Que retencion deberia lograr

#### `5 minutos`

- Una micro-sesion valida:
- reclamar algo
- decidir una accion util
- mirar una `Session Arc`
- dejar la siguiente palanca lista

#### `20 minutos`

- Una sesion completa:
- empuje
- loot
- tension
- extraccion
- resolucion ligera en Santuario

#### `1 dia`

- Retorno amable por:
- timers de Santuario
- objetivos bancados
- progreso de cuenta visible
- no por castigo de login

#### `1 semana`

- Ritmo de mediano plazo sostenido por:
- `Weekly Ledger`
- hitos de mastery
- metas de build/chase

#### `1-3 meses`

- Retencion por:
- progreso transversal real
- identidad de cuenta
- mejora de build
- chase de piezas y powers
- profundizacion en `Codex`, `Abismo`, `Blueprints` y `Ecos`

#### `6 meses y mas`

- Solo deberia intentar sostenerse si ya logro:
- una cuenta claramente serializada
- una shell estacional no intrusiva
- mastery visible
- una identidad diferencial clara

### 5. Cual deberia ser su identidad diferencial

Este juego no deberia intentar ganar por cantidad de sistemas.

Deberia diferenciarse por esta mezcla:
- combate automatico que aun exige lectura
- `Extraccion` como decision central
- `Santuario` persistente que procesa valor sin comerse la fantasia
- `Prestige` que cambia la intencion de la siguiente run
- un tono de UX mas limpio y menos gritón que muchos F2P/idle

Si eso sale bien, la propuesta diferencial seria bastante nitida:

`un ARPG idle de extraccion, con cuenta persistente fuerte, donde las mejores decisiones no son spamear clicks sino saber empujar, saber cerrar y saber convertir lo rescatado en progreso real`

### 6. Lo que no deberia pasar

Dentro de un ano, el juego no deberia haberse convertido en:

- un `Santuario simulator`
- un `crafting spreadsheet`
- un idle de ruido y overflow
- una UI pesada donde todo compite por tu atencion
- un juego con monetizacion “lista” pero loop debilitado

Si alguna expansion te acerca a eso, es una mala expansion aunque agregue contenido.

### Resumen de hallazgos

La vision correcta a `1 ano` no es un juego mucho mas grande.

Es un juego:
- mas compacto
- mas legible
- mas intencional
- mas ritual en sus picos
- mas claro en su cuenta

La mejor version de este proyecto dentro de un ano seria una donde:
- `Santuario` ya no fatiga
- `Extraccion` sigue siendo el mejor pico de decision
- `Deep Forge` ordena el crafting
- el progreso largo se entiende de un vistazo
- y la retencion nace de mastery, no de presion

### Top 3 pilares para llegar a esta vision

1. Proteger el loop central: `Santuario compacto -> Expedicion tensa -> Extraccion fuerte`.
2. Serializar mejor la cuenta: `Weekly Ledger`, mastery shelf, prestige claro, progreso transversal visible.
3. Bajar friccion y fragilidad: menos ruido, menos monolitos, mejor performance, mejor ownership de sistemas.

---

## Backlog Ejecutable Actual

Este bloque no reemplaza la auditoria. Resume la mejor secuencia para implementar sin reabrir analisis.

### P1

- `RS-01` proteger el loop de `hub administrativo`
- `RS-02` fijar ownership claro del crafting
- `SY-02` Surface fuerte para overflow de inventario
- `SY-08` Seed post-onboarding para balance batch, QA automatizado y paridad real del `balanceBot`
- `UX-03` Compactacion de `Santuario`
- `UX-06` Feedback compartido para claims y acciones silenciosas
- `EV-06` `Session Arc` visible usando los goals actuales
- `EV-07` Loot filter basico sobre `lootRules`
- `EV-03` Cap y surfacing real de `familyCharges`
- `MR-02` `Weekly Ledger` bancado con catch-up usando `ACTIVE_GOALS`
- `MR-03` vista unificada de progreso de cuenta (`Codex + Abyss + Blueprints + Prestige`)
- `PF-01` bajar el chunk critico real (`Sanctuary` + overlays eager)
- `PF-03` reducir superficie de rerender global desde `App`
- `PF-04` sacar el timer de `120ms` del componente `Combat`

### P2

- `RS-03` serializar mejor la progresion larga de cuenta
- `RS-04` bajar ruido del reward loop antes de agregar mas volumen
- `SY-05` Revisar pacing de `Prestige` y primer spike meta
- `SY-07` Reducir mantenimiento operativo del `Santuario`
- `UX-02` Resolver arquitectura de `Forja`
- `UX-05` `OverlayShell` comun
- `EV-05` Mover `reroll` a `Deep Forge`
- `EV-04` `Lente de Escrutinio` MVP en `ExtractionOverlay`
- `EV-01` Escalera de feedback para `level up / legendary / boss / prestige`
- `EV-08` `Loop v2` centrado en `Santuario -> Expedicion -> Extraccion`
- `EC-05` Retune de ladder `polish / reforge / ascend`
- `EC-08` Lectura build-aware de `item / craft / spec`
- `MR-04` resumen claro de `que conservas / que pierdes` en `Prestige`
- `MR-05` surfacing fuerte y ceremonial de `Sigils`
- `PF-02` lazy interno por subview pesada (`Expedition`, `Heroe`, `Mas`)
- `PF-05` separar `persistedState` de runtime y podar save
- `PF-10` modularizar `gameReducer` y `onboarding` por dominio
- `PF-08` unificar `resize` / `isMobile` / relojes de countdown

### P3

- `RS-05` bajar fragilidad estructural antes de proxima expansion grande
- `SY-01` Definir contrato largo de `Crafting`
- `SY-03` Decidir permanencia total vs `Blueprint Aging`
- `SY-04` Resolver politica de migracion legacy de talentos
- `SY-06` Telemetria / sampling de distribucion de loot
- `EC-01` Darle rol tardio a `gold` sin romper early-mid
- `EC-02` Suavizar brackets de XP
- `UX-01` Limpieza de `Mas`
- `UX-04` `ContextTray` mobile
- `UX-08` hints mobile sin `title=`
- `EV-02` Validar si el juego realmente necesita `Blueprint aging` o solo indicador de vigencia
- `EV-05` Evaluar `fuse / corrupt` solo despues de mover `reroll` y validar `Deep Forge`
- `MR-07` preparar schema neutral de `stash / inventoryContainers`
- `MR-08` preparar `AppearanceProfile / ProfileCard` para identidad futura, sin tienda
- `MR-10` evaluar `Season Ledger` largo o shell de temporada solo despues del `Weekly Ledger`
- `PF-06` decidir politica formal del tick ante lag visible
- `PF-11` paginacion/section gating para `Codex` y `Stats`

### Regla de ejecucion sugerida

1. Resolver primero problemas de lectura operativa (`Santuario`, feedback, overlays).
2. Luego resolver navegacion opaca (`Forja`, `Mas`).
3. En paralelo, bajar costo tecnico obvio (`bundle critico`, `rerender global`, `Combat 120ms`, `save completo`).
4. Luego mover tension sistemica (`reroll` fuera de run, `Session Arc`, loot filter, Lente).
5. Despues agregar retencion amable de mediano plazo (`Weekly Ledger`, vista de cuenta, resumen de prestige).
6. Recien despues preparar seams de `stash`, `appearance` o temporada.

---

## Estado del documento

- `Fase 0`: consolidada
- `Tarea 1`: consolidada e implementada
- `Tarea 2`: consolidada, sin implementacion todavia
- `Tarea 3`: consolidada, sin implementacion todavia
- `Tarea 4`: consolidada, sin implementacion todavia
- `Tarea 5`: consolidada, sin implementacion todavia
- `Tarea 6`: consolidada, sin implementacion todavia
- `Tarea 7`: consolidada, sin implementacion todavia
- `Tarea 8`: consolidada, sin implementacion todavia
- `Tarea 9`: consolidada, sin implementacion todavia
