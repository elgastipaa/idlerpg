# Hoja de Decision de Auditoria

## Como usar esto

- Marca cada item con una sola `Decision: HACER | NO HACER | AJUSTAR | DUDA`
- Marca tambien `Prioridad: P1 | P2 | P3`
- Usa `Notas:` si quieres aclarar alcance o restricciones
- Si dejas un item vacio, lo voy a tomar como `NO HACER por ahora`
- No hace falta tocar `AUDIT_MASTER.md`; esta hoja es la fuente de decision

Plantilla:

```md
Decision:
Prioridad:
Notas:
```

---

## 1. Implementacion inmediata

### SY-02 - Overflow de inventario
Hacer mas visible cuando se pierde o descarta loot por inventario lleno.

Decision: HACER
Prioridad:
Notas: Recomendar regla de auto-venta auto-extracción?

### UX-03 - Compactacion de Santuario
Reducir densidad arriba del fold a `Listo ahora / En curso / Siguiente salida`.

Decision: HACER
Prioridad:
Notas:

### UX-06 - Feedback de claims y acciones silenciosas
Agregar toasts o micro-feedback en acciones importantes del Santuario.

Decision: HACER
Prioridad:
Notas:

### EV-06 - Session Arc visible
Mostrar objetivo principal y secundarios de la sesion con mejor framing.

Decision: HACER
Prioridad:
Notas: tenemos qu edesarrollar todo un sistema de session arcs? Porque hoy no está establecido pensando en las sesiones. Hay logros en el aire y punto.

### EV-07 - Loot filter basico
Exponer `lootRules` como filtro simple y util.

Decision: HACER
Prioridad:
Notas: Dejar respaldo comentado por si queremos revertir el cambio.

### SY-08 - Harness / batch util
Arreglar el seed post-onboarding para simulaciones y QA automatizado.

Decision: HACER
Prioridad:
Notas:

### PF-01 / PF-03 / PF-04 - Performance primer pase
Reducir peso inicial, rerender global y reloj pesado de `Combat`.

Decision: HACER
Prioridad:
Notas:

---

## 2. Siguiente ola

### EV-05 - Mover reroll a Deep Forge
Consolidar el crafting pesado en el Santuario.

Decision: NO HACER
Prioridad:
Notas: No le veo sentido a reroll en Deep Forge, si los planos no van a tener afijos fijos... van a ir por cargas por afijo para "sesgar" los afijos que salen en el item materializado.

### UX-02 - Definir arquitectura de Forja
Elegir una sola verdad: subtab visible o acceso contextual, no mixto.

Decision: HACER
Prioridad:
Notas: Que quede como hoy, después vemos si la complejizamos.

### MR-02 - Weekly Ledger
Crear una razon amable y clara para volver semanalmente.

Decision: HACER
Prioridad:
Notas:

### MR-03 - Vista unificada de progreso de cuenta
Unificar `Codex + Abyss + Blueprints + Prestige` como progreso de cuenta.

Decision: HACER
Prioridad:
Notas:

### MR-04 - Resumen claro de Prestige
Explicar brutalmente bien que conservas y que pierdes.

Decision: HACER
Prioridad:
Notas:

### MR-05 - Surfacing fuerte de Sigils
Mejorar claridad y ceremonia de la capa de sigilos.

Decision: HACER
Prioridad:
Notas: Hoy es enorme la capa de sigilos...

### EC-05 - Retune de polish / reforge / ascend
Rebalancear la economia real del crafting.

Decision: HACER
Prioridad:
Notas:

### EC-08 - Lectura build-aware
Mostrar mejor por que un item o craft sirve para tu build.

Decision: NO HACER
Prioridad:
Notas: No quiero llenar al usuario de sugerencias

### UX-05 - OverlayShell comun
Unificar politica visual y de safe area de overlays.

Decision: HACER
Prioridad:
Notas: Hacerlos siempre respetados, tendremos que evitar en el futuro que el usuario pueda romper algo tocando fuera de lo que antes era un overlay completo.

### PF-05 - Separar persistedState de runtime
Bajar costo de save y ordenar el estado.

Decision: HACER
Prioridad:
Notas:

---

## 3. Mas adelante

### PF-10 - Modularizar gameReducer y onboarding
Separar monolitos por dominio antes de crecer mas.

Decision: HACER
Prioridad:
Notas:

### MR-10 - Season / Account Ledger
Definir una capa mas larga de retencion solo despues del weekly.

