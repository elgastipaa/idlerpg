# Component Map Forge Light

Este mapa evita redisenar cada pantalla desde cero. El layout local puede ordenar zonas, pero el estilo visual debe venir de primitives y compuestos de `src/components/ui/forge/`.

## Combat Full

Referencia:
- `uirefactor/fullpage/redesign/Combat Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Resource counters -> `FlResourceCounter`
- Tier track -> `CombatTierTrack`
- Enemy stage -> `CombatEnemyStage`
- Enemy HP -> `FlHealthBar variant="enemy"`
- Side actions -> `CombatSideActions` + `FlSideAction`
- Player HUD -> `CombatPlayerHud`
- Stat strip -> `FlStatStrip variant="combat"`
- Active contract -> `ContractCard`
- Weekly ledger -> `WeeklyLedgerCard`
- Weekly boss -> `WeeklyBossCard`
- Combat log -> `FlPanel` + collapsible content
- Reset action -> `FlButton variant="danger-ghost"` or `FlButton variant="destructive"`
- Bottom nav -> `FlBottomNav`

Notas:
- Layout local permitido solo para ordenar zonas.
- Estilo visual debe venir de primitives.
- `Combat Full` es fullpage vertical: conservar ancho/proporciones y dejar scroll.

## Mochila Full

Referencia:
- `uirefactor/fullpage/redesign/Mochila Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Context strip T7/Boss/upgrades -> `FlPanel` + `FlTag`
- Back to combat -> `FlButton variant="primary"`
- Screen title/capacity -> `FlSectionHeader`
- Equipped item -> `InventoryEquippedCard`
- Equipped item icon -> `FlIconFrame rarity`
- Affixes -> `FlTag tone`
- Loot filter panel -> `FlPanel`
- Loot filter actions -> `FlButton variant="secondary"` + `FlTag`
- Inventory section -> `FlSectionHeader`
- Rarity tabs/counters -> `FlTabs` + `FlBadge`
- Inventory list -> `InventoryItemList`
- Item rows -> `FlItemRow`
- Equip/sell actions -> `FlButton`
- Bottom nav -> `FlBottomNav`

Notas:
- Rareza va en border/badge/icon frame.
- Lista densa, full-width, sin cards SaaS.

## Forja Full

Referencia:
- `uirefactor/fullpage/redesign/Forja Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Back/info controls -> `FlIconButton`
- Station title -> `FlSectionHeader`
- Mode tabs -> `FlTabs variant="primary"`
- Forge body -> `ForgeUpgradePanel`
- Item preview -> `FlItemCard variant="featured"` + `FlIconFrame`
- Before/after preview -> `FlStatStrip` or `FlPanel`
- Entropy bar -> `FlProgressBar type="reward"`
- Material/chance/cost -> `FlResourcePill`, `FlStatRow`, `FlResourceCounter`
- Upgrade track -> `FlProgressBar segmented`
- Current/new stats -> `FlPanel` + `FlStatRow`
- Main action -> `FlButton variant="primary" size="lg"`
- Result feedback -> `FlToast` or `FlPanel variant="success"`
- Bottom nav -> `FlBottomNav`

Notas:
- CTA grande dorado.
- No usar verde como accion principal aunque el resultado sea exitoso.

## Santuario Full

Referencia:
- `uirefactor/fullpage/redesign/Santuario Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Screen title/home action -> `FlSectionHeader` + `FlIconButton`
- Jobs summary -> `FlTag` + `FlButton variant="secondary"`
- Ready job -> `SanctuaryJobCard variant="ready"`
- Running job -> `SanctuaryJobCard variant="running"`
- Job progress -> `FlProgressBar type="progress"`
- Stations section -> `FlSectionHeader`
- Station rows -> `FlStationCard` (domain composite) or `FlCard` + `FlIconFrame` + `FlButton`
- Relic armory -> `FlPanel` + `FlTag` + `FlRequirementHint`
- Start expedition -> `FlButton variant="primary" size="lg"`
- Bottom nav -> `FlBottomNav`

Notas:
- Estados: listo verde, en progreso azul, estructura bronce.
- Station icons usan assets de `public/assets/sanctuary/stations/`.

## Talentos Full

Referencia:
- `uirefactor/fullpage/redesign/Talentos Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Talent hero header -> `FlPanel variant="hero"` + `FlIconFrame`
- TP counter -> `FlResourceCounter type="talent"`
- Build/path tabs -> `FlTabs`
- Active branch header -> `FlSectionHeader` + `FlBadge tone="success"`
- Tree -> `TalentTreePanel`
- Nodes -> `FlTalentNode`
- Node detail -> `FlPanel` + `FlIconFrame` + `FlBadge` + `FlRequirementHint`
- Purchase action -> `FlButton variant="primary"`
- Hero subtabs -> `FlTabs`
- Bottom nav -> `FlBottomNav`

Notas:
- Nodos tienen tamano estable y no se achican para entrar todos.
- Detail panel debajo del arbol en mobile.

## Ecos Full

Referencia:
- `uirefactor/fullpage/redesign/Ecos Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Prestige hero -> `EchoPrestigePanel`
- Ecos icon -> `FlIconFrame variant="legendary"`
- Available/momentum pills -> `FlBadge`/`FlResourcePill`
- Keeps/resets -> `FlPanel variant="success"` + `FlPanel variant="danger"`
- Summary stats -> `FlStatStrip`
- Active sigils -> `FlPanel` + `FlTag`
- Reset explanation -> `FlPanel` with semantic child panels
- Ecos available -> `FlPanel` + `FlStatStrip`
- Modifiers -> `FlTag tone`
- Milestones -> `FlPanel`
- Branch cards -> `FlCard` + `FlIconFrame` + `FlBadge`
- Echo nodes -> `FlItemRow` or `FlTalentNode`
- Buy actions -> `FlButton variant="primary"` or disabled with `FlRequirementHint`
- Bottom nav -> `FlBottomNav`

