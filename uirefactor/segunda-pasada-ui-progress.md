# Segunda Pasada UI Forge Light

## Autoridad

- UI Kit: uirefactor/nuevoDesign/UI Kit Forge Light.png
- Design contract: uirefactor/design2.md
- Implementation plan: uirefactor/design-system-implementation-plan.md
- Component inventory: ui-component-inventory.md
- Screen references: uirefactor/ref2/

## Ledger

| Pantalla | Referencia ref2 | Estado | Primitives tocadas | Assets integrados | Capturas revisadas | Deuda residual |
|---|---|---|---|---|---|---|
| Forja / Crafting | uirefactor/ref2/Forja.png | Capturada / aceptada primera iteracion | FlCard, FlButton, FlTabs, FlProgressBar, FlResourceCounter, FlRequirementHint usados; sin API nueva | Item asset via assetRegistry/FlAsset | uirefactor/current/crafting-390x844.png, uirefactor/current/crafting-430x932.png, uirefactor/current/crafting-1280x800.png | Desktop aun prioriza bloque superior; CTA queda bajo fold en 1280x800, aceptado por densidad de referencia y scroll |
| Mochila / Inventario | uirefactor/ref2/Mochila.png, uirefactor/ref2/Mochila_Abajo.png | Capturada / aceptada primera iteracion | FlAsset integrado; layout equipado desktop ajustado | Item assets via assetRegistry/FlAsset | uirefactor/current/mochila-390x844.png, uirefactor/current/mochila-430x932.png, uirefactor/current/mochila-1280x800.png, uirefactor/current/mochila-abajo-390x844.png, uirefactor/current/mochila-abajo-1280x800.png | Deuda: controles del filtro siguen siendo clases locales, aunque visualmente alineadas |
| Santuario | uirefactor/ref2/Santuario.png | Capturada / aceptada segunda iteracion | FlButton usado con slot `icon` en cabecera; sin API nueva | Station assets existentes via assetRegistry/FlIconFrame | uirefactor/current/sanctuary-390x844.png, uirefactor/current/sanctuary-430x932.png, uirefactor/current/sanctuary-1280x800.png | Deuda: CTA fija de expedicion puede tapar ultima estacion en mobile, comportamiento preexistente |
| Heroe / Ficha y Atributos | uirefactor/ref2/Heroe_Ficha.png, uirefactor/ref2/Heroe_Atributos.png | Capturada / aceptada primera iteracion | FlAsset integrado en portrait; sin API nueva | Portrait via assetRegistry/FlAsset | uirefactor/current/hero-ficha-390x844.png, uirefactor/current/hero-ficha-1280x800.png, uirefactor/current/hero-atributos-390x844.png, uirefactor/current/hero-atributos-1280x800.png | Deuda: Atributos mantiene coste en oro y boton de dominio existente; no se cambia gameplay a TP/reset de ref |
| Ecos / Prestige | uirefactor/ref2/Ecos.png | Capturada / aceptada sin cambios de codigo | Primitives visibles ya alineados por CSS Forge; sin API nueva | Sin assets nuevos | uirefactor/current/ecos-390x844.png, uirefactor/current/ecos-430x932.png, uirefactor/current/ecos-1280x800.png | Deuda: `Prestige.jsx` conserva estilos inline/hex legacy; requiere migracion dedicada si se quiere eliminar deuda |
| Combat / Expedicion | uirefactor/ref2/Combat.png, uirefactor/ref2/Combate_Abajo.png | Capturada / aceptada iteracion subtab | SubtabDock/expedition subtabs alineados por CSS contextual | Sin assets nuevos | uirefactor/current/combat-390x844.png, uirefactor/current/combat-1280x800.png, uirefactor/current/intel-1280x800.png | Deuda: composicion de combate actual es mas minimal que ref2, pero sin regresion bloqueante |
| Biblioteca / Intel | uirefactor/ref2/Biblioteca.png | Capturada / aceptada en overlay de estacion | FlCard/FlButton/FlProgressBar via CSS Forge existente; sin API nueva | Recursos de Biblioteca semilla via harness | uirefactor/current/biblioteca-390x844.png, uirefactor/current/biblioteca-430x932.png, uirefactor/current/biblioteca-1280x800.png | Deuda: `Codex.jsx` conserva botones/cards inline; requiere migracion dedicada para eliminar toda deuda local |
| Laboratorio | uirefactor/ref2/Laboratorio.png | Capturada / aceptada en overlay | Overlay Forge normalizado por CSS; sin API nueva | Recursos semilla de Laboratorio | uirefactor/current/laboratorio-390x844.png, uirefactor/current/laboratorio-430x932.png, uirefactor/current/laboratorio-1280x800.png | Deuda: cards internas de research siguen inline; layout desktop aceptado |
| Destileria | uirefactor/ref2/Destileria.png | Capturada / aceptada con seed representativo | Overlay Forge normalizado; botones locales existentes cubiertos por CSS Forge | Cargo semilla y recursos de Santuario | uirefactor/current/destileria-390x844.png, uirefactor/current/destileria-430x932.png, uirefactor/current/destileria-1280x800.png | Deuda: CTA fija de expedicion tapa parte de la tercera card en mobile; comportamiento global preexistente |
| Encargos | uirefactor/ref2/Encargos.png | Capturada / aceptada con seed representativo | Overlay Forge normalizado; botones locales existentes cubiertos por CSS Forge | Jobs semilla claimable/running | uirefactor/current/encargos-390x844.png, uirefactor/current/encargos-430x932.png, uirefactor/current/encargos-1280x800.png | Deuda: `EncargosOverlay.jsx` mantiene botones/cards inline; visual alineada por CSS contextual |
| Altar de Sigilos | uirefactor/ref2/Altar de Sigilos.png | Capturada / aceptada con seed representativo | Overlay Forge normalizado; sin API nueva | Flux semilla y sigilos existentes | uirefactor/current/altar-sigilos-390x844.png, uirefactor/current/altar-sigilos-430x932.png, uirefactor/current/altar-sigilos-1280x800.png | Deuda: algunos acentos semanticos verdes permanecen en secciones de dominio |
| Progreso Offline | uirefactor/ref2/Progreso_Offline.png | Capturada / aceptada primera iteracion | FlCard, FlButton, FlProgressBar y FlAsset usados en App | Mejor drop via getItemAsset/FlAsset | uirefactor/current/progreso-offline-390x844.png, uirefactor/current/progreso-offline-430x932.png, uirefactor/current/progreso-offline-1280x800.png | Deuda: aparece como panel global contextual, no modal hard; aceptado por flujo actual de App |

