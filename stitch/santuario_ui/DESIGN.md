---
name: Santuario UI
colors:
  surface: '#15121b'
  surface-dim: '#15121b'
  surface-bright: '#3b3842'
  surface-container-lowest: '#0f0d15'
  surface-container-low: '#1d1a23'
  surface-container: '#211e27'
  surface-container-high: '#2c2832'
  surface-container-highest: '#37333d'
  on-surface: '#e7e0ed'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e7e0ed'
  inverse-on-surface: '#322f39'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3b0091'
  primary-container: '#9f78ff'
  on-primary-container: '#330080'
  inverse-primary: '#6d3bd6'
  secondary: '#e9c349'
  on-secondary: '#3c2f00'
  secondary-container: '#af8d11'
  on-secondary-container: '#342800'
  tertiary: '#c1c8ca'
  on-tertiary: '#2b3234'
  tertiary-container: '#8b9294'
  on-tertiary-container: '#242b2d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5417be'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#dde4e6'
  tertiary-fixed-dim: '#c1c8ca'
  on-tertiary-fixed: '#161d1f'
  on-tertiary-fixed-variant: '#41484a'
  background: '#15121b'
  on-background: '#e7e0ed'
  surface-variant: '#37333d'
typography:
  headline-xl:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-padding: 32px
  card-gutter: 20px
---

## Brand & Style

This design system blends the ethereal mystery of a dark fantasy RPG with the streamlined precision of modern digital interfaces. The brand personality is "Sacred & Sophisticated"—evoking the feeling of a sanctuary where high-stakes adventure meets quiet preparation. 

The visual style is **Modern Glassmorphism** layered with **Tactile RPG Accents**. It avoids the cluttered, heavy textures of traditional fantasy UI in favor of clean, semi-transparent surfaces, subtle glows, and razor-sharp gold accents. The experience should feel like reading an ancient, illuminated manuscript on a futuristic crystalline glass tablet.

## Colors

The palette is anchored in **Deep Mystical Purples** and **Slate Grays** to establish a sense of depth and night-time serenity. 

- **Primary Purple:** Used for focus states, magical elements, and interactive glows.
- **Secondary Gold:** Reserved for rare artifacts, primary CTAs, and "Divine" highlights.
- **Slate Grays:** Provides a grounded, neutral base for secondary UI elements.
- **Backgrounds:** Utilize a near-black purple ink to maintain high contrast with the gold and white text.

## Typography

This design system uses a dual-font strategy to balance narrative atmosphere with functional clarity. 

**Noto Serif** is utilized for all narrative text, quest titles, and header elements. It should feel authoritative and timeless. **Manrope** handles the "workhorse" tasks of the UI—inventory descriptions, stats, and settings—where legibility is paramount. Use the **Label Caps** (Inter) for system-level indicators like "Tutorial" or "New Item" to create a distinct separation between game lore and game utility.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous margins to prevent the interface from feeling claustrophobic. 

- **The Golden Ratio:** Use 1.618 as a multiplier for vertical spacing between large sections to maintain an organic, aesthetic flow.
- **Margins:** Primary containers should maintain a minimum 32px safety margin from the screen edge.
- **Inventory Grids:** Use a tight 8px gutter for item icons but a wider 24px gutter for information cards to allow the "glow" effects room to breathe.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** and **Luminous Layers** rather than traditional drop shadows.

1.  **Base Layer:** Solid deep purple background.
2.  **Container Layer:** Semi-transparent (80% opacity) slate gray with a 1px inner gold border.
3.  **Active Layer:** Elements on this level feature a back-drop blur (16px) and a soft outer glow in the primary purple or gold color.
4.  **Overlay Layer:** Full-screen modals with a heavy background blur (32px) to focus the user entirely on the "Sanctuary" task at hand.

## Shapes

The shape language is primarily **Rounded (8px-16px)** to feel modern and accessible. However, primary containers should feature **Ornate "Notched" Corners** or double-line borders to evoke the feel of a physical chest or scroll. Action buttons use a higher roundedness (Pill-shaped) to distinguish them from informational cards.

## Components

### Buttons
- **Primary:** Gold gradient fill with dark purple text. High-contrast shadow when hovered.
- **Secondary:** Transparent background with a 2px purple border and a faint inner glow.
- **Ghost:** Serif text with a small decorative icon (e.g., a diamond or spark) on either side.

### Cards
Cards are the primary vessel for information. They must feature a subtle purple "aura" (outer glow) and a very thin 0.5px border. For rare items, the border color shifts to the gold accent.

### Chips & Badges
Small, pill-shaped containers with high-transparency backgrounds. Used for item tags (e.g., "Legendary", "Equipped").

### Ornate Containers
For main menus or character sheets, use "Header Brackets"—decorative gold SVG elements that cap the top and bottom of the container, framing the content like a sacred text.

### Progress Bars
Experience and health bars should not be flat. Use a subtle shimmer effect (moving gradient) within the fill to represent "living energy" or "mana."