# MVP De Idle RPG Extraction: Plan Completo De Implementación

Fecha: 2026-04-18  
Objetivo: definir exactamente qué hay que refactorizar y construir para llevar el juego actual a un **MVP de RPG idle extraction-lite**, sin rehacer todo el proyecto de una vez.

## Resumen Ejecutivo

Sí: para que esta visión quede bien implementada, el juego tiene que dejar de sentirse como:

`Combat + menús`

y pasar a sentirse como:

`Santuario -> Expedición -> Extracción -> Santuario`

Pero para el MVP no hace falta rehacer todo el juego ni esconder todas las tabs actuales.  
La forma correcta es:

1. crear una nueva capa persistente `Santuario`,
2. convertir `Combat` en `Expedición`,
3. agregar una `Extracción` real al salir / morir / prestigiar,
4. introducir persistencia selectiva:
   - `cargo`
   - `proyectos`
   - `jobs`
5. mantener el combate y el crafting de campo casi como hoy.

## Qué Tiene Que Lograr El MVP

El MVP tiene que validar 5 hipótesis:

1. que el loot se vuelva más interesante de mirar,
2. que el final de la run gane tensión,
3. que el jugador entienda una capa persistente de cuenta,
4. que `Santuario` pueda reemplazar a `Combat` como home fuera de expedición,
5. que el juego gane más retorno frecuente sin matar el loop actual.

## Qué NO Tiene Que Hacer El MVP

No tiene que intentar shipping de una:

- full extraction hardcore,
- Forja Profunda completa,
- cartografía avanzada,
- contracts complejos,
- investigación total del Codex,
- economía social,
- stash enorme,
- persistencia total de gear.

Si intentamos meter todo eso junto, el juego se rompe de scope y de UX.

## Definición Del MVP

El MVP incluye exactamente estas piezas:

1. `Santuario` como nueva tab / home
2. `Combat` renombrado conceptualmente a `Expedición`
3. `Extracción` como overlay al:
   - retirarte,
   - morir,
   - prestigiar
4. `2` cargo slots base
5. `1` project slot base
6. `Stash` mínima de proyectos persistentes
7. `Destilería` mínima con jobs reales
8. `Infusión de Sigilos` mínima
9. `Prestige de emergencia` al morir si ya cumpliste gate
10. migración de save + telemetría nueva

## Qué Queda Fuera Del MVP

Queda explícitamente para post-MVP:

- contratos de caza completos,
- cartografía del Abismo,
- Forja Profunda real,
- reliquias complejas,
- memoria de build,
- insured slots premium avanzados,
- expediciones con múltiples tipos de salida raros,
- conversión total de Inventory/Crafting en sub-tabs de Expedición.

## Regla De Oro Del MVP

La expedición sigue siendo divertida aunque ignores parte del Santuario.  
El Santuario no debe bloquear jugar. Debe:

- mejorar,
- retener,
- dar continuidad,
- crear deseo de volver.

## Filosofía Del MVP

### Qué persiste

- meta progreso ya existente,
- cargo extraído,
- proyectos guardados,
- jobs del Santuario.

### Qué no persiste todavía

- la mayor parte del gear de campo,
- la mayor parte del inventario de expedición,
- el crafting táctico de run.

La persistencia selectiva es lo que hace que el sistema no rompa la frescura del reset.

## Nueva Arquitectura De Navegación

## Cambio principal

Sí: con este MVP, `Combat` ya no debería ser la home estructural del juego.

### Regla nueva de home

- si `expedition.phase === "active"`: el juego puede abrir en `expedition`
- si no hay expedición activa: el juego debe abrir en `sanctuary`

### Tabs del MVP

Recomiendo este set:

- `sanctuary`
- `combat` pero renombrado en UI a `Expedicion`
- `inventory`
- `crafting`
- `talents`
- `codex`
- `prestige`
- `stats`
- `achievements`
- `character`
- `skills`
- `lab`

### Decisión importante

En el MVP **no eliminaría** tabs actuales.  
Sólo cambiaría jerarquía:

- `Santuario` pasa a ser home
- `Expedición` pasa a ser la tab central cuando hay run activa
- el resto sigue existiendo para no sobrerrefactorizar UI de golpe

### Cambio de naming en UI

- `Combat` -> `Expedición`
- `Prestige` sigue existiendo, pero pasa a sentirse como parte del cierre de expedición

## Flujo Del Jugador En El MVP

