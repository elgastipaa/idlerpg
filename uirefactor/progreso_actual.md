# Progreso actual - Refactor UI Forge Light

Fecha de corte: 2026-04-29

Este archivo es el punto de entrada para retomar el refactor. Desde 2026-04-29 la guia obligatoria pasa a ser `uirefactor/design2.md`, `uirefactor/design-system-implementation-plan.md`, `ui-component-inventory.md` y `uirefactor/nuevoDesign/UI Kit Forge Light.png`.

Regla de autoridad vigente:
- El UI Kit Forge Light gana sobre capturas viejas.
- Las capturas viejas informan layout/jerarquia, no componentes locales.
- No crear estilos locales por pantalla si corresponde crear primitive Forge en `src/components/ui/forge/` + `src/styles/forge-light.css`.

## Design System v2 - slices

### Slice 1 - Tokens + aliases + FlButton

Estado: implementado y compilado.

Archivos:
- `src/styles/forge-light.css`
- `src/components/ui/forge/FlButton.jsx`
- `src/components/ui/forge/index.js`

Notas:
- Se agregaron aliases semanticos Forge v2 sin eliminar tokens legacy.
- `FlButton` soporta variants `primary`, `secondary`, `ghost`, `destructive`; sizes `sm`, `md`, `lg`, `full`; estados `default`, `pressed`, `selected`, `disabled`, `loading`, `success`, `error`.
- No se migro ninguna pantalla en este slice.

Validacion:
- `git diff --check -- src/styles/forge-light.css src/components/ui/forge/FlButton.jsx src/components/ui/forge/index.js`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlButton.jsx --bundle --format=esm --outfile=/tmp/flbutton-check.js`
- `npm run build`

### Slice 2 - assetRegistry + FlAsset + fallback

Estado: implementado y compilado.

Archivos:
- `src/utils/assetRegistry.js`
- `src/components/ui/forge/FlAsset.jsx`
- `src/components/ui/forge/index.js`
- `src/styles/forge-light.css`

Notas:
- `assetRegistry` centraliza paths de `public/assets` para items, system icons, enemies, backgrounds, weekly bosses, portraits, stations, talents y echoes.
- `FlAsset` renderiza `img` con sizing estable, `object-fit`, frame opcional, rareza y fallback por `ForgeIcon` si falla la imagen.
- No se migraron pantallas en este slice.

Validacion:
- `git diff --check -- src/utils/assetRegistry.js src/components/ui/forge/FlAsset.jsx src/components/ui/forge/index.js src/styles/forge-light.css`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlAsset.jsx --bundle --format=esm --outfile=/tmp/flasset-check.js`
- `./node_modules/.bin/esbuild src/utils/assetRegistry.js --bundle --format=esm --outfile=/tmp/asset-registry-check.js`
- `npm run build`

### Slice 3 - FlCard + FlBadge + FlIconFrame

Estado: implementado y compilado.

Archivos:
- `src/components/ui/forge/FlCard.jsx`
- `src/components/ui/forge/FlBadge.jsx`
- `src/components/ui/forge/FlIconFrame.jsx`
- `src/components/ui/forge/index.js`
- `src/styles/forge-light.css`

Notas:
- `FlCard` soporta variants `default`, `compact`, `panel`, `premium`; estados `default`, `pressed`, `selected`, `disabled`, `locked`, `loading`, `success`, `error`; `interactive`, `selected`, `rarity`.
- `FlBadge` soporta tonos `neutral`, `success`, `danger`, `warning`, `arcane`, `defense`, `reward`; variants `status`, `count`, `rarity`, `tier`, `lock`, `notification`, `comparison`; rarezas.
- `FlIconFrame` extiende la clase global `.fl-icon-frame` con variants `normal`, `active`, `upgraded`, `epic`, `legendary`; sizes `sm`, `md`, `lg`, `xl`; soporte de `FlAsset` y fallback `ForgeIcon`.
- No se migro ninguna pantalla en este slice.

Validacion:
- `git diff --check -- src/components/ui/forge/FlCard.jsx src/components/ui/forge/FlBadge.jsx src/components/ui/forge/FlIconFrame.jsx src/components/ui/forge/index.js src/styles/forge-light.css`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlCard.jsx --bundle --format=esm --outfile=/tmp/flcard-check.js`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlBadge.jsx --bundle --format=esm --outfile=/tmp/flbadge-check.js`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlIconFrame.jsx --bundle --format=esm --outfile=/tmp/fliconframe-check.js`
- `npm run build`

### Slice 4 - FlProgressBar + FlResourceCounter + FlStatRow

Estado: implementado y compilado.

Archivos:
- `src/components/ui/forge/FlProgressBar.jsx`
- `src/components/ui/forge/FlResourceCounter.jsx`
- `src/components/ui/forge/FlStatRow.jsx`
- `src/components/ui/forge/index.js`
- `src/styles/forge-light.css`

Notas:
- `FlProgressBar` cubre barras de HP, XP, progreso generico, success/error/loading, tamanos `sm`, `md`, `lg`, milestones, modo segmented, labels y ARIA.
- `FlResourceCounter` cubre oro, esencia, fuego, ecos, materiales y puntos con icono/asset centralizado via `FlIconFrame`.
- `FlStatRow` cubre filas compactas de stats con icono opcional, delta, hint y estados `increased`, `decreased`, `capped`, `modified`, `locked`.
- No se migro ninguna pantalla en este slice; se prepararon primitives para reemplazar barras/recursos/stats legacy en slices chicos posteriores.

Validacion:
- `git diff --check -- src/components/ui/forge/FlProgressBar.jsx src/components/ui/forge/FlResourceCounter.jsx src/components/ui/forge/FlStatRow.jsx src/components/ui/forge/index.js src/styles/forge-light.css`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlProgressBar.jsx --bundle --format=esm --outfile=/tmp/flprogress-check.js`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlResourceCounter.jsx --bundle --format=esm --outfile=/tmp/flresource-check.js`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlStatRow.jsx --bundle --format=esm --outfile=/tmp/flstatrow-check.js`
- `npm run build`

