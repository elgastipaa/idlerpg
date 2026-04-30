# Inventario de Componentes UI - Idle RPG Mobile

Documento de arquitectura de componentes para construir un Design System completo del juego. No define estilo visual, colores, arte ni direccion visual. El foco es estructura, reutilizacion, estados, datos e interacciones mobile-first.

## Principios de Cobertura

- Mobile first: todos los componentes deben funcionar con tactil, pantallas estrechas, una mano, scroll vertical y overlays.
- Reutilizacion: separar primitivos, patrones compuestos y componentes especificos de dominio.
- Estados sistematicos: todo componente interactivo debe contemplar default, hover/focus, pressed, disabled, loading, success y error cuando aplique.
- Idle-first: priorizar lectura rapida de progreso, timers, recursos, recompensas pendientes, comparacion de items y acciones repetibles.
- Accesibilidad funcional: targets tactiles claros, texto escalable, estados no dependientes solo de color, confirmaciones para acciones destructivas.

## Componentes Base

### Button

- Descripcion: Control tactil para ejecutar una accion inmediata.
- Donde se usa: Combate, inventario, crafting, talentos, santuario, ecos, expedicion, modales, onboarding.
- Variantes: primary, secondary, tertiary, ghost, destructive, confirm, compact, icon-only, full-width, split-action.
- Estados: default, hover/focus, pressed, disabled, loading, success, error, selected.
- Datos que muestra: Label, icono opcional, coste opcional, contador opcional, estado de disponibilidad.
- Interacciones del usuario: Tap, long press opcional para detalle, disabled con razon visible via tooltip/sheet.
- Nivel de prioridad: Core

### Icon Button

- Descripcion: Boton compacto basado en icono para acciones frecuentes o de navegacion.
- Donde se usa: Cerrar overlays, ordenar inventario, filtrar, equipar, comparar, reclamar, pausar/resumir jobs.
- Variantes: standard, compact, destructive, toggle, floating, toolbar.
- Estados: default, hover/focus, pressed, disabled, loading, active, error.
- Datos que muestra: Icono, badge opcional, tooltip opcional, estado activo/inactivo.
- Interacciones del usuario: Tap, long press para descripcion, toggle en variantes activables.
- Nivel de prioridad: Core

### Toggle

- Descripcion: Control binario para activar o desactivar una preferencia o filtro.
- Donde se usa: Filtros de loot, auto-salvage, mostrar comparacion, activar notificaciones, opciones de accesibilidad.
- Variantes: switch, checkbox, compact, setting-row.
- Estados: off, on, disabled, loading, error.
- Datos que muestra: Label, descripcion breve opcional, valor actual.
- Interacciones del usuario: Tap para alternar.
- Nivel de prioridad: Core

### Segmented Control

- Descripcion: Selector de opciones mutuamente excluyentes en una fila o grupo compacto.
- Donde se usa: Vista de inventario, tabs internas, filtros de rareza, seleccion de tier, modos de crafting.
- Variantes: two-option, multi-option, icon-only, scrollable.
- Estados: default, selected, disabled, pressed, overflow.
- Datos que muestra: Opciones, iconos opcionales, contadores por opcion.
- Interacciones del usuario: Tap para cambiar seleccion, swipe horizontal si desborda.
- Nivel de prioridad: Core

### Input Field

- Descripcion: Campo para ingresar texto, numeros o codigos.
- Donde se usa: Busqueda de inventario, nombres de loadout, codigos promocionales, filtros numericos, debug interno si aplica.
- Variantes: text, numeric, search, read-only, with-clear, with-stepper.
- Estados: default, focused, disabled, loading, success, error, empty.
- Datos que muestra: Valor, placeholder, label, mensaje de validacion.
- Interacciones del usuario: Tap para editar, limpiar, submit desde teclado.
- Nivel de prioridad: Important

### Stepper

- Descripcion: Control para aumentar o reducir cantidades discretas.
- Donde se usa: Cantidad de materiales, lotes de crafting, conversiones, compras, asignacion de puntos si aplica.
- Variantes: plus-minus, compact, with-max, numeric-entry.
- Estados: default, min, max, disabled, pressed, error.
- Datos que muestra: Valor actual, minimo, maximo, incremento.
- Interacciones del usuario: Tap en sumar/restar, long press para incremento continuo, ingresar valor manual.
- Nivel de prioridad: Important

### Slider

- Descripcion: Control para elegir un valor dentro de un rango continuo o discreto.
- Donde se usa: Umbral de loot filter, volumen, velocidad visual, cantidad porcentual de conversion.
- Variantes: continuous, stepped, range, compact.
- Estados: default, dragging, disabled, error.
- Datos que muestra: Valor actual, min/max, marcas opcionales, unidad.
- Interacciones del usuario: Drag, tap en pista, ajuste fino con stepper si aplica.
- Nivel de prioridad: Important

### Select Menu

- Descripcion: Selector desplegable o sheet para elegir una opcion de una lista.
- Donde se usa: Ordenar inventario, seleccionar job, filtro de item type, tier de expedicion, build/loadout.
- Variantes: dropdown, bottom-sheet, searchable, multi-select, compact.
- Estados: closed, open, selected, disabled, loading, empty, error.
- Datos que muestra: Opcion actual, lista de opciones, iconos/contadores opcionales.
- Interacciones del usuario: Tap para abrir, tap para seleccionar, buscar, limpiar.
- Nivel de prioridad: Core

### Text Link

- Descripcion: Accion secundaria embebida en texto o filas informativas.
- Donde se usa: Ver detalles, abrir codex, ir a fuente de recurso, ayuda contextual.
- Variantes: inline, standalone, external, subtle.
- Estados: default, hover/focus, pressed, disabled.
- Datos que muestra: Label, icono opcional.
- Interacciones del usuario: Tap.
- Nivel de prioridad: Important

### Badge

- Descripcion: Indicador compacto de categoria, estado, cantidad o alerta.
- Donde se usa: Rareza, nivel, tier, nuevo item, job listo, boss, locked, equipped, upgrade.
- Variantes: status, count, rarity, tier, lock, notification, comparison-delta.
- Estados: default, active, disabled, success, warning, error, new.
- Datos que muestra: Texto corto, numero, icono, simbolo.
- Interacciones del usuario: No interactivo por defecto; tap opcional para tooltip.
- Nivel de prioridad: Core

### Tag / Chip

- Descripcion: Etiqueta compacta para clasificar o filtrar contenido.
- Donde se usa: Afijos, tipos de item, clases, efectos, slots, jobs, mutadores de expedicion.
- Variantes: static, selectable, removable, filter, compact.
- Estados: default, selected, disabled, pressed, removable.
- Datos que muestra: Label, icono opcional, contador opcional.
- Interacciones del usuario: Tap para filtrar/seleccionar, tap en cerrar para remover.
- Nivel de prioridad: Core

### Tooltip

- Descripcion: Ayuda contextual breve asociada a un elemento.
- Donde se usa: Stats, iconos, costes, locks, rareza, afijos, timers, efectos de talento.
- Variantes: simple, rich, stat-breakdown, locked-reason, cost-breakdown.
- Estados: hidden, visible, loading, error.
- Datos que muestra: Titulo, descripcion, valores, prerequisitos, fuente.
- Interacciones del usuario: Long press, tap en icono de ayuda, hover/focus en desktop.
- Nivel de prioridad: Core

### Popover

- Descripcion: Panel contextual pequeno para acciones o detalles sin cambiar de pantalla.
- Donde se usa: Acciones de item, resumen de recurso, detalle de stat, opciones rapidas de job.
- Variantes: action-menu, info, preview, compact.
- Estados: closed, open, loading, error.
- Datos que muestra: Acciones, resumen, valores, enlaces internos.
- Interacciones del usuario: Tap para abrir, tap fuera para cerrar, seleccionar accion.
- Nivel de prioridad: Important

### Modal Dialog

- Descripcion: Overlay bloqueante para decisiones importantes o informacion que requiere foco.
- Donde se usa: Confirmar prestige, descartar item, reclamar recompensas grandes, errores criticos.
- Variantes: confirmation, destructive, reward, error, form, blocking.
- Estados: closed, opening, open, loading, success, error.
- Datos que muestra: Titulo, cuerpo, acciones, consecuencias, costes, recompensas.
- Interacciones del usuario: Confirmar, cancelar, cerrar, accion secundaria.
- Nivel de prioridad: Core

### Bottom Sheet

- Descripcion: Overlay mobile-first desde la parte inferior para detalle o seleccion.
- Donde se usa: Detalle de item, filtros, selector de job, comparacion, recompensas, ayuda.
- Variantes: peek, half-height, full-height, draggable, nested-actions.
- Estados: closed, opening, open, expanded, loading, error.
- Datos que muestra: Header, contenido contextual, acciones persistentes, scroll interno.
- Interacciones del usuario: Swipe para expandir/cerrar, tap fuera, acciones internas.
- Nivel de prioridad: Core

### Drawer

- Descripcion: Panel lateral o contextual para navegacion secundaria o listas extensas.
- Donde se usa: Menu principal alternativo, codex, historial, configuracion avanzada.
- Variantes: left, right, overlay, persistent en tablet.
- Estados: closed, open, loading, empty.
- Datos que muestra: Navegacion, secciones, acciones.
- Interacciones del usuario: Swipe, tap menu, cerrar.
- Nivel de prioridad: Optional

### Toast

- Descripcion: Mensaje temporal no bloqueante para feedback inmediato.
- Donde se usa: Loot obtenido, item equipado, crafting exitoso, error menor, job iniciado.
- Variantes: info, success, warning, error, reward, undo.
- Estados: queued, visible, dismissing, paused.
- Datos que muestra: Mensaje, icono, accion opcional, cantidad opcional.
- Interacciones del usuario: Tap accion, swipe para cerrar, tap para abrir detalle si aplica.
- Nivel de prioridad: Core

### Alert Banner

- Descripcion: Mensaje persistente dentro de una pantalla para advertencias o informacion relevante.
- Donde se usa: Inventario lleno, recursos insuficientes, offline rewards pendientes, boss disponible.
- Variantes: info, warning, error, success, callout.
- Estados: visible, dismissed, loading, error.
- Datos que muestra: Mensaje, icono, accion opcional.
- Interacciones del usuario: Tap accion, cerrar si es descartable.
- Nivel de prioridad: Core

### Loading Indicator

- Descripcion: Indicador generico de carga o procesamiento.
- Donde se usa: Acciones async, generacion de resultados, carga de pantallas, guardado.
- Variantes: spinner, inline, full-screen, button-contained, skeleton.
- Estados: active, delayed, failed, complete.
- Datos que muestra: Mensaje opcional, progreso opcional.
- Interacciones del usuario: No interactivo; cancelar si se combina con accion.
- Nivel de prioridad: Core

### Skeleton Placeholder

- Descripcion: Placeholder estructural mientras carga contenido.
- Donde se usa: Listas de items, expediciones, codex, santuario, recompensas.
- Variantes: card, row, avatar, stat, grid, panel.
- Estados: loading, replaced, error.
- Datos que muestra: Estructura aproximada sin datos reales.
- Interacciones del usuario: No interactivo.
- Nivel de prioridad: Important

### Empty State

- Descripcion: Estado para listas, tabs o pantallas sin contenido disponible.
- Donde se usa: Inventario vacio, sin jobs, sin talentos disponibles, sin recompensas, sin resultados de busqueda.
- Variantes: neutral, actionable, locked, filtered, error-empty.
- Estados: default, filtered, locked, loading, error.
- Datos que muestra: Mensaje, razon, accion sugerida, icono opcional.
- Interacciones del usuario: Tap en accion principal o limpiar filtros.
- Nivel de prioridad: Core

### Error State

- Descripcion: Estado reusable para fallos de carga, validacion o accion.
- Donde se usa: Pantallas, overlays, formularios, jobs, crafting, guardado.
- Variantes: inline, full-panel, modal, retryable, blocking.
- Estados: error, retrying, recovered.
- Datos que muestra: Mensaje, codigo opcional, accion de reintentar, detalle opcional.
- Interacciones del usuario: Reintentar, cerrar, reportar si aplica.
- Nivel de prioridad: Core

### Progress Bar

- Descripcion: Barra lineal de progreso con valor actual y objetivo.
- Donde se usa: Experiencia, vida, job timers, crafting, expedicion, tiers, objetivos.
- Variantes: determinate, indeterminate, segmented, compact, labeled, stacked.
- Estados: default, active, paused, complete, failed, locked.
- Datos que muestra: Valor actual, maximo, porcentaje, label, ETA opcional.
- Interacciones del usuario: Tap/long press para ver desglose o fuente.
- Nivel de prioridad: Core

### Circular Progress

- Descripcion: Indicador radial para timers o progreso compacto.
- Donde se usa: Jobs del santuario, cooldowns, habilidades pasivas, reclamos pendientes.
- Variantes: determinate, countdown, icon-centered, compact.
- Estados: active, paused, complete, disabled, error.
- Datos que muestra: Porcentaje, tiempo restante, icono central, estado.
- Interacciones del usuario: Tap para detalle, long press para tooltip.
- Nivel de prioridad: Important