## 1. Estado base: Santuario

El jugador entra al juego y cae en `Santuario`.

Ahí puede:

- reclamar jobs,
- ver stash,
- iniciar una nueva expedición,
- revisar una infusión de sigilos,
- poner algo en destilería.

## 2. Preparación de expedición

El jugador:

- elige clase/spec,
- elige sigil,
- inicia expedición.

Esto puede reciclar gran parte del `pendingRunSetup` actual.

## 3. Expedición activa

El juego se comporta casi igual que hoy:

- combate,
- loot,
- inventory,
- crafting de campo,
- bosses,
- Abismo.

La diferencia es que ahora el jugador sabe:

- esta run puede generar `cargo`
- esta run puede dejarme sacar `1 proyecto`

## 4. Salida

La expedición se puede cerrar por:

- retiro voluntario,
- prestigio,
- muerte.

En los tres casos aparece la `Extracción`.

## 5. Extracción

El jugador ve:

- resumen de la expedición,
- cargo encontrado,
- project candidates,
- qué slot se llena con qué,
- qué conserva y qué pierde.

## 6. Vuelta al Santuario

Después de confirmar la extracción:

- lo persistente entra al Santuario,
- la expedición termina,
- el jugador vuelve al hub.

## Sistemas Del MVP

## 1. Santuario

### Rol

Nueva capa persistente de cuenta.

### Qué contiene en MVP

- panel de expedición
- stash de proyectos
- destilería mínima
- infusión de sigilos mínima
- lista de jobs activos / claimables

### Qué NO contiene todavía

- forja profunda
- contratos completos
- cartografía
- archivo complejo del Codex

### Componente recomendado

- nuevo [src/components/Sanctuary.jsx](/home/gmendoza/coding/idlerpg/src/components/Sanctuary.jsx)

## 2. Expedición

### Rol

Es la run actual con nuevo framing.

### Qué cambia en MVP

- nombre y framing,
- lifecycle,
- salida,
- vínculo con extracción.

### Qué no cambia demasiado

- combate por ticks,
- loot básico,
- inventory,
- crafting de campo,
- bosses y Abismo.

## 3. Extracción

### Rol

Pantalla de salida donde elegís qué vuelve al Santuario.

### Forma recomendada

Overlay o pantalla modal global, no tab.

### Componente recomendado

- nuevo [src/components/ExtractionOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/ExtractionOverlay.jsx)

### Secciones del overlay

1. `Resumen`
   - tier máximo
   - bosses muertos
   - rareza máxima encontrada
   - ecos potenciales
   - motivo de salida

2. `Cargo`
   - bundles encontrados
   - slots disponibles

3. `Proyecto`
   - item elegible para guardar

4. `Confirmación`
   - qué se conserva
   - qué se pierde

## 4. Cargo

### Qué es en el MVP

No conviene hacer inventario físico complejo todavía.  
En MVP, `cargo` debe ser **bundles abstractos**.

### Tipos de cargo recomendados

- `essence_cache`
- `codex_trace`
- `sigil_residue`
- `relic_shard`

### Cómo se obtiene

Por eventos de expedición, no por microgestión.

### Reglas sugeridas

| Evento | Cargo sugerido |
|---|---|
| matar boss | 1 bundle fuerte |
| matar boss de Abismo | 1 bundle fuerte + chance de reliquia |
| drop epic+ | chance de `codex_trace` |
| completar contrato futuro | fuera del MVP |
| milestone de tier alto | chance baja de bundle |

### Por qué así

Es fácil de surfacing y no obliga a rehacer el sistema de drops todavía.

## 5. Project Slot

### Qué es

El jugador puede conservar `1` item de la expedición como `proyecto persistente`.

### Reglas

No cualquier item puede entrar.

### Elegibilidad recomendada

Puede ser proyecto si:

- es `rare` alta calidad,
- o `epic`,
- o `legendary`,
- o drop de boss,
- o item ascendido,
- o el juego lo marca como `worthy`.

### Qué pasa al extraerlo

El item deja de ser gear de campo y se convierte en un `project record` para stash.

### Importante

En MVP ese proyecto **no vuelve a equiparse todavía**.  
Es una base persistente para fases futuras.

Eso evita que el carry-over rompa balance demasiado pronto.

## 6. Stash Mínima

### Rol

Ser el primer puente real entre expediciones.

### Capacidad recomendada