### Slice 5 - FlTabs + FlRequirementHint + overlay normalization

Estado: implementado y compilado.

Archivos:
- `src/components/ui/forge/FlTabs.jsx`
- `src/components/ui/forge/FlRequirementHint.jsx`
- `src/components/ui/forge/index.js`
- `src/components/OverlayShell.jsx`
- `src/components/ui/OverlayStationShell.jsx`
- `src/styles/forge-light.css`

Notas:
- `FlTabs` cubre tabs/subtabs canonicas con variants `primary`, `secondary`, `compact`; tamanos `sm`, `md`, `lg`; badge via `FlBadge`; icono opcional; disabled/loading; scroll horizontal; `fullWidth`; navegacion por teclado.
- `FlRequirementHint` cubre requisitos faltantes y bloqueos con tipos `resource`, `locked`, `level`, `inventory`, `prereq`; tonos semanticos; icono Forge; accion opcional via `FlButton`.
- `OverlayShell` y `OverlaySurface` aceptan `variant`, con `variant="forge"` como camino opt-in para superficies oscuras Forge sin cambiar overlays actuales.
- `OverlayStationShell` acepta `variant="forge"` y usa `FlButton` para cerrar solo en ese modo; los defaults legacy quedan intactos.
- No se migro ninguna pantalla en este slice.

