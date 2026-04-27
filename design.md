# Design.md - Contrato UI/UX del MVP

Fecha: 2026-04-26  
Estado: version inicial, viva.  
Objetivo: unificar decisiones visuales y de UX para que cada nueva pantalla o refactor use el mismo criterio.

Este documento es la fuente de verdad para UI/UX. Si una implementacion se desvia, primero se actualiza este archivo o se corrige la implementacion.

---

## 1. Principios

### Mobile-first, dense, legible

El juego se juega en sesiones cortas y con mucha informacion de sistemas. La UI debe ser compacta, pero no apretada.

- Priorizar lectura rapida sobre explicacion larga.
- Evitar cards altas si no contienen decision real.
- Usar copy corto y accionable.
- Mantener targets tactiles comodos, incluso en modo dense.
- El detalle fino vive en avanzado, tooltip, overlay o drill-down.

### Menos dominios compitiendo

Cada vista debe tener un trabajo claro.

- `Santuario`: home operacional, claims, timers, recursos, estaciones.
- `Expedicion`: run viva, combate, mochila, intel contextual.
- `Heroe`: build, ficha, atributos, talentos.
- `Ecos`: meta-progreso.
- `Mas` / `Registro`: utilidades, metricas, debug, logros, referencia.

Una feature secundaria no debe aparecer con el mismo peso que el loop principal.

### Profundidad fuera del HUD

Los sistemas profundos son buenos, pero no deben invadir la pantalla activa.

- Crafting fino vive en Santuario.
- Loot decision rapido vive en Mochila / Expedition.
- Reportes, analytics y debug viven en areas utilitarias.
- Durante run, mostrar solo lo que cambia una decision inmediata.

---

## 2. Arquitectura De Navegacion

### Tabs primarias

Las tabs primarias representan dominios grandes, no features.

| Dominio | Rol | Regla |
|---|---|---|
| Santuario | Home de cuenta | Debe responder que esta listo, que corre, que conviene hacer |
| Expedicion | Run activa | Debe limpiar ruido y mostrar progreso/combate/loot inmediato |
| Heroe | Build | Debe mostrar identidad, stats, talentos y decisiones de poder |
| Ecos | Meta | Debe mostrar reset, inversion y progreso permanente |
| Mas/Registro | Utilidad | No debe competir emocionalmente con las tabs core |

### Subtabs

Usar subtabs cuando son modos hermanos dentro de un mismo dominio.

Patron:
- Desktop: subtabs horizontales arriba del contenido.
- Mobile: dock fijo arriba del bottom nav si la vista es de uso frecuente o cambia el modo principal.
- Subtabs no deben abrir overlays nuevos por si mismas.
- Si una accion abre una estacion completa, usar overlay.

Ejemplos canonicos:
- `Expedicion`: Combate / Mochila / Intel.
- `Heroe`: Ficha / Atributos / Talentos.
- `Forja`: Mejorar / Afinar / Reforjar / Imbuir / Extraer.

---

## 3. Overlays

### Regla

Toda estacion del Santuario usa overlay completo, no cards flotando sobre la pantalla base.

Un overlay de estacion debe tener:

- `OverlayShell`.
- `OverlaySurface` real, con fondo, borde y sombra.
- Header de estacion dentro del overlay.
- Boton `Volver` o equivalente.
- Contenido en una superficie unificada.

No usar `background: transparent`, `border: none`, `boxShadow: none` en overlays de estacion salvo que sea un overlay visual especial y documentado.

### Estaciones

| Estacion | Patron esperado |
|---|---|
| Laboratorio | Overlay completo |
| Destileria | Overlay completo |
| Encargos | Overlay completo |
| Biblioteca | Overlay completo |
| Altar de Sigilos | Overlay completo |
| Forja | Overlay completo |

---

## 4. Densidad

### Escala

La UI base del MVP es `dense`.

Valores guia:

| Elemento | Mobile | Desktop |
|---|---:|---:|
| Gap entre bloques | 8-10px | 8-12px |
| Padding panel | 9-12px | 10-16px |
| Padding card | 8-10px | 9-12px |
| Font micro label | 0.56-0.62rem | 0.58-0.66rem |
| Font body compacto | 0.64-0.72rem | 0.66-0.76rem |
| Font titulo panel | 0.88-1.04rem | 0.92-1.1rem |

### Reglas

- Evitar hero text dentro de paneles compactos.
- Evitar subtitulos largos en cards repetidas.
- En selectores/cards, el copy principal debe caber idealmente en 2-4 lineas.
- Si una card repetida necesita mas de 4 lineas, probablemente necesita avanzado/tooltip.

---

## 5. Semantica De Color

Los colores deben comunicar estado, no decorar arbitrariamente.

| Token | Uso |
|---|---|
| `success` | completado, reclamable, mejora clara, listo |
| `warning` | en progreso, atencion suave, umbral cercano |
| `danger` | riesgo, bloqueo fuerte, perdida, extraccion/destruccion |
| `accent` | navegacion, seleccion principal, contexto de sistema |
| `info` | lectura, intel, soporte, estado informativo |
| `violet` | magia/proceso especial/time-gate cuando ya exista en esa estacion |

