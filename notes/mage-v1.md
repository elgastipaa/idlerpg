# Mage V1

## North Star

El Mage no limpia por AoE.

Limpia porque:

- prepara al enemigo
- arrastra ventaja al siguiente objetivo
- puede jugar a burst volatil o a consistencia
- usa multi-hit como `spell echo`, no como velocidad de ataque disfrazada

La sensacion objetivo es:

- "prepare ese objetivo"
- "mate con setup y el siguiente ya empezo mal"
- "mi proximo hit importa"

No queremos:

- AoE real
- varios elementos
- resistencias elementales
- mana/ward/escudos nuevos
- crowd control clasico tipo freeze/stun

En este juego, `control` significa:

- controlar el estado del objetivo
- controlar cuanto setup conservas
- controlar cuanto valor arrastras entre enemigos

## Encaje con el juego actual

Mage V1 tiene que entrar en el loop actual sin abrir otro subjuego.

Tiene que convivir con:

- combate por ticks
- single-target
- 2 slots de gear
- Hunt desde Codex
- Sigilos
- prestigio rapido
- crafting orientado a cerrar piezas de run

Por eso la clase se apoya en 4 sistemas chicos y claros:

1. `Mark`
2. `Flow`
3. `Damage Range`
4. `Spell Echo`

## Sistemas nuevos

### 1. Arcane Mark

`Mark` es el sistema de setup base del Mage.

- se aplica al pegar
- acumula stacks
- tiene duracion corta
- algunos talentos lo transfieren o lo consumen

V1 recomendado:

- `maxStacks = 5`
- `duration = 5 ticks`
- `cada stack = +4% dano recibido`

Regla importante:

- `Mark` no reemplaza a `Fractura`
- `Fractura` baja defensa efectiva
- `Mark` aumenta payoff ofensivo del Mage

O sea:

- `Fractura` = romper armadura
- `Mark` = preparar el objetivo

### 2. Arcane Flow

`Flow` es el sistema que conecta una kill con el siguiente enemigo.

No es AoE.

Es una ventaja de transicion:

- al matar, guardas `Flow`
- tu primer hit al siguiente enemigo consume o aprovecha ese `Flow`

V1 recomendado:

- `Flow` base: `+12% dano` al primer hit del siguiente enemigo
- algunos nodos/powers:
  - extienden duracion
  - transfieren `Mark`
  - convierten `Flow` en burst

### 3. Damage Range

El Mage necesita un eje real entre volatilidad y consistencia.

V1 recomendado:

- el Mage usa un rango de dano base por hit
- ejemplo base: `90% - 110%`

Sorcerer empuja:

- mas techo
- menos piso

Arcanist empuja:

- mas consistencia
- menos varianza

`Perfect Cast` tiene sentido solo si este sistema existe.

### 4. Spell Echo

`Multi-hit` del Mage no deberia sentirse igual que el del Warrior.

Para Mage:

- los hits extra son `echoes`
- pegan menos
- pero aplican on-hit
- por eso sirven para:
  - stackear `Mark`
  - empujar `Flow`
  - construir ramp

Regla importante:

- no hacer que los echoes peguen full damage
- si no, el Mage se vuelve solo "mas hits = siempre mejor"

V1 recomendado:

- echo base: `55%` del hit principal
- `Arcane Echo` y `Overchannel` modifican ese valor

## Identidad de clase

### Mage Base

La clase base define:

- dano magico directo
- precision/setup
- control del estado del objetivo
- spell echo

No define:

- DoTs complejos
- invocaciones
- AoE
- elementos

## Arboles

La estructura debe copiar el formato bueno del Warrior:

- `3 basicos`
- `3 gameplay`
- `2 keystones`

Con la misma profundidad:

- basicos: `20 niveles`
- gameplay: `6 niveles`
- keystones: `3 niveles`

Y el mismo gating:

- tramo 2 requiere inversion fuerte en tramo 1
- tramo 3 requiere inversion fuerte total en el arbol

---

## Mage Base Tree

### Basicos

1. `Arcane Power`
- aumenta `spell damage`

2. `Focus`
- aumenta `crit chance`

3. `Channeling`
- aumenta `multi-hit`

### Gameplay

4. `Arcane Echo`
- los echoes pegan menos
- pero aplican on-hit
- sube el valor de multi-hit para builds de setup

5. `Arcane Mark`
- pegar aplica `Mark`
- subirlo mejora chance, stacks o valor por stack

6. `Arcane Flow`
- matar prepara el siguiente objetivo
- subirlo mejora el bonus o la duracion

### Keystones

7. `Overchannel`
- los echoes pegan mas fuerte
- pero cada hit extra reduce la eficiencia total del cast

Fantasia:

- build agresiva de cadenas y on-hit

8. `Perfect Cast`
- desactiva multi-hit
- dano mucho mas estable y cerca del maximo
- `Mark` vale mas por hit

Fantasia:

- caster consistente, preciso, sin RNG molesto

---

## Sorcerer

### Fantasia

- burst
- opener
- chain-kill
- volatilidad

Sorcerer no es "mago elemental".
Es el caster que vive de:

- pegar muy fuerte al objetivo correcto
- encadenar kills
- convertir setup en payoff

### Basicos

1. `Spell Power`
- mas dano base

2. `Volatility`
- mas `crit damage`
- o mas amplitud del rango de dano

3. `Surge`
- mas dano a objetivo fresco

### Gameplay

4. `Chain Burst`
- matar carga el siguiente hit
- mejor opener entre enemigos

