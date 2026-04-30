# Crafting Layout Plan - Forge Light

Fecha: 2026-04-29
Estado: auditoria y plan de layout. No implementar hasta resolver dudas abiertas.

## 0. Autoridad

Orden de decision para Crafting:

1. `uirefactor/nuevoDesign/UI Kit Forge Light.png`
2. `uirefactor/design2.md`
3. `uirefactor/design-system-implementation-plan.md`
4. `uirefactor/Crafting.png`
5. Codigo actual

Regla especifica para esta pantalla:

- El UI Kit Forge Light manda para componentes, bordes, botones, cards, rarezas, barras y estados.
- `uirefactor/Crafting.png` manda como referencia secundaria de layout, jerarquia y composicion.
- No seguir agregando polish visual hasta corregir layout.
- No cambiar logica de gameplay.
- No migrar toda la app.

## 1. Capturas Comparadas

Referencia secundaria de layout:

- `uirefactor/Crafting.png`

Implementacion actual revisada:

- `uirefactor/current/crafting-390x844.png`
- `uirefactor/current/crafting-430x932.png`
- `uirefactor/current/crafting-1280x800.png`

Nota de captura:

- `npm run ui:capture` genero capturas sin errores JS antes del ultimo ajuste de compactacion mobile.
- El ajuste de compactacion mobile posterior compilo, pero no quedo recapturado por el script en esa sesion.
- Por eso esta auditoria se enfoca en diferencias estructurales que siguen siendo validas aunque el alto haya variado algunos px.

## 2. Diagnostico General

El problema actual es layout, no polish visual.

La pantalla actual ya usa varios primitives Forge y algunos se ven razonablemente alineados al UI Kit, pero la composicion no sigue `Crafting.png`.

Problema principal:

- La referencia trata Forja como pantalla principal con header propio, recursos, bottom nav activo en Forja y CTA integrado.
- La app actual trata Forja como overlay dentro de Santuario.
- Esa diferencia de shell causa problemas de header, bottom nav, CTA tapado, recursos comprimidos y jerarquia poco clara.

Conclusion operativa:

Antes de seguir migrando componentes o tocando colores, hay que decidir el shell/layout de Forja.

## 3. Auditoria Por Zonas

### 3.1 Header superior / identidad del jugador

Referencia `Crafting.png`:

- Avatar grande circular a la izquierda.
- Nombre `Forjador`.
- Poder o rating global `1.234M` con icono de espadas.
- Recursos principales en la barra superior.
- Menu hamburguesa a la derecha.

Actual:

- Header de overlay con crest de forja.
- Texto `Forja del Santuario`.
- Boton `VOLVER` a la derecha.
- No hay avatar de jugador.
- No hay poder/rating global.

Diferencias:

- `contenido faltante`: avatar, poder/rating global, menu contextual.
- `layout incorrecto`: header de overlay no reproduce el header de pantalla de la referencia.
- `componente correcto pero mal ubicado`: `VOLVER` funciona, pero visualmente ocupa el lugar del menu de la referencia.

Riesgo:

- Si se mantiene como overlay, no va a parecer una pantalla principal de Forja.
- Si se convierte visualmente en pantalla, hay que resolver como vuelve a Santuario sin romper flujo.

### 3.2 Recursos

Referencia:

- Tres recursos principales grandes en una fila.
- Cada recurso tiene icono, valor y boton `+` integrado.
- Valores con alto peso visual.

Actual:

- Cuatro counters: Oro, Esencia, Polvo, Flux.
- En mobile se compactan demasiado y ocupan altura del header.
- No tienen boton `+`.

Diferencias:

- `contenido faltante`: boton `+` por recurso.
- `densidad/espaciado incorrecto`: en mobile los recursos se apilan/compactan y compiten con el titulo.
- `layout incorrecto`: los recursos actuales parecen toolbar secundaria, no header economico principal.

Decision pendiente:

- Definir si Forja muestra 3 recursos como referencia o 4 recursos por necesidad del juego.

### 3.3 Titulo FORJAR

Referencia:

- Bloque contextual debajo del header.
- Back chevron a la izquierda.
- Titulo grande `FORJAR`.
- Info icon junto al titulo.
- En la misma franja, a la derecha, aparece Entropia.

Actual:

- Titulo `FORJAR` existe.
- Back usa `<<` y queda mas chico/menos integrado.
- No hay info icon.
- Entropia cae como modulo separado, especialmente en mobile.

Diferencias:

- `contenido faltante`: info icon.
- `componente correcto pero mal ubicado`: titulo y entropia existen, pero no forman una sola franja como referencia.
- `densidad/espaciado incorrecto`: la card del titulo ocupa demasiado para lo que comunica.

### 3.4 Modulo de entropia

Referencia:

- Modulo compacto a la derecha del titulo.
- Icono de espiral/fuego.
- Label `ENTROPIA`.
- Valor `72 / 100`.
- Barra segmentada corta.
- Boton `+` cuadrado a la derecha.

Actual:

- Entropia usa counter + progress bar + boton `+`.
- En desktop queda a la derecha, pero demasiado ancho y separado.
- En mobile ocupa ancho completo debajo del titulo.
- Barra no reproduce segmentos del todo.

Diferencias:

- `componente correcto pero mal ubicado`: el contenido existe, pero la ubicacion no coincide.
- `componente visual no alineado al UI Kit`: barra deberia ser mas segmentada/forge y menos progress generica.
- `densidad/espaciado incorrecto`: en mobile el modulo consume altura critica.

### 3.5 Tabs MEJORAR / REFINAR / EXTRAER / TRANSMUTAR

Referencia:

- Cuatro tabs:
  - `MEJORAR`
  - `REFINAR`
  - `EXTRAER`
  - `TRANSMUTAR`
- Tabs anchas, pesadas, integradas en un rail.
- Active tab tiene glow/borde dorado inferior.

Actual:

- Cinco tabs:
  - `MEJORAR`
  - `AFINAR`
  - `REFORJAR`
  - `IMBUIR`
  - `EXTRAER`
- Orden diferente.
- Labels distintos.
- En mobile quedan apretadas.

Diferencias:

- `contenido faltante`: no existe `TRANSMUTAR` como tab.
- `layout incorrecto`: 5 tabs cambian la composicion y el peso visual.
- `densidad/espaciado incorrecto`: tabs de 5 columnas son demasiado pequenas en mobile.
- `componente correcto pero mal ubicado`: `FlTabs` esta bien como primitive, pero la estructura de modos no coincide con referencia.

Decision pendiente critica:

- Mantener 5 modos por gameplay o agruparlos visualmente en 4 tabs como referencia.

Mapeo posible si se usa 4 tabs:

- `MEJORAR` -> `upgrade`
- `REFINAR` -> `polish`
- `EXTRAER` -> `extract`
- `TRANSMUTAR` -> selector interno/secondary para `reforge` e `ascend`, o modo compuesto.

Riesgo:

- Agrupar `reforge` e `ascend` puede cambiar UX aunque no cambie logica.
- Mantener 5 modos reduce similitud con `Crafting.png`.

### 3.6 Item principal a la izquierda

Referencia:

- Card vertical alta y dominante.
- Arte del item ocupa la mayor parte de la card.
- Rareza clara arriba.
- Nivel `+12` grande sobre el arte.
- Nombre y poder abajo.
- Proporcion aproximada: card del item ocupa toda la altura del stage principal.

Actual:

- Card del item existe y usa asset real/fallback.
- En desktop queda menos alta que referencia.
- En mobile queda bastante reducida para que entre todo.
- El item es visible, pero menos protagonista.

Diferencias:

