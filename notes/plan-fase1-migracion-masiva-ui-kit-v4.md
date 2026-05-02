# Plan Operativo — Fase 1 Migración Masiva Forge Light UI Kit v4

## 1) Objetivo y ejecución

Este documento define la ejecución **continua** (sin pausas por aprobación) de la Fase 1 de migración visual/estructural al UI Kit v4.

- Alcance Fase 1: **App Shell + Sanctuary + Inventory + Crafting**.
- Fuera de alcance Fase 1: Combat, Stats, Codex, Prestige (pasan a Fase 2).
- Regla de ejecución: avanzar por lotes `Foundation Lock -> Shell -> Sanctuary -> Inventory -> Crafting -> Hardening` sin detenerse entre lotes.

## 2) Fuentes de verdad (orden obligatorio)

1. `uirefactor/kit-demo-3/forge-light-kit-v4.html` (autoridad visual primaria).
2. `uirefactor/kit-demo-3/flDesign.md` (normas canónicas, cascada, anti-overrides, prácticas de migración).
3. Sistema real de app:
   - componentes: `src/components/ui/forge/*`
   - estilos: `src/styles/forge-light-v2/*`
4. Referencias de módulos: `forge-light-kit-premium-modules.html` solo por encaje semántico (no copy literal por estética).

## 3) Decisiones técnicas cerradas para Fase 1

- Sin skin inline nueva. Toda piel visual vive en `forge-light-v2` o en wrappers canónicos.
- Rareza: badge **rectangular** canónica (no pill).
- Notificaciones: badge circular (`FlNotifBadge`) para alertas de nav/estaciones.
- CTA y botones de fila: `FlButton` variantes canónicas (`default/secondary/danger/danger-ghost/success`).
- Filas de dominio:
  - inventario/equipado: `FlItemRow` + wrappers de pantalla;
  - reliquias: `FlRelicRow`;
  - jobs: `FlJobRow`;
  - estaciones: `FlStationCard`.
- Toda excepción visual se expresa como `variant/size/tone` del componente, no como clases de pantalla ad-hoc.

## 4) Matriz de migración (actual -> canónico)

### App Shell
- Header recursos + estado run -> `FlHeaderBar` + counters/tag/badges canónicos.
- Bottom nav -> `FlBottomNav` + `FlNotifBadge`.
- Tabs desktop/mobile -> `FlTabs` / nav adapters.

### Sanctuary
- Panel Jobs -> `FlPanel` + `FlJobRow`.
- Panel Stations -> `FlPanel` + `FlStationCard`.
- Panel Relics -> `FlPanel` + `FlRelicRow`.
- Estado sin clase/primer flujo -> `FlPanel` + clases globales de pantalla (sin style inline).

### Inventory
- Row inventario/equipado -> `FlItemRow`.
- Rareza visual en listados/modales -> `FlBadge` (`variant="rect"`, `size="xs"` o `sm` según densidad).
- Acciones row/modal -> `FlButton` canónicos.
- Empty state -> `FlEmptyState`.

### Crafting
- Tabs de modo -> `FlTabs`.
- Botones primarios/secundarios -> `FlButton`.
- Costos/progreso/tracks -> `FlCostDisplay`, `FlProgressBar`, `FlUpgradeTrack`.
- Cards/paneles de bloque -> `FlCard`/`FlPanel` canónicos.

## 5) Estado actual de Fase 1 (real)

### Ya convergido o casi convergido
- Shell: base canónica activa.
- Sanctuary: jobs/stations/relics ya en wrappers canónicos; se inició limpieza de bloque legacy de estado sin clase.
- Inventory: `FlItemRow` dominante; rareza en `FlBadge` rectangular; filtros/overflow/bulk/modal de loot ya migrados a clases globales + `FlButton`/`FlTag`.
- Crafting: flujo principal y log ya con clases globales; persiste bloque legacy grande con style props para modos avanzados.

### Brechas restantes para cerrar Fase 1
- Crafting: eliminar o modularizar el bloque `fl-crafting-legacy-*` (modos avanzados) para quitar style props de skin.
- App Shell overlays (`App.jsx`): todavía quedan style props inline en flujos de pre-run/overlays.
- Sanctuary: hacer barrido final de inline residual fuera del flujo ya migrado.

## 6) Lotes de implementación (ejecución sin interrupción)

### Lote A — Foundation Lock (base)
1. Congelar variantes canónicas en `FlButton`, `FlBadge`, `FlTag`, `FlPanel`, `FlCard`, `FlProgressBar`, `FlSwitch`.
2. Remover selectores legacy de rareza/chips que contradigan el contrato canónico.
3. Verificar build.

### Lote B — Shell
1. Normalizar states/alturas/espaciados de `FlHeaderBar` y `FlBottomNav`.
2. Auditoría de cascada en `navigation.css` para evitar overrides cruzados.
3. Verificar build.

### Lote C — Sanctuary
1. Completar migración del bloque “sin clase” a clases globales.
2. Eliminar helpers de estilos inline no usados.
3. Revisar onboarding spotlight sin style props de skin.
4. Verificar build.

### Lote D — Inventory
1. Migrar paneles y filas auxiliares (filtros, bulk sell, overflow note, modal settings) a clases globales. ✅
2. Reemplazar badges/chips legacy por `FlBadge`/`FlTag`. ✅
3. Limpiar estilos helper inline en componente. ✅
4. Verificar build. ✅

### Lote E — Crafting
1. Consolidar vistas y acciones sobre wrappers/primitives canónicos.
2. Mover estilos de legacy block a `screens/crafting.css`.
3. Retirar dependencias de style props de skin.
4. Verificar build.

### Lote F — Hardening
1. Barrido final de inline en alcance Fase 1.
2. Build + revisión responsive obligatoria (`390x844`, `430x932`, `1280x800`).
3. Checklist final de aceptación.

## 7) Checklist de aceptación Fase 1

- [x] Botones estables en todos los estados (default/hover/pressed/disabled/loading) en Shell + Inventory migrado.
- [x] Rareza siempre rectangular y consistente (sin pills no deseadas) en Inventory.
- [x] Notif badges circulares en nav/estaciones cuando aplique.
- [x] Panel/card con textura, borde y profundidad coherentes en bloques ya migrados.
- [x] Shell consistente en mobile/desktop (estructura canónica).
- [ ] Sin cortes/overlaps en viewports objetivo (pendiente barrido visual final de Fase 1).
- [x] `npm run build` OK al cierre.

## 8) Pendientes de decisión (no bloquean Fase 1, sí Fase 2)

1. Combat en Fase 2: ¿monolítico o dividido en `HUD + panels` y luego `logs/contracts`?
2. Stats/Codex/Prestige: ¿migración por módulos compartidos o por pantalla completa?
3. Política formal de deprecación de `src/styles/forge-light.css` y `responsive.css`:
   - freeze de cambios;
   - fecha de retiro;
   - estrategia de fallback.

## 9) Nota operativa para futuras IAs

Si un componente no se parece al kit:
1. revisar el primitive canónico,
2. revisar cascada (`tokens -> primitive -> module -> screen`),
3. recién luego tocar wrapper o pantalla,
4. evitar inline y evitar crear un segundo sistema visual.