## Decisiones de Sistema

- 2026-04-29: Las pantallas de accion Forge con CTA deben reservar una banda post-CTA para feedback/estado persistente. Si la accion esta disponible, comunica que esta lista; si esta bloqueada, usa `FlRequirementHint`; si hubo accion reciente, usa el panel de feedback existente. Esto evita huecos de layout y mantiene feedback canonico sin inventar cards locales.
- 2026-04-29: Los overlays Forge de estacion mantienen el header global visible, pero no deben dejar visible la navegacion primaria desktop detras de la superficie activa.
- 2026-04-29: Los overlays de estacion se capturan como superficies reales abiertas desde Santuario; no se valida Biblioteca/Laboratorio/Destileria/Encargos/Altar contra la pestaña Intel generica.
- 2026-04-29: Los resumenes globales tipo Progreso Offline deben usar primitives Forge (`FlCard`, `FlProgressBar`, `FlButton`, `FlAsset`) y no estilos inline light.

## Iteraciones

```txt
Pantalla: Overlays de estacion + Progreso Offline
Referencia ref2 usada: uirefactor/ref2/Biblioteca.png, uirefactor/ref2/Laboratorio.png, uirefactor/ref2/Destileria.png, uirefactor/ref2/Encargos.png, uirefactor/ref2/Altar de Sigilos.png, uirefactor/ref2/Progreso_Offline.png
Captura actual revisada: pendiente; el harness actual solo captura Santuario e Intel, no los overlays de estacion.
Diferencias principales antes:
- Biblioteca de ref2 corresponde al overlay de estacion del Santuario, no a la pestaña Intel actual.
- Laboratorio/Destileria/Encargos/Altar no estan cubiertas por `npm run ui:capture`, por lo que no hay verificacion 390/430/1280.
- Progreso Offline tampoco tiene seed dedicado y no puede compararse contra ref2.
Diagnostico primitive vs pantalla:
- Antes de refactorizar componentes hace falta capturar las superficies reales con estado semilla estable.
Plan corto de iteracion:
- Agregar targets de captura para overlays de estacion y abrirlos desde el Santuario.
- Agregar seed de offline summary para `progreso-offline`.
- Correr build/capture e inspeccionar las nuevas imagenes antes de tocar layout de cada overlay.
Primitives que voy a tocar: ninguna en esta etapa.
Assets que voy a integrar: ninguno nuevo; solo se validan assets existentes.
Archivos esperados a modificar:
- scripts/captureForgeLightScreens.mjs
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Bajo; limitado a harness de captura y estado semilla.
Requiere actualizar design2.md o plan: No todavia; se decidira tras inspeccion.
```

```txt
Pantalla: Progreso Offline
Referencia ref2 usada: uirefactor/ref2/Progreso_Offline.png
Captura actual revisada: uirefactor/current/progreso-offline-390x844.png, uirefactor/current/progreso-offline-1280x800.png
Diferencias principales antes:
- El seed inicial no mostraba el panel porque `serializeSaveGame` limpia `combat.offlineSummary`.
- El componente productivo usa estilos inline light: fondo blanco, chips claros y boton local.
- La referencia pide panel oscuro Forge con progreso, metricas en tarjetas, icono de cierre y mejor drop con asset.
Diagnostico primitive vs pantalla:
- Conviene migrar el panel a primitives existentes en vez de ampliar componentes locales: `FlCard`, `FlProgressBar`, `FlButton`, `FlAsset`.
Plan corto de iteracion:
- Mantener la animacion de conteo/progreso.
- Reemplazar estructura inline por clases Forge y primitives.
- Cargar el asset del mejor drop via `assetRegistry`.
- Corregir el seed para que `progreso-offline` sobreviva a la serializacion.
Primitives que voy a tocar: sin API; uso de FlCard, FlButton, FlProgressBar y FlAsset.
Assets que voy a integrar: item asset para el mejor drop via `getItemAsset`.
Archivos esperados a modificar:
- src/App.jsx
- src/styles/forge-light.css
- scripts/captureForgeLightScreens.mjs
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Medio: el panel aparece en flujo global de App; hay que verificar mobile/desktop y dismiss.
Requiere actualizar design2.md o plan: Si, regla de paneles globales de resumen.
```