- `layout incorrecto`: item deberia ser una columna vertical mas dominante.
- `densidad/espaciado incorrecto`: en mobile el item se reduce demasiado para compensar otros bloques.
- `componente visual no alineado al UI Kit`: el frame/asset se acerca, pero la card no alcanza la presencia de rareza del ejemplo.

### 3.7 Resultado central de mejora

Referencia:

- Panel central alto, con fondo tipo portal/forja.
- Texto `MEJORA EXITOSA` centrado.
- Cambio `+12 >> +13` muy dominante.
- Poder anterior/nuevo debajo.
- Visual de green glow/altar ocupa el centro del stage.

Actual:

- Resultado existe y se ve funcional.
- En desktop queda ancho, pero altura menor que referencia.
- En mobile comparte fila con item y por eso se comprime.

Diferencias:

- `layout incorrecto`: panel central necesita mas altura y foco.
- `componente correcto pero mal ubicado`: contenido y estado success existen, pero el panel no domina como deberia.
- `densidad/espaciado incorrecto`: se sacrifico altura para meter CTA/stats.

### 3.8 Panel derecho material / probabilidad / coste

Referencia:

- Panel derecho vertical, igual de alto que el stage principal.
- Tres secciones apiladas:
  - Material principal.
  - Probabilidad de exito.
  - Costo.
- Cada seccion tiene icono grande, label y valor.

Actual:

- Desktop se acerca a ese layout.
- Mobile transforma el panel en fila horizontal de tres columnas.
- Labels se truncan: `MATERI...`, `PROBAB...`.

Diferencias:

- `layout incorrecto`: en mobile no deberia truncarse; conviene apilar vertical compacto o usar dos columnas mejor definidas.
- `densidad/espaciado incorrecto`: counters actuales no tienen espacio para labels.
- `componente correcto pero mal ubicado`: `FlResourceCounter` sirve, pero el panel debe controlar layout por breakpoint.

### 3.9 Track +0 / +5 / +10 / +15

Referencia:

- Track ancho debajo del stage.
- Nodos +0, +5, +10, +15.
- Marcador actual destacado `+13` como callout sobre la barra.
- Hitos visuales con rombos.
- Debajo aparece `Bonificacion de Hito`.
- Boton `Vista Previa` a la derecha.

Actual:

- Track existe con +0/+5/+10/+15.
- No hay marcador actual `+13` como callout.
- No hay `Bonificacion de Hito`.
- No hay `Vista Previa`.
- Barra es mas simple.

Diferencias:

- `contenido faltante`: marcador actual, bonificacion de hito, vista previa.
- `componente visual no alineado al UI Kit`: barra necesita composicion de track con nodos/callout, no solo progress bar.
- `layout incorrecto`: el track no tiene segunda fila de informacion.

### 3.10 Comparacion de estadisticas

Referencia:

- Dos paneles grandes:
  - `ESTADISTICAS ACTUALES`
  - `ESTADISTICAS NUEVAS`
- Cinco filas.
- Diferencias mejoradas con verde y flechas.
- Flecha central grande.

Actual:

- Dos paneles existen.
- En mobile empujan el CTA hacia abajo.
- En desktop quedan muy bajos/anchos y pierden la proporcion de referencia.
- Algunas filas no muestran indicador de mejora porque los valores no cambian en la semilla actual.

Diferencias:

- `layout incorrecto`: stats deberian estar debajo del track, pero no deben robar visibilidad al CTA.
- `densidad/espaciado incorrecto`: mobile requiere limite mas estricto o layout colapsable.
- `componente correcto pero mal ubicado`: `FlStatRow` funciona, pero el bloque necesita mejor posicion/proporcion.

### 3.11 CTA principal MEJORAR

Referencia:

- Zona de acciones al final del panel principal.
- Izquierda: `MEJORA MAXIMA`.
- Centro: CTA grande `MEJORAR` con coste dentro.
- Arriba del CTA: sello `Garantizado en +15`.
- Derecha: checkbox `Usar automatico` y gear.
- CTA queda visible antes del feedback y antes del bottom nav.

