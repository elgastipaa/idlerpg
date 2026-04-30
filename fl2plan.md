# Forge Light V2 Migration Plan

## Goal

Build a clean Forge Light V2 visual layer for the whole app without continuing to grow the legacy `src/styles/forge-light.css` and `src/styles/responsive.css` files.

The approved visual direction is the Combat trial at:

```txt
http://localhost:5174/#forge-light-prueba
```

The source of truth for the visual language is:

```txt
uirefactor/current/kit-demo-2/forge-light-kit.html
```

Core traits:

- Fantasy screen backgrounds behind the UI.
- Translucent cards/surfaces so the background adds texture.
- Minimal visible card borders.
- Ornament dividers between cards/sections.
- Forge Light badges and pill badges.
- Forge Light button states exactly as the kit defines them.
- Existing layout, sizing, functions, animations, and game behavior preserved.

## Non-Goals

- Do not globally restyle every `.card`, `.panel`, or `button`.
- Do not add fog, texture overlays, stage changes, or layout changes unless explicitly approved.
- Do not migrate by dumping more rules into `forge-light.css` or `responsive.css`.
- Do not remove legacy CSS until the replacement for a specific screen is validated.

## New CSS Structure

Create a new modular stylesheet tree:

```txt
src/styles/forge-light-v2/
  index.css
  tokens.css
  typography.css
  screens.css
  surfaces.css
  badges.css
  buttons.css
  dividers.css
  progress.css
  rarity.css
  stats.css
  feedback.css
  navigation.css
  micro.css
  modules.css
  screens/
    combat.css
    sanctuary.css
    inventory.css
    crafting.css
    character.css
    stats.css
    talents.css
    prestige.css
    account.css
    codex.css
```

`index.css` should only import modules:

```css
@import "./tokens.css";
@import "./typography.css";
@import "./screens.css";
@import "./surfaces.css";
@import "./badges.css";
@import "./buttons.css";
@import "./dividers.css";
@import "./progress.css";
@import "./rarity.css";
@import "./stats.css";
@import "./feedback.css";
@import "./navigation.css";
@import "./micro.css";
@import "./modules.css";
@import "./screens/combat.css";
```

Add other screen files only when their screen is actively migrated.

## Scope

Everything new must be scoped under a V2 root class:

```css
.app-shell-root--forge-light-v2 {
  /* theme tokens */
}
```

Screen-specific rules should use a second screen marker:

```css
.app-shell-root--forge-light-v2[data-fl2-screen="combat"] {
  --fl2-screen-bg: url("/assets/backgrounds/screens/screen_combat_ruins.webp");
}
```

If adding `data-fl2-screen` is too invasive initially, use existing app root classes as a temporary adapter, but keep the V2 CSS under `.app-shell-root--forge-light-v2`.

## Background Assets

Generated backgrounds live in:

```txt
public/assets/backgrounds/screens
```

Expected files from `scripts/generate-screen-backgrounds.mjs`:

```txt
screen_combat_ruins.webp
screen_sanctuary_forge.webp
screen_inventory_armory.webp
screen_crafting_workshop.webp
screen_talents_sigil.webp
screen_character_hall.webp
screen_stats_archive.webp
screen_prestige_altar.webp
screen-backgrounds-manifest.json
```

Use CSS variables for mapping:

```css
.app-shell-root--forge-light-v2[data-fl2-screen="combat"] {
  --fl2-screen-bg: url("/assets/backgrounds/screens/screen_combat_ruins.webp");
}
```

## Core Primitives

Define these primitives from scratch:

```css
.fl2-screen
.fl2-surface
.fl2-surface--soft
.fl2-surface--strong
.fl2-surface--glass
.fl2-badge
.fl2-badge--pill
.fl2-rarity-badge
.fl2-loot-badge
.fl2-button
.fl2-button--primary
.fl2-button--cta
.fl2-button--secondary
.fl2-button--ghost
.fl2-button--danger
.fl2-button--success
.fl2-button--selected
.fl2-button--loading
.fl2-divider
.fl2-progress
.fl2-stat-row
.fl2-resource-pill
```

