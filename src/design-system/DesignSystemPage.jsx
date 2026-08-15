import Pill from "../components/ui/Pill";
import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import SlideCounter from "../components/ui/SlideCounter";
import GradientFrame from "../components/GradientFrame";
import Nav from "../components/Nav";
import { color, pillPalette, easeBrandCss } from "../styles/tokens";

// This page is documentation, not a component library — it renders the
// site's actual tokens.js/tokens.css values and the actual components under
// src/components/ui/, rather than a second, parallel description of them.
// If a value shown here ever looks wrong, the fix is in tokens.js or
// tokens.css, not in this file. See DESIGN_SYSTEM.md.

const colorGroups = [
  {
    title: "Brand gradient",
    note: "The diagonal used on borders, text and the timeline — see Gradients below.",
    items: [
      { name: "--color-brand-teal", value: color.brandTeal },
      { name: "--color-brand-sky", value: color.brandSky },
      { name: "--color-brand-violet", value: color.brandViolet },
      { name: "--color-brand-coral", value: color.brandCoral },
    ],
  },
  {
    title: "Surfaces",
    items: [
      { name: "--color-page-bg", value: color.pageBg },
      { name: "--color-surface", value: color.surface },
      { name: "--color-surface-ink", value: color.surfaceInk },
      { name: "--color-surface-ink-hover", value: color.surfaceInkHover },
    ],
  },
  {
    title: "Text",
    items: [
      { name: "--color-text-primary", value: color.textPrimary },
      { name: "--color-text-muted", value: color.textMuted },
      { name: "--color-text-muted-strong", value: color.textMutedStrong },
      { name: "--color-text-on-ink", value: color.textOnInk, onDark: true },
      { name: "--color-text-on-ink-muted", value: color.textOnInkMuted, onDark: true },
      { name: "--color-text-on-brand", value: color.textOnBrand },
    ],
  },
  {
    title: "Pastel pills",
    items: [
      { name: "--color-pill-mint", value: color.pillMint },
      { name: "--color-pill-sky", value: color.pillSky },
      { name: "--color-pill-violet", value: color.pillViolet },
      { name: "--color-pill-coral", value: color.pillCoral },
    ],
  },
  {
    title: "Decorative mesh (CSS-only — not in tokens.js)",
    items: [
      { name: "--color-mesh-purple", value: "#8f74ff" },
      { name: "--color-mesh-teal", value: "#70f2cf" },
      { name: "--color-mesh-yellow", value: "#ffd166" },
      { name: "--color-mesh-coral", value: "#ff7f6e" },
    ],
  },
  {
    title: "Status & focus",
    items: [
      { name: "--color-status-success", value: "#34d399" },
      { name: "--color-status-error", value: color.statusError },
      { name: "--color-focus-ring", value: color.focusRing },
    ],
  },
];

const typeScale = [
  {
    label: ".fluid-headline",
    className: "fluid-headline font-georgia font-bold",
    desc: "26px → 96px between 375–1400px (a compressed 46–88px curve runs 768–1280px). Hero headline only.",
    sample: "Turning ambiguity",
  },
  {
    label: ".fluid-section-title",
    className: "fluid-section-title font-georgia font-bold",
    desc: "24px → 64px, 320–1024px. Section headings.",
    sample: "Selected work.",
  },
  {
    label: ".fluid-subsection-title",
    className: "fluid-subsection-title font-georgia font-bold",
    desc: "20px → 40px, 320–1024px. Sub-headings within a section.",
    sample: "My career journey.",
  },
  {
    label: ".fluid-card-title",
    className: "fluid-card-title font-georgia font-bold",
    desc: "18px → 32px, 320–1024px. Card and list-item titles.",
    sample: "01. Project Name",
  },
  {
    label: ".fluid-body",
    className: "fluid-body",
    desc: "14px → 22px, 375–1400px (16–22px, 768–1280px). Hero's intro paragraph.",
    sample: "I shape early ideas into usable products.",
  },
  {
    label: ".fluid-quote",
    className: "fluid-quote font-medium",
    desc: "20px → 28px, 320–1024px. Testimonial pull-quote.",
    sample: "Marva wrangles and decodes abstract ideas.",
  },
];

const radii = [
  { name: "--radius-pill", value: "9999px", box: { borderRadius: 9999, width: 96 } },
  { name: "--radius-card", value: "24px (rounded-3xl)", box: { borderRadius: 24 } },
  { name: "--radius-card-lg", value: "28px", box: { borderRadius: 28 } },
  { name: "--radius-focus", value: "6px", box: { borderRadius: 6 } },
];