Notas:
- Arcane/violeta comunica ecos, no reemplaza todo el metal oscuro.
- Reset siempre requiere semantica roja.

## Intel Full

Referencia:
- `uirefactor/fullpage/redesign/Intel Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Expedition context strip -> `FlPanel` + `FlTag`
- Back to combat -> `FlButton variant="primary"`
- Tactical radar hero -> `FlPanel variant="hero"`
- Radar ornament/asset -> `FlIconFrame` or decorative asset slot
- Build/boss/power chips -> `FlTag`
- Tactical stats -> `FlStatStrip`
- Active expedition card -> `FlPanel` + `FlIconFrame`
- Objectives section -> `FlSectionHeader`
- Accessible powers list -> `FlItemRow` + `FlIconButton`/`FlButton`
- Seed bosses list -> `FlItemRow`
- Collapsible sections -> `FlPanel` + `FlIconButton`
- Bottom nav -> `FlBottomNav`

Notas:
- `Ir` puede ser icon/circle action if compact.
- Lists remain Forge rows, not tables.

## Biblioteca Full

Referencia:
- `uirefactor/fullpage/redesign/Biblioteca Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Library hero -> `FlPanel variant="hero"` + `FlIconFrame`
- Archive counters -> `FlResourcePill`
- Research resources -> `FlStatStrip` or resource grid with `FlResourcePill`
- Archive/Glossary tabs -> `FlTabs`
- Back action -> `FlButton variant="secondary"`
- Active bonuses -> `FlPanel` + `FlEmptyState`
- Legendary powers panel -> `FlPanel`
- Carousel arrows -> `FlIconButton`
- Registry tabs -> `FlTabs`
- Registry rows -> `FlItemRow variant="locked"` + `FlBadge variant="lock"`
- Start expedition CTA -> `FlButton variant="primary"`
- Bottom nav -> `FlBottomNav`

Notas:
- Locked/hidden state is violet/arcane + lock, not generic disabled gray.

## Destileria Full

Referencia:
- `uirefactor/fullpage/redesign/Destileria Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Station hero -> `FlPanel variant="hero"` + `FlIconFrame`
- Station stats -> `FlStatStrip`
- Back action -> `FlButton variant="secondary"`
- Catalog section -> `FlSectionHeader`
- Expanded errand -> `FlPanel` + `SanctuaryJobCard`
- Duration options -> `FlCard compact` + `FlButton variant="secondary"`
- Collapsed errands -> `FlItemRow` + `FlTag` + `FlIconButton`
- Ready rewards section -> `FlSectionHeader`
- Ready reward card -> `SanctuaryJobCard variant="ready"`
- Claim reward -> `FlButton variant="primary"`
- Start expedition CTA -> `FlButton variant="primary" size="lg"`
- Bottom nav -> `FlBottomNav`

Notas:
- Encargos/Destileria naming follows gameplay, but visual map remains shared.

## Ficha Heroe Full

Referencia:
- `uirefactor/fullpage/redesign/Ficha Heroe Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Hero profile panel -> `FlPanel variant="hero"`
- Portrait -> `FlIconFrame variant="portrait"` or framed portrait asset
- Class/build tags -> `FlTag`
- Level/kills -> `FlStatRow` or hero summary
- HP -> `FlHealthBar variant="player"`
- XP -> `FlProgressBar type="xp"`
- Current build -> `FlPanel` + `FlItemRow`
- Quick read -> `FlPanel` + `FlStatRow`
- Hero subtabs -> `FlTabs`
- Bottom nav -> `FlBottomNav`

Notas:
- Portrait asset from `public/assets/portraits/classes/`.
- Quick read remains table-like Forge rows.

## Atributos Heroe Full

Referencia:
- `uirefactor/fullpage/redesign/Atributos Heroe Full.png`

Zonas:
- App header -> `FlHeaderBar`
- Screen title/info -> `FlSectionHeader` + `FlIconButton`
- Gold resource -> `FlResourceCounter type="gold"`
- Combat/economy tabs -> `FlTabs`
- Attribute section -> `FlSectionHeader`
- Attribute rows -> `FlCard`/domain row + `FlIconFrame` + `FlProgressBar segmented`
- Attribute cost -> `FlButton variant="primary"` or `FlResourcePill`
- Current reading -> `FlPanel` + `FlStatRow`
- Hero subtabs -> `FlTabs`
- Bottom nav -> `FlBottomNav`

Notas:
- Tracks use diamonds/milestones, not native sliders.
- Costs stay gold/bronce.

## Progreso Offline

Referencia:
- `uirefactor/fullpage/redesign/Progreso_Offline.png`

Zonas:
- Modal shell -> `FlModal variant="offline"`
- Close -> `FlIconButton`
- Title/header -> `FlSectionHeader`
- Offline time -> `FlStatRow`
- Resolve progress -> `FlProgressBar type="reward" size="lg"`
- Reward grid -> `FlStatStrip` or `FlCard compact` grid
- Reward counters -> `FlResourceCounter`/`FlResourcePill`
- Best drop -> `FlItemCard variant="featured"` + `FlIconFrame rarity`

Notas:
- Desktop can be wide modal; mobile becomes full-screen/scrollable panel.
- Not a simple toast.
