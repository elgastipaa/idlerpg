# Auditoria Forge Light

Estado: auditoria informativa. No propone cambios de codigo inmediatos.

Fuentes revisadas:

- `src/components/ui/forge/`
- `src/components/ui/ProgressPrimitives.jsx`
- `src/components/Combat.jsx`
- `src/components/Inventory.jsx`
- `src/components/Crafting.jsx`
- `src/components/Sanctuary.jsx`
- `src/components/Talents.jsx`
- `src/components/Prestige.jsx`
- `src/components/Codex.jsx`
- `src/components/Character.jsx`
- `src/components/Stats.jsx`
- `src/components/AccountProgressView.jsx`
- `src/App.jsx`
- `src/styles/forge-light-v2/`
- `src/styles/forge-light.css`
- `uirefactor/kit-demo-3/forge-light-kit.html`

Objetivo: identificar componentes actuales, redundancias, deuda visual y prioridad de migracion hacia el sistema Forge Light sin tocar layouts.

---

## 1. Resumen ejecutivo

El proyecto ya tiene una base de sistema bastante avanzada en `src/components/ui/forge/`. El problema principal no es falta de primitives, sino convivencia de tres capas:

1. Primitives Forge nuevas: `FlButton`, `FlCard`, `FlPanel`, `FlBadge`, `FlTabs`, `FlProgressBar`, etc.
2. Componentes intermedios viejos: `ProgressPrimitives` (`CardHeader`, `InlineAction`, `Panel`, `ProgressBar`, `StatusChip`).
3. Estilos locales por pantalla e inline styles con tokens antiguos `--color-*` y `--tone-*`.

La migracion correcta deberia ser por prioridad y por tipo de componente, no por pantalla completa de una sola vez.

Lectura rapida:

- `Crafting` es la pantalla mas cercana al sistema nuevo: ya importa y usa muchos `Fl*`, aunque conserva un bloque legacy y estilos inline.
- `Talents` esta a medio camino: usa `FlTalentNode`, `FlIconFrame`, `FlButton`, pero todavia redefine detalle, boton de compra y layout del arbol localmente.
- `Sanctuary` tiene buena estructura visual, pero mantiene botones/chips/rows propios (`fl-sanctuary-*`) que deberian absorberse en primitives.
- `Inventory`, `Combat`, `Codex`, `Stats` y `Prestige` concentran mucha presentacion inline.
- `Combat` es el caso de mas riesgo por tamano y por ser una pantalla muy especializada. Conviene auditar y extraer patrones, no migrarla primero.
- `App.jsx` contiene header, tabs, recursos y overlays que funcionan como sistema global, pero aun mezcla `Fl*` con estilos inline y tokens anteriores.

---

## 2. Metricas de riesgo

Conteos aproximados por busqueda textual. Sirven para priorizar, no como inventario exacto.

| Archivo | Lineas | Coincidencias de estilo inline/local | Usos directos de `Fl*` | Riesgo |
| --- | ---: | ---: | ---: | --- |
| `src/components/Combat.jsx` | 3557 | 225 | 0 | Muy alto |
| `src/components/Crafting.jsx` | 2479 | 241 | 26 | Alto, pero migrable |
| `src/components/Codex.jsx` | 1877 | 318 | 0 | Muy alto |
| `src/components/Inventory.jsx` | 1402 | 210 | 2 | Muy alto |
| `src/components/Stats.jsx` | 1657 | 214 | 0 | Muy alto |
| `src/components/Prestige.jsx` | 1097 | 151 | 0 | Alto |
| `src/components/Sanctuary.jsx` | 1826 | 22 | 5 | Medio |
| `src/components/Talents.jsx` | 1674 | 78 | 5 | Medio |
| `src/components/Character.jsx` | 507 | 10 | 1 | Bajo/medio |
| `src/components/AccountProgressView.jsx` | 273 | 2 | 0 | Bajo |
| `src/App.jsx` | 2700+ | 115 | 9 | Alto por impacto global |

Interpretacion:

