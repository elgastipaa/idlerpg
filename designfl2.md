# Forge Light V2 Design Contract

Este archivo resume las decisiones visuales que hay que respetar al migrar pantallas al estilo Forge Light V2.

## Principios

- Todas las pantallas deben tener un background/screen visible.
- Ningun root de pantalla debe tapar el fondo con `background` opaco.
- Las superficies principales deben usar fondos oscuros translúcidos, con baja opacidad, para que el background aporte textura.
- El kit UI manda: tokens, surfaces, buttons, badges, barras, tipografia y micro estados salen de CSS del kit.
- El inline style queda reservado para layout, medidas dinamicas, estados puntuales y variables CSS, no para definir visual base.
- No cambiar layout, tamaños, animaciones, glows o comportamiento salvo pedido explicito.

## Fondos

- El fondo de pantalla se asigna desde `src/styles/forge-light-v2/screens.css` con `data-fl2-screen`.
- La imagen debe vivir en `--fl2-screen-bg`.
- El scrim global debe mantener contraste sin esconder la imagen.
- `.app-primary-viewport`, `.app-shell-content` y roots de pantalla deben ser transparentes.
- Si una pantalla se ve plana u opaca, primero buscar `background: var(--color-background-primary)` o fondos hardcodeados en el root JSX.

## Surfaces

Usar las clases comunes antes de crear estilos nuevos:

- `fl2-inline-panel`: panel/card principal translúcido.
- `fl2-inline-note`: callout o bloque secundario.
- `fl2-inline-modal`: modal/sheet.
- `fl2-inline-surface`: surface genérica.
- `fl2-inline-surface--soft`: surface más liviana.
- `fl2-inline-surface--strong`: surface de mayor contraste.

Las opacidades base viven en `src/styles/forge-light-v2/tokens.css`:

- `--fl2-surface`
- `--fl2-surface-soft`
- `--fl2-surface-strong`
- `--fl2-surface-glass`

## Cards y Separadores

- Evitar apilar cards con borde pesado cuando el contenido puede separarse con ornamentales.
- Preferir separadores ornamentales entre secciones importantes.
- No usar bordes como unica forma de separar todo.
- Las cards repetidas pueden conservar borde sutil si mejora escaneo.
- La textura principal debe venir del background visible detras, no de texturas inventadas en cada card.
- Las cards primarias pueden ir sin borde visible: deben sostenerse con surface translúcida, glow/sombra interna sutil y separador ornamental entre secciones.
- Usar `fl2-primary-card` o un equivalente scoped cuando se quiera el look tipo Combat.

## Titulos De Card

Hay cuatro patrones aceptados:

- Quiet heading: titulo chico y tranquilo, con color segun tema. Sirve para cards compactas como boss weekly o modulos densos.
- Station heading: titulo algo mas prominente con subtitulo debajo. Sirve para estaciones, overlays y paneles con accion principal.
- Line heading: titulo estilo Mochila, uppercase, con linea degradada a la derecha. Sirve para secciones primarias como `EQUIPADO`, `Build actual`, `Lectura Rapida`.
- Account heading: eyebrow chico a color, titulo neutral un poco mas grande y subtitulo explicativo. Sirve para dashboards tipo Mas > Cuenta, weekly ledger y paneles informativos.

Clases reutilizables:

- `fl2-card-title-quiet`
- `fl2-card-title-prominent`
- `fl2-card-title-subtitle`
- `fl2-card-title-line`
- `fl2-card-heading-stack`
- `fl2-card-eyebrow`
- `fl2-card-title-neutral`

## Componentes

- Botones deben copiar estados del kit: hover, active/pressed, glow, disabled y loading.
- Badges deben seguir la estetica del kit, no solo pills genericas.
- Barras de progreso se mantienen como barras, no confundirlas con separadores.
- Rarezas y badges de loot pueden tener formato propio, pero deben heredar tono, borde, glow y peso visual del kit.
- Stats, chips y feedback deben usar los tokens de Forge Light V2.

## Do

- Usar clases CSS del kit antes que inline visual.
- Agregar clases semanticas si una pantalla necesita reglas CSS compartidas.
- Mantener fondos con opacidad baja para que se vea la screen.
- Validar que al scrollear no aparezcan bloques opacos o recuadros no deseados.
- Mantener funciones y comportamiento intactos durante migraciones visuales.

## Don't

- No agregar texturas, fog, overlays o efectos nuevos si no fueron pedidos.
- No cambiar tamaños/layout para que "entre mejor" el estilo.
- No meter fondos grises planos en roots o wrappers.
- No duplicar reglas por pantalla si puede resolverse con token/clase global.
- No usar `forge-light.css` como lugar para acumular reglas sin estructura.
- No depender de `responsive.css` para decisiones visuales del kit salvo layout responsive real.

## Checklist Por Pantalla

- Tiene `data-fl2-screen` correcto.
- Tiene background asignado en `screens.css`.
- Root principal transparente.
- Viewport/contenedor no crea recuadro propio.
- Cards/panels usan surfaces V2.
- Modals/sheets usan `fl2-inline-modal` o equivalente.
- Badges/botones/barras respetan el kit.
- Inline visual reducido al minimo.
- Build pasa.