### Resource Counter

- Descripcion: Indicador de recurso persistente o contextual.
- Donde se usa: Oro, materiales, ecos, energia si existe, llaves, fragmentos, puntos de talento.
- Variantes: compact, expanded, with-cap, delta, animated-change, tappable.
- Estados: default, increasing, decreasing, insufficient, capped, loading.
- Datos que muestra: Icono, cantidad, capacidad, delta, fuente opcional.
- Interacciones del usuario: Tap para abrir detalle/fuentes, long press para tooltip.
- Nivel de prioridad: Core

### Cost Display

- Descripcion: Presentacion reusable de costes de accion.
- Donde se usa: Crafting, upgrades, talentos, jobs, expediciones, prestige.
- Variantes: single-resource, multi-resource, discounted, insufficient, optional-cost.
- Estados: affordable, insufficient, loading, error.
- Datos que muestra: Recursos requeridos, recursos actuales, deficit, modificadores.
- Interacciones del usuario: Tap recurso para fuente o detalle.
- Nivel de prioridad: Core

### Reward Display

- Descripcion: Presentacion reusable de recompensas obtenidas o posibles.
- Donde se usa: Loot, jobs, expediciones, bosses, offline rewards, achievements, ecos.
- Variantes: guaranteed, possible, random-range, claimed, pending, chest.
- Estados: preview, pending, claimable, claimed, loading, error.
- Datos que muestra: Items, recursos, cantidades, rarezas, probabilidades si aplica.
- Interacciones del usuario: Tap para detalle, reclamar, comparar item.
- Nivel de prioridad: Core

### Timer Display

- Descripcion: Muestra duracion, ETA, cuenta regresiva o tiempo transcurrido.
- Donde se usa: Santuario, jobs, expedicion, offline progress, cooldowns, eventos.
- Variantes: countdown, elapsed, ETA, compact, relative, absolute.
- Estados: active, paused, complete, expired, delayed, error.
- Datos que muestra: Tiempo restante, total, estado, modificadores de velocidad.
- Interacciones del usuario: Tap para detalle del timer o aceleradores.
- Nivel de prioridad: Core

### Stat Row

- Descripcion: Fila estandar para mostrar un atributo o valor numerico.
- Donde se usa: Atributos, comparacion de item, detalles de enemigo, resumen de build.
- Variantes: basic, with-delta, with-breakdown, compact, grouped.
- Estados: default, increased, decreased, capped, modified, locked.
- Datos que muestra: Nombre de stat, valor, delta, fuente, icono opcional.
- Interacciones del usuario: Tap/long press para desglose.
- Nivel de prioridad: Core

### Delta Indicator

- Descripcion: Indicador reusable de cambio positivo, negativo o neutro entre valores.
- Donde se usa: Comparacion de equipamiento, upgrades, talentos, crafting preview, prestige preview.
- Variantes: numeric, percentage, arrow, before-after, aggregate.
- Estados: positive, negative, neutral, unknown, loading.
- Datos que muestra: Valor anterior, valor nuevo, diferencia, unidad.
- Interacciones del usuario: Tap para ver desglose.
- Nivel de prioridad: Core

### Divider

- Descripcion: Separador estructural entre bloques o grupos.
- Donde se usa: Listas, panels, overlays, formularios, detalles de item.
- Variantes: horizontal, vertical, inset, labeled.
- Estados: default.
- Datos que muestra: Label opcional.
- Interacciones del usuario: No interactivo.
- Nivel de prioridad: Important

### Section Header

- Descripcion: Cabecera reusable para agrupar contenido en una pantalla o panel.
- Donde se usa: Todas las pantallas con secciones: stats, inventario, forge, talentos, jobs.
- Variantes: basic, with-action, collapsible, sticky, compact.
- Estados: default, collapsed, expanded, loading.
- Datos que muestra: Titulo, subtitulo, contador, accion opcional.
- Interacciones del usuario: Tap en accion, expandir/colapsar si aplica.
- Nivel de prioridad: Core

### Collapsible Panel

- Descripcion: Contenedor plegable para contenido secundario o avanzado.
- Donde se usa: Detalles de stats, afijos, historial, filtros avanzados, desglose de rewards.
- Variantes: single, accordion, nested, compact.
- Estados: collapsed, expanded, disabled, loading, error.
- Datos que muestra: Header, contenido, contador o resumen.
- Interacciones del usuario: Tap para expandir/colapsar.
- Nivel de prioridad: Important

### Card

- Descripcion: Contenedor reusable para representar una entidad o grupo de datos.
- Donde se usa: Items, jobs, talentos, expediciones, bosses, recompensas, objetivos.
- Variantes: static, interactive, selected, compact, dense, featured.
- Estados: default, pressed, selected, disabled, locked, loading, success, error.
- Datos que muestra: Titulo, icono/imagen, metadata, acciones, progreso opcional.
- Interacciones del usuario: Tap para abrir detalle, acciones internas.
- Nivel de prioridad: Core

### List Row

- Descripcion: Elemento de lista compacto para mobile.
- Donde se usa: Inventario, recursos, jobs, historial, opciones, atributos, recompensas.
- Variantes: one-line, two-line, with-leading-icon, with-trailing-action, selectable.
- Estados: default, pressed, selected, disabled, loading, error.
- Datos que muestra: Label, descripcion, icono, valor, accion, badge.
- Interacciones del usuario: Tap, swipe actions opcional, long press.
- Nivel de prioridad: Core

### Grid Tile

- Descripcion: Celda tactil para colecciones visuales o densas.
- Donde se usa: Inventario, materiales, talentos, nodos, recompensas, slots de equipo.
- Variantes: square, rectangular, locked, selectable, draggable, compact.
- Estados: default, pressed, selected, disabled, locked, empty, loading, new.
- Datos que muestra: Icono/imagen, cantidad, rareza, nivel, badges.
- Interacciones del usuario: Tap para detalle, long press para preview, drag si aplica.
- Nivel de prioridad: Core

### Avatar / Entity Portrait

- Descripcion: Representacion visual de heroe, enemigo, boss o NPC funcional.
- Donde se usa: Combate, ficha de heroe, expedicion, bosses, santuario.
- Variantes: hero, enemy, boss, worker/job, placeholder, compact.
- Estados: default, active, defeated, locked, loading, highlighted.
- Datos que muestra: Imagen/icono, nombre opcional, nivel, estado.
- Interacciones del usuario: Tap para detalle.
- Nivel de prioridad: Important

### Icon

- Descripcion: Primitivo reusable para simbolos de acciones, recursos, stats y categorias.
- Donde se usa: Todo el sistema.
- Variantes: action, resource, stat, item-type, status, navigation, system.
- Estados: default, active, disabled, loading.
- Datos que muestra: Simbolo semantico.
- Interacciones del usuario: No interactivo salvo dentro de controles.
- Nivel de prioridad: Core

### Label

- Descripcion: Texto corto reusable para nombres, encabezados menores y metadata.
- Donde se usa: Formularios, stats, tarjetas, listas, badges compuestos.
- Variantes: title, caption, overline, value-label, helper, error.
- Estados: default, disabled, error, success, muted.
- Datos que muestra: Texto.
- Interacciones del usuario: No interactivo.
- Nivel de prioridad: Core

### Value Display

- Descripcion: Presentacion consistente de numeros, cantidades y unidades.
- Donde se usa: Stats, recursos, recompensas, costes, timers, DPS, HP.
- Variantes: integer, decimal, compact-number, percentage, range, signed.
- Estados: default, updating, capped, insufficient, modified.
- Datos que muestra: Valor, unidad, abreviatura, delta opcional.
- Interacciones del usuario: Tap para desglose si se configura.
- Nivel de prioridad: Core

### Search Bar

- Descripcion: Campo especializado para buscar dentro de colecciones.
- Donde se usa: Inventario, codex, talentos, historial, blueprint/recetas.
- Variantes: inline, sticky, with-filter-button, compact.
- Estados: empty, focused, populated, loading, no-results, disabled.
- Datos que muestra: Query, placeholder, boton limpiar, contador de resultados.
- Interacciones del usuario: Escribir, limpiar, submit, abrir filtros.
- Nivel de prioridad: Important

### Filter Panel

- Descripcion: Panel reusable para filtrar colecciones.
- Donde se usa: Inventario, loot, codex, crafting recipes, expediciones, jobs.
- Variantes: bottom-sheet, inline, advanced, quick-filter.
- Estados: closed, open, active-filters, disabled, loading.
- Datos que muestra: Filtros disponibles, seleccion actual, contador de resultados.
- Interacciones del usuario: Seleccionar filtros, limpiar, aplicar, cancelar.
- Nivel de prioridad: Core

### Sort Control

- Descripcion: Control para ordenar listas o grids.
- Donde se usa: Inventario, recompensas, jobs, expediciones, recetas.
- Variantes: select, toggle-direction, quick-sort, segmented.
- Estados: default, active, disabled, loading.
- Datos que muestra: Criterio actual, direccion, opciones.
- Interacciones del usuario: Seleccionar criterio, invertir direccion.
- Nivel de prioridad: Core

### Pagination / Virtual List Sentinel

- Descripcion: Patron para cargar o renderizar colecciones largas de forma eficiente.
- Donde se usa: Inventario grande, historial, codex, loot log.
- Variantes: infinite-scroll, load-more, virtualized, page-tabs.
- Estados: idle, loading-more, end, error.
- Datos que muestra: Estado de carga, cantidad restante opcional.
- Interacciones del usuario: Scroll, tap cargar mas si aplica.
- Nivel de prioridad: Important

## Navegacion y Estructura

### App Shell

- Descripcion: Estructura global que contiene navegacion, pantalla activa y capas de overlay.
- Donde se usa: Toda la aplicacion.
- Variantes: mobile, tablet, debug, onboarding-locked.
- Estados: ready, loading, offline, syncing, modal-open.
- Datos que muestra: Pantalla activa, recursos globales, badges de notificacion.
- Interacciones del usuario: Navegacion principal, apertura de overlays.
- Nivel de prioridad: Core

### Top Status Bar

- Descripcion: Barra superior con informacion persistente del estado del jugador.
- Donde se usa: Pantallas principales.
- Variantes: compact, expanded, combat, non-combat, hidden-in-overlay.
- Estados: default, resource-updating, warning, offline.
- Datos que muestra: Recursos principales, nivel, energia si aplica, notificaciones.
- Interacciones del usuario: Tap en recurso o perfil para detalle.
- Nivel de prioridad: Core

### Bottom Navigation

- Descripcion: Navegacion principal mobile entre areas clave del juego.
- Donde se usa: App shell.
- Variantes: icon-label, icon-only, scrollable, with-center-action.
- Estados: default, active, disabled, locked, notification.
- Datos que muestra: Secciones, iconos, labels, badges.
- Interacciones del usuario: Tap para cambiar pantalla, long press para tooltip.
- Nivel de prioridad: Core

### Tab Bar

- Descripcion: Navegacion secundaria dentro de una pantalla.
- Donde se usa: Heroe, inventario, santuario, talentos, crafting, expedicion.
- Variantes: fixed, scrollable, segmented, icon-only, with-badges.
- Estados: default, active, disabled, locked, loading.
- Datos que muestra: Tabs, contadores, estado locked/new.
- Interacciones del usuario: Tap, swipe horizontal si aplica.
- Nivel de prioridad: Core

### Subtab Dock

- Descripcion: Navegacion terciaria compacta para subsecciones profundas.
- Donde se usa: Santuario, crafting avanzado, inventario, talentos.
- Variantes: horizontal-scroll, compact-icons, sticky.
- Estados: default, active, disabled, locked, notification.
- Datos que muestra: Subtabs, badges, progreso.
- Interacciones del usuario: Tap para cambiar subvista.
- Nivel de prioridad: Important

### Breadcrumb / Path Indicator

- Descripcion: Indicador de jerarquia para flujos profundos.
- Donde se usa: Crafting avanzado, codex, expediciones por tier, arbol de talentos si hay zoom.
- Variantes: text, compact, icon-path.
- Estados: default, current, disabled.
- Datos que muestra: Ruta actual, niveles anteriores.
- Interacciones del usuario: Tap para volver a nivel anterior.
- Nivel de prioridad: Optional

### Screen Header

- Descripcion: Encabezado de pantalla con titulo, resumen y acciones.
- Donde se usa: Todas las pantallas principales.
- Variantes: simple, with-summary, with-actions, sticky, compact.
- Estados: default, loading, error, locked.
- Datos que muestra: Titulo, subtitulo, progreso, acciones contextuales.
- Interacciones del usuario: Acciones de header, ayuda, filtros.
- Nivel de prioridad: Core

### Sticky Action Bar

- Descripcion: Barra fija de acciones primarias al borde inferior o superior.
- Donde se usa: Detalle de item, crafting preview, prestige confirm, boss fight, jobs.
- Variantes: single-action, multi-action, cost-action, confirmation.
- Estados: default, disabled, loading, success, error.
- Datos que muestra: Acciones, coste, disponibilidad, resumen.
- Interacciones del usuario: Tap accion principal/secundaria.
- Nivel de prioridad: Core

### Floating Action Button

