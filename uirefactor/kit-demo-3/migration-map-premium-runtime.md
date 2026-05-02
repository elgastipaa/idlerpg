# Forge Light Premium — Runtime Migration Map

Fecha: 2026-04-30  
Fuente visual obligatoria:
- `forge-light-kit-premium.html`
- `forge-light-kit-premium-modules.html`

## Reglas cerradas de esta migración

1. Mantener layout funcional actual por pantalla; migrar piezas internas.
2. No usar módulos 15 (Inventory), 16 (Combat HUD), 18 (Crafting) de forma literal.
3. En Crafting, sí aplicar estética de:
   - card de estadísticas actuales/nuevas,
   - CTA `MEJORAR` con costo integrado.
4. No agregar assets externos.
5. No introducir sistemas visuales paralelos por pantalla.
6. Prioridad: tokens + primitives + wrappers; inline sólo en casos mínimos.

## Capa central (single source of styling)

- Tokens activos: `src/styles/forge-light-v2/tokens.css`.
- Primitives y estados: `buttons.css`, `badges.css`, `progress.css`, `surfaces.css`, `primitives.css`.
- Navegación global: `navigation.css`.
- Módulos/reutilizables de dominio: `modules.css`.
- Layout utilitario compartido: `layout.css`.
- Entry CSS único: `src/main.jsx` importa sólo `forge-light-v2/index.css` (sin `forge-light.css`).

## Mapeo operativo (actual -> kit)

| Componente actual | Intención semántica | Componente kit/patrón | Archivo principal | Acción |
|---|---|---|---|---|
| Header app + badges recursos | Barra de estado superior | Top Status Bar + resource pill | `App.jsx`, `FlHeaderBar`, `navigation.css` | Migrado a wrapper |
| Bottom tabs mobile | Navegación primaria | Bottom Navigation Bar | `App.jsx`, `FlBottomNav`, `navigation.css` | Migrado a wrapper |
| Tabs desktop primarios | Cambio de sección principal | Tabs primarios kit | `App.jsx`, `FlTabs` | Migrar usando `FlTabs` |
| Botones locales (`fl2-button`, variantes) | Acción clickeable | `btn` primary/secondary/ghost/success/danger/cta | `buttons.css`, pantallas | Centralizar en primitives |
| Chips/status locales | Estado | `tag`/`badge` | `badges.css`, pantallas | Reemplazo progresivo |
| Barras locales de progreso | Progreso | `bar-track` + `bar-fill` (`FlProgressBar`) | `progress.css`, pantallas | Reemplazo progresivo |
| Sanctuary job row | Job con claim/progress | Módulo Job Card | `Sanctuary.jsx`, `FlDomain.jsx`, `modules.css` | Migrado con wrapper |
| Sanctuary station row | Estado de estación | Módulo Station Card | `Sanctuary.jsx`, `FlDomain.jsx`, `modules.css` | Migrado con wrapper |
| Inventory row custom | Item/equip/sell | `item-row` semántico (sin módulo 15 literal) | `Inventory.jsx`, `FlDomain.jsx`, `screens/inventory.css` | Mantener layout + skin premium |
| Inventory detail modal | Detalle seleccionable | modal + item detail block | `Inventory.jsx`, `FlModal`, `FlDomain.jsx` | Migración por wrapper |
| Crafting tabs de modo | Cambio de modo | Tabs tipo forge | `Crafting.jsx`, `FlTabs` | Migración por wrapper |
| Crafting CTA principal | Acción crítica | CTA premium (`btn` variante reforzada) | `Crafting.jsx`, `buttons.css`, `screens/crafting.css` | Ajustar a kit |
| Crafting compare stats | Comparación actual/nuevo | Card compact/panel premium | `Crafting.jsx`, `screens/crafting.css` | Ajustar a kit (sin módulo 18 literal) |
| Combat side actions/log/cards | Acciones + feedback + paneles | primitives kit (sin módulo 16 literal) | `Combat.jsx`, `screens/combat.css`, `modules.css` | Mantener layout, migrar piezas |
| Weekly boss block | Tarjeta semanal de boss | Módulo Weekly Boss (17) | `Combat.jsx`, `FlDomain.jsx`, `modules.css` | Aplicar si coincide semántica |
| Codex paginación | Navegación de páginas | Módulo Pagination/Stepper | `Codex.jsx`, `FlPagination`, `modules.css` | Migrado a componente único |
| Empty states dispersos | Estado vacío/bloqueado | Empty State module | `FlEmptyState`, `modules.css`, pantallas | Estandarizar |

## Wrappers de dominio (obligatorios para no duplicar inline)

- `SanctuaryJobRow` / `SanctuaryStationRow` (sobre `FlJobCard`/`FlStationCard`).
- `InventoryItemRow` / `InventoryItemDetail`.
- `FlWeeklyBossCard`.
- `FlPagination`.
- `CombatTierTrack` y `CombatHealthBar` para barras complejas.

## Checklist de cierre técnico

1. Build: `npm run build`.
2. Capturas en 390x844, 430x932, 1280x800: `npm run ui:capture`.
3. Validaciones:
   - botones con variante correcta,
   - resource pills sin icon-frame circular,
   - rareza por frame/badge/borde/glow,
   - panel/card con doble borde + profundidad premium,
   - tabs/nav con estados active/disabled/selected correctos,
   - sin assets externos nuevos,
   - mobile usable sin solapamientos evidentes.
