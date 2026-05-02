# FlButton Canonical Parity (Forge Light Kit v4)

## Source of truth
- `uirefactor/kit-demo-3/forge-light-kit-v4.html`
- Button references used:
  - Base: `.btn`
  - Sizes: `.btn-sm`, `.btn-md`, `.btn-lg`
  - Variants: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-success`, `.btn-cta`
  - States: `:hover`, `:active`, `:disabled`, `.btn-loading`, `.btn-selected`

## Canonical mapping
- `FlButton variant="default"` -> Kit `btn-primary` (default button).
- `FlButton variant="primary"` -> Kit `btn-primary` (alias compatibility).
- `FlButton variant="secondary"` -> Kit `btn-secondary`.
- `FlButton variant="ghost"` -> Kit `btn-ghost`.
- `FlButton variant="danger" | "danger-ghost" | "destructive"` -> Kit `btn-danger` semantics.
- `FlButton variant="success"` -> Kit `btn-success`.
- `FlButton variant="cta"` / `emphasis="strong"` -> Kit `btn-cta`.

## Guardrails applied
- Button skin is owned by `src/styles/forge-light-v2/buttons.css`.
- `modules.css` only controls layout constraints (`width`, container sizing), not button skin.
- `primitives.css` no longer injects visual skin for `.fl-button` (kept for icon-button primitives).
- `FlButton` default variant changed to `"default"` to keep canonical behavior.

## Inventory ItemRow linkage
- `EQUIPAR` and `DETALLE` in Inventory/Equipped rows now use canonical `FlButton` `variant="default"` and `size="sm"`.
- Any remaining local overrides must not alter border/background/shadow/font of `.fl-button`.
