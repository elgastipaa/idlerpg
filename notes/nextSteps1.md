# Refactor / Next Steps

Fecha de corte: 2026-04-16 UTC
Contexto: cruce entre `notes/design.md`, el estado actual del repo y los cambios recientes ya hechos en crafting / prestige / talentos.

## Snapshot Relevante Del Juego Hoy

- Clases: `2`
- Specs: `4`
- Talent trees: `6`
- Prestige branches: `6`
- Bosses authored: `5`
- Enemigos base authored: `25`
- Tabs runtime: `11`

Hoy el juego ya tiene:

- `warrior` y `mage` con identidad clara de specs
- árbol de talentos por clase/spec con estructura `3 basics + 3 gameplay + 2 keystones`
- prestige de `6` ramas: `war`, `bulwark`, `fortune`, `sorcery`, `dominion`, `forge`
- crafting con upgrade / reforge / reroll / polish / transfer de poder legendario
- loop de loot y comparación vs equipado
- goals / achievements / codex / sigils / lab

## Qué Del Diseño Entra Bien Con El Código Actual

### 1. Sinks de late game para Mage

Esto sí encastra hoy y ya quedó implementado.

Estado anterior:

- Warrior ya tenía `3` sinks en `src/data/talentSinks.js`
- esos sinks además no estaban realmente cableados al `TALENT_TREES`
- Mage no tenía paridad de sink de late

Estado nuevo:

- se agregaron `3` sinks de Mage
- se injertaron los sink nodes en los `6` árboles, así que ahora existen de verdad en la UI y en el engine
- el engine de progresión ahora soporta sinks con más de un efecto pasivo

Sinks agregados:

- `mage_arcane_mastery`
- `sorcerer_volatile_mastery`
- `arcanist_mark_mastery`

Mapeo real contra el pseudo-código del diseño:

- `mage_arcane_mastery`
  - el doc pedía `magicDamage + magicPenetration`
  - hoy no existe capa de resistencia mágica / penetración mágica
  - se implementó como `poder arcano total` usando daño total para no inventar un sistema nuevo a medias
- `sorcerer_volatile_mastery`
  - mapeado a `volatileCasting + chainBurst`
  - encastra directo con stats y fórmulas ya vivas en `statEngine`
- `arcanist_mark_mastery`
  - mapeado a `controlMastery + spellMemory`
  - aproxima muy bien el objetivo de `mark amp + memory depth` sin crear recursos nuevos

Archivos tocados:

- `src/data/talentSinks.js`
- `src/data/talentTree.js`
- `src/engine/progression/progressionEngine.js`
- `src/components/Talents.jsx`

### 2. Cableado real de sink nodes

Esto también era simple y necesario.

Observación clave:

- los sinks de Warrior estaban definidos como talentos, pero no formaban parte del layout real de `TALENT_TREES`
- por eso el juego tenía data de sink, pero no un árbol realmente navegable para esos sinks

Ahora:

- los `6` árboles tienen su ramal sink en columna final
- Warrior y Mage quedan simétricos en estructura de late game

## Qué Del Diseño No Es “Simple De Sumar” Hoy

### 1. Bosses seeded por run

No entra como parche chico.

El diseño pide:

- pool de `12+` bosses
- slots seeded por run
- seed persistente y legible para el jugador
- propagación del mismo seed a ciclos de Abismo

El juego actual tiene:

- `5` bosses fijos authored por tier
- sin sistema de `runSeed`
- sin slots de boss separados de la progresión normal

Para hacerlo bien hace falta:

- nuevo modelo de datos de bosses por pool / slot
- generación y persistencia de seed por run
- UI para leer el seed o al menos sus outcomes
- compatibilidad con prestige, reset de run y replay

### 2. Abismo como ciclos 26+

Tampoco entra como cambio chico.

El diseño pide:

- repetir bloques de `25` tiers
- escalar enemigos y bosses por ciclo
- bosses eco del mismo seed
- unlocks por umbral de Abismo

Hoy no existe esa capa sistémica completa. Para hacerla bien hay que decidir:

- cómo se representa `cycleIndex` o `abyssDepth`
- cómo escala stats base vs affixes vs loot
- qué parte del unlock es account-wide y qué parte es por run

