# Propuesta Final: Rework Time-Gated Para El Juego Live

Fecha: 2026-04-18  
Scope: propuesta final de rework para introducir mecánicas time-gated en el juego ya lanzado, maximizando retención, planificación y monetización futura sin romper el loop actual ni volverlo pay-to-win.

## Resumen Ejecutivo

La mejor dirección para el juego no es sumar muchos timers sueltos. Es crear una sola capa nueva de **preparación, investigación y procesamiento** que se apoye sobre los sistemas que ya son fuertes hoy:

- runs seeded con sigils,
- bosses y Codex,
- loot y crafting,
- prestige + Abismo,
- rare como item-proyecto.

La conclusión después de cruzar las 3 propuestas, el estado real del juego y las inspiraciones tipo Gladiatus / Travian / Warframe es esta:

1. **No conviene time-gatear el combate base ni el progreso mínimo.**
2. **Sí conviene time-gatear decisiones de preparación, targeting, conversión y optimización.**
3. **Los mejores timers para este juego son account-wide o pre-run, no timers largos sobre items de run.**
4. **Si alguna parte del crafting se time-gatea, tiene que ser una capa separada y de late game, no reemplazar todo el crafting instantáneo.**

Mi recomendación final es implementar una nueva capa con **5 sistemas núcleo**:

1. `Destilería de Esencia`
2. `Infusión de Sigilos`
3. `Contratos de Caza`
4. `Investigación del Códice`
5. `Cartografía del Abismo`

Y dejar explícitamente como **fase posterior / opt-in**:

6. `Forja Profunda` para proyectos de item de late, sólo si antes resolvemos bien la tensión entre timers y prestige.

## Qué Aprendemos De Las Inspiraciones

### Gladiatus / Travian

Lo adictivo de esos juegos no viene de “esperar para cobrar”. Viene de:

- presión de slots,
- planificación de corto y mediano plazo,
- decisiones de prioridad,
- retorno frecuente con sensación de agenda,
- progreso visible aunque no estés jugando activamente,
- promesa de optimización continua.

La traducción correcta para este juego no es meter granjas o edificios porque sí. Es crear una agenda de:

- qué estoy preparando para la próxima run,
- qué estoy investigando,
- qué target estoy persiguiendo,
- qué drops convierto,
- qué seed me conviene explotar.

### Warframe

Lo mejor de Warframe no es el timer por sí mismo. Es:

- anticipación,
- valor percibido del objeto/proyecto,
- deseo de volver a reclamar algo terminado,
- monetización futura por conveniencia y velocidad, no por power directo obligatorio.

La lección para este juego:

- los timers deben aplicarse a proyectos con identidad,
- no al loop base de “mato, looteo, comparo, equipo”.

## Qué Aprendemos De Las 3 Propuestas

### Lo mejor de `propuesta_time_gated_1`

- `Forja en Reposo`
- `Cola de Destilación`
- `Contratos de Cazador`
- `Sintonía de Sigil`

Fue la propuesta más alineada con el juego actual y con monetización sana por conveniencia.

### Lo mejor de `propuesta_time_gated_2`

- `Cartografía del Abismo`
- `Forja de Almas`
- `Sintonía de Códice`
- `Cosecha de Ecos`

Fue la mejor para pensar capas meta, pero varias ideas pisan demasiado el prestige actual o abren refactors grandes.

### Lo mejor de `propuesta_time_gated_3`

- `Forge Queue`
- `Sigil Infusion`
- `Boss Hunt Contracts`
- `Codex Research`
- `Rift Mapping`

Fue la mejor para ordenar el espacio de diseño y separar ideas seguras de ideas peligrosas.

## Diagnóstico Del Juego Live Hoy

El juego ya tiene muy buenos pilares:

- runs con dirección por sigil,
- bosses y comunes seeded,
- Abismo como escalado real,
- crafting con varias decisiones,
- Codex/hunt que ya da chase,
- prestige con árbol y resonancia,
- rare como proyecto de endgame.

Lo que todavía falta para aumentar adicción y monetización futura:

- una razón clara para volver varias veces por día,
- una agenda entre runs,
- más presión de slots y colas,
- más conversión de drops en progreso meta,
- más preparación deliberada antes de arrancar o reiniciar una run.

## Restricción Estructural Más Importante

Hay una verdad de diseño que no conviene ignorar:

- hoy el prestige reinicia `oro`, `equipo`, `talentos` y la corrida.

