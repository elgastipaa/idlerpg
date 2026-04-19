# MVP 2.0 — Diseño Completo

Fecha: 2026-04-19 UTC  
Proyecto: `idlerpg`  
Estado base usado: código actual + `notes/actual.md` + `notes/roadmap_v2*.md` + `notes/auditoriaRes.md`

## 1. Resumen Ejecutivo

El `MVP 2.0` debe consolidar el juego como un **idle ARPG extraction-lite**, no como un idle ARPG clásico con prestige encima.

La propuesta de valor final del MVP 2.0 es:

**“Cada expedición genera valor táctico inmediato y también alimenta un Santuario persistente donde el jugador transforma botín rescatado en blueprints, conocimiento y preparación para la siguiente run.”**

La dirección correcta no es sumar más sistemas por sumar. Es cerrar cuatro tensiones:

1. que la expedición siga siendo divertida por sí sola,
2. que el Santuario justifique el retorno frecuente,
3. que `Ecos` siga siendo importante sin comerse todo el loop,
4. que los blueprints se vuelvan una obsesión de largo plazo sin dejar que una sola run entregue BIS cerrado.

La conclusión general de esta sesión es:

- la arquitectura nueva del juego es correcta,
- el núcleo de `Santuario -> Expedición -> Extracción -> Santuario` debe mantenerse,
- `Reroll` debe quedarse en expedición para MVP 2.0,
- el cierre fino del item debe quedarse en la capa persistente,
- `Caza` debe seguir como subvista contextual de `Expedición`,
- `Ecos` debe seguir como tab meta desbloqueable,
- el Santuario necesita progresión más visible y onboarding más claro,
- y la monetización correcta para web F2P es **conveniencia + cosmética + capacidad**, nunca poder directo.

Lo más importante a implementar primero no es una feature nueva, sino:

- economía clara,
- unlock order,
- UX del Santuario,
- claridad del blueprint loop,
- y progresión fuerte del jugador en sus primeras 3 sesiones.

---

## 2. Base De Referentes

Esta tabla resume qué se toma, qué se evita y qué se traslada de cada referente.

| Juego | Adoptar | Evitar | Mecánica trasladable |
|---|---|---|---|
| Path of Exile 1 | Endgame modular y especialización fuerte del contenido | Sobrecarga cognitiva temprana y demasiadas capas simultáneas | Especialización por sistema y bosses como contenido de chase [R1] |
| Path of Exile 2 | Atlas/encuentros como mapa de riesgo creciente y subárboles dedicados | Exceso de complejidad visible antes de que el jugador entienda la base | `Abismo` como endgame modular con mutadores y ramas propias [R2] |
| Diablo 3 | Adventure Mode, sesiones cortas claras, GR como escalera simple | Casi todo el valor relegado al endgame puro | `Expedición` como pantalla central de sesión corta; `Ecos` simples de leer [R3] |
| Diablo 4 | Tempering/Masterworking como crafting de acabado; season journey como estructura | Systems bloat y live-ops que compiten demasiado entre sí | `Forja Profunda` como capa de acabado y milestones visibles [R4] |
| Diablo Immortal | Codex de actividades, rutina diaria clara, fuerte session design mobile | Monetización demasiado agresiva y demasiadas checklist surfaces | `Registro`/daily structure y dailies suaves del Santuario [R5] |
| Warframe | Foundry time-gated sana, Companion/Extractor, Nightwave catch-up, Orbiter como hub | Fragmentación de consolas y UX envejecida | `Laboratorio` + estaciones del Santuario + jobs con catch-up [R6] |
| Grim Dawn | Build identity fuerte, dual-class clara, endgame profundo pero legible | UI pesada y poco amable para mobile | Specs con ventanas de poder claras y endgame con identidad [R7] |
| Last Epoch | Crafting determinístico con límite interno (Forging Potential) | Demasiada permisividad si todo fuera igual de controlable | Blueprint progression limitada y controlada, no infinita [R8] |
| Torchlight Infinite | Season hooks rápidos, mobile ARPG veloz, trade/loot inmediato, hero traits distintos | Picos de complejidad y ruido de live-service | Loops rápidos, builds legibles y reintentos frecuentes [R9] |
| Chronicon | Mastery infinita, enchants profundos, endgame-only crafting, drops obsesivos | Exceso de caos numérico si se traslada sin filtros | `Blueprints` como proyecto largo y chase de item-direction [R10] |
| Melvor Idle | Offline summary, mastery pools, tasks persistentes | Pasividad excesiva que reemplaza jugar | `Registro`/summary de retorno y tareas persistentes que acompañan, no reemplazan [R11] |
| Genshin Impact | Daily loop corto, expediciones, red dots, BP simple, onboarding gradual | Energía demasiado rígida y fricción de resina | `Encargos`, notificaciones discretas y sesión de mañana/tarde/noche [R12] |
| Honkai: Star Rail | Trailblaze Power, Assignments, Daily Training, reserve overflow | Riesgo de convertir todo en checklist energética | Jobs persistentes + overflow/catch-up + dailies cortas [R13] |
| Gladiatus / Travian | Sesiones mínimas, tasks escalonadas, expediciones automáticas, progreso por infraestructura | Busywork y timers sin suficientes decisiones | `Encargos`, `Laboratorio`, unlock ladder y recompensas por milestones [R14] |

## Síntesis De Diseño Aplicada

- De `PoE1/2` tomamos profundidad modular, no complejidad inicial.
- De `Diablo 3/4` tomamos claridad de sesión y acabado de gear, no saturación de capas.
- De `Warframe`, `Genshin`, `HSR`, `Melvor`, `Gladiatus` y `Travian` tomamos retorno frecuente, timers con sentido y notificaciones legibles.
- De `Last Epoch` tomamos crafting con límite estructural.
- De `Grim Dawn`, `Chronicon` y `Torchlight Infinite` tomamos build identity, chase y ritmo.

---

# PASADA 1 — Balance y Progresión

## 1.1 Tabla Completa De Recursos