### 3. Rediseño de prestige a 7 ramas + tags

Esto ya es refactor con migración.

El juego actual tiene:

- `6` ramas
- estructura authored actual
- estado persistido con versión de sistema vigente

El diseño propone:

- `7` ramas
- rama nueva `abismo`
- árbol compartido account-wide con tags por clase/spec
- pacing nuevo de PP / momentum

Eso implica:

- migración de save
- redefinir ramas y nodos
- lógica de activación/inactivación por tag
- nuevo UX de prestige

### 4. Rare como item de crafting de endgame

La identidad de rare sí está buena, pero la parte técnica no es trivial todavía.

El punto más engañosamente “simple” es este:

- `rare +7 a +10` debería escalar también affixes

Hoy eso no conviene meter como parche rápido porque:

- el item no guarda una línea limpia de “valor base de affix antes del upgrade”
- el upgrade puede fallar y bajar nivel
- si escalás affixes destructivamente en cada éxito, después revertir en downgrade queda frágil

Para hacerlo sólido conviene primero elegir uno de estos modelos:

1. guardar affixes base y recalcular siempre desde nivel actual
2. guardar multiplicador de upgrade separado para affixes
3. reconstruir affixes desde roll base + tabla determinista por nivel

Sin eso, el rare endgame queda propenso a drift de valores y bugs de downgrade.

## Recomendación De Orden

### Orden pragmático

1. Consolidar el presente
2. Cerrar tuning de sinks Mage y de upgrade/crafting reciente
3. Elegir si el próximo refactor grande es `prestige` o `bosses + abismo`
4. Recién después abrir rare endgame

### Mi recomendación concreta

1. `Sprint chico`
   - validar sinks Mage en playtest
   - revisar pacing real de TP entre lvl `50+`
   - decidir si el sink general de Mage necesita una segunda capa cuando exista resistencia mágica
2. `Refactor 1`
   - bosses seeded por run
   - modelo de slots / pools / seed persistido
3. `Refactor 2`
   - ciclos de Abismo y unlocks
   - recién acá meter la rama `abismo` en prestige
4. `Refactor 3`
   - rare endgame y reglas exclusivas de `+7` a `+10`

## Diseño vs Código: Donde Hay Buen Encaje

Las partes con mejor encastre hoy son:

- sinks de Mage
- tuning de pacing / costos / thresholds
- nuevos nodos de prestige si reutilizan bonuses ya existentes
- ajustes de UI / surfacing de comparación de stats

Las partes con peor encastre hoy son:

- seed de bosses
- Abismo multi-ciclo
- prestige account-wide con tags
- rare endgame con affix scaling reversible

## Recomendaciones De Diseño Para No Romper El Refactor

- No meter a la vez `boss seeding`, `abismo`, `rama prestige nueva` y `rare +10 affix scaling`. Son cuatro sistemas acoplados.
- Si el objetivo principal es endgame, arrancar por `boss seeding + abyss loop`. Eso crea contenido y pacing.
- Si el objetivo principal es meta-progresión, arrancar por `prestige refactor`. Pero hacerlo antes del Abismo obliga a inventar nodos para una capa que todavía no existe.
- Si el objetivo principal es crafting fantasy, esperar a tener definido el lugar del rare frente a affixes de Abismo, si no el sistema nace sin contexto.

## Estado De Esta Iteración

Implementado ahora:

- sinks Mage
- soporte de sinks multi-efecto
- sink nodes realmente conectados al árbol

No implementado ahora:

- bosses seeded
- Abismo
- prestige de `7` ramas
- rare `+7` a `+10` con affixes escalables

## Próximo Paso Recomendado

Elegir uno de estos dos caminos y no mezclar ambos en el mismo refactor:

1. `Bosses + Abismo`
2. `Prestige refactor`

Si querés, el siguiente documento que te puedo dejar es uno de estos dos:

- `notes/refactor-abyss.md` con modelo técnico concreto de seed, slots, ciclos y unlocks
- `notes/refactor-prestige.md` con propuesta de migración desde las `6` ramas actuales a las `7` del diseño
