# Refactor Bosses + Abismo

Fecha de corte: 2026-04-16 UTC
Objetivo: convertir la escalera lineal actual de `25` tiers en una estructura preparada para:

- bosses seeded por run
- ciclos de Abismo posteriores al tier `25`
- unlocks de endgame por profundidad
- futura rama `abismo` de prestige sin rehacer el combate dos veces

## Estado Actual

Hoy el runtime hace esto:

- `spawnEnemy(tier)` resuelve enemigo o boss directamente contra `ENEMIES` y `BOSSES`
- bosses fijos en tiers `5/10/15/20/25`
- `currentTier` y `maxTier` viven en `combat`
- al morir, la run vuelve a tier `1`
- no existe `runSeed`
- no existe noción de `cycleIndex`, `tierInCycle`, `abyssDepth` ni slots de boss

Eso funciona para el juego actual, pero bloquea:

- reusar el mismo slot de boss en Abismo I/II/III
- mostrar al jugador qué seed le tocó
- escalar loops de endgame sin duplicar `ENEMIES` y `BOSSES`

## Fase 0 Hecha Ahora

Se implementó la fundación mínima para separar encounter routing del spawn bruto.

### Runtime nuevo

Archivo: `src/engine/combat/encounterRouting.js`

Conceptos nuevos:

- `BASE_TIER_COUNT = 25`
- `BOSS_SLOT_INTERVAL = 5`
- `BOSS_SLOT_COUNT = 5`
- `combat.runContext`

Contrato actual de `runContext`:

```js
{
  seed: number,
  baseTierCount: 25,
  bossSlotInterval: 5,
  bossSlots: {
    1: "orc_warlord",
    2: "void_titan",
    3: "blood_matriarch",
    4: "iron_sentinel",
    5: "void_sovereign"
  }
}
```

Helpers nuevos:

- `createRunSeed()`
- `createRunContext()`
- `normalizeRunContext()`
- `getCycleIndexForTier()`
- `getTierInCycle()`
- `getBossSlotForTier()`
- `resolveEncounterForTier()`

### Qué cambia hoy en gameplay

Nada visible.

El juego sigue resolviendo exactamente la misma escalera actual porque:

- el layout default de bosses replica el orden fijo existente
- todavía no existe pool expandido de bosses
- todavía no existe escalado de Abismo activo

### Qué deja preparado

- guardar seed por run en save
- regenerar seed al abrir un nuevo ciclo de prestige
- resolver tiers `26+` sin romper el contrato del engine
- desacoplar “qué encounter corresponde” de “cómo se hidrata runtime del encounter”

## Modelo Objetivo

## 1. Tier Routing

El tier absoluto de combate pasa a descomponerse así:

```js
absoluteTier = combat.currentTier
cycleIndex = floor((absoluteTier - 1) / 25)
tierInCycle = ((absoluteTier - 1) % 25) + 1
bossSlot = tierInCycle % 5 === 0 ? tierInCycle / 5 : null
abyssDepth = cycleIndex
```

Lectura:

- `cycleIndex = 0` es juego base
- `cycleIndex = 1` es Abismo I
- `cycleIndex = 2` es Abismo II

## 2. Seed por run

Cada run debe tener:

- un `seed`
- un layout de slots de boss derivado de ese seed

Contrato recomendado:

```js
combat.runContext = {
  seed,
  baseTierCount: 25,
  bossSlotInterval: 5,
  bossSlots,
}
```

Regla:

- el seed cambia cuando se abre un nuevo ciclo de prestige
- morir no cambia seed
- prestigiar si cambia seed
- cambiar de tier manualmente no cambia seed

## 3. Slots de boss

El slot es la unidad de diseño, no el tier absoluto.

Ejemplo:

- slot `1` = tier `5`, `30`, `55`, `80`
- slot `2` = tier `10`, `35`, `60`, `85`

Esto permite decir:

- “esta run tiene Void Titan en slot 1”
- y saber que su eco volverá en Abismo I/II/III en ese mismo slot

## Diseño de Data Recomendado

## 1. Boss catalog

Hoy `src/data/bosses.js` mezcla:

- identidad del boss
- stats authored
- tier fijo

Para el refactor conviene separar:

```js
{
  id,
  name,
  family,
  archetype,      // aggressive, defensive, control, sustain, final, etc.
  slotRules,      // qué slots puede ocupar
  baseStats,      // hp, damage, defense, rewards
  baseMechanics,  // lista de mechanics ids
  abyssUpgrades,  // mejoras por ciclo o thresholds
  huntProfile,
}
```

`tier` authored fijo debería desaparecer del boss catalog final y pasar a ser un resultado del router.

## 2. Slot rules

Hay que modelar restricciones como data.

Ejemplo:

