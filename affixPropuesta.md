# Propuesta iterativa: Sistema híbrido de afijos, Entropy, crafting y timers

Fecha: 2026-04-26  
Estado: borrador opinable para iterar.  
Base: `affixRefactor.md` y `affixRefactorPropuestas.md`.  
Scope: sistema de items, afijos, crafting, Entropy, UX mobile y timegating futuro.  
Fuera de scope: gemas, sockets, marketplace, monetización real en MVP.

---

## Cómo comentar este documento

Cada decisión importante tiene un ID tipo `D-01`.  
Podés responder en el chat con esos IDs o editar directamente este archivo debajo de `Comentario GM`.

Formato sugerido:

```md
Comentario GM:
- D-03: prefiero alternativa B.
- D-07: me gusta, pero bajaría el costo.
- D-12: no quiero timer ahí todavía.
```

El objetivo de este documento no es cerrar implementación ya, sino dejar una propuesta suficientemente concreta para que podamos discutir:

- Qué regla se aprueba.
- Qué regla se cambia.
- Qué regla se posterga.
- Qué regla conviene testear con simulación antes de implementar.

---

## 0. Resumen de la propuesta híbrida

La propuesta recomendada combina:

1. **Entropy Budget como núcleo**
   - Cada item/proyecto tiene un presupuesto de manipulación.
   - Cada craft consume Entropy.
   - Cuando se agota, la pieza queda estabilizada y no se puede seguir optimizando.

2. **UX por intención**
   - La UI no arranca mostrando acciones técnicas como `reroll`, `polish`, `reforge`.
   - Muestra acciones simples: `Mejorar`, `Afinar`, `Reforjar`, `Ascender`, `Extraer`.
   - Para algunas acciones, el jugador elige intención: daño, defensa, sustain, botín o utilidad.

3. **Timers selectivos**
   - No todo crafting tiene timer.
   - Las acciones rápidas siguen siendo instantáneas.
   - Los cierres fuertes, como `Ascender`, `Proyecto maestro` o crafting profundo, pueden vivir como jobs del Santuario.

4. **Loot primero**
   - El mejor item debe nacer de un buen drop.
   - Crafting sirve para cerrar una pieza prometedora.
   - Crafting no debe convertir cualquier base mala en BIS.

---

## 1. North Star del sistema

La frase que debería explicar todo el sistema:

> Encontrá una buena base, gastá con cuidado su Entropy, cerrá la pieza y volvé a buscar la próxima.

### Experiencia buscada

- El jugador ve un drop y entiende rápido si vale.
- El jugador entiende cuánto margen tiene para mejorarlo.
- Cada acción de crafting tiene una decisión clara.
- El crafting tiene momentos de suerte positiva, no castigos opacos.
- El loot nunca deja de importar.
- Mobile no se siente como una planilla.

### No objetivos

- No diseñar gemas.
- No diseñar sockets.
- No crear economía premium real todavía.
- No vender poder directo.
- No agregar 12 acciones de crafting.
- No crear un simulador de PoE con múltiples capas oscuras.

Comentario GM: Lo veo OK.

---

## 2. Vocabulario propuesto

### Entropy

Presupuesto de manipulación de un item/proyecto.

- Sube cuando forzás cambios.
- No baja naturalmente.
- No se compra directamente.
- No es una moneda.
- Cuando llega al máximo, la pieza queda estabilizada.

### Estabilizado

Estado final de una pieza.

- Ya no acepta crafting fino.
- Se puede equipar.
- Se puede extraer.
- Puede servir como pieza cerrada de build.

### Base

La identidad inicial del item:

- slot.
- familia.
- rareza.
- itemTier.
- base stats.
- implícitos.
- affixes iniciales.
- EntropyCap.

### Línea

Un affix visible del item.

Ejemplo:

- `+Crit Chance`
- `+Health Max`
- `+Loot Bonus`

### Calidad de línea

La calidad interna de un affix.

- Puede seguir usando `tier` internamente por compatibilidad.
- En UI primaria no se muestra como `T1/T2/T3`.
- Se puede comunicar como `Normal`, `Fuerte`, `Excelente` o sólo mediante color/ícono.

### Proyecto

Versión persistente de un item trabajado en Santuario.

- Tiene jobs.
- Puede tener timers.
- Puede tener Entropy propia o heredada.
- Se usa para late-MVP/post-MVP.

Comentario GM: Podemos sacar el tema de T1 T2 T3 de las líneas? Tantoen UI como interno. Te doy un ejemplo de una posible immplementación y lo vemos. Que exista un rango sin divisiones de T1 T2 T3, ejemplo no sé, defensa 10-30. Pero que por medio de drops, algunos afijos puedan caer "Excelentes" que significa que tienen un rango más acotado, del 50% del base pero más alto, en el ejemplo un defensa Excelente sería rango 30-40. Esto haría que no siempre las mejores piezas salgan del crafting, no? Igual iteremos y charlemos si es la mejor implementación. Con el tema proyectos, no me metería ya, ya dejamos en claro que directamente los items son persistentes, ya no tenemos blueprints, planos, o proyectos. Pero sí que tengan timers obvio para las funciones que le vamos a poner al crafitng.

---

## 3. Loop principal propuesto

### Loop corto

1. Drop.
2. Card compacta dice:
   - rating vs equipado.
   - rareza.
   - 1-2 razones.
   - Entropy disponible.
3. Jugador decide:
   - equipar.
   - extraer.
   - forjar.
   - mandar a proyecto si está desbloqueado.
4. En forja:
   - elige acción.
   - ve costo y Entropy.
   - confirma.
5. Item queda mejor, peor posicionado o estabilizado.
6. Vuelve al loot.

### Loop largo

1. Jugador encuentra una base prometedora.
2. La trabaja con acciones instantáneas.
3. Si merece cierre mayor, la manda a Santuario.
4. Santuario ejecuta job con timer.
5. Jugador vuelve, reclama y decide si seguir o cerrar.

### Promesa de dopamina

- Drop con alta EntropyCap.
- Drop con línea excelente.
- Craft que consume menos Entropy de lo esperado.
- Preview de reforja con opción fuerte.
- Ascenso que abre nueva línea sin destruir identidad.
- Proyecto terminado tras offline.

Comentario GM: La parte de forjar no la quiero dejar en la run (cuando dropean los items), la quiero dejar para el Santuario. O sea la decisión en el loop corto es equipar, extrar/vender, o dejarlo para extracción al santuario. Si te lo llevas al santuario, ahí si podemos ir a la forja del santuario (taller o deep forge, ya veremos como queda) y podemos seguir mejorándolo. De última podemos ver qué acciones dejamos para la forja dentro de la run, o directamente no dejar ninguna y que sea 100% forja de santuario, que creo que no me molestaría, así no complicamos la operativa del jugador. Creo que también reduciría el ruido de invertir en un item y después extraer y perder las mejoras.

---

## 4. Decisiones clave

