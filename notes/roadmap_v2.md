# Roadmap V2

Fecha de corte: 2026-04-18 UTC  
Repo: `idlerpg`  
Workspace: `main` con dirty worktree y refactor activo  
Build: `npm run build` compila OK en este estado

## Leer Esto Primero

Este documento intenta ser la foto más útil para otra IA o diseñador que quiera proponer reworks, nuevas mecánicas o cambios de dirección.

Importante:

- `notes/actual.md` ya quedó parcialmente viejo. Sirve para contexto histórico, pero no representa el loop nuevo.
- `notes/propuesta_final_2.md`, `notes/propuesta_expediciones.md` y `notes/propuesta_mvp_extraction.md` siguen siendo el mejor contexto de intención de diseño.
- La verdad actual del proyecto vive en código, no sólo en docs.
- El juego está en transición desde un idle ARPG clásico hacia un **RPG idle extraction-lite con Santuario persistente**.

## Norte De Diseño Actual

El proyecto ya no apunta a:

`Combat + menús + prestige`

Sino a:

`Santuario -> Expedición -> Extracción -> Santuario`

La fantasía buscada hoy es:

- la expedición encuentra valor,
- no todo vuelve automáticamente,
- el Santuario procesa ese valor,
- los proyectos persistentes importan cada vez más,
- y el prestige / ecos pasa a ser una consecuencia del cierre de expedición, no el único final posible del loop.

No queremos un Tarkov hardcore. Queremos un **extraction-lite**:

- sin inventario tetris,
- sin full-loot punitivo,
- sin borrar media cuenta por morir,
- con riesgo, pero sin toxicidad,
- con timers persistentes significativos,
- y con monetización futura basada en conveniencia / slots / calidad de vida, no P2W.

## Estado Actual Del Juego

## Resumen Ejecutivo

El juego ya tiene dos capas fuertes:

1. `Expedición`
2. `Meta persistente`

Pero ahora empezó una tercera capa nueva:

3. `Santuario`

Eso ya no es sólo intención. Hoy existe en runtime.

En términos prácticos, el juego ya implementa:

- clases, specs, talentos, prestige, Codex, sigils, bosses seeded, Abismo y crafting,
- un loop de extracción real,
- jobs persistentes,
- cargo persistente,
- stash de proyectos,
- y una primera versión funcional de `Forja Profunda`.

Lo importante es que el proyecto está en una **etapa híbrida**:

- parte del juego sigue siendo el idle ARPG tradicional,
- parte ya migró al nuevo loop de expedición / santuario.

## Tabs Y Navegación

Tabs actuales en UI: `12`

- `sanctuary`
- `character`
- `combat` pero rotulada como `Expedicion`
- `inventory`
- `skills`
- `talents`
- `crafting`
- `prestige` pero rotulada como `Ecos`
- `achievements`
- `stats`
- `lab`
- `codex`

Estado de navegación:

- fuera de run, la home real es `Santuario`
- durante run, la pantalla principal es `Expedicion`
- `Extracción` no es tab: es overlay global

## Contenido Base Actual

### Clases y specs

Clases: `2`

- `Warrior`
- `Mage`

Specs: `4`

- `Berserker`
- `Juggernaut`
- `Sorcerer`
- `Arcanist`

### Talentos

Árboles principales: `6`

- `warrior_general`
- `berserker`
- `juggernaut`
- `mage_general`
- `sorcerer`
- `arcanist`

### Prestige

Ramas actuales: `7`

- `war`
- `bulwark`
- `fortune`
- `sorcery`
- `dominion`
- `forge`
- `abismo`

### Sigils

Run sigils actuales: `5`

- `free`
- `ascend`
- `hunt`
- `forge`
- `dominion`

### Encountering / progression

- `25` tiers base authored
- `Abismo` en `26+`
- comunes seeded por run
- bosses seeded por run
- `12` bosses authored
- mutador por ciclo de Abismo

### Itemización

Estado general:

- `rare`, `epic`, `legendary` ya tienen loops diferenciados
- `rare` ya fue empujado a rol de “item proyecto” fuerte
- el pool de affixes ya fue ampliado y recategorizado
- el reroll de expedición ya rehace identidades completas

