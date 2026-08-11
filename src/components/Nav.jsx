import GradientFrame from "./GradientFrame";

// Resume is a standalone static page under public/, not a section of this
// SPA, so it gets a real path instead of a hash. BASE_URL carries Vite's
// configured base ("/Portfolio/" in this repo, "/" if that ever changes),
// and always ends in a slash — so this resolves correctly both on the dev
// server and on GitHub Pages without hardcoding the repo name here.
const links = [
  { label: "Projects", href: "#projects" },
  { label: "Expertise", href: "#expertise" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
  { label: "Resume", href: `${import.meta.env.BASE_URL}resume/` },
];

export default function Nav() {
  // Mobile: spans the full width between the same 24px margins the MA badge
  // sits on, so the two corners line up, with the tabs distributed evenly
  // across the bar. Desktop keeps the centred, content-width pill.
  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 md:bottom-12 md:left-1/2 md:right-auto md:max-w-[94vw] md:-translate-x-1/2">
      <GradientFrame className="tag-shadow" padding="1px" radius="9999px">
        <nav className="flex items-center justify-between px-1.5 py-1.5 md:justify-start md:gap-1 md:px-2 md:py-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="btn-shine btn-shine-brand relative flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-[#1c1833] transition hover:bg-black/5 active:bg-black/10 sm:px-4 sm:text-sm md:min-h-0 md:px-5 md:py-2.5 md:text-[15px]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </GradientFrame>
    </div>
  );
}
