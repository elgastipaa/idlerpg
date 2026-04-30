# Auditoria Forge Light - Mochila

Fecha: 2026-04-28
Referencia principal: `uirefactor/Mochila.png`
Referencias inferiores/completas:
- `uirefactor/Mochila_Abajo.png`
- `uirefactor/Mochila_Completa.png`
Capturas actuales:
- `uirefactor/current/mochila-390x844.png`
- `uirefactor/current/mochila-430x932.png`
- `uirefactor/current/mochila-1280x800.png`
- `uirefactor/current/mochila-abajo-390x844.png`
- `uirefactor/current/mochila-abajo-430x932.png`
- `uirefactor/current/mochila-abajo-1280x800.png`

## Estado

Segunda pasada Forge Light aplicada y validada con capturas.

## Cambios aplicados

- `src/components/Inventory.jsx` usa `inventory-root--forge-light`.
- Las cards equipadas tienen superficie oscura, borde bronze/dorado, marco interior, columna visual izquierda y poder destacado a la derecha.
- Se agregaron clases para Loot Filter e inventory rows para dejar de depender solo de inline styles.
- El Loot Filter deja de aparecer como bloque blanco cuando queda visible en viewport.
- `src/components/ExpeditionView.jsx` agrega clases `expedition-root--inventory` y `expedition-root--codex` para skinnear subpantallas sin depender de mobile.
- `src/App.jsx` agrega `app-shell-root--forge-expedition` para que Mochila/Intel no queden dentro de un viewport blanco en desktop.
- `scripts/captureForgeLightScreens.mjs` ahora siembra equipo e inventario de referencia para que `Mochila.png` pueda compararse con un estado representativo.
- `scripts/captureForgeLightScreens.mjs` agrega target `mochila-abajo`, anclado en el Loot Filter para auditar la zona inferior contra `Mochila_Abajo.png`.
- Se marco el set de logros como completado en la semilla de capturas para evitar toasts accidentales encima de la UI.
- Se corrigio un warning React en `Crafting.jsx` por mezclar `border` y `borderLeft` en el mismo style object.
- Segunda pasada inferior:
  - `FILTRO DE LOOT` ahora usa titulo con icono SVG, boton `AJUSTES` sin emoji, presets facetados y cards de rareza con diamante coloreado.
  - `INVENTARIO` suma header con icono, resumen por rareza en cards oscuras y valores mas legibles.
  - Las filas de item agregan marco de arte placeholder por rareza, poder dorado, chips de stats oscuros/verdes y botones Forge para equipar/vender.

## Comparacion contra referencia

Mas cerca:
- Primer viewport mobile muestra titulo `MOCHILA`, contador, upgrades potenciales, seccion `EQUIPADO` y dos piezas equipadas.
- Las cards tienen jerarquia similar: arte/placeholder a la izquierda, tipo/rareza/nombre/stats al centro y poder arriba a la derecha.
- El subtab `Combate / Mochila / Intel` usa estilo Forge oscuro con activo dorado.
- Desktop ya no muestra panel blanco exterior.

Diferencias pendientes:
- La referencia usa ilustraciones de item reales; la implementacion usa SVG placeholder (`combat` / `armor`).
- Loot Filter e Inventario ya no son bloques secundarios genericos: tienen grilla de rarezas, botones facetados, resumen por rareza y rows de item ornamentales.
- La referencia no muestra Loot Filter en el primer viewport; debe quedar debajo de equipados, pero cuando aparece al scrollear debe verse como consola Forge, no como panel legacy.
- La densidad/ornamentacion de las cards se acerco a la referencia; todavia falta arte real de items y una futura decision sobre locks/protecciones por item.
- Los valores de poder de la semilla se recalculan al normalizar items, por eso no buscan clavar exactamente `P 485 / P 285`.

## Criterio actual

Aceptable como segunda pasada MVP de Mochila. La siguiente iteracion debe esperar assets PNG reales de items o concentrarse en item detail modal/locks/protecciones si se busca mayor fidelidad contra `Mochila_Completa.png`.