- Descripcion: Accion contextual flotante para uso frecuente.
- Donde se usa: Reclamar todo, abrir filtros, crear craft, iniciar job, abrir loot.
- Variantes: single, expandable, icon-only, with-badge.
- Estados: default, pressed, disabled, loading, hidden, notification.
- Datos que muestra: Icono, badge, label opcional.
- Interacciones del usuario: Tap, expandir acciones.
- Nivel de prioridad: Optional

### Overlay Shell

- Descripcion: Estructura reusable para overlays con header, contenido scrollable y acciones.
- Donde se usa: Forge, santuario, codex, detalle de item, recompensas, laboratorio.
- Variantes: modal, bottom-sheet, full-screen, station-overlay.
- Estados: open, loading, error, dirty, success.
- Datos que muestra: Titulo, descripcion, contenido, acciones persistentes.
- Interacciones del usuario: Cerrar, confirmar, scroll, acciones internas.
- Nivel de prioridad: Core

### Back Control

- Descripcion: Control consistente para volver a pantalla o nivel anterior.
- Donde se usa: Overlays, pantallas profundas, flujos de detalle.
- Variantes: icon-only, text, gesture-backed.
- Estados: default, pressed, disabled.
- Datos que muestra: Icono, label opcional.
- Interacciones del usuario: Tap, gesto nativo si existe.
- Nivel de prioridad: Core

## Feedback, Sistema y Estados Globales

### Notification Badge

- Descripcion: Indicador de atencion pendiente en navegacion o entidades.
- Donde se usa: Tabs, bottom nav, items nuevos, jobs completados, talentos disponibles.
- Variantes: dot, count, priority, new, claimable.
- Estados: hidden, visible, capped-count, urgent.
- Datos que muestra: Punto, numero, simbolo.
- Interacciones del usuario: Tap en elemento padre.
- Nivel de prioridad: Core

### Activity Indicator

- Descripcion: Indica que un sistema esta trabajando en segundo plano.
- Donde se usa: Auto-combate, jobs, guardado, syncing, simulacion idle.
- Variantes: inline, status-bar, per-system, compact.
- Estados: active, paused, complete, error, offline.
- Datos que muestra: Estado, sistema afectado, tiempo opcional.
- Interacciones del usuario: Tap para detalle.
- Nivel de prioridad: Important

### Save / Sync Status

- Descripcion: Indicador de guardado local o sincronizacion.
- Donde se usa: App shell, settings, overlays criticos.
- Variantes: local-save, cloud-sync, offline, conflict, error.
- Estados: saved, saving, failed, offline, conflict, retrying.
- Datos que muestra: Estado, timestamp, accion de retry.
- Interacciones del usuario: Tap para detalle o reintentar.
- Nivel de prioridad: Important

### Offline Progress Summary

- Descripcion: Resumen de progreso acumulado mientras el jugador estuvo fuera.
- Donde se usa: Login/resume, pantalla de combate, recompensas.
- Variantes: compact, full-modal, reward-breakdown, capped.
- Estados: available, claiming, claimed, error, no-progress.
- Datos que muestra: Tiempo offline, loot, recursos, XP, kills, limites alcanzados.
- Interacciones del usuario: Reclamar, ver detalle, descartar si aplica.
- Nivel de prioridad: Core

### Confirmation Sheet

- Descripcion: Confirmacion mobile-first para acciones sensibles.
- Donde se usa: Prestige, destruir items, gastar recursos raros, cancelar jobs, reset talentos.
- Variantes: standard, destructive, irreversible, high-cost, type-to-confirm opcional.
- Estados: open, confirming, success, error.
- Datos que muestra: Accion, consecuencias, coste, perdida/ganancia, botones.
- Interacciones del usuario: Confirmar, cancelar, revisar detalle.
- Nivel de prioridad: Core

### Undo Snackbar

- Descripcion: Feedback temporal con posibilidad de revertir una accion reciente.
- Donde se usa: Salvage, venta, filtro aplicado, mover item, limpiar lista.
- Variantes: single-undo, multi-action, timed.
- Estados: visible, undone, expired, error.
- Datos que muestra: Accion realizada, tiempo opcional, boton deshacer.
- Interacciones del usuario: Tap deshacer, cerrar.
- Nivel de prioridad: Important

### Help Entry

- Descripcion: Acceso contextual a explicaciones de sistemas.
- Donde se usa: Atributos, ecos, crafting, expedicion, santuario, talentos.
- Variantes: icon, inline-link, sheet-entry, codex-link.
- Estados: default, pressed, disabled.
- Datos que muestra: Icono/label, tema.
- Interacciones del usuario: Tap para abrir ayuda o codex.
- Nivel de prioridad: Important

### Tutorial Coach Mark

- Descripcion: Indicador contextual para onboarding sobre un elemento de UI.
- Donde se usa: Primer combate, equipar item, crafting inicial, talentos, jobs, prestige.
- Variantes: spotlight, tooltip, step-card, blocking, non-blocking.
- Estados: hidden, active, completed, skipped.
- Datos que muestra: Paso, instruccion, accion esperada, progreso.
- Interacciones del usuario: Continuar, saltar, realizar accion objetivo.
- Nivel de prioridad: Important

### Guided Task Checklist

- Descripcion: Lista de objetivos de onboarding o progresion temprana.
- Donde se usa: Onboarding, metas activas, objetivos diarios/semanales si existen.
- Variantes: compact, expanded, pinned, reward-linked.
- Estados: active, completed, claimable, locked, expired.
- Datos que muestra: Tareas, progreso, recompensa, prioridad.
- Interacciones del usuario: Tap tarea para navegar, reclamar recompensa.
- Nivel de prioridad: Important

### System Message Log

- Descripcion: Historial de eventos relevantes del sistema.
- Donde se usa: Combate, loot, jobs, errores, progreso offline.
- Variantes: compact-feed, full-log, filterable, combat-only, economy-only.
- Estados: empty, populated, filtered, loading.
- Datos que muestra: Timestamp, tipo de evento, mensaje, recompensa.
- Interacciones del usuario: Scroll, filtrar, tap evento para detalle.
- Nivel de prioridad: Important

## Combate Automatico

### Combat Screen

- Descripcion: Pantalla principal del combate automatico.
- Donde se usa: Seccion de combate.
- Variantes: normal, boss, expedition, offline-preview, defeat.
- Estados: idle, fighting, victory, defeat, transitioning, loading, paused.
- Datos que muestra: Heroe, enemigo, vida, progreso, loot, acciones contextuales, log.
- Interacciones del usuario: Cambiar zona/tier, ver detalle, reclamar loot, abrir build.
- Nivel de prioridad: Core

### Combatant Panel

- Descripcion: Panel para heroe o enemigo en combate.
- Donde se usa: Combat screen, boss preview, expedicion.
- Variantes: hero, enemy, boss, minion, compact.
- Estados: alive, attacking, damaged, defeated, buffed, debuffed, loading.
- Datos que muestra: Nombre, nivel, retrato, HP, efectos, stats clave.
- Interacciones del usuario: Tap para detalle, long press sobre efectos.
- Nivel de prioridad: Core

### Health Bar

- Descripcion: Barra especializada para vida actual/maxima.
- Donde se usa: Heroe, enemigo, bosses, preview de combate.
- Variantes: hero, enemy, boss, shielded, segmented, compact.
- Estados: full, damaged, critical, regenerating, shielded, empty.
- Datos que muestra: HP actual, HP maximo, porcentaje, escudo opcional.
- Interacciones del usuario: Tap para desglose de vida/defensas.
- Nivel de prioridad: Core

### Auto Combat Status

- Descripcion: Indicador de estado del combate automatico.
- Donde se usa: Combat screen, app shell, offline summary.
- Variantes: running, paused, farming, boss, blocked, offline.
- Estados: active, paused, waiting, defeated, error.
- Datos que muestra: Estado, zona, kills/min, tiempo, motivo de bloqueo.
- Interacciones del usuario: Tap para ir a combate o ver detalle.
- Nivel de prioridad: Core

### Enemy Card

- Descripcion: Tarjeta de enemigo actual o proximo.
- Donde se usa: Combate, expedicion, codex.
- Variantes: current, next, boss, codex, defeated.
- Estados: default, attacking, defeated, locked, loading.
- Datos que muestra: Nombre, nivel, retrato, tipo, habilidades, loot posible.
- Interacciones del usuario: Tap para detalle/codex.
- Nivel de prioridad: Core

### Boss Preview Card

- Descripcion: Resumen previo a un enfrentamiento de boss.
- Donde se usa: Expedicion, tiers, eventos, combate especial.
- Variantes: locked, available, defeated, repeatable, weekly.
- Estados: locked, ready, active, defeated, claimable, loading.
- Datos que muestra: Boss, requisitos, poder recomendado, recompensas, progreso.
- Interacciones del usuario: Iniciar, ver recompensas, ver requisitos.
- Nivel de prioridad: Core

### Combat Log Feed

- Descripcion: Feed compacto de eventos de combate.
- Donde se usa: Combat screen, historial, debug visible si aplica.
- Variantes: compact, expanded, damage-only, loot-only, system.
- Estados: empty, streaming, paused, filtered.
- Datos que muestra: Golpes, criticos, kills, drops, efectos, timestamps.
- Interacciones del usuario: Expandir, filtrar, pausar scroll.
- Nivel de prioridad: Important

### Damage Number

- Descripcion: Indicador temporal de dano, curacion o bloqueo.
- Donde se usa: Escena de combate.
- Variantes: damage, critical, heal, block, dodge, dot, hot.
- Estados: spawning, animating, fading.
- Datos que muestra: Valor, tipo, fuente opcional.
- Interacciones del usuario: No interactivo.
- Nivel de prioridad: Important

### Status Effect Icon

- Descripcion: Icono compacto de buff, debuff o efecto temporal.
- Donde se usa: Combatant panel, item detail, talents, bosses.
- Variantes: buff, debuff, dot, hot, aura, passive, stackable.
- Estados: active, expiring, stacked, disabled, unknown.
- Datos que muestra: Icono, stacks, duracion, tooltip con efecto.
- Interacciones del usuario: Tap/long press para detalle.
- Nivel de prioridad: Core

### Loot Drop Callout

- Descripcion: Notificacion visual de drop relevante.
- Donde se usa: Combate, offline rewards, expedicion.
- Variantes: item, currency, material, rare-drop, multi-drop.
- Estados: appearing, visible, claimed, dismissed.
- Datos que muestra: Item/recurso, cantidad, rareza, nuevo/equipable.
- Interacciones del usuario: Tap para detalle o abrir loot.
- Nivel de prioridad: Core

### Zone Selector

- Descripcion: Selector de zona, area o dificultad de farmeo.
- Donde se usa: Combate, expedicion si comparte estructura.
- Variantes: list, carousel, tiered, locked, recommended.
- Estados: selected, available, locked, loading, recommended.
- Datos que muestra: Zona, nivel, progreso, loot, requisitos.
- Interacciones del usuario: Seleccionar zona, ver detalle, navegar a requisito.
- Nivel de prioridad: Core

### Encounter Progress Tracker

- Descripcion: Indicador de avance hacia el siguiente encuentro, boss o tier.
- Donde se usa: Combate, expedicion.
- Variantes: kills-to-boss, wave-progress, tier-progress, milestone.
- Estados: active, complete, blocked, reset, loading.
- Datos que muestra: Progreso actual, objetivo, recompensa/milestone.
- Interacciones del usuario: Tap para ver ruta y rewards.
- Nivel de prioridad: Core

## Heroe, Atributos y Build

### Character Sheet

- Descripcion: Pantalla o panel de resumen del personaje.
- Donde se usa: Seccion Heroe.
- Variantes: overview, attributes, equipment, build-summary, compact.
- Estados: default, loading, modified, level-up, error.
- Datos que muestra: Nivel, clase, poder, stats, equipo, talentos clave.
- Interacciones del usuario: Cambiar tab, abrir detalles, equipar, asignar puntos.
- Nivel de prioridad: Core

### Hero Summary Card

- Descripcion: Resumen rapido del estado del heroe.
- Donde se usa: Heroe, combate, app shell, prestige preview.
- Variantes: compact, expanded, combat, build.
- Estados: default, level-up, modified, loading.
- Datos que muestra: Nombre/clase, nivel, XP, poder, stats principales.
- Interacciones del usuario: Tap para abrir ficha.
- Nivel de prioridad: Core

### Experience Bar

- Descripcion: Barra especializada de experiencia y nivel.
- Donde se usa: Hero summary, character sheet, combat rewards.
- Variantes: compact, labeled, milestone, capped.
- Estados: progressing, level-up-ready, capped, loading.
- Datos que muestra: Nivel actual, XP actual, XP requerida, porcentaje.
- Interacciones del usuario: Tap para detalle de fuentes de XP.
- Nivel de prioridad: Core

### Attribute Grid

- Descripcion: Grid/lista de atributos principales y derivados.
- Donde se usa: Pantalla Atributos, comparacion, prestige preview.
- Variantes: primary, secondary, derived, compact, grouped.
- Estados: default, modified, increased, decreased, capped.
- Datos que muestra: Fuerza/inteligencia/etc., dano, defensa, critico, velocidad, fuentes.
- Interacciones del usuario: Tap atributo para desglose.
- Nivel de prioridad: Core

