# Forge Light UI Kit v3

Referencia principal:
- `uirefactor/fullpage/redesign/UI KIT.png`

Este documento especifica componentes implementables. Los nombres y APIs respetan los primitives ya iniciados en `src/components/ui/forge/` cuando existen.

## Reglas Base

- Todos los primitives aceptan `className`.
- Interactivos aceptan `disabled`, `loading`, `selected`, `state` cuando aplique.
- Variantes usan clases `.fl-<component>--<variant>` o `data-*`.
- Texturas: metal para controles/marcos; panel noise para cards/panels/modales.
- No hardcodear colores en JSX.
- No crear variantes por pantalla.

## FlButton

Uso:
- Acciones inmediatas: mejorar, reclamar, comprar, volver, vender, asignar, iniciar expedicion.

Anatomia:
- Surface metalica, overlay `fl-metal-grain-overlay`, borde dorado/bronce, inner stroke, label, icon slots, cost slot, spinner.

Variantes:
- `primary`, `secondary`, `ghost`, `danger`, `danger-ghost`, `destructive`, `success`, `compact`, `icon-only`.

Estados:
- `default`, `hover/focus`, `pressed`, `selected`, `disabled`, `loading`, `success`, `error`.

Tamanos:
- `sm`, `md`, `lg`, `full-width`.

Tokens:
- `--fl-gold-border`, `--fl-gold-glow`, `--fl-gold-deep`, `--fl-text-primary`, `--fl-danger`, `--fl-success`, `--fl-shadow-inset`.

API React:
- `<FlButton variant size icon trailingIcon badge cost loading disabled selected state onClick>Label</FlButton>`

Clases CSS:
- `.fl-button`, `.fl-button--primary`, `.fl-button--secondary`, `.fl-button--ghost`, `.fl-button--danger`, `.fl-button--danger-ghost`, `.fl-button--destructive`, `.fl-button--success`, `.fl-button--compact`, `.fl-button--icon-only`, `.fl-button--sm`, `.fl-button--md`, `.fl-button--lg`, `.fl-button--full`.

No permitido:
- CTA primario verde.
- Cambiar alto durante loading.
- Usar boton plano por pantalla.

## FlIconButton

Uso:
- Cerrar, back, plus de recurso, menu, filtros, expandir/colapsar, acciones compactas.

Anatomia:
- Frame cuadrado facetado, icono centrado, badge opcional, focus ring, pressed inset.

Variantes:
- `default`, `active`, `toggle`, `destructive`, `floating`, `toolbar`.

Estados:
- `default`, `hover/focus`, `pressed`, `selected`, `disabled`, `loading`, `error`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-gold-muted`, `--fl-gold-glow`, `--fl-danger`, `--fl-text-primary`.

API React:
- `<FlIconButton icon ariaLabel variant size badge loading disabled selected onClick />`

Clases CSS:
- `.fl-icon-button`, `.fl-icon-button--active`, `.fl-icon-button--destructive`, `.fl-icon-button--sm`, `.fl-icon-button--lg`.

No permitido:
- Icono sin `aria-label` si no hay texto.
- Emoji como icono.

## FlPanel

Uso:
- Secciones grandes: contrato, weekly, radar, hero panels, reset/prestige, modal body.

Anatomia:
- Surface oscura, `fl-panel-noise-overlay`, borde bronce, esquinas ornamentales, header opcional, content slot.

Variantes:
- `default`, `hero`, `section`, `danger`, `success`, `arcane`, `compact`.

Estados:
- `default`, `selected`, `disabled`, `loading`, `success`, `error`.

Tamanos:
- `sm`, `md`, `lg`, `full-width`.

Tokens:
- `--fl-bg-card`, `--fl-bg-card-deep`, `--fl-gold-muted`, `--fl-shadow-card`.

API React:
- `<FlPanel variant title subtitle icon action loading state>...</FlPanel>`

Clases CSS:
- `.fl-panel`, `.fl-panel--hero`, `.fl-panel--danger`, `.fl-panel__header`, `.fl-panel__body`.

No permitido:
- Panel sin textura ni borde.
- Usar panel como wrapper decorativo innecesario alrededor de cada elemento.

## FlCard

Uso:
- Items, jobs, stations, nodes details, reward cards, compact stats.

Anatomia:
- Surface oscura, noise overlay, border, rarity accent opcional, content, action area.

Variantes:
- `default`, `compact`, `panel`, `premium`, `featured`, `danger`.

Estados:
- `default`, `hover/focus`, `pressed`, `selected`, `disabled`, `locked`, `loading`, `success`, `error`.

Tamanos:
- `sm`, `md`, `lg`, `full-width`.

Tokens:
- `--fl-bg-card`, `--fl-gold-muted`, `--fl-rarity-*`, `--fl-shadow-card`.

API React:
- `<FlCard variant interactive selected disabled locked loading rarity state onClick>...</FlCard>`

Clases CSS:
- `.fl-card`, `.fl-card--compact`, `.fl-card--panel`, `.fl-card--premium`, `.fl-card--interactive`, `.fl-card--selected`.

No permitido:
- Pintar toda la card con rareza.
- Cards web con radius grande y sombra suave.

## FlSectionHeader

Uso:
- Titulos de bloques: Trabajos, Estaciones, Inventario, Lectura actual, Objetivos.

Anatomia:
- Overline/titulo, icono opcional, contador, accion, separador ornamental.

Variantes:
- `default`, `compact`, `with-action`, `collapsible`, `sticky`.

Estados:
- `default`, `collapsed`, `expanded`, `loading`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-font-display`, `--fl-text-primary`, `--fl-gold-border`.

