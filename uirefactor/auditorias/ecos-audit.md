# Auditoria Forge Light - Ecos

Fecha: 2026-04-28
Referencia: `uirefactor/Ecos.png`
Capturas actuales:
- `uirefactor/current/ecos-390x844.png`
- `uirefactor/current/ecos-430x932.png`
- `uirefactor/current/ecos-1280x800.png`

## Estado

Segunda migracion Forge Light aplicada y validada con capturas.

## Cambios aplicados

- `src/App.jsx` agrega `app-shell-root--forge-prestige` cuando la tab primaria activa es `prestige`.
- `src/components/Prestige.jsx` agrega root `prestige-root--forge-light` y clases especificas para paneles, metric cards, outcome cards y callout de sigilos.
- El panel principal de Ecos suma un crest circular con `ForgeIcon name="essence"`, glow dorado/violeta y jerarquia similar a la referencia.
- Las secciones `Conservas` y `Se reinicia` quedan dentro del primer panel para responder rapido que se mantiene y que se pierde al extraer.
- Las metric cards `Tier actual`, `Momentum` y `Base sin momentum` pasan a superficie oscura Forge con borde bronze.
- `RunSigilCallout` queda envuelto por `prestige-run-sigil-panel` para oscurecerlo y alinearlo con `Ecos.png`.
- `scripts/captureForgeLightScreens.mjs` siembra progreso de run suficiente para que la captura muestre `+9 ecos`, Tier 10, Base 9 y momentum x1.0.
- Segunda pasada:
- Se agregaron clases semanticas `prestige-hero-copy`, `prestige-hero-badges`, `prestige-breakdown-row`, `prestige-reset-copy`, `prestige-outcome-grid` y `prestige-metric-grid`.
- Los badges de disponibles/momentum pasan a placas facetadas, con ajuste especifico para 390px para evitar que se apilen.
- `Conservas` y `Se reinicia` reciben variantes propias con icono SVG, borde verde/rojo, glow interno y fondo oscuro.
- Las metric cards suman ornamento circular en baja opacidad y jerarquia de texto mas cercana a `Ecos.png`.

## Comparacion contra referencia

Mas cerca:
- El primer viewport mobile ya muestra header, panel principal de Ecos, crest grande, `+9 ecos al extraer`, badges de disponibles/momentum, secciones `Conservas` y `Se reinicia`, metric cards y sigilos activos.
- La pantalla ya no queda con fondo blanco/default; usa superficie oscura, borde bronze y glow violeta/dorado.
- Desktop queda oscuro y sin viewport blanco exterior.
- La semilla de captura permite comparar contra la referencia con numeros equivalentes.
- Las secciones `Conservas` y `Se reinicia` ya comunican garantia/advertencia y no parecen cards default.
- Las placas y metric cards tienen mas lectura Forge Light sin sobredorar toda la pantalla.

Diferencias pendientes:
- El header global todavia es el header compacto actual; la referencia muestra un titulo mas ilustrado con icono grande de Ecos y recursos mas ornamentales.
- La referencia tiene marcos con esquinas ornamentales mas marcadas; la implementacion actual usa bordes rectos/radius bajo y glow sutil.
- El crest de Ecos es SVG/CSS; falta asset ilustrado si se busca fidelidad alta al diamante central de la referencia.
- En desktop los badges superiores quedan muy separados por el ancho disponible; es aceptable, pero una segunda pasada podria limitar la grilla para parecerse mas al layout mobile extendido.
- Las secciones inferiores del tablero de ramas siguen usando parte de la UI anterior con skin Forge parcial; no fueron el foco de esta primera pasada.
- El panel principal todavia es mas compacto que la referencia, que usa mas aire vertical y marcos ornamentales de esquina.

## Criterio actual

Aceptable como segunda pasada MVP de Ecos. La siguiente iteracion deberia concentrarse en header global ornamentado, corners de paneles y tablero de ramas/meta para llevar la pantalla de correcta a fiel.