| ID | Tema | Recomendación inicial | Alternativas |
|---|---|---|---|
| D-01 | Nombre visible | Mantener `Entropy` | `Estabilidad`, `Forja`, `Tensión` |
| D-02 | Qué significa | Presupuesto de manipulación | Riesgo, moneda, durabilidad |
| D-03 | Se regenera | No | Sólo con consumible raro, sólo por timer |
| D-04 | Se compra | No | Rush indirecto de jobs, jamás cap directo |
| D-05 | Al llegar al cap | Item estabilizado | Último craft permitido, luego estabilizado |
| D-06 | Tiers T1/T2/T3 | Ocultos en UI primaria | Renombrados, visibles en avanzado |
| D-07 | Reroll total | Sacarlo de acción primaria | Mantener como acción avanzada cara |
| D-08 | Reforge | Preview con elección | Resultado directo sin preview |
| D-09 | Polish/Afinar | Mejorar valor de una línea | También puede subir calidad interna |
| D-10 | Upgrade/Mejorar | Sin degradación | Mantener falla actual |
| D-11 | Ascend | Cierre fuerte, con timer | Instantáneo pero caro |
| D-12 | Timers | Sólo acciones mayores | Timers para todo, o ninguno en MVP |
| D-13 | Monetización futura | Acelerar jobs/slots/cola | Comprar rerolls, comprar Entropy |
| D-14 | Loot-only | Alta calidad de línea y EntropyCap | Todo craftable con suficiente costo |
| D-15 | Deep Forge | Reconciliar con EntropyCap | Dejarlo paralelo |

Comentario GM:
D-01 Si, mantener Entropia / Entropy
D-02 Si, es presupuesto de manipulacion
D-03 No se regenera, sólo se consume
D-04 No se compra
D-05 Si, item estabilizado
D-06 Los sacaría directamente, tanto de UI como interno. Haría un rango completo, y ver la posibilidad de que un afijo dropee "Excelente", lo cuál haga su rango más alto de lo comun.
D-07 Sacarlo, no más reroll total.
D-08 Si, preview con elección. Opción mantener + 2 opciones nuevas.
D-09 Afinar, y mejorar el valor si.
D-10 Sin degradación.
D-11 Si, me gusta así.
D-12 Con acciones mayores si, pensar qué acciones menores podemos llegar a probar con timers.
D-13 Está ok, acelerar jobs/slots/cola.
D-14 Loot only podemos pensar en eso, tanto EntropyCap como la línea Excelente.
D-15 Si, es todo una misma cosa,  no quiero 3 tipos diferentes de forjas. 

---

## 5. Modelo de item propuesto

### Shape nuevo mínimo

```json
{
  "id": "item_123",
  "type": "weapon",
  "rarity": "rare",
  "itemTier": 12,
  "level": 4,
  "rating": 1320,
  "affixes": [],
  "crafting": {
    "entropy": 22,
    "entropyCap": 72,
    "stabilized": false,
    "craftingRulesVersion": 2,
    "lastCraftAt": 1760000000000,
    "history": []
  }
}
```

### Campos nuevos

`crafting.entropy`

- Valor actual.
- Arranca bajo.
- Sube con crafting.

`crafting.entropyCap`

- Techo del item.
- Se decide principalmente al drop.
- Es una parte importante de la calidad del loot.

`crafting.stabilized`

- Boolean.
- Si es `true`, no se puede seguir modificando la pieza.

`crafting.craftingRulesVersion`

- Versiona reglas para migraciones y analytics.

`crafting.history`

- Historial mínimo.
- Útil para analytics y debug.
- Puede limitarse a últimos N eventos para no inflar save.

### Decisión D-16: Historial en save

Recomendación:

- Guardar sólo últimos 5 crafts por item.
- Telemetría guarda más detalle durante la sesión.

Alternativas:

- No guardar historial en item.
- Guardar historial completo.

Comentario GM: Dale, tomo tu recomendación.

---

## 6. EntropyCap: cómo se determina

### Recomendación inicial

El `entropyCap` debe ser una propiedad de loot. No todos los items de la misma rareza tienen el mismo margen.

Fórmula conceptual:

```txt
entropyCap =
  basePorRareza
  + bonusPorItemTier
  + bonusPorCalidadDeDrop
  + bonusPorBoss
  + variaciónPequeña
```

### Tabla base propuesta

| Rareza | Max affixes actual | EntropyCap base | Rol esperado |
|---|---:|---:|---|
| common | 0 | 24 | material o tempo muy temprano |
| magic | 1 | 42 | base simple, bajo techo |
| rare | 2 | 68 | principal base de midgame |
| epic | 2 | 88 | chase temprano/medio |
| legendary | 3 | 108 | chase serio |

### Modificadores propuestos

| Factor | Bonus |
|---|---:|
| ItemTier alto | `+0` a `+16` |
| Boss drop | `+6` |
| Drop con línea excelente | `+4` |
| Drop con perfect roll | `+6` |
| Drop con affix alineado a build | no aumenta cap, sólo recomendación UI |
| Item fabricado/ascendido desde baja base | cap más bajo que drop natural equivalente |

### Por qué esto protege el loot

Un drop legendario natural con buen cap puede tener más futuro que una pieza ascendida desde common/magic.

Esto evita:

- fabricar desde cero;
- convertir cualquier base en BIS;
- que `Ascend` sea siempre correcto;
- que los jugadores ignoren drops.

### Decisión D-17: Cap variable por drop

Recomendación:

- Sí, el cap debe variar por drop y ser parte de la emoción del loot.

Alternativas:

- Cap fijo por rareza.
- Cap sólo por itemTier.
- Cap oculto y expresado como `Estabilidad baja/media/alta`.

Comentario GM: Para mi variable está ok, podemos pensar en como darle un poquito más de "rare crafteable" a la rareza rare? Com opara que no se pierda completamente el tema de las rarezas bajas. Ya lo habíamos visto en algún momento que es algo que pasa. Terminan vendiéndose el 100% de los comunes, mágicos, y raros.

---

## 7. Entropy: costos por acción

### Reglas generales

- El costo de Entropy se muestra antes de confirmar.
- Puede ser un rango o un valor fijo.
- Recomendación MVP: rango corto, no enorme.
- Si el costo supera el cap, el craft puede completarse y luego estabilizar la pieza.

### Costos iniciales sugeridos

| Acción | Entropy | Costo material | Resultado |
|---|---:|---|---|
| Mejorar + bajo | `+3` a `+6` | oro | sube base power |
| Mejorar + alto | `+7` a `+12` | oro alto | sube base power |
| Afinar línea | `+8` a `+14` | esencia | reroll/mejora valor |
| Reforjar línea | `+16` a `+26` | esencia | cambia una línea con preview |
| Ascender | `+28` a `+42` | esencia + polvo | sube rareza/cierra ciclo |
| Proyecto maestro | `+18` a `+30` | polvo + tinta + timer | mejora fuerte por job |
| Reroll total avanzado | `+32` a `+50` | esencia alta | rehace identidad, no primario |

### RNG positiva

Cada acción puede tener outcomes de suerte:

- `Eficiente`: consume el mínimo del rango.
- `Limpio`: consume 25% menos Entropy.
- `Crítico`: aplica mejora extra sin aumentar Entropy extra.
- `Opción extra`: en reforge, aparece una opción adicional.

Recomendación:

- Estos outcomes deberían ser visibles en el log.
- No deberían depender de pago premium.

### Decisión D-18: Costos fijos o rangos