```txt
Pantalla: Biblioteca / Intel
Referencia ref2 usada: uirefactor/ref2/Biblioteca.png
Captura actual revisada: uirefactor/current/biblioteca-390x844.png, uirefactor/current/biblioteca-430x932.png, uirefactor/current/biblioteca-1280x800.png
Diferencias principales antes: el harness solo capturaba Intel de expedicion; ref2 correspondia al overlay Biblioteca del Santuario.
Diagnostico primitive vs pantalla: el bloqueo era de captura/seed; el overlay ya hereda la gramatica Forge por `fl-station-overlay`, aunque `Codex.jsx` sigue con botones inline.
Cambios realizados en layout:
- Se agrego target `biblioteca` al harness y se abre desde la row real de Santuario.
- Seed con tinta/polvo visible para validar metricas.
Cambios realizados en primitives:
- Sin API nueva; se normaliza superficie por CSS Forge existente.
Cambios realizados en docs:
- Se registro que Biblioteca ref2 es overlay de estacion, no pestaña Intel.
Primitives usadas/modificadas: FlCard/FlButton/FlProgressBar visibles por estilos Forge existentes; sin tocar APIs.
Assets integrados: recursos semilla; sin asset nuevo.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 48 capturas, sin errores JS; revisado 390x844, 430x932 y 1280x800.
Regresiones detectadas: ninguna JS.
Deuda residual: `Codex.jsx` conserva tabs/buttons inline; migracion dedicada pendiente.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Laboratorio
Referencia ref2 usada: uirefactor/ref2/Laboratorio.png
Captura actual revisada: uirefactor/current/laboratorio-390x844.png, uirefactor/current/laboratorio-430x932.png, uirefactor/current/laboratorio-1280x800.png
Diferencias principales antes: no habia captura dedicada; recursos salian en cero y no se validaba como overlay real.
Diagnostico primitive vs pantalla: la composicion base ya se reconoce; falta migracion profunda de cards internas si se quiere eliminar inline debt.
Cambios realizados en layout:
- Se agrego target `laboratorio` al harness.
- Se cargaron recursos semilla para tinta, polvo y esencia.
Cambios realizados en primitives:
- Se normalizo shell/surface con la regla Forge de overlays de estacion; sin API nueva.
Cambios realizados en docs:
- Plan agrega fase de Progreso Offline; overlays quedan registrados en ledger.
Primitives usadas/modificadas: OverlayShell/OverlaySurface con CSS Forge; sin tocar APIs.
Assets integrados: ninguno nuevo.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 48 capturas, sin errores JS; layout aceptado en mobile y desktop.
Regresiones detectadas: ninguna JS.
Deuda residual: research cards y botones internos siguen inline; visualmente aceptado por CSS contextual.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Destileria
Referencia ref2 usada: uirefactor/ref2/Destileria.png
Captura actual revisada: uirefactor/current/destileria-390x844.png, uirefactor/current/destileria-430x932.png, uirefactor/current/destileria-1280x800.png
Diferencias principales antes: captura sin cargo representativo y sin claims; ref2 muestra bundles listos y recursos.
Diagnostico primitive vs pantalla: seed de captura y overlay CSS eran el primer problema; no hacia falta cambiar gameplay.
Cambios realizados en layout:
- Target `destileria` abre el overlay desde Santuario.
- Seed con 349 bundles, tinta, flux, polvo y un claim listo.
Cambios realizados en primitives:
- Botones locales existentes se cubren con CSS Forge contextual; sin API nueva.
Cambios realizados en docs:
- Ledger actualizado.
Primitives usadas/modificadas: OverlayShell/OverlaySurface; buttons locales heredados cubiertos por `.fl-station-overlay`.
Assets integrados: cargo semilla; sin assets nuevos.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 48 capturas, sin errores JS; 390/430/1280 revisados.
Regresiones detectadas: ninguna JS.
Deuda residual: CTA fija global tapa parte de contenido inferior en mobile; overlay mantiene botones inline.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Encargos
Referencia ref2 usada: uirefactor/ref2/Encargos.png
Captura actual revisada: uirefactor/current/encargos-390x844.png, uirefactor/current/encargos-430x932.png, uirefactor/current/encargos-1280x800.png
Diferencias principales antes: no habia captura dedicada; estado vacio no mostraba equipos ocupados ni recompensa lista.
Diagnostico primitive vs pantalla: la estructura del overlay ya soportaba catalogo, listos y running; faltaba seed estable y normalizacion visual.
Cambios realizados en layout:
- Target `encargos` abre overlay real.
- Seed con 3/3 ocupados, 1 listo y misiones en curso.
Cambios realizados en primitives:
- CSS contextual alinea botones y superficies al Forge kit; sin API nueva.
Cambios realizados en docs:
- Ledger actualizado.
Primitives usadas/modificadas: OverlayShell/OverlaySurface; sin tocar APIs.
Assets integrados: jobs semilla; sin assets nuevos.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 48 capturas, sin errores JS; layout aceptado en mobile/desktop.
Regresiones detectadas: ninguna JS.
Deuda residual: `EncargosOverlay.jsx` conserva botones/cards inline; candidata a wrapper `FlJobCard` futuro.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Altar de Sigilos
Referencia ref2 usada: uirefactor/ref2/Altar de Sigilos.png
Captura actual revisada: uirefactor/current/altar-sigilos-390x844.png, uirefactor/current/altar-sigilos-430x932.png, uirefactor/current/altar-sigilos-1280x800.png
Diferencias principales antes: captura sin flux, por lo que las opciones se veian bloqueadas y menos cercanas a ref2.
Diagnostico primitive vs pantalla: era principalmente seed/estado; la estructura disponible ya coincide en bloques principales.
Cambios realizados en layout:
- Target `altar-sigilos` abre overlay real.
- Seed con 18 flux para validar estado listo.
Cambios realizados en primitives:
- Se normaliza surface de overlay por CSS Forge; sin API nueva.
Cambios realizados en docs:
- Ledger actualizado.
Primitives usadas/modificadas: OverlayShell/OverlaySurface; HorizontalOptionSelector heredado.
Assets integrados: ninguno nuevo.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 48 capturas, sin errores JS; 390/430/1280 revisados.
Regresiones detectadas: ninguna JS.
Deuda residual: acentos verdes de dominio permanecen en secciones internas; aceptado como color semantico.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Progreso Offline
Referencia ref2 usada: uirefactor/ref2/Progreso_Offline.png
Captura actual revisada: uirefactor/current/progreso-offline-390x844.png, uirefactor/current/progreso-offline-430x932.png, uirefactor/current/progreso-offline-1280x800.png
Diferencias principales antes: el panel no aparecia por serializacion y, al aparecer, usaria estilos inline light.
Diagnostico primitive vs pantalla: habia que usar primitives Forge globales en App, no crear un widget local.
Cambios realizados en layout:
- Panel global oscuro con header, progreso, metricas 2/3 columnas y bloque de mejor drop.
- El seed conserva `combat.offlineSummary` despues de `serializeSaveGame`.
Cambios realizados en primitives:
- Se reemplazo la estructura inline por `FlCard`, `FlButton`, `FlProgressBar` y `FlAsset`.
Cambios realizados en docs:
- `design2.md` normaliza Progreso Offline como panel Forge con progress, metricas y asset.
- `design-system-implementation-plan.md` agrega Fase 12b para Progreso Offline.
Primitives usadas/modificadas: FlCard, FlButton, FlProgressBar, FlAsset; sin cambiar APIs.
Assets integrados: mejor drop via `getItemAsset("relic_warblade")` y `FlAsset`.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 48 capturas, sin errores JS; panel visible y estable en 390x844, 430x932 y 1280x800.
Regresiones detectadas: ninguna JS.
Deuda residual: se mantiene como panel global contextual encima del combate, no modal hard aislado, para respetar el flujo actual.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Auditoria final del slice
Referencia ref2 usada: todas las referencias de uirefactor/ref2/ solicitadas en promptUI.md
Captura actual revisada: uirefactor/current/* 390x844, 430x932 y 1280x800 generadas el 2026-04-29T21:55:38.008Z
Diferencias principales antes: deuda heredada de estilos inline, botones locales y emojis/data legacy en varias pantallas.
Diagnostico primitive vs pantalla:
- No se detectaron nuevos paths `/assets/` en componentes; los paths restantes viven en data visual centralizada.
- El slice nuevo usa primitives en Progreso Offline y CSS contextual para overlays heredados.
Cambios realizados en layout: sin cambios adicionales.
Cambios realizados en primitives: sin cambios de API.
Cambios realizados en docs: ledger y decisiones actualizadas.
Primitives usadas/modificadas: FlCard, FlButton, FlProgressBar, FlAsset, OverlayShell/OverlaySurface.
Assets integrados: portrait, items de inventario, mejor drop offline y station/cargo seed de captura.
Comandos corridos:
- rg "background:|borderRadius|boxShadow|#[0-9A-Fa-f]{3,6}" src/components
- rg "/assets/" src/components src/data src/utils
- rg "🎒|📦|🏺|⚔|🛡|🏹|✦|⬢" src
- rg "button" src/components
- rg "fl-button|FlButton|fl-card|FlCard|fl-badge|FlBadge|fl-progress|FlProgressBar|FlTabs|fl-tabs" src
Resultado post-captura:
- Auditorias devuelven deuda heredada abundante en Inventory/Combat/Character/Stats/overlays, pero no bloquean este slice.
- Paths `/assets/` restantes: src/data/futureCombatants.js, src/data/combatVisuals.js.
- Emojis restantes: src/utils/itemVisuals.js y src/data/achievements.js, mas pseudo-elemento decorativo en responsive.css.
Regresiones detectadas: ninguna JS en capture report.
Deuda residual: migrar overlays internos y pantallas legacy a primitives reales para reducir inline styles y botones locales.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Forja / Crafting
Referencia ref2 usada: uirefactor/ref2/Forja.png
Captura actual revisada: uirefactor/current/crafting-390x844.png, uirefactor/current/crafting-1280x800.png
Diferencias principales antes:
- Mobile: la composicion principal esta cerca, pero queda un hueco grande bajo el CTA cuando no hay log ni bloqueo visible.
- Desktop/tablet: la navegacion primaria desktop queda visible detras del overlay y compite con el titulo Forja.
- UI Kit: botones, tabs, progress, recursos e item asset ya usan primitives; no hace falta nueva API.
Diagnostico primitive vs pantalla:
- El hueco post-CTA es una receta de pantalla de accion, no un primitive nuevo.
- La nav visible es problema de shell/overlay, no de Crafting.
Cambios previstos en layout:
- Mostrar feedback persistente post-CTA cuando la accion esta disponible y no hay log reciente.
- Activar una clase de documento mientras el overlay de Forja esta montado y ocultar solo `app-desktop-primary-tabs`.
Cambios previstos en primitives:
- Sin cambios de API; se reutilizan `FlCard`, `FlButton` y `FlRequirementHint`.
Cambios previstos en docs:
- Registrar regla de feedback post-CTA en design2.md y plan.
Primitives que voy a tocar: ninguna API; solo composicion de pantalla con primitives existentes.
Assets que voy a integrar: ninguno nuevo; se conserva item asset via assetRegistry/FlAsset.
Archivos esperados a modificar:
- src/components/Crafting.jsx
- src/components/SanctuaryForgeOverlay.jsx
- src/styles/forge-light.css
- src/styles/responsive.css
- uirefactor/design2.md
- uirefactor/design-system-implementation-plan.md
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Bajo en gameplay; medio en layout desktop/mobile por CSS del overlay.
Requiere actualizar design2.md o plan: Si
```