- `4` slots base de stash

No más. Tiene que sentirse valiosa.

### Qué guarda

- proyectos
- reliquias simples

### Qué NO guarda todavía

- todo el inventario de expedición
- oro
- gear común entero

## 7. Destilería Mínima

### Rol

Dar un primer job persistente real del Santuario.

### Input del MVP

No hace falta que procese items completos todavía.  
En MVP puede procesar `cargo bundles`.

### Ejemplo

- `essence_cache` -> esencia en `20m`
- `codex_trace` -> progreso de Codex / resource de investigación futura en `30m`
- `sigil_residue` -> carga de sigilo en `45m`
- `relic_shard` -> fragmento de reliquia refinado en `60m`

### Por qué así

Evita tener que resolver ya la destilación de inventory compleja.

## 8. Infusión De Sigilos Mínima

### Rol

Primer sistema de preparación pre-expedición.

### Scope MVP

- `1` slot de infusión
- `1` sigil cargándose a la vez
- bonus pequeño y claro

### Bonus recomendados

- `free`: +ecos o resonancia pequeña
- `ascend`: +xp / push temprano
- `hunt`: +chance de `codex_trace`
- `forge`: +esencia o crafting de campo
- `dominion`: +progreso horizontal de Codex

### Timers

- `2h`, `6h` o `12h`

No más largo en MVP.

## 9. Prestige De Emergencia

### Problema actual

Hoy al morir el runtime resetea la run directamente en [src/engine/combat/processTickRuntime.js](/home/gmendoza/coding/idlerpg/src/engine/combat/processTickRuntime.js), lo cual es incompatible con el nuevo flujo de extracción.

### Solución del MVP

Al morir:

- no se resetea inmediatamente la run,
- se abre `Extracción` con `exitReason = "death"`.

Si el jugador ya cumplió condiciones de prestige:

- puede hacer `Prestige de Emergencia`
- cobra `75%` de ecos
- conserva cargo asegurado o recuperado

Si no cumplió:

- vuelve al Santuario con lo que el sistema permita recuperar.

## Scope Técnico Del MVP

## Nuevas raíces de estado

Recomiendo agregar dos raíces nuevas al save:

### `sanctuary`

Persistente, account-wide.

### `expedition`

Lifecycle y metadata de la expedición actual.

Eso limpia una asimetría actual:

- hoy `player` y `combat` cargan demasiado del ciclo de run
- no existe una capa clara para “cuenta persistente no-meta-tree”

## State Shape Recomendado

```js
sanctuary: {
  stash: [],
  cargoInventory: [],
  jobs: [],
  stations: {
    distillery: {
      slots: 1,
    },
    sigilInfusion: {
      slots: 1,
    },
  },
  extractionUpgrades: {
    cargoSlots: 2,
    projectSlots: 1,
    relicSlots: 0,
    insuredCargoSlots: 0,
  },
}
```

```js
expedition: {
  phase: "sanctuary", // sanctuary | setup | active | extraction
  id: null,
  startedAt: null,
  exitReason: null, // retire | prestige | death
  cargoFound: [],
  projectCandidates: [],
  selectedCargoIds: [],
  selectedProjectItemId: null,
  extractionPreview: null,
}
```

## Qué Se Queda Donde

### `player`

Sigue siendo el héroe de la expedición activa.

### `combat`

Sigue siendo runtime de combate y logs.

### `expedition`

Controla lifecycle y extracción.

### `sanctuary`

Controla persistencia nueva y jobs.

## Migración De Save

## Regla

No romper saves actuales.

### En [src/engine/stateInitializer.js](/home/gmendoza/coding/idlerpg/src/engine/stateInitializer.js)

Hay que:

1. agregar `sanctuary` con defaults
2. agregar `expedition` con defaults
3. derivar el `phase` inicial desde el save viejo

### Derivación recomendada

- si `combat.pendingRunSetup === true` -> `expedition.phase = "setup"`
- si hay clase/spec y no hay pending setup -> `expedition.phase = "active"`
- si no -> `expedition.phase = "sanctuary"`

### También hay que

- sumar `sanctuary` a `freshState`
- sumar `sanctuary` a migraciones futuras
- sumar `sanctuary` a persistencia normal de save

## Cambios De Navegación

## En [src/engine/stateInitializer.js](/home/gmendoza/coding/idlerpg/src/engine/stateInitializer.js)

Agregar `sanctuary` a `VALID_TABS`.

