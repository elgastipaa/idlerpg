# Forge Light - Alineacion de Componentes con UI Kit

Estado: para decision visual.  
Fuente visual: `uirefactor/kit-demo-3/forge-light-kit-premium.html`.

Objetivo: que cada componente `Fl*` tenga una referencia concreta del UI Kit.  
Uso esperado: revisar la columna "Mi propuesta" y completar "Decision del usuario" con `OK` o con el ejemplo correcto del UI Kit.

Notas:

- Algunos componentes ya existian antes de esta pasada, pero no todos estaban alineados al kit premium.
- `FlHeaderBar` y `FlBottomNav` existian, pero necesitaban acercarse a los ejemplos de Navegacion del UI Kit.
- La idea no es copiar HTML del kit pantalla por pantalla, sino traducir cada ejemplo a tokens, primitives y wrappers reutilizables.

---

## Componentes Base

| Componente | Ejemplo actual en app | Mi propuesta: parecido a UI Kit | Decision del usuario |
| --- | --- | --- | --- |
| `FlButton` | Boton "Abrir" de Laboratorio, acciones de Forja, claim de jobs | `Button Library > Boton default / primary / secondary / danger / loading` segun variante | OK para lo general, para CTA de Forja está "CTA Principal" |
| `FlIconButton` | Cerrar overlay, volver, menu, acciones compactas | `Button Library > Icon Button` | OK |
| `FlSideAction` | Acciones laterales de Combat / accesos compactos | `Button Library > Icon Button` + tratamiento de accion vertical HUD | OK |
| `FlTabs` | Modos de Forja, tabs segmentadas, filtros | `Navegacion > Tabs / Segmented Tabs` | Para modos de forja: La tercer fila de botones. Para tabs segmentadas: La segunda fila. |
| `FlBottomNav` | Navegacion inferior mobile | `Navegacion > Bottom Navigation Bar - Inactive / Active / Pressed` | OK |
| `FlHeaderBar` | Header superior con heroe, oro, esencia | `Navegacion > Top Status Bar` | OK |
| `FlModal` | Detail modal de item, confirmaciones, overlays internos | `Contenedores / Cards > Modal / Bottom Sheet` | OK |
| `FlToast` | Toast de accion bloqueada, feedback de claim/error | `Feedback Visual > Success / Error / Resource / Level Up`, en version compacta | OK |
| `FlTooltip` | Ayudas cortas y hints de controles | `Micro Elementos > Tooltip / hint` | OK |

---

## Superficies

| Componente | Ejemplo actual en app | Mi propuesta: parecido a UI Kit | Decision del usuario |
| --- | --- | --- | --- |
| `FlCard` | Metric cards, result cards, item cards compactas | `Contenedores / Cards > Default / Hover / Selected / Compact Card` | OK |
| `FlPanel` | Paneles grandes de Santuario, Ecos, Intel, weekly | `Contenedores / Cards > Panel premium / Surface section` | Si, puede ser Panel Sección |
| `FlSectionHeader` | Titulos de seccion con subtitulo/accion | `Contenedores / Cards > Header de panel`, sin crear una card propia | Podemos pensarlo |
| `FlEmptyState` | Lista vacia, sin item seleccionado, sin jobs | `Contenedores / Cards > Empty / soft card`, con icono sutil | No la veo esta |

---

## Estado, Badges y Tags

| Componente | Ejemplo actual en app | Mi propuesta: parecido a UI Kit | Decision del usuario |
| --- | --- | --- | --- |
| `FlBadge` | Counters de tabs, locked, ready, rarity badge | `Badges / Tags > Badge / Counter / Status / Rarity Badge` | OK |
| `FlTag` | Filtros, afijos, chips de build, sigilos | `Badges / Tags > Tag / selected tag / muted tag` | OK. |
| `FlRequirementHint` | Requisitos bloqueados en Forja/Talentos | `Badges / Tags > Warning/Locked tag` + mini panel de requirement | En realidad sería que la card del talento muestre un locked tag nomas, no? |