API React:
- `<FlSectionHeader title subtitle icon count action collapsible collapsed onToggle />`

Clases CSS:
- `.fl-section-header`, `.fl-section-header--compact`, `.fl-section-header__rule`.

No permitido:
- Usar H1 visual dentro de panels compactos.

## FlBadge

Uso:
- Rareza, listo, bloqueado, nuevo, tier, count, notification, estado.

Anatomia:
- Pill/frame pequeno, border semantico, label corto, icono opcional.

Variantes:
- `status`, `count`, `rarity`, `tier`, `lock`, `notification`, `comparison-delta`.

Estados:
- `default`, `active`, `disabled`, `success`, `warning`, `error`, `new`.

Tamanos:
- `xs`, `sm`, `md`.

Tokens:
- `--fl-success`, `--fl-danger`, `--fl-defense`, `--fl-arcane`, `--fl-reward`, `--fl-rarity-*`.

API React:
- `<FlBadge variant tone rarity size icon selected>Label</FlBadge>`

Clases CSS:
- `.fl-badge`, `.fl-badge--rarity`, `.fl-badge--status`, `.fl-badge--count`, `.fl-rarity--epic`.

No permitido:
- Texto largo.
- Badge interactivo si deberia ser `FlTag` o `FlButton`.

## FlTag

Uso:
- Filtros, afijos, tipos, slots, chips de contexto.

Anatomia:
- Pill compacto, label, icono opcional, remove opcional.

Variantes:
- `static`, `selectable`, `removable`, `filter`, `compact`.

Estados:
- `default`, `selected`, `disabled`, `pressed`, `removable`.

Tamanos:
- `sm`, `md`.

Tokens:
- `--fl-gold-muted`, `--fl-text-secondary`, `--fl-success`, `--fl-defense`, `--fl-arcane`.

API React:
- `<FlTag tone selected removable onRemove onClick>Label</FlTag>`

Clases CSS:
- `.fl-tag`, `.fl-tag--selected`, `.fl-tag--success`, `.fl-tag--arcane`.

No permitido:
- Usarlo como CTA principal.

## FlProgressBar

Uso:
- XP, progreso de contrato, job timers, entropy, weekly, upgrade tracks simples.

Anatomia:
- Track metalico, fill, cap/highlight, label opcional, milestones opcionales.

Variantes:
- `progress`, `xp`, `success`, `danger`, `arcane`, `reward`, `segmented`, `compact`, `labeled`.

Estados:
- `default`, `active`, `paused`, `complete`, `failed`, `locked`, `loading`.

Tamanos:
- `xs`, `sm`, `md`, `lg`.

Tokens:
- `--fl-gold-border`, `--fl-success`, `--fl-danger`, `--fl-arcane`, `--fl-defense`, `--fl-reward`.

API React:
- `<FlProgressBar type value max label milestones segmented size state />`

Clases CSS:
- `.fl-progress`, `.fl-progress--xp`, `.fl-progress--segmented`, `.fl-progress__fill`.

No permitido:
- Barra nativa sin frame.
- Texto dentro de barra si no hay contraste suficiente.

## FlHealthBar

Uso:
- HP enemigo, HP jugador, boss HP.

