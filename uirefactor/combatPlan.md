# Combat Forge Light Plan

Fecha: 2026-04-28
Estado: plan de correccion para acercar `src/components/Combat.jsx` a `uirefactor/Combat.png`

## 1. Objetivo

Reencauzar la pantalla de combate hacia la referencia `uirefactor/Combat.png` sin seguir achicando elementos a ciegas.

La tercera captura (`uirefactor/Screenshot3.png`) muestra que el problema principal ya no es un valor puntual de `font-size`, `height` o `width`. El layout actual conserva estructura de app/panel anterior:

- Subtabs horizontales `Combate / Mochila / Intel` ocupan espacio vertical critico.
- La escena de combate sigue contenida en una card grande.
- El tier, la barra del enemigo, el stage y las stats compiten dentro de un bloque muy alto.
- El HUD del jugador y el enemigo ya estan mejor ubicados, pero no respetan todavia el presupuesto visual de la referencia.
- Los paneles inferiores casi no aparecen en el viewport actual, mientras que en `Combat.png` la escena deja lugar a stats, ingresos y log.

Meta:

- Mantener logica actual de combate.
- Mantener flujo funcional actual.
- Cambiar estructura visual y CSS para que la pantalla se parezca a `Combat.png`.
- Usar `uirefactor/design.md` y `uirefactor/ForgeLightPlan.md` como soporte, pero la captura manda si hay conflicto.
- No usar `stitch/` como fuente visual.

## 2. Fuentes

Fuentes primarias:

- `uirefactor/Combat.png`
- `uirefactor/Screenshot3.png`
- `uirefactor/design.md`, seccion `16. Screen contract: Combat`
- `uirefactor/ForgeLightPlan.md`, seccion `Combat`

Archivos actuales relevantes:

- `src/components/ExpeditionView.jsx`
- `src/components/ui/SubtabDock.jsx`
- `src/components/Combat.jsx`
- `src/styles/responsive.css`
- `src/components/icons/ForgeIcon.jsx`
- `src/data/combatVisuals.js`

## 3. Diagnostico De Screenshot3

Viewport observado:

- `Screenshot3.png`: 653 x 860.
- `Combat.png`: 1024 x 1536.

Desvios principales contra referencia:

1. La barra `Combate / Mochila / Intel` no existe en `Combat.png`.
2. Esa barra aparece como dock fijo encima del bottom nav y consume aproximadamente 60 px.
3. En un viewport de 860 px, 60 px equivalen a casi 7% de la pantalla. Es demasiado para una navegacion secundaria.
4. `Combat.png` usa side actions cuadrados alrededor del campo de batalla, no tabs horizontales.
5. La escena actual termina actuando como panel/card con bordes grandes; la referencia actua como mundo/HUD.
6. El tier track actual todavia se siente demasiado ancho y alto para mobile.
7. La barra de HP enemiga todavia pesa demasiado y esta demasiado separada del enemy art.
8. El stage actual deja pocas secciones inferiores visibles antes del bottom nav.
9. El header global de la app actual ocupa menos que antes, pero todavia hay que presupuestarlo junto con la escena.
10. Las stats inferiores actuales aparecen como cards separadas grandes; en `Combat.png` son una banda compacta.

Conclusion:

Antes de seguir calibrando detalles, hay que cambiar la composicion vertical. Si se mantiene el subtab horizontal fijo y el main panel como card grande, cualquier ajuste va a seguir pareciendo fuera de lugar.

## 4. Contrato Visual Deseado

La pantalla debe leerse en capas:

1. Header global.
2. Campo de combate con fondo ilustrado.
3. Tier track integrado arriba del campo.
4. HP enemigo encima del enemigo.
5. Estados bajo HP enemigo.
6. Floating damage encima del enemigo.
7. HUD jugador abajo a la izquierda, sobre el mundo.
8. Acciones laterales cuadradas.
9. Control auto/velocidad abajo a la derecha.
10. Banda de stats compacta.
11. Banda de ingresos compacta.
12. Log de combate.
13. Bottom nav.

El campo de combate debe parecer una escena, no una card que contiene otra card.

## 5. Presupuesto De Altura Para Viewport 653x860

Este presupuesto no pretende meter todo `Combat.png` completo en una pantalla corta, pero si conservar proporciones y evitar que la escena tape todo.