Validacion:
- `git diff --check -- src/components/ui/forge/FlTabs.jsx src/components/ui/forge/FlRequirementHint.jsx src/components/ui/forge/index.js src/components/OverlayShell.jsx src/components/ui/OverlayStationShell.jsx src/styles/forge-light.css`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlTabs.jsx --bundle --format=esm --outfile=/tmp/fltabs-check.js`
- `./node_modules/.bin/esbuild src/components/ui/forge/FlRequirementHint.jsx --bundle --format=esm --outfile=/tmp/flrequirement-check.js`
- `./node_modules/.bin/esbuild src/components/ui/OverlayStationShell.jsx --bundle --format=esm --outfile=/tmp/overlaystation-check.js`
- `npm run build`

### Slice 6 - Crafting piloto con primitives + item assets

Estado: implementado y compilado.

Archivos:
- `src/components/Crafting.jsx`
- `src/components/SanctuaryForgeOverlay.jsx`
- `src/styles/forge-light.css`

Notas:
- `SanctuaryForgeOverlay` usa `OverlayStationShell variant="forge"` y recursos del header con `FlResourceCounter`.
- El showcase superior de Crafting reemplazo tabs locales por `FlTabs`.
- Entropia usa `FlResourceCounter` + `FlProgressBar`.
- Item objetivo usa `FlCard`, `FlBadge` y `FlAsset` con `getItemAsset`; si no hay PNG real, cae al icono Forge.
- Resultado, panel de materiales/costo/probabilidad, comparacion de stats, feedback y CTA superior usan `FlCard`, `FlResourceCounter`, `FlStatRow`, `FlRequirementHint` y `FlButton`.
- Se quito el `SubtabDock` mobile oculto de Crafting para evitar duplicacion conceptual de tabs.
- Se compacto el showcase mobile para que el CTA quede mas cerca de la primera pantalla.
- La zona legacy inferior de Crafting sigue viva para no romper seleccion de affixes, extracción, imbuir y flujos avanzados; queda pendiente migrarla por subtareas.

Validacion:
- `git diff --check -- src/components/Crafting.jsx src/components/SanctuaryForgeOverlay.jsx src/styles/forge-light.css`
- `./node_modules/.bin/esbuild src/components/Crafting.jsx --bundle --format=esm --outfile=/tmp/crafting-check.js`
- `./node_modules/.bin/esbuild src/components/SanctuaryForgeOverlay.jsx --bundle --format=esm --outfile=/tmp/sanctuary-forge-overlay-check.js`
- `npm run build`
- `npm run ui:capture` genero 30 capturas sin errores JS antes del ajuste final de compactacion mobile.
- Intentos posteriores con `timeout 90s npm run ui:capture` y `timeout 240s npm run ui:capture` no llegaron a escribir reporte nuevo en esta sesion; no quedaron procesos activos.

### Slice 6b - Crafting layout correction

Estado: implementado, compilado y capturado.

Archivos:
- `src/components/Crafting.jsx`
- `src/components/SanctuaryForgeOverlay.jsx`
- `src/styles/forge-light.css`
- `uirefactor/crafting-layout-plan.md`

Decisiones aplicadas desde `uirefactor/crafting-layout-plan.md`:
- Forja sigue siendo overlay/estacion de Santuario.
- Bottom nav queda visible y activo como Santuario.
- Se mantienen 5 tabs de gameplay.
- Se muestran 4 recursos en header.
- CTA no sticky; se compacto/reordeno mobile para que quede visible.
- No se agregan features inexistentes: sin garantia `+15`, sin auto, sin vista previa, sin `Ver detalles`.

Cambios de layout:
- Header contextual reducido a `Forja`.
- Entropia queda en la franja superior junto al titulo `FORJAR`.
- Tabs horizontales debajo del titulo.
- Desktop mantiene bloque principal en 3 columnas: item, resultado, panel material/probabilidad/coste.
- Mobile mantiene item + resultado en fila y panel material/probabilidad/coste vertical compacto.
- Track queda debajo del bloque principal.
- CTA principal `MEJORAR` queda centrado y dominante; en mobile se muestra antes de stats para priorizar accion y evitar choque con bottom nav.
- Stats quedan debajo del CTA en mobile, aceptando que caigan bajo fold.

Validacion:
- `git diff --check -- src/components/Crafting.jsx src/components/SanctuaryForgeOverlay.jsx src/styles/forge-light.css`
- `./node_modules/.bin/esbuild src/components/Crafting.jsx --bundle --format=esm --outfile=/tmp/crafting-check.js`
- `./node_modules/.bin/esbuild src/components/SanctuaryForgeOverlay.jsx --bundle --format=esm --outfile=/tmp/sanctuary-forge-overlay-check.js`
- `npm run build`
- `npm run ui:capture`

Capturas:
- `uirefactor/current/crafting-390x844.png`
- `uirefactor/current/crafting-430x932.png`
- `uirefactor/current/crafting-1280x800.png`
- `uirefactor/current/capture-report.md`
- Reporte: 30 capturas generadas, sin errores JS.

## Plan maestro vigente

Se agrego `uirefactor/plan_migracion_profunda_forge_light.md` como plan operativo para avanzar sin reconstruir contexto.

Ese plan cubre:
- fuentes visuales nuevas: `Ecos.png`, `Crafting.png`, `Heroe_Atributos.png`, `Heroe_Ficha.png`, `Intel.png`, `Santuario.png`;
- orden de migracion por pantalla;
- consolidacion de primitivas globales Forge Light;
- creacion/uso de SVGs desde `Iconos SVG.png`;
- auditorias visuales por pantalla;
- dos iteraciones obligatorias post-migracion para volver a comparar implementacion vs referencias.

Tooling:
- `playwright` quedo instalado como dev dependency.
- Chromium quedo instalado para capturas headless.
- `npm run ui:capture` ejecuta `scripts/captureForgeLightScreens.mjs` y guarda capturas/reportes en `uirefactor/current/`.
- `npm run smoke:responsive` ejecuta el smoke responsive existente.
- No hace falta controlar la PC del usuario para sacar capturas.
- Pedir permiso nuevamente solo si hace falta instalar dependencias nuevas, abrir GUI o ejecutar comandos destructivos.

Capturas:
- El bloqueo de Chromium por `libnspr4.so` quedo resuelto tras instalar dependencias del sistema.
- `npm run ui:capture` genera baseline completo con save semilla post-onboarding y `?nosave=1`.
- Ultima corrida genero 27 capturas: 9 pantallas x 3 viewports.
- Reporte actual: `uirefactor/current/capture-report.md`.
- Capturas actuales: `uirefactor/current/<pantalla>-<viewport>.png`.

## Estado general

El refactor Forge Light esta en marcha y hay cambios importantes sin commit en el worktree. No hacer `git reset` ni revertir archivos sin revisar, porque hay mucho trabajo acumulado de UI, assets y documentacion.

Verificacion mas reciente:
- `npm run build` paso correctamente.
- `npm run ui:capture` genero 27 capturas nuevas sin errores JS.
- `git diff --check -- uirefactor/imagenes.md uirefactor/design.md uirefactor/progreso_actual.md uirefactor/auditorias/ecos-audit.md src/App.jsx src/components/Prestige.jsx src/styles/responsive.css scripts/captureForgeLightScreens.mjs` paso correctamente para la pasada de items/Ecos.
- Crafting: `npm run build` paso y `npm run ui:capture` genero capturas nuevas sin errores JS.
- `git diff --check` global actualmente marca whitespace en `package-lock.json` generado durante la instalacion previa de Playwright; no se toco en esta pasada.
- Queda el warning normal de Vite por chunks grandes.

## Pantallas / sistemas ya avanzados

### Bottom Nav

Estado: bastante aprobado visualmente.

Decisiones tomadas:
- Botones grandes estilo Forge Light.
- Outline dorado sobre el boton activo, no solo sobre el icono.
- Diamante/glow superior en el boton seleccionado.
- Iconos mas grandes.
- Notificaciones consistentes arriba a la derecha, incluido Santuario.

Archivos relacionados:
- `src/App.jsx`
- `src/styles/forge-light.css`
- `src/styles/responsive.css`
- `src/components/icons/ForgeIcon.jsx`

### Santuario

Estado: iterado y mejorado, pero no cerrado al 100%.

Decisiones tomadas:
- Mantener gris oscuro como superficie principal.
- Dorado como acento, no como base de todas las cards.
- Botones principales con dorado fuerte.
- Cards compactas, bordes dorados sutiles y glow moderado.
- Se busco acercar a `uirefactor/Santuario.png`, pero quedo como una etapa intermedia aceptable.

Pendiente:
- Recomparar con `Santuario.png` si se vuelve a esa pantalla.
- Revisar densidad final despues de Talentos/Heroe, porque el sistema visual global puede cambiar.

Archivos relacionados:
- `src/components/Sanctuary.jsx`
- `src/styles/forge-light.css`
- `src/styles/responsive.css`

### Crafting / Forja

Estado: segunda pasada Forge Light aplicada y validada con capturas.

Referencia principal:
- `uirefactor/Crafting.png`

Decisiones tomadas:
- La captura `crafting` abre realmente `SanctuaryForgeOverlay` desde Santuario, no una pantalla standalone aislada.
- `SanctuaryForgeOverlay` ahora usa clases Forge especificas para shell/body/header.
- `OverlayShell` y `OverlayStationShell` aceptan `className`, `zIndex` y `respectHeader` para permitir overlays visuales propios.
- El overlay de Forja se eleva sobre header/nav de Santuario y oculta header/desktop nav mientras esta abierto.
- `Crafting.jsx` usa `crafting-root--forge-light`.
- Se agrego `fl-crafting-showcase` como bloque superior inspirado en `Crafting.png`:
  - titulo `FORJAR`,
  - modulo de entropia,
  - tabs `MEJORAR / AFINAR / REFORJAR / IMBUIR / EXTRAER`,
  - item card grande,
  - resultado central verde,
  - panel material/probabilidad/costo,
  - track `+0 / +5 / +10 / +15`,
  - comparacion de stats,
  - CTA dorado `MEJORAR ITEM`.
- Se oculto el `SubtabDock` mobile antiguo de Crafting para no duplicar tabs.
- Se conserva debajo la mesa/listado existente para no romper seleccion de items ni flujos de modos avanzados.
- Segunda pasada aplicada:
  - semilla de captura con item `+12 -> +13` y entropia `72 / 100`,
  - placeholder por familia/slot (`focus` usa mira/lente, armor usa escudo, armas usan combate),
  - header de Forja mas premium con crest, identidad `Forjador` y recursos,
  - CTA `MEJORAR ITEM` con bevel/facetado,
  - item frame y resultado central con mas glow/ornamento.

Pendiente:
- Integrar PNG reales de items cuando esten generados.
- Segunda pasada sobre mesa/listado legacy debajo del showcase.
- Definir si `MEJORA MAXIMA` se mantiene deshabilitada, se elimina o se implementa como accion real.
- Auditoria: `uirefactor/auditorias/crafting-audit.md`.

Archivos relacionados:
- `src/components/SanctuaryForgeOverlay.jsx`
- `src/components/Crafting.jsx`
- `src/components/ui/OverlayStationShell.jsx`
- `src/components/OverlayShell.jsx`
- `src/styles/responsive.css`

### Combat

Estado: muy avanzado y aprobado visualmente por ahora.

Referencias:
- `uirefactor/Combat.png`
- `uirefactor/Combate_Abajo.png`

Decisiones tomadas:
- HUD principal sin borde dorado exterior, fundido con fondo.
- Fondo de combate global extendido detras del HUD/header.
- Barra de tiers con 5 nodos, boss con icono.
- Rombos de tiers reducidos.
- HP enemigo con texto dentro de la barra, escondida visualmente detras del skull.
- HP/XP jugador salen del avatar.
- Botones `Extraer` y `AUTO` en el HUD.
- Mochila/Intel como botones laterales cuadrados.
- Espacio reservado invisible para estados del jugador para evitar saltos de layout.
- Enemigos integrados desde `public/assets/combat/enemies/` y `uirefactor/generated/`.
- Combat main panel y stats sin gap visible, con overflow controlado para no invadir Stats.

Pendiente:
- Volver mas adelante para calibrar casos puntuales de enemigos chicos/grandes.
- Incorporar la parte inferior de `Combate_Abajo.png` al contrato visual real: stats compactas, contrato activo, weekly ledger, boss semanal, registro de combate y reinicio de progreso.
- Dragon todavia necesita un prompt/asset mejor.
- Bosses pueden pensarse como siguiente tanda de assets.

Archivos relacionados:
- `src/components/Combat.jsx`
- `src/data/combatVisuals.js`
- `src/styles/responsive.css`
- `public/assets/combat/enemies/`
- `uirefactor/combatPlan.md`
- `uirefactor/imagenes.md`

### Talentos

Estado: en iteracion activa. Ultima pantalla trabajada.

Referencia principal:
- `uirefactor/Talentos.png`
- Capturas actuales comparativas: `uirefactor/Screenshot1.png`, `uirefactor/Screenshot2.png.jpeg`, `uirefactor/Screenshot3.png.jpeg`

Decisiones tomadas:
- Mantener 3 tramos reales del juego: `basic`, `gameplay`, `keystone`.
- No reorganizar por categorias de la referencia tipo Basicos/Ofensivos/Defensivos/Supervivencia, porque la logica del juego usa tramos.
- Layout actual: 3 columnas, una por tramo.
- Dentro de cada tramo: nodos en triangulo invertido, 2 arriba + 1 abajo.
- Se muestran todos los nodos. Se quitaron filtros `Comprables / Activos / Todos`.
- Se quitaron lineas de relacion entre nodos porque ensuciaban visualmente.
- Cada nodo tiene badge rectangular integrado en el borde inferior con `nivel/cap`, por ejemplo `0/5`.
- Hay card de detalle del nodo seleccionado.
- En mobile Talentos debe funcionar como HUD cerrado sin scroll de pagina: header, selectores, header del arbol, nodos y card de detalle visibles a la vez.
- En mobile la card de detalle ya no queda fija flotando; forma parte del layout para evitar scroll interno o scroll de fondo.
- Si un tramo tiene 3 nodos usa triangulo 2+1; si alguna vez tiene 4 o mas usa grilla de 2 columnas.
- En desktop se usa tambien el arbol visual, con card inline/sticky al costado.
- Header principal de Talentos se compacto: muestra clase/arbol, TP y `x invertidos`.
- `REINICIAR` se movio al header del arbol seleccionado.
- `REINICIAR` ahora resetea solo el arbol seleccionado mediante `treeId`.
- El boton `COMPRAR` se ajusto contra `Talentos.png` y `Santuario.png`: ya no es dorado solido, ahora usa superficie oscura, borde dorado facetado, bevel interno, lineas ornamentales y glow sutil cuando esta disponible.
- Los talentos bloqueados muestran un resumen de requisito/costo en la fila `REQUISITOS`, en vez de dejarla vacia.

Pendiente inmediato en Talentos:
- Pedir nueva captura post-ultimo cambio, porque todavia no se vio el resultado despues de convertir Talentos mobile a layout sin scroll.
- Validar que todos los elementos entren en el viewport real del celular sin cortar contenido clave.
- Evaluar sacar o rehacer el segundo nav de Heroe (`Ficha / Atributos / Talentos`) cuando se rehaga completa la tab Heroe. No hacerlo de forma aislada todavia.

Archivos relacionados:
- `src/components/Talents.jsx`
- `src/styles/responsive.css`
- `src/engine/progression/progressionEngine.js`
- `src/state/reducerDomains/metaProgressionReducer.js`

Notas tecnicas de Talentos:
- `resetTalentTree(state, treeId = null)` ahora acepta `treeId` opcional.
- `RESET_TALENT_TREE` en reducer pasa `action.treeId || null`.
- Sin `treeId`, el reset global sigue funcionando como antes.
- El arbol visual usa `ForgeTalentTreeGrid`, `ForgeTalentNodeButton`, `ForgeTalentDetailPanel`.
- La clase raiz activa es `talents-root--forge-light`.

### Heroe / Atributos

Estado: segunda pasada Forge Light aplicada y validada con capturas.

Referencia principal:
- `uirefactor/Heroe_Atributos.png`

Decisiones tomadas:
- `Skills.jsx` usa `skills-root--forge-light`.
- Se reemplazo la UI clara por panel oscuro Forge.
- Cada atributo tiene icono SVG, row ornamental, nivel/cap, track de nodos y boton de costo Forge.
- Se agrego tabbar visual `Combate / Economia` sin cambiar logica ni ocultar secciones.
- El subnav de Heroe (`Ficha / Atributos / Talentos`) ahora usa skin Forge compartido.
- No se agrego `REINICIAR` porque no existe flujo actual para resetear atributos y no conviene inventar features durante el refactor visual.
- Segunda pasada:
  - `LECTURA ACTUAL` se movio debajo del panel principal para que el primer viewport empiece con `ATRIBUTOS`, tabs y filas, como `Heroe_Atributos.png`.
  - Se preservo la lectura como bloque secundario, sin eliminar informacion funcional.

Validacion:
- `npm run build` pasa.
- `npm run ui:capture` genero capturas nuevas sin errores JS.
- Auditoria: `uirefactor/auditorias/hero-atributos-audit.md`.

Pendiente:
- Header global de Heroe todavia no replica el retrato/avatar + XP de cuenta de la referencia.
- Decidir si las tabs `Combate / Economia` deben volverse interactivas en el futuro o quedar como agrupacion visual.

### Heroe / Ficha

Estado: segunda migracion Forge Light aplicada y validada con capturas.

Referencia principal:
- `uirefactor/Heroe_Ficha.png`

Decisiones tomadas:
- `Character.jsx` usa layout Forge Light cuando el heroe ya tiene especializacion.
- Se agrego hero card con retrato placeholder, nivel, clase, especializacion, build activa, kills y barras de Vida/Experiencia.
- Se agregaron cards de build actual y lectura rapida con iconos SVG.
- Se agrego `app-shell-root--forge-character` para que toda la seccion Heroe tenga fondo oscuro Forge.
- El viewport desktop de Heroe queda transparente; ya no aparece el panel blanco detras de Ficha/Atributos.
- No se agregaron CTAs nuevos de `ELEGIR` porque la pantalla actual no tiene ese flujo expuesto y el refactor no debe inventar features.
- Segunda pasada:
- `Character.jsx` mapea portrait por especializacion/clase desde `public/assets/portraits/classes/`.
- La hero card usa `portrait_juggernaut.png`, `portrait_berserker.png`, `portrait_warrior.png`, etc. cuando existen.
- `responsive.css` agrega `forge-character-portrait-img` con encuadre mobile/desktop, sombreado y tratamiento dentro del marco Forge.

Validacion:
- `npm run build` pasa.
- `npm run ui:capture` genero capturas nuevas sin errores JS.
- Auditoria: `uirefactor/auditorias/hero-ficha-audit.md`.

Pendiente:
- Segunda pasada de ornamentos finos: esquinas, separadores, bevel y glow de cards.
- Decidir si el header global se vuelve mas parecido a las referencias con avatar/recurso grande o si se mantiene compacto por espacio mobile.

### Mochila

Estado: segunda pasada Forge Light aplicada y validada con capturas.

Referencia principal:
- `uirefactor/Mochila.png`
Referencias inferiores/completas:
- `uirefactor/Mochila_Abajo.png`
- `uirefactor/Mochila_Completa.png`
- Estado anterior comparativo: `uirefactor/Screenshot5.png`

Decisiones tomadas:
- Mochila usa `inventory-root--forge-light`.
- Se agregaron clases reutilizables para evitar depender solo de inline styles.
- Las cards equipadas (`Arma`, `Armadura`) pasaron a formato Forge:
  - superficie oscura,
  - borde bronze/dorado,
  - marco interior ornamental,
  - columna visual izquierda grande,
  - contenido textual a la derecha,
  - poder del item con glow dorado.
- La columna visual usa por ahora `ForgeIcon` (`combat` / `armor`) como placeholder premium hasta tener arte especifico de items.
- El panel superior de Expedicion en subvista Mochila se oscurecio y el CTA `Volver a combate` usa estilo Forge.
- `app-shell-root--forge-expedition` evita que Mochila/Intel usen viewport blanco en desktop.
- `ExpeditionView` agrega clases `expedition-root--inventory` y `expedition-root--codex` para poder skinnear subpantallas por vista.
- `SubtabDock` ahora acepta `className` y agrega clases `subtab-dock-button--active/disabled`, para poder skinnear subnavs sin romper otras pantallas.
- En mobile, el subtab `Combate / Mochila / Intel` de Mochila se acerco a la referencia con fondo oscuro, bordes bronze y activo dorado.
- El script `npm run ui:capture` ahora siembra equipo e inventario representativo para comparar `Mochila.png` contra una pantalla con items reales.
- El Loot Filter visible ya no queda blanco; se llevo a superficie Forge oscura.
- Segunda pasada inferior:
  - `FILTRO DE LOOT` usa titulo con icono SVG, `AJUSTES` sin emoji, presets facetados y rarezas con diamantes coloreados.
  - El resumen de `INVENTARIO` por rareza se llevo a cards oscuras con cantidad/oro legibles.
  - Las rows de item tienen marco de arte placeholder por rareza, poder dorado, chips de stats oscuros/verdes y acciones `EQUIPAR`/`VENDER` en estilo Forge.
  - `npm run ui:capture` agrega capturas `mochila-abajo-*`; en mobile se anclan en Loot Filter porque no entra filtro + inventario completo en un solo viewport.

Pendiente inmediato en Mochila:
- Cuando existan PNG reales, mapearlos a `public/assets/items/` y reemplazar placeholders manteniendo el contenedor actual.
- Definir lock/proteccion por item si se quiere replicar mas `Mochila_Completa.png`; hoy se preserva flujo actual `EQUIPAR`/`VENDER`.
- Item detail modal todavia conserva mucho estilo legacy.
- Ajustar altura final de cards equipadas en una futura pasada si el primer viewport queda demasiado cargado.
- Auditoria: `uirefactor/auditorias/mochila-audit.md`.

Archivos relacionados:
- `src/components/Inventory.jsx`
- `src/components/ExpeditionView.jsx`
- `src/components/ui/SubtabDock.jsx`
- `scripts/captureForgeLightScreens.mjs`
- `src/styles/responsive.css`

### Intel

Estado: segunda pasada Forge Light aplicada y validada con capturas.

Referencia principal:
- `uirefactor/Intel.png`

Decisiones tomadas:
- `Codex.jsx` usa `codex-root--forge-light` en modo hunt/Intel.
- En Intel se oculta el panel introductorio redundante para que el primer foco sea `RADAR TACTICO`, como en la referencia.
- Se agregaron clases `codex-intro-panel`, `codex-radar-panel` y `codex-metric-card`.
- `responsive.css` define variables Forge para Codex/Intel y transforma paneles, metric cards, chips y subtabs a superficie oscura.
- Se agrego radar ornamental CSS como placeholder del compas/radar ilustrado de la referencia.
- `expedition-root--codex` comparte shell Forge con Mochila y evita viewport blanco en desktop.
- El panel superior mobile de Intel usa fondo oscuro y CTA dorado `VOLVER A COMBATE`.
- `npm run ui:capture` siembra codex/ruta con datos representativos: 6 targets, 3 bosses en ruta, 2 bosses accesibles y 2 powers activos.
- `RADAR TACTICO` usa tres metric cards y un banner `Expedicion Activa` separado, mas cercano a `Intel.png`.
- Chips del radar y banner adoptaron silueta facetada, icono circular y glow azul/dorado.

Pendiente:
- Reemplazar el radar CSS por asset ilustrado si se busca fidelidad alta.
- Evaluar asset de banner/libro/estandarte para `Expedicion Activa`.
- Segunda iteracion de layout mobile para que `Objetivos revelados` respire mas y no compita tanto con el bottom nav.
- Auditoria: `uirefactor/auditorias/intel-audit.md`.

Archivos relacionados:
- `src/components/Codex.jsx`
- `src/components/ExpeditionView.jsx`
- `src/App.jsx`
- `src/styles/responsive.css`

### Ecos

Estado: primera pasada Forge Light aplicada y validada con capturas.

Referencia principal:
- `uirefactor/Ecos.png`

Decisiones tomadas:
- `Prestige.jsx` usa `prestige-root--forge-light`.
- `App.jsx` agrega `app-shell-root--forge-prestige` para evitar viewport blanco/default en la tab Ecos.
- El panel principal de Ecos suma crest circular con `ForgeIcon name="essence"`, glow dorado/violeta y jerarquia similar a la referencia.
- El resumen de extraccion muestra `+9 ecos al extraer`, badges de disponibles/momentum, `Conservas`, `Se reinicia`, y metric cards dentro del primer bloque.
- `RunSigilCallout` queda envuelto en `prestige-run-sigil-panel` y se oscurecio para alinearse con `Ecos.png`.
- `scripts/captureForgeLightScreens.mjs` siembra progreso de run/prestige para que Ecos capture Tier 10, Base 9 y momentum x1.0, comparable con la referencia.
- Se agrego contrato de pantalla en `uirefactor/design.md` como `Screen contract: Ecos`.
- Segunda pasada:
- `Prestige.jsx` agrega clases semanticas para badges, breakdown, outcome grid y metric grid.
- `Conservas` y `Se reinicia` usan icono SVG, variante verde/roja, borde/glow propio y fondo oscuro.
- Badges de disponibles/momentum se transformaron en placas facetadas, con ajuste mobile <= 400px para mantenerlos lado a lado.
- Metric cards suman ornamento circular de baja opacidad y jerarquia display mas parecida a la referencia.

Pendiente:
- Header global mas ornamentado con icono grande de Ecos.
- Corners/bevels mas parecidos a la referencia.
- Tablero de ramas/meta con skin Forge mas profunda.
- Posible asset ilustrado de diamante/eco para reemplazar el crest SVG/CSS si se busca fidelidad alta.
- Auditoria: `uirefactor/auditorias/ecos-audit.md`.

Archivos relacionados:
- `src/components/Prestige.jsx`
- `src/App.jsx`
- `src/styles/responsive.css`
- `scripts/captureForgeLightScreens.mjs`
- `uirefactor/design.md`

## Header global App

Estado: compactado recientemente.

Cambios:
- Mobile header: 62px -> 52px.
- Desktop header: 68px -> 60px.
- En mobile se ocultan labels `ORO` / `ESENCIA`; queda icono + valor.

Motivo:
- Recuperar altura vertical para pantallas densas como Talentos.
- Acercarse al header compacto de `Crafting.png`.

Archivos relacionados:
- `src/App.jsx`
- `src/styles/responsive.css`

Pendiente:
- Validar visualmente en pantallas ya retocadas: Combat, Santuario, Talentos, Mochila.

## Assets e iconos

Iconos:
- Se esta usando `src/components/icons/ForgeIcon.jsx` como sistema SVG reusable.
- `uirefactor/iconos.md` documenta el enfoque de iconos desde `Iconos SVG.png`.

Assets combat:
- Muchos enemigos ya generados y/o copiados a `public/assets/combat/enemies/`.
- `src/data/combatVisuals.js` mapea varios enemigos.
- Dragon pendiente de generar mejor.

Assets items:
- `uirefactor/imagenes.md` ahora incluye `Prompts assets de items - Forge Light`.
- Se generaron prompts para los 75 items actuales de `src/data/items.js`.
- Naming sugerido: `item_<id>.png`, por ejemplo `item_mind_lens.png`.
- Formato pedido en prompts: PNG 1024x1024 con alpha real/transparente, sin fondo renderizado, sin checkerboard, sin frame ni UI.
- Direccion visual: estilo de `Crafting.png` como referencia principal por ser mas vivo; compatible con `Mochila.png`.
- Cuando existan los PNG, ubicarlos preferentemente en `public/assets/items/` y mapearlos sin perder el contenedor visual Forge de Mochila/Crafting.

## Documentacion existente importante

- `uirefactor/design.md`: guia principal del rediseño Forge Light.
- `uirefactor/ForgeLightPlan.md`: plan historico/seguimiento de Forge Light.
- `uirefactor/combatPlan.md`: plan especifico de Combat.
- `uirefactor/imagenes.md`: prompts y assets generados/faltantes para enemigos/fondos/items.
- `uirefactor/iconos.md`: notas de iconos SVG.
- `uirefactor/gamefeel.md`: recomendaciones de gamefeel a usar con criterio.

## Proximo paso recomendado al volver

1. Seguir `uirefactor/plan_migracion_profunda_forge_light.md`.
2. Crear o extender un script Playwright de capturas Forge Light usando el enfoque de `scripts/smokeResponsiveViewports.mjs`.
3. Generar baseline en `uirefactor/current/`.
4. Consolidar primitivas globales (`fl-button`, `fl-panel`, `fl-row`, `fl-icon-frame`, `fl-progress-bar`, `fl-subtab-dock`).
5. Retomar migracion en este orden recomendado: Ecos segunda pasada o Crafting, Santuario segunda pasada, Mochila segunda pasada con assets de items, Combat auditoria final.

## Crafting - reconstruccion de composicion 2026-04-29

Estado: segunda correccion aplicada sobre el slice Crafting.

Cambios:

- Se mantiene Forja como overlay de Santuario.
- Se mantienen los 5 modos actuales por gameplay.
- Header del overlay ahora usa avatar/identidad, recursos compactos y menu visual.
- Fila contextual queda como `back + FORJAR + info` y modulo `ENTROPIA` a la derecha.
- Tabs quedan inmediatamente debajo.
- Main area queda en orden `item -> resultado -> material/probabilidad/coste`.
- Track, stats, CTA y feedback quedan en el orden de `Crafting.png`.
- Mobile conserva el orden de zonas sin subir el CTA por encima de stats.

Validacion:

- `npm run build` paso.
- `npm run ui:capture` paso y genero `uirefactor/current/crafting-390x844.png`, `crafting-430x932.png`, `crafting-1280x800.png` sin errores JS.

Pendiente:

- Decidir si la seccion legacy `Mesa de trabajo` debe quedar visible bajo el showcase o migrarse/colapsarse en un slice posterior.
- Ajustar fidelidad visual fina del track actual `+13` y feedback exitoso cuando exista dato/log real.

## Crafting - iteracion header/tabs/feedback/nav 2026-04-29

Estado: aplicada.

Cambios:

- Header global de `App.jsx` compactado y convertido a identidad Forge con avatar, level, nombre, poder y recursos con assets.
- Bottom nav mantiene 5 tabs funcionales y ahora usa assets `icons/system` via `FlAsset`.
- Crafting tabs usan los nuevos assets `icon_forge_*`.
- Entropia ya no muestra plus.
- Resultado central default: `VISTA PREVIA`.
- Resultado central feedback temporal: `MEJORA EXITOSA` verde o `ACCION FALLIDA` roja segun nueva entrada en `craftingLog`; vuelve a neutral despues de unos segundos.
- `Mesa de trabajo` y log legacy quedan ocultos visualmente.
- Track suma badge flotante de nivel actual.
- Mobile mueve material/probabilidad/coste debajo de item + resultado para legibilidad.

Validacion:

- `npm run build` paso.
- `npm run ui:capture` paso sin errores JS.
- `git diff --check` paso.

Pendiente:

- Migrar selector de items a un patron Forge compacto/drawer para que la lista no compita con la composicion principal.
- Decidir si el overlay de Forja debe dejar visible el header real de `App.jsx` o mantener header propio sincronizado.

## Comandos utiles

```bash
npm run build
git diff --check -- src/App.jsx src/components/Talents.jsx src/components/Inventory.jsx src/components/ExpeditionView.jsx src/components/ui/SubtabDock.jsx src/styles/responsive.css src/engine/progression/progressionEngine.js src/state/reducerDomains/metaProgressionReducer.js uirefactor/design.md uirefactor/progreso_actual.md uirefactor/plan_migracion_profunda_forge_light.md
```

## Crafting - item drawer + preview neutral 2026-04-29

Estado: aplicada y capturada.

Cambios:

- `SanctuaryForgeOverlay` deja de renderizar header propio de Forja y respeta el header global de `App.jsx`.
- El header interno de Crafting queda compacto como `Forja`, con back/info y sin modulo de entropia separado.
- La composicion principal queda en dos columnas: item seleccionado a la izquierda y vista previa a la derecha.
- Material principal, probabilidad de exito y coste pasan a una fila debajo del item/preview.
- La lista de items inline queda oculta; el item card abre un drawer/popup de seleccion.
- El item seleccionado se muestra mas grande, sin frame cuadrado de `FlAsset`, sin esquineros internos y sin circulo/ring detras.
- La vista previa es neutral por defecto: nuevos valores en dorado, sin glow verde hasta que haya resultado real.
- `craftingLog` activa feedback temporal de 1.8s: `MEJORA EXITOSA` verde o `MEJORA FALLIDA` roja; luego vuelve a `Vista previa`.
- Entropia se mueve dentro de la vista previa bajo `Poder`, mostrando valor actual y avance sombreado por coste.
- Bottom nav aumenta presencia de iconos para acercarse al UI Kit/Crafting.png sin cambiar las 5 tabs funcionales actuales.

Validacion:

- `npm run build` paso.
- `npm run ui:capture` paso y actualizo `uirefactor/current/crafting-390x844.png`, `crafting-430x932.png`, `crafting-1280x800.png` sin errores JS.
- `git diff --check -- src/components/SanctuaryForgeOverlay.jsx src/components/Crafting.jsx src/styles/forge-light.css` paso.

Pendiente:

- Validar manualmente el drawer con click real en browser; el build cubre JSX y la captura cubre estado cerrado.
- Revisar si los modos `Afinar/Reforjar/Imbuir/Extraer` necesitan controles equivalentes dentro del nuevo layout, porque la zona legacy sigue oculta visualmente.

## Crafting - feedback visual e item scale 2026-04-29

Estado: aplicada y capturada.

Cambios:

- Arte del item seleccionado crece aprox. 20% sin recuperar frame/ring/circulo local.
- Entropia queda anclada abajo en `Vista previa` y ocupa todo el ancho disponible de esa card.
- Deltas incrementales (`+X`) de `Estadisticas nuevas` quedan en verde cuando `FlStatRow` recibe `deltaTone="success"`.
- Al resolverse una accion por nueva entrada en `craftingLog`, el item seleccionado recibe `data-outcome` success/error, glow verde/rojo y texto flotante (`+1` o `Fallo`).
- La preview conserva `MEJORA EXITOSA` / `MEJORA FALLIDA` temporal y vuelve a neutral despues.

Validacion:

- `npm run build` paso.
- `npm run ui:capture` paso sin errores JS y actualizo capturas en `uirefactor/current/`.
- `git diff --check -- src/components/Crafting.jsx src/styles/forge-light.css` paso.

Pendiente:

- Validar manualmente el feedback en browser al clickear `MEJORAR`, porque las capturas automaticas toman el estado neutral inicial.

## Design System slices 7-14 + cierre de fase 2026-04-29

Estado: aplicado y capturado.

Alcance pedido:
- completar slices 7 a 14 de `uirefactor/design-system-implementation-plan.md`;
- cerrar Talentos;
- repasar Santuario;
- mantener Crafting sin mesa legacy visible;
- migrar overlays de estaciones excepto Forja;
- dejar auditoria final y dudas pendientes.

### Slices 7-14

Se agregaron componentes/wrappers Forge en `src/components/ui/forge/`:
- `FlIconButton`
- `FlTag`
- `FlCostDisplay`
- `FlRewardDisplay`
- `FlSectionHeader`
- `FlEmptyState`
- wrappers de dominio en `FlDomain.jsx`: items, crafting, talentos, santuario, combat/rewards y tracks.

Notas:
- No todos los wrappers reemplazan todavia cada uso legacy; quedan como base compartida para evitar que las proximas pantallas inventen componentes locales.
- `src/components/ui/forge/index.js` exporta todos los nuevos componentes.
- `src/styles/forge-light.css` suma skin global para los nuevos wrappers y para overlays Forge.

### Talentos

Estado: cerrado como slice visual.

Cambios:
- `Talents.jsx` usa `FlTalentNode` para nodos del arbol.
- Los nodos integran assets de `public/assets/skills/talents` via `getTalentAsset`.
- El panel de detalle usa `FlIconFrame` con asset de talento.
- CTA de compra usa `FlButton`.
- Header de TP usa `FlTalentPointCounter`.
- Reset de arbol usa `FlButton destructive`.
- Mobile se compacto para eliminar aire vertical excesivo entre arbol y detalle.

Riesgo residual:
- Todavia conviven clases legacy `forge-talent-node-*` con el wrapper `FlTalentNode`; quedan por compatibilidad visual.

### Santuario

Estado: repaso aplicado.

Cambios:
- Station rows usan `getStationAsset(row.id)` + `FlIconFrame`.
- Acciones principales de trabajos y estaciones usan `FlButton`.
- Se preserva layout de hub aprobado: trabajos, estaciones, reliquias, CTA expedition.

Riesgo residual:
- Acciones de reliquias y algun boton secundario siguen usando clases locales; visualmente alineados, pero no todos migrados a primitive.

### Overlays de estaciones

Estado: primera migracion Forge aplicada.

Overlays tocados:
- `src/components/DistilleryOverlay.jsx`
- `src/components/EncargosOverlay.jsx`
- `src/components/SigilAltarOverlay.jsx`
- `src/components/BibliotecaOverlay.jsx`
- `src/components/LaboratoryOverlay.jsx`
- `src/components/DeepForgeOverlay.jsx`

Cambios:
- Todos usan `OverlayShell variant="forge"` y `OverlaySurface variant="forge"`.
- Todos suman `fl-station-overlay` con modificador por estacion.
- `forge-light.css` normaliza fondo, superficie, texto, botones y chips heredados dentro de esos overlays.
- Forja no se toca porque ya quedo migrada con `SanctuaryForgeOverlay`.

Riesgo residual:
- La migracion interna profunda de cada overlay queda pendiente: hay inline styles legacy dentro de Laboratorio/Destileria/Encargos/Altar/DeepForge. La piel global evita choque visual fuerte, pero no elimina toda la deuda.
- El script de capturas actual no abre overlays de estaciones, salvo Crafting. Conviene extenderlo.

### Auditoria y dudas

Archivos nuevos:
- `uirefactor/auditorias/final-forge-light-audit.md`
- `uirefactor/dudas-pendientes.md`

### Validacion final de esta fase

Comandos corridos:
- `npm run build`
- `npm run ui:capture`

Resultado:
- Build pasa.
- Capturas principales pasan en `390x844`, `430x932` y `1280x800`.
- `capture-report.md` no registra errores JS.
