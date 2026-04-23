# Beats — Reglas de Implementación y Flujo del Tutorial

Fecha: 2026-04-20 UTC  
Estado: guía activa para onboarding y futuros beats interactivos

## 1. Qué es un beat

Un `beat` es un momento de tutorial con una sola intención clara:

- explicar una idea,
- llevar al jugador a un control real,
- o forzar una acción mínima para fijar un modelo mental.

Un beat **no** es un modal cualquiera.  
Tiene reglas de interacción, foco visual y control del tiempo del juego.

---

## 2. Anatomía correcta de un beat

### 2.1 El beat usa el control real de la UI

Si el jugador tiene que tocar algo, el beat debe llevarlo al **botón real**.

Ejemplos correctos:

- `Iniciar expedición`: se toca el CTA real del `Santuario`
- `Elegir clase`: se tocan las cartas reales de `Warrior` / `Mage`
- `Auto-avance`: se toca el botón real de botas en `Combate`
- `Mochila`: se toca la subtab real de `Expedición`
- `Heroe`: se toca la tab primaria real
- `Atributos` / `Talentos`: se tocan las subtabs reales de `Heroe`

Ejemplos incorrectos:

- poner dentro del popup un botón duplicado que haga lo mismo
- abrir una acción desde el modal en vez de desde la UI normal

Regla:

**si el beat enseña una acción del juego, el click tiene que pasar por la UI del juego, no por el popup.**

### 2.1.1 No auto-navegar a la subtab objetivo

Si un beat pide tocar una subtab interna, el juego no debe cambiar de subtab por el jugador.

Ejemplos:

- `Abre Atributos`: quedarse en `Ficha` y spotlightar `Atributos`
- `Abre Talentos`: quedarse en `Atributos` y spotlightar `Talentos`
- `Vuelve a Ficha`: quedarse en `Talentos` y spotlightar `Ficha`

Regla:

**el `requiredTab` de estos beats debe ser el contenedor padre (`Heroe`), no la subtab objetivo.**

Si no, el sistema navega solo, el jugador siente que “se apretó solo”, y el beat pierde sentido.

### 2.2 La sombra no tapa el control objetivo

El overlay del tutorial debe:

- oscurecer el resto de la pantalla,
- dejar un recorte limpio sobre el objetivo,
- no cambiar el skin base del control,
- no poner bordes blancos artificiales.

Regla:

**la sombra se recorta alrededor del objetivo, no se elimina toda la sombra de la pantalla.**

### 2.3 El control objetivo pulsa, pero no cambia de identidad

El control objetivo puede tener:

- glow suave,
- pulso,
- elevación,
- un poco más de `z-index`.

No debería:

- cambiar a fondo blanco si no era blanco,
- perder su paleta original,
- parecer otro tipo de botón.

Regla:

**el spotlight suma foco visual, no reemplaza el estilo del control.**

### 2.4 El beat bloquea las acciones incorrectas

Mientras un beat está activo:

- sólo debe poder hacerse la acción necesaria,
- o navegar a la vista necesaria para resolverla,
- o entrar a `Registro` / `Sistema` para reparar / resetear.

Regla:

**si el jugador puede salir del beat, siempre tiene que existir una forma clara de volver al control correcto.**

### 2.5 El scroll se controla

Si el control objetivo está fuera de pantalla:

- el beat debe hacer `auto-scroll`,
- o bloquear el avance hasta que el jugador llegue al lugar correcto.

Casos concretos:

- `Mochila -> Equipar`: al abrir `Mochila`, scroll al primer item tutorial
- beats en tabs internas: al entrar a la subvista correcta, scroll arriba o al target si hace falta

Regla:

**si el jugador no ve el control, el beat todavía no está bien implementado.**

### 2.5.1 Orden correcto de montaje para beats interactivos con scroll

Cuando el beat necesita spotlight real sobre un control que puede quedar fuera de viewport,
el orden de implementación correcto es este:

1. renderizar la tarjeta del tutorial
2. medir su altura real
3. calcular la ventana segura visible (`header`, `subnav`, `bottom nav`, `top guards`)
4. scrollear primero contenedores internos con `overflow`
5. scrollear después la página si todavía hace falta
6. recién ahí prender el spotlight y el glow

Regla:

**no activar el spotlight antes de que la tarjeta y el scroll estén estabilizados.**

Si no se respeta este orden, aparecen bugs típicos:

- el target queda debajo del header
- el target queda debajo de la nav inferior
- la tarjeta del beat tapa el botón correcto
- el spotlight se dibuja en una posición vieja y parece “perdido”

### 2.5.2 Contenedores con scroll interno