Recomendación:

- Rangos cortos para generar tensión sin frustrar.

Alternativas:

- Costos fijos, máxima claridad.
- Rangos amplios, más emoción y más varianza.

Comentario GM: Sólo un mejorar (no alto y bajo), no pondría proyecto maestro, no pondría reroll total avanzado. Ascender tiene que poder cambiar/injertar el poder legendario como antes (de acuerdo a los que tenga desbloqueados). Y no sé si dejar que sigamos pudiendo subir items de common para arriba, si a fin de cuentas se va a consumir toda la entropy. Capaz repensar el Ascender. Para mi arranquemos con costos fijos y claros, que la variedad venga del dropeo y de los afijos que tocan y sus rangos.

---

## 8. Qué pasa al llegar al cap

### Recomendación

Permitir el último craft aunque exceda el cap. Después, estabilizar.

Ejemplo:

- Item tiene `84/88 Entropy`.
- Reforjar cuesta `+18`.
- El jugador puede confirmar.
- Resultado aplica.
- Item queda `Estabilizado`.

### Por qué

- Evita frustración de “me faltan 2 puntos, no puedo hacer nada”.
- Da una decisión dramática: gastar el último intento.
- Reduce sensación de castigo.

### Qué queda permitido tras estabilizar

Permitido:

- equipar.
- extraer.
- comparar.
- marcar favorito.
- enviar a stash.

Bloqueado:

- mejorar.
- afinar.
- reforjar.
- ascender.
- proyecto maestro.

### Decisión D-19: Último craft permitido

Recomendación:

- Sí, permitir último craft.

Alternativas:

- Bloquear si excede cap.
- Permitir sólo acciones de bajo impacto.
- Permitir con costo extra y estabilización.

Comentario GM: Si, permitirlo.

---

## 9. Sistema de afijos propuesto para MVP

### Mantener

- Máximos actuales:
  - common: 0.
  - magic: 1.
  - rare: 2.
  - epic: 2.
  - legendary: 3.
- `affixes[]` como array.
- `id`, `stat`, `value`, `range`, `tier` interno por compatibilidad.
- Base + implicit + affixes como capas separadas.

### Cambiar en UI

- No mostrar `T1/T2/T3` en la vista primaria.
- Mostrar nombre de stat, valor e impacto.
- Mostrar 1 badge máximo de calidad si realmente importa.
- Modo avanzado puede mostrar datos técnicos.

### Nueva taxonomía de afijos

Cada affix debería tener tags claros:

```json
{
  "id": "prefix_crit_chance",
  "stat": "critChance",
  "slotTags": ["weapon", "armor"],
  "intentTags": ["offense", "crit"],
  "craftTags": ["reforgeable", "rollable"],
  "lootOnly": false,
  "qualityBand": "strong"
}
```

### Intent tags sugeridos

| Tag | Incluye |
|---|---|
| offense | damage, crit, attack speed, multi hit |
| defense | defense, healthMax, block, dodge |
| sustain | lifesteal, healthRegen, damageOnKill |
| status | bleed, mark, fracture |
| economy | gold, xp, loot, essence, luck |
| utility | cooldown-like, special effects, build enablers |
| abyss | affixes abyss actuales/futuros |

### Loot-only

Recomendación:

- No todo debe ser craftable.
- Algunas señales pueden ser loot-first o loot-only:
  - perfect roll.
  - affix de calidad máxima.
  - affix abyss.
  - legendary power.
  - alto EntropyCap.

### Decisión D-20: Affixes loot-only

Recomendación:

- Sí, mantener algunas propiedades fuera del crafting directo.

Alternativas:

- Todo craftable con costo alto.
- Sólo legendary powers loot-only.
- Sólo perfect rolls loot-only.

Comentario GM: Si, como ya charlamos, el afijo de calidad Excelente que sea sólo dropeable y después que se pueda mejorar el roll en la forja obvio. Los legendary powers que se puedan injertar con un costo alto de Entropy en "Ascend", o como llamemos esa función en el futuro. Y el entropycap también que sea variable con el drop así hay más chase.

---

## 10. Acciones visibles de crafting

## 10.1 Mejorar

### Objetivo

Subir el poder base de la pieza sin cambiar su identidad.

### Qué hace

- Sube `level +1`.
- Recalcula base stats, upgradeBonus e implicitUpgradeBonus.
- Puede escalar affixes sólo si mantenemos regla especial de rare +7, aunque recomiendo eliminar esa excepción a futuro.

### Recomendación

- Sin degradación.
- Sin fallo que baje nivel.
- La tensión viene de costo + Entropy, no de perder progreso.

### Por qué

En mobile/idle, fallar y degradar suele sentirse como fricción poco clara. Es mejor que el jugador decida si gastar presupuesto.

### Decisión D-21: Quitar fallo de upgrade

Recomendación:

- Sí, quitar degradación/fallo en el nuevo sistema.

Alternativas:

- Mantener falla sólo en niveles altos.
- Mantener falla pero sin degradar.
- Mantener sistema actual.

Comentario GM: Tenés razón, sin degradación/falla, que el costo venga por la entropy y costo. 

---

## 10.2 Afinar línea

### Objetivo

Tomar una línea buena y mejorar su valor.

### Qué hace

- Seleccionás una línea.
- El sistema rerolles o mejora el valor dentro de su rango/calidad.
- No cambia la stat.
- No cambia el tipo de línea.

### UI propuesta

Bottom sheet:

- Línea seleccionada.
- Valor actual.
- Resultado posible.
- Costo.
- Entropy.
- Botón `Afinar`.

### Variante MVP

Una sola opción:

- Confirmar y resolver.

### Variante mejorada

Dos cartas:

- `Seguro`: menor upside, menor Entropy.
- `Forzar`: mayor upside, mayor Entropy.

### Decisión D-22: Afinar con 1 o 2 cartas

Recomendación:

- MVP: 1 acción.
- Iteración siguiente: 2 cartas.

Alternativas:

- Siempre 2 cartas desde el inicio.
- Siempre resultado directo sin elección.

Comentario GM: 1 acción nomas. que rerollee dentro del rango, que no asegure mejora. Un reroll dentro del rango de una línea Excelente que siga dentro de ese rango obviamente.

---

## 10.3 Reforjar línea

### Objetivo

Cambiar una línea floja sin destruir toda la pieza.

### Qué hace

- Seleccionás una línea.
- Elegís intención:
  - daño.
  - defensa.
  - sustain.
  - botín.
  - utilidad.
- Pagás preview.
- Aparecen 2-3 opciones.
- Elegís una o mantenés actual.

### Recomendación

- Mantener preview con elección.
- Sacar hard lock de “sólo esta línea para siempre” y reemplazarlo por Entropy.
- Si el jugador reintenta la misma línea, el costo sube.
- Si cambia de línea, también sube, pero no se bloquea totalmente.

### Por qué

El hard lock actual es claro pero rígido. Si Entropy ya limita el item, el lock puede sentirse redundante.

### Opciones por rareza

| Rareza | Opciones nuevas |
|---|---:|
| magic | 2 |
| rare | 2 |
| epic | 3 |
| legendary | 3 |

La opción de mantener línea actual siempre existe y no debería consumir más recursos si ya se pagó preview.

