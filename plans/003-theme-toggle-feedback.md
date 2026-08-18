# 003 — Make theme switching explicit and tactile

- **Status**: DONE
- **Commit**: release commit
- **Severity**: MEDIUM
- **Category**: Interaction feedback / accessibility

## Problem

The theme control only wired one desktop element, had no pressed state, and was hidden from the mobile menu. The control could appear to work while leaving a second control out of sync.

## Target

Use one shared update path for every `[data-theme-toggle]` control. Persist the user choice, update `data-theme`, `color-scheme`, and `aria-pressed`, and move the switch knob with a short interruptible ease-out transition. Keep the global reduced-motion and reduced-transparency fallbacks.

## Implemented

`app/site-interactions.tsx` now initializes and updates all theme controls together. `app/components.tsx` exposes the same control in the mobile menu. `app/globals.css` supplies the glass pill, knob transition, dark-mode materials, and reduced-transparency fallback.

## Verification

- Desktop toggle changes the root theme and `aria-pressed`.
- Mobile menu Appearance toggle changes the same root state.
- The selected theme survives reload through `localStorage`.
- Reduced motion removes long transitions; reduced transparency removes blur.