## Loop Actual Real

## 1. Santuario

Es la home fuera de expedición.

Desde ahí hoy puedes:

- ver estado de la expedición
- volver a expedición o preparar una nueva
- reclamar jobs
- usar `Destilería`
- usar `Altar de Sigilos`
- abrir `Forja Profunda`
- ver stash de proyectos

Archivos principales:

- [src/components/Sanctuary.jsx](/home/gmendoza/coding/idlerpg/src/components/Sanctuary.jsx)
- [src/engine/stateInitializer.js](/home/gmendoza/coding/idlerpg/src/engine/stateInitializer.js)
- [src/state/gameReducer.js](/home/gmendoza/coding/idlerpg/src/state/gameReducer.js)

## 2. Expedición

Es la run actual.

Sigue conservando:

- combate por tiers
- loot
- inventory
- Codex / hunt
- bosses
- Abismo
- comparación de items

Pero ya no es el único lugar donde se desarrolla valor de cuenta.

Estado actual del crafting de campo:

- visible en UI: `Reroll` y `Extract`
- ya no muestra `Upgrade`
- ya no muestra `Polish`
- ya no muestra `Reforge`
- ya no muestra `Ascend`

O sea:

- la expedición todavía rescata bases
- pero el cierre fino del proyecto ya migró a la capa persistente

Archivos principales:

- [src/components/Combat.jsx](/home/gmendoza/coding/idlerpg/src/components/Combat.jsx)
- [src/components/Crafting.jsx](/home/gmendoza/coding/idlerpg/src/components/Crafting.jsx)
- [src/components/crafting/craftingUi.js](/home/gmendoza/coding/idlerpg/src/components/crafting/craftingUi.js)

## 3. Extracción

La salida de run ya está unificada.

Ya no existe realmente el viejo “Prestigiar” como acción separada del jugador.

Hoy el flujo es:

- `Extraer al Santuario`

Y según el estado de la expedición:

- si no cumpliste gate: vuelves con cargo/proyecto, sin ecos
- si cumpliste gate: vuelves con cargo/proyecto y además ganas ecos
- si morís demasiado: se abre `Extracción de emergencia`

Archivos principales:

- [src/components/ExtractionOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/ExtractionOverlay.jsx)
- [src/engine/sanctuary/extractionEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/extractionEngine.js)
- [src/state/gameReducer.js](/home/gmendoza/coding/idlerpg/src/state/gameReducer.js)

## Muerte En Expedición

Estado actual:

- `3` muertes seguras por expedición
- la `4ta` abre `Extracción de emergencia`

Soft death actual:

- corta auto-avance
- revive al héroe
- retrocede `5` tiers
- si ese tier cae en múltiplo de `5`, retrocede `1` más para no caer en boss tier

O sea:

- morir castiga,
- pero no debería cerrar la expedición al primer error.

Archivo principal:

- [src/engine/combat/processTickRuntime.js](/home/gmendoza/coding/idlerpg/src/engine/combat/processTickRuntime.js)

## Sistema De Extracción Actual

### Cargo persistente

Hoy existen `4` bundles abstractos:

- `essence_cache`
- `codex_trace`
- `sigil_residue`
- `relic_shard`

Se generan en extracción en base a:

- tier alcanzado
- bosses muertos
- drops raros
- sigils activos
- bonos de infusión

### Slots base actuales

- `2` cargo slots
- `1` project slot

### Reglas actuales

- salida manual: recuperación completa
- muerte: recuperación parcial de cargo
- muerte: no asegura proyecto en este MVP

## Jobs Del Santuario

Hoy ya existen jobs persistentes reales con tiempo real.

### Jobs implementados

1. `Destilería`
2. `Infusión de Sigilos`
3. `Upgrade persistente de proyecto` en Forja Profunda

Los jobs:

- persisten en save
- se sincronizan por tiempo real
- quedan `running` o `claimable`
- no dependen del tick de combate

Archivo principal:

- [src/engine/sanctuary/jobEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/jobEngine.js)

## Recursos Persistentes Actuales

### Recursos de Santuario

- `codexInk`
- `sigilFlux`
- `relicDust`

### Estado de uso real

