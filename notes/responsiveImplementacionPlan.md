# Plan de Implementación Responsive (Seguro)

## Objetivo
- Migrar de `isMobile` en presentación a responsive CSS-first por fases.
- Mantener estabilidad funcional en onboarding, combate, extracción, santuario y persistencia.
- Regla operativa: **no se avanza de fase si falla un gate crítico**.

## Alcance
- Sí: layout, spacing, tipografía, grids, visibilidad visual por ancho.
- No (en fases iniciales): lógica de onboarding spotlight, scroll programático, temporizadores, estado de run/save.

## Funciones críticas que no pueden romperse
1. Flujo de onboarding (beats, spotlight, scroll, bloqueo/desbloqueo de acciones).
2. Flujo de expedición/combate (ticks, autoavance, extracción).
3. Flujo de extracción (selección de cargo/item, confirmación, persistencia).
4. Flujo santuario/estaciones (jobs running/claimable, overlays, navegación).
5. Save/load y retorno foreground/background en mobile.

## Gates obligatorios por lote
1. `esbuild` por archivo tocado (sin build global).
2. Smoke manual en 4 viewports: `360x780`, `390x844`, `768x1024`, `1280x800`.
3. Smoke funcional mínimo:
- Abrir/cerrar overlays de estaciones.
- Iniciar run, abrir extracción, confirmar extracción.
- Reclamar al menos 1 job en santuario.
- Verificar que onboarding overlay no pierde ancla visual.
4. Si falla algo crítico: rollback del lote (no continuar).

## Estrategia de ejecución (lotes)

### Lote 0 — Fundaciones sin riesgo
- Crear capa base de tokens responsive (`clamp`, spacing, radios, breakpoints).
- Crear utilidades de layout reutilizable para overlays/cards.
- **Sin** remover lógica actual ni `isMobile` todavía.

**Done cuando**
- Tokens disponibles y aplicables.
- Cero cambios de comportamiento.

### Lote 1 — Overlays de estaciones (quick win)
- Migrar visual responsive de `OverlayShell` y estaciones a primitives comunes.
- Reemplazar ternarios visuales obvios (`padding`, `radius`, `grid`) por clases/tokens.
- Mantener JS de comportamiento (spotlight/scroll).

**Done cuando**
- Laboratorio, Destilería, Biblioteca, Encargos, Altar, Taller mantienen paridad visual/funcional.

### Lote 2 — App Shell y navegación principal
- Migrar layout del shell de `App` a CSS-first.
- Reducir decisiones visuales por `isMobile` en header/content/nav.
- Mantener offsets críticos de overlays/onboarding en JS si aplican.

**Done cuando**
- Navegación funciona igual en mobile/desktop.
- No hay regresión en tab switching ni overlays.

### Lote 3 — Expedición y vistas core
- Migrar `ExpeditionView`, `Combat`, `Inventory` en presentación.
- No tocar lógica de combate/ticks ni telemetría.
- Conservar safe-zones programáticas necesarias.

**Done cuando**
- Flujo completo: iniciar run → combate → extracción → volver a santuario.

### Lote 4 — Fusión de duplicados (Talents)
- Unificar `MobileTalentNodeRow` + `TalentNodeCard` en un componente responsive.
- Validar selectors/targets de onboarding.

**Done cuando**
- Mismo comportamiento de compra/reset talentos en 4 viewports.

### Lote 5 — Limpieza final
- Remover `isMobile` residual de presentación.
- Mantener solo hooks de comportamiento explícitos.
- Documentar excepciones justificadas.

**Done cuando**
- Lista cerrada de usos `isMobile` de presentación eliminada.
- Quedan solo usos validados de comportamiento.

## Excepciones permitidas (mantener JS)
- Spotlight onboarding (medición y reposicionamiento).
- Scroll programático y safe-zones dinámicas.
- Ajustes por teclado virtual/safe-area real.
- Comportamientos touch/haptics (si aplica).

## Control de riesgo y rollback
- Trabajo en lotes pequeños, cada lote autocontenido.
- Si hay regresión crítica:
- Revertir solo el lote actual.
- Registrar causa raíz.
- Replanificar antes de retomar.

## Registro operativo
- Archivo de seguimiento sugerido: `notes/responsiveMigrationLog.md`.
- En cada lote registrar:
- archivos tocados,
- cambios de presentación hechos,
- validaciones corridas,
- incidencias y mitigaciones.

## Orden de arranque recomendado
1. Lote 0
2. Lote 1
3. Lote 2
4. Lote 3
5. Lote 4
6. Lote 5