No todos los beats viven en el scroll principal de la página.
Hay vistas como `Mochila` o modales largos donde el target está dentro de un contenedor con `overflowY: auto`.

En esos casos:

- no alcanza con usar `window.scrollBy`
- primero hay que revelar el target dentro de su contenedor scrolleable
- ese scroll interno debe respetar la misma ventana segura del overlay

Eso significa que el target no debe quedar simplemente “visible” dentro del contenedor:

- tampoco puede quedar tapado por la tarjeta del beat
- tampoco puede quedar tapado por la nav inferior fija
- tampoco puede quedar pegado a un borde difícil de tocar

Regla:

**un target dentro de un contenedor con scroll se considera bien resuelto sólo si queda dentro de la ventana segura final del onboarding, no sólo dentro del contenedor.**

### 2.5.3 Scroll interno horizontal también cuenta

Hay vistas donde el problema no es sólo vertical.
Ejemplo real: árboles, tabs o carruseles que viven dentro de un contenedor con `overflowX: auto`.

En esos casos el tutorial también tiene que:

- detectar ancestros con scroll horizontal
- revelar el target dentro de ese contenedor
- dejarlo en una zona cómoda, no apenas visible al borde

Regla:

**si el beat apunta a un target dentro de una UI desplazable horizontalmente, el onboarding tiene que centrar o acercar ese target antes de prender el spotlight.**

### 2.5.4 El scroll se bloquea después de estabilizar la vista

Una vez que el beat ya:

1. montó la tarjeta
2. midió la tarjeta
3. scrolleó contenedores internos
4. scrolleó la página
5. prendió el spotlight

entonces conviene bloquear el scroll del usuario.

No antes.

Si se bloquea antes:

- el auto-scroll puede romperse
- la UI puede quedar en una posición intermedia

Si se bloquea después:

- el target ya quedó donde queríamos
- el usuario no puede “irse” del beat por accidente

Regla:

**el lock de scroll entra sólo cuando la vista ya quedó estable y el spotlight está listo.**

Excepción útil:

si el beat muestra varias opciones hermanas que el jugador tiene que comparar
antes de elegir, puede convenir no bloquear scroll.

Ejemplo real:

- `Elegir clase`

Ahí el objetivo no es fijar un botón puntual diminuto, sino permitir que el jugador
vea bien ambas cards y elija una.

Regla:

**beats de decisión entre múltiples opciones equivalentes pueden dejar scroll habilitado si eso mejora visibilidad y no rompe el foco.**

### 2.5.5 Para beats críticos, usar target semántico fijo y no “el primer disponible”

`Compra tu primer talento` dejó una lección importante:

si el onboarding usa un target dinámico del estilo:

- “primer nodo comprable”
- “primer item mejor”
- “primer botón visible”

el beat se vuelve frágil.

Puede romperse por:

- árbol seleccionado distinto
- orden de render
- unlocks dinámicos
- cambios de layout
- DOM todavía no montado

Para beats críticos del tutorial, conviene usar un target semántico fijo.

Ejemplos reales:

- `Warrior -> warrior_physical_training`
- `Mage -> mage_arcane_power`

Regla:

**si el tutorial quiere enseñar “el primer nodo base”, el target debe ser un `nodeId` explícito definido por clase/sistema, no una búsqueda heurística en runtime.**

### 2.5.6 El engine y la UI deben compartir el mismo target tutorial

No alcanza con que el componente sepa cuál es el nodo correcto.
El overlay también tiene que usar exactamente esa misma fuente de verdad.

Si la UI resuelve una cosa y el engine otra:

- el spotlight puede buscar un selector genérico
- el componente puede intentar scrollear otro nodo
- el beat parece roto aunque ambas partes “funcionen” por separado

Regla:

**para beats con target fuerte, el `nodeId` o `itemId` tutorial debe salir de un helper compartido del engine, no duplicarse en cada componente.**

### 2.5.7 En listas o árboles, marcar también el contenedor semántico

No spotlightear sólo el botón.

También conviene marcar:

- la card
- el row
- o el nodo completo

Ejemplo:

- `buy-talent-card`
- `buy-talent`
- `data-onboarding-node-id="warrior_physical_training"`

Esto permite:

- scrollear al contenedor correcto
- medir mejor el target
- dibujar un spotlight más claro
- no depender de un botón chiquito

Regla:

**en beats con nodos, items o cards, siempre exponer al menos un selector de acción y otro selector/container semántico.**

### 2.5.8 Si el beat requiere un recurso, el tutorial lo garantiza antes de mostrarlo

No alcanza con mostrar el target correcto si el jugador no puede pagarlo o ejecutarlo.

Ejemplo real:

- `Compra tu primer talento`
  si el nodo cuesta `1 TP` y el jugador entra con `0 TP`,
  el tutorial debe darle `1 TP` antes de mostrar el beat

El mismo patrón aplica a:

- oro para el primer atributo
- TP para el primer talento
- cargo/tutorial bundle para la primera destilación
- item tutorial para el primer equip

Regla:

**si un beat exige una acción concreta, el onboarding tiene que garantizar el recurso mínimo necesario antes de entrar en ese beat.**

No dejarlo librado a:

- drops previos
- recompensas aleatorias
- estado contaminado del save
- que el jugador “debería tener” ese recurso

La forma correcta es:

1. resolver cuál es el target tutorial real
2. calcular el costo mínimo de esa acción
3. subir el recurso del jugador hasta ese mínimo si hace falta
4. recién entonces mostrar el beat

### 2.6 Los ticks pueden pausarse

Si el beat requiere leer, decidir o tocar algo importante:

- los ticks deben frenarse.

Si el beat sólo informa algo y el juego no corre riesgo:

- puede no hacer falta frenar.

Hoy la regla práctica es:

- beats informativos o de acción crítica: `ticks pausados`
- ventanas de transición intencionales: `ticks activos`

Ejemplo:

- tras morir con el primer boss:
  - se muestra `FIRST_DEATH` con ticks frenados
  - al aceptar, los ticks vuelven
  - pasan `2s`
  - aparece `OPEN_HERO`

Regla:

**si el jugador puede perder progreso por estar leyendo el tutorial, el beat está mal.**

### 2.7 Hay beats informativos y beats interactivos

Tipos:

- `Info-only`
  - explican
  - suelen tener botón `Seguir`
  - no piden tocar un control real

- `Interactive`
  - piden tocar un control real
  - el popup no trae CTA duplicado
  - el progreso avanza sólo con la acción correcta

Regla:

**no mezclar un beat interactivo con un CTA duplicado dentro del popup.**

---

## 3. Reglas de implementación

### 3.1 Prioridad de interacción

Durante un beat interactivo:

1. se resalta el control correcto
2. se bloquea lo que no corresponde
3. se permite `Registro` para salida segura
4. si el jugador sale, el sistema debe reencauzarlo

### 3.2 Recuperación segura

Si el jugador abre `Registro` o cambia de vista:

- tocar la tab primaria correspondiente debe devolverlo a la subvista requerida del beat.

Ejemplos:

- si está en `EQUIP_FIRST_ITEM`, volver a `Expedición` debe llevarlo a `Mochila`
- si está en `SPEND_ATTRIBUTE`, volver a `Heroe` debe llevarlo a `Atributos`
- si está en `BUY_TALENT`, volver a `Heroe` debe llevarlo a `Talentos`

### 3.3 Nada de beats “muertos”

Un beat no puede dejar al jugador en una pantalla sin forma de resolverlo.

Chequeos mínimos:

- la tab requerida está visible
- el botón requerido está visible
- el target existe en DOM
- el scroll lo muestra
- la acción no está bloqueada por otro sistema

### 3.4 El beat debe usar copy corto y orientado a acción

Formato correcto:

- qué es esto
- qué cambia
- qué botón tocar

Formato incorrecto:

- teoría larga
- texto redundante
- explicar más de un sistema a la vez

---

## 4. Flujo actual del tutorial

### Tramo 1 — Entrada al juego

1. `EXPEDITION_INTRO`
   - arranca en `Santuario`
   - explica que el Santuario es la base
   - spotlight al botón real `Iniciar expedición`

2. `CHOOSE_CLASS`
   - se queda en `Santuario`
   - spotlight a las clases reales
   - elegir clase manda a `Combate`

3. `COMBAT_INTRO`
   - explica combate automático
   - ticks pausados hasta `Seguir`

### Tramo 2 — Primeros controles de run

### Regla extra del tramo `Heroe -> volver a combate`

Cuando el jugador termina:

- primer atributo,
- primer talento,
- primera `spec`,

y vuelve a `Combate`, no alcanza con haber mostrado un popup anterior.

Debe aparecer un beat corto de tutorial ya dentro de `Combate`, por ejemplo:

- `Ahora vuelve al boss`
- `Derrota al boss de Tier 5 para continuar el tutorial`

Regla:

**después de cerrar un tramo largo de onboarding fuera de combate, el siguiente objetivo de la run debe reaparecer como beat corto dentro de `Combate`, no como recordatorio persistente.**

### Regla extra del tramo `Extraccion`

La primera `Extraccion` del onboarding no debería resolverse en un solo popup.

Secuencia correcta:

1. beat en `Combate` spotlightando `Extraer al Santuario`
2. abrir el overlay real
3. beat de `cargo`
4. beat de `item rescatado` si existe
5. beat de `confirmar extraccion`

Reglas:

- el botón `Extraer al Santuario` no debe aparecer demasiado temprano en onboarding
- durante ese tutorial, la selección inicial debe arrancar vacía
- cada paso debe spotlightar el control real
- el overlay debe hacer auto-scroll al target si hace falta

4. `AUTO_ADVANCE`
   - trigger: `Tier 2` o `3` kills, lo que pase primero
   - spotlight al botón real de botas
   - el beat avanza sólo al tocar ese botón

5. `EQUIP_INTRO`
   - trigger: run ya asentada y `Tier 3+`
   - si hace falta, se inyecta un item común tutorial
   - spotlight a la subtab real `Mochila`

6. `EQUIP_FIRST_ITEM`
   - al abrir `Mochila`, scroll al primer item tutorial
   - spotlight a la card y al botón real `EQUIPAR`
   - ticks pausados mientras el beat está activo

### Tramo 3 — Primer boss y muerte guiada

7. `FIRST_BOSS`
   - en el primer boss de `Tier 5`
   - explica qué diferencia a un boss de un enemigo normal
   - ticks pausados hasta `Pelear`
   - mientras sea el primer boss tutorial, no puede retroceder manualmente

8. `FIRST_DEATH`
   - al morir por primera vez, incluso contra el boss
   - spotlight al bloque real de `Vidas de expedición`
   - ticks pausados hasta `Seguir`

9. `Delay post-boss`
   - al aceptar el beat de muerte:
   - los ticks vuelven
   - se esperan `2s`
   - se abre el siguiente beat

### Tramo 4 — Héroe y build básica

10. `OPEN_HERO`
   - se desbloquea la tab primaria `Heroe`
   - spotlight al botón real del nav principal
   - el jugador debe tocar la tab real

11. `CHOOSE_SPEC`
   - si todavía no eligió spec, se fuerza acá
   - ticks pausados mientras decide

12. `HERO_INTRO`
   - explica `Ficha`
   - `Seguir`

13. `HERO_SKILLS_INTRO`
   - spotlight a la subtab real `Atributos`
   - el jugador debe abrirla

14. `SPEND_ATTRIBUTE`
   - spotlight al botón real de upgrade comprable
   - ticks pausados hasta gastar un atributo

15. `HERO_TALENTS_INTRO`
   - spotlight a la subtab real `Talentos`
   - el jugador debe abrirla

16. `TALENT_INTRO`
   - explicación corta del árbol
   - `Seguir`

17. `BUY_TALENT`
   - spotlight a un nodo comprable real
   - ticks pausados hasta comprarlo

18. `COMBAT_AFTER_TALENT`
   - vuelve a `Combate`
   - explica que, cuando mate al boss, el tutorial continúa

### Tramo 5 — Cierre de run y Santuario

19. matar el primer boss
   - desbloquea `Caza`

20. `EXTRACTION_READY`
   - explica `Extraer al Santuario`

21. primera extracción
   - vuelve al `Santuario`
   - desbloquea `Laboratorio`

22. `RESEARCH_DISTILLERY`
   - primer research obligatorio del `Laboratorio`

23. `DISTILLERY_READY`
   - explica el primer loop persistente real

### Tramo 6 — Meta-progresión

24. `FIRST_ECHOES`
   - primer prestige real
   - se abre `Ecos`

25. `BUY_FIRST_ECHO_NODE`
   - compra forzada del primer nodo

26. `BLUEPRINT_INTRO`
   - en `Prestige 2`
   - explica `Blueprint vs Desguace`

27. `DEEP_FORGE_READY`
   - `Prestige 3`

28. `LIBRARY_READY`
   - `Prestige 4`

29. `ERRANDS_READY`
   - `Prestige 5`

30. `SIGIL_ALTAR_READY`
   - `Prestige 6`

31. `ABYSS_PORTAL_READY`
   - tras boss de `Tier 25` + requisitos de Santuario

---

## 5. Reglas para beats futuros

Antes de agregar un beat nuevo, validar:

1. ¿es informativo o interactivo?
2. ¿usa el control real o un CTA duplicado?
3. ¿la sombra está recortada sobre el target?
4. ¿el target pulsa sin cambiar de identidad?
5. ¿el jugador puede perder progreso mientras lee?
6. ¿hay retorno seguro desde `Registro`?
7. ¿si el target está fuera de pantalla hay auto-scroll?
8. ¿el beat enseña una sola idea?

Si alguna respuesta es `no`, el beat todavía no está listo.