Presupuesto objetivo aproximado:

| Bloque | Altura objetivo | Nota |
|---|---:|---|
| Header global | 64-72 px | Avatar, recursos, menu |
| Campo de combate completo | 410-455 px | Tier, HP enemigo, enemy art, HUD jugador, side actions |
| Stats compactas | 72-88 px | 4 stats en banda, no cards altas |
| Ingresos compactos | 70-86 px | Oro, XP, esencia |
| Log preview | 105-135 px | Visible al hacer scroll leve si no entra |
| Bottom nav | 76-84 px | Ya existe, no debe ser tapado por subtabs |

Restriccion clave:

- No debe existir un subtab horizontal fijo adicional en combate mobile.

Si el contenido total excede 860 px, esta bien que haya scroll. Lo que no esta bien es que la primera pantalla visible sea casi toda escena/card y subtabs.

## 6. Presupuesto De Ancho Para Viewport 653px

Proporciones objetivo:

| Elemento | Ancho objetivo |
|---|---:|
| Tier track | 250-290 px |
| Barra HP enemiga | 300-340 px |
| Icono skull HP | 34-42 px |
| Side action square | 52-64 px |
| Player HUD | 250-305 px |
| Auto control | 92-118 px |

Regla:

- Usar `clamp()` y variables CSS, no tamanios absolutos grandes.
- El ancho maximo desktop puede ser mayor, pero mobile debe quedar limitado por viewport.

## 7. Fase 0 - Congelar Criterio De Comparacion

Objetivo:

Definir que se considera "mas parecido" antes de tocar mas CSS.

Acciones:

- Usar `Combat.png` como target.
- Usar `Screenshot3.png` como estado actual.
- Descartar ajustes basados solo en "achicar un poco".
- Comparar por bloques: header, field, tier, enemy HP, side actions, player HUD, stats, income, log.

Checklist:

- La pantalla no debe evaluarse solo por si entra mas contenido.
- Debe evaluarse por si la composicion empieza a parecerse a `Combat.png`.
- La escena debe tener menos borde/card y mas fondo ambiental.

## 8. Fase 1 - Reemplazar Subtabs Por Side Actions

Problema:

`ExpeditionView.jsx` renderiza `SubtabDock` para `combat`, `inventory` y `codex`. En mobile, `SubtabDock` queda fixed encima del bottom nav. Esto no existe en `Combat.png` y consume mucho alto.

Objetivo:

En mobile y cuando `resolvedSubview === "combat"`, ocultar el subtab horizontal y convertir `Mochila` e `Intel` en botones cuadrados laterales estilo `Combat.png`.

Implementacion propuesta:

1. En `ExpeditionView.jsx`, detectar `isMobile && isCombatSubview`.
2. No renderizar `SubtabDock` en ese caso.
3. Crear acciones compactas:
   - `Mochila`: abre `inventory`.
   - `Intel`: abre `codex`.
4. Pasar esas acciones a `Combat` como prop, por ejemplo `sideActions`.
5. Renderizarlas dentro del shell de combate como columna lateral.

Alternativa si se quiere menor cambio:

- Renderizar una capa `ExpeditionCombatSideActions` desde `ExpeditionView.jsx` como sibling de `Combat`.
- Esta alternativa evita tocar props de `Combat`, pero complica posicionamiento.

Recomendacion:

- Pasar `sideActions` a `Combat`. El posicionamiento pertenece al campo de combate, no al wrapper de expedicion.

Primer mapeo visual:

- `Mochila`: icono `bag` o `loot`.
- `Intel`: icono `scroll`, `compass` o `mark`.
- Badge de upgrades en `Mochila` si existe.

Ubicacion inicial:

- Mobile: right rail dentro del campo de combate, debajo/por fuera de la barra HP enemiga.
- Si bloquea al enemigo, dividir:
  - izquierda: `Intel`
  - derecha: `Mochila`

Criterio de aceptacion:

- `Screenshot3` nuevo no debe mostrar la barra `Combate / Mochila / Intel`.
- `Mochila` e `Intel` deben aparecer como botones cuadrados laterales.
- El bottom nav no debe tener un dock secundario encima.
- La pantalla gana al menos 55-65 px utiles.