Anatomia:
- Frame metalico reforzado, icon/head cap opcional, fill rojo/verde, label valor/porcentaje.

Variantes:
- `enemy`, `player`, `boss`, `compact`.

Estados:
- `default`, `damaged`, `healing`, `critical`, `dead`, `loading`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-danger`, `--fl-success`, `--fl-gold-border`, `--fl-glow-danger`.

API React:
- `<FlHealthBar variant value max label percent icon critical />`

Clases CSS:
- `.fl-health-bar`, `.fl-health-bar--enemy`, `.fl-health-bar--player`, `.fl-health-bar__fill`.

No permitido:
- HP enemigo verde.
- Quitar el frame para ahorrar alto.

## FlResourceCounter

Uso:
- Recursos globales y contextuales: oro, esencia, ecos, tinta, polvo, TP.

Anatomia:
- Frame metalico, icon frame o asset, valor tabular, label opcional, plus/action.

Variantes:
- `compact`, `expanded`, `with-cap`, `delta`, `tappable`.

Estados:
- `default`, `increasing`, `decreasing`, `insufficient`, `capped`, `loading`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-text-primary`, `--fl-gold-border`, `--fl-reward`, `--fl-arcane`.

API React:
- `<FlResourceCounter type icon label value compact cap delta onAdd onClick />`

Clases CSS:
- `.fl-resource-counter`, `.fl-resource-counter--compact`, `.fl-resource-counter__value`.

No permitido:
- Mostrar recursos como texto suelto en header.

## FlResourcePill

Uso:
- Recursos dentro de panels, costes compactos, resumen de materiales.

Anatomia:
- Pill framed, icono, label/valor, tone opcional.

Variantes:
- `gold`, `essence`, `xp`, `material`, `echo`, `cost`, `reward`.

Estados:
- `default`, `insufficient`, `gained`, `spent`, `disabled`.

Tamanos:
- `sm`, `md`.

Tokens:
- `--fl-gold-muted`, `--fl-reward`, `--fl-arcane`, `--fl-defense`.

API React:
- `<FlResourcePill type icon label value tone insufficient />`

Clases CSS:
- `.fl-resource-pill`, `.fl-resource-pill--gold`, `.fl-resource-pill--insufficient`.

No permitido:
- Reemplazar `FlResourceCounter` en header cuando se necesita accion plus.

## FlStatRow

Uso:
- Atributos, comparaciones, lectura rapida, afijos, boss mechanics.

Anatomia:
- Icon slot, label, value, delta, helper, divider.

Variantes:
- `basic`, `with-delta`, `breakdown`, `compact`, `grouped`.

