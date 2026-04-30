# Visual QA Forge Light v3

## UI Kit Demo

Referencia:
- `uirefactor/fullpage/redesign/UI KIT.png`

Capturas revisadas:
- `uirefactor/current/kit-demo/forge-light-kit-demo-390x844.png`
- `uirefactor/current/kit-demo/forge-light-kit-demo-430x932.png`
- `uirefactor/current/kit-demo/forge-light-kit-demo-1280x800.png`

Comparacion por zonas:

| Zona | Referencia | Implementacion | Estado | Correccion |
|---|---|---|---|---|
| Shell/header | Header oscuro, portrait, recursos framed, menu | Header demo usa `FlHeaderBar`, recursos framed y menu | Aceptado para demo | Mantener para Combat, ajustar datos reales despues |
| Poster/frame | UI Kit es lamina vertical con marco bronce y textura | Demo usa contenedor 724px, borde bronce, ruido y fondo continuo | Aceptado | Agregar ornamentos finos si se necesita mas fidelidad |
| Buttons | Botones metalicos, facetados, con textura y estados | Botones con textura metal, bevel, selected/danger/loading | Aceptado | Revisar contraste de disabled en Combat |
| Panels/cards | Panels oscuros con borde trabajado y textura | Panels/cards usan noise overlay, clip facetado y borde mas fuerte | Aceptado parcial | Faltan ornamentos de esquina mas elaborados |
| Bars/meters | Barras con frame metalico y fill saturado | Barras angulares con frame y labels | Aceptado | Crear `FlHealthBar` boss/enemy final durante Combat |
| Resources/tags | Resource pills y badges compactos con color semantico | Oro/esencia, rareza y estados ya usan primitives | Aceptado | Afinar icon assets en header global despues |
| Loot/actions | Item card + side actions fisicos | Demo usa asset real, card epic y side actions verticales | Aceptado parcial | Item card puede ganar layout especifico de inventario |
| Tabs/feedback | Tabs framed, modal/toast/tooltip | Demo muestra tabs, requirement, empty, toast, tooltip y modal | Aceptado parcial | Tooltip/toast se solapan en desktop demo; no bloquea Combat |

Primer viewport:
- 390x844 muestra header, hero panel, buttons y comienzo de panels/cards.
- No hay onboarding visible.
- No hay overflow horizontal.

Deuda visual:
- Los ornamentos de esquina todavia son CSS simples, no tan ricos como `UI KIT.png`.
- Algunos iconos SVG fallback no tienen el peso de los PNG del kit.
- `FlTooltip` y `FlToast` necesitan posicionamiento real por portal antes de usarse en pantallas complejas.
- `FlItemCard` sirve para demo, pero Inventory/Mochila probablemente necesitara `InventoryEquippedCard` y rows especificas.

Checklist:
- [x] El foco visual se entiende en 2 segundos.
- [x] La demo no monta onboarding.
- [x] La pantalla parece RPG fantasy premium, no dashboard.
- [x] CTA primario usa dorado/bronce, no verde generico.
- [x] Los colores vivos son semanticos.
- [x] Las cards tienen borde, textura, profundidad y esquinas Forge.
- [x] Las barras tienen marco, fill y lectura clara.
- [x] Header y bottom nav parecen del mismo sistema.
- [x] No hay overflow horizontal en mobile.
- [x] Loading/disabled/selected existen donde corresponde.
- [x] Los assets/fondos no fueron reemplazados por fondos planos.
- [ ] Los ornamentos estan al nivel exacto de `UI KIT.png`.
- [ ] Tooltip/toast tienen posicionamiento definitivo.

Estado:
- Aceptado para pasar a Combat Full piloto, con deuda visual documentada.
