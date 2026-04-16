# Estado Actual Del Juego

Fecha de corte: 2026-04-15 UTC
Repo: `idlerpg`
Branch actual del workspace: `main`
Estado del workspace: dirty worktree con cambios activos en crafting, prestigio, talentos, itemizacion, stat/combat, progression y UI.
Build: `npm run build` compila OK en el estado actual.

## Resumen Ejecutivo

El juego actual ya no es un idle lineal simple. Hoy funciona como un loop de:

1. combate por tiers,
2. loot y comparacion vs equipado,
3. crafting orientado a run,
4. decisiones de build por clase/especializacion/talentos,
5. capas meta de goals, achievements, Codex, prestige y run sigils,
6. lectura de telemetria y replay desde Lab.

El proyecto ya tiene suficiente masa para que un Lead GD piense en:

- pacing de early/mid/late,
- chase de loot,
- sinks de recursos,
- direccion de runs,
- salud del prestige loop,
- claridad de build identity,
- economia de oro/esencia,
- telemetria para validar balance.

## Stack Y Runtime

- Frontend: React 18 + Vite 5.
- Estado central: `useReducer` con `gameReducer`.
- Guardado: `localStorage`.
- Modo recovery/debug por URL:
  - `?fresh=1`
  - `?wipe=1`
  - `?nosave=1`
- Auto-save:
  - `600ms` en dev
  - `1800ms` en prod
- Offline progress:
  - se activa a partir de `60s` offline
  - procesa chunks de `120` ticks
  - cap de `3600` ticks simulados por vuelta

## Pantallas / Tabs Jugables

Tabs validos actuales: `11`

- `character`
- `combat`
- `inventory`
- `skills`
- `talents`
- `crafting`
- `prestige`
- `achievements`
- `stats`
- `lab`
- `codex`

`lab` no es una pantalla separada de runtime; usa el componente de Stats en modo laboratorio.

## Contenido Jugable Principal

### Clases y especializaciones

Clases: `2`
Especializaciones: `4`

Clases:

- `warrior`
- `mage`

Especializaciones:

- Warrior:
  - `berserker`
  - `juggernaut`
- Mage:
  - `sorcerer`
  - `arcanist`

Identidades actuales:

- Warrior:
  - frontal, fisico, dano + defensa
  - Berserker: crit, leech, low life, cadenas agresivas
  - Juggernaut: vida, defensa, block, thorns, conversion defensa -> dano
- Mage:
  - caster single-target, setup, flow, precision
  - Sorcerer: burst, volatilidad, opener, chain burst, cataclysm
  - Arcanist: control, marca, transferencias, memory, flow limpio

### Skills / Player upgrades

Player upgrades permanentes comprables con oro: `6`

- damage
- maxHp
- critChance
- goldBonus
- xpBonus
- attackSpeed

La pantalla `Skills` hoy cumple dos roles:

- sink de oro permanente,
- lectura resumida del estado de build actual.

### Talentos

Sistema de talentos actual: version `6`

Arboles principales: `6`

- `warrior_general`
- `berserker`
- `juggernaut`
- `mage_general`
- `sorcerer`
- `arcanist`

Slots base visibles en layout: `48`

- 6 arboles
- 8 slots authored por arbol

Estructura base por arbol:

- 3 basics
- 3 gameplay
- 2 keystones

Tracks sink de late game: `3`

- `warrior_iron_mastery`
- `berserker_blood_mastery`
- `juggernaut_eternal_bastion`

Cada sink tiene `20` niveles.

Entradas de talentos generadas por datos:

- plantillas base: `504`
- sinks: `60`
- total generado: `564`

Observacion importante:

- Warrior tiene sinks de late.
- Mage hoy no tiene sink equivalente en `talentSinks.js`.
- Eso deja asimetria de escalado largo entre familias de build.

## Prestige

Ranks de prestige: `8`
Ramas de prestige: `6`
Nodos de prestige: `48`

Ramas:

- `war`
- `bulwark`
- `fortune`
- `sorcery`
- `dominion`
- `forge`

Lectura de diseño actual:

- `war`: dano, crit, ritmo Warrior, push ofensivo
- `bulwark`: vida, block, regen, thorns, identidad Juggernaut
- `fortune`: oro, xp, esencia, loot, suerte
- `sorcery`: burst/opening/cataclysm/volatile
- `dominion`: marca, flow, transfer, control
- `forge`: economia y precision de crafting

Run sigils se desbloquean al llegar a prestige level `1`.

## Run Sigils

Run sigils actuales: `5`

- `free`
- `ascend`
- `hunt`
- `forge`
- `dominion`

Rol de cada uno:

- `free`: baseline de medicion
- `ascend`: push de nivel/tier/ecos
- `hunt`: caza de powers legendarios y duplicados
- `forge`: corrida de esencia + crafting barato
- `dominion`: progreso horizontal de Codex