Estados:
- `default`, `increased`, `decreased`, `capped`, `modified`, `locked`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-text-secondary`, `--fl-text-primary`, `--fl-success`, `--fl-danger`.

API React:
- `<FlStatRow icon label value delta deltaTone helper compact />`

Clases CSS:
- `.fl-stat-row`, `.fl-stat-row--compact`, `.fl-stat-row__value`, `.fl-stat-row__delta`.

No permitido:
- Alinear valores a mano por pantalla.

## FlStatStrip

Uso:
- Banda de stats principales de Combat, resumen de Ecos, Intel, Forge cost/probabilidad.

Anatomia:
- Panel horizontal, 2-5 stat cells, dividers, icons, labels, valores.

Variantes:
- `combat`, `summary`, `cost`, `hero`, `compact`.

Estados:
- `default`, `updating`, `warning`, `success`, `loading`.

Tamanos:
- `sm`, `md`, `lg`, `responsive`.

Tokens:
- `--fl-bg-card`, `--fl-gold-muted`, `--fl-text-primary`.

API React:
- `<FlStatStrip items variant compact columns />`

Clases CSS:
- `.fl-stat-strip`, `.fl-stat-strip--combat`, `.fl-stat-strip__cell`.

No permitido:
- Convertir la banda en cards separadas si la referencia muestra strip.

## FlIconFrame

Uso:
- Items, talentos, stats, recursos, estaciones, rewards, portraits compactos.

Anatomia:
- Frame cuadrado/circular/rombo, asset/icon child, rarity/tone border, glow, lock/new badge.

Variantes:
- `normal`, `active`, `upgraded`, `epic`, `legendary`, `locked`, `portrait`.

Estados:
- `default`, `selected`, `locked`, `new`, `disabled`, `loading`.

Tamanos:
- `xs`, `sm`, `md`, `lg`, `xl`.

Tokens:
- `--fl-rarity-*`, `--fl-gold-border`, `--fl-shadow-inset`.

API React:
- `<FlIconFrame size variant rarity selected locked asset icon fallbackIcon kind>...</FlIconFrame>`

Clases CSS:
- `.fl-icon-frame`, `.fl-icon-frame--lg`, `.fl-icon-frame--locked`, `.fl-rarity--rare`.

No permitido:
- Assets sueltos sin marco en UI core.

## FlTabs

Uso:
- Modos de Forja, subviews Heroe, filtros Biblioteca, ramas/sections.

Anatomia:
- Track framed, tab items, icon/badge, active indicator, overflow scroll opcional.

Variantes:
- `primary`, `secondary`, `compact`, `segmented`, `icon`.

Estados:
- `default`, `active`, `disabled`, `locked`, `loading`.

Tamanos:
- `sm`, `md`, `lg`, `scrollable`.

Tokens:
- `--fl-gold-border`, `--fl-gold-glow`, `--fl-bg-card`.

API React:
- `<FlTabs items activeId onChange variant size scrollable />`

Clases CSS:
- `.fl-tabs`, `.fl-tabs--primary`, `.fl-tabs__item`, `.fl-tabs__item--active`.

No permitido:
- Mantener subtabs legacy claros.

## FlBottomNav

Uso:
- Navegacion principal: Santuario, Expedicion, Heroe, Ecos, Mas.

Anatomia:
- Bar/frame inferior, nav items, icon frame, label, badge, selected glow.

Variantes:
- `fixed`, `static`, `compact`, `icon-label`.

Estados:
- `default`, `active`, `disabled`, `locked`, `notification`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-bg-card-deep`, `--fl-gold-border`, `--fl-gold-glow`.

API React:
- `<FlBottomNav items activeId onChange fixed safeArea />`

Clases CSS:
- `.fl-bottom-nav`, `.fl-bottom-nav__item`, `.fl-bottom-nav__item--active`.

No permitido:
- Bar plana con iconos sin marco.
- Tap targets menores a 44px.

## FlHeaderBar

Uso:
- Header persistente con jugador, estado, recursos y menu.

Anatomia:
- Portrait frame, level badge, name/build/status, resource counters, menu icon, bottom divider.

Variantes:
- `combat`, `default`, `station`, `compact`.

Estados:
- `default`, `resource-updating`, `warning`, `offline`, `syncing`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-bg-card-deep`, `--fl-gold-muted`, `--fl-text-primary`, `--fl-defense`.

API React:
- `<FlHeaderBar hero resources status activeContext menuAction />`

Clases CSS:
- `.fl-header-bar`, `.fl-header-bar--combat`, `.fl-header-bar__resources`.

No permitido:
- Redefinir header por pantalla.

## FlSideAction

Uso:
- Rail de acciones en Combat: Mochila, Intel, Extraer, Auto.

Anatomia:
- Boton vertical o stacked, icono arriba, label, badge, selected/active ring.

Variantes:
- `default`, `primary`, `toggle`, `danger`, `compact`.

Estados:
- `default`, `hover/focus`, `pressed`, `active`, `disabled`, `loading`, `notification`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-gold-border`, `--fl-gold-glow`, `--fl-bg-card-deep`.

API React:
- `<FlSideAction icon label badge active variant disabled onClick />`

Clases CSS:
- `.fl-side-action`, `.fl-side-action--primary`, `.fl-side-action--active`.

No permitido:
- Rail como lista de links.

## FlItemCard

Uso:
- Item destacado/equipado, mejor drop, item small card.

Anatomia:
- `FlCard`, `FlIconFrame`, rarity badge, title, power, affixes, actions.

Variantes:
- `equipped`, `loot`, `compact`, `featured`, `comparison`.

Estados:
- `default`, `selected`, `equipped`, `new`, `locked`, `loading`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-rarity-*`, `--fl-gold-muted`, `--fl-text-primary`.

API React:
- `<FlItemCard item variant selected actions onClick />`

Clases CSS:
- `.fl-item-card`, `.fl-item-card--equipped`, `.fl-item-card__power`.

No permitido:
- Rareza como background completo.

## FlItemRow

Uso:
- Inventario, Biblioteca registros, objectives, lists con icono + acciones.

Anatomia:
- Leading icon frame, copy, meta/badges, trailing value/action.

Variantes:
- `inventory`, `compact`, `locked`, `reward`, `objective`.

Estados:
- `default`, `pressed`, `selected`, `disabled`, `locked`, `new`, `loading`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-bg-card`, `--fl-gold-muted`, `--fl-text-secondary`.