Actual:

- CTA existe como `MEJORAR ITEM`.
- En desktop esta a la derecha de `MEJORA MAXIMA`, no centrado como referencia.
- En mobile queda parcialmente tapado o muy cerca del bottom nav.
- No existe `Garantizado en +15`.
- No existe `Usar automatico` ni gear.

Diferencias:

- `layout incorrecto`: CTA debe ser centro visual, no columna derecha.
- `contenido faltante`: garantia, auto, gear.
- `componente correcto pero mal ubicado`: `FlButton primary` es correcto, pero su zona de acciones no.

### 3.12 Feedback de exito

Referencia:

- Panel inferior separado.
- Check verde grande.
- Texto `¡Mejora Exitosa!`.
- Descripcion del item mejorado.
- Boton `VER DETALLES`.

Actual:

- Feedback depende de crafting log.
- En capturas principales no se ve como bloque reservado.
- No hay boton `VER DETALLES`.

Diferencias:

- `contenido faltante`: panel persistente/estado de exito, boton detalles.
- `layout incorrecto`: feedback deberia vivir debajo de CTA como bloque propio.

### 3.13 Bottom nav

Referencia:

- Bottom nav de pantalla principal.
- Tab activa: `FORJAR`.
- Items visibles: Ciudad, Heroe, Inventario, Forjar, Talentos, Mas.

Actual:

- Bottom nav global de la app.
- Tab activa: `SANTUARIO`.
- El CTA compite con bottom nav en mobile.

Diferencias:

- `layout incorrecto critico`: la pantalla de Forja no se percibe como destino activo.
- `contenido faltante`: no hay tab `FORJAR` activa.
- `componente correcto pero mal ubicado`: bottom nav general funciona, pero no corresponde al estado visual de referencia.

## 4. Problemas De Layout Priorizados

### P0 - Bloqueantes

1. Definir si Forja es pantalla principal visual o overlay visual.
2. Resolver bottom nav para que no tape CTA.
3. Definir 4 tabs vs 5 tabs.
4. Hacer que CTA principal sea visible y centrado en mobile.
5. Reubicar Entropia en la franja de titulo sin consumir altura excesiva.

### P1 - Alta prioridad

1. Reproporcionar stage principal: item izquierda, resultado centro, panel derecho.
2. Ajustar panel derecho mobile para evitar labels truncados.
3. Agregar marcador actual del track `+13` y fila de hitos/vista previa.
4. Reducir impacto de stats en mobile.

### P2 - Media prioridad

1. Agregar feedback de exito inferior.
2. Agregar garantia `Garantizado en +15` si aplica.
3. Agregar `Usar automatico` y gear si existen o dejar placeholders no interactivos.
4. Mejorar avatar/identidad del header.

## 5. Layout Objetivo Propuesto

### 5.1 Desktop / 1280x800

Estructura:

```txt
[Header jugador + recursos + menu/volver]
[FORJAR + info                                      ENTROPIA]
[Tabs: MEJORAR | REFINAR | EXTRAER | TRANSMUTAR]
[Item card] [Resultado central] [Material/Prob/Costo]
[Track +0 +5 +10 +15 + marcador actual]
[Bonificacion de Hito                         Vista Previa]
[Stats actuales] [>>] [Stats nuevas]
[Mejora Maxima] [Garantia + CTA Mejorar] [Auto + Gear]
[Feedback exito / detalles]
[Bottom nav]
```

Proporciones sugeridas:

- Header superior: 72-96px.
- Titulo + Entropia: 72-92px.
- Tabs: 70-78px.
- Stage principal: 300-360px.
- Track + hito: 92-120px.
- Stats: 210-250px.
- CTA: 92-120px.
- Feedback: 100-130px.

Nota:

- En desktop la pantalla de referencia es mas alta que 800px, asi que si viewport real es 1280x800 debe haber scroll o una version compacta.
- No forzar todo a entrar en 800px si eso destruye la jerarquia.