### Decisión D-23: Mantener lock de línea

Recomendación:

- No como hard lock.
- Usar costos crecientes + Entropy.

Alternativas:

- Mantener hard lock actual.
- Permitir libre sin penalidad.
- Bloquear sólo tras segundo intento.

Comentario GM: Dale, no hardlockear. Siempre 2 opciones nuevas, sin importar la rarity. Sí usar costos crecientes de esencia (no sé si subir el costo de entropy sea demasiada fricción) por reforjas repetidas en la misma línea. Que puedan reforjar cualquier cantidad de líneas no? Si total el costo viene por la entropy y el RNG.

---

## 10.4 Ascender

### Objetivo

Convertir una buena pieza en una pieza de mayor rareza o mayor generación sin resetear su historia.

### Qué hace

- Sube rareza si aplica.
- Preserva líneas existentes.
- Agrega línea nueva si la nueva rareza lo permite.
- Puede habilitar poder legendario si se cumplen condiciones.
- Agrega mucha Entropy.
- Puede iniciar timer.

### Recomendación

- `Ascender` no resetea Entropy.
- `Ascender` no convierte una mala base en buena por sí solo.
- `Ascender` tiene mayor costo si el item viene de rareza muy baja.
- `Ascender` aparece sólo cuando el item ya es prometedor.

### Timer

Recomendación MVP+:

- Ascender de rare a epic: 30-90 min.
- Ascender de epic a legendary: 4-8 h.
- Proyecto maestro/legendario: 12-24 h.

MVP puro:

- Puede arrancar instantáneo si todavía no queremos meter timers.

### Decisión D-24: Ascend con timer

Recomendación:

- Sí, pero no en la primera fase de Entropy.
- Meterlo cuando el core ya esté balanceado.

Alternativas:

- Timer desde el día 1.
- Nunca timer en ascend.
- Timer sólo para legendary.

Comentario GM: Para mi, al costar tanta entropy puede ser que absolutamente nadie quiera usarla para subir piezas de común hasta legendario. podríamos pensar en cambiarlo y que sea para injertar poderes, o en el mejor de los casos para subir un Epic a legendary. Tenemos que pensar si el rare a epic también aplica, o si le damos al Rare otro beneficio por otro lado.

---

## 10.5 Extraer

### Objetivo

Convertir items no usados en recursos útiles.

### Qué hace

- Destruye item.
- Da esencia.
- Puede dar polvo/flux según rareza si se mantiene sistema actual.
- Fase futura: puede dar memoria de affix.

### Recomendación

- MVP: mantener extracción simple.
- Post-MVP: agregar memorias sólo si necesitamos más profundidad para proyectos.

### Memorias opcionales

Una memoria representa una línea aprendida de un drop.

Ejemplo:

```json
{
  "stat": "critChance",
  "slot": "weapon",
  "quality": 0.68,
  "uses": 1
}
```

Uso:

- Orientar una reforja.
- Mejorar probabilidad de una familia de affixes.
- No garantizar perfect.

### Decisión D-25: Memorias de affix

Recomendación:

- No en la primera implementación.
- Dejar diseñado para fase posterior.

Alternativas:

- Implementarlas junto con Entropy.
- No implementarlas nunca.

Comentario GM: Memorias no, es demasiado. Sigamos con extracción simple.

---

## 10.6 Reroll total

### Problema actual

Reroll total es simple, pero:

- promueve tirar de palanca hasta que salga algo bueno;
- pisa identidad de item;
- compite con loot;
- es difícil de hacer mobile-friendly sin volverse spam.

### Recomendación

Sacarlo de acción primaria.

Opciones:

- Moverlo a modo avanzado.
- Convertirlo en acción rara llamada `Recalibrar`.
- Hacerlo extremadamente caro en Entropy.
- Permitirlo sólo en magic/rare.
- Quitar del MVP visible.

### Decisión D-26: Destino de reroll total

Recomendación:

- Oculto o avanzado, no primario.

Alternativas:

- Eliminarlo por completo.
- Mantenerlo tal cual.
- Reemplazarlo por reforge por intención.

Comentario GM: Saquemoslo por completo, no necesito más reroll total si van a poder reforjar líneas ad hoc con la fricción guiada por la entropy.

---

## 11. UX mobile propuesta

### Pantalla de item en forja

Arriba:

- nombre.
- rareza.
- rating.
- delta vs equipado.

Centro:

- barra `Entropy`.
- estado:
  - `Flexible`.
  - `Tenso`.
  - `Último intento`.
  - `Estabilizado`.

Affixes:

- chips verticales o cards compactas.
- cada línea muestra:
  - stat.
  - valor.
  - impacto.
  - icono de calidad si aplica.

Abajo:

- action rail:
  - `Mejorar`
  - `Afinar`
  - `Reforjar`
  - `Extraer`

`Ascender` aparece como CTA contextual si aplica.

### Bottom sheet de acción

Debe mostrar:

- Qué va a cambiar.
- Costo.
- Entropy esperada.
- Resultado posible.
- Si estabiliza la pieza.

Ejemplo:

```txt
Reforjar línea
Crit Chance actual: +5.2%

Intención: Daño
Costo: 420 esencia
Entropy: +16-24
Estado después: Tenso

[Ver opciones]
```

### Cards de opciones

Ejemplo de reforge:

```txt
Opción A
+7.1% Crit Chance
Mejora: +64 rating
Entropy: +18

Opción B
+12 damage
Mejora: +48 rating
Entropy: +16

Mantener actual
Sin costo extra
```

### Decisión D-27: Modo avanzado

Recomendación:

- Sí, pero colapsado.
- Mostrar `tier`, rangos, roll exacto, fuente y tags sólo ahí.

Alternativas:

- No tener modo avanzado.
- Mostrar todo siempre.

Comentario GM: Dale si, hagamoslo así. Colapsado.

---

## 12. Timers y Santuario

### Principio

Los timers no deben bloquear la experimentación inicial. Deben reservarse para cierres de alto impacto.

### Acciones instantáneas

- Mejorar bajo/medio.
- Afinar.
- Reforjar preview.
- Extraer.

### Acciones con timer

- Ascender a legendary.
- Proyecto maestro.
- Estabilización especial si existe.
- Upgrade persistente de proyecto.

### Duraciones sugeridas

| Acción | Duración inicial |
|---|---:|
| Ascender rare -> epic | 30-90 min |
| Ascender epic -> legendary | 4-8 h |
| Proyecto maestro | 12-24 h |
| Upgrade proyecto bajo | 5-15 min |
| Upgrade proyecto medio | 30-90 min |
| Upgrade proyecto alto | 4-8 h |

### Slots

MVP+:

- 1 slot base.
- 2 slots desbloqueables jugando.
- slots extra pueden ser monetización futura, con cuidado.

### Rush futuro

Reglas:

- Precio baja con tiempo restante.
- Confirmación antes de gastar.
- Rush no mejora resultado.
- Rush no cambia chances.
- Rush no aumenta EntropyCap.

### Decisión D-28: Cuándo introducir timers

Recomendación:

- Fase posterior a Entropy base.

Alternativas:

- Timers desde primera versión.
- Timers sólo en Deep Forge.
- Sin timers hasta post-MVP.

