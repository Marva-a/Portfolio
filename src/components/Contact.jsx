import { useState } from "react";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import { color } from "../styles/tokens";

const MUTED_LIGHT = color.textOnInkMuted;
const TITLE_LIGHT = color.textOnInk;

// Web3Forms access key. Safe to ship in client code — it only permits
// submitting *to this form*, it can't read past submissions or send mail
// anywhere else.
const WEB3FORMS_ACCESS_KEY = "8a2aa822-a9be-4f0c-9512-64d2964e6419";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

// Name and email are the only gates — the rest are asked for but not
// required, since a mandatory field is a reason to close the tab. Role is
// labelled "Your role" rather than the bare "Role" it used to be: on a
// designer's contact form that read as ambiguously as "which role are you
// hiring for?". `autoComplete` lets the browser fill all four in one tap.
const fields = [
  {
    label: "Name*",
    name: "name",
    type: "text",
    required: true,
    autoComplete: "name",
  },
  {
    label: "Email*",
    name: "email",
    type: "email",
    required: true,
    autoComplete: "email",
  },
  {
    label: "Organization (optional)",
    name: "organization",
    type: "text",
    required: false,
    autoComplete: "organization",
  },
  {
    label: "Your role (optional)",
    name: "role",
    type: "text",
    required: false,
    autoComplete: "organization-title",
  },
];

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 6.5L12 13L20.5 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The 🐾 emoji renders in a fixed dark brown, which all but disappears on
// this section's purple. Drawn instead so it picks up the footer's own
// color — and filled rather than stroked, since a 1.7 outline on shapes
// this small closes up into blobs.
function PawIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <ellipse cx="7" cy="8.5" rx="2.2" ry="2.9" />
      <ellipse cx="12" cy="6.6" rx="2.3" ry="3.1" />
      <ellipse cx="17" cy="8.5" rx="2.2" ry="2.9" />
      <path d="M12 12.4c2.6 0 5.4 2.2 5.4 4.6 0 1.7-1.3 2.7-3 2.7-1 0-1.7-.4-2.4-.4s-1.4.4-2.4.4c-1.7 0-3-1-3-2.7 0-2.4 2.8-4.6 5.4-4.6Z" />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="7.7" cy="8" r="1.15" fill="currentColor" />
      <path d="M7.7 11V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11.5 17V13.3C11.5 11.9 12.3 11 13.6 11C14.9 11 15.6 11.9 15.6 13.3V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Contact() {
  // "idle" | "sending" | "sent" | "error"
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    setStatus("sending");

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json();

      // Web3Forms returns 200 with { success: false } for a bad key, so the
      // body has to be checked too — res.ok alone would report a false win.
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Submission failed");
      }

      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      className="relative overflow-clip bg-[var(--color-surface-ink)] px-6 pb-28 pt-24 text-white md:min-h-[var(--contact-min-h)] md:px-24 md:pb-[120px] md:pt-[260px]"
      style={{
        // Contact is the last section, so the page can only scroll until its
        // bottom meets the viewport bottom. For a nav click to put CONTACT at
        // the MA badge's 40px line, the section must be tall enough that the
        // browser can scroll (pt - 40) past a full viewport. Any shorter and
        // the scroll runs out early and CONTACT lands low.
        // md and up only; on mobile the extra height is pure dead space and
        // the section is short enough that the nav still scrolls to it fine.
        "--contact-min-h": "calc(100vh + 220px)",
      }}
    >
      {/* Wrapper is the section's natural content height, so the mesh below
          stays anchored to the content instead of drifting down into the
          min-height filler on tall screens. */}
      <div className="relative">
      {/* Same mesh-blob mechanism as the hero — orbiting slowly clockwise —
          just resized to fit this section's proportions. Negative insets pull
          it back over the section's padding. The blobs overflow and get
          clipped at the page's end, which is fine. */}
      {/* Negative insets mirror the section's padding so the mesh covers it —
          they have to track the responsive padding, not the desktop value. */}
      <div aria-hidden="true" className="mesh-orbit pointer-events-none absolute inset-x-0 -top-24 -bottom-28 z-0 md:-top-[260px] md:-bottom-[120px]">
        <div
          className="mesh-blob mesh-coral"
          style={{
            top: "50%",
            left: "50%",
            width: 600,
            height: 600,
            transform: "translate(calc(-50% - 440px), calc(-50% - 230px))",
          }}
        />
        <div
          className="mesh-blob mesh-purple"
          style={{
            top: "50%",
            left: "50%",
            width: 780,
            height: 780,
            transform: "translate(calc(-50% + 440px), calc(-50% - 230px))",
          }}
        />
        <div
          className="mesh-blob mesh-teal"
          style={{
            top: "50%",
            left: "50%",
            width: 580,
            height: 580,
            transform: "translate(-50%, calc(-50% + 400px))",
          }}
        />
      </div>

      <div className="content-container relative z-10">
        <p
          id="contact"
          className="type-eyebrow scroll-mt-8 md:scroll-mt-10"
          style={{ color: MUTED_LIGHT }}
        >
          Contact
        </p>

        <div className="mt-3 grid gap-10 md:gap-12 xl:grid-cols-2">
          <div className="xl:col-start-1 xl:row-start-1">
            <h2
              className="font-georgia fluid-section-title font-bold"
              style={{ color: TITLE_LIGHT }}
            >
              Let's{" "}
              <span className="text-gradient-brand italic">connect.</span>
            </h2>

            {/* The 420px measure is a desktop rule, where this column sits
                beside the form. Below xl the two stack, so the copy runs the
                same width as the fields under it rather than stopping short
                of them. */}
            <div className="type-body mt-6 max-w-full space-y-4 xl:max-w-[420px]" style={{ color: MUTED_LIGHT }}>
              <p>
                Looking to tackle your complex product and 0-to-1 design
                challenges?
              </p>
              <p>Feel free to contact me!</p>
              <p>
                I'm open to new opportunities, full-time roles, and advisory
                positions.
              </p>
              {/* Sets the expectation before the form rather than after
                  sending, where it can't affect the decision to write. */}
              <p>I usually respond within two business days.</p>
            </div>
          </div>

          <form
            className="space-y-8 text-left xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:[--form-mt:121px]"
            // Optical alignment: puts the first field label's cap line on the
            // same line as the "Looking to tackle…" paragraph opposite it.
            // Measured from glyph ink tops, not box edges, since the two have
            // very different half-leading above their glyphs.
            style={{ marginTop: "var(--form-mt, 0px)" }}
            onSubmit={handleSubmit}
          >
            {/* Web3Forms control fields — not user-facing */}
            <input
              type="hidden"
              name="access_key"
              value={WEB3FORMS_ACCESS_KEY}
            />
            <input
              type="hidden"
              name="subject"
              value="New message from marva.design"
            />
            {/* Honeypot: invisible to people, irresistible to bots. Web3Forms
                silently drops any submission where this comes back filled. */}
            <input
              type="checkbox"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 gap-x-10 gap-y-8 xl:grid-cols-2">
              {fields.map((field) => (
                <FormField
                  key={field.name}
                  id={`contact-${field.name}`}
                  label={field.label}
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  autoComplete={field.autoComplete}
                />
              ))}
            </div>

            <FormField
              as="textarea"
              id="contact-message"
              label="Message*"
              name="message"
              rows={3}
              required
            />

            <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-5">
              {/* aria-live so screen readers announce the outcome, which is
                  otherwise only conveyed visually */}
              <p
                aria-live="polite"
                className="text-sm"
                style={{
                  color: status === "error" ? color.statusError : MUTED_LIGHT,
                  opacity: status === "idle" || status === "sending" ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                {status === "sent" && "Thanks — I’ll be in touch soon."}
                {status === "error" &&
                  "Something went wrong. Please email me directly."}
              </p>

              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send"}
              </Button>
            </div>
          </form>

          {/* Links are their own grid item, after the form in DOM order, so the
              stacked mobile order is intro → form → contact links. On md they
              go back under the intro text in column 1; the form spans both rows
              so row 1 stays sized to the text, not to the much taller form. */}
          {/* Mobile shows the two marks alone, so they sit side by side and
              centered — stacked, a pair of lone icons reads as a broken
              list, and left-aligned they float in the empty band instead of
              joining the sign-off below. mt-16 pulls them down toward the
              copyright so the icons and the two footer lines close the page
              as one block. From md the addresses come back and it returns to
              a left-aligned stacked list. */}
          <div className="mt-16 flex justify-center gap-3 md:mt-4 md:block md:space-y-4 xl:col-start-1 xl:row-start-2">
            <a
              href="mailto:marva.abouei@gmail.com"
              // The label is on the anchor because the visible text is gone at
              // this width — without it the link would announce as "link".
              aria-label="Email marva.abouei@gmail.com"
              className="flex min-h-[44px] w-11 items-center justify-center gap-3 break-all text-[16px] transition md:w-auto md:justify-start md:break-normal md:text-[18px] md:underline md:decoration-white/40 md:underline-offset-4 md:hover:decoration-white"
              style={{ color: TITLE_LIGHT }}
            >
              <MailIcon className="h-6 w-6 shrink-0 md:h-5 md:w-5" />
              <span className="hidden md:inline">marva.abouei@gmail.com</span>
            </a>
            <a
              href="https://www.linkedin.com/in/marva-abouei/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
              className="flex min-h-[44px] w-11 items-center justify-center gap-3 break-all text-[16px] transition md:w-auto md:justify-start md:break-normal md:text-[18px] md:underline md:decoration-white/40 md:underline-offset-4 md:hover:decoration-white"
              style={{ color: TITLE_LIGHT }}
            >
              <LinkedInIcon className="h-6 w-6 shrink-0 md:h-5 md:w-5" />
              <span className="hidden md:inline">
                www.linkedin.com/in/marva-abouei/
              </span>
            </a>
          </div>
        </div>

        {/* Sits inside Contact rather than in a section of its own: the page
            ends here, and a separate band would need its own background and
            would break the mesh that runs to the bottom edge. */}
        {/* Two stacked, centered lines on mobile; one line from md, with the
            copyright pinned left and the credit right — justify-between
            rather than a grid so the two halves keep their own natural
            widths and the credit's paw stays glued to its text. */}
        {/* role="contentinfo" because a <footer> nested inside a <section>
            is not a landmark by default — it would announce as the section's
            footer rather than the page's. The element stays here (a separate
            band would break the mesh); only the exposed role changes. */}
        <footer
          role="contentinfo"
          className="mt-6 flex flex-col items-center gap-1 text-center text-[14px] leading-relaxed md:mt-28 md:flex-row md:justify-between md:text-left"
          style={{ color: MUTED_LIGHT }}
        >
          <span>© 2026 Marva Abouei</span>
          {/* The paw is inline, not a flex child: on mobile this line wraps,
              and as a flex row the icon would break away from the text and
              park itself at the right edge of the block. */}
          <span>
            Designed and built by me · Quality-checked by Pepper
            <PawIcon className="ml-1.5 inline-block h-3.5 w-3.5 align-[-2px]" />
          </span>
        </footer>
      </div>
      </div>
    </section>
  );
}