API React:
- `<FlItemRow item title subtitle meta actions selected onClick />`

Clases CSS:
- `.fl-item-row`, `.fl-item-row__copy`, `.fl-item-row__actions`.

No permitido:
- Rows sin separador ni frame.

## FlTalentNode

Uso:
- Nodos de Talentos y Ecos.

Anatomia:
- Boton circular/facetado, icon frame, level badge, ready marker, connector hooks opcionales.

Variantes:
- `locked`, `available`, `ready`, `owned`, `maxed`, `keystone`, `spotlight`.

Estados:
- `default`, `hover/focus`, `pressed`, `selected`, `disabled`, `locked`, `loading`.

Tamanos:
- `sm`, `md`, `lg`, `keystone`.

Tokens:
- `--fl-gold-border`, `--fl-success`, `--fl-danger`, `--fl-rarity-legendary`.

API React:
- `<FlTalentNode talentId icon state selected level maxLevel keystone spotlight onClick />`

Clases CSS:
- `.fl-talent-node`, `.fl-talent-node--ready`, `.fl-talent-node--keystone`, `.fl-talent-node__level`.

No permitido:
- Nodo como checkbox/boton rectangular plano.

## FlModal

Uso:
- Confirmaciones, Progreso Offline, rewards, prestige, filtros complejos.

Anatomia:
- Overlay, frame panel, header, close icon, body scroll, footer sticky opcional.

Variantes:
- `confirmation`, `destructive`, `reward`, `error`, `form`, `offline`, `full-screen`.

Estados:
- `closed`, `opening`, `open`, `loading`, `success`, `error`.

Tamanos:
- `sm`, `md`, `lg`, `full-screen-mobile`.

Tokens:
- `--fl-bg-card-deep`, `--fl-gold-border`, `--fl-shadow-card`.

API React:
- `<FlModal open title tone onClose footer size>...</FlModal>`

Clases CSS:
- `.fl-modal`, `.fl-modal__panel`, `.fl-modal__header`, `.fl-modal__footer`.

No permitido:
- Modal blanco/claro.
- Footer que tapa contenido sin padding.

## FlToast

Uso:
- Feedback no bloqueante: loot, reclaim, success, error, reward.

Anatomia:
- Small panel, icon frame, message, optional action, timeout/progress.

Variantes:
- `info`, `success`, `warning`, `error`, `reward`, `undo`.

Estados:
- `queued`, `visible`, `dismissing`, `paused`.

Tamanos:
- `sm`, `md`.

Tokens:
- `--fl-bg-card`, `--fl-success`, `--fl-danger`, `--fl-reward`.

API React:
- `<FlToast tone icon message actionLabel onAction onClose />`

Clases CSS:
- `.fl-toast`, `.fl-toast--success`, `.fl-toast--reward`.

No permitido:
- Tapar CTA o bottom nav critico.

## FlTooltip

Uso:
- Stat details, requisitos, costes, locks, rareza, efectos.

Anatomia:
- Popover pequeno framed, title, body, optional rows.

Variantes:
- `simple`, `rich`, `stat-breakdown`, `locked-reason`, `cost-breakdown`.