### Attribute Detail Sheet

- Descripcion: Detalle de calculo y fuentes de un atributo.
- Donde se usa: Desde Attribute Grid, item comparison, talents.
- Variantes: breakdown, formula, sources, history.
- Estados: loading, ready, error.
- Datos que muestra: Valor base, equipo, talentos, buffs, multiplicadores.
- Interacciones del usuario: Scroll, abrir fuentes, cerrar.
- Nivel de prioridad: Important

### Power Rating Display

- Descripcion: Indicador agregado del poder o capacidad del personaje.
- Donde se usa: Heroe, expedicion, boss preview, comparacion.
- Variantes: current, recommended, delta, capped.
- Estados: default, below-recommended, above-recommended, updating.
- Datos que muestra: Poder actual, recomendado, diferencia, tendencia.
- Interacciones del usuario: Tap para desglose de contribuciones.
- Nivel de prioridad: Core

### Equipment Slot

- Descripcion: Slot tactil para una pieza equipada.
- Donde se usa: Pantalla de equipo, comparacion, loadouts.
- Variantes: weapon, armor, accessory, relic, empty, locked.
- Estados: empty, equipped, selected, upgrade-available, locked, disabled.
- Datos que muestra: Icono item, rareza, nivel, badge upgrade, lock.
- Interacciones del usuario: Tap para detalle, cambiar item, desequipar.
- Nivel de prioridad: Core

### Equipment Layout

- Descripcion: Agrupacion de slots de equipo.
- Donde se usa: Character sheet, inventory compare.
- Variantes: full, compact, slot-list, by-category.
- Estados: default, loading, modified.
- Datos que muestra: Slots, items equipados, upgrades disponibles.
- Interacciones del usuario: Tap slot, abrir lista de candidatos.
- Nivel de prioridad: Core

### Build Summary

- Descripcion: Resumen de identidad mecanica de la build.
- Donde se usa: Heroe, talentos, prestige, expedicion.
- Variantes: offensive, defensive, balanced, class-specific, compact.
- Estados: default, incomplete, modified, loading.
- Datos que muestra: Stats principales, talentos clave, efectos activos, fortalezas.
- Interacciones del usuario: Tap para detalle o recomendaciones.
- Nivel de prioridad: Important

### Loadout Selector

- Descripcion: Selector de configuraciones guardadas de equipo/talentos.
- Donde se usa: Heroe, inventario, expedicion, bosses.
- Variantes: tabs, list, compact, locked-slots.
- Estados: selected, empty, locked, modified, saving, error.
- Datos que muestra: Nombre, poder, tags, estado guardado.
- Interacciones del usuario: Seleccionar, guardar, renombrar, duplicar, borrar.
- Nivel de prioridad: Optional

### Stat Comparison Panel

- Descripcion: Comparacion entre estado actual y propuesta de cambio.
- Donde se usa: Equipar item, crafting preview, talentos, prestige.
- Variantes: compact, full, only-changed, grouped.
- Estados: default, positive, negative, mixed, loading.
- Datos que muestra: Stats antes/despues, deltas, impacto agregado.
- Interacciones del usuario: Expandir detalle, filtrar cambios.
- Nivel de prioridad: Core

## Inventario y Loot

### Inventory Screen

- Descripcion: Pantalla principal para gestionar items y materiales.
- Donde se usa: Seccion Inventario/Mochila.
- Variantes: grid, list, equipment-focused, materials, loot-stash.
- Estados: loading, empty, populated, full, filtered, error.
- Datos que muestra: Items, capacidad, filtros, orden, acciones masivas.
- Interacciones del usuario: Scroll, filtrar, ordenar, seleccionar, abrir item.
- Nivel de prioridad: Core

### Inventory Capacity Indicator

- Descripcion: Indicador de ocupacion de mochila o stash.
- Donde se usa: Inventario, loot summary, alerts.
- Variantes: compact, full, warning, capped.
- Estados: normal, near-full, full, over-cap, loading.
- Datos que muestra: Slots usados, capacidad maxima, porcentaje.
- Interacciones del usuario: Tap para ver opciones de limpieza/expansion.
- Nivel de prioridad: Core

### Item Tile

- Descripcion: Representacion compacta de un item en grid.
- Donde se usa: Inventario, loot, equipo, crafting materials.
- Variantes: equipment, material, consumable, relic, blueprint, empty.
- Estados: default, selected, equipped, locked, new, upgrade, disabled, loading.
- Datos que muestra: Icono, rareza, nivel, cantidad, badges, lock.
- Interacciones del usuario: Tap detalle, long press preview, multi-select.
- Nivel de prioridad: Core

### Item Row

- Descripcion: Representacion horizontal de un item con mas metadata.
- Donde se usa: List view, comparison candidates, rewards, stash.
- Variantes: compact, detailed, selectable, action-row.
- Estados: default, selected, equipped, locked, new, disabled.
- Datos que muestra: Nombre, tipo, nivel, stats clave, cantidad, badges.
- Interacciones del usuario: Tap detalle, swipe actions, seleccionar.
- Nivel de prioridad: Core

### Item Detail Sheet

- Descripcion: Detalle completo de un item y sus acciones.
- Donde se usa: Desde inventario, loot, rewards, crafting.
- Variantes: equipment, material, consumable, blueprint, relic, comparison.
- Estados: open, loading, equipped, locked, error.
- Datos que muestra: Nombre, rareza, tipo, stats, afijos, efectos, valor, acciones.
- Interacciones del usuario: Equipar, desequipar, comparar, bloquear, destruir, usar, cerrar.
- Nivel de prioridad: Core

### Item Comparison Sheet

- Descripcion: Comparacion directa entre item seleccionado y equipado/candidato.
- Donde se usa: Inventario, loot, crafting result.
- Variantes: side-by-side, stacked-mobile, stat-delta, multi-candidate.
- Estados: loading, comparable, no-equipped-item, error.
- Datos que muestra: Ambos items, stats, deltas, efectos, poder estimado.
- Interacciones del usuario: Equipar, mantener, bloquear, salvage, alternar candidato.
- Nivel de prioridad: Core

### Item Action Menu

- Descripcion: Menu contextual de acciones sobre un item.
- Donde se usa: Item tile, item detail, inventory multi-select.
- Variantes: equipment, material, locked-item, destructive, bulk.
- Estados: open, disabled-actions, loading, error.
- Datos que muestra: Acciones disponibles, razones de bloqueo, costes/rewards.
- Interacciones del usuario: Seleccionar accion, cancelar.
- Nivel de prioridad: Core

### Rarity Indicator

- Descripcion: Indicador semantico de rareza de item o recompensa.
- Donde se usa: Items, loot, rewards, crafting, bosses.
- Variantes: border-token, badge, label, icon, compact.
- Estados: common, uncommon, rare, epic, legendary, unique, unknown.
- Datos que muestra: Nivel de rareza y nombre.
- Interacciones del usuario: Tap/long press para explicacion de rareza.
- Nivel de prioridad: Core

### Item Level Badge

- Descripcion: Badge compacto para nivel o poder del item.
- Donde se usa: Item tile, detail, comparison, crafting.
- Variantes: level, item-power, required-level, upgraded.
- Estados: default, above-player, below-player, capped.
- Datos que muestra: Nivel, poder, requisito.
- Interacciones del usuario: Tap para tooltip.
- Nivel de prioridad: Core

### Item Affix List

- Descripcion: Lista de modificadores o afijos de un item.
- Donde se usa: Item detail, comparison, crafting preview.
- Variantes: primary, secondary, implicit, crafted, locked, rerollable.
- Estados: default, improved, reduced, locked, modified, preview.
- Datos que muestra: Nombre del afijo, valor, rango, tier, fuente.
- Interacciones del usuario: Tap afijo para detalle/rango, seleccionar para reroll si aplica.
- Nivel de prioridad: Core

### Item Lock Control

- Descripcion: Control para proteger items de acciones destructivas.
- Donde se usa: Item tile, detail, bulk actions.
- Variantes: lock-toggle, protected-badge, bulk-lock.
- Estados: locked, unlocked, disabled, loading.
- Datos que muestra: Estado protegido.
- Interacciones del usuario: Tap para bloquear/desbloquear, confirmar en bulk si aplica.
- Nivel de prioridad: Core

### Multi Select Toolbar

- Descripcion: Barra de acciones para seleccion multiple.
- Donde se usa: Inventario, loot, materiales, stash.
- Variantes: bottom-bar, sticky-header, compact, destructive.
- Estados: hidden, active, loading, partial-disabled.
- Datos que muestra: Cantidad seleccionada, acciones disponibles, resumen de rewards/costes.
- Interacciones del usuario: Seleccionar todo, limpiar, ejecutar accion masiva.
- Nivel de prioridad: Core

### Bulk Action Confirmation

- Descripcion: Confirmacion para acciones masivas.
- Donde se usa: Salvage, vender, bloquear, mover, reclamar.
- Variantes: salvage, sell, destroy, move, claim.
- Estados: open, confirming, success, error.
- Datos que muestra: Cantidad afectada, items protegidos omitidos, recursos ganados/perdidos.
- Interacciones del usuario: Confirmar, cancelar, ver detalle.
- Nivel de prioridad: Core

### Loot Summary Panel

- Descripcion: Resumen de loot reciente o acumulado.
- Donde se usa: Combate, offline progress, expedicion, boss rewards.
- Variantes: compact, detailed, grouped, claimable.
- Estados: empty, accumulating, claimable, claimed, overflow, error.
- Datos que muestra: Items, recursos, rarezas, tiempo, origen.
- Interacciones del usuario: Reclamar, abrir detalle, filtrar, comparar.
- Nivel de prioridad: Core

### Loot Filter Builder

- Descripcion: Constructor de reglas para conservar, resaltar o destruir loot.
- Donde se usa: Inventario, combate, settings avanzados.
- Variantes: simple, advanced, per-rarity, per-stat, per-item-type.
- Estados: default, active, disabled, invalid, saved, error.
- Datos que muestra: Reglas, prioridad, excepciones, resumen de impacto.
- Interacciones del usuario: Crear/editar reglas, activar, probar, resetear.
- Nivel de prioridad: Important

### Auto Salvage Rule Row

- Descripcion: Fila editable de una regla de reciclaje automatico.
- Donde se usa: Loot filter builder, settings.
- Variantes: rarity-rule, item-type-rule, stat-threshold-rule, exception.
- Estados: active, inactive, invalid, editing, disabled.
- Datos que muestra: Condicion, accion, prioridad, excepciones.
- Interacciones del usuario: Toggle, editar, borrar, reordenar.
- Nivel de prioridad: Important

### Material Stack

- Descripcion: Representacion de materiales acumulables.
- Donde se usa: Inventario, crafting, rewards, costs.
- Variantes: compact, detailed, capped, insufficient, source-linked.
- Estados: default, increasing, decreasing, insufficient, capped.
- Datos que muestra: Material, cantidad, capacidad, fuente, uso.
- Interacciones del usuario: Tap para detalle/fuentes/recetas.
- Nivel de prioridad: Core

### Stash Transfer Control

- Descripcion: Control para mover items entre mochila, stash o sistemas.
- Donde se usa: Inventario, santuario, crafting, loot overflow.
- Variantes: move-one, move-many, deposit-all, withdraw, auto-transfer.
- Estados: default, disabled, loading, success, error, full.
- Datos que muestra: Origen, destino, capacidad, cantidad.
- Interacciones del usuario: Tap mover, elegir cantidad, confirmar si hay overflow.
- Nivel de prioridad: Optional

## Crafting / Forja

### Crafting Screen

- Descripcion: Pantalla principal de forja y modificacion de items.
- Donde se usa: Seccion Crafting/Forja.
- Variantes: recipe-list, station-based, selected-item, advanced.
- Estados: loading, idle, item-selected, crafting, success, error, locked.
- Datos que muestra: Recetas, materiales, item objetivo, costes, resultado esperado.
- Interacciones del usuario: Seleccionar receta/item, ajustar parametros, ejecutar craft.
- Nivel de prioridad: Core

### Forge Station Card

- Descripcion: Tarjeta para una estacion o modo de crafting.
- Donde se usa: Forja, santuario si hay estaciones.
- Variantes: forge, extraction, distillery, blueprint, upgrade, reroll, locked.
- Estados: available, selected, locked, busy, complete, error.
- Datos que muestra: Nombre, descripcion funcional, coste, estado, unlock.
- Interacciones del usuario: Seleccionar estacion, abrir detalle.
- Nivel de prioridad: Core

### Recipe Card

- Descripcion: Representacion de una receta craftable.
- Donde se usa: Lista de recetas, blueprint forge, codex.
- Variantes: equipment, material, upgrade, conversion, locked, discovered.
- Estados: craftable, insufficient, locked, selected, loading.
- Datos que muestra: Resultado, materiales, tiempo si aplica, prerequisitos.
- Interacciones del usuario: Tap para preview, craft, ver fuentes.
- Nivel de prioridad: Core

