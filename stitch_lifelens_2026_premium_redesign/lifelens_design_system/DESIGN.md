---
name: LifeLens Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#434654'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2252d8'
  primary: '#003ab6'
  on-primary: '#ffffff'
  primary-container: '#2453d9'
  on-primary-container: '#d2d9ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006a6a'
  on-secondary: '#ffffff'
  secondary-container: '#7df5f5'
  on-secondary-container: '#007070'
  tertiary: '#3724cc'
  on-tertiary: '#ffffff'
  tertiary-container: '#5145e3'
  on-tertiary-container: '#dad6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b3'
  secondary-fixed: '#7df5f5'
  secondary-fixed-dim: '#5ed8d8'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f50'
  tertiary-fixed: '#e3dfff'
  tertiary-fixed-dim: '#c4c0ff'
  on-tertiary-fixed: '#100069'
  on-tertiary-fixed-variant: '#3622ca'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-hero:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  section-title:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  huge: 64px
  container-padding: 24px
  section-gap: 64px
---

## Brand & Style
The design system is anchored in a "Clinical-but-Warm" philosophy, bridging the gap between rigorous medical precision and human-centric empathy. The target audience includes both patients seeking clarity and practitioners requiring efficiency. 

The aesthetic leverages **Modern Minimalism** with a **Glassmorphic** overlay for navigational elements. This creates a sense of transparency and lightness, reducing the "institutional" weight often associated with medical software. High-end refinement is achieved through generous whitespace, high-quality typography, and a tactile sense of depth provided by soft, ambient shadows.

## Colors
The palette is designed for high legibility and reassurance. The **Primary Clinical Blue** serves as the anchor for trust and action. **Teal** and **Violet** are reserved for secondary visual cues, such as "active" status indicators or categorization badges, ensuring they do not compete with primary calls to action.

The background uses a soft off-white to reduce eye strain, while pure white surfaces indicate interactive or content-rich containers. Text contrast is strictly maintained to ensure accessibility for users with varying visual needs.

## Typography
The system utilizes a dual-font strategy. **Manrope** is used for headings and hero data points, providing a modern, refined character that feels established yet innovative. **Inter** is the workhorse for all functional UI and body text, chosen for its exceptional readability in dense medical contexts.

Weight hierarchy is critical: use **800** for high-impact metrics (e.g., heart rate, AI confidence scores), **700** for primary page titles, and **600** for structural section headers to maintain clear information architecture.

## Layout & Spacing
The spacing rhythm is governed by a strict **8pt grid**. This ensures mathematical harmony across all components.

- **Grid:** A 12-column fluid grid for desktop with 24px gutters. A 4-column grid for mobile with 16px margins.
- **Card Spacing:** All primary content cards must utilize **24px internal padding** (lg) to ensure data doesn't feel cramped.
- **Sectioning:** Large vertical gaps of **48px to 64px** are used to separate distinct functional areas, allowing the UI to "breathe" and reducing cognitive load for the user.

## Elevation & Depth
This design system avoids harsh borders in favor of **Soft Elevation** and **Tonal Layering**.

- **Shadows:** Use extremely diffused, low-opacity shadows. 
  - *Resting State:* `0px 4px 20px rgba(17, 24, 39, 0.04)`
  - *Hover/Elevated State:* `0px 10px 32px rgba(17, 24, 39, 0.08)`
- **Glassmorphism:** Navigation bars and sticky headers should use a backdrop-blur effect (20px-30px) with a semi-transparent white fill (`rgba(255, 255, 255, 0.7)`). This provides a sense of context and spatial awareness as users scroll.

## Shapes
The shape language is purposefully soft to evoke a "warm" medical feeling.
- **Primary Cards:** 24px corner radius.
- **Buttons:** 16px corner radius.
- **Small UI Elements (Chips/Tags):** 8px corner radius.
- **Input Fields:** 12px corner radius.

Avoid perfectly square corners as they appear too aggressive/technical for a wellness-focused medical product.

## Components
- **Buttons:** Large, 16px rounded corners. Primary buttons use the Clinical Blue with white text. Secondary buttons use a light blue ghost style or thin 1px border.
- **Cards:** White surfaces with 24px rounding and 24px padding. Use a subtle 1px border (`#E5E7EB`) in addition to the 0.04 opacity shadow for definition.
- **Chips/Badges:** 8px rounding. Use light tinted backgrounds (e.g., 10% opacity of the accent color) with high-contrast text.
- **Input Fields:** Use a subtle light grey background (`#F3F4F6`) that shifts to White with a Primary Blue border on focus.
- **Icons:** Use thin-line (2px stroke) icons from the Phosphor or Feather family. Icons should always be monochromatic unless they are specific semantic status indicators (Success/Warning). No emojis are permitted for functional navigation.
- **Progress Bars:** Thin, 8px height with fully rounded caps. Use the Teal accent for "Health" or "Completion" metrics.