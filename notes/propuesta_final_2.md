# Propuesta Final 2: Rework Profundo Del Core Loop

Fecha: 2026-04-18  
Scope: versión más ambiciosa del rework time-gated, aceptando cambios profundos en el core loop si eso mejora retención, fantasía de progreso y monetización futura.

## Resumen Ejecutivo

Si aceptamos tocar el core loop de verdad, la mejor dirección no es “agregar 4 o 5 timers”. Es **convertir el juego en un ARPG idle de expediciones con un santuario persistente**.

La conclusión después de analizar:

- `propuesta_time_gated_1`
- `propuesta_time_gated_2`
- `propuesta_time_gated_3`
- y la `propuesta_final` anterior

es que todas apuntan a lo mismo, aunque desde distintos ángulos:

1. el juego necesita una capa entre runs,
2. esa capa debe ser persistente y planificable,
3. los timers buenos son los que viven en esa capa,
4. el mayor límite del juego actual es que casi todo lo importante se reinicia al prestigiar.

La versión “segura” ya quedó documentada en `propuesta_final.md`.  
Esta versión responde otra pregunta:

**¿Qué haríamos si quisiéramos rediseñar el loop para que los time gates no sean un parche, sino un pilar del juego?**

Mi respuesta es:

### Norte de diseño

Pasar de:

`run -> loot -> crafting -> prestige -> wipe`

a:

`santuario -> preparación -> expedición -> extracción -> proyectos persistentes -> nueva expedición`

Ese cambio habilita:

- time gates de verdad,
- proyectos de items persistentes,
- más deseo de revisar loot,
- más retorno diario,
- más monetización futura sana,
- y un endgame con mejor identidad.

## Diagnóstico: Qué Limita Al Juego Actual

El juego actual ya tiene muy buenas piezas:

- clases y specs con identidad,
- runs seeded,
- sigils,
- Abismo,
- Codex,
- crafting,
- prestige con árbol y resonancia.

Pero todavía hay una limitación estructural:

### Hoy la run se siente muy autocontenida

- lo importante pasa dentro de la run,
- al prestigiar se limpia demasiado,
- entre runs falta una “casa”,
- y por eso los timers grandes sobre gear o progreso se sienten artificiales.

Eso genera tres problemas:

1. **Los drops son menos memorables de lo que podrían ser.**
2. **El prestige corta demasiado, pero deja poco para seguir pensando fuera de combate.**
3. **La monetización futura sana queda demasiado restringida a QoL superficial.**

## Qué Aprendemos De Las 3 Propuestas + La Propuesta Final

## `propuesta_time_gated_1`

### Lo mejor

- detecta muy bien los systems “safe monetization”
- propone timers que no rompen el juego
- entiende bien sigils, contratos y destilación

### Su límite

Es muy buena como expansión incremental, pero asume el core loop actual casi intacto.

## `propuesta_time_gated_2`

### Lo mejor

- piensa en capas meta reales
- se anima a cartografía, foundry, mastery y progresos de cuenta más profundos
- es la que más se acerca a un juego tipo “base + expediciones”

### Su límite

Tiene varias ideas que, si se implementan sin ordenar el core loop, generan duplicación con prestige, talents, skills y crafting.

## `propuesta_time_gated_3`

### Lo mejor

- ordena muy bien el espacio de diseño
- separa bien sistemas seguros de sistemas riesgosos
- muestra buenas combinaciones entre forge, sigils, contracts y codex

### Su límite

Tiene ideas muy fuertes, pero algunas requieren una infraestructura más persistente de la que el juego live tiene hoy.

## `propuesta_final.md`

### Lo mejor

- selecciona correctamente los sistemas más sanos y compatibles con live
- evita destruir el pacing actual
- baja el scope a algo implementable

### Su límite

Acepta una tensión importante:

- los mejores timers siguen viviendo alrededor del juego,
- pero no cambian del todo el hecho de que la run sigue siendo el centro casi absoluto del valor.

Si queremos un refactor más profundo, la propuesta correcta es resolver esa tensión, no esquivarla.

## Tesis Central De Esta Propuesta

El juego debería evolucionar hacia un modelo de:

## Expediciones + Santuario Persistente

### Expedición

Es la run actual:

- elegís clase y spec,
- elegís sigil,
- peleás,
- loot,
- crafteás,
- empujás tiers,
- matás bosses,
- avanzás Abismo,
- y eventualmente volvés o prestigias.

### Santuario

Es la nueva capa persistente de cuenta:

- estaciones de trabajo,
- stash limitada,
- contratos,
- investigación,
- cartografía,
- memoria de build,
- proyectos de item,
- infusión de sigilos.

La expedición alimenta al santuario.  
El santuario prepara la siguiente expedición.