## 9. Fase 2 - Reestructurar Shell De Combate

Problema:

El `combat-main-panel` actual sigue funcionando como card contenedora. En `Combat.png`, el background y el enemigo dominan el area; los HUDs se montan encima.

Objetivo:

Separar claramente:

- `combat-world`: escena visual.
- `combat-hud-layer`: HUDs sobre escena.
- `combat-report-layer`: stats, income, log.

Acciones:

- Reducir padding del main panel.
- Eliminar sensacion de card interna pesada del stage.
- Hacer que el background de combate llegue visualmente al borde del area.
- Mover bordes fuertes a HUDs puntuales, no a toda la escena.
- Usar `min-height` y `max-height` por viewport para controlar la escena.

CSS esperado:

- `.combat-main-panel` deja de imponer alto por contenido.
- `.combat-enemy-stage` pasa a tener alto calculado:
  - mobile corto: `clamp(360px, 52vh, 455px)` para el campo completo, no para solo el enemigo.
  - si el header global es alto, bajar a `clamp(330px, 49vh, 430px)`.

Criterio de aceptacion:

- El campo se ve como escenario.
- No hay una card grande dentro de otra card.
- El bloque completo de combate no supera aproximadamente 455 px en viewport 653x860.

## 10. Fase 3 - Tier Track

Estado deseado:

- Cinco nodos.
- El quinto es boss con skull.
- La linea dorada llena hasta el nodo actual, no a un ritmo independiente.
- El tier track es fino y horizontal, no un bloque protagonista.

Problemas actuales:

- El fill puede no coincidir visualmente con los nodos.
- El track se siente grande para el viewport.
- La navegacion `prev/next` agrega ancho y peso.

Acciones:

- Calcular fill por indice de nodo, no por porcentaje abstracto.
- Usar `currentNodeIndex` de 0 a 4.
- Fill:
  - nodo 1: 0%
  - nodo 2: 25%
  - nodo 3: 50%
  - nodo 4: 75%
  - boss: 100%
- Ajustar rail para que arranque y termine en el centro de nodos.
- Reducir botones `prev/next` a 30-34 px.
- Track mobile: `width: clamp(238px, 43vw, 290px)` si esta dentro de una escena ancha.

Criterio de aceptacion:

- El fill termina exactamente bajo el nodo activo.
- El quinto nodo tiene skull y tono boss.
- El tier no se come el alto de la escena.

## 11. Fase 4 - Enemy HUD

Estado deseado:

- Nombre centrado sobre HP.
- Barra HP directamente arriba del enemigo.
- Skull a la izquierda integrado, sin taparse con la barra.
- Estados como iconos bajo HP.
- Texto de HP legible sobre o dentro de la barra.

Problemas actuales:

- La barra todavia parece muy ancha/alta.
- El skull puede sentirse pegado o competir con la barra.
- La separacion vertical con el enemigo todavia no replica la captura.

Acciones:

- Limitar enemy HUD a 300-340 px en mobile actual.
- Cambiar la barra a forma mas fina:
  - height 13-16 px.
  - meta compacta encima o dentro del marco.
- Ajustar skull:
  - 38-42 px.
  - offset negativo controlado, pero no encima de la barra.
- Colocar status icons inmediatamente debajo:
  - 24-28 px cada uno.
  - gap 6 px.

Criterio de aceptacion:

- HP enemigo se lee antes que stats inferiores.
- La barra no tapa skull ni queda debajo del skull.
- Estados quedan bajo la barra como en `Combat.png`.

## 12. Fase 5 - Enemy Art Y Floating Damage

Estado deseado:

- El enemigo ocupa el centro visual.
- El daño flota encima del enemigo, no en zonas vacias.
- Los criticos son grandes pero no rompen layout.

Acciones:

- Definir escala por enemigo en `src/data/combatVisuals.js`.
- Para viewport corto, usar clase compacta:
  - enemy image max-height 190-240 px segun asset.
  - stage padding superior reservado para tier/HP.
  - stage padding inferior reservado para player HUD.
- Recentrar floating damage:
  - daño normal: `top: 32-42%`.
  - critico: `top: 38-48%`.
  - heal del jugador: cerca de player HUD, no sobre enemy HP.

Criterio de aceptacion:

- Los numeros aparecen sobre el cuerpo del enemigo.
- Enemigo no empuja stats fuera del primer viewport.
- Diferentes enemigos no rompen la escala.

## 13. Fase 6 - Player HUD

Estado deseado:

- Abajo a la izquierda dentro de la escena.
- Avatar/portarretrato circular.
- HP rojo y recurso azul debajo.
- Cooldowns/estados del jugador debajo o cerca.
- No colisiona con bottom nav.

Problemas actuales:

- Esta mejor que antes, pero el alto total de la escena lo hace competir con stats.
- Puede quedar demasiado bajo si el stage crece.

Acciones:

- Mantenerlo absolute dentro de la escena.
- En mobile corto:
  - portrait 42-48 px.
  - barras 160-210 px.
  - status icons 22-26 px.
- Crear variante `combat-forge-player-hud--compact`.
- Si el viewport es muy corto, ocultar labels secundarios y dejar solo valores.

Criterio de aceptacion:

- El player HUD se reconoce como en `Combat.png`.
- No tapa al enemigo.
- No se pierde debajo del bottom nav.

## 14. Fase 7 - Auto, Velocidad Y Acciones Laterales

Estado deseado:

- Auto/velocidad abajo a la derecha, estilo control cuadrado/doble.
- Side actions cuadrados alrededor de la escena.
- No usar pills horizontales largas dentro del area superior.

Acciones:

- Convertir `combat-forge-action-strip` y decision de extraccion en controles compactos.
- Si hay dos acciones importantes:
  - `Extraer al Santuario` puede ser boton lateral/compacto o CTA contextual.
  - `Push disponible` debe ser badge pequeno, no una card/pill larga.
- Mantener tooltips/titles para explicar.

Criterio de aceptacion:

- No hay pills largas tapando el campo.
- Las acciones se parecen a botones del lateral de `Combat.png`.
- `Mochila` e `Intel` ya no parecen tabs de formulario.

## 15. Fase 8 - Stats, Ingresos Y Log

Estado deseado:

- Stats: una banda horizontal compacta.
- Ingresos: tres cards bajas con icono, valor/min y mini barra si aplica.
- Log: panel oscuro, encabezado, boton `Ver mas`, lineas con icono y timestamp.

Problema actual:

- Stats se ven como cards separadas altas y empujan el resto.

Acciones:

- Crear clases Forge especificas:
  - `.combat-forge-stats-strip`
  - `.combat-forge-stat-cell`
  - `.combat-forge-income-strip`
  - `.combat-forge-log-panel`
- Reducir alto de cards individuales.
- Evitar border fuerte en cada item; usar divisores internos.

Criterio de aceptacion:

- En viewport 653x860 debe aparecer al menos el inicio claro de stats despues del campo.
- Al hacer scroll leve deben aparecer ingresos/log sin que parezcan otra pantalla.

## 16. Fase 9 - QA Visual Iterativo

Despues de cada fase:

1. Ejecutar `npm run build`.
2. Tomar screenshot del viewport actual.
3. Comparar contra `Combat.png`.
4. Registrar en este documento que quedo alineado y que sigue desviado.

Checklist por captura:

- No hay subtab horizontal en combate mobile.
- Tier: 5 nodos, quinto boss, fill alineado a nodo.
- HP enemigo: arriba del enemigo, ancho contenido, skull sin solaparse.
- Estados: iconos bajo HP.
- Damage: flota sobre enemigo.
- Player HUD: abajo izquierda, con portrait y barras.
- Side actions: cuadrados laterales.
- Auto/velocidad: abajo derecha.
- Stats: banda compacta.
- Ingresos/log: no compiten con escena.
- Bottom nav: activo y sin dock secundario encima.

## 17. Orden Recomendado De Implementacion

Orden exacto:

1. Fase 1: eliminar `SubtabDock` mobile en combate y crear side actions `Mochila` / `Intel`.
2. Fase 2: reestructurar shell y alto del campo.
3. Fase 3: corregir tier fill por nodo.
4. Fase 4: compactar enemy HUD.
5. Fase 6: compactar player HUD.
6. Fase 7: convertir action strip/push/extraccion en controles compactos.
7. Fase 8: compactar stats/ingresos/log.
8. Fase 9: screenshot y ajuste fino.