Rules:

- Primitives should not know about specific layout grids.
- Primitives should not set large margins, fixed heights, or screen-specific positioning.
- Screen adapters may map legacy classes to primitives visually.
- JSX migration to `fl2-*` classes can happen after visual validation.

## Surface Direction

Use translucent surfaces, not opaque gray cards.

Recommended starting tokens:

```css
.app-shell-root--forge-light-v2 {
  --fl2-surface-bg: rgba(8, 10, 11, 0.58);
  --fl2-surface-bg-soft: rgba(8, 10, 11, 0.42);
  --fl2-surface-bg-strong: rgba(8, 10, 11, 0.68);
  --fl2-surface-border: rgba(198, 161, 91, 0.28);
  --fl2-gold: #e6c47a;
  --fl2-gold-strong: #f0d28a;
  --fl2-text: #f2e6c8;
  --fl2-text-muted: #b8aa8f;
}
```

Combat main panel should stay closer to normal Combat transparency:

```css
linear-gradient(180deg, rgba(7, 10, 11, 0.07), rgba(7, 10, 11, 0.16))
```

## Kit Coverage

Migrate the kit as a full visual system, not as isolated color tweaks.

The V2 CSS should cover all chapters from `forge-light-kit.html`:

1. Tokens
2. Typography
3. Buttons
4. Cards
5. Bars
6. Rarities
7. Badges
8. Stats
9. Feedback
10. Navigation
11. Screen modules
12. Micro elements
13. Do / Don't rules

Each chapter should become one small CSS module where possible. Screen files should consume these modules through scoped selectors or eventual `fl2-*` classes.

## Typography

Use the kit typography roles:

- Display headings: `Cinzel`, gold/primary text, controlled letter spacing.
- UI labels: `Barlow Condensed`, uppercase, muted/gold depending on hierarchy.
- Numbers: tabular, strong, readable, not decorative.
- Body/help text: muted secondary, never strong gold for long descriptions.

Do not resize layout containers to force typography. If text does not fit, reduce local type scale or allow wrapping.

## Buttons

Buttons must match `forge-light-kit.html`, not just approximate the color palette.

Required variants:

- Primary: dark gold gradient, gold border, inset highlight, hover gold glow, active pressed depth.
- CTA: stronger full-gold treatment, stronger glow, one main CTA per screen.
- Secondary: deep card background, subtle gold border, simple hover.
- Ghost: transparent, muted, border appears on hover.
- Danger and success: semantic glow, not used as generic CTAs.
- Icon button: square, gold border, inset highlight, hover glow, pressed state.
- Selected: gold-soft background, active glow, selected marker only where appropriate.
- Disabled: muted text, reduced opacity, no hover affordance.
- Loading: stable size, spinner state, no layout shift.

Implementation rule:

- Existing buttons can be visually adapted by selector first, but the final system should expose `fl2-button` classes.
- Preserve existing button dimensions and layout unless a screen-specific migration explicitly approves a change.
- Hover, active/click, focus-visible, disabled, selected, and loading states are part of acceptance.
- A migrated button that lacks the kit glow/pressed behavior is not accepted.

## Rarity And Loot

Rarity is its own family, separate from generic status pills.

Required primitives:

- `fl2-rarity-badge`: text rarity badge with rarity-colored border/text and dark card background.
- `fl2-loot-badge`: compact drop callout combining rarity marker and item/drop text.
- Item/icon frames: rarity by border and glow, not by filling the entire card.
- Affix chips: small bordered chips for item stats and modifiers.

Rules:

- Do not reuse generic pill badges for loot rarity unless the pill copies the kit rarity badge shape and color semantics.
- Rare, epic, legendary states should use border/glow intensity from the kit.
- Avoid painting full cards with rarity colors.

## Dividers

Use dividers between cards/sections, not inside dense content by default.

Pattern:

- Cards keep their translucent background.
- Internal borders are minimized.
- Card-to-card separation is done by a horizontal ornamental divider.
- The divider can use a central diamond only when spacing allows.

Avoid applying dividers automatically to every child in dense lists.

