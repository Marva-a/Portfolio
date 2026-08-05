const MUTED_LIGHT = "#FFF7E8";
const TITLE_LIGHT = "#FFFDF7";

const fields = [
  { label: "Name*", name: "name", type: "text" },
  { label: "Organization*", name: "organization", type: "text" },
  { label: "Email*", name: "email", type: "email" },
  { label: "Role*", name: "role", type: "text" },
];

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5L12 13L20.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.7" cy="8" r="1.15" fill="currentColor" />
      <path d="M7.7 11V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11.5 17V13.3C11.5 11.9 12.3 11 13.6 11C14.9 11 15.6 11.9 15.6 13.3V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Contact() {
  return (
    <section
      className="relative overflow-clip bg-[#24174A] px-6 pb-[120px] pt-[260px] text-white md:px-24"
      style={{
        // Contact is the last section, so the page can only scroll until its
        // bottom meets the viewport bottom. For a nav click to put CONTACT at
        // the MA badge's 40px line, the section must be tall enough that the
        // browser can scroll (pt - 40) past a full viewport. Any shorter and
        // the scroll runs out early and CONTACT lands low.
        minHeight: "calc(100vh + 220px)", // 220px = pt(260) - badge offset(40)
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
      <div
        className="mesh-orbit pointer-events-none absolute inset-x-0 z-0"
        style={{ top: -260, bottom: -120 }}
      >
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
          className="scroll-mt-8 text-[14px] font-medium uppercase tracking-[0.2em] md:scroll-mt-10"
          style={{ color: MUTED_LIGHT }}
        >
          Contact
        </p>

        <div className="mt-3 grid gap-12 md:grid-cols-2">
          <div>
            <h2
              className="font-georgia text-[64px] font-bold"
              style={{ color: TITLE_LIGHT }}
            >
              Let's{" "}
              <span className="text-gradient-brand italic">connect.</span>
            </h2>

            <div className="mt-6 space-y-4 text-[20px] leading-relaxed" style={{ color: MUTED_LIGHT, maxWidth: 420 }}>
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

            <div className="mt-16 space-y-4">
              <a
                href="mailto:marva.abouei@gmail.com"
                className="flex items-center gap-3 text-[18px] underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                style={{ color: TITLE_LIGHT }}
              >
                <MailIcon className="h-5 w-5 shrink-0" />
                marva.abouei@gmail.com
              </a>
              <a
                href="https://www.linkedin.com/in/marva-abouei/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-[18px] underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                style={{ color: TITLE_LIGHT }}
              >
                <LinkedInIcon className="h-5 w-5 shrink-0" />
                www.linkedin.com/in/marva-abouei/
              </a>
            </div>
          </div>

          <form
            className="space-y-8 text-left"
            // Optical alignment: puts the first field label's cap line on the
            // same line as the "Looking to tackle…" paragraph opposite it.
            // Measured from glyph ink tops, not box edges, since the two have
            // very different half-leading above their glyphs.
            style={{ marginTop: 121 }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name}>
                  <label
                    className="text-[18px]"
                    style={{ color: TITLE_LIGHT }}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    className="mt-3 w-full border-0 border-b bg-transparent pb-2 text-[16px] outline-none transition"
                    style={{ borderColor: "rgba(255,253,247,0.3)", color: TITLE_LIGHT }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,253,247,0.8)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,253,247,0.3)")}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-[18px]" style={{ color: TITLE_LIGHT }}>
                Message*
              </label>
              <textarea
                name="message"
                rows={3}
                className="mt-3 w-full resize-none border-0 border-b bg-transparent pb-2 text-[16px] outline-none transition"
                style={{ borderColor: "rgba(255,253,247,0.3)", color: TITLE_LIGHT }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,253,247,0.8)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,253,247,0.3)")}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="gradient-border-anim rounded-full px-8 py-3 text-sm font-semibold text-[#0b0a14]"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </section>
  );
}
