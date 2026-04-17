# Propuesta de Balance

## Alcance y metodo

Este documento mezcla tres fuentes:

1. Lectura directa del runtime vivo de combate, talentos, prestige, affixes, bosses y Abismo.
2. Auditoria numerica rapida de las 16 combinaciones endgame reales de keystones:
   - `2` general keystones por clase base
   - `2` keystones por spec
   - `4` specs totales
   - `4 x 2 x 2 = 16` builds core endgame
3. Lectura de deuda sistemica que hoy distorsiona el balance real:
   - `buildIdentity` todavia mira varios talentos legacy que no son la fantasy principal del tree actual
   - `balanceBot` / `balanceBatchRunner` siguen hardcodeados a Warrior y no sirven como oracle global
   - el juego soporta `UNLOCK_TALENT` legacy ademas del sistema de `UPGRADE_TALENT_NODE`

Conclusion importante:

- Este analisis si esta apoyado en formulas reales.
- No esta apoyado en una simulacion batch confiable para todas las clases, porque hoy esa simulacion todavia no existe bien para Mage.
- Entonces tomo como fuente dura el runtime, y como fuente secundaria una radiografia numerica de paquetes de stats sin gear/prestige para comparar identidades intrinsecas.

## Foto actual del juego que importa para balance

- Clases live: `2`
  - `Warrior`
  - `Mage`
- Specs live: `4`
  - `Berserker`
  - `Juggernaut`
  - `Sorcerer`
  - `Arcanist`
- Talent trees live: `6`
  - `warrior_general`
  - `berserker`
  - `juggernaut`
  - `mage_general`
  - `sorcerer`
  - `arcanist`
- Layout por tree: `8` nodos authored por tree antes del sink
- Prestige branches live: `7`
  - `war`
  - `bulwark`
  - `fortune`
  - `sorcery`
  - `dominion`
  - `forge`
  - `abismo`
- Tiers base: `25`
- Abismo: activo desde `T26+`
- Bosses live: `12`
- Mutadores de Abismo: `5`
- Affixes base authored hoy: `55`
  - `25` prefixes
  - `30` suffixes
- Affixes de Abismo: `8`
- Rarity blueprint actual:
  - `common`: `0` affixes
  - `magic`: `1`
  - `rare`: `2`
  - `epic`: `2`
  - `legendary`: `3`

## Tesis macro del balance actual

1. Warrior tiene la curva mas robusta y menos punitiva.
   Arranca con mejor base (`damage 14 / defense 4 / HP 120`) y casi cualquier desviacion suya sigue siendo jugable.

2. Mage tiene fantasias mejores de bossing y setup, pero una curva mucho mas fragil.
   Arranca con base mucho peor (`damage 11 / defense 1 / HP 85`) y depende mas de llegar a nodos especificos para sentirse "vivo".

3. Berserker y Sorcerer son las fantasias mas fuertes para early-mid si lo que queres es velocidad y highlight.

4. Juggernaut y Arcanist son las fantasias mas fuertes para late, bossing y Abismo si el jugador acepta una entrada mas lenta.

5. Hoy hay combinaciones que son build de verdad, y combinaciones que son casi trampas de sistema.

6. El juego ya tiene buenos counters por boss, pero en aggregate esta un poco sobrecargado contra:
   - crit burst
   - multi-hit
   - mark-centric Mage

7. El nuevo pool de affixes ya abrio mas espacio, pero la ecologia defensiva/ofensiva de Warrior sigue siendo mucho mas rica y facil de ensamblar que la de Mage.

8. La rejugabilidad alta ya existe a nivel estructural:
   - seed de bosses
   - seed de trash
   - mutador por ciclo
   - bosses con mecanicas nuevas
   - prestige con 7 ramas
   Lo que falta es que cada build tenga una promesa mas nitida por fase y por matchup.

## Radiografia numerica de las 16 builds core

Lectura:

- Snapshot sin gear ni prestige, solo paquete intrinseco de clase/spec/tree a level alto.
- No hay que leer estos numeros como "tier list final".
- Si sirven para detectar huecos, overlaps y combinaciones trampa.