Eso significa que los timers largos sobre items de run tienen más riesgo que en Warframe o PoE. Si time-gateamos mal el upgrade o el crafting central, el sistema puede sentirse frustrante porque el jugador puede prestigiar antes de capitalizarlo.

Por eso propongo separar claramente:

### Timers que sí encajan hoy

- account-wide,
- pre-run,
- research,
- distillation,
- scouting,
- targeting,
- preparación de sigils.

### Timers que hoy son riesgosos

- upgrades largos sobre gear de run,
- crafting base obligatorio para avanzar,
- incubaciones de 24h sobre items que se pierden al prestigiar.

## Principios De Diseño

1. **Tiempo como preparación, no como peaje.**
2. **El jugador siempre debe tener algo útil que reclamar, preparar o reasignar.**
3. **El timer debe abrir decisiones, no sólo frenar acciones.**
4. **La monetización futura debe vender conveniencia, slots o flexibilidad, no poder bruto.**
5. **El juego activo tiene que seguir siendo el corazón del progreso.**
6. **Los timers largos deben vivir sobre sistemas persistentes de cuenta, no sobre piezas efímeras de una run.**

## Modelo Final Recomendado

La capa nueva debe organizarse en **3 escalas temporales**.

| Escala | Duración | Rol |
|---|---:|---|
| Sesión | 5–20 min | combatís, loot, equipás, crafteás instantáneo |
| Run | 20–90 min | elegís sigil, perseguís seed, contratos, bosses |
| Cuenta | 2h–72h | destilás, investigás, sintonizás, cartografiás |

La clave es que los timers fuertes vivan sobre la escala `Cuenta`, y los timers menores o consumos vivan sobre la escala `Run`.

## Los 5 Sistemas Que Sí Recomiendo Implementar

### 1. Destilería de Esencia

**Rol:** convertir drops no usados en progreso meta y en recursos de crafting.  
**Scope:** account-wide.  
**Dónde vive:** `Crafting` o `Inventory`, sin tab nueva al principio.  
**Complejidad:** baja-media.

#### Loop

- Mandás items a una destilería en slots.
- Cada slot procesa un item durante cierto tiempo.
- Al terminar, devuelve una mezcla de:
  - esencia,
  - polvo de affix,
  - trazas de Codex,
  - residuo de sigil,
  - fragmentos raros si el item es bueno.

#### Por qué encaja perfecto

- Hace que mirar items importe más.
- Resuelve parte del problema de “la gente no se engancha mirando loot”.
- Todo drop malo deja de ser sólo vendor trash.
- Refuerza crafting, Codex y sigils al mismo tiempo.

#### Decisiones que genera

- ¿Vendo este item por oro?
- ¿Lo equipo?
- ¿Lo guardo para crafting?
- ¿Lo destilo para progreso account-wide?
- ¿Qué rareza ocupa mis slots limitados?

#### Timers recomendados

| Rareza | Timer sugerido |
|---|---:|
| common | 10m |
| magic | 20m |
| rare | 45m |
| epic | 90m |
| legendary | 180m |

#### Monetización futura sana

- más slots de destilería,
- colas adicionales,
- skins visuales de estación,
- notificaciones o QoL de claim.

#### Riesgos

- si el output es demasiado alto, trivializa oro y esencia,
- si da demasiado poco, se vuelve ruido.

#### Veredicto

**Implementar primero.** Es el sistema con mejor relación impacto/costo y refuerza el deseo de revisar items.

### 2. Infusión de Sigilos

**Rol:** preparar la próxima run antes de prestigiar o antes de arrancarla.  
**Scope:** account-wide / pre-run.  
**Dónde vive:** overlay de selección de sigil y `Prestige`.  
**Complejidad:** baja-media.

#### Loop

- Elegís un sigil para infundir.
- El sigil se carga con un timer.
- Cuando iniciás una run usando ese sigil, consume la carga y otorga un modificador extra.

#### Por qué encaja perfecto

- Los sigils ya son uno de los mejores sistemas del juego.
- Esto los vuelve más deseables sin crear una capa totalmente nueva.
- Hace que el jugador piense en “la próxima run” aunque no esté jugando ahora.

#### Diseño recomendado

- `1` slot base de infusión.
- `1` sigil cargándose a la vez.
- La carga no mejora con uso; mejora con tiempo.
- La carga no expira rápido al completarse. Tiene que esperar al jugador.

#### Ejemplos de bonus