```txt
Pantalla: Forja / Crafting
Referencia ref2 usada: uirefactor/ref2/Forja.png
Captura actual revisada: uirefactor/current/crafting-390x844.png, uirefactor/current/crafting-430x932.png, uirefactor/current/crafting-1280x800.png
Diferencias principales antes: hueco post-CTA mobile; nav desktop visible detras del overlay.
Diagnostico primitive vs pantalla: se resolvio con composicion de pantalla y regla de shell; sin API nueva.
Cambios realizados en layout:
- Se agrego banda post-CTA de accion lista cuando no hay bloqueo ni log.
- Se oculta la navegacion primaria desktop mientras la Forja overlay esta montada.
Cambios realizados en primitives: ninguno; se reutilizaron `FlCard`, `FlButton`, `FlRequirementHint`.
Cambios realizados en docs:
- `design2.md` documenta banda post-CTA persistente.
- `design-system-implementation-plan.md` agrega gate mobile sin hueco bajo CTA.
Primitives usadas/modificadas: FlCard, FlButton, FlTabs, FlProgressBar, FlResourceCounter, FlRequirementHint; sin modificar APIs.
Assets integrados: item asset via assetRegistry/FlAsset; sin assets nuevos.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 30 capturas generadas, sin errores JS. Forja revisada en 390x844, 430x932 y 1280x800.
Regresiones detectadas: ninguna JS; desktop mantiene CTA bajo fold por densidad.
Deuda residual: posible microcompactacion desktop si se quiere CTA visible en 1280x800 sin scroll.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Ecos / Prestige
Referencia ref2 usada: uirefactor/ref2/Ecos.png
Captura actual revisada: uirefactor/current/ecos-390x844.png, uirefactor/current/ecos-430x932.png, uirefactor/current/ecos-1280x800.png
Diferencias principales antes:
- Layout: la pantalla ya reconoce la referencia: hero de ecos, badges, conservas/se reinicia, metricas y sigilos activos.
- Primitive: cards, badges y metricas se ven Forge por CSS, aunque `Prestige.jsx` todavia mezcla estilos inline.
- Asset: el crest usa iconografia Forge existente; no hay asset faltante.
- Spacing/densidad: desktop tiene algo mas de aire en el hero que ref2, pero no genera hueco funcional ni overflow.
- Estado visual: reset de prestige aparece debajo del primer viewport en mobile, coherente con la pantalla actual.
- Responsive/mobile: 390x844 y 430x932 no muestran overflow de texto relevante.
- Documentacion de sistema: no se consolida regla nueva.
Diagnostico primitive vs pantalla:
- La deuda real es tecnica/legacy de `Prestige.jsx` con estilos inline; no es un problema puntual que justifique tocar primitives ahora.
Plan corto de iteracion:
- No hacer cambios de codigo en esta pantalla.
- Registrar deuda y aceptar captura actual, ya validada por `npm run ui:capture` de la iteracion anterior.
Primitives que voy a tocar: ninguna.
Assets que voy a integrar: ninguno.
Archivos esperados a modificar:
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Nulo; sin cambios funcionales ni visuales.
Requiere actualizar design2.md o plan: No
```

