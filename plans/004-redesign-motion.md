# Redesign motion review — implemented

Scope: app/globals.css and app/site-interactions.tsx.
Findings from existing source: repeated full-section backdrop filters and
large shadows increased scroll compositing; the open mobile menu left the
underlying page keyboard-accessible. Existing reduced-motion and pointer
hover rules were useful and retained in the replacement system.

Implemented: replace section-wide blur with opaque semantic surfaces; retain
only 12px header blur. Use --motion-press:120ms, --motion-control:160ms,
--motion-panel:220ms, --ease-out:cubic-bezier(.23,1,.32,1).
Menu visibility uses opacity and translateY(-8px), reversed on close. Underlying
main/footer become inert while open; focus moves into the menu, Tab wraps,
Escape closes and restores focus, cleanup removes inert and scroll lock.
Hover displacement is gated to (hover:hover) and (pointer:fine).
Reduced motion disables transitions, animations and smooth scrolling.

Production build and TypeScript passed. Actual device/frame-rate feel checks
remain unverified; no smoothness or fidelity score is claimed.