Los sigils ya son una capa direccional real de corrida, no cosmetica.

## Combate

### Enemigos y bosses

Enemigos normales authored por tier: `25`
Bosses: `5`

Bosses authored:

- Orc Warlord, tier 5
- Void Titan, tier 10
- Blood Matriarch, tier 15
- Iron Sentinel, tier 20
- Void Sovereign, tier 25

Spawn actual:

- `spawnEnemy(tier)` busca boss exacto por tier
- si no hay boss, usa el enemigo normal de ese tier

Esto deja una progresion muy clara de techo actual en tier `25`.

### Familias, affixes y mecanicas de encuentro

Familias de enemigos: `12`
Monster affixes: `11`
Boss mechanics: `6`

Boss mechanics actuales:

- absorb_first_crit
- enrage_low_hp
- shield_every_n
- armor_shred
- crit_immunity
- double_strike

Combat states / identidades visibles en UI y runtime:

- bleed
- fracture
- mark
- flow
- memory
- volatile casting
- chain burst
- cataclysm
- lifesteal
- block
- thorns

Hay suficiente complejidad para hablar ya de "micro-rotacion pasiva" aunque siga siendo idle.

## Itemizacion

### Volumen y tipos

Items authored en `items.js`: `70`

Por rareza:

- common: `17`
- magic: `13`
- rare: `11`
- epic: `9`
- legendary: `20`

Por tipo:

- weapon: `39`
- armor: `31`

### Familias de item

Familias de item: `15`

Weapons: `7`

- sword
- axe
- mace
- dagger
- spear
- wand
- focus

Armors: `8`

- plate
- mail
- vest
- leather
- spiked
- wrap
- shroud
- buckler

Cada familia define:

- primary base,
- extra base pools,
- afinidades,
- preferred/discouraged stats,
- implicits por rareza.

### Blueprint de rareza

Rareza -> composicion estructural:

- common: 1 base, 1 implicit, 0 affixes
- magic: 1 base, 1 implicit, 1 affix
- rare: 1 base, 1 implicit, 1 affix
- epic: 2 bases, 1 implicit, 2 affixes
- legendary: 3 bases, 1 implicit, 3 affixes

Conclusiones GD:

- epic ya empieza a sentirse como pieza construida
- legendary tiene masa suficiente para chase real
- rare hoy sigue siendo una transicion, no una capa final

## Crafting

Modos de crafting activos: `6`

- upgrade
- reroll
- polish
- reforge
- ascend
- extract

### Limites duros

- reroll por item: `5`
- reforge por item: `3`
- polish por linea: `5`

### Upgrade

- cap: `+10`
- fail chance:
  - `+0`: 0
  - `+1`: 0
  - `+2`: 3%
  - `+3`: 8%
  - `+4`: 15%
  - `+5`: 22%
  - `+6`: 30%
  - `+7`: 39%
  - `+8`: 48%
  - `+9`: 57%
  - `+10`: 66%
- costo: oro, escala con `(currentLevel + 1)^2` y multiplicador de rareza
- hoy upgrade escala:
  - base del item
  - implicit del item
  - no toca affixes

### Reforge

- costo en esencia
- sensible al tier del affix target
- hoy la base ofrece `3` opciones totales de reforja
- la herramienta fija una linea trabajada si aceptas reemplazo

### Ascend

Ascend por rareza:

- common -> magic, min level 3
- magic -> rare, min level 5
- rare -> epic, min level 7
- epic -> legendary, min level 9

Ascend puede injertar poder legendario si ya fue descubierto en Codex.

### Cambios validados hoy

Cambios concretos confirmados en el estado actual del workspace:

- Forja:
  - la reforja quedo en `3` opciones base totales
  - `Profecia del Yunque` ya no da opcion extra de reforja
  - ahora baja costo de injertar poder legendario
  - `Apex de Forja` tambien dejo de sumar opcion de reforja y ahora empuja ese costo de imprint
- Upgrade:
  - se agrego preview del siguiente `+1` en `Crafting`
  - ahora muestra stats afectados y `vs equipado`
  - el scaling base del upgrade paso a curva compuesta mas agresiva
- Implicits:
  - el caption del implicito ahora muestra el valor efectivo real actual, no solo el base

## Codex Y Chase Legendario

Poderes legendarios authored: `19`

El Codex hoy tiene tres capas:

1. Family mastery
2. Boss mastery
3. Legendary power mastery

### Family mastery

- 12 familias de enemigos
- milestones en `50 / 250 / 1000` kills
- da bonuses permanentes chicos pero acumulables

### Boss mastery

- 5 bosses
- milestones cortos por boss
- 1 kill y 5 kills en casi todos
- el boss final tiene 1 y 3 kills