```txt
Pantalla: Ecos / Prestige
Referencia ref2 usada: uirefactor/ref2/Ecos.png
Captura actual revisada: uirefactor/current/ecos-390x844.png, uirefactor/current/ecos-430x932.png, uirefactor/current/ecos-1280x800.png
Diferencias principales antes: desktop algo mas aireado; deuda inline/hex en `Prestige.jsx`.
Diagnostico primitive vs pantalla: layout y componentes visibles aceptables; deuda tecnica queda documentada.
Cambios realizados en layout: ninguno.
Cambios realizados en primitives: ninguno.
Cambios realizados en docs: se registro aceptacion y deuda en este ledger.
Primitives usadas/modificadas: CSS Forge existente sobre Prestige; sin tocar APIs.
Assets integrados: ninguno.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 30 capturas generadas, sin errores JS; Ecos revisada en 390x844, 430x932 y 1280x800.
Regresiones detectadas: ninguna JS.
Deuda residual: migrar `Prestige.jsx` a primitives/props en una pasada dedicada para bajar inline styles y hex legacy.
Requiere otra iteracion antes de avanzar: No
```

```txt
Auditoria slice Forja-Mochila-Santuario-Heroe-Ecos:
- `rg "/assets/" src/components src/data src/utils`: sin resultados en `src/components`; quedan bases centralizadas en `src/data` y `src/utils/assetRegistry`.
- `rg "🎒|📦|🏺|⚔|🛡|🏹|✦|⬢" src`: resultados preexistentes en achievements/itemVisuals y un marker CSS; no se agregaron emojis nuevos de UI final.
- `rg "background:|borderRadius|boxShadow|#[0-9A-Fa-f]{3,6}" src/components`: mucha deuda legacy en overlays/Stats/Prestige; se abordara por pantalla, no globalmente.
- `rg "button" src/components`: confirma botones locales legacy en varias pantallas; los cambios nuevos usaron `FlButton` o botones existentes.
- `rg "fl-button|FlButton|fl-card|FlCard|fl-badge|FlBadge|fl-progress|FlProgressBar|FlTabs|fl-tabs" src`: primitives Forge presentes en Forja/Santuario/Talentos y wrappers compartidos.
```