Estados:
- `hidden`, `visible`, `loading`, `error`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-bg-card-deep`, `--fl-gold-muted`, `--fl-text-body`.

API React:
- `<FlTooltip content title placement open>trigger</FlTooltip>`

Clases CSS:
- `.fl-tooltip`, `.fl-tooltip--rich`, `.fl-tooltip__title`.

No permitido:
- Tooltip con texto largo que deberia ser sheet/modal.

## FlEmptyState

Uso:
- Inventario vacio, sin jobs, sin resultados, locked content.

Anatomia:
- Icon frame, title, reason, optional action.

Variantes:
- `neutral`, `actionable`, `locked`, `filtered`, `error-empty`.

Estados:
- `default`, `filtered`, `locked`, `loading`, `error`.

Tamanos:
- `sm`, `md`, `lg`.

Tokens:
- `--fl-text-secondary`, `--fl-gold-muted`, `--fl-danger`.

API React:
- `<FlEmptyState variant icon title reason action />`

Clases CSS:
- `.fl-empty-state`, `.fl-empty-state--locked`, `.fl-empty-state__action`.

No permitido:
- Texto sin frame en secciones principales.

## FlRequirementHint

Uso:
- Razones de disabled/locked: recurso, nivel, prereq, inventario, cuenta.

Anatomia:
- Alert row/panel, icono, label, optional action.

Variantes:
- `resource`, `locked`, `level`, `inventory`, `prereq`, `warning`.

Estados:
- `default`, `blocking`, `resolved`, `loading`.

Tamanos:
- `sm`, `md`.

Tokens:
- `--fl-danger`, `--fl-reward`, `--fl-defense`, `--fl-bg-card`.

API React:
- `<FlRequirementHint type label actionLabel onAction />`

Clases CSS:
- `.fl-requirement-hint`, `.fl-requirement-hint--locked`, `.fl-requirement-hint--resource`.

No permitido:
- Disabled sin razon cuando el usuario puede actuar para resolverlo.

## Componentes Compuestos

## CombatTierTrack

Uso:
- Progreso de tier, nodos de avance y boss/target en Combat.

Anatomia:
- Titulo tier, subtitulo zona, line track, milestones, arrows/back-next.

Variantes:
- `default`, `boss-route`, `completed`, `locked`.

Estados:
- `default`, `advancing`, `blocked`, `complete`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-gold-border`, `--fl-danger`, `--fl-text-primary`.

API React:
- `<CombatTierTrack tier zone enemy milestones activeIndex onPrev onNext />`

Clases CSS:
- `.combat-tier-track`, `.combat-tier-track__milestone`.

No permitido:
- Progress line sin milestones Forge.

## CombatEnemyStage

Uso:
- Hero visual de Combat.

Anatomia:
- Background scene, enemy asset, vignette, enemy name, `FlHealthBar`, side rail slot, player HUD slot.

Variantes:
- `default`, `boss`, `elite`, `loading`.

Estados:
- `default`, `damaged`, `defeated`, `spawning`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-bg-main`, `--fl-danger`, `--fl-gold-border`.

API React:
- `<CombatEnemyStage background enemy health sideActions playerHud />`

Clases CSS:
- `.combat-enemy-stage`, `.combat-enemy-stage__enemy`, `.combat-enemy-stage__vignette`.

No permitido:
- Gradiente sin asset/fondo.

## CombatPlayerHud

Uso:
- HP/XP jugador y nivel en Combat.

Anatomia:
- Shield/portrait icon frame, HP bar, XP bar, level badge.

Variantes:
- `default`, `compact`, `low-health`.

Estados:
- `default`, `damaged`, `level-up`, `dead`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-success`, `--fl-defense`, `--fl-arcane`, `--fl-gold-border`.

API React:
- `<CombatPlayerHud level hp maxHp xp maxXp />`

Clases CSS:
- `.combat-player-hud`, `.combat-player-hud__bars`.

No permitido:
- HP/XP como texto sin barras.

## CombatSideActions

Uso:
- Rail de acciones en Combat.

Anatomia:
- Stack vertical de `FlSideAction`, badges y grouping.

Variantes:
- `right-rail`, `bottom-compact`.

Estados:
- `default`, `collapsed`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-gold-border`, `--fl-bg-card-deep`.

API React:
- `<CombatSideActions actions />`

Clases CSS:
- `.combat-side-actions`, `.combat-side-actions--right-rail`.

No permitido:
- Mezclar botones normales y side actions en el rail.

## ContractCard

Uso:
- Contrato activo en Combat.

Anatomia:
- Header, target/reward tag, title, objective, progress bar, rewards, status button.

Variantes:
- `active`, `complete`, `locked`.

Estados:
- `default`, `claimable`, `loading`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-arcane`, `--fl-success`, `--fl-gold-border`.

API React:
- `<ContractCard contract progress rewards status action />`

Clases CSS:
- `.contract-card`, `.contract-card__rewards`.

No permitido:
- Contrato como texto fuera de panel.

## WeeklyLedgerCard

Uso:
- Progreso semanal reclamable.

Anatomia:
- Icono, title, objective, progress, reward row, claim/view actions.

Variantes:
- `default`, `claimable`, `claimed`.

