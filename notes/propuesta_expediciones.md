# Propuesta: Sistema De Expediciones Y Extracción-Lite

Fecha: 2026-04-18  
Contexto: desarrollo sobre `propuesta_final_2.md`, aterrizando cómo sería exactamente el loop de expediciones, extracción y santuario persistente.

## Resumen Corto

Sí: la versión más fuerte de este rediseño mete algo **inspirado en Escape from Tarkov**, pero traducido a un ARPG idle y sin volverlo hardcore tóxico.

No sería:

- full-loot punitivo,
- inventario tetris,
- perder media cuenta por morir,
- ni un extraction shooter injertado a la fuerza.

Sí sería:

- cada run pasa a ser una `Expedición`,
- al final existe una `Extracción`,
- no todo lo encontrado vuelve con vos,
- tenés capacidad limitada para conservar valor,
- y tu cuenta empieza a tener una `base persistente` real.

## Objetivo De Diseño

Resolver cinco problemas de una vez:

1. hacer más adictivo mirar loot,
2. hacer más memorable el final de la run,
3. dar sentido a timers persistentes,
4. darle un “hogar” a la cuenta,
5. abrir monetización futura sana basada en slots / QoL / proyectos.

## Qué Cambia Conceptualmente

### Loop actual

`run -> loot -> crafting -> prestige -> wipe`

### Loop propuesto

`santuario -> preparación -> expedición -> extracción -> proyectos persistentes -> nueva expedición`

La diferencia clave es esta:

### La run deja de ser un tubo cerrado

Hoy la run se siente más o menos así:

- entro,
- progreso,
- prestigio,
- reseteo,
- vuelvo.

Con expediciones:

- entro con una intención,
- encuentro valor,
- no todo el valor se conserva igual,
- al salir elijo qué rescato,
- y lo rescatado alimenta mi base persistente.

Ahí aparece la fantasía de extracción.

## Términos Nuevos

### Expedición

La run actual, resignificada.

### Santuario

La base persistente de cuenta.

### Extracción

La fase de salida donde decidís qué vuelve de la expedición al Santuario.

### Cargo

Todo lo que puede volver de forma persistente:

- materiales,
- fragmentos,
- reliquias,
- proyectos,
- datos para Codex,
- cargas o catalizadores.

### Equipo de campo

El gear de la expedición actual:

- lo usás en combate,
- te sirve para push/crafting de esa run,
- normalmente no vuelve como persistencia salvo que lo conviertas en `proyecto`.

### Proyecto

Un item o reliquia que sí pasa al Santuario y entra a Forja Profunda.

## Qué NO Haría

Para que esto no se vuelva un Tarkov equivocado:

1. No metería extracción manual por mapa.
2. No pondría un inventario de grillas.
3. No haría que morir borre todo sin mitigación.
4. No dejaría que toda pieza buena sobreviva entre runs.
5. No frenaría el combate base con chores.

## La Forma Exacta Del Loop

## 1. Santuario: Preparación De Expedición

Antes de empezar, el jugador pasa por una preparación corta.

### Qué elige

- clase,
- spec,
- sigil o sigils,
- contrato activo,
- investigación activa,
- cartografía o lectura de seed si existe,
- opcionalmente un `perfil de build` guardado,
- opcionalmente un `proyecto` del Santuario que quiera alimentar.

### Qué claima

- jobs terminados,
- destilería,
- investigaciones,
- infusión de sigilos,
- contratos completados.

### Qué deja corriendo

- nuevas investigaciones,
- nueva infusión,
- destilación de loot viejo,
- forja de un proyecto persistente.

Esto hace que la run empiece antes de apretar Start.

## 2. Inicio De Expedición

Una expedición arranca con:

- seed de run,
- clase/spec,
- sigil activo,
- bonus de Santuario activos,
- contrato aplicado,
- slots de extracción base disponibles.

### Recomendación

No cargar demasiadas cosas al early.  
La primera versión debe ser simple:

