# Estado Actual Del Juego

Fecha de corte: 2026-04-19 UTC  
Repo: `idlerpg`  
Workspace: `main` con worktree activo  
Propósito de este documento: handoff conceptual para otra IA o diseñador.  

## Qué Es El Juego Hoy

La tesis actual del proyecto ya no es:

`combate -> loot -> prestige`

Sino:

`Santuario -> Expedición -> Extracción -> Santuario`

El juego se está moviendo desde un idle ARPG clásico hacia un **idle RPG extraction-lite**:

- la expedición genera valor,
- no todo ese valor vuelve automáticamente,
- el Santuario procesa ese valor,
- `Ecos` sigue siendo la capa meta,
- y los blueprints reemplazan a la idea de “me llevo el item final intacto”.

La fantasía correcta hoy no es Tarkov hardcore.  
Es:

- riesgo sin castigo tóxico,
- retorno frecuente al Santuario,
- proyectos persistentes a largo plazo,
- monetización futura por conveniencia / slots / tiempo, no por poder bruto.

---

## Decisiones De Diseño Ya Tomadas

Estas cosas ya no deberían reabrirse desde cero al proponer ideas:

- `Santuario` sí es parte del core loop.
- `Extracción` y `Prestige` ya no son dos salidas separadas para el jugador.
- `Ecos` sigue existiendo, pero como consecuencia de una buena extracción.
- La muerte no debe borrar una run al primer error.
- La expedición no debería fabricar sola el mejor item final del juego.
- Los items rescatados **no vuelven como gear usable directo** para runs futuras.
- Lo persistente ahora es:
  - `cargo`,
  - `blueprints`,
  - `family charges`,
  - progreso de estaciones,
  - `Ecos`,
  - `Biblioteca`,
  - `Abismo`.
- `Caza` es contextual a una run, no una capa meta general.
- `Biblioteca` es parte del Santuario, no una tab principal.
- `Laboratorio` es infraestructura del Santuario, no una tab top-level permanente.

---

## Foto Rápida Del Contenido Actual

### Build / progreso de personaje

- `2` clases:
  - `Warrior`
  - `Mage`
- `4` specs:
  - `Berserker`
  - `Juggernaut`
  - `Sorcerer`
  - `Arcanist`
- `6` árboles de talentos:
  - `warrior_general`
  - `berserker`
  - `juggernaut`
  - `mage_general`
  - `sorcerer`
  - `arcanist`
- `7` ramas de `Ecos`:
  - `war`
  - `bulwark`
  - `fortune`
  - `sorcery`
  - `dominion`
  - `forge`
  - `abismo`
- `5` sigilos de run:
  - `free`
  - `ascend`
  - `hunt`
  - `forge`
  - `dominion`

### Mundo / encounter / hunt

- `25` tiers base
- `Abismo` en `26+`
- enemigos comunes seeded por run
- bosses seeded por run
- `12` bosses authored
- mutador por ciclo de Abismo

### Itemización

- rarezas relevantes:
  - `common`
  - `magic`
  - `rare`
  - `epic`
  - `legendary`
- pool de affixes base ampliado y recategorizado
- `Reroll` de expedición rehace identidades completas
- los extracted items ya no son piezas finales persistentes
- los blueprints son la forma persistente del item

---

## Arquitectura De Navegación Actual

## Bottom nav actual

El juego ya está migrado a una navegación más limpia:

- `Santuario`
- `Expedición`
- `Heroe`
- `Ecos`
- `Registro`

Importante:

- `Ecos` no aparece desde el inicio.
- `Caza` ya no es una tab principal.
- `Laboratorio` ya no es una tab principal.

## Desbloqueo de navegación

### Desde el inicio

Tabs visibles:

- `Santuario`
- `Expedición`
- `Heroe`
- `Registro`

### Después del primer prestige / primera conversión a ecos

Se habilita:

- `Ecos`