Ahí aparece el loop adictivo correcto.

## Nuevo Core Loop Propuesto

### Loop actual

1. Entrás a una run
2. Matás enemigos
3. Mirás loot
4. Crafteás algo
5. Prestigiás
6. Volvés a empezar

### Loop nuevo

1. Entrás al `Santuario`
2. Reclamás jobs terminados
3. Elegís qué investigar, destilar, infundir y mapear
4. Armás tu próxima `Expedición`
5. Jugás la expedición
6. En el final hacés una fase de `Extracción`
7. Elegís qué se vende, qué se destila, qué se archiva y qué entra como proyecto persistente
8. Volvés al Santuario con progreso de cuenta visible
9. Preparás la siguiente expedición

Este loop es más cercano a lo mejor de:

- Gladiatus / Travian: agenda + slots + planificación,
- Warframe: proyectos y anticipación,
- ARPGs de loot: chase de drops y builds.

## Cambio De Filosofía: No Todo Debe Persistir

No recomiendo que todo el gear sobreviva entre runs. Eso mataría demasiada frescura.

Recomiendo una solución intermedia:

## Gear de Run + Proyectos Persistentes

### Gear de Run

- la mayoría de los drops
- sirven para la expedición actual
- siguen siendo efímeros o mayormente efímeros

### Proyectos Persistentes

- una minoría elegida y limitada
- sobreviven en el Santuario
- pueden mejorarse con timers
- generan identidad de cuenta
- son un gran vector de monetización futura

Esta división es la pieza clave que hoy falta.

## Sistema Estructural Nuevo: Santuario

El Santuario sería la nueva capa central de meta-progresión.

No necesariamente tiene que ser una tab al principio, pero conceptualmente sí debe existir como sistema.

### Estaciones del Santuario

1. `Destilería`
2. `Forja Profunda`
3. `Mesa de Cartografía`
4. `Archivo del Códice`
5. `Altar de Sigilos`
6. `Stash / Cámara de Reliquias`
7. `Memoria de Build`

## El Gran Refactor Correcto: Fase De Extracción

Hoy el prestige corta de forma un poco seca.

El mejor cambio profundo que podés hacer es convertir el fin de la run en una **fase de extracción**.

### Qué sería

Al retirarte o prestigiar:

- cobrás ecos y resonancia como hoy,
- pero además pasás por una pantalla de cierre donde decidís:
  - qué item vender,
  - qué item destilar,
  - qué item guardar en stash,
  - qué item marcar como proyecto,
  - qué contrato cerrar,
  - qué sigil dejar infundiéndose,
  - qué investigación arrancar.

### Por qué esto cambia todo

- el final de run se vuelve memorable,
- el loot importa más,
- el jugador siente continuidad,
- y la siguiente run empieza antes de haber empezado.

Esta es probablemente la mejora de diseño más potente de todo el documento.

## Propuesta De Sistemas En Este Refactor Profundo

## 1. Stash De Reliquias / Proyectos

### Rol

Ser el puente entre runs.

### Regla

El jugador tiene pocos slots persistentes:

- `2` slots base,
- más por Abismo, progreso o monetización futura.

### Qué entra ahí

- rares proyecto,
- epics/legendaries especiales,
- blueprints,
- reliquias de boss,
- items marcados como “dignos de preservarse”.

### Qué habilita

- time-gated crafting real,
- apego a drops,
- fantasía de colección,
- largo plazo sin destruir la frescura de cada expedición.

### Monetización futura sana

- más slots de stash,
- más presets,
- mejores filtros y organización.

### Veredicto

**Este sistema cambia el juego para bien.**  
Es el pilar más importante del refactor profundo.

## 2. Destilería De Esencia

Esta idea ya era buena en la propuesta incremental.  
En la versión profunda pasa de ser “recurso extra” a ser una parte central del triage de loot.

### Nuevo rol

Cada drop ahora puede tener tres destinos:

1. `Equipar`
2. `Destilar`
3. `Preservar`

Ese triángulo vuelve más adictivo el acto de mirar items.

### Qué produce la destilería

- esencia,
- polvo de affix,
- trazas de Codex,
- residuo de sigil,
- fragmentos de reliquia,
- catalizadores de Forja Profunda.

### Cambio clave

Ya no debería ser sólo “vender por rareza”.  
La venta sigue existiendo, pero el jugador experto empieza a pensar más en valor de procesamiento que en oro inmediato.

## 3. Altar De Sigilos / Infusión De Sigilos

En la propuesta incremental era una mejora de run.  
En la profunda se vuelve una estación central del Santuario.

### Cómo debería funcionar

- elegís un sigil para la próxima expedición,
- lo ponés a infundir,
- podés dejar también un “perfil de expedición” asociado,
- cuando arrancás la siguiente run, consumís esa preparación.