## En [src/App.jsx](/home/gmendoza/coding/idlerpg/src/App.jsx)

Hay que:

1. lazy-load del componente `Sanctuary`
2. agregar tab config para `sanctuary`
3. renombrar label de `combat` a `Expedicion`
4. cambiar lógica de tab inicial/home
5. montar `ExtractionOverlay`

### Regla de tab por defecto recomendada

- si `expedition.phase === "active"` -> `combat`
- si no -> `sanctuary`

## Reducer: acciones nuevas

En [src/state/gameReducer.js](/home/gmendoza/coding/idlerpg/src/state/gameReducer.js) recomiendo sumar estas acciones:

### lifecycle

- `OPEN_SANCTUARY`
- `ENTER_EXPEDITION_SETUP`
- `START_EXPEDITION`
- `OPEN_EXTRACTION`
- `CONFIRM_EXTRACTION`
- `CANCEL_EXTRACTION`

### selección

- `SELECT_EXTRACTION_CARGO`
- `SELECT_EXTRACTION_PROJECT`
- `CLEAR_EXTRACTION_SELECTION`

### sanctuary

- `CLAIM_SANCTUARY_JOB`
- `START_DISTILLERY_JOB`
- `START_SIGIL_INFUSION`
- `COLLECT_STASH_PROJECT`
- `DELETE_STASH_PROJECT`

### prestige

- `PRESTIGE_EMERGENCY`

## Acción Por Acción

## `ENTER_EXPEDITION_SETUP`

Hace:

- `expedition.phase = "setup"`
- reusa `combat.pendingRunSetup = true` mientras dure el MVP

## `START_EXPEDITION`

Hace:

- genera `expedition.id`
- `expedition.phase = "active"`
- limpia `cargoFound`, `projectCandidates`, selección de extracción
- arranca la run como hoy

## `OPEN_EXTRACTION`

Hace:

- `expedition.phase = "extraction"`
- guarda `exitReason`
- construye `extractionPreview`
- congela ticks de expedición

## `CONFIRM_EXTRACTION`

Hace:

- mueve cargo seleccionado a `sanctuary.cargoInventory`
- convierte item elegido en `project record` y lo mete en `sanctuary.stash`
- si corresponde, ejecuta prestige normal o de emergencia
- resetea `player`, `combat` y `expedition`
- vuelve a `sanctuary`

## Tick Loop: cambios necesarios

## En [src/hooks/useGame.js](/home/gmendoza/coding/idlerpg/src/hooks/useGame.js)

Hoy el tick corre mientras no haya `pendingRunSetup`.

Con MVP hay que cambiar la condición:

- sólo tickea combate si `expedition.phase === "active"`

### Offline progress

También tiene que respetar eso:

- no simular combate si estás en `sanctuary`
- sí permitir que los jobs del Santuario completen por tiempo real

Eso implica separar:

- offline combat
- completion de jobs persistentes

## Combat Runtime: cambio crítico

## En [src/engine/combat/processTickRuntime.js](/home/gmendoza/coding/idlerpg/src/engine/combat/processTickRuntime.js)

Hoy la muerte:

- resetea HP
- penaliza gold
- reinicia tier y run de inmediato

Eso hay que reemplazarlo por:

### Nuevo comportamiento

1. detectar muerte
2. construir resumen de expedición
3. marcar `exitReason = "death"`
4. abrir extracción
5. no reiniciar inmediatamente

### Nota

La fase de construcción del `extractionPreview` conviene moverla a un helper nuevo, por ejemplo:

- [src/engine/sanctuary/extractionEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/extractionEngine.js)

## Prestige Flow: cambio crítico

## En [src/components/Prestige.jsx](/home/gmendoza/coding/idlerpg/src/components/Prestige.jsx)

El botón ya no debería despachar `PRESTIGE` directo.

### Nuevo flujo

- el botón despacha `OPEN_EXTRACTION` con `exitReason = "prestige"`
- el overlay muestra:
  - ecos
  - cargo
  - proyecto
  - pérdidas
- confirmar desde ahí ejecuta prestige

## Retiro Voluntario

Necesita existir en MVP.

### Dónde ponerlo

En `Combat` / `Expedición`, botón visible pero discreto.

### Acción

- `OPEN_EXTRACTION` con `exitReason = "retire"`

### Restricción sugerida

No permitirlo antes de cierto punto si querés evitar spam extremo:

- después de `Tier 3`
- o después de `30 kills`

## Build Extraction Preview

Recomiendo crear engine nuevo:

- [src/engine/sanctuary/extractionEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/extractionEngine.js)

### Responsabilidades

- leer estado actual
- calcular cargo encontrado
- detectar project candidates
- calcular pérdida / recuperación según `exitReason`
- calcular prestige preview normal o emergencia

### Output sugerido

```js
{
  exitReason: "death",
  cargoOptions: [...],
  projectOptions: [...],
  availableSlots: {
    cargo: 2,
    project: 1,
    relic: 0,
    insuredCargo: 0,
  },
  recoveryRules: {
    openLossPct: 1,
    emergencyPrestigePct: 0.75,
  },
  prestige: {
    eligible: true,
    mode: "emergency",
    echoes: 4,
  },
}
```

## Cómo Generar Cargo En MVP

Para no tocar todo el loot system, recomiendo generarlo desde eventos de run.

### Fuente de verdad sugerida

`expedition.cargoFound`

### Cuándo sumar entradas

- kill de boss
- kill de boss abisal
- drop epic/legendary
- ascender item
- hito de tier alto

### Estructura de cada bundle

```js
{
  id: "cargo_123",
  type: "codex_trace",
  quality: "boss",
  source: {
    tier: 10,
    bossId: "iron_sentinel",
  },
  label: "Traza de Codex: Iron Sentinel",
}
```

## Cómo Generar Proyectos En MVP

No hay que pedir al jugador marcar cosas durante la run.

### Recomendación

Al abrir extracción:

- mirar `player.inventory`
- mirar `player.equipment`
- filtrar elegibles
- ofrecer elegir uno

### Proyecto persistente sugerido

No guardar el item raw completo.  
Guardar un snapshot orientado a proyecto:

```js
{
  id: "project_123",
  sourceItemId: "item_abc",
  name: "Hacha del Warlord",
  rarity: "epic",
  type: "weapon",
  baseType: "axe",
  affixes: [...],
  legendaryPowerId: "...",
  projectTier: 0,
  createdAt: 123456789,
}
```

## Jobs Del Santuario

Recomiendo engine nuevo:

- [src/engine/sanctuary/jobEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/jobEngine.js)

### MVP jobs

1. `distill_bundle`
2. `infuse_sigil`

### Reglas

- usan tiempo real absoluto (`Date.now`)
- completan aunque no haya expedición activa
- no dependen de `BULK_TICK`

## UI Del Santuario

## Layout mínimo

### Header

- estado actual
- jobs listos para reclamar
- stash occupancy

### Panel 1: Expedición

- expedición activa / no activa
- botón `Iniciar Expedición`
- si hay expedición activa: `Volver a Expedición`

### Panel 2: Stash

- proyectos guardados
- slots ocupados / totales

### Panel 3: Destilería

- bundles disponibles
- slot activo
- claim button

### Panel 4: Sigilos

- infusión activa
- tiempo restante
- claim / start

## Anexo: Detalle Del Santuario

Este anexo fija con más precisión qué vive en `Santuario`, qué es realmente time-gated y qué queda para después.

## Qué Es El Santuario

El `Santuario` no es sólo una tab nueva.  
Es la nueva capa persistente de cuenta donde viven:

- los jobs,
- la preparación de expediciones,
- el stash limitado,
- la transformación de valor temporal en valor persistente.

### Regla de diseño

Todo lo que viva en `Santuario` tiene que cumplir al menos una:

1. persistir entre expediciones,
2. usar tiempo real,
3. preparar una expedición futura,
4. procesar valor extraído,
5. generar retorno frecuente sin reemplazar el combate.

## Estaciones Del Santuario

## Estaciones del MVP

### 1. Destilería

Es la estación más simple y la más importante para el MVP.

#### Rol

- procesar `cargo bundles`
- devolver recursos persistentes

#### Input

- `essence_cache`
- `codex_trace`
- `sigil_residue`
- `relic_shard`

#### Output

- esencia
- recurso de Codex futuro
- carga de sigilo
- fragmento refinado

#### Fantasía

“Lo que traje de la expedición no vuelve como basura. Lo proceso y lo convierto en progreso de cuenta.”

### 2. Altar De Sigilos

Es la estación de preparación de la próxima expedición.

#### Rol

- infundir un sigilo con un timer
- dejarlo listo para la próxima expedición