- `sigilFlux`: sí tiene loop completo
- `relicDust`: sí tiene consumidor en Forja Profunda
- `codexInk`: todavía está generado/persistido, pero su loop todavía no está cerrado

Esto es importante:

`codexInk` hoy ya existe, pero todavía es recurso huérfano.

## Altar De Sigilos

Ya funciona.

Puedes:

- poner un sigil en infusión
- esperar el timer
- reclamar una carga
- consumirla automáticamente al arrancar la próxima expedición si ese sigil está equipado

Eso ya da:

- bonuses de run
- bonuses de extracción

Archivos principales:

- [src/components/Sanctuary.jsx](/home/gmendoza/coding/idlerpg/src/components/Sanctuary.jsx)
- [src/engine/sanctuary/jobEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/jobEngine.js)
- [src/state/gameReducer.js](/home/gmendoza/coding/idlerpg/src/state/gameReducer.js)

## Proyectos Persistentes

Hoy el jugador ya puede extraer una pieza y guardarla como `proyecto`.

Pero un proyecto no es “equipo persistente listo para usar” en el sentido clásico.

Hoy es:

- una pieza rescatada,
- persistida en stash,
- sobre la que trabaja la Forja Profunda.

### Shape conceptual actual del proyecto

El proyecto ya guarda estructura persistente separada del `+N`:

- `baseRating`
- `baseAffixes`
- `projectTier`
- `upgradeLevel`
- `upgradeCap`
- `ascensionTier`
- `powerTier`
- `legendaryPowerId`

Esto es clave porque permite:

- que el `+N` sea realmente reversible / reiniciable
- que `Ascensión` exista sin destruir la identidad del proyecto

Archivo principal:

- [src/engine/sanctuary/projectForgeEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/projectForgeEngine.js)

## Forja Profunda Actual

Ya no vive incrustada como bloque pesado dentro de Santuario.

Ahora se abre como overlay dedicado desde:

- [src/components/Sanctuary.jsx](/home/gmendoza/coding/idlerpg/src/components/Sanctuary.jsx)
- [src/components/DeepForgeOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/DeepForgeOverlay.jsx)

### Qué hace hoy

1. `Upgrade persistente`
2. `Pulir profundo`
3. `Reforge profunda`
4. `Ascensión de proyecto`

### Upgrade persistente

- es el reemplazo del viejo `upgrade` de run
- sube el `+N` del proyecto persistente
- usa `relicDust`
- corre como job real
- cap actual: `+15`

### Pulir profundo

- ya no existe en la expedición
- trabaja sobre la base persistente del proyecto
- consume `essence + relicDust`

### Reforge profunda

- ya no existe en la expedición
- abre una sesión pagada con opciones
- mantiene una sola decisión abierta por vez
- permite líneas nuevas persistentes
- puede habilitar líneas de Abismo en proyectos `epic/legendary`

### Ascensión de proyecto

Estado actual del diseño implementado:

- ya no cambia rareza
- requiere llegar al cap de `+N`
- resetea `upgradeLevel` a `0`
- sube `ascensionTier`
- sube `projectTier`
- recalcula el proyecto desde una base estructural más alta
- si el proyecto es `legendary`, permite mantener o reemplazar el poder por uno descubierto en Codex
- el costo del injerto respeta la maestría de Codex

Esta es probablemente la pieza más importante del nuevo loop.

## Ecos / Prestige

El prestige hoy sigue existiendo, pero más como capa meta que como botón.

Cambios ya hechos:

- tab renombrada conceptualmente a `Ecos`
- ranks de prestige viejos fueron reemplazados por resonancia basada en `totalEchoesEarned`
- el loop de salida fuerte es extracción, no “prestige” separado

Importante:

- el sistema de ecos sigue siendo central
- pero ya no debería diseñarse como capa separada del cierre de expedición

## Qué Cambió Mucho Respecto Del Juego Viejo

Este es el resumen más importante para otra IA.

## Antes

- el valor de la run vivía casi todo en combate + crafting + prestige
- el item fuerte se construía y se consumía dentro de la misma run
- el `upgrade` principal era de campo
- el `ascend` principal era de campo

## Ahora

