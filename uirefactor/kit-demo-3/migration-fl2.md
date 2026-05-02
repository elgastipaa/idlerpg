# Tarea: Migración Visual Forge Light v4 (sin contexto previo)

  Estás trabajando en este repo local: `/home/gmendoza/coding/idlerpg`.

  ## Objetivo
  Migrar visualmente estas áreas al UI Kit Forge Light v4, manteniendo la lógica y comportamiento actual:
  1. Encargos
  2. Destilería
  3. Inicio de Expedición (selección de clase/sigilos/previo de run)
  4. Tab Héroe + subtabs
  5. Ecos

  La meta es **paridad estética alta** con el kit (dark fantasy premium), sin romper UX ni lógica.

  ---

  ## Fuentes de verdad (leer primero)
  1. UI Kit principal (autoridad visual):
     - `uirefactor/kit-demo-3/forge-light-kit-v4.html`
  2. Módulos premium (referencia semántica):
     - `uirefactor/kit-demo-3/forge-light-kit-premium-modules.html`
  3. Sistema de diseño operativo del proyecto:
     - `uirefactor/kit-demo-3/flDesign.md`
  4. Plan/mapeo previo:
     - `uirefactor/kit-demo-3/migration-map-forge-light.md`

  ---

  ## Restricciones duras
  - No usar estilos inline para “skin” (solo casos técnicos mínimos inevitables).
  - No crear un sistema paralelo por pantalla.
  - No volver a usar estilos legacy como base (`forge-light.css`/bloques viejos); si hay conflicto de cascada, resolverlo en capa
  canónica v2.
  - Mantener layout actual por defecto. Solo cambiar layout si:
    - el layout actual impide claramente acercarse al UI Kit, y
    - lo resolvés con wrappers/módulos reutilizables (no hacks por pantalla).

  ---

  ## Dónde vive el sistema visual canónico
  - Entrada de estilos v2: `src/styles/forge-light-v2/index.css`
  - Capas principales:
    - primitives/tokens/surfaces/nav/buttons/badges/progress en `src/styles/forge-light-v2/*.css`
    - módulos/wrappers en `src/styles/forge-light-v2/modules.css`
    - ajustes por pantalla en `src/styles/forge-light-v2/screens/*.css`
  - Componentes base: `src/components/ui/forge/*.jsx`
  - Export central: `src/components/ui/forge/index.js`
  - Wrappers de dominio ya existentes: `src/components/ui/forge/FlDomain.jsx`

  ---

  ## Pantallas objetivo (archivos a inspeccionar primero)
  - Encargos: `src/components/EncargosOverlay.jsx`
  - Destilería: `src/components/DistilleryOverlay.jsx`
  - Expedición inicio: `src/components/ExpeditionView.jsx`, `src/components/SanctuaryClassSelector.jsx`, `src/components/
  SigilAltarOverlay.jsx`
  - Héroe/subtabs: `src/components/HeroView.jsx`, `src/components/Character.jsx`, `src/components/Stats.jsx`, `src/components/
  Talents.jsx` (y/o componentes vinculados desde HeroView)
  - Ecos: localizar con `rg -n "Ecos|Echo|echo" src/components src`

  ---

  ## Componentes canónicos que DEBÉS priorizar
  Usar primero los ya disponibles en `src/components/ui/forge`:
  - `FlPanel`, `FlCard`, `FlSectionHeader`
  - `FlButton`, `FlIconButton`, `FlSideAction`, `FlSwitch`
  - `FlTabs`, `FlBottomNav`, `FlHeaderBar`
  - `FlBadge`, `FlTag`, `FlNotifBadge`
  - `FlProgressBar`, `FlMilestoneProgress`, `FlHealthBar`
  - `FlResourceCounter`, `FlResourcePill`
  - `FlModal`, `FlTooltip`, `FlPagination`
  - wrappers de `FlDomain.jsx` cuando encajen semánticamente.

  Si falta algo importante, crear wrapper/módulo nuevo reusable (no inline).

  ---

  ## Proceso obligatorio
  1. Inspeccionar UI Kit v4 completo (componentes + do/don’t).
  2. Inventariar cada bloque visual en las 5 áreas target.
  3. Crear tabla de mapeo (archivo nuevo):
     - `notes/migration-pass-<fecha>-forge-v4.md`
     - columnas: componente actual | intención semántica | componente/wrapper destino | archivo a tocar | conservar layout (sí/
  no).
  4. Implementar por fases sin pausar:
     - Fase A: primitives/wrappers faltantes
     - Fase B: Encargos + Destilería
     - Fase C: Expedición inicio
     - Fase D: Héroe + subtabs
     - Fase E: Ecos
  5. Limpiar overrides redundantes y restos legacy que entren en conflicto con v2.
  6. Validar build al final.

  ---

  ## Criterios de decisión
  - Acción clickeable => botón canónico.
  - Cambio de vista => tabs/nav canónico.
  - Estado => badge/tag.
  - Recurso/cantidad => resource counter/pill.
  - Progreso => progress/milestone bar.
  - Contenedor de sección => panel/card canónico.
  - Si no hay exacto => conservar layout actual y aplicar gramática visual v4 (tokens, textura, doble borde, profundidad), sin
  inventar metáforas nuevas.

  ---

  ## Entregables
  1. Migración visual funcional de las 5 áreas.
  2. Sin regressions de interacción (toggles, tabs, acciones, disabled, loading).
  3. Sin estilos inline de skin.
  4. Archivo de mapeo/documentación en `notes/`.
  5. Build pasando: `npm run build`.
  6. Resumen final con:
     - archivos tocados,
     - wrappers nuevos creados,
     - conflictos de cascada detectados y cómo se resolvieron,
     - pendientes reales (solo si son bloqueantes).

  ---

  ## QA mínimo obligatorio
  - Viewports: `390x844`, `430x932`, `1280x800`
  - Checklist:
    - sin solapamientos
    - texto legible
    - altura de botones estable
    - estados hover/active/selected/disabled/loading coherentes
    - rareza por borde/badge/frame, no por fondo completo
    - estética premium v4 consistente (textura, doble borde, bevel, profundidad)

  No te detengas a pedir confirmaciones intermedias. Ejecutá de punta a punta.