### Recursos principales del MVP 2.0

| Recurso | Fuente actual / target | Sink actual / target | Diagnóstico | Acción MVP 2.0 |
|---|---|---|---|---|
| Oro | Combate, loot, venta de drops | `Atributos`, reroll de campo, economía básica | Bien en early, pierde dientes en late | Mantenerlo como economía de expedición y agregar 1-2 sinks de Santuario livianos |
| XP | Combate, sigilos, progresión natural | N/A directo; sube nivel y unlocks | Correcta como pacing, pero requiere mejor lectura de hitos | Mantener curva, mejorar surfacing |
| Esencia | Loot, Destilería, drops, Sigilo de Forja, Abismo | crafting, Laboratorio, ascensión de blueprints | Sigue siendo el recurso universal correcto | Mantenerla como “pegamento” del sistema |
| Ecos | Extracción con gate cumplido | Árbol de Ecos | Bien como meta, pero debe sentirse más fuerte en early | Mantener mínimo de 2 ecos en primer prestige y reforzar primer spike de gasto |
| Tinta de Biblioteca | `codex_trace`, Encargos, algunas runs | investigaciones de Biblioteca, Laboratorio | Ya tiene sink real, pero todavía pide onboarding | Mantener y explicar mejor |
| Polvo de Reliquia | `relic_shard`, Encargos, bosses/Abismo | estructura, sintonía, ascensión, upgrades de estaciones | Recurso premium sano del Santuario | Mantenerlo como cuello de botella noble |
| Flux de Sigilo | `sigil_residue`, Encargos | Altar de Sigilos | Correcto y legible | Mantener |
| Family Charges | Desguace de items rescatados, algunos Encargos | sesgo de blueprints | Excelente idea, pero necesita mejor claridad | Mantener y mostrar impacto mejor |
| Cargo bundles | Extracción | Destilería | Bueno como “valor bruto procesable” | Mantener y expandir con raridades de cargo a futuro |
| Slots / capacidad | Laboratorio, posible monetización QoL | N/A | Son infraestructura, no moneda | Tratarlo como capa de progresión, no currency |

## Recursos faltantes para MVP 2.0

No falta una moneda nueva principal.  
Sí faltan dos cosas:

1. un **sink de oro late** más claro,
2. una **justificación más visible** de por qué el jugador quiere `codexInk` y `relicDust`.

### Recomendación

No crear otra moneda.  
En cambio:

- usar oro como costo secundario de:
  - extracción avanzada,
  - cambio de blueprint activo,
  - reroll premium de Encargos,
- usar polvo/tinta como monedas nobles de meta.

## 1.2 Ratios De Producción vs Consumo

La economía debe pensarse por **sesión saludable** y no solo por drop individual.

### Definición de sesión objetivo

- Early: `10–15 min`
- Mid: `15–20 min`
- Late: `20–30 min`
- Push de Abismo: `25–40 min`

### Targets de economía por sesión

| Recurso | Early | Mid | Late | Abismo |
|---|---:|---:|---:|---:|
| Oro generado | 3k–6k | 12k–25k | 30k–80k | 80k–180k |
| Oro sinkeable sano | 70–90% | 50–70% | 40–60% | 30–50% |
| Esencia generada | 20–35 | 60–140 | 180–350 | 400–900 |
| Esencia sinkeable sana | 60–80% | 70–90% | 70–95% | 80–95% |
| Tinta generada | 0–6 | 15–35 | 40–90 | 90–180 |
| Tinta sinkeable sana | 0–50% | 70–90% | 80–95% | 85–100% |
| Polvo generado | 0–2 | 4–10 | 12–25 | 25–50 |
| Polvo sinkeable sano | 0–100% | 70–100% | 80–100% | 85–100% |
| Flux generado | 0–2 | 3–6 | 6–10 | 10–16 |
| Charges útiles | 0–4 | 4–10 | 8–18 | 12–30 |

### Juicio de diseño

- `oro` hoy ya cumple early, pero no alcanza late;
- `esencia` ya está cerca de ser el recurso universal correcto;
- `codexInk` recién empieza a vivir bien;
- `relicDust` es el mejor cuello de botella actual;
- `familyCharges` tienen la dirección correcta, pero todavía no “se sienten” lo suficiente.

## 1.3 Curvas de Progresión

## Curva de XP y leveleo

### Target recomendado

- `nivel 5` dentro de los primeros `4–6 min`
- `nivel 10` entre `8–10 min`
- `nivel 12` entre `12–15 min`
- primera run saludable hasta primer eco: `15–20 min`

### Diagnóstico

La curva base es bastante buena para un ARPG idle corto.  
El problema no es la XP en sí; es que el jugador no siempre siente qué destrabó.

### Acción

- no tocar fuerte la curva base,
- sí hacer más visibles:
  - `primer boss`,
  - `primera extracción`,
  - `primer eco`,
  - `primer station unlock`.

## Curva de oro

### Early

Debe permitir:

- un upgrade de atributo cada `90–150s`
- sentir progreso frecuente

### Mid

Debe pasar a:

- un gasto importante cada `3–5 min`
- menos spam, más decisión

### Late

Hoy pierde relevancia.  
Eso no se arregla con inflarlo, sino dándole **sinks secundarios**.

### Acción

- mantener oro como moneda viva de run,
- agregarle dos sinks estructurales:
  - refresh opcional de Encargos,
  - coste de gestión de blueprint/loadout.

## Curva de poder jugador vs enemigos

### Estado sano deseado

- `Warrior`: mejor early y mejor estabilización
- `Mage`: peor arranque, mejor techo técnico
- `Berserker`: mejor early/mid clear
- `Sorcerer`: mejor mid spike y farm burst
- `Juggernaut`: mejor late bossing / abyss sustain
- `Arcanist`: mejor late control y lectura de seed

### Conclusión

No hay que balancear por simetría exacta.  
Hay que balancear por **ventanas de poder**.

## Curva de `Ecos`

### Target