- Muchas coincidencias de estilo inline no significan que la pantalla este mal visualmente. Significa que el comportamiento visual no esta encapsulado.
- Un alto uso de `Fl*` no garantiza limpieza si se combinan con clases locales que redefinen el componente.
- `Codex`, `Combat`, `Inventory` y `Stats` deberian auditarse con mas detalle antes de tocarlos.

---

## 3. Inventario de primitives disponibles

### Primitives canonicas actuales

- `FlButton`
- `FlIconButton`
- `FlCard`
- `FlPanel`
- `FlBadge`
- `FlTag`
- `FlTabs`
- `FlProgressBar`
- `FlHealthBar`
- `FlIconFrame`
- `FlAsset`
- `FlItemCard`
- `FlModal`
- `FlHeaderBar`
- `FlBottomNav`
- `FlSideAction`
- `FlStatRow`
- `FlStatStrip`
- `FlResourceCounter`
- `FlResourcePill`
- `FlCostDisplay`
- `FlRewardDisplay`
- `FlSectionHeader`
- `FlTooltip`
- `FlToast`
- `FlEmptyState`
- `FlRequirementHint`

### Componentes de dominio en `FlDomain`

- `FlRarityBadge`
- `FlAffixList`
- `FlItemFrame`
- `FlItemRow`
- `FlItemTile`
- `FlItemDetailBlock`
- `FlTalentRequirementBadge`
- `FlTalentPointCounter`
- `FlTalentNode`
- `FlTalentDetailPanel`
- `FlStationCard`
- `FlJobProgress`
- `FlJobCard`
- `FlClaimPanel`
- `FlUpgradeTrack`
- `FlMaterialRequirementList`
- `FlCraftingCostPanel`
- `FlCraftingResultPreview`
- `FlCraftingModeTabs`
- `FlTierProgressTrack`
- `FlBossCard`
- `FlCombatantPanel`
- `FlStatusEffectIcon`
- `FlRewardTrack`

### Capa intermedia a retirar gradualmente

`src/components/ui/ProgressPrimitives.jsx` aparece en:

- `Combat.jsx`: `CardHeader`, `InlineAction`, `ProgressBar`, `StatusChip`.
- `AccountProgressView.jsx`: `CardHeader`, `InlineAction`, `Panel`, `ProgressBar`, `StatusChip`.

Estos componentes no son malos, pero duplican intenciones ya cubiertas por Forge:

- `ProgressBar` -> `FlProgressBar`.
- `StatusChip` -> `FlBadge` o `FlTag`.
- `InlineAction` -> `FlButton` o `FlIconButton`.
- `Panel` -> `FlPanel` o `FlCard`.
- `CardHeader` -> `FlSectionHeader`.

---

## 4. Auditoria por pantalla

### Combat

Archivo: `src/components/Combat.jsx`

Componentes locales detectados:

- `CombatForgeTierTrack`
- `CombatForgeHpBar`
- `CombatForgeResourceBar`
- `CombatForgeSideActions`
- `CombatFloatingText`
- `CombatStatusIconTray`
- `StatCard`
- `InlineStatusTray`
- `StatusPill`
- paneles de sesion, weekly boss, contrato, registro y talentos embebidos.

Problemas:

- Pantalla de mayor tamano y con mas responsabilidades visuales.
- No usa primitives `Fl*`; usa `ProgressPrimitives` y muchos estilos inline.
- Mezcla tokens viejos `--color-*`, `--tone-*` con estilos Forge via overrides CSS.
- Reimplementa barras HP/XP, stat cards, pills, botones compactos y feedback flotante.
- Es una pantalla con patron especial (`Stage`), por lo que migrarla como cards genericas seria un error.

Destino recomendado:

- `CombatForgeHpBar` -> `FlHealthBar` o wrapper `CombatHealthBar` basado en `FlProgressBar`.
- `CombatForgeResourceBar` -> `FlProgressBar type="xp"`.
- `CombatForgeSideActions` -> `FlSideAction`.
- `StatCard` -> `FlStatStrip variant="combat"` o `FlCard variant="compact"`.
- `StatusPill` / `InlineStatusTray` -> `FlBadge`, `FlTag`, `FlTooltip`.
- Registro -> `FlPanel variant="compact"` con collapsible local.
- Weekly/contract -> domain composites sobre `FlPanel`.