```txt
Pantalla: Combat / Expedicion
Referencia ref2 usada: uirefactor/ref2/Combat.png, uirefactor/ref2/Combate_Abajo.png
Captura actual revisada: uirefactor/current/combat-390x844.png, uirefactor/current/combat-1280x800.png
Diferencias principales antes:
- Desktop: los subtabs `Combate / Mochila / Intel` aparecen como botones claros legacy arriba del canvas de combate.
- Mobile: usa acciones laterales en vez de subtabs superiores, y no muestra esa regresion.
- Layout: enemigo, barras, stats, contrato y ledger ya estan presentes; no conviene reabrir la composicion completa en esta pasada.
- Primitive: `SubtabDock` ya tiene estilos Forge en Hero y en Expedition inventory/codex, pero falta cubrir Expedition combat desktop.
- Asset: combat background/enemy ya renderizan; sin asset faltante.
- Spacing/densidad: desktop queda visualmente cortado por el dock claro; mobile aceptable.
- Documentacion de sistema: consolidar que subtabs de Expedicion tambien deben seguir gramatica Forge.
Diagnostico primitive vs pantalla:
- Es un ajuste del wrapper `SubtabDock` en contexto Expedition, no de `Combat.jsx`.
Plan corto de iteracion:
- Agregar estilo Forge compartido para `.expedition-root .expedition-subtab-dock` y sus botones.
- Mantener overrides existentes de inventory/codex.
- Actualizar design2.md y plan para nombrar Expedition subtabs explicitamente.
- Correr build/captura y revisar Combat desktop/mobile.
Primitives que voy a tocar: SubtabDock por CSS contextual; sin API.
Assets que voy a integrar: ninguno.
Archivos esperados a modificar:
- src/styles/responsive.css
- uirefactor/design2.md
- uirefactor/design-system-implementation-plan.md
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Bajo/medio: afecta subtabs de Expedition en combat/inventory/codex desktop.
Requiere actualizar design2.md o plan: Si
```

```txt
Pantalla: Combat / Expedicion
Referencia ref2 usada: uirefactor/ref2/Combat.png, uirefactor/ref2/Combate_Abajo.png
Captura actual revisada: uirefactor/current/combat-390x844.png, uirefactor/current/combat-1280x800.png, uirefactor/current/intel-1280x800.png
Diferencias principales antes: dock desktop de Expedicion salia claro/legacy en Combat; mobile no tenia esa regresion.
Diagnostico primitive vs pantalla: ajuste contextual de `SubtabDock` para Expedition; no de `Combat.jsx`.
Cambios realizados en layout:
- El dock `Combate / Mochila / Intel` ahora usa superficie oscura, borde dorado, activo dorado y marcador superior.
- Los overrides existentes de inventory/codex quedan compatibles.
Cambios realizados en primitives:
- Sin API nueva; CSS contextual alinea el componente compartido.
Cambios realizados en docs:
- `design2.md` declara la regla para subtabs de Expedicion.
- `design-system-implementation-plan.md` suma Expedition tabs al uso de `SubtabDock`.
Primitives usadas/modificadas: SubtabDock por CSS; sin modificar API.
Assets integrados: ninguno.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 30 capturas generadas, sin errores JS; Combat desktop/mobile e Intel desktop revisados.
Regresiones detectadas: ninguna JS.
Deuda residual: la composicion de combate actual sigue mas minimal que ref2; no se reabre porque no hay regresion funcional y el prompt lo marca condicional.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Mochila / Inventario
Referencia ref2 usada: uirefactor/ref2/Mochila.png, uirefactor/ref2/Mochila_Abajo.png
Captura actual revisada: uirefactor/current/mochila-390x844.png, uirefactor/current/mochila-abajo-390x844.png, uirefactor/current/mochila-1280x800.png
Diferencias principales antes:
- Layout: mobile equipado se reconoce, pero desktop estira dos cards equipadas a todo el ancho y pierde densidad.
- Primitive: los marcos existen, pero el arte usa `ForgeIcon` directo en lugar de `FlAsset`.
- Asset: existen PNG reales en `public/assets/items`, pero Mochila no los consume.
- Spacing/densidad: filtro de loot mobile queda muy apilado; desktop muestra filtro tarde por cards equipadas demasiado largas.
- Estado visual: rarezas y botones estan alineados al kit; no requiere API nueva.
- Responsive/mobile: 390x844 conserva foco, pero el tramo de filtro necesita compactacion.
- Documentacion de sistema: reforzar regla de asset compartido Crafting/Inventario si hace falta.
Diagnostico primitive vs pantalla:
- El problema de arte es integracion de `FlAsset`/`assetRegistry`, no estilo local.
- La sobreextension desktop es layout local de Inventario.
Plan corto de iteracion:
- Importar `FlAsset` y `getItemAsset`.
- Renderizar assets reales en cards equipadas e inventory rows con fallback `ForgeIcon`.
- Cambiar equipada a dos columnas en desktop para acercar densidad y evitar estiramiento.
- Compactar ligeramente el filtro en mobile sin inventar nuevos controles.
Primitives que voy a tocar: sin API; uso de `FlAsset`.
Assets que voy a integrar: items reales de `public/assets/items` via `assetRegistry`.
Archivos esperados a modificar:
- src/components/Inventory.jsx
- src/styles/responsive.css
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Bajo en gameplay; medio en encuadre de imagen por tamaños responsive.
Requiere actualizar design2.md o plan: No, la regla ya existe en asset workflow.
```