```js
slotRules: {
  allowedSlots: [1, 2, 3, 4],
  weight: 1.0
}
```

Y para finales:

```js
slotRules: {
  allowedSlots: [5],
  weight: 1.0
}
```

## 3. Encounter resolution

Contrato recomendado:

```js
resolveEncounterForTier({
  absoluteTier,
  runContext,
  unlocks,
})
```

Salida:

```js
{
  id,
  name,
  isBoss,
  tier: absoluteTier,
  sourceTier: absoluteTier,
  cycleTier: tierInCycle,
  cycleIndex,
  abyssDepth,
  bossSlot,
  family,
  mechanics,
  runtimeScalars,
}
```

## Fases Del Refactor

## Fase 1. Boss seeding real

Objetivo:

- pasar de bosses fijos por tier a bosses elegidos por slot via seed

Tareas:

1. Expandir `bosses.js` a `10-12+` bosses
2. Separar catálogo de boss de su ubicación
3. Implementar `buildBossSlotLayout(seed, rules)`
4. Definir restricciones por slot
5. Exponer en UI el layout de la run

Output mínimo:

- `runContext.bossSlots` seeded de verdad
- `spawnEnemy` ya usa ese layout
- tier `5/10/15/20/25` dejan de depender de `boss.tier`

## Fase 2. Abismo I+

Objetivo:

- permitir tiers `26+` con reuso de slots y escalado por ciclo

Tareas:

1. destrabar `maxTier` por encima de `25`
2. agregar escalado por `cycleIndex`
3. bosses del mismo slot mantienen identidad pero reciben upgrades
4. surfacing visual de “Abismo I / II / III”

Modelo recomendado:

```js
enemyScale = f(cycleIndex, tierInCycle)
bossScale = g(cycleIndex, tierInCycle)
```

Sugerencia pragmática:

- enemigos normales: curva exponencial leve por ciclo
- bosses: multiplicador base + un upgrade discreto por ciertos thresholds

## Fase 3. Unlocks por Abismo

Objetivo:

- convertir profundidad en progreso account-wide

Estado recomendado de cuenta:

```js
abyss: {
  highestDepthUnlocked: 0,
  highestAbsoluteTier: 25,
  unlockedBossPools: [],
  unlockedCorruptionSystems: [],
}
```

No mezclar esto todavía con prestige tree. Primero conviene que exista el sistema.

## Fase 4. Integración con prestige

Recién después:

- rama `abismo`
- nodos que dependen de `highestDepthUnlocked`
- pacing de ecos recalibrado con Abismo vivo

## UI / UX Recomendado

### 1. Combat HUD

Agregar:

- `Tier 33`
- `Abismo I`
- `Slot de boss 2` cuando corresponda

### 2. Run briefing

En `START_RUN` o panel lateral:

- seed de run
- bosses de slots 1-5
- highlight del final boss

### 3. Codex / Hunt

Separar:

- boss catalog descubierto
- seed actual de la run
- mejor profundidad alcanzada

## Save / Migración

## Lo que ya quedó migrable

`combat.runContext` ya se normaliza y persiste.

## Lo que faltará migrar después

- datos de Abismo account-wide
- histórico de depths
- futuros unlocks ligados a Abismo

Regla:

- la migración debe poder reconstruir un `runContext` aunque el save viejo no lo tenga
- los bosses seeded nunca deben romper la carga de un save anterior

## Riesgos Técnicos

### 1. Codex y hunt sources

Hoy varias lecturas dependen de `BOSSES[*].tier`.

Cuando el boss deje de tener tier fijo authored, habrá que:

- mover el tier al runtime
- mantener un “primer slot/base unlock tier” para Codex si hace falta legibilidad

### 2. Telemetría

Hoy la telemetría agrega por `tier`.

Con Abismo conviene sumar:

- `cycleIndex`
- `bossSlot`
- `seed`

si no después no se puede leer dificultad por layout.

### 3. Balance bot

`balanceBot` asume una escalera simple.

Cuando entre Abismo habrá que revisar:

- decisión de push/drop
- criterios de prestige
- techo de tier esperado

## Próximos Pasos Recomendados

Orden de implementación:

1. Boss seeding real con pool expandido
2. UI mínima para leer layout de run
3. Desbloquear tiers `26+`
4. Escalado de Abismo
5. Unlocks account-wide de Abismo
6. Rama `abismo` de prestige

## Qué Ya Está Hecho En Código

- `runContext` persistido en `combat`
- seed generado por ciclo de prestige
- seed renovado al prestigiar y preservado entre muertes
- ruteo de encounters separado en `encounterRouting.js`
- `spawnEnemy` consume el router nuevo

Eso no termina el sistema, pero sí evita que el refactor arranque otra vez desde `spawnEnemy(tier)` hardcodeado.