Motivo:

Si se empieza por achicar HP/tier sin sacar el subtab horizontal ni reorganizar el shell, se optimiza una estructura equivocada.

## 18. Riesgos

Riesgo 1: perder funcionalidad de subviews.

- Mitigacion: `Mochila` e `Intel` siguen disparando `SET_TAB`.
- Si el usuario entra a `Mochila` o `Intel`, ahi si puede mostrarse un control `Volver a combate`.

Riesgo 2: side actions tapan enemigo.

- Mitigacion: side rails absolute con `pointer-events` controlado y breakpoints.
- En mobile corto, usar solo icono y badge, sin label permanente.

Riesgo 3: demasiada dependencia de `responsive.css`.

- Mitigacion: agrupar clases nuevas con prefijo `.combat-forge-*`.
- Dejar inline solo para porcentajes dinamicos y vars CSS.

Riesgo 4: assets enemigos con proporciones distintas.

- Mitigacion: seguir usando `combatVisuals.js` para escala/offset por enemigo.

## 19. Definicion De MVP Visual Combat

Se considera MVP cuando, en un viewport similar a `Screenshot3.png`:

- La primera vista no muestra `Combate / Mochila / Intel`.
- `Mochila` e `Intel` son botones cuadrados laterales.
- Tier y HP enemigo tienen escala similar a `Combat.png`.
- El enemigo se ve centrado, no comprimido ni gigante.
- El player HUD esta abajo izquierda.
- Se ve al menos el comienzo de las stats debajo de la escena.
- El bottom nav no tapa controles importantes.
- El conjunto se percibe como escena de combate Forge Light, no como una card de dashboard.

## 20. Proximo Paso

Implementar Fase 1.

Cambio esperado:

- `ExpeditionView.jsx`: no renderizar `SubtabDock` en combate mobile.
- `Combat.jsx`: aceptar/renderizar `sideActions`.
- `responsive.css`: estilos para `.combat-forge-side-actions` y botones cuadrados.
- `ForgeIcon.jsx`: agregar iconos faltantes si no existen (`bag`, `scroll` o equivalente).

Despues de Fase 1, tomar nueva captura y recien ahi ajustar alto de stage/tier/HP con una comparacion mas limpia.

---

## 21. Referencia Nueva: Scroll Inferior

Referencia agregada: `uirefactor/Combate_Abajo.png`.

Esta captura cubre la parte que no entraba en el primer HUD de combate. Cambia el alcance de Combat: no alcanza con dejar bien el escenario superior; la continuidad scrolleada de Expedicion tambien debe pasar a Forge Light.

### 21.1 Bloques a migrar

Orden visible de arriba hacia abajo:

- Banda de stats: `DANO`, `DEFENSA`, `CRITICO`, `VELOCIDAD`.
- `CONTRATO ACTIVO`: nombre, descripcion, barra/progreso, recompensas y estado.
- `WEEKLY LEDGER`: progreso semanal, estado completado, barra verde y CTA `VER WEEKLY`.
- `BOSS SEMANAL`: ciclo/timer, boss, dificultades `NORMAL`, `VETERANO`, `ELITE`.
- `REGISTRO DE COMBATE`: row compacta con CTA `VER`.
- `REINICIAR PROGRESO`: accion peligrosa en rojo, debajo del contenido principal.

### 21.2 Reglas visuales

- Esta zona puede quedar debajo del fold; no debe forzarse en el primer viewport.
- Los paneles usan la misma familia que el HUD: fondo oscuro texturado, borde bronze, esquinas ornamentales.
- La banda de stats es compacta y horizontal; no debe volver a cards grandes legacy.
- Weekly completado usa verde como estado, no dorado.
- Boss semanal usa rojo/naranja como acento de peligro.
- Las dificultades de boss son cards de decision con icono grande y recompensa visible.
- El registro de combate no compite con el HUD superior; es una row de acceso.

### 21.3 Implicacion para fases

Las fases 1 a 7 siguen vigentes para el HUD superior. Despues de estabilizar el HUD, agregar una fase nueva:

8. Migrar scroll inferior de Expedicion contra `Combate_Abajo.png`.
9. Capturar y comparar primer viewport + scroll inferior.
10. Ajuste fino final.