```txt
Pantalla: Mochila / Inventario
Referencia ref2 usada: uirefactor/ref2/Mochila.png, uirefactor/ref2/Mochila_Abajo.png
Captura actual revisada: uirefactor/current/mochila-390x844.png, uirefactor/current/mochila-abajo-390x844.png, uirefactor/current/mochila-1280x800.png, uirefactor/current/mochila-abajo-1280x800.png
Diferencias principales antes: assets de item no renderizados; equipados desktop demasiado estirados; filtro mobile apilado.
Diagnostico primitive vs pantalla: `FlAsset` resolvia integracion de assets; desktop requeria layout local.
Cambios realizados en layout:
- Equipados pasan a dos columnas desde desktop/tablet.
- Se conserva mobile una columna como referencia.
Cambios realizados en primitives:
- Sin API nueva; se integra `FlAsset` en `Inventory`.
Cambios realizados en docs: ninguno, regla ya cubierta por asset workflow.
Primitives usadas/modificadas: FlAsset usado; sin modificar API.
Assets integrados: `mind_lens`, `ironhide_mantle` y filas de inventario via `getItemAsset`.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 30 capturas generadas, sin errores JS; assets visibles en mobile y desktop.
Regresiones detectadas: ninguna JS.
Deuda residual: el filtro de loot conserva botones/clases locales; conviene extraerlo luego a wrapper de dominio si se repite.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Santuario
Referencia ref2 usada: uirefactor/ref2/Santuario.png
Captura actual revisada: uirefactor/current/sanctuary-390x844.png, uirefactor/current/sanctuary-430x932.png, uirefactor/current/sanctuary-1280x800.png
Diferencias principales antes:
- Layout: la composicion general de header, Trabajos y Estaciones coincide, pero la captura actual muestra Trabajos vacio y no permite validar la jerarquia principal de ref2.
- Primitive: botones y paneles ya usan el sistema Forge o wrappers de dominio; no requiere API nueva.
- Asset: estaciones ya entran por assetRegistry/FlIconFrame, aunque la captura vacia reduce el peso visual del panel superior.
- Spacing/densidad: mobile se lee mas compacto que ref2, aceptable por viewport real; desktop conserva la estructura.
- Estado visual: faltan estados claimable/running visibles en captura.
- Responsive/mobile: necesita validar dos rows de trabajo con acciones y progress en 390x844 y 1280x800.
- Documentacion de sistema: no se consolida regla nueva; es un ajuste de seed de captura.
Diagnostico primitive vs pantalla:
- La diferencia principal no es de componente ni layout productivo, sino de datos de captura: el panel de Trabajos ya tiene UI para claimable/running.
Plan corto de iteracion:
- Agregar trabajos semilla al estado de captura para Santuario: uno listo para reclamar y uno en progreso.
- Mantener gameplay intacto; solo cambia el harness de captura.
- Correr build y captura, revisar Santuario mobile/desktop.
Primitives que voy a tocar: ninguna.
Assets que voy a integrar: ninguno nuevo; se validan assets existentes de estaciones.
Archivos esperados a modificar:
- scripts/captureForgeLightScreens.mjs
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Bajo; limitado a capturas visuales.
Requiere actualizar design2.md o plan: No
```

```txt
Pantalla: Santuario
Referencia ref2 usada: uirefactor/ref2/Santuario.png
Captura actual revisada: uirefactor/current/sanctuary-390x844.png, uirefactor/current/sanctuary-1280x800.png
Diferencias principales antes:
- Mobile: el boton `Todo + repetir` de cabecera se parte y gana demasiada altura frente a la referencia.
- Desktop: el panel de Trabajos ya se reconoce, pero conviene mantener icono y etiqueta en una sola linea.
Diagnostico primitive vs pantalla:
- No es un problema de `FlButton`; en esta pantalla el icono se pasaba como children en vez de usar el slot `icon` del primitive.
Plan corto de iteracion:
- Usar el slot `icon` de `FlButton` en las acciones de cabecera de Trabajos.
- Ajustar CSS local de cabecera para evitar wraps en esos botones compactos.
Primitives que voy a tocar: ninguna API; uso correcto de `FlButton`.
Assets que voy a integrar: ninguno.
Archivos esperados a modificar:
- src/components/Sanctuary.jsx
- src/styles/forge-light.css
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Bajo; solo afecta acciones de cabecera del Santuario.
Requiere actualizar design2.md o plan: No
```