---

## Recursos y Economia

| Componente | Ejemplo actual en app | Mi propuesta: parecido a UI Kit | Decision del usuario |
| --- | --- | --- | --- |
| `FlResourceCounter` | Oro/esencia en header o pequenos counters | `Stat Rows / Resource Pills > Resource pill compacta` | OK. Pero si podemos sacarle los esquineros digamos que son como así "<", y compactarla un poco más de alto, mejor. |
| `FlResourcePill` | Costos y rewards en paneles | `Stat Rows / Resource Pills > Resource Pill` | OK |
| `FlCostDisplay` | Costos de craft/upgrade/reforge | `Stat Rows / Resource Pills > Cost row / resource row` | Depende, en la forja mostrábamos el cossto en el botón no? Sino si, Pill compacta podría ser. |
| `FlRewardDisplay` | Rewards de job, weekly, boss, expedition | `Stat Rows / Resource Pills > Reward pill row` | OK |

---

## Progreso y Barras

| Componente | Ejemplo actual en app | Mi propuesta: parecido a UI Kit | Decision del usuario |
| --- | --- | --- | --- |
| `FlProgressBar` | XP, entropy, job progress, account progress | `Barras / Meters > Progress / XP / Success / Error / Entropy` | OK |
| `FlHealthBar` | HP jugador/enemigo/boss | `Barras / Meters > HP Bar / Boss HP`, con variante boss si aplica | OK, acordate que tenga la barra de vida sombreada cuando recibe el daño, que cae con delay, no sé si eso es CSS o una función. |
| `FlStatRow` | Fila label/value en stats, item details, account | `Stat Rows / Resource Pills > Stat Row` | OK |
| `FlStatStrip` | Resumen de metricas compactas | `Stat Rows / Resource Pills > Stat strip / metric strip` | OK |

---

## Assets, Items y Rareza

| Componente | Ejemplo actual en app | Mi propuesta: parecido a UI Kit | Decision del usuario |
| --- | --- | --- | --- |
| `FlAsset` | Render de iconos, items, retratos, system assets | `Sistema de Rarezas > Item icon / asset inside frame`, sin imponer marco por defecto | OK |
| `FlIconFrame` | Retratos, rareza, talent node icon, item icon destacado | `Sistema de Rarezas > Icon frame / rarity frame` | OK |
| `FlItemCard` | Equipped item, item destacado, selected crafting item | `Sistema de Rarezas > Item card / selected item card` | OK |
| `FlItemRow` desde `FlDomain` | Loot rows, drawer de Forja, relic rows | `Sistema de Rarezas > Item Row con frame de rareza y acciones` | OK |
| `FlItemDetailBlock` desde `FlDomain` | Detail modal de item | `Sistema de Rarezas > Item detail / stat rows / affix tags` | OK |

---

## Domain Wrappers Necesarios

Estos no todos existen como componente dedicado todavia. Mi propuesta es crearlos para no deformar primitives base.

| Wrapper propuesto | Ejemplo actual en app | Mi propuesta: parecido a UI Kit | Decision del usuario |
| --- | --- | --- | --- |
| `InventoryItemRow` | Rows de Mochila | `Sistema de Rarezas > Item Row`, con compare/actions/pending sell | OK |
| `InventoryItemDetail` | Modal detalle item | `Sistema de Rarezas > Item detail`, mas compare y acciones | OK |
| `ItemSelectorRow` | Drawer de items en Forja | `Sistema de Rarezas > Item Row compacta` |  OK|
| `SanctuaryJobRow` | Jobs/runs en Santuario | `Contenedores / Cards > Compact Card` + `Barras / Meters > Progress` |OK  |
| `SanctuaryStationRow` | Estaciones del Santuario | `Modulos de Pantalla > Station module / compact panel row` |  OK|
| `PrestigeNodeCard` | Nodos de Ecos | `Contenedores / Cards > Selected/Hover Card` con tono arcane | OK |
| `ContractCard` | Contracts/weekly ledger | `Contenedores / Cards > Premium Card` tono reward/gold | OK |
| `WeeklyBossCard` | Boss semanal | `Contenedores / Cards > Premium danger card`, sin fondo rojo completo | OK |
| `CombatTierTrack` | Track de tier en combate | `Barras / Meters > Milestone Track`, version combat | OK |
| `CombatHealthBar` | HP enemigo/jugador en combate | `Barras / Meters > HP Bar / Boss HP` |OK  |
| `FlPagination` | Codex pagination | `Button Library > Icon Button` + label central compacto | OK |