- primer eco real y útil: sesión 1 o 2
- primer gasto importante: inmediatamente después del primer prestige
- segunda compra significativa: dentro de las siguientes `2–3` runs

### Decisión

Mantener:

- mínimo `2 ecos` en el primer prestige
- resonancia por `totalEchoesEarned`

### Ajuste recomendado

El árbol debe garantizar que con `2–4` ecos ya ocurra un cambio real de percepción.  
No alcanza con mejoras demasiado invisibles.

## Curva de Abismo

### Principio

`Abismo` no debe ser sólo multiplicadores.

Tiene que sentirse como:

- cambio de build pressure,
- mejor reward ceiling,
- y capa meta separada.

### Target

- `Abismo I`: primer gran quiebre de dificultad y identidad
- `Abismo II`: primer gran quiebre de crafting
- `Abismo III`: primer quiebre de reward chase
- `Abismo IV`: upgrade fuerte de sigils

Eso ya está bien estructurado.

## 1.4 Balance de clases y builds

Tomando el estado actual del repo y el análisis de `notes/propuestaBalance.md`, la lectura correcta es:

### Warrior

- mejor base general,
- mejor early,
- menos dependencia de ensamblado fino,
- mejor supervivencia por default.

### Mage

- más frágil de base,
- mejor promesa de bossing/control,
- más dependiente de llegar a nodos/loops correctos.

### Estado de las 4 specs

| Spec | Early | Mid | Late | Identidad actual |
|---|---|---|---|---|
| Berserker | Alta | Muy alta | Media | snowball, crit, leech, burst agresivo |
| Juggernaut | Media | Alta | Muy alta | tank/bossing, guard, armor, control del daño recibido |
| Sorcerer | Alta | Muy alta | Media/Alta | burst, opener, chain burst, cataclysm |
| Arcanist | Baja/Media | Alta | Muy alta | control, mark, flow, bossing largo |

### Decisión de diseño

Esto está bien.  
No hay que “igualarlos”. Hay que reforzar que cada uno **cumpla su promesa**.

## Gaps de balance detectados

1. `Mage` sigue pagando demasiado peaje temprano.
2. `Crushing Weight` sigue generando builds trampa.
3. `Juggernaut` ya mejoró, pero su feedback de poder todavía necesita surfacing.
4. `Arcanist` necesita mejor percepción de impacto, no necesariamente más números.

## Recomendaciones de balance

### A. Mage early

- +5% HP base real o equivalente de supervivencia
- o un nodo gratuito/temprano de sustain/control base

Referencia:
- `Grim Dawn` deja que las clases caster arranquen frágiles, pero no mudas [R7]
- `Torchlight Infinite` da identidad rápida a traits desde muy temprano [R9]

### B. Berserker

- mantener como rey de early-mid
- no nerfear daño base salvo que siga eclipsando todo

### C. Juggernaut

- reforzar percepción de “soy inmovible”
- mostrar mejor prevented damage / guard value / anti-boss identity

### D. Sorcerer

- mantenerlo como spec de highlight
- no intentar volverlo el más consistente

### E. Arcanist

- reforzar claridad, no sólo output
- más feedback de control/mark payoff

## 1.5 Loot economy

## Distribución de rarezas objetivo

| Tier band | Common | Magic | Rare | Epic | Legendary |
|---|---:|---:|---:|---:|---:|
| T1–5 | Muy alta | Alta | Baja | Muy baja | Casi nula |
| T6–15 | Media | Alta | Media | Baja | Muy baja |
| T16–25 | Baja | Media | Alta | Media | Baja |
| Abismo I–II | Baja | Media | Alta | Alta | Media |
| Abismo III+ | Baja | Baja | Media | Alta | Alta |

## Rare como endgame crafteable

La decisión actual de empujar `rare` como item proyecto sigue siendo correcta.

Objetivo:

- `rare` debe competir con `epic/legendary` promedio hasta `Abismo I`
- pero no eclipsar `legendary` bien armado en late

## Affixes de Abismo

Deben ser:

- claramente mejores que affixes base promedio,
- pero no tanto mejores que invaliden el chase base demasiado temprano.

### Regla

- `affix base`: define build
- `affix de Abismo`: amplifica build

No debería pasar que:

- el jugador ignore todo el juego base hasta `Abismo II`

## Conclusión De Pasada 1

La economía base del juego ya tiene buena dirección, pero el `MVP 2.0` necesita:

- reforzar sinks de oro late,
- mantener esencia como recurso pegamento,
- hacer más visible el valor de tinta y polvo,
- preservar ventanas de poder distintas entre specs,
- y seguir usando `rare` como pieza-proyecto antes de que `Abismo` tome la posta.

---

# PASADA 2 — Sistemas y Game Design

## 2.1 Estado de completitud de sistemas

| Sistema | Estado | Diagnóstico | Acción MVP 2.0 |
|---|---|---|---|
| Combate core | Completo con iteración | Funciona, pero necesita menos ruido y más feedback de identidad | polish de surfacing |
| Loot loop | Completo con iteración | Correcto, pero la lectura de valor persistente todavía está verde | clarificar extracción y blueprints |
| Forja de campo | Correcta para MVP | Ya está bien reducida a rescate de bases | mantener `Reroll + Extract` |
| Blueprints | Necesita iteración | La dirección es correcta, pero aún necesita UX y pacing | prioridad alta |
| Extracción | Completo con iteración | El verbo correcto ya existe | mejorar copy, rewards y claridad |
| Ecos | Completo con iteración | Buena base; necesita mejor spike perceptivo | ajustes de early resonance |
| Talentos | Completo con iteración | Buen volumen y profundidad | limpiar builds trampa |
| Sigilos | Completo | Muy buenos como run direction | integrar mejor con Santuario |
| Caza | Completo | Ya es contextual y correcta | seguir sin spoilers |
| Biblioteca | Necesita iteración | La separación conceptual es buena, UX todavía no del todo | mejorar research flow |
| Destilería | Completo con iteración | Funciona como base de refinery | expandir recetas recién post-MVP |
| Encargos | Necesita iteración | Buena base, todavía algo genérica | subir decisión y especificidad |
| Altar de Sigilos | Completo con iteración | Bueno, pero necesita mejor feedback de payoff | surfacing y progression |
| Forja Profunda | Necesita iteración fuerte | Núcleo correcto, todavía no obsesivo | prioridad alta |
| Laboratorio | Completo con iteración | Ordena el hub y el onboarding | mejorar unlock story |
| Bosses seeded | Completo | Buena base estructural | balance fino |
| Abismo | Completo con iteración | Ya es sistema real, falta tuning | reward pacing |
| Registro / telemetría | Completo | Muy útil para tester y diseño | usarlo mejor |