### 5.2 Mobile / 430x932

Objetivo:

- CTA visible o casi visible sin quedar tapado por bottom nav.
- Stage principal con item + resultado visibles.
- Panel derecho legible.

Estructura propuesta:

```txt
[Header compacto jugador/forja]
[Recursos en fila horizontal compacta]
[FORJAR + Entropia compacto]
[Tabs 4 columnas]
[Item] [Resultado]
[Panel material/prob/costo en 1 columna compacta o 3 rows]
[Track]
[Stats compactas max 3 rows]
[CTA sticky/local arriba del bottom nav]
[Feedback exito si existe]
[Bottom nav o nav oculto]
```

Reglas mobile:

- No truncar labels importantes como Material/Probabilidad/Costo.
- No dejar CTA debajo del bottom nav.
- Si bottom nav sigue visible, reservar padding inferior suficiente.
- Si Forja es overlay, considerar ocultar bottom nav mientras overlay esta abierto.

### 5.3 Mobile / 390x844

Objetivo:

- Priorizar accion y estado.
- No intentar copiar todo el desktop.

Estructura propuesta:

```txt
[Header ultra compacto]
[FORJAR + Entropia]
[Tabs 4 columnas compactas]
[Item + Resultado]
[Cost summary compacto]
[Track compacto]
[CTA sticky/local]
[Stats bajo fold]
```

Regla:

- En 390x844, stats completas pueden quedar debajo del fold.
- CTA no puede quedar debajo del fold si la accion es el objetivo principal.

## 6. Fases De Correccion Solo Layout

### Fase A - Decisiones de shell

Objetivo:

- Resolver si Forja se comporta como pantalla o overlay visual.

Tareas:

- Elegir bottom nav visible/oculto.
- Elegir si el header es de jugador o de estacion.
- Definir comportamiento de `VOLVER`.

No tocar:

- Estilos finos.
- Rarezas.
- Animaciones.

### Fase B - Header + titulo + entropia

Objetivo:

- Reproducir la jerarquia superior de `Crafting.png`.

Tareas:

- Header superior con identidad y recursos.
- Titulo `FORJAR` con back/info.
- Entropia en la misma franja.

Criterio de exito:

- En 430 mobile, header + titulo + entropia no deben consumir mas de 22-26% de la altura visible.

### Fase C - Tabs

Objetivo:

- Resolver 4 tabs vs 5 tabs.

Tareas:

- Si se aprueban 4 tabs, mapear modos internos.
- Si se mantienen 5 tabs, aceptar divergencia con referencia y diseñar tabs mas legibles.

Criterio de exito:

- No hay tabs truncadas.
- La tab activa se entiende en menos de 1 segundo.

### Fase D - Stage principal

Objetivo:

- Alinear item, resultado y panel derecho con referencia.

Tareas:

- Desktop: 3 columnas con alturas alineadas.
- Mobile: item + resultado en primera fila, panel derecho legible debajo.
- Evitar que material/prob/costo trunquen texto.

Criterio de exito:

- En mobile se ve item, resultado y coste sin texto cortado.

### Fase E - Track + stats + CTA

Objetivo:

- Reordenar seccion inferior para que CTA sea foco.

Tareas:

- Track con marcador actual.
- Fila de bonificacion/vista previa.
- Stats compactas.
- CTA centrado y visible.

Criterio de exito:

- En 430x932 el CTA no queda tapado por bottom nav.
- En desktop el CTA queda centrado como referencia.

### Fase F - Feedback

Objetivo:

- Agregar feedback de exito como bloque de layout, no como detalle accidental.

Tareas:

- Panel inferior con check, texto y accion detalles.
- Ocultar o colapsar si no hay evento reciente.

Criterio de exito:

- Cuando hay log/resultado reciente, el feedback aparece bajo CTA sin romper layout.

## 7. Dudas Abiertas

### Dudas bloqueantes

