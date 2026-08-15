# Design system

A lightweight system layered over the existing portfolio's visual language —
not a redesign. Every colour, size and shadow below is copied from what the
site already rendered before this pass; nothing was invented. The goal is
that repeated values have one name and one source, and repeated markup has
one component, so future changes happen in one place instead of N.

**Live reference:** [`design-system.html`](design-system.html) renders all
of this for real — the actual token values and the actual components, not a
second description of them. Locally it's `npm run dev` then
`/design-system.html`; once deployed it's
`https://marva-a.github.io/Portfolio/design-system.html`. It is **not**
linked from the public nav yet (by design — see the task this shipped
under), only reachable by direct URL.

## Principles

1. **Systematize, don't redesign.** If a value shown here differs visually
   from what shipped before this pass, that's a bug, not a feature — check
   `git log` for `src/index.css`, `src/styles/`, `src/components/ui/`.
2. **Name what's already repeated. Don't invent repetition that isn't
   there.** A value used once, in one place, for a specific reason, stays
   inline with its reasoning intact — see "What stays unique" below.
3. **The production page is the source of truth.** Tokens and components
   were extracted *from* Hero/SelectedWork/Expertise/About/Contact/Nav, not
   designed in the abstract and then imposed on them.
4. **Comments explain *why*, not *what*.** This codebase already has a
   strong habit of documenting the non-obvious reason behind a specific
   pixel or timing value (see any component file). New code follows it.

## Token structure

Two parallel files, kept in sync by hand — there are few enough tokens that
a build step to generate one from the other isn't worth the indirection:

- **`src/styles/tokens.css`** — CSS custom properties on `:root`, plus two
  small shared utility classes (`.content-container`, `.section-pad`) built
  directly on them. Consumed by `src/index.css`'s existing shared classes
  (`.tag-shadow`, `.pill-pad`, `.gradient-border-anim`, `.mesh-*`, …) and by
  any component using Tailwind's `bg-[var(--color-surface)]` arbitrary-value
  syntax.
- **`src/styles/tokens.js`** — the same colours as JS constants (`color.*`,
  `pillPalette`, `easeBrand`), for the many places components set colour via
  inline `style={{ color: ... }}` rather than a class. This mirrors a
  convention the codebase already had (Hero, About and Expertise each
  declared local `DARK`/`MUTED` hex constants) — `tokens.js` is that pattern
  consolidated into one file instead of five.

Categories covered, with semantic names (`--color-text-primary`, not
`--color-navy`) so a token's *role* survives a future colour tweak:

| Category | Where |
|---|---|
| Brand gradient, surfaces, text, borders, status, focus, pill palette, decorative mesh | `tokens.css` `:root` / `tokens.js` `color` |
| Typography families & weights | `tokens.css`. **Sizes are not here** — the fluid type scale (`.fluid-headline`, `.fluid-section-title`, `.fluid-subsection-title`, `.fluid-card-title`, `.fluid-body`, `.fluid-quote`) already lived in `index.css` as classes, because each clamps between a phone and a desktop value; a single custom property can't carry that curve. Use the classes. |
| Spacing (section rhythm), border widths, radii, shadows/glows, container widths | `tokens.css` |
| Breakpoints | **Deliberately not redefined.** The site is built around exactly two — Tailwind's stock `md` (768px) and `xl` (1280px) — which every responsive class *and* `useMediaQuery`'s `MOBILE_QUERY`/`DESKTOP_QUERY` already key off. Reintroducing them as Tailwind theme variables would risk regenerating those utilities under a different value. |
| Layering (z-index) | Already just Tailwind's default scale (0/10/50) — documented in a `tokens.css` comment, not reimplemented. |
| Motion duration & easing | `tokens.css` / `tokens.js` (`--ease-brand`, `--motion-*`). **Catalogued, not enforced** — see Motion rules below. |

## Component organization

`src/components/ui/` — five components, each one a real, verified
duplication found while auditing the site (not created for symmetry):

| Component | Deduplicates | Notes |
|---|---|---|
| `Pill` | 9 call sites (hero tags, project tags, expertise/chapter tags, status pills, photo caption) | `shadow` prop turns off `.tag-shadow` for pills nested inside an already-shadowed card. Typography is left to `className` — it varies by context on purpose. |
| `SectionHeading` | Selected Work + About's identical eyebrow→h2→description opener | `tone="light"` (cream/card surfaces) or `tone="ink"` (dark sections). **Expertise and Contact intentionally don't use it** — see below. |
| `Button` | The primary gradient CTA (Contact's Send) + the secondary outlined pill (Expertise's Previous/Next) | Also where the missing focus-visible ring on Previous/Next got added — one fix, one place. |
| `FormField` | Contact's 4 inputs + 1 textarea | `as="input" \| "textarea"` picks the element; label, underline and the focus/blur colour swap are shared. |
| `SlideCounter` | The "01 / 05" readout in both the project and career-chapter carousels | `tone` matches `Pill`'s. |

`GradientFrame` (`src/components/`) already existed and is the site's one
decorative gradient-border wrapper — nothing changed there except that more
call sites now share it consistently.

