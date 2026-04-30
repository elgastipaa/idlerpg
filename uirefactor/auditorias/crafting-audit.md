# Auditoria Forge Light - Crafting

Fecha: 2026-04-28
Referencia: `uirefactor/Crafting.png`
Capturas actuales:
- `uirefactor/current/crafting-390x844.png`
- `uirefactor/current/crafting-430x932.png`
- `uirefactor/current/crafting-1280x800.png`

## Estado

Primera migracion Forge Light aplicada y validada con capturas.

## Alcance real

La captura `crafting` no usa una pantalla standalone pura. El flujo real abre `SanctuaryForgeOverlay`, que envuelve `Crafting.jsx` dentro de Santuario. Por eso la migracion toca:

- `src/components/SanctuaryForgeOverlay.jsx`
- `src/components/Crafting.jsx`
- `src/components/ui/OverlayStationShell.jsx`
- `src/components/OverlayShell.jsx`
- `src/styles/responsive.css`

## Cambios aplicados

- `SanctuaryForgeOverlay` usa clases Forge especificas para shell, body y header.
- El overlay de Forja ahora se eleva por encima del header/nav de Santuario y oculta header/desktop nav mientras esta abierto.
- `OverlayShell` y `OverlayStationShell` aceptan `className`/`zIndex`/`respectHeader` para permitir overlays con tratamiento visual propio sin romper otros overlays.
- `Crafting.jsx` agrega root `crafting-root--forge-light`.
- Se agrego un bloque superior `fl-crafting-showcase` inspirado en `Crafting.png`:
  - titulo `FORJAR`, back button y entropia,
  - tabs `MEJORAR / AFINAR / REFORJAR / IMBUIR / EXTRAER`,
  - item card grande con rareza, icono, nivel y poder,
  - panel de resultado `MEJORA EXITOSA`,
  - material principal, probabilidad y costo,
  - track de mejora con nodos `+0 / +5 / +10 / +15`,
  - comparacion de stats,
  - CTA Forge dorado `MEJORAR ITEM`.
- Se oculto el `SubtabDock` mobile antiguo de Crafting para no duplicar tabs contra la referencia.
- Se mantiene debajo la mesa/listado existente para no perder seleccion de items ni flujos de modos avanzados.
- Segunda pasada: la semilla de captura ahora muestra item `+12 -> +13` y entropia `72 / 100`, mas comparable con `Crafting.png`.
- Segunda pasada: el placeholder de item ahora elige icono segun familia/slot; `focus` usa icono tipo mira/lente en vez de espadas genericas.
- Segunda pasada: el header de Forja se compacto y se llevo a un topbar mas premium con crest, recursos e identidad `Forjador`.
- Segunda pasada: el CTA `MEJORAR ITEM`, el item frame y el panel de resultado suman bevel/glow/ornamentos mas cercanos a la referencia.

## Comparacion contra referencia

Mas cerca:
- El primer viewport ya se lee como pantalla de Forja, no como formulario/lista dentro de Santuario.
- `MEJORAR` domina como accion ritual dorada.
- El resultado central verde existe y comunica exito/progreso.
- Tabs, entropia, slider, item card y material/costo estan presentes en el mismo orden funcional de `Crafting.png`.
- Desktop ya no duplica tabs superiores de Crafting.
- Mobile 430 muestra el bloque principal completo hasta el CTA; mobile 390 queda mas exigido pero mantiene jerarquia correcta.

Diferencias pendientes:
- Falta arte PNG real del item. Actualmente se usa `ForgeIcon` como placeholder.
- El header global de la referencia (`Forjador`, avatar, recursos grandes) no esta implementado; se usa header de overlay Forge compacto.
- La segunda mitad de la pantalla todavia conserva la mesa/listado legacy debajo del showcase. Queda funcional, pero necesita una segunda pasada visual o integracion mas limpia.
- En mobile chico, algunas secciones quedan muy densas. Es aceptable como primera pasada, pero requiere ajuste fino cuando existan assets de items.

## Criterio actual

Aceptable como MVP visual inicial de Crafting. La siguiente iteracion deberia integrar assets PNG de items cuando existan y decidir si la mesa/listado legacy se compacta o se transforma en un selector visual Forge debajo del showcase.