### Recipe Detail Sheet

- Descripcion: Detalle completo de una receta y sus resultados.
- Donde se usa: Crafting screen, codex, blueprint forge.
- Variantes: deterministic, random-roll, upgrade, conversion, batch.
- Estados: ready, insufficient, locked, crafting, success, error.
- Datos que muestra: Resultado, costes, probabilidades, rango de stats, prerequisitos.
- Interacciones del usuario: Ajustar cantidad, craft, ver materiales faltantes.
- Nivel de prioridad: Core

### Crafting Input Slot

- Descripcion: Slot para item o material requerido por una receta.
- Donde se usa: Forja, reroll, extraction, upgrade.
- Variantes: required, optional, catalyst, target-item, material.
- Estados: empty, filled, invalid, locked, disabled, loading.
- Datos que muestra: Requisito, item colocado, cantidad, validez.
- Interacciones del usuario: Tap para seleccionar, remover, cambiar.
- Nivel de prioridad: Core

### Crafting Result Preview

- Descripcion: Vista previa del resultado esperado de una accion de crafting.
- Donde se usa: Forja, upgrade, reroll, extraction, blueprint.
- Variantes: exact, range, probabilistic, before-after, unknown.
- Estados: empty, preview-ready, insufficient, crafting, success, error.
- Datos que muestra: Item/recurso resultante, stats, rangos, probabilidades, deltas.
- Interacciones del usuario: Tap detalles, comparar, confirmar craft.
- Nivel de prioridad: Core

### Crafting Action Button

- Descripcion: Boton especializado para ejecutar una accion de forja.
- Donde se usa: Crafting screen, recipe detail, sticky action bar.
- Variantes: craft, upgrade, reroll, extract, batch, instant.
- Estados: ready, disabled, insufficient, loading, success, error.
- Datos que muestra: Accion, coste resumido, cantidad, tiempo si aplica.
- Interacciones del usuario: Tap para ejecutar, confirmar si consume item raro.
- Nivel de prioridad: Core

### Batch Craft Control

- Descripcion: Control para ejecutar crafting en multiples unidades.
- Donde se usa: Conversion de materiales, consumibles, upgrades repetibles.
- Variantes: amount-stepper, craft-max, percentage, repeat-until-resource-empty.
- Estados: default, maxed, insufficient, crafting, error.
- Datos que muestra: Cantidad, coste total, resultado total, limite.
- Interacciones del usuario: Ajustar cantidad, craft max, confirmar.
- Nivel de prioridad: Important

### Material Requirement List

- Descripcion: Lista reutilizable de materiales necesarios.
- Donde se usa: Crafting, talents, jobs, expeditions, prestige.
- Variantes: compact, detailed, grouped, missing-only.
- Estados: affordable, insufficient, loading, locked.
- Datos que muestra: Materiales, cantidad requerida, cantidad disponible, deficit.
- Interacciones del usuario: Tap material para fuentes.
- Nivel de prioridad: Core

### Source Finder Sheet

- Descripcion: Vista que indica donde conseguir un recurso o material.
- Donde se usa: Cost displays, crafting, talents, jobs.
- Variantes: material, currency, item, talent-point, unlock.
- Estados: loading, sources-found, no-sources, locked.
- Datos que muestra: Fuentes, tasas estimadas, requisitos, accesos directos.
- Interacciones del usuario: Navegar a fuente, cerrar.
- Nivel de prioridad: Important

### Crafting Queue

- Descripcion: Lista de trabajos de crafting en curso si el sistema usa timers.
- Donde se usa: Forja, santuario, jobs.
- Variantes: single-slot, multi-slot, priority-queue, completed.
- Estados: empty, active, paused, complete, blocked, error.
- Datos que muestra: Receta, tiempo restante, resultado, slots, estado.
- Interacciones del usuario: Reclamar, cancelar, acelerar, reordenar si aplica.
- Nivel de prioridad: Important

### Crafting History Log

- Descripcion: Historial de crafts recientes.
- Donde se usa: Forja, item detail, logs.
- Variantes: compact, detailed, filterable.
- Estados: empty, populated, filtered.
- Datos que muestra: Receta, resultado, coste, timestamp, exito/fallo.
- Interacciones del usuario: Tap para detalle/repetir craft.
- Nivel de prioridad: Optional

### Reroll Affix Selector

- Descripcion: Selector de afijo objetivo para reroll o mejora.
- Donde se usa: Crafting avanzado, item detail.
- Variantes: single-select, locked-affixes, previewable, weighted.
- Estados: selectable, selected, locked, invalid, loading.
- Datos que muestra: Afijos actuales, rangos, coste, resultado posible.
- Interacciones del usuario: Seleccionar afijo, bloquear, confirmar.
- Nivel de prioridad: Important

### Upgrade Track

- Descripcion: Indicador de nivel de mejora de un item o estacion.
- Donde se usa: Item upgrades, forge station upgrades, relics.
- Variantes: linear, stepped, capped, branching.
- Estados: default, upgradeable, capped, locked, loading.
- Datos que muestra: Nivel actual, siguiente nivel, coste, bonus.
- Interacciones del usuario: Tap nivel para detalle, mejorar.
- Nivel de prioridad: Important

### Blueprint Card

- Descripcion: Representacion de plano/receta desbloqueable.
- Donde se usa: Blueprint forge, codex, rewards.
- Variantes: locked, discovered, craftable, mastered.
- Estados: locked, available, selected, new, completed.
- Datos que muestra: Nombre, resultado, requisito, progreso, fuente.
- Interacciones del usuario: Tap detalle, craft/desbloquear.
- Nivel de prioridad: Important

### Extraction Result Panel

- Descripcion: Resultado de extraer componentes, afijos o recursos de un item.
- Donde se usa: Extraction overlay, item actions.
- Variantes: preview, final, partial, failed.
- Estados: empty, preview-ready, extracting, success, error.
- Datos que muestra: Item consumido, recursos obtenidos, probabilidades, perdida.
- Interacciones del usuario: Confirmar, reclamar, ver detalle.
- Nivel de prioridad: Important

## Talentos y Arbol

### Talent Screen

- Descripcion: Pantalla principal de talentos, arboles y puntos disponibles.
- Donde se usa: Seccion Talentos.
- Variantes: class-tree, echo-tree, compact-list, multi-tree.
- Estados: loading, available-points, no-points, modified, error.
- Datos que muestra: Puntos, arbol, nodos, conexiones, resumen de build.
- Interacciones del usuario: Pan/zoom si aplica, seleccionar nodo, asignar/resetear.
- Nivel de prioridad: Core

### Talent Tree Canvas

- Descripcion: Contenedor navegable para nodos conectados.
- Donde se usa: Talent screen, ecos si usa arbol.
- Variantes: pannable, zoomable, static-mobile, sectioned, mini-map.
- Estados: loading, interactive, locked, error.
- Datos que muestra: Nodos, conexiones, estados, rutas, grupos.
- Interacciones del usuario: Drag pan, pinch zoom, tap nodo, reset zoom.
- Nivel de prioridad: Core

### Talent Node

- Descripcion: Nodo individual de talento o mejora.
- Donde se usa: Talent tree, echo tree.
- Variantes: minor, major, keystone, socket, passive, active, sink.
- Estados: locked, available, purchased, maxed, selected, disabled, preview.
- Datos que muestra: Icono, rango, coste, prerequisitos, estado.
- Interacciones del usuario: Tap para detalle, long press preview, comprar.
- Nivel de prioridad: Core

### Talent Connection

- Descripcion: Linea o relacion logica entre nodos.
- Donde se usa: Talent tree canvas.
- Variantes: prerequisite, branch, optional, locked, active.
- Estados: inactive, active, blocked, preview.
- Datos que muestra: Relacion y estado de ruta.
- Interacciones del usuario: No interactivo por defecto; tap opcional para explicar requisito.
- Nivel de prioridad: Core

### Talent Detail Sheet

- Descripcion: Detalle de un talento seleccionado.
- Donde se usa: Talent screen.
- Variantes: locked, available, purchased, maxed, preview-next-rank.
- Estados: loading, ready, insufficient-points, missing-prerequisite, error.
- Datos que muestra: Nombre, descripcion mecanica, rangos, coste, prerequisitos, efecto actual/proximo.
- Interacciones del usuario: Comprar rango, resetear si aplica, navegar prerequisito.
- Nivel de prioridad: Core

### Talent Point Counter

- Descripcion: Indicador de puntos disponibles y gastados.
- Donde se usa: Talent screen, header, reset modal.
- Variantes: class-points, echo-points, spent/available, capped.
- Estados: none, available, insufficient, updating.
- Datos que muestra: Puntos disponibles, gastados, total, fuente.
- Interacciones del usuario: Tap para ver como obtener puntos.
- Nivel de prioridad: Core

### Talent Rank Indicator

- Descripcion: Indicador de progreso dentro de un talento con multiples rangos.
- Donde se usa: Talent node, talent detail.
- Variantes: numeric, pips, progress-bar, maxed.
- Estados: empty, partial, maxed, preview.
- Datos que muestra: Rango actual, rango maximo, siguiente incremento.
- Interacciones del usuario: Tap para tooltip en detalle.
- Nivel de prioridad: Core

### Talent Purchase Button

- Descripcion: Accion especializada para comprar o subir rango.
- Donde se usa: Talent detail, sticky action bar.
- Variantes: buy, upgrade, max, refund-preview.
- Estados: ready, disabled, insufficient, loading, success, error.
- Datos que muestra: Coste, rango siguiente, disponibilidad.
- Interacciones del usuario: Tap comprar, confirmacion si gasto raro.
- Nivel de prioridad: Core

### Talent Reset Control

- Descripcion: Control para reembolsar o reiniciar talentos.
- Donde se usa: Talent screen, settings de build.
- Variantes: reset-all, reset-branch, refund-node, preview.
- Estados: available, disabled, costly, confirming, success, error.
- Datos que muestra: Coste, puntos devueltos, impacto.
- Interacciones del usuario: Tap, confirmar, revisar cambios.
- Nivel de prioridad: Important

### Talent Build Preview

- Descripcion: Modo de previsualizacion antes de confirmar cambios.
- Donde se usa: Talent screen, loadouts.
- Variantes: pending-changes, compare-current, import/export.
- Estados: clean, dirty, invalid, confirming, saved.
- Datos que muestra: Cambios pendientes, puntos restantes, stats impactadas.
- Interacciones del usuario: Aplicar, descartar, comparar.
- Nivel de prioridad: Important

### Tree Mini Map

- Descripcion: Vista pequena de posicion dentro de un arbol grande.
- Donde se usa: Talent tree canvas, echo tree.
- Variantes: static, interactive, collapsible.
- Estados: visible, hidden, dragging.
- Datos que muestra: Viewport actual, grupos, nodos importantes.
- Interacciones del usuario: Tap/drag para navegar.
- Nivel de prioridad: Optional

### Talent Search / Finder

- Descripcion: Buscador de talentos por nombre, stat o efecto.
- Donde se usa: Talent screen, codex.
- Variantes: search-only, filter-tags, highlight-results.
- Estados: empty, searching, results, no-results.
- Datos que muestra: Query, resultados, coincidencias resaltadas.
- Interacciones del usuario: Buscar, seleccionar resultado, limpiar.
- Nivel de prioridad: Optional

### Talent Requirement Badge

- Descripcion: Badge que resume prerequisitos de un nodo.
- Donde se usa: Talent node, detail sheet, locked tooltip.
- Variantes: level, points-spent, previous-node, class, quest.
- Estados: met, unmet, partial, unknown.
- Datos que muestra: Requisito, progreso, deficit.
- Interacciones del usuario: Tap para ir al requisito.
- Nivel de prioridad: Core

## Santuario, Jobs y Timers

### Sanctuary Screen

- Descripcion: Pantalla principal de sistemas idle por jobs/timers.
- Donde se usa: Seccion Santuario.
- Variantes: station-grid, active-jobs, resource-focused, locked.
- Estados: loading, idle, active-jobs, claimable, error.
- Datos que muestra: Estaciones, jobs activos, timers, recompensas, recursos.
- Interacciones del usuario: Seleccionar estacion, iniciar job, reclamar, acelerar.
- Nivel de prioridad: Core

### Station Card

- Descripcion: Tarjeta de una estacion funcional del santuario.
- Donde se usa: Santuario, overlays de estacion.
- Variantes: forge, laboratory, extraction, relic-armory, library, altar, locked.
- Estados: locked, available, active, busy, claimable, upgrading, error.
- Datos que muestra: Nombre, estado, job activo, timer, recompensa, requisitos.
- Interacciones del usuario: Tap para abrir estacion, reclamar rapido si aplica.
- Nivel de prioridad: Core

### Job Card

- Descripcion: Representacion de un job seleccionable o activo.
- Donde se usa: Santuario, estaciones, job list.
- Variantes: available, active, completed, locked, repeatable, one-shot.
- Estados: locked, ready, running, paused, complete, failed, claimed.
- Datos que muestra: Nombre, duracion, coste, recompensa, requisitos, progreso.
- Interacciones del usuario: Iniciar, ver detalle, reclamar, cancelar.
- Nivel de prioridad: Core

