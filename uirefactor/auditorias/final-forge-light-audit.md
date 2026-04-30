# Auditoria final Forge Light

Fecha: 2026-04-29

Referencias obligatorias:
- `uirefactor/nuevoDesign/UI Kit Forge Light.png`
- `uirefactor/design2.md`
- `uirefactor/design-system-implementation-plan.md`
- capturas de layout en `uirefactor/*.png`

Capturas auditadas:
- `uirefactor/current/*-390x844.png`
- `uirefactor/current/*-430x932.png`
- `uirefactor/current/*-1280x800.png`
- reporte: `uirefactor/current/capture-report.md`

## Estado global

La app ya tiene una gramatica Forge Light transversal:
- primitives core en `src/components/ui/forge/`;
- wrappers de dominio para items, crafting, talentos, santuario, combat/rewards;
- assets centralizados por `src/utils/assetRegistry.js`;
- header/nav/bottom nav consistentes;
- Crafting consolidado con drawer de items y sin mesa legacy visible;
- Talentos usa nodos con asset real de skill dentro de frame Forge;
- Santuario usa assets de estaciones;
- overlays de estaciones, excepto Forja, usan shell/surface Forge.

## Slices 7-14

| Slice | Estado | Evidencia |
| --- | --- | --- |
| 7 Inventario | Migrated first pass | Inventario/Mochila ya usa estructura Forge, item assets y drawer/detail visual. Wrappers `FlItem*` disponibles para la siguiente limpieza. |
| 8 Santuario | Captured | Station rows integran `getStationAsset` + `FlIconFrame`; CTAs principales pasan por `FlButton`; captura OK. |
| 9 Talentos | Captured | Nodos migrados a `FlTalentNode`; detalle usa `FlIconFrame` con `getTalentAsset`; contador TP usa `FlTalentPointCounter`; captura OK. |
| 10 Combat | Captured | Ya estaba avanzado con combat assets; captura OK sin errores JS. Queda ajuste fino de parte inferior/bosses como deuda no bloqueante. |
| 11 Heroe/Atributos | Captured | Ficha y Atributos ya estaban migrados con portraits/rows Forge; captura OK. |
| 12 Ecos | Captured | Ecos ya estaba migrado con summary Forge; captura OK. |
| 13 Expedicion/Intel | Captured | Intel ya estaba migrado como radar tactico; captura OK. |
| 14 Cleanup | First pass | Se agregaron wrappers para evitar nuevas duplicaciones; overlays heredados reciben shell Forge; quedan inline legacy internos como deuda controlada. |

## Talentos

Estado: cerrado como slice visual.

Cambios auditados:
- Los nodos comprable/activo/max/bloqueado son distinguibles por glow, frame, opacity y punto verde.
- Las skill PNG existentes entran por `assetRegistry` y `FlTalentNode`.
- El panel de detalle mantiene CTA unico y requisitos visibles.
- Mobile 390x844 muestra header, tabs, arbol y detalle sin errores JS.

Riesgo residual:
- Hay CSS legacy de Talentos que convive con wrappers Forge. No rompe captura, pero en una limpieza futura conviene retirar clases antiguas `forge-talent-node-*` que ya quedaron como compatibilidad.

## Santuario

Estado: repaso aplicado y capturado.

Cambios auditados:
- Estaciones usan assets reales de `public/assets/sanctuary/stations`.
- `ABRIR`, `Reclamar todo` y `Todo + repetir` pasan por `FlButton`.
- El hub mantiene jerarquia clara: trabajos primero, estaciones despues, reliquias debajo.
- Desktop mantiene filas densas sin inflar cards.

Riesgo residual:
- Algunos botones secundarios y acciones de reliquias siguen con clases locales `fl-sanctuary-button`; visualmente estan alineados, pero no todos son componentes `FlButton` todavia.

## Crafting

Estado: aprobado visualmente.

Notas:
- La mesa legacy queda fuera de la composicion visible.
- El drawer de items queda como patron a reutilizar para detalles largos de item/proyecto.
- No se toco gameplay de Crafting en esta fase.

Riesgo residual:
- Validar manualmente feedback de `MEJORAR` y modos `Afinar/Reforjar/Imbuir/Extraer`; la captura automatica cubre estado inicial.

## Overlays de estaciones

Estado: migracion shell/surface aplicada.

Overlays cubiertos:
- `DistilleryOverlay`
- `EncargosOverlay`
- `SigilAltarOverlay`
- `BibliotecaOverlay`
- `LaboratoryOverlay`
- `DeepForgeOverlay`

Cambios auditados:
- Todos usan `OverlayShell variant="forge"` y `OverlaySurface variant="forge"`.
- Se agrego clase `fl-station-overlay` para normalizar fondo, borde, texto y botones legacy internos.
- Forja queda excluida porque ya usa su propio flujo `SanctuaryForgeOverlay`.

Riesgo residual:
- Los contenidos internos de Laboratorio, Destileria, Encargos, Altar y Deep Forge siguen teniendo mucho inline style heredado. La piel global evita choque visual fuerte, pero la migracion profunda por seccion deberia convertir cards/metrics/botones internos a primitives en otro pase.
- El script actual no captura overlays de estaciones, salvo Crafting. Queda recomendado ampliar `scripts/captureForgeLightScreens.mjs` con targets de overlays.

## Resultado de gates

Gates esperados:
- `npm run build`
- `npm run ui:capture`
- `git diff --check` sobre archivos tocados

Resultado mas reciente: ver seccion final de `uirefactor/progreso_actual.md`.