## 2.2 Sistemas time-gated: MVP 2.0 vs posterior

| Sistema | Decisión | Motivo |
|---|---|---|
| Forja en Reposo / Forja Profunda | MVP 2.0 | Es el corazón del proyecto persistente |
| Cola de Destilación | MVP 2.0 | Retorno simple, legible y sano |
| Sintonía de Sigil / Altar | MVP 2.0 | Da preparación entre runs sin reemplazar jugar |
| Biblioteca / Research | MVP 2.0 | Cierra `codexInk` y da progreso horizontal |
| Encargos del Santuario | MVP 2.0 | Cubre sesiones cortas y loop paralelo |
| Resonancia de Ecos | MVP 2.0 | Ya es capa meta real |
| Cámara de Incubación separada | Post-MVP 2.1 | Aún duplicaría demasiado con blueprints |
| Contrato de Cazador full | Post-MVP 2.1 | Hoy `Caza + Encargos` ya cubren lo mínimo |
| Altar de Prestige separado | No va como sistema separado | `Ecos` ya cumple ese rol |
| Expedición Autónoma | Post-MVP 2.2 | Riesgo alto de canibalizar la run manual |

## 2.3 Sistemas faltantes

### Faltante real 1: Progression story del Santuario

Hoy ya existe `Laboratorio`, pero la fantasía no está del todo cerrada.

Falta:

- que cada desbloqueo cuente una historia,
- y que el jugador entienda “qué cambió” al abrir una estación.

### Faltante real 2: Session glue

Hace falta un layer liviano entre:

- claims del Santuario
- y volver a la run

Eso puede resolverse con:

- resúmenes mejores,
- toasts,
- y notificaciones ordenadas,
- no con más sistemas.

### Faltante real 3: Blueprint payoff

Es el mayor gap del juego hoy.

El blueprint ya existe, pero el jugador todavía no siente del todo:

- por qué debería obsesionarse con uno,
- cuándo reemplazarlo,
- y cómo cambia la run futura.

## 2.4 Los 5 momentos más adictivos

1. **Primer drop claramente mejor que el equipado**  
   Sigue siendo la base ARPG sana.  
   Referentes: `Diablo 3/4`, `Torchlight Infinite`, `Chronicon` [R3][R4][R9][R10]

2. **Primer boss / seed reveal / Caza contextual**  
   Convierte una run genérica en una run con dirección.

3. **Extraer un item valioso y decidir blueprint vs desguace**  
   Este es el momento diferencial del juego frente a un idle ARPG clásico.

4. **Reclamar jobs y reinvertir en el Santuario**  
   Warframe, Genshin y HSR viven mucho de esta micro-rutina sana [R6][R12][R13].

5. **Materializar un blueprint en la siguiente run y sentir el sesgo**  
   Este debería ser el momento más adictivo del MVP 2.0 y todavía no lo es lo suficiente.

## 2.5 Los 5 momentos de mayor fricción / abandono

1. **No entender para qué sirve volver al Santuario**  
   Solución: onboarding y priorización visual.

2. **No sentir por qué el blueprint es mejor que “guardar el item”**  
   Solución: tutorial mental y mejor preview genérica.

3. **Exceso de nombres/sistemas nuevos antes del primer prestige**  
   Solución: unlocks progresivos más claros.

4. **Ciertas builds parecen peores, no “distintas”**  
   Solución: ventanas de poder explícitas y feedback mejor.

5. **Recursos que existen pero no se entienden**  
   Solución: tooltips de loop y traducción a resultados.

## 2.6 Acciones concretas

### Amplificar los momentos adictivos

- mostrar mejor comparaciones de drops
- reforzar visualmente el reveal de boss/seed
- resaltar decisiones de extracción
- mejorar claims del Santuario
- reforzar el payoff del blueprint materializado

### Reducir los momentos de fricción

- onboarding por capas
- bloques de “esto destraba aquello”
- lenguaje consistente entre `Caza`, `Biblioteca`, `Ecos`, `Laboratorio`
- menos ruido y más claridad en Santuario

## Conclusión De Pasada 2

El `MVP 2.0` no necesita 10 sistemas más.  
Necesita:

- terminar de cerrar los sistemas que ya existen,
- decidir con firmeza que el blueprint es el proyecto persistente,
- y que el Santuario es la home real del juego.

---

# PASADA 3 — UI/UX y Experiencia de Jugador

## 3.1 Arquitectura final de navegación

## Decisión final

Se mantiene y se consolida esta arquitectura:

### Tabs primarias

1. `Santuario`
2. `Expedición`
3. `Heroe`
4. `Ecos`
5. `Registro`

### Decisión sobre `Caza`

`Caza` **no** merece tab primaria.

Justificación:

- fuera de una run su valor cae mucho,
- durante la run sí es útil, pero como referencia táctica,
- los referentes grandes la empujarían a subvista contextual:
  - `Diablo 3/4`: journals, codex, activities y seasonal structures no ocupan bottom nav principal [R3][R4]
  - `Warframe`: Codex, Foundry y sistemas laterales viven en Orbiter o menús secundarios [R6]
  - `PoE` y `Grim Dawn`: la lectura táctica vive ligada a la actividad, no como navegación global permanente [R1][R2][R7]

### Decisión sobre unlock progresivo

Sí, debe existir unlock progresivo de tabs.