### Job Detail Sheet

- Descripcion: Detalle completo de un job antes o durante ejecucion.
- Donde se usa: Job card, station overlay.
- Variantes: preview, active, completed, locked, repeatable.
- Estados: ready, insufficient, running, complete, loading, error.
- Datos que muestra: Objetivo, coste, recompensa, tiempo, modificadores, requisitos.
- Interacciones del usuario: Iniciar, cancelar, reclamar, acelerar, repetir.
- Nivel de prioridad: Core

### Job Progress Bar

- Descripcion: Barra especializada para progreso temporal de job.
- Donde se usa: Job cards, station cards, sanctuary header.
- Variantes: linear, compact, segmented, with-ETA.
- Estados: queued, running, paused, complete, blocked, error.
- Datos que muestra: Progreso, tiempo restante, estado, velocidad.
- Interacciones del usuario: Tap para detalle.
- Nivel de prioridad: Core

### Job Queue

- Descripcion: Lista o cola de jobs pendientes/activos.
- Donde se usa: Santuario, estaciones avanzadas.
- Variantes: single-active, multi-slot, priority, repeat-loop.
- Estados: empty, queued, running, full, paused, error.
- Datos que muestra: Jobs, orden, tiempos, slots, recompensas.
- Interacciones del usuario: Reordenar, cancelar, iniciar, reclamar.
- Nivel de prioridad: Important

### Claim Button

- Descripcion: Accion especializada para reclamar recompensas.
- Donde se usa: Jobs, expedicion, achievements, offline, loot.
- Variantes: claim, claim-all, claim-selected, auto-claim.
- Estados: disabled, claimable, loading, success, error, inventory-full.
- Datos que muestra: Label, cantidad pendiente, restricciones.
- Interacciones del usuario: Tap reclamar, confirmar si hay overflow.
- Nivel de prioridad: Core

### Claim All Panel

- Descripcion: Resumen y accion masiva para reclamar multiples recompensas.
- Donde se usa: Santuario, expedicion, loot, achievements.
- Variantes: compact, detailed, with-overflow-warning.
- Estados: hidden, claimable, claiming, success, error, blocked.
- Datos que muestra: Total de recompensas, origenes, limites, inventario.
- Interacciones del usuario: Reclamar todo, revisar detalle.
- Nivel de prioridad: Core

### Timer Acceleration Control

- Descripcion: Control para reducir duracion de timers si existe aceleracion.
- Donde se usa: Santuario, crafting queue, expedicion.
- Variantes: spend-currency, watch-ad si existiera, boost-token, free-skip.
- Estados: available, disabled, insufficient, loading, success, error.
- Datos que muestra: Reduccion, coste, recurso disponible, limite.
- Interacciones del usuario: Tap acelerar, confirmar gasto.
- Nivel de prioridad: Optional

### Station Upgrade Panel

- Descripcion: Vista para mejorar una estacion del santuario.
- Donde se usa: Santuario, station detail.
- Variantes: level-up, unlock-slot, speed-up, reward-upgrade.
- Estados: available, insufficient, maxed, locked, upgrading.
- Datos que muestra: Nivel actual, bonus actual/proximo, coste, requisitos.
- Interacciones del usuario: Mejorar, ver fuentes, comparar.
- Nivel de prioridad: Important

### Worker / Assignment Slot

- Descripcion: Slot para asignar trabajador, clase, item o recurso a un job si aplica.
- Donde se usa: Santuario, jobs avanzados, expedicion support.
- Variantes: empty, assigned, locked, optional, required.
- Estados: empty, filled, invalid, locked, busy.
- Datos que muestra: Asignado, bonus, requisito, estado ocupado.
- Interacciones del usuario: Tap para seleccionar/remover.
- Nivel de prioridad: Optional

### Job Reward Preview

- Descripcion: Vista previa de recompensas antes de iniciar un job.
- Donde se usa: Job detail, station cards.
- Variantes: guaranteed, range, chance-based, scaled-by-duration.
- Estados: preview, modified, locked, loading.
- Datos que muestra: Recompensas posibles, probabilidades, modificadores.
- Interacciones del usuario: Tap recompensa para detalle.
- Nivel de prioridad: Core

### Job Completion Sheet

- Descripcion: Presentacion de resultado al terminar un job.
- Donde se usa: Santuario, offline progress.
- Variantes: single-job, multi-job, rare-reward, failed.
- Estados: open, claiming, claimed, error.
- Datos que muestra: Job, tiempo, recompensas, bonus, nuevo desbloqueo.
- Interacciones del usuario: Reclamar, repetir, cerrar.
- Nivel de prioridad: Important

### Repeat Job Control

- Descripcion: Control para repetir jobs manual o automaticamente.
- Donde se usa: Santuario, job detail, queue.
- Variantes: repeat-once, repeat-until-resources, repeat-count, auto-repeat-toggle.
- Estados: off, on, disabled, insufficient, active.
- Datos que muestra: Repeticiones, coste total, condicion de parada.
- Interacciones del usuario: Toggle, ajustar cantidad, iniciar.
- Nivel de prioridad: Important

## Ecos / Prestige

### Prestige Screen

- Descripcion: Pantalla principal de reset y meta-progresion.
- Donde se usa: Seccion Ecos.
- Variantes: overview, preview, tree, history, locked.
- Estados: locked, available, previewing, confirming, completed, error.
- Datos que muestra: Ecos ganables, beneficios, perdidas, requisitos, historial.
- Interacciones del usuario: Ver preview, confirmar prestige, asignar ecos.
- Nivel de prioridad: Core

### Prestige Readiness Card

- Descripcion: Resumen de disponibilidad y valor esperado del prestige.
- Donde se usa: Prestige screen, app alerts.
- Variantes: not-ready, ready, optimal-window, capped.
- Estados: locked, progress, ready, recommended, loading.
- Datos que muestra: Progreso a requisito, ecos estimados, bonus, recomendacion mecanica.
- Interacciones del usuario: Tap para detalle o navegar a requisito.
- Nivel de prioridad: Core

### Prestige Preview Panel

- Descripcion: Comparacion de estado actual versus post-prestige.
- Donde se usa: Prestige flow.
- Variantes: compact, detailed, losses-and-gains, simulation.
- Estados: loading, ready, insufficient, error.
- Datos que muestra: Ecos ganados, resets, conservado, desbloqueos, multiplicadores.
- Interacciones del usuario: Expandir secciones, confirmar, cancelar.
- Nivel de prioridad: Core

### Prestige Confirmation Modal

- Descripcion: Confirmacion bloqueante para ejecutar reset.
- Donde se usa: Prestige flow.
- Variantes: standard, irreversible, high-value, type-to-confirm.
- Estados: open, confirming, processing, success, error.
- Datos que muestra: Consecuencias, ganancias, perdidas, timestamp opcional.
- Interacciones del usuario: Confirmar, cancelar, revisar preview.
- Nivel de prioridad: Core

### Echo Currency Counter

- Descripcion: Contador especializado de moneda de prestige.
- Donde se usa: Prestige, top status, talent/echo tree, costs.
- Variantes: current, lifetime, pending, spent.
- Estados: default, increasing, insufficient, capped, loading.
- Datos que muestra: Ecos actuales, ganables, gastados, lifetime.
- Interacciones del usuario: Tap para detalle de fuentes/uso.
- Nivel de prioridad: Core

### Echo Upgrade Card

- Descripcion: Tarjeta de mejora permanente comprable con ecos.
- Donde se usa: Prestige screen, echo tree.
- Variantes: passive, unlock, multiplier, quality-of-life, capped.
- Estados: locked, available, purchased, maxed, selected, insufficient.
- Datos que muestra: Nombre, efecto, rango, coste, prerequisitos.
- Interacciones del usuario: Tap detalle, comprar, comparar siguiente rango.
- Nivel de prioridad: Core

### Echo Tree Node

- Descripcion: Nodo de meta-progresion permanente.
- Donde se usa: Echo tree.
- Variantes: minor, major, keystone, unlock, sink.
- Estados: locked, available, purchased, maxed, preview.
- Datos que muestra: Icono, rango, coste, prerequisitos, efecto.
- Interacciones del usuario: Tap detalle, comprar.
- Nivel de prioridad: Core

### Prestige History Entry

- Descripcion: Registro de un prestige anterior.
- Donde se usa: Historial de ecos, analytics visible.
- Variantes: compact, detailed, milestone.
- Estados: default, highlighted, expanded.
- Datos que muestra: Fecha/tiempo relativo, ecos ganados, duracion, nivel alcanzado, tier.
- Interacciones del usuario: Expandir, comparar con actual.
- Nivel de prioridad: Optional

### Permanent Bonus Summary

- Descripcion: Resumen de bonuses permanentes activos.
- Donde se usa: Prestige, character sheet, build summary.
- Variantes: compact, grouped, source-breakdown.
- Estados: default, modified, loading.
- Datos que muestra: Multiplicadores, unlocks, fuentes, impacto.
- Interacciones del usuario: Tap bonus para fuente.
- Nivel de prioridad: Important

### Reset Impact List

- Descripcion: Lista explicita de sistemas que se reinician o conservan.
- Donde se usa: Prestige preview, confirmation modal.
- Variantes: gains, losses, preserved, changed.
- Estados: default, expanded, loading.
- Datos que muestra: Entidades afectadas, estado actual, estado post-reset.
- Interacciones del usuario: Expandir detalle por sistema.
- Nivel de prioridad: Core

## Expedicion, Tiers, Bosses y Progreso

### Expedition Screen

- Descripcion: Pantalla principal de progresion por expediciones.
- Donde se usa: Seccion Expedicion.
- Variantes: tier-map, tier-list, boss-focused, progress-overview.
- Estados: loading, available, active, blocked, completed, error.
- Datos que muestra: Tiers, progreso, bosses, recompensas, requisitos.
- Interacciones del usuario: Seleccionar tier, iniciar, ver boss, reclamar.
- Nivel de prioridad: Core

### Expedition Tier Card

- Descripcion: Tarjeta de un tier de expedicion.
- Donde se usa: Expedition screen, tier list/map.
- Variantes: locked, available, active, completed, farming, boss-gated.
- Estados: locked, selected, active, complete, claimable, loading.
- Datos que muestra: Tier, nombre, progreso, requisitos, recompensa, boss.
- Interacciones del usuario: Tap detalle, iniciar/continuar, ver requisitos.
- Nivel de prioridad: Core

### Tier Progress Track

- Descripcion: Indicador de avance dentro de un tier.
- Donde se usa: Expedition tier card/detail, combat.
- Variantes: linear, milestones, nodes, boss-at-end, segmented.
- Estados: not-started, active, milestone-complete, blocked, complete.
- Datos que muestra: Progreso, hitos, boss, recompensas, bloqueo.
- Interacciones del usuario: Tap hito para detalle.
- Nivel de prioridad: Core

### Expedition Detail Sheet

- Descripcion: Detalle de tier o expedicion seleccionada.
- Donde se usa: Expedition screen.
- Variantes: locked, available, active, completed, boss-ready.
- Estados: loading, ready, insufficient-power, active, error.
- Datos que muestra: Descripcion funcional, enemigos, poder recomendado, loot, requisitos.
- Interacciones del usuario: Iniciar, continuar, abandonar, ver recompensas.
- Nivel de prioridad: Core

### Expedition Start Button

- Descripcion: Accion especializada para iniciar o continuar expedicion.
- Donde se usa: Expedition detail, sticky action bar.
- Variantes: start, continue, retry, boss-fight, farm.
- Estados: ready, disabled, insufficient, loading, active, error.
- Datos que muestra: Accion, coste si aplica, requisito faltante.
- Interacciones del usuario: Tap iniciar/continuar, confirmar si consume recurso.
- Nivel de prioridad: Core

### Expedition Requirement List

- Descripcion: Lista de condiciones necesarias para entrar o avanzar.
- Donde se usa: Tier cards, boss preview, detail sheets.
- Variantes: level, power, item, previous-tier, key, quest.
- Estados: met, unmet, partial, loading.
- Datos que muestra: Requisito, progreso, deficit, enlace a fuente.
- Interacciones del usuario: Tap requisito para navegar.
- Nivel de prioridad: Core

### Boss Card

- Descripcion: Representacion de un boss de expedicion.
- Donde se usa: Expedition screen, boss preview, combat.
- Variantes: locked, available, active, defeated, weekly, enraged.
- Estados: locked, ready, fighting, defeated, claimable, loading.
- Datos que muestra: Nombre, retrato, nivel, habilidades, poder recomendado, recompensas.
- Interacciones del usuario: Tap detalle, iniciar combate, reclamar.
- Nivel de prioridad: Core

### Boss Mechanics Panel

- Descripcion: Resumen de habilidades, fases o reglas del boss.
- Donde se usa: Boss preview, combat detail.
- Variantes: simple, phased, modifiers, counters.
- Estados: locked, visible, expanded, loading.
- Datos que muestra: Habilidades, amenazas, resistencias, recomendaciones mecanicas.
- Interacciones del usuario: Expandir, abrir tooltip de efectos.
- Nivel de prioridad: Important

### Expedition Reward Track