1. Forja debe seguir siendo overlay de Santuario o debe sentirse como pantalla principal completa?

Impacto:

- Si sigue como overlay, hay que ocultar bottom nav o reservar espacio para CTA.
- Si pasa a pantalla principal, el bottom nav puede marcar `FORJAR`, pero hay que revisar navegacion global.

DECISIÓN: Sigue como  Overlay. No cambiemos los botones del bottom nav, por lo menos no en función. En estética si, podemos usar los iconos nuevos que tenemos en assets y usar los primitives si es que ya los tenemos. Sino esperar a llegar a ese Slice.

2. En Forja, el bottom nav debe verse?

Opciones:

- Ocultarlo mientras Forja esta abierta.
- Mostrarlo pero marcar `FORJAR` activo.
- Mostrarlo como esta, con `SANTUARIO` activo. Esta opcion no se recomienda.

Decisión: Mostrarlo como está, como Santuario. Forja es una estación del Santuario.

3. Tabs: mantenemos 5 modos actuales o adaptamos visualmente a 4 tabs como `Crafting.png`?

Opciones:

- Mantener 5: menor riesgo gameplay, menor parecido a referencia.
- Usar 4: mayor parecido, requiere mapear `reforge` + `ascend` a `TRANSMUTAR` o una sub-interfaz.

Decisión: Mantener las mismas 5.

4. Si usamos 4 tabs, que representa exactamente `TRANSMUTAR`?

Opciones:

- `reforge` solamente.
- `ascend` solamente.
- Agrupa `reforge` e `ascend` con selector interno.
- Requiere renombrar algun concepto del juego.

Decisión: Mantenemos 5.

5. El recurso `Flux` debe mostrarse en header de Crafting?

Referencia muestra 3 recursos. Actual usa 4.

Opciones:

- Mostrar 3 recursos principales y mover Flux al panel/contexto que lo requiera.
- Mostrar 4 recursos y aceptar divergencia.
- Mostrar 3 visibles + overflow/menu.

Decisión: Mostrar 4 y aceptar divergencia, después en futuro podemos sacar lo que sobre.

6. El CTA principal debe ser sticky en mobile?

Opciones:

- Sticky dentro del overlay/pantalla sobre bottom nav.
- No sticky, pero layout compacto para que quede visible.
- Debajo de stats como referencia, aceptando scroll. Esta opcion no se recomienda para 390x844.

Decisión: Layout compacto para que quede visible.

### Dudas de contenido

7. Existe dato real para `Garantizado en +15`?

Si no existe:

- No inventar feature.
- Se puede mostrar un label informativo derivado de max level si ya existe.

Decisión: No, no existe.

8. Existe accion real para `Usar automatico`?

Si no existe:

- No agregar feature nueva.
- Se puede reservar espacio visual deshabilitado solo si UX lo justifica, pero mejor evitarlo hasta tener logica.

Decisión: No, no existe, sacalo tranquilo.

9. Existe accion real para `Vista Previa`?

Si no existe:

- No agregar boton funcional falso.
- Puede ser una accion secundaria futura, no parte del primer fix.

Decisión: No, tranquilo, sacalo, es lo mismo que las estadísticas de la derecha.

10. El feedback `Ver detalles` tiene destino real?

Opciones:

- Abrir log de forja.
- Expandir detalle inline.
- No mostrar boton hasta definir destino.

Decisión: No mostrar.

11. Header debe decir `Forjador` o `Forja del Santuario`?

Referencia usa `Forjador`; app actual usa `Forja del Santuario`.

Opciones:

- Header global: `Forjador`.
- Header contextual: `Forja del Santuario`.
- Combinado: kicker `Forjador`, titulo `Forja del Santuario`.

Decisión: Con que sólo diga Forja en el contextual, está ok. En el global va a estar el avatar y el nombre de usuario cuando lo tenga + 2 o 3 recursos.

### Dudas responsive

12. En 390x844, que debe ser visible sin scroll?