Comentario GM: Fase posterior a entropy base.

---

## 13. Monetización futura ética

### Permitido

- acelerar jobs.
- comprar slots de taller.
- comprar cola offline.
- comprar cosméticos de forja.
- comprar paquetes de materiales comunes si todos se ganan jugando.
- comprar previews extra limitadas, si no evitan Entropy.

### No permitido

- comprar EntropyCap.
- comprar affix perfecto.
- comprar BIS directo.
- comprar rerolls infinitos.
- comprar acceso exclusivo a mejores affixes.
- pagar para ignorar estabilización.

### Decisión D-29: Comprar rerolls/previews

Recomendación:

- En MVP no.
- Futuro: sólo preview extra con límite y ruta free.

Alternativas:

- Nunca.
- Sí, pero sólo con moneda earnable.
- Sí, premium + earnable.

Comentario GM: En MVP no. 

---

## 14. Anti-BIS y protección del loot

### Riesgos que cerramos

Tomar item malo y hacerlo BIS:

- EntropyCap bajo en malas bases.
- Líneas top loot-first.
- Ascend no resetea Entropy.

Reroll infinito:

- Reroll total fuera de primaria.
- Reforge consume Entropy.
- Preview cuesta y no se repite gratis.

Ignorar drops:

- Alto EntropyCap viene de drops.
- Perfect/high quality viene de drops.
- Proyectos nacen de drops.

Abusar de timers:

- Rush no mejora resultado.
- Slots aumentan volumen, no techo.

Save/load:

- Difícil de resolver en local.
- Mitigación parcial: resolver RNG al pagar preview y persistir sesión.
- Analytics puede detectar patrones raros, pero no prevenir todo offline.

### Decisión D-30: Loot-only fuerte

Recomendación:

- El techo real debe depender de loot.

Alternativas:

- Crafting puede llegar al mismo techo con mucho costo.
- Crafting sólo llega a 90-95% del techo.
- Crafting sólo cierra valores, nunca cambia identidad.

Comentario GM: Si, el techo real del loot. No va a haber reroll total.

---

## 15. Deep Forge en el nuevo sistema

### Problema actual

Deep Forge tiene buenos elementos:

- proyectos.
- jobs.
- progresión persistente.
- costos de polvo/tinta/esencia.

Pero hoy puede converger demasiado porque:

- no tiene hard caps equivalentes;
- puede rerollear/pulir/reforjar mucho;
- ascensionTier puede crecer demasiado;
- no usa Entropy como límite central.

### Recomendación

Deep Forge debe convertirse en el lugar de:

- timers.
- proyectos maestros.
- ascensiones largas.
- cierre persistente.

Pero debe respetar:

- EntropyCap.
- estabilización.
- hard cap de generación.
- límites por proyecto.

### Modelo propuesto

Un proyecto hereda del item:

- rareza.
- slot.
- affixes.
- rating.
- Entropy actual.
- EntropyCap.
- origen.

Y agrega:

- `projectTier`.
- `generation`.
- `jobHistory`.
- `stationSlot`.

### Decisión D-31: Unificar item y proyecto

Recomendación:

- No unificar completamente el schema todavía.
- Crear adaptadores y reglas compartidas de Entropy.

Alternativas:

- Unificar todo ya.
- Mantener sistemas separados.

Comentario GM: No, no más proyectos, unifiquemos que un item es extraible desde la expedición al santuario, y ahí se puede hacer todas las funciones que queremos. evitemos sumar al pedo el paso de convertir un item en un proyecto, si a fin de cuentas ya no vamos a jugar con la "materializacióN" y los "sesgos de afijos". Vamos a ir directo por tunear el item en el Taller/Forja del santuario y que ese item directamente sea equipable en próximas runs.

---

## 16. Balance inicial sugerido

### Estados de Entropy

| Estado | Porcentaje | UI |
|---|---:|---|
| Flexible | 0-39% | verde/neutral |
| Tenso | 40-74% | ámbar |
| Último intento | 75-99% | rojo suave |
| Estabilizado | 100%+ | cerrado |

### Recomendación de actions por estado

| Estado | Recomendación |
|---|---|
| Flexible | se puede experimentar |
| Tenso | conviene apuntar a una línea concreta |
| Último intento | sólo gastar si la pieza merece cierre |
| Estabilizado | equipar o extraer |

### Regla de costo creciente

Cada acción repetida sobre el mismo item suma multiplicador:

```txt
costoEntropy = base * (1 + craftsPreviosDelTipo * 0.15)
```

Para reforge sobre la misma línea:

```txt
costoEntropy = base * (1 + reforgesPreviosEnLinea * 0.25)
```

### Decisión D-32: Multiplicadores crecientes

Recomendación:

- Sí, leves.

Alternativas:

- No, EntropyCap alcanza.
- Más agresivos.
- Sólo en reforge.

Comentario GM: Si, leves. Pero no en mejoras, mejoras quiero que alguien pueda aspirar un item +15 que encima tenga buenos afijos. Hagámoslo sólo en reforja, e igualmente que no suba el costo de entropy, sólo el de esencia, no?. En resumen estoy más tirando a que EntropyCap alcanza, y subir un poco costo adicional (esencia) en reforge.

---

## 17. Migración de saves

### Reglas mínimas

Para cada item sin Entropy:

```txt
entropy = calcularPorUsoLegacy(item.crafting)
entropyCap = calcularCapPorRarezaYTier(item)
stabilized = entropy >= entropyCap
craftingRulesVersion = 2
```

### Uso legacy sugerido

| Campo legacy | Entropy inicial |
|---|---:|
| `rerollCount` | `+18` c/u |
| `reforgeCount` | `+16` c/u |
| `polishCount` | `+8` c/u |
| `ascendCount` | `+24` c/u |
| `level` | `+2` c/u, capado |

### Cuidado

- No romper items existentes.
- No cambiar IDs de affixes.
- No eliminar `tier` todavía.
- No borrar counters legacy en primera versión.

### Decisión D-33: Penalizar items legacy ya crafteados

Recomendación:

- Sí, pero suave.
- No estabilizar masivamente piezas del jugador.

Alternativas:

- Todos legacy arrancan en 0.
- Aplicar penalización completa.
- Sólo nuevos items usan Entropy.

Comentario GM: Hace lo que necesites si.

---

## 18. Analytics para balance

### Eventos mínimos

`craft_preview_opened`

- mode.
- intent.
- item rarity.
- itemTier.
- entropy before/cap.
- affix selected.
- costs.
- options generated.

`craft_applied`

- mode.
- selected option.
- entropy added.
- entropy after.
- stabilized.
- rating before/after.
- equipped after.
- kept/extracted within next N minutes.

`item_entropy_created`

- source.
- rarity.
- itemTier.
- entropyCap.
- affix quality count.

`forge_job_started`

- job type.
- duration.
- project rarity.
- rush available false/true.

`forge_job_claimed`

- elapsed.
- rating delta.
- entropy delta.

### Métricas de decisión

- Cuántas piezas se estabilizan sin equiparse.
- Cuántas piezas se extraen tras craft.
- Rating ganado por Entropy gastada.
- Porcentaje de items buenos que vienen de drop vs craft.
- Tiempo hasta primer craft.
- Ratio de uso de acciones.
- Abandono por timer.
- Simulación de convergencia a BIS.

