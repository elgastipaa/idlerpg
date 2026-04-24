# Entregables Responsive

## Alcance y diagnóstico rápido

- Auditoría estática de responsive/layout en:
  - `src/App.jsx`
  - `src/components/*` (pantallas principales + overlays)
- Hallazgo clave:
  - `isMobile ?` en `src`: **207** ocurrencias.
  - Componentes con `useState(window.innerWidth < 768)`: **11**.
  - Listeners `resize` relevantes: **18**.
  - Sistema de estilos actual: **predominio de inline styles en JS** (sin capa CSS global de tokens/breakpoints).

---

## Sección A — Tabla de ocurrencias

| # | Archivo | Línea | Tipo | Qué hace | Solución CSS | ¿Eliminar JS? |
|---|---|---:|---|---|---|---|
| 1 | `src/App.jsx` | 366 | `isMobile state` | breakpoint binario global app | `@media (min-width)` + clases layout shell | ✅ sí |
| 2 | `src/App.jsx` | 422 | `resize listener` | recalcula `isMobile` | remover cuando layout sea CSS-first | ✅ sí |
| 3 | `src/App.jsx` | 731-761 | presentación | header/content paddings por `isMobile` | tokens CSS + media queries | ✅ sí |
| 4 | `src/App.jsx` | 849 | presentación | superficie `main` distinta mobile/desktop | clases `.app-surface` responsive | ✅ sí |
| 5 | `src/components/Combat.jsx` | 324 | `isMobile state` | layout + tamaños + spacing | grid responsive CSS | ✅ sí (presentación) |
| 6 | `src/components/Combat.jsx` | 673 | `resize listener` | recalcula `isMobile` | remover post-migración layout | ✅ sí |
| 7 | `src/components/Combat.jsx` | 704-710 | comportamiento | safe zones para scroll programático | mantener hook específico de viewport/safe-area | ❌ no |
| 8 | `src/components/Inventory.jsx` | 101 | `isMobile state` | grids, modal sheet, densidad | clases responsive + container queries | ✅ sí (presentación) |
| 9 | `src/components/Inventory.jsx` | 106-107 | `resize listener` | recalcula `isMobile` | remover para layout | ✅ sí |
| 10 | `src/components/Inventory.jsx` | 224-226 | comportamiento | top/bottom safe para tutorial scroll | mantener en capa onboarding/scroll | ❌ no |
| 11 | `src/components/Talents.jsx` | 788 | `isMobile state` | alterna render de card/row | fusionar componente único + CSS | ✅ sí |
| 12 | `src/components/Talents.jsx` | 667 vs 566 | componente duplicado | `MobileTalentNodeRow` y `TalentNodeCard` | una sola tarjeta responsive | ✅ sí |
| 13 | `src/components/Talents.jsx` | 800-801 | `resize listener` | recalcula `isMobile` | remover tras fusión | ✅ sí |
| 14 | `src/components/ExpeditionView.jsx` | 48 | `isMobile state` | subnav spacing/overflow | `overflow-x:auto` + estilos responsive puros | ✅ sí |
| 15 | `src/components/ExpeditionView.jsx` | 79 | `resize listener` | recalcula `isMobile` | remover | ✅ sí |
| 16 | `src/components/Character.jsx` | 71 | `isMobile state` | layout cards selección spec | grid CSS responsive | ✅ sí |
| 17 | `src/components/Character.jsx` | 90 | `window.innerWidth < 420` | narrow-mode visual | `@media (max inline-size)`/container query | ✅ sí |
| 18 | `src/components/Crafting.jsx` | 112 | `isMobile state` | paneles/toolbar/cards | CSS responsive por secciones | ✅ sí |
| 19 | `src/components/Crafting.jsx` | 124/146/194 | `resize listeners` | layout + alturas + scroll helpers | layout a CSS, mantener solo scroll behavior | ⚠️ parcial |
| 20 | `src/components/Sanctuary.jsx` | 197-199 | `viewportWidth state` | `isMobileViewport`/`isNarrowViewport` para layout | CSS responsive + contenedores | ✅ sí (presentación) |
| 21 | `src/components/Sanctuary.jsx` | 241-243 | `resize listener` | recalcula width | remover para layout | ✅ sí |
| 22 | `src/components/OnboardingOverlay.jsx` | 201-203 | comportamiento UI | offsets overlay por mobile/desktop | mantener JS (spotlight/safe area) | ❌ no |
| 23 | `src/components/OverlayShell.jsx` | 17-29 | presentación/infra | insets y alineación por `isMobile` | migrar a variables CSS del shell | ⚠️ parcial |
| 24 | `src/components/LaboratoryOverlay.jsx` | 18 | presentación | paddings/radius por `isMobile` | clase `.overlay-card` responsive | ✅ sí |
| 25 | `src/components/DistilleryOverlay.jsx` | 312 | presentación | mismo patrón de card responsive por JS | reutilizar clase shared | ✅ sí |
| 26 | `src/components/EncargosOverlay.jsx` | 190 | presentación | mismo patrón overlay | shared responsive primitives | ✅ sí |
| 27 | `src/components/BibliotecaOverlay.jsx` | 9 | presentación | mismo patrón overlay | shared responsive primitives | ✅ sí |
| 28 | `src/components/SigilAltarOverlay.jsx` | 134 | presentación | mismo patrón overlay | shared responsive primitives | ✅ sí |
| 29 | `src/components/DeepForgeOverlay.jsx` | 235 | presentación | mismo patrón overlay | shared responsive primitives | ✅ sí |
| 30 | `src/components/ExtractionOverlay.jsx` | 168 | presentación | grid y tamaños por `isMobile` | clases + breakpoints | ✅ sí |