#### Input

- sigilo seleccionado
- opcionalmente `sigil_residue`

#### Output

- estado `infused` o `charged` del sigilo
- bonus pequeño y claro para la próxima expedición

#### Fantasía

“No sólo elijo mi sigilo. Lo preparo.”

## Estaciones post-MVP

### 3. Forja Profunda

No entra en el MVP, pero es la evolución natural.

#### Rol

- trabajar sobre `proyectos persistentes`
- time-gatear upgrades o transformaciones valiosas

#### Input

- proyecto del stash
- catalizadores
- fragmentos refinados

#### Output

- mejora de proyecto
- estabilización
- imprint
- reforge abisal futura

### 4. Archivo Del Códice

Tampoco entra completo en el MVP.

#### Rol

- investigación persistente
- estudio de familias, bosses, powers, seeds

### 5. Mesa De Cartografía

Late game.

#### Rol

- preparar una expedición futura leyendo parcialmente su seed o su tramo de Abismo

### 6. Mesa De Contratos

Mid/late.

#### Rol

- aceptar contratos con dirección clara de expedición

## Jobs Del Santuario

## Qué Es Un Job

Un `job` es un trabajo persistente de cuenta con:

- input,
- duración,
- output,
- estado,
- claim posterior.

### Regla técnica

Un job:

- no depende del `TICK` de combate,
- vive por tiempo real absoluto,
- sigue corriendo aunque no haya expedición activa,
- queda `claimable` al terminar.

## Lifecycle De Un Job

### Estados

- `idle`
- `running`
- `claimable`
- `claimed`
- `cancelled`

### Ciclo

1. el jugador inicia job
2. el job entra en `running`
3. al llegar `endsAt`, pasa a `claimable`
4. el jugador hace claim
5. el output se aplica al Santuario

## Jobs Del MVP

### 1. `distill_bundle`

#### Station

- `distillery`

#### Qué hace

- consume un `cargo bundle`
- entrega recurso persistente

#### Timers sugeridos

| Cargo | Timer |
|---|---:|
| `essence_cache` | `20m` |
| `codex_trace` | `30m` |
| `sigil_residue` | `45m` |
| `relic_shard` | `60m` |

### 2. `infuse_sigil`

#### Station

- `sigilInfusion`

#### Qué hace

- carga un sigilo para una expedición futura

#### Timers sugeridos

| Intensidad | Timer |
|---|---:|
| ligera | `2h` |
| media | `6h` |
| completa | `12h` |

## Jobs Post-MVP

### 3. `forge_project`

- trabaja un proyecto persistente

### 4. `research_codex`

- investiga powers/familias/bosses

### 5. `map_abyss`

- cartografía de una seed o bloque de Abismo

### 6. `resolve_contract`

- fase final corta de un contrato completado

## Slots De Jobs

### MVP

- `1` slot de Destilería
- `1` slot de Infusión

### Regla

No arrancar con más.  
Si el sistema se vuelve demasiado ancho de entrada, el Santuario se siente como una checklist, no como una base.

## Reglas UX De Jobs

1. El jugador nunca debería perder output por no entrar exacto a horario.
2. Un job terminado espera claim.
3. Un job debe explicar claramente:
   - input
   - duración
   - output
4. Debe existir `claim all` más adelante, pero no es obligatorio para MVP.

## Cargo Y Materiales

## Qué Es El Cargo En Este Diseño

El `cargo` es valor persistente rescatable que viene de una expedición.

No es gear equipable.
No es oro de run.
No es eco.

Es el puente entre expedición y Santuario.

## Cargo Del MVP

### 1. `essence_cache`

#### Qué representa

- botín refinable
- materiales crudos para economía de crafting

#### Output esperado en Destilería

- esencia

#### Fuente típica

- bosses
- milestones de tier
- drops buenos

### 2. `codex_trace`

#### Qué representa

- conocimiento recuperado de enemigos, familias o bosses

#### Output esperado

- recurso persistente para futuros sistemas de investigación
- o progreso horizontal simple en MVP

#### Fuente típica

- bosses
- bosses de Abismo
- drops `epic+`

### 3. `sigil_residue`

#### Qué representa

- energía residual útil para infusión/preparación

#### Output esperado

- carga o fuel para el Altar de Sigilos

#### Fuente típica

- bosses
- runs temáticas con sigil fuerte
- algunos milestones

### 4. `relic_shard`

