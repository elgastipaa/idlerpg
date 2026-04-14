# IdleRPG Roadmap

## North Star

Construir un idle ARPG mobile-first de sesiones cortas donde cada run persiga una mejora concreta, cada actividad tenga una recompensa propia y cada reset abra nuevas rutas de farmeo en vez de repetir el mismo loop.

## Ambicion de Largo Plazo

La meta no es hacer un mini-PoE ni un pseudo-MMO. La meta es hacer el ARPG idle mas adictivo, claro y rejugable posible para un equipo chico:

- que tenga loot chase real
- que tenga builds con identidad
- que tenga progreso account-wide satisfactorio
- que tenga loops de sesion claros
- que genere momentos compartibles: drops, bosses, milestones, piezas casi perfectas, codex completado, resets eficientes

El ideal final es que los jugadores digan:

- "Estoy farmeando tal boss por esta pieza"
- "Me salio una base perfecta"
- "Cerre mi build"
- "Me conviene hacer prestige ahora por este nodo"
- "Mira esta pieza" y manden screenshot por WhatsApp

## Identidad del Juego

### Lo que si es

- Idle ARPG single-player
- Mobile-first
- Sesiones de 5 a 20 minutos
- Loop principal de matar, lootear, craftear, empujar y resetear
- Chase de build y de cuenta

### Lo que no debe ser

- Un MMO con mil menues y chores
- Un simulador de currencies al estilo PoE
- Un idle puramente abstracto sin fantasia de loot
- Un ARPG de campaña larga obligatoria
- Un sistema de temporadas que tape problemas estructurales

## Mezcla de Referencias

### Referencias principales

- Diablo 3: claridad, spikes de poder, objetivo directo
- Torchlight Infinite: loops cortos, build enablers, actividades con identidad
- Melvor Idle: longevidad, account progression, claridad de metas

### Referencias secundarias

- Grim Dawn: target farm, familias de enemigos, builds con personalidad
- Diablo 4: lanes paralelas de endgame con rewards diferenciadas
- Warframe: progreso account-wide y coleccion con valor real
- RuneScape: collection log y progreso horizontal de cuenta

### Referencias a usar solo en dosis chicas

- Path of Exile 1: modularidad y rutas de farmeo
- Path of Exile 2: legibilidad de combate y bosses memorables

## Diagnostico Actual

Hoy el juego ya tiene una buena base:

- combate automatico
- tiers
- bosses
- loot con rarezas y affixes
- crafting
- talentos
- specs
- prestige
- goals
- telemetria
- offline progress
- best drop y loot highlights
- codex empezando a convertirse en mastery compendium

Pero todavia tiene un problema central:

> La progresion sigue siendo demasiado vertical y demasiado monocarril.

En la practica, muchos sistemas todavia desembocan en la misma respuesta:

- pego mas fuerte
- aguanto mas
- farmeo el mismo loop
- repito con mejores numeros

Eso no alcanza para sostener 6 a 12 meses de interes.

## Objetivo del MVP 2.0

El MVP 2.0 no es "mas contenido". Es el punto donde el juego ya se siente como un producto con identidad propia.

### MVP 2.0 deberia cumplir esto

1. El jugador tiene al menos 3 razones claras para correr una run.
2. Push, Hunt y Forja ya se sienten distintos aunque compartan el mismo motor de combate.
3. El loot chase ya no es generico: hay target farm real.
4. Existen build pivots reales que cambian como se arma una build.
5. Prestige ya no es solo reset numerico; cambia la proxima run.
6. Codex/mastery/collection ya suma progreso horizontal visible.
7. Los sistemas de direccion no le ordenan la run al jugador: le muestran opciones reales.
8. El juego se puede jugar en paralelo al desarrollo sin miedo a perder progreso.
9. La UI deja clara la pregunta mas importante: "Que me conviene hacer ahora y por que?"
10. El jugador tiene razones para volver mañana, no solo razones para dejarlo abierto.

## Principios de Diseño

### 1. Cada loop necesita un premio propio

Si dos actividades dan practicamente lo mismo, una sobra.

### 2. Cada recurso necesita una identidad

- oro: progreso base y upgrades generales
- esencia: modificacion y perfeccion de items
- prestige currency: direccion de la proxima run

No agregar nuevas monedas sin una funcion exclusiva y comprensible.

