# 001 — Gate hover lift to pointer devices

- **Status**: TODO
- **Commit**: UNCOMMITTED
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file, small CSS-only change

## Problem

Several pressable cards and links use `:hover` transforms without checking whether the device has a fine pointer. Touch browsers can synthesize hover after a tap, leaving a card visually lifted and making the interaction feel sticky.

Current code in `app/globals.css:42`, `app/globals.css:60`, and `app/globals.css:99`:

```css
.button--primary:hover { box-shadow: 0 10px 24px rgba(39,101,232,.26); transform: translateY(-1px); }
.project-card:hover { transform: translateY(-4px); border-color: #c8d3e2; box-shadow: var(--shadow); }
.contact-links a:hover { transform: translateY(-2px); border-color: #c8d3e2; box-shadow: var(--shadow); }
```

## Target

Keep the existing hover lift only for fine-pointer devices:

```css
@media (hover: hover) and (pointer: fine) {
  .button--primary:hover { box-shadow: 0 10px 24px rgba(39,101,232,.26); transform: translateY(-1px); }
  .project-card:hover { transform: translateY(-4px); border-color: #c8d3e2; box-shadow: var(--shadow); }
  .contact-links a:hover { transform: translateY(-2px); border-color: #c8d3e2; box-shadow: var(--shadow); }
}
```

The existing `.button:active { transform: scale(.97); }` remains the touch press feedback. Keep the existing reduced-motion media query.

## Repo conventions to follow

- Motion tokens live in `app/globals.css:3`, including `--ease-out: cubic-bezier(.23, 1, .32, 1)`.
- Press feedback already uses an explicit transform and a 160ms transition in `app/globals.css:39-40`.
- Reduced motion is handled globally in `app/globals.css:82`.

## Steps

1. In `app/globals.css`, move the three hover rules above into one `@media (hover: hover) and (pointer: fine)` block near the other hover rules.
2. Leave color-only hover states unchanged unless the final selector is also moved as part of the same rule; do not add new hover effects.

## Boundaries

- Do not change markup, layout, colors, or copy.
- Do not add dependencies or JavaScript.
- Do not remove the existing `:active` press state or reduced-motion handling.

## Verification

- **Mechanical**: run `npx vinext build`, `node --test tests/rendered-html.test.mjs`, and `npm run lint`; expect build/tests/lint to pass with only the existing native-image warnings.
- **Feel check**: open the homepage at a touch-sized viewport, tap a project card and a contact card, and confirm neither remains lifted after the tap. On a desktop pointer, confirm hover lift still appears immediately and releases cleanly.
- **Done when**: all transform-based hover rules are inside the fine-pointer media query and touch interaction has no sticky hover state.
