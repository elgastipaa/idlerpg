# Responsive Migration Log

## Estado
- Iniciado: 2026-04-24
- Estrategia: migración incremental por lotes con gates anti-regresión.

## Lote 0 — Fundaciones

### Cambios
- Se creó [tokens.css](/home/gmendoza/coding/idlerpg/src/styles/tokens.css:1) con:
  - breakpoints (`--bp-sm`, `--bp-md`, `--bp-lg`, `--bp-xl`)
  - escala tipográfica/espaciado con `clamp`
  - variables globales de offsets (`--app-header-offset`, `--app-bottom-nav-offset`)
  - z-index responsive para overlays (`--overlay-z-soft`)
- Se creó [responsive.css](/home/gmendoza/coding/idlerpg/src/styles/responsive.css:1) con primitives:
  - `.app-shell-root`, `.app-shell-content`
  - `.overlay-shell`, `.overlay-shell__surface`, variantes
  - utilidades responsive base.
- Se importaron estilos globales en [main.jsx](/home/gmendoza/coding/idlerpg/src/main.jsx:1).

### Riesgo
- Bajo. Solo fundaciones CSS, sin cambio de lógica de juego.

### Gate
- Pendiente de validación conjunta al cerrar lote 1 (overlay + shell).

## Lote 1 — Overlays de estaciones

### Cambios
- Se extendió [responsive.css](/home/gmendoza/coding/idlerpg/src/styles/responsive.css:1) con primitives de overlays:
  - grids: `.overlay-cols-2-4`, `.overlay-cols-1-2`, `.overlay-cols-1-3`
  - splits: `.overlay-split-52-48`, `.overlay-split-54-46`, `.overlay-split-45-55`, `.overlay-split-58-42`
  - utilidades: `.overlay-actions-end`, `.overlay-responsive-buttons`, `.overlay-job-progress-wrap`
- Migración de ternarios visuales `isMobile ? ... : ...` a clases CSS-first en:
  - [ExtractionOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/ExtractionOverlay.jsx:1)
  - [DeepForgeOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/DeepForgeOverlay.jsx:1)
  - [BlueprintForgeOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/BlueprintForgeOverlay.jsx:1)
  - [EncargosOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/EncargosOverlay.jsx:1)
  - [SigilAltarOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/SigilAltarOverlay.jsx:1)
  - [DistilleryOverlay.jsx](/home/gmendoza/coding/idlerpg/src/components/DistilleryOverlay.jsx:1) (wrapper de barra de progreso)

### Excepciones
- `isMobile` conservado solo en comportamiento tutorial/scroll-safe en Destilería.

### Riesgo
- Bajo/medio. Solo layout/estilo en overlays, sin tocar reducers ni contratos de dispatch.

## Lote 2 — App shell y navegación principal

### Cambios
- App shell migrada a clases globales:
  - root `app-shell-root`
  - content `app-shell-content`
  - header `app-header-shell`, `app-header-inner`, `app-header-title`
  - viewport principal `app-primary-viewport`
- Ajustes aplicados en [App.jsx](/home/gmendoza/coding/idlerpg/src/App.jsx:1) para reducir ternarios visuales de shell/header.
- `themeToggleButtonStyle` quedó fluido con `clamp` (sin bifurcación mobile/desktop).

### Excepciones
- Se mantiene bifurcación mobile/desktop donde hay diferencias funcionales (bottom nav, toasts, overlays runtime).

### Riesgo
- Medio. Se tocó layout raíz, pero sin cambios en lógica de tabs ni onboarding.

## Lote 3 — Vistas core (Expedición / Combate / Mochila)

### Cambios
- [ExpeditionView.jsx](/home/gmendoza/coding/idlerpg/src/components/ExpeditionView.jsx:1):
  - root y dock/subnav mobile movidos a clases responsive (`expedition-*`)
- [Inventory.jsx](/home/gmendoza/coding/idlerpg/src/components/Inventory.jsx:1):
  - root visual (`inventory-root`) y grids 1/2 columnas mediante clases compartidas
  - acciones overflow con patrón responsive común
- [Combat.jsx](/home/gmendoza/coding/idlerpg/src/components/Combat.jsx:1):
  - root/layout principal, grid de navegación de tier y panel de sesión movidos a clases (`combat-*`)
  - grid de métricas migrado a `overlay-cols-2-4`

### Excepciones
- Se mantiene `isMobile` en comportamiento crítico (safe zones, scroll programático, sheet drag).

### Riesgo
- Medio. Cambios visuales en pantallas de alta frecuencia de uso.

## Lote 4 — Fusión de duplicados (Talents)

### Cambios
- Se unificó la lógica de render de tarjeta en [Talents.jsx](/home/gmendoza/coding/idlerpg/src/components/Talents.jsx:1):
  - `TalentNodeCard` ahora soporta modo `compact`
  - `MobileTalentNodeRow` pasa a wrapper mínimo sobre `TalentNodeCard` (sin duplicar markup/lógica de cálculo)

### Riesgo
- Medio. Cambia la ruta de render de nodos mobile, manteniendo dispatch y targets de onboarding.

## Lote 5 — Limpieza final

### Cambios
- Eliminación de `isMobile` en presentación de overlays migrados (quedaron solo excepciones funcionales).
- Consolidación de utilidades responsive en un único archivo base.
- Registro de excepciones explícitas para no romper onboarding y scroll seguro.

### Residuales intencionales
- Quedan ternarios `isMobile` en:
  - safe-zones/scroll/tutorial
  - overlays runtime con sheet drag
  - algunos bloques de `Combat`, `Inventory`, `App` y `RunSigilOverlay` donde el cambio es funcional además de visual.

## Gate y validación
- No se ejecutó `npm run build` en esta pasada por restricción explícita del usuario.
- Validación pendiente recomendada (manual):
  - 360x780, 390x844, 768x1024, 1280x800
  - flujo completo run -> extracción -> santuario
  - overlays de 6 estaciones
  - onboarding de beats con spotlight + scroll programático.