- la run produce valor de extracción
- el Santuario procesa y conserva parte de ese valor
- el `upgrade` fuerte migró a la capa persistente
- `Pulir/Reforge` migraron a la capa persistente
- `Ascender` migró a la capa persistente

En otras palabras:

**la expedición ya no debe cerrar “el item perfecto del juego”.**

Debe producir:

- bases prometedoras,
- proyectos,
- recursos persistentes,
- razones para volver al Santuario.

## Legacy / Transición / Cosas A Tener En Cuenta

Hay piezas que siguen existiendo por compatibilidad, tooling o por no romper demasiado todo de una.

### Importante para otra IA

1. Hay acciones viejas de crafting que todavía existen en reducer / engine, aunque ya no estén expuestas en UI.
2. Parte del tooling o simulación todavía puede tocar rutas viejas.
3. Varios docs siguen hablando de `Combat`, `Prestige` y `Crafting` como si fueran el loop principal viejo.
4. El proyecto está en fase híbrida: no todo el valor persistente reingresa aún al poder del jugador de forma limpia.

## Cosas Que Todavía No Están Cerradas

Estas son las decisiones grandes que siguen abiertas y donde otra IA puede ayudar mucho.

## 1. Qué queda en expedición y qué migra al Santuario

Estado actual:

- `Reroll` todavía quedó en expedición
- `Extract` quedó en expedición
- `Upgrade/Polish/Reforge/Ascend` ya migraron

Pregunta abierta:

- ¿Reroll se queda como herramienta de campo para rescatar bases?
- ¿O también se migra a Forja Profunda para evitar que una expedición pueda “resolver” demasiado un proyecto?

## 2. Cómo vuelve el proyecto al poder del jugador

Hoy el proyecto:

- se guarda,
- se forja,
- asciende,

pero todavía no está 100% resuelto cómo se reintegra al poder de una expedición futura.

Opciones de diseño futuras:

- equipar proyectos persistentes como “reliquias activas”
- slots de loadout profundo
- usar proyectos como base para clonar gear de campo
- convertir proyectos en “esqueletos” sobre los que la expedición construye

Este es probablemente el mayor tema sistémico pendiente.

## 3. Recursos persistentes todavía sin loop completo

Especialmente:

- `codexInk`

La siguiente estación lógica es:

- `Investigación del Codex`

## 4. Contratos, cartografía y research todavía no existen

El Santuario hoy ya tiene forma, pero le faltan estaciones de largo plazo para cerrar la fantasía completa:

- contratos
- investigación
- cartografía del Abismo
- quizá memoria de build / loadouts

## 5. UX / onboarding

El sistema ya es bastante más complejo que antes.

Todavía faltan:

- surfacing más claro de proyectos
- más razones visibles para mirar stash
- mejor lectura de por qué extraer vs empujar
- mejor explicación de qué hace cada estación

## 6. Balance del nuevo loop

Con la migración de crafting al Santuario, hay que rebalancear:

- velocidad de obtención de proyectos
- frecuencia y cantidad de cargo
- costo/duración de jobs
- fuerza de proyectos ascendidos
- si el primer proyecto tarda demasiado en sentirse importante o no

## Qué Está Claramente En El Futuro

## Fase 1: cerrar el Santuario básico

Objetivo:

- que todos los recursos existentes tengan un uso
- que el jugador ya entienda por qué mirar loot y por qué extraer

Tareas típicas:

- investigación del Codex con `codexInk`
- mejor surfacing de proyectos
- mejores rewards visuales de extracción

## Fase 2: profundizar la Forja Profunda

Objetivo:

- que el proyecto se vuelva una obsesión sana de largo plazo

Tareas típicas:

- más recetas profundas
- tuning de poderes legendarios
- capas más raras como sockets/sellos/reliquias
- decidir si existe una forma de “insuring” o proteger proyectos

## Fase 3: cerrar la fantasía de expedición persistente

Objetivo:

- que el Santuario prepare la run y la run alimente de verdad al Santuario

Tareas típicas:

- contratos
- cartografía
- research
- loops de preparación más fuertes

## Fase 4: decidir cuánto extraction-lite queremos

Temas:

- más tipos de cargo
- slots asegurados
- tipos de salida
- runs cortas vs runs largas
- cuánto castigo/seguridad debe haber en muerte

