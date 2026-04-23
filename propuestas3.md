# Propuestas 3

Fecha: 2026-04-22 UTC

## Objetivo

Dejar una propuesta concreta para compactar la UX del juego sin perder profundidad.

La prioridad no es "mostrar menos sistemas". La prioridad es:

- mostrar menos cosas a la vez
- repetir menos la misma informacion
- dejar mas acciones importantes arriba del fold
- bajar el scroll obligatorio en tareas de rutina
- mantener la profundidad para la sesion larga
- no volver a forzar onboarding interactivo despues de la primera compra de Ecos

## Hoja de decision

Completa solo esta seccion.

Valores validos en `Decision`:

- `HACER`
- `NO HACER`
- `AJUSTAR`
- `DUDA`

Si `Decision` queda vacio, lo tomo como `NO HACER`.

`Prioridad` es opcional. Si quieres, usa `alta`, `media` o `baja`.

`Notas` es opcional. Sirve para aclarar el ajuste que quieres.

### 1. Docs alignment

1. Actualizar `ONBOARDING_PLAN.md` para reflejar el onboarding real hasta la primera compra de Ecos.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

2. Fijar en docs la regla: despues de la primera compra de Ecos, todo beat tardio es informativo (`popup + Seguir + hint a Glosario`).
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

3. Sacar de docs cualquier expectativa de beats tardios que fuercen clicks reales en UI.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

4. Archivar o descartar `FIRST_BOSS_KILL_MILESTONE` en el plan.
   `Decision: HACER`
   `Prioridad: `
   `Notas: DESCARTAR`

5. Alinear terminologia de docs con la UI actual (`Mas`, `Intel`, `Santuario`, `Ecos`, `Taller`, `Biblioteca`, `Encargos`, `Altar`).
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

6. Agregar una mini seccion de arquitectura UX en docs (`Santuario = home`, `Expedicion = run`, `Heroe = build`, `Ecos = meta`, `Mas = utilitario`).
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

### 2. QA onboarding tardio

1. Crear una matriz de QA para beats tardios.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

2. Cubrir QA minima para estos beats: `FIRST_PRESTIGE_CLOSE`, `BLUEPRINT_INTRO`, `BLUEPRINT_DECISION`, `FIRST_DEEP_FORGE_USE`, `FIRST_LIBRARY_RESEARCH`, `FIRST_ERRAND`, `FIRST_SIGIL_INFUSION`, `TIER25_CAP`, `FIRST_ABYSS`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

3. Agregar checklist de regresion para todo lo previo a Ecos.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

4. Sumar helper de QA en `Mas > Sistema` para saltar a saves o estados clave.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

### 3. UI Surfacing v2

1. Definir una gramatica unica para estados de build (`Nombre`, `valor/stacks`, `efecto corto`, `tooltip corto`).
   `Decision: DUDA`
   `Prioridad: `
   `Notas: No sé si está tan mal hoy`

2. Unificar categorias visuales de estados (`ramp ofensivo`, `vulnerabilidad`, `DoT`, `defensa`, `control`).
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

3. En combate, mantener buffs del jugador cerca del heroe y debuffs del enemigo cerca del enemigo.
   `Decision: DUDA`
   `Prioridad: `
   `Notas: No está así ya hoy? En las pills de estados que hay abajo del héroe y enemigo`

4. En `Heroe > Ficha`, mostrar solo los estados o escalados que realmente definen la build.
   `Decision: AJUSTAR`
   `Prioridad: `
   `Notas: O sea, mostrar lo que afecta, si, no mostraría mark por ejemplo en guerrero, pero sí fuerza y vitalidad por más que no definan la build, afectan.`

5. En `Talentos`, pasar a lectura `Actual / Proximo` en vez de descripcion larga primero.
   `Decision: DUDA`
   `Prioridad: `
   `Notas: Y dónde queda la descripción?`

6. Mandar profundidad extra a `Glosario` o tooltip corto, no a copy inline largo.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

### 4. Character clarity pass

1. Compactar el header de `Heroe > Ficha`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

2. Mantener `Vida` y `Experiencia`, pero con menos alto vertical.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