#### Qué representa

- fragmentos raros de valor persistente

#### Output esperado

- reliquia refinada futura
- catalizador de Forja Profunda futura

#### Fuente típica

- Abismo
- bosses altos
- drops excepcionales

## Qué Materiales No Metería En El MVP

No metería todavía:

- 20 tipos de minerales
- mats por bioma
- mats por slot de gear
- recetas con 8 ingredientes

El MVP necesita una taxonomía corta y clara.

## Proyecto Vs Cargo

La diferencia correcta es:

### Cargo

- bundle abstracto
- siempre va al Santuario como recurso
- no tiene identidad de item

### Proyecto

- item específico
- identidad propia
- ocupa stash
- se convierte en base para sistemas de crafting profundos futuros

## Misiones Time-Gated

Sí, pero no en el MVP base.

## Qué Haría Después

La forma correcta de meter “misiones con timer” no es mandar el héroe a pelear solo.  
Es meter `Contratos`.

### Contrato ideal

1. aceptás contrato en Santuario
2. jugás la expedición y llenás progreso matando targets
3. al completarlo, se habilita una fase corta con timer
4. reclamás recompensa persistente

O sea:

- el timer no reemplaza el juego activo,
- el timer remata y agenda el retorno.

## Naming Recomendado

## Tab `Prestige`

En MVP **no la renombraría a `Extraer`**.

Razón:

- `Extracción` no es una pantalla de progreso persistente
- es un flujo de salida

### Recomendación

- la tab sigue como `Prestigio`
- pero el botón principal deja de ser sólo `Prestigiar`
- pasa a algo como:
  - `Abrir extracción`
  - o `Extraer y prestigiar`

## Más adelante

Si el sistema madura, sí podríamos renombrar:

- `Prestigio` -> `Ecos`

Y dejar `Extracción` como el flujo global de cierre de expedición.

## Naming De Tabs En MVP

### Recomendación

- `Santuario`
- `Expedición`
- `Mochila`
- `Forja`
- `Talentos`
- `Códice`
- `Prestigio`

## Orden De Unlocks Del Santuario

## Early: antes del primer prestige

### Disponible

- Santuario básico visible
- stash visual mínima
- expedición como framing nuevo
- extracción simple

### Bloqueado

- jobs reales
- infusión
- project slot pleno

### Intención

No abrumar.  
El jugador tiene que entender primero:

- qué es una expedición
- qué es extraer

## Después del primer prestige

### Se desbloquea

- `2` cargo slots
- `1` project slot
- `Destilería`
- `Infusión de Sigilos`

### Intención

Acá nace el Santuario de verdad.

## Mid game

### Se puede sumar

- segundo slot o mejora de calidad de vida en Destilería
- mejor slot o bonus de Infusión
- más capacidad de stash

### Intención

Más comodidad, no más complejidad sistémica todavía.

## Abismo I

### Se puede sumar

- `relic_shard` más frecuente
- primer sistema de reliquias simples
- primer crecimiento serio de stash o project tier

## Abismo II

### Se puede sumar

- primer prototipo de `Forja Profunda`
- materiales más raros
- contratos mejores o investigación inicial

## Abismo III+

### Se puede sumar

- cartografía
- proyectos más potentes
- investigación del Códice
- mejores slots asegurados o slots de Santuario

## Resumen De Diseño Del Santuario

La versión correcta del Santuario es:

### En MVP

- `Destilería`
- `Altar de Sigilos`
- `Stash`
- `Jobs simples`
- `Cargo abstracto`

### Post-MVP

- `Forja Profunda`
- `Archivo del Códice`
- `Contratos`
- `Cartografía`
- `Reliquias`

### Regla final

El Santuario no existe para meter chores.
Existe para convertir:

- tiempo,
- loot,
- riesgo,
- y preparación

en una capa persistente que haga que cada expedición importe más.

## Telemetría Nueva Necesaria

Sumar en analytics y stats:

- `expeditionsStarted`
- `expeditionsExtracted`
- `expeditionsCollapsed`
- `emergencyPrestiges`
- `cargoExtracted`
- `projectsSaved`
- `jobsStarted`
- `jobsClaimed`
- `stashItemsStored`
- `retireActions`

### KPIs para validar MVP

1. % de runs que terminan en extracción voluntaria
2. % de runs que terminan en prestige de emergencia
3. cantidad promedio de proyectos guardados por día
4. frecuencia de visita al Santuario
5. tasa de claim de jobs
6. tiempo medio entre expediciones