Comentario GM: Si, sumate las analytics necesarias a los payloads y reportes compactos / completos así podemos usarlos de balance.

---

## 19. Roadmap recomendado

### Fase 1: Base de Entropy sin romper sistema

- Agregar campos `entropy`, `entropyCap`, `stabilized`.
- Migrar saves.
- Mostrar barra de Entropy.
- No eliminar acciones todavía.

### Fase 2: Entropy en acciones actuales

- `polish`, `reforge`, `reroll`, `ascend` consumen Entropy.
- Último craft puede estabilizar.
- Logs claros.

### Fase 3: Simplificación visible

- Renombrar:
  - `upgrade` -> `Mejorar`.
  - `polish` -> `Afinar`.
  - `reforge` -> `Reforjar`.
- Ocultar `reroll` de primaria.
- Ocultar T1/T2/T3 de primaria.

### Fase 4: UX por intención

- Reforge pregunta intención.
- Cards de opciones.
- Bottom sheets mobile.
- Modo avanzado colapsado.

### Fase 5: Deep Forge coherente

- Aplicar EntropyCap a proyectos.
- Hard cap de generación.
- Evitar loops infinitos.
- Jobs sólo para cierres.

### Fase 6: Timers y monetización simulada

- Timers para Ascend/Proyecto maestro.
- Slots/colas.
- Rush con moneda earnable o flag simulado.
- Medir intención sin venta real.

### Fase 7: Balance IA

- Simuladores.
- Payload IA con crafting outcomes.
- Ajuste de caps/costos.

Comentario GM: Por mi ok.

---

## 20. Primer vertical slice recomendado

### Objetivo

Validar si Entropy se entiende y si limita crafting sin matar diversión.

### Alcance

Implementar sólo:

- Entropy fields.
- Cap por rareza.
- Barra de Entropy en UI.
- `Afinar` consume Entropy.
- `Reforjar` consume Entropy.
- Estabilización.
- Analytics básicos.

No implementar todavía:

- timers.
- memorias.
- monetización.
- rewrite completo de Deep Forge.
- eliminación real de T1/T2/T3.

### Criterio de éxito

- El jugador entiende cuántos intentos quedan.
- El jugador puede cerrar una pieza buena.
- No puede spamear reforge infinito.
- No siente que se rompió el loot.
- Mobile sigue legible.

### Decisión D-34: Primer vertical slice

Recomendación:

- Empezar por este slice.

Alternativas:

- Empezar por UI primero.
- Empezar por Deep Forge.
- Empezar por taxonomía de affixes.

Comentario GM: Dale si.

---

## 21. Preguntas abiertas para vos

1. ¿Querés mantener el nombre `Entropy` visible o preferís una traducción más directa como `Estabilidad`? Entropy o Entropia me gusta.
2. ¿Te gusta que Entropy suba hasta estabilizar, o preferís barra inversa tipo `Potencial restante`? Si, me gusta que suba hasta estabilizarse.
3. ¿Querés quitar el fallo/degradación de upgrade? Si, dejemos sólo la entropia como fricción.
4. ¿Querés que `Reroll total` desaparezca de la UI primaria? Si, y del juego.
5. ¿Querés que `Ascender` tenga timer en MVP o lo dejamos para después? Puede tener en MVP, pero reveamos la idea de cómo hacemos que sea atractivo para el jugador usarlo si cuesta tanta etntropía, un rare subido a legendary va a tener re poca entropía disponible para usar.
6. ¿Querés que high quality/perfect/T1 sea loot-only? Si, las líneas "Excelentes" pueden ser lootonly, me gusta la mecánica esa.
7. ¿Querés que el Deep Forge sea el único lugar con timers? Unifiquemos en una sola forja, llamada como quieras, en el Santuario.
8. ¿Te interesa la idea de memorias de affix para más adelante? No, me parece muy compleja.
9. ¿Preferís acciones técnicas (`Afinar/Reforjar`) o intención explícita (`Daño/Defensa/Botín`) en la UI primaria? técnicas tipo Afinar y Reforjar.
10. ¿Qué tan agresivo querés que sea el anti-BIS: 90%, 95% o 100% del techo sólo con loot? No quiero hardcapear algo, sólo con balance, 85%? Creo que con al Entropycap variable y con que haya posibilidad de lineas perfectas con rangos más altos eso más o menos se aplica, no?

---

## 22. Estado recomendado para avanzar

Mi recomendación actual:

- Aprobar `Entropy` como presupuesto de manipulación.
- Mantener el nombre `Entropy` por fantasía, pero mostrar también estado claro.
- Ocultar T1/T2/T3 en UI primaria.
- Mantener tiers internamente para migración.
- Quitar degradación de upgrade en el nuevo sistema.
- Sacar reroll total de acción primaria.
- Mantener reforge con preview.
- Usar EntropyCap para anti-BIS.
- Postergar timers hasta que Entropy esté calibrada.
- Diseñar Deep Forge alrededor de proyectos, timers y cierre, pero no tocarlo primero.

Si esta dirección te cierra, el siguiente documento debería ser una especificación de implementación por archivos y funciones, ya con fases concretas de código.

---

## 23. Consolidación después de comentarios GM

Esta sección reemplaza las partes anteriores donde todavía se hablaba de proyectos, blueprints o de mantener tiers internos como solución final.

### Decisiones aprobadas

| ID | Decisión consolidada |
|---|---|
| C-01 | Mantener `Entropy` / `Entropía` como nombre visible. |
| C-02 | Entropy es presupuesto de manipulación. Sube con crafting y no se regenera. |
| C-03 | Entropy no se compra y no se aumenta con monetización. |
| C-04 | Al llegar al cap, el item queda estabilizado. |
| C-05 | Permitir el último craft aunque exceda el cap; luego estabilizar. |
| C-06 | Eliminar T1/T2/T3 de UI y, como objetivo final, también del modelo interno. |
| C-07 | Reemplazar tiers por rangos continuos y líneas `Excelente` loot-only. |
| C-08 | Eliminar reroll total del juego. |
| C-09 | Mantener reforge con preview: mantener actual + 2 opciones nuevas. |
| C-10 | Afinar es una acción simple: reroll de valor dentro del rango de la línea. |
| C-11 | Mejorar no falla y no degrada. |
| C-12 | No hay proyectos/blueprints como entidad separada. El item persistente se trabaja directo en Santuario. |
| C-13 | La forja principal vive en Santuario, no dentro de la run. |
| C-14 | Memorias de affix fuera del scope. |
| C-15 | Modo avanzado colapsado sí. |
| C-16 | Timers después de Entropy base, pero pueden entrar en MVP si la acción lo justifica. |
| C-17 | Monetización fuera del MVP; futura sólo para acelerar jobs/slots/cola. |
| C-18 | Analytics nuevos en payloads compactos y completos. |

### Cambio importante de arquitectura

Antes:

- Drop -> item.
- Item podía convertirse en proyecto/blueprint.
- Deep Forge trabajaba proyectos.
- Forja de expedición podía tener acciones propias.

Ahora:

- Drop -> item persistente.
- Durante la run sólo se decide equipar, vender/extraer o guardar.
- En Santuario, el mismo item puede mejorarse.
- No hay paso de convertir a proyecto.
- No hay tres forjas distintas.

Esto reduce:

- ruido mental;
- migraciones raras entre entidades;
- pérdida de inversión al extraer;
- duplicación entre `Crafting` y `DeepForge`.

Comentario GM: Totalmente de acuerdo.

---

## 24. Diseño actualizado de afijos sin tiers

### Problema a resolver

Los tiers T1/T2/T3 generan clutter y confusión. Además, si crafting puede rerollear dentro de cualquier tier o saltar tiers, el sistema empuja a optimización demasiado directa.

### Propuesta consolidada

Cada affix deja de tener tres tiers visibles/internos como modelo final y pasa a tener:

```json
{
  "id": "defense_flat",
  "stat": "defense",
  "range": { "min": 10, "max": 30 },
  "quality": "normal"
}
```

Algunos drops pueden traer líneas `Excelente`:

```json
{
  "id": "defense_flat",
  "stat": "defense",
  "range": { "min": 30, "max": 40 },
  "quality": "excellent",
  "lootOnly": true
}
```

### Reglas

- `normal`: puede dropear y puede aparecer por reforja.
- `excellent`: sólo puede venir de drop.
- Afinar una línea `normal` rerolles dentro de su rango normal.
- Afinar una línea `excellent` rerolles dentro de su rango excelente.
- Reforjar no crea `excellent`.
- Reforjar puede mantener una línea `excellent` si el jugador elige mantener actual.
- El rating y la UI deben valorar `excellent`, pero sin transformarlo en un badge ruidoso.

### Beneficios

- El techo real depende del loot.
- Crafting sigue siendo útil porque puede cerrar valores.
- No hace falta mostrar T1/T2/T3.
- Se entiende fácil: algunas líneas son mejores porque nacieron excelentes.
- El jugador puede ver una pieza rare con una línea excelente y pensar “esta base merece Santuario”.

### Decisión abierta A-01: Nombre visible de `excellent`

Opciones:

- `Excelente`
- `Impecable`
- `Afinada`
- no mostrar texto, sólo icono/marco

Recomendación:

- Usar `Excelente` en modo avanzado y una marca visual sutil en la línea.

Comentario GM: Excelente si, la marca visual podría venir de los iconos que ya tenemos también, hoy tenemos simbolos al lado de AFIJOS que son cuadrados grises, podríamos hacer que los excelentes tengan un triángulo naranja o algo así. o lo que opines.

---

## 25. Rarezas bajas y rare crafteable

### Problema

Si common/magic/rare son siempre material, se pierde una parte grande del loot. El jugador termina vendiendo todo lo que no sea epic/legendary.

### Objetivo

Que una pieza `rare` pueda ser interesante sin competir siempre contra legendary natural.

### Reglas propuestas

1. `rare` puede tener EntropyCap competitivo para su etapa.
2. `rare` puede dropear con línea `Excelente`.
3. `rare` puede ser más barata de mejorar y afinar.
4. `rare` puede tener mejor eficiencia `rating ganado / Entropy`.
5. `rare` no necesita ascender siempre para ser útil.

### Tabla ajustada de EntropyCap base

| Rareza | EntropyCap base v2 | Rol |
|---|---:|---|
| common | 20 | material / early tempo |
| magic | 38 | early tempo con 1 línea buena |
| rare | 76 | crafteable eficiente |
| epic | 90 | chase intermedio |
| legendary | 108 | chase alto |

### Por qué sube rare

Rare tiene 2 affixes igual que epic hoy. Si epic no agrega una tercera línea, el diferencial real puede ser rareza/rating/costos. Entonces rare puede vivir como base eficiente con buen cap, mientras epic/legendary tienen mejores implícitos, poderes o techo final.

### Decisión abierta A-02: Rol de magic/common

Recomendación:

- common y magic siguen siendo mayormente material/tempo.
- rare es la primera rareza crafteable de verdad.

Alternativas:

- Dar a magic una chance baja de línea excelente para early dopamine.
- Permitir que common tenga EntropyCap excepcional muy raro.

Comentario GM: Puede ser darle a magic líneas excelentes con más chance. y el Rare con entrpy 76 base no sé, podríamos darle la misma entropy que al Epic, cosa que sea crafteable, y que la ventaj del Epic sea que podemos ascenderlo a legendario, no?

---

## 26. Acciones definitivas de la Forja del Santuario

La forja vive en Santuario y trabaja items persistentes.

### Acciones MVP

| Acción | Instantánea/timer | Consume Entropy | Consume material | Resultado |
|---|---|---:|---|---|
| Mejorar | instantánea | sí | oro | `level +1` sin falla |
| Afinar | instantánea | sí | esencia | reroll valor dentro del rango |
| Reforjar | instantánea | sí | esencia | mantener actual + 2 opciones nuevas |
| Extraer | instantánea | no | no | destruye item y da recursos |

### Acción a definir

| Acción | Estado |
|---|---|
| Ascender / Imbuir / Injertar | abierta |

### Costos fijos de Entropy sugeridos v1

| Acción | Entropy fija |
|---|---:|
| Mejorar | `+4` |
| Afinar | `+10` |
| Reforjar | `+20` |
| Ascender / Injertar | `+30` a definir |

### Costos crecientes

- No subir Entropy por repetición.
- EntropyCap ya limita la cantidad total de manipulación.
- Sólo reforge repetida en la misma línea sube costo de esencia.

Fórmula inicial:

```txt
essenceCost = base * (1 + reforgesPreviasEnLinea * 0.25)
```

### Decisión abierta A-03: Mejorar hasta +15

Recomendación:

- Sí, permitir aspirar a item `+15`.
- El costo principal escala por oro/esencia, no por multiplicador extra de Entropy.
- Mantener `+15` como fantasía de inversión larga.

Comentario GM: si, quiero que puedan aspirar a items +15. Como acción pongamos "Imbuir" si querés, que pueda injertar poderes legendariso ya descubiertos en un Epic para convertirlo a Legendary. Que los legendaries no se puedan modificar, que el poder con el que caen sea el que les queda. Así la fantasía queda como: Magic tiene buena línea excelente, Rare muy crafteable, Epic que puede terminar con cualquier poder legendario, y legendaries que tienen más entropy pero con el poder que caen. Así creo que quedaría lindo.

---

## 27. Ascender / Injertar: problema abierto

### Problema

Si `Ascender` cuesta mucha Entropy y permite subir common -> legendary, puede pasar una de dos cosas:

- Nadie lo usa porque consume demasiado presupuesto.
- Se vuelve ruta dominante si el costo queda bajo.

### Cambio de enfoque

En vez de pensar `Ascender` como “subir cualquier rareza”, conviene separarlo conceptualmente:

1. **Elevar a legendario**
   - Sólo epic -> legendary.
   - Costo alto.
   - Puede tener timer.
   - Agrega o habilita poder legendario.

2. **Injertar poder**
   - Sobre legendary.
   - Cambia/agrega poder legendario desbloqueado.
   - Costo alto de Entropy.
   - Puede tener timer.