Prioridad: Alta para auditoria visual, media para implementacion. No migrar primero.

Razon: es demasiado central y especializado. Conviene extraer primero primitives en pantallas mas controladas y luego volver a Combat con contratos ya probados.

### Inventory / Mochila

Archivo: `src/components/Inventory.jsx`

Componentes locales detectados:

- `EquippedCard`
- `InventoryRow`
- `ItemDetailModal`
- `LootFilterModal`
- `QuickLootRuleRow`
- filtro de loot, rarity pills, preset buttons, equipped list, item list.

Problemas:

- Alto volumen de inline styles.
- Solo usa `FlAsset`; no usa `FlCard`, `FlButton`, `FlBadge`, `FlTag`, `FlModal` para el cuerpo principal.
- Tiene rows/items que ya coinciden con componentes de dominio existentes: `FlItemRow`, `FlItemCard`, `FlItemDetailBlock`, `FlRarityBadge`, `FlAffixList`.
- Filtros y presets son chips/botones locales.
- Modal de detalle deberia ser un `FlModal` o `OverlaySurface` con item detail.

Destino recomendado:

- `EquippedCard` -> `FlItemCard variant="equipped"`.
- `InventoryRow` -> `FlItemRow` con action slot.
- `ItemDetailModal` -> `FlModal variant="form"` o `FlItemDetailBlock` dentro de overlay.
- `QuickLootRuleRow` -> `FlCard compact` + `FlTabs segmented` o `FlButton`.
- Rarity visibility -> `FlTabs variant="segmented"` o `FlTag selected`.
- Highlight badges -> `FlBadge` con `tone`/`rarity`.

Prioridad: Alta.

Razon: mucho valor de sistema, riesgo moderado, componentes destino claros.

### Crafting / Forja

Archivo: `src/components/Crafting.jsx`

Componentes y primitives usados:

- `FlAsset`
- `FlBadge`
- `FlButton`
- `FlCard`
- `FlProgressBar`
- `FlResourceCounter`
- `FlStatRow`
- `FlTabs`
- `FlRequirementHint`

Problemas:

- Es la pantalla mas avanzada en adopcion de Forge.
- Todavia conserva un bloque legacy: `fl-crafting-legacy-selectors`, `fl-crafting-legacy-workbench`, `fl-crafting-legacy-log`.
- Sigue teniendo estilos helpers en JS (`toneChipStyle`, panel styles, layouts).
- Algunas piezas custom ya deberian estar en domain composites: upgrade track, material panel, result preview, item drawer.
- El item drawer es un patron reutilizable de selector denso.

Destino recomendado:

- Mantener como pantalla piloto de consolidacion.
- Extraer `ForgeItemDrawer` como patron local primero, luego generalizar si aparece en otras pantallas.
- `fl-crafting-upgrade-track` -> `FlUpgradeTrack`.
- Material/cost/probability -> `FlCostDisplay`, `FlResourceCounter`, `FlStatRow`.
- Result card -> `FlCraftingResultPreview`.
- Legacy workbench/selectors -> marcar como pendiente de retiro.

Prioridad: Muy alta para primera migracion real.

Razon: ya usa el sistema. Es el mejor lugar para validar reglas sin grandes saltos.

### Sanctuary / Santuario

Archivo: `src/components/Sanctuary.jsx`

Componentes locales detectados:

- `fl-sanctuary-panel`
- `fl-sanctuary-row`
- `fl-sanctuary-chip`
- `fl-sanctuary-button`
- `fl-sanctuary-progress-wrap`
- station rows, job rows, relic rows, class selector.

Primitives usados:

- `FlButton`
- `FlIconFrame`

Problemas:

- Visualmente esta bastante ordenado, pero creo una familia local completa `fl-sanctuary-*`.
- `fl-sanctuary-button` duplica `FlButton`.
- `fl-sanctuary-chip` duplica `FlBadge`/`FlTag`.
- Rows de estaciones/jobs/relics coinciden con `FlStationCard`, `FlJobCard` y `FlCard`.
- Tiene helpers de estilo inline antiguos en la parte de estado vacio y overlays.