### Qué cambia del core loop

La run deja de empezar en el momento en que apretás Start.  
Empieza horas antes, cuando empezaste a prepararla.

Eso es exactamente lo que vuelve adictivos a Gladiatus / Travian: la partida “ya está viva” aunque no estés adentro.

## 4. Contratos De Caza

En la versión profunda, los contratos no deberían ser sólo una misión.  
Deben ser la forma en que el Santuario “empuja” una expedición concreta.

### Board recomendado

- `3` contratos visibles
- `1` activo base
- algunos ligados a:
  - familias descubiertas,
  - bosses ya vistos,
  - seeds actuales o futuras,
  - rarezas o tipos de proyecto

### Qué agregaría en esta versión

El contrato debe poder modificar la expedición:

- bonifica un boss slot,
- mejora un target del hunt,
- mejora drop de fragmentos,
- altera recompensas de extracción.

O sea: no sólo recompensa. También **dirige**.

## 5. Investigación Del Códice

En esta versión profunda, el Códice deja de ser sólo un libro de descubrimientos y pasa a ser un **laboratorio de conocimiento**.

### Qué investiga el jugador

- poderes aún incompletos,
- familias,
- bosses,
- afinidad de seeds,
- resonancias de Abismo,
- recetas o blueprints de Forja Profunda.

### Qué genera

- claridad gradual,
- targeteos mejores,
- ventajas de preparación,
- identidad de cuenta.

### Cambio de fantasía

Ya no sos sólo alguien que descubre cosas por matar.  
Sos alguien que estudia, procesa y planea.

Eso es muy potente para retención larga.

## 6. Cartografía Del Abismo

En esta propuesta ya no lo veo sólo como un bonus tardío.  
Lo veo como la forma correcta de convertir al Abismo en un modo de planeamiento, no sólo de escalado.

### Qué cambia

- en vez de correr a ciegas siempre,
- podés preparar una expedición de push,
- podés leer parcialmente la próxima seed,
- podés decidir si vale gastar tus mejores recursos en esa run o esperar otra.

### Qué gana el juego

- más teoría,
- más conversación entre jugadores,
- más expectativa por “la buena run”,
- más rejugabilidad semanal.

## 7. Forja Profunda

Acá sí entra el refactor más grande de crafting.

### Propuesta central

Separar crafting en dos capas:

### `Crafting de Campo`

Lo que ya existe hoy:

- instantáneo,
- táctico,
- de run,
- sirve para ajustar la expedición actual.

### `Forja Profunda`

Nueva capa:

- time-gated,
- de Santuario,
- ligada a stash y proyectos persistentes,
- enfocada en convertir un buen item o reliquia en un proyecto largo.

### Qué acciones movería a Forja Profunda

- upgrades altos de proyectos persistentes,
- reforjas abisales,
- imprints especiales,
- estabilización de affixes,
- craft de reliquias o blueprints.

### Qué NO movería

- reroll base,
- polish base,
- upgrade temprano,
- crafting necesario para que la run funcione.

### Conclusión

La forma correcta de time-gatear crafting no es frenar el crafting actual.  
Es agregar una segunda capa con objetos dignos de esperar.

## 8. Memoria De Build

Esto no da poder directo, pero cambia mucho la salud del loop.

### Qué hace

- guarda presets de clase/spec/talentos/sigil objetivo,
- permite iniciar una expedición con una intención clara,
- se enlaza muy bien con el Altar de Sigilos y con los contratos.

### Por qué importa en un refactor profundo

Cuando el juego gana más preparación entre runs, también necesita menos fricción manual para reentrar.

## Rework Del Prestige En Esta Visión

No eliminaría prestige.  
Pero sí lo reinterpretaría.

## Prestige deja de ser sólo wipe y premio

Pasa a ser:

- `retorno al santuario`,
- `cierre de expedición`,
- `fase de extracción`,
- `reparto de ecos`,
- `reinicio de expedición`.

### Qué mantendría

- ecos,
- árbol de prestige,
- resonancia,
- unlocks de Abismo,
- selección de clase/spec/run.

### Qué cambiaría

- el framing,
- la UX,
- la preparación post-run,
- el hecho de que ahora sí quedan cosas reales entre runs además del meta árbol.

Eso haría que el reset se sienta menos “pierdo todo y vuelvo” y más “cierro una expedición y vuelvo a mi base”.

## Cambio De Economías: Run vs Cuenta

Para que este refactor funcione, conviene separar mejor las economías.

### Recursos de run

- oro,
- gear común,
- parte del crafting rápido,
- consumos tácticos de expedición.

### Recursos de cuenta

- esencia refinada,
- trazas del Códice,
- fragmentos de reliquia,
- catalizadores,
- cargas de cartografía,
- progreso de sigilos,
- jobs del Santuario.