## Bars And Stats

Progress bars, HP bars, XP bars, milestone bars, and stat rows should follow the kit:

- Dark track with subtle gold border.
- Gradient fill by semantic role.
- Smooth width transition.
- Optional centered value text only when readable.
- Stat rows with muted uppercase label and strong tabular value.
- Resource pills with icon, label, and amount hierarchy.

Do not replace bars with ornamental dividers. In Combat, the “horizontal separators” inside contract/ledger were progress bars, so those keep bar behavior.

## Feedback And Navigation

Feedback styles to migrate:

- Damage, crit, healing, success/fail, reward, level up.
- Toast/reward banner styles.
- Drop callout/tooltip styles.

Navigation styles to migrate:

- Top status/header bar.
- Primary bottom navigation.
- Desktop primary tabs.
- Secondary/subtab segmented controls.
- Counter badges on nav/icons.

Navigation migration must preserve tap targets, fixed mobile positioning, onboarding spotlight, and current disabled behavior.

## Screen Modules And Micro

Screen module patterns from the kit should be mapped intentionally:

- Sanctuary station rows and job cards.
- Inventory item rows, rarity frames, affix chips, comparison panels.
- Talent nodes and node counters.
- Prestige/Ecos keep/reset cards.
- Offline modal/reward summary.
- Codex/stats/account panels through stat rows, resource pills, and module surfaces.

Micro elements:

- Ornamental separators with central diamond.
- Ornamental bullets for short lists.
- Step indicators and pagination dots where those patterns exist.
- Vertical dividers only where there is enough space.

Use micro elements to reduce hard borders, not to add noise.

## Migration Order

1. Combat
2. Sanctuary
3. Inventory
4. Crafting
5. Character
6. Stats
7. Talents
8. Prestige
9. Account
10. Codex

## Per-Screen Checklist

For each screen:

1. Add the screen background mapping.
2. Add a screen adapter CSS file under `forge-light-v2/screens/`.
3. Map main legacy panels to `fl2-surface` behavior.
4. Map buttons to exact kit variants and states.
5. Convert status badges/chips visually to `fl2-badge` / `fl2-badge--pill`.
6. Convert loot/rarity badges to the rarity family, not generic pills.
7. Convert bars and stat rows to the kit treatment.
8. Add dividers between major cards only.
9. Keep layout, spacing, dimensions, and behavior stable.
10. Run `npm run build`.
11. Review desktop and mobile manually.
12. Only then remove the equivalent legacy rules for that screen.

## Combat V2 Tasks

Combat is the visual reference.

Move the approved trial behavior out of the tail of `responsive.css` into:

```txt
src/styles/forge-light-v2/screens/combat.css
```

Keep the route:

```txt
#forge-light-prueba
```

until the V2 Combat screen is accepted.

Combat V2 should include:

- Ruins or generated Combat background.
- Transparent main combat panel.
- Stats/session/log cards with translucent surfaces.
- No visible card borders for stacked section cards.
- Ornament separators between main panel, stat strip, contract card, weekly ledger, and log.
- Forge Light pill badges for status labels.
- No stage fog or texture overlays unless explicitly requested.

## Legacy Cleanup Strategy

Do not delete large legacy blocks first.

Clean one screen at a time:

1. Migrate screen to V2.
2. Validate visually.
3. Search legacy CSS selectors for that screen.
4. Remove only selectors made obsolete by the V2 screen file.
5. Build.
6. Continue.

Legacy files to reduce over time:

```txt
src/styles/forge-light.css
src/styles/responsive.css
```

## Acceptance Criteria

A migrated screen is accepted when:

- It uses a fantasy background without hurting text readability.
- Cards feel integrated with the background through translucency.
- Badges/pills match Forge Light styling.
- Loot rarity badges and item rarity frames use the kit rarity system.
- Buttons match the kit variants and states, including hover glow and active pressed depth.
- Bars and stat rows match the kit, without being confused with separators.
- Separators reduce the need for hard card borders.
- Desktop and mobile remain usable.
- No unrelated layout or behavior changed.
- `npm run build` passes.