### Warrior / Berserker

| Build | Damage | Defense | HP | Crit | Multi-hit | Bleed | Fracture | Opening |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Iron Conversion + Last Breath | 64 | 5 | 264 | 24.5% | 18% | 15% | 0% | 1.24x |
| Iron Conversion + Frenzied Chain | 64 | 5 | 264 | 24.5% | 34% | 15% | 19% | 1.24x |
| Crushing Weight + Last Breath | 62 | 5 | 264 | 24.5% | 0% | 15% | 0% | 2.418x |
| Crushing Weight + Frenzied Chain | 62 | 5 | 264 | 24.5% | 0% | 15% | 19% | 2.418x |

Lectura inmediata:

- Berserker tiene el mejor paquete de ofensiva base entre las builds Warrior.
- `Iron Conversion + Frenzied Chain` es la version mas sana y completa del spec hoy.
- `Crushing Weight + Frenzied Chain` ya nace con una contradiccion: gastas un keystone entero en multi-hit/fractura, pero `Crushing Weight` te apaga el combo-hit.

### Warrior / Juggernaut

| Build | Damage | Defense | HP | Crit | Guard | Boss mech mit | Opening |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Iron Conversion + Unmoving Mountain | 59 | 53 | 421 | 18.5% | 26.8% | 10.7% | 1.24x |
| Iron Conversion + Titanic Momentum | 51 | 34 | 421 | 18.5% | 18.6% | 5.4% | 1.24x |
| Crushing Weight + Unmoving Mountain | 40 | 53 | 421 | 18.5% | 26.8% | 10.7% | 2.418x |
| Crushing Weight + Titanic Momentum | 39 | 34 | 421 | 18.5% | 18.6% | 5.4% | 2.418x |

Lectura inmediata:

- `Iron Conversion + Unmoving Mountain` es claramente la build mas redonda del kit Juggernaut.
- `Crushing Weight` sobre Juggernaut hoy se ve casi como combo trampa:
  - perdes dano base fuerte
  - no ganas multi-hit
  - el premio es solo un opener mas alto
  - para Abismo/bossing largo eso paga poco
- `Titanic Momentum` no esta roto, pero hoy se siente mas como version mas debil de `Unmoving Mountain` que como alternativa con identidad propia.

### Mage / Sorcerer

| Build | Damage | Defense | HP | Crit | Multi-hit | Mark | Mark effect | Flow | Fresh target |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Overchannel + Cataclysm | 55 | 3 | 185 | 24.5% | 14% | 32% | 8% | 2.08x | 1.515x |
| Overchannel + Volatile Casting | 55 | 3 | 185 | 24.5% | 14% | 32% | 8% | 1.72x | 1.275x |
| Perfect Cast + Cataclysm | 55 | 3 | 185 | 24.5% | 14%* | 32% | 8% | 2.08x | 1.515x |
| Perfect Cast + Volatile Casting | 55 | 3 | 185 | 24.5% | 14%* | 32% | 8% | 1.72x | 1.275x |

`*` `Perfect Cast` deja `disableComboHits = true`, asi que el valor de multi-hit queda en la hoja pero no se expresa como cadena real.

Lectura inmediata:

- Sorcerer tiene la mejor fantasia de opener/clear del juego.
- `Cataclysm` gana claridad enseguida: mejor Flow y mejor fresh target.
- `Volatile Casting` tiene techo y highlight, pero su promesa es mucho menos estable y mas frustrable.
- `Perfect Cast` no cambia mucho la hoja de stats; cambia mas la textura del hit que el sheet. Eso esta bien, pero exige mejor surfacing en UI para sentirse "distinto".

### Mage / Arcanist