- Descripcion: Camino de recompensas por progreso de expedicion.
- Donde se usa: Expedition screen, tier detail.
- Variantes: milestone-track, battle-pass-like, boss-only, repeatable.
- Estados: locked, upcoming, claimable, claimed, complete.
- Datos que muestra: Hitos, recompensas, progreso, claim status.
- Interacciones del usuario: Tap recompensa, reclamar.
- Nivel de prioridad: Core

### Expedition Modifier Badge

- Descripcion: Indicador de modificadores activos en expedicion.
- Donde se usa: Tier card, detail, combat.
- Variantes: enemy-buff, player-constraint, loot-bonus, hazard, weekly.
- Estados: active, inactive, locked, unknown.
- Datos que muestra: Nombre, efecto, intensidad.
- Interacciones del usuario: Tap/long press para detalle.
- Nivel de prioridad: Important

### Expedition Map Node

- Descripcion: Nodo de ruta o hito dentro de una expedicion si se usa mapa.
- Donde se usa: Expedition map.
- Variantes: combat, event, reward, boss, locked, completed.
- Estados: locked, available, current, completed, failed.
- Datos que muestra: Tipo, progreso, recompensa, requisito.
- Interacciones del usuario: Tap para detalle o iniciar.
- Nivel de prioridad: Optional

### Tier Selector

- Descripcion: Selector compacto de tiers disponibles.
- Donde se usa: Expedicion, combate, rewards.
- Variantes: horizontal-scroll, dropdown, segmented, grid.
- Estados: selected, locked, completed, active, notification.
- Datos que muestra: Tier, estado, progreso, badge.
- Interacciones del usuario: Tap seleccionar, scroll.
- Nivel de prioridad: Core

### Expedition Run Summary

- Descripcion: Resumen posterior de una expedicion o intento.
- Donde se usa: Al completar/fallar, historial.
- Variantes: success, failure, partial, boss-clear, offline.
- Estados: open, claiming, claimed, error.
- Datos que muestra: Progreso, kills, loot, tiempo, boss, desbloqueos.
- Interacciones del usuario: Reclamar, reintentar, continuar, cerrar.
- Nivel de prioridad: Core

### Expedition History Entry

- Descripcion: Registro de intentos o clears previos.
- Donde se usa: Expedition history, boss detail.
- Variantes: compact, detailed, best-run, recent.
- Estados: default, expanded, highlighted.
- Datos que muestra: Tier, resultado, tiempo, rewards, poder usado.
- Interacciones del usuario: Expandir, comparar.
- Nivel de prioridad: Optional

## Economia, Recompensas y Progresion

### Currency Wallet

- Descripcion: Grupo de recursos monetarios o economicos.
- Donde se usa: Top bar, inventory, crafting, prestige, sanctuary.
- Variantes: compact, expanded, pinned, contextual.
- Estados: default, updating, insufficient, capped, loading.
- Datos que muestra: Recursos, cantidades, capacidad, cambios recientes.
- Interacciones del usuario: Tap recurso para detalle/fuentes.
- Nivel de prioridad: Core

### Resource Detail Sheet

- Descripcion: Detalle de un recurso especifico.
- Donde se usa: Desde counters, costs, rewards.
- Variantes: currency, material, echo, key, point.
- Estados: loading, ready, no-sources, error.
- Datos que muestra: Cantidad, fuentes, usos, capacidad, historial reciente.
- Interacciones del usuario: Navegar a fuente/uso, cerrar.
- Nivel de prioridad: Important

### Reward Chest

- Descripcion: Contenedor de recompensa acumulada o sorpresa.
- Donde se usa: Loot, boss rewards, achievements, offline, jobs.
- Variantes: common, tiered, boss, timed, locked, claimable.
- Estados: locked, available, opening, opened, claimed, error.
- Datos que muestra: Tipo, origen, posibles recompensas, estado.
- Interacciones del usuario: Abrir, reclamar, ver probabilidades si aplica.
- Nivel de prioridad: Important

### Reward Reveal Sequence

- Descripcion: Secuencia UI para mostrar recompensas obtenidas.
- Donde se usa: Bosses, crafting, prestige, achievements, offline.
- Variantes: single, multi, rare-highlight, skip-able.
- Estados: playing, skipped, complete, error.
- Datos que muestra: Recompensas, rareza, cantidades, nuevos desbloqueos.
- Interacciones del usuario: Tap para avanzar, saltar, abrir item.
- Nivel de prioridad: Optional

### Achievement Card

- Descripcion: Representacion de logro o hito desbloqueable.
- Donde se usa: Achievements, objectives, progression.
- Variantes: locked, in-progress, completed, claimable, hidden.
- Estados: locked, progress, complete, claimable, claimed.
- Datos que muestra: Nombre, objetivo, progreso, recompensa, fecha.
- Interacciones del usuario: Reclamar, ver detalle, navegar a objetivo.
- Nivel de prioridad: Important

### Objective Tracker

- Descripcion: Seguimiento de objetivo activo o recomendado.
- Donde se usa: App shell, combat, onboarding, progression.
- Variantes: pinned, compact, multi-objective, milestone.
- Estados: active, complete, claimable, blocked, hidden.
- Datos que muestra: Objetivo, progreso, recompensa, accion sugerida.
- Interacciones del usuario: Tap para navegar o reclamar.
- Nivel de prioridad: Important

### Milestone Timeline

- Descripcion: Linea de hitos de progresion general.
- Donde se usa: Cuenta, expedicion, onboarding, prestige.
- Variantes: horizontal, vertical, compact, grouped.
- Estados: locked, current, complete, claimable.
- Datos que muestra: Hitos, requisitos, rewards, posicion actual.
- Interacciones del usuario: Tap hito, reclamar.
- Nivel de prioridad: Important

### Unlock Callout

- Descripcion: Notificacion destacada de nuevo sistema, tier o funcion.
- Donde se usa: Progresion, prestige, talentos, santuario, expedicion.
- Variantes: system, feature, tier, recipe, item-family.
- Estados: queued, visible, dismissed, acknowledged.
- Datos que muestra: Nombre del desbloqueo, descripcion funcional, accion.
- Interacciones del usuario: Abrir, cerrar, ir al sistema.
- Nivel de prioridad: Core

### Progression Gate

- Descripcion: Componente que comunica bloqueo y camino de desbloqueo.
- Donde se usa: Tabs bloqueadas, tiers, jobs, talentos, crafting recipes.
- Variantes: level-gate, quest-gate, resource-gate, previous-tier-gate.
- Estados: locked, partial, unlocked, hidden.
- Datos que muestra: Requisito, progreso, deficit, accion recomendada.
- Interacciones del usuario: Tap para navegar a requisito.
- Nivel de prioridad: Core

## Codex, Ayuda y Registro

### Codex Screen

- Descripcion: Biblioteca consultable de sistemas, enemigos, items y reglas.
- Donde se usa: Seccion o overlay de ayuda.
- Variantes: systems, enemies, items, crafting, glossary, search.
- Estados: loading, populated, empty, filtered, error.
- Datos que muestra: Entradas, categorias, progreso de descubrimiento.
- Interacciones del usuario: Buscar, filtrar, abrir entrada.
- Nivel de prioridad: Important

### Codex Entry Card

- Descripcion: Tarjeta/list row para una entrada de codex.
- Donde se usa: Codex lists, help links.
- Variantes: system, enemy, item, resource, stat, locked.
- Estados: locked, discovered, new, selected.
- Datos que muestra: Titulo, categoria, estado descubierto, resumen.
- Interacciones del usuario: Tap para detalle.
- Nivel de prioridad: Important

### Codex Detail View

- Descripcion: Vista detallada de una entrada informativa.
- Donde se usa: Codex, tooltips rich.
- Variantes: system-guide, enemy, item, stat, resource, crafting.
- Estados: loading, ready, locked, error.
- Datos que muestra: Descripcion funcional, datos, fuentes, relaciones, links.
- Interacciones del usuario: Scroll, navegar enlaces, cerrar.
- Nivel de prioridad: Important

### Glossary Term Tooltip

- Descripcion: Explicacion breve de terminos mecanicos.
- Donde se usa: Stats, talentos, items, bosses, crafting.
- Variantes: simple, with-formula, with-link.
- Estados: hidden, visible.
- Datos que muestra: Termino, definicion, enlace a codex.
- Interacciones del usuario: Tap/long press, abrir codex.
- Nivel de prioridad: Important

### Patch Notes / News Panel

- Descripcion: Panel para comunicar cambios o eventos del juego.
- Donde se usa: Home, settings, inbox.
- Variantes: latest, list, event, maintenance.
- Estados: loading, unread, read, error.
- Datos que muestra: Titulo, fecha, resumen, contenido.
- Interacciones del usuario: Abrir, marcar leido.
- Nivel de prioridad: Optional

## Settings, Perfil y Calidad de Vida

### Settings Screen

- Descripcion: Pantalla de configuracion general.
- Donde se usa: Menu principal o perfil.
- Variantes: general, accessibility, notifications, account, debug.
- Estados: loading, ready, saving, error.
- Datos que muestra: Opciones, toggles, sliders, cuenta, version.
- Interacciones del usuario: Cambiar opciones, guardar/resetear.
- Nivel de prioridad: Important

### Settings Row

- Descripcion: Fila reusable para una preferencia.
- Donde se usa: Settings, accessibility, loot filters.
- Variantes: toggle, select, slider, action, info.
- Estados: default, disabled, loading, error, changed.
- Datos que muestra: Label, descripcion, control, valor actual.
- Interacciones del usuario: Tap/control especifico.
- Nivel de prioridad: Important

### Profile Summary

- Descripcion: Resumen de cuenta/jugador.
- Donde se usa: Settings, top bar, profile.
- Variantes: compact, full, offline, guest.
- Estados: loading, synced, offline, error.
- Datos que muestra: Nombre, nivel/cuenta, progreso, ID opcional.
- Interacciones del usuario: Editar nombre, abrir cuenta.
- Nivel de prioridad: Optional

### Accessibility Controls

- Descripcion: Grupo de opciones de accesibilidad.
- Donde se usa: Settings.
- Variantes: text-size, reduced-motion, haptics, contrast-mode, number-format.
- Estados: default, changed, saving, error.
- Datos que muestra: Opcion, valor actual, descripcion.
- Interacciones del usuario: Toggle, select, slider.
- Nivel de prioridad: Important

### Haptics Feedback Hook

- Descripcion: Patron de feedback tactil asociado a acciones importantes.
- Donde se usa: Botones, loot, crafting, combat rewards, errors.
- Variantes: light, medium, success, warning, error, disabled.
- Estados: enabled, disabled, unavailable.
- Datos que muestra: No muestra datos; comportamiento del sistema.
- Interacciones del usuario: Se activa al interactuar con controles.
- Nivel de prioridad: Optional

### Number Format Selector

- Descripcion: Selector de formato para numeros grandes.
- Donde se usa: Settings, accessibility.
- Variantes: compact, scientific, full, locale-based.
- Estados: selected, disabled, preview.
- Datos que muestra: Formato actual, ejemplos.
- Interacciones del usuario: Seleccionar formato.
- Nivel de prioridad: Optional

### Language Selector

- Descripcion: Selector de idioma si el juego soporta localizacion.
- Donde se usa: Settings.
- Variantes: list, searchable, system-default.
- Estados: selected, loading, unavailable, error.
- Datos que muestra: Idioma, region, estado de soporte.
- Interacciones del usuario: Seleccionar, confirmar reinicio si aplica.
- Nivel de prioridad: Optional

## Componentes de Layout Mobile

### Safe Area Container

- Descripcion: Contenedor que respeta notch, barras del sistema y zonas tactiles.
- Donde se usa: App shell, overlays, sticky bars.
- Variantes: full-screen, scrollable, overlay, bottom-fixed.
- Estados: default.
- Datos que muestra: Contenido hijo.
- Interacciones del usuario: No interactivo.
- Nivel de prioridad: Core

### Scroll Container

- Descripcion: Contenedor de scroll vertical/horizontal con comportamiento consistente.
- Donde se usa: Pantallas, sheets, listas, arboles, grids.
- Variantes: vertical, horizontal, nested, momentum, snap.
- Estados: top, scrolling, bottom, overflow, locked.
- Datos que muestra: Contenido hijo, indicadores opcionales.
- Interacciones del usuario: Scroll, swipe.
- Nivel de prioridad: Core

### Sticky Header

- Descripcion: Cabecera que permanece visible durante scroll.
- Donde se usa: Inventario, crafting, talentos, expedicion, lists largas.
- Variantes: compact, with-tabs, with-search, with-actions.
- Estados: default, condensed, elevated, hidden.
- Datos que muestra: Titulo, filtros, tabs, acciones.
- Interacciones del usuario: Acciones internas.
- Nivel de prioridad: Important

### Sticky Footer

- Descripcion: Pie fijo con acciones o resumen.
- Donde se usa: Item detail, crafting, prestige, filtros, confirmaciones.
- Variantes: action-bar, summary-bar, multi-action, safe-area.
- Estados: default, disabled, loading, error.
- Datos que muestra: Acciones, coste, resumen, contador.
- Interacciones del usuario: Tap acciones.
- Nivel de prioridad: Core

