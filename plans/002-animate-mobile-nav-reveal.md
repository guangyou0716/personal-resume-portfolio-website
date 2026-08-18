# 002 — Give the mobile menu a short reveal

- **Status**: DONE
- **Commit**: release commit
- **Severity**: LOW
- **Category**: Missed opportunity / physicality
- **Estimated scope**: 1 file, small CSS-only change

## Problem

The mobile navigation currently switches from `display: none` to `display: flex`, so it teleports into view instead of explaining its relationship to the menu button.

Current code in `app/globals.css:22` and `app/globals.css:83`:

```css
.mobile-nav { display: none; }
@media (max-width: 820px) {
  .mobile-nav { display: none; flex-direction: column; gap: 2px; border-top: 1px solid var(--line); padding: 12px 17px 18px; background: var(--background); }
  .mobile-nav.is-open { display: flex; }
}
```

## Target

On mobile, keep the menu in the layout flow but make entry and exit a small, interruptible movement:

```css
@media (max-width: 820px) {
  .mobile-nav {
    display: flex;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-8px);
    pointer-events: none;
    transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out), visibility 200ms var(--ease-out);
  }
  .mobile-nav.is-open {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
}
```

Keep `transform` and `opacity` as the moving properties, use the existing `--ease-out` token, and keep the 200ms duration under the UI budget. The existing global reduced-motion rule should shorten the transition; explicitly keep the open state visible without the translate if a focused feel-check shows movement is still present.

Implemented with an absolutely positioned mobile menu so the closed state takes no layout space while the open/close transition remains an opacity/transform reveal.

## Repo conventions to follow

- The app uses CSS transitions, not keyframes, for interruptible UI in `app/globals.css:39`, `app/globals.css:59`, and `app/globals.css:99`.
- The shared entry curve is `--ease-out: cubic-bezier(.23, 1, .32, 1)` in `app/globals.css:3`.
- Reduced motion is handled in `app/globals.css:82`.

## Steps

1. Replace the mobile `display: none` rule with the hidden visual state above.
2. Replace `.mobile-nav.is-open { display: flex; }` with the visible state above.
3. Keep the existing link click cleanup in `app/site-interactions.tsx` so closing remains immediate and accessible.

## Boundaries

- Do not change the menu markup, route links, or theme logic.
- Do not add a drawer library, spring dependency, or overlay.
- Do not animate desktop navigation.

## Verification

- **Mechanical**: run `npx vinext build`, `node --test tests/rendered-html.test.mjs`, and `npm run lint`.
- **Feel check**: at a 390×844 viewport, open and close the menu repeatedly; confirm it moves only a few pixels, starts quickly, can be interrupted, and never blocks the page when closed. Enable reduced motion and confirm the menu still appears but without visible travel.
- **Done when**: the menu has a 200ms ease-out reveal, the close path retargets cleanly, and reduced motion removes position movement.
