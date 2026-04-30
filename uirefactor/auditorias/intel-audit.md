# Auditoria Forge Light - Intel

Fecha: 2026-04-28
Referencia: `uirefactor/Intel.png`
Capturas actuales:
- `uirefactor/current/intel-390x844.png`
- `uirefactor/current/intel-430x932.png`
- `uirefactor/current/intel-1280x800.png`

## Estado

Segunda pasada Forge Light aplicada y validada con capturas.

## Cambios aplicados

- `src/components/Codex.jsx` agrega root `codex-root--forge-light`.
- En modo Intel se oculta el panel introductorio redundante para que el primer foco sea `RADAR TACTICO`, como en la referencia.
- Se agregaron clases `codex-intro-panel`, `codex-radar-panel` y `codex-metric-card`.
- `src/styles/responsive.css` define variables Forge para Codex/Intel y transforma paneles, metric cards y chips a superficies oscuras.
- Se agrego un radar ornamental sutil dentro del panel tactico.
- `ExpeditionView` ya expone `expedition-root--codex`, y el shell Forge de Expedicion evita viewport blanco en desktop.
- El panel superior mobile de Intel usa fondo oscuro, chips Forge y CTA dorado `VOLVER A COMBATE`.
- Segunda pasada:
  - `scripts/captureForgeLightScreens.mjs` siembra codex/ruta con 6 targets, 3 bosses en ruta, 2 bosses accesibles y 2 powers activos.
  - `RADAR TACTICO` queda con tres metric cards, no cuatro, para seguir la referencia.
  - `Expedicion Activa` paso a banner propio con icono circular y book/icono lateral.
  - El radar CSS gano presencia visual y los chips quedaron facetados.

## Comparacion contra referencia

Mas cerca:
- Primer foco visual es `RADAR TACTICO` con `Tier 7 / 10`.
- Chips de build, bosses y powers ocultos se leen como badges Forge.
- Metric cards ya no son blancas y quedan en superficie oscura con borde dorado sutil.
- Subtab `Combate / Mochila / Intel` comparte lenguaje con Mochila y la referencia.
- Desktop queda oscuro y sin contenedor blanco.

Diferencias pendientes:
- La referencia tiene un gran arte de compas/radar mas ilustrado; la implementacion usa CSS ornamental como placeholder.
- Los valores del estado semilla ya son representativos; pueden ajustarse si queremos clavar exactamente los numeros de `Intel.png`.
- `Expedicion Activa` ya tiene banner, aunque todavia usa SVG/CSS y no una ilustracion tipo libro/estandarte completa.
- Falta una segunda pasada de layout mobile para que el bloque inferior de objetivos respire mas y no compita tanto con el bottom nav.

## Criterio actual

Aceptable como segunda pasada MVP de Intel. La siguiente iteracion deberia generar un asset de radar/compas o banner/libro si se busca mayor fidelidad contra la referencia.
