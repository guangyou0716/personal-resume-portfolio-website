# Portfolio design system

Audience: interviewers reviewing a software engineer from a resume link.
Public surfaces: home, selected projects and details, printable resume.
Owner surfaces: /customize and /guide, authorized on the server.

Material 3 is the foundation: semantic tonal surfaces, readable hierarchy,
consistent states and adaptive layouts. iOS influence is limited to system
font, touch targets, native scrolling and restrained control feedback.
White canvas, cobalt primary, charcoal text; matching dark semantic roles.
Open introduction with existing portrait; flat divided project rows;
two-column skills and working principles; tonal contact region.
Reuse existing profile data and factual project copy. Do not invent credentials,
experience, metrics or project screenshots. Generated concept is guidance only;
its invented portrait, copy and decoration are deliberately not shipped.

Controls: 48px minimum for primary touch actions, 10px button corners,
visible keyboard focus, readable 16px body and editor fields.
Layout: 1160px content maximum; adaptations at 1000, 820 and 560px.
Motion: 120ms press, 160ms feedback, 220ms menu; ease-out (.23,1,.32,1).
Use transform and opacity, gate hover effects to fine pointers, respect
reduced motion. Only the compact header uses backdrop blur.

Validation: production build, TypeScript and server-rendered route/auth checks.
Live browser visual and interaction QA was not run in this turn.