Destino recomendado:

- Jobs -> `FlJobCard`.
- Stations -> `FlStationCard`.
- Chips -> `FlBadge`.
- Buttons -> `FlButton`.
- Progress -> `FlProgressBar`.
- Relic rows -> `FlItemRow` o `FlCard compact` con rarity.

Prioridad: Media/alta.

Razon: buena candidata despues de Crafting porque tiene estructura repetida y menor inline debt.

### Talents

Archivo: `src/components/Talents.jsx`

Componentes locales detectados:

- `ForgeTalentNodeButton`
- `ForgeTalentTreeGrid`
- `ForgeTalentDetailPanel`
- `TalentNodeCard`
- `MobileTalentNodeRow`
- `forge-talent-buy-button`
- `forge-talent-detail-pill`

Primitives usados:

- `FlButton`
- `FlIconFrame`
- `FlTalentNode`
- `FlTalentPointCounter`

Problemas:

- Buena adopcion parcial de domain primitives.
- `ForgeTalentDetailPanel` duplica `FlTalentDetailPanel`, aunque puede tener necesidades de layout propias.
- `forge-talent-buy-button` redefine visualmente `FlButton`.
- Pills de detalle duplican `FlBadge`.
- El arbol tiene layout especial y no deberia perder su estructura actual.

Destino recomendado:

- Mantener `ForgeTalentTreeGrid` como patron de dominio.
- `ForgeTalentNodeButton` debe seguir usando `FlTalentNode`, pero reducir clases visuales locales a estado/layout.
- `ForgeTalentDetailPanel` -> `FlTalentDetailPanel` o wrapper que lo use.
- Detail pills -> `FlBadge variant="lock/status"`.
- Buy button -> `FlButton variant="primary"` con clase solo para layout.

Prioridad: Media.

Razon: ya esta parcialmente alineado; no es el mayor cuello de botella.

### Prestige / Ecos

Archivo: `src/components/Prestige.jsx`

Componentes locales detectados:

- `OutcomeSummaryCard`
- `QuickPrestigeOutcomeColumn`
- `prestige-summary-panel`
- `prestige-metric-card`
- branch cards, node cards, milestone cards, summary badges.

Problemas:

- Alto uso de inline styles y hex hardcodeados.
- No usa `Fl*` directamente.
- Tiene muchas variantes visuales locales para chips, cards y botones.
- Es semanticamente importante para `arcane/premium/danger`, ideal para consolidar tonos.
- Usa branch colors dinamicos; eso requiere una regla de tokenizacion por CSS variables, no hex embebidos.

Destino recomendado:

- Summary panels -> `FlPanel variant="arcane"` o `premium` segun contexto.
- Metrics -> `FlStatStrip` o `FlCard compact`.
- Keeps/resets -> `FlPanel variant="success"` y `FlPanel variant="danger"`.
- Branch cards -> `FlCard interactive`.
- Node cards -> domain composite tipo `FlTalentNode` o `FlCard compact`.
- Badges/chips -> `FlBadge`, `FlTag`.
- Buy/reset actions -> `FlButton`.

Prioridad: Alta, despues de Inventory/Sanctuary.

Razon: mucha deuda inline y gran valor de coherencia semantica.

### Codex / Intel / Biblioteca

Archivo: `src/components/Codex.jsx`

Componentes locales detectados:

- `codex-intro-panel`
- `codex-radar-panel`
- `codex-metric-card`
- `codex-expedition-banner`
- registry cards/rows
- `PaginationControls`
- `HorizontalOptionSelector`

Problemas:

- Mayor conteo de estilos inline entre pantallas auditadas.
- No usa `Fl*` directamente.
- Tiene dos modos semanticos mezclados: hunt/intel y library/biblioteca.
- Paneles y metric cards ya estan cubiertos por `FlPanel`, `FlCard`, `FlStatStrip`.
- Chips y badges del radar deberian ser `FlTag`/`FlBadge`.
- Pagination controls deberian usar `FlIconButton`/`FlButton`.

Destino recomendado:

- Intro/radar -> `FlPanel variant="hero"` o `arcane`.
- Metrics -> `FlStatStrip` o `FlCard compact`.
- Expedition banner -> `FlPanel`/domain card.
- Registry rows -> `FlItemRow` o `FlCard compact`.
- Pagination -> `FlIconButton`.
- Tabs/options -> `FlTabs`.

Prioridad: Alta para auditoria especifica, media para migracion.

Razon: mucha deuda y dos dominios mezclados. Conviene separar decision semantica antes de implementar.

### Character / Heroe

Archivo: `src/components/Character.jsx`

Componentes locales detectados:

- `ProgressCard`
- `ForgeCharacterBar`
- `DataRow`
- hero card, build cards, modifier chips.

Primitives usados:

- `FlAsset`

Problemas:

- Deuda inline baja comparada con otras pantallas.
- Usa clases locales con estructura estable y CSS de pantalla.
- Progress bars y chips podrian consolidarse, pero no parece urgente.

Destino recomendado:

- `ForgeCharacterBar` -> `FlProgressBar` o wrapper domain.
- `DataRow` -> `FlStatRow`.
- Build cards -> `FlCard`.
- Modifier chips -> `FlTag`.

Prioridad: Baja/media.

Razon: bajo riesgo, menor retorno inmediato.

### Stats

Archivo: `src/components/Stats.jsx`

Componentes locales detectados:

- `DataRow`
- `MetricPill`
- muchas secciones con grids inline.
- `HorizontalOptionSelector` para cambios de vista.

Problemas:

- Alto conteo de inline styles.
- No usa `Fl*`.
- Es pantalla densa y funcional; probablemente heredo patron SaaS/light.
- Muchas cards/rows/metric pills podrian mapearse a primitives sin cambiar layout.

Destino recomendado:

- `DataRow` -> `FlStatRow`.
- `MetricPill` -> `FlBadge`/`FlResourcePill` segun contenido.
- Secciones -> `FlPanel`.
- Metrics/grids -> `FlStatStrip`, `FlCard compact`, layout patterns.
- Option selectors -> `FlTabs` o mantener `HorizontalOptionSelector` solo como layout interaction, con styling Forge.

Prioridad: Alta.

Razon: mucho inline y mucha repeticion, pero probablemente menos riesgo que Combat.

### Account Progress

Archivo: `src/components/AccountProgressView.jsx`

Componentes locales detectados:

- `AccountMetric`
- `WeeklyContractCard`
- chips de progreso semanal.

Problemas:

- Usa `ProgressPrimitives`, no Forge primitives.
- Baja deuda inline.
- Tiene scope acotado y puede migrarse rapido.

Destino recomendado:

- `AccountMetric` -> `FlCard compact` o `FlStatRow`.
- `WeeklyContractCard` -> `FlPanel`/`FlCard premium`.
- `StatusChip` -> `FlBadge`.
- `ProgressBar` -> `FlProgressBar`.

Prioridad: Media/baja.

Razon: bajo riesgo, pero no desbloquea mucho sistema.

### App shell global

Archivo: `src/App.jsx`

Componentes detectados:

- header global
- primary tabs desktop/mobile
- resource header
- offline summary
- pre-run overlay
- tester/debug overlays
- dynamic tab shell.

Primitives usados:

- `FlAsset`
- `FlButton`
- `FlCard`
- `FlProgressBar`

Problemas:

- Alto impacto porque envuelve toda la app.
- Mezcla tokens base `--color-*`, `--tone-*` con `--fl-*`.
- Header/resource counters tienen styling propio y solo usan `FlAsset`.
- Pre-run overlay contiene muchas cards/botones/chips inline.
- Offline summary ya usa `FlCard` y `FlProgressBar`, buen precedente.

Destino recomendado:

- Header -> `FlHeaderBar` o mantener shell propio pero migrar recursos a `FlResourceCounter`.
- Primary tabs -> `FlTabs` o adapter que use sus classes.
- Badges tab -> `FlBadge variant="count/notification"`.
- Pre-run overlay -> `FlModal`/`OverlaySurface` + `FlCard`, `FlButton`, `FlTag`, `FlProgressBar`.