- una run sigue siendo jugable casi como hoy,
- pero ya existe la promesa de “si esta expedición sale bien, puedo traerme algo importante”.

## 3. Durante La Expedición

El combate por tiers sigue siendo el corazón del juego.

### Lo que se mantiene

- loot frecuente,
- comparación vs equipado,
- crafting de campo,
- bosses seeded,
- Abismo,
- Codex/hunt,
- prestige.

### Lo que cambia

Ahora el jugador piensa en dos capas de valor:

1. `valor de expedición`
   - me sirve para esta run

2. `valor de extracción`
   - me sirve para la cuenta si logro llevármelo

Ese segundo pensamiento es el que falta hoy.

## 4. Tipos De Valor Que Puede Encontrar El Jugador

Propongo separar lo encontrado en cuatro familias.

### A. Equipo de campo

- armas,
- armaduras,
- upgrades de run,
- drops normales,
- crafting táctico.

Sirven sobre todo dentro de la expedición.

### B. Cargo procesable

- esencia refinable,
- polvo de affix,
- trazas del Códice,
- residuo de sigil,
- catalizadores,
- fragmentos de reliquia.

Esto alimenta estaciones persistentes.

### C. Candidatos a proyecto

- rare excepcional,
- epic notable,
- legendary especial,
- reliquia de boss,
- item marcado por el jugador como “quiero conservarlo”.

No entran solos al Santuario. Necesitan extracción.

### D. Progreso automático meta

- ecos,
- resonancia,
- flags del Codex,
- unlocks de Abismo,
- algunas métricas o mastery global.

Esto no compite por slots de extracción.

## 5. La Regla Más Importante: No Todo Vuelve

La magia del sistema está acá.

### Qué vuelve automáticamente

- ecos y resonancia cuando corresponde,
- discoveries del Codex,
- unlocks account-wide,
- progreso estadístico.

### Qué NO vuelve automáticamente

- materiales de carga,
- proyectos,
- reliquias físicas,
- catalizadores especiales.

Eso requiere `Extracción`.

## 6. Sistema Exacto De Extracción

Propongo un sistema basado en **slots**, no en peso abstracto.

Es más legible, más monetizable y más fácil de surfacing.

## Slots De Extracción

### Tipos de slot

1. `Cargo Slot`
   - para materiales y bundles persistentes

2. `Project Slot`
   - para un item que querés convertir en proyecto persistente

3. `Relic Slot`
   - para reliquias, fragmentos únicos o blueprints

### Estado de slot

Cada slot puede ser:

- `abierto`
- `lleno`
- `asegurado`

## Slots Abiertos Vs Asegurados

Esta es la capa Tarkov-lite.

### Slot abierto

- si extraés voluntariamente, vuelve con vos
- si morís, puede perderse

### Slot asegurado

- vuelve con vos incluso si la expedición colapsa por muerte

Esto mete riesgo sin irse al extremo.

## Capacidad Base Recomendada

### Early

- `2` cargo slots abiertos
- `0` cargo slots asegurados
- `1` project slot abierto
- `0` relic slots

### Después del primer prestige

- `3` cargo slots abiertos
- `1` cargo slot asegurado
- `1` project slot abierto
- `1` relic slot abierto

### Late / Abismo

se abren más slots por:

- unlocks de Abismo,
- progreso de Santuario,
- monetización futura de QoL,
- rewards de boss o contracts.

## Cómo Se Consiguen Más Slots Dentro De Una Expedición

La mejor versión conecta esto con bosses.

### Recomendación

Cada boss derrotado otorga una mejora temporal de extracción para esa expedición.

Ejemplo simple:

| Hito | Recompensa |
|---|---|
| T5 boss | +1 cargo slot abierto |
| T10 boss | +1 cargo slot asegurado |
| T15 boss | +1 project slot abierto |
| T20 boss | +1 cargo slot asegurado |
| T25 boss | +1 relic slot |
| cada boss de Abismo | +1 mejora adicional o sellado abisal |

### Qué genera esto

- matar bosses se siente más importante,
- ir más profundo da más capacidad de rescate,
- la run larga no sólo da números: da `capacidad de extracción`.