5. `Unstable Power`
- sube el techo del dano
- baja el piso

6. `Overload`
- hits altos o criticos agregan `Mark`
- o hacen que `Mark` potencie mas el siguiente hit

### Keystones

7. `Cataclysm`
- primer hit despues de una kill pega muchisimo mas
- menor dano sostenido en combate largo

8. `Volatile Casting`
- un hit alto o un critico ceban el siguiente hit
- un hit bajo o no critico baja el siguiente

### Lo que resuelve

- build de highlights
- build de clean speed sin AoE
- build de "mi proximo hit importa"

### Debilidad sana

- bossing largo peor que Arcanist

---

## Arcanist

### Fantasia

- consistencia
- control del estado
- ramp
- bossing
- transferencias limpias

Arcanist no gana por explosion.
Gana porque nunca empieza del todo desde cero.

### Basicos

1. `Precision`
- mas crit chance o dano estable

2. `Efficiency`
- mas dano sostenido

3. `Control`
- mas duracion de `Mark` y `Flow`

### Gameplay

4. `Mark Transfer`
- al matar, parte del `Mark` pasa al siguiente enemigo

5. `Temporal Flow`
- cuanto mas tiempo golpeas al mismo target, mas pegas

6. `Spell Memory`
- hits repetidos fortalecen `Mark`, `Flow` o ambos

### Keystones

7. `Time Loop`
- parte de `Mark` consumido o perdido vuelve en version reducida
- extiende el valor del setup

8. `Absolute Control`
- enemigos marcados reciben mucho mas dano
- enemigos sin marcar reciben menos

### Lo que resuelve

- build de bosses
- build de setup puro
- build consistente

### Debilidad sana

- menos highlight bruto que Sorcerer
- depende mas de jugar sobre objetivos marcados

## Hooks nuevos de motor

### Imprescindibles

1. `markStacks`
2. `markTicksRemaining`
3. `flowCharges` o `nextTargetBonus`
4. `damageRangeMin`
5. `damageRangeMax`
6. `echoDamageMult`
7. `echoAppliesOnHit`

### Muy recomendables

8. `freshTargetDamageMult`
9. `markedDamageMult`
10. `markTransferPct`
11. `markApplyChance`
12. `markEffectPerStack`
13. `markConsumeBonus`
14. `flowDuration`

## Hooks reutilizables del motor actual

Ya existen o estan muy cerca:

- multi-hit
- effects stacking
- carry-over de efectos on-kill
- first-hit logic
- boss vs chain-kill differentiation

## Interaccion con loot hunt

Mage tiene que abrir una economia de caza clara.

### Stats nuevas que si valen la pena

- `spellDamage`
- `markChance`
- `markEffect`
- `flowPower`
- `flowDuration`
- `damageRange`
- `echoPower`
- `spellCritChance`
- `spellCritDamage`

### Recomendacion pragmatica

No abrir stats totalmente separadas de melee si todavia no hace falta.

Se puede hacer V1 con:

- `damage`
- `critChance`
- `critDamage`
- `multiHitChance`
- `skillPower`

Y agregar pocas stats realmente nuevas:

- `markChance`
- `markEffect`
- `flowPower`
- `damageRange`

## Poderes legendarios V1

### Base Mage

1. `Rune of Echoes`
- tus echoes aplican `Mark` con mas fuerza

2. `Perfect Sequence`
- si no haces multi-hit, tu dano rueda en el tercio alto del rango

3. `Carry the Sigil`
- al matar, transfieres parte del `Mark` al siguiente enemigo

### Sorcerer

4. `Cataclysm Primer`
- primer hit despues de una kill gana un burst enorme

5. `Volatile Chamber`
- los hits altos suben aun mas el techo del siguiente

6. `Overload Lens`
- hits criticos agregan stacks extra de `Mark`

### Arcanist

7. `Looped Seal`
- parte del `Mark` consumido reaparece en el objetivo

8. `Memory Lattice`
- pegar seguido al mismo objetivo aumenta `Mark effect`

9. `Absolute Method`
- si el objetivo esta marcado, ganas mucho dano; si no, pegas bastante menos

## Skills V1

No hace falta abrir 6 skills nuevas.

Con 2 o 3 bien elegidas alcanza.

### Base Mage

1. `Arcane Bolt`
- hit consistente
- aplica o escala `Mark`

### Sorcerer

2. `Surge Lance`
- hit de opener fuerte
- muy buena sobre objetivo fresco o despues de kill

### Arcanist

3. `Loop Ward`
- skill de control single-target
- refuerza `Mark` o `Flow` en vez de hacer AoE

## Lo que no implementaria en Mage V1

- fuego/hielo/rayo
- resistencias elementales
- mana
- ward
- congelar o stunneear
- AoE
- 4 estados nuevos
- familiars/summons

## Orden correcto de implementacion

1. `Mage base`
- `Mark`
- `Flow`
- `damage range`
- `spell echo`

2. `Sorcerer`
- burst / volatility / opener

3. `Arcanist`
- ramp / transfer / consistency

4. `Legendary powers`

5. `Loot hunt + Codex` alineados a Mage

## Mi recomendacion

`Mage` es la siguiente clase correcta solo si mantenemos esta disciplina:

- sin AoE
- sin elementos
- sin recursos nuevos
- con identidad de target preparation y enemy-to-enemy flow

Si respetamos eso, el Mage puede sentirse muy distinto al Warrior sin romper el juego.