Regla final:

- `Santuario`, `Expedición`, `Heroe`, `Registro`: desde el inicio
- `Ecos`: se muestra recién al primer prestige / primera conversión a ecos
- `Caza`: se muestra como subvista dentro de `Expedición` cuando ya aporta información útil

Eso mejora onboarding y reduce ansiedad de “tabs vacías”.

## 3.2 Estructura de `Registro`

No habrá un `Más` separado para MVP 2.0.  
`Registro` cumple ese rol.

Contiene:

- `Logros`
- `Metricas`
- `Sistema`

Así el bottom nav sigue en 5 ítems.

## 3.3 Layout final de pantallas

## `Santuario`

```text
┌────────────────────────────────────┐
│ SANTUARIO                          │
│ Estado expedición + CTA principal  │
├────────────────────────────────────┤
│ Claims listos                      │
├────────────────────────────────────┤
│ Recursos persistentes              │
├────────────────────────────────────┤
│ Estaciones                         │
│ Biblioteca / Destilería / Altar    │
│ Encargos / Forja / Laboratorio     │
├────────────────────────────────────┤
│ Operativa: stash + jobs            │
└────────────────────────────────────┘
```

### Jerarquía

- arriba: `CTA`
- segundo: `claims`
- tercero: recursos
- cuarto: estaciones
- abajo: stash y jobs

### Inline vs overlay

- cards inline,
- detalle en overlay,
- nunca estaciones gigantes inline.

## `Expedición`

```text
┌────────────────────────────────────┐
│ [Combate] [Mochila] [Forja] [Caza] │
├────────────────────────────────────┤
│ Vista activa                       │
└────────────────────────────────────┘
```

### Regla

- no meter resumen redundante arriba si la subvista ya lo muestra
- en mobile, el contenido debe respirar

## `Heroe`

```text
┌────────────────────────────────────┐
│ [Ficha] [Atributos] [Talentos]     │
├────────────────────────────────────┤
│ Vista activa                       │
└────────────────────────────────────┘
```

### Regla

- build first
- cero ruido extra en header interno

## `Ecos`

```text
┌────────────────────────────────────┐
│ Resonancia actual                  │
│ Ecos disponibles / total           │
├────────────────────────────────────┤
│ Árbol por ramas                    │
├────────────────────────────────────┤
│ Momentum y resumen de la run       │
└────────────────────────────────────┘
```

### Regla

- una sola pantalla meta fuerte
- no duplicar explicación de extracción

## `Registro`

```text
┌────────────────────────────────────┐
│ [Logros] [Metricas] [Sistema]      │
├────────────────────────────────────┤
│ Vista activa                       │
└────────────────────────────────────┘
```

### Regla

- jugador primero, tester después
- default: `Logros`

## Layout de estaciones

### Biblioteca

- arriba: tinta disponible + jobs
- medio: familias / bosses / powers listos para investigar
- abajo: archivo / glosario

### Destilería

- arriba: bundles disponibles
- medio: recetas
- abajo: cola y claims

### Altar

- arriba: flux disponible
- medio: sigilos infusionables
- abajo: cargas guardadas y jobs

### Encargos

- arriba: equipos disponibles
- medio: tipos de encargo
- abajo: jobs, cancelación y claims

### Forja Profunda

- izquierda / arriba: selección de blueprint
- centro: afinidades, estructura, tune, ascensión
- abajo: activar / descartar / costos

### Laboratorio

- arriba: investigaciones activas/listas
- medio: unlocks
- abajo: upgrades de slots y speed

## 3.4 Lista de problemas de QoL actuales y solución

| Problema | Solución concreta |
|---|---|
| El Santuario puede sentirse como menú largo | compactar cards, claims condicionales, menos texto |
| Cuesta entender para qué sirve cada recurso | etiquetar por resultado, no por nombre aislado |
| El valor del blueprint no siempre se siente | preview genérica mejor y tutorial mental claro |
| La primera extracción puede ser confusa | overlay más pedagógico en la primera vez |
| `Biblioteca` aún se percibe como “Codex viejo” | separar mejor archivo vs investigación |
| `Registro` mezcla jugador/tester | mantener `Sistema` al fondo y default en `Logros` |
| Santuario y estaciones todavía tienen copy desigual | unificar tono y CTA |
| No siempre se ve qué desbloquea cada hito | badges “desbloquea” y “siguiente paso” |
| `Caza` podía spoilear demasiado | mantener only seen / revealed info |
| Jobs listos pueden perderse | badges en bottom nav y card de claims arriba |

## 3.5 Onboarding de 3 capas

## Primer minuto

Objetivo:

- que el jugador entienda:
  - “elijo héroe”
  - “entro a expedición”

Mostrar:

- `Heroe`
- `Expedición`
- `Santuario` básico

No explicar todo el Santuario todavía.

## Primera run

Objetivo:

- que vea:
  - drops,
  - primer boss,
  - `Caza`,
  - extracción.

Hito:

- “No todo se equipa; algunas piezas se rescatan.”

## Primer prestige

Objetivo:

- destrabar `Ecos`
- enseñar:
  - extracción -> ecos,
  - resonancia,
  - Laboratorio y estaciones como siguiente capa

Hito:

- “El juego ya no termina en la run; ahora empieza la cuenta.”

## 3.6 Notificaciones y feedback

### Modelo recomendado

Inspirado en:

- `Genshin`: red dots discretos [R12]
- `HSR`: activity claims y assignments legibles [R13]
- `Warframe`: alerts y Nightwave, pero sin copiar su ruido [R6]

### Reglas

1. **Bottom nav**
   - `Santuario`: badge por claims/jobs listos
   - `Ecos`: badge si hay ecos sin gastar
   - `Registro`: badge solo para logros nuevos

2. **Cards de estación**
   - muestran estado:
     - `libre`
     - `ocupada`
     - `lista`
     - `bloqueada`

3. **Toasts**
   Solo para:
   - primera extracción,
   - investigación lista,
   - ascensión de blueprint lista,
   - nuevo unlock de tab/estación

