import { useState } from "react";

const MUTED_LIGHT = "#FFF7E8";
const TITLE_LIGHT = "#FFFDF7";

// Web3Forms access key. Safe to ship in client code — it only permits
// submitting *to this form*, it can't read past submissions or send mail
// anywhere else.
const WEB3FORMS_ACCESS_KEY = "8a2aa822-a9be-4f0c-9512-64d2964e6419";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const fields = [
  { label: "Name*", name: "name", type: "text", required: true },
  { label: "Organization*", name: "organization", type: "text", required: true },
  { label: "Email*", name: "email", type: "email", required: true },
  { label: "Role*", name: "role", type: "text", required: true },
];

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 6.5L12 13L20.5 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
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
      className="relative overflow-clip bg-[#24174A] px-6 pb-28 pt-24 text-white md:min-h-[var(--contact-min-h)] md:px-24 md:pb-[120px] md:pt-[260px]"
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
      <div className="mesh-orbit pointer-events-none absolute inset-x-0 -top-24 -bottom-28 z-0 md:-top-[260px] md:-bottom-[120px]">
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

      <div className="relative z-10 mx-auto" style={{ maxWidth: 1232 }}>
        <p
          id="contact"
          className="scroll-mt-8 text-[12px] font-medium uppercase tracking-[0.15em] md:scroll-mt-10 md:text-[14px] md:tracking-[0.2em]"
          style={{ color: MUTED_LIGHT }}
        >
          Contact
        </p>

        <div className="mt-3 grid gap-10 md:gap-12 md:grid-cols-2">
          <div className="md:col-start-1 md:row-start-1">
            <h2
              className="font-georgia fluid-section-title font-bold"
              style={{ color: TITLE_LIGHT }}
            >
              Let's{" "}
              <span className="text-gradient-brand italic">connect.</span>
            </h2>

            <div className="mt-6 space-y-4 text-[17px] leading-relaxed md:text-[20px]" style={{ color: MUTED_LIGHT, maxWidth: 420 }}>
              <p>
                Looking to tackle your complex product and 0-to-1 design
                challenges?
              </p>
              <p>Feel free to contact me!</p>
              <p>
                I'm open to new opportunities, full-time roles, and advisory
                positions.
              </p>
            </div>
          </div>

          <form
            className="space-y-8 text-left md:col-start-2 md:row-start-1 md:row-span-2 md:[--form-mt:121px]"
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

            <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name}>
                  <label
                    className="text-[18px]"
                    style={{ color: TITLE_LIGHT }}
                    htmlFor={`contact-${field.name}`}
                  >
                    {field.label}
                  </label>
                  <input
                    id={`contact-${field.name}`}
                    type={field.type}
                    name={field.name}
                    required={field.required}
                    className="mt-3 w-full border-0 border-b bg-transparent pb-2 text-[16px] outline-none transition"
                    style={{ borderColor: "rgba(255,253,247,0.3)", color: TITLE_LIGHT }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,253,247,0.8)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,253,247,0.3)")}
                  />
                </div>
              ))}
            </div>

            <div>
              <label
                className="text-[18px]"
                style={{ color: TITLE_LIGHT }}
                htmlFor="contact-message"
              >
                Message*
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={3}
                required
                className="mt-3 w-full resize-none border-0 border-b bg-transparent pb-2 text-[16px] outline-none transition"
                style={{ borderColor: "rgba(255,253,247,0.3)", color: TITLE_LIGHT }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,253,247,0.8)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,253,247,0.3)")}
              />
            </div>

            <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end sm:gap-5">
              {/* aria-live so screen readers announce the outcome, which is
                  otherwise only conveyed visually */}
              <p
                aria-live="polite"
                className="text-sm"
                style={{
                  color: status === "error" ? "#FFB4A8" : MUTED_LIGHT,
                  opacity: status === "idle" || status === "sending" ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                {status === "sent" && "Thanks — I’ll be in touch soon."}
                {status === "error" &&
                  "Something went wrong. Please email me directly."}
              </p>

              <button
                type="submit"
                disabled={status === "sending"}
                className="gradient-border-anim btn-shine relative min-h-[48px] rounded-full px-8 py-3 text-sm font-semibold text-[#0b0a14] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(10,6,26,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#24174A] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {status === "sending" ? "Sending…" : "Send"}
              </button>
            </div>
          </form>

          {/* Links are their own grid item, after the form in DOM order, so the
              stacked mobile order is intro → form → contact links. On md they
              go back under the intro text in column 1; the form spans both rows
              so row 1 stays sized to the text, not to the much taller form. */}
          <div className="space-y-4 md:col-start-1 md:row-start-2 md:mt-4">
            <a
              href="mailto:marva.abouei@gmail.com"
              className="flex min-h-[44px] items-center gap-3 break-all text-[16px] underline decoration-white/40 underline-offset-4 transition hover:decoration-white md:break-normal md:text-[18px]"
              style={{ color: TITLE_LIGHT }}
            >
              <MailIcon className="h-5 w-5 shrink-0" />
              marva.abouei@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/marva-abouei/"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[44px] items-center gap-3 break-all text-[16px] underline decoration-white/40 underline-offset-4 transition hover:decoration-white md:break-normal md:text-[18px]"
              style={{ color: TITLE_LIGHT }}
            >
              <LinkedInIcon className="h-5 w-5 shrink-0" />
              www.linkedin.com/in/marva-abouei/
            </a>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
