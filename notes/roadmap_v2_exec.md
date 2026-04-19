# Roadmap V2 Exec

Fecha de corte: 2026-04-18 UTC  
Repo: `idlerpg`  
Estado general: refactor activo, build funcional, transición fuerte de loop clásico a extraction-lite persistente

## Qué Es Este Documento

Esta es la versión ejecutiva de [roadmap_v2.md](/home/gmendoza/coding/idlerpg/notes/roadmap_v2.md).  
No intenta listar todo. Intenta dejar claras:

- la verdad actual del proyecto,
- la dirección de diseño más probable,
- qué ya está implementado,
- qué sigue abierto,
- y dónde otra IA puede aportar sin proponer sobre supuestos viejos.

## Tesis Del Proyecto Hoy

El juego ya no debería leerse como:

`Combat -> loot -> prestige`

Sino como:

`Santuario -> Expedición -> Extracción -> Santuario`

La run ya no debería producir “el ítem final del juego”.  
La run debería producir:

- progreso de ecos,
- cargo persistente,
- proyectos prometedores,
- motivos para volver al Santuario,
- decisiones de riesgo vs extracción.

El Santuario ya no es un menú futuro. Ya existe y ya empezó a concentrar el valor persistente.

## Estado Real Del Proyecto

### Lo que ya está fuerte

- `2` clases: `Warrior`, `Mage`
- `4` specs: `Berserker`, `Juggernaut`, `Sorcerer`, `Arcanist`
- `6` árboles de talentos
- `7` ramas de `Ecos`
- `5` sigils de run
- `25` tiers base + `Abismo 26+`
- comunes y bosses seeded por run
- `12` bosses authored
- mutadores por ciclo de Abismo
- Codex / powers / hunt funcionando
- rare como item-proyecto fuerte
- affix pool ampliado y recategorizado

### Lo que ya cambió estructuralmente

- `Santuario` es home real fuera de run
- `Combat` ya se presenta como `Expedición`
- `Extracción` es overlay global
- la salida fuerte de run es `Extraer al Santuario`
- `Prestige` viejo dejó de ser el CTA central; ahora es capa meta de `Ecos`
- `Upgrade`, `Polish`, `Reforge` y `Ascend` ya migraron a `Forja Profunda`
- la expedición quedó mucho más enfocada a encontrar/rescatar bases que a cerrar el item final

### Lo que ya existe en Santuario

- `Destilería`
- `Altar de Sigilos`
- stash de proyectos
- jobs persistentes en tiempo real
- `Forja Profunda` como overlay dedicado

### Lo que ya existe en Extracción

- cargo persistente
- selección de proyecto
- recuperación completa o parcial según el tipo de salida
- conversión automática a ecos si la expedición cumple gate

### Lo que ya existe en Forja Profunda

- upgrade persistente `+N`
- pulir profundo
- reforge profunda
- ascensión de proyecto

## Decisiones De Diseño Ya Tomadas

Estas son importantes porque otra IA no debería “redescubrirlas” como si siguieran abiertas:

- `Santuario` sí es parte del core loop
- `Extracción` y `Prestige` ya no son dos salidas distintas
- la muerte ya no debería borrar una run al primer error
- el juego apunta a `extraction-lite`, no a Tarkov hardcore
- monetización futura deseada: conveniencia / slots / QoL, no poder bruto
- la `Forja Profunda` debe ser más estratégica y persistente que la forja de expedición
- la expedición no debería fabricar por sí sola el mejor item del juego

## Problemas Sistémicos Abiertos

### 1. Reintegración de proyectos

Este es el problema más grande del proyecto hoy.

Ya existe:

- proyecto extraído,
- stash persistente,
- forja profunda,
- ascensión,
- progresión estructural del item.

Pero todavía no está completamente resuelto cómo ese proyecto vuelve a influir en expediciones futuras sin matar la frescura de run.

Esa es la pregunta central del siguiente gran rework.

### 2. Qué queda realmente en la expedición

Hoy `Reroll` todavía quedó en la capa de campo.  
La discusión real es:

- si la expedición debe seguir teniendo una herramienta para rescatar bases,
- o si incluso eso debe migrar a Santuario para que el proyecto nunca salga demasiado resuelto de una sola run.

### 3. Recursos persistentes sin loop completo

`codexInk` ya existe, pero todavía no tiene estación completa.

Eso deja al Santuario funcional pero todavía incompleto.

### 4. UX y onboarding

El loop nuevo ya es más profundo que el juego viejo.  
Todavía falta:

- explicar mejor por qué extraer,
- mostrar mejor el valor del proyecto,
- hacer más adictivo revisar stash y progreso persistente,
- simplificar la lectura de estaciones, jobs y recompensas.

### 5. Balance del nuevo loop

Todavía hay que recalibrar:

- ritmo de extracción,
- valor de proyectos,
- duración/costos de jobs,
- fuerza de proyectos ascendidos,
- y pacing entre `ecos` y progreso persistente.

## Norte De Producto

La dirección más sana hoy parece esta:

### Expedición

- conseguir bases, loot y progreso
- encontrar proyectos valiosos
- matar bosses, empujar tiers, leer la seed
- decidir cuándo salir

### Extracción

- seleccionar qué rescatar
- convertir una buena expedición en ecos + valor persistente
- introducir tensión sin castigo tóxico

### Santuario

- procesar recursos
- preparar la próxima expedición
- desarrollar proyectos persistentes
- generar loops time-gated con anticipación y retorno frecuente

## Qué Fases Tienen Más Sentido Ahora

### Fase A: cerrar el Santuario básico

Objetivo:

- que todos los recursos actuales tengan uso real
- que el jugador entienda por qué volver al Santuario

Prioridades:

- investigación del Codex con `codexInk`
- mejor surfacing de jobs/claims
- mejor explicación de proyectos, cargo y extracción

### Fase B: decidir el destino final del crafting

Objetivo:

- terminar de separar crafting táctico de crafting persistente

Preguntas:

- ¿Reroll se queda en expedición?
- ¿La expedición sólo identifica proyectos y el Santuario los desarrolla?
- ¿Qué tanto control de affixes debe existir antes de extraer?

### Fase C: hacer que el proyecto importe de verdad

Objetivo:

- que el jugador quiera mirar items, perseguir una pieza y desarrollarla por semanas

Esto pide:

- mejor reintegración de proyectos al poder de run
- más fantasía de “pieza de legado”
- decisiones profundas de build y no sólo de economía

### Fase D: expandir estaciones persistentes

Candidatas más fuertes:

- `Investigación del Codex`
- `Contratos`
- `Cartografía del Abismo`
- loops de preparación de expedición

## Qué Le Pediría A Otra IA

No que proponga “más sistemas” en abstracto.  
Sí que ayude en estos frentes:

1. Cómo hacer que un proyecto persistente vuelva a influir en la expedición futura.
2. Si `Reroll` debe quedarse o no en la capa de campo.
3. Cómo cerrar el loop de `codexInk` sin meter busywork.
4. Cómo hacer el Santuario más legible y más deseable de visitar.
5. Cómo aumentar retención y monetización sana sin volver el juego manipulador.
6. Qué estaciones nuevas agregan valor real y cuáles serían ruido.

## Riesgos A Evitar

- convertir el juego en un mar de timers sin decisiones
- dejar que la expedición siga resolviendo el item perfecto de punta a punta
- mover demasiadas cosas al Santuario y matar el placer inmediato de la run
- agregar castigos de muerte demasiado tóxicos
- monetizar poder bruto o protección básica como impuesto

## Síntesis Ejecutiva

El proyecto ya cruzó un umbral: ya no es razonable diseñarlo como si siguiera siendo sólo un idle RPG con prestige.

La visión más prometedora hoy es:

- `Santuario` como hub persistente,
- `Expedición` como loop activo y variable,
- `Extracción` como cierre unificado,
- y `Forja Profunda` como desarrollo de proyectos a largo plazo.

La pregunta más importante para el siguiente tramo del desarrollo no es “qué feature nueva metemos”, sino:

**cómo hacemos que los proyectos persistentes se vuelvan una obsesión divertida y que realmente cambien el valor de una expedición futura.**