const borderWidths = [
  { name: "--border-width-stroke", value: "1px — gradient stroke (badge, nav, cards)" },
  { name: "--border-width-ring", value: "2px — avatar / badge rings" },
  { name: "--border-width-ring-thick", value: "3px — timeline dot ring + progress line" },
];

const motionTokens = [
  { name: "--ease-brand", value: easeBrandCss },
  { name: "--motion-fast", value: "150ms" },
  { name: "--motion-base", value: "250ms" },
  { name: "--motion-moderate", value: "300ms" },
  { name: "--motion-slow", value: "420ms — badge glide, nav compact" },
  { name: "--motion-settle", value: "700ms — photo-stack settle" },
];

function Swatch({ name, value, onDark }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: color.surface, border: `1px solid ${color.borderSubtle}` }}
    >
      <div
        className="h-16 w-full rounded-xl"
        style={{
          background: value,
          border: `1px solid ${color.borderSubtle}`,
          ...(onDark ? { backgroundColor: color.surfaceInk } : null),
        }}
      >
        {onDark && (
          <div className="h-full w-full rounded-[11px]" style={{ background: value, opacity: 1 }} />
        )}
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color: color.textPrimary }}>
        {name}
      </p>
      <p className="text-xs" style={{ color: color.textMuted }}>
        {value}
      </p>
    </div>
  );
}