4. **No usar**
   - modales por todo,
   - spam de claims,
   - tooltips largos para conceptos básicos.

## Conclusión De Pasada 3

La UI correcta del MVP 2.0 ya no es la del juego viejo con tabs heredadas.  
La forma final debe consolidar:

- `Santuario` como home,
- `Expedición` como loop principal,
- `Heroe` como dominio de build,
- `Ecos` como meta,
- `Registro` como capa secundaria,
- y las estaciones como overlays potentes, no como pantallas top-level.

---

# PASADA 4 — Monetización y Retención

## 4.1 Validación del modelo

El modelo propuesto es correcto con un ajuste:

### Mantener

- F2P web
- compras directas
- sin moneda premium intermediaria
- línea ética en QoL y conveniencia
- nunca poder directo

### Ajuste recomendado

No vender nada que arregle una fricción básica del core loop.

Eso significa:

- no vender “vidas extra” base,
- no vender research mandatory,
- no vender power spikes exclusivos,
- no vender rushes de progreso inicial como si fueran peaje.

## 4.2 Catálogo recomendado para MVP 2.0

| Producto | Precio sugerido | Tipo | Por qué es safe |
|---|---:|---|---|
| Founder Pack I | USD 4.99 | apoyo + cosmética | no cambia poder |
| Founder Pack II | USD 9.99 | apoyo + cosmética + iconografía | no cambia poder |
| Santuario Skin Pack | USD 5.99 | cosmético | pura personalización |
| Theme / UI Pack | USD 3.99 | cosmético | sin impacto sistémico |
| Extra Blueprint Page | USD 2.99 | conveniencia | organización, no poder directo |
| Extra Saved Loadout | USD 2.99 | conveniencia | reduce fricción, no buffea |
| Station Slot Pack (1 slot) | USD 4.99 | conveniencia | acelera paralelismo, no sube números base |
| Registro Pro / Replay Tools | USD 4.99 | tester / enthusiast | no afecta progreso del jugador estándar |
| Cosmetic Bundle mensual rotativo | USD 6.99–9.99 | cosmético | monetización limpia |
| Supporter Bundle grande | USD 14.99 | bundle | ideal para early adopters |

## Productos que NO deben entrar en MVP 2.0

- rush directo de `Ecos`
- compra de polvo/tinta/cargas
- segundos sigilos pagos
- blueprints premium
- affixes exclusivos pagos

## Conversión esperada por categoría

| Categoría | Conversión esperada | Comentario |
|---|---:|---|
| Founder packs | 3–6% de D30 | mejor primera monetización |
| Cosméticos | 1.5–3% | requiere identidad visual fuerte |
| QoL slots | 2–4% | buena si los slots free son generosos |
| Herramientas pro/tester | <1% | nicho, pero útil |

## 4.3 Loop diario

### Mañana — `2–5 min`

- abrir `Santuario`
- reclamar
- relanzar jobs
- revisar si hay investigación lista
- salir

Cubre:

- Distilería
- Encargos
- Biblioteca
- Altar

Inspiración:

- `Genshin` expeditions + commissions [R12]
- `HSR` assignments + daily training [R13]
- `Warframe` extractor/foundry companion check [R6]

### Tarde — `10–20 min`

- expedición corta
- farm de loot / boss
- extracción parcial o completa

### Noche — `20–45 min`

- run larga o push de Abismo
- caza específica
- gestión de blueprint
- inversión en Santuario

## 4.4 Loop semanal

### Semana base

- `2–4` investigaciones de Biblioteca
- `1–2` upgrades del Laboratorio o estaciones
- `1–3` mejoras estructurales de blueprint
- `1` push profundo de Abismo

### Evento de fin de semana recomendado

Sí conviene un evento semanal, pero mínimo.

Propuesta MVP:

- `Ventana de Intensificación`
- viernes-domingo
- +20% chance de `cargo raro`
- +1 recompensa adicional en un Encargo largo
- +1 use de investigación instantánea gratis al día

Esto:

- da razón para volver,
- no rompe la economía,
- y no requiere live-ops complejísima.

## 4.5 Retención de largo plazo

### 30 días

El jugador debe seguir por:

- progreso de `Ecos`
- primera cartera real de blueprints
- primeras ascensiones
- primer Abismo serio

### 90 días

Debe seguir por:

- build portfolio
- segundo slot de sigil
- objetivos de Biblioteca altos
- perfeccionamiento de proyectos
- evento semanal / live cadence

### Qué tenemos que Melvor y Chronicon no combinan igual

- de `Melvor`: retención pasiva [R11]
- de `Chronicon`: item obsession [R10]

La combinación distintiva del juego es:

**retención pasiva + ARPG run loop + extracción + blueprints persistentes**

Eso es lo realmente defendible del producto.

## 4.6 Métricas a trackear

| Métrica | Qué responde |
|---|---|
| Tiempo hasta primera extracción | ¿Se entiende el loop? |
| Tiempo hasta primer eco | ¿El prestige onboarding funciona? |
| % de players que crean primer blueprint | ¿El sistema se entiende? |
| % blueprint vs desguace | ¿La economía de decisiones funciona? |
| Tiempo entre sesiones de Santuario | ¿Los jobs están invitando retorno? |
| Claim rate por estación | ¿Qué estaciones son realmente útiles? |
| Estructura promedio de blueprint alcanzada | ¿La Forja Profunda escala? |
| Ascension rate de blueprints | ¿El loop largo es atractivo o demasiado caro? |
| Churn antes de Tier 5 | ¿El onboarding inicial falla? |
| Churn entre Tier 5 y primer eco | ¿La transición a meta falla? |
| Uso de Caza | ¿La subvista agrega valor? |
| Uso de Registro/Métricas | ¿la UX tester está bien aislada? |
| Tiempo desde claim a relanzar job | ¿la rutina del Santuario funciona? |
| Frecuencia de extracción de emergencia | ¿la muerte sigue siendo demasiado dura? |
| Conversión por SKU | ¿Qué productos son aceptables para la audiencia? |