3. Reagrupar `Lectura Rapida` en `Ofensiva`, `Defensa` y `Build`.
   `Decision: DUDA`
   `Prioridad: `
   `Notas: Esto agrandaría la vista? O la achicaría?`

4. Unir `Especializacion` e `Identidad de Build` en un solo bloque `Build actual`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

5. Dejar modifiers como chips cortos, no como segundo bloque narrativo.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

6. En `Atributos`, pasar de cards altas a filas compactas.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

7. Separar `Atributos` en `Combate` y `Economia`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

8. Poner `Fuerza`, `Vitalidad`, `Precision`, `Celeridad` primero y dejar `Codicia` / `Sabiduria` como bloque secundario o colapsable.
   `Decision: HACER`
   `Prioridad: `
   `Notas: Secundario si, colapsable no sé, son igual de importantes.`

9. Subir y acortar `Lectura actual` en `Atributos`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

10. En `Talentos`, acortar header sticky y sumar filtros `Comprables`, `Activos`, `Todos`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

11. En cada nodo de `Talentos`, priorizar `nombre`, `nivel`, `costo`, `Actual`, `Proximo`; dejar descripcion larga en segundo plano.
   `Decision: HACER`
   `Prioridad: `
   `Notas: pero que quede claro qué hace el nodo. Que no perdamos la explicación de qué hacen por el afán de simplificar.`

12. Despriorizar visualmente nodos muy lejanos o tiers sin compras posibles.
   `Decision: HACER`
   `Prioridad: `
   `Notas: Dejarlos colapsados o algo así? Cosa que el jugador defina si quiere ir a buscar la info futura o no.`

### 5. Expedicion clarity pass

1. Mantener visibles solo `Combate`, `Mochila`, `Intel`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

2. No reintroducir `Forja` como subtab visible de `Expedicion`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

3. Dejar `Crafting/Forja` como accion contextual desde `Mochila`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

4. En `Combate`, dejar el primer viewport limitado a `tier/fase`, `enemigo`, `extraer`, `HP enemigo`, `HP heroe`, `estados criticos`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

5. Integrar o achicar mucho el bloque de clase + XP en `Combate`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: De la manera que puedas`

6. Dejar el intel del enemigo resumido en chips y un `Ver intel`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

7. Pasar la grilla de stats de combate a acordeon o panel colapsable.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

8. Dejar `Talentos activos` colapsado por default.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

9. Reducir `Guidance strip` a una sola linea realmente corta.
   `Decision: AJUSTAR`
   `Prioridad: `
   `Notas: Necesito que igual se vea la descripción y el progreso, y que puedan ir rotando`

10. Dejar `Extraer al Santuario` muy visible sin exigir scroll.
   `Decision: HACER `
   `Prioridad: `
   `Notas: `

11. En `Mochila`, bajar badges simultaneos y mejorar comparacion de upgrade util.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

12. En `Intel`, reducir el hero panel superior.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

13. En `Intel`, hacer que el primer viewport responda `que puedo ir a buscar`, `que bosses tengo`, `que power me falta`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

14. Bajar `Poderes legendarios` y `Familias reveladas` mas abajo o a paneles colapsables.
   `Decision: HACER`
   `Prioridad: `
   `Notas: Colapsables me va`

15. En `Biblioteca`, subir `investigaciones corriendo` y `claims` arriba del fold.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

### 6. Ecos clarity pass

1. Arriba del fold en `Ecos`, mostrar solo `Ecos disponibles`, `Ecos al extraer`, `Momentum`, `Record historico`, `Compra o rama sugerida`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: No mostraría sugerencia, no mostraría récord histórico. `

2. Fusionar mejor el resumen de `Ecos disponibles` con `Bonos activos`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

3. Acortar fuerte el copy del header de `Ecos`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

4. Bajar el peso de `Hitos de Abismo` temprano, con franja compacta o panel colapsable.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

5. Mantener tabs horizontales de ramas.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

6. En cada nodo de `Ecos`, priorizar `Actual`, `Proximo`, `Costo`, `Req`; dejar descripcion larga en segundo plano.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

7. Agregar filtros `Comprables`, `Activos`, `Todos`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

### 7. Sanctuary clarity pass

1. Compactar la cabecera de `Santuario`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