function Section({ id, title, description, tone = "light", children }) {
  const isInk = tone === "ink";
  return (
    <section
      id={id}
      className="section-pad scroll-mt-8"
      style={{
        background: isInk ? color.surfaceInk : color.pageBg,
        color: isInk ? color.textOnInk : color.textPrimary,
      }}
    >
      <div className="content-container">
        <h2
          className="font-georgia text-[28px] font-bold md:text-[36px]"
          style={{ color: isInk ? color.textOnInk : color.textPrimary }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="mt-3 max-w-[70ch] text-[16px] leading-relaxed md:text-[18px]"
            style={{ color: isInk ? color.textOnInkMuted : color.textMuted }}
          >
            {description}
          </p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: color.surface, border: `1px solid ${color.borderSubtle}` }}
    >
      {title && (
        <p className="text-sm font-semibold" style={{ color: color.textPrimary }}>
          {title}
        </p>
      )}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div style={{ background: color.pageBg, color: color.textPrimary }}>
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      <header
        className="section-pad"
        style={{ background: color.surface, borderBottom: `1px solid ${color.borderSubtle}` }}
      >
        <div className="content-container">
          <p
            className="text-[12px] font-medium uppercase tracking-[0.15em] md:text-[14px] md:tracking-[0.2em]"
            style={{ color: color.textMuted }}
          >
            Internal reference · not linked from the public site
          </p>
          <h1 className="font-georgia fluid-section-title mt-3 font-bold" style={{ color: color.textPrimary }}>
            Design system.
          </h1>
          <p className="mt-3 max-w-[70ch] text-[17px] leading-relaxed md:text-[20px]" style={{ color: color.textMuted }}>
            The tokens and components behind{" "}
            <a href="./" className="underline" style={{ color: color.textPrimary }}>
              marva.design
            </a>
            , rendered live from the same source the site itself imports. Nothing on this
            page is a copy — the swatches, buttons and cards below are the real{" "}
            <code>src/styles/tokens.js</code> values and the real{" "}
            <code>src/components/ui/*</code> components. See{" "}
            <code>DESIGN_SYSTEM.md</code> for how to use and extend them.
          </p>
        </div>
      </header>

      <main id="content">
        <Section
          id="colors"
          title="Colours"
          description="Every value here is copied from what the site already renders — see src/styles/tokens.css and tokens.js."
        >
          <div className="space-y-10">
            {colorGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: color.textMuted }}>
                  {group.title}
                </h3>
                {group.note && (
                  <p className="mt-1 text-sm" style={{ color: color.textMuted }}>
                    {group.note}
                  </p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {group.items.map((item) => (
                    <Swatch key={item.name} {...item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="typography"
          title="Typography"
          description="Georgia serif for headlines, DM Sans for everything else. The fluid sizes below are CSS classes, not tokens — each one clamps between a phone and a desktop value, so a single custom property can't carry it. Static sizes (12–20px eyebrows, labels and body copy) are set per context and aren't part of a numbered scale."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Card title="Font families">
              <p className="font-georgia text-2xl font-bold" style={{ color: color.textPrimary }}>
                Georgia — headlines
              </p>
              <p className="mt-2 text-lg" style={{ color: color.textMuted }}>
                DM Sans — everything else
              </p>
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: color.textMuted }}>
                <span className="font-normal">Regular 400</span>
                <span className="font-medium">Medium 500</span>
                <span className="font-semibold">Semibold 600</span>
                <span className="font-bold">Bold 700</span>
              </p>
            </Card>
            <Card title="Brand gradient text">
              <p className="font-georgia text-2xl font-bold italic">
                <span className="text-gradient-brand">ambiguity</span>
              </p>
              <p className="mt-2 text-sm" style={{ color: color.textMuted }}>
                .text-gradient-brand — the hero's one gradient-filled word.
              </p>
            </Card>
          </div>

          <div className="mt-8 space-y-6">
            {typeScale.map((t) => (
              <div key={t.label} className="border-t pt-6" style={{ borderColor: color.borderSubtle }}>
                <p className={t.className} style={{ color: color.textPrimary }}>
                  {t.sample}
                </p>
                <p className="mt-2 text-sm" style={{ color: color.textMuted }}>
                  <code>{t.label}</code> — {t.desc}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="spacing-radius"
          title="Spacing, radii & borders"
          description="Most spacing is Tailwind's ordinary scale — already systematic and not re-tokenized. The one repeated pattern that was copy-pasted across sections is the section padding rhythm below."
        >
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: color.textMuted }}>
                Section padding — .section-pad
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-6 rounded" style={{ width: 96, background: color.brandSky }} />
                  <code className="text-sm" style={{ color: color.textMuted }}>
                    --space-section-x-mobile: 24px
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 rounded" style={{ width: 200, background: color.brandViolet }} />
                  <code className="text-sm" style={{ color: color.textMuted }}>
                    --space-section-y-mobile: 96px
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 rounded" style={{ width: 300, maxWidth: "100%", background: color.brandTeal }} />
                  <code className="text-sm" style={{ color: color.textMuted }}>
                    --space-section-x/y-desktop: 96px / 200px
                  </code>
                </div>
              </div>

              <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide" style={{ color: color.textMuted }}>
                Border widths
              </h3>
              <div className="mt-4 space-y-3">
                {borderWidths.map((b) => (
                  <p key={b.name} className="text-sm" style={{ color: color.textMuted }}>
                    <code style={{ color: color.textPrimary }}>{b.name}</code> — {b.value}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: color.textMuted }}>
                Radii
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {radii.map((r) => (
                  <div key={r.name}>
                    <div
                      className="h-16"
                      style={{
                        background: color.brandViolet,
                        opacity: 0.85,
                        ...r.box,
                      }}
                    />
                    <p className="mt-2 text-sm" style={{ color: color.textMuted }}>
                      <code style={{ color: color.textPrimary }}>{r.name}</code>
                      <br />
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="gradients"
          title="Gradients, glows & the mesh"
          description="The signature diagonal gradient, the tag shadow every pill and card carries, and the blurred mesh blobs used as ambient background colour."
          tone="ink"
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl p-6" style={{ background: color.surface }}>
              <GradientFrame radius="20px" padding="2px">
                <div className="flex h-20 items-center justify-center rounded-[18px]" style={{ background: color.surface }}>
                  <span className="text-sm font-semibold" style={{ color: color.textPrimary }}>
                    .gradient-border-anim
                  </span>
                </div>
              </GradientFrame>
              <p className="mt-3 text-sm" style={{ color: color.textMuted }}>
                Animated gradient stroke via GradientFrame — the nav pill, the MA badge, cards.
              </p>
            </div>

            <div className="rounded-2xl p-6" style={{ background: color.surface }}>
              <div
                className="tag-shadow flex h-20 items-center justify-center rounded-2xl"
                style={{ background: color.surface }}
              >
                <span className="text-sm font-semibold" style={{ color: color.textPrimary }}>
                  .tag-shadow
                </span>
              </div>
              <p className="mt-3 text-sm" style={{ color: color.textMuted }}>
                The soft drop shadow every pill, card and the badge carry at rest.
              </p>
            </div>

            <div
              aria-hidden="true"
              className="relative flex h-[152px] items-center justify-center overflow-hidden rounded-2xl"
              style={{ background: color.surfaceInkHover }}
            >
              <div className="mesh-blob-card mesh-purple" style={{ top: "10%", left: "-10%", width: 160, height: 160 }} />
              <div className="mesh-blob-card mesh-teal" style={{ bottom: "-10%", right: "-5%", width: 140, height: 140 }} />
              <span className="relative text-sm font-semibold" style={{ color: color.textOnInk }}>
                .mesh-blob-card
              </span>
            </div>
          </div>

          <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide" style={{ color: color.textOnInkMuted }}>
            Motion tokens
          </h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {motionTokens.map((m) => (
              <p key={m.name} className="text-sm" style={{ color: color.textOnInkMuted }}>
                <code style={{ color: color.textOnInk }}>{m.name}</code> — {m.value}
              </p>
            ))}
          </div>
          <p className="mt-4 max-w-[70ch] text-sm" style={{ color: color.textOnInkMuted }}>
            Every hand-tuned transition on the site (badge glide, nav compact, photo-stack
            settle) uses this one easing curve, at a duration picked for what it's animating —
            durations aren't force-migrated to the scale above; see DESIGN_SYSTEM.md.
          </p>
        </Section>

        <Section
          id="section-headings"
          title="Section headings"
          description="The eyebrow + heading + description opener shared by Selected Work and About — the real SectionHeading component, in both its light and ink tones. Expertise and Contact intentionally hand-roll their own version instead; see DESIGN_SYSTEM.md for why."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionHeading eyebrow="About" description="Feedback from the cross-functional leaders and stakeholders I've collaborated with.">
                Hey, I'm Marva!
              </SectionHeading>
            </Card>
            <div className="rounded-2xl p-6" style={{ background: color.surfaceInk }}>
              <SectionHeading
                eyebrow="Projects"
                tone="ink"
                description="Explore the case studies and strategic thinking behind each key decision."
              >
                Selected work.
              </SectionHeading>
            </div>
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          description="Two treatments: the animated-gradient primary CTA, and the outlined secondary pill. Tab to either to see the focus-visible ring; both already support hover, focus-visible, active and disabled."
        >
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-2xl p-8" style={{ background: color.surfaceInk }}>
              <p className="text-sm font-semibold" style={{ color: color.textOnInkMuted }}>
                Primary — on ink surfaces
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button type="button">Send</Button>
                <Button type="button" disabled>
                  Sending…
                </Button>
              </div>
            </div>
            <Card title="Secondary — outlined pill">
              <div className="flex flex-wrap items-center gap-4">
                <Button as="button" type="button" variant="secondary">
                  ← Previous
                </Button>
                <Button as="button" type="button" variant="secondary" disabled>
                  Next →
                </Button>
              </div>
            </Card>
          </div>
        </Section>

        <Section id="pills" title="Pills & tags" description="One shape, reused everywhere a short label needs a colour: hero tags, project tags, chapter tags, status pills.">
          <div className="flex flex-wrap items-center gap-3">
            {["0-to-1", "Systems Thinking", "B2B2C", "SaaS"].map((label, i) => (
              <Pill key={label} bg={pillPalette[i]} color={color.textPrimary} className="text-sm font-medium">
                {label}
              </Pill>
            ))}
            <Pill bg={pillPalette[2]} color={color.textPrimary} shadow={false} className="text-sm font-medium">
              shadow=false
            </Pill>
            <Pill
              bg={pillPalette[2]}
              color={color.textPrimary}
              className="text-sm font-semibold uppercase tracking-wide"
            >
              Composed caption
            </Pill>
          </div>
        </Section>

        <Section id="cards" title="Cards" description="GradientFrame is the one decorative wrapper component — a 1px animated-gradient stroke around any radius. Project and testimonial cards build on plain rounded-3xl + tag-shadow instead, since their content (mesh blobs, custom layout) is too specific to share a wrapper.">
          <div className="grid gap-6 sm:grid-cols-2">
            <GradientFrame radius="28px" padding="1px">
              <div className="tag-shadow rounded-[27px] p-6" style={{ background: color.surface }}>
                <p className="text-sm font-medium uppercase tracking-wide" style={{ color: color.textMuted }}>
                  Chapter 01
                </p>
                <p className="font-georgia mt-2 text-xl font-bold" style={{ color: color.textPrimary }}>
                  Foundation in form & craft.
                </p>
                <div className="mt-4 flex gap-2">
                  <Pill bg={pillPalette[0]} color={color.textPrimary} className="text-xs font-medium">
                    Fine arts
                  </Pill>
                  <Pill bg={pillPalette[1]} color={color.textPrimary} className="text-xs font-medium">
                    Sculpture
                  </Pill>
                </div>
              </div>
            </GradientFrame>

            <div
              className="relative overflow-hidden rounded-3xl p-6"
              style={{ background: color.surfaceInk, minHeight: 180 }}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="mesh-blob-card mesh-teal" style={{ top: "-20%", left: "-10%", width: 220, height: 220, opacity: 0.5 }} />
              </div>
              <Pill bg={pillPalette[0]} color={color.textPrimary} className="absolute right-6 top-6 text-xs font-medium">
                0-to-1
              </Pill>
              <p className="font-georgia relative mt-16 text-xl font-bold" style={{ color: color.textOnInk }}>
                02. Project Name
              </p>
              <p className="relative mt-2 text-sm" style={{ color: color.textOnInkMuted }}>
                The project-card treatment — mesh blob + Pill tag on rounded-3xl.
              </p>
            </div>
          </div>
        </Section>

        <Section id="forms" title="Form controls" description="The underline field used across Contact's five inputs — one label, one bottom border that brightens on focus." tone="ink">
          <div className="max-w-xl space-y-8">
            <FormField id="ds-name" label="Name*" name="name" type="text" required />
            <FormField id="ds-message" label="Message*" as="textarea" name="message" rows={3} required />
          </div>
        </Section>

        <Section
          id="navigation"
          title="Navigation & pagination"
          description="The real Nav component, contained in this box instead of pinned to the viewport (a CSS transform on the wrapper below gives fixed-position descendants a local containing block — see the source for details). Try resizing the window to see it switch from the desktop pill to the mobile tab bar."
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{ height: 160, background: color.surface, border: `1px solid ${color.borderSubtle}`, transform: "translateZ(0)" }}
          >
            <Nav />
          </div>

          <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide" style={{ color: color.textMuted }}>
            Slide counter
          </h3>
          <p className="mt-2 text-sm" style={{ color: color.textMuted }}>
            The "01 / 05" swipe-progress readout shared by the project and career-chapter carousels.
          </p>
          <div className="mt-4">
            <SlideCounter current={2} total={5} />
          </div>
        </Section>

        <Section id="accessibility" title="Accessibility notes" description="What's already in place, checked while building this system.">
          <ul className="max-w-[70ch] list-disc space-y-3 pl-5 text-[17px] leading-relaxed" style={{ color: color.textMuted }}>
            <li>
              Every text/background pair in active use clears WCAG AA (checked down to 4.5:1 for
              body text, higher everywhere else) — see the contrast figures in DESIGN_SYSTEM.md.
            </li>
            <li>
              Keyboard focus is always visible: brand-coloured rings on every interactive
              element via <code>.focus-ring-brand</code> / <code>.focus-ring-pill</code>, not the
              inconsistent browser default.
            </li>
            <li>
              Every CSS animation on the site — gradient drift, mesh orbit/sway/float, text
              shimmer, the accordion reveal — has a <code>prefers-reduced-motion</code> override.
              Framer Motion's transform animations (the MA badge, the cursor-follow pill) are
              covered globally via <code>&lt;MotionConfig reducedMotion="user"&gt;</code>.
            </li>
            <li>
              Purely decorative elements (mesh-blob backgrounds, icon glyphs next to labelled
              text) carry <code>aria-hidden="true"</code> so assistive tech skips them.
            </li>
            <li>
              Interactive targets meet the 24×24px minimum; the mobile nav's tab bar and the
              Send button exceed it at 44–52px.
            </li>
          </ul>
        </Section>
      </main>

      <footer className="section-pad" style={{ background: color.surface, borderTop: `1px solid ${color.borderSubtle}` }}>
        <div className="content-container text-sm" style={{ color: color.textMuted }}>
          <p>
            Design system reference for{" "}
            <a href="./" className="underline" style={{ color: color.textPrimary }}>
              marva.design
            </a>
            . Not linked from the public site — see <code>DESIGN_SYSTEM.md</code> in the
            repository for the full write-up.
          </p>
        </div>
      </footer>
    </div>
  );
}