Reglas:

- No usar `danger` para resaltar acciones normales salvo que destruyan/consuman algo importante.
- No usar `success` para CTA generico si no representa exito/listo/mejora.
- Barras de progreso y chips deben respetar el mismo significado entre pantallas.
- Evitar que una pantalla quede dominada por un solo hue sin necesidad.

---

## 6. Componentes Canonicos

Estos patrones deben extraerse o imitarse hasta que existan primitives compartidas.

### `OverlayStationShell`

Uso: estaciones del Santuario.

Debe incluir:
- Header de estacion.
- Estado/resumen.
- Boton volver.
- Contenido con layout consistente.

### `SubtabDock`

Uso: modos dentro de una vista.

Debe incluir:
- Estado activo claro.
- Disabled visible.
- Mobile dock encima del bottom nav cuando corresponda.
- Desktop inline arriba del contenido.

### `Panel`

Uso: bloque estructural.

Reglas:
- No meter panel dentro de panel salvo necesidad fuerte.
- Border 1px, fondo secundario, radius moderado.
- Gap interno consistente.

### `ItemCard`

Uso: Mochila, loot, Forja.

Debe mostrar:
- Rareza.
- Nombre.
- Slot.
- Rating y delta vs comparable.
- Estado especial: equipado, mejor, caza, excelente, entropy.

No debe mostrar:
- Toda la tabla de stats por defecto.
- Texto largo.
- Tiers legacy en vista primaria.

### `StatusChip`

Uso: estado corto.

Reglas:
- 1-3 palabras.
- Color semantico.
- Evitar chips redundantes en la misma linea.

### `ProgressMeter`

Uso: contratos, weekly, objetivos, jobs.

Reglas:
- Misma lectura de estados: en progreso, listo para reclamar, reclamado.
- Mostrar `x/y` real del set visible.
- Claimable no se oculta hasta ser claimed.

---

## 7. Copy

### Tono

Directo, funcional, con flavor minimo.

Buenas formas:
- "Listo para reclamar"
- "En curso"
- "Convierte piezas no equipadas en esencia"
- "Pool general: mantienes la linea actual o eliges una opcion nueva"

Evitar:
- Explicar reglas obvias en cada card.
- Repetir el mismo concepto en titulo, subtitulo y body.
- Copy de debug en UI primaria.
- Frases largas para justificar una decision de sistema.

### Jerarquia

Cada bloque deberia tener:

- Eyebrow corto si ayuda.
- Titulo claro.
- Una linea de contexto maximo.
- CTA visible si hay accion.

---

## 8. Items Y Forja

### Item system

La UI debe ayudar a decidir rapido si una pieza importa.

Prioridad de informacion:

1. Slot y rareza.
2. Rating y delta vs comparable.
3. Estado: equipado, mejor, excelente, entropy.
4. Afijos importantes.
5. Detalle avanzado.

### Forja

La Forja vive en Santuario.

Funciones:
- Mejorar.
- Afinar.
- Reforjar.
- Imbuir.
- Extraer.

Reglas:
- No crafting fino durante run.
- No selector de intencion para Reforjar.
- Reforjar muestra mantener actual + 2 opciones.
- Extraer es destructivo y debe tener confirmacion cuando aplica.
- Entropy visible en item y mesa de trabajo.
- Modo avanzado colapsado por defecto.

---

## 9. Santuario

El Santuario no es una lista de estaciones; es la home operacional.

Arriba del fold debe responder:

- Que puedo reclamar ahora.
- Que esta corriendo.
- Que me conviene hacer despues.
- Como iniciar o volver a Expedicion.

Las estaciones deben mostrarse como accesos con estado, no como pantallas completas embebidas.

Cada estacion detallada se abre en overlay completo.

---

## 10. Expedicion

La Expedicion es la pantalla viva de la run.

Debe priorizar:

- Combate.
- Tier/progreso.
- Boss/amenazas.
- Loot inmediato.
- Decisiones que afectan esta salida.

No debe priorizar:

- Crafting fino.
- Reportes.
- Sistemas persistentes de Santuario.
- Configuracion profunda.

---

## 11. Implementacion

### Orden recomendado

1. Normalizar overlays de Santuario con `OverlayStationShell`.
2. Extraer `SubtabDock` desde patrones de Heroe/Expedicion/Forja.
3. Extraer primitives chicas: `Panel`, `StatusChip`, `ActionButton`, `ProgressMeter`.
4. Unificar `ItemCard` entre Mochila y Forja.
5. Migrar pantallas por tandas, sin refactor masivo.

### Regla de cambio

Antes de tocar UI:

- Identificar que patron de este documento aplica.
- Evitar crear un estilo inline nuevo si ya existe un patron.
- Si el cambio introduce una excepcion, documentarla aca.

---

## 12. Checklist UI Antes De Cerrar Un Cambio