---

## Decisiones Visuales que Propongo como Default

| Caso | Mi propuesta | Decision del usuario |
| --- | --- | --- |
| Boton principal de avance | `FlButton variant="primary"` parecido a `Button Library > Primary` | OK |
| Boton abrir estacion | `FlButton variant="secondary"` si es accion normal; `primary` solo si es CTA principal de pantalla | Primary, en Módulos de pantalla tenés n ejemplo de estaciones |
| Boton claim/listo | `FlButton variant="success"` parecido a success button del kit | En Módulos tenés un ejemplo de un claim de encargo. Sino Reclamar común tenés ejemplo en FEEDBACK, el reclamar del progreso offline |
| Boton reset/destruir | `FlButton variant="destructive"` parecido a danger fuerte | OK |
| Card de reward/weekly ledger | `FlPanel` o `FlCard premium` tono `reward/gold` | OK |
| Weekly boss | `FlPanel danger/premium`, borde/glow rojo oscuro, no fondo rojo completo | OK |
| Talent nodes | Mantener icon frame circular, parecido a `Icon frame`, no bottom nav | OK |
| Header resources | `Top Status Bar > Resource pills`, icono plano sin circulo | OK |
| Bottom nav | `Bottom Navigation Bar`, icono plano + label siempre visible | OK, que se parezca mucho por favor, el color también, hoy está gris. |
| Rareza de items | borde/glow/frame/badge, nunca fondo completo de rareza | OK |
| Listas densas | Card compacta con textura/borde leve, sin glow constante | OK |

---

## Preguntas Para Resolver Antes de Seguir

1. `FlButton`: cual es el boton canonico para una accion comun como "Abrir Laboratorio": default, secondary o primary? Default es lo mismo que primary. Y es este. el "CTA PRINCIPAL" Es otra cosa, es más especial todavía. FlButton es el default.
2. `FlCard` vs `FlPanel`: queres que las cards chicas sean siempre compactas y los paneles grandes sean premium? dale
3. `FlResourceCounter` y `FlResourcePill`: los unificamos visualmente con el Top Status Bar o mantenemos una version mas densa para listas? Compactemos todods los resources counters si, y unifiquemos.
4. `FlIconFrame`: lo dejamos solo para retratos/items/talent nodes, y prohibido para bottom nav/header resources? Si, por favor.
5. `FlTabs`: modos de Forja deben parecerse a tabs normales o segmented tabs? Se tienen que parecer específicamente a la fila 3 de Secondary / Segmented.
6. `Weekly Ledger`: gold premium fuerte o panel normal con badge reward? panel normal con badge reward y capaz un glow dorado como tiene hoy.
7. `Weekly Boss`: danger premium fuerte o danger reducido? Lo mismo, panel normal con badge danger y capaz un glow medio rojo.
8. `InventoryItemRow`: preferis fila densa tipo lista o card individual mas grande? Fila densa tipo lista. Después vamos mejorándolo este.
9. `SanctuaryStationRow`: mas parecido a station module ilustrado o a compact card operativa? El Station Cards que hay en Módulos me gusta.
10. `CombatHealthBar`: barra simple del kit o barra boss con segmentos/phase markers? Que la estética sea la del kit, después vemos si ponerle markers nuevamente. Lo que sí necesito es que por ejemplo el boss weekly siga pudiendo ver varias barras de vida, no sé si tiene que ver ocn esto.