3. **Rare especial**
   - Rare no necesita ascender para ser útil.
   - Su beneficio es eficiencia, alto cap relativo y bajo costo.

### Recomendación v2

- Eliminar common -> magic -> rare -> epic como camino principal de ascend.
- Permitir sólo:
  - `epic -> legendary`;
  - `legendary: injertar/cambiar poder`.
- Evaluar `rare -> epic` más adelante si rare queda sin rol.

### Decisión abierta A-04: Rare -> Epic

Opciones:

- No existe.
- Existe con bajo costo y sin timer.
- Existe como unlock midgame.
- Existe sólo si el rare tiene línea excelente.

Recomendación inicial:

- No implementarlo en el primer vertical slice.

Comentario GM: Arriba lo charlamos, sólo Epic a Legendary, injertando un poder a elección si lo hay disponible. No permite cambiar commons magics ni rares, y no permite cambiar el poder de legendaries.

---

## 28. Reforge definitivo

### Reglas

- No hay hard lock de línea.
- Se puede reforjar cualquier línea mientras el item no esté estabilizado.
- Siempre muestra:
  - opción mantener actual;
  - opción nueva A;
  - opción nueva B.
- Las dos opciones nuevas nunca son `excellent`.
- Si la línea actual es `excellent`, mantenerla conserva su rango y calidad.
- Reforjar consume Entropy fija.
- Reforjar repetidamente la misma línea sube esencia, no Entropy.

### Pregunta de intención

Para MVP, usar acciones técnicas y no intención primaria.

Flujo recomendado:

1. Seleccionar línea.
2. Tocar `Reforjar`.
3. Opcional: selector pequeño de enfoque:
   - `Daño`
   - `Defensa`
   - `Sustain`
   - `Botín`
   - `Cualquiera`
4. Ver opciones.

Esto mantiene el control técnico sin convertir la UI principal en “elige intención”.

### Decisión abierta A-05: Selector de enfoque

Recomendación:

- MVP puede arrancar con `Cualquiera`.
- Luego agregar enfoque si hace falta más agencia.

Comentario GM: No, intención no, ni lo pensemos eso. Que sea cualquiera. Decisión abierta.

---

## 29. Afinar definitivo

### Reglas

- Una sola acción.
- No hay cartas.
- No garantiza mejora.
- Rerolles valor dentro del rango actual.
- Si la línea es `excellent`, usa rango excellent.
- Consume Entropy fija.
- Consume esencia.

### UX

Antes de confirmar:

```txt
Afinar línea
Defensa: 24
Rango: 10-30
Costo: 180 esencia
Entropy: +10
Resultado: nuevo valor dentro del rango
```

Si es excellent:

```txt
Defensa excelente: 34
Rango: 30-40
```

Comentario GM: Exacto, eso mismo, una acciión, sin cartas sin garantías, rerollea y consume cada vez más esencia por rerollear misma línea (entropy fija). Puede reforjar más de una línea por item, el límite es la entropía.

---

## 30. Próximo paso recomendado

Antes de código grande, conviene hacer una mini-spec técnica de implementación con ownership por archivo.

### Documento siguiente sugerido

`affixImplementacion.md`

Debe contener:

- shape final de affix sin tiers;
- migración de affixes legacy T1/T2/T3 a rangos continuos;
- fórmula de EntropyCap;
- costos fijos;
- acciones finales;
- cambios de UI;
- cambios en analytics;
- archivos exactos a tocar;
- tests/simuladores necesarios;
- orden de implementación.

### Orden de implementación recomendado

1. **Data model y migración**
   - Agregar Entropy a items.
   - Normalizar affixes legacy.
   - Mantener compatibilidad temporal con `tier`.

2. **Affix quality**
   - Introducir `quality: normal | excellent`.
   - Hacer que drop pueda generar excellent.
   - Hacer que crafting nunca genere excellent.

3. **Entropy en acciones**
   - Mejorar, Afinar, Reforjar.
   - Último craft estabiliza.
   - Reroll total eliminado.

4. **Santuario como única forja**
   - Mover/renombrar UI hacia Taller/Forja del Santuario.
   - Sacar crafting de run si queda expuesto.

5. **Analytics**
   - Agregar eventos/campos en reportes.

6. **Timers**
   - Post vertical slice.
   - Primero definir Ascender/Injertar.

### Mi recomendación de avance

No implementaría todavía hasta cerrar `A-01` a `A-05`, especialmente:

- nombre visual de `excellent`;
- si rare -> epic existe o no;
- si reforge tiene selector de enfoque en MVP;
- cómo llamamos la acción de injertar poder.

Comentario GM:Ya dejamos todos los comentarios, avancemos.

---

## 31. Cierre de decisiones después de segunda vuelta GM

Estas decisiones cierran `A-01` a `A-05` y pasan a implementación.

| ID | Decisión final |
|---|---|
| A-01 | La línea superior se llama `Excelente`. En UI primaria usa marca visual sutil, idealmente triángulo naranja o variante del icono de afijo existente. |
| A-02 | `magic` puede tener más chance relativa de línea `Excelente` para generar drops simples pero emocionantes. `rare` tiene EntropyCap base igual a `epic` para ser crafteable. La ventaja de `epic` es poder usar `Imbuir`. |
| A-03 | Los items pueden aspirar a `+15`. Mejorar consume Entropy fija y costo creciente, sin falla/degradación. |
| A-04 | No existe common -> magic -> rare -> epic. No existe rare -> epic. Sólo `epic -> legendary` mediante `Imbuir`, eligiendo un poder legendario ya descubierto. |
| A-05 | Reforge no usa intención/enfoque. Siempre es pool general: mantener actual + 2 opciones nuevas. |

### Fantasía final por rareza

- `common`: material/tempo temprano.
- `magic`: una línea, con chance interesante de `Excelente`.
- `rare`: muy crafteable, mismo EntropyCap base que epic, buen lugar para invertir si tiene líneas útiles.
- `epic`: base de transición premium; puede convertirse en legendary con `Imbuir` y elegir poder descubierto.
- `legendary`: más EntropyCap y poder propio del drop, pero no puede cambiar su poder.

### Aclaración sobre legendary

Un legendary natural puede seguir siendo trabajado con `Mejorar`, `Afinar` y `Reforjar` mientras tenga Entropy disponible. Lo que no puede hacer es cambiar/injertar otro poder legendario. El poder con el que cae queda fijo.

### Acción `Imbuir`

`Imbuir` reemplaza la idea amplia de `Ascender`.

- Sólo aplica a `epic`.
- Convierte el item a `legendary`.
- Permite elegir un poder legendario desbloqueado.
- Agrega una línea normal si hace falta llegar al conteo legendary.
- Consume mucha Entropy.
- No genera líneas `Excelente`.
- Puede tener timer en fase posterior.

### Reforge y Afinar

- `Reforge`: cualquier línea, mantener actual + 2 nuevas, sin hard lock, Entropy fija, esencia creciente por repetir misma línea.
- `Afinar`: una acción simple, reroll dentro del rango actual, sin garantía de mejora, Entropy fija, esencia creciente por repetir misma línea.

### Próximo paso

Se avanza a `affixImplementacion.md` como spec técnica por archivos y fases.