- La pantalla tiene una accion principal clara.
- En mobile no queda tapada por bottom nav ni subtabs.
- Los overlays usan superficie completa si son estaciones.
- Los colores respetan semantica.
- Las cards repetidas no tienen copy excesivo.
- Los estados usan labels consistentes.
- El detalle avanzado no invade la vista primaria.
- No hay paneles anidados innecesarios.
- El cambio compila con bundle check del componente tocado.

---

## 13. Uso De Herramientas Externas

Stitch/Figma/u otras herramientas pueden servir para explorar direcciones visuales, pero no son fuente de verdad.

Uso recomendado:

- Generar 2-3 referencias de mood/layout.
- Extraer decisiones: densidad, jerarquia, ritmo, tono.
- Traducir a tokens y componentes del repo.

No recomendado:

- Copiar layouts generados sin adaptar al loop real.
- Redisenar pantalla por pantalla sin sistema.
- Usar mockups que ignoren estados reales: loading, locked, claimable, empty, disabled, mobile, overflow.

---

## 14. Encargos - Stitch Trial Consolidado (2026-04-27)

Esta seccion documenta el estado real implementado para `Encargos` durante el trial visual.  
Scope: solo `Encargos` (no global).

### Activacion Reversible

- Query param: `?encargos_stitch_trial=1`
- Local storage key: `idlerpg:trial:encargos-stitch` con valor `1`
- Si el flag no esta activo, la vista usa el estilo normal del juego.

### Objetivo Del Trial

Validar una direccion dark-fantasy sobria donde:

- Violeta domina la interaccion normal.
- Dorado queda reservado para momentos rituales de alto valor.
- La UI no queda "banada en dorado".

### Perfil Visual Vigente (Abyssal Order Hibrido)

- Base oscura: `#100d16` / `#15121b`.
- Interaccion: violeta (`#9f78ff` / variantes soft).
- Ritual: dorado desaturado (`#e9c176`) para claim/hito.
- Bordes estructurales: blancos sutiles (`rgba(255,255,255,0.08)`).

### Reglas Canonicas Para Encargos (Trial)

1. Dorado:
- Solo para `Recompensas listas`, CTA de claim y progreso ritual.
- No se usa como color dominante de texto general ni de toda botonera.

2. Violeta:
- Default de interaccion en catalogo, seleccion y tono informativo.
- Halo sutil en paneles/chips para identidad magica (sin exceso).

3. Superficies y bordes:
- Paneles oscuros con borde fino y top border violeta.
- Glow controlado (bajo) para conservar sobriedad.

4. Geometria:
- Radius mas firme (evitar look "demasiado friendly").
- Chips menos "pill total" para lectura mas tecnica.

5. Progreso:
- Se mantiene shimmer.
- Track neutro oscuro.
- Fill dorado en contexto ritual de Encargos trial.

### Botonera Final (Encargos Trial)

1. Primario ritual (dorado, alto contraste, bajo glow):
- Uso: `Asignar`, `Reclamar todo`, `Reclamar recompensa`, `Reclamar + repetir`, `Todo + repetir`.
- Estilo: fill dorado en gradiente, texto muy oscuro, borde definido.
- Restriccion: no extender este estilo a toda la botonera de la pantalla.

2. Secundario arcano (violeta):
- Uso: acciones interactivas normales no rituales (cuando aplique fuera de claim).
- Estilo: base oscura, acento violeta, sin competir con CTA ritual.

3. Neutro utilitario:
- Uso: `Volver`, `Retirar equipo`, toggles de expandir/colapsar (`+` / `-`), controles auxiliares.
- Estilo: sobrio, sin relleno dorado.

4. Disabled:
- `Asignar` bloqueado usa estado deshabilitado neutro (sin dorado activo).
- El ritual disabled mantiene legibilidad pero sin brillo.

### Ajustes Funcionales Ya Aplicados

- El shimmer de `JobProgressBar` se preserva (se evito override CSS agresivo).
- Se acoto el selector de chips para no pisar barras de progreso.
- Las acciones de claim/asignacion usan variante `ritual` dedicada en `actionButtonStyle`.
- Se aumento contraste de texto en CTA ritual y se redujo glow para mejorar lectura.

### Anti-Patrones Detectados (No Reintroducir)

- Forzar todos los botones en dorado desde CSS global del scope.
- Forzar todos los titulos medianos a dorado.
- Selector generico tipo `[style*="999px"]` sin scope fino (rompe progress bars).
- Bordes dorados fuertes en todas las cards/chips.

### Checklist Rapido De QA Visual (Encargos)

- Hay como maximo 1-2 focos dorados por viewport sin scroll.
- El header y textos de lectura general no quedan amarillos.
- Las cards se perciben oscuras, con borde sutil y jerarquia clara.
- Las acciones de claim se distinguen como rituales.
- La barra conserva shimmer y no pierde contraste en movimiento.
- El catalogo se entiende primero por contenido, no por efectos.

### Estado

- Vigente como trial reversible.
- Si se aprueba, migrar este perfil a tokens/componentes reutilizables.