| Build | Damage | Defense | HP | Crit | Multi-hit | Mark | Mark effect | Flow |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Overchannel + Time Loop | 45 | 3 | 203 | 34% | 14% | 43.6% | 35.1% | 1.32x |
| Overchannel + Absolute Control | 45 | 3 | 203 | 34% | 14% | 43.6% | 35.1% | 1.32x |
| Perfect Cast + Time Loop | 45 | 3 | 203 | 34% | 14%* | 43.6% | 35.1% | 1.32x |
| Perfect Cast + Absolute Control | 45 | 3 | 203 | 34% | 14%* | 43.6% | 35.1% | 1.32x |

Lectura inmediata:

- Arcanist tiene menos dano sheet que Sorcerer, pero mucha mejor calidad de setup.
- La diferencia entre `Time Loop` y `Absolute Control` casi no se ve en la planilla; vive en runtime.
- Eso significa dos cosas:
  - la build real puede estar bien
  - la percepcion de poder puede quedar mal si el juego no la explica mejor

## Matriz de builds y lectura por fase

## Warrior General

### Iron Conversion

- Rol: convierte aguante en dano estable.
- Early: muy bueno porque convierte toda inversion defensiva en progreso ofensivo sin pedir gear perfecto.
- Mid: excelente puente para cualquier Warrior que no quiera depender de critico puro.
- Late: sigue fuerte porque armor -> damage es una escalera muy confiable y ademas sinergiza con Juggernaut.
- Riesgo: en Berserker puede quedar demasiado "seguro" y borrar parte del riesgo/fantasy del spec.
- Diagnostico: es el general keystone mas sano y universal del Warrior hoy.

### Crushing Weight

- Rol: opener brutal, sin cadena.
- Early: divertido en fantasias de one-shot y muy legible.
- Mid: bueno si el contenido te deja borrar objetivos rapido.
- Late: cae si el combate exige dps sostenido, stacks o counters de phase reset / shield / crit immunity.
- Riesgo: genera varias combinaciones trampas porque choca de frente con multi-hit, una de las mejores capas del juego.
- Diagnostico: hoy es mas niche que alternativa real en varios cruces.

## Berserker

### Iron Conversion + Last Breath

- Rol: bruiser ofensivo con pico low-life.
- Early: muy fuerte cuando ya desbloqueaste leech y crit.
- Mid: buen all-rounder para jugadores que quieren riesgo pero no full glass cannon.
- Late: correcto, pero empieza a sufrir si la run tiene demasiado veneno, reflect o boss mechanics largas.
- Fuerte contra:
  - Orc Warlord
  - Storm Tyrant si logra snowballear antes del segundo golpe grande
  - trash rapido
- Flojo contra:
  - Blood Matriarch
  - Dusk Reaver
  - Void Sovereign
- Diagnostico: build sana, pero no la mas explosiva ni la mas especializada del spec.

### Iron Conversion + Frenzied Chain

- Rol: la fantasia mas completa del Berserker actual.
- Early: muy fuerte en cuanto aparecen multi-hit + leech.
- Mid: probablemente la mejor build de push rapido de Warrior.
- Late: sigue compitiendo por fracture, bleed y tempo, aunque sufre counters duros de multi-hit y reflect.
- Fuerte contra:
  - Iron Sentinel
  - Grave Regent
  - trash con mucha vida
- Flojo contra:
  - Ash Colossus
  - bosses con thorns / reflect
  - bosses con poison largo si no mata antes
- Diagnostico: hoy es la referencia ofensiva Warrior. Si hay que tener "rey de early-mid", este deberia ser uno.

### Crushing Weight + Last Breath

- Rol: casino brutal de opener + low-life.
- Early: muy entretenido porque se siente inmediatamente.
- Mid: highlight build real.
- Late: se vuelve inconsistente por phase reset, absorb crit y escudos.
- Fuerte contra:
  - trash
  - bosses sin reset ni anti-crit
- Flojo contra:
  - Void Titan
  - Chronolith
  - Void Sovereign
- Diagnostico: no esta roto; esta bien como build de highlight. No deberia ser la build mas estable del juego.

### Crushing Weight + Frenzied Chain

- Rol: hoy casi no tiene identidad limpia.
- Early: parece prometedor por fracture, pero ya arranca desperdiciando parte de su paquete.
- Mid: jugable, pero se siente peor de lo que cuesta.
- Late: build trampa.
- Fuerte contra:
  - muy pocos escenarios especificos