### Uso de telemetría y replay

`Registro` y replay no deben quedarse como feature interna muerta.  
Deben informar:

- balance real por build,
- muertes injustas,
- runs demasiado largas,
- bots/timers poco usados,
- pacing del primer prestige.

## Conclusión De Pasada 4

El modelo F2P web con compras directas es correcto si se mantiene una línea dura:

- vender organización,
- vender paralelismo moderado,
- vender estética,
- no vender solución a problemas básicos del core,
- no vender poder.

---

# PASADA 5 — Roadmap Del MVP 2.0

## 5.1 Qué es exactamente el MVP 2.0

## Incluye

- loop completo `Santuario -> Expedición -> Extracción -> Santuario`
- bottom nav final:
  - `Santuario`
  - `Expedición`
  - `Heroe`
  - `Ecos`
  - `Registro`
- `Caza` como subvista de `Expedición`
- `Biblioteca`, `Destilería`, `Altar`, `Encargos`, `Forja Profunda`, `Laboratorio`
- blueprints persistentes con:
  - afinidades
  - estructura
  - sintonía
  - ascensión
- investigación de Biblioteca
- progresión de Laboratorio
- extracción unificada con ecos
- Abismo funcional con hitos
- sistema base de notificaciones
- onboarding por capas
- primer catálogo ético de monetización

## No incluye

- Expedición Autónoma full
- Cámara de Incubación separada
- Contrato de Cazador full como estación independiente
- pase de temporada
- suscripción
- monetización de power
- guild systems nuevos
- live-ops compleja semanal más allá de un evento simple

## Propuesta de valor en una frase

**Un idle ARPG donde cada run genera decisiones inmediatas y también alimenta un Santuario persistente que convierte botín rescatado en progreso de cuenta, conocimiento y blueprints a largo plazo.**

## 5.2 Roadmap por fases

## Fase 1 — Core estable

Objetivo:

- que el loop nuevo se entienda y se sienta bien

Incluye:

- economía base y sinks
- UX del Santuario
- claridad de extracción
- claridad de blueprints
- primer prestige spike
- surfacing de Biblioteca
- bugs y performance de navegación

## Fase 2 — Sistemas nuevos / cierre de sistemas

Objetivo:

- consolidar el Santuario como segunda mitad del juego

Incluye:

- pulido fuerte de Forja Profunda
- upgrades de Laboratorio
- Encargos 2.0
- eventito semanal ligero
- mejores notificaciones y summaries

## Fase 3 — Pulido y QoL

Objetivo:

- bajar fricción y dejar el juego lanzable

Incluye:

- onboarding por capas
- red dots / badges / claims
- copy unificada
- mejores comparaciones de loot
- mejor readability de build power

## Fase 4 — Monetización

Objetivo:

- activar monetización solo cuando el producto ya es confiable

Incluye:

- Founder packs
- cosmetics
- slot packs
- analytics de conversión

## 5.3 Tabla maestra de priorización

| Feature | Fase | Retención | Monetización | Esfuerzo | Dependencias |
|---|---|---|---|---|---|
| Claridad de extracción | 1 | Alto | Medio | Medio | ninguna |
| Claridad de blueprint loop | 1 | Alto | Alto | Medio | extracción |
| Onboarding por capas | 1 | Alto | Bajo | Medio | navegación final |
| Balance primer prestige / primer eco | 1 | Alto | Bajo | Bajo | ninguna |
| Economía de recursos/sinks | 1 | Alto | Medio | Medio | sistemas actuales |
| Biblioteca UX y research clarity | 1 | Medio | Bajo | Medio | Biblioteca |
| Laboratorio progression clarity | 1 | Medio | Medio | Bajo | Santuario |
| Forja Profunda v2 polish | 2 | Alto | Alto | Alto | blueprints |
| Encargos 2.0 | 2 | Medio | Medio | Medio | Santuario |
| Evento semanal ligero | 2 | Medio | Medio | Medio | métricas base |
| Notificaciones / badges | 3 | Alto | Bajo | Medio | navegación |
| Mejor compare de loot/drop | 3 | Alto | Bajo | Medio | inventory UI |
| Build feedback / class clarity | 3 | Medio | Bajo | Medio | combat UX |
| Founder packs | 4 | Bajo | Alto | Bajo | producto estable |
| Slot/QoL store | 4 | Bajo | Alto | Bajo | infraestructura estable |

## 5.4 Riesgos del roadmap

### Riesgo 1: demasiada infraestructura, poco placer inmediato

Mitigación:

- mantener `Reroll` en expedición
- mantener valor inmediato del loot

### Riesgo 2: blueprints demasiado débiles

Mitigación:

- mostrar impacto mejor
- ajustar costos y sesgos

### Riesgo 3: blueprints demasiado fuertes

Mitigación:

- mantener reemplazo por drops de tier más alto
- limitar caps y ascensiones

### Riesgo 4: Santuario como checklist

Mitigación:

- no meter más de 5–6 estaciones activas reales en MVP 2.0
- notificaciones discretas

### Riesgo 5: monetización percibida como impuesto

Mitigación:

- free slots generosos
- nada de vender soluciones básicas

## 5.5 Post-MVP 2.0

## v2.1

- Contrato de Cazador real
- garantía parcial de familia en blueprints altos
- más recetas de Forja Profunda
- Abismo con eventos/biomas más marcados

## v2.2

- Expedición Autónoma lite
- Cámara de Incubación si sigue haciendo falta
- mayor live cadence

## Suscripción mensual

No antes de que existan:

- D30 real
- loop semanal estable
- cosméticos suficientes
- jobs/claims ya adoptados

Ventana sana:

- después del MVP 2.0 estabilizado, no antes de `v2.2`

## Season Pass

No para MVP 2.0.

Antes hace falta:

- cadencia de parches
- evento semanal funcionando
- loop semanal claro
- contenido temático repetible

Ventana sana:

- post `v2.2`, idealmente con primera “temporada” del Santuario/Abismo