| Sigil | Bonus de infusión sugerido |
|---|---|
| free | +ecos o resonancia de la run, para que deje de sentirse muerto |
| ascend | spike de XP / tier push temprano |
| hunt | sesgo extra a familias o boss targeteados |
| forge | menor costo o mejor resultado de crafting durante la run |
| dominion | más progreso o trazas para Codex |

#### Timers recomendados

- infusión ligera: `2h`
- infusión media: `6h`
- infusión completa: `12h`

#### Monetización futura sana

- un segundo slot de infusión,
- presets o colas,
- aceleración capada.

#### Veredicto

**Implementar en la primera ola.** Es la mejor forma de transformar prestige en preparación sin tocar el combate base.

### 3. Contratos de Caza

**Rol:** dar targets vivos y retorno frecuente sin spoilear el juego.  
**Scope:** run-aware, con persistencia account-wide del board.  
**Dónde vive:** `Codex`.  
**Complejidad:** media.

#### Loop

- El tablero ofrece `3` contratos.
- Elegís `1`.
- Cada contrato targetea una familia, un boss seeded de tu run actual o una categoría ya descubierta históricamente.
- Durante las próximas horas, jugar esa run y matar esos targets llena progreso.
- Al completar el progreso, se abre una pequeña fase final de “entrega / procesamiento” con timer corto para generar expectativa y segundo retorno.

#### Por qué encaja perfecto

- Usa bosses seeded y familias ya existentes.
- Refuerza Codex/Hunt sin convertirlo en spoiler machine.
- Da un motivo concreto para volver ese día.
- Convierte la seed de la run en contenido jugable, no sólo en variedad pasiva.

#### Regla crítica

El contrato **no** debe apuntar a contenido no descubierto si eso rompe el misterio.  
Puede apuntar a:

- familias ya vistas,
- bosses ya conocidos,
- o “ecos desconocidos” con recompensa genérica sin revelar identidad.

#### Timers recomendados

- contrato activo: `12h` o `24h`
- fase final de entrega: `30m` o `60m`

#### Monetización futura sana

- reroll extra del board,
- un segundo slot de contrato activo,
- QoL de seguimiento.

#### Riesgos

- si son demasiado obligatorios, se vuelven dailies duras,
- si son demasiado generosos, reemplazan el hunt natural.

#### Veredicto

**Implementar en segunda ola.** Es de las piezas más fuertes para retención diaria.

### 4. Investigación Del Códice

**Rol:** transformar duplicados, trazas y descubrimientos en progreso lento de conocimiento.  
**Scope:** account-wide.  
**Dónde vive:** `Codex`.  
**Complejidad:** media.

#### Loop

- El jugador junta trazas, duplicados o fragmentos.
- Asigna una investigación.
- Con el tiempo obtiene:
  - pistas mejores,
  - identificación más precisa de fuentes,
  - bonus temporales de hunt sobre un poder,
  - mejoras de calidad de vida del Codex.

#### Por qué encaja perfecto

- Codex ya es un gran sistema, pero hoy es más binario.
- La investigación crea una escalera intermedia entre “no sé nada” y “ya lo descubrí todo”.
- Suma coleccionismo y planificación de largo plazo.

#### Qué evitar

- no vender directamente descubrimientos completos,
- no volverlo un segundo árbol de poder invisible.

#### Timers recomendados

- investigación chica: `2h`
- investigación media: `8h`
- investigación grande: `24h`

#### Monetización futura sana

- más slots de investigación,
- cola de investigación,
- archivador cosmético o QoL.

#### Veredicto

**Implementar en segunda ola.** Es la mejor capa de retención larga para jugadores de loot/hunt.

### 5. Cartografía Del Abismo

**Rol:** darle a late game una capa de scouting y planificación.  
**Scope:** account-wide, late-game.  
**Dónde vive:** `Prestige` o `Codex`, ligado a Abismo.  
**Complejidad:** media-alta.

#### Loop

- El jugador manda a cartografiar su seed futura o un tramo del Abismo.
- Después del timer obtiene información parcial:
  - boss de cierto slot,
  - familia dominante,
  - anomalía o mutador probable,
  - bonanza o riesgo especial.

#### Por qué encaja perfecto

- Ya tenemos bosses y comunes seeded por run.
- Ya tenemos mutadores y layout de ciclos.
- Hoy esa profundidad existe, pero todavía no genera suficiente preparación fuera del combate.

#### Qué habilita