## 7. Formas De Salir De La Expedición

Propongo `3` salidas.

## A. Extracción voluntaria

El jugador decide volver al Santuario.

### Resultado

- conserva todo lo que tenga en slots llenos,
- conserva ecos sólo si cumplió gate de prestige,
- termina la expedición.

### Cuándo sirve

- run de farm corta,
- run de contrato,
- run donde ya encontraste el proyecto que querías,
- run donde no querés arriesgar más.

## B. Prestige / extracción mayor

Es la forma “completa” de cerrar una expedición.

### Resultado

- igual que extracción voluntaria,
- pero además da ecos/resonancia completos,
- se registra como cierre formal de expedición,
- reinicia el loop como hoy.

### Lectura

Prestige deja de ser sólo “reset”.
Pasa a ser “extracción grande + conversión meta”.

## C. Colapso por muerte

La expedición termina forzosamente.

### Resultado recomendado

- vuelve todo lo que estuviera en slots `asegurados`,
- vuelve una parte reducida de algunos recursos de slots abiertos como “restos recuperados”,
- se pierden proyectos abiertos no asegurados,
- ecos:
  - si no cumpliste gate, no hay prestige,
  - si sí cumpliste gate, puede haber `prestige de emergencia` con penalización moderada.

## Prestige De Emergencia

Esta es una gran herramienta para que la muerte no se sienta injusta.

### Regla recomendada

Si el jugador ya había cumplido condiciones de prestige:

- al morir puede convertir esa expedición en un `Prestige de Emergencia`
- cobra `70%` a `85%` de los ecos esperados
- pero sólo conserva cargo asegurado y parte del recuperado

### Por qué sirve

- morir sigue importando,
- pero no arruina una run grande,
- y el juego no se vuelve excesivamente hardcore.

## 8. Fase De Extracción Exacta

El momento más importante del sistema.

### Cuándo aparece

al:

- extraer voluntariamente,
- prestigiar,
- morir.

### Qué muestra

1. `Resumen de expedición`
   - tier máximo
   - bosses muertos
   - contrato
   - seed / Abismo
   - ecos potenciales

2. `Carga extraíble`
   - materiales
   - trazas
   - fragmentos
   - reliquias

3. `Candidatos a proyecto`
   - items elegibles para stash/forja

4. `Destino de cada cosa`
   - vender
   - destilar
   - guardar como proyecto
   - descartar

### Regla UX clave

No forzar 40 clics.  
Debe haber defaults inteligentes:

- auto-vender basura,
- auto-destilar material común,
- resaltar candidatos a proyecto,
- marcar cuáles slots se perderían si no asegurás.

## 9. Qué Puede Ser Un Proyecto Persistente

No cualquier item.

### Recomendación

Un item sólo puede convertirse en `proyecto` si cumple al menos una:

- `rare` de calidad alta,
- `epic` o `legendary`,
- drop de boss,
- tiene un affix/power especial,
- fue ascendido,
- fue marcado por el juego como “worthy”.

### Por qué

Si todo puede persistir, se rompe la frescura de run.

## 10. Qué Hace El Santuario Con Lo Extraído

Cuando volvés:

### Cargo

va a:

- Destilería,
- Archivo del Códice,
- Altar de Sigilos,
- Mesa de Cartografía,
- Forja Profunda.

### Proyecto

entra a:

- stash limitada,
- cola de forja,
- o archivo de reliquias.

### Meta progreso

entra a:

- resonancia,
- prestige,
- unlocks account-wide.

## 11. Cómo Encaja Con Los Sistemas Actuales

## Sigils

Pasan a ser “preparación de expedición”, no sólo bias pasivo.

## Codex

Se alimenta con:

- kills como hoy,
- trazas extraídas,
- contratos,
- investigación desde Santuario.

## Crafting actual

Sigue existiendo como `Crafting de Campo`.

## Crafting nuevo

`Forja Profunda` usa proyectos persistentes y timers.