Decision: NO Hacer por ahora
Prioridad:
Notas: Dejarlo más adelante, serán logros a largo plazo por ahora.

### MR-07 - Schema neutral de stash
Preparar base tecnica de stash sin tienda ni friccion monetizada.

Decision: HACER
Prioridad:
Notas: Hacerlo para el stash temporal, el que va al santuario.

### MR-08 - AppearanceProfile / ProfileCard
Agregar una capa liviana de identidad de cuenta.

Decision: HACER
Prioridad:
Notas: Preparar para logear en un futuro

### SY-03 - Blueprint permanence vs vigencia
Definir si los blueprints son permanentes o tienen vigencia suave.

Decision: HACER
Prioridad:
Notas: Son permanentes, la "obsolesencia" viene porque en tiers más altas dropean items más fuertes, que al extraerse generan planos más fuertes que el anterior que tengas.

### PF-11 - Escalado de Codex y Stats
Paginacion, colapsables y gating por seccion.

Decision: HACER
Prioridad:
Notas:

### EC-01 - Rol tardio del gold
Dar sinks reales de late game para oro.

Decision: No hacer por ahora
Prioridad:
Notas: Dejar para futuro

---

## 4. Decisiones de producto que necesito de vos

### DP-01 - Blueprints
Opciones:
- Permanentes
- Vigencia suave
- No tocar por ahora

Decision: Permanentes
Prioridad:
Notas: Como te decía, obsolescencia viene por items más fuertes dropeando a medida que el usuario progresa, y cuando los extraigo son más fuertes que el blueprint actual.

### DP-02 - Ownership del crafting
Opciones:
- Craft liviano en run, craft pesado en Santuario
- Todo en Santuario
- Todo en Expedicion

Decision: moderado en run, moderado en santuario.
Prioridad:
Notas: Tengo que encontrar razones para que el usuario quiera subir sus items antes de extraer al Santuario, y lo mismo de mejorar sus planos antes de empezar una expedición.

### DP-03 - Arquitectura final de Forja
Opciones:
- Subtab visible
- Acceso contextual
- Modal / drawer

Decision: Subbtab en mochila por ahora
Prioridad:
Notas: 

### DP-04 - Primer prestige
Opciones:
- Mantener pacing actual
- Hacerlo mas exigente
- Hacerlo mas explicado pero no mas duro

Decision: Mantener pacing
Prioridad:
Notas:

### DP-05 - Capa diaria / semanal
Opciones:
- Solo semanal
- Diaria y semanal
- Ninguna por ahora

Decision: Diaria y semanal
Prioridad:
Notas:

### DP-06 - Politica ante lag visible
Opciones:
- Slowdown controlado
- Catch-up acotado
- No tocar por ahora

Decision: No tocar por ahora
Prioridad:
Notas:

### DP-07 - Stash
Opciones:
- Preparar schema ya
- Postergarlo
- No hacerlo

Decision: Preparar schema
Prioridad:
Notas:

### DP-08 - AppearanceProfile
Opciones:
- Prepararlo ya como capa minima
- Postergarlo
- No hacerlo

Decision: Prepararlo como capa mínima
Prioridad:
Notas:

### DP-09 - Season layer
Opciones:
- Explorar despues del weekly
- Congelar indefinidamente

Decision: Congelar indefinidamente
Prioridad:
Notas:

### DP-10 - Gold sinks late game
Opciones:
- Profundizar ahora
- Dejar para despues de crafting clarity

Decision: Dejar para después de crafting clarity
Prioridad:
Notas:

---

## 5. Cosas que ya estan definidas como NO HACER salvo que cambies de idea

### ND-01 - Energy / resin
No recomendado para este juego.

Decision:
Prioridad:
Notas:

### ND-02 - Agrandar sistemas por reflejo
No sumar complejidad solo para “tener mas contenido”.

Decision:
Prioridad:
Notas:

### ND-03 - Romper el pico de Extraccion
No diluir `Extraccion` como decision central del loop.

Decision:
Prioridad:
Notas:


// ADICIONALES que quiero incursionar

UX-01
UX-04
UX-07
UX-08
SY-04
SY-06
SY-07
EV-01
EV-05
EV-06
EV-08 > Dar más detalle de qué cambios haríamos
EC-02
EC-03
EC-04
EC-05
EC-06
EC-07
EC-08
PF-08
PF-09
PF-11
RS-01
RS-04
RS-05

