import { useEffect, useState } from "react";
import GradientFrame from "./GradientFrame";
import useMediaQuery, { MOBILE_QUERY } from "../hooks/useMediaQuery";
import useScrollDirection from "../hooks/useScrollDirection";

// Shared geometry so every icon lines up on the same optical size and
// stroke weight as the ones in Contact.
function Icon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[22px] w-[22px] shrink-0"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const ICONS = {
  // Lucide's "layers-3" — stacked planes read as bodies of work and case
  // studies, which a grid of squares doesn't.
  projects: (
    <Icon>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
      <path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
    </Icon>
  ),
  // Tabler's "diamond" — a cut stone with a flat crown and a single facet
  // tick, rather than a plain rhombus or Lucide's busier full facet map.
  expertise: (
    <Icon>
      <path d="M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5" />
      <path d="M10 12l-2 -2.2l.6 -1" />
    </Icon>
  ),
  about: (
    <Icon>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c.7-3.4 3.6-5.6 7.2-5.6s6.5 2.2 7.2 5.6" />
    </Icon>
  ),
  contact: (
    <Icon>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2.5" />
      <path d="M3.8 6.5L12 13l8.2-6.5" />
    </Icon>
  ),
  resume: (
    <Icon>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5" />
      <path d="M8.8 13h6.4M8.8 16.5h4.4" />
    </Icon>
  ),
};

// Resume is a standalone static page under public/, not a section of this
// SPA, so it gets a real path instead of a hash. BASE_URL carries Vite's
// configured base ("/" in this repo, since the site is served from the
// custom domain root — see vite.config.js) and always ends in a slash —
// so this resolves correctly both on the dev server and in production
// without hardcoding a path here.
const links = [
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "expertise", label: "Expertise", href: "#expertise" },
  { id: "about", label: "About", href: "#about" },
  { id: "contact", label: "Contact", href: "#contact" },
  { id: "resume", label: "Resume", href: `${import.meta.env.BASE_URL}resume/` },
];

// Only the in-page sections can light up; Resume lives on its own page.
const SECTION_IDS = links.filter((l) => l.href.startsWith("#")).map((l) => l.id);

export default function Nav() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  // Which tab reads as current. null through the hero, which is deliberate —
  // nothing in the bar corresponds to it, and lighting up "Projects" there
  // would misreport where the visitor is.
  const [active, setActive] = useState(null);
  // Reading forward shrinks the bar out of the way; scrolling back up
  // restores it. Desktop keeps the pill at full size at all times.
  const compact = useScrollDirection(isMobile) === "down";

  useEffect(() => {
    // Desktop keeps the plain pill, so there's no indicator to drive and no
    // reason to run a scroll listener there.
    if (!isMobile) return;

    // The anchor ids sit on the small eyebrow paragraphs ("PROJECTS",
    // "CONTACT"), not on the sections themselves — those are what the nav
    // links scroll to. Measuring the enclosing <section> instead gives the
    // full band of the page each tab represents.
    const elements = SECTION_IDS.map((id) => {
      const anchor = document.getElementById(id);
      return { id, el: anchor?.closest("section") ?? anchor };
    }).filter((s) => s.el);

    // Offsets are measured once and cached, so the scroll handler is pure
    // arithmetic — no getBoundingClientRect on every frame of a swipe.
    // getBoundingClientRect + scrollY rather than offsetTop: offsetTop is
    // relative to the nearest *positioned* ancestor, which would silently
    // skew if any wrapper ever gains `position: relative`.
    let tops = [];
    const remeasure = () => {
      tops = elements.map((s) => ({
        id: s.id,
        top: s.el.getBoundingClientRect().top + window.scrollY,
      }));
    };

    const pick = () => {
      // A section counts as current once it has passed the middle of the
      // screen, so the highlight changes when a section actually takes over
      // the view rather than the instant its first pixel appears.
      const line = window.scrollY + window.innerHeight / 2;
      let current = null;
      for (const s of tops) {
        if (s.top <= line) current = s.id;
      }
      setActive(current);
    };

    const onResize = () => {
      remeasure();
      pick();
    };

    remeasure();
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", onResize);
    };
  }, [isMobile]);

  return (
    <div
      className="fixed bottom-6 left-6 right-6 z-50 md:bottom-12 md:left-1/2 md:right-auto md:max-w-[94vw] md:-translate-x-1/2"
      style={{
        // Scaled rather than re-laid-out: a transform can't reflow the tabs
        // or reflow the page, so the bar shrinks as one piece and the pill's
        // proportions and gradient stroke stay exactly as designed.
        // transform-origin at the bottom keeps it pinned to its own bottom
        // edge, so it appears to settle down rather than drift upward.
        transform: compact ? "scale(0.85)" : "scale(1)",
        transformOrigin: "bottom center",
        transition: "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Same frame as before — the cream pill and the drifting gradient
          stroke are the site's signature, so the mobile bar keeps both and
          only changes what sits inside it. */}
      <GradientFrame className="tag-shadow" padding="1px" radius="9999px">
        {isMobile ? (
          <nav className="flex items-stretch justify-between px-1 py-1">
            {links.map((link) => {
              const isActive = link.id === active;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  // Same shine + hover/press treatment the tabs have always
                  // had, and the selected tab uses the same black/10 tint
                  // the old bar used on press rather than a new colour.
                  //
                  // All of it stays in classes, never inline styles: an
                  // inline backgroundColor would outrank hover:bg-black/5
                  // and kill the hover on every unselected tab.
                  //
                  // flex-1 + basis-0 so all five tabs are exactly equal
                  // width regardless of label length, the way a native tab
                  // bar divides its space.
                  className={`btn-shine btn-shine-brand focus-ring-pill relative flex min-h-[52px] flex-1 basis-0 flex-col items-center justify-center gap-1 rounded-full px-0.5 transition hover:bg-black/5 active:bg-black/10 ${
                    isActive
                      ? "bg-black/10 text-[#1c1833]"
                      : "text-[#4d476a]"
                  }`}
                >
                  {ICONS[link.id]}
                  <span
                    className={`text-[10px] leading-none tracking-tight ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {link.label}
                  </span>
                </a>
              );
            })}
          </nav>
        ) : (
          <nav className="flex items-center justify-start gap-1 px-2 py-2">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="btn-shine btn-shine-brand focus-ring-pill relative flex items-center whitespace-nowrap rounded-full px-5 py-2.5 text-[15px] font-medium text-[#1c1833] transition hover:bg-black/5 active:bg-black/10"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </GradientFrame>
    </div>
  );
}