2. Crear una sola `Bandeja operacional` arriba con `Listo`, `Corriendo`, `Bloqueado por recurso`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

3. Subir `Claims` arriba de la grilla de estaciones.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

4. Fusionar `Listo ahora` con `Claims`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

5. Fusionar `Operacion en curso` con `Jobs en curso`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

6. Acortar fuerte `Siguiente mejor paso`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: Creo que podemos acortar muchísimo esto. Sólo es tooltip`

7. Bajar mucho el texto de la primera card de `Santuario`.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

8. Hacer las cards de estaciones mucho mas compactas (`titulo`, `status`, `1 linea`, `CTA`).
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

9. Mover el detalle largo de estaciones a `Ver detalle`, expand o sheet.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

10. Dejar `Taller` como bloque contextual, no siempre protagonista.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

11. Mantener `Laboratorio` importante, pero con menos narrativa y menos alto visual.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

12. Mantener recursos visibles, pero en formato mas compacto.
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

13. Si hay expedicion activa, dejar una lectura muy obvia arriba (`Run activa`, `Tier`, `vidas`, `claim listo` si aplica).
   `Decision: HACER`
   `Prioridad: `
   `Notas: `

## Resumen ejecutivo

Mi conclusion, despues de revisar docs y vistas reales, es esta:

1. La arquitectura top-level actual ya esta bastante bien.
   `Santuario / Expedicion / Heroe / Ecos / Mas` es un corte correcto. No haria otra cirugia grande en tabs ahora.

2. El mayor problema no es de features. Es de jerarquia.
   Varias pantallas ya tienen un resumen corto arriba, pero despues repiten la misma historia mas abajo en cards mas largas.

3. `Santuario` es el frente con mas retorno inmediato.
   Hoy ya tiene buenas piezas, pero hay duplicacion clara entre `Listo ahora`, `Claims`, `Operacion en curso`, `Jobs en curso`, cards de estaciones y helper texts.

4. `Expedicion` ya esta mucho mejor de arquitectura que antes.
   El wrapper con `Combate / Mochila / Intel` esta bien. El trabajo fuerte pendiente esta dentro de `Combat.jsx` y en compactar `Intel`.

5. `Heroe` y `Ecos` no necesitan una reestructura total.
   Necesitan mejor lectura, menos copy simultaneo y mejor progressive disclosure.

6. Los beats tardios del onboarding ya deben quedar en modo informativo.
   La propuesta de docs y QA parte de esa regla como decision fija.

## Principios de diseno para aplicar en todo el juego

- `Above the fold` primero. Cada pantalla debe responder su pregunta principal sin scroll.
- Una sola zona por concepto. Si hay `claims`, no deberian vivir en tres lugares.
- El detalle profundo debe ser opt-in. No deberia caer encima del jugador cada vez.
- Un bloque = una decision. Si un bloque mezcla status, explicacion historica y CTA, termina siendo largo y flojo.
- El texto inline debe explicar "que hago ahora", no reexplicar el sistema entero.
- Las tareas de rutina tienen que ser cortas. El scroll largo debe quedar para exploracion, buildcraft o consulta.
- La version mobile manda. Si en mobile una accion comun pide 2 o 3 pantallas de scroll, la jerarquia esta mal.
- No volveria a subir estaciones a tabs primarias.
- No reabriria `Forja` como subtab visible de `Expedicion`.

## Base relevada

Revise principalmente:

- `UI_UX_AUDIT_REPORT.md`
- `nextSteps.md`
- `ONBOARDING_PLAN.md`
- `src/App.jsx`
- `src/components/Sanctuary.jsx`
- `src/components/Character.jsx`
- `src/components/Skills.jsx`
- `src/components/Talents.jsx`
- `src/components/ExpeditionView.jsx`
- `src/components/Combat.jsx`
- `src/components/Codex.jsx`
- `src/components/Prestige.jsx`
- `src/components/RegistryView.jsx`
- `src/engine/onboarding/onboardingEngine.js`

La propuesta de abajo esta atada a ese estado real, no a una idea abstracta de UI.

## 1. Docs alignment

### Diagnostico

La documentacion del onboarding quedo atras del comportamiento actual.

- `ONBOARDING_PLAN.md` todavia marca pasos como pendientes o interactivos cuando ya no deberian serlo.
- El criterio nuevo "despues de la primera compra de Ecos, todo beat es informativo" todavia no esta fijado como regla madre.
- `nextSteps.md` ya tiene prioridades correctas, pero le falta aterrizar estas pasadas de claridad como un bloque coordinado.

### Cambios propuestos

- Actualizar `ONBOARDING_PLAN.md` para que refleje el estado real del onboarding hasta la primera compra de Ecos.
- Marcar explicitamente que, a partir de ahi, los beats tardios pasan a formato `popup informativo + Seguir + hint a Glosario`.
- Sacar de la doc cualquier expectativa de beats tardios que fuercen clicks reales en UI.
- Dejar archivado o descartado `FIRST_BOSS_KILL_MILESTONE`, porque hoy no suma valor y solo complica la secuencia.
- Alinear la terminologia de docs con la UI actual:
  `Mas`, `Intel`, `Santuario`, `Ecos`, `Taller`, `Biblioteca`, `Encargos`, `Altar`.
- Agregar una mini seccion de arquitectura UX en docs:
  `Santuario = home operacional`, `Expedicion = run`, `Heroe = build`, `Ecos = meta`, `Mas = utilitario`.

### Resultado esperado

- Menos confusion entre plan y codigo.
- Menos riesgo de reabrir discusiones ya cerradas del onboarding.
- Mejor base para QA y para cualquier refactor de copy o de jerarquia visual.

### Archivos probables

- `ONBOARDING_PLAN.md`
- `nextSteps.md`
- opcional: `docs/ui_architecture.md` o una seccion fija en `UI_UX_AUDIT_REPORT.md`

## 2. QA real del onboarding tardio

### Diagnostico

El riesgo ya no esta tanto en el copy. El riesgo esta en la secuencia y en los edge cases.

Lo que hay que validar no es solo "aparece el popup". Hay que validar:

- que cada beat aparece una sola vez
- que no bloquea la UI real
- que no cambia tabs de forma agresiva
- que no rompe flujo de run o de Santuario
- que si dos beats compiten, el orden quede estable

### Cambios propuestos

- Crear una matriz de QA para beats tardios con estas columnas:
  `beat`, `trigger`, `pantalla esperada`, `popup esperado`, `bloquea interaccion`, `flag de completion`, `regresiones`.
- Cubrir como minimo estos beats:
  `FIRST_PRESTIGE_CLOSE`
  `BLUEPRINT_INTRO`
  `BLUEPRINT_DECISION`
  `FIRST_DEEP_FORGE_USE`
  `FIRST_LIBRARY_RESEARCH`
  `FIRST_ERRAND`
  `FIRST_SIGIL_INFUSION`
  `TIER25_CAP`
  `FIRST_ABYSS`
- Agregar una checklist de regresion para todo lo previo a Ecos:
  eso tiene que quedar exactamente como esta hoy, porque ya funciona bien.
- Si conviene, sumar un helper de QA en `Mas > Sistema` para saltar a saves o estados clave.
  No lo veo obligatorio para shipping, pero si muy util para validar rapido.

### Casos que validaria si yo lo implemento despues

- Save nueva hasta `BUY_FIRST_ECHO_NODE`.
- Segunda extraccion y primer retorno post-Ecos.
- Primer `Prestige 2` con acceso al `Taller`.
- Primer `Prestige 3/4/5/6` para `Deep Forge`, `Biblioteca`, `Encargos`, `Altar`.
- Primer kill de `Tier 25`.
- Primera entrada real a `Abismo`.
- Casos de concurrencia:
  vuelves al Santuario con varios unlocks listos a la vez.

### Criterio de aceptacion

- Ningun beat posterior a la primera compra de Ecos exige click sobre UI real.
- Todos muestran el hint de Glosario.
- Todos cierran con `Seguir`.
- Ninguno secuestra foco de forma rara en mitad de una accion de rutina.

### Archivos probables

- `ONBOARDING_PLAN.md`
- `src/engine/onboarding/onboardingEngine.js`
- opcional: doc nueva `docs/onboarding_qa_matrix.md`

## 3. UI Surfacing v2

### Diagnostico

El juego ya tiene mecanicas interesantes, pero su lectura sigue un poco repartida.

`Mark`, `Flow`, `Bleed`, `Fracture`, `Momentum`, `Rage` y compania aparecen en varios lugares, pero no siempre con la misma jerarquia ni con el mismo formato mental.

Hoy pasa esto:

- en `Combat` hay mucho mejor surfacing que antes, pero todavia conviven muchas capas a la vez
- en `Heroe` algunas mecanicas aparecen como metricas de lectura rapida
- en `Talentos` aparecen otra vez como texto largo
- en `Intel` y `Biblioteca` aparecen como contexto, no como lectura viva

Eso genera profundidad, si, pero tambien ruido.

### Cambios propuestos

- Definir una gramatica unica para estados de build.
- Cada estado visible deberia seguir el mismo patron:
  `Nombre`, `stacks o valor`, `efecto corto`, `tooltip corto`.
- Usar categorias estables por color y tono visual:
  `ramp ofensivo`, `vulnerabilidad enemiga`, `damage over time`, `defensa`, `control`.
- En combate:
  buffs del jugador cerca del bloque del heroe
  debuffs del enemigo cerca del bloque del enemigo
- En `Heroe > Ficha`:
  mostrar solo los estados o escalados que hoy realmente definen la build.
- En `Talentos`:
  para cada nodo, mostrar `Actual` y `Proximo` en vez de tirar toda la explicacion primero.
- En copy y tooltip:
  una sola frase corta y, si hace falta profundidad, delegarla al `Glosario`.

### Lo que no haria

- No agregaria una nueva capa de iconografia enorme.
- No llenaria la UI de mini tooltips persistentes.
- No haria una enciclopedia inline en combate.

### Resultado esperado

- La build se lee mas rapido.
- El jugador entiende antes por que pega mas, aguanta mas o acelera.
- Baja la necesidad de memorizar nombres por fuera de la UI.

### Archivos probables

- `src/components/Combat.jsx`
- `src/components/Character.jsx`
- `src/components/Talents.jsx`
- `src/components/Skills.jsx`
- opcionalmente cualquier superficie de `Glosario`

## 4. Character clarity pass

### Diagnostico

`Heroe` ya esta mejor estructurado que antes, pero sigue teniendo mucho alto visual para acciones comunes.

La situacion actual, simplificada, es esta:

- `Ficha` tiene un buen header, pero despues separa demasiado `Lectura Rapida`, `Especializacion` e `Identidad de Build`.
- `Atributos` usa cards altas para cosas que podrian ser filas mas compactas.
- `Talentos` tiene buena profundidad, pero todavia pide mucho recorrido vertical y mucho texto por nodo.

### Propuesta para `Ficha`

- Compactar el header.
  Clase, spec, identidad y nivel pueden vivir en una misma banda mas apretada.
- Mantener las barras de `Vida` y `Experiencia`, pero sin tanta separacion vertical.
- Reagrupar `Lectura Rapida` en 3 grupos claros:
  `Ofensiva`, `Defensa`, `Build`.
- Unir `Especializacion` e `Identidad de Build` en un solo bloque:
  `Build actual`.
- Dejar los modifiers como chips cortos, no como segunda narrativa.

### Propuesta para `Atributos`

- Pasar de cards altas a filas compactas con esta estructura:
  `nombre`, `nivel`, `delta`, `costo`, `boton`.
- Separar atributos en dos grupos:
  `Combate`
  `Economia`.
- Poner `Fuerza`, `Vitalidad`, `Precision`, `Celeridad` primero.
- Dejar `Codicia` y `Sabiduria` como bloque secundario o colapsable.
- Mover `Lectura actual` mas arriba y mas corta:
  que responda rapido "que esta haciendo hoy esta build".

### Propuesta para `Talentos`

- Mantener la profundidad del arbol. No lo achicaria conceptualmente.
- Hacer el header sticky mas corto:
  `arbol`, `TP`, `nodos comprables`, `reset`.
- Agregar filtros simples:
  `Comprables`, `Activos`, `Todos`.
- En cada nodo:
  primera linea con `nombre`, `nivel`, `costo`
  segunda linea con `Actual`
  tercera linea con `Proximo`
- Dejar la descripcion larga en expand o tooltip, no como primer bloque de lectura.
- Colapsar o despriorizar visualmente nodos muy lejanos o tiers sin compras posibles.

### Resultado esperado

- Menos scroll para subir atributos.
- Mas claridad para leer el rol actual de la build.
- Mejor lectura de talentos sin bajar profundidad.

### Archivos probables

- `src/components/Character.jsx`
- `src/components/Skills.jsx`
- `src/components/Talents.jsx`
- posiblemente helpers de `classBuildStats`

## 5. Expedicion clarity pass

### Diagnostico

`ExpeditionView.jsx` ya toma una buena decision:
dejar visible solo `Combate / Mochila / Intel`.

El problema principal ya no esta en la navegacion de `Expedicion`.
Esta adentro de `Combat.jsx` y, en segundo lugar, en que `Intel` todavia tiene bastante lectura para una pantalla que deberia servir rapido.

### Propuesta para la capa `Expedicion`

- Mantener exactamente estas subvistas visibles:
  `Combate`, `Mochila`, `Intel`.
- No reintroducir `Forja` como subtab visible.
- Si `Mochila` necesita abrir `Crafting`, que sea accion contextual o sheet secundaria.

### Propuesta para `Combate`

- El primer viewport deberia mostrar solo esto:
  `tier y fase de run`
  `enemigo actual`
  `CTA de extraccion`
  `HP enemigo`
  `HP heroe`
  `estados criticos`
- El bloque de clase + XP hoy esta separado y suma alto vertical.
  Lo integraria al bloque del heroe o lo haria mucho mas fino.
- El intel del enemigo no deberia expandirse tanto dentro del bloque principal.
  Dejaria 2 o 3 chips y un `Ver intel`.
- La grilla de stats de combate deberia pasar a acordeon o panel colapsable.
- `Talentos activos` deberia arrancar colapsado por default.
- `Guidance strip` deberia ser una linea realmente corta, no un cuarto panel de lectura.
- El CTA de `Extraer al Santuario` deberia quedar muy visible sin obligar scroll.

### Propuesta para `Mochila`

- Menos badges simultaneos.
- Mejor comparacion de upgrade util.
- `Abrir Forja` o accion equivalente como CTA contextual, no como dominio nuevo.

### Propuesta para `Intel`

- Reducir el hero panel de arriba.
- El primer viewport de `Intel` deberia responder:
  `que objetivo puedo ir a buscar ahora`
  `que bosses ya tengo en ruta`
  `que power importante me falta`
- `Poderes legendarios` y `Familias reveladas` hoy tienen valor, pero pueden vivir mas abajo o en paneles colapsables.
- En `Biblioteca`, subir `investigaciones corriendo` y `claims` arriba del fold.
- Mantener clara la separacion mental:
  `Intel = tactico de la run`
  `Biblioteca = progreso persistente`

### Resultado esperado

- Menos ruido dentro de la run.
- Mejor lectura de riesgo y proximo paso.
- Menos scroll para pasar por `Combate -> Mochila -> Intel`.

### Archivos probables

- `src/components/ExpeditionView.jsx`
- `src/components/Combat.jsx`
- `src/components/Inventory.jsx`
- `src/components/Codex.jsx`

## 6. Ecos clarity pass

### Diagnostico

`Prestige.jsx` ya va en una buena direccion, sobre todo con ramas separadas y onboarding contextual.
Pero sigue habiendo mucha densidad de lectura en la cabecera y demasiada equivalencia visual entre capas que no tienen la misma prioridad.

Hoy conviven:

- resumen de ecos al extraer
- resumen de ecos disponibles
- bonos activos
- hitos de abismo
- ramas
- nodos

Todo eso es correcto como contenido, pero no como peso simultaneo.

### Cambios propuestos

- Arriba del fold, mostrar solo:
  `Ecos disponibles`
  `Ecos al extraer`
  `Momentum`
  `Record historico`
  `Compra o rama sugerida`
- Fusionar mejor el resumen de `Ecos disponibles` con `Bonos activos`.
  Hoy se sienten como dos paneles hermanos con demasiado peso parecido.
- Acortar el copy explicativo del header.
  La idea se entiende con una frase y un link mental al Glosario, no con tres bloques.
- Bajar el peso de `Hitos de Abismo` cuando el jugador todavia no esta en esa capa de decision.
  Puede quedar como franja compacta o panel colapsable hasta que de verdad sea central.
- Mantener las tabs horizontales de ramas.
  Esa parte esta bien orientada.
- En cada nodo:
  `Actual`
  `Proximo`
  `Costo`
  `Req`
  y descripcion larga secundaria.
- Agregar filtros:
  `Comprables`
  `Activos`
  `Todos`

### Lo que no haria

- No mezclaria `Ecos` con `Heroe`.
- No esconderia la profundidad de ramas.
- No sacaria `Abismo` del todo; solo le bajaria peso temprano.

### Resultado esperado

- La tab de `Ecos` deja de sentirse como una pared.
- Es mas facil entrar, invertir, salir.
- El jugador entiende antes que cambiar y por que.

### Archivos probables

- `src/components/Prestige.jsx`
- opcionalmente `src/engine/progression/prestigeEngine.js` solo si hace falta helper de resumen

## 7. Sanctuary clarity pass

### Diagnostico

Este es el frente con mas impacto.

`Santuario` ya tiene casi todos los ingredientes correctos:

- estado de expedicion
- CTA principal
- recursos
- `Listo ahora`
- `Operacion en curso`
- `Siguiente mejor paso`
- `Estaciones`
- `Claims`
- `Jobs en curso`
- `Infraestructura`
- `Taller`

El problema es que varias de esas capas cuentan la misma historia.

Hoy veo estas duplicaciones:

- `Listo ahora` y `Claims`
- `Operacion en curso` y `Jobs en curso`
- `Estaciones` y luego cards detalladas por estacion
- helper texts largos en la cabecera y en `Siguiente mejor paso`
- `Laboratorio` con mas peso del que necesita para cada sesion

### Regla madre para `Santuario`

`Santuario` debe ser una home operacional opinada.
No un dashboard neutral ni una lista larga de cards.

### Orden visual que propongo

1. `Cabecera compacta`
   Clase/spec/build, estado de la expedicion y CTA principal.

2. `Bandeja operacional`
   Un solo bloque arriba con:
   `Listo`
   `Corriendo`
   `Bloqueado por recurso`

3. `Claims arriba`
   Si hay algo para reclamar, vive aca. No mas abajo.

4. `Estaciones`
   Grid compacta de accesos con status y CTA.

5. `Taller`
   Solo si hay stash, decision o proyecto pendiente.

6. `Recursos`
   Chips compactos, no bloque protagonista.

7. `Detalle`
   Todo lo demas queda atras de `Ver detalle` o acordiones.

### Cambios puntuales que haria

- Fusionar `Listo ahora` con `Claims`.
  Si algo esta listo, eso es lo primero que conviene tocar. No hace falta contarlo dos veces.
- Fusionar `Operacion en curso` con `Jobs en curso`.
  Una sola cola operacional alcanza.
- Acortar fuerte `Siguiente mejor paso`.
  Titulo corto, una frase, un CTA. Nada mas.
- Bajar el texto de la primera card.
  La cabecera de Santuario hoy puede explicar demasiado. Quiero una sola linea de helper, no un mini ensayo.
- Hacer las cards de estaciones mucho mas compactas.
  `titulo`, `status`, `1 linea`, `CTA`.
- Mover el detalle largo de cada estacion a expand/collapse o sheet.
- Dejar `Taller` como bloque contextual.
  Si no hay stash ni decision pendiente, no deberia pedir tanto espacio.
- Dejar `Laboratorio` como estacion importante, pero no como panel gigante con demasiada narrativa.
- Mantener recursos visibles, pero sin robar tanto alto vertical.
- Si hay una expedicion activa, dejar una lectura muy obvia arriba:
  `Run activa`, `Tier`, `vidas`, `claim listo` si aplica.

### Lo que explicitamente haria con `claims arriba`

- Si hay claims, los pondria por encima de la grilla completa de estaciones.
- Si hay varios claims, mostraria solo los primeros mas importantes y un `ver todos`.
- No dejaria una segunda seccion `Claims` mas abajo.

### Lo que explicitamente haria con la "primer card con menos texto"

- Reducir la explicacion de contexto a una sola linea.
- Si el jugador necesita mas profundidad, que viva en el detalle de estacion o en Glosario.
- No reexplicaria ecos, extraccion, loops o persistencia en cada visita al Santuario.

### Wireframe sugerido

```text
SANTUARIO
[Clase / Spec / Build]      [Estado run]
[CTA principal]