### Dentro de `Expedición`

Subvistas actuales:

- `Combate`
- `Mochila`
- `Forja`
- `Caza` solo cuando ya tiene sentido

`Caza` se habilita cuando:

- llegaste a `Tier 5`, o
- tuviste `maxTier >= 5`, o
- ya viste al menos una familia en esa expedición

### Dentro de `Heroe`

Subvistas:

- `Ficha`
- `Atributos`
- `Talentos`

### Dentro de `Registro`

Subvistas:

- `Logros`
- `Metricas`
- `Sistema`

`Registro` contiene ahora la parte secundaria y de tester:

- logros de cuenta,
- telemetría,
- replay,
- save/debug avanzado.

---

## Storyline Del Jugador Hoy

Esta es la versión conceptual del journey actual.

## Etapa 0: primera sesión

El jugador entra y ve:

- `Santuario`
- `Expedición`
- `Heroe`
- `Registro`

Todavía no ve:

- `Ecos`

En `Santuario`, desde el primer momento ya existen:

- `Destilería`
- `Laboratorio`

Pero todavía están bloqueadas:

- `Biblioteca`
- `Altar de Sigilos`
- `Encargos`
- `Forja Profunda`

En `Heroe`, el jugador:

- elige clase,
- luego especialización,
- empieza a leer build desde `Ficha / Atributos / Talentos`.

## Etapa 1: primera expedición

En `Expedición`, el jugador vive una run bastante directa:

- combate por tiers,
- consigue drops,
- usa `Mochila`,
- puede usar una `Forja` de campo muy acotada.

La forja de campo hoy está deliberadamente reducida a:

- `Reroll`
- `Extract`

No hace ya en la run:

- `Upgrade +N`
- `Polish`
- `Reforge`
- `Ascend`

La idea es que la run rescate bases prometedoras, no que cierre el item perfecto.

## Etapa 2: primera caza

`Caza` no aparece de entrada.

Se vuelve relevante recién cuando:

- aparece el primer boss / `Tier 5`,
- o ya viste familias reales en la expedición.

Su rol actual es táctico:

- qué objetivos revelados existen,
- qué familias ya viste en esta expedición,
- qué bosses de la seed actual están en juego.

No debe spoilear de más.

## Etapa 3: primera extracción

El jugador ya no “prestigia” como botón separado.  
El CTA fuerte es:

- `Extraer al Santuario`

La extracción actual:

- puede convertir la expedición a `Ecos` si ya cumpliste gate,
- siempre puede devolver valor persistente al Santuario,
- y es el cierre unificado de run.

En la extracción actual pueden volver:

- `cargo` abstracto
- `1` item rescatado temporal

Ese item rescatado **no se equipa en futuras runs**.  
Después, en el Santuario, el jugador decide:

- `Convertirlo en blueprint`
- o `Desguazarlo`

## Etapa 4: primer regreso al Santuario

Ahí empieza el loop nuevo de verdad.

El jugador ve:

- claims,
- recursos persistentes,
- estaciones,
- stash temporal,
- jobs,
- `Laboratorio`,
- eventualmente `Forja Profunda`.

El loop conceptual es:

1. extraer algo valioso
2. procesarlo
3. convertirlo en recurso o blueprint
4. preparar la siguiente expedición

## Etapa 5: primer prestige / primer `Ecos`

La primera conversión a `Ecos` se habilita cuando la run cumple:

- `Tier 5`, o
- `1 boss`, o
- `Nivel 12`

Además, el primer prestige tiene piso:

- mínimo `2` ecos

Cuando esto ocurre:

- aparece la tab `Ecos`
- el jugador entiende por primera vez la meta-progression fuerte

Después del primer prestige, el gate baja a:

- `Tier 3`, o
- `Nivel 10`, o
- `50` bajas

## Etapa 6: midgame del Santuario

Ya con `Ecos` y primeras extracciones, el jugador empieza a desbloquear estaciones desde `Laboratorio`.