Esta separación ordena mucho el diseño y permite monetización más sana.

## Cómo Cambiaría La Pantalla / UX

## Tab nueva o capa nueva: `Santuario`

No la abriría necesariamente en la primera iteración visual, pero conceptualmente la diseñaría ya.

### Qué agruparía ahí

- jobs activos,
- stash,
- estaciones,
- proyectos,
- contratos,
- investigación,
- claimables.

### Por qué conviene

Si estas features quedan dispersas entre `Crafting`, `Prestige`, `Codex` y `Inventory`, el juego gana profundidad pero no gana identidad nueva.

Si existe el Santuario, el jugador entiende inmediatamente:

“mi cuenta tiene un hogar y mis expediciones alimentan ese hogar”.

## Qué Ganamos En Adicción

Con este refactor, el jugador pasa a tener cuatro momentos de deseo:

### Deseo 1: jugar una expedición

El loop clásico de combate, loot y bosses.

### Deseo 2: cerrar bien una expedición

La fase de extracción vuelve atractivo el final, no sólo el progreso de tiers.

### Deseo 3: volver a reclamar o reconfigurar el Santuario

Esto genera visitas cortas y frecuentes.

### Deseo 4: esperar una gran run futura

El jugador empieza a pensar:

- “esta noche termino la cartografía”
- “mañana saco la reliquia de la forja”
- “el viernes corro la seed buena con el sigil cargado”

Eso es oro puro de retención.

## Qué Ganamos En Monetización Futura

Esta versión habilita una monetización mucho más rica y aun así sana.

### Lo que vendería

- slots de stash,
- slots de destilería,
- slots de investigación,
- slots de forja,
- slots de infusión,
- presets de build,
- filtros premium de organización,
- claim-all,
- rerolls del board de contratos,
- cosméticos del Santuario.

### Lo que seguiría evitando

- poder exclusivo,
- reliquias exclusivas de pago,
- codex unlocks pagos,
- drops target garantizados por dinero,
- speedups infinitos sin límites,
- más carry slots que rompan el balance de run.

## Qué Riesgos Tiene Este Refactor

## Riesgo 1: demasiada complejidad

Solución:

- introducir primero la estructura,
- luego una estación a la vez,
- no abrir todas juntas.

## Riesgo 2: matar la simpleza del juego actual

Solución:

- mantener `Crafting de Campo`,
- mantener runs jugables sin tocar todas las estaciones,
- hacer que el Santuario optimice, no bloquee.

## Riesgo 3: que el jugador sienta que ahora “tiene chores”

Solución:

- jobs que esperan claim,
- claims simples,
- pocas decisiones de alto valor,
- no más de 3–4 estaciones activas en early-mid.

## Riesgo 4: que el carry-over rompa la frescura de run

Solución:

- stash limitada,
- proyectos persistentes escasos,
- mayoría del gear sigue siendo de run.

## Roadmap Del Refactor Profundo

### Fase 0: Preparación Técnica

- separar bien estado `account` vs estado `run`
- crear sistema genérico de `jobs`
- crear `claim/inbox`
- definir tipo de item persistente vs item de run

### Fase 1: Santuario Base

- `Santuario` como capa o tab
- `Destilería`
- `Infusión de Sigilos`
- `Stash de Reliquias` mínima
- fase de `Extracción` al prestigiar

### Fase 2: Dirección De Expedición

- `Contratos de Caza`
- `Investigación del Códice`
- `Memoria de Build`

### Fase 3: Late Game Persistente

- `Cartografía del Abismo`
- `Forja Profunda`
- reliquias/proyectos persistentes más sofisticados

## Si Sólo Pudiéramos Hacer 3 Cambios Profundos

Si hubiera que elegir sólo tres refactors de alto impacto, elegiría estos:

1. `Fase de Extracción` al final de la run
2. `Stash de Reliquias / Proyectos`
3. `Santuario` con jobs account-wide

Esos tres cambios por sí solos ya convierten el juego en algo cualitativamente distinto.

## Veredicto Final

La versión incremental es buena si querés sumar retención sin mover demasiado el juego.  
Pero si querés construir una base mucho más potente, adictiva y monetizable a largo plazo, el camino correcto es este:

## Reinterpretar el juego como una secuencia de expediciones alimentadas por un santuario persistente

No recomiendo:

- time-gatear todo,
- ni copiar Warframe literalmente,
- ni injertar timers aislados sobre sistemas que se reinician.

Sí recomiendo:

- crear persistencia selectiva,
- dar una casa a la cuenta,
- convertir el cierre de run en una decisión importante,
- y dejar que los mejores time gates vivan ahí.

Ese es el refactor profundo que de verdad justificaría cambiar parte del core loop.