Notas:
- Hay múltiples usos de `isMobile` válidos para comportamiento (scroll/tutorial/safe-areas). Esos no deberían eliminarse en fase 1.
- El mayor costo de mantenimiento actual proviene de decisiones visuales en JS inline.

---

## Sección B — Componentes a fusionar

### COMPONENTE: `TalentNodeCard` + `MobileTalentNodeRow`

- Diferencias actuales:
  - Mobile: row compacta, copy truncado, CTA ajustado.
  - Desktop: card completa con más densidad visual.
- Solución CSS:
  - Un solo componente `TalentNodeCard`.
  - `grid-template`, `font-size`, `line-clamp`, `actions` por media/container queries.
- Complejidad: media.
- Riesgo: medio (impacta onboarding `buy_talent` y scroll a target).

### COMPONENTE: navegación primaria en `App`

- Diferencias actuales:
  - Desktop nav superior y mobile bottom nav renderizados en ramas separadas.
- Solución CSS:
  - Mantener semántica común de ítems/tab config y extraer `PrimaryNav` único con variantes CSS.
- Complejidad: media.
- Riesgo: medio (accesibilidad + onboarding targets de tabs).

### COMPONENTE: card shell de overlays de estaciones

- Diferencias actuales:
  - Misma estructura repetida en cada overlay con ternarios de padding/radius.
- Solución CSS:
  - Primitive único (`OverlayCard`) con classes: `overlay-card`, `overlay-card--station`.
- Complejidad: baja.
- Riesgo: bajo.

---

## Sección C — Sistema de breakpoints propuesto

- `--bp-sm: 480px`
  - Justificación: mejora chips/header compacto y botones sin salto brusco en teléfonos grandes.
- `--bp-md: 768px`
  - Justificación: transición natural a layouts de 2+ columnas (`Inventario`, `Santuario`, `Expedición`).
- `--bp-lg: 1024px`
  - Justificación: overlays y vistas complejas admiten split estable (panel/lista + detalle).
- `--bp-xl: 1280px`
  - Justificación: desktop ancho con más aire sin estirar demasiado cards.

---

## Sección D — Técnica de implementación recomendada

Recomendación combinada:

1. **Opción A (base): CSS Variables + Media Queries**
   - Porque hoy domina inline style.
   - Necesario para unificar spacing/typography/layout sin duplicar JS.

2. **Opción B (tipografía/espaciado): `clamp()`**
   - Para escalar suave sin saltos rígidos en tamaños intermedios.

3. **Container Queries (selectivo)**
   - Para cards reutilizables (`loot`, `talents`, tarjetas de estación) que aparecen en anchos variados.

Decisión práctica:
- No intentar “big-bang”.
- Mover primero layout visual a CSS.
- Mantener JS solo donde hay comportamiento real.

---

## Sección E — Plan de migración por fases

### Fase A — Fundaciones (sin tocar lógica)

- Crear `src/styles/tokens.css` (o equivalente) con:
  - breakpoints documentados
  - escala tipográfica (`clamp`)
  - spacing scale (`clamp`)
  - radio/sombra/base surfaces
- Definir clases utilitarias mínimas:
  - `.app-shell`, `.section-card`, `.overlay-card`, `.responsive-grid`.

### Fase B — Normalizar overlays (quick win, bajo riesgo)

- Migrar `Laboratory`, `Distillery`, `Encargos`, `Biblioteca`, `SigilAltar`, `DeepForge`, `Extraction`.
- Eliminar ternarios visuales repetidos de padding/radius/grid.

### Fase C — Pantallas core

- `App` (shell + nav).
- `Sanctuary`, `ExpeditionView`, `Inventory`, `Combat`.
- Objetivo: remover decisiones visuales `isMobile ? ... : ...`.

### Fase D — Fusionar duplicados

- Unificar `MobileTalentNodeRow` + `TalentNodeCard`.
- Revisar onboarding selectors para no romper beats.

### Fase E — Limpieza final

- Eliminar hooks globales de `isMobile` usados solo para presentación.
- Mantener hooks específicos de comportamiento:
  - spotlight/scroll programático
  - safe-area dinámico
  - keyboard overlays.

---

## Sección F — Excepciones justificadas (JS válido)

Válido mantener en JS:
- Spotlight onboarding (medición y scroll a target).
- Safe-area dinámica para overlays con bloqueo.
- Comportamiento de scroll programático y reintentos.
- Detección de teclado virtual (si se incorpora).
- Haptics/touch específicos (si se incorpora).

No válido en JS (migrar a CSS):
- tamaños de fuente/padding/márgenes
- columnas y dirección de layout
- mostrar/ocultar variantes visuales por ancho
- densidad visual y jerarquía tipográfica

---

## Opinión técnica para este proyecto

Sí conviene migrar a responsive CSS-first, pero **no conviene hacerlo de una sola vez**.

- A favor:
  - reduce divergencia mobile/desktop,
  - elimina flashes por medición inicial,
  - baja costo de mantenimiento.
- Riesgo de big-bang:
  - romper onboarding/spotlight y overlays.

Recomendación concreta:
- ejecutar fases A→E en lotes chicos,
- medir regresión visual en `360px`, `768px`, `1280px`,
- preservar JS únicamente para comportamiento real.