Estados:
- `default`, `loading`, `success`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-success`, `--fl-reward`, `--fl-gold-border`.

API React:
- `<WeeklyLedgerCard ledger progress rewards onClaim onView />`

Clases CSS:
- `.weekly-ledger-card`, `.weekly-ledger-card__actions`.

No permitido:
- Claim button verde como primary.

## WeeklyBossCard

Uso:
- Boss semanal y dificultad/recompensas.

Anatomia:
- Danger panel, timer, boss icon/asset, description, difficulty cards.

Variantes:
- `default`, `active`, `expired`, `locked`.

Estados:
- `default`, `loading`, `claimed`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-danger`, `--fl-arcane`, `--fl-defense`, `--fl-gold-border`.

API React:
- `<WeeklyBossCard boss timer attempts difficulties />`

Clases CSS:
- `.weekly-boss-card`, `.weekly-boss-card__difficulty`.

No permitido:
- Boss sin rojo/danger framing.

## InventoryEquippedCard

Uso:
- Item equipado destacado en Mochila.

Anatomia:
- `FlItemCard` featured, icon large, rarity, title, power, affixes, detail hint.

Variantes:
- `single`, `comparison`, `upgrade`.

Estados:
- `default`, `selected`, `upgrade-available`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-rarity-*`, `--fl-gold-border`.

API React:
- `<InventoryEquippedCard item upgrades onOpen />`

Clases CSS:
- `.inventory-equipped-card`.

No permitido:
- Equipado como row igual al inventario.

## InventoryItemList

Uso:
- Lista de items con filtros y acciones.

Anatomia:
- Header/filter slots, `FlItemRow` list, empty/loading states.

Variantes:
- `default`, `filtered`, `compact`.

Estados:
- `default`, `loading`, `empty`, `filtered`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-bg-card`, `--fl-gold-muted`.

API React:
- `<InventoryItemList items filters sort selectedId actions />`

Clases CSS:
- `.inventory-item-list`.

No permitido:
- Estilos de row distintos por rareza.

## ForgeUpgradePanel

Uso:
- Panel central de Forja.

Anatomia:
- Item preview, before/after values, entropy bar, cost/probability/materials, upgrade track, CTA.

Variantes:
- `upgrade`, `reforge`, `imbue`, `extract`, `disabled`.

Estados:
- `default`, `loading`, `success`, `error`, `insufficient`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-reward`, `--fl-success`, `--fl-gold-border`.

API React:
- `<ForgeUpgradePanel mode item preview cost entropy chance onAction />`

Clases CSS:
- `.forge-upgrade-panel`, `.forge-upgrade-panel__preview`.

No permitido:
- CTA secundario para la accion primaria.

## SanctuaryJobCard

Uso:
- Job listo/en progreso en Santuario y Destileria/Encargos.

Anatomia:
- Icon frame, title, state text, reward/progress, action button, repeat control.

Variantes:
- `ready`, `running`, `empty`, `locked`.

Estados:
- `default`, `claimable`, `loading`, `success`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-success`, `--fl-defense`, `--fl-gold-border`.

API React:
- `<SanctuaryJobCard job status rewards progress onClaim onRepeat />`

Clases CSS:
- `.sanctuary-job-card`, `.sanctuary-job-card--ready`.

No permitido:
- Progress sin barra framed.

## TalentTreePanel

Uso:
- Arbol de talentos por tier/rama.

Anatomia:
- Column headers, node grid, connectors, selected node handoff.

Variantes:
- `class`, `echo`, `compact`, `scrollable`.

Estados:
- `default`, `loading`, `locked`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-gold-border`, `--fl-success`, `--fl-danger`.

API React:
- `<TalentTreePanel columns nodes selectedId onSelect />`

Clases CSS:
- `.talent-tree-panel`, `.talent-tree-panel__column`.

No permitido:
- Reducir nodos hasta ilegibles.

## EchoPrestigePanel

Uso:
- Hero/resumen de Ecos y reset.

Anatomia:
- Icono grande, ecos a ganar, momentum, conserva/reinicia panels, CTA/requirements.

Variantes:
- `summary`, `confirm`, `locked`.

Estados:
- `default`, `ready`, `blocked`, `loading`.

Tamanos:
- `mobile`, `tablet`.

Tokens:
- `--fl-arcane`, `--fl-success`, `--fl-danger`, `--fl-gold-border`.

API React:
- `<EchoPrestigePanel gain momentum keeps resets canExtract onExtract />`

Clases CSS:
- `.echo-prestige-panel`, `.echo-prestige-panel__consequences`.

No permitido:
- Reset sin warning rojo/semantico.