- Flojo contra:
  - casi todo contenido largo
  - cualquier boss donde fracture por si sola no compense perder cadenas
- Diagnostico: esta combinacion hoy no es "niche"; es mala.
- Recomendacion:
  - o la convertis en sinergia real
  - o asumis que es una opcion trampa del sistema

## Juggernaut

### Iron Conversion + Unmoving Mountain

- Rol: empuje puro de late / Abismo / boss.
- Early: lenta, pero ya se siente tanque.
- Mid: muy consistente.
- Late: probablemente la mejor build de supervivencia del juego hoy.
- Fuerte contra:
  - Void Sovereign
  - Chronolith
  - bosses con hits pesados o mecanicas abisales
- Flojo contra:
  - Dusk Reaver
  - Soul Weaver
  - bosses que ignoran o erosionan defensa demasiado seguido
- Diagnostico: esta build hoy cumple perfecto su fantasy. Es la referencia de late Warrior.

### Iron Conversion + Titanic Momentum

- Rol: ramp bruiser, menos muro, mas tempo.
- Early: peor que Unmoving.
- Mid: si logra sostener ventaja, paga.
- Late: hoy queda demasiado cerca de "Unmoving pero mas flojo".
- Fuerte contra:
  - peleas largas no explosivas
  - bosses sin burst brutal inicial
- Flojo contra:
  - picos fuertes
  - contenido donde llegar a la rampa cuesta demasiado
- Diagnostico: necesita mas identidad y mas payoff ofensivo temprano.

### Crushing Weight + Unmoving Mountain

- Rol: primer golpe defensivo-pesado.
- Early: la fantasia existe.
- Mid: el problema ya se nota.
- Late: el costo de oportunidad es enorme.
- Fuerte contra:
  - objetivos blandos sin reset
- Flojo contra:
  - casi todo bossing serio
  - Abismo profundo
- Diagnostico: build trampa o muy cerca de serlo.
- Dato duro:
  - con la misma muralla, pega `40` contra `59` de `Iron Conversion + Unmoving`
  - o sea, pierde demasiado para el premio que recibe

### Crushing Weight + Titanic Momentum

- Rol: hoy no encuentra carril propio.
- Early: puede ser divertida por fantasia.
- Mid: mediocre.
- Late: peor de las 4 Juggernaut.
- Diagnostico: esta es la combinacion mas debil de las 16 core.

## Mage General

### Overchannel

- Rol: caster de ecos agresivos.
- Early: se siente mas rapido y mas vivo.
- Mid: gran motor para Sorcerer y aceptable para Arcanist si queres mas clear.
- Late: bueno mientras el contenido no castigue demasiado multi-hit / reflect / thorns.
- Riesgo: si la ecologia de bosses tiene demasiado anti-multi-hit, pierde mucha fantasia al mismo tiempo para Sorcerer y parte de Mage general.
- Diagnostico: buen keystone; tiene counters legitimos, pero hoy esos counters aparecen bastante seguido.

### Perfect Cast

- Rol: sniper consistente.
- Early: menos flashy.
- Mid: muy sano para bossing y control.
- Late: excelente base para builds que odian perder dps por variance.
- Riesgo: como el impacto es mas de runtime que de hoja de stats, puede sentirse "no hizo nada" aunque si haga.
- Diagnostico: bueno a nivel sistema, flojo a nivel percepcion.

## Sorcerer

### Overchannel + Cataclysm

- Rol: mejor chain-clear Mage actual.
- Early: de las mejores sensaciones del juego en cuanto onlinea.
- Mid: muy fuerte.
- Late: cae si la seed te pone demasiado reset, mirror o crit denial.
- Fuerte contra:
  - Orc Warlord
  - Storm Tyrant
  - trash de run rapida
- Flojo contra:
  - Hex Archon
  - Chronolith
  - Void Sovereign
