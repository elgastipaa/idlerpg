# Responsive Context Dump (2026-04-24)

## Objetivo de este dump
Dejar contexto operativo para seguir iterando por lotes sin depender de memoria de sesión.

## Lotes aplicados
- L0: tokens + primitives globales.
- L1: overlays de estaciones migrados a clases CSS-first.
- L2: shell/header/viewport principal de App migrados a clases.
- L3: ajustes core en Expedition/Inventory/Combat (presentación principal).
- L4: fusión de duplicados en Talents (`TalentNodeCard` + modo `compact`).
- L5: limpieza parcial de ternarios visuales + excepciones documentadas.

## Archivos clave tocados
- `/home/gmendoza/coding/idlerpg/src/styles/tokens.css`
- `/home/gmendoza/coding/idlerpg/src/styles/responsive.css`
- `/home/gmendoza/coding/idlerpg/src/App.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/ExtractionOverlay.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/DeepForgeOverlay.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/BlueprintForgeOverlay.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/DistilleryOverlay.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/EncargosOverlay.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/SigilAltarOverlay.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/ExpeditionView.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/Inventory.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/Combat.jsx`
- `/home/gmendoza/coding/idlerpg/src/components/Talents.jsx`

## Excepciones intencionales (no migrar ciegamente)
- Onboarding spotlight + scroll-safe zones.
- Sheet drag modal mobile (Inventory loot modal).
- Ciertas bifurcaciones de nav/toasts en App por ergonomía mobile y z-index.

## Checkpoints de QA manual sugeridos
1. Viewports: `360x780`, `390x844`, `768x1024`, `1280x800`.
2. Santuario: abrir/cerrar 6 overlays de estación.
3. Flujo run: iniciar -> combate -> extracción -> confirmar -> volver.
4. Jobs: claim en Destilería/Encargos.
5. Talentos: compra en mobile y desktop + spotlight tutorial.

## Deuda técnica residual (si se sigue en otra iteración)
- Reducir ternarios visuales restantes en `App.jsx` (toasts/RunSigil overlay).
- Ajustar algunos bloques de `Combat.jsx` e `Inventory.jsx` aún bifurcados por densidad.
- Eventual migración de `RunSigilOverlay` a `OverlayShell` + primitives.
