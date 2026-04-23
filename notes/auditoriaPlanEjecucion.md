# Plan de Ejecucion de Auditoria

Base: [auditoriaDecisiones.md](/home/gmendoza/coding/idlerpg/notes/auditoriaDecisiones.md)

Este archivo traduce tus decisiones a un backlog ejecutable. No reemplaza la hoja de decision; la aterriza.

## 1. Decisiones ya confirmadas

### Aprobado para implementar

- `SY-02` overflow de inventario mas visible.
- `UX-03` compactacion de `Santuario`.
- `UX-06` feedback de claims y acciones silenciosas.
- `EV-06` framing visible de sesion.
- `EV-07` loot filter basico.
- `SY-08` harness / batch util.
- `PF-01 / PF-03 / PF-04` primer pase de performance.
- `UX-02` mantener `Forja` como hoy, pero ordenar la arquitectura sin complejizar.
- `MR-02` capa diaria y semanal.
- `MR-03` vista unificada de progreso de cuenta.
- `MR-04` resumen claro de `Prestige`.
- `MR-05` surfacing y claridad de `Sigils`.
- `EC-05` retune de `polish / reforge / ascend`.
- `UX-05` overlays respetados y politica comun.
- `PF-05` separar `persistedState` de runtime.
- `PF-10` modularizacion futura de monolitos.
- `MR-07` schema para `stash` temporal del Santuario.
- `MR-08` `AppearanceProfile` minimo pensando en login futuro.
- `SY-03` blueprints permanentes.
- `PF-11` escalado de `Codex` y `Stats`.

### No hacer por ahora

- `EV-05` mover `reroll` a `Deep Forge`.
- `EC-08` lectura build-aware sugerente para el usuario.
- `MR-10` `Season / Account Ledger` largo.
- `EC-01` rol tardio del `gold`.
- `DP-09` season layer.
- `ND-01` `energy / resin`.
- `ND-02` agrandar sistemas por reflejo.
- `ND-03` diluir `Extraccion` como pico del loop.

## 2. Interpretacion operativa de tus comentarios

Hay varios puntos donde tu comentario cambia el alcance original. Para implementar bien, voy a trabajar con estas interpretaciones:

### `EV-06` Session Arc

No se va a construir un sistema nuevo de arcos de sesion. Se toma como:

- framing UI sobre goals ya existentes
- objetivo principal visible
- uno o dos secundarios contextuales
- cierre corto de sesion cuando corresponda

O sea: mas legibilidad, no mas sistema.

### `EV-07` Loot filter

No voy a dejar “respaldo comentado” en el codigo. Lo voy a dejar:

- encapsulado
- con diff chico
- facil de revertir

Eso da rollback simple sin ensuciar el repo con codigo comentado.

### `UX-02` Arquitectura de Forja

Tu decision real no es “rediseñar Forja”; es:

- mantener `Forja` como subtab en `Mochila`
- sacar ambiguedades internas si aparecen
- no complejizar la UX todavia

### `UX-05` Overlays

Tu criterio operativo queda asi:

- los overlays deben respetar header, bottom nav y safe areas por defecto
- la seguridad de la interaccion se resuelve por estado y bloqueo de acciones, no por tapar toda la app salvo casos realmente especiales

### `DP-02` Ownership del crafting

Lo interpreto como:

- crafting tactico y upgrades inmediatos en run
- preparacion persistente, planos y mejora de base en Santuario
- no mover todo a una sola capa

### `SY-03` Blueprints

Queda decidido:

- los blueprints son permanentes
- la obsolescencia viene del progreso natural del loot y la extraccion
- no se va a trabajar vigencia ni degradacion

## 3. Orden recomendado de implementacion

Como no marcaste prioridades, propongo este orden.

### Lote 1 - valor inmediato y bajo riesgo

- `UX-03` compactacion de `Santuario`
- `UX-06` feedback de claims y acciones silenciosas
- `SY-02` surface fuerte para overflow de inventario
- `EV-06` framing de sesion sobre goals actuales
- `EV-07` loot filter basico

Resultado esperado:

- menos scroll
- menos acciones mudas
- mejor lectura de que hacer ahora
- menos frustracion por loot perdido o ruido de drops

### Lote 2 - base tecnica para seguir

- `SY-08` harness / batch util
- `PF-01 / PF-03 / PF-04` primer pase de performance
- `PF-05` separar `persistedState` de runtime
- `UX-05` politica comun de overlays

Resultado esperado:

- mejor QA
- menos fragilidad
- mejor base para seguir tocando UI y sistemas

### Lote 3 - claridad de cuenta y progresion

- `MR-04` resumen claro de `Prestige`
- `MR-05` surfacing de `Sigils`
- `MR-03` vista unificada de progreso de cuenta

Resultado esperado:

- el usuario entiende mejor que conserva, por que progresa y a que apunta la cuenta

### Lote 4 - economia y capas de retorno

- `EC-05` retune de `polish / reforge / ascend`
- `MR-02` diaria y semanal

Resultado esperado:

- mejor balance del crafting
- mejor retorno recurrente sin caer en energia ni chores pesados

### Lote 5 - preparacion estructural futura

- `MR-07` schema de `stash` temporal
- `MR-08` `AppearanceProfile` minimo
- `PF-11` escalado de `Codex` y `Stats`
- `PF-10` modularizacion por dominio

## 4. Puntos congelados para no reabrir sin necesidad

- no mover `reroll` a `Deep Forge`
- no meter sugerencias build-aware invasivas
- no abrir `season layer`
- no agregar `gold sinks` tardios todavia
- no tocar pacing del primer `Prestige`

## 5. Siguiente paso recomendado

Si queres avanzar ya sin volver a discutir estrategia, el mejor arranque es:

1. `Lote 1`
2. `Lote 2`
3. despues `MR-04 + MR-05 + MR-03`

Ese orden te da:

- mejora visible para usuarios
- menos deuda tecnica inmediata
- mejor base para seguir con sistemas mas grandes

## 6. Asunciones que voy a usar salvo que me corrijas

- `diaria y semanal` significa una capa amable, sin energia, sin castigo por perder dias y con catch-up razonable
- `Forja como hoy` significa no cambiar la navegacion principal, solo ordenar inconsistencias
- `stash temporal` significa stash del Santuario, no inventario monetizable ni slot machine de espacio
- `AppearanceProfile minimo` es preparacion estructural, no feature social grande todavia