## Fase 5: monetización futura sana

Sólo después de que el loop base funcione bien.

Posibilidades sanas:

- más slots de jobs
- más slots de stash
- más slots de extracción asegurada
- colas mejores
- QoL de gestión
- cosmetics / themes / presentation

Evitar:

- vender poder bruto
- vender progreso obligado
- vender “no perder el item” como impuesto tóxico

## Ideas Que Otra IA Puede Explorar

Si otra IA va a proponer reworks o nuevas mecánicas, estos son buenos frentes:

1. `Investigación del Codex`
   - usos de `codexInk`
   - research tree
   - milestones de powers descubiertos

2. `Reintegración de proyectos`
   - cómo vuelve un proyecto persistente al poder real de run
   - sin matar la frescura de la expedición

3. `Contratos`
   - misiones time-gated ligadas a familias, bosses, extracción y proyectos

4. `Cartografía del Abismo`
   - lectura/preparación de seeds profundas
   - forecasting suave sin spoilear demasiado

5. `Forja Profunda v2`
   - nuevas recetas persistentes
   - tuning de poder legendario
   - sockets / sellos / firmas / reliquias

6. `Reroll`
   - decidir si se queda como única herramienta de campo o si también migra a la capa persistente

7. `Onboarding / UX`
   - cómo enseñar el nuevo loop sin meter tutorial pesado

8. `Retention / monetización sana`
   - slots, queues, cosmetics y compounding ligero sin P2W

## Archivos Hot Del Proyecto

Si otra IA va a tocar diseño o arquitectura, estos archivos importan mucho:

- [src/App.jsx](/home/gmendoza/coding/idlerpg/src/App.jsx)
- [src/hooks/useGame.js](/home/gmendoza/coding/idlerpg/src/hooks/useGame.js)
- [src/engine/stateInitializer.js](/home/gmendoza/coding/idlerpg/src/engine/stateInitializer.js)
- [src/state/gameReducer.js](/home/gmendoza/coding/idlerpg/src/state/gameReducer.js)
- [src/components/Sanctuary.jsx](/home/gmendoza/coding/idlerpg/src/components/Sanctuary.jsx)
- [src/components/DeepForgeOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/DeepForgeOverlay.jsx)
- [src/components/ExtractionOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/ExtractionOverlay.jsx)
- [src/engine/sanctuary/extractionEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/extractionEngine.js)
- [src/engine/sanctuary/jobEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/jobEngine.js)
- [src/engine/sanctuary/projectForgeEngine.js](/home/gmendoza/coding/idlerpg/src/engine/sanctuary/projectForgeEngine.js)
- [src/components/Crafting.jsx](/home/gmendoza/coding/idlerpg/src/components/Crafting.jsx)
- [src/components/Combat.jsx](/home/gmendoza/coding/idlerpg/src/components/Combat.jsx)
- [src/engine/combat/processTickRuntime.js](/home/gmendoza/coding/idlerpg/src/engine/combat/processTickRuntime.js)
- [src/engine/progression/codexEngine.js](/home/gmendoza/coding/idlerpg/src/engine/progression/codexEngine.js)
- [src/data/prestige.js](/home/gmendoza/coding/idlerpg/src/data/prestige.js)
- [src/data/bosses.js](/home/gmendoza/coding/idlerpg/src/data/bosses.js)
- [src/data/runSigils.js](/home/gmendoza/coding/idlerpg/src/data/runSigils.js)

## Síntesis Final

El proyecto ya no es sólo “un idle RPG con prestige”.

Hoy es:

- un idle ARPG con builds reales,
- bosses y Abismo seeded,
- un Codex importante,
- un prestige meta funcional,
- y un Santuario persistente ya empezado.

La dirección correcta parece esta:

- la expedición encuentra,
- la extracción selecciona,
- el Santuario procesa,
- la Forja Profunda desarrolla,
- y los ecos siguen siendo el backbone meta.

La gran pregunta que queda abierta para el siguiente gran rework es:

**cómo hacer que los proyectos persistentes vuelvan a influir en la expedición de forma fuerte, sin que el juego pierda frescura de run.**

Ese es, probablemente, el siguiente problema central del proyecto.