Prioridad: Alta, pero despues de consolidar primitives en pantallas.

Razon: tocarlo temprano puede generar regresiones globales.

---

## 5. Redundancias por categoria

### Buttons

Duplicados actuales:

- `FlButton`
- `.fl2-button`
- `.fl-sanctuary-button`
- `.fl-crafting-primary-action`
- `.fl-crafting-secondary-action`
- `InlineAction`
- botones inline en `Combat`, `Prestige`, `Stats`, `Codex`, `App`.

Destino:

- Todo boton textual debe ir a `FlButton`.
- Acciones compactas o iconicas deben ir a `FlIconButton`.
- Acciones laterales persistentes de combate deben ir a `FlSideAction`.

Riesgo:

- Medio. El principal riesgo es no romper dimensiones de filas densas.

### Cards / Panels

Duplicados actuales:

- `FlCard`
- `FlPanel`
- `ProgressPrimitives.Panel`
- `fl-sanctuary-panel`
- `fl-inventory-section`
- `fl-crafting-*panel`
- `prestige-summary-panel`
- `codex-*panel`
- `combat-session-panel`
- `account-progress-card/panel`

Destino:

- `FlPanel`: secciones grandes, hero, overlays.
- `FlCard`: unidades repetidas, metrics, rows interactivos.
- Domain composites donde el contenido se repite: `FlJobCard`, `FlStationCard`, `FlItemRow`, `FlItemCard`.

Riesgo:

- Alto si se cambia estructura. Bajo si primero solo se reemplaza visual layer.

### Badges / Tags / Chips

Duplicados actuales:

- `FlBadge`
- `FlTag`
- `StatusChip`
- `fl-sanctuary-chip`
- `forge-character-chip`
- `forge-talent-detail-pill`
- `prestige` chip styles
- inventory rarity/filter pills
- account status chips

Destino:

- Estado corto no interactivo -> `FlBadge`.
- Filtro/contexto/afijo -> `FlTag`.
- Recurso/costo -> `FlResourcePill` o `FlResourceCounter`.

Riesgo:

- Bajo. Es una migracion con alto retorno.

### Progress / Bars

Duplicados actuales:

- `FlProgressBar`
- `FlHealthBar`
- `ProgressPrimitives.ProgressBar`
- `JobProgressBar`
- `combat-forge-hpbar`
- `combat-forge-resourcebar`
- `combat-hp-bar`
- `forge-character-bar`
- crafting entropy/upgrade tracks.

Destino:

- HP -> `FlHealthBar`.
- XP/progreso -> `FlProgressBar`.
- Jobs -> `FlJobProgress` o `FlProgressBar`.
- Upgrade track -> `FlUpgradeTrack`.

Riesgo:

- Medio/alto. Hay que preservar animaciones y labels.

### Layout

Duplicados actuales:

- `overlay-split-*`
- `overlay-cols-*`
- grids inline con `repeat(auto-fit, minmax(...))`
- flex rows inline con `gap`, `justifyContent`, `flexWrap`
- root stacks por pantalla.

Destino:

- `ScreenShell`
- `SectionStack`
- `ResponsiveGrid`
- `DenseList`
- `Split`
- `ActionRow`
- `ChipRow`

Riesgo:

- Bajo si se crean clases utilitarias especificas del sistema y no se redisenan layouts.

---

## 6. Problemas principales del sistema actual

1. Hay tokens paralelos:
   - `--fl2-*` en `forge-light-v2`.
   - `--fl-*` en `forge-light.css` y en el kit HTML.
   - `--color-*` y `--tone-*` desde la app previa.

2. `src/styles/forge-light.css` y `src/styles/forge-light-v2/` conviven como capas de sistema. Esto no es necesariamente incorrecto, pero hay que declarar autoridad:
   - `forge-light-v2` deberia ser la capa activa para app shell.
   - `forge-light.css` parece contener una version amplia/legacy de primitives.

3. Hay CSS que compensa inline styles mediante selectores como:
   - `[style*="background: var(--color-background-secondary"]`
   - `.fl-station-overlay button:not(.fl-button)`

   Esto es una senal clara de deuda: la capa Forge esta corrigiendo HTML/JSX que todavia habla el idioma visual anterior.

