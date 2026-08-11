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
  return (
    <div className="fixed bottom-6 left-1/2 z-50 max-w-[94vw] -translate-x-1/2 md:bottom-12">
      <GradientFrame className="tag-shadow" padding="1px" radius="9999px">
        <nav className="flex items-center gap-0.5 overflow-x-auto px-1.5 py-1.5 sm:gap-1 md:px-2 md:py-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="btn-shine btn-shine-brand relative whitespace-nowrap rounded-full px-2 py-2 text-[12px] font-medium text-[#1c1833] transition hover:bg-black/5 sm:px-4 sm:text-sm md:px-5 md:py-2.5 md:text-[15px]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </GradientFrame>
    </div>
  );
}