El orden actual es:

1. `Biblioteca`
2. `Altar de Sigilos`
3. `Encargos`
4. `Forja Profunda`

Desde ahí el juego pasa a ser realmente:

- expediciones,
- extracción,
- jobs persistentes,
- preparación de runs,
- progreso de blueprints,
- investigación.

## Etapa 7: late / Abismo

Después de `Tier 25`, entra `Abismo`.

Los hitos actuales son:

- `Abismo I` (`Tier 26+`): desbloquea capa meta de Abismo
- `Abismo II` (`Tier 51+`): desbloquea acceso a Forja/Affixes de Abismo
- `Abismo III` (`Tier 76+`): desbloquea rewards / powers legendarios de Abismo
- `Abismo IV` (`Tier 101+`): segundo slot de sigil de run

Eso hace que el late ya no sea sólo “más números”:

- cambia buildcraft,
- cambia sigils,
- cambia el reward ceiling,
- cambia el contenido meta.

---

## Estructura Actual De Sistemas

## Expedición

### Qué es

La run activa.

### Qué produce

- progreso de tiers
- bosses
- drops
- progreso de `Biblioteca`
- progreso de `Ecos`
- `cargo`
- `items rescatables`

### Qué no debería producir ya

- el item final perfecto persistente

### Muerte actual

La muerte ya no es full reset brutal.

Hoy:

- tenés `3` muertes seguras por expedición
- la `4ta` abre `Extracción de emergencia`

Soft death actual:

- corta auto-avance
- revive al héroe
- retrocede `5` tiers
- si eso cae en múltiplo de `5`, retrocede `1` más para evitar boss tier

O sea:

- hay castigo,
- pero no se pierde todo por un click tonto.

## Extracción

### Qué es

El cierre de expedición.

### Qué unifica

- retiro
- prestige
- cierre por muerte extrema

### Qué devuelve

- `cargo`
- `item rescatado`
- `Ecos` si corresponde

### Estado conceptual actual

La extracción ya es el verbo correcto del juego.  
`Prestige` ya no es la acción principal del jugador.

## Santuario

### Qué es

La home persistente.

### Qué concentra

- claims
- jobs
- recursos
- estaciones
- stash temporal
- blueprints
- infraestructura

### Qué debería transmitir

“Acá proceso lo que traje y preparo la próxima salida.”

---

## Estaciones Del Santuario

## Estaciones abiertas de base

### `Destilería`

- desbloqueada desde el inicio
- procesa `cargo`

### `Laboratorio`

- desbloqueado desde el inicio
- ordena el unlock progresivo del Santuario

## Estaciones desbloqueables vía `Laboratorio`

### 1. `Biblioteca`

- research id: `unlock_library`
- costo: `15 codexInk + 60 essence`
- duración: `10m`

### 2. `Altar de Sigilos`

- research id: `unlock_sigil_altar`
- costo: `12 codexInk + 70 essence`
- duración: `12m`

### 3. `Encargos`

- research id: `unlock_errands`
- costo: `18 codexInk + 90 essence`
- duración: `15m`

### 4. `Forja Profunda`

- research id: `unlock_deep_forge`
- costo: `24 codexInk + 120 essence`
- duración: `20m`

## Upgrades actuales de estaciones

Cada estación hoy tiene una primera ola de mejoras de:

- `+1 slot`
- `-15% tiempo`

Ejemplos actuales:

- `Destilería Expandida`: `14 ink + 80 essence`, `20m`
- `Mesas de Archivo`: `30 ink + 100 essence`, `25m`
- `Segundo Brasero`: `18 ink + 95 essence`, `22m`
- `Cuadrilla Extra`: `20 ink + 110 essence`, `25m`
- `Banco de Forja Extra`: `26 ink + 2 dust + 130 essence`, `30m`

Y upgrades de velocidad:

- `Destilería`: `18 ink + 90 essence`, `20m`
- `Biblioteca`: `28 ink + 110 essence`, `24m`
- `Altar`: `22 ink + 100 essence`, `22m`
- `Encargos`: `24 ink + 110 essence`, `26m`
- `Forja`: `30 ink + 2 dust + 130 essence`, `30m`

---

## Recursos Persistentes Y Qué Hacen

## Oro

Rol:

- upgrades permanentes simples del héroe
- economía base de run

## Esencia

Rol:

- crafting
- parte del progreso estructural del Santuario
- ascensión de blueprints
- costos del Laboratorio

## Ecos

Rol:

- currency meta persistente
- árbol de `Ecos`
- resonancia por `totalEchoesEarned`

## Tinta de Biblioteca (`codexInk`)

Rol:

- unlocks del Laboratorio
- investigaciones de `Biblioteca`

## Flux de Sigilo (`sigilFlux`)

Rol:

- infusiones del `Altar de Sigilos`

## Polvo de Reliquia (`relicDust`)

Rol:

- progreso de blueprints
- sintonía de poder
- ascensión de blueprints
- parte de upgrades de `Laboratorio`
- algunas investigaciones de `Biblioteca`

## Family Charges

Rol:

- sesgar el roll de afijos cuando un blueprint se materializa

Familias actuales:

- `bleed_dot`
- `crit_burst`
- `tempo_combo`
- `mark_control`
- `guard_vitality`
- `fortune_utility`

## Cargo bundles

Tipos actuales:

- `essence_cache`
- `codex_trace`
- `sigil_residue`
- `relic_shard`

Conceptualmente, el cargo es “botín procesable” del Santuario, no gear.

---

## Jobs Time-Gated Actuales

## Destilería

Duraciones base:

- `essence_cache`: `20m`
- `codex_trace`: `30m`
- `sigil_residue`: `45m`
- `relic_shard`: `60m`

Outputs conceptuales:

- `essence_cache` -> esencia refinada
- `codex_trace` -> tinta
- `sigil_residue` -> flux
- `relic_shard` -> polvo

## Altar de Sigilos

Recetas actuales:

- `free`: `2h`
- `ascend`: `2h`
- `hunt`: `6h`
- `forge`: `6h`
- `dominion`: `12h`

Todas consumen `sigilFlux`.

Rol conceptual:

- preparar una run futura,
- no buffear permanentemente la cuenta.

## Encargos

Duraciones actuales:

- `15m`
- `1h`
- `4h`

Tipos de encargo:

- afinidad para familias de blueprints
- `Biblioteca`
- materiales

Rol conceptual:

- progresión paralela del Santuario
- retorno frecuente
- otra fuente de recursos persistentes

## Biblioteca

Tipos de investigación:

- maestrías de familias
- maestrías de bosses
- maestrías de powers legendarios

Importante:

- los bonuses ya no se activan sólo por matar mucho
- primero llenás progreso
- después gastás tinta
- y corrés una investigación

Esto evita el problema de:

“jugué casualmente mil kills y ahora destrabé todo gratis”

## Laboratorio

Tipos de investigación:

- unlock de estaciones
- slots
- reducción de tiempos

## Forja Profunda

Hoy ya opera sobre blueprints, no sobre items exactos persistidos.

Tres progresiones actuales:

### `Estructura`

- cap: `12`
- costo: `relicDust`
- sube el rating estructural del plano
- mejora base e implícito futuros

### `Sintonía de poder`

- solo si el blueprint tiene `legendaryPower`
- cap: `5`
- costo: `relicDust`
- potencia el efecto numérico del poder

### `Ascensión`

- cap: `3`
- requiere blueprint en cap de estructura
- cuesta `relicDust + essence`
- resetea `blueprintLevel` a `0`
- sube `ascensionTier`
- aumenta tier efectivo, rating, base e implícito del plano

---