### Responsive Grid

- Descripcion: Sistema reusable de grillas adaptables.
- Donde se usa: Inventario, estaciones, cards, rewards, talents compactos.
- Variantes: fixed-columns, auto-fit, dense, horizontal-scroll.
- Estados: empty, loading, populated.
- Datos que muestra: Items hijos.
- Interacciones del usuario: Segun hijos; scroll si aplica.
- Nivel de prioridad: Core

### Swipe Action Row

- Descripcion: Fila con acciones reveladas por swipe.
- Donde se usa: Inventario list view, jobs, logs, filters.
- Variantes: leading-action, trailing-action, destructive, multi-action.
- Estados: closed, partially-open, open, action-triggered, disabled.
- Datos que muestra: Acciones contextuales.
- Interacciones del usuario: Swipe, tap accion, tap fuera para cerrar.
- Nivel de prioridad: Optional

### Pull To Refresh

- Descripcion: Patron de refresco manual de datos.
- Donde se usa: Pantallas con sync o datos remotos si aplica.
- Variantes: standard, disabled-offline, custom-label.
- Estados: idle, pulling, refreshing, success, error.
- Datos que muestra: Estado de refresh.
- Interacciones del usuario: Arrastrar hacia abajo.
- Nivel de prioridad: Optional

### Long Press Preview

- Descripcion: Patron tactil para abrir vista previa rapida.
- Donde se usa: Items, talentos, recursos, bosses, rewards.
- Variantes: tooltip, preview-card, haptic, expanded.
- Estados: idle, pressing, visible, dismissed.
- Datos que muestra: Detalle resumido del elemento.
- Interacciones del usuario: Long press, soltar/cerrar.
- Nivel de prioridad: Important

### Drag Handle

- Descripcion: Indicador/control para arrastrar sheets o reordenar elementos.
- Donde se usa: Bottom sheets, job queue, rules, loadouts.
- Variantes: sheet-handle, reorder-handle.
- Estados: default, dragging, disabled.
- Datos que muestra: No muestra datos; affordance.
- Interacciones del usuario: Drag.
- Nivel de prioridad: Important

## Formularios, Validacion y Acciones Masivas

### Form Field Group

- Descripcion: Agrupacion estructurada de campos y validacion.
- Donde se usa: Settings, loadouts, filters, naming, support/debug.
- Variantes: vertical, compact, with-actions, optional-section.
- Estados: default, dirty, valid, invalid, disabled.
- Datos que muestra: Campos, labels, errores, ayuda.
- Interacciones del usuario: Editar campos, submit, reset.
- Nivel de prioridad: Important

### Inline Validation Message

- Descripcion: Mensaje asociado a un campo o accion invalida.
- Donde se usa: Inputs, filters, crafting, loadouts, settings.
- Variantes: error, warning, success, info.
- Estados: hidden, visible, updating.
- Datos que muestra: Mensaje, causa, accion opcional.
- Interacciones del usuario: Tap accion si existe.
- Nivel de prioridad: Core

### Action Requirement Hint

- Descripcion: Explicacion compacta de por que una accion no esta disponible.
- Donde se usa: Botones disabled, jobs, crafting, talentos, expediciones.
- Variantes: insufficient-resource, locked, cooldown, inventory-full, prereq.
- Estados: hidden, visible, stale, resolved.
- Datos que muestra: Requisito faltante, deficit, link a fuente.
- Interacciones del usuario: Tap para abrir fuente/detalle.
- Nivel de prioridad: Core

### Batch Selection Header

- Descripcion: Header que aparece al activar seleccion multiple.
- Donde se usa: Inventario, loot, job queue, filters.
- Variantes: count-only, with-actions, with-select-all.
- Estados: hidden, active, partial, all-selected.
- Datos que muestra: Cantidad seleccionada, acciones, cancelar.
- Interacciones del usuario: Seleccionar todo, cancelar, ejecutar accion.
- Nivel de prioridad: Core

### Destructive Action Guard

- Descripcion: Patron reusable para proteger acciones irreversibles.
- Donde se usa: Salvage, reset, prestige, borrar loadout, cancelar job costoso.
- Variantes: simple-confirm, hold-to-confirm, type-to-confirm, delayed-confirm.
- Estados: awaiting, holding, confirmed, cancelled, error.
- Datos que muestra: Consecuencia, item/recurso afectado, confirmacion requerida.
- Interacciones del usuario: Confirmar, mantener presionado, escribir confirmacion.
- Nivel de prioridad: Core

## Estados Especiales y Edge Cases

### Locked Content Placeholder

- Descripcion: Representacion de contenido aun no desbloqueado.
- Donde se usa: Tabs, estaciones, talentos, tiers, recipes, bosses.
- Variantes: hidden-details, partial-preview, full-preview, mystery.
- Estados: locked, partially-unlocked, unlocked.
- Datos que muestra: Nombre opcional, requisito, progreso, recompensa esperada.
- Interacciones del usuario: Tap para requisito o fuente.
- Nivel de prioridad: Core

### Inventory Full Blocker

- Descripcion: Bloqueo/advertencia especifico de inventario lleno.
- Donde se usa: Loot, claim, crafting result, expedition rewards.
- Variantes: inline, modal, banner, action-sheet.
- Estados: warning, blocking, resolved.
- Datos que muestra: Capacidad, espacio requerido, acciones de limpieza.
- Interacciones del usuario: Ir a inventario, salvage, expandir, cancelar.
- Nivel de prioridad: Core

### Insufficient Resources State

- Descripcion: Estado reusable para acciones sin recursos suficientes.
- Donde se usa: Crafting, talents, jobs, upgrades, expeditions.
- Variantes: inline, tooltip, sheet, disabled-button-detail.
- Estados: insufficient, partial, resolved.
- Datos que muestra: Recursos faltantes, deficit, fuentes.
- Interacciones del usuario: Tap fuente, cerrar.
- Nivel de prioridad: Core

### Maxed State

- Descripcion: Estado para sistemas al maximo.
- Donde se usa: Talentos, upgrades, estaciones, tiers, items.
- Variantes: capped, completed, mastered.
- Estados: maxed, overcap-preview, archived.
- Datos que muestra: Nivel maximo, beneficios actuales, siguiente objetivo si existe.
- Interacciones del usuario: Ver detalle, navegar a otro objetivo.
- Nivel de prioridad: Important

### New Content Marker

- Descripcion: Indicador de contenido nuevo o no visto.
- Donde se usa: Items, tabs, talents, codex, recipes, systems.
- Variantes: dot, badge-new, glow-token abstracto, count.
- Estados: new, seen, dismissed.
- Datos que muestra: Estado nuevo, contador opcional.
- Interacciones del usuario: Se marca visto al abrir o interactuar.
- Nivel de prioridad: Core

### Recommended Action Marker

- Descripcion: Indicador de accion sugerida por progreso o mejora disponible.
- Donde se usa: Equipamiento, talentos, jobs, expediciones, crafting.
- Variantes: recommended, upgrade, next-step, optimal.
- Estados: visible, dismissed, completed, stale.
- Datos que muestra: Motivo de recomendacion, impacto estimado.
- Interacciones del usuario: Tap para detalle/navegacion.
- Nivel de prioridad: Important

### Conflict Resolution Dialog

- Descripcion: Dialogo para resolver conflictos de estado o guardado.
- Donde se usa: Sync, offline, cuenta, recuperacion.
- Variantes: local-vs-cloud, duplicate-claim, stale-state.
- Estados: open, resolving, resolved, error.
- Datos que muestra: Versiones, timestamps, diferencias, accion recomendada.
- Interacciones del usuario: Elegir version, reintentar, cancelar.
- Nivel de prioridad: Optional

### Maintenance / Unavailable State

- Descripcion: Estado para sistema temporalmente no disponible.
- Donde se usa: Features remotas, eventos, sync, compras si existieran.
- Variantes: scheduled, temporary, disabled-feature.
- Estados: unavailable, retrying, restored.
- Datos que muestra: Mensaje, tiempo estimado, acciones.
- Interacciones del usuario: Reintentar, cerrar.
- Nivel de prioridad: Optional

## Componentes por Prioridad

### Core

- App Shell
- Top Status Bar
- Bottom Navigation
- Tab Bar
- Screen Header
- Sticky Action Bar
- Overlay Shell
- Button
- Icon Button
- Toggle
- Segmented Control
- Select Menu
- Badge
- Tag / Chip
- Tooltip
- Modal Dialog
- Bottom Sheet
- Toast
- Alert Banner
- Loading Indicator
- Empty State
- Error State
- Progress Bar
- Resource Counter
- Cost Display
- Reward Display
- Timer Display
- Stat Row
- Delta Indicator
- Section Header
- Card
- List Row
- Grid Tile
- Icon
- Label
- Value Display
- Filter Panel
- Sort Control
- Notification Badge
- Offline Progress Summary
- Confirmation Sheet
- Combat Screen
- Combatant Panel
- Health Bar
- Auto Combat Status
- Enemy Card
- Boss Preview Card
- Status Effect Icon
- Loot Drop Callout
- Zone Selector
- Encounter Progress Tracker
- Character Sheet
- Hero Summary Card
- Experience Bar
- Attribute Grid
- Power Rating Display
- Equipment Slot
- Equipment Layout
- Stat Comparison Panel
- Inventory Screen
- Inventory Capacity Indicator
- Item Tile
- Item Row
- Item Detail Sheet
- Item Comparison Sheet
- Item Action Menu
- Rarity Indicator
- Item Level Badge
- Item Affix List
- Item Lock Control
- Multi Select Toolbar
- Bulk Action Confirmation
- Loot Summary Panel
- Material Stack
- Crafting Screen
- Forge Station Card
- Recipe Card
- Recipe Detail Sheet
- Crafting Input Slot
- Crafting Result Preview
- Crafting Action Button
- Material Requirement List
- Talent Screen
- Talent Tree Canvas
- Talent Node
- Talent Connection
- Talent Detail Sheet
- Talent Point Counter
- Talent Rank Indicator
- Talent Purchase Button
- Talent Requirement Badge
- Sanctuary Screen
- Station Card
- Job Card
- Job Detail Sheet
- Job Progress Bar
- Claim Button
- Claim All Panel
- Job Reward Preview
- Prestige Screen
- Prestige Readiness Card
- Prestige Preview Panel
- Prestige Confirmation Modal
- Echo Currency Counter
- Echo Upgrade Card
- Echo Tree Node
- Reset Impact List
- Expedition Screen
- Expedition Tier Card
- Tier Progress Track
- Expedition Detail Sheet
- Expedition Start Button
- Expedition Requirement List
- Boss Card
- Expedition Reward Track
- Tier Selector
- Expedition Run Summary
- Currency Wallet
- Unlock Callout
- Progression Gate
- Safe Area Container
- Scroll Container
- Sticky Footer
- Responsive Grid
- Inline Validation Message
- Action Requirement Hint
- Batch Selection Header
- Destructive Action Guard
- Locked Content Placeholder
- Inventory Full Blocker
- Insufficient Resources State
- New Content Marker

### Important

- Input Field
- Stepper
- Slider
- Text Link
- Popover
- Skeleton Placeholder
- Circular Progress
- Divider
- Collapsible Panel
- Avatar / Entity Portrait
- Search Bar
- Pagination / Virtual List Sentinel
- Subtab Dock
- Activity Indicator
- Save / Sync Status
- Undo Snackbar
- Help Entry
- Tutorial Coach Mark
- Guided Task Checklist
- System Message Log
- Combat Log Feed
- Damage Number
- Attribute Detail Sheet
- Build Summary
- Loot Filter Builder
- Auto Salvage Rule Row
- Batch Craft Control
- Source Finder Sheet
- Crafting Queue
- Reroll Affix Selector
- Upgrade Track
- Blueprint Card
- Extraction Result Panel
- Talent Reset Control
- Talent Build Preview
- Job Queue
- Station Upgrade Panel
- Job Completion Sheet
- Repeat Job Control
- Permanent Bonus Summary
- Boss Mechanics Panel
- Expedition Modifier Badge
- Resource Detail Sheet
- Reward Chest
- Achievement Card
- Objective Tracker
- Milestone Timeline
- Codex Screen
- Codex Entry Card
- Codex Detail View
- Glossary Term Tooltip
- Settings Screen
- Settings Row
- Accessibility Controls
- Sticky Header
- Long Press Preview
- Drag Handle
- Form Field Group
- Maxed State
- Recommended Action Marker

### Optional

- Drawer
- Floating Action Button
- Breadcrumb / Path Indicator
- Loadout Selector
- Stash Transfer Control
- Crafting History Log
- Tree Mini Map
- Talent Search / Finder
- Timer Acceleration Control
- Worker / Assignment Slot
- Prestige History Entry
- Expedition Map Node
- Expedition History Entry
- Reward Reveal Sequence
- Patch Notes / News Panel
- Profile Summary
- Haptics Feedback Hook
- Number Format Selector
- Language Selector
- Swipe Action Row
- Pull To Refresh
- Conflict Resolution Dialog
- Maintenance / Unavailable State