LISTO AHORA
- Destileria lista
- 1 encargo listo
- Biblioteca: 1 estudio

CORRIENDO
- Destileria 08:12
- Altar 15:40
- Encargos 1/3

ESTACIONES
[Laboratorio] [Destileria]
[Biblioteca]  [Encargos]
[Taller]      [Altar]

RECURSOS
[Esencia] [Flux] [Tinta] [Polvo]

[Ver detalle]
```

### Resultado esperado

- Mucho menos scroll rutinario.
- Mucha menos repeticion.
- El jugador entra, reclama, lanza algo, sale.
- La sesion larga sigue existiendo, pero ya no se impone en cada visita.

### Archivos probables

- `src/components/Sanctuary.jsx`
- overlays asociados solo si hiciera falta ajustar entry points

## Orden recomendado de implementacion

Si despues de revisar esto me pides que lo aplique, yo lo haria en este orden:

1. `Docs alignment + QA matrix`
   Es la base para no trabajar a ciegas.

2. `Sanctuary clarity pass`
   Es el mayor retorno UX por esfuerzo.

3. `Expedicion clarity pass`
   Sobre todo `Combat` e `Intel`.

4. `UI Surfacing v2`
   Para unificar lenguaje visual de estados.

5. `Character clarity pass`
   Ficha, atributos y talentos.

6. `Ecos clarity pass`
   Cuando ya este mas alineada la lectura del resto del producto.

## Prioridad por impacto

### Alto impacto / bajo esfuerzo

- Alinear docs
- QA matrix de onboarding tardio
- Subir claims arriba en `Santuario`
- Fusionar `Claims` con `Listo ahora`
- Fusionar `Operacion en curso` con `Jobs en curso`
- Acortar la cabecera de `Santuario`
- Acortar `Siguiente mejor paso`

### Alto impacto / esfuerzo medio

- Compactar cards de estaciones
- Reordenar `Combat` para que el viewport inicial quede mucho mas fuerte
- Reagrupar `Heroe > Ficha`
- Pasar `Atributos` a filas compactas
- Compactar la cabecera de `Ecos`

### Alto impacto / esfuerzo alto

- Rediseñar lectura de nodos en `Talentos`
- Rediseñar lectura de nodos en `Ecos`
- Refinar `Intel` y `Biblioteca` para que el recorrido sea mas corto

## Criterios de aceptacion que usaria

- En mobile, cada tab principal responde su pregunta principal sin scroll.
- `Santuario` no tiene mas de una zona de `claims`.
- `Santuario` no tiene mas de una zona de `jobs corriendo`.
- El jugador puede hacer la rutina basica del hub con mucho menos scroll.
- `Expedicion` no vuelve a llenarse de subdominios secundarios.
- `Heroe` deja mas clara la build actual sin exigir leer tanto texto.
- `Ecos` permite entrar, decidir e invertir mas rapido.
- Ningun onboarding posterior a la primera compra de Ecos vuelve a forzar UI real.

## Cambios que no recomiendo ahora

- No abrir una nueva cirugia de tabs primarias.
- No fusionar `Heroe` con `Ecos`.
- No mover estaciones a navegacion top-level.
- No volver a `Registro`; `Mas` esta bien como framing.
- No intentar "resolver todo" metiendo mas cards resumen.
  El problema actual no es falta de resumen. Es exceso de superficies con peso parecido.

## Cierre

La direccion general ya esta buena.
Lo que falta no es inventar otro producto. Es hacer que el producto actual respire mejor.

Si tuviera que resumir toda esta propuesta en una sola linea, seria esta:

`menos paneles hermanos, mas prioridad; menos scroll rutinario, mas detalle opt-in`