- Diagnostico: si queres una build que haga sentir "una run mas", esta tiene que vivir arriba del promedio en early-mid.

### Overchannel + Volatile Casting

- Rol: casino cannon.
- Early: divertida.
- Mid: highlight machine.
- Late: la mas frustable de Sorcerer.
- Fuerte contra:
  - contenido que premia snowball rapido
- Flojo contra:
  - contenido de control
  - reflect
  - phase reset
- Diagnostico: no necesita mas techo; necesita mejor piso.

### Perfect Cast + Cataclysm

- Rol: opener limpio, preciso y muy bossable si no hay reset.
- Early: menos speed-farm que Overchannel.
- Mid: excelente sobre bosses de vida media y contenido con menos ruido.
- Late: muy dependiente de no comerse matchups anti-opener.
- Fuerte contra:
  - Soul Weaver si no llegas a sobremarkear
  - bosses sin absorb/phase reset
- Flojo contra:
  - Chronolith
  - Void Titan
  - Void Sovereign
- Diagnostico: build sana y distinguible. No la tocaria mucho.

### Perfect Cast + Volatile Casting

- Rol: sniper volatil.
- Early: divertida para jugadores que buscan highlight.
- Mid: high variance real.
- Late: puede sentirse injusta mas que desafiante.
- Diagnostico: hoy es la build que mas depende de UI/feedback para que la variance parezca "intensa" y no "caprichosa".

## Arcanist

### Overchannel + Time Loop

- Rol: hibrido de setup que no quiere resetear al cambiar de objetivo.
- Early: lento para arrancar.
- Mid: muy bueno cuando la run ya no vive solo de borrar trash.
- Late: muy fuerte para contenido largo y ordenado.
- Fuerte contra:
  - Grave Regent
  - Chronolith
  - bosses sin mark punishment extremo
- Flojo contra:
  - trash muy rapido
  - Soul Weaver
- Diagnostico: probablemente la mejor build de "consistencia con carryover" del juego.

### Overchannel + Absolute Control

- Rol: castigo brutal sobre target marcado.
- Early: mas dura de levantar.
- Mid: excelente si el combate dura lo suficiente para que marcar valga.
- Late: top tier de bossing cuando el boss no te castiga Marca.
- Fuerte contra:
  - bosses largos sin mark reversal
  - contenido donde el primer target no importa tanto
- Flojo contra:
  - Soul Weaver
  - bosses muy rapidos donde el setup llega tarde
- Diagnostico: build de techo alto y suelo bajo. Bien para rejugabilidad, pero necesita que el juego explique mejor cuando esta "on".

### Perfect Cast + Time Loop

- Rol: precision sostenida con carryover.
- Early: lenta.
- Mid: muy prolija.
- Late: de las builds mas serias para boss progression.
- Diagnostico: esta build deberia ser una de las reinas de late sin tocar demasiado el early.

### Perfect Cast + Absolute Control

- Rol: boss killer tecnico.
- Early: probablemente la build mas lenta de las 16.
- Mid: cuando onlinea, ordena mucho el contenido.
- Late: muy poderosa, pero vulnerable a counters ultra explicitos.
- Diagnostico: esta bien que exista una build tan tardia si paga con ceiling y prestigio.

## Matchups de bosses: donde hoy esta bien y donde se pasa de counter

### Orc Warlord

- Counter suave a glass si el double strike engancha.
- Favorece tempo, opener y sustain ofensivo.
- Bueno para Berserker y Sorcerer.

### Iron Sentinel

- `shield_every_n + armor_shred`
- Muy buen boss para testear dps sostenido y timing.
- Castiga opener puro y castiga tank puro al mismo tiempo.
- Buen counter "neutral", no me molesta.

### Blood Matriarch

- `lifesteal_reflect + enrage`
- Buen counter a Berserker, pero si se junta con mas sustain tax en la misma seed puede sentirse demasiado anti-leech.

### Void Titan

- `crit_immunity + absorb_first_crit`
- Counter muy duro a Sorcerer crit, Warrior opener y parte de Berserker.
- Como pieza unica esta bien.
- En conjunto con otros anti-crit del roster, la saturacion ya se empieza a notar.