4. Las pantallas tienen componentes locales con nombres de pantalla aunque la intencion sea comun:
   - `fl-sanctuary-chip`
   - `fl-inventory-preset-button`
   - `forge-talent-detail-pill`
   - `prestige-metric-card`
   - `codex-metric-card`

5. El layout esta definido, pero no nombrado como sistema. Se repiten `grid`, `flex`, `gap`, `wrap`, `minmax` y splits directamente en JSX.

---

## 7. Priorizacion recomendada

### Fase A - Limpieza de bajo riesgo

Objetivo: ganar consistencia sin tocar layout.

1. Chips/badges/tags:
   - Sanctuary chips.
   - Inventory pills.
   - Talent detail pills.
   - Prestige chips.
   - Account status chips.

2. Buttons:
   - Sanctuary buttons.
   - Inventory action buttons.
   - Prestige buy/reset buttons.
   - Codex pagination/buttons.

3. Progress bars:
   - Account weekly progress.
   - Character bars.
   - Crafting tracks ya cercanos a `FlProgressBar`.

### Fase B - Pantallas piloto

1. `Crafting`
   - Mejor candidata por adopcion actual de `Fl*`.
   - Permite validar `FlUpgradeTrack`, `FlCostDisplay`, `FlCraftingResultPreview`.

2. `Sanctuary`
   - Buena estructura repetida.
   - Rows, jobs, stations y chips tienen destino claro.

3. `Inventory`
   - Mucha deuda y mucho retorno.
   - Migrar item rows y detail modal daria coherencia visible fuerte.

### Fase C - Pantallas densas

1. `Stats`
2. `Prestige`
3. `Codex`

Motivo: mucho inline y mucho contenido. Conviene llegar con patterns ya probados.

### Fase D - Combat y App shell

1. `Combat`
   - Extraer patrones especializados sin perder stage.
   - No convertir todo a cards.

2. `App.jsx`
   - Header, recursos, tabs, pre-run overlay.
   - Alta sensibilidad global.

---

## 8. Componentes destino que conviene formalizar antes de migrar

Estos no necesariamente requieren codigo nuevo ya, pero si una decision de contrato:

- `FlLayoutStack` o clase `.fl-layout-stack`
- `FlResponsiveGrid` o clase `.fl-grid`
- `FlDenseList` o clase `.fl-dense-list`
- `FlActionRow` o clase `.fl-action-row`
- `FlChipRow` o clase `.fl-chip-row`
- `FlSplit` o clases `.fl-split--45-55`, `.fl-split--52-48`, `.fl-split--54-46`
- `CombatStage` como patron especializado, no primitive generica.
- `ItemSelectorDrawer` como patron de selector denso si Crafting e Inventory lo comparten.
- `ContractCard`, `WeeklyLedgerCard`, `WeeklyBossCard` como domain composites si aparecen en Combat/Codex/Account.

---

## 9. Riesgos y cuidados

- No migrar por busqueda/reemplazo. Muchos componentes locales mezclan layout, estado, onboarding y visual.
- No cambiar el layout de Combat. El stage es un patron propio.
- No eliminar `ProgressPrimitives` de una vez. Primero reemplazar usos pantalla por pantalla.
- No forzar `FlPanel` donde corresponde `FlCard`. La jerarquia visual depende de esta diferencia.
- No convertir todos los chips en badges. Filtros y afijos deben seguir siendo tags si son contexto o seleccion.
- No quitar CSS de pantalla hasta que el componente destino cubra estados mobile, locked, onboarding spotlight y loading.

---

## 10. Siguiente auditoria recomendada

Si se quiere seguir sin tocar codigo, el proximo documento util seria:

`uirefactor/kit-demo-3/migration-map-forge-light.md`

Contenido sugerido:

- Tabla exacta por componente local.
- Componente destino.
- Props necesarias.
- Estado actual.
- Estado faltante en primitive.
- Riesgo.
- Orden de migracion.

La auditoria actual responde "que existe y donde esta el problema". El migration map responderia "como se reemplaza cada pieza sin cambiar comportamiento".

