# Prompt Handoff

Usá este prompt para pasarle el proyecto a otra IA y pedirle ideas, reworks o propuestas nuevas sin que trabaje sobre una foto vieja del juego.

## Prompt Principal

```text
Estoy trabajando en un juego llamado `idlerpg`. Necesito que analices el estado real actual del proyecto y me propongas ideas, reworks, nuevas mecánicas o cambios sistémicos con criterio de diseño y de implementación.

Importante: no quiero que asumas el juego viejo. El proyecto cambió bastante. Tu análisis tiene que partir del estado actual real, no de una fantasía genérica de “idle RPG con prestige”.

Primero leé estos archivos:

1. `notes/roadmap_v2.md`
2. `notes/roadmap_v2_exec.md`

Si necesitás más contexto, podés mirar también:

- `notes/propuesta_final_2.md`
- `notes/propuesta_expediciones.md`
- `notes/propuesta_mvp_extraction.md`

## Qué es el juego hoy

Resumen corto:

- antes el juego era más “Combat + loot + prestige”
- ahora está migrando a:
  - `Santuario -> Expedición -> Extracción -> Santuario`
- el juego busca una fantasía de `extraction-lite`, no Tarkov hardcore
- `Santuario` ya existe en runtime
- `Extracción` ya existe
- `Forja Profunda` ya existe
- el crafting fuerte se está moviendo desde la expedición hacia la capa persistente
- el proyecto persistente es una de las piezas más importantes del nuevo loop

## Qué necesito de vos

Quiero que hagas un análisis profundo del estado del juego y me propongas mejoras o reworks realmente útiles.

No me des una lluvia de ideas genéricas. Quiero propuestas pensadas para ESTE proyecto.

## En qué frentes quiero que pienses

1. `Reintegración de proyectos`
   - cómo hacer que un proyecto persistente vuelva a influir en expediciones futuras
   - sin matar la frescura de run
   - sin convertir todo el sistema en gear persistente trivial

2. `Crafting split`
   - qué debería quedarse en expedición
   - qué debería quedar exclusivamente en Forja Profunda
   - si `Reroll` tiene sentido en la run o no

3. `Santuario`
   - qué estaciones nuevas tienen más sentido
   - cuáles serían puro ruido
   - cómo hacer que el Santuario sea adictivo, claro y útil

4. `Extracción`
   - cómo mejorar el valor de extraer
   - cómo hacer que el riesgo vs codicia se sienta bien
   - cómo evitar castigo tóxico

5. `Retention / monetización sana`
   - cómo aumentar retorno y engagement
   - qué time gates o capas persistentes podrían funcionar
   - qué sería monetizable por conveniencia sin caer en P2W o manipulación excesiva

6. `Loop macro`
   - si el core loop actual va en la dirección correcta
   - si conviene empujar más el modelo extraction-lite
   - si hay un refactor mejor todavía

## Restricciones importantes

- no propongas cosas como si el juego siguiera siendo sólo un idle ARPG clásico
- no propongas mobile slop genérico
- no propongas P2W
- no propongas sistemas que sólo agreguen complejidad y busywork
- priorizá ideas que puedan convivir con lo ya implementado
- si proponés un refactor profundo, aclarame por qué vale la pena
- si algo que propongas choca con el código o con decisiones actuales, marcámelo

## Cómo quiero la respuesta

Dame la respuesta en este formato:

### 1. Lectura del proyecto actual
- qué entendés que es el juego hoy
- cuáles son sus fortalezas reales
- cuáles son sus debilidades estructurales

### 2. Diagnóstico principal
- cuál te parece que es el principal problema de diseño actual
- por qué
- qué consecuencias trae

### 3. Propuestas concretas
- entre 3 y 7 propuestas fuertes
- cada una con:
  - idea
  - por qué mejora el juego
  - qué problema resuelve
  - riesgo
  - complejidad de implementación
  - si es compatible con el estado actual o pide refactor

### 4. Priorización
- top 3 propuestas que harías primero
- top 3 propuestas más ambiciosas
- top 3 propuestas con mejor relación impacto / costo

### 5. Riesgos
- qué cambios NO harías
- qué sistemas podrían romper el juego
- qué errores de dirección deberíamos evitar

### 6. Si fueras Lead Designer
- cómo orientarías el juego en los próximos 2-3 meses
- cuál sería tu visión del juego final

## Tono y nivel de análisis

Quiero una respuesta:

- profunda
- concreta
- crítica
- orientada a diseño sistémico
- orientada a producto real, no a teoría abstracta

Si ves tensiones reales entre:

- run freshness
- persistencia
- extraction-lite
- power creep
- UX
- monetización sana

marcalas explícitamente.

No me des sólo ideas nuevas. También quiero que me digas qué cosas actuales conservarías porque van bien encaminadas.
```

## Cuándo Usarlo

Este prompt sirve especialmente si querés pedirle a otra IA:

- nuevas ideas de diseño
- reworks del loop
- propuestas de Santuario
- propuestas de extracción
- ideas de monetización sana
- análisis de qué dejar en expedición y qué migrar a persistencia

## Versión Corta

Si querés un handoff más liviano:

```text
Leé `notes/roadmap_v2.md` y `notes/roadmap_v2_exec.md` y proponeme mejoras profundas para este juego, entendiendo que ya no es sólo un idle RPG con prestige sino un extraction-lite con Santuario, Extracción y Forja Profunda. Quiero foco especialmente en proyectos persistentes, crafting split entre expedición y Santuario, valor de extraer, estaciones futuras del Santuario y monetización sana. No me des ideas genéricas: quiero propuestas concretas, priorizadas y compatibles con el estado real del proyecto.
```