### Ash Colossus

- `absorb_first_crit + thorns_aura`
- Countera multi-hit, opener y crit al mismo tiempo.
- Es muy buena pieza de variedad, pero ya se parece mucho a "doble impuesto" para Berserker/Sorcerer.

### Storm Tyrant

- `double_strike + crit_immunity`
- Buen boss agresivo; hace de semaforo para glass.

### Grave Regent

- `regen_passive + shield_every_n`
- Muy buen boss para distinguir dps sostenido, fracture y control de pelea larga.
- Excelente para que Arcanist y ciertos Warrior tecnicos tengan un espacio.

### Dusk Reaver

- `armor_shred + poison_stacks`
- Counter fuerte a Juggernaut y a Last Breath.
- Funciona.
- Si ademas le cae mutador ofensivo o depth mechanic extra, puede pasar facilmente a "te deleteo por sistema".

### Soul Weaver

- `mark_reversal + armor_shred`
- Es el check mas duro de Arcanist.
- Como concepto me gusta.
- Como tuning, puede estar un poco pasado porque le pega al mismo tiempo a control Mage y a defense Warrior.

### Hex Archon

- `spell_mirror + crit_immunity`
- Hoy es probablemente el boss mas anti-Mage del roster.
- Me gusta que exista uno asi.
- No me gusta que ademas, en Abismo, todavia pueda sumar otras capas de control/reflect.

### Void Sovereign

- `enrage_low_hp + shield_every_n + crit_immunity`
- Muy buen examen final para builds de bossing serio.
- Favorece Juggernaut y Arcanist.
- Castiga mucho Sorcerer y Berserker de opener.
- Bien para capstone.

### Chronolith

- `phase_reset + absorb_first_crit`
- Counter limpido a opener puro.
- Excelente jefe final alternativo.
- Tambien favorece builds ordenadas y no casino.

## Lo que hoy esta claramente bien

1. La fantasia de las 4 specs ya existe de verdad.
2. Juggernaut late ya no se cae como muralla plana.
3. Sorcerer y Berserker tienen identidades de tempo/highlight reales.
4. Arcanist ya tiene una promesa nitida de bossing y setup.
5. Los bosses seeded y las mecanicas nuevas ya generan decisiones de build reales.
6. El nuevo Abismo ya no es solo "mas numeros".
7. Rare como item-proyecto ya encaja muy bien con Juggernaut y Arcanist.

## Falencias sistemicas reales

### 1. Hay combinaciones trampa

Las mas claras hoy:

- `Warrior / Juggernaut / Crushing Weight / Unmoving Mountain`
- `Warrior / Juggernaut / Crushing Weight / Titanic Momentum`
- `Warrior / Berserker / Crushing Weight / Frenzied Chain`

No son solo niche. Hoy rinden muy por debajo del costo de oportunidad.

### 2. Mage sigue pagando mas "impuesto de ensamblado"

Warrior puede entrar al juego con:

- mejor base
- mejor supervivencia
- mas capas defensivas armables por affix
- mejor tolerancia a gear mediocre

Mage necesita llegar a:

- marca
- flow
- eco o consistencia
- control/volatilidad segun spec

Antes de eso, la clase se siente mas pobre.

### 3. El roster de bosses sobrecarga ciertos counters

Ejes sobrecargados hoy:

- anti-crit
- anti-multi-hit
- anti-mark Mage

No digo que cada boss individual este mal.
Digo que el aggregate del roster ya arma una red de castigos muy concentrada sobre las mismas fantasies.

### 4. Arcanist y Perfect Cast tienen poder oculto

Dos problemas:

- parte importante de su poder no se ve en hoja
- parte importante de su payoff llega tarde

Eso hace que la build pueda estar balanceada matematicamente y sentirse floja igual.

### 5. `buildIdentity` y parte del tooling todavia huelen a talento legacy

Ejemplos:

- `buildIdentity` sigue mirando ids como `warrior_precision_drill`, `berserker_butcher_stride`, `juggernaut_siege_wall`, `juggernaut_titan_skin`
- `balanceBot` solo sabe jugar Warrior

Esto hoy distorsiona:

- lectura de telemetry
- autodiagnostico de builds
- cualquier batch de balance automatizado

### 6. La sink general de Mage parece mas floja que la de Warrior

Hoy los sinks dicen mucho del late:

- `warrior_iron_mastery`: hasta `+42% defense`
- `berserker_blood_mastery`: hasta `+48% damage`
- `juggernaut_eternal_bastion`: hasta `+55% defense`
- `mage_arcane_mastery`: hasta `+22% damage`

Sorcerer y Arcanist compensan por sus sinks propios y por escalas no lineales.
Igual, la sink general de Mage queda bastante menos imponente como promesa de late.

## Direccion recomendada de meta

Objetivo deseado:

- `Berserker`: mejor spec de early-mid y farming agresivo
- `Sorcerer`: mejor spec de clear, opener y run rapida
- `Juggernaut`: mejor spec de late push, Abismo y supervivencia tecnica
- `Arcanist`: mejor spec de bossing, control y setup deterministico

Objetivo por keystone general:

- `Iron Conversion`: version estable y utilitaria de la clase
- `Crushing Weight`: version de opener / martillo / riesgo tactico
- `Overchannel`: version de cadenas, ecos y snowball
- `Perfect Cast`: version consistente, ordenada y boss-friendly

Objetivo por bossing:

- no hacer que un boss "anule una clase"
- si hacer que un boss "favorezca ciertas families"

Objetivo por Abismo:

- que las builds rapidas sigan llegando
- que las builds lentas paguen mejor cuando llegan

## Propuestas concretas de tuning

## P0 - arreglos de identidad

### A. Salvar las combinaciones trampa de Warrior

#### `Crushing Weight + Frenzied Chain`

Hoy:

- `Crushing Weight` apaga combo hits
- `Frenzied Chain` empuja multi-hit

Propuesta:

- si `Crushing Weight` esta activo, convertir la parte de `multi-hit` de `Frenzied Chain` en otra cosa
- ejemplo:
  - `+fracture chance`
  - `primer golpe aplica 2 stacks de Fracture`
  - `primer golpe gana damage vs fractured`

Resultado:

- deja de ser build trampa
- se vuelve "opener que parte armadura"

#### `Crushing Weight + Juggernaut`

Hoy:

- el premio de opener no compensa perder la sinergia natural de `Iron Conversion`

Propuesta:

- si `Crushing Weight` corre en Juggernaut, agregar un hook defensivo-ofensivo explicito
- ejemplo:
  - opener gana porcentaje de `defense`
  - opener ignora una parte de `shield_every_n`
  - opener gana dano extra vs bosses

Resultado:

- se vuelve "ariete blindado", no "Juggernaut pero peor"

### B. Reforzar identidad de `Titanic Momentum`

Hoy:

- existe, pero vive demasiado cerca de `Unmoving Mountain`

Propuesta:

- stackea mas rapido
- gana mas dano real por stack
- conserva menos mitigacion que `Unmoving`

Objetivo:

- `Unmoving Mountain` = muro de Abismo
- `Titanic Momentum` = bruiser que escala con pelea larga

## P1 - corregir la asimetria de Mage

### A. Mejorar la entrada de Mage al juego

No haria a Mage mas tanque de base.
Si haria una de estas dos cosas:

1. Buff corto al tramo basico de Mage general
2. O mejor compensacion perceptual/real al llegar a `Arcane Mark` y `Arcane Echo`

Mi preferencia:

- no tocar base stats
- tocar pacing de encendido

### B. Mejorar sink general de Mage

Opciones sanas:

1. `Maestria Arcana` pasa de `+22% damage` a algo tipo `+30% damage`
2. O queda en `+22% damage` pero suma un segundo efecto chico:
   - `+mark effect`
   - `+crit damage`
   - `+flow`

Mi preferencia:

- dual effect pequeno