## Prestige

Pasa a ser una forma premium de extracción, no sólo reset duro.

## Abismo

Gana mucho, porque ahora:

- no sólo sube dificultad,
- también mejora capacidad de extracción,
- reliquias,
- cartografía,
- valor del riesgo.

## 12. Qué Hace Esto Más Adictivo

Hoy el jugador piensa:

- “¿subo un tier más?”

Con expediciones piensa:

- “¿subo un tier más o saco ya este proyecto?”
- “¿cierro ahora o arriesgo por un slot asegurado más?”
- “¿extraigo esta run corta o la transformo en prestige?”
- “¿destilo esto o lo guardo?”

Esas decisiones son adictivas porque:

- tienen riesgo,
- tienen timing,
- tienen memoria,
- y tienen impacto visible.

## 13. Onboarding Recomendado

No mostrar todo junto.

## Etapa 1: Early simple

- run normal,
- al final una pantalla de extracción simple,
- pocos slots,
- casi sin proyectos.

## Etapa 2: Después del primer prestige

- se desbloquea Santuario básico,
- infusión de sigilos,
- destilería,
- un project slot real.

## Etapa 3: Abismo I-II

- contratos más complejos,
- reliquias,
- cartografía,
- forja profunda parcial.

## Etapa 4: Late

- sellos asegurados extra,
- proyectos abisales,
- mejores slots,
- memoria de build,
- mayor densidad de decisiones.

## 14. Qué Monetización Habilita

### Sana

- más slots de stash
- más slots de destilería
- más slots de investigación
- más project slots
- claim-all
- filtros premium
- presets
- cosméticos del Santuario

### Peligrosa

- asegurar demasiados slots por dinero
- sacar reliquias exclusivas de pago
- permitir llevar demasiados proyectos entre runs
- speedups infinitos sin límites

La monetización correcta vende:

- capacidad,
- organización,
- comodidad,
- paralelismo.

No poder bruto.

## 15. Riesgos Reales Del Sistema

## Riesgo 1: demasiada fricción

Mitigación:

- defaults automáticos,
- pocos slots al principio,
- no meter microgestión de mochila.

## Riesgo 2: demasiado castigo por muerte

Mitigación:

- slots asegurados,
- restos recuperados,
- prestige de emergencia.

## Riesgo 3: que la gente deje de jugar y sólo gestione

Mitigación:

- el valor grande sigue estando en combatir,
- el Santuario procesa, no reemplaza el juego activo.

## Riesgo 4: que el carry-over rompa la fantasía de reset

Mitigación:

- persistencia selectiva,
- stash limitada,
- mayoría del gear sigue siendo de campo.

## 16. Versión Mínima Viable

Si hubiese que prototiparlo sin rehacer todo el juego:

### MVP

1. renombrar la run como `Expedición`
2. agregar pantalla de `Extracción` al prestigiar / retirarse / morir
3. agregar:
   - `2` cargo slots
   - `1` project slot
4. crear `Destilería` y `Stash` mínimas
5. permitir que `1` item de la run se guarde como proyecto persistente

Con eso ya podrías validar:

- si mirar loot se vuelve más interesante,
- si el final de run gana tensión,
- si la fantasía de extracción pega,
- y si el jugador entiende el Santuario como base.

## 17. Mi Recomendación Final

Sí, esto puede meter una capa tipo Tarkov.

Pero la traducción correcta no es:

- “hacerlo hardcore”

sino:

- “hacer que cada run sea una expedición con valor rescatable limitado”.

La mejor versión del sistema sería:

1. `Santuario` persistente
2. `Expediciones` como runs
3. `Extracción` al salir
4. `slots` de cargo / proyecto / reliquia
5. `slots asegurados` vs `abiertos`
6. `prestige` reinterpretado como extracción mayor
7. `Forja Profunda` sólo para proyectos persistentes

Eso sí le daría al juego una identidad de `extraction-lite ARPG idle`, y además sería una forma muy potente de volver más adictivo el loot, el final de run y la preparación entre sesiones.
