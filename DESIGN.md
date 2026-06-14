---
name: Kindred Soft-Shell
colors:
  surface: '#fbf8ff'
  surface-dim: '#d5d8f9'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#ececff'
  surface-container-high: '#e5e6ff'
  surface-container-highest: '#dee0ff'
  on-surface: '#161a32'
  on-surface-variant: '#40484c'
  inverse-surface: '#2b2f48'
  inverse-on-surface: '#f0efff'
  outline: '#70787d'
  outline-variant: '#c0c8cd'
  surface-tint: '#24657e'
  primary: '#24657e'
  on-primary: '#ffffff'
  primary-container: '#8ecae6'
  on-primary-container: '#0a566e'
  inverse-primary: '#93cfeb'
  secondary: '#546526'
  on-secondary: '#ffffff'
  secondary-container: '#d3e89b'
  on-secondary-container: '#58692a'
  tertiary: '#605f50'
  on-tertiary: '#ffffff'
  tertiary-container: '#c5c2b0'
  on-tertiary-container: '#515042'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bde9ff'
  primary-fixed-dim: '#93cfeb'
  on-primary-fixed: '#001f2a'
  on-primary-fixed-variant: '#004d64'
  secondary-fixed: '#d6eb9e'
  secondary-fixed-dim: '#bacf84'
  on-secondary-fixed: '#151f00'
  on-secondary-fixed-variant: '#3c4c10'
  tertiary-fixed: '#e6e3d0'
  tertiary-fixed-dim: '#c9c7b5'
  on-tertiary-fixed: '#1c1c11'
  on-tertiary-fixed-variant: '#48473a'
  background: '#fbf8ff'
  on-background: '#161a32'
  surface-variant: '#dee0ff'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-md:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is centered on the concept of "Digital Warmth." It is designed for multi-generational families who need a centralized, stress-free space to manage their daily lives. The personality is **approachable, nurturing, and organized.**

The visual style is a **Modern Soft-Tactile** approach. It evolves neomorphism by shedding the heavy "plastic" look in favor of subtle, pillowy depth and high-legibility contrast. By using large-scale roundedness and a pastel-heavy palette, the interface feels less like a utility and more like a shared household object. Whitespace is used aggressively to ensure the UI feels calm and unhurried, even when family schedules are busy.

## Colors

The palette uses low-saturation "nature-born" pastels to maintain a soothing environment.

*   **Primary (Sky Blue):** Used for primary actions, active navigation states, and highlighting key dates. It evokes a sense of clarity.
*   **Secondary (Sage Green):** Used for "success" states, completed tasks, and health/wellness related categories. It adds a grounding, organic feel.
*   **Tertiary (Warm Cream):** This is the primary surface color. It is softer than pure white, reducing eye strain and adding a "paper-like" warmth to cards.
*   **Neutral (Dusty Slate):** Reserved for text and iconography. While high-contrast for accessibility, it avoids the harshness of pure black.
*   **Background (Soft Mist):** A very pale blue-grey (`#F0F4F8`) serves as the canvas, allowing the cream-colored cards to pop with subtle depth.

## Typography

This design system utilizes **Quicksand** exclusively to leverage its rounded terminals and friendly geometric construction. 

For headlines, we use a heavier weight (`700`) to ensure hierarchy is maintained against the soft UI elements. Body text stays at a medium weight (`500`) to improve legibility against pastel backgrounds. All labels and overlines should use a slightly increased letter-spacing to ensure they don't feel cramped within the large-radius containers.

## Layout & Spacing

The layout philosophy is **"Breathable Grouping."** Content is organized into distinct islands (cards) with generous margins to prevent the screen from feeling cluttered.

*   **Grid:** A 12-column fluid grid for desktop with 24px gutters. On mobile, a single-column layout with 20px side margins is standard.
*   **Vertical Rhythm:** Based on an 8px base unit. Component internal padding should default to 24px to match the large corner radii.
*   **Reflow:** On tablet, cards move from a single stack to a 2-column masonry or grid layout to maximize vertical space.

## Elevation & Depth

Depth in this design system is created through **Soft-Tonal Layering** rather than traditional black shadows.

1.  **Base Layer:** The application background is a flat, cool tint.
2.  **Card Layer:** Surfaces use the Warm Cream (`#F4F1DE`) with a very soft, large-spread shadow: `0px 10px 30px rgba(74, 78, 105, 0.08)`. 
3.  **Active/Pressed States:** Elements should use a slight inner shadow (the modernized neomorphic touch) to feel "pressed" into the surface when clicked, or a subtle scale-down effect (98%).
4.  **No Borders:** Avoid solid 1px borders. If separation is needed, use a 2px stroke in a color only slightly darker than the surface itself.

## Shapes

The shape language is defined by extreme roundedness to evoke safety and friendliness. 

*   **Primary Containers:** Use a minimum of 24px radius. 
*   **Interactive Elements:** Buttons and chips use the "Pill" style (fully rounded sides) to make them appear touch-friendly and distinct from informational cards.
*   **Input Fields:** Use a 16px radius to balance between the cards and the buttons.

## Components

*   **Buttons:** High-contrast pill-shaped elements. Primary buttons use the Sky Blue with white text. They should have a subtle "glow" shadow of the same color.
*   **Cards:** The primary organizational unit. They must have 24px+ padding. Use "Header-Accent" cards where a small 8px vertical strip of the category color (e.g., Sage for Tasks) is placed on the left edge.
*   **Chips/Tags:** Used for family member names or task categories. These are small, pill-shaped, and use a semi-transparent version of the primary colors (e.g., 15% opacity blue with 100% opacity blue text).
*   **Input Fields:** Soft-recessed look. Use a very light grey background with no border, and a 2px Sage Green bottom border that appears only on focus.
*   **Family Avatars:** Always circular with a 3px Cream border and a soft outer glow to make them pop against busy backgrounds.
*   **Progress Bars:** Thick (12px), fully rounded tracks. Use a dual-tone approach where the unfilled track is a very pale version of the filled color.