Propuesta minima:

- Header/titulo.
- Entropia.
- Tabs.
- Item + resultado.
- Costo resumido.
- CTA.

Decisión: En lo posible... todo eso. sería un golazo, sino tendríamos que hacer el botón sticky arriba del bottom nav.

13. Las stats completas pueden quedar bajo fold en mobile?

Recomendacion:

- Si. En mobile, accion y resultado importan mas que ver todas las stats.

Decisión: Si, dale.

14. Panel derecho en mobile debe ser horizontal o vertical?

Recomendacion:

- Vertical compacto si los labels se truncan.
- Horizontal solo si cada celda mantiene label legible.

Decisión: Vertical compacto.

15. El item principal y resultado en mobile deben compartir fila?

Recomendacion:

- Si para 430x932.
- En 390x844 podria ser item compacto + resultado compacto, manteniendo ambos visibles.

Decisión: Si. Deberíamos buscar que si.

## 8. No Hacer Todavia

- No agregar mas glow, sombras o bordes.
- No crear nuevos primitives.
- No migrar Inventario hasta cerrar layout de Crafting o pausar Crafting formalmente.
- No borrar CSS legacy grande sin una fase de cleanup separada.
- No cambiar logica de crafting.
- No inventar features para llenar `Vista Previa`, `Usar automatico` o `Ver detalles`.

## 9. Siguiente Paso Recomendado

Antes de editar codigo, responder estas decisiones minimas:

1. Overlay o pantalla principal visual?
2. Bottom nav visible, oculto o activo en Forja?
3. 4 tabs como referencia o 5 tabs por gameplay?
4. CTA sticky en mobile o layout compacto no-sticky?
5. Header con identidad de jugador, estacion o combinado?

Con esas respuestas, el primer slice de correccion deberia tocar solo layout de Crafting:

- shell/header;
- titulo + entropia;
- tabs;
- CTA/bottom spacing.

No deberia tocar colores ni assets salvo lo estrictamente necesario para que el layout respire.

## 10. Implementacion Aplicada - 2026-04-29

Estado: aplicada primera correccion de layout despues de responder dudas.

Decisiones usadas:

- Forja sigue como overlay/estacion de Santuario.
- Bottom nav queda visible como Santuario.
- Se mantienen 5 tabs.
- Se mantienen 4 recursos.
- CTA no sticky; se prioriza layout compacto.
- Sin features inexistentes: no garantia `+15`, no auto, no vista previa, no ver detalles.

Cambios aplicados:

- Header contextual ahora dice `Forja`.
- Header superior compacta recursos y evita que la identidad ocupe tanto alto.
- `FORJAR` y Entropia quedan en la misma franja.
- Tabs quedan horizontales debajo del titulo.
- Desktop conserva 3 columnas: item, resultado, panel derecho.
- Mobile conserva item + resultado en fila.
- Panel derecho mobile pasa a vertical compacto para evitar labels truncados.
- CTA `MEJORAR` queda centrado/dominante.
- En mobile, CTA se muestra antes de stats para que no quede tapado por bottom nav; stats pueden caer bajo fold segun Decision 13.

Validacion:

- `npm run build` paso.
- `npm run ui:capture` genero capturas nuevas sin errores JS.

Capturas generadas:

- `uirefactor/current/crafting-390x844.png`
- `uirefactor/current/crafting-430x932.png`
- `uirefactor/current/crafting-1280x800.png`

## 11. Reconstruccion de composicion - 2026-04-29

Estado: aplicada segunda correccion de layout con `Crafting.png` como referencia de composicion y UI Kit como autoridad visual.

Decisiones confirmadas:

- Se mantienen los 5 modos funcionales actuales: `Mejorar`, `Afinar`, `Reforjar`, `Imbuir`, `Extraer`.
- Forja sigue siendo overlay de Santuario.
- Bottom nav conserva las 5 tabs funcionales actuales y queda visible/consistente.
- El header superior del overlay simula el header global: avatar/identidad a la izquierda, recursos al centro/derecha y menu visual a la derecha.