```txt
Pantalla: Santuario
Referencia ref2 usada: uirefactor/ref2/Santuario.png
Captura actual revisada: uirefactor/current/sanctuary-390x844.png, uirefactor/current/sanctuary-430x932.png, uirefactor/current/sanctuary-1280x800.png
Diferencias principales antes: Trabajos vacio en captura; boton `Todo + repetir` mobile partido tras activar jobs.
Diagnostico primitive vs pantalla: el panel existente ya soportaba claimable/running; el ajuste fue seed de captura y uso correcto de `FlButton`.
Cambios realizados en layout:
- Captura semilla ahora muestra un encargo listo y una destilacion en progreso.
- Acciones de cabecera de Trabajos mantienen icono y etiqueta en una linea.
Cambios realizados en primitives:
- Sin API nueva; `FlButton` usa su prop `icon` en acciones de cabecera.
Cambios realizados en docs:
- Se registro la iteracion en este ledger; no hubo regla nueva para design2.md.
Primitives usadas/modificadas: FlButton, FlIconFrame y wrappers de Santuario existentes; sin modificar APIs.
Assets integrados: assets de estaciones existentes via assetRegistry/FlIconFrame; sin assets nuevos.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 30 capturas generadas, sin errores JS. Santuario revisado en 390x844, 430x932 y 1280x800.
Regresiones detectadas: ninguna JS.
Deuda residual: CTA fija de expedicion tapa parte de la lista inferior en mobile, pero no bloquea Trabajos ni Estaciones principales y era comportamiento previo.
Requiere otra iteracion antes de avanzar: No
```

```txt
Pantalla: Heroe / Ficha y Atributos
Referencia ref2 usada: uirefactor/ref2/Heroe_Ficha.png, uirefactor/ref2/Heroe_Atributos.png
Captura actual revisada: uirefactor/current/hero-ficha-390x844.png, uirefactor/current/hero-ficha-1280x800.png, uirefactor/current/hero-atributos-390x844.png, uirefactor/current/hero-atributos-1280x800.png
Diferencias principales antes:
- Ficha: layout de portrait + resumen + barras ya se reconoce, pero el portrait se carga con path `/assets/` directo desde `Character.jsx`.
- Atributos: filas, icon frames, progreso y coste se parecen a ref2; la referencia muestra TP/reset, pero el flujo actual usa oro y no corresponde cambiar gameplay.
- Primitive: Ficha deberia usar `FlAsset`/assetRegistry como el resto de pantallas con imagen real.
- Asset: portrait real ya existe en `public/assets/portraits/classes`; falta centralizar su entrada.
- Spacing/densidad: mobile y desktop estan razonablemente cerca; no conviene una remaquetacion grande.
- Estado visual: tabs y badges del heroe se mantienen consistentes.
- Responsive/mobile: no hay overflow importante en 390x844/430x932.
- Documentacion de sistema: no se agrega regla nueva, se aplica la existente de asset workflow.
Diagnostico primitive vs pantalla:
- La deuda importante es asset workflow de Ficha, no layout ni primitive nuevo.
- Atributos tiene botones de coste de dominio ya existentes; no se introduce boton local nuevo.
Plan corto de iteracion:
- Reemplazar path directo de portrait por `getClassPortraitAsset` y `FlAsset`.
- Mantener el encuadre actual del portrait con CSS para el wrapper de `FlAsset`.
- Correr build y captura, revisar Ficha/Atributos en mobile y desktop.
Primitives que voy a tocar: sin API; uso de `FlAsset`.
Assets que voy a integrar: portraits de clase via `assetRegistry`.
Archivos esperados a modificar:
- src/components/Character.jsx
- src/styles/responsive.css
- uirefactor/segunda-pasada-ui-progress.md
Riesgo de regresion:
- Bajo/medio: posible cambio de encuadre del portrait si el wrapper no calza.
Requiere actualizar design2.md o plan: No
```

```txt
Pantalla: Heroe / Ficha y Atributos
Referencia ref2 usada: uirefactor/ref2/Heroe_Ficha.png, uirefactor/ref2/Heroe_Atributos.png
Captura actual revisada: uirefactor/current/hero-ficha-390x844.png, uirefactor/current/hero-ficha-1280x800.png, uirefactor/current/hero-atributos-390x844.png, uirefactor/current/hero-atributos-1280x800.png
Diferencias principales antes: portrait con path directo; Atributos visualmente cerca pero con economia de oro propia del juego.
Diagnostico primitive vs pantalla: se resolvio asset workflow de Ficha con `FlAsset`; no se cambio Atributos por ser dominio/gameplay.
Cambios realizados en layout:
- Se mantuvo composicion y encuadre de Ficha/Atributos.
- Se agrego wrapper CSS para que `FlAsset` ocupe el marco de portrait sin alterar crop.
Cambios realizados en primitives:
- Sin API nueva; `Character` consume `FlAsset`.
Cambios realizados en docs:
- Se registra en este ledger; regla de asset workflow ya existia.
Primitives usadas/modificadas: FlAsset usado; sin modificar API.
Assets integrados: portraits de clase via `getClassPortraitAsset`.
Comandos corridos: npm run build; npm run ui:capture.
Resultado post-captura: 30 capturas generadas, sin errores JS; Ficha y Atributos revisados en mobile y desktop.
Regresiones detectadas: ninguna JS ni cambio de encuadre visible.
Deuda residual: Atributos conserva boton de coste local de dominio y oro en vez de TP/reset de referencia; cambiarlo implicaria gameplay.
Requiere otra iteracion antes de avanzar: No
```