## Blueprints: Cómo Funcionan Hoy

Este es uno de los núcleos conceptuales más importantes del juego actual.

## Qué NO son

No son:

- el item exacto guardado
- una pieza equipable entre runs
- una copia intacta del mejor loot que ya salió

## Qué SÍ son

Son una plantilla persistente que guarda:

- rareza
- slot (`weapon` o `armor`)
- familia/base/implicit del item original
- `baseRating` del item cuando se convirtió
- `itemTier` del drop original
- poder legendario si lo tenía
- afinidades de familias de afijos
- progreso persistente del plano:
  - `blueprintLevel`
  - `powerTuneLevel`
  - `ascensionTier`

## Materialización

Cuando empieza una nueva expedición:

- el blueprint activo se materializa en un item nuevo de campo

Ese item:

- conserva la identidad base del plano
- conserva su implicit
- conserva su rareza
- usa cantidad de affixes según rareza
- pero los affixes se vuelven a generar
- con sesgo según afinidades

O sea:

- el blueprint no garantiza el roll exacto
- sí empuja la dirección del roll

## Cargas / afinidades

El jugador puede:

- desguazar items rescatados
- recibir `familyCharges`
- invertir esas cargas en el blueprint

Eso aumenta la chance de que en la próxima materialización aparezcan afijos de esa familia.

Hoy todavía no existe garantía dura de línea.  
El sistema actual es de sesgo fuerte, no de resultado exacto.

## Slots activos

Conceptualmente hoy hay loadout de blueprint para:

- arma
- armadura

---

## Biblioteca: Cómo Funciona Hoy

## Filosofía

`Codex` ya no es una tab general de meta.  
Se partió en:

- `Caza`: referencia táctica durante expedición
- `Biblioteca`: archivo e investigación desde Santuario

## Qué queda en `Caza`

- objetivos revelados
- bosses de la seed actual
- familias vistas en la expedición actual
- powers relevantes sin spoilear de más

## Qué vive en `Biblioteca`

- familias descubiertas
- bosses descubiertos
- powers descubiertos
- maestrías
- progreso de investigación
- bonuses activos
- glosario/archivo

## Progresión actual de Biblioteca

### Familias

Cada familia tiene `3` hitos:

- `50 kills`
- `250 kills`
- `1000 kills`

Pero eso ya no da el bonus automáticamente:

- esos kills llenan `researchProgress`
- el progreso se capea al siguiente hito
- para activar el bonus hay que investigar
- al iniciar la investigación, ese progreso se consume para ese rango

### Bosses

Cada boss tiene `2` hitos:

- normalmente `1 kill`
- luego `5 kills`

Excepción visible:

- `Void Sovereign`: `1` y `3`

### Legendary powers

Ranks actuales:

- `1`: `Descubierto`
- `2`: `Sintonizado`
- `3`: `Dominado`
- `4`: `Mitico`

Thresholds:

- `1` descubrimiento
- `3`
- `6`
- `10`

Regla importante:

- `rank 1` es automático al primer drop
- `rank 2+` requiere investigación en Biblioteca

---

## Ecos: Cómo Funcionan Hoy

## Filosofía

`Ecos` ya no son sólo “rank de prestige”.

Hoy:

- el prestige viejo como acción separada desapareció
- la capa meta se llama `Ecos`
- la progresión permanente viene de:
  - `totalEchoesEarned`
  - árbol de ramas
  - resonancia

## Primer spike

El primer prestige tiene piso:

- mínimo `2 ecos`

Eso existe para que el primer reset se sienta real.

## Resonancia

La resonancia:

- escala por cada eco ganado
- usa tramos decrecientes
- mira `totalEchoesEarned`, no los ecos guardados

Eso evita castigar gastar.

## Branches actuales

- `war`
- `bulwark`
- `fortune`
- `sorcery`
- `dominion`
- `forge`
- `abismo`

Rol conceptual:

- `war` / `bulwark`: Warrior
- `sorcery` / `dominion`: Mage
- `fortune`: economía
- `forge`: crafting y precisión
- `abismo`: late game y profundidad

---

## Abismo: Estado Actual

`Abismo` ya existe y ya no es sólo “tiers infinitos”.

Hoy aporta:

- tiers `26+`
- mutador por ciclo
- bosses y comunes seeded por run
- unlocks account-wide
- rama de `Ecos` propia
- rewards / affixes / powers gated por profundidad

Unlocks actuales:

- `Abismo I`: capa meta de Abismo
- `Abismo II`: affixes/crafting de Abismo
- `Abismo III`: legendary rewards/powers de Abismo
- `Abismo IV`: segundo slot de sigil de run

---

## Lo Que Está Fuerte Hoy

- El juego ya tiene una tesis clara:
  - `Santuario -> Expedición -> Extracción -> Santuario`
- La navegación ya está bastante alineada con esa tesis.
- `Caza` y `Biblioteca` ya están bien separadas mentalmente.
- `Laboratorio` ya ordena bien el unlock progresivo del hub.
- La muerte ya no arruina la experiencia por accidente.
- `Ecos` ya no compiten con la extracción como CTA.
- Los blueprints ya impiden que una sola run te entregue el item final exacto.

---

## Problemas / Tensiones Abiertas

Esta es la parte más útil para otra IA.

## 1. Pacing del Santuario

Ya existe mucha infraestructura:

- `Destilería`
- `Biblioteca`
- `Altar`
- `Encargos`
- `Forja Profunda`
- `Laboratorio`

La pregunta no es “sumar más estaciones”, sino:

- si el pacing entre ellas está bien,
- si sus costos están bien escalados,
- y si el jugador entiende en qué orden debería usarlas.

## 2. Valor real de los blueprints

La dirección es buena, pero todavía hay preguntas abiertas:

- cuánto debería empujar cada ascensión,
- cuánto debería envejecer un blueprint viejo frente a drops de tiers más altos,
- cuánto control de affixes debería tener el jugador,
- y cuándo conviene descartar un blueprint y empezar otro.

## 3. Frontera entre run y persistencia

Hoy la expedición todavía tiene:

- `Reroll`
- `Extract`

La gran pregunta abierta de diseño sigue siendo:

- si `Reroll` debe quedarse en la run,
- o si incluso eso debería terminar migrando a la capa persistente.

## 4. Adicción / retorno

El juego ya tiene loops time-gated, pero todavía falta pulir:

- cuánto premio dan por sesión corta,
- cuánto scroll / fricción tiene el Santuario,
- y qué tan fuerte se siente el deseo de volver a revisar claims, blueprints y estaciones.

## 5. Economía

Los recursos ya existen, pero todavía hay que seguir afinando:

- `codexInk`
- `relicDust`
- `sigilFlux`
- `familyCharges`
- `essence`

La otra IA debería mirar:

- si cada uno tiene enough sinks,
- si alguno está inflado o muerto,
- y si la progresión de costos cuenta una historia sana.

---

## Qué Le Pediría A Otra IA

Sobre esta base, otra IA debería concentrarse en:

1. evaluar el journey del jugador desde la primera sesión hasta Abismo
2. revisar si el orden de unlocks del Santuario es el correcto
3. revisar si el costo/tiempo de `Laboratorio` y `Biblioteca` está bien escalado
4. revisar si el blueprint loop ya logra evitar BIS inmediato sin sentirse demasiado aleatorio
5. revisar si `Reroll` debería seguir en expedición o no
6. proponer mejoras de claridad, adicción sana y monetización de conveniencia

No hace falta que la otra IA “reinvente”:

- la tesis de Santuario,
- la extracción unificada,
- la existencia de blueprints,
- la separación entre `Caza` y `Biblioteca`.

Eso ya está bastante decidido.