Everything else — `Hero`, `Nav`, `SelectedWork`, `Expertise`, `About`,
`Contact` — stays exactly what it was: page sections, not a component
library. They now *use* the `ui/` components and `tokens.js` where a real
duplicate existed; their own one-off layout math (fluid photo offsets, the
badge's width animation, the career-timeline scroll math) is untouched.

## How to use and extend

- **Reach for `ui/*` first** if you're adding a pill, a button, a labeled
  input, a swipe counter, or an eyebrow+heading+description block. Pass
  `className` for anything contextual (size, extra spacing, visibility) —
  every component accepts and merges it.
- **Reach for `tokens.js`'s `color`** instead of writing a new hex literal
  for anything that already has a token. If the colour you need isn't
  there, check whether it's genuinely new or a near-duplicate of an
  existing token before adding one.
- **Adding a new token:** add it to both `tokens.css` and `tokens.js` (if
  it's a colour used inline), with a comment naming *where* it's used, in
  the style already there.
- **Adding a new `ui/` component:** only once the same markup appears at
  ≥2 real call sites — see "What stays unique" for the line the components
  above draw.
- **The showcase page must stay live, not duplicated.** If you add or
  change a component, add or update its entry in
  `src/design-system/DesignSystemPage.jsx` by importing and rendering the
  real thing — never hand-copy its markup into the showcase.

## Accessibility and motion rules

What's already in place (verified while building this system, not changed):

- **Contrast:** every text/background pair in active use clears WCAG AA —
  spot-checked from 4.5:1 (body text on cream) up to 16:1 (headings). No
  colour was adjusted for contrast; none needed it.
- **Reduced motion, per-animation:** every CSS animation in `index.css`
  (`.gradient-border-anim`, `.mesh-orbit`/`-sway`/`-float`, `.text-shimmer`,
  `.status-dot`, `.reveal-panel`, `.btn-shine`) already had a
  `@media (prefers-reduced-motion: reduce)` override before this pass.

What this pass added:

- **`focus-ring-pill`** (`tokens.css`) — a pill-radius counterpart to the
  pre-existing `.focus-ring-brand` (which uses a 6px radius, sized for
  text). Applied to Nav's links, which previously fell back to the
  browser's inconsistent default outline.
- **`.focus-ring-brand`** extended to the Expertise accordion's header
  buttons and, via `Button`, to the Previous/Next chapter controls — same
  gap, same fix.
- **`<MotionConfig reducedMotion="user">`**, wrapping the whole app in
  `App.jsx` (and the showcase in `src/design-system/main.jsx`). This is the
  Framer Motion counterpart to the CSS media-query overrides above: it
  makes every `motion.*` transform animation (the MA badge's glide and
  letter stagger, the project cards' cursor-follow pill) snap to its end
  state under `prefers-reduced-motion`, without disabling opacity/colour
  transitions. One line, global, instead of threading a check through each
  animation.
- **`aria-hidden="true"`** on purely decorative elements that lacked it:
  the Mail/LinkedIn icons inside links that already carry their own
  `aria-label`, and every mesh-blob background wrapper (Hero, Expertise,
  About, Contact, project/career cards).
- **A genuine visual-consistency fix**, not just documentation: one project
  card's tag pill (`SelectedWork.jsx`'s grid cards) was using `px-4 py-1.5`
  instead of the shared `.pill-pad` (`8px 16px`) every other pill on the
  site already uses — a ~2px drift that predates this system. Folding it
  into `Pill` closed the gap.

**Rule going forward:** don't remove or soften an existing animation to
"fix" an accessibility concern — add or extend a `prefers-reduced-motion`
override (CSS) or lean on `MotionConfig` (Framer Motion) instead, the same
way every animation already on the site does it.

## Naming conventions

- **Tokens:** `--{category}-{role}[-{variant}]` — `--color-text-muted`,
  `--radius-card-lg`, `--space-section-y-mobile`. Category first so related
  tokens sort together.
- **Components:** `PascalCase`, one per file, matching the file name —
  matches every existing component in `src/components/`.
- **Component props:** `tone` for light/ink surface pairing, `variant` for
  a component's alternate treatments (`Button`'s primary/secondary),
  `as` for polymorphic element/tag swapping (`FormField`, `Button`,
  `Pill`) — one small vocabulary, reused across all four `ui/` components
  rather than each inventing its own.

## What stays unique — not a gap, a boundary

These were deliberately **not** folded into the token/component system,
because doing so would either break something finely tuned or systematize
something that was only ever meant to be one-off:

- **Expertise's dual heading** (`hidden xl:block` / `xl:hidden` pair) and
  **Contact's heading** (embedded in its intro/form grid, not standing
  alone) don't use `SectionHeading` — both have a structural reason the
  shared shape can't express without a special case bolted on. Hand-rolled
  on purpose.
- **Every fluid-size clamp() formula, badge-width calculation, and
  scroll/offset measurement** (Hero's photo positioning, Expertise's
  chapter-carousel centring math, About's photo-stack fan geometry) is
  load-bearing, extensively commented, pixel-tuned code — not a pattern
  repeated elsewhere. Left untouched.
- **Motion durations** are catalogued as reference tokens
  (`--motion-fast` … `--motion-settle`) but individual components keep
  their own inline timing rather than being migrated onto the scale — each
  was tuned against what it's animating (badge glide vs. photo settle vs.
  nav compact), and force-fitting them to a shared scale risked visibly
  changing feel for zero benefit.
- **`BrandBadge`'s letter-stagger animation** is Hero-specific — it's a
  signature moment, not a reusable primitive, and stays in
  `src/components/BrandBadge.jsx` rather than `ui/`.
- **Testimonial/project card mesh-blob backgrounds** are generated by
  per-section functions (`cardMeshBlobs` in Expertise, `CardMesh` in
  SelectedWork) with different jitter/quadrant math — they share the
  `.mesh-blob-card` / `.mesh-*` CSS primitives (now token-backed) but not a
  JS component, because their generation logic is genuinely different
  per section.