Porque:

- hace que la sink se sienta mas "arcana"
- no la vuelve solo copia barata del sink ofensivo Warrior

### C. Darle mejor piso a `Volatile Casting`

No le subiria techo.
Le subiria piso.

Opciones:

- reducir el castigo del low roll al siguiente hit
- o meter un "mini pity" despues de 2 low rolls consecutivos

Objetivo:

- que siga siendo casino
- que no parezca castigo arbitrario

## P2 - ecologia de bosses mas sana

### A. Bajar saturacion de hard counters

Regla recomendada fuera de slot final:

- no apilar dos counters duros del mismo eje en un mismo boss seeded salvo casos muy intencionales

Ejemplos:

- evitar `crit_immunity + absorb_first_crit` mas depth control extra fuera de final
- evitar `spell_mirror + mark_reversal` fuera de boss muy especial
- evitar `thorns_aura + poison_stacks` como combo frecuente en slots medios

### B. Mantener counters, no invalidaciones

Buen counter:

- "esta build la pasa peor aca"

Mala invalidacion:

- "esta build deja de jugar"

Hoy los casos mas cerca de invalidacion son:

- Mage vs `Hex Archon`
- Arcanist vs `Soul Weaver`
- opener crit vs `Chronolith` y `Void Titan` si ademas la seed suma mas castigo

## P3 - rejugabilidad infinita real

Para que la rejugabilidad no sea solo "otra seed", cada family deberia tener una promesa clara:

### Berserker

- mejor early-mid
- mejor snowball
- mas fragil a reflect, poison y thorns

### Juggernaut

- peor arranque
- mejor late
- mejor Abismo
- mejor anti-boss

### Sorcerer

- mejor clear
- mejor opener
- highlight build
- peor contra reset / reflect / crit denial

### Arcanist

- peor early
- mejor control
- mejor bossing
- mejor scaling con run larga

Si esto queda limpio, el jugador ya tiene motivos reales para repetir:

- "esta run quiero farmear rapido"
- "esta run quiero empujar Abismo"
- "esta run quiero cazar tal boss"
- "esta run quiero proyecto rare"
- "esta run quiero control tecnico"

## Priorizacion concreta

### Prioridad 1

- salvar combinaciones trampa de `Crushing Weight`
- darle mas identidad a `Titanic Momentum`
- mejorar el piso de `Volatile Casting`

### Prioridad 2

- mejorar sink general de Mage
- bajar un poco la saturacion de hard counters anti-Mage / anti-crit en roster profundo

### Prioridad 3

- mejorar surfacing de builds cuyo poder vive en runtime:
  - `Perfect Cast`
  - `Arcanist Time Loop`
  - `Arcanist Absolute Control`

### Prioridad 4

- reemplazar / rehacer `balanceBot` para que juegue tambien Mage
- limpiar `buildIdentity` de referencias legacy o separar "arquetipos actuales" de "legacy labels"

## Conclusiones duras

1. El juego ya tiene variedad suficiente para una meta entretenida.
2. La variedad hoy no esta del todo traducida en 16 builds igualmente honestas.
3. Las mayores fallas no estan en "falta contenido", sino en:
   - algunas sinergias rotas entre keystones
   - Mage pagando mucho armado
   - boss ecology sobrecargando ciertos counters
4. El core que hoy mejor esta parado para late es:
   - `Juggernaut / Iron Conversion / Unmoving Mountain`
   - `Arcanist / Perfect Cast o Overchannel / Time Loop o Absolute Control`
5. El core que hoy mejor esta parado para early-mid y sensacion de run rapida es:
   - `Berserker / Iron Conversion / Frenzied Chain`
   - `Sorcerer / Overchannel / Cataclysm`
6. El peor agujero claro hoy es `Crushing Weight` cuando no tiene una sinergia diseñada alrededor.

## Nota de fix aplicado

Ademas de este analisis, ya quedo corregido el comportamiento de `Reforge`:

- ahora ofrece `3` opciones totales
- `1` actual + `2` nuevas
- no `4`