### 3. Menos volumen, mas significado

Con pocos slots activos, el juego no puede vivir de tirar basura. Tiene que vivir de decisiones.

### 3.1 Menos lineas por item, mas peso por linea

El norte no es inflar items con texto. Es que cada linea importe.

- menos afijos
- mas identidad por afijo
- legendarios mas legibles
- el poder legendario tiene que sentirse como el corazon del item

### 4. El reset debe abrir caminos, no borrar ganas

Prestige tiene que sentirse como una nueva lectura del juego, no como un castigo.

### 5. El sistema que no cambia comportamiento, estorba

No mantener features "decorativas" que suenan profundas pero no cambian decisiones reales.

### 6. Complejidad minima, decision maxima

Antes de abrir tipos de dano, resistencias o matrices de defensa:

- consolidar Warrior
- consolidar Hunt / Codex / Sigilos
- consolidar una sola capa avanzada de combate

La primera capa avanzada correcta hoy es:

- multi-hit
- bleed
- fractura

No abrir todavia:

- dano elemental
- resistencias complejas
- varias capas de DoTs
- varias capas de defensas exoticas

## Roadmap por Fases

---

## Fase 1: Impacto Inmediato

### Objetivo

Pasar de "un mismo loop con mas numeros" a "varias razones concretas para jugar una run".

### Sistemas a implementar

#### 1. Taxonomia de rewards

Definir explicitamente que da cada actividad:

- Push: mejor XP y progreso general
- Hunt: powers y drops targeteables de bosses y familias
- Forja: mejores bases, mejor esencia y mejor tempo de run

#### 2. Target farm real

Cada boss importante y varias familias deben tener:

- 1 drop tematico importante
- 1 pool de stats o bases favorecidas
- 1 razon clara para farmearlos

#### 3. Primera ola de build enablers

Agregar pocas piezas, pero fuertes:

- items que conviertan una stat en otra
- items que cambien comportamiento de una skill o talento
- items que habiliten una mini-fantasia de build

La regla:

- pocos
- memorables
- targeteables
- no obligatorios

#### 4. Goals y direccion de run

No hacer un director de sesion que le diga al jugador que hacer.

Si hacer que Goals y UI de combate:

- dejen claras las opciones
- no se peleen con Hunt real desde Codex
- no compitan con Sigilos

La direccion correcta es opcion visible, no piloto automatico.

#### 5. Hunt real desde Codex

El Codex tiene que ser una pantalla de decision real:

- objetivos por descubrir
- powers que faltan
- duplicados utiles
- salto directo al tier cuando ya esta desbloqueado
- sin spoilers para lo que todavia no viste

#### 6. Primera capa avanzada de combate

Agregar una sola capa nueva de profundidad real:

- multi-hit
- bleed
- fractura

Objetivo:

- mas identidad de build
- mas lectura de combate
- mas valor por decision ofensiva

#### 7. Mejor lectura de enemigos, bosses y rewards

El jugador tiene que ver:

- que esta peleando
- por que importa
- que puede conseguir

#### 8. Save safety y calidad de vida para desarrollo/juego largo

Esto ya mejoro, pero Fase 1 cierra cuando:

- el save es confiable
- el autosave no te hace rollback relevante
- hay export/import/reset visibles en UI

### Problemas que resuelve

- todo parece el mismo loop
- falta chase dirigido
- goals poco significativos
- bosses sin motivacion suficiente
- loot con hype bajo

### Riesgos

- hacer target farm cosmetico
- meter build enablers demasiado raros o demasiado obligatorios
- que Hunt sea cosmetico y no una decision real desde Codex
- que la nueva capa de combate meta ruido sin dar identidad

### Dependencias

- loot tables controlables
- bosses/familias con data clara
- crafting estable
- save estable

### Criterio de exito

Un jugador deberia poder decir en una frase por que hace una run:

- "Voy por daño"
- "Voy por esa pieza"
- "Voy por materiales de craft"
- "Voy a sacar un prestige rapido"

---

## Fase 2: Profundidad Real

### Objetivo

Convertir el mid/late en una eleccion entre carriles, no solo una optimizacion del mismo carril.

### Sistemas a implementar

#### 1. Actividades reales, no toggles falsos

La base correcta es:

- Push como loop principal
- Hunt como actividad real desde Codex
- Forja como sesgo de tempo de run que mas adelante puede ganar entidad propia

No convertir esto en un selector vacio de modos.

#### 2. Dungeon modifiers con identidad

Los modifiers no deben ser solo +/- numeros.

Deben empujar decisiones:

- mas riesgo, mas craft value
- mas densidad, menos sustain
- mas bosses, mejor target farm

#### 3. Keystone pass de clase y specs

Arboles chicos, simetricos y con mucho mas peso por nodo.

- cada arbol visible debe tener `8 nodos exactos`
- estructura fija: `3 basicos + 3 gameplay + 2 keystones`
- el sink no debe mezclarse con el arbol visible
- Warrior base con `Iron Conversion` y `Crushing Weight`
- Berserker con `Last Breath` y `Frenzied Chain`
- Juggernaut con `Unmoving Mountain` y `Titanic Momentum`
- primera capa avanzada concreta: `multi-hit`, `sangrado` y `fractura`
- las keystones deben sentirse como eleccion de build, no como buffet libre: exclusivas por arbol

#### 4. Prestige especializado

El arbol de prestige debe dejar de ser generico.

Debe tener ramas claras para:

- push
- loot hunt
- craft
- session efficiency

#### 5. Codex Mastery Compendium completo

Expandir el trabajo ya hecho:

- kills por familia
- kills por boss
- collection log
- milestones con bonos chicos, visibles y deseables

#### 6. Compresion de items y crafting

Ir hacia menos lineas visibles y mas significado por linea.

Direccion probable:

- rare con 1 afijo
- epic con 2 afijos
- legendary con 3 afijos + poder
- el poder legendario como pieza central

#### 7. Crafting integrado al ecosistema

El crafting no debe ser una pestaña aislada.

Cada lane debe alimentar una parte del crafting:

- una da mejores bases
- otra da mejores materiales
- otra da mejores oportunidades de chase

#### 8. Segunda ola de build pivots

Una vez que el target farm exista, agregar otra capa de piezas o nodos que permitan:

- builds de bossing
- builds de speed farm
- builds de sustain/craft push

### Problemas que resuelve

- late repetitivo
- prestige poco direccional
- crafting desconectado del mundo
- mastery horizontal todavia demasiado floja

### Riesgos

- lanes falsas que terminan dando lo mismo
- prestige especializado que se vuelve obligatorio
- demasiada complejidad antes de que la UI pueda explicarla

### Dependencias

- Fase 1 resuelta
- rewards bien diferenciadas
- build enablers iniciales ya presentes
- Hunt / Codex ya funcionando de verdad
- Sigilos ya funcionando como sesgo temporal de run

### Criterio de exito

En este punto, dos jugadores con misma clase y spec deberian poder estar haciendo cosas distintas por razones validas.

---

## Fase 3: Longevidad de 6 a 12 Meses

### Objetivo

Dar razones de volver durante meses sin convertir el juego en una sopa de sistemas.

### Sistemas a implementar

#### 1. Atlas-lite / mapa de rutas

No copiar PoE.

Tiene que ser una capa de eleccion simple:

- sesgar familias
- sesgar bosses
- sesgar rewards
- construir rutas de farmeo

#### 2. Contracts / cadenas de objetivo

No como chores diarias.

Si como paquetes cortos de sesion:

- cazar X
- matar boss Y
- terminar dungeon Z con modificador
- cerrar una mejora de craft

#### 3. Collection log profundo

Expandir el Codex para que registre:

- drops unicos o destacados
- familias dominadas
- bosses completados
- milestones de cuenta

#### 4. Prestige de mediano plazo

Agregar mas decision a resets recurrentes:

- especializacion de cuenta por estilo
- mejoras de calidad de vida
- mejoras de eficiencia de lane

#### 5. Nueva clase solo si lo anterior ya esta firme

No meter otra clase para tapar huecos estructurales.

Nueva clase recien cuando:

- los loops ya esten claros
- el late este diversificado
- el loot chase ya funcione

La primera clase correcta despues de Warrior no deberia ser un "mago elemental" inflado.

La direccion sana es:

- `Mage`
- sin AoE
- sin elementos
- sin resistencias nuevas
- con `Mark`, `Flow`, `damage range` y `spell echo`

Sus dos specs correctas hoy son:

- `Sorcerer`: burst, volatilidad, opener, chain-kill
- `Arcanist`: consistencia, transfer, ramp, bossing

Si Mage entra, debe copiar la estructura buena ya definida:

- `3 basicos`
- `3 gameplay`
- `2 keystones`
- profundidad `20 / 6 / 3`

### Problemas que resuelve

- falta de largo plazo
- falta de metas de cuenta
- riesgo de agotamiento del contenido inicial

### Riesgos

- crecer en ancho sin crecer en calidad
- meter otra clase demasiado temprano
- construir un Atlas-lite complejo que nadie entienda

### Dependencias

- Fases 1 y 2 resueltas
- save y telemetria confiables
- UI de progreso horizontal madura

### Criterio de exito

El jugador deberia tener:

- una razon para jugar hoy
- una razon para volver mañana
- una razon para seguir dentro de 3 meses

## Orden de Prioridad Refinado

Este es el orden recomendado realista para un equipo chico:

1. Reward routing y Hunt real desde Codex
2. Build enablers reales
3. Sigilos y claridad de identidad de run
4. Keystone pass de Warrior / specs
5. Compresion de items y legendarios mas legibles
6. Prestige especializado
7. Codex/mastery/collection completo
8. Atlas-lite
9. Nueva clase

## Lo que no deberiamos hacer todavia

- world tiers aparte de los tiers actuales
- seis actividades nuevas de golpe
- currencies nuevas para cada sistema
- temporadas como parche de estructura
- segunda clase antes de consolidar Warrior
- abrir tipos de dano y defensas complejas antes de consolidar bleed/fractura
- systems "profundos" que la UI no puede explicar
- trade economy o pseudo-trade economy

## Trampas de Diseño Probables

### 1. Querer copiar demasiadas fantasias a la vez

El juego no puede ser al mismo tiempo:

- mini-PoE
- mini-Warframe
- mini-Runescape
- mini-Diablo 4

Tiene que elegir una dominante.

### 2. Confundir complejidad con profundidad

Mas currencies, mas tabs y mas modifiers no implican mejor juego.

### 3. Hacer target farm sin items memorables

Si no existe "quiero esa pieza", no existe target farm.

### 4. Hacer progreso horizontal invisible

Si el Codex da bonus pero el jugador no lo siente, no retiene.

### 5. Tapar la falta de contenido con resets

Prestige no puede ser la excusa para repetir lo mismo indefinidamente.

### 6. Mantener sistemas medio implementados

Una feature que no cambia decisiones reales es deuda.

## KPI de Producto Recomendados

No para obsesionarse, si para validar direccion.

### Loop corto

- tiempo a primer rare
- tiempo a primer mejora de equipo relevante
- tiempo a primer objetivo completado

### Loop medio

- tiempo a primer boss kill
- tiempo a primer build enabler
- cantidad de runs con objetivo declarado

### Loop largo

- tiempo a primer prestige valioso
- porcentaje de jugadores que hacen segundo y tercer prestige
- porcentaje de sesiones donde el jugador interactua con mas de una lane

### Hype y compartibilidad

- cantidad de loot highlights de verdad memorables por sesion larga
- cantidad de milestones de Codex/desbloqueos de build por dia
- cantidad de "best drop moments" que realmente superan lo equipado

## Definicion de Exito del MVP 2.0

El MVP 2.0 esta logrado cuando:

- el jugador no siente que todo es el mismo loop
- hay 3 razones validas para jugar una sesion
- hay target farm real
- hay al menos varias piezas build-enabler memorables
- prestige define la proxima run
- Codex/mastery ya suma progreso horizontal visible
- el late ya no es solo "subir numeros"
- la gente tiene momentos para compartir

## Vision Final

La vision no es solo "hacerlo mas grande".

La vision es hacer un juego donde:

- una build se persigue
- una pieza se recuerda
- un boss se farmea por algo concreto
- una run tiene un objetivo
- un prestige cambia la siguiente run
- una cuenta va construyendo historia propia

Si el roadmap se ejecuta bien, el resultado no deberia ser solo un idle con numeritos.

Deberia ser un ARPG idle con personalidad, con chase, con identidad de build y con suficiente profundidad como para que los jugadores hablen entre ellos de lo que estan buscando, lo que estan cerrando y lo que acaban de sacar.