Cambios aplicados:

- Header de overlay: avatar `Heroe`, nombre/clase y recursos compactos.
- Fila contextual: back + `FORJAR` + info icon, con modulo `ENTROPIA` a la derecha.
- Tabs quedan inmediatamente debajo de la fila contextual.
- Main area queda ordenada en tres bloques: item, resultado y material/probabilidad/coste.
- En mobile se conserva el orden visual de esos tres bloques sin mezclar con track/stats/CTA.
- Track `+0`, `+5`, `+10`, `+15` queda debajo del main area.
- Stats quedan debajo del track.
- CTA principal queda debajo de stats, centrado y dominante.
- El feedback real queda debajo del CTA cuando existe log de crafting.

Validacion:

- `npm run build` paso.
- `npm run ui:capture` genero capturas nuevas sin errores JS.

Capturas revisadas:

- `uirefactor/current/crafting-390x844.png`
- `uirefactor/current/crafting-430x932.png`
- `uirefactor/current/crafting-1280x800.png`

Riesgo residual:

- Debajo del showcase Forge sigue existiendo la seccion legacy `Mesa de trabajo` para seleccion/flujo actual. No se oculto para no romper capacidad de seleccion ni logica existente.
- La referencia usa 4 tabs; se mantienen 5 por decision funcional.
- El feedback de exito no se fuerza si no hay `craftingLog`; no se inventa contenido.

## 12. Correccion profunda de header, tabs, feedback y nav - 2026-04-29

Estado: aplicada iteracion posterior a auditoria comparativa.

Cambios aplicados:

- `App.jsx` ahora usa header global Forge mas compacto con avatar/level, nombre de heroe, poder derivado y recursos con assets `icons/system`.
- Bottom nav conserva las 5 tabs funcionales, pero usa assets de `public/assets/icons/system` mediante `FlAsset` y styling facetado/glow.
- Tabs de Crafting usan los 5 PNG nuevos `icon_forge_*`:
- `upgrade`: `icon_forge_ember_hammer.png`
- `polish`: `icon_forge_temper_tongs.png`
- `reforge`: `icon_forge_anvil_spark.png`
- `ascend`: `icon_forge_furnace_core.png`
- `extract`: `icon_forge_blueprint_stamp.png`
- Se retiro el plus visual del modulo Entropia.
- Resultado central queda neutral por defecto (`VISTA PREVIA`).
- Al detectar nuevo `craftingLog`, el resultado central muestra feedback temporal:
- success: `MEJORA EXITOSA` en verde.
- error/bloqueo: `ACCION FALLIDA` en rojo.
- Luego vuelve automaticamente a neutral.
- Se oculto la seccion legacy `Mesa de trabajo` y el log legacy visible; el CTA canonical queda en el showcase.
- El track de mejora suma badge flotante del nivel actual (`+13` en la captura semilla).
- En mobile el panel material/probabilidad/coste baja debajo de item + resultado para evitar texto cortado.

Validacion:

- `npm run build` paso.
- `npm run ui:capture` paso sin errores JS.
- `git diff --check` paso para archivos tocados.

Capturas revisadas:

- `uirefactor/current/crafting-390x844.png`
- `uirefactor/current/crafting-430x932.png`
- `uirefactor/current/crafting-1280x800.png`
- `uirefactor/current/sanctuary-390x844.png`
- `uirefactor/current/combat-390x844.png`

Riesgo residual:

- La lista `Items` sigue visible debajo del showcase para no eliminar seleccion de item. Puede migrarse a selector compacto/drawer en un slice posterior.
- El header de overlay de Crafting todavia duplica parte de la identidad global porque el overlay tapa el header real de `App.jsx`.
- El feedback temporal depende de nuevas entradas en `craftingLog`; no se inventan eventos si no hay accion.