- elegir mejor sigil,
- elegir mejor contrato,
- decidir si vale una run larga o corta,
- planificar una run de fin de semana tipo “esta seed merece full push”.

#### Timers recomendados

- scouting de slot: `2h`
- scouting de ciclo: `6h`
- cartografía completa avanzada: `12h`

#### Monetización futura sana

- más cargas o slots de cartografía,
- ampliación de detalle del scouting,
- presets de tracking.

#### Veredicto

**Implementar en tercera ola.** Es contenido excelente de late game, pero no es el mejor primer paso.

## Sistema Que Sí Veo Valioso, Pero No Haría Todavía

### Forja Profunda

Esta es la versión correcta de “time-gatear upgrades”, si más adelante decidimos hacerlo.

#### Qué sería

Separar crafting en dos carriles:

- `Forja Rápida`: lo que hoy ya existe y sigue siendo instantáneo.
- `Forja Profunda`: proyectos de late game con timer y outcome más fuerte o más controlado.

#### Qué acciones podrían entrar ahí

- `upgrade +6..+10`,
- reforge abisal,
- imprinting o transformación de rare endgame,
- craft de componentes de late.

#### Por qué no la haría en la primera fase

- hoy el equipo se reinicia al prestigiar,
- una mala duración de timer puede volver la run más frustrante, no más adictiva,
- todavía no existe stash o proyecto persistente entre runs.

#### Cuándo sí la haría

- después de validar la capa de jobs account-wide,
- o junto a un pequeño sistema de `item projects` o `stash limitada`,
- o sólo sobre acciones suficientemente cortas y de late.

#### Recomendación exacta

**No time-gatear el upgrade base ahora.**  
Si más adelante se hace, que sea como capa extra de proyectos de late, no como reemplazo del crafting instantáneo.

## Ideas Que Recomiendo Postergar O Rechazar

| Idea | Veredicto | Motivo |
|---|---|---|
| Ghost runs / parallel runs | Rechazar por ahora | demasiado complejas, compiten con el juego activo |
| Guild expeditions | Postergar | falta capa social y desordena el scope |
| City builder / ciudadela | Rechazar por ahora | es otro juego adentro del juego |
| Mercado / subasta | Rechazar | complejiza economía, UI y monetización demasiado pronto |
| Echo charging | Rechazar | pisa la nueva resonancia de ecos |
| Daily login genérico | Rechazar | baja profundidad, alta sensación de mobile slop |
| Mastery training permanente estilo OGame | Postergar | hoy duplica talents/skills/resonancia |
| Incubaciones largas de items de run | Rechazar por ahora | chocan con el prestige reset |

## Arquitectura Recomendada

La base técnica no debería ser “un timer por feature”. Debería existir un solo sistema de jobs.

### Nuevo núcleo: `accountJobs`

Cada job necesita:

- `id`
- `type`
- `station`
- `status`
- `startedAt`
- `endsAt`
- `payload`
- `claimableReward`
- `sourceContext`

### Reglas técnicas

1. Los jobs usan **tiempo real absoluto**, no ticks de combate.
2. Se procesan al cargar save, al volver foco y en autosave.
3. No deben depender del cap de offline combat.
4. Deben sobrevivir reloads y versiones.
5. Si una recompensa no se reclama, debe quedar esperando; no expirar agresivamente.

### Dónde integrarlo

- `Crafting`: destilería y más adelante forja profunda
- `Codex`: contratos e investigación
- `Prestige` / overlay de run: infusión de sigilos
- `Abismo`: cartografía

### Recomendación UX

No abrir una tab nueva al principio.  
Primero meter estas features dentro de tabs ya conocidas.  
Si el engagement demuestra valor, recién ahí pensar una tab `Santuario` o `Operaciones`.

## Cómo Esto Aumenta La Adicción De Forma Sana

La nueva agenda del jugador pasa a ser:

### Vuelta corta de 30 segundos

- reclamar destilería,
- revisar contrato,
- poner una investigación,
- cargar un sigil.

### Vuelta de 3–5 minutos

- comparar loot,
- decidir qué destilar,
- elegir la siguiente preparación,
- mirar Codex/Hunt.

### Sesión de 10–20 minutos

- jugar la run preparada,
- aprovechar el sigil infundido,
- avanzar el contrato,
- targetear un boss o familia.

### Sesión larga

- explotar una seed buena,
- empujar Abismo ya cartografiado,
- preparar el fin de semana o la próxima noche.

Eso es muy parecido a lo mejor de Gladiatus / Travian, pero aterrizado sobre tus loops reales de loot, bosses y prestige.