## Riesgos Del MVP Y Mitigación

## Riesgo 1: demasiada fricción

Mitigación:

- sólo 2 cargo slots y 1 project slot
- defaults automáticos
- bundles abstractos, no tetris

## Riesgo 2: demasiada complejidad de UI

Mitigación:

- Santuario simple
- overlay de extracción muy guiado
- no abrir todavía sub-tabs internas raras

## Riesgo 3: muerte demasiado punitiva

Mitigación:

- prestige de emergencia
- recuperación parcial
- no perder meta progreso automático

## Riesgo 4: carry-over rompe balance

Mitigación:

- proyecto persistente no equipable todavía
- stash muy chica
- no persistir inventario completo

## Orden Exacto De Implementación

## Fase 0: Infraestructura

1. agregar `sanctuary` a save
2. agregar `expedition` a save
3. agregar `sanctuary` a tabs válidas
4. agregar helpers nuevos:
   - `jobEngine`
   - `extractionEngine`

## Fase 1: Navegación y lifecycle

1. nueva tab `Santuario`
2. regla de home nueva
3. `expedition.phase`
4. `START_EXPEDITION`
5. `OPEN_EXTRACTION`
6. tick sólo en fase activa

## Fase 2: Extracción

1. `ExtractionOverlay`
2. retiro voluntario
3. extracción por prestigio
4. extracción por muerte
5. project selection
6. cargo selection

## Fase 3: Persistencia

1. stash mínima
2. cargo inventory
3. project records
4. confirm extraction -> persistencia

## Fase 4: Santuario utilizable

1. destilería mínima
2. infusión mínima
3. claims y timers
4. surfacing de jobs

## Fase 5: Balance y polish

1. tuning de cargo drops
2. tuning de prestige de emergencia
3. tuning de stash slots
4. copy / onboarding
5. métricas

## Archivos A Tocar Primero

### Obligatorios

- [src/engine/stateInitializer.js](/home/gmendoza/coding/idlerpg/src/engine/stateInitializer.js)
- [src/state/gameReducer.js](/home/gmendoza/coding/idlerpg/src/state/gameReducer.js)
- [src/App.jsx](/home/gmendoza/coding/idlerpg/src/App.jsx)
- [src/hooks/useGame.js](/home/gmendoza/coding/idlerpg/src/hooks/useGame.js)
- [src/engine/combat/processTickRuntime.js](/home/gmendoza/coding/idlerpg/src/engine/combat/processTickRuntime.js)
- [src/components/Prestige.jsx](/home/gmendoza/coding/idlerpg/src/components/Prestige.jsx)
- [src/components/Combat.jsx](/home/gmendoza/coding/idlerpg/src/components/Combat.jsx)

### Nuevos

- [src/components/Sanctuary.jsx](/home/gmendoza/coding/idlerpg/src/components/Sanctuary.jsx)
- [src/components/ExtractionOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/ExtractionOverlay.jsx)
- [src/engine/sanctuary/jobEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/jobEngine.js)
- [src/engine/sanctuary/extractionEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/extractionEngine.js)

## Decisiones Ya Tomadas Para Evitar Vuelta Atrás

1. `Santuario` sí va como tab nueva en el MVP.
2. `Combat` deja de ser home global, aunque sigue siendo la pantalla principal de una expedición activa.
3. `Extracción` va como overlay, no como tab.
4. `Proyecto persistente` no es equipable todavía.
5. `Cargo` en MVP son bundles abstractos, no inventario físico complejo.
6. `Prestige` pasa por extracción, no va directo.
7. `Muerte` deja de resetear run inmediatamente.

## Veredicto Final

Para que el MVP quede bien implementado, no hay que “agregar una mecánica”.  
Hay que refactorizar el juego alrededor de una verdad nueva:

### El jugador ya no vive sólo en combate. Vive entre Santuario, Expedición y Extracción.

La forma correcta de llegar ahí en este código es:

1. nueva raíz `sanctuary`
2. nueva raíz `expedition`
3. tab `Santuario`
4. overlay `Extracción`
5. `Combat` reinterpretado como `Expedición`
6. persistencia selectiva vía cargo + proyectos + jobs

Ese es el MVP correcto para validar si el juego puede transformarse en un idle ARPG de extraction-lite sin perder su identidad.