---

## 6. Tabla Maestra De Features Priorizadas

| Prioridad | Feature | Impacto | Esfuerzo | Decisión |
|---|---|---|---|---|
| 1 | Blueprint loop claro y visible | Muy alto | Medio | hacer ya |
| 2 | Onboarding de 3 capas | Muy alto | Medio | hacer ya |
| 3 | Economía y sinks ordenados | Muy alto | Medio | hacer ya |
| 4 | Santuario UX compacta y orientada a claims | Alto | Medio | hacer ya |
| 5 | Primer prestige / primer eco memorable | Alto | Bajo | hacer ya |
| 6 | Biblioteca clara y útil | Alto | Medio | hacer ya |
| 7 | Forja Profunda como proyecto obsesivo | Muy alto | Alto | fase 2 |
| 8 | Encargos con más identidad | Medio | Medio | fase 2 |
| 9 | Notificaciones suaves y badges | Alto | Medio | fase 3 |
| 10 | Monetización ética de slots/cosmética | Alto revenue | Bajo | fase 4 |
| 11 | Evento semanal ligero | Medio | Medio | fase 2 |
| 12 | Contrato de Cazador real | Medio | Alto | post MVP |
| 13 | Expedición Autónoma | Medio | Alto | post MVP |

---

## 7. Los 10 cambios más impactantes a implementar primero

1. Hacer que el jugador entienda perfectamente el loop `extraer -> blueprint/desguace -> próxima run`.
2. Reforzar el primer prestige para que `Ecos` se sienta como quiebre real.
3. Compactar y priorizar el `Santuario` como dashboard de sesión corta.
4. Mejorar la UX de `Biblioteca` para que `codexInk` deje de sentirse abstracta.
5. Mostrar mucho mejor el payoff de estructura/sintonía/ascensión del blueprint.
6. Mantener `Reroll` en expedición y no mover toda la agencia al Santuario.
7. Agregar sinks secundarios de oro late para que no se muera la economía de run.
8. Establecer un onboarding en 3 capas con unlocks bien narrados.
9. Introducir un sistema de notificaciones discreto y consistente.
10. Lanzar monetización sólo después de que el producto ya se entienda sin fricción.

---

## 8. Fuentes de referencia usadas

- [R1] Path of Exile — Atlas of Worlds: https://pathofexile.fandom.com/wiki/Atlas_of_Worlds
- [R2] Path of Exile 2 — Early Access / Atlas Passive Skills: https://pathofexile2.wiki.fextralife.com/Early%2BAccess and https://pathofexile2.wiki.fextralife.com/Atlas%2BPassive%2BSkills
- [R3] Diablo 3 — Adventure Mode / Greater Rifts / Kanai’s Cube: https://diablo.fandom.com/wiki/Adventure_Mode and https://www.diablowiki.net/Greater_Rifts and https://diablo.fandom.com/wiki/Kanai%27s_Cube
- [R4] Diablo 4 — Season Journey / Infernal Hordes / Tempering / Masterworking: https://diablo4.wiki.fextralife.com/Season%2BJourney and https://news.blizzard.com/en-us/diablo4/24119591/slay-endless-demons-in-season-of-the-infernal-hordes and https://diablo4.wiki.fextralife.com/Tempering%2BGuide and https://diablo4.wiki.fextralife.com/Masterworking%2BGuide
- [R5] Diablo Immortal — Battle Pass / Codex / Elder Rifts: https://diabloimmortal.wiki.fextralife.com/Battle%2BPass and https://diablo.fandom.com/wiki/Codex_%28Diablo_Immortal%29 and https://diabloimmortal.wiki.fextralife.com/rifts
- [R6] Warframe — Foundry / Companions / Nightwave / Extractors: https://support.warframe.com/hc/en-us/articles/38385820873741-Foundry-and-Crafting-FAQ and https://support.warframe.com/hc/en-us/articles/38823929417741-Companions and https://warframe.fandom.com/wiki/Nightwave and https://support.warframe.com/hc/en-us/articles/200492204-Extractors
- [R7] Grim Dawn — Masteries / Devotion / Shattered Realm: https://grimdawn.fandom.com/wiki/Masteries and https://grimdawn.fandom.com/wiki/Devotion and https://grimdawn.fandom.com/wiki/Mastering_the_Shattered_Realm
- [R8] Last Epoch — Crafting / Forging Potential: https://lastepoch.fandom.com/wiki/Crafting and https://www.icy-veins.com/last-epoch/crafting-guide
- [R9] Torchlight Infinite — current seasonal structure and hero traits: https://torchlight.xd.com/en/ and https://torchlight.xd.com/en/ep10
- [R10] Chronicon — game features / enchanting depth: https://store.steampowered.com/app/375480/Chronicon and https://chronicon.fandom.com/wiki/Enchanting
- [R11] Melvor Idle — Offline Progression / Mastery / Tasks: https://wiki.melvoridle.com/w/Offline_Progression and https://wiki.melvoridle.com/index.php?title=Mastery and https://wiki.melvoridle.com/w/Township/Tasks
- [R12] Genshin Impact — Expeditions / Commissions / Battle Pass: https://genshin-impact.fandom.com/wiki/Expedition and https://genshin-impact.fandom.com/wiki/Commission and https://genshin-impact.fandom.com/wiki/Battle_Pass
- [R13] Honkai: Star Rail — Trailblaze Power / Daily Training / Assignments: https://honkai-star-rail.fandom.com/wiki/Trailblaze_Power and https://honkai-star-rail.fandom.com/wiki/Interastral_Peace_Guide/Daily_Training and https://honkai-star-rail.fandom.com/wiki/Assignments
- [R14] Travian / Gladiatus — Adventures / Tasks / Browser session design: https://support.travian.com/en/support/solutions/articles/7000060172-adventures and https://support.travian.com/en/support/solutions/articles/7000060702-task-system and https://gameforge.com/en-GB/games/gladiatus.html and https://gladiatus.fandom.com/wiki/Expeditions