## Cómo Monetizar Esto Sin Volverlo P2W

### Lo que sí vendería

- slots extra de destilería,
- slots extra de investigación,
- slots extra o cola de infusión,
- rerolls adicionales del tablero de contratos,
- QoL de notificaciones / presets / claim-all,
- stash tabs más adelante,
- cosméticos de estaciones.

### Lo que no vendería

- descubrimientos completos de Codex,
- unlocks directos de Abismo,
- drops targeteados garantizados,
- skips infinitos de timer sin freno,
- power bruto imposible de conseguir gratis,
- contratos exclusivos pagos con rewards únicas.

### Regla de oro

La monetización debe vender:

- velocidad,
- paralelismo,
- comodidad,
- visibilidad,
- organización.

No debe vender acceso exclusivo a poder.

## Roadmap Recomendado

### Fase 1: Fundación + Wins Rápidas

Objetivo: meter la capa de jobs y generar retorno diario sin tocar demasiado el balance base.

### Implementar

- núcleo `accountJobs`
- `Destilería de Esencia`
- `Infusión de Sigilos`
- surfacing en UI de jobs activos / claimables

### Razón

Es la fase con mejor impacto/costo y menor riesgo.

### Fase 2: Targeting Y Conocimiento

Objetivo: volver más profundo el loop de Codex y boss hunting.

### Implementar

- `Contratos de Caza`
- `Investigación del Códice`
- recursos nuevos mínimos:
  - trazas,
  - fragmentos,
  - progreso de contrato

### Razón

Consolida la identidad de loot/hunt y crea retorno diario fuerte.

### Fase 3: Late Game Planner

Objetivo: hacer que Abismo se juegue también fuera del combate.

### Implementar

- `Cartografía del Abismo`
- quizás prototipo acotado de `Forja Profunda`

### Razón

Es la fase más “sticky” para jugadores comprometidos, pero necesita que la base de jobs ya esté probada.

## Refactors Que Sí Aceptaría Hacer

1. **Separar mejor estado de cuenta vs estado de run.**
2. **Agregar un sistema genérico de jobs en vez de timers ad hoc.**
3. **Agregar un inbox / claim layer simple.**
4. **Mover parte del valor del loot malo a destilación, no sólo a venta.**
5. **En el futuro, si se hace Forja Profunda, separar crafting instantáneo de crafting proyectual.**

## Refactors Que No Haría Todavía

1. Rehacer todo el prestige alrededor de timers.
2. Reemplazar el combate activo por expediciones automáticas.
3. Convertir el juego en city builder o management puro.
4. Meter marketplaces o economías sociales antes de estabilizar el meta core.

## Riesgos Principales Y Cómo Evitarlos

### Riesgo 1: demasiados timers

Solución:

- sólo 2 sistemas nuevos en la primera fase,
- UI centralizada,
- no más de 3 claims importantes al mismo tiempo para un jugador medio.

### Riesgo 2: FOMO tóxico

Solución:

- jobs completados esperan claim,
- contratos con refresh razonable,
- no castigar al jugador por no entrar exactamente a horario.

### Riesgo 3: timers que reemplazan jugar

Solución:

- rewards pasivas siempre por debajo del juego activo,
- contratos que igual requieren matar cosas,
- cartografía que sólo informa, no progresa sola.

### Riesgo 4: monetización invasiva

Solución:

- vender paralelismo y comodidad,
- nunca poder exclusivo,
- caps claros a aceleraciones.

## Propuesta Final Concreta

Si tuviera que elegir una sola dirección para el juego live, sería esta:

### Norte de diseño

**Agregar una capa persistente de preparación e investigación entre runs, no una capa de peajes para jugar.**

### Sistemas finales elegidos

1. `Destilería de Esencia`
2. `Infusión de Sigilos`
3. `Contratos de Caza`
4. `Investigación del Códice`
5. `Cartografía del Abismo`

### Sistema que dejo como fase posterior

6. `Forja Profunda` sólo si antes resolvemos bien projects/stash/run-vs-account.

### Motivo

Estos 5 sistemas:

- refuerzan lo mejor que ya tiene el juego,
- crean retorno frecuente,
- mejoran el deseo de revisar loot,
- abren monetización futura segura,
- y no exigen rehacer combate ni prestige desde cero.

Ese es el rework correcto para sumar retención larga, adicción sana y base monetizable sin matar la identidad actual del juego.