### Power mastery

4 rangos:

- 1 discovery: Descubierto
- 3 discoveries: Sintonizado
- 6 discoveries: Dominado
- 10 discoveries: Mitico

Beneficios de mastery:

- `imprintCostReduction`
- `huntBias`

Esto ya crea:

- target farming,
- chase de duplicados,
- progresion horizontal fuera del item puntual.

## Goals, Achievements, Metagame

Achievements: `52`
Goals activos/authored: `38`

Achievements por categoria:

- combat: 9
- run: 2
- progress: 8
- economy: 7
- loot: 8
- affix: 7
- craft: 6
- build: 3
- meta: 2

Los goals ya estan integrados al runtime:

- se muestran en Combat
- se pueden claimear
- dan oro / esencia / talent points

Esto funciona como onboarding y pacing rail sin tutorial tradicional.

## Dungeons

Dungeons authored: `5`

Importante:

- `dungeons.js` esta marcado explicitamente como design stub
- hoy no esta cableado al runtime principal
- sirve como direccion de diseño futura, no como feature live

Conclusion:

- existe contenido conceptual
- no debe contarse como sistema shipped

## Telemetria, Replay Y Herramientas De Balance

La capa de observabilidad ya es seria.

### Session analytics

`runTelemetry` trackea:

- progreso de run
- economia
- gasto por fuente
- rarezas
- crafting success/fail
- tiempos clave
- best drop
- drops por tier
- muertes por tier

### Replay

`replayLog` guarda:

- acciones de usuario/sistema
- milestones
- snapshots compactos
- libreria de replays
- export/import bundle

### Lab / Stats

La pantalla `lab` ya ofrece:

- export/import de save
- export/import de replay
- dataset bundle de replays
- telemetry report
- balance bot simulation

Para un Lead GD esto significa que el proyecto ya tiene bases para:

- playtest cualitativo,
- lectura cuantitativa,
- perfiles de run,
- comparacion entre ramas/builds.

## Estado De Guardado E Inicializacion

Estado fresco:

- nivel 1
- sin clase elegida
- sin especializacion
- tab inicial `character`
- run sigil activo `free`
- run setup pendiente desactivado
- inventario vacio
- equipo vacio

Hay sanitizacion fuerte de save:

- caps de recuperacion para oro, esencia, nivel y stats
- normalizacion de Codex, replay, analytics y prestige

## Estado De Diseño Que Ya Se Percibe En Juego

Lo que ya esta bastante claro:

- identidad de clase y spec
- direccion de run via sigils
- loop meta con prestige
- loot chase por familias/stats/powers
- crafting como decision de run, no solo sink
- Codex como progresion horizontal

Lo que aun huele a sistema en construccion:

- dungeons reales
- sinks tardios equivalentes para todas las familias de build
- mayor paridad de profundidad entre Warrior y Mage en late
- consolidacion del endgame por encima de tier 25

## Observaciones De Producto / GD

- El techo actual esta muy explicitamente definido en tier 25 y boss tier 25.
- La estructura de contenido es suficiente para hablar de early, mid y late, pero el late aun depende mucho de loops meta y chase, no de nuevas actividades.
- Hay una asimetria interesante: Warrior tiene sinks de talento de late, Mage hoy no.
- Forge y Codex ya compiten por ser la capa "mas inteligente" del meta. Eso es bueno si se separan por intencion de run; es peligroso si se pisan.
- Run sigils son una de las mejores piezas del estado actual porque convierten el prestige loop en direccion jugable concreta.
- El crafting actual ya permite decisiones de precision real:
  - reroll total,
  - polish de numero,
  - reforge de linea,
  - ascend con o sin power.
- El proyecto ya tiene suficiente tooling para balance iterativo rapido sin depender solo de sensacion subjetiva.

## Fuentes De Verdad Relevantes

- App y tabs: `src/App.jsx`
- clases: `src/data/classes.js`
- talentos authored layout: `src/data/talentTree.js`
- talentos generados: `src/data/talents.js`
- sinks: `src/data/talentSinks.js`
- prestige: `src/data/prestige.js`
- run sigils: `src/data/runSigils.js`
- items: `src/data/items.js`
- familias de item: `src/data/itemFamilies.js`
- powers legendarios: `src/data/legendaryPowers.js`
- crafting: `src/engine/crafting/craftingEngine.js`
- costos de crafting: `src/constants/craftingCosts.js`
- codex: `src/engine/progression/codexEngine.js`
- enemigos y bosses: `src/data/enemies.js`, `src/data/bosses.js`, `src/data/encounters.js`
- telemetry: `src/utils/runTelemetry.js`
- replay: `src/utils/replayLog.js`
- estado inicial: `src/engine/stateInitializer.js